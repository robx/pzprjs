//
// パズル固有スクリプト部 たわむれんが版 tawa.js
//
(function(pidlist, classbase){
	if(typeof module==='object' && module.exports){module.exports = [pidlist, classbase];}
	else{ pzpr.classmgr.makeCustom(pidlist, classbase);}
}(
['tawa'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	use : true,
	inputModes : {edit:['number','clear'],play:['shade','unshade']},
	mouseinput_auto : function(){
		if(this.puzzle.playmode){
			if(this.mousestart || this.mousemove){ this.inputcell();}
		}
		else if(this.puzzle.editmode){
			if(this.mousestart){ this.inputqnum();}
		}
	},

	// マウス入力時のセルID取得系
	getcell : function(){
		var pos = this.getpos(0), cand = pos.getc();
		return (!cand.isnull ? cand : pos.move(1,0).getc());
	},
	getpos : function(rc){
		return (new this.klass.Address(this.inputPoint.bx|0, (this.inputPoint.by&~1)+1));
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true
},

TargetCursor:{
	// キー移動範囲のminx,maxx,miny,maxy設定関数オーバーライド
	adjust_init : function(){
		if(this.getc().isnull){
			this.bx++;
		}
	},

	movedir : function(dir,mv){
		this.common.movedir.call(this,dir,mv);

		if(dir===this.UP){
			if(this.bx===this.maxx || (this.bx>this.minx && (this.by&2)===0)){ this.bx--;}
			else{ this.bx++;}
		}
		else if(dir===this.DN){
			if(this.bx===this.minx || (this.bx<this.maxx && (this.by&2)===2)){ this.bx++;}
			else{ this.bx--;}
		}
	}
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	numberRemainsUnshaded : true,

	maxnum : 6,
	minnum : 0
},
Board:{
	cols : 6,	// ※本スクリプトでは一番上の段のマスの数を表すこととする.
	rows : 7,
	shape : 3,	// 2段目は => 0:左右引っ込み 1:右のみ出っ張り 2:左のみ出っ張り 3:左右出っ張り

	hascross : 0,

	setShape : function(val){
		this.shape=val;
		this.setminmax();
	},

	estimateSize : function(type, col, row){
		var total = 0;
		if(type==='cell'){
			if     (this.shape===0){ total = (row>>1)*(2*col-1)+((row%2===1)?col:0);}
			else if(this.shape===3 || this.shape===undefined){ total = (row>>1)*(2*col+1)+((row%2===1)?col:0);}
			else{ total = col*row;}
		}
		return total;
	},
	setposCells : function(){
		for(var id=0;id<this.cell.length;id++){
			var cell = this.cell[id];
			cell.id = id;
			cell.isnull = false;

			if(this.shape===0){
				var row = (((2*id)/(2*this.cols-1))|0);
				cell.bx = (((2*id)%(2*this.cols-1))|0)+1;
				cell.by = row*2+1;
			}
			else if(this.shape===1){
				var row = ((id/this.cols)|0);
				cell.bx = ((id%this.cols)|0)*2+(!!(row&1)?1:0)+1;
				cell.by = row*2+1;
			}
			else if(this.shape===2){
				var row = ((id/this.cols)|0);
				cell.bx = ((id%this.cols)|0)*2+(!(row&1)?1:0)+1;
				cell.by = row*2+1;
			}
			else if(this.shape===3){
				var row = (((2*id+1)/(2*this.cols+1))|0);
				cell.bx = (((2*id+1)%(2*this.cols+1))|0)+1;
				cell.by = row*2+1;
			}
		}
	},
	setminmax : function(){
		this.minbx = 0;
		this.minby = 0;
		this.maxbx = 2*this.cols + [0,1,1,2][this.shape];
		this.maxby = 2*this.rows;

		this.puzzle.cursor.setminmax();
	},

	getc : function(bx,by){
		var id = null, qc=this.cols;
		if(bx>=this.minbx+1 && bx<=this.maxbx-1 && by>=this.minby+1 && by<=this.maxby-1){
			var cy = (by>>1);	// 上から数えて何段目か(0～rows-1)
			if     (this.shape===0){ if(!!((bx+cy)&1)){ id = ((bx-1)+cy*(2*qc-1))>>1;}}
			else if(this.shape===1){ if(!!((bx+cy)&1)){ id = ((bx-1)+cy*(2*qc  ))>>1;}}
			else if(this.shape===2){ if( !((bx+cy)&1)){ id = ((bx-1)+cy*(2*qc  ))>>1;}}
			else if(this.shape===3){ if( !((bx+cy)&1)){ id = ((bx-1)+cy*(2*qc+1))>>1;}}
		}

		return (id!==null ? this.cell[id] : this.emptycell);
	},
	getobj : function(bx,by){
		return this.getc(bx,by);
	},
	cellinside : function(x1,y1,x2,y2){
		var clist = new this.klass.CellList();
		for(var by=(y1|1);by<=y2;by+=2){ for(var bx=x1;bx<=x2;bx++){
			var cell = this.getc(bx,by);
			if(!cell.isnull){ clist.add(cell);}
		}}
		return clist;
	}
},
BoardExec:{
	// 拡大縮小・回転反転時の関数
	execadjust : function(name){
		var bd = this.board;
		if(name.indexOf("reduce")===0){
			if(name==="reduceup"||name==="reducedn"){
				if(bd.rows<=1){ return;}
			}
			else if(name==="reducelt"||name==="reducert"){
				if(bd.cols<=1 && (bd.shape!==3)){ return;}
			}
		}

		this.common.execadjust.call(this, name);
	},
	execadjust_main : function(key,d){
		var bd = this.board;

		if(key & this.TURNFLIP){
			d = {x1:bd.minbx, y1:bd.minby, x2:bd.maxbx, y2:bd.maxby};
			if     (key===this.FLIPY){ if(!(bd.rows&1)){ bd.cols-=[1,0,0,-1][bd.shape]; bd.shape = {0:3,1:2,2:1,3:0}[bd.shape];}}
			else if(key===this.FLIPX){ bd.shape = {0:0,1:2,2:1,3:3}[bd.shape];}
			else{ throw "Tawamurenga can't accept turning operation!";}
		}
		else if(key & this.EXPAND){
			switch(key & 0x0F){
				case this.LT: bd.cols+=[0,0,1,1][bd.shape];  bd.shape=[2,3,0,1][bd.shape]; break;
				case this.RT: bd.cols+=[0,1,0,1][bd.shape];  bd.shape=[1,0,3,2][bd.shape]; break;
				case this.UP: bd.cols+=[-1,0,0,1][bd.shape]; bd.shape=[3,2,1,0][bd.shape]; bd.rows++; break;
				case this.DN: bd.rows++; break;
			}
			bd.setminmax();
		}

		// main operation
		if     (key & this.EXPAND){ this.expandGroup('cell', key);}
		else if(key & this.REDUCE){ this.reduceGroup('cell', key);}
		else                      { this.turnflipGroup('cell', key, d);}

		if(key & this.REDUCE){
			switch(key & 0x0F){
				case this.LT: bd.cols-=[1,1,0,0][bd.shape];  bd.shape=[2,3,0,1][bd.shape]; break;
				case this.RT: bd.cols-=[1,0,1,0][bd.shape];  bd.shape=[1,0,3,2][bd.shape]; break;
				case this.UP: bd.cols-=[1,0,0,-1][bd.shape]; bd.shape=[3,2,1,0][bd.shape]; bd.rows--; break;
				case this.DN: bd.rows--; break;
			}
		}

		bd.setposAll();
	},
	distObj : function(key,piece){
		var bd = this.board;
		key &= 0x0F;
		if     (key===this.UP){ return piece.by;}
		else if(key===this.DN){ return bd.maxby-piece.by;}
		else if(key===this.LT){ return piece.bx;}
		else if(key===this.RT){ return bd.maxbx-piece.bx;}
		return -1;
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	qanscolor : "black",
	numbercolor_func : "qnum",

	paint : function(){
		this.drawBGCells();
		this.drawShadedCells();
		this.drawDotCells(false);
		this.drawGrid_tawa();

		this.drawQuesNumbers();

		this.drawTarget();
	},
	flushCanvas : function(){
		var g = this.vinc('background', 'crispEdges', true);
		var minbx, minby, bwidth, bheight;
		var bw = this.bw, bh = this.bh;

		if(g.use.canvas){
			var d = this.range;
			minbx   = d.x1;
			minby   = d.y1;
			bwidth  = d.x2 - minbx;
			bheight = d.y2 - minby;
		}
		else{
			var bd = this.board;
			minbx   = bd.minbx;
			minby   = bd.minby;
			bwidth  = bd.maxbx - minbx;
			bheight = bd.maxby - minby;
		}

		g.vid = "BG";
		g.fillStyle = this.bgcolor;
		g.fillRect(minbx*bw-0.5, minby*bh-0.5, bwidth*bw+1, bheight*bh+1);
	},

	drawGrid_tawa : function(){
		var g = this.vinc('grid', 'crispEdges', true), bd = this.board;

		var x1=this.range.x1, y1=this.range.y1, x2=this.range.x2, y2=this.range.y2;
		if(x1<bd.minbx){ x1=bd.minbx;} if(x2>bd.maxbx){ x2=bd.maxbx;}
		if(y1<bd.minby){ y1=bd.minby;} if(y2>bd.maxby){ y2=bd.maxby;}

		var lw = Math.max(this.cw/36, 1);
		var lm = (lw-1)/2;

		g.fillStyle = this.gridcolor;
		var xa = Math.max(x1,bd.minbx), xb = Math.min(x2,bd.maxbx);
		var ya = Math.max(y1,bd.minby), yb = Math.min(y2,bd.maxby);
		ya-=(ya&1);
		for(var by=ya;by<=yb;by+=2){
			var cy = (by>>1), redx = 0, redw = 0;
			if     ((bd.shape===3 && (by===bd.minby||(by===bd.maxby&&(cy&1)))) || (bd.shape===0 && (by===bd.maxby&&!(cy&1)))){ redx=1; redw=2;}
			else if((bd.shape===2 && (by===bd.minby||(by===bd.maxby&&(cy&1)))) || (bd.shape===1 && (by===bd.maxby&&!(cy&1)))){ redx=1; redw=1;}
			else if((bd.shape===1 && (by===bd.minby||(by===bd.maxby&&(cy&1)))) || (bd.shape===2 && (by===bd.maxby&&!(cy&1)))){ redx=0; redw=1;}
			g.vid = "bdx_"+by;
			g.fillRect((x1+redx)*this.bw-lm-0.5, by*this.bh-lm-0.5, (x2-x1-redw)*this.bw+1, lw);

			if(by<bd.maxby){
				var xs = xa;
				if((bd.shape===2 || bd.shape===3)!==((cy&1)!==(xs&1))){ xs++;}
				for(var bx=xs;bx<=xb;bx+=2){
					g.vid = ["bdy_",bx,by].join("_");
					g.fillRect(bx*this.bw-lm-0.5, by*this.bh-lm-0.5, lw, this.ch+1);
				}
			}
		}
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodeTawamurenga();
	},
	encodePzpr : function(type){
		this.encodeTawamurenga();
	},

	decodeTawamurenga : function(){
		var barray = this.outbstr.split("/"), bd = this.board;
		bd.setShape(+barray[0]);
		bd.initBoardSize(bd.cols, bd.rows);

		if(!!barray[1]){
			this.outbstr = barray[1];
			this.decodeNumber10();
		}
	},
	encodeTawamurenga : function(){
		this.outbstr = (this.board.shape+"/");
		this.encodeNumber10();
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		var bd = this.board;
		bd.setShape(+this.readLine());
		bd.initBoardSize(bd.cols, bd.rows);

		this.decodeCellQnumAns();
	},
	encodeData : function(){
		var bd = this.board;
		this.writeLine(bd.shape);

		this.encodeCellQnumAns();
	},

	// オーバーライド
	decodeCell : function(func){
		var bd = this.board, n=0, item = this.getItemList(bd.rows);
		for(var by=bd.minby+1;by<bd.maxby;by+=2){
			for(var bx=0;bx<=bd.maxbx;bx++){
				var cell=bd.getc(bx,by);
				if(!cell.isnull){ func(cell, item[n++]);}
			}
		}
	},
	encodeCell : function(func){
		var bd = this.board;
		for(var by=bd.minby+1;by<bd.maxby;by+=2){
			var data = '';
			for(var bx=0;bx<=bd.maxbx;bx++){
				var cell=bd.getc(bx,by);
				if(!cell.isnull){ data += func(cell);}
			}
			this.writeLine(data);
		}
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checklist : [
		"checkShadeCellExist",
		"checkThreeShadeCells",
		"checkUnderCells",
		"checkNumbers"
	],

	checkThreeShadeCells : function(){
		var bd = this.board, CellList = this.klass.CellList;
		for(var by=bd.minby+1;by<bd.maxby;by+=2){
			var clist = new CellList();
			for(var bx=0;bx<=bd.maxbx;bx++){
				var cell = bd.getc(bx,by);
				if(cell.isnull){ continue;}
				else if(cell.isUnshade() || cell.isNum()){
					if(clist.length>=3){ break;}
					clist=new CellList();
				}
				else{ clist.add(cell);}
			}
			if(clist.length<3){ continue;}

			this.failcode.add("csConsecGt3");
			if(this.checkOnly){ break;}
			clist.seterr(1);
		}
	},
	checkNumbers : function(){
		var bd = this.board;
		for(var c=0;c<bd.cell.length;c++){
			var cell = bd.cell[c];
			if(!cell.isValidNum()){ continue;}
			var clist = new this.klass.CellList();
			clist.add(cell.relcell(-1,-2));
			clist.add(cell.relcell( 1,-2));
			clist.add(cell.relcell(-2, 0));
			clist.add(cell.relcell( 2, 0));
			clist.add(cell.relcell(-1, 2));
			clist.add(cell.relcell( 1, 2));
			if(cell.qnum===clist.filter(function(cell){ return cell.isShade();}).length){ continue;}

			this.failcode.add("nmShadeNe");
			if(this.checkOnly){ break;}
			cell.seterr(1);
			clist.seterr(1);
		}
	},
	checkUnderCells : function(){
		var bd = this.board;
		for(var c=0;c<bd.cell.length;c++){
			var cell = bd.cell[c];
			if(cell.isUnshade() || cell.by===bd.maxby-1){ continue;}

			if(cell.relcell(-1,2).isShade() || cell.relcell(1,2).isShade()){ continue;}

			this.failcode.add("csNotOnShade");
			if(this.checkOnly){ break;}
			cell.seterr(1);
		}
	}
},

FailCode:{
	nmShadeNe    : ["数字の周りに入っている黒マスの数が違います。","The number of shaded cells around a number is not correct."],
	csConsecGt3  : ["黒マスが横に3マス以上続いています。","There or more shaded cells continue horizonally."],
	csNotOnShade : ["黒マスの下に黒マスがありません。","There are no shaded cells under a shaded cell."]
}
}));
