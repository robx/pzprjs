//
// パズル固有スクリプト部 ましゅ版 mashu.js v3.4.0
//
pzprv3.createCustoms('mashu', {
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

	revCircle : function(){
		if(!this.owner.getConfig('uramashu')){ return;}
		for(var c=0;c<this.cellmax;c++){
			var cell = this.cell[c];
			if     (cell.qnum===1){ cell.qnum = 2;}
			else if(cell.qnum===2){ cell.qnum = 1;}
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
	setColors : function(){
		this.gridcolor = this.gridcolor_LIGHT;
	},
	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();

		this.drawQnumCircles();
		this.drawHatenas();

		this.drawPekes();
		this.drawLines();

		this.drawChassis();

		this.drawTarget();
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		this.decodeCircle();
		this.owner.board.revCircle();
	},
	pzlexport : function(type){
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

		if( !this.checkLcntCell(3) ){ return 40201;}
		if( !this.checkLcntCell(4) ){ return 40301;}

		if( !this.checkWhitePearl1() ){ return 49211;}
		if( !this.checkBlackPearl1() ){ return 49231;}

		if( !this.checkBlackPearl2() ){ return 49241;}
		if( !this.checkWhitePearl2() ){ return 49221;}

		if( !this.checkNoLinePearl() ){ return 49201;}

		if( !this.checkLcntCell(1) ){ return 40101;}

		if( !this.checkOneLoop() ){ return 41101;}

		return 0;
	},

	checkNoLinePearl : function(){
		return this.checkAllCell(function(cell){ return (cell.isNum() && cell.lcnt()==0);});
	},

	checkWhitePearl1 : function(){
		var result = true, bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c];
			if(cell.getQnum()===1 && cell.lcnt()===2 && !cell.isLineStraight()){
				if(this.inAutoCheck){ return false;}
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
				if(this.inAutoCheck){ return false;}
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
				if(this.inAutoCheck){ return false;}
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
				if(this.inAutoCheck){ return false;}
				if(result){ bd.border.seterr(-1);}
				cell.setErrorPearl();
				result = false;
			}
		}
		return result;
	}
}
});
