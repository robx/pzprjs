//
// パズル固有スクリプト部 ヤジリン版 yajirin.js v3.2.4
// 
Puzzles.yajirin = function(){ };
Puzzles.yajirin.prototype = {
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

		k.dispzero      = 1;	// 1:0を表示するかどうか
		k.isDispHatena  = 1;	// 1:qnumが-2のときに？を表示する
		k.isAnsNumber   = 0;	// 1:回答に数字を入力するパズル
		k.isArrowNumber = 1;	// 1:矢印つき数字を入力するパズル
		k.isOneNumber   = 0;	// 1:部屋の問題の数字が1つだけ入るパズル
		k.isDispNumUL   = 0;	// 1:数字をマス目の左上に表示するパズル(0はマスの中央)
		k.NumberWithMB  = 0;	// 1:回答の数字と○×が入るパズル

		k.BlackCell     = 1;	// 1:黒マスを入力するパズル
		k.NumberIsWhite = 1;	// 1:数字のあるマスが黒マスにならないパズル
		k.RBBlackCell   = 0;	// 1:連黒分断禁のパズル

		k.ispzprv3ONLY  = 1;	// 1:ぱずぷれv3にしかないパズル
		k.isKanpenExist = 1;	// 1:pencilbox/カンペンにあるパズル

		//k.def_csize = 36;
		//k.def_psize = 24;
		//k.area = { bcell:0, wcell:0, number:0};	// areaオブジェクトで領域を生成する

		if(k.EDITOR){
			base.setExpression("　矢印は、マウスの左ドラッグか、SHIFT押しながら矢印キーで入力できます。",
							   " To input Arrows, Left Button Drag or Press arrow key with SHIFT key.");
		}
		else{
			base.setExpression("　左ドラッグで線が、左クリックで黒マスが入力できます。",
							   " Left Button Drag to input black cells, Left Click to input black cells.");
		}
		base.setTitle("ヤジリン","Yajilin");
		base.setFloatbgcolor("rgb(0, 224, 0)");

		enc.pidKanpen = 'yajilin';
	},
	menufix : function(){
		menu.addUseToFlags();
		menu.addRedLineToFlags();
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(kc.isZ ^ pp.getVal('dispred')){ this.dispRedLine(); return;}
			if(k.editmode) this.inputdirec();
			else if(k.playmode){
				if(this.btn.Left) this.inputLine();
				else if(this.btn.Right) this.inputpeke();
			}
		};
		mv.mouseup = function(){
			if(this.notInputted()){
				if     (k.editmode) this.inputqnum();
				else if(k.playmode) this.inputcell();
			}
		};
		mv.mousemove = function(){
			if(k.editmode) this.inputdirec();
			else if(k.playmode){
				if(this.btn.Left) this.inputLine();
				else if(this.btn.Right) this.inputpeke();
			}
		};

		// 線を引かせたくないので上書き
		bd.isnoLPup    = function(cc){ return (bd.isBlack(cc) || bd.QnC(cc)!=-1);},
		bd.isnoLPdown  = function(cc){ return (bd.isBlack(cc) || bd.QnC(cc)!=-1);},
		bd.isnoLPleft  = function(cc){ return (bd.isBlack(cc) || bd.QnC(cc)!=-1);},
		bd.isnoLPright = function(cc){ return (bd.isBlack(cc) || bd.QnC(cc)!=-1);},
		bd.enableLineNG = true;

		// キーボード入力系
		kc.keyinput = function(ca){
			if(ca=='z' && !this.keyPressed){ this.isZ=true; return;}
			if(k.playmode){ return;}
			if(this.key_inputdirec(ca)){ return;}
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum(ca);
		};
		kc.keyup = function(ca){ if(ca=='z'){ this.isZ=false;}};
		kc.isZ = false;
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_LIGHT;
		pc.dotcolor = "rgb(255, 96, 191)";

		pc.paint = function(x1,y1,x2,y2){
			x2++; y2++;
			this.flushCanvas(x1,y1,x2,y2);
		//	this.flushCanvasAll();

			this.drawBGCells(x1,y1,x2,y2);
			this.drawRDotCells(x1,y1,x2,y2);
			this.drawGrid(x1,y1,x2,y2);
			this.drawBlackCells(x1,y1,x2,y2);

			this.drawArrowNumbers(x1,y1,x2,y2);

			this.drawLines(x1,y1,x2,y2);
			this.drawPekes(x1,y1,x2,y2,1);

			this.drawChassis(x1,y1,x2,y2);

			this.drawTarget(x1,y1,x2,y2);
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decodeArrowNumber16();
		};
		enc.pzlexport = function(type){
			this.encodeArrowNumber16();
		};

		enc.decodeKanpen = function(){
			fio.decodeCellDirecQnum_kanpen(true);
		};
		enc.encodeKanpen = function(){
			fio.encodeCellDirecQnum_kanpen(true);
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeCellDirecQnum();
			this.decodeCellAns();
			this.decodeBorderLine();
		};
		fio.encodeData = function(){
			this.encodeCellDirecQnum();
			this.encodeCellAns();
			this.encodeBorderLine();
		};

		fio.kanpenOpen = function(array){
			this.decodeCellDirecQnum_kanpen(false);
			this.decodeBorderLine();
		};
		fio.kanpenSave = function(){
			this.encodeCellDirecQnum_kanpen(false);
			this.encodeBorderLine();
		};

		fio.decodeCellDirecQnum_kanpen = function(isurl){
			this.decodeCell( function(c,ca){
				if     (ca=="#" && !isurl){ bd.setBlack(c);}
				else if(ca=="+" && !isurl){ bd.sQsC(c,1);}
				else if(ca != "."){
					var num = parseInt(ca);
					if     (num<16){ bd.sDiC(c,k.UP); bd.sQnC(c,num   );}
					else if(num<32){ bd.sDiC(c,k.LT); bd.sQnC(c,num-16);}
					else if(num<48){ bd.sDiC(c,k.DN); bd.sQnC(c,num-32);}
					else if(num<64){ bd.sDiC(c,k.RT); bd.sQnC(c,num-48);}
				}
			});
		};
		fio.encodeCellDirecQnum_kanpen = function(isurl){
			this.encodeCell( function(c){
				var num = (bd.QnC(c)>=0&&bd.QnC(c)<10?bd.QnC(c):-1)
				if(num==-1 && !isurl){
					if     (bd.isBlack(c)){ return "# ";}
					else if(bd.QsC(c)==1) { return "+ ";}
					else                  { return ". ";}
				}
				else if(bd.DiC(c)==k.UP){ return ""+( 0+num)+" ";}
				else if(bd.DiC(c)==k.LT){ return ""+(16+num)+" ";}
				else if(bd.DiC(c)==k.DN){ return ""+(32+num)+" ";}
				else if(bd.DiC(c)==k.RT){ return ""+(48+num)+" ";}
				else                    { return ". ";}
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
				this.setAlert('交差している線があります。','There is a crossing line.'); return false;
			}

			if( !this.checkAllCell(function(c){ return (line.lcntCell(c)>0 && bd.isBlack(c));}) ){
				this.setAlert('黒マスの上に線が引かれています。','Theer is a line on the black cell.'); return false;
			}

			if( !this.checkSideCell(function(c1,c2){ return (bd.isBlack(c1) && bd.isBlack(c2));}) ){
				this.setAlert('黒マスがタテヨコに連続しています。','Black cells are adjacent.'); return false;
			}

			if( !this.checkLcntCell(1) ){
				this.setAlert('途切れている線があります。','There is a dead-end line.'); return false;
			}

			if( !this.checkArrowNumber() ){
				this.setAlert('矢印の方向にある黒マスの数が正しくありません。','The number of black cells are not correct.'); return false;
			}

			if( !this.checkOneLoop() ){
				this.setAlert('輪っかが一つではありません。','There are plural loops.'); return false;
			}

			if( !this.checkAllCell(function(c){ return (line.lcntCell(c)==0 && !bd.isBlack(c) && bd.QnC(c)==-1);}) ){
				this.setAlert('黒マスも線も引かれていないマスがあります。','Theer is an empty cell.'); return false;
			}

			return true;
		};
		ans.check1st = function(){ return this.checkLcntCell(1);};

		ans.checkArrowNumber = function(){
			var result = true;
			for(var c=0;c<bd.cellmax;c++){
				if(bd.QnC(c)<0 || bd.DiC(c)==0 || bd.isBlack(c)){ continue;}
				var cx = bd.cell[c].cx, cy = bd.cell[c].cy, dir = bd.DiC(c);
				var cnt=0, clist = [];
				if     (dir==k.UP){ cy--; while(cy>=0     ){ clist.push(bd.cnum(cx,cy)); cy--;} }
				else if(dir==k.DN){ cy++; while(cy<k.qrows){ clist.push(bd.cnum(cx,cy)); cy++;} }
				else if(dir==k.LT){ cx--; while(cx>=0     ){ clist.push(bd.cnum(cx,cy)); cx--;} }
				else if(dir==k.RT){ cx++; while(cx<k.qcols){ clist.push(bd.cnum(cx,cy)); cx++;} }

				for(var i=0;i<clist.length;i++){ if(bd.isBlack(clist[i])){ cnt++;} }

				if(bd.QnC(c)!=cnt){
					if(this.inAutoCheck){ return false;}
					bd.sErC([c],1);
					bd.sErC(clist,1);
					result = false;
				}
			}
			return result;
		};
	}
};
