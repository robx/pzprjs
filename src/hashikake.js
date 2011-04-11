//
// パズル固有スクリプト部 橋をかけろ版 hashikake.js v3.4.0
//
Puzzles.hashikake = function(){ };
Puzzles.hashikake.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 9;}
		if(!k.qrows){ k.qrows = 9;}

		k.irowake  = 1;
		k.isborder = 1;

		k.isLineCross     = true;
		k.isCenterLine    = true;
		k.isInputHatena   = true;

		k.ispzprv3ONLY    = true;
		k.isKanpenExist   = true;

		k.bdmargin       = 0.50;
		k.bdmargin_image = 0.10;

		base.setFloatbgcolor("rgb(127, 191, 0)");
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

		mv.inputLine = function(){
			var pos = this.borderpos(0);
			if(this.prevPos.equals(pos)){ return;}

			var id = this.getnb(this.prevPos, pos);
			if(id!==null){
				var dir = this.getdir(this.prevPos, pos);
				var d = this.getrange(id);
				var idlist = new IDList(bd.borderinside(d.x1,d.y1,d.x2,d.y2));

				if(this.previdlist.isnull() || !this.previdlist.include(id)){ this.inputData=null;}
				if(this.inputData===null){ this.inputData = [1,2,0][bd.LiB(id)];}
				if(this.inputData>0 && (dir===k.UP||dir===k.LT)){ idlist.reverseData();} // 色分けの都合上の処理
				for(var i=0;i<idlist.data.length;i++){
					bd.sLiB(idlist.data[i], this.inputData);
					bd.sQsB(idlist.data[i], 0);
				}
				this.previdlist = idlist;

				pc.paintRange(d.x1-1,d.y1-1,d.x2+1,d.y2+1);
			}
			this.prevPos = pos;
		};
		mv.previdlist = new IDList();

		mv.getrange = function(id){
			var bx=bd.border[id].bx, by=bd.border[id].by;
			var d = {x1:bx, x2:bx, y1:by, y2:by};
			if(bd.border[id].bx&1){
				while(d.y1>bd.minby && bd.noNum(bd.cnum(bx,d.y1-1))){d.y1-=2;}
				while(d.y2<bd.maxby && bd.noNum(bd.cnum(bx,d.y2+1))){d.y2+=2;}
			}
			else if(bd.border[id].by&1){
				while(d.x1>bd.minbx && bd.noNum(bd.cnum(d.x1-1,by))){d.x1-=2;}
				while(d.x2<bd.maxbx && bd.noNum(bd.cnum(d.x2+1,by))){d.x2+=2;}
			}
			return d;
		};

		mv.inputpeke = function(){
			var pos = this.borderpos(0.22);
			if(this.prevPos.equals(pos)){ return;}

			var id = bd.bnum(pos.x, pos.y);
			if(id===null){ return;}

			if(this.inputData===null){ this.inputData=(bd.QsB(id)!=2?2:0);}
			bd.sQsB(id, this.inputData);

			var d = this.getrange(id);
			var idlist = new IDList(bd.borderinside(d.x1,d.y1,d.x2,d.y2));
			for(var i=0;i<idlist.length;i++){ bd.sLiB(idlist.data[i], 0);}
			this.prevPos = pos;

			pc.paintRange(d.x1-1,d.y1-1,d.x2+1,d.y2+1);
		},

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
		bd.lines.iscrossing = function(cc){ return bd.noNum(cc);};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_THIN;
		pc.bcolor    = "silver";
		pc.fontsizeratio = 0.85;

		// 線の太さを通常より少し太くする
		pc.lwratio = 8;

		pc.paint = function(){
			this.drawGrid(false, (k.editmode && !this.outputImage));

			this.drawPekes(0);
			this.drawLines();

			this.drawCirclesAtNumber();
			this.drawNumbers();

			this.drawTarget();
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

		pc.repaintParts = function(idlist){
			var clist = bd.lines.getClistFromIdlist(idlist);
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
					var uid=bd.bnum(obj.bx,obj.by-1), did=bd.bnum(obj.bx,obj.by+1);
					if(uid!==null){ bd.border[uid].line = datah;}
					if(did!==null){ bd.border[did].line = datah;}
				}
				var dataw = ((val&12)>>2);
				if(dataw>0){
					var lid=bd.bnum(obj.bx-1,obj.by), rid=bd.bnum(obj.bx+1,obj.by);
					if(lid!==null){ bd.border[lid].line = dataw;}
					if(rid!==null){ bd.border[rid].line = dataw;}
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
				var uid=bd.bnum(obj.bx,obj.by-1), lid=bd.bnum(obj.bx-1,obj.by);
				var datah = (uid!==null ? bd.border[uid].line : 0);
				var dataw = (lid!==null ? bd.border[lid].line : 0);
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
			if( !this.checkOneArea( bd.lines.getLareaInfo() ) ){
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
