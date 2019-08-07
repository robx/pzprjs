//
// パズル固有スクリプト部 ぼんさん・へやぼん・四角スライダー版 bonsan.js
//
(function(pidlist, classbase){
	if(typeof module==='object' && module.exports){module.exports = [pidlist, classbase];}
	else{ pzpr.classmgr.makeCustom(pidlist, classbase);}
}(
['bonsan','heyabon','rectslider','satogaeri'], {
//---------------------------------------------------------
// マウス入力系
"MouseEvent@bonsan,heyabon":{
	inputModes : {edit:['number','clear'],play:['line','bgcolor','bgcolor1','bgcolor2','clear','completion']},
	mouseinput : function(){ // オーバーライド
		if(this.inputMode==='completion'){ if(this.mousestart){ this.inputqcmp(1);}}
		else{ this.common.mouseinput.call(this);}
	}
},
"MouseEvent@satogaeri":{
	inputModes : {edit:['number','clear'],play:['line','clear','completion']},
	mouseinput : function(){ // オーバーライド
		if(this.inputMode==='completion'){ if(this.mousestart){ this.inputqcmp(1);}}
		else{ this.common.mouseinput.call(this);}
	}
},
"MouseEvent@rectslider":{
	inputModes : {edit:['number','clear'],play:['line','bgcolor','subcircle','subcross','clear']}
},
MouseEvent:{
	mouseinput_auto : function(){
		if(this.puzzle.playmode){
			if(this.mousestart || this.mousemove){
				if(this.btn==='left'){ this.inputLine();}
			}
			else if(this.mouseend && this.notInputted()){ this.inputlight();}
		}
		else if(this.puzzle.editmode){
			if(this.mousestart || this.mousemove){
				if(this.pid==='heyabon'||this.pid==='satogaeri'){ this.inputborder();}
			}
			else if(this.mouseend && this.notInputted()){ this.inputqnum();}
		}
	},

	inputLine : function(){
		this.common.inputLine.call(this);

		/* "丸数字を移動表示しない"場合の背景色描画準備 */
		if(this.puzzle.execConfig('autocmp') && !this.puzzle.execConfig('dispmove') && !this.notInputted()){
			this.inputautodark();
		}
	},
	inputautodark : function(){
		/* 最後に入力した線を取得する */
		var opemgr = this.puzzle.opemgr, lastope = opemgr.lastope;
		if(lastope.group!=='border' || lastope.property!=='line'){ return;}
		var border = this.board.getb(lastope.bx, lastope.by);

		/* 線を引いた/消した箇所にある領域を取得 */
		var clist = new this.klass.CellList();
		Array.prototype.push.apply(clist, border.sideobj);
		clist = clist.notnull().filter(function(cell){ return cell.path!==null || cell.isNum();});

		/* 改めて描画対象となるセルを取得して再描画 */
		clist.each(function(cell){
			if(cell.path===null){ if(cell.isNum()){ cell.draw();}}
			else{ cell.path.clist.each(function(cell){ if(cell.isNum()){ cell.draw();}});}
		});
	},

	inputlight : function(){
		var cell = this.getcell();
		if(cell.isnull){ return;}

		var puzzle = this.puzzle;
		if(puzzle.pid!=='rectslider' && this.inputdark(cell,1)){ return;}
		if(puzzle.pid==='satogaeri'){ return;}

		if(this.mouseend && this.notInputted()){ this.mouseCell = this.board.emptycell;}
		this.inputBGcolor();
	},
	inputqcmp : function(val){
		var cell = this.getcell();
		if(cell.isnull){ return;}

		this.inputdark(cell,val);
	},
	inputdark : function(cell,val){
		var cell = this.getcell();
		if(cell.isnull){ return false;}

		var targetcell = (!this.puzzle.execConfig('dispmove') ? cell : cell.base),
			distance = 0.60,
			dx = this.inputPoint.bx-cell.bx, /* ここはtargetcellではなくcell */
			dy = this.inputPoint.by-cell.by;
		if(targetcell.isNum() && (this.inputMode==='completion' || (targetcell.qnum===-2 && dx*dx+dy*dy<distance*distance))){
			targetcell.setQcmp(targetcell.qcmp!==val ? val : 0);
			cell.draw();
			return true;
		}
		return false;
	}
},
//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	isCmp : function(){ // 描画用
		return this.isCmp_bonsan(this.puzzle.execConfig('autocmp'), this.puzzle.execConfig('dispmove'));
	},

	isCmp_bonsan : function(is_autocmp, is_dispmove) {
		var targetcell = (!is_dispmove ? this : this.base);
		if(targetcell.qcmp===1){ return true;}

		if(!is_autocmp){ return false;}

		var	num = targetcell.getNum();
		if(this.path===null){ return (num===0);}
		else{
			var clist = (this.path!==null ? this.path.clist : [this]);
			var d = clist.getRectSize();
			return ((d.cols===1||d.rows===1) && (num===clist.length-1));
		}
	},

	maxnum : function(){
		var bd=this.board, bx=this.bx, by=this.by;
		var col = (((bx<(bd.maxbx>>1))?(bd.maxbx-bx):bx)>>1);
		var row = (((by<(bd.maxby>>1))?(bd.maxby-by):by)>>1);
		return Math.max(col, row);
	},
	minnum : 0
},
"Cell@satogaeri":{
	posthook : {
		qcmp : function(num){ this.path.destination.room.checkAutoCmp(); }
	}
},

"Border@satogaeri":{
	posthook : {
		line : function(num){
			if(num) {
				this.sidecell[0].room.checkAutoCmp();
				this.sidecell[1].room.checkAutoCmp();
				this.sidecell[0].path.departure.room.checkAutoCmp();
				this.sidecell[0].path.destination.room.checkAutoCmp();
			} else {
				for(var id = 0; id <= 1; id++) {
					if(this.sidecell[id].path) {
						this.sidecell[id].path.departure.room.checkAutoCmp();
						this.sidecell[id].path.destination.room.checkAutoCmp();
					} else {
						this.sidecell[id].room.checkAutoCmp();
					}
				}
			}
		}
	}
},

"Cell@heyabon,satogaeri":{
	distance : null,

	// pencilbox互換関数 ここではファイル入出力用
	getState : function(){
		var adc = this.adjacent, adb = this.adjborder, direc = this.distance-1;
		if     (this.isDestination())                              { return 8;}
		else if(adb.top.isLine()    && adc.top.distance   ===direc){ return 0;}
		else if(adb.left.isLine()   && adc.left.distance  ===direc){ return 1;}
		else if(adb.bottom.isLine() && adc.bottom.distance===direc){ return 2;}
		else if(adb.right.isLine()  && adc.right.distance ===direc){ return 3;}
		return -1;
	},
	setState : function(val){
		if(isNaN(val)){ return;}
		var adb = this.adjborder;
		if     (val===0){ adb.top.line    = 1;}
		else if(val===1){ adb.left.line   = 1;}
		else if(val===2){ adb.bottom.line = 1;}
		else if(val===3){ adb.right.line  = 1;}
	}
},

Board:{
	cols : 8,
	rows : 8,

	hasborder : 1
},

LineGraph:{
	enabled : true,
	moveline : true,

	resetExtraData : function(cell){
		cell.distance = (cell.qnum>=0 ? cell.qnum : null);

		this.common.resetExtraData.call(this, cell);
	},
	setExtraData : function(component){
		this.common.setExtraData.call(this, component);

		var cell = component.departure, num = cell.qnum;
		num = (num>=0 ? num : this.board.cell.length);
		cell.distance = num;
		if(cell.lcnt===0){ return;}

		/* component.departureは線が1方向にしかふられていないはず */
		var dir = cell.getdir(cell.pathnodes[0].nodes[0].obj,2);
		var pos = cell.getaddr(), n = cell.distance;
		while(1){
			pos.movedir(dir,2);
			var cell = pos.getc(), adb = cell.adjborder;
			if(cell.isnull || cell.lcnt>=3 || cell.lcnt===0){ break;}

			cell.distance = --n;
			if(cell===component.destination){ break;}
			else if(dir!==1 && adb.bottom.isLine()){ dir=2;}
			else if(dir!==2 && adb.top.isLine()   ){ dir=1;}
			else if(dir!==3 && adb.right.isLine() ){ dir=4;}
			else if(dir!==4 && adb.left.isLine()  ){ dir=3;}
		}
	}
},

"AreaRoomGraph@bonsan,heyabon,satogaeri":{
	enabled : true
},
"AreaShadeGraph@rectslider":{
	enabled : true,
	relation : {'cell.qnum':'node','border.line':'move'},
	isnodevalid : function(cell){ return cell.base.qnum!==-1;},

	modifyOtherInfo : function(border,relation){
		this.setEdgeByNodeObj(border.sidecell[0]);
		this.setEdgeByNodeObj(border.sidecell[1]);
	}
},

//---------------------------------------------------------
// 画像表示系
"Graphic@bonsan,heyabon,rectslider":{
	bgcellcolor_func : "qsub2",
	autocmp : "number"
},
"Graphic@satogaeri":{
	bgcellcolor_func : "qcmp",
	autocmp : "room"
},
"CellList@satogaeri":{
	checkCmp : function(){
		return this.filter(function(cell){
			return cell.isDestination() && cell.isCmp_bonsan(true, true);
		}).length===1;
	}
},

Graphic:{
	hideHatena : true,

	gridcolor_type : "LIGHT",

	numbercolor_func : "move",
	qsubcolor1 : "rgb(224, 224, 255)",
	qsubcolor2 : "rgb(255, 255, 144)",

	circlefillcolor_func : "qcmp",

	paint : function(){
		this.drawBGCells();
		this.drawGrid();
		if(this.pid==='heyabon'||this.pid==='satogaeri'){ this.drawBorders();}

		this.drawTip();
		this.drawDepartures();
		this.drawLines();

		this.drawCircledNumbers();

		this.drawChassis();

		this.drawTarget();
	}
},
"Graphic@rectslider":{
	fontShadecolor : "white",
	qcmpcolor : "gray",

	paint : function(){
		this.drawDashedGrid();

		this.drawTip();
		this.drawDepartures();
		this.drawLines();

		this.drawQuesCells();
		this.drawMBs();

		this.drawQuesNumbers();

		this.drawChassis();

		this.drawTarget();
	},

	getQuesCellColor : function(cell){
		var puzzle = this.puzzle;
		if((puzzle.execConfig('dispmove') ? cell.base : cell).qnum===-1){ return null;}
		if(puzzle.execConfig('dispmove') && puzzle.mouse.mouseCell===cell){ return this.movecolor;}

		var info = cell.error || cell.qinfo;
		if     (info===0){ return this.quescolor;}
		else if(info===1){ return this.errcolor1;}
		return null;
	},
	getQuesNumberColor : function(cell){
		return (cell.isCmp() ? this.qcmpcolor : this.fontShadecolor);
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
"Encode@bonsan":{
	decodePzpr : function(type){
		if(!this.checkpflag("c")){ this.decodeBorder();}
		this.decodeNumber16();
	},
	encodePzpr : function(type){
		this.outpflag='c';
		this.encodeNumber16();
	}
},
"Encode@heyabon":{
	decodePzpr : function(type){
		this.decodeBorder();
		this.decodeNumber16();
	},
	encodePzpr : function(type){
		this.encodeBorder();
		this.encodeNumber16();
	}
},
"Encode@satogaeri":{
	decodePzpr : function(type){
		this.decodeBorder();
		this.decodeNumber16();
	},
	encodePzpr : function(type){
		this.encodeBorder();
		this.encodeNumber16();
	},

	decodeKanpen : function(){
		this.fio.decodeAreaRoom();
		this.fio.decodeQnum_PBox_Sato();
	},
	encodeKanpen : function(){
		this.fio.encodeAreaRoom();
		this.fio.encodeQnum_PBox_Sato();
	}
},
"Encode@rectslider":{
	decodePzpr : function(type){
		this.decodeNumber16();
	},
	encodePzpr : function(type){
		this.encodeNumber16();
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCellQnum();
		this.decodeCellQsubQcmp();
		if(this.pid!=='rectslider'){ this.decodeBorderQues();}
		this.decodeBorderLine();
	},
	encodeData : function(){
		this.encodeCellQnum();
		this.encodeCellQsubQcmp();
		if(this.pid!=='rectslider'){ this.encodeBorderQues();}
		this.encodeBorderLine();
	},

	/* decode/encodeCellQsubの上位互換です */
	decodeCellQsubQcmp : function(){
		this.decodeCell( function(cell,ca){
			if(ca!=="0"){
				cell.qsub = +ca & 0x0f;
				cell.qcmp = +ca >> 4; // int
			}
		});
	},
	encodeCellQsubQcmp : function(){
		this.encodeCell( function(cell){
			return (cell.qsub + (cell.qcmp << 4))+" ";
		});
	},

	/* さとがえり用出力です */
	kanpenOpen : function(){
		this.decodeAreaRoom();
		this.decodeQnum_PBox_Sato();
		this.decodeLine_PBox_Sato();
	},
	kanpenSave : function(){
		this.encodeAreaRoom();
		this.encodeQnum_PBox_Sato();
		this.encodeLine_PBox_Sato();
	},
	decodeQnum_PBox_Sato : function(){
		this.decodeCell( function(cell,ca){
			if     (ca==="-"){ cell.qnum = -2;}
			else if(ca!=="."){ cell.qnum = +ca;}
		});
	},
	encodeQnum_PBox_Sato : function(){
		this.encodeCell( function(cell){
			if     (cell.qnum>=  0){ return cell.qnum+" ";}
			else if(cell.qnum===-2){ return "- ";}
			else                   { return ". ";}
		});
	},
	decodeLine_PBox_Sato : function(){
		this.decodeCell( function(cell,ca){
			cell.setState(+ca);
		});
	},
	encodeLine_PBox_Sato : function(){
		this.encodeCell( function(cell){
			var val = cell.getState();
			if(val>=0){ return ''+val+' ';}
			return '. ';
		});
	},

	kanpenOpenXML : function(){
		this.decodeAreaRoom_XMLBoard();
		this.decodeCellQnum_XMLBoard();
		this.decodeBorderLine_satogaeri_XMLAnswer();
	},
	kanpenSaveXML : function(){
		this.encodeAreaRoom_XMLBoard();
		this.encodeCellQnum_XMLBoard();
		this.encodeBorderLine_satogaeri_XMLAnswer();
	},

	UNDECIDED_NUM_XML : -2,

	decodeBorderLine_satogaeri_XMLAnswer : function(){
		this.decodeCellXMLArow(function(cell, name){
			cell.setState(+name.substr(1));
		});
	},
	encodeBorderLine_satogaeri_XMLAnswer : function(){
		this.encodeCellXMLArow(function(cell){
			return 'n'+cell.getState();
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

		"checkConnectObject",
		"checkLineOverLetter",
		"checkCurveLine",

		"checkMovedBlockRect@rectslider",
		"checkMovedBlockSize@rectslider",

		"checkLineLength",

		"checkFractal@bonsan,heyabon",
		"checkNoObjectBlock@satogaeri,heyabon",

		"checkNoMoveCircle",
		"checkDisconnectLine"
	],

	checkCurveLine : function(){
		this.checkAllArea(this.board.linegraph, function(w,h,a,n){ return (w===1||h===1);}, "laCurve");
	},
	checkLineLength : function(){
		this.checkAllArea(this.board.linegraph, function(w,h,a,n){ return (n<0||a===1||n===a-1);}, "laLenNe");
	},
	checkNoMoveCircle : function(){
		this.checkAllCell(function(cell){ return (cell.qnum>=1 && cell.lcnt===0);}, "nmNoMove");
	},

	checkFractal : function(){
		var rooms = this.board.roommgr.components;
		allloop:
		for(var r=0;r<rooms.length;r++){
			var clist = rooms[r].clist, d = clist.getRectSize();
			d.xx=d.x1+d.x2; d.yy=d.y1+d.y2;
			for(var i=0;i<clist.length;i++){
				var cell = clist[i];
				if(cell.isDestination() === this.board.getc(d.xx-cell.bx, d.yy-cell.by).isDestination()){ continue;}

				this.failcode.add(this.pid==="bonsan" ? "brObjNotSym" : "bkObjNotSym");
				if(this.checkOnly){ break allloop;}
				clist.filter(function(cell){ return cell.isDestination();}).seterr(1);
			}
		}
	},
	checkNoObjectBlock : function(){
		this.checkNoMovedObjectInRoom(this.board.roommgr);
	}
},
"AnsCheck@rectslider":{
	checkMovedBlockRect : function(){
		this.checkAllArea(this.board.sblkmgr, function(w,h,a,n){ return (w*h===a);}, "csNotRect");
	},
	checkMovedBlockSize : function(){
		this.checkAllArea(this.board.sblkmgr, function(w,h,a,n){ return (a>1);}, "bkSize1");
	}
},

FailCode:{
	bkNoNum : ["○のない部屋があります。","A room has no circle."],
	bkObjNotSym : ["部屋の中の○が点対称に配置されていません。", "Position of circles in the room is not point symmetric."],
	brObjNotSym : ["○が点対称に配置されていません。", "Position of circles is not point symmetric."],
	laOnNum : ["○の上を線が通過しています。","A line goes through a circle."],
	laIsolate : ["○につながっていない線があります。","A line doesn't connect any circle."],
	nmConnected : ["○が繋がっています。","There are connected circles."],
	nmNoMove : ["○から線が出ていません。","A circle doesn't start any line."]
},
"FailCode@rectslider":{
	csNotRect : ["黒マスのカタマリが正方形か長方形ではありません。","A mass of shaded cells is not rectangle."],
	bkSize1   : ["黒マスが一つで孤立しています。","There is a isolated shaded cells."],
	laOnNum   : ["黒マスの上を線が通過しています。","A line goes through a shaded cell."],
	laIsolate : ["黒マスにつながっていない線があります。","A line doesn't connect any shaded cell."],
	nmConnected : ["黒マスが繋がっています。","There are connected shaded cells."],
	nmNoMove  : ["黒マスから線が出ていません。","A shaded cell doesn't start any line."]
}
}));
