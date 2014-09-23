//
// パズル固有スクリプト部 たすくえあ版 tasquare.js v3.4.1
//
pzpr.classmgr.makeCustom(['tasquare'], {
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
	numberRemainsUnshaded : true
},

AreaShadeManager:{
	enabled : true
},
AreaUnshadeManager:{
	enabled : true
},

Flags:{
	use : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	hideHatena : true,

	gridcolor_type : "LIGHT",
	globalfontsizeratio : 0.85,

	paint : function(){
		this.drawBGCells();
		this.drawDotCells(false);
		this.drawGrid();
		this.drawShadedCells();

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
					g.shapeRectCenter(px, py, rw, rh);
				}
			}
			else{ g.vhide(header+cell.id);}
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

		var binfo = this.owner.board.getShadeInfo();
		if( !this.checkAreaSquare(binfo) ){ return 'csNotSquare';}

		var winfo = this.owner.board.getUnshadeInfo();
		if( !this.checkOneArea(winfo) ){ return 'cuDivide';}

		if( !this.checkNumberSquare(binfo,true) ){ return 'ceSumSizeNe';}

		if( !this.checkNumberSquare(binfo,false) ){ return 'ceNoShade';}

		return null;
	},

	checkNumberSquare : function(binfo, flag){
		var result = true, bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c];
			if((flag?(cell.qnum<0):(cell.qnum!==-2))){ continue;}
			var clist=new this.owner.CellList(), adc=cell.adjacent;
			if(adc.top.isShade()   ){ clist.extend(binfo.getRoomByCell(adc.top   ).clist);}
			if(adc.bottom.isShade()){ clist.extend(binfo.getRoomByCell(adc.bottom).clist);}
			if(adc.left.isShade()  ){ clist.extend(binfo.getRoomByCell(adc.left  ).clist);}
			if(adc.right.isShade() ){ clist.extend(binfo.getRoomByCell(adc.right ).clist);}

			if(flag?(clist.length!==cell.qnum):(clist.length===0)){
				if(this.checkOnly){ return false;}
				clist.seterr(1);
				cell.seterr(1);
				result = false;
			}
		}
		return result;
	}
},

FailCode:{
	ceSumSizeNe : ["数字とそれに接する黒マスの大きさの合計が一致しません。","Sum of the adjacent masses of shaded cells is not equal to the number."],
	ceNoShade   : ["数字のない□に黒マスが接していません。","No shaded cells are adjacent to square mark without numbers."]
}
});
