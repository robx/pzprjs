//
// パズル固有スクリプト部 シャカシャカ版 shakashaka.js v3.2.2
//
Puzzles.shakashaka = function(){ };
Puzzles.shakashaka.prototype = {
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
		k.isKanpenExist = 0;	// 1:pencilbox/カンペンにあるパズル

		k.fstruct = ["cellqnumb","cellqanssub"];

		//k.def_csize = 36;
		//k.def_psize = 24;
		//k.area = { bcell:0, wcell:0, number:0};	// areaオブジェクトで領域を生成する

		base.setTitle("シャカシャカ","ShakaShaka");
		base.setExpression("　\"クリックした位置\"ではマス目の角のほうをクリックすることで三角形が入力できます。<br>　\"ドラッグ入力\"では斜め4方向にドラッグして三角形を入力できます。",
						   " Click corner-side to input triangles if 'Position of Cell'.<br> Left Button Drag to skew-ward to input triangle if 'Drag Type'.");
		base.setFloatbgcolor("rgb(32, 32, 32)");
	},
	menufix : function(){
		pp.addUseToFlags('use','setting',1,[1,2,3]);
		pp.addUseChildrenToFlags('use','use');
		pp.setMenuStr('use', '三角形の入力方法', 'Input Triangle Type');
		pp.setLabel  ('use', '三角形の入力方法', 'Input Triangle Type');
		pp.setMenuStr('use_1', 'クリックした位置', 'Position of Cell');
		pp.setMenuStr('use_2', 'ドラッグ入力', 'Drag Type');
		pp.setMenuStr('use_3', '1ボタン', 'One Button');
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(x,y){
			this.firstPos = new Pos(x,y);

			if(k.mode==3) this.inputTriangle(x,y,0);
			if(k.mode==1){
				if(!kp.enabled()){ this.inputqnum(x,y,4);}
				else{ kp.display(x,y);}
			}
		};
		mv.mouseup = function(x,y){
			if(k.mode==3 && k.use==2 && this.notInputted()){
				this.inputTriangle(x,y,1);
			}
		};
		mv.mousemove = function(x,y){
			if(k.mode==3 && k.use==2 && this.firstPos.x != -1 && this.firstPos.y != -1){
				this.inputTriangle(x,y,0);
			}
		};
		mv.inputTriangle = function(x,y,flag){
			var cc = this.cellid( new Pos(x,y) );
			if(k.mode==3 && k.use==2){ cc = this.cellid( new Pos(this.firstPos.x,this.firstPos.y) );}

			if(cc==-1 || (k.use!=2 && cc==this.mouseCell)){ return;}
			if(bd.QnC(cc)!=-1){ return;}

			if(k.use==1){
				if(this.btn.Left){
					var xpos = x - k.p0.x-bd.cell[cc].cx*k.cwidth;
					var ypos = y - k.p0.y-bd.cell[cc].cy*k.cheight;
					if(xpos>0&&xpos<=k.cwidth/2){
						if(ypos>0&&ypos<=k.cheight/2){ this.inputData = 5;}
						else if(ypos>k.cheight/2){ this.inputData = 2;}
					}
					else if(xpos>k.cwidth/2){
						if(ypos>0&&ypos<=k.cheight/2){ this.inputData = 4;}
						else if(ypos>k.cheight/2){ this.inputData = 3;}
					}

					bd.sQaC(cc, (bd.QaC(cc)!=this.inputData?this.inputData:-1));
					bd.sQsC(cc, 0);
				}
				else if(this.btn.Right){
					bd.sQaC(cc, -1);
					bd.sQsC(cc, (bd.QsC(cc)==0?1:0));
				}
			}
			else if(k.use==2){
				if(flag==0){
					var moves = 12;
					if(x-this.firstPos.x <= -moves){
						if     (y-this.firstPos.y >=  moves){ bd.sQaC(cc,(bd.QaC(cc)!=2)?2:-1); bd.sQsC(cc,0); this.mousereset();}
						else if(y-this.firstPos.y <= -moves){ bd.sQaC(cc,(bd.QaC(cc)!=5)?5:-1); bd.sQsC(cc,0); this.mousereset();}
					}
					else if(x-this.firstPos.x >= moves){
						if     (y-this.firstPos.y >=  moves){ bd.sQaC(cc,(bd.QaC(cc)!=3)?3:-1); bd.sQsC(cc,0); this.mousereset();}
						else if(y-this.firstPos.y <= -moves){ bd.sQaC(cc,(bd.QaC(cc)!=4)?4:-1); bd.sQsC(cc,0); this.mousereset();}
					}
				}
				else if(flag==1){
					if(Math.abs(x-this.firstPos.x) <= 3 && Math.abs(y-this.firstPos.y) <= 3){
						if(bd.QsC(cc)==1){ bd.sQaC(cc,-1); bd.sQsC(cc,0);}
						else{ bd.sQaC(cc,-1); bd.sQsC(cc,1);}
					}
				}
			}
			else if(k.use==3){
				if(this.btn.Left){
					if(bd.QsC(cc)==1)      { bd.sQaC(cc,-1); bd.sQsC(cc,0);}
					else if(bd.QaC(cc)==-1){ bd.sQaC(cc, 2); bd.sQsC(cc,0);}
					else if(bd.QaC(cc)==5) { bd.sQaC(cc,-1); bd.sQsC(cc,1);}
					else{ bd.sQaC(cc,bd.QaC(cc)+1); bd.sQsC(cc,0);}
				}
				else if(this.btn.Right){
					if(bd.QsC(cc)==1)      { bd.sQaC(cc, 5); bd.sQsC(cc,0);}
					else if(bd.QaC(cc)==-1){ bd.sQaC(cc,-1); bd.sQsC(cc,1);}
					else if(bd.QaC(cc)==2) { bd.sQaC(cc,-1); bd.sQsC(cc,0);}
					else{ bd.sQaC(cc,bd.QaC(cc)-1); bd.sQsC(cc,0);}
				}
			}

			this.mouseCell = cc;

			pc.paintCell(cc);
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

		menu.ex.adjustSpecial = function(type,key){
			um.disableRecord();
			switch(type){
			case 1: // 上下反転
				for(var cc=0;cc<bd.cell.length;cc++){
					var val = {2:5,3:4,4:3,5:2}[bd.QaC(cc)];
					if(!isNaN(val)){ bd.cell[cc].qans = val;}
				}
				break;
			case 2: // 左右反転
				for(var cc=0;cc<bd.cell.length;cc++){
					var val = {2:3,3:2,4:5,5:4}[bd.QaC(cc)];
					if(!isNaN(val)){ bd.cell[cc].qans = val;}
				}
				break;
			case 3: // 右90°反転
				for(var cc=0;cc<bd.cell.length;cc++){
					var val = {2:5,3:2,4:3,5:4}[bd.QaC(cc)];
					if(!isNaN(val)){ bd.cell[cc].qans = val;}
				}
				break;
			case 4: // 左90°反転
				for(var cc=0;cc<bd.cell.length;cc++){
					var val = {2:3,3:4,4:5,5:2}[bd.QaC(cc)];
					if(!isNaN(val)){ bd.cell[cc].qans = val;}
				}
				break;
			case 5: // 盤面拡大
				break;
			case 6: // 盤面縮小
				break;
			}
			um.enableRecord();
		};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_LIGHT;
		pc.fontcolor = pc.fontErrcolor = "white";

		pc.paint = function(x1,y1,x2,y2){
			x2++; y2++;
			this.flushCanvas(x1,y1,x2,y2);
		//	this.flushCanvasAll();

			this.drawWhiteCells(x1,y1,x2,y2);

			this.drawDashedGrid(x1,y1,x2,y2);

			this.drawBCells(x1,y1,x2,y2);
			this.drawTriangle(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);

			if(k.mode==1){ this.drawTCell(x1,y1,x2+1,y2+1);}else{ this.hideTCell();}
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type, bstr){
			bstr = this.decode4(bstr, bd.sQnC.bind(bd), k.qcols*k.qrows);
		};
		enc.pzlexport = function(type){
			if(type==0)     { document.urloutput.ta.value = this.getURLbase()+"?"+k.puzzleid+this.pzldata();}
			else if(type==1){ document.urloutput.ta.value = this.getDocbase()+k.puzzleid+"/sa/m.html?c"+this.pzldata();}
			else if(type==3){ document.urloutput.ta.value = this.getURLbase()+"?m+"+k.puzzleid+this.pzldata();}
		};
		enc.pzldata = function(){
			return "/"+k.qcols+"/"+k.qrows+"/"+this.encode4(bd.QnC.bind(bd), k.qcols*k.qrows);
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			if( !this.checkAllCell(function(c){ return ( bd.QnC(c)>=0 && (bd.QnC(c)<ans.checkdir4Cell(c,ans.isTri)) );} ) ){
				this.setAlert('数字のまわりにある黒い三角形の数が間違っています。','The number of triangles in four adjacent cells is bigger than it.'); return false;
			}

			if( !this.checkWhiteArea() ){
				this.setAlert('白マスが長方形(正方形)ではありません。','A mass of white cells is not rectangle.'); return false;
			}

			if( !this.checkAllCell(function(c){ return ( bd.QnC(c)>=0 && (bd.QnC(c)>ans.checkdir4Cell(c,ans.isTri)) );} ) ){
				this.setAlert('数字のまわりにある黒い三角形の数が間違っています。','The number of triangles in four adjacent cells is smaller than it.'); return false;
			}

			return true;
		};
		ans.isTri = function(c){ return (bd.QaC(c)!=-1);};

		ans.checkWhiteArea = function(){
			var winfo = this.searchWarea_slope();
			for(var id=1;id<=winfo.max;id++){
				var d = this.getSizeOfClist(winfo.room[id].idlist,function(cc){ return (bd.QaC(cc)==-1);});
				if((d.x2-d.x1+1)*(d.y2-d.y1+1)!=d.cnt && !this.isAreaRect_slope(winfo,id)){
					bd.sErC(winfo.room[id].idlist,1);
					return false;
				}
			}
			return true;
		};
		// 斜め領域判定用
		ans.isAreaRect_slope = function(winfo,id){
			for(var i=0;i<winfo.room[id].idlist.length;i++){
				var c = winfo.room[id].idlist[i];
				var a = bd.QaC(c);
				if( ((a==4||a==5)^(bd.up(c)==-1||winfo.id[bd.up(c)]!=id)) ||
					((a==2||a==3)^(bd.dn(c)==-1||winfo.id[bd.dn(c)]!=id)) ||
					((a==2||a==5)^(bd.lt(c)==-1||winfo.id[bd.lt(c)]!=id)) ||
					((a==3||a==4)^(bd.rt(c)==-1||winfo.id[bd.rt(c)]!=id)) )
				{
					return false;
				}
			}
			return true;
		};

		ans.searchWarea_slope = function(){
			var winfo = new AreaInfo();
			for(var c=0;c<bd.cell.length;c++){ winfo.id[c]=(bd.QnC(c)==-1?0:-1);}
			for(var c=0;c<bd.cell.length;c++){
				if(winfo.id[c]!=0){ continue;}
				winfo.max++;
				winfo.room[winfo.max] = {idlist:[]};
				this.sw0(winfo, c, winfo.max);
			}
			return winfo;
		};
		ans.sw0 = function(winfo,i,areaid){
			winfo.id[i] = areaid;
			winfo.room[areaid].idlist.push(i);
			var a = bd.QaC(i), b1 = bd.QaC(bd.up(i)), b2 = bd.QaC(bd.dn(i)), b3 = bd.QaC(bd.lt(i)), b4 = bd.QaC(bd.rt(i));
			var cc;
			cc=bd.up(i); if( cc!=-1 && winfo.id[cc]==0 && (a!=4 && a!=5) && (b1!=2 && b1!=3) ){ this.sw0(winfo, cc, areaid);}
			cc=bd.dn(i); if( cc!=-1 && winfo.id[cc]==0 && (a!=2 && a!=3) && (b2!=4 && b2!=5) ){ this.sw0(winfo, cc, areaid);}
			cc=bd.lt(i); if( cc!=-1 && winfo.id[cc]==0 && (a!=2 && a!=5) && (b3!=3 && b3!=4) ){ this.sw0(winfo, cc, areaid);}
			cc=bd.rt(i); if( cc!=-1 && winfo.id[cc]==0 && (a!=3 && a!=4) && (b4!=2 && b4!=5) ){ this.sw0(winfo, cc, areaid);}
		};
	}
};
