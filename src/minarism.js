//
// パズル固有スクリプト部 マイナリズム版 minarism.js v3.3.2
//
Puzzles.minarism = function(){ };
Puzzles.minarism.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 7;}
		if(!k.qrows){ k.qrows = 7;}
		k.irowake  = 0;

		k.iscross  = 0;
		k.isborder = 1;
		k.isexcell = 0;

		k.isLineCross     = false;
		k.isCenterLine    = false;
		k.isborderAsLine  = false;
		k.hasroom         = false;
		k.roomNumber      = false;

		k.dispzero        = false;
		k.isDispHatena    = false;
		k.isInputHatena   = false;
		k.inputQnumDirect = false;
		k.isAnsNumber     = true;
		k.NumberWithMB    = false;
		k.linkNumber      = false;

		k.BlackCell       = false;
		k.NumberIsWhite   = false;
		k.numberAsObject  = false;
		k.RBBlackCell     = false;
		k.checkBlackCell  = false;
		k.checkWhiteCell  = false;

		k.ispzprv3ONLY    = false;
		k.isKanpenExist   = false;

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
			if(k.editmode && this.btn.Left) this.inputmark_mousemove();
			else if(k.playmode) this.inputqnum();
		};
		mv.mouseup = function(){
			if(k.editmode && this.notInputted()) this.inputmark_mouseup();
		};
		mv.mousemove = function(){
			if(k.editmode && this.btn.Left) this.inputmark_mousemove();
		};

		mv.inputmark_mousemove = function(){
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
		mv.inputmark_mouseup = function(){
			var pos = this.borderpos(0.33);
			if(!bd.isinside(pos.x,pos.y)){ return;}

			if(!tc.cursor.equals(pos)){
				var tcp = tc.getTCP(), flag = false;
				tc.setTCP(pos);
				pc.paintPos(tcp);
				pc.paintPos(pos);
			}
			else{
				var id = bd.bnum(pos.x, pos.y);
				if(id!==null){
					var qn=bd.QnB(id), qs=bd.QuB(id);
					if(this.btn.Left){
						if     (qn===-1 && qs===0){ bd.sQnB(id,-1); bd.sQuB(id,1);}
						else if(qn===-1 && qs===1){ bd.sQnB(id,-1); bd.sQuB(id,2);}
						else if(qn===-1 && qs===2){ bd.sQnB(id, 1); bd.sQuB(id,0);}
						else if(qn===Math.max(k.qcols,k.qrows)-1){ bd.sQnB(id,-2); bd.sQuB(id,0);}
						else if(qn===-2)          { bd.sQnB(id,-1); bd.sQuB(id,0);}
						else{ bd.sQnB(id,qn+1);}
					}
					else if(this.btn.Right){
						if     (qn===-1 && qs===0){ bd.sQnB(id,-2); bd.sQuB(id,0);}
						else if(qn===-2)          { bd.sQnB(id,Math.max(k.qcols,k.qrows)-1); bd.sQuB(id,0);}
						else if(qn=== 1 && qs===0){ bd.sQnB(id,-1); bd.sQuB(id,2);}
						else if(qn===-1 && qs===2){ bd.sQnB(id,-1); bd.sQuB(id,1);}
						else if(qn===-1 && qs===1){ bd.sQnB(id,-1); bd.sQuB(id,0);}
						else{ bd.sQnB(id,qn-1);}
					}
					pc.paintBorder(id);
				}
			}
		};

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
				for(var id=0;id<bd.bdmax;id++){ if(bd.QuB(id)!=0){ bd.sQuB(id,{1:2,2:1}[bd.QuB(id)]); } }
			}
		};
		menu.ex.expandborder = function(key){ };

		tc.setAlign = function(){
			this.cursor.x -= ((this.cursor.x+1)%2);
			this.cursor.y -= ((this.cursor.y+1)%2);
		};

		bd.nummaxfunc = function(cc){ return Math.max(k.qcols,k.qrows);};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_LIGHT;

		pc.paint = function(){
			this.drawBDMbase();

			this.drawBGCells();
			this.drawDashedGrid();

			this.drawBDMarks();
			this.drawNumbers();

			this.drawChassis();

			this.drawTarget_minarism();
		};

		pc.drawBDMbase = function(){
			if(!g.use.canvas){ return;}
			var csize = this.cw*0.29;
			var idlist = this.range.borders;
			for(var i=0;i<idlist.length;i++){
				var id = idlist[i];

				if(bd.border[id].ques!=0 || bd.border[id].qnum!=-1){
					g.fillStyle = "white";
					g.fillRect(bd.border[id].px-csize, bd.border[id].py-csize, 2*csize+1, 2*csize+1);
				}
			}
		};
		pc.drawBDMarks = function(){
			this.vinc('border_mark', 'auto');

			var csize = this.cw*0.27;
			var ssize = this.cw*0.22;
			var headers = ["b_cp_", "b_dt1_", "b_dt2_"];

			g.lineWidth = 1;
			g.strokeStyle = this.cellcolor;

			var idlist = this.range.borders;
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

		pc.drawTarget_minarism = function(){
			this.drawCursor(k.playmode);
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
				var obj = bd.border[id-mgn];

				if     (this.include(ca,'0','9')||this.include(ca,'a','f')){ obj.qnum = parseInt(ca,16);}
				else if(ca==="-"){ obj.qnum = parseInt(bstr.substr(i+1,2),16); i+=2;}
				else if(ca==="."){ obj.qnum = -2;}
				else if(ca==="g"){ obj.ques = ((type===0 || id<k.qcols*k.qrows)?1:2);}
				else if(ca==="h"){ obj.ques = ((type===0 || id<k.qcols*k.qrows)?2:1);}
				else if(this.include(ca,'i','z')){ id+=(parseInt(ca,36)-18);}
				else if(type===1 && ca==="/"){ id=bd.cellmax-1;}

				id++;
				if(id>=2*k.qcols*k.qrows){ a=i+1; break;}
			}
			this.outbstr = bstr.substr(a);
		};
		enc.encodeMinarism = function(type){
			var cm="", count=0, mgn=0;
			for(var id=0,max=bd.bdmax+(type===0?0:k.qcols);id<max;id++){
				if(type===1){
					if(id>0 && id<=(k.qcols-1)*k.qrows && id%(k.qcols-1)==0){ count++;}
					if(id==(k.qcols-1)*k.qrows){ if(count>0){ cm+=(17+count).toString(36); count=0;} cm += "/";}
				}

				if(id<bd.bdmax){
					var pstr = "", val = bd.border[id].ques, qnum = bd.border[id].qnum;

					if     (val === 1){ pstr = ((type===0 || id<bd.cellmax)?"g":"h");}
					else if(val === 2){ pstr = ((type===0 || id<bd.cellmax)?"h":"g");}
					else if(qnum===-2){ pstr = ".";}
					else if(qnum>= 0&&qnum< 16){ pstr = ""+ qnum.toString(16);}
					else if(qnum>=16&&qnum<256){ pstr = "-"+qnum.toString(16);}
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
			this.decodeBorder( function(obj,ca){
				if     (ca==="a"){ obj.ques = 1;}
				else if(ca==="b"){ obj.ques = 2;}
				else if(ca==="."){ obj.qnum = -2;}
				else if(ca!=="0"){ obj.qnum = parseInt(ca);}
			});
			this.decodeCellAnumsub();
		};
		fio.encodeData = function(){
			this.encodeBorder( function(obj){
				if     (obj.ques=== 1){ return "a ";}
				else if(obj.ques=== 2){ return "b ";}
				else if(obj.qnum===-2){ return ". ";}
				else if(obj.qnum!==-1){ return ""+obj.qnum.toString()+" ";}
				else                  { return "0 ";}
			});
			this.encodeCellAnumsub();
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			if( !this.checkRowsCols(this.isDifferentNumberInClist, bd.getNum) ){
				this.setAlert('同じ列に同じ数字が入っています。','There are same numbers in a row.'); return false;
			}

			if( !this.checkBDnumber() ){
				this.setAlert('丸付き数字とその両側の数字の差が一致していません。', 'The Difference between two Adjacent cells is not equal to the number on circle.'); return false;
			}

			if( !this.checkBDmark() ){
				this.setAlert('不等号と数字が矛盾しています。', 'A inequality sign is not correct.'); return false;
			}

			if( !this.checkAllCell(bd.noNum) ){
				this.setAlert('数字の入っていないマスがあります。','There is a empty cell.'); return false;
			}

			return true;
		};
		ans.check1st = function(){ return this.checkAllCell(bd.noNum);};

		ans.checkBDnumber = function(){
			return this.checkBDSideCell(function(id,c1,c2){
				return (bd.QnB(id)>0 && bd.QnB(id)!==Math.abs(bd.getNum(c1)-bd.getNum(c2)));
			});
		};
		ans.checkBDmark = function(){
			return this.checkBDSideCell(function(id,c1,c2){
				var mark = bd.QuB(id);
				var a1 = bd.getNum(c1), a2 = bd.getNum(c2);
				return !(mark==0 || (mark==1 && a1<a2) || (mark==2 && a1>a2));
			});
		};
		ans.checkBDSideCell = function(func){
			var result = true;
			for(var id=0;id<bd.bdmax;id++){
				var cc1 = bd.border[id].cellcc[0], cc2 = bd.border[id].cellcc[1];
				if(bd.getNum(cc1)>0 && bd.getNum(cc2)>0 && func(id,cc1,cc2)){
					if(this.inAutoCheck){ return false;}
					bd.sErC([cc1,cc2],1);
					result = false;
				}
			}
			return result;
		};
	}
};
