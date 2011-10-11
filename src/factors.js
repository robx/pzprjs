//
// パズル固有スクリプト部 因子の部屋版 factors.js v3.4.0
//
pzprv3.custom.factors = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputedit : function(){
		if(this.mousestart || this.mousemove){
			if(this.btn.Left){ this.inputborder();}
		}
		else if(this.mouseend && this.notInputted()){
			this.inputqnum();
		}
	},
	inputplay : function(){
		if(this.mousestart){ this.inputqnum();}
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
Cell:{
	disInputHatena : true,

	nummaxfunc : function(){
		return this.owner.editmode?999999:Math.max(bd.qcols,bd.qrows);
	},

	setNum : function(val){
		if(val===0){ return;}
		if(this.owner.editmode){ this.setQnum(val);}else{ this.setAnum(val);}
	}
},

Board:{
	qcols : 9,
	qrows : 9,

	isborder : 1
},

AreaManager:{
	hasroom    : true
},

AreaRoomData:{
	hastop : true
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
			var cell = clist[i];
			var key_qans = ['cell',cell.id,'qans'].join('_');
			var key_ques = ['cell',cell.id,'ques'].join('_');
			var px = cell.bx*this.bw, py = cell.by*this.bh;

			if(cell.anum!==-1){
				var color = (cell.error==1?this.fontErrcolor:this.fontAnscolor);
				var size = (cell.anum<10?0.8:0.7);
				this.dispnum(key_qans, 1, (""+cell.anum), size, color, px, py);
			}
			else{ this.hideEL(key_qans);}

			if(cell.qnum!==-1){
				var size = 0.45;
				if     (cell.qnum>=100000){ size = 0.30;}
				else if(cell.qnum>= 10000){ size = 0.36;}
				this.dispnum(key_ques, 5, (""+cell.qnum), size, this.fontcolor, px, py);
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

		if( !this.checkRowsCols(this.isDifferentNumberInClist, function(cell){ return cell.getAnum();}) ){
			this.setAlert('同じ列に同じ数字が入っています。','There are same numbers in a row.'); return false;
		}

		if( !this.checkRoomNumber(bd.areas.getRoomInfo()) ){
			this.setAlert('ブロックの数字と数字の積が同じではありません。','A number of room is not equal to the product of these numbers.'); return false;
		}

		if( !this.checkAllCell(function(cell){ return (cell.getAnum()===-1);}) ){
			this.setAlert('数字の入っていないマスがあります。','There is a empty cell.'); return false;
		}

		return true;
	},
	check1st : function(){ return this.checkAllCell(function(cell){ return (cell.getAnum()===-1);});},

	checkRoomNumber : function(rinfo){
		var result = true;
		for(var id=1;id<=rinfo.max;id++){
			var product = 1, clist = rinfo.getclist(id);
			for(var i=0;i<clist.length;i++){
				var cell = clist[i];
				if(cell.getAnum()>0){ product *= cell.getAnum();}
				else{ product = 0;}
			}
			if(product==0){ continue;}

			var cell = bd.areas.rinfo.getTopOfRoom(id);
			if(product!=cell.getQnum()){
				if(this.inAutoCheck){ return false;}
				clist.seterr(1);
				result = false;
			}
		}
		return result;
	}
}
};
