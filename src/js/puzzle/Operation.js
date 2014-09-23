// Operation.js v3.4.1

// 入力情報管理クラス
// Operationクラス
pzpr.classmgr.makeCommon({
//---------------------------------------------------------------------------
// ★Operation(派生)クラス 単体の操作情報を保持する
//---------------------------------------------------------------------------
Operation:{
	initialize : function(){
		this.manager = this.owner.opemgr;
		
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
		L: 'line'
	},

	//---------------------------------------------------------------------------
	// ope.setData()  オブジェクトのデータを設定する
	// ope.decode()   ファイル出力された履歴の入力用ルーチン
	// ope.toString() ファイル出力する履歴の出力用ルーチン
	//---------------------------------------------------------------------------
	setData : function(obj, property, old, num){
		this.group = obj.group;
		this.property = property;
		this.bx  = obj.bx;
		this.by  = obj.by;
		this.old = old;
		this.num = num;
	},
	decode : function(strs){
		this.group    = this.STRGROUP[strs[0].charAt(0)];
		this.property = this.STRPROP[strs[0].charAt(1)];
		if(!this.group || !this.property){ return false;}
		this.bx  = +strs[1];
		this.by  = +strs[2];
		this.old = +strs[3];
		this.num = +strs[4];
		return true;
	},
	toString : function(){
		var prefix = '';
		for(var i in this.STRGROUP){ if(this.group   ==this.STRGROUP[i]){ prefix+=i; break;}}
		for(var i in this.STRPROP) { if(this.property==this.STRPROP[i]) { prefix+=i; break;}}
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
			 property === 'anum' )
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
		var bd = this.owner.board, obj = bd.getObjectPos(this.group, this.bx, this.by);
		if(this.group!==obj.group){ return true;}
		
		obj.setdata(this.property, num);
		obj.draw();
		
		switch(this.property){
			case 'qcmp': bd.cell.each(function(cell){ if(obj===cell.base){ cell.draw();}}); break;
			case 'qsub': break;
			default:     this.owner.checker.resetCache(); break;
		}
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
		var key_undo = this.owner.board.exec.boardtype[this.old][0];
		this.exec(key_undo);
	},
	redo : function(){
		var key_redo = this.owner.board.exec.boardtype[this.num][1];
		this.exec(key_redo);
	},
	exec : function(num){
		var puzzle = this.owner, bd = puzzle.board, d = {x1:0,y1:0,x2:2*bd.qcols,y2:2*bd.qrows};
		puzzle.board.exec.expandreduce(num,d);
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
		var key_undo = this.owner.board.exec.boardtype[this.old][0];
		if(key_undo & this.TURN){ var tmp=d.x1;d.x1=d.y1;d.y1=tmp;}
		this.exec(key_undo,d);
	},
	redo : function(){
		// とりあえず盤面全部の対応だけ
		var d0 = this.area, d = {x1:d0.x1,y1:d0.y1,x2:d0.x2,y2:d0.y2};
		var key_redo = this.owner.board.exec.boardtype[this.num][1];
		this.exec(key_redo,d);
	},
	exec : function(num,d){
		var puzzle = this.owner;
		puzzle.board.exec.turnflip(num,d);
		puzzle.redraw();
	}
},

//---------------------------------------------------------------------------
// ★OperationManagerクラス 操作情報を扱い、Undo/Redoの動作を実装する
//---------------------------------------------------------------------------
// OperationManagerクラス
OperationManager:{
	initialize : function(){
		this.lastope = null;	// this.opeの最後に追加されたOperationへのポインタ
		this.ope = [];			// Operationクラスを保持する二次元配列
		this.position = 0;		// 現在の表示操作番号を保持する

		this.broken   = false;	// "以前の操作"を消して元に戻れなくなった状態
		this.initpos  = 0;		// 盤面初期化時のposition

		this.disrec = 0;		// このクラスからの呼び出し時は1にする
		this.disCombine = false;	// 数字がくっついてしまうので、それを一時的に無効にするためのフラグ
		this.forceRecord = false;	// 強制的に登録する(盤面縮小時限定)
		this.changeflag = false;	// 操作が行われたらtrueにする(mv.notInputted()用)
		this.chainflag = false;		// 同じope直下の配列に新しいOperationオブジェクトを追加する

		this.enableUndo = false;	// Undoできる状態か？
		this.enableRedo = false;	// Redoできる状態か？

		this.undoExec = false;		// Undo中
		this.redoExec = false;		// Redo中
		this.reqReset = false;		// Undo/Redo時に盤面回転等が入っていた時、resize,resetInfo関数のcallを要求する

		var puzzle = this.owner;
		this.operationlist = [
			puzzle.ObjectOperation,
			puzzle.BoardAdjustOperation,
			puzzle.BoardFlipOperation
		];
	},

	//---------------------------------------------------------------------------
	// um.disableRecord()  操作の登録を禁止する
	// um.enableRecord()   操作の登録を許可する
	// um.checkexec()      html上の[戻][進]ボタンを押すことが可能か設定する
	// um.allerase()       記憶していた操作を全て破棄する
	// um.newOperation()   マウス、キー入力開始時に呼び出す
	// um.isModified()     操作がファイル等に保存されていないか確認する
	//---------------------------------------------------------------------------

	// 今この関数でレコード禁止になるのは、UndoRedo時、URLdecode、fileopen、adjustGeneral/Special時
	// 連動して実行しなくなるのはaddOpe().
	//  -> ここで使っているUndo/RedoとaddOpe以外はsetQues系関数を使用しないように変更
	//     変な制限事項がなくなるし、動作速度にもかなり効くしね
	disableRecord : function(){ this.disrec++; },
	enableRecord  : function(){ if(this.disrec>0){ this.disrec--;} },

	checkexec : function(){
		if(this.ope===(void 0)){ return;}

		this.enableUndo = (this.position>0);
		this.enableRedo = (this.position<this.ope.length);

		this.owner.execListener('history');
	},
	allerase : function(){
		this.lastope  = null;
		this.ope      = [];
		this.position = 0;
		this.broken   = false;
		this.initpos  = 0;
		this.changeflag = false;
		this.chainflag = false;
		this.checkexec();
		this.owner.checker.resetCache();
	},
	newOperation : function(){
		this.changeflag = false;
		this.chainflag = false;
	},
	newChain : function(){
		this.chainflag = false;
	},

	isModified : function(){
		return (this.isbroken || (this.initpos<this.position));
	},

	//---------------------------------------------------------------------------
	// um.add()  指定された操作を追加する(共通操作)
	//---------------------------------------------------------------------------
	add : function(newope){
		if(!this.owner.ready || (!this.forceRecord && this.disrec>0)){ return;}

		/* Undoした場所で以降の操作がある時に操作追加された場合、以降の操作は消去する */
		if(this.enableRedo){
			if(this.position<this.initpos){ this.broken = true;}
			for(var i=this.ope.length-1;i>=this.position;i--){ this.ope.pop();}
			this.position = this.ope.length;
		}

		/* 前の履歴を更新するかどうか判定 */
		var puzzle = this.owner;
		if( this.disCombine || !this.lastope ||
			!newope.isModify || !newope.isModify(this.lastope) )
		{
			/* 履歴を追加する */
			if(!this.chainflag){
				this.ope.push([]);
				this.position++;
				this.chainflag = true;
			}
			this.ope[this.ope.length-1].push(newope);
			this.lastope = newope;
		}
		else{
			/* 前の履歴を更新したときは何もしない */
		}
		
		if(newope.property!=='qsub' && newope.property!=='qcmp'){
			puzzle.checker.resetCache();
		}
		this.changeflag = true;
		this.checkexec();
	},

	//---------------------------------------------------------------------------
	// um.decodeLines() ファイル等から読み込んだ文字列を履歴情報に変換する
	// um.decodeHistory() 文字列を履歴情報に変換する
	// um.decodeOpe()   1つの履歴を履歴情報に変換する
	// um.toString()    履歴情報を文字列に変換する
	//---------------------------------------------------------------------------
	decodeLines : function(str){
		this.allerase();
		
		/* ファイル内容のデコード */
		try{
			this.decodeHistory(str);
		}
		catch(e){ /*　デコードできなかったとか　*/ }
		
		this.checkexec();
	},
	decodeHistory :function(str){
		if(str.substr(0,8)!=="history:" || !window.JSON){ return;}
		
		var history = JSON.parse(str.substr(8));
		this.ope = [];
		this.initpos = this.position = history.current;
		for(var i=0,len=history.datas.length;i<len;i++){
			this.ope.push([]);
			for(var j=0,len2=history.datas[i].length;j<len2;j++){
				var ope = this.decodeOpe(history.datas[i][j]);
				if(!!ope){
					this.ope[this.ope.length-1].push(ope);
					this.lastope = ope;
				}
			}
		}
	},
	decodeOpe : function(str){
		var ope, List = this.operationlist, strs = str.split(/,/);
		for(var i=0;i<List.length;i++){
			ope = new List[i]();
			if(ope.decode(strs)){ return ope;}
		}
		return null;
	},
	toString : function(){
		if(!window.JSON){ return '';}
		this.initpos = this.position;
		return "history:" + JSON.stringify({
			type    : 'pzpr',
			version : 0.3,
			current : this.position,
			datas   : this.ope
		},null,1);
	},

	//---------------------------------------------------------------------------
	// um.undo()  Undoを実行する
	// um.redo()  Redoを実行する
	//---------------------------------------------------------------------------
	undo : function(){
		if(!this.enableUndo){ return false;}
		var opes = this.ope[this.position-1];
		this.reqReset = this.checkReqReset(opes);
		this.preproc();
		
		this.undoExec = true;
		for(var i=opes.length-1;i>=0;i--){
			if(!!opes[i]){ opes[i].undo();}
		}
		this.position--;
		this.undoExec = false;
		
		this.postproc();
		return this.enableUndo;
	},
	redo : function(){
		if(!this.enableRedo){ return false;}
		var opes = this.ope[this.position];
		this.reqReset = this.checkReqReset(opes);
		this.preproc();
		
		this.redoExec = true;
		for(var i=0,len=opes.length;i<len;i++){
			if(!!opes[i]){ opes[i].redo();}
		}
		this.position++;
		this.redoExec = false;
		
		this.postproc();
		return this.enableRedo;
	},

	//---------------------------------------------------------------------------
	// um.checkReqReset() 盤面全体に影響する処理が含まれているかどうか判定する
	// um.preproc()  Undo/Redo実行前の処理を行う
	// um.postproc() Undo/Redo実行後の処理を行う
	//---------------------------------------------------------------------------
	checkReqReset : function(opes){
		var result = false;
		for(var i=0,len=opes.length;i<len;i++){
			if(opes[i].reqReset){ result = true; break;}
		}
		return result;
	},
	preproc : function(opes){
		var puzzle = this.owner, bd = puzzle.board;
		this.disableRecord();

		puzzle.painter.suspend();
		if(bd.haserror){
			bd.errclear();
			puzzle.redraw();
		}
		if(this.reqReset){
			bd.disableInfo();
		}
	},
	postproc : function(){
		var puzzle = this.owner, bd = puzzle.board;
		if(this.reqReset){
			bd.setposAll();
			bd.setminmax();
			bd.enableInfo();
			bd.resetInfo();
			puzzle.adjustCanvasSize();
		}
		puzzle.painter.unsuspend();

		this.enableRecord();
		this.checkexec();
	}
}
});
