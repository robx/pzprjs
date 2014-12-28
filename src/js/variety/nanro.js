//
// パズル固有スクリプト部 ナンロー版 nanro.js v3.4.1
//
pzpr.classmgr.makeCustom(['nanro'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.owner.playmode){
			if(this.mousestart || this.mousemove){
				if     (this.btn.Left) { this.dragnumber_nanro();}
				else if(this.mousemove && this.btn.Right){ this.inputDot_nanro();}
			}
			else if(this.mouseend && this.notInputted()){
				this.mouseCell = this.owner.board.emptycell;
				this.inputqnum();
			}
		}
		else if(this.owner.editmode){
			if(this.mousestart || this.mousemove){ this.inputborder();}
			else if(this.mouseend && this.notInputted()){
				this.mouseCell = this.owner.board.emptycell;
				this.inputqnum();
			}
		}
	},

	dragnumber_nanro : function(){
		var cell = this.getcell();
		if(cell.isnull||cell===this.mouseCell){ return;}
		if(this.mouseCell.isnull){
			this.inputData = cell.getNum();
			if     (this.inputData===-2){ this.inputData=null;}
			else if(this.inputData===-1){
				if     (cell.qsub===1){ this.inputData=-2;}
				else if(cell.qsub===2){ this.inputData=-3;}
			}
			this.mouseCell = cell;
		}
		else if(cell.qnum===-1){
			cell.setNum(this.inputData);
			this.mouseCell = cell;
			cell.draw();
		}
	},
	inputDot_nanro : function(){
		var cell = this.getcell();
		if(cell.isnull || cell===this.mouseCell || cell.isNum()){ return;}
		if(this.inputData===null){ this.inputData = (cell.qsub===2?0:2);}
		if     (this.inputData===2){ cell.setAnum(-1); cell.setQsub(2);}
		else if(this.inputData===0){ cell.setAnum(-1); cell.setQsub(0);}
		this.mouseCell = cell;
		cell.draw();
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,
	enableplay : true,

	keyinput : function(ca){
		this.key_view(ca);
	},
	key_view : function(ca){
		if(this.owner.playmode){
			var cell = this.cursor.getc();
			if     (ca==='q'||ca==='a'||ca==='z')          { ca='s1';}
			else if(ca==='w'||ca==='s'||ca==='x')          { ca='s2';}
			else if(ca==='e'||ca==='d'||ca==='c'||ca==='-'){ ca=' '; }
			else if(ca==='1' && cell.anum===1)             { ca='s1';}
			else if(ca==='2' && cell.anum===2)             { ca='s2';}
		}
		this.key_inputqnum(ca);
	}
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	numberWithMB : true,

	maxnum : function(){
		return this.owner.board.rooms.getCntOfRoomByCell(this);
	}
},
Board:{
	qcols : 8,
	qrows : 8,

	hasborder : 1,

	getErrorRoomInfo : function(){
		var rinfo = this.getRoomInfo();
		for(var id=1;id<=rinfo.max;id++){  /* rinfo.maxは領域を分割した時に増加します. */
			var area = rinfo.area[id], clist = area.clist;
			var nums = [];
			var numkind=0, filled=-1;
			for(var i=0;i<clist.length;i++){
				var num = clist[i].getNum();
				if(num!==-1){
					if(isNaN(nums[num])){ numkind++; filled=num; nums[num]=1;}
					else{ nums[num]++;}
				}
			}
			area.number  = filled;
			area.numcnt  = nums[filled];
			area.numkind = numkind;
		}
		return rinfo;
	}
},

AreaNumberManager:{
	enabled : true
},
AreaRoomManager:{
	enabled : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	gridcolor_type : "LIGHT",

	paint : function(){
		this.drawBGCells();
		this.drawGrid();

		this.drawMBs();
		this.drawNumbers();

		this.drawBorders();

		this.drawChassis();

		this.drawCursor();
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodeBorder();
		this.decodeNumber16();
	},
	encodePzpr : function(type){
		this.encodeBorder();
		this.encodeNumber16();
	},

	decodeKanpen : function(){
		this.owner.fio.decodeAreaRoom();
		this.owner.fio.decodeCellQnum_kanpen();
	},
	encodeKanpen : function(){
		this.owner.fio.encodeAreaRoom();
		this.owner.fio.encodeCellQnum_kanpen();
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeAreaRoom();
		this.decodeCellQnum();
		this.decodeCellAnumsub();
	},
	encodeData : function(){
		this.encodeAreaRoom();
		this.encodeCellQnum();
		this.encodeCellAnumsub();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checklist : [
		["check2x2NumberCell",  "nm2x2"],
		["checkSideAreaNumber", "scNum"],
		["checkNotMultiNum",    "bkPlNum"],
		["checkNumCountOver",   "nmCountGt"],
		["checkConnectNumber",  "nmDivide"],
		["checkNumCountLack",   "nmCountLt"],
		["checkNoEmptyArea",    "bkNoNum"]
	],

	getErrorRoomInfo  : function(){
		return (this._info.eroom = this._info.eroom || this.owner.board.getErrorRoomInfo());
	},

	check2x2NumberCell : function(){
		return this.check2x2Block(function(cell){ return cell.isNum();});
	},
	checkSideAreaNumber : function(rinfo){
		return this.checkSideAreaCell(this.getErrorRoomInfo(), function(cell1,cell2){ return cell1.sameNumber(cell2);}, false);
	},

	checkNotMultiNum  : function(){ return this.checkAllErrorRoom(function(area){ return !(area.numkind>1);});},	/* jshint ignore:line */
	checkNumCountLack : function(){ return this.checkAllErrorRoom(function(area){ return !(area.numkind===1 && area.number>area.numcnt);});},
	checkNumCountOver : function(){ return this.checkAllErrorRoom(function(area){ return !(area.numkind===1 && area.number<area.numcnt);});},
	checkNoEmptyArea  : function(){ return this.checkAllErrorRoom(function(area){ return area.numkind!==0;});},
	checkAllErrorRoom : function(evalfunc){
		var result = true;
		var rinfo = this.getErrorRoomInfo();
		for(var id=1;id<=rinfo.max;id++){
			var area = rinfo.area[id];
			if( !!area && !evalfunc(area) ){
				if(this.checkOnly){ return false;}
				area.clist.seterr(1);
				result = false;
			}
		}
		return result;
	}
},

FailCode:{
	bkNoNum : ["数字が含まれていないブロックがあります。","A block has no number."],
	nm2x2   : ["数字が2x2のかたまりになっています。","There is a 2x2 block of numbers."],
	scNum   : ["同じ数字が境界線を挟んで隣り合っています。","Adjacent blocks have the same number."],
	nmCountGt : ["入っている数字の数が数字より多いです。","A number is bigger than the size of block."],
	nmCountLt : ["入っている数字の数が数字より少ないです。","A number is smaller than the size of block."]
}
});
