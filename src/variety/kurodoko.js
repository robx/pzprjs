//
// パズル固有スクリプト部 黒マスはどこだ版 kurodoko.js
//
(function(pidlist, classbase){
	if(typeof module==='object' && module.exports){module.exports = [pidlist, classbase];}
	else{ pzpr.classmgr.makeCustom(pidlist, classbase);}
}(
['kurodoko'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	RBShadeCell : true,
	use    : true,
	inputModes : {edit:['number','clear','info-blk'],play:['shade','unshade','info-blk']},
	mouseinput_auto : function(){
		if(this.puzzle.playmode){
			if(this.mousestart || this.mousemove){ this.inputcell();}
		}
		else if(this.puzzle.editmode){
			if(this.mousestart){ this.inputqnum();}
		}
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
	numberRemainsUnshaded : true,

	maxnum : function(){
		return this.board.cols+this.board.rows-1;
	},
	minnum : 2
},
Board:{
	cols : 9,
	rows : 9
},

AreaUnshadeGraph:{
	enabled : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	hideHatena : true,

	gridcolor_type : "DLIGHT",

	enablebcolor : true,
	bgcellcolor_func : "qsub1",
	numbercolor_func : "qnum",

	circleratio : [0.45, 0.40],

	paint : function(){
		this.drawBGCells();
		this.drawGrid();
		this.drawShadedCells();

		this.drawCircledNumbers();

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
		this.fio.decodeCellQnum_kanpen();
	},
	encodeKanpen : function(){
		this.fio.encodeCellQnum_kanpen();
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
	},

	kanpenOpenXML : function(){
		this.decodeCellQnum_XMLBoard();
		this.decodeCellAns_XMLAnswer();
	},
	kanpenSaveXML : function(){
		this.encodeCellQnum_XMLBoard();
		this.encodeCellAns_kurodoko_XMLAnswer();
	},

	UNDECIDED_NUM_XML : -4,

	encodeCellAns_kurodoko_XMLAnswer : function(){
		this.encodeCellXMLArow(function(cell){
			if(cell.qnum===-1){
				if     (cell.qans===1){ return 'w';}
				else if(cell.qsub===1){ return 's';}
			}
			return 'u';
		});
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checklist : [
		"checkShadeCellExist",
		"checkAdjacentShadeCell",
		"checkConnectUnshadeRB",
		"checkViewOfNumber"
	],

	checkViewOfNumber : function(){
		var boardcell = this.board.cell;
		for(var cc=0;cc<boardcell.length;cc++){
			var cell = boardcell[cc];
			if(!cell.isValidNum()){ continue;}

			var clist = new this.klass.CellList(), adc = cell.adjacent, target;
			clist.add(cell);
			target=adc.left;   while(target.isUnshade()){ clist.add(target); target=target.adjacent.left;  }
			target=adc.right;  while(target.isUnshade()){ clist.add(target); target=target.adjacent.right; }
			target=adc.top;    while(target.isUnshade()){ clist.add(target); target=target.adjacent.top;   }
			target=adc.bottom; while(target.isUnshade()){ clist.add(target); target=target.adjacent.bottom;}
			if(cell.qnum===clist.length){ continue;}
			
			this.failcode.add("nmSumViewNe");
			if(this.checkOnly){ break;}
			clist.seterr(1);
		}
	}
},

FailCode:{
	nmSumViewNe : ["数字と黒マスにぶつかるまでの4方向のマスの合計が違います。","The number and the sum of the coutinuous unshaded cells of four direction is different."]
}
}));
