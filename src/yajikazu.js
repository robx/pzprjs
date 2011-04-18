//
// パズル固有スクリプト部 やじさんかずさん版 yajikazu.js v3.4.0
//
pzprv3.custom.yajikazu = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	RBBlackCell : true,

	mousedown : function(){
		if(kc.isZ ^ pp.getVal('dispred')){ this.dispRed();}
		else if(k.editmode){ this.inputdirec();}
		else if(k.playmode){ this.inputcell();}
	},
	mouseup : function(){
		if(k.editmode && this.notInputted()){
			if(bd.cnum(this.prevPos.x,this.prevPos.y)===this.cellid()){ this.inputqnum();}
		}
	},
	mousemove : function(){
		if(k.editmode){
			if(this.notInputted()){ this.inputdirec();}
		}
		else if(k.playmode){ this.inputcell();}
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,
	enableplay : true,
	moveTarget : function(ca){
		if(this.isSHIFT){ return false;}
		return this.moveTCell(ca);
	},

	keyinput : function(ca){
		if(this.key_inputdirec(ca)){ return;}
		this.key_inputqnum(ca);
	}
},

//---------------------------------------------------------
// 盤面管理系
Board:{
	numzero : true
},

AreaManager:{
	checkWhiteCell : true
},

MenuExec:{
	adjustBoardData : function(key,d){
		this.adjustNumberArrow(key,d);
	}
},

Menu:{
	menufix : function(){
		this.addUseToFlags();
		this.addRedLineToFlags();
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	setColors : function(){
		this.gridcolor = this.gridcolor_LIGHT;
		this.bcolor = this.bcolor_GREEN;
		this.fontBCellcolor = "rgb(96,96,96)";
		this.setBGCellColorFunc('qsub1');
	},
	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();
		this.drawBlackCells();

		this.drawArrowNumbers();

		this.drawChassis();

		this.drawTarget();
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		this.decodeArrowNumber16();
	},
	pzlexport : function(type){
		this.encodeArrowNumber16();
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCellDirecQnum();
		this.decodeCellAns();
	},
	encodeData : function(){
		this.encodeCellDirecQnum();
		this.encodeCellAns();
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

		if( !this.checkArrowNumber() ){
			this.setAlert('矢印の方向にある黒マスの数が正しくありません。','The number of black cells are not correct.'); return false;
		}

		return true;
	},

	checkArrowNumber : function(){
		var result = true;
		for(var c=0;c<bd.cellmax;c++){
			if(!bd.isValidNum(c) || bd.DiC(c)==0 || bd.isBlack(c)){ continue;}
			var bx = bd.cell[c].bx, by = bd.cell[c].by, dir = bd.DiC(c);
			var cnt=0, clist = [];
			if     (dir==k.UP){ by-=2; while(by>bd.minby){ clist.push(bd.cnum(bx,by)); by-=2;} }
			else if(dir==k.DN){ by+=2; while(by<bd.maxby){ clist.push(bd.cnum(bx,by)); by+=2;} }
			else if(dir==k.LT){ bx-=2; while(bx>bd.minbx){ clist.push(bd.cnum(bx,by)); bx-=2;} }
			else if(dir==k.RT){ bx+=2; while(bx<bd.maxbx){ clist.push(bd.cnum(bx,by)); bx+=2;} }

			for(var i=0;i<clist.length;i++){ if(bd.isBlack(clist[i])){ cnt++;} }

			if(bd.QnC(c)!=cnt){
				if(this.inAutoCheck){ return false;}
				bd.sErC([c],1);
				bd.sErC(clist,1);
				result = false;
			}
		}
		return result;
	}
}
};
