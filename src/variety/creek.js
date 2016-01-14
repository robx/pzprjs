//
// パズル固有スクリプト部 クリーク版 creek.js
//
(function(pidlist, classbase){
	if(typeof module==='object' && module.exports){module.exports = [pidlist, classbase];}
	else{ pzpr.classmgr.makeCustom(pidlist, classbase);}
}(
['creek'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	use : true,

	mouseinput : function(){
		if(this.puzzle.playmode){
			if(this.mousestart || this.mousemove){ this.inputcell();}
		}
		else if(this.puzzle.editmode){
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

AreaUnshadeGraph:{
	enabled : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	margin : 0.50,

	bgcellcolor_func : "qans1",

	qanscolor : "rgb(96, 96, 96)",

	crosssize : 0.35,

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
		var oldflag = ((type===1 && !this.checkpflag("c")) || (type===0 && this.checkpflag("d")));
		if(!oldflag){ this.decode4Cross();}
		else        { this.decodecross_old();}
	},
	encodePzpr : function(type){
		if(type===1){ this.outpflag = 'c';}
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
	checklist : [
		"checkShadeOverNum",
		"checkConnectUnshade",
		"checkShadeLessNum"
	],

	checkShadeOverNum : function(){ this.checkQnumCross(1, "crShadeGt");},
	checkShadeLessNum : function(){ this.checkQnumCross(2, "crShadeLt");},
	checkQnumCross : function(type, code){
		var bd = this.board;
		for(var c=0;c<bd.cross.length;c++){
			var cross = bd.cross[c], qn = cross.qnum;
			if(qn<0){ continue;}

			var bx=cross.bx, by=cross.by;
			var clist = bd.cellinside(bx-1,by-1,bx+1,by+1);
			var cnt = clist.filter(function(cell){ return cell.isShade();}).length;
			if((type===1 && qn>=cnt) || (type===2 && qn<=cnt)){ continue;}
			
			this.failcode.add(code);
			if(this.checkOnly){ break;}
			cross.seterr(1);
		}
	}
},

FailCode:{
	crShadeGt : ["数字のまわりにある黒マスの数が間違っています。","The number of shaded cells around a number on crossing is big."],
	crShadeLt : ["数字のまわりにある黒マスの数が間違っています。","The number of shaded cells around a number on crossing is small."]
}
}));
