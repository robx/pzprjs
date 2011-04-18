//
// パズル固有スクリプト部 クリーク版 creek.js v3.4.0
//
pzprv3.custom.creek = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mousedown : function(){
		if(k.playmode){ this.inputcell();}
		else if(k.editmode){ this.inputcross();}
	},
	mousemove : function(){
		if(k.playmode){ this.inputcell();}
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,
	moveTarget : function(ca){ return this.moveTCross(ca);},

	keyinput : function(ca){
		this.key_inputcross(ca);
	}
},

KeyPopup:{
	paneltype  : 10,
	enablemake : true
},

TargetCursor:{
	crosstype : true
},

//---------------------------------------------------------
// 盤面管理系
Board:{
	iscross : 2,

	numzero : true,

	maxunm : 4
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

	hideHatena : true,

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
			var qn = bd.QnX(c);
			if(qn<0){ continue;}

			var bx=bd.cross[c].bx, by=bd.cross[c].by;
			var cnt=0, clist = bd.cellinside(bx-1,by-1,bx+1,by+1);
			for(var i=0;i<clist.length;i++){if(bd.isBlack(clist[i])){ cnt++;}}

			if((type===1 && qn<cnt) || (type===2 && qn>cnt)){
				if(this.inAutoCheck){ return false;}
				bd.sErX([c],1);
				result = false;
			}
		}
		return result;
	}
}
};
