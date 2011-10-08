//
// パズル固有スクリプト部 イチマガ・磁石イチマガ・一回曲がって交差もするの版 ichimaga.js v3.4.0
//
pzprv3.custom.ichimaga = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputedit : function(){
		if(this.mousestart){ this.inputqnum();}
	},
	inputplay : function(){
		if(this.mousestart || this.mousemove){
			if     (this.btn.Left) { this.inputLine();}
			else if(this.btn.Right){ this.inputpeke();}
		}
		else if(this.mouseend && this.notInputted()){
			if(this.btn.Left){ this.inputpeke();}
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

AreaManager:{
	lineToArea : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	bdmargin       : 0.50,
	bdmargin_image : 0.10,

	irowake : 1,

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

		this.drawPekes(0);

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
			this.owner.menu.displayDesign();
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
			this.owner.menu.displayDesign();
		}

		this.decodeCellQnum();
		this.decodeBorderLine();
	},
	encodeData : function(){
		if     (this.owner.pid==="ichimagam"){ this.datastr+="mag/";}
		else if(this.owner.pid==="ichimagax"){ this.datastr+="cross/";}
		else                                 { this.datastr+="def/";}

		this.encodeCellQnum();
		this.encodeBorderLine();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.checkLcntCell_firefly(3) ){
			this.setAlert('分岐している線があります。', 'There is a branch line.'); return false;
		}
		if( (this.owner.pid!=='ichimagax') && !this.checkLcntCell_firefly(4) ){
			this.setAlert('線が交差しています。', 'There is a crossing line.'); return false;
		}

		var xinfo = this.getErrorFlag_line();
		if( !this.checkErrorFlag_line(xinfo,3) ){
			this.setAlert('同じ数字同士が線で繋がっています。', 'Same numbers are connected each other.'); return false;
		}
		if( !this.checkErrorFlag_line(xinfo,2) ){
			this.setAlert('線が2回以上曲がっています。', 'The number of curves is twice or more.'); return false;
		}

		this.performAsLine = true
		if( !this.checkOneArea( bd.areas.getLareaInfo() ) ){
			this.setAlert('線が全体で一つながりになっていません。', 'All lines and circles are not connected each other.'); return false;
		}

		if( !this.checkErrorFlag_line(xinfo,1) ){
			this.setAlert('線が途中で途切れています。', 'There is a dead-end line.'); return false;
		}

		if( !this.checkAllCell( function(cell){ return (cell.isValidNum() && cell.getQnum()!==cell.lcnt()); } ) ){
			this.setAlert('○から出る線の本数が正しくありません。', 'The number is not equal to the number of lines out of the circle.'); return false;
		}

		if( !this.checkAllCell( function(cell){ return( cell.isNum() && cell.lcnt()===0); } ) ){
			this.setAlert('○から線が出ていません。', 'There is a lonely circle.'); return false;
		}

		return true;
	},

	checkLcntCell_firefly : function(val){
		if(bd.lines.ltotal[val]==0){ return true;}
		return this.checkAllCell(function(cell){ return (cell.noNum() && cell.lcnt()==val);});
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
};
