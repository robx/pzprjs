//
// パズル固有スクリプト部 数独版 sudoku.js v3.2.0
//
Puzzles.sudoku = function(){ };
Puzzles.sudoku.prototype = {
	setting : function(){
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

		kp.kpgenerate = function(mode){
			this.inputcol('num','knum1','1','1');
			this.inputcol('num','knum2','2','2');
			this.inputcol('num','knum3','3','3');
			this.inputcol('num','knum4','4','4');
			this.insertrow();
			this.inputcol('num','knum5','5','5');
			this.inputcol('num','knum6','6','6');
			this.inputcol('num','knum7','7','7');
			this.inputcol('num','knum8','8','8');
			this.insertrow();
			this.inputcol('num','knum9','9','9');
			if(mode==1){
				this.inputcol('num','knum.','-','?');
				this.inputcol('num','knum_',' ',' ');
			}
			else{
				this.inputcol('empty','knumx','','');
				this.inputcol('num','knum_',' ',' ');
			}
			this.inputcol('num','knum0','0','0');
			this.insertrow();
		};
		kp.generate(99, true, true, kp.kpgenerate.bind(kp));
		kp.kpinput = function(ca){
			kc.key_inputqnum(ca,Math.max(k.qcols,k.qrows));
		};
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
			var block=mf(Math.sqrt(max)+0.1);

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
	encode_init : function(){
		enc.pzlimport = function(type, bstr){
			if(type==0 || type==1){ bstr = this.decodeNumber16(bstr);}
			else if(type==2)      { bstr = this.decodeKanpen(bstr); }
		};
		enc.pzlexport = function(type){
			if(type==0)     { document.urloutput.ta.value = this.getURLbase()+"?"+k.puzzleid+this.pzldata();}
			else if(type==1){ document.urloutput.ta.value = this.getDocbase()+k.puzzleid+"/sa/m.html?c"+this.pzldata();}
			else if(type==2){ document.urloutput.ta.value = this.kanpenbase()+"sudoku.html?problem="+this.encodeKanpen();}
			else if(type==3){ document.urloutput.ta.value = this.getURLbase()+"?m+"+k.puzzleid+this.pzldata();}
		};
		enc.pzldata = function(){
			return "/"+k.qcols+"/"+k.qrows+"/"+this.encodeNumber16();
		};

		enc.decodeKanpen = function(bstr){
			bstr = (bstr.split("_")).join(" ");
			fio.decodeCell( function(c,ca){
				if(ca != "."){ bd.sQnC(c, parseInt(ca));}
			},bstr.split("/"));
			return "";
		};
		enc.encodeKanpen = function(){
			return ""+k.qcols+"/"+fio.encodeCell( function(c){
				return (bd.QnC(c)>=0)?(bd.QnC(c).toString() + "_"):"._";
			});
		};

		//---------------------------------------------------------
		fio.kanpenOpen = function(array){
			this.decodeCell( function(c,ca){
				if     (ca == "0"){ bd.sQnC(c, -2);}
				else if(ca != "."){ bd.sQnC(c, parseInt(ca));}
			},array.slice(0,k.qrows));
			this.decodeCell( function(c,ca){
				if(ca!="."&&ca!="0"){ bd.sQaC(c, parseInt(ca));}
			},array.slice(k.qrows,2*k.qrows));
		};
		fio.kanpenSave = function(){
			return ""+this.encodeCell( function(c){
				if     (bd.QnC(c) > 0){ return (bd.QnC(c).toString() + " ");}
				else if(bd.QnC(c)==-2){ return "0 ";}
				else                  { return ". ";}
			})+
			this.encodeCell( function(c){
				if     (bd.QnC(c)!=-1){ return ". ";}
				else if(bd.QaC(c) > 0){ return (bd.QaC(c).toString() + " ");}
				else                  { return "0 ";}
			});
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			if( !this.checkRoomNumber() ){
				this.setAlert('同じブロックに同じ数字が入っています。','There are same numbers in a block.'); return false;
			}

			if( !this.checkRowsCols() ){
				this.setAlert('同じ列に同じ数字が入っています。','There are same numbers in a row.'); return false;
			}

			if( !this.checkAllCell(function(c){ return (this.getNum(c)==-1);}.bind(this)) ){
				this.setAlert('数字の入っていないマスがあります。','There is a empty cell.'); return false;
			}

			return true;
		};
		ans.check1st = function(){ return this.checkAllCell(function(c){ return (this.getNum(c)==-1);}.bind(this));};

		ans.checkRowsCols = function(){
			for(var cy=0;cy<k.qrows;cy++){
				var clist = new Array();
				for(var cx=0;cx<k.qcols;cx++){ clist.push(bd.cnum(cx,cy));}
				if(!this.checkDifferentNumberInClist(clist)){ return false;}
			}
			for(var cx=1;cx<k.qcols;cx++){
				var clist = new Array();
				for(var cy=0;cy<k.qrows;cy++){ clist.push(bd.cnum(cx,cy));}
				if(!this.checkDifferentNumberInClist(clist)){ return false;}
			}
			return true;
		};
		ans.checkRoomNumber = function(area){
			var max=k.qcols;
			var block=mf(Math.sqrt(max)+0.1);
			for(var i=0;i<max;i++){
				var clist = new Array();
				for(var cx=(i%block)*block;cx<(i%block+1)*block;cx++){
					for(var cy=mf(i/block)*block;cy<mf(i/block+1)*block;cy++){ clist.push(bd.cnum(cx,cy));}
				}
				if(!this.checkDifferentNumberInClist(clist)){ return false;}
			}
			return true;
		};
		ans.checkDifferentNumberInClist = function(clist){
			var d = new Array();
			for(var i=1;i<=Math.max(k.qcols,k.qrows);i++){ d[i]=-1;}
			for(var i=0;i<clist.length;i++){
				var val=this.getNum(clist[i]);
				if     (val==-1){ continue;}
				else if(d[val]==-1){ d[val] = this.getNum(clist[i]); continue;}

				for(var j=0;j<clist.length;j++){ if(this.getNum(clist[j])==val){ bd.sErC([clist[j]],1);} }
				return false;
			}
			return true;
		};
		ans.getNum = function(cc){
			if(cc<0||cc>=bd.cell.length){ return -1;}
			if(bd.QnC(cc)!=-1){ return bd.QnC(cc);}
			if(bd.QsC(cc)==1) { return -3;}
			return bd.QaC(cc);
		};
	}
};
