//
// パズル固有スクリプト部 クサビリンク版 kusabi.js v3.4.0
//
pzprv3.createCustoms('kusabi', {
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
		this.performAsLine = true;

		if( !this.checkLcntCell(3) ){ return 40201;}
		if( !this.checkLcntCell(4) ){ return 40301;}

		var linfo = this.owner.board.getLareaInfo();
		if( !this.checkTripleNumber(linfo) ){ return 43302;}
		if( !this.checkLineOverLetter() ){ return 43102;}

		var xinfo = this.getErrorFlag_line();
		if( !this.checkErrorFlag_line(xinfo,7) ){ return 48201;}
		if( !this.checkErrorFlag_line(xinfo,6) ){ return 48211;}
		if( !this.checkErrorFlag_line(xinfo,5) ){ return 48221;}
		if( !this.checkErrorFlag_line(xinfo,4) ){ return 48231;}
		if( !this.checkErrorFlag_line(xinfo,3) ){ return 48241;}
		if( !this.checkErrorFlag_line(xinfo,2) ){ return 48251;}
		if( !this.checkErrorFlag_line(xinfo,1) ){ return 43401;}

		if( !this.checkDisconnectLine(linfo) ){ return 43202;}

		if( !this.checkAloneCircle() ){ return 43502;}

		return 0;
	},
	check1st : function(){
		return (this.checkAloneCircle() ? 0 : 43502);
	},

	checkAloneCircle : function(){
		return this.checkAllCell(function(cell){ return (cell.lcnt()===0 && cell.isNum());});
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
