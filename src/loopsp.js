//
// パズル固有スクリプト部 環状線スペシャル版 loopsp.js v3.1.9p1
//

function setting(){
	// グローバル変数の初期設定
	if(!k.qcols){ k.qcols = 10;}	// 盤面の横幅
	if(!k.qrows){ k.qrows = 10;}	// 盤面の縦幅
	k.irowake = 1;			// 0:色分け設定無し 1:色分けしない 2:色分けする

	k.iscross      = 0;		// 1:Crossが操作可能なパズル
	k.isborder     = 1;		// 1:Border/Lineが操作可能なパズル
	k.isextendcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

	k.isoutsidecross  = 0;	// 1:外枠上にCrossの配置があるパズル
	k.isoutsideborder = 0;	// 1:盤面の外枠上にborderのIDを用意する
	k.isborderCross   = 1;	// 1:線が交差するパズル
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
}

//-------------------------------------------------------------
// Puzzle個別クラスの定義
Puzzle = function(){
	this.prefix();
};
Puzzle.prototype = {
	prefix : function(){
		this.input_init();
		this.graphic_init();

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

		col.minYdeg = 0.36;
		col.maxYdeg = 0.74;
	},
	menufix : function(){
		if(k.callmode=="pmake"){ kp.defaultdisp = true;}
		menu.addRedLineToFlags();
	},
	postfix : function(){ },

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
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
			if(kc.isZ ^ menu.getVal('dispred')){ this.dispRedLine(x,y); return;}
			if(k.mode==3){
				if(this.btn.Left) this.inputLine(x,y);
				else if(this.btn.Right) this.inputpeke(x,y);
			}
		};

		mv.inputLoopsp = function(x,y){
			var cc = this.cellid(new Pos(x,y));
			if(cc==-1 || cc==this.mouseCell){ return;}

			if(cc==tc.getTCC()){
				var qs = bd.getQuesCell(cc); var qn = bd.getQnumCell(cc);
				if(this.btn.Left){
					if(qn==-1){
						if     (qs==0)           { bd.setQuesCell(cc,101);}
						else if(qs>=101&&qs<=106){ bd.setQuesCell(cc,qs+1);}
						else if(qs==107)         { bd.setQuesCell(cc,0); bd.setQnumCell(cc,-2);}
					}
					else if(qn==-2){ bd.setQnumCell(cc,1);}
					else if(qn<99) { bd.setQnumCell(cc,qn+1);}
					else{ bd.setQuesCell(cc,0); bd.setQnumCell(cc,-1);}
				}
				else if(this.btn.Right){
					if(qn==-1){
						if     (qs==0)           { bd.setQuesCell(cc,0); bd.setQnumCell(cc,-2);}
						else if(qs==101)         { bd.setQuesCell(cc,0); bd.setQnumCell(cc,-1);}
						else if(qs>=102&&qs<=107){ bd.setQuesCell(cc,qs-1);}
					}
					else if(qn==-2){ bd.setQuesCell(cc,107); bd.setQnumCell(cc,-1);}
					else if(qn>1) { bd.setQnumCell(cc,qn-1);}
					else{ bd.setQuesCell(cc,0); bd.setQnumCell(cc,-2);}
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

			if     (ca=='q'){ bd.setQuesCell(cc,101); bd.setQnumCell(cc, -1); }
			else if(ca=='w'){ bd.setQuesCell(cc,102); bd.setQnumCell(cc, -1); }
			else if(ca=='e'){ bd.setQuesCell(cc,103); bd.setQnumCell(cc, -1); }
			else if(ca=='r'){ bd.setQuesCell(cc,  0); bd.setQnumCell(cc, -1); }
			else if(ca==' '){ bd.setQuesCell(cc,  0); bd.setQnumCell(cc, -1); }
			else if(ca=='a'){ bd.setQuesCell(cc,104); bd.setQnumCell(cc, -1); }
			else if(ca=='s'){ bd.setQuesCell(cc,105); bd.setQnumCell(cc, -1); }
			else if(ca=='d'){ bd.setQuesCell(cc,106); bd.setQnumCell(cc, -1); }
			else if(ca=='f'){ bd.setQuesCell(cc,107); bd.setQnumCell(cc, -1); }
			else if((ca>='0' && ca<='9') || ca=='-'){
				var old = bd.getQnumCell(cc);
				kc.key_inputqnum(ca,99);
				if(old!=bd.getQnumCell(cc)){ bd.setQuesCell(cc,0);}
			}
			else{ return false;}

			pc.paint(bd.cell[cc].cx-1, bd.cell[cc].cy-1, bd.cell[cc].cx+1, bd.cell[cc].cy+1);
			return true;
		};
		kc.keyup = function(ca){ if(ca=='z'){ this.isZ=false;}};
		kc.isZ = false;

		if(k.callmode == "pmake"){
			kp.generate(99, true, false, this.kpgenerate);
			kp.kpinput = function(ca){ kc.key_inputLineParts(ca);};
		}
	},

	kpgenerate : function(mode){
		kp.inputcol('num','knumq','q','╋');
		kp.inputcol('num','knumw','w','┃');
		kp.inputcol('num','knume','e','━');
		kp.inputcol('num','knumr','r',' ');
		kp.inputcol('num','knum.','-','○');
		kp.insertrow();
		kp.inputcol('num','knuma','a','┗');
		kp.inputcol('num','knums','s','┛');
		kp.inputcol('num','knumd','d','┓');
		kp.inputcol('num','knumf','f','┏');
		kp.inputcol('empty','knumx','','');
		kp.insertrow();
		kp.inputcol('num','knum1','1','1');
		kp.inputcol('num','knum2','2','2');
		kp.inputcol('num','knum3','3','3');
		kp.inputcol('num','knum4','4','4');
		kp.inputcol('num','knum5','5','5');
		kp.insertrow();
		kp.inputcol('num','knum6','6','6');
		kp.inputcol('num','knum7','7','7');
		kp.inputcol('num','knum8','8','8');
		kp.inputcol('num','knum9','9','9');
		kp.inputcol('num','knum0','0','0');
		kp.insertrow();
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.BDlinecolor = "rgb(127, 127, 127)";
		pc.linecolor = "rgb(0, 192, 0)";
		pc.errcolor1 = "rgb(192, 0, 0)";
		pc.fontsizeratio = 0.85;

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);
		//	this.flushCanvasAll();

			this.drawErrorCells(x1,y1,x2,y2);

			if(k.br.IE){
				this.drawBDline2(x1,y1,x2,y2);
			}
			else{
				this.drawPekes(x1,y1,x2,y2,2);
				this.drawBDline2(x1,y1,x2,y2);
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
				if(bd.getQnumCell(c)!=-1){
					if(bd.cell[c].cx >= x1 && x2 >= bd.cell[c].cx && bd.cell[c].cy >= y1 && y2 >= bd.cell[c].cy){
						g.strokeStyle = this.Cellcolor;
						g.beginPath();
						g.arc(bd.cell[c].px()+int(k.cwidth/2), bd.cell[c].py()+int(k.cheight/2), rsize , 0, Math.PI*2, false);
						if(this.vnop("c"+c+"_cir1_",0)){ g.stroke(); }
					}
					g.fillStyle = "white";
					g.beginPath();
					g.arc(bd.cell[c].px()+int(k.cwidth/2), bd.cell[c].py()+int(k.cheight/2), rsize2 , 0, Math.PI*2, false);
					if(this.vnop("c"+c+"_cir2_",1)){ g.fill(); }
				}
				else{ this.vhide("c"+c+"_cir1_"); this.vhide("c"+c+"_cir2_");}
			}
			this.vinc();
		};

		col.repaintParts = function(id){
			if(bd.isLPMarked(id)){
				var bx = bd.border[id].cx; var by = bd.border[id].cy;
				pc.drawLineParts1( bd.getcnum(int((bx-by%2)/2), int((by-bx%2)/2)) );
				pc.drawLineParts1( bd.getcnum(int((bx+by%2)/2), int((by+bx%2)/2)) );
			}
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	pzlinput : function(type, bstr){
		if(type==0 || type==1){ bstr = this.decodeLoopsp(bstr);}
	},
	pzloutput : function(type){
		if(type==0)     { document.urloutput.ta.value = enc.getURLbase()+"?"+k.puzzleid+this.pzldata();}
		else if(type==1){ document.urloutput.ta.value = enc.getDocbase()+k.puzzleid+"/sa/q.html?"+this.pzldata();}
		else if(type==3){ document.urloutput.ta.value = enc.getURLbase()+"?m+"+k.puzzleid+this.pzldata();}
	},
	pzldata  : function(){ return "/"+k.qcols+"/"+k.qrows+"/"+this.encodeLoopsp();},

	//---------------------------------------------------------
	decodeLoopsp : function(bstr){
		var i, ca, c;
		c = 0;
		for(i=0;i<bstr.length;i++){
			ca = bstr.charAt(i);

			if     (ca == '.'){ bd.setQnumCell(c, -2); c++;}
			else if(ca == '-'){ bd.setQnumCell(c, parseInt(bstr.substring(i+1,i+3),16)); c++; i+=2;}
			else if((ca >= '0' && ca <= '9')||(ca >= 'a' && ca <= 'f')){ bd.setQnumCell(c, parseInt(bstr.substring(i,i+1),16)); c++;}
			else if(ca >= 'g' && ca <= 'm'){ bd.setQuesCell(c, (parseInt(ca,36)+85)); c++;}
			else if(ca >= 'n' && ca <= 'z'){ c += (parseInt(ca,36)-22);}
			else{ c++;}

			if(c > bd.cell.length){ break;}
		}

		return bstr.substring(i,bstr.length);
	},
	encodeLoopsp : function(){
		var count, pass, i;
		var cm="";
		var pstr="";

		count=0;
		for(i=0;i<bd.cell.length;i++){
			if     (bd.getQnumCell(i)== -2                          ){ pstr = ".";}
			else if(bd.getQnumCell(i)>=  0 && bd.getQnumCell(i)<  16){ pstr =       bd.getQnumCell(i).toString(16);}
			else if(bd.getQnumCell(i)>= 16 && bd.getQnumCell(i)< 256){ pstr = "-" + bd.getQnumCell(i).toString(16);}
			else if(bd.getQuesCell(i)>=101 && bd.getQuesCell(i)<=107){ pstr = (bd.getQuesCell(i)-85).toString(36);}
			else{ pstr = ""; count++;}

			if(count==0){ cm += pstr;}
			else if(pstr || count==13){ cm+=((22+count).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm+=(22+count).toString(36);}

		return cm;
	},

	//---------------------------------------------------------
	decodeOthers : function(array){
		if(array.length<k.qrows){ return false;}
		fio.decodeCell( function(c,ca){
			if(ca == "o")     { bd.setQuesCell(c, 6);}
			else if(ca == "-"){ bd.setQuesCell(c, -2);}
			else if(ca >= "a" && ca <= "g"){ bd.setQuesCell(c, parseInt(ca,36)+91);}
			else if(ca != "."){ bd.setQnumCell(c, parseInt(ca));}
		},array.slice(0,k.qrows));
		return true;
	},
	encodeOthers : function(){
		return (""+fio.encodeCell( function(c){
			if     (bd.getQuesCell(c)==6) { return "o ";}
			else if(bd.getQuesCell(c)>=101 && bd.getQuesCell(c)<=107) { return ""+(bd.getQuesCell(c)-91).toString(36)+" ";}
			else if(bd.getQuesCell(c)==-2){ return "- ";}
			else if(bd.getQnumCell(c)!=-1){ return bd.getQnumCell(c).toString()+" ";}
			else                          { return ". ";}
		}) );
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	check : function(){

		if( !ans.checkenableLineParts(1) ){
			ans.setAlert('最初から引かれている線があるマスに線が足されています。','Lines are added to the cell that the mark lie in by the question.'); return false;
		}

		if( !ans.checkLcntCell(3) ){
			ans.setAlert('分岐している線があります。','There is a branched line.'); return false;
		}

		if( !this.checkLineCircle() ){
			ans.setAlert('○の部分で線が交差しています。','The lines are crossed on the number.'); return false;
		}

		if( !this.checkLoopNumber() ){
			ans.setAlert('異なる数字を含んだループがあります。','A loop has plural kinds of number.'); return false;
		}
		if( !this.checkNumberLoop() ){
			ans.setAlert('同じ数字が異なるループに含まれています。','A kind of numbers are in differernt loops.'); return false;
		}
		if( !this.checkLoopCircle() ){
			ans.setAlert('○を含んでいないループがあります。','A loop has no numbers.'); return false;
		}

		if( !this.checkLPPlus() ){
			ans.setAlert('┼のマスから線が4本出ていません。','A cross-joint cell doesn\'t have four-way lines.'); return false;
		}

		if( !ans.checkLcntCell(0) ){
			ans.setAlert('線が引かれていないマスがあります。','There is an empty cell.'); return false;
		}
		if( !ans.checkLcntCell(1) ){
			ans.setAlert('途中で途切れている線があります。','There is a dead-end line.'); return false;
		}

		return true;
	},

	checkLoopNumber : function(){
		return this.checkAllLoops(function(cells){
			var number = -1;
			for(var i=0;i<cells.length;i++){
				if(bd.getQnumCell(cells[i])>=1){
					if(number==-1){ number=bd.getQnumCell(cells[i]);}
					else if(number!=bd.getQnumCell(cells[i])){
						for(var c=0;c<cells.length;c++){ if(bd.getQnumCell(cells[c])>=1){ bd.setErrorCell([cells[c]],1);} }
						return false;
						}
				}
			}
			return true;
		});
	},
	checkNumberLoop : function(){
		return this.checkAllLoops(function(cells){
			var number = -1;
			var include = function(array,val){ for(var i=0;i<array.length;i++){ if(array[i]==val) return true;} return false;};
			for(var i=0;i<cells.length;i++){ if(bd.getQnumCell(cells[i])>=1){ number = bd.getQnumCell(cells[i]); break;} }
			if(number==-1){ return true;}
			for(var c=0;c<bd.cell.length;c++){
				if(bd.getQnumCell(c)==number && !include(cells,c)){
					for(var cc=0;cc<bd.cell.length;cc++){ if(bd.getQnumCell(cc)==number){ bd.setErrorCell([cc],1);} }
					return false;
				}
			}
			return true;
		});
	},
	checkLoopCircle : function(){
		return this.checkAllLoops(function(cells){
			for(var i=0;i<cells.length;i++){ if(bd.getQnumCell(cells[i])!=-1){ return true;} }
			return false;
		});
	},
	checkAllLoops : function(func){
		var xarea = ans.searchXarea();
		for(var r=1;r<=xarea.max;r++){
			if(!func(this.LineList2Cell(xarea.room[r]))){
				bd.setErrorBorder(bd.borders,2);
				bd.setErrorBorder(xarea.room[r],1);
				return false;
			}
		}
		return true;
	},

	LineList2Cell : function(list){
		var cells = new Array();
		var include = function(array,val){ for(var i=0;i<array.length;i++){ if(array[i]==val) return true;} return false;};
		for(var i=0;i<list.length;i++){
			var cc1 = bd.getcnum(int((bd.border[list[i]].cx-(bd.border[list[i]].cy%2))/2), int((bd.border[list[i]].cy-(bd.border[list[i]].cx%2))/2) );
			var cc2 = bd.getcnum(int((bd.border[list[i]].cx+(bd.border[list[i]].cy%2))/2), int((bd.border[list[i]].cy+(bd.border[list[i]].cx%2))/2) );

			if(cc1!=-1 && !include(cells,cc1)){ cells.push(cc1);}
			if(cc2!=-1 && !include(cells,cc2)){ cells.push(cc2);}
		}
		return cells.sort(function(a,b){ return (a>b?1:-1);});
	},

	checkLineCircle : function(){
		for(var c=0;c<bd.cell.length;c++){
			if(ans.lcntCell(c)==4 && bd.getQnumCell(c)!=-1){ bd.setErrorCell([c],1); return false;}
		}
		return true;
	},
	checkLPPlus : function(){
		for(var c=0;c<bd.cell.length;c++){
			if(ans.lcntCell(c)!=4 && bd.getQuesCell(c)==101){ bd.setErrorCell([c],1); return false;}
		}
		return true;
	}
};
