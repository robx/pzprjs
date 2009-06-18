//
// パズル固有スクリプト部 クロシュート版 kurochute.js v3.1.9
//

function setting(){
	// グローバル変数の初期設定
	if(!k.qcols){ k.qcols = 8;}	// 盤面の横幅
	if(!k.qrows){ k.qrows = 8;}	// 盤面の縦幅
	k.irowake = 0;			// 0:色分け設定無し 1:色分けしない 2:色分けする

	k.iscross      = 0;		// 1:Crossが操作可能なパズル
	k.isborder     = 0;		// 1:Border/Lineが操作可能なパズル
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

	k.BlackCell     = 1;	// 1:黒マスを入力するパズル
	k.NumberIsWhite = 1;	// 1:数字のあるマスが黒マスにならないパズル
	k.RBBlackCell   = 1;	// 1:連黒分断禁のパズル

	k.ispzprv3ONLY  = 1;	// 1:ぱずぷれv3にしかないパズル
	k.isKanpenExist = 1;	// 1:pencilbox/カンペンにあるパズル

	k.fstruct = ["cellqnum", "cellqanssub"];

	//k.def_csize = 36;
	//k.def_psize = 16;
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

		base.setTitle("クロシュート","Kurochute");
		base.setExpression("　左クリックで黒マスが、右クリックで白マス確定マスが入力できます。",
						   " Left Click to input black cells, Right Click to input determined white cells.");
		base.setFloatbgcolor("rgb(96, 96, 96)");
	},
	menufix : function(){
		menu.addUseToFlags();
	},
	postfix : function(){ },

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(x,y){
			if(k.mode==1) this.inputqnum(x,y,Math.max(k.qcols,k.qrows)-1);
			else if(k.mode==3) this.inputcell(x,y);
		};
		mv.mouseup = function(x,y){
			if(k.mode==3 && this.notInputted()) this.inputqsub(x,y);
		};
		mv.mousemove = function(x,y){
			if(k.mode==3) this.inputcell(x,y);
		};
		mv.inputqsub = function(x,y){
			var cc = this.cellid(new Pos(x,y));
			if(cc==-1){ return;}

			if     (bd.getQsubCell(cc)==0){ bd.setQsubCell(cc,2);}
			else if(bd.getQsubCell(cc)==2){ bd.setQsubCell(cc,0);}
			pc.paintCell(cc);
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(k.mode==3){ return;}
			if(this.key_inputdirec(ca)){ return;}
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum(ca,Math.max(k.qcols,k.qrows)-1);
		};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.BDlinecolor = "rgb(127, 127, 127)";
		pc.qsubcolor1 = "white";
		pc.qsubcolor2 = "rgb(255, 255, 160)";
		pc.BCell_fontcolor = "rgb(96,96,96)";

		pc.paint = function(x1,y1,x2,y2){
			x2++; y2++;
			this.flushCanvas(x1,y1,x2,y2);
		//	this.flushCanvasAll();

			this.drawQSubCells(x1,y1,x2,y2);
			this.drawDots(x1,y1,x2,y2);
			this.drawBDline(x1,y1,x2,y2);
			this.drawBlackCells(x1,y1,x2,y2);

			this.drawNumbers(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);

			if(k.mode==1){ this.drawTCell(x1,y1,x2+1,y2+1);}else{ this.hideTCell();}
		};
		pc.drawDots = function(x1,y1,x2,y2){
			var dsize = k.cwidth*0.06;
			var clist = this.cellinside(x1,y1,x2,y2,function(c){ return (bd.getQansCell(c)!=1);});
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				if(bd.getQsubCell(c)==1){
					g.fillStyle = this.dotcolor;
					if(this.vnop("c"+c+"_dot_",1)){
						g.beginPath();
						g.arc(bd.cell[c].px()+k.cwidth/2, bd.cell[c].py()+k.cheight/2, dsize, 0, Math.PI*2, false);
						g.fill();
					}
				}
				else{ this.vhide("c"+c+"_dot_");}
			}
			this.vinc();
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	pzlinput : function(type, bstr){
		if(type==0 || type==1){ bstr = enc.decodeNumber16(bstr);}
		else if(type==2){ bstr = this.decodeKanpen(bstr);}
	},

	pzloutput : function(type){
		if(type==0)     { document.urloutput.ta.value = enc.getURLbase()+"?"+k.puzzleid+this.pzldata();}
		else if(type==1){ document.urloutput.ta.value = enc.getDocbase()+k.puzzleid+"/sa/m.html?c"+this.pzldata();}
		else if(type==2){ document.urloutput.ta.value = enc.kanpenbase()+"kurochute.html?problem="+this.pzldataKanpen();}
		else if(type==3){ document.urloutput.ta.value = enc.getURLbase()+"?m+"+k.puzzleid+this.pzldata();}
	},
	pzldata : function(){
		return "/"+k.qcols+"/"+k.qrows+"/"+enc.encodeNumber16();
	},

	//---------------------------------------------------------
	decodeKanpen : function(bstr){
		bstr = (bstr.split("_")).join(" ");
		fio.decodeCell( function(c,ca){
			if(ca != "0"){ bd.setQnumCell(c, parseInt(ca));}
		},bstr.split("/"));
		return "";
	},
	pzldataKanpen : function(){
		return ""+k.qrows+"/"+k.qcols+"/"+fio.encodeCell( function(c){
			if     (bd.getQnumCell(c)>=0) { return (bd.getQnumCell(c).toString() + "_");}
			else                          { return "0_";}
		});
	},

	//---------------------------------------------------------
	kanpenOpen : function(array){
		fio.decodeCell( function(c,ca){
			if     (ca == "#"){ bd.setQansCell(c, 1);}
			else if(ca == "+"){ bd.setQsubCell(c, 1);}
			else if(ca != "."){ bd.setQnumCell(c, parseInt(ca));}
		},array.slice(0,k.qrows));
	},
	kanpenSave : function(){
		return ""+fio.encodeCell( function(c){
			if     (bd.getQnumCell(c)>=0) { return (bd.getQnumCell(c).toString() + " ");}
			else if(bd.getQansCell(c)==1) { return "# ";}
			else if(bd.getQsubCell(c)==1) { return "+ ";}
			else                          { return ". ";}
		});
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	check : function(){

		if( !ans.checkSideCell(function(c1,c2){ return (bd.getQansCell(c1)==1 && bd.getQansCell(c2)==1);}) ){
			ans.setAlert('黒マスがタテヨコに連続しています。','Black cells are adjacent.'); return false;
		}

		if( !ans.linkBWarea( ans.searchWarea() ) ){
			ans.setAlert('白マスが分断されています。','White cells are devided.'); return false;
		}

		if( !this.checkCellNumber() ){
			ans.setAlert('数字の数だけ離れたマスのうち、1マスだけ黒マスになっていません。','The number of black cells at aparted cell by the number is not one.'); return false;
		}

		return true;
	},
	check1st : function(){ return true;},

	checkCellNumber : function(){
		var cx, cy;

		for(var c=0;c<bd.cell.length;c++){
			if(bd.getQnumCell(c)<0){ continue;}
			var cx=bd.cell[c].cx, cy=bd.cell[c].cy, num=bd.getQnumCell(c), cnt=0;
			if(bd.getQansCell(bd.getcnum(cx-num,cy))==1){ cnt++;}
			if(bd.getQansCell(bd.getcnum(cx+num,cy))==1){ cnt++;}
			if(bd.getQansCell(bd.getcnum(cx,cy-num))==1){ cnt++;}
			if(bd.getQansCell(bd.getcnum(cx,cy+num))==1){ cnt++;}
			if(cnt!=1){
				bd.setErrorCell([c],4);
				bd.setErrorCell([bd.getcnum(cx-num,cy),bd.getcnum(cx+num,cy),bd.getcnum(cx,cy-num),bd.getcnum(cx,cy+num)],1);
				return false;
			}
		}
		return true;
	}
};
