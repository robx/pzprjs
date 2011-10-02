//
// パズル固有スクリプト部 ＬＩＴＳ・のりのり版 lits.js v3.4.0
//
pzprv3.custom.lits = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputedit : function(){
		if(this.mousestart || this.mousemove){ this.inputborder();}
	},
	inputplay : function(){
		if(this.mousestart || this.mousemove){ this.inputcell();}
	},
	inputRed : function(){ this.dispRed();}
},

//---------------------------------------------------------
// 盤面管理系
Board:{
	isborder : 1,

	getTetrominoInfo : function(rinfo){
		var tinfo = new pzprv3.core.AreaCellInfo(this.owner); /* 各セルに入る黒マスのテトロミノの形が入る */
		for(var c=0;c<this.cellmax;c++){ tinfo.id[c]=null;}
		for(var r=1;r<=rinfo.max;r++){
			var bcells = new pzprv3.core.PieceList(this.owner), clist = rinfo.getclist(r);
			for(var i=0;i<clist.length;i++){
				var cell = clist[i];
				if(cell.isBlack()){ bcells.add(cell);}
			}
			if(bcells.length===4){
				var bx0=bcells[0].bx, by0=bcells[0].by, value=0;
				for(var i=1;i<bcells.length;i++){ value += (((bcells[i].by-by0)>>1)*10+((bcells[i].bx-bx0)>>1));}
				switch(value){
					case 13: case 15: case 27: case 31: case 33: case 49: case 51:
						for(var i=0;i<bcells.length;i++){ tinfo.id[bcells[i].id]="L";} break;
					case 6: case 60:
						for(var i=0;i<bcells.length;i++){ tinfo.id[bcells[i].id]="I";} break;
					case 14: case 30: case 39: case 41:
						for(var i=0;i<bcells.length;i++){ tinfo.id[bcells[i].id]="T";} break;
					case 20: case 24: case 38: case 42:
						for(var i=0;i<bcells.length;i++){ tinfo.id[bcells[i].id]="S";} break;
				}
			}
		}
		return this.getBlockInfo(tinfo);
	},
	getBlockInfo : function(tinfo){
		var dinfo = new pzprv3.core.AreaCellInfo(this.owner); /* 同じ部屋に含まれる黒マスのつながり情報 */
		for(var fc=0;fc<this.cellmax;fc++){ dinfo.id[fc]=(tinfo.id[fc]!==null?0:null);}
		for(var fc=0;fc<this.cellmax;fc++){
			if(!dinfo.emptyCell(this.cell[fc])){ continue;}
			dinfo.addRoom();

			var stack=[this.cell[fc]];
			while(stack.length>0){
				var cell = stack.pop();
				if(!dinfo.emptyCell(cell)){ continue;}
				dinfo.addCell(cell);
				var list = cell.getdir4clist();
				for(var i=0;i<list.length;i++){
					if(tinfo.getRoomID(cell)==tinfo.getRoomID(list[i][0])){ stack.push(list[i][0]);}
				}
			}
		}
		return dinfo;
	}
},

AreaManager:{
	hasroom        : true,
	checkBlackCell : true
},

Menu:{
	menufix : function(){
		this.addUseToFlags();
		if(this.owner.pid==='lits'){
			this.addRedBlockToFlags();
		}
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	setColors : function(){
		if(this.owner.pid==='lits'){
			this.gridcolor = "rgb(48, 48, 48)";
			this.cellcolor = "rgb(96, 96, 96)";
			this.setBGCellColorFunc('qans2');
		}
		else if(this.owner.pid==='norinori'){
			this.gridcolor = this.gridcolor_LIGHT;
			this.bcolor = "rgb(96, 224, 160)";
			this.bbcolor = "rgb(96, 127, 127)";
			this.setBGCellColorFunc('qsub1');
		}
	},
	paint : function(){
		this.drawBGCells();
		if(this.owner.pid==='lits'){ this.drawDotCells(false);}
		this.drawGrid();
		if(this.owner.pid==='norinori'){ this.drawBlackCells();}

		this.drawBorders();

		this.drawChassis();

		if(this.owner.pid==='norinori'){ this.drawBoxBorders(false);}
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		var oldflag = ((type===0 && this.checkpflag("d"))||(type===1 && !this.checkpflag("c")));
		if(!oldflag || this.owner.pid==='norinori'){
			this.decodeBorder();
		}
		else{
			this.decodeLITS_old();
		}
	},
	pzlexport : function(type){
		if(type==0 || this.owner.pid==='norinori'){
			this.encodeBorder();
		}
		else{
			this.outpflag='c';
			this.encodeBorder();
		}
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
			var border = bd.border[id];
			var cell1 = border.sidecell[0], cell2 = border.sidecell[1];
			if(!cell1.isnull && !cell2.isnull && bstr.charAt(cell1.id)!=bstr.charAt(cell2.id)){ border.ques = 1;}
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
		if     (this.owner.pid==='lits')    { return this.checkAns_lits();}
		else if(this.owner.pid==='norinori'){ return this.checkAns_norinori();}
		return true;
	},

	checkAns_lits : function(){

		if( !this.check2x2Block( function(cell){ return cell.isBlack();} ) ){
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

	checkAns_norinori : function(){

		var binfo = bd.areas.getBCellInfo();
		if( !this.checkAllArea(binfo, function(w,h,a,n){ return (a<=2);} ) ){
			this.setAlert('２マスより大きい黒マスのカタマリがあります。','The size of a mass of black cells is over two.'); return false;
		}

		var rinfo = bd.areas.getRoomInfo();
		if( !this.checkBlackCellInArea(rinfo, function(a){ return (a<=2);}) ){
			this.setAlert('２マス以上の黒マスがある部屋が存在します。','A room has three or mode black cells.'); return false;
		}

		if( !this.checkAllArea(binfo, function(w,h,a,n){ return (a>=2);} ) ){
			this.setAlert('１マスだけの黒マスのカタマリがあります。','There is a single black cell.'); return false;
		}

		if( !this.checkBlackCellInArea(rinfo, function(a){ return (a!=1);}) ){
			this.setAlert('１マスしか黒マスがない部屋があります。','A room has only one black cell.'); return false;
		}

		if( !this.checkBlackCellInArea(rinfo, function(a){ return (a>0);}) ){
			this.setAlert('黒マスがない部屋があります。','A room has no black cell.'); return false;
		}

		return true;
	},

	checkTetromino : function(rinfo){
		var dinfo = bd.getTetrominoInfo(rinfo), result = true;
		for(var r=1;r<=dinfo.max;r++){
			var clist = dinfo.getclist(r);
			if(clist.length<=4){ continue;}
			if(this.inAutoCheck){ return false;}
			clist.seterr(2);
			result = false;
		}
		return result;
	}
}
};
