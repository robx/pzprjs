//
// パズル固有スクリプト部 碁石ひろい版 goishi.js v3.4.0
//
(function(){

var k = pzprv3.consts;

pzprv3.createCustoms('goishi', {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	initialize : function(){
		pzprv3.core.MouseEvent.prototype.initialize.call(this);
		
		this.ut = new this.owner.classes.UndoTimer_goishi();
	},

	mouseinput : function(){
		if(this.owner.playmode && this.mousestart){
			if     (this.btn.Left) { this.inputqans();}
			else if(this.btn.Right){ this.ut.startMouseUndo();}
		}
		else if(this.owner.editmode && this.mousestart){
			this.inputstone();
		}
		
		if(this.mouseend){ this.ut.stop();}
	},

	inputstone : function(){
		var cell = this.getcell();
		if(cell.isnull){ return;}

		if(cell!==this.cursor.getTCC()){
			this.setcursor(cell);
		}
		cell.setStone();
		cell.draw();
	},
	inputqans : function(){
		var cell = this.getcell();
		if(cell.isnull || !cell.isStone() || cell.anum!==-1){
			this.ut.startMouseRedo();
			return;
		}

		var max=0, bd = this.owner.board, bcell=bd.emptycell;
		for(var c=0;c<bd.cellmax;c++){
			var cell2 = bd.cell[c];
			if(cell2.anum>max){
				max = cell2.anum;
				bcell = cell2;
			}
		}

		// すでに1つ以上の碁石が取られている場合
		if(!bcell.isnull){
			var tmp, d = {x1:cell.bx, y1:cell.by, x2:bcell.bx, y2:bcell.by};

			// 自分の上下左右にmaxな碁石がない場合は何もしない
			if(d.x1!==d.x2 && d.y1!==d.y2){ return;}
			else if(d.x1===d.x2){
				if(d.y1>d.y2){ tmp=d.y2; d.y2=d.y1; d.y1=tmp;}
				d.y1+=2; d.y2-=2;
			}
			else{ // if(d.y1===d.y2)
				if(d.x1>d.x2){ tmp=d.x2; d.x2=d.x1; d.x1=tmp;}
				d.x1+=2; d.x2-=2;
			}
			// 間に碁石がある場合は何もしない
			for(var bx=d.x1;bx<=d.x2;bx+=2){ for(var by=d.y1;by<=d.y2;by+=2){
				var cell2 = bd.getc(bx,by);
				if(!cell2.isnull && cell2.isStone()){
					if(cell2.anum===-1 || (max>=2 && cell2.anum===max-1)){ return;}
				}
			} }
		}

		cell.setAnum(max+1);
		cell.draw();
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,

	keyinput : function(ca){
		this.key_inputstone(ca);
	},
	key_inputstone : function(ca){
		if(ca=='q'){
			var cell = this.cursor.getTCC();
			cell.setStone();
			cell.draw();
		}
	}
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	ques : 7,

	isStone : function(){ return this.ques!==7;},
	setStone : function(){
		if     (this.ques=== 7){ this.setQues(0);}
		else if(this.anum===-1){ this.setQues(7);} // 数字のマスは消せません
	}
},

Flags:{
	disable_subclear : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	setColors : function(){
		this.errcolor1 = "rgb(208, 0, 0)";
		this.errbcolor1 = "rgb(255, 192, 192)";
	},
	paint : function(){
		this.drawCenterLines();

		this.drawCircles_goishi();
		this.drawCellSquare();
		this.drawNumbers();

		this.drawTarget();
	},

	drawCenterLines : function(){
		var g = this.vinc('centerline', 'crispEdges'), bd = this.owner.board;

		var x1=this.range.x1, y1=this.range.y1, x2=this.range.x2, y2=this.range.y2;
		if(x1<bd.minbx+1){ x1=bd.minbx+1;} if(x2>bd.maxbx-1){ x2=bd.maxbx-1;}
		if(y1<bd.minby+1){ y1=bd.minby+1;} if(y2>bd.maxby-1){ y2=bd.maxby-1;}
		x1|=1, y1|=1;

		g.fillStyle = this.gridcolor_LIGHT;
		for(var i=x1;i<=x2;i+=2){ if(this.vnop("cliney_"+i,this.NONE)){ g.fillRect( i*this.bw, y1*this.bh, 1, (y2-y1)*this.bh+1);} }
		for(var i=y1;i<=y2;i+=2){ if(this.vnop("clinex_"+i,this.NONE)){ g.fillRect(x1*this.bw,  i*this.bh, (x2-x1)*this.bw+1, 1);} }
	},
	drawCircles_goishi : function(){
		var g = this.vinc('cell_goishi', 'auto');

		g.lineWidth = Math.max(this.cw*0.05, 1);
		var rsize  = this.cw*0.38;
		var header = "c_cir_";
		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i];
			if(cell.isStone() && cell.anum===-1){
				g.strokeStyle = (cell.error===1 ? this.errcolor1  : this.cellcolor);
				g.fillStyle   = (cell.error===1 ? this.errbcolor1 : "white");
				if(this.vnop(header+cell.id,this.FILL_STROKE)){
					var px = cell.bx*this.bw, py = cell.by*this.bh;
					g.shapeCircle(px, py, rsize);
				}
			}
			else{ this.vhide([header+cell.id]);}
		}
	},
	drawCellSquare : function(){
		var g = this.vinc('cell_number_base', 'crispEdges');

		var rw = this.bw*0.8-2;
		var rh = this.bh*0.8-2;
		var header = "c_sq2_";

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i];
			if(cell.isStone() && cell.anum!==-1){
				g.fillStyle = (cell.error===1 ? this.errbcolor1 : "white");
				if(this.vnop(header+cell.id,this.FILL)){
					var px = cell.bx*this.bw, py = cell.by*this.bh;
					g.fillRect(px-rw, py-rh, rw*2+1, rh*2+1);
				}
			}
			else{ this.vhide([header+cell.id]);}
		}
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodeGoishi();
	},
	encodePzpr : function(type){
		this.encodeGoishi();
	},

	decodeKanpen : function(){
		this.owner.fio.decodeGoishi_kanpen();
	},
	encodeKanpen : function(){
		this.owner.fio.encodeGoishi_kanpen();
	},

	decodeGoishi : function(){
		var bstr = this.outbstr, c=0, bd=this.owner.board, twi=[16,8,4,2,1];
		bd.disableInfo();
		for(var i=0;i<bstr.length;i++){
			var num = parseInt(bstr.charAt(i),32);
			for(var w=0;w<5;w++){
				if(c<bd.cellmax){
					bd.cell[c].setQues(num&twi[w]?7:0);
					c++;
				}
			}
			if(c>=bd.qcols*bd.qrows){ break;}
		}
		bd.enableInfo();
		this.outbstr = bstr.substr(i+1);
	},
	// エンコード時は、盤面サイズの縮小という特殊処理を行ってます
	encodeGoishi : function(){
		var d = this.getSizeOfBoard_goishi();

		var cm="", count=0, pass=0, twi=[16,8,4,2,1];
		for(var by=d.y1;by<=d.y2;by+=2){
			for(var bx=d.x1;bx<=d.x2;bx+=2){
				var cell = this.owner.board.getc(bx,by);
				if(cell.isnull || !cell.isStone()){ pass+=twi[count];} count++;
				if(count==5){ cm += pass.toString(32); count=0; pass=0;}
			}
		}
		if(count>0){ cm += pass.toString(32);}
		this.outbstr += cm;

		this.outsize = [d.cols, d.rows].join("/");
	},

	getSizeOfBoard_goishi : function(){
		var x1=9999, x2=-1, y1=9999, y2=-1, count=0, bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c];
			if(!cell.isStone()){ continue;}
			if(x1>cell.bx){ x1=cell.bx;}
			if(x2<cell.bx){ x2=cell.bx;}
			if(y1>cell.by){ y1=cell.by;}
			if(y2<cell.by){ y2=cell.by;}
			count++;
		}
		if(count==0){ return {x1:0, y1:0, x2:1, y2:1, cols:2, rows:2};}
		if(this.owner.get('bdpadding')){ return {x1:x1-2, y1:y1-2, x2:x2+2, y2:y2+2, cols:(x2-x1+6)/2, rows:(y2-y1+6)/2};}
		return {x1:x1, y1:y1, x2:x2, y2:y2, cols:(x2-x1+2)/2, rows:(y2-y1+2)/2};
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeGoishiFile();
	},
	encodeData : function(){
		this.encodeGoishiFile();
	},

	kanpenOpen : function(){
		this.decodeGoishi_kanpen();
		this.decodeQansPos_kanpen();
	},
	kanpenSave : function(){
		this.encodeGoishi_kanpen();
		this.encodeQansPos_kanpen();
	},

	decodeGoishiFile : function(){
		this.decodeCell( function(obj,ca){
			if(ca!=='.'){
				obj.ques = 0;
				if(ca!=='0'){ obj.anum = parseInt(ca);}
			}
		});
	},
	encodeGoishiFile : function(){
		this.encodeCell( function(obj){
			if(obj.ques===0){
				return (obj.anum!==-1 ? ""+obj.anum+" " : "0 ");
			}
			return ". ";
		});
	},

	decodeGoishi_kanpen : function(){
		this.decodeCell( function(obj,ca){
			if(ca==='1'){ obj.ques = 0;}
		});
	},
	encodeGoishi_kanpen : function(){
		var bd = this.owner.board;
		for(var by=bd.minby+1;by<bd.maxby;by+=2){
			for(var bx=bd.minbx+1;bx<bd.maxbx;bx+=2){
				this.datastr += (bd.getc(bx,by).isStone() ? "1 " : ". ");
			}
			this.datastr += "\n";
		}
	},

	decodeQansPos_kanpen : function(){
		for(;;){
			var data = this.readLine();
			if(!data){ break;}

			var item = data.split(" ");
			if(item.length<=1){ return;}
			else{
				var cell = this.owner.board.getc(parseInt(item[2])*2+1,parseInt(item[1])*2+1);
				cell.ques = 0;
				cell.anum = parseInt(item[0]);
			}
		}
	},
	encodeQansPos_kanpen : function(){
		var stones = [], bd = this.owner.board;
		for(var by=bd.minby+1;by<bd.maxby;by+=2){ for(var bx=bd.minbx+1;bx<bd.maxbx;bx+=2){
			var cell = bd.getc(bx,by);
			if(cell.ques!==0 || cell.anum===-1){ continue;}

			var pos = [(bx>>1).toString(), (by>>1).toString()];
			stones[cell.anum-1] = pos;
		}}
		for(var i=0,len=stones.length;i<len;i++){
			var item = [(i+1), stones[i][1], stones[i][0]];
			this.datastr += (item.join(" ")+"\n");
		}
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){
		if( !this.checkPickedStone() ){ return 91001;}

		return 0;
	},

	checkPickedStone :function(){
		return this.checkAllCell(function(cell){ return (cell.isStone() && cell.anum===-1);});
	}
},

//---------------------------------------------------------
// 碁石拾い用の特殊UndiTimer
UndoTimer_goishi:{
	initialize : function(){
		// ** Undoタイマー
		this.TID           = null;	// タイマーID
		this.timerInterval = 25
		if(pzprv3.browser.IE6 || pzprv3.browser.IE7 || pzprv3.browser.IE8){ this.timerInterval *= 2;}

		this.inUNDO = false;
		this.inREDO = false;

		// Undo/Redo用変数
		this.undoWaitTime  = 300;	// 1回目にwaitを多く入れるための値
		this.undoWaitCount = 0;

		this.stop();
	},

	//---------------------------------------------------------------------------
	// ut.startMouseUndo() 碁石拾いの石がない場所のマウスクリックでUndoする
	// ut.startMouseRedo() 碁石拾いの石がない場所のマウスクリックでRedoする
	// ut.startProc() Undo/Redo呼び出しを開始する
	// 
	// ut.stop()      Undo/Redo呼び出しを終了する
	//---------------------------------------------------------------------------
	startMouseUndo : function(){ if(!this.inUNDO){ this.inUNDO=true; this.startProc();}},
	startMouseRedo : function(){ if(!this.inREDO){ this.inREDO=true; this.startProc();}},
	startProc : function(){
		this.undoWaitCount = this.undoWaitTime/this.timerInterval;
		if(!this.TID){
			var self = this;
			this.TID = setInterval(function(){ self.proc();}, this.timerInterval);
		}
		this.exec();
	},

	stop : function(){
		this.inUNDO = false;
		this.inREDO = false;

		clearInterval(this.TID);
		this.TID = null;
	},

	//---------------------------------------------------------------------------
	// ut.proc()  Undo/Redo呼び出しを実行する
	// ut.exec()  Undo/Redo関数を呼び出す
	//---------------------------------------------------------------------------
	proc : function(){
		if (!this.inUNDO && !this.inREDO){ this.stop();}
		else if(this.undoWaitCount>0){ this.undoWaitCount--;}
		else{ this.exec();}
	},
	exec : function(){
		var o = this.owner, opemgr = o.opemgr;
		if(this.inUNDO){
			var prop = (opemgr.enableUndo ? opemgr.ope[opemgr.position-1].property : '');
			if(prop!==k.ANUM){ this.stop();}
		}
		else if(this.inREDO){
			var prop = (opemgr.enableRedo ? opemgr.ope[opemgr.position].property : '');
			if(prop!==k.ANUM){ this.stop();}
		}
		
		if(!!this.TID){
			if(this.inUNDO){
				if(!o.undo()){ this.stop();}
			}
			else if(this.inREDO){
				if(!o.redo()){ this.stop();}
			}
		}
	}
}
});

})();
