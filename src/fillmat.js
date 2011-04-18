//
// パズル固有スクリプト部 フィルマット版 fillmat.js v3.4.0
//
pzprv3.custom.fillmat = {
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
	enablemake : true,
	generate : function(mode,type){
		this.inputcol('num','knum1','1','1');
		this.inputcol('num','knum2','2','2');
		this.inputcol('num','knum3','3','3');
		this.insertrow();
		this.inputcol('num','knum4','4','4');
		this.inputcol('num','knum_',' ',' ');
		this.inputcol('num','knum.','-','?');
		this.insertrow();
	}
},

//---------------------------------------------------------
// 盤面管理系
Board:{
	isborder : 1,

	maxnum : 4
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
		if( !this.checkSideAreaSize(rinfo, function(rinfo,r){ return rinfo.room[r].idlist.length;}) ){
			this.setAlert('隣り合うタタミの大きさが同じです。','The same size Tatami are adjacent.'); return false;
		}

		if( !this.checkAllArea(rinfo, function(w,h,a,n){ return (w==1||h==1)&&a<=4;}) ){
			this.setAlert('「幅１マス、長さ１～４マス」ではないタタミがあります。','The width of Tatami is over 1 or the length is over 4.'); return false;
		}

		if( !this.checkDoubleNumber(rinfo) ){
			this.setAlert('1つのタタミに2つ以上の数字が入っています。','A Tatami has two or more numbers.'); return false;
		}

		if( !this.checkNumberAndSize(rinfo) ){
			this.setAlert('数字とタタミの大きさが違います。','The size of Tatami and the number written in Tatami is different.'); return false;
		}

		if( !this.checkLcntCross(1,0) ){
			this.setAlert('途切れている線があります。','There is an dead-end border line.'); return false;
		}

		return true;
	}
}
};
