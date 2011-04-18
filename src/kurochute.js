//
// パズル固有スクリプト部 クロシュート版 kurochute.js v3.4.0
//
pzprv3.custom.kurochute = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	RBBlackCell : true,

	mousedown : function(){
		if     (k.editmode){ this.inputqnum();}
		else if(k.playmode){ this.inputcell();}
	},
	mouseup : function(){
		if(k.playmode && this.notInputted()){ this.inputqsub();}
	},
	mousemove : function(){
		if(k.playmode){ this.inputcell();}
	},

	inputqsub : function(){
		var cc = this.cellid();
		if(cc===null){ return;}

		if     (bd.QsC(cc)==0){ bd.sQsC(cc,2);}
		else if(bd.QsC(cc)==2){ bd.sQsC(cc,0);}
		pc.paintCell(cc);
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true
},

//---------------------------------------------------------
// 盤面管理系
Board:{
	qcols : 8,
	qrows : 8,

	numberIsWhite : true,

	nummaxfunc : function(cc){
		return Math.max(this.qcols,this.qrows)-1;
	}
},

AreaManager:{
	checkWhiteCell : true
},

Menu:{
	menufix : function(){
		this.addUseToFlags();
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	setColors : function(){
		this.gridcolor = this.gridcolor_LIGHT;
		this.qsubcolor2 = this.bcolor_GREEN;
	},
	paint : function(){
		this.drawBGCells();
		this.drawDotCells(false);
		this.drawGrid();
		this.drawBlackCells();

		this.drawNumbers();

		this.drawChassis();

		this.drawTarget();
	},

	// オーバーライド drawBGCells用 (qsub==1は表示しない..)
	setBGCellColor : function(cc){
		var cell = bd.cell[cc];
		if     (cell.error===1){ g.fillStyle = this.errbcolor1; return true;}
		else if(cell.qsub ===2){ g.fillStyle = this.qsubcolor2; return true;}
		return false;
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
		this.decodeCellQanssub();
	},
	encodeData : function(){
		this.encodeCellQnum();
		this.encodeCellQanssub();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.checkSideCell(function(c1,c2){ return (bd.isBlack(c1) && bd.isBlack(c2));}) ){
			this.setAlert('黒マスがタテヨコに連続しています。','Black cells are adjacent.'); return false;
		}

		if( !this.checkOneArea( bd.areas.getWCellInfo() ) ){
			this.setAlert('白マスが分断されています。','White cells are devided.'); return false;
		}

		if( !this.checkCellNumber() ){
			this.setAlert('数字の数だけ離れたマスのうち、1マスだけ黒マスになっていません。','The number of black cells at aparted cell by the number is not one.'); return false;
		}

		return true;
	},

	checkCellNumber : function(){
		var result = true;

		for(var c=0;c<bd.cellmax;c++){
			if(!bd.isValidNum(c)){ continue;}
			var bx=bd.cell[c].bx, by=bd.cell[c].by, num=bd.QnC(c), clist=[];
			if(bd.isBlack(bd.cnum(bx-num*2,by))){ clist.push(bd.cnum(bx-num*2,by));}
			if(bd.isBlack(bd.cnum(bx+num*2,by))){ clist.push(bd.cnum(bx+num*2,by));}
			if(bd.isBlack(bd.cnum(bx,by-num*2))){ clist.push(bd.cnum(bx,by-num*2));}
			if(bd.isBlack(bd.cnum(bx,by+num*2))){ clist.push(bd.cnum(bx,by+num*2));}
			if(clist.length!==1){
				if(this.inAutoCheck){ return false;}
				bd.sErC([c],4);
				bd.sErC(clist,1);
				result = false;
			}
		}
		return result;
	}
}
};
