//
// パズル固有スクリプト部 碁石ひろい版 goishi.js v3.3.1
//
Puzzles.goishi = function(){ };
Puzzles.goishi.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}	// 盤面の横幅
		if(!k.qrows){ k.qrows = 10;}	// 盤面の縦幅
		k.irowake  = 0;		// 0:色分け設定無し 1:色分けしない 2:色分けする

		k.iscross  = 0;		// 1:盤面内側のCrossがあるパズル 2:外枠上を含めてCrossがあるパズル
		k.isborder = 0;		// 1:Border/Lineが操作可能なパズル 2:外枠上も操作可能なパズル
		k.isexcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

		k.isLineCross     = false;	// 線が交差するパズル
		k.isCenterLine    = false;	// マスの真ん中を通る線を回答として入力するパズル
		k.isborderAsLine  = false;	// 境界線をlineとして扱う
		k.hasroom         = false;	// いくつかの領域に分かれている/分けるパズル
		k.roomNumber      = false;	// 部屋の問題の数字が1つだけ入るパズル

		k.dispzero        = false;	// 0を表示するかどうか
		k.isDispHatena    = false;	// qnumが-2のときに？を表示する
		k.isAnsNumber     = true;	// 回答に数字を入力するパズル
		k.NumberWithMB    = false;	// 回答の数字と○×が入るパズル
		k.linkNumber      = false;	// 数字がひとつながりになるパズル

		k.BlackCell       = false;	// 黒マスを入力するパズル
		k.NumberIsWhite   = false;	// 数字のあるマスが黒マスにならないパズル
		k.RBBlackCell     = false;	// 連黒分断禁のパズル
		k.checkBlackCell  = false;	// 正答判定で黒マスの情報をチェックするパズル
		k.checkWhiteCell  = false;	// 正答判定で白マスの情報をチェックするパズル

		k.ispzprv3ONLY    = true;	// ぱずぷれアプレットには存在しないパズル
		k.isKanpenExist   = true;	// pencilbox/カンペンにあるパズル

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
	},

	protoChange : function(){
		Timer.prototype.startMouseUndoTimer = function(){
			this.undoWaitCount = this.undoWaitTime/this.undoInterval;
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
				if(prop===k.ANUM){ um.undo();}
				else             { kc.inUNDO = false;}
			}
			else if(kc.inREDO){
				var prop = (um.current<um.ope.length ? um.ope[um.current].property : '');
				if(prop===k.ANUM){ um.redo();}
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
			if(cc===null){ return;}

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
			if(cc===null || bd.cell[cc].ques!==7 || bd.cell[cc].anum!==-1){
				kc.inREDO = true;
				tm.startMouseUndoTimer();
				return;
			}

			var max=0, bcc=null;
			for(var c=0;c<bd.cellmax;c++){
				if(bd.cell[c].anum>max){
					max = bd.cell[c].anum;
					bcc = c;
				}
			}

			// すでに1つ以上の碁石が取られている場合
			if(bcc!==null){
				var tmp, d = {x1:-1, y1:-1, x2:-1, y2:-1};
				d.x1 = bd.cell[cc].bx, d.x2 = bd.cell[bcc].bx;
				d.y1 = bd.cell[cc].by, d.y2 = bd.cell[bcc].by;

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
					var c = bd.cnum(bx,by);
					if(c!==null && bd.cell[c].ques===7){
						var qa = bd.cell[c].anum;
						if(qa===-1 || (max>=2 && qa===max-1)){ return;}
					}
				} }
			}

			bd.sAnC(cc,max+1);
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
			else if(bd.AnC(cc)===-1){ bd.sQuC(cc,0);} // 数字のマスは消せません
		};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.errcolor1 = "rgb(208, 0, 0)";
		pc.errbcolor1 = "rgb(255, 192, 192)";

		pc.paint = function(x1,y1,x2,y2){
			this.drawCenterLines(x1,y1,x2,y2);

			x1--; y1--; x2++; y2++;
			this.drawCircles_goishi(x1,y1,x2,y2);
			this.drawCellSquare(x1,y1,x2,y2);
			this.drawNumbers(x1,y1,x2,y2);

			this.drawTarget(x1,y1,x2,y2);
		};

		pc.drawCenterLines = function(x1,y1,x2,y2){
			this.vinc('centerline', 'crispEdges');
			if(x1<bd.minbx+1){ x1=bd.minbx+1;} if(x2>bd.maxbx-1){ x2=bd.maxbx-1;}
			if(y1<bd.minby+1){ y1=bd.minby+1;} if(y2>bd.maxby-1){ y2=bd.maxby-1;}
			x1|=1, y1|=1;

			g.fillStyle = this.gridcolor_LIGHT;
			for(var i=x1;i<=x2;i+=2){ if(this.vnop("cliney_"+i,this.NONE)){ g.fillRect(k.p0.x+ i*this.bw, k.p0.y+y1*this.bh, 1, (y2-y1)*this.bh+1);} }
			for(var i=y1;i<=y2;i+=2){ if(this.vnop("clinex_"+i,this.NONE)){ g.fillRect(k.p0.x+x1*this.bw, k.p0.y+ i*this.bh, (x2-x1)*this.bw+1, 1);} }
		};
		pc.drawCircles_goishi = function(x1,y1,x2,y2){
			this.vinc('cell_goishi', 'auto');

			g.lineWidth = Math.max(this.cw*0.05, 1);
			var rsize  = this.cw*0.38;
			var header = "c_cir_";
			var clist = bd.cellinside(x1,y1,x2,y2);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				if(bd.cell[c].ques===7 && bd.cell[c].anum===-1){
					g.strokeStyle = (bd.cell[c].error===1 ? this.errcolor1  : this.cellcolor);
					g.fillStyle   = (bd.cell[c].error===1 ? this.errbcolor1 : "white");
					if(this.vnop(header+c,this.FILL_STROKE)){
						g.shapeCircle(bd.cell[c].cpx, bd.cell[c].cpy, rsize);
					}
				}
				else{ this.vhide([header+c]);}
			}
		};
		pc.drawCellSquare = function(x1,y1,x2,y2){
			this.vinc('cell_number_base', 'crispEdges');

			var mgnw = this.cw*0.1;
			var mgnh = this.ch*0.1;
			var header = "c_sq2_";

			var clist = bd.cellinside(x1,y1,x2,y2);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				if(bd.cell[c].ques===7 && bd.cell[c].anum!==-1){
					g.fillStyle = (bd.cell[c].error===1 ? this.errbcolor1 : "white");
					if(this.vnop(header+c,this.FILL)){
						g.fillRect(bd.cell[c].px+mgnw+2, bd.cell[c].py+mgnh+2, this.cw-mgnw*2-3, this.ch-mgnh*2-3);
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
			this.decodeGoishi();
		};
		enc.pzlexport = function(type){
			this.encodeGoishi();
		};

		enc.decodeKanpen = function(){
			fio.decodeGoishi_kanpen();
		};
		enc.encodeKanpen = function(){
			fio.encodeGoishi_kanpen();
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeGoishiFile();
		};
		fio.encodeData = function(){
			this.encodeGoishiFile();
		};

		fio.kanpenOpen = function(){
			this.decodeGoishi_kanpen();
			this.decodeQansPos_kanpen();
		};
		fio.kanpenSave = function(){
			this.encodeGoishi_kanpen();
			this.encodeQansPos_kanpen();
		};

		//---------------------------------------------------------
		enc.decodeGoishi = function(){
			var bstr = this.outbstr, c=0, twi=[16,8,4,2,1];
			for(var i=0;i<bstr.length;i++){
				var num = parseInt(bstr.charAt(i),32);
				for(var w=0;w<5;w++){
					if(c<bd.cellmax){
						bd.sQuC(c,(num&twi[w]?0:7));
						c++;
					}
				}
				if(c>=k.qcols*k.qrows){ break;}
			}
			this.outbstr = bstr.substr(i+1);
		};
		// エンコード時は、盤面サイズの縮小という特殊処理を行ってます
		enc.encodeGoishi = function(){
			var d = this.getSizeOfBoard_goishi();

			var cm="", count=0, pass=0, twi=[16,8,4,2,1];
			for(var by=d.y1;by<=d.y2;by+=2){
				for(var bx=d.x1;bx<=d.x2;bx+=2){
					var c=bd.cnum(bx,by);
					if(c===null || bd.cell[c].ques===0){ pass+=twi[count];} count++;
					if(count==5){ cm += pass.toString(32); count=0; pass=0;}
				}
			}
			if(count>0){ cm += pass.toString(32);}
			this.outbstr += cm;

			this.outsize = [d.cols, d.rows].join("/");
		};

		enc.getSizeOfBoard_goishi = function(){
			var x1=9999, x2=-1, y1=9999, y2=-1, count=0;
			for(var c=0;c<bd.cellmax;c++){
				if(bd.cell[c].ques!==7){ continue;}
				if(x1>bd.cell[c].bx){ x1=bd.cell[c].bx;}
				if(x2<bd.cell[c].bx){ x2=bd.cell[c].bx;}
				if(y1>bd.cell[c].by){ y1=bd.cell[c].by;}
				if(y2<bd.cell[c].by){ y2=bd.cell[c].by;}
				count++;
			}
			if(count==0){ return {x1:0, y1:0, x2:1, y2:1, cols:2, rows:2};}
			if(pp.getVal('bdpadding')){ return {x1:x1-2, y1:y1-2, x2:x2+2, y2:y2+2, cols:(x2-x1+6)/2, rows:(y2-y1+6)/2};}
			return {x1:x1, y1:y1, x2:x2, y2:y2, cols:(x2-x1+2)/2, rows:(y2-y1+2)/2};
		};

		//---------------------------------------------------------
		fio.decodeGoishiFile = function(){
			this.decodeCell( function(obj,ca){
				if(ca!=='.'){
					obj.ques = 7;
					if(ca!=='0'){ obj.anum = parseInt(ca);}
				}
			});
		};
		fio.encodeGoishiFile = function(){
			this.encodeCell( function(obj){
				if(obj.ques===7){
					return (obj.anum!==-1 ? ""+obj.anum+" " : "0 ");
				}
				return ". ";
			});
		};

		fio.decodeGoishi_kanpen = function(){
			this.decodeCell( function(obj,ca){
				if(ca==='1'){ obj.ques = 7;}
			});
		};
		fio.encodeGoishi_kanpen = function(){
			for(var by=bd.minby+1;by<bd.maxby;by+=2){
				for(var bx=bd.minbx+1;bx<bd.maxbx;bx+=2){
					var c = bd.cnum(bx,by);
					this.datastr += (bd.cell[c].ques===7 ? "1 " : ". ");
				}
				this.datastr += "/";
			}
		};

		fio.decodeQansPos_kanpen = function(){
			for(;;){
				var data = this.readLine();
				if(!data){ break;}

				var item = data.split(" ");
				if(item.length<=1){ return;}
				else{
					var c=bd.cnum(parseInt(item[2])*2+1,parseInt(item[1])*2+1);
					bd.cell[c].ques = 7;
					bd.cell[c].anum = parseInt(item[0]);
				}
			}
		};
		fio.encodeQansPos_kanpen = function(){
			var stones = []
			for(var by=bd.minby+1;by<bd.maxby;by+=2){ for(var bx=bd.minbx+1;bx<bd.maxbx;bx+=2){
				var c = bd.cnum(bx,by), obj=bd.cell[c];
				if(obj.ques!==7 || obj.anum===-1){ continue;}

				var pos = [(bx>>1).toString(), (by>>1).toString()];
				stones[obj.anum-1] = pos;
			}}
			for(var i=0,len=stones.length;i<len;i++){
				var item = [(i+1), stones[i][1], stones[i][0]];
				this.datastr += (item.join(" ")+"/");
			}
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			if( !this.checkAllCell(function(c){ return (bd.cell[c].ques===7 && bd.cell[c].anum===-1);}) ){
				this.setAlert('拾われていない碁石があります。','There is remaining Goishi.'); return false;
			}

			return true;
		}
	}
};
