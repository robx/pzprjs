//
// パズル固有スクリプト部 ぬりかべ・ぬりぼう・モチコロ・モチにょろ版 nurikabe.js v3.4.1
//
pzpr.classmgr.makeCustom('nurikabe', {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.owner.playmode){
			if(this.mousestart || this.mousemove){ this.inputcell();}
		}
		else if(this.owner.editmode){
			if(this.mousestart){ this.inputqnum();}
		}
	}
},
"MouseEvent@nurikabe":{
	inputRed : function(){ this.dispRed();}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	numberIsWhite : true
},
Board:{
	getdir8WareaInfo : function(){
		var winfo = new this.owner.AreaInfo();
		for(var fc=0;fc<this.cellmax;fc++){ winfo.id[fc]=(this.cell[fc].isWhite()?0:null);}
		for(var fc=0;fc<this.cellmax;fc++){
			if(!winfo.emptyCell(this.cell[fc])){ continue;}
			winfo.addRoom();

			var stack=[this.cell[fc]];
			while(stack.length>0){
				var cell = stack.pop();
				if(!winfo.emptyCell(cell)){ continue;}
				winfo.addCell(cell);

				var bx=cell.bx, by=cell.by;
				var clist = this.cellinside(bx-2, by-2, bx+2, by+2);
				for(var i=0;i<clist.length;i++){
					if(winfo.emptyCell(clist[i])){ stack.push(clist[i]);}
				}
			}
		}
		return winfo;
	}
},

AreaBlackManager:{
	enabled : true
},
"AreaBlackManager@mochikoro":{
	enabled : false
},
AreaWhiteManager:{
	enabled : true
},

Flags:{
	use : true
},
"Flags@nurikabe":{
	use    : true,
	redblk : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	initialize : function(){
		this.Common.prototype.initialize.call(this);

		if(this.owner.pid!=='nurikabe'){
			this.bcolor = this.bcolor_GREEN;
			this.setBGCellColorFunc('qsub1');
		}
	},
	paint : function(){
		this.drawBGCells();
		if(this.owner.pid==='nurikabe'){ this.drawDotCells(false);}
		this.drawGrid();
		this.drawBlackCells();

		this.drawNumbers();

		this.drawChassis();

		this.drawTarget();
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
		if(this.owner.pid==='nurikabe'){
			this.decodeCellQnumAns();
		}
		else{
			this.decodeCellQnum();
			this.decodeCellAns();
		}
	},
	encodeData : function(){
		if(this.owner.pid==='nurikabe'){
			this.encodeCellQnumAns();
		}
		else{
			this.encodeCellQnum();
			this.encodeCellAns();
		}
	},

	kanpenOpen : function(){
		this.decodeCellQnumAns_kanpen();
	},
	kanpenSave : function(){
		this.encodeCellQnumAns_kanpen();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
"AnsCheck@nurikabe":{
	checkAns : function(){
		var bd=this.owner.board;

		if( !this.check2x2BlackCell() ){ return 'bc2x2';}

		var winfo = bd.getWCellInfo();
		if( !this.checkNoNumber(winfo) ){ return 'bkNoNum';}
		var binfo = bd.getBCellInfo();
		if( !this.checkOneArea(binfo) ){ return 'bcDivide';}
		if( !this.checkDoubleNumber(winfo) ){ return 'bkNumGe2';}
		if( !this.checkNumberAndSize(winfo) ){ return 'bkSizeNe';}

		return null;
	}
},
"AnsCheck@nuribou":{
	checkAns : function(){
		var bd=this.owner.board;

		var binfo = bd.getBCellInfo();
		if( !this.checkBou(binfo) ){ return 'bcWidthGt1';}
		if( !this.checkCorners(binfo) ){ return 'bcCornerSize';}

		var winfo = bd.getWCellInfo();
		if( !this.checkNoNumber(winfo) ){ return 'bkNoNum';}
		if( !this.checkDoubleNumber(winfo) ){ return 'bkNumGe2';}
		if( !this.checkNumberAndSize(winfo) ){ return 'bkSizeNe';}

		return null;
	},

	checkBou : function(binfo){
		return this.checkAllArea(binfo, function(w,h,a,n){ return (w==1||h==1);});
	},
	checkCorners : function(binfo){
		var result = true, bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c];
			if(cell.bx===bd.maxbx-1 || cell.by===bd.maxby-1){ continue;}

			var cell1, cell2;
			if     ( cell.isBlack() && cell.rt().dn().isBlack() ){ cell1 = cell; cell2 = cell.rt().dn();}
			else if( cell.rt().isBlack() && cell.dn().isBlack() ){ cell1 = cell.rt(); cell2 = cell.dn();}
			else{ continue;}

			if(binfo.getclistbycell(cell1).length == binfo.getclistbycell(cell2).length){
				if(this.checkOnly){ return false;}
				binfo.getclistbycell(cell1).seterr(1);
				binfo.getclistbycell(cell2).seterr(1);
				result = false;
			}
		}
		return result;
	}
},
"AnsCheck@mochikoro,mochinyoro":{
	checkAns : function(){
		var bd=this.owner.board;

		if( !this.check2x2BlackCell() ){ return 'bc2x2';}
		if( !this.checkOneArea( bd.getdir8WareaInfo() ) ){ return 'bcDivide8';}

		var winfo = bd.getWCellInfo();
		if( !this.checkAreaRect(winfo) ){ return 'wcNotRect';}
		if( !this.checkDoubleNumber(winfo) ){ return 'bkNumGe2';}
		if( !this.checkNumberAndSize(winfo) ){ return 'bkSizeNe';}

		if(this.owner.pid==='mochinyoro'){
			var binfo = bd.getBCellInfo();
			if( !this.checkAreaNotRect(binfo) ){ return 'bcRect';}
		}

		return null;
	},

	checkAreaNotRect : function(binfo){
		return this.checkAllArea(binfo, function(w,h,a,n){ return (w*h!==a);});
	}
},

FailCode:{
	bkNoNum  : ["数字の入っていないシマがあります。","An area of white cells has no numbers."],
	bkNumGe2 : ["1つのシマに2つ以上の数字が入っています。","An area of white cells has plural numbers."],
	bkSizeNe : ["数字とシマの面積が違います。","The number is not equal to the number of the size of the area."]
},
"FailCode@nuribou":{
	bcWidthGt1   : ["「幅１マス、長さ１マス以上」ではない黒マスのカタマリがあります。","there is a mass of black cells, whose width is more than two."],
	bcCornerSize : ["同じ面積の黒マスのカタマリが、角を共有しています。","Masses of black cells whose length is the same share a corner."]
},

"FailCode@mochikoro,mochinyoro":{
	wcNotRect : ["四角形でない白マスのブロックがあります。","There is a block of white cells that is not rectangle."],
	bcRect    : ["四角形になっている黒マスのブロックがあります。","There is a block of black cells that is rectangle."],
	bcDivide8 : ["孤立した白マスのブロックがあります。","White cells are devided."]
}
});
