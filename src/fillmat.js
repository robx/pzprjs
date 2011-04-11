//
// パズル固有スクリプト部 フィルマット版 fillmat.js v3.4.0
//
Puzzles.fillmat = function(){ };
Puzzles.fillmat.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}
		if(!k.qrows){ k.qrows = 10;}

		k.isborder = 1;

		k.hasroom         = true;
		k.isDispHatena    = true;
		k.isInputHatena   = true;

		base.setFloatbgcolor("rgb(127, 191, 0)");
	},
	menufix : function(){ },

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(k.editmode){ this.inputqnum();}
			else if(k.playmode){
				if(this.btn.Left) this.inputborderans();
				else if(this.btn.Right) this.inputQsubLine();
			}
		};
		mv.mouseup = function(){ };
		mv.mousemove = function(){
			if(k.playmode){
				if(this.btn.Left) this.inputborderans();
				else if(this.btn.Right) this.inputQsubLine();
			}
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(k.playmode){ return;}
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum(ca);
		};

		if(k.EDITOR){
			kp.kpinput = function(ca){
				kc.key_inputqnum(ca);
			};
			kp.kpgenerate = function(mode){
				this.inputcol('num','knum1','1','1');
				this.inputcol('num','knum2','2','2');
				this.inputcol('num','knum3','3','3');
				this.insertrow();
				this.inputcol('num','knum4','4','4');
				this.inputcol('num','knum_',' ',' ');
				this.inputcol('num','knum.','-','?');
				this.insertrow();
			};
			kp.generate(kp.ORIGINAL, true, false);
		}

		bd.maxnum = 4;
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_DLIGHT;
		pc.setBorderColorFunc('qans');

		pc.paint = function(){
			this.drawBGCells();
			this.drawDashedGrid();
			this.drawBorders();

			this.drawNumbers();
			this.drawBorderQsubs();

			this.drawChassis();

			this.drawTarget();
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
			this.decodeBorderAns();
		};
		fio.encodeData = function(){
			this.encodeCellQnum();
			this.encodeBorderAns();
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			if( !this.checkLcntCross(4,0) ){
				this.setAlert('十字の交差点があります。','There is a crossing border line.'); return false;
			}

			var rinfo = bd.areas.getRoomInfo();
			if( !this.checkSideAreaSize(rinfo, function(rinfo,r){ return rinfo.room[r].idlist.length;}) ){
				this.setAlert('隣り合うタタミの大きさが同じです。','The same size Tatami are adjacent.'); return false;
			}

			if( !this.checkAllArea(rinfo, f_true, function(w,h,a,n){ return (w==1||h==1)&&a<=4;}) ){
				this.setAlert('「幅１マス、長さ１～４マス」ではないタタミがあります。','The width of Tatami is over 1 or the length is over 4.'); return false;
			}

			if( !this.checkDoubleNumber(rinfo) ){
				this.setAlert('1つのタタミに2つ以上の数字が入っています。','A Tatami has two or more numbers.'); return false;
			}

			if( !this.checkNumberAndSize(rinfo) ){
				this.setAlert('数字とタタミの大きさが違います。','The size of Tatami and the number written in Tatami is different.'); return false;
			}

			if( !this.checkLcntCross(1,0) ){
				this.setAlert('途切れている線があります。','There is an dead-end border line.'); return false;
			}

			return true;
		};
	}
};
