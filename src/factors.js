//
// パズル固有スクリプト部 因子の部屋版 factors.js v3.4.0
//
pzprv3.custom.factors = {
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
	enableplay : true,

	enablemake_p : true,
	enableplay_p : true,
	paneltype    : 10
},

//---------------------------------------------------------
// 盤面管理系
Board:{
	qcols : 9,
	qrows : 9,

	isborder : 1,

	disInputHatena : true,

	nummaxfunc : function(cc){
		return k.editmode?999999:Math.max(this.qcols,this.qrows);
	},
	setNum : function(c,val){
		if(val==0){ return;}
		if(k.editmode){ this.sQnC(c,val);}else{ this.sAnC(c,val);}
	}
},

AreaManager:{
	hasroom    : true,
	roomNumber : true
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

		this.drawNumbers_factors();

		this.drawBorders();

		this.drawChassis();

		this.drawCursor();
	},

	drawNumbers_factors : function(){
		var g = this.vinc('cell_number', 'auto');

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var c = clist[i], obj = bd.cell[c];
			var key_qans = ['cell',c,'qans'].join('_');
			var key_ques = ['cell',c,'ques'].join('_');

			if(bd.cell[c].anum!==-1){
				var color = (bd.cell[c].error==1?this.fontErrcolor:this.fontAnscolor);
				var size = (bd.cell[c].anum<10?0.8:0.7);
				this.dispnum(key_qans, 1, (""+bd.cell[c].anum), size, color, obj.cpx, obj.cpy);
			}
			else{ this.hideEL(key_qans);}

			if(bd.cell[c].qnum!==-1){
				var size = 0.45;
				if     (bd.cell[c].qnum>=100000){ size = 0.30;}
				else if(bd.cell[c].qnum>= 10000){ size = 0.36;}
				this.dispnum(key_ques, 5, (""+bd.cell[c].qnum), size, this.fontcolor, obj.cpx, obj.cpy);
			}
			else{ this.hideEL(key_ques);}
		}
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		this.decodeBorder();
		this.decodeRoomNumber16();
	},
	pzlexport : function(type){
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
	checkAns : function(){

		if( !this.checkRowsCols(this.isDifferentNumberInClist, function(c){ return bd.AnC(c);}) ){
			this.setAlert('同じ列に同じ数字が入っています。','There are same numbers in a row.'); return false;
		}

		if( !this.checkRoomNumber(bd.areas.getRoomInfo()) ){
			this.setAlert('ブロックの数字と数字の積が同じではありません。','A number of room is not equal to the product of these numbers.'); return false;
		}

		if( !this.checkAllCell(function(c){ return (bd.AnC(c)===-1);}) ){
			this.setAlert('数字の入っていないマスがあります。','There is a empty cell.'); return false;
		}

		return true;
	},
	check1st : function(){ return this.checkAllCell(function(c){ return (bd.AnC(c)===-1);});},

	checkRoomNumber : function(rinfo){
		var result = true;
		for(var id=1;id<=rinfo.max;id++){
			var product = 1;
			for(var i=0;i<rinfo.room[id].idlist.length;i++){
				if(bd.AnC(rinfo.room[id].idlist[i])>0){ product *= bd.AnC(rinfo.room[id].idlist[i]);}
				else{ product = 0;}
			}
			if(product==0){ continue;}

			if(product!=bd.QnC(bd.areas.rinfo.getTopOfRoom(id))){
				if(this.inAutoCheck){ return false;}
				bd.sErC(rinfo.room[id].idlist,1);
				result = false;
			}
		}
		return result;
	}
}
};
