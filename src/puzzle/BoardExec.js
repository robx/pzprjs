// BoardExec.js v3.4.1

(function(){

// 拡大縮小・回転反転用定数
var UP = 0x01,
	DN = 0x02,
	LT = 0x03,
	RT = 0x04,

	EXPAND = 0x10,
	REDUCE = 0x20,
	TURN   = 0x40,
	FLIP   = 0x80;

pzpr.classmgr.makeCommon({
//---------------------------------------------------------------------------
// ★BoardExecクラス 盤面の拡大縮小、反転回転等を行う (MenuExec.js, Board.jsから移動)
//---------------------------------------------------------------------------
BoardExec:{
	// 拡大縮小・回転反転用定数
	UP : UP,
	DN : DN,
	LT : LT,
	RT : RT,

	EXPAND : EXPAND,
	REDUCE : REDUCE,
	TURN   : TURN,
	FLIP   : FLIP,
	TURNFLIP: (TURN|FLIP),

	EXPANDUP: (EXPAND|UP),
	EXPANDDN: (EXPAND|DN),
	EXPANDLT: (EXPAND|LT),
	EXPANDRT: (EXPAND|RT),

	REDUCEUP: (REDUCE|UP),
	REDUCEDN: (REDUCE|DN),
	REDUCELT: (REDUCE|LT),
	REDUCERT: (REDUCE|RT),

	TURNL: (TURN|1),
	TURNR: (TURN|2),

	FLIPX: (FLIP|1),
	FLIPY: (FLIP|2),

	boardtype : {
		expandup: [REDUCE|UP, EXPAND|UP],
		expanddn: [REDUCE|DN, EXPAND|DN],
		expandlt: [REDUCE|LT, EXPAND|LT],
		expandrt: [REDUCE|RT, EXPAND|RT],
		reduceup: [EXPAND|UP, REDUCE|UP],
		reducedn: [EXPAND|DN, REDUCE|DN],
		reducelt: [EXPAND|LT, REDUCE|LT],
		reducert: [EXPAND|RT, REDUCE|RT],
		turnl: [TURN|2, TURN|1],
		turnr: [TURN|1, TURN|2],
		flipy: [FLIP|2, FLIP|2],
		flipx: [FLIP|1, FLIP|1]
	},

	// expand/reduce処理用
	qnumw : [],	// ques==51の回転･反転用
	qnumh : [],	// ques==51の回転･反転用

	// expand/reduce処理で消える/増えるオブジェクトの判定用
	insex : {
		cell   : {1:true},
		cross  : {},	/* Board初期化時に設定します */
		border : {1:true, 2:true},
		excell : {1:true}
	},

	//------------------------------------------------------------------------------
	// bd.exec.execadjust()   盤面の調整、回転、反転で対応する関数へジャンプする
	// bd.exec.execadjust_main() 盤面の調整、回転、反転処理の実行部
	//------------------------------------------------------------------------------
	execadjust : function(name){
		if(!this.boardtype[name]){ return;}

		var puzzle = this.puzzle, bd = this.board;
		if(name.indexOf("reduce")===0){
			if(name==="reduceup"||name==="reducedn"){
				if(bd.rows<=1){ return;}
			}
			else if(name==="reducelt"||name==="reducert"){
				if(bd.cols<=1){ return;}
			}
		}

		puzzle.opemgr.newOperation();

		puzzle.painter.suspendAll();

		// undo/redo時はexecadjust_mainを直接呼びます
		var d = {x1:0, y1:0, x2:2*bd.cols, y2:2*bd.rows}; // TURNFLIPには範囲が必要
		this.execadjust_main(this.boardtype[name][1],d);
		this.addOpe(d, name);

		bd.setminmax();
		bd.rebuildInfo();

		// Canvasを更新する
		puzzle.painter.resizeCanvas();
		puzzle.emit('adjust');
		puzzle.painter.unsuspend();
	},
	execadjust_main : function(key,d){
		var bd = this.board;
		this.adjustBoardData(key,d);
		if(bd.roommgr.hastop && (key & REDUCE)){ this.reduceRoomNumber(key,d);}

		if(key & TURN){
			var tmp = bd.cols; bd.cols = bd.rows; bd.rows = tmp;
			d = {x1:0, y1:0, x2:2*bd.cols, y2:2*bd.rows};
		}
		else if(key & EXPAND){
			if     (key===this.EXPANDUP||key===this.EXPANDDN){ bd.rows++;}
			else if(key===this.EXPANDLT||key===this.EXPANDRT){ bd.cols++;}
		}

		// main operation
		['cell','cross','border','excell'].forEach(function(group){
			if     (key & EXPAND){ bd.exec.expandGroup(group, key);}
			else if(key & REDUCE){ bd.exec.reduceGroup(group, key);}
			else                 { bd.exec.turnflipGroup(group, key, d);}
		});

		if(key & REDUCE){
			if     (key===this.REDUCEUP||key===this.REDUCEDN){ bd.rows--;}
			else if(key===this.REDUCELT||key===this.REDUCERT){ bd.cols--;}
		}
		bd.setposAll();

		this.adjustBoardData2(key,d);
	},

	//------------------------------------------------------------------------------
	// bd.exec.addOpe() 指定された盤面(拡大・縮小, 回転・反転)操作を追加する
	//------------------------------------------------------------------------------
	addOpe : function(d, name){
		var key = this.boardtype[name][1], puzzle = this.puzzle, ope;
		if(key & this.TURNFLIP){ ope = new puzzle.klass.BoardFlipOperation(d, name);}
		else                   { ope = new puzzle.klass.BoardAdjustOperation(name);}
		puzzle.opemgr.add(ope);
	},

	//------------------------------------------------------------------------------
	// bd.exec.expandGroup()  オブジェクトの追加を行う
	// bd.exec.reduceGroup()  オブジェクトの消去を行う
	// bd.exec.isdel()        消去されるオブジェクトかどうか判定する
	//------------------------------------------------------------------------------
	expandGroup : function(group,key){
		var bd = this.board;
		var margin = bd.initGroup(group, bd.cols, bd.rows);
		var groups = bd.getGroup(group);
		var groups2 = new groups.constructor();
		bd.setposGroup(group);
		for(var i=groups.length-1;i>=0;i--){
			var piece = groups[i];
			if(this.isdel(key,piece)){
				piece = bd.newObject(group, i);
				groups[i] = piece;
				groups2.add(piece);
				margin--;
			}
			else if(margin>0){ groups[i] = groups[i-margin];}
		}
		groups2.allclear(false);

		if(group==='border'){ this.expandborder(key);}
	},
	reduceGroup : function(group,key){
		var bd = this.board;
		if(group==='border'){ this.reduceborder(key);}

		var margin=0, groups = bd.getGroup(group), groups2 = new groups.constructor();
		for(var i=0;i<groups.length;i++){
			var piece = groups[i];
			if(this.isdel(key,piece)){
				piece.id = i;
				groups2.add(piece);
				margin++;
			}
			else if(margin>0){ groups[i-margin] = groups[i];}
		}
		var opemgr = this.puzzle.opemgr;
		if(!opemgr.undoExec && !opemgr.redoExec){
			opemgr.forceRecord = true;
			groups2.allclear(true);
			opemgr.forceRecord = false;
		}
		for(var i=0;i<margin;i++){ groups.pop();}
	},
	isdel : function(key,piece){
		return !!this.insex[piece.group][this.distObj(key,piece)];
	},

	//------------------------------------------------------------------------------
	// bd.exec.turnflipGroup() execadjust_main()から内部的に呼ばれる回転反転実行部
	//------------------------------------------------------------------------------
	turnflipGroup : function(group,key,d){
		var bd = this.board;
		if(group==='excell'){
			if(bd.hasexcell===1 && (key & this.FLIP)){
				var d2 = {x1:d.x1, y1:d.y1, x2:d.x2, y2:d.y2};
				if     (key===this.FLIPY){ d2.x1 = d2.x2 = -1;}
				else if(key===this.FLIPX){ d2.y1 = d2.y2 = -1;}
				d = d2;
			}
			else if(bd.hasexcell===2){
				d = {x1:-1, y1:-1, x2:d.x2+1, y2:d.y2+1};
			}
		}

		var objlist = bd.objectinside(group,d.x1,d.y1,d.x2,d.y2);
		var converted = {}, xx=(d.x1+d.x2), yy=(d.y1+d.y2);
		for(var i=0;i<objlist.length;i++){
			var obj = objlist[i], id = null;
			switch(key){
				case this.FLIPY: id = bd.getObjectPos(group, obj.bx, yy-obj.by).id; break;
				case this.FLIPX: id = bd.getObjectPos(group, xx-obj.bx, obj.by).id; break;
				case this.TURNL: id = bd.getObjectPos(group, obj.by, yy-obj.bx).id; break;
				case this.TURNR: id = bd.getObjectPos(group, xx-obj.by, obj.bx).id; break;
			}
			converted[id] = obj;
		}

		var groups = bd.getGroup(group);
		for(var n in converted){ groups[+n] = converted[n];}
	},

	//---------------------------------------------------------------------------
	// bd.exec.distObj()      上下左右いずれかの外枠との距離を求める
	//---------------------------------------------------------------------------
	distObj : function(key,piece){
		var bd = this.board;
		if(piece.isnull){ return -1;}

		key &= 0x0F;
		if     (key===this.UP){ return piece.by;}
		else if(key===this.DN){ return 2*bd.rows-piece.by;}
		else if(key===this.LT){ return piece.bx;}
		else if(key===this.RT){ return 2*bd.cols-piece.bx;}
		return -1;
	},

	//---------------------------------------------------------------------------
	// bd.exec.expandborder() 盤面の拡大時、境界線を伸ばす
	// bd.exec.reduceborder() 盤面の縮小時、線を移動する
	//---------------------------------------------------------------------------
	expandborder : function(key){
		var bd = this.board, bdAsLine = bd.borderAsLine;
		// borderAsLineじゃないUndo時は、後でオブジェクトを代入するので下の処理はパス
		if(bdAsLine || !bd.puzzle.opemgr.undoExec){
			var group2 = new this.klass.BorderList();
			// 直前のexpandGroupで、bx,byプロパティが不定なままなので設定する
			bd.setposBorders();

			var dist = (bdAsLine?2:1);
			for(var id=0;id<bd.border.length;id++){
				var border = bd.border[id];
				if(this.distObj(key,border)!==dist){ continue;}

				var source = (bdAsLine ? this.outerBorder(id,key) : this.innerBorder(id,key));
				this.copyBorder(border, source);
				group2.add(source);
			}
			if(bdAsLine){ group2.allclear(false);}
		}
	},
	reduceborder : function(key){
		var bd = this.board;
		if(bd.borderAsLine){
			for(var id=0;id<bd.border.length;id++){
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
		if(this.board.borderAsLine){
			border1.line  = border2.line;
			border1.qsub  = border2.qsub;
		}
	},
	innerBorder : function(id,key){
		var border=this.board.border[id];
		key &= 0x0F;
		if     (key===this.UP){ return border.relbd(0, 2);}
		else if(key===this.DN){ return border.relbd(0,-2);}
		else if(key===this.LT){ return border.relbd(2, 0);}
		else if(key===this.RT){ return border.relbd(-2,0);}
		return null;
	},
	outerBorder : function(id,key){
		var border=this.board.border[id];
		key &= 0x0F;
		if     (key===this.UP){ return border.relbd(0,-2);}
		else if(key===this.DN){ return border.relbd(0, 2);}
		else if(key===this.LT){ return border.relbd(-2,0);}
		else if(key===this.RT){ return border.relbd( 2,0);}
		return null;
	},

	//---------------------------------------------------------------------------
	// bd.exec.reduceRoomNumber()   盤面縮小時に数字つき部屋の処理を行う
	//---------------------------------------------------------------------------
	reduceRoomNumber : function(key,d){
		var qnums = [];
		var bd = this.board;
		for(var c=0;c<bd.cell.length;c++){
			var cell = bd.cell[c];
			if(!!this.insex.cell[this.distObj(key,cell)]){
				if(cell.qnum!==-1){
					qnums.push({cell:cell, area:cell.room, pos:[cell.bx,cell.by], val:cell.qnum});
					cell.qnum=-1;
				}
				cell.room.clist.remove(cell);
			}
		}
		for(var i=0;i<qnums.length;i++){
			var data = qnums[i], area = data.area;
			var tcell = area.clist.getTopCell();
			if(tcell.isnull){
				var opemgr = this.puzzle.opemgr;
				if(!opemgr.undoExec && !opemgr.redoExec){
					opemgr.forceRecord = true;
					data.cell.addOpe('qnum', data.val, -1);
					opemgr.forceRecord = false;
				}
			}
			else{
				tcell.qnum = data.val;
			}
		}
	},

	//------------------------------------------------------------------------------
	// bd.exec.adjustBoardData()    回転・反転開始前に各セルの調節を行う(共通処理)
	// bd.exec.adjustBoardData2()   回転・反転終了後に各セルの調節を行う(共通処理)
	//------------------------------------------------------------------------------
	adjustBoardData  : function(key,d){ },
	adjustBoardData2 : function(key,d){ }
}
});

})();
