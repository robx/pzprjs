//
// パズル固有スクリプト部 数コロ・ヴィウ・数コロ部屋版 sukoro.js v3.4.1
//
pzpr.classmgr.makeCustom(['sukoro','view','sukororoom'], {
//---------------------------------------------------------
// マウス入力系
"MouseEvent@sukoro,view":{
	mouseinput : function(){
		if(this.mousestart){ this.inputqnum();}
	}
},
"MouseEvent@sukororoom":{
	mouseinput : function(){
		if(this.owner.playmode){
			if(this.mousestart){ this.inputqnum();}
		}
		else if(this.owner.editmode){
			if(this.mousestart || (this.mousemove && this.btn.Left)){
				this.inputborder();
			}
			else if(this.mouseend && this.notInputted()){
				this.inputqnum();
			}
		}
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,
	enableplay : true,

	keyinput : function(ca){
		this.key_sukoro(ca);
	},
	key_sukoro : function(ca){
		if(this.owner.playmode){
			var cell=this.cursor.getc();
			if     (ca==='q'||ca==='a'||ca==='z')          { ca=(cell.getQsub()===1?'1':'s1');}
			else if(ca==='w'||ca==='s'||ca==='x')          { ca=(cell.getQsub()===2?'2':'s2');}
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

	maxnum : 4,

	// 正答判定用
	getViewClist : function(){
		var sx=this.bx, sy=this.by, clist=new this.owner.CellList();
		for(var dir=1;dir<=4;dir++){
			var pos = new this.owner.Address(sx,sy);
			while(1){
				pos.movedir(dir,2);
				var cell = pos.getc();
				if(!cell.isnull && cell.noNum() && cell.getQsub()!==1){ clist.add(cell);}
				else{ break;}
			}
		}
		return clist;
	}
},
"Cell@view":{
	maxnum : 255,
	minnum : 0,
	nummaxfunc : function(){
		return Math.min(this.owner.board.qcols+this.owner.board.qrows-2, this.maxnum);
	}
},

"Board@view":{
	qcols : 8,
	qrows : 8
},
"Board@sukororoom":{
	qcols : 8,
	qrows : 8,

	hasborder : 1
},

AreaNumberManager:{
	enabled : true
},
"AreaRoomManager@sukororoom":{
	enabled : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	paint : function(){
		this.drawBGCells();
		this.drawGrid();

		if(this.owner.pid==='sukororoom'){ this.drawBorders();}

		this.drawMBs();
		this.drawNumbers();

		this.drawChassis();

		this.drawCursor();
	}
},
"Graphic@view":{
	bgcellcolor_func : "error2",
	errbcolor2 : "rgb(255, 255, 127)"
},

//---------------------------------------------------------
// URLエンコード/デコード処理
"Encode@sukoro":{
	decodePzpr : function(type){
		this.decodeNumber10();
	},
	encodePzpr : function(type){
		this.encodeNumber10();
	}
},
"Encode@view":{
	decodePzpr : function(type){
		this.decodeNumber16();
	},
	encodePzpr : function(type){
		this.encodeNumber16();
	}
},
"Encode@sukororoom":{
	decodePzpr : function(type){
		this.decodeBorder();
		this.decodeNumber10();
	},
	encodePzpr : function(type){
		this.encodeBorder();
		this.encodeNumber10();
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		if(this.owner.pid==='sukororoom'){ this.decodeBorderQues();}
		this.decodeCellQnum();
		this.decodeCellAnumsub();
	},
	encodeData : function(){
		if(this.owner.pid==='sukororoom'){ this.encodeBorderQues();}
		this.encodeCellQnum();
		this.encodeCellAnumsub();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){
		var o = this.owner, bd = o.board, pid = o.pid;

		if(pid!=='sukororoom'){
			if( !this.checkAdjacentDiffNumber() ){ return 'nmSameNum';}
		}
		else{
			var rinfo = bd.getRoomInfo();
			if( !this.checkDiffNumberInRoom(rinfo) ){ return 'bkDupNum';}
			if( !this.checkNumberOrNotInRoom(rinfo) ){ return 'bkMixed';}
		}

		if( (pid!=='view') && !this.checkDir4NumberCount() ){ return 'nmNumberNe';}
		if( (pid==='view') && !this.checkViewNumber() ){ return 'nmSumViewNe';}

		var numinfo = bd.getNumberInfo();
		if( !this.checkOneArea(numinfo) ){ return 'nmDivide';}

		if( !this.checkNoSuspendCell() ){ return 'ceSuspend';}

		return null;
	},

	checkAdjacentDiffNumber : function(){
		return this.checkSideCell(function(cell1,cell2){ return cell1.sameNumber(cell2);});
	},
	checkDiffNumberInRoom : function(rinfo){
		return this.checkDifferentNumberInRoom(rinfo, function(cell){ return cell.getNum();});
	},
	checkNumberOrNotInRoom : function(rinfo){
		return this.checkSameObjectInRoom(rinfo, function(cell){ return (cell.isNumberObj()?1:2);});
	},
	checkDir4NumberCount : function(){
		return this.checkDir4Cell(function(cell){ return cell.isNumberObj();},0);
	},
	checkNoSuspendCell : function(){
		return this.checkAllCell(function(cell){ return (cell.getQsub()===1);});
	},

	checkViewNumber : function(){
		var result = true, bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c];
			if(!cell.isValidNum()){ continue;}

			var clist = cell.getViewClist();
			if(cell.getNum()!==clist.length){
				if(this.checkOnly){ return false;}
				cell.seterr(1);
				clist.seterr(2);
				result = false;
			}
		}
		return result;
	}
},

FailCode:{
	bkDupNum : ["1つの部屋に同じ数字が複数入っています。","A room has two or more same numbers."],
	bkMixed  : ["数字のあるなしが混在した部屋があります。","A room includes both numbered and non-numbered cells."],
	nmNumberNe : ["数字と、その数字の上下左右に入る数字の数が一致していません。","The number of numbers placed in four adjacent cells is not equal to the number."],
	nmSumViewNe : ["数字と、他のマスにたどり着くまでのマスの数の合計が一致していません。","Sum of four-way gaps to another number is not equal to the number."],
	ceSuspend  : ["数字の入っていないマスがあります。","There is a cell that is not filled in number."]
}
});
