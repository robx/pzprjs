//
// パズル固有スクリプト部 モチコロ版 mochikoro.js v3.3.2
//
Puzzles.mochikoro = function(){ };
Puzzles.mochikoro.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}
		if(!k.qrows){ k.qrows = 10;}

		k.isDispHatena    = true;
		k.isInputHatena   = true;
		k.BlackCell       = true;
		k.NumberIsWhite   = true;
		k.checkWhiteCell  = true;

		base.setTitle("モチコロ","Mochikoro");
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
			kp.generate(0, true, false);
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

		pc.paint = function(){
			this.drawBGCells();
			this.drawGrid();
			this.drawBlackCells();

			this.drawNumbers();

			this.drawChassis();

			this.drawTarget();
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

			if( !this.check2x2Block( bd.isBlack ) ){
				this.setAlert('2x2の黒マスのかたまりがあります。','There is a block of 2x2 black cells.'); return false;
			}

			if( !this.checkWareaSequent() ){
				this.setAlert('孤立した白マスのブロックがあります。','White cells are devided.'); return false;
			}

			var winfo = area.getWCellInfo();
			if( !this.checkAreaRect(winfo) ){
				this.setAlert('四角形でない白マスのブロックがあります。','There is a block of white cells that is not rectangle.'); return false;
			}

			if( !this.checkDoubleNumber(winfo) ){
				this.setAlert('1つのブロックに2つ以上の数字が入っています。','A block has plural numbers.'); return false;
			}

			if( !this.checkNumberAndSize(winfo) ){
				this.setAlert('数字とブロックの面積が違います。','A size of tha block and the number written in the block is differrent.'); return false;
			}

			return true;
		};

		ans.checkWareaSequent = function(){
			var winfo = new AreaInfo();
			for(var c=0;c<bd.cellmax;c++){ winfo.id[c]=(bd.isWhite(c)?0:null);}
			for(var c=0;c<bd.cellmax;c++){
				if(winfo.id[c]!==0){ continue;}
				winfo.max++;
				winfo.room[winfo.max] = {idlist:[]};
				this.sk0(winfo, c, winfo.max);
			}
			return ans.checkOneArea(winfo);
		};
		ans.sk0 = function(winfo, id, areaid){
			if(winfo.id[id]!==0){ return;}
			winfo.id[id] = areaid;
			winfo.room[areaid].idlist.push(id);

			var bx=bd.cell[id].bx, by=bd.cell[id].by;
			var clist = bd.cellinside(bx-2, by-2, bx+2, by+2);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				if(c!==id && winfo.id[c]===0){ this.sk0(winfo, c, areaid);}
			}
		};
	}
};
