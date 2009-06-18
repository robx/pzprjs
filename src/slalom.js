//
// パズル固有スクリプト部 スラローム版 slalom.js v3.1.9p2
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
	k.isborderCross   = 0;	// 1:線が交差するパズル
	k.isCenterLine    = 1;	// 1:マスの真ん中を通る線を回答として入力するパズル
	k.isborderAsLine  = 0;	// 1:境界線をlineとして扱う

	k.dispzero      = 0;	// 1:0を表示するかどうか
	k.isDispHatena  = 0;	// 1:qnumが-2のときに？を表示する
	k.isAnsNumber   = 0;	// 1:回答に数字を入力するパズル
	k.isArrowNumber = 0;	// 1:矢印つき数字を入力するパズル
	k.isOneNumber   = 0;	// 1:部屋の問題の数字が1つだけ入るパズル
	k.isDispNumUL   = 0;	// 1:数字をマス目の左上に表示するパズル(0はマスの中央)
	k.NumberWithMB  = 0;	// 1:回答の数字と○×が入るパズル

	k.BlackCell     = 1;	// 1:黒マスを入力するパズル
	k.NumberIsWhite = 1;	// 1:数字のあるマスが黒マスにならないパズル
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

		this.hinfo = new Hurdle();
		this.hinfo.generateAll();

		this.startid = 0;

		if(k.callmode=="pplay"){
			base.setExpression("　左ドラッグで線が、右クリックで×が入力できます。",
							   " Left Button Drag to input black cells, Right Click to input a cross.");
		}
		else{
			base.setExpression("　問題の記号はQWEの各キーで入力、Rキーで消去できます。数字は点線上でキーボード入力です。○はSキーか、マウスドラッグで移動出来ます。黒マスはマウスの左クリック、点線はドラッグでも入力できます。",
							   " Press each QWE key to input question marks and R key to erase a mark. Type number key on dotted line to input numbers. Type S key or Left Button Drag to move circle. Left Click to input black cells. Left Button Drag out of circles to also input dotted line.");
		}
		base.setTitle("スラローム","Slalom");
		base.setFloatbgcolor("rgb(96, 96, 255)");
	},
	menufix : function(){
		menu.addRedLineToFlags();
	},
	postfix : function(){
		menu.ex.adjustSpecial = this.adjustSpecial;
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(x,y){
			if(kc.isZ ^ menu.getVal('dispred')){ this.dispRedLine(x,y); return;}
			if(k.mode==1){ this.inputGate(x,y);}
			else if(k.mode==3){
				if(this.btn.Left) this.inputLine(x,y);
				else if(this.btn.Right) this.inputpeke(x,y);
			}
		};
		mv.mouseup = function(x,y){
			if(k.mode==1){
				if(this.inputData==10){ this.inputStartid_up(x,y); }
				else if(this.notInputted() && !kp.enabled()){ this.inputQues_slalom(x,y);}
				else if(this.notInputted()){ kp.display(x,y);}
			}
		};
		mv.mousemove = function(x,y){
			if(kc.isZ ^ menu.getVal('dispred')){ this.dispRedLine(x,y); return;}
			if(k.mode==1){ this.inputGate(x,y);}
			else if(k.mode==3){
				if(this.btn.Left) this.inputLine(x,y);
				else if(this.btn.Right) this.inputpeke(x,y);
			}
		};

		mv.inputQues_slalom = function(x,y){
			var cc = this.cellid(new Pos(x,y));
			if(cc==-1){ return;}

			if(cc!=tc.getTCC()){
				var cc0 = tc.getTCC(); tc.setTCC(cc);
				pc.paint(bd.cell[cc0].cx-1, bd.cell[cc0].cy-1, bd.cell[cc0].cx, bd.cell[cc0].cy);
			}
			else{
				if     (this.btn.Left ){ bd.setQuesCell(cc, {0:1,1:21,21:22,22:0}[bd.getQuesCell(cc)]);}
				else if(this.btn.Right){ bd.setQuesCell(cc, {0:22,22:21,21:1,1:0}[bd.getQuesCell(cc)]);}
			}
			puz.hinfo.generateAll();
			pc.drawNumbers_slalom(bd.cell[cc].cx,0,bd.cell[cc].cx,k.qcols-1);
			pc.drawNumbers_slalom(0,bd.cell[cc].cy,k.qrows-1,bd.cell[cc].cy);

			pc.paint(bd.cell[cc].cx, bd.cell[cc].cy, bd.cell[cc].cx+1, bd.cell[cc].cy+1);
			pc.dispnumStartpos(puz.startid);
		};
		mv.inputStartid_up = function(x,y){
			this.inputData = -1;
			var cc0 = puz.startid;
			pc.paint(bd.cell[cc0].cx, bd.cell[cc0].cy, bd.cell[cc0].cx, bd.cell[cc0].cy);
		};
		mv.inputGate = function(x,y){
			var pos = this.crosspos(new Pos(x,y),0.30);
			var cc  = this.cellid(new Pos(x,y));
			if(cc==-1){ return;}
			if(pos.x==this.firstPos.x && pos.y==this.firstPos.y && cc==this.mouseCell){ return;}

			if(this.inputData==-1){
				if(puz.startid==cc){ this.inputData=10;}
				if     (Math.abs(pos.y-this.firstPos.y)==1){ this.inputData=21;}
				else if(Math.abs(pos.x-this.firstPos.x)==1){ this.inputData=22;}
				if(bd.getQuesCell(cc)==this.inputData){ this.inputData=0;}
			}
			else if(this.inputData==10){
				if(bd.getQuesCell(cc)==1){ return;}
				var cc0 = puz.startid;
				puz.startid=cc;
				pc.paint(bd.cell[cc0].cx, bd.cell[cc0].cy, bd.cell[cc0].cx, bd.cell[cc0].cy);
			}
			else{
				if     (this.inputData!=21 && Math.abs(pos.y-this.firstPos.y)==1){ return;}
				else if(this.inputData!=22 && Math.abs(pos.x-this.firstPos.x)==1){ return;}
			}

			if((this.inputData==0 || this.inputData==21 || this.inputData==22) && bd.getQuesCell(cc)!=this.inputData){
				bd.setQuesCell(cc,this.inputData);
				puz.hinfo.generateAll();
				pc.drawNumbers_slalom(bd.cell[cc].cx,0,bd.cell[cc].cx,k.qcols-1);
				pc.drawNumbers_slalom(0,bd.cell[cc].cy,k.qrows-1,bd.cell[cc].cy);
			}

			this.firstPos = pos;
			this.mouseCell = cc;
			pc.paint(bd.cell[cc].cx, bd.cell[cc].cy, bd.cell[cc].cx+1, bd.cell[cc].cy+1);
			pc.dispnumStartpos(puz.startid);
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(ca=='z' && !this.keyPressed){ this.isZ=true; return;}
			if(k.mode==3){ return;}
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum_slalom(ca,99);
		};
		kc.key_inputqnum_slalom = function(ca){
			var cc = tc.getTCC();

			if(ca=='q'||ca=='w'||ca=='e'||ca=='r'||ca=='s'||ca==' '){
				var old=bd.getQuesCell(cc), newques=-1;
				if     (ca=='q'){ newques= 1;}
				else if(ca=='w'){ newques=21;}
				else if(ca=='e'){ newques=22;}
				else if(ca=='r'||ca==' '){ newques= 0;}
				else if(ca=='s'){ puz.inputstartid(cc); return;}
				else{ return;}
				if(old==newques){ return;}

				bd.setQuesCell(cc,newques);
				if(old==21||old==22||newques==21||newques==22){ puz.hinfo.generateAll();}

				var cx=bd.cell[cc].cx, cy=bd.cell[cc].cy;
				pc.drawNumbers_slalom(cx,0,cx,k.qcols-1);
				pc.drawNumbers_slalom(0,cy,k.qrows-1,cy);
				pc.paint(cx,cy,cx+1,cy+1);
				pc.dispnumStartpos(puz.startid);
			}
			else{
				if(bd.getQuesCell(cc)==21 || bd.getQuesCell(cc)==22){
					var max = 99;
					if('0'<=ca && ca<='9'){
						var num = parseInt(ca);
						var old = puz.hinfo.getGateNumber(cc);

						if(old<=0 || this.prev!=cc){ if(num<=max){ puz.hinfo.setGateNumber(cc,num);} }
						else{
							if(old*10+num<=max){ puz.hinfo.setGateNumber(cc,old*10+num);}
							else   if(num<=max){ puz.hinfo.setGateNumber(cc,num);}
						}
					}
					else if(ca=='-'){ puz.hinfo.setGateNumber(cc,-1);}
					else{ return;}

					var clist = puz.hinfo.getGatePole(puz.hinfo.getGateid(cc));
					for(var i=0;i<clist.length;i++){ pc.dispnumCell_slalom(clist[i]);}
				}
				this.prev = cc;
				return;
			}
		};
		kc.keyup = function(ca){ if(ca=='z'){ this.isZ=false;}};
		kc.isZ = false;

		if(k.callmode == "pmake"){
			kp.generate(99, true, false, this.kpgenerate);
			kp.imgCR = [4,1];
			kp.kpinput = function(ca){
				kc.key_inputqnum_slalom(ca);
			};
		}
	},
	inputstartid : function(cc){
		if(cc!=puz.startid){
			var cc0 = puz.startid;
			puz.startid = cc;
			pc.paint(bd.cell[cc0].cx, bd.cell[cc0].cy, bd.cell[cc0].cx, bd.cell[cc0].cy);
			pc.paint(bd.cell[cc].cx, bd.cell[cc].cy, bd.cell[cc].cx, bd.cell[cc].cy);
		}
	},

	kpgenerate : function(mode){
		kp.inputcol('image','knumq','q',[0,0]);
		kp.inputcol('image','knums','s',[1,0]);
		kp.inputcol('image','knumw','w',[2,0]);
		kp.inputcol('image','knume','e',[3,0]);
		kp.inputcol('num','knumr','r',' ');
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
		kp.inputcol('num','knum.','-','-');
		kp.inputcol('num','knum_',' ',' ');
		kp.insertrow();
	},

	adjustSpecial : function(type,key){
		um.disableRecord();
		var cx=bd.cell[puz.startid].cx, cy=bd.cell[puz.startid].cy;
		switch(type){
		case 1: // 上下反転
			puz.startid = bd.getcnum(cx,k.qrows-1-cy);
			break;
		case 2: // 左右反転
			puz.startid = bd.getcnum(k.qcols-1-cx,cy);
			break;
		case 3: // 右90°反転
			puz.startid = bd.getcnum2(k.qrows-1-cy,cx,k.qrows,k.qcols);
			break;
		case 4: // 左90°反転
			puz.startid = bd.getcnum2(cy,k.qcols-1-cx,k.qrows,k.qcols);
			break;
		case 5: // 盤面拡大
			break;
		case 6: // 盤面縮小
			if     (key=='up' && cy==0        ){ puz.startid = bd.getcnum(cx  ,cy+1);}
			else if(key=='dn' && cy==k.qrows-1){ puz.startid = bd.getcnum(cx  ,cy-1);}
			else if(key=='lt' && cx==0        ){ puz.startid = bd.getcnum(cx+1,cy  );}
			else if(key=='rt' && cx==k.qcols-1){ puz.startid = bd.getcnum(cx-1,cy  );}
			break;
		}
		um.enableRecord();
	},
	adjustSpecial2 : function(type,key){
		puz.hinfo.generateAll();
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.BDlinecolor = "rgb(127, 127, 127)";
		pc.linecolor = "rgb(32, 32, 255)";	// 色分けなしの場合
		pc.pekecolor = "rgb(0, 160, 0)";
		pc.errlinecolor2 = "rgb(160, 150, 255)";

		pc.errbcolor1 = "rgb(255,127,127)";

		pc.fontcolor = "white";
		pc.fontErrcolor = "white";

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);

			this.drawErrorCells(x1,y1,x2,y2);

			this.drawBDline2(x1,y1,x2,y2);

			this.drawGates(x1,y1,x2,y2)
			this.drawBCells_slalom(x1,y1,x2,y2);
			this.drawNumbers_slalom(x1,y1,x2,y2);

			this.drawPekes(x1,y1,x2,y2,1);
			this.drawLines(x1,y1,x2,y2);

			this.drawStartpos(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);

			if(k.mode==1){ this.drawTCell(x1,y1,x2+1,y2+1);}else{ this.hideTCell();}
		};

		pc.drawBCells_slalom = function(x1,y1,x2,y2){
			var clist = this.cellinside(x1,y1,x2,y2,f_true);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				if(bd.getQuesCell(c)==1){
					if(bd.getErrorCell(c)==1){ g.fillStyle = this.errcolor1;}
					else{ g.fillStyle = this.Cellcolor;}

					if(this.vnop("c"+c+"_full_",1)){ g.fillRect(bd.cell[c].px(), bd.cell[c].py(), k.cwidth+1, k.cheight+1);}
					this.dispnumCell_slalom(c);
				}
				else{ this.vhide("c"+c+"_full_");}
			}
			this.vinc();
		};

		pc.drawNumbers_slalom = function(x1,y1,x2,y2){
			var clist = this.cellinside(x1,y1,x2,y2,f_true);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				if(bd.getQuesCell(c)!=1){ if(bd.cell[c].numobj){ bd.cell[c].numobj.hide();} continue;}
				this.dispnumCell_slalom(c);
			}
			this.vinc();
		};
		pc.dispnumCell_slalom = function(c){
			var num = puz.hinfo.getPoleNumber(c);
			if(num<=0){ if(bd.cell[c].numobj){ bd.cell[c].numobj.hide();} return;}
			if(!bd.cell[c].numobj){ bd.cell[c].numobj = this.CreateDOMAndSetNop();}
			this.dispnumCell1(c, bd.cell[c].numobj, 1, ""+num, 0.8, "white");
		};

		pc.drawGates = function(x1,y1,x2,y2){
			var lw = (int(k.cwidth/10)>=3?int(k.cwidth/10):3); //LineWidth
			var lm = int((lw-1)/2)+1; //LineMargin
			var ll = lw*1.1;	//LineLength

			var clist = this.cellinside(x1,y1,x2,y2,f_true);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				if(bd.getErrorCell(c)==4){ g.fillStyle = this.errcolor1;}
				else{ g.fillStyle = this.Cellcolor;}

				for(var j=bd.cell[c].py();j<bd.cell[c].py()+k.cheight;j+=ll*2){ //たて
					if(bd.getQuesCell(c)==21){
						if(this.vnop("c"+c+"_dl21_"+j,1)){ g.fillRect(bd.cell[c].px()+int(k.cwidth/2)-lm+1, j, lw, ll);}
					}
					else{ this.vhide("c"+c+"_dl21_"+j);}
				}

				for(var j=bd.cell[c].px();j<bd.cell[c].px()+k.cwidth;j+=ll*2){ //よこ
					if(bd.getQuesCell(c)==22){
						if(this.vnop("c"+c+"_dl22_"+j,1)){ g.fillRect(j, bd.cell[c].py()+int(k.cheight/2)-lm+1, ll, lw);}
					}
					else{ this.vhide("c"+c+"_dl22_"+j);}
				}
			}
		};

		pc.drawStartpos = function(x1,y1,x2,y2){
			var rsize  = k.cwidth*0.40;
			var rsize2 = k.cwidth*0.36;

			var c = puz.startid;
			if(bd.cell[c].cx<x1-2 || x2+2<bd.cell[c].cx || bd.cell[c].cy<y1-2 || y2+2<bd.cell[c].cy){ return;}

			this.vdel(["sposa_","sposb_"]);

			var px=bd.cell[c].px()+int(k.cwidth/2), py=bd.cell[c].py()+int(k.cheight/2);

			g.fillStyle = this.Cellcolor;
			g.beginPath();
			g.arc(px, py, k.cwidth*0.45, 0, Math.PI*2, false);
			if(this.vnop("sposa_",1)){ g.fill(); }

			if(mv.inputData==10){ g.fillStyle = this.errbcolor1;}
			else{ g.fillStyle = "white";}
			g.beginPath();
			g.arc(px, py, k.cwidth*0.40, 0, Math.PI*2, false);
			if(this.vnop("sposb_",1)){ g.fill(); }

			this.dispnumStartpos(c);

			this.vinc();
		};
		pc.dispnumStartpos = function(c){
			var num = puz.hinfo.max;
			if(num<0){ if(bd.cell[c].numobj){ bd.cell[c].numobj.hide();} return;}
			if(!bd.cell[c].numobj){ bd.cell[c].numobj = this.CreateDOMAndSetNop();}
			var fontratio = (num<10?0.75:0.66);
			this.dispnumCell1(c, bd.cell[c].numobj, 1, ""+num, fontratio, "black");
		};

		col.repaintParts = function(id){
			var bx = bd.border[id].cx; var by = bd.border[id].cy;
			pc.drawStartpos(int((bx-by%2)/2),int((by-bx%2)/2),int((bx-by%2)/2),int((by-bx%2)/2));
			pc.drawStartpos(int((bx+by%2)/2),int((by+bx%2)/2),int((bx+by%2)/2),int((by+bx%2)/2));
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	pzlinput : function(type, bstr){
		if(type==0 || type==1){ bstr = this.decodeSlalom(bstr);}
	},

	pzloutput : function(type){
		if(type==0)     { document.urloutput.ta.value = enc.getURLbase()+"?"+k.puzzleid+this.pzldata();}
		else if(type==1){ document.urloutput.ta.value = enc.getDocbase()+k.puzzleid+"/sa/m.html?"+this.pzldata();}
		else if(type==3){ document.urloutput.ta.value = enc.getURLbase()+"?m+"+k.puzzleid+this.pzldata();}
	},
	pzldata : function(){
		return "/"+k.qcols+"/"+k.qrows+"/"+this.encodeSlalom();
	},

	//---------------------------------------------------------
	decodeSlalom : function(bstr){
		var array = bstr.split("/");

		var c=0, i=0;
		for(i=0;i<array[0].length;i++){
			var ca = array[0].charAt(i);

			if     (ca=='1'){ bd.setQuesCell(c,  1); c++;}
			else if(ca=='2'){ bd.setQuesCell(c, 21); c++;}
			else if(ca=='3'){ bd.setQuesCell(c, 22); c++;}
			else if(enc.include(ca,"4","9")||enc.include(ca,"a","z")){ c += (parseInt(ca,36)-3);}
			else{ c++;}

			if(c >= bd.cell.length){ break;}
		}
		puz.hinfo.generateAll();

		var i0 = i+1, r = 1;
		for(i=i0;i<array[0].length;i++){
			var ca = array[0].charAt(i);

			if(enc.include(ca,"0","9")||enc.include(ca,"a","f")){
				puz.hinfo.setGateNumber(puz.hinfo.data[r].clist[0], parseInt(bstr.substring(i  ,i+1),16)); r++;
			}
			else if(ca == '-'){
				puz.hinfo.setGateNumber(puz.hinfo.data[r].clist[0], parseInt(bstr.substring(i+1,i+3),16)); r++; i+=2;
			}
			else if(enc.include(ca,"g","z")){ r+=(parseInt(ca,36)-15);}
			else{ r++;}

			if(r > puz.hinfo.max){ break;}
		}

		puz.startid = parseInt(array[1]);

		return array[0].substring(i,array[0].length);
	},
	encodeSlalom : function(type){
		var cm="", count=0;
		for(i=0;i<bd.cell.length;i++){
			var pstr="";
			if     (bd.getQuesCell(i) == 1){ pstr = "1";}
			else if(bd.getQuesCell(i) ==21){ pstr = "2";}
			else if(bd.getQuesCell(i) ==22){ pstr = "3";}
			else{ pstr = ""; count++;}

			if(count==0){ cm += pstr;}
			else if(pstr || count==32){ cm+=((3+count).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm+=(3+count).toString(36);}

		puz.hinfo.generateAll();
		count=0;
		for(var r=1;r<=puz.hinfo.max;r++){
			var pstr = "";
			var val = puz.hinfo.getGateNumber(puz.hinfo.data[r].clist[0]);

			if     (val>= 0 && val< 16){ pstr =       val.toString(16);}
			else if(val>=16 && val<256){ pstr = "-" + val.toString(16);}
			else{ count++;}

			if(count==0){ cm += pstr;}
			else if(pstr || count==20){ cm+=((15+count).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm+=(15+count).toString(36);}

		cm += ("/"+puz.startid.toString());

		return cm;
	},

	//---------------------------------------------------------
	decodeOthers : function(array){
		if(array.length<k.qrows){ return false;}
		fio.decodeCell( function(c,ca){
			if     (ca == "#"){ bd.setQuesCell(c,1);}
			else if(ca == "o"){ puz.startid=c;}
			else if(ca != "."){
				if     (ca.charAt(0)=="i"){ bd.setQuesCell(c,21);}
				else if(ca.charAt(0)=="w"){ bd.setQuesCell(c,22);}
				if(ca.length>1){ bd.setQnumCell(c, parseInt(ca.substring(1,ca.length)));}
			}
		},array.slice(0,k.qrows));
		puz.hinfo.generateAll();
		return true;
	},
	encodeOthers : function(){
		return (""+fio.encodeCell( function(c){
			if     (puz.startid==c)       { return "o ";}
			else if(bd.getQuesCell(c)== 1){ return "# ";}
			else if(bd.getQuesCell(c)==21 && bd.getQnumCell(c)==-1){ return "i ";}
			else if(bd.getQuesCell(c)==21 && bd.getQnumCell(c)>= 0){ return "i"+bd.getQnumCell(c).toString()+" ";}
			else if(bd.getQuesCell(c)==22 && bd.getQnumCell(c)==-1){ return "w ";}
			else if(bd.getQuesCell(c)==22 && bd.getQnumCell(c)>= 0){ return "w"+bd.getQnumCell(c).toString()+" ";}
			else{ return ". ";}
		}) );
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	check : function(){
//		ans.performAsLine = true;

		if( !this.checkBCellLine() ){
			ans.setAlert('黒マスに線が通っています。','A line is over a black cell.'); return false;
		}

		if( !ans.checkLcntCell(4) ){
			ans.setAlert('交差している線があります。','There is a crossing line.'); return false;
		}

		if( !ans.checkLcntCell(3) ){
			ans.setAlert('分岐している線があります。','There is a branch line.'); return false;
		}

		if( !this.checkGateLine(1) ){
			ans.setAlert('線が２回以上通過している旗門があります。','A line goes through a gate twice or more.'); return false;
		}

		if( !this.checkStartid() ){
			ans.setAlert('○から線が２本出ていません。','A line goes through a gate twice or more.'); return false;
		}

		if( !this.checkGateNumber() ){
			ans.setAlert('旗門を通過する順番が間違っています。','The order of passing the gate is wrong.'); return false;
		}

		if( !ans.checkLcntCell(1) ){
			ans.setAlert('線が途中で途切れています。','There is a dead-end line.'); return false;
		}

		if( !ans.checkOneLoop() ){
			ans.setAlert('輪っかが一つではありません。','There are two or more loops.'); return false;
		}

		if( !this.checkGateLine(2) ){
			ans.setAlert('線が通過していない旗門があります。','There is a gate that the line is not passing.'); return false;
		}

		return true;
	},
	check1st : function(){ return ans.checkLcntCell(1);},

	checkStartid : function(){
		if(ans.lcntCell(this.startid)!=2){
			bd.setErrorCell(this.startid,1);
			return false;
		}
		return true;
	},
	checkBCellLine : function(){
		for(var c=0;c<bd.cell.length;c++){
			if(bd.getQuesCell(c)==1 && ans.lcntCell(c)>0){
				bd.setErrorCell([c],1);
				return false;
			}
		}
		return true;
	},
	checkGateLine : function(type){
		for(var r=1;r<=this.hinfo.max;r++){
			var cnt=0;
			for(var i=0;i<this.hinfo.data[r].clist.length;i++){
				if(ans.lcntCell(this.hinfo.data[r].clist[i])>0){ cnt++;}
			}
			if((type==1 && cnt>1)||(type==2 && cnt==0)){
				bd.setErrorCell(this.hinfo.data[r].clist, 4);
				bd.setErrorCell(this.hinfo.getGatePole(r),1)
				return false;
			}
		}
		return true;
	},
	checkGateNumber : function(){
		var sid = new Array();
		if(bd.getLineBorder(bd.cell[this.startid].rb())==1){ sid.push({id:bd.cell[this.startid].rb(),dir:4});}
		if(bd.getLineBorder(bd.cell[this.startid].db())==1){ sid.push({id:bd.cell[this.startid].db(),dir:2});}
		if(bd.getLineBorder(bd.cell[this.startid].lb())==1){ sid.push({id:bd.cell[this.startid].lb(),dir:3});}
		if(bd.getLineBorder(bd.cell[this.startid].ub())==1){ sid.push({id:bd.cell[this.startid].ub(),dir:1});}

		for(var i=0;i<sid.length;i++){
			var bx=bd.border[sid[i].id].cx, by=bd.border[sid[i].id].cy;
			var dir=sid[i].dir, ordertype=-1, passing=0;

			while(1){
				switch(dir){ case 1: by--; break; case 2: by++; break; case 3: bx--; break; case 4: bx++; break;}
				if((bx+by)%2==0){
					var cc = bd.getcnum(int(bx/2),int(by/2));
					if(cc==this.startid){ return true;} // ちゃんと戻ってきた

					var gatenumber = this.hinfo.getGateNumber(cc);
					var r = this.hinfo.getGateid(cc);
					if(bd.getQuesCell(cc)==21 || bd.getQuesCell(cc)==22){
						passing++;
						if(gatenumber<=0){ } // 何もしない
						else if(ordertype==-1){
							if(gatenumber*2-1==this.hinfo.max){ } // 何もしない
							else if(passing==gatenumber)                 { ordertype=1;}
							else if(passing==this.hinfo.max+1-gatenumber){ break;      } // 逆方向なので他の方向から回る
							else{
								bd.setErrorCell(this.hinfo.data[r].clist, 4);
								bd.setErrorCell(this.hinfo.getGatePole(r),1)
								return false;
							}
						}
						else if(ordertype==1 && passing!=gatenumber){
							bd.setErrorCell(this.hinfo.data[r].clist, 4);
							bd.setErrorCell(this.hinfo.getGatePole(r),1)
							return false;
						}
					}

					if     (ans.lcntCell(cc)!=2){ break;}
					else if(dir!=1 && bd.getLineBorder(bd.getbnum(bx,by+1))==1){ dir=2;}
					else if(dir!=2 && bd.getLineBorder(bd.getbnum(bx,by-1))==1){ dir=1;}
					else if(dir!=3 && bd.getLineBorder(bd.getbnum(bx+1,by))==1){ dir=4;}
					else if(dir!=4 && bd.getLineBorder(bd.getbnum(bx-1,by))==1){ dir=3;}
				}
				else{
					var id = bd.getbnum(bx,by);
					if(bd.getLineBorder(id)!=1){ break;} // 途切れてたら、何事もなかったように終了
					else if(id==-1 || id>=(k.qcols-1)*k.qrows+k.qcols*(k.qrows-1)){ break;}
				}
			}
		}
		return true;
	}
};

//---------------------------------------------------------
//---------------------------------------------------------
HurdleData = function(){
	this.clist = new Array();		// このデータに含まれるセルのリスト
	this.x1 = this.x2 = this.y1 = this.y2 = -1; // 旗門のサイズ
};

Hurdle = function(){
	this.max    = 0;
	this.gateid = new Array();
	this.data   = new Array();
};
Hurdle.prototype = {
	getGateid : function(cc){
		if(cc<0 || cc>=bd.cell.length){ return -1;}
		return this.gateid[cc];
	},
	getGateNumber : function(cc){
		if(cc<0 || cc>=bd.cell.length || this.gateid[cc]==-1){ return -1;}
		var clist = this.data[this.gateid[cc]].clist;
		var min=1000;
		for(var i=0;i<clist.length;i++){
			var val=bd.getQnumCell(clist[i]);
			if(val>0){ min=Math.min(min,val);}
		}
		return (min<1000?min:-1);
	},
	setGateNumber : function(cc,val){
		if(cc<0 || cc>=bd.cell.length || this.gateid[cc]==-1){ return -1;}
		var clist = this.data[this.gateid[cc]].clist;
		for(var i=0;i<clist.length;i++){ bd.setQnumCell(clist[i],-1);}
		bd.setQnumCell(cc,val);
	},
	getPoleNumber : function(cc){
		var clist = this.getConnectedGatecell(cc);
		var min=1000;
		for(var i=0;i<clist.length;i++){
			var val=puz.hinfo.getGateNumber(clist[i]);
			if(val>0){ min=Math.min(min,val);}
		}
		return (min<1000?min:-1);
	},

	//---------------------------------------------------------
	init : function(){
		this.max=0;
		for(var c=0;c<bd.cell.length;c++){ this.gateid[c] = -1;}
		this.data=new Array();
	},
	generateAll : function(){
		this.init();
		for(var c=0;c<bd.cell.length;c++){
			if(bd.getQuesCell(c)==0 || bd.getQuesCell(c)==1 || this.getGateid(c)!=-1){ continue;}

			var cx=bd.cell[c].cx, cy=bd.cell[c].cy;
			var val=bd.getQuesCell(c);

			this.max++;
			this.data[this.max] = new HurdleData();
			while(bd.getQuesCell(bd.getcnum(cx,cy))==val){
				this.data[this.max].clist.push(bd.getcnum(cx,cy));
				this.gateid[bd.getcnum(cx,cy)]=this.max;
				if(val==21){ cy++;}else{ cx++;}
			}
			this.data[this.max].x1 = bd.cell[c].cx;
			this.data[this.max].y1 = bd.cell[c].cy;
			this.data[this.max].x2 = (val==22?cx-1:cx);
			this.data[this.max].y2 = (val==21?cy-1:cy);
			this.data[this.max].val = val;
		}
	},

	//---------------------------------------------------------
	getGatePole : function(gateid){
		var clist = new Array();
		var cc1,cc2;
		if(this.data[gateid].val==21){
			cc1 = bd.getcnum(this.data[gateid].x1, this.data[gateid].y1-1);
			cc2 = bd.getcnum(this.data[gateid].x1, this.data[gateid].y2+1);
		}
		else if(this.data[gateid].val==22){
			cc1 = bd.getcnum(this.data[gateid].x1-1, this.data[gateid].y1);
			cc2 = bd.getcnum(this.data[gateid].x2+1, this.data[gateid].y1);
		}
		else{ return new Array();}
		if(cc1!=-1 && bd.getQuesCell(cc1)==1){ clist.push(cc1);}
		if(cc2!=-1 && bd.getQuesCell(cc2)==1){ clist.push(cc2);}
		return clist;
	},
	getConnectedGatecell : function(cc){
		var idlist = new Array();
		if(bd.getQuesCell(bd.cell[cc].up())==21){ idlist.push(bd.cell[cc].up());}
		if(bd.getQuesCell(bd.cell[cc].dn())==21){ idlist.push(bd.cell[cc].dn());}
		if(bd.getQuesCell(bd.cell[cc].lt())==22){ idlist.push(bd.cell[cc].lt());}
		if(bd.getQuesCell(bd.cell[cc].rt())==22){ idlist.push(bd.cell[cc].rt());}
		return idlist;
	}
};
