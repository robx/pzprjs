//
// パズル固有スクリプト部 波及効果版 ripple.js v3.3.2
//
Puzzles.ripple = function(){ };
Puzzles.ripple.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}
		if(!k.qrows){ k.qrows = 10;}

		k.isborder = 1;

		k.hasroom         = true;
		k.isDispHatena    = true;
		k.isInputHatena   = true;
		k.isAnsNumber     = true;

		k.ispzprv3ONLY    = true;
		k.isKanpenExist   = true;

		base.setTitle("波及効果","Ripple Effect");
			base.setExpression("　キーボードやマウスで数字が入力できます。",
							   " It is available to input number by keybord or mouse");
		base.setFloatbgcolor("rgb(64, 64, 64)");

		enc.pidKanpen = 'hakyukoka';
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
			if(k.editmode && this.btn.Left) this.inputborder();
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum(ca);
		};

		kp.generate(0, true, true);
		kp.kpinput = function(ca){ kc.key_inputqnum(ca);};

		area.resetArea();
		bd.nummaxfunc = function(cc){ return area.getCntOfRoomByCell(cc);};
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

		enc.decodeKanpen = function(){
			fio.decodeAreaRoom();
			fio.decodeCellQnum_kanpen();
		};
		enc.encodeKanpen = function(){
			fio.encodeAreaRoom();
			fio.encodeCellQnum_kanpen();
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

		fio.kanpenOpen = function(){
			this.decodeAreaRoom();
			this.decodeCellQnum_kanpen();
			this.decodeCellAnum_kanpen();
		};
		fio.kanpenSave = function(){
			this.encodeAreaRoom();
			this.encodeCellQnum_kanpen();
			this.encodeCellAnum_kanpen();
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			if( !this.checkDifferentNumberInRoom(area.getRoomInfo(), bd.getNum) ){
				this.setAlert('1つの部屋に同じ数字が複数入っています。','A room has two or more same numbers.'); return false;
			}

			if( !this.checkRippleNumber() ){
				this.setAlert('数字よりもその間隔が短いところがあります。','The gap of the same kind of number is smaller than the number.'); return false;
			}

			if( !this.checkNoNumCell() ){
				this.setAlert('数字の入っていないマスがあります。','There is an empty cell.'); return false;
			}

			return true;
		};
		ans.check1st = function(){ return this.checkNoNumCell();};

		ans.checkRippleNumber = function(){
			var result = true;
			for(var c=0;c<bd.cellmax;c++){
				var num=bd.getNum(c), bx=bd.cell[c].bx, by=bd.cell[c].by;
				if(num<=0){ continue;}
				for(var i=2;i<=num*2;i+=2){
					var tc = bd.cnum(bx+i,by);
					if(tc!==null && bd.getNum(tc)===num){
						if(this.inAutoCheck){ return false;}
						bd.sErC([c,tc],1);
						result = false;
					}
				}
				for(var i=2;i<=num*2;i+=2){
					var tc = bd.cnum(bx,by+i);
					if(tc!==null && bd.getNum(tc)===num){
						if(this.inAutoCheck){ return false;}
						bd.sErC([c,tc],1);
						result = false;
					}
				}
			}
			return result;
		};
	}
};
