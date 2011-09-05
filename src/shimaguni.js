//
// パズル固有スクリプト部 島国・チョコナ版 shimaguni.js v3.4.0
//
pzprv3.custom.shimaguni = {
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
	enablemake : true,

	enablemake_p : true,
	paneltype    : 10
},

//---------------------------------------------------------
// 盤面管理系
Board:{
	isborder : 1,

	initialize : function(owner){
		this.SuperFunc.initialize.call(this, owner);
		if(owner.pid==='chocona'){
			this.minnum = 0;
		}
	},

	nummaxfunc : function(cc){
		return Math.min(this.maxnum, this.areas.rinfo.getCntOfRoomByCell(cc));
	},

	getLandAreaOfClist : function(clist, func){
		var cnt = 0;
		for(var i=0,len=clist.length;i<len;i++){
			if(this.isBlack(clist[i])){ cnt++;}
		}
		return cnt;
	}
},

AreaManager:{
	initialize : function(owner){
		this.SuperFunc.initialize.call(this, owner);
		if(owner.pid==='chocona'){
			this.checkBlackCell = true;
		}
	},
	hasroom    : true
},

AreaRoomData:{
	hastop : true
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
		if(this.owner.pid==='shimaguni'){
			this.bcolor = "rgb(191, 191, 255)";
			this.bbcolor = "rgb(191, 191, 255)";
		}
		else if(this.owner.pid==='chocona'){
			this.bcolor = this.bcolor_GREEN;
		}
		this.gridcolor = this.gridcolor_LIGHT;
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
		if     (this.owner.pid==='shimaguni'){ return this.checkAns_shimaguni();}
		else if(this.owner.pid==='chocona')  { return this.checkAns_chocona();}
		return true;
	},

	checkAns_shimaguni : function(){

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
	},

	checkAns_chocona : function(){

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
