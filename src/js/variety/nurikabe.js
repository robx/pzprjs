//
// パズル固有スクリプト部 ぬりかべ・ぬりぼう・モチコロ・モチにょろ版 nurikabe.js v3.4.1
//
pzpr.classmgr.makeCustom(['nurikabe','nuribou','mochikoro','mochinyoro'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
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
Board:{
	getdir8WareaInfo : function(){
		var winfo = new this.klass.AreaInfo();
		for(var c=0;c<this.cellmax;c++){ winfo.id[c]=(this.cell[c].isUnshade()?0:null);}
		for(var c=0;c<this.cellmax;c++){
			var cell0 = this.cell[c];
			if(winfo.id[cell0.id]!==0){ continue;}
			var area = winfo.addArea();
			var stack=[cell0], n=0;
			while(stack.length>0){
				var cell = stack.pop();
				if(winfo.id[cell.id]!==0){ continue;}

				area.clist[n++] = cell;
				winfo.id[cell.id] = area.id;

				var bx=cell.bx, by=cell.by;
				var clist = this.cellinside(bx-2, by-2, bx+2, by+2);
				for(var i=0;i<clist.length;i++){
					if(winfo.id[clist[i].id]===0){ stack.push(clist[i]);}
				}
			}
			area.clist.length = n;
		}
		return winfo;
	}
},

AreaShadeManager:{
	enabled : true
},
"AreaShadeManager@mochikoro":{
	enabled : false
},
AreaUnshadeManager:{
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
	paint : function(){
		this.drawBGCells();
		if(this.pid==='nurikabe'){ this.drawDotCells(false);}
		this.drawGrid();
		this.drawShadedCells();

		this.drawNumbers();

		this.drawChassis();

		this.drawTarget();
	}
},
"Graphic@nuribou,mochikoro,mochinyoro":{
	bgcellcolor_func : "qsub1",

	bcolor_type : "GREEN"
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
		this.puzzle.fio.decodeCellQnum_kanpen();
	},
	encodeKanpen : function(){
		this.puzzle.fio.encodeCellQnum_kanpen();
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
		this.checkAllBlock(this.getUnshadeInfo(), function(cell){ return cell.isNum();}, function(w,h,a,n){ return (a<2);}, "bkNumGe2");
	},
	checkNumberAndUnshadeSize : function(){
		this.checkAllArea(this.getUnshadeInfo(), function(w,h,a,n){ return (n<=0 || n===a);}, "bkSizeNe");
	}
},
"AnsCheck@nuribou":{
	checkBou : function(){
		this.checkAllArea(this.getShadeInfo(), function(w,h,a,n){ return (w===1||h===1);}, "csWidthGt1");
	},
	checkCorners : function(){
		var bd = this.board;
		var binfo = this.getShadeInfo();
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c];
			if(cell.bx===bd.maxbx-1 || cell.by===bd.maxby-1){ continue;}

			var i, adc = cell.adjacent;
			var cells = [ [cell, adc.right.adjacent.bottom], [adc.right, adc.bottom] ];
			for(i=0;i<2;i++){
				if( cells[i][0].isShade() && cells[i][1].isShade() ){ break;}
			}
			if(i===2){ continue;}

			var block1 = binfo.getRoomByCell(cells[i][0]).clist,
				block2 = binfo.getRoomByCell(cells[i][1]).clist;
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
		this.checkAllBlock(this.getUnshadeInfo(), function(cell){ return cell.isNum();}, function(w,h,a,n){ return (a!==0);}, "bkNoNum");
	}
},
"AnsCheck@mochikoro,mochinyoro":{
	checkConnectUnshaded_mochikoro : function(){
		this.checkOneArea( this.board.getdir8WareaInfo(), "csDivide8" );
	},
	checkUnshadeRect : function(){
		this.checkAllArea(this.getUnshadeInfo(), function(w,h,a,n){ return (w*h===a);}, "cuNotRect");
	},
	checkShadeNotRect : function(){
		this.checkAllArea(this.getShadeInfo(), function(w,h,a,n){ return (w*h!==a);}, "csRect");
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
	csDivide8 : ["孤立した白マスのブロックがあります。","Unshaded cells are devided."]
}
});
