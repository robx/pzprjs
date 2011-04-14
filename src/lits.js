//
// パズル固有スクリプト部 ＬＩＴＳ版 lits.js v3.4.0
//
pzprv3.custom.lits = {
//---------------------------------------------------------
// フラグ
Flags:{
	setting : function(pid){
		this.qcols = 10;
		this.qrows = 10;

		this.isborder = 1;

		this.hasroom         = true;
		this.BlackCell       = true;
		this.checkBlackCell  = true;

		this.floatbgcolor = "rgb(64, 64, 64)";
	}
},

//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mousedown : function(){
		if(kc.isZ ^ pp.getVal('dispred')){ this.dispRed();}
		else if(k.editmode){ this.inputborder();}
		else if(k.playmode){ this.inputcell();}
	},
	mousemove : function(){
		if     (k.editmode){ this.inputborder();}
		else if(k.playmode){ this.inputcell();}
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	keyinput : function(ca){ /* 空関数 */ }
},

//---------------------------------------------------------
// 盤面管理系
Board:{
	getTetrominoInfo : function(rinfo){
		var tinfo = new pzprv3.core.AreaInfo(); /* 各セルに入る黒マスのテトロミノの形が入る */
		for(var c=0;c<this.cellmax;c++){ tinfo.id[c]=null;}
		for(var r=1;r<=rinfo.max;r++){
			var bcells = [];
			for(var i=0;i<rinfo.room[r].idlist.length;i++){ if(this.isBlack(rinfo.room[r].idlist[i])){ bcells.push(rinfo.room[r].idlist[i]);} }
			if(bcells.length==4){
				bcells.sort(function(a,b){ return a-b;});
				var bx0=this.cell[bcells[0]].bx, by0=this.cell[bcells[0]].by, value=0;
				for(var i=1;i<bcells.length;i++){ value += (((this.cell[bcells[i]].by-by0)>>1)*10+((this.cell[bcells[i]].bx-bx0)>>1));}
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
		var dinfo = new pzprv3.core.AreaInfo(); /* 同じ形に含まれる黒マスのつながり情報 */
		for(var c=0;c<this.cellmax;c++){ dinfo.id[c]=(tinfo.id[c]!==null?0:null);}
		for(var c=0;c<this.cellmax;c++){
			if(dinfo.id[c]!=0){ continue;}
			dinfo.max++;
			dinfo.room[dinfo.max] = {idlist:[]};
			this.st0(dinfo, c, dinfo.max, tinfo);
		}
		return dinfo;
	},
	st0 : function(dinfo,c,id,tinfo){
		if(dinfo.id[c]!=0){ return;}
		dinfo.id[c] = id;
		dinfo.room[id].idlist.push(c);
		var func = function(cc){ return (cc!==null && tinfo.id[c]==tinfo.id[cc]);};
		if( func(this.up(c)) ){ this.st0(dinfo, this.up(c), id, tinfo);}
		if( func(this.dn(c)) ){ this.st0(dinfo, this.dn(c), id, tinfo);}
		if( func(this.lt(c)) ){ this.st0(dinfo, this.lt(c), id, tinfo);}
		if( func(this.rt(c)) ){ this.st0(dinfo, this.rt(c), id, tinfo);}
		return;
	}
},

Menu:{
	menufix : function(){
		this.addUseToFlags();
		this.addRedBlockToFlags();
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	setColors : function(){
		this.gridcolor = "rgb(48, 48, 48)";
		this.cellcolor = "rgb(96, 96, 96)";
		this.setBGCellColorFunc('qans2');
	},
	paint : function(){
		this.drawBGCells();
		this.drawDotCells(false);
		this.drawGrid();

		this.drawBorders();

		this.drawChassis();
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
			var oldflag = ((type===0 && this.checkpflag("d"))||(type===1 && !this.checkpflag("c")));

			if(!oldflag){ this.decodeBorder();  }
			else        { this.decodeLITS_old();}
	},
	pzlexport : function(type){
			if(type==1){ this.outpflag='c';}
			this.encodeBorder();
	},

	decodeKanpen : function(){
			fio.decodeAreaRoom();
	},
	encodeKanpen : function(){
			fio.encodeAreaRoom();
	},

	decodeLITS_old : function(){
		var bstr = this.outbstr;
		for(var id=0;id<bd.bdmax;id++){
			var cc1 = bd.border[id].cellcc[0], cc2 = bd.border[id].cellcc[1];
			if(cc1!==null && cc2!==null && bstr.charAt(cc1)!=bstr.charAt(cc2)){ bd.border[id].ques = 1;}
		}
		this.outbstr = bstr.substr(bd.cellmax);
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeAreaRoom();
		this.decodeCellAns();
	},
	encodeData : function(){
		this.encodeAreaRoom();
		this.encodeCellAns();
	},

	kanpenOpen : function(){
		this.decodeAreaRoom();
		this.decodeCellAns();
	},
	kanpenSave : function(){
		this.encodeAreaRoom();
		this.encodeCellAns();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.check2x2Block( function(c){ return bd.isBlack(c);} ) ){
			this.setAlert('2x2の黒マスのかたまりがあります。', 'There is a 2x2 block of black cells.'); return false;
		}

		var rinfo = bd.areas.getRoomInfo();
		if( !this.checkBlackCellInArea(rinfo, function(a){ return (a<=4);}) ){
			this.setAlert('５マス以上の黒マスがある部屋が存在します。', 'A room has five or more black cells.'); return false;
		}

		if( !this.checkSeqBlocksInRoom() ){
			this.setAlert('1つの部屋に入る黒マスが2つ以上に分裂しています。', 'Black cells are devided in one room.'); return false;
		}

		if( !this.checkTetromino(rinfo) ){
			this.setAlert('同じ形のテトロミノが接しています。', 'Some Tetrominos that are the same shape are Adjacent.'); return false;
		}

		if( !this.checkOneArea( bd.areas.getBCellInfo() ) ){
			this.setAlert('黒マスが分断されています。', 'Black cells are not continued.'); return false;
		}

		if( !this.checkBlackCellInArea(rinfo, function(a){ return (a>0);}) ){
			this.setAlert('黒マスがない部屋があります。', 'A room has no black cells.'); return false;
		}

		if( !this.checkBlackCellInArea(rinfo, function(a){ return (a>=4);}) ){
			this.setAlert('黒マスのカタマリが４マス未満の部屋があります。', 'A room has three or less black cells.'); return false;
		}

		return true;
	},

	checkTetromino : function(rinfo){
		var dinfo = bd.getTetrominoInfo(rinfo), result = true;
		for(var r=1;r<=dinfo.max;r++){
			if(dinfo.room[r].idlist.length<=4){ continue;}
			if(this.inAutoCheck){ return false;}
			bd.sErC(dinfo.room[r].idlist,2);
			result = false;
		}
		return result;
	}
}
};
