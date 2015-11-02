//
// パズル固有スクリプト部 数独版 sudoku.js v3.4.1
//
pzpr.classmgr.makeCustom(['sudoku'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.mousestart){ this.inputqnum();}
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,
	enableplay : true
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	maxnum : function(){
		return Math.max(this.board.qcols,this.board.qrows);
	}
},
Board:{
	qcols : 9,
	qrows : 9,

	hasborder : 1,

	initBoardSize : function(col,row){
		this.common.initBoardSize.call(this,col,row);

		var roomsizex, roomsizey;
		roomsizex = roomsizey = (Math.sqrt(this.qcols)|0) * 2;
		if(this.qcols===6){ roomsizex = 6;}
		for(var i=0;i<this.bdmax;i++){
			var border = this.border[i];
			if(border.bx%roomsizex===0 || border.by%roomsizey===0){ border.ques = 1;}
		}
		this.rebuildInfo();
	}
},

AreaRoomGraph:{
	enabled : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	paint : function(){
		this.drawBGCells();
		this.drawGrid();
		this.drawBorders();

		this.drawNumbers();

		this.drawChassis();

		this.drawCursor();
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
		this.puzzle.fio.decodeCellQnum_kanpen();
	},
	encodeKanpen : function(){
		this.puzzle.fio.encodeCellQnum_kanpen();
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCellQnum();
		this.decodeCellAnumsub();
	},
	encodeData : function(){
		this.encodeCellQnum();
		this.encodeCellAnumsub();
	},

	kanpenOpen : function(){
		this.decodeCellQnum_kanpen();
		this.decodeCellAnum_kanpen();
	},
	kanpenSave : function(){
		this.encodeCellQnum_kanpen();
		this.encodeCellAnum_kanpen();
	},

	kanpenOpenXML : function(){
		this.decodeCellQnum_XMLBoard();
		this.decodeCellAnum_XMLAnswer();
	},
	kanpenSaveXML : function(){
		this.encodeCellQnum_XMLBoard();
		this.encodeCellAnum_XMLAnswer();
	},

	UNDECIDED_NUM_XML : 0
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checklist : [
		"checkDifferentNumberInRoom",
		"checkDifferentNumberInLine",
		"checkNoNumCell+"
	],

	checkDifferentNumberInLine : function(){
		this.checkRowsCols(this.isDifferentNumberInClist, "nmDupRow");
	}
}
});
