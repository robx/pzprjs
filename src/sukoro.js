//
// パズル固有スクリプト部 数コロ版 sukoro.js v3.3.2
//
Puzzles.sukoro = function(){ };
Puzzles.sukoro.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}
		if(!k.qrows){ k.qrows = 10;}
		k.irowake  = 0;

		k.iscross  = 0;
		k.isborder = 0;
		k.isexcell = 0;

		k.isLineCross     = false;
		k.isCenterLine    = false;
		k.isborderAsLine  = false;
		k.hasroom         = false;
		k.roomNumber      = false;

		k.dispzero        = false;
		k.isDispHatena    = true;
		k.isInputHatena   = true;
		k.inputQnumDirect = false;
		k.isAnsNumber     = true;
		k.NumberWithMB    = true;
		k.linkNumber      = true;

		k.BlackCell       = false;
		k.NumberIsWhite   = false;
		k.numberAsObject  = false;
		k.RBBlackCell     = false;
		k.checkBlackCell  = false;
		k.checkWhiteCell  = false;

		k.ispzprv3ONLY    = false;
		k.isKanpenExist   = false;

		base.setTitle("数コロ","Sukoro");
		base.setExpression("　マスのクリックやキーボードで数字を入力できます。QAZキーで○、WSXキーで×を入力できます。",
					   " It is available to input number by keybord or mouse. Each QAZ key to input auxiliary circle, each WSX key to input auxiliary cross.");
		base.setFloatbgcolor("rgb(64, 64, 64)");
	},
	menufix : function(){ },

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){ this.inputqnum();};
		mv.mouseup = function(){ };
		mv.mousemove = function(){ };

		// キーボード入力系
		kc.keyinput = function(ca){
			if(this.moveTCell(ca)){ return;}
			this.key_sukoro(ca);
		};
		kc.key_sukoro = function(ca){
			if(k.playmode){
				var cc=tc.getTCC();
				if     (ca==='q'||ca==='a'||ca==='z')          { ca=(bd.QsC(cc)===1?'1':'s1');}
				else if(ca==='w'||ca==='s'||ca==='x')          { ca=(bd.QsC(cc)===2?'2':'s2');}
				else if(ca==='e'||ca==='d'||ca==='c'||ca==='-'){ ca=' '; }
				else if(ca==='1' && bd.AnC(cc)===1)            { ca='s1';}
				else if(ca==='2' && bd.AnC(cc)===2)            { ca='s2';}
			}
			this.key_inputqnum(ca);
		};

		kp.kpgenerate = function(mode){
			this.inputcol('num','knum1','1','1');
			this.inputcol('num','knum2','2','2');
			this.inputcol('num','knum3','3','3');
			this.inputcol('num','knum4','4','4');
			this.insertrow();
			if(mode==1){
				this.inputcol('num','knum.','-','?');
				this.inputcol('num','knum_',' ',' ');
				this.inputcol('empty','','','');
				this.inputcol('empty','','','');
				this.insertrow();
			}
			else{
				this.tdcolor = pc.mbcolor;
				this.inputcol('num','knumq','q','○');
				this.inputcol('num','knumw','w','×');
				this.tdcolor = "black";
				this.inputcol('num','knum_',' ',' ');
				this.inputcol('empty','','','');
				this.insertrow();
			}
		};
		kp.generate(kp.ORIGINAL, true, true);
		kp.kpinput = function(ca){
			if(kc.key_sukoro(ca)){ return;}
			kc.key_inputqnum(ca);
		};

		bd.maxnum = 4;
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){

		pc.paint = function(){
			this.drawBGCells();
			this.drawGrid();

			this.drawMBs();
			this.drawNumbers();

			this.drawChassis();

			this.drawCursor();
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decodeNumber10();
		};
		enc.pzlexport = function(type){
			this.encodeNumber10();
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeCellQnum();
			this.decodeCellAnumsub();
		};
		fio.encodeData = function(){
			this.encodeCellQnum();
			this.encodeCellAnumsub();
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			if( !this.checkSideCell(bd.sameNumber) ){
				this.setAlert('同じ数字がタテヨコに連続しています。','Same numbers are adjacent.'); return false;
			}

			if( !this.checkDir4Cell(area.isBlock,0) ){
				this.setAlert('数字と、その数字の上下左右に入る数字の数が一致していません。','The number of numbers placed in four adjacent cells is not equal to the number.'); return false;
			}

			if( !this.checkOneArea( area.getNumberInfo() ) ){
				this.setAlert('タテヨコにつながっていない数字があります。','Numbers are devided.'); return false;
			}

			if( !this.checkAllCell(function(c){ return (bd.QsC(c)===1);}) ){
				this.setAlert('数字の入っていないマスがあります。','There is a cell that is not filled in number.'); return false;
			}

			return true;
		};
	}
};
