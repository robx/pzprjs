//
// パズル固有スクリプト部 イチマガ・磁石イチマガ・一回曲がって交差もするの版 ichimaga.js v3.4.1
//
pzpr.classmgr.makeCustom(['ichimaga','ichimagam','ichimagax'], {
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
	maxnum : 4,

	iscrossing : function(){ return this.noNum();}
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

Flags:{
	irowake : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	hideHatena : true,

	initialize : function(){
		this.Common.prototype.initialize.call(this);

		this.gridcolor = this.gridcolor_LIGHT;

		this.fontErrcolor = this.fontcolor;
		this.globalfontsizeratio = 0.85;
	},
	paint : function(){
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

		if(this.owner.pid==='ichimaga'){
			if     (this.checkpflag("m")){ this.owner.pid="ichimagam";}
			else if(this.checkpflag("x")){ this.owner.pid="ichimagax";}
			else                         { this.owner.pid="ichimaga"; }
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
		if(this.owner.pid==='ichimaga'){
			if     (pzlflag=="mag")  { this.owner.pid="ichimagam";}
			else if(pzlflag=="cross"){ this.owner.pid="ichimagax";}
			else                     { this.owner.pid="ichimaga"; }
		}

		this.decodeCellQnum();
		this.decodeBorderLine();
	},
	encodeData : function(){
		if     (this.owner.pid==="ichimagam"){ this.datastr+="mag\n";}
		else if(this.owner.pid==="ichimagax"){ this.datastr+="cross\n";}
		else                                 { this.datastr+="def\n";}

		this.encodeCellQnum();
		this.encodeBorderLine();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.checkLineCount_firefly(3) ){ return 'lnBranch';}
		if( (this.owner.pid!=='ichimagax') && !this.checkLineCount_firefly(4) ){ return 'lnCross';}

		var xinfo = this.getErrorFlag_line();
		if( !this.checkErrorFlag_line(xinfo,3) ){ return 'lcSameNum';}
		if( !this.checkErrorFlag_line(xinfo,2) ){ return 'lcCurveGt1';}

		var linfo = this.owner.board.getLareaInfo();
		if( !this.checkOneLine(linfo) ){ return 'lcDivided';}

		if( !this.checkErrorFlag_line(xinfo,1) ){ return 'lcDeadEnd';}

		if( !this.checkOutgoingLine() ){ return 'nmLineNe';}

		if( !this.checkNoLineObject() ){ return 'nmIsolate';}

		return null;
	},

	/* 線のカウントはするが、○のある場所は除外する */
	checkLineCount_firefly : function(val){
		if(this.owner.board.lines.ltotal[val]==0){ return true;}
		return this.checkAllCell(function(cell){ return (cell.noNum() && cell.lcnt===val);});
	},
	checkNoLineObject : function(){
		return this.checkAllCell(function(cell){ return (cell.isNum() && cell.lcnt===0);});
	},
	checkOutgoingLine : function(){
		return this.checkAllCell(function(cell){ return (cell.isValidNum() && cell.qnum!==cell.lcnt);});
	},

	isErrorFlag_line : function(xinfo){
		var path=xinfo.path[xinfo.max], ccnt=path.ccnt, length=path.length;
		var cell1=path.cells[0], cell2=path.cells[1];

		var qn1=cell1.qnum, qn2=(!cell2.isnull ? cell2.qnum : -1), err=0;
		if((this.owner.pid==='ichimagam') && qn1!==-2 && qn1===qn2){ err=3;}
		else if(!cell2.isnull && ccnt>1){ err=2;}
		else if( cell2.isnull){ err=1;}
		path.error = err;
	}
},

FailCode:{
	nmIsolate : ["○から線が出ていません。","A circle doesn't start any line."],
	
	nmLineNe : ["○から出る線の本数が正しくありません。", "The number is not equal to the number of lines out of the circle."],
	lcSameNum : ["同じ数字同士が線で繋がっています。", "Same numbers are connected each other."],
	lcCurveGt1 : ["線が2回以上曲がっています。", "The number of curves is twice or more."]
}
});
