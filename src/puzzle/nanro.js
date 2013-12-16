//
// パズル固有スクリプト部 ナンロー版 nanro.js v3.4.0
//
pzpr.createCustoms('nanro', {
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
				if     (cell.getQsub()===1){ this.inputData=-2;}
				else if(cell.getQsub()===2){ this.inputData=-3;}
			}
			this.mouseCell = cell;
		}
		else if(cell.getQnum()===-1){
			cell.setNum(this.inputData);
			this.mouseCell = cell;
			cell.draw();
		}
	},
	inputDot_nanro : function(){
		var cell = this.getcell();
		if(cell.isnull || cell===this.mouseCell || cell.isNum()){ return;}
		if(this.inputData===null){ this.inputData = (cell.getQsub()===2?0:2);}
		if     (this.inputData==2){ cell.setAnum(-1); cell.setQsub(2);}
		else if(this.inputData==0){ cell.setAnum(-1); cell.setQsub(0);}
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
			var cell = this.cursor.getTCC();
			if     (ca==='q'||ca==='a'||ca==='z')          { ca='s1';}
			else if(ca==='w'||ca==='s'||ca==='x')          { ca='s2';}
			else if(ca==='e'||ca==='d'||ca==='c'||ca==='-'){ ca=' '; }
			else if(ca==='1' && cell.getAnum()===1)        { ca='s1';}
			else if(ca==='2' && cell.getAnum()===2)        { ca='s2';}
		}
		this.key_inputqnum(ca);
	}
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	numberWithMB : true,

	nummaxfunc : function(){
		return this.owner.board.rooms.getCntOfRoomByCell(this);
	}
},
Board:{
	qcols : 8,
	qrows : 8,

	isborder : 1
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
	initialize : function(){
		this.Common.prototype.initialize.call(this);

		this.gridcolor = this.gridcolor_LIGHT;
	},
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
	checkAns : function(){

		if( !this.check2x2NumberCell() ){ return 'nm2x2';}

		if( !this.checkSideAreaNumber() ){ return 'scNum';}

		var rinfo = this.getErrorFlag_cell();
		if( !this.checkErrorFlag_cell(rinfo, 4) ){ return 'bkPlNum';}
		if( !this.checkErrorFlag_cell(rinfo, 1) ){ return 'nmCountGt';}

		var numinfo = this.owner.board.getNumberInfo();
		if( !this.checkOneArea(numinfo) ){ return 'nmDivide';}

		if( !this.checkErrorFlag_cell(rinfo, 2) ){ return 'nmCountLt';}
		if( !this.checkErrorFlag_cell(rinfo, 3) ){ return 'bkNoNum';}

		return 0;
	},

	check2x2NumberCell : function(){
		return this.check2x2Block(function(cell){ return cell.isNum();});
	},
	checkSideAreaNumber : function(rinfo){
		return this.checkSideAreaCell(rinfo, function(cell1,cell2){ return cell1.sameNumber(cell2);}, false);
	},

	getErrorFlag_cell : function(){
		var rinfo = this.owner.board.getRoomInfo();
		for(var id=1,max=rinfo.max;id<=max;id++){
			var room = rinfo.room[id], clist = room.clist;
			room.error  =  0;		// 後でエラー表示するエラーのフラグ
			room.number = -1;		// そのエリアに入っている数字
			var nums = [];			// キーの数字が入っている数
			var numcnt = 0;			// エリアに入っている数字の種類数
			var emptycell = 0;		// 数字が入っていないセルの数
			var filled = 0;			// エリアに入っている数字
			for(var i=0;i<clist.length;i++){
				var num = clist[i].getNum();
				if(num==-1){ emptycell++;}
				else if(isNaN(nums[num])){ numcnt++; filled=num; nums[num]=1;}
				else{ nums[num]++;}
			}
			if(numcnt>1)                               { room.error=4;}
			else if(numcnt==0)                         { room.error=3;}
			else if(numcnt==1 && filled < nums[filled]){ room.error=1; room.number=filled;}
			else if(numcnt==1 && filled > nums[filled]){ room.error=2; room.number=filled;}
			else                                       { room.error=-1;room.number=filled;}
		}
		return rinfo;
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
