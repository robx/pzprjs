//
// パズル固有スクリプト部 ヤジリン版 yajirin.js v3.4.1
// 
pzpr.classmgr.makeCustom(['yajirin'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	use     : true,
	redline : true,
	
	mouseinput : function(){
		if(this.puzzle.playmode){
			if(this.mousestart || this.mousemove){
				if     (this.btn==='left') { this.inputLine();}
				else if(this.btn==='right'){ this.inputcell();}
			}
			else if(this.mouseend && this.notInputted()){ this.inputcell();}
		}
		else if(this.puzzle.editmode){
			if(this.mousestart || this.mousemove){ this.inputdirec();}
			else if(this.mouseend && this.notInputted()){ this.inputqnum();}
		}
	}
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
	minnum : 0,

	numberRemainsUnshaded : true,

	// 線を引かせたくないので上書き
	noLP : function(dir){ return (this.isShade() || this.isNum());}
},
Border:{
	enableLineNG : true
},
Board:{
	hasborder : 1
},
BoardExec:{
	adjustBoardData : function(key,d){
		this.adjustNumberArrow(key,d);
	}
},

LineGraph:{
	enabled : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	irowake : true,

	gridcolor_type : "LIGHT",

	dotcolor : "rgb(255, 96, 191)",

	paint : function(){
		this.drawBGCells();
		this.drawDotCells(false);
		this.drawGrid();
		this.drawShadedCells();

		this.drawArrowNumbers();

		this.drawLines();
		this.drawPekes();

		this.drawChassis();

		this.drawTarget();
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
	},

	decodeKanpen : function(){
		this.puzzle.fio.decodeCellDirecQnum_kanpen(true);
	},
	encodeKanpen : function(){
		this.puzzle.fio.encodeCellDirecQnum_kanpen(true);
	}
},
//---------------------------------------------------------
FileIO:{
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

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checklist : [
		"checkBranchLine",
		"checkCrossLine",
		"checkLineOnShadeCell",
		"checkAdjacentShadeCell",
		"checkDeadendLine+",
		"checkArrowNumber",
		"checkOneLoop",
		"checkEmptyCell_yajirin+"
	],

	checkEmptyCell_yajirin : function(){
		this.checkAllCell(function(cell){ return (cell.lcnt===0 && !cell.isShade() && cell.noNum());}, "ceEmpty");
	},

	checkArrowNumber : function(){
		var bd = this.board;
		for(var c=0;c<bd.cell.length;c++){
			var cell = bd.cell[c];
			if(!cell.isValidNum() || cell.qdir===0 || cell.isShade()){ continue;}
			var pos = cell.getaddr(), dir = cell.qdir;
			var clist = new this.klass.CellList();
			while(1){
				pos.movedir(dir,2);
				var cell2 = pos.getc();
				if(cell2.isnull){ break;}
				clist.add(cell2);
			}
			if(cell.qnum===clist.filter(function(cell){ return cell.isShade();}).length){ continue;}
			
			this.failcode.add("anShadeNe");
			if(this.checkOnly){ break;}
			cell.seterr(1);
			clist.seterr(1);
		}
	}
},

FailCode:{
	ceEmpty : ["黒マスも線も引かれていないマスがあります。","There is an empty cell."]
}
});
