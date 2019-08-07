//
// パズル固有スクリプト部 ごきげんななめ、ごきげんななめ・輪切版 gokigen.js
//
(function(pidlist, classbase){
	if(typeof module==='object' && module.exports){module.exports = [pidlist, classbase];}
	else{ pzpr.classmgr.makeCustom(pidlist, classbase);}
}(
['gokigen','wagiri'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	use : true,
	inputModes:{edit:['number','clear'],play:['info-line']},
	mouseinput_clear : function(){
		this.inputclean_cross();
	},
	mouseinput_number: function(){
		if(this.mousestart){ this.inputqnum_cross();}
	},
	mouseinput_auto : function(){
		var puzzle = this.puzzle;
		if(puzzle.playmode){
			if     (this.mousestart || this.mousemove)  { this.inputslash();}
			else if(this.mouseend && this.notInputted()){ this.clickslash();}
		}
		else if(puzzle.editmode && this.mousestart){
			if     (puzzle.pid==='gokigen'){ this.inputqnum_cross();}
			else if(puzzle.pid==='wagiri') { this.inputquestion();}
		}
	},

	inputslash : function(){
		var cell = this.getcell();
		if(cell.isnull){ return;}

		// 初回 or 入力し続けていて別のマスに移動した場合
		if(this.mouseCell!==cell){
			this.firstPoint.set(this.inputPoint);
		}
		// まだ入力していないセルの場合
		else if(this.firstPoint.bx!==null){
			var val=null,
				dx = this.inputPoint.bx-this.firstPoint.bx,
				dy = this.inputPoint.by-this.firstPoint.by;
			if     (dx*dy>0 && Math.abs(dx)>=0.50 && Math.abs(dy)>=0.50){ val=31;}
			else if(dx*dy<0 && Math.abs(dx)>=0.50 && Math.abs(dy)>=0.50){ val=32;}

			if(val!==null){
				if(this.inputData===null){
					if(val===cell.qans){ val = 0;}
					this.inputData = +(val>0);
				}
				else if(this.inputData===0){
					if(val===cell.qans){ val = 0;}
					else{ val = null;}
				}
				if(val!==null){
					cell.setQans(val);
					cell.draw();
				}
				this.firstPoint.reset();
			}
		}

		this.mouseCell = cell;
	},
	clickslash : function(){
		var cell = this.getcell();
		if(cell.isnull){ return;}

		var use = this.puzzle.getConfig('use'), sl=(this.btn==='left'?31:32), qa = cell.qans;
		if     (use===1){ cell.setQans(qa!==sl?sl:0);}
		else if(use===2){ cell.setQans((this.btn==='left'?{0:31,31:32,32:0}:{0:32,31:0,32:31})[qa]);}

		cell.drawaround();
	},

	dispInfoLine : function(){
		var cell = this.getcell();
		this.mousereset();
		if(cell.isnull || cell.qans===0 || cell.path===null){ return;}

		this.board.cell.setinfo(-1);
		cell.path.setedgeinfo(2);
		this.board.hasinfo = true;
		this.puzzle.redraw();
	}
},
"MouseEvent@wagiri":{
	inputquestion : function(){
		var pos = this.getpos(0.33);
		if(!pos.isinside()){ return;}

		if(!this.cursor.equals(pos)){
			this.setcursor(pos);
		}
		else if(pos.oncross()){
			this.inputqnum_cross();
		}
		else if(pos.oncell()){
			this.inputwagiri(pos);
		}
	},
	inputwagiri : function(pos){
		var cell = pos.getc();
		if(cell.isnull){ return;}

		var trans = (this.btn==='left' ? [-1,1,0,2,-2] : [2,-2,0,-1,1]);
		cell.setNum(trans[cell.qnum+2]);
		cell.draw();
	}
},

//---------------------------------------------------------
// キーボード入力系
"KeyEvent@gokigen":{
	enablemake : true,
	moveTarget : function(ca){ return this.moveTCross(ca);},

	keyinput : function(ca){
		this.key_inputcross(ca);
	}
},
"KeyEvent@wagiri":{
	enablemake : true,
	moveTarget : function(ca){ return this.moveTBorder(ca);},

	keyinput : function(ca){
		this.key_wagiri(ca);
	},
	key_wagiri : function(ca){
		var cursor = this.cursor;
		if(cursor.oncross()){
			this.key_inputcross(ca);
		}
		else if(cursor.oncell()){
			var cell = cursor.getc(), val = 0;
			if     (ca==='1'){ val= 1;}
			else if(ca==='2'){ val= 2;}
			else if(ca==='-'){ val=-2;}
			else if(ca===' '){ val=-1;}

			if(!cell.isnull && val!==0){
				cell.setNum(val);
				cell.draw();
			}
		}
	}
},

TargetCursor:{
	crosstype : true
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	setSideObj : function(){
		this.sideobj = [null,null];
		if(this.qans===31){
			this.sideobj = [this.relcross(-1,-1), this.relcross(1,1)];
		}
		else if(this.qans===32){
			this.sideobj = [this.relcross(-1,1), this.relcross(1,-1)];
		}
	}
},
Cross:{
	maxnum : 4,
	minnum : 0
},
Board:{
	cols : 7,
	rows : 7,
	disable_subclear : true
},
BoardExec:{
	adjustBoardData : function(key,d){
		if(key & this.TURNFLIP){ // 反転・回転全て
			var clist = this.board.cell;
			for(var i=0;i<clist.length;i++){
				var cell = clist[i];
				cell.setQans({0:0,31:32,32:31}[cell.qans]);
			}
		}
	}
},

LineGraph:{
	enabled : true,
	relation : {'cell.qans':'link'},

	pointgroup : 'cross',
	linkgroup  : 'cell',

	rebuild2 : function(){
		var boardcell = this.board.cell;
		for(var c=0;c<boardcell.length;c++){
			boardcell[c].setSideObj();
			boardcell[c].isloop = false;
		}

		this.common.rebuild2.call(this);
	},

	isedgevalidbylinkobj : function(cell){ return cell.qans>0;},

	setEdgeByLinkObj : function(cell){
		// 斜線の形が変わった時は一旦セルの情報を取り除いてから再度付加する
		if(cell.path!==null){
			this.incdecLineCount(cell, false);
			this.removeEdgeByLinkObj(cell);
		}
		if(cell.qans>0){
			cell.setSideObj();
			this.incdecLineCount(cell, true);
			this.addEdgeByLinkObj(cell);
		}
	},

	setExtraData : function(component){
		this.common.setExtraData.call(this, component);

		// Loopがない場合はisloopにfalseを設定してreturn
		var edgeobjs = component.getedgeobjs();
		for(var c=0;c<edgeobjs.length;c++){ edgeobjs[c].isloop = false;}
		if(component.circuits<=0){ return;}

		// どこにLoopが存在するか判定を行う
		var bd = this.board;
		var prevcross;
		var history = [component.nodes[0].obj];
		var steps={}, rows = (bd.maxbx-bd.minbx+1);

		while(history.length>0){
			var obj = history[history.length-1], nextobj = null;
			var step = steps[obj.by*rows+obj.bx];
			if(step===void 0){
				step = steps[obj.by*rows+obj.bx] = history.length-1;
			}
			// ループになった場合 => ループフラグをセットする
			else if((obj.group==='cross') && ((history.length-1)>step)){
				for(var i=history.length-2;i>=0;i--){
					if(history[i]===obj){ break;}
					if(history[i].group==='cell'){ history[i].isloop = true;}
				}
			}

			if(obj.group==='cross'){
				prevcross = obj;
				for(var i=0;i<obj.pathnodes[0].nodes.length;i++){
					var cross2 = obj.pathnodes[0].nodes[i].obj;
					var cell = bd.getc((obj.bx+cross2.bx)>>1,(obj.by+cross2.by)>>1);
					if(steps[cell.by*rows+cell.bx]===void 0){ nextobj = cell; break;}
				}
			}
			else{ // cellの時
				for(var i=0;i<obj.sideobj.length;i++){
					var cross = obj.sideobj[i];
					if((cross!==prevcross) && (cross!==history[history.length-2])){ nextobj = cross; break;}
				}
			}
			if(!!nextobj){ history.push(nextobj);}
			else         { history.pop();}
		}
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	irowake : true,

	margin : 0.50,

	gridcolor_type : "DLIGHT",

	numbercolor_func : "fixed",

	errcolor1 : "red",

	crosssize : 0.33,

	// オーバーライド
	paintRange : function(x1,y1,x2,y2){
		var bd = this.board;
		if(!bd.haserror && !bd.hasinfo && this.puzzle.getConfig('autoerr')){
			this.setRange(bd.minbx-2, bd.minby-2, bd.maxbx+2, bd.maxby+2);
		}
		else{
			this.setRange(x1,y1,x2,y2);
		}
		this.prepaint();
	},
	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid(false);

		if(this.pid==='wagiri'){ this.drawQuesNumbers();}
		this.drawSlashes();

		this.drawCrosses();
		this.drawTarget();
	},

	// オーバーライド
	getBGCellColor : function(cell){
		if(cell.qans===0 && cell.error===1){ return this.errbcolor1;}
		return null;
	},

	drawSlashes : function(){
		var puzzle = this.puzzle, bd = puzzle.board;
		if(!bd.haserror && !bd.hasinfo && puzzle.getConfig('autoerr')){
			var pid = this.pid;
			bd.cell.each(function(cell){ cell.qinfo = (cell.isloop?(pid==='gokigen'?1:3):0);});

			this.common.drawSlashes.call(this);

			bd.cell.setinfo(0);
		}
		else{
			this.common.drawSlashes.call(this);
		}
	},
	repaintLines : function(clist){
		this.range.cells = clist;
		this.drawSlashes();

		if(this.context.use.canvas){ this.drawCrosses();}
	}
},
"Graphic@wagiri":{
	fontsizeratio : 0.70,
	getNumberTextCore : function(num){
		return {'-2':"?",1:"輪",2:"切"}[num] || "";
	},

	drawTarget : function(){
		var islarge = !this.puzzle.cursor.onborder();
		this.drawCursor(islarge,this.puzzle.editmode);
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
"Encode@gokigen":{
	decodePzpr : function(type){
		var parser = this.puzzle.pzpr.parser;
		var oldflag = ((type===parser.URL_PZPRAPP && !this.checkpflag("c")) ||
					   (type===parser.URL_PZPRV3  &&  this.checkpflag("d")));
		if(!oldflag){ this.decode4Cross();}
		else        { this.decodecross_old();}
	},
	encodePzpr : function(type){
		this.encode4Cross();
	}
},
"Encode@wagiri":{
	decodePzpr : function(type){
		this.decode4Cross();
		this.decodeNumber10();
	},
	encodePzpr : function(type){
		this.encode4Cross();
		this.encodeNumber10();
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCrossNum();
		if(this.pid==='wagiri'){ this.decodeCellQnum();}
		this.decodeCell( function(cell,ca){
			if     (ca==="1"){ cell.qans = 31;}
			else if(ca==="2"){ cell.qans = 32;}
		});
	},
	encodeData : function(){
		this.encodeCrossNum();
		if(this.pid==='wagiri'){ this.encodeCellQnum();}
		this.encodeCell( function(cell){
			if     (cell.qans===31){ return "1 ";}
			else if(cell.qans===32){ return "2 ";}
			else                   { return ". ";}
		});
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checklist : [
		"checkSlashLoop",
		"checkQnumCross",
		"checkSlashNoLoop@wagiri",
		"checkNoSlashCell+"
	],

	checkQnumCross : function(){
		var bd = this.board;
		for(var c=0;c<bd.cross.length;c++){
			var cross = bd.cross[c], qn = cross.qnum;
			if(qn<0 || qn===cross.lcnt){ continue;}

			this.failcode.add("crConnSlNe");
			if(this.checkOnly){ break;}
			cross.seterr(1);
		}
	},

	checkNoSlashCell : function(){
		this.checkAllCell(function(cell){ return (cell.qans===0);}, "ceNoSlash");
	}
},
"AnsCheck@gokigen":{
	checkSlashLoop : function(){
		var errclist = this.board.cell.filter(function(cell){ return (cell.qans>0 && cell.isloop);});
		if(errclist.length>0){
			this.failcode.add("slLoop");
			this.board.cell.setnoerr();
			errclist.seterr(1);
		}
	}
},
"AnsCheck@wagiri":{
	checkSlashLoop   : function(){ this.checkLoops_wagiri(false, "slLoopGiri");},
	checkSlashNoLoop : function(){ this.checkLoops_wagiri(true,  "slNotLoopWa");},
	checkLoops_wagiri : function(checkLoop, code){
		var filter = (checkLoop ? function(cell){ return (!cell.isloop && cell.qans>0 && cell.qnum===1);}
		                        : function(cell){ return ( cell.isloop && cell.qans>0 && cell.qnum===2);});
		var errclist = this.board.cell.filter(filter);
		if(errclist.length>0){
			this.failcode.add(code);
			this.board.cell.setnoerr();
			errclist.seterr(1);
		}
	}
},

FailCode:{
	slLoop      : ["斜線で輪っかができています。", "There is a loop consisted in some slashes."],
	slLoopGiri  : ["'切'が含まれた線が輪っかになっています。", "There is a loop that consists '切'."],
	slNotLoopWa : ["'輪'が含まれた線が輪っかになっていません。", "There is not a loop that consists '輪'."],
	crConnSlNe  : ["数字に繋がる線の数が間違っています。", "A number is not equal to count of lines that is connected to it."],
	ceNoSlash   : ["斜線がないマスがあります。","There is an empty cell."]
}
}));
