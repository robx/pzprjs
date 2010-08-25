//
// パズル固有スクリプト部 ペイントエリア版 paintarea.js v3.3.2
//
Puzzles.paintarea = function(){ };
Puzzles.paintarea.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}
		if(!k.qrows){ k.qrows = 10;}
		k.irowake  = 0;

		k.iscross  = 0;
		k.isborder = 1;
		k.isexcell = 0;

		k.isLineCross     = false;
		k.isCenterLine    = false;
		k.isborderAsLine  = false;
		k.hasroom         = true;
		k.roomNumber      = false;

		k.dispzero        = true;
		k.isDispHatena    = true;
		k.isInputHatena   = true;
		k.inputQnumDirect = false;
		k.isAnsNumber     = false;
		k.NumberWithMB    = false;
		k.linkNumber      = false;

		k.BlackCell       = true;
		k.NumberIsWhite   = false;
		k.numberAsObject  = false;
		k.RBBlackCell     = false;
		k.checkBlackCell  = true;
		k.checkWhiteCell  = false;

		k.ispzprv3ONLY    = false;
		k.isKanpenExist   = false;

		base.setTitle("ペイントエリア","Paintarea");
		base.setExpression("　左クリックで黒タイルが、右クリックで白タイル確定タイルが入力できます。",
						   " Left Click to input black tile, Right Click to determined white tile.");
		base.setFloatbgcolor("rgb(127, 160, 96)");
	},
	menufix : function(){
		menu.addUseToFlags();
		menu.addRedBlockToFlags();
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(kc.isZ ^ pp.getVal('dispred')){ this.dispRed();}
			else if(k.editmode) this.inputborder();
			else if(k.playmode) this.inputtile();
		};
		mv.mouseup = function(){
			if(this.notInputted()){
				if(k.editmode){ this.inputqnum();}
			}
		};
		mv.mousemove = function(){
			if     (k.editmode) this.inputborder();
			else if(k.playmode) this.inputtile();
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(ca=='z' && !this.keyPressed){ this.isZ=true; return;}
			if(k.playmode){ return;}
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum(ca);
		};
		kc.keyup = function(ca){ if(ca=='z'){ this.isZ=false;}};
		kc.isZ = false;

		if(k.EDITOR){
			kp.generate(1, true, false);
			kp.kpinput = function(ca){
				kc.key_inputqnum(ca);
			};
		}

		bd.maxnum = 4;
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.bcolor = pc.bcolor_GREEN;
		pc.bbcolor = "rgb(127, 127, 127)";
		pc.setBGCellColorFunc('qans1');

		pc.paint = function(){
			this.drawBGCells();
			this.drawGrid();
			this.drawBlackCells();

			this.drawNumbers();

			this.drawBorders();

			this.drawChassis();

			this.drawBoxBorders(true);

			this.drawTarget();
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decodeBorder();
			this.decodeNumber10();
		};
		enc.pzlexport = function(type){
			this.encodeBorder();
			this.encodeNumber10();
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeAreaRoom();
			this.decodeCellQnum();
			this.decodeCellAns();
		};
		fio.encodeData = function(){
			this.encodeAreaRoom();
			this.encodeCellQnum();
			this.encodeCellAns();
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			if( k.EDITOR && !this.checkSameObjectInRoom(area.getRoomInfo(), function(c){ return (bd.isBlack(c)?1:2);}) ){
				this.setAlert('白マスと黒マスの混在したタイルがあります。','A tile includes both black and white cells.'); return false;
			}

			if( !this.checkOneArea( area.getBCellInfo() ) ){
				this.setAlert('黒マスがひとつながりになっていません。','Black cells are devided.'); return false;
			}

			if( !this.check2x2Block( bd.isBlack ) ){
				this.setAlert('2x2の黒マスのかたまりがあります。','There is a 2x2 block of black cells.'); return false;
			}

			if( !this.checkDir4Cell( bd.isBlack,0 ) ){
				this.setAlert('数字の上下左右にある黒マスの数が間違っています。','The number is not equal to the number of black cells in four adjacent cells.'); return false;
			}

			if( !this.check2x2Block( bd.isWhite ) ){
				this.setAlert('2x2の白マスのかたまりがあります。','There is a 2x2 block of white cells.'); return false;
			}

			return true;
		};
	}
};
