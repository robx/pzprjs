//
// パズル固有スクリプト部 スリザーリンク版 slither.js v3.3.0
//
Puzzles.slither = function(){ };
Puzzles.slither.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}	// 盤面の横幅
		if(!k.qrows){ k.qrows = 10;}	// 盤面の縦幅
		k.irowake = 1;			// 0:色分け設定無し 1:色分けしない 2:色分けする

		k.iscross      = 0;		// 1:Crossが操作可能なパズル
		k.isborder     = 1;		// 1:Border/Lineが操作可能なパズル
		k.isextendcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

		k.isoutsidecross  = 0;	// 1:外枠上にCrossの配置があるパズル
		k.isoutsideborder = 1;	// 1:盤面の外枠上にborderのIDを用意する
		k.isLineCross     = 0;	// 1:線が交差するパズル
		k.isCenterLine    = 0;	// 1:マスの真ん中を通る線を回答として入力するパズル
		k.isborderAsLine  = 1;	// 1:境界線をlineとして扱う

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

		k.ispzprv3ONLY  = 1;	// 1:ぱずぷれv3にしかないパズル
		k.isKanpenExist = 1;	// 1:pencilbox/カンペンにあるパズル

		base.setTitle("スリザーリンク","Slitherlink");
		base.setExpression("　左ドラッグで線が、右クリックで×が入力できます。",
						   " Left Button Drag to input black cells, Right Click to input a cross.");
		base.setFloatbgcolor("rgb(32, 32, 32)");

		enc.pidKanpen = 'slitherlink';
	},
	menufix : function(){
		pp.addCheck('bgcolor','setting',false, '背景色入力', 'Background-color');
		pp.setLabel('bgcolor', 'セルの中央をクリックした時に背景色の入力を有効にする', 'Enable to Input BGColor When the Center of the Cell is Clicked');

		menu.addRedLineToFlags();

		menu.ex.modechange = function(num){
			k.editmode = (num==1);
			k.playmode = (num==3);
			kc.prev = -1;
			ans.errDisp=true;
			bd.errclear();
			if(kp.ctl[1].enable || kp.ctl[3].enable){ pp.funcs.keypopup();}
			tc.setAlign();
			pc.paintAll();
			// ここまで元と同じ

			ee('ck_bgcolor').el.disabled    = (num==3?"":"true");
			ee('cl_bgcolor').el.style.color = (num==3?"black":"silver");
		};
	},
	finalfix : function(){
		if(k.editmode){
			ee('ck_bgcolor').el.disabled    = "true";
			ee('cl_bgcolor').el.style.color = "silver";
		}
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(kc.isZ ^ pp.getVal('dispred')){ this.dispRedLine(); return;}
			if(k.editmode){
				if(!kp.enabled()){ this.inputqnum();}
				else{ kp.display();}
			}
			else if(k.playmode){
				if(!pp.getVal('bgcolor') || !this.inputBGcolor0()){
					if(this.btn.Left) this.inputborderans();
					else if(this.btn.Right) this.inputpeke();
				}
				else{ this.inputBGcolor();}
			}
		};
		mv.mouseup = function(){ };
		mv.mousemove = function(){
			if(k.playmode){
				if(!pp.getVal('bgcolor') || this.inputData<10){
					if(this.btn.Left) this.inputborderans();
					else if(this.btn.Right) this.inputpeke();
				}
				else{ this.inputBGcolor();}
			}
		};

		mv.inputBGcolor0 = function(){
			var pos = this.borderpos(0.25);
			return ((pos.x&1) && (pos.y&1));
		};
		mv.inputBGcolor = function(){
			var cc = this.cellid();
			if(cc==-1 || cc==this.mouseCell){ return;}
			if(this.inputData==-1){
				if(this.btn.Left){
					if     (bd.cell[cc].qsub===0){ this.inputData=11;}
					else if(bd.cell[cc].qsub===1){ this.inputData=12;}
					else                         { this.inputData=10;}
				}
				else{
					if     (bd.cell[cc].qsub===0){ this.inputData=12;}
					else if(bd.cell[cc].qsub===1){ this.inputData=10;}
					else                         { this.inputData=11;}
				}
			}
			bd.sQsC(cc, this.inputData-10);
			pc.paintCell(cc);

			this.mouseCell = cc; 
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(ca=='z' && !this.keyPressed){ this.isZ=true; return;}
			if(k.playmode){ return;}
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum(ca);
		};
		kc.keyup = function(ca){ if(ca=='z'){ this.isZ=false;}};
		kc.isZ = false;

		if(k.EDITOR){
			kp.kpinput = function(ca){
				kc.key_inputqnum(ca);
			};
			kp.kpgenerate = function(mode){
				this.inputcol('num','knum0','0','0');
				this.inputcol('num','knum1','1','1');
				this.inputcol('num','knum2','2','2');
				this.insertrow();
				this.inputcol('num','knum3','3','3');
				this.inputcol('num','knum_',' ',' ');
				this.inputcol('num','knum.','-','?');
				this.insertrow();
			};
			kp.generate(kp.ORIGINAL, true, false, kp.kpgenerate);
		}

		bd.maxnum = 3;
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.setBGCellColorFunc('qsub2');
		pc.setBorderColorFunc('line');

		pc.paint = function(x1,y1,x2,y2){
			this.drawBGCells(x1,y1,x2,y2);

			this.drawBorders(x1,y1,x2,y2);

			this.drawBaseMarks(x1,y1,x2,y2);

			this.drawNumbers(x1,y1,x2,y2);

			this.drawPekes(x1,y1,x2,y2,0);

			this.drawTarget(x1,y1,x2,y2);
		};

		pc.drawBaseMarks = function(x1,y1,x2,y2){
			this.vinc('cross_mark', 'auto');

			for(var by=bd.minby;by<=bd.maxby;by+=2){
				for(var bx=bd.minbx;bx<=bd.maxbx;bx+=2){
					if(bx < x1-1 || x2+1 < bx){ continue;}
					if(by < y1-1 || y2+1 < by){ continue;}

					this.drawBaseMark1((bx>>1)+(by>>1)*(k.qcols+1));
				}
			}
		};
		pc.drawBaseMark1 = function(id){
			var vid = "x_cm_"+id;

			g.fillStyle = this.Cellcolor;
			if(this.vnop(vid,this.NONE)){
				var csize = (this.lw+1)/2;
				var bx = (id%(k.qcols+1))*2, by = mf(id/(k.qcols+1))*2;
				g.fillCircle(k.p0.x+bx*this.bw, k.p0.x+by*this.bh, csize);
			}
		};

		line.repaintParts = function(idlist){
			var xlist = this.getXlistFromIdlist(idlist);
			for(var i=0;i<xlist.length;i++){
				pc.drawBaseMark1(xlist[i]);
			}
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decode4Cell();
		};
		enc.pzlexport = function(type){
			this.encode4Cell();
		};

		enc.decodeKanpen = function(){
			fio.decodeCellQnum_kanpen();
		};
		enc.encodeKanpen = function(){
			fio.encodeCellQnum_kanpen();
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			if(this.filever==1){
				this.decodeCellQnum();
				this.decodeCellQsub();
				this.decodeBorderAns2();
			}
			else if(this.filever==0){
				this.decodeCellQnum();
				this.decodeBorderAns2();
			}
		};
		fio.encodeData = function(){
			this.filever = 1;
			this.encodeCellQnum();
			this.encodeCellQsub();
			this.encodeBorderAns2();
		};

		fio.kanpenOpen = function(){
			this.decodeCellQnum_kanpen();
			this.decodeBorder2_kanpen( function(c,ca){
				if     (ca == "1") { bd.sQaB(c, 1);}
				else if(ca == "-1"){ bd.sQsB(c, 2);}
			});
		};
		fio.kanpenSave = function(){
			this.encodeCellQnum_kanpen();
			this.encodeBorder2_kanpen( function(c){
				if     (bd.QaB(c)==1){ return "1 ";}
				else if(bd.QsB(c)==2){ return "-1 ";}
				else{ return "0 ";}
			});
		};

		// カンペンでは、outsideborderの時はぱずぷれとは順番が逆になってます
		fio.decodeBorder2_kanpen = function(func){
			this.decodeObj(func, bd.bnum, 1, 0, 2*k.qcols-1, 2*k.qrows  );
			this.decodeObj(func, bd.bnum, 0, 1, 2*k.qcols  , 2*k.qrows-1);
		};
		fio.encodeBorder2_kanpen = function(func){
			this.encodeObj(func, bd.bnum, 1, 0, 2*k.qcols-1, 2*k.qrows  );
			this.encodeObj(func, bd.bnum, 0, 1, 2*k.qcols  , 2*k.qrows-1);
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			if( !this.checkLcntCross(3,0) ){
				this.setAlert('分岐している線があります。','There is a branched line.'); return false;
			}
			if( !this.checkLcntCross(4,0) ){
				this.setAlert('線が交差しています。','There is a crossing line.'); return false;
			}

			if( !this.checkdir4Border() ){
				this.setAlert('数字の周りにある境界線の本数が違います。','The number is not equal to the number of border lines around it.'); return false;
			}

			if( !this.checkOneLoop() ){
				this.setAlert('輪っかが一つではありません。','There are plural loops.'); return false;
			}

			if( !this.checkLcntCross(1,0) ){
				this.setAlert('途中で途切れている線があります。','There is a dead-end line.'); return false;
			}

			return true;
		};
	}
};
