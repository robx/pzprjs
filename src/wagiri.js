//
// パズル固有スクリプト部 ごきげんななめ・輪切版 wagiri.js v3.3.2
//
Puzzles.wagiri = function(){ };
Puzzles.wagiri.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 7;}
		if(!k.qrows){ k.qrows = 7;}

		k.iscross  = 2;

		k.isLineCross     = true;
		k.isCenterLine    = true;
		k.dispzero        = true;

		k.ispzprv3ONLY    = true;

		k.bdmargin       = 0.70;
		k.bdmargin_image = 0.50;

		base.setTitle("ごきげんななめ・輪切","Gokigen-naname:wagiri");
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
			if     (k.playmode){ this.inputslash();}
			else if(k.editmode){ this.inputquestion();}
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
				else if(cc!==null){
					var trans = (this.btn.Left ? [-1,1,0,2,-2] : [2,-2,0,-1,1]);
					bd.setNum(cc,trans[bd.QnC(cc)+2]);
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
			if(cc===null){ return;}

			var use = pp.getVal('use');
			if     (use===1){ bd.sQaC(cc, (bd.QaC(cc)!=(this.btn.Left?1:2)?(this.btn.Left?1:2):0));}
			else if(use===2){ bd.sQaC(cc, (this.btn.Left?[1,2,0]:[2,0,1])[bd.QaC(cc)]);}

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

				if(cc!==null && val!==0){
					bd.setNum(cc,val);
					pc.paintCell(cc);
				}
			}
		};

		tc.setCrossType();

		bd.maxnum = 4;

		menu.ex.adjustSpecial = function(key,d){
			if(key & this.TURNFLIP){ // 反転・回転全て
				for(var c=0;c<bd.cellmax;c++){ bd.sQaC(c,[0,2,1][bd.QaC(c)]);}
			}
		};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_DLIGHT;
		pc.errcolor1 = "red";
		pc.errcolor2 = "rgb(0, 0, 127)";

		pc.crosssize = 0.33;

		pc.paint = function(){
			this.drawBGCells();
			this.drawDashedGrid(false);

			this.drawNumbers();
			this.drawSlashes();

			this.drawCrosses();
			this.drawTarget_wagiri();
		};
		// オーバーライド
		pc.prepaint = function(x1,y1,x2,y2){
			if(!ans.errDisp && pp.getVal('colorslash')){ x1=bd.minbx; y1=bd.minby; x2=bd.maxbx; y2=bd.maxby;}
			this.setRange(x1,y1,x2,y2);

			this.flushCanvas();
			this.paint();
		};

		// オーバーライド
		pc.setBGCellColor = function(c){
			if(bd.cell[c].qans===-1 && bd.cell[c].error===1){
				g.fillStyle = this.errbcolor1;
				return true;
			}
			return false;
		};

		pc.drawNumber1 = function(c){
			var obj = bd.cell[c], num = obj.qnum, key='cell_'+c;
			if(num!==-1){
				var text = (num!==-2 ? ({1:"輪",2:"切"})[num] : "?");
				this.dispnum(key, 1, text, 0.70, this.fontcolor, obj.cpx, obj.cpy);
			}
			else{ this.hideEL(key);}
		};

		pc.drawSlashes = function(){
			this.vinc('cell_slash', 'auto');

			var headers = ["c_sl1_", "c_sl2_"], check=[];
			g.lineWidth = Math.max(this.cw/8, 2);

			if(!ans.errDisp && pp.getVal('colorslash')){
				var sdata=ans.getSlashData();
				for(var c=0;c<bd.cellmax;c++){ if(sdata[c]>0){ bd.sErC([c],sdata[c]);} }
			}

			var clist = this.range.cells;
			for(var i=0;i<clist.length;i++){
				var c = clist[i];

				if(bd.cell[c].qans!=-1){
					if     (bd.cell[c].error==1){ g.strokeStyle = this.errcolor1;}
					else if(bd.cell[c].error==2){ g.strokeStyle = this.errcolor2;}
					else                        { g.strokeStyle = this.cellcolor;}

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

		pc.drawTarget_wagiri = function(){
			var islarge = ((tc.cursor.x&1)===(tc.cursor.y&1));
			this.drawCursor(islarge,k.editmode);
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

			if( !this.checkAllCell(function(c){ return (bd.QaC(c)===0);}) ){
				this.setAlert('斜線がないマスがあります。','There is a empty cell.'); return false;
			}

			return true;
		};

		ans.getSlashData = function(){
			var sdata=[], scnt=this.getScnt();
			for(var c=0;c<bd.cellmax;c++){ sdata[c] =(bd.QaC(c)!==0?0:-1);}
			for(var c=0;c<bd.cellmax;c++){
				if(sdata[c]!==0){ continue;}
				// history -> スタックみたいなオブジェクト
				var history={cell:[],cross:[]};
				for(var cc=0;cc<bd.cellmax;cc++) { history.cell[cc] =0;}
				for(var xc=0;xc<bd.crossmax;xc++){ history.cross[xc]=0;}

				var fc = bd.xnum(bd.cell[c].bx+(bd.QaC(c)===1 ? -1 : 1), bd.cell[c].by-1);
				this.sp0(fc, 1, scnt, sdata, history);
			}
			for(var c=0;c<bd.cellmax;c++){ if(sdata[c]===0){ sdata[c]=2;} }
			return sdata;
		};
		ans.sp0 = function(xc, depth, scnt, sdata, history){
			// 過ぎ去った地点に到達した→その地点からココまではループしてる
			if(history.cross[xc]>0){
				var min = history.cross[xc];
				for(var cc=0;cc<bd.cellmax;cc++){ if(history.cell[cc]>=min){ sdata[cc]=1;} }
				return;
			}

			// 別に到達していない -> 隣に進んでみる
			history.cross[xc] = depth; // この交点にマーキング
			var bx=bd.cross[xc].bx, by=bd.cross[xc].by;
			var nb = [
				{ cell:bd.cnum(bx-1,by-1), cross:bd.xnum(bx-2,by-2), qans:1},
				{ cell:bd.cnum(bx+1,by-1), cross:bd.xnum(bx+2,by-2), qans:2},
				{ cell:bd.cnum(bx-1,by+1), cross:bd.xnum(bx-2,by+2), qans:2},
				{ cell:bd.cnum(bx+1,by+1), cross:bd.xnum(bx+2,by+2), qans:1}
			];
			for(var i=0;i<4;i++){
				if( nb[i].cell===null ||				// そっちは盤面の外だよ！
					history.cell[nb[i].cell]!==0 ||		// そっちは通って来た道だよ！
					nb[i].qans!==bd.QaC(nb[i].cell) ||	// そっちは繋がってない。
					scnt[nb[i].cross]===1 || 			// そっちは行き止まり。
					sdata[nb[i].cell]===1 )		// sdataが1になってるってことは前にそっちから既に来ている
				{ continue;}					//  -> 先に分岐があるとしても、既に探索済みです.

				history.cell[nb[i].cell] = depth;	 // 隣のセルにマーキング
				this.sp0(nb[i].cross, depth+1, scnt, sdata, history);
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
