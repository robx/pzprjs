//
// パズル固有スクリプト部 流れるループ版 nagare.js v3.5.0
//
pzpr.classmgr.makeCustom(['nagare'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.owner.playmode){
			if(this.btn.Left){
				if(this.mousestart || this.mousemove){ this.inputLine();}
				else if(this.mouseend && this.notInputted()){ this.clickmark();}
			}
			else if(this.btn.Right){
				if     (this.mousestart){ this.inputmark_mousedown();}
				else if(this.inputData===2 || this.inputData===3){ this.inputpeke();}
				else if(this.mousemove) { this.inputmark_mousemove();}
			}
		}
		else if(this.owner.editmode){
			if(this.mousestart || this.mousemove)       { this.inputarrow_cell();}
			else if(this.mouseend && this.notInputted()){ this.inputShadeCell();}
		}
	},

	clickmark : function(){
		var pos = this.getpos(0.22);
		if(this.prevPos.equals(pos)){ return;}

		var border = pos.getb();
		if(border.isnull){ return;}

		var trans = {0:2,2:0}, diraux = this.owner.getConfig("dirauxmark");
		if(diraux){
			if(!border.isvert){ trans = (this.btn.Left?{0:2,2:11,11:12,12:0}:{0:12,12:11,11:2,2:0});}
			else              { trans = (this.btn.Left?{0:2,2:13,13:14,14:0}:{0:14,14:13,13:2,2:0});}
		}
		border.setQsub(trans[border.qsub] || 0);
		if(!diraux){ border.setLineVal(0);}
		border.draw();
	},
	inputmark_mousedown : function(){
		var pos = this.getpos(0.22), border = pos.getb();
		if(!this.owner.getConfig("dirauxmark") || !border.isnull){
			this.inputData = ((border.isnull||border.qsub!==2)?2:3);
			this.inputpeke();
		}
	},
	inputmark_mousemove : function(){
		var pos = this.getpos(0);
		if(pos.getc().isnull){ return;}

		var border = this.getnb(this.prevPos, pos);
		if(!border.isnull){
			var newval = null, dir = this.getdir(this.prevPos, pos);
			if(this.inputData===null){ this.inputData = (border.qsub!==(10+dir)?11:0);}
			if(this.inputData===11){ newval = 10+dir;}
			else if(this.inputData===0 && border.qsub===10+dir){ newval = 0;}
			if(newval!==null){
				border.setQsub(newval);
				border.draw();
			}
		}
		this.prevPos = pos;
	},

	// オーバーライド
	inputarrow_cell_main : function(cell, dir){
		cell.setQdir(cell.qdir!==dir?dir:0);
	},
	inputShadeCell : function(){
		var cell = this.getcell();
		if(cell.isnull || cell===this.mouseCell){ return;}

		if(cell!==this.cursor.getc() && this.owner.getConfig('cursor')){
			this.setcursor(cell);
		}
		else{
			cell.setQues(cell.ques===1?0:1);
			cell.drawaround();
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
		this.key_inputques_nagare(ca);
	},
	key_inputques_nagare : function(ca){
		if(ca==='q'||ca==='w'){
			var cell = this.cursor.getc();
			cell.setQues(cell.ques!==1?1:0);
			cell.drawaround();
		}
	}
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	wind : 0, /* セルに風が吹いているかどうか判定するためのパラメータ (qdir値とは別) */
			  /* 0-15:2進数の4桁がそれぞれ風の吹いてくる向きを表す 4方向から風が吹くと15 */

	// 線を引かせたくないので上書き
	noLP : function(dir){ return this.ques===1;}
},
Border:{
	wind : 0, /* 逆に進んでいないか判定するためのパラメータ (qdir値とは別) */
			  /* 0:風なし 1:下から上へ 2:上から下へ 3:上下両方 4:右から左へ 8:左から右へ 12:左右両方 */

	enableLineNG : true,

	setLine    : function(id){ this.setLineVal(1); if(this.qsub===2){ this.setQsub(0);}},
	removeLine : function(id){ this.setLineVal(0); if(this.qsub===2){ this.setQsub(0);}}
},
Board:{
	hasborder : 1,

	generateWind : function(){
		for(var i=0;i<this.cellmax;i++){ this.cell[i].wind = 0;}
		for(var i=0;i<this.bdmax;i++){ this.border[i].wind = 0;}
		this.owner.checker.checkRowsColsPartly(this.setWind, function(cell){ return cell.ques===1;}, null);
	},
	setWind : function(clist, info){
		var bd = this.owner.board; /* this=ansになってしまうので修正  */
		var d = clist.getRectSize();
		var cell1 = (info.isvert ? bd.getc(d.x1,d.y1-2) : bd.getc(d.x1-2,d.y1));
		var cell2 = (info.isvert ? bd.getc(d.x2,d.y2+2) : bd.getc(d.x2+2,d.y2));
		var isdir1 = cell1.qdir===(info.isvert?cell1.DN:cell1.RT);
		var isdir2 = cell2.qdir===(info.isvert?cell1.UP:cell1.LT);
		if(isdir1 || isdir2){
			var wind = 0;
			if(isdir1 && isdir2){ wind = (info.isvert ? 3 : 12);} /* 向かい合わせに風が吹いている */
			else if(isdir1){ wind = (info.isvert ? 2 : 8);}
			else if(isdir2){ wind = (info.isvert ? 1 : 4);}
			
			for(var i=0; i<clist.length; i++){ clist[i].wind += wind;}
			if(!cell1.isnull){ cell1.wind += wind;}
			if(!cell2.isnull){ cell2.wind += wind;}
			
			var blist = bd.borderinside(d.x1, d.y1, d.x2, d.y2);
			for(var i=0; i<blist.length; i++){ blist[i].wind += wind;}
		}
		return true;
	},

	getTraceInfo : function(){
		var traces = [];
		var xinfo = this.getLineShapeInfo();
		for(var id=1;id<=xinfo.max;id++){
			var path = xinfo.path[id], info;
			var info1 = this.searchTraceInfo(path.cells[0], path.dir1);
			var info2 = this.searchTraceInfo(path.cells[1], path.dir2);
			
			/* 矢印に反した数が少ない方を優先して出力する */
			var invc1 = info1.clist.length;
			var invc2 = info2.clist.length;
			if     (invc1 < invc2){ info = info1;}
			else if(invc1 > invc2){ info = info2;}
			else{
				/* 矢印が同じ場合、風に反した数が少ない方を優先して出力 */
				var invb1 = info1.blist.length;
				var invb2 = info2.blist.length;
				info = (invb1 < invb2 ? info1 : info2);
			}
			traces.push(info);
		}
		return traces;
	},
	searchTraceInfo : function(cell1, dir){
		var info = {clist:(new this.owner.CellList()), blist:(new this.owner.BorderList())};
		var pos = cell1.getaddr(), c = 0, n = 0;

		while(1){
			pos.movedir(dir,1);
			if(pos.oncell()){
				var cell = pos.getc();
				if(cell1===cell){ break;} // 一周して戻ってきた

				if(cell.qdir!==cell.NDIR && cell.qdir!==dir){ info.clist[c++] = cell;}

				var adb = cell.adjborder;
				if     (cell.lcnt!==2){ break;}
				else if(dir!==1 && adb.bottom.isLine()){ dir=2;}
				else if(dir!==2 && adb.top.isLine()   ){ dir=1;}
				else if(dir!==3 && adb.right.isLine() ){ dir=4;}
				else if(dir!==4 && adb.left.isLine()  ){ dir=3;}
			}
			else{
				var border = pos.getb();
				if(!border.isLine()){ break;} // 途切れてたら終了

				if(border.wind&(15^[0,1,2,4,8][dir])){ info.blist[n++] = border;}
			}
		}
		info.clist.length = c;
		info.blist.length = n;
		return info;
	}
},

LineManager:{
	isCenterLine : true,
	
	// オーバーライド (孤立した線やループも判定対象にする)
	getLineShapeBase : function(){
		var boardcell = this.owner.board.cell;
		return [ boardcell.filter(this.getLineShapeSeparator),
				 boardcell.filter(function(cell){ return cell.isLineCurve();}) ];
	},
	getLineShapeSeparator : function(cell){
		return cell.lcnt===1 || cell.lcnt>=3;
	}
},

BoardExec:{
	adjustBoardData : function(key,d){
		this.adjustCellArrow(key,d);
		
		if(key & this.TURNFLIP){
			var trans = this.getTranslateDir(key);
			var blist = this.owner.board.borderinside(d.x1,d.y1,d.x2,d.y2);
			for(var i=0;i<blist.length;i++){
				var border=blist[i], val;
				val=trans[border.qsub-10]; if(!!val){ border.setQsub(val+10);}
			}
		}
	}
},

Flags:{
	redline : true,
	irowake : 1
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	cellcolor_func : "ques",
	gridcolor_type : "LIGHT",
	errbcolor1_type : "DARK",

	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();
		this.drawShadedCells();

		this.drawCellArrows();

		this.drawLines();
		this.drawPekes();
		this.drawBorderAuxDir();

		this.drawChassis();

		this.drawTarget();
	},
	getCellArrowColor : function(cell){
		return (cell.ques===0 ? this.quescolor : "white");
	},

	drawBorderAuxDir : function(){
		var g = this.vinc('border_dirsub', 'crispEdges');
		var ssize = this.cw*0.10;

		g.lineWidth = this.cw*0.1;
		g.strokeStyle = this.borderQsubcolor2;

		var blist = this.range.borders;
		for(var i=0;i<blist.length;i++){
			var border=blist[i], px = border.bx*this.bw, py = border.by*this.bh, dir = border.qsub-10;

			// 向き補助記号の描画
			g.vid = "b_daux_"+border.id;
			if(dir>=1 && dir<=8){
				g.beginPath();
				switch(dir){
					case border.UP: g.setOffsetLinePath(px,py ,-ssize*2,+ssize ,0,-ssize ,+ssize*2,+ssize, false); break;
					case border.DN: g.setOffsetLinePath(px,py ,-ssize*2,-ssize ,0,+ssize ,+ssize*2,-ssize, false); break;
					case border.LT: g.setOffsetLinePath(px,py ,+ssize,-ssize*2 ,-ssize,0 ,+ssize,+ssize*2, false); break;
					case border.RT: g.setOffsetLinePath(px,py ,-ssize,-ssize*2 ,+ssize,0 ,-ssize,+ssize*2, false); break;
				}
				g.stroke();
			}
			else{ g.vhide();}
		}
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodeNagare();
	},
	encodePzpr : function(type){
		this.encodeNagare();
	},

	decodeNagare : function(){
		var c=0, i=0, bstr = this.outbstr, bd = this.owner.board;
		for(i=0;i<bstr.length;i++){
			var cell = bd.cell[c], ca = bstr.charAt(i);

			if(this.include(ca,"1","9")){
				var val=parseInt(ca,10);
				cell.ques = (val/5)|0;
				cell.qdir = val%5;
			}
			else if(this.include(ca,"a","z")){ c += (parseInt(ca,36)-10);}

			c++;
			if(c>=bd.cellmax){ break;}
		}
		this.outbstr = bstr.substr(i+1);
	},
	encodeNagare : function(){
		var cm="", count=0, bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			var pstr="", cell=bd.cell[c], qu=cell.ques, dir=cell.qdir;

			if(qu===1 || (dir>=1&&dir<=4)){ pstr = (qu*5+dir).toString(10);}
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
			if(ca!=="."){
				var val = {u:1,d:2,l:3,r:4,N:5,U:6,D:7,L:8,R:9}[ca];
				cell.ques = (val/5)|0;
				cell.qdir = val%5;
			}
		});
		this.decodeBorder( function(border,ca){
			var lca = ca.charAt(ca.length-1);
			if(lca>="a"&&lca<="z"){
				if     (lca==="u"){ border.qsub = 11;}
				else if(lca==="d"){ border.qsub = 12;}
				else if(lca==="l"){ border.qsub = 13;}
				else if(lca==="r"){ border.qsub = 14;}
				ca = ca.substr(0,ca.length-1);
			}
			
			if(ca!=="" && ca!=="0"){
				if(ca.charAt(0)==="-"){ border.line = (-ca)-1; border.qsub = 2;}
				else                  { border.line = +ca;}
			}
		});
	},
	encodeData : function(){
		this.encodeCell( function(cell){
			if(cell.ques===1 || (cell.qdir>=1&&cell.qdir<=4)){
				var val = cell.ques*5+cell.qdir;
				return ["u ","d ","l ","r ","N ","U ","D ","L ","R "][val-1];
			}
			else{ return ". ";}
		});
		this.encodeBorder( function(border){
			var ca = "";
			if     (border.qsub===2){ ca += ""+(-1-border.line);}
			else if(border.line>  0){ ca += ""+border.line;}
			
			if(border.qsub>=11){ ca += ["u","d","l","r"][border.qsub-11];}
			
			return (ca!=="" ? ca+" " : "0 ");
		});
	}
},
//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checklist : [
		"checkLineExist+",
		"checkBothSideWind", // 問題確認用
		"checkArrowAgainst", // 問題確認用
		"checkLineOnShadeCell",
		"checkCrossLine+",
		"checkBranchLine+",
		"checkAcrossArrow",
		"checkLineArrowDirection",
		"checkLineWindDirection",
		"checkAcrossWind",
		"checkAllArrow",
		"checkDeadendLine++",
		"checkOneLoop"
	],

	getTraceInfo : function(){
		this.generateWind();
		return (this._info.trace = this._info.trace || this.owner.board.getTraceInfo());
	},

	generateWind : function(){
		if(!this._info.wind){
			this.owner.board.generateWind();
			this._info.wind = true;
		}
	},

	checkBothSideWind : function(){
		this.generateWind();
		this.checkAllCell(function(cell){ return cell.ques===1 && ((cell.wind&3)===3 || (cell.wind&12)===12);}, "windBothSide");
	},
	checkArrowAgainst : function(){
		this.generateWind();
		var boardcell = this.owner.board.cell;
		for(var i=0;i<boardcell.length;i++){
			var cell = boardcell[i], arwind = (cell.wind&(15^[0,1,2,4,8][cell.qdir]));
			if(cell.qdir===0 || cell.ques===1 || !arwind){ continue;}
			
			this.failcode.add("arAgainstWind");
			if(this.checkOnly){ break;}
			this.setCellErrorToWindBase(cell, arwind);
		}
	},
	checkAcrossWind : function(){
		this.generateWind();
		var boardcell = this.owner.board.cell;
		for(var i=0;i<boardcell.length;i++){
			var cell = boardcell[i];
			var errv = ((cell.wind&3)!==0 && cell.isLineStraight()===2);
			var errh = ((cell.wind&12)!==0 && cell.isLineStraight()===1);
			if(!errv && !errh){ continue;}
			
			this.failcode.add("lrAcrossWind");
			if(this.checkOnly){ break;}
			this.setCellErrorToWindBase(cell, (cell.wind & ((errv?3:0)|(errh?12:0))));
		}
	},
	checkAcrossArrow : function(){
		this.checkAllCell(function(cell){
			var adb = cell.adjborder;
			return ((cell.qdir===1||cell.qdir===2) && (adb.left.isLine() || adb.right.isLine())) ||
					((cell.qdir===3||cell.qdir===4) && (adb.top.isLine() || adb.bottom.isLine()));
		}, "lrAcrossArrow");
	},
	checkAllArrow : function(){
		this.checkAllCell(function(cell){ return (cell.ques===0 && cell.qdir>0 && cell.lcnt===0);}, "arNoLine");
	},

	checkLineWindDirection : function(){
		var traces = this.getTraceInfo();
		for(var i=0;i<traces.length;i++){
			var blist = traces[i].blist;
			if(blist.length===0){ continue;}
			
			this.failcode.add("lrAgainstWind");
			if(this.checkOnly){ break;}
			
			this.owner.board.border.setnoerr();
			for(var j=0;j<blist.length;j++){
				this.setBorderErrorToWindBase(blist[j], blist[j].wind);
			}
		}
	},
	checkLineArrowDirection : function(){
		var traces = this.getTraceInfo();
		for(var i=0;i<traces.length;i++){
			var clist = traces[i].clist;
			if(clist.length===0){ continue;}
			
			this.failcode.add("lrAgainstArrow");
			if(this.checkOnly){ break;}
			clist.seterr(1);
		}
	},

	setCellErrorToWindBase : function(cell, wind){
		var cell2;
		cell.seterr(1);
		if(wind&1){ cell2=cell; while(!cell2.isnull){ if(cell2.ques===1){ cell2.seterr(1); break;} cell2=cell2.adjacent.bottom;} }
		if(wind&2){ cell2=cell; while(!cell2.isnull){ if(cell2.ques===1){ cell2.seterr(1); break;} cell2=cell2.adjacent.top;   } }
		if(wind&4){ cell2=cell; while(!cell2.isnull){ if(cell2.ques===1){ cell2.seterr(1); break;} cell2=cell2.adjacent.right; } }
		if(wind&8){ cell2=cell; while(!cell2.isnull){ if(cell2.ques===1){ cell2.seterr(1); break;} cell2=cell2.adjacent.left;  } }
	},
	setBorderErrorToWindBase : function(border, wind){
		var cell2;
		border.seterr(1);
		if(wind&1){ cell2=border.sidecell[1]; while(!cell2.isnull){ if(cell2.ques===1){ cell2.seterr(1); break;} cell2=cell2.adjacent.bottom;} }
		if(wind&2){ cell2=border.sidecell[0]; while(!cell2.isnull){ if(cell2.ques===1){ cell2.seterr(1); break;} cell2=cell2.adjacent.top;   } }
		if(wind&4){ cell2=border.sidecell[1]; while(!cell2.isnull){ if(cell2.ques===1){ cell2.seterr(1); break;} cell2=cell2.adjacent.right; } }
		if(wind&8){ cell2=border.sidecell[0]; while(!cell2.isnull){ if(cell2.ques===1){ cell2.seterr(1); break;} cell2=cell2.adjacent.left;  } }
	}
},

FailCode:{
	windBothSide   : ["風が向かい合わせに吹いています。","The wind blows from both sides."],
	arNoLine       : ["線が通っていない矢印があります。","A line doesn't go through some arrows."],
	arAgainstWind  : ["矢印の向きが風の指示と合っていません。","The direction of the arrow is against the wind."],
	lrAcrossWind   : ["線が風で流されずに横切っています。","The line passes across the wind."],
	lrAcrossArrow  : ["線が矢印を横切っています。","The line passes across an arrow."],
	lrAgainstWind  : ["線が風上に向かって進んでいます。","The line passes against the wind."],
	lrAgainstArrow : ["線が矢印に反して進んでいます。","The line passes against an arrow."]
}
});
