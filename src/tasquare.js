//
// パズル固有スクリプト部 たすくえあ版 tasquare.js v3.3.0
//
Puzzles.tasquare = function(){ };
Puzzles.tasquare.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}	// 盤面の横幅
		if(!k.qrows){ k.qrows = 10;}	// 盤面の縦幅
		k.irowake = 0;			// 0:色分け設定無し 1:色分けしない 2:色分けする

		k.iscross      = 0;		// 1:Crossが操作可能なパズル
		k.isborder     = 0;		// 1:Border/Lineが操作可能なパズル
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
			this.drawBGCells(x1,y1,x2,y2);
			this.drawRDotCells(x1,y1,x2,y2);
			this.drawGrid(x1,y1,x2,y2);
			this.drawBlackCells(x1,y1,x2,y2);

			this.drawCellSquare(x1,y1,x2,y2);

			this.drawNumbers(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);

			this.drawTarget(x1,y1,x2,y2);
		};

		pc.drawCellSquare = function(x1,y1,x2,y2){
			this.vinc('cell_square', 'crispEdges');

			var mgnw = this.cw*0.1;
			var mgnh = this.ch*0.1;
			var header = "c_sq_";

			var clist = this.cellinside(x1,y1,x2,y2);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				if(bd.cell[c].qnum!==-1){
					g.lineWidth = 1;
					g.strokeStyle = "black";
					g.fillStyle = (bd.cell[c].error===1 ? this.errbcolor1 : "white");
					if(this.vnop(header+c,this.FILL)){
						g.shapeRect(bd.cell[c].px+mgnw+1, bd.cell[c].py+mgnh+1, this.cw-mgnw*2-1, this.ch-mgnh*2-1);
					}
				}
				else{ this.vhide([header+c]);}
			}
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
			this.decodeCellQnumAns();
		};
		fio.encodeData = function(){
			this.encodeCellQnumAns();
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			var binfo = area.getBCellInfo();
			if( !this.checkAllArea(binfo, f_true, function(w,h,a,n){ return (w*h==a && w==h);} ) ){
				this.setAlert('正方形でない黒マスのカタマリがあります。','A mass of black cells is not regular rectangle.'); return false;
			}

			if( !this.checkOneArea( area.getWCellInfo() ) ){
				this.setAlert('白マスが分断されています。','White cells are devided.'); return false;
			}

			if( !this.checkNumberSquare(binfo,true) ){
				this.setAlert('数字とそれに接する黒マスの大きさの合計が一致しません。','Sum of the adjacent masses of black cells is not equal to the number.'); return false;
			}

			if( !this.checkNumberSquare(binfo,false) ){
				this.setAlert('数字のない□に黒マスが接していません。','No black cells are adjacent to square mark without numbers.'); return false;
			}

			return true;
		};

		ans.checkNumberSquare = function(binfo, flag){
			var result = true;
			for(var c=0;c<bd.cellmax;c++){
				if((flag?(bd.QnC(c)<0):(bd.QnC(c)!==-2))){ continue;}
				var clist=[];
				if(bd.isBlack(bd.up(c))){ clist = clist.concat(binfo.room[binfo.id[bd.up(c)]].idlist);}
				if(bd.isBlack(bd.dn(c))){ clist = clist.concat(binfo.room[binfo.id[bd.dn(c)]].idlist);}
				if(bd.isBlack(bd.lt(c))){ clist = clist.concat(binfo.room[binfo.id[bd.lt(c)]].idlist);}
				if(bd.isBlack(bd.rt(c))){ clist = clist.concat(binfo.room[binfo.id[bd.rt(c)]].idlist);}

				if(flag?(clist.length!==bd.QnC(c)):(clist.length===0)){
					if(ans.inAutoCheck){ return false;}
					bd.sErC(clist,1);
					bd.sErC([c],1);
					result = false;
				}
			}
			return result;
		};
	}
};
