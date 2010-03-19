//
// パズル固有スクリプト部 天体ショー版 tentaisho.js v3.3.0
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
		k.isLineCross     = 0;	// 1:線が交差するパズル
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

		//k.def_csize = 36;
		//k.def_psize = 24;
		//k.area = { bcell:0, wcell:0, number:0};	// areaオブジェクトで領域を生成する

		if(k.EDITOR){
			base.setExpression("　問題作成モード時に、マウスの右ボタンで下絵を描くことが出来ます。この背景色は「星をクリック」や「色をつける」ボタンで上書きされます。",
							   " In edit mode, it is able to paint a design by Right Click. This background color is superscripted by clicking star or pressing 'Color up' button.");
		}
		else{
			base.setExpression("　星をクリックすると色がぬれます。",
							   " Click star to paint.");
		}
		base.setTitle("天体ショー","Tentaisho");
		base.setFloatbgcolor("rgb(0, 224, 0)");

		enc.pidKanpen = 'tentaisho';
	},
	menufix : function(){
		if(k.EDITOR){
			pp.addCheck('discolor','setting',false,'色分け無効化','Disable color');
			pp.setLabel('discolor', '星クリックによる色分けを無効化する', 'Disable Coloring up by clicking star');
		}

		var el = ee.createEL(menu.EL_BUTTON, 'btncolor');
		menu.addButtons(el, ee.binder(mv, mv.encolorall), "色をつける","Color up");
		ee('btnarea').appendEL(el);
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(k.editmode){
				if(this.btn.Left) this.inputstar();
				else if(this.btn.Right) this.inputBGcolor1();
			}
			else if(k.playmode){
				if(this.btn.Left) this.inputborder_tentaisho();
				else if(this.btn.Right) this.inputQsubLine();
			}
		};
		mv.mouseup = function(){
			if(k.playmode && this.notInputted()) this.inputBGcolor3();
		};
		mv.mousemove = function(){
			if(k.editmode){
				if(this.btn.Right) this.inputBGcolor1();
			}
			else if(k.playmode){
				if(this.btn.Left) this.inputborder_tentaisho();
				else if(this.btn.Right) this.inputQsubLine();
			}
		};

		mv.inputBGcolor1 = function(){
			var cc = this.cellid();
			if(cc==-1 || cc==this.mouseCell){ return;}
			if(this.inputData==-1){ this.inputData=(bd.QsC(cc)==0)?3:0;}
			bd.sQsC(cc, this.inputData);
			this.mouseCell = cc; 
			pc.paintCell(cc);
		};
		mv.inputBGcolor3 = function(){
			if(k.EDITOR){ if(pp.getVal('discolor')){ return;} }

			var pos = this.crosspos(0.34);
			var id = bd.snum(pos.x, pos.y);
			if(id==-1 || bd.getStar(id)==0){ return;}

			var cc;
			var sx=id%(2*k.qcols-1)+1;
			var sy=mf(id/(2*k.qcols-1))+1;
			if     ( (sx&1) &&  (sy&1)){ cc = bd.cnum(sx>>1,sy>>1);}
			else if(!(sx&1) && !(sy&1)){
				var xc = bd.xnum(sx>>1,sy>>1);
				if(area.lcntCross(xc)==0){ cc = bd.cnum((sx>>1)-1,(sy>>1)-1);}
				else{ return;}
			}
			else{
				if(bd.QaB(bd.bnum(sx,sy))==0){ cc = bd.cnum((sx-sy%2)>>1, (sy-sx%2)>>1);}
				else{ return;}
			}

			var clist = area.room[area.room.id[cc]].clist;
			if(mv.encolor(clist)){
				var d = ans.getSizeOfClist(clist,f_true);
				pc.paint(d.x1, d.y1, d.x2, d.y2);
			}
		};
		mv.inputborder_tentaisho = function(){
			var pos = this.crosspos(0.34);
			if(pos.x==this.mouseCell.x && pos.y==this.mouseCell.y){ return;}

			var id = bd.bnum(pos.x, pos.y);
			if(id==-1 && this.mouseCell.x){ id = bd.bnum(this.mouseCell.x, this.mouseCell.y);}

			if(this.mouseCell!=-1 && id!=-1){
				if((!(pos.x&1) && this.mouseCell.x==pos.x && Math.abs(this.mouseCell.y-pos.y)==1) ||
				   (!(pos.y&1) && this.mouseCell.y==pos.y && Math.abs(this.mouseCell.x-pos.x)==1) )
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
		mv.inputstar = function(){
			var pos = this.crosspos(0.25);
			if(pos.x==this.mouseCell.x && pos.y==this.mouseCell.y){ return;}

			var id = bd.snum(pos.x, pos.y);
			if(id==-1 && this.mouseCell.x){ id = bd.snum(this.mouseCell.x, this.mouseCell.y);}

			if(id!=-1){
				if(this.btn.Left)      { bd.setStar(id, {0:1,1:2,2:0}[bd.getStar(id)]);}
				else if(this.btn.Right){ bd.setStar(id, {0:2,1:0,2:1}[bd.getStar(id)]);}
			}
			this.mouseCell = pos;
			pc.paint((pos.x-1)>>1,(pos.y-1)>>1,(pos.x+1)>>1,(pos.y+1)>>1);
		};

		mv.encolorall = function(){
			var rinfo = area.getRoomInfo();
			for(var id=1;id<=rinfo.max;id++){ this.encolor(rinfo.room[id].idlist);}
			pc.paintAll();
		};
		mv.encolor = function(clist){
			var ret = bd.getStar(ans.getInsideStar(clist));

			var flag = false;
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				if(k.EDITOR && bd.QsC(c)==3 && ret!=2){ continue;}
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
		menu.ex.ASconfirm = function(){
			if(confirm(menu.isLangJP()?"補助記号を消去しますか？":"Do you want to erase the auxiliary marks?")){
				um.newOperation(true);
				for(i=0;i<bd.cellmax;i++){
					if(bd.QsC(i)===1){
						um.addOpe(k.CELL,k.QSUB,i,bd.QsC(i),0);
						bd.cell[i].qsub = 0;
					}
				}
				for(i=0;i<bd.bdmax;i++){
					if(bd.QsB(i)!==0){
						um.addOpe(k.BORDER,k.QSUB,i,bd.QsB(i),0);
						bd.border[i].qsub = 0;
					}
				}

				if(g.use.canvas){ pc.flushCanvasAll();}
				pc.paintAll();
			}
		};

		bd.snum = function(sx,sy){
			if(sx<=0 || 2*k.qcols<=sx || sy<=0 || 2*k.qrows<=sy){ return -1;}
			return ((sx-1)+(sy-1)*(2*k.qcols-1));
		};
		bd.getStar = function(id){
			if(id<0||(2*k.qcols-1)*(2*k.qrows-1)<=id){ return -1;}
			var sx=id%(2*k.qcols-1)+1;
			var sy=mf(id/(2*k.qcols-1))+1;

			if     ( (sx&1) &&  (sy&1)){ return bd.QuC(bd.cnum(sx>>1,sy>>1));}
			else if(!(sx&1) && !(sy&1)){ return bd.QuX(bd.xnum(sx>>1,sy>>1));}
			else                       { return bd.QnB(bd.bnum(sx,sy));}
		};
		bd.getStarError = function(id){
			if(id<0||(2*k.qcols-1)*(2*k.qrows-1)<id){ return -1;}
			var sx=id%(2*k.qcols-1)+1;
			var sy=mf(id/(2*k.qcols-1))+1;

			if     ( (sx&1) &&  (sy&1)){ return bd.ErC(bd.cnum(sx>>1,sy>>1));}
			else if(!(sx&1) && !(sy&1)){ return bd.ErX(bd.xnum(sx>>1,sy>>1));}
			else                       { return bd.ErB(bd.bnum(sx,sy));}
		};
		bd.setStar = function(id,val){
			if(id<0||(2*k.qcols-1)*(2*k.qrows-1)<id){ return;}
			var sx=id%(2*k.qcols-1)+1;
			var sy=mf(id/(2*k.qcols-1))+1;

			if     ( (sx&1) &&  (sy&1)){ bd.sQuC(bd.cnum(sx>>1,sy>>1),val);}
			else if(!(sx&1) && !(sy&1)){ bd.sQuX(bd.xnum(sx>>1,sy>>1),val);}
			else{
				um.disCombine = 1;
				bd.sQnB(bd.bnum(sx,sy),val);
				um.disCombine = 0;
			}
		};

		area.call_setBorder = function(id,val,type){
			if(type==k.QANS){ this.setBorder(id,val);}
		};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_LIGHT;
		pc.BorderQanscolor = "rgb(72, 72, 72)";
		pc.qsubcolor1 = "rgb(176,255,176)";
		pc.qsubcolor2 = "rgb(108,108,108)";
		pc.errbcolor1 = pc.errbcolor1_DARK;
		pc.setBGCellColorFunc('qsub3');

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);
		//	this.flushCanvasAll();

			this.drawBGCells(x1,y1,x2,y2);
			this.drawDashedGrid(x1,y1,x2,y2);

			this.drawBorderAnswers(x1,y1,x2,y2);
			this.drawBorderQsubs(x1,y1,x2,y2);

			this.drawStars(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);
		};

		pc.drawBorderAnswers = function(x1,y1,x2,y2){
			var lw = this.lw, lm = this.lm;
			var header = "b_bd_";

			var idlist = this.borderinside(x1*2-2,y1*2-2,x2*2+2,y2*2+2);
			for(var i=0;i<idlist.length;i++){
				var id = idlist[i];
				if(bd.border[id].qans===1){
					if     (bd.border[id].error===1){ g.fillStyle = this.errcolor1;}
					else if(bd.border[id].error===2){ g.fillStyle = this.errBorderQanscolor2;}
					else                            { g.fillStyle = this.BorderQanscolor;}

					if(this.vnop(header+id,this.FILL)){
						if     (bd.border[id].cy&1){ g.fillRect(bd.border[id].px-lm, bd.border[id].py-mf(k.cheight/2)-lm,  lw, k.cheight+lw);}
						else if(bd.border[id].cx&1){ g.fillRect(bd.border[id].px-mf(k.cwidth/2)-lm,  bd.border[id].py-lm,  k.cwidth+lw,  lw);}
					}
				}
				else{ this.vhide(header+id);}
			}
			this.vinc();
		};
		pc.drawStars = function(x1,y1,x2,y2){
			var rsize  = k.cwidth*0.18;
			var rsize2 = k.cwidth*0.14;
			var headers = ["s_star41a_", "s_star41b_"];

			for(var y=2*y1-2;y<=2*y2+2;y++){
				if(y<=0){ y=0; continue;} if(2*k.qrows<=y){ break;}
				for(var x=2*x1-2;x<=2*x2+2;x++){
					if(x<=0){ x=0; continue;} if(2*k.qcols<=x){ break;}

					var id = bd.snum(x,y);

					if(bd.getStar(id)===1 || bd.getStar(id)===2){
						var iserr = bd.getStarError(id);
						g.fillStyle = (iserr ? this.errcolor1 : this.Cellcolor);
						if(this.vnop(headers[0]+id,this.FILL)){
							g.fillCircle(k.p0.x+x*k.cwidth/2, k.p0.y+y*k.cheight/2, rsize);
						}
					}
					else{ this.vhide(headers[0]+id);}

					if(bd.getStar(id)===1){
						g.fillStyle = (iserr ? this.errbcolor1 : "white");
						if(this.vnop(headers[1]+id,this.FILL)){
							g.fillCircle(k.p0.x+x*k.cwidth/2, k.p0.y+y*k.cheight/2, rsize2);
						}
					}
					else{ this.vhide(headers[1]+id);}
				}
			}
			this.vinc();
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decodeStar();
		};
		enc.pzlexport = function(type){
			this.encodeStar();
		};

		enc.decodeKanpen = function(){
			fio.decodeStarFile();
		};
		enc.encodeKanpen = function(){
			fio.encodeStarFile();
		};

		enc.decodeStar = function(bstr){
			var s=0, bstr = this.outbstr;
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
			this.outbstr = bstr.substr(i+1);
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

			this.outbstr += cm;
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeStarFile();
			this.decodeBorderAns();
			this.decodeCellQsub();
		};
		fio.encodeData = function(){
			this.encodeStarFile();
			this.encodeBorderAns();
			this.encodeCellQsub();
		};

		fio.kanpenOpen = function(){
			this.decodeStarFile();
			this.decodeAnsAreaRoom();
		};
		fio.kanpenSave = function(){
			this.encodeStarFile();
			this.encodeAnsAreaRoom();
		};

		fio.decodeStarFile = function(){
			var array = this.readLines(2*k.qrows-1), s=0;
			for(var i=0;i<array.length;i++){
				for(var c=0;c<array[i].length;c++){
					if     (array[i].charAt(c) == "1"){ bd.setStar(s, 1);}
					else if(array[i].charAt(c) == "2"){ bd.setStar(s, 2);}
					s++;
				}
			}
		};
		fio.encodeStarFile = function(){
			var s=0;
			for(var i=0;i<2*k.qrows-1;i++){
				for(var c=0;c<2*k.qcols-1;c++){
					if     (bd.getStar(s)==1){ this.datastr += "1";}
					else if(bd.getStar(s)==2){ this.datastr += "2";}
					else                     { this.datastr += ".";}
					s++;
				}
				this.datastr += "/";
			}
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			if( !this.checkStarOnLine() ){
				this.setAlert('星を線が通過しています。', 'A line goes over the star.'); return false;
			}

			var rinfo = area.getRoomInfo();
			this.setAreaStar(rinfo);
			if( !this.checkErrorFlag(rinfo, -1) ){
				this.setAlert('星が含まれていない領域があります。','A block has no stars.'); return false;
			}

			if( !this.checkFractal(rinfo) ){
				this.setAlert('領域が星を中心に点対称になっていません。', 'A area is not point symmetric about the star.'); return false;
			}

			if( !this.checkErrorFlag(rinfo, -2) ){
				this.setAlert('星が複数含まれる領域があります。','A block has two or more stars.'); return false;
			}

			return true;
		};

		ans.checkStarOnLine = function(){
			var result = true;
			for(var s=0;s<(2*k.qcols-1)*(2*k.qrows-1);s++){
				if(bd.getStar(s)<=0){ continue;}
				var sx=s%(2*k.qcols-1)+1, sy=mf(s/(2*k.qcols-1))+1;
				if(!(sx&1) && !(sy&1)){
					if(area.lcntCross(bd.xnum(sx>>1,sy>>1))!=0){
						if(this.inAutoCheck){ return false;}
						this.setCrossBorderError(sx>>1,sy>>1);
						result = false;
					}
				}
				else if((sx+sy)&1){
					if(bd.QaB(bd.bnum(sx,sy))!=0){
						if(this.inAutoCheck){ return false;}
						bd.sErB(bd.bnum(sx,sy),1);
						result = false;
					}
				}
			}
			return result;
		};

		ans.setAreaStar = function(rinfo){
			rinfo.starid = [];
			for(var id=1;id<=rinfo.max;id++){
				rinfo.starid[id] = this.getInsideStar(rinfo.room[id].idlist);
			}
		};
		ans.getInsideStar = function(clist){
			var cnt=0, ret=-1;
			for(var i=0;i<clist.length;i++){
				var c=clist[i];
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
				if(bd.xnum(cx+1,cy+1)!=-1 && area.lcntCross(bd.xnum(cx+1,cy+1))==0 && bd.getStar(bd.snum(cx*2+2,cy*2+2))>0){
					cnt++; ret=bd.snum(cx*2+2,cy*2+2);
				}

				if(cnt>1){ return -2;}
			}
			return ret;
		};

		ans.checkFractal = function(rinfo){
			var result = true;
			for(var r=1;r<=rinfo.max;r++){
				var sc = rinfo.starid[r];
				if(sc<0){ continue;}
				var sx=sc%(2*k.qcols-1)+1, sy=mf(sc/(2*k.qcols-1))+1;
				for(var i=0;i<rinfo.room[r].idlist.length;i++){
					var c=rinfo.room[r].idlist[i];
					var ccopy = bd.cnum(sx-bd.cell[c].cx-1, sy-bd.cell[c].cy-1);
					if(ccopy==-1||rinfo.id[c]!=rinfo.id[ccopy]){
						if(this.inAutoCheck){ return false;}
						bd.sErC(rinfo.room[r].idlist,1); result = false;
					}
				}
			}
			return result;
		};

		ans.checkErrorFlag = function(rinfo, val){
			var result = true;
			for(var id=1;id<=rinfo.max;id++){
				if(rinfo.starid[id]!==val){ continue;}

				if(this.inAutoCheck){ return false;}
				bd.sErC(rinfo.room[id].idlist,1);
				result = false;
			}
			return result;
		};
	}
};
