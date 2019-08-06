//
// パズル固有スクリプト部 ウォールロジック版 walllogic.js
//
(function(pidlist, classbase){
	if(typeof module==='object' && module.exports){module.exports = [pidlist, classbase];}
	else{ pzpr.classmgr.makeCustom(pidlist, classbase);}
}(
['walllogic'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputModes : {edit:['number','shade','clear']},
	mouseinput : function(){ // オーバーライド
		if(this.inputMode==='shade'){ this.inputBlock();}
		else{ this.common.mouseinput.call(this);}
	},
	mouseinput_auto : function(){
		if(this.puzzle.playmode){
			if(this.mousestart || this.mousemove){ this.inputWall();}
			else if(this.mouseend && this.notInputted()){ this.inputqcmp();}
		}
		else if(this.puzzle.editmode){
			if(this.mousestart){ this.inputcell_walllogic();}
		}
	},

	inputWall : function(){
		var cell = this.getcell();
		if(cell.isnull){ return;}

		// 黒マスや数字上なら何もしない
		if     (cell.ques===1 || cell.qnum!==-1){ }
		// 初回 or 入力し続けていて別のマスに移動した場合
		else if(this.mouseCell!==cell){
			this.firstPoint.set(this.inputPoint);
		}
		// まだ入力していないセルの場合
		else if(this.firstPoint.bx!==null){
			var dir=null,
				dx = this.inputPoint.bx-this.firstPoint.bx,
				dy = this.inputPoint.by-this.firstPoint.by;
			if     (dy<=-0.50){ dir=1;}
			else if(dy>= 0.50){ dir=2;}
			else if(dx<=-0.50){ dir=3;}
			else if(dx>= 0.50){ dir=4;}
			if(dir!==null && (this.inputData===null && cell.anum===dir)){ dir = -1;}

			// inputData/mode: -1:消去 1:追加 2:上書き
			var mode = null;
			if(dir===null){}
			else if(dir===-1    || this.inputData===-1){ mode = -1; dir = -1;}
			else if(cell.anum>0 || this.inputData=== 2){ mode = 2;}
			else if(cell.anum<0){ mode = 1;}

			if(mode!==null && (this.inputData===null || this.inputData===mode)){
				var basecell = [];
				if(cell.wall && this.puzzle.execConfig('autocmp')){ basecell.push(cell.wall.clist.getBaseCell());}

				// 描画・後処理
				cell.setAnum(dir);
				cell.drawaround();

				this.inputData = mode;
				this.firstPoint.reset();

				if(cell.wall && this.puzzle.execConfig('autocmp')){ basecell.push(cell.wall.clist.getBaseCell());}
				if(basecell.length>0){
					for(var i=0;i<basecell.length;i++){ if(basecell[i].qnum!==-1){ basecell[i].draw();}}
				}
			}
		}

		this.mouseCell = cell;
	},
	inputqcmp : function(){
		var cell = this.getcell();
		if(cell.isnull){ return;}

		cell.setQcmp(+!cell.qcmp);
		cell.draw();

		this.mousereset();
	},

	inputBlock : function(){
		var cell = this.getcell();
		if(cell.isnull || cell===this.mouseCell){ return;}

		cell.setQues(cell.ques===1?0:1);
		cell.setQnum(-1);
		cell.setAnum(-1);
		cell.drawaround();
		this.mouseCell = cell;
	},
	inputcell_walllogic : function(cell){
		var cell = this.getcell();
		if(cell.isnull || cell===this.mouseCell){ return;}
		if(cell!==this.cursor.getc()){
			this.setcursor(cell);
			return;
		}

		var qu = cell.ques, qn = cell.qnum, val;
		// -3:黒マス -2:何もなし -1:? 0以上:数字
		if  (qn!==-1){ val = (qn>=0 ? qn : -1);}
		else if(qu>0){ val = -3;}
		else         { val = -2;}

		var max = cell.getmaxnum(), min = -3;
		if(this.inputMode.match(/number/)){ min = -2;}

		if     (this.btn==='left'){  val++;}
		else if(this.btn==='right'){ val--;}
		if(val>max){ val=min;}
		if(val<min){ val=max;}

		if     (val >=-1){ cell.setQues(0); cell.setQnum(val>=0 ? val : -2);}
		else if(val===-2){ cell.setQues(0); cell.setQnum(-1);}
		else             { cell.setQues(1); cell.setQnum(-1);}
		cell.setAnum(-1);
		cell.draw();
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,

	keyinput : function(ca){
		if(this.key_inputqnum_tateyoko(ca)){ return;}
		this.key_inputqnum(ca);
	},
	key_inputqnum_tateyoko : function(ca){
		var cell = this.cursor.getc();
		if(ca==='q'||ca==='q1'||ca==='q2'){
			if(ca==='q'){ ca = (cell.ques!==1?'q1':'q2');}
			if(ca==='q1'){
				cell.setQues(1);
				cell.setQnum(-1);
				cell.setAnum(-1);
			}
			else if(ca==='q2'){ cell.setQues(0);}
		}
		else{ return false;}

		this.prev=cell;
		cell.drawaround();
		return true;
	}
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	maxnum : function(){
		var bd = this.board;
		return (bd.cols + bd.rows - 2);
	},
	minnum : 0,
	revdircell : function(dir){ return this.getaddr().movedir(dir,-2).getc();},
	isTip : function(){ return (this.getaddr().movedir(this.anum,2).getc().anum!==this.anum);},
	isGap : function(){
		if(this.anum===-1){ return false;}
		var dir = this.anum;
		var revdir = this.revdircell(this.anum).anum;
		if(revdir<=0){ revdir = 0;}
		var val = ((1<<dir)|(1<<revdir));
		return (val===0x18||val===0x06);
	},
	getWallClist : function(){
		var cell, adc=this.adjacent, clist = new this.klass.CellList();
		cell=adc.top;    if(cell.anum===cell.UP){ clist.extend(cell.wall.clist);}
		cell=adc.bottom; if(cell.anum===cell.DN){ clist.extend(cell.wall.clist);}
		cell=adc.left;   if(cell.anum===cell.LT){ clist.extend(cell.wall.clist);}
		cell=adc.right;  if(cell.anum===cell.RT){ clist.extend(cell.wall.clist);}
		return clist;
	},
	isCmp : function(){
		if(this.qcmp===1){ return true;}
		if(!this.puzzle.execConfig('autocmp')){ return false;}
		return (this.qnum===this.getWallClist().length);
	},
	draw : function(){
		var opemgr = this.puzzle.opemgr;
		if(opemgr.undoExec || opemgr.redoExec){
			this.drawaround();
		}
		else{
			this.common.draw.call(this);
		}
	}
},
CellList : {
	getBaseCell : function(){
		for(var i=0;i<this.length;++i){
			var cell = this[i];
			var cell2 = cell.revdircell(cell.anum);
			if(cell.wall===cell2.wall){ continue;}
			return cell2;
		}
		return this.board.emptycell;
	}
},
Board:{
	disable_subclear : true,

	addExtraInfo : function(){
		this.wallgraph = this.addInfoList(this.klass.AreaWallGraph);
	}
},
BoardExec:{
	adjustBoardData : function(key,d){
		this.adjustCellAnumArrow(key,d);
	},
	adjustCellAnumArrow : function(key,d){
		var trans = this.getTranslateDir(key);
		var clist = this.board.cellinside(d.x1,d.y1,d.x2,d.y2);
		for(var i=0;i<clist.length;i++){
			var cell = clist[i];
			var val = trans[cell.anum]; if(!!val){ cell.setAnum(val);}
		}
	}
},

"AreaWallGraph:AreaGraphBase":{
	enabled : true,
	relation : {'cell.anum':'node'},
	setComponentRefs : function(obj, component){ obj.wall = component;},
	getObjNodeList   : function(nodeobj){ return nodeobj.wallnodes;},
	resetObjNodeList : function(nodeobj){ nodeobj.wallnodes = [];},

	isnodevalid : function(cell){ return (cell.anum>0);},
	isedgevalidbynodeobj : function(cell1, cell2){
		if(cell1.anum!==cell2.anum){ return false;}
		var dir = cell1.getdir(cell2,2);
		if     (dir===cell1.UP || dir===cell1.DN){ return (cell1.anum===cell1.UP || cell1.anum===cell1.DN);}
		else if(dir===cell1.LT || dir===cell1.RT){ return (cell1.anum===cell1.LT || cell1.anum===cell1.RT);}
		return false;
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	autocmp : "number",
	gridcolor_type : "LIGHT",

	paint : function(){
		this.drawBGCells();
		this.drawGrid();
		this.drawQuesCells();

		this.drawWalls();

		this.drawQuesNumbers();

		this.drawChassis();

		this.drawTarget();
	},

	getBGCellColor : function(cell){
		if(cell.qnum!==-1 && (cell.error===1||cell.qinfo===1)){ return this.errbcolor1;}
		return null;
	},
	getQuesNumberColor : function(cell){
		if(cell.error===1){
			return this.errcolor1;
		}
		else if(cell.isCmp()){
			return this.qcmpcolor;
		}
		return this.quescolor;
	},

	drawWalls : function(){
		var g = this.vinc('cell_wall', 'auto');
		var al, aw, ag, tl, tw;

		al = this.bw;					// ArrowLength
		aw = Math.max(this.cw/6, 3)/2;	// ArrowWidth
		tl = this.cw*0.16;				// 矢じりの長さの座標(中心-長さ)
		tw = Math.max(this.cw/2, 4)/2;	// 矢じりの幅
		aw = (aw>=1?aw:1);
		tw = (tw>=5?tw:5);
		ag = Math.max(this.cw*0.08, 2);	// Arrow Gap

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i], dir = cell.anum;
			var color = null;
			if(dir>=1 && dir<=4){
				var info = cell.error || cell.qinfo;
				if     (info=== 1) { color = this.errlinecolor;}
				else if(info===-1) { color = this.noerrcolor;}
				else               { color = (cell.trial ? this.trialcolor : this.linecolor);}
			}

			g.vid = "c_wall_"+cell.id;
			if(!!color){
				g.fillStyle = color;
				g.beginPath();
				var px = cell.bx*this.bw, py = cell.by*this.bh;
				var args = [px,py];
				if(cell.isTip()){
					switch(dir){
						case cell.UP: args.push(aw,-tl,  tw,-tl, 0,-al, -tw,-tl, -aw,-tl); break;
						case cell.DN: args.push(aw, tl,  tw, tl, 0, al, -tw, tl, -aw, tl); break;
						case cell.LT: args.push(-tl,aw, -tl, tw, -al,0, -tl,-tw, -tl,-aw); break;
						case cell.RT: args.push( tl,aw,  tl, tw,  al,0,  tl,-tw,  tl,-aw); break;
					}
				}
				else{
					switch(dir){
						case cell.UP: args.push(aw,-al, -aw,-al); break;
						case cell.DN: args.push(aw, al, -aw, al); break;
						case cell.LT: args.push(-al,aw, -al,-aw); break;
						case cell.RT: args.push( al,aw,  al,-aw); break;
					}
				}
				var altail = al - (cell.isGap() ? ag : 0);
				switch(dir){
					case cell.UP: args.push(-aw, altail, aw, altail); break;
					case cell.DN: args.push(-aw,-altail, aw,-altail); break;
					case cell.LT: args.push( altail,-aw,  altail,aw); break;
					case cell.RT: args.push(-altail,-aw, -altail,aw); break;
				}
				args.push(true);
				g.setOffsetLinePath.apply(g, args);
				g.fill();
			}
			else{ g.vhide();}
		}
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodeWallLogic();
	},
	encodePzpr : function(type){
		this.encodeWallLogic();
	},

	decodeWallLogic : function(){
		var c=0, i=0, bstr = this.outbstr, bd = this.board;
		for(i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i), cell=bd.cell[c];

			if(ca === '+'){ cell.ques = 1;}
			else if(this.include(ca,"0","9")||this.include(ca,"a","f"))
							   { cell.qnum = parseInt(ca,16);}
			else if(ca === '-'){ cell.qnum = parseInt(bstr.substr(i+1,2),16); i+=2;}
			else if(ca === '.'){ cell.qnum = -2;}
			else if(ca >= 'g' && ca <= 'z'){ c += (parseInt(ca,36)-16);}

			c++;
			if(!bd.cell[c]){ break;}
		}
		this.outbstr = bstr.substr(i);
	},
	encodeWallLogic : function(type){
		var cm="", count=0, bd = this.board;
		for(var c=0;c<bd.cell.length;c++){
			var pstr="", qu=bd.cell[c].ques, qn=bd.cell[c].qnum;
			if     (qu=== 1){ pstr="+";}
			else if(qn===-1){ count++;}
			else if(qn===-2){ pstr=".";}
			else if(qn<  16){ pstr="" +qn.toString(16);}
			else if(qn< 256){ pstr="-"+qn.toString(16);}
			else{ pstr=""; count++;}

			if(count===0){ cm += pstr;}
			else if(pstr || count===20){ cm+=((15+count).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm+=(15+count).toString(36);}

		this.outbstr += cm;
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeQuesQnum();
		this.decodeCellAnumcmp();
	},
	encodeData : function(){
		this.encodeQuesQnum();
		this.encodeCellAnumcmp();
	},

	decodeQuesQnum : function(){
		this.decodeCell( function(cell,ca){
			if     (ca==="#"){ cell.ques = 1;}
			else if(ca==="-"){ cell.qnum = -2;}
			else if(ca!=="."){ cell.qnum = +ca;}
		});
	},
	encodeQuesQnum : function(){
		this.encodeCell( function(cell){
			if     (cell.ques=== 1){ return "# ";}
			else if(cell.qnum>=0)  { return cell.qnum+" ";}
			else if(cell.qnum===-2){ return "- ";}
			else                   { return ". ";}
		});
	},
	decodeCellAnumcmp : function(){
		this.decodeCell( function(cell,ca){
			if     (ca==="-"){ cell.qcmp = 1;}
			else if(ca!=="."){ cell.anum = +ca;}
		});
	},
	encodeCellAnumcmp : function(){
		this.encodeCell( function(cell){
			if     (cell.anum!==-1){ return ""+cell.anum + " ";}
			else if(cell.qcmp===1){ return "- ";}
			else                  { return ". ";}
		});
	}
},
//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checklist : [
		"checkWallExist+",
		"checkLongWall",
		"checkShortWall",
		"checkNoWall",
		"checkIsolateWall"
	],

	checkWallExist : function(){
		if(!this.puzzle.execConfig('allowempty')){
			if(this.board.wallgraph.components.length>0){ return;}
			this.failcode.add("brNoLine");
		}
	},

	checkLongWall  : function(){ this.checkWall(1, "nmConnWallGt");},
	checkShortWall : function(){ this.checkWall(2, "nmConnWallLt");},
	checkNoWall    : function(){ this.checkWall(3, "nmConnNoWall");},
	checkWall : function(type, code){
		var bd = this.board, result = true;
		for(var c=0;c<bd.cell.length;c++){
			var cell = bd.cell[c], num = cell.qnum;
			if(num<0){ continue;}

			var clist = cell.getWallClist();
			if((type===1 && clist.length<=num) ||
			   (type===2 && (clist.length>=num || clist.length===0)) ||
			   (type===3 && (clist.length>0 && num>0))){ continue;}

			result = false;
			if(this.checkOnly){ break;}
			cell.seterr(1);
			clist.seterr(1);
		}
		if(!result){
			this.failcode.add(code);
			bd.cell.setnoerr();
		}
	},

	checkIsolateWall : function(){
		var walls = this.board.wallgraph.components, result = true;
		for(var r=0;r<walls.length;r++){
			var clist = walls[r].clist;
			if(clist.getBaseCell().qnum!==-1){ continue;}

			result = false;
			if(this.checkOnly){ break;}
			clist.seterr(1);
		}
		if(!result){
			this.failcode.add("lbIsolate");
			this.board.cell.setnoerr();
		}
	}
},

FailCode:{
	nmConnWallGt : ["数字に繋がる線が長いです。","The lines connected to a number is long."],
	nmConnWallLt : ["数字に繋がる線が短いです。","The lines connected to a number is short."],
	nmConnNoWall : ["数字に線が繋がっていません。","The number isn't connected by any lines."],
	lbIsolate : ["数字につながっていない線があります。","A line doesn't connect to any number."]
}
}));
