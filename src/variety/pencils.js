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
	// TODO allow background coloring
	// TODO fix inputting hatena
	inputModes:{edit:['arrow','number','undef','clear'],play:['border','line','arrow','peke']},
	mouseinput_number : function(){
		if(this.mousestart){ this.inputqnum_loute();}
	},
	mouseinput : function(){ // オーバーライド
		if(this.inputMode==='undef' || this.inputMode==='circle-unshade'){
			if(this.mousestart){ this.inputqnum_loute();}
		}
		else{ this.common.mouseinput.call(this);}
	},
	mouseinput_auto : function(){
		if(this.puzzle.playmode){
			if(this.mousestart || this.mousemove){
				if(this.btn==='left' && this.isBorderMode()){ this.inputborder();}
				else{ this.inputLine();}
			}
			// TODO draw arrows from auto
			// TODO draw peke from auto
		}
		else if(this.puzzle.editmode){
			if(this.mousestart || this.mousemove){ this.inputarrow_cell();}
			else if(this.mouseend && this.notInputted()){ this.inputqnum_loute();}
		}
	},

	mouseinput_clear : function(){
		var cell = this.getcell();
		var dir = cell.qdir || cell.anum;

		if(dir>= 1 && dir <= 4) {
			cell.setPencilArrow(0, true);
		} else {
			this.inputclean_cell();
		}
	},

	inputarrow_cell_main : function(cell, dir){
		cell.setPencilArrow(dir, this.puzzle.editmode);
	},

	// TODO rewrite
	inputqnum_loute : function(){
		var cell = this.getcell();
		if(cell.isnull){ return;}

		if(cell!==this.cursor.getc() && this.inputMode==='auto'){
			this.setcursor(cell);
		}
		else{
			this.inputcell_loute(cell);
		}
	},


	inputcell_loute : function(cell){
		var dir = cell.qdir, num = cell.qnum, val;
		// -4to-1:Arrow 0:? 1:何もなし 2:丸のみ 3以上:数字
		if     (dir=== 5){ val = (num!==-1 ? num : 2);}
		else if(dir=== 0){ val = 1;}
		else if(dir===-2){ val = 0;}
		else             { val = dir - 5;}

		var min = -4, max = cell.getmaxnum();
		if(this.inputMode==='circle-unshade' || this.inputMode.match(/number/)){ min = 1;}
		if(this.inputMode==='undef'){ max = 1; min = 0;}

		if(this.btn==='left'){
			if(min<=val && val<max){ val++;  }
			else                   { val=min;}
		}
		else if(this.btn==='right'){
			if(min<val && val<=max){ val--;  }
			else                   { val=max;}
		}

		if     (val >=2){ cell.setQdir(5);     cell.setNum(val>=3 ? val : -1);}
		else if(val===1){ cell.setQdir(0);     cell.setNum(-1);}
		else if(val===0){ cell.setQdir(-2);    cell.setNum(-1);}
		else            { cell.setQdir(val+5); cell.setNum(-1);}
		cell.draw();
	}
},

// TODO check and rewrite all key events
KeyEvent:{
	enablemake : true,
	moveTarget : function(ca){
		if(ca.match(/shift/)){ return false;}
		return this.moveTCell(ca);
	},

	keyinput : function(ca){
		if(this.key_inputarrow(ca)){ return;}

		this.key_inputqnum_sashigane(ca);
	},

	key_inputqnum_sashigane : function(ca){
		var cell = this.cursor.getc();
		if(ca==='q'){
			cell.setQdir((cell.qdir!==5)?5:0);
			cell.setQnum(-1);
		}
		else if(ca==='-'){
			cell.setQdir((cell.qdir!==-2||cell.qnum!==-1)?-2:0);
			cell.setQnum(-1);
		}
		else if(ca==='BS' && cell.qdir===5){
			if(cell.qnum!==-1){
				this.key_inputqnum_main(cell,ca);
				if(cell.qnum===-2){
					cell.setQnum(-1);
				}
			}
			else{
				cell.setQdir(0);
				cell.setQnum(-2);
			}
		}
		else if(ca===' ' || ca==='BS'){
			cell.setQdir(0);
			cell.setQnum(-1);
		}
		else{
			this.key_inputqnum_main(cell,ca);
			if(cell.isNum() && cell.qdir!==5){ cell.setQdir(5);}
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

	// TODO fix qans border not being removed when undoing
	setPencilArrow: function(dir, question) {
		if(!(dir>=0 && dir <=4)) {return;}
		var anum = this.anum, qdir = this.qdir;

		if(!question) { this.setAnum(-1); }

		if(anum === this.UP && this.adjacent.bottom.anum !== this.DN) { this.adjborder.bottom.setQans(0); }
		if(anum === this.DN && this.adjacent.top.anum !== this.DN) { this.adjborder.top.setQans(0); }
		if(anum === this.LT && this.adjacent.right.anum !== this.RT) { this.adjborder.right.setQans(0); }
		if(anum === this.RT && this.adjacent.left.anum !== this.LT) { this.adjborder.left.setQans(0); }

		if(question) {
			if(qdir === this.UP && this.adjacent.bottom.qdir !== this.DN) { this.adjborder.bottom.setQues(0); }
			if(qdir === this.DN && this.adjacent.top.qdir !== this.DN) { this.adjborder.top.setQues(0); }
			if(qdir === this.LT && this.adjacent.right.qdir !== this.RT) { this.adjborder.right.setQues(0); }
			if(qdir === this.RT && this.adjacent.left.qdir !== this.LT) { this.adjborder.left.setQues(0); }

			if(qdir === dir) {dir = 0;}
			this.setQdir(dir);
			this.setQnum(-1);

			if(dir === this.UP && !this.adjborder.bottom.isnull) { this.adjborder.bottom.setQues(1); }
			if(dir === this.DN && !this.adjborder.top.isnull) { this.adjborder.top.setQues(1); }
			if(dir === this.LT && !this.adjborder.right.isnull) { this.adjborder.right.setQues(1); }
			if(dir === this.RT && !this.adjborder.left.isnull) { this.adjborder.left.setQues(1); }

		} else if(!(qdir >= 1 && qdir <= 4) && this.qnum === -1) {
			if(anum === dir || dir===0) {dir = -1;}
			this.setAnum(dir);

			if(dir === this.UP && !this.adjborder.bottom.isnull) { this.adjborder.bottom.setQans(1); }
			if(dir === this.DN && !this.adjborder.top.isnull) { this.adjborder.top.setQans(1); }
			if(dir === this.LT && !this.adjborder.right.isnull) { this.adjborder.right.setQans(1); }
			if(dir === this.RT && !this.adjborder.left.isnull) { this.adjborder.left.setQans(1); }
		}
	},

	// TODO clean up console.log calls
	getPencilCells: function(limit) {
		var bd = this.board;
		var list = new this.klass.CellList();
		var dir = this.qdir || this.anum;
		if(!(dir >= 1 && dir <= 4)) {return list;}
		
		var dx = 0, dy = 0, invdir = 0;
		
		if(dir === this.UP) { dy =  1; invdir = this.DN; }
		if(dir === this.DN) { dy = -1; invdir = this.UP; }
		if(dir === this.LT) { dx =  1; invdir = this.RT; }
		if(dir === this.RT) { dx = -1; invdir = this.LT; }

		var x = this.bx, y = this.by, start = true;
		while(x > bd.minbx && x < bd.maxbx && y > bd.minby && y < bd.maxby) {
			x += dx*2; y += dy*2;
			var cell = bd.getc(x, y);
			if(cell.isnull!==false) {console.log("Encountered grid edge");break;}

			var newdir = cell.qdir || cell.anum;
			if(newdir === invdir) {
				if(list.length > 0) { list.pop(); }
				console.log("Encountered inverse pencil tip");
				break;
			}

			if(newdir >= 1 && newdir <= 4) {console.log("Encountered other pencil tip");break;}
			if(cell.lcnt > 0) {console.log("Encountered line");break;}

			if(!start) {
				var border = bd.getb(x-dx, y-dy);
				if(border.qans === 1) {console.log("Encountered border");break;}
			}

			if(limit && limit === list.length) {break;}
			list.add(cell);
			
			start = false;
		}

		return list;
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

	numbercolor_func : "qnum",
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
			var dir= cell.qdir || cell.anum;
			var color = ((dir>=1 && dir<=4) ? this.getCellArrowColor(cell) : null);
			
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
		var dir = cell.qdir || cell.anum;
		if(dir>=1 && dir<=4){
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
							   { cell.qdir = 5; cell.qnum = parseInt(ca,16);}
			else if(ca === '-'){ cell.qdir = 5; cell.qnum = parseInt(bstr.substr(i+1,2),16); i+=2;}
			else if(ca === '%'){ cell.qdir = 5; cell.qnum = -2;}
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
			if(dir===5){
				if     (qn>= 0&&qn<  16){ pstr=    qn.toString(16);}
				else if(qn>=16&&qn< 256){ pstr="-"+qn.toString(16);}
				else                    { pstr="%";}
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
			else if(ca==="-"){ cell.qdir = -2;}
			else if(ca!=="."){ cell.setPencilArrow(+ca, true);}
		});

		this.decodeBorderAns();
		this.decodeBorderLine();
		this.decodeCellAnumsub();
	},
	encodeData : function(){
		this.encodeCell( function(cell){
			if(cell.qdir===5){
				return "o"+(cell.qnum!==-1?cell.qnum:'')+" ";
			}
			else if(cell.qdir===-2){ return "- ";}
			else if(cell.qdir!== 0){ return cell.qdir+" ";}
			else{ return ". ";}
		});

		this.encodeBorderAns();
		this.encodeBorderLine();
		this.encodeCellAnumsub();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checklist : [
		"checkBranchLine",
		"checkCrossLine",
		"pencilTipLineEnd",
		"crossPencilNumber",
		"crossPencilBorder",
		"pencilTipConnect",
		"checkSmallArea",
		
		"pencilZeroLength",
		"pencilSmallLength",
		"pencilTipsOverlap",
		"pencilNumberTooSmall",

		"pencilTipNoLine",
		"lineNoTip",
		"unusedCells",
		"pencilExactAreas",
		"unusedBorders"
	],

	checkSmallArea : function(){ 
		var rooms = this.board.roommgr.components;
		for(var r=0;r<rooms.length;r++){
			var clist = rooms[r].clist, d = clist.getRectSize();
			for(var i=0;i<clist.length;i++){
				var cell = clist[i];
				var qnum = cell.qnum;
				if(qnum > 0 && d.cnt < qnum) {
					this.failcode.add("bkSizeLt");
					if(this.checkOnly){ return; }
					clist.seterr(1);
				}
			}
		}
	},

	pencilTipLineEnd: function() {
		this.checkAllCell(function(cell){ return cell.lcnt>1 && ((cell.qdir >= 1 && cell.qdir <= 4) || cell.anum > 0);}, "ptBranch");
	},

	pencilTipNoLine: function() {
		this.checkAllCell(function(cell){ return cell.lcnt===0 && ((cell.qdir >= 1 && cell.qdir <= 4) || cell.anum > 0);}, "ptNoLine");
	},

	crossPencilNumber: function() {
		this.checkAllCell(function(cell){ return cell.lcnt>0 && (cell.qnum > 0 || cell.qnum === -2);}, "lnCrossNumber");
	},

	crossPencilBorder: function() {
		var bds = this.board.border;
		
		for(var b=0; b<bds.length; b++) {
			var border = bds[b];
			if(border.line === 1 && (border.ques === 1 || border.qans === 1)) {
				this.failcode.add("lnCrossBorder");
				if(this.checkOnly){ return; }
				border.seterr(1);
			}
		}
	},

	pencilTipConnect: function() {
		this.pencils_checkLines(function(ends) {return ends.length > 1;}, "ptConnect"); 
	},

	lineNoTip: function() {
		this.pencils_checkLines(function(ends) {return ends.length === 0;}, "lnNoTip"); 
	},

	pencils_checkLines: function(func, code) {
		var comps = this.board.linegraph.components;
		for(var c=0; c < comps.length; c++) {
			var comp = comps[c];
			var ends = comp.clist.filter(function(node){ return node.qdir > 0 || node.anum > 0; });

			if(func(ends)) {
				this.failcode.add(code);
				if(this.checkOnly){ return; }
				for(var i=0; i < ends.length; i++) {
					ends[i].seterr(1);
				}
				comp.setedgeerr(1);
			}
		}
	},

	pencilTipsOverlap: function() {
		for(var c=0;c<this.board.cell.length;c++){
			var cell = this.board.cell[c];
			var dir = cell.qdir || cell.anum;
			if(!(dir >= 1 && dir <= 4)) {continue;}
			if(cell.lcnt > 1) {continue;}
			
			var cells = cell.getPencilCells(cell.path ? cell.path.nodes.length - 1 : 1);
			
			var dx = 0, dy = 0, dir1 = 0, dir2 = 0;
			if(dir===cell.UP||dir===cell.DN) {
				dx = 2; dir1 = cell.LT; dir2 = cell.RT;
			} else {
				dy = 2; dir1 = cell.UP; dir2 = cell.DN;
			}

			for(var cc=0; cc<cells.length;cc++) {
				var cellb = cells[cc];
				var cell1 = this.board.getc(cellb.bx - dx, cellb.by - dy);
				if(cell1.qdir === dir1 || cell1.anum === dir1) {
					this.failcode.add("ptOverlap");
					if(this.checkOnly){ return;}
					cell.seterr(1);
					cells.seterr(1);
					cell1.seterr(1);
				}

				var cell2 = this.board.getc(cellb.bx + dx, cellb.by + dy);
				if(cell2.qdir === dir2 || cell2.anum === dir2) {
					this.failcode.add("ptOverlap");
					if(this.checkOnly){ return;}
					cell.seterr(1);
					cells.seterr(1);
					cell2.seterr(1);
				}
			}
		}
	},

	pencilZeroLength: function (){
		for(var c=0;c<this.board.cell.length;c++){
			var cell = this.board.cell[c];
			var dir = cell.qdir || cell.anum;
			if(!(dir >= 1 && dir <= 4)) {continue;}
			
			var cells = cell.getPencilCells(1);
			
			if(cells.length > 0) {continue;}

			this.failcode.add("pencilNoLength");
			if(this.checkOnly){ return;}
			cell.seterr(1);
			
			if(dir === cell.UP) { cell.adjacent.bottom.seterr(1); }
			if(dir === cell.DN) { cell.adjacent.top.seterr(1); }
			if(dir === cell.LT) { cell.adjacent.right.seterr(1); }
			if(dir === cell.RT) { cell.adjacent.left.seterr(1); }
		}
	},

	pencilSmallLength: function (){
		for(var c=0;c<this.board.cell.length;c++){
			var cell = this.board.cell[c];
			if(!((cell.qdir >= 1 && cell.qdir <= 4) || cell.anum > 0)) {continue;}
			if(cell.lcnt !== 1) {continue;}
			
			var cells = cell.getPencilCells();
			
			if(cells.length >= cell.path.nodes.length - 1) {continue;}

			this.failcode.add("pencilSmallLength");
			if(this.checkOnly){ return;}
			cell.seterr(1);
			cells.seterr(1);
			cell.path.setedgeerr(1);
		}
	},

	pencilNumberTooSmall: function() {
		for(var c=0;c<this.board.cell.length;c++){
			var cell = this.board.cell[c];
			var dir = cell.qdir || cell.anum;
			if(!(dir >= 1 && dir <= 4)) {continue;}
			if(cell.lcnt !== 1) {continue;}
			
			var cells = cell.getPencilCells(cell.path.nodes.length - 1);
			
			if(cells.some(function(cellb){return cellb.qnum > 0 && cellb.qnum < cell.path.nodes.length - 1;})) {
				this.failcode.add("bkSizeGt");
				if(this.checkOnly){ return;}
				cells.seterr(1);
			}
		}
	},

	unusedCells: function() {
		var empty = this.board.cell.filter(function(c) { return c.lcnt === 0; });

		for(var c=0;c<this.board.cell.length;c++){
			var cell = this.board.cell[c];
			var dir = cell.qdir || cell.anum;
			if(!(dir >= 1 && dir <= 4)) {continue;}
			if(cell.lcnt !== 1) {continue;}

			var cells = cell.getPencilCells(cell.path.nodes.length - 1);
			cells.each(function(c) {empty.remove(c);});
		}

		if(empty.length > 0) {
			this.failcode.add("unusedCell");
			if(this.checkOnly){ return;}
			empty.seterr(1);
		}
	},

	pencilExactAreas : function() {
		for(var c=0;c<this.board.cell.length;c++){
			var cell = this.board.cell[c];
			var dir = cell.qdir || cell.anum;
			if(!(dir >= 1 && dir <= 4)) {continue;}
			if(cell.lcnt !== 1) {continue;}

			var cellb = this.board.emptycell;
			if(dir === cell.UP) { cellb = cell.adjacent.bottom; }
			if(dir === cell.DN) { cellb = cell.adjacent.top; }
			if(dir === cell.LT) { cellb = cell.adjacent.right; }
			if(dir === cell.RT) { cellb = cell.adjacent.left; }

			var area = cellb.room.clist.getRectSize();
			if(area.cols * area.rows !== cell.path.nodes.length - 1 || (area.cols !== 1 && area.rows !== 1)) {
				this.failcode.add("pencilExactArea");
				if(this.checkOnly){ return;}
				cell.seterr(1);
			}
		}
	},

	unusedBorders: function() {
		var list = new this.klass.CellList();

		for(var c=0;c<this.board.cell.length;c++){
			var cell = this.board.cell[c];
			var dir = cell.qdir || cell.anum;
			if(!(dir >= 1 && dir <= 4)) {continue;}
			if(cell.lcnt !== 1) {continue;}

			var cells = cell.getPencilCells(cell.path.nodes.length - 1);
			list.extend(cells);
		}

		var bds = this.board.border;
		
		for(var b=0; b<bds.length; b++) {
			var border = bds[b];
			if(border.qans === 1 && !list.include(border.sidecell[0]) && !list.include(border.sidecell[1])) {
				this.failcode.add("unusedBorder");
				if(this.checkOnly){ return; }
				border.seterr(1);
			}
		}
	}
},

FailCode:{
	bkSizeLt : ["<number too large>","A number is bigger than the size of the pencil."],
	bkSizeGt : ["<number too small>","A number is smaller than the size of the pencil."],
	lnCrossBorder: ["<line crosses pencil>","A line crosses a pencil."],
	lnCrossNumber: ["<line crosses pencil>","A line crosses a pencil."],
	lnNoTip: ["<line has no pencil>","A line is not connected to a pencil."],
	ptBranch : ["<pencil tip is not line end>","A line doesn't stop at a pencil tip."],
	ptOverlap : ["<multiple tips>","A pencil has multiple tips."],
	ptConnect : ["<line connects to multiple tips>","A line connects to two pencils."],
	ptNoLine : ["<pencil has no line>","A pencil tip doesn't have a line."],
	pencilNoLength : ["<pencil no length>","A pencil has no length."],
	pencilSmallLength : ["<pencil wrong length>","A line has a different length from its pencil."],
	unusedCell : ["<unused cell>","A cell is unused."],
	pencilExactArea: ["<pencil wrong area>","A pencil is not a 1xN rectangle."],
	unusedBorder : ["<unused border>","A border is unused."]
}
}));
