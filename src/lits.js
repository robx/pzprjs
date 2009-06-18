//
// パズル固有スクリプト部 ＬＩＴＳ版 lits.js v3.1.9p2
//

function setting(){
	// グローバル変数の初期設定
	if(!k.qcols){ k.qcols = 10;}	// 盤面の横幅
	if(!k.qrows){ k.qrows = 10;}	// 盤面の縦幅
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
	k.isAnsNumber   = 0;	// 1:回答に数字を入力するパズル
	k.isArrowNumber = 0;	// 1:矢印つき数字を入力するパズル
	k.isOneNumber   = 0;	// 1:部屋の問題の数字が1つだけ入るパズル
	k.isDispNumUL   = 0;	// 1:数字をマス目の左上に表示するパズル(0はマスの中央)
	k.NumberWithMB  = 0;	// 1:回答の数字と○×が入るパズル

	k.BlackCell     = 1;	// 1:黒マスを入力するパズル
	k.NumberIsWhite = 0;	// 1:数字のあるマスが黒マスにならないパズル
	k.RBBlackCell   = 0;	// 1:連黒分断禁のパズル

	k.ispzprv3ONLY  = 0;	// 1:ぱずぷれv3にしかないパズル
	k.isKanpenExist = 1;	// 1:pencilbox/カンペンにあるパズル

	k.fstruct = ["arearoom","cellans"];

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

		base.setTitle("ＬＩＴＳ","LITS");
		base.setExpression("　左クリックで黒マスが、右クリックで白マス確定マスが入力できます。",
						   " Left Click to input black cells, Right Click to input determined white cells.");
		base.setFloatbgcolor("rgb(64, 64, 64)");
	},
	menufix : function(){
		menu.addUseToFlags();
		menu.addRedBlockToFlags();
	},
	postfix : function(){ },

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(x,y){
			if(kc.isZ ^ menu.getVal('dispred')){ this.dispRedLine(x,y); return;}
			if(k.mode==1) this.inputborder(x,y);
			else if(k.mode==3) this.inputcell(x,y);
		};
		mv.mouseup = function(x,y){ };
		mv.mousemove = function(x,y){
			if(k.mode==1) this.inputborder(x,y);
			else if(k.mode==3) this.inputcell(x,y);
		};

		// キーボード入力系
		kc.keyinput = function(ca){ if(ca=='z' && !this.keyPressed){ this.isZ=true; }};
		kc.keyup    = function(ca){ if(ca=='z'){ this.isZ=false;}};
		kc.isZ = false;
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.BDlinecolor = "rgb(48, 48, 48)";
		pc.Cellcolor = "rgb(96, 96, 96)";

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);
		//	this.flushCanvasAll();

			this.drawWhiteCells(x1,y1,x2,y2);
			this.drawBlackCells(x1,y1,x2,y2);

			this.drawBDline(x1,y1,x2,y2);

			this.drawBorders(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);

		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	pzlinput : function(type, bstr){
		if((type==1 && enc.pzlflag.indexOf("c")>=0) || (type==0 && enc.pzlflag.indexOf("d")==-1)){
			bstr = enc.decodeBorder(bstr);
		}
		else if(type==0 || type==1){ bstr = this.decodeLITS_old(bstr);}
		else if(type==2 && enc.pzlflag.indexOf("c")>=0){ bstr = enc.decodeBorder(bstr);}
		else if(type==2 && bstr.indexOf("/")>=0){ bstr = this.decodeKanpen(bstr);}
		else if(type==2){ bstr = this.decodeLITS_old(bstr);}
	},
	pzloutput : function(type){
		if(type==0)     { document.urloutput.ta.value = enc.getURLbase()+"?"+k.puzzleid+this.pzldata();}
		else if(type==1){ document.urloutput.ta.value = enc.getDocbase()+k.puzzleid+"/sa/m.html?c"+this.pzldata();}
		else if(type==2){ document.urloutput.ta.value = enc.kanpenbase()+"lits.html?pzpr=c"+this.pzldata();}
		else if(type==3){ document.urloutput.ta.value = enc.getURLbase()+"?m+"+k.puzzleid+this.pzldata();}
	},
	pzldata : function(){
		return "/"+k.qcols+"/"+k.qrows+"/"+enc.encodeBorder();
	},
	pzldataKanpen : function(){
		var rarea = ans.searchRarea();
		var bstr = "";
		for(var c=0;c<bd.cell.length;c++){
			bstr += (""+(rarea.check[c]-1)+"_");
			if((c+1)%k.qcols==0){ bstr += "/";}
		}
		return ""+k.qrows+"/"+k.qcols+"/"+rarea.max+"/"+bstr;
	},

	decodeKanpen : function(bstr){
		var array1 = bstr.split("/");
		array1.shift();
		var array = new Array();
		var i;
		for(i=0;i<array1.length;i++){
			var array2 = array1[i].split("_");
			var j;
			for(j=0;j<array2.length;j++){
				if(array2[j]!=""){ array.push(array2[j]);}
			}
		}
		this.decodeLITS(array);
		return "";
	},
	decodeLITS_old : function(bstr){
		var array = new Array();
		var i;
		for(i=0;i<bstr.length;i++){ array.push(bstr.charAt(i));}
		this.decodeLITS(array);
		return "";
	},
	decodeLITS : function(array){
		var id;
		for(id=0;id<bd.border.length;id++){
			var cc1 = bd.getcnum(int((bd.border[id].cx-(bd.border[id].cy%2))/2), int((bd.border[id].cy-(bd.border[id].cx%2))/2) );
			var cc2 = bd.getcnum(int((bd.border[id].cx+(bd.border[id].cy%2))/2), int((bd.border[id].cy+(bd.border[id].cx%2))/2) );

			if(cc1!=-1 && cc2!=-1 && array[cc1]!=array[cc2]){ bd.setQuesBorder(id,1);}
			else{ bd.setQuesBorder(id,0);}
		}
	},

	//---------------------------------------------------------
	kanpenOpen : function(array){
		var rmax = array.shift();
		var barray = array.slice(0,k.qrows);
		for(var i=0;i<barray.length;i++){ barray[i] = barray[i].replace(/ /g, "_");}
		this.decodeKanpen(""+rmax+"/"+barray.join("/"));
		fio.decodeCellAns(array.slice(k.qrows,2*k.qrows));
	},
	kanpenSave : function(){
		var barray = this.pzldataKanpen().split("/");
		barray.shift(); barray.shift();
		var rmax = barray.shift();
		for(var i=0;i<barray.length;i++){ barray[i] = barray[i].replace(/_/g, " ");}
		return rmax + "/" + barray.join("/") + fio.encodeCellAns()+"/";
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	check : function(){

		if( !ans.check2x2Block( function(id){ return (bd.getQansCell(id)==1);} ) ){
			ans.setAlert('2x2の黒マスのかたまりがあります。', 'There is a 2x2 block of black cells.'); return false;
		}

		var rarea = ans.searchRarea();
		if( !ans.checkBlackCellInArea(rarea, function(a){ return (a>4);}) ){
			ans.setAlert('５マス以上の黒マスがある部屋が存在します。', 'A room has five or more black cells.'); return false;
		}

		if( !ans.checkSeqBlocksInRoom(rarea) ){
			ans.setAlert('1つの部屋に入る黒マスが2つ以上に分裂しています。', 'Black cells are devided in one room.'); return false;
		}

		if( !this.checkTetromino(rarea) ){
			ans.setAlert('同じ形のテトロミノが接しています。', 'Some Tetrominos that are the same shape are Adjacent.'); return false;
		}

		if( !ans.linkBWarea( ans.searchBarea() ) ){
			ans.setAlert('黒マスが分断されています。', 'Black cells are not continued.'); return false;
		}

		if( !ans.checkBlackCellInArea(rarea, function(a){ return (a==0);}) ){
			ans.setAlert('黒マスがない部屋があります。', 'A room has no black cells.'); return false;
		}

		if( !ans.checkBlackCellInArea(rarea, function(a){ return (a<4);}) ){
			ans.setAlert('黒マスのカタマリが４マス未満の部屋があります。', 'A room has three or less black cells.'); return false;
		}

		return true;
	},

	checkTetromino : function(rarea){
		var tarea = new AreaInfo();
		for(var c=0;c<bd.cell.length;c++){ tarea.check[c]=-1;}
		for(var r=1;r<=rarea.max;r++){
			var bcells = new Array();
			var minid = k.qcols*k.qrows;
			for(var i=0;i<rarea.room[r].length;i++){ if(bd.getQansCell(rarea.room[r][i])==1){ bcells.push(rarea.room[r][i]);} }
			if(bcells.length==4){
				bcells.sort(function(a,b){ return a-b;});
				var cx0=bd.cell[bcells[0]].cx; var cy0=bd.cell[bcells[0]].cy; var value=0;
				for(var i=1;i<bcells.length;i++){ value += ((bd.cell[bcells[i]].cy-cy0)*10+(bd.cell[bcells[i]].cx-cx0));}
				switch(value){
					case 13: case 15: case 27: case 31: case 33: case 49: case 51:
						for(var i=0;i<bcells.length;i++){ tarea.check[bcells[i]]="L";} break;
					case 6: case 60:
						for(var i=0;i<bcells.length;i++){ tarea.check[bcells[i]]="I";} break;
					case 14: case 30: case 39: case 41:
						for(var i=0;i<bcells.length;i++){ tarea.check[bcells[i]]="T";} break;
					case 20: case 24: case 38: case 42:
						for(var i=0;i<bcells.length;i++){ tarea.check[bcells[i]]="S";} break;
				}
			}
		}
		var area = new AreaInfo();
		for(var c=0;c<bd.cell.length;c++){ area.check[c]=(tarea.check[c]!=-1?0:-1);}
		for(var c=0;c<bd.cell.length;c++){ if(area.check[c]==0){ area.max++; area.room[area.max]=new Array(); this.st0(area, c, area.max, tarea);} }
		for(var r=1;r<=area.max;r++){ if(area.room[r].length>4){ bd.setErrorCell(area.room[r],2); return false;} }
		return true;
	},
	st0 : function(area,c,id,tarea){
		if(c==-1 || area.check[c]!=0){ return;}
		area.check[c] = id;
		area.room[id].push(c);
		var func = function(cc){ return (cc!=-1 && tarea.check[c]==tarea.check[cc]);};
		if( func(bd.cell[c].up()) ){ arguments.callee(area, bd.cell[c].up(), id, tarea);}
		if( func(bd.cell[c].dn()) ){ arguments.callee(area, bd.cell[c].dn(), id, tarea);}
		if( func(bd.cell[c].lt()) ){ arguments.callee(area, bd.cell[c].lt(), id, tarea);}
		if( func(bd.cell[c].rt()) ){ arguments.callee(area, bd.cell[c].rt(), id, tarea);}
		return;
	}
};
