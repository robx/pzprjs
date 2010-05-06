//
// パズル固有スクリプト部 数コロ版 sukoro.js v3.3.0
//
Puzzles.sukoro = function(){ };
Puzzles.sukoro.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}	// 盤面の横幅
		if(!k.qrows){ k.qrows = 10;}	// 盤面の縦幅
		k.irowake  = 0;		// 0:色分け設定無し 1:色分けしない 2:色分けする

		k.iscross  = 0;		// 1:盤面内側のCrossがあるパズル 2:外枠上を含めてCrossがあるパズル
		k.isborder = 0;		// 1:Border/Lineが操作可能なパズル 2:外枠上も操作可能なパズル
		k.isexcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

		k.isLineCross     = false;	// 線が交差するパズル
		k.isCenterLine    = false;	// マスの真ん中を通る線を回答として入力するパズル
		k.isborderAsLine  = false;	// 境界線をlineとして扱う
		k.hasroom         = false;	// いくつかの領域に分かれている/分けるパズル
		k.roomNumber      = false;	// 部屋の問題の数字が1つだけ入るパズル

		k.dispzero        = false;	// 0を表示するかどうか
		k.isDispHatena    = true;	// qnumが-2のときに？を表示する
		k.isAnsNumber     = true;	// 回答に数字を入力するパズル
		k.NumberWithMB    = true;	// 回答の数字と○×が入るパズル
		k.linkNumber      = true;	// 数字がひとつながりになるパズル

		k.BlackCell       = false;	// 黒マスを入力するパズル
		k.NumberIsWhite   = false;	// 数字のあるマスが黒マスにならないパズル
		k.RBBlackCell     = false;	// 連黒分断禁のパズル
		k.checkBlackCell  = false;	// 正答判定で黒マスの情報をチェックするパズル
		k.checkWhiteCell  = false;	// 正答判定で白マスの情報をチェックするパズル

		k.ispzprv3ONLY    = false;	// ぱずぷれアプレットには存在しないパズル
		k.isKanpenExist   = false;	// pencilbox/カンペンにあるパズル

		base.setTitle("数コロ","Sukoro");
		base.setExpression("　マスのクリックやキーボードで数字を入力できます。QAZキーで○、WSXキーで×を入力できます。",
					   " It is available to input number by keybord or mouse. Each QAZ key to input auxiliary circle, each WSX key to input auxiliary cross.");
		base.setFloatbgcolor("rgb(64, 64, 64)");
	},
	menufix : function(){ },

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(!kp.enabled()){ this.inputqnum();}
			else{ kp.display();}
		};
		mv.mouseup = function(){ };
		mv.mousemove = function(){ };

		// キーボード入力系
		kc.keyinput = function(ca){
			if(this.moveTCell(ca)){ return;}
			if(kc.key_sukoro(ca)){ return;}
			this.key_inputqnum(ca);
		};
		kc.key_sukoro = function(ca){
			if(k.editmode || bd.QnC(tc.getTCC())!=-1){ return false;}

			var cc = tc.getTCC();
			var flag = false;

			if     ((ca=='q'||ca=='a'||ca=='z')){ if(bd.QsC(cc)==1){ bd.sQaC(cc,1); bd.sQsC(cc,0);}else{ bd.sQaC(cc,-1); bd.sQsC(cc,1);} flag = true;}
			else if((ca=='w'||ca=='s'||ca=='x')){ if(bd.QsC(cc)==2){ bd.sQaC(cc,2); bd.sQsC(cc,0);}else{ bd.sQaC(cc,-1); bd.sQsC(cc,2);} flag = true;}
			else if((ca=='e'||ca=='d'||ca=='c')){ bd.sQaC(cc,-1); bd.sQsC(cc,0); flag = true;}
			else if(ca=='1' && bd.QaC(cc)==1)   { bd.sQaC(cc,-1); bd.sQsC(cc,1); flag = true;}
			else if(ca=='2' && bd.QaC(cc)==2)   { bd.sQaC(cc,-1); bd.sQsC(cc,2); flag = true;}

			if(flag){ pc.paintCell(cc); return true;}
			return false;
		};

		kp.kpgenerate = function(mode){
			this.inputcol('num','knum1','1','1');
			this.inputcol('num','knum2','2','2');
			this.inputcol('num','knum3','3','3');
			this.inputcol('num','knum4','4','4');
			this.insertrow();
			if(mode==1){
				this.inputcol('num','knum.','-','?');
				this.inputcol('num','knum_',' ',' ');
				this.inputcol('empty','knumx','','');
				this.inputcol('empty','knumy','','');
				this.insertrow();
			}
			else{
				this.tdcolor = pc.mbcolor;
				this.inputcol('num','knumq','q','○');
				this.inputcol('num','knumw','w','×');
				this.tdcolor = "black";
				this.inputcol('num','knum_',' ',' ');
				this.inputcol('empty','knumx','','');
				this.insertrow();
			}
		};
		kp.generate(kp.ORIGINAL, true, true, kp.kpgenerate);
		kp.kpinput = function(ca){
			if(kc.key_sukoro(ca)){ return;}
			kc.key_inputqnum(ca);
		};

		bd.maxnum = 4;
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){

		pc.paint = function(x1,y1,x2,y2){
			this.drawBGCells(x1,y1,x2,y2);
			this.drawGrid(x1,y1,x2,y2);

			this.drawMBs(x1,y1,x2,y2);
			this.drawNumbers(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);

			this.drawCursor(x1,y1,x2,y2);
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decodeNumber10();
		};
		enc.pzlexport = function(type){
			this.encodeNumber10();
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeCellQnum();
			this.decodeCellQanssub();
		};
		fio.encodeData = function(){
			this.encodeCellQnum();
			this.encodeCellQanssub();
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			if( !this.checkSideCell(bd.sameNumber) ){
				this.setAlert('同じ数字がタテヨコに連続しています。','Same numbers are adjacent.'); return false;
			}

			if( !this.checkAllCell( function(c){ return (bd.isValidNum(c) && bd.getNum(c)!=ans.checkdir4Cell(c,bd.isNum));} ) ){
				this.setAlert('数字と、その数字の上下左右に入る数字の数が一致していません。','The number of numbers placed in four adjacent cells is not equal to the number.'); return false;
			}

			if( !this.checkOneArea( area.getNumberInfo() ) ){
				this.setAlert('タテヨコにつながっていない数字があります。','Numbers are devided.'); return false;
			}

			return true;
		};
	}
};
