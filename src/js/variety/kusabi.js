//
// パズル固有スクリプト部 クサビリンク版 kusabi.js v3.4.1
//
pzpr.classmgr.makeCustom(['kusabi'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.owner.playmode){
			if(this.btn.Left){
				if(this.mousestart || this.mousemove){ this.inputLine();}
				else if(this.mouseend && this.notInputted()){ this.inputpeke();}
			}
			else if(this.btn.Right){
				if(this.mousestart || this.mousemove){ this.inputpeke();}
			}
		}
		else if(this.owner.editmode){
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
	numberAsObject : true,

	maxnum : 3
},
Board:{
	hasborder : 1
},

LineManager:{
	isCenterLine : true
},

AreaLineManager:{
	enabled : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	hideHatena : true,

	gridcolor_type : "LIGHT",
	circleratio : [0.45, 0.40],

	paint : function(){
		this.drawBGCells();
		this.drawGrid();

		this.drawPekes();
		this.drawLines();

		this.drawCircles();
		this.drawNumbers();

		this.drawChassis();

		this.drawTarget();
	},

	drawNumber1 : function(cell){
		var text = {1:"同",2:"短",3:"長"}[cell.qnum] || "";
		var px = cell.bx*this.bw, py = cell.by*this.bh;
		var option = { key: "cell_text_"+cell.id };
		option.ratio = [0.65];
		this.disptext(text, px, py, option);
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodeNumber10();
	},
	encodePzpr : function(type){
		this.encodeNumber10();
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCellQnum();
		this.decodeBorderLine();
	},
	encodeData : function(){
		this.encodeCellQnum();
		this.encodeBorderLine();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){
		if( !this.checkLineCount(3) ){ return 'lnBranch';}
		if( !this.checkLineCount(4) ){ return 'lnCross';}

		var linfo = this.owner.board.getLareaInfo();
		if( !this.checkTripleObject(linfo) ){ return 'lcTripleNum';}
		if( !this.checkLineOverLetter() ){ return 'lcOnNum';}

		var xinfo = this.getErrorFlag_line();
		if( !this.checkErrorFlag_line(xinfo,7) ){ return 'lcNotKusabi';}
		if( !this.checkErrorFlag_line(xinfo,6) ){ return 'lcInvalid';}
		if( !this.checkErrorFlag_line(xinfo,5) ){ return 'lcCurveGt2';}
		if( !this.checkErrorFlag_line(xinfo,4) ){ return 'lcCurveLt2';}
		if( !this.checkErrorFlag_line(xinfo,3) ){ return 'lcLenInvNe';}
		if( !this.checkErrorFlag_line(xinfo,2) ){ return 'lcLenInvDiff';}
		if( !this.checkErrorFlag_line(xinfo,1) ){ return 'lcDeadEnd';}

		if( !this.checkDisconnectLine(linfo) ){ return 'lcIsolate';}

		if( !this.checkAloneCircle() ){ return 'nmIsolate';}

		return null;
	},
	check1st : function(){
		return (this.checkAloneCircle() ? null : 'nmIsolate');
	},

	checkAloneCircle : function(){
		return this.checkAllCell(function(cell){ return (cell.lcnt===0 && cell.isNum());});
	},

	isErrorFlag_line : function(xinfo){
		var path=xinfo.path[xinfo.max], ccnt=path.ccnt, length=path.length;
		var cell1=path.cells[0], cell2=path.cells[1], dir1=path.dir1, dir2=path.dir2;

		var qn1=cell1.qnum, qn2=(!cell2.isnull ? cell2.qnum : -1), err=0;
		if(ccnt===2 && dir1!==dir2){ err=7;}
		else if(!cell2.isnull && ccnt===2 && !((qn1===1&&qn2===1) || (qn1===2&&qn2===3) || (qn1===3&&qn2===2) || qn1===-2 || qn2===-2)){ err=6;}
		else if(ccnt>2){ err=5;}
		else if(!cell2.isnull && ccnt<2){ err=4;}
		else if(!cell2.isnull && ccnt===2 && (qn1===1||qn2===1) && length[0]!==length[2]){ err=3;}
		else if(!cell2.isnull && ccnt===2 && (((qn1===2||qn2===3) && length[0]>=length[2]) || ((qn1===3||qn2===2) && length[0]<=length[2]))){ err=2;}
		else if( cell2.isnull){ err=1;}
		path.error = err;
	}
},

FailCode:{
	lcOnNum : ["○の上を線が通過しています。","A line goes through a circle."],
	lcIsolate : ["○につながっていない線があります。","A line doesn't connect any circle."],
	lcTripleNum : ["3つ以上の○が繋がっています。","Three or more objects are connected."],
	lcNotKusabi : ["丸がコの字型に繋がっていません。","The shape of a line is not correct."],
	lcInvalid  : ["繋がる丸が正しくありません。","The type of connected circle is wrong."],
	lcCurveGt2 : ["線が2回以上曲がっています。","A line turns twice or more."],
	lcCurveLt2 : ["線が2回曲がっていません。","A line turns only once or lower."],
	lcLenInvNe : ["線の長さが同じではありません。","The length of lines is differnet."],
	lcLenInvDiff : ["線の長短の指示に反してます。","The length of lines is not suit for the label of object."],
	nmIsolate : ["どこにもつながっていない○があります。","A circle is not connected another object."]
}
});
