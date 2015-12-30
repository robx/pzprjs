//
// パズル固有スクリプト部 なげなわ・リングリング版 nagenawa.js v3.4.1
//
pzpr.classmgr.makeCustom(['nagenawa','ringring'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	redline : true
},
"MouseEvent@nagenawa":{
	mouseinput : function(){
		if(this.puzzle.playmode){
			if(this.mousestart || this.mousemove){ if(this.btn.Left){ this.inputLine();}}
			else if(this.mouseend && this.notInputted()){ this.inputMB();}
		}
		else if(this.puzzle.editmode){
			if(this.mousestart || this.mousemove){ this.inputborder();}
			else if(this.mouseend && this.notInputted()){ this.inputqnum();}
		}
	}
},
"MouseEvent@ringring":{
	mouseinput : function(){
		if(this.puzzle.playmode){
			if(this.mousestart || this.mousemove){
				if     (this.btn.Left) { this.inputLine();}
				else if(this.btn.Right){ this.inputpeke();}
			}
		}
		else if(this.puzzle.editmode){
			if(this.mousestart){ this.inputblock();}
		}
	},

	inputblock : function(){
		var cell = this.getcell();
		if(cell.isnull){ return;}

		cell.setQues(cell.ques===0?1:0);
		cell.draw();
	}
},

//---------------------------------------------------------
// キーボード入力系
"KeyEvent@nagenawa":{
	enablemake : true
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	maxnum : function(){
		return Math.min(255, this.room.clist.length);
	},
	minnum : 0
},
"Border@ringring":{
	enableLineNG : true
},
Board:{
	cols : 8,
	rows : 8,

	hasborder : 1
},

LineGraph:{
	enabled : true,
	isLineCross : true
},

"AreaRoomGraph@nagenawa":{
	enabled : true,
	hastop : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	irowake : true,

	gridcolor_type : "SLIGHT",

	paint : function(){
		var pid = this.pid;
		this.drawBGCells();

		this.drawDashedGrid();

		if(pid==='nagenawa'){
			this.drawNumbers();
			this.drawMBs();
			this.drawBorders();
		}
		else if(pid==='ringring'){
			this.drawShadedCells();
		}

		this.drawLines();
		if(pid==='ringring'){ this.drawPekes();}

		this.drawChassis();

		this.drawTarget();
	},

	//オーバーライド
	drawNumber1 : function(cell){
		var g = this.context;
		g.vid = "cell_text_"+cell.id;
		if(cell.qnum!==-1){
			var option = {ratio:[0.45], position:this.TOPLEFT};
			g.fillStyle = this.fontcolor;
			this.disptext((cell.qnum>=0 ? ""+cell.qnum : "?"), cell.bx*this.bw, cell.by*this.bh, option);
		}
		else{ g.vhide();}
	}
},
"Graphic@ringring":{
	cellcolor_func : "ques",

	drawTarget : function(){}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
"Encode@nagenawa":{
	decodePzpr : function(type){
		this.decodeBorder();
		this.decodeRoomNumber16();
	},
	encodePzpr : function(type){
		this.encodeBorder();
		this.encodeRoomNumber16();
	}
},
"Encode@ringring":{
	decodePzpr : function(type){
		this.decodeBlockCell();
	},
	encodePzpr : function(type){
		this.encodeBlockCell();
	},

	// 元ネタはencode/decodeCrossMark
	decodeBlockCell : function(){
		var cc=0, i=0, bstr = this.outbstr, bd = this.board;
		for(i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i);

			if(this.include(ca,"0","9")||this.include(ca,"a","z")){
				cc += parseInt(ca,36);
				bd.cell[cc].ques = 1;
			}
			else if(ca === '.'){ cc+=35;}

			cc++;
			if(cc>=bd.cellmax){ i++; break;}
		}
		this.outbstr = bstr.substr(i);
	},
	encodeBlockCell : function(){
		var cm="", count=0, bd = this.board;
		for(var c=0;c<bd.cellmax;c++){
			var pstr="";
			if(bd.cell[c].ques===1){ pstr = ".";}
			else{ count++;}

			if(pstr){ cm += count.toString(36); count=0;}
			else if(count===36){ cm += "."; count=0;}
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
	checklist : [
		"checkLineExist",
		"checkLineOnShadeCell@ringring",
		"checkOverLineCount@nagenawa",
		"checkBranchLine",
		"checkDeadendLine+",
		"checkLessLineCount@nagenawa",
		"checkAllLoopRect",
		"checkUnreachedUnshadeCell+@ringring"
	],

	checkOverLineCount : function(){
		this.checkLinesInArea(this.board.roommgr, function(w,h,a,n){ return (n<=0 || n>=a);}, "bkLineGt");
	},
	checkLessLineCount : function(){
		this.checkLinesInArea(this.board.roommgr, function(w,h,a,n){ return (n<=0 || n<=a);}, "bkLineLt");
	},
	checkUnreachedUnshadeCell : function(){
		this.checkAllCell(function(cell){ return (cell.ques===0 && cell.lcnt===0);}, "cuNoLine");
	},

	checkAllLoopRect : function(){
		var result = true, bd = this.board;
		var paths = bd.linegraph.components;
		for(var r=0;r<paths.length;r++){
			var borders = paths[r].getedgeobjs();
			if(this.isLoopRect(borders)){ continue;}

			result = false;
			if(this.checkOnly){ break;}
			paths[r].setedgeerr(1);
		}
		if(!result){
			this.failcode.add("lnNotRect");
			bd.border.setnoerr();
		}
	},
	isLoopRect : function(borders){
		var bd = this.board;
		var x1=bd.maxbx, x2=bd.minbx, y1=bd.maxby, y2=bd.minby;
		for(var i=0;i<borders.length;i++){
			if(x1>borders[i].bx){ x1=borders[i].bx;}
			if(x2<borders[i].bx){ x2=borders[i].bx;}
			if(y1>borders[i].by){ y1=borders[i].by;}
			if(y2<borders[i].by){ y2=borders[i].by;}
		}
		for(var i=0;i<borders.length;i++){
			var border = borders[i];
			if(border.bx!==x1 && border.bx!==x2 && border.by!==y1 && border.by!==y2){ return false;}
		}
		return true;
	}
},

FailCode:{
	lnNotRect : ["長方形か正方形でない輪っかがあります。","There is a non-rectangle loop."],
	bkLineGt : ["数字のある部屋と線が通過するマスの数が違います。","The number of the cells that is passed any line in the room and the number written in the room is diffrerent."],
	bkLineLt : ["数字のある部屋と線が通過するマスの数が違います。","The number of the cells that is passed any line in the room and the number written in the room is diffrerent."],
	cuNoLine : ["白マスの上に線が引かれていません。","There is no line on the unshaded cell."]
}
});
