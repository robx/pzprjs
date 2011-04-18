//
// パズル固有スクリプト部 チョコナ版 chocona.js v3.4.0
//
pzprv3.custom.chocona = {
//---------------------------------------------------------
// フラグ
Flags:{
	setting : function(pid){
		this.qcols = 10;
		this.qrows = 10;

		this.isborder = 1;

		this.hasroom         = true;
		this.roomNumber      = true;
		this.dispzero        = true;
		this.isDispHatena    = true;
		this.isInputHatena   = true;
		this.BlackCell       = true;
		this.checkBlackCell  = true;

		this.floatbgcolor = "rgb(127, 0, 0)";
	}
},

//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mousedown : function(){
		if     (k.editmode){ this.inputborder();}
		else if(k.playmode){ this.inputcell();}
	},
	mouseup : function(){
		if(this.notInputted()){
			if(k.editmode){ this.inputqnum();}
		}
	},
	mousemove : function(){
		if     (k.editmode){ this.inputborder();}
		else if(k.playmode){ this.inputcell();}
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true
},

KeyPopup:{
	paneltype  : 10,
	enablemake : true
},

//---------------------------------------------------------
// 盤面管理系
Board:{
	nummaxfunc : function(cc){
		return Math.min(this.maxnum, this.areas.getCntOfRoomByCell(cc));
	}
},

Menu:{
	menufix : function(){
		this.addUseToFlags();
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	setColors : function(){
		this.gridcolor = this.gridcolor_LIGHT;
		this.bcolor = this.bcolor_GREEN;
		this.setBGCellColorFunc('qsub1');
	},
	paint : function(){
		this.drawBGCells();
		this.drawGrid();
		this.drawBlackCells();

		this.drawNumbers();

		this.drawBorders();

		this.drawChassis();

		this.drawBoxBorders(false);

		this.drawTarget();
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		this.decodeBorder();
		this.decodeRoomNumber16();
	},
	pzlexport : function(type){
		this.encodeBorder();
		this.encodeRoomNumber16();
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

		if( !this.checkAreaRect(bd.areas.getBCellInfo()) ){
			this.setAlert('黒マスのカタマリが正方形か長方形ではありません。','A mass of black cells is not rectangle.'); return false;
		}

		if( !this.checkBlackCellCount( bd.areas.getRoomInfo() ) ){
			this.setAlert('数字のある領域と、領域の中にある黒マスの数が違います。','The number of Black cells in the area and the number written in the area is different.'); return false;
		}

		return true;
	}
}
};
