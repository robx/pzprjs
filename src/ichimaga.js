//
// パズル固有スクリプト部 イチマガ・磁石イチマガ・一回曲がって交差もするの版 ichimaga.js v3.4.0
//
pzprv3.createCustoms('ichimaga', {
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
	isborder : 1
},

LineManager:{
	isCenterLine : true
},

AreaLineManager:{
	enabled : true
},

Flags:{
	irowake : 1
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	bdmargin       : 0.50,
	bdmargin_image : 0.10,

	hideHatena : true,

	setColors : function(){
		this.gridcolor = this.gridcolor_LIGHT;

		this.fontErrcolor = this.fontcolor;
		this.fontsizeratio = 0.85;
		this.circleratio = [0.38, 0.38];
	},
	paint : function(){
		this.drawDashedCenterLines();
		this.drawLines();

		this.drawPekes();

		this.drawCirclesAtNumber();
		this.drawNumbers();

		this.drawTarget();
	},

	repaintParts : function(blist){
		this.range.cells = blist.cellinside();

		this.drawCirclesAtNumber();
		this.drawNumbers();
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		this.decode4Cell();

		if(this.owner.pid==='ichimaga'){
			if     (this.checkpflag("m")){ this.owner.pid="ichimagam";}
			else if(this.checkpflag("x")){ this.owner.pid="ichimagax";}
			else                         { this.owner.pid="ichimaga"; }
		}
	},
	pzlexport : function(type){
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

		if( !this.checkLcntCell_firefly(3) ){ return 40201;}
		if( (this.owner.pid!=='ichimagax') && !this.checkLcntCell_firefly(4) ){ return 40301;}

		var xinfo = this.getErrorFlag_line();
		if( !this.checkErrorFlag_line(xinfo,3) ){ return 48111;}
		if( !this.checkErrorFlag_line(xinfo,2) ){ return 48121;}

		this.performAsLine = true
		var linfo = this.owner.board.getLareaInfo();
		if( !this.checkOneArea(linfo) ){ return 43601;}

		if( !this.checkErrorFlag_line(xinfo,1) ){ return 43401;}

		if( !this.checkLineCount() ){ return 48101;}

		if( !this.checkNoLineObject() ){ return 50411;}

		return 0;
	},

	checkLcntCell_firefly : function(val){
		if(this.owner.board.lines.ltotal[val]==0){ return true;}
		return this.checkAllCell(function(cell){ return (cell.noNum() && cell.lcnt()==val);});
	},
	checkNoLineObject : function(){
		return this.checkAllCell(function(cell){ return (cell.isNum() && cell.lcnt()===0);});
	},
	checkLineCount : function(){
		return this.checkAllCell(function(cell){ return (cell.isValidNum() && cell.getQnum()!==cell.lcnt());});
	},

	isErrorFlag_line : function(xinfo){
		var room=xinfo.room[xinfo.max], ccnt=room.ccnt, length=room.length;
		var cell1=room.cells[0], cell2=room.cells[1];

		var qn1=cell1.getQnum(), qn2=(!cell2.isnull?cell2.getQnum():-1), err=0;
		if((this.owner.pid==='ichimagam') && qn1!==-2 && qn1===qn2){ err=3;}
		else if(!cell2.isnull && ccnt>1){ err=2;}
		else if( cell2.isnull){ err=1;}
		room.error = err;
	}
}
});
