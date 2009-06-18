//
// パズル固有スクリプト部 数独版 sudoku.js v3.1.9p2
//

function setting(){
	// グローバル変数の初期設定
	if(!k.qcols){ k.qcols = 9;}	// 盤面の横幅
	if(!k.qrows){ k.qrows = 9;}	// 盤面の縦幅
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
	k.isAnsNumber   = 1;	// 1:回答に数字を入力するパズル
	k.isArrowNumber = 0;	// 1:矢印つき数字を入力するパズル
	k.isOneNumber   = 0;	// 1:部屋の問題の数字が1つだけ入るパズル
	k.isDispNumUL   = 0;	// 1:数字をマス目の左上に表示するパズル(0はマスの中央)
	k.NumberWithMB  = 0;	// 1:回答の数字と○×が入るパズル

	k.BlackCell     = 0;	// 1:黒マスを入力するパズル
	k.NumberIsWhite = 0;	// 1:数字のあるマスが黒マスにならないパズル
	k.RBBlackCell   = 0;	// 1:連黒分断禁のパズル

	k.ispzprv3ONLY  = 1;	// 1:ぱずぷれv3にしかないパズル
	k.isKanpenExist = 1;	// 1:pencilbox/カンペンにあるパズル

	k.fstruct = ["cellqnum", "cellqanssub"];

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

		base.setTitle("数独","Sudoku");
		base.setExpression("　キーボードやマウスで数字が入力できます。",
						   " It is available to input number by keybord or mouse");
		base.setFloatbgcolor("rgb(64, 64, 64)");

		var inhtml = "<span id=\"pop1_1_cap0\">盤面を新規作成します。</span><br>\n";
		inhtml += "<input type=\"radio\" name=\"size\" value=\"9\" checked>9×9<br>\n";
		inhtml += "<input type=\"radio\" name=\"size\" value=\"16\">16×16<br>\n";
		inhtml += "<input type=\"radio\" name=\"size\" value=\"25\">25×25<br>\n";
		inhtml += "<input type=\"radio\" name=\"size\" value=\"4\">4×4<br>\n";
		inhtml += "<input type=\"button\" name=\"newboard\" value=\"新規作成\" /><input type=\"button\" name=\"cancel\" value=\"キャンセル\" />\n";
		$(document.newboard).html(inhtml);
	},
	menufix : function(){ },
	postfix : function(){ },

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(x,y){
			if(!kp.enabled()){ this.inputqnum(x,y,Math.max(k.qcols,k.qrows));}
			else{ kp.display(x,y);}
		};
		mv.mouseup = function(x,y){ };
		mv.mousemove = function(x,y){ };

		// キーボード入力系
		kc.keyinput = function(ca){
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum(ca,Math.max(k.qcols,k.qrows));
		};

		kp.generate(99, true, true, this.kpgenerate);
		kp.kpinput = function(ca){
			kc.key_inputqnum(ca,Math.max(k.qcols,k.qrows));
		};
	},

	kpgenerate : function(mode){
		kp.inputcol('num','knum1','1','1');
		kp.inputcol('num','knum2','2','2');
		kp.inputcol('num','knum3','3','3');
		kp.inputcol('num','knum4','4','4');
		kp.insertrow();
		kp.inputcol('num','knum5','5','5');
		kp.inputcol('num','knum6','6','6');
		kp.inputcol('num','knum7','7','7');
		kp.inputcol('num','knum8','8','8');
		kp.insertrow();
		kp.inputcol('num','knum9','9','9');
		kp.insertrow();
		if(mode==1){
			kp.inputcol('num','knum.','-','?');
			kp.inputcol('num','knum_',' ',' ');
		}
		else{
			kp.inputcol('empty','knumx','','');
			kp.inputcol('empty','knumy','','');
		}
		kp.inputcol('num','knum0','0','0');
		kp.insertrow();
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		this.MBcolor = "rgb(64, 255, 64)";

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);
		//	this.flushCanvasAll();

			this.drawErrorCells(x1,y1,x2,y2);

			this.drawBDline(x1,y1,x2,y2);
			this.drawBlockBorders(x1,y1,x2,y2);

			this.drawNumbers(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);

			this.drawTCell(x1,y1,x2+1,y2+1);
		};
		pc.drawBlockBorders = function(x1,y1,x2,y2){
			var lw = this.lw, lm = this.lm;

			var max=k.qcols;
			var block=int(Math.sqrt(max)+0.1);

			if(x1<0){ x1=0;} if(x2>k.qcols-1){ x2=k.qcols-1;}
			if(y1<0){ y1=0;} if(y2>k.qrows-1){ y2=k.qrows-1;}

			g.fillStyle = "black";
			for(var i=1;i<block;i++){
				if(x1-1<=i*block&&i*block<=x2+1){ if(this.vnop("bbx"+i+"_")){
					g.fillRect(k.p0.x+i*block*k.cwidth-lw+1, k.p0.y+y1*k.cheight-lw+1, lw, (y2-y1+1)*k.cheight+2*lw-1);
				}}
			}
			for(var i=1;i<block;i++){
				if(y1-1<=i*block&&i*block<=y2+1){ if(this.vnop("bby"+i+"_")){
					g.fillRect(k.p0.x+x1*k.cwidth-lw+1, k.p0.y+i*block*k.cheight-lw+1, (x2-x1+1)*k.cwidth+2*lw-1, lw);
				}}
			}
			this.vinc();
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	pzlinput : function(type, bstr){
		if(type==0 || type==1){ bstr = enc.decodeNumber16(bstr);}
		else if(type==2)      { bstr = this.decodeKanpen(bstr); }
	},
	pzloutput : function(type){
		if(type==0)     { document.urloutput.ta.value = enc.getURLbase()+"?"+k.puzzleid+this.pzldata();}
		else if(type==1){ document.urloutput.ta.value = enc.getDocbase()+k.puzzleid+"/sa/m.html?c"+this.pzldata();}
		else if(type==2){ document.urloutput.ta.value = enc.kanpenbase()+"sudoku.html?problem="+this.encodeKanpen();}
		else if(type==3){ document.urloutput.ta.value = enc.getURLbase()+"?m+"+k.puzzleid+this.pzldata();}
	},
	pzldata : function(){
		return "/"+k.qcols+"/"+k.qrows+"/"+enc.encodeNumber16();
	},

	decodeKanpen : function(bstr){
		bstr = (bstr.split("_")).join(" ");
		fio.decodeCell( function(c,ca){
			if(ca != "."){ bd.setQnumCell(c, parseInt(ca));}
		},bstr.split("/"));
		return "";
	},
	encodeKanpen : function(){
		return ""+k.qcols+"/"+fio.encodeCell( function(c){
			if     (bd.getQnumCell(c)>=0) { return (bd.getQnumCell(c).toString() + "_");}
			else                          { return "._";}
		});
	},

	//---------------------------------------------------------
	kanpenOpen : function(array){
		fio.decodeCell( function(c,ca){
			if     (ca == "0"){ bd.setQnumCell(c, -2);}
			else if(ca != "."){ bd.setQnumCell(c, parseInt(ca));}
		},array.slice(0,k.qrows));
		fio.decodeCell( function(c,ca){
			if(ca!="."&&ca!="0"){ bd.setQansCell(c, parseInt(ca));}
		},array.slice(k.qrows,2*k.qrows));
	},
	kanpenSave : function(){
		return ""+fio.encodeCell( function(c){
			if     (bd.getQnumCell(c) > 0){ return (bd.getQnumCell(c).toString() + " ");}
			else if(bd.getQnumCell(c)==-2){ return "0 ";}
			else                          { return ". ";}
		})+
		fio.encodeCell( function(c){
			if     (bd.getQnumCell(c)!=-1){ return ". ";}
			else if(bd.getQansCell(c) > 0){ return (bd.getQansCell(c).toString() + " ");}
			else                          { return "0 ";}
		});
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	check : function(){

		if( !this.checkRoomNumber() ){
			ans.setAlert('同じブロックに同じ数字が入っています。','There are same numbers in a block.'); return false;
		}

		if( !this.checkRowsCols() ){
			ans.setAlert('同じ列に同じ数字が入っています。','There are same numbers in a row.'); return false;
		}

		if( !ans.checkAllCell(function(c){ return (puz.getNum(c)==-1);}) ){
			ans.setAlert('数字の入っていないマスがあります。','There is a empty cell.'); return false;
		}

		return true;
	},
	check1st : function(){ return ans.checkAllCell(function(c){ return (puz.getNum(c)==-1);});},

	checkRowsCols : function(){
		var cx, cy;

		for(var cy=0;cy<k.qrows;cy++){
			var clist = new Array();
			for(var cx=0;cx<k.qcols;cx++){ clist.push(bd.getcnum(cx,cy));}
			if(!this.checkDifferentNumberInClist(clist)){ return false;}
		}
		for(var cx=1;cx<k.qcols;cx++){
			var clist = new Array();
			for(var cy=0;cy<k.qrows;cy++){ clist.push(bd.getcnum(cx,cy));}
			if(!this.checkDifferentNumberInClist(clist)){ return false;}
		}
		return true;
	},
	checkRoomNumber : function(area){
		var max=k.qcols;
		var block=int(Math.sqrt(max)+0.1);
		for(var i=0;i<max;i++){
			var clist = new Array();
			for(var cx=(i%block)*block;cx<(i%block+1)*block;cx++){
				for(var cy=int(i/block)*block;cy<int(i/block+1)*block;cy++){ clist.push(bd.getcnum(cx,cy));}
			}
			if(!this.checkDifferentNumberInClist(clist)){ return false;}
		}
		return true;
	},
	checkDifferentNumberInClist : function(clist){
		var d = new Array();
		for(var i=1;i<=Math.max(k.qcols,k.qrows);i++){ d[i]=-1;}
		for(var i=0;i<clist.length;i++){
			var val=this.getNum(clist[i]);
			if     (val==-1){ continue;}
			else if(d[val]==-1){ d[val] = this.getNum(clist[i]); continue;}

			for(var j=0;j<clist.length;j++){ if(this.getNum(clist[j])==val){ bd.setErrorCell([clist[j]],1);} }
			return false;
		}
		return true;
	},
	getNum : function(cc){
		if(cc<0||cc>=bd.cell.length){ return -1;}
		if(bd.getQnumCell(cc)!=-1){ return bd.getQnumCell(cc);}
		if(bd.getQsubCell(cc)==1) { return -3;}
		return bd.getQansCell(cc);
	}
};
