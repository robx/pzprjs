//
// パズル固有スクリプト部 ぬりかべ・ぬりぼう・モチコロ・モチにょろ版 nurikabe.js v3.4.0
//
pzprv3.createCustoms('nurikabe', {
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
	numberIsWhite : true,
},
Board:{
	getdir8WareaInfo : function(){
		var winfo = this.owner.newInstance('AreaCellInfo');
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
	setColors : function(){
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

		if( !this.check2x2BlackCell() ){ return 10001;}

		var winfo = bd.getWCellInfo();
		if( !this.checkNoNumber(winfo) ){ return 10014;}
		var binfo = bd.getBCellInfo();
		if( !this.checkOneArea(binfo) ){ return 10005;}
		if( !this.checkDoubleNumber(winfo) ){ return 30009;}
		if( !this.checkNumberAndSize(winfo) ){ return 30019;}

		return 0;
	}
},
"AnsCheck@nuribou":{
	checkAns : function(){
		var bd=this.owner.board;

		var binfo = bd.getBCellInfo();
		if( !this.checkBou(binfo) ){ return 10004;}
		if( !this.checkCorners(binfo) ){ return 10005;}

		var winfo = bd.getWCellInfo();
		if( !this.checkNoNumber(winfo) ){ return 10014;}
		if( !this.checkDoubleNumber(winfo) ){ return 30009;}
		if( !this.checkNumberAndSize(winfo) ){ return 30019;}

		return 0;
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
				if(this.inAutoCheck){ return false;}
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

		if( !this.check2x2BlackCell() ){ return 10001;}
		if( !this.checkOneArea( bd.getdir8WareaInfo() ) ){ return 10008;}

		var winfo = bd.getWCellInfo();
		if( !this.checkAreaRect(winfo) ){ return 10012;}
		if( !this.checkDoubleNumber(winfo) ){ return 30010;}
		if( !this.checkNumberAndSize(winfo) ){ return 30020;}

		if(this.owner.pid==='mochinyoro'){
			var binfo = bd.getBCellInfo();
			if( !this.checkAreaNotRect(binfo) ){ return 10013;}
		}

		return 0;
	},

	checkAreaNotRect : function(binfo){
		return this.checkAllArea(binfo, function(w,h,a,n){ return (w*h!==a);});
	}
}
});
