//
// パズル固有スクリプト部 なげなわ版 nagenawa.js v3.4.0
//
pzprv3.custom.nagenawa = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mousedown : function(){
		if(kc.isZ ^ pp.getVal('dispred')){ this.dispRedLine();}
		else if(k.editmode){ this.inputborder();}
		else if(k.playmode){
			if(this.btn.Left){ this.inputLine();}
		}
	},
	mouseup : function(){
		if(this.notInputted()){
			if     (k.editmode){ this.inputqnum();}
			else if(k.playmode){ this.inputMB();}
		}
	},
	mousemove : function(){
		if(k.editmode){ this.inputborder();}
		else if(k.playmode){
			if(this.btn.Left){ this.inputLine();}
		}
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
	qcols : 8,
	qrows : 8,

	isborder : 1,

	nummaxfunc : function(cc){
		return Math.min(this.maxnum, this.areas.rinfo.getCntOfRoomByCell(cc));
	},
	minnum : 0
},

LineManager:{
	isCenterLine : true,
	isLineCross  : true
},

AreaManager:{
	hasroom    : true,
	roomNumber : true
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
	drawNumber1 : function(id){
		var obj = bd.cell[id], key = ['cell',id].join('_');
		if(obj.qnum!==-1){
			var text = (obj.qnum>=0 ? ""+obj.qnum : "?");
			this.dispnum(key, 5, text, 0.45, this.fontcolor, obj.cpx, obj.cpy);
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
		for(var i=0;i<bd.bdmax;i++){ if(bd.isLine(i)){ return true;} }
		return false;
	},
	checkAllLoopRect : function(){
		var result = true;
		var xinfo = bd.lines.getLineInfo();
		for(var r=1;r<=xinfo.max;r++){
			if(this.isLoopRect(xinfo.room[r].idlist)){ continue;}

			if(this.inAutoCheck){ return false;}
			if(result){ bd.sErBAll(2);}
			bd.sErB(xinfo.room[r].idlist,1);
			result = false;
		}
		return result;
	},
	isLoopRect : function(list){
		var x1=bd.maxbx, x2=bd.minbx, y1=bd.maxby, y2=bd.minby;
		for(var i=0;i<list.length;i++){
			if(x1>bd.border[list[i]].bx){ x1=bd.border[list[i]].bx;}
			if(x2<bd.border[list[i]].bx){ x2=bd.border[list[i]].bx;}
			if(y1>bd.border[list[i]].by){ y1=bd.border[list[i]].by;}
			if(y2<bd.border[list[i]].by){ y2=bd.border[list[i]].by;}
		}
		for(var i=0;i<list.length;i++){
			if(bd.border[list[i]].bx!=x1 && bd.border[list[i]].bx!=x2 && bd.border[list[i]].by!=y1 && bd.border[list[i]].by!=y2){ return false;}
		}
		return true;
	}
}
};
