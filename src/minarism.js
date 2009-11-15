//
// パズル固有スクリプト部 マイナリズム版 minarism.js v3.2.3
//
Puzzles.minarism = function(){ };
Puzzles.minarism.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 7;}	// 盤面の横幅
		if(!k.qrows){ k.qrows = 7;}	// 盤面の縦幅
		k.irowake = 0;			// 0:色分け設定無し 1:色分けしない 2:色分けする

		k.iscross      = 0;		// 1:Crossが操作可能なパズル
		k.isborder     = 1;		// 1:Border/Lineが操作可能なパズル
		k.isextendcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

		k.isoutsidecross  = 0;	// 1:外枠上にCrossの配置があるパズル
		k.isoutsideborder = 0;	// 1:盤面の外枠上にborderのIDを用意する
		k.isLineCross     = 0;	// 1:線が交差するパズル
		k.isCenterLine    = 0;	// 1:マスの真ん中を通る線を回答として入力するパズル
		k.isborderAsLine  = 0;	// 1:境界線をlineとして扱う

		k.dispzero      = 0;	// 1:0を表示するかどうか
		k.isDispHatena  = 0;	// 1:qnumが-2のときに？を表示する
		k.isAnsNumber   = 1;	// 1:回答に数字を入力するパズル
		k.isArrowNumber = 0;	// 1:矢印つき数字を入力するパズル
		k.isOneNumber   = 0;	// 1:部屋の問題の数字が1つだけ入るパズル
		k.isDispNumUL   = 0;	// 1:数字をマス目の左上に表示するパズル(0はマスの中央)
		k.NumberWithMB  = 0;	// 1:回答の数字と○×が入るパズル

		k.BlackCell     = 0;	// 1:黒マスを入力するパズル
		k.NumberIsWhite = 0;	// 1:数字のあるマスが黒マスにならないパズル
		k.RBBlackCell   = 0;	// 1:連黒分断禁のパズル

		k.ispzprv3ONLY  = 0;	// 1:ぱずぷれv3にしかないパズル
		k.isKanpenExist = 0;	// 1:pencilbox/カンペンにあるパズル

		k.fstruct = ["others", "cellqanssub"];

		//k.def_csize = 36;
		//k.def_psize = 24;
		k.area = { bcell:0, wcell:0, number:0, disroom:1};	// areaオブジェクトで領域を生成する

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
			var pos = this.cellpos();
			if(bd.cnum(pos.x,pos.y)==-1){ return;}

			var id=-1;
			if     (pos.y-this.mouseCell.y==-1){ id=bd.bnum(this.mouseCell.x*2+1,this.mouseCell.y*2  ); this.inputData=1; }
			else if(pos.y-this.mouseCell.y== 1){ id=bd.bnum(this.mouseCell.x*2+1,this.mouseCell.y*2+2); this.inputData=2; }
			else if(pos.x-this.mouseCell.x==-1){ id=bd.bnum(this.mouseCell.x*2  ,this.mouseCell.y*2+1); this.inputData=1; }
			else if(pos.x-this.mouseCell.x== 1){ id=bd.bnum(this.mouseCell.x*2+2,this.mouseCell.y*2+1); this.inputData=2; }

			this.mouseCell = pos;
			if(id==-1){ return;}

			bd.sQuB(id,(this.inputData!=bd.QuB(id)?this.inputData:0));
			pc.paintBorder(id);
		};
		mv.inputmark = function(){
			var pos = this.crosspos(0.33);
			if(pos.x<tc.minx || tc.maxx<pos.x || pos.y<tc.miny || tc.maxy<pos.y){ return;}
			var id = bd.bnum(pos.x, pos.y);

			if(tc.cursolx!=pos.x || tc.cursoly!=pos.y){
				var tcx = tc.cursolx, tcy = tc.cursoly, flag = false;
				tc.setTCP(pos);
				pc.paint(mf(tcx/2)-1, mf(tcy/2)-1, mf(tcx/2)+1, mf(tcy/2)+1);
				pc.paint(mf(pos.x/2)-1, mf(pos.y/2)-1, mf(pos.x/2), mf(pos.y/2));
			}
			else if(id!=-1){
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
			if(id==-1){ return false;}

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

		menu.ex.adjustSpecial = function(type,key){
			um.disableRecord();
			if(type>=1 && type<=4){ // 反転・回転全て
				for(var c=0;c<bd.bdmax;c++){ if(bd.QuB(c)!=0){ bd.sQuB(c,{1:2,2:1}[bd.QuB(c)]); } }
			}
			um.enableRecord();
		};
		menu.ex.expandborder = function(key){ };

		tc.setAlign = function(){
			this.cursolx -= ((this.cursolx+1)%2);
			this.cursoly -= ((this.cursoly+1)%2);
		};

		bd.nummaxfunc = function(cc){ return Math.max(k.qcols,k.qrows);};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_LIGHT;

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);

			this.drawBDMbase(x1,y1,x2,y2);

			this.drawBGCells(x1,y1,x2,y2);
			this.drawDashedGrid(x1-1,y1-1,x2,y2);

			this.drawBDMarks(x1,y1,x2,y2);
			this.drawNumbers(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);

			this.drawTarget_minarism(x1,y1,x2,y2);
		};

		pc.drawBDMbase = function(x1,y1,x2,y2){
			if(g.vml){ return;}
			var csize = k.cwidth*0.29;
			var idlist = this.borderinside(x1*2-2,y1*2-2,x2*2+2,y2*2+2);
			for(var i=0;i<idlist.length;i++){
				var id = idlist[i];

				if(bd.border[id].ques!=0 || bd.border[id].qnum!=-1){
					g.fillStyle = "white";
					g.fillRect(bd.border[id].px-csize, bd.border[id].py-csize, 2*csize+1, 2*csize+1);
				}
			}
		};
		pc.drawBDMarks = function(x1,y1,x2,y2){
			var csize = k.cwidth*0.27;
			var ssize = k.cwidth*0.22;
			var headers = ["b_cp1_", "b_cp2_", "b_dt1_", "b_dt2_"];

			var idlist = this.borderinside(x1*2-2,y1*2-2,x2*2+2,y2*2+2);
			for(var i=0;i<idlist.length;i++){
				var id = idlist[i];
				if(bd.border[id].qnum!=-1){
					g.fillStyle = (bd.border[id].error==1 ? this.errcolor1 : "white");
					if(this.vnop(headers[0]+id,1)){
						g.beginPath();
						g.arc(bd.border[id].px, bd.border[id].py, csize, 0, Math.PI*2, false);
						g.fill();
					}

					g.lineWidth = 1;
					g.strokeStyle = "black";
					if(this.vnop(headers[1]+id,0)){
						if(k.br.IE){
							g.beginPath();
							g.arc(bd.border[id].px, bd.border[id].py, csize, 0, Math.PI*2, false);
						}
						g.stroke();
					}
				}
				else{ this.vhide([headers[0]+id, headers[1]+id]);}

				this.dispnumBorder(id);

				if(bd.border[id].ques!==0){
					var px=bd.border[id].px, py=bd.border[id].py;
					g.fillStyle = this.Cellcolor;
					if(bd.border[id].ques===1){
						if(this.vnop(headers[2]+id,1)){
							if(bd.border[id].cx&1){ this.inputPath([px,py ,-ssize,+ssize ,0,-ssize ,+ssize,+ssize], false);}
							else                  { this.inputPath([px,py ,+ssize,-ssize ,-ssize,0 ,+ssize,+ssize], false);}
							g.stroke();
						}
					}
					else{ this.vhide(headers[3]+id);}
					if(bd.border[id].ques===2){
						if(this.vnop(headers[3]+id,1)){
							if(bd.border[id].cx&1){ this.inputPath([px,py ,-ssize,-ssize ,0,+ssize ,+ssize,-ssize], false);}
							else                  { this.inputPath([px,py ,-ssize,-ssize ,+ssize,0 ,-ssize,+ssize], false);}
							g.stroke();
						}
					}
					else{ this.vhide(headers[2]+id);}
				}
				else{ this.vhide([headers[2]+id, headers[3]+id]);}
			}
			this.vinc();
		};

		pc.drawTarget_minarism = function(x1,y1,x2,y2){
			if(k.editmode){
				this.drawTBorder(x1-1,y1-1,x2+1,y2+1);
				this.hideTCell();
			}
			else{
				this.hideTBorder();
				this.drawTCell(x1-1,y1-1,x2+1,y2+1);
			}
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type, bstr){
			if(type==0 || type==1){ bstr = this.decodeMinarism(bstr, type);}
		};
		enc.pzlexport = function(type){
			if(type==0)     { document.urloutput.ta.value = this.getURLbase()+"?"+k.puzzleid+this.pzldata(0);}
			else if(type==1){ document.urloutput.ta.value = this.getDocbase()+k.puzzleid+"/sa/m.html?"+this.pzldata(1);}
			else if(type==3){ document.urloutput.ta.value = this.getURLbase()+"?m+"+k.puzzleid+this.pzldata(0);}
		};
		enc.pzldata = function(type){
			return "/"+k.qcols+"/"+k.qrows+"/"+this.encodeMinarism((type==null)?0:type);
		};

		enc.decodeMinarism = function(bstr,type){
			// 盤面外数字のデコード
			var id=0, a=0, mgn=0;
			for(var i=0;i<bstr.length;i++){
				var ca = bstr.charAt(i);

				if(type==1){
					if     (id<k.qcols*k.qrows)  { mgn=mf(id/k.qcols);}
					else if(id<2*k.qcols*k.qrows){ mgn=k.qrows;}
				}

				if     (this.include(ca,'0','9')||this.include(ca,'a','f')){ bd.sQnB(id-mgn, parseInt(ca,16)); id++;}
				else if(ca=="-"){ bd.sQnB(id-mgn, parseInt(bstr.substr(i+1,2),16)); id++; i+=2;}
				else if(ca=="g"){ bd.sQuB(id-mgn, ((type==0 || id<k.qcols*k.qrows)?1:2)); id++;}
				else if(ca=="h"){ bd.sQuB(id-mgn, ((type==0 || id<k.qcols*k.qrows)?2:1)); id++;}
				else if(this.include(ca,'i','z')){ id+=(parseInt(ca,36)-17);}
				else if(ca=="."){ bd.sQnB(id-mgn,-2); id++;}
				else if(type==1 && ca=="/"){ id=k.qcols*k.qrows;}
				else{ id++;}

				if(id >= 2*k.qcols*k.qrows){ a=i+1; break;}
			}
			return bstr.substr(a);
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

					if     (val == 1){ pstr = ((type==0 || id<k.qcols*k.qrows)?"g":"h");}
					else if(val == 2){ pstr = ((type==0 || id<k.qcols*k.qrows)?"h":"g");}
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
			return cm;
		};

		//---------------------------------------------------------
		fio.decodeOthers = function(array){
			if(array.length<2*k.qrows-1){ return false;}
			this.decodeBorder( function(c,ca){
				if     (ca=="a"){ bd.sQuB(c, 1);}
				else if(ca=="b"){ bd.sQuB(c, 2);}
				else if(ca=="."){ bd.sQnB(c, -2);}
				else if(ca!="0"){ bd.sQnB(c, parseInt(ca));}
			},array.slice(0,2*k.qrows-1));
			return true;
		};
		fio.encodeOthers = function(){
			return this.encodeBorder( function(c){
				if     (bd.QuB(c)== 1){ return "a ";}
				else if(bd.QuB(c)== 2){ return "b ";}
				else if(bd.QnB(c)==-2){ return ". ";}
				else if(bd.QnB(c)!=-1){ return ""+bd.QnB(c).toString()+" ";}
				else                  { return "0 ";}
			});
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			if( !this.checkRowsCols() ){
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

		ans.checkRowsCols = function(){
			var cx, cy;

			for(var cy=0;cy<k.qrows;cy++){
				var clist = [];
				for(var cx=0;cx<k.qcols;cx++){ clist.push(bd.cnum(cx,cy));}
				if(!this.checkDifferentNumberInClist(clist)){ return false;}
			}
			for(var cx=0;cx<k.qcols;cx++){
				var clist = [];
				for(var cy=0;cy<k.qrows;cy++){ clist.push(bd.cnum(cx,cy));}
				if(!this.checkDifferentNumberInClist(clist)){ return false;}
			}
			return true;
		};
		ans.checkDifferentNumberInClist = function(clist){
			var d = [];
			for(var i=1;i<=Math.max(k.qcols,k.qrows);i++){ d[i]=-1;}
			for(var i=0;i<clist.length;i++){
				var val=bd.QaC(clist[i]);
				if     (val==-1){ continue;}
				else if(d[val]==-1){ d[val] = bd.QaC(clist[i]); continue;}

				for(var j=0;j<clist.length;j++){ if(bd.QaC(clist[j])==val){ bd.sErC([clist[j]],1);} }
				return false;
			}
			return true;
		};

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
			for(var id=0;id<bd.bdmax;id++){
				var cc1 = bd.cc1(id);
				var cc2 = bd.cc2(id);
				if(bd.QaC(cc1)>0 && bd.QaC(cc2)>0 && func(id,cc1,cc2)){ bd.sErC([cc1,cc2],1); return false;}
			}
			return true;
		};
	}
};
