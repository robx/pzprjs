//
// パズル固有スクリプト部 島国版 shimaguni.js v3.4.0
//
pzprv3.custom.shimaguni = {
//---------------------------------------------------------
// フラグ
Flags:{
	setting : function(pid){
		this.qcols = 10;
		this.qrows = 10;

		this.isborder = 1;

		this.hasroom         = true;
		this.roomNumber      = true;
		this.isDispHatena    = true;
		this.isInputHatena   = true;
		this.BlackCell       = true;
		this.checkBlackCell  = true;

		this.floatbgcolor = "rgb(0, 127, 127)";
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
	},

	getLandAreaOfClist : function(clist, func){
		var cnt = 0;
		for(var i=0,len=clist.length;i<len;i++){
			if(this.isBlack(clist[i])){ cnt++;}
		}
		return cnt;
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
		this.bcolor = "rgb(191, 191, 255)";
		this.bbcolor = "rgb(191, 191, 255)";
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

		var rinfo = bd.areas.getRoomInfo();
		if( !this.checkSideAreaCell(rinfo, function(c1,c2){ return (bd.isBlack(c1) && bd.isBlack(c2));}, true) ){
			this.setAlert('異なる海域にある国どうしが辺を共有しています。','Countries in other marine area share the side over border line.'); return false;
		}

		if( !this.checkSeqBlocksInRoom() ){
			this.setAlert('1つの海域に入る国が2つ以上に分裂しています。','Countries in one marine area are devided to plural ones.'); return false;
		}

		if( !this.checkBlackCellCount(rinfo) ){
			this.setAlert('海域内の数字と国のマス数が一致していません。','The number of black cells is not equals to the number.'); return false;
		}

		if( !this.checkSideAreaSize(rinfo, function(rinfo,r){ return bd.getLandAreaOfClist(rinfo.room[r].idlist);}) ){
			this.setAlert('隣り合う海域にある国の大きさが同じです。','The size of countries that there are in adjacent marine areas are the same.'); return false;
		}

		if( !this.checkBlackCellInArea(rinfo, function(a){ return (a>0);}) ){
			this.setAlert('黒マスのカタマリがない海域があります。','A marine area has no black cells.'); return false;
		}

		return true;
	}
}
};
