//
// パズル固有スクリプト部 ＬＩＴＳ版 lits.js v3.3.2
//
Puzzles.lits = function(){ };
Puzzles.lits.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}
		if(!k.qrows){ k.qrows = 10;}

		k.isborder = 1;

		k.hasroom         = true;
		k.BlackCell       = true;
		k.checkBlackCell  = true;

		k.isKanpenExist   = true;

		base.setTitle("ＬＩＴＳ","LITS");
		base.setFloatbgcolor("rgb(64, 64, 64)");

		enc.pidKanpen = 'lits';
	},
	menufix : function(){
		menu.addUseToFlags();
		menu.addRedBlockToFlags();
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(kc.isZ ^ pp.getVal('dispred')){ this.dispRed();}
			else if(k.editmode) this.inputborder();
			else if(k.playmode) this.inputcell();
		};
		mv.mouseup = function(){ };
		mv.mousemove = function(){
			if     (k.editmode) this.inputborder();
			else if(k.playmode) this.inputcell();
		};

		// キーボード入力系
		kc.keyinput = function(ca){ if(ca=='z' && !this.keyPressed){ this.isZ=true; }};
		kc.keyup    = function(ca){ if(ca=='z'){ this.isZ=false;}};
		kc.isZ = false;
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = "rgb(48, 48, 48)";
		pc.cellcolor = "rgb(96, 96, 96)";
		pc.setBGCellColorFunc('qans2');

		pc.paint = function(){
			this.drawBGCells();
			this.drawDotCells(false);
			this.drawGrid();

			this.drawBorders();

			this.drawChassis();
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			var oldflag = ((type===0 && this.checkpflag("d"))||(type===1 && !this.checkpflag("c")));

			if(!oldflag){ this.decodeBorder();  }
			else        { this.decodeLITS_old();}
		};
		enc.pzlexport = function(type){
			if(type==1){ this.outpflag='c';}
			this.encodeBorder();
		};

		enc.decodeKanpen = function(){
			fio.decodeAreaRoom();
		};
		enc.encodeKanpen = function(){
			fio.encodeAreaRoom();
		};

		enc.decodeLITS_old = function(){
			var bstr = this.outbstr;
			for(var id=0;id<bd.bdmax;id++){
				var cc1 = bd.border[id].cellcc[0], cc2 = bd.border[id].cellcc[1];
				if(cc1!==null && cc2!==null && bstr.charAt(cc1)!=bstr.charAt(cc2)){ bd.border[id].ques = 1;}
			}
			this.outbstr = bstr.substr(bd.cellmax);
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeAreaRoom();
			this.decodeCellAns();
		};
		fio.encodeData = function(){
			this.encodeAreaRoom();
			this.encodeCellAns();
		};

		fio.kanpenOpen = function(){
			this.decodeAreaRoom();
			this.decodeCellAns();
		};
		fio.kanpenSave = function(){
			this.encodeAreaRoom();
			this.encodeCellAns();
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			if( !this.check2x2Block( bd.isBlack ) ){
				this.setAlert('2x2の黒マスのかたまりがあります。', 'There is a 2x2 block of black cells.'); return false;
			}

			var rinfo = area.getRoomInfo();
			if( !this.checkBlackCellInArea(rinfo, function(a){ return (a<=4);}) ){
				this.setAlert('５マス以上の黒マスがある部屋が存在します。', 'A room has five or more black cells.'); return false;
			}

			if( !this.checkSeqBlocksInRoom() ){
				this.setAlert('1つの部屋に入る黒マスが2つ以上に分裂しています。', 'Black cells are devided in one room.'); return false;
			}

			if( !this.checkTetromino(rinfo) ){
				this.setAlert('同じ形のテトロミノが接しています。', 'Some Tetrominos that are the same shape are Adjacent.'); return false;
			}

			if( !this.checkOneArea( area.getBCellInfo() ) ){
				this.setAlert('黒マスが分断されています。', 'Black cells are not continued.'); return false;
			}

			if( !this.checkBlackCellInArea(rinfo, function(a){ return (a>0);}) ){
				this.setAlert('黒マスがない部屋があります。', 'A room has no black cells.'); return false;
			}

			if( !this.checkBlackCellInArea(rinfo, function(a){ return (a>=4);}) ){
				this.setAlert('黒マスのカタマリが４マス未満の部屋があります。', 'A room has three or less black cells.'); return false;
			}

			return true;
		};

		ans.checkTetromino = function(rinfo){
			var tinfo = new AreaInfo(), result = true;
			for(var c=0;c<bd.cellmax;c++){ tinfo.id[c]=null;}
			for(var r=1;r<=rinfo.max;r++){
				var bcells = [];
				for(var i=0;i<rinfo.room[r].idlist.length;i++){ if(bd.isBlack(rinfo.room[r].idlist[i])){ bcells.push(rinfo.room[r].idlist[i]);} }
				if(bcells.length==4){
					bcells.sort(function(a,b){ return a-b;});
					var bx0=bd.cell[bcells[0]].bx, by0=bd.cell[bcells[0]].by, value=0;
					for(var i=1;i<bcells.length;i++){ value += (((bd.cell[bcells[i]].by-by0)>>1)*10+((bd.cell[bcells[i]].bx-bx0)>>1));}
					switch(value){
						case 13: case 15: case 27: case 31: case 33: case 49: case 51:
							for(var i=0;i<bcells.length;i++){ tinfo.id[bcells[i]]="L";} break;
						case 6: case 60:
							for(var i=0;i<bcells.length;i++){ tinfo.id[bcells[i]]="I";} break;
						case 14: case 30: case 39: case 41:
							for(var i=0;i<bcells.length;i++){ tinfo.id[bcells[i]]="T";} break;
						case 20: case 24: case 38: case 42:
							for(var i=0;i<bcells.length;i++){ tinfo.id[bcells[i]]="S";} break;
					}
				}
			}
			var dinfo = new AreaInfo();
			for(var c=0;c<bd.cellmax;c++){ dinfo.id[c]=(tinfo.id[c]!==null?0:null);}
			for(var c=0;c<bd.cellmax;c++){
				if(dinfo.id[c]!=0){ continue;}
				dinfo.max++;
				dinfo.room[dinfo.max] = {idlist:[]};
				this.st0(dinfo, c, dinfo.max, tinfo);
			}
			for(var r=1;r<=dinfo.max;r++){
				if(dinfo.room[r].idlist.length<=4){ continue;}
				if(this.inAutoCheck){ return false;}
				bd.sErC(dinfo.room[r].idlist,2);
				result = false;
			}
			return result;
		};
		ans.st0 = function(dinfo,c,id,tinfo){
			if(dinfo.id[c]!=0){ return;}
			dinfo.id[c] = id;
			dinfo.room[id].idlist.push(c);
			var func = function(cc){ return (cc!==null && tinfo.id[c]==tinfo.id[cc]);};
			if( func(bd.up(c)) ){ this.st0(dinfo, bd.up(c), id, tinfo);}
			if( func(bd.dn(c)) ){ this.st0(dinfo, bd.dn(c), id, tinfo);}
			if( func(bd.lt(c)) ){ this.st0(dinfo, bd.lt(c), id, tinfo);}
			if( func(bd.rt(c)) ){ this.st0(dinfo, bd.rt(c), id, tinfo);}
			return;
		};
	}
};
