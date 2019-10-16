//
// aquarium.js
//

(function(pidlist, classbase){
    if(typeof module==='object' && module.exports){module.exports = [pidlist, classbase];}
    else{ pzpr.classmgr.makeCustom(pidlist, classbase);}
}(
['aquarium'], {

MouseEvent:{
    use    : true,
    inputModes : {edit:['border','number'],play:['shade','unshade']},

    mouseinput : function(){ // オーバーライド
        if(this.inputMode==='shade'||this.inputMode==='unshade'){
            this.inputwater();
        }
        else{ this.common.mouseinput.call(this);}
    },
    mouseinput_number: function(){
        if(this.mousestart){ this.inputqnum_excell();}
    },
    mouseinput_auto : function(){
        if(this.puzzle.playmode){
            if(this.mousestart || this.mousemove){ this.inputwater();}
        }
        else if(this.puzzle.editmode){
            if(this.mousestart || this.mousemove){ this.inputborder();}
            else if(this.mouseend && this.notInputted()){ this.inputqnum_excell();}
        }
    },

    inputqnum_excell : function(){
        var excell = this.getcell_excell();
        if(excell.isnull || excell.group!=='excell'){ return;}

        if(excell!==this.cursor.getex()){
            this.setcursor(excell);
        }
        else{
            this.inputqnum_main(excell);
        }
    },

    inputwater : function(){
        var cell = this.getcell();
        if(cell.isnull || cell===this.mouseCell){ return;}
        if(this.inputData===null){ this.decIC(cell);}

        this.mouseCell = cell;

        var start = cell;
        while(!start.adjborder.left.isnull && !start.adjborder.left.isBorder()) {
            start = start.adjacent.left;
        }

        var end = cell;
        while(!end.adjborder.right.isnull && !end.adjborder.right.isBorder()) {
            end = end.adjacent.right;
        }

        var clist = this.board.cellinside(start.bx, start.by, end.bx, end.by);

        for(var i=0;i<clist.length;i++){
            var cell2 = clist[i];
            if(this.inputData===1 || cell2.qsub!==3){
                (this.inputData===1?cell2.setShade:cell2.clrShade).call(cell2);
                cell2.setQsub(this.inputData===2?1:0);
            }
        }
        clist.draw();
    }
},

KeyEvent:{
    enablemake : true,
    moveTarget : function(ca){
        var cursor = this.cursor;
        var excell0 = cursor.getex(), dir = excell0.NDIR;
        switch(ca){
            case 'up':    if(cursor.bx===cursor.minx && cursor.miny<cursor.by){ dir=excell0.UP;} break;
            case 'down':  if(cursor.bx===cursor.minx && cursor.maxy>cursor.by){ dir=excell0.DN;} break;
            case 'left':  if(cursor.by===cursor.miny && cursor.minx<cursor.bx){ dir=excell0.LT;} break;
            case 'right': if(cursor.by===cursor.miny && cursor.maxx>cursor.bx){ dir=excell0.RT;} break;
        }

        if(dir!==excell0.NDIR){
            cursor.movedir(dir,2);

            excell0.draw();
            cursor.draw();

            return true;
        }
        return false;
    },

    keyinput : function(ca){
        this.key_inputexcell(ca);
    },
    key_inputexcell : function(ca){
        var excell = this.cursor.getex(), qn = excell.qnum;
        var max = excell.getmaxnum();

        if('0'<=ca && ca<='9'){
            var num = +ca;

            if(qn<=0 || this.prev!==excell){
                if(num<=max){ excell.setQnum(num);}
            }
            else{
                if(qn*10+num<=max){ excell.setQnum(qn*10+num);}
                else if (num<=max){ excell.setQnum(num);}
            }
        }
        else if(ca===' ' || ca==='-'){ excell.setQnum(0);}
        else{ return;}

        this.prev = excell;
        this.cursor.draw();
    }
},

TargetCursor:{
    initCursor : function(){
        this.init(-1,-1);
    }
},

EXCell:{
    disInputHatena : true,

    maxnum : function(){
        var bx=this.bx, by=this.by;
        if(bx===-1 && by===-1){ return 0;}
        return (by===-1?this.board.rows:this.board.cols);
    },
    minnum : 0
},

Board:{
    hasborder : 1,
    hasexcell : 1,

    cols : 7,
    rows : 7,

    addExtraInfo : function(){
        this.poolgraph = this.addInfoList(this.klass.AreaPoolGraph);
    }
},

BoardExec:{
    adjustBoardData : function(key,d){
        var bx1=(d.x1|1), by1=(d.y1|1);
        this.qnumw = [];
        this.qnumh = [];

        var bd=this.board;
        for(var by=by1;by<=d.y2;by+=2){ this.qnumw[by] = bd.getex(-1,by).qnum;}
        for(var bx=bx1;bx<=d.x2;bx+=2){ this.qnumh[bx] = bd.getex(bx,-1).qnum;}
    },
    adjustBoardData2 : function(key,d){
        var xx=(d.x1+d.x2), yy=(d.y1+d.y2), bx1=(d.x1|1), by1=(d.y1|1);

        var bd=this.board;
        switch(key){
        case this.FLIPY: // 上下反転
            for(var bx=bx1;bx<=d.x2;bx+=2){ bd.getex(bx,-1).setQnum(this.qnumh[bx]);}
            break;

        case this.FLIPX: // 左右反転
            for(var by=by1;by<=d.y2;by+=2){ bd.getex(-1,by).setQnum(this.qnumw[by]);}
            break;

        case this.TURNR: // 右90°反転
            for(var by=by1;by<=d.y2;by+=2){ bd.getex(-1,by).setQnum(this.qnumh[by]);}
            for(var bx=bx1;bx<=d.x2;bx+=2){ bd.getex(bx,-1).setQnum(this.qnumw[xx-bx]);}
            break;

        case this.TURNL: // 左90°反転
            for(var by=by1;by<=d.y2;by+=2){ bd.getex(-1,by).setQnum(this.qnumh[yy-by]);}
            for(var bx=bx1;bx<=d.x2;bx+=2){ bd.getex(bx,-1).setQnum(this.qnumw[bx]);}
            break;
        }
    }
},

"AreaPoolGraph:AreaShadeGraph":{ // Same as LITS AreaTetrominoGraph
    enabled : true,
    relation : {'cell.qans':'node', 'border.ques':'separator'},
    setComponentRefs : function(obj, component){ obj.pool = component;},
    getObjNodeList   : function(nodeobj){ return nodeobj.poolnodes;},
    resetObjNodeList : function(nodeobj){ nodeobj.poolnodes = [];},

    isedgevalidbylinkobj : function(border){
        return !border.isBorder();
    }
},

Graphic:{
    enablebcolor : true,
    bgcellcolor_func : "qsub1",

    bbcolor : "rgb(96, 96, 96)",

    paint : function(){
        this.drawBGCells();
        this.drawShadedCells();
        this.drawGrid();

        this.drawNumbersEXcell();

        this.drawBorders();

        this.drawChassis();

        this.drawBoxBorders(true);

        this.drawTarget();
    }
},

Encode:{
    decodePzpr : function(type){
        this.decodeBorder();
        this.outbstr = this.outbstr.substr(1);
        this.decodeNumber16EXCell();
    },
    encodePzpr : function(type){
        this.encodeBorder();
        this.outbstr += "/";
        this.encodeNumber16EXCell();
    }
},

FileIO:{
    decodeData : function(){
        this.decodeBorderQues();
        this.decodeCellExcell(function(obj,ca){
            if(ca==="."){ return;}
            else if(obj.group==='excell' && !obj.isnull){
                obj.qnum = +ca;
            }
            else if(obj.group==='cell'){
                if     (ca==="#"){ obj.qans = 1;}
                else if(ca==="+"){ obj.qsub = 1;}
            }
        });
    },
    encodeData : function(){
        this.encodeBorderQues();
        this.encodeCellExcell(function(obj){
            if(obj.group==='excell' && !obj.isnull && obj.qnum !== -1){
                return (obj.qnum+" ");
            }
            else if(obj.group==='cell'){
                if     (obj.qans===1){ return "# ";}
                else if(obj.qsub===1){ return "+ ";}
            }
            return ". ";
        });
    }
},

AnsCheck:{
    checklist : [
        "checkShadeCellExist+",
        "checkSupports",
        "checkPoolLevel",
        "checkShadeCount+"
    ],

    checkSupports: function() {
        var dirs = ["left", "right", "bottom"];

        this.checkAllCell(function(cell){
            if(!cell.isShade()) {return false;}

            for(var i in dirs) {
                var dir = dirs[i];
                var adjBorder = cell.adjborder[dir];
                var adjCell = cell.adjacent[dir];
                if(adjBorder.isnull) {continue;}

                if(!adjBorder.isBorder() && !adjCell.isShade()) {return true;}
            }

            return false;
        }, "csNoSupport");
    },

    checkPoolLevel: function() {
        var rooms = this.board.poolgraph.components;
        var invalid = false;
        for(var r=0;r<rooms.length;r++){
            var clist = rooms[r].clist;

            var level = clist.getRectSize().y1;

            for(var i=0;i<clist.length;i++){
                var cell = clist[i];
                if(cell.by !== level && !cell.adjborder.top.isnull &&
                        !cell.adjborder.top.isBorder() && !cell.adjacent.top.isShade()) {

                    this.failcode.add("csNoLevel");
                    clist.seterr(1);
                    invalid = true;
                    break;
                }
            }

            if(this.checkOnly && invalid){ break;}
        }
    },

    checkShadeCount : function(){
        this.checkRowsCols(this.isExCellCount, "exShadeNe");
    },

    isExCellCount : function(clist){
        var d = clist.getRectSize(), bd = this.board;
        var count = clist.filter(function(c) {return c.isShade();} ).length;

        var result = true;

        if(d.x1===d.x2){
            var exc = bd.getex(d.x1, -1);
            if(exc.qnum !== -1 && exc.qnum !== count) {
                exc.seterr(1);
                result = false;
            }
        }
        if(d.y1===d.y2){
            var exc = bd.getex(-1, d.y1);
            if(exc.qnum !== -1 && exc.qnum !== count) {
                exc.seterr(1);
                result = false;
            }
        }

        if(!result){ clist.seterr(1);}
        return result;
    }
},

FailCode:{
    csNoSupport: ["(please translate) A shaded cell does not have a shaded cell or border below it.","A shaded cell does not have a shaded cell or border below it."],
    csNoLevel: ["(please translate) A body of water has different surface levels.","A body of water has different surface levels."],
    exShadeNe: ["(please translate) The number of shaded cells in the row or column is not correct.","The number of shaded cells in the row or column is not correct."]
}

}));
