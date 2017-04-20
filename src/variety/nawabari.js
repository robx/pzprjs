//
// パズル固有スクリプト部 なわばり・フォーセルズ・ファイブセルズ版 nawabari.js
//
(function(pidlist, classbase){
	if(typeof module==='object' && module.exports){module.exports = [pidlist, classbase];}
	else{ pzpr.classmgr.makeCustom(pidlist, classbase);}
}(
['nawabari','fourcells','fivecells'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputModes : {edit:['number','clear'],play:['border','subline']},
	mouseinput_auto : function(){
		if(this.puzzle.playmode){
			if(this.mousestart || this.mousemove){
				if(this.btn==='left' && this.isBorderMode()){ this.inputborder();}
				else{ this.inputQsubLine();}
			}
		}
		else if(this.puzzle.editmode){
			if(this.mousestart){ this.inputqnum();}
		}
	}
},
"MouseEvent@fivecells":{
	inputModes : {edit:['empty','number','clear'],play:['border','subline']},
	mouseinput_other : function(){
		if(this.inputMode==='empty'){ this.inputempty();}
	},
	inputempty : function(){
		var cell = this.getcell();
		if(cell.isnull || cell===this.mouseCell){ return;}

		if(this.inputData===null){ this.inputData = (cell.isEmpty()?0:7);}

		cell.setQues(this.inputData);
		cell.setQnum(-1);
		cell.drawaround();
		this.mouseCell = cell;
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true
},

"KeyEvent@fourcells,fivecells":{
	keyinput : function(ca){
		if(ca==='w'){ this.key_inputvalid(ca);}
		else{ this.key_inputqnum(ca);}
	},
	key_inputvalid : function(ca){
		if(ca==='w'){
			var cell = this.cursor.getc();
			if(!cell.isnull){
				cell.setQues(cell.ques!==7?7:0);
				cell.setNum(-1);
				cell.drawaround();
			}
		}
	}
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	getdir4BorderCount : function(){
		var cnt=0, cblist=this.getdir4cblist();
		for(var i=0;i<cblist.length;i++){
			var tcell=cblist[i][0], tborder=cblist[i][1];
			if(tcell.isnull || tcell.isEmpty() || tborder.isBorder()){ cnt++;}
		}
		return cnt;
	}
},
"Cell@nawabari":{
	maxnum : 4,
	minnum : 0
},
"Cell@fourcells":{
	maxnum : 3
},
"Cell@fivecells":{
	maxnum : 3,
	minnum : 0
},

"Border@fourcells,fivecells":{
	isGrid : function(){
		return (this.sidecell[0].isValid() && this.sidecell[1].isValid());
	},
	isBorder : function(){
		return ((this.qans>0) || this.isQuesBorder());
	},
	isQuesBorder : function(){
		return !!(this.sidecell[0].isEmpty()^this.sidecell[1].isEmpty());
	}
},

"Board@nawabari":{
	hasborder : 1
},
"Board@fourcells,fivecells":{
	hasborder : 2,

	initBoardSize : function(col,row){
		this.common.initBoardSize.call(this,col,row);

		var odd = (col*row)%(this.pid==='fivecells'?5:4);
		if(odd>=1){ this.getc(this.minbx+1,this.minby+1).ques=7;}
		if(odd>=2){ this.getc(this.maxbx-1,this.minby+1).ques=7;}
		if(odd>=3){ this.getc(this.minbx+1,this.maxby-1).ques=7;}
		if(odd>=4){ this.getc(this.maxbx-1,this.maxby-1).ques=7;}
	}
},

AreaRoomGraph:{
	enabled : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	gridcolor_type : "DLIGHT",

	numbercolor_func : "qnum",

	paint : function(){
		this.drawBGCells();

		if(this.pid==='nawabari'){
			this.drawDashedGrid();
			this.drawBorders();
		}
		else{
			this.drawValidDashedGrid();
			this.drawQansBorders();
			this.drawQuesBorders();
		}

		this.drawQuesNumbers();
		this.drawBorderQsubs();

		if(this.pid==='nawabari'){ this.drawChassis();}

		this.drawTarget();
	}
},
"Graphic@nawabari":{
	bordercolor_func : "qans"
},
"Graphic@fourcells,fivecells":{
	getQansBorderColor : function(border){
		if(border.qans===1){
			var err = border.error;
			if     (err=== 1){ return this.errcolor1;       }
			else if(err===-1){ return this.noerrcolor;      }
			else if(border.trial){ return this.trialcolor;  }
			else             { return this.qanscolor;       }
		}
		return null;
	},
	getQuesBorderColor : function(border){
		return (border.isQuesBorder() ? this.quescolor : null);
	},

	drawValidDashedGrid : function(){
		var g = this.vinc('grid_waritai', 'crispEdges', true);

		var dotmax   = this.cw/10+3;
		var dotCount = Math.max(this.cw/dotmax, 1);
		var dotSize  = this.cw/(dotCount*2);

		g.lineWidth = 1;
		g.strokeStyle = this.gridcolor;

		var blist = this.range.borders;
		for(var n=0;n<blist.length;n++){
			var border = blist[n];
			g.vid = "b_grid_wari_"+border.id;
			if(border.isGrid()){
				var px = border.bx*this.bw, py = border.by*this.bh;
				if(border.isVert()){ g.strokeDashedLine(px, py-this.bh, px, py+this.bh, [dotSize]);}
				else               { g.strokeDashedLine(px-this.bw, py, px+this.bw, py, [dotSize]);}
			}
			else{ g.vhide();}
		}
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodeFivecells();
	},
	encodePzpr : function(type){
		this.encodeFivecells();
	},

	// decode/encodeNumber10関数の改造版にします
	decodeFivecells : function(){
		var c=0, i=0, bstr = this.outbstr, bd = this.board;
		for(i=0;i<bstr.length;i++){
			var cell = bd.cell[c], ca = bstr.charAt(i);

			cell.ques = 0;
			if     (ca === '7')				 { cell.ques = 7;}
			else if(ca === '.')				 { cell.qnum = -2;}
			else if(this.include(ca,"0","9")){ cell.qnum = parseInt(ca,10);}
			else if(this.include(ca,"a","z")){ c += (parseInt(ca,36)-10);}

			c++;
			if(c >= bd.cell.length){ break;}
		}
		this.outbstr = bstr.substr(i);
	},
	encodeFivecells : function(){
		var cm="", count=0, bd = this.board;
		for(var c=0;c<bd.cell.length;c++){
			var pstr="", qn=bd.cell[c].qnum, qu=bd.cell[c].ques;

			if     (qu=== 7){ pstr = "7";}
			else if(qn===-2){ pstr = ".";}
			else if(qn!==-1){ pstr = qn.toString(10);} // 0～3
			else{ count++;}

			if(count===0){ cm += pstr;}
			else if(pstr || count===26){ cm+=((9+count).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm+=(9+count).toString(36);}

		this.outbstr += cm;
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCell( function(cell,ca){
			cell.ques = 0;
			if     (ca==="*"){ cell.ques = 7;}
			else if(ca==="-"){ cell.qnum = -2;}
			else if(ca!=="."){ cell.qnum = +ca;}
		});
		this.decodeBorderAns();
	},
	encodeData : function(){
		if(this.pid==='fourcells'){ this.filever=1;}
		this.encodeCell( function(cell){
			if     (cell.ques=== 7){ return "* ";}
			else if(cell.qnum===-2){ return "- ";}
			else if(cell.qnum>=  0){ return cell.qnum+" ";}
			else                   { return ". ";}
		});
		this.encodeBorderAns();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checklist : [
		"checkRoomRect@nawabari",
		"checkNoNumber@nawabari",
		"checkDoubleNumber@nawabari",
		"checkOverFourCells@fourcells",
		"checkOverFiveCells@fivecells",
		"checkdir4BorderAns",
		"checkBorderDeadend+",
		"checkLessFourCells@fourcells",
		"checkLessFiveCells@fivecells"
	],

	checkOverFourCells : function(){
		this.checkAllArea(this.board.roommgr, function(w,h,a,n){ return (a>=4);}, "bkSizeLt4");
	},
	checkLessFourCells : function(){
		this.checkAllArea(this.board.roommgr, function(w,h,a,n){ return (a<=4);}, "bkSizeGt4");
	},
	checkOverFiveCells : function(){
		this.checkAllArea(this.board.roommgr, function(w,h,a,n){ return (a>=5);}, "bkSizeLt5");
	},
	checkLessFiveCells : function(){
		this.checkAllArea(this.board.roommgr, function(w,h,a,n){ return (a<=5);}, "bkSizeGt5");
	},

	checkdir4BorderAns : function(){
		this.checkAllCell(function(cell){ return (cell.isValidNum() && cell.getdir4BorderCount()!==cell.qnum);}, "nmBorderNe");
	}
},

FailCode:{
	nmBorderNe : ["数字の周りにある境界線の本数が違います。","The number is not equal to the number of border lines around it."],
	bkNoNum   : ["数字の入っていない部屋があります。","A room has no numbers."],
	bkNumGe2  : ["1つの部屋に2つ以上の数字が入っています。","A room has plural numbers."],
	bkSizeLt4 : ["サイズが4マスより小さいブロックがあります。","The size of block is smaller than four."],
	bkSizeLt5 : ["サイズが5マスより小さいブロックがあります。","The size of block is smaller than five."],
	bkSizeGt4 : ["サイズが4マスより大きいブロックがあります。","The size of block is larger than four."],
	bkSizeGt5 : ["サイズが5マスより大きいブロックがあります。","The size of block is larger than five."]
}
}));
