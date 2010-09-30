//
// パズル固有スクリプト部 四角に切れ版 shikaku.js v3.3.2
//
Puzzles.shikaku = function(){ };
Puzzles.shikaku.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}
		if(!k.qrows){ k.qrows = 10;}

		k.isborder = 1;

		k.hasroom         = true;
		k.isInputHatena   = true;

		k.ispzprv3ONLY    = true;
		k.isKanpenExist   = true;

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
		pc.fontcolor = pc.fontErrcolor = "white";
		pc.setBorderColorFunc('qans');

		pc.circledcolor = "black";
		pc.fontsizeratio = 0.85;
		pc.circleratio = [0, 0.40];

		pc.paint = function(){
			this.drawBGCells();
			this.drawDashedGrid();
			this.drawBorders();

			this.drawCirclesAtNumber_shikaku();
			this.drawNumbers();
			this.drawBorderQsubs();

			this.drawChassis();

			this.drawTarget();
		};

		pc.drawCirclesAtNumber_shikaku = function(){
			this.vinc('cell_circle', 'auto');

			var rsize2 = this.cw*this.circleratio[1];
			var header = "c_cir_";
			var clist = this.range.cells;
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				if(bd.cell[c].qnum!=-1){
					g.fillStyle = (bd.cell[c].error===1 ? this.errcolor1 : this.cellcolor);
					if(this.vnop(header+c,this.FILL)){
						g.fillCircle(bd.cell[c].cpx, bd.cell[c].cpy, rsize2);
					}
				}
				else{ this.vhide([header+c]);}
			}
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

		enc.decodeKanpen = function(){
			fio.decodeCellQnum_kanpen();
		};
		enc.encodeKanpen = function(){
			fio.encodeCellQnum_kanpen();
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

		fio.kanpenOpen = function(){
			this.decodeCellQnum_kanpen();
			this.decodeAnsSquareRoom();
		};
		fio.kanpenSave = function(){
			this.encodeCellQnum_kanpen();
			this.encodeAnsSquareRoom();
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			var rinfo = area.getRoomInfo();
			if( !this.checkNoNumber(rinfo) ){
				this.setAlert('数字の入っていない領域があります。','An area has no numbers.'); return false;
			}

			if( !this.checkDoubleNumber(rinfo) ){
				this.setAlert('1つの領域に2つ以上の数字が入っています。','An area has plural numbers.'); return false;
			}

			if( !this.checkAreaRect(rinfo) ){
				this.setAlert('四角形ではない領域があります。','An area is not rectangle.'); return false;
			}

			if( !this.checkNumberAndSize(rinfo) ){
				this.setAlert('数字と領域の大きさが違います。','The size of the area is not equal to the number.'); return false;
			}

			if( !this.checkLcntCross(1,0) ){
				this.setAlert('途切れている線があります。','There is a dead-end line.'); return false;
			}

			return true;
		};
	}
};
