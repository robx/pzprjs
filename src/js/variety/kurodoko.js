//
// パズル固有スクリプト部 黒マスはどこだ版 kurodoko.js v3.4.1
//
pzpr.classmgr.makeCustom(['kurodoko'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	RBShadeCell : true,

	mouseinput : function(){
		if(this.owner.playmode){
			if(this.mousestart || this.mousemove){ this.inputcell();}
		}
		else if(this.owner.editmode){
			if(this.mousestart){ this.inputqnum();}
		}
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
	numberRemainsUnshaded : true,

	maxnum : function(){
		return this.owner.board.qcols+this.owner.board.qrows-1;
	},
	minnum : 2
},
Board:{
	qcols : 9,
	qrows : 9
},

AreaUnshadeManager:{
	enabled : true
},

Flags:{
	use      : true,
	redblkrb : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	hideHatena : true,

	gridcolor_type : "DLIGHT",
	bcolor_type : "GREEN",

	bgcellcolor_func : "qsub1",

	globalfontsizeratio : 0.85,
	circleratio : [0.45, 0.40],

	paint : function(){
		this.drawBGCells();
		this.drawGrid();
		this.drawShadedCells();

		this.drawCircles();
		this.drawNumbers();

		this.drawChassis();

		this.drawTarget();
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

		if( !this.checkAdjacentShadeCell() ){ return 'csAdjacent';}

		if( !this.checkConnectUnshadeRB() ){ return 'cuDivideRB';}

		if( !this.checkCellNumber() ){ return 'nmSumViewNe';}

		return null;
	},

	checkCellNumber : function(){
		var result = true, bd = this.owner.board;
		for(var cc=0;cc<bd.cellmax;cc++){
			var cell = bd.cell[cc];
			if(!cell.isValidNum()){ continue;}

			var clist = new this.owner.CellList(), adc = cell.adjacent, target;
			clist.add(cell);
			target=adc.left;   while(target.isUnshade()){ clist.add(target); target=target.adjacent.left;  }
			target=adc.right;  while(target.isUnshade()){ clist.add(target); target=target.adjacent.right; }
			target=adc.top;    while(target.isUnshade()){ clist.add(target); target=target.adjacent.top;   }
			target=adc.bottom; while(target.isUnshade()){ clist.add(target); target=target.adjacent.bottom;}

			if(cell.qnum!==clist.length){
				if(this.checkOnly){ return false;}
				clist.seterr(1);
				result = false;
			}
		}
		return result;
	}
},

FailCode:{
	nmSumViewNe : ["数字と黒マスにぶつかるまでの4方向のマスの合計が違います。","The number and the sum of the coutinuous unshaded cells of four direction is different."]
}
});
