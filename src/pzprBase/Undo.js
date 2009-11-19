// Undo.js v3.2.3

//---------------------------------------------------------------------------
// ★UndoManagerクラス 操作情報を扱い、Undo/Redoの動作を実装する
//---------------------------------------------------------------------------
// 入力情報管理クラス
// Operationクラス
Operation = function(obj, property, id, old, num){
	this.obj = obj;
	this.property = property;
	this.id = id;
	this.old = old;
	this.num = num;
	this.chain = um.chainflag;
};

// UndoManagerクラス
UndoManager = function(){
	this.ope = [];			// Operationクラスを保持する配列
	this.current = 0;		// 現在の表示操作番号を保持する
	this.disrec = 0;		// このクラスからの呼び出し時は1にする
	this.disinfo = 0;		// LineManager, AreaManagerを呼び出さないようにする
	this.chainflag = 0;		// 前のOperationとくっつけて、一回のUndo/Redoで変化できるようにする
	this.disCombine = 0;	// 数字がくっついてしまうので、それを一時的に無効にするためのフラグ

	this.anscount = 0;			// 補助以外の操作が行われた数を保持する(autocheck用)
	this.changeflag = false;	// 操作が行われたらtrueにする(mv.notInputted()用)

	this.undoExec = false;		// Undo中
	this.redoExec = false;		// Redo中
	this.reqReset = false;		// Undo/Redo時に盤面回転等が入っていた時、resize,resetInfo関数のcallを要求する
	this.range = { x1:k.qcols+1, y1:k.qrows+1, x2:-2, y2:-2};
};
UndoManager.prototype = {
	//---------------------------------------------------------------------------
	// um.disableRecord()  操作の登録を禁止する
	// um.enableRecord()   操作の登録を許可する
	// um.isenableRecord() 操作の登録できるかを返す
	// um.enb_btn()        html上の[戻][進]ボタンを押すことが可能か設定する
	// um.allerase()       記憶していた操作を全て破棄する
	// um.newOperation()   マウス、キー入力開始時に呼び出す
	//---------------------------------------------------------------------------

	// 今この関数でレコード禁止になるのは、UndoRedo時、URLdecode、fileopen、adjustGeneral/Special時
	// 連動して実行しなくなるのはaddOpe()と、LineInfo/AreaInfoの中身.
	//  -> ここで使っているUndo/RedoとaddOpe以外はbd.QuC系関数を使用しないように変更
	//     変な制限事項がなくなるし、動作速度にもかなり効くしね
	disableRecord : function(){ this.disrec++; },
	enableRecord  : function(){ if(this.disrec>0){ this.disrec--;} },
	isenableRecord : function(){ return (this.disrec==0);},

	disableInfo : function(){ this.disinfo++; },
	enableInfo  : function(){ if(this.disinfo>0){ this.disinfo--;} },
	isenableInfo : function(){ return (this.disinfo==0);},

	enb_btn : function(){
		ee('btnundo').el.disabled = ((!this.ope.length || this.current==0)               ? 'true' : '');
		ee('btnredo').el.disabled = ((!this.ope.length || this.current==this.ope.length) ? 'true' : '');
	},
	allerase : function(){
		for(var i=this.ope.length-1;i>=0;i--){ this.ope.pop();}
		this.current  = 0;
		this.anscount = 0;
		this.enb_btn();
	},
	newOperation : function(flag){	// キー、ボタンを押し始めたときはtrue
		this.chainflag = 0;
		if(flag){ this.changeflag = false;}
	},

	//---------------------------------------------------------------------------
	// um.addOpe() 指定された操作を追加する。id等が同じ場合は最終操作を変更する
	// um.addObj() 指定されたオブジェクトを操作として追加する
	//---------------------------------------------------------------------------
	addOpe : function(obj, property, id, old, num){
		if(!this.isenableRecord()){ return;}
		else if(old==num){ return;}

		var lastid = this.ope.length-1;

		if(this.current < this.ope.length){
			for(var i=this.ope.length-1;i>=this.current;i--){ this.ope.pop();}
			lastid = -1;
		}

		// 前回と同じ場所なら前回の更新のみ
		if(lastid>=0 && this.ope[lastid].obj == obj && this.ope[lastid].property == property && this.ope[lastid].id == id && this.ope[lastid].num == old
			&& this.disCombine==0 && ( (obj == k.CELL && ( property==k.QNUM || (property==k.QANS && k.isAnsNumber) )) || obj == k.CROSS)
		)
		{
			this.ope[lastid].num = num;
		}
		else{
			this.ope.push(new Operation(obj, property, id, old, num));
			this.current++;
			if(this.chainflag==0){ this.chainflag = 1;}
		}

		if(property!=k.QSUB){ this.anscount++;}
		this.changeflag = true;
		this.enb_btn();
	},
	addObj : function(type, id){
		var old, obj;
		if     (type==k.CELL)  { old = new Cell();   obj = bd.cell[id];  }
		else if(type==k.CROSS) { old = new Cross();  obj = bd.cross[id]; }
		else if(type==k.BORDER){ old = new Border(); obj = bd.border[id];}
		else if(type==k.EXCELL){ old = new Cell();   obj = bd.excell[id];}
		for(var i in obj){ old[i] = obj[i];}
		this.addOpe(type, type, id, old, null);
	},

	//---------------------------------------------------------------------------
	// um.undo()  Undoを実行する
	// um.redo()  Redoを実行する
	// um.postproc() Undo/Redo実行後の処理を行う
	// um.exec()  操作opeを反映する。undo(),redo()から内部的に呼ばれる
	//---------------------------------------------------------------------------
	undo : function(){
		if(this.current==0){ return;}
		this.undoExec = true;
		this.range = { x1:k.qcols+1, y1:k.qrows+1, x2:-2, y2:-2};
		this.disableRecord();

		while(this.current>0){
			var ope = this.ope[this.current-1];

			this.exec(ope, ope.old);
			if(ope.property!=k.QSUB){ this.anscount--;}
			this.current--;

			if(!this.ope[this.current].chain){ break;}
		}

		this.postproc();
		this.undoExec = false;
		if(this.current==0){ kc.inUNDO=false;}
	},
	redo : function(){
		if(this.current==this.ope.length){ return;}
		this.redoExec = true;
		this.range = { x1:k.qcols+1, y1:k.qrows+1, x2:-2, y2:-2};
		this.disableRecord();

		while(this.current<this.ope.length){
			var ope = this.ope[this.current];

			this.exec(ope, ope.num);
			if(ope.property!=k.QSUB){ this.anscount++;}
			this.current++;

			if(this.current<this.ope.length && !this.ope[this.current].chain){ break;}
		}

		this.postproc();
		this.redoExec = false;
		if(this.ope.length==0){ kc.inREDO=false;}
	},
	postproc : function(){
		if(this.reqReset){
			this.reqReset=false;

			bd.setposAll();
			base.resetInfo();
			base.resize_canvas();
		}
		else{
			pc.paint(this.range.x1, this.range.y1, this.range.x2, this.range.y2);
		}
		this.enableRecord();
		this.enableInfo();
		this.enb_btn();
	},
	exec : function(ope, num){
		var pp = ope.property;
		if(ope.obj == k.CELL){
			if     (pp == k.QUES){ bd.sQuC(ope.id, num);}
			else if(pp == k.QNUM){ bd.sQnC(ope.id, num);}
			else if(pp == k.DIREC){ bd.sDiC(ope.id, num);}
			else if(pp == k.QANS){ bd.sQaC(ope.id, num);}
			else if(pp == k.QSUB){ bd.sQsC(ope.id, num);}
			else if(pp == k.CELL && !!num){ bd.cell[ope.id] = num;}
			this.paintStack(bd.cell[ope.id].cx, bd.cell[ope.id].cy, bd.cell[ope.id].cx, bd.cell[ope.id].cy);
		}
		else if(ope.obj == k.EXCELL){
			if     (pp == k.QNUM){ bd.sQnE(ope.id, num);}
			else if(pp == k.DIREC){ bd.sDiE(ope.id, num);}
			else if(pp == k.EXCELL && !!num){ bd.excell[ope.id] = num;}
		}
		else if(ope.obj == k.CROSS){
			if     (pp == k.QUES){ bd.sQuX(ope.id, num);}
			else if(pp == k.QNUM){ bd.sQnX(ope.id, num);}
			else if(pp == k.CROSS && !!num){ bd.cross[ope.id] = num;}
			this.paintStack(bd.cross[ope.id].cx-1, bd.cross[ope.id].cy-1, bd.cross[ope.id].cx, bd.cross[ope.id].cy);
		}
		else if(ope.obj == k.BORDER){
			if     (pp == k.QUES){ bd.sQuB(ope.id, num);}
			else if(pp == k.QNUM){ bd.sQnB(ope.id, num);}
			else if(pp == k.QANS){ bd.sQaB(ope.id, num);}
			else if(pp == k.QSUB){ bd.sQsB(ope.id, num);}
			else if(pp == k.LINE){ bd.sLiB(ope.id, num);}
			else if(pp == k.BORDER && !!num){ bd.border[ope.id] = num;}
			this.paintBorder(ope.id);
		}
		else if(ope.obj == k.BOARD){
			this.disableInfo();
			if     (pp == 'expandup'){ if(num==1){ menu.ex.expand(k.UP);}else{ menu.ex.reduce(k.UP);} }
			else if(pp == 'expanddn'){ if(num==1){ menu.ex.expand(k.DN);}else{ menu.ex.reduce(k.DN);} }
			else if(pp == 'expandlt'){ if(num==1){ menu.ex.expand(k.LT);}else{ menu.ex.reduce(k.LT);} }
			else if(pp == 'expandrt'){ if(num==1){ menu.ex.expand(k.RT);}else{ menu.ex.reduce(k.RT);} }
			else if(pp == 'reduceup'){ if(num==1){ menu.ex.reduce(k.UP);}else{ menu.ex.expand(k.UP);} }
			else if(pp == 'reducedn'){ if(num==1){ menu.ex.reduce(k.DN);}else{ menu.ex.expand(k.DN);} }
			else if(pp == 'reducelt'){ if(num==1){ menu.ex.reduce(k.LT);}else{ menu.ex.expand(k.LT);} }
			else if(pp == 'reducert'){ if(num==1){ menu.ex.reduce(k.RT);}else{ menu.ex.expand(k.RT);} }

			else if(pp == 'flipy'){ menu.ex.turnflip(1,{x1:0,y1:0,x2:k.qcols-1,y2:k.qrows-1});}
			else if(pp == 'flipx'){ menu.ex.turnflip(2,{x1:0,y1:0,x2:k.qcols-1,y2:k.qrows-1});}
			else if(pp == 'turnr'){ menu.ex.turnflip((num==1?3:4),{x1:0,y1:0,x2:k.qcols-1,y2:k.qrows-1}); }
			else if(pp == 'turnl'){ menu.ex.turnflip((num==1?4:3),{x1:0,y1:0,x2:k.qcols-1,y2:k.qrows-1}); }

			this.range = { x1:0, y1:0, x2:k.qcols-1, y2:k.qrows-1};
			this.reqReset = true;
		}
	},
	//---------------------------------------------------------------------------
	// um.paintBorder()  Borderの周りを描画するため、どの範囲まで変更が入ったか記憶しておく
	// um.paintStack()   変更が入った範囲を返す
	//---------------------------------------------------------------------------
	paintBorder : function(id){
		if(isNaN(id) || !bd.border[id]){ return;}
		if(bd.border[id].cx%2==1){
			this.paintStack(mf((bd.border[id].cx-1)/2)-1, mf(bd.border[id].cy/2)-1,
							mf((bd.border[id].cx-1)/2)+1, mf(bd.border[id].cy/2)   );
		}
		else{
			this.paintStack(mf(bd.border[id].cx/2)-1, mf((bd.border[id].cy-1)/2)-1,
							mf(bd.border[id].cx/2)  , mf((bd.border[id].cy-1)/2)+1 );
		}
	},
	paintStack : function(x1,y1,x2,y2){
		if(this.range.x1 > x1){ this.range.x1 = x1;}
		if(this.range.y1 > y1){ this.range.y1 = y1;}
		if(this.range.x2 < x2){ this.range.x2 = x2;}
		if(this.range.y2 < y2){ this.range.y2 = y2;}
	}
};
