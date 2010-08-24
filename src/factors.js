//
// パズル固有スクリプト部 因子の部屋版 factors.js v3.3.2
//
Puzzles.factors = function(){ };
Puzzles.factors.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 9;}	// 盤面の横幅
		if(!k.qrows){ k.qrows = 9;}	// 盤面の縦幅
		k.irowake  = 0;		// 0:色分け設定無し 1:色分けしない 2:色分けする

		k.iscross  = 0;		// 1:盤面内側のCrossがあるパズル 2:外枠上を含めてCrossがあるパズル
		k.isborder = 1;		// 1:Border/Lineが操作可能なパズル 2:外枠上も操作可能なパズル
		k.isexcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

		k.isLineCross     = false;	// 線が交差するパズル
		k.isCenterLine    = false;	// マスの真ん中を通る線を回答として入力するパズル
		k.isborderAsLine  = false;	// 境界線をlineとして扱う
		k.hasroom         = true;	// いくつかの領域に分かれている/分けるパズル
		k.roomNumber      = true;	// 部屋の問題の数字が1つだけ入るパズル

		k.dispzero        = false;	// 0を表示するかどうか
		k.isDispHatena    = false;	// qnumが-2のときに？を表示する
		k.isAnsNumber     = true;	// 回答に数字を入力するパズル
		k.NumberWithMB    = false;	// 回答の数字と○×が入るパズル
		k.linkNumber      = false;	// 数字がひとつながりになるパズル

		k.BlackCell       = false;	// 黒マスを入力するパズル
		k.NumberIsWhite   = false;	// 数字のあるマスが黒マスにならないパズル
		k.RBBlackCell     = false;	// 連黒分断禁のパズル
		k.checkBlackCell  = false;	// 正答判定で黒マスの情報をチェックするパズル
		k.checkWhiteCell  = false;	// 正答判定で白マスの情報をチェックするパズル

		k.ispzprv3ONLY    = false;	// ぱずぷれアプレットには存在しないパズル
		k.isKanpenExist   = false;	// pencilbox/カンペンにあるパズル

		base.setTitle("因子の部屋",'Rooms of Factors');
		base.setExpression("　キーボードやマウスで数字が入力できます。",
						   " Inputting number is available by keybord or mouse");
		base.setFloatbgcolor("rgb(64, 64, 64)");
	},
	menufix : function(){ },

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(k.editmode){ this.inputborder();}
			if(k.playmode){ this.inputqnum();}
		};
		mv.mouseup = function(){
			if(this.notInputted()){
				if(k.editmode){ this.inputqnum();}
			}
		};
		mv.mousemove = function(){
			if(k.editmode && this.btn.Left) this.inputborder();
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum(ca);
		};

		kp.generate(0, true, true);
		kp.kpinput = function(ca){ kc.key_inputqnum(ca,Math.max(k.qcols,k.qrows));};

		bd.nummaxfunc = function(cc){ return k.editmode?999999:Math.max(k.qcols,k.qrows);};
		bd.setNum = function(c,val){
			if(val==0){ return;}
			if(k.editmode){ this.sQnC(c,val);}else{ this.sAnC(c,val);}
		};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_DLIGHT;

		pc.paint = function(){
			this.drawBGCells();
			this.drawGrid();

			this.drawNumbers_factors();

			this.drawBorders();

			this.drawChassis();

			this.drawCursor();
		};
		pc.drawNumbers_factors = function(){
			this.vinc('cell_number', 'auto');

			var clist = this.range.cells;
			for(var i=0;i<clist.length;i++){
				var c = clist[i], obj = bd.cell[c];
				var key_qans = ['cell',c,'qans'].join('_');
				var key_ques = ['cell',c,'ques'].join('_');

				if(bd.cell[c].anum!==-1){
					var color = (bd.cell[c].error==1?this.fontErrcolor:this.fontAnscolor);
					var size = (bd.cell[c].anum<10?0.8:0.7);
					this.dispnum(key_qans, 1, (""+bd.cell[c].anum), size, color, obj.cpx, obj.cpy);
				}
				else{ this.hideEL(key_qans);}

				if(bd.cell[c].qnum!==-1){
					var size = 0.45;
					if     (bd.cell[c].qnum>=100000){ size = 0.30;}
					else if(bd.cell[c].qnum>= 10000){ size = 0.36;}
					this.dispnum(key_ques, 5, (""+bd.cell[c].qnum), size, this.fontcolor, obj.cpx, obj.cpy);
				}
				else{ this.hideEL(key_ques);}
			}
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
			this.decodeBorderQues();
			this.decodeCellQnum();
			this.decodeCellAnumsub();
		};
		fio.encodeData = function(){
			this.encodeBorderQues();
			this.encodeCellQnum();
			this.encodeCellAnumsub();
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			if( !this.checkRowsCols(this.isDifferentNumberInClist, bd.AnC) ){
				this.setAlert('同じ列に同じ数字が入っています。','There are same numbers in a row.'); return false;
			}

			if( !this.checkRoomNumber(area.getRoomInfo()) ){
				this.setAlert('ブロックの数字と数字の積が同じではありません。','A number of room is not equal to the product of these numbers.'); return false;
			}

			if( !this.checkAllCell(function(c){ return (bd.AnC(c)===-1);}) ){
				this.setAlert('数字の入っていないマスがあります。','There is a empty cell.'); return false;
			}

			return true;
		};
		ans.check1st = function(){ return this.checkAllCell(function(c){ return (bd.AnC(c)===-1);});};

		ans.checkRoomNumber = function(rinfo){
			var result = true;
			for(var id=1;id<=rinfo.max;id++){
				var product = 1;
				for(var i=0;i<rinfo.room[id].idlist.length;i++){
					if(bd.AnC(rinfo.room[id].idlist[i])>0){ product *= bd.AnC(rinfo.room[id].idlist[i]);}
					else{ product = 0;}
				}
				if(product==0){ continue;}

				if(product!=bd.QnC(area.getTopOfRoom(id))){
					if(this.inAutoCheck){ return false;}
					bd.sErC(rinfo.room[id].idlist,1);
					result = false;
				}
			}
			return result;
		};
	}
};
