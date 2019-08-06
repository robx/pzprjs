//
// パズル固有スクリプト部 因子の部屋版 factors.js
//
(function(pidlist, classbase){
	if(typeof module==='object' && module.exports){module.exports = [pidlist, classbase];}
	else{ pzpr.classmgr.makeCustom(pidlist, classbase);}
}(
['factors'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputModes : {edit:['border','number','clear'],play:['number','clear']},
	mouseinput_auto : function(){
		if(this.puzzle.playmode){
			if(this.mousestart){ this.inputqnum();}
		}
		else if(this.puzzle.editmode){
			if(this.mousestart || this.mousemove){
				if(this.btn==='left'){ this.inputborder();}
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
	disInputHatena : true,
	enableSubNumberArray : true,

	maxnum : function(){
		return this.puzzle.editmode?999999:Math.max(this.board.cols,this.board.rows);
	},

	setNum : function(val){
		if(val===0){ return;}
		if(this.puzzle.editmode){ this.setQnum(val);}else{ this.setAnum(val);}
		this.clrSnum();
	},
	getNum : function(){
		if(this.puzzle.editmode){ return this.qnum;}else{ return this.anum;}
	},
	isNum : function(){ return !this.isnull && (this.anum!==this.temp.anum);},
	noNum : function(){ return !this.isnull && (this.anum===this.temp.anum);}
},

CellList:{
	getProduct : function(){
		var product = 1;
		for(var i=0,len=this.length;i<len;i++){
			var num = this[i].anum;
			product *= (num>0 ? num : 0);
		}
		return product;
	}
},

Board:{
	cols : 9,
	rows : 9,

	hasborder : 1
},

AreaRoomGraph:{
	enabled : true,
	hastop : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	gridcolor_type : "DLIGHT",

	textoption : {ratio:0.45, position:5}, /* this.TOPLEFT */

	paint : function(){
		this.drawBGCells();
		this.drawTargetSubNumber();
		this.drawGrid();

		this.drawSubNumbers();
		this.drawAnsNumbers();
		this.drawQuesNumbers();

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
		this.decodeRoomNumber16();
	},
	encodePzpr : function(type){
		this.encodeBorder();
		this.encodeRoomNumber16();
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
	checklist : [
		"checkOtherAnsNumberInLine",
		"checkProductNumber",
		"checkNoAnumCell+"
	],

	checkOtherAnsNumberInLine : function(){
		this.checkRowsCols(this.isDifferentAnsNumberInClist, "nmDupRow");
	},
	checkNoAnumCell : function(){
		this.checkAllCell( function(cell){ return cell.anum===-1;}, "ceNoNum" );
	},

	checkProductNumber : function(){
		var rooms = this.board.roommgr.components;
		for(var r=0;r<rooms.length;r++){
			var room = rooms[r], clist = room.clist;
			var product = clist.getProduct();
			if(product === 0 || product === room.top.qnum){ continue;}

			this.failcode.add("nmProduct");
			if(this.checkOnly){ break;}
			clist.seterr(1);
		}
	}
},

FailCode:{
	nmProduct : ["ブロックの数字と数字の積が同じではありません。","A number of room is not equal to the product of these numbers."]
}
}));
