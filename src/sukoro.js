//
// パズル固有スクリプト部 数コロ・ヴィウ・数コロ部屋版 sukoro.js v3.4.0
//
pzprv3.createCustoms('sukoro', {
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
			var cell=this.cursor.getTCC();
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
		var sx=this.bx, sy=this.by, clist=this.owner.newInstance('CellList');
		for(var dir=1;dir<=4;dir++){
			var pos = this.owner.newInstance('Address',[sx,sy]);
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

	isborder : 1
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
	setColors : function(){
		this.errbcolor2 = "rgb(255, 255, 127)";
		this.setBGCellColorFunc('error2');
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
"Encode@sukoro":{
	pzlimport : function(type){
		this.decodeNumber10();
	},
	pzlexport : function(type){
		this.encodeNumber10();
	}
},
"Encode@view":{
	pzlimport : function(type){
		this.decodeNumber16();
	},
	pzlexport : function(type){
		this.encodeNumber16();
	}
},
"Encode@sukororoom":{
	pzlimport : function(type){
		this.decodeBorder();
		this.decodeNumber10();
	},
	pzlexport : function(type){
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

		if( (pid!=='sukororoom') && !this.checkAdjacentDiffNumber() ){ return 60101;}

		if(pid==='sukororoom'){
			var rinfo = bd.getRoomInfo();
			if( !this.checkDiffNumberInRoom(rinfo) ){ return 30421;}
			if( !this.checkNumberOrNotInRoom(rinfo) ){ return 31003;}
		}

		if( (pid!=='view') && !this.checkDir4NumberCount() ){ return 69201;}
		if( (pid==='view') && !this.checkViewNumber() ){ return 69211;}

		var numinfo = bd.getNumberInfo();
		if( !this.checkOneArea(numinfo) ){ return 10009;}

		if( !this.checkNoSuspendCell() ){ return 50181;}

		return 0;
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
				if(this.inAutoCheck){ return false;}
				cell.seterr(1);
				clist.seterr(2);
				result = false;
			}
		}
		return result;
	}
}
});
