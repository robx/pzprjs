//
// パズル固有スクリプト部 ぼんさん・へやぼん版 bonsan.js v3.4.0
//
pzprv3.createCustoms('bonsan', {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.owner.playmode){
			if(this.mousestart || this.mousemove){
				if(this.btn.Left){ this.inputLine();}
			}
			else if(this.mouseend && this.notInputted()){ this.inputlight();}
		}
		else if(this.owner.editmode){
			if(this.mousestart || this.mousemove){
				if(this.owner.pid==='heyabon'){ this.inputborder();}
			}
			else if(this.mouseend && this.notInputted()){ this.inputqnum();}
		}
	},

	inputlight : function(){
		var cell = this.getcell();
		if(cell.isnull){ return;}

		if     (cell.getQsub()===0){ cell.setQsub(this.btn.Left?1:2);}
		else if(cell.getQsub()===1){ cell.setQsub(this.btn.Left?2:0);}
		else if(cell.getQsub()===2){ cell.setQsub(this.btn.Left?0:1);}
		cell.draw();
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
	nummaxfunc : function(){
		return Math.max(this.owner.board.qcols,this.owner.board.qrows)-1;
	},
	minnum : 0,

	// 正答判定用
	base : null
},

Board:{
	qcols : 8,
	qrows : 8,

	isborder : 1
},

LineManager:{
	isCenterLine : true
},

AreaRoomManager:{
	enabled : true
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
		this.qsubcolor1 = "rgb(224, 224, 255)";
		this.qsubcolor2 = "rgb(255, 255, 144)";
		this.setBGCellColorFunc('qsub2');

		this.fontsizeratio = 0.9;	// 数字の倍率
		this.circleratio = [0.38, 0.38];
	},
	paint : function(){
		this.drawBGCells();
		this.drawGrid();
		if(this.owner.pid==='heyabon'){ this.drawBorders();}

		this.drawTip();
		this.drawLines();

		this.drawCirclesAtNumber();
		this.drawNumbers();

		this.drawChassis();

		this.drawTarget();
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		if(!this.checkpflag("c")){ this.decodeBorder();}
		this.decodeNumber16();

		this.checkPuzzleid();
	},
	pzlexport : function(type){
		if(type===1 || this.owner.pid==='heyabon'){ this.encodeBorder();}else{ this.outpflag="c";}
		this.encodeNumber16();
	},

	checkPuzzleid : function(){
		var o=this.owner, bd=o.board;
		if(o.pid==='bonsan'){
			for(var id=0;id<bd.bdmax;id++){
				if(bd.border[id].ques===1){ o.pid='heyabon'; break;}
			}
		}
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCellQnum();
		this.decodeCellQsub();
		this.decodeBorderQues();
		this.decodeBorderLine();

		this.owner.enc.checkPuzzleid();
	},
	encodeData : function(){
		this.encodeCellQnum();
		this.encodeCellQsub();
		this.encodeBorderQues();
		this.encodeBorderLine();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){
		var pid = this.owner.pid;

		this.performAsLine = true;
		if( !this.checkLcntCell(3) ){ return 40201;}
		if( !this.checkLcntCell(4) ){ return 40301;}
		this.performAsLine = false;

		var linfo = this.owner.board.getLareaInfo();
		if( !this.checkDoubleNumber(linfo) ){ return 30016;}
		if( !this.checkLineOverLetter() ){ return 43102;}

		if( !this.checkCurveLine(linfo) ){ return 20013;}

		if( !this.checkLineLength(linfo) ){ return 50401;}

		var rinfo = this.owner.board.getRoomInfo();
		this.owner.board.searchMovedPosition(linfo);
		if( (pid==='bonsan') && !this.checkFractal(rinfo) ){ return 30501;}
		if( (pid==='heyabon') && !this.checkFractal(rinfo) ){ return 30511;}
		if( (pid==='heyabon') && !this.checkNoCircleRoom(rinfo) ){ return 30025;}

		if( !this.checkNoLineCircle() ){ return 50411;}

		this.performAsLine = true;
		if( !this.checkDisconnectLine(linfo) ){ return 43202;}
		this.performAsLine = false;

		return 0;
	},

	checkCurveLine : function(linfo){
		return this.checkAllArea(linfo, function(w,h,a,n){ return (w===1||h===1);});
	},
	checkLineLength : function(linfo){
		return this.checkAllArea(linfo, function(w,h,a,n){ return (n<0||n===a-1);});
	},
	checkNoCircleRoom : function(rinfo){
		return this.checkNoObjectInRoom(rinfo, function(cell){ return cell.base.qnum;});
	},
	checkNoLineCircle : function(){
		return this.checkAllCell(function(cell){ return (cell.getQnum()>=1 && cell.lcnt()===0);});
	},

	checkFractal : function(rinfo, getval){
		for(var id=1;id<=rinfo.max;id++){
			var clist = rinfo.getclist(id), d = clist.getRectSize();
			d.xx=d.x1+d.x2, d.yy=d.y1+d.y2;
			for(var i=0;i<clist.length;i++){
				var cell = clist[i];
				if(cell.base.isNum() ^ this.owner.board.getc(d.xx-cell.bx, d.yy-cell.by).base.isNum()){
					clist.filter(function(cell){ return cell.base.isNum();}).seterr(1);
					return false;
				}
			}
		}
		return true;
	}
}
});
