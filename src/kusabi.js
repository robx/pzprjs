//
// パズル固有スクリプト部 クサビリンク版 kusabi.js v3.2.4
//
Puzzles.kusabi = function(){ };
Puzzles.kusabi.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}	// 盤面の横幅
		if(!k.qrows){ k.qrows = 10;}	// 盤面の縦幅
		k.irowake = 0;			// 0:色分け設定無し 1:色分けしない 2:色分けする

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
		//k.def_psize = 24;
		//k.area = { bcell:0, wcell:0, number:0};	// areaオブジェクトで領域を生成する

		base.setTitle("クサビリンク","Kusabi");
		base.setExpression("　左ドラッグで線が、右ドラッグで×印が入力できます。",
						   " Left Button Drag to input black cells, Right Click to input a cross.");
		base.setFloatbgcolor("rgb(96, 96, 96)");
	},
	menufix : function(){ },

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(k.editmode){
				if(!kp.enabled()){ this.inputqnum();}
				else{ kp.display();}
			}
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
		mv.enableInputHatena = true;

		// キーボード入力系
		kc.keyinput = function(ca){
			if(k.playmode){ return;}
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum(ca);
		};

		if(k.EDITOR){
			kp.kpgenerate = function(mode){
				this.inputcol('num','knum1','1','同');
				this.inputcol('num','knum2','2','短');
				this.inputcol('num','knum3','3','長');
				this.insertrow();
				this.inputcol('num','knum.','-','○');
				this.inputcol('num','knum_',' ',' ');
				this.inputcol('empty','knumx','','');
				this.insertrow();
			};
			kp.generate(kp.ORIGINAL, true, false, kp.kpgenerate);
			kp.kpinput = function(ca){
				kc.key_inputqnum(ca);
			};
		}

		bd.maxnum = 3;
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_LIGHT;
		pc.circleratio = [0.40, 0.40];

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);

			this.drawBGCells(x1,y1,x2,y2);
			this.drawGrid(x1,y1,x2,y2);

			this.drawPekes(x1,y1,x2,y2,0);
			this.drawLines(x1,y1,x2,y2);

			this.drawCircledNumbers(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);

			this.drawTarget(x1,y1,x2,y2);
		};
		pc.dispnumCell = function(id){
			var num = bd.cell[id].qnum, obj = bd.cell[id];
			if(num>=1 && num<=3){ text = ({1:"同",2:"短",3:"長"})[num];}
			else{ this.hideEL(obj.numobj); return;}

			if(!obj.numobj){ obj.numobj = this.CreateDOMAndSetNop();}
			this.dispnum(obj.numobj, 1, text, 0.65, this.getNumberColor(id), obj.px, obj.py);
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decodeNumber10();
		};
		enc.pzlexport = function(type){
			this.encodeNumber10();
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeCellQnum();
			this.decodeBorderLine();
		};
		fio.encodeData = function(){
			this.encodeCellQnum();
			this.encodeBorderLine();
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){
			this.performAsLine = true;

			if( !this.checkLcntCell(3) ){
				this.setAlert('分岐している線があります。','There is a branch line.'); return false;
			}
			if( !this.checkLcntCell(4) ){
				this.setAlert('線が交差しています。','There is a crossing line.'); return false;
			}

			var linfo = line.getLareaInfo();
			if( !this.checkQnumsInArea(linfo, function(a){ return (a>=3);}) ){
				this.setAlert('3つ以上の丸がつながっています。','Three or more objects are connected.'); return false;
			}
			if( !this.check2Line() ){
				this.setAlert('丸の上を線が通過しています。','A line goes through a circle.'); return false;
			}

			var errinfo = this.searchConnectedLine();
			if( !this.checkErrorFlag(errinfo,7) ){
				this.setAlert('丸がコの字型に繋がっていません。','The shape of a line is not correct.'); return false;
			}
			if( !this.checkErrorFlag(errinfo,6) ){
				this.setAlert('繋がる丸が正しくありません。','The type of connected circle is wrong.'); return false;
			}
			if( !this.checkErrorFlag(errinfo,5) ){
				this.setAlert('線が2回以上曲がっています。','A line turns twice or more.'); return false;
			}
			if( !this.checkErrorFlag(errinfo,4) ){
				this.setAlert('線が2回曲がっていません。','A line turns only once or lower.'); return false;
			}
			if( !this.checkErrorFlag(errinfo,3) ){
				this.setAlert('線の長さが同じではありません。','The length of lines is differnet.'); return false;
			}
			if( !this.checkErrorFlag(errinfo,2) ){
				this.setAlert('線の長短の指示に反してます。','The length of lines is not suit for the label of object.'); return false;
			}
			if( !this.checkErrorFlag(errinfo,1) ){
				this.setAlert('途切れている線があります。','There is a dead-end line.'); return false;
			}

			if( !this.checkDisconnectLine(linfo) ){
				this.setAlert('丸につながっていない線があります。','A line doesn\'t connect any circle.'); return false;
			}

			if( !this.checkAllCell(function(c){ return (line.lcntCell(c)==0 && bd.QnC(c)!=-1);}) ){
				this.setAlert('どこにもつながっていない丸があります。','A circle is not connected another object.'); return false;
			}

			return true;
		};
		ans.check1st = function(){ return this.checkAllCell(function(c){ return (line.lcntCell(c)==0 && bd.QnC(c)!=-1);});};

		ans.check2Line = function(){ return this.checkLine(function(i){ return (line.lcntCell(i)>=2 && bd.QnC(i)!=-1);}); };
		ans.checkLine = function(func){
			var result = true;
			for(var c=0;c<bd.cellmax;c++){
				if(func(c)){
					if(this.inAutoCheck){ return false;}
					if(result){ bd.sErBAll(2);}
					ans.setCellLineError(c,true);
					result = false;
				}
			}
			return result;
		};

		ans.searchConnectedLine = function(){
			var errinfo = {data:[]};
			//var saved = {errflag:0,cells:[],idlist:[]};
			var visited = new AreaInfo();
			for(var id=0;id<bd.bdmax;id++){ visited[id]=0;}

			for(var c=0;c<bd.cellmax;c++){
				if(bd.QnC(c)==-1 || line.lcntCell(c)==0){ continue;}

				var cc      = -1;	// ループから抜けたときに到達地点のIDが入る
				var ccnt    =  0;	// 曲がった回数
				var dir     =  0;	// 現在向かっている方向/最後に向かった方向
				var dir1    =  0;	// 最初に向かった方向
				var length1 =  0;	// 一回曲がる前の線の長さ
				var length2 =  0;	// 二回曲がった後の線の長さ
				var idlist  = [];	// 通過したlineのリスト(エラー表示用)
				var bx=bd.cell[c].cx*2+1, by=bd.cell[c].cy*2+1;	// 現在地
				while(1){
					switch(dir){ case 1: by--; break; case 2: by++; break; case 3: bx--; break; case 4: bx++; break;}
					if((bx+by)%2==0){
						cc = bd.cnum(bx>>1,by>>1);
						if(dir!=0 && bd.QnC(cc)!=-1){ break;}
						else if(dir!=1 && bd.isLine(bd.bnum(bx,by+1))){ if(dir!=0&&dir!=2){ ccnt++;} dir=2;}
						else if(dir!=2 && bd.isLine(bd.bnum(bx,by-1))){ if(dir!=0&&dir!=1){ ccnt++;} dir=1;}
						else if(dir!=3 && bd.isLine(bd.bnum(bx+1,by))){ if(dir!=0&&dir!=4){ ccnt++;} dir=4;}
						else if(dir!=4 && bd.isLine(bd.bnum(bx-1,by))){ if(dir!=0&&dir!=3){ ccnt++;} dir=3;}
					}
					else{
						cc=-1;
						var id = bd.bnum(bx,by);
						if(id==-1||visited[id]!=0||!bd.isLine(id)){ break;}
						idlist.push(id);
						visited[id]=1;
						if(dir1==0){ dir1=dir;}
						if     (ccnt==0){ length1++;}
						else if(ccnt==2){ length2++;}
					}
				}

				if(idlist.length<=0){ continue;}
				if(!((dir1==1&&dir==2)||(dir1==2&&dir==1)||(dir1==3&&dir==4)||(dir1==4&&dir==3)) && ccnt==2){
					errinfo.data.push({errflag:7,cells:[c,cc],idlist:idlist}); continue;
				}
				if(!((bd.QnC(c)==1 && bd.QnC(cc)==1) || (bd.QnC(c)==2 && bd.QnC(cc)==3) ||
						  (bd.QnC(c)==3 && bd.QnC(cc)==2) || bd.QnC(c)==-2 || bd.QnC(cc)==-2) && cc!=-1 && ccnt==2)
				{
					errinfo.data.push({errflag:6,cells:[c,cc],idlist:idlist}); continue;
				}
				if(ccnt>2){
					errinfo.data.push({errflag:5,cells:[c,cc],idlist:idlist}); continue;
				}
				if(ccnt<2 && cc!=-1){
					errinfo.data.push({errflag:4,cells:[c,cc],idlist:idlist}); continue;
				}
				if((bd.QnC(c)==1 || bd.QnC(cc)==1) && ccnt==2 && cc!=-1 && length1!=length2){
					errinfo.data.push({errflag:3,cells:[c,cc],idlist:idlist}); continue;
				}
				if((((bd.QnC(c)==2 || bd.QnC(cc)==3) && length1>=length2) ||
						 ((bd.QnC(c)==3 || bd.QnC(cc)==2) && length1<=length2)) && ccnt==2 && cc!=-1)
				{
					errinfo.data.push({errflag:2,cells:[c,cc],idlist:idlist}); continue;
				}
				if((cc==-1 || bd.QnC(cc)==-1)){
					errinfo.data.push({errflag:1,cells:[c],idlist:idlist}); continue;
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
	}
};
