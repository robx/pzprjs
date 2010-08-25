//
// パズル固有スクリプト部 島国版 shimaguni.js v3.3.2
//
Puzzles.shimaguni = function(){ };
Puzzles.shimaguni.prototype = {
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
		k.roomNumber      = true;

		k.dispzero        = false;
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

		base.setTitle("島国","Islands");
		base.setExpression("　左クリックで黒マスが、右クリックで白マス確定マスが入力できます。",
						   " Left Click to input black cells, Right Click to input determined white cells.");
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
		pc.bcolor = "rgb(191, 191, 255)";
		pc.bbcolor = "rgb(191, 191, 255)";
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

			var rinfo = area.getRoomInfo();
			if( !this.checkSideAreaCell(rinfo, function(c1,c2){ return (bd.isBlack(c1) && bd.isBlack(c2));}, true) ){
				this.setAlert('異なる海域にある国どうしが辺を共有しています。','Countries in other marine area share the side over border line.'); return false;
			}

			if( !this.checkSeqBlocksInRoom() ){
				this.setAlert('1つの海域に入る国が2つ以上に分裂しています。','Countries in one marine area are devided to plural ones.'); return false;
			}

			if( !this.checkBlackCellCount(rinfo) ){
				this.setAlert('海域内の数字と国のマス数が一致していません。','The number of black cells is not equals to the number.'); return false;
			}

			if( !this.checkSideAreaSize(rinfo, ee.binder(this, function(rinfo,r){ return this.getCellsOfClist(rinfo.room[r].idlist, bd.isBlack);})) ){
				this.setAlert('隣り合う海域にある国の大きさが同じです。','The size of countries that there are in adjacent marine areas are the same.'); return false;
			}

			if( !this.checkBlackCellInArea(rinfo, function(a){ return (a>0);}) ){
				this.setAlert('黒マスのカタマリがない海域があります。','A marine area has no black cells.'); return false;
			}

			return true;
		};

		ans.getCellsOfClist = function(clist, func){
			var cnt = 0;
			for(var i=0,len=clist.length;i<len;i++){ if(func(clist[i])){ cnt++;}}
			return cnt;
		};
	}
};
