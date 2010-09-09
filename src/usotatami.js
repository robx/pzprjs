//
// パズル固有スクリプト部 ウソタタミ版 usotatami.js v3.3.2
//
Puzzles.usotatami = function(){ };
Puzzles.usotatami.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 8;}
		if(!k.qrows){ k.qrows = 8;}

		k.isborder = 1;

		k.hasroom         = true;
		k.isDispHatena    = true;
		k.isInputHatena   = true;

		k.ispzprv3ONLY    = true;

		base.setTitle("ウソタタミ","Uso-tatami");
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
			kp.generate(0, true, false);
			kp.kpinput = function(ca){
				kc.key_inputqnum(ca);
			};
		}
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

			var rinfo = area.getRoomInfo();
			if( !this.checkNoNumber(rinfo) ){
				this.setAlert('数字の入っていないタタミがあります。','A tatami has no numbers.'); return false;
			}

			if( !this.checkDoubleNumber(rinfo) ){
				this.setAlert('1つのタタミに2つ以上の数字が入っています。','A tatami has plural numbers.'); return false;
			}

			if( !this.checkAllArea(rinfo, f_true, function(w,h,a,n){ return (n<0||n!=a);}) ){
				this.setAlert('数字とタタミの大きさが同じです。','The size of the tatami and the number is the same.'); return false;
			}

			if( !this.checkLcntCross(1,0) ){
				this.setAlert('途切れている線があります。','There is a dead-end line.'); return false;
			}

			if( !this.checkAllArea(rinfo, f_true, function(w,h,a,n){ return (w==1||h==1);} ) ){
				this.setAlert('幅が１マスではないタタミがあります。','The width of the tatami is not one.'); return false;
			}

			return true;
		};
	}
};
