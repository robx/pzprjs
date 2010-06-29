//
// パズル固有スクリプト部 ぬりぼう版 nuribou.js v3.3.1
//
Puzzles.nuribou = function(){ };
Puzzles.nuribou.prototype = {
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
		k.isAnsNumber     = false;	// 回答に数字を入力するパズル
		k.NumberWithMB    = false;	// 回答の数字と○×が入るパズル
		k.linkNumber      = false;	// 数字がひとつながりになるパズル

		k.BlackCell       = true;	// 黒マスを入力するパズル
		k.NumberIsWhite   = true;	// 数字のあるマスが黒マスにならないパズル
		k.RBBlackCell     = false;	// 連黒分断禁のパズル
		k.checkBlackCell  = true;	// 正答判定で黒マスの情報をチェックするパズル
		k.checkWhiteCell  = true;	// 正答判定で白マスの情報をチェックするパズル

		k.ispzprv3ONLY    = false;	// ぱずぷれアプレットには存在しないパズル
		k.isKanpenExist   = false;	// pencilbox/カンペンにあるパズル

		base.setTitle("ぬりぼう","Nuribou");
		base.setExpression("　左クリックで黒マスが、右クリックで白マス確定マスが入力できます。",
						   " Left Click to input black cells, Right Click to input determined white cells.");
		base.setFloatbgcolor("rgb(96, 96, 96)");
	},
	menufix : function(){
		menu.addUseToFlags();
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if     (k.editmode){ this.inputqnum();}
			else if(k.playmode){ this.inputcell();}
		};
		mv.mouseup = function(){ };
		mv.mousemove = function(){
			if(k.playmode) this.inputcell();
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
		pc.bcolor = pc.bcolor_GREEN;
		pc.setBGCellColorFunc('qsub1');

		pc.paint = function(x1,y1,x2,y2){
			this.drawBGCells(x1,y1,x2,y2);
			this.drawGrid(x1,y1,x2,y2);
			this.drawBlackCells(x1,y1,x2,y2);

			this.drawNumbers(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);

			this.drawTarget(x1,y1,x2,y2);
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
			this.decodeCellQnum();
			this.decodeCellAns();
		};
		fio.encodeData = function(){
			this.encodeCellQnum();
			this.encodeCellAns();
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			var binfo = area.getBCellInfo();
			if( !this.checkAllArea(binfo, f_true, function(w,h,a,n){ return (w==1||h==1);} ) ){
				this.setAlert('「幅１マス、長さ１マス以上」ではない黒マスのカタマリがあります。','There is a mass of black cells, whose width is more than two.'); return false;
			}

			if( !this.checkCorners(binfo) ){
				this.setAlert('同じ面積の黒マスのカタマリが、角を共有しています。','Masses of black cells whose length is the same share a corner.'); return false;
			}

			var winfo = area.getWCellInfo();
			if( !this.checkNoNumber(winfo) ){
				this.setAlert('数字の入っていないシマがあります。','An area of white cells has no numbers.'); return false;
			}

			if( !this.checkDoubleNumber(winfo) ){
				this.setAlert('1つのシマに2つ以上の数字が入っています。','An area of white cells has plural numbers.'); return false;
			}

			if( !this.checkNumberAndSize(winfo) ){
				this.setAlert('数字とシマの面積が違います。','The number is not equal to the number of the size of the area.'); return false;
			}

			return true;
		};

		ans.checkCorners = function(binfo){
			var result = true;
			for(var c=0;c<bd.cellmax;c++){
				if(bd.cell[c].bx===bd.maxbx-1 || bd.cell[c].by===bd.maxby-1){ continue;}

				var cc1, cc2;
				if     ( bd.isBlack(c) && bd.isBlack(c+k.qcols+1) ){ cc1 = c; cc2 = c+k.qcols+1;}
				else if( bd.isBlack(c+1) && bd.isBlack(c+k.qcols) ){ cc1 = c+1; cc2 = c+k.qcols;}
				else{ continue;}

				if(binfo.room[binfo.id[cc1]].idlist.length == binfo.room[binfo.id[cc2]].idlist.length){
					if(this.inAutoCheck){ return false;}
					bd.sErC(binfo.room[binfo.id[cc1]].idlist,1);
					bd.sErC(binfo.room[binfo.id[cc2]].idlist,1);
					result = false;
				}
			}
			return result;
		};
	}
};
