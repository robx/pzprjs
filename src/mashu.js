//
// パズル固有スクリプト部 ましゅ版 mashu.js v3.2.0
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
		k.isborderCross   = 0;	// 1:線が交差するパズル
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

		k.fstruct = ["cellques41_42","borderline"];

		//k.def_csize = 36;
		//k.def_psize = 24;

		base.setTitle("ましゅ","Masyu (Pearl Puzzle)");
		base.setExpression("　左ドラッグで線が、右クリックで×印が入力できます。",
						   " Left Button Drag to input black cells, Right Click to input a cross.");
		base.setFloatbgcolor("rgb(0, 224, 0)");
	},
	menufix : function(){
		pp.addCheckToFlags('uramashu','setting',false);
		pp.setMenuStr('uramashu', '裏ましゅ', 'Ura-Mashu');
		pp.setLabel  ('uramashu', '裏ましゅにする', 'Change to Ura-Mashu');
		pp.funcs['uramashu'] = function(){
			for(var c=0;c<bd.cell.length;c++){
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
		mv.mousedown = function(x,y){
			if(kc.isZ ^ menu.getVal('dispred')){ this.dispRedLine(x,y); return;}
			if(k.mode==1) this.inputQues(x,y,[0,41,42,-2]);
			else if(k.mode==3){
				if(this.btn.Left) this.inputLine(x,y);
				else if(this.btn.Right) this.inputpeke(x,y);
			}
		};
		mv.mouseup = function(x,y){ };
		mv.mousemove = function(x,y){
			if(kc.isZ ^ menu.getVal('dispred')){ this.dispRedLine(x,y); return;}
			if(k.mode==3){
				if(this.btn.Left) this.inputLine(x,y);
				else if(this.btn.Right) this.inputpeke(x,y);
			}
		};

		// キーボード入力系
		kc.keyinput = function(ca){ if(ca=='z' && !this.keyPressed){ this.isZ=true;} };
		kc.keyup = function(ca){ if(ca=='z'){ this.isZ=false;}};
		kc.isZ = false;
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.BDlinecolor = "rgb(160, 160, 160)";

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);
		//	this.flushCanvasAll();

			this.drawErrorCells(x1,y1,x2,y2);

			this.drawBDline2(x1,y1,x2,y2);

			this.drawQueses41_42(x1,y1,x2,y2);
			this.drawNumbers(x1,y1,x2,y2);

			this.drawPekes(x1,y1,x2,y2,0);
			this.drawLines(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type, bstr){
			if(type==0 || type==1){ bstr = this.decodeCircle(bstr);}
			else if(type==2){ bstr = this.decodeKanpen(bstr);}
		};
		enc.pzlexport = function(type){
			if(type==0)     { document.urloutput.ta.value = this.getURLbase()+"?"+k.puzzleid+this.pzldata();}
			else if(type==1){ document.urloutput.ta.value = this.getDocbase()+k.puzzleid+"/sa/m.html?c"+this.pzldata();}
			else if(type==2){ document.urloutput.ta.value = this.kanpenbase()+"masyu.html?problem="+this.pzldataKanpen();}
			else if(type==3){ document.urloutput.ta.value = this.getURLbase()+"?m+"+k.puzzleid+this.pzldata();}
		};
		enc.pzldata = function(){
			return "/"+k.qcols+"/"+k.qrows+"/"+this.encodeCircle();
		};

		enc.decodeCircle = function(bstr,flag){
			var pos = bstr?Math.min(mf((k.qcols*k.qrows+2)/3), bstr.length):0;
			for(var i=0;i<pos;i++){
				var ca = parseInt(bstr.charAt(i),27);
				for(var w=0;w<3;w++){
					if(i*3+w<k.qcols*k.qrows){
						if     (mf(ca/Math.pow(3,2-w))%3==1){ bd.sQuC(i*3+w,41);}
						else if(mf(ca/Math.pow(3,2-w))%3==2){ bd.sQuC(i*3+w,42);}
					}
				}
			}

			return bstr.substring(pos,bstr.length);
		};
		enc.encodeCircle = function(flag){
			var cm="", num=0, pass=0;
			for(var i=0;i<bd.cell.length;i++){
				if     (bd.QuC(i)==41){ pass+=(  Math.pow(3,2-num));}
				else if(bd.QuC(i)==42){ pass+=(2*Math.pow(3,2-num));}
				num++; if(num==3){ cm += pass.toString(27); num=0; pass=0;}
			}
			if(num>0){ cm += pass.toString(27);}

			return cm;
		};

		enc.decodeKanpen = function(bstr){
			bstr = (bstr.split("_")).join(" ");
			fio.decodeCell( function(c,ca){
				if     (ca == "1"){ bd.sQuC(c, 41);}
				else if(ca == "2"){ bd.sQuC(c, 42);}
			},bstr.split("/"));
			return "";
		};
		enc.pzldataKanpen = function(){
			return ""+k.qrows+"/"+k.qcols+"/"+fio.encodeCell( function(c){
				if     (bd.QuC(c)==41){ return "1_";}
				else if(bd.QuC(c)==42){ return "2_";}
				else                  { return "._";}
			});
		};

		//---------------------------------------------------------
		fio.kanpenOpen = function(array){
			this.decodeCell( function(c,ca){
				if     (ca == "1"){ bd.sQuC(c, 41);}
				else if(ca == "2"){ bd.sQuC(c, 42);}
			},array.slice(0,k.qrows));
			this.decodeBorderLine(array.slice(k.qrows,3*k.qrows-1));
		};
		fio.kanpenSave = function(){
			return ""+this.encodeCell( function(c){
				if     (bd.QuC(c)==41){ return "1 ";}
				else if(bd.QuC(c)==42){ return "2 ";}
				else                  { return ". ";}
			})
			+this.encodeBorderLine();
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

			if( !this.checkPearlLine() ){
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
			for(var c=0;c<bd.cell.length;c++){
				if(bd.QuC(c)==41 && ans.lcntCell(c)==2 && !ans.isLineStraight(c)){
					bd.sErB(bd.borders,2);
					ans.setCellLineError(c,1);
					return false;
				}
			}
			return true;
		};
		ans.checkBlackPearl1 = function(){
			for(var c=0;c<bd.cell.length;c++){
				if(bd.QuC(c)==42 && ans.lcntCell(c)==2 && ans.isLineStraight(c)){
					bd.sErB(bd.borders,2);
					ans.setCellLineError(c,1);
					return false;
				}
			}
			return true;
		};

		ans.checkWhitePearl2 = function(){
			for(var c=0;c<bd.cell.length;c++){
				if(bd.QuC(c)!=41 || ans.lcntCell(c)!=2){ continue;}
				if(bd.LiB(bd.ub(c))==1 && ans.lcntCell(bd.up(c))==2 && !ans.isLineStraight(bd.up(c))){ continue;}
				if(bd.LiB(bd.db(c))==1 && ans.lcntCell(bd.dn(c))==2 && !ans.isLineStraight(bd.dn(c))){ continue;}
				if(bd.LiB(bd.lb(c))==1 && ans.lcntCell(bd.lt(c))==2 && !ans.isLineStraight(bd.lt(c))){ continue;}
				if(bd.LiB(bd.rb(c))==1 && ans.lcntCell(bd.rt(c))==2 && !ans.isLineStraight(bd.rt(c))){ continue;}

				this.setErrorPearl(c);
				return false;
			}
			return true;
		};
		ans.checkBlackPearl2 = function(){
			for(var c=0;c<bd.cell.length;c++){
				if(bd.QuC(c)!=42 || ans.lcntCell(c)!=2){ continue;}
				if((bd.LiB(bd.ub(c))==1 && ans.lcntCell(bd.up(c))==2 && !ans.isLineStraight(bd.up(c))) ||
				   (bd.LiB(bd.db(c))==1 && ans.lcntCell(bd.dn(c))==2 && !ans.isLineStraight(bd.dn(c))) ||
				   (bd.LiB(bd.lb(c))==1 && ans.lcntCell(bd.lt(c))==2 && !ans.isLineStraight(bd.lt(c))) ||
				   (bd.LiB(bd.rb(c))==1 && ans.lcntCell(bd.rt(c))==2 && !ans.isLineStraight(bd.rt(c))) ){
					this.setErrorPearl(c);
					return false;
				}
			}
			return true;
		};
		ans.setErrorPearl = function(cc){
			bd.sErB(bd.borders,2);
			ans.setCellLineError(cc,1);
			if(bd.LiB(bd.ub(cc))==1){ ans.setCellLineError(bd.up(cc),0);}
			if(bd.LiB(bd.db(cc))==1){ ans.setCellLineError(bd.dn(cc),0);}
			if(bd.LiB(bd.lb(cc))==1){ ans.setCellLineError(bd.lt(cc),0);}
			if(bd.LiB(bd.rb(cc))==1){ ans.setCellLineError(bd.rt(cc),0);}
		};

		ans.checkPearlLine = function(){
			for(var c=0;c<bd.cell.length;c++){ if(bd.QuC(c)!=0 && ans.lcntCell(c)==0){ bd.sErC([c],1); return false;} }
			return true;
		};
	}
};
