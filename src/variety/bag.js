//
// bag.js
//
(function(pidlist, classbase){
	if(typeof module==='object' && module.exports){module.exports = [pidlist, classbase];}
	else{ pzpr.classmgr.makeCustom(pidlist, classbase);}
}(
['bag'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputModes : {edit:['number','clear'],play:['shade','unshade','peke','clear']},
	mouseinput_auto : function(){
		var puzzle = this.puzzle;
		if(puzzle.playmode){
			if(this.mousestart || this.mousemove){ this.inputcell();}
		}
		else if(puzzle.editmode){
			if(this.mousestart){ this.inputqnum();}
		}
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true
},

//---------------------------------------------------------
Cell:{
	qansUnshade : true,

	maxnum : function(){
		return this.board.cols+this.board.rows-1;
	},
	minnum : 2
},
Border:{
	isLine : function(){
		if(this.line>0){ return true;}
		return (this.sidecell[0].isUnshade()!==this.sidecell[1].isUnshade());
	}
},
Board:{
	hasborder : 2,
	borderAsLine : true
},

AreaUnshadeGraph:{
	enabled : true
},
AreaShadeGraph:{
	enabled : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	gridcolor_type : "DLIGHT",
	numbercolor_func : "qnum",
	bgcellcolor_func : "error2",
	shadecolor : "rgb(200,200,200)",
	lwmin : 2,
	lwratio : 20,
	linecolor : "gray",
	margin : 0.5,
	flushmargin : 0.35,

	getBGCellColor : function(cell){
		if(!cell.isUnshade()){ return null;}
		var info = cell.error || cell.qinfo;
		if     (info===1){ return this.errbcolor1;}
		else if(info===2){ return this.errbcolor2;}
		return this.qsubcolor1;
	},
	getShadedCellColor : function(cell){
		if(!cell.isShade()){ return null;}
		var info = cell.error || cell.qinfo;
		if     (info===1){ return this.errcolor1;}
		else if(info===2){ return this.errcolor2;}
		else if(cell.qsub===1){ return this.shadecolor;}
		return null;
	},
	drawDotCells : function(){
		var g = this.vinc('cell_dot', 'auto', true);

		var dsize = Math.max(this.cw*0.06, 2);
		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i];

			g.vid = "c_dot_"+cell.id;
			if(cell.isUnshade()&&cell.qnum===-1){
				g.fillStyle = (!cell.trial ? this.qanscolor : this.trialcolor);
				g.fillCircle(cell.bx*this.bw, cell.by*this.bh, dsize);
			}
			else{ g.vhide();}
		}
	},
	drawTrialMarks : function(){
		var g = this.vinc('cell_mark', 'auto', true);
		g.lineWidth = 1;

		var dsize = Math.max(this.cw*0.03, 2);
		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i];

			g.vid = "c_mark_"+cell.id;
			if(cell.qsub===1&&cell.trial){
				g.strokeStyle = this.trialcolor;
				g.strokeCross(cell.bx*this.bw, cell.by*this.bh, 2*dsize);
			}
			else{ g.vhide();}
		}
	},

	paint : function(){
		this.drawBGCells();
		this.drawShadedCells();
		this.drawDotCells();
		this.drawTrialMarks();
		this.drawDashedGrid(false);
		this.drawLines();
		this.drawQuesNumbers();
		this.drawPekes();
		this.drawTarget();
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
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
		this.decodeCellAns();
	},
	encodeData : function(){
		this.encodeCellQnum();
		this.encodeCellAns();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checklist : [
		"checkNumberUnshade",
		"checkConnectUnshade",
		"checkConnectShadeOutside",
		"checkViewOfNumber"
	],

	checkNumberUnshade : function(){
		this.checkAllCell(function(cell){ return cell.isNum()&&!cell.isUnshade();}, "nmShade");
	},
	checkConnectShadeOutside : function(){
		var bd = this.board;
		for(var r=0;r<bd.sblkmgr.components.length;r++){
			var clist = bd.sblkmgr.components[r].clist;
			var d = clist.getRectSize();
			if(d.x1===bd.minbx+1||d.x2===bd.maxbx-1||d.y1===bd.minby+1||d.y2===bd.maxby-1){
				continue;
			}
			this.failcode.add("csConnOut");
			if(this.checkOnly){ break;}
			clist.seterr(1);
		}
	},

	checkViewOfNumber : function(){
		var bd = this.board;
		for(var cc=0;cc<bd.cell.length;cc++){
			var cell=bd.cell[cc];
			if(!cell.isValidNum()){ continue;}

			var clist = new this.klass.CellList(), adc = cell.adjacent, target;
			clist.add(cell);
			target=adc.left;   while(target.isUnshade()){ clist.add(target); target=target.adjacent.left;  }
			target=adc.right;  while(target.isUnshade()){ clist.add(target); target=target.adjacent.right; }
			target=adc.top;    while(target.isUnshade()){ clist.add(target); target=target.adjacent.top;   }
			target=adc.bottom; while(target.isUnshade()){ clist.add(target); target=target.adjacent.bottom;}

			if(cell.qnum===clist.length){ continue;}

			this.failcode.add("nmSumViewNe");
			if(this.checkOnly){ break;}
			clist.seterr(1);
		}
	}
},

FailCode:{
	nmShade : ["数字は黒マスになりません。", "A clue is not unshaded."],
	csConnOut : ["盤面の外につながっていない黒マスがあります。", "Some shaded cells are not connected to the outside."],
	nmSumViewNe : ["数字と輪の内側になる4方向のマスの合計が違います。","The number and the sum of the inside cells of four direction is different."]
}
}));
