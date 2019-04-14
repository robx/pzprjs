//
// パズル固有スクリプト部 スリザーリンク・バッグ版 slither.js
//
(function(pidlist, classbase){
	if(typeof module==='object' && module.exports){module.exports = [pidlist, classbase];}
	else{ pzpr.classmgr.makeCustom(pidlist, classbase);}
}(
['bag'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	invertshade : true,

	inputModes : {edit:['number','clear'],play:['shade','unshade','peke','clear']},
	mouseinput_auto : function(){
		var puzzle = this.puzzle;
		if(puzzle.playmode){
			if(this.mousestart || this.mousemove){ this.inputcell();}
		}
		else if(puzzle.editmode){
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
Cell:{
	numberRemainsUnshaded : true,

	isUnshade : function(){
		return (!this.isnull && (this.qsub===1 || this.isNum()));
	},
	isShade : function(){
		return !this.isUnshade();
	},

	maxnum : function(){
		return this.board.cols+this.board.rows-1;
	},
	minnum : 2
},
Border:{
	isLine : function(){
		if(this.line>0){ return true;}
		return (this.sidecell[0].isUnshade()!==this.sidecell[1].isUnshade());
	}
},
Board:{
	hasborder : 2,
	borderAsLine : true
},

AreaUnshadeGraph:{
        relation : {'cell.qsub':'node'},
	enabled : true
},
AreaShadeGraph:{
        relation : {'cell.qsub':'node'},
	enabled : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	gridcolor_type : "DLIGHT",
	//bgcellcolor_func : "qsub1",
	numbercolor_func : "qnum",
	shadecolor : "rgb(60,60,60)",
	defaultshadecolor : "rgb(120,120,120)",
	trialshadecolor : "rgb(90,90,90)",
	lwratio : 20,
	linecolor : "black",
	margin : 0.5,
	flushmargin : 0.35,

	getShadedCellColor : function(cell){
		if(!cell.isShade()){ return null;}
		var info = cell.error || cell.qinfo;
		if     (info===1){ return this.errcolor1;}
		else if(info===2){ return this.errcolor2;}
		else if(cell.trial){ return this.trialshadecolor;}
		else if(cell.qans===1){ return this.shadecolor;}
		return this.defaultshadecolor;
	},

	paint : function(){
		this.drawShadedCells();
		//this.drawBGCells();
		this.drawDashedGrid(false);
		this.drawLines();
		this.drawQuesNumbers();
		this.drawPekes();
		this.drawTarget();
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodeNumber16();
	},
	encodePzpr : function(type){
		this.encodeNumber16();
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCellQnum();
		this.decodeCellQsub();
		this.decodeBorderLine();
	},
	encodeData : function(){
		this.encodeCellQnum();
		this.encodeCellQsub();
		this.encodeBorderLine();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checklist : [
		"checkConnectUnshade",
		"checkConnectShadeOutside",
		"checkViewOfNumber"
	],

	checkConnectShadeOutside : function(){
		var bd = this.board;
		for(var r=0;r<bd.sblkmgr.components.length;r++){
			var clist = bd.sblkmgr.components[r].clist;
			var d = clist.getRectSize();
			if(d.x1===bd.minbx+1||d.x2===bd.maxbx-1||d.y1===bd.minby+1||d.y2===bd.maxby-1){
				continue;
			}
			this.failcode.add("csConnOut");
			if(this.checkOnly){ break;}
			clist.seterr(1);
		}
	},

	checkViewOfNumber : function(){
		var bd = this.board;
		for(var cc=0;cc<bd.cell.length;cc++){
			var cell=bd.cell[cc];
			if(!cell.isValidNum()){ continue;}

			var clist = new this.klass.CellList(), adc = cell.adjacent, target;
			clist.add(cell);
			target=adc.left;   while(target.isUnshade()){ clist.add(target); target=target.adjacent.left;  }
			target=adc.right;  while(target.isUnshade()){ clist.add(target); target=target.adjacent.right; }
			target=adc.top;    while(target.isUnshade()){ clist.add(target); target=target.adjacent.top;   }
			target=adc.bottom; while(target.isUnshade()){ clist.add(target); target=target.adjacent.bottom;}

			if(cell.qnum===clist.length){ continue;}
			
			this.failcode.add("nmSumViewNe");
			if(this.checkOnly){ break;}
			clist.seterr(1);
		}
	}
},

FailCode:{
	csConnOut : ["", "Some shaded cells are not connected to the outside."],
	nmSumViewNe : ["数字と輪の内側になる4方向のマスの合計が違います。","The number and the sum of the inside cells of four direction is different."]
}
}));
