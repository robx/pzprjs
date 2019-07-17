//
// curvedata.js: Implementation of Curve Data puzzle type.
//
(function(pidlist, classbase){
    if(typeof module==='object' && module.exports){module.exports = [pidlist, classbase];}
    else{ pzpr.classmgr.makeCustom(pidlist, classbase);}
}(
['curvedata'], {

// In this puzzle, clue numbers are not stable. They can be changed on the entire board
// by a call to `compressShapes()`. Operations which change qnum directly are not permitted.
// Use CurveDataOperation for all changes to clues on the grid.
MouseEvent:{
    inputModes : {edit:['copylines','undef','clear'],play:['line','peke']},
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
        }
    },

    mouseinput_undef : function(){ return this.enterqnum(-2); },
    mouseinput_clear : function(){ return this.enterqnum(-1); },

    enterqnum: function(value) {
        var cell = this.getcell();
        if(cell.isnull || cell===this.mouseCell || !this.puzzle.editmode){ return;}

        this.mouseCell = cell;

        if(cell.qnum !== value) {
            var ope = new this.klass.CurveDataOperation(cell, value);
            ope.redo();
            this.puzzle.opemgr.add(ope);
            cell.draw();
        }
    },
    
    mouseinput_other : function(){
		if(this.inputMode==='copylines' && this.mousestart){ this.mouseinput_copylines();}
    },
    
    mouseinput_copylines: function() {
        var cell = this.getcell();
        if(cell.isnull || cell===this.mouseCell || !this.puzzle.editmode){ return;}

        this.mouseCell = cell;

        if(!cell.path) {return;}

        var shape = cell.path.clist.toCurveData();
        if(!shape.deepEquals(this.board.shapes[cell.qnum])) {
            var ope = new this.klass.CurveDataOperation(cell, shape);
            ope.redo();
            this.puzzle.opemgr.add(ope);
            cell.draw();
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
    // and a map of four adjacent positions as the value. This represents the graph.
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
            this.connections[id] = {left:null, right:null, top:null, bottom:null};
            this.nodecnt++;
        }
        // Horizontal connections
        for(var y = 0; y < h; y++) {
            var hold = null;
            for(var x = 0; x < w; x++) {
                var id = y*w+x;
                if(hold===null && (this.bits[id] & 1)) {
                    hold = id;
                } else if (hold!==null && this.bits[id]!==5) {
                    this.connections[hold].right = id;
                    this.connections[id].left = hold;
                    hold = (this.bits[id] & 1) ? id : null;
                }
            }
        }
        // Vertical connections
        for(var x = 0; x < w; x++) {
            var hold = null;
            for(var y = 0; y < h; y++) {
                var id = y*w+x;
                if(hold===null && (this.bits[id] & 2)) {
                    hold = id;
                } else if (hold!==null && this.bits[id]!==10) {
                    this.connections[hold].bottom = id;
                    this.connections[id].top = hold;
                    hold = (this.bits[id] & 2) ? id : null;
                }
            }
        }
        
        // Fill the positions map.
        for(var id = 0; id < len; id++) {
            var bits = this.bits[id];
            if(bits===0||bits===5||bits===10){continue;}

            var conns = this.connections[id];
            var key = [bits, "R", this.bits[conns.right], 
                    "B", this.bits[conns.bottom], 
                    "L", this.bits[conns.left], 
                    "T", this.bits[conns.top]].join("");
            if(!(key in this.positions)) {
                this.positions[key] = [];
            }

            this.positions[key].push(id);
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
            if(conn.right!==null && otherconn.right !== matching[conn.right]) {
                return false;
            }
            if(conn.bottom!==null && otherconn.bottom !== matching[conn.bottom]) {
                return false;
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

        if(shape && typeof shape === "object" && shape.bits.length > 0) {
            this.neww = shape.w;
            this.newh = shape.bits.length / shape.w;
            this.newbits = shape.encodeBits();
        } else {
            this.newqnum = shape === -2 ? -2 : -1;
        }

        this.x = cell.bx;
        this.y = cell.by;
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

OperationManager:{
	addExtraOperation : function(){
		this.operationlist.push(this.klass.CurveDataOperation);
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

Graphic:{
    irowake : true,
    gridcolor_type : "LIGHT",

    paint : function(){
        this.drawBGCells();
        this.drawDashedGrid();

        this.drawPekes();
        this.drawLines();

        this.drawCellShapes();
        this.drawHatenas();

        this.drawChassis();
        this.drawTarget();
    },

    drawCellShapes : function(){
        var g = this.vinc('cell_shape', 'auto');
        
        var clist = this.range.cells;
        for(var i=0;i<clist.length;i++){
            var cell = clist[i];
            
            g.lineWidth = this.lw/2;
            var dot = this.lw/4;
            
            if(cell.qnum >= 0){
                var shape = this.board.shapes[cell.qnum];
                if(!shape || !shape.bits.length){continue;}
                var w = shape.w;
                var h = shape.bits.length / w;

                var step = Math.min(this.bw/(w-1), this.bh/(h-1)) * 1.3;

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

Encode:{
    decodePzpr : function(type){
        this.decodeNumber16();
        var parts = this.outbstr.substr(1).split("/");

        var count = Math.floor(parts.length/3);

        this.board.shapes = Array(count);
        for(var id = 0; id < count; id++) {
            var data = new this.klass.CurveData();
            var w = +parts[(id*3)];
            var h = +parts[(id*3) + 1];

            if(!w || !h || w > this.board.cols || h > this.board.rows) {continue;}

            data.init(w, h);

            var code = parts[(id*3) + 2];
            data.decodeBits(code);

            this.board.shapes[id] = data;
        }
    },
    encodePzpr : function(type){
        this.board.compressShapes();

        var count = this.board.shapes.length;
        this.encodeNumber16();
        this.outbstr += "/";

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
    }
},

FileIO:{
    decodeData : function(){
        var count = +this.readLine();
        this.decodeCellQnum();
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
        this.decodeBorderLine();
    },
    encodeData : function(){
        var count = this.board.shapes.length;
        this.writeLine(count);
        this.encodeCellQnum();
        for(var id = 0; id < count; id++) {
            var shape = this.board.shapes[id];

            var w = shape.w;
            var len = shape.bits.length;
            var h = len / w;
            this.writeLine(w);
            this.writeLine(h);

            for(var y = 0; y < h; y++) {
                var line = "";
                for(var x = 0; x < w-1; x++) {
                    line += shape.bits[y*w+x] & 1 ? "1 " : "0 ";
                }
                this.writeLine(line);
            }
            for(var y = 0; y < h-1; y++) {
                var line = "";
                for(var x = 0; x < w; x++) {
                    line += shape.bits[y*w+x] & 2 ? "1 " : "0 ";
                }
                this.writeLine(line);
            }
        }
        this.encodeBorderLine();
    },
},

AnsCheck:{
    checklist : [
        "checkMultipleClues",
        "checkShapes",
        "checkNoClues",
        "checkNoLine"
    ],

    checkNoClues: function() {
        return this.curvedata_shapecount(0, "shNone");
    },
    checkMultipleClues: function() {
        return this.curvedata_shapecount(2, "shMultiple");
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
    "shNone": ["(please translate) A shape is not connected to a clue.","A shape is not connected to a clue."],
    "shMultiple": ["(please translate) A shape is connected to multiple clues.","A shape is connected to multiple clues."],
    "shIncorrect": ["(please translate) A shape does not match the clue.","A shape does not match the clue."]
}

}));
