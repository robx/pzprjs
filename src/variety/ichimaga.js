//
// パズル固有スクリプト部 イチマガ・磁石イチマガ・一回曲がって交差もするの版 ichimaga.js v3.4.1
//
pzpr.classmgr.makeCustom(['ichimaga','ichimagam','ichimagax'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.puzzle.playmode){
			if(this.btn.Left){
				if(this.mousestart || this.mousemove){ this.inputLine();}
				else if(this.mouseend && this.notInputted()){ this.inputpeke();}
			}
			else if(this.btn.Right){
				if(this.mousestart || this.mousemove){ this.inputpeke();}
			}
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
	maxnum : 4
},

Board:{
	hasborder : 1
},

LineGraph:{
	enabled : true,
	isLineCross : true,
	makeClist : true,

	iscrossing : function(cell){ return cell.noNum();}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	hideHatena : true,

	irowake : true,

	gridcolor_type : "LIGHT",

	fontErrcolor : "black", /* fontcolorと同じ */

	globalfontsizeratio : 0.85,

	paint : function(){
		this.drawBGCells();
		this.drawDashedCenterLines();
		this.drawLines();

		this.drawPekes();

		this.drawCircles();
		this.drawNumbers();

		this.drawTarget();
	},

	repaintParts : function(blist){
		this.range.cells = blist.cellinside();

		this.drawCircles();
		this.drawNumbers();
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decode4Cell();

		if(this.pid==='ichimaga'){
			if     (this.checkpflag("m")){ this.puzzle.changepid("ichimagam");}
			else if(this.checkpflag("x")){ this.puzzle.changepid("ichimagax");}
			else                         { this.puzzle.changepid("ichimaga"); }
		}
	},
	encodePzpr : function(type){
		this.encode4Cell();
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		var pzlflag = this.readLine();
		if(this.pid==='ichimaga'){
			if     (pzlflag==="mag")  { this.puzzle.changepid("ichimagam");}
			else if(pzlflag==="cross"){ this.puzzle.changepid("ichimagax");}
			else                      { this.puzzle.changepid("ichimaga"); }
		}

		this.decodeCellQnum();
		this.decodeBorderLine();
	},
	encodeData : function(){
		if     (this.pid==="ichimagam"){ this.datastr+="mag\n";}
		else if(this.pid==="ichimagax"){ this.datastr+="cross\n";}
		else                           { this.datastr+="def\n";}

		this.encodeCellQnum();
		this.encodeBorderLine();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checklist : [
		"checkBranchConnectLine",
		"checkCrossConnectLine@!ichimagax",
		"checkConnectSameNum@ichimagam",
		"checkCurveCount",
		"checkConnectAllNumber",
		"checkLineShapeDeadend",

		"checkOutgoingLine",
		"checkNoLineObject"
	],

	checkOutgoingLine : function(){
		this.checkAllCell(function(cell){ return (cell.isValidNum() && cell.qnum!==cell.lcnt);}, "nmLineNe");
	},

	checkConnectSameNum : function(){
		this.checkLineShape(function(path){ return path.cells[0].qnum!==-2 && path.cells[0].qnum===path.cells[1].qnum;}, "lcSameNum");
	},
	checkCurveCount : function(){
		this.checkLineShape(function(path){ return !path.cells[1].isnull && path.ccnt>1;}, "lcCurveGt1");
	}
},

FailCode:{
	nmNoLine : ["○から線が出ていません。","A circle doesn't start any line."],
	nmLineNe : ["○から出る線の本数が正しくありません。", "The number is not equal to the number of lines out of the circle."],
	lcSameNum : ["同じ数字同士が線で繋がっています。", "Same numbers are connected each other."],
	lcCurveGt1 : ["線が2回以上曲がっています。", "The number of curves is twice or more."]
}
});
