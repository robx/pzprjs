//
// パズル固有スクリプト部 ましゅ版 mashu.js v3.4.0
//
pzpr.createCustoms('mashu', {
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
		if(this.ub().isLine()){ this.up().setCellLineError(0);}
		if(this.db().isLine()){ this.dn().setCellLineError(0);}
		if(this.lb().isLine()){ this.lt().setCellLineError(0);}
		if(this.rb().isLine()){ this.rt().setCellLineError(0);}
	}
},

Board:{
	isborder : 1,

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
	initialize : function(){
		this.Common.prototype.initialize.call(this);

		this.gridcolor = this.gridcolor_LIGHT;
	},
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
			return (cell.error===1 ? this.errcolor1 : this.cellcolor);
		}
		return null;
	},
	getCircleFillColor : function(cell){
		if(cell.qnum===1){
			return (cell.error===1 ? this.errbcolor1 : "white");
		}
		else if(cell.qnum===2){
			return (cell.error===1 ? this.errcolor1 : this.cellcolor);
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
		return this.checkAllCell(function(cell){ return (cell.isNum() && cell.lcnt()==0);});
	},

	checkWhitePearl1 : function(){
		var result = true, bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c];
			if(cell.getQnum()===1 && cell.lcnt()===2 && !cell.isLineStraight()){
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
			if(cell.getQnum()===2 && cell.lcnt()===2 && cell.isLineStraight()){
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
			if(cell.getQnum()!==1 || cell.lcnt()!==2){ continue;}
			var stcnt = 0;
			if(cell.ub().isLine() && cell.up().lcnt()===2 && cell.up().isLineStraight()){ stcnt++;}
			if(cell.db().isLine() && cell.dn().lcnt()===2 && cell.dn().isLineStraight()){ stcnt++;}
			if(cell.lb().isLine() && cell.lt().lcnt()===2 && cell.lt().isLineStraight()){ stcnt++;}
			if(cell.rb().isLine() && cell.rt().lcnt()===2 && cell.rt().isLineStraight()){ stcnt++;}

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
			var cell = bd.cell[c];
			if(cell.getQnum()!==2 || cell.lcnt()!==2){ continue;}
			if((cell.ub().isLine() && cell.up().lcnt()===2 && !cell.up().isLineStraight()) ||
			   (cell.db().isLine() && cell.dn().lcnt()===2 && !cell.dn().isLineStraight()) ||
			   (cell.lb().isLine() && cell.lt().lcnt()===2 && !cell.lt().isLineStraight()) ||
			   (cell.rb().isLine() && cell.rt().lcnt()===2 && !cell.rt().isLineStraight()) )
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
