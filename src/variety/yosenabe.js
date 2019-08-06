//
// パズル固有スクリプト部 よせなべ版 yosenabe.js
//
(function(pidlist, classbase){
	if(typeof module==='object' && module.exports){module.exports = [pidlist, classbase];}
	else{ pzpr.classmgr.makeCustom(pidlist, classbase);}
}(
['yosenabe'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputModes : {edit:['nabe','number','clear'],play:['line','peke','completion']},
	mouseinput_other : function(){
		if(this.inputMode==='nabe'){ this.inputNabe();}
	},
	mouseinput_auto : function(){
		if(this.puzzle.playmode){
			if(this.mousestart || this.mousemove){
				if     (this.btn==='left') { this.inputLine();}
				else if(this.btn==='right'){ this.inputpeke();}
			}
			else if(this.mouseend && this.notInputted()){ this.inputqcmp();}
		}
		else if(this.puzzle.editmode){
			if(this.mousestart || this.mousemove){
				if(this.btn==='right'){ this.inputNabe();}
			}
			else if(this.mouseend && this.notInputted()){
				this.inputqnum_yosenabe();
			}
		}
	},

	inputqcmp : function(){
		var cell = this.getcell();
		if(cell.isnull){ return;}
		var targetcell = (!this.puzzle.execConfig('dispmove') ? cell : cell.base),
			distance = 0.60,
			dx = this.inputPoint.bx-cell.bx, /* ここはtargetcellではなくcell */
			dy = this.inputPoint.by-cell.by;
		if(targetcell.isNum() && (this.inputMode==='completion' || (dx*dx+dy*dy<distance*distance))){
			targetcell.setQcmp(targetcell.qcmp===0 ? 1 : 0);
			cell.draw();
		}
	},

	inputNabe : function(){
		var cell = this.getcell();
		if(cell.isnull || cell===this.mouseCell){ return;}
		if(this.inputMode!=='nabe'){
			if(cell.isNum()){ this.inputqnum(); return;}
			else if(cell.qnum2!==-1){ this.inputqnum_yosenabe(); return;}
		}

		if(this.inputData===null){ this.inputData = (cell.ice()?0:6);}

		cell.setQues(this.inputData);
		cell.drawaround();
		this.mouseCell = cell;
	},

	inputqnum_yosenabe : function(){
		var cell = this.getcell();
		if(cell.isnull || cell===this.mouseCell){ return;}

		if(cell!==this.cursor.getc()){
			this.setcursor(cell);
		}
		else{
			this.inputnumber_yosenabe(cell);
		}
		this.mouseCell = cell;
	},
	inputnumber_yosenabe : function(cell){
		var max = cell.getmaxnum(), num, type, val=-1;

		if     (cell.qnum !==-1){ num=cell.qnum;  type=1;} /* ○数字 */
		else if(cell.qnum2!==-1){ num=cell.qnum2; type=2;} /* なべの数字 */
		else{ num=-1; type=(cell.ice()?2:1);}

		if(this.btn==='left'){
			if     (num===max){ val = -1;}
			else if(num===-1) { val = -2;}
			else if(num===-2) { val = 1;}
			else              { val = num+1;}
		}
		else if(this.btn==='right'){
			if     (num===-1){ val = max;}
			else if(num===-2){ val = -1;}
			else if(num=== 1){ val = -2;}
			else             { val = num-1;}
		}

		if     (type===1){ cell.setQnum(val);}
		else if(type===2){ cell.setQnum2(val);}

		cell.draw();
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,

	key_inputqnum_main : function(cell,ca){
		this.key_inputqnum_main_yosenabe(cell,ca);
	},
	key_inputqnum_main_yosenabe : function(cell,ca){
		if(ca==='q'||ca==='q1'||ca==='q2'){
			if(ca==='q') { ca = (cell.qnum!==-1?'q1':'q2');}
			if     (ca==='q1' && cell.qnum !==-1){ cell.setQnum2(cell.qnum); cell.setQnum(-1);  cell.draw();}
			else if(ca==='q2' && cell.qnum2!==-1){ cell.setQnum(cell.qnum2); cell.setQnum2(-1); cell.draw();}
		}
		else if(ca==='w'){
			cell.setQues(cell.ice()?0:6);
			cell.draw();
		}
		else{
			var cur = -1, type = 1;
			if     (cell.qnum !==-1){ cur=cell.qnum;  type=1;} /* ○数字 */
			else if(cell.qnum2!==-1){ cur=cell.qnum2; type=2;} /* なべの数字 */
			else{ type=(cell.ice()?2:1);}

			var val = this.getNewNumber(cell,ca,cur);
			if(val===null){ return;}

			if     (type===1){ cell.setQnum(val);}
			else if(type===2){ cell.setQnum2(val);}
			cell.draw();
			this.prev = cell;
		}
	}
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	isCmp : function(){ // 描画用
		return (!this.puzzle.execConfig('dispmove') ? this : this.base).qcmp===1;
	}
},
CellList:{
	getDeparture : function(){ return this.map(function(cell){ return cell.base;}).notnull();},
	getSumOfFilling : function(cond){
		var count = 0;
		for(var i=0,len=this.length;i<len;i++){
			if(this[i].base.isValidNum()){ count += this[i].base.qnum;}
		}
		return count;
	}
},
Board:{
	cols : 8,
	rows : 8,

	hasborder : 1,

	addExtraInfo : function(){
		this.icegraph = this.addInfoList(this.klass.AreaCrockGraph);
	}
},

LineGraph:{
	enabled : true,
	moveline : true
},
"AreaCrockGraph:AreaGraphBase":{
	enabled : true,
	relation : {'cell.ques':'node'},
	setComponentRefs : function(obj, component){ obj.icebarn = component;},
	getObjNodeList   : function(nodeobj){ return nodeobj.icebarnnodes;},
	resetObjNodeList : function(nodeobj){ nodeobj.icebarnnodes = [];},
	isnodevalid : function(cell){ return cell.ice();}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	hideHatena : true,

	gridcolor_type : "LIGHT",

	bgcellcolor_func : "icebarn",
	bordercolor_func : "ice",
	numbercolor_func : "move",
	circlefillcolor_func : "qcmp",
	icecolor : "rgb(224,224,224)",

	paint : function(){
		this.drawBGCells();
		this.drawGrid();
		this.drawBorders();

		this.drawTip();
		this.drawDepartures();
		this.drawLines();

		this.drawCircledNumbers();
		this.drawFillingNumBase();
		this.drawFillingNumbers();

		this.drawPekes();

		this.drawChassis();

		this.drawTarget();
	},

	drawFillingNumBase : function(){
		var g = this.vinc('cell_filling_back', 'crispEdges', true);
		var isdrawmove = this.puzzle.execConfig('dispmove');
		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i], color = this.getBGCellColor(cell);
			g.vid = "c_full_nb_"+cell.id;
			if(!!color && cell.qnum2!==-1 && isdrawmove && cell.isDestination()){
				var rx = (cell.bx-0.9)*this.bw-0.5, ry = (cell.by-0.9)*this.bh-0.5;
				g.fillStyle = color;
				g.fillRect(rx, ry, this.bw*0.8, this.bh*0.8);
			}
			else{ g.vhide();}
		}
	},
	drawFillingNumbers : function(){
		var g = this.vinc('cell_filling_number', 'auto');
		var isdrawmove = this.puzzle.execConfig('dispmove');
		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i], num = cell.qnum2, px = cell.bx*this.bw, py = cell.by*this.bh;
			g.vid = 'cell_fill_text_'+cell.id;
			if(num!==-1){
				var text = (num>0 ? ""+num : "?");
				var option = {style:"bold"};
				if(isdrawmove && cell.isDestination()){
					option.position = this.TOPLEFT;
					option.ratio = 0.4;
					option.width = [0.5, 0.33];
				}
				else{
					option.ratio = 0.6;
				}
				g.fillStyle = this.getQuesNumberColor(cell);
				this.disptext(text, px, py, option);
			}
			else{ g.vhide();}
		}
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodeIce();
		this.decodeNumber16_yosenabe();
	},
	encodePzpr : function(type){
		this.encodeIce();
		this.encodeNumber16_yosenabe();
	},

	decodeNumber16_yosenabe : function(){
		var c=0, i=0, bstr = this.outbstr, bd = this.board;
		for(i=0;i<bstr.length;i++){
			var cell = bd.cell[c], ca = bstr.charAt(i);

			if(this.include(ca,"0","9")||this.include(ca,"a","f"))
							   { cell.qnum = parseInt(ca,16);}
			else if(ca === '-'){ cell.qnum = parseInt(bstr.substr(i+1,2),16); i+=2;}
			else if(ca === '.'){ cell.qnum = -2;}
			else if(ca === 'i'){ cell.qnum2 = parseInt(bstr.substr(i+1,1),16); i+=1;}
			else if(ca === 'g'){ cell.qnum2 = parseInt(bstr.substr(i+1,2),16); i+=2;}
			else if(ca === 'h'){ cell.qnum2 = -2;}
			else if(ca >= 'j' && ca <= 'z'){ c += (parseInt(ca,36)-19);}

			c++;
			if(!bd.cell[c]){ break;}
		}
		this.outbstr = bstr.substr(i+1);
	},
	encodeNumber16_yosenabe : function(){
		var count=0, cm="", bd = this.board;
		for(var c=0;c<bd.cell.length;c++){
			var pstr = "", qn = bd.cell[c].qnum, qd = bd.cell[c].qnum2;

			if     (qn===-2          ){ pstr = ".";}
			else if(qn>=  0 && qn< 16){ pstr =       qn.toString(16);}
			else if(qn>= 16 && qn<256){ pstr = "-" + qn.toString(16);}
			else if(qd===-2          ){ pstr = "h";}
			else if(qd>=  0 && qd< 16){ pstr = "i" + qd.toString(16);}
			else if(qd>= 16 && qd<256){ pstr = "g" + qd.toString(16);}
			else{ count++;}

			if(count===0){ cm += pstr;}
			else if(pstr || count===17){ cm+=((18+count).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm+=(18+count).toString(36);}

		this.outbstr += cm;
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCell( function(cell,ca){
			if(ca.charAt(0)==='i'){ cell.ques=6; ca=ca.substr(1);}
			if(ca.charAt(0)==='o'){
				ca=ca.substr(1);
				if(!!ca){ cell.qnum=+ca;}
				else{ cell.qnum=-2;}
			}
			else if(!!ca&&ca!=='.'){ cell.qnum2=+ca;}
		});
		this.decodeBorderLine();
		if(this.filever>=1){
			this.decodeCellQsubQcmp();
		}
	},
	encodeData : function(){
		this.filever = 1;
		this.encodeCell( function(cell){
			var ca = "";
			if(cell.ques===6){ ca += "i";}
			if(cell.qnum!==-1){
				ca += "o";
				if(cell.qnum>=0){ ca += (""+cell.qnum);}
			}
			else if(cell.qnum2>0){ ca += (""+cell.qnum2);}

			return ((!!ca?ca:".")+" ");
		});
		this.encodeBorderLine();
		this.encodeCellQsubQcmp();
	},

	/* decode/encodeCellQsubの上位互換です */
	decodeCellQsubQcmp : function(){
		this.decodeCell( function(cell,ca){
			if(ca!=="0"){
				cell.qsub = +ca & 0x0f;
				cell.qcmp = +ca >> 4; // int
			}
		});
	},
	encodeCellQsubQcmp : function(){
		this.encodeCell( function(cell){
			return (cell.qsub + (cell.qcmp << 4))+" ";
		});
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checklist : [
		"checkLineExist+",
		"checkBranchLine",
		"checkCrossLine",

		"checkConnectObject",
		"checkLineOverLetter",

		"checkCurveLine",

		"checkQuesNumber",			// 問題のチェック
		"checkDoubleNumberInNabe",	// 問題のチェック

		"checkFillingCount",
		"checkNoFillingNabe",
		"checkFillingOutOfNabe",

		"checkDisconnectLine"
	],

	checkCurveLine : function(){
		this.checkAllArea(this.board.linegraph, function(w,h,a,n){ return (w===1||h===1);}, "laCurve");
	},
	checkQuesNumber : function(){
		this.checkAllCell(function(cell){ return (!cell.ice() && cell.qnum2!==-1);}, "bnIllegalPos");
	},

	checkDoubleNumberInNabe : function(){
		this.checkAllBlock(this.board.icegraph, function(cell){ return (cell.qnum2!==-1);}, function(w,h,a,n){ return (a<2);}, "bkDoubleBn");
	},
	checkNoFillingNabe : function(){
		this.checkNoMovedObjectInRoom(this.board.icegraph);
	},
	checkFillingOutOfNabe : function(){
		this.checkAllCell(function(cell){ return (cell.isDestination() && !cell.ice());}, "nmOutOfBk");
	},

	checkFillingCount : function(){
		var iareas = this.board.icegraph.components;
		for(var id=0;id<iareas.length;id++){
			var clist = iareas[id].clist, num = null;
			for(var i=0;i<clist.length;i++){
				var qd = clist[i].qnum2;
				if(qd!==-1){
					if(num!==null && num!==qd){ num=null; break;}
					num=qd;
				}
			}
			if(num===null){ continue;}

			var count = clist.getSumOfFilling();
			if(count===0 || num===count){ continue;}

			this.failcode.add("bkSumNeBn");
			if(this.checkOnly){ break;}
			clist.getDeparture().seterr(4);
			clist.seterr(1);
		}
	}
},

FailCode:{
	laOnNum      : ["具材の上を線が通過しています。","A line goes through a filling."],
	laIsolate    : ["具材につながっていない線があります。","A line doesn't connect any filling."],
	nmConnected  : ["具材が繋がっています。","There are connected fillings."],
	nmOutOfBk    : ["鍋に入っていない具材があります。","A filling isn't in a crock."],
	bnIllegalPos : ["鍋の外に数字が書いてあります。","There is a number out of a crock."],
	bkDoubleBn   : ["鍋に数字が２つ以上書いてあります。","There is two or more numbers in a crock."],
	bkSumNeBn    : ["具材の合計値が正しくありません。","Sum of filling is not equal to a crock."],
	bkNoNum      : ["具材のない鍋があります。","A crock has no circle."]
}
}));
