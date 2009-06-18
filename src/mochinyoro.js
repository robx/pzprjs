//
// パズル固有スクリプト部 モチにょろ版 mochinyoro.js v3.1.9p2
//

function setting(){
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
}

//-------------------------------------------------------------
// Puzzle個別クラスの定義
Puzzle = function(){
	this.prefix();
};
Puzzle.prototype = {
	prefix : function(){
		this.input_init();
		this.graphic_init();

		base.setTitle("モチにょろ","Mochinyoro");
		base.setExpression("　左クリックで黒マスが、右クリックで白マス確定マスが入力できます。",
						   " Left Click to input black cells, Right Click to input determined white cells.");
		base.setFloatbgcolor("rgb(127, 127, 127)");
	},
	menufix : function(){
		menu.addUseToFlags();
	},
	postfix : function(){ },

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
	pzlinput : function(type, bstr){
		if(type==0 || type==1){ bstr = enc.decodeNumber16(bstr);}
	},
	pzloutput : function(type){
		if(type==0)     { document.urloutput.ta.value = enc.getURLbase()+"?"+k.puzzleid+this.pzldata();}
		else if(type==1){ document.urloutput.ta.value = enc.getDocbase()+k.puzzleid+"/sa/m.html?c"+this.pzldata();}
		else if(type==3){ document.urloutput.ta.value = enc.getURLbase()+"?m+"+k.puzzleid+this.pzldata();}
	},
	pzldata : function(){
		return "/"+k.qcols+"/"+k.qrows+"/"+enc.encodeNumber16();
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	check : function(){

		if( !ans.check2x2Block( function(id){ return (bd.getQansCell(id)==1);} ) ){
			ans.setAlert('2x2の黒マスのかたまりがあります。','There is a block of 2x2 black cells.'); return false;
		}

		if( !this.checkWareaSequent() ){
			ans.setAlert('孤立した白マスのブロックがあります。','White cells are devided.'); return false;
		}

		var warea = ans.searchWarea();
		if( !ans.isAreaRect(warea, function(id){ return (bd.getQansCell(id)!=1);}) ){
			ans.setAlert('四角形でない白マスのブロックがあります。','There is a block of white cells that is not rectangle.'); return false;
		}

		if( !ans.checkQnumsInArea(warea, function(a){ return (a>=2);}) ){
			ans.setAlert('1つのブロックに2つ以上の数字が入っています。','A block has plural numbers.'); return false;
		}

		if( !ans.checkNumberAndSize(warea) ){
			ans.setAlert('数字とブロックの面積が違います。','A size of tha block and the number written in the block is differrent.'); return false;
		}

		var barea = ans.searchBarea();
		if( !ans.checkAllArea(barea, function(id){ return (bd.getQansCell(id)==1);}, function(w,h,a){ return (w*h!=a);} ) ){
			ans.setAlert('四角形になっている黒マスのブロックがあります。','There is a block of black cells that is rectangle.'); return false;
		}

		return true;
	},

	checkWareaSequent : function(){
		var func = function(id){ return (id!=-1 && bd.getQansCell(id)!=1); };
		var area = new AreaInfo();
		for(var c=0;c<bd.cell.length;c++){ area.check[c]=(func(c)?0:-1);}
		for(var c=0;c<bd.cell.length;c++){ if(area.check[c]==0){ area.max++; area.room[area.max]=new Array(); this.sc0(func, area, c, area.max);} }
		return ans.linkBWarea(area);
	},
	sc0 : function(func, area, i, areaid){
		if(i==-1 || area.check[i]!=0){ return;}
		area.check[i] = areaid;
		area.room[areaid].push(i);
		if( func(bd.cell[i].up()) ){ arguments.callee(func, area, bd.cell[i].up(), areaid);}
		if( func(bd.cell[i].dn()) ){ arguments.callee(func, area, bd.cell[i].dn(), areaid);}
		if( func(bd.cell[i].lt()) ){ arguments.callee(func, area, bd.cell[i].lt(), areaid);}
		if( func(bd.cell[i].rt()) ){ arguments.callee(func, area, bd.cell[i].rt(), areaid);}

		if(bd.cell[i].cx>0){
			if( func(bd.cell[bd.cell[i].lt()].up()) ){ arguments.callee(func, area, bd.cell[bd.cell[i].lt()].up(), areaid);}
			if( func(bd.cell[bd.cell[i].lt()].dn()) ){ arguments.callee(func, area, bd.cell[bd.cell[i].lt()].dn(), areaid);}
		}
		if(bd.cell[i].cx<k.qcols-1){
			if( func(bd.cell[bd.cell[i].rt()].up()) ){ arguments.callee(func, area, bd.cell[bd.cell[i].rt()].up(), areaid);}
			if( func(bd.cell[bd.cell[i].rt()].dn()) ){ arguments.callee(func, area, bd.cell[bd.cell[i].rt()].dn(), areaid);}
		}

		return;
	}

};
