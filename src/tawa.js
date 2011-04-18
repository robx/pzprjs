//
// パズル固有スクリプト部 たわむれんが版 tawa.js v3.4.0
//
pzprv3.custom.tawa = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mousedown : function(){
		if     (k.editmode){ this.inputqnum();}
		else if(k.playmode){ this.inputcell();}
	},
	mousemove : function(){
		if(k.playmode){ this.inputcell();}
	},

	// マウス入力時のセルID取得系
	cellid : function(){
		var pos = this.borderpos(0);
		if(this.inputY%pc.ch==0){ return null;} // 縦方向だけ、ぴったりは無効
		if(!bd.isinside(pos.x,pos.y)){ return null;}

		var cand = bd.cnum(pos.x, pos.y);
		cand = (cand!==null?cand:bd.cnum(pos.x+1, pos.y));
		return cand;
	},
	borderpos : function(rc){
		return new pzprv3.core.Address((this.inputPoint.x/pc.bw)|0, ((this.inputPoint.y/pc.ch)|0)*2+1);
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true
},

KeyPopup:{
	enablemake : true,
	generate : function(mode,type){
		this.inputcol('num','knum0','0','0');
		this.inputcol('num','knum1','1','1');
		this.inputcol('num','knum2','2','2');
		this.insertrow();
		this.inputcol('num','knum3','3','3');
		this.inputcol('num','knum4','4','4');
		this.inputcol('num','knum5','5','5');
		this.insertrow();
		this.inputcol('num','knum6','6','6');
		this.inputcol('num','knum.','-','?');
		this.inputcol('num','knum_',' ',' ');
		this.insertrow();
	}
},

TargetCursor:{
	// キー移動範囲のminx,maxx,miny,maxy設定関数オーバーライド
	adjust_init : function(){
		if(bd.cnum(this.pos.x,this.pos.y)===null){
			this.pos.x++;
		}
	},
	getTCC : function(){ return bd.cnum(this.pos.x, this.pos.y);},
	setTCC : function(id){
		if(id<0 || bd.cellmax<=id){ return;}
		this.pos = new pzprv3.core.Address(bd.cell[id].bx, bd.cell[id].by);
	},
	incTCY : function(mv){
		this.pos.y+=mv;
		if(this.pos.x===this.minx || (this.pos.x<this.maxx && (this.pos.y&2)===2)){ this.pos.x++;}
		else{ this.pos.x--;}
	},
	decTCY : function(mv){
		this.pos.y-=mv;
		if(this.pos.x===this.maxx || (this.pos.x>this.minx && (this.pos.y&2)===0)){ this.pos.x--;}
		else{ this.pos.x++;}
	}
},

//---------------------------------------------------------
// 盤面管理系
Board:{
	qcols : 6,	// ※本スクリプトでは一番上の段のマスの数を表すこととする.
	qrows : 7,
	lap   : 3,	// 2段目は => 0:左右引っ込み 1:右のみ出っ張り 2:左のみ出っ張り 3:左右出っ張り

	setLap : function(val){
		this.lap=val;
		this.setminmax();
	},

	numzero : true,

	numberIsWhite : true,

	maxnum : 6,

	estimateSize : function(type, col, row){
		var total = 0;
		if     (this.lap==0){ total = (row>>1)*(2*col-1)+((row%2==1)?col:0);}
		else if(this.lap==3 || this.lap==undefined){ total = (row>>1)*(2*col+1)+((row%2==1)?col:0);}
		else{ total = col*row;}

		return total;
	},
	setposCells : function(){
		this.cellmax = this.cell.length;
		for(var id=0;id<this.cellmax;id++){
			var obj = this.cell[id];
			if(this.lap==0){
				var row = (((2*id)/(2*this.qcols-1))|0);
				obj.bx = (((2*id)%(2*this.qcols-1))|0)+1;
				obj.by = row*2+1;
			}
			else if(this.lap==1){
				var row = ((id/this.qcols)|0);
				obj.bx = ((id%this.qcols)|0)*2+(!!(row&1)?1:0)+1;
				obj.by = row*2+1;
			}
			else if(this.lap==2){
				var row = ((id/this.qcols)|0);
				obj.bx = ((id%this.qcols)|0)*2+(!(row&1)?1:0)+1;
				obj.by = row*2+1;
			}
			else if(this.lap==3){
				var row = (((2*id+1)/(2*this.qcols+1))|0);
				obj.bx = (((2*id+1)%(2*this.qcols+1))|0)+1;
				obj.by = row*2+1;
			}
		}
	},
	setminmax : function(){
		this.minbx = 0;
		this.minby = 0;
		this.maxbx = 2*this.qcols + [0,1,1,2][this.lap];
		this.maxby = 2*this.qrows;

		tc.setminmax();
	},

	cnum : function(bx,by,qc,qr){
		if(qc===(void 0)){ qc=this.qcols; qr=this.qrows;}
		if(bx<this.minbx+1 || bx>this.maxbx-1 || by<this.minby+1 || by>this.maxby-1){ return null;}

		var cy = (by>>1);	// 上から数えて何段目か(0～bd.qrows-1)
		if     (this.lap===0){ if(!!((bx+cy)&1)){ return ((bx-1)+cy*(2*qc-1))>>1;}}
		else if(this.lap===1){ if(!!((bx+cy)&1)){ return ((bx-1)+cy*(2*qc  ))>>1;}}
		else if(this.lap===2){ if( !((bx+cy)&1)){ return ((bx-1)+cy*(2*qc  ))>>1;}}
		else if(this.lap===3){ if( !((bx+cy)&1)){ return ((bx-1)+cy*(2*qc+1))>>1;}}

		return null;
	},
	cellinside : function(x1,y1,x2,y2){
		var clist = [];
		for(var by=(y1|1);by<=y2;by+=2){ for(var bx=x1;bx<=x2;bx++){
			var c = this.cnum(bx,by);
			if(c!==null){ clist.push(c);}
		}}
		return clist;
	}
},

MenuExec:{
	expandreduce : function(key,d){
		if(key & this.EXPAND){
			switch(key & 0x0F){
				case k.LT: bd.qcols+=[0,0,1,1][bd.lap];  bd.lap=[2,3,0,1][bd.lap]; break;
				case k.RT: bd.qcols+=[0,1,0,1][bd.lap];  bd.lap=[1,0,3,2][bd.lap]; break;
				case k.UP: bd.qcols+=[-1,0,0,1][bd.lap]; bd.lap=[3,2,1,0][bd.lap]; bd.qrows++; break;
				case k.DN: bd.qrows++; break;
			}
			bd.setminmax();

			this.expandGroup(k.CELL,key);
		}
		else if(key & this.REDUCE){
			this.reduceGroup(k.CELL,key);

			switch(key & 0x0F){
				case k.LT: bd.qcols-=[1,1,0,0][bd.lap];  bd.lap=[2,3,0,1][bd.lap]; break;
				case k.RT: bd.qcols-=[1,0,1,0][bd.lap];  bd.lap=[1,0,3,2][bd.lap]; break;
				case k.UP: bd.qcols-=[1,0,0,-1][bd.lap]; bd.lap=[3,2,1,0][bd.lap]; bd.qrows--; break;
				case k.DN: bd.qrows--; break;
			}
		}
		bd.setposAll();
	},

	turnflip : function(key,d){
		var d = {x1:bd.minbx, y1:bd.minby, x2:bd.maxbx, y2:bd.maxby};

		if     (key===this.FLIPY){ if(!(bd.qrows&1)){ bd.lap = {0:3,1:2,2:1,3:0}[bd.lap];} }
		else if(key===this.FLIPX){ bd.lap = {0:0,1:2,2:1,3:3}[bd.lap];}

		this.turnflipGroup(k.CELL, key, d);

		bd.setposAll();
	},
	distObj : function(type,id,key){
		var obj = bd.cell[id];
		key &= 0x0F;
		if     (key===k.UP){ return obj.by;}
		else if(key===k.DN){ return bd.maxby-obj.by;}
		else if(key===k.LT){ return obj.bx;}
		else if(key===k.RT){ return bd.maxbx-obj.bx;}
		return -1;
	},

	// 新規作成で選ぶ時に用いる関数・変数など
	clap : 3,
	clicklap : function(e){
		this.selectlap(ee.getSrcElement(e).id.charAt(2));
	},
	selectlap : function(num){
		ee("nb"+this.clap).parent.style.backgroundColor = '';
		ee("nb"+num).parent.style.backgroundColor = 'red';
		this.clap = num;
	},

	newboard_show : function(){		// "新規盤面作成"を表示するとき
		menu.pop = ee("pop1_1");
		this.selectlap([0,2,3,1][bd.lap]);
		_doc.newboard.col.value = (bd.qcols+(bd.lap==3?1:0));
		_doc.newboard.row.value = bd.qrows;
		kc.enableKey = false;
	},
	newboard : function(e){			// "新規盤面作成"ボタンが押されたとき
		if(menu.pop){
			var col = ((parseInt(_doc.newboard.col.value))|0);
			var row = ((parseInt(_doc.newboard.row.value))|0);
			var slap = [0,3,1,2][this.clap];

			if(!!col && !!row && !isNaN(slap) && !(col==1 && (slap==0||slap==3))){
				if(slap==3){ col--;}

				this.newboard_open('/'+col+'/'+row+'/'+slap);
			}
			menu.popclose();
		}
	}
},

Menu:{
	menufix : function(){
		this.addUseToFlags();
		this.addLabels(ee('pop1_1_cap1x').el, "横幅 (黄色の数)", "Width (Yellows)");
		this.addLabels(ee('pop1_1_cap2x').el, "高さ",            "Height");
	},

	menuinit : function(){
		this.newboard_html_original = _doc.newboard.innerHTML;

		_doc.newboard.innerHTML =
			["<span id=\"pop1_1_cap0\">盤面を新規作成します。</span><br>\n",
			 "<input type=\"number\" name=\"col\" value=\"\" size=\"4\" maxlength=\"3\" min=\"1\" max=\"999\" /> <span id=\"pop1_1_cap1x\">横幅 (黄色の数)</span><br>\n",
			 "<input type=\"number\" name=\"row\" value=\"\" size=\"4\" maxlength=\"3\" min=\"1\" max=\"999\" /> <span id=\"pop1_1_cap2x\">高さ</span><br>\n",
			 "<table border=\"0\" cellpadding=\"0\" cellspacing=\"2\" style=\"margin-top:4pt;margin-bottom:4pt;\">",
			 "<tr id=\"laps\" style=\"padding-bottom:2px;\">\n",
			 "<td><div><img id=\"nb0\" src=\"src/img/tawa_nb.gif\"></div></td>\n",
			 "<td><div><img id=\"nb1\" src=\"src/img/tawa_nb.gif\"></div></td>\n",
			 "<td><div><img id=\"nb2\" src=\"src/img/tawa_nb.gif\"></div></td>\n",
			 "<td><div><img id=\"nb3\" src=\"src/img/tawa_nb.gif\"></div></td>\n",
			 "</tr></table>\n",
			 "<input type=\"button\" name=\"newboard\" value=\"新規作成\" /><input type=\"button\" name=\"cancel\" value=\"キャンセル\" />\n"
			].join('');

		/* sc8.cssにも定義があります */
		for(var i=0;i<=3;i++){
			var _img = ee('nb'+i).el;
			_img.style.left = "-"+(i*32)+"px";
			_img.style.clip = "rect(0px,"+((i+1)*32)+"px,"+32+"px,"+(i*32)+"px)";
			ee.addEvent(_img, "click", ee.ebinder(menu.ex, menu.ex.clicklap));
			_img.parentNode.style.display = 'block';
		}

		this.SuperFunc.menuinit.call(this);

		_doc.flip.turnl.disabled = true;
		_doc.flip.turnr.disabled = true;
	},
	menureset : function(){
		_doc.newboard.innerHTML  = this.newboard_html_original;

		_doc.flip.turnl.disabled = false;
		_doc.flip.turnr.disabled = false;

		this.SuperFunc.menureset.call(this);
	}
},
Properties:{
	initialize : function(){
		this.SuperFunc.initialize.call(this);
		this.funcs.newboard = function(){ menu.ex.newboard_show();};
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	setColors : function(){
		this.setBGCellColorFunc('qans1');
	},
	paint : function(){
		this.drawBGCells();
		this.drawDotCells(false);
		this.drawGrid_tawa();

		this.drawNumbers();

		this.drawTarget();
	},
	flushCanvas : function(){
		this.flushCanvas = ((g.use.canvas) ?
			function(){
				if(x1<=bd.minbx && y1<=bd.minby && x2>=bd.maxbx && y2>=bd.maxby){
					this.flushCanvasAll();
				}
				else{
					g.fillStyle = "rgb(255, 255, 255)";
					g.fillRect(x1*this.bw, y1*this.ch, (x2-x1+1)*this.bw, (y2-y1+1)*this.ch);
				}
			}
		:
			function(){ this.zidx=1;}
		);
		this.flushCanvas();
	},

	drawGrid_tawa : function(){
		this.vinc('grid', 'crispEdges');

		var x1=this.range.x1, y1=this.range.y1, x2=this.range.x2, y2=this.range.y2;
		if(x1<bd.minbx){ x1=bd.minbx;} if(x2>bd.maxbx){ x2=bd.maxbx;}
		if(y1<bd.minby){ y1=bd.minby;} if(y2>bd.maxby){ y2=bd.maxby;}

		var lw = Math.max(this.cw/36, 1);
		var lm = (lw-1)/2;
		var headers = ["bdx_", "bdy"];

		g.fillStyle = this.gridcolor;
		var xa = Math.max(x1,bd.minbx), xb = Math.min(x2,bd.maxbx);
		var ya = Math.max(y1,bd.minby), yb = Math.min(y2,bd.maxby);
		ya-=(ya&1);
		for(var by=ya;by<=yb;by+=2){
			var cy = (by>>1);
			if(this.vnop(headers[0]+by,this.NONE)){
				var redx = 0, redw = 0;
				if     ((bd.lap===3 && (by===bd.minby||(by===bd.maxby&&(cy&1)))) || (bd.lap===0 && (by===bd.maxby&&!(cy&1)))){ redx=1; redw=2;}
				else if((bd.lap===2 && (by===bd.minby||(by===bd.maxby&&(cy&1)))) || (bd.lap===1 && (by===bd.maxby&&!(cy&1)))){ redx=1; redw=1;}
				else if((bd.lap===1 && (by===bd.minby||(by===bd.maxby&&(cy&1)))) || (bd.lap===2 && (by===bd.maxby&&!(cy&1)))){ redx=0; redw=1;}
				g.fillRect((x1+redx)*this.bw-lm, by*this.bh-lm, (x2-x1-redw)*this.bw+1, lw);
			}
			if(by>=bd.maxby){ break;}

			var xs = xa;
			if((bd.lap===2 || bd.lap===3) ^ ((cy&1)!==(xs&1))){ xs++;}
			for(var bx=xs;bx<=xb;bx+=2){
				if(this.vnop([headers[1],bx,by].join("_"),this.NONE)){
					g.fillRect(bx*this.bw-lm, by*this.bh-lm, lw, this.ch+1);
				}
			}
		}
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		this.decodeTawamurenga();
	},
	pzlexport : function(type){
		this.encodeTawamurenga();
	},

	decodeTawamurenga : function(){
		var barray = this.outbstr.split("/");

		bd.setLap(parseInt(barray[0]));
		bd.initBoardSize(base.dec.cols, base.dec.rows);

		this.outbstr = barray[1];
		this.decodeNumber10();
	},
	encodeTawamurenga : function(){
		this.outbstr = (bd.lap+"/");
		this.encodeNumber10();
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		bd.setLap(parseInt(this.readLine()));
		var n=0, item = this.getItemList(bd.qrows);
		for(var by=bd.minby+1;by<bd.maxby;by+=2){
			for(var bx=0;bx<=bd.maxbx;bx++){
				var cc=bd.cnum(bx,by);
				if(cc===null){ continue;}
				var obj = bd.cell[cc];
				if     (item[n]==="#"){ obj.qans = 1;}
				else if(item[n]==="+"){ obj.qsub = 1;}
				else if(item[n]==="-"){ obj.qnum =-2;}
				else if(item[n]!=="."){ obj.qnum = parseInt(item[n]);}
				n++;
			}
		}
	},
	encodeData : function(){
		this.datastr = bd.lap+"/";

		var bstr = "";
		for(var by=bd.minby+1;by<bd.maxby;by+=2){
			for(var bx=0;bx<=bd.maxbx;bx++){
				var cc=bd.cnum(bx,by);
				if(cc===null){ continue;}
				var obj = bd.cell[cc];
				if     (obj.qnum===-2){ bstr += "- ";}
				else if(obj.qnum!==-1){ bstr += (""+obj.qnum+" ");}
				else if(obj.qans=== 1){ bstr += "# ";}
				else if(obj.qsub=== 1){ bstr += "+ ";}
				else{ bstr += ". ";}
			}
			bstr += "/";
		}
		this.datastr += bstr;
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.checkThreeBlackCells() ){
			this.setAlert('黒マスが横に3マス以上続いています。','Three or more black cells continue horizonally.'); return false;
		}

		if( !this.checkUnderCells() ){
			this.setAlert('黒マスの下に黒マスがありません。','There are no black cells under a black cell..'); return false;
		}

		if( !this.checkNumbers() ){
			this.setAlert('数字の周りに入っている黒マスの数が違います。','The number of black cells around a number is not correct.'); return false;
		}

		return true;
	},

	checkThreeBlackCells : function(){
		var result = true;
		for(var by=bd.minby+1;by<bd.maxby;by+=2){
			var clist = [];
			for(var bx=0;bx<=bd.maxbx;bx++){
				var cc = bd.cnum(bx,by);
				if(cc===null){ continue;}
				else if(bd.isWhite(cc) || bd.isNum(cc)){
					if(clist.length>=3){ break;}
					clist=[];
				}
				else{ clist.push(cc);}
			}
			if(clist.length>=3){
				if(this.inAutoCheck){ return false;}
				bd.sErC(clist,1);
				result = false;
			}
		}
		return result;
	},
	checkNumbers : function(){
		var result = true;
		for(var c=0;c<bd.cellmax;c++){
			if(!bd.isValidNum(c)){ continue;}
			var clist = [];
			clist.push(bd.cnum(bd.cell[c].bx-1,bd.cell[c].by-2));
			clist.push(bd.cnum(bd.cell[c].bx+1,bd.cell[c].by-2));
			clist.push(bd.cnum(bd.cell[c].bx-2,bd.cell[c].by  ));
			clist.push(bd.cnum(bd.cell[c].bx+2,bd.cell[c].by  ));
			clist.push(bd.cnum(bd.cell[c].bx-1,bd.cell[c].by+2));
			clist.push(bd.cnum(bd.cell[c].bx+1,bd.cell[c].by+2));

			var cnt=0;
			for(var i=0;i<clist.length;i++){ if(bd.isBlack(clist[i])){ cnt++;} }

			if(bd.QnC(c)!=cnt){
				if(this.inAutoCheck){ return false;}
				bd.sErC([c],1);
				bd.sErC(clist,1);
				result = false;
			}
		}
		return result;
	},
	checkUnderCells : function(){
		var result = true;
		for(var c=0;c<bd.cellmax;c++){
			if(bd.isWhite(c) || bd.cell[c].by===bd.maxby-1){ continue;}

			if(bd.isWhite(bd.cnum(bd.cell[c].bx-1,bd.cell[c].by+2)) &&
			   bd.isWhite(bd.cnum(bd.cell[c].bx+1,bd.cell[c].by+2)))
			{
				if(this.inAutoCheck){ return false;}
				bd.sErC([c],1);
				bd.sErC([bd.cnum(bd.cell[c].bx-1,bd.cell[c].by+2)],1);
				bd.sErC([bd.cnum(bd.cell[c].bx+1,bd.cell[c].by+2)],1);
				result = false;
			}
		}
		return result;
	}
}
};
