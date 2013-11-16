//
// パズル固有スクリプト部 クリーク版 creek.js v3.4.0
//
pzpr.createCustoms('creek', {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.owner.playmode){
			if(this.mousestart || this.mousemove){ this.inputcell();}
		}
		else if(this.owner.editmode){
			if(this.mousestart){ this.inputcross();}
		}
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

AreaWhiteManager:{
	enabled : true
},

Flags:{
	use : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	margin : 0.50,

	initialize : function(){
		this.Common.prototype.initialize.call(this);

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
	decodePzpr : function(type){
		var oldflag = ((type==1 && !this.checkpflag("c")) || (type==0 && this.checkpflag("d")));
		if(!oldflag){ this.decode4Cross();}
		else        { this.decodecross_old();}
	},
	encodePzpr : function(type){
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

		if( !this.checkQnumCross(1) ){ return 10018;}
		var winfo = this.owner.board.getWCellInfo();
		if( !this.checkOneArea(winfo) ){ return 10007;}
		if( !this.checkQnumCross(2) ){ return 10019;}

		return 0;
	},

	checkQnumCross : function(type){
		var result = true, bd = this.owner.board;
		for(var c=0;c<bd.crossmax;c++){
			var cross = bd.cross[c], qn = cross.getQnum();
			if(qn<0){ continue;}

			var bx=cross.bx, by=cross.by;
			var clist = bd.cellinside(bx-1,by-1,bx+1,by+1);
			var cnt = clist.filter(function(cell){ return cell.isBlack();}).length;

			if((type===1 && qn<cnt) || (type===2 && qn>cnt)){
				if(this.checkOnly){ return false;}
				cross.seterr(1);
				result = false;
			}
		}
		return result;
	}
}
});
