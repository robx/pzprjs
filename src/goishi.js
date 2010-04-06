//
// パズル固有スクリプト部 碁石ひろい版 goishi.js v3.3.0
//
Puzzles.goishi = function(){ };
Puzzles.goishi.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}	// 盤面の横幅
		if(!k.qrows){ k.qrows = 10;}	// 盤面の縦幅
		k.irowake = 0;			// 0:色分け設定無し 1:色分けしない 2:色分けする

		k.iscross      = 0;		// 1:Crossが操作可能なパズル
		k.isborder     = 0;		// 1:Border/Lineが操作可能なパズル
		k.isextendcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

		k.isoutsidecross  = 0;	// 1:外枠上にCrossの配置があるパズル
		k.isoutsideborder = 0;	// 1:盤面の外枠上にborderのIDを用意する
		k.isLineCross     = 0;	// 1:線が交差するパズル
		k.isCenterLine    = 0;	// 1:マスの真ん中を通る線を回答として入力するパズル
		k.isborderAsLine  = 0;	// 1:境界線をlineとして扱う

		k.dispzero      = 0;	// 1:0を表示するかどうか
		k.isDispHatena  = 0;	// 1:qnumが-2のときに？を表示する
		k.isAnsNumber   = 1;	// 1:回答に数字を入力するパズル
		k.isArrowNumber = 0;	// 1:矢印つき数字を入力するパズル
		k.isOneNumber   = 0;	// 1:部屋の問題の数字が1つだけ入るパズル
		k.isDispNumUL   = 0;	// 1:数字をマス目の左上に表示するパズル(0はマスの中央)
		k.NumberWithMB  = 0;	// 1:回答の数字と○×が入るパズル

		k.BlackCell     = 0;	// 1:黒マスを入力するパズル
		k.NumberIsWhite = 0;	// 1:数字のあるマスが黒マスにならないパズル
		k.RBBlackCell   = 0;	// 1:連黒分断禁のパズル

		k.ispzprv3ONLY  = 1;	// 1:ぱずぷれv3にしかないパズル
		k.isKanpenExist = 1;	// 1:pencilbox/カンペンにあるパズル

		//k.def_csize = 36;
		//k.def_psize = 24;
		k.area = { bcell:0, wcell:0, number:0};	// areaオブジェクトで領域を生成する

		base.setTitle("碁石ひろい","Goishi");
		if(k.EDITOR){
			base.setExpression("　左クリックで○に順番を表す数字が、右クリックor押しっぱなしで元に戻せます。URL生成時、碁石のない部分は自動的にカットされます。",
							   " Left Click to input number of orders, Right Click or Pressing to Undo. The area with no Goishi is cut when outputting URL.");
		}
		else{
			base.setExpression("　左クリックで○に順番を表す数字が、右クリックor押しっぱなしで元に戻せます。",
							   " Left Click to input number of orders, Right Click or Pressing to Undo.");
		}
		base.setFloatbgcolor("rgb(96, 96, 96)");
		base.proto = 1;

		enc.pidKanpen = 'goishi';
	},
	menufix : function(){
		if(k.EDITOR){
			pp.addCheck('bdpadding','setting',true, '空隙つきURL', 'URL with Padding');
			pp.setLabel('bdpadding', 'URL生成時に周り1マス何もない部分をつける', 'Add Padding around the Board in outputting URL.');
			pp.funcs['bdpadding'] = function(){ };
		}
	},
	finalfix : function(){
		ee('btnclear2').el.style.display = 'none';
		var el = document.urloutput.firstChild;
		if(!el.innerHTML){
			document.urloutput.removeChild(el);
			el = document.urloutput.firstChild;
		}
		el.removeChild(el.firstChild);
		el.removeChild(el.firstChild);
	},

	protoChange : function(){
		Timer.prototype.startMouseUndoTimer = function(){
			this.undoWaitCount = this.undoStartCount;
			if(!this.TIDundo){ this.TIDundo = setInterval(ee.binder(this, this.procMouseUndo), this.undoInterval);}
			this.execMouseUndo();
		};
		Timer.prototype.stopMouseUndoTimer = function(){
			kc.inUNDO=false;
			kc.inREDO=false;
			clearInterval(this.TIDundo);
			this.TIDundo = null;
		};
		Timer.prototype.procMouseUndo = function(){
			if (!kc.inUNDO && !kc.inREDO){ this.stopUndoTimer();}
			else if(this.undoWaitCount>0){ this.undoWaitCount--;}
			else{ this.execMouseUndo();}
		};
		Timer.prototype.execMouseUndo = function(){
			if(kc.inUNDO){
				var prop = (um.current>0 ? um.ope[um.current-1].property : '');
				if(prop===k.QANS){ um.undo();}
				else             { kc.inUNDO = false;}
			}
			else if(kc.inREDO){
				var prop = (um.current<um.ope.length ? um.ope[um.current].property : '');
				if(prop===k.QANS){ um.redo();}
				else             { kc.inREDO = false;}
			}
		};
	},
	protoOriginal : function(){
		Timer.prototype.startMouseUndoTimer = null;
		Timer.prototype.stopMouseUndoTimer  = null;
		Timer.prototype.procMouseUndo       = null;
		Timer.prototype.execMouseUndo       = null;

		ee('btnclear2').el.style.display = 'inline';
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if     (k.editmode) this.inputstone();
			else if(k.playmode){
				if     (this.btn.Left)  this.inputqans();
				else if(this.btn.Right){
					kc.inUNDO = true;
					tm.startMouseUndoTimer();
				}
			}
		};
		mv.mouseup = function(){ kc.inUNDO = false; kc.inREDO = false;};
		mv.mousemove = function(){ };

		mv.inputstone = function(){
			var cc = this.cellid();
			if(cc===-1){ return;}

			var cc0 = tc.getTCC();
			if(cc!==cc0){
				tc.setTCC(cc);
				pc.paintCell(cc0);
			}

			bd.setStone(cc);
			pc.paintCell(cc);
		};
		mv.inputqans = function(){
			var cc = this.cellid();
			if(cc===-1 || bd.cell[cc].ques!==7 || bd.cell[cc].qans!==-1){
				kc.inREDO = true;
				tm.startMouseUndoTimer();
				return;
			}

			var max=0, bcc=-1;
			for(var c=0;c<bd.cellmax;c++){
				if(bd.cell[c].qans>max){
					max = bd.cell[c].qans;
					bcc = c;
				}
			}

			// すでに1つ以上の碁石が取られている場合
			if(bcc!==-1){
				var tmp, d = {x1:-1, y1:-1, x2:-1, y2:-1};
				d.x1 = bd.cell[cc].cx, d.x2 = bd.cell[bcc].cx;
				d.y1 = bd.cell[cc].cy, d.y2 = bd.cell[bcc].cy;

				// 自分の上下左右にmaxな碁石がない場合は何もしない
				if(d.x1!==d.x2 && d.y1!==d.y2){ return;}
				else if(d.x1===d.x2){
					if(d.y1>d.y2){ tmp=d.y2; d.y2=d.y1; d.y1=tmp;}
					d.y1++; d.y2--;
				}
				else{ // if(d.y1===d.y2)
					if(d.x1>d.x2){ tmp=d.x2; d.x2=d.x1; d.x1=tmp;}
					d.x1++; d.x2--;
				}
				// 間に碁石がある場合は何もしない
				for(var cx=d.x1;cx<=d.x2;cx++){ for(var cy=d.y1;cy<=d.y2;cy++){
					var c = bd.cnum(cx,cy);
					if(c!==-1 && bd.cell[c].ques===7){
						var qa = bd.cell[c].qans;
						if(qa===-1 || (max>=2 && qa===max-1)){ return;}
					}
				} }
			}

			bd.sQaC(cc,max+1);
			pc.paintCell(cc);
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(k.playmode){ return;}
			if(this.moveTCell(ca)){ return;}
			this.key_inputstone(ca);
		};
		kc.keyup = function(ca){ };

		kc.key_inputstone = function(ca){
			if(ca=='q'){
				var cc = tc.getTCC();
				bd.setStone(cc);
				pc.paintCell(cc);
			}
		};

		bd.setStone = function(cc){
			if     (bd.QuC(cc)!== 7){ bd.sQuC(cc,7);}
			else if(bd.QaC(cc)===-1){ bd.sQuC(cc,0);} // 数字のマスは消せません
		};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.errcolor1 = "rgb(208, 0, 0)";
		pc.errbcolor1 = "rgb(255, 192, 192)";

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);

			this.drawCenterLines(x1,y1,x2,y2);

			x1--; y1--; x2++; y2++;
			this.drawCircles_goishi(x1,y1,x2,y2);
			this.drawCellSquare(x1,y1,x2,y2);
			this.drawNumbers(x1,y1,x2,y2);

			this.drawTarget(x1,y1,x2,y2);
		};

		pc.drawCenterLines = function(x1,y1,x2,y2){
			this.vinc('centerline', 'crispEdges');
			if(x1<1){ x1=1;} if(x2>k.qcols-2){ x2=k.qcols-2;}
			if(y1<1){ y1=1;} if(y2>k.qrows-2){ y2=k.qrows-2;}

			g.fillStyle = this.gridcolor_LIGHT;
			for(var i=x1-1;i<=x2+1;i++){ if(this.vnop("cliney_"+i,this.NONE)){ g.fillRect(mf(k.p0.x+(i+0.5)*k.cwidth), mf(k.p0.y+(y1-0.5)*k.cheight), 1, (y2-y1+2)*k.cheight+1);} }
			for(var i=y1-1;i<=y2+1;i++){ if(this.vnop("clinex_"+i,this.NONE)){ g.fillRect(mf(k.p0.x+(x1-0.5)*k.cwidth), mf(k.p0.y+(i+0.5)*k.cheight), (x2-x1+2)*k.cwidth+1, 1);} }
		};
		pc.drawCircles_goishi = function(x1,y1,x2,y2){
			this.vinc('cell_goishi', 'auto');

			g.lineWidth = Math.max(k.cwidth*0.05, 1);
			var rsize  = k.cwidth*0.38;
			var header = "c_cir_";
			var clist = this.cellinside(x1,y1,x2,y2);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				if(bd.cell[c].ques===7 && bd.cell[c].qans===-1){
					g.strokeStyle = (bd.cell[c].error===1 ? this.errcolor1  : this.Cellcolor);
					g.fillStyle   = (bd.cell[c].error===1 ? this.errbcolor1 : "white");
					if(this.vnop(header+c,this.FILL_STROKE)){
						g.shapeCircle(bd.cell[c].px+k.cwidth/2, bd.cell[c].py+k.cheight/2, rsize);
					}
				}
				else{ this.vhide([header+c]);}
			}
		};
		pc.drawCellSquare = function(x1,y1,x2,y2){
			this.vinc('cell_number_base', 'crispEdges');

			var mgnw = mf(k.cwidth*0.1);
			var mgnh = mf(k.cheight*0.1);
			var header = "c_sq2_";

			var clist = this.cellinside(x1,y1,x2,y2);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				if(bd.cell[c].ques===7 && bd.cell[c].qans!==-1){
					g.fillStyle = (bd.cell[c].error===1 ? this.errbcolor1 : "white");
					if(this.vnop(header+c,this.FILL)){
						g.fillRect(bd.cell[c].px+mgnw+2, bd.cell[c].py+mgnh+2, k.cwidth-mgnw*2-3, k.cheight-mgnh*2-3);
					}
				}
				else{ this.vhide([header+c]);}
			}
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decodeBoard();
		};
		enc.pzlexport = function(type){
			this.encodeGoishi();
		};

		enc.decodeKanpen = function(){
			fio.decodeCell( function(c,ca){
				if(ca==='1'){ bd.sQuC(c, 7);}
			});
		};
		enc.encodeKanpen = function(){
			fio.encodeGoishi_kanpen();
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeCell( function(c,ca){
				if(ca!=='.'){
					bd.sQuC(c, 7);
					if(ca!=='0'){ bd.sQaC(c, parseInt(ca));}
				}
			});
		};
		fio.encodeData = function(){
			this.encodeCell( function(c){
				if(bd.QuC(c)===7){
					if(bd.QaC(c)===-1){ return "0 ";}
					else{ return ""+parseInt(bd.QaC(c))+" ";}
				}
				return ". ";
			});
		};

		//---------------------------------------------------------
		enc.decodeBoard = function(){
			var bstr = this.outbstr;
			for(var i=0;i<bstr.length;i++){
				var num = parseInt(bstr.charAt(i),32);
				for(var w=0;w<5;w++){ if((i*5+w)<bd.cellmax){ bd.sQuC(i*5+w,(num&Math.pow(2,4-w)?0:7));} }
				if((i*5+5)>=k.qcols*k.qrows){ break;}
			}
			this.outbstr = bstr.substr(i+1);
		};

		// エンコード時は、盤面サイズの縮小という特殊処理を行ってます
		enc.encodeGoishi = function(){
			var d = this.getSizeOfBoard_goishi();

			var cm="", count=0, pass=0;
			for(var cy=d.y1;cy<=d.y2;cy++){
				for(var cx=d.x1;cx<=d.x2;cx++){
					var c=bd.cnum(cx,cy);
					if(c===-1 || bd.QuC(c)==0){ pass+=Math.pow(2,4-count);}
					count++; if(count==5){ cm += pass.toString(32); count=0; pass=0;}
				}
			}
			if(count>0){ cm += pass.toString(32);}
			this.outbstr += cm;

			this.outsize = [d.x2-d.x1+1, d.y2-d.y1+1].join("/");
		};

		fio.encodeGoishi_kanpen = function(){
			var d = enc.getSizeOfBoard_goishi();

			for(var cy=d.y1;cy<=d.y2;cy++){
				for(var cx=d.x1;cx<=d.x2;cx++){
					var c = bd.cnum(cx,cy);
					this.datastr += (bd.QuC(c)===7 ? "1 " : ". ");
				}
				this.datastr += "/";
			}

			enc.outsize  = [d.y2-d.y1+1, d.x2-d.x1+1].join("/");
			this.sizestr = [d.y2-d.y1+1, d.x2-d.x1+1].join("/");
		};

		enc.getSizeOfBoard_goishi = function(){
			var x1=9999, x2=-1, y1=9999, y2=-1, count=0;
			for(var c=0;c<bd.cellmax;c++){
				if(bd.QuC(c)!=7){ continue;}
				if(x1>bd.cell[c].cx){ x1=bd.cell[c].cx;}
				if(x2<bd.cell[c].cx){ x2=bd.cell[c].cx;}
				if(y1>bd.cell[c].cy){ y1=bd.cell[c].cy;}
				if(y2<bd.cell[c].cy){ y2=bd.cell[c].cy;}
				count++;
			}
			if(count==0){ return {x1:0, y1:0, x2:1, y2:1};}
			if(pp.getVal('bdpadding')){ return {x1:x1-1, y1:y1-1, x2:x2+1, y2:y2+1};}
			return {x1:x1, y1:y1, x2:x2, y2:y2};
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			if( !this.checkAllCell(function(c){ return (bd.cell[c].ques===7 && bd.cell[c].qans===-1);}) ){
				this.setAlert('拾われていない碁石があります。','There is remaining Goishi.'); return false;
			}

			return true;
		}
	}
};
