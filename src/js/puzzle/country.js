//
// パズル固有スクリプト部 カントリーロード版 country.js v3.4.0
//
pzpr.createCustoms('country', {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.owner.playmode){
			if(this.mousestart || this.mousemove){
				if(this.btn.Left){ this.inputLine();}
			}
			else if(this.mouseend && this.notInputted()){
				this.inputMB();
			}
		}
		else if(this.owner.editmode){
			if(this.mousestart || this.mousemove){
				this.inputborder();
			}
			else if(this.mouseend && this.notInputted()){
				this.inputqnum();
			}
		}
	},
	inputRed : function(){ this.dispRedLine();}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	nummaxfunc : function(){
		return Math.min(this.maxnum, this.owner.board.rooms.getCntOfRoomByCell(this));
	}
},
Board:{
	hasborder : 1
},

LineManager:{
	isCenterLine : true
},

AreaRoomManager:{
	enabled : true,
	hastop : true
},

Flags:{
	redline : true,
	irowake : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	initialize : function(){
		this.Common.prototype.initialize.call(this);

		this.gridcolor = this.gridcolor_SLIGHT;
	},
	paint : function(){
		this.drawBGCells();
		this.drawNumbers();

		this.drawGrid();
		this.drawBorders();

		this.drawMBs();
		this.drawLines();

		this.drawChassis();

		this.drawTarget();
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodeBorder();
		this.decodeRoomNumber16();
	},
	encodePzpr : function(type){
		this.encodeBorder();
		this.encodeRoomNumber16();
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeAreaRoom();
		this.decodeCellQnum();
		this.decodeBorderLine();
		this.decodeCellQsub();
	},
	encodeData : function(){
		this.encodeAreaRoom();
		this.encodeCellQnum();
		this.encodeBorderLine();
		this.encodeCellQsub();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.checkLineCount(3) ){ return 'lnBranch';}
		if( !this.checkLineCount(4) ){ return 'lnCross';}

		var rinfo = this.owner.board.getRoomInfo();
		if( !this.checkRoom2(rinfo) ){ return 'lnPassTwice';}

		if( !this.checkRoadCount(rinfo) ){ return 'bkLineNe';}
		if( !this.checkNoRoadCountry(rinfo) ){ return 'bkNoLine';}

		if( !this.checkSideAreaGrass(rinfo) ){ return 'scNoLine';}

		if( !this.checkLineCount(1) ){ return 'lnDeadEnd';}

		if( !this.checkOneLoop() ){ return 'lnPlLoop';}

		return null;
	},

	checkRoadCount : function(rinfo){
		return this.checkLinesInArea(rinfo, function(w,h,a,n){ return (n<=0||n==a);});
	},
	checkNoRoadCountry : function(rinfo){
		return this.checkLinesInArea(rinfo, function(w,h,a,n){ return (a!=0);});
	},
	checkSideAreaGrass : function(rinfo){
		return this.checkSideAreaCell(rinfo, function(cell1,cell2){ return (cell1.lcnt()===0 && cell2.lcnt()===0);}, false);
	},

	checkRoom2 : function(rinfo){
		var result = true;
		for(var r=1;r<=rinfo.max;r++){
			var cnt=0, clist=rinfo.room[r].clist;
			for(var i=0;i<clist.length;i++){
				var cell=clist[i], border;
				border=cell.ub(); if(border.ques===1 && border.line===1){ cnt++;}
				border=cell.db(); if(border.ques===1 && border.line===1){ cnt++;}
				border=cell.lb(); if(border.ques===1 && border.line===1){ cnt++;}
				border=cell.rb(); if(border.ques===1 && border.line===1){ cnt++;}
			}
			if(cnt>2){
				if(this.checkOnly){ return false;}
				clist.seterr(1);
				result = false;
			}
		}
		return result;
	}
},

FailCode:{
	bkLineNe : ["数字のある国と線が通過するマスの数が違います。","the number of the cells that is passed any line in the country and the number written in the country is diffrerent."],
	scNoLine : ["線が通らないマスが、太線をはさんでタテヨコにとなりあっています。","the cells that is not passed any line are adjacent over border line."],
	lnPassTwice : ["線が１つの国を２回以上通っています。","A line passes a country twice or more."]
}
});
