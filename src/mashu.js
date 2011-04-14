//
// パズル固有スクリプト部 ましゅ版 mashu.js v3.4.0
//
pzprv3.custom.mashu = {
//---------------------------------------------------------
// フラグ
Flags:{
	setting : function(pid){
		this.qcols = 10;
		this.qrows = 10;

		this.irowake  = 1;
		this.isborder = 1;

		this.isCenterLine    = true;
		this.isDispHatena    = true;
		this.isInputHatena   = true;
		this.inputQnumDirect = true;
		this.numberAsObject  = true;

		this.floatbgcolor = "rgb(0, 224, 0)";
	}
},

//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mousedown : function(){
		if(kc.isZ ^ pp.getVal('dispred')){ this.dispRedLine();}
		else if(k.editmode){ this.inputqnum();}
		else if(k.playmode){
			if     (this.btn.Left) { this.inputLine();}
			else if(this.btn.Right){ this.inputpeke();}
		}
	},
	mouseup : function(){
		if(k.playmode && this.btn.Left && this.notInputted()){
			this.inputpeke();
		}
	},
	mousemove : function(){
		if(k.playmode){
			if     (this.btn.Left) { this.inputLine();}
			else if(this.btn.Right){ this.inputpeke();}
		}
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	keyinput : function(ca){ /* 空関数 */ }
},

//---------------------------------------------------------
// 盤面管理系
Board:{
	maxnum : 2,

	revCircle : function(){
		if(!pp.getVal('uramashu')){ return;}
		for(var c=0;c<this.cellmax;c++){
			if     (this.cell[c].qnum===1){ this.cell[c].qnum = 2;}
			else if(this.cell[c].qnum===2){ this.cell[c].qnum = 1;}
		}
	},

	setErrorPearl : function(cc){
		this.setCellLineError(cc,1);
		if(this.isLine(this.ub(cc))){ this.setCellLineError(this.up(cc),0);}
		if(this.isLine(this.db(cc))){ this.setCellLineError(this.dn(cc),0);}
		if(this.isLine(this.lb(cc))){ this.setCellLineError(this.lt(cc),0);}
		if(this.isLine(this.rb(cc))){ this.setCellLineError(this.rt(cc),0);}
	}
},

Menu:{
	menufix : function(){
		pp.addCheck('uramashu','setting',false, '裏ましゅ', 'Ura-Mashu');
		pp.setLabel('uramashu', '裏ましゅにする', 'Change to Ura-Mashu');
		pp.funcs['uramashu'] = function(){
			for(var c=0;c<bd.cellmax;c++){
				if     (bd.QnC(c)===1){ bd.sQnC(c,2);}
				else if(bd.QnC(c)===2){ bd.sQnC(c,1);}
			}
			pc.paintAll();
		};

		this.addRedLineToFlags();
	}
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

		this.drawPekes(0);
		this.drawLines();

		this.drawChassis();
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
		fio.decodeCellQnum_kanpen();
		bd.revCircle();
	},
	encodeKanpen : function(){
		bd.revCircle();
		fio.encodeCellQnum_kanpen();
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

		if( !this.checkAllCell(function(c){ return (bd.isNum(c) && bd.lines.lcntCell(c)==0);}) ){
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
			if(bd.QnC(c)===1 && bd.lines.lcntCell(c)===2 && !bd.isLineStraight(c)){
				if(this.inAutoCheck){ return false;}
				if(result){ bd.sErBAll(2);}
				bd.setCellLineError(c,1);
				result = false;
			}
		}
		return result;
	},
	checkBlackPearl1 : function(){
		var result = true;
		for(var c=0;c<bd.cellmax;c++){
			if(bd.QnC(c)===2 && bd.lines.lcntCell(c)===2 && bd.isLineStraight(c)){
				if(this.inAutoCheck){ return false;}
				if(result){ bd.sErBAll(2);}
				bd.setCellLineError(c,1);
				result = false;
			}
		}
		return result;
	},

	checkWhitePearl2 : function(){
		var result = true;
		for(var c=0;c<bd.cellmax;c++){
			if(bd.QnC(c)!==1 || bd.lines.lcntCell(c)!==2){ continue;}
			var stcnt = 0;
			if(bd.isLine(bd.ub(c)) && bd.lines.lcntCell(bd.up(c))===2 && bd.isLineStraight(bd.up(c))){ stcnt++;}
			if(bd.isLine(bd.db(c)) && bd.lines.lcntCell(bd.dn(c))===2 && bd.isLineStraight(bd.dn(c))){ stcnt++;}
			if(bd.isLine(bd.lb(c)) && bd.lines.lcntCell(bd.lt(c))===2 && bd.isLineStraight(bd.lt(c))){ stcnt++;}
			if(bd.isLine(bd.rb(c)) && bd.lines.lcntCell(bd.rt(c))===2 && bd.isLineStraight(bd.rt(c))){ stcnt++;}

			if(stcnt>=2){
				if(this.inAutoCheck){ return false;}
				if(result){ bd.sErBAll(2);}
				bd.setErrorPearl(c);
				result = false;
			}
		}
		return result;
	},
	checkBlackPearl2 : function(){
		var result = true;
		for(var c=0;c<bd.cellmax;c++){
			if(bd.QnC(c)!==2 || bd.lines.lcntCell(c)!==2){ continue;}
			if((bd.isLine(bd.ub(c)) && bd.lines.lcntCell(bd.up(c))===2 && !bd.isLineStraight(bd.up(c))) ||
			   (bd.isLine(bd.db(c)) && bd.lines.lcntCell(bd.dn(c))===2 && !bd.isLineStraight(bd.dn(c))) ||
			   (bd.isLine(bd.lb(c)) && bd.lines.lcntCell(bd.lt(c))===2 && !bd.isLineStraight(bd.lt(c))) ||
			   (bd.isLine(bd.rb(c)) && bd.lines.lcntCell(bd.rt(c))===2 && !bd.isLineStraight(bd.rt(c))) )
			{
				if(this.inAutoCheck){ return false;}
				if(result){ bd.sErBAll(2);}
				bd.setErrorPearl(c);
				result = false;
			}
		}
		return result;
	}
}
};
