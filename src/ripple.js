//
// パズル固有スクリプト部 波及効果版 ripple.js v3.4.0
//
pzprv3.custom.ripple = {
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
	enablemake : true,
	enableplay : true
},

KeyPopup:{
	paneltype  : 10,
	enablemake : true,
	enableplay : true
},

//---------------------------------------------------------
// 盤面管理系
Board:{
	isborder : 1,

	nummaxfunc : function(cc){
		return this.areas.getCntOfRoomByCell(cc);
	}
},

AreaManager:{
	hasroom : true
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
	},

	decodeKanpen : function(){
		fio.decodeAreaRoom();
		fio.decodeCellQnum_kanpen();
	},
	encodeKanpen : function(){
		fio.encodeAreaRoom();
		fio.encodeCellQnum_kanpen();
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
	},

	kanpenOpen : function(){
		this.decodeAreaRoom();
		this.decodeCellQnum_kanpen();
		this.decodeCellAnum_kanpen();
	},
	kanpenSave : function(){
		this.encodeAreaRoom();
		this.encodeCellQnum_kanpen();
		this.encodeCellAnum_kanpen();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.checkDifferentNumberInRoom(bd.areas.getRoomInfo(), function(c){ return bd.getNum(c);}) ){
			this.setAlert('1つの部屋に同じ数字が複数入っています。','A room has two or more same numbers.'); return false;
		}

		if( !this.checkRippleNumber() ){
			this.setAlert('数字よりもその間隔が短いところがあります。','The gap of the same kind of number is smaller than the number.'); return false;
		}

		if( !this.checkNoNumCell() ){
			this.setAlert('数字の入っていないマスがあります。','There is an empty cell.'); return false;
		}

		return true;
	},
	check1st : function(){ return this.checkNoNumCell();},

	checkRippleNumber : function(){
		var result = true;
		for(var c=0;c<bd.cellmax;c++){
			var num=bd.getNum(c), bx=bd.cell[c].bx, by=bd.cell[c].by;
			if(num<=0){ continue;}
			for(var i=2;i<=num*2;i+=2){
				var tc = bd.cnum(bx+i,by);
				if(tc!==null && bd.getNum(tc)===num){
					if(this.inAutoCheck){ return false;}
					bd.sErC([c,tc],1);
					result = false;
				}
			}
			for(var i=2;i<=num*2;i+=2){
				var tc = bd.cnum(bx,by+i);
				if(tc!==null && bd.getNum(tc)===num){
					if(this.inAutoCheck){ return false;}
					bd.sErC([c,tc],1);
					result = false;
				}
			}
		}
		return result;
	}
}
};
