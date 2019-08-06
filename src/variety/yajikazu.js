//
// パズル固有スクリプト部 やじさんかずさん版 yajikazu.js
//
(function(pidlist, classbase){
	if(typeof module==='object' && module.exports){module.exports = [pidlist, classbase];}
	else{ pzpr.classmgr.makeCustom(pidlist, classbase);}
}(
['yajikazu'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	RBShadeCell : true,
	use    : true,
	inputModes : {edit:['number','direc','clear','info-blk'],play:['shade','unshade','info-blk']},
	mouseinput_auto : function(){
		if(this.puzzle.playmode){
			if(this.mousestart || this.mousemove){ this.inputcell();}
		}
		else if(this.puzzle.editmode){
			if(this.mousestart || this.mousemove){
				if(this.notInputted()){ this.inputdirec();}
			}
			else if(this.mouseend && this.notInputted()){
				if(this.prevPos.getc()===this.getcell()){ this.inputqnum();}
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
Cell:{
	minnum : 0
},

BoardExec:{
	adjustBoardData : function(key,d){
		this.adjustNumberArrow(key,d);
	}
},

AreaUnshadeGraph:{
	enabled : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	enablebcolor : true,
	bgcellcolor_func : "qsub1",

	fontShadecolor : "rgb(96,96,96)",

	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();
		this.drawShadedCells();

		this.drawArrowNumbers();

		this.drawChassis();

		this.drawTarget();
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodeArrowNumber16();
	},
	encodePzpr : function(type){
		this.encodeArrowNumber16();
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCellDirecQnum();
		this.decodeCellAns();
	},
	encodeData : function(){
		this.encodeCellDirecQnum();
		this.encodeCellAns();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checklist : [
		"checkShadeCellExist",
		"checkAdjacentShadeCell",
		"checkConnectUnshadeRB",
		"checkArrowNumber"
	],

	checkArrowNumber : function(){
		var bd = this.board;
		for(var c=0;c<bd.cell.length;c++){
			var cell = bd.cell[c];
			if(!cell.isValidNum() || cell.qdir===0 || cell.isShade()){ continue;}
			var pos = cell.getaddr(), dir = cell.qdir;
			var clist = new this.klass.CellList();
			while(1){
				pos.movedir(dir,2);
				var cell2 = pos.getc();
				if(cell2.isnull){ break;}
				clist.add(cell2);
			}
			if(cell.qnum===clist.filter(function(cell){ return cell.isShade();}).length){ continue;}

			this.failcode.add("anShadeNe");
			if(this.checkOnly){ break;}
			cell.seterr(1);
			clist.seterr(1);
		}
	}
}
}));
