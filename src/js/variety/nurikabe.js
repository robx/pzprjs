//
// パズル固有スクリプト部 ぬりかべ・ぬりぼう・モチコロ・モチにょろ版 nurikabe.js v3.4.1
//
pzpr.classmgr.makeCustom(['nurikabe','nuribou','mochikoro','mochinyoro'], {
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
	numberRemainsUnshaded : true
},
Board:{
	getdir8WareaInfo : function(){
		var winfo = new this.owner.AreaInfo();
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
		if(this.owner.pid==='nurikabe'){ this.drawDotCells(false);}
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

		if( !this.check2x2ShadeCell() ){ return 'cs2x2';}

		var winfo = bd.getUnshadeInfo();
		if( !this.checkNoNumber(winfo) ){ return 'bkNoNum';}
		var binfo = bd.getShadeInfo();
		if( !this.checkOneArea(binfo) ){ return 'csDivide';}
		if( !this.checkDoubleNumber(winfo) ){ return 'bkNumGe2';}
		if( !this.checkNumberAndSize(winfo) ){ return 'bkSizeNe';}

		return null;
	}
},
"AnsCheck@nuribou":{
	checkAns : function(){
		var bd=this.owner.board;

		var binfo = bd.getShadeInfo();
		if( !this.checkBou(binfo) ){ return 'csWidthGt1';}
		if( !this.checkCorners(binfo) ){ return 'csCornerSize';}

		var winfo = bd.getUnshadeInfo();
		if( !this.checkNoNumber(winfo) ){ return 'bkNoNum';}
		if( !this.checkDoubleNumber(winfo) ){ return 'bkNumGe2';}
		if( !this.checkNumberAndSize(winfo) ){ return 'bkSizeNe';}

		return null;
	},

	checkBou : function(binfo){
		return this.checkAllArea(binfo, function(w,h,a,n){ return (w===1||h===1);});
	},
	checkCorners : function(binfo){
		var result = true, bd = this.owner.board;
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
			if(block1.length === block2.length){
				if(this.checkOnly){ return false;}
				block1.seterr(1);
				block2.seterr(1);
				result = false;
			}
		}
		return result;
	}
},
"AnsCheck@mochikoro,mochinyoro":{
	checkAns : function(){
		var bd=this.owner.board;

		if( !this.check2x2ShadeCell() ){ return 'cs2x2';}
		if( !this.checkConnectUnshaded_mochikoro() ){ return 'csDivide8';}

		var winfo = bd.getUnshadeInfo();
		if( !this.checkAreaRect(winfo) ){ return 'cuNotRect';}
		if( !this.checkDoubleNumber(winfo) ){ return 'bkNumGe2';}
		if( !this.checkNumberAndSize(winfo) ){ return 'bkSizeNe';}

		if(this.owner.pid==='mochinyoro'){
			var binfo = bd.getShadeInfo();
			if( !this.checkAreaNotRect(binfo) ){ return 'csRect';}
		}

		return null;
	},

	checkConnectUnshaded_mochikoro : function(){
		return this.checkOneArea( this.owner.board.getdir8WareaInfo() );
	},
	checkAreaNotRect : function(binfo){
		return this.checkAllArea(binfo, function(w,h,a,n){ return (w*h!==a);});
	}
},

FailCode:{
	bkNoNum  : ["数字の入っていないシマがあります。","An area of unshaded cells has no numbers."],
	bkNumGe2 : ["1つのシマに2つ以上の数字が入っています。","An area of unshaded cells has plural numbers."],
	bkSizeNe : ["数字とシマの面積が違います。","The number is not equal to the number of the size of the area."]
},
"FailCode@nuribou":{
	csWidthGt1   : ["「幅１マス、長さ１マス以上」ではない黒マスのカタマリがあります。","there is a mass of shaded cells, whose width is more than two."],
	csCornerSize : ["同じ面積の黒マスのカタマリが、角を共有しています。","Masses of shaded cells whose length is the same share a corner."]
},

"FailCode@mochikoro,mochinyoro":{
	cuNotRect : ["四角形でない白マスのブロックがあります。","There is a block of unshaded cells that is not rectangle."],
	csRect    : ["四角形になっている黒マスのブロックがあります。","There is a block of shaded cells that is rectangle."],
	csDivide8 : ["孤立した白マスのブロックがあります。","Unshaded cells are devided."]
}
});
