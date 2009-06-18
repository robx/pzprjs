//
// パズル固有スクリプト部 へびいちご版 snakes.js v3.2.0
//
Puzzles.snakes = function(){ };
Puzzles.snakes.prototype = {
	setting : function(){
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
		k.isDispHatena  = 0;	// 1:qnumが-2のときに？を表示する
		k.isAnsNumber   = 1;	// 1:回答に数字を入力するパズル
		k.isArrowNumber = 1;	// 1:矢印つき数字を入力するパズル
		k.isOneNumber   = 0;	// 1:部屋の問題の数字が1つだけ入るパズル
		k.isDispNumUL   = 0;	// 1:数字をマス目の左上に表示するパズル(0はマスの中央)
		k.NumberWithMB  = 0;	// 1:回答の数字と○×が入るパズル

		k.BlackCell     = 0;	// 1:黒マスを入力するパズル
		k.NumberIsWhite = 0;	// 1:数字のあるマスが黒マスにならないパズル
		k.RBBlackCell   = 0;	// 1:連黒分断禁のパズル

		k.ispzprv3ONLY  = 0;	// 1:ぱずぷれv3にしかないパズル
		k.isKanpenExist = 0;	// 1:pencilbox/カンペンにあるパズル

		k.fstruct = ["celldirecnum","cellqanssub"];

		//k.def_csize = 36;
		//k.def_psize = 16;

		if(k.callmode=="pmake"){
			base.setExpression("　矢印は、マウスの左ドラッグか、SHIFT押しながら矢印キーで入力できます。",
							   " To input Arrows, Left Button Drag or Press arrow key with SHIFT key.");
		}
		else{
			base.setExpression("　左クリックで黒マスが、右クリックでへびのいないマスが入力できます。",
							   " Left Click or Press Keys to input numbers, Right Click to input determined snake not existing cells.");
		}
		base.setTitle("へびいちご","Hebi-Ichigo");
		base.setFloatbgcolor("rgb(0, 224, 0)");
	},
	menufix : function(){
		menu.addUseToFlags();
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(x,y){
			if(k.mode==1) this.inputdirec(x,y);
			else if(k.mode==3){
				if(!this.inputDot(x,y)){
					this.dragnumber(x,y);
				}
			}
		};
		mv.mouseup = function(x,y){
			if(this.notInputted()){
				if(k.mode==1) this.inputqnum(x,y,5);
				else if(k.mode==3) this.inputqnum_snakes(x,y,5);
			}
		};
		mv.mousemove = function(x,y){
			if(k.mode==1 && this.notInputted()) this.inputdirec(x,y);
			else if(k.mode==3){
				if(!this.inputDot(x,y)){
					this.dragnumber(x,y);
				}
			}
		};

		mv.inputqnum_snakes = function(x,y,max){
			var cc = this.cellid(new Pos(x,y));
			if(cc==-1){ return;}
			k.dispzero=0;
			cc = this.inputqnum3(cc,max);
			bd.sQsC(cc,0);
			k.dispzero=1;
			pc.paint(bd.cell[cc].cx-1, bd.cell[cc].cy-1, bd.cell[cc].cx, bd.cell[cc].cy);
		},
		mv.dragnumber = function(x,y){
			var cc = this.cellid(new Pos(x,y));
			if(cc==-1||cc==this.mouseCell){ return;}
			if(this.mouseCell==-1){
				this.inputData = bd.QaC(cc)!=-1?bd.QaC(cc):10;
				this.mouseCell = cc;
			}
			else if(bd.QnC(cc)==-1 && this.inputData>=1 && this.inputData<=5){
				if     (this.btn.Left ) this.inputData++;
				else if(this.btn.Right) this.inputData--;
				if(this.inputData>=1 && this.inputData<=5){
					bd.sDiC(cc, 0);
					bd.sQaC(cc, this.inputData); bd.sQsC(cc,0);
					this.mouseCell = cc;
					pc.paintCell(cc);
				}
			}
			else if(bd.QnC(cc)==-1 && this.inputData==10){
				bd.sQaC(cc, -1); bd.sQsC(cc,0);
				pc.paintCell(cc);
			}
		};
		mv.inputDot = function(x,y){
			var cc = this.cellid(new Pos(x,y));
			if(!this.btn.Right||cc==-1||cc==this.mouseCell||this.inputData>=0){ return false;}

			if(this.inputData==-1){
				if(bd.QaC(cc)==-1){
					this.inputData = bd.QsC(cc)!=1?-2:-3;
					return true;
				}
				else{ return false;}
			}
			else if(this.inputData!=-2 && this.inputData!=-3){ return false;}
			bd.sQaC(cc,-1); bd.sQsC(cc,(this.inputData==-2?1:0));
			pc.paintCell(cc);
			this.mouseCell = cc;
			return true;
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(k.mode==3){ return;}
			if(this.key_inputdirec(ca)){ return;}
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum(ca,5);
		};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.BDlinecolor = "rgb(127, 127, 127)";
		pc.dotcolor = "rgb(255, 96, 191)";

		pc.fontcolor = "white";
		pc.BCell_fontcolor = "white";
		pc.errbcolor2 = pc.errbcolor1;

		pc.paint = function(x1,y1,x2,y2){
			x1--; y1--; x2++; y2++;	// 跡が残ってしまう為
			this.flushCanvas(x1,y1,x2,y2);
		//	this.flushCanvasAll();

			this.drawErrorCells(x1,y1,x2,y2);
			this.drawDots(x1,y1,x2,y2);
			this.drawBDline2(x1,y1,x2,y2);

			this.Cellcolor = this.BorderQanscolor
			this.drawBorders_snake(x1,y1,x2,y2);

			this.Cellcolor = this.BorderQuescolor
			this.drawBCells_withoutNumber(x1-2,y1-2,x2+2,y2+2);
			this.drawArrowNumbers(x1-2,y1-2,x2+2,y2+2);

			this.drawChassis(x1,y1,x2,y2);

			if(k.mode==1){ this.drawTCell(x1,y1,x2+1,y2+1);}else{ this.hideTCell();}
		};

		// 境界線の描画
		pc.drawBorders_snake = function(x1,y1,x2,y2){
			var func  = function(c){ return (bd.QnC(c)==-1 && bd.QaC(c)>0);};
			var func2 = function(c1,c2){ return (bd.QaC(c1)>0 && bd.QaC(c2)>0 && (Math.abs(bd.QaC(c1)-bd.QaC(c2))!=1));};
			var clist = this.cellinside(x1-1,y1-1,x2+1,y2+1,f_true);
			g.fillStyle = this.BorderQanscolor;
			for(var i=0;i<clist.length;i++){
				var c = clist[i], rt=bd.rt(c), dn=bd.dn(c);
				var cx=bd.cell[c].cx, cy=bd.cell[c].cy;

				this.drawBorder1x(2*cx+2,2*cy+1,(rt!=-1&&((func(c)^func(rt))||func2(c,rt))));
				this.drawBorder1x(2*cx+1,2*cy+2,(dn!=-1&&((func(c)^func(dn))||func2(c,dn))));
			}
			this.vinc();
		};
		pc.drawBCells_withoutNumber = function(x1,y1,x2,y2){
			var clist = this.cellinside(x1,y1,x2,y2,f_true);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				if(bd.QnC(c)!=-1){
					if(bd.ErC(c)!=0){ g.fillStyle = this.errcolor1;}
					else{ g.fillStyle = this.Cellcolor;}
					if(this.vnop("c"+c+"_full_",1)){ g.fillRect(bd.cell[c].px(), bd.cell[c].py(), k.cwidth+1, k.cheight+1);}
				}
				else if(bd.ErC(c)==0){ this.vhide("c"+c+"_full_");}
			}
			this.vinc();
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type, bstr){
			if(type==0 || type==1){ bstr = this.decodeArrowNumber16(bstr);}
		};
		enc.pzlexport = function(type){
			if(type==0)     { document.urloutput.ta.value = this.getURLbase()+"?"+k.puzzleid+this.pzldata();}
			else if(type==1){ document.urloutput.ta.value = this.getDocbase()+k.puzzleid+"/sa/m.html?c"+this.pzldata();}
			else if(type==3){ document.urloutput.ta.value = this.getURLbase()+"?m+"+k.puzzleid+this.pzldata();}
		};
		enc.pzldata = function(){
			return "/"+k.qcols+"/"+k.qrows+"/"+this.encodeArrowNumber16();
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			var sarea = this.searchSarea();
			if( !this.checkAllArea(sarea, f_true, function(w,h,a){ return (a==5);} ) ){
				this.setAlert('大きさが５ではない蛇がいます。','The size of a snake is not five.'); return false;
			}

			if( !this.checkDifferentNumberInRoom(sarea) ){
				this.setAlert('同じ数字が入っています。','A Snake has same plural marks.'); return false;
			}

			if( !this.checkSideCell2(sarea) ){
				this.setAlert('別々の蛇が接しています。','Other snakes are adjacent.'); return false;
			}

			if( !this.checkArrowNumber() ){
				this.setAlert('矢印の方向にある数字が正しくありません。','The number in the direction of the arrow is not correct.'); return false;
			}

			if( !this.checkSnakesView(sarea) ){
				this.setAlert('蛇の視線の先に別の蛇がいます。','A snake can see another snake.'); return false;
			}

			return true;
		};
		ans.check1st = function(){ return true;};

		ans.searchSarea = function(){
			var area = new AreaInfo();
			var func = function(c,cc){ return (cc!=-1 && (Math.abs(bd.QaC(c)-bd.QaC(cc))==1)); };
			for(var c=0;c<bd.cell.length;c++){ area.check[c]=(bd.QaC(c)>0?0:-1);}
			for(var c=0;c<bd.cell.length;c++){ if(area.check[c]==0){ area.max++; area.room[area.max]=new Array(); this.ss0(func, area, c, area.max);} }
			return area;
		};
		ans.ss0 = function(func, area, c, areaid){
			if(area.check[c]!=0){ return;}
			area.check[c] = areaid;
			area.room[areaid].push(c);
			if( func(c, bd.up(c)) ){ this.ss0(func, area, bd.up(c), areaid);}
			if( func(c, bd.dn(c)) ){ this.ss0(func, area, bd.dn(c), areaid);}
			if( func(c, bd.lt(c)) ){ this.ss0(func, area, bd.lt(c), areaid);}
			if( func(c, bd.rt(c)) ){ this.ss0(func, area, bd.rt(c), areaid);}
			return;
		};

		ans.checkDifferentNumberInRoom = function(area){
			for(var r=1;r<=area.max;r++){
				var d = {1:0,2:0,3:0,4:0,5:0};
				for(var i=0;i<area.room[r].length;i++){
					var val = bd.QaC(area.room[r][i]);
					if(val==-1){ continue;}

					if(d[val]==0){ d[val]++;}
					else if(d[val]>0){ bd.sErC(area.room[r],1); return false;}
				}
			}
			return true;
		};
		ans.checkSideCell2 = function(area){
			var func = function(area,c1,c2){ return (area.check[c1]>0 && area.check[c2]>0 && area.check[c1]!=area.check[c2]);};
			for(var c=0;c<bd.cell.length;c++){
				if(bd.cell[c].cx<k.qcols-1 && func(area,c,c+1)){
					bd.sErC(area.room[area.check[c]].concat(area.room[area.check[c+1]]),1); return false;
				}
				if(bd.cell[c].cy<k.qrows-1 && func(area,c,c+k.qcols)){
					bd.sErC(area.room[area.check[c]].concat(area.room[area.check[c+k.qcols]]),1); return false;
				}
			}
			return true;
		};

		ans.checkArrowNumber = function(){
			var func = function(clist){
				var cc=bd.cnum(cx,cy); clist.push(cc);
				if(bd.QnC(cc)!=-1 || bd.QaC(cc)>0){ return false;}
				return true;
			};

			for(var c=0;c<bd.cell.length;c++){
				if(bd.QnC(c)<0 || bd.DiC(c)==0){ continue;}
				var cx = bd.cell[c].cx, cy = bd.cell[c].cy, dir = bd.DiC(c);
				var num=bd.QnC(c), clist=[c];
				if     (dir==1){ cy--; while(cy>=0     ){ if(!func(clist)){ break;} cy--;} }
				else if(dir==2){ cy++; while(cy<k.qrows){ if(!func(clist)){ break;} cy++;} }
				else if(dir==3){ cx--; while(cx>=0     ){ if(!func(clist)){ break;} cx--;} }
				else if(dir==4){ cx++; while(cx<k.qcols){ if(!func(clist)){ break;} cx++;} }

				if(num==0^(cx<0||cx>=k.qcols||cy<0||cy>=k.qcols||bd.QnC(bd.cnum(cx,cy))!=-1)){
					if(num>0){ bd.sErC(clist,2);}
					else{ bd.sErC([c,bd.cnum(cx,cy)],2);}
					return false;
				}
				else if(num>0 && bd.QaC(bd.cnum(cx,cy))!=num){
					bd.sErC([c,bd.cnum(cx,cy)],2);
					return false;
				}
			}
			return true;
		};
		ans.checkSnakesView = function(area){
			var func = function(clist){
				var cc=bd.cnum(cx,cy); clist.push(cc);
				if(bd.QnC(cc)!=-1 || bd.QaC(cc)>0){ return false;}
				return true;
			};

			for(var r=1;r<=area.max;r++){
				var c1=-1, dir=0;
				for(var i=0;i<area.room[r].length;i++){ if(bd.QaC(area.room[r][i])==1){c1=area.room[r][i]; break;}}
				if     (bd.QaC(bd.dn(c1))==2){ dir=1;}
				else if(bd.QaC(bd.up(c1))==2){ dir=2;}
				else if(bd.QaC(bd.rt(c1))==2){ dir=3;}
				else if(bd.QaC(bd.lt(c1))==2){ dir=4;}
				var cx = bd.cell[c1].cx, cy = bd.cell[c1].cy, clist=[c1];

				if     (dir==1){ cy--; while(cy>=0     ){ if(!func(clist)){ break;} cy--;} }
				else if(dir==2){ cy++; while(cy<k.qrows){ if(!func(clist)){ break;} cy++;} }
				else if(dir==3){ cx--; while(cx>=0     ){ if(!func(clist)){ break;} cx--;} }
				else if(dir==4){ cx++; while(cx<k.qcols){ if(!func(clist)){ break;} cx++;} }

				var c2 = bd.cnum(cx,cy), r2 = area.check[c2];
				if(bd.QaC(c2)>0 && bd.QnC(c2)==-1 && r2>0 && r!=r2){
					bd.sErC(clist,2);
					bd.sErC(area.room[r],2);
					bd.sErC(area.room[r2],2);
					return false;
				}
			}
			return true;
		};
	}
};
