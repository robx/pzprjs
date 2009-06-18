//
// パズル固有スクリプト部 因子の部屋版 factors.js v3.1.9p1
//

function setting(){
	// グローバル変数の初期設定
	if(!k.qcols){ k.qcols = 9;}	// 盤面の横幅
	if(!k.qrows){ k.qrows = 9;}	// 盤面の縦幅
	k.irowake = 0;			// 0:色分け設定無し 1:色分けしない 2:色分けする

	k.iscross      = 0;		// 1:Crossが操作可能なパズル
	k.isborder     = 1;		// 1:Border/Lineが操作可能なパズル
	k.isextendcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

	k.isoutsidecross  = 0;	// 1:外枠上にCrossの配置があるパズル
	k.isoutsideborder = 0;	// 1:盤面の外枠上にborderのIDを用意する
	k.isborderCross   = 0;	// 1:線が交差するパズル
	k.isCenterLine    = 0;	// 1:マスの真ん中を通る線を回答として入力するパズル
	k.isborderAsLine  = 0;	// 1:境界線をlineとして扱う

	k.dispzero      = 0;	// 1:0を表示するかどうか
	k.isDispHatena  = 0;	// 1:qnumが-2のときに？を表示する
	k.isAnsNumber   = 1;	// 1:回答に数字を入力するパズル
	k.isArrowNumber = 0;	// 1:矢印つき数字を入力するパズル
	k.isOneNumber   = 1;	// 1:部屋の問題の数字が1つだけ入るパズル
	k.isDispNumUL   = 0;	// 1:数字をマス目の左上に表示するパズル(0はマスの中央)
	k.NumberWithMB  = 0;	// 1:回答の数字と○×が入るパズル

	k.BlackCell     = 0;	// 1:黒マスを入力するパズル
	k.NumberIsWhite = 0;	// 1:数字のあるマスが黒マスにならないパズル
	k.RBBlackCell   = 0;	// 1:連黒分断禁のパズル

	k.ispzprv3ONLY  = 0;	// 1:ぱずぷれv3にしかないパズル
	k.isKanpenExist = 1;	// 1:pencilbox/カンペンにあるパズル

	k.fstruct = ["borderques", "cellqnum", "cellqanssub"];

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

		base.setTitle("因子の部屋",'Rooms of Factors');
		base.setExpression("　キーボードやマウスで数字が入力できます。",
						   " Inputting number is available by keybord or mouse");
		base.setFloatbgcolor("rgb(64, 64, 64)");
	},
	menufix : function(){
		if(k.callmode=="pmake"){ kp.defaultdisp = true;}
	},
	postfix : function(){
		this.roommaxfunc = function(cc,mode){ return (mode==1)?999999:Math.max(k.qcols,k.qrows);};
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(x,y){
			if(k.mode==1) this.borderinput = this.inputborder(x,y);
			if(k.mode==3){
				if(!kp.enabled()){ this.inputqnum(x,y,99);}
				else{ kp.display(x,y);}
			}
		};
		mv.mouseup = function(x,y){
			if(this.notInputted()){
				if(k.mode==1){
					if(!kp.enabled()){ this.inputqnum(x,y,99);}
					else{ kp.display(x,y);}
				}
			}
		};
		mv.mousemove = function(x,y){
			if(k.mode==1 && this.btn.Left) this.inputborder(x,y);
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum(ca,99);
		};

		kp.generate(0, true, true, '');
		kp.kpinput = function(ca){ kc.key_factors(ca,Math.max(k.qcols,k.qrows));};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.BDlinecolor = "rgb(160, 160, 160)";

		pc.errbcolor1 = "rgb(255, 160, 160)";

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);
		//	this.flushCanvasAll();

			this.drawErrorCells(x1,y1,x2,y2);

			this.drawBDline(x1,y1,x2,y2);

			this.drawNumbers_factors(x1,y1,x2,y2);

			this.drawBorders(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);

			this.drawTCell(x1,y1,x2+1,y2+1);
		};
		pc.drawNumbers_factors = function(x1,y1,x2,y2){
			var clist = this.cellinside(x1,y1,x2,y2,f_true);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];

				if(bd.getQansCell(c)==-1){
					if(bd.cell[c].numobj){ bd.cell[c].numobj.hide();}
				}
				else{
					var color = (bd.getErrorCell(c)==1?this.fontErrcolor:this.fontAnscolor);
					if(!bd.cell[c].numobj){ bd.cell[c].numobj = this.CreateDOMAndSetNop();}
					this.dispnumCell1(c, bd.cell[c].numobj, 1, (""+bd.getQansCell(c)), (bd.getQansCell(c)<10?0.8:0.7), color);
				}

				if(bd.getQnumCell(c)==-1){
					if(bd.cell[c].numobj2){ bd.cell[c].numobj2.hide();}
				}
				else{
					if(!bd.cell[c].numobj2){ bd.cell[c].numobj2 = this.CreateDOMAndSetNop();}
					var size = 0.45;
					if     (bd.getQnumCell(c)>=100000){ size = 0.30;}
					else if(bd.getQnumCell(c)>= 10000){ size = 0.36;}
					this.dispnumCell1(c, bd.cell[c].numobj2, 5, (""+bd.getQnumCell(c)), size, this.fontcolor);
				}
			}
			this.vinc();
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	pzlinput : function(type, bstr){
		if(type==0 || type==1){
			bstr = enc.decodeBorder(bstr);
			bstr = enc.decodeRoomNumber16(bstr);
		}
	},
	pzloutput : function(type){
		if(type==0)     { document.urloutput.ta.value = enc.getURLbase()+"?"+k.puzzleid+this.pzldata();}
		else if(type==1){ document.urloutput.ta.value = enc.getDocbase()+k.puzzleid+"/sa/m.html?c"+this.pzldata();}
		else if(type==3){ document.urloutput.ta.value = enc.getURLbase()+"?m+"+k.puzzleid+this.pzldata();}
	},
	pzldata : function(){
		return "/"+k.qcols+"/"+k.qrows+"/"+enc.encodeBorder()+enc.encodeRoomNumber16();
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	check : function(){

		if( !this.checkRowsCols() ){
			ans.setAlert('同じ列に同じ数字が入っています。','There are same numbers in a row.'); return false;
		}

		if( !this.checkRoomNumber(ans.searchRarea()) ){
			ans.setAlert('ブロックの数字と数字の積が同じではありません。','A number of room is not equal to the product of these numbers.'); return false;
		}

		if( !ans.checkAllCell(function(c){ return (bd.getQansCell(c)==-1);}) ){
			ans.setAlert('数字の入っていないマスがあります。','There is a empty cell.'); return false;
		}

		return true;
	},
	check1st : function(){ return ans.checkAllCell(function(c){ return (bd.getQansCell(c)==-1);});},

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
	checkDifferentNumberInClist : function(clist){
		var d = new Array();
		for(var i=1;i<=Math.max(k.qcols,k.qrows);i++){ d[i]=-1;}
		for(var i=0;i<clist.length;i++){
			var val=bd.getQansCell(clist[i]);
			if     (val==-1){ continue;}
			else if(d[val]==-1){ d[val] = bd.getQansCell(clist[i]); continue;}

			for(var j=0;j<clist.length;j++){ if(bd.getQansCell(clist[j])==val){ bd.setErrorCell([clist[j]],1);} }
			return false;
		}
		return true;
	},

	checkRoomNumber : function(area){
		for(var id=1;id<=area.max;id++){
			var product = 1;
			for(var i=0;i<area.room[id].length;i++){
				if(bd.getQansCell(area.room[id][i])>0){ product *= bd.getQansCell(area.room[id][i]);}
				else{ product = 0;}
			}
			if(product==0){ continue;}

			if(product!=bd.getQnumCell(ans.getTopOfRoom(area,id))){
				bd.setErrorCell(area.room[id],1);
				return false;
			}
		}
		return true;
	}
};
