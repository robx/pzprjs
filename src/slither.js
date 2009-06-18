//
// パズル固有スクリプト部 スリザーリンク版 slither.js v3.1.9p2
//

function setting(){
	// グローバル変数の初期設定
	if(!k.qcols){ k.qcols = 10;}	// 盤面の横幅
	if(!k.qrows){ k.qrows = 10;}	// 盤面の縦幅
	k.irowake = 1;			// 0:色分け設定無し 1:色分けしない 2:色分けする

	k.iscross      = 0;		// 1:Crossが操作可能なパズル
	k.isborder     = 1;		// 1:Border/Lineが操作可能なパズル
	k.isextendcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

	k.isoutsidecross  = 0;	// 1:外枠上にCrossの配置があるパズル
	k.isoutsideborder = 1;	// 1:盤面の外枠上にborderのIDを用意する
	k.isborderCross   = 0;	// 1:線が交差するパズル
	k.isCenterLine    = 0;	// 1:マスの真ん中を通る線を回答として入力するパズル
	k.isborderAsLine  = 1;	// 1:境界線をlineとして扱う

	k.dispzero      = 1;	// 1:0を表示するかどうか
	k.isDispHatena  = 1;	// 1:qnumが-2のときに？を表示する
	k.isAnsNumber   = 0;	// 1:回答に数字を入力するパズル
	k.isArrowNumber = 0;	// 1:矢印つき数字を入力するパズル
	k.isOneNumber   = 0;	// 1:部屋の問題の数字が1つだけ入るパズル
	k.isDispNumUL   = 0;	// 1:数字をマス目の左上に表示するパズル(0はマスの中央)
	k.NumberWithMB  = 0;	// 1:回答の数字と○×が入るパズル

	k.BlackCell     = 0;	// 1:黒マスを入力するパズル
	k.NumberIsWhite = 0;	// 1:数字のあるマスが黒マスにならないパズル
	k.RBBlackCell   = 0;	// 1:連黒分断禁のパズル

	k.ispzprv3ONLY  = 1;	// 1:ぱずぷれv3にしかないパズル
	k.isKanpenExist = 1;	// 1:pencilbox/カンペンにあるパズル

	k.fstruct = ["cellqnum","borderans2"];

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

		base.setTitle("スリザーリンク","Slitherlink");
		base.setExpression("　左ドラッグで線が、右クリックで×が入力できます。",
						   " Left Button Drag to input black cells, Right Click to input a cross.");
		base.setFloatbgcolor("rgb(32, 32, 32)");
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
				if(!kp.enabled()){ this.inputqnum(x,y,3);}
				else{ kp.display(x,y);}
			}
			else if(k.mode==3){
				if(this.btn.Left) this.inputborderans(x,y);
				else if(this.btn.Right) this.inputpeke(x,y);
			}
		};
		mv.mouseup = function(x,y){ };
		mv.mousemove = function(x,y){
			if(kc.isZ ^ menu.getVal('dispred')){ this.dispRedLine(x,y); return;}
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
			if(ca=='z' && !this.keyPressed){ this.isZ=true; return;}
			if(k.mode==3){ return;}
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum(ca,3);
		};
		kc.keyup = function(ca){ if(ca=='z'){ this.isZ=false;}};
		kc.isZ = false;

		if(k.callmode == "pmake"){
			kp.generate(99, true, false, this.kpgenerate);
			kp.kpinput = function(ca){
				kc.key_inputqnum(ca,3);
			};
		}
	},

	kpgenerate : function(mode){
		kp.inputcol('num','knum0','0','0');
		kp.inputcol('num','knum1','1','1');
		kp.inputcol('num','knum2','2','2');
		kp.insertrow();
		kp.inputcol('num','knum3','3','3');
		kp.inputcol('num','knum_',' ',' ');
		kp.inputcol('num','knum.','-','?');
		kp.insertrow();
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

			if(k.br.IE){ this.drawPekes(x1,y1,x2,y2,1);}
			else{ this.drawPekes(x1,y1,x2,y2,0);}

			if(k.mode==1){ this.drawTCell(x1,y1,x2+1,y2+1);}else{ this.hideTCell();}
		};

		pc.drawBaseMarks = function(x1,y1,x2,y2){
			for(var i=0;i<(k.qcols+1)*(k.qrows+1);i++){
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

		col.repaintParts = function(id){
			pc.drawBaseMark1( bd.getxnum(int((bd.border[id].cx-(bd.border[id].cx%2))/2), int((bd.border[id].cy-(bd.border[id].cy%2))/2) ) );
			pc.drawBaseMark1( bd.getxnum(int((bd.border[id].cx+(bd.border[id].cx%2))/2), int((bd.border[id].cy+(bd.border[id].cy%2))/2) ) );
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	pzlinput : function(type, bstr){
		if(type==0||type==1){ bstr = enc.decode4(bstr, bd.setQnumCell.bind(bd), k.qcols*k.qrows);}
		else if(type==2)    { bstr = this.decodeKanpen(bstr); }
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
			ans.setAlert('分岐している線があります。','There is a branched line.'); return false;
		}
		if( !ans.checkLcntCross(4,0) ){
			ans.setAlert('線が交差しています。','There is a crossing line.'); return false;
		}

		if( !ans.checkdir4Border() ){
			ans.setAlert('数字の周りにある境界線の本数が違います。','The number is not equal to the number of border lines around it.'); return false;
		}

		if( !ans.checkOneLoop() ){
			ans.setAlert('輪っかが一つではありません。','There are plural loops.'); return false;
		}

		if( !ans.checkLcntCross(1,0) ){
			ans.setAlert('途中で途切れている線があります。','There is a dead-end line.'); return false;
		}

		return true;
	}
};
