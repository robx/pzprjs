//
// パズル固有スクリプト部 やじさんかずさん版 yajikazu.js v3.1.9p2
//

function setting(){
	// グローバル変数の初期設定
	if(!k.qcols){ k.qcols = 10;}	// 盤面の横幅
	if(!k.qrows){ k.qrows = 10;}	// 盤面の縦幅
	k.irowake = 0;			// 0:色分け設定無し 1:色分けしない 2:色分けする

	k.iscross      = 0;		// 1:Crossが操作可能なパズル
	k.isborder     = 0;		// 1:Border/Lineが操作可能なパズル
	k.isextendcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

	k.isoutsidecross  = 0;	// 1:外枠上にCrossの配置があるパズル
	k.isoutsideborder = 0;	// 1:盤面の外枠上にborderのIDを用意する
	k.isborderCross   = 0;	// 1:線が交差するパズル
	k.isCenterLine    = 0;	// 1:マスの真ん中を通る線を回答として入力するパズル
	k.isborderAsLine  = 0;	// 1:境界線をlineとして扱う

	k.dispzero      = 1;	// 1:0を表示するかどうか
	k.isDispHatena  = 1;	// 1:qnumが-2のときに？を表示する
	k.isAnsNumber   = 0;	// 1:回答に数字を入力するパズル
	k.isArrowNumber = 1;	// 1:矢印つき数字を入力するパズル
	k.isOneNumber   = 0;	// 1:部屋の問題の数字が1つだけ入るパズル
	k.isDispNumUL   = 0;	// 1:数字をマス目の左上に表示するパズル(0はマスの中央)
	k.NumberWithMB  = 0;	// 1:回答の数字と○×が入るパズル

	k.BlackCell     = 1;	// 1:黒マスを入力するパズル
	k.NumberIsWhite = 0;	// 1:数字のあるマスが黒マスにならないパズル
	k.RBBlackCell   = 1;	// 1:連黒分断禁のパズル

	k.ispzprv3ONLY  = 0;	// 1:ぱずぷれv3にしかないパズル
	k.isKanpenExist = 0;	// 1:pencilbox/カンペンにあるパズル

	k.fstruct = ["celldirecnum","cellans"];

	//k.def_csize = 36;
	k.def_psize = 16;
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

		if(k.callmode=="pmake"){
			base.setExpression("　矢印は、マウスの左ドラッグか、SHIFT押しながら矢印キーで入力できます。",
							   " To input Arrows, Left Button Drag or Press arrow key with SHIFT key.");
		}
		else{
			base.setExpression("　左クリックで黒マスが、右クリックで白マス確定マスが入力できます。",
							   " Left Click to input black cells, Right Click to input determined white cells.");
		}
		base.setTitle("やじさんかずさん","Yajisan-Kazusan");
		base.setFloatbgcolor("rgb(0, 224, 0)");
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
			if(k.mode==1) this.inputdirec(x,y);
			else if(k.mode==3) this.inputcell(x,y);
		};
		mv.mouseup = function(x,y){
			if(k.mode==1 && this.notInputted() && bd.getcnum(this.mouseCell.x,this.mouseCell.y)==this.cellid(new Pos(x,y))) this.inputqnum(x,y,99);
		};
		mv.mousemove = function(x,y){
			if(k.mode==1){
				if(this.notInputted()) this.inputdirec(x,y);
			}
			else if(k.mode==3) this.inputcell(x,y);
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(k.mode==3){ return;}
			if(this.key_inputdirec(ca)){ return;}
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum(ca,99);
		};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.BDlinecolor = "rgb(127, 127, 127)";
		pc.bcolor = "rgb(160, 255, 160)";
		pc.BCell_fontcolor = "rgb(96,96,96)";

		pc.paint = function(x1,y1,x2,y2){
			x2++; y2++;
			this.flushCanvas(x1,y1,x2,y2);
		//	this.flushCanvasAll();

			this.drawWhiteCells(x1,y1,x2,y2);
			this.drawBDline2(x1,y1,x2,y2);
			this.drawBlackCells(x1,y1,x2,y2);

			this.drawArrowNumbers(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);

			if(k.mode==1){ this.drawTCell(x1,y1,x2+1,y2+1);}else{ this.hideTCell();}
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	pzlinput : function(type, bstr){
		if(type==0 || type==1){ bstr = enc.decodeArrowNumber16(bstr);}
	},

	pzloutput : function(type){
		if(type==0)     { document.urloutput.ta.value = enc.getURLbase()+"?"+k.puzzleid+this.pzldata();}
		else if(type==1){ document.urloutput.ta.value = enc.getDocbase()+k.puzzleid+"/sa/m.html?c"+this.pzldata();}
		else if(type==3){ document.urloutput.ta.value = enc.getURLbase()+"?m+"+k.puzzleid+this.pzldata();}
	},
	pzldata : function(){
		return "/"+k.qcols+"/"+k.qrows+"/"+enc.encodeArrowNumber16();
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

		if( !this.checkArrowNumber() ){
			ans.setAlert('矢印の方向にある黒マスの数が正しくありません。','The number of black cells are not correct.'); return false;
		}

		return true;
	},
	check1st : function(){ return true;},

	checkArrowNumber : function(){
		for(var c=0;c<bd.cell.length;c++){
			if(bd.getQnumCell(c)<0 || bd.getDirecCell(c)==0 || bd.getQansCell(c)==1){ continue;}
			var cx = bd.cell[c].cx, cy = bd.cell[c].cy, dir = bd.getDirecCell(c);
			var cnt=0;
			if     (dir==1){ cy--; while(cy>=0     ){ if(bd.getQansCell(bd.getcnum(cx,cy))==1){cnt++;} cy--;} }
			else if(dir==2){ cy++; while(cy<k.qrows){ if(bd.getQansCell(bd.getcnum(cx,cy))==1){cnt++;} cy++;} }
			else if(dir==3){ cx--; while(cx>=0     ){ if(bd.getQansCell(bd.getcnum(cx,cy))==1){cnt++;} cx--;} }
			else if(dir==4){ cx++; while(cx<k.qcols){ if(bd.getQansCell(bd.getcnum(cx,cy))==1){cnt++;} cx++;} }

			if(bd.getQnumCell(c)!=cnt){
				bd.setErrorCell([c],1);
				cx = bd.cell[c].cx, cy = bd.cell[c].cy;
				if     (dir==1){ cy--; while(cy>=0     ){ bd.setErrorCell([bd.getcnum(cx,cy)],1); cy--;} }
				else if(dir==2){ cy++; while(cy<k.qrows){ bd.setErrorCell([bd.getcnum(cx,cy)],1); cy++;} }
				else if(dir==3){ cx--; while(cx>=0     ){ bd.setErrorCell([bd.getcnum(cx,cy)],1); cx--;} }
				else if(dir==4){ cx++; while(cx<k.qcols){ bd.setErrorCell([bd.getcnum(cx,cy)],1); cx++;} }
				return false;
			}
		}
		return true;
	}
};
