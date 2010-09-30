//
// パズル固有スクリプト部 たすくえあ版 tasquare.js v3.3.2
//
Puzzles.tasquare = function(){ };
Puzzles.tasquare.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}
		if(!k.qrows){ k.qrows = 10;}

		k.isInputHatena   = true;
		k.BlackCell       = true;
		k.NumberIsWhite   = true;
		k.checkBlackCell  = true;
		k.checkWhiteCell  = true;

		k.ispzprv3ONLY    = true;

		base.setFloatbgcolor("rgb(64, 64, 64)");
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
			kp.kpgenerate = function(mode){
				this.inputcol('num','knum0','0','0');
				this.inputcol('num','knum1','1','1');
				this.inputcol('num','knum2','2','2');
				this.inputcol('num','knum3','3','3');
				this.insertrow();
				this.inputcol('num','knum4','4','4');
				this.inputcol('num','knum5','5','5');
				this.inputcol('num','knum6','6','6');
				this.inputcol('num','knum7','7','7');
				this.insertrow();
				this.inputcol('num','knum8','8','8');
				this.inputcol('num','knum9','9','9');
				this.inputcol('num','knum_',' ',' ');
				this.inputcol('num','knum.','-','□');
				this.insertrow();
			};
			kp.generate(kp.ORIGINAL, true, false);
			kp.kpinput = function(ca){
				kc.key_inputqnum(ca);
			};
		}
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_LIGHT;
		pc.fontsizeratio = 0.85;

		pc.paint = function(){
			this.drawBGCells();
			this.drawDotCells(false);
			this.drawGrid();
			this.drawBlackCells();

			this.drawCellSquare();

			this.drawNumbers();

			this.drawChassis();

			this.drawTarget();
		};

		pc.drawCellSquare = function(){
			this.vinc('cell_square', 'crispEdges');

			var mgnw = this.cw*0.1;
			var mgnh = this.ch*0.1;
			var header = "c_sq_";

			var clist = this.range.cells;
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				if(bd.cell[c].qnum!==-1){
					g.lineWidth = 1;
					g.strokeStyle = "black";
					g.fillStyle = (bd.cell[c].error===1 ? this.errbcolor1 : "white");
					if(this.vnop(header+c,this.FILL)){
						g.shapeRect(bd.cell[c].px+mgnw+1, bd.cell[c].py+mgnh+1, this.cw-mgnw*2-1, this.ch-mgnh*2-1);
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

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeCellQnumAns();
		};
		fio.encodeData = function(){
			this.encodeCellQnumAns();
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			var binfo = area.getBCellInfo();
			if( !this.checkAllArea(binfo, f_true, function(w,h,a,n){ return (w*h==a && w==h);} ) ){
				this.setAlert('正方形でない黒マスのカタマリがあります。','A mass of black cells is not regular rectangle.'); return false;
			}

			if( !this.checkOneArea( area.getWCellInfo() ) ){
				this.setAlert('白マスが分断されています。','White cells are devided.'); return false;
			}

			if( !this.checkNumberSquare(binfo,true) ){
				this.setAlert('数字とそれに接する黒マスの大きさの合計が一致しません。','Sum of the adjacent masses of black cells is not equal to the number.'); return false;
			}

			if( !this.checkNumberSquare(binfo,false) ){
				this.setAlert('数字のない□に黒マスが接していません。','No black cells are adjacent to square mark without numbers.'); return false;
			}

			return true;
		};

		ans.checkNumberSquare = function(binfo, flag){
			var result = true;
			for(var c=0;c<bd.cellmax;c++){
				if((flag?(bd.QnC(c)<0):(bd.QnC(c)!==-2))){ continue;}
				var clist=[];
				if(bd.isBlack(bd.up(c))){ clist = clist.concat(binfo.room[binfo.id[bd.up(c)]].idlist);}
				if(bd.isBlack(bd.dn(c))){ clist = clist.concat(binfo.room[binfo.id[bd.dn(c)]].idlist);}
				if(bd.isBlack(bd.lt(c))){ clist = clist.concat(binfo.room[binfo.id[bd.lt(c)]].idlist);}
				if(bd.isBlack(bd.rt(c))){ clist = clist.concat(binfo.room[binfo.id[bd.rt(c)]].idlist);}

				if(flag?(clist.length!==bd.QnC(c)):(clist.length===0)){
					if(ans.inAutoCheck){ return false;}
					bd.sErC(clist,1);
					bd.sErC([c],1);
					result = false;
				}
			}
			return result;
		};
	}
};
