// Undo.js v3.4.0
(function(){

var k = pzpr.consts;

//---------------------------------------------------------------------------
// ★Operation(派生)クラス 単体の操作情報を保持する
//---------------------------------------------------------------------------
// 入力情報管理クラス
// Operationクラス
pzpr.createPuzzleClass('Operation',
{
	initialize : function(){
		this.manager = this.owner.opemgr;
	},

	chain : false,
	//---------------------------------------------------------------------------
	// ope.setData()  オブジェクトのデータを設定する
	// ope.decode()   ファイル出力された履歴の入力用ルーチン
	// ope.toString() ファイル出力する履歴の出力用ルーチン
	//---------------------------------------------------------------------------
	setData : function(old, num){
		this.old = old;
		this.num = num;
	},
	decode : function(strs){ return false;},
	toString : function(){ return '';},

	//---------------------------------------------------------------------------
	// ope.undo()  操作opeを一手前に戻す
	// ope.redo()  操作opeを一手進める
	// ope.exec()  操作opeを反映する
	//---------------------------------------------------------------------------
	undo : function(){ this.exec(this.old);},
	redo : function(){ this.exec(this.num);},
	exec : function(num){}
});

// ObjectOperationクラス
pzpr.createPuzzleClass('ObjectOperation:Operation',
{
	group    : '',
	property : '',

	/* 変換テーブル */
	STRGROUP : {
		C: 'cell',   // k.CELL,
		X: 'cross',  // k.CROSS,
		B: 'border', // k.BORDER,
		E: 'excell'  // k.EXCELL
	},
	STRPROP : {
		U: 'ques',   // k.QUES
		N: 'qnum',   // k.QNUM
		M: 'anum',   // k.ANUM
		D: 'qdir',   // k.QDIR
		A: 'qans',   // k.QANS
		S: 'qsub',   // k.QSUB
		K: 'qdark',  // k.QDARK
		L: 'line'    // k.LINE
	},

	//---------------------------------------------------------------------------
	// ope.setData()  オブジェクトのデータを設定する
	// ope.decode()   ファイル出力された履歴の入力用ルーチン
	// ope.toString() ファイル出力する履歴の出力用ルーチン
	//---------------------------------------------------------------------------
	setData : function(obj, property, old, num, chain){
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
	// ope.undo()  操作opeを一手前に戻す
	// ope.redo()  操作opeを一手進める
	// ope.exec()  操作opeを反映する。ope.undo(),ope.redo()から内部的に呼ばれる
	//---------------------------------------------------------------------------
	undo : function(){
		this.exec(this.old);
		if(!(this.property==k.QSUB||this.property==k.QDARK)){ this.manager.anscount--;}
	},
	redo : function(){
		this.exec(this.num);
		if(!(this.property==k.QSUB||this.property==k.QDARK)){ this.manager.anscount++;}
	},
	exec : function(num){
		var obj = this.owner.board.getObjectPos(this.group, this.bx, this.by);
		if(this.group!==obj.group){ return true;}
		obj.setdata(this.property, num);
		obj.draw();
		if(this.property===k.QDARK){ this.owner.board.cell.each(function(cell){ if(obj===cell.base){cell.draw();}});}
	}
});

// BoardAdjustOperationクラス
pzpr.createPuzzleClass('BoardAdjustOperation:Operation',
{
	prefix : 'AJ',
	//---------------------------------------------------------------------------
	// ope.decode()   ファイル出力された履歴の入力用ルーチン
	// ope.toString() ファイル出力する履歴の出力用ルーチン
	//---------------------------------------------------------------------------
	decode : function(strs){
		if(strs[0]!==this.prefix){ return false;}
		this.old = +strs[1];
		this.num = +strs[2];
		return true;
	},
	toString : function(){
		return [this.prefix, this.old, this.num].join(',');
	},

	//---------------------------------------------------------------------------
	// ope.exec()  操作opeを反映する。ope.undo(),ope.redo()から内部的に呼ばれる
	//---------------------------------------------------------------------------
	exec : function(num){
		var o = this.owner;
		o.board.disableInfo();
		this.manager.reqReset = true;

		o.board.exec.expandreduce(num,{x1:0,y1:0,x2:2*o.board.qcols,y2:2*o.board.qrows});

		o.redraw();
	}
});

// BoardFlipOperationクラス
pzpr.createPuzzleClass('BoardFlipOperation:Operation',
{
	prefix : 'AT',
	area : {},
	//---------------------------------------------------------------------------
	// ope.setData()  オブジェクトのデータを設定する
	// ope.decode()   ファイル出力された履歴の入力用ルーチン
	// ope.toString() ファイル出力する履歴の出力用ルーチン
	//---------------------------------------------------------------------------
	setData : function(d, old, num){
		this.area = d;
		this.old = old;
		this.num = num;
	},
	decode : function(strs){
		if(strs[0]!==this.prefix){ return false;}
		this.area.x1 = +strs[1];
		this.area.y1 = +strs[2];
		this.area.x2 = +strs[3];
		this.area.y2 = +strs[4];
		this.old = +strs[5];
		this.num = +strs[6];
		return true;
	},
	toString : function(){
		var x1 = this.area.x1, y1 = this.area.y1, x2 = this.area.x2, y2 = this.area.y2;
		return [this.prefix, x1, y1, x2, y2, this.old, this.num].join(',');
	},

	//---------------------------------------------------------------------------
	// ope.undo()  操作opeを一手前に戻す
	// ope.redo()  操作opeを一手進める
	// ope.exec()  操作opeを反映する。ope.undo(),ope.redo()から内部的に呼ばれる
	//---------------------------------------------------------------------------
	undo : function(){
		// とりあえず盤面全部の対応だけ
		var d0 = this.area, d = {x1:d0.x1,y1:d0.y1,x2:d0.x2,y2:d0.y2};
		if(this.old & k.TURN){ var tmp=d.x1;d.x1=d.y1;d.y1=tmp;}
		this.exec(this.old,d);
	},
	redo : function(){
		// とりあえず盤面全部の対応だけ
		var d0 = this.area, d = {x1:d0.x1,y1:d0.y1,x2:d0.x2,y2:d0.y2};
		this.exec(this.num,d);
	},
	exec : function(num,d){
		this.owner.board.disableInfo();
		this.manager.reqReset = true;

		this.owner.board.exec.turnflip(num,d);

		this.owner.redraw();
	}
});

//---------------------------------------------------------------------------
// ★OperationManagerクラス 操作情報を扱い、Undo/Redoの動作を実装する
//---------------------------------------------------------------------------
// OperationManagerクラス
pzpr.createPuzzleClass('OperationManager',
{
	initialize : function(){
		this.lastope;		// this.opeのLasstIndexへのポインタ
		this.ope;			// Operationクラスを保持する配列
		this.position;		// 現在の表示操作番号を保持する
		this.anscount;		// 補助以外の操作が行われた数を保持する(autocheck用)

		this.disrec = 0;		// このクラスからの呼び出し時は1にする
		this.disCombine = false;	// 数字がくっついてしまうので、それを一時的に無効にするためのフラグ
		this.forceRecord = false;	// 強制的に登録する(盤面縮小時限定)
		this.changeflag = false;	// 操作が行われたらtrueにする(mv.notInputted()用)
		this.chainflag = false;		// chainされたOperationオブジェクトを登録する

		this.enableUndo = false;	// Undoできる状態か？
		this.enableRedo = false;	// Redoできる状態か？

		this.undoExec = false;		// Undo中
		this.redoExec = false;		// Redo中
		this.reqReset = false;		// Undo/Redo時に盤面回転等が入っていた時、resize,resetInfo関数のcallを要求する
	},

	//---------------------------------------------------------------------------
	// um.disableRecord()  操作の登録を禁止する
	// um.enableRecord()   操作の登録を許可する
	// um.isenableRecord() 操作の登録できるかを返す
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
	isenableRecord : function(){ return (this.forceRecord || this.disrec===0);},

	checkexec : function(){
		if(this.ope===(void 0)){ return;}

		this.enableUndo = (this.position>0);
		this.enableRedo = (this.position<this.ope.length);

		this.owner.execListener('historychange');
	},
	allerase : function(){
		this.ope      = [];
		this.position = 0;
		this.anscount = 0;
		this.checkexec();
	},
	newOperation : function(flag){	// キー、ボタンを押し始めたときはtrue
		this.chainflag = false;
		if(flag){ this.changeflag = false;}
	},

	//---------------------------------------------------------------------------
	// um.addOpe_common()      指定された操作を追加する(共通操作)
	// um.addOpe_Object()      指定された操作を追加する。プロパティ等が同じ場合は最終操作を変更する
	// um.addOpe_BoardAdjust() 指定された盤面(拡大・縮小)操作を追加する
	// um.addOpe_BoardFlip()   指定された盤面(回転・反転)操作を追加する
	//---------------------------------------------------------------------------
	addOpe_common : function(regist_func, cond_func){
		if(!this.isenableRecord()){ return;}

		if(this.enableRedo){
			for(var i=this.ope.length-1;i>=this.position;i--){ this.ope.pop();}
			this.position = this.ope.length;
		}

		if(cond_func!==(void 0) && !cond_func.call(this)){ return;}
		var ope = regist_func.call(this);
		ope.chain = this.chainflag;

		this.ope.push(ope);
		this.position++;
		this.anscount++;

		this.chainflag = true;
		this.changeflag = true;
		this.checkexec();
	},

	addOpe_Object : function(obj, property, old, num){
		if(old===num){ return;}

		this.addOpe_common(function(){
			if(property===k.QSUB||property===k.QDARK){ this.anscount--;}

			var ope = new this.owner.ObjectOperation();
			ope.setData(obj, property, old, num);
			return ope;
		},
		function(){
			var ref = this.ope[this.position-1];

			// 前回と同じ場所なら前回の更新のみ
			if( !this.disCombine && !!ref && !!ref.property &&
				ref.group===obj.group && ref.property===property &&
				ref.num===old && ref.bx===obj.bx && ref.by===obj.by && 
				( (obj.iscellobj && ( property===k.QNUM || property===k.ANUM )) || obj.iscrossobj)
			)
			{
				this.changeflag = true;
				ref.num = num;
				this.owner.execListener('historychange');
				return false;
			}
			return true;
		});
	},
	addOpe_BoardAdjust : function(old, num){
		// 操作を登録する
		this.addOpe_common(function(){
			var ope = new this.owner.BoardAdjustOperation();
			ope.setData(old, num);
			return ope;
		});
	},
	addOpe_BoardFlip : function(d, old, num){
		// 操作を登録する
		this.addOpe_common(function(){
			var ope = new this.owner.BoardFlipOperation();
			ope.setData(d, old, num);
			return ope;
		});
	},

	//---------------------------------------------------------------------------
	// um.decodeLines() ファイル等から読み込んだ文字列を履歴情報に変換する
	// um.decodeOpe()   1つの履歴を履歴情報に変換する
	// um.toString()    履歴情報を文字列に変換する
	//---------------------------------------------------------------------------
	decodeLines : function(){
		this.allerase();
		var linepos = this.owner.fio.lineseek, datas = [], inhistory = false;
		while(1){
			var line = this.owner.fio.readLine();
			if(line===(void 0)){ this.owner.fio.lineseek=linepos; break;}
			else if(!inhistory){
				if(line==='history:{'){ inhistory=true; datas=['{'];}
			}
			else if(inhistory){
				datas.push(line);
				if(line==='}'){ break;}
			}
		}

		if(!!window.JSON){
			try{
				var str = datas.join(''), data = JSON.parse(str);
				this.ope = [];
				this.position = data.current;
				for(var i=0,len=data.datas.length;i<len;i++){
					var str = data.datas[i], chain = false;
					if(str.charAt(0)==='+'){ chain = true; str = str.substr(1);}
					var ope = this.decodeOpe(str.split(/,/));
					if(!!ope){
						ope.chain = chain;
						this.ope.push(ope);
					}
				}
			}
			catch(e){ /*　デコードできなかったとか　*/ }
		}

		this.checkexec();
	},
	decodeOpe : function(strs){
		var ope = new this.owner.ObjectOperation();
		if(ope.decode(strs)){ return ope;}

		ope = new this.owner.BoardAdjustOperation();
		if(ope.decode(strs)){ return ope;}

		ope = new this.owner.BoardFlipOperation();
		if(ope.decode(strs)){ return ope;}

		return null;
	},
	toString : function(){
		if(!window.JSON){ return '';}
		var lastid = this.ope.length;
		var data = ['','history:{'], datas = [];
		data.push('"version":0.2,');
		data.push('"history":'+lastid+',');
		data.push('"current":'+(this.position)+',');
		data.push('"datas":[');
		for(var i=0;i<lastid;i++){
			var chain = (this.ope[i].chain?'+':'');
			datas.push(['"',chain,(this.ope[i].toString()),'"'].join(''));
		}
		data.push(datas.join(',\n'));
		data.push(']');
		data.push('}');
		return data.join('\n');
	},

	//---------------------------------------------------------------------------
	// um.undo()  Undoを実行する
	// um.redo()  Redoを実行する
	//---------------------------------------------------------------------------
	undo : function(){
		if(!this.enableUndo){ return false;}
		this.undoExec = true;
		this.preproc();
		for(var i=this.position-1;i>=0;i--){
			var ref = this.ope[i];
			if(!ref){ break;}
			ref.undo();
			this.position--;
			if(!ref.chain){ break;}
		}
		this.postproc();
		this.undoExec = false;
		this.checkexec();
		return this.enableUndo;
	},
	redo : function(){
		if(!this.enableRedo){ return false;}
		this.redoExec = true;
		this.preproc();
		for(var i=this.position,len=this.ope.length;i<len;i++){
			var ref = this.ope[i];
			if(!ref){ break;}
			ref.redo();
			this.position++;
			if(!this.ope[i+1] || !this.ope[i+1].chain){ break;}
		}
		this.postproc();
		this.redoExec = false;
		this.checkexec();
		return this.enableRedo;
	},

	//---------------------------------------------------------------------------
	// um.preproc()  Undo/Redo実行前の処理を行う
	// um.postproc() Undo/Redo実行後の処理を行う
	//---------------------------------------------------------------------------
	preproc : function(){
		this.reqReset=false;

		this.disableRecord();
		this.owner.painter.suspend();
	},
	postproc : function(){
		var o = this.owner;
		if(this.reqReset){
			this.reqReset=false;

			o.board.setposAll();
			o.board.setminmax();
			o.board.enableInfo();
			o.board.resetInfo();
			o.adjustCanvasSize();
		}
		o.painter.unsuspend();

		this.enableRecord();
		this.checkexec();
	}
});

})();
