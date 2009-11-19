//
// パズル固有スクリプト部 ひとりにしてくれ版 hitori.js v3.2.3
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

		k.fstruct = ["cellqnum", "cellans"];

		//k.def_csize = 36;
		k.def_psize = 16;
		k.area = { bcell:0, wcell:1, number:0};	// areaオブジェクトで領域を生成する

		base.setTitle("ひとりにしてくれ","Hitori");
		base.setExpression("　左クリックで黒マスが、右クリックで白マス確定マスが入力できます。",
						   " Left Click to input black cells, Right Click to input determined white cells.");
		base.setFloatbgcolor("rgb(0, 224, 0)");
	},
	menufix : function(){
		menu.addUseToFlags();
		menu.addRedBlockRBToFlags();
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

		pc.paint = function(x1,y1,x2,y2){
			x2++; y2++;
			this.flushCanvas(x1,y1,x2,y2);
		//	this.flushCanvasAll();

			this.drawGrid(x1,y1,x2,y2);
			this.drawBWCells(x1,y1,x2,y2);

			this.drawNumbers(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);

			this.drawTarget(x1,y1,x2,y2);
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type, bstr){
			if(type==0 || type==1){ bstr = this.decodeHitori(bstr);}
			else if(type==2)      { bstr = this.decodeKanpen(bstr); }
		};

		enc.pzlexport = function(type){
			if(type==0)     { document.urloutput.ta.value = this.getURLbase()+"?"+k.puzzleid+this.pzldata();}
			else if(type==1){ document.urloutput.ta.value = this.getDocbase()+k.puzzleid+"/sa/m.html?c"+this.pzldata();}
			else if(type==2){ document.urloutput.ta.value = this.kanpenbase()+"hitori.html?problem="+this.pzldataKanpen();}
			else if(type==3){ document.urloutput.ta.value = this.getURLbase()+"?m+"+k.puzzleid+this.pzldata();}
		};
		enc.pzldata = function(){
			return "/"+k.qcols+"/"+k.qrows+"/"+this.encodeHitori();
		};

		enc.decodeHitori = function(bstr){
			var c=0, i=0;
			for(i=0;i<bstr.length;i++){
				var ca = bstr.charAt(i);

				if(this.include(ca,"0","9")||this.include(ca,"a","z")){ bd.sQnC(c, parseInt(bstr.substr(i,1),36)); c++;}
				else if(ca == '-'){ bd.sQnC(c, parseInt(bstr.substr(i+1,2),36)); c++; i+=2;}
				else if(ca == '%'){ bd.sQnC(c, -2);                                   c++;      }
				else{ c++;}

				if(c > bd.cellmax){ break;}
			}
			return bstr.substr(i);
		};
		enc.encodeHitori = function(bstr){
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

			return cm;
		};

		enc.decodeKanpen = function(bstr){
			bstr = (bstr.split("_")).join(" ");
			fio.decodeCell( function(c,ca){
				if(ca != "."){ bd.sQnC(c, parseInt(ca));}
			},bstr.split("/"));
			return "";
		};
		enc.pzldataKanpen = function(){
			return ""+k.qrows+"/"+k.qcols+"/"+fio.encodeCell( function(c){
				return (bd.QnC(c)>=0)?(bd.QnC(c).toString() + "_"):"._";
			});
		};

		//---------------------------------------------------------
		fio.kanpenOpen = function(array){
			fio.decodeCell( function(c,ca){
				if(ca != "0"){ bd.sQnC(c, parseInt(ca));}
			},array.slice(0,k.qrows));
			fio.decodeCellAns(array.slice(k.qrows,2*k.qrows));
		};
		fio.kanpenSave = function(){
			return ""+fio.encodeCell( function(c){
				return (bd.QnC(c)>0)?(bd.QnC(c).toString() + " "):"0 ";
			})+
			fio.encodeCellAns();
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

			if( !this.checkRowsCols() ){
				this.setAlert('同じ列に同じ数字が入っています。','There are same numbers in a row.'); return false;
			}

			return true;
		};
		ans.check1st = function(){ return true;};

		ans.checkRowsCols = function(){
			var cx, cy;

			for(var cy=0;cy<k.qrows;cy++){
				var clist = [];
				for(var cx=0;cx<k.qcols;cx++){ if(bd.isWhite(bd.cnum(cx,cy))){ clist.push(bd.cnum(cx,cy));}}
				if(!this.checkDifferentNumberInClist(clist)){ return false;}
			}
			for(var cx=1;cx<k.qcols;cx++){
				var clist = [];
				for(var cy=0;cy<k.qrows;cy++){ if(bd.isWhite(bd.cnum(cx,cy))){ clist.push(bd.cnum(cx,cy));}}
				if(!this.checkDifferentNumberInClist(clist)){ return false;}
			}
			return true;
		};
		ans.checkDifferentNumberInClist = function(clist){
			var d = [];
			for(var i=1;i<=Math.max(k.qcols,k.qrows);i++){ d[i]=-1;}
			for(var i=0;i<clist.length;i++){
				var val=bd.QnC(clist[i]);
				if     (val==-1){ continue;}
				else if(d[val]==-1){ d[val] = bd.QnC(clist[i]); continue;}

				for(var j=0;j<clist.length;j++){ if(bd.QnC(clist[j])==val){ bd.sErC([clist[j]],1);} }
				return false;
			}
			return true;
		};
	}
};
