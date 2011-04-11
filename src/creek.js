//
// パズル固有スクリプト部 クリーク版 creek.js v3.4.0
//
Puzzles.creek = function(){ };
Puzzles.creek.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}
		if(!k.qrows){ k.qrows = 10;}

		k.iscross  = 2;

		k.dispzero        = true;
		k.checkWhiteCell  = true;

		k.bdmargin       = 0.70;
		k.bdmargin_image = 0.50;

		base.setFloatbgcolor("rgb(0, 0, 255)");
	},
	menufix : function(){
		menu.addUseToFlags();
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(k.playmode) this.inputcell();
			else if(k.editmode){ this.inputcross();}
		};
		mv.mouseup = function(){ };
		mv.mousemove = function(){
			if(k.playmode) this.inputcell();
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(k.playmode){ return;}
			if(this.moveTCross(ca)){ return;}
			this.key_inputcross(ca);
		};

		if(k.EDITOR){
			kp.generate(4, true, false);
			kp.kpinput = function(ca){
				kc.key_inputcross(ca);
			};
		}

		tc.setCrossType();

		bd.maxnum = 4;
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.cellcolor = "rgb(96, 96, 96)";
		pc.setBGCellColorFunc('qans1');

		pc.crosssize = 0.35;

		pc.paint = function(){
			this.drawBGCells();
			this.drawDotCells(false);
			this.drawGrid();

			this.drawChassis();

			this.drawCrosses();
			this.drawTarget();
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			var oldflag = ((type==1 && !this.checkpflag("c")) || (type==0 && this.checkpflag("d")));
			if(!oldflag){ this.decode4Cross();}
			else        { this.decodecross_old();}
		};
		enc.pzlexport = function(type){
			if(type==1){ this.outpflag = 'c';}
			this.encode4Cross();
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeCrossNum();
			this.decodeCellAns();
		};
		fio.encodeData = function(){
			this.encodeCrossNum();
			this.encodeCellAns();
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){
			if( !this.checkQnumCross(1) ){
				this.setAlert('数字のまわりにある黒マスの数が間違っています。','The number of black cells around a number on crossing is big.'); return false;
			}
			if( !this.checkOneArea( bd.areas.getWCellInfo() ) ){
				this.setAlert('白マスが分断されています。','White cells are devided.'); return false;
			}
			if( !this.checkQnumCross(2) ){
				this.setAlert('数字のまわりにある黒マスの数が間違っています。','The number of black cells around a number on crossing is small.'); return false;
			}

			return true;
		};

		ans.checkQnumCross = function(type){
			var result = true;
			for(var c=0;c<bd.crossmax;c++){
				var qn = bd.QnX(c);
				if(qn<0){ continue;}

				var bx=bd.cross[c].bx, by=bd.cross[c].by;
				var cnt=0, clist = bd.cellinside(bx-1,by-1,bx+1,by+1);
				for(var i=0;i<clist.length;i++){if(bd.isBlack(clist[i])){ cnt++;}}

				if((type===1 && qn<cnt) || (type===2 && qn>cnt)){
					if(this.inAutoCheck){ return false;}
					bd.sErX([c],1);
					result = false;
				}
			}
			return result;
		};
	}
};
