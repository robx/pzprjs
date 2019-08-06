//
// パズル固有スクリプト部 たすくえあ版 tasquare.js
//
(function(pidlist, classbase){
	if(typeof module==='object' && module.exports){module.exports = [pidlist, classbase];}
	else{ pzpr.classmgr.makeCustom(pidlist, classbase);}
}(
['tasquare'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	use : true,
	inputModes : {edit:['number','clear'],play:['shade','unshade']},
	mouseinput_auto : function(){
		if(this.puzzle.playmode){
			if(this.mousestart || this.mousemove){ this.inputcell();}
		}
		else if(this.puzzle.editmode){
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

AreaShadeGraph:{
	enabled : true
},
AreaUnshadeGraph:{
	enabled : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	hideHatena : true,

	fontsizeratio : 0.65,			/* 丸数字 */

	qanscolor : "black",
	numbercolor_func : "qnum",

	paint : function(){
		this.drawBGCells();
		this.drawShadedCells();
		this.drawDotCells(false);
		this.drawGrid();

		this.drawCellSquare();

		this.drawQuesNumbers();

		this.drawChassis();

		this.drawTarget();
	},

	drawCellSquare : function(){
		var g = this.vinc('cell_square', 'crispEdges', true);

		var rw = this.bw*0.8-1;
		var rh = this.bh*0.8-1;

		g.lineWidth = 1;
		g.strokeStyle = "black";
		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i];
			g.vid = "c_sq_"+cell.id;
			if(cell.qnum!==-1){
				g.fillStyle = (cell.error===1 ? this.errbcolor1 : "white");
				g.shapeRectCenter(cell.bx*this.bw, cell.by*this.bh, rw, rh);
			}
			else{ g.vhide();}
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
	checklist : [
		"checkShadeCellExist",
		"checkSquareShade",
		"checkConnectUnshade",
		"checkSumOfSize",
		"checkAtLeastOne"
	],

	checkSquareShade : function(){
		this.checkAllArea(this.board.sblkmgr, function(w,h,a,n){ return (w*h===a && w===h);}, "csNotSquare");
	},
	checkSumOfSize  : function(){ this.checkNumberSquare(true,  "nmSumSizeNe");},
	checkAtLeastOne : function(){ this.checkNumberSquare(false, "nmNoSideShade");},
	checkNumberSquare : function(flag, code){
		var bd = this.board;
		for(var c=0;c<bd.cell.length;c++){
			var cell = bd.cell[c];
			if((flag?(cell.qnum<0):(cell.qnum===-1))){ continue;}
			var clist=new this.klass.CellList(), adc=cell.adjacent;
			if(adc.top.isShade()   ){ clist.extend(adc.top   .sblk.clist);}
			if(adc.bottom.isShade()){ clist.extend(adc.bottom.sblk.clist);}
			if(adc.left.isShade()  ){ clist.extend(adc.left  .sblk.clist);}
			if(adc.right.isShade() ){ clist.extend(adc.right .sblk.clist);}

			if(flag ? (clist.length===cell.qnum) : (clist.length>0)){ continue;}

			this.failcode.add(code);
			if(this.checkOnly){ break;}
			clist.seterr(1);
			cell.seterr(1);
		}
	}
},

FailCode:{
	nmSumSizeNe   : ["数字とそれに接する黒マスの大きさの合計が一致しません。","Sum of the adjacent masses of shaded cells is not equal to the number."],
	nmNoSideShade : ["□に黒マスが接していません。","No shaded cells are adjacent to square marks."]
}
}));
