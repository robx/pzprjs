//
// パズル固有スクリプト部 スリザーリンク版 slither.js v3.3.2
//
Puzzles.slither = function(){ };
Puzzles.slither.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}
		if(!k.qrows){ k.qrows = 10;}

		k.irowake  = 1;
		k.iscross  = 1;
		k.isborder = 2;

		k.isborderAsLine  = true;
		k.dispzero        = true;
		k.isDispHatena    = true;
		k.isInputHatena   = true;

		k.ispzprv3ONLY    = true;
		k.isKanpenExist   = true;

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
			kc.prev = null;
			ans.errDisp=true;
			bd.errclear();
			if(kp.haspanel[1] || kp.haspanel[3]){ pp.funcs.keypopup();}
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
			if(k.editmode){ this.inputqnum();}
			else if(k.playmode){
				if(!pp.getVal('bgcolor') || !this.inputBGcolor0()){
					if(this.btn.Left) this.inputLine();
					else if(this.btn.Right) this.inputpeke();
				}
				else{ this.inputBGcolor();}
			}
		};
		mv.mouseup = function(){
			if(k.playmode && this.btn.Left && this.notInputted()){
				this.prevPos.reset();
				this.inputpeke();
			}
		};
		mv.mousemove = function(){
			if(k.playmode){
				if(!pp.getVal('bgcolor') || this.inputData<10){
					if(this.btn.Left) this.inputLine();
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
			if(cc===null || cc==this.mouseCell){ return;}
			if(this.inputData===null){
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
			if(k.playmode){ return;}
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum(ca);
		};

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
			kp.generate(kp.ORIGINAL, true, false);
		}

		bd.maxnum = 3;
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.setBGCellColorFunc('qsub2');

		pc.paint = function(){
			this.drawBGCells();

			this.drawLines();

			this.drawBaseMarks();

			this.drawNumbers();

			this.drawPekes(0);

			this.drawTarget();
		};

		pc.drawBaseMarks = function(){
			this.vinc('cross_mark', 'auto');

			var clist = this.range.crosses;
			for(var i=0;i<clist.length;i++){ this.drawBaseMark1(clist[i]);}
		};
		pc.drawBaseMark1 = function(id){
			var vid = "x_cm_"+id;
			g.fillStyle = this.cellcolor;
			if(this.vnop(vid,this.NONE)){
				g.fillCircle(bd.cross[id].px, bd.cross[id].py, (this.lw+1)/2);
			}
		};

		pc.repaintParts = function(idlist){
			var xlist = line.getXlistFromIdlist(idlist);
			for(var i=0;i<xlist.length;i++){
				this.drawBaseMark1(xlist[i]);
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
			if(this.filever===1){
				this.decodeCellQnum();
				this.decodeCellQsub();
				this.decodeBorderLine();
			}
			else if(this.filever===0){
				this.decodeCellQnum();
				this.decodeBorderLine();
			}
		};
		fio.encodeData = function(){
			this.filever = 1;
			this.encodeCellQnum();
			this.encodeCellQsub();
			this.encodeBorderLine();
		};

		fio.kanpenOpen = function(){
			this.decodeCellQnum_kanpen();
			this.decodeBorderLine();
		};
		fio.kanpenSave = function(){
			this.encodeCellQnum_kanpen();
			this.encodeBorderLine();
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

			if( !this.checkdir4BorderLine() ){
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
		
		ans.checkdir4BorderLine = function(){
			var result = true;
			for(var c=0;c<bd.cellmax;c++){
				var qn = bd.QnC(c);
				if(qn>=0 && qn!==this.checkdir4BorderLine1(c)){
					if(this.inAutoCheck){ return false;}
					bd.sErC([c],1);
					result = false;
				}
			}
			return result;
		};
		ans.checkdir4BorderLine1 = function(cc){
			var cnt=0, bx=bd.cell[cc].bx, by=bd.cell[cc].by;
			if( bd.isLine(bd.bnum(bx  ,by-1)) ){ cnt++;}
			if( bd.isLine(bd.bnum(bx  ,by+1)) ){ cnt++;}
			if( bd.isLine(bd.bnum(bx-1,by  )) ){ cnt++;}
			if( bd.isLine(bd.bnum(bx+1,by  )) ){ cnt++;}
			return cnt;
		};
	}
};
