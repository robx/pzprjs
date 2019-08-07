//
// パズル固有スクリプト部 ナンバーリンク、アルコネ版 numlin.js
//
(function(pidlist, classbase){
	if(typeof module==='object' && module.exports){module.exports = [pidlist, classbase];}
	else{ pzpr.classmgr.makeCustom(pidlist, classbase);}
}(
['numlin','arukone'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputModes : {edit:['number','clear','info-line'],play:['line','peke','info-line']},
	mouseinput_auto : function(){
		if(this.puzzle.playmode){
			if(this.btn==='left'){
				if(this.mousestart || this.mousemove){ this.inputLine();}
				else if(this.mouseend && this.notInputted()){ this.inputpeke();}
			}
			else if(this.btn==='right'){
				if(this.mousestart || this.mousemove){ this.inputpeke();}
			}
		}
		else if(this.puzzle.editmode){
			if(this.mousestart){ this.inputqnum();}
		}
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true
},

//---------------------------------------------------------
// 盤面管理系
"Cell@arukone":{
	numberAsLetter : true,
	maxnum : 52
},
Board:{
	hasborder : 1
},

LineGraph:{
	enabled : true,
	makeClist : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	gridcolor_type : "LIGHT",

	numbercolor_func : "qnum",

	irowake : true,

	paint : function(){
		this.drawBGCells();
		if(this.pid==='numlin'){ this.drawGrid();}

		this.drawPekes();
		this.drawLines();

		this.drawCellSquare();
		this.drawQuesNumbers();
		if(this.pid==='arukone'){ this.drawCrossSquares();}

		this.drawChassis();

		this.drawTarget();
	},

	drawCellSquare : function(){
		var g = this.vinc('cell_number_base', 'crispEdges', true);

		var rw = this.bw*(this.pid!=='arukone'?0.7:0.5)-1;
		var rh = this.bh*(this.pid!=='arukone'?0.7:0.5)-1;

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i];
			g.vid = "c_sq_"+cell.id;
			if(cell.qnum!==-1){
				g.fillStyle = (cell.error===1 ? this.errbcolor1 : this.bgcolor);
				g.fillRectCenter(cell.bx*this.bw, cell.by*this.bh, rw, rh);
			}
			else{ g.vhide();}
		}
	}
},
"Graphic@arukone":{
	fontsizeratio : 0.5,
	textoption : {style:"900"},
	drawCrossSquares : function(){
		var g = this.vinc('cross_mark', 'auto', true), bd = this.board;
		g.fillStyle = this.quescolor;

		var rsize = this.cw*0.5;
		var clist = this.range.crosses;
		for(var i=0;i<clist.length;i++){
			var cross = clist[i], bx = cross.bx, by = cross.by;
			if(bx===bd.maxbx || by===bd.maxby || bx===bd.minbx || by===bd.minby){ continue;}

			g.vid = "x_cm_"+cross.id;
			g.fillRect(bx*this.bw-rsize/2, by*this.bh-rsize/2, rsize, rsize);
		}
	},

	// オーバーライド
	margin : 0,
	drawTarget : function(){
		this.drawCursor(false, this.puzzle.editmode);
	},
	drawChassis : function(){
		var g = this.vinc('chassis', 'crispEdges', true), bd = this.board;

		var x1=this.range.x1, y1=this.range.y1, x2=this.range.x2, y2=this.range.y2;
		if(x1<0){ x1=0;} if(x2>2*bd.cols){ x2=2*bd.cols;}
		if(y1<0){ y1=0;} if(y2>2*bd.rows){ y2=2*bd.rows;}

		var lw = this.lw, dw = 0.45*this.bw, dh = 0.45*this.bh;
		var boardWidth = bd.cols*this.cw-dw*2, boardHeight = bd.rows*this.ch-dh*2;
		g.fillStyle = "black";
		g.vid = "chs1_"; g.fillRect(dw-(lw-0.5),      dh-(lw-0.5),        lw, boardHeight+2*lw-2);
		g.vid = "chs2_"; g.fillRect(dw+boardWidth-0.5,dh-(lw-0.5),        lw, boardHeight+2*lw-2);
		g.vid = "chs3_"; g.fillRect(dw-(lw-0.5),      dh-(lw-0.5),        boardWidth+2*lw-2, lw);
		g.vid = "chs4_"; g.fillRect(dw-(lw-0.5),      dh+boardHeight-0.5, boardWidth+2*lw-2, lw);
	},
	drawBGCells : function(){
		var g = this.vinc('cell_back', 'crispEdges', true), bd = this.board;

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i], color = this.getBGCellColor(cell);

			g.vid = "c_full_"+cell.id;
			if(!!color){
				g.fillStyle = color;
				var px1 = (cell.bx-(cell.bx>bd.minbx+1?1.5:0.6))*this.bw - 0.5;
				var py1 = (cell.by-(cell.by>bd.minby+1?1.5:0.6))*this.bw - 0.5;
				var px2 = (cell.bx+(cell.bx<bd.maxbx-1?1.5:0.6))*this.bw + 0.5;
				var py2 = (cell.by+(cell.by<bd.maxby-1?1.5:0.6))*this.bw + 0.5;
				g.fillRect(px1, py1, (px2-px1), (py2-py1));
			}
			else{ g.vhide();}
		}
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
"Encode@numlin":{
	decodePzpr : function(type){
		this.decodeNumber16();
	},
	encodePzpr : function(type){
		this.encodeNumber16();
	},

	decodeKanpen : function(){
		this.fio.decodeCellQnum_kanpen();
	},
	encodeKanpen : function(){
		this.fio.encodeCellQnum_kanpen();
	}
},
"Encode@arukone":{
	decodePzpr : function(type){
		this.decodeNumber16();

		this.puzzle.setConfig('passallcell', !this.checkpflag('e'));
	},
	encodePzpr : function(type){
		this.encodeNumber16();

		this.outpflag = (this.puzzle.getConfig('passallcell')?null:'e');
	}
},
//---------------------------------------------------------
"FileIO@numlin":{
	decodeData : function(){
		this.decodeCellQnum();
		this.decodeBorderLine();
	},
	encodeData : function(){
		this.encodeCellQnum();
		this.encodeBorderLine();
	},

	kanpenOpen : function(){
		this.decodeCellQnum_kanpen();
		this.decodeBorderLine();
	},
	kanpenSave : function(){
		this.encodeCellQnum_kanpen();
		this.encodeBorderLine();
	},

	kanpenOpenXML : function(){
		this.decodeCellQnum_XMLBoard();
		this.decodeBorderLine_XMLAnswer();
	},
	kanpenSaveXML : function(){
		this.encodeCellQnum_XMLBoard();
		this.encodeBorderLine_XMLAnswer();
	},

	UNDECIDED_NUM_XML : -1
},
"FileIO@arukone":{
	decodeData : function(){
		this.decodeConfig();
		this.decodeCellQnum_letter();
		this.decodeBorderLine();
	},
	encodeData : function(){
		this.encodeConfig();
		this.encodeCellQnum_letter();
		this.encodeBorderLine();
	},

	decodeConfig : function(){
		var disptype = this.readLine();
		this.puzzle.setConfig('passallcell', (disptype==='passallcell'));
	},
	encodeConfig : function(){
		var disptype = (this.puzzle.getConfig('passallcell') ? 'passallcell' : 'allowempty');
		this.writeLine(disptype);
	},
	decodeCellQnum_letter : function(){
		this.decodeCell( function(cell,ca){
			if     (ca==="-"){ cell.qnum = -2;}
			else if(ca>="A"&&ca<="Z"){ cell.qnum = parseInt(ca,36)-9;}
			else if(ca>="a"&&ca<="z"){ cell.qnum = parseInt(ca,36)-9+26;}
		});
	},
	encodeCellQnum_letter : function(){
		this.encodeCell( function(cell){
			var num = cell.qnum;
			if(num>0){
				if     (num> 0&&num<= 26){ return (num+ 9).toString(36).toUpperCase()+" ";}
				else if(num>26&&num<= 52){ return (num-17).toString(36).toLowerCase()+" ";}
			}
			else if(num===-2){ return "- ";}
			else             { return ". ";}
		});
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checklist : [
		"checkLineExist+",
		"checkBranchLine",
		"checkCrossLine",
		"checkTripleObject",
		"checkLinkSameNumber",
		"checkLineOverLetter",
		"checkDeadendConnectLine+",
		"checkDisconnectLine",
		"checkNoLineObject+",
		"checkNoLine_arukone+@arukone"
	],

	checkLinkSameNumber : function(){
		this.checkSameObjectInRoom(this.board.linegraph, function(cell){ return cell.qnum;}, "nmConnDiff");
	},
	checkNoLine_arukone : function(){
		if(this.puzzle.getConfig('passallcell')){ this.checkNoLine();}
	}
},

FailCode:{
	nmConnDiff : ["異なる数字がつながっています。","Different numbers are connected."]
},
"FailCode@arukone":{
	lcTripleNum : ["3つ以上のアルファベットがつながっています。","Three or more alphabets are connected."],
	lcIsolate : ["アルファベットにつながっていない線があります。","A line doesn't connect any alphabet."],
	lcOnNum   : ["アルファベットの上を線が通過しています。","A line goes through an alphabet."],
	nmConnDiff : ["異なるアルファベットがつながっています。","Different alphabets are connected."],
	ceNoLine  : ["線が引かれていない交差点があります。","A crossing is left blank."]
}
}));
