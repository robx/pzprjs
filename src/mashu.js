//
// パズル固有スクリプト部 ましゅ版 mashu.js v3.2.4
//
Puzzles.mashu = function(){ };
Puzzles.mashu.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}	// 盤面の横幅
		if(!k.qrows){ k.qrows = 10;}	// 盤面の縦幅
		k.irowake = 1;			// 0:色分け設定無し 1:色分けしない 2:色分けする

		k.iscross      = 0;		// 1:Crossが操作可能なパズル
		k.isborder     = 1;		// 1:Border/Lineが操作可能なパズル
		k.isextendcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

		k.isoutsidecross  = 0;	// 1:外枠上にCrossの配置があるパズル
		k.isoutsideborder = 0;	// 1:盤面の外枠上にborderのIDを用意する
		k.isLineCross     = 0;	// 1:線が交差するパズル
		k.isCenterLine    = 1;	// 1:マスの真ん中を通る線を回答として入力するパズル
		k.isborderAsLine  = 0;	// 1:境界線をlineとして扱う

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

		k.ispzprv3ONLY  = 1;	// 1:ぱずぷれv3にしかないパズル
		k.isKanpenExist = 1;	// 1:pencilbox/カンペンにあるパズル

		//k.def_csize = 36;
		//k.def_psize = 24;
		//k.area = { bcell:0, wcell:0, number:0};	// areaオブジェクトで領域を生成する

		base.setTitle("ましゅ","Masyu (Pearl Puzzle)");
		base.setExpression("　左ドラッグで線が、右クリックで×印が入力できます。",
						   " Left Button Drag to input black cells, Right Click to input a cross.");
		base.setFloatbgcolor("rgb(0, 224, 0)");

		enc.pidKanpen = 'masyu';
	},
	menufix : function(){
		pp.addCheck('uramashu','setting',false, '裏ましゅ', 'Ura-Mashu');
		pp.setLabel('uramashu', '裏ましゅにする', 'Change to Ura-Mashu');
		pp.funcs['uramashu'] = function(){
			for(var c=0;c<bd.cellmax;c++){
				if     (bd.QuC(c)==41){ bd.sQuC(c,42);}
				else if(bd.QuC(c)==42){ bd.sQuC(c,41);}
			}
			pc.paintAll();
		};

		menu.addRedLineToFlags();
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(kc.isZ ^ pp.getVal('dispred')){ this.dispRedLine(); return;}
			if(k.editmode) this.inputQues([0,41,42,-2]);
			else if(k.playmode){
				if(this.btn.Left) this.inputLine();
				else if(this.btn.Right) this.inputpeke();
			}
		};
		mv.mouseup = function(){ };
		mv.mousemove = function(){
			if(k.playmode){
				if(this.btn.Left) this.inputLine();
				else if(this.btn.Right) this.inputpeke();
			}
		};
		mv.inputQuesDirectly = true;

		// キーボード入力系
		kc.keyinput = function(ca){ if(ca=='z' && !this.keyPressed){ this.isZ=true;} };
		kc.keyup = function(ca){ if(ca=='z'){ this.isZ=false;}};
		kc.isZ = false;
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_LIGHT;

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);
		//	this.flushCanvasAll();

			this.drawBGCells(x1,y1,x2,y2);
			this.drawDashedGrid(x1,y1,x2,y2);

			this.drawQueses41_42(x1,y1,x2,y2);
			this.drawQuesHatenas(x1,y1,x2,y2);

			this.drawPekes(x1,y1,x2,y2,0);
			this.drawLines(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decodeCircle41_42();
			this.revCircle();
		};
		enc.pzlexport = function(){
			this.revCircle();
			this.encodeCircle41_42();
			this.revCircle();
		};

		enc.decodeKanpen = function(){
			fio.decodeCellQues41_42_kanpen();
			this.revCircle();
		};
		enc.encodeKanpen = function(){
			this.revCircle();
			fio.encodeCellQues41_42_kanpen();
			this.revCircle();
		};

		enc.revCircle = function(){
			if(!pp.getVal('uramashu')){ return;}
			for(var c=0;c<bd.cellmax;c++){
				if     (bd.cell[c].ques===41){ bd.cell[c].ques = 42;}
				else if(bd.cell[c].ques===42){ bd.cell[c].ques = 41;}
			}
		}

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeCellQues41_42();
			this.decodeBorderLine();
			enc.revCircle();
		};
		fio.encodeData = function(){
			enc.revCircle();
			this.encodeCellQues41_42();
			this.encodeBorderLine();
			enc.revCircle();
		};

		fio.kanpenOpen = function(){
			this.decodeCellQues41_42_kanpen();
			this.decodeBorderLine();
			enc.revCircle();
		};
		fio.kanpenSave = function(){
			enc.revCircle();
			this.encodeCellQues41_42_kanpen();
			this.encodeBorderLine();
			enc.revCircle();
		};

		fio.decodeCellQues41_42_kanpen = function(){
			this.decodeCell( function(c,ca){
				if     (ca === "1"){ bd.sQuC(c, 41);}
				else if(ca === "2"){ bd.sQuC(c, 42);}
			});
		};
		fio.encodeCellQues41_42_kanpen = function(){
			this.encodeCell( function(c){
				if     (bd.QuC(c)===41){ return "1 ";}
				else if(bd.QuC(c)===42){ return "2 ";}
				else                   { return ". ";}
			});
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			if( !this.checkLcntCell(3) ){
				this.setAlert('分岐している線があります。','There is a branched line.'); return false;
			}
			if( !this.checkLcntCell(4) ){
				this.setAlert('線が交差しています。','There is a crossing line.'); return false;
			}

			if( !this.checkWhitePearl1() ){
				this.setAlert('白丸の上で線が曲がっています。','Lines curve on white pearl.'); return false;
			}
			if( !this.checkBlackPearl1() ){
				this.setAlert('黒丸の上で線が直進しています。','Lines go straight on black pearl.'); return false;
			}

			if( !this.checkBlackPearl2() ){
				this.setAlert('黒丸の隣で線が曲がっています。','Lines curve next to black pearl.'); return false;
			}
			if( !this.checkWhitePearl2() ){
				this.setAlert('白丸の隣で線が曲がっていません。','Lines go straight next to white pearl on each side.'); return false;
			}

			if( !this.checkAllCell(function(c){ return (bd.QuC(c)!=0 && line.lcntCell(c)==0);}) ){
				this.setAlert('線が上を通っていない丸があります。','Lines don\'t pass some pearls.'); return false;
			}

			if( !this.checkLcntCell(1) ){
				this.setAlert('線が途中で途切れています。','There is a dead-end line.'); return false;
			}

			if( !this.checkOneLoop() ){
				this.setAlert('輪っかが一つではありません。','There are plural loops.'); return false;
			}

			return true;
		};

		ans.checkWhitePearl1 = function(){
			var result = true;
			for(var c=0;c<bd.cellmax;c++){
				if(bd.QuC(c)==41 && line.lcntCell(c)==2 && !ans.isLineStraight(c)){
					if(this.inAutoCheck){ return false;}
					if(result){ bd.sErBAll(2);}
					ans.setCellLineError(c,1);
					result = false;
				}
			}
			return result;
		};
		ans.checkBlackPearl1 = function(){
			var result = true;
			for(var c=0;c<bd.cellmax;c++){
				if(bd.QuC(c)==42 && line.lcntCell(c)==2 && ans.isLineStraight(c)){
					if(this.inAutoCheck){ return false;}
					if(result){ bd.sErBAll(2);}
					ans.setCellLineError(c,1);
					result = false;
				}
			}
			return result;
		};

		ans.checkWhitePearl2 = function(){
			var result = true;
			for(var c=0;c<bd.cellmax;c++){
				if(bd.QuC(c)!=41 || line.lcntCell(c)!=2){ continue;}
				var stcnt = 0;
				if(bd.isLine(bd.ub(c)) && line.lcntCell(bd.up(c))===2 && ans.isLineStraight(bd.up(c))){ stcnt++;}
				if(bd.isLine(bd.db(c)) && line.lcntCell(bd.dn(c))===2 && ans.isLineStraight(bd.dn(c))){ stcnt++;}
				if(bd.isLine(bd.lb(c)) && line.lcntCell(bd.lt(c))===2 && ans.isLineStraight(bd.lt(c))){ stcnt++;}
				if(bd.isLine(bd.rb(c)) && line.lcntCell(bd.rt(c))===2 && ans.isLineStraight(bd.rt(c))){ stcnt++;}

				if(stcnt>=2){
					if(this.inAutoCheck){ return false;}
					this.setErrorPearl(c,result);
					result = false;
				}
			}
			return result;
		};
		ans.checkBlackPearl2 = function(){
			var result = true;
			for(var c=0;c<bd.cellmax;c++){
				if(bd.QuC(c)!=42 || line.lcntCell(c)!=2){ continue;}
				if((bd.isLine(bd.ub(c)) && line.lcntCell(bd.up(c))==2 && !ans.isLineStraight(bd.up(c))) ||
				   (bd.isLine(bd.db(c)) && line.lcntCell(bd.dn(c))==2 && !ans.isLineStraight(bd.dn(c))) ||
				   (bd.isLine(bd.lb(c)) && line.lcntCell(bd.lt(c))==2 && !ans.isLineStraight(bd.lt(c))) ||
				   (bd.isLine(bd.rb(c)) && line.lcntCell(bd.rt(c))==2 && !ans.isLineStraight(bd.rt(c))) ){

					if(this.inAutoCheck){ return false;}
					this.setErrorPearl(c,result);
					result = false;
				}
			}
			return result;
		};
		ans.setErrorPearl = function(cc,result){
			if(result){ bd.sErBAll(2);}
			ans.setCellLineError(cc,1);
			if(bd.isLine(bd.ub(cc))){ ans.setCellLineError(bd.up(cc),0);}
			if(bd.isLine(bd.db(cc))){ ans.setCellLineError(bd.dn(cc),0);}
			if(bd.isLine(bd.lb(cc))){ ans.setCellLineError(bd.lt(cc),0);}
			if(bd.isLine(bd.rb(cc))){ ans.setCellLineError(bd.rt(cc),0);}
		};
	}
};
