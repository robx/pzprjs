//
// パズル固有スクリプト部 タテボーヨコボー版 tateyoko.js v3.2.3
//
Puzzles.tateyoko = function(){ };
Puzzles.tateyoko.prototype = {
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

		k.dispzero      = 1;	// 1:0を表示するかどうか
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

		k.fstruct = ["others"];

		//k.def_csize = 36;
		//k.def_psize = 24;
		//k.area = { bcell:0, wcell:0, number:0};	// areaオブジェクトで領域を生成する

		if(k.EDITOR){
			base.setExpression("　黒マスはQキーで入力できます。数字はキーボード及びマウスで入力できます。",
							   " Press Q key to input black cells. It is available to input number by keybord or mouse.");
		}
		else{
			base.setExpression("　左ドラッグで線が、右クリックで×が入力できます。",
							   " Left Button Drag to input black cells, Right Click to input a cross.");
		}
		base.setTitle("タテボーヨコボー","Tatebo-Yokobo");
		base.setFloatbgcolor("rgb(96, 255, 96)");
	},
	menufix : function(){ },

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(k.editmode && !kp.enabled()){ this.inputqnum();}
			else if(k.playmode){ this.inputTateyoko();}
		};
		mv.mouseup = function(){
			if(k.editmode && this.notInputted() && kp.enabled()){ kp.display();}
			else if(k.playmode && this.notInputted()){ this.clickTateyoko();}
		};
		mv.mousemove = function(){
			if(k.playmode){ this.inputTateyoko();}
		};
		mv.inputTateyoko = function(){
			var pos = this.crosspos(0.30);
			var cc  = this.cellid();
			if(cc==-1){ return;}
			if(this.mouseCell==-1 || bd.QuC(cc)==1){ this.firstPos = pos; this.mouseCell = cc; return;}
			if(pos.x==this.firstPos.x && pos.y==this.firstPos.y && cc==this.mouseCell){ return;}

			if(this.inputData==-1){
				if     (Math.abs(pos.y-this.firstPos.y)==1){ this.inputData=1;}
				else if(Math.abs(pos.x-this.firstPos.x)==1){ this.inputData=2;}
				if(bd.QaC(cc)==this.inputData){ this.inputData=0;}
			}
			else{
				if     (this.inputData!=1 && Math.abs(pos.y-this.firstPos.y)==1){ return;}
				else if(this.inputData!=2 && Math.abs(pos.x-this.firstPos.x)==1){ return;}
			}

			if(bd.QaC(cc)!=this.inputData){ bd.sQaC(cc,(this.inputData!=0?this.inputData:-1));}

			this.firstPos = pos;
			this.mouseCell = cc;
			pc.paintCell(cc);
		};
		mv.clickTateyoko = function(){
			var cc  = this.cellid();
			if(cc==-1 || bd.QuC(cc)==1){ return;}

			if(this.btn.Left){
				if     (bd.QaC(cc)==-1){ bd.sQaC(cc, 1);}
				else if(bd.QaC(cc)== 1){ bd.sQaC(cc, 2);}
				else                   { bd.sQaC(cc,-1);}
			}
			else if(this.btn.Right){
				if     (bd.QaC(cc)==-1){ bd.sQaC(cc, 2);}
				else if(bd.QaC(cc)== 1){ bd.sQaC(cc,-1);}
				else                   { bd.sQaC(cc, 1);}
			}
			pc.paintCell(cc);
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(k.playmode){ return;}
			if(this.moveTCell(ca)){ return;}
			if(this.key_inputqnum_tateyoko(ca)){ return;}
			this.key_inputqnum(ca);
		};
		kc.key_inputqnum_tateyoko = function(ca){
			var cc = tc.getTCC();
			if(ca=='q'||ca=='q1'||ca=='q2'){
				if(ca=='q'){ ca = (bd.QuC(cc)!=1?'q1':'q2');}
				if(ca=='q1'){
					bd.sQuC(cc, 1);
					bd.sQaC(cc,-1);
					if(bd.QnC(cc)>4){ bd.sQnC(cc,-1);}
				}
				else if(ca=='q2'){ bd.sQuC(cc, 0);}
			}
			else{ return false;}
			this.prev=cc;
			pc.paintCell(cc);
			return true;
		};

		if(k.EDITOR){
			kp.kpgenerate = function(mode){
				this.inputcol('num','knumq1','q1','■');
				this.inputcol('num','knumq2','q2','□');
				this.inputcol('empty','knumx','','');
				this.inputcol('empty','knumy','','');
				this.insertrow();
				this.inputcol('num','knum1','1','1');
				this.inputcol('num','knum2','2','2');
				this.inputcol('num','knum3','3','3');
				this.inputcol('num','knum4','4','4');
				this.insertrow();
				this.inputcol('num','knum5','5','5');
				this.inputcol('num','knum6','6','6');
				this.inputcol('num','knum7','7','7');
				this.inputcol('num','knum8','8','8');
				this.insertrow();
				this.inputcol('num','knum9','9','9');
				this.inputcol('num','knum0','0','0');
				this.inputcol('num','knum_','-','?');
				this.inputcol('num','knum.',' ',' ');
				this.insertrow();
			};
			kp.generate(kp.ORIGINAL, true, false, kp.kpgenerate);
			kp.kpinput = function(ca){
				kc.key_inputqnum_tateyoko(ca);
			};
		}

		menu.ex.adjustSpecial = function(type,key){
			um.disableRecord();
			if(type>=3 && type<=4){ // 回転だけ
				for(var c=0;c<bd.cellmax;c++){ if(bd.QaC(c)!=-1){ bd.sQaC(c,{1:2,2:1}[bd.QaC(c)]); } }
			}
			um.enableRecord();
		};
		bd.nummaxfunc = function(cc){ return (bd.QuC(cc)==1?4:Math.max(k.qcols,k.qrows));};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_LIGHT;
		pc.linecolor = pc.linecolor_LIGHT;
		pc.errbcolor1 = pc.errbcolor1_DARK;
		pc.errbcolor2 = "white";

		pc.paint = function(x1,y1,x2,y2){
			x2++; y2++;
			this.flushCanvas(x1,y1,x2,y2);

			this.drawBGCells(x1,y1,x2,y2);
			this.drawDashedGrid(x1,y1,x2,y2);

			this.drawTateyokos(x1,y1,x2,y2)

			this.drawNumbers_tateyoko(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);

			this.drawTarget(x1,y1,x2,y2);
		};

		pc.drawTateyokos = function(x1,y1,x2,y2){
			var headers = ["c_bar1_", "c_bar2_"];

			var clist = this.cellinside(x1,y1,x2,y2);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				var lw = (mf(k.cwidth/6)>=3?mf(k.cwidth/6):3); //LineWidth
				var lp = mf((k.cwidth-lw)/2); //LinePadding

				var err = bd.cell[c].error;
				if     (err===1||err===4){ g.fillStyle = this.errlinecolor1; lw++;}
				else if(err===2){ g.fillStyle = this.errlinecolor2;}
				else{ g.fillStyle = this.linecolor;}

				if(bd.cell[c].qans!==-1){
					if(bd.cell[c].qans===1){
						if(this.vnop(headers[0]+c,1)){
							g.fillRect(bd.cell[c].px+lp, bd.cell[c].py, lw, k.cheight+1);
						}
					}
					else{ this.vhide(headers[0]+c);}

					if(bd.cell[c].qans===2){
						if(this.vnop(headers[1]+c,1)){
							g.fillRect(bd.cell[c].px, bd.cell[c].py+lp, k.cwidth+1,  lw);
						}
					}
					else{ this.vhide(headers[1]+c);}
				}
				else{ this.vhide([headers[0]+c, headers[1]+c]);}
			}
			this.vinc();
		};

		pc.drawNumbers_tateyoko = function(x1,y1,x2,y2){
			var header = "c_full_";

			var clist = this.cellinside(x1,y1,x2,y2);
			for(var i=0;i<clist.length;i++){
				var c = clist[i], obj = bd.cell[c];
				if(bd.cell[c].ques===1){
					g.fillStyle = (bd.cell[c].error===1 ? this.errcolor1 : this.Cellcolor);
					if(this.vnop(header+c,1)){
						g.fillRect(obj.px, obj.py, k.cwidth+1, k.cheight+1);
					}
				}
				else{ this.vhide(header+c);}

				var num = bd.cell[c].qnum;
				if(num===-1){ this.hideEL(obj.numobj); continue;}
				if(!obj.numobj){ obj.numobj = this.CreateDOMAndSetNop();}

				var color = this.fontcolor;
				if(bd.cell[c].ques==1){ color = "white";}
				this.dispnum(obj.numobj, 1, (num!=-2?""+num:"?"), (num<10?0.8:0.75), color, obj.px, obj.py);
			}
			this.vinc();
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type, bstr){
			if(type==0 || type==1){ bstr = this.decodeTateyoko(bstr);}
		};
		enc.pzlexport = function(type){
			if(type==0)     { document.urloutput.ta.value = this.getURLbase()+"?"+k.puzzleid+this.pzldata();}
			else if(type==1){ document.urloutput.ta.value = this.getDocbase()+k.puzzleid+"/sa/m.html?"+this.pzldata();}
			else if(type==3){ document.urloutput.ta.value = this.getURLbase()+"?m+"+k.puzzleid+this.pzldata();}
		};
		enc.pzldata = function(){
			return "/"+k.qcols+"/"+k.qrows+"/"+this.encodeTateyoko();
		};

		enc.decodeTateyoko = function(bstr){
			var c=0, i=0;
			for(i=0;i<bstr.length;i++){
				var ca = bstr.charAt(i);

				if     (ca=='o'){ bd.sQuC(c,1); bd.sQnC(c,0); c++;}
				else if(ca=='p'){ bd.sQuC(c,1); bd.sQnC(c,1); c++;}
				else if(ca=='q'){ bd.sQuC(c,1); bd.sQnC(c,2); c++;}
				else if(ca=='r'){ bd.sQuC(c,1); bd.sQnC(c,3); c++;}
				else if(ca=='s'){ bd.sQuC(c,1); bd.sQnC(c,4); c++;}
				else if(ca=='x'){ bd.sQuC(c,1); c++;}
				else if(this.include(ca,"0","9")||this.include(ca,"a","f")){ bd.sQnC(c,parseInt(ca,16)); c++;}
				else if(ca=="-"){ bd.sQnC(c,parseInt(bstr.substr(i+1,2),16)); c++; i+=2;}
				else if(ca=="i"){ c+=(parseInt(bstr.charAt(i+1),16)); i++;}
				else{ c++;}

				if(c>=bd.cellmax){ break;}
			}
			return bstr.substr(i);
		};
		enc.encodeTateyoko = function(type){
			var cm="", count=0;
			for(var c=0;c<bd.cellmax;c++){
				var pstr="";
				if(bd.QuC(c)==0){
					if     (bd.QnC(c)==-1){ count++;}
					else if(bd.QnC(c)==-2){ pstr=".";}
					else if(bd.QnC(c)< 16){ pstr="" +bd.QnC(c).toString(16);}
					else if(bd.QnC(c)<256){ pstr="-"+bd.QnC(c).toString(16);}
					else{ pstr=""; count++;}
				}
				else if(bd.QuC(c)==1){
					if(bd.QnC(c)==-1||bd.QnC(c)==-2){ pstr="x";}
					else if(bd.QnC(c)==0){ pstr="o";}
					else if(bd.QnC(c)==1){ pstr="p";}
					else if(bd.QnC(c)==2){ pstr="q";}
					else if(bd.QnC(c)==3){ pstr="r";}
					else if(bd.QnC(c)==4){ pstr="s";}
					else{ pstr="x";}
				}

				if(count==0){ cm+=pstr;}
				else if(pstr!=""){
					if(count==1){ cm+=("n"+pstr); count=0;}
					else{ cm+=("i"+count.toString(16)+pstr); count=0;}
				}
				else if(count==15){ cm+="if"; count=0;}
			}
			if(count==1){ cm+="n";}
			else if(count>1){ cm+=("i"+count.toString(16));}

			return cm;
		};

		//---------------------------------------------------------
		fio.decodeOthers = function(array){
			if(array.length<2*k.qrows){ return false;}
			this.decodeCell( function(c,ca){
				if     (ca=="?"){ bd.sQnC(c,-2);}
				else if(ca>="a"&&ca<='f'){ bd.sQuC(c,1); bd.sQnC(c,{a:1,b:2,c:3,d:4,e:0,f:-1}[ca]);}
				else if(ca!="."){ bd.sQnC(c, parseInt(ca));}
			},array.slice(0,k.qrows));
			this.decodeCell( function(c,ca){
				if     (ca=="0"){ bd.sQaC(c,-1);}
				else if(ca!="."){ bd.sQaC(c,parseInt(ca));}
			},array.slice(k.qrows,2*k.qrows));
			return true;
		};
		fio.encodeOthers = function(){
			return (""+this.encodeCell( function(c){
				if(bd.QuC(c)==1){
					if(bd.QnC(c)==-1||bd.QnC(c)==-2){ return "f ";}
					else{ return {0:"e ",1:"a ",2:"b ",3:"c ",4:"d "}[bd.QnC(c)];}
				}
				else if(bd.QnC(c)>= 0){ return ""+bd.QnC(c).toString()+" ";}
				else if(bd.QnC(c)==-2){ return "? ";}
				else{ return ". ";}
			}) + this.encodeCell( function(c){
				if     (bd.QuC(c)==1 ){ return ". ";}
				else if(bd.QaC(c)==-1){ return "0 ";}
				else{ return ""+bd.QaC(c).toString()+" ";}
			} ));
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			if( !this.checkBCell(1) ){
				this.setAlert('黒マスに繋がる線の数が正しくありません。','The number of lines connected to a black cell is wrong.'); return false;
			}

			for(var i=0;i<bd.cellmax;i++){ bd.sErC([i],2);}
			var binfo = this.getBarInfo();
			if( !this.checkQnumsInArea(binfo, function(a){ return (a>=2);}) ){
				this.setAlert('1つの棒に2つ以上の数字が入っています。','A line passes plural numbers.'); return false;
			}

			if( !this.checkNumberAndSize(binfo) ){
				this.setAlert('数字と棒の長さが違います。','The number is different from the length of line.'); return false;
			}
			for(var i=0;i<bd.cellmax;i++){ bd.sErC([i],0);}

			if( !this.checkBCell(2) ){
				this.setAlert('黒マスに繋がる線の数が正しくありません。','The number of lines connected to a black cell is wrong.'); return false;
			}

			if( !this.checkAllCell(function(c){ return (bd.QuC(c)==0 && bd.QaC(c)==-1);}) ){
				this.setAlert('何も入っていないマスがあります。','There is a empty cell.'); return false;
			}

			return true;
		};
		ans.check1st = function(){ return this.checkAllCell(function(c){ return (bd.QuC(c)==0 && bd.QaC(c)==-1);});};

		ans.checkBCell = function(type){
			var result = true;
			for(var c=0;c<bd.cellmax;c++){
				if(bd.QuC(c)!==1 || bd.QnC(c)<0){ continue;}

				var cnt1=0, cnt2=0;
				if(bd.QaC(bd.up(c))==1){ cnt1++;} else if(bd.up(c)==-1 || bd.QaC(bd.up(c))==2){ cnt2++;}
				if(bd.QaC(bd.dn(c))==1){ cnt1++;} else if(bd.dn(c)==-1 || bd.QaC(bd.dn(c))==2){ cnt2++;}
				if(bd.QaC(bd.lt(c))==2){ cnt1++;} else if(bd.lt(c)==-1 || bd.QaC(bd.lt(c))==1){ cnt2++;}
				if(bd.QaC(bd.rt(c))==2){ cnt1++;} else if(bd.rt(c)==-1 || bd.QaC(bd.rt(c))==1){ cnt2++;}

				if((type==1 && (bd.QnC(c)>4-cnt2 || bd.QnC(c)<cnt1)) || (type==2 && bd.QnC(c)!=cnt1)){
					if(this.inAutoCheck){ return false;}
					bd.sErC([c],1);
					result = false;
				}
			}
			return result;
		};

		ans.getBarInfo = function(){
			var binfo = new AreaInfo();
			for(var c=0;c<bd.cellmax;c++){ binfo.id[c]=(bd.QuC(c)==1 || bd.QaC(c)==-1?-1:0);}
			for(var c=0;c<bd.cellmax;c++){
				if(binfo.id[c]!=0){ continue;}
				var cx=bd.cell[c].cx, cy=bd.cell[c].cy, val=bd.QaC(c);

				binfo.max++;
				binfo.room[binfo.max] = {idlist:[]};
				while(bd.QaC(bd.cnum(cx,cy))==val){
					binfo.room[binfo.max].idlist.push(bd.cnum(cx,cy));
					binfo.id[bd.cnum(cx,cy)]=binfo.max;
					if(val==1){ cy++;}else{ cx++;}
				}
			}
			return binfo;
		};
	}
};
