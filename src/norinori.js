//
// パズル固有スクリプト部 のりのり版 norinori.js v3.4.0
//
pzprv3.custom.norinori = {
//---------------------------------------------------------
// フラグ
Flags:{
	setting : function(pid){
		this.qcols = 10;
		this.qrows = 10;

		this.isborder = 1;

		this.hasroom         = true;
		this.BlackCell       = true;
		this.checkBlackCell  = true;

		this.floatbgcolor = "rgb(0, 127, 127)";
	}
},

//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mousedown : function(){
		if     (k.editmode){ this.inputborder();}
		else if(k.playmode){ this.inputcell();}
	},
	mousemove : function(){
		if     (k.editmode){ this.inputborder();}
		else if(k.playmode){ this.inputcell();}
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	keyinput : function(ca){ /* 空関数 */ }
},

//---------------------------------------------------------
// 盤面管理系
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
		this.bcolor = "rgb(96, 224, 160)";
		this.bbcolor = "rgb(96, 127, 127)";
		this.setBGCellColorFunc('qsub1');
	},
	paint : function(){
		this.drawBGCells();
		this.drawGrid();
		this.drawBlackCells();

		this.drawBorders();

		this.drawChassis();

		this.drawBoxBorders(false);
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		this.decodeBorder();
	},
	pzlexport : function(type){
		this.encodeBorder();
	},

	decodeKanpen : function(){
		fio.decodeAreaRoom();
	},
	encodeKanpen : function(){
		fio.encodeAreaRoom();
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeAreaRoom();
		this.decodeCellAns();
	},
	encodeData : function(){
		this.encodeAreaRoom();
		this.encodeCellAns();
	},

	kanpenOpen : function(){
		this.decodeAreaRoom();
		this.decodeCellAns();
	},
	kanpenSave : function(){
		this.encodeAreaRoom();
		this.encodeCellAns();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		var binfo = bd.areas.getBCellInfo();
		if( !this.checkAllArea(binfo, function(w,h,a,n){ return (a<=2);} ) ){
			this.setAlert('２マスより大きい黒マスのカタマリがあります。','The size of a mass of black cells is over two.'); return false;
		}

		var rinfo = bd.areas.getRoomInfo();
		if( !this.checkBlackCellInArea(rinfo, function(a){ return (a<=2);}) ){
			this.setAlert('２マス以上の黒マスがある部屋が存在します。','A room has three or mode black cells.'); return false;
		}

		if( !this.checkAllArea(binfo, function(w,h,a,n){ return (a>=2);} ) ){
			this.setAlert('１マスだけの黒マスのカタマリがあります。','There is a single black cell.'); return false;
		}

		if( !this.checkBlackCellInArea(rinfo, function(a){ return (a!=1);}) ){
			this.setAlert('１マスしか黒マスがない部屋があります。','A room has only one black cell.'); return false;
		}

		if( !this.checkBlackCellInArea(rinfo, function(a){ return (a>0);}) ){
			this.setAlert('黒マスがない部屋があります。','A room has no black cell.'); return false;
		}

		return true;
	}
}
};
