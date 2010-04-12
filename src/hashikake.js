//
// パズル固有スクリプト部 橋をかけろ版 hashikake.js v3.3.0
//
Puzzles.hashikake = function(){ };
Puzzles.hashikake.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 9;}	// 盤面の横幅
		if(!k.qrows){ k.qrows = 9;}	// 盤面の縦幅
		k.irowake = 1;			// 0:色分け設定無し 1:色分けしない 2:色分けする

		k.iscross      = 0;		// 1:Crossが操作可能なパズル
		k.isborder     = 1;		// 1:Border/Lineが操作可能なパズル
		k.isextendcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

		k.isoutsidecross  = 0;	// 1:外枠上にCrossの配置があるパズル
		k.isoutsideborder = 0;	// 1:盤面の外枠上にborderのIDを用意する
		k.isLineCross     = 1;	// 1:線が交差するパズル
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
		k.isKanpenExist = 1;	// 1:pencilbox/カンペンにあるパズル

		//k.def_csize = 36;
		k.def_psize = 16;
		//k.area = { bcell:0, wcell:0, number:0};	// areaオブジェクトで領域を生成する

		base.setTitle("橋をかけろ","Bridges");
		base.setExpression("　左ボタンで線が、右ボタンで×が入力できます。",
						   " Left Button Drag to inpur lines, Right to input a cross.");
		base.setFloatbgcolor("rgb(127, 191, 0)");

		enc.pidKanpen = 'hashi';
	},
	menufix : function(){
		pp.addCheck('circolor','setting',false,'数字をグレーにする','Set Grey Color');
		pp.setLabel('circolor', '数字と同じ本数がかかったらグレーにする', 'Grey if the number is equal to linked bridges.');

		pp.funcs['circolor'] = function(){ pc.paintAll();};
	},

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

		mv.inputLine = function(){
			var pos = this.borderpos(0);
			if(pos.x==this.mouseCell.x && pos.y==this.mouseCell.y){ return;}

			var id = -1;
			if     (pos.y-this.mouseCell.y==-2){ id=bd.bnum(this.mouseCell.x  ,this.mouseCell.y-1);}
			else if(pos.y-this.mouseCell.y== 2){ id=bd.bnum(this.mouseCell.x  ,this.mouseCell.y+1);}
			else if(pos.x-this.mouseCell.x==-2){ id=bd.bnum(this.mouseCell.x-1,this.mouseCell.y  );}
			else if(pos.x-this.mouseCell.x== 2){ id=bd.bnum(this.mouseCell.x+1,this.mouseCell.y  );}

			var include = function(array,val){ for(var i=0;i<array.length;i++){ if(array[i]==val) return true;} return false;};
			if(this.mouseCell!=-1 && id!=-1){
				var idlist = this.getidlist(id);
				if(this.firstPos.x==-1 || !include(this.firstPos,id)){ this.inputData=-1;}
				if(this.inputData==-1){
					if     (bd.LiB(id)==0){ this.inputData=1;}
					else if(bd.LiB(id)==1){ this.inputData=2;}
					else                  { this.inputData=0;}
				}
				if(this.inputData> 0 && ((pos.x-this.mouseCell.x==-2)||(pos.y-this.mouseCell.y==-2))){ idlist=idlist.reverse();} // 色分けの都合上の処理
				for(var i=0;i<idlist.length;i++){
					if(this.inputData!=-1){ bd.sLiB(idlist[i], this.inputData); bd.sQsB(idlist[i], 0);}
					pc.paintLine(idlist[i]);
				}
				this.firstPos=idlist;
			}
			this.mouseCell = pos;
		};
		mv.getidlist = function(id){
			var idlist=[], bx1, bx2, by1, by2;
			var bx=bd.border[id].bx, by=bd.border[id].by;
			if(bd.border[id].bx&1){
				while(by>bd.minby && bd.QnC(bd.cnum(bx,by-1))===-1){ by-=2;} by1=by;
				while(by<bd.maxby && bd.QnC(bd.cnum(bx,by+1))===-1){ by+=2;} by2=by;
				bx1 = bx2 = bd.border[id].bx;
			}
			else if(bd.border[id].by&1){
				while(bx>bd.minbx && bd.QnC(bd.cnum(bx-1,by))===-1){ bx-=2;} bx1=bx;
				while(bx<bd.maxbx && bd.QnC(bd.cnum(bx+1,by))===-1){ bx+=2;} bx2=bx;
				by1 = by2 = bd.border[id].by;
			}
			if(!bd.isinside(bx,by)){ return [];}
			for(var i=bx1;i<=bx2;i+=2){ for(var j=by1;j<=by2;j+=2){ idlist.push(bd.bnum(i,j)); } }
			return idlist;
		};

		mv.inputpeke = function(){
			var pos = this.borderpos(0.22);
			var id = bd.bnum(pos.x, pos.y);
			if(id==-1 || (pos.x==this.mouseCell.x && pos.y==this.mouseCell.y)){ return;}

			if(this.inputData==-1){ this.inputData=(bd.QsB(id)!=2?2:0);}
			bd.sQsB(id, this.inputData);

			var idlist = this.getidlist(id);
			for(var i=0;i<idlist.length;i++){
				bd.sLiB(idlist[i], 0);
				pc.paintBorder(idlist[i]);
			}
			if(idlist.length==0){ pc.paintBorder(id);}
			this.mouseCell = pos;
		},
		mv.enableInputHatena = true;

		// キーボード入力系
		kc.keyinput = function(ca){
			if(k.playmode){ return;}
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum(ca);
		};

		if(k.EDITOR){
			kp.kpgenerate = function(mode){
				this.inputcol('num','knum1','1','1');
				this.inputcol('num','knum2','2','2');
				this.inputcol('num','knum3','3','3');
				this.inputcol('num','knum4','4','4');
				this.insertrow();
				this.inputcol('num','knum5','5','5');
				this.inputcol('num','knum6','6','6');
				this.inputcol('num','knum7','7','7');
				this.inputcol('num','knum8','8','8');
				this.insertrow();
				this.inputcol('num','knum_',' ',' ');
				this.inputcol('num','knum.','-','○');
				this.insertrow();
			};
			kp.generate(kp.ORIGINAL, true, false, kp.kpgenerate);
			kp.kpinput = function(ca){
				kc.key_inputqnum(ca);
			};
		}

		bd.maxnum = 8;
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_THIN;
		pc.bcolor    = "silver";
		pc.fontsizeratio = 0.85;
		pc.chassisflag = false;

		// 線の太さを通常より少し太くする
		pc.lwratio = 8;

		pc.paint = function(x1,y1,x2,y2){
			this.drawGrid(x1,y1,x2,y2,k.editmode);

			this.drawPekes(x1,y1,x2,y2,0);
			this.drawLines(x1,y1,x2,y2);

			this.drawCirclesAtNumber(x1,y1,x2,y2);
			this.drawNumbers(x1,y1,x2,y2);

			this.drawTarget(x1,y1,x2,y2);
		};

		// オーバーライド
		pc.drawLine1 = function(id, forceFlag){
			var vids = ["b_line_"+id,"b_dline1_"+id,"b_dline2_"+id];

			// LineWidth, LineMargin, LineSpace
			var lw = this.lw + this.addlw, lm = this.lm, ls = lw*1.5;
			if(forceFlag!==false && this.setLineColor(id)){
				if(bd.border[id].line==1){
					if(this.vnop(vids[0],this.FILL)){
						if(bd.border[id].bx&1){ g.fillRect(bd.border[id].px-lm, bd.border[id].py-this.bh-lm, lw, this.ch+lw);}
						if(bd.border[id].by&1){ g.fillRect(bd.border[id].px-this.bw-lm, bd.border[id].py-lm, this.cw+lw, lw);}
					}
				}
				else{ this.vhide(vids[0]);}

				if(bd.border[id].line==2){
					if(this.vnop(vids[1],this.FILL)){
						if(bd.border[id].bx&1){ g.fillRect(bd.border[id].px-lm-ls, bd.border[id].py-this.bh-lm, lw, this.ch+lw);}
						if(bd.border[id].by&1){ g.fillRect(bd.border[id].px-this.bw-lm, bd.border[id].py-lm-ls, this.cw+lw, lw);}
					}
					if(this.vnop(vids[2],this.FILL)){
						if(bd.border[id].bx&1){ g.fillRect(bd.border[id].px-lm+ls, bd.border[id].py-this.bh-lm, lw, this.ch+lw);}
						if(bd.border[id].by&1){ g.fillRect(bd.border[id].px-this.bw-lm, bd.border[id].py-lm+ls, this.cw+lw, lw);}
					}
				}
				else{ this.vhide([vids[1], vids[2]]);}
			}
			else{ this.vhide(vids);}
		};
		// 背景色をつける為オーバーライド
		pc.drawCircle1AtNumber = function(c){
			if(c===-1){ return;}

			var rsize = this.cw*0.44;
			var header = "c_cir_";

			if(bd.cell[c].qnum!=-1){
				g.lineWidth   = this.cw*0.05;
				g.strokeStyle = this.Cellcolor;

				if (pp.getVal('circolor') && bd.cell[c].qnum===ans.getCountOfBridges(c))
											 { g.fillStyle = this.bcolor;      }
				else if(bd.cell[c].error===1){ g.fillStyle = this.errbcolor1;  }
				else                         { g.fillStyle = this.circledcolor;}

				if(this.vnop(header+c,this.FILL)){
					g.shapeCircle(bd.cell[c].cpx, bd.cell[c].cpy, rsize);
				}
			}
			else{ this.vhide([header+c]);}
		};

		line.repaintParts = function(idlist){
			var clist = this.getClistFromIdlist(idlist);
			for(var i=0;i<clist.length;i++){
				pc.drawCircle1AtNumber(clist[i]);
				pc.dispnumCell(clist[i]);
			}
		};
		line.iscrossing = function(cc){ return (bd.QnC(cc)===-1);};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decodeNumber16();
		};
		enc.pzlexport = function(type){
			this.encodeNumber16();
		};

		enc.decodeKanpen = function(){
			fio.decodeCellQnum_kanpen();
		};
		enc.encodeKanpen = function(){
			fio.encodeCellQnum_kanpen();
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

		fio.kanpenOpen = function(){
			this.decodeCell( function(c,ca){
				if(ca>="1" && ca<="8"){ bd.sQnC(c, parseInt(ca));}
				else if(ca=="9")      { bd.sQsC(c, -2);}
			});
			this.decodeCell( function(c,ca){
				if(ca!="0"){
					var datah = (parseInt(ca)&3);
					if(datah>0){
						bd.sLiB(bd.ub(c),datah);
						bd.sLiB(bd.db(c),datah);
					}
					var dataw = ((parseInt(ca)&12)>>2);
					if(dataw>0){
						bd.sLiB(bd.lb(c),dataw);
						bd.sLiB(bd.rb(c),dataw);
					}
				}
			});
		};
		fio.kanpenSave = function(){
			this.encodeCell( function(c){
				if     (bd.QnC(c) > 0){ return (bd.QnC(c).toString() + " ");}
				else if(bd.QnC(c)==-2){ return "9 ";}
				else                  { return ". ";}
			});
			this.encodeCell( function(c){
				if(bd.QnC(c)!=-1){ return "0 ";}
				var datah = bd.LiB(bd.ub(c));
				var dataw = bd.LiB(bd.lb(c));
				return ""+((datah>0?datah:0)+(dataw>0?(dataw<<2):0))+" ";
			});
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			if( !this.checkCellNumber(1) ){
				this.setAlert('数字につながる橋の数が違います。','The number of connecting bridges to a number is not correct.'); return false;
			}

			this.performAsLine = true;
			if( !this.checkOneArea( line.getLareaInfo() ) ){
				this.setAlert('線が全体で一つながりになっていません。', 'All lines and numbers are not connected each other.'); return false;
			}

			if( !this.checkCellNumber(2) ){
				this.setAlert('数字につながる橋の数が違います。','The number of connecting bridges to a number is not correct.'); return false;
			}
			return true;
		};
		ans.check1st = function(){ return true;};

		ans.checkCellNumber = function(flag){
			var result = true;
			for(var cc=0;cc<bd.cellmax;cc++){
				var qn = bd.QnC(cc);
				if(qn<0){ continue;}

				var cnt = this.getCountOfBridges(cc);
				if((flag===1 && qn<cnt)||(flag===2 && qn>cnt)){
					if(this.inAutoCheck){ return false;}
					bd.sErC([cc],1);
					result = false;
				}
			}
			return result;
		};
		ans.getCountOfBridges = function(cc){
			var cnt=0, idlist=[bd.ub(cc), bd.db(cc), bd.lb(cc), bd.rb(cc)];
			for(var i=0;i<idlist.length;i++){
				var id = idlist[i];
				if(id!==-1 && bd.border[id].line>0){ cnt+=bd.border[id].line;}
			}
			return cnt;
		};
	}
};
