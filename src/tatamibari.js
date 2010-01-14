//
// パズル固有スクリプト部 タタミバリ版 tatamibari.js v3.2.5
//
Puzzles.tatamibari = function(){ };
Puzzles.tatamibari.prototype = {
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
		k.isCenterLine    = 0;	// 1:マスの真ん中を通る線を回答として入力するパズル
		k.isborderAsLine  = 0;	// 1:境界線をlineとして扱う

		k.dispzero      = 1;	// 1:0を表示するかどうか
		k.isDispHatena  = 1;	// 1:qnumが-2のときに？を表示する
		k.isAnsNumber   = 0;	// 1:回答に数字を入力するパズル
		k.isArrowNumber = 0;	// 1:矢印つき数字を入力するパズル
		k.isOneNumber   = 0;	// 1:部屋の問題の数字が1つだけ入るパズル
		k.isDispNumUL   = 0;	// 1:数字をマス目の左上に表示するパズル(0はマスの中央)
		k.NumberWithMB  = 0;	// 1:回答の数字と○×が入るパズル

		k.BlackCell     = 0;	// 1:黒マスを入力するパズル
		k.NumberIsWhite = 0;	// 1:数字のあるマスが黒マスにならないパズル
		k.RBBlackCell   = 0;	// 1:連黒分断禁のパズル

		k.ispzprv3ONLY  = 0;	// 1:ぱずぷれv3にしかないパズル
		k.isKanpenExist = 0;	// 1:pencilbox/カンペンにあるパズル

		//k.def_csize = 36;
		//k.def_psize = 24;
		//k.area = { bcell:0, wcell:0, number:0};	// areaオブジェクトで領域を生成する

		base.setTitle("タタミバリ","Tatamibari");
		base.setExpression("　左ドラッグで境界線が、右ドラッグで補助記号が入力できます。",
						   " Left Button Drag to input border lines, Right to input auxiliary marks.");
		base.setFloatbgcolor("rgb(96, 224, 0)");
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
				if(this.btn.Left) this.inputborderans();
				else if(this.btn.Right) this.inputQsubLine();
			}
		};
		mv.mouseup = function(){ };
		mv.mousemove = function(){
			if(k.playmode){
				if(this.btn.Left) this.inputborderans();
				else if(this.btn.Right) this.inputQsubLine();
			}
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(k.playmode){ return;}
			if(this.moveTCell(ca)){ return;}
			this.key_inputMarks(ca);
		};
		kc.key_inputMarks = function(ca){
			if(k.playmode){ return false;}
			var cc = tc.getTCC();

			if     (ca=='q'||ca=='1'){ bd.sQnC(cc, 1); }
			else if(ca=='w'||ca=='2'){ bd.sQnC(cc, 2); }
			else if(ca=='e'||ca=='3'){ bd.sQnC(cc, 3); }
			else if(ca=='r'||ca=='4'){ bd.sQnC(cc,-1); }
			else if(ca==' '         ){ bd.sQnC(cc,-1); }
			else if(ca=='-'         ){ bd.sQnC(cc,(bd.QnC(cc)!=-2?-2:-1)); }
			else{ return false;}

			pc.paint(bd.cell[cc].cx-1, bd.cell[cc].cy-1, bd.cell[cc].cx+1, bd.cell[cc].cy+1);
			return true;
		};

		if(k.EDITOR){
			kp.kpgenerate = function(mode){
				this.inputcol('num','knumq','q','╋');
				this.inputcol('num','knumw','w','┃');
				this.inputcol('num','knume','e','━');
				this.insertrow();
				this.inputcol('num','knumr','r',' ');
				this.inputcol('num','knum.','-','?');
				this.inputcol('empty','knumx','','');
				this.insertrow();
			};
			kp.generate(kp.ORIGINAL, true, false, kp.kpgenerate);
			kp.kpinput = function(ca){
				kc.key_inputMarks(ca);
			};
		}

		bd.maxnum = 3;
	},


	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_DLIGHT;

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);
		//	this.flushCanvasAll();

			this.drawBGCells(x1,y1,x2,y2);
			this.drawDashedGrid(x1,y1,x2,y2);
			this.drawBorders(x1,y1,x2,y2);

			this.drawMarks(x1,y1,x2,y2);

			this.drawQuesHatenas(x1,y1,x2,y2);
			this.drawBorderQsubs(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);

			this.drawTarget(x1,y1,x2,y2);
		};

		pc.drawMarks = function(x1,y1,x2,y2){
			var lw = (mf(k.cwidth/12)>=3?mf(k.cwidth/12):3); //LineWidth
			var headers = ["c_lp1_", "c_lp2_"];
			g.fillStyle = this.BorderQuescolor;

			var clist = this.cellinside(x1,y1,x2,y2);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				var qn = bd.cell[c].qnum;
				if(qn===1||qn===2){
					if(this.vnop(headers[0]+c,1)){
						g.fillRect(bd.cell[c].px+mf(k.cwidth/2)-1, bd.cell[c].py+mf((k.cheight+lw)*0.15), lw, mf((k.cheight+lw)*0.7));
					}
				}
				else{ this.vhide(headers[0]+c);}

				if(qn===1||qn===3){
					if(this.vnop(headers[1]+c,1)){
						g.fillRect(bd.cell[c].px+mf((k.cwidth+lw)*0.15), bd.cell[c].py+mf(k.cheight/2)-1, mf((k.cwidth+lw)*0.7), lw);
					}
				}
				else{ this.vhide(headers[1]+c);}
			}
			this.vinc();
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decodeTatamibari();
		};
		enc.pzlexport = function(type){
			this.encodeTatamibari();
		};

		enc.decodeTatamibari = function(){
			var c=0, bstr = this.outbstr;
			for(var i=0;i<bstr.length;i++){
				var ca = bstr.charAt(i);

				if     (ca == '.')             { bd.sQnC(c,-2); c++;}
				else if(ca == '1')             { bd.sQnC(c, 2); c++;}
				else if(ca == '2')             { bd.sQnC(c, 3); c++;}
				else if(ca == '3')             { bd.sQnC(c, 1); c++;}
				else if(ca >= 'g' && ca <= 'z'){ c += (parseInt(ca,36)-15);}
				else{ c++;}

				if(c > bd.cellmax){ break;}
			}

			this.outbstr = bstr.substr(i);
		};
		enc.encodeTatamibari = function(){
			var count, pass, i;
			var cm="";
			var pstr="";

			count=0;
			for(i=0;i<bd.cellmax;i++){
				if     (bd.QnC(i) == -2){ pstr = ".";}
				else if(bd.QnC(i) ==  1){ pstr = "3";}
				else if(bd.QnC(i) ==  2){ pstr = "1";}
				else if(bd.QnC(i) ==  3){ pstr = "2";}
				else{ pstr = ""; count++;}

				if(count==0){ cm += pstr;}
				else if(pstr || count==20){ cm+=((15+count).toString(36)+pstr); count=0;}
			}
			if(count>0){ cm+=(15+count).toString(36);}

			this.outbstr += cm;
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeCell( function(c,ca){
				if     (ca=="a"){ bd.sQnC(c, 2);}
				else if(ca=="b"){ bd.sQnC(c, 3);}
				else if(ca=="c"){ bd.sQnC(c, 1);}
				else if(ca=="-"){ bd.sQnC(c,-2);}
			});
			this.decodeBorderAns();
		};
		fio.encodeData = function(){
			this.encodeCell( function(c){
				if     (bd.QnC(c)==-2){ return "- ";}
				else if(bd.QnC(c)== 1){ return "c ";}
				else if(bd.QnC(c)== 2){ return "a ";}
				else if(bd.QnC(c)== 3){ return "b ";}
				else                  { return ". ";}
			});
			this.encodeBorderAns();
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			if( !this.checkLcntCross(4,0) ){
				this.setAlert('十字の交差点があります。','There is a crossing border lines,'); return false;
			}

			var rinfo = area.getRoomInfo();
			if( !this.checkNoNumber(rinfo) ){
				this.setAlert('記号の入っていないタタミがあります。','A tatami has no marks.'); return false;
			}

			if( !this.checkAllArea(rinfo, f_true, function(w,h,a,n){ return (n!=1||a<=0||(w*h!=a)||w==h);} ) ){
				this.setAlert('正方形でないタタミがあります。','A tatami is not regular rectangle.'); return false;
			}
			if( !this.checkAllArea(rinfo, f_true, function(w,h,a,n){ return (n!=3||a<=0||(w*h!=a)||w>h);} ) ){
				this.setAlert('横長ではないタタミがあります。','A tatami is not horizontally long rectangle.'); return false;
			}
			if( !this.checkAllArea(rinfo, f_true, function(w,h,a,n){ return (n!=2||a<=0||(w*h!=a)||w<h);} ) ){
				this.setAlert('縦長ではないタタミがあります。','A tatami is not vertically long rectangle.'); return false;
			}

			if( !this.checkDoubleNumber(rinfo) ){
				this.setAlert('1つのタタミに2つ以上の記号が入っています。','A tatami has plural marks.'); return false;
			}

			if( !this.checkAreaRect(rinfo) ){
				this.setAlert('タタミの形が長方形ではありません。','A tatami is not rectangle.'); return false;
			}

			if( !this.checkLcntCross(1,0) ){
				this.setAlert('途中で途切れている線があります。','There is a dead-end line.'); return false;
			}

			return true;
		};
	}
};
