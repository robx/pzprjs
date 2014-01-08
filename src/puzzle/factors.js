//
// パズル固有スクリプト部 因子の部屋版 factors.js v3.4.0
//
pzpr.createCustoms('factors', {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.owner.playmode){
			if(this.mousestart){ this.inputqnum();}
		}
		else if(this.owner.editmode){
			if(this.mousestart || this.mousemove){
				if(this.btn.Left){ this.inputborder();}
			}
			else if(this.mouseend && this.notInputted()){
				this.inputqnum();
			}
		}
	},

	inputqnum_main : function(cell){
		var max=cell.nummaxfunc(), min=cell.numminfunc();
		var num=(this.owner.editmode ? cell.getQnum() : cell.getAnum()), val=-1;

		// playmode: subtypeは0以上、 qsにqsub値が入る
		// editmode: subtypeは-1固定、qsは常に0が入る
		if(this.btn.Left){
			if     (num>=max){ val = -1;}
			else if(num===-1){ val = 1;}
			else{ val = num+1;}
		}
		else if(this.btn.Right){
			if     (num===-1){ val = max;}
			else if(num<=min){ val = -1;}
			else{ val = num-1;}
		}
		cell.setNum(val);

		cell.draw();
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

	nummaxfunc : function(){
		return this.owner.editmode?999999:Math.max(this.owner.board.qcols,this.owner.board.qrows);
	},

	setNum : function(val){
		if(val===0){ return;}
		if(this.owner.editmode){ this.setQnum(val);}else{ this.setAnum(val);}
	}
},

Board:{
	qcols : 9,
	qrows : 9,

	hasborder : 1
},

AreaRoomManager:{
	enabled : true,
	hastop : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	initialize : function(){
		this.Common.prototype.initialize.call(this);

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
			else{ this.hidenum(key_qans);}

			if(cell.qnum!==-1){
				var size = 0.45;
				if     (cell.qnum>=100000){ size = 0.30;}
				else if(cell.qnum>= 10000){ size = 0.36;}
				this.dispnum(key_ques, 5, (""+cell.qnum), size, this.fontcolor, px, py);
			}
			else{ this.hidenum(key_ques);}
		}
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
	checkAns : function(){

		if( !this.checkRowsColsSameAnsNumber() ){ return 'nmDupRow';}

		var rinfo = this.owner.board.getRoomInfo();
		if( !this.checkRoomNumber(rinfo) ){ return 'nmProduct';}

		if( !this.checkNoNumCell() ){ return 'ceEmpty';}

		return null;
	},
	check1st : function(){
		return (this.checkNoNumCell() ? null : 'ceEmpty');
	},

	checkRowsColsSameAnsNumber : function(){
		return this.checkRowsCols(this.isDifferentNumberInClist, function(cell){ return cell.getAnum();});
	},

	checkRoomNumber : function(rinfo){
		var result = true;
		for(var id=1;id<=rinfo.max;id++){
			var product = 1, clist = rinfo.room[id].clist;
			for(var i=0;i<clist.length;i++){
				var cell = clist[i];
				if(cell.getAnum()>0){ product *= cell.getAnum();}
				else{ product = 0;}
			}
			if(product==0){ continue;}

			var cell = this.owner.board.rooms.getTopOfRoom(id);
			if(product!=cell.getQnum()){
				if(this.checkOnly){ return false;}
				clist.seterr(1);
				result = false;
			}
		}
		return result;
	}
},

FailCode:{
	nmProduct : ["ブロックの数字と数字の積が同じではありません。","A number of room is not equal to the product of these numbers."],
	ceEmpty : ["数字の入っていないマスがあります。","There is an empty cell."]
}
});
