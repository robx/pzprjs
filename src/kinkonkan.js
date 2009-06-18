//
// パズル固有スクリプト部 キンコンカン版 kinkonkan.js v3.2.0
//
Puzzles.kinkonkan = function(){ };
Puzzles.kinkonkan.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 8;}	// 盤面の横幅
		if(!k.qrows){ k.qrows = 8;}	// 盤面の縦幅
		k.irowake = 0;			// 0:色分け設定無し 1:色分けしない 2:色分けする

		k.iscross      = 0;		// 1:Crossが操作可能なパズル
		k.isborder     = 1;		// 1:Border/Lineが操作可能なパズル
		k.isextendcell = 2;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

		k.isoutsidecross  = 0;	// 1:外枠上にCrossの配置があるパズル
		k.isoutsideborder = 0;	// 1:盤面の外枠上にborderのIDを用意する
		k.isborderCross   = 0;	// 1:線が交差するパズル
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

		k.fstruct = ["arearoom", "others", "cellqanssub"];

		//k.def_csize = 36;
		k.def_psize = 48;

		if(k.callmode=="pplay"){
			base.setExpression("　マウスのクリックで斜線などが入力できます。外側をクリックすると光が発射されます。",
							   " Click to input mirrors or auxiliary marks. Click Outside of the board to give off the light.");
		}
		else{
			base.setExpression("　マウスの左ボタンで境界線が入力できます。外側のアルファベットは、同じキーを何回か押して大文字小文字／色違いの計4種類を入力できます。",
							   " Left Click to input border lines. It is able to change outside alphabets to four type that is either capital or lower, is either black or blue type by pressing the same key.");
		}
		base.setTitle("キンコンカン","Kin-Kon-Kan");
		base.setFloatbgcolor("rgb(96, 96, 96)");
	},
	menufix : function(){ },

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(x,y){
			if(k.mode==1){
				if(!this.clickexcell(x,y)){ this.inputborder(x,y);}
			}
			else if(k.mode==3){
				this.inputslash(x,y);
			}
		};
		mv.mouseup = function(x,y){
			if(this.inputData==12){ ans.errDisp=true; bd.errclear();}
		};
		mv.mousemove = function(x,y){
			if(k.mode==1 && this.btn.Left) this.inputborder(x,y);
			else if(k.mode==3 && this.inputData!=-1) this.inputslash(x,y);
		};
		mv.inputslash = function(x,y){
			var cc = this.cellid(new Pos(x,y));
			if(cc==-1){ this.inputflash(x,y); return;}

			if     (this.inputData== 3){ bd.sQaC(cc,-1); bd.sQsC(cc,1);}
			else if(this.inputData== 4){ bd.sQaC(cc,-1); bd.sQsC(cc,0);}
			else if(this.inputData!=-1){ return;}
			else if(this.btn.Left){
				if     (bd.QaC(cc)==1) { bd.sQaC(cc, 2); bd.sQsC(cc,0); this.inputData=2;}
				else if(bd.QaC(cc)==2) { bd.sQaC(cc,-1); bd.sQsC(cc,1); this.inputData=3;}
				else if(bd.QsC(cc)==1) { bd.sQaC(cc,-1); bd.sQsC(cc,0); this.inputData=4;}
				else                   { bd.sQaC(cc, 1); bd.sQsC(cc,0); this.inputData=1;}
			}
			else if(this.btn.Right){
				if     (bd.QaC(cc)==1) { bd.sQaC(cc,-1); bd.sQsC(cc,0); this.inputData=4;}
				else if(bd.QaC(cc)==2) { bd.sQaC(cc, 1); bd.sQsC(cc,0); this.inputData=1;}
				else if(bd.QsC(cc)==1) { bd.sQaC(cc, 2); bd.sQsC(cc,0); this.inputData=2;}
				else                   { bd.sQaC(cc,-1); bd.sQsC(cc,1); this.inputData=3;}
			}

			pc.paint(bd.cell[cc].cx-1, bd.cell[cc].cy-1, bd.cell[cc].cx+1, bd.cell[cc].cy+1);
		};
		mv.inputflash = function(x,y){
			var pos = this.cellpos(new Pos(x,y));
			var ec = bd.exnum(pos.x,pos.y)
			if(ec==-1 || this.mouseCell==ec || (this.inputData!=11 && this.inputData!=-1)){ return;}

			if(this.inputData==-1 && bd.ErE(ec)==6){ this.inputData=12;}
			else{
				ans.errDisp=true;
				bd.errclear();
				mv.flashlight(ec);
				this.inputData=11;
			}
			this.mouseCell=ec;
			return;
		};
		mv.clickexcell = function(x,y){
			var pos = this.cellpos(new Pos(x,y));
			var ec = bd.exnum(pos.x, pos.y);
			if(ec<0 || 2*k.qcols+2*k.qrows+4<=ec){ return false;}
			var ec0 = tc.getTCC();

			if(ec!=-1 && ec!=ec0){
				tc.setTCC(ec);
				pc.paintEXcell(ec);
				pc.paintEXcell(ec0);
			}
			else if(ec!=-1 && ec==ec0){
				var flag = (bd.ErE(ec)!=6);
				ans.errDisp=true;
				bd.errclear();
				if(flag){ mv.flashlight(ec);}
			}

			this.btn.Left = false;
			return true;
		};
		mv.flashlight = function(ec){
			area = new AreaInfo();
			for(var c=0;c<bd.cell.length;c++){ area.check[c]=0;}
			var ret = ans.checkMirror1(ec, area);
			bd.sErE([ec,ret.dest],6);
			for(var c=0;c<bd.cell.length;c++){ bd.sErC([c],area.check[c]);}
			pc.paintAll();
		},

		// キーボード入力系
		kc.keyinput = function(ca){
			if(k.mode==3){ return;}
			if(this.moveTCell(ca)){ return;}
			this.key_inputexcell(ca);
		};
		kc.key_inputexcell = function(ca){
			var ec = tc.getTCC();
			var max = 104;

			if('0'<=ca && ca<='9'){
				var num = parseInt(ca);

				if(bd.QnE(ec)<=0 || this.prev!=ec){
					if(num<=max){ bd.sQnE(ec,num);}
				}
				else{
					if(bd.QnE(ec)*10+num<=max){ bd.sQnE(ec,bd.QnE(ec)*10+num);}
					else if(num<=max){ bd.sQnE(ec,num);}
				}
			}
			else if('a'<=ca && ca<='z'){
				var num = parseInt(ca,36)-10;
				var canum = bd.DiE(ec);
				if     ((canum-1)%26==num && canum>0 && canum<79){ bd.sDiE(ec,canum+26);}
				else if((canum-1)%26==num){ bd.sDiE(ec,0);}
				else{ bd.sDiE(ec,num+1);}
			}
			else if(ca=='-'){
				if(bd.QnE(ec)!=-1){ bd.sQnE(ec,-1);}
				else              { bd.sQnE(ec,-1); bd.sDiE(ec,0);}
			}
			else if(ca=='F4'){
				var flag = (bd.ErE(ec)!=6);
				ans.errDisp=true;
				bd.errclear();
				if(flag){ mv.flashlight(ec);}
			}
			else if(ca==' '){ bd.sQnE(ec,-1); bd.sDiE(ec,0);}
			else{ return;}

			this.prev = ec;
			pc.paintEXcell(tc.getTCC());
		};
		kc.moveTCell = function(ca){
			var cc0 = tc.getTCC(), tcp = tc.getTCP();
			var flag = true;

			if     (ca == 'up'){
				if(tcp.y==tc.maxy && tc.minx<tcp.x && tcp.x<tc.maxx){ tc.cursoly=tc.miny;}
				else if(tcp.y>tc.miny){ tc.decTCY(2);}else{ flag=false;}
			}
			else if(ca == 'down'){
				if(tcp.y==tc.miny && tc.minx<tcp.x && tcp.x<tc.maxx){ tc.cursoly=tc.maxy;}
				else if(tcp.y<tc.maxy){ tc.incTCY(2);}else{ flag=false;}
			}
			else if(ca == 'left'){
				if(tcp.x==tc.maxx && tc.miny<tcp.y && tcp.y<tc.maxy){ tc.cursolx=tc.minx;}
				else if(tcp.x>tc.minx){ tc.decTCX(2);}else{ flag=false;}
			}
			else if(ca == 'right'){
				if(tcp.x==tc.minx && tc.miny<tcp.y && tcp.y<tc.maxy){ tc.cursolx=tc.maxx;}
				else if(tcp.x<tc.maxx){ tc.incTCX(2);}else{ flag=false;}
			}
			else{ flag=false;}

			if(flag){
				pc.paintEXcell(cc0);
				pc.paintEXcell(tc.getTCC());
				this.tcMoved = true;
			}

			return flag;
		};

		menu.ex.adjustSpecial = function(type,key){
			um.disableRecord();
			if(type>=1 && type<=4){ // 反転・回転全て
				for(var c=0;c<bd.cell.length;c++){ if(bd.QaC(c)!=0){ bd.sQaC(c,{1:2,2:1}[bd.QaC(c)]); } }
			}
			um.enableRecord();
		};

		tc.getTCC = function(){ return bd.exnum(mf((this.cursolx-1)/2), mf((this.cursoly-1)/2));}.bind(tc);
		tc.setTCC = function(id){
			if(id<0 || 2*k.qcols+2*k.qrows+4<=id){ return;}
			if     (id<  k.qcols)            { this.cursolx=2*id+1;           this.cursoly=this.miny;                 }
			else if(id<2*k.qcols)            { this.cursolx=2*(id-k.qcols)+1; this.cursoly=this.maxy;                 }
			else if(id<2*k.qcols+  k.qrows)  { this.cursolx=this.minx;        this.cursoly=2*(id-2*k.qcols)+1;        }
			else if(id<2*k.qcols+2*k.qrows)  { this.cursolx=this.maxx;        this.cursoly=2*(id-2*k.qcols-k.qrows)+1;}
			else if(id<2*k.qcols+2*k.qrows+1){ this.cursolx=this.minx; this.cursoly=this.miny;}
			else if(id<2*k.qcols+2*k.qrows+2){ this.cursolx=this.maxx; this.cursoly=this.miny;}
			else if(id<2*k.qcols+2*k.qrows+3){ this.cursolx=this.minx; this.cursoly=this.maxy;}
			else if(id<2*k.qcols+2*k.qrows+4){ this.cursolx=this.maxx; this.cursoly=this.maxy;}
		}.bind(tc);
		tc.setTCC(0);
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.BDlinecolor = "rgb(127, 127, 127)";

		pc.errcolor1 = "rgb(192, 0, 0)";
		pc.errbcolor1 = "rgb(255, 160, 160)";
		pc.errbcolor2 = "rgb(255, 255, 127)";
		pc.dotcolor = "rgb(255, 96, 191)";

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);

			this.drawErrorCells_kinkonkan(x1,y1,x2,y2);
			this.drawTriangle(x1,y1,x2,y2);
			this.drawWhiteCells_kinkonkan(x1,y1,x2,y2);

			this.drawBDline(x1,y1,x2,y2);
			this.drawBorders(x1,y1,x2,y2);

			this.drawSlashes(x1,y1,x2,y2);

			this.drawEXcells(x1,y1,x2,y2);
			this.drawChassis(x1,y1,x2,y2);

			if(k.mode==1){ this.drawTCell(x1-1,y1-1,x2+1,y2+1);}else{ this.hideTCell();}
		};

		pc.drawErrorCells_kinkonkan = function(x1,y1,x2,y2){
			var clist = this.cellinside(x1,y1,x2,y2,f_true);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				if(bd.ErC(c)==1 || bd.ErC(c)==6){
					if     (bd.ErC(c)==1){ g.fillStyle = this.errbcolor1;}
					else if(bd.ErC(c)==6){ g.fillStyle = this.errbcolor2;}
					if(this.vnop("c"+c+"_full_",1)){ g.fillRect(bd.cell[c].px(), bd.cell[c].py(), k.cwidth, k.cheight);}
				}
				else{ this.vhide("c"+c+"_full_");}
			}
			this.vinc();
		};
		pc.drawWhiteCells_kinkonkan = function(x1,y1,x2,y2){
			var dsize = k.cwidth*0.06;
			var clist = this.cellinside(x1,y1,x2,y2,f_true);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				if(bd.QsC(c)==1){
					g.fillStyle = this.dotcolor;
					g.beginPath();
					g.arc(bd.cell[c].px()+k.cwidth/2, bd.cell[c].py()+k.cheight/2, dsize, 0, Math.PI*2, false);
					if(this.vnop("c"+c+"_dot_",1)){ g.fill();}
				}
				else{ this.vhide("c"+c+"_dot_");}
			}
			this.vinc();
		}
		pc.drawSlashes = function(x1,y1,x2,y2){
			var clist = this.cellinside(x1,y1,x2,y2,f_true);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];

				this.vhide(["c"+c+"_sl1_","c"+c+"_sl2_"]);
				if(bd.QaC(c)!=-1){
					g.strokeStyle = this.Cellcolor;
					g.lineWidth = (mf(k.cwidth/8)>=2?mf(k.cwidth/8):2);

					if     (bd.QaC(c)==1 && this.vnop("c"+c+"_sl1_",0)){
						this.inputPath([bd.cell[c].px(),bd.cell[c].py(), 0,0, k.cwidth,k.cheight], true); g.stroke();
					}
					else if(bd.QaC(c)==2 && this.vnop("c"+c+"_sl2_",0)){
						this.inputPath([bd.cell[c].px(),bd.cell[c].py(), k.cwidth,0, 0,k.cheight], true); g.stroke();
					}
				}
			}
			this.vinc();
		};

		pc.drawEXcells = function(x1,y1,x2,y2){
			for(var cx=x1;cx<=x2;cx++){
				for(var cy=y1;cy<=y2;cy++){
					var c = bd.exnum(cx,cy);
					if(c<0 || 2*k.qcols+2*k.qrows<=c){ continue;}

					if(bd.ErE(c)==6){
						g.fillStyle = this.errbcolor2;
						if(this.vnop("ex"+c+"_full_",1)){ g.fillRect(bd.excell[c].px()+1, bd.excell[c].py()+1, k.cwidth-1, k.cheight-1);}
					}
					else{ this.vhide("ex"+c+"_full_");}

					if(bd.DiE(c)==0 && bd.QnE(c)==-1){
						if(bd.excell[c].numobj){ bd.excell[c].numobj.hide();}
					}
					else{
						if(!bd.excell[c].numobj){ bd.excell[c].numobj = this.CreateDOMAndSetNop();}
						var num=bd.QnE(c), canum=bd.DiE(c);

						var color = this.fontErrcolor;
						if(bd.ErE(c)!=1){ color=(canum<=52?this.fontcolor:this.fontAnscolor);}

						var fontratio = 0.66;
						if(canum>0&&num>=10){ fontratio = 0.55;}

						var text="";
						if     (canum> 0&&canum<= 26){ text+=(canum+ 9).toString(36).toUpperCase();}
						else if(canum>26&&canum<= 52){ text+=(canum-17).toString(36).toLowerCase();}
						else if(canum>52&&canum<= 78){ text+=(canum-43).toString(36).toUpperCase();}
						else if(canum>78&&canum<=104){ text+=(canum-69).toString(36).toLowerCase();}
						if(num>=0){ text+=num.toString(10);}

						this.dispnumEXcell1(c, bd.excell[c].numobj, 1, text, fontratio, color);
					}
					//bd.getDirecEXcell(c)
				}
			}
			this.vinc();
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type, bstr){
			if(type==0 || type==1){
				bstr = this.decodeBorder(bstr);
				bstr = this.decodeKinkonkan(bstr);
			}
		};
		enc.pzlexport = function(type){
			if(type==0)     { document.urloutput.ta.value = this.getURLbase()+"?"+k.puzzleid+this.pzldata();}
			else if(type==1){ document.urloutput.ta.value = this.getDocbase()+k.puzzleid+"/sa/m.html?"+this.pzldata();}
			else if(type==3){ document.urloutput.ta.value = this.getURLbase()+"?m+"+k.puzzleid+this.pzldata();}
		};
		enc.pzldata = function(){
			return "/"+k.qcols+"/"+k.qrows+"/"+this.encodeBorder()+this.encodeKinkonkan();
		};

		enc.decodeKinkonkan = function(bstr){
			// 盤面外数字のデコード
			var subint = new Array();
			var ec=0, a=0;
			for(var i=0;i<bstr.length;i++){
				var ca = bstr.charAt(i);

				if     (this.include(ca,'A','Z')){ bd.sDiE(ec, parseInt(ca,36)-9); subint.push(ec); ec++;}
				else if(this.include(ca,'0','9')){ bd.sDiE(ec, (parseInt(bstr.charAt(i+1))+1)*26+parseInt(ca,36)-9); subint.push(ec); ec++; i++;}
				else if(this.include(ca,'a','z')){ ec+=(parseInt(ca,36)-9);}
				else{ ec++;}

				if(ec >= bd.excell.length-4){ a=i+1; break;}
			}
			ec=0;
			for(var i=a;i<bstr.length;i++){
				var ca = bstr.charAt(i);
				if     (ca == '.'){ bd.sQnE(subint[ec], -2);                                   ec++;      }
				else if(ca == '-'){ bd.sQnE(subint[ec], parseInt(bstr.substring(i+1,i+3),16)); ec++; i+=2;}
				else              { bd.sQnE(subint[ec], parseInt(bstr.substring(i  ,i+1),16)); ec++;      }
				if(ec >= subint.length){ a=i+1; break;}
			}

			return bstr.substring(a,bstr.length);
		};
		enc.encodeKinkonkan = function(type){
			var cm="", cm2="";

			// 盤面外部分のエンコード
			var count=0;
			for(var ec=0;ec<2*k.qcols+2*k.qrows;ec++){
				pstr = "";
				var val  = bd.DiE(ec);
				var qnum = bd.QnE(ec);

				if(val> 0 && val<=104){
					if(val<=26){ pstr = (val+9).toString(36).toUpperCase();}
					else       { pstr = mf((val-1)/26-1).toString() + ((val-1)%26+10).toString(16).toUpperCase();}

					if     (qnum==-2){ cm2+=".";}
					else if(qnum <16){ cm2+=("" +qnum.toString(16));}
					else             { cm2+=("-"+qnum.toString(16));}
				}
				else{ count++;}

				if(count==0){ cm += pstr;}
				else if(pstr || count==26){ cm+=((9+count).toString(36)+pstr); count=0;}
			}
			if(count>0){ cm+=(9+count).toString(36);}

			return cm+cm2;
		};

		//---------------------------------------------------------
		fio.decodeOthers = function(array){
			if(array.length<k.qrows+2){ return false;}
			var item = new Array();
			for(var i=0;i<array.length;i++){ item = item.concat( this.retarray( array[i] ) );    }
			for(var i=0;i<item.length;i++) {
				if(item[i]=="."){ continue;}
				var ec = bd.exnum(i%(k.qcols+2)-1,mf(i/(k.qcols+2))-1);
				if(ec==-1){ continue;}

				var inp = item[i].split(",");
				if(inp[0]!=""){ bd.sDiE(ec, parseInt(inp[0]));}
				if(inp[1]!=""){ bd.sQnE(ec, parseInt(inp[1]));}
			}
			return true;
		};
		fio.encodeOthers = function(){
			var str = "";
			for(var cy=-1;cy<=k.qrows;cy++){
				for(var cx=-1;cx<=k.qcols;cx++){
					var ec = bd.exnum(cx,cy);
					if(ec==-1){ str+=". "; continue;}

					var str1 = (bd.DiE(ec)== 0?"":bd.DiE(ec).toString());
					var str2 = (bd.QnE(ec)==-1?"":bd.QnE(ec).toString());
					if(str1=="" && str2==""){ str+= ". ";}
					else{ str += (""+str1+","+str2+" ");}
				}
				str += "/";
			}
			return str;
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			var rarea = this.searchRarea();
			if( !this.checkOneNumber(rarea, function(top,lcnt){ return (lcnt>1);}, function(cc){ return bd.QaC(cc)>0;}) ){
				this.setAlert('斜線が複数引かれた部屋があります。', 'A room has plural mirrors.'); return false;
			}

			if( !this.checkMirrors(1) ){
				this.setAlert('光が同じ文字の場所へ到達しません。', 'Beam from a light doesn\'t reach one\'s pair.'); return false;
			}

			if( !this.checkMirrors(2) ){
				this.setAlert('光の反射回数が正しくありません。', 'The count of refrection is wrong.'); return false;
			}

			if( !this.checkOneNumber(rarea, function(top,lcnt){ return (lcnt==0);}, function(cc){ return bd.QaC(cc)>0;}) ){
				this.setAlert('斜線の引かれていない部屋があります。', 'A room has no mirrors.'); return false;
			}

			return true;
		};

		ans.checkMirrors = function(type){
			var d = new Array();
			for(var ec=0;ec<2*k.qcols+2*k.qrows;ec++){
				if(!isNaN(d[ec]) || bd.QnE(ec)==-1 || bd.DiE(ec)==0){ continue;}
				area = new AreaInfo();
				for(var c=0;c<bd.cell.length;c++){ area.check[c]=0;}

				var ret = this.checkMirror1(ec, area);
				if( (type==1&& (bd.DiE(ec)!=bd.DiE(ret.dest)) )||
					(type==2&&((bd.QnE(ec)!=bd.QnE(ret.dest)) || bd.QnE(ec)!=ret.cnt))
				){
					for(var c=0;c<bd.excell.length;c++){ bd.sErE([c],0);}
					bd.sErE([ec,ret.dest],6);
					for(var c=0;c<bd.cell.length;c++){ bd.sErC([c],area.check[c]);}
					return false;
				}
				d[ec]=1; d[ret.dest]=1;
			}
			return true;
		};
		ans.checkMirror1 = function(startec, area){
			var ccnt=0;

			var cx=bd.excell[startec].cx, cy=bd.excell[startec].cy;
			var dir=0;
			if     (startec<  k.qcols)          { dir=2;}
			else if(startec<2*k.qcols)          { dir=1;}
			else if(startec<2*k.qcols+  k.qrows){ dir=4;}
			else if(startec<2*k.qcols+2*k.qrows){ dir=3;}

			while(dir!=0){
				switch(dir){ case 1: cy--; break; case 2: cy++; break; case 3: cx--; break; case 4: cx++; break;}
				var cc = bd.cnum(cx,cy);
				if     (bd.exnum(cx,cy)!=-1){ break;}
				else if(bd.QaC(cc)==1){
					ccnt++;
					if     (dir==1){ area.check[cc]=(!isNaN({4:1,6:1}[area.check[cc]])?6:2); dir=3;}
					else if(dir==2){ area.check[cc]=(!isNaN({2:1,6:1}[area.check[cc]])?6:4); dir=4;}
					else if(dir==3){ area.check[cc]=(!isNaN({2:1,6:1}[area.check[cc]])?6:4); dir=1;}
					else if(dir==4){ area.check[cc]=(!isNaN({4:1,6:1}[area.check[cc]])?6:2); dir=2;}
				}
				else if(bd.QaC(cc)==2){
					ccnt++;
					if     (dir==1){ area.check[cc]=(!isNaN({5:1,6:1}[area.check[cc]])?6:3); dir=4;}
					else if(dir==2){ area.check[cc]=(!isNaN({3:1,6:1}[area.check[cc]])?6:5); dir=3;}
					else if(dir==3){ area.check[cc]=(!isNaN({5:1,6:1}[area.check[cc]])?6:3); dir=2;}
					else if(dir==4){ area.check[cc]=(!isNaN({3:1,6:1}[area.check[cc]])?6:5); dir=1;}
				}
				else{ area.check[cc]=6;}

				if(ccnt>bd.cell.length){ break;} // 念のためガード条件(多分引っかからない)
			}

			return {cnt:ccnt, dest:bd.exnum(cx,cy)};
		};
	}
};
