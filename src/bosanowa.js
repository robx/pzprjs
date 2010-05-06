//
// パズル固有スクリプト部 ボサノワ版 bosanowa.js v3.3.0p2
//
Puzzles.bosanowa = function(){ };
Puzzles.bosanowa.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}	// 盤面の横幅
		if(!k.qrows){ k.qrows = 10;}	// 盤面の縦幅
		k.irowake  = 0;		// 0:色分け設定無し 1:色分けしない 2:色分けする

		k.iscross  = 0;		// 1:盤面内側のCrossがあるパズル 2:外枠上を含めてCrossがあるパズル
		k.isborder = 2;		// 1:Border/Lineが操作可能なパズル 2:外枠上も操作可能なパズル
		k.isexcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

		k.isLineCross     = false;	// 線が交差するパズル
		k.isCenterLine    = false;	// マスの真ん中を通る線を回答として入力するパズル
		k.isborderAsLine  = false;	// 境界線をlineとして扱う
		k.hasroom         = false;	// いくつかの領域に分かれている/分けるパズル
		k.roomNumber      = false;	// 部屋の問題の数字が1つだけ入るパズル

		k.dispzero        = false;	// 0を表示するかどうか
		k.isDispHatena    = true;	// qnumが-2のときに？を表示する
		k.isAnsNumber     = true;	// 回答に数字を入力するパズル
		k.NumberWithMB    = false;	// 回答の数字と○×が入るパズル
		k.linkNumber      = false;	// 数字がひとつながりになるパズル

		k.BlackCell       = false;	// 黒マスを入力するパズル
		k.NumberIsWhite   = false;	// 数字のあるマスが黒マスにならないパズル
		k.RBBlackCell     = false;	// 連黒分断禁のパズル
		k.checkBlackCell  = false;	// 正答判定で黒マスの情報をチェックするパズル
		k.checkWhiteCell  = false;	// 正答判定で白マスの情報をチェックするパズル

		k.ispzprv3ONLY    = false;	// ぱずぷれアプレットには存在しないパズル
		k.isKanpenExist   = false;	// pencilbox/カンペンにあるパズル

		k.bdmargin       = 0.70;	// 枠外の一辺のmargin(セル数換算)
		k.bdmargin_image = 0.10;	// 画像出力時のbdmargin値

		if(k.EDITOR){
			base.setExpression("　キーボードで数字および、Wキーで数字を入力するマス/しないマスの切り替えが来出ます。",
							   " It is able to input number of question by keyboard, and 'W' key toggles cell that is able to be inputted number or not.");
		}
		else{
			base.setExpression("　キーボードやマウスで数字が入力できます。",
							   " It is available to input number by keybord or mouse.");
		}
		base.setTitle("ボサノワ","Bosanowa");
		base.setFloatbgcolor("rgb(96, 96, 96)");
	},
	menufix : function(){
		pp.addSelect('disptype','setting',1,[1,2,3],'表示形式','Display');
		pp.setLabel ('disptype', '表示形式', 'Display');

		pp.addChild('disptype_1', 'disptype', 'ニコリ紙面形式', 'Original Type');
		pp.addChild('disptype_2', 'disptype', '倉庫番形式',     'Sokoban Type');
		pp.addChild('disptype_3', 'disptype', 'ワリタイ形式',   'Waritai type');
		pp.funcs['disptype'] = function(num){
			if     (num==1){ k.bdmargin = 0.70; k.bdmargin_image = 0.10;}
			else if(num==2){ k.bdmargin = 1.20; k.bdmargin_image = 1.10;}
			else if(num==3){ k.bdmargin = 0.70; k.bdmargin_image = 0.10;}
			base.resize_canvas();
		};
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			this.inputqnum_bosanowa();
		};
		mv.mouseup = function(){ };
		mv.mousemove = function(){ };

		mv.inputqnum_bosanowa = function(){
			var pos = this.borderpos(0.31);
			if(!bd.isinside(pos.x,pos.y)){ return;}
			var tcp = tc.getTCP();

			if(pos.x==tcp.x&&pos.y==tcp.y){
				var max = bd.nummaxfunc();
				if((pos.x&1)&&(pos.y&1)){
					var cc = bd.cnum(pos.x,pos.y);
					if(k.editmode){
						if(this.btn.Left){
							if     (bd.QuC(cc)==0)       { this.setval(cc,-1); bd.sQuC(cc,7);}
							else if(this.getval(cc)==max){ this.setval(cc,-1); bd.sQuC(cc,0);}
							else if(this.getval(cc)==-1) { this.setval(cc, 1); bd.sQuC(cc,7);}
							else{ this.setval(cc,this.getval(cc)+1);}
						}
						else if(this.btn.Right){
							if     (bd.QuC(cc)==0)       { this.setval(cc,max); bd.sQuC(cc,7);}
							else if(this.getval(cc)== 1) { this.setval(cc, -1); bd.sQuC(cc,7);}
							else if(this.getval(cc)==-1) { this.setval(cc, -1); bd.sQuC(cc,0);}
							else{ this.setval(cc,this.getval(cc)-1);}
						}
					}
					if(k.playmode && bd.QuC(cc)==7){
						if(this.btn.Left){
							if     (this.getval(cc)==max){ this.setval(cc,-1);}
							else if(this.getval(cc)==-1) { this.setval(cc, 1);}
							else{ this.setval(cc,this.getval(cc)+1);}
						}
						else if(this.btn.Right){
							if     (this.getval(cc)==-1) { this.setval(cc,max);}
							else if(this.getval(cc)== 1) { this.setval(cc, -1);}
							else{ this.setval(cc,this.getval(cc)-1);}
						}
					}
				}
			}
			else{
				tc.setTCP(pos);
				pc.paintPos(tcp);
			}
			pc.paintPos(pos);
		};
		mv.setval = function(cc,val){
			if     (k.editmode){ bd.sQnC(cc,val);}
			else if(k.playmode){ bd.sQaC(cc,val);}
		};
		mv.getval = function(cc){
			if     (k.editmode){ return bd.QnC(cc);}
			else if(k.playmode){ return bd.QaC(cc);}
			return -1;
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(this.moveTBorder(ca)){ return;}
			this.key_inputqnum_bosanowa(ca);
		};
		kc.key_inputqnum_bosanowa = function(ca){
			var tcp = tc.getTCP();
			if((tcp.x&1)&&(tcp.y&1)){
				var cc = tc.getTCC();
				if(k.editmode && ca=='w'){ bd.sQuC(cc,(bd.QuC(cc)!=7?7:0)); bd.setNum(cc,-1);}
				else if(bd.QuC(cc)==7 && (k.playmode || '0'<=ca && ca<='9')){ this.key_inputqnum(ca);}
				else if(k.editmode && '0'<=ca && ca<='9'){ bd.sQuC(cc,7); bd.setNum(cc,-1); this.key_inputqnum(ca);}
				else if(k.editmode && (ca=='-'||ca==' ')){ bd.sQuC(cc,7); bd.setNum(cc,-1);}
				else{ return false;}
			}
			else if((tcp.x+tcp.y)&1){
				var id = tc.getTBC();
				var cc1 = bd.border[id].cellcc[0], cc2 = bd.border[id].cellcc[1];
				if((cc1==-1||bd.QuC(cc1)!=7)||(cc2==-1||bd.QuC(cc2)!=7)){ return false;}
				if('0'<=ca && ca<='9'){
					var num = parseInt(ca);
					var qsubmax = 99;

					if(bd.QsB(id)<=0 || this.prev!=id){ if(num<=qsubmax){ bd.sQsB(id,num);}}
					else{
						if(bd.QsB(id)*10+num<=qsubmax){ bd.sQsB(id,bd.QsB(id)*10+num);}
						else if(num<=qsubmax){ bd.sQsB(id,num);}
					}
					this.prev=id;
				}
				else if(ca=='-'||ca==' '){ bd.sQsB(id,-1);}
				else{ return false;}
			}
			else{ return false;}

			pc.paintPos(tcp);
			return true;
		};

		// カーソルを最初真ん中においておく
		tc.cursorx = k.qcols-1-k.qcols%2;
		tc.cursory = k.qrows-1-k.qrows%2;
		if(k.EDITOR){
			var c = tc.getTCC();
			if(c!==-1){ bd.cell[c].ques = 7;}
		}
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.borderfontcolor = "blue";

		pc.paint = function(x1,y1,x2,y2){
			this.drawBGCells(x1,y1,x2,y2);

			if(pp.getVal('disptype')==1){
				this.drawCircles_bosanowa(x1,y1,x2,y2);
				this.drawBDnumbase(x1,y1,x2,y2);
			}
			else if(pp.getVal('disptype')==2){
				this.drawOutside_souko(x1,y1,x2,y2);
				this.drawGrid_souko(x1,y1,x2,y2);
				this.drawBDnumbase(x1,y1,x2,y2);
			}
			else if(pp.getVal('disptype')==3){
				this.drawBorders(x1,y1,x2,y2);
				this.drawGrid_waritai(x1,y1,x2,y2);
			}

			this.drawNumbers(x1,y1,x2,y2);
			this.drawNumbersBD(x1,y1,x2,y2);

			if(k.EDITOR && !this.fillTextPrecisely){
				this.drawChassis(x1,y1,x2,y2);
			}

			this.drawTarget_bosanowa(x1,y1,x2,y2);
		};

		pc.drawErrorCells_bosanowa = function(x1,y1,x2,y2){
			this.vinc('cell_back', 'crispEdges');

			var header = "c_fullerr_";
			g.fillStyle = this.errbcolor1;
			var clist = bd.cellinside(x1,y1,x2,y2);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				if(bd.cell[c].error===1){
					if(this.vnop(header+c,this.FILL)){
						g.fillRect(bd.cell[c].px, bd.cell[c].py, this.cw, this.ch);
					}
				}
				else{ this.vhide([header+c]);}
			}
		};

		pc.drawCircles_bosanowa = function(x1,y1,x2,y2){
			this.vinc('cell_circle', 'auto');

			g.lineWidth = 1;
			g.fillStyle = "white";
			var rsize  = this.cw*0.44;
			var header = "c_cir_";

			var clist = bd.cellinside(x1,y1,x2,y2);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				if(bd.cell[c].ques===7 && !bd.isNum(c)){
					g.strokeStyle = (bd.cell[c].error===1 ? this.errcolor1 : this.cellcolor);
					if(this.vnop(header+c,this.STROKE)){
						g.strokeCircle(bd.cell[c].cpx, bd.cell[c].cpy, rsize);
					}
				}
				else{ this.vhide([header+c]);}
			}
		};

		pc.drawGrid_souko = function(x1,y1,x2,y2){
			this.vinc('grid_souko', 'crispEdges');

			var header = "b_grids_";
			g.lineWidth = 1;
			g.fillStyle="rgb(127,127,127)";
			g.strokeStyle="rgb(127,127,127)";

			var idlist = bd.borderinside(x1-2,y1-2,x2+2,y2+2);
			for(var i=0;i<idlist.length;i++){
				var id = idlist[i], cc1 = bd.border[id].cellcc[0], cc2 = bd.border[id].cellcc[1];
				var onboard1 = (cc1!==-1&&bd.cell[cc1].ques===7);
				var onboard2 = (cc2!==-1&&bd.cell[cc2].ques===7);

				if(onboard1 && onboard2){
					if(!g.use.canvas){
						if(this.vnop(header+id,this.NONE)){
							if(bd.border[id].by&1){
								var px = bd.border[id].px, py1 = bd.border[id].py-this.bh, py2 = py1+this.ch+1;
								g.strokeLine(px, py1, px, py2);
								g.setDashSize(3);
							}
							else if(bd.border[id].bx&1){
								var py = bd.border[id].py, px1 = bd.border[id].px-this.bw, px2 = px1+this.cw+1;
								g.strokeLine(px1, py, px2, py);
								g.setDashSize(3);
							}
						}
					}
					else{
						var dotmax = this.cw/10+3;
						var dotCount = Math.max(this.cw/dotmax, 1);
						var dotSize  = this.cw/(dotCount*2);
						if     (bd.border[id].by&1){ 
							for(var j=0;j<this.ch+1;j+=(2*dotSize)){
								g.fillRect(bd.border[id].px, bd.border[id].py-this.bh+j, 1, dotSize);
							}
						}
						else if(bd.border[id].bx&1){ 
							for(var j=0;j<this.cw+1 ;j+=(2*dotSize)){
								g.fillRect(bd.border[id].px-this.bw+j, bd.border[id].py, dotSize, 1);
							}
						}
					}
				}
				else{ this.vhide([header+id]);} 
			}
		};
		pc.drawGrid_waritai = function(x1,y1,x2,y2){
			this.vinc('grid_waritai', 'crispEdges');

			var csize = this.cw*0.20;
			var headers = ["b_grid_", "b_grid2_"];
			var idlist = bd.borderinside(x1-2,y1-2,x2+2,y2+2);
			for(var i=0;i<idlist.length;i++){
				var id = idlist[i], cc1 = bd.border[id].cellcc[0], cc2 = bd.border[id].cellcc[1];
				var onboard1 = (cc1!==-1&&bd.cell[cc1].ques===7);
				var onboard2 = (cc2!==-1&&bd.cell[cc2].ques===7);

				if(onboard1 && onboard2){
					g.fillStyle=this.gridcolor;
					if(this.vnop(headers[0]+id,this.NONE)){
						if     (bd.border[id].by&1){ g.fillRect(bd.border[id].px, bd.border[id].py-this.bh, 1, this.ch+1);}
						else if(bd.border[id].bx&1){ g.fillRect(bd.border[id].px-this.bw, bd.border[id].py, this.cw+1, 1);}
					}

					g.fillStyle = ((bd.cell[cc2].error===0) ? "white" : this.errbcolor1);
					if(this.vnop(headers[1]+id,this.FILL)){
						if     (bd.border[id].by&1){ g.fillRect(bd.border[id].px, bd.border[id].py-csize, 1, 2*csize+1);}
						else if(bd.border[id].bx&1){ g.fillRect(bd.border[id].px-csize, bd.border[id].py, 2*csize+1, 1);}
					}
				}
				else{ this.vhide([headers[0]+id, headers[1]+id]);}
			}
		};

		pc.drawBDnumbase = function(x1,y1,x2,y2){
			this.vinc('border_number_base', 'crispEdges');

			var csize = this.cw*0.20;
			var header = "b_bbse_";
			var idlist = bd.borderinside(x1-2,y1-2,x2+3,y2+3);
			for(var i=0;i<idlist.length;i++){
				var id = idlist[i], cc1 = bd.border[id].cellcc[0], cc2 = bd.border[id].cellcc[1];

				if(bd.border[id].qsub>=0 && ((cc1!==-1&&bd.cell[cc1].ques===7)&&(cc2!==-1&&bd.cell[cc2].ques===7))){
					g.fillStyle = "white";
					if(this.vnop(header+id,this.NONE)){
						g.fillRect(bd.border[id].px-csize, bd.border[id].py-csize, 2*csize+1, 2*csize+1);
					}
				}
				else{ this.vhide(header+id);}
			}
		};
		pc.drawNumbersBD = function(x1,y1,x2,y2){
			this.vinc('border_number', 'auto');

			var idlist = bd.borderinside(x1-1,y1-1,x2+1,y2+1);
			for(var i=0;i<idlist.length;i++){
				var id=idlist[i], obj=bd.border[id], key='border_'+id;
				if(bd.border[id].qsub>=0){
					this.dispnum(key, 1, ""+bd.QsB(id), 0.35 ,this.borderfontcolor, obj.px, obj.py);
				}
				else{ this.hideEL(key);}
			}
		};

		// 倉庫番の外側(グレー)描画用
		pc.drawOutside_souko = function(x1,y1,x2,y2){
			this.vinc('cell_outside_souko', 'crispEdges');

			var header = "c_full_";
			for(var bx=(x1-2)|1;bx<=x2+2;bx+=2){
				for(var by=(y1-2)|1;by<=y2+2;by+=2){
					var c=bd.cnum(bx,by);
					if( (c==-1 || bd.cell[c].ques!=7) && (
						bd.QuC(bd.cnum(bx-2,by  ))===7 || bd.QuC(bd.cnum(bx+2,by  ))===7 || 
						bd.QuC(bd.cnum(bx  ,by-2))===7 || bd.QuC(bd.cnum(bx  ,by+2))===7 || 
						bd.QuC(bd.cnum(bx-2,by-2))===7 || bd.QuC(bd.cnum(bx+2,by-2))===7 || 
						bd.QuC(bd.cnum(bx-2,by+2))===7 || bd.QuC(bd.cnum(bx+2,by+2))===7 ) )
					{
						g.fillStyle = "rgb(127,127,127)";
						if(this.vnop([header,bx,by].join('_'),this.NONE)){
							g.fillRect(k.p0.x+(bx-1)*this.bw, k.p0.y+(by-1)*this.bh, this.cw+1, this.ch+1);
						}
					}
					else{ this.vhide([header,bx,by].join('_'));}
				}
			}
		};
		// ワリタイの太線描画用
		pc.setBorderColor = function(id){
			var cc1 = bd.border[id].cellcc[0], cc2 = bd.border[id].cellcc[1];
			if((cc1===-1 || bd.cell[cc1].ques!==7)^(cc2===-1 || bd.cell[cc2].ques!==7)){
				g.fillStyle = this.cellcolor;
				return true;
			}
			return false;
		};

		pc.drawTarget_bosanowa = function(x1,y1,x2,y2){
			var islarge = !!((tc.cursorx&1)&&(tc.cursory&1));
			this.drawCursor(x1,y1,x2,y2,islarge);
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decodeBoard();
			this.decodeNumber16();

			if     (this.checkpflag("h")){ pp.setVal('disptype',2);}
			else if(this.checkpflag("t")){ pp.setVal('disptype',3);}
		};
		// オーバーライド
		enc.pzlexport = function(type){
			this.encodeBosanowa();

			if     (pp.getVal('disptype')==2){ this.outpflag="h";}
			else if(pp.getVal('disptype')==3){ this.outpflag="t";}
		};

		//---------------------------------------------------------
		enc.decodeBoard = function(){
			var bstr = this.outbstr;
			for(var i=0;i<bstr.length;i++){
				var num = parseInt(bstr.charAt(i),32);
				for(var w=0;w<5;w++){ if((i*5+w)<bd.cellmax){ bd.sQuC(i*5+w,(num&Math.pow(2,4-w)?0:7));} }
				if((i*5+5)>=bd.cellmax){ break;}
			}
			this.outbstr = bstr.substr(i+1);
		};

		// エンコード時は、盤面サイズの縮小という特殊処理を行ってます
		enc.encodeBosanowa = function(type){
			var x1=9999, x2=-1, y1=9999, y2=-1;
			for(var c=0;c<bd.cellmax;c++){
				if(bd.QuC(c)!=7){ continue;}
				if(x1>bd.cell[c].bx){ x1=bd.cell[c].bx;}
				if(x2<bd.cell[c].bx){ x2=bd.cell[c].bx;}
				if(y1>bd.cell[c].by){ y1=bd.cell[c].by;}
				if(y2<bd.cell[c].by){ y2=bd.cell[c].by;}
			}

			var cm="", count=0, pass=0;
			for(var by=y1;by<=y2;by+=2){
				for(var bx=x1;bx<=x2;bx+=2){
					var c=bd.cnum(bx,by);
					if(bd.QuC(c)==0){ pass+=Math.pow(2,4-count);}
					count++; if(count==5){ cm += pass.toString(32); count=0; pass=0;}
				}
			}
			if(count>0){ cm += pass.toString(32);}
			this.outbstr += cm;

			cm="", count=0;
			for(var by=y1;by<=y2;by+=2){
				for(var bx=x1;bx<=x2;bx+=2){
					var pstr = "";
					var val = bd.QnC(bd.cnum(bx,by));

					if     (val==-2         ){ pstr = ".";}
					else if(val>= 0&&val< 16){ pstr =       val.toString(16);}
					else if(val>=16&&val<256){ pstr = "-" + val.toString(16);}
					else{ count++;}

					if(count==0){ cm += pstr;}
					else if(pstr || count==20){ cm+=((15+count).toString(36)+pstr); count=0;}
				}
			}
			if(count>0){ cm+=(15+count).toString(36);}
			this.outbstr += cm;

			this.outsize = [(x2-x1+2)/2, (y2-y1+2)/2].join("/");
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeCell( function(c,ca){
				if(ca!="."){ bd.sQuC(c, 7);}
				if(ca!="0"&&ca!="."){ bd.sQnC(c, parseInt(ca));}
			});
			this.decodeCell( function(c,ca){
				if(ca!="0"&&ca!="."){ bd.sQaC(c, parseInt(ca));}
			});
			this.decodeBorder( function(id,ca){
				if(ca!="."){ bd.sQsB(id, parseInt(ca));}
			});
		};
		fio.encodeData = function(){
			this.encodeCell(function(c){
				if(bd.QuC(c)!=7){ return ". ";}
				if(bd.QnC(c)< 0){ return "0 ";}
				else{ return ""+bd.QnC(c).toString()+" ";}
			});
			this.encodeCell( function(c){
				if(bd.QuC(c)!=7 || bd.QnC(c)!=-1){ return ". ";}
				if(bd.QaC(c)< 0){ return "0 ";}
				else{ return ""+bd.QaC(c).toString()+" ";}
			});
			this.encodeBorder( function(id){
				var cc1 = bd.border[id].cellcc[0], cc2 = bd.border[id].cellcc[1];
				if((cc1==-1||bd.QuC(cc1)!=7)||(cc2==-1||bd.QuC(cc2)!=7)){ return ". ";}
				if(bd.QsB(id)==-1){ return ". ";}
				else{ return ""+bd.QsB(id).toString()+" ";}
			});
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			if( !this.checkAllCell(this.isSubsNumber) ){
				this.setAlert('数字とその隣の数字の差の合計が合っていません。', 'Sum of the differences between the number and adjacent numbers is not equal to the number.'); return false;
			}

			if( !this.checkAllCell(function(c){ return (bd.QuC(c)==7 && bd.noNum(c));}) ){
				this.setAlert('数字の入っていないマスがあります。','There is a empty cell.'); return false;
			}

			return true;
		};
		ans.check1st = function(){ return this.checkAllCell(function(c){ return (bd.QuC(c)==7 && bd.noNum(c));});};

		ans.isSubsNumber = function(c){
			if(bd.QuC(c)!=7||bd.noNum(c)){ return false;}
			var sum=0, cc=-1;
			var cc=bd.up(c); if(cc!=-1&&bd.QuC(cc)==7){ if(bd.isNum(cc)){ sum+=Math.abs(bd.getNum(c)-bd.getNum(cc)); }else{ return false;} }
			var cc=bd.dn(c); if(cc!=-1&&bd.QuC(cc)==7){ if(bd.isNum(cc)){ sum+=Math.abs(bd.getNum(c)-bd.getNum(cc)); }else{ return false;} }
			var cc=bd.lt(c); if(cc!=-1&&bd.QuC(cc)==7){ if(bd.isNum(cc)){ sum+=Math.abs(bd.getNum(c)-bd.getNum(cc)); }else{ return false;} }
			var cc=bd.rt(c); if(cc!=-1&&bd.QuC(cc)==7){ if(bd.isNum(cc)){ sum+=Math.abs(bd.getNum(c)-bd.getNum(cc)); }else{ return false;} }

			return (bd.getNum(c)!=sum);
		};
	}
};
