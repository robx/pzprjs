//
// パズル固有スクリプト部 因子の部屋版 factors.js v3.4.1
//
pzpr.classmgr.makeCustom(['factors'], {
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
		if(this.owner.editmode){
			cell = this.owner.board.rooms.getTopOfRoomByCell(cell);
		}

		var max=cell.getmaxnum(), min=cell.getminnum();
		var num=(this.owner.editmode ? cell.qnum : cell.anum), val=-1;

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

	maxnum : function(){
		return this.owner.editmode?999999:Math.max(this.owner.board.qcols,this.owner.board.qrows);
	},

	setNum : function(val){
		if(val===0){ return;}
		if(this.owner.editmode){ this.setQnum(val);}else{ this.setAnum(val);}
	}
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
	gridcolor_type : "DLIGHT",

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

		var qnumoption = {
			ratio : [0.45, 0.45, 0.45, 0.45, 0.36, 0.30],
			position : this.TOPLEFT
		};
		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i], px = cell.bx*this.bw, py = cell.by*this.bh;

			g.vid = "cell_text_qans_"+cell.id;
			if(cell.anum!==-1){
				g.fillStyle = (cell.error===1 ? this.fontErrcolor : this.fontAnscolor);
				this.disptext(""+cell.anum, px, py);
			}
			else{ g.vhide();}

			g.vid = "cell_text_qnum_"+cell.id;
			if(cell.qnum!==-1){
				g.fillStyle = this.fontcolor;
				this.disptext(""+cell.qnum, px, py, qnumoption);
			}
			else{ g.vhide();}
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
		var rinfo = this.getRoomInfo();
		for(var id=1;id<=rinfo.max;id++){
			var room = rinfo.area[id], clist = room.clist;
			var product = clist.getProduct();
			if(product === 0){ continue;}

			if(product !== room.top.qnum){
				this.failcode.add("nmProduct");
				if(this.checkOnly){ break;}
				clist.seterr(1);
			}
		}
	}
},

FailCode:{
	nmProduct : ["ブロックの数字と数字の積が同じではありません。","A number of room is not equal to the product of these numbers."]
}
});
