// Undo.js v3.1.9p2

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
	this.undoonly = um.undoonly;
};

// UndoManagerクラス
UndoManager = function(){
	this.ope = new Array();	// Operationクラスを保持する配列
	this.current = 0;		// 現在の表示操作番号を保持する
	this.disrec = 0;		// このクラスからの呼び出し時は1にする
	this.chainflag = 0;
	this.undoonly = 0;
	this.range = { x1:k.qcols+1, y1:k.qrows+1, x2:-2, y2:-2};
	this.reqReset = 0;
	this.disCombine = 0;
	this.anscount = 0;
	this.changeflag = false;
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
	disableRecord : function(){ this.disrec++; },
	enableRecord  : function(){ if(this.disrec>0){ this.disrec--;} },
	isenableRecord : function(){ return (this.disrec==0);},
	enb_btn : function(){
		if(!this.ope.length){
			$("#btnundo").attr("disabled","true");
			$("#btnredo").attr("disabled","true");
		}
		else{
			if(!this.current){ $("#btnundo").attr("disabled","true");}
			else{ $("#btnundo").attr("disabled","");}

			if(this.current==this.ope.length){ $("#btnredo").attr("disabled","true");}
			else{ $("#btnredo").attr("disabled","");}
		}
	},
	allerase : function(){
		for(i=this.ope.length-1;i>=0;i--){ this.ope.pop();}
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
	//---------------------------------------------------------------------------
	addOpe : function(obj, property, id, old, num){
		if(!this.isenableRecord()){ return;}
		else if(old==num){ return;}

		if(obj==property){
			if(obj=='cell' || obj=='excell'){
				this.addOpe(obj, 'ques', id, old.ques, 0);
				this.addOpe(obj, 'qnum', id, old.qnum, -1);
				this.addOpe(obj, 'direc', id, old.direc, 0);
				this.addOpe(obj, 'qans', id, old.qans, -1);
				this.addOpe(obj, 'qsub', id, old.qsub, 0);
				if(old.obj){ this.addOpe(obj, 'numobj', id, old.numobj, "");}
				if(old.obj){ this.addOpe(obj, 'numobj2', id, old.numobj2, "");}
			}
			else if(obj=='cross'){
				this.addOpe('cross', 'ques', id, old.ques, -1);
				this.addOpe('cross', 'qnum', id, old.qnum, -1);
				if(old.obj){ this.addOpe('cross', 'numobj', id, old.numobj, "");}
			}
			else if(obj=='border'){
				this.addOpe('border', 'ques', id, old.ques, 0);
				this.addOpe('border', 'qnum', id, old.ques, 0);
				this.addOpe('border', 'qans', id, old.qans, 0);
				this.addOpe('border', 'qsub', id, old.qsub, 0);
				this.addOpe('border', 'line', id, old.line, 0);
				this.addOpe('border', 'color', id, old.color, "");
				if(old.obj){ this.addOpe('border', 'numobj', id, old.numobj, "");}
			}
		}
		else{
			var lastid = this.ope.length-1;

			if(this.current < this.ope.length){
				var i;
				for(i=this.ope.length-1;i>=this.current;i--){ this.ope.pop();}
				lastid = -1;
			}
			else if(this.undoonly!=1){ lastid!=-1;}

			// 前回と同じ場所なら前回の更新のみ
			if(lastid>=0 && this.ope[lastid].obj == obj && this.ope[lastid].property == property && this.ope[lastid].id == id && this.ope[lastid].num == old
				&& this.disCombine==0 && ( (obj == 'cell' && ( property=='qnum' || (property=='qans' && k.isAnsNumber) )) || obj == 'cross')
			)
			{
				this.ope[lastid].num = num;
			}
			else{
				this.ope.push(new Operation(obj, property, id, old, num));
				this.current++;
				if(this.chainflag==0){ this.chainflag = 1;}
			}
		}
		if(property!='qsub' && property!='color'){ this.anscount++;}
		this.changeflag = true;
		this.enb_btn();
	},

	//---------------------------------------------------------------------------
	// um.undo()  Undoを実行する
	// um.redo()  Redoを実行する
	// um.exec()  操作opeを反映する。undo(),redo()から内部的に呼ばれる
	//---------------------------------------------------------------------------
	undo : function(){
		if(this.current==0){ return;}

		this.disableRecord(); this.range = { x1:k.qcols+1, y1:k.qrows+1, x2:-2, y2:-2};
		while(this.current>0){
			this.exec(this.ope[this.current-1], this.ope[this.current-1].old);
			if(this.ope[this.current-1].property!='qsub' && this.ope[this.current-1].property!='color'){ this.anscount--;}
			this.current--;

			if(!this.ope[this.current].chain){ break;}
		}
		if(this.reqReset==1){ room.resetRarea(); this.reqReset=0;}
		this.enableRecord(); pc.paint(this.range.x1, this.range.y1, this.range.x2, this.range.y2);
		this.enb_btn();
	},
	redo : function(){
		if(this.current==this.ope.length){ return;}
		this.disableRecord(); this.range = { x1:k.qcols+1, y1:k.qrows+1, x2:-2, y2:-2};
		while(this.current<this.ope.length){
			if(this.ope[this.current].undoonly!=1){ this.exec(this.ope[this.current], this.ope[this.current].num);}
			if(this.ope[this.current].property!='qsub' && this.ope[this.current].property!='color'){ this.anscount++;}
			this.current++;

			if(this.current<this.ope.length && !this.ope[this.current].chain){ break;}
		}
		if(this.reqReset==1){ room.resetRarea(); this.reqReset=0;}
		this.enableRecord(); pc.paint(this.range.x1, this.range.y1, this.range.x2, this.range.y2);
		this.enb_btn();
	},
	exec : function(ope, num){
		var pp = ope.property;
		if(ope.obj == 'cell'){
			if     (pp == 'ques'){ bd.setQuesCell(ope.id, num);}
			else if(pp == 'qnum'){ bd.setQnumCell(ope.id, num);}
			else if(pp == 'direc'){ bd.setDirecCell(ope.id, num);}
			else if(pp == 'qans'){ bd.setQansCell(ope.id, num);}
			else if(pp == 'qsub'){ bd.setQsubCell(ope.id, num);}
			else if(pp == 'numobj'){ bd.cell[ope.id].numobj = num;}
			else if(pp == 'numobj2'){ bd.cell[ope.id].numobj2 = num;}
			this.paintStack(bd.cell[ope.id].cx, bd.cell[ope.id].cy, bd.cell[ope.id].cx, bd.cell[ope.id].cy);
		}
		else if(ope.obj == 'excell'){
			if     (pp == 'qnum'){ bd.setQnumEXcell(ope.id, num);}
			else if(pp == 'direc'){ bd.setDirecEXcell(ope.id, num);}
		}
		else if(ope.obj == 'cross'){
			if     (pp == 'ques'){ bd.setQuesCross(ope.id, num);}
			else if(pp == 'qnum'){ bd.setQnumCross(ope.id, num);}
			else if(pp == 'numobj'){ bd.cross[ope.id].numobj = num;}
			this.paintStack(bd.cross[ope.id].cx-1, bd.cross[ope.id].cy-1, bd.cross[ope.id].cx, bd.cross[ope.id].cy);
		}
		else if(ope.obj == 'border'){
			if     (pp == 'ques'){ bd.setQuesBorder(ope.id, num);}
			else if(pp == 'qnum'){ bd.setQnumBorder(ope.id, num);}
			else if(pp == 'qans'){ bd.setQansBorder(ope.id, num);}
			else if(pp == 'qsub'){ bd.setQsubBorder(ope.id, num);}
			else if(pp == 'line'){ bd.setLineBorder(ope.id, num);}
			else if(pp == 'color'){ bd.border[ope.id].color = num;}
			this.paintBorder(ope.id);
		}
		else if(ope.obj == 'board'){
			if     (pp == 'expandup'){ if(num==1){ menu.ex.expandup();}else{ menu.ex.reduceup();} }
			else if(pp == 'expanddn'){ if(num==1){ menu.ex.expanddn();}else{ menu.ex.reducedn();} }
			else if(pp == 'expandlt'){ if(num==1){ menu.ex.expandlt();}else{ menu.ex.reducelt();} }
			else if(pp == 'expandrt'){ if(num==1){ menu.ex.expandrt();}else{ menu.ex.reducert();} }
			else if(pp == 'reduceup'){ if(num==1){ menu.ex.reduceup();}else{ menu.ex.expandup();} }
			else if(pp == 'reducedn'){ if(num==1){ menu.ex.reducedn();}else{ menu.ex.expanddn();} }
			else if(pp == 'reducelt'){ if(num==1){ menu.ex.reducelt();}else{ menu.ex.expandlt();} }
			else if(pp == 'reducert'){ if(num==1){ menu.ex.reducert();}else{ menu.ex.expandrt();} }

			else if(pp == 'flipy'){ menu.ex.flipy(0,0,k.qcols-1,k.qrows-1);}
			else if(pp == 'flipx'){ menu.ex.flipx(0,0,k.qcols-1,k.qrows-1);}
			else if(pp == 'turnr'){ if(num==1){ menu.ex.turnr(0,0,k.qcols-1,k.qrows-1);} else{ menu.ex.turnl(0,0,k.qcols-1,k.qrows-1);} }
			else if(pp == 'turnl'){ if(num==1){ menu.ex.turnl(0,0,k.qcols-1,k.qrows-1);} else{ menu.ex.turnr(0,0,k.qcols-1,k.qrows-1);} }

			tc.Adjust();
			base.resize_canvas();
			this.range = { x1:0, y1:0, x2:k.qcols-1, y2:k.qrows-1};
			this.reqReset = 1;
		}
	},
	//---------------------------------------------------------------------------
	// um.paintBorder()  Borderの周りを描画するため、どの範囲まで変更が入ったか記憶しておく
	// um.paintStack()   変更が入った範囲を返す
	//---------------------------------------------------------------------------
	paintBorder : function(id){
		if(isNaN(id) || !bd.border[id]){ return;}
		if(bd.border[id].cx%2==1){
			this.paintStack(int((bd.border[id].cx-1)/2)-1, int(bd.border[id].cy/2)-1,
							int((bd.border[id].cx-1)/2)+1, int(bd.border[id].cy/2)   );
		}
		else{
			this.paintStack(int(bd.border[id].cx/2)-1, int((bd.border[id].cy-1)/2)-1,
							int(bd.border[id].cx/2)  , int((bd.border[id].cy-1)/2)+1 );
		}
	},
	paintStack : function(x1,y1,x2,y2){
		if(this.range.x1 > x1){ this.range.x1 = x1;}
		if(this.range.y1 > y1){ this.range.y1 = y1;}
		if(this.range.x2 < x2){ this.range.x2 = x2;}
		if(this.range.y2 < y2){ this.range.y2 = y2;}
	}
};
