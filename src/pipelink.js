//
// パズル固有スクリプト部 パイプリンク版 pipelink.js v3.3.0
//
Puzzles.pipelink = function(){ };
Puzzles.pipelink.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}	// 盤面の横幅
		if(!k.qrows){ k.qrows = 10;}	// 盤面の縦幅
		k.irowake = 1;			// 0:色分け設定無し 1:色分けしない 2:色分けする

		k.iscross      = 0;		// 1:Crossが操作可能なパズル
		k.isborder     = 1;		// 1:Border/Lineが操作可能なパズル
		k.isextendcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

		k.isoutsidecross  = 0;	// 1:外枠上にCrossの配置があるパズル
		k.isoutsideborder = 0;	// 1:盤面の外枠上にborderのIDを用意する
		k.isLineCross     = 1;	// 1:線が交差するパズル
		k.isCenterLine    = 1;	// 1:マスの真ん中を通る線を回答として入力するパズル
		k.isborderAsLine  = 0;	// 1:境界線をlineとして扱う

		k.dispzero      = 0;	// 1:0を表示するかどうか
		k.isDispHatena  = 1;	// 1:qnumが-2のときに？を表示する
		k.isAnsNumber   = 0;	// 1:回答に数字を入力するパズル
		k.isArrowNumber = 0;	// 1:矢印つき数字を入力するパズル
		k.isOneNumber   = 0;	// 1:部屋の問題の数字が1つだけ入るパズル
		k.isDispNumUL   = 0;	// 1:数字をマス目の左上に表示するパズル(0はマスの中央)
		k.NumberWithMB  = 0;	// 1:回答の数字と○×が入るパズル

		k.BlackCell     = 0;	// 1:黒マスを入力するパズル
		k.NumberIsWhite = 0;	// 1:数字のあるマスが黒マスにならないパズル
		k.RBBlackCell   = 0;	// 1:連黒分断禁のパズル

		k.ispzprv3ONLY  = 0;	// 1:ぱずぷれv3にしかないパズル
		k.isKanpenExist = 0;	// 1:pencilbox/カンペンにあるパズル

		//k.def_csize = 36;
		//k.def_psize = 24;
		//k.area = { bcell:0, wcell:0, number:0};	// areaオブジェクトで領域を生成する

		if(k.EDITOR){
			base.setExpression("　問題の記号はQWEASDFの各キーで入力できます。<br>Rキーや-キーで消去できます。1キーで記号を入力できます。",
							   " Press each QWEASDF key to input question. <br> Press 'R' or '-' key to erase. '1' keys to input circles.");
		}
		else{
			base.setExpression("　左ドラッグで線が、右クリックで×が入力できます。",
							   " Left Button Drag to input black cells, Right Click to input a cross.");
		}
		base.setTitle("パイプリンク","Pipelink");
		base.setFloatbgcolor("rgb(0, 191, 0)");
	},
	menufix : function(){
		if(k.EDITOR){ kp.defaultdisp = true;}
		menu.addRedLineToFlags();

		var el = ee.createEL(menu.EL_BUTTON, 'btncircle');
		menu.addButtons(el, ee.binder(pc, pc.changedisp), "○", "○");
		ee('btnarea').appendEL(el);
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		// マウス入力系
		mv.mousedown = function(){
			if(kc.isZ ^ pp.getVal('dispred')){ this.dispRedLine(); return;}
			if(k.editmode){
				if(!kp.enabled()){ this.inputQues([0,101,102,103,104,105,106,107,-2]);}
				else{ kp.display();}
			}
			else if(k.playmode){
				if(this.btn.Left) this.inputLine();
				else if(this.btn.Right) this.inputpeke();
			}
		};
		mv.mouseup = function(){ };
		mv.mousemove = function(){
			if(k.playmode){
				if(this.btn.Left) this.inputLine();
				else if(this.btn.Right) this.inputpeke();
			}
		};

		bd.enableLineNG = true;

		// オーバーライト
		bd.sQuC = function(id, num) {
			um.addOpe(k.CELL, k.QUES, id, this.cell[id].ques, num);
			this.cell[id].ques = num;

			this.checkLPCombined(id);
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(ca=='z' && !this.keyPressed){ this.isZ=true; return;}
			if(k.playmode){ return;}
			if(this.moveTCell(ca)){ return;}
			kc.key_inputLineParts(ca);
		};
		kc.key_inputLineParts = function(ca){
			if(k.playmode){ return false;}
			var cc = tc.getTCC();

			if     (ca=='q'){ bd.sQuC(cc,101); }
			else if(ca=='w'){ bd.sQuC(cc,102); }
			else if(ca=='e'){ bd.sQuC(cc,103); }
			else if(ca=='r'){ bd.sQuC(cc,  0); }
			else if(ca==' '){ bd.sQuC(cc,  0); }
			else if(ca=='a'){ bd.sQuC(cc,104); }
			else if(ca=='s'){ bd.sQuC(cc,105); }
			else if(ca=='d'){ bd.sQuC(cc,106); }
			else if(ca=='f'){ bd.sQuC(cc,107); }
			else if(ca=='-'){ bd.sQuC(cc, (bd.QuC(cc)!=-2?-2:0)); }
			else if(ca=='1'){ bd.sQuC(cc,  6); }
			else{ return false;}

			pc.paintCellAround(cc);
			return true;
		};
		kc.keyup = function(ca){ if(ca=='z'){ this.isZ=false;}};
		kc.isZ = false;

		if(k.EDITOR){
			kp.kpgenerate = function(mode){
				this.inputcol('num','knumq','q','╋');
				this.inputcol('num','knumw','w','┃');
				this.inputcol('num','knume','e','━');
				this.inputcol('num','knumr','r',' ');
				this.insertrow();
				this.inputcol('num','knuma','a','┗');
				this.inputcol('num','knums','s','┛');
				this.inputcol('num','knumd','d','┓');
				this.inputcol('num','knumf','f','┏');
				this.insertrow();
				this.inputcol('num','knum_','-','?');
				this.inputcol('empty','knumx','','');
				this.inputcol('empty','knumy','','');
				this.inputcol('num','knum.','1','○');
				this.insertrow();
			};
			kp.generate(kp.ORIGINAL, true, false, kp.kpgenerate);
			kp.kpinput = function(ca){ kc.key_inputLineParts(ca);};
		}
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_LIGHT;
		pc.linecolor = pc.linecolor_LIGHT;

		pc.minYdeg = 0.42;

		pc.paint = function(x1,y1,x2,y2){
			this.drawBGCells(x1,y1,x2,y2);
			this.drawDashedGrid(x1,y1,x2,y2);

			this.drawCircles_pipelink(x1,y1,x2,y2,(this.disp===0));

			this.drawBorders(x1,y1,x2,y2);

			this.drawQuesHatenas(x1,y1,x2,y2);

			this.drawLines(x1,y1,x2,y2);

			this.drawPekes(x1,y1,x2,y2,0);

			this.drawLineParts(x1-2,y1-2,x2+2,y2+2);

			this.drawChassis(x1,y1,x2,y2);

			this.drawTarget(x1,y1,x2,y2);
		};

		pc.setBGCellColor = function(c){
			if     (bd.cell[c].error===1)               { g.fillStyle = this.errbcolor1; return true;}
			else if(bd.cell[c].ques===6 && this.disp==1){ g.fillStyle = this.icecolor;   return true;}
			return false;
		};
		pc.setBorderColor = function(id){
			if(this.disp===1){
				var cc1 = bd.border[id].cellcc[0], cc2 = bd.border[id].cellcc[1];
				if(cc1!==-1 && cc2!==-1 && (bd.cell[cc1].ques===6^bd.cell[cc2].ques===6)){
					g.fillStyle = this.Cellcolor;
					return true;
				}
			}
			return false;
		};

		pc.drawCircles_pipelink = function(x1,y1,x2,y2,isdraw){
			this.vinc('cell_circle', 'auto');

			var header = "c_cir_";
			var clist = this.cellinside(x1,y1,x2,y2);
			if(isdraw){
				var rsize  = this.cw*0.40;
				for(var i=0;i<clist.length;i++){
					var c = clist[i];
					if(bd.cell[c].ques===6){
						g.strokeStyle = this.Cellcolor;
						if(this.vnop(header+c,this.NONE)){
							g.strokeCircle(bd.cell[c].cpx, bd.cell[c].cpy, rsize);
						}
					}
					else{ this.vhide(header+c);}
				}
			}
			else{
				var header = "c_cir_";
				for(var i=0;i<clist.length;i++){ this.vhide(header+clist[i]);}
			}
		};

		pc.disp = 0;
		pc.changedisp = function(){
			if     (this.disp===1){ ee('btncircle').el.value="○"; this.disp=0;}
			else if(this.disp===0){ ee('btncircle').el.value="■"; this.disp=1;}
			this.paintAll();
		};

		line.repaintParts = function(idlist){
			var clist = this.getClistFromIdlist(idlist);
			for(var i=0;i<clist.length;i++){
				pc.drawLineParts1(clist[i]);
			}
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decodePipelink();
			if(this.checkpflag("i") && this.disp==0){ pc.changedisp();}
		};
		enc.pzlexport = function(type){
			this.outpflag = (pc.disp==0 ? "" : "i");
			this.encodePipelink(type);
		};

		enc.decodePipelink = function(){
			var c=0, bstr = this.outbstr;
			for(var i=0;i<bstr.length;i++){
				var ca = bstr.charAt(i);

				if     (ca=='.'){ bd.sQuC(c, -2); c++;}
				else if(ca>='0' && ca<='9'){
					var imax = parseInt(ca,10)+1; var icur;
					for(icur=0;icur<imax;icur++){ bd.sQuC(c, 6); c++;}
				}
				else if(ca>='a' && ca<='g'){ bd.sQuC(c, (parseInt(ca,36)+91)); c++;}
				else if(ca>='h' && ca<='z'){ c += (parseInt(ca,36)-16);}
				else{ c++;}

				if(c > bd.cellmax){ break;}
			}

			this.outbstr = bstr.substr(i);
		};
		enc.encodePipelink = function(type){
			var count, pass;
			var cm="";
			var pstr="";

			count=0;
			for(var i=0;i<bd.cellmax;i++){
				if     (bd.QuC(i) == -2){ pstr = ".";}
				else if(bd.QuC(i) ==  6){
					if(type==0){
						var icur;
						for(icur=1;icur<10;icur++){ if(bd.QuC(i+icur)!=6){ break;}}
						pstr = (icur-1).toString(10); i+=(icur-1);
					}
					else if(type==1){
						pstr = "0";
					}
				}
				else if(bd.QuC(i)>=101 && bd.QuC(i)<=107){ pstr = (bd.QuC(i)-91).toString(36);}
				else{ pstr = ""; count++;}

				if(count==0){ cm += pstr;}
				else if(pstr || count==19){ cm+=((16+count).toString(36)+pstr); count=0;}
			}
			if(count>0){ cm+=(16+count).toString(36);}

			this.outbstr += cm;
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			pc.disp = (this.readLine()=="circle" ? 0 : 1);
			this.decodeCell( function(c,ca){
				if(ca == "o")     { bd.sQuC(c, 6); }
				else if(ca == "-"){ bd.sQuC(c, -2);}
				else if(ca != "."){ bd.sQuC(c, parseInt(ca,36)+91);}
			});
			this.decodeBorderLine();
		};
		fio.encodeData = function(){
			this.datastr += (pc.disp==0?"circle/":"ice/");
			this.encodeCell( function(c){
				if     (bd.QuC(c)==6) { return "o ";}
				else if(bd.QuC(c)>=101 && bd.QuC(c)<=107) { return ""+(bd.QuC(c)-91).toString(36)+" ";}
				else if(bd.QuC(c)==-2){ return "- ";}
				else                  { return ". ";}
			});
			this.encodeBorderLine();
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			if( !this.checkenableLineParts(1) ){
				this.setAlert('最初から引かれている線があるマスに線が足されています。','Lines are added to the cell that the mark lie in by the question.'); return false;
			}

			if( !this.checkLcntCell(3) ){
				this.setAlert('分岐している線があります。','There is a branched line.'); return false;
			}

			var rice = false;
			for(var i=0;i<bd.cellmax;i++){ if(bd.QuC(i)==6){ rice=true; break;}}
			if( rice && !this.checkAllCell(function(c){ return (line.lcntCell(c)==4 && bd.QuC(c)!=6 && bd.QuC(c)!=101);}) ){
				this.setAlert((pc.disp==0?'○':'氷')+'の部分以外で線が交差しています。','There is a crossing line out of '+(pc.disp==0?'circles':'ices')+'.'); return false;
			}
			if( rice && !this.checkAllCell(ee.binder(this, function(c){ return (line.lcntCell(c)==2 && bd.QuC(c)==6 && !this.isLineStraight(c));})) ){
				ans.setAlert((pc.disp==0?'○':'氷')+'の部分で線が曲がっています。','A line curves on '+(pc.disp==0?'circles':'ices')+'.'); return false;
			}

			if( !this.checkOneLoop() ){
				this.setAlert('輪っかが一つではありません。','There are plural loops.'); return false;
			}

			if( !this.checkAllCell(function(c){ return (bd.QuC(c)==101 && line.lcntCell(c)!=4);}) ){
				this.setAlert('┼のマスから線が4本出ていません。','A cross-joint cell doesn\'t have four-way lines.'); return false;
			}

			if( !this.checkLcntCell(0) ){
				this.setAlert('線が引かれていないマスがあります。','There is an empty cell.'); return false;
			}

			if( !this.checkLcntCell(1) ){
				this.setAlert('途中で途切れている線があります。','There is a dead-end line.'); return false;
			}

			return true;
		};
	}
};
