//
// curvedata.js: Implementation of Curve Data puzzle type.
//

/* global Set:false */

(function(pidlist, classbase){
	if(typeof module==='object' && module.exports){module.exports = [pidlist, classbase];}
	else{ pzpr.classmgr.makeCustom(pidlist, classbase);}
}(
['curvedata','curvedata-aux'], {

// In this puzzle, clue numbers are not stable. They can be changed on the entire board
// by a call to `compressShapes()`. Operations which change qnum directly are not permitted.
// Use CurveDataOperation for all changes to clues on the grid.
"MouseEvent@curvedata":{
	inputModes : {edit:['copy-answer','move-clue','border','shade','undef','clear'],play:['line','peke']},
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
		else if(this.puzzle.editmode && this.mousestart) {
			var cell = this.getcell();
			if(cell.isnull){ return;}

			this.setcursor(cell);
			var shape = this.board.shapes[cell.qnum];
			var w = this.puzzle.board.cols;
			var h = this.puzzle.board.rows;

			if(shape && shape.w > 0) {
				w = Math.max(w, shape.w);
				h = Math.max(h, shape.bits.length / shape.w);
			}

			var data = [w, h];

			if(shape && shape.w > 0) {
				data.push(shape.w);
				data.push(shape.bits.length / shape.w);
				data.push(shape.encodeBits());
			}

			var thiz = this;
			var args = {
				pid: "curvedata-aux",
				key: cell.bx+","+cell.by,
				url: data.join("/")
			};

			this.puzzle.emit("request-aux-editor", args, function(auxpuzzle) {
				var shape = auxpuzzle.board.getShape();
				if(shape || cell.qnum >= 0) {
					thiz.addOperation(cell, shape);
				}
			});
		}
	},

	addOperation: function(cell, shape) {
		var ope = new this.klass.CurveDataOperation(cell, shape);
		if(ope.isvalid) {
			ope.redo();
			this.puzzle.opemgr.add(ope);
			cell.draw();
		}
	},

	inputShade : function(){ return this.enterqnum(-3); },
	mouseinput_undef : function(){ return this.enterqnum(-2); },
	mouseinput_clear : function(){ return this.enterqnum(-1); },

	enterqnum: function(value) {
		var cell = this.getcell();
		if(cell.isnull || cell===this.mouseCell || !this.puzzle.editmode){ return;}

		this.mouseCell = cell;
		if(this.mousestart) {
			this.inputData = cell.qnum !== value ? value : -1;
		}

		if(this.inputData===-3) {
			["left", "right", "top", "bottom"].forEach(function(dir) {
				if(!cell.adjborder[dir].isnull) {
					cell.adjborder[dir].setQues(0);
					cell.adjborder[dir].removeLine();
				}
			});
		}

		this.addOperation(cell, this.inputData);
	},

	mouseinput_other : function(){
		if(this.inputMode==='copy-answer' && this.mousestart){ this.mouseinput_copyAnswer();}
		if(this.inputMode==='move-clue'){ this.mouseinput_moveClue();}
	},

	mouseinput_copyAnswer: function() {
		var cell = this.getcell();
		if(cell.isnull || !this.puzzle.editmode){ return;}

		if(!cell.path) {return;}

		var shape = cell.path.clist.toCurveData();
		this.addOperation(cell, shape);
	},

	mouseinput_moveClue: function() {
		var cell = this.getcell();

		if(this.mousestart) {
			this.mouseCell = cell.qnum !== -1 && cell.qnum !== -3 ? cell : null;
			return;
		}

		if(!this.mouseCell || cell.isnull) { return;}

		if(!this.mouseCell.equals(cell) && cell.qnum === -1) {
			var swap = this.board.shapes[this.mouseCell.qnum] || this.mouseCell.qnum;

			this.addOperation(cell, swap);
			this.addOperation(this.mouseCell, -1);

			this.mouseCell = cell;
		}
	}
},

"MouseEvent@curvedata-aux":{
	inputModes : {edit:[],play:['line','slide']},
	mouseinput_auto : function(){
		this.inputLine();
	},

	mouseinput_other : function(){
		if(this.inputMode==='slide'){ this.mouseinput_slide();}
	},

	mouseinput_slide: function() {
		var cell = this.getcell();

		if(this.mousestart) {
			this.inputData = cell.lcnt > 0 ? cell : null;
			return;
		}

		if(!this.inputData || cell.isnull) { return;}

		if(this.inputData.bx < cell.bx && this.addSlideOperation("R", this.inputData)) {
			this.inputData = this.inputData.adjacent.right;
		}
		else if(this.inputData.bx > cell.bx && this.addSlideOperation("L", this.inputData)) {
			this.inputData = this.inputData.adjacent.left;
		}
		else if(this.inputData.by < cell.by && this.addSlideOperation("D", this.inputData)) {
			this.inputData = this.inputData.adjacent.bottom;
		}
		else if(this.inputData.by > cell.by && this.addSlideOperation("U", this.inputData)) {
			this.inputData = this.inputData.adjacent.top;
		}
	},

	addSlideOperation: function(dir, cell) {
		var ope = new this.klass.SlideOperation(dir, cell);
		if(ope.isvalid()) {
			ope.redo();
			this.puzzle.opemgr.add(ope);
			return true;
		}
		return false;
	}
},

Border:{
	enableLineNG : true,
	isLineNG : function(){
		return this.ques===1 ||
			this.sidecell[0].qnum === -3 ||
			this.sidecell[1].qnum === -3;
	},

	prehook: {
		ques: function(num) {
			if(num>0){ this.removeLine(); }
			return false;
		}
	}
},

Board:{
	hasborder : 1,

	shapes: [],

	createExtraObject : function(){
		this.shapes = [];
	},

	compressShapes: function() {
		var map = {};
		var i;
		for(i = 0; i < this.cell.length; i++) {
			map[this.cell[i].qnum] = true;
		}

		map[-1] = -1;
		map[-2] = -2;
		map[-3] = -3;

		var next = 0;
		for(i = 0; i < this.shapes.length; i++) {
			if(i in map) {
				map[i] = next++;
			}
		}

		if(next!==i) {
			for(i = 0; i < this.cell.length; i++) {
				this.cell[i].qnum = map[this.cell[i].qnum];
			}

			for(i = 0; i < this.shapes.length; i++) {
				this.shapes[map[i]] = this.shapes[i];
			}

			this.shapes = this.shapes.slice(0, next);

			for(i = 0; i < this.linegraph.components.length; i++) {
				var path = this.linegraph.components[i];
				path.isomorphicWith = null;
				this.linegraph.components.scanForClues(path);
			}
		}
	}
},

"Board@curvedata-aux": {
	setShape: function(shape) {
		var w = shape.w;
		var h = shape.bits.length / w;
		var sx = (this.cols - w) | 1;
		var sy = (this.rows - h) | 1;
		for(var y = 0; y < h; y++){
			for(var x = 0; x < w; x++){
				var cell = this.getc(x*2 + sx, y*2+ sy);
				if(!cell || cell.isnull) {continue;}
				if((shape.bits[y*w+x] & 1) && !cell.adjborder.right.isnull){
					cell.adjborder.right.setLine(1);
				}
				if((shape.bits[y*w+x] & 2) && !cell.adjborder.bottom.isnull){
					cell.adjborder.bottom.setLine(1);
				}
			}
		}
	},

	getShape: function() {
		var path = this.cell.filter(function(cell) { return cell.lcnt > 0; });
		return path && path.length > 0 && new this.klass.CellList(path).toCurveData();
	}
},

CurveData: {
	// A curve data clue is defined by an array of numbers 0-15, and a width.
	// Each number is made of four bits. Only the lower two bits can be modified,
	// the other bits are set by a call to `buildBits()`.
	// 1 = horizontal line connecting right
	// 2 = vertical line connecting down
	// 4 = horizontal line connecting left
	// 8 = vertical line connecting up
	//
	// The values 5 and 10 are special, as they represent a straight line of length 1.
	// These are not part of the graph, since lines can be of any length.
	bits: [],
	w: 0,

	// The following fields are derived from the `bits` and `w` values.
	// If their values are null, `build()` must be called to fill them.
	//
	// Positions is a map with node shapes as keys, and an array of indexes as the value.
	// A node shape is defined by the bit value of itself and its four neighbours.
	// Using more distinct keys (instead of only the value of `bits`) keeps each array of
	// positions short, which means less permutations and less total combinations.
	positions: null,
	// Connections is a map with positions in `bits` as the key,
	// and a map of four position arrays as the value. This represents the graph.
	connections: null,
	nodecnt: 0,
	// Cached result of encodeBits().
	serialized: null,

	initialize: function() {
		this.w = 0;
		this.bits = [];
		this.invalidate();
	},

	init: function(rows, cols) {
		var len = rows*cols;
		this.w = rows;
		this.bits = Array(len);
		for(var i = 0; i < len; i++) {this.bits[i] = 0;}
		this.invalidate();
	},

	invalidate: function() {
		this.positions = null;
		this.connections = null;
		this.nodecnt = 0;
		this.serialized = null;
	},

	buildBits: function() {
		var len = this.bits.length;
		var w = this.w;
		// Complete the bits array.
		for(var id = 0; id < len; id++) {
			this.bits[id] &= 3;
			var x = Math.floor(id % w);
			var y = Math.floor(id / w);
			if(x > 0 && (this.bits[y*w+x-1] & 1)) {this.bits[id] |= 4;}
			if(y > 0 && (this.bits[(y-1)*w+x] & 2)) {this.bits[id] |= 8;}
		}
	},

	build: function() {
		var len = this.bits.length;
		var w = this.w;
		var h = len / this.w;
		this.positions = {};
		this.connections = {};
		this.nodecnt = 0;

		this.buildBits();

		// Fill the connections map.
		for(var id = 0; id < len; id++) {
			var key = this.bits[id];
			if(key===0||key===5||key===10){continue;}
			this.connections[id] = {left:[], right:[], top:[], bottom:[]};
			this.nodecnt++;
		}
		// Horizontal connections
		for(var y = 0; y < h; y++) {
			var hold = null;
			for(var x = 0; x < w; x++) {
				var id = y*w+x;
				if(hold===null && (this.bits[id] & 1)) {
					hold = [id];
				} else if (hold!==null && this.bits[id]!==5) {
					hold.push(id);
					if(!(this.bits[id] & 1)) {
						var conns = this.connections;
						hold.forEach(function (pos, index) {
							conns[pos].left = hold.slice(0, index);
							conns[pos].right = hold.slice(index);
						});
						hold = null;
					}
				}
			}
		}
		// Vertical connections
		for(var x = 0; x < w; x++) {
			var hold = null;
			for(var y = 0; y < h; y++) {
				var id = y*w+x;
				if(hold===null && (this.bits[id] & 2)) {
					hold = [id];
				} else if (hold!==null && this.bits[id]!==10) {
					hold.push(id);
					if(!(this.bits[id] & 2)) {
						var conns = this.connections;
						hold.forEach(function (pos, index) {
							conns[pos].top = hold.slice(0, index);
							conns[pos].bottom = hold.slice(index);
						});
						hold = null;
					}
				}
			}
		}

		// Fill the positions map.
		for(var id = 0; id < len; id++) {
			var bits = this.bits[id];
			if(bits===0||bits===5||bits===10){continue;}

			var conns = this.connections[id];
			var allBits = this.bits;
			var mapBits = function(i) { return allBits[i]; }

			var key = [bits, "R", conns.right.map(mapBits).join(","),
					"B", conns.bottom.map(mapBits).join(","),
					"L", conns.left.map(mapBits).join(","),
					"T", conns.top.map(mapBits).join(",")
				].join("");
			if(key in this.positions) {
				this.positions[key].push(id);
			} else {
				this.positions[key] = [id];
			}
		}
	},

	deepEquals: function(other) {
		return other && this.w === other.w && this.encodeBits() === other.encodeBits();
	},

	isIsomorphic: function(other) {
		if(!other) {return false;}

		if(!this.positions) {this.build();}
		if(!other.positions) {other.build();}

		if(this.nodecnt !== other.nodecnt) {return false;}

		// Compare the total count of each node type.
		for(var key in this.positions) {
			if(!(key in other.positions) ||
					this.positions[key].length !== other.positions[key].length) {
				return false;
			}
		}

		var states = [];
		var matching = {};

		for(var key in this.positions) {
			var pos1 = this.positions[key];
			var pos2 = other.positions[key];

			var len = pos1.length;
			if(len === 1) {
				matching[pos1[0]] = pos2[0];
				continue;
			}

			// State for Heap's algorithm for finding permutations.
			var c = new Array(len);
			for(var i = 0; i < len; i++) {
				c[i] = 0;
				matching[pos1[i]] = pos2[i];
			}
			states.push({
				c: c, input: pos1, other: pos2, current: pos1.slice()
			});
		}

		while(true) {
			if(this.isConnectionsEqual(other, matching)) {
				return true;
			}

			var s = 0;
			for(s = 0; s < states.length; s++) {
				var state = states[s];
				var step = this.permute_next(state);
				for(var i = 0; i < state.c.length; i++) {
					matching[state.current[i]] = state.other[i];
				}
				if(step) {break;}
			}

			if(s === states.length) {
				return false;
			}
		}
	},

	permute_next: function (state) {
		var i = 1;
		while (i < state.c.length) {
			if (state.c[i] < i) {
				var k = i % 2 && state.c[i];
				var p = state.current[i];
				state.current[i] = state.current[k];
				state.current[k] = p;
				state.c[i]++;

				return true;
			} else {
				state.c[i++] = 0;
			}
		}

		// Reset for next loop
		for(i = 0; i < state.c.length; i++) {
			state.current[i] = state.input[i];
			state.c[i] = 0;
		}
		return false;
	},

	isConnectionsEqual: function(other, matching) {
		for(var id in this.connections) {
			var conn = this.connections[id];
			var otherconn = other.connections[matching[id]];

			if(conn.right.length!==otherconn.right.length) {
				return false;
			}
			for(var j = 0; j < conn.right.length; j++) {
				if(otherconn.right[j]!==matching[conn.right[j]]) {
					return false;
				}
			}
			if(conn.bottom.length!==otherconn.bottom.length) {
				return false;
			}
			for(var j = 0; j < conn.bottom.length; j++) {
				if(otherconn.bottom[j]!==matching[conn.bottom[j]]) {
					return false;
				}
			}
		}
		return true;
	},

	encodeBits: function() {
		if(this.serialized!==null) { return this.serialized; }
		var bits = "";
		var len = this.bits.length;
		for(var b = 0; b < len-1; b+= 2) {
			var bit = this.bits[b] & 3;
			bit |= (this.bits[b+1] & 3) << 2;
			bits += bit.toString(16);
		}
		this.serialized = bits;
		return bits;
	},

	decodeBits: function(code) {
		var len = this.bits.length;
		for(var b = 0; b < len-1; b+= 2) {
			var num = parseInt(code[b/2], 16);
			this.bits[b] = num & 3;
			this.bits[b+1] = (num & 12) >> 2;
		}
		this.invalidate();
	}
},

"CurveDataOperation:Operation": {
	type: 'curvedata',

	setData: function(cell, shape) {
		var old = cell.board.shapes[cell.qnum];

		if(old) {
			this.oldw = old.w;
			this.oldh = old.bits.length / old.w;
			this.oldbits = old.encodeBits();
		} else {
			this.oldqnum = cell.qnum;
		}

		if(shape && typeof shape === "object") {
			if(shape.bits.length > 0) {
				this.neww = shape.w;
				this.newh = shape.bits.length / shape.w;
				this.newbits = shape.encodeBits();
			} else { this.newqnum = -1; }
		} else if(typeof shape ==="number" && shape < 0) {
			this.newqnum = shape;
		} else if(!shape && shape !== 0) {
			this.newqnum = -1;
		} else {
			throw Error("Can only set shapes or negative qnum values");
		}

		this.x = cell.bx;
		this.y = cell.by;

		this.isvalid = this.oldw !== this.neww || this.oldh !== this.newh ||
					   this.oldbits !== this.newbits ||
					   this.oldqnum !== this.newqnum;
	},

	decode: function(strs) {
		var i = 0;
		if(strs[i++] !== "DC") {return false;}

		this.x = +strs[i++];
		this.y = +strs[i++];

		this.neww = +strs[i++];
		this.newh = +strs[i++];
		this.newbits = strs[i++];
		this.newqnum = +strs[i++];

		this.oldw = +strs[i++];
		this.oldh = +strs[i++];
		this.oldbits = strs[i++];
		this.oldqnum = +strs[i++];

		return true;
	},

	toString : function() {
		return ["DC", this.x, this.y,
			this.neww, this.newh, this.newbits, this.newqnum,
			this.oldw, this.oldh, this.oldbits, this.oldqnum].join(",");
	},

	undo: function() {
		if(this.oldqnum) {
			this.execNum(this.oldqnum);
		} else {
			this.execShape(this.oldw, this.oldh, this.oldbits);
		}
	},
	redo: function() {
		if(this.newqnum) {
			this.execNum(this.newqnum);
		} else {
			this.execShape(this.neww, this.newh, this.newbits);
		}
	},
	execShape: function(w, h, data) {
		var shape = new this.klass.CurveData();
		shape.init(w, h);
		shape.decodeBits(data);

		var len = this.board.shapes.length;
		for(var i = 0; i < len; i++) {
			if(this.board.shapes[i].deepEquals(shape)) {
				return this.execNum(i);
			}
		}

		this.board.shapes.push(shape);
		return this.execNum(len);
	},

	execNum: function(num) {
		var cell = this.board.getc(this.x, this.y);
		cell.qnum = num;
		if(cell.path) {
			this.board.linegraph.scanForClues(cell.path);
		}

		cell.draw();
	}
},

"SlideOperation:Operation": {
	setData: function(dir, cell) {
		this.dir = dir;
		this.x = cell.bx;
		this.y = cell.by;
	},

	toString: function() {
		return ["DS", this.dir, this.x, this.y].join(",");
	},

	decode: function(strs) {
		if(strs[0] !== "DS") {return false;}

		this.dir = strs[1];
		this.x = +strs[2];
		this.y = +strs[3];

		return true;
	},

	slide: function(dir, x, y) {
		var shape = this.board.getc(x, y).path;

		var dx = {R: 2, L: -2}[dir] || 0;
		var dy = {D: 2, U: -2}[dir] || 0;

		var set = new Set();
		shape.nodes.forEach(function(node) {
			for(var key in node.obj.adjborder) {
				var value = node.obj.adjborder[key];
				if(!value.isnull && value.line) {
					set.add(value.id);
				}
			}
		});

		var ids = Array.from(set);
		var sorter = dir === "R" || dir === "D" ?
			function(a, b) {return b-a;} :
			function(a, b) {return a-b;};
		ids.sort(sorter);

		for(var key in ids) {
			var bd = this.board.border[ids[key]];
			var next = this.board.getb(bd.bx+dx,bd.by+dy);

			bd.line = 0;
			next.line = 1;

			this.board.modifyInfo(bd, "border.line");
			bd.draw();
			this.board.modifyInfo(next, "border.line");
			next.draw();
		}
	},

	undo: function() {
		switch(this.dir) {
			case "L":
				return this.slide("R", this.x-2, this.y);
			case "R":
				return this.slide("L", this.x+2, this.y);
			case "U":
				return this.slide("D", this.x, this.y-2);
			case "D":
				return this.slide("U", this.x, this.y+2);
		}
	},

	redo: function() {
		return this.slide(this.dir, this.x, this.y);
	},

	isvalid: function() {
		var shape = this.board.getc(this.x, this.y).path;
		if(!shape) {return false;}

		var dir = {U: "top", D: "bottom", L:"left", R:"right"}[this.dir];

		for(var key = 0; key < shape.clist.length; key++) {
			var next = shape.clist[key].adjacent[dir];
			if(!next || next.isnull || (next.path && next.path !== shape)) {
				return false;
			}
		}

		return true;
	}
},

OperationManager:{
	addExtraOperation : function(){
		this.operationlist.push(this.klass.CurveDataOperation);
		this.operationlist.push(this.klass.SlideOperation);
	}
},

Cell: {
	minnum: 0,
	maxnum: function() {
		return this.board.shapes.length - 1;
	},

	getBits: function() {
		var bits = 0;
		var map = {right: 1, bottom: 2, left: 4, top: 8};
		for(var key in map) {
			if(this.adjborder[key].isLine()) {
				bits |= map[key];
			}
		}
		return bits;
	}
},

CellList: {
	toCurveData: function() {
		var rect = this.getRectSize();
		var data = new this.klass.CurveData();
		data.init(rect.cols, rect.rows);

		for(var index = 0; index < this.length; index++) {
			var cell = this[index];
			var id = ((cell.by - rect.y1)/2)*rect.cols + ((cell.bx - rect.x1)/2);
			if(cell.adjborder.right.isLine()) { data.bits[id] |= 1; }
			if(cell.adjborder.bottom.isLine()) { data.bits[id] |= 2; }
		}

		return data;
	}
},

LineGraph:{
	enabled : true,
	makeClist: true,

	invalidateClue: function(id) {
		for(var i = 0; i < this.components.length; i++) {
			var component = this.components[i];
			if(component.isomorphicWith === id) {component.isomorphicWith = null;}
		}
	},

	scanForClues: function(component) {
		component.cluecnt = 0;
		component.clueid = null;

		for(var i=0;i<component.nodes.length;i++){
			var cell = component.nodes[i].obj;
			if(cell.qnum === -1) {continue;}
			if(component.cluecnt===0) {
				component.cluecnt = 1;
				component.clueid = cell.qnum;
			} else {
				component.cluecnt = 2;
				component.clueid = null;
				return;
			}
		}
	},

	setExtraData : function(component){
		this.common.setExtraData.call(this, component);

		component.isomorphicWith = null;
		component.shape = null;

		this.scanForClues(component);
	}
},

"Graphic@curvedata":{
	irowake : true,
	gridcolor_type : "LIGHT",

	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();

		this.drawPekes();
		this.drawLines();

		this.drawCellShapes();
		this.drawHatenas();

		this.drawBorders();
		this.drawChassis();
		this.drawTarget();
	},

	drawCellShapes : function(){
		var g = this.vinc('cell_shape', 'auto');

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i];

			if(cell.qnum >= 0){
				var shape = this.board.shapes[cell.qnum];
				if(!shape || !shape.bits.length){continue;}
				var w = shape.w;
				var h = shape.bits.length / w;

				var step = Math.min(this.bw/(w-1), this.bh/(h-1)) * 1.3;
				var lw = Math.min(this.lw/2, step/4);
				var dot = lw/2;
				g.lineWidth = lw;

				var px = (cell.bx*this.bw) - (step*(w-1))/2;
				var py = (cell.by*this.bh) - (step*(h-1))/2;

				g.strokeStyle = "black";

				g.vid = "c_shape_"+cell.id;
				g.beginPath();

				for(var y = 0; y < h; y++) {
					for(var x = 0; x < w-1; x++) {
						if(shape.bits[y*w+x] & 1) {
							g.moveTo(px+(x*step) - dot, py+(y*step));
							g.lineTo(px+((x+1)*step) + dot, py+(y*step));
						}
					}
				}
				for(var y = 0; y < h-1; y++) {
					for(var x = 0; x < w; x++) {
						if(shape.bits[y*w+x] & 2) {
							g.moveTo(px+(x*step), py+(y*step) - dot);
							g.lineTo(px+(x*step), py+((y+1)*step) + dot);
						}
					}
				}

				g.closePath();
				g.stroke();
			}
			else{
				g.vid = "c_shape_"+cell.id;
				g.vhide();
			}
		}
	},

	getBorderColor : function(border){
		if(border.ques===1 || border.sidecell[0].qnum===-3 || border.sidecell[1].qnum===-3) { return this.quescolor;}
		return null;
	},

	getBGCellColor : function(cell){
		if(cell.qnum===-3) { return this.quescolor; }
		if(cell.error) { return this.errbcolor1;}
		return null;
	}
},

"Graphic@curvedata-aux":{
	gridcolor_type : "LIGHT",
	linecolor: "black",

	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();
		this.drawLines();
		this.drawChassis();
	}
},

BoardExec:{
	adjustBoardData : function(key,d){
		if(key & this.TURNFLIP){
			var trans = this.getTranslateBits(key);

			var count = this.board.shapes.length;
			for(var id = 0; id < count; id++) {
				var data = this.board.shapes[id];
				var w = data.w;
				var len = data.bits.length;
				var h = len/w;
				data.buildBits();
				var newBits = Array(len);

				for(var b = 0; b < len; b++) {
					var bit = data.bits[b];
					if(bit in trans) {bit = trans[bit];}
					newBits[this.getTranslatePosition(key, w, h, b)] = bit;
				}

				if(key & this.TURN) {
					data.w = h;

					for(var y = 0; y < h; y++) {
						for(var x = 0; x < w; x++) {
							data.bits[x*h+y] = newBits[y*w+x];
						}
					}
				} else {
					data.bits = newBits;
				}
				data.invalidate();
			}

			if(key === this.TURNR) {
				this.adjustBoardData(this.FLIPX, d);
			} else if(key === this.TURNL) {
				this.adjustBoardData(this.FLIPY, d);
			}
		}
	},

	getTranslatePosition: function(key, w, h, id) {
		var x = Math.floor(id%w);
		var y = Math.floor(id/w);

		switch(key){
			case this.FLIPY:
				return (h-(y+1))*w + x;
			case this.FLIPX:
				return y*w + (w-(x+1));
			default:
				return id;
		}
	},

	getTranslateBits: function(key) {
		var trans = {};
		switch(key){
			case this.FLIPY:
				trans={2:8, 3:9, 6:12, 7:13,
					8:2, 9:3, 12:6, 13:7};
				break;
			case this.FLIPX:
				trans={1:4, 3:6, 9:12, 11:14,
					4:1, 6:3, 12:9, 14:11};
				break;
			case this.TURNR:
			case this.TURNL:
				// Transpose
				trans={1:2,2:1,4:8,5:10,6:9,7:11,8:4,9:6,10:5,11:7,13:14,14:13};
				break;
		}
		return trans;
	}
},

"Encode@curvedata":{
	decodePzpr : function(type){
		this.decodeClues();
		var parts = this.outbstr.substr(1).split("/");
		var i = 0;

		if(parts[i] && parts[i][0] === "b") {
			this.outbstr = parts[i++].substr(1);
			this.decodeBorder();
		}

		var count = Math.floor(parts.length/3);

		this.board.shapes = Array(count);
		for(var id = 0; id < count; id++) {
			var data = new this.klass.CurveData();
			var w = +parts[i++];
			var h = +parts[i++];
			var code = parts[i++];

			if(!w || !h) {break;}

			data.init(w, h);

			data.decodeBits(code);

			this.board.shapes[id] = data;
		}
	},

	decodeClues: function() {
		var c=0, i=0, bstr = this.outbstr, bd = this.board;
		for(i=0;i<bstr.length;i++){
			var cell = bd.cell[c], ca = bstr.charAt(i);

			if(this.include(ca,"0","9")||this.include(ca,"a","f"))
					   { cell.qnum = parseInt(ca,16);}
			else if(ca === '-'){ cell.qnum = parseInt(bstr.substr(i+1,2),16); i+=2;}
			else if(ca === '+'){ cell.qnum = parseInt(bstr.substr(i+1,3),16); i+=3;}
			else if(ca === '.'){ cell.qnum = -2;}
			else if(ca === '='){ cell.qnum = -3;}
			else if(ca >= 'g' && ca <= 'z'){ c += (parseInt(ca,36)-16);}

			c++;
			if(!bd.cell[c]){ break;}
		}
		this.outbstr = bstr.substr(i+1);
	},

	encodePzpr : function(type){
		this.board.compressShapes();

		var count = this.board.shapes.length;
		this.encodeClues();

		if(this.board.border.some(function(cell){ return cell.ques===1;})){
			this.outbstr += "b";
			this.encodeBorder();
			this.outbstr += "/";
		}

		var parts = [];
		for(var id = 0; id < count; id++) {
			var shape = this.board.shapes[id];
			var w = shape.w;
			var len = shape.bits.length;
			var h = len / w;
			parts.push(w);
			parts.push(h);
			parts.push(shape.encodeBits());
		}
		this.outbstr += parts.join("/");
	},

	encodeClues: function() {
		var count=0, cm="", bd = this.board;
		for(var c=0;c<bd.cell.length;c++){
			var pstr = "", qn = bd.cell[c].qnum;

			if     (qn=== -2           ){ pstr = ".";}
			else if(qn=== -3           ){ pstr = "=";}
			else if(qn>=   0 && qn<  16){ pstr =       qn.toString(16);}
			else if(qn>=  16 && qn< 256){ pstr = "-" + qn.toString(16);}
			else if(qn>= 256 && qn<4096){ pstr = "+" + qn.toString(16);}
			else{ count++;}

			if(count===0){ cm += pstr;}
			else if(pstr || count===20){ cm+=((15+count).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm+=(15+count).toString(36);}

		this.outbstr += cm + "/";
	}
},

"Encode@curvedata-aux": {
	decodePzpr : function(type){
		var parts = this.outbstr.split("/");
		var shape = new this.klass.CurveData();
		shape.init(+parts[0], +parts[1]);
		shape.decodeBits(parts[2]);

		this.board.setShape(shape);
	},

	encodePzpr: function(type) {
		var shape = this.board.getShape();

		var parts = [];
		parts.push(shape.w);
		parts.push(shape.w ? shape.bits.length / shape.w : 0);
		parts.push(shape.encodeBits());
		this.outbstr += parts.join("/");
	}
},

"FileIO@curvedata":{
	decodeData : function(){
		var count = +this.readLine();
		this.decodeCell( function(cell,ca){
			if(ca!=="."){ cell.qnum = +ca;}
		});

		this.board.shapes = Array(count);
		for(var id = 0; id < count; id++) {
			var data = new this.klass.CurveData();
			var w = +this.readLine();
			var h = +this.readLine();

			data.init(w, h);

			if(w > 1) {
				var horz = this.getItemList(h);
				for(var p = 0; p < horz.length; p++) {
					if(horz[p] === "1") {
						var x = Math.floor(p % (w-1));
						var y = Math.floor(p / (w-1));
						data.bits[y*w+x] |= 1;
					}
				}
			}
			if(h > 1) {
				var vert = this.getItemList(h-1);
				for(var p = 0; p < vert.length; p++) {
					if(vert[p] === "1") {
						data.bits[p] |= 2;
					}
				}
			}

			this.board.shapes[id] = data;
		}
		this.decodeBorder(function(border, ca) {
			if     (ca==="-2"){ border.ques = 1;}
			else if(ca==="-1"){ border.qsub = 2;}
			else if(+ca > 0) { border.line = +ca;}
		});
	},
	encodeData : function(){
		this.board.compressShapes();
		var count = this.board.shapes.length;
		this.writeLine(count);
		this.encodeCell( function(cell){
			if (cell.qnum===-1){ return ". ";}
			else               { return cell.qnum+" ";}
		});

		for(var id = 0; id < count; id++) {
			var shape = this.board.shapes[id];

			var w = shape.w;
			var len = shape.bits.length;
			var h = len / w;
			this.writeLine(w);
			this.writeLine(h);

			if(w > 1) {
				for(var y = 0; y < h; y++) {
					var line = "";
					for(var x = 0; x < w-1; x++) {
						line += shape.bits[y*w+x] & 1 ? "1 " : "0 ";
					}
					this.writeLine(line);
				}
			}
			for(var y = 0; y < h-1; y++) {
				var line = "";
				for(var x = 0; x < w; x++) {
					line += shape.bits[y*w+x] & 2 ? "1 " : "0 ";
				}
				this.writeLine(line);
			}
		}
		this.encodeBorder(function(border) {
			if     (border.ques===1){ return "-2 ";}
			else if(border.line>  0){ return border.line+" ";}
			else if(border.qsub===2){ return "-1 ";}
			else                   { return "0 ";}
		});
	}
},

"FileIO@curvedata-aux":{
	decodeData : function(){
		var data = new this.klass.CurveData();
		var w = +this.readLine();
		var h = +this.readLine();

		data.init(w, h);
		data.decodeBits(this.readLine());
		this.board.setShape(data);
	},
	encodeData : function(){
		var shape = this.board.getShape();

		this.writeLine(shape.w || 0);
		this.writeLine(shape.w ? shape.bits.length / shape.w : 0);
		if(shape.w) { this.writeLine(shape.encodeBits()); }
	}
},

"AnsCheck@curvedata":{
	checklist : [
		"checkMultipleClues",
		"checkShapes",
		"checkNoClues",
		"checkNoLine++"
	],

	checkNoClues: function() {
		return this.curvedata_shapecount(0, "shNone");
	},
	checkMultipleClues: function() {
		return this.curvedata_shapecount(2, "shMultiple");
	},
	checkNoLine: function() {
		this.checkAllCell(function(cell){ return cell.qnum!==-3 && cell.lcnt===0;}, "ceNoLine");
	},

	curvedata_shapecount: function (amount, code){
		var components = this.board.linegraph.components;
		var error = false;
		for(var id = 0; id < components.length; id++) {
			var path = components[id];
			if(path.cluecnt===amount) {
				this.failcode.add(code);
				if(this.checkOnly){ return;}
				if(!error) {
					this.board.border.setnoerr();
					error = true;
				}
				path.setedgeerr(1);
			}
		}
	},

	checkShapes: function() {
		var components = this.board.linegraph.components;
		var error = false;
		for(var id = 0; id < components.length; id++) {
			var path = components[id];
			if(path.clueid===null || path.clueid === -2){continue;}

			if(!this.shapeMatches(path)) {
				this.failcode.add("shIncorrect");
				if(this.checkOnly){ return;}
				if(!error) {
					this.board.border.setnoerr();
					error = true;
				}
				path.setedgeerr(1);
			}
		}
	},

	shapeMatches: function(path) {
		if(!path.shape) {
			path.shape = path.clist.toCurveData();
		}
		var shape = path.shape;

		if(path.isomorphicWith === path.clueid) {return true;}

		var clue = this.board.shapes[path.clueid];

		if(shape.isIsomorphic(clue)) {
			path.isomorphicWith = path.clueid;
			return true;
		}
		return false;
	}

},

FailCode:{
	"shNone": ["記号マスを通っていない線があります。","A shape is not connected to a clue."],
	"shMultiple": ["2つ以上の記号マスを通る線があります。","A shape is connected to multiple clues."],
	"shIncorrect": ["記号の形に合っていない線があります。","A shape does not match the clue."]
}

}));
