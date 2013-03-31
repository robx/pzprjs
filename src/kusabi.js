//
// パズル固有スクリプト部 クサビリンク版 kusabi.js v3.4.0
//
pzprv3.createCustoms('kusabi', {
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
	numberAsObject : true,

	maxnum : 3
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

//---------------------------------------------------------
// 画像表示系
Graphic:{
	hideHatena : true,

	setColors : function(){
		this.gridcolor = this.gridcolor_LIGHT;
		this.circleratio = [0.40, 0.40];
	},
	paint : function(){
		this.drawBGCells();
		this.drawGrid();

		this.drawPekes();
		this.drawLines();

		this.drawCirclesAtNumber();
		this.drawNumbers();

		this.drawChassis();

		this.drawTarget();
	},

	drawNumber1 : function(cell){
		var num = cell.qnum, key='cell_'+cell.id;
		if(num>=1 && num<=3){
			var text = ({1:"同",2:"短",3:"長"})[num];
			var px = cell.bx*this.bw, py = cell.by*this.bh;
			this.dispnum(key, 1, text, 0.65, this.fontcolor, px, py);
		}
		else{ this.hideEL(key);}
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		this.decodeNumber10();
	},
	pzlexport : function(type){
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
		this.performAsLine = true;

		if( !this.checkLcntCell(3) ){
			this.setAlert('分岐している線があります。','There is a branch line.'); return false;
		}
		if( !this.checkLcntCell(4) ){
			this.setAlert('線が交差しています。','There is a crossing line.'); return false;
		}

		var linfo = this.owner.board.getLareaInfo();
		if( !this.checkTripleNumber(linfo) ){
			this.setAlert('3つ以上の丸がつながっています。','Three or more objects are connected.'); return false;
		}
		if( !this.check2Line() ){
			this.setAlert('丸の上を線が通過しています。','A line goes through a circle.'); return false;
		}

		var xinfo = this.getErrorFlag_line();
		if( !this.checkErrorFlag_line(xinfo,7) ){
			this.setAlert('丸がコの字型に繋がっていません。','The shape of a line is not correct.'); return false;
		}
		if( !this.checkErrorFlag_line(xinfo,6) ){
			this.setAlert('繋がる丸が正しくありません。','The type of connected circle is wrong.'); return false;
		}
		if( !this.checkErrorFlag_line(xinfo,5) ){
			this.setAlert('線が2回以上曲がっています。','A line turns twice or more.'); return false;
		}
		if( !this.checkErrorFlag_line(xinfo,4) ){
			this.setAlert('線が2回曲がっていません。','A line turns only once or lower.'); return false;
		}
		if( !this.checkErrorFlag_line(xinfo,3) ){
			this.setAlert('線の長さが同じではありません。','The length of lines is differnet.'); return false;
		}
		if( !this.checkErrorFlag_line(xinfo,2) ){
			this.setAlert('線の長短の指示に反してます。','The length of lines is not suit for the label of object.'); return false;
		}
		if( !this.checkErrorFlag_line(xinfo,1) ){
			this.setAlert('途切れている線があります。','There is a dead-end line.'); return false;
		}

		if( !this.checkDisconnectLine(linfo) ){
			this.setAlert('丸につながっていない線があります。','A line doesn\'t connect any circle.'); return false;
		}

		if( !this.checkAllCell(function(cell){ return (cell.lcnt()===0 && cell.isNum());}) ){
			this.setAlert('どこにもつながっていない丸があります。','A circle is not connected another object.'); return false;
		}

		return true;
	},
	check1st : function(){ return this.checkAllCell(function(cell){ return (cell.lcnt()===0 && cell.isNum());});},

	check2Line : function(){ return this.checkLine(function(cell){ return (cell.lcnt()>=2 && cell.isNum());}); },
	checkLine : function(func){
		var result = true, bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c];
			if(func(cell)){
				if(this.inAutoCheck){ return false;}
				if(result){ bd.border.seterr(-1);}
				cell.setCellLineError(true);
				result = false;
			}
		}
		return result;
	},

	isErrorFlag_line : function(xinfo){
		var room=xinfo.room[xinfo.max], ccnt=room.ccnt, length=room.length;
		var cell1=room.cells[0], cell2=room.cells[1], dir1=room.dir1, dir2=room.dir2;

		var qn1=cell1.getQnum(), qn2=(!cell2.isnull?cell2.getQnum():-1), err=0;
		if(ccnt===2 && dir1!==dir2){ err=7;}
		else if(!cell2.isnull && ccnt===2 && !((qn1===1&&qn2===1) || (qn1===2&&qn2===3) || (qn1===3&&qn2===2) || qn1===-2 || qn2===-2)){ err=6;}
		else if(ccnt>2){ err=5;}
		else if(!cell2.isnull && ccnt<2){ err=4;}
		else if(!cell2.isnull && ccnt===2 && (qn1===1||qn2===1) && length[0]!==length[2]){ err=3;}
		else if(!cell2.isnull && ccnt===2 && (((qn1===2||qn2===3) && length[0]>=length[2]) || ((qn1===3||qn2===2) && length[0]<=length[2]))){ err=2;}
		else if( cell2.isnull){ err=1;}
		room.error = err;
	}
}
});
