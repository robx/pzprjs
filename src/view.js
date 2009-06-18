//
// パズル固有スクリプト部 ヴィウ版 view.js v3.1.9p1
//

function setting(){
	// グローバル変数の初期設定
	if(!k.qcols){ k.qcols = 8;}	// 盤面の横幅
	if(!k.qrows){ k.qrows = 8;}	// 盤面の縦幅
	k.irowake = 0;			// 0:色分け設定無し 1:色分けしない 2:色分けする

	k.iscross      = 0;		// 1:Crossが操作可能なパズル
	k.isborder     = 0;		// 1:Border/Lineが操作可能なパズル
	k.isextendcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

	k.isoutsidecross  = 0;	// 1:外枠上にCrossの配置があるパズル
	k.isoutsideborder = 0;	// 1:盤面の外枠上にborderのIDを用意する
	k.isborderCross   = 0;	// 1:線が交差するパズル
	k.isCenterLine    = 0;	// 1:マスの真ん中を通る線を回答として入力するパズル
	k.isborderAsLine  = 0;	// 1:境界線をlineとして扱う

	k.dispzero      = 1;	// 1:0を表示するかどうか
	k.isDispHatena  = 1;	// 1:qnumが-2のときに？を表示する
	k.isAnsNumber   = 1;	// 1:回答に数字を入力するパズル
	k.isArrowNumber = 0;	// 1:矢印つき数字を入力するパズル
	k.isOneNumber   = 0;	// 1:部屋の問題の数字が1つだけ入るパズル
	k.isDispNumUL   = 0;	// 1:数字をマス目の左上に表示するパズル(0はマスの中央)
	k.NumberWithMB  = 1;	// 1:回答の数字と○×が入るパズル

	k.BlackCell     = 0;	// 1:黒マスを入力するパズル
	k.NumberIsWhite = 0;	// 1:数字のあるマスが黒マスにならないパズル
	k.RBBlackCell   = 0;	// 1:連黒分断禁のパズル

	k.ispzprv3ONLY  = 0;	// 1:ぱずぷれv3にしかないパズル
	k.isKanpenExist = 0;	// 1:pencilbox/カンペンにあるパズル

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

		base.setTitle("ヴィウ","View");
		base.setExpression("　マスのクリックやキーボードで数字を入力できます。QAZキーで○、WSXキーで×を入力できます。",
					   " It is available to input number by keybord or mouse. Each QAZ key to input auxiliary circle, each WSX key to input auxiliary cross.");
		base.setFloatbgcolor("rgb(64, 64, 64)");
	},
	menufix : function(){ },
	postfix : function(){ },

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(x,y){
			if(!kp.enabled()){ this.inputqnum(x,y,Math.min(k.qcols+k.qrows-2,99));}
			else{ kp.display(x,y);}
		};
		mv.mouseup = function(x,y){ };
		mv.mousemove = function(x,y){
			//this.inputqnum(x,y,Math.min(k.qcols+k.qrows-2,99));
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(this.moveTCell(ca)){ return;}
			if(puz.key_view(ca)){ return;}
			this.key_inputqnum(ca,Math.min(k.qcols+k.qrows-2,99));
		};

		kp.generate(99, true, true, this.kpgenerate);
		kp.kpinput = function(ca){
			if(puz.key_view(ca)){ return;}
			kc.key_inputqnum(ca,Math.min(k.qcols+k.qrows-2,99));
		};
	},
	key_view : function(ca){
		if(k.mode==1 || bd.getQnumCell(tc.getTCC())!=-1){ return false;}

		var cc = tc.getTCC();
		var flag = false;

		if     ((ca=='q'||ca=='a'||ca=='z')){ bd.setQansCell(cc,-1); bd.setQsubCell(cc,1); flag = true;}
		else if((ca=='w'||ca=='s'||ca=='x')){ bd.setQansCell(cc,-1); bd.setQsubCell(cc,2); flag = true;}
		else if((ca=='e'||ca=='d'||ca=='c')){ bd.setQansCell(cc,-1); bd.setQsubCell(cc,0); flag = true;}
		else if(ca=='1' && bd.getQansCell(cc)==1){ bd.setQansCell(cc,-1); bd.setQsubCell(cc,1); flag = true;}
		else if(ca=='2' && bd.getQansCell(cc)==2){ bd.setQansCell(cc,-1); bd.setQsubCell(cc,2); flag = true;}

		if(flag){ pc.paint(bd.cell[cc].cx, bd.cell[cc].cy, bd.cell[cc].cx, bd.cell[cc].cy); return true;}
		return false;
	},

	kpgenerate : function(mode){
		if(mode==3){
			kp.tdcolor = pc.MBcolor;
			kp.inputcol('num','knumq','q','○');
			kp.inputcol('num','knumw','w','×');
			kp.tdcolor = "black";
			kp.inputcol('empty','knumx','','');
			kp.inputcol('empty','knumy','','');
			kp.insertrow();
		}
		kp.inputcol('num','knum0','0','0');
		kp.inputcol('num','knum1','1','1');
		kp.inputcol('num','knum2','2','2');
		kp.inputcol('num','knum3','3','3');
		kp.insertrow();
		kp.inputcol('num','knum4','4','4');
		kp.inputcol('num','knum5','5','5');
		kp.inputcol('num','knum6','6','6');
		kp.inputcol('num','knum7','7','7');
		kp.insertrow();
		kp.inputcol('num','knum8','8','8');
		kp.inputcol('num','knum9','9','9');
		kp.inputcol('num','knum_',' ',' ');
		((mode==1)?kp.inputcol('num','knum.','-','?'):kp.inputcol('empty','knumz','',''));
		kp.insertrow();
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.errbcolor2 = "rgb(127, 255, 127)";

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);
		//	this.flushCanvasAll();

			this.drawErrorCells(x1,y1,x2,y2);

			this.drawBDline(x1,y1,x2,y2);

			this.drawMBs(x1,y1,x2,y2);
			this.drawNumbers(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);

			this.drawTCell(x1,y1,x2+1,y2+1);
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

		if( !ans.checkSideCell(function(c1,c2){ return (puz.getNum(c1)>=0 && puz.getNum(c1)==puz.getNum(c2));}) ){
			ans.setAlert('同じ数字がタテヨコに連続しています。','Same numbers are adjacent.'); return false;
		}

		if( !this.checkCellNumber() ){
			ans.setAlert('数字と、他のマスにたどり着くまでのマスの数の合計が一致していません。','Sum of four-way gaps to another number is not equal to the number.'); return false;
		}

		if( !ans.linkBWarea( ans.searchBWarea(function(id){ return (id!=-1 && puz.getNum(id)!=-1 && puz.getNum(id)!=-3); }) ) ){
			ans.setAlert('タテヨコにつながっていない数字があります。','Numbers are devided.'); return false;
		}

		if( !this.checkMB() ){
			ans.setAlert('数字の入っていないマスがあります。','There is a cell that is not filled in number.'); return false;
		}

		return true;
	},

	checkCellNumber : function(){
		for(var c=0;c<bd.cell.length;c++){
			if(this.getNum(c)<0){ continue;}

			var list = new Array();
			var cnt=0;
			var tx, ty;

			tx = bd.cell[c].cx-1; ty = bd.cell[c].cy;
			while(tx>=0)     { var cc=bd.getcnum(tx,ty); if(this.getNum(cc)==-1){ cnt++; list.push(cc); tx--;} else{ break;} }
			tx = bd.cell[c].cx+1; ty = bd.cell[c].cy;
			while(tx<k.qcols){ var cc=bd.getcnum(tx,ty); if(this.getNum(cc)==-1){ cnt++; list.push(cc); tx++;} else{ break;} }
			tx = bd.cell[c].cx; ty = bd.cell[c].cy-1;
			while(ty>=0)     { var cc=bd.getcnum(tx,ty); if(this.getNum(cc)==-1){ cnt++; list.push(cc); ty--;} else{ break;} }
			tx = bd.cell[c].cx; ty = bd.cell[c].cy+1;
			while(ty<k.qrows){ var cc=bd.getcnum(tx,ty); if(this.getNum(cc)==-1){ cnt++; list.push(cc); ty++;} else{ break;} }

			if(this.getNum(c)!=cnt){
				bd.setErrorCell([c],1);
				bd.setErrorCell(list,2);
				return false;
			}
		}
		return true;
	},
	getNum : function(cc){
		if(cc<0||cc>=bd.cell.length){ return -1;}
		if(bd.getQnumCell(cc)!=-1){ return bd.getQnumCell(cc);}
		if(bd.getQsubCell(cc)==1) { return -3;}
		return bd.getQansCell(cc);
	},

	checkMB : function(){
		for(var c=0;c<bd.cell.length;c++){
			if(bd.getQsubCell(c)==1){ bd.setErrorCell([c],1); return false;}
		}
		return true;
	}
};
