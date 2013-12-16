//
// パズル固有スクリプト部 ヤジタタミ版 yajitatami.js v3.4.0
//

pzpr.createCustoms('yajitatami', {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.owner.playmode){
			if(this.mousestart || this.mousemove){
				if(this.btn.Left){
					if(this.mousestart){ this.checkBorderMode();}

					if(this.bordermode){ this.inputborder();}
					else               { this.inputQsubLine();}
				}
				else if(this.btn.Right){ this.inputQsubLine();}
			}
		}
		else if(this.owner.editmode){
			if(this.mousestart || this.mousemove){
				if(this.mousestart){ this.checkBorderMode();}

				if(this.bordermode){ this.inputborder();}
				else               { this.inputdirec();}
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
		if(this.isSHIFT){ return false;}
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
	qcols : 8,
	qrows : 8,

	isborder : 1
},

AreaRoomManager:{
	enabled : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	initialize : function(){
		this.Common.prototype.initialize.call(this);

		this.gridcolor = this.gridcolor_DLIGHT;
		this.setBorderColorFunc('qans');
	},
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
		for(var id=0;id<this.owner.board.bdmax;id++){
			if(this.owner.board.border[id].ques===1){ this.encodeBorder(); break;}
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
	checkAns : function(){

		if( !this.checkBorderCount(4,0) ){ return 'bdCross';}
		if( !this.checkArrowNumber_border() ){ return 'arNoAdjBd';}

		var rinfo = this.owner.board.getRoomInfo();
		if( !this.checkTatamiLength(rinfo) ){ return 'bkSize1';}
		if( !this.checkArrowNumber_tatami() ){ return 'anTatamiNe';}
		if( !this.checkTatamiSize(rinfo) ){ return 'bkSizeNe';}
		if( !this.checkTatamiBreadth(rinfo) ){ return 'bkWidthGt1';}

		return null;
	},

	checkTatamiLength : function(rinfo){
		return this.checkAllArea(rinfo, function(w,h,a,n){ return (a>1);});
	},
	checkTatamiSize : function(rinfo){
		return this.checkAllArea(rinfo, function(w,h,a,n){ return (n<0||n===a);});
	},
	checkTatamiBreadth : function(rinfo){
		return this.checkAllArea(rinfo, function(w,h,a,n){ return (w===1||h===1);});
	},

	checkArrowNumber_tatami : function(){
		var k = pzpr.consts;
		var result = true, bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c];
			if(!cell.isValidNum()){ continue;}

			var bx = cell.bx, by = cell.by, dir = cell.getQdir(), blist;
			if     (dir===k.UP){ blist = bd.borderinside(bx,bd.minby,bx,by);}
			else if(dir===k.DN){ blist = bd.borderinside(bx,by,bx,bd.maxby);}
			else if(dir===k.LT){ blist = bd.borderinside(bd.minbx,by,bx,by);}
			else if(dir===k.RT){ blist = bd.borderinside(bx,by,bd.maxbx,by);}
			else{ continue;}

			var count = blist.filter(function(border){ return border.isBorder();}).length;
			if(cell.getQnum()!==count){
				if(this.checkOnly){ return false;}
				cell.seterr(1);
				result = false;
			}
		}
		return result;
	},

	checkArrowNumber_border : function(){
		var result = true, bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c], dir = cell.getQdir();
			if(!cell.isValidNum() || !dir){ continue;}

			if(!cell.getaddr().movedir(dir,1).getb().isBorder()){
				if(this.checkOnly){ return false;}
				cell.seterr(1);
				result = false;
			}
		}
		return result;
	}
},

FailCode:{
	bkSizeNe   : ["数字とタタミの大きさが違います。","The size of tatami and the number written in Tatami is different."],
	bkSize1    : ["長さが１マスのタタミがあります。","The length of the tatami is one."],
	anTatamiNe : ["矢印の方向にあるタタミの数が正しくありません。","The number of tatamis are not correct."],
	arNoAdjBd  : ["矢印の方向に境界線がありません。","There is no border in front of the arrowed number."]
}
});
