//
// パズル固有スクリプト部 ましゅ版 mashu.js v3.4.0
//
pzprv3.custom.mashu = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputedit : function(){
		if(this.mousestart){ this.inputqnum();}
	},
	inputplay : function(){
		if(this.mousestart || this.mousemove){
			if     (this.btn.Left) { this.inputLine();}
			else if(this.btn.Right){ this.inputpeke();}
		}
		else if(this.mouseend && this.notInputted()){
			if(this.btn.Left){ this.inputpeke();}
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

Menu:{
	menufix : function(pp){
		pp.addCheck('uramashu','setting',false, '裏ましゅ', 'Ura-Mashu');
		pp.setLabel('uramashu', '裏ましゅにする', 'Change to Ura-Mashu');
		this.funcs['uramashu'] = function(){
			for(var c=0;c<bd.cellmax;c++){
				var cell = bd.cell[c];
				if     (cell.getQnum()===1){ cell.setQnum(2);}
				else if(cell.getQnum()===2){ cell.setQnum(1);}
			}
			this.owner.painter.paintAll();
		};

		this.addRedLineToFlags();
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	irowake : 1,

	setColors : function(){
		this.gridcolor = this.gridcolor_LIGHT;
	},
	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();

		this.drawQnumCircles();
		this.drawHatenas();

		this.drawPekes(0);
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
		bd.revCircle();
	},
	pzlexport : function(type){
		bd.revCircle();
		this.encodeCircle();
		bd.revCircle();
	},

	decodeKanpen : function(){
		this.owner.fio.decodeCellQnum_kanpen();
		bd.revCircle();
	},
	encodeKanpen : function(){
		bd.revCircle();
		this.owner.fio.encodeCellQnum_kanpen();
		bd.revCircle();
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCellQnum();
		this.decodeBorderLine();
		bd.revCircle();
	},
	encodeData : function(){
		bd.revCircle();
		this.encodeCellQnum();
		this.encodeBorderLine();
		bd.revCircle();
	},

	kanpenOpen : function(){
		this.decodeCellQnum_kanpen();
		this.decodeBorderLine();
		bd.revCircle();
	},
	kanpenSave : function(){
		bd.revCircle();
		this.encodeCellQnum_kanpen();
		this.encodeBorderLine();
		bd.revCircle();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.checkLcntCell(3) ){
			this.setAlert('分岐している線があります。','There is a branched line.'); return false;
		}
		if( !this.checkLcntCell(4) ){
			this.setAlert('線が交差しています。','There is a crossing line.'); return false;
		}

		if( !this.checkWhitePearl1() ){
			this.setAlert('白丸の上で線が曲がっています。','Lines curve on white pearl.'); return false;
		}
		if( !this.checkBlackPearl1() ){
			this.setAlert('黒丸の上で線が直進しています。','Lines go straight on black pearl.'); return false;
		}

		if( !this.checkBlackPearl2() ){
			this.setAlert('黒丸の隣で線が曲がっています。','Lines curve next to black pearl.'); return false;
		}
		if( !this.checkWhitePearl2() ){
			this.setAlert('白丸の隣で線が曲がっていません。','Lines go straight next to white pearl on each side.'); return false;
		}

		if( !this.checkAllCell(function(cell){ return (cell.isNum() && cell.lcnt()==0);}) ){
			this.setAlert('線が上を通っていない丸があります。','Lines don\'t pass some pearls.'); return false;
		}

		if( !this.checkLcntCell(1) ){
			this.setAlert('線が途中で途切れています。','There is a dead-end line.'); return false;
		}

		if( !this.checkOneLoop() ){
			this.setAlert('輪っかが一つではありません。','There are plural loops.'); return false;
		}

		return true;
	},

	checkWhitePearl1 : function(){
		var result = true;
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
		var result = true;
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
		var result = true;
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
		var result = true;
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
};
