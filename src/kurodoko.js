//
// パズル固有スクリプト部 黒マスはどこだ版 kurodoko.js v3.4.0
//
Puzzles.kurodoko = function(){ };
Puzzles.kurodoko.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 9;}
		if(!k.qrows){ k.qrows = 9;}

		k.isInputHatena   = true;
		k.BlackCell       = true;
		k.NumberIsWhite   = true;
		k.RBBlackCell     = true;
		k.checkWhiteCell  = true;

		k.ispzprv3ONLY    = true;
		k.isKanpenExist   = true;

		base.setFloatbgcolor("rgb(127, 191, 0)");
	},
	menufix : function(){
		menu.addUseToFlags();
		menu.addRedBlockRBToFlags();
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(kc.isZ ^ pp.getVal('dispred')){ this.dispRed();}
			else if(k.editmode){ this.inputqnum();}
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

		bd.nummaxfunc = function(cc){ return k.qcols+k.qrows-1;};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_DLIGHT;
		pc.bcolor = pc.bcolor_GREEN;
		pc.setBGCellColorFunc('qsub1');

		pc.fontsizeratio = 0.85;
		pc.circleratio = [0.42, 0.42];

		pc.paint = function(){
			this.drawBGCells();
			this.drawGrid();
			this.drawBlackCells();

			this.drawCirclesAtNumber();
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

		enc.decodeKanpen = function(){
			fio.decodeCellQnum_kanpen();
		}
		enc.encodeKanpen = function(){
			fio.encodeCellQnum_kanpen();
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

		fio.kanpenOpen = function(){
			this.decodeCellQnumAns_kanpen();
		};
		fio.kanpenSave = function(){
			this.encodeCellQnumAns_kanpen();
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			if( !this.checkSideCell(function(c1,c2){ return (bd.isBlack(c1) && bd.isBlack(c2));}) ){
				this.setAlert('黒マスがタテヨコに連続しています。','Black cells are adjacent.'); return false;
			}

			if( !this.checkOneArea( bd.areas.getWCellInfo() ) ){
				this.setAlert('白マスが分断されています。','White cells are devided.'); return false;
			}

			if( !this.checkCellNumber() ){
				this.setAlert('数字と黒マスにぶつかるまでの4方向のマスの合計が違います。','The number and the sum of the coutinuous white cells of four direction is different.'); return false;
			}

			return true;
		};

		ans.checkCellNumber = function(){
			var result = true;
			for(var cc=0;cc<bd.cellmax;cc++){
				if(!bd.isValidNum(cc)){ continue;}

				var tx, ty, list = [cc];
				tx = bd.cell[cc].bx-2; ty = bd.cell[cc].by;
				while(tx>bd.minbx){ var c=bd.cnum(tx,ty); if(bd.isWhite(c)){ list.push(c); tx-=2;} else{ break;} }
				tx = bd.cell[cc].bx+2; ty = bd.cell[cc].by;
				while(tx<bd.maxbx){ var c=bd.cnum(tx,ty); if(bd.isWhite(c)){ list.push(c); tx+=2;} else{ break;} }
				tx = bd.cell[cc].bx; ty = bd.cell[cc].by-2;
				while(ty>bd.minby){ var c=bd.cnum(tx,ty); if(bd.isWhite(c)){ list.push(c); ty-=2;} else{ break;} }
				tx = bd.cell[cc].bx; ty = bd.cell[cc].by+2;
				while(ty<bd.maxby){ var c=bd.cnum(tx,ty); if(bd.isWhite(c)){ list.push(c); ty+=2;} else{ break;} }

				if(bd.QnC(cc)!=list.length){
					if(this.inAutoCheck){ return false;}
					bd.sErC(list,1);
					result = false;
				}
			}
			return result;
		};
	}
};
