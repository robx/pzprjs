//
// パズル固有スクリプト部 天体ショー版 tentaisho.js v3.2.0
//
Puzzles.tentaisho = function(){ };
Puzzles.tentaisho.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}	// 盤面の横幅
		if(!k.qrows){ k.qrows = 10;}	// 盤面の縦幅
		k.irowake = 0;			// 0:色分け設定無し 1:色分けしない 2:色分けする

		k.iscross      = 1;		// 1:Crossが操作可能なパズル
		k.isborder     = 1;		// 1:Border/Lineが操作可能なパズル
		k.isextendcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

		k.isoutsidecross  = 0;	// 1:外枠上にCrossの配置があるパズル
		k.isoutsideborder = 0;	// 1:盤面の外枠上にborderのIDを用意する
		k.isborderCross   = 0;	// 1:線が交差するパズル
		k.isCenterLine    = 0;	// 1:マスの真ん中を通る線を回答として入力するパズル
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

		k.ispzprv3ONLY  = 1;	// 1:ぱずぷれv3にしかないパズル
		k.isKanpenExist = 1;	// 1:pencilbox/カンペンにあるパズル

		k.fstruct = ["others","borderans","cellqsub"];

		//k.def_csize = 36;
		//k.def_psize = 24;

		if(k.callmode=="pplay"){
			base.setExpression("　星をクリックすると色がぬれます。",
							   " Click star to paint.");
		}
		else{
			base.setExpression("　問題作成モード時に、マウスの右ボタンで下絵を描くことが出来ます。この背景色は「星をクリック」や「色をつける」ボタンで上書きされます。",
							   " In edit mode, it is able to paint a design by Right Click. This background color is superscripted by clicking star or pressing 'Color up' button.");
		}
		base.setTitle("天体ショー","Tentaisho");
		base.setFloatbgcolor("rgb(0, 224, 0)");
	},
	menufix : function(){
		if(k.callmode=='pmake'){
			pp.addCheckToFlags('discolor','setting',false);
			pp.setMenuStr('discolor', '色分け無効化', 'Disable color');
			pp.setLabel  ('discolor', '星クリックによる色分けを無効化する', 'Disable Coloring up by clicking star');
		}

		$("#btnarea").append("<input type=\"button\" id=\"btncolor\" value=\"色をつける\" onClick=\"javascript:mv.encolorall();\">");
		menu.addButtons($("#btncolor").unselectable(),"色をつける","Color up");
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(x,y){
			if(k.mode==1){
				if(this.btn.Left) this.inputstar(x,y);
				else if(this.btn.Right) this.inputBGcolor1(x,y);
			}
			else if(k.mode==3){
				if(this.btn.Left) this.inputborder_tentaisho(x,y);
				else if(this.btn.Right) this.inputQsubLine(x,y);
			}
		};
		mv.mouseup = function(x,y){
			if(k.mode==3 && this.notInputted()) this.inputBGcolor3(x,y);
		};
		mv.mousemove = function(x,y){
			if(k.mode==1){
				if(this.btn.Right) this.inputBGcolor1(x,y);
			}
			else if(k.mode==3){
				if(this.btn.Left) this.inputborder_tentaisho(x,y);
				else if(this.btn.Right) this.inputQsubLine(x,y);
			}
		};

		mv.inputBGcolor1 = function(x,y){
			var cc = this.cellid(new Pos(x,y));
			if(cc==-1 || cc==this.mouseCell){ return;}
			if(this.inputData==-1){ this.inputData=(bd.QsC(cc)==0)?3:0;}
			bd.sQsC(cc, this.inputData);
			this.mouseCell = cc; 
			pc.paintCell(cc);
		};
		mv.inputBGcolor3 = function(x,y){
			if(k.callmode=='pmake'){ if(menu.getVal('discolor')){ return;} }

			var pos = this.crosspos(new Pos(x,y), 0.34);
			var id = bd.snum(pos.x, pos.y);
			if(id==-1 || bd.getStar(id)==0){ return;}

			var cc;
			var sx=id%(2*k.qcols-1)+1;
			var sy=mf(id/(2*k.qcols-1))+1;
			if     (sx%2==1 && sy%2==1){ cc = bd.cnum(mf(sx/2),mf(sy/2));}
			else if(sx%2==0 && sy%2==0){
				var xc = bd.xnum(mf(sx/2),mf(sy/2));
				if(ans.lcnts.cell[xc]==0){ cc = bd.cnum(mf(sx/2)-1,mf(sy/2)-1);}
				else{ return;}
			}
			else{
				if(bd.QaB(bd.bnum(sx,sy))==0){ cc = bd.cnum(mf((sx-sy%2)/2), mf((sy-sx%2)/2));}
				else{ return;}
			}

			var area = ans.getClist(cc);
			if(mv.encolor(area,1)){
				var d = ans.getSizeOfArea(area,1,f_true);
				pc.paint(d.x1, d.y1, d.x2, d.y2);
			}
		};
		mv.inputborder_tentaisho = function(x,y){
			var pos = this.crosspos(new Pos(x,y), 0.34);
			if(pos.x==this.mouseCell.x && pos.y==this.mouseCell.y){ return;}

			var id = bd.bnum(pos.x, pos.y);
			if(id==-1 && this.mouseCell.x){ id = bd.bnum(this.mouseCell.x, this.mouseCell.y);}

			if(this.mouseCell!=-1 && id!=-1){
				if((pos.x%2==0 && this.mouseCell.x==pos.x && Math.abs(this.mouseCell.y-pos.y)==1) ||
				   (pos.y%2==0 && this.mouseCell.y==pos.y && Math.abs(this.mouseCell.x-pos.x)==1) )
				{
					this.mouseCell=-1

					if(this.inputData==-1){ this.inputData=(bd.QaB(id)==0?1:0);}
					if(this.inputData!=-1){
						bd.sQaB(id, this.inputData);
						pc.paintBorder(id);
					}
				}
			}
			this.mouseCell = pos;
		};
		mv.inputstar = function(x,y){
			var pos = this.crosspos(new Pos(x,y), 0.25);
			if(pos.x==this.mouseCell.x && pos.y==this.mouseCell.y){ return;}

			var id = bd.snum(pos.x, pos.y);
			if(id==-1 && this.mouseCell.x){ id = bd.snum(this.mouseCell.x, this.mouseCell.y);}

			if(id!=-1){
				if(this.btn.Left)      { bd.setStar(id, {0:1,1:2,2:0}[bd.getStar(id)]);}
				else if(this.btn.Right){ bd.setStar(id, {0:2,1:0,2:1}[bd.getStar(id)]);}
			}
			this.mouseCell = pos;
			pc.paint(mf((pos.x-1)/2),mf((pos.y-1)/2),mf((pos.x+1)/2),mf((pos.y+1)/2));
		};

		mv.encolorall = function(){
			var area = ans.searchRLarea(function(id){ return (id!=-1 && bd.QaB(id)==0); }, false);
			for(var id=1;id<=area.max;id++){ this.encolor(area,id);}
			pc.paintAll();
		};
		mv.encolor = function(area,id){
			var ret = bd.getStar(ans.getInsideStar(area,id));

			var flag = false;
			for(var i=0;i<area.room[id].length;i++){
				var c = area.room[id][i];
				if(k.callmode=="pmake" && bd.QsC(c)==3 && ret!=2){ continue;}
				else if(bd.QsC(c)!=(ret>0?ret:0)){
					bd.sQsC(c,(ret>0?ret:0));
					flag = true;
				}
			}
			return flag;
		};

		// キーボード入力系
		kc.keyinput = function(ca){ };

		// 一部qsubで消したくないものがあるため上書き
		base.ASconfirm = function(){
			if(confirm("補助記号を消去しますか？")){
				um.chainflag=0;
				for(i=0;i<k.qcols*k.qrows;i++){
					if(bd.QsC(i)==1){ um.addOpe('cell','qsub',i,bd.QsC(i),0);}
				}
				if(k.isborder){
					for(i=0;i<bd.border.length;i++){
						if(bd.QsB(i)!=0){ um.addOpe('border','qsub',i,bd.QsB(i),0);}
					}
				}
				if(!g.vml){ pc.flushCanvasAll();}

				$.each(bd.cell,   function(i,cell)  { cell.error=0; if(cell.qsub==1){ cell.qsub=0;} });
				$.each(bd.border, function(i,border){ border.error=0; border.qsub=0;});

				pc.paint(0,0,k.qcols-1,k.qrows-1);
			}
		};

		bd.snum = function(sx,sy){
			if(sx<=0 || 2*k.qcols<=sx || sy<=0 || 2*k.qrows<=sy){ return -1;}
			return ((sx-1)+(sy-1)*(2*k.qcols-1));
		};
		bd.getStar = function(id){
			if(id<0||(2*k.qcols-1)*(2*k.qrows-1)<id){ return -1;}
			var sx=id%(2*k.qcols-1)+1;
			var sy=mf(id/(2*k.qcols-1))+1;

			if     (sx%2==1 && sy%2==1){ return bd.QuC(bd.cnum(mf(sx/2),mf(sy/2)));}
			else if(sx%2==0 && sy%2==0){ return bd.QuX(bd.xnum(mf(sx/2),mf(sy/2)));}
			else                       { return bd.QuB(bd.bnum(sx,sy));}
		};
		bd.getStarError = function(id){
			if(id<0||(2*k.qcols-1)*(2*k.qrows-1)<id){ return -1;}
			var sx=id%(2*k.qcols-1)+1;
			var sy=mf(id/(2*k.qcols-1))+1;

			if     (sx%2==1 && sy%2==1){ return bd.ErC(bd.cnum(mf(sx/2),mf(sy/2)));}
			else if(sx%2==0 && sy%2==0){ return bd.ErX(bd.xnum(mf(sx/2),mf(sy/2)));}
			else                       { return bd.ErB(bd.bnum(sx,sy));}
		};
		bd.setStar = function(id,val){
			if(id<0||(2*k.qcols-1)*(2*k.qrows-1)<id){ return;}
			var sx=id%(2*k.qcols-1)+1;
			var sy=mf(id/(2*k.qcols-1))+1;

			if     (sx%2==1 && sy%2==1){ return bd.sQuC(bd.cnum(mf(sx/2),mf(sy/2)),val);}
			else if(sx%2==0 && sy%2==0){ return bd.sQuX(bd.xnum(mf(sx/2),mf(sy/2)),val);}
			else                       { return bd.sQuB(bd.bnum(sx,sy),val);}
		};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.BDlinecolor = "rgb(127, 127, 127)";

		pc.BorderQanscolor = "rgb(72, 72, 72)";

		pc.qsubcolor1 = "rgb(176,255,176)";
		pc.qsubcolor2 = "rgb(108,108,108)";
		pc.qsubcolor3 = "rgb(192,192,192)";

		pc.errbcolor1 = "rgb(255,127,127)";

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);
		//	this.flushCanvasAll();

			this.drawQSubCells(x1,y1,x2,y2);

			this.drawBDline2(x1,y1,x2,y2);

			this.drawBorderAnswers(x1,y1,x2,y2);
			this.drawBorderQsubs(x1,y1,x2,y2);

			this.drawStars(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);
		};

		pc.drawBorderAnswers = function(x1,y1,x2,y2){
			var lw = this.lw, lm = this.lm;

			var idlist = this.borderinside(x1*2-2,y1*2-2,x2*2+2,y2*2+2,f_true);
			for(var i=0;i<idlist.length;i++){
				var id = idlist[i];
				if(bd.QaB(id)==1){
					if     (bd.ErB(id)==1){ g.fillStyle = this.errcolor1;}
					else if(bd.ErB(id)==2){ g.fillStyle = this.errBorderQanscolor2;}
					else{ g.fillStyle = this.BorderQanscolor;}

					if     (bd.border[id].cy%2==1){ if(this.vnop("b"+id+"_bd_",1)){ g.fillRect(bd.border[id].px()-lm,                bd.border[id].py()-mf(k.cheight/2)-lm, lw         , k.cheight+lw);} }
					else if(bd.border[id].cx%2==1){ if(this.vnop("b"+id+"_bd_",1)){ g.fillRect(bd.border[id].px()-mf(k.cwidth/2)-lm, bd.border[id].py()-lm                , k.cwidth+lw, lw          );} }
				}
				else{ this.vhide("b"+id+"_bd_");}
			}
			this.vinc();
		};
		pc.drawStars = function(x1,y1,x2,y2){
			var rsize  = k.cwidth*0.18;
			var rsize2 = k.cwidth*0.14;

			for(var y=2*y1-2;y<=2*y2+2;y++){
				if(y<=0 || 2*k.qrows<=y){ continue;}
				for(var x=2*x1-2;x<=2*x2+2;x++){
					if(x<=0 || 2*k.qcols<=x){ continue;}
					var id = bd.snum(x,y);
					if(bd.getStar(id)==1 || bd.getStar(id)==2){
						if(bd.getStarError(id)){ g.fillStyle=this.errcolor1;}
						else{ g.fillStyle = "black";}
						g.beginPath();
						g.arc(k.p0.x+x*k.cwidth/2, k.p0.y+y*k.cheight/2, rsize , 0, Math.PI*2, false);
						if(this.vnop("s"+id+"_star41a_",1)){ g.fill(); }
					}
					else{ this.vhide("s"+id+"_star41a_");}
					if(bd.getStar(id)==1){
						g.fillStyle = "white";
						g.beginPath();
						g.arc(k.p0.x+x*k.cwidth/2, k.p0.y+y*k.cheight/2, rsize2, 0, Math.PI*2, false);
						if(this.vnop("s"+id+"_star41b_",1)){ g.fill(); }
					}
					else{ this.vhide("s"+id+"_star41b_");}
				}
			}
			this.vinc();
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type, bstr){
			if(type==0 || type==1){ bstr = this.decodeStar(bstr);}
			else if(type==2){ bstr = this.decodeKanpen(bstr);}
		};
		enc.pzlexport = function(type){
			if(type==0)     { document.urloutput.ta.value = this.getURLbase()+"?"+k.puzzleid+this.pzldata();}
			else if(type==1){ document.urloutput.ta.value = this.getDocbase()+k.puzzleid+"/sa/m.html?c"+this.pzldata();}
			else if(type==2){ document.urloutput.ta.value = this.kanpenbase()+"tentaisho.html?problem="+this.pzldataKanpen();}
			else if(type==3){ document.urloutput.ta.value = this.getURLbase()+"?m+"+k.puzzleid+this.pzldata();}
		};
		enc.pzldata = function(){
			return "/"+k.qcols+"/"+k.qrows+"/"+this.encodeStar();
		};

		enc.decodeStar = function(bstr){
			var s=0;
			for(var i=0;i<bstr.length;i++){
				var ca = bstr.charAt(i);
				if(this.include(ca,"0","f")){
					var val = parseInt(ca,16);
					bd.setStar(s,val%2+1);
					s+=(mf(val/2)+1);
				}
				else if(this.include(ca,"g","z")){ s+=(parseInt(ca,36)-15);}

				if(s>=(2*k.qcols-1)*(2*k.qrows-1)){ break;}
			}
			return bstr.substring(i+1,bstr.length);
		};
		enc.encodeStar = function(){
			var count = 0;
			var cm = "";

			for(var s=0;s<(2*k.qcols-1)*(2*k.qrows-1);s++){
				var pstr = "";
				if(bd.getStar(s)>0){
					for(var i=0;i<=6;i++){
						if(bd.getStar(s+i+1)>0){ pstr=""+(2*i+(bd.getStar(s)-1)).toString(16); s+=i; break;}
					}
					if(pstr==""){ pstr=(13+bd.getStar(s)).toString(16); s+=7;}
				}
				else{ pstr=" "; count++;}

				if(count==0)      { cm += pstr;}
				else if(pstr!=" "){ cm += ((count+15).toString(36)+pstr); count=0;}
				else if(count==20){ cm += "z"; count=0;}
			}
			if(count>0){ cm += ((count+15).toString(36));}

			return cm;
		};

		enc.decodeKanpen = function(bstr){
			var array = bstr.split("/");
			var c=0;
			for(var i=0;i<array.length;i++){
				for(var s=0;s<array[i].length;s++){
					if     (array[i].charAt(s) == "1"){ bd.setStar(c, 1);}
					else if(array[i].charAt(s) == "2"){ bd.setStar(c, 2);}
					c++;
				}
			}
			return "";
		};
		enc.pzldataKanpen = function(){
			var bstr = "";
			for(var i=0;i<(2*k.qcols-1)*(2*k.qrows-1);i++){
				if(i%(2*k.qcols-1)==0){ bstr += "/";}
				if     (bd.getStar(i)==1){ bstr += "1";}
				else if(bd.getStar(i)==2){ bstr += "2";}
				else                     { bstr += ".";}
			}
			return ""+k.qrows+"/"+k.qcols+bstr;
		};

		//---------------------------------------------------------
		fio.decodeOthers = function(array){
			if(array.length<2*k.qrows-1){ return false;}
			var c=0;
			for(var i=0;i<array.length;i++){
				for(var s=0;s<array[i].length;s++){
					if     (array[i].charAt(s) == "1"){ bd.setStar(c, 1);}
					else if(array[i].charAt(s) == "2"){ bd.setStar(c, 2);}
					c++;
				}
			}
			return true;
		};
		fio.encodeOthers = function(){
			var bstr = enc.pzldataKanpen();
			var barray = bstr.split("/");
			barray.shift(); barray.shift();
			return (""+barray.join("/")+"/");
		};

		fio.kanpenOpen = function(array){
			var barray = array.slice(0,2*k.qrows-1);
			enc.decodeKanpen(""+barray.join("/"));

			barray = array.slice(2*k.qrows,3*k.qrows);
			var carray = new Array();
			for(var a=0;a<barray.length;a++){
				var arr = barray[a].split(" ");
				for(var i=0;i<arr.length;i++){ if(arr[i]!=''){ carray.push(arr[i]);} }
			}
			for(var id=0;id<bd.border.length;id++){
				var cc1 = bd.cc1(id), cc2 = bd.cc2(id);
				bd.sQaB(id,(cc1!=-1 && cc2!=-1 && carray[cc1]!=carray[cc2])?1:0);
			}
		};
		fio.kanpenSave = function(){
			var barray = enc.pzldataKanpen().split("/");
			barray.shift(); barray.shift();

			var rarea = ans.searchRLarea(function(id){ return (id!=-1 && bd.QaB(id)==0); }, false);
			var bstr =  barray.join("/")+"/"+rarea.max+"/";
			for(var c=0;c<bd.cell.length;c++){
				bstr += (""+(rarea.check[c]-1)+" ");
				if((c+1)%k.qcols==0){ bstr += "/";}
			}
			return bstr;
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			if( !this.checkLineOnStar() ){
				this.setAlert('星を線が通過しています。', 'A line goes over the star.'); return false;
			}

			var rarea = this.searchRLarea(function(id){ return (id!=-1 && bd.QaB(id)==0); }, false);
			this.checkAreaStar(rarea);
			if( !this.checkErrorFlag(rarea, -1) ){
				this.setAlert('星が含まれていない領域があります。','A block has no stars.'); return false;
			}

			if( !this.checkFractal(rarea) ){
				this.setAlert('領域が星を中心に点対称になっていません。', 'A area is not point symmetric about the star.'); return false;
			}

			if( !this.checkErrorFlag(rarea, -2) ){
				this.setAlert('星が複数含まれる領域があります。','A block has two or more stars.'); return false;
			}

			return true;
		};

		ans.checkLineOnStar = function(){
			for(var s=0;s<(2*k.qcols-1)*(2*k.qrows-1);s++){
				if(bd.getStar(s)<=0){ continue;}
				var sx=s%(2*k.qcols-1)+1, sy=mf(s/(2*k.qcols-1))+1;
				if(sx%2==0 && sy%2==0){
					if(this.lcnts.cell[bd.xnum(mf(sx/2),mf(sy/2))]!=0){
						this.setCrossBorderError(mf(sx/2),mf(sy/2));
						return false;
					}
				}
				else if((sx+sy)%2==1){
					if(bd.QaB(bd.bnum(sx,sy))!=0){
						bd.sErB(bd.bnum(sx,sy),1);
						return false;
					}
				}
			}
			return true;
		};

		ans.checkFractal = function(area){
			for(var id=1;id<=area.max;id++){
				var sc = area.starid[id];
				if(sc<0){ continue;}
				var sx=sc%(2*k.qcols-1)+1, sy=mf(sc/(2*k.qcols-1))+1;
				var movex=0, movey=0;
				for(var i=0;i<area.room[id].length;i++){
					var c=area.room[id][i];
					var ccopy = bd.cnum(sx-bd.cell[c].cx-1, sy-bd.cell[c].cy-1);
					if(ccopy==-1||area.check[c]!=area.check[ccopy]){
						bd.sErC(area.room[id],1); return false;
					}
				}
			}
			return true;
		};

		ans.checkAreaStar = function(area){
			area.starid = new Array();
			for(var id=1;id<=area.max;id++){
				area.starid[id] = this.getInsideStar(area,id);
			}
		};
		ans.checkErrorFlag = function(area, val){
			for(var id=1;id<=area.max;id++){
				if(area.starid[id]==val){ bd.sErC(area.room[id],1); return false;}
			}
			return true;
		};

		ans.getInsideStar = function(area,id){
			var cnt=0, ret=-1;
			for(var i=0;i<area.room[id].length;i++){
				var c=area.room[id][i];
				var cx = bd.cell[c].cx, cy = bd.cell[c].cy;
				if(bd.getStar(bd.snum(cx*2+1,cy*2+1))>0){
					cnt++; ret=bd.snum(cx*2+1,cy*2+1);
				}
				if(bd.db(c)!=-1 && bd.QaB(bd.db(c))==0 && bd.getStar(bd.snum(cx*2+1,cy*2+2))>0){
					cnt++; ret=bd.snum(cx*2+1,cy*2+2);
				}
				if(bd.rb(c)!=-1 && bd.QaB(bd.rb(c))==0 && bd.getStar(bd.snum(cx*2+2,cy*2+1))>0){
					cnt++; ret=bd.snum(cx*2+2,cy*2+1);
				}
				if(bd.xnum(cx+1,cy+1)!=-1 && this.lcnts.cell[bd.xnum(cx+1,cy+1)]==0 && bd.getStar(bd.snum(cx*2+2,cy*2+2))>0){
					cnt++; ret=bd.snum(cx*2+2,cy*2+2);
				}

				if(cnt>1){ return -2;}
			}
			return ret;
		};
		ans.getClist = function(cc){
			var area = new AreaInfo();
			var func = function(id){ return (id!=-1 && bd.QaB(id)!=1); }
			for(var c=0;c<bd.cell.length;c++){ area.check[c]=-1;}
			area.max=1;
			area.room[1]=new Array();
			this.gc0(func, area, cc);
			return area;
		};
		ans.gc0 = function(func, area, i){
			if(area.check[i]!=-1){ return;}
			area.check[i] = 1;
			area.room[1].push(i);
			if( func(bd.ub(i)) ){ this.gc0(func, area, bd.up(i));}
			if( func(bd.db(i)) ){ this.gc0(func, area, bd.dn(i));}
			if( func(bd.lb(i)) ){ this.gc0(func, area, bd.lt(i));}
			if( func(bd.rb(i)) ){ this.gc0(func, area, bd.rt(i));}
			return;
		};
	}
};
