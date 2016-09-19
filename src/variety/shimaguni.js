//
// パズル固有スクリプト部 島国・チョコナ・ストストーン版 shimaguni.js
//
(function(pidlist, classbase){
	if(typeof module==='object' && module.exports){module.exports = [pidlist, classbase];}
	else{ pzpr.classmgr.makeCustom(pidlist, classbase);}
}(
['shimaguni','chocona','stostone'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	use : true,
	
	mouseinput : function(){
		if(this.puzzle.playmode){
			if(this.mousestart || this.mousemove){ this.inputcell();}
		}
		else if(this.puzzle.editmode){
			if(this.mousestart || this.mousemove){ this.inputborder();}
			else if(this.mouseend && this.notInputted()){ this.inputqnum();}
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
Cell:{
	maxnum : function(){
		return Math.min(255, this.room.clist.length);
	}
},
"Cell@chocona":{
	minnum : 0
},
"Cell@stostone":{
	getFallableLength : function(isdrop){
		if(!this.base.sblk){ return 0;}
		var cell2 = this, len = 0, move = ((isdrop!==false) ? 2 : -2);
		while(!cell2.isnull){
			cell2 = cell2.relcell(0,move);
			if(cell2.isnull || (!!cell2.base.sblk && this.base.sblk!==cell2.base.sblk)){ break;}
			len++;
		}
		return len;
	}
},

Board:{
	hasborder : 1
},
"Board@stostone":{
	cols : 8,
	rows : 8,

	falling : false,

	initBoardSize : function(col,row){
		this.common.initBoardSize.call(this,col,row);
		this.falling = false;
	},
	errclear : function(){
		this.falling = false;
		this.common.errclear.call(this);
	},
	operate : function(type){
		switch(type){
		case 'drop':
		case 'raise':
			this.drop(type==='drop');
			this.falling = true;
			this.haserror = true;
			this.puzzle.redraw();
			break;
		case 'resetpos':
			this.resetpos();
			this.board.errclear();
			break;
		default:
			this.common.operate.call(this,type);
			break;
		}
	},
	resetpos : function(){
		for(var i=0;i<this.cell.length;i++){
			var cell = this.cell[i];
			cell.base = cell.destination = (cell.isShade() ? cell : this.emptycell);
		}
	},
	drop : function(isdrop){
		this.resetpos();
		var fallable = true, blks = this.sblkmgr.components;
		while(fallable){
			fallable = false;
			for(var n=blks.length-1;n>=0;--n){
				var length = blks[n].clist.fall(isdrop);
				if(length>0){ fallable = true;}
			}
		}
	}
},

CellList:{
	getLandAreaOfClist : function(){
		var cnt = 0;
		for(var i=0,len=this.length;i<len;i++){
			if(this[i].isShade()){ cnt++;}
		}
		return cnt;
	},

	isSeqBlock : function(){
		var stack=(this.length>0?[this[0]]:[]), count=this.length, passed={};
		for(var i=0;i<count;i++){ passed[this[i].id]=0;}
		while(stack.length>0){
			var cell=stack.pop();
			if(passed[cell.id]===1){ continue;}
			count--;
			passed[cell.id]=1;
			var list = cell.getdir4clist();
			for(var i=0;i<list.length;i++){
				if(passed[list[i][0].id]===0){ stack.push(list[i][0]);}
			}
		}
		return (count===0);
	}
},
"CellList@stostone":{
	fall : function(isdrop){
		var length = this.board.rows, move = ((isdrop!==false) ? 2 : -2);
		for(var i=0;i<this.length;i++){
			if(this[i].sblk===this[i].relcell(0,move).sblk){ continue;} // Skip if the block also contains bottom neighbor cell
			var len = this[i].destination.getFallableLength(isdrop);
			if(length>len){ length = len;}
			if(length===0){ return 0;}
		}
		var totallen = length + (Math.abs(this[0].destination.by - this[0].by)>>1);
		for(var i=0;i<this.length;i++){
			this[i].destination.base = this.board.emptycell;
		}
		for(var i=0;i<this.length;i++){
			var newcell = this[i].relcell(0,move*totallen);
			this[i].destination = newcell;
			newcell.base = this[i];
		}
		return length;
	}
},

AreaShadeGraph:{
	enabled : true
},
AreaRoomGraph:{
	enabled : true,
	hastop : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	gridcolor_type : "LIGHT",

	enablebcolor : true,
	bgcellcolor_func : "qsub1",

	paint : function(){
		this.drawBGCells();
		this.drawGrid();
		if(this.pid==='stostone'){ this.drawDotCells();}
		this.drawShadedCells();

		this.drawNumbers();

		this.drawBorders();

		this.drawChassis();

		this.drawBoxBorders(false);

		this.drawTarget();
	}
},
"Graphic@shimaguni":{
	bcolor : "rgb(191, 191, 255)"
},
"Graphic@stostone":{
	irowakeblk : true,
	enablebcolor : false,
	bgcellcolor_func : "error1",

	minYdeg : 0.08,
	maxYdeg : 0.50,

	getShadedCellColor : function(cell){
		var cell0 = cell;
		if(this.board.falling){ cell = cell.base;}
		if(cell.qans!==1){ return null;}
		var info = cell0.error || cell0.qinfo;
		if     (info===1){ return this.errcolor1;}
		else if(info===2){ return this.errcolor2;}
		else if(cell.trial){ return this.trialcolor;}
		else if(this.puzzle.execConfig('irowakeblk')){ return cell.sblk.color;}
		return this.shadecolor;
	},
	getBorderColor : function(border){
		if(this.board.falling){
			var sblk1 = border.sidecell[0].base.sblk;
			var sblk2 = border.sidecell[1].base.sblk;
			if(!!sblk1 && !!sblk2 && sblk1!==sblk2){ return "white";}
			else if(!!sblk1 || !!sblk2){ return null;}
		}
		if(border.isBorder()){ return this.quescolor;}
		return null;
	},
	getNumberColor : function(cell){
		if(this.board.falling){ cell = cell.base;}
		return this.common.getNumberColor_mixed.call(this,cell);
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
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
FileIO:{
	decodeData : function(){
		this.decodeAreaRoom();
		this.decodeCellQnum();
		this.decodeCellAns();
	},
	encodeData : function(){
		this.encodeAreaRoom();
		this.encodeCellQnum();
		this.encodeCellAns();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
"AnsCheck@shimaguni,stostone#1":{
	checklist : [
		"checkSideAreaShadeCell",
		"checkSeqBlocksInRoom",
		"checkFallenBlock@stostone",
		"checkShadeCellCount",
		"checkSideAreaLandSide@shimaguni",
		"checkRemainingSpace@stostone",
		"checkNoShadeCellInArea"
	]
},
"AnsCheck@chocona#1":{
	checklist : [
		"checkShadeCellExist",
		"checkShadeRect",
		"checkShadeCellCount"
	]
},
"AnsCheck@shimaguni,stostone":{
	checkSideAreaShadeCell : function(){
		this.checkSideAreaCell(function(cell1,cell2){ return (cell1.isShade() && cell2.isShade());}, true, "cbShade");
	},
	checkSideAreaLandSide : function(){
		this.checkSideAreaSize(function(area){ return area.clist.getLandAreaOfClist();}, "bsEqShade");
	},

	// 部屋の中限定で、黒マスがひとつながりかどうか判定する
	checkSeqBlocksInRoom : function(){
		var rooms = this.board.roommgr.components;
		for(var r=0;r<rooms.length;r++){
			var clist = rooms[r].clist.filter(function(cell){ return cell.isShade();});
			if(clist.isSeqBlock()){ continue;}
			
			this.failcode.add("bkShadeDivide");
			if(this.checkOnly){ break;}
			clist.seterr(1);
		}
	}
},
"AnsCheck@stostone":{
	checkAns : function(break_if_error){
		this.board.drop();
		this.common.checkAns.call(this,break_if_error);
	},
	checkFallenBlock : function(){
		var bd = this.board;
		for(var c=0;c<bd.cell.length;c++){
			var cell = bd.cell[c];
			if(cell.by>bd.maxby/2 || cell.base.isnull){ continue;}
			
			this.failcode.add("csUpper");
			if(this.checkOnly){ break;}
			bd.falling = true;
			cell.seterr(1);
		}
	},
	checkRemainingSpace : function(){
		var bd = this.board;
		for(var c=0;c<bd.cell.length;c++){
			var cell = bd.cell[c];
			if(cell.by<bd.maxby/2 || !cell.base.isnull){ continue;}
			
			this.failcode.add("cuLower");
			if(this.checkOnly){ break;}
			bd.falling = true;
			if(cell.base.isnull){ cell.seterr(1);}
		}
	}
},
"AnsCheck@chocona":{
	checkShadeRect : function(){
		this.checkAllArea(this.board.sblkmgr, function(w,h,a,n){ return (w*h===a);}, "csNotRect");
	}
},

"FailCode@shimaguni,stostone":{
	bkShadeNe     : ["海域内の数字と国のマス数が一致していません。","The number of shaded cells is not equals to the number."],
	bkShadeDivide : ["1つの海域に入る国が2つ以上に分裂しています。","Countries in one marine area are divided to plural ones."],
	bkNoShade     : ["黒マスのカタマリがない海域があります。","A marine area has no shaded cells."],
	cbShade       : ["異なる海域にある国どうしが辺を共有しています。","Countries in other marine area share the side over border line."],
	bsEqShade     : ["隣り合う海域にある国の大きさが同じです。","The size of countries that there are in adjacent marine areas are the same."]
},

"FailCode@chocona":{
	csNotRect : ["黒マスのカタマリが正方形か長方形ではありません。","A mass of shaded cells is not rectangle."],
	bkShadeNe : ["数字のある領域と、領域の中にある黒マスの数が違います。","The number of shaded cells in the area and the number written in the area is different."]
},

"FailCode@stostone":{
	cbShade : ["異なる領域にある黒マスどうしが辺を共有しています。","Shade cell blocks in other region are adjacent over border line."],
	csUpper : ["ブロックを落とした後に黒マスが盤面の上半分に残っています。","Shaded cells are remained in upper half of the board after they are fallen."],
	cuLower : ["ブロックを落とした後の空間が盤面の下半分にあります。","Unshaded cells exist in lower half of the board after blocks are fallen."]
}
}));
