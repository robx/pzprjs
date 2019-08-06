// Operation.js v3.4.1

// 入力情報管理クラス
// Operationクラス
pzpr.classmgr.makeCommon({
//---------------------------------------------------------------------------
// ★Operation(派生)クラス 単体の操作情報を保持する
//---------------------------------------------------------------------------
Operation:{
	initialize : function(){
		this.manager = this.puzzle.opemgr;

		if(arguments.length>0){
			var args = Array.prototype.slice.call(arguments);
			this.setData.apply(this, args);
		}
	},

	reqReset : false,

	//---------------------------------------------------------------------------
	// ope.setData()  オブジェクトのデータを設定する
	// ope.decode()   ファイル出力された履歴の入力用ルーチン
	// ope.toString() ファイル出力する履歴の出力用ルーチン
	// ope.toJSON()   ファイル保存時に使用するルーチン
	//---------------------------------------------------------------------------
	setData : function(old, num){
		this.old = old;
		this.num = num;
	},
	decode : function(strs){ return false;},
	toString : function(){ return '';},
	toJSON : function(){ return this.toString();},

	//---------------------------------------------------------------------------
	// ope.undo()  操作opeを一手前に戻す
	// ope.redo()  操作opeを一手進める
	// ope.exec()  操作opeを反映する
	//---------------------------------------------------------------------------
	undo : function(){ this.exec(this.old);},
	redo : function(){ this.exec(this.num);},
	exec : function(num){}
},

// ObjectOperationクラス
'ObjectOperation:Operation':{
	group    : '',
	property : '',
	pos      : null,

	/* 変換テーブル */
	STRGROUP : {
		C: 'cell',
		X: 'cross',
		B: 'border',
		E: 'excell'
	},
	STRPROP : {
		U: 'ques',
		N: 'qnum',
		Z: 'qnum2',
		C: 'qchar',
		M: 'anum',
		D: 'qdir',
		A: 'qans',
		S: 'qsub',
		K: 'qcmp',
		B: 'snum',
		L: 'line'
	},

	//---------------------------------------------------------------------------
	// ope.setData()  オブジェクトのデータを設定する
	// ope.decode()   ファイル出力された履歴の入力用ルーチン
	// ope.toString() ファイル出力する履歴の出力用ルーチン
	//---------------------------------------------------------------------------
	setData : function(piece, property, old, num){
		this.group = piece.group;
		this.property = property;
		this.bx  = piece.bx;
		this.by  = piece.by;
		this.old = old;
		this.num = num;
		if(property.length>4 && property.substr(0,4)==='snum'){
			this.property = 'snum';
			this.pos      = property.substr(4);
		}
	},
	decode : function(strs){
		this.group    = this.STRGROUP[strs[0].charAt(0)];
		this.property = this.STRPROP[strs[0].charAt(1)];
		if(!this.group || !this.property){ return false;}
		this.pos = ((strs[0].substr(0,2)==='CB' && strs[0].length>2) ? +strs[0].charAt(2) : null);
		this.bx  = +strs[1];
		this.by  = +strs[2];
		this.old = +strs[3];
		this.num = +strs[4];
		return true;
	},
	toString : function(){
		var prefix = '';
		for(var i in this.STRGROUP){ if(this.group   ===this.STRGROUP[i]){ prefix+=i; break;}}
		for(var i in this.STRPROP) { if(this.property===this.STRPROP[i]) { prefix+=i; break;}}
		if(prefix==='CB' && this.pos!==null){ prefix+=this.pos;}
		return [prefix, this.bx, this.by, this.old, this.num].join(',');
	},

	//---------------------------------------------------------------------------
	// ope.isModify()  前の履歴をこのオブジェクトで更新するかどうか確認する
	//---------------------------------------------------------------------------
	isModify : function(lastope){
		// 前回と同じ場所なら前回の更新のみ
		var property = this.property;
		if( lastope.group    === this.group &&
			lastope.property === this.property  &&
			lastope.num      === this.old   &&
			lastope.bx       === this.bx    &&
			lastope.by       === this.by    &&
			(property === 'qnum'  ||
			 property === 'qnum2' ||
			 property === 'qchar' ||
			 property === 'anum'  ||
			(property === 'snum' && lastope.pos === this.pos))
		)
		{
			lastope.num = this.num;
			return true;
		}
		return false;
	},

	//---------------------------------------------------------------------------
	// ope.exec()  操作opeを反映する。ope.undo(),ope.redo()から内部的に呼ばれる
	//---------------------------------------------------------------------------
	exec : function(num){
		var bd = this.board, piece = bd.getObjectPos(this.group, this.bx, this.by);
		if(this.group!==piece.group){ return true;}

		if(this.pos===null){
			piece.setdata(this.property, num);
		}
		else{
			piece.setdata2(this.property, this.pos, num);
		}
		piece.draw();

		switch(this.property){
			case 'qcmp': bd.cell.each(function(cell){ if(piece===cell.base){ cell.draw();}}); break;
			default:     this.puzzle.checker.resetCache(); break;
		}
	}
},

// BoardClearOperationクラス
'BoardClearOperation:Operation':{
	prefix : 'AC',
	reqReset : true,

	//---------------------------------------------------------------------------
	// ope.decode()   ファイル出力された履歴の入力用ルーチン
	// ope.toString() ファイル出力する履歴の出力用ルーチン
	//---------------------------------------------------------------------------
	decode : function(strs){
		if(strs[0]!==this.prefix){ return false;}
		return true;
	},
	toString : function(){
		return this.prefix;
	}
},

// BoardAdjustOperationクラス
'BoardAdjustOperation:Operation':{
	prefix : 'AJ',
	reqReset : true,
	//---------------------------------------------------------------------------
	// ope.setData()  オブジェクトのデータを設定する
	// ope.decode()   ファイル出力された履歴の入力用ルーチン
	// ope.toString() ファイル出力する履歴の出力用ルーチン
	//---------------------------------------------------------------------------
	setData : function(name){
		this.old = this.num = name;
	},
	decode : function(strs){
		if(strs[0]!==this.prefix){ return false;}
		this.old = this.num = strs[1];
		return true;
	},
	toString : function(){
		return [this.prefix, this.num].join(',');
	},

	//---------------------------------------------------------------------------
	// ope.undo()  操作opeを一手前に戻す
	// ope.redo()  操作opeを一手進める
	// ope.exec()  操作opeを反映する。ope.undo(),ope.redo()から内部的に呼ばれる
	//---------------------------------------------------------------------------
	undo : function(){
		var key_undo = this.board.exec.boardtype[this.old][0];
		this.exec(key_undo);
	},
	redo : function(){
		var key_redo = this.board.exec.boardtype[this.num][1];
		this.exec(key_redo);
	},
	exec : function(num){
		var puzzle = this.puzzle, bd = puzzle.board, d = {x1:0,y1:0,x2:2*bd.cols,y2:2*bd.rows};
		bd.exec.execadjust_main(num,d);
		puzzle.redraw();
	}
},

// BoardFlipOperationクラス
'BoardFlipOperation:Operation':{
	prefix : 'AT',
	reqReset : true,
	area : {},
	//---------------------------------------------------------------------------
	// ope.setData()  オブジェクトのデータを設定する
	// ope.decode()   ファイル出力された履歴の入力用ルーチン
	// ope.toString() ファイル出力する履歴の出力用ルーチン
	//---------------------------------------------------------------------------
	setData : function(d, name){
		this.area = d;
		this.old = this.num = name;
	},
	decode : function(strs){
		if(strs[0]!==this.prefix){ return false;}
		this.old = this.num = strs[1];
		this.area.x1 = +strs[2];
		this.area.y1 = +strs[3];
		this.area.x2 = +strs[4];
		this.area.y2 = +strs[5];
		return true;
	},
	toString : function(){
		var d = this.area;
		return [this.prefix, this.num, d.x1, d.y1, d.x2, d.y2].join(',');
	},

	//---------------------------------------------------------------------------
	// ope.undo()  操作opeを一手前に戻す
	// ope.redo()  操作opeを一手進める
	// ope.exec()  操作opeを反映する。ope.undo(),ope.redo()から内部的に呼ばれる
	//---------------------------------------------------------------------------
	undo : function(){
		// とりあえず盤面全部の対応だけ
		var d0 = this.area, d = {x1:d0.x1,y1:d0.y1,x2:d0.x2,y2:d0.y2};
		var key_undo = this.board.exec.boardtype[this.old][0];
		if(key_undo & this.TURN){ var tmp=d.x1;d.x1=d.y1;d.y1=tmp;}
		this.exec(key_undo,d);
	},
	redo : function(){
		// とりあえず盤面全部の対応だけ
		var d0 = this.area, d = {x1:d0.x1,y1:d0.y1,x2:d0.x2,y2:d0.y2};
		var key_redo = this.board.exec.boardtype[this.num][1];
		this.exec(key_redo,d);
	},
	exec : function(num,d){
		var puzzle = this.puzzle;
		puzzle.board.exec.execadjust_main(num,d);
		puzzle.redraw();
	}
},

// TrialEnterOperationクラス
'TrialEnterOperation:Operation':{
	setData : function(old, num){
		this.old = old;
		this.num = num;
	},
	undo : function(){
		this.manager.position--;
		this.manager.resumeTrial();
		this.manager.position++;

		this.manager.trialpos.pop();
		this.manager.emitTrial(this.old);
	},
	redo : function(){
		this.manager.trialpos.push(this.manager.position);
		this.manager.emitTrial(this.num);
	},

	decode : function(strs){
		if(strs[0]!=='TE'){ return false;}
		this.old = +strs[1];
		this.num = +strs[2];
		return true;
	},
	toString : function(){
		return ['TE', this.old, this.num].join(',');
	}
},

// TrialFinalizeOperationクラス
'TrialFinalizeOperation:Operation':{
	num : [],
	setData : function(old){
		this.old = old;	// trialpos array
	},
	exec : function(num){
		this.manager.trialpos = num.concat();
		if(num.length===0){
			this.board.trialclear();
		}
		else{
			this.manager.position--;
			this.manager.resumeTrial();
			this.manager.position++;
		}
		this.manager.emitTrial(num.length);
		this.puzzle.redraw();
	},

	decode : function(strs){
		if(strs[0]!=='TF'){ return false;}
		strs.shift();
		this.old = JSON.parse(strs.join(','));
		return true;
	},
	toString : function(){
		return 'TF,['+this.old.join(',')+']';
	}
},

//---------------------------------------------------------------------------
// ★OperationListクラス OperationのListと時刻を保持する
//---------------------------------------------------------------------------
OperationList:{
	initialize : function(){
		this.time = this.puzzle.getTime();
		this.length = 0;
	},
	push : function(ope){
		this[this.length++] = ope;
	},
	some : function(func){
		return Array.prototype.slice.call(this).some(func);
	}
		//	toString : function(){
//		return Array.prototype.toString.call(this);
//	}
},

//---------------------------------------------------------------------------
// ★OperationManagerクラス 操作情報を扱い、Undo/Redoの動作を実装する
//---------------------------------------------------------------------------
// OperationManagerクラス
OperationManager:{
	initialize : function(){
		this.lastope = null;	// this.opeの最後に追加されたOperationへのポインタ
		this.history = [];		// OperationListのオブジェクトを保持する配列
		this.position = 0;		// 現在の表示操作番号を保持する
		this.trialpos = [];		// TrialModeの位置を保持する配列
		this.disEmitTrial = 0;	// Trial eventの呼び出し有効無効フラグ

		this.broken   = false;	// "以前の操作"を消して元に戻れなくなった状態
		this.initpos  = 0;		// 盤面初期化時のposition

		this.disrec = 0;		// このクラスからの呼び出し時は1にする
		this.disCombine = false;	// 数字がくっついてしまうので、それを一時的に無効にするためのフラグ
		this.forceRecord = false;	// 強制的に登録する(盤面縮小時限定)
		this.changeflag = false;	// 操作が行われたらtrueにする(mv.notInputted()用)
		this.chainflag = false;		// 同じope直下の配列に新しいOperationオブジェクトを追加する

		this.enableUndo = false;	// Undoできる状態か？
		this.enableRedo = false;	// Redoできる状態か？
		this.limitTrialUndo = false;// 仮置きモードでUndoを止める状態かどうか

		this.undoExec = false;		// Undo中
		this.redoExec = false;		// Redo中
		this.reqReset = false;		// Undo/Redo時に盤面回転等が入っていた時、resize,rebuildInfo関数のcallを要求する

		var classes = this.klass;
		this.operationlist = [
			classes.ObjectOperation,
			classes.BoardClearOperation,
			classes.BoardAdjustOperation,
			classes.BoardFlipOperation,
			classes.TrialEnterOperation,
			classes.TrialFinalizeOperation
		];
		this.addExtraOperation();
	},
	addExtraOperation : function(){},

	//---------------------------------------------------------------------------
	// um.disableRecord()  操作の登録を禁止する
	// um.enableRecord()   操作の登録を許可する
	// um.checkexec()      html上の[戻][進]ボタンを押すことが可能か設定する
	// um.allerase()       記憶していた操作を全て破棄する
	// um.newOperation()   マウス、キー入力開始時に呼び出す
	//---------------------------------------------------------------------------

	// 今この関数でレコード禁止になるのは、UndoRedo時、URLdecode、fileopen、adjustGeneral/Special時
	// 連動して実行しなくなるのはaddOpe().
	//  -> ここで使っているUndo/RedoとaddOpe以外はsetQues系関数を使用しないように変更
	//     変な制限事項がなくなるし、動作速度にもかなり効くしね
	disableRecord : function(){ this.disrec++; },
	enableRecord  : function(){ if(this.disrec>0){ this.disrec--;} },

	checkexec : function(){
		if(this.history===(void 0)){ return;}

		this.checkenable();

		this.puzzle.emit('history');
	},
	checkenable : function(){
		if(this.limitTrialUndo){
			this.enableUndo = (this.position>this.trialpos[this.trialpos.length-1]+1);
		}
		else{
			this.enableUndo = (this.position>0);
		}
		this.enableRedo = (this.position<this.history.length);

		this.board.trialstage = this.trialpos.length;
	},
	allerase : function(){
		this.lastope  = null;
		this.history  = [];
		this.position = 0;
		this.broken   = false;
		this.initpos  = 0;
		this.changeflag = false;
		this.chainflag = false;
		this.checkexec();
		this.trialpos = [];
		this.limitTrialUndo = false;
		this.puzzle.checker.resetCache();
	},
	newOperation : function(){
		this.changeflag = false;
		this.chainflag = false;
	},
	newChain : function(){
		this.chainflag = false;
	},

	//---------------------------------------------------------------------------
	// opemgr.isModified()     操作がファイル等に保存されていないか確認する
	// opemgr.resetModifiedState() ファイルに保存された時などに保存した状態にする
	//---------------------------------------------------------------------------
	isModified : function(){
		return (this.broken || (this.initpos<this.position));
	},
	resetModifiedState : function(){
		this.broken = false;
		this.initpos = this.position;
	},

	//---------------------------------------------------------------------------
	// opemgr.removeDescendant()  現在以降の履歴を消去する
	//---------------------------------------------------------------------------
	removeDescendant : function(){
		if(this.position<this.initpos){ this.broken = true;}
		for(var i=this.history.length-1;i>=this.position;i--){ this.history.pop();}
		this.position = this.history.length;
		this.chainflag = false;
	},

	//---------------------------------------------------------------------------
	// um.add()  指定された操作を追加する(共通操作)
	//---------------------------------------------------------------------------
	add : function(newope){
		if(!this.puzzle.ready || (!this.forceRecord && this.disrec>0)){ return;}

		/* Undoした場所で以降の操作がある時に操作追加された場合、以降の操作は消去する */
		if(this.enableRedo){ this.removeDescendant();}

		/* 前の履歴を更新するかどうか判定 */
		var puzzle = this.puzzle;
		if( this.disCombine || !this.lastope ||
			!newope.isModify || !newope.isModify(this.lastope) )
		{
			/* 履歴を追加する */
			if(!this.chainflag){
				this.history.push(new this.klass.OperationList());
				this.position++;
				this.chainflag = true;
			}
			this.history[this.history.length-1].push(newope);
			this.lastope = newope;
		}
		else{
			/* 前の履歴を更新したときは何もしない */
		}

		if(newope.property!=='qcmp' && newope.property!=='snum'){
			puzzle.checker.resetCache();
		}
		this.changeflag = true;
		this.checkexec();
	},

	//---------------------------------------------------------------------------
	// um.decodeHistory() オブジェクトを履歴情報に変換する
	// um.encodeHistory() 履歴情報をオブジェクトに変換する
	//---------------------------------------------------------------------------
	decodeHistory :function(historyinfo){
		this.allerase();

		this.initpos = this.position = historyinfo.current || 0;
		this.history = [];
		var datas = historyinfo.datas || [];
		for(var i=0,len=datas.length;i <len;i++){
			var opelist = new this.klass.OperationList();
			this.history.push(opelist);
			var array = datas[i];
			if(array.time!==void 0){
				opelist.time = array.time;
				array = array.ope;
			}
			for(var j=0,len2=array.length;j <len2;j++){
				var strs = array[j].split(/,/);
				var ope = null, List = this.operationlist;
				for(var k=0;k <List.length;k++){
					var ope1 = new List[k]();
					if(ope1.decode(strs)){ ope = ope1; break;}
				}
				if(!!ope){
					opelist.push(ope);
					this.lastope = ope;
				}
			}
		}

		this.checkexec();

		this.trialpos = historyinfo.trialpos || [];
		if(this.trialpos.length>0){
			this.resumeTrial();
			this.limitTrialUndo = true;
		}
	},
	encodeHistory : function(extoption){
		extoption = extoption || {};
		this.initpos = this.position;
		var historyinfo = {
			type    : 'pzpr',
			version : 0.4
		};
		if(extoption.time){
			historyinfo.time = this.puzzle.getTime();
		}
		if(this.history.length>0){
			historyinfo.current = this.position;
			if(this.trialpos.length>0){
				historyinfo.trialpos = this.trialpos;
			}
			var history = [];
			for(var i=0;i<this.history.length;++i){
				var array = Array.prototype.slice.call(this.history[i]);
				if(!extoption.time){
					history.push(array);
				}
				else{
					history.push({ope:array, time:this.history[i].time});
				}
			}
			historyinfo.datas = history;
		}
		return historyinfo;
	},

	//---------------------------------------------------------------------------
	// opemgr.undo()  Undoを実行する
	// opemgr.redo()  Redoを実行する
	//---------------------------------------------------------------------------
	undo : function(){
		if(!this.enableUndo){ return false;}
		var opes = this.history[this.position-1];
		this.reqReset = this.checkReqReset(opes);
		this.preproc();
		this.undoCore();
		this.postproc();
		return this.enableUndo;
	},
	redo : function(){
		if(!this.enableRedo){ return false;}
		var opes = this.history[this.position];
		this.reqReset = this.checkReqReset(opes);
		this.preproc();
		this.redoCore();
		this.postproc();
		return this.enableRedo;
	},

	//---------------------------------------------------------------------------
	// opemgr.undoCore()  Undoを実行する(preproc/postprocなし)
	// opemgr.redoCore()  Redoを実行する(preproc/postprocなし)
	// opemgr.resumeGoto()  指定された履歴の位置まで移動する(preproc/postprocなし)
	//---------------------------------------------------------------------------
	undoCore : function(){
		this.undoExec = true;
		var opes = this.history[this.position-1];
		for(var i=opes.length-1;i>=0;i--){
			if(!!opes[i]){ opes[i].undo();}
		}
		this.position--;
		this.undoExec = false;
	},
	redoCore : function(){
		this.redoExec = true;
		var opes = this.history[this.position];
		for(var i=0;i<opes.length;++i){
			if(!!opes[i]){ opes[i].redo();}
		}
		this.position++;
		this.redoExec = false;
	},
	resumeGoto : function(pos){
		if     (pos < this.position){ while(pos < this.position){ this.undoCore();}}
		else if(this.position < pos){ while(this.position < pos){ this.redoCore();}}
		this.checkenable();
	},

	//---------------------------------------------------------------------------
	// um.checkReqReset() 盤面全体に影響する処理が含まれているかどうか判定する
	// um.preproc()  Undo/Redo実行前の処理を行う
	// um.postproc() Undo/Redo実行後の処理を行う
	//---------------------------------------------------------------------------
	checkReqReset : function(opes){
		return opes.some(function(ope){ return ope.reqReset;});
	},
	preproc : function(opes){
		var puzzle = this.puzzle, bd = puzzle.board;
		this.disableRecord();

		puzzle.painter.suspend();
		puzzle.errclear();
		if(this.reqReset){
			bd.disableInfo();
		}
	},
	postproc : function(){
		var puzzle = this.puzzle, bd = puzzle.board;
		if(this.reqReset){
			bd.setposAll();
			bd.setminmax();
			bd.enableInfo();
			bd.rebuildInfo();
			puzzle.redraw(true);
			puzzle.emit('adjust');
		}
		puzzle.painter.unsuspend();

		this.enableRecord();
		this.checkexec();
	},

	//---------------------------------------------------------------------------
	// opemgr.enterTrial()   TrialModeにする
	// opemgr.acceptTrial()  現在のTrial状態を確定する
	// opemgr.rejectTrial()  Trial状態と履歴を破棄する
	// opemgr.resumeTrial()  ファイル読み込み時などにTrial状態を復帰する
	// opemgr.emtiTrial()    trial eventを呼び出す
	//---------------------------------------------------------------------------
	enterTrial : function(){
		if(this.trialpos[this.trialpos.length-1]+1===this.position){ return;}
		this.newOperation();
		this.add(new this.puzzle.klass.TrialEnterOperation(this.trialpos.length, this.trialpos.length+1));
		this.trialpos.push(this.position-1);
		this.limitTrialUndo = true;
		this.checkexec();
		this.newOperation();
		this.emitTrial();
	},
	acceptTrial : function(){
		if(this.trialpos[this.trialpos.length-1]+1===this.position){
			this.position--;
			this.removeDescendant();
			this.trialpos.pop();
		}
		if(this.trialpos.length>0){
			this.newOperation();
			this.add(new this.puzzle.klass.TrialFinalizeOperation(this.trialpos));
			this.board.trialclear();
		}
		this.trialpos = [];
		this.limitTrialUndo = false;
		this.removeDescendant();
		this.checkexec();
		this.newOperation();
		this.emitTrial();
	},
	rejectTrial : function(rejectall){
		if(this.trialpos.length===0){ return;}
		this.disableRecord();
		if(rejectall || this.trialpos.length===1){
			var pos = this.trialpos[0];
			this.board.trialclear();
			this.trialpos = [];
			this.limitTrialUndo = false;
			this.resumeGoto(pos);
		}
		else{
			this.resumeGoto(this.trialpos[this.trialpos.length-1]);
			this.resumeTrial();
		}
		this.enableRecord();
		this.removeDescendant();
		this.checkexec();
		this.newOperation();
		this.emitTrial();
	},
	resumeTrial : function(){
		if(this.trialpos.length>0){
			this.disEmitTrial++;
			var pos = this.position;
			this.checkenable();
			this.resumeGoto(this.trialpos[0]);
			this.board.trialclear(true);
			if(this.position<pos){
				this.board.trialstage = 1;
				this.resumeGoto(pos);
			}
			this.disEmitTrial--;
		}
	},
	emitTrial : function(num){
		if(this.disEmitTrial===0){
			this.puzzle.emit('trial', ((num===void 0) ? this.trialpos.length : num));
		}
	}
}
});
