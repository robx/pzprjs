//
// パズル固有スクリプト部 ペイントエリア版 paintarea.js v3.4.0
//
pzprv3.createCustoms('paintarea', {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputedit : function(){
		if(this.mousestart || this.mousemove){ this.inputborder();}
		else if(this.mouseend && this.notInputted()){ this.inputqnum();}
	},
	inputplay : function(){
		if(this.mousestart || this.mousemove){ this.inputtile();}
	},
	inputRed : function(){ this.dispRed();}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,

	enablemake_p : true,
	paneltype    : 1
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	maxnum : 4,
	minnum : 0
},
Board:{
	isborder : 1
},

AreaBlackManager:{
	enabled : true
},
AreaRoomManager:{
	enabled : true
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
		this.bcolor = this.bcolor_GREEN;
		this.bbcolor = "rgb(127, 127, 127)";
		this.setBGCellColorFunc('qans1');
	},
	paint : function(){
		this.drawBGCells();
		this.drawGrid();
		this.drawBlackCells();

		this.drawNumbers();

		this.drawBorders();

		this.drawChassis();

		this.drawBoxBorders(true);

		this.drawTarget();
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		this.decodeBorder();
		this.decodeNumber10();
	},
	pzlexport : function(type){
		this.encodeBorder();
		this.encodeNumber10();
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeAreaRoom();
		this.decodeCellQnum();
		this.decodeCellAns();
	},
	encodeData : function(){
		this.encodeAreaRoom();
		this.encodeCellQnum();
		this.encodeCellAns();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( pzprv3.EDITOR && !this.checkSameObjectInRoom(this.owner.board.getRoomInfo(), function(cell){ return (cell.isBlack()?1:2);}) ){
			this.setAlert('白マスと黒マスの混在したタイルがあります。','A tile includes both black and white cells.'); return false;
		}

		if( !this.checkOneArea( this.owner.board.getBCellInfo() ) ){
			this.setAlert('黒マスがひとつながりになっていません。','Black cells are devided.'); return false;
		}

		if( !this.check2x2Block( function(cell){ return cell.isBlack();} ) ){
			this.setAlert('2x2の黒マスのかたまりがあります。','There is a 2x2 block of black cells.'); return false;
		}

		if( !this.checkDir4Cell(function(cell){ return cell.isBlack();},0 ) ){
			this.setAlert('数字の上下左右にある黒マスの数が間違っています。','The number is not equal to the number of black cells in four adjacent cells.'); return false;
		}

		if( !this.check2x2Block( function(cell){ return cell.isWhite();} ) ){
			this.setAlert('2x2の白マスのかたまりがあります。','There is a 2x2 block of white cells.'); return false;
		}

		return true;
	}
}
});
