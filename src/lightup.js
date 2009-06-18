//
// パズル固有スクリプト部 美術館版 lightup.js v3.1.9p2
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

	k.dispzero      = 1;	// 1:0を表示するかどうか
	k.isDispHatena  = 0;	// 1:qnumが-2のときに？を表示する
	k.isAnsNumber   = 0;	// 1:回答に数字を入力するパズル
	k.isArrowNumber = 0;	// 1:矢印つき数字を入力するパズル
	k.isOneNumber   = 0;	// 1:部屋の問題の数字が1つだけ入るパズル
	k.isDispNumUL   = 0;	// 1:数字をマス目の左上に表示するパズル(0はマスの中央)
	k.NumberWithMB  = 0;	// 1:回答の数字と○×が入るパズル

	k.BlackCell     = 0;	// 1:黒マスを入力するパズル
	k.NumberIsWhite = 1;	// 1:数字のあるマスが黒マスにならないパズル
	k.RBBlackCell   = 0;	// 1:連黒分断禁のパズル

	k.ispzprv3ONLY  = 1;	// 1:ぱずぷれv3にしかないパズル
	k.isKanpenExist = 1;	// 1:pencilbox/カンペンにあるパズル

	k.fstruct = ["cellqnumans"];

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

		base.setTitle("美術館","Akari (Light Up)");
		base.setExpression("　マウスで光源と白マス確定マスが入力できます。",
						   " Click to input Akari (Light source) or determined white cells.");
		base.setFloatbgcolor("rgb(32, 32, 32)");
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
			this.firstPos = new Pos(x,y);

			if(k.mode==3) this.inputcell(x,y);
			else if(k.mode==1){
				if(!kp.enabled()){ this.inputqnum(x,y,4);}
				else{ kp.display(x,y);}
			}
		};
		mv.mouseup = function(x,y){ };
		mv.mousemove = function(x,y){
			if(k.mode==3 && this.btn.Right) this.inputcell(x,y);
		};
		mv.paintAkari = function(id){
			if(!uuCanvas.already()){ return;}
			var d = puz.cellRange(id);
			pc.paint(d.x1,bd.cell[id].cy,d.x2,bd.cell[id].cy);
			pc.paint(bd.cell[id].cx,d.y1,bd.cell[id].cx,d.y2);
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(k.mode==3){ return;}
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum(ca,4);
		};

		if(k.callmode == "pmake"){
			kp.generate(2, true, false, '');
			kp.kpinput = function(ca){
				kc.key_inputqnum(ca,4);
			};
		}
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.BDlinecolor = "rgb(127, 127, 127)";
		pc.fontcolor = "white";
		pc.fontErrcolor = "white";
		pc.bcolor1 = "rgb(224, 255, 127)";
		pc.errbcolor1 = "rgb(255, 127, 127)";
		pc.dotcolor = "rgb(255, 63, 191)";

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);
		//	this.flushCanvasAll();

			this.drawLightCells(x1,y1,x2,y2);

			this.drawBDline(x1,y1,x2,y2);

			this.drawBCells(x1,y1,x2,y2);

			this.drawAkari(x1,y1,x2,y2);
			this.drawDots(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);

			if(k.mode==1){ this.drawTCell(x1,y1,x2+1,y2+1);}else{ this.hideTCell();}
		};

		pc.drawAkari = function(x1,y1,x2,y2){
			var rsize = k.cwidth*0.40;
			var ksize = k.cwidth*0.15;

			var clist = this.cellinside(x1,y1,x2,y2,f_true);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				if(bd.getQansCell(c)==1){
					if(bd.getErrorCell(c)!=4){ g.fillStyle = "rgb(0, 127, 96)";}
					else{ g.fillStyle = this.errcolor1;}
					g.beginPath();
					g.arc(bd.cell[c].px()+int(k.cwidth/2), bd.cell[c].py()+int(k.cheight/2), rsize, 0, Math.PI*2, false);
					if(this.vnop("c"+c+"_AK_",1)){ g.fill();}
				}
				else{ this.vhide("c"+c+"_AK_");}
			}
			this.vinc();
		};

		pc.drawLightCells = function(x1,y1,x2,y2){
			var clist = this.cellinside(x1,y1,x2,y2,function(c){ return (bd.getQnumCell(c)==-1);});
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				if(bd.getErrorCell(c)==1 || puz.isShined(c)){
					if(bd.getErrorCell(c)==1){ g.fillStyle = this.errbcolor1;}
					else                     { g.fillStyle = this.bcolor1;}
					if(this.vnop("c"+c+"_full_",1)){ g.fillRect(bd.cell[c].px(), bd.cell[c].py(), k.cwidth, k.cheight);}
				}
				else{ this.vhide("c"+c+"_full_");}
			}
			this.vinc();
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
			if(ca == "5")     { bd.setQnumCell(c, -2);}
			else if(ca != "."){ bd.setQnumCell(c, parseInt(ca));}
		},bstr.split("/"));
		return "";
	},

	pzloutput : function(type){
		if(type==0)     { document.urloutput.ta.value = enc.getURLbase()+"?"+k.puzzleid+this.pzldata();}
		else if(type==1){ document.urloutput.ta.value = enc.getDocbase()+k.puzzleid+"/sa/m.html?c"+this.pzldata();}
		else if(type==2){ document.urloutput.ta.value = enc.kanpenbase()+"bijutsukan.html?problem="+this.pzldataKanpen();}
		else if(type==3){ document.urloutput.ta.value = enc.getURLbase()+"?m+"+k.puzzleid+this.pzldata();}
	},
	pzldata : function(){
		return "/"+k.qcols+"/"+k.qrows+"/"+enc.encode4(bd.getQnumCell.bind(bd), k.qcols*k.qrows);
	},
	pzldataKanpen : function(){
		return ""+k.qrows+"/"+k.qcols+"/"+fio.encodeCell( function(c){
			if     (bd.getQnumCell(c)>=0) { return (bd.getQnumCell(c).toString() + "_");}
			else if(bd.getQnumCell(c)==-2){ return "5_";}
			else                          { return "._";}
		});
	},

	//---------------------------------------------------------
	kanpenOpen : function(array){
		fio.decodeCell( function(c,ca){
			if(ca == "5")     { bd.setQnumCell(c, -2);}
			else if(ca == "+"){ bd.setQansCell(c, 1);}
			else if(ca == "*"){ bd.setQsubCell(c, 1);}
			else if(ca != "."){ bd.setQnumCell(c, parseInt(ca));}
		},array.slice(0,k.qrows));
	},
	kanpenSave : function(){
		return ""+fio.encodeCell( function(c){
			if     (bd.getQnumCell(c)>=0) { return (bd.getQnumCell(c).toString() + " ");}
			else if(bd.getQansCell(c)==1) { return "+ ";}
			else if(bd.getQsubCell(c)==1) { return "* ";}
			else if(bd.getQnumCell(c)==-2){ return "5 ";}
			else                          { return ". ";}
		});
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	check : function(){

		if( !this.checkQnumCell(function(cn,bcnt){ return (cn<bcnt);}) ){
			ans.setAlert('数字のまわりにある照明の数が間違っています。','The number of Akari around the number is big.'); return false;
		}

		if( !this.checkRowsCols() ){
			ans.setAlert('照明に別の照明の光が当たっています。','Akari is shined from another Akari.'); return false;
		}

		if( !this.checkQnumCell(function(cn,bcnt){ return (cn>bcnt);}) ){
			ans.setAlert('数字のまわりにある照明の数が間違っています。','The number of Akari around the number is small.'); return false;
		}

		if( !this.checkShinedCell() ){
			ans.setAlert('照明に照らされていないセルがあります。','A cell is not shined.'); return false;
		}

		return true;
	},

	checkQnumCell : function(func){	//func(crn,bcnt){} -> エラーならfalseを返す関数にする
		for(var c=0;c<bd.cell.length;c++){
			if(bd.getQnumCell(c)>=0 && func( bd.getQnumCell(c), ans.checkdir4Cell(c,function(a){ return (bd.getQansCell(a)==1);}))){
				bd.setErrorCell([c],1);
				return false;
			}
		}
		return true;
	},

	checkShinedCell : function(){
		for(var c=0;c<bd.cell.length;c++){
			if(bd.getQnumCell(c)==-1 && !this.isShined(c)){
				bd.setErrorCell([c],1);
				return false;
			}
		}
		return true;
	},

	isShined : function(cc){
		if(bd.getQnumCell(cc)!=-1){ return false;}

		var d = this.cellRange(cc);

		var tx, ty;
		for(tx=d.x1;tx<=d.x2;tx++){ if(bd.getQansCell(bd.getcnum(tx,bd.cell[cc].cy))==1){ return true;} }
		for(ty=d.y1;ty<=d.y2;ty++){ if(bd.getQansCell(bd.getcnum(bd.cell[cc].cx,ty))==1){ return true;} }

		return false;
	},
	cellRange : function(cc){
		var d = {x1:0,y1:0,x2:k.qcols-1,y2:k.qrows-1};

		var tx, ty;
		tx = bd.cell[cc].cx-1; ty = bd.cell[cc].cy;
		while(tx>=0)     { if(bd.getQnumCell(bd.getcnum(tx,ty))!=-1){ d.x1=tx+1; break;} tx--; }
		tx = bd.cell[cc].cx+1; ty = bd.cell[cc].cy;
		while(tx<k.qcols){ if(bd.getQnumCell(bd.getcnum(tx,ty))!=-1){ d.x2=tx-1; break;} tx++; }
		tx = bd.cell[cc].cx; ty = bd.cell[cc].cy-1;
		while(ty>=0)     { if(bd.getQnumCell(bd.getcnum(tx,ty))!=-1){ d.y1=ty+1; break;} ty--; }
		tx = bd.cell[cc].cx; ty = bd.cell[cc].cy+1;
		while(ty<k.qrows){ if(bd.getQnumCell(bd.getcnum(tx,ty))!=-1){ d.y2=ty-1; break;} ty++; }

		return d;
	},

	checkRowsCols : function(){
		var cx, cy, fx, fy, cnt;

		for(cy=0;cy<k.qrows;cy++){
			cnt=0;
			for(cx=0;cx<k.qcols;cx++){
				if     ( bd.getQnumCell(bd.getcnum(cx,cy))!=-1){ cnt=0;}
				else if( bd.getQansCell(bd.getcnum(cx,cy))==1 ){ cnt++; if(cnt==1){ fx=cx;} }

				if( cnt>=2 ){
					for(cx=fx;cx<k.qcols;cx++){
						var cc = bd.getcnum(cx,cy);
						if( bd.getQnumCell(cc)!=-1 ){ break;}
						else if( bd.getQansCell(cc)==1 ){ bd.setErrorCell([cc],4);}
					}
					return false;
				}
			}
		}
		for(cx=0;cx<k.qcols;cx++){
			cnt=0;
			for(cy=0;cy<k.qrows;cy++){
				if     ( bd.getQnumCell(bd.getcnum(cx,cy))!=-1){ cnt=0;}
				else if( bd.getQansCell(bd.getcnum(cx,cy))==1 ){ cnt++; if(cnt==1){ fy=cy;} }

				if( cnt>=2 ){
					for(cy=fy;cy<k.qrows;cy++){
						var cc = bd.getcnum(cx,cy);
						if( bd.getQnumCell(cc)!=-1 ){ break;}
						else if( bd.getQansCell(cc)==1 ){ bd.setErrorCell([cc],4);}
					}
					return false;
				}
			}
		}

		return true;
	}
};
