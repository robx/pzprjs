//
// パズル固有スクリプト部 ぬりぼう版 nuribou.js v3.2.0
//
Puzzles.nuribou = function(){ };
Puzzles.nuribou.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}	// 盤面の横幅
		if(!k.qrows){ k.qrows = 10;}	// 盤面の縦幅
		k.irowake = 0;			// 0:色分け設定無し 1:色分けしない 2:色分けする

		k.iscross      = 0;		// 1:Crossが操作可能なパズル
		k.isborder     = 0;		// 1:Border/Lineが操作可能なパズル
		k.isextendcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

		k.isoutsidecross  = 0;	// 1:外枠上にCrossの配置があるパズル
		k.isoutsideborder = 0;	// 1:盤面の外枠上にborderのIDを用意する
		k.isborderCross   = 0;	// 1:線が交差するパズル
		k.isCenterLine    = 0;	// 1:マスの真ん中を通る線を回答として入力するパズル
		k.isborderAsLine  = 0;	// 1:境界線をlineとして扱う

		k.dispzero      = 0;	// 1:0を表示するかどうか
		k.isDispHatena  = 1;	// 1:qnumが-2のときに？を表示する
		k.isAnsNumber   = 0;	// 1:回答に数字を入力するパズル
		k.isArrowNumber = 0;	// 1:矢印つき数字を入力するパズル
		k.isOneNumber   = 0;	// 1:部屋の問題の数字が1つだけ入るパズル
		k.isDispNumUL   = 0;	// 1:数字をマス目の左上に表示するパズル(0はマスの中央)
		k.NumberWithMB  = 0;	// 1:回答の数字と○×が入るパズル

		k.BlackCell     = 1;	// 1:黒マスを入力するパズル
		k.NumberIsWhite = 1;	// 1:数字のあるマスが黒マスにならないパズル
		k.RBBlackCell   = 0;	// 1:連黒分断禁のパズル

		k.ispzprv3ONLY  = 0;	// 1:ぱずぷれv3にしかないパズル
		k.isKanpenExist = 0;	// 1:pencilbox/カンペンにあるパズル

		k.fstruct = ["cellqnum","cellans"];

		//k.def_csize = 36;
		//k.def_psize = 24;

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
		mv.mousedown = function(x,y){
			if(k.mode==1){
				if(!kp.enabled()){ this.inputqnum(x,y,99);}
				else{ kp.display(x,y);}
			}
			else if(k.mode==3) this.inputcell(x,y);
		};
		mv.mouseup = function(x,y){ };
		mv.mousemove = function(x,y){
			if(k.mode==3) this.inputcell(x,y);
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(k.mode==3){ return;}
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum(ca,99);
		};

		if(k.callmode == "pmake"){
			kp.generate(0, true, false, '');
			kp.kpinput = function(ca){
				kc.key_inputqnum(ca,99);
			};
		}
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.bcolor = "rgb(127, 255, 127)";
		pc.errcolor1 = "rgb(192, 0, 0)";

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);

			this.drawWhiteCells(x1,y1,x2,y2);
			this.drawBDline(x1,y1,x2,y2);
			this.drawBlackCells(x1,y1,x2,y2);

			this.drawNumbers(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);

			if(k.mode==1){ this.drawTCell(x1,y1,x2+1,y2+1);}else{ this.hideTCell();}
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type, bstr){
			if(type==0 || type==1){ bstr = this.decodeNumber16(bstr);}
		};
		enc.pzlexport = function(type){
			if(type==0)     { document.urloutput.ta.value = this.getURLbase()+"?"+k.puzzleid+this.pzldata();}
			else if(type==1){ document.urloutput.ta.value = this.getDocbase()+k.puzzleid+"/sa/m.html?c"+this.pzldata();}
			else if(type==3){ document.urloutput.ta.value = this.getURLbase()+"?m+"+k.puzzleid+this.pzldata();}
		};
		enc.pzldata = function(){
			return "/"+k.qcols+"/"+k.qrows+"/"+this.encodeNumber16();
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			var barea = this.searchBarea();
			if( !this.checkAllArea(barea, function(id){ return (bd.QaC(id)==1);}, function(w,h,a){ return (w==1 || h==1);} ) ){
				this.setAlert('「幅１マス、長さ１マス以上」ではない黒マスのカタマリがあります。','There is a mass of black cells, whose width is more than two.'); return false;
			}

			if( !this.checkCorners(barea) ){
				this.setAlert('同じ面積の黒マスのカタマリが、角を共有しています。','Masses of black cells whose length is the same share a corner.'); return false;
			}

			var warea = this.searchWarea();
			if( !this.checkQnumsInArea(warea, function(a){ return (a==0);}) ){
				this.setAlert('数字の入っていないシマがあります。','An area of white cells has no numbers.'); return false;
			}

			if( !this.checkQnumsInArea(warea, function(a){ return (a>=2);}) ){
				this.setAlert('1つのシマに2つ以上の数字が入っています。','An area of white cells has plural numbers.'); return false;
			}

			if( !this.checkNumberAndSize(warea) ){
				this.setAlert('数字とシマの面積が違います。','The number is not equal to the number of the size of the area.'); return false;
			}

			return true;
		};

		ans.checkCorners = function(area){
			var cc1, cc2;
			for(var c=0;c<bd.cell.length;c++){
				if(bd.cell[c].cx==k.qcols-1 || bd.cell[c].cy==k.qrows-1){ continue;}
				var cc1, cc2;
				if     ( bd.QaC(c)==1 && bd.QaC(c+k.qcols+1)==1 ){ cc1 = c; cc2 = c+k.qcols+1;}
				else if( bd.QaC(c+1)==1 && bd.QaC(c+k.qcols)==1 ){ cc1 = c+1; cc2 = c+k.qcols;}
				else{ continue;}
				if(this.getCntOfRoom(area, area.check[cc1]) == this.getCntOfRoom(area, area.check[cc2])){
					bd.sErC(area.room[area.check[cc1]],1);
					bd.sErC(area.room[area.check[cc2]],1);
					return false;
				}
			}
			return true;
		};
	}
};
