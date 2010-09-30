//
// パズル固有スクリプト部 なわばり版 nawabari.js v3.3.2
//
Puzzles.nawabari = function(){ };
Puzzles.nawabari.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}
		if(!k.qrows){ k.qrows = 10;}

		k.isborder = 1;

		k.hasroom         = true;
		k.dispzero        = true;
		k.isDispHatena    = true;
		k.isInputHatena   = true;

		base.setFloatbgcolor("rgb(127, 127, 255)");
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

			var rinfo = area.getRoomInfo();
			if( !this.checkAreaRect(rinfo) ){
				this.setAlert('部屋の形が長方形ではありません。','There is not rectangle territory.'); return false;
			}

			if( !this.checkNoNumber(rinfo) ){
				this.setAlert('数字の入っていない部屋があります。','A territory has no numbers.'); return false;
			}

			if( !this.checkDoubleNumber(rinfo) ){
				this.setAlert('1つの部屋に2つ以上の数字が入っています。','A territory has plural numbers.'); return false;
			}

			if( !this.checkdir4BorderAns() ){
				this.setAlert('数字の周りにある境界線の本数が違います。','The number is not equal to the number of border lines around it.'); return false;
			}

			if( !this.checkLcntCross(1,0) ){
				this.setAlert('途中で途切れている線があります。','There is a dead-end line.'); return false;
			}

			return true;
		};

		ans.checkdir4BorderAns = function(){
			var result = true;
			for(var c=0;c<bd.cellmax;c++){
				if(bd.isValidNum(c) && this.checkdir4Border1(c)!=bd.QnC(c)){
					if(this.inAutoCheck){ return false;}
					bd.sErC([c],1);
					result = false;
				}
			}
			return result;
		};
		ans.checkdir4Border1 = function(cc){
			var cnt=0, bx=bd.cell[cc].bx, by=bd.cell[cc].by;
			if( by===bd.minby+1 || bd.isBorder(bd.bnum(bx  ,by-1)) ){ cnt++;}
			if( by===bd.maxby-1 || bd.isBorder(bd.bnum(bx  ,by+1)) ){ cnt++;}
			if( bx===bd.minbx+1 || bd.isBorder(bd.bnum(bx-1,by  )) ){ cnt++;}
			if( bx===bd.maxby-1 || bd.isBorder(bd.bnum(bx+1,by  )) ){ cnt++;}
			return cnt;
		};
	}
};
