//
// パズル固有スクリプト部 ごきげんななめ・輪切版 wagiri.js v3.3.0
//
Puzzles.wagiri = function(){ };
Puzzles.wagiri.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 7;}	// 盤面の横幅
		if(!k.qrows){ k.qrows = 7;}	// 盤面の縦幅
		k.irowake = 0;			// 0:色分け設定無し 1:色分けしない 2:色分けする

		k.iscross      = 1;		// 1:Crossが操作可能なパズル
		k.isborder     = 0;		// 1:Border/Lineが操作可能なパズル
		k.isextendcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

		k.isoutsidecross  = 1;	// 1:外枠上にCrossの配置があるパズル
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
		k.NumberIsWhite = 0;	// 1:数字のあるマスが黒マスにならないパズル
		k.RBBlackCell   = 0;	// 1:連黒分断禁のパズル

		k.ispzprv3ONLY  = 1;	// 1:ぱずぷれv3にしかないパズル
		k.isKanpenExist = 0;	// 1:pencilbox/カンペンにあるパズル

		base.setTitle("ごきげんななめ・輪切","Gokigen-naname:wagiri");
		base.setExpression("　マウスで斜線を入力できます。",
						   " Click to input slashes.");
		base.setFloatbgcolor("rgb(0, 127, 0)");
		base.proto = 1;
	},
	menufix : function(){
		menu.addUseToFlags();

		pp.addCheck('colorslash','setting',false, '斜線の色分け', 'Slash with color');
		pp.setLabel('colorslash', '斜線を輪切りかのどちらかで色分けする(超重い)', 'Encolor slashes whether it consists in a loop or not.(Too busy)');
		pp.funcs['colorslash'] = function(){ pc.paintAll();};
	},
	finalfix : function(){
		ee('btnclear2').el.style.display = 'none';
	},
	protoChange : function(){
	},
	protoOriginal : function(){
		ee('btnclear2').el.style.display = 'inline';
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(k.playmode){ this.inputslash();}
			else if(k.editmode){
				if(!kp.enabled()){ this.inputquestion();}
				else{ kp.display();}
			}
		};
		mv.mouseup = function(){ };
		mv.mousemove = function(){ };

		mv.inputquestion = function(){
			var pos = this.borderpos(0.33);
			if(!bd.isinside(pos.x,pos.y)){ return;}
			if(!(pos.x&1) && !(pos.y&1)){
				this.inputcross();
			}
			else if((pos.x&1) && (pos.y&1)){
				var cc0 = tc.getTCC(), cc = this.cellid();
				if(cc!==cc0){
					tc.setTCC(cc);
					pc.paintCell(cc0);
					pc.paintCell(cc);
				}
				else if(cc!=-1){
					var trans = (this.btn.Left ? [-1,1,0,2,-2] : [2,-2,0,-1,1]);
					bd.sQnC(cc,trans[bd.QnC(cc)+2]);
					pc.paintCell(cc);
				}
			}
			else{
				var id = bd.bnum(pos.x, pos.y);
				if(id!==tc.getTBC()){
					var tcp = tc.getTCP();
					tc.setTCP(pos);
					pc.paintPos(tcp);
					pc.paintPos(pos);
				}
			}
		};

		mv.inputslash = function(){
			var cc = this.cellid();
			if(cc==-1){ return;}

			if     (k.use==1){ bd.sQaC(cc, (bd.QaC(cc)!=(this.btn.Left?1:2)?(this.btn.Left?1:2):-1));}
			else if(k.use==2){
				if(bd.QaC(cc)==-1){ bd.sQaC(cc, (this.btn.Left?1:2));}
				else{ bd.sQaC(cc, (this.btn.Left?{1:2,2:-1}:{1:-1,2:1})[bd.QaC(cc)]);}
			}

			pc.paintCellAround(cc);
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(k.playmode){ return;}
			if(this.moveTBorder(ca)){ return;}
			this.key_wagiri(ca);
		};
		kc.key_wagiri = function(ca){
			var pos = tc.getTCP();
			if(!(pos.x&1)&&!(pos.y&1)){
				this.key_inputcross(ca);
			}
			else if((pos.x&1)&&(pos.y&1)){
				var cc = tc.getTCC(), val = 0;
				if     (ca=='1'){ val= 1;}
				else if(ca=='2'){ val= 2;}
				else if(ca=='-'){ val=-2;}
				else if(ca==' '){ val=-1;}

				if(cc!==-1 && val!==0){
					bd.sQnC(cc,(bd.QnC(cc)!==val?val:-1));
					pc.paintCell(cc);
				}
			}
		};

		tc.setCrossType();

		bd.maxnum = 4;

		menu.ex.adjustSpecial = function(type,key){
			um.disableRecord();
			if(type>=1 && type<=4){ // 反転・回転全て
				for(var c=0;c<bd.cellmax;c++){ if(bd.QaC(c)!=-1){ bd.sQaC(c,{1:2,2:1}[bd.QaC(c)]); } }
			}
			um.enableRecord();
		};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_DLIGHT;
		pc.errcolor1 = "red";
		pc.errcolor2 = "rgb(0, 0, 127)";

		pc.crosssize = 0.33;
		pc.chassisflag = false;

		pc.paint = function(x1,y1,x2,y2){
			this.drawBGCells(x1,y1,x2,y2);
			this.drawDashedGrid(x1,y1,x2,y2);

			this.dispLetters_wagiri(x1,y1,x2,y2);
			this.drawSlashes(x1,y1,x2,y2);

			this.drawCrosses(x1,y1,x2+1,y2+1);
			this.drawTarget_wagiri(x1,y1,x2,y2);
		};
		// オーバーライド
		pc.prepaint = function(x1,y1,x2,y2){
			if(!ans.errDisp && pp.getVal('colorslash')){ x1=bd.minbx; y1=bd.minby; x2=bd.maxbx; y2=bd.maxby;}
			pc.flushCanvas(x1,y1,x2,y2);

			pc.paint(x1,y1,x2,y2);
		};

		// オーバーライド
		pc.setBGCellColor = function(c){
			if(bd.cell[c].qans===-1 && bd.cell[c].error===1){
				g.fillStyle = this.errbcolor1;
				return true;
			}
			return false;
		};

		pc.dispLetters_wagiri = function(x1,y1,x2,y2){
			var clist = this.cellinside(x1,y1,x2,y2);
			for(var i=0;i<clist.length;i++){
				var id = clist[i];
				var num = bd.cell[id].qnum, obj = bd.cell[id], key='cell_'+id;
				if(num!==-1){
					text = (num!==-2 ? ({1:"輪",2:"切"})[num] : "?");
					this.dispnum(key, 1, text, 0.70, this.getNumberColor(id), obj.px, obj.py);
				}
				else{ this.hideEL(key);}
			}
		};

		pc.drawSlashes = function(x1,y1,x2,y2){
			this.vinc('cell_slash', 'auto');

			var headers = ["c_sl1_", "c_sl2_"], check=[];
			g.lineWidth = Math.max(this.cw/8, 2);

			if(!ans.errDisp && pp.getVal('colorslash')){
				var sdata=ans.getSlashData();
				for(var c=0;c<bd.cellmax;c++){ if(sdata[c]>0){ bd.sErC([c],sdata[c]);} }
			}

			var clist = this.cellinside(x1,y1,x2,y2);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];

				if(bd.cell[c].qans!=-1){
					if     (bd.cell[c].error==1){ g.strokeStyle = this.errcolor1;}
					else if(bd.cell[c].error==2){ g.strokeStyle = this.errcolor2;}
					else                        { g.strokeStyle = this.Cellcolor;}

					if(bd.cell[c].qans==1){
						if(this.vnop(headers[0]+c,this.STROKE)){
							g.setOffsetLinePath(bd.cell[c].px,bd.cell[c].py, 0,0, this.cw,this.ch, true);
							g.stroke();
						}
					}
					else{ this.vhide(headers[0]+c);}

					if(bd.cell[c].qans==2){
						if(this.vnop(headers[1]+c,this.STROKE)){
							g.setOffsetLinePath(bd.cell[c].px,bd.cell[c].py, this.cw,0, 0,this.ch, true);
							g.stroke();
						}
					}
					else{ this.vhide(headers[1]+c);}
				}
				else{ this.vhide([headers[0]+c, headers[1]+c]);}
			}

			if(!ans.errDisp && pp.getVal('colorslash')){
				for(var c=0;c<bd.cellmax;c++){ if(sdata[c]>0){ bd.sErC([c],0);} }
			}
		};

		pc.drawTarget_wagiri = function(x1,y1,x2,y2){
			var islarge = ((tc.cursolx&1)===(tc.cursoly&1));
			this.drawCursor(x1,y1,x2,y2,islarge,k.editmode);
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decode4Cross();
			this.decodeNumber10();
		};
		enc.pzlexport = function(type){
			this.encode4Cross();
			this.encodeNumber10();
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeCrossNum();
			this.decodeCellQnum();
			this.decodeCellQanssub();
		};
		fio.encodeData = function(){
			this.encodeCrossNum();
			this.encodeCellQnum();
			this.encodeCellQanssub();
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			var sdata=this.getSlashData();
			if( !this.checkLoopLine(sdata, false) ){
				this.setAlert('"切"が含まれた線が輪っかになっています。', 'There is a loop that consists "切".'); return false;
			}

			if( !this.checkQnumCross() ){
				this.setAlert('数字に繋がる線の数が間違っています。', 'A number is not equal to count of lines that is connected to it.'); return false;
			}

			if( !this.checkLoopLine(sdata, true) ){
				this.setAlert('"輪"が含まれた線が輪っかになっていません。', 'There is not a loop that consists "輪".'); return false;
			}

			if( !this.checkAllCell(function(c){ return (bd.QaC(c)==-1);}) ){
				this.setAlert('斜線がないマスがあります。','There is a empty cell.'); return false;
			}

			return true;
		};

		ans.getSlashData = function(){
			var check=[], scnt=this.getScnt();
			for(var c=0;c<bd.cellmax;c++) { check[c] =(bd.QaC(c)!==-1?0:-1);}
			for(var c=0;c<bd.cellmax;c++){
				if(check[c]!==0){ continue;}
				// history -> スタックみたいなオブジェクト
				var history={cell:[],cross:[]};
				for(var cc=0;cc<bd.cellmax;cc++) { history.cell[cc] =(check[cc]!==-1?0:-1);}
				for(var xc=0;xc<bd.crossmax;xc++){ history.cross[xc]=(scnt[xc]>0    ?0:-1);}

				var fc = bd.xnum(bd.cell[c].bx+(bd.QaC(c)===1?-1:1), bd.cell[c].by);
				this.sp0(fc, 1, scnt, check, history);
			}
			for(var c=0;c<bd.cellmax;c++) { if(check[c]===0){ check[c]=2;} }
			return check;
		};
		ans.sp0 = function(xc, depth, scnt, check, history){
			// 過ぎ去った地点に到達した→その地点からココまではループしてる
			if(history.cross[xc]>0){
				var min = history.cross[xc];
				for(var cc=0;cc<bd.cellmax;cc++){ if(history.cell[cc]>=min){ check[cc]=1;} }
				return;
			}

			// 別に到達していない -> 隣に進んでみる
			history.cross[xc] = depth; // この交点にマーキング
			var bx=bd.cross[xc].bx, by=bd.cross[xc].by, isloop=false;
			var nb = [
					{ cell:bd.cnum(bx-1,by-1), cross:bd.xnum(bx-2,by-2), qans:1},
					{ cell:bd.cnum(bx+1,by-1), cross:bd.xnum(bx+2,by-2), qans:2},
					{ cell:bd.cnum(bx-1,by+1), cross:bd.xnum(bx-2,by+2), qans:2},
					{ cell:bd.cnum(bx+1,by+1), cross:bd.xnum(bx+2,by+2), qans:1}
				];
			for(var i=0;i<4;i++){
				if( nb[i].cell===-1 ||					// そっちは盤面の外だよ！
					history.cell[nb[i].cell]!==0 ||		// そっちは通って来た道だよ！
					nb[i].qans!==bd.QaC(nb[i].cell) ||	// そっちは繋がってない。
					scnt[nb[i].cross]===1 || 			// そっちは行き止まり。
					check[nb[i].cell]===1 )		// checkが1になってるってことは前にそっちから既に来ている
				{ continue;}					// 先に分岐があるとしても、その時に探索済みです.

				history.cell[nb[i].cell] = depth;	 // 隣のセルにマーキング
				this.sp0(nb[i].cross, depth+1, scnt, check, history);
				history.cell[nb[i].cell] = 0;		 // セルのマーキングを外す
			}
			history.cross[xc] = 0; // 交点のマーキングを外す
		};

		ans.checkLoopLine = function(sdata, checkLoop){
			var result = true;
			for(var c=0;c<bd.cellmax;c++){
				if(!checkLoop && sdata[c]==1 && bd.QnC(c)===2){ result = false;}
				if( checkLoop && sdata[c]==2 && bd.QnC(c)===1){ result = false;}
			}
			if(!result){ for(var c=0;c<bd.cellmax;c++){ if(sdata[c]>0){ bd.sErC([c],sdata[c]);} } }
			return result;
		};

		ans.checkQnumCross = function(){
			var result = true, scnt = this.getScnt();
			for(var c=0;c<bd.crossmax;c++){
				var qn = bd.QnX(c);
				if(qn>=0 && qn!=scnt[c]){
					if(this.inAutoCheck){ return false;}
					bd.sErX([c],1);
					result = false;
				}
			}
			return result;
		};

		ans.getScnt = function(){
			var scnt = [];
			for(var c=0;c<bd.crossmax;c++){ scnt[c]=0;}
			for(var c=0;c<bd.cellmax;c++){
				var bx=bd.cell[c].bx, by=bd.cell[c].by;
				if(bd.QaC(c)===1){
					scnt[bd.xnum(bx-1,by-1)]++;
					scnt[bd.xnum(bx+1,by+1)]++;
				}
				else if(bd.QaC(c)===2){
					scnt[bd.xnum(bx-1,by+1)]++;
					scnt[bd.xnum(bx+1,by-1)]++;
				}
			}
			return scnt;
		};
	}
};
