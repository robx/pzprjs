//
// パズル固有スクリプト部 ヤジタタミ版 yajitatami.js v3.4.0
//
(function(){

var k = pzprv3.consts;

pzprv3.createCustoms('yajitatami', {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputedit : function(){
		if(this.mousestart || this.mousemove){
			if(this.mousestart){ this.checkBorderMode();}

			if(this.bordermode){ this.inputborder();}
			else               { this.inputdirec();}
		}
		else if(this.mouseend && this.notInputted()){
			this.inputqnum();
		}
	},
	inputplay : function(){
		if(this.mousestart || this.mousemove){
			if     (this.btn.Left) { this.inputborderans();}
			else if(this.btn.Right){ this.inputQsubLine();}
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
	},

	enablemake_p : true,
	paneltype    : 10
},

//---------------------------------------------------------
// 盤面管理系
Board:{
	qcols : 8,
	qrows : 8,

	isborder : 1
},

AreaManager:{
	hasroom : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	setColors : function(){
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
	pzlimport : function(type){
		this.decodeArrowNumber16();
		this.decodeBorder();
	},
	pzlexport : function(type){
		this.encodeArrowNumber16();
		this.encodeBorder_if_exist();
	},

	encodeBorder_if_exist : function(){
		for(var id=0;id<bd.bdmax;id++){
			if(bd.border[id].ques===1){ this.encodeBorder(); break;}
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

		if( !this.checkLcntCross(4,0) ){
			this.setAlert('十字の交差点があります。','There is a crossing border line.'); return false;
		}

		var rinfo = bd.areas.getRoomInfo();
		if( !this.checkArrowNumber_border() ){
			this.setAlert('矢印の方向に境界線がありません。','There is no border in front of the arrowed number.'); return false;
		}

		if( !this.checkAllArea(rinfo, function(w,h,a,n){ return (a>1);} ) ){
			this.setAlert('長さが１マスのタタミがあります。','The length of the tatami is one.'); return false;
		}

		if( !this.checkArrowNumber_tatami() ){
			this.setAlert('矢印の方向にあるたたみの数が正しくありません。','The number of tatamis are not correct.'); return false;
		}

		if( !this.checkAllArea(rinfo, function(w,h,a,n){ return (n<0||n===a);}) ){
			this.setAlert('数字とタタミの大きさが違います。','The size of the tatami and the number is different.'); return false;
		}

		if( !this.checkAllArea(rinfo, function(w,h,a,n){ return (w===1||h===1);} ) ){
			this.setAlert('幅が１マスではないタタミがあります。','The width of the tatami is not one.'); return false;
		}

		return true;
	},

	checkArrowNumber_tatami : function(){
		var result = true;
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
				if(this.inAutoCheck){ return false;}
				cell.seterr(1);
				result = false;
			}
		}
		return result;
	},

	checkArrowNumber_border : function(){
		var result = true;
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c], dir = cell.getQdir();
			if(!cell.isValidNum() || !dir){ continue;}

			if(!cell.getaddr().movedir(dir,1).getb().isBorder()){
				if(this.inAutoCheck){ return false;}
				cell.seterr(1);
				result = false;
			}
		}
		return result;
	}
}
});

})();
