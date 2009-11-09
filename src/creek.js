//
// パズル固有スクリプト部 クリーク版 creek.js v3.2.2
//
Puzzles.creek = function(){ };
Puzzles.creek.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}	// 盤面の横幅
		if(!k.qrows){ k.qrows = 10;}	// 盤面の縦幅
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

		k.fstruct = ["crossnum","cellans"];

		//k.def_csize = 36;
		//k.def_psize = 24;
		k.area = { bcell:0, wcell:1, number:0};	// areaオブジェクトで領域を生成する

		base.setTitle("クリーク","Creek");
		base.setExpression("　左クリックで黒マスが、右クリックで白マスを入力できます。",
						   " Left Click to input black cells, Right Click to input white cells.");
		base.setFloatbgcolor("rgb(0, 0, 255)");
	},
	menufix : function(){
		menu.addUseToFlags();
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(x,y){
			if(k.playmode) this.inputcell(x,y);
			else if(k.editmode){
				if(!kp.enabled()){ this.inputcross(x,y);}
				else{ kp.display(x,y);}
			}
		};
		mv.mouseup = function(x,y){ };
		mv.mousemove = function(x,y){
			if(k.playmode) this.inputcell(x,y);
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(k.playmode){ return;}
			if(this.moveTCross(ca)){ return;}
			this.key_inputcross(ca,4);
		};

		if(k.EDITOR){
			kp.generate(4, true, false, '');
			kp.ctl[1].target = k.CROSS;
			kp.kpinput = function(ca){
				kc.key_inputcross(ca,4);
			};
		}

		tc.minx = 0;
		tc.miny = 0;
		tc.maxx = 2*k.qcols;
		tc.maxy = 2*k.qrows;
		tc.setTXC(0);
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.Cellcolor = "rgb(96, 96, 96)";

		pc.crosssize = 0.35;

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);
		//	this.flushCanvasAll();

			this.drawBlackCells(x1,y1,x2,y2);
			this.drawWhiteCells(x1,y1,x2,y2);

			this.drawGrid(x1,y1,x2,y2);
			this.drawChassis(x1,y1,x2,y2);

			this.drawCrosses(x1,y1,x2+1,y2+1);
			this.drawTarget_creek(x1,y1,x2,y2);
		};
		pc.drawTarget_creek = function(x1,y1,x2,y2){
			if(k.editmode){ this.drawTCross(x1,y1,x2+1,y2+1);}
			else{ this.hideTCross();}
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type, bstr){
			if((type==1 && this.checkpflag("c")) || (type==0 && !this.checkpflag("d"))){
				bstr = this.decode4Cross(bstr);
			}
			else{ bstr = this.decodecross_old(bstr);}
		};
		enc.pzlexport = function(type){
			if(type==0)     { document.urloutput.ta.value = this.getURLbase()+"?"+k.puzzleid+this.pzldata();}
			else if(type==1){ document.urloutput.ta.value = this.getDocbase()+k.puzzleid+"/sa/m.html?c"+this.pzldata();}
			else if(type==3){ document.urloutput.ta.value = this.getURLbase()+"?m+"+k.puzzleid+this.pzldata();}
		};
		enc.pzldata = function(){
			return "/"+k.qcols+"/"+k.qrows+"/"+this.encode4Cross();
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){
			if( !this.checkQnumCross(function(cr,bcnt){ return (cr>=bcnt);}) ){
				this.setAlert('数字のまわりにある黒マスの数が間違っています。','The number of black cells around a number on crossing is big.'); return false;
			}
			if( !this.checkOneArea( area.getWCellInfo() ) ){
				this.setAlert('白マスが分断されています。','White cells are devided.'); return false;
			}
			if( !this.checkQnumCross(function(cr,bcnt){ return (cr<=bcnt);}) ){
				this.setAlert('数字のまわりにある黒マスの数が間違っています。','The number of black cells around a number on crossing is small.'); return false;
			}

			return true;
		};
	}
};
