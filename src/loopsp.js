//
// パズル固有スクリプト部 環状線スペシャル版 loopsp.js v3.2.2
//
Puzzles.loopsp = function(){ };
Puzzles.loopsp.prototype = {
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
		k.isDispHatena  = 0;	// 1:qnumが-2のときに？を表示する
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

		k.fstruct = ["others", "borderline"];

		//k.def_csize = 36;
		//k.def_psize = 24;
		//k.area = { bcell:0, wcell:0, number:0};	// areaオブジェクトで領域を生成する

		if(k.callmode=="pplay"){
			base.setExpression("　左ドラッグで線が、右クリックで×印が入力できます。",
							   " Left Button Drag to input black cells, Right Click to input a cross.");
		}
		else{
			base.setExpression("　問題の記号はQWEASDFの各キーで入力できます。<br>Rキーや-キーで消去できます。数字キーで数字を入力できます。",
							   " Press each QWEASDF key to input question. <br> Press 'R' or '-' key to erase. Number keys to input numbers.");
		}
		base.setTitle("環状線スペシャル","Loop Special");
		base.setFloatbgcolor("rgb(0, 191, 0)");
	},
	menufix : function(){
		if(k.callmode=="pmake"){ kp.defaultdisp = true;}
		menu.addRedLineToFlags();
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(x,y){
			if(kc.isZ ^ menu.getVal('dispred')){ this.dispRedLine(x,y); return;}
			if(k.mode==1){
				if(!kp.enabled()){ this.inputLoopsp(x,y);}
				else{ kp.display(x,y);}
			}
			else if(k.mode==3){
				if(this.btn.Left) this.inputLine(x,y);
				else if(this.btn.Right) this.inputpeke(x,y);
			}
		};
		mv.mouseup = function(x,y){ };
		mv.mousemove = function(x,y){
			if(k.mode==3){
				if(this.btn.Left) this.inputLine(x,y);
				else if(this.btn.Right) this.inputpeke(x,y);
			}
		};

		mv.inputLoopsp = function(x,y){
			var cc = this.cellid(new Pos(x,y));
			if(cc==-1 || cc==this.mouseCell){ return;}

			if(cc==tc.getTCC()){
				var qs = bd.QuC(cc); var qn = bd.QnC(cc);
				if(this.btn.Left){
					if(qn==-1){
						if     (qs==0)           { bd.sQuC(cc,101);}
						else if(qs>=101&&qs<=106){ bd.sQuC(cc,qs+1);}
						else if(qs==107)         { bd.sQuC(cc,0); bd.sQnC(cc,-2);}
					}
					else if(qn==-2){ bd.sQnC(cc,1);}
					else if(qn<99) { bd.sQnC(cc,qn+1);}
					else{ bd.sQuC(cc,0); bd.sQnC(cc,-1);}
				}
				else if(this.btn.Right){
					if(qn==-1){
						if     (qs==0)           { bd.sQuC(cc,0); bd.sQnC(cc,-2);}
						else if(qs==101)         { bd.sQuC(cc,0); bd.sQnC(cc,-1);}
						else if(qs>=102&&qs<=107){ bd.sQuC(cc,qs-1);}
					}
					else if(qn==-2){ bd.sQuC(cc,107); bd.sQnC(cc,-1);}
					else if(qn>1) { bd.sQnC(cc,qn-1);}
					else{ bd.sQuC(cc,0); bd.sQnC(cc,-2);}
				}
			}
			else{
				var cc0 = tc.getTCC();
				tc.setTCC(cc);
				pc.paint(bd.cell[cc0].cx-1, bd.cell[cc0].cy-1, bd.cell[cc0].cx, bd.cell[cc0].cy);
			}
			this.mouseCell = cc;

			pc.paint(bd.cell[cc].cx-1, bd.cell[cc].cy-1, bd.cell[cc].cx, bd.cell[cc].cy);
		};

		bd.enableLineNG = true;

		// キーボード入力系
		kc.keyinput = function(ca){
			if(ca=='z' && !this.keyPressed){ this.isZ=true; return;}
			if(k.mode==3){ return;}
			if(this.moveTCell(ca)){ return;}
			kc.key_inputLineParts(ca);
		};
		kc.key_inputLineParts = function(ca){
			if(k.mode!=1){ return false;}
			var cc = tc.getTCC();

			if     (ca=='q'){ bd.sQuC(cc,101); bd.sQnC(cc,-1); }
			else if(ca=='w'){ bd.sQuC(cc,102); bd.sQnC(cc,-1); }
			else if(ca=='e'){ bd.sQuC(cc,103); bd.sQnC(cc,-1); }
			else if(ca=='r'){ bd.sQuC(cc,  0); bd.sQnC(cc,-1); }
			else if(ca==' '){ bd.sQuC(cc,  0); bd.sQnC(cc,-1); }
			else if(ca=='a'){ bd.sQuC(cc,104); bd.sQnC(cc,-1); }
			else if(ca=='s'){ bd.sQuC(cc,105); bd.sQnC(cc,-1); }
			else if(ca=='d'){ bd.sQuC(cc,106); bd.sQnC(cc,-1); }
			else if(ca=='f'){ bd.sQuC(cc,107); bd.sQnC(cc,-1); }
			else if((ca>='0' && ca<='9') || ca=='-'){
				var old = bd.QnC(cc);
				kc.key_inputqnum(ca,99);
				if(old!=bd.QnC(cc)){ bd.sQuC(cc,0);}
			}
			else{ return false;}

			pc.paint(bd.cell[cc].cx-1, bd.cell[cc].cy-1, bd.cell[cc].cx+1, bd.cell[cc].cy+1);
			return true;
		};
		kc.keyup = function(ca){ if(ca=='z'){ this.isZ=false;}};
		kc.isZ = false;

		if(k.callmode == "pmake"){
			kp.kpgenerate = function(mode){
				this.inputcol('num','knumq','q','╋');
				this.inputcol('num','knumw','w','┃');
				this.inputcol('num','knume','e','━');
				this.inputcol('num','knumr','r',' ');
				this.inputcol('num','knum.','-','○');
				this.insertrow();
				this.inputcol('num','knuma','a','┗');
				this.inputcol('num','knums','s','┛');
				this.inputcol('num','knumd','d','┓');
				this.inputcol('num','knumf','f','┏');
				this.inputcol('empty','knumx','','');
				this.insertrow();
				this.inputcol('num','knum1','1','1');
				this.inputcol('num','knum2','2','2');
				this.inputcol('num','knum3','3','3');
				this.inputcol('num','knum4','4','4');
				this.inputcol('num','knum5','5','5');
				this.insertrow();
				this.inputcol('num','knum6','6','6');
				this.inputcol('num','knum7','7','7');
				this.inputcol('num','knum8','8','8');
				this.inputcol('num','knum9','9','9');
				this.inputcol('num','knum0','0','0');
				this.insertrow();
			};
			kp.generate(99, true, false, kp.kpgenerate.bind(kp));
			kp.kpinput = function(ca){ kc.key_inputLineParts(ca);};
		}
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_LIGHT;
		pc.linecolor = pc.linecolor_LIGHT;
		pc.fontsizeratio = 0.85;

		pc.minYdeg = 0.36;
		pc.maxYdeg = 0.74;

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);
		//	this.flushCanvasAll();

			this.drawErrorCells(x1,y1,x2,y2);

			if(k.br.IE){
				this.drawDashedGrid(x1,y1,x2,y2);
			}
			else{
				this.drawPekes(x1,y1,x2,y2,2);
				this.drawDashedGrid(x1,y1,x2,y2);
			}

			this.drawLines(x1,y1,x2,y2);

			this.drawCircle2(x1,y1,x2,y2);
			this.drawNumbers(x1,y1,x2,y2);

			this.drawPekes(x1,y1,x2,y2,1);

			this.drawLineParts(x1-2,y1-2,x2+2,y2+2);

			this.drawChassis(x1,y1,x2,y2);

			if(k.mode==1){ this.drawTCell(x1,y1,x2+1,y2+1);}else{ this.hideTCell();}
		};

		pc.drawCircle2 = function(x1,y1,x2,y2){
			var rsize  = k.cwidth*0.40;
			var rsize2 = k.cwidth*0.30;

			var clist = this.cellinside(x1-2,y1-2,x2+2,y2+2,f_true);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				if(bd.QnC(c)!=-1){
					if(bd.cell[c].cx >= x1 && x2 >= bd.cell[c].cx && bd.cell[c].cy >= y1 && y2 >= bd.cell[c].cy){
						g.strokeStyle = this.Cellcolor;
						g.beginPath();
						g.arc(bd.cell[c].px+mf(k.cwidth/2), bd.cell[c].py+mf(k.cheight/2), rsize , 0, Math.PI*2, false);
						if(this.vnop("c"+c+"_cir1_",0)){ g.stroke(); }
					}
					g.fillStyle = "white";
					g.beginPath();
					g.arc(bd.cell[c].px+mf(k.cwidth/2), bd.cell[c].py+mf(k.cheight/2), rsize2 , 0, Math.PI*2, false);
					if(this.vnop("c"+c+"_cir2_",1)){ g.fill(); }
				}
				else{ this.vhide("c"+c+"_cir1_"); this.vhide("c"+c+"_cir2_");}
			}
			this.vinc();
		};

		line.repaintParts = function(id){
			if(bd.isLPMarked(id)){
				pc.drawLineParts1( bd.cc1(id) );
				pc.drawLineParts1( bd.cc2(id) );
			}
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type, bstr){
			if(type==0 || type==1){ bstr = this.decodeLoopsp(bstr);}
		};
		enc.pzlexport = function(type){
			if(type==0)     { document.urloutput.ta.value = this.getURLbase()+"?"+k.puzzleid+this.pzldata();}
			else if(type==1){ document.urloutput.ta.value = this.getDocbase()+k.puzzleid+"/sa/q.html?"+this.pzldata();}
			else if(type==3){ document.urloutput.ta.value = this.getURLbase()+"?m+"+k.puzzleid+this.pzldata();}
		};
		enc.pzldata = function(){ return "/"+k.qcols+"/"+k.qrows+"/"+this.encodeLoopsp();};

		enc.decodeLoopsp = function(bstr){
			var c=0;
			for(var i=0;i<bstr.length;i++){
				var ca = bstr.charAt(i);

				if     (ca == '.'){ bd.sQnC(c, -2); c++;}
				else if(ca == '-'){ bd.sQnC(c, parseInt(bstr.substring(i+1,i+3),16)); c++; i+=2;}
				else if((ca >= '0' && ca <= '9')||(ca >= 'a' && ca <= 'f')){ bd.sQnC(c, parseInt(bstr.substring(i,i+1),16)); c++;}
				else if(ca >= 'g' && ca <= 'm'){ bd.sQuC(c, (parseInt(ca,36)+85)); c++;}
				else if(ca >= 'n' && ca <= 'z'){ c += (parseInt(ca,36)-22);}
				else{ c++;}

				if(c > bd.cellmax){ break;}
			}

			return bstr.substring(i,bstr.length);
		};
		enc.encodeLoopsp = function(){
			var cm="", pstr="", count=0;
			for(var i=0;i<bd.cellmax;i++){
				if     (bd.QnC(i)== -2                  ){ pstr = ".";}
				else if(bd.QnC(i)>=  0 && bd.QnC(i)<  16){ pstr =       bd.QnC(i).toString(16);}
				else if(bd.QnC(i)>= 16 && bd.QnC(i)< 256){ pstr = "-" + bd.QnC(i).toString(16);}
				else if(bd.QuC(i)>=101 && bd.QuC(i)<=107){ pstr = (bd.QuC(i)-85).toString(36);}
				else{ pstr = ""; count++;}

				if(count==0){ cm += pstr;}
				else if(pstr || count==13){ cm+=((22+count).toString(36)+pstr); count=0;}
			}
			if(count>0){ cm+=(22+count).toString(36);}

			return cm;
		};

		//---------------------------------------------------------
		fio.decodeOthers = function(array){
			if(array.length<k.qrows){ return false;}
			this.decodeCell( function(c,ca){
				if(ca == "o")     { bd.sQuC(c, 6);}
				else if(ca == "-"){ bd.sQuC(c, -2);}
				else if(ca >= "a" && ca <= "g"){ bd.sQuC(c, parseInt(ca,36)+91);}
				else if(ca != "."){ bd.sQnC(c, parseInt(ca));}
			},array.slice(0,k.qrows));
			return true;
		};
		fio.encodeOthers = function(){
			return (""+this.encodeCell( function(c){
				if     (bd.QuC(c)==6) { return "o ";}
				else if(bd.QuC(c)>=101 && bd.QuC(c)<=107) { return ""+(bd.QuC(c)-91).toString(36)+" ";}
				else if(bd.QuC(c)==-2){ return "- ";}
				else if(bd.QnC(c)!=-1){ return bd.QnC(c).toString()+" ";}
				else                  { return ". ";}
			}) );
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

			if( !this.checkAllCell(function(c){ return (line.lcntCell(c)==4 && bd.QnC(c)!=-1);}) ){
				this.setAlert('○の部分で線が交差しています。','The lines are crossed on the number.'); return false;
			}

			if( !this.checkLoopNumber() ){
				this.setAlert('異なる数字を含んだループがあります。','A loop has plural kinds of number.'); return false;
			}
			if( !this.checkNumberLoop() ){
				this.setAlert('同じ数字が異なるループに含まれています。','A kind of numbers are in differernt loops.'); return false;
			}
			if( !this.checkNumberInLoop() ){
				this.setAlert('○を含んでいないループがあります。','A loop has no numbers.'); return false;
			}

			if( !this.checkAllCell(function(c){ return (line.lcntCell(c)!=4 && bd.QuC(c)==101);}) ){
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

		ans.checkLoopNumber = function(){
			return this.checkAllLoops(function(cells){
				var number = -1;
				for(var i=0;i<cells.length;i++){
					if(bd.QnC(cells[i])>=1){
						if(number==-1){ number=bd.QnC(cells[i]);}
						else if(number!=bd.QnC(cells[i])){
							for(var c=0;c<cells.length;c++){ if(bd.QnC(cells[c])>=1){ bd.sErC([cells[c]],1);} }
							return false;
						}
					}
				}
				return true;
			});
		};
		ans.checkNumberLoop = function(){
			return this.checkAllLoops(function(cells){
				var number = -1;
				var include = function(array,val){ for(var i=0;i<array.length;i++){ if(array[i]==val) return true;} return false;};
				for(var i=0;i<cells.length;i++){ if(bd.QnC(cells[i])>=1){ number = bd.QnC(cells[i]); break;} }
				if(number==-1){ return true;}
				for(var c=0;c<bd.cellmax;c++){
					if(bd.QnC(c)==number && !include(cells,c)){
						for(var cc=0;cc<bd.cellmax;cc++){ if(bd.QnC(cc)==number){ bd.sErC([cc],1);} }
						return false;
					}
				}
				return true;
			});
		};
		ans.checkNumberInLoop = function(){
			return this.checkAllLoops(function(cells){
				for(var i=0;i<cells.length;i++){ if(bd.QnC(cells[i])!=-1){ return true;} }
				return false;
			});
		};
		ans.checkAllLoops = function(func){
			var xinfo = line.getLineInfo();
			for(var r=1;r<=xinfo.max;r++){
				if(!func(line.LineList2Clist(xinfo.room[r].idlist))){
					bd.sErBAll(2);
					bd.sErB(xinfo.room[r].idlist,1);
					return false;
				}
			}
			return true;
		};
	}
};
