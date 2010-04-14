//
// パズル固有スクリプト部 バッグ版 bag.js v3.3.0
//
Puzzles.bag = function(){ };
Puzzles.bag.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}	// 盤面の横幅
		if(!k.qrows){ k.qrows = 10;}	// 盤面の縦幅
		k.irowake = 0;			// 0:色分け設定無し 1:色分けしない 2:色分けする

		k.iscross      = 0;		// 1:Crossが操作可能なパズル
		k.isborder     = 1;		// 1:Border/Lineが操作可能なパズル
		k.isextendcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

		k.isoutsidecross  = 0;	// 1:外枠上にCrossの配置があるパズル
		k.isoutsideborder = 1;	// 1:盤面の外枠上にborderのIDを用意する
		k.isLineCross     = 0;	// 1:線が交差するパズル
		k.isCenterLine    = 0;	// 1:マスの真ん中を通る線を回答として入力するパズル
		k.isborderAsLine  = 1;	// 1:境界線をlineとして扱う

		k.dispzero      = 0;	// 1:0を表示するかどうか
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

		base.setTitle("バッグ", "BAG (Corral)");
		base.setExpression("　左ドラッグで線が、右クリックでセルの背景色(緑/黄色)が入力できます。",
						   " Left Button Drag to input lines, Right Click to input background color (lime or yellow) of the cell.");
		base.setFloatbgcolor("rgb(160, 0, 0)");
	},
	menufix : function(){
		pp.addCheck('bgcolor','setting',false, '背景色入力', 'Background-color');
		pp.setLabel('bgcolor', 'セルの中央をクリックした時に背景色の入力を有効にする', 'Enable to Input BGColor When the Center of the Cell is Clicked');

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

			ee('ck_bgcolor').el.disabled    = (num===3?"":"true");
			ee('cl_bgcolor').el.style.color = (num===3?"black":"silver");
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
			if(k.editmode){
				if(!kp.enabled()){ this.inputqnum();}
				else{ kp.display();}
			}
			else if(k.playmode){
				if(!pp.getVal('bgcolor') || !this.inputBGcolor0()){
					if(this.btn.Left) this.inputborderans();
					else if(this.btn.Right) this.inputBGcolor(true);
				}
				else{ this.inputBGcolor(false);}
			}
		};
		mv.mouseup = function(){ };
		mv.mousemove = function(){
			if(k.playmode){
				if(!pp.getVal('bgcolor') || this.inputData<10){
					if(this.btn.Left) this.inputborderans();
					else if(this.btn.Right) this.inputBGcolor(true);
				}
				else{ this.inputBGcolor(false);}
			}
		};

		mv.inputBGcolor0 = function(){
			var pos = this.borderpos(0.25);
			return ((pos.x&1) && (pos.y&1));
		};
		mv.inputBGcolor = function(isnormal){
			var cc = this.cellid();
			if(cc==-1 || cc==this.mouseCell){ return;}
			if(this.inputData==-1){
				if(isnormal || this.btn.Left){
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
			kp.generate(0, true, false, '');
			kp.kpinput = function(ca){
				kc.key_inputqnum(ca);
			};
		}

		bd.nummaxfunc = function(cc){ return Math.min(bd.maxnum,k.qcols+k.qrows-1);};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_DLIGHT;
		pc.setBGCellColorFunc('qsub2');
		pc.setBorderColorFunc('line');

		pc.chassisflag = false;

		pc.paint = function(x1,y1,x2,y2){
			this.drawBGCells(x1,y1,x2,y2);
			this.drawDashedGrid(x1,y1,x2,y2);
			this.drawBorders(x1,y1,x2,y2);

			this.drawNumbers(x1,y1,x2,y2);

			this.drawTarget(x1,y1,x2,y2);
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decodeNumber16();
		};
		enc.pzlexport = function(type){
			this.encodeNumber16();
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeCellQnum();
			this.decodeCellQsub();
			this.decodeBorderAns2();
		};
		fio.encodeData = function(){
			this.encodeCellQnum();
			this.encodeCellQsub();
			this.encodeBorderAns2();
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			if( !this.checkLcntCross(3,0) ){
				this.setAlert('分岐している線があります。', 'There is a branch line.'); return false;
			}
			if( !this.checkLcntCross(4,0) ){
				this.setAlert('線が交差しています。', 'There is a crossing line.'); return false;
			}

			if( !this.checkOneLoop() ){
				this.setAlert('輪っかが一つではありません。','There are two or more loops.'); return false;
			}

			if( !this.checkLcntCross(1,0) ){
				this.setAlert('途中で途切れている線があります。', 'There is a dead-end line.'); return false;
			}

			var icheck = this.generateIarea();
			if( !this.checkNumberInside(icheck) ){
				this.setAlert('輪の内側に入っていない数字があります。','There is an outside number.'); return false;
			}
			if( !this.checkCellNumber(icheck) ){
				this.setAlert('数字と輪の内側になる4方向のマスの合計が違います。','The number and the sum of the inside cells of four direction is different.'); return false;
			}

			return true;
		};

		ans.generateIarea = function(){
			var icheck = [];
			icheck[0]=(line.lcntCell(0)==0?-1:1);
			for(var by=1;by<bd.maxby;by+=2){
				if(by>1){ icheck[bd.cnum(1,by)]=icheck[bd.cnum(1,by-2)]*(bd.isLine(bd.bnum(1,by-1))?-1:1);}
				for(var bx=3;bx<bd.maxbx;bx+=2){
					icheck[bd.cnum(bx,by)]=icheck[bd.cnum(bx-2,by)]*(bd.isLine(bd.bnum(bx-1,by))?-1:1);
				}
			}
			return icheck;
		};
		ans.checkNumberInside = function(icheck){
			var result = true;
			for(var c=0;c<bd.cellmax;c++){
				if(icheck[c]==-1 && bd.QnC(c)!=-1){
					if(this.inAutoCheck){ return false;}
					bd.sErC([c],1);
					result = false;
				}
			}
			return result;
		};
		ans.checkCellNumber = function(icheck){
			var result = true;
			for(var cc=0;cc<bd.cellmax;cc++){
				if(bd.QnC(cc)<0){ continue;}

				var list = [];
				list.push(cc);
				var cnt = 1;
				var tx, ty;
				tx = bd.cell[cc].bx-2; ty = bd.cell[cc].by;
				while(tx>bd.minbx){ var c=bd.cnum(tx,ty); if(icheck[c]!==-1){ cnt++; list.push(c); tx-=2;} else{ break;} }
				tx = bd.cell[cc].bx+2; ty = bd.cell[cc].by;
				while(tx<bd.maxbx){ var c=bd.cnum(tx,ty); if(icheck[c]!==-1){ cnt++; list.push(c); tx+=2;} else{ break;} }
				tx = bd.cell[cc].bx; ty = bd.cell[cc].by-2;
				while(ty>bd.minby){ var c=bd.cnum(tx,ty); if(icheck[c]!==-1){ cnt++; list.push(c); ty-=2;} else{ break;} }
				tx = bd.cell[cc].bx; ty = bd.cell[cc].by+2;
				while(ty<bd.maxby){ var c=bd.cnum(tx,ty); if(icheck[c]!==-1){ cnt++; list.push(c); ty+=2;} else{ break;} }

				if(bd.QnC(cc)!=cnt){
					if(this.inAutoCheck){ return false;}
					bd.sErC(list,1);
					result = false;
				}
			}
			return result;
		};
	}
};
