//
// パズル固有スクリプト部 パイプリンク版 pipelink.js v3.3.2
//
Puzzles.pipelink = function(){ };
Puzzles.pipelink.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}
		if(!k.qrows){ k.qrows = 10;}
		k.irowake  = 1;

		k.iscross  = 0;
		k.isborder = 1;
		k.isexcell = 0;

		k.isLineCross     = true;
		k.isCenterLine    = true;
		k.isborderAsLine  = false;
		k.hasroom         = false;
		k.roomNumber      = false;

		k.dispzero        = false;
		k.isDispHatena    = true;
		k.isInputHatena   = true;
		k.inputQnumDirect = false;
		k.isAnsNumber     = false;
		k.NumberWithMB    = false;
		k.linkNumber      = false;

		k.BlackCell       = false;
		k.NumberIsWhite   = false;
		k.numberAsObject  = false;
		k.RBBlackCell     = false;
		k.checkBlackCell  = false;
		k.checkWhiteCell  = false;

		k.ispzprv3ONLY    = false;
		k.isKanpenExist   = false;

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
			if(k.editmode){ this.inputQues([0,11,12,13,14,15,16,17,-2]);}
			else if(k.playmode){
				if(this.btn.Left) this.inputLine();
				else if(this.btn.Right) this.inputpeke();
			}
		};
		mv.mouseup = function(){
			if(k.playmode && this.btn.Left && this.notInputted()){
				this.inputpeke();
			}
		};
		mv.mousemove = function(){
			if(k.playmode){
				if(this.btn.Left) this.inputLine();
				else if(this.btn.Right) this.inputpeke();
			}
		};

		bd.enableLineNG = true;
		bd.enableLineCombined = true;

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

			if     (ca=='q'){ bd.sQuC(cc,11); }
			else if(ca=='w'){ bd.sQuC(cc,12); }
			else if(ca=='e'){ bd.sQuC(cc,13); }
			else if(ca=='r'){ bd.sQuC(cc, 0); }
			else if(ca==' '){ bd.sQuC(cc, 0); }
			else if(ca=='a'){ bd.sQuC(cc,14); }
			else if(ca=='s'){ bd.sQuC(cc,15); }
			else if(ca=='d'){ bd.sQuC(cc,16); }
			else if(ca=='f'){ bd.sQuC(cc,17); }
			else if(ca=='-'){ bd.sQuC(cc,(bd.QuC(cc)!==-2?-2:0)); }
			else if(ca=='1'){ bd.sQuC(cc, 6); }
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
				this.inputcol('empty','','','');
				this.inputcol('empty','','','');
				this.inputcol('num','knum.','1','○');
				this.insertrow();
			};
			kp.generate(kp.ORIGINAL, true, false);
			kp.kpinput = function(ca){ kc.key_inputLineParts(ca);};
		}
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_LIGHT;
		pc.linecolor = pc.linecolor_LIGHT;

		pc.minYdeg = 0.42;

		pc.paint = function(){
			this.drawBGCells();
			this.drawDashedGrid();

			this.drawCircles_pipelink((this.disp===0));

			this.drawBorders();

			this.drawHatenas();

			this.drawLines();

			this.drawPekes(0);

			this.drawLineParts();

			this.drawChassis();

			this.drawTarget();
		};

		pc.setBGCellColor = function(c){
			if     (bd.cell[c].error===1)               { g.fillStyle = this.errbcolor1; return true;}
			else if(bd.cell[c].ques===6 && this.disp==1){ g.fillStyle = this.icecolor;   return true;}
			return false;
		};
		pc.setBorderColor = function(id){
			if(this.disp===1){
				var cc1 = bd.border[id].cellcc[0], cc2 = bd.border[id].cellcc[1];
				if(cc1!==null && cc2!==null && (bd.cell[cc1].ques===6^bd.cell[cc2].ques===6)){
					g.fillStyle = this.cellcolor;
					return true;
				}
			}
			return false;
		};

		pc.drawCircles_pipelink = function(isdraw){
			this.vinc('cell_circle', 'auto');

			var header = "c_cir_";
			var clist = this.range.cells;
			if(isdraw){
				var rsize  = this.cw*0.40;
				for(var i=0;i<clist.length;i++){
					var c = clist[i];
					if(bd.cell[c].ques===6){
						g.strokeStyle = this.cellcolor;
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

		pc.repaintParts = function(idlist){
			var clist = line.getClistFromIdlist(idlist);
			for(var i=0;i<clist.length;i++){
				this.drawLineParts1(clist[i]);
			}
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decodePipelink();
			if(this.checkpflag("i") && this.disp===0){ pc.changedisp();}
		};
		enc.pzlexport = function(type){
			this.outpflag = (pc.disp===0 ? "" : "i");
			this.encodePipelink(type);
		};

		enc.decodePipelink = function(){
			var c=0, bstr = this.outbstr;
			for(var i=0;i<bstr.length;i++){
				var ca = bstr.charAt(i);

				if     (ca=='.'){ bd.cell[c].ques = -2;}
				else if(ca>='0' && ca<='9'){
					for(var n=0,max=parseInt(ca,10)+1;n<max;n++){
						if(c<bd.cellmax){ bd.cell[c].ques = 6; c++;}
					}
					c--;
				}
				else if(ca>='a' && ca<='g'){ bd.cell[c].ques = parseInt(ca,36)+1;}
				else if(ca>='h' && ca<='z'){ c += (parseInt(ca,36)-17);}

				c++;
				if(c>=bd.cellmax){ break;}
			}

			this.outbstr = bstr.substr(i);
		};
		enc.encodePipelink = function(type){
			var count, pass, cm="";

			count=0;
			for(var c=0;c<bd.cellmax;c++){
				var pstr="", qu=bd.cell[c].ques;

				if     (qu===-2){ pstr = ".";}
				else if(qu=== 6){
					if(type===0){
						for(var n=1;n<10;n++){
							if((c+n)>=bd.cellmax && bd.cell[c+n].ques!==6){ break;}
						}
						pstr=(n-1).toString(10); c=(c+n-1);
					}
					else if(type===1){ pstr="0";}
				}
				else if(qu>=11 && qu<=17){ pstr = (qu-1).toString(36);}
				else{ count++;}

				if(count===0){ cm += pstr;}
				else if(pstr || count===19){ cm+=((16+count).toString(36)+pstr); count=0;}
			}
			if(count>0){ cm+=(16+count).toString(36);}

			this.outbstr += cm;
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			pc.disp = (this.readLine()=="circle" ? 0 : 1);
			this.decodeCell( function(obj,ca){
				if     (ca==="o"){ obj.ques = 6; }
				else if(ca==="-"){ obj.ques = -2;}
				else if(ca!=="."){ obj.ques = parseInt(ca,36)+1;}
			});
			this.decodeBorderLine();
		};
		fio.encodeData = function(){
			this.datastr += (pc.disp==0?"circle/":"ice/");
			this.encodeCell( function(obj){
				if     (obj.ques==6) { return "o ";}
				else if(obj.ques==-2){ return "- ";}
				else if(obj.ques>=11 && obj.ques<=17){ return ""+(obj.ques-1).toString(36)+" ";}
				else                 { return ". ";}
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
			if( rice && !this.checkAllCell(function(c){ return (line.lcntCell(c)===4 && bd.QuC(c)!==6 && bd.QuC(c)!==11);}) ){
				this.setAlert((pc.disp==0?'○':'氷')+'の部分以外で線が交差しています。','There is a crossing line out of '+(pc.disp===0?'circles':'ices')+'.'); return false;
			}
			if( rice && !this.checkIceLines() ){
				ans.setAlert((pc.disp==0?'○':'氷')+'の部分で線が曲がっています。','A line curves on '+(pc.disp===0?'circles':'ices')+'.'); return false;
			}

			if( !this.checkOneLoop() ){
				this.setAlert('輪っかが一つではありません。','There are plural loops.'); return false;
			}

			if( !this.checkAllCell(function(c){ return (bd.QuC(c)===11 && line.lcntCell(c)!==4);}) ){
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
