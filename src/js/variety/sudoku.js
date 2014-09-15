//
// パズル固有スクリプト部 数独版 sudoku.js v3.4.1
//
pzpr.classmgr.makeCustom(['sudoku'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.mousestart){ this.inputqnum();}
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
	nummaxfunc : function(){
		return Math.max(this.owner.board.qcols,this.owner.board.qrows);
	}
},
Board:{
	qcols : 9,
	qrows : 9
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	paint : function(){
		this.drawBGCells();
		this.drawGrid();
		this.drawBlockBorders();

		this.drawNumbers();

		this.drawChassis();

		this.drawCursor();
	},

	drawBlockBorders : function(){
		var g = this.vinc('border_block', 'crispEdges'), bd = this.owner.board;

		var lw = this.lw, lm = this.lm;

		var max=bd.qcols;
		var block=((Math.sqrt(max)+0.1)|0);
		var headers = ["bbx_", "bby_"];

		var x1=this.range.x1, y1=this.range.y1, x2=this.range.x2, y2=this.range.y2;
		if(x1<bd.minbx){ x1=bd.minbx;} if(x2>bd.maxbx){ x2=bd.maxbx;}
		if(y1<bd.minby){ y1=bd.minby;} if(y2>bd.maxby){ y2=bd.maxby;}

		g.fillStyle = "black";
		for(var i=1;i<block;i++){
			if(x1-1<=i*block&&i*block<=x2+1){ if(this.vnop(headers[0]+i,this.NONE)){
				g.fillRect(i*block*this.cw-lw+0.5, y1*this.bh-lw+0.5, lw, (y2-y1)*this.bh+2*lw-1);
			}}
		}
		for(var i=1;i<block;i++){
			if(y1-1<=i*block&&i*block<=y2+1){ if(this.vnop(headers[1]+i,this.NONE)){
				g.fillRect(x1*this.bw-lw+0.5, i*block*this.ch-lw+0.5, (x2-x1)*this.bw+2*lw-1, lw);
			}}
		}
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
		this.decodeCellAnumsub();
	},
	encodeData : function(){
		this.encodeCellQnum();
		this.encodeCellAnumsub();
	},

	kanpenOpen : function(){
		this.decodeCellQnum_kanpen();
		this.decodeCellAnum_kanpen();
	},
	kanpenSave : function(){
		this.encodeCellQnum_kanpen();
		this.encodeCellAnum_kanpen();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.checkRoomNumber() ){ return 'bkDupNum';}
		if( !this.checkRowsColsSameNumber() ){ return 'nmDupRow';}
		if( !this.checkNoNumCell() ){ return 'ceEmpty';}

		return null;
	},
	check1st : function(){
		return (this.checkNoNumCell() ? null : 'ceEmpty');
	},

	checkRowsColsSameNumber : function(){
		return this.checkRowsCols(this.isDifferentNumberInClist, function(cell){ return cell.getNum();});
	},

	checkRoomNumber : function(){
		var result = true, bd = this.owner.board;
		var max=bd.qcols;
		var blk=((Math.sqrt(max)+0.1)|0);
		for(var i=0;i<max;i++){
			var clist = bd.cellinside(((i%blk)*blk)*2+1, (((i/blk)|0)*blk)*2+1, ((i%blk+1)*blk-1)*2+1, (((i/blk+1)|0)*blk-1)*2+1);
			if(!this.isDifferentNumberInClist(clist, function(cell){ return cell.getNum();})){
				if(this.checkOnly){ return false;}
				result = false;
			}
		}
		return result;
	}
},

FailCode:{
	ceEmpty : ["数字の入っていないマスがあります。","There is an empty cell."]
}
});
