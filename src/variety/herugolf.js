//
// パズル固有スクリプト部 ヘルゴルフ版 herugolf.js
//
(function(pidlist, classbase){
	if(typeof module==='object' && module.exports){module.exports = [pidlist, classbase];}
	else{ pzpr.classmgr.makeCustom(pidlist, classbase);}
}(
['herugolf'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputModes : {edit:['number','water','clear'],play:['line','peke']},
	mouseinput_other : function(){
		if(this.inputMode==='water'){ this.inputWater();}
	},
	mouseinput_auto : function(){
		if(this.puzzle.playmode){
			if(this.mousestart || this.mousemove){
				if     (this.btn==='left') { this.inputLine();}
				else if(this.btn==='right'){ this.inputpeke();}
			}
		}
		else if(this.puzzle.editmode){
			if(this.mousestart || this.mousemove){
				if(this.btn==='right'){ this.inputWater();}
			}
			else if(this.mouseend && this.notInputted()){
				this.inputqnum();
			}
		}
	},

	/* inputLine, inputautodarkはぼんさんのものと同じ */
	inputLine : function(){
		this.common.inputLine.call(this);

		/* "丸数字を移動表示しない"場合の背景色描画準備 */
		if(this.puzzle.execConfig('autocmp') && !this.puzzle.execConfig('dispmove') && !this.notInputted()){
			this.inputautodark();
		}
	},
	inputautodark : function(){
		/* 最後に入力した線を取得する */
		var opemgr = this.puzzle.opemgr, lastope = opemgr.lastope;
		if(lastope.group!=='border' || lastope.property!=='line'){ return;}
		var border = this.board.getb(lastope.bx, lastope.by);

		/* 線を引いた/消した箇所にある領域を取得 */
		var clist = new this.klass.CellList();
		Array.prototype.push.apply(clist, border.sideobj);
		clist = clist.notnull().filter(function(cell){ return cell.path!==null || cell.isNum();});

		/* 改めて描画対象となるセルを取得して再描画 */
		clist.each(function(cell){
			if(cell.path===null){ if(cell.isNum()){ cell.draw();}}
			else{ cell.path.clist.each(function(cell){ if(cell.isNum()){ cell.draw();}});}
		});
	},

	inputMoveLine : function(){
		var cell = this.getcell();
		if(cell.isnull){ return;}

		var cell0 = this.mouseCell, pos = cell.getaddr();
		/* 初回はこの中に入ってきます。 */
		if(this.mousestart && cell.isDestination()){
			this.mouseCell = cell;
			this.prevPos = pos;
			cell.draw();
		}
		/* 移動中の場合 */
		else if(this.mousemove && !cell0.isnull && !cell.isDestination()){
			var border = this.prevPos.getnb(pos);
			if(!border.isnull && ((!border.isLine() && cell.lcnt===0) || (border.isLine() && cell0.lcnt===1))){
				/* この条件を追加 */
				if(border.isLine() || border.sidecell[0].distance>0 || border.sidecell[1].distance>0){
					this.mouseCell = cell;
					this.prevPos = pos;
					if(!border.isLine()){ border.setLine();}else{ border.removeLine();}
					border.draw();
				}
			}
		}
	},

	inputWater : function(){
		var cell = this.getcell();
		if(cell.isnull || cell===this.mouseCell || cell.ques===31 || cell.qnum!==-1){ return;}

		if(this.inputData===null){ this.inputData = (cell.ice()?0:6);}

		cell.setQues(this.inputData);
		cell.drawaround();
		this.mouseCell = cell;
	},

	inputqnum_main : function(cell){	// オーバーライド
		if(cell.ice()){ return;}
		if(this.inputcell_herugolf(cell)){ return;}
		if(cell.ques!==0){ return;}

		this.common.inputqnum_main.call(this,cell);
	},
	inputcell_herugolf : function(cell){
		var val = null;
		/* inputqnum_mainの空白-?マーク間にHoleのフェーズを挿入する */
		if(cell.ques===31){
			if     (this.btn==='left') { val = -2;}
			else if(this.btn==='right'){ val = -1;}
		}
		else if(cell.ques===0 && cell.qnum===-1){
			if(this.btn==='left'){ val = -3;}
		}
		else if(cell.qnum===-2){
			if(this.btn==='right'){ val = -3;}
		}

		if(val===-3){
			cell.setQues(31);
			cell.setQnum(-1);
			cell.draw();
		}
		else if(val===-1){
			cell.setQues(0);
			cell.setQnum(-1);
			cell.draw();
		}
		else if(val===-2){
			cell.setQues(0);
			cell.setQnum(-2);
			cell.draw();
		}

		return (val!==null);
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,

	keyinput : function(ca){
		this.key_inputqnum_herugolf(ca);
	},
	key_inputqnum_herugolf : function(ca){
		var cell = this.cursor.getc();
		if(ca==='q'||ca==='w'){
			cell.setQues(cell.ice()?0:6);
			cell.setQnum(-1);
		}
		else if(ca==='h'){
			cell.setQues(cell.ques===31?0:31);
			cell.setQnum(-1);
		}
		else if(ca===' '){
			cell.setQues(0);
			cell.setQnum(-1);
		}
		else if(!cell.ice()){
			this.key_inputqnum(ca);
			return;
		}
		this.prev=cell;
		cell.draw();
	}
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	distance : null,

	isViaPoint : function(){
		if(this.distance===null){ return false;}
		var n=this.distance, k=0;
		while(n>0){ n-=++k;}
		return (n===0);
	},
	isCmp : function(){ // 描画用
		if(!this.puzzle.execConfig('autocmp')){ }
		else if(this.puzzle.execConfig('dispmove')){
			return (this.ques===31 && this.base.qnum!==-1 && this.isViaPoint());
		}
		else if(this.qnum!==-1 && this.path!==null){
			var clist = this.path.clist;
			for(var i=0,len=clist.length;i<len;i++){
				if(clist[i].base===this && clist[i].ques===31 && clist[i].isViaPoint()){ return true;}
			}
		}
		return false;
	},
	maxnum : function(){
		var bd = this.board, cx = (this.bx>>1), cy = (this.by>>1);
		return Math.max(cx, cy, bd.cols-1-cx, bd.rows-1-cy);
	},

	getDestination : function(){
		var bd = this.board, path = this.path;
		return (path!==null ? path.destination : bd.emptycell);
	},
	getDeparture : function(){
		var bd = this.board, path = this.path;
		return (path!==null ? path.departure : bd.emptycell);
	}
},
Board:{
	hasborder : 1
},

LineGraph:{
	enabled : true,
	moveline : true,

	resetExtraData : function(cell){
		cell.distance = (cell.qnum>=0 ? (cell.qnum+1)*cell.qnum/2 : null);

		this.common.resetExtraData.call(this, cell);
	},
	setExtraData : function(component){
		this.common.setExtraData.call(this, component);

		var cell = component.departure, num = cell.qnum;
		num = (num>=0 ? num : this.board.cell.length);
		cell.distance = (num+1)*num/2;
		if(cell.lcnt===0){ return;}

		/* component.departureは線が1方向にしかふられていないはず */
		var dir = cell.getdir(cell.pathnodes[0].nodes[0].obj,2);
		var pos = cell.getaddr(), n = cell.distance;
		while(1){
			pos.movedir(dir,2);
			var cell = pos.getc(), adb = cell.adjborder;
			if(cell.isnull || cell.lcnt>=3 || cell.lcnt===0){ break;}

			cell.distance = --n;
			if(cell===component.destination){ break;}
			else if(dir!==1 && adb.bottom.isLine()){ dir=2;}
			else if(dir!==2 && adb.top.isLine()   ){ dir=1;}
			else if(dir!==3 && adb.right.isLine() ){ dir=4;}
			else if(dir!==4 && adb.left.isLine()  ){ dir=3;}
		}
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	hideHatena : true,

	autocmp : "number",

	gridcolor_type : "LIGHT",

	bgcellcolor_func : "icebarn",
	bordercolor_func : "ice",
	circlefillcolor_func : "qcmp",
	numbercolor_func : "move",

	invalidlinecolor : "silver",

	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();
		this.drawBorders();

		this.drawTip_herugolf();
		this.drawViaPoints();
		this.drawLines();

		this.drawCircledNumbers();
		this.drawHoles();

		this.drawPekes();

		this.drawChassis();

		this.drawTarget();
	},

	getQuesNumberText : function(cell){
		if(this.puzzle.execConfig('dispmove')){
			if(!cell.isDestination() || cell.base.qnum<0){ return "";}
			/* cell.isViaPointに似ている関数 */
			var n=cell.distance, k=0;
			while(n>0){ n-=++k;}
			return ""+k;
		}
		else{
			return this.getNumberTextCore(cell.getNum());
		}
	},

	getLineColor : function(border){
		this.addlw = 0;
		if(border.isLine()){
			var info = border.error || border.qinfo;
			if(border.trial && this.puzzle.getConfig('irowake')){ this.addlw=-this.lm;}
			else if(info===1){ this.addlw=1;}

			if     (info===1) { return this.errlinecolor;}
			else if(info===-1){ return this.noerrcolor;}
			else if(border.trial){ return (this.puzzle.execConfig('dispmove') ? this.movetrialcolor : this.trialcolor);}

			var cells = border.sidecell;
			var isvalidline = (cells[0].distance>=0 && cells[1].distance>=0);
			if(this.puzzle.execConfig('dispmove')){
				return (isvalidline ? this.movelinecolor : this.errlinecolor);
			}
			else{
				return (isvalidline ? this.linecolor : this.invalidlinecolor);
			}
		}
		return null;
	},

	drawTip_herugolf : function(){
		var g = this.vinc('cell_linetip', 'auto');

		var tsize = this.cw*0.30;
		var tplus = this.cw*0.05;
		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i], dir=0, border=null;
			if(cell.qnum===-1 && !this.puzzle.execConfig('dispmove')){
				var adc = cell.adjacent, adb = cell.adjborder;
				if     (adb.top.isLine()    && (cell.lcnt===1 || (cell.isViaPoint() && adc.top.distance   ===cell.distance+1))){ dir=2; border=adb.top;   }
				else if(adb.bottom.isLine() && (cell.lcnt===1 || (cell.isViaPoint() && adc.bottom.distance===cell.distance+1))){ dir=1; border=adb.bottom;}
				else if(adb.left.isLine()   && (cell.lcnt===1 || (cell.isViaPoint() && adc.left.distance  ===cell.distance+1))){ dir=4; border=adb.left;  }
				else if(adb.right.isLine()  && (cell.lcnt===1 || (cell.isViaPoint() && adc.right.distance ===cell.distance+1))){ dir=3; border=adb.right; }
			}

			g.vid = "c_tip_"+cell.id;
			if(dir!==0){
				var info = border.error || border.qinfo;
				if(border.trial && this.puzzle.getConfig('irowake')){ this.addlw=-this.lm;}
				else if(info===1){ this.addlw=1;}
				g.lineWidth = this.lw + this.addlw; //LineWidth

				if     (info=== 1)       { g.strokeStyle = this.errlinecolor;}
				else if(info===-1)       { g.strokeStyle = this.noerrcolor;}
				else if(border.trial)    { g.strokeStyle = (this.puzzle.execConfig('dispmove') ? this.movetrialcolor : this.trialcolor);}
				else if(cell.distance>=0){ g.strokeStyle = this.linecolor;}
				else                     { g.strokeStyle = this.invalidlinecolor;}

				g.beginPath();
				var px = cell.bx*this.bw+1, py = cell.by*this.bh+1;
				if     (dir===1){ g.setOffsetLinePath(px,py ,-tsize, tsize ,0,-tplus , tsize, tsize, false);}
				else if(dir===2){ g.setOffsetLinePath(px,py ,-tsize,-tsize ,0, tplus , tsize,-tsize, false);}
				else if(dir===3){ g.setOffsetLinePath(px,py , tsize,-tsize ,-tplus,0 , tsize, tsize, false);}
				else if(dir===4){ g.setOffsetLinePath(px,py ,-tsize,-tsize , tplus,0 ,-tsize, tsize, false);}
				g.stroke();
			}
			else{ g.vhide();}
		}
	},

	drawHoles : function(){
		var g = this.vinc('cell_hole', 'auto');

		g.fillStyle = this.quescolor;
		var isdrawmove = this.puzzle.execConfig('dispmove');
		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i];
			g.vid = "cell_hole_text_"+cell.id;
			if(cell.ques===31 && !(isdrawmove && cell.isDestination())){
				this.disptext("H", cell.bx*this.bw, cell.by*this.bh);
			}
			else{ g.vhide();}
		}
	},

	// drawDeparturesから派生
	drawViaPoints : function(){
		var g = this.vinc('cell_via', 'auto', true);
		g.fillStyle = this.movelinecolor;
		var rsize  = this.cw*0.15;
		var isdrawmove = this.puzzle.execConfig('dispmove');
		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i];
			g.vid = "c_dcir_"+cell.id;
			if(isdrawmove && cell.isViaPoint()){
				g.fillCircle(cell.bx*this.bw, cell.by*this.bh, rsize);
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
		this.decodeNumber16_herugolf();
	},
	encodePzpr : function(type){
		this.encodeIce();
		this.encodeNumber16_herugolf();
	},

	/* 0-9a-fは数字、hはHole, i-zは空白とします (gは未使用) */
	decodeNumber16_herugolf : function(){
		var c=0, i=0, bstr = this.outbstr, bd = this.board;
		for(i=0;i<bstr.length;i++){
			var cell = bd.cell[c], ca = bstr.charAt(i);

			if(this.include(ca,"0","9")||this.include(ca,"a","f"))
							   { cell.qnum = parseInt(ca,16);}
			else if(ca === '-'){ cell.qnum = parseInt(bstr.substr(i+1,2),16); i+=2;}
			else if(ca === 'h'){ cell.ques = 31;}
			else if(ca >= 'i' && ca <= 'z'){ c += (parseInt(ca,36)-18);}

			c++;
			if(!bd.cell[c]){ break;}
		}
		this.outbstr = bstr.substr(i+1);
	},
	encodeNumber16_herugolf : function(){
		var count=0, cm="", bd = this.board;
		for(var c=0;c<bd.cell.length;c++){
			var pstr = "", cell = bd.cell[c], qn = cell.qnum, qu = cell.ques;

			if     (qn===-2          ){ pstr = ".";}
			else if(qn>=  0 && qn< 16){ pstr =       qn.toString(16);}
			else if(qn>= 16 && qn<256){ pstr = "-" + qn.toString(16);}
			else if(qu===31          ){ pstr = "h";}
			else{ count++;}

			if(count===0){ cm += pstr;}
			else if(pstr || count===18){ cm+=((17+count).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm+=(17+count).toString(36);}

		this.outbstr += cm;
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCell( function(cell,ca){
			if     (ca==="H"){ cell.ques = 31;}
			else if(ca==="i"){ cell.ques = 6;}
			else if(ca!=="."){ cell.qnum = +ca;}
		});
		this.decodeBorderLine();
	},
	encodeData : function(){
		this.encodeCell( function(cell){
			if     (cell.ques===31){ return "H ";}
			else if(cell.ques=== 6){ return "i ";}
			else if(cell.qnum >  0){ return cell.qnum+" ";}
			else{ return ". ";}
		});
		this.encodeBorderLine();
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
		"checkLineOverHole",
		"checkCurveHalfway",
		"checkMoveOver",
		"checkStopHalfway",
		"checkWaterHazard",

		"checkCupIn+",
		"checkIgnoredHole+",

		"checkDisconnectLine"
	],

	checkMoveOver : function(){
		var result = true, bd = this.board;
		for(var id=0;id<bd.border.length;id++){
			var border = bd.border[id];
			if(!border.isLine()){ continue;}
			var cell1 = border.sidecell[0], cell2 = border.sidecell[1];
			if(cell1.distance>=0 && cell2.distance>=0){ continue;}

			result = false;
			if(this.checkOnly){ break;}
			border.seterr(1);
			(this.puzzle.execConfig('dispmove') ? cell1.getDestination() : cell1.getDeparture()).seterr(1);
		}
		if(!result){
			this.failcode.add("laMoveOver");
			bd.border.setnoerr();
		}
	},
	checkLineOverHole : function(){
		this.checkAllCell(function(cell){ return (cell.ques===31 && cell.lcnt>=2);}, "laOnHole");
	},
	checkStopHalfway : function(){
		this.checkAllCell(function(cell){ return (cell.lcnt===1 && cell.distance >=0 && !cell.isViaPoint());}, "laLenNe");
	},
	checkCurveHalfway : function(){
		this.checkAllCell(function(cell){ return (cell.isLineCurve() && !cell.isViaPoint());}, "laCurve");
	},
	checkWaterHazard : function(){
		this.checkAllCell(function(cell){ return (cell.ques===6 && cell.isViaPoint());}, "laWaterHazard");
	},
	checkCupIn : function(){
		if(this.puzzle.execConfig('dispmove')){
			this.checkAllCell(function(cell){ return (cell.ques!==31 && cell.isDestination());}, "nmOutOfHole");
		}
		else{
			this.checkAllCell(function(cell){ return (cell.qnum!==-1 && cell.getDestination().ques!==31);}, "nmOutOfHole");
		}
	},
	checkIgnoredHole : function(){
		this.checkAllCell(function(cell){ return (cell.ques===31 && !cell.isDestination());}, "nmIgnored");
	}
},

FailCode:{
	laIsolate    : ["ボールにつながっていない線があります。","A line doesn't connect any ball."],
	laOnNum      : ["ボールの上を線が通過しています。","A line goes through a ball."],
	laOnHole     : ["ホールの上を線が通過しています。","A line goes through a hole."],
	laCurve      : ["ボールが移動途中に曲がっています。","A ball curves halfway."],
	laLenNe      : ["ボールが移動途中に止まっています。","A ball stops halfway."],
	laMoveOver   : ["ボールが指示された打数を超えて動いています。","You make a bogey or more."],
	laWaterHazard: ["ウォーターハザードになっています。", "There is a water hazaad ball."],
	nmConnected  : ["ボールが繋がっています。","There are connected balls."],
	nmOutOfHole  : ["ホールに入っていないボールがあります。","A ball doesn't cup in."],
	nmIgnored    : ["ボールの入っていないホールがあります。","There is a Hole without a ball."]
}
}));
