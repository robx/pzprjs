//
// pencils.js: Implementation of Pencils puzzle type.
//
(function(pidlist, classbase){
	if(typeof module==='object' && module.exports){module.exports = [pidlist, classbase];}
	else{ pzpr.classmgr.makeCustom(pidlist, classbase);}
}(
['pencils'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputModes:{edit:['arrow','number','undef','clear'],play:['border','line','arrow','peke','bgcolor','bgcolor1','bgcolor2']},
	mouseinput_number : function(){
		if(this.mousestart){ this.inputqnum_pencils();}
	},
	mouseinput : function(){ // オーバーライド
		if(this.inputMode==='undef'){
			if(this.mousestart){ this.inputqnum_pencils();}
		}
		else{ this.common.mouseinput.call(this);}
	},
	mouseinput_auto : function(){
		if(this.puzzle.playmode){
			if(this.mousestart || this.mousemove){
				if(this.btn==='left'){
					if(this.isBorderMode()) {
						this.inputborder();
					} else{
						this.inputLineOrArrow();
					}
				} else {
					this.inputpeke();
				}
			}
			else if(this.mouseend && this.notInputted() && !this.isBorderMode()) {
				this.inputBGcolor();
			}
		}
		else if(this.puzzle.editmode){
			if(this.mousestart || this.mousemove){ this.inputarrow_cell();}
			else if(this.mouseend && this.notInputted()){ this.inputqnum_pencils();}
		}
	},

	inputLineOrArrow : function(){
		var pos, border;
		pos = this.getpos(0);
		if(this.prevPos.equals(pos)){ return;}
		border = this.prevPos.getnb(pos);
		var cell0 = border.sidecell[0], cell1 = border.sidecell[1];
		
		if(!border.isnull){
			if(this.inputData===null) {
				// Do not use setPencilArrow here, leave the border intact
				if(border.isvert && (cell0.anum === border.LT || cell1.anum === border.RT)) {
					if(cell0.anum === border.LT) {cell0.setAnum(-1);}
					if(cell1.anum === border.RT) {cell1.setAnum(-1);}
					this.inputData = 0;
				}
				if(!border.isvert && (cell0.anum === border.UP || cell1.anum === border.DN)) {
					if(cell0.anum === border.UP) {cell0.setAnum(-1);}
					if(cell1.anum === border.DN) {cell1.setAnum(-1);}
					this.inputData = 0;
				}
			}

			if(this.inputData===null){ this.inputData=(border.isLine()?0:1);}
			if(this.inputData===1 && !border.ques){
				if(border.qans === 1) {
					var dir = this.getDrawArrowDirection(border);
					if(dir > 0) {
						cell1.setPencilArrow(border.isvert ? border.RT : border.DN, false);
					} else {
						cell0.setPencilArrow(border.isvert ? border.LT : border.UP, false);
					}
				} else {
					border.setLine();
				}
			}
			else if(this.inputData===0){ border.removeLine();}
			border.draw();
		}
		this.prevPos = pos;
	},

	getDrawArrowDirection: function(border) {
		if(border.sidecell[0].isnull) {return +1;}
		if(border.sidecell[1].isnull) {return -1;}

		if(border.sidecell[0].qnum > 0) {return +1;}
		if(border.sidecell[1].qnum > 0) {return -1;}

		if(border.sidecell[1].lcnt > 0 && border.sidecell[0].lcnt === 0) {return +1;}
		if(border.sidecell[0].lcnt > 0 && border.sidecell[1].lcnt === 0) {return -1;}

		if(border.sidecell[0].room.pencil) {return +1;}
		if(border.sidecell[1].room.pencil) {return -1;}

		var pos = this.getpos(0);
		var dir = this.prevPos.getdir(pos,2);

		return (dir === border.RT || dir === border.DN) ? +1 : -1;
	},

	mouseinput_clear : function(){
		var cell = this.getcell();

		if(cell.getPencilDir()) {
			cell.setPencilArrow(0, true);
		} else {
			this.inputclean_cell();
		}
	},

	inputarrow_cell_main : function(cell, dir){
		cell.setPencilArrow(dir, this.puzzle.editmode);
	},

	inputqnum_pencils : function(){
		var cell = this.getcell();
		if(cell.isnull){ return;}

		if(cell!==this.cursor.getc() && this.inputMode==='auto'){
			this.setcursor(cell);
		}
		else{
			this.inputcell_pencils(cell);
		}
	},
	
	inputcell_pencils : function(cell){
		var dir = cell.qdir, num = cell.qnum, val;
		// -4to-1:Arrow 0:? 1:何もなし 2以上:数字
		if     (num===-2){ val = 0;}
		else if(dir=== 0){ val = (num===-1?1:num+1);}
		else             { val = dir - 5;}

		var min = -4, max = cell.getmaxnum()+1;
		if(this.inputMode.match(/number/)){ min = 1;}
		if(this.inputMode==='undef'){ max = 1; min = 0;}

		if(this.btn==='left'){
			if(min<=val && val<max){ val++;  }
			else                   { val=min;}
		}
		else if(this.btn==='right'){
			if(min<val && val<=max){ val--;  }
			else                   { val=max;}
		}

		if(val >= 0) { cell.setPencilArrow(0, true);}

		if     (val >=2){ cell.setQdir(0); cell.setNum(val-1);}
		else if(val===1){ cell.setQdir(0); cell.setNum(-1);}
		else if(val===0){ cell.setQdir(0); cell.setNum(-2);}
		else            { cell.setPencilArrow(val+5, true);}
		cell.draw();
	}
},

KeyEvent:{
	enablemake : true,
	moveTarget : function(ca){
		if(ca.match(/shift/)){ return false;}
		return this.moveTCell(ca);
	},

	keyinput : function(ca){
		var cell = this.cursor.getc();
		var dir = 0;
		switch(ca){
			case 'shift+up':    dir = cell.UP; break;
			case 'shift+down':  dir = cell.DN; break;
			case 'shift+left':  dir = cell.LT; break;
			case 'shift+right': dir = cell.RT; break;
		}

		if(dir !== 0 && !cell.isnull) {
			cell.setPencilArrow(dir, true);
			this.cursor.draw();
		} else {
			this.key_inputqnum_pencils(ca);
		}
	},

	key_inputqnum_pencils : function(ca){
		var cell = this.cursor.getc();
		if(ca==='q' || ca==='-'){
			if(cell.qnum !== -2) {
				cell.setPencilArrow(0, true);
				cell.setQdir(0);
				cell.setQnum(-2);
			} else {
				cell.setPencilArrow(0, true);
				cell.setQnum(-1);
			}
		}
		else if(ca===' ' || ca==='BS'){
			cell.setPencilArrow(0, true);
			cell.setQnum(-1);
		}
		else{
			this.key_inputqnum_main(cell,ca);
			if(cell.isNum()) {
				cell.setPencilArrow(0, true);
				cell.setQdir(0);
			}
		}

		this.prev = cell;
		cell.draw();
	}
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	maxnum : function(){
		var bd=this.board;
		return Math.max(bd.cols,bd.rows)-1;
	},
	minnum : 1,

	setPencilArrow: function(dir, question) {
		if(!(dir>=0 && dir <=4)) {return -1;}

		var dirs = {};
		dirs[this.UP] = { inv: this.DN, border: this.adjborder.bottom, cell: this.adjacent.bottom };
		dirs[this.DN] = { inv: this.UP, border: this.adjborder.top,    cell: this.adjacent.top    };
		dirs[this.LT] = { inv: this.RT, border: this.adjborder.right,  cell: this.adjacent.right  };
		dirs[this.RT] = { inv: this.LT, border: this.adjborder.left,   cell: this.adjacent.left   };

		var anum = this.anum, qdir = this.qdir;

		this.setAnum(-1);

		if(anum > 0 && dirs[anum].cell.anum !== dirs[anum].inv) { dirs[anum].border.setQans(0); }

		if(question) {
			if(qdir >= 1 && qdir <= 4 && dirs[qdir].cell.qdir !== dirs[qdir].inv) { dirs[qdir].border.setQues(0); }

			if(qdir === dir) {dir = 0;}
			if(dir) {this.setQnum(-1);}

			if(dir > 0 && !dirs[dir].border.isnull) { dirs[dir].border.setQues(1); }
			this.setQdir(dir);

		} else if(!(qdir >= 1 && qdir <= 4) && this.qnum === -1) {
			if(anum === dir || dir===0) {dir = -1;}

			if(dir > 0 && !dirs[dir].border.isnull) { dirs[dir].border.setQans(1); }
			this.setAnum(dir);
		}

		return dir;
	},

	getPencilDir: function() {
		var qdir = this.qdir;
		if(qdir >= 1 && qdir <= 4) {return qdir;}
		var anum = this.anum;
		if(anum >= 1 && anum <= 4) {return anum;}
		return 0;
	},

	isStart : function(dir){
		var rect = this.room.clist.getRectSize();
		if(rect.cols>1&&rect.rows>1){ return false;}
		switch(dir){
		case this.LT: return (rect.rows===1 && this.bx===rect.x1 && this.by===rect.y1);
		case this.RT: return (rect.rows===1 && this.bx===rect.x2 && this.by===rect.y1);
		case this.UP: return (rect.cols===1 && this.bx===rect.x1 && this.by===rect.y1);
		case this.DN: return (rect.cols===1 && this.bx===rect.x1 && this.by===rect.y2);
		}
		return false;
	},

	getPencilStart : function() {
		var dir = this.getPencilDir();
		if(dir === this.UP) { return this.adjacent.bottom; }
		if(dir === this.DN) { return this.adjacent.top; }
		if(dir === this.LT) { return this.adjacent.right; }
		if(dir === this.RT) { return this.adjacent.left; }

		return this.board.emptycell;
	},

	isTip : function(){
		return (this.getPencilDir()>0);
	},

	isTipOfPencil : function(){
		var dir = this.getPencilDir();
		var start = this.getPencilStart();
		return (!start.isnull&&start.isStart(dir));
	},

	getPencilSize : function(){
		if(this.isTipOfPencil()){
			return this.getPencilStart().room.clist.length;
		}
		return 0;
	},

	insidePencil : function(){
		return this.room.isPencil();
	}
},

GraphComponent:{

	getPotentialTips : function(){
		var rect = this.clist.getRectSize();
		if(rect.cols>1&&rect.rows>1){ return [];}
		var tips = [];
		if(rect.rows===1){
			var left = this.board.getc(rect.x1, rect.y1);
			tips.push({dir: left.LT, start: left, tip: left.adjacent.left});
			var right = this.board.getc(rect.x2, rect.y1);
			tips.push({dir: right.RT, start: right, tip: right.adjacent.right});
		}
		if(rect.cols===1){
			var top = this.board.getc(rect.x1, rect.y1);
			tips.push({dir: top.UP, start: top, tip: top.adjacent.top});
			var bottom = this.board.getc(rect.x1, rect.y2);
			tips.push({dir: bottom.DN, start: bottom, tip: bottom.adjacent.bottom});
		}
		return tips;
	},

	getTips : function(){
		var tips = this.getPotentialTips();
		var cells = [];
		for(var i=0;i<tips.length;i++){
			var tip = tips[i];
			if(tip.tip.getPencilDir()===tip.dir){
				cells.push(tip.tip);
			}
		}
		return cells;
	},

	isPencil : function(){
		return (this.getTips().length>0);
	},

	seterr : function(err){
		this.clist.each(function(cell){
			if(err>cell.error){ cell.error=err;}
		});
	}
},
Board:{
	cols : 8,
	rows : 8,

	hasborder : 1
},

Border: {
	prehook : {
		qans : function(num){ 
			if (this.ques!==0) {return true;}
			if(num) {return false;}

			var cell0 = this.sidecell[0], cell1 = this.sidecell[1];

			if(this.isvert) {
				return cell0.anum === cell0.LT || cell1.anum === cell1.RT;
			}

			return cell0.anum === cell0.UP || cell1.anum === cell1.DN;
		}
	},
},
BoardExec:{
	adjustBoardData : function(key,d){
		var trans = this.getTranslateDir(key);
		var clist = this.board.cellinside(d.x1,d.y1,d.x2,d.y2);
		for(var i=0;i<clist.length;i++){
			var cell = clist[i];
			var val = trans[cell.qdir]; if(!!val){ cell.setQdir(val);}
			var val = trans[cell.anum]; if(!!val){ cell.setAnum(val);}
		}
	}
},

AreaRoomGraph:{
	enabled : true
},

LineGraph:{
	enabled : true,
	makeClist : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	gridcolor_type : "DLIGHT",

	linecolor : "rgb(80, 80, 80)",

	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();
		this.drawBorders();
		this.drawLines();

		this.drawCellArrows();
		this.drawQuesNumbers();

		this.drawPekes();

		this.drawChassis();

		this.drawTarget();
	},

	getQuesNumberColor : function(cell){
		if(cell.error===2){ return this.errcolor1;}
		if(cell.error===1){ return this.quescolor;}
		return this.getQuesNumberColor_qnum(cell);
	},

	getBGCellColor : function(cell){
		if(cell.error===2){ return this.errbcolor1;}
		return this.getBGCellColor_qsub2(cell);
	},

	getBorderColor : function(border){
		if(border.ques===1){
			return this.quescolor;
		}
		else if(border.qans===1){
			return border.error ? "red" : (!border.trial ? this.qanscolor : this.trialcolor);
		}
		return null;
	},

	drawCellArrows : function(){
		var g = this.vinc('cell_arrow', 'crispEdges');

		
		var outer = this.cw*0.5;
		var inner = this.cw*0.25;

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i];
			var dir = cell.getPencilDir();
			var color = this.getCellArrowColor(cell);
			
			g.lineWidth = (this.lw + this.addlw)/2;
			if(!!color){
				g.fillStyle = color;
				g.strokeStyle = color;
				var px = cell.bx*this.bw, py = cell.by*this.bh;
				var idx = [0,0,0,0];
				
				switch(dir){
					case cell.UP: idx = [ 1,  1, -1,  1]; break;
					case cell.DN: idx = [ 1, -1, -1, -1]; break;
					case cell.LT: idx = [ 1, -1,  1,  1]; break;
					case cell.RT: idx = [-1, -1, -1,  1]; break;
				}
				
				g.vid = "c_arrow_"+cell.id;
				g.setOffsetLinePath(px,py, 0,0, idx[0]*inner, idx[1]*inner, idx[2]*inner, idx[3]*inner, true);
				g.fill();
				
				g.vid = "c_arrow_outer_"+cell.id;
				g.setOffsetLinePath(px,py, 0,0, idx[0]*outer, idx[1]*outer, idx[2]*outer, idx[3]*outer, true);
				g.stroke();
			}
			else{ 
				g.vid = "c_arrow_"+cell.id;
				g.vhide();
				g.vid = "c_arrow_outer_"+cell.id;
				g.vhide();
			}
		}
	},

	getCellArrowColor : function(cell){
		if(cell.getPencilDir()){
			if(cell.qdir){ return this.quescolor;}
			else{ return (!cell.trial ? this.qanscolor : this.trialcolor);}
		}
		return null;
	},
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		var c=0, i=0, bstr = this.outbstr, bd = this.board;
		for(i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i), cell=bd.cell[c];

			if(this.include(ca,"0","9")||this.include(ca,"a","f"))
			   { cell.qnum = parseInt(ca,16);}
			else if(ca === '-'){ cell.qnum = parseInt(bstr.substr(i+1,2),16); i+=2;}
			else if(ca === '.'){ cell.qnum = -2;}
			else if(ca>='g' && ca<='j'){
				cell.setPencilArrow(parseInt(ca,20)-15, true);
			}
			else if(ca>='k' && ca<='z'){ c+=(parseInt(ca,36)-20);}

			c++;
			if(!bd.cell[c]){ break;}
		}
		this.outbstr = bstr.substr(i+1);
	},
	encodePzpr : function(type){
		var cm = "", count = 0, bd = this.board;
		for(var c=0;c<bd.cell.length;c++){
			var pstr="", dir=bd.cell[c].qdir, qn=bd.cell[c].qnum;
			if(qn!==-1){
				if     (qn>= 0&&qn<  16){ pstr=    qn.toString(16);}
				else if(qn>=16&&qn< 256){ pstr="-"+qn.toString(16);}
				else                    { pstr=".";}
			}
			else if(dir!==0) { pstr=(dir+15).toString(20);}
			else{ count++;}

			if     (count=== 0){ cm += pstr;}
			else if(pstr || count===16){ cm += ((count+19).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm += (count+19).toString(36);}

		this.outbstr += cm;
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCell( function(cell,ca){
			if(ca.charAt(0)==="o"){
				cell.qdir = 5;
				if(ca.length>1){ cell.qnum = +ca.substr(1);}
			}
			else if(ca!=="."){ cell.setPencilArrow(+ca, true);}
		});

		this.decodeBorderAns();
		this.decodeBorderLine();

		this.decodeCell( function(cell,ca){
			if(ca.charAt(0)==="+"){cell.qsub=1; ca = ca.substr(1);}
			else if(ca.charAt(0)==="-"){cell.qsub=2; ca = ca.substr(1);}

			if(ca!=="." && (+ca) <= 4){cell.anum = +ca;}
		});
	},
	encodeData : function(){
		this.encodeCell( function(cell){
			if(cell.qnum!==-1){
				return "o"+(cell.qnum!==-1?cell.qnum:'')+" ";
			}
			else if(cell.qdir!== 0){ return cell.qdir+" ";}
			else{ return ". ";}
		});

		this.encodeBorderAns();
		this.encodeBorderLine();
		
		this.encodeCell(function(cell){
			var ca = "";
			if(cell.qsub===1) { ca += "+";}
			else if(cell.qsub===2) { ca += "-";}

			if (cell.anum!==-1){ ca += cell.anum.toString();}

			if(ca === "") { ca = "."; }
			return ca+" ";
		});
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checklist : [
		"checkTipHasPencil",
		"checkTipNotInsidePencil",
		"checkOneTip",
		"checkPencilSize",

		"checkNumberInPencil",

		"checkLineOutsidePencil",
		"checkBranchLine",
		"checkCrossLine",
		"checkTipHasLine",
		"checkLineHasTip", // does not start at a pencil tip
		"checkLineSingleTip",

		"checkLineLength",
		"checkCellsUsed"
	],

	checkTipHasPencil : function(){
		this.checkAllCell(function(cell){ return (cell.isTip() && !cell.isTipOfPencil());}, "ptNoPencil");
	},

	checkTipNotInsidePencil : function(){
		this.checkAllCell(function(cell){ return (cell.isTip() && cell.insidePencil());}, "ptInPencil");
	},

	checkOneTip : function(){
		var rooms = this.board.roommgr.components;
		for(var r=0;r<rooms.length;r++){
			var tips=rooms[r].getTips();
			if(tips.length>1){
				this.failcode.add("pcMultipleTips");
				if(this.checkOnly){ return;}
				tips.forEach(function(cell){ cell.seterr(1);});
				rooms[r].clist.seterr(1);
			}
		}
	},

	checkPencilSize : function(){
		var rooms = this.board.roommgr.components;
		for(var r=0;r<rooms.length;r++){
			var room = rooms[r];
			if(!room.isPencil()){ continue;}
			var n=room.clist.length;
			for(var i=0;i<room.clist.length;i++){
				var cell=room.clist[i];
				if(cell.qnum>0&&cell.qnum!==n){
					this.failcode.add("nmWrongSize");
					if(this.checkOnly){ return;}
					cell.seterr(2);
					room.seterr(1);
				}
			}
		}
	},

	checkNumberInPencil : function(){
		this.checkAllCell(function(cell){
			return ((cell.qnum===-2||cell.qnum>0)&&!cell.insidePencil());
		}, "nmOutsidePencil");
	},
	checkLineOutsidePencil : function(){
		this.checkAllCell(function(cell){ return (cell.lcnt>0&&cell.insidePencil());}, "lnCrossPencil");
	},

	checkTipHasLine : function(){
		this.checkAllCell(function(cell){ return (cell.isTip()&&cell.lcnt!==1);}, "ptNoLine");
	},

	pencils_checkLines : function(func, code){
		var comps=this.board.linegraph.components;
		for(var c=0; c<comps.length; c++){
			var comp=comps[c];
			var ends=comp.clist.filter(function(cell){ return (cell.isTip()&&cell.lcnt===1);});
			if(func(ends)){
				this.failcode.add(code);
				if(this.checkOnly){ return;}
				ends.each(function(cell){ cell.seterr(1);});
				comp.setedgeerr(1);
			}
		}
	},
	checkLineHasTip : function(){
		this.pencils_checkLines(function(ends){ return (ends.length<1);}, "lnNoTip");
	},

	checkLineSingleTip : function(){
		this.pencils_checkLines(function(ends){ return (ends.length>1);}, "lnMultipleTips");
	},

	checkLineLength : function(){
		var cells=this.board.cell;
		for(var i=0;i<cells.length;i++){
			var cell=cells[i];
			if(!cell.isTip()||cell.lcnt!==1){ continue;}
			var l=cell.path.nodes.length-1;
			var s=cell.getPencilSize();
			if(s>0&&s!==l){
				this.failcode.add("lnWrongLength");
				if(this.checkOnly){ return;}
				cell.getPencilStart().room.seterr(1);
				cell.path.setedgeerr(1);
			}
		}
	},

	checkCellsUsed : function(){
		this.checkAllCell(function(cell){ return (cell.lcnt===0&&!cell.insidePencil());}, "unusedCell");
	}
},

FailCode:{
	ptNoPencil : ["(please translate) A tip is not at the short end of a 1xN rectangle.","A tip is not at the short end of a 1xN rectangle."],
	ptInPencil : ["(please translate) A tip is inside a pencil.","A tip is inside a pencil."],
	pcMultipleTips : ["(please translate) A pencil has more than one tip.","A pencil has more than one tip."],
	nmWrongSize : ["(please translate) A number is different from the length of the pencil.","A number is different from the length of the pencil."],
	nmOutsidePencil : ["(please translate) A number is not inside a pencil.","A number is not inside a pencil."],
	lnCrossPencil: ["(please translate) A line crosses a pencil.","A line crosses a pencil."],
	ptNoLine: ["(please translate) A pencil tip is not connected to a line.","A pencil tip is not connected to a line."],
	lnNoTip: ["(please translate) A line is not connected to a pencil tip.","A line is not connected to a pencil tip."],
	lnMultipleTips : ["(please translate) A line connects to more than one pencil tip.","A line connects to more than one pencil tip."],
	lnWrongLength : ["(please translate) A line has a different length than a connected pencil.","A line has a different length than a connected pencil."],
	unusedCell : ["(please translate) A cell is unused.","A cell is unused."]
}
}));
