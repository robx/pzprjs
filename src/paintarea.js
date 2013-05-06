//
// パズル固有スクリプト部 ペイントエリア版 paintarea.js v3.4.0
//
pzprv3.createCustoms('paintarea', {
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

		if( pzprv3.EDITOR && !this.checkSameColorTile() ){ return 30030;}

		var binfo = this.owner.board.getBCellInfo();
		if( !this.checkOneArea(binfo) ){ return 10005;}

		if( !this.check2x2BlackCell() ){ return 10001;}
		if( !this.checkDir4BlackCell() ){ return 10027;}
		if( !this.check2x2WhiteCell() ){ return 10002;}

		return 0;
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
}
});
