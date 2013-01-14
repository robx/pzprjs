//
// パズル固有スクリプト部 るっくえあ版 lookair.js v3.3.6
//
Puzzles.lookair = function(){ };
Puzzles.lookair.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}
		if(!k.qrows){ k.qrows = 10;}

		k.dispzero        = true;
		k.isDispHatena    = true;
		k.isInputHatena   = true;
		k.BlackCell       = true;
		k.checkBlackCell  = true;

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
			kp.generate(kp.ORIGINAL, true, false);
			kp.kpinput = function(ca){
				kc.key_inputqnum(ca);
			};
		}

		kp.kpgenerate = function(mode){
			this.inputcol('num','knum0','0','0');
			this.inputcol('num','knum1','1','1');
			this.inputcol('num','knum2','2','2');
			this.insertrow();
			this.inputcol('num','knum3','3','3');
			this.inputcol('num','knum4','4','4');
			this.inputcol('num','knum5','5','5');
			this.insertrow();
			this.inputcol('num','knum.','-','?');
			this.inputcol('num','knum_',' ',' ');
			this.inputcol('empty','','','');
			this.insertrow();
		};
		
		bd.minnum = 0;
		bd.maxnum = 5;
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.bcolor = pc.bcolor_GREEN;
		pc.setBGCellColorFunc('qsub1');

		pc.paint = function(){
			this.drawBGCells();
			this.drawDashedGrid();
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
			this.decodeNumber10();
		};
		enc.pzlexport = function(type){
			this.encodeNumber10();
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

			/* 自動チェック時は最初にチェックする */
			if( this.inAutoCheck && !this.checkDir5Cell( bd.isBlack ) ){
				this.setAlert('数字およびその上下左右にある黒マスの数が間違っています。','The number is not equal to the number of black cells in the cell and four adjacent cells.'); return false;
			}

			var binfo = area.getBCellInfo();
			if( !this.checkAllArea(binfo, f_true, function(w,h,a,n){ return (w*h==a && w==h);} ) ){
				this.setAlert('正方形でない黒マスのカタマリがあります。','A mass of black cells is not regular rectangle.'); return false;
			}

			if( !this.checkLookair(binfo) ){
				this.setAlert('同じ大きさの黒マスのカタマリの間に他の黒マスのカタマリがありません。','A mass of black cells can looks other same size mass of black cells.'); return false;
			}

			/* チェック時は最後にチェックする */
			if( !this.inAutoCheck && !this.checkDir5Cell( bd.isBlack ) ){
				this.setAlert('数字およびその上下左右にある黒マスの数が間違っています。','The number is not equal to the number of black cells in the cell and four adjacent cells.'); return false;
			}

			return true;
		};

		ans.checkDir5Cell = function(iscount){
			var result = true;
			for(var c=0;c<bd.cellmax;c++){
				if(!bd.isValidNum(c)){ continue;}
				var num = bd.getNum(c), count=this.countDir5Cell(c,iscount);
				if(num!=count){
					if(this.inAutoCheck){ return false;}
					bd.sErC([c],1);
					result = false;
				}
			}
			return result;
		};
		ans.countDir5Cell = function(c,func){
			if(c<0 || c>=bd.cellmax || c===null){ return 0;}
			var cnt=0, cc;
			cc=c;        if(cc!==null && func(cc)){ cnt++;}
			cc=bd.up(c); if(cc!==null && func(cc)){ cnt++;}
			cc=bd.dn(c); if(cc!==null && func(cc)){ cnt++;}
			cc=bd.lt(c); if(cc!==null && func(cc)){ cnt++;}
			cc=bd.rt(c); if(cc!==null && func(cc)){ cnt++;}
			return cnt;
		};
		
		ans.checkLookair = function(cinfo){
			var result = true;
			for(var r=1;r<=cinfo.max;r++){
				var room = cinfo.room[r].idlist;
				var d=this.getSizeOfClist(room,f_true);
				/* 相互に見る必要は無いので、上と左だけ確認する */
				for(var dir=1;dir<=3;dir+=2){
					var c, bx=d.x1, by=d.y1, iter_max=(dir===1 ? d.cols : d.rows);
					for(var i=0;i<iter_max;i++){
						switch(dir){ case 1: by=d.y1; break; case 3: bx=d.x1; break;}
						do{
							switch(dir){ case 1: by-=2; break; case 3: bx-=2; break;}
							c = bd.cnum(bx,by);
							if(bd.isBlack(c)){
								var room2 = cinfo.room[cinfo.id[c]].idlist;
								if(d.cnt === room2.length){
									if(this.inAutoCheck){ return false;}
									bd.sErC(room,1);
									bd.sErC(room2,1);
									result = false;
								}
								break;
							}
						}while(c!==null)
						switch(dir){ case 1: bx+=2; break; case 3: by+=2; break;}
					}
				}
			}
			return result;
		}
	}
};
