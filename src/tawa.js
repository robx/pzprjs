//
// パズル固有スクリプト部 たわむれんが版 tawa.js v3.3.1
//
Puzzles.tawa = function(){ };
Puzzles.tawa.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 6;}	// 盤面の横幅 本スクリプトでは一番上の段のマスの数を表すこととする.
		if(!k.qrows){ k.qrows = 7;}	// 盤面の縦幅
		k.irowake  = 0;		// 0:色分け設定無し 1:色分けしない 2:色分けする

		k.iscross  = 0;		// 1:盤面内側のCrossがあるパズル 2:外枠上を含めてCrossがあるパズル
		k.isborder = 0;		// 1:Border/Lineが操作可能なパズル 2:外枠上も操作可能なパズル
		k.isexcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

		k.isLineCross     = false;	// 線が交差するパズル
		k.isCenterLine    = false;	// マスの真ん中を通る線を回答として入力するパズル
		k.isborderAsLine  = false;	// 境界線をlineとして扱う
		k.hasroom         = false;	// いくつかの領域に分かれている/分けるパズル
		k.roomNumber      = false;	// 部屋の問題の数字が1つだけ入るパズル

		k.dispzero        = true;	// 0を表示するかどうか
		k.isDispHatena    = true;	// qnumが-2のときに？を表示する
		k.isAnsNumber     = false;	// 回答に数字を入力するパズル
		k.NumberWithMB    = false;	// 回答の数字と○×が入るパズル
		k.linkNumber      = false;	// 数字がひとつながりになるパズル

		k.BlackCell       = true;	// 黒マスを入力するパズル
		k.NumberIsWhite   = true;	// 数字のあるマスが黒マスにならないパズル
		k.RBBlackCell     = false;	// 連黒分断禁のパズル
		k.checkBlackCell  = false;	// 正答判定で黒マスの情報をチェックするパズル
		k.checkWhiteCell  = false;	// 正答判定で白マスの情報をチェックするパズル

		k.ispzprv3ONLY    = true;	// ぱずぷれアプレットには存在しないパズル
		k.isKanpenExist   = false;	// pencilbox/カンペンにあるパズル

		base.setTitle("たわむれんが","Tawamurenga");
		base.setExpression("　左クリックで黒マスが、右クリックで白マス確定マスが入力できます。",
						   " Left Click to input black cells, Right Click to input determined white cells.");
		base.setFloatbgcolor("rgb(64, 64, 64)");
		base.proto = 1;
	},
	menufix : function(){
		menu.addUseToFlags();
		menu.addLabels(ee('pop1_1_cap1x').el, "横幅 (黄色の数)", "Width (Yellows)");
		menu.addLabels(ee('pop1_1_cap2x').el, "高さ",            "Height");
	},
	finalfix : function(){
		bd.setposAll();
	},

	protoChange : function(){
		this.protofunc = {
			estsize : Board.prototype.estimateSize,
			spcells : Board.prototype.setposCells
		};

		Board.prototype.estimateSize = function(type, col, row){
			var total = 0;
			if     (this.lap==0){ total = (row>>1)*(2*col-1)+((row%2==1)?col:0);}
			else if(this.lap==3 || this.lap==undefined){ total = (row>>1)*(2*col+1)+((row%2==1)?col:0);}
			else{ total = col*row;}

			return total;
		};

		// 各セルの位置変数設定関数
		Board.prototype.setposCells = function(){
			this.cellmax = this.cell.length;
			for(var id=0;id<this.cellmax;id++){
				var obj = this.cell[id];
				if(this.lap==0){
					var row = (((2*id)/(2*k.qcols-1))|0);
					obj.bx = (((2*id)%(2*k.qcols-1))|0)+1;
					obj.by = row*2+1;
				}
				else if(this.lap==1){
					var row = ((id/k.qcols)|0);
					obj.bx = ((id%k.qcols)|0)*2+(!!(row&1)?1:0)+1;
					obj.by = row*2+1;
				}
				else if(this.lap==2){
					var row = ((id/k.qcols)|0);
					obj.bx = ((id%k.qcols)|0)*2+(!(row&1)?1:0)+1;
					obj.by = row*2+1;
				}
				else if(this.lap==3){
					var row = (((2*id+1)/(2*k.qcols+1))|0);
					obj.bx = (((2*id+1)%(2*k.qcols+1))|0)+1;
					obj.by = row*2+1;
				}
			}
		};

		this.newboard_html_original = _doc.newboard.innerHTML;
	},
	protoOriginal : function(){
		Board.prototype.estimateSize = this.protofunc.estsize;
		Board.prototype.setposCells  = this.protofunc.spcells;
		_doc.newboard.innerHTML  = this.newboard_html_original;

		_doc.flip.turnl.disabled = false;
		_doc.flip.turnr.disabled = false;
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(k.editmode){
				if(!kp.enabled()){ this.inputqnum();}
				else{ kp.display();}
			}
			else if(k.playmode) this.inputcell();
		};
		mv.mouseup = function(){ };
		mv.mousemove = function(){
			if(k.playmode) this.inputcell();
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(k.playmode){ return;}
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum(ca);
		};

		kp.kpgenerate = function(mode){
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
		};

		if(k.EDITOR){
			kp.generate(kp.ORIGINAL, true, false, kp.kpgenerate);
			kp.kpinput = function(ca){
				kc.key_inputqnum(ca);
			};
		}

		this.input_init_menu();
		this.input_init_board();
		this.input_init_menuex();

		bd.maxnum = 6;
	},

	input_init_menu : function(){	// 処理が大きくなったので分割(input_init()から呼ばれる)
		menu.ex.clap = 3;	// bd.lapの初期値(新規作成で選ぶ時用)

		pp.funcs.newboard = function(){
			menu.pop = ee("pop1_1");
			pp.funcs.setimg({0:0,1:2,2:3,3:1}[bd.lap]);
			_doc.newboard.col.value = (k.qcols+(bd.lap==3?1:0));
			_doc.newboard.row.value = k.qrows;
			kc.enableKey = false;
		};
		pp.funcs.clickimg = function(e){
			pp.funcs.setimg(ee.getSrcElement(e).id.charAt(2));
		};
		pp.funcs.setimg = function(num){
			ee("nb"+menu.ex.clap).parent.style.backgroundColor = '';
			ee("nb"+num).parent.style.backgroundColor = 'red';
			menu.ex.clap = num;
		};

		_doc.newboard.innerHTML =
			["<span id=\"pop1_1_cap0\">盤面を新規作成します。</span><br>\n",
			 "<input type=\"number\" name=\"col\" value=\"\" size=\"4\" maxlength=\"3\" min=\"1\" max=\"999\" /> <span id=\"pop1_1_cap1x\">横幅 (黄色の数)</span><br>\n",
			 "<input type=\"number\" name=\"row\" value=\"\" size=\"4\" maxlength=\"3\" min=\"1\" max=\"999\" /> <span id=\"pop1_1_cap2x\">高さ</span><br>\n",
			 "<table border=\"0\" cellpadding=\"0\" cellspacing=\"2\" style=\"margin-top:4pt;margin-bottom:4pt;\">",
			 "<tr id=\"laps\" style=\"padding-bottom:2px;\">\n",
			 "</tr></table>\n",
			 "<input type=\"button\" name=\"newboard\" value=\"新規作成\" /><input type=\"button\" name=\"cancel\" value=\"キャンセル\" />\n"
			].join('');

		var cw=32, bw=2;

		var img_attr  = {className    : 'clickimg',
						 src          : './src/img/tawa_nb.gif',
						 unselectable : 'on'};
		var img_style = {position : 'absolute', margin   : ""+bw+"px"};
		var EL_NBIMG = ee.addTemplate('','img', img_attr, img_style, {click: ee.ebinder(pp, pp.funcs.clickimg)});

		var div_style = {position : 'relative',
						 display  : 'block',
						 width    : ""+(cw+bw*2)+"px",
						 height   : ""+(cw+bw*2)+"px" };
		var EL_NBDIV = ee.addTemplate('','div', null, div_style, null);

		for(var i=0;i<=3;i++){
			var _img = ee.createEL(EL_NBIMG, 'nb'+i);
			_img.style.left  = "-"+(i*cw)+"px";
			_img.style.clip  = "rect(0px,"+((i+1)*cw)+"px,"+cw+"px,"+(i*cw)+"px)";

			var _div = ee.createEL(EL_NBDIV,'');
			_div.appendChild(_img);

			var _td = _doc.createElement('td');
			_td.appendChild(_div);
			ee('laps').appendEL(_td);
		}
	},
	input_init_board : function(){	// 処理が大きくなったので分割(input_init()から呼ばれる)

		// キー移動範囲のminx,maxx,miny,maxy設定関数オーバーライド
		tc.getTCC = function(){ return bd.cnum(this.cursorx, this.cursory);};
		tc.setTCC = function(id){
			if(id<0 || bd.cellmax<=id){ return;}
			this.cursorx = bd.cell[id].bx;
			this.cursory = bd.cell[id].by;
		};
		tc.incTCY = function(mv){
			this.cursory+=mv;
			if(this.cursorx==this.minx || (this.cursorx<this.maxx && (this.cursory>>1)%2==1)){ this.cursorx++;}
			else{ this.cursorx--;}
		};
		tc.decTCY = function(mv){
			this.cursory-=mv;
			if(this.cursorx==this.maxx || (this.cursorx>this.minx && (this.cursory>>1)%2==0)){ this.cursorx--;}
			else{ this.cursorx++;}
		};

		// 盤面の範囲を設定する
		bd.setminmax = function(){
			this.minbx = 0;
			this.minby = 0;
			this.maxbx = 2*k.qcols + [0,1,1,2][bd.lap];
			this.maxby = 2*k.qrows;

			tc.adjust();
		};
		tc.adjust = function(){
			this.minx = 1;
			this.miny = 1;
			this.maxx = 2*k.qcols-1 + [0,1,1,2][bd.lap];
			this.maxy = 2*k.qrows-1;

			if(bd.cnum(this.cursorx,this.cursory)===null){
				this.cursorx++;
			}
		};

		// PositionからのセルID取得
		bd.cnum = function(bx,by,qc,qr){
			if(qc===(void 0)){ qc=k.qcols; qr=k.qrows;}
			if(bx<this.minbx+1 || bx>this.maxbx-1 || by<this.minby+1 || by>this.maxby-1){ return null;}

			var cy = (by>>1);	// 上から数えて何段目か(0〜k.qrows-1)
			if     (this.lap===0){ if(!!((bx+cy)&1)){ return ((bx-1)+cy*(2*qc-1))>>1;}}
			else if(this.lap===1){ if(!!((bx+cy)&1)){ return ((bx-1)+cy*(2*qc  ))>>1;}}
			else if(this.lap===2){ if( !((bx+cy)&1)){ return ((bx-1)+cy*(2*qc  ))>>1;}}
			else if(this.lap===3){ if( !((bx+cy)&1)){ return ((bx-1)+cy*(2*qc+1))>>1;}}

			return null;
		};
		bd.cellinside = function(x1,y1,x2,y2){
			var clist = [];
			for(var by=(y1|1);by<=y2;by+=2){ for(var bx=x1;bx<=x2;bx++){
				var c = this.cnum(bx,by);
				if(c!==null){ clist.push(c);}
			}}
			return clist;
		};

		bd.lap = menu.ex.clap;	// 2段目は => 0:左右引っ込み 1:右のみ出っ張り 2:左のみ出っ張り 3:左右出っ張り
		bd.setLap = function(val){ this.lap=val; this.setminmax();};
		bd.setLap(bd.lap);
		bd.setposAll();
		tc.cursorx = 2; tc.cursory = 1;

		// マウス入力時のセルID取得系
		mv.cellid = function(){
			var pos = this.borderpos(0);
			if(this.inputY%k.cheight==0){ return null;} // 縦方向だけ、ぴったりは無効
			if(!bd.isinside(pos.x,pos.y)){ return null;}

			var cand = bd.cnum(pos.x, pos.y);
			cand = (cand!==null?cand:bd.cnum(pos.x+1, pos.y));
			return cand;
		};
		mv.borderpos = function(rc){
			return new Pos((this.inputPos.x/k.bwidth)|0, ((this.inputPos.y/k.cheight)|0)*2+1);
		};
	},
	input_init_menuex : function(){	// 処理が大きくなったので分割(input_init()から呼ばれる)

		menu.ex.newboard = function(e){
			if(menu.pop){
				var col = ((parseInt(_doc.newboard.col.value))|0);
				var row = ((parseInt(_doc.newboard.row.value))|0);
				var slap = {0:0,1:3,2:1,3:2}[this.clap];

				if(col==1 && (slap==0||slap==3)){ menu.popclose(); return;}
				if(slap==3){ col--;}

				if(col>0 && row>0){
					bd.setLap(slap);
					bd.initBoardSize(col,row);
				}

				menu.popclose();

				base.resetInfo(true);
				base.resize_canvas();				// Canvasを更新する
			}
		};

		// 盤面の拡大・縮小
		menu.ex.expandreduce = function(key,d){
			if(key & this.EXPAND){
				// 調節用
				var margin = 0;
				switch(key & 0x0F){
				case k.LT:
					k.qcols += {0:0,1:0,2:1,3:1}[bd.lap];
					bd.lap   = {0:2,1:3,2:0,3:1}[bd.lap];
					break;

				case k.RT:
					k.qcols += {0:0,1:1,2:0,3:1}[bd.lap];
					bd.lap   = {0:1,1:0,2:3,3:2}[bd.lap];
					break;

				case k.UP:
					k.qrows++;
					k.qcols += {0:-1,1:0,2:0,3:1}[bd.lap];
					bd.lap   = {0:3,1:2,2:1,3:0}[bd.lap];
					break;

				case k.DN:
					k.qrows++;
					break;
				}
				bd.setminmax();

				// 本体。
				this.expandGroup(k.CELL, key);
			}
			else if(key & this.REDUCE){
				// 本体。
				this.reduceGroup(k.CELL, key);

				// 調節用
				switch(key & 0x0F){
				case k.LT:
					k.qcols -= {0:1,1:1,2:0,3:0}[bd.lap];
					bd.lap   = {0:2,1:3,2:0,3:1}[bd.lap];
					break;

				case k.RT:
					k.qcols -= {0:1,1:0,2:1,3:0}[bd.lap];
					bd.lap   = {0:1,1:0,2:3,3:2}[bd.lap];
					break;

				case k.UP:
					k.qrows--;
					k.qcols += {0:-1,1:0,2:0,3:1}[bd.lap];
					bd.lap   = {0:3,1:2,2:1,3:0}[bd.lap];
					break;

				case k.DN:
					k.qrows--;
					break;
				}
			}

			bd.setposAll();
		};
		// 回転・反転
		menu.ex.turnflip = function(key,d){
			var d = {x1:bd.minbx, y1:bd.minby, x2:bd.maxbx, y2:bd.maxby};

			if     (key===this.FLIPY){ if(!(k.qrows&1)){ bd.lap = {0:3,1:2,2:1,3:0}[bd.lap];} }
			else if(key===this.FLIPX){ bd.lap = {0:0,1:2,2:1,3:3}[bd.lap];}

			this.turnflipGroup(k.CELL, key, d);

			bd.setposAll();
		};
		menu.ex.distObj = function(type,id,key){
			var obj = bd.cell[id];
			key &= 0x0F;
			if     (key===k.UP){ return obj.by;}
			else if(key===k.DN){ return bd.maxby-obj.by;}
			else if(key===k.LT){ return obj.bx;}
			else if(key===k.RT){ return bd.maxbx-obj.bx;}
			return -1;
		};

		_doc.flip.turnl.disabled = true;
		_doc.flip.turnr.disabled = true;
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.setBGCellColorFunc('qans1');

		pc.paint = function(x1,y1,x2,y2){
			this.drawBGCells(x1,y1,x2,y2);
			this.drawRDotCells(x1,y1,x2,y2);
			this.drawGrid_tawa(x1,y1,x2+2,y2);

			this.drawNumbers(x1,y1,x2,y2);

			this.drawTarget(x1,y1,x2,y2);
		};
		// オーバーライド
		pc.prepaint = function(x1,y1,x2,y2){
			// pc.flushCanvasの代替
			if(g.use.canvas){
				if(x1<=bd.minbx && y1<=bd.minby && x2>=bd.maxbx && y2>=bd.maxby){
					this.flushCanvasAll();
				}
				else{
					g.fillStyle = "rgb(255, 255, 255)";
					g.fillRect(k.p0.x+x1*this.bw, k.p0.y+y1*this.ch, (x2-x1+1)*this.bw, (y2-y1+1)*this.ch);
				}
			}
			else{
				this.zidx=0;
			}

			pc.paint(x1,y1,x2,y2);
		};

		pc.drawGrid_tawa = function(x1,y1,x2,y2){
			this.vinc('grid', 'crispEdges');
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
					g.fillRect(k.p0.x+(x1+redx)*this.bw-lm, k.p0.y+by*this.bh-lm, (x2-x1-redw)*this.bw+1, lw);
				}
				if(by>=bd.maxby){ break;}

				var xs = xa;
				if((bd.lap===2 || bd.lap===3) ^ ((cy&1)!==(xs&1))){ xs++;}
				for(var bx=xs;bx<=xb;bx+=2){
					if(this.vnop([headers[1],bx,by].join("_"),this.NONE)){
						g.fillRect(k.p0.x+bx*this.bw-lm, k.p0.y+by*this.bh-lm, lw, this.ch+1);
					}
				}
			}
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decodeTawamurenga();
		};
		enc.pzlexport = function(type){
			this.encodeTawamurenga();
		};

		enc.decodeTawamurenga = function(){
			var barray = this.outbstr.split("/");

			bd.setLap(parseInt(barray[0]));
			bd.initBoardSize(this.uri.cols, this.uri.rows);

			this.outbstr = barray[1];
			this.decodeNumber10();
		};
		enc.encodeTawamurenga = function(){
			this.outbstr = (bd.lap+"/");
			this.encodeNumber10();
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			bd.setLap(parseInt(this.readLine()));
			var n=0, item = this.getItemList(k.qrows);
			for(var by=bd.minby+1;by<bd.maxby;by+=2){
				for(var bx=0;bx<=bd.maxbx;bx++){
					var cc=bd.cnum(bx,by);
					if(cc===null){ continue;}
					if     (item[n]=="#"){ bd.setBlack(cc);}
					else if(item[n]=="+"){ bd.sQsC(cc, 1);}
					else if(item[n]=="-"){ bd.sQnC(cc, -2);}
					else if(item[n]!="."){ bd.sQnC(cc, parseInt(item[n]));}
					n++;
				}
			}
		};
		fio.encodeData = function(){
			this.datastr = bd.lap+"/";

			var bstr = "";
			for(var by=bd.minby+1;by<bd.maxby;by+=2){
				for(var bx=0;bx<=bd.maxbx;bx++){
					var cc=bd.cnum(bx,by);
					if(cc===null){ continue;}
					if     (bd.QnC(cc)==-2){ bstr += "- ";}
					else if(bd.QnC(cc)!=-1){ bstr += (""+bd.QnC(cc).toString()+" ");}
					else if(bd.isBlack(cc)){ bstr += "# ";}
					else if(bd.QsC(cc)== 1){ bstr += "+ ";}
					else{ bstr += ". ";}
				}
				bstr += "/";
			}
			this.datastr += bstr;
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

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
		};

		ans.checkThreeBlackCells = function(){
			var result = true;
			for(var by=bd.minby+1;by<bd.maxby;by+=2){
				var clist = [];
				for(var bx=0;bx<=bd.maxbx;bx++){
					var cc = bd.cnum(bx,by);
					if(cc===null){ continue;}
					else if(bd.isWhite(cc) || bd.QnC(cc)!=-1){
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
		};
		ans.checkNumbers = function(){
			var result = true;
			for(var c=0;c<bd.cellmax;c++){
				if(bd.QnC(c)==-1||bd.QnC(c)==-2){ continue;}
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
		};
		ans.checkUnderCells = function(){
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
		};
	}
};
