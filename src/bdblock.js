//
// パズル固有スクリプト部 ボーダーブロック版 bdblock.js v3.3.0
//
Puzzles.bdblock = function(){ };
Puzzles.bdblock.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}	// 盤面の横幅
		if(!k.qrows){ k.qrows = 10;}	// 盤面の縦幅
		k.irowake = 0;			// 0:色分け設定無し 1:色分けしない 2:色分けする

		k.iscross      = 1;		// 1:Crossが操作可能なパズル
		k.isborder     = 1;		// 1:Border/Lineが操作可能なパズル
		k.isextendcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

		k.isoutsidecross  = 1;	// 1:外枠上にCrossの配置があるパズル
		k.isoutsideborder = 0;	// 1:盤面の外枠上にborderのIDを用意する
		k.isLineCross     = 0;	// 1:線が交差するパズル
		k.isCenterLine    = 0;	// 1:マスの真ん中を通る線を回答として入力するパズル
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

		k.ispzprv3ONLY  = 0;	// 1:ぱずぷれv3にしかないパズル
		k.isKanpenExist = 0;	// 1:pencilbox/カンペンにあるパズル

		//k.def_csize = 36;
		//k.def_psize = 24;
		//k.area = { bcell:0, wcell:0, number:0};	// areaオブジェクトで領域を生成する

		base.setTitle("ボーダーブロック","Border Block");
		base.setExpression("　左ドラッグで境界線が、右ドラッグで補助記号が入力できます。",
						   " Left Button Drag to input border lines, Right to input auxiliary marks.");
		base.setFloatbgcolor("rgb(0, 127, 96)");
	},
	menufix : function(){ },

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(k.editmode) this.inputcrossMark();
			else if(k.playmode){
				if(this.btn.Left) this.inputborderans();
				else if(this.btn.Right) this.inputQsubLine();
			}
		};
		mv.mouseup = function(){
			if(this.notInputted()){
				if(k.editmode){
					if(!kp.enabled()){ this.inputqnum();}
					else{ kp.display();}
				}
			}
		};
		mv.mousemove = function(){
			if(k.playmode){
				if(this.btn.Left) this.inputborderans();
				else if(this.btn.Right) this.inputQsubLine();
			}
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(k.playmode){ return;}
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum(ca);
		};

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
		pc.setBorderColorFunc('qans');
		pc.gridcolor = pc.gridcolor_DLIGHT;
		pc.BorderQanscolor = "black";
		pc.crosssize = 0.15;

		pc.paint = function(x1,y1,x2,y2){
			this.drawBGCells(x1,y1,x2,y2);
			this.drawDashedGrid(x1,y1,x2,y2);
			this.drawBorders(x1,y1,x2,y2);

			this.drawNumbers(x1,y1,x2,y2);
			this.drawCrossMarks(x1,y1,x2+1,y2+1);

			this.drawBorderQsubs(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);

			this.drawTarget(x1,y1,x2,y2);
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decodeCrossMark();
			this.outbstr = this.outbstr.substr(1); // /を消しておく
			this.decodeNumber16();
		};
		enc.pzlexport = function(type){
			this.encodeCrossMark();
			this.outbstr += "/";
			this.encodeNumber16();
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeCellQnum();
			this.decodeCrossNum();
			this.decodeBorderAns();
		};
		fio.encodeData = function(){
			this.encodeCellQnum();
			this.encodeCrossNum();
			this.encodeBorderAns();
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			if( !this.checkLcntCross(3,2) ){
				this.setAlert('黒点以外のところで線が分岐しています。','Lines are branched out of the black point.'); return false;
			}
			if( !this.checkLcntCross(4,2) ){
				this.setAlert('黒点以外のところで線が交差しています。','Lines are crossed out of the black point.'); return false;
			}

			rinfo = area.getRoomInfo();
			if( !this.checkNoNumber(rinfo) ){
				this.setAlert('数字のないブロックがあります。','A block has no number.'); return false;
			}
			if( !this.checkSameObjectInRoom(rinfo, ee.binder(bd, bd.QnC)) ){
				this.setAlert('１つのブロックに異なる数字が入っています。','A block has dirrerent numbers.'); return false;
			}
			if( !this.checkObjectRoom(rinfo, ee.binder(bd, bd.QnC)) ){
				this.setAlert('同じ数字が異なるブロックに入っています。','One kind of numbers is included in dirrerent blocks.'); return false;
			}

			if( !this.checkLcntCross(1,0) ){
				this.setAlert('途中で途切れている線があります。','There is a dead-end line.'); return false;
			}
			if( !this.checkLcntCross(2,1) ){
				this.setAlert('線が３本以上出ていない黒点があります。','A black point has two or less lines.'); return false;
			}
			if( !this.checkLcntCross(0,1) ){
				this.setAlert('線が出ていない黒点があります。','A black point has no line.'); return false;
			}

			return true;
		};
	}
};
