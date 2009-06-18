//
// パズル固有スクリプト部 バーンズ版 barns.js v3.1.9p2
//

function setting(){
	// グローバル変数の初期設定
	if(!k.qcols){ k.qcols = 8;}	// 盤面の横幅
	if(!k.qrows){ k.qrows = 8;}	// 盤面の縦幅
	k.irowake = 1;			// 0:色分け設定無し 1:色分けしない 2:色分けする

	k.iscross      = 0;		// 1:Crossが操作可能なパズル
	k.isborder     = 1;		// 1:Border/Lineが操作可能なパズル
	k.isextendcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

	k.isoutsidecross  = 0;	// 1:外枠上にCrossの配置があるパズル
	k.isoutsideborder = 0;	// 1:盤面の外枠上にborderのIDを用意する
	k.isborderCross   = 1;	// 1:線が交差するパズル
	k.isCenterLine    = 1;	// 1:マスの真ん中を通る線を回答として入力するパズル
	k.isborderAsLine  = 0;	// 1:境界線をlineとして扱う

	k.dispzero      = 0;	// 1:0を表示するかどうか

	k.isDispHatena  = 1;	// 1:qnumが-2のときに？を表示する
	k.isAnsNumber   = 0;	// 1:回答に数字を入力するパズル
	k.isArrowNumber = 0;	// 1:矢印つき数字を入力するパズル
	k.isOneNumber   = 0;	// 1:部屋の問題の数字が1つだけ入るパズル
	k.isDispNumUL   = 0;	// 1:数字をマス目の左上に表示するパズル(0はマスの中央)
	k.NumberWithMB  = 0;	// 1:回答の数字と○×が入るパズル

	k.BlackCell     = 0;	// 1:黒マスを入力するパズル
	k.NumberIsWhite = 0;	// 1:数字のあるマスが黒マスにならないパズル
	k.RBBlackCell   = 0;	// 1:連黒分断禁のパズル

	k.ispzprv3ONLY  = 0;	// 1:ぱずぷれv3にしかないパズル
	k.isKanpenExist = 0;	// 1:pencilbox/カンペンにあるパズル

	k.fstruct = ["others", "borderques", "borderline"];

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

		if(k.callmode=="pplay"){
			base.setExpression("　左ドラッグで線が、右クリックで×が入力できます。",
							   " Left Button Drag to input black cells, Right Click to input a cross.");
		}
		else{
			base.setExpression("　左ドラッグで境界線が、右クリックで氷が入力できます。",
							   " Left Button Drag to input border lines, Right Click to input ice.");
		}
		base.setTitle("バーンズ","Barns");
		base.setFloatbgcolor("rgb(0, 0, 191)");

		col.maxYdeg = 0.70;
	},
	menufix : function(){
		menu.addRedLineToFlags();
	},
	postfix : function(){ },

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(x,y){
			if(kc.isZ ^ menu.getVal('dispred')){ this.dispRedLine(x,y); return;}
			if(k.mode==1){
				if(this.btn.Left) this.inputborder(x,y);
				else if(this.btn.Right) this.inputIcebarn(x,y);
			}
			else if(k.mode==3){
				if(this.btn.Left) this.inputLine(x,y);
				else if(this.btn.Right) this.inputpeke(x,y);
			}
		};
		mv.mouseup = function(x,y){ };
		mv.mousemove = function(x,y){
			if(kc.isZ ^ menu.getVal('dispred')){ this.dispRedLine(x,y); return;}
			if(k.mode==1){
				if(this.btn.Left) this.inputborder(x,y);
				else if(this.btn.Right) this.inputIcebarn(x,y);
			}
			else if(k.mode==3){
				if(this.btn.Left) this.inputLine(x,y);
				else if(this.btn.Right) this.inputpeke(x,y);
			}
		};
		mv.inputIcebarn = function(x,y){
			var cc = this.cellid(new Pos(x,y));
			if(cc==-1 || cc==this.mouseCell){ return;}
			if(this.inputData==-1){ this.inputData = (bd.getQuesCell(cc)==6?0:6);}

			bd.setQuesCell(cc, this.inputData);
			pc.paint(bd.cell[cc].cx, bd.cell[cc].cy, bd.cell[cc].cx, bd.cell[cc].cy);
		},

		// キーボード入力系
		kc.keyinput = function(ca){ if(ca=='z' && !this.keyPressed){ this.isZ=true;}};
		kc.keyup = function(ca){ if(ca=='z'){ this.isZ=false;}};
		kc.isZ = false;
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.BDlinecolor = "rgb(127, 127, 127)";
		pc.linecolor = "rgb(0, 192, 0)";
		pc.errcolor1 = "rgb(192, 0, 0)";

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);
		//	this.flushCanvasAll();

			this.drawErrorCells(x1,y1,x2,y2);

			this.drawIcebarns(x1,y1,x2,y2);

			this.drawBDline2(x1,y1,x2,y2);

			this.drawBorders(x1,y1,x2,y2);

			this.drawLines(x1,y1,x2,y2);

			if(k.br.IE){ this.drawPekes(x1,y1,x2,y2,1);}
			else{ this.drawPekes(x1,y1,x2,y2,0);}

			this.drawChassis(x1,y1,x2,y2);
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	pzlinput : function(type, bstr){
		if(type==0 || type==1){
			bstr = this.decodeBarns(bstr);
			bstr = enc.decodeBorder(bstr);
		}
	},
	pzloutput : function(type){
		if(type==0)     { document.urloutput.ta.value = enc.getURLbase()+"?"+k.puzzleid+this.pzldata();}
		else if(type==1){ document.urloutput.ta.value = enc.getDocbase()+k.puzzleid+"/sa/q.html?"+this.pzldata();}
		else if(type==3){ document.urloutput.ta.value = enc.getURLbase()+"?m+"+k.puzzleid+this.pzldata();}
	},
	pzldata  : function(){ return "/"+k.qcols+"/"+k.qrows+"/"+this.encodeBarns()+enc.encodeBorder();},

	//---------------------------------------------------------
	decodeBarns : function(bstr){
		var i, ca, c;
		c = 0;
		for(i=0;i<bstr.length;i++){
			ca = parseInt(bstr.charAt(i),32);
			for(w=0;w<5;w++){ if((i*5+w)<bd.cell.length){ bd.setQuesCell(i*5+w,(ca&Math.pow(2,4-w)?6:0));} }
			if((i*5+5)>=bd.cell.length){ break;}
		}
		return bstr.substring(i+1,bstr.length);
	},
	encodeBarns : function(){
		var cm = "";
		var num = 0; var pass = 0;
		for(i=0;i<bd.cell.length;i++){
			if(bd.getQuesCell(i)==6){ pass+=Math.pow(2,4-num);}
			num++; if(num==5){ cm += pass.toString(32); num=0; pass=0;}
		}
		if(num>0){ cm += pass.toString(32);}

		return cm;
	},

	//---------------------------------------------------------
	decodeOthers : function(array){
		if(array.length<k.qrows){ return false;}
		fio.decodeCell( function(c,ca){ if(ca=="1"){ bd.setQuesCell(c, 6);} },array);
		return true;
	},
	encodeOthers : function(){
		return fio.encodeCell( function(c){ return ""+(bd.getQuesCell(c)==6?"1":".")+" "; });
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	check : function(){

		if( !ans.checkLcntCell(3) ){
			ans.setAlert('分岐している線があります。','There is a branch line.'); return false;
		}

		if( !this.checkLineCross() ){
			ans.setAlert('氷の部分以外で線が交差しています。', 'A Line is crossed outside of ice.'); return false;
		}
		if( !this.checkLineCurve() ){
			ans.setAlert('氷の部分で線が曲がっています。', 'A Line curve on ice.'); return false;
		}

		if( !ans.checkOneLoop() ){
			ans.setAlert('輪っかが一つではありません。','There are two or more loops.'); return false;
		}

		if( !ans.checkLcntCell(0) ){
			ans.setAlert('線が引かれていないマスがあります。','There is a line-less cell.'); return false;
		}

		if( !ans.checkLcntCell(1) ){
			ans.setAlert('途中で途切れている線があります。', 'There is a dead-end line.'); return false;
		}

		return true;
	},

	checkLineCross : function(){
		for(var c=0;c<bd.cell.length;c++){
			if(ans.lcntCell(c)==4 && bd.getQuesCell(c)!=6 && bd.getQuesCell(c)!=101){
				bd.setErrorCell([c],1);
				return false;
			}
		}
		return true;
	},
	checkLineCurve : function(){
		for(var c=0;c<bd.cell.length;c++){
			if(ans.lcntCell(c)==2 && bd.getQuesCell(c)==6 && !ans.isLineStraight(c)){
				bd.setErrorCell([c],1);
				return false;
			}
		}
		return true;
	}
};
