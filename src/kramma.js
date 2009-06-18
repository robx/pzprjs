//
// パズル固有スクリプト部 快刀乱麻版 kramma.js v3.1.9p1
//

function setting(){
	// グローバル変数の初期設定
	if(!k.qcols){ k.qcols = 8;}	// 盤面の横幅
	if(!k.qrows){ k.qrows = 8;}	// 盤面の縦幅
	k.irowake = 0;			// 0:色分け設定無し 1:色分けしない 2:色分けする

	k.iscross      = 1;		// 1:Crossが操作可能なパズル
	k.isborder     = 1;		// 1:Border/Lineが操作可能なパズル
	k.isextendcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

	k.isoutsidecross  = 0;	// 1:外枠上にCrossの配置があるパズル
	k.isoutsideborder = 0;	// 1:盤面の外枠上にborderのIDを用意する
	k.isborderCross   = 0;	// 1:線が交差するパズル
	k.isCenterLine    = 0;	// 1:マスの真ん中を通る線を回答として入力するパズル
	k.isborderAsLine  = 0;	// 1:境界線をlineとして扱う

	k.dispzero      = 0;	// 1:0を表示するかどうか
	k.isDispHatena  = 1;	// 1:qnumが-2のときに？を表示する
	k.isAnsNumber   = 0;	// 1:回答に数字を入力するパズル
	k.isArrowNumber = 0;	// 1:矢印つき数字を入力するパズル
	k.isOneNumber   = 0;	// 1:部屋の問題の数字が1つだけ入るパズル
	k.isDispNumUL   = 0;	// 1:数字をマス目の左上に表示するパズル(0はマスの中央)
	k.NumberWithMB  = 0;	// 1:回答の数字と○×が入るパズル

	k.BlackCell     = 0;	// 1:黒マスを入力するパズル
	k.NumberIsWhite = 0;	// 1:数字のあるマスが黒マスにならないパズル
	k.RBBlackCell   = 0;	// 1:連黒分断禁のパズル

	k.ispzprv3ONLY  = 1;	// 1:ぱずぷれv3にしかないパズル
	k.isKanpenExist = 0;	// 1:pencilbox/カンペンにあるパズル

	k.fstruct = ["cellques41_42","crossnum","borderans"];

	//k.def_csize = 36;
	//k.def_psize = 24;
}

//-------------------------------------------------------------
// Puzzle個別クラスの定義
Puzzle = function(){
	this.prefix();
};
Puzzle.prototype = {
	prefix : function(){
		this.input_init();
		this.graphic_init();

		base.setTitle("快刀乱麻","KaitoRamma");
		base.setExpression("　左ドラッグで境界線が、右ドラッグで補助記号が入力できます。",
						   " Left Button Drag to input border lines, Right to input auxiliary marks.");
		base.setFloatbgcolor("rgb(96, 96, 96)");
	},
	menufix : function(){ },
	postfix : function(){ },

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(x,y){
			if(k.mode==1) this.inputcrossMark(x,y);
			else if(k.mode==3){
				if(this.btn.Left) this.inputborderans(x,y);
				else if(this.btn.Right) this.inputQsubLine(x,y);
			}
		};
		mv.mouseup = function(x,y){
			if(this.notInputted()){
				if(k.mode==1) this.inputQues(x,y,[0,41,42,-2]);
			}
		};
		mv.mousemove = function(x,y){
			if(k.mode==3){
				if(this.btn.Left) this.inputborderans(x,y);
				else if(this.btn.Right) this.inputQsubLine(x,y);
			}
		};
		// オーバーライド
		mv.inputBD = function(x,y,flag){
			var pos = this.crosspos(new Pos(x,y), 0.35);
			if(pos.x==this.mouseCell.x && pos.y==this.mouseCell.y){ return;}

			var id = bd.getbnum(pos.x, pos.y);
			if(id==-1 && this.mouseCell.x){ id = bd.getbnum(this.mouseCell.x, this.mouseCell.y);}

			if(this.mouseCell!=-1 && id!=-1){
				if((pos.x%2==0 && this.mouseCell.x==pos.x && Math.abs(this.mouseCell.y-pos.y)==1) ||
				   (pos.y%2==0 && this.mouseCell.y==pos.y && Math.abs(this.mouseCell.x-pos.x)==1) )
				{
					this.mouseCell=-1

					if(this.inputData==-1){
						if     (flag==0){ this.inputData=(bd.getQuesBorder(id)==0?1:0);}
						else if(flag==1){ this.inputData=(bd.getQansBorder(id)==0?1:0);}
					}

					var idlist = [id];

					var bx1, bx2, by1, by2;
					if(bd.border[id].cx%2==1){
						var x;
						x = bd.border[id].cx; while(x>=0        ){ if(bd.getQnumCross(bd.getxnum(int(x/2)  ,int(bd.border[id].cy/2)))==1){ x-=2; break;} x-=2;} bx1 = x+2;
						x = bd.border[id].cx; while(x<=2*k.qcols){ if(bd.getQnumCross(bd.getxnum(int(x/2)+1,int(bd.border[id].cy/2)))==1){ x+=2; break;} x+=2;} bx2 = x-2;
						by1 = by2 = bd.border[id].cy;
					}
					else if(bd.border[id].cy%2==1){
						var y;
						y = bd.border[id].cy; while(y>=0        ){ if(bd.getQnumCross(bd.getxnum(int(bd.border[id].cx/2),int(y/2)  ))==1){ y-=2; break;} y-=2;} by1 = y+2;
						y = bd.border[id].cy; while(y<=2*k.qrows){ if(bd.getQnumCross(bd.getxnum(int(bd.border[id].cx/2),int(y/2)+1))==1){ y+=2; break;} y+=2;} by2 = y-2;
						bx1 = bx2 = bd.border[id].cx;
					}
					idlist = [];
					for(var i=bx1;i<=bx2;i+=2){ for(var j=by1;j<=by2;j+=2){ idlist.push(bd.getbnum(i,j)); } }

					for(var i=0;i<idlist.length;i++){
						if(flag==0){
							if(this.inputData!=-1){ bd.setQuesBorder(idlist[i], this.inputData); bd.setQansBorder(idlist[i], 0);}
						}
						else if(flag==1 && bd.getQuesBorder(id)==0){
							if     (this.inputData==1){ bd.setQansBorder(idlist[i], 1); if(k.isborderAsLine){ bd.setQsubBorder(idlist[i], 0);} }
							else if(this.inputData==0){ bd.setQansBorder(idlist[i], 0);}
						}
						else{ return;}
						pc.paintBorder(idlist[i]);
					}
				}
			}
			this.mouseCell = pos;
		};

		// キーボード入力系
		kc.keyinput = function(ca){ };
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.BDlinecolor = "rgb(160, 160, 160)";

		pc.BorderQanscolor = "rgb(64, 64, 255)";
		pc.crosssize = 0.15;

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);
		//	this.flushCanvasAll();

			this.drawErrorCells(x1,y1,x2,y2);

			this.drawBDline2(x1,y1,x2,y2);
			this.drawBorders(x1,y1,x2,y2);

			this.drawQueses41_42(x1,y1,x2,y2);
			this.drawCrossMarks(x1,y1,x2+1,y2+1);

			this.drawNumbers(x1,y1,x2,y2);

			this.drawBorderQsubs(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	pzlinput : function(type, bstr){
		if(type==0 || type==1){
			bstr = enc.decodeCrossMark(bstr);
			bstr = this.decodeCircle(bstr);
		}
	},
	pzloutput : function(type){
		if(type==0)     { document.urloutput.ta.value = enc.getURLbase()+"?"+k.puzzleid+this.pzldata();}
		else if(type==1){ document.urloutput.ta.value = enc.getDocbase()+k.puzzleid+"/sa/m.html?c"+this.pzldata();}
		else if(type==3){ document.urloutput.ta.value = enc.getURLbase()+"?m+"+k.puzzleid+this.pzldata();}
	},
	pzldata : function(){
		return "/"+k.qcols+"/"+k.qrows+"/"+enc.encodeCrossMark()+this.encodeCircle();
	},

	decodeCircle : function(bstr){
		var i, w;
		var pos;

		if(bstr){ pos = Math.min(int((k.qcols*k.qrows+2)/3), bstr.length);}
		else{ pos = 0;}

		for(i=0;i<pos;i++){
			var ca = parseInt(bstr.charAt(i),27);
			for(w=0;w<3;w++){
				if(i*3+w<k.qcols*k.qrows){
					if     (int(ca/Math.pow(3,2-w))%3==1){ bd.setQuesCell(i*3+w,41);}
					else if(int(ca/Math.pow(3,2-w))%3==2){ bd.setQuesCell(i*3+w,42);}
				}
			}
		}

		return bstr.substring(pos,bstr.length);
	},
	encodeCircle : function(){
		var i, j, num, pass;
		var cm = "";

		num = 0; pass = 0;
		for(i=0;i<bd.cell.length;i++){
			if     (bd.getQuesCell(i)==41){ pass+=(  Math.pow(3,2-num));}
			else if(bd.getQuesCell(i)==42){ pass+=(2*Math.pow(3,2-num));}
			num++; if(num==3){ cm += pass.toString(27); num=0; pass=0;}
		}
		if(num>0){ cm += pass.toString(27);}

		return cm;
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	check : function(){

		if( !ans.checkLcntCross(3,0) ){
			ans.setAlert('分岐している線があります。','There is a branched line.'); return false;
		}
		if( !ans.checkLcntCross(4,1) ){
			ans.setAlert('線が黒点上で交差しています。','There is a crossing line on the black point.'); return false;
		}
		if( !this.checkLcntCurve() ){
			ans.setAlert('線が黒点以外で曲がっています。','A line curves out of the black points.'); return false;
		}

		rarea = ans.searchRarea();
		if( !ans.checkNoObjectInRoom(rarea, function(c){ return (bd.getQuesCell(c)!=0?bd.getQuesCell(c):-1);}) ){
			ans.setAlert('白丸も黒丸も含まれない領域があります。','An area has no marks.'); return false;
		}

		if( !ans.checkSameObjectInRoom(rarea, function(c){ return (bd.getQuesCell(c)!=0?bd.getQuesCell(c):-1);}) ){
			ans.setAlert('白丸と黒丸が両方含まれる領域があります。','An area has both white and black circles.'); return false;
		}

		if( !ans.checkLcntCross(1,0) ){
			ans.setAlert('途中で途切れている線があります。','There is a dead-end line.'); return false;
		}
		if( !ans.checkLcntCross(0,1) ){
			ans.setAlert('黒点上を線が通過していません。','No lines on the black point.'); return false;
		}

		return true;
	},

	checkLcntCurve : function(){
		var i;
		for(i=0;i<(k.qcols-1)*(k.qrows-1);i++){
			var cx = i%(k.qcols-1)+1;
			var cy = int(i/(k.qcols-1))+1;
			if(bd.lcntCross(cx, cy)==2 && bd.getQnumCross(bd.getxnum(cx, cy))!=1){
				if(    !(bd.getQansBorder(bd.getbnum(cx*2  ,cy*2-1))==1 && bd.getQansBorder(bd.getbnum(cx*2  ,cy*2+1))==1)
					&& !(bd.getQansBorder(bd.getbnum(cx*2-1,cy*2  ))==1 && bd.getQansBorder(bd.getbnum(cx*2+1,cy*2  ))==1) )
				{
					ans.setCrossBorderError(cx,cy);
					return false;
				}
			}
		}
		return true;
	}
};
