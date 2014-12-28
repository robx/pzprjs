//
// パズル固有スクリプト部 波及効果・コージュン版 ripple.js v3.4.1
//
pzpr.classmgr.makeCustom(['ripple','cojun'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.owner.playmode){
			if(this.mousestart){ this.inputqnum();}
		}
		else if(this.owner.editmode){
			if(this.mousestart || (this.mousemove && this.btn.Left)){
				this.inputborder();
			}
			else if(this.mouseend && this.notInputted()){
				this.inputqnum();
			}
		}
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,
	enableplay : true
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	maxnum : function(){
		return this.owner.board.rooms.getCntOfRoomByCell(this);
	}
},
Board:{
	hasborder : 1
},
"Board@cojun":{
	qcols : 8,
	qrows : 8
},

AreaRoomManager:{
	enabled : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	gridcolor_type : "DLIGHT",

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
	decodePzpr : function(type){
		this.decodeBorder();
		this.decodeNumber16();
	},
	encodePzpr : function(type){
		this.encodeBorder();
		this.encodeNumber16();
	},

	decodeKanpen : function(){
		this.owner.fio.decodeAreaRoom();
		this.owner.fio.decodeCellQnum_kanpen();
	},
	encodeKanpen : function(){
		this.owner.fio.encodeAreaRoom();
		this.owner.fio.encodeCellQnum_kanpen();
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
	checklist : [
		["checkOtherNumberInRoom",  "bkDupNum"],
		["checkRippleNumber",       "nmSmallGap",   "ripple"],
		["checkAdjacentDiffNumber", "nmSameNum",    "cojun"],
		["checkUpperNumber",        "bkSmallOnBig", "cojun"],
		["checkNoNumCell",          "ceEmpty",      "", 1]
	],

	checkRippleNumber : function(){
		var result = true, bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			var cell=bd.cell[c], num=cell.getNum(), bx=cell.bx, by=cell.by;
			if(num<=0){ continue;}
			for(var i=2;i<=num*2;i+=2){
				var cell2 = bd.getc(bx+i,by);
				if(!cell2.isnull && cell2.getNum()===num){
					if(this.checkOnly){ return false;}
					cell.seterr(1);
					cell2.seterr(1);
					result = false;
				}
			}
			for(var i=2;i<=num*2;i+=2){
				var cell2 = bd.getc(bx,by+i);
				if(!cell2.isnull && cell2.getNum()===num){
					if(this.checkOnly){ return false;}
					cell.seterr(1);
					cell2.seterr(1);
					result = false;
				}
			}
		}
		return result;
	},

	checkUpperNumber : function(){
		var result = true, bd = this.owner.board;
		var rinfo = this.getRoomInfo();
		for(var c=0;c<bd.cellmax-bd.qcols;c++){
			var cell=bd.cell[c], cell2=cell.adjacent.bottom, dc=cell2.id;
			if(rinfo.id[c]!==rinfo.id[dc] || !cell.isNum() || !cell2.isNum()){ continue;}
			if(cell2.getNum()>cell.getNum()){
				if(this.checkOnly){ return false;}
				cell.seterr(1);
				cell2.seterr(1);
				result = false;
			}
		}
		return result;
	}
},

FailCode:{
	bkDupNum   : ["1つの部屋に同じ数字が複数入っています。","A room has two or more same numbers."],
	bkSmallOnBig : ["同じ部屋で上に小さい数字が乗っています。","There is an small number on big number in a room."],
	nmSmallGap : ["数字よりもその間隔が短いところがあります。","The gap of the same kind of number is smaller than the number."],
	ceEmpty : ["数字の入っていないマスがあります。","There is an empty cell."]
}
});
