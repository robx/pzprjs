//
// パズル固有スクリプト部 ぬりめいず版 nurimaze.js
//
(function(pidlist, classbase){
	if(typeof module==='object' && module.exports){module.exports = [pidlist, classbase];}
	else{ pzpr.classmgr.makeCustom(pidlist, classbase);}
}(
['nurimaze'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	use : true,
	inputModes : {edit:['border', 'mark-circle', 'mark-triangle'], play:['shade','unshade']},
	mouseinput : function(){ // オーバーライド
		if(this.inputMode==='shade'||this.inputMode==='unshade'){
			this.inputtile_nurimaze();
		}
		else{ this.common.mouseinput.call(this);}
	},
	mouseinput_other : function(){
		if(this.inputMode.indexOf('mark-')===0){
			this.inputmarks();
		}
	},
	mouseinput_auto : function(){
		if(this.puzzle.playmode){
			if(this.mousestart || this.mousemove){ this.inputtile_nurimaze();}
		}
		else if(this.puzzle.editmode){
			if(this.mousestart || this.mousemove){ this.inputEdit();}
			else if(this.mouseend){ this.inputEdit_end();}
		}
	},

	inputtile_nurimaze : function(){
		var cell = this.getcell();
		if(cell.isnull || cell===this.mouseCell){ return;}
		if(this.inputData===null){ this.decIC(cell);}

		var bd = this.board, clist = cell.room.clist;
		if(this.inputData===1){
			for(var i=0;i<clist.length;i++){
				if(clist[i].ques!==0 || bd.startpos.equals(clist[i]) || bd.goalpos.equals(clist[i])){
					if(this.mousestart){ this.inputData=(cell.qsub!==1?2:0); break;}
					else{ return;}
				}
			}
		}

		this.mouseCell = cell;
		for(var i=0;i<clist.length;i++){
			var cell2 = clist[i];
			(this.inputData===1?cell2.setShade:cell2.clrShade).call(cell2);
			cell2.setQsub(this.inputData===2?1:0);
		}
		clist.draw();
	},

	inputEdit : function(){
		var cell = this.getcell();
		if(cell.isnull){ return;}

		// 初回はこの中に入ってきます。
		if(this.inputData===null){
			this.inputEdit_first();
		}

		// startposの入力中の場合
		if(this.inputData===10){
			this.board.startpos.input(cell);
		}
		// goalposの入力中の場合
		else if(this.inputData===11){
			this.board.goalpos.input(cell);
		}
		// 境界線の入力中の場合
		else if(this.inputData!==null){
			this.inputborder();
		}
	},
	inputEdit_first : function(){
		var pos = this.getpos(0.33), bd = this.board;
		// startposの上ならstartpos移動ルーチンへ移行
		if(bd.startpos.equals(pos)){
			this.inputData = 10;
		}
		// goalposの上ならgoalpos移動ルーチンへ移行
		else if(bd.goalpos.equals(pos)){
			this.inputData = 11;
		}
		// その他は境界線の入力へ
		else{
			this.inputborder();
		}
	},

	inputEdit_end : function(){
		var cell = this.getcell();
		if(cell.isnull){ return;}

		if(this.inputData===10 || this.inputData===11){
			this.inputData = null;
			cell.draw();
		}
		else if(this.notInputted()){
			if(cell!==this.cursor.getc()){
				this.setcursor(cell);
			}
			else{
				/* ○と△の入力ルーチンへジャンプ */
				this.inputQuesMark(cell);
			}
		}
	},

	inputmarks : function(){
		var cell = this.getcell();
		if(cell.isnull || cell===this.mouseCell){ return;}

		this.inputQuesMark(cell);

		this.mouseCell = cell;
	},
	inputQuesMark :function(cell){
		var bd = this.board, newques=-1;
		if     (this.inputMode==='mark-circle')  { newques = (cell.ques!==41?41:0);}
		else if(this.inputMode==='mark-triangle'){ newques = (cell.ques!==42?42:0);}
		else if(this.btn==='left' ){ newques={0:41,41:42,42:0}[cell.ques];}
		else if(this.btn==='right'){ newques={0:42,42:41,41:0}[cell.ques];}
		else { return;}

		if(newques===0 || (!bd.startpos.equals(cell) && !bd.goalpos.equals(cell))){
			cell.setQues(newques);
			cell.draw();
		}
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,

	keyinput : function(ca){
		if(this.keydown && this.puzzle.editmode){
			this.key_inputqnum_nurimaze(ca);
		}
	},
	key_inputqnum_nurimaze : function(ca){
		var cell = this.cursor.getc(), bd = this.board;

		var old=cell.ques, newques=-1;
		if     (ca==='1'||ca==='q'){ newques=(old!==41?41:0);}
		else if(ca==='2'||ca==='w'){ newques=(old!==42?42:0);}
		else if(ca==='3'||ca==='e'||ca===' '||ca==='BS'){ newques=0;}
		else if(ca==='s'){ bd.startpos.input(cell);}
		else if(ca==='g'){ bd.goalpos.input(cell);}
		else { return;}

		if(newques!==old && (newques===0 || (!bd.startpos.equals(cell) && !bd.goalpos.equals(cell)))){
			cell.setQues(newques);
			cell.draw();
		}
	}
},

//---------------------------------------------------------
// 盤面管理系
Board:{
	hasborder : 1,

	startpos : null,
	goalpos  : null,

	createExtraObject : function(){
		var classes = this.klass;
		this.startpos = new classes.StartAddress(1,1);
		this.goalpos  = new classes.GoalAddress(this.cols*2-1,this.rows*2-1);
		this.startpos.partner = this.goalpos;
		this.goalpos.partner  = this.startpos;
	},
	initExtraObject : function(col,row){
		this.disableInfo();
		this.startpos.init(1,1);
		this.goalpos.init(col*2-1,row*2-1);
		this.enableInfo();
	},

	exchangestartgoal : function(){
		var old_start = this.startpos.getc();
		var old_goal  = this.goalpos.getc();
		this.startpos.set(old_goal);
		this.goalpos.set(old_start);

		this.startpos.draw();
		this.goalpos.draw();
	}
},
BoardExec:{
	posinfo : {},
	adjustBoardData : function(key,d){
		var bd = this.board;

		this.posinfo_start = this.getAfterPos(key,d,bd.startpos.getc());
		this.posinfo_goal  = this.getAfterPos(key,d,bd.goalpos.getc());
	},
	adjustBoardData2 : function(key,d){
		var bd = this.board, opemgr = this.puzzle.opemgr;
		var info1 = this.posinfo_start, info2 = this.posinfo_goal, isrec;

		isrec = ((key & this.REDUCE) && (info1.isdel || info2.isdel) && (!opemgr.undoExec && !opemgr.redoExec));
		if(isrec){ opemgr.forceRecord = true;}
		bd.startpos.set(info1.pos.getc());
		bd.goalpos.set(info2.pos.getc());
		if(isrec){ opemgr.forceRecord = false;}
	}
},

"StartGoalAddress:Address":{
	type : "",
	partner : null,

	init : function(bx,by){
		this.bx = bx;
		this.by = by;
		return this;
	},

	input : function(cell){
		if(!this.partner.equals(cell)){
			if(!this.equals(cell)){
				this.set(cell);
			}
			else{
				this.draw();
			}
		}
		else{
			this.board.exchangestartgoal();
		}
	},
	set : function(pos){
		var pos0 = this.getaddr();
		this.addOpe(pos.bx, pos.by);

		this.bx = pos.bx;
		this.by = pos.by;

		pos0.draw();
		this.draw();
	},

	addOpe : function(bx, by){
		if(this.bx===bx && this.by===by){ return;}
		this.puzzle.opemgr.add(new this.klass.StartGoalOperation(this.type, this.bx,this.by, bx,by));
	}
},
"StartAddress:StartGoalAddress":{
	type : "start"
},
"GoalAddress:StartGoalAddress":{
	type : "goal"
},

"StartGoalOperation:Operation":{
	setData : function(x1, y1, x2, y2){
		this.bx1 = x1;
		this.by1 = y1;
		this.bx2 = x2;
		this.by2 = y2;
	},
	decode : function(strs){
		if(strs[0]!=='PS' && strs[0]!=='PG'){ return false;}
		this.property = (strs[0]==='PS'?'start':'goal');
		this.bx1 = +strs[1];
		this.by1 = +strs[2];
		this.bx2 = +strs[3];
		this.by2 = +strs[4];
		return true;
	},
	toString : function(){
		return [(this.property==='start'?'PS':'PG'), this.bx1, this.by1, this.bx2, this.by2].join(',');
	},

	isModify : function(lastope){
		// 1回の入力でstartpos, goalposが連続して更新されているなら前回の更新のみ
		if( this.manager.changeflag && lastope.bx2 === this.bx1 && lastope.by2 === this.by1 && lastope.property === this.property ){
			lastope.bx2 = this.bx2;
			lastope.by2 = this.by2;
			return true;
		}
		return false;
	},

	undo : function(){ this.exec(this.bx1, this.by1);},
	redo : function(){ this.exec(this.bx2, this.by2);},
	exec : function(bx, by){
		var bd = this.board, cell = bd.getc(bx, by);
		if     (this.property==='start'){ bd.startpos.set(cell);}
		else if(this.property==='goal') { bd.goalpos.set(cell);}
	}
},
OperationManager:{
	addExtraOperation : function(){
		this.operationlist.push(this.klass.StartGoalOperation);
	}
},

AreaUnshadeGraph:{
	enabled : true
},
AreaRoomGraph:{
	enabled : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	enablebcolor : true,
	bgcellcolor_func : "qsub1",
	errbcolor2 : "rgb(192, 192, 255)",
	bbcolor : "rgb(96, 96, 96)",

	paint : function(){
		this.drawBGCells();
		this.drawShadedCells();
		this.drawGrid();

		this.drawQuesMarks();
		this.drawStartGoal();

		this.drawBorders();

		this.drawChassis();

		this.drawBoxBorders(true);

		this.drawTarget();
	},

	drawStartGoal : function(){
		var g = this.vinc('cell_sg', 'auto');
		var bd = this.board, d = this.range;

		g.vid = "text_stpos";
		var cell = bd.startpos.getc();
		if(cell.bx>=d.x1 && d.x2>=cell.bx && cell.by>=d.y1 && d.y2>=cell.by){
			if(!cell.isnull){
				g.fillStyle = (this.puzzle.mouse.inputData===10 ? "red" : (cell.qans===1 ? this.fontShadecolor : this.quescolor));
				this.disptext("S", cell.bx*this.bw, cell.by*this.bh);
			}
			else{ g.vhide();}
		}

		g.vid = "text_glpos";
		cell = bd.goalpos.getc();
		if(cell.bx>=d.x1 && d.x2>=cell.bx && cell.by>=d.y1 && d.y2>=cell.by){
			if(!cell.isnull){
				g.fillStyle = (this.puzzle.mouse.inputData===11 ? "red" : (cell.qans===1 ? this.fontShadecolor : this.quescolor));
				this.disptext("G", cell.bx*this.bw, cell.by*this.bh);
			}
			else{ g.vhide();}
		}
	},

	drawQuesMarks : function(){
		var g = this.vinc('cell_mark', 'auto', true);

		var rsize = this.cw*0.30, tsize=this.cw*0.26;
		g.lineWidth = 2;

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i], num=cell.ques;
			var px = cell.bx*this.bw, py = cell.by*this.bh;
			g.strokeStyle = this.getQuesNumberColor(cell);

			g.vid = "c_mk1_"+cell.id;
			if(num===41){
				g.strokeCircle(px, py, rsize);
			}
			else{ g.vhide();}

			g.vid = "c_mk2_"+cell.id;
			if(num===42){
				g.beginPath();
				g.setOffsetLinePath(px, py, 0,-tsize, -rsize,tsize, rsize,tsize, true);
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
		this.decodeBorder();
		this.decodeCell_nurimaze();
	},
	encodePzpr : function(type){
		this.encodeBorder();
		this.encodeCell_nurimaze();
	},

	decodeCell_nurimaze : function(){
		var c=0, i=0, bstr = this.outbstr, bd = this.board;
		for(i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i), cell = bd.cell[c];

			if     (ca==='1'){ bd.startpos.set(cell);}
			else if(ca==='2'){ bd.goalpos.set(cell);}
			else if(ca==='3'){ cell.ques = 41;}
			else if(ca==='4'){ cell.ques = 42;}
			else if(this.include(ca,"5","9")||this.include(ca,"a","z")){ c+=(parseInt(ca,36)-5);}

			c++;
			if(!bd.cell[c]){ break;}
		}
		this.outbstr = bstr.substr(i+1);
	},
	encodeCell_nurimaze : function(){
		var cm="", count=0, bd=this.board;
		for(var c=0;c<bd.cell.length;c++){
			var pstr="", cell=bd.cell[c];
			if     (bd.startpos.equals(cell)){ pstr = "1";}
			else if(bd.goalpos.equals(cell) ){ pstr = "2";}
			else if(cell.ques===41){ pstr = "3";}
			else if(cell.ques===42){ pstr = "4";}
			else{ count++;}

			if(count===0){ cm += pstr;}
			else if(pstr || count===31){ cm+=((4+count).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm+=(4+count).toString(36);}

		this.outbstr += cm;
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeAreaRoom();
		this.decodeCellQues_nurimaze();
		this.decodeCellAns();
	},
	encodeData : function(){
		this.encodeAreaRoom();
		this.encodeCellQues_nurimaze();
		this.encodeCellAns();
	},

	decodeCellQues_nurimaze : function(){
		var bd = this.board;
		this.decodeCell( function(cell,ca){
			if     (ca==="s"){ bd.startpos.set(cell);}
			else if(ca==="g"){ bd.goalpos.set(cell);}
			else if(ca==="o"){ cell.ques = 41;}
			else if(ca==="t"){ cell.ques = 42;}
		});
	},
	encodeCellQues_nurimaze : function(){
		var bd = this.board;
		this.encodeCell( function(cell){
			if     (bd.startpos.equals(cell)){ return "s ";}
			else if(bd.goalpos.equals(cell)) { return "g ";}
			else if(cell.ques===41){ return "o ";}
			else if(cell.ques===42){ return "t ";}
			else{ return ". ";}
		});
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checklist : [
		"checkSameColorTile",					// 問題チェック用
		"checkShadedObject",					// 問題チェック用
		"checkConnectUnshade",
		"check2x2ShadeCell+",
		"check2x2UnshadeCell++",
		"checkUnshadeLoop",
		"checkRouteCheckPoint",
		"checkRouteNoDeadEnd"
	],

	checkShadedObject : function(){
		var bd=this.board;
		this.checkAllCell( function(cell){ return cell.qans===1 && (cell.ques!==0 || bd.startpos.equals(cell) || bd.goalpos.equals(cell));}, "objShaded" );
	},

	check2x2UnshadeCell : function(){
		this.check2x2Block( function(cell){ return cell.isUnshade();}, "cu2x2" );
	},

	checkUnshadeLoop : function(){
		var bd = this.board, ublks = bd.ublkmgr.components;
		for(var r=0;r<ublks.length;r++){
			if(ublks[r].circuits===0){ continue;}

			this.failcode.add("cuLoop");
			if(this.checkOnly){ return;}
			this.searchloop(ublks[r]).seterr(1);
		}
	},

	checkRouteCheckPoint : function(){
		var minfo = this.getMazeRouteInfo();
		var errclist = minfo.outroute.filter(function(cell){ return cell.ques===41;});
		if(errclist.length>0){
			this.failcode.add("routeIgnoreCP");
			if(this.checkOnly){ return;}
			minfo.onroute.seterr(1);
		}
	},
	checkRouteNoDeadEnd : function(){
		var minfo = this.getMazeRouteInfo();
		var errclist = minfo.onroute.filter(function(cell){ return cell.ques===42;});
		if(errclist.length>0){
			this.failcode.add("routePassDeadEnd");
			if(this.checkOnly){ return;}
			minfo.onroute.seterr(1);
		}
	},

	searchloop : function(component){
		// Loopがない場合は何もしないでreturn
		if(component.circuits<=0){ return (new this.klass.CellList());}

		// どこにLoopが存在するか判定を行う
		var bd = this.board;
		var errclist = new this.klass.CellList();
		var history = [component.clist[0]], prevcell = null;
		var steps={}, rows = (bd.maxbx-bd.minbx);

		while(history.length>0){
			var obj = history[history.length-1], nextobj = null;
			var step = steps[obj.by*rows+obj.bx];
			if(step===void 0){
				step = steps[obj.by*rows+obj.bx] = history.length-1;
			}
			// ループになった場合 => ループフラグをセットする
			else if((history.length-1)>step){
				for(var i=history.length-2;i>=0;i--){
					if(history[i].group==='cell'){ errclist.add(history[i]);}
					if(history[i]===obj){ break;}
				}
			}

			if(obj.group==='cell'){
				prevcell = obj;
				for(var i=0;i<obj.ublknodes[0].nodes.length;i++){
					var cell2 = obj.ublknodes[0].nodes[i].obj;
					var border = bd.getb((obj.bx+cell2.bx)>>1,(obj.by+cell2.by)>>1);
					if(steps[border.by*rows+border.bx]===void 0){ nextobj = border; break;}
				}
			}
			else{ // borderの時
				for(var i=0;i<obj.sidecell.length;i++){
					var cell = obj.sidecell[i];
					if((cell!==prevcell) && (cell!==history[history.length-2])){ nextobj = cell; break;}
				}
			}
			if(!!nextobj){ history.push(nextobj);}
			else         { history.pop();}
		}

		return errclist;
	},

	getMazeRouteInfo : function(){
		if(this._info.maze){ return this._info.maze;}

		/* Start->Goalの経路探索 */
		var bd = this.board;
		var history=[bd.startpos.getc()];
		var steps={}, onroutes={}, rows = (bd.maxbx-bd.minbx);
		while(history.length>0){
			var cell = history[history.length-1], nextcell = null;
			var step = steps[cell.by*rows+cell.bx];
			if(step===void 0){
				step = steps[cell.by*rows+cell.bx] = history.length-1;
			}

			// Goalに到達した場合 => Goalフラグをセットして戻る
			if(bd.goalpos.equals(cell)){
				for(var i=history.length-1;i>=0;i--){
					onroutes[history[i].by*rows+history[i].bx] = true;
				}
			}

			// 隣接するセルへ
			var nodes = (cell.ublknodes[0] ? cell.ublknodes[0].nodes : []);
			for(var i=0;i<nodes.length;i++){
				var cell1 = nodes[i].obj;
				if(steps[cell1.by*rows+cell1.bx]===void 0){ nextcell = cell1; break;}
			}

			if(!!nextcell){ history.push(nextcell);}
			else          { history.pop();}
		}

		var info = {
			onroute  : (new this.klass.CellList()),
			outroute : (new this.klass.CellList())
		};
		for(var c=0;c<bd.cell.length;c++){
			var cell = bd.cell[c];
			if(cell.isUnshade()){
				if(!!onroutes[cell.by*rows+cell.bx]){ info.onroute.add(cell);}
				else                                { info.outroute.add(cell);}
			}
		}

		return (this._info.maze = info);
	}
},

FailCode:{
	cu2x2  : ["2x2の白マスのかたまりがあります。","There is a 2x2 block of unshaded cells."],
	cuLoop : ["白マスで輪っかができています。","There is a looped unshaded cells."],
	routeIgnoreCP   : ["○がSからGへの経路上にありません。","There is a circle out of the shortest route from S to G."],
	routePassDeadEnd: ["△がSからGへの経路上にあります。","There is a triangle on the shortest route from S to G."],
	objShaded : ["オブジェクトが黒マスになっています。","An object is shaded."]
}
}));
