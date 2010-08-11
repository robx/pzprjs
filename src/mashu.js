//
// パズル固有スクリプト部 ましゅ版 mashu.js v3.3.1
//
Puzzles.mashu = function(){ };
Puzzles.mashu.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}	// 盤面の横幅
		if(!k.qrows){ k.qrows = 10;}	// 盤面の縦幅
		k.irowake  = 1;		// 0:色分け設定無し 1:色分けしない 2:色分けする

		k.iscross  = 0;		// 1:盤面内側のCrossがあるパズル 2:外枠上を含めてCrossがあるパズル
		k.isborder = 1;		// 1:Border/Lineが操作可能なパズル 2:外枠上も操作可能なパズル
		k.isexcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

		k.isLineCross     = false;	// 線が交差するパズル
		k.isCenterLine    = true;	// マスの真ん中を通る線を回答として入力するパズル
		k.isborderAsLine  = false;	// 境界線をlineとして扱う
		k.hasroom         = false;	// いくつかの領域に分かれている/分けるパズル
		k.roomNumber      = false;	// 部屋の問題の数字が1つだけ入るパズル

		k.dispzero        = false;	// 0を表示するかどうか
		k.isDispHatena    = true;	// qnumが-2のときに？を表示する
		k.isAnsNumber     = false;	// 回答に数字を入力するパズル
		k.NumberWithMB    = false;	// 回答の数字と○×が入るパズル
		k.linkNumber      = false;	// 数字がひとつながりになるパズル

		k.BlackCell       = false;	// 黒マスを入力するパズル
		k.NumberIsWhite   = false;	// 数字のあるマスが黒マスにならないパズル
		k.RBBlackCell     = false;	// 連黒分断禁のパズル
		k.checkBlackCell  = false;	// 正答判定で黒マスの情報をチェックするパズル
		k.checkWhiteCell  = false;	// 正答判定で白マスの情報をチェックするパズル

		k.ispzprv3ONLY    = true;	// ぱずぷれアプレットには存在しないパズル
		k.isKanpenExist   = true;	// pencilbox/カンペンにあるパズル

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
				if     (bd.QnC(c)===1){ bd.sQnC(c,2);}
				else if(bd.QnC(c)===2){ bd.sQnC(c,1);}
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
			if(k.editmode) this.inputqnum();
			else if(k.playmode){
				if(this.btn.Left) this.inputLine();
				else if(this.btn.Right) this.inputpeke();
			}
		};
		mv.mouseup = function(){
			if(k.playmode && this.btn.Left && this.notInputted()){
				this.inputpeke();
			}
		};
		mv.mousemove = function(){
			if(k.playmode){
				if(this.btn.Left) this.inputLine();
				else if(this.btn.Right) this.inputpeke();
			}
		};
		mv.inputqnumDirectly = true;

		// キーボード入力系
		kc.keyinput = function(ca){ if(ca=='z' && !this.keyPressed){ this.isZ=true;} };
		kc.keyup = function(ca){ if(ca=='z'){ this.isZ=false;}};
		kc.isZ = false;

		bd.maxnum = 2;
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_LIGHT;

		pc.paint = function(x1,y1,x2,y2){
			this.drawBGCells(x1,y1,x2,y2);
			this.drawDashedGrid(x1,y1,x2,y2);

			this.drawQnumCircles(x1,y1,x2,y2);
			this.drawHatenas(x1,y1,x2,y2);

			this.drawPekes(x1,y1,x2,y2,0);
			this.drawLines(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decodeCircle();
			this.revCircle();
		};
		enc.pzlexport = function(){
			this.revCircle();
			this.encodeCircle();
			this.revCircle();
		};

		enc.decodeKanpen = function(){
			fio.decodeCellQnum_kanpen();
			this.revCircle();
		};
		enc.encodeKanpen = function(){
			this.revCircle();
			fio.encodeCellQnum_kanpen();
			this.revCircle();
		};

		enc.revCircle = function(){
			if(!pp.getVal('uramashu')){ return;}
			for(var c=0;c<bd.cellmax;c++){
				if     (bd.cell[c].qnum===1){ bd.cell[c].qnum = 2;}
				else if(bd.cell[c].qnum===2){ bd.cell[c].qnum = 1;}
			}
		}

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeCellQnum();
			this.decodeBorderLine();
			enc.revCircle();
		};
		fio.encodeData = function(){
			enc.revCircle();
			this.encodeCellQnum();
			this.encodeBorderLine();
			enc.revCircle();
		};

		fio.kanpenOpen = function(){
			this.decodeCellQnum_kanpen();
			this.decodeBorderLine();
			enc.revCircle();
		};
		fio.kanpenSave = function(){
			enc.revCircle();
			this.encodeCellQnum_kanpen();
			this.encodeBorderLine();
			enc.revCircle();
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

			if( !this.checkAllCell(function(c){ return (bd.isNum(c) && line.lcntCell(c)==0);}) ){
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
				if(bd.QnC(c)===1 && line.lcntCell(c)===2 && !bd.isLineStraight(c)){
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
				if(bd.QnC(c)===2 && line.lcntCell(c)===2 && bd.isLineStraight(c)){
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
				if(bd.QnC(c)!==1 || line.lcntCell(c)!==2){ continue;}
				var stcnt = 0;
				if(bd.isLine(bd.ub(c)) && line.lcntCell(bd.up(c))===2 && bd.isLineStraight(bd.up(c))){ stcnt++;}
				if(bd.isLine(bd.db(c)) && line.lcntCell(bd.dn(c))===2 && bd.isLineStraight(bd.dn(c))){ stcnt++;}
				if(bd.isLine(bd.lb(c)) && line.lcntCell(bd.lt(c))===2 && bd.isLineStraight(bd.lt(c))){ stcnt++;}
				if(bd.isLine(bd.rb(c)) && line.lcntCell(bd.rt(c))===2 && bd.isLineStraight(bd.rt(c))){ stcnt++;}

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
				if(bd.QnC(c)!==2 || line.lcntCell(c)!==2){ continue;}
				if((bd.isLine(bd.ub(c)) && line.lcntCell(bd.up(c))===2 && !bd.isLineStraight(bd.up(c))) ||
				   (bd.isLine(bd.db(c)) && line.lcntCell(bd.dn(c))===2 && !bd.isLineStraight(bd.dn(c))) ||
				   (bd.isLine(bd.lb(c)) && line.lcntCell(bd.lt(c))===2 && !bd.isLineStraight(bd.lt(c))) ||
				   (bd.isLine(bd.rb(c)) && line.lcntCell(bd.rt(c))===2 && !bd.isLineStraight(bd.rt(c))) ){

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
