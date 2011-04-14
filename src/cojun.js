//
// パズル固有スクリプト部 コージュン版 cojun.js v3.4.0
//
pzprv3.custom.cojun = {
//---------------------------------------------------------
// フラグ
Flags:{
	setting : function(pid){
		this.qcols = 8;
		this.qrows = 8;

		this.isborder = 1;

		this.hasroom         = true;
		this.isDispHatena    = true;
		this.isInputHatena   = true;
		this.isAnsNumber     = true;

		this.floatbgcolor = "rgb(64, 64, 64)";
	}
},

//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mousedown : function(){
		if(k.editmode){ this.inputborder();}
		if(k.playmode){ this.inputqnum();}
	},
	mouseup : function(){
		if(this.notInputted()){
			if(k.editmode){ this.inputqnum();}
		}
	},
	mousemove : function(){
		if(k.editmode && this.btn.Left){ this.inputborder();}
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	keyinput : function(ca){
		if(this.moveTCell(ca)){ return;}
		this.key_inputqnum(ca);
	}
},

KeyPopup:{
	paneltype  : 10,
	enablemake : true,
	enableplay : true
},

//---------------------------------------------------------
// 盤面管理系
Board:{
	nummaxfunc : function(cc){
		return this.areas.getCntOfRoomByCell(cc);
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	setColors : function(){
		this.gridcolor = this.gridcolor_DLIGHT;
	},
	paint : function(){
		this.drawBGCells();
		this.drawGrid();

		this.drawNumbers();

		this.drawBorders();

		this.drawChassis();

		this.drawCursor();
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		this.decodeBorder();
		this.decodeNumber16();
	},
	pzlexport : function(type){
		this.encodeBorder();
		this.encodeNumber16();
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeBorderQues();
		this.decodeCellQnum();
		this.decodeCellAnumsub();
	},
	encodeData : function(){
		this.encodeBorderQues();
		this.encodeCellQnum();
		this.encodeCellAnumsub();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		var rinfo = bd.areas.getRoomInfo();
		if( !this.checkDifferentNumberInRoom(rinfo, function(c){ return bd.getNum(c);}) ){
			this.setAlert('1つの部屋に同じ数字が複数入っています。','A room has two or more same numbers.'); return false;
		}

		if( !this.checkSideCell(function(c1,c2){ return bd.sameNumber(c1,c2);}) ){
			this.setAlert('同じ数字がタテヨコに連続しています。','Same numbers are adjacent.'); return false;
		}

		if( !this.checkUpperNumber(rinfo) ){
			this.setAlert('同じ部屋で上に小さい数字が乗っています。','There is an small number on big number in a room.'); return false;
		}

		if( !this.checkNoNumCell() ){
			this.setAlert('数字の入っていないマスがあります。','There is a empty cell.'); return false;
		}

		return true;
	},
	check1st : function(){ return this.checkNoNumCell();},

	checkUpperNumber : function(rinfo){
		var result = true;
		for(var c=0;c<bd.cellmax-k.qcols;c++){
			var dc = bd.dn(c);
			if(rinfo.id[c]!=rinfo.id[dc] || !bd.isNum(c) || !bd.isNum(dc)){ continue;}
			if(bd.getNum(dc)>bd.getNum(c)){
				if(this.inAutoCheck){ return false;}
				bd.sErC([c,dc],1);
				result = false;
			}
		}
		return result;
	}
}
};
