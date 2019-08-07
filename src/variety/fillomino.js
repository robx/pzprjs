//
// パズル固有スクリプト部 フィルオミノ版 fillomino.js
//
(function(pidlist, classbase){
	if(typeof module==='object' && module.exports){module.exports = [pidlist, classbase];}
	else{ pzpr.classmgr.makeCustom(pidlist, classbase);}
}(
['fillomino'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputModes : {edit:['number','clear'],play:['copynum','number','clear','border','subline']},
	mouseinput_other : function(){
		if(this.inputMode==='copynum'){ this.dragnumber_fillomino();}
	},
	mouseinput_auto : function(){
		if(this.puzzle.playmode && (this.mousestart || this.mousemove)){
			if(this.btn==='left'){
				if(this.isBorderMode()){ this.inputborder();}
				else                   { this.dragnumber_fillomino();}
			}
			else if(this.btn==='right'){ this.inputQsubLine();}
		}

		if(this.mouseend && this.notInputted()){
			this.mouseCell = this.board.emptycell;
			this.inputqnum();
		}
	},

	dragnumber_fillomino : function(){
		var cell = this.getcell();
		if(cell.isnull||cell===this.mouseCell){ return;}

		if(this.inputData===null){
			this.inputData = cell.getNum();
			if(this.inputData===-1){ this.inputData=-2;}
			this.mouseCell = cell;
			return;
		}
		else if(this.inputData===-2){
			this.inputData=(cell.getNum()===-1?-3:-1);
		}

		if((this.inputData>=-1) && (cell.qnum===-1)){
			cell.clrSnum();
			cell.setAnum(this.inputData);
			cell.draw();
		}
		else if(this.inputData<=-3){
			var cell2 = this.mouseCell;
			var border = this.board.getb(((cell.bx+cell2.bx)>>1), ((cell.by+cell2.by)>>1));
			if(this.inputData===-3){ this.inputData=(border.qsub===1?-5:-4);}
			if(!border.isnull){
				border.setQsub(this.inputData===-4?1:0);
				border.draw();
			}
		}
		this.mouseCell = cell;
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,
	enableplay : true,
	moveTarget : function(ca){
		if(this.puzzle.playmode && (this.isCTRL || this.isX || this.isZ)){
			return this.move_fillomino(ca);
		}
		return this.moveTCell(ca);
	},

	move_fillomino : function(ca){
		var cell = this.cursor.getc();
		if(cell.isnull){ return false;}

		var adc=cell.adjacent, adb=cell.adjborder;
		var nc, nb;
		switch(ca){
			case 'up':    nc=adc.top;    nb=adb.top;    break;
			case 'down':  nc=adc.bottom; nb=adb.bottom; break;
			case 'left':  nc=adc.left;   nb=adb.left;   break;
			case 'right': nc=adc.right;  nb=adb.right;  break;
			default: return false;
		}
		if(!nc.isnull){
			var isMoved = (this.isCTRL || this.isX || this.isZ);
			if(!isMoved){ return false;}

			if(this.isCTRL)  { if(!nb.isnull){ nb.setQsub((nb.qsub===0)?1:0);    this.cursor.setaddr(nc);}}
			else if(this.isZ){ if(!nb.isnull){ nb.setQans((!nb.isBorder()?1:0));                         }}
			else if(this.isX){ if(!nc.isnull){ nc.setAnum(cell.getNum());        this.cursor.setaddr(nc);}}

			cell.draw();
			return true;
		}
		return false;
	}
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	enableSubNumberArray : true
},
Border:{
	isCmp : function(){
		if(!this.puzzle.execConfig('autocmp')){ return false;}
		var cell1 = this.sidecell[0], cell2 = this.sidecell[1];
		var num1 = cell1.getNum(), num2 = cell2.getNum();
		return (num1>0 && num2>0 && num1!==num2);
	}
},
Board:{
	hasborder : 1,

	addExtraInfo : function(){
		this.numblkgraph = this.addInfoList(this.klass.AreaNumBlockGraph);
	}
},

"AreaNumBlockGraph:AreaNumberGraph":{
	enabled : true,
	relation : {'cell.qnum':'node', 'cell.anum':'node', 'border.qans':'separator'},

	isnodevalid : function(cell){ return true;},
	isedgevalidbylinkobj : function(border){
		if(border.isBorder()){ return false;}
		var num1 = border.sidecell[0].getNum(), num2 = border.sidecell[1].getNum();
		return (num1===num2 || num1<0 || num2<0);
	},

	setExtraData : function(component){
		var clist = component.clist = new this.klass.CellList(component.getnodeobjs());

		var nums = [], numkind=0, filled=-1;
		for(var i=0;i<clist.length;i++){
			var num = clist[i].getNum();
			if(num===-1){}
			else if(isNaN(nums[num])){
				numkind++; nums[num]=1;
				if(filled===-1||num!==-2){ filled=num;}
			}
			else{ nums[num]++;}
		}
		if(numkind>1 && !!nums[-2]){ --numkind;}
		component.numkind = numkind;
		component.number = (numkind===1 ? filled : -1);
	},

	getComponentRefs : function(cell){ return cell.nblk;}, // getSideAreaInfo用
	getSideAreaInfo : function(){
		return this.klass.AreaRoomGraph.prototype.getSideAreaInfo.call(this);
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	gridcolor_type : "DLIGHT",

	bordercolor_func : "qans",

	autocmp : 'border',

	paint : function(){
		this.drawBGCells();
		this.drawTargetSubNumber();
		this.drawDashedGrid();

		this.drawSubNumbers();
		this.drawAnsNumbers();
		this.drawQuesNumbers();

		this.drawBorders();
		this.drawBorderQsubs();

		this.drawChassis();

		this.drawCursor();
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
		this.decodeCellAnumsub();
		this.decodeBorderAns();
	},
	encodeData : function(){
		this.encodeCellQnum();
		this.encodeCellAnumsub();
		this.encodeBorderAns();
	},

	kanpenOpen : function(){
		this.decodeCellQnum_kanpen();
		this.decodeCellAnum_kanpen();

		this.inputBorderFromNumber(); // 境界線を自動入力
	},
	kanpenSave : function(){
		this.encodeCellQnum_kanpen();
		this.encodeCellAnum_kanpen();
	},

	inputBorderFromNumber : function(){
		var bd = this.board;
		for(var id=0;id<bd.border.length;id++){
			var border = bd.border[id], cell1 = border.sidecell[0], cell2 = border.sidecell[1];
			border.qans = 0;
			if(!cell1.isnull && !cell2.isnull){
				var qa1 = cell1.getNum(), qa2 = cell2.getNum();
				if(qa1!==-1 && qa2!==-1 && qa1!==qa2){ border.qans = 1;}
			}
		}
	},

	kanpenOpenXML : function(){
		this.decodeCellQnum_XMLBoard();
		this.decodeCellAnum_XMLAnswer();

		this.inputBorderFromNumber(); // 境界線を自動入力
	},
	kanpenSaveXML : function(){
		this.encodeCellQnum_XMLBoard();
		this.encodeCellAnum_XMLAnswer();
	},

	UNDECIDED_NUM_XML : 0
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checklist : [
		"checkSmallArea",
		"checkSideAreaNumberSize",
		"checkLargeArea",
		"checkNumKinds",
		"checkNoNumArea",
		"checkNoNumCell_fillomino+"
	],

	checkSideAreaNumberSize : function(){
		this.checkSideAreaSize(this.board.numblkgraph, function(area){ return area.number;}, "bsSameNum");
	},

	checkSmallArea : function(){ this.checkAllErrorRoom(function(area){ return !(area.number>area.clist.length && area.number>0);}, "bkSizeLt");},
	checkLargeArea : function(){ this.checkAllErrorRoom(function(area){ return !(area.number<area.clist.length && area.number>0);}, "bkSizeGt");},
	checkNumKinds  : function(){ this.checkAllErrorRoom(function(area){ return area.numkind<=1;}, "bkMixedNum");},
	checkNoNumArea : function(){ this.checkAllErrorRoom(function(area){ return area.numkind>=1;}, "bkNoNum");},
	checkAllErrorRoom : function(evalfunc, code){
		var rooms = this.board.numblkgraph.components;
		for(var id=0;id<rooms.length;id++){
			var area = rooms[id];
			if( !area || evalfunc(area) ){ continue;}

			this.failcode.add(code);
			if(this.checkOnly){ break;}
			area.clist.seterr(1);
		}
	},
	checkNoNumCell_fillomino : function(){
		if(this.puzzle.getConfig('forceallcell')){
			this.checkAllCell( function(cell){ return cell.noNum();}, "ceNoNum" );
		}
	}
},

FailCode:{
	bkSizeLt : ["ブロックの大きさより数字のほうが大きいです。","A number is bigger than the size of block."],
	bkSizeGt : ["ブロックの大きさよりも数字が小さいです。","A number is smaller than the size of block."],
	bkMixedNum : ["1つのブロックに2種類以上の数字が入っています。","A room has two or more kinds of numbers."],
	bsSameNum : ["同じ数字のブロックが辺を共有しています。","Adjacent blocks have the same number."]
}
}));
