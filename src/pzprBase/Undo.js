// Undo.js v3.3.2

//---------------------------------------------------------------------------
// ★OperationManagerクラス 操作情報を扱い、Undo/Redoの動作を実装する
//---------------------------------------------------------------------------
// 入力情報管理クラス
// Operationクラス
Operation = function(group, property, id, old, num){
	this.group = group;
	this.property = property;
	this.id = id;
	this.old = old;
	this.num = num;

	return this;
};
Operation.prototype = {
	decode : function(str){
		var strs = str.split(/,/);
		if(strs[0]!=='AL'){
			this.group = um.STRGROUP[strs[0].charAt(0)];
			this.property = um.STRPROP[strs[0].charAt(1)];
			this.id = bd.idnum(this.group, strs[1], strs[2]);
		}
		else{
			this.group = k.BOARD;
			this.property = k.BOARD;
			this.id = 0;
		}
		this.old = parseInt(strs[3]);
		this.num = parseInt(strs[4]);
		return this;
	},
	toString : function(){
		if(this.group!==k.BOARD){
			var prefix = (um.GROUPSTR[this.group]+um.PROPSTR[this.property]);
			var obj = bd.getObject(this.group, this.id);
			return [prefix, obj.bx, obj.by, this.old, this.num].join(',');
		}
		else{ return ['AL', 0, 0, this.old, this.num].join(',');}
	}
};

OperationArray = function(){
	this.items = [];
};
OperationArray.prototype = {
	push : function(ope){ this.items.push(ope);},
	item : function(id){ return this.items[id];},
	count: function(){ return this.items.length;},
	last : function(){ return (this.items.length>0 ? this.items[this.items.length-1] : null);},
	isnull : function(){ return (this.items.length===0);},
	toString : function(){
		var strs = [];
		for(var i=0,len=this.items.length;i<len;i++){
			strs.push([this.items[i].toString(), ',', i].join(''));
		}
		return strs.join("/");
	}
};

// OperationManagerクラス
OperationManager = function(){
	this.lastope = new OperationArray();	// this.opeのLasstIndexへのポインタ
	this.ope = [this.lastope];				// Operationクラスを保持する配列
	this.current = 0;		// 現在の表示操作番号を保持する
	this.disrec = 0;		// このクラスからの呼び出し時は1にする
	this.disCombine = 0;	// 数字がくっついてしまうので、それを一時的に無効にするためのフラグ
	this.forceRecord = false;	// 強制的に登録する(盤面縮小時限定)

	this.anscount = 0;			// 補助以外の操作が行われた数を保持する(autocheck用)
	this.changeflag = false;	// 操作が行われたらtrueにする(mv.notInputted()用)

	this.enableUndo = false;	// Undoできる状態か？
	this.enableRedo = false;	// Redoできる状態か？

	this.undoExec = false;		// Undo中
	this.redoExec = false;		// Redo中
	this.reqReset = false;		// Undo/Redo時に盤面回転等が入っていた時、resize,resetInfo関数のcallを要求する
	this.range = { x1:bd.maxbx+1, y1:bd.maxby+1, x2:bd.minbx-1, y2:bd.minby-1};

	/* 変換テーブル */
	this.PROPFUNC={};
	this.PROPFUNC[k.QUES] = 'sQu';
	this.PROPFUNC[k.QNUM] = 'sQn';
	this.PROPFUNC[k.ANUM] = 'sAn';
	this.PROPFUNC[k.QDIR] = 'sDi';
	this.PROPFUNC[k.QANS] = 'sQa';
	this.PROPFUNC[k.QSUB] = 'sQs';
	this.PROPFUNC[k.LINE] = 'sLi';

	this.PROPSTR={};
	this.PROPSTR[k.QUES] = 'Q';
	this.PROPSTR[k.QNUM] = 'N';
	this.PROPSTR[k.ANUM] = 'M';
	this.PROPSTR[k.QDIR] = 'D';
	this.PROPSTR[k.QANS] = 'A';
	this.PROPSTR[k.QSUB] = 'S';
	this.PROPSTR[k.LINE] = 'L';

	this.STRPROP={};
	this.STRPROP['U'] = k.QUES;
	this.STRPROP['N'] = k.QNUM;
	this.STRPROP['M'] = k.ANUM;
	this.STRPROP['D'] = k.QDIR;
	this.STRPROP['A'] = k.QANS;
	this.STRPROP['S'] = k.QSUB;
	this.STRPROP['L'] = k.LINE;

	this.GROUPSTR={};
	this.GROUPSTR[k.CELL]   = 'C';
	this.GROUPSTR[k.CROSS]  = 'X';
	this.GROUPSTR[k.BORDER] = 'B';
	this.GROUPSTR[k.EXCELL] = 'E';

	this.STRGROUP={};
	this.STRGROUP['C'] = k.CELL;
	this.STRGROUP['X'] = k.CROSS;
	this.STRGROUP['B'] = k.BORDER;
	this.STRGROUP['E'] = k.EXCELL;
};
OperationManager.prototype = {
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
		this.enableUndo = (this.current>0);
		this.enableRedo = (this.current<this.ope.length-(this.lastope.isnull()?1:0));

		ee('btnundo').el.disabled = (!this.enableUndo ? 'disabled' : '');
		ee('btnredo').el.disabled = (!this.enableRedo ? 'disabled' : '');
	},
	allerase : function(){
		this.lastope  = new OperationArray();
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
		this.lastope = new OperationArray();
		this.ope.push(this.lastope);
	},
	addOpe : function(group, property, id, old, num){
		if(!this.isenableRecord() || (old===num && group!==k.BOARD)){ return;}

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
			( (group == k.CELL && ( property==k.QNUM || (property==k.ANUM && k.isAnsNumber) )) || group == k.CROSS)
		)
			{ ref.num = num;}
		else{
			if(!ref){ this.current++;}
			this.lastope.push(new Operation(group, property, id, old, num));
		}

		if(property!=k.QSUB){ this.anscount++;}
		this.changeflag = true;
		this.enb_btn();
	},

	//---------------------------------------------------------------------------
	// um.decodeLines() ファイル等から読み込んだ文字列を履歴情報に変換する
	// um.toString()    履歴情報を文字列に変換する
	//---------------------------------------------------------------------------
	decodeLines : function(){
		this.allerase();

		fio.readLine();	/* <info> */
		fio.readLine().match(/history=(\d+)/);
		var count = RegExp.$1;
		fio.readLine().match(/current=(\d+)/);
		this.current=parseInt(RegExp.$1);
		fio.readLine();	/* </info> */

		fio.readLine();	/* <data> */
		this.ope = [];
		while(1){
			var line = fio.readLine()
			if(line.match(/\<\[\[slash\]\]data\>/)){ break;}
			if(line.match(/,0$/)){ this.addOpeArray();}
			this.lastope.push((new Operation()).decode(line));
		}
		this.addOpeArray();
		fio.readLine();	/* </history> */

		this.enb_btn();
	},
	toString : function(){
		var lastid = this.ope.length-(this.lastope.isnull()?1:0);
		var strs = ['<history>'];
		strs.push('<info>',('history='+lastid),('current='+this.current),'<[[slash]]info>')
		strs.push('<data>');
		for(var i=0,len=lastid;i<len;i++){ strs.push(this.ope[i].toString());}
		strs.push('<[[slash]]data>','<[[slash]]history>');
		return strs.join('/');
	},

	//---------------------------------------------------------------------------
	// um.undo()  Undoを1回実行する
	// um.redo()  Redoを1回実行する
	// um.undoSingle()  Undoを実行する
	// um.redoSingle()  Redoを実行する
	//---------------------------------------------------------------------------
	undo : function(){
		if(!this.enableUndo){ return;}
		this.undoExec = true;
		this.preproc();
		this.undoSingle();
		this.postproc();
		this.undoExec = false;
		if(!this.enableUndo){ kc.inUNDO=false;}
	},
	redo : function(){
		if(!this.enableRedo){ return;}
		this.redoExec = true;
		this.preproc();
		this.redoSingle();
		this.postproc();
		this.redoExec = false;
		if(!this.enableRedo){ kc.inREDO=false;}
	},

	undoSingle : function(){
		var refope = this.ope[this.current-1].items;
		if(!refope){ return;}
		for(var i=refope.length-1;i>=0;i--){
			this.exec(refope[i], refope[i].old);
			if(refope[i].property!=k.QSUB){ this.anscount--;}
		}
		this.current--;
	},
	redoSingle : function(){
		var refope = this.ope[this.current].items;
		if(!refope){ return;}
		for(var i=0,len=refope.length;i<len;i++){
			this.exec(refope[i], refope[i].num);
			if(refope[i].property!=k.QSUB){ this.anscount++;}
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
			base.enableInfo();
			base.resetInfo(false);
			base.resize_canvas();
		}
		else{
			pc.paintRange(this.range.x1, this.range.y1, this.range.x2, this.range.y2);
		}
		this.enableRecord();
		this.enb_btn();
	},

	//---------------------------------------------------------------------------
	// um.exec()  操作opeを反映する。undo(),redo()から内部的に呼ばれる
	//---------------------------------------------------------------------------
	exec : function(ope, num){
		var id = ope.id;
		if(ope.group !== k.BOARD){
			var name = this.PROPFUNC[ope.property] + this.GROUPSTR[ope.group];
			if(!!bd[name]){ bd[name].call(bd, ope.id, num);}

			switch(ope.group){
				case k.CELL:   this.paintStack(bd.cell[id].bx-1, bd.cell[id].by-1, bd.cell[id].bx+1, bd.cell[id].by+1); break;
				case k.CROSS:  this.paintStack(bd.cross[id].bx-1, bd.cross[id].by-1, bd.cross[id].bx+1, bd.cross[id].by+1); break;
				case k.BORDER: this.paintBorder(id); break;
			}
		}
		else{
			var d = {x1:0, y1:0, x2:2*k.qcols, y2:2*k.qrows};

			if(num & menu.ex.TURNFLIP){ menu.ex.turnflip    (num,d);}
			else                      { menu.ex.expandreduce(num,d);}

			base.disableInfo();
			this.range = {x1:bd.minbx,y1:bd.minby,x2:bd.maxbx,y2:bd.maxby};
			this.reqReset = true;
		}
	},

	//---------------------------------------------------------------------------
	// um.paintBorder()  Borderの周りを描画するため、どの範囲まで変更が入ったか記憶しておく
	// um.paintStack()   変更が入った範囲を返す
	//---------------------------------------------------------------------------
	paintBorder : function(id){
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
};
