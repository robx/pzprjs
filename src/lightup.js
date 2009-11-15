//
// パズル固有スクリプト部 美術館版 lightup.js v3.2.3
//
Puzzles.lightup = function(){ };
Puzzles.lightup.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}	// 盤面の横幅
		if(!k.qrows){ k.qrows = 10;}	// 盤面の縦幅
		k.irowake = 0;			// 0:色分け設定無し 1:色分けしない 2:色分けする

		k.iscross      = 0;		// 1:Crossが操作可能なパズル
		k.isborder     = 0;		// 1:Border/Lineが操作可能なパズル
		k.isextendcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

		k.isoutsidecross  = 0;	// 1:外枠上にCrossの配置があるパズル
		k.isoutsideborder = 0;	// 1:盤面の外枠上にborderのIDを用意する
		k.isLineCross     = 0;	// 1:線が交差するパズル
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
		//k.area = { bcell:0, wcell:0, number:0};	// areaオブジェクトで領域を生成する

		base.setTitle("美術館","Akari (Light Up)");
		base.setExpression("　マウスで光源と白マス確定マスが入力できます。",
						   " Click to input Akari (Light source) or determined white cells.");
		base.setFloatbgcolor("rgb(32, 32, 32)");
	},
	menufix : function(){
		menu.addUseToFlags();
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(k.playmode) this.inputcell();
			else if(k.editmode){
				if(!kp.enabled()){ this.inputqnum();}
				else{ kp.display();}
			}
		};
		mv.mouseup = function(){ };
		mv.mousemove = function(){
			if(k.playmode && this.btn.Right) this.inputcell();
		};
		mv.paintAkari = function(id){
			if(k.br.IE && !uuCanvas.already()){ return;}
			var d = ans.cellRange(id);
			pc.paint(d.x1,bd.cell[id].cy,d.x2,bd.cell[id].cy);
			pc.paint(bd.cell[id].cx,d.y1,bd.cell[id].cx,d.y2);
		};
		mv.enableInputHatena = true;

		// キーボード入力系
		kc.keyinput = function(ca){
			if(k.playmode){ return;}
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum(ca);
		};

		if(k.EDITOR){
			kp.generate(2, true, false, '');
			kp.kpinput = function(ca){
				kc.key_inputqnum(ca);
			};
		}

		bd.maxnum = 4;
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_LIGHT;
		pc.fontcolor = pc.fontErrcolor = "white";
		pc.dotcolor = "rgb(255, 63, 191)";

		pc.lightcolor = "rgb(224, 255, 127)";

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);
		//	this.flushCanvasAll();

			this.drawLightCells(x1,y1,x2,y2);

			this.drawGrid(x1,y1,x2,y2);

			this.drawBCells(x1,y1,x2,y2);

			this.drawAkari(x1,y1,x2,y2);
			this.drawDotCells(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);

			this.drawTarget(x1,y1,x2,y2);
		};

		pc.drawAkari = function(x1,y1,x2,y2){
			var rsize = k.cwidth*0.40;
			var ksize = k.cwidth*0.15;
			var lampcolor = "rgb(0, 127, 96)";
			var header = "c_AK_";

			var clist = this.cellinside(x1,y1,x2,y2);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				if(bd.cell[c].qans===1){
					g.fillStyle = (bd.cell[c].error!==4 ? lampcolor : this.errcolor1);
					if(this.vnop(header+c,1)){
						g.beginPath();
						g.arc(bd.cell[c].px+mf(k.cwidth/2), bd.cell[c].py+mf(k.cheight/2), rsize, 0, Math.PI*2, false);
						g.fill();
					}
				}
				else{ this.vhide(header+c);}
			}
			this.vinc();
		};

		pc.drawLightCells = function(x1,y1,x2,y2){
			var header = "c_full_";

			var clist = this.cellinside_cond(x1,y1,x2,y2,function(c){ return (bd.cell[c].qnum===-1);});
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				if(bd.cell[c].error===1 || ans.isShined(c)){
					g.fillStyle = (bd.cell[c].error===4 ? this.errbcolor1 : this.lightcolor);
					if(this.vnop(header+c,1)){
						g.fillRect(bd.cell[c].px, bd.cell[c].py, k.cwidth, k.cheight);
					}
				}
				else{ this.vhide(header+c);}
			}
			this.vinc();
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type, bstr){
			if(type==0||type==1){ bstr = this.decode4Cell(bstr);}
			else if(type==2)    { bstr = this.decodeKanpen(bstr); }
		};
		enc.pzlexport= function(type){
			if(type==0)     { document.urloutput.ta.value = this.getURLbase()+"?"+k.puzzleid+this.pzldata();}
			else if(type==1){ document.urloutput.ta.value = this.getDocbase()+k.puzzleid+"/sa/m.html?c"+this.pzldata();}
			else if(type==2){ document.urloutput.ta.value = this.kanpenbase()+"bijutsukan.html?problem="+this.pzldataKanpen();}
			else if(type==3){ document.urloutput.ta.value = this.getURLbase()+"?m+"+k.puzzleid+this.pzldata();}
		};
		enc.pzldata = function(){
			return "/"+k.qcols+"/"+k.qrows+"/"+this.encode4Cell();
		};

		enc.decodeKanpen = function(bstr){
			bstr = (bstr.split("_")).join(" ");
			fio.decodeCell( function(c,ca){
				if(ca == "5")     { bd.sQnC(c, -2);}
				else if(ca != "."){ bd.sQnC(c, parseInt(ca));}
			},bstr.split("/"));
			return "";
		};
		enc.pzldataKanpen = function(){
			return ""+k.qrows+"/"+k.qcols+"/"+fio.encodeCell( function(c){
				if     (bd.QnC(c)>=0) { return (bd.QnC(c).toString() + "_");}
				else if(bd.QnC(c)==-2){ return "5_";}
				else                  { return "._";}
			});
		};

		//---------------------------------------------------------
		fio.kanpenOpen = function(array){
			this.decodeCell( function(c,ca){
				if(ca == "5")     { bd.sQnC(c, -2);}
				else if(ca == "+"){ bd.sQaC(c, 1);}
				else if(ca == "*"){ bd.sQsC(c, 1);}
				else if(ca != "."){ bd.sQnC(c, parseInt(ca));}
			},array.slice(0,k.qrows));
		};
		fio.kanpenSave = function(){
			return ""+this.encodeCell( function(c){
				if     (bd.QnC(c)>=0) { return (bd.QnC(c).toString() + " ");}
				else if(bd.QaC(c)==1) { return "+ ";}
				else if(bd.QsC(c)==1) { return "* ";}
				else if(bd.QnC(c)==-2){ return "5 ";}
				else                  { return ". ";}
			});
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			if( !this.checkQnumCell(function(cn,bcnt){ return (cn<bcnt);}) ){
				this.setAlert('数字のまわりにある照明の数が間違っています。','The number of Akari around the number is big.'); return false;
			}

			if( !this.checkRowsCols() ){
				this.setAlert('照明に別の照明の光が当たっています。','Akari is shined from another Akari.'); return false;
			}

			if( !this.checkQnumCell(function(cn,bcnt){ return (cn>bcnt);}) ){
				this.setAlert('数字のまわりにある照明の数が間違っています。','The number of Akari around the number is small.'); return false;
			}

			if( !this.checkShinedCell() ){
				this.setAlert('照明に照らされていないセルがあります。','A cell is not shined.'); return false;
			}

			return true;
		};

		ans.checkQnumCell = function(func){	//func(crn,bcnt){} -> エラーならfalseを返す関数にする
			for(var c=0;c<bd.cellmax;c++){
				if(bd.QnC(c)>=0 && func( bd.QnC(c), this.checkdir4Cell(c,function(a){ return (bd.QaC(a)==1);}))){
					bd.sErC([c],1);
					return false;
				}
			}
			return true;
		};

		ans.checkShinedCell = function(){
			for(var c=0;c<bd.cellmax;c++){
				if(bd.QnC(c)==-1 && !this.isShined(c)){
					bd.sErC([c],1);
					return false;
				}
			}
			return true;
		};

		ans.isShined = function(cc){
			if(bd.QnC(cc)!=-1){ return false;}

			var d = this.cellRange(cc);
			for(var tx=d.x1;tx<=d.x2;tx++){ if(bd.QaC(bd.cnum(tx,bd.cell[cc].cy))==1){ return true;} }
			for(var ty=d.y1;ty<=d.y2;ty++){ if(bd.QaC(bd.cnum(bd.cell[cc].cx,ty))==1){ return true;} }

			return false;
		};
		ans.cellRange = function(cc){
			var d = {x1:0,y1:0,x2:k.qcols-1,y2:k.qrows-1};

			var tx, ty;
			tx = bd.cell[cc].cx-1; ty = bd.cell[cc].cy;
			while(tx>=0)     { if(bd.QnC(bd.cnum(tx,ty))!=-1){ d.x1=tx+1; break;} tx--; }
			tx = bd.cell[cc].cx+1; ty = bd.cell[cc].cy;
			while(tx<k.qcols){ if(bd.QnC(bd.cnum(tx,ty))!=-1){ d.x2=tx-1; break;} tx++; }
			tx = bd.cell[cc].cx; ty = bd.cell[cc].cy-1;
			while(ty>=0)     { if(bd.QnC(bd.cnum(tx,ty))!=-1){ d.y1=ty+1; break;} ty--; }
			tx = bd.cell[cc].cx; ty = bd.cell[cc].cy+1;
			while(ty<k.qrows){ if(bd.QnC(bd.cnum(tx,ty))!=-1){ d.y2=ty-1; break;} ty++; }

			return d;
		};

		ans.checkRowsCols = function(){
			var fx, fy;
			for(var cy=0;cy<k.qrows;cy++){
				var cnt=0;
				for(var cx=0;cx<k.qcols;cx++){
					if     ( bd.QnC(bd.cnum(cx,cy))!=-1){ cnt=0;}
					else if( bd.QaC(bd.cnum(cx,cy))==1 ){ cnt++; if(cnt==1){ fx=cx;} }

					if( cnt>=2 ){
						for(var cx=fx;cx<k.qcols;cx++){
							var cc = bd.cnum(cx,cy);
							if( bd.QnC(cc)!=-1 ){ break;}
							else if( bd.QaC(cc)==1 ){ bd.sErC([cc],4);}
						}
						return false;
					}
				}
			}
			for(var cx=0;cx<k.qcols;cx++){
				var cnt=0;
				for(var cy=0;cy<k.qrows;cy++){
					if     ( bd.QnC(bd.cnum(cx,cy))!=-1){ cnt=0;}
					else if( bd.QaC(bd.cnum(cx,cy))==1 ){ cnt++; if(cnt==1){ fy=cy;} }

					if( cnt>=2 ){
						for(var cy=fy;cy<k.qrows;cy++){
							var cc = bd.cnum(cx,cy);
							if( bd.QnC(cc)!=-1 ){ break;}
							else if( bd.QaC(cc)==1 ){ bd.sErC([cc],4);}
						}
						return false;
					}
				}
			}

			return true;
		};
	}
};
