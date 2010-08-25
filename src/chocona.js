//
// パズル固有スクリプト部 チョコナ版 chocona.js v3.3.2
//
Puzzles.chocona = function(){ };
Puzzles.chocona.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}
		if(!k.qrows){ k.qrows = 10;}

		k.isborder = 1;

		k.hasroom         = true;
		k.roomNumber      = true;
		k.dispzero        = true;
		k.isDispHatena    = true;
		k.isInputHatena   = true;
		k.BlackCell       = true;
		k.checkBlackCell  = true;

		k.ispzprv3ONLY    = true;

		base.setTitle("チョコナ", "Chocona");
		base.setExpression("　左クリックで黒マスが、右クリックで白マス確定マスが入力できます。",
							 " Left Click to input black cells, Right Click to input determined white cells.");
		base.setFloatbgcolor("rgb(127, 0, 0)");
	},
	menufix : function(){
		menu.addUseToFlags();
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if     (k.editmode) this.inputborder();
			else if(k.playmode) this.inputcell();
		};
		mv.mouseup = function(){
			if(this.notInputted()){
				if(k.editmode){ this.inputqnum();}
			}
		};
		mv.mousemove = function(){
			if     (k.editmode) this.inputborder();
			else if(k.playmode) this.inputcell();
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(k.playmode){ return;}
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum(ca);
		};

		if(k.EDITOR){
			kp.generate(0, true, false);
			kp.kpinput = function(ca){
				kc.key_inputqnum(ca);
			};
		}

		bd.nummaxfunc = function(cc){ return Math.min(this.maxnum, area.getCntOfRoomByCell(cc));};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_LIGHT;
		pc.bcolor = pc.bcolor_GREEN;
		pc.setBGCellColorFunc('qsub1');

		pc.paint = function(){
			this.drawBGCells();
			this.drawGrid();
			this.drawBlackCells();

			this.drawNumbers();

			this.drawBorders();

			this.drawChassis();

			this.drawBoxBorders(false);

			this.drawTarget();
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decodeBorder();
			this.decodeRoomNumber16();
		};
		enc.pzlexport = function(type){
			this.encodeBorder();
			this.encodeRoomNumber16();
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

			if( !this.checkAreaRect(area.getBCellInfo()) ){
				this.setAlert('黒マスのカタマリが正方形か長方形ではありません。','A mass of black cells is not rectangle.'); return false;
			}

			if( !this.checkBlackCellCount( area.getRoomInfo() ) ){
				this.setAlert('数字のある領域と、領域の中にある黒マスの数が違います。','The number of Black cells in the area and the number written in the area is different.'); return false;
			}

			return true;
		}
	}
};
