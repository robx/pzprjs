//
// パズル固有スクリプト部 たすくえあ版 tasquare.js v3.4.0
//
pzprv3.createCustoms('tasquare', {
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

AreaBlackManager:{
	enabled : true
},
AreaWhiteManager:{
	enabled : true
},

Flags:{
	use : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	hideHatena : true,

	setColors : function(){
		this.gridcolor = this.gridcolor_LIGHT;
		this.fontsizeratio = 0.85;
	},
	paint : function(){
		this.drawBGCells();
		this.drawDotCells(false);
		this.drawGrid();
		this.drawBlackCells();

		this.drawCellSquare();

		this.drawNumbers();

		this.drawChassis();

		this.drawTarget();
	},

	drawCellSquare : function(){
		var g = this.vinc('cell_square', 'crispEdges');

		var rw = this.bw*0.8-1;
		var rh = this.bh*0.8-1;
		var header = "c_sq_";

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i];
			if(cell.qnum!==-1){
				g.lineWidth = 1;
				g.strokeStyle = "black";
				g.fillStyle = (cell.error===1 ? this.errbcolor1 : "white");
				if(this.vnop(header+cell.id,this.FILL)){
					var px = cell.bx*this.bw, py = cell.by*this.bh;
					g.shapeRect(px-rw, py-rh, rw*2+1, rh*2+1);
				}
			}
			else{ this.vhide([header+cell.id]);}
		}
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		this.decodeNumber16();
	},
	pzlexport : function(type){
		this.encodeNumber16();
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCellQnumAns();
	},
	encodeData : function(){
		this.encodeCellQnumAns();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		var binfo = this.owner.board.getBCellInfo();
		if( !this.checkAreaSquare(binfo) ){ return 10016;}

		var winfo = this.owner.board.getWCellInfo();
		if( !this.checkOneArea(winfo) ){ return 10007;}

		if( !this.checkNumberSquare(binfo,true) ){ return 10022;}

		if( !this.checkNumberSquare(binfo,false) ){ return 10023;}

		return 0;
	},

	checkNumberSquare : function(binfo, flag){
		var result = true, bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c];
			if((flag?(cell.getQnum()<0):(cell.getQnum()!==-2))){ continue;}
			var clist=this.owner.newInstance('CellList');
			if(cell.up().isBlack()){ clist.addList(binfo.getclistbycell(cell.up()));}
			if(cell.dn().isBlack()){ clist.addList(binfo.getclistbycell(cell.dn()));}
			if(cell.lt().isBlack()){ clist.addList(binfo.getclistbycell(cell.lt()));}
			if(cell.rt().isBlack()){ clist.addList(binfo.getclistbycell(cell.rt()));}

			if(flag?(clist.length!==cell.getQnum()):(clist.length===0)){
				if(this.inAutoCheck){ return false;}
				clist.seterr(1);
				cell.seterr(1);
				result = false;
			}
		}
		return result;
	}
}
});
