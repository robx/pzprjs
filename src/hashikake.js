//
// パズル固有スクリプト部 橋をかけろ版 hashikake.js v3.3.1
//
Puzzles.hashikake = function(){ };
Puzzles.hashikake.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 9;}	// 盤面の横幅
		if(!k.qrows){ k.qrows = 9;}	// 盤面の縦幅
		k.irowake  = 1;		// 0:色分け設定無し 1:色分けしない 2:色分けする

		k.iscross  = 0;		// 1:盤面内側のCrossがあるパズル 2:外枠上を含めてCrossがあるパズル
		k.isborder = 1;		// 1:Border/Lineが操作可能なパズル 2:外枠上も操作可能なパズル
		k.isexcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

		k.isLineCross     = true;	// 線が交差するパズル
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
		k.isKanpenExist   = true;	// pencilbox/カンペンにあるパズル

		k.bdmargin       = 0.50;	// 枠外の一辺のmargin(セル数換算)
		k.bdmargin_image = 0.10;	// 画像出力時のbdmargin値

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
			if(k.editmode){ this.inputqnum();}
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
			if(this.prevPos.equals(pos)){ return;}

			var id = this.getnb(this.prevPos, pos);
			if(id!==null){
				var include = function(array,val){ for(var i=0;i<array.length;i++){ if(array[i]==val) return true;} return false;};
				var dir = this.getdir(this.prevPos, pos);
				var idlist = this.getidlist(id);
				if(this.previdlist.length===0 || !include(this.previdlist, id)){ this.inputData=null;}
				if(this.inputData===null){ this.inputData = [1,2,0][bd.LiB(id)];}
				if(this.inputData>0 && (dir===k.UP||dir===k.LT)){ idlist=idlist.reverse();} // 色分けの都合上の処理
				for(var i=0;i<idlist.length;i++){
					if(this.inputData!==null){ bd.sLiB(idlist[i], this.inputData); bd.sQsB(idlist[i], 0);}
					pc.paintLine(idlist[i]);
				}
				this.previdlist = idlist;
			}
			this.prevPos = pos;
		};
		mv.previdlist = [];
		mv.getidlist = function(id){
			var idlist=[], bx=bd.border[id].bx, by=bd.border[id].by;
			if(bd.border[id].bx&1){
				var by1=by, by2=by;
				while(by1>bd.minby && bd.noNum(bd.cnum(bx,by1-1))){ by1-=2;}
				while(by2<bd.maxby && bd.noNum(bd.cnum(bx,by2+1))){ by2+=2;}
				if(bd.minby<by1 && by2<bd.maxby){
					for(by=by1;by<=by2;by+=2){ idlist.push(bd.bnum(bx,by)); }
				}
			}
			else if(bd.border[id].by&1){
				var bx1=bx, bx2=bx;
				while(bx1>bd.minbx && bd.noNum(bd.cnum(bx1-1,by))){ bx1-=2;}
				while(bx2<bd.maxbx && bd.noNum(bd.cnum(bx2+1,by))){ bx2+=2;}
				if(bd.minbx<bx1 && bx2<bd.maxbx){
					for(bx=bx1;bx<=bx2;bx+=2){ idlist.push(bd.bnum(bx,by)); }
				}
			}
			return idlist;
		};

		mv.inputpeke = function(){
			var pos = this.borderpos(0.22);
			if(this.prevPos.equals(pos)){ return;}

			var id = bd.bnum(pos.x, pos.y);
			if(id===null){ return;}

			if(this.inputData===null){ this.inputData=(bd.QsB(id)!=2?2:0);}
			bd.sQsB(id, this.inputData);

			var idlist = this.getidlist(id);
			for(var i=0;i<idlist.length;i++){
				bd.sLiB(idlist[i], 0);
				pc.paintBorder(idlist[i]);
			}
			if(idlist.length===0){ pc.paintBorder(id);}
			this.prevPos = pos;
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
			kp.generate(kp.ORIGINAL, true, false);
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
			this.drawGrid(x1,y1,x2,y2,(k.editmode && !this.fillTextPrecisely));

			this.drawPekes(x1,y1,x2,y2,0);
			this.drawLines(x1,y1,x2,y2);

			this.drawCirclesAtNumber(x1,y1,x2,y2);
			this.drawNumbers(x1,y1,x2,y2);

			this.drawTarget(x1,y1,x2,y2);
		};

		// オーバーライド
		pc.drawLine1 = function(id){
			var vids = ["b_line_"+id,"b_dline1_"+id,"b_dline2_"+id];

			// LineWidth, LineMargin, LineSpace
			var lw = this.lw + this.addlw, lm = this.lm, ls = lw*1.5;
			if(this.setLineColor(id)){
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
			if(c===null){ return;}

			var rsize = this.cw*0.44;
			var header = "c_cir_";

			if(bd.cell[c].qnum!=-1){
				g.lineWidth   = this.cw*0.05;
				g.strokeStyle = this.cellcolor;

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
				pc.drawNumber1(clist[i]);
			}
		};
		line.iscrossing = function(cc){ return bd.noNum(cc);};
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
			this.decodeCell( function(obj,ca){
				if(ca>="1" && ca<="8"){ obj.qnum = parseInt(ca);}
				else if(ca==="9")     { obj.qnum = -2;}
			});
			this.decodeCell( function(obj,ca){
				if(ca==="0"){ return;}
				var val = parseInt(ca);
				var datah = (val&3);
				if(datah>0){
					var ub=bd.bnum(obj.bx,obj.by-1), db=bd.bnum(obj.bx,obj.by+1);
					if(ub!==null){ bd.border[ub].line = datah;}
					if(db!==null){ bd.border[db].line = datah;}
				}
				var dataw = ((val&12)>>2);
				if(dataw>0){
					var lb=bd.bnum(obj.bx-1,obj.by), rb=bd.bnum(obj.bx+1,obj.by);
					if(lb!==null){ bd.border[lb].line = dataw;}
					if(rb!==null){ bd.border[rb].line = dataw;}
				}
			});
		};
		fio.kanpenSave = function(){
			this.encodeCell( function(obj){
				if     (obj.qnum  > 0){ return (obj.qnum.toString() + " ");}
				else if(obj.qnum===-2){ return "9 ";}
				else                  { return ". ";}
			});
			this.encodeCell( function(obj){
				if(obj.qnum!==-1){ return "0 ";}
				var ub=bd.bnum(obj.bx,obj.by-1), lb=bd.bnum(obj.bx-1,obj.by);
				var datah = (ub!==null ? bd.border[ub].line : 0);
				var dataw = (lb!==null ? bd.border[lb].line : 0);
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
				if(!!bd.border[id] && bd.border[id].line>0){ cnt+=bd.border[id].line;}
			}
			return cnt;
		};
	}
};
