//
// パズル固有スクリプト部 クロシュート版 kurochute.js v3.3.1
//
Puzzles.kurochute = function(){ };
Puzzles.kurochute.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 8;}	// 盤面の横幅
		if(!k.qrows){ k.qrows = 8;}	// 盤面の縦幅
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
		k.isAnsNumber     = false;	// 回答に数字を入力するパズル
		k.NumberWithMB    = false;	// 回答の数字と○×が入るパズル
		k.linkNumber      = false;	// 数字がひとつながりになるパズル

		k.BlackCell       = true;	// 黒マスを入力するパズル
		k.NumberIsWhite   = true;	// 数字のあるマスが黒マスにならないパズル
		k.RBBlackCell     = true;	// 連黒分断禁のパズル
		k.checkBlackCell  = false;	// 正答判定で黒マスの情報をチェックするパズル
		k.checkWhiteCell  = true;	// 正答判定で白マスの情報をチェックするパズル

		k.ispzprv3ONLY    = true;	// ぱずぷれアプレットには存在しないパズル
		k.isKanpenExist   = true;	// pencilbox/カンペンにあるパズル

		base.setTitle("クロシュート","Kurochute");
		base.setExpression("　左クリックで黒マスが、右クリックで白マス確定マスが入力できます。",
						   " Left Click to input black cells, Right Click to input determined white cells.");
		base.setFloatbgcolor("rgb(96, 96, 96)");

		enc.pidKanpen = 'kurochute';
	},
	menufix : function(){
		menu.addUseToFlags();
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if     (k.editmode) this.inputqnum();
			else if(k.playmode) this.inputcell();
		};
		mv.mouseup = function(){
			if(k.playmode && this.notInputted()) this.inputqsub();
		};
		mv.mousemove = function(){
			if(k.playmode) this.inputcell();
		};
		mv.inputqsub = function(){
			var cc = this.cellid();
			if(cc===null){ return;}

			if     (bd.QsC(cc)==0){ bd.sQsC(cc,2);}
			else if(bd.QsC(cc)==2){ bd.sQsC(cc,0);}
			pc.paintCell(cc);
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(k.playmode){ return;}
			if(this.key_inputdirec(ca)){ return;}
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum(ca);
		};

		bd.nummaxfunc = function(cc){ return Math.max(k.qcols,k.qrows)-1;};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_LIGHT;
		pc.qsubcolor2 = pc.bcolor_GREEN;

		pc.paint = function(x1,y1,x2,y2){
			this.drawBGCells(x1,y1,x2,y2);
			this.drawDotCells(x1,y1,x2,y2,false);
			this.drawGrid(x1,y1,x2,y2);
			this.drawBlackCells(x1,y1,x2,y2);

			this.drawNumbers(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);

			this.drawTarget(x1,y1,x2,y2);
		};

		// オーバーライド drawBGCells用 (qsub==1は表示しない..)
		pc.setBGCellColor = function(cc){
			var cell = bd.cell[cc];
			if     (cell.error===1){ g.fillStyle = this.errbcolor1; return true;}
			else if(cell.qsub ===2){ g.fillStyle = this.qsubcolor2; return true;}
			return false;
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

			if( !this.checkSideCell(function(c1,c2){ return (bd.isBlack(c1) && bd.isBlack(c2));}) ){
				this.setAlert('黒マスがタテヨコに連続しています。','Black cells are adjacent.'); return false;
			}

			if( !this.checkOneArea( area.getWCellInfo() ) ){
				this.setAlert('白マスが分断されています。','White cells are devided.'); return false;
			}

			if( !this.checkCellNumber() ){
				this.setAlert('数字の数だけ離れたマスのうち、1マスだけ黒マスになっていません。','The number of black cells at aparted cell by the number is not one.'); return false;
			}

			return true;
		};
		ans.check1st = function(){ return true;};

		ans.checkCellNumber = function(){
			var result = true;

			for(var c=0;c<bd.cellmax;c++){
				if(!bd.isValidNum(c)){ continue;}
				var bx=bd.cell[c].bx, by=bd.cell[c].by, num=bd.QnC(c), clist=[];
				if(bd.isBlack(bd.cnum(bx-num*2,by))){ clist.push(bd.cnum(bx-num*2,by));}
				if(bd.isBlack(bd.cnum(bx+num*2,by))){ clist.push(bd.cnum(bx+num*2,by));}
				if(bd.isBlack(bd.cnum(bx,by-num*2))){ clist.push(bd.cnum(bx,by-num*2));}
				if(bd.isBlack(bd.cnum(bx,by+num*2))){ clist.push(bd.cnum(bx,by+num*2));}
				if(clist.length!==1){
					if(this.inAutoCheck){ return false;}
					bd.sErC([c],4);
					bd.sErC(clist,1);
					result = false;
				}
			}
			return result;
		};
	}
};
