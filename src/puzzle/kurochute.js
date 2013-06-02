//
// パズル固有スクリプト部 クロシュート版 kurochute.js v3.4.0
//
pzprv3.createCustoms('kurochute', {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	RBBlackCell : true,

	mouseinput : function(){
		if(this.owner.playmode){
			if(this.mousestart || this.mousemove){ this.inputcell();}
			else if(this.mouseend && this.notInputted()){ this.inputqsub();}
		}
		else if(this.owner.editmode){
			if(this.mousestart){ this.inputqnum();}
		}
	},

	inputqsub : function(){
		var cell = this.getcell();
		if(cell.isnull){ return;}

		if     (cell.getQsub()===0){ cell.setQsub(2);}
		else if(cell.getQsub()===2){ cell.setQsub(0);}
		cell.draw();
	}
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
		return Math.max(this.owner.board.qcols,this.owner.board.qrows)-1;
	}
},
Board:{
	qcols : 8,
	qrows : 8
},

AreaWhiteManager:{
	enabled : true
},

Flags:{
	use : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	initialize : function(){
		this.Common.prototype.initialize.call(this);

		this.gridcolor = this.gridcolor_LIGHT;
		this.qsubcolor2 = this.bcolor_GREEN;
	},
	paint : function(){
		this.drawBGCells();
		this.drawDotCells(false);
		this.drawGrid();
		this.drawBlackCells();

		this.drawNumbers();

		this.drawChassis();

		this.drawTarget();
	},

	// オーバーライド drawBGCells用 (qsub==1は表示しない..)
	getBGCellColor : function(cell){
		if     (cell.error===1){ return this.errbcolor1;}
		else if(cell.qsub ===2){ return this.qsubcolor2;}
		return null;
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodeNumber16();
	},
	encodePzpr : function(type){
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
		this.decodeCellQanssub();
	},
	encodeData : function(){
		this.encodeCellQnum();
		this.encodeCellQanssub();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.checkAdjacentBlackCell() ){ return 10021;}

		var winfo = this.owner.board.getWCellInfo();
		if( !this.checkRBBlackCell(winfo) ){ return 10020;}

		if( !this.checkCellNumber() ){ return 90401;}

		return 0;
	},

	checkCellNumber : function(){
		var result = true, bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c];
			if(!cell.isValidNum()){ continue;}
			var num=cell.getQnum(), cell2;
			var clist = new this.owner.CellList();
			cell2=cell.relcell(-num*2,0); if(cell2.isBlack()){ clist.add(cell2);}
			cell2=cell.relcell( num*2,0); if(cell2.isBlack()){ clist.add(cell2);}
			cell2=cell.relcell(0,-num*2); if(cell2.isBlack()){ clist.add(cell2);}
			cell2=cell.relcell(0, num*2); if(cell2.isBlack()){ clist.add(cell2);}
			if(clist.length!==1){
				if(this.checkOnly){ return false;}
				cell.seterr(4);
				clist.seterr(1);
				result = false;
			}
		}
		return result;
	}
}
});
