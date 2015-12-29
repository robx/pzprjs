//
// パズル固有スクリプト部 フィルオミノ版 fillomino.js v3.4.1
//
pzpr.classmgr.makeCustom(['fillomino'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.owner.playmode && (this.mousestart || this.mousemove)){
			if(this.btn.Left){
				if(this.isBorderMode()){ this.inputborder();}
				else                   { this.dragnumber_fillomino();}
			}
			else if(this.btn.Right){ this.inputQsubLine();}
		}

		if(this.mouseend && this.notInputted()){
			this.mouseCell = this.owner.board.emptycell;
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

		if(this.inputData>=-1){
			cell.setAnum(this.inputData);
			cell.draw();
		}
		else if(this.inputData<=-3){
			var cell2 = this.mouseCell;
			var border = this.owner.board.getb(((cell.bx+cell2.bx)>>1), ((cell.by+cell2.by)>>1));
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
		if(this.owner.playmode && (this.isCTRL || this.isX || this.isZ)){
			return this.move_fillomino(ca);
		}
		return this.moveTCell(ca);
	},

	move_fillomino : function(ca){
		var cell = this.cursor.getc();
		if(cell.isnull){ return false;}

		var adc=cell.adjacent, adb=cell.adjborder;
		var nc, nb, dir=cell.NDIR;
		switch(ca){
			case 'up':    nc=adc.top;    nb=adb.top;    dir=cell.UP; break;
			case 'down':  nc=adc.bottom; nb=adb.bottom; dir=cell.DN; break;
			case 'left':  nc=adc.left;   nb=adb.left;   dir=cell.LT; break;
			case 'right': nc=adc.right;  nb=adb.right;  dir=cell.RT; break;
			default: return false;
		}
		if(!nc.isnull){
			var isMoved = (this.isCTRL || this.isX || this.isZ);
			if(!isMoved){ return false;}

			if(this.isCTRL)  { if(!nb.isnull){ nb.setQsub((nb.qsub===0)?1:0);    this.cursor.setaddr(nc);}}
			else if(this.isZ){ if(!nb.isnull){ nb.setQans((!nb.isBorder()?1:0));                         }}
			else if(this.isX){ if(!nc.isnull){ nc.setAnum(cell.getNum());        this.cursor.setaddr(nc);}}

			cell.draw();
			this.stopEvent();	/* カーソルを移動させない */
			return true;
		}
		return false;
	}
},

//---------------------------------------------------------
// 盤面管理系
Board:{
	hasborder : 1,

	getErrorRoomInfo : function(){
		var rinfo = this.getRoomInfo();
		for(var id=1;id<=rinfo.max;id++){  /* rinfo.maxは領域を分割した時に増加します. */
			var area = rinfo.area[id], clist = area.clist;
			var nums = [];
			var emptycell=0, numkind=0, filled=-1;
			for(var i=0;i<clist.length;i++){
				var num = clist[i].getNum();
				if(num===-1){ emptycell++;}
				else if(isNaN(nums[num])){ numkind++; filled=num; nums[num]=1;}
				else{ nums[num]++;}
			}

			area.number  = -1;
			area.numkind = numkind;
			if(numkind===1){ area.number=filled;}
			else if(numkind>=2 && emptycell===0){
				// emptycellが0で2種類以上の数字が入っている領域の場合
				// -> それぞれに別の領域idを割り当てて判定できるようにする
				for(var i=0;i<clist.length;i++){ rinfo.id[clist[i].id] = 0;}
				for(var i=0;i<clist.length;i++){
					// error,numberはあとでforループが回ってきた時に設定します
					this.assignNewErrorRoomID(rinfo, clist[i]);
				}
				// 最後に自分の情報を無効にする
				rinfo.area[id] = null;
			}
		}
		return rinfo;
	},
	assignNewErrorRoomID : function(rinfo, cell0){
		if(rinfo.id[cell0.id]!==0){ return;}
		var area = rinfo.addArea(), stack=[cell0], n = 0;
		while(stack.length>0){
			var cell=stack.pop();
			if(rinfo.id[cell.id]!==0){ continue;}

			area.clist[n++] = cell;
			rinfo.id[cell.id] = area.id;

			var list = cell.getdir4clist();
			for(var i=0;i<list.length;i++){
				if(cell.sameNumber(list[i][0])){ stack.push(list[i][0]);}
			}
		}
		area.clist.length = n;
	}
},

AreaRoomManager:{
	enabled : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	gridcolor_type : "DLIGHT",

	bordercolor_func : "qans",

	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();

		this.drawNumbers();

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
		this.owner.fio.decodeCellQnum_kanpen();
	},
	encodeKanpen : function(){
		this.owner.fio.encodeCellQnum_kanpen();
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
		var bd = this.owner.board;
		for(var id=0;id<bd.bdmax;id++){
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
		"checkNoEmptyArea",
		"checkSmallArea",
		"checkSideAreaNumberSize",
		"checkLargeArea",
		"checkNotMultiNum",
		"checkNoNumCell_fillomino+"
	],

	getErrorRoomInfo  : function(){
		return (this._info.eroom = this._info.eroom || this.owner.board.getErrorRoomInfo());
	},

	checkSideAreaNumberSize : function(){
		this.checkSideAreaSize(this.getErrorRoomInfo(), function(area){ return area.number;}, "bsSameNum");
	},

	checkNoEmptyArea : function(){ this.checkAllErrorRoom(function(area){ return area.numkind!==0;}, "bkNoNum");},
	checkSmallArea   : function(){ this.checkAllErrorRoom(function(area){ return !(area.numkind===1 && area.number>area.clist.length);}, "bkSizeLt");},
	checkLargeArea   : function(){ this.checkAllErrorRoom(function(area){ return !(area.numkind===1 && area.number<area.clist.length);}, "bkSizeGt");},
	checkNotMultiNum : function(){ this.checkAllErrorRoom(function(area){ return !(area.numkind>1);}, "bkPlNum");},	/* jshint ignore:line */
	checkAllErrorRoom : function(evalfunc, code){
		var rinfo = this.getErrorRoomInfo();
		for(var id=1;id<=rinfo.max;id++){
			var area = rinfo.area[id];
			if( !area || evalfunc(area) ){ continue;}
			
			this.failcode.add(code);
			if(this.checkOnly){ break;}
			area.clist.seterr(1);
		}
	},

	checkNoNumCell_fillomino : function(){
		if(!this.owner.getConfig('enbnonum')){
			this.checkNoNumCell();
		}
	}
},

FailCode:{
	bkSizeLt : ["ブロックの大きさより数字のほうが大きいです。","A number is bigger than the size of block."],
	bkSizeGt : ["ブロックの大きさよりも数字が小さいです。","A number is smaller than the size of block."],
	bsSameNum : ["同じ数字のブロックが辺を共有しています。","Adjacent blocks have the same number."]
}
});
