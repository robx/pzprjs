//
// パズル固有スクリプト部 ごきげんななめ・輪切版 wagiri.js v3.2.5β
//
Puzzles.wagiri = function(){ };
Puzzles.wagiri.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 7;}	// 盤面の横幅
		if(!k.qrows){ k.qrows = 7;}	// 盤面の縦幅
		k.irowake = 0;			// 0:色分け設定無し 1:色分けしない 2:色分けする

		k.iscross      = 1;		// 1:Crossが操作可能なパズル
		k.isborder     = 0;		// 1:Border/Lineが操作可能なパズル
		k.isextendcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

		k.isoutsidecross  = 1;	// 1:外枠上にCrossの配置があるパズル
		k.isoutsideborder = 0;	// 1:盤面の外枠上にborderのIDを用意する
		k.isLineCross     = 0;	// 1:線が交差するパズル
		k.isCenterLine    = 0;	// 1:マスの真ん中を通る線を回答として入力するパズル
		k.isborderAsLine  = 0;	// 1:境界線をlineとして扱う

		k.dispzero      = 1;	// 1:0を表示するかどうか
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

		//k.def_csize = 36;
		//k.def_psize = 24;
		//k.area = { bcell:0, wcell:0, number:0};	// areaオブジェクトで領域を生成する

		base.setTitle("ごきげんななめ・輪切","Gokigen-naname:wagiri");
		base.setExpression("　<span style=\"color:red;\">！！開発途中版です！！</span><br>　マウスで斜線を入力できます。",
						   " <span style=\"color:red;\">!!This is developng version.!!</span><br> Click to input slashes.");
		base.setFloatbgcolor("rgb(0, 127, 0)");
		base.proto = 1;
	},
	menufix : function(){
		menu.addUseToFlags();
//		menu.addRedLineToFlags();
	},
	finalfix : function(){
		ee('btnclear2').el.style.display = 'none';
	},
	protoChange : function(){
	},
	protoOriginal : function(){
		ee('btnclear2').el.style.display = 'inline';
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(k.playmode){ this.inputslash();}
			else if(k.editmode){
				if(!kp.enabled()){ this.inputquestion();}
				else{ kp.display();}
			}
		};
		mv.mouseup = function(){ };
		mv.mousemove = function(){ };
		mv.dispBlue = function(){
			var cc = this.cellid();
			if(cc==-1 || bd.QaC(cc)==-1){ return;}

			var check = [];
			for(var i=0;i<bd.crossmax;i++){ check[i]=0;}

			var fc = bd.xnum(bd.cell[cc].cx+(bd.QaC(cc)==1?0:1),bd.cell[cc].cy);
			ans.searchline(check, 0, fc);
			for(var c=0;c<bd.cellmax;c++){
				if(bd.QaC(c)==1 && check[bd.xnum(bd.cell[c].cx  ,bd.cell[c].cy)]==1){ bd.sErC([c],2);}
				if(bd.QaC(c)==2 && check[bd.xnum(bd.cell[c].cx+1,bd.cell[c].cy)]==1){ bd.sErC([c],2);}
			}

			ans.errDisp = true;
			pc.paintAll();
		};

		mv.inputquestion = function(){
			var pos = this.crosspos(0.33);
			if(pos.x<tc.minx || tc.maxx<pos.x || pos.y<tc.miny || tc.maxy<pos.y){ return;}
			if(!(pos.x&1) && !(pos.y&1)){ this.inputcross(); return;}

			var cc = this.cellid();
			if(cc!==tc.getTCC()){
				var tcx = tc.cursolx, tcy = tc.cursoly, flag = false;
				tc.setTCC(cc);
				pc.paint((tcx>>1)-1, (tcy>>1)-1, (tcx>>1)+1, (tcy>>1)+1);
				pc.paint((pos.x>>1)-1, (pos.y>>1)-1, pos.x>>1, pos.y>>1);
			}
			else if(cc!=-1){
				var trans = (this.btn.Left ? [-1,1,0,2,-2] : [2,-2,0,-1,1]);
				bd.sQnC(cc,trans[bd.QnC(cc)+2]);
				pc.paintCell(cc);
			}
		};

		mv.inputslash = function(){
			var cc = this.cellid();
			if(cc==-1){ return;}

			if     (k.use==1){ bd.sQaC(cc, (bd.QaC(cc)!=(this.btn.Left?1:2)?(this.btn.Left?1:2):-1));}
			else if(k.use==2){
				if(bd.QaC(cc)==-1){ bd.sQaC(cc, (this.btn.Left?1:2));}
				else{ bd.sQaC(cc, (this.btn.Left?{1:2,2:-1}:{1:-1,2:1})[bd.QaC(cc)]);}
			}

			pc.paint(bd.cell[cc].cx-1, bd.cell[cc].cy-1, bd.cell[cc].cx+1, bd.cell[cc].cy+1);
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(ca=='z' && !this.keyPressed){ this.isZ=true; return;}
			if(k.playmode){ return;}
			if(this.moveTBorder(ca)){ return;}
			this.key_inputcross(ca,4);
		};
		kc.keyup = function(ca){ if(ca=='z'){ this.isZ=false;} };

		kc.isZ = false;

		if(k.EDITOR){
			kp.generate(4, true, false, '');
			kp.ctl[1].target = k.CROSS;
			kp.kpinput = function(ca){
				kc.key_inputcross(ca,4);
			};
		}

		menu.ex.adjustSpecial = function(type,key){
			um.disableRecord();
			if(type>=1 && type<=4){ // 反転・回転全て
				for(var c=0;c<bd.cellmax;c++){ if(bd.QaC(c)!=-1){ bd.sQaC(c,{1:2,2:1}[bd.QaC(c)]); } }
			}
			um.enableRecord();
		};

		tc.minx = 0;
		tc.miny = 0;
		tc.maxx = 2*k.qcols;
		tc.maxy = 2*k.qrows;
		tc.setTXC(0);

		bd.maxnum = 4;
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_DLIGHT;
		pc.errcolor1 = "red";
		pc.errcolor2 = "blue";

		pc.crosssize = 0.33;
		pc.chassisflag = false;

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);
		//	this.flushCanvasAll();

			this.drawBGCells(x1,y1,x2,y2);
			this.drawDashedGrid(x1,y1,x2,y2);

			this.dispLetters_wagiri(x1,y1,x2,y2);
			this.drawSlashes(x1,y1,x2,y2);

			this.drawCrosses(x1,y1,x2+1,y2+1);
			this.drawTarget_wagiri(x1,y1,x2,y2);
		};

		// オーバーライド
		pc.setBGCellColor = function(c){
			if(bd.cell[c].qans===-1 && bd.cell[c].error===1){
				g.fillStyle = this.errbcolor1;
				return true;
			}
			return false;
		};

		pc.dispLetters_wagiri = function(x1,y1,x2,y2){
			var clist = this.cellinside(x1,y1,x2,y2);
			for(var i=0;i<clist.length;i++){
				var id = clist[i];
				var num = bd.cell[id].qnum, obj = bd.cell[id];
				if(num>=1 && num<=2){ text = ({1:"輪",2:"切"})[num];}
				else if(num===-2){ text = "?";}
				else{ this.hideEL(obj.numobj); return;}

				if(!obj.numobj){ obj.numobj = this.CreateDOMAndSetNop();}
				this.dispnum(obj.numobj, 1, text, 0.70, this.getNumberColor(id), obj.px, obj.py);
			}
		};

		pc.drawSlashes = function(x1,y1,x2,y2){
			var headers = ["c_sl1_", "c_sl2_"];
			g.lineWidth = (mf(k.cwidth/8)>=2?mf(k.cwidth/8):2);

			var clist = this.cellinside(x1,y1,x2,y2);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];

				if(bd.cell[c].qans!=-1){
					if     (bd.cell[c].error==1){ g.strokeStyle = this.errcolor1;}
					else if(bd.cell[c].error==2){ g.strokeStyle = this.errcolor2;}
					else                        { g.strokeStyle = this.Cellcolor;}

					if(bd.cell[c].qans==1){
						if(this.vnop(headers[0]+c,0)){
							this.inputPath([bd.cell[c].px,bd.cell[c].py, 0,0, k.cwidth,k.cheight], true);
							g.stroke();
						}
					}
					else{ this.vhide(headers[0]+c);}

					if(bd.cell[c].qans==2){
						if(this.vnop(headers[1]+c,0)){
							this.inputPath([bd.cell[c].px,bd.cell[c].py, k.cwidth,0, 0,k.cheight], true);
							g.stroke();
						}
					}
					else{ this.vhide(headers[1]+c);}
				}
				else{ this.vhide([headers[0]+c, headers[1]+c]);}
			}
			this.vinc();
		};

		pc.drawTarget_wagiri = function(x1,y1,x2,y2){
			if(k.playmode){
				this.hideTCell();
				this.hideTCross();
				this.hideTBorder();
			}
			else if((tc.cursolx&1)&&(tc.cursoly&1)){
				this.drawTCell(x1-1,y1-1,x2+1,y2+1);
				this.hideTCross();
				this.hideTBorder();
			}
			else if(!(tc.cursolx&1)&&!(tc.cursoly&1)){
				this.hideTCell();
				this.drawTCross(x1-1,y1-1,x2+1,y2+1);
				this.hideTBorder();
			}
			else{
				this.hideTCell();
				this.hideTCross();
				this.drawTBorder(x1-1,y1-1,x2+1,y2+1);
			}
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			var oldflag = ((type==1 && !this.checkpflag("c")) || (type==0 && this.checkpflag("d")));
			if(!oldflag){ this.decode4Cross();}
			else        { this.decodecross_old();}
		};
		enc.pzlexport = function(type){
			if(type==1){ this.outpflag = 'c';}
			this.encode4Cross();
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeCrossNum();
			this.decodeCellQanssub();
		};
		fio.encodeData = function(){
			this.encodeCrossNum();
			this.encodeCellQanssub();
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			var sdata=this.getSlashData();
			if( !this.checkLoopLine(sdata, false) ){
				this.setAlert('"切"が含まれた線が輪っかになっています。', 'There is a loop that consists "切".'); return false;
			}

			if( !this.checkQnumCross() ){
				this.setAlert('数字に繋がる線の数が間違っています。', 'A number is not equal to count of lines that is connected to it.'); return false;
			}

			if( !this.checkLoopLine(sdata, true) ){
				this.setAlert('"輪"が含まれた線が輪っかになっていません。', 'There is not a loop that consists "輪".'); return false;
			}

			if( !this.checkAllCell(function(c){ return (bd.QaC(c)==-1);}) ){
				this.setAlert('斜線がないマスがあります。','There is a empty cell.'); return false;
			}

			return true;
		};

		ans.scntCross = function(id){
			if(id==-1){ return -1;}
			var xx=bd.cross[id].cx, xy=bd.cross[id].cy;
			var cc, cnt=0;
			cc=bd.cnum(xx-1,xy-1); if(cc!=-1 && bd.QaC(cc)==1){ cnt++;}
			cc=bd.cnum(xx  ,xy-1); if(cc!=-1 && bd.QaC(cc)==2){ cnt++;}
			cc=bd.cnum(xx-1,xy  ); if(cc!=-1 && bd.QaC(cc)==2){ cnt++;}
			cc=bd.cnum(xx  ,xy  ); if(cc!=-1 && bd.QaC(cc)==1){ cnt++;}
			return cnt;
		};
		ans.scntCross2 = function(id){
			if(id==-1){ return -1;}
			var xx=bd.cross[id].cx, xy=bd.cross[id].cy;
			var cc, cnt=0;
			cc=bd.cnum(xx-1,xy-1); if(cc!=-1 && bd.ErC(cc)==1 && bd.QaC(cc)==1){ cnt++;}
			cc=bd.cnum(xx  ,xy-1); if(cc!=-1 && bd.ErC(cc)==1 && bd.QaC(cc)==2){ cnt++;}
			cc=bd.cnum(xx-1,xy  ); if(cc!=-1 && bd.ErC(cc)==1 && bd.QaC(cc)==2){ cnt++;}
			cc=bd.cnum(xx  ,xy  ); if(cc!=-1 && bd.ErC(cc)==1 && bd.QaC(cc)==1){ cnt++;}
			return cnt;
		};

		ans.getSlashData = function(){
			var check=[], scnt=this.getScnt();
			for(var c=0;c<bd.cellmax;c++) { check[c] =(bd.QaC(c)!==-1?0:-1);}
			for(var c=0;c<bd.cellmax;c++){
				if(check[c]!==0){ continue;}
				var history={cell:[],cross:[]};
				for(var cc=0;cc<bd.cellmax;cc++) { history.cell[cc] =(check[cc]!==-1?0:-1);}
				for(var xc=0;xc<bd.crossmax;xc++){ history.cross[xc]=(scnt[xc]>0    ?0:-1);}
				var cx=bd.cell[c].cx, cy=bd.cell[c].cy;
				this.sp0(((bd.QaC(c)===1)?bd.xnum(cx,cy):bd.xnum(cx+1,cy)), 1, scnt, check, history);
			}
			return check;
		};
		ans.sp0 = function(xc, depth, scnt, check, history){
			// 過ぎ去った地点に到達した→その地点からココまではループしてる
			if(history.cross[xc]>0){
				var min = history.cross[xc], max = depth-1;
				for(var cc=0;cc<bd.cellmax;cc++){ if(history.cell[cc]>=min && history.cell[cc]<=max){ check[cc]=1;} }
			}
			// まだ行ったことのない場所
			else{
				history.cross[xc] = depth;
				var tx=bd.cross[xc].cx, ty=bd.cross[xc].cy;
				var nb = { cell  : [bd.cnum(tx-1,ty-1),bd.cnum(tx  ,ty-1),bd.cnum(tx-1,ty  ),bd.cnum(tx  ,ty  )],
						   cross : [bd.xnum(tx-1,ty-1),bd.xnum(tx+1,ty-1),bd.xnum(tx-1,ty+1),bd.xnum(tx+1,ty+1)],
						   qans  : [1,2,2,1]};
				for(var i=0;i<4;i++){
					if(nb.cell[i]===-1){ continue;}
					if(nb.qans[i]===bd.QaC(nb.cell[i]) && history.cell[nb.cell[i]]===0)
					{
						if(scnt[nb.cross[i]]===1){ check[nb.cell[i]]=2; continue;} // 行き止まり
						history.cell[nb.cell[i]] = depth;

						this.sp0(nb.cross[i], depth+1, scnt, check, history);

						// this.sp0のjump先でhistoryが追加されているので、飛ぶ前の状態に戻す
						for(var cc=0;cc<bd.cellmax;cc++) {
							if(history.cell[cc]>=depth){
								history.cell[cc]=0;
								if(check[cc]!==1){ check[cc]=2;}
							}
						}
						for(var cc=0;cc<bd.crossmax;cc++){
							if(history.cross[cc]>=depth){
								history.cross[cc]=0;
							}
						}
					}
				}
			}
		};

		ans.checkLoopLine = function(sdata, checkLoop){
			var result = true;
			for(var c=0;c<bd.cellmax;c++){
				if(!checkLoop && sdata[c]==1 && bd.QnC(c)===2){ result = false;}
				if( checkLoop && sdata[c]==2 && bd.QnC(c)===1){ result = false;}
			}
			if(!result){ for(var c=0;c<bd.cellmax;c++){ if(sdata[c]>0){ bd.sErC([c],sdata[c]);} } }
			return result;
		};

		ans.checkQnumCross = function(){
			var result = true, scnt = this.getScnt();
			for(var c=0;c<bd.crossmax;c++){
				var qn = bd.QnX(c);
				if(qn>=0 && qn!=scnt[c]){
					if(this.inAutoCheck){ return false;}
					bd.sErX([c],1);
					result = false;
				}
			}
			return result;
		};

		ans.getScnt = function(){
			var scnt = [];
			for(var c=0;c<bd.crossmax;c++){ scnt[c]=0;}
			for(var c=0;c<bd.cellmax;c++){
				var cx=c%k.qcols, cy=(c/k.qcols)|0;
				if(bd.QaC(c)===1){
					scnt[cx+cy*(k.qcols+1)]++;
					scnt[(cx+1)+(cy+1)*(k.qcols+1)]++;
				}
				else if(bd.QaC(c)===2){
					scnt[cx+(cy+1)*(k.qcols+1)]++;
					scnt[(cx+1)+cy*(k.qcols+1)]++;
				}
			}
			return scnt;
		};
	}
};
