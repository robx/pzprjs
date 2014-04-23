// KeyCommon.js v3.4.1

pzpr.classmgr.makeCommon({
//---------------------------------------------------------
KeyEvent:{
	//---------------------------------------------------------------------------
	// kc.key_inputcross() 上限maxまでの数字をCrossの問題データをして入力する(keydown時)
	//---------------------------------------------------------------------------
	key_inputcross : function(ca){
		var cross = this.cursor.getTXC();
		var max = cross.nummaxfunc(), val=-1;

		if('0'<=ca && ca<='9'){
			var num = parseInt(ca), cur = cross.getQnum();
			if(cur<=0 || cur*10+num>max){ cur=0;}
			val = cur*10+num;
			if(val>max){ return;}
		}
		else if(ca==='-'){ cross.setQnum(cross.getQnum()!==-2 ? -2 : -1);}
		else if(ca===' '){ cross.setQnum(-1);}
		else{ return;}

		cross.setQnum(val);
		cross.draw();
	},
	//---------------------------------------------------------------------------
	// kc.key_inputqnum() 上限maxまでの数字をCellの問題データをして入力する(keydown時)
	//---------------------------------------------------------------------------
	key_inputqnum : function(ca){
		var cell = this.cursor.getTCC(), cell0=cell, puzzle=this.owner, bd=puzzle.board;
		if(puzzle.editmode && bd.rooms.hastop){
			cell0 = cell = bd.rooms.getTopOfRoomByCell(cell);
		}
		else if(bd.linfo.moveline && puzzle.getConfig('dispmove')){
			if(cell.isDestination()){ cell = cell.base;}
			else if(cell.lcnt>0){ return;}
		}

		if(this.key_inputqnum_main(cell,ca)){
			this.prev = cell;
			if(bd.linfo.moveline && puzzle.getConfig('dispmove') && cell.noNum()){
				bd.linfo.eraseLineByCell(cell);		/* 丸数字がなくなったら付属する線も消去する */
			}
			cell0.draw();
		}
	},
	key_inputqnum_main : function(cell,ca){
		var max = cell.nummaxfunc(), min = cell.numminfunc(), val=-1;

		if('0'<=ca && ca<='9'){
			var num = parseInt(ca), cur = cell.getNum();
			if(cur<=0 || cur*10+num>max || this.prev!==cell){ cur=0;}
			val = cur*10+num;
			if(val>max || (min>0 && val===0)){ return false;}
		}
		else if(ca==='-') { val = ((this.owner.editmode&&!cell.disInputHatena)?-2:-1);}
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
		if(!this.isSHIFT){ return false;}

		var cell = this.cursor.getTCC(), pid = this.owner.pid;
		if(pid==="firefly" || pid==="snakes" || pid==="yajikazu" || pid==="yajirin"){
			if(cell.getQnum()===-1){ return false;}
		}

		var flag = true;
		switch(ca){
			case this.KEYUP: cell.setQdir(cell.getQdir()!==cell.UP?cell.UP:cell.NDIR); break;
			case this.KEYDN: cell.setQdir(cell.getQdir()!==cell.DN?cell.DN:cell.NDIR); break;
			case this.KEYLT: cell.setQdir(cell.getQdir()!==cell.LT?cell.LT:cell.NDIR); break;
			case this.KEYRT: cell.setQdir(cell.getQdir()!==cell.RT?cell.RT:cell.NDIR); break;
			default: flag = false;
		}

		if(flag){
			this.cursor.getTCP().draw();
			this.stopEvent();	/* カーソルを移動させない */
		}
		return flag;
	},

	//---------------------------------------------------------------------------
	// kc.inputnumber51()  [＼]の数字等を入力する
	// kc.setnum51()      モード別に数字を設定する
	// kc.getnum51()      モード別に数字を取得する
	//---------------------------------------------------------------------------
	inputnumber51 : function(ca,max_obj){
		var tc = this.cursor;
		if(tc.chtarget(ca)){ return;}

		var obj = tc.getOBJ();
		var target = tc.detectTarget(obj);
		if(target===0 || (obj.group==='cell' && obj.is51cell())){
			if(ca==='q' && !obj.isnull){
				if(!obj.is51cell()){ obj.set51cell();}
				else               { obj.remove51cell();}
				tc.getTCP().drawaround();
				return;
			}
		}
		if(target==0){ return;}

		var def = this.owner.Cell.prototype[(target===2?'qnum':'qnum2')];
		var max = max_obj[target], val=def;

		if('0'<=ca && ca<='9'){
			var num=parseInt(ca), cur=this.getnum51(obj,target);
			if(cur<=0 || cur*10+num>max || this.prev!==(obj.group==='cell' ? obj : null)){ cur=0;}
			val = cur*10+num;
			if(val>max){ return;}
		}
		else if(ca=='-' || ca==' '){ val=def;}
		else{ return;}

		this.setnum51(obj,target,val);
		this.prev = (obj.group==='excell' ? obj : null);
		tc.getTCP().draw();
	},
	setnum51 : function(obj,target,val){
		(target==2 ? obj.setQnum(val) : obj.setQnum2(val));
	},
	getnum51 : function(obj,target){
		return (target==2 ? obj.getQnum() : obj.getQnum2());
	}
}
});
