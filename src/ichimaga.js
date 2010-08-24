//
// パズル固有スクリプト部 イチマガ/磁石イチマガ版 ichimaga.js v3.3.2
//
Puzzles.ichimaga = function(){ };
Puzzles.ichimaga.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}	// 盤面の横幅
		if(!k.qrows){ k.qrows = 10;}	// 盤面の縦幅
		k.irowake  = 1;		// 0:色分け設定無し 1:色分けしない 2:色分けする

		k.iscross  = 0;		// 1:盤面内側のCrossがあるパズル 2:外枠上を含めてCrossがあるパズル
		k.isborder = 1;		// 1:Border/Lineが操作可能なパズル 2:外枠上も操作可能なパズル
		k.isexcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

		k.isLineCross     = false;	// 線が交差するパズル
		k.isCenterLine    = true;	// マスの真ん中を通る線を回答として入力するパズル
		k.isborderAsLine  = false;	// 境界線をlineとして扱う
		k.hasroom         = false;	// いくつかの領域に分かれている/分けるパズル
		k.roomNumber      = false;	// 部屋の問題の数字が1つだけ入るパズル

		k.dispzero        = false;	// 0を表示するかどうか
		k.isDispHatena    = false;	// qnumが-2のときに？を表示する
		k.isAnsNumber     = false;	// 回答に数字を入力するパズル
		k.NumberWithMB    = false;	// 回答の数字と○×が入るパズル
		k.linkNumber      = false;	// 数字がひとつながりになるパズル

		k.BlackCell       = false;	// 黒マスを入力するパズル
		k.NumberIsWhite   = false;	// 数字のあるマスが黒マスにならないパズル
		k.RBBlackCell     = false;	// 連黒分断禁のパズル
		k.checkBlackCell  = false;	// 正答判定で黒マスの情報をチェックするパズル
		k.checkWhiteCell  = false;	// 正答判定で白マスの情報をチェックするパズル

		k.ispzprv3ONLY    = true;	// ぱずぷれアプレットには存在しないパズル
		k.isKanpenExist   = false;	// pencilbox/カンペンにあるパズル

		k.bdmargin       = 0.50;	// 枠外の一辺のmargin(セル数換算)
		k.bdmargin_image = 0.10;	// 画像出力時のbdmargin値

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
		mv.mouseup = function(){
			if(k.playmode && this.btn.Left && this.notInputted()){
				this.inputpeke();
			}
		};
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

		line.iscrossing = function(cc){ return bd.noNum(cc);};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_LIGHT;

		pc.fontErrcolor = pc.fontcolor;
		pc.fontsizeratio = 0.85;
		pc.circleratio = [0.38, 0.38];

		pc.paint = function(x1,y1,x2,y2){
			this.drawDashedCenterLines(x1,y1,x2,y2);
			this.drawLines(x1,y1,x2,y2);

			this.drawPekes(x1,y1,x2,y2,0);

			this.drawCirclesAtNumber(x1,y1,x2,y2);
			this.drawNumbers(x1,y1,x2,y2);

			this.drawTarget(x1,y1,x2,y2);
		};

		pc.repaintParts = function(idlist){
			var clist = line.getClistFromIdlist(idlist);
			for(var i=0;i<clist.length;i++){
				this.drawCircle1AtNumber(clist[i]);
				this.drawNumber1(clist[i]);
			}
		};
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
				_doc.title = base.gettitle();
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
				_doc.title = base.gettitle();
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

			if( !this.checkAllCell( function(c){ return bd.isValidNum(c) && bd.QnC(c)!==line.lcntCell(c); } ) ){
				this.setAlert('○から出る線の本数が正しくありません。', 'The number is not equal to the number of lines out of the circle.'); return false;
			}

			if( !this.checkLcntCell(1) ){
				this.setAlert('線が途中で途切れています。', 'There is a dead-end line.'); return false;
			}

			if( !this.checkAllCell( function(c){ return bd.isNum(c) && line.lcntCell(c)===0; } ) ){
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
				if(bd.isNum(c) || line.lcntCell(c)!==val){ continue;}

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
				if(bd.noNum(c)){ continue;}

				var bx=bd.cell[c].bx, by=bd.cell[c].by;
				var dir4id = [bd.bnum(bx,by-1),bd.bnum(bx,by+1),bd.bnum(bx-1,by),bd.bnum(bx+1,by)];

				for(var a=0;a<4;a++){
					if(dir4id[a]==-1||!bd.isLine(dir4id[a])||visited[dir4id[a]]!=0){ continue;}

					var ccnt=0;	// curve count.
					var idlist = [];
					var dir=a+1;
					bx=bd.cell[c].bx, by=bd.cell[c].by;
					while(1){
						switch(dir){ case 1: by--; break; case 2: by++; break; case 3: bx--; break; case 4: bx++; break;}
						if((bx+by)%2==0){
							var cc = bd.cnum(bx,by);
							if     (cc===null || bd.isNum(cc)){ break;}
							else if(line.lcntCell(cc)===4){ }
							else if(dir!==1 && bd.isLine(bd.bnum(bx,by+1))){ if(dir!==2){ ccnt++;} dir=2;}
							else if(dir!==2 && bd.isLine(bd.bnum(bx,by-1))){ if(dir!==1){ ccnt++;} dir=1;}
							else if(dir!==3 && bd.isLine(bd.bnum(bx+1,by))){ if(dir!==4){ ccnt++;} dir=4;}
							else if(dir!==4 && bd.isLine(bd.bnum(bx-1,by))){ if(dir!==3){ ccnt++;} dir=3;}
						}
						else{
							var id = bd.bnum(bx,by);
							if(!bd.isLine(id)){ break;}
							visited[i]=1;
							idlist.push(id);
						}
					}

					for(var i=0;i<idlist.length;i++){ errinfo.check[idlist[i]]=2;}

					var qn=(c!==null?bd.QnC(c):-1);
					var cc = bd.cnum(bx,by), qnn=(cc!==null?bd.QnC(cc):-1);
					if(this.ismag() && qn!==-2 && qn===qnn){
						errinfo.data.push({errflag:3,cells:[c,cc],idlist:idlist}); continue;
					}
					if(idlist.length>0 && ((bx+by)&1)===0 && qn!==-2 && ccnt>1){
						errinfo.data.push({errflag:2,cells:[c,cc],idlist:idlist}); continue;
					}
					if(idlist.length>0 && ((bx+by)&1)===1){
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
			for(var id=0;id<bd.bdmax;id++){ if(bd.isLine(id)){ visited.id[id]=0; lcnt++;}else{ visited.id[id]=null;} }
			var fc=null;
			for(var c=0;c<bd.cellmax;c++){ if(bd.isNum(c) && line.lcntCell(c)>0){ fc=c; break;} }
			if(fc===null){ return true;}

			this.cl0(visited.id, bd.cell[fc].bx, bd.cell[fc].by,0);
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
					if(bd.isNum(bd.cnum(bx,by))){
						if(bd.isLine(bd.bnum(bx,by-1))){ this.cl0(check,bx,by,1);}
						if(bd.isLine(bd.bnum(bx,by+1))){ this.cl0(check,bx,by,2);}
						if(bd.isLine(bd.bnum(bx-1,by))){ this.cl0(check,bx,by,3);}
						if(bd.isLine(bd.bnum(bx+1,by))){ this.cl0(check,bx,by,4);}
						break;
					}
					else if(line.lcntCell(bd.cnum(bx,by))==4){ }
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
