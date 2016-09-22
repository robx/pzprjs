//
// パズル固有スクリプト部 カントリーロード・月か太陽版 country.js
//
(function(pidlist, classbase){
	if(typeof module==='object' && module.exports){module.exports = [pidlist, classbase];}
	else{ pzpr.classmgr.makeCustom(pidlist, classbase);}
}(
['country','moonsun'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	redline : true,
	
	mouseinput : function(){
		if(this.puzzle.playmode){
			if(this.mousestart || this.mousemove){
				if(this.btn==='left'){ this.inputLine();}
				else if(this.btn==='right' && this.pid==='moonsun'){ this.inputpeke();}
			}
			else if(this.mouseend && this.notInputted()){
				this.inputMB();
			}
		}
		else if(this.puzzle.editmode){
			if(this.mousestart || this.mousemove){
				this.inputborder();
			}
			else if(this.mouseend && this.notInputted()){
				this.inputqnum();
			}
		}
	}
},
"MouseEvent@moonsun":{
	// オーバーライド
	inputMB : function(){
		var border = this.getpos(0.22).getb();
		if(border.group==='border' && !border.isnull){
			this.inputpeke();
			return;
		}
		
		var cell = this.getcell();
		if(cell.isnull || cell.qnum===-1){ return;}
		var clist = cell.room.clist.filter(function(cell2){ return cell.qnum===cell2.qnum;});
		var val = (cell.qsub===0?2:0);
		for(var i=0;i<clist.length;i++){
			clist[i].setQsub(val);
			clist[i].draw();
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
"Cell@country":{
	maxnum : function(){
		return Math.min(255, this.room.clist.length);
	}
},
"Cell@moonsun":{
	disInputHatena : true,
	numberAsObject : true,

	maxnum : 2,

	posthook : {
		qnum : function(num){ this.room.countMarkAndLine();}
	}
},
"Border@moonsun":{
	posthook : {
		line : function(num){
			var room1 = this.sidecell[0].room, room2 = this.sidecell[1].room;
			room1.countMarkAndLine();
			if(room1!==room2){ room2.countMarkAndLine();}
		}
	}
},
Board:{
	hasborder : 1
},

LineGraph:{
	enabled : true
},

AreaRoomGraph:{
	enabled : true
},
"AreaRoomGraph@country":{
	hastop : true
},
"AreaRoomGraph@moonsun":{
	setExtraData : function(component){
		this.common.setExtraData.call(this, component);
		component.countMarkAndLine();
	}
},
"GraphComponent@moonsun":{
	countMarkAndLine : function(){
		var count = this.count = {moon:{exists:0,passed:0},sun:{exists:0,passed:0}};
		var clist = this.clist;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i];
			if(cell.qnum===2){
				count.moon.exists++;
				if(cell.lcnt>0){ count.moon.passed++;}
			}
			else if(cell.qnum===1){
				count.sun.exists++;
				if(cell.lcnt>0){ count.sun.passed++;}
			}
		}
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	irowake : true,

	numbercolor_func : "qnum",

	gridcolor_type : "SLIGHT",

	paint : function(){
		this.drawBGCells();
		if     (this.pid==='country'){ this.drawNumbers();}
		else if(this.pid==='moonsun'){ this.drawMarks();}

		if     (this.pid==='country'){ this.drawGrid();}
		else if(this.pid==='moonsun'){ this.drawDashedGrid();}
		this.drawBorders();

		this.drawMBs();
		this.drawLines();
		this.drawPekes();

		this.drawChassis();

		this.drawTarget();
	}
},
"Graphic@moonsun":{
	circlefillcolor_func   : "qnum2",
	circlestrokecolor_func : "qnum2",

	gridcolor_type : "LIGHT",

	drawMarks : function(){
		var g = this.vinc('cell_mark', 'auto', true);

		g.lineWidth = Math.max(this.cw/36,1);
		var rsize = this.cw*0.35;
		var rad1s = 285*Math.PI/180, rad1e = 135*Math.PI/180;
		var rad2s = 120*Math.PI/180, rad2e = 300*Math.PI/180;
		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i];

			g.vid = "c_sun_"+cell.id;
			if(cell.qnum===1){
				g.fillStyle   = this.getCircleFillColor(cell);
				g.strokeStyle = this.getCircleStrokeColor(cell);
				g.shapeCircle(cell.bx*this.bw, cell.by*this.bh, rsize);
			}
			else{ g.vhide();}

			g.vid = "c_moon_"+cell.id;
			if(cell.qnum===2){
				var px1 = cell.bx*this.bw, py1 = cell.by*this.bh;
				var px2 = (cell.bx-0.25)*this.bw, py2 = (cell.by-0.15)*this.bh;
				g.fillStyle = this.getCircleFillColor(cell);
				g.beginPath();
				g.moveTo(px1+rsize*Math.cos(rad1s), py1+rsize*Math.sin(rad1s));
				g.arc(px1, py1, rsize, rad1s, rad1e, false);
				g.lineTo(px2+rsize*Math.cos(rad2s), py2+rsize*Math.sin(rad2s));
				g.arc(px2, py2, rsize, rad2s, rad2e, true);
				g.lineTo(px1+rsize*Math.cos(rad1s), py1+rsize*Math.sin(rad1s));
				g.closePath();
				g.fill();
			}
			else{ g.vhide();}
		}
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
"Encode@country":{
	decodePzpr : function(type){
		this.decodeBorder();
		this.decodeRoomNumber16();
	},
	encodePzpr : function(type){
		this.encodeBorder();
		this.encodeRoomNumber16();
	}
},
"Encode@moonsun":{
	decodePzpr : function(type){
		this.decodeBorder();
		this.decodeCircle();
	},
	encodePzpr : function(type){
		this.encodeBorder();
		this.encodeCircle();
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
	checklist : [
		"checkBranchLine",
		"checkCrossLine",

		"checkRoomPassOnce",

		"checkRoadCount",
		"checkNoRoadCountry",
		"checkSideAreaGrass",

		"checkDeadendLine+",
		"checkOneLoop"
	],

	checkRoadCount : function(){
		this.checkLinesInArea(this.board.roommgr, function(w,h,a,n){ return (n<=0||n===a);}, "bkLineNe");
	},
	checkNoRoadCountry : function(){
		this.checkLinesInArea(this.board.roommgr, function(w,h,a,n){ return (a!==0);}, "bkNoLine");
	},
	checkSideAreaGrass : function(){
		this.checkSideAreaCell(function(cell1,cell2){ return (cell1.lcnt===0 && cell2.lcnt===0);}, false, "cbNoLine");
	},

	checkRoomPassOnce : function(){
		var rooms = this.board.roommgr.components;
		for(var r=0;r<rooms.length;r++){
			var cnt=0, clist=rooms[r].clist;
			for(var i=0;i<clist.length;i++){
				var cell=clist[i], adb=cell.adjborder, border;
				border=adb.top;    if(border.ques===1 && border.line===1){ cnt++;}
				border=adb.bottom; if(border.ques===1 && border.line===1){ cnt++;}
				border=adb.left;   if(border.ques===1 && border.line===1){ cnt++;}
				border=adb.right;  if(border.ques===1 && border.line===1){ cnt++;}
			}
			if(cnt<=2){ continue;}
			
			this.failcode.add("bkPassTwice");
			if(this.checkOnly){ break;}
			clist.seterr(1);
		}
	}
},
"AnsCheck@moonsun":{
	checklist : [
		"checkBranchLine",
		"checkCrossLine",

		"checkRoomPassOnce",

		"checkPassesSingleMarks",
		"checkNextRoomIsNotMoon",
		"checkNextRoomIsNotSun",

		"checkAllMoonPassed",
		"checkAllSunPassed",

		"checkNoRoadCountry",
		"checkPassesAnyMarks",

		"checkDeadendLine+",
		"checkOneLoop"
	],

	checkPassesSingleMarks : function(){
		this.checkAllRoom(function(count){ return (count.moon.passed===0 || count.sun.passed===0);},
						  function(cell){ return cell.qnum!==-1 && cell.lcnt>0;}, "bkBothMarksPassed");
	},
	checkPassesAnyMarks : function(){
		this.checkAllRoom(function(count){ return (count.moon.passed>0 || count.sun.passed>0);},
						  function(cell){ return cell.qnum!==-1;}, "bkNoMarksPassed");
	},
	checkAllMoonPassed : function(){
		this.checkAllRoom(function(count){ return (count.moon.passed===0 || count.moon.exists===count.moon.passed);},
						  function(cell){ return cell.qnum===2 && cell.lcnt===0;}, "bkNotAllMSPassed");
	},
	checkAllSunPassed : function(){
		this.checkAllRoom(function(count){ return (count.sun.passed===0 || count.sun.exists===count.sun.passed);},
						  function(cell){ return cell.qnum===1 && cell.lcnt===0;}, "bkNotAllMUPassed");
	},
	checkAllRoom : function(cond, errfilter, code){
		var rooms = this.board.roommgr.components;
		for(var id=0;id<rooms.length;id++){
			var room = rooms[id], count = room.count;
			if(cond(count)){ continue;}
			
			this.failcode.add(code);
			if(this.checkOnly){ break;}
			room.clist.filter(errfilter).seterr(1);
		}
	},

	checkNextRoomIsNotMoon : function(){
		this.checkNextRoom(function(room1,room2){ return ((room1.count.moon.passed===0)||(room2.count.moon.passed===0));}, "bkMSPassedGt2");
	},
	checkNextRoomIsNotSun : function(){
		this.checkNextRoom(function(room1,room2){ return ((room1.count.sun.passed===0)||(room2.count.sun.passed===0));}, "bkMUPassedGt2");
	},
	checkNextRoom : function(cond, code){
		var borders = this.board.border;
		for(var id=0;id<borders.length;id++){
			var border = borders[id];
			if(border.ques===0 || border.line===0){ continue;}
			
			var room1 = border.sidecell[0].room, room2 = border.sidecell[1].room;
			if(room1===room2){ continue;}
			
			if(cond(room1,room2)){ continue;}

			this.failcode.add(code);
			if(this.checkOnly){ break;}
			room1.clist.seterr(1);
			room2.clist.seterr(1);
		}
	}
},

"FailCode@country":{
	bkPassTwice : ["線が１つの国を２回以上通っています。","A line passes a country twice or more."],
	bkNoLine : ["線の通っていない国があります。","A line doesn't pass a room."],
	bkLineNe : ["数字のある国と線が通過するマスの数が違います。","The number of the cells that is passed any line in the country and the number written in the country is diffrerent."],
	cbNoLine : ["線が通らないマスが、太線をはさんでタテヨコにとなりあっています。","The cells that is not passed any line are adjacent over border line."]
},
"FailCode@moonsun":{
	bkPassTwice : ["線が１つの部屋を２回以上通っています。","A line passes a room twice or more."],
	bkNoLine : ["線の通っていない部屋があります。","A line doesn't pass a room."],
	bkBothMarksPassed : ["線が月と太陽を両方通っています。","A line passes both the marks of the moon and the sun."],
	bkNoMarksPassed   : ["線が月も太陽も通っていません。","A line passes neither the marks of the moon nor the sun."],
	bkNotAllMSPassed : ["線が全ての月を通っていません。","A line doesn't pass all of the marks of the moon."],
	bkNotAllMUPassed : ["線が全ての太陽を通っていません。","A line doesn't pass all of the marks of the sun."],
	bkMSPassedGt2 : ["月を通った部屋が連続しています。","A line passes the marks of the moon for two rooms in a row."],
	bkMUPassedGt2 : ["太陽を通った部屋が連続しています。","A line passes the marks of the sun for two rooms in a row."]
}
}));
