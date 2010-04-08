//
// パズル固有スクリプト部 イチマガ/磁石イチマガ版 ichimaga.js v3.3.0
//
Puzzles.ichimaga = function(){ };
Puzzles.ichimaga.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}	// 盤面の横幅
		if(!k.qrows){ k.qrows = 10;}	// 盤面の縦幅
		k.irowake = 1;			// 0:色分け設定無し 1:色分けしない 2:色分けする

		k.iscross      = 0;		// 1:Crossが操作可能なパズル
		k.isborder     = 1;		// 1:Border/Lineが操作可能なパズル
		k.isextendcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

		k.isoutsidecross  = 0;	// 1:外枠上にCrossの配置があるパズル
		k.isoutsideborder = 0;	// 1:盤面の外枠上にborderのIDを用意する
		k.isLineCross     = 0;	// 1:線が交差するパズル
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

		//k.def_csize = 36;
		k.def_psize = 16;
		//k.area = { bcell:0, wcell:0, number:0};	// areaオブジェクトで領域を生成する

		base.setTitle("イチマガ/磁石イチマガ","Ichimaga / Magnetic Ichimaga");
		base.setExpression("　左ドラッグで線が、右ドラッグで補助記号が入力できます。",
						   " Left Button Drag to input lines, Right to input auxiliary marks.");
		base.setFloatbgcolor("rgb(0, 224, 0)");
	},
	menufix : function(){
		if(k.EDITOR){
			pp.addSelect('puztype','setting',1,[1,2,3], 'パズルの種類', 'Kind of the puzzle');
			pp.setLabel ('puztype', 'パズルの種類', 'Kind of the puzzle');

			pp.addChild('puztype_1', 'puztype', 'イチマガ', 'Ichimaga');
			pp.addChild('puztype_2', 'puztype', '磁石イチマガ', 'Magnetic Ichimaga');
			pp.addChild('puztype_3', 'puztype', '交差も', 'Crossing Ichimaga');
		}
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(k.editmode) this.inputqnum();
			else if(k.playmode){
				if(this.btn.Left) this.inputLine();
				else if(this.btn.Right) this.inputpeke();
			}
		};
		mv.mouseup = function(){ };
		mv.mousemove = function(){
			if(k.playmode){
				if(this.btn.Left) this.inputLine();
				else if(this.btn.Right) this.inputpeke();
			}
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(k.playmode){ return;}
			if(this.key_inputdirec(ca)){ return;}
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum(ca);
		};

		bd.maxnum = 4;
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_LIGHT;

		pc.fontErrcolor = pc.fontcolor;
		pc.fontsizeratio = 0.85;
		pc.circleratio = [0.38, 0.38];

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);
		//	this.flushCanvasAll();

			this.drawDashedCenterLines(x1,y1,x2,y2);
			this.drawLines(x1,y1,x2,y2);

			this.drawPekes(x1,y1,x2,y2,0);

			this.drawCirclesAtNumber(x1,y1,x2,y2);
			this.drawNumbers(x1,y1,x2,y2);

			this.drawTarget(x1,y1,x2,y2);
		};

		line.repaintParts = function(idlist){
			var cdata=[];
			for(var c=0;c<bd.cellmax;c++){ cdata[c]=false;}
			for(var i=0;i<idlist.length;i++){
				cdata[bd.border[idlist[i]].cellcc[0]] = true;
				cdata[bd.border[idlist[i]].cellcc[1]] = true;
			}
			for(var c=0;c<cdata.length;c++){
				if(cdata[c]){
					pc.drawCircle1AtNumber(c);
					pc.dispnumCell(c);
				}
			}
		};
		line.iscrossing = function(cc){ return (bd.QnC(cc)===-1);};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decode4Cell();

			if(k.EDITOR){
				if     (this.checkpflag("m")){ pp.setVal('puztype',2);}
				else if(this.checkpflag("x")){ pp.setVal('puztype',3);}
				else                         { pp.setVal('puztype',1);}
			}
			else{
				if     (this.checkpflag("m")){ base.setTitle("磁石イチマガ","Magnetic Ichimaga");}
				else if(this.checkpflag("x")){ base.setTitle("一回曲がって交差もするの","Crossing Ichimaga");}
				else                         { base.setTitle("イチマガ","Ichimaga");}
				document.title = base.gettitle();
				ee('title2').el.innerHTML = base.gettitle();
			}
		};
		enc.pzlexport = function(type){
			this.encode4Cell();

			this.outpflag = "";
			if     (pp.getVal('puztype')==2){ this.outpflag="m";}
			else if(pp.getVal('puztype')==3){ this.outpflag="x";}
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			var pzlflag = this.readLine();
			if(k.EDITOR){
				if     (pzlflag=="mag")  { pp.setVal('puztype',2);}
				else if(pzlflag=="cross"){ pp.setVal('puztype',3);}
				else                     { pp.setVal('puztype',1);}
			}
			else{
				if     (pzlflag=="mag")  { base.setTitle("磁石イチマガ","Magnetic Ichimaga");}
				else if(pzlflag=="cross"){ base.setTitle("一回曲がって交差もするの","Crossing Ichimaga");}
				else                     { base.setTitle("イチマガ","Ichimaga");}
				document.title = base.gettitle();
				ee('title2').el.innerHTML = base.gettitle();
			}

			this.decodeCellQnum();
			this.decodeBorderLine();
		};
		fio.encodeData = function(){
			this.datastr += ["/","def/","mag/","cross/"][pp.getVal('puztype')];
			this.encodeCellQnum();
			this.encodeBorderLine();
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			if( !this.checkLcntCell(3) ){
				this.setAlert('分岐している線があります。', 'There is a branch line.'); return false;
			}
			if( !this.iscross() && !this.checkLcntCell(4) ){
				this.setAlert('線が交差しています。', 'There is a crossing line.'); return false;
			}

			var errinfo = this.searchFireflies();
			if( !this.checkErrorFlag(errinfo,3) ){
				this.setAlert('同じ数字同士が線で繋がっています。', 'Same numbers are connected each other.'); return false;
			}
			if( !this.checkErrorFlag(errinfo,2) ){
				this.setAlert('線が2回以上曲がっています。', 'The number of curves is twice or more.'); return false;
			}

			this.performAsLine = true
			if( !this.checkConnectedLine() ){
				this.setAlert('線が全体で一つながりになっていません。', 'All lines and circles are not connected each other.'); return false;
			}

			if( !this.checkErrorFlag(errinfo,1) ){
				this.setAlert('線が途中で途切れています。', 'There is a dead-end line.'); return false;
			}

			if( !this.checkAllCell( function(c){ return bd.QnC(c)>0&&bd.QnC(c)!=line.lcntCell(c); } ) ){
				this.setAlert('○から出る線の本数が正しくありません。', 'The number is not equal to the number of lines out of the circle.'); return false;
			}

			if( !this.checkLcntCell(1) ){
				this.setAlert('線が途中で途切れています。', 'There is a dead-end line.'); return false;
			}

			if( !this.checkAllCell( function(c){ return bd.QnC(c)!=-1&&line.lcntCell(c)==0; } ) ){
				this.setAlert('○から線が出ていません。', 'There is a lonely circle.'); return false;
			}

			return true;
		};
		ans.check1st = function(){ return true;};
		ans.ismag    = function(){ return ((k.EDITOR&&pp.getVal('puztype')==2)||(k.PLAYER&&enc.checkpflag("m")));};
		ans.iscross  = function(){ return ((k.EDITOR&&pp.getVal('puztype')==3)||(k.PLAYER&&enc.checkpflag("x")));};
		ans.isnormal = function(){ return ((k.EDITOR&&pp.getVal('puztype')==1)||(k.PLAYER&&!enc.checkpflag("m")&&!enc.checkpflag("x")));};

		ans.checkLcntCell = function(val){
			if(line.ltotal[val]==0){ return true;}
			var result = true;
			for(var c=0;c<bd.cellmax;c++){
				if(bd.QnC(c)!==-1 || line.lcntCell(c)!==val){ continue;}

				if(this.inAutoCheck){ return false;}
				if(result){ bd.sErBAll(2);}
				this.setCellLineError(c,false);
				result = false;
			}
			return result;
		};

		ans.searchFireflies = function(){
			var errinfo = {data:[],check:[]};
			var visited = [];
			for(var i=0;i<bd.bdmax;i++){ errinfo.check[i]=0; visited[i]=0;}

			for(var c=0;c<bd.cellmax;c++){
				if(bd.QnC(c)==-1){ continue;}

				var bx=bd.cell[c].cx*2+1, by=bd.cell[c].cy*2+1;
				var dir4id = [bd.bnum(bx,by-1),bd.bnum(bx,by+1),bd.bnum(bx-1,by),bd.bnum(bx+1,by)];

				for(var a=0;a<4;a++){
					if(dir4id[a]==-1||!bd.isLine(dir4id[a])||visited[dir4id[a]]!=0){ continue;}

					var ccnt=0;	// curve count.
					var idlist = [];
					var dir=a+1;
					bx=bd.cell[c].cx*2+1, by=bd.cell[c].cy*2+1;
					while(1){
						switch(dir){ case 1: by--; break; case 2: by++; break; case 3: bx--; break; case 4: bx++; break;}
						if((bx+by)%2==0){
							var cc = bd.cnum(bx>>1,by>>1);
							if     (bd.QnC(cc)!=-1){ break;}
							else if(line.lcntCell(cc)==4){ }
							else if(dir!=1 && bd.isLine(bd.bnum(bx,by+1))){ if(dir!=2){ ccnt++;} dir=2;}
							else if(dir!=2 && bd.isLine(bd.bnum(bx,by-1))){ if(dir!=1){ ccnt++;} dir=1;}
							else if(dir!=3 && bd.isLine(bd.bnum(bx+1,by))){ if(dir!=4){ ccnt++;} dir=4;}
							else if(dir!=4 && bd.isLine(bd.bnum(bx-1,by))){ if(dir!=3){ ccnt++;} dir=3;}
						}
						else{
							var id = bd.bnum(bx,by);
							if(!bd.isLine(id)){ break;}
							visited[i]=1;
							idlist.push(id);
						}
					}

					for(var i=0;i<idlist.length;i++){ errinfo.check[idlist[i]]=2;}

					var cc = bd.cnum(bx>>1,by>>1);
					if(this.ismag() && bd.QnC(c)!=-2 && bd.QnC(c)==bd.QnC(cc)){
						errinfo.data.push({errflag:3,cells:[c,cc],idlist:idlist}); continue;
					}
					if(idlist.length>0 && (bx+by)%2==0 && bd.QnC(c)!=-2 && ccnt>1){
						errinfo.data.push({errflag:2,cells:[c,cc],idlist:idlist}); continue;
					}
					if(idlist.length>0 && (bx+by)%2==1){
						errinfo.data.push({errflag:1,cells:[c],idlist:idlist}); continue;
					}
				}
			}
			return errinfo;
		};
		ans.checkErrorFlag = function(errinfo, val){
			var result = true;
			for(var i=0,len=errinfo.data.length;i<len;i++){
				if(errinfo.data[i].errflag!=val){ continue;}

				if(this.inAutoCheck){ return false;}
				bd.sErC(errinfo.data[i].cells,1);
				if(result){ bd.sErBAll(2);}
				bd.sErB(errinfo.data[i].idlist,1);
				result = false;
			}
			return result;
		};

		ans.checkConnectedLine = function(){
			var lcnt=0;
			var visited = new AreaInfo();
			for(var id=0;id<bd.bdmax;id++){ if(bd.isLine(id)){ visited.id[id]=0; lcnt++;}else{ visited.id[id]=-1;} }
			var fc=-1;
			for(var c=0;c<bd.cellmax;c++){ if(bd.QnC(c)!=-1 && line.lcntCell(c)>0){ fc=c; break;} }
			if(fc==-1){ return true;}

			this.cl0(visited.id, bd.cell[fc].cx*2+1, bd.cell[fc].cy*2+1,0);
			var lcnt2=0, idlist=[];
			for(var id=0;id<bd.bdmax;id++){ if(visited.id[id]==1){ lcnt2++; idlist.push(id);} }

			if(lcnt!=lcnt2){
				bd.sErBAll(2);
				bd.sErB(idlist,1);
				return false;
			}
			return true;
		};
		ans.cl0 = function(check,bx,by,dir){
			while(1){
				switch(dir){ case 1: by--; break; case 2: by++; break; case 3: bx--; break; case 4: bx++; break;}
				if(!((bx+by)&1)){
					if(bd.QnC(bd.cnum(bx>>1,by>>1))!=-1){
						if(bd.isLine(bd.bnum(bx,by-1))){ this.cl0(check,bx,by,1);}
						if(bd.isLine(bd.bnum(bx,by+1))){ this.cl0(check,bx,by,2);}
						if(bd.isLine(bd.bnum(bx-1,by))){ this.cl0(check,bx,by,3);}
						if(bd.isLine(bd.bnum(bx+1,by))){ this.cl0(check,bx,by,4);}
						break;
					}
					else if(line.lcntCell(bd.cnum(bx>>1,by>>1))==4){ }
					else if(dir!=1 && bd.isLine(bd.bnum(bx,by+1))){ dir=2;}
					else if(dir!=2 && bd.isLine(bd.bnum(bx,by-1))){ dir=1;}
					else if(dir!=3 && bd.isLine(bd.bnum(bx+1,by))){ dir=4;}
					else if(dir!=4 && bd.isLine(bd.bnum(bx-1,by))){ dir=3;}
				}
				else{
					var id = bd.bnum(bx,by);
					if(check[id]>0 || !bd.isLine(id)){ break;}
					check[id]=1;
				}
			}
		};
	}
};
