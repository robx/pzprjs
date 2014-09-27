//
// パズル固有スクリプト部 ぬりめいず版 nurimaze.js v3.4.2
//
pzpr.classmgr.makeCustom(['nurimaze'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.owner.playmode){
			if(this.mousestart || this.mousemove){ this.inputtile_nurimaze();}
		}
		else if(this.owner.editmode){
			if(this.mousestart || this.mousemove){ this.inputEdit();}
			else if(this.mouseend){ this.inputEdit_end();}
		}
	},

	inputtile_nurimaze : function(){
		var cell = this.getcell();
		if(cell.isnull || cell===this.mouseCell){ return;}
		if(this.inputData===null){ this.decIC(cell);}

		var bd = this.owner.board, clist = bd.rooms.getClistByCell(cell);
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
			this.owner.board.startpos.input(cell);
		}
		// goalposの入力中の場合
		else if(this.inputData===11){
			this.owner.board.goalpos.input(cell);
		}
		// 境界線の入力中の場合
		else if(this.inputData!==null){
			this.inputborder();
		}
	},
	inputEdit_first : function(){
		var pos = this.getpos(0.33), bd = this.owner.board;
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

	inputQuesMark :function(cell){
		var bd = this.owner.board, newques=-1;
		if     (this.btn.Left ){ newques={0:41,41:42,42:0}[cell.ques];}
		else if(this.btn.Right){ newques={0:42,42:41,41:0}[cell.ques];}

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
		if(this.keydown && this.owner.editmode){
			this.key_inputqnum_nurimaze(ca);
		}
	},
	key_inputqnum_nurimaze : function(ca){
		var cell = this.cursor.getc(), bd = this.owner.board;

		var old=cell.ques, newques=-1;
		if     (ca==='1'||ca==='q'){ newques=(old!==41?41:0);}
		else if(ca==='2'||ca==='w'){ newques=(old!==42?42:0);}
		else if(ca==='3'||ca==='e'||ca===' '){ newques=0;}
		else if(ca==='s'){ bd.startpos.input(cell);}
		else if(ca==='g'){ bd.goalpos.input(cell);}

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

	initialize : function(){
		this.common.initialize.call(this);

		var puzzle = this.owner;
		this.startpos = new puzzle.StartAddress(1,1);
		this.goalpos  = new puzzle.GoalAddress(this.qcols*2-1,this.qrows*2-1);
		this.startpos.partner = this.goalpos;
		this.goalpos.partner  = this.startpos;
	},

	initBoardSize : function(col,row){
		this.common.initBoardSize.call(this,col,row);

		this.disableInfo();
		this.startpos.init(1,1);
		this.goalpos.init(this.qcols*2-1,this.qrows*2-1);
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
		var bd = this.owner.board;

		this.posinfo_start = this.getAfterPos(key,d,bd.startpos.getc());
		this.posinfo_goal  = this.getAfterPos(key,d,bd.goalpos.getc());
	},
	adjustBoardData2 : function(key,d){
		var bd = this.owner.board, opemgr = this.owner.opemgr;
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
			this.owner.board.exchangestartgoal();
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
		this.owner.opemgr.add(new this.owner.StartGoalOperation(this.type, this.bx,this.by, bx,by));
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
		var bd = this.owner.board, cell = bd.getc(bx, by);
		if     (this.property==='start'){ bd.startpos.set(cell);}
		else if(this.property==='goal') { bd.goalpos.set(cell);}
	}
},
OperationManager:{
	initialize : function(){
		this.common.initialize.call(this);
		
		this.operationlist.push(this.owner.StartGoalOperation);
	}
},

AreaUnshadeManager:{
	enabled : true
},
AreaRoomManager:{
	enabled : true
},

Flags:{
	use : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	bgcellcolor_func : "qans1",
	errbcolor2 : "rgb(192, 192, 255)",

	bcolor_type : "GREEN",
	bbcolor : "rgb(127, 127, 127)",

	paint : function(){
		this.drawBGCells();
		this.drawGrid();
		this.drawShadedCells();

		this.drawQuesMarks();
		this.drawStartGoal();

		this.drawBorders();

		this.drawChassis();

		this.drawBoxBorders(true);

		this.drawTarget();
	},

	drawStartGoal : function(){
		var g = this.vinc('cell_sg', 'auto');
		var bd = this.owner.board, d = this.range;
		
		g.vid = "text_stpos";
		var cell = bd.startpos.getc();
		if(cell.bx>=d.x1 && d.x2>=cell.bx && cell.by>=d.y1 && d.y2>=cell.by){
			if(!cell.isnull){
				g.fillStyle = (this.owner.mouse.inputData===10 ? "red" : (cell.qans===1 ? this.fontShadecolor : this.quescolor));
				this.disptext("S", cell.bx*this.bw, cell.by*this.bh);
			}
			else{ g.vhide();}
		}
		
		g.vid = "text_glpos";
		cell = bd.goalpos.getc();
		if(cell.bx>=d.x1 && d.x2>=cell.bx && cell.by>=d.y1 && d.y2>=cell.by){
			if(!cell.isnull){
				g.fillStyle = (this.owner.mouse.inputData===11 ? "red" : (cell.qans===1 ? this.fontShadecolor : this.quescolor));
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
			g.strokeStyle = this.getCellNumberColor(cell);
			
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
		var c=0, i=0, bstr = this.outbstr, bd = this.owner.board;
		for(i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i), cell = bd.cell[c];

			if     (ca==='1'){ bd.startpos.set(cell);}
			else if(ca==='2'){ bd.goalpos.set(cell);}
			else if(ca==='3'){ cell.ques = 41;}
			else if(ca==='4'){ cell.ques = 42;}
			else if(this.include(ca,"5","9")||this.include(ca,"a","z")){ c+=(parseInt(ca,36)-5);}

			c++;
			if(c>=bd.cellmax){ break;}
		}
		this.outbstr = bstr.substr(i+1);
	},
	encodeCell_nurimaze : function(){
		var cm="", count=0, bd=this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
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
		var bd = this.owner.board;
		this.decodeCell( function(obj,ca){
			if     (ca==="s"){ bd.startpos.set(obj);}
			else if(ca==="g"){ bd.goalpos.set(obj);}
			else if(ca==="o"){ obj.ques = 41;}
			else if(ca==="t"){ obj.ques = 42;}
		});
	},
	encodeCellQues_nurimaze : function(){
		var bd = this.owner.board;
		this.encodeCell( function(obj){
			if     (bd.startpos.equals(obj)){ return "s ";}
			else if(bd.goalpos.equals(obj)) { return "g ";}
			else if(obj.ques===41){ return "o ";}
			else if(obj.ques===42){ return "t ";}
			else{ return ". ";}
		});
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( pzpr.EDITOR && !this.checkSameColorTile() ){ return 'bkMixed';}
		if( pzpr.EDITOR && !this.checkShadedObject() ){ return 'objShaded';}

		var winfo = this.owner.board.getUnshadeInfo();
		if( !this.checkOneArea(winfo) ){ return 'cuDivide';}

		if( !this.check2x2ShadeCell() ){ return 'cs2x2';}
		if( !this.check2x2UnshadeCell() ){ return 'cu2x2';}

		if( !this.checkUnshadeLoop() ){ return 'cuLoop';}

		var sdata = this.searchRoute();
		if( !this.checkRouteCheckPoint(sdata) ){ return 'routeIgnoreCP';}
		if( !this.checkRouteNoDeadEnd(sdata) ){ return 'routePassDeadEnd';}

		return null;
	},

	checkShadedObject : function(){
		var bd=this.owner.board;
		return this.checkAllCell( function(cell){ return cell.qans===1 && (cell.ques!==0 || bd.startpos.equals(cell) || bd.goalpos.equals(cell));} );
	},

	check2x2UnshadeCell : function(){
		return this.check2x2Block( function(cell){ return cell.isUnshade();} );
	},

	checkUnshadeLoop : function(){
		var sinfo={cell:[]}, bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			sinfo.cell[c] = bd.wcell.getLinkCell(bd.cell[c]);
		}

		var sdata=[];
		for(var c=0;c<bd.cellmax;c++){ sdata[c] =(bd.cell[c].qans===0?0:null);}
		for(var c=0;c<bd.cellmax;c++){
			if(sdata[c]!==0){ continue;}
			this.searchloop(c, sinfo, sdata);
		}

		var errclist = bd.cell.filter(function(cell){ return (sdata[cell.id]===1);});
		if(errclist.length>0){
			errclist.seterr(1);
			return false;
		}
		return true;
	},
	searchloop : function(fc, sinfo, sdata){
		var passed=[], history=[fc];
		for(var c=0;c<this.owner.board.cellmax;c++){ passed[c]=false;}

		while(history.length>0){
			var c = history[history.length-1];
			passed[c] = true;

			// 隣接するセルへ
			var cc = (sinfo.cell[c].length>0?sinfo.cell[c][0]:null);
			if(cc!==null){
				// 通過した道の参照を外す
				for(var i=0;i<sinfo.cell[c].length;i++) { if(sinfo.cell[c][i]===cc){ sinfo.cell[c].splice(i,1);}}
				for(var i=0;i<sinfo.cell[cc].length;i++){ if(sinfo.cell[cc][i]===c){ sinfo.cell[cc].splice(i,1);}}

				// ループになった場合 => ループフラグをセットする
				if(!!passed[cc]){
					sdata[cc] = 1;
					for(var i=history.length-1;i>=0;i--){
						if(history[i]===cc){ break;}
						sdata[history[i]] = 1;
					}
				}
				// 先の交点でループ判定にならなかった場合 => 次のセルへ進む
				else{ history.push(cc);}
			}
			else{
				// 全て通過済み -> 一つ前に戻る
				var cell = history.pop();
				if(sdata[cell]===0){ sdata[cell]=2;}
			}
		}
	},

	checkRouteCheckPoint : function(sdata){
		var result = this.checkAllCell(function(cell){ return (cell.ques===41 && sdata[cell.id]===2);});
		if(!result && !this.checkOnly){
			this.owner.board.cell.filter(function(cell){ return sdata[cell.id]===1;}).seterr(2);
		}
		return result;
	},
	checkRouteNoDeadEnd : function(sdata){
		var result = this.checkAllCell(function(cell){ return (cell.ques===42 && sdata[cell.id]===1);});
		if(!result && !this.checkOnly){
			this.owner.board.cell.filter(function(cell){ return sdata[cell.id]===1;}).seterr(2);
		}
		return result;
	},
	searchRoute : function(sinfo, sdata){
		/* 白マスがどの隣接セルに接しているかの情報を取得する */
		var sinfo={cell:[]}, bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			sinfo.cell[c] = bd.wcell.getLinkCell(bd.cell[c]);
		}

		/* 経路情報の初期値設定 */
		var sdata=[];
		for(var c=0;c<bd.cellmax;c++){ sdata[c] =(bd.cell[c].qans===0?0:null);}

		/* Start->Goalの経路探索 */
		var history=[bd.startpos.getc().id];
		while(history.length>0){
			var c = history[history.length-1];

			// 隣接するセルへ
			var cc = (sinfo.cell[c].length>0?sinfo.cell[c][0]:null);
			if(cc!==null){
				// 通過した道の参照を外す
				for(var i=0;i<sinfo.cell[c].length;i++) { if(sinfo.cell[c][i]===cc){ sinfo.cell[c].splice(i,1);}}
				for(var i=0;i<sinfo.cell[cc].length;i++){ if(sinfo.cell[cc][i]===c){ sinfo.cell[cc].splice(i,1);}}

				// Goalに到達した場合 => Goalフラグをセットして戻る
				if(bd.goalpos.equals(bd.cell[cc])){
					sdata[cc] = 1;
					for(var i=history.length;i>=0;i--){ sdata[history[i]] = 1;}
				}
				// 先の交点でループ判定にならなかった場合 => 次のセルへ進む
				else{ history.push(cc);}
			}
			else{
				// 全て通過済み -> 一つ前に戻る
				var cell = history.pop();
				if(sdata[cell]===0){ sdata[cell]=2;}
			}
		}

		for(var c=0;c<bd.cellmax;c++){ if(sdata[c]===0){ sdata[c] = 2;}}
		return sdata;
	}
},

FailCode:{
	cu2x2  : ["2x2の白マスのかたまりがあります。","There is a 2x2 block of unshaded cells."],
	cuLoop : ["白マスで輪っかができています。","There is a looped unshaded cells."],
	routeIgnoreCP   : ["○がSからGへの経路上にありません。","There is a circle out of the shortest route from S to G."],
	routePassDeadEnd: ["△がSからGへの経路上にあります。","There is a triangle on the shortest route from S to G."],
	objShaded : ["オブジェクトが黒マスになっています。","An object is shaded."]
}
});
