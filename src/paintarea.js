//
// パズル固有スクリプト部 ペイントエリア版 paintarea.js v3.2.0
//
Puzzles.paintarea = function(){ };
Puzzles.paintarea.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}	// 盤面の横幅
		if(!k.qrows){ k.qrows = 10;}	// 盤面の縦幅
		k.irowake = 0;			// 0:色分け設定無し 1:色分けしない 2:色分けする

		k.iscross      = 0;		// 1:Crossが操作可能なパズル
		k.isborder     = 1;		// 1:Border/Lineが操作可能なパズル
		k.isextendcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

		k.isoutsidecross  = 0;	// 1:外枠上にCrossの配置があるパズル
		k.isoutsideborder = 0;	// 1:盤面の外枠上にborderのIDを用意する
		k.isborderCross   = 0;	// 1:線が交差するパズル
		k.isCenterLine    = 0;	// 1:マスの真ん中を通る線を回答として入力するパズル
		k.isborderAsLine  = 0;	// 1:境界線をlineとして扱う

		k.dispzero      = 1;	// 1:0を表示するかどうか
		k.isDispHatena  = 1;	// 1:qnumが-2のときに？を表示する
		k.isAnsNumber   = 0;	// 1:回答に数字を入力するパズル
		k.isArrowNumber = 0;	// 1:矢印つき数字を入力するパズル
		k.isOneNumber   = 0;	// 1:部屋の問題の数字が1つだけ入るパズル
		k.isDispNumUL   = 0;	// 1:数字をマス目の左上に表示するパズル(0はマスの中央)
		k.NumberWithMB  = 0;	// 1:回答の数字と○×が入るパズル

		k.BlackCell     = 1;	// 1:黒マスを入力するパズル
		k.NumberIsWhite = 0;	// 1:数字のあるマスが黒マスにならないパズル
		k.RBBlackCell   = 0;	// 1:連黒分断禁のパズル

		k.ispzprv3ONLY  = 0;	// 1:ぱずぷれv3にしかないパズル
		k.isKanpenExist = 0;	// 1:pencilbox/カンペンにあるパズル

		k.fstruct = ["arearoom","cellqnum","cellans"];

		//k.def_csize = 36;
		//k.def_psize = 24;

		base.setTitle("ペイントエリア","Paintarea");
		base.setExpression("　左クリックで黒タイルが、右クリックで白タイル確定タイルが入力できます。",
						   " Left Click to input black tile, Right Click to determined white tile.");
		base.setFloatbgcolor("rgb(127, 160, 96)");
	},
	menufix : function(){
		menu.addUseToFlags();
		menu.addRedBlockToFlags();
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(x,y){
			if(kc.isZ ^ menu.getVal('dispred')){ this.dispRedLine(x,y); return;}
			if(k.mode==1) this.inputborder(x,y);
			else if(k.mode==3) this.inputtile(x,y);
		};
		mv.mouseup = function(x,y){
			if(this.notInputted()){
				if(k.mode==1){
					if(!kp.enabled()){ this.inputqnum(x,y,4);}
					else{ kp.display(x,y);}
				}
			}
		};
		mv.mousemove = function(x,y){
			if(k.mode==1) this.inputborder(x,y);
			else if(k.mode==3) this.inputtile(x,y);
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(ca=='z' && !this.keyPressed){ this.isZ=true; return;}
			if(k.mode==3){ return;}
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum(ca,4);
		};
		kc.keyup = function(ca){ if(ca=='z'){ this.isZ=false;}};
		kc.isZ = false;

		if(k.callmode == "pmake"){
			kp.generate(1, true, false, '');
			kp.kpinput = function(ca){
				kc.key_inputqnum(ca,4);
			};
		}
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.bcolor = "rgb(160, 255, 160)";
		pc.BBcolor = "rgb(127, 127, 127)";

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);

			this.drawWhiteCells(x1,y1,x2,y2);
			this.drawBDline(x1,y1,x2,y2);
			this.drawBlackCells(x1,y1,x2,y2);

			this.drawNumbers(x1,y1,x2,y2);

			this.drawBorders(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);

			this.drawBoxBorders(x1-1,y1-1,x2+1,y2+1,0);

			if(k.mode==1){ this.drawTCell(x1,y1,x2+1,y2+1);}else{ this.hideTCell();}
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type, bstr){
			if(type==0 || type==1){
				bstr = this.decodeBorder(bstr);
				bstr = this.decodeNumber10(bstr);
			}
		};
		enc.pzlexport = function(type){
			if(type==0)     { document.urloutput.ta.value = this.getURLbase()+"?"+k.puzzleid+this.pzldata();}
			else if(type==1){ document.urloutput.ta.value = this.getDocbase()+k.puzzleid+"/sa/m.html?c"+this.pzldata();}
			else if(type==3){ document.urloutput.ta.value = this.getURLbase()+"?m+"+k.puzzleid+this.pzldata();}
		};
		enc.pzldata = function(){
			return "/"+k.qcols+"/"+k.qrows+"/"+this.encodeBorder()+this.encodeNumber10();
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			if( k.callmode=="pmake" && !this.checkSameObjectInRoom(this.searchRarea(), function(c){ return (bd.QaC(c)==1?1:2);}) ){
				this.setAlert('白マスと黒マスの混在したタイルがあります。','A tile includes both balck and white cells.'); return false;
			}

			var barea = this.searchBarea();
			if( !this.linkBWarea(barea) ){
				this.setAlert('黒マスがひとつながりになっていません。','Black cells are devided.'); return false;
			}

			if( !this.check2x2Block( function(id){ return (bd.QaC(id)==1);} ) ){
				this.setAlert('2x2の黒マスのかたまりがあります。','There is a 2x2 block of black cells.'); return false;
			}

			if( !this.checkdir4BCell(function(cn,bcnt){ return !(cn>=0 && cn!=bcnt);}) ){
				this.setAlert('数字の上下左右にある黒マスの数が間違っています。','The number is not equal to the number of black cells in four adjacent cells.'); return false;
			}

			if( !this.check2x2Block( function(id){ return (bd.QaC(id)!=1);} ) ){
				this.setAlert('2x2の白マスのかたまりがあります。','There is a 2x2 block of white cells.'); return false;
			}

			return true;
		};

		ans.checkdir4BCell = function(func){
			for(var c=0;c<bd.cell.length;c++){
				if(bd.QnC(c)>=0 && !func(bd.QnC(c), this.checkdir4Cell(c,function(a){ return (bd.QaC(a)==1);}))){
					bd.sErC([c],1);
					return false;
				}
			}
			return true;
		};
	}
};
