//
// パズル固有スクリプト部 パイプリンク・帰ってきたパイプリンク・環状線スペシャル版 pipelink.js
//
(function(pidlist, classbase){
	if(typeof module==='object' && module.exports){module.exports = [pidlist, classbase];}
	else{ pzpr.classmgr.makeCustom(pidlist, classbase);}
}(
['pipelink','pipelinkr','loopsp'], {
//---------------------------------------------------------
// マウス入力系
"MouseEvent@pipelink":{
	inputModes : {edit:['quesmark','quesmark-','info-line'],play:['line','peke','info-line']}
},
"MouseEvent@pipelinkr":{
	inputModes : {edit:['quesmark','quesmark-','ice','info-line'],play:['line','peke','info-line']}
},
"MouseEvent@loopsp":{
	inputModes : {edit:['quesmark','quesmark-','number','info-line'],play:['line','peke','info-line']}
},
MouseEvent:{
	mouseinput_other : function(){
		if(this.inputMode.match(/quesmark/)){
			if(this.mousestart){ this.inputQuesMark();}
		}
	},
	mouseinput_auto : function(){
		if(this.puzzle.playmode){
			if(this.btn==='left'){
				if(this.mousestart || this.mousemove){ this.inputLine();}
				else if(this.mouseend && this.notInputted()){ this.inputpeke();}
			}
			else if(this.btn==='right'){
				if(this.mousestart || this.mousemove){ this.inputpeke();}
			}
		}
		else if(this.puzzle.editmode){
			if(this.mousestart){ this.inputQuesMark();}
		}
	},
	inputQuesMark :function(cell){
		if(this.pid!=='loopsp'){
			this.inputQues([0,11,12,13,14,15,16,17,-2]);
		}
		else{ this.inputLoopsp();}
	}
},
"MouseEvent@loopsp#1":{
	inputLoopsp : function(){
		var cell = this.getcell();
		if(cell.isnull || cell===this.mouseCell){ return;}

		if(cell!==this.cursor.getc()){
			this.setcursor(cell);
		}
		else{
			this.inputcell_loopsp(cell);
		}
		this.mouseCell = cell;
	},
	inputcell_loopsp : function(cell){
		var qu = cell.ques, qn = cell.qnum, val;
		// -8to-2:IneqMark -1:何もなし 0:丸のみ 1以上:数字
		if  (qn!==-1){ val = (qn>0 ? qn : 0);}
		else if(qu>0){ val = qu - 19;}
		else         { val = -1;}

		var max = cell.getmaxnum(), min = -8;
		if(this.inputMode.match(/number/)){ min = -1;}
		if(this.inputMode.match(/quesmark/)){ max = -1;}

		if(this.btn==='left'){
			if(min<=val && val<max){ val++;  }
			else                   { val=min;}
		}
		else if(this.btn==='right'){
			if(min<val && val<=max){ val--;  }
			else                   { val=max;}
		}

		if     (val >= 0){ cell.setQues(0);      cell.setQnum(val>=1 ? val : -2);}
		else if(val===-1){ cell.setQues(0);      cell.setQnum(-1);}
		else             { cell.setQues(val+19); cell.setQnum(-1);}
		cell.draw();
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,

	keyinput : function(ca){
		this.key_inputLineParts(ca);
	},
	key_inputLineParts : function(ca){
		var cell = this.cursor.getc();

		if     (ca==='q'){ cell.setQues(11); cell.setQnum(-1);}
		else if(ca==='w'){ cell.setQues(12); cell.setQnum(-1);}
		else if(ca==='e'){ cell.setQues(13); cell.setQnum(-1);}
		else if(ca==='r'){ cell.setQues(0);  cell.setQnum(-1);}
		else if(ca===' '){ cell.setQues(0);  cell.setQnum(-1);}
		else if(ca==='a'){ cell.setQues(14); cell.setQnum(-1);}
		else if(ca==='s'){ cell.setQues(15); cell.setQnum(-1);}
		else if(ca==='d'){ cell.setQues(16); cell.setQnum(-1);}
		else if(ca==='f'){ cell.setQues(17); cell.setQnum(-1);}
		else{
			if(this.pid!=='loopsp'){
				if(ca==='-'){ cell.setQues(cell.ques!==-2?-2:0);}
				else if(this.pid==='pipelinkr' && ca==='1'){ cell.setQues(6);}
				else{ return;}
			}
			else{
				if((ca>='0' && ca<='9') || ca==='-'){
					this.key_inputqnum_main(cell,ca);
					if(cell.qnum!==-1){ cell.setQues(0);}
				}
				else{ return;}
			}
		}

		this.prev = cell;
		cell.drawaround();
	}
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	maxnum : function(){
		return (this.board.cell.length/4)|0;
	},
	prehook : {
		ques  : function(num){ this.setCombinedLine(num); return false;}
	},
	setCombinedLine : function(){	// cell.setQuesから呼ばれる
		var bx=this.bx, by=this.by;
		var blist = this.board.borderinside(bx-1,by-1,bx+1,by+1);
		for(var i=0;i<blist.length;i++){
			var border=blist[i];
			if        (border.line===0 && border.isLineEX()){ border.setLineVal(1);}
			// 黒マスが入力されたら線を消すとかやりたい場合、↓のコメントアウトをはずす
			// else if(border.line!==0 && border.isLineNG()){ border.setLineVal(0);}
		}
	}
},
Border:{
	enableLineNG : true,

	checkStableLine : function(num){	// border.setLineから呼ばれる
		return ( (num!==0 && this.isLineNG()) ||
				 (num===0 && this.isLineEX()) );
	},
	isLineEX : function(){
		var cell1 = this.sidecell[0], cell2 = this.sidecell[1];
		return this.isVert() ? (cell1.isLP(cell1.RT) && cell2.isLP(cell2.LT)) :
							   (cell1.isLP(cell1.DN) && cell2.isLP(cell2.UP));
	}
},
Board:{
	hasborder : 1
},
BoardExec:{
	adjustBoardData : function(key,d){
		if(key & this.TURNFLIP){
			var tques={};
			switch(key){
				case this.FLIPY: tques={14:17,15:16,16:15,17:14}; break;
				case this.FLIPX: tques={14:15,15:14,16:17,17:16}; break;
				case this.TURNR: tques={12:13,13:12,14:17,15:14,16:15,17:16}; break;
				case this.TURNL: tques={12:13,13:12,14:15,15:16,16:17,17:14}; break;
			}
			var clist = this.board.cellinside(d.x1,d.y1,d.x2,d.y2);
			for(var i=0;i<clist.length;i++){
				var cell = clist[i], val = tques[cell.ques];
				if(!!val){ cell.setQues(val);}
			}
		}
	}
},

LineGraph:{
	enabled : true,
	isLineCross : true,
	relation : {'border.line':'link', 'cell.ques':'cell'},
	isedgevalidbylinkobj : function(border){ return border.isLine() || border.isLineEX();},
	modifyOtherInfo : function(cell,relation){
		var cblist = cell.getdir4cblist();
		for(var i=0;i<cblist.length;i++){
			this.setEdgeByLinkObj(cblist[i][1]);
		}
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	hideHatena : true,

	irowake : true,

	gridcolor_type : "LIGHT",

	circleratio : [0.42, 0.37],

	minYdeg : 0.42,

	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();
		if(this.pid==='pipelinkr'){
			this.drawBorders();
		}

		if(this.pid==='pipelink'){
			this.drawHatenas();
		}
		else if(this.pid==='pipelinkr'){
			this.drawCircles();
			this.drawHatenas();
		}

		this.drawLines();

		if(this.pid==='loopsp'){
			this.drawCircledNumbers();
		}

		this.drawPekes();

		this.drawLineParts();

		this.drawChassis();

		this.drawTarget();
	},

	repaintParts : function(blist){
		this.range.cells = blist.cellinside();

		if(this.pid==='loopsp'){
			this.drawCircledNumbers();
		}
		this.drawLineParts();
	}
},
"Graphic@pipelinkr":{
	getBGCellColor : function(cell){
		if     (cell.error===1)                                                  { return this.errbcolor1;}
		else if(cell.ques===6 && this.puzzle.getConfig('disptype_pipelinkr')===2){ return this.icecolor;}
		return null;
	},
	getBorderColor : function(border){
		if(this.puzzle.getConfig('disptype_pipelinkr')===2){
			var cell1 = border.sidecell[0], cell2 = border.sidecell[1];
			if(!cell1.isnull && !cell2.isnull && (cell1.ice()^cell2.ice())){
				return this.quescolor;
			}
		}
		return null;
	},

	getCircleStrokeColor : function(cell){
		if((this.puzzle.getConfig('disptype_pipelinkr')===1) && cell.ques===6){
			return this.quescolor;
		}
		return null;
	},
	circlefillcolor_func : "null"
},
"Graphic@loopsp":{
	circleratio : [0.40, 0.35],

	numbercolor_func : "qnum",

	getCircleFillColor : function(cell){
		if(cell.qnum!==-1){ return "rgba(255,255,255,0.5)";}
		return null;
	},

	minYdeg : 0.36,
	maxYdeg : 0.74
},

//---------------------------------------------------------
// URLエンコード/デコード処理
"Encode@pipelink,pipelinkr":{
	decodePzpr : function(type){
		this.decodePipelink();

		if(this.pid==='pipelinkr'){ this.puzzle.setConfig('disptype_pipelinkr', (!this.checkpflag('i')?1:2));}
	},
	encodePzpr : function(type){
		this.encodePipelink(type);

		this.outpflag = ((this.pid==='pipelinkr' && this.puzzle.getConfig('disptype_pipelinkr')===2)?"i":null);
	},

	decodePipelink : function(){
		var c=0, bstr = this.outbstr, bd = this.board;
		for(var i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i);

			if     (ca==='.'){ bd.cell[c].ques = -2;}
			else if(ca>='0' && ca<='9'){
				for(var n=0,max=parseInt(ca,10)+1;n<max;n++){
					if(!!bd.cell[c]){ bd.cell[c].ques = 6; c++;}
				}
				c--;
			}
			else if(ca>='a' && ca<='g'){ bd.cell[c].ques = parseInt(ca,36)+1;}
			else if(ca>='h' && ca<='z'){ c += (parseInt(ca,36)-17);}

			c++;
			if(!bd.cell[c]){ break;}
		}

		this.outbstr = bstr.substr(i);
	},
	encodePipelink : function(type){
		var parser = this.puzzle.pzpr.parser;
		var count, cm="", bd = this.board;

		count=0;
		for(var c=0;c<bd.cell.length;c++){
			var pstr="", qu=bd.cell[c].ques;

			if     (qu===-2){ pstr = ".";}
			else if(qu=== 6){
				if(type===parser.URL_PZPRV3){
					for(var n=1;n<10;n++){
						if(!bd.cell[c+n] || bd.cell[c+n].ques!==6){ break;}
					}
					pstr=(n-1).toString(10); c=(c+n-1);
				}
			}
			else if(qu>=11 && qu<=17){ pstr = (qu-1).toString(36);}
			else{ count++;}

			if(count===0){ cm += pstr;}
			else if(pstr || count===19){ cm+=((16+count).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm+=(16+count).toString(36);}

		this.outbstr += cm;
	}
},
"Encode@loopsp":{
	decodePzpr : function(type){
		this.decodeLoopsp();
	},
	encodePzpr : function(type){
		this.encodeLoopsp();
	},

	decodeLoopsp : function(){
		var c=0, bstr = this.outbstr, bd = this.board;
		for(var i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i), cell = bd.cell[c];

			if     (ca ==='.'){ cell.qnum = -2;}
			if(this.include(ca,"0","9")||this.include(ca,"a","f"))
							  { cell.qnum = parseInt(ca,16);}
			else if(ca ==='-'){ cell.qnum = parseInt(bstr.substr(i+1,2),16); i+=2;}
			else if(ca ==='+'){ cell.qnum = parseInt(bstr.substr(i+1,3),16); i+=3;}
			else if(ca >= 'g' && ca <= 'm'){ cell.ques = parseInt(ca,36)-5;}
			else if(ca >= 'n' && ca <= 'z'){ c += (parseInt(ca,36)-23);}

			c++;
			if(!bd.cell[c]){ break;}
		}

		this.outbstr = bstr.substr(i+1);
	},
	encodeLoopsp : function(){
		var cm="", pstr="", count=0, bd=this.board;
		for(var c=0;c<bd.cell.length;c++){
			var qn=bd.cell[c].qnum, qu=bd.cell[c].ques;
			if     (qn===-2)       { pstr = ".";}
			else if(qn>= 0&&qn< 16){ pstr =     qn.toString(16);}
			else if(qn>=16&&qn<256){ pstr = "-"+qn.toString(16);}
			else if(qn>=256&&qn<4096){pstr= "+"+qn.toString(16);}
			else if(qu>=11&&qu<=17){ pstr = (qu+5).toString(36);}
			else{ pstr = ""; count++;}

			if(count===0){ cm += pstr;}
			else if(pstr || count===13){ cm+=((22+count).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm+=(22+count).toString(36);}

		this.outbstr += cm;
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		if(this.pid!=='loopsp'){ this.decodeDispType();}
		this.decodePipelink();
		this.decodeBorderLine();
	},
	encodeData : function(){
		if(this.pid!=='loopsp'){ this.encodeDispType();}
		this.encodePipelink();
		this.encodeBorderLine();
	},

	decodeDispType : function(){
		var disptype = this.readLine();
		if(this.pid==='pipelinkr'){ this.puzzle.setConfig('disptype_pipelinkr', (disptype==="circle"?1:2));}
	},
	encodeDispType : function(){
		var puzzle = this.puzzle, disptype = 'pipe';
		if(puzzle.pid==='pipelinkr'){ disptype = (puzzle.getConfig('disptype_pipelinkr')===1 ? "circle" : "ice");}
		this.writeLine(disptype);
	},
	decodePipelink : function(){
		this.decodeCell( function(cell,ca){
			if     (ca==="o"){ cell.ques = 6; }
			else if(ca==="-"){ cell.ques = -2;}
			else if(ca>="a" && ca<="g"){ cell.ques = parseInt(ca,36)+1;}
			else if(ca!=="."){ cell.qnum = +ca;}
		});
	},
	encodePipelink : function(){
		this.encodeCell( function(cell){
			if     (cell.ques===6) { return "o ";}
			else if(cell.ques===-2){ return "- ";}
			else if(cell.ques>=11 && cell.ques<=17){ return ""+(cell.ques-1).toString(36)+" ";}
			else if(cell.qnum!==-1){ return cell.qnum+" ";}
			else                  { return ". ";}
		});
	}
},
//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checklist : [
		"checkenableLineParts",

		"checkBranchLine",
		"checkCrossOnNumber@loopsp",
		"checkCrossOutOfMark@pipelinkr",
		"checkIceLines@pipelinkr",

		"checkOneLoop@!loopsp",
		"checkLoopNumber@loopsp",
		"checkNumberLoop@loopsp",
		"checkNumberInLoop@loopsp",

		"checkNotCrossOnMark",
		"checkNoLine+",
		"checkDeadendLine++"
	]
},
"AnsCheck@pipelinkr":{
	checkCrossOutOfMark : function(){
		this.checkAllCell(function(cell){ return (cell.lcnt===4 && cell.ques!==6 && cell.ques!==11);}, "lnCrossExIce");
	}
},
"CheckInfo@pipelinkr":{
	text : function(lang){
		var puzzle = this.puzzle, texts = [];
		var langcode = ((lang || this.puzzle.pzpr.lang)==="ja"?0:1);
		var isdispice = (puzzle.getConfig('disptype_pipelinkr')===2);
		if(this.length===0){ return puzzle.faillist.complete[langcode];}
		for(var i=0;i<this.length;i++){
			var code = this[i];
			if(!isdispice){
				if     (code==="lnCrossExIce"){ code = "lnCrossExCir";}
				else if(code==="lnCurveOnIce"){ code = "lnCurveOnCir";}
			}
			texts.push(puzzle.faillist[code][langcode]);
		}
		return texts.join("\n");
	}
},
"AnsCheck@loopsp":{
	checkCrossOnNumber : function(){
		this.checkAllCell(function(cell){ return (cell.lcnt===4 && cell.isNum());}, "lnCrossOnNum");
	},

	checkLoopNumber : function(){
		this.checkAllLoops(function(cells){
			var sublist = cells.filter(function(cell){ return cell.isValidNum();});
			var number = null;
			for(var n=0;n<sublist.length;n++){
				if(number===null){ number = sublist[n].getNum();}
				else if(number!==sublist[n].getNum()){
					sublist.seterr(1);
					return false;
				}
			}
			return true;
		}, "lpPlNum");
	},
	checkNumberLoop : function(){
		var boardcell = this.board.cell;
		this.checkAllLoops(function(cells){
			var sublist = cells.filter(function(cell){ return cell.isValidNum();});
			if(sublist.length===0){ return true;}
			var number = sublist[0].getNum();

			for(var c=0;c<boardcell.length;c++){
				var cell = boardcell[c];
				if(cell.getNum()===number && !sublist.include(cell)){
					sublist.seterr(1);
					return false;
				}
			}
			return true;
		}, "lpSepNum");
	},
	checkNumberInLoop : function(){
		this.checkAllLoops(function(cells){
			return (cells.filter(function(cell){ return cell.isNum();}).length > 0);
		}, "lpNoNum");
	},
	checkAllLoops : function(func, code){
		var result = true;
		var paths = this.board.linegraph.components;
		for(var r=0;r<paths.length;r++){
			var blist = new this.klass.BorderList(paths[r].getedgeobjs());
			if(func(blist.cellinside())){ continue;}

			result = false;
			if(this.checkOnly){ break;}
			blist.seterr(1);
		}
		if(!result){
			this.failcode.add(code);
			if(!this.checkOnly){ this.board.border.setnoerr();}
		}
	}
},
FailCode:{
	lnCrossExCir : ["○の部分以外で線が交差しています。","There is a crossing line out of circles."],
	lnCurveOnCir : ["○の部分で線が曲がっています。","A line curves on circles."],
	lnCrossOnNum : ["○の部分で線が交差しています。","The lines are crossed on the number."],
	lpPlNum  : ["異なる数字を含んだループがあります。","A loop has plural kinds of number."],
	lpSepNum : ["同じ数字が異なるループに含まれています。","A kind of numbers are in differernt loops."],
	lpNoNum  : ["○を含んでいないループがあります。","A loop has no numbers."]
}
}));
