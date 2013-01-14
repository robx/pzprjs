//
// パズル固有スクリプト部 クロット版 kurotto.js v3.3.6
//
Puzzles.kurotto = function(){ };
Puzzles.kurotto.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}
		if(!k.qrows){ k.qrows = 10;}

		k.dispzero        = true;
		k.isInputHatena   = true;
		k.BlackCell       = true;
		k.NumberIsWhite   = true;
		k.checkBlackCell  = true;

		k.ispzprv3ONLY    = true;

		base.setFloatbgcolor("rgb(127, 191, 0)");
	},
	menufix : function(){
		menu.addUseToFlags();

		pp.addCheck('circolor','setting',false,'数字をグレーにする','Set Grey Color');
		pp.setLabel('circolor', '正しい数字をグレーにする', 'Grey if the number is correct.');
		pp.funcs['circolor'] = function(){ pc.paintAll();};
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

		bd.nummaxfunc = function(cc){ var max=k.qcols*k.qrows-1; return (max<=255?max:255);};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_DLIGHT;
		pc.bcolor    = "silver";
		pc.setBGCellColorFunc('qsub1');

		pc.fontsizeratio = 0.85;
		pc.circleratio = [0.42, 0.42];

		pc.paint = function(){
			var cells_sv;
			
			this.drawDotCells(false);
			this.drawGrid();
			this.drawBlackCells();

			this.drawCirclesAtNumber_kurotto();
			this.drawNumbers();

			this.drawChassis();

			this.drawTarget();
		};
		
		// 背景色をつけるため
		pc.drawCirclesAtNumber_kurotto = function(c){
			this.vinc('cell_circle', 'auto');

			if(!pp.getVal('circolor')){
				var clist = this.range.cells;
				for(var i=0;i<clist.length;i++){ this.drawCircle1AtNumber(clist[i]);}
			}
			else{
				var clist = bd.cellinside(bd.minbx, bd.minby, bd.maxbx, bd.maxby);
				var binfo = area.getBCellInfo();
				for(var i=0;i<clist.length;i++){ this.drawCircle1AtNumber_kurotto(binfo, clist[i]);}
			}
		};
		pc.drawCircle1AtNumber_kurotto = function(cinfo,c){
			if(c===null){ return;}

			var rsize = this.cw*0.44;
			var header = "c_cir_";
			var qn = bd.cell[c].qnum;

			if(qn!=-1){
				g.lineWidth   = this.cw*0.05;
				g.strokeStyle = this.cellcolor;

				var cnt = (qn>=0 ? ans.countAdjacentCells_kurotto(cinfo,c) : -2);
				if (pp.getVal('circolor') && qn===cnt)
											 { g.fillStyle = this.bcolor;      }
				else if(bd.cell[c].error===1){ g.fillStyle = this.errbcolor1;  }
				else                         { g.fillStyle = this.circledcolor;}

				if(this.vnop(header+c,this.FILL)){
					g.shapeCircle(bd.cell[c].cpx, bd.cell[c].cpy, rsize);
				}
			}
			else{ this.vhide([header+c]);}
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

			if( !this.checkCellNumber_kurotto( area.getBCellInfo() ) ){
				this.setAlert('隣り合う黒マスの個数の合計が数字と違います。','The number is not equal to sum of adjacent masses of black cells.'); return false;
			}

			return true;
		};

		ans.checkCellNumber_kurotto = function(cinfo){
			var result = true;
			for(var c=0;c<bd.cellmax;c++){
				if(!bd.isValidNum(c)){ continue;}
				if(bd.QnC(c)!=this.countAdjacentCells_kurotto(cinfo,c)){
					if(this.inAutoCheck){ return false;}
					bd.sErC([c],1);
					result = false;
				}
			}
			return result;
		};
		ans.countAdjacentCells_kurotto = function(cinfo,c){
			var cc, cnt=0, roomlist=[], clist=[];
			cc=bd.up(c); if(bd.isBlack(cc)){ clist.push(cc);}
			cc=bd.dn(c); if(bd.isBlack(cc)){ clist.push(cc);}
			cc=bd.lt(c); if(bd.isBlack(cc)){ clist.push(cc);}
			cc=bd.rt(c); if(bd.isBlack(cc)){ clist.push(cc);}
			for(var i=0;i<clist.length;i++){
				var roomid=cinfo.id[clist[i]];
				if(roomid!==null){
					for(var j=0;j<roomlist.length;j++){
						if(roomlist[j]===roomid){ roomid=null; break;}
					}
					if(roomid!==null){
						cnt += cinfo.room[roomid].idlist.length
						roomlist.push(roomid);
					}
				}
			}
			return cnt;
		};
	}
};
