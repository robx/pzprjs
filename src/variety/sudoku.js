//
// パズル固有スクリプト部 数独版 sudoku.js
//
import common from '../pzpr/classmgr.js';

//---------------------------------------------------------
// マウス入力系
class MouseEvent extends common.MouseEvent{
	mouseinput(){
		if(this.mousestart){ this.inputqnum();}
	}
};

//---------------------------------------------------------
// キーボード入力系
class KeyEvent extends common.KeyEvent {
	enablemake = true
	enableplay = true
};

//---------------------------------------------------------
// 盤面管理系
class Cell extends common.Cell {
	enableSubNumberArray = true

	maxnum(){
		return Math.max(this.board.cols,this.board.rows);
	}
};
class Board extends common.Board {
	cols = 9
	rows = 9

	hasborder = 1

	initBoardSize(col,row){
		this.common.initBoardSize.call(this,col,row);

		var roomsizex, roomsizey;
		roomsizex = roomsizey = (Math.sqrt(this.cols)|0) * 2;
		if(this.cols===6){ roomsizex = 6;}
		for(var i=0;i<this.border.length;i++){
			var border = this.border[i];
			if(border.bx%roomsizex===0 || border.by%roomsizey===0){ border.ques = 1;}
		}
		this.rebuildInfo();
	}
};

class AreaRoomGraph extends common.AreaRoomGraph {
	enabled = true
};

//---------------------------------------------------------
// 画像表示系
class Graphic extends common.Graphic {
	paint(){
		this.drawBGCells();
		this.drawTargetSubNumber();
		this.drawGrid();
		this.drawBorders();

		this.drawSubNumbers();
		this.drawNumbers();

		this.drawChassis();

		this.drawCursor();
	}
};

//---------------------------------------------------------
// URLエンコード/デコード処理
class Encode extends common.Encode {
	decodePzpr(type){
		this.decodeNumber16();
	}
	encodePzpr(type){
		this.encodeNumber16();
	}

	decodeKanpen(){
		this.fio.decodeCellQnum_kanpen();
	}
	encodeKanpen(){
		this.fio.encodeCellQnum_kanpen();
	}
};
//---------------------------------------------------------
class FileIO extends common.FileIO {
	decodeData(){
		this.decodeCellQnum();
		this.decodeCellAnumsub();
	}
	encodeData(){
		this.encodeCellQnum();
		this.encodeCellAnumsub();
	}

	kanpenOpen(){
		this.decodeCellQnum_kanpen();
		this.decodeCellAnum_kanpen();
	}
	kanpenSave(){
		this.encodeCellQnum_kanpen();
		this.encodeCellAnum_kanpen();
	}

	kanpenOpenXML(){
		this.decodeCellQnum_XMLBoard();
		this.decodeCellAnum_XMLAnswer();
	}
	kanpenSaveXML(){
		this.encodeCellQnum_XMLBoard();
		this.encodeCellAnum_XMLAnswer();
	}

	UNDECIDED_NUM_XML = 0
};

//---------------------------------------------------------
// 正解判定処理実行部
class AnsCheck extends common.AndCheck {
	checklist = [
		"checkDifferentNumberInRoom",
		"checkDifferentNumberInLine",
		"checkNoNumCell+"
	]
};

export default {sudoku:{MouseEvent, KeyEvent ,Cell, Board, AreaRoomGraph, Graphic, Encode, FileIO, AnsCheck}};
