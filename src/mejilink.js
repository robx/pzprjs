//
// パズル固有スクリプト部 メジリンク版 mejilink.js v3.1.9p2
//

function setting(){
	// グローバル変数の初期設定
	if(!k.qcols){ k.qcols = 8;}	// 盤面の横幅
	if(!k.qrows){ k.qrows = 8;}	// 盤面の縦幅
	k.irowake = 0;			// 0:色分け設定無し 1:色分けしない 2:色分けする

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
	k.isKanpenExist = 0;	// 1:pencilbox/カンペンにあるパズル

	k.fstruct = ["others"];

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

		base.setTitle("メジリンク","Mejilink");
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
			if(k.mode==1) this.inputborder(x,y);
			else if(k.mode==3){
				if(this.btn.Left) this.inputborderans(x,y);
				else if(this.btn.Right) this.inputpeke(x,y);
			}
		};
		mv.mouseup = function(x,y){ };
		mv.mousemove = function(x,y){
			if(kc.isZ ^ menu.getVal('dispred')){ this.dispRedLine(x,y); return;}
			if(k.mode==1) this.inputborder(x,y);
			else if(k.mode==3){
				if(this.btn.Left) this.inputborderans(x,y);
				else if(this.btn.Right) this.inputpeke(x,y);
			}
		};

		// キーボード入力系
		kc.keyinput = function(ca){ if(ca=='z' && !this.keyPressed){ this.isZ=true;} };
		kc.keyup = function(ca){ if(ca=='z'){ this.isZ=false;}};
		kc.isZ = false;
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.BDlinecolor = "rgb(127, 127, 127)";
		if(k.br.IE){ pc.BDlinecolor = "rgb(191, 191, 191)";}

		pc.BorderQuescolor = "white";
		pc.BorderQanscolor = "rgb(0, 160, 0)";

		pc.crosssize = 0.05;

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);
		//	this.flushCanvasAll();

			this.drawErrorCells(x1,y1,x2,y2);

			this.drawBDline2(x1,y1,x2,y2);
			this.drawBorders(x1,y1,x2,y2);

			this.drawBaseMarks(x1,y1,x2,y2);

			if(k.br.IE){ this.drawPekes(x1,y1,x2,y2,1);}
			else{ this.drawPekes(x1,y1,x2,y2,0);}
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
			var lw = ((k.cwidth/12)>=3?(k.cwidth/12):3); //LineWidth
			var csize = int((lw+1)/2);

			var cx = i%(k.qcols+1); var cy = int(i/(k.qcols+1));

			g.fillStyle = this.crossnumcolor;
			g.beginPath();
			g.arc(k.p0.x+cx*k.cwidth, k.p0.x+cy*k.cheight, csize, 0, Math.PI*2, false);
			if(this.vnop("x"+i+"_cm_",1)){ g.fill();}
		};

		// オーバーライド
		pc.drawBorder1 = function(id,flag){
			var lw = this.lw, lm = this.lm;
			var vmlid = "b"+id+"_bd_", vmlid2 = "b"+id+"_bd2_";

			if(!flag){ this.vhide([vmlid,vmlid2]); return;}
			else if(bd.getQansBorder(id)!=1){
				lw = 1; lm = 0; vmlid = "b"+id+"_bd2_"; vmlid2 = "b"+id+"_bd_";
				var cc2=bd.getcc2(id);
				if(cc2==-1 || bd.getErrorCell(cc2)==0){ g.fillStyle = this.BorderQuescolor;}
				else{ g.fillStyle = this.errbcolor1;}
			}
			else if(bd.getQansBorder(id)==1){
				if     (bd.getErrorBorder(id)==1){ g.fillStyle = this.errlinecolor1; lw++;}
				else if(bd.getErrorBorder(id)==2){ g.fillStyle = this.errlinecolor2;}
				else if(!menu.getVal('irowake') || !bd.border[id].color){ g.fillStyle = this.BorderQanscolor;}
				else{ g.fillStyle = bd.border[id].color;}
			}

			if     (bd.border[id].cy%2==1){ if(this.vnop(vmlid,1)){ g.fillRect(bd.border[id].px()-lm,                 bd.border[id].py()-int(k.cheight/2)-lm, lw         , k.cheight+lw);} }
			else if(bd.border[id].cx%2==1){ if(this.vnop(vmlid,1)){ g.fillRect(bd.border[id].px()-int(k.cwidth/2)-lm, bd.border[id].py()-lm                 , k.cwidth+lw, lw          );} }
			this.vhide(vmlid2);
		};

		col.repaintParts = function(id){
			pc.drawBaseMark1( bd.getxnum(int((bd.border[id].cx-(bd.border[id].cx%2))/2), int((bd.border[id].cy-(bd.border[id].cy%2))/2) ) );
			pc.drawBaseMark1( bd.getxnum(int((bd.border[id].cx+(bd.border[id].cx%2))/2), int((bd.border[id].cy+(bd.border[id].cy%2))/2) ) );
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	pzlinput : function(type, bstr){
		bstr = this.decodeMejilink(bstr);
	},
	pzloutput : function(type){
		if(type==0)     { document.urloutput.ta.value = enc.getURLbase()+"?"+k.puzzleid+this.pzldata();}
		else if(type==3){ document.urloutput.ta.value = enc.getURLbase()+"?m+"+k.puzzleid+this.pzldata();}
	},
	pzldata : function(){
		return "/"+k.qcols+"/"+k.qrows+"/"+this.encodeMejilink();
	},

	decodeMejilink : function(bstr){
		var pos = bstr?Math.min(int((bd.border.length+4)/5),bstr.length):0;
		for(var i=0;i<pos;i++){
			var ca = parseInt(bstr.charAt(i),32);
			for(var w=0;w<5;w++){
				if(i*5+w<bd.borders.length){ bd.setQuesBorder(i*5+w,(ca&Math.pow(2,4-w)?1:0));}
			}
		}
		return bstr.substring(pos,bstr.length);
	},
	encodeMejilink : function(){
		var count = 0;
		for(var i=k.qcols*(k.qrows-1)+(k.qcols-1)*k.qrows;i<bd.border.length;i++){ if(bd.getQuesBorder(i)==1) count++;}
		var num=0, pass=0, cm="";
		for(var i=0;i<(count==0?k.qcols*(k.qrows-1)+(k.qcols-1)*k.qrows:bd.border.length);i++){
			if(bd.getQuesBorder(i)==1){ pass+=Math.pow(2,4-num);}
			num++; if(num==5){ cm += pass.toString(32); num=0; pass=0;}
		}
		if(num>0){ cm += pass.toString(32);}
		return cm;
	},

	//---------------------------------------------------------
	decodeOthers : function(array){
		if(array.length<k.qrows+1){ return false;}
		this.decodeBorder2( function(c,ca){
			if     (ca == "1" ){ bd.setQuesBorder(c, 1);}
			else if(ca == "2" ){ bd.setQansBorder(c, 1);}
			else if(ca == "-1"){ bd.setQsubBorder(c, 2);}
		},stack);
		return true;
	},
	encodeOthers : function(){
		return (""+this.encodeBorder2( function(c){
			if     (bd.getQuesBorder(c)==1){ return "1 ";}
			else if(bd.getQansBorder(c)==1){ return "2 ";}
			else if(bd.getQsubBorder(c)==2){ return "-1 ";}
			else                           { return "0 ";}
		}));
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	check : function(){

		if( !this.checkdir4Line_meji(3) ){
			ans.setAlert('分岐している線があります。','There is a branched line.'); return false;
		}
		if( !this.checkdir4Line_meji(4) ){
			ans.setAlert('線が交差しています。','There is a crossing line.'); return false;
		}

		if( !this.checkDotLength() ){
			ans.setAlert('タイルと周囲の線が引かれない点線の長さが異なります。','The size of the tile is not equal to the total of length of lines that is remained dotted around the tile.'); return false;
		}

		if( !this.checkdir4Line_meji(1) ){
			ans.setAlert('途中で途切れている線があります。','There is a dead-end line.'); return false;
		}

		if( !ans.checkOneLoop() ){
			ans.setAlert('輪っかが一つではありません。','There are plural loops.'); return false;
		}

		return true;
	},
	check1st : function(){ return true;},

	checkdir4Line_meji : function(val){
		for(var cy=0;cy<=k.qrows;cy++){
			for(var cx=0;cx<=k.qcols;cx++){
				var cnt = 0;
				if(bd.getQansBorder(bd.getbnum(cx*2-1,cy*2  ))==1){ cnt++;}
				if(bd.getQansBorder(bd.getbnum(cx*2+1,cy*2  ))==1){ cnt++;}
				if(bd.getQansBorder(bd.getbnum(cx*2  ,cy*2-1))==1){ cnt++;}
				if(bd.getQansBorder(bd.getbnum(cx*2  ,cy*2+1))==1){ cnt++;}
				if(cnt==val){
					bd.setErrorBorder(bd.borders,2);
					ans.setCrossBorderError(cx,cy);
					return false;
				}
			}
		}
		return true;
	},
	checkDotLength : function(){
		var tarea = ans.searchRLarea(function(id){ return (id!=-1 && bd.getQuesBorder(id)==1); }, false);
		var tcount = new Array();
		for(var r=1;r<=tarea.max;r++){ tcount[r]=0;}
		for(var id=0;id<bd.border.length;id++){
			if(bd.getQuesBorder(id)==1 && id>=k.qcols*(k.qrows-1)+(k.qcols-1)*k.qrows){
				var cc1=bd.getcc1(id), cc2=bd.getcc2(id);
				if(cc1!=-1){ tcount[tarea.check[cc1]]-=(2*k.wcols*k.qrows);}
				if(cc2!=-1){ tcount[tarea.check[cc2]]-=(2*k.wcols*k.qrows);}
				continue;
			}
			else if(bd.getQuesBorder(id)==1 || bd.getQansBorder(id)==1){ continue;}
			var cc1=bd.getcc1(id), cc2=bd.getcc2(id);
			if(cc1!=-1){ tcount[tarea.check[cc1]]++;}
			if(cc2!=-1){ tcount[tarea.check[cc2]]++;}
		}
		for(var r=1;r<=tarea.max;r++){
			if(tcount[r]>=0 && tcount[r]!=tarea.room[r].length){
				bd.setErrorCell(tarea.room[r],1);
				return false;
			}
		}
		return true;
	}
};

Border.prototype.allclear = function(num){
	if(num==undefined || num>=(k.qcols-1)*k.qrows+k.qcols*(k.qrows-1)){ this.ques = 0;}
	else{ this.ques = 1;}
	this.qnum = -1;
	this.qans = 0;
	this.qsub = 0;
	this.line = 0;
	this.color = "";
	this.error = 0;
};
