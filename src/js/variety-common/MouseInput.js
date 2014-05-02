// MouseCommon.js v3.4.1

pzpr.classmgr.makeCommon({
//---------------------------------------------------------
MouseEvent:{
	// 共通関数
	//---------------------------------------------------------------------------
	// mv.inputcell() Cellのqans(回答データ)に0/1/2のいずれかを入力する。
	// mv.decIC()     0/1/2どれを入力すべきかを決定する。
	//---------------------------------------------------------------------------
	inputcell : function(){
		var cell = this.getcell();
		if(cell.isnull || cell===this.mouseCell){ return;}
		if(this.inputData===null){ this.decIC(cell);}

		this.mouseCell = cell;

		if(cell.numberRemainsUnshaded && cell.getQnum()!==-1 && (this.inputData===1||(this.inputData===2 && this.owner.painter.bcolor==="white"))){ return;}
		if(this.RBShadeCell && this.inputData===1){
			if(this.firstCell.isnull){ this.firstCell = cell;}
			var cell0 = this.firstCell;
			if(((cell0.bx&2)^(cell0.by&2))!==((cell.bx&2)^(cell.by&2))){ return;}
		}

		(this.inputData==1?cell.setShade:cell.clrShade).call(cell);
		cell.setQsub(this.inputData===2?1:0);

		cell.draw();
	},
	decIC : function(cell){
		if(this.owner.getConfig('use')==1){
			if     (this.btn.Left) { this.inputData=(cell.isUnshade()  ? 1 : 0); }
			else if(this.btn.Right){ this.inputData=((cell.getQsub()!==1)? 2 : 0); }
		}
		else if(this.owner.getConfig('use')==2){
			if(cell.numberRemainsUnshaded && cell.getQnum()!==-1){
				this.inputData=((cell.getQsub()!==1)? 2 : 0);
			}
			else if(this.btn.Left){
				if     (cell.isShade())    { this.inputData=2;}
				else if(cell.getQsub()===1){ this.inputData=0;}
				else{ this.inputData=1;}
			}
			else if(this.btn.Right){
				if     (cell.isShade())    { this.inputData=0;}
				else if(cell.getQsub()===1){ this.inputData=1;}
				else{ this.inputData=2;}
			}
		}
	},
	//---------------------------------------------------------------------------
	// mv.inputqnum()      Cellのqnum(数字データ)に数字を入力する
	// mv.inputqnum_main() Cellのqnum(数字データ)に数字を入力する(メイン処理)
	//---------------------------------------------------------------------------
	inputqnum : function(){
		var cell = this.getcell();
		if(cell.isnull || cell===this.mouseCell){ return;}

		if(cell!==this.cursor.getc()){
			this.setcursor(cell);
		}
		else{
			this.inputqnum_main(cell);
		}
		this.mouseCell = cell;
	},
	inputqnum_main : function(cell){
		var cell0=cell, puzzle=this.owner, bd=puzzle.board;
		if(puzzle.editmode && bd.rooms.hastop){
			cell0 = cell = bd.rooms.getTopOfRoomByCell(cell);
		}
		else if(puzzle.execConfig('dispmove')){
			if(cell.isDestination()){ cell = cell.base;}
			else if(cell.lcnt>0){ return;}
		}

		var subtype=0; // qsubを0～いくつまで入力可能かの設定
		if     (puzzle.editmode)    { subtype =-1;}
		else if(cell.numberWithMB)  { subtype = 2;}
		else if(cell.numberAsObject){ subtype = 1;}
		if(puzzle.pid==="roma" && puzzle.playmode){ subtype=0;}

		if(puzzle.playmode && cell.qnum!==puzzle.Cell.prototype.qnum){ return;}

		var max=cell.nummaxfunc(), min=cell.numminfunc();
		var num=cell.getNum(), qs=(puzzle.editmode ? 0 : cell.getQsub());
		var val=-1, ishatena=(puzzle.editmode && !cell.disInputHatena);

		// playmode: subtypeは0以上、 qsにqsub値が入る
		// editmode: subtypeは-1固定、qsは常に0が入る
		if(this.btn.Left){
			if     (num>=max){ val = ((subtype>=1) ? -2 : -1);}
			else if(qs === 1){ val = ((subtype>=2) ? -3 : -1);}
			else if(qs === 2){ val = -1;}
			else if(num===-1){ val = (ishatena ? -2 : min);}
			else if(num< min){ val = min;}
			else             { val = num+1;}
		}
		else if(this.btn.Right){
			if     (qs === 1){ val = max;}
			else if(qs === 2){ val = -2;}
			else if(num===-1){
				if     (subtype===1){ val = -2;}
				else if(subtype===2){ val = -3;}
				else                { val = max;}
			}
			else if(num> max){ val = max;}
			else if(num<=min){ val = (ishatena ? -2 : -1);}
			else if(num===-2){ val = -1;}
			else             { val = num-1;}
		}
		cell.setNum(val);

		if(puzzle.execConfig('dispmove') && cell.noNum()){
			bd.linfo.eraseLineByCell(cell);		/* 丸数字がなくなったら付属する線も消去する */
		}

		cell0.draw();
	},

	//---------------------------------------------------------------------------
	// mv.inputQues() Cellのquesデータをarrayのとおりに入力する
	//---------------------------------------------------------------------------
	inputQues : function(array){
		var cell = this.getcell();
		if(cell.isnull){ return;}

		if(cell!==this.cursor.getc()){
			this.setcursor(cell);
		}
		else{
			this.inputQues_main(array,cell);
		}
	},
	inputQues_main : function(array,cell){
		var qu = cell.getQues(), len = array.length;
		if(this.btn.Left){
			for(var i=0;i<=len-1;i++){
				if(qu===array[i]){
					cell.setQues(array[((i<len-1)?i+1:0)]);
					break;
				}
			}
		}
		else if(this.btn.Right){
			for(var i=len-1;i>=0;i--){
				if(qu===array[i]){
					cell.setQues(array[((i>0)?i-1:len-1)]);
					break;
				}
			}
		}
		cell.draw();
	},

	//---------------------------------------------------------------------------
	// mv.inputMB()   Cellのqsub(補助記号)の○, ×データを入力する
	//---------------------------------------------------------------------------
	inputMB : function(){
		var cell = this.getcell();
		if(cell.isnull){ return;}

		cell.setQsub((this.btn.Left?[1,2,0]:[2,0,1])[cell.getQsub()]);
		cell.draw();
	},

	//---------------------------------------------------------------------------
	// mv.inputdirec()      Cellのdirec(方向)のデータを入力する
	// mv.inputarrow_cell() Cellの矢印を入力する
	// mv.getdir()          入力がどの方向になるか取得する
	//---------------------------------------------------------------------------
	inputdirec : function(){
		var pos = this.getpos(0);
		if(this.prevPos.equals(pos)){ return;}

		var cell = this.prevPos.getc();
		if(!cell.isnull){
			if(cell.getQnum()!==-1){
				var dir = this.getdir(this.prevPos, pos);
				if(dir!==cell.NDIR){
					cell.setQdir(cell.getQdir()!==dir?dir:0);
					cell.draw();
				}
			}
		}
		this.prevPos = pos;
	},
	inputarrow_cell : function(){
		var pos = this.getpos(0);
		if(this.prevPos.equals(pos) && this.inputData===1){ return;}

		var dir = pos.NDIR, cell = this.prevPos.getc();
		if(!cell.isnull){
			var dir = this.getdir(this.prevPos, pos);
			if(dir!==pos.NDIR){
				this.inputarrow_cell_main(cell, dir);
				cell.draw();
				this.mousereset();
				return;
			}
		}
		this.prevPos = pos;
	},
	inputarrow_cell_main : function(cell, dir){
		if(cell.numberAsObject){ cell.setNum(dir);}
	},

	getdir : function(base, current){
		var dx = (current.bx-base.bx), dy = (current.by-base.by);
		if     (dx=== 0 && dy===-2){ return base.UP;}
		else if(dx=== 0 && dy=== 2){ return base.DN;}
		else if(dx===-2 && dy=== 0){ return base.LT;}
		else if(dx=== 2 && dy=== 0){ return base.RT;}
		return base.NDIR;
	},

	//---------------------------------------------------------------------------
	// mv.inputtile()  黒タイル、白タイルを入力する
	//---------------------------------------------------------------------------
	inputtile : function(){
		var cell = this.getcell();
		if(cell.isnull || cell.is51cell() || cell===this.mouseCell){ return;}
		if(this.inputData===null){ this.decIC(cell);}

		this.mouseCell = cell;
		var clist = this.owner.board.rooms.getClistByCell(cell);
		for(var i=0;i<clist.length;i++){
			var cell2 = clist[i];
			if(this.inputData===1 || cell2.getQsub()!==3){
				(this.inputData===1?cell2.setShade:cell2.clrShade).call(cell2);
				cell2.setQsub(this.inputData==2?1:0);
			}
		}
		clist.draw();
	},

	//---------------------------------------------------------------------------
	// mv.input51()   [＼]を作ったり消したりする
	//---------------------------------------------------------------------------
	input51 : function(){
		var obj = this.getcell_excell();
		if(obj.isnull){ return;}

		var group = obj.group;
		if(group==='excell' || (group==='cell' && obj!==this.cursor.getc())){
			this.setcursor(obj);
		}
		else if(group==='cell'){
			this.input51_main(obj);
		}
	},
	input51_main : function(cell){
		if(this.btn.Left){
			if(!cell.is51cell()){ cell.set51cell();}
			else{ this.cursor.chtarget('shift');}
		}
		else if(this.btn.Right){ cell.remove51cell();}

		cell.drawaround();
	},

	//---------------------------------------------------------------------------
	// mv.inputcross()     Crossのques(問題データ)に0～4を入力する。
	// mv.inputcrossMark() Crossの黒点を入力する。
	//---------------------------------------------------------------------------
	inputcross : function(){
		var cross = this.getcross();
		if(cross.isnull || cross===this.mouseCell){ return;}

		if(cross!==this.cursor.getx()){
			this.setcursor(cross);
		}
		else{
			this.inputcross_main(cross);
		}
		this.mouseCell = cross;
	},
	inputcross_main : function(cross){
		if(this.btn.Left){
			cross.setQnum(cross.getQnum()!==4 ? cross.getQnum()+1 : -2);
		}
		else if(this.btn.Right){
			cross.setQnum(cross.getQnum()!==-2 ? cross.getQnum()-1 : 4);
		}
		cross.draw();
	},
	inputcrossMark : function(){
		var pos = this.getpos(0.24);
		if(!pos.oncross()){ return;}
		var bd = this.owner.board, bm = (bd.hascross===2?0:2);
		if(pos.bx<bd.minbx+bm || pos.bx>bd.maxbx-bm || pos.by<bd.minby+bm || pos.by>bd.maxby-bm){ return;}

		var cross = pos.getx();
		if(cross.isnull){ return;}

		this.owner.opemgr.disCombine = true;
		cross.setQnum(cross.getQnum()===1?-1:1);
		this.owner.opemgr.disCombine = false;

		cross.draw();
	},
	//---------------------------------------------------------------------------
	// mv.inputborder()     盤面境界線のデータを入力する
	// mv.inputQsubLine()   盤面の境界線用補助記号を入力する
	//---------------------------------------------------------------------------
	inputborder : function(){
		var pos = this.getpos(0.35);
		if(this.prevPos.equals(pos)){ return;}

		var border = this.getborderobj(this.prevPos, pos);
		if(!border.isnull){
			if(this.inputData===null){ this.inputData=(border.isBorder()?0:1);}
			if     (this.inputData===1){ border.setBorder();}
			else if(this.inputData===0){ border.removeBorder();}
			border.draw();
		}
		this.prevPos = pos;
	},
	inputQsubLine : function(){
		var pos = this.getpos(0);
		if(this.prevPos.equals(pos)){ return;}

		var border = this.getnb(this.prevPos, pos);
		if(!border.isnull){
			if(this.inputData===null){ this.inputData=(border.getQsub()===0?1:0);}
			if     (this.inputData===1){ border.setQsub(1);}
			else if(this.inputData===0){ border.setQsub(0);}
			border.draw();
		}
		this.prevPos = pos;
	},

	//---------------------------------------------------------------------------
	// mv.inputLine()     盤面の線を入力する
	// mv.inputMoveLine() 移動系パズル向けに盤面の線を入力する
	//---------------------------------------------------------------------------
	inputLine : function(){
		if(this.owner.board.lines.isCenterLine){
			var pos = this.getpos(0);
			if(this.prevPos.equals(pos)){ return;}
			var border = this.getnb(this.prevPos, pos);
		}
		else{
			var pos = this.getpos(0.35);
			if(this.prevPos.equals(pos)){ return;}
			var border = this.getborderobj(this.prevPos, pos);
		}
		
		if(!border.isnull){
			if(this.inputData===null){ this.inputData=(border.isLine()?0:1);}
			if     (this.inputData===1){ border.setLine();}
			else if(this.inputData===0){ border.removeLine();}
			border.draw();
		}
		this.prevPos = pos;
	},
	inputMoveLine : function(){
		/* "ものを動かしたように描画する"でなければinputLineと同じ */
		if(!this.owner.execConfig('dispmove')){
			this.inputLine();
			return;
		}
		
		var cell = this.getcell();
		if(cell.isnull){ return;}

		var cell0 = this.mouseCell, pos = cell.getaddr();
		/* 初回はこの中に入ってきます。 */
		if(this.mousestart && cell.isDestination()){
			this.mouseCell = cell;
			this.prevPos = pos;
			cell.draw();
		}
		/* 移動中の場合 */
		else if(this.mousemove && !cell0.isnull && !cell.isDestination()){
			var border = this.getnb(this.prevPos, pos);
			if(!border.isnull && ((!border.isLine() && cell.lcnt===0) || (border.isLine() && cell0.lcnt===1))){
				this.mouseCell = cell;
				this.prevPos = pos;
				if(!border.isLine()){ border.setLine();}else{ border.removeLine();}
				border.draw();
			}
		}
	},

	//---------------------------------------------------------------------------
	// mv.getnb()         上下左右に隣接する境界線のIDを取得する
	// mv.getborderobj()  入力対象となる境界線オブジェクトを取得する
	//---------------------------------------------------------------------------
	getnb : function(base, current){
		if     (current.bx-base.bx=== 0 && current.by-base.by===-2){ return base.rel(0,-1).getb();}
		else if(current.bx-base.bx=== 0 && current.by-base.by=== 2){ return base.rel(0, 1).getb();}
		else if(current.bx-base.bx===-2 && current.by-base.by=== 0){ return base.rel(-1,0).getb();}
		else if(current.bx-base.bx=== 2 && current.by-base.by=== 0){ return base.rel( 1,0).getb();}
		return this.owner.board.emptyborder;
	},
	getborderobj : function(base, current){
		if(((current.bx&1)===0 && base.bx===current.bx && Math.abs(base.by-current.by)===1) ||
		   ((current.by&1)===0 && base.by===current.by && Math.abs(base.bx-current.bx)===1) )
			{ return (base.onborder() ? base : current).getb();}
		return this.owner.board.nullobj;
	},

	//---------------------------------------------------------------------------
	// mv.inputpeke()   盤面の線が通らないことを示す×を入力する
	//---------------------------------------------------------------------------
	inputpeke : function(){
		var pos = this.getpos(0.22);
		if(this.prevPos.equals(pos)){ return;}

		var border = pos.getb();
		if(!border.isnull){
			if(this.inputData===null){ this.inputData=(border.getQsub()===0?2:3);}
			if(this.inputData===2 && border.isLine() && this.owner.execConfig('dispmove')){}
			else if(this.inputData===2){ border.setPeke();}
			else if(this.inputData===3){ border.removeLine();}
			border.draw();
		}
		this.prevPos = pos;
	},

	//---------------------------------------------------------------------------
	// mv.dispRed()  ひとつながりの黒マスを赤く表示する
	// mv.dispRed8() ななめつながりの黒マスを赤く表示する
	// mv.dispRedLine()   ひとつながりの線を赤く表示する
	//---------------------------------------------------------------------------
	dispRed : function(){
		var cell = this.getcell();
		this.mousereset();
		if(cell.isnull || !cell.isShade()){ return;}
		if(!this.RBShadeCell){ this.owner.board.bcell.getClistByCell(cell).setinfo(1);}
		else{ this.dispRed8(cell);}
		this.owner.board.haserror = true;
		this.owner.redraw();
	},
	dispRed8 : function(cell0){
		var stack=[cell0];
		while(stack.length>0){
			var cell = stack.pop();
			if(cell.qinfo!==0){ continue;}

			cell.setinfo(1);
			var bx=cell.bx, by=cell.by, clist=this.owner.board.cellinside(bx-2,by-2,bx+2,by+2);
			for(var i=0;i<clist.length;i++){
				var cell2 = clist[i];
				if(cell2.qinfo===0 && cell2.isShade()){ stack.push(cell2);}
			}
		}
	},

	dispRedLine : function(){
		var bd = this.owner.board, border = this.getborder(0.15);
		this.mousereset();
		if(border.isnull){ return;}

		if(!border.isLine()){
			var obj = (!bd.lines.borderAsLine ? this.getcell() : this.getcross());
			if(obj.isnull || (obj.iscrossing() && (obj.lcnt===3 || obj.lcnt===4))){ return;}
			var adb = obj.adjborder;
			if     (adb.left.isLine()  ){ border = adb.left;  }
			else if(adb.right.isLine() ){ border = adb.right; }
			else if(adb.top.isLine()   ){ border = adb.top;   }
			else if(adb.bottom.isLine()){ border = adb.bottom;}
			else{ return;}
		}
		if(border.isnull){ return;}

		var blist = bd.lines.getBlistByBorder(border);
		bd.border.setinfo(-1);
		blist.setinfo(1);
		bd.haserror = true;
		this.owner.redraw();
	}
}
});
