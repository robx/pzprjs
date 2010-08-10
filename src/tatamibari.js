//
// パズル固有スクリプト部 タタミバリ版 tatamibari.js v3.3.2
//
Puzzles.tatamibari = function(){ };
Puzzles.tatamibari.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}	// 盤面の横幅
		if(!k.qrows){ k.qrows = 10;}	// 盤面の縦幅
		k.irowake  = 0;		// 0:色分け設定無し 1:色分けしない 2:色分けする

		k.iscross  = 0;		// 1:盤面内側のCrossがあるパズル 2:外枠上を含めてCrossがあるパズル
		k.isborder = 1;		// 1:Border/Lineが操作可能なパズル 2:外枠上も操作可能なパズル
		k.isexcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

		k.isLineCross     = false;	// 線が交差するパズル
		k.isCenterLine    = false;	// マスの真ん中を通る線を回答として入力するパズル
		k.isborderAsLine  = false;	// 境界線をlineとして扱う
		k.hasroom         = true;	// いくつかの領域に分かれている/分けるパズル
		k.roomNumber      = false;	// 部屋の問題の数字が1つだけ入るパズル

		k.dispzero        = false;	// 0を表示するかどうか
		k.isDispHatena    = true;	// qnumが-2のときに？を表示する
		k.isAnsNumber     = false;	// 回答に数字を入力するパズル
		k.NumberWithMB    = false;	// 回答の数字と○×が入るパズル
		k.linkNumber      = false;	// 数字がひとつながりになるパズル

		k.BlackCell       = false;	// 黒マスを入力するパズル
		k.NumberIsWhite   = false;	// 数字のあるマスが黒マスにならないパズル
		k.RBBlackCell     = false;	// 連黒分断禁のパズル
		k.checkBlackCell  = false;	// 正答判定で黒マスの情報をチェックするパズル
		k.checkWhiteCell  = false;	// 正答判定で白マスの情報をチェックするパズル

		k.ispzprv3ONLY    = false;	// ぱずぷれアプレットには存在しないパズル
		k.isKanpenExist   = false;	// pencilbox/カンペンにあるパズル

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
			if(k.editmode){ this.inputqnum();}
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

			pc.paintCell(cc);
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
				this.inputcol('empty','','','');
				this.insertrow();
			};
			kp.generate(kp.ORIGINAL, true, false);
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
		pc.setBorderColorFunc('qans');

		pc.paint = function(x1,y1,x2,y2){
			this.drawBGCells(x1,y1,x2,y2);
			this.drawDashedGrid(x1,y1,x2,y2);
			this.drawBorders(x1,y1,x2,y2);

			this.drawMarks(x1,y1,x2,y2);

			this.drawHatenas(x1,y1,x2,y2);
			this.drawBorderQsubs(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);

			this.drawTarget(x1,y1,x2,y2);
		};

		pc.drawMarks = function(x1,y1,x2,y2){
			this.vinc('cell_ques', 'crispEdges');

			var lw = Math.max(this.cw/12, 3);	//LineWidth
			var ll = this.cw*0.70;				//LineLength
			var headers = ["c_lp1_", "c_lp2_"];
			g.fillStyle = this.borderQuescolor;

			var clist = bd.cellinside(x1,y1,x2,y2);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				var qn = bd.cell[c].qnum;
				if(qn===1||qn===2){
					if(this.vnop(headers[0]+c,this.NONE)){
						g.fillRect(bd.cell[c].cpx-lw/2, bd.cell[c].cpy-ll/2, lw, ll);
					}
				}
				else{ this.vhide(headers[0]+c);}

				if(qn===1||qn===3){
					if(this.vnop(headers[1]+c,this.NONE)){
						g.fillRect(bd.cell[c].cpx-ll/2, bd.cell[c].cpy-lw/2, ll, lw);
					}
				}
				else{ this.vhide(headers[1]+c);}
			}
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

				if     (ca==='.'){ bd.cell[c].qnum = -2;}
				else if(ca==='1'){ bd.cell[c].qnum = 2;}
				else if(ca==='2'){ bd.cell[c].qnum = 3;}
				else if(ca==='3'){ bd.cell[c].qnum = 1;}
				else if(ca>='g' && ca<='z'){ c+=(parseInt(ca,36)-16);}
				else{ c++;}

				c++;
				if(c>=bd.cellmax){ break;}
			}

			this.outbstr = bstr.substr(i);
		};
		enc.encodeTatamibari = function(){
			var count, pass, cm="";

			count=0;
			for(var c=0;c<bd.cellmax;c++){
				var pstr="", qn=bd.cell[c].qnum;
				if     (qn===-2){ pstr = ".";}
				else if(qn=== 1){ pstr = "3";}
				else if(qn=== 2){ pstr = "1";}
				else if(qn=== 3){ pstr = "2";}
				else{ count++;}

				if(count==0){ cm += pstr;}
				else if(pstr || count==20){ cm+=((15+count).toString(36)+pstr); count=0;}
			}
			if(count>0){ cm+=(15+count).toString(36);}

			this.outbstr += cm;
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeCell( function(obj,ca){
				if     (ca==="a"){ obj.qnum = 2;}
				else if(ca==="b"){ obj.qnum = 3;}
				else if(ca==="c"){ obj.qnum = 1;}
				else if(ca==="-"){ obj.qnum =-2;}
			});
			this.decodeBorderAns();
		};
		fio.encodeData = function(){
			this.encodeCell( function(obj){
				if     (obj.qnum===-2){ return "- ";}
				else if(obj.qnum=== 1){ return "c ";}
				else if(obj.qnum=== 2){ return "a ";}
				else if(obj.qnum=== 3){ return "b ";}
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
