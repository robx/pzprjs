// KeyCommon.js v3.4.1

pzpr.classmgr.makeCommon({
//---------------------------------------------------------
KeyEvent:{
	//---------------------------------------------------------------------------
	// kc.key_inputcross() 上限maxまでの数字をCrossの問題データをして入力する(keydown時)
	//---------------------------------------------------------------------------
	key_inputcross : function(ca){
		var cross = this.cursor.getx();
		var max = cross.getmaxnum(), val=-1;

		if('0'<=ca && ca<='9'){
			var num = +ca, cur = cross.qnum;
			if(cur<=0 || cur*10+num>max){ cur=0;}
			val = cur*10+num;
			if(val>max){ return;}
		}
		else if(ca==='-'){ cross.setQnum(cross.qnum!==-2 ? -2 : -1);}
		else if(ca===' '){ cross.setQnum(-1);}
		else{ return;}

		cross.setQnum(val);
		cross.draw();
	},
	//---------------------------------------------------------------------------
	// kc.key_inputqnum() 上限maxまでの数字をCellの問題データをして入力する(keydown時)
	//---------------------------------------------------------------------------
	key_inputqnum : function(ca){
		var cell = this.cursor.getc(), cell0=cell, puzzle=this.puzzle, bd=puzzle.board;
		if(puzzle.editmode && bd.roommgr.hastop){
			cell0 = cell = cell.room.top;
		}
		else if(puzzle.execConfig('dispmove')){
			if(cell.isDestination()){ cell = cell.base;}
			else if(cell.lcnt>0){ return;}
		}

		if(this.key_inputqnum_main(cell,ca)){
			this.prev = cell;
			if(puzzle.execConfig('dispmove') && cell.noNum()){
				cell.eraseMovedLines();		/* 丸数字がなくなったら付属する線も消去する */
			}
			cell0.draw();
		}
	},
	key_inputqnum_main : function(cell,ca){
		var max = cell.getmaxnum(), min = cell.getminnum(), val=-1;

		if('0'<=ca && ca<='9'){
			var num = +ca, cur = cell.getNum();
			if(cur<=0 || cur*10+num>max || this.prev!==cell){ cur=0;}
			val = cur*10+num;
			if(val>max || (min>0 && val===0)){ return false;}
		}
		else if(ca==='BS'){
			var num = cell.getNum();
			if(num<0){ val = -1;}
			else if(num<10){ val = ((this.puzzle.editmode&&!cell.disInputHatena)?-2:-1);}
			else{ val = (num/10)|0;}
		}
		else if(ca==='-') { val = ((this.puzzle.editmode&&!cell.disInputHatena)?-2:-1);}
		else if(ca===' ') { val = -1;}
		else if(ca==='s1'){ val = -2;}
		else if(ca==='s2'){ val = -3;}
		else{ return false;}

		cell.setNum(val);
		return true;
	},

	//---------------------------------------------------------------------------
	// kc.key_inputdirec()  四方向の矢印などを設定する
	//---------------------------------------------------------------------------
	key_inputdirec : function(ca){
		var cell = this.cursor.getc(), pid = this.pid;
		/* 矢印つき数字の場合 */
		var arrownum = (pid==="firefly" || pid==="snakes" || pid==="yajikazu" || pid==="yajirin");
		if(arrownum && cell.qnum===-1){ return false;}

		var dir = cell.NDIR;
		switch(ca){
			case 'shift+up':    dir = cell.UP; break;
			case 'shift+down':  dir = cell.DN; break;
			case 'shift+left':  dir = cell.LT; break;
			case 'shift+right': dir = cell.RT; break;
		}

		if(dir!==cell.NDIR){
			cell.setQdir(cell.qdir!==dir ? dir : cell.NDIR);
			if(!arrownum){ cell.setQnum(-1);}
			this.cursor.draw();
			this.stopEvent();	/* カーソルを移動させない */
			return true;
		}
		return false;
	},

	//---------------------------------------------------------------------------
	// kc.inputnumber51()  [＼]の数字等を入力する
	// kc.setnum51()      モード別に数字を設定する
	// kc.getnum51()      モード別に数字を取得する
	//---------------------------------------------------------------------------
	inputnumber51 : function(ca,max_obj){
		var cursor = this.cursor;
		if(ca==='shift'){ cursor.chtarget(); return;}

		var piece = cursor.getobj(); /* cell or excell */
		var target = cursor.detectTarget(piece);
		if(target===0 || (piece.group==='cell' && piece.is51cell())){
			if(ca==='q' && !piece.isnull){
				if(!piece.is51cell()){ piece.set51cell();}
				else                 { piece.remove51cell();}
				cursor.drawaround();
				return;
			}
		}
		if(target===0){ return;}

		var def = this.klass.Cell.prototype[(target===2?'qnum':'qnum2')];
		var max = max_obj[target], val=def;

		if('0'<=ca && ca<='9'){
			var num=+ca, cur=this.getnum51(piece,target);
			if(cur<=0 || cur*10+num>max || this.prev!==piece){ cur=0;}
			val = cur*10+num;
			if(val>max){ return;}
		}
		else if(ca==='-' || ca===' '){ val=def;}
		else{ return;}

		this.setnum51(piece,target,val);
		this.prev = piece;
		cursor.draw();
	},
	setnum51 : function(piece,target,val){ /* piece : cell or excell */
		if(target===2){ piece.setQnum(val);}
		else          { piece.setQnum2(val);}
	},
	getnum51 : function(piece,target){ /* piece : cell or excell */
		return (target===2 ? piece.qnum : piece.qnum2);
	}
}
});
