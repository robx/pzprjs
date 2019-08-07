//
// パズル固有スクリプト部 ぬりかべ・ぬりぼう・モチコロ・モチにょろ版 nurikabe.js
//
(function(pidlist, classbase){
	if(typeof module==='object' && module.exports){module.exports = [pidlist, classbase];}
	else{ pzpr.classmgr.makeCustom(pidlist, classbase);}
}(
['nurikabe','nuribou','mochikoro','mochinyoro'], {
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
"MouseEvent@nurikabe":{
	inputModes : {edit:['number','clear','info-blk'],play:['shade','unshade','info-blk']}
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
"Cell@mochikoro,mochinyoro":{
	getdir8clist : function(){
		var list=[];
		var cells = [
			this.relcell(-2,-2), this.relcell( 0,-2), this.relcell( 2,-2),
			this.relcell(-2, 0),                      this.relcell( 2, 0),
			this.relcell(-2, 2), this.relcell( 0, 2), this.relcell( 2, 2)
		];
		for(var i=0;i<8;i++){
			if(cells[i].group==="cell" && !cells[i].isnull){ list.push([cells[i],(i+1)]);} /* i+1==dir */
		}
		return list;
	}
},
"Board@mochikoro,mochinyoro":{
	addExtraInfo : function(){
		this.ublk8mgr = this.addInfoList(this.klass.AreaUnshade8Graph);
	}
},

AreaShadeGraph:{
	enabled : true
},
"AreaShadeGraph@mochikoro":{
	enabled : false
},
AreaUnshadeGraph:{
	enabled : true
},
"AreaUnshade8Graph:AreaUnshadeGraph@mochikoro,mochinyoro":{
	setComponentRefs : function(obj, component){ obj.ublk8 = component;},
	getObjNodeList   : function(nodeobj){ return nodeobj.ublk8nodes;},
	resetObjNodeList : function(nodeobj){ nodeobj.ublk8nodes = [];},

	getSideObjByNodeObj : function(cell){
		var list = cell.getdir8clist(), cells = [];
		for(var i=0;i<list.length;i++){
			var cell2 = list[i][0];
			if(this.isnodevalid(cell2)){ cells.push(cell2);}
		}
		return cells;
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	numbercolor_func : "qnum",
	qanscolor : "black",

	paint : function(){
		this.drawBGCells();
		this.drawShadedCells();
		if(this.pid==='nurikabe'){ this.drawDotCells(false);}
		this.drawGrid();

		this.drawQuesNumbers();

		this.drawChassis();

		this.drawTarget();
	}
},
"Graphic@nuribou,mochikoro,mochinyoro":{
	bgcellcolor_func : "qsub1",
	enablebcolor : true
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
"Encode@nurikabe":{
	decodeKanpen : function(){
		this.fio.decodeCellQnum_kanpen();
	},
	encodeKanpen : function(){
		this.fio.encodeCellQnum_kanpen();
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCellQnum();
		this.decodeCellAns();
	},
	encodeData : function(){
		this.encodeCellQnum();
		this.encodeCellAns();
	}
},
"FileIO@nurikabe":{
	decodeData : function(){
		this.decodeCellQnumAns();
	},
	encodeData : function(){
		this.encodeCellQnumAns();
	},

	kanpenOpen : function(){
		this.decodeCellQnumAns_kanpen();
	},
	kanpenSave : function(){
		this.encodeCellQnumAns_kanpen();
	},

	kanpenOpenXML : function(){
		this.decodeCellQnumAns_XMLBoard();
	},
	kanpenSaveXML : function(){
		this.encodeCellQnumAns_XMLBoard();
		this.encodeCellAns_XMLAnswer();
	},

	decodeCellQnumAns_XMLBoard : function(){
		this.decodeCellXMLBoard(function(cell, val){
			if     (val>0)   { cell.qnum = val;}
			else if(val===-1){ cell.qsub = 1;}
			else if(val===-2){ cell.qans = 1;}
			else if(val===-3){ cell.qnum = -2;}
		});
	},
	encodeCellQnumAns_XMLBoard : function(){
		this.encodeCellXMLBoard(function(cell){
			var val = 0;
			if     (cell.qnum>0)   { val = cell.qnum;}
			else if(cell.qnum===-2){ val = -3;}
			else if(cell.qans===1) { val = -2;}
			else if(cell.qsub===1) { val = -1;}
			return val;
		});
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
"AnsCheck@nurikabe":{
	checklist : [
		"check2x2ShadeCell",
		"checkNoNumberInUnshade",
		"checkConnectShade",
		"checkDoubleNumberInUnshade",
		"checkNumberAndUnshadeSize"
	]
},
"AnsCheck@nuribou#1":{
	checklist : [
		"checkBou",
		"checkCorners",
		"checkNoNumberInUnshade",
		"checkDoubleNumberInUnshade",
		"checkNumberAndUnshadeSize"
	]
},
"AnsCheck@mochikoro,mochinyoro#1":{
	checklist : [
		"checkShadeCellExist",
		"check2x2ShadeCell",
		"checkConnectUnshaded_mochikoro",
		"checkUnshadeRect",
		"checkDoubleNumberInUnshade",
		"checkNumberAndUnshadeSize",
		"checkShadeNotRect@mochinyoro"
	]
},
AnsCheck : {
	checkDoubleNumberInUnshade : function(){
		this.checkAllBlock(this.board.ublkmgr, function(cell){ return cell.isNum();}, function(w,h,a,n){ return (a<2);}, "bkNumGe2");
	},
	checkNumberAndUnshadeSize : function(){
		this.checkAllArea(this.board.ublkmgr, function(w,h,a,n){ return (n<=0 || n===a);}, "bkSizeNe");
	}
},
"AnsCheck@nuribou":{
	checkBou : function(){
		this.checkAllArea(this.board.sblkmgr, function(w,h,a,n){ return (w===1||h===1);}, "csWidthGt1");
	},
	checkCorners : function(){
		var bd = this.board;
		for(var c=0;c<bd.cell.length;c++){
			var cell = bd.cell[c];
			if(cell.bx===bd.maxbx-1 || cell.by===bd.maxby-1){ continue;}

			var i, adc = cell.adjacent;
			var cells = [ [cell, adc.right.adjacent.bottom], [adc.right, adc.bottom] ];
			for(i=0;i<2;i++){
				if( cells[i][0].isShade() && cells[i][1].isShade() ){ break;}
			}
			if(i===2){ continue;}

			var block1 = cells[i][0].sblk.clist, block2 = cells[i][1].sblk.clist;
			if(block1.length !== block2.length){ continue;}

			this.failcode.add("csCornerSize");
			if(this.checkOnly){ break;}
			block1.seterr(1);
			block2.seterr(1);
		}
	}
},
"AnsCheck@nurikabe,nuribou":{
	checkNoNumberInUnshade : function(){
		this.checkAllBlock(this.board.ublkmgr, function(cell){ return cell.isNum();}, function(w,h,a,n){ return (a!==0);}, "bkNoNum");
	}
},
"AnsCheck@mochikoro,mochinyoro":{
	checkConnectUnshaded_mochikoro : function(){
		this.checkOneArea(this.board.ublk8mgr, "csDivide8");
	},
	checkUnshadeRect : function(){
		this.checkAllArea(this.board.ublkmgr, function(w,h,a,n){ return (w*h===a);}, "cuNotRect");
	}
},
"AnsCheck@mochinyoro":{
	checkShadeNotRect : function(){
		this.checkAllArea(this.board.sblkmgr, function(w,h,a,n){ return (w*h!==a);}, "csRect");
	}
},

FailCode:{
	bkNoNum  : ["数字の入っていないシマがあります。","An area of unshaded cells has no numbers."],
	bkNumGe2 : ["1つのシマに2つ以上の数字が入っています。","An area of unshaded cells has plural numbers."],
	bkSizeNe : ["数字とシマの面積が違います。","The number is not equal to the number of the size of the area."]
},
"FailCode@nuribou":{
	csWidthGt1   : ["「幅１マス、長さ１マス以上」ではない黒マスのカタマリがあります。","There is a mass of shaded cells, whose width is more than two."],
	csCornerSize : ["同じ面積の黒マスのカタマリが、角を共有しています。","Masses of shaded cells whose length is the same share a corner."]
},

"FailCode@mochikoro,mochinyoro":{
	cuNotRect : ["四角形でない白マスのブロックがあります。","There is a block of unshaded cells that is not rectangle."],
	csRect    : ["四角形になっている黒マスのブロックがあります。","There is a block of shaded cells that is rectangle."],
	csDivide8 : ["孤立した白マスのブロックがあります。","Unshaded cells are divided."]
}
}));
