//
// パズル固有スクリプト部 なげなわ・リングリング版 nagenawa.js v3.4.0
//
pzprv3.custom.nagenawa = {
//---------------------------------------------------------
// マウス入力系
"MouseEvent@nagenawa":{
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
"MouseEvent@ringring":{
	inputedit : function(){
		if(this.mousestart){ this.inputblock();}
	},
	inputplay : function(){
		if(this.mousestart || this.mousemove){
			if     (this.btn.Left) { this.inputLine();}
			else if(this.btn.Right){ this.inputpeke();}
		}
	},

	inputblock : function(){
		var cell = this.getcell();
		if(cell.isnull){ return;}

		cell.setQues(cell.getQues()===0?1:0);
		cell.draw();
	}
},

//---------------------------------------------------------
// キーボード入力系
"KeyEvent@nagenawa":{
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
"Border@ringring":{
	enableLineNG : true,
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

"AreaManager@nagenawa":{
	hasroom    : true
},

"AreaRoomData@nagenawa":{
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

		this.drawDashedGrid();

		if(this.owner.pid==='nagenawa'){
			this.drawNumbers();
			this.drawMBs();
			this.drawBorders();
		}
		else if(this.owner.pid==='ringring'){
			this.drawBlackCells();
		}

		this.drawLines();
		if(this.owner.pid==='ringring'){ this.drawPekes(0);}

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
"Graphic@ringring":{
	getCellColor : function(cell){
		if(cell.ques===1){ return this.cellcolor;}
		return null;
	},
	drawTarget : function(){}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
"Encode@nagenawa":{
	pzlimport : function(type){
		this.decodeBorder();
		this.decodeRoomNumber16();
	},
	pzlexport : function(type){
		this.encodeBorder();
		this.encodeRoomNumber16();
	}
},
"Encode@ringring":{
	pzlimport : function(type){
		this.decodeBlockCell();
	},
	pzlexport : function(type){
		this.encodeBlockCell();
	},

	// 元ネタはencode/decodeCrossMark
	decodeBlockCell : function(){
		var cc=0, i=0, bstr = this.outbstr;
		for(i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i);

			if(this.include(ca,"0","9")||this.include(ca,"a","z")){
				cc += parseInt(ca,36);
				bd.cell[cc].ques = 1;
			}
			else if(ca == '.'){ cc+=35;}

			cc++;
			if(cc>=bd.cellmax){ i++; break;}
		}
		this.outbstr = bstr.substr(i);
	},
	encodeBlockCell : function(){
		var cm="", count=0;
		for(var c=0;c<bd.cellmax;c++){
			var pstr="";
			if(bd.cell[c].ques===1){ pstr = ".";}
			else{ count++;}

			if(pstr){ cm += count.toString(36); count=0;}
			else if(count==36){ cm += "."; count=0;}
		}
		//if(count>0){ cm += count.toString(36);}

		this.outbstr += cm;
	}
},
//---------------------------------------------------------
"FileIO@nagenawa":{
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
"FileIO@ringring":{
	decodeData : function(){
		this.decodeCellBlock();
		this.decodeBorderLine();
	},
	encodeData : function(){
		this.encodeCellBlock();
		this.encodeBorderLine();
	},

	decodeCellBlock : function(){
		this.decodeCell( function(cell,ca){
			if(ca==="1"){ cell.ques = 1;}
		});
	},
	encodeCellBlock : function(){
		this.encodeCell( function(cell){
			return (cell.ques===1?"1 ":"0 ");
		});
	}
},
//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.checkNoLine() ){
			this.setAlert('線が引かれていません。','There is no line on the board.'); return false;
		}

		if( (this.owner.pid==='ringring') && !this.checkAllCell(function(cell){ return (cell.lcnt()>0 && cell.getQues()===1);}) ){
			this.setAlert('黒マスの上に線が引かれています。','There is a line on the black cell.'); return false;
		}

		var rinfo = (this.owner.pid==='nagenawa' ? bd.areas.getRoomInfo() : null);
		if( (this.owner.pid==='nagenawa') && !this.checkLinesInArea(rinfo, function(w,h,a,n){ return (n<=0 || n>=a);}) ){
			this.setAlert('数字のある部屋と線が通過するマスの数が違います。','The number of the cells that is passed any line in the room and the number written in the room is diffrerent.'); return false;
		}

		if( !this.checkLcntCell(3) ){
			this.setAlert('分岐している線があります。','There is a branch line.'); return false;
		}
		if( !this.checkLcntCell(1) ){
			this.setAlert('途中で途切れている線があります。', 'There is a dead-end line.'); return false;
		}

		if( (this.owner.pid==='nagenawa') && !this.checkLinesInArea(rinfo, function(w,h,a,n){ return (n<=0 || n<=a);}) ){
			this.setAlert('数字のある部屋と線が通過するマスの数が違います。','The number of the cells that is passed any line in the room and the number written in the room is diffrerent.'); return false;
		}

		if( !this.checkAllLoopRect() ){
			this.setAlert('長方形か正方形でない輪っかがあります。','There is a non-rectangle loop.'); return false;
		}

		if( (this.owner.pid==='ringring') && !this.checkAllCell(function(cell){ return (cell.lcnt()===0 && cell.getQues()===0);}) ){
			this.setAlert('白マスの上に線が引かれていません。','There is no line on the white cell.'); return false;
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
			if(result){ bd.border.seterr(-1);}
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
