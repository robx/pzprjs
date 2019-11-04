//
// パズル固有スクリプト部 ヤジリン版 yajilin.js
//
(function(pidlist, classbase){
	if(typeof module==='object' && module.exports){module.exports = [pidlist, classbase];}
	else{ pzpr.classmgr.makeCustom(pidlist, classbase);}
}(
['yajilin', 'yajilin-regions'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	RBShadeCell : true,
	use     : true,
	mouseinput_auto : function(){
		if(this.puzzle.playmode){
			if(this.mousestart || this.mousemove){
				if     (this.btn==='left') { this.inputLine();}
				else if(this.btn==='right'){
					if(this.mousestart && this.inputpeke_ifborder()){ return;}
					if(!this.firstCell.isnull||this.notInputted()){ this.inputcell();}
				}
			}
			else if(this.mouseend && this.notInputted()){
				var cell = this.getcell();
				if(!this.firstCell.isnull && cell!==this.firstCell){ return;}
				if(!cell.isnull && cell.isNum() && this.pid==='yajilin'){
					this.inputqcmp();
				}
				else{
					this.inputcell();
				}
			}
		}
		else if(this.puzzle.editmode){
			if(this.mousestart || this.mousemove){
				if(this.pid==='yajilin')             { this.inputdirec();}
				else if(this.pid==='yajilin-regions'){ this.inputborder();}
			}
			else if(this.mouseend && this.notInputted()){ this.inputqnum();}
		}
	},
	inputqcmp : function(){
		var cell = this.getcell();
		if(cell.isnull || cell.noNum()){ return;}

		cell.setQcmp(+!cell.qcmp);
		cell.draw();

		this.mousereset();
	}
},
"MouseEvent@yajilin":{
	inputModes : {edit:['number','direc','clear','info-line'],play:['line','peke','shade','unshade','info-line','completion']}
},
"MouseEvent@yajilin-regions":{
	inputModes : {edit:['number','border','clear','info-line'],play:['line','peke','shade','unshade','info-line']}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,
	moveTarget : function(ca){
		if(ca.match(/shift/)){ return false;}
		return this.moveTCell(ca);
	},

	keyinput : function(ca){
		if(this.key_inputdirec(ca)){ return;}
		this.key_inputqnum(ca);
	}
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	// don't draw  dots under lines
	isDot : function(){
		return this.lcnt===0&&this.qsub===1;
	},

	countShade : function(clist){
		if(!clist){ return -1;}
		return (clist.filter(function(cell){ return cell.isShade();}).length);
	},
	countUndecided : function(clist){
		if(!clist){ return -1;}
		return (clist.filter(function(cell){
			if(cell.qans!==0){ return false;}
			if(cell.knowEmpty()){ return false;}
			return true;
		}).length);
	},

	// trigger redraw for autocompletion
	posthook : {
		qsub : function(){
			var cells=[this];
			this.board.redrawAffected(cells);
		},
		qans : function(){
			var cells=[this];
			var adc=this.adjacent;
			var cs=[adc.top, adc.bottom, adc.left, adc.right];
			for(var i=0; i<cs.length; i++){
				var c=cs[i];
				if(!c.isnull&&c.qans===0&&c.qsub===0){ cells.push(c);}
			}
			this.board.redrawAffected(cells);
		}
	}
},
"Cell@yajilin":{
	minnum : 0,
	maxnum : function(){ return Math.max((this.board.cols+1)>>1,(this.board.rows+1)>>1);},

	// 線を引かせたくないので上書き
	noLP : function(dir){ return (this.isShade() || this.isNum());},

	allowShade : function(){
		return this.qnum===-1&&this.lcnt===0;
	},
	allowUnshade : function(){
		return this.qnum===-1&&this.lcnt===0;
	},

	knowEmpty : function(){
		if(this.qnum!==-1){ return true;}
		if(this.qsub!==0){ return true;}
		if(this.lcnt>0){ return true;}
		var shadedNbrs = this.countDir4Cell(function(cell){
			return (cell.isShade() > 0);
		});
		return (shadedNbrs>0);
	},
	isCmp : function(){
		if(this.qcmp===1){ return true;}
		if(!this.puzzle.execConfig('autocmp')){ return false;}

		var clist=this.getClist();
		if(!clist){ return false;}

		if(this.countUndecided(clist)!==0){ return false;}
		return this.qnum===this.countShade(clist);
	},

	getClist : function(){
		if(!this.isValidNum() || this.qdir===0){ return null;}
		var pos = this.getaddr(), dir = this.qdir;
		var clist = new this.klass.CellList();
		while(1){
			pos.movedir(dir,2);
			var cell = pos.getc();
			if(cell.isnull){ break;}
			clist.add(cell);
		}
		return clist;
	}
},
"Cell@yajilin-regions":{
	minnum : 0,
	maxnum : function(){ return this.room.clist.length;},

	noLP : function(dir){ return this.isShade();},

	allowShade : function(){
		return this.lcnt===0;
	},
	allowUnshade : function(){
		return this.lcnt===0;
	},

	knowEmpty : function(){
		if(this.qsub!==0){ return true;}
		if(this.lcnt>0){ return true;}
		var shadedNbrs = this.countDir4Cell(function(cell){
			return (cell.isShade() > 0);
		});
		return (shadedNbrs>0);
	},
	isCmp : function(){
		if(!this.puzzle.execConfig('autocmp')){ return false;}
		var clist = this.room.clist;
		if(this.countUndecided(clist)!==0){ return false;}
		return this.qnum===this.countShade(clist);
	}
},
Border:{
	enableLineNG : true,
	posthook : {
		line : function(){
			var cells=[];
			for(var i=0;i<this.sidecell.length;i++){ cells.push(this.sidecell[i]);}
			this.board.redrawAffected(cells);
		}
	}
},
"Border@yajilin":{
	isBorder : function(){
		return (this.sidecell[0].qnum===-1)!==(this.sidecell[1].qnum===-1);
	}
},
Board:{
	hasborder : 1
},
"Board@yajilin":{
	redrawAffected : function(cells){
		var minx=this.maxbx, maxx=this.minbx, miny=this.maxby, maxy=this.minby;
		for(var i=0;i<cells.length;i++){
			var c=cells[i];
			minx = Math.min(minx,c.bx);
			maxx = Math.max(maxx,c.bx);
			miny = Math.min(miny,c.by);
			maxy = Math.max(maxy,c.by);
		}
		for(var x=minx; x<=maxx; x+=2){
			for(var y=1; y<2*this.board.rows; y+=2){
				var c=this.board.getc(x,y);
				if(c.qnum!==-1){ c.draw();}
			}
		}
		for(var x=1; x<2*this.cols; x+=2){
			if(x>=minx&&x<=maxx){ continue;}
			for(var y=miny; y<=maxy; y+=2){
				var c=this.board.getc(x,y);
				if(c.qnum!==-1){ c.draw();}
			}
		}
	}
},
"Board@yajilin-regions":{
	redrawAffected : function(cells){
		var done = [];
		for(var i=0;i<cells.length;i++){
			var top=cells[i].room.top;
			if(done[top.id]){ continue;}
			done[top.id] = true;
			top.draw();
		}
	}
},
"BoardExec@yajilin":{
	adjustBoardData : function(key,d){
		this.adjustNumberArrow(key,d);
	}
},
"AreaRoomGraph@yajilin-regions":{
	enabled : true,
	hastop : true
},
LineGraph:{
	enabled : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	qcmpcolor  : "rgb(127,127,127)",
	autocmp : 'number',

	irowake : true,

	getQuesNumberColor : function(cell){
		var qnum_color = this.getQuesNumberColor_mixed(cell);
		if ((cell.error || cell.qinfo)===1){ return qnum_color;}
		return (cell.isCmp() ?  this.qcmpcolor : qnum_color);
	},

	paint : function(){
		this.drawBGCells();
		if(this.pid==='yajilin-regions'){ this.drawShadedCells();}
		this.drawDotCells();
		this.drawGrid();


		this.drawBorders();

		if(this.pid==='yajilin'){ this.drawArrowNumbers();}

		this.drawLines();

		if(this.pid==='yajilin-regions'){ this.drawQuesNumbers();}

		this.drawPekes();

		this.drawChassis();

		if(this.pid==='yajilin-regions'){ this.drawBoxBorders(false);}

		this.drawTarget();
	}
},
"Graphic@yajilin":{
	getBGCellColor : function(cell){
		var info = cell.error || cell.qinfo;
		if(this.puzzle.getConfig('disptype_yajilin')===2 && cell.qnum!==-1){ return 'rgb(224,224,224)';}
		else if(cell.qans===1){
			if(info===1){ return this.errcolor1;}
			else if(cell.trial){ return this.trialcolor;}
			return this.shadecolor;
		}
		else if(info===1){ return this.errbcolor1;}
		return null;
	},
	getBorderColor : function(border){
		if(this.puzzle.getConfig('disptype_yajilin')===2 && border.isBorder()){ return this.quescolor;}
		return null;
	}
},
"Graphic@yajilin-regions":{
	textoption : {ratio:0.4, position: 5, hoffset: 0.8, voffset: 0.75}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
"Encode@yajilin":{
	decodePzpr : function(type){
		this.decodeArrowNumber16();

		this.puzzle.setConfig('disptype_yajilin', (!this.checkpflag('b')?1:2));
	},
	encodePzpr : function(type){
		this.encodeArrowNumber16();

		this.outpflag = ((this.puzzle.getConfig('disptype_yajilin')===2)?"b":null);
	},

	decodeKanpen : function(){
		this.fio.decodeCellDirecQnum_kanpen(true);
	},
	encodeKanpen : function(){
		this.fio.encodeCellDirecQnum_kanpen(true);
	}
},
"Encode@yajilin-regions":{
	decodePzpr : function(type){
		this.decodeBorder();
		this.decodeRoomNumber16();
	},
	encodePzpr : function(type){
		this.encodeBorder();
		this.encodeRoomNumber16();
	}
},
//---------------------------------------------------------
"FileIO@yajilin":{
	decodeData : function(){
		this.decodeCellDirecQnum();
		this.decodeCellAns();
		this.decodeBorderLine();
	},
	encodeData : function(){
		this.encodeCellDirecQnum();
		this.encodeCellAns();
		this.encodeBorderLine();
	},

	kanpenOpen : function(){
		this.decodeCellDirecQnum_kanpen(false);
		this.decodeBorderLine();
	},
	kanpenSave : function(){
		this.encodeCellDirecQnum_kanpen(false);
		this.encodeBorderLine();
	},

	decodeCellDirecQnum_kanpen : function(isurl){
		this.decodeCell( function(cell,ca){
			if     (ca==="#" && !isurl){ cell.qans = 1;}
			else if(ca==="+" && !isurl){ cell.qsub = 1;}
			else if(ca==="-4"){ cell.qnum = -2;}
			else if(ca!=="."){
				var num = +ca, dir = ((num & 0x30) >> 4);
				if     (dir===0){ cell.qdir = cell.UP;}
				else if(dir===1){ cell.qdir = cell.LT;}
				else if(dir===2){ cell.qdir = cell.DN;}
				else if(dir===3){ cell.qdir = cell.RT;}
				cell.qnum = (num & 0x0F);
			}
		});
	},
	encodeCellDirecQnum_kanpen : function(isurl){
		this.encodeCell( function(cell){
			var num = ((cell.qnum>=0&&cell.qnum<16) ? cell.qnum : -1), dir;
			if(num!==-1 && cell.qdir!==cell.NDIR){
				if     (cell.qdir===cell.UP){ dir = 0;}
				else if(cell.qdir===cell.LT){ dir = 1;}
				else if(cell.qdir===cell.DN){ dir = 2;}
				else if(cell.qdir===cell.RT){ dir = 3;}
				return (""+((dir<<4)+(num&0x0F))+" ");
			}
			else if(cell.qnum===-2){ return "-4 ";}
			else if(!isurl){
				if     (cell.qans===1){ return "# ";}
				else if(cell.qsub===1){ return "+ ";}
			}
			return ". ";
		});
	},

	kanpenOpenXML : function(){
		this.decodeCellDirecQnum_XMLBoard();
		this.decodeBorderLine_XMLAnswer();
	},
	kanpenSaveXML : function(){
		this.encodeCellDirecQnum_XMLBoard();
		this.encodeBorderLine_XMLAnswer();
	},

	decodeCellDirecQnum_XMLBoard : function(){
		this.decodeCellXMLBoard(function(cell, val){
			if(val>=0){
				var dir = ((val & 0x30) >> 4);
				if     (dir===0){ cell.qdir = cell.UP;}
				else if(dir===1){ cell.qdir = cell.LT;}
				else if(dir===2){ cell.qdir = cell.DN;}
				else if(dir===3){ cell.qdir = cell.RT;}
				cell.qnum = (val & 0x0F);
			}
			else if(val===-1){ cell.qsub = 1;}
			else if(val===-2){ cell.qans = 1;}
			else if(val===-4){ cell.qnum = -2;}
		});
	},
	encodeCellDirecQnum_XMLBoard : function(){
		this.encodeCellXMLBoard(function(cell){
			var val = -3, dir = 0;
			if(cell.qnum!==-1 && cell.qdir!==cell.NDIR){
				if     (cell.qdir===cell.UP){ dir = 0;}
				else if(cell.qdir===cell.LT){ dir = 1;}
				else if(cell.qdir===cell.DN){ dir = 2;}
				else if(cell.qdir===cell.RT){ dir = 3;}
				val = ((dir<<4)+(cell.qnum&0x0F));
			}
			else if(cell.qnum===-2){ val = -4;}
			else if(cell.qans===1) { val = -2;}
			else if(cell.qsub===1) { val = -1;}
			return val;
		});
	}
},
"FileIO@yajilin-regions":{
	decodeData : function(){
		this.decodeAreaRoom();
		this.decodeCellQnum();
		this.decodeCellAns();
		this.decodeBorderLine();
	},
	encodeData : function(){
		this.encodeAreaRoom();
		this.encodeCellQnum();
		this.encodeCellAns();
		this.encodeBorderLine();
	}
},
//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checklist : [
		"checkBranchLine",
		"checkCrossLine",
		"checkLineOnShadeCell",
		"checkAdjacentShadeCell",
		"checkDeadendLine+",
		"checkArrowNumber@yajilin",
		"checkShadeCellCount@yajilin-regions",
		"checkOneLoop",
		"checkEmptyCell_yajilin+@yajilin",
		"checkEmptyCell_regions+@yajilin-regions",
		"checkNumberHasArrow@yajilin"
	],

	checkEmptyCell_yajilin : function(){
		this.checkAllCell(function(cell){ return (cell.lcnt===0 && !cell.isShade() && cell.noNum());}, "ceEmpty");
	},
	checkEmptyCell_regions : function(){
		this.checkAllCell(function(cell){ return (cell.lcnt===0 && !cell.isShade());}, "ceEmpty");
	},

	checkArrowNumber : function(){
		var bd = this.board;
		for(var c=0;c<bd.cell.length;c++){
			var cell = bd.cell[c];
			var clist = cell.getClist();
			var count = cell.countShade(clist);
			if(count<0||cell.qnum===count){ continue;}

			this.failcode.add("anShadeNe");
			if(this.checkOnly){ break;}
			cell.seterr(1);
			clist.seterr(1);
		}
	},

	checkNumberHasArrow : function(){
		this.checkAllCell(function(cell){ return (cell.qnum>0&&cell.qdir===cell.NDIR);}, "anNoArrow");
	}
},

FailCode:{
	ceEmpty : ["黒マスも線も引かれていないマスがあります。","There is an empty cell."],
	anNoArrow : ["矢印がない数字のマスがあります。","A number has no arrow."]
}
}));
