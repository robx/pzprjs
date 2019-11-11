(function(pidlist, classbase){
	if(typeof module==='object' && module.exports){module.exports = [pidlist, classbase];}
	else{ pzpr.classmgr.makeCustom(pidlist, classbase);}
}(
['castle'], {
MouseEvent:{
	inputModes : {edit:['number','direc','shade','unshade','clear','info-line'],play:['line','peke','completion','info-line']},

	mouseinput_auto : function(){
		if(this.puzzle.playmode){
			if(this.btn==='left'){
				if(this.mousestart || this.mousemove){ this.inputLine();}
				else if(this.mouseend && this.notInputted()){
					this.inputpeke_ifborder();
					if(this.notInputted()) { this.inputqcmp(); }
				}
			}
			else if(this.btn==='right'){
				if(this.mousestart || this.mousemove){ this.inputpeke();}
			}
		}
		else if(this.puzzle.editmode){
			if(this.mousestart || this.mousemove){ this.inputdirec(); }
			else if(this.mouseend && this.notInputted()){ this.inputqnum();}
		}
	},

	inputqcmp : function(){
		var cell = this.getcell();
		if(cell.isnull || cell.noNum()){ return;}

		cell.setQcmp(+!cell.qcmp);
		cell.draw();

		this.mousereset();
	},

	inputShade : function(){
		var cell = this.getcell();
		if(cell.isnull || cell===this.mouseCell){ return;}
		if(this.inputData===null){ 
			if(this.inputMode==='shade') {
				this.inputData = cell.ques!==1 ? 1 : cell.qnum!==-1 ? 0 : 2;
			} else {
				this.inputData = cell.ques===0 && cell.qnum===-2 ? 0 : 2;
			}
		}

		cell.setQues(this.inputData===1?1:0);
		if(cell.qnum===-1 && this.inputData!==0) {
			cell.setQnum(-2);
		} else if(cell.qnum===-2 && this.inputData===0) {
			cell.setQnum(-1);
		}

		cell.drawaround();
		this.mouseCell = cell;
	}
},
KeyEvent:{
	enablemake : true,
	moveTarget : function(ca){
		if(ca.match(/shift/)){ return false;}
		return this.moveTCell(ca);
	},

	keyinput : function(ca){
		if(ca==='q'){
			var cell = this.cursor.getc();
			if(cell.qnum===-1) {
				cell.setQues(1);
				cell.setQnum(-2);
			} else {
				cell.setQues(cell.ques===1?0:1);
			}

			this.prev=cell;
			cell.draw();
			return;
		}
		if(this.key_inputdirec(ca)){ return;}
		this.key_inputqnum(ca);
	}
},
Cell:{
	minnum : 0,
	maxnum : function(){ return Math.max(this.board.cols-2,this.board.rows-2); },

	noLP : function(dir){ return (this.isNum());},

	isUndecided: function() {
		return !this.isNum() && this.lcnt < 2;
	},

	actual: null,
	undecided: true,
	isCmp : function(){ 
		if(this.qcmp===1){ return true;}
		if(!this.puzzle.execConfig('autocmp')){ return false;}

		var dir = this.qdir;
		if(!this.isValidNum() || dir===0){ return false;}

		this.recount();

		return !this.undecided && this.actual===this.qnum;
	},
	recount: function() {
		if(this.actual!==null) { return; }

		var dir = this.qdir;
		if(!this.isValidNum() || dir===0){ return; }

		this.actual = 0;
		this.undecided = false;

		var pos = this.getaddr();
		pos.movedir(dir,1);
		while(1){
			pos.movedir(dir,2);
			var border = pos.getb();
			if(!border || border.isnull){ break;}
			if(border.isLine()) { this.actual++; }
			else if(border.qsub===0&&
					border.sidecell[0].isUndecided()&&
					border.sidecell[1].isUndecided()) {
				this.undecided = true;
			}
		}
	},
	invalidate: function () {
		this.actual = null;
		this.draw();
	}
},
Border:{
	enableLineNG : true,
	isBorder : function(){
		return (this.sidecell[0].qnum===-1)!==(this.sidecell[1].qnum===-1);
	},
	prehook : {
		qsub : function(){ return this.sidecell[0].qnum!==-1 || this.sidecell[1].qnum!==-1;}
	},
	posthook : {
		line : function(){ this.redrawAroundBorder();},
		qsub : function(){ this.redrawAroundBorder();}
	},
	redrawAroundBorder : function() {
		this.board.scanResult = null;
		var c0 = this.sidecell[0], c1 = this.sidecell[1];
		var verlist = this.board.cellinside(c0.bx, 1, c0.bx, this.board.maxby);
		var horlist = this.board.cellinside(1, c0.by, this.board.maxbx, c0.by);
		if(this.isvert) {
			verlist.extend(this.board.cellinside(c1.bx, 1, c1.bx, this.board.maxby));
		} else {
			horlist.extend(this.board.cellinside(1, c1.by, this.board.maxbx, c1.by));
		}

		horlist.each(function(cell) { if(cell.qdir===cell.LT||cell.qdir===cell.RT) { cell.invalidate(); }});
		verlist.each(function(cell) { if(cell.qdir===cell.UP||cell.qdir===cell.DN) { cell.invalidate(); }});
	}
},
Board:{
	hasborder : 1,

	scanResult: null,
	scanInside: function() {
		if(this.scanResult!==null) { return this.scanResult; }

		if(this.cell.some(function(cell){ return cell.lcnt!==0 && cell.lcnt!==2;})){ 
			this.scanResult = false;
			return false; 
		}

		for(var y = 2; y < this.maxby; y+=2) {
			var inside = false;
			for(var x = 1; x < this.maxbx; x+=2) {
				if(this.getb(x,y).isLine()) { inside ^= true; }
				this.getx(x+1,y).inside = inside;
			}
		}

		this.scanResult = true;
		return true;
	},

	rebuildInfo : function(){
		this.scanResult = null;
		this.cell.each(function(cell) { if(cell.isValidNum()) { cell.invalidate(); }});
		this.common.rebuildInfo.call(this);
	},

	subclear : function(){
		this.common.subclear.call(this);
		this.rebuildInfo();
	}
},
BoardExec:{
	adjustBoardData : function(key,d){
		this.adjustNumberArrow(key,d);
	}
},
LineGraph:{
	enabled : true
},
Graphic:{
	qcmpcolor  : "rgb(127,127,127)",
	autocmp : 'number',

	irowake : true,
	hideHatena : true,

	paint : function(){
		this.drawBGCells();
		this.drawGrid();

		this.drawBorders();
		this.drawArrowNumbers();
		this.drawLines();

		this.drawPekes();
		this.drawChassis();

		this.drawTarget();
	},

	getBGCellColor : function(cell){
		var info = cell.error || cell.qinfo;
		if(info===1){
			return (cell.ques!==1 ? this.errbcolor1 : this.errcolor1);
		} else if(cell.qnum!==-1){ 
			return (cell.ques!==1 ? 'rgb(224,224,224)' : 'black');
		}
		return null;
	},
	getQuesNumberColor : function(cell){
		return (cell.isCmp() ? this.qcmpcolor : cell.ques!==1 ? this.quescolor : "white");
	}
},
Encode:{
	decodePzpr : function(type){
		this.decodeArrowNumber16();
		this.decodeQues(1);
	},
	encodePzpr : function(type){
		this.encodeArrowNumber16();
		this.encodeQues(1);
	}
},
FileIO:{
	decodeData : function(){
		this.decodeCellDirecQnum();
		this.decodeCell( function(cell,ca){
			var num = +ca.charAt(0);
			cell.ques = (num & 1) ? 1 : 0;
			cell.qcmp = (num & 2) ? 1 : 0;
		});
		this.decodeBorderLine();
	},
	encodeData : function(){
		this.encodeCellDirecQnum();
		this.encodeCell( function(cell){
			var num = cell.ques & 1 | ((cell.qcmp & 1) << 1);
			return num + " ";
		});
		this.encodeBorderLine();
	}
},
AnsCheck:{
	checklist : [
		"checkLineExist+",
		"checkBranchLine",
		"checkCrossLine",
		"checkArrowNumberGt",
		"checkArrowNumberLt",
		"checkDeadendLine+",
		"checkOneLoop",
		"checkShadedOutside",
		"checkUnshadedInside",
		"checkNumberHasArrow"
	],

	checkArrowNumberGt: function() { this.checkArrowNumber(+1, "anLineGt"); },
	checkArrowNumberLt: function() { this.checkArrowNumber(-1, "anLineLt"); },

	checkArrowNumber : function(factor, code){
		this.checkAllCell(function(cell){ 
			cell.recount();
			return cell.isValidNum() && cell.qdir!==0 && 
				((factor < 0 && cell.actual < cell.qnum)||
				(factor > 0 && cell.actual > cell.qnum));
		}, code);
	},

	checkShadedOutside: function() {
		var bd = this.board;
		if(!bd.scanInside()) { return; }
		this.checkAllCell(function(cell){ 
			return cell.qnum!==-1 && cell.ques===1 && 
				bd.getx(cell.bx-1, cell.by-1).inside;
		}, "shInside");
	},
	checkUnshadedInside: function() {
		var bd = this.board;
		if(!bd.scanInside()) { return; }
		this.checkAllCell(function(cell){ 
			return cell.qnum!==-1 && cell.ques===0 && 
				!bd.getx(cell.bx-1, cell.by-1).inside;
		}, "cuOutside");
	}
},

FailCode:{
	anLineLt : ["(please translate) The number of line segments is not correct.","The number of line segments is not correct."],
	anLineGt : ["(please translate) The number of line segments is not correct.","The number of line segments is not correct."],
	shInside : ["(please translate) A shaded cell is inside of the loop.","A shaded cell is inside of the loop."],
	cuOutside : ["(please translate) An unshaded cell is outside of the loop.","An unshaded cell is outside of the loop."]
}

}));
