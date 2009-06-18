//
// パズル固有スクリプト部 イチマガ/磁石イチマガ版 ichimaga.js v3.1.9p2
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
	k.isCenterLine    = 1;	// 1:マスの真ん中を通る線を回答として入力するパズル
	k.isborderAsLine  = 0;	// 1:境界線をlineとして扱う

	k.dispzero      = 0;	// 1:0を表示するかどうか
	k.isDispHatena  = 0;	// 1:qnumが-2のときに？を表示する
	k.isAnsNumber   = 0;	// 1:回答に数字を入力するパズル
	k.isArrowNumber = 0;	// 1:矢印つき数字を入力するパズル
	k.isOneNumber   = 0;	// 1:部屋の問題の数字が1つだけ入るパズル
	k.isDispNumUL   = 0;	// 1:数字をマス目の左上に表示するパズル(0はマスの中央)
	k.NumberWithMB  = 0;	// 1:回答の数字と○×が入るパズル

	k.BlackCell     = 0;	// 1:黒マスを入力するパズル
	k.NumberIsWhite = 0;	// 1:数字のあるマスが黒マスにならないパズル
	k.RBBlackCell   = 0;	// 1:連黒分断禁のパズル

	k.ispzprv3ONLY  = 1;	// 1:ぱずぷれv3にしかないパズル
	k.isKanpenExist = 0;	// 1:pencilbox/カンペンにあるパズル

	k.fstruct = ["cellqnum","borderline"];

	//k.def_csize = 36;
	k.def_psize = 16;
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

		base.setTitle("イチマガ/磁石イチマガ","Ichimaga / Magnetic Ichimaga");
		base.setExpression("　左ドラッグで線が、右ドラッグで補助記号が入力できます。",
						   " Left Button Drag to input lines, Right to input auxiliary marks.");
		base.setFloatbgcolor("rgb(0, 224, 0)");
	},
	menufix : function(){
		if(k.callmode=="pmake"){
			pp.addUseToFlags('puztype','setting',1,[1,2,3]);
			pp.addUseChildrenToFlags('puztype','puztype');
			pp.setMenuStr('puztype', 'パズルの種類', 'Kind of the puzzle');
			pp.setLabel  ('puztype', 'パズルの種類', 'Kind of the puzzle');
			pp.setMenuStr('puztype_1', 'イチマガ', 'Ichimaga');
			pp.setMenuStr('puztype_2', '磁石イチマガ', 'Magnetic Ichimaga');
			pp.setMenuStr('puztype_3', '交差も', 'Crossing Ichimaga');
		}
	},
	postfix : function(){ },

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(x,y){
			if(k.mode==1) this.inputqnum(x,y,4);
			else if(k.mode==3){
				if(this.btn.Left) this.inputLine(x,y);
				else if(this.btn.Right) this.inputpeke(x,y);
			}
		};
		mv.mouseup = function(x,y){ };
		mv.mousemove = function(x,y){
			if(k.mode==3){
				if(this.btn.Left) this.inputLine(x,y);
				else if(this.btn.Right) this.inputpeke(x,y);
			}
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(k.mode==3){ return;}
			if(this.key_inputdirec(ca)){ return;}
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum(ca,4);
		};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.BDlinecolor = "rgb(127, 127, 127)";
		pc.fontErrcolor = "black";
		pc.fontsizeratio = 0.85;

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);
		//	this.flushCanvasAll();

			this.drawDashLines(x1,y1,x2,y2);
			this.drawLines(x1,y1,x2,y2);

			this.drawPekes(x1,y1,x2,y2,0);

			this.drawNumCells_circle(x1,y1,x2,y2);

			if(k.mode==1){ this.drawTCell(x1,y1,x2+1,y2+1);}else{ this.hideTCell();}
		};

		pc.drawNumCells_circle = function(x1,y1,x2,y2){
			var rsize  = k.cwidth*0.40;
			var rsize2 = k.cwidth*0.36;

			var clist = this.cellinside(x1-2,y1-2,x2+2,y2+2,f_true);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				if(bd.getQnumCell(c)!=-1){
					var px=bd.cell[c].px()+int(k.cwidth/2), py=bd.cell[c].py()+int(k.cheight/2);

					g.fillStyle = this.Cellcolor;
					g.beginPath();
					g.arc(px, py, rsize , 0, Math.PI*2, false);
					if(this.vnop("c"+c+"_cira_",1)){ g.fill(); }

					if(bd.getErrorCell(c)==1){ g.fillStyle = this.errbcolor1;}
					else{ g.fillStyle = "white";}
					g.beginPath();
					g.arc(px, py, rsize2, 0, Math.PI*2, false);
					if(this.vnop("c"+c+"_cirb_",1)){ g.fill(); }
				}
				else{ this.vhide(["c"+c+"_cira_", "c"+c+"_cirb_"]);}

				this.dispnumCell_General(c);
			}
			this.vinc();
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	pzlinput : function(type, bstr){
		if(type==0 || type==1){ enc.decode4(bstr, bd.setQnumCell.bind(bd), k.qcols*k.qrows);}

		if(k.callmode=="pmake"){
			if     (enc.pzlflag.indexOf("m")>=0){ menu.setVal('puztype',2);}
			else if(enc.pzlflag.indexOf("x")>=0){ menu.setVal('puztype',3);}
			else                                { menu.setVal('puztype',1);}
		}
		else{
			if     (enc.pzlflag.indexOf("m")>=0){ base.setTitle("磁石イチマガ","Magnetic Ichimaga");}
			else if(enc.pzlflag.indexOf("x")>=0){ base.setTitle("一回曲がって交差もするの","Crossing Ichimaga");}
			else                                { base.setTitle("イチマガ","Ichimaga");}
			document.title = base.gettitle();
			$("#title2").html(base.gettitle());
		}
	},

	pzloutput : function(type){
		if(type==0)     { document.urloutput.ta.value = enc.getURLbase()+"?"+k.puzzleid+this.pzldata();}
		else if(type==1){ document.urloutput.ta.value = enc.getDocbase()+k.puzzleid+"/sa/m.html?c"+this.pzldata();}
		else if(type==3){ document.urloutput.ta.value = enc.getURLbase()+"?m+"+k.puzzleid+this.pzldata();}
	},
	pzldata : function(){
		var pzlflag="";
		if     (menu.getVal('puztype')==2){ pzlflag="/m";}
		else if(menu.getVal('puztype')==3){ pzlflag="/x";}

		return ""+pzlflag+"/"+k.qcols+"/"+k.qrows+"/"+enc.encode4(bd.getQnumCell.bind(bd), k.qcols*k.qrows);
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	check : function(){

		if( !this.checkLcntCell(3) ){
			ans.setAlert('分岐している線があります。', 'There is a branch line.'); return false;
		}
		if( !this.iscross() && !this.checkLcntCell(4) ){
			ans.setAlert('線が交差しています。', 'There is a crossing line.'); return false;
		}

		var saved = this.checkFireflies();
		if( !this.checkErrorFlag(saved,3) ){
			ans.setAlert('同じ数字同士が線で繋がっています。', 'Same numbers are connected each other.'); return false;
		}
		if( !this.checkErrorFlag(saved,2) ){
			ans.setAlert('線が2回以上曲がっています。', 'The number of curves is twice or more.'); return false;
		}

		ans.performAsLine = true
		if( !this.checkConnectedLine() ){
			ans.setAlert('線が全体で一つながりになっていません。', 'All lines and circles are not connected each other.'); return false;
		}

		if( !this.checkErrorFlag(saved,1) ){
			ans.setAlert('線が途中で途切れています。', 'There is a dead-end line.'); return false;
		}

		if( !ans.checkAllCell( function(c){ return bd.getQnumCell(c)>0&&bd.getQnumCell(c)!=ans.lcntCell(c); } ) ){
			ans.setAlert('○から出る線の本数が正しくありません。', 'The number is not equal to the number of lines out of the circle.'); return false;
		}

		if( !this.checkLcntCell(1) ){
			ans.setAlert('線が途中で途切れています。', 'There is a dead-end line.'); return false;
		}

		if( !ans.checkAllCell( function(c){ return bd.getQnumCell(c)!=-1&&ans.lcntCell(c)==0; } ) ){
			ans.setAlert('○から線が出ていません。', 'There is a lonely circle.'); return false;
		}

		return true;
	},
	check1st : function(){ return true;},
	ismag    : function(){ return ((k.callmode=="pmake"&&menu.getVal('puztype')==2)||(k.callmode=="pplay"&&enc.pzlflag.indexOf("m")>=0));},
	iscross  : function(){ return ((k.callmode=="pmake"&&menu.getVal('puztype')==3)||(k.callmode=="pplay"&&enc.pzlflag.indexOf("x")>=0));},
	isnormal : function(){ return ((k.callmode=="pmake"&&menu.getVal('puztype')==1)||(k.callmode=="pplay"&&enc.pzlflag.indexOf("m")<0&&enc.pzlflag.indexOf("x")<0));},

	checkLcntCell : function(val){
		if(ans.lcnts.total[val]==0){ return true;}
		for(var c=0;c<bd.cell.length;c++){
			if(bd.getQnumCell(c)==-1 && ans.lcnts.cell[c]==val){
				bd.setErrorBorder(bd.borders,2);
				ans.setCellLineError(c,false);
				return false;
			}
		}
		return true;
	},

	checkFireflies : function(){
		var saved = {errflag:0,cells:new Array(),idlist:new Array(),area:new AreaInfo()};
		var visited = new Array();
		for(var i=0;i<bd.border.length;i++){ saved.area.check[i]=0; visited[i]=0;}

		for(var c=0;c<bd.cell.length;c++){
			if(bd.getQnumCell(c)==-1){ continue;}

			var bx=bd.cell[c].cx*2+1, by=bd.cell[c].cy*2+1;
			var dir4id = [bd.getbnum(bx,by-1),bd.getbnum(bx,by+1),bd.getbnum(bx-1,by),bd.getbnum(bx+1,by)];

			for(var a=0;a<4;a++){
				if(dir4id[a]==-1||bd.getLineBorder(dir4id[a])!=1||visited[dir4id[a]]!=0){ continue;}

				var ccnt=0;	// curve count.
				var idlist = new Array();
				var dir=a+1;
				bx=bd.cell[c].cx*2+1, by=bd.cell[c].cy*2+1;
				while(1){
					switch(dir){ case 1: by--; break; case 2: by++; break; case 3: bx--; break; case 4: bx++; break;}
					if((bx+by)%2==0){
						var cc = bd.getcnum(int(bx/2),int(by/2));
						if     (bd.getQnumCell(cc)!=-1){ break;}
						else if(ans.lcntCell(cc)==4){ }
						else if(dir!=1 && bd.getLineBorder(bd.getbnum(bx,by+1))==1){ if(dir!=2){ ccnt++;} dir=2;}
						else if(dir!=2 && bd.getLineBorder(bd.getbnum(bx,by-1))==1){ if(dir!=1){ ccnt++;} dir=1;}
						else if(dir!=3 && bd.getLineBorder(bd.getbnum(bx+1,by))==1){ if(dir!=4){ ccnt++;} dir=4;}
						else if(dir!=4 && bd.getLineBorder(bd.getbnum(bx-1,by))==1){ if(dir!=3){ ccnt++;} dir=3;}
					}
					else{
						var id = bd.getbnum(bx,by);
						if(bd.getLineBorder(id)!=1){ break;}
						visited[i]=1;
						idlist.push(id);
					}
				}

				for(var i=0;i<idlist.length;i++){ saved.area.check[idlist[i]]=2;}

				var cc = bd.getcnum(int(bx/2),int(by/2));
				if(idlist.length>0 && (bx+by)%2==1 && saved.errflag==0){
					saved = {errflag:1,cells:[c],idlist:idlist,area:saved.area};
				}
				else if(idlist.length>0 && (bx+by)%2==0 && bd.getQnumCell(c)!=-2 && ccnt>1 && saved.errflag<=1){
					saved = {errflag:2,cells:[c,cc],idlist:idlist,area:saved.area};
					if(!this.ismag()){ return saved;}
				}
				else if(this.ismag() && bd.getQnumCell(c)!=-2 && bd.getQnumCell(c)==bd.getQnumCell(cc) && saved.errflag<=2 )
				{
					saved = {errflag:3,cells:[c,cc],idlist:idlist,area:saved.area};
					return saved;
				}
			}
		}
		return saved;
	},
	checkErrorFlag : function(saved, val){
		if(saved.errflag==val){
			bd.setErrorCell(saved.cells,1);
			bd.setErrorBorder(bd.borders,2);
			bd.setErrorBorder(saved.idlist,1);
			return false;
		}
		return true;
	},

	checkConnectedLine : function(){
		var lcnt=0;
		var visited = new AreaInfo();
		for(var id=0;id<bd.border.length;id++){ if(bd.getLineBorder(id)==1){ visited.check[id]=0; lcnt++;}else{ visited.check[id]=-1;} }
		var fc=-1;
		for(var c=0;c<bd.cell.length;c++){ if(bd.getQnumCell(c)!=-1 && ans.lcntCell(c)>0){ fc=c; break;} }
		if(fc==-1){ return true;}

		this.cl0(visited,bd.cell[fc].cx*2+1,bd.cell[fc].cy*2+1,0);
		var lcnt2=0, idlist=new Array();
		for(var id=0;id<bd.border.length;id++){ if(visited.check[id]==1){ lcnt2++; idlist.push(id);} }

		if(lcnt!=lcnt2){
			bd.setErrorBorder(bd.borders,2);
			bd.setErrorBorder(idlist,1);
			return false;
		}
		return true;
	},
	cl0 : function(area,bx,by,dir){
		while(1){
			switch(dir){ case 1: by--; break; case 2: by++; break; case 3: bx--; break; case 4: bx++; break;}
			if((bx+by)%2==0){
				if(bd.getQnumCell(bd.getcnum(int(bx/2),int(by/2)))!=-1){
					if(bd.getLineBorder(bd.getbnum(bx,by-1))==1){ this.cl0(area,bx,by,1);}
					if(bd.getLineBorder(bd.getbnum(bx,by+1))==1){ this.cl0(area,bx,by,2);}
					if(bd.getLineBorder(bd.getbnum(bx-1,by))==1){ this.cl0(area,bx,by,3);}
					if(bd.getLineBorder(bd.getbnum(bx+1,by))==1){ this.cl0(area,bx,by,4);}
					break;
				}
				else if(ans.lcntCell(bd.getcnum(int(bx/2),int(by/2)))==4){ }
				else if(dir!=1 && bd.getLineBorder(bd.getbnum(bx,by+1))==1){ dir=2;}
				else if(dir!=2 && bd.getLineBorder(bd.getbnum(bx,by-1))==1){ dir=1;}
				else if(dir!=3 && bd.getLineBorder(bd.getbnum(bx+1,by))==1){ dir=4;}
				else if(dir!=4 && bd.getLineBorder(bd.getbnum(bx-1,by))==1){ dir=3;}
			}
			else{
				var id = bd.getbnum(bx,by);
				if(area.check[id]>0 || bd.getLineBorder(id)!=1){ break;}
				area.check[id]=1;
			}
		}
	}
};
