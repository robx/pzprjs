//
// パズル固有スクリプト部 スリザーリンク版 slither.js v3.1.0
//

function setting(){
	// グローバル変数の初期設定
	if(!k.qcols){ k.qcols = 10;}	// 盤面の横幅
	if(!k.qrows){ k.qrows = 10;}	// 盤面の縦幅
	k.outside = 0;			// 1:盤面の外側にIDを用意する
	k.dispzero = 1;			// 1:0を表示するかどうか
	k.irowake = 1;			// 0:色分け設定無し 1:色分けしない 2:色分けする

	k.iscross = 0;			// 1:Crossが操作可能なパズル
	k.isborder = 1;			// 1:Border/Lineが操作可能なパズル
	k.isoutsidecross = 0;	// 1:外枠上にCrossの配置があるパズル
	k.isborderCross = 0;	// 1:線が交差するパズル
	k.isborderAsLine = 1;	// 1:境界線をlineとして扱う

	k.isDispHatena = 1;		// 1:qnumが-2のときに？を表示する
	k.isAnsNumber = 0;		// 1:回答に数字を入力するパズル
	k.isOneNumber = 0;		// 1:部屋の問題の数字が1つだけ入るパズル
	k.isDispNumUL = 0;		// 1:数字をマス目の左上に表示するパズル(0はマスの中央)
	k.NumberWithMB = 0,		// 1:回答の数字と○×が入るパズル

	k.BlackCell = 0;		// 1:黒マスを入力するパズル
	k.NumberIsWhite = 0;	// 1:数字のあるマスが黒マスにならないパズル
	k.RBBlackCell = 0,		// 1:連黒分断禁のパズル

	k.ispzprv3ONLY  = 1,	// 1:ぱずぷれv3にしかないパズル
	k.isKanpenExist = 1,	// 1:pencilbox/カンペンにあるパズル

	k.fstruct = ["cellqnum","borderans2"];

	//k.def_csize = 36;
	//k.def_psize = 24;
}

//-------------------------------------------------------------
// Puzzle個別クラスの定義
Puzzle = Class.create();
Puzzle.prototype = {
	initialize : function(){
		this.input_init();
		this.graphic_init();

		$("expression").innerHTML = "　左ドラッグで線が、右クリックでセルの背景色(緑/黄色)が入力できます。";
	},

	//---------------------------------------------------------
	// htmlなどの表示設定を行う
	gettitle : function(){
		return "スリザーリンク";
	},
	smenubgcolor : function(){
		return "rgb(32, 32, 32)";
	},

	//---------------------------------------------------------
	// "操作方法"関連関数群
//	useclick : function(e){
//		if(Event.element(e).id=="use1"){ use = 1;}
//		else if(Event.element(e).id=="use2"){ use = 2;}
//		this.usedisp();
//	},
	usearea : function(){
//		$("usepanel").innerHTML = "操作方法 |&nbsp;";
//		new Insertion.Bottom("usepanel", "<div class=\"flag\" id=\"use1\">左右ボタン</div>&nbsp;");
//		new Insertion.Bottom("usepanel", "<div class=\"flag\" id=\"use2\">1ボタン</div>&nbsp;");
//		//new Insertion.Bottom("usepanel", "<a href=\"use.html\" target=_blank>操作方法の説明</a>");
//
//		Event.observe($("use1"), 'click', this.useclick.bindAsEventListener(this), false);
//		Event.observe($("use2"), 'click', this.useclick.bindAsEventListener(this), false);
//		unselectable($("use1"));
//		unselectable($("use2"));
//
//		this.usedisp();
	},
//	usedisp : function(){
//		if(use==1)		{ $("use1").className = "flagsel"; $("use2").className = "flag";}
//		else if(use==2)	{ $("use1").className = "flag"; $("use2").className = "flagsel";}
//	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(x,y){
			if(k.mode==1){
				this.inputqnum(x,y,3);
			}
			else if(k.mode==3){
				if(this.btn.Left) this.inputborderans(x,y);
				else if(this.btn.Right) this.inputpeke(x,y);
			}
		};
		mv.mouseup = function(x,y){ };
		mv.mousemove = function(x,y){
			if(k.mode==3){
				if(this.btn.Left) this.inputborderans(x,y);
				else if(this.btn.Right) this.inputpeke(x,y);
			}
		};
		mv.inputBGcolor = function(x,y){
			var cc = this.cellid(new Pos(x,y));
			if(cc==-1 || cc==this.mouseCell){ return;}
			if(this.inputData==-1){
				if     (bd.getQsubCell(cc)==0){ this.inputData=1;}
				else if(bd.getQsubCell(cc)==1){ this.inputData=2;}
				else                          { this.inputData=0;}
			}
			bd.setQsubCell(cc, this.inputData);

			this.mouseCell = cc; 

			pc.paint(bd.cell[cc].cx, bd.cell[cc].cy, bd.cell[cc].cx, bd.cell[cc].cy);
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(k.mode==3){ return;}
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum(ca,3);
		};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.BorderQanscolor = "rgb(0, 160, 0)";
		pc.fontErrcolor = "red";

		pc.crosssize = 0.05;

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);
		//	this.flushCanvasAll();

		//	this.drawBDline2(x1,y1,x2,y2);
			this.drawBorders(x1,y1,x2,y2);

			this.drawBaseMarks(x1,y1,x2,y2);

			this.drawNumbers(x1,y1,x2,y2);

			if(Prototype.Browser.IE){ this.drawPekes(x1,y1,x2,y2,1);}
			else{ this.drawPekes(x1,y1,x2,y2,0);}

			if(k.mode==1){ this.drawTCell(x1,y1,x2+1,y2+1);}
		};

		pc.drawBaseMarks = function(x1,y1,x2,y2){
			var i;
			for(i=0;i<(k.qcols+1)*(k.qrows+1);i++){
				var cx = i%(k.qcols+1); var cy = int(i/(k.qcols+1));

				if(cx < x1-1 || x2+1 < cx){ continue;}
				if(cy < y1-1 || y2+1 < cy){ continue;}

				this.drawBaseMark1(i);
			}

			this.vinc();
		};
		pc.drawBaseMark1 = function(i){
			var lw = (int(k.cwidth/12)>=3?int(k.cwidth/12):3); //LineWidth
			var csize = int((lw+1)/2);

			var cx = i%(k.qcols+1); var cy = int(i/(k.qcols+1));

			g.fillStyle = this.crossnumcolor;
			g.beginPath();
			g.arc(k.p0.x+cx*k.cwidth, k.p0.x+cy*k.cheight, csize, 0, Math.PI*2, false);
			if(this.vnop("x"+i+"_cm_",1)){ g.fill();}
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	pzlinput : function(type){
		if(enc.bbox){
			var bstr = enc.bbox;

			bd.ansclear();
			um.allerase();
			um.callby = 1;
			if(type==0||type==1){ bstr = enc.decode4(bstr, bd.setQnumCell.bind(bd), k.qcols*k.qrows);}
			else if(type==2)    { bstr = this.decodeKanpen(bstr); }
			um.callby = 0;

			base.resize_canvas();
		}
	},
	decodeKanpen : function(bstr){
		bstr = (bstr.split("_")).join(" ");
		fio.decodeCell( function(c,ca){
			if(ca != "."){ bd.setQnumCell(c, parseInt(ca));}
		},bstr.split("/"));
		return "";
	},

	pzloutput : function(type){
		if(type==0)     { document.urloutput.ta.value = enc.getURLbase()+"?"+k.puzzleid+this.pzldata();}
		else if(type==1){ document.urloutput.ta.value = enc.getDocbase()+k.puzzleid+"/sa/m.html?c"+this.pzldata();}
		else if(type==2){ document.urloutput.ta.value = enc.kanpenbase()+"slitherlink.html?problem="+this.pzldataKanpen();}
		else if(type==3){ document.urloutput.ta.value = enc.getURLbase()+"?m+"+k.puzzleid+this.pzldata();}
	},
	pzldata : function(){
		return "/"+k.qcols+"/"+k.qrows+"/"+enc.encode4(bd.getQnumCell.bind(bd), k.qcols*k.qrows);
	},
	pzldataKanpen : function(){
		return ""+k.qrows+"/"+k.qcols+"/"+fio.encodeCell( function(c){
			if     (bd.getQnumCell(c)>=0) { return (bd.getQnumCell(c).toString() + "_");}
			else                          { return "._";}
		});
	},

	//---------------------------------------------------------
	kanpenOpen : function(array){
		fio.decodeCellQnum(array.slice(0,k.qrows));
		var func = function(c,ca){ if(ca == "1"){ bd.setQansBorder(c, 1);} else if(ca == "-1"){ bd.setQsubBorder(c, 2);} }
		fio.decodeObj(func, stack.slice(k.qrows    ,2*k.qrows+1), k.qcols  , function(cx,cy){return bd.getbnum(2*cx+1,2*cy  );});
		fio.decodeObj(func, stack.slice(2*k.qrows+1,3*k.qrows+1), k.qcols+1, function(cx,cy){return bd.getbnum(2*cx  ,2*cy+1);});
	},
	kanpenSave : function(){
		var func = function(c,ca){ if(bd.getQansBorder(c)==1){ return "1 ";} else if(bd.getQsubBorder(c)==2){ return "-1 ";} else{ return "0 ";} }

		return ""+fio.encodeCell( function(c){ if(bd.getQnumCell(c)>=0) { return (bd.getQnumCell(c).toString() + " ");} else{ return ". ";} })
		+fio.encodeObj(func, k.qcols  , k.qrows+1, function(cx,cy){return bd.getbnum(2*cx+1,2*cy  );})
		+fio.encodeObj(func, k.qcols+1, k.qrows  , function(cx,cy){return bd.getbnum(2*cx  ,2*cy+1);});
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	check : function(){

		if( !ans.checkLcntCross(3,0) ){
			alert('分岐している線があります。'); pc.paintAll(); return false;
		}
		if( !ans.checkLcntCross(4,0) ){
			alert('線が交差しています。'); pc.paintAll(); return false;
		}

		if( !ans.checkdir4Border() ){
			alert('数字の周りにある境界線の本数が違います。'); pc.paintAll(); return false;
		}

		if( !ans.checkOneLoop() ){
			alert('輪っかが一つではありません。'); pc.paintAll(); return false;
		}

		if( !ans.checkLcntCross(1,0) ){
			alert('途中で途切れている線があります。'); pc.paintAll(); return false;
		}

		alert('正解です！');
		return true;
	}
};
