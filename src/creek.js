//
// パズル固有スクリプト部 クリーク版 creek.js v3.4.0
//
pzprv3.createCustoms('creek', {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputedit : function(){
		if(this.mousestart){ this.inputcross();}
	},
	inputplay : function(){
		if(this.mousestart || this.mousemove){ this.inputcell();}
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,
	moveTarget : function(ca){ return this.moveTCross(ca);},

	keyinput : function(ca){
		this.key_inputcross(ca);
	},

	enablemake_p : true,
	paneltype    : 10
},

TargetCursor:{
	crosstype : true
},

//---------------------------------------------------------
// 盤面管理系
Cross:{
	maxnum : 4,
	minnum : 0
},
Board:{
	iscross : 2
},

AreaManager:{
	checkWhiteCell : true
},

Menu:{
	menufix : function(){
		this.addUseToFlags();
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	bdmargin       : 0.70,
	bdmargin_image : 0.50,

	setColors : function(){
		this.cellcolor = "rgb(96, 96, 96)";
		this.setBGCellColorFunc('qans1');

		this.crosssize = 0.35;
	},
	paint : function(){
		this.drawBGCells();
		this.drawDotCells(false);
		this.drawGrid();

		this.drawChassis();

		this.drawCrosses();
		this.drawTarget();
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		var oldflag = ((type==1 && !this.checkpflag("c")) || (type==0 && this.checkpflag("d")));
		if(!oldflag){ this.decode4Cross();}
		else        { this.decodecross_old();}
	},
	pzlexport : function(type){
		if(type==1){ this.outpflag = 'c';}
		this.encode4Cross();
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCrossNum();
		this.decodeCellAns();
	},
	encodeData : function(){
		this.encodeCrossNum();
		this.encodeCellAns();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.checkQnumCross(1) ){
			this.setAlert('数字のまわりにある黒マスの数が間違っています。','The number of black cells around a number on crossing is big.'); return false;
		}
		if( !this.checkOneArea( bd.areas.getWCellInfo() ) ){
			this.setAlert('白マスが分断されています。','White cells are devided.'); return false;
		}
		if( !this.checkQnumCross(2) ){
			this.setAlert('数字のまわりにある黒マスの数が間違っています。','The number of black cells around a number on crossing is small.'); return false;
		}

		return true;
	},

	checkQnumCross : function(type){
		var result = true;
		for(var c=0;c<bd.crossmax;c++){
			var cross = bd.cross[c], qn = cross.getQnum();
			if(qn<0){ continue;}

			var bx=cross.bx, by=cross.by;
			var clist = bd.cellinside(bx-1,by-1,bx+1,by+1);
			var cnt = clist.filter(function(cell){ return cell.isBlack();}).length;

			if((type===1 && qn<cnt) || (type===2 && qn>cnt)){
				if(this.inAutoCheck){ return false;}
				cross.seterr(1);
				result = false;
			}
		}
		return result;
	}
}
});
