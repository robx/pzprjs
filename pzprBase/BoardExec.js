// BoardExec.js v3.4.0
(function(){

var k = pzprv3.consts;
pzprv3.addConsts({
	// 拡大縮小・回転反転用定数
	EXPAND : 0x10,
	REDUCE : 0x20,
	TURN   : 0x40,
	FLIP   : 0x80,
	TURNFLIP: 0xC0, // (TURN|FLIP),

	EXPANDUP: 0x11, // (EXPAND|UP),
	EXPANDDN: 0x12, // (EXPAND|DN),
	EXPANDLT: 0x13, // (EXPAND|LT),
	EXPANDRT: 0x14, // (EXPAND|RT),

	REDUCEUP: 0x21, // (REDUCE|UP),
	REDUCEDN: 0x22, // (REDUCE|DN),
	REDUCELT: 0x23, // (REDUCE|LT),
	REDUCERT: 0x24, // (REDUCE|RT),

	TURNL: 0x41, // (TURN|1),
	TURNR: 0x42, // (TURN|2),

	FLIPX: 0x81, // (FLIP|1),
	FLIPY: 0x82, // (FLIP|2),
});

//---------------------------------------------------------------------------
// ★BoardExecクラス 盤面の拡大縮小、反転回転等を行う (MenuExec.js, Board.jsから移動)
//---------------------------------------------------------------------------
pzprv3.createPuzzleClass('BoardExec',
{
	boardtype : {
		expandup: [k.REDUCEUP, k.EXPANDUP],
		expanddn: [k.REDUCEDN, k.EXPANDDN],
		expandlt: [k.REDUCELT, k.EXPANDLT],
		expandrt: [k.REDUCERT, k.EXPANDRT],
		reduceup: [k.EXPANDUP, k.REDUCEUP],
		reducedn: [k.EXPANDDN, k.REDUCEDN],
		reducelt: [k.EXPANDLT, k.REDUCELT],
		reducert: [k.EXPANDRT, k.REDUCERT],
		turnl: [k.TURNR, k.TURNL],
		turnr: [k.TURNL, k.TURNR],
		flipy: [k.FLIPX, k.FLIPY],
		flipx: [k.FLIPY, k.FLIPX]
	},

	// expand/reduce処理用
	qnumw : [],	// ques==51の回転･反転用
	qnumh : [],	// ques==51の回転･反転用

	// expand/reduce処理で消える/増えるオブジェクトの判定用
	insex : {
		cell   : {1:true},
		cross  : (this.iscross===1 ? {2:true} : {0:true}),
		border : {1:true, 2:true},
		excell : {1:true}
	},

	//------------------------------------------------------------------------------
	// bd.exec.execadjust()   盤面の調整、回転、反転で対応する関数へジャンプする
	//------------------------------------------------------------------------------
	execadjust : function(name){
		var bd = this.owner.board;
		if(name.indexOf("reduce")===0){
			if(name==="reduceup"||name==="reducedn"){
				if(bd.qrows<=1){ return;}
			}
			else if(name==="reducelt"||name==="reducert"){
				if(bd.qcols<=1){ return;}
			}
		}

		this.owner.opemgr.newOperation(true);

		this.owner.painter.suspendAll();

		// undo/redo時はexpandreduce・turnflipを直接呼びます
		var key = this.boardtype[name][1], key0 = this.boardtype[name][0];
		var d = {x1:0, y1:0, x2:2*bd.qcols, y2:2*bd.qrows}; // 範囲が必要なのturnflipだけかも..
		if(key & k.TURNFLIP){
			this.turnflip(key,d);
			this.owner.opemgr.addOpe_BoardFlip(d, key0, key);
		}
		else{
			this.expandreduce(key,d);
			this.owner.opemgr.addOpe_BoardAdjust(key0, key);
		}

		bd.setminmax();
		bd.resetInfo();

		// Canvasを更新する
		this.owner.adjustCanvasSize();
		this.owner.painter.unsuspend();
	},

	//------------------------------------------------------------------------------
	// bd.exec.expandreduce() 盤面の拡大・縮小を実行する
	// bd.exec.expandGroup()  オブジェクトの追加を行う
	// bd.exec.reduceGroup()  オブジェクトの消去を行う
	// bd.exec.isdel()        消去されるオブジェクトかどうか判定する
	//------------------------------------------------------------------------------
	expandreduce : function(key,d){
		var bd = this.owner.board;
		bd.disableInfo();
		this.adjustBoardData(key,d);
		if(bd.rooms.hastop && (key & k.REDUCE)){ this.reduceRoomNumber(key,d);}

		if(key & k.EXPAND){
			if     (key===k.EXPANDUP||key===k.EXPANDDN){ bd.qrows++;}
			else if(key===k.EXPANDLT||key===k.EXPANDRT){ bd.qcols++;}

							 { this.expandGroup(k.CELL,   key);}
			if(!!bd.iscross) { this.expandGroup(k.CROSS,  key);}
			if(!!bd.isborder){ this.expandGroup(k.BORDER, key);}
			if(!!bd.isexcell){ this.expandGroup(k.EXCELL, key);}
		}
		else if(key & k.REDUCE){
							 { this.reduceGroup(k.CELL,   key);}
			if(!!bd.iscross) { this.reduceGroup(k.CROSS,  key);}
			if(!!bd.isborder){ this.reduceGroup(k.BORDER, key);}
			if(!!bd.isexcell){ this.reduceGroup(k.EXCELL, key);}

			if     (key===k.REDUCEUP||key===k.REDUCEDN){ bd.qrows--;}
			else if(key===k.REDUCELT||key===k.REDUCERT){ bd.qcols--;}
		}
		bd.setposAll();

		this.adjustBoardData2(key,d);
		bd.enableInfo();
	},
	expandGroup : function(type,key){
		var bd = this.owner.board;
		var margin = bd.initGroup(type, bd.qcols, bd.qrows);
		var group = bd.getGroup(type);
		for(var i=group.length-1;i>=0;i--){
			if(this.isdel(key,group[i])){
				group[i] = bd.newObject(type);
				group[i].id = i;
				group[i].allclear(false);
				margin--;
			}
			else if(margin>0){ group[i] = group[i-margin];}
		}

		if(type===k.BORDER){ this.expandborder(key);}
	},
	reduceGroup : function(type,key){
		var bd = this.owner.board;
		if(type===k.BORDER){ this.reduceborder(key);}

		var opemgr = this.owner.opemgr;
		var margin=0, group = bd.getGroup(type), isrec=(!opemgr.undoExec && !opemgr.redoExec);
		if(isrec){ opemgr.forceRecord = true;}
		for(var i=0;i<group.length;i++){
			if(this.isdel(key,group[i])){
				group[i].id = i;
				group[i].allclear(isrec);
				margin++;
			}
			else if(margin>0){ group[i-margin] = group[i];}
		}
		for(var i=0;i<margin;i++){ group.pop();}
		if(isrec){ opemgr.forceRecord = false;}
	},
	isdel : function(key,obj){
		return !!this.insex[obj.group][this.distObj(key,obj)];
	},

	//------------------------------------------------------------------------------
	// bd.exec.turnflip()      回転・反転処理を実行する
	// bd.exec.turnflipGroup() turnflip()から内部的に呼ばれる回転実行部
	//------------------------------------------------------------------------------
	turnflip : function(key,d){
		var bd = this.owner.board;
		bd.disableInfo();
		this.adjustBoardData(key,d);

		if(key & k.TURN){
			var tmp = bd.qcols; bd.qcols = bd.qrows; bd.qrows = tmp;
			bd.setposAll();
			d = {x1:0, y1:0, x2:2*bd.qcols, y2:2*bd.qrows};
		}

						   { this.turnflipGroup(k.CELL,   key, d);}
		if(!!bd.iscross)   { this.turnflipGroup(k.CROSS,  key, d);}
		if(!!bd.isborder)  { this.turnflipGroup(k.BORDER, key, d);}
		if(bd.isexcell===2){ this.turnflipGroup(k.EXCELL, key, d);}
		else if(bd.isexcell===1 && (key & k.FLIP)){
			var d2 = {x1:d.x1, y1:d.y1, x2:d.x2, y2:d.y2};
			if     (key===k.FLIPY){ d2.x1 = d2.x2 = -1;}
			else if(key===k.FLIPX){ d2.y1 = d2.y2 = -1;}
			this.turnflipGroup(k.EXCELL, key, d2);
		}
		bd.setposAll();

		this.adjustBoardData2(key,d);
		bd.enableInfo();
	},
	turnflipGroup : function(type,key,d){
		var bd = this.owner.board;
		var ch=[], objlist=bd.objectinside(type,d.x1,d.y1,d.x2,d.y2);
		for(var i=0;i<objlist.length;i++){ ch[objlist[i].id]=false;}

		var group = bd.getGroup(type);
		var xx=(d.x1+d.x2), yy=(d.y1+d.y2);
		for(var source=0;source<group.length;source++){
			if(ch[source]!==false){ continue;}

			var tmp = group[source], target = source, next;
			while(ch[target]===false){
				ch[target]=true;
				// nextになるものがtargetに移動してくる、、という考えかた。
				// ここでは移動前のIDを取得しています
				switch(key){
					case k.FLIPY: next = bd.getObjectPos(type, group[target].bx, yy-group[target].by).id; break;
					case k.FLIPX: next = bd.getObjectPos(type, xx-group[target].bx, group[target].by).id; break;
					case k.TURNR: next = bd.getObjectPos(type, group[target].by, xx-group[target].bx, bd.qrows, bd.qcols).id; break;
					case k.TURNL: next = bd.getObjectPos(type, yy-group[target].by, group[target].bx, bd.qrows, bd.qcols).id; break;
				}

				if(ch[next]===false){
					group[target] = group[next];
					target = next;
				}
				else{
					group[target] = tmp;
					break;
				}
			}
		}
	},

	//---------------------------------------------------------------------------
	// bd.exec.distObj()      上下左右いずれかの外枠との距離を求める
	//---------------------------------------------------------------------------
	distObj : function(key,obj){
		var bd = this.owner.board;
		if(obj.isnull){ return -1;}

		key &= 0x0F;
		if     (key===k.UP){ return obj.by;}
		else if(key===k.DN){ return 2*bd.qrows-obj.by;}
		else if(key===k.LT){ return obj.bx;}
		else if(key===k.RT){ return 2*bd.qcols-obj.bx;}
		return -1;
	},

	//---------------------------------------------------------------------------
	// bd.exec.expandborder() 盤面の拡大時、境界線を伸ばす
	// bd.exec.reduceborder() 盤面の縮小時、線を移動する
	//---------------------------------------------------------------------------
	expandborder : function(key){
		var bd = this.owner.board;
		// borderAsLineじゃないUndo時は、後でオブジェクトを代入するので下の処理はパス
		if(bd.lines.borderAsLine || !bd.owner.opemgr.undoExec){
			// 直前のexpandGroupで、bx,byプロパティが不定なままなので設定する
			bd.setposBorders();

			var dist = (bd.lines.borderAsLine?2:1);
			for(var id=0;id<bd.bdmax;id++){
				var border = bd.border[id];
				if(this.distObj(key,border)!==dist){ continue;}

				var source = (bd.lines.borderAsLine ? this.outerBorder(id,key) : this.innerBorder(id,key));
				this.copyBorder(border, source);
				if(bd.lines.borderAsLine){ source.allclear(false);}
			}
		}
	},
	reduceborder : function(key){
		var bd = this.owner.board;
		if(bd.lines.borderAsLine){
			for(var id=0;id<bd.bdmax;id++){
				var border = bd.border[id];
				if(this.distObj(key,border)!==0){ continue;}

				var source = this.innerBorder(id,key);
				this.copyBorder(border, source);
			}
		}
	},

	//---------------------------------------------------------------------------
	// bd.exec.copyBorder()   (expand/reduceBorder用) 指定したデータをコピーする
	// bd.exec.innerBorder()  (expand/reduceBorder用) ひとつ内側に入ったborderのidを返す
	// bd.exec.outerBorder()  (expand/reduceBorder用) ひとつ外側に行ったborderのidを返す
	//---------------------------------------------------------------------------
	copyBorder : function(border1,border2){
		border1.ques  = border2.ques;
		border1.qans  = border2.qans;
		if(this.owner.board.lines.borderAsLine){
			border1.line  = border2.line;
			border1.qsub  = border2.qsub;
			border1.color = border2.color;
		}
	},
	innerBorder : function(id,key){
		var border=this.owner.board.border[id];
		key &= 0x0F;
		if     (key===k.UP){ return border.relbd(0, 2);}
		else if(key===k.DN){ return border.relbd(0,-2);}
		else if(key===k.LT){ return border.relbd(2, 0);}
		else if(key===k.RT){ return border.relbd(-2,0);}
		return null;
	},
	outerBorder : function(id,key){
		var border=this.owner.board.border[id];
		key &= 0x0F;
		if     (key===k.UP){ return border.relbd(0,-2);}
		else if(key===k.DN){ return border.relbd(0, 2);}
		else if(key===k.LT){ return border.relbd(-2,0);}
		else if(key===k.RT){ return border.relbd( 2,0);}
		return null;
	},

	//---------------------------------------------------------------------------
	// bd.exec.reduceRoomNumber()   盤面縮小時に数字つき部屋の処理を行う
	//---------------------------------------------------------------------------
	reduceRoomNumber : function(key,d){
		var qnums = [];
		var bd = this.owner.board;
		for(var c=0;c<bd.cell.length;c++){
			var cell = bd.cell[c];
			if(!!this.insex[k.CELL][this.distObj(key,cell)]){
				if(cell.qnum!==-1){
					qnums.push({cell:cell, areaid:bd.rooms.getRoomID(cell), pos:[cell.bx,cell.by], val:cell.qnum});
					cell.qnum=-1;
				}
				bd.rooms.removeCell(cell);
			}
		}
		for(var i=0;i<qnums.length;i++){
			var areaid = qnums[i].areaid;
			var top = bd.rooms.calcTopOfRoom(areaid);
			if(top===null){
				var opemgr = this.owner.opemgr;
				if(!opemgr.undoExec && !opemgr.redoExec){
					opemgr.forceRecord = true;
					opemgr.addOpe_Object(qnums[i].cell, k.QNUM, qnums[i].val, -1);
					opemgr.forceRecord = false;
				}
			}
			else{
				bd.cell[top].qnum = qnums[i].val;
			}
		}
	},

	//------------------------------------------------------------------------------
	// bd.exec.adjustBoardData()    回転・反転開始前に各セルの調節を行う(共通処理)
	// bd.exec.adjustBoardData2()   回転・反転終了後に各セルの調節を行う(共通処理)
	// 
	// bd.exec.adjustNumberArrow()  回転・反転開始前の矢印つき数字の調整
	// bd.exec.adjustCellArrow()    回転・反転開始前の矢印セルの調整
	// 
	// bd.exec.adjustQues51_1()     回転・反転開始前の[＼]セルの調整
	// bd.exec.adjustQues51_2()     回転・反転終了後の[＼]セルの調整
	// 
	// bd.exec.adjustBoardObject()  回転・反転開始前のIN/OUTなどの位置の調整
	//------------------------------------------------------------------------------
	adjustBoardData  : function(key,d){ },
	adjustBoardData2 : function(key,d){ },

	adjustNumberArrow : function(key,d){
		if(key & k.TURNFLIP){
			var tdir={};
			switch(key){
				case k.FLIPY: tdir={1:2,2:1}; break;				// 上下反転
				case k.FLIPX: tdir={3:4,4:3}; break;				// 左右反転
				case k.TURNR: tdir={1:4,2:3,3:1,4:2}; break;		// 右90°回転
				case k.TURNL: tdir={1:3,2:4,3:2,4:1}; break;		// 左90°回転
			}
			var clist = this.owner.board.cellinside(d.x1,d.y1,d.x2,d.y2);
			for(var i=0;i<clist.length;i++){
				var cell = clist[i];
				var val=tdir[cell.getQdir()]; if(!!val){ cell.setQdir(val);}
			}
		}
	},
	adjustCellArrow : function(key,d){
		if(key & k.TURNFLIP){
			var trans = {};
			switch(key){
				case k.FLIPY: trans={1:2,2:1}; break;			// 上下反転
				case k.FLIPX: trans={3:4,4:3}; break;			// 左右反転
				case k.TURNR: trans={1:4,2:3,3:1,4:2}; break;	// 右90°回転
				case k.TURNL: trans={1:3,2:4,3:2,4:1}; break;	// 左90°回転
				default: return;
			}
			var clist = this.owner.board.cellinside(d.x1,d.y1,d.x2,d.y2);
			for(var i=0;i<clist.length;i++){
				var cell = clist[i];
				var val = trans[cell.getQnum()]; if(!!val){ cell.setQnum(val);}
				var val = trans[cell.getAnum()]; if(!!val){ cell.setAnum(val);}
			}
		}
	},
	adjustBorderArrow : function(key,d){
		if(key & k.TURNFLIP){
			var trans = {};
			switch(key){
				case k.FLIPY: trans={1:2,2:1}; break;			// 上下反転
				case k.FLIPX: trans={3:4,4:3}; break;			// 左右反転
				case k.TURNR: trans={1:4,2:3,3:1,4:2}; break;	// 右90°回転
				case k.TURNL: trans={1:3,2:4,3:2,4:1}; break;	// 左90°回転
				default: return;
			}
			var blist = this.owner.board.borderinside(d.x1,d.y1,d.x2,d.y2);
			for(var i=0;i<blist.length;i++){
				var border=blist[i], val;
				val=trans[border.getQdir()]; if(!!val){ border.setQdir(val);}
			}
		}
	},

	adjustQues51_1 : function(key,d){
		var bx1=(d.x1|1), by1=(d.y1|1);
		this.qnumw = [];
		this.qnumh = [];

		var bd = this.owner.board;
		for(var by=by1;by<=d.y2;by+=2){
			this.qnumw[by] = [bd.getex(-1,by).getQnum()];
			for(var bx=bx1;bx<=d.x2;bx+=2){
				var cell = bd.getc(bx,by);
				if(cell.is51cell()){ this.qnumw[by].push(cell.getQnum());}
			}
		}
		for(var bx=bx1;bx<=d.x2;bx+=2){
			this.qnumh[bx] = [bd.getex(bx,-1).getQdir()];
			for(var by=by1;by<=d.y2;by+=2){
				var cell = bd.getc(bx,by);
				if(cell.is51cell()){ this.qnumh[bx].push(cell.getQdir());}
			}
		}
	},
	adjustQues51_2 : function(key,d){
		var xx=(d.x1+d.x2), yy=(d.y1+d.y2), bx1=(d.x1|1), by1=(d.y1|1), idx;

		var bd = this.owner.board;
		switch(key){
		case k.FLIPY: // 上下反転
			for(var bx=bx1;bx<=d.x2;bx+=2){
				idx = 1; this.qnumh[bx] = this.qnumh[bx].reverse();
				bd.getex(bx,-1).setQdir(this.qnumh[bx][0]);
				for(var by=by1;by<=d.y2;by+=2){
					var cell = bd.getc(bx,by);
					if(cell.is51cell()){ cell.setQdir(this.qnumh[bx][idx]); idx++;}
				}
			}
			break;

		case k.FLIPX: // 左右反転
			for(var by=by1;by<=d.y2;by+=2){
				idx = 1; this.qnumw[by] = this.qnumw[by].reverse();
				bd.getex(-1,by).setQnum(this.qnumw[by][0]);
				for(var bx=bx1;bx<=d.x2;bx+=2){
					var cell = bd.getc(bx,by);
					if(cell.is51cell()){ cell.setQnum(this.qnumw[by][idx]); idx++;}
				}
			}
			break;

		case k.TURNR: // 右90°反転
			for(var by=by1;by<=d.y2;by+=2){
				idx = 1; this.qnumh[by] = this.qnumh[by].reverse();
				bd.getex(-1,by).setQnum(this.qnumh[by][0]);
				for(var bx=bx1;bx<=d.x2;bx+=2){
					var cell = bd.getc(bx,by);
					if(cell.is51cell()){ cell.setQnum(this.qnumh[by][idx]); idx++;}
				}
			}
			for(var bx=bx1;bx<=d.x2;bx+=2){
				idx = 1;
				bd.getex(bx,-1).setQdir(this.qnumw[xx-bx][0]);
				for(var by=by1;by<=d.y2;by+=2){
					var cell = bd.getc(bx,by);
					if(cell.is51cell()){ cell.setQdir(this.qnumw[xx-bx][idx]); idx++;}
				}
			}
			break;

		case k.TURNL: // 左90°反転
			for(var by=by1;by<=d.y2;by+=2){
				idx = 1;
				bd.getex(-1,by).setQnum(this.qnumh[yy-by][0]);
				for(var bx=bx1;bx<=d.x2;bx+=2){
					var cell = bd.getc(bx,by);
					if(cell.is51cell()){ cell.setQnum(this.qnumh[yy-by][idx]); idx++;}
				}
			}
			for(var bx=bx1;bx<=d.x2;bx+=2){
				idx = 1; this.qnumw[bx] = this.qnumw[bx].reverse();
				bd.getex(bx,-1).setQdir(this.qnumw[bx][0]);
				for(var by=by1;by<=d.y2;by+=2){
					var cell = bd.getc(bx,by);
					if(cell.is51cell()){ cell.setQdir(this.qnumw[bx][idx]); idx++;}
				}
			}
			break;
		}
	},

	getAfterPos : function(key,d,obj){
		var bd=this.owner.board;
		var xx=(d.x1+d.x2), yy=(d.y1+d.y2), bx1=obj.bx, by1=obj.by, bx2, by2;
		switch(key){
			case k.FLIPY: bx2 = bx1; by2 = yy-by1; break;
			case k.FLIPX: bx2 = xx-bx1; by2 = by1; break;
			case k.TURNR: bx2 = yy-by1; by2 = bx1; break;
			case k.TURNL: bx2 = by1; by2 = xx-bx1; break;
			case k.EXPANDUP: bx2 = bx1; by2 = by1+(by1===bd.minby?0:2); break;
			case k.EXPANDDN: bx2 = bx1; by2 = by1+(by1===bd.maxby?2:0); break;
			case k.EXPANDLT: bx2 = bx1+(bx1===bd.minbx?0:2); by2 = by1; break;
			case k.EXPANDRT: bx2 = bx1+(bx1===bd.maxbx?2:0); by2 = by1; break;
			case k.REDUCEUP: bx2 = bx1; by2 = by1-(by1<=bd.minby+2?0:2); break;
			case k.REDUCEDN: bx2 = bx1; by2 = by1-(by1>=bd.maxby-2?2:0); break;
			case k.REDUCELT: bx2 = bx1-(bx1<=bd.minbx+2?0:2); by2 = by1; break;
			case k.REDUCERT: bx2 = bx1-(bx1>=bd.maxbx-2?2:0); by2 = by1; break;
			default: bx2 = bx1; by2 = by1; break;
		}
		return {bx1:bx1, by1:by1, bx2:bx2, by2:by2, isdel:this.isdel(key,obj)};
	}
});

})();
