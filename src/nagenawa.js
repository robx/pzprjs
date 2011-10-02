//
// パズル固有スクリプト部 なげなわ版 nagenawa.js v3.4.0
//
pzprv3.custom.nagenawa = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputedit : function(){
		if(this.mousestart || this.mousemove){ this.inputborder();}
		else if(this.mouseend && this.notInputted()){ this.inputqnum();}
	},
	inputplay : function(){
		if(this.mousestart || this.mousemove){ if(this.btn.Left){ this.inputLine();}}
		else if(this.mouseend && this.notInputted()){ this.inputMB();}
	},
	inputRed : function(){ this.dispRedLine();}
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
Cell:{
	nummaxfunc : function(){
		return Math.min(this.maxnum, bd.areas.rinfo.getCntOfRoomByCell(this));
	},
	minnum : 0
},
Board:{
	qcols : 8,
	qrows : 8,

	isborder : 1
},

LineManager:{
	isCenterLine : true,
	isLineCross  : true
},

AreaManager:{
	hasroom    : true
},

AreaRoomData:{
	hastop : true
},

Menu:{
	menufix : function(){
		this.addRedLineToFlags();
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	irowake : 1,

	setColors : function(){
		this.gridcolor = this.gridcolor_SLIGHT;
	},
	paint : function(){
		this.drawBGCells();

		this.drawNumbers();

		this.drawDashedGrid();
		this.drawBorders();

		this.drawMBs();
		this.drawLines();

		this.drawChassis();

		this.drawTarget();
	},

	//オーバーライド
	drawNumber1 : function(cell){
		var key = ['cell',cell.id].join('_');
		if(cell.qnum!==-1){
			var text = (cell.qnum>=0 ? ""+cell.qnum : "?");
			this.dispnum(key, 5, text, 0.45, this.fontcolor, cell.px, cell.py);
		}
		else{ this.hideEL(key);}
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
		this.decodeBorderLine();
		this.decodeCellQsub();
	},
	encodeData : function(){
		this.encodeAreaRoom();
		this.encodeCellQnum();
		this.encodeBorderLine();
		this.encodeCellQsub();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.checkNoLine() ){
			this.setAlert('線が引かれていません。','There is no line on the board.'); return false;
		}

		var rinfo = bd.areas.getRoomInfo();
		if( !this.checkLinesInArea(rinfo, function(w,h,a,n){ return (n<=0 || n>=a);}) ){
			this.setAlert('数字のある部屋と線が通過するマスの数が違います。','The number of the cells that is passed any line in the room and the number written in the room is diffrerent.'); return false;
		}

		if( !this.checkLcntCell(3) ){
			this.setAlert('分岐している線があります。','There is a branch line.'); return false;
		}
		if( !this.checkLcntCell(1) ){
			this.setAlert('途中で途切れている線があります。', 'There is a dead-end line.'); return false;
		}

		if( !this.checkLinesInArea(rinfo, function(w,h,a,n){ return (n<=0 || n<=a);}) ){
			this.setAlert('数字のある部屋と線が通過するマスの数が違います。','The number of the cells that is passed any line in the room and the number written in the room is diffrerent.'); return false;
		}

		if( !this.checkAllLoopRect() ){
			this.setAlert('長方形か正方形でない輪っかがあります。','There is a non-rectangle loop.'); return false;
		}

		return true;
	},

	checkNoLine : function(){
		for(var i=0;i<bd.bdmax;i++){ if(bd.border[i].isLine()){ return true;} }
		return false;
	},
	checkAllLoopRect : function(){
		var result = true;
		var xinfo = bd.lines.getLineInfo();
		for(var r=1;r<=xinfo.max;r++){
			var blist = xinfo.getblist(r);
			if(this.isLoopRect(blist)){ continue;}

			if(this.inAutoCheck){ return false;}
			if(result){ bd.border.seterr(2);}
			blist.seterr(1);
			result = false;
		}
		return result;
	},
	isLoopRect : function(blist){
		var x1=bd.maxbx, x2=bd.minbx, y1=bd.maxby, y2=bd.minby;
		for(var i=0;i<blist.length;i++){
			if(x1>blist[i].bx){ x1=blist[i].bx;}
			if(x2<blist[i].bx){ x2=blist[i].bx;}
			if(y1>blist[i].by){ y1=blist[i].by;}
			if(y2<blist[i].by){ y2=blist[i].by;}
		}
		for(var i=0;i<blist.length;i++){
			var border = blist[i];
			if(border.bx!==x1 && border.bx!==x2 && border.by!==y1 && border.by!==y2){ return false;}
		}
		return true;
	}
}
};
