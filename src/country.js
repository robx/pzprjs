//
// パズル固有スクリプト部 カントリーロード版 country.js v3.3.0
//
Puzzles.country = function(){ };
Puzzles.country.prototype = {
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
		k.isOneNumber   = 1;	// 1:部屋の問題の数字が1つだけ入るパズル
		k.isDispNumUL   = 0;	// 1:数字をマス目の左上に表示するパズル(0はマスの中央)
		k.NumberWithMB  = 0;	// 1:回答の数字と○×が入るパズル

		k.BlackCell     = 0;	// 1:黒マスを入力するパズル
		k.NumberIsWhite = 0;	// 1:数字のあるマスが黒マスにならないパズル
		k.RBBlackCell   = 0;	// 1:連黒分断禁のパズル

		k.ispzprv3ONLY  = 0;	// 1:ぱずぷれv3にしかないパズル
		k.isKanpenExist = 0;	// 1:pencilbox/カンペンにあるパズル

		//k.def_csize = 36;
		//k.def_psize = 24;
		//k.area = { bcell:0, wcell:0, number:0};	// areaオブジェクトで領域を生成する

		base.setTitle("カントリーロード","Country Road");
		base.setExpression("　ドラッグで線が、マスのクリックで○×(補助記号)が入力できます。",
						   " Left Button Drag to input lines, Click to input auxiliary marks.");
		base.setFloatbgcolor("rgb(191, 0, 0)");
	},
	menufix : function(){
		menu.addRedLineToFlags();
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(kc.isZ ^ pp.getVal('dispred')){ this.dispRedLine(); return;}
			if(k.editmode) this.inputborder();
			else if(k.playmode){
				if(this.btn.Left) this.inputLine();
			}
		};
		mv.mouseup = function(){
			if(this.notInputted()){
				if(k.editmode){
					if(!kp.enabled()){ this.inputqnum();}
					else{ kp.display();}
				}
				else if(k.playmode) this.inputMB();
			}
		};
		mv.mousemove = function(){
			if(k.editmode) this.inputborder();
			else if(k.playmode){
				if(this.btn.Left) this.inputLine();
			}
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(ca=='z' && !this.keyPressed){ this.isZ=true; return;}
			if(k.playmode){ return;}
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum(ca);
		};
		kc.keyup = function(ca){ if(ca=='z'){ this.isZ=false;}};
		kc.isZ = false;

		if(k.EDITOR){
			kp.generate(0, true, false, '');
			kp.kpinput = function(ca){
				kc.key_inputqnum(ca);
			};
		}

		bd.nummaxfunc = function(cc){ return Math.min(this.maxnum, area.getCntOfRoomByCell(cc));};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_SLIGHT;

		pc.paint = function(x1,y1,x2,y2){
			this.drawBGCells(x1,y1,x2,y2);
			this.drawNumbers(x1,y1,x2,y2);

			this.drawGrid(x1,y1,x2,y2);
			this.drawBorders(x1,y1,x2,y2);

			this.drawMBs(x1,y1,x2,y2);
			this.drawLines(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);

			this.drawTarget(x1,y1,x2,y2);
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decodeBorder();
			this.decodeRoomNumber16();
		};
		enc.pzlexport = function(type){
			this.encodeBorder();
			this.encodeRoomNumber16();
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeAreaRoom();
			this.decodeCellQnum();
			this.decodeBorderLine();
			this.decodeCellQsub();
		};
		fio.encodeData = function(){
			this.encodeAreaRoom();
			this.encodeCellQnum();
			this.encodeBorderLine();
			this.encodeCellQsub();
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			if( !this.checkLcntCell(3) ){
				this.setAlert('分岐している線があります。','There is a branch line.'); return false;
			}
			if( !this.checkLcntCell(4) ){
				this.setAlert('交差している線があります。','There is a crossing line.'); return false;
			}

			var rinfo = area.getRoomInfo();
			if( !this.checkRoom2( rinfo ) ){
				this.setAlert('線が１つの国を２回以上通っています。','A line passes a country twice or more.'); return false;
			}

			if( !this.checkLinesInArea(rinfo, function(w,h,a,n){ return (n<=0||n==a);}) ){
				this.setAlert('数字のある国と線が通過するマスの数が違います。','The number of the cells that is passed any line in the country and the number written in the country is diffrerent.'); return false;
			}
			if( !this.checkLinesInArea(rinfo, function(w,h,a,n){ return (a!=0);}) ){
				this.setAlert('線の通っていない国があります。','There is a country that is not passed any line.'); return false;
			}

			if( !this.checkSideAreaCell(rinfo, function(c1,c2){ return (line.lcntCell(c1)==0 && line.lcntCell(c2)==0);}, false) ){
				this.setAlert('線が通らないマスが、太線をはさんでタテヨコにとなりあっています。','The cells that is not passed any line are adjacent over border line.'); return false;
			}

			if( !this.checkLcntCell(1) ){
				this.setAlert('途中で途切れている線があります。', 'There is a dead-end line.'); return false;
			}

			if( !this.checkOneLoop() ){
				this.setAlert('輪っかが一つではありません。','There are two or more loops.'); return false;
			}

			return true;
		};

		ans.checkRoom2 = function(rinfo){
			if(rinfo.max<=1){ return true;}
			var result = true;
			for(var r=1;r<=rinfo.max;r++){
				var cnt=0;
				for(var i=0;i<rinfo.room[r].idlist.length;i++){
					var c=rinfo.room[r].idlist[i];
					var ub=bd.ub(c); if(bd.up(c)!=-1 && bd.isBorder(ub) && bd.isLine(ub)){ cnt++;}
					var db=bd.db(c); if(bd.dn(c)!=-1 && bd.isBorder(db) && bd.isLine(db)){ cnt++;}
					var lb=bd.lb(c); if(bd.lt(c)!=-1 && bd.isBorder(lb) && bd.isLine(lb)){ cnt++;}
					var rb=bd.rb(c); if(bd.rt(c)!=-1 && bd.isBorder(rb) && bd.isLine(rb)){ cnt++;}
				}
				if(cnt>2){
					if(this.inAutoCheck){ return false;}
					bd.sErC(rinfo.room[r].idlist,1);
					result = false;
				}
			}
			return result;
		};
	}
};
