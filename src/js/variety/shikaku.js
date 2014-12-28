//
// パズル固有スクリプト部 四角に切れ・アホになり切れ版 shikaku.js v3.4.1
//
pzpr.classmgr.makeCustom(['shikaku','aho'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.owner.playmode){
			if(this.mousestart || this.mousemove){
				if(this.btn.Left && this.isBorderMode()){ this.inputborder();}
				else{ this.inputQsubLine();}
			}
		}
		else if(this.owner.editmode){
			if(this.mousestart){ this.inputqnum();}
		}
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
	hasborder : 1
},

AreaRoomManager:{
	enabled : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	hideHatena : true,

	gridcolor_type : "DLIGHT",

	bordercolor_func : "qans",

	fontcolor    : "white",
	fontErrcolor : "white",

	globalfontsizeratio : 0.85,
	circleratio : [0.40, 0.40],

	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();
		this.drawBorders();

		this.drawCircles();
		this.drawNumbers();
		this.drawBorderQsubs();

		this.drawChassis();

		this.drawTarget();
	},

	/* 黒丸を描画する */
	circlestrokecolor_func : "null",
	getCircleFillColor : function(cell){
		if(cell.qnum!==-1){
			return (cell.error===1 ? this.errcolor1 : this.quescolor);
		}
		return null;
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodeNumber16();
	},
	encodePzpr : function(type){
		this.encodeNumber16();
	},

	decodeKanpen : function(){
		this.owner.fio.decodeCellQnum_kanpen();
	},
	encodeKanpen : function(){
		this.owner.fio.encodeCellQnum_kanpen();
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
	},

	kanpenOpen : function(){
		this.decodeCellQnum_kanpen();
		this.decodeAnsSquareRoom();
	},
	kanpenSave : function(){
		this.encodeCellQnum_kanpen();
		this.encodeAnsSquareRoom();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checklist : [
		["checkNoNumber",      "bkNoNum"],
		["checkDoubleNumber",  "bkNumGe2"],
		["checkRoomRect",      "bkNotRect",    "shikaku"],
		["checkAhoSquare",     "bkNotRect3",   "aho"],
		["checkLshapeArea",    "bkNotLshape3", "aho"],
		["checkNumberAndSize", "bkSizeNe"],
		["checkBorderDeadend", "bdDeadEnd", "", 1]
	],

	checkAhoSquare : function(){
		return this.checkAllArea(this.getRoomInfo(), function(w,h,a,n){ return (n<0 || (n%3)===0 || w*h===a);});
	},
	checkLshapeArea : function(){
		var result = true;
		var rinfo = this.getRoomInfo();
		for(var r=1;r<=rinfo.max;r++){
			var clist = rinfo.area[r].clist;
			var cell = clist.getQnumCell();
			if(cell.isnull){ continue;}

			var n = cell.qnum;
			if(n<0 || (n%3)!==0){ continue;}
			var d = clist.getRectSize();

			var clist2 = this.owner.board.cellinside(d.x1,d.y1,d.x2,d.y2).filter(function(cell){ return (rinfo.getRoomID(cell)!==r);});
			var d2 = clist2.getRectSize();

			if( clist2.length===0 || (d2.cols*d2.rows!==d2.cnt) || (d.x1!==d2.x1 && d.x2!==d2.x2) || (d.y1!==d2.y1 && d.y2!==d2.y2) ){
				if(this.checkOnly){ return false;}
				clist.seterr(1);
				result = false;
			}
		}
		return result;
	}
},

FailCode:{
	bkNoNum  : ["数字の入っていない領域があります。","An area has no numbers."],
	bkNumGe2 : ["1つの領域に2つ以上の数字が入っています。","An area has plural numbers."],
	bkSizeNe : ["数字と領域の大きさが違います。","The size of the area is not equal to the number."],
	bkNotRect : ["四角形ではない領域があります。","An area is not rectangle."],
	bkNotRect3 : ["大きさが3の倍数ではないのに四角形ではない領域があります。","An area whose size is not multiples of three is not rectangle."],
	bkNotLshape3 : ["大きさが3の倍数である領域がL字型になっていません。","An area whose size is multiples of three is not L-shape."]
}
});
