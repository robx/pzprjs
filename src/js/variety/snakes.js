//
// パズル固有スクリプト部 へびいちご版 snakes.js v3.4.1
//
pzpr.classmgr.makeCustom(['snakes'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.puzzle.playmode){
			if(this.mousestart || this.mousemove){
				if(!this.inputDot_snakes()){
					this.dragnumber_snakes();
				}
			}
		}
		else if(this.puzzle.editmode){
			if(this.mousestart || (this.mousemove && this.notInputted())){
				this.inputdirec();
			}
		}
		
		if(this.mouseend && this.notInputted()){
			this.inputqnum_snakes();
		}
	},

	dragnumber_snakes : function(){
		var cell = this.getcell();
		if(cell.isnull||cell===this.mouseCell){ return;}
		if(this.mouseCell.isnull){
			this.inputData = cell.anum!==-1?cell.anum:10;
			this.mouseCell = cell;
		}
		else if(cell.qnum===-1 && this.inputData>=1 && this.inputData<=5){
			if     (this.btn.Left ){ this.inputData++;}
			else if(this.btn.Right){ this.inputData--;}
			if(this.inputData>=1 && this.inputData<=5){
				cell.setQdir(0);
				cell.setAnum(this.inputData);
				cell.setQsub(0);
				this.mouseCell = cell;
				cell.draw();
			}
		}
		else if(cell.qnum===-1 && this.inputData===10){
			cell.setAnum(-1);
			cell.setQsub(0);
			cell.draw();
		}
	},
	inputDot_snakes : function(){
		if(!this.btn.Right || (this.inputData!==null && this.inputData>=0)){ return false;}

		var cell = this.getcell();
		if(cell.isnull||cell===this.mouseCell){ return (this.inputData<0);}

		if(this.inputData===null){
			if(cell.anum===-1){
				this.inputData = (cell.qsub!==1?-2:-3);
				return true;
			}
			return false;
		}

		cell.setAnum(-1);
		cell.setQsub(this.inputData===-2?1:0);
		cell.draw();
		this.mouseCell = cell;
		return true;
	},
	inputqnum_snakes : function(){
		var cell = this.getcell();
		if(!cell.isnull){
			this.mouseCell = this.board.emptycell;
			this.inputqnum();
		}
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,
	enableplay : true,
	moveTarget : function(ca){
		if(ca.match(/shift/)){ return false;}
		return this.moveTCell(ca);
	},

	keyinput : function(ca){
		if(this.puzzle.editmode && this.key_inputdirec(ca)){ return;}

		if(this.puzzle.playmode && (ca==='q'||ca==='-')){ ca='s1';}
		this.key_inputqnum(ca);
	}
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	maxnum : 5,
	minnum : function(){
		return (this.puzzle.playmode ? 1 : 0);
	},

	draw : function(){
		if(!this.puzzle.getConfig('snakebd')){
			this.getaddr().draw();
		}
		else{
			this.puzzle.painter.paintRange(this.bx-2, this.by-2, this.bx+2, this.by+2);
		}
	}
},
Board:{
	hasborder : 1,

	initialize : function(){
		this.common.initialize.call(this);

		this.snakemgr = this.addInfoList(this.klass.AreaSnakeGraph);
	}
},
BoardExec:{
	adjustBoardData : function(key,d){
		this.adjustNumberArrow(key,d);
	}
},
'AreaSnakeGraph:AreaGraphBase':{
	enabled : true,
	setComponentRefs : function(obj, component){ obj.snake = component;},
	getObjNodeList   : function(nodeobj){ return nodeobj.snakenodes;},
	resetObjNodeList : function(nodeobj){ nodeobj.snakenodes = [];},
	
	isnodevalid : function(cell){ return (cell.anum>0);},
	isedgevalidbynodeobj : function(cell1, cell2){
		return ((cell1.anum===-1)===(cell2.anum===-1)) && (Math.abs(cell1.anum-cell2.anum)===1);
	}
},

Flags:{
	use : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	hideHatena : true,

	gridcolor_type : "LIGHT",
	dotcolor_type : "PINK",

	cellcolor_func : "qnum",
	fontcolor    : "white",
	fontErrcolor : "white",

	paint : function(){
		this.drawBGCells();
		this.drawDotCells(true);
		this.drawDashedGrid();

		this.drawBorders();

		this.drawShadedCells();
		this.drawArrowNumbers();
		this.drawAnswerNumbers();

		this.drawChassis();

		this.drawCursor();
	},

	getBorderColor : function(border){
		if(!this.puzzle.getConfig('snakebd')){ return false;}

		var cell1 = border.sidecell[0], cell2 = border.sidecell[1];
		if(!cell1.isnull && !cell2.isnull &&
		   (cell1.qnum===-1 && cell2.qnum===-1) &&
		   (cell1.anum!==-1 || cell2.anum!==-1) &&
		   ( ((cell1.anum===-1)!==(cell2.anum===-1)) || (Math.abs(cell1.anum-cell2.anum)!==1)) )
		{
			return this.borderQanscolor;
		}
		return null;
	},

	drawAnswerNumbers : function(){
		var g = this.vinc('cell_number', 'auto');

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i];
			g.vid = "cell_ansnum_"+cell.id;
			if(cell.qnum===-1 && cell.anum>0){
				g.fillStyle = this.fontAnscolor;
				this.disptext(""+cell.anum, cell.bx*this.bw, cell.by*this.bh);
			}
			else{ g.vhide();}
		}
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodeArrowNumber16();
	},
	encodePzpr : function(type){
		this.encodeArrowNumber16();
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCellDirecQnum();
		this.decodeCellAnumsub();
	},
	encodeData : function(){
		this.encodeCellDirecQnum();
		this.encodeCellAnumsub();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checklist : [
		"checkSnakeSize",
		"checkOtherAnsNumberInRoom",
		"checkSideCell_snakes",
		"checkArrowNumber",
		"checkSnakesView"
	],

	checkSnakeSize : function(){
		this.checkAllArea(this.board.snakemgr, function(w,h,a,n){ return (a===5);}, "bkSizeNe5");
	},
	checkOtherAnsNumberInRoom : function(){
		this.checkDifferentNumberInRoom_main(this.board.snakemgr, this.isDifferentAnsNumberInClist);
	},

	checkSideCell_snakes : function(){
		var result = true, bd = this.board;
		function func(cell1,cell2){
			var r1 = cell1.snake, r2 = cell2.snake;
			return (r1!==null && r2!==null && r1!==r2);
		}
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c], cell2 = cell.adjacent.right;
			if(!cell2.isnull && func(cell,cell2)){
				result = false;
				if(this.checkOnly){ break;}
				cell.snake.clist.seterr(1);
				cell2.snake.clist.seterr(1);
			}
			cell2 = cell.adjacent.bottom;
			if(!cell2.isnull && func(cell,cell2)){
				result = false;
				if(this.checkOnly){ break;}
				cell.snake.clist.seterr(1);
				cell2.snake.clist.seterr(1);
			}
		}
		if(!result){ this.failcode.add("bsSnake");}
	},

	checkArrowNumber : function(){
		var result = true, bd = this.board;
		function gonext(){
			cell2 = pos.getc();
			return (!cell2.isnull && cell2.qnum===-1 && cell2.anum===-1);
		}
		function noans(cell2){
			return (cell2.isnull || cell2.qnum!==-1 || cell2.anum===-1);
		}

		for(var c=0;c<bd.cellmax;c++){
			var cell=bd.cell[c], num=cell.qnum, dir=cell.qdir;
			if(num<0 || dir===0){ continue;}

			var cell2, pos=cell.getaddr();
			pos.movedir(dir,2);
			while(gonext()){ pos.movedir(dir,2);}
			// cell2は数字のあるマスのIDか、null(盤面外)を指す

			// 矢印つき数字が0で、その先に回答の数字がある
			if(num===0 && !noans(cell2)){
				result = false;
				if(this.checkOnly){ break;}
				cell.seterr(1);
				if(num<=0){ cell2.seterr(1);}
			}
			// 矢印つき数字が1以上で、その先に回答の数字がない or 回答の数字が違う
			else if(num>0 && (noans(cell2) || cell2.anum!==num)){
				result = false;
				if(this.checkOnly){ break;}
				cell.seterr(1);
				cell2.seterr(1);
			}
		}
		if(!result){ this.failcode.add("anNumberNe");}
	},
	checkSnakesView : function(){
		var snakes = this.board.snakemgr.components;
		for(var r=0;r<snakes.length;r++){
			var clist = snakes[r].clist;
			var cell = clist.filter(function(cell){ return (cell.anum===1);})[0];
			if(!cell){ continue;}

			var cell2, dir=cell.NDIR, adc=cell.adjacent;
			cell2=adc.bottom; if(!cell2.isnull && cell2.anum===2){ dir=cell.UP;}
			cell2=adc.top;    if(!cell2.isnull && cell2.anum===2){ dir=cell.DN;}
			cell2=adc.right;  if(!cell2.isnull && cell2.anum===2){ dir=cell.LT;}
			cell2=adc.left;   if(!cell2.isnull && cell2.anum===2){ dir=cell.RT;}
			if(dir===cell.NDIR){ continue;}

			var pos = cell.getaddr(), clist2 = new this.klass.CellList();
			clist2.add(cell);
			while(!cell.isnull){
				pos.movedir(dir,2);
				cell = pos.getc();

				if(!cell.isnull){ clist2.add(cell);}
				if(cell.isnull || cell.qnum!==-1 || cell.anum!==-1){ break;}
			}
			// cellは数字のあるマスか、null(盤面外)を指す

			if(cell.isnull || cell.anum<=0 || cell.qnum!==-1 || cell.snake===null || cell.snake===snakes[r]){ continue;}
			
			this.failcode.add("snakeAttack");
			if(this.checkOnly){ break;}
			clist2.seterr(1);
			clist.seterr(1);
			cell.snake.clist.seterr(1);
		}
	}
},

FailCode:{
	bkDupNum   : ["同じ数字が入っています。","A Snake has same plural marks."],
	bkSizeNe5  : ["大きさが５ではない蛇がいます。","The size of a snake is not five."],
	bsSnake    : ["別々の蛇が接しています。","Other snakes are adjacent."],
	anNumberNe : ["矢印の先にある数字が正しくありません。","There is a wrong number which is in front of the arrowed number."],
	snakeAttack: ["蛇の視線の先に別の蛇がいます。","A snake can see another snake."]
}
});
