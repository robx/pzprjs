//
// パズル固有スクリプト部 ましゅ版 mashu.js v3.4.1
//
pzpr.classmgr.makeCustom(['mashu'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.owner.playmode){
			if(this.btn.Left){
				if(this.mousestart || this.mousemove){ this.inputLine();}
				else if(this.mouseend && this.notInputted()){ this.inputpeke();}
			}
			else if(this.btn.Right){
				if(this.mousestart || this.mousemove){ this.inputpeke();}
			}
		}
		else if(this.owner.editmode){
			if(this.mousestart){ this.inputqnum();}
		}
	},
	inputRed : function(){ this.dispRedLine();}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	numberAsObject : true,

	maxnum : 2,

	setErrorPearl : function(){
		this.setCellLineError(1);
		var adc = this.adjacent, adb = this.adjborder;
		if(adb.top.isLine()   ){ adc.top.setCellLineError(0);   }
		if(adb.bottom.isLine()){ adc.bottom.setCellLineError(0);}
		if(adb.left.isLine()  ){ adc.left.setCellLineError(0);  }
		if(adb.right.isLine() ){ adc.right.setCellLineError(0); }
	}
},

Board:{
	hasborder : 1,

	uramashu : false,

	revCircle : function(){
		if(!this.uramashu){ return;}
		this.revCircleMain();
	},
	revCircleMain : function(){
		for(var c=0;c<this.cellmax;c++){
			var cell = this.cell[c];
			if     (cell.qnum===1){ cell.setQnum(2);}
			else if(cell.qnum===2){ cell.setQnum(1);}
		}
	}
},

LineManager:{
	isCenterLine : true
},

Flags:{
	redline : true,
	irowake : 1
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	gridcolor_type : "LIGHT",

	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();

		this.drawCircles();
		this.drawHatenas();

		this.drawPekes();
		this.drawLines();

		this.drawChassis();

		this.drawTarget();
	},

	/* 旧drawQnumCircles用オーバーライド */
	getCircleStrokeColor : function(cell){
		if(cell.qnum===1){
			return (cell.error===1 ? this.errcolor1 : this.quescolor);
		}
		return null;
	},
	getCircleFillColor : function(cell){
		if(cell.qnum===1){
			return (cell.error===1 ? this.errbcolor1 : "white");
		}
		else if(cell.qnum===2){
			return (cell.error===1 ? this.errcolor1 : this.quescolor);
		}
		return null;
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodeCircle();
		this.owner.board.revCircle();
	},
	encodePzpr : function(type){
		this.owner.board.revCircle();
		this.encodeCircle();
		this.owner.board.revCircle();
	},

	decodeKanpen : function(){
		this.owner.fio.decodeCellQnum_kanpen();
		this.owner.board.revCircle();
	},
	encodeKanpen : function(){
		this.owner.board.revCircle();
		this.owner.fio.encodeCellQnum_kanpen();
		this.owner.board.revCircle();
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCellQnum();
		this.decodeBorderLine();
		this.owner.board.revCircle();
	},
	encodeData : function(){
		this.owner.board.revCircle();
		this.encodeCellQnum();
		this.encodeBorderLine();
		this.owner.board.revCircle();
	},

	kanpenOpen : function(){
		this.decodeCellQnum_kanpen();
		this.decodeBorderLine();
		this.owner.board.revCircle();
	},
	kanpenSave : function(){
		this.owner.board.revCircle();
		this.encodeCellQnum_kanpen();
		this.encodeBorderLine();
		this.owner.board.revCircle();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.checkLineCount(3) ){ return 'lnBranch';}
		if( !this.checkLineCount(4) ){ return 'lnCross';}

		if( !this.checkWhitePearl1() ){ return 'mashuWCurve';}
		if( !this.checkBlackPearl1() ){ return 'mashuBStrig';}

		if( !this.checkBlackPearl2() ){ return 'mashuBCvNbr';}
		if( !this.checkWhitePearl2() ){ return 'mashuWStNbr';}

		if( !this.checkNoLinePearl() ){ return 'mashuOnLine';}

		if( !this.checkLineCount(1) ){ return 'lnDeadEnd';}

		if( !this.checkOneLoop() ){ return 'lnPlLoop';}

		return null;
	},

	checkNoLinePearl : function(){
		return this.checkAllCell(function(cell){ return (cell.isNum() && cell.lcnt===0);});
	},

	checkWhitePearl1 : function(){
		var result = true, bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c];
			if(cell.qnum===1 && cell.lcnt===2 && !cell.isLineStraight()){
				if(this.checkOnly){ return false;}
				if(result){ bd.border.seterr(-1);}
				cell.setCellLineError(1);
				result = false;
			}
		}
		return result;
	},
	checkBlackPearl1 : function(){
		var result = true, bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c];
			if(cell.qnum===2 && cell.lcnt===2 && cell.isLineStraight()){
				if(this.checkOnly){ return false;}
				if(result){ bd.border.seterr(-1);}
				cell.setCellLineError(1);
				result = false;
			}
		}
		return result;
	},

	checkWhitePearl2 : function(){
		var result = true, bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c];
			if(cell.qnum!==1 || cell.lcnt!==2){ continue;}
			var adc = cell.adjacent, adb = cell.adjborder, stcnt = 0;
			if(adb.top.isLine()    && adc.top.lcnt===2    && adc.top.isLineStraight()   ){ stcnt++;}
			if(adb.bottom.isLine() && adc.bottom.lcnt===2 && adc.bottom.isLineStraight()){ stcnt++;}
			if(adb.left.isLine()   && adc.left.lcnt===2   && adc.left.isLineStraight()  ){ stcnt++;}
			if(adb.right.isLine()  && adc.right.lcnt===2  && adc.right.isLineStraight() ){ stcnt++;}

			if(stcnt>=2){
				if(this.checkOnly){ return false;}
				if(result){ bd.border.seterr(-1);}
				cell.setErrorPearl();
				result = false;
			}
		}
		return result;
	},
	checkBlackPearl2 : function(){
		var result = true, bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c], adc = cell.adjacent, adb = cell.adjborder;
			if(cell.qnum!==2 || cell.lcnt!==2){ continue;}
			if((adb.top.isLine()    && adc.top.lcnt===2    && !adc.top.isLineStraight()   ) ||
			   (adb.bottom.isLine() && adc.bottom.lcnt===2 && !adc.bottom.isLineStraight()) ||
			   (adb.left.isLine()   && adc.left.lcnt===2   && !adc.left.isLineStraight()  ) ||
			   (adb.right.isLine()  && adc.right.lcnt===2  && !adc.right.isLineStraight() ) )
			{
				if(this.checkOnly){ return false;}
				if(result){ bd.border.seterr(-1);}
				cell.setErrorPearl();
				result = false;
			}
		}
		return result;
	}
},

FailCode:{
	mashuOnLine : ["線が上を通っていない丸があります。","Lines don't pass some pearls."],
	mashuWCurve : ["白丸の上で線が曲がっています。","Lines curve on white pearl."],
	mashuWStNbr : ["白丸の隣で線が曲がっていません。","Lines go straight next to white pearl on each side."],
	mashuBStrig : ["黒丸の上で線が直進しています。","Lines go straight on black pearl."],
	mashuBCvNbr : ["黒丸の隣で線が曲がっています。","Lines curve next to black pearl."]
}
});
