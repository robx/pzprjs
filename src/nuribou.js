//
// パズル固有スクリプト部 ぬりぼう版 nuribou.js v3.3.2
//
Puzzles.nuribou = function(){ };
Puzzles.nuribou.prototype = {
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
		k.isAnsNumber     = false;
		k.NumberWithMB    = false;
		k.linkNumber      = false;

		k.BlackCell       = true;
		k.NumberIsWhite   = true;
		k.numberAsObject  = false;
		k.RBBlackCell     = false;
		k.checkBlackCell  = true;
		k.checkWhiteCell  = true;

		k.ispzprv3ONLY    = false;
		k.isKanpenExist   = false;

		base.setTitle("ぬりぼう","Nuribou");
		base.setExpression("　左クリックで黒マスが、右クリックで白マス確定マスが入力できます。",
						   " Left Click to input black cells, Right Click to input determined white cells.");
		base.setFloatbgcolor("rgb(96, 96, 96)");
	},
	menufix : function(){
		menu.addUseToFlags();
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if     (k.editmode){ this.inputqnum();}
			else if(k.playmode){ this.inputcell();}
		};
		mv.mouseup = function(){ };
		mv.mousemove = function(){
			if(k.playmode) this.inputcell();
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
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.bcolor = pc.bcolor_GREEN;
		pc.setBGCellColorFunc('qsub1');

		pc.paint = function(){
			this.drawBGCells();
			this.drawGrid();
			this.drawBlackCells();

			this.drawNumbers();

			this.drawChassis();

			this.drawTarget();
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decodeNumber16();
		};
		enc.pzlexport = function(type){
			this.encodeNumber16();
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeCellQnum();
			this.decodeCellAns();
		};
		fio.encodeData = function(){
			this.encodeCellQnum();
			this.encodeCellAns();
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			var binfo = area.getBCellInfo();
			if( !this.checkAllArea(binfo, f_true, function(w,h,a,n){ return (w==1||h==1);} ) ){
				this.setAlert('「幅１マス、長さ１マス以上」ではない黒マスのカタマリがあります。','There is a mass of black cells, whose width is more than two.'); return false;
			}

			if( !this.checkCorners(binfo) ){
				this.setAlert('同じ面積の黒マスのカタマリが、角を共有しています。','Masses of black cells whose length is the same share a corner.'); return false;
			}

			var winfo = area.getWCellInfo();
			if( !this.checkNoNumber(winfo) ){
				this.setAlert('数字の入っていないシマがあります。','An area of white cells has no numbers.'); return false;
			}

			if( !this.checkDoubleNumber(winfo) ){
				this.setAlert('1つのシマに2つ以上の数字が入っています。','An area of white cells has plural numbers.'); return false;
			}

			if( !this.checkNumberAndSize(winfo) ){
				this.setAlert('数字とシマの面積が違います。','The number is not equal to the number of the size of the area.'); return false;
			}

			return true;
		};

		ans.checkCorners = function(binfo){
			var result = true;
			for(var c=0;c<bd.cellmax;c++){
				if(bd.cell[c].bx===bd.maxbx-1 || bd.cell[c].by===bd.maxby-1){ continue;}

				var cc1, cc2;
				if     ( bd.isBlack(c) && bd.isBlack(c+k.qcols+1) ){ cc1 = c; cc2 = c+k.qcols+1;}
				else if( bd.isBlack(c+1) && bd.isBlack(c+k.qcols) ){ cc1 = c+1; cc2 = c+k.qcols;}
				else{ continue;}

				if(binfo.room[binfo.id[cc1]].idlist.length == binfo.room[binfo.id[cc2]].idlist.length){
					if(this.inAutoCheck){ return false;}
					bd.sErC(binfo.room[binfo.id[cc1]].idlist,1);
					bd.sErC(binfo.room[binfo.id[cc2]].idlist,1);
					result = false;
				}
			}
			return result;
		};
	}
};
