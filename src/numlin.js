//
// パズル固有スクリプト部 ナンバーリンク版 numlin.js v3.3.0
//
Puzzles.numlin = function(){ };
Puzzles.numlin.prototype = {
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

		base.setTitle("　ナンバーリンク","Numberlink");
		base.setExpression("　左ドラッグで線が、右ドラッグで×印が入力できます。",
						   " Left Button Drag to input black cells, Right Click to input a cross.");
		base.setFloatbgcolor("rgb(96, 96, 96)");

		enc.pidKanpen= 'numberlink';
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
			if(k.editmode){
				if(!kp.enabled()){ this.inputqnum();}
				else{ kp.display();}
			}
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
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_LIGHT;

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);

			this.drawBGCells(x1,y1,x2,y2);
			this.drawGrid(x1,y1,x2,y2);

			this.drawPekes(x1,y1,x2,y2,0);
			this.drawLines(x1,y1,x2,y2);

			this.drawCellSquare(x1,y1,x2,y2);
			this.drawNumbers(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);

			this.drawTarget(x1,y1,x2,y2);
		};

		pc.drawCellSquare = function(x1,y1,x2,y2){
			this.vinc('cell_number_base', 'crispEdges');

			var mgnw = this.cw*0.15;
			var mgnh = this.ch*0.15;
			var header = "c_sq_";

			var clist = this.cellinside(x1-2,y1-2,x2+2,y2+2);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				if(bd.cell[c].qnum!==-1){
					if     (bd.cell[c].error===1){ g.fillStyle = this.errbcolor1;}
					else if(bd.cell[c].error===2){ g.fillStyle = this.errbcolor2;}
					else                         { g.fillStyle = "white";}

					if(this.vnop(header+c,this.FILL)){
						g.fillRect(bd.cell[c].px+mgnw+1, bd.cell[c].py+mgnh+1, this.cw-mgnw*2-1, this.ch-mgnh*2-1);
					}
				}
				else{ this.vhide(header+c);}
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

		enc.decodeKanpen = function(){
			fio.decodeCellQnum_kanpen();
		};
		enc.encodeKanpen = function(){
			fio.encodeCellQnum_kanpen();
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeCellQnum();
			this.decodeBorderLine();
		};
		fio.encodeData = function(){
			this.encodeCellQnum();
			this.encodeBorderLine();
		};

		fio.kanpenOpen = function(){
			this.decodeCellQnum_kanpen();
			this.decodeBorderLine();
		};
		fio.kanpenSave = function(){
			this.encodeCellQnum_kanpen();
			this.encodeBorderLine();
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){
			this.performAsLine = true;

			if( !this.checkLcntCell(3) ){
				this.setAlert('分岐している線があります。','There is a branch line.'); return false;
			}
			if( !this.checkLcntCell(4) ){
				this.setAlert('線が交差しています。','There is a crossing line.'); return false;
			}

			var linfo = line.getLareaInfo();
			if( !this.checkTripleNumber(linfo) ){
				this.setAlert('3つ以上の数字がつながっています。','Three or more numbers are connected.'); return false;
			}

			if( !this.checkSameObjectInRoom(linfo, ee.binder(bd, bd.QnC)) ){
				this.setAlert('異なる数字がつながっています。','Different numbers are connected.'); return false;
			}

			if( !this.check2Line() ){
				this.setAlert('数字の上を線が通過しています。','A line goes through a number.'); return false;
			}
			if( !this.check1Line() ){
				this.setAlert('途切れている線があります。','There is a dead-end line.'); return false;
			}
			if( !this.checkDisconnectLine(linfo) ){
				this.setAlert('数字につながっていない線があります。','A line doesn\'t connect any number.'); return false;
			}

			if( !this.checkAllCell(function(c){ return (line.lcntCell(c)==0 && bd.QnC(c)!=-1);}) ){
				this.setAlert('どこにもつながっていない数字があります。','A number is not connected another number.'); return false;
			}

			return true;
		};
		ans.check1st = function(){ return true;};

		ans.check1Line = function(){ return this.checkLine(function(i){ return (line.lcntCell(i)==1 && bd.QnC(i)==-1);}); };
		ans.check2Line = function(){ return this.checkLine(function(i){ return (line.lcntCell(i)>=2 && bd.QnC(i)!=-1);}); };
		ans.checkLine = function(func){
			var result = true;
			for(var c=0;c<bd.cellmax;c++){
				if(!func(c)){ continue;}

				if(this.inAutoCheck){ return false;}
				if(result){ bd.sErBAll(2);}
				ans.setCellLineError(c,true);
				result = false;
			}
			return result;
		};
	}
};
