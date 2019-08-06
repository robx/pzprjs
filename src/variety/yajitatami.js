//
// パズル固有スクリプト部 ヤジタタミ版 yajitatami.js
//
(function(pidlist, classbase){
	if(typeof module==='object' && module.exports){module.exports = [pidlist, classbase];}
	else{ pzpr.classmgr.makeCustom(pidlist, classbase);}
}(
['yajitatami'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputModes : {edit:['border','number','direc','clear'],play:['border','subline']},
	mouseinput_auto : function(){
		if(this.puzzle.playmode){
			if(this.mousestart || this.mousemove){
				if(this.btn==='left' && this.isBorderMode()){ this.inputborder();}
				else{ this.inputQsubLine();}
			}
		}
		else if(this.puzzle.editmode){
			if(this.mousestart || this.mousemove){
				if(this.isBorderMode()){ this.inputborder();}
				else                   { this.inputdirec();}
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
	moveTarget : function(ca){
		if(ca.match(/shift/)){ return false;}
		return this.moveTCell(ca);
	},

	keyinput : function(ca){
		if(this.key_inputdirec(ca)){ return;}
		this.key_inputqnum(ca);
	}
},

//---------------------------------------------------------
// 盤面管理系
Board:{
	cols : 8,
	rows : 8,

	hasborder : 1
},
BoardExec:{
	adjustBoardData : function(key,d){
		this.adjustNumberArrow(key,d);
	}
},

AreaRoomGraph:{
	enabled : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	gridcolor_type : "DLIGHT",

	bordercolor_func : "qans",
	numbercolor_func : "qnum",

	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();
		this.drawQansBorders();
		this.drawQuesBorders();

		this.drawArrowNumbers();

		this.drawBorderQsubs();

		this.drawChassis();

		this.drawTarget();
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodeArrowNumber16();
		this.decodeBorder();
	},
	encodePzpr : function(type){
		this.encodeArrowNumber16();
		this.encodeBorder_if_exist();
	},

	encodeBorder_if_exist : function(){
		for(var id=0;id<this.board.border.length;id++){
			if(this.board.border[id].ques===1){ this.encodeBorder(); break;}
		}
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCellDirecQnum();
		this.decodeBorderQues();
		this.decodeBorderAns();
	},
	encodeData : function(){
		this.encodeCellDirecQnum();
		this.encodeBorderQues();
		this.encodeBorderAns();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checklist : [
		"checkBorderCross",
		"checkArrowNumber_border",
		"checkTatamiLength",
		"checkArrowNumber_tatami",
		"checkNumberAndSize",
		"checkTatamiBreadth"
	],

	checkTatamiLength : function(){
		this.checkAllArea(this.board.roommgr, function(w,h,a,n){ return (a>1);}, "bkSize1");
	},
	checkTatamiBreadth : function(){
		this.checkAllArea(this.board.roommgr, function(w,h,a,n){ return (w===1||h===1);}, "bkWidthGt1");
	},

	checkArrowNumber_tatami : function(){
		var bd = this.board;
		for(var c=0;c<bd.cell.length;c++){
			var cell = bd.cell[c];
			if(!cell.isValidNum()){ continue;}

			var bx = cell.bx, by = cell.by, dir = cell.qdir, blist;
			if     (dir===cell.UP){ blist = bd.borderinside(bx,bd.minby,bx,by);}
			else if(dir===cell.DN){ blist = bd.borderinside(bx,by,bx,bd.maxby);}
			else if(dir===cell.LT){ blist = bd.borderinside(bd.minbx,by,bx,by);}
			else if(dir===cell.RT){ blist = bd.borderinside(bx,by,bd.maxbx,by);}
			else{ continue;}
			if(cell.qnum===blist.filter(function(border){ return border.isBorder();}).length){ continue;}

			this.failcode.add("anTatamiNe");
			if(this.checkOnly){ break;}
			cell.seterr(1);
		}
	},

	checkArrowNumber_border : function(){
		var bd = this.board;
		for(var c=0;c<bd.cell.length;c++){
			var cell = bd.cell[c], dir = cell.qdir;
			if(!cell.isValidNum() || !dir || cell.reldirbd(dir,1).isBorder()){ continue;}

			this.failcode.add("anNoAdjBd");
			if(this.checkOnly){ break;}
			cell.seterr(1);
		}
	}
},

FailCode:{
	bkSizeNe   : ["数字とタタミの大きさが違います。","The size of tatami and the number written in Tatami is different."],
	bkSize1    : ["長さが１マスのタタミがあります。","The length of the tatami is one."],
	anTatamiNe : ["矢印の方向にあるタタミの数が正しくありません。","The number of tatamis are not correct."],
	anNoAdjBd  : ["矢印の方向に境界線がありません。","There is no border in front of the arrowed number."]
}
}));
