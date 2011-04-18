//
// パズル固有スクリプト部 ウソタタミ版 usotatami.js v3.4.0
//
pzprv3.custom.usotatami = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mousedown : function(){
		if(k.editmode){ this.inputqnum();}
		else if(k.playmode){
			if     (this.btn.Left) { this.inputborderans();}
			else if(this.btn.Right){ this.inputQsubLine();}
		}
	},
	mousemove : function(){
		if(k.playmode){
			if     (this.btn.Left) { this.inputborderans();}
			else if(this.btn.Right){ this.inputQsubLine();}
		}
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
	qcols : 8,
	qrows : 8,

	isborder : 1
},

AreaManager:{
	hasroom : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	setColors : function(){
		this.gridcolor = this.gridcolor_DLIGHT;
		this.setBorderColorFunc('qans');
	},
	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();
		this.drawBorders();

		this.drawNumbers();
		this.drawBorderQsubs();

		this.drawChassis();

		this.drawTarget();
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		this.decodeNumber10();
	},
	pzlexport : function(type){
		this.encodeNumber10();
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCellQnum();
		this.decodeBorderAns();
	},
	encodeData : function(){
		this.encodeCellQnum();
		this.encodeBorderAns();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.checkLcntCross(4,0) ){
			this.setAlert('十字の交差点があります。','There is a crossing border line.'); return false;
		}

		var rinfo = bd.areas.getRoomInfo();
		if( !this.checkNoNumber(rinfo) ){
			this.setAlert('数字の入っていないタタミがあります。','A tatami has no numbers.'); return false;
		}

		if( !this.checkDoubleNumber(rinfo) ){
			this.setAlert('1つのタタミに2つ以上の数字が入っています。','A tatami has plural numbers.'); return false;
		}

		if( !this.checkAllArea(rinfo, function(w,h,a,n){ return (n<0||n!=a);}) ){
			this.setAlert('数字とタタミの大きさが同じです。','The size of the tatami and the number is the same.'); return false;
		}

		if( !this.checkLcntCross(1,0) ){
			this.setAlert('途切れている線があります。','There is a dead-end line.'); return false;
		}

		if( !this.checkAllArea(rinfo, function(w,h,a,n){ return (w==1||h==1);} ) ){
			this.setAlert('幅が１マスではないタタミがあります。','The width of the tatami is not one.'); return false;
		}

		return true;
	}
}
};
