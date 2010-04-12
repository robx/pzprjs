//
// パズル固有スクリプト部 クリーク版 creek.js v3.3.0
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
		mv.mousedown = function(){
			if(k.playmode) this.inputcell();
			else if(k.editmode){
				if(!kp.enabled()){ this.inputcross();}
				else{ kp.display();}
			}
		};
		mv.mouseup = function(){ };
		mv.mousemove = function(){
			if(k.playmode) this.inputcell();
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(k.playmode){ return;}
			if(this.moveTCross(ca)){ return;}
			this.key_inputcross(ca);
		};

		if(k.EDITOR){
			kp.generate(4, true, false, '');
			kp.ctl[1].target = k.CROSS;
			kp.kpinput = function(ca){
				kc.key_inputcross(ca);
			};
		}

		tc.setCrossType();

		bd.maxnum = 4;
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.Cellcolor = "rgb(96, 96, 96)";
		pc.setBGCellColorFunc('qans1');

		pc.crosssize = 0.35;

		pc.paint = function(x1,y1,x2,y2){
			this.drawBGCells(x1,y1,x2,y2);
			this.drawRDotCells(x1,y1,x2,y2);
			this.drawGrid(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);

			this.drawCrosses(x1,y1,x2+1,y2+1);
			this.drawTarget(x1,y1,x2,y2);
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
			this.decodeCellAns();
		};
		fio.encodeData = function(){
			this.encodeCrossNum();
			this.encodeCellAns();
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
