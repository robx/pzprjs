//
// パズル固有スクリプト部 ごきげんななめ版 gokigen.js v3.1.9p2
//

function setting(){
	// グローバル変数の初期設定
	if(!k.qcols){ k.qcols = 7;}	// 盤面の横幅
	if(!k.qrows){ k.qrows = 7;}	// 盤面の縦幅
	k.irowake = 0;			// 0:色分け設定無し 1:色分けしない 2:色分けする

	k.iscross      = 1;		// 1:Crossが操作可能なパズル
	k.isborder     = 0;		// 1:Border/Lineが操作可能なパズル
	k.isextendcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

	k.isoutsidecross  = 1;	// 1:外枠上にCrossの配置があるパズル
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
	k.NumberIsWhite = 0;	// 1:数字のあるマスが黒マスにならないパズル
	k.RBBlackCell   = 0;	// 1:連黒分断禁のパズル

	k.ispzprv3ONLY  = 0;	// 1:ぱずぷれv3にしかないパズル
	k.isKanpenExist = 0;	// 1:pencilbox/カンペンにあるパズル

	k.fstruct = ["crossnum","cellqanssub"];

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

		base.setTitle("ごきげんななめ","Gokigen-naname");
		base.setExpression("　マウスで斜線を入力できます。",
						   " Click to input slashes.");
		base.setFloatbgcolor("rgb(0, 127, 0)");
	},
	menufix : function(){
		menu.addUseToFlags();

		pp.addCheckToFlags('dispred','setting',false);
		pp.setMenuStr('dispred', '繋がりチェック', 'Continuous Check');
		pp.setLabel  ('dispred', '線のつながりをチェックする', 'Check countinuous slashes');
	},
	postfix : function(){
		menu.ex.adjustSpecial = this.adjustSpecial;

		$("#btnclear2").css("display",'none');

		tc.minx = 0;
		tc.miny = 0;
		tc.maxx = 2*k.qcols;
		tc.maxy = 2*k.qrows;
		tc.setTXC(0);
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(x,y){
			if(k.mode==3){
				if(!(kc.isZ ^ menu.getVal('dispred'))){ this.inputslash(x,y);}
				else{ this.dispBlue(x,y);}
			}
			else if(k.mode==1){
				if(!kp.enabled()){ this.inputcross(x,y);}
				else{ kp.display(x,y);}
			}
		};
		mv.mouseup = function(x,y){ };
		mv.mousemove = function(x,y){ };
		mv.dispBlue = function(x,y){
			var cc = this.cellid(new Pos(x,y));
			if(cc==-1 || bd.getQansCell(cc)==-1){ return;}

			var area = new AreaInfo();
			for(var i=0;i<bd.cross.length;i++){ area.check[i]=0;}

			var fc = bd.getxnum(bd.cell[cc].cx+(bd.getQansCell(cc)==1?0:1),bd.cell[cc].cy);
			puz.searchline(area, 0, fc);
			for(var c=0;c<bd.cell.length;c++){
				if(bd.getQansCell(c)==1 && area.check[bd.getxnum(bd.cell[c].cx  ,bd.cell[c].cy)]==1){ bd.setErrorCell([c],2);}
				if(bd.getQansCell(c)==2 && area.check[bd.getxnum(bd.cell[c].cx+1,bd.cell[c].cy)]==1){ bd.setErrorCell([c],2);}
			}

			ans.errDisp = true;
			pc.paintAll();
		};
		mv.inputslash = function(x,y){
			var cc = this.cellid(new Pos(x,y));
			if(cc==-1){ return;}

			if     (k.use==1){ bd.setQansCell(cc, (bd.getQansCell(cc)!=(this.btn.Left?1:2)?(this.btn.Left?1:2):-1));}
			else if(k.use==2){
				if(bd.getQansCell(cc)==-1){ bd.setQansCell(cc, (this.btn.Left?1:2));}
				else{ bd.setQansCell(cc, (this.btn.Left?{1:2,2:-1}:{1:-1,2:1})[bd.getQansCell(cc)]);}
			}

			pc.paint(bd.cell[cc].cx-1, bd.cell[cc].cy-1, bd.cell[cc].cx+1, bd.cell[cc].cy+1);
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(ca=='z' && !this.keyPressed){ this.isZ=true; return;}
			if(k.mode==3){ return;}
			if(this.moveTCross(ca)){ return;}
			this.key_inputcross(ca,4);
		};
		kc.keyup = function(ca){ if(ca=='z'){ this.isZ=false;} };

		kc.isZ = false;

		if(k.callmode == "pmake"){
			kp.generate(4, true, false, '');
			kp.ctl[1].target = "cross";
			kp.kpinput = function(ca){
				kc.key_inputcross(ca,4);
			};
		}
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.BDlinecolor = "rgb(160, 160, 160)";
		pc.errcolor1 = "red";

		pc.crosssize = 0.33;
		pc.chassisflag = false;

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);
		//	this.flushCanvasAll();

			this.drawErrorCells(x1,y1,x2,y2);

			this.drawBDline2(x1,y1,x2,y2);

			this.drawSlashes(x1,y1,x2,y2);

			this.drawCrosses(x1,y1,x2+1,y2+1);
			if(k.mode==1){ this.drawTCross(x1,y1,x2+1,y2+1);}else{ this.hideTCross();}
		};
		pc.drawErrorCells = function(x1,y1,x2,y2){
			var clist = this.cellinside(x1,y1,x2,y2,f_true);
			for(var i=0;i<clist.length;i++){
				var c=clist[i];
				if(bd.getQansCell(c)==-1 && bd.getErrorCell(c)==1){
					g.fillStyle = this.errbcolor1;
					if(this.vnop("c"+c+"_full_",1)){ g.fillRect(bd.cell[c].px(), bd.cell[c].py(), k.cwidth, k.cheight);}
				}
				else{ this.vhide("c"+c+"_full_");}
			}
			this.vinc();
		},
		pc.drawSlashes = function(x1,y1,x2,y2){
			var clist = this.cellinside(x1,y1,x2,y2,f_true);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];

				if(bd.getQansCell(c)!=-1){
					if     (bd.getErrorCell(c)==1){ g.strokeStyle = this.errcolor1;}
					else if(bd.getErrorCell(c)==2){ g.strokeStyle = this.errcolor2;}
					else                          { g.strokeStyle = this.Cellcolor;}

					g.lineWidth = (int(k.cwidth/8)>=2?int(k.cwidth/8):2);
					g.beginPath();
					if(bd.getQansCell(c)==1){
						g.moveTo(bd.cell[c].px()         , bd.cell[c].py()          );
						g.lineTo(bd.cell[c].px()+k.cwidth, bd.cell[c].py()+k.cheight);
						this.vhide("c"+c+"_sl2_");
					}
					else if(bd.getQansCell(c)==2){
						g.moveTo(bd.cell[c].px()+k.cwidth, bd.cell[c].py()          );
						g.lineTo(bd.cell[c].px()         , bd.cell[c].py()+k.cheight);
						this.vhide("c"+c+"_sl1_");
					}
					g.closePath();
					if(this.vnop("c"+c+"_sl"+bd.getQansCell(c)+"_",0)){ g.stroke();}
				}
				else{ this.vhide("c"+c+"_sl1_"); this.vhide("c"+c+"_sl2_");}
			}
			this.vinc();
		};
	},

	adjustSpecial : function(type,key){
		um.disableRecord();
		if(type>=1 && type<=4){ // 反転・回転全て
			for(var c=0;c<bd.cell.length;c++){ if(bd.getQansCell(c)!=0){ bd.setQansCell(c,{1:2,2:1}[bd.getQansCell(c)]); } }
		}
		um.enableRecord();
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	pzlinput : function(type, bstr){
		if((type==1 && enc.pzlflag.indexOf("c")>=0) || (type==0 && enc.pzlflag.indexOf("d")==-1)){
			bstr = enc.decode4(bstr, bd.setQnumCross.bind(bd), (k.qcols+1)*(k.qrows+1));
		}
		else{ bstr = enc.decodecross_old(bstr);}
	},
	pzloutput : function(type){
		if(type==0)     { document.urloutput.ta.value = enc.getURLbase()+"?"+k.puzzleid+this.pzldata();}
		else if(type==1){ document.urloutput.ta.value = enc.getDocbase()+k.puzzleid+"/sa/m.html?c"+this.pzldata();}
		else if(type==3){ document.urloutput.ta.value = enc.getURLbase()+"?m+"+k.puzzleid+this.pzldata();}
	},
	pzldata : function(){
		return "/"+k.qcols+"/"+k.qrows+"/"+enc.encode4(bd.getQnumCross.bind(bd), (k.qcols+1)*(k.qrows+1));
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	check : function(){

		if( !this.checkLoopLine() ){
			ans.setAlert('斜線で輪っかができています。', 'There is a loop consisted in some slashes.'); return false;
		}

		if( !this.checkQnumCross() ){
			ans.setAlert('数字に繋がる線の数が間違っています。', 'A number is not equal to count of lines that is connected to it.'); return false;
		}

		if( !ans.checkAllCell(function(c){ return (bd.getQansCell(c)==-1);}) ){
			ans.setAlert('斜線がないマスがあります。','There is a empty cell.'); return false;
		}

		return true;
	},

	scntCross : function(id){
		if(id==-1){ return -1;}
		var xx=bd.cross[id].cx, xy=bd.cross[id].cy;
		var cc, cnt=0;
		cc=bd.getcnum(xx-1,xy-1); if(cc!=-1 && bd.getQansCell(cc)==1){ cnt++;}
		cc=bd.getcnum(xx  ,xy-1); if(cc!=-1 && bd.getQansCell(cc)==2){ cnt++;}
		cc=bd.getcnum(xx-1,xy  ); if(cc!=-1 && bd.getQansCell(cc)==2){ cnt++;}
		cc=bd.getcnum(xx  ,xy  ); if(cc!=-1 && bd.getQansCell(cc)==1){ cnt++;}
		return cnt;
	},
	scntCross2 : function(id){
		if(id==-1){ return -1;}
		var xx=bd.cross[id].cx, xy=bd.cross[id].cy;
		var cc, cnt=0;
		cc=bd.getcnum(xx-1,xy-1); if(cc!=-1 && bd.getErrorCell(cc)==1 && bd.getQansCell(cc)==1){ cnt++;}
		cc=bd.getcnum(xx  ,xy-1); if(cc!=-1 && bd.getErrorCell(cc)==1 && bd.getQansCell(cc)==2){ cnt++;}
		cc=bd.getcnum(xx-1,xy  ); if(cc!=-1 && bd.getErrorCell(cc)==1 && bd.getQansCell(cc)==2){ cnt++;}
		cc=bd.getcnum(xx  ,xy  ); if(cc!=-1 && bd.getErrorCell(cc)==1 && bd.getQansCell(cc)==1){ cnt++;}
		return cnt;
	},

	checkLoopLine : function(){
		var area = new AreaInfo();
		for(var i=0;i<bd.cross.length;i++){ area.check[i]=0;}

		while(1){
			var fc=-1;
			for(var i=0;i<bd.cross.length;i++){ if(area.check[i]==0){ fc=i; break;}}
			if(fc==-1){ break;}

			if(!this.searchline(area, 0, fc)){
				for(var c=0;c<bd.cell.length;c++){
					if(bd.getQansCell(c)==1 && area.check[bd.getxnum(bd.cell[c].cx  ,bd.cell[c].cy)]==1){ bd.setErrorCell([c],1);}
					if(bd.getQansCell(c)==2 && area.check[bd.getxnum(bd.cell[c].cx+1,bd.cell[c].cy)]==1){ bd.setErrorCell([c],1);}
				}
				while(1){
					var endflag = true;
					var clist = pc.cellinside(0,0,k.qcols-1,k.qrows-1,function(c){ return (bd.getErrorCell(c)==1);});
					for(var i=0;i<clist.length;i++){
						var c = clist[i];
						var cc1, cc2, cx=bd.cell[c].cx, cy=bd.cell[c].cy;
						if     (bd.getQansCell(c)==1){ cc1=bd.getxnum(cx,cy  ); cc2=bd.getxnum(cx+1,cy+1);}
						else if(bd.getQansCell(c)==2){ cc1=bd.getxnum(cx,cy+1); cc2=bd.getxnum(cx+1,cy  );}
						if(this.scntCross2(cc1)==1 || this.scntCross2(cc2)==1){ bd.setErrorCell([c],0); endflag = false; break;}
					}
					if(endflag){ break;}
				}
				return false;
			}
			for(var c=0;c<bd.cross.length;c++){ if(area.check[c]==1){ area.check[c]=2;} }
		}
		return true;
	},
	searchline : function(area, dir, c){
		var check=true;
		var nc, tx=bd.cross[c].cx, ty=bd.cross[c].cy;
		area.check[c]=1;

		nc = bd.getxnum(tx-1,ty-1);
		if(nc!=-1 && dir!=4 && bd.getQansCell(bd.getcnum(tx-1,ty-1))==1 && (area.check[nc]!=0 || !arguments.callee(area,1,nc))){ check = false;}
		nc = bd.getxnum(tx-1,ty+1);
		if(nc!=-1 && dir!=3 && bd.getQansCell(bd.getcnum(tx-1,ty  ))==2 && (area.check[nc]!=0 || !arguments.callee(area,2,nc))){ check = false;}
		nc = bd.getxnum(tx+1,ty-1);
		if(nc!=-1 && dir!=2 && bd.getQansCell(bd.getcnum(tx  ,ty-1))==2 && (area.check[nc]!=0 || !arguments.callee(area,3,nc))){ check = false;}
		nc = bd.getxnum(tx+1,ty+1);
		if(nc!=-1 && dir!=1 && bd.getQansCell(bd.getcnum(tx  ,ty  ))==1 && (area.check[nc]!=0 || !arguments.callee(area,4,nc))){ check = false;}

		return check;
	},


	checkQnumCross : function(){
		for(var c=0;c<bd.cross.length;c++){
			if(bd.getQnumCross(c)>=0 && bd.getQnumCross(c)!=this.scntCross(c)){
				bd.setErrorCross([c],1);
				return false;
			}
		}
		return true;
	}
};
