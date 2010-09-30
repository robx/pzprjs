//
// パズル固有スクリプト部 のりのり版 norinori.js v3.3.2
//
Puzzles.norinori = function(){ };
Puzzles.norinori.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}
		if(!k.qrows){ k.qrows = 10;}

		k.isborder = 1;

		k.hasroom         = true;
		k.BlackCell       = true;
		k.checkBlackCell  = true;

		k.ispzprv3ONLY    = true;

		base.setFloatbgcolor("rgb(0, 127, 127)");
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
		mv.mouseup = function(){ };
		mv.mousemove = function(){
			if     (k.editmode) this.inputborder();
			else if(k.playmode) this.inputcell();
		};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_LIGHT;
		pc.bcolor = "rgb(96, 224, 160)";
		pc.bbcolor = "rgb(96, 127, 127)";
		pc.setBGCellColorFunc('qsub1');

		pc.paint = function(){
			this.drawBGCells();
			this.drawGrid();
			this.drawBlackCells();

			this.drawBorders();

			this.drawChassis();

			this.drawBoxBorders(false);
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decodeBorder();
		};
		enc.pzlexport = function(type){
			this.encodeBorder();
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeAreaRoom();
			this.decodeCellAns();
		};
		fio.encodeData = function(){
			this.encodeAreaRoom();
			this.encodeCellAns();
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			var binfo = area.getBCellInfo();
			if( !this.checkAllArea(binfo, f_true, function(w,h,a,n){ return (a<=2);} ) ){
				this.setAlert('２マスより大きい黒マスのカタマリがあります。','The size of a mass of black cells is over two.'); return false;
			}

			var rinfo = area.getRoomInfo();
			if( !this.checkBlackCellInArea(rinfo, function(a){ return (a<=2);}) ){
				this.setAlert('２マス以上の黒マスがある部屋が存在します。','A room has three or mode black cells.'); return false;
			}

			if( !this.checkAllArea(binfo, f_true, function(w,h,a,n){ return (a>=2);} ) ){
				this.setAlert('１マスだけの黒マスのカタマリがあります。','There is a single black cell.'); return false;
			}

			if( !this.checkBlackCellInArea(rinfo, function(a){ return (a!=1);}) ){
				this.setAlert('１マスしか黒マスがない部屋があります。','A room has only one black cell.'); return false;
			}

			if( !this.checkBlackCellInArea(rinfo, function(a){ return (a>0);}) ){
				this.setAlert('黒マスがない部屋があります。','A room has no black cell.'); return false;
			}

			return true;
		};
	}
};
