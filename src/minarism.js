//
// パズル固有スクリプト部 マイナリズム版 minarism.js v3.3.1
//
Puzzles.minarism = function(){ };
Puzzles.minarism.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 7;}	// 盤面の横幅
		if(!k.qrows){ k.qrows = 7;}	// 盤面の縦幅
		k.irowake  = 0;		// 0:色分け設定無し 1:色分けしない 2:色分けする

		k.iscross  = 0;		// 1:盤面内側のCrossがあるパズル 2:外枠上を含めてCrossがあるパズル
		k.isborder = 1;		// 1:Border/Lineが操作可能なパズル 2:外枠上も操作可能なパズル
		k.isexcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

		k.isLineCross     = false;	// 線が交差するパズル
		k.isCenterLine    = false;	// マスの真ん中を通る線を回答として入力するパズル
		k.isborderAsLine  = false;	// 境界線をlineとして扱う
		k.hasroom         = false;	// いくつかの領域に分かれている/分けるパズル
		k.roomNumber      = false;	// 部屋の問題の数字が1つだけ入るパズル

		k.dispzero        = false;	// 0を表示するかどうか
		k.isDispHatena    = false;	// qnumが-2のときに？を表示する
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

		if(k.EDITOR){
			base.setExpression("　キーボードで数字および、QWキーで不等号が入力できます。不等号はマウスのドラッグで、数字はクリックでも入力できます。",
							   " It is able to input number of question by keyboard, and 'QW' key to input inequality mark. It is also available to Left Button Drag to input inequality mark, to Click to input number.");
		}
		else{
			base.setExpression("　キーボードやマウスで数字が入力できます。",
							   " It is available to input number by keybord or mouse");
		}
		base.setTitle("マイナリズム","Minarism");
		base.setFloatbgcolor("rgb(96, 96, 96)");
	},
	menufix : function(){ },

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(k.editmode && this.btn.Left) this.inputmark1();
			else if(k.playmode) this.inputqnum();
		};
		mv.mouseup = function(){
			if(k.editmode && this.notInputted()) this.inputmark();
		};
		mv.mousemove = function(){
			if(k.editmode && this.btn.Left) this.inputmark1();
		};

		mv.inputmark1 = function(){
			var pos = this.borderpos(0);
			if(bd.cnum(pos.x,pos.y)===null){ return;}

			var id = this.getnb(this.prevPos, pos);
			if(id!==null){
				var dir = this.getdir(this.prevPos, pos);
				this.inputData = ((dir===k.UP||dir===k.LT) ? 1 : 2);

				bd.sQuB(id,(this.inputData!=bd.QuB(id)?this.inputData:0));
				pc.paintBorder(id);
			}
			this.prevPos = pos;
		};
		mv.inputmark = function(){
			var pos = this.borderpos(0.33);
			if(!bd.isinside(pos.x,pos.y)){ return;}
			var id = bd.bnum(pos.x, pos.y);

			if(tc.cursorx!==pos.x || tc.cursory!==pos.y){
				var tcp = tc.getTCP(), flag = false;
				tc.setTCP(pos);
				pc.paintPos(tcp);
				pc.paintPos(pos);
			}
			else if(id!==null){
				this.inputbqnum(id);
				pc.paintBorder(id);
			}
		};
		mv.inputbqnum = function(id){
			var qnum = bd.QnB(id), qs = bd.QuB(id);
			if(this.btn.Left){
				if     (qnum==-1 && qs==0){ bd.sQnB(id,-1); bd.sQuB(id,1);}
				else if(qnum==-1 && qs==1){ bd.sQnB(id,-1); bd.sQuB(id,2);}
				else if(qnum==-1 && qs==2){ bd.sQnB(id, 1); bd.sQuB(id,0);}
				else if(qnum==Math.max(k.qcols,k.qrows)-1){ bd.sQnB(id,-2); bd.sQuB(id,0);}
				else if(qnum==-2)         { bd.sQnB(id,-1); bd.sQuB(id,0);}
				else{ bd.sQnB(id,qnum+1);}
			}
			else if(this.btn.Right){
				if     (qnum==-1 && qs==0){ bd.sQnB(id,-2); bd.sQuB(id,0);}
				else if(qnum==-2)         { bd.sQnB(id,Math.max(k.qcols,k.qrows)-1); bd.sQuB(id,0);}
				else if(qnum== 1 && qs==0){ bd.sQnB(id,-1); bd.sQuB(id,2);}
				else if(qnum==-1 && qs==2){ bd.sQnB(id,-1); bd.sQuB(id,1);}
				else if(qnum==-1 && qs==1){ bd.sQnB(id,-1); bd.sQuB(id,0);}
				else{ bd.sQnB(id,qnum-1);}
			}
			pc.paintBorder(id);
		},

		// キーボード入力系
		kc.keyinput = function(ca){
			if     (k.editmode && this.moveTBorder(ca)){ return;}
			else if(k.playmode && this.moveTCell(ca)){ return;}

			if     (k.editmode){ this.key_inputmark(ca);}
			else if(k.playmode){ this.key_inputqnum(ca);}
		};
		kc.key_inputmark = function(ca){
			var id = tc.getTBC();
			if(id===null){ return false;}

			if     (ca=='q'){ bd.sQuB(id,(bd.QuB(id)!=1?1:0)); bd.sQnB(id,-1); }
			else if(ca=='w'){ bd.sQuB(id,(bd.QuB(id)!=2?2:0)); bd.sQnB(id,-1); }
			else if(ca=='e' || ca==' ' || ca=='-'){ bd.sQuB(id,0); bd.sQnB(id,-1); }
			else if('0'<=ca && ca<='9'){
				var num = parseInt(ca);
				var max = Math.max(k.qcols,k.qrows)-1;

				bd.sQuB(id,0);
				if(bd.QnB(id)<=0 || this.prev!=id){ if(num<=max){ bd.sQnB(id,num);}}
				else{
					if(bd.QnB(id)*10+num<=max){ bd.sQnB(id,bd.QnB(id)*10+num);}
					else if(num<=max){ id.sQnB(id,num);}
				}
			}
			else{ return false;}

			pc.paintBorder(id);
			return true;
		};

		menu.ex.adjustSpecial = function(key,d){
			if(key & this.TURNFLIP){ // 反転・回転全て
				for(var c=0;c<bd.bdmax;c++){ if(bd.QuB(c)!=0){ bd.sQuB(c,{1:2,2:1}[bd.QuB(c)]); } }
			}
		};
		menu.ex.expandborder = function(key){ };

		tc.setAlign = function(){
			this.cursorx -= ((this.cursorx+1)%2);
			this.cursory -= ((this.cursory+1)%2);
		};

		bd.nummaxfunc = function(cc){ return Math.max(k.qcols,k.qrows);};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_LIGHT;

		pc.paint = function(x1,y1,x2,y2){
			this.drawBDMbase(x1,y1,x2,y2);

			this.drawBGCells(x1,y1,x2,y2);
			this.drawDashedGrid(x1-1,y1-1,x2,y2);

			this.drawBDMarks(x1,y1,x2,y2);
			this.drawNumbers(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);

			this.drawTarget_minarism(x1,y1,x2,y2);
		};

		pc.drawBDMbase = function(x1,y1,x2,y2){
			if(!g.use.canvas){ return;}
			var csize = this.cw*0.29;
			var idlist = bd.borderinside(x1-1,y1-1,x2+1,y2+1);
			for(var i=0;i<idlist.length;i++){
				var id = idlist[i];

				if(bd.border[id].ques!=0 || bd.border[id].qnum!=-1){
					g.fillStyle = "white";
					g.fillRect(bd.border[id].px-csize, bd.border[id].py-csize, 2*csize+1, 2*csize+1);
				}
			}
		};
		pc.drawBDMarks = function(x1,y1,x2,y2){
			this.vinc('border_mark', 'auto');

			var csize = this.cw*0.27;
			var ssize = this.cw*0.22;
			var headers = ["b_cp_", "b_dt1_", "b_dt2_"];

			g.lineWidth = 1;
			g.strokeStyle = this.cellcolor;

			var idlist = bd.borderinside(x1-1,y1-1,x2+1,y2+1);
			for(var i=0;i<idlist.length;i++){
				var id = idlist[i], obj = bd.border[id], key = ['border',id].join('_');
				// ○の描画
				if(obj.qnum!=-1){
					g.fillStyle = (obj.error==1 ? this.errcolor1 : "white");
					if(this.vnop(headers[0]+id,this.FILL)){
						g.shapeCircle(obj.px, obj.py, csize);
					}
				}
				else{ this.vhide([headers[0]+id]);}

				// 数字の描画
				if(obj.qnum>0){
					this.dispnum(key, 1, ""+obj.qnum, 0.45, this.borderfontcolor, obj.px, obj.py);
				}
				else{ this.hideEL(key);}

				// 不等号の描画
				if(obj.ques===1){
					if(this.vnop(headers[1]+id,this.NONE)){
						if(obj.bx&1){ g.setOffsetLinePath(obj.px,obj.py ,-ssize,+ssize ,0,-ssize ,+ssize,+ssize, false);}
						else        { g.setOffsetLinePath(obj.px,obj.py ,+ssize,-ssize ,-ssize,0 ,+ssize,+ssize, false);}
						g.stroke();
					}
				}
				else{ this.vhide(headers[1]+id);}

				if(obj.ques===2){
					if(this.vnop(headers[2]+id,this.NONE)){
						if(obj.bx&1){ g.setOffsetLinePath(obj.px,obj.py ,-ssize,-ssize ,0,+ssize ,+ssize,-ssize, false);}
						else        { g.setOffsetLinePath(obj.px,obj.py ,-ssize,-ssize ,+ssize,0 ,-ssize,+ssize, false);}
						g.stroke();
					}
				}
				else{ this.vhide(headers[2]+id);}
			}
		};

		pc.drawTarget_minarism = function(x1,y1,x2,y2){
			var islarge = k.playmode;
			this.drawCursor(x1,y1,x2,y2,islarge);
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decodeMinarism(type);
		};
		enc.pzlexport = function(type){
			this.encodeMinarism(type);
		};

		enc.decodeMinarism = function(type){
			// 盤面外数字のデコード
			var id=0, a=0, mgn=0, bstr = this.outbstr;
			for(var i=0;i<bstr.length;i++){
				var ca = bstr.charAt(i);

				if(type==1){
					if     (id<k.qcols*k.qrows)  { mgn=((id/k.qcols)|0);}
					else if(id<2*k.qcols*k.qrows){ mgn=k.qrows;}
				}

				if     (this.include(ca,'0','9')||this.include(ca,'a','f')){ bd.sQnB(id-mgn, parseInt(ca,16)); id++;}
				else if(ca=="-"){ bd.sQnB(id-mgn, parseInt(bstr.substr(i+1,2),16)); id++; i+=2;}
				else if(ca=="g"){ bd.sQuB(id-mgn, ((type==0 || id<k.qcols*k.qrows)?1:2)); id++;}
				else if(ca=="h"){ bd.sQuB(id-mgn, ((type==0 || id<k.qcols*k.qrows)?2:1)); id++;}
				else if(this.include(ca,'i','z')){ id+=(parseInt(ca,36)-17);}
				else if(ca=="."){ bd.sQnB(id-mgn,-2); id++;}
				else if(type==1 && ca=="/"){ id=bd.cellmax;}
				else{ id++;}

				if(id >= 2*k.qcols*k.qrows){ a=i+1; break;}
			}
			this.outbstr = bstr.substr(a);
		};
		enc.encodeMinarism = function(type){
			var cm="", count=0, mgn=0;
			for(var id=0;id<bd.bdmax+(type==0?0:k.qcols);id++){
				if(type==1){
					if(id>0 && id<=(k.qcols-1)*k.qrows && id%(k.qcols-1)==0){ count++;}
					if(id==(k.qcols-1)*k.qrows){ if(count>0){ cm+=(17+count).toString(36); count=0;} cm += "/";}
				}

				if(id<bd.bdmax){
					var pstr = "";
					var val  = bd.QuB(id);
					var qnum = bd.QnB(id);

					if     (val == 1){ pstr = ((type==0 || id<bd.cellmax)?"g":"h");}
					else if(val == 2){ pstr = ((type==0 || id<bd.cellmax)?"h":"g");}
					else if(qnum==-2){ pstr = ".";}
					else if(qnum>= 0 && qnum< 16){ pstr = ""+ qnum.toString(16);}
					else if(qnum>=16 && qnum<256){ pstr = "-"+qnum.toString(16);}
					else{ count++;}
				}
				else{ count++;}

				if(count==0){ cm += pstr;}
				else if(pstr||count==18){ cm+=((17+count).toString(36)+pstr); count=0;}
			}
			if(count>0){ cm+=(17+count).toString(36);}

			this.outbstr += cm;
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeBorder( function(c,ca){
				if     (ca=="a"){ bd.sQuB(c, 1);}
				else if(ca=="b"){ bd.sQuB(c, 2);}
				else if(ca=="."){ bd.sQnB(c, -2);}
				else if(ca!="0"){ bd.sQnB(c, parseInt(ca));}
			});
			this.decodeCellQanssub();
		};
		fio.encodeData = function(){
			this.encodeBorder( function(c){
				if     (bd.QuB(c)== 1){ return "a ";}
				else if(bd.QuB(c)== 2){ return "b ";}
				else if(bd.QnB(c)==-2){ return ". ";}
				else if(bd.QnB(c)!=-1){ return ""+bd.QnB(c).toString()+" ";}
				else                  { return "0 ";}
			});
			this.encodeCellQanssub();
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			if( !this.checkRowsCols(this.isDifferentNumberInClist, bd.QaC) ){
				this.setAlert('同じ列に同じ数字が入っています。','There are same numbers in a row.'); return false;
			}

			if( !this.checkBDnumber() ){
				this.setAlert('丸付き数字とその両側の数字の差が一致していません。', 'The Difference between two Adjacent cells is not equal to the number on circle.'); return false;
			}

			if( !this.checkBDmark() ){
				this.setAlert('不等号と数字が矛盾しています。', 'A inequality sign is not correct.'); return false;
			}

			if( !this.checkAllCell(function(c){ return (bd.QaC(c)==-1);}) ){
				this.setAlert('数字の入っていないマスがあります。','There is a empty cell.'); return false;
			}

			return true;
		};
		ans.check1st = function(){ return this.checkAllCell(function(c){ return (bd.QaC(c)==-1);});};

		ans.checkBDnumber = function(){
			return this.checkBDSideCell(function(id,c1,c2){
				return (bd.QnB(id)>0 && bd.QnB(id)!=Math.abs(bd.QaC(c1)-bd.QaC(c2)));
			});
		};
		ans.checkBDmark = function(){
			return this.checkBDSideCell(function(id,c1,c2){
				var mark = bd.QuB(id);
				var a1 = bd.QaC(c1), a2 = bd.QaC(c2);
				return !(mark==0 || (mark==1 && a1<a2) || (mark==2 && a1>a2));
			});
		};
		ans.checkBDSideCell = function(func){
			var result = true;
			for(var id=0;id<bd.bdmax;id++){
				var cc1 = bd.border[id].cellcc[0], cc2 = bd.border[id].cellcc[1];
				if(bd.QaC(cc1)>0 && bd.QaC(cc2)>0 && func(id,cc1,cc2)){
					if(this.inAutoCheck){ return false;}
					bd.sErC([cc1,cc2],1);
					result = false;
				}
			}
			return result;
		};
	}
};
