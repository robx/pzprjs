//
// パズル固有スクリプト部 ヴィウ版 view.js v3.3.2
//
Puzzles.view = function(){ };
Puzzles.view.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 8;}
		if(!k.qrows){ k.qrows = 8;}

		k.dispzero        = true;
		k.isDispHatena    = true;
		k.isInputHatena   = true;
		k.isAnsNumber     = true;
		k.NumberWithMB    = true;
		k.linkNumber      = true;

		base.setTitle("ヴィウ","View");
		base.setFloatbgcolor("rgb(64, 64, 64)");
	},
	menufix : function(){ },

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){ this.inputqnum();};
		mv.mouseup = function(){ };
		mv.mousemove = function(){ };

		// キーボード入力系
		kc.keyinput = function(ca){
			if(this.moveTCell(ca)){ return;}
			this.key_view(ca);
		};
		kc.key_view = function(ca){
			if(k.playmode){
				var cc=tc.getTCC();
				if     (ca==='q'||ca==='a'||ca==='z')          { ca='s1';}
				else if(ca==='w'||ca==='s'||ca==='x')          { ca='s2';}
				else if(ca==='e'||ca==='d'||ca==='c'||ca==='-'){ ca=' '; }
				else if(ca==='1' && bd.AnC(cc)===1)            { ca='s1';}
				else if(ca==='2' && bd.AnC(cc)===2)            { ca='s2';}
			}
			this.key_inputqnum(ca);
		};

		kp.kpgenerate = function(mode){
			if(mode==3){
				this.tdcolor = pc.mbcolor;
				this.inputcol('num','knumq','q','○');
				this.inputcol('num','knumw','w','×');
				this.tdcolor = "black";
				this.inputcol('empty','','','');
				this.inputcol('empty','','','');
				this.insertrow();
			}
			this.inputcol('num','knum0','0','0');
			this.inputcol('num','knum1','1','1');
			this.inputcol('num','knum2','2','2');
			this.inputcol('num','knum3','3','3');
			this.insertrow();
			this.inputcol('num','knum4','4','4');
			this.inputcol('num','knum5','5','5');
			this.inputcol('num','knum6','6','6');
			this.inputcol('num','knum7','7','7');
			this.insertrow();
			this.inputcol('num','knum8','8','8');
			this.inputcol('num','knum9','9','9');
			this.inputcol('num','knum_',' ',' ');
			((mode==1)?this.inputcol('num','knum.','-','?'):this.inputcol('empty','','',''));
			this.insertrow();
		};
		kp.generate(kp.ORIGINAL, true, true);
		kp.kpinput = function(ca){
			if(kc.key_view(ca)){ return;}
			kc.key_inputqnum(ca);
		};

		bd.nummaxfunc = function(cc){ return Math.min(k.qcols+k.qrows-2,bd.maxnum);};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.errbcolor2 = "rgb(255, 255, 127)";
		pc.setBGCellColorFunc('error2');

		pc.paint = function(){
			this.drawBGCells();
			this.drawGrid();

			this.drawMBs();
			this.drawNumbers();

			this.drawChassis();

			this.drawCursor();
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
			this.decodeCellAnumsub();
		};
		fio.encodeData = function(){
			this.encodeCellQnum();
			this.encodeCellAnumsub();
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			if( !this.checkSideCell(bd.sameNumber) ){
				this.setAlert('同じ数字がタテヨコに連続しています。','Same numbers are adjacent.'); return false;
			}

			if( !this.checkCellNumber() ){
				this.setAlert('数字と、他のマスにたどり着くまでのマスの数の合計が一致していません。','Sum of four-way gaps to another number is not equal to the number.'); return false;
			}

			if( !this.checkOneArea( area.getNumberInfo() ) ){
				this.setAlert('タテヨコにつながっていない数字があります。','Numbers are devided.'); return false;
			}

			if( !this.checkAllCell(function(c){ return (bd.QsC(c)===1);}) ){
				this.setAlert('数字の入っていないマスがあります。','There is a cell that is not filled in number.'); return false;
			}

			return true;
		};

		ans.checkCellNumber = function(){
			var result = true;
			for(var c=0;c<bd.cellmax;c++){
				if(!bd.isValidNum(c)){ continue;}

				var clist = this.searchNumber(bd.cell[c].bx,bd.cell[c].by);
				if(bd.getNum(c)!==clist.length){
					if(this.inAutoCheck){ return false;}
					bd.sErC([c],1);
					bd.sErC(clist,2);
					result = false;
				}
			}
			return result;
		};
		ans.searchNumber = function(sx,sy){
			var clist = [];
			for(var dir=1;dir<=4;dir++){
				var cc, bx=sx, by=sy;
				while(1){
					switch(dir){ case 1: by-=2; break; case 2: by+=2; break; case 3: bx-=2; break; case 4: bx+=2; break;}
					cc = bd.cnum(bx,by);
					if(cc!==null && bd.noNum(cc) && bd.cell[cc].qsub!==1){ clist.push(cc);}
					else{ break;}
				}
			}
			return clist;
		};
	}
};
