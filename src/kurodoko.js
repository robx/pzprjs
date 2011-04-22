//
// パズル固有スクリプト部 黒マスはどこだ版 kurodoko.js v3.4.0
//
pzprv3.custom.kurodoko = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	RBBlackCell : true,

	mousedown : function(){
		if(kc.isZ ^ pp.getVal('dispred')){ this.dispRed();}
		else if(k.editmode){ this.inputqnum();}
		else if(k.playmode){ this.inputcell();}
	},
	mousemove : function(){
		if(k.playmode){ this.inputcell();}
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,

	enablemake_p : true,
	paneltype    : 10
},

//---------------------------------------------------------
// 盤面管理系
Board:{
	qcols : 9,
	qrows : 9,

	numberIsWhite : true,

	nummaxfunc : function(cc){
		return this.qcols+this.qrows-1;
	}
},

AreaManager:{
	checkWhiteCell : true
},

Menu:{
	menufix : function(){
		this.addUseToFlags();
		this.addRedBlockRBToFlags();
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	hideHatena : true,

	setColors : function(){
		this.gridcolor = this.gridcolor_DLIGHT;
		this.bcolor = this.bcolor_GREEN;
		this.setBGCellColorFunc('qsub1');

		this.fontsizeratio = 0.85;
		this.circleratio = [0.42, 0.42];
	},
	paint : function(){
		this.drawBGCells();
		this.drawGrid();
		this.drawBlackCells();

		this.drawCirclesAtNumber();
		this.drawNumbers();

		this.drawChassis();

		this.drawTarget();
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		this.decodeNumber16();
	},
	pzlexport : function(type){
		this.encodeNumber16();
	},

	decodeKanpen : function(){
		fio.decodeCellQnum_kanpen();
	},
	encodeKanpen : function(){
		fio.encodeCellQnum_kanpen();
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
	},

	kanpenOpen : function(){
		this.decodeCellQnumAns_kanpen();
	},
	kanpenSave : function(){
		this.encodeCellQnumAns_kanpen();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.checkSideCell(function(c1,c2){ return (bd.isBlack(c1) && bd.isBlack(c2));}) ){
			this.setAlert('黒マスがタテヨコに連続しています。','Black cells are adjacent.'); return false;
		}

		if( !this.checkRBBlackCell( bd.areas.getWCellInfo() ) ){
			this.setAlert('白マスが分断されています。','White cells are devided.'); return false;
		}

		if( !this.checkCellNumber() ){
			this.setAlert('数字と黒マスにぶつかるまでの4方向のマスの合計が違います。','The number and the sum of the coutinuous white cells of four direction is different.'); return false;
		}

		return true;
	},

	checkCellNumber : function(){
		var result = true;
		for(var cc=0;cc<bd.cellmax;cc++){
			if(!bd.isValidNum(cc)){ continue;}

			var tx, ty, list = [cc];
			tx = bd.cell[cc].bx-2; ty = bd.cell[cc].by;
			while(tx>bd.minbx){ var c=bd.cnum(tx,ty); if(bd.isWhite(c)){ list.push(c); tx-=2;} else{ break;} }
			tx = bd.cell[cc].bx+2; ty = bd.cell[cc].by;
			while(tx<bd.maxbx){ var c=bd.cnum(tx,ty); if(bd.isWhite(c)){ list.push(c); tx+=2;} else{ break;} }
			tx = bd.cell[cc].bx; ty = bd.cell[cc].by-2;
			while(ty>bd.minby){ var c=bd.cnum(tx,ty); if(bd.isWhite(c)){ list.push(c); ty-=2;} else{ break;} }
			tx = bd.cell[cc].bx; ty = bd.cell[cc].by+2;
			while(ty<bd.maxby){ var c=bd.cnum(tx,ty); if(bd.isWhite(c)){ list.push(c); ty+=2;} else{ break;} }

			if(bd.QnC(cc)!=list.length){
				if(this.inAutoCheck){ return false;}
				bd.sErC(list,1);
				result = false;
			}
		}
		return result;
	}
}
};
