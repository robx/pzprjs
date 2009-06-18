//
// パズル固有スクリプト部 数コロ版 sukoro.js v3.1.9p1
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

	k.dispzero      = 0;	// 1:0を表示するかどうか
	k.isDispHatena  = 1;	// 1:qnumが-2のときに？を表示する
	k.isAnsNumber   = 1;	// 1:回答に数字を入力するパズル
	k.isArrowNumber = 0;	// 1:矢印つき数字を入力するパズル
	k.isOneNumber   = 0;	// 1:部屋の問題の数字が1つだけ入るパズル
	k.isDispNumUL   = 0;	// 1:数字をマス目の左上に表示するパズル(0はマスの中央)
	k.NumberWithMB  = 1;	// 1:回答の数字と○×が入るパズル

	k.BlackCell     = 0;	// 1:黒マスを入力するパズル
	k.NumberIsWhite = 0;	// 1:数字のあるマスが黒マスにならないパズル
	k.RBBlackCell   = 0;	// 1:連黒分断禁のパズル

	k.ispzprv3ONLY  = 0;	// 1:ぱずぷれv3にしかないパズル
	k.isKanpenExist = 0;	// 1:pencilbox/カンペンにあるパズル

	k.fstruct = ["cellqnum", "cellqanssub"];

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

		base.setTitle("数コロ","Sukoro");
		base.setExpression("　マスのクリックやキーボードで数字を入力できます。QAZキーで○、WSXキーで×を入力できます。",
					   " It is available to input number by keybord or mouse. Each QAZ key to input auxiliary circle, each WSX key to input auxiliary cross.");
		base.setFloatbgcolor("rgb(64, 64, 64)");
	},
	menufix : function(){ },
	postfix : function(){ },

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(x,y){
			if(!kp.enabled()){ this.inputqnum(x,y,4);}
			else{ kp.display(x,y);}
		};
		mv.mouseup = function(x,y){ };
		mv.mousemove = function(x,y){
			//this.inputqnum(x,y,4);
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(this.moveTCell(ca)){ return;}
			if(puz.key_sukoro(ca)){ return;}
			this.key_inputqnum(ca,4);
		};

		kp.generate(99, true, true, this.kpgenerate);
		kp.kpinput = function(ca){
			if(puz.key_sukoro(ca)){ return;}
			kc.key_inputqnum(ca,4);
		};
	},
	key_sukoro : function(ca){
		if(k.mode==1 || bd.getQnumCell(tc.getTCC())!=-1){ return false;}

		var cc = tc.getTCC();
		var flag = false;

		if     ((ca=='q'||ca=='a'||ca=='z')){ if(bd.getQsubCell(cc)==1){ bd.setQansCell(cc,1); bd.setQsubCell(cc,0);}else{ bd.setQansCell(cc,-1); bd.setQsubCell(cc,1);} flag = true;}
		else if((ca=='w'||ca=='s'||ca=='x')){ if(bd.getQsubCell(cc)==2){ bd.setQansCell(cc,2); bd.setQsubCell(cc,0);}else{ bd.setQansCell(cc,-1); bd.setQsubCell(cc,2);} flag = true;}
		else if((ca=='e'||ca=='d'||ca=='c')){ bd.setQansCell(cc,-1); bd.setQsubCell(cc,0); flag = true;}
		else if(ca=='1' && bd.getQansCell(cc)==1){ bd.setQansCell(cc,-1); bd.setQsubCell(cc,1); flag = true;}
		else if(ca=='2' && bd.getQansCell(cc)==2){ bd.setQansCell(cc,-1); bd.setQsubCell(cc,2); flag = true;}

		if(flag){ pc.paint(bd.cell[cc].cx, bd.cell[cc].cy, bd.cell[cc].cx, bd.cell[cc].cy); return true;}
		return false;
	},

	kpgenerate : function(mode){
		kp.inputcol('num','knum1','1','1');
		kp.inputcol('num','knum2','2','2');
		kp.inputcol('num','knum3','3','3');
		kp.inputcol('num','knum4','4','4');
		kp.insertrow();
		if(mode==1){
			kp.inputcol('num','knum.','-','?');
			kp.inputcol('num','knum_',' ',' ');
			kp.inputcol('empty','knumx','','');
			kp.inputcol('empty','knumy','','');
			kp.insertrow();
		}
		else{
			kp.tdcolor = pc.MBcolor;
			kp.inputcol('num','knumq','q','○');
			kp.inputcol('num','knumw','w','×');
			kp.tdcolor = "black";
			kp.inputcol('num','knum_',' ',' ');
			kp.inputcol('empty','knumx','','');
			kp.insertrow();
		}
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		this.MBcolor = "rgb(64, 255, 64)";

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);
		//	this.flushCanvasAll();

			this.drawErrorCells(x1,y1,x2,y2);

			this.drawBDline(x1,y1,x2,y2);

			this.drawMBs(x1,y1,x2,y2);
			this.drawNumbers(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);

			this.drawTCell(x1,y1,x2+1,y2+1);
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	pzlinput : function(type, bstr){
		if(type==0 || type==1){ bstr = enc.decodeNumber10(bstr);}
	},
	pzloutput : function(type){
		if(type==0)     { document.urloutput.ta.value = enc.getURLbase()+"?"+k.puzzleid+this.pzldata();}
		else if(type==1){ document.urloutput.ta.value = enc.getDocbase()+k.puzzleid+"/sa/m.html?c"+this.pzldata();}
		else if(type==3){ document.urloutput.ta.value = enc.getURLbase()+"?m+"+k.puzzleid+this.pzldata();}
	},
	pzldata : function(){
		return "/"+k.qcols+"/"+k.qrows+"/"+enc.encodeNumber10();
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	check : function(){

		if( !ans.checkSideCell(function(c1,c2){ return (puz.getNum(c1)>0 && puz.getNum(c1)==puz.getNum(c2));}) ){
			ans.setAlert('同じ数字がタテヨコに連続しています。','Same numbers are adjacent.'); return false;
		}

		if( !this.checkCellNumber() ){
			ans.setAlert('数字と、その数字の上下左右に入る数字の数が一致していません。','The number of numbers placed in four adjacent cells is not equal to the number.'); return false;
		}

		if( !ans.linkBWarea( ans.searchBWarea(function(id){ return (id!=-1 && puz.getNum(id)!=-1); }) ) ){
			ans.setAlert('タテヨコにつながっていない数字があります。','Numbers are devided.'); return false;
		}

		return true;
	},

	checkCellNumber : function(){
		for(var c=0;c<bd.cell.length;c++){
			if(this.getNum(c)>=0 && this.getNum(c)!=ans.checkdir4Cell(c,function(a){ return (puz.getNum(a)!=-1);})){
				bd.setErrorCell([c],1);
				return false;
			}
		}
		return true;
	},
	getNum : function(cc){
		if(cc<0||cc>=bd.cell.length){ return -1;}
		return (bd.getQnumCell(cc)!=-1?bd.getQnumCell(cc):bd.getQansCell(cc));
	}
};
