//
// パズル固有スクリプト部 ナンバーリンク版 numlin.js v3.3.2
//
Puzzles.numlin = function(){ };
Puzzles.numlin.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}
		if(!k.qrows){ k.qrows = 10;}

		k.isborder = 1;

		k.isCenterLine    = true;
		k.isDispHatena    = true;
		k.isInputHatena   = true;

		k.ispzprv3ONLY    = true;
		k.isKanpenExist   = true;

		base.setFloatbgcolor("rgb(96, 96, 96)");

		enc.pidKanpen= 'numberlink';
	},
	menufix : function(){
		menu.addRedLineToFlags();
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(kc.isZ ^ pp.getVal('dispred')){ this.dispRedLine(); return;}
			if(k.editmode){ this.inputqnum();}
			else if(k.playmode){
				if(this.btn.Left) this.inputLine();
				else if(this.btn.Right) this.inputpeke();
			}
		};
		mv.mouseup = function(){
			if(k.playmode && this.btn.Left && this.notInputted()){
				this.inputpeke();
			}
		};
		mv.mousemove = function(){
			if(k.playmode){
				if(this.btn.Left) this.inputLine();
				else if(this.btn.Right) this.inputpeke();
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
		pc.gridcolor = pc.gridcolor_LIGHT;

		pc.paint = function(){
			this.drawBGCells();
			this.drawGrid();

			this.drawPekes(0);
			this.drawLines();

			this.drawCellSquare();
			this.drawNumbers();

			this.drawChassis();

			this.drawTarget();
		};

		pc.drawCellSquare = function(){
			this.vinc('cell_number_base', 'crispEdges');

			var mgnw = this.cw*0.15;
			var mgnh = this.ch*0.15;
			var header = "c_sq_";

			var clist = this.range.cells;
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				if(bd.cell[c].qnum!==-1){
					if     (bd.cell[c].error===1){ g.fillStyle = this.errbcolor1;}
					else if(bd.cell[c].error===2){ g.fillStyle = this.errbcolor2;}
					else                         { g.fillStyle = "white";}

					if(this.vnop(header+c,this.FILL)){
						g.fillRect(bd.cell[c].px+mgnw+1, bd.cell[c].py+mgnh+1, this.cw-mgnw*2-1, this.ch-mgnh*2-1);
					}
				}
				else{ this.vhide(header+c);}
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
			this.decodeBorderLine();
		};
		fio.encodeData = function(){
			this.encodeCellQnum();
			this.encodeBorderLine();
		};

		fio.kanpenOpen = function(){
			this.decodeCellQnum_kanpen();
			this.decodeBorderLine();
		};
		fio.kanpenSave = function(){
			this.encodeCellQnum_kanpen();
			this.encodeBorderLine();
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){
			this.performAsLine = true;

			if( !this.checkLcntCell(3) ){
				this.setAlert('分岐している線があります。','There is a branch line.'); return false;
			}
			if( !this.checkLcntCell(4) ){
				this.setAlert('線が交差しています。','There is a crossing line.'); return false;
			}

			var linfo = line.getLareaInfo();
			if( !this.checkTripleNumber(linfo) ){
				this.setAlert('3つ以上の数字がつながっています。','Three or more numbers are connected.'); return false;
			}

			if( !this.checkSameObjectInRoom(linfo, bd.getNum) ){
				this.setAlert('異なる数字がつながっています。','Different numbers are connected.'); return false;
			}

			if( !this.check2Line() ){
				this.setAlert('数字の上を線が通過しています。','A line goes through a number.'); return false;
			}
			if( !this.check1Line() ){
				this.setAlert('途切れている線があります。','There is a dead-end line.'); return false;
			}
			if( !this.checkDisconnectLine(linfo) ){
				this.setAlert('数字につながっていない線があります。','A line doesn\'t connect any number.'); return false;
			}

			if( !this.checkAllCell(function(c){ return (line.lcntCell(c)==0 && bd.isNum(c));}) ){
				this.setAlert('どこにもつながっていない数字があります。','A number is not connected another number.'); return false;
			}

			return true;
		};
		ans.check1st = function(){ return true;};

		ans.check1Line = function(){ return this.checkLine(function(c){ return (line.lcntCell(c)===1 && bd.noNum(c));}); };
		ans.check2Line = function(){ return this.checkLine(function(c){ return (line.lcntCell(c)>= 2 && bd.isNum(c));}); };
		ans.checkLine = function(func){
			var result = true;
			for(var c=0;c<bd.cellmax;c++){
				if(!func(c)){ continue;}

				if(this.inAutoCheck){ return false;}
				if(result){ bd.sErBAll(2);}
				ans.setCellLineError(c,true);
				result = false;
			}
			return result;
		};
	}
};
