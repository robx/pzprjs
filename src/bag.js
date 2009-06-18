//
// パズル固有スクリプト部 バッグ版 bag.js v3.1.9
//

function setting(){
	// グローバル変数の初期設定
	if(!k.qcols){ k.qcols = 10;}	// 盤面の横幅
	if(!k.qrows){ k.qrows = 10;}	// 盤面の縦幅
	k.irowake = 0;			// 0:色分け設定無し 1:色分けしない 2:色分けする

	k.iscross      = 0;		// 1:Crossが操作可能なパズル
	k.isborder     = 1;		// 1:Border/Lineが操作可能なパズル
	k.isextendcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

	k.isoutsidecross  = 1;	// 1:外枠上にCrossの配置があるパズル
	k.isoutsideborder = 1;	// 1:盤面の外枠上にborderのIDを用意する
	k.isborderCross   = 0;	// 1:線が交差するパズル
	k.isCenterLine    = 0;	// 1:マスの真ん中を通る線を回答として入力するパズル
	k.isborderAsLine  = 1;	// 1:境界線をlineとして扱う

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

	k.ispzprv3ONLY  = 0;	// 1:ぱずぷれv3にしかないパズル
	k.isKanpenExist = 0;	// 1:pencilbox/カンペンにあるパズル

	k.fstruct = ["cellqnum","cellqsub","borderans2"];

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

		base.setTitle("バッグ", "BAG");
		base.setExpression("　左ドラッグで線が、右クリックでセルの背景色(緑/黄色)が入力できます。",
						   " Left Button Drag to input lines, Right Click to input background color (lime or yellow) of the cell.");
		base.setFloatbgcolor("rgb(160, 0, 0)");
	},
	menufix : function(){ },
	postfix : function(){ },

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(x,y){
			if(k.mode==1){
				if(!kp.enabled()){ this.inputqnum(x,y,Math.min(99,k.qcols+k.qrows-1));}
				else{ kp.display(x,y);}
			}
			else if(k.mode==3){
				if(this.btn.Left) this.inputborderans(x,y);
				else if(this.btn.Right) this.inputBGcolor(x,y);
			}
		};
		mv.mouseup = function(x,y){ };
		mv.mousemove = function(x,y){
			if(k.mode==3){
				if(this.btn.Left) this.inputborderans(x,y);
				else if(this.btn.Right) this.inputBGcolor(x,y);
			}
		};
		mv.inputBGcolor = function(x,y){
			var cc = this.cellid(new Pos(x,y));
			if(cc==-1 || cc==this.mouseCell){ return;}
			if(this.inputData==-1){
				if     (bd.getQsubCell(cc)==0){ this.inputData=1;}
				else if(bd.getQsubCell(cc)==1){ this.inputData=2;}
				else                          { this.inputData=0;}
			}
			bd.setQsubCell(cc, this.inputData);

			this.mouseCell = cc; 

			pc.paint(bd.cell[cc].cx, bd.cell[cc].cy, bd.cell[cc].cx, bd.cell[cc].cy);
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(k.mode==3){ return;}
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum(ca,Math.min(99,k.qcols+k.qrows-1));
		};

		if(k.callmode == "pmake"){
			kp.generate(0, true, false, '');
			kp.kpinput = function(ca){
				kc.key_inputqnum(ca,Math.min(99,k.qcols+k.qrows-1));
			};
		}
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.BDlinecolor = "rgb(160, 160, 160)";
		if(k.br.IE){ pc.BDlinecolor = "rgb(191, 191, 191)";}

		pc.BorderQanscolor = "rgb(0, 160, 0)";
		pc.fontErrcolor = "red";

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);
		//	this.flushCanvasAll();

			this.drawQSubCells(x1,y1,x2,y2);

			this.drawBDline2(x1,y1,x2,y2);
			this.drawBorders(x1,y1,x2,y2);

			this.drawNumbers(x1,y1,x2,y2);

			if(k.mode==1){ this.drawTCell(x1,y1,x2+1,y2+1);}else{ this.hideTCell();}
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	pzlinput : function(type, bstr){
		if(type==0 || type==1){ bstr = enc.decodeNumber16(bstr);}
	},
	pzloutput : function(type){
		if(type==0)     { document.urloutput.ta.value = enc.getURLbase()+"?"+k.puzzleid+this.pzldata();}
		else if(type==1){ document.urloutput.ta.value = enc.getDocbase()+k.puzzleid+"/sa/m.html?c"+this.pzldata();}
		else if(type==3){ document.urloutput.ta.value = enc.getURLbase()+"?m+"+k.puzzleid+this.pzldata();}
	},
	pzldata : function(){
		return "/"+k.qcols+"/"+k.qrows+"/"+enc.encodeNumber16();
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	check : function(){

		if( !ans.checkLcntCross(3,0) ){
			ans.setAlert('分岐している線があります。', 'There is a branch line.'); return false;
		}
		if( !ans.checkLcntCross(4,0) ){
			ans.setAlert('線が交差しています。', 'There is a crossing line.'); return false;
		}
		if( !ans.checkLcntCross(1,0) ){
			ans.setAlert('途中で途切れている線があります。', 'There is a dead-end line.'); return false;
		}

		if( !ans.checkOneLoop() ){
			ans.setAlert('輪っかが一つではありません。','There are two or more loops.'); return false;
		}

		var iarea = this.generateIarea();
		if( !this.checkNumberInside(iarea) ){
			ans.setAlert('輪の内側に入っていない数字があります。','There is an outside number.'); return false;
		}
		if( !this.checkCellNumber(iarea) ){
			ans.setAlert('数字と輪の内側になる4方向のマスの合計が違います。','The number and the sum of the inside cells of four direction is different.'); return false;
		}

		return true;
	},

	generateIarea : function(){
		var area = new AreaInfo();
		var cx, cy;
		area.check[0]=(bd.lcntCross(0,0)==0?-1:1);
		for(cy=0;cy<k.qrows;cy++){
			if(cy>0){ area.check[bd.getcnum(0,cy)]=area.check[bd.getcnum(0,cy-1)]*(bd.getQansBorder(bd.getbnum(1,cy*2))==1?-1:1);}
			for(cx=1;cx<k.qcols;cx++){
				area.check[bd.getcnum(cx,cy)]=area.check[bd.getcnum(cx-1,cy)]*(bd.getQansBorder(bd.getbnum(cx*2,cy*2+1))==1?-1:1);
			}
		}
		return area;
	},
	checkNumberInside : function(area){
		for(var c=0;c<bd.cell.length;c++){
			if(area.check[c]==-1 && bd.getQnumCell(c)!=-1){
				bd.setErrorCell([c],1);
				return false;
			}
		}
		return true;
	},
	checkCellNumber : function(area){
		for(var cc=0;cc<bd.cell.length;cc++){
			if(bd.getQnumCell(cc)<0){ continue;}

			var list = new Array();
			list.push(cc);
			var cnt = 1;
			var tx, ty;
			tx = bd.cell[cc].cx-1; ty = bd.cell[cc].cy;
			while(tx>=0)     { var c=bd.getcnum(tx,ty); if(area.check[c]!=-1){ cnt++; list.push(c); tx--;} else{ break;} }
			tx = bd.cell[cc].cx+1; ty = bd.cell[cc].cy;
			while(tx<k.qcols){ var c=bd.getcnum(tx,ty); if(area.check[c]!=-1){ cnt++; list.push(c); tx++;} else{ break;} }
			tx = bd.cell[cc].cx; ty = bd.cell[cc].cy-1;
			while(ty>=0)     { var c=bd.getcnum(tx,ty); if(area.check[c]!=-1){ cnt++; list.push(c); ty--;} else{ break;} }
			tx = bd.cell[cc].cx; ty = bd.cell[cc].cy+1;
			while(ty<k.qrows){ var c=bd.getcnum(tx,ty); if(area.check[c]!=-1){ cnt++; list.push(c); ty++;} else{ break;} }

			if(bd.getQnumCell(cc)!=cnt){
				bd.setErrorCell(list,1);
				return false;
			}
		}
		return true;
	}
};
