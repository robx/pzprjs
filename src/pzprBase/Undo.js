// Undo.js v3.4.0

//---------------------------------------------------------------------------
// ★OperationManagerクラス 操作情報を扱い、Undo/Redoの動作を実装する
//---------------------------------------------------------------------------
// 入力情報管理クラス
// Operationクラス
pzprv3.createCommonClass('Operation', '',
{
	initialize : function(group, property, id, old, num){
		this.group = group;
		this.property = property;
		this.id = id;
		this.old = old;
		this.num = num;
		
		if(arguments.length===1){ this.decode(arguments[0]);}
	},

	//---------------------------------------------------------------------------
	// ope.exec()  操作opeを反映する。um.undo(),um.redo()から内部的に呼ばれる
	//---------------------------------------------------------------------------
	exec : function(num){
		if(this.group !== bd.BOARD && this.group !== bd.OTHER){
			var name = um.getfuncname(this.group, this.property);
			bd.setdata(this.group, this.property, this.id, num);

			switch(this.group){
				case bd.CELL:   um.stackCell(this.id); break;
				case bd.CROSS:  um.stackCross(this.id); break;
				case bd.BORDER: um.stackBorder(this.id); break;
			}
		}
		else if(this.group === bd.BOARD){
			var d = {x1:0,y1:0,x2:2*bd.qcols,y2:2*bd.qrows};
			if(num & menu.ex.TURNFLIP){ menu.ex.turnflip    (num,d);}
			else                      { menu.ex.expandreduce(num,d);}

			bd.disableInfo();
			um.stackAll();
			um.reqReset = true;
		}
		else{ return false;}
		return true;
	},

	//---------------------------------------------------------------------------
	// ope.decode()   ファイル出力された履歴の入力用ルーチン
	// ope.toString() ファイル出力する履歴の出力用ルーチン
	//---------------------------------------------------------------------------
	decode : function(str){
		var strs = str.split(/,/);
		if(!!um.STRGROUP[strs[0].charAt(0)]){
			this.group    = um.STRGROUP[strs[0].charAt(0)];
			this.property = um.STRPROP[strs[0].charAt(1)][0];
			this.id = bd.idnum(this.group, strs[1], strs[2]);
			this.old = parseInt(strs[3]);
			this.num = parseInt(strs[4]);
		}
		else if(strs[0]==='AL'){
			this.group = bd.BOARD;
			this.property = bd.BOARD;
			this.id = 0;
			this.old = parseInt(strs[3]);
			this.num = parseInt(strs[4]);
		}
		else{ return false;}
		return true;
	},
	toString : function(){
		if(this.group!==bd.BOARD && this.group !== bd.OTHER){
			var prefix = um.getprefix(this.group, this.property);
			var obj = bd.getObject(this.group, this.id);
			return [prefix, obj.bx, obj.by, this.old, this.num].join(',');
		}
		else if(this.group===bd.BOARD){ return ['AL', 0, 0, this.old, this.num].join(',');}
		else{ return '';}
	}
});

pzprv3.createCommonClass('OperationArray', '',
{
	initialize : function(){ this.items = [];},
	push : function(ope){ this.items.push(ope);},
	last : function(){ return (this.items.length>0 ? this.items[this.items.length-1] : null);},
	isnull : function(){ return (this.items.length===0);},

	decode : function(strs){
		if(typeof strs == "string"){ strs = [strs];}
		for(var i=0,len=strs.length;i<len;i++){
			this.items.push(new (pzprv3.getPuzzleClass('Operation'))(strs[i]));
		}
	},
	toString : function(){
		if(this.items.length===1){ return this.items[0].toString();}
		var strs=[];
		for(var i=0,len=this.items.length;i<len;i++){
			strs[i] = this.items[i].toString();
		}
		return strs;
	}
});

// OperationManagerクラス
pzprv3.createCommonClass('OperationManager', '',
{
	initialize : function(){
		this.lastope;		// this.opeのLasstIndexへのポインタ
		this.ope;			// Operationクラスを保持する配列
		this.current;		// 現在の表示操作番号を保持する
		this.anscount;		// 補助以外の操作が行われた数を保持する(autocheck用)

		this.disrec = 0;		// このクラスからの呼び出し時は1にする
		this.disCombine = 0;	// 数字がくっついてしまうので、それを一時的に無効にするためのフラグ
		this.forceRecord = false;	// 強制的に登録する(盤面縮小時限定)
		this.changeflag = false;	// 操作が行われたらtrueにする(mv.notInputted()用)

		this.enableUndo = false;	// Undoできる状態か？
		this.enableRedo = false;	// Redoできる状態か？

		this.undoExec = false;		// Undo中
		this.redoExec = false;		// Redo中
		this.reqReset = false;		// Undo/Redo時に盤面回転等が入っていた時、resize,resetInfo関数のcallを要求する
		this.range = { x1:bd.maxbx+1, y1:bd.maxby+1, x2:bd.minbx-1, y2:bd.minby-1};
	},

	/* 変換テーブル */
	STRGROUP : {
		C: 'cell',   // bd.CELL,
		X: 'cross',  // bd.CROSS,
		B: 'border', // bd.BORDER,
		E: 'excell'  // bd.EXCELL
	},
	STRPROP : {
		U: ['ques', 'sQu'], // bd.QUES
		N: ['qnum', 'sQn'], // bd.QNUM
		M: ['anum', 'sAn'], // bd.ANUM
		D: ['qdir', 'sDi'], // bd.QDIR
		A: ['qans', 'sQa'], // bd.QANS
		S: ['qsub', 'sQs'], // bd.QSUB
		L: ['line', 'sLi']  // bd.LINE
	},

	//---------------------------------------------------------------------------
	// um.getfuncname() ope.exec()関数で関数名を取得するのに用いる
	// um.getprefix()   ope.toString()関数でprefix名を取得するのに用いる
	//---------------------------------------------------------------------------
	getfuncname : function(group, prop){
		var func1, func2;
		for(var i in this.STRPROP){ if(prop==this.STRPROP[i][0]){ func1=this.STRPROP[i][1]; break;}}
		for(var i in this.STRGROUP){ if(group==this.STRGROUP[i]){ func2=i; break;}}
		return func1+func2;
	},
	getprefix : function(group, prop){
		var func1, func2;
		for(var i in this.STRGROUP){ if(group==this.STRGROUP[i]){ func1=i; break;}}
		for(var i in this.STRPROP){ if(prop==this.STRPROP[i][0]){ func2=i; break;}}
		return func1+func2;
	},

	//---------------------------------------------------------------------------
	// um.disableRecord()  操作の登録を禁止する
	// um.enableRecord()   操作の登録を許可する
	// um.isenableRecord() 操作の登録できるかを返す
	// um.enb_btn()        html上の[戻][進]ボタンを押すことが可能か設定する
	// um.allerase()       記憶していた操作を全て破棄する
	// um.newOperation()   マウス、キー入力開始時に呼び出す
	//---------------------------------------------------------------------------

	// 今この関数でレコード禁止になるのは、UndoRedo時、URLdecode、fileopen、adjustGeneral/Special時
	// 連動して実行しなくなるのはaddOpe().
	//  -> ここで使っているUndo/RedoとaddOpe以外はbd.QuC系関数を使用しないように変更
	//     変な制限事項がなくなるし、動作速度にもかなり効くしね
	disableRecord : function(){ this.disrec++; },
	enableRecord  : function(){ if(this.disrec>0){ this.disrec--;} },
	isenableRecord : function(){ return (this.forceRecord || this.disrec===0);},

	enb_btn : function(){
		if(this.ope===(void 0)){ return;}

		this.enableUndo = (this.current>0);
		this.enableRedo = (this.current<this.ope.length-(this.lastope.isnull()?1:0));

		ee('btnundo').el.disabled = (!this.enableUndo ? 'disabled' : '');
		ee('btnredo').el.disabled = (!this.enableRedo ? 'disabled' : '');

		ee('ms_h_oldest').el.className = (this.enableUndo ? 'smenu' : 'smenunull');
		ee('ms_h_undo').el.className   = (this.enableUndo ? 'smenu' : 'smenunull');
		ee('ms_h_redo').el.className   = (this.enableRedo ? 'smenu' : 'smenunull');
		ee('ms_h_latest').el.className = (this.enableRedo ? 'smenu' : 'smenunull');
	},
	allerase : function(){
		this.lastope  = new (pzprv3.getPuzzleClass('OperationArray'))();
		this.ope      = [this.lastope];
		this.current  = 0;
		this.anscount = 0;
		this.enb_btn();
	},
	newOperation : function(flag){	// キー、ボタンを押し始めたときはtrue
		if(!this.lastope.isnull()){ this.addOpeArray();}
		if(flag){ this.changeflag = false;}
	},

	//---------------------------------------------------------------------------
	// um.addOpeArray() OperationArrayを追加する
	// um.addOpe()      指定された操作を追加する。id等が同じ場合は最終操作を変更する
	//---------------------------------------------------------------------------
	addOpeArray : function(){
		this.lastope = new (pzprv3.getPuzzleClass('OperationArray'))();
		this.ope.push(this.lastope);
	},
	addOpe : function(group, property, id, old, num){
		if(!this.isenableRecord() || (old===num && group!==bd.BOARD)){ return;}

		if(this.enableRedo){
			for(var i=this.ope.length-1;i>=this.current;i--){ this.ope.pop();}
			this.addOpeArray();
			this.current = this.ope.length-1;
		}
		var ref = this.lastope.last();

		// 前回と同じ場所なら前回の更新のみ
		if( this.disCombine==0 && !!ref &&
			ref.group == group && ref.property == property &&
			ref.id == id && ref.num == old &&
			( (group == bd.CELL && ( property == bd.QNUM || property == bd.ANUM )) || group == bd.CROSS)
		)
			{ ref.num = num;}
		else{
			if(!ref){ this.current++;}
			this.lastope.push(new (pzprv3.getPuzzleClass('Operation'))(group, property, id, old, num));
		}

		if(property!=bd.QSUB){ this.anscount++;}
		this.changeflag = true;
		this.enb_btn();
	},

	//---------------------------------------------------------------------------
	// um.decodeLines() ファイル等から読み込んだ文字列を履歴情報に変換する
	// um.parse()       文字列を履歴情報に変換する
	// um.toString()    履歴情報を文字列に変換する
	//---------------------------------------------------------------------------
	decodeLines : function(){
		this.allerase();
		var linepos = fio.lineseek;
		while(1){
			var line = fio.readLine();
			if(line===(void 0)){ fio.lineseek=linepos; break;}
			else if(line==="__HISTORY__"){ this.parse(); break;}
		}
		this.enb_btn();
	},
	parse : function(){
		if(!window.JSON){ return;}
		var data = JSON.parse(fio.readLine());
		this.ope = [];
		this.current = data.current;
		for(var i=0,len=data.datas.length;i<len;i++){
			this.addOpeArray();
			this.lastope.decode(data.datas[i]);
		}
	},
	toString : function(){
		if(!window.JSON){ return '';}
		var lastid = this.ope.length-(this.lastope.isnull()?1:0);
		var data = {version:0.1, history:lastid, current:this.current, datas:[]};
		for(var i=0;i<lastid;i++){
			data.datas[i] = this.ope[i].toString();
		}
		return ['__HISTORY__',JSON.stringify(data)].join('/');
	},

	//---------------------------------------------------------------------------
	// um.undo()  Undoを指定された回数実行する
	// um.redo()  Redoを指定された回数実行する
	// um.undoall()  Undoを最後まで実行する
	// um.redoall()  Redoを最後まで実行する
	// um.undoSingle()  Undoを実行する
	// um.redoSingle()  Redoを実行する
	//---------------------------------------------------------------------------
	undo : function(num){
		if(!this.enableUndo){ return;}
		this.undoExec = true;
		this.preproc();
		for(var i=0;i<num;i++){ this.undoSingle();}
		this.postproc();
		this.undoExec = false;
		if(!this.enableUndo){ kc.inUNDO=false;}
	},
	redo : function(num){
		if(!this.enableRedo){ return;}
		this.redoExec = true;
		this.preproc();
		for(var i=0;i<num;i++){ this.redoSingle();}
		this.postproc();
		this.redoExec = false;
		if(!this.enableRedo){ kc.inREDO=false;}
	},
	undoall : function(){ this.undo(this.current);},
	redoall : function(){ this.redo(this.ope.length-this.current-1);},

	undoSingle : function(){
		var refope = this.ope[this.current-1].items;
		if(!refope){ return;}
		for(var i=refope.length-1;i>=0;i--){
			refope[i].exec(refope[i].old);
			if(refope[i].property!=bd.QSUB){ this.anscount--;}
		}
		this.current--;
	},
	redoSingle : function(){
		var refope = this.ope[this.current].items;
		if(!refope){ return;}
		for(var i=0,len=refope.length;i<len;i++){
			refope[i].exec(refope[i].num);
			if(refope[i].property!=bd.QSUB){ this.anscount++;}
		}
		this.current++;
	},

	//---------------------------------------------------------------------------
	// um.preproc()  Undo/Redo実行前の処理を行う
	// um.postproc() Undo/Redo実行後の処理を行う
	//---------------------------------------------------------------------------
	preproc : function(){
		this.reqReset=false;

		this.range = { x1:bd.maxbx+1, y1:bd.maxby+1, x2:bd.minbx-1, y2:bd.minby-1};
		this.disableRecord();
	},
	postproc : function(){
		if(this.reqReset){
			this.reqReset=false;

			bd.setposAll();
			bd.setminmax();
			bd.enableInfo();
			bd.resetInfo();
			pc.resize_canvas();
		}
		else{
			pc.paintRange(this.range.x1, this.range.y1, this.range.x2, this.range.y2);
		}
		this.enableRecord();
		this.enb_btn();
	},

	//---------------------------------------------------------------------------
	// um.stackAll()    盤面全部を描画するため、どの範囲まで変更が入ったか記憶しておく
	// um.stackCell()   Cellの周りを描画するため、どの範囲まで変更が入ったか記憶しておく
	// um.stackCross()  Crossの周りを描画するため、どの範囲まで変更が入ったか記憶しておく
	// um.stackBorder() Borderの周りを描画するため、どの範囲まで変更が入ったか記憶しておく
	// um.paintStack()  変更が入った範囲を保持する
	//---------------------------------------------------------------------------
	stackAll : function(){
		this.range = {x1:bd.minbx,y1:bd.minby,x2:bd.maxbx,y2:bd.maxby};
	},
	stackCell : function(id){
		this.paintStack(bd.cell[id].bx-1, bd.cell[id].by-1, bd.cell[id].bx+1, bd.cell[id].by+1);
	},
	stackCross : function(id){
		this.paintStack(bd.cross[id].bx-1, bd.cross[id].by-1, bd.cross[id].bx+1, bd.cross[id].by+1);
	},
	stackBorder : function(id){
		if(isNaN(id) || !bd.border[id]){ return;}
		if(bd.border[id].bx&1){
			this.paintStack(bd.border[id].bx-2, bd.border[id].by-1, bd.border[id].bx+2, bd.border[id].by+1);
		}
		else{
			this.paintStack(bd.border[id].bx-1, bd.border[id].by-2, bd.border[id].bx+1, bd.border[id].by+2);
		}
	},
	paintStack : function(x1,y1,x2,y2){
		if(this.range.x1 > x1){ this.range.x1 = x1;}
		if(this.range.y1 > y1){ this.range.y1 = y1;}
		if(this.range.x2 < x2){ this.range.x2 = x2;}
		if(this.range.y2 < y2){ this.range.y2 = y2;}
	}
});
