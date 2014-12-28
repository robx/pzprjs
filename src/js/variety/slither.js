//
// パズル固有スクリプト部 スリザーリンク版 slither.js v3.4.1
//
pzpr.classmgr.makeCustom(['slither'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		var puzzle = this.owner;
		if(puzzle.playmode){
			var inputbg = false;
			if     (this.mousestart){ inputbg = (!!puzzle.getConfig('bgcolor') && this.inputBGcolor0());}
			else if(this.mousemove) { inputbg = (!!puzzle.getConfig('bgcolor') && this.inputData>=10);}

			if(!inputbg){
				if(this.btn.Left){
					if(this.mousestart || this.mousemove){ this.inputLine();}
					else if(this.mouseend && this.notInputted()){
						this.prevPos.reset();
						this.inputpeke();
					}
				}
				else if(this.btn.Right){
					if(this.mousestart || this.mousemove){ this.inputpeke();}
				}
			}
			else{ this.inputBGcolor();}
		}
		else if(puzzle.editmode){
			if(this.mousestart){ this.inputqnum();}
		}
	},
	inputRed : function(){ this.dispRedLine();},

	inputBGcolor0 : function(){
		return this.getpos(0.25).oncell();
	},
	inputBGcolor : function(){
		var cell = this.getcell();
		if(cell.isnull || cell===this.mouseCell){ return;}
		if(this.inputData===null){
			if(this.btn.Left){
				if     (cell.qsub===0){ this.inputData=11;}
				else if(cell.qsub===1){ this.inputData=12;}
				else                  { this.inputData=10;}
			}
			else{
				if     (cell.qsub===0){ this.inputData=12;}
				else if(cell.qsub===1){ this.inputData=10;}
				else                  { this.inputData=11;}
			}
		}
		cell.setQsub(this.inputData-10);
		cell.draw();

		this.mouseCell = cell; 
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
	maxnum : 3,
	minnum : 0,

	getdir4BorderLine1 : function(){
		var adb = this.adjborder, cnt=0;
		if( adb.top.isLine()    ){ cnt++;}
		if( adb.bottom.isLine() ){ cnt++;}
		if( adb.left.isLine()   ){ cnt++;}
		if( adb.right.isLine()  ){ cnt++;}
		return cnt;
	}
},

Board:{
	hasborder : 2
},

LineManager:{
	borderAsLine : true
},

Flags:{
	redline : true,
	bgcolor : true,
	irowake : 1
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	bgcellcolor_func : "qsub2",

	paint : function(){
		this.drawBGCells();

		this.drawLines();

		this.drawBaseMarks();

		this.drawNumbers();

		this.drawPekes();

		this.drawTarget();
	},

	repaintParts : function(blist){
		this.range.crosses = blist.crossinside();

		this.drawBaseMarks();
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decode4Cell();
	},
	encodePzpr : function(type){
		this.encode4Cell();
	},

	decodeKanpen : function(){
		this.owner.fio.decodeCellQnum_kanpen();
	},
	encodeKanpen : function(){
		this.owner.fio.encodeCellQnum_kanpen();
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		if(this.filever===1){
			this.decodeCellQnum();
			this.decodeCellQsub();
			this.decodeBorderLine();
		}
		else if(this.filever===0){
			this.decodeCellQnum();
			this.decodeBorderLine();
		}
	},
	encodeData : function(){
		this.filever = 1;
		this.encodeCellQnum();
		this.encodeCellQsub();
		this.encodeBorderLine();
	},

	kanpenOpen : function(){
		this.decodeCellQnum_kanpen();
		this.decodeBorderLine();
	},
	kanpenSave : function(){
		this.encodeCellQnum_kanpen();
		this.encodeBorderLine();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checklist : [
		"checkBranchLine",
		"checkCrossLine",
		"checkdir4BorderLine",
		"checkOneLoop",
		"checkDeadendLine+"
	],
	
	checkdir4BorderLine : function(){
		var bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c], qn = cell.qnum;
			if(qn>=0 && qn!==cell.getdir4BorderLine1()){
				this.failcode.add("nmLineNe");
				if(this.checkOnly){ break;}
				cell.seterr(1);
			}
		}
	}
},

FailCode:{
	nmLineNe : ["数字の周りにある線の本数が違います。","The number is not equal to the number of lines around it."]
}
});
