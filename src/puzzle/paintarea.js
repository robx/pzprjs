//
// パズル固有スクリプト部 ペイントエリア版 paintarea.js v3.4.0
//
pzpr.createCustoms('paintarea', {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.owner.playmode){
			if(this.mousestart || this.mousemove){ this.inputtile();}
		}
		else if(this.owner.editmode){
			if(this.mousestart || this.mousemove){ this.inputborder();}
			else if(this.mouseend && this.notInputted()){ this.inputqnum();}
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

Flags:{
	use    : true,
	redblk : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	initialize : function(){
		this.Common.prototype.initialize.call(this);

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
	decodePzpr : function(type){
		this.decodeBorder();
		this.decodeNumber10();
	},
	encodePzpr : function(type){
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

		if( pzpr.EDITOR && !this.checkSameColorTile() ){ return 'bkMixed';}

		var binfo = this.owner.board.getBCellInfo();
		if( !this.checkOneArea(binfo) ){ return 'bcDivide';}

		if( !this.check2x2BlackCell() ){ return 'bc2x2';}
		if( !this.checkDir4BlackCell() ){ return 'nmBcellNe';}
		if( !this.check2x2WhiteCell() ){ return 'wc2x2';}

		return null;
	},

	checkDir4BlackCell : function(){
		return this.checkDir4Cell(function(cell){ return cell.isBlack();},0);
	},
	checkSameColorTile : function(){
		var rinfo = this.owner.board.getRoomInfo();
		return this.checkSameObjectInRoom(rinfo, function(cell){ return (cell.isBlack()?1:2);});
	},
	check2x2WhiteCell : function(){
		return this.check2x2Block( function(cell){ return cell.isWhite();} );
	}
},

FailCode:{
	wc2x2     : ["2x2の白マスのかたまりがあります。","There is a 2x2 block of white cells."],
	nmBcellNe : ["数字の上下左右にある黒マスの数が間違っています。","The number is not equal to the number of black cells in four adjacent cells."]
}
});
