//
// パズル固有スクリプト部 黒マスはどこだ版 kurodoko.js v3.4.0
//
pzprv3.createCustoms('kurodoko', {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	RBBlackCell : true,

	inputedit : function(){
		if(this.mousestart){ this.inputqnum();}
	},
	inputplay : function(){
		if(this.mousestart || this.mousemove){ this.inputcell();}
	},
	inputRed : function(){ this.dispRed();}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	numberIsWhite : true,

	nummaxfunc : function(){
		return this.owner.board.qcols+this.owner.board.qrows-1;
	},
	minnum : 2
},
Board:{
	qcols : 9,
	qrows : 9
},

AreaWhiteManager:{
	enabled : true
},

Properties:{
	flag_use      : true,
	flag_redblkrb : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	hideHatena : true,

	setColors : function(){
		this.gridcolor = this.gridcolor_DLIGHT;
		this.bcolor = this.bcolor_GREEN;
		this.setBGCellColorFunc('qsub1');

		this.fontsizeratio = 0.85;
		this.circleratio = [0.42, 0.42];
	},
	paint : function(){
		this.drawBGCells();
		this.drawGrid();
		this.drawBlackCells();

		this.drawCirclesAtNumber();
		this.drawNumbers();

		this.drawChassis();

		this.drawTarget();
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		this.decodeNumber16();
	},
	pzlexport : function(type){
		this.encodeNumber16();
	},

	decodeKanpen : function(){
		this.owner.fio.decodeCellQnum_kanpen();
	},
	encodeKanpen : function(){
		this.owner.fio.encodeCellQnum_kanpen();
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCellQnum();
		this.decodeCellAns();
	},
	encodeData : function(){
		this.encodeCellQnum();
		this.encodeCellAns();
	},

	kanpenOpen : function(){
		this.decodeCellQnumAns_kanpen();
	},
	kanpenSave : function(){
		this.encodeCellQnumAns_kanpen();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.checkSideCell(function(cell1,cell2){ return (cell1.isBlack() && cell2.isBlack());}) ){
			this.setAlert('黒マスがタテヨコに連続しています。','Black cells are adjacent.'); return false;
		}

		if( !this.checkRBBlackCell( this.owner.board.getWCellInfo() ) ){
			this.setAlert('白マスが分断されています。','White cells are devided.'); return false;
		}

		if( !this.checkCellNumber() ){
			this.setAlert('数字と黒マスにぶつかるまでの4方向のマスの合計が違います。','The number and the sum of the coutinuous white cells of four direction is different.'); return false;
		}

		return true;
	},

	checkCellNumber : function(){
		var result = true, bd = this.owner.board;
		for(var cc=0;cc<bd.cellmax;cc++){
			var cell = bd.cell[cc];
			if(!cell.isValidNum()){ continue;}

			var clist = this.owner.newInstance('CellList'), target;
			clist.add(cell);
			target=cell.lt(); while(!target.isnull && target.isWhite()){ clist.add(target); target = target.lt();}
			target=cell.rt(); while(!target.isnull && target.isWhite()){ clist.add(target); target = target.rt();}
			target=cell.up(); while(!target.isnull && target.isWhite()){ clist.add(target); target = target.up();}
			target=cell.dn(); while(!target.isnull && target.isWhite()){ clist.add(target); target = target.dn();}

			if(cell.getQnum()!==clist.length){
				if(this.inAutoCheck){ return false;}
				clist.seterr(1);
				result = false;
			}
		}
		return result;
	}
}
});
