//
// パズル固有スクリプト部 シャカシャカ版 shakashaka.js v3.1.9p3
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
	k.isKanpenExist = 0;	// 1:pencilbox/カンペンにあるパズル

	k.fstruct = ["cellqnumb","cellqanssub"];

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
	postfix : function(){
		menu.ex.adjustSpecial = this.adjustSpecial;
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
			if(bd.getQnumCell(cc)!=-1){ return;}

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

					bd.setQansCell(cc, (bd.getQansCell(cc)!=this.inputData?this.inputData:-1));
					bd.setQsubCell(cc, 0);
				}
				else if(this.btn.Right){
					bd.setQansCell(cc, -1);
					bd.setQsubCell(cc, (bd.getQsubCell(cc)==0?1:0));
				}
			}
			else if(k.use==2){
				if(flag==0){
					var moves = 12;
					if(x-this.firstPos.x <= -moves){
						if(y-this.firstPos.y >= moves){       if(bd.getQansCell(cc)!=2){ bd.setQansCell(cc,2);}else{ bd.setQansCell(cc,-1);} bd.setQsubCell(cc,0); this.mousereset();}
						else if(y-this.firstPos.y <= -moves){ if(bd.getQansCell(cc)!=5){ bd.setQansCell(cc,5);}else{ bd.setQansCell(cc,-1);} bd.setQsubCell(cc,0); this.mousereset();}
					}
					else if(x-this.firstPos.x >= moves){
						if(y-this.firstPos.y >= moves){       if(bd.getQansCell(cc)!=3){ bd.setQansCell(cc,3);}else{ bd.setQansCell(cc,-1);} bd.setQsubCell(cc,0); this.mousereset();}
						else if(y-this.firstPos.y <= -moves){ if(bd.getQansCell(cc)!=4){ bd.setQansCell(cc,4);}else{ bd.setQansCell(cc,-1);} bd.setQsubCell(cc,0); this.mousereset();}
					}
				}
				else if(flag==1){
					if(Math.abs(x-this.firstPos.x) <= 3 && Math.abs(y-this.firstPos.y) <= 3){
						if(bd.getQsubCell(cc)==1){ bd.setQansCell(cc,-1); bd.setQsubCell(cc,0);}
						else{ bd.setQansCell(cc,-1); bd.setQsubCell(cc,1);}
					}
				}
			}
			else if(k.use==3){
				if(this.btn.Left){
					if(bd.getQsubCell(cc)==1){ bd.setQansCell(cc,-1); bd.setQsubCell(cc,0);}
					else if(bd.getQansCell(cc)==-1){ bd.setQansCell(cc,2); bd.setQsubCell(cc,0);}
					else if(bd.getQansCell(cc)==5){ bd.setQansCell(cc,-1); bd.setQsubCell(cc,1);}
					else{ bd.setQansCell(cc,bd.getQansCell(cc)+1); bd.setQsubCell(cc,0);}
				}
				else if(this.btn.Right){
					if(bd.getQsubCell(cc)==1){ bd.setQansCell(cc,5); bd.setQsubCell(cc,0);}
					else if(bd.getQansCell(cc)==-1){ bd.setQansCell(cc,-1); bd.setQsubCell(cc,1);}
					else if(bd.getQansCell(cc)==2){ bd.setQansCell(cc,-1); bd.setQsubCell(cc,0);}
					else{ bd.setQansCell(cc,bd.getQansCell(cc)-1); bd.setQsubCell(cc,0);}
				}
			}

			this.mouseCell = cc;

			pc.paint(bd.cell[cc].cx, bd.cell[cc].cy, bd.cell[cc].cx, bd.cell[cc].cy);
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

	adjustSpecial : function(type,key){
		um.disableRecord();
		switch(type){
		case 1: // 上下反転
			for(var cc=0;cc<bd.cell.length;cc++){
				var val = {2:5,3:4,4:3,5:2}[bd.getQansCell(c)];
				if(!isNaN(val)){ bd.cell[c].qans = val;}
			}
			break;
		case 2: // 左右反転
			for(var cc=0;cc<bd.cell.length;cc++){
				var val = {2:3,3:2,4:5,5:4}[bd.getQansCell(c)];
				if(!isNaN(val)){ bd.cell[c].qans = val;}
			}
			break;
		case 3: // 右90°反転
			for(var cc=0;cc<bd.cell.length;cc++){
				var val = {2:3,3:4,4:5,5:2}[bd.getQansCell(c)];
				if(!isNaN(val)){ bd.cell[c].qans = val;}
			}
			break;
		case 4: // 左90°反転
			for(var cc=0;cc<bd.cell.length;cc++){
				var val = {2:5,3:2,4:3,5:4}[bd.getQansCell(c)];
				if(!isNaN(val)){ bd.cell[c].qans = val;}
			}
			break;
		case 5: // 盤面拡大
			break;
		case 6: // 盤面縮小
			break;
		}
		um.enableRecord();
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.BDlinecolor = "rgb(127, 127, 127)";

		pc.fontcolor = "white";
		pc.fontErrcolor = "white";

		pc.paint = function(x1,y1,x2,y2){
			x2++; y2++;
			this.flushCanvas(x1,y1,x2,y2);
		//	this.flushCanvasAll();

			this.drawWhiteCells(x1,y1,x2,y2);

			this.drawBDline2(x1,y1,x2,y2);

			this.drawBCells(x1,y1,x2,y2);
			this.drawTriangle(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);

			if(k.mode==1){ this.drawTCell(x1,y1,x2+1,y2+1);}else{ this.hideTCell();}
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	pzlinput : function(type, bstr){
		bstr = enc.decode4(bstr, bd.setQnumCell.bind(bd), k.qcols*k.qrows);
	},
	pzloutput : function(type){
		if(type==0)     { document.urloutput.ta.value = enc.getURLbase()+"?"+k.puzzleid+this.pzldata();}
		else if(type==1){ document.urloutput.ta.value = enc.getDocbase()+k.puzzleid+"/sa/m.html?c"+this.pzldata();}
		else if(type==3){ document.urloutput.ta.value = enc.getURLbase()+"?m+"+k.puzzleid+this.pzldata();}
	},
	pzldata : function(){
		return "/"+k.qcols+"/"+k.qrows+"/"+enc.encode4(bd.getQnumCell.bind(bd), k.qcols*k.qrows);
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	check : function(){

		if( !this.checkQnumCell(function(num,bcnt){ return (num>=bcnt);}) ){
			ans.setAlert('数字のまわりにある黒い三角形の数が間違っています。','The number of triangles in four adjacent cells is bigger than it.'); return false;
		}

		if( !this.checkWhiteArea() ){
			ans.setAlert('白マスが長方形(正方形)ではありません。','A mass of white cells is not rectangle.'); return false;
		}

		if( !this.checkQnumCell(function(num,bcnt){ return (num<=bcnt);}) ){
			ans.setAlert('数字のまわりにある黒い三角形の数が間違っています。','The number of triangles in four adjacent cells is smaller than it.'); return false;
		}

		return true;
	},

	checkQnumCell : function(func){	//func(num,bcnt){} -> エラーならfalseを返す関数にする
		var i=0;
		var func2 = function(a){ return (bd.getQansCell(a)!=-1);};
		for(var c=0;c<bd.cell.length;c++){
			if(bd.getQnumCell(c)>=0 && !func(bd.getQnumCell(c), ans.checkdir4Cell(c,func2))){
				bd.setErrorCell([c],1);
				return false;
			}
		}
		return true;
	},

	checkWhiteArea : function(){
		var warea = this.searchWarea_slope();
		for(var id=1;id<=warea.max;id++){
			var d = ans.getSizeOfArea(warea,id,function(cc){ return (bd.getQansCell(cc)==-1);});
			if((d.x2-d.x1+1)*(d.y2-d.y1+1)!=d.cnt && !this.isAreaRect_slope(warea,id)){
				bd.setErrorCell(warea.room[id],1);
				return false;
			}
		}
		return true;
	},
	// ここに斜め領域判定用
	isAreaRect_slope : function(area,id){
		for(var i=0;i<area.room[id].length;i++){
			var c = area.room[id][i];
			var a = bd.getQansCell(c);
			if( ((a==4||a==5)^(bd.cell[c].up()==-1||area.check[bd.cell[c].up()]!=id)) ||
				((a==2||a==3)^(bd.cell[c].dn()==-1||area.check[bd.cell[c].dn()]!=id)) ||
				((a==2||a==5)^(bd.cell[c].lt()==-1||area.check[bd.cell[c].lt()]!=id)) ||
				((a==3||a==4)^(bd.cell[c].rt()==-1||area.check[bd.cell[c].rt()]!=id)) )
			{
				return false;
			}
		}
		return true;
	},

	searchWarea_slope : function(){
		var area = new AreaInfo();
		for(var c=0;c<bd.cell.length;c++){ area.check[c]=(bd.getQnumCell(c)==-1?0:-1);}
		for(var c=0;c<bd.cell.length;c++){ if(area.check[c]==0){ area.max++; area.room[area.max]=new Array(); this.sw0(area, c, area.max);} }
		return area;
	},
	sw0 : function(area,i,areaid){
		if(i==-1 || area.check[i]!=0){ return;}
		area.check[i] = areaid;
		area.room[areaid].push(i);
		var a = bd.getQansCell(i);
		var b1 = bd.getQansCell(bd.cell[i].up());
        var b2 = bd.getQansCell(bd.cell[i].dn());
        var b3 = bd.getQansCell(bd.cell[i].lt());
        var b4 = bd.getQansCell(bd.cell[i].rt());
		var cc;
		cc=bd.cell[i].up(); if( cc!=-1 && bd.getQnumCell(cc)==-1 && (a!=4 && a!=5) && (b1!=2 && b1!=3) ){ arguments.callee(area, cc, areaid);}
		cc=bd.cell[i].dn(); if( cc!=-1 && bd.getQnumCell(cc)==-1 && (a!=2 && a!=3) && (b2!=4 && b2!=5) ){ arguments.callee(area, cc, areaid);}
		cc=bd.cell[i].lt(); if( cc!=-1 && bd.getQnumCell(cc)==-1 && (a!=2 && a!=5) && (b3!=3 && b3!=4) ){ arguments.callee(area, cc, areaid);}
		cc=bd.cell[i].rt(); if( cc!=-1 && bd.getQnumCell(cc)==-1 && (a!=3 && a!=4) && (b4!=2 && b4!=5) ){ arguments.callee(area, cc, areaid);}
		return;
	}
};
