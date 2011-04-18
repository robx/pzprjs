//
// パズル固有スクリプト部 ぬりかべ版 nurikabe.js v3.4.0
//
pzprv3.custom.nurikabe = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
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
	enablemake : true
},

KeyPopup:{
	paneltype  : 10,
	enablemake : true
},

//---------------------------------------------------------
// 盤面管理系
Board:{
	numberIsWhite : true
},

AreaManager:{
	checkBlackCell : true,
	checkWhiteCell : true
},

Menu:{
	menufix : function(){
		this.addUseToFlags();
		this.addRedBlockToFlags();
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	paint : function(){
		this.drawBGCells();
		this.drawDotCells(false);
		this.drawGrid();
		this.drawBlackCells();

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
		this.decodeCellQnumAns();
	},
	encodeData : function(){
		this.encodeCellQnumAns();
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

		if( !this.check2x2Block( function(c){ return bd.isBlack(c);} ) ){
			this.setAlert('2x2の黒マスのかたまりがあります。','There is a 2x2 block of black cells.'); return false;
		}

		var winfo = bd.areas.getWCellInfo();
		if( !this.checkNoNumber(winfo) ){
			this.setAlert('数字の入っていないシマがあります。','An area of white cells has no numbers.'); return false;
		}

		if( !this.checkOneArea( bd.areas.getBCellInfo() ) ){
			this.setAlert('黒マスが分断されています。','Black cells are devided,'); return false;
		}

		if( !this.checkDoubleNumber(winfo) ){
			this.setAlert('1つのシマに2つ以上の数字が入っています。','An area of white cells has plural numbers.'); return false;
		}

		if( !this.checkNumberAndSize(winfo) ){
			this.setAlert('数字とシマの面積が違います。','The number is not equal to the number of the size of the area.'); return false;
		}

		return true;
	}
}
};
