//
// パズル固有スクリプト部 たすくえあ版 tasquare.js v3.2.3
//
Puzzles.tasquare = function(){ };
Puzzles.tasquare.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}	// 盤面の横幅
		if(!k.qrows){ k.qrows = 10;}	// 盤面の縦幅
		k.irowake = 0;			// 0:色分け設定無し 1:色分けしない 2:色分けする

		k.iscross      = 0;		// 1:Crossが操作可能なパズル
		k.isborder     = 1;		// 1:Border/Lineが操作可能なパズル
		k.isextendcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

		k.isoutsidecross  = 0;	// 1:外枠上にCrossの配置があるパズル
		k.isoutsideborder = 0;	// 1:盤面の外枠上にborderのIDを用意する
		k.isLineCross     = 0;	// 1:線が交差するパズル
		k.isCenterLine    = 0;	// 1:マスの真ん中を通る線を回答として入力するパズル
		k.isborderAsLine  = 0;	// 1:境界線をlineとして扱う

		k.dispzero      = 0;	// 1:0を表示するかどうか
		k.isDispHatena  = 0;	// 1:qnumが-2のときに？を表示する
		k.isAnsNumber   = 0;	// 1:回答に数字を入力するパズル
		k.isArrowNumber = 0;	// 1:矢印つき数字を入力するパズル
		k.isOneNumber   = 0;	// 1:部屋の問題の数字が1つだけ入るパズル
		k.isDispNumUL   = 0;	// 1:数字をマス目の左上に表示するパズル(0はマスの中央)
		k.NumberWithMB  = 0;	// 1:回答の数字と○×が入るパズル

		k.BlackCell     = 1;	// 1:黒マスを入力するパズル
		k.NumberIsWhite = 1;	// 1:数字のあるマスが黒マスにならないパズル
		k.RBBlackCell   = 0;	// 1:連黒分断禁のパズル

		k.ispzprv3ONLY  = 1;	// 1:ぱずぷれv3だけ
		k.isKanpenExist = 0;	// 1:pencilbox/カンペンにあるパズル

		k.fstruct = ["cellqnumans"];

		//k.def_csize = 36;
		//k.def_psize = 24;
		k.area = { bcell:1, wcell:1, number:0};	// areaオブジェクトで領域を生成する

		base.setTitle("たすくえあ","Tasquare");
		base.setExpression("　左クリックで黒マスが、右クリックで白マス確定マスが入力できます。",
						   " Left Click to input black cells, Right Click to input determined white cells.");
		base.setFloatbgcolor("rgb(64, 64, 64)");
	},
	menufix : function(){
		menu.addUseToFlags();
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
			else if(k.playmode) this.inputcell();
		};
		mv.mouseup = function(){ };
		mv.mousemove = function(){
			if(k.playmode) this.inputcell();
		};
		mv.enableInputHatena = true;

		// キーボード入力系
		kc.keyinput = function(ca){
			if(k.playmode){ return;}
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum(ca);
		};

		if(k.EDITOR){
			kp.generate(3, true, false, '');
			kp.kpinput = function(ca){
				kc.key_inputqnum(ca);
			};
		}
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_LIGHT;
		pc.fontsizeratio = 0.85;

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);
		//	this.flushCanvasAll();

			this.drawGrid(x1,y1,x2,y2);
			this.drawBWCells(x1,y1,x2,y2);

			this.drawCellSquare(x1,y1,x2,y2);

			this.drawNumbers(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);

			this.drawTarget(x1,y1,x2,y2);
		};

		pc.drawCellSquare = function(x1,y1,x2,y2){
			var mgnw = mf(k.cwidth*0.1);
			var mgnh = mf(k.cheight*0.1);
			var headers = ["c_sq1_", "c_sq2_"]

			var clist = this.cellinside(x1,y1,x2,y2);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				if(bd.cell[c].qnum!==-1){
					g.fillStyle = "black";
					if(this.vnop(headers[0]+c,1)){
						g.fillRect(bd.cell[c].px+mgnw+1, bd.cell[c].py+mgnh+1, k.cwidth-mgnw*2-1, k.cheight-mgnh*2-1);
					}
					g.fillStyle = (bd.cell[c].error===1 ? this.errbcolor1 : "white");
					if(this.vnop(headers[1]+c,1)){
						g.fillRect(bd.cell[c].px+mgnw+2, bd.cell[c].py+mgnh+2, k.cwidth-mgnw*2-3, k.cheight-mgnh*2-3);
					}
				}
				else{ this.vhide([headers[0]+c, headers[1]+c]);}
			}
			this.vinc();
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type, bstr){
			if(type==0 || type==1){ bstr = this.decodeNumber16(bstr);}
		};
		enc.pzlexport = function(type){
			if(type==0)     { document.urloutput.ta.value = this.getURLbase()+"?"+k.puzzleid+this.pzldata();}
			else if(type==1){ document.urloutput.ta.value = this.getDocbase()+k.puzzleid+"/sa/m.html?c"+this.pzldata();}
			else if(type==3){ document.urloutput.ta.value = this.getURLbase()+"?m+"+k.puzzleid+this.pzldata();}
		};
		enc.pzldata = function(){
			return "/"+k.qcols+"/"+k.qrows+"/"+this.encodeNumber16();
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			var binfo = area.getBCellInfo();
			if( !this.checkAllArea(binfo, f_true, function(w,h,a){ return (w*h==a && w==h);} ) ){
				this.setAlert('正方形でない黒マスのカタマリがあります。','A mass of black cells is not regular rectangle.'); return false;
			}

			if( !this.checkOneArea( area.getWCellInfo() ) ){
				this.setAlert('白マスが分断されています。','White cells are devided.'); return false;
			}

			if( !this.isNumberSquare(binfo,0) ){
				this.setAlert('数字とそれに接する黒マスの大きさの合計が一致しません。','Sum of the adjacent masses of black cells is not equal to the number.'); return false;
			}

			if( !this.isNumberSquare(binfo,1) ){
				this.setAlert('数字のない□に黒マスが接していません。','No black cells are adjacent to square mark without numbers.'); return false;
			}

			return true;
		};

		ans.isNumberSquare = function(binfo, flag){
			for(var c=0;c<bd.cellmax;c++){
				if((flag==0?(bd.QnC(c)<0):(bd.QnC(c)!=-2))){ continue;}
				var cnt = 0;
				if(bd.isBlack(bd.up(c))){ cnt += binfo.room[binfo.id[bd.up(c)]].idlist.length;}
				if(bd.isBlack(bd.dn(c))){ cnt += binfo.room[binfo.id[bd.dn(c)]].idlist.length;}
				if(bd.isBlack(bd.lt(c))){ cnt += binfo.room[binfo.id[bd.lt(c)]].idlist.length;}
				if(bd.isBlack(bd.rt(c))){ cnt += binfo.room[binfo.id[bd.rt(c)]].idlist.length;}
				if(bd.QnC(c)>=0?(bd.QnC(c)!=cnt):(cnt==0)){
					if(bd.isBlack(bd.up(c))){ bd.sErC(binfo.room[binfo.id[bd.up(c)]].idlist,1); }
					if(bd.isBlack(bd.dn(c))){ bd.sErC(binfo.room[binfo.id[bd.dn(c)]].idlist,1); }
					if(bd.isBlack(bd.lt(c))){ bd.sErC(binfo.room[binfo.id[bd.lt(c)]].idlist,1); }
					if(bd.isBlack(bd.rt(c))){ bd.sErC(binfo.room[binfo.id[bd.rt(c)]].idlist,1); }
					bd.sErC([c],1);
					return false;
				}
			}
			return true;
		};
	}
};
