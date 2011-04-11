//
// パズル固有スクリプト部 コージュン版 cojun.js v3.4.0
//
Puzzles.cojun = function(){ };
Puzzles.cojun.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 8;}
		if(!k.qrows){ k.qrows = 8;}

		k.isborder = 1;

		k.hasroom         = true;
		k.isDispHatena    = true;
		k.isInputHatena   = true;
		k.isAnsNumber     = true;

		k.ispzprv3ONLY    = true;

		base.setFloatbgcolor("rgb(64, 64, 64)");
	},
	menufix : function(){ },

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(k.editmode){ this.inputborder();}
			if(k.playmode){ this.inputqnum();}
		};
		mv.mouseup = function(){
			if(this.notInputted()){
				if(k.editmode){ this.inputqnum();}
			}
		};
		mv.mousemove = function(){
			if(k.editmode && this.btn.Left){ this.inputborder();}
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum(ca);
		};

		kp.generate(0, true, true);
		kp.kpinput = function(ca){ kc.key_inputqnum(ca);};

		bd.areas.resetArea();
		bd.nummaxfunc = function(cc){ return this.areas.getCntOfRoomByCell(cc);};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_DLIGHT;

		pc.paint = function(){
			this.drawBGCells();
			this.drawGrid();

			this.drawNumbers();

			this.drawBorders();

			this.drawChassis();

			this.drawCursor();
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decodeBorder();
			this.decodeNumber16();
		};
		enc.pzlexport = function(type){
			this.encodeBorder();
			this.encodeNumber16();
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeBorderQues();
			this.decodeCellQnum();
			this.decodeCellAnumsub();
		};
		fio.encodeData = function(){
			this.encodeBorderQues();
			this.encodeCellQnum();
			this.encodeCellAnumsub();
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			var rinfo = bd.areas.getRoomInfo();
			if( !this.checkDifferentNumberInRoom(rinfo, bd.getNum) ){
				this.setAlert('1つの部屋に同じ数字が複数入っています。','A room has two or more same numbers.'); return false;
			}

			if( !this.checkSideCell(bd.sameNumber) ){
				this.setAlert('同じ数字がタテヨコに連続しています。','Same numbers are adjacent.'); return false;
			}

			if( !this.checkUpperNumber(rinfo) ){
				this.setAlert('同じ部屋で上に小さい数字が乗っています。','There is an small number on big number in a room.'); return false;
			}

			if( !this.checkNoNumCell() ){
				this.setAlert('数字の入っていないマスがあります。','There is a empty cell.'); return false;
			}

			return true;
		};
		ans.check1st = function(){ return this.checkNoNumCell();};

		ans.checkUpperNumber = function(rinfo){
			var result = true;
			for(var c=0;c<bd.cellmax-k.qcols;c++){
				var dc = bd.dn(c);
				if(rinfo.id[c]!=rinfo.id[dc] || !bd.isNum(c) || !bd.isNum(dc)){ continue;}
				if(bd.getNum(dc)>bd.getNum(c)){
					if(this.inAutoCheck){ return false;}
					bd.sErC([c,dc],1);
					result = false;
				}
			}
			return result;
		};
	}
};
