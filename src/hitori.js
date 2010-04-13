//
// パズル固有スクリプト部 ひとりにしてくれ版 hitori.js v3.3.0
//
Puzzles.hitori = function(){ };
Puzzles.hitori.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 8;}	// 盤面の横幅
		if(!k.qrows){ k.qrows = 8;}	// 盤面の縦幅
		k.irowake = 0;			// 0:色分け設定無し 1:色分けしない 2:色分けする

		k.iscross      = 0;		// 1:Crossが操作可能なパズル
		k.isborder     = 0;		// 1:Border/Lineが操作可能なパズル
		k.isextendcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

		k.isoutsidecross  = 0;	// 1:外枠上にCrossの配置があるパズル
		k.isoutsideborder = 0;	// 1:盤面の外枠上にborderのIDを用意する
		k.isLineCross     = 0;	// 1:線が交差するパズル
		k.isCenterLine    = 0;	// 1:マスの真ん中を通る線を回答として入力するパズル
		k.isborderAsLine  = 0;	// 1:境界線をlineとして扱う

		k.dispzero      = 0;	// 1:0を表示するかどうか
		k.isDispHatena  = 0;	// 1:qnumが-2のときに？を表示する
		k.isAnsNumber   = 0;	// 1:回答に数字を入力するパズル
		k.isArrowNumber = 0;	// 1:矢印つき数字を入力するパズル
		k.isOneNumber   = 0;	// 1:部屋の問題の数字が1つだけ入るパズル
		k.isDispNumUL   = 0;	// 1:数字をマス目の左上に表示するパズル(0はマスの中央)
		k.NumberWithMB  = 0;	// 1:回答の数字と○×が入るパズル

		k.BlackCell     = 1;	// 1:黒マスを入力するパズル
		k.NumberIsWhite = 0;	// 1:数字のあるマスが黒マスにならないパズル
		k.RBBlackCell   = 1;	// 1:連黒分断禁のパズル

		k.ispzprv3ONLY  = 1;	// 1:ぱずぷれv3にしかないパズル
		k.isKanpenExist = 1;	// 1:pencilbox/カンペンにあるパズル

		//k.def_csize = 36;
		k.def_psize = 16;
		k.area = { bcell:0, wcell:1, number:0};	// areaオブジェクトで領域を生成する

		base.setTitle("ひとりにしてくれ","Hitori");
		base.setExpression("　左クリックで黒マスが、右クリックで白マス確定マスが入力できます。",
						   " Left Click to input black cells, Right Click to input determined white cells.");
		base.setFloatbgcolor("rgb(0, 224, 0)");

		enc.pidKanpen = 'hitori';
	},
	menufix : function(){
		menu.addUseToFlags();
		menu.addRedBlockRBToFlags();

		pp.addCheck('plred','setting',false, '重複数字を表示', 'Show overlapped number');
		pp.setLabel('plred', '重複している数字を赤くする', 'Show overlapped number as red.');
		pp.funcs['plred'] = function(){ pc.paintAll();};
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(kc.isZ ^ pp.getVal('dispred')){ this.dispRed();}
			else if(k.editmode) this.inputqnum();
			else if(k.playmode) this.inputcell();
		};
		mv.mouseup = function(){ };
		mv.mousemove = function(){
			if(k.playmode) this.inputcell();
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(ca=='z' && !this.keyPressed){ this.isZ=true; return;}
			if(k.playmode){ return;}
			if(this.key_inputdirec(ca)){ return;}
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum(ca);
		};
		kc.keyup = function(ca){ if(ca=='z'){ this.isZ=false;}};
		kc.isZ = false;

		bd.nummaxfunc = function(cc){ return Math.max(k.qcols,k.qrows);};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_LIGHT;
		pc.bcolor = pc.bcolor_GREEN;
		pc.BCell_fontcolor = "rgb(96,96,96)";
		pc.setBGCellColorFunc('qsub1');

		pc.paint = function(x1,y1,x2,y2){
			this.drawBGCells(x1,y1,x2,y2);
			this.drawGrid(x1,y1,x2,y2);
			this.drawBlackCells(x1,y1,x2,y2);

			this.drawNumbers_hitori(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);

			this.drawTarget(x1,y1,x2,y2);
		};

		pc.drawNumbers_hitori = function(x1,y1,x2,y2){
			this.vinc('cell_number', 'auto');

			if(!pp.getVal('plred') || ans.errDisp){
				var clist = this.cellinside(x1,y1,x2,y2);
				for(var i=0;i<clist.length;i++){ this.dispnumCell(clist[i]);}
			}
			else{
				ans.inCheck = true;
				ans.checkRowsCols(ans.isDifferentNumberInClist_hitori, bd.QnC);
				ans.inCheck = false;

				var clist = this.cellinside(bd.minbx, bd.minby, bd.maxbx, bd.maxby);
				for(var i=0;i<clist.length;i++){
					var c = clist[i], num = bd.getNum(c), obj = bd.cell[c], key='cell_'+c;;
					if(num!==-1){
						var text = (num>=0 ? num.toString() : "?");

						var color = this.fontcolor;
						if(bd.cell[c].qans===1){ color = this.BCell_fontcolor;}
						else if(bd.cell[c].error===1){ color = "red";}

						this.dispnum(key, 1, text, 0.8, color, obj.px, obj.py);
					}
					else{ this.hideEL(key);}
				}
				
				ans.errDisp = true;
				bd.errclear(false);
			}
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decodeHitori();
		};
		enc.pzlexport = function(type){
			this.encodeHitori();
		};

		enc.decodeHitori = function(){
			var c=0, i=0, bstr = this.outbstr;
			for(i=0;i<bstr.length;i++){
				var ca = bstr.charAt(i);

				if(this.include(ca,"0","9")||this.include(ca,"a","z")){ bd.sQnC(c, parseInt(bstr.substr(i,1),36)); c++;}
				else if(ca == '-'){ bd.sQnC(c, parseInt(bstr.substr(i+1,2),36)); c++; i+=2;}
				else if(ca == '%'){ bd.sQnC(c, -2);                              c++;      }
				else{ c++;}

				if(c > bd.cellmax){ break;}
			}
			this.outbstr = bstr.substr(i);
		};
		enc.encodeHitori = function(){
			var count=0, cm="";
			for(var i=0;i<bd.cellmax;i++){
				var pstr = "";
				var val = bd.QnC(i);

				if     (val==-2           ){ pstr = "%";}
				else if(val>= 0 && val< 16){ pstr =       val.toString(36);}
				else if(val>=16 && val<256){ pstr = "-" + val.toString(36);}
				else{ count++;}

				if(count==0){ cm += pstr;}
				else{ cm+="."; count=0;}
			}
			if(count>0){ cm+=".";}

			this.outbstr += cm;
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
			this.decodeCellAns();
		};
		fio.encodeData = function(){
			this.encodeCellQnum();
			this.encodeCellAns();
		};

		fio.kanpenOpen = function(){
			this.decodeCellQnum_kanpen();
			this.decodeCellAns();
		};
		fio.kanpenSave = function(){
			this.encodeCellQnum_kanpen();
			this.encodeCellAns();
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

			if( !this.checkRowsCols(this.isDifferentNumberInClist_hitori, bd.QnC) ){
				this.setAlert('同じ列に同じ数字が入っています。','There are same numbers in a row.'); return false;
			}

			return true;
		};
		ans.check1st = function(){ return true;};

		ans.isDifferentNumberInClist_hitori = function(clist_all, numfunc){
			var clist = [];
			for(var i=0;i<clist_all.length;i++){
				if(bd.isWhite(clist_all[i])){ clist.push(clist_all[i]);}
			}
			return this.isDifferentNumberInClist(clist, numfunc);
		};
	}
};
