//
// パズル固有スクリプト部 ボーダーブロック版 bdblock.js v3.4.0
//
pzprv3.custom.bdblock = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputedit : function(){
		if     (this.mousestart){ this.inputcrossMark();}
		else if(this.mouseend && this.notInputted()){ this.inputqnum();}
	},
	inputplay : function(){
		if(this.mousestart || this.mousemove){
			if     (this.btn.Left) { this.inputborderans();}
			else if(this.btn.Right){ this.inputQsubLine();}
		}
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
	iscross  : 2,
	isborder : 1
},

AreaManager:{
	hasroom : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	setColors : function(){
		this.setBorderColorFunc('qans');
		this.gridcolor = this.gridcolor_DLIGHT;
		this.borderQanscolor = "black";
		this.crosssize = 0.15;
	},
	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();
		this.drawBorders();

		this.drawNumbers();
		this.drawCrossMarks();

		this.drawBorderQsubs();

		this.drawChassis();

		this.drawTarget();
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		this.decodeCrossMark();
		this.outbstr = this.outbstr.substr(1); // /を消しておく
		this.decodeNumber16();
	},
	pzlexport : function(type){
		this.encodeCrossMark();
		this.outbstr += "/";
		this.encodeNumber16();
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCellQnum();
		this.decodeCrossNum();
		this.decodeBorderAns();
	},
	encodeData : function(){
		this.encodeCellQnum();
		this.encodeCrossNum();
		this.encodeBorderAns();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.checkLcntCross(3,2) ){
			this.setAlert('黒点以外のところで線が分岐しています。','Lines are branched out of the black point.'); return false;
		}
		if( !this.checkLcntCross(4,2) ){
			this.setAlert('黒点以外のところで線が交差しています。','Lines are crossed out of the black point.'); return false;
		}

		var rinfo = bd.areas.getRoomInfo();
		if( !this.checkNoNumber(rinfo) ){
			this.setAlert('数字のないブロックがあります。','A block has no number.'); return false;
		}
		if( !this.checkSameObjectInRoom(rinfo, function(c){ return bd.getNum(c);}) ){
			this.setAlert('１つのブロックに異なる数字が入っています。','A block has dirrerent numbers.'); return false;
		}
		if( !this.checkGatheredObject(rinfo, function(c){ return bd.getNum(c);}) ){
			this.setAlert('同じ数字が異なるブロックに入っています。','One kind of numbers is included in dirrerent blocks.'); return false;
		}

		if( !this.checkLcntCross(1,0) ){
			this.setAlert('途中で途切れている線があります。','There is a dead-end line.'); return false;
		}
		if( !this.checkLcntCross(2,1) ){
			this.setAlert('線が３本以上出ていない黒点があります。','A black point has two or less lines.'); return false;
		}
		if( !this.checkLcntCross(0,1) ){
			this.setAlert('線が出ていない黒点があります。','A black point has no line.'); return false;
		}

		return true;
	}
}
};
