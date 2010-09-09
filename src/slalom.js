//
// パズル固有スクリプト部 スラローム版 slalom.js v3.3.2
//
Puzzles.slalom = function(){ };
Puzzles.slalom.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}
		if(!k.qrows){ k.qrows = 10;}

		k.irowake  = 1;
		k.isborder = 1;

		k.isCenterLine    = true;

		k.isKanpenExist   = true;

		base.setFloatbgcolor("rgb(96, 96, 255)");

		enc.pidKanpen = 'slalom';
	},
	menufix : function(){
		menu.addRedLineToFlags();
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(kc.isZ ^ pp.getVal('dispred')){ this.dispRedLine(); return;}
			if(k.editmode){ this.inputGate();}
			else if(k.playmode){
				if(this.btn.Left) this.inputLine();
				else if(this.btn.Right) this.inputpeke();
			}
		};
		mv.mouseup = function(){
			if(k.editmode){
				if(this.inputData==10){ this.inputStartid_up(); }
				else if(this.notInputted()){ this.inputQues_slalom();}
			}
			else if(k.playmode && this.btn.Left && this.notInputted()){
				this.inputpeke();
			}
		};
		mv.mousemove = function(){
			if(k.editmode){ this.inputGate();}
			else if(k.playmode){
				if(this.btn.Left) this.inputLine();
				else if(this.btn.Right) this.inputpeke();
			}
		};

		mv.inputQues_slalom = function(){
			var cc = this.cellid();
			if(cc===null){ return;}

			if(cc!==tc.getTCC()){
				var cc0 = tc.getTCC(); tc.setTCC(cc);
				pc.paintCell(cc0);
			}
			else{
				if     (this.btn.Left ){ bd.sQuC(cc, {0:1,1:21,21:22,22:0}[bd.QuC(cc)]);}
				else if(this.btn.Right){ bd.sQuC(cc, {0:22,22:21,21:1,1:0}[bd.QuC(cc)]);}
				bd.setNum(cc,-1);
			}
			bd.hinfo.generateGates();

			pc.paintCell(cc);
			pc.dispnumStartpos(bd.startid);
		};
		mv.inputStartid_up = function(){
			this.inputData = null;
			var cc0 = bd.startid;
			pc.paintCell(cc0);
		};
		mv.inputGate = function(){
			var cc = this.cellid();
			if(cc===null){ return;}

			var pos = new Address(bd.cell[cc].bx, bd.cell[cc].by);
			var input=false;

			// 初回はこの中に入ってきます。
			if(this.mouseCell===null){
				if(cc===bd.startid){ this.inputData=10; input=true;}
				else{ this.firstPoint.set(this.inputPoint);}
			}
			// 黒マス上なら何もしない
			else if(bd.QuC(cc)==1){ }
			// startposの入力中の場合
			else if(this.inputData==10){
				if(cc!==this.mouseCell){
					var cc0 = bd.startid;
					bd.startid=cc;
					pc.paintCell(cc0);
					input=true;
				}
			}
			// まだ入力されていない(1つめの入力の)場合
			else if(this.inputData===null){
				if(cc===this.mouseCell){
					var mx=Math.abs(this.inputPoint.x-this.firstPoint.x);
					var my=Math.abs(this.inputPoint.y-this.firstPoint.y);
					if     (my>=8){ this.inputData=21; input=true;}
					else if(mx>=8){ this.inputData=22; input=true;}
				}
				else{
					var dir = this.getdir(this.prevPos, pos);
					if     (dir===k.UP || dir===k.DN){ this.inputData=21; input=true;}
					else if(dir===k.LT || dir===k.RT){ this.inputData=22; input=true;}
				}

				if(input){
					if(bd.QuC(cc)==this.inputData){ this.inputData=0;}
					this.firstPoint.reset();
 				}
			}
			// 入力し続けていて、別のマスに移動した場合
			else if(cc!==this.mouseCell){
				if(this.inputData==0){ this.inputData=0; input=true;}
				else{
					var dir = this.getdir(this.prevPos, pos);
					if     (dir===k.UP || dir===k.DN){ this.inputData=21; input=true;}
					else if(dir===k.LT || dir===k.RT){ this.inputData=22; input=true;}
				}
			}

			// 描画・後処理
			if(input){
				if(this.inputData!==10){ bd.sQuC(cc,this.inputData);}
				bd.hinfo.generateGates();

				pc.paintCell(cc);
				pc.dispnumStartpos(bd.startid);
			}
			this.prevPos   = pos;
			this.mouseCell = cc;
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(ca=='z' && !this.keyPressed){ this.isZ=true; return;}
			if(ca=='x' && !this.keyPressed){ this.isX=true; pc.drawNumbersOnGate(true); return;}
			if(k.playmode){ return;}
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum_slalom(ca);
		};
		kc.key_inputqnum_slalom = function(ca){
			var cc = tc.getTCC();

			if(ca=='q'||ca=='w'||ca=='e'||ca=='r'||ca=='s'||ca==' '){
				var old=bd.QuC(cc), newques=-1;
				if     (ca=='q'){ newques=(old!=1?1:0);}
				else if(ca=='w'){ newques=21;}
				else if(ca=='e'){ newques=22;}
				else if(ca=='r'||ca==' '){ newques= 0;}
				else if(ca=='s'){ bd.inputstartid(cc); return;}
				else{ return;}
				if(old==newques){ return;}

				bd.sQuC(cc,newques);
				if(newques==0){ bd.setNum(cc,-1);}
				if(old==21||old==22||newques==21||newques==22){ bd.hinfo.generateGates();}

				pc.paintCell(cc);
				pc.dispnumStartpos(bd.startid);
			}
			else if(bd.QuC(cc)==1){
				this.key_inputqnum(ca);
			}
		};
		kc.keyup = function(ca){
			if(ca=='z'){ this.isZ=false;}
			if(ca=='x'){ pc.drawNumbersOnGate(false); this.isX=false;}
		};
		kc.isZ = false;
		kc.isX = false;

		if(k.EDITOR){
			kp.kpgenerate = function(mode){
				this.inputcol('image','knumq','q',[0,0]);
				this.inputcol('image','knums','s',[1,0]);
				this.inputcol('image','knumw','w',[2,0]);
				this.inputcol('image','knume','e',[3,0]);
				this.inputcol('num','knumr','r',' ');
				this.insertrow();
				this.inputcol('num','knum1','1','1');
				this.inputcol('num','knum2','2','2');
				this.inputcol('num','knum3','3','3');
				this.inputcol('num','knum4','4','4');
				this.inputcol('num','knum5','5','5');
				this.insertrow();
				this.inputcol('num','knum6','6','6');
				this.inputcol('num','knum7','7','7');
				this.inputcol('num','knum8','8','8');
				this.inputcol('num','knum9','9','9');
				this.inputcol('num','knum0','0','0');
				this.insertrow();
				this.inputcol('num','knum.','-','-');
				this.inputcol('num','knum_',' ',' ');
				this.insertrow();
			};
			kp.generate(kp.ORIGINAL, true, false);
			kp.imgCR = [4,1];
			kp.kpinput = function(ca){
				kc.key_inputqnum_slalom(ca);
			};
		}

		bd.enableLineNG = true;

		bd.startid = 0;
		bd.inputstartid = function(cc){
			if(cc!=this.startid){
				var cc0 = this.startid;
				this.startid = cc;
				pc.paintCell(cc0);
				pc.paintCell(cc);
			}
		};

		bd.hinfo = new Hurdle();
		bd.hinfo.init();

		bd.initSpecial = function(col,row){
			if(!base.initProcess){
				bd.startid = 0;
				bd.hinfo.init();
			}
		};

		bd.nummaxfunc = function(cc){ return Math.min(bd.hinfo.max,bd.maxnum);}

		menu.ex.adjustSpecial = function(key,d){
			var xx=(d.x1+d.x2), yy=(d.y1+d.y2);
			var bx=bd.cell[bd.startid].bx, by=bd.cell[bd.startid].by;
			switch(key){
			case this.FLIPY: // 上下反転
				bd.startid = bd.cnum(bx,yy-by);
				break;
			case this.FLIPX: // 左右反転
				bd.startid = bd.cnum(xx-bx,by);
				break;
			case this.TURNR: // 右90°反転
				bd.startid = bd.cnum(yy-by,bx,k.qrows,k.qcols);
				break;
			case this.TURNL: // 左90°反転
				bd.startid = bd.cnum(by,xx-bx,k.qrows,k.qcols);
				break;
			case this.EXPANDUP:
				bd.startid = bd.cnum(bx  ,by+2,k.qcols,k.qrows+1);
				break;
			case this.EXPANDDN:
				bd.startid = bd.cnum(bx  ,by  ,k.qcols,k.qrows+1);
				break;
			case this.EXPANDLT:
				bd.startid = bd.cnum(bx+2,by  ,k.qcols+1,k.qrows);
				break;
			case this.EXPANDRT:
				bd.startid = bd.cnum(bx  ,by  ,k.qcols+1,k.qrows);
				break;
			case this.REDUCEUP:
				bd.startid = bd.cnum(bx  ,by-2,k.qcols,k.qrows-1);
				break;
			case this.REDUCEDN:
				bd.startid = bd.cnum(bx  ,by+(by<bd.maxby-2?0:-2),k.qcols,k.qrows-1);
				break;
			case this.REDUCELT:
				bd.startid = bd.cnum(bx-2,by  ,k.qcols-1,k.qrows);
				break;
			case this.REDUCERT:
				bd.startid = bd.cnum(bx+(bx<bd.maxbx-2?0:-2),by  ,k.qcols-1,k.qrows);
				break;
			}
		};
		menu.ex.adjustSpecial2 = function(key,d){
			bd.hinfo.generateGates();	// 念のため
		};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_LIGHT;
		pc.linecolor = "rgb(32, 32, 255)";	// 色分けなしの場合
		pc.pekecolor = "rgb(0, 160, 0)";
		pc.errlinecolor2 = "rgb(160, 150, 255)";
		pc.errbcolor1 = pc.errbcolor1_DARK;
		pc.fontcolor = pc.fontErrcolor = "white";

		pc.paint = function(){
			this.drawBGCells();
			this.drawGrid();

			this.drawGates()

			this.drawBlackCells();
			this.drawNumbers();

			this.drawPekes(1);
			this.drawLines();

			this.drawStartpos();

			this.drawChassis();

			this.drawTarget();
		};

		// オーバーライド drawBlackCells用
		pc.setCellColor = function(cc){
			var err = bd.cell[cc].error;
			if(bd.cell[cc].ques!==1){ return false;}
			else if(err===0)        { g.fillStyle = this.cellcolor; return true;}
			else if(err===1)        { g.fillStyle = this.errcolor1; return true;}
			return false;
		};

		pc.drawGates = function(){
			var lw = Math.max(this.cw/10, 3);	//LineWidth
			var lm = lw/2;						//LineMargin
			var ll = lw*1.1;					//LineLength
			var headers = ["c_dl21", "c_dl22"];

			var clist = this.range.cells;
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				g.fillStyle = (bd.cell[c].error===4 ? this.errcolor1 : this.cellcolor);

				for(var j=bd.cell[c].py,max=bd.cell[c].py+this.ch;j<max;j+=ll*2){ //たて
					if(bd.cell[c].ques===21){
						if(this.vnop([headers[0],c,(j|0)].join("_"),this.FILL)){
							g.fillRect(bd.cell[c].cpx-lm+1, j, lw, ll);
						}
					}
					else{ this.vhide([headers[0],c,(j|0)].join("_"));}
				}

				for(var j=bd.cell[c].px,max=bd.cell[c].px+this.cw;j<max;j+=ll*2){ //よこ
					if(bd.cell[c].ques===22){
						if(this.vnop([headers[1],c,(j|0)].join("_"),this.FILL)){
							g.fillRect(j, bd.cell[c].cpy-lm+1, ll, lw);
						}
					}
					else{ this.vhide([headers[1],c,(j|0)].join("_"));}
				}
			}
		};

		pc.drawStartpos = function(){
			this.vinc('cell_circle', 'auto');

			var c = bd.startid, d = this.range;
			if(bd.cell[c].bx<d.x1 || d.x2<bd.cell[c].bx || bd.cell[c].by<d.y1 || d.y2<bd.cell[c].by){ return;}

			var rsize = this.cw*0.45, rsize2 = this.cw*0.40;
			var csize = (rsize+rsize2)/2, csize2 = rsize2-rsize;
			var vids = ["sposa_","sposb_"];
			this.vdel(vids);

			g.lineWidth = (csize2>=1 ? csize2 : 1);
			g.strokeStyle = this.cellcolor;
			g.fillStyle = (mv.inputData==10 ? this.errbcolor1 : "white");
			if(this.vnop(vids[0],this.FILL)){
				g.shapeCircle(bd.cell[c].cpx, bd.cell[c].cpy, csize);
			}

			this.dispnumStartpos(c);
		};
		pc.dispnumStartpos = function(c){
			this.vinc('cell_number', 'auto');

			var num = bd.hinfo.max, obj = bd.cell[c], key='cell_'+c;
			if(num>=0){
				var fontratio = (num<10?0.75:0.66);
				this.dispnum(key, 1, ""+num, fontratio, "black", obj.cpx, obj.cpy);
			}
			else{ this.hideEL(key);}
		};

		pc.repaintParts = function(idlist){
			var clist = line.getClistFromIdlist(idlist);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				if(c!==bd.startid){ continue;}

				var bx = bd.cell[c].bx, by = bd.cell[c].by;
				this.drawStartpos(bx,by,bx,by);

				// startは一箇所だけなので、描画したら終了してよい
				break;
			}
		};

		// Xキー押した時に数字を表示するメソッド
		pc.drawNumbersOnGate = function(keydown){
			if(keydown){ bd.hinfo.generateGateNumber();}

			for(var c=0;c<bd.cellmax;c++){
				if(bd.cell[c].ques!==21 && bd.cell[c].ques!==22){ continue;}
				var obj = bd.cell[c], key='cell_'+c;

				var r = bd.hinfo.getGateid(c);
				var num = (r>0?bd.hinfo.data[r].number:-1);
				if(keydown && num>0){
					var fontratio = (num<10?0.8:(num<100?0.7:0.55));
					this.dispnum(key, 1, ""+num, fontratio ,"tomato", obj.cpx, obj.cpy);
				}
				else{ this.hideEL(key);}
			}
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decodeSlalom((this.checkpflag("p")?1:0));
		};
		enc.pzlexport = function(type){
			bd.hinfo.generateAll();

			if(type===0){ this.outpflag='p';}

			return this.encodeSlalom((type===0?1:0));
		};

		enc.decodeKanpen = function(){
			fio.decodeBoard_kanpen();
			bd.hinfo.generateGates();
		};
		enc.encodeKanpen = function(){
			fio.encodeBoard_kanpen();
		};

		enc.decodeSlalom = function(ver){
			var bstr = this.outbstr;
			var array = bstr.split("/");

			var c=0, i=0;
			for(i=0;i<array[0].length;i++){
				var ca = array[0].charAt(i);

				if     (ca==='1'){ bd.cell[c].ques = 1;}
				else if(ca==='2'){ bd.cell[c].ques = 21;}
				else if(ca==='3'){ bd.cell[c].ques = 22;}
				else if(this.include(ca,"4","9")||this.include(ca,"a","z")){ c+=(parseInt(ca,36)-4);}

				c++;
				if(c>=bd.cellmax){ break;}
			}
			bd.hinfo.generateGates();

			if(ver===0){
				var r=1;
				for(i=i+1;i<array[0].length;i++){
					var ca = array[0].charAt(i);

					if(this.include(ca,"0","9")||this.include(ca,"a","f")){
						bd.hinfo.data[r].number = parseInt(ca,16);
					}
					else if(ca==='-'){
						bd.hinfo.data[r].number = parseInt(bstr.substr(i+1,2),16); i+=2;
					}
					else if(this.include(ca,"g","z")){ r+=(parseInt(ca,36)-16);}

					r++;
					if(r>bd.hinfo.max){ break;}
				}

				for(var c=0;c<bd.cellmax;c++){
					var idlist=bd.hinfo.getConnectingGate(c), min=1000;
					for(var i=0;i<idlist.length;i++){
						var val=bd.hinfo.data[idlist[i]].number;
						if(val>0){ min=Math.min(min,val);}
					}
					bd.cell[c].qnum = (min<1000?min:-1);
				}
			}
			else if(ver===1){
				var c=0, spare=0;
				for(i=i+1;i<array[0].length;i++){
					if(bd.cell[c].ques!==1){ i--;}
					else if(spare>0){ i--; spare--;}
					else{
						var ca = array[0].charAt(i);

						if(this.include(ca,"0","9")||this.include(ca,"a","f")){
							bd.cell[c].qnum = parseInt(ca,16);
						}
						else if(ca=='-'){
							bd.cell[c].qnum = parseInt(bstr.substr(i+1,2),16); i+=2;
						}
						else if(ca>='g' && ca<='z'){ spare = (parseInt(ca,36)-15)-1;}
					}
					c++;
					if(c>=bd.cellmax){ break;}
				}
			}

			bd.startid = parseInt(array[1]);

			this.outbstr = array[0].substr(i);
		};
		enc.encodeSlalom = function(ver){
			var cm="", count=0;
			for(var c=0;c<bd.cellmax;c++){
				var pstr="";
				if     (bd.cell[c].ques=== 1){ pstr = "1";}
				else if(bd.cell[c].ques===21){ pstr = "2";}
				else if(bd.cell[c].ques===22){ pstr = "3";}
				else{ count++;}

				if(count===0){ cm += pstr;}
				else if(pstr || count===32){ cm+=((3+count).toString(36)+pstr); count=0;}
			}
			if(count>0){ cm+=(3+count).toString(36);}

			count=0;
			if(ver===0){
				for(var r=1;r<=bd.hinfo.max;r++){
					var pstr = "";
					var val = bd.hinfo.data[r].number;

					if     (val>= 0 && val< 16){ pstr =       val.toString(16);}
					else if(val>=16 && val<256){ pstr = "-" + val.toString(16);}
					else{ count++;}

					if(count===0){ cm += pstr;}
					else if(pstr || count===20){ cm+=((15+count).toString(36)+pstr); count=0;}
				}
				if(count>0){ cm+=(15+count).toString(36);}
			}
			else if(ver===1){
				for(var c=0;c<bd.cellmax;c++){
					if(bd.cell[c].ques!==1){ continue;}

					var pstr = "";
					var val = bd.cell[c].qnum;

					if     (val>= 1 && val< 16){ pstr =       val.toString(16);}
					else if(val>=16 && val<256){ pstr = "-" + val.toString(16);}
					else{ count++;}

					if(count===0){ cm += pstr;}
					else if(pstr || count===20){ cm+=((15+count).toString(36)+pstr); count=0;}
				}
				if(count>0){ cm+=(15+count).toString(36);}
			}

			cm += ("/"+bd.startid.toString());

			this.outbstr += cm;
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			if(fio.filever==1){
				this.decodeBoard_pzpr();
				this.decodeBorderLine();
				bd.hinfo.generateGates();
			}
			else if(fio.filever==0){
				this.decodeBoard_old();
				this.decodeBorderLine();
			}
		};
		fio.encodeData = function(){
			bd.hinfo.generateAll();

			this.filever = 1;
			this.encodeBoard_pzpr();
			this.encodeBorderLine();
		};

		fio.kanpenOpen = function(){
			this.decodeBoard_kanpen();
			this.decodeBorderLine();

			bd.hinfo.generateGates();
		};
		fio.kanpenSave = function(){
			bd.hinfo.generateAll();

			this.encodeBoard_kanpen();
			this.encodeBorderLine();
		};

		fio.decodeBoard_pzpr = function(){
			this.decodeCell( function(obj,ca){
				if     (ca==="o"){ bd.startid=bd.cnum(obj.bx,obj.by);}
				else if(ca==="i"){ obj.ques = 21;}
				else if(ca==="-"){ obj.ques = 22;}
				else if(ca==="#"){ obj.ques = 1;}
				else if(ca!=="."){ obj.ques = 1; obj.qnum = parseInt(ca);}
			});
		};
		fio.encodeBoard_pzpr = function(){
			this.encodeCell( function(obj){
				if     (bd.startid===bd.cnum(obj.bx,obj.by)){ return "o ";}
				else if(obj.ques===21){ return "i ";}
				else if(obj.ques===22){ return "- ";}
				else if(obj.ques=== 1){
					return (obj.qnum>0 ? obj.qnum.toString() : "#")+" ";
				}
				else{ return ". ";}
			});
		};

		fio.decodeBoard_kanpen = function(){
			this.decodeCell( function(obj,ca){
				if     (ca==="+"){ bd.startid=bd.cnum(obj.bx,obj.by);}
				else if(ca==="|"){ obj.ques = 21;}
				else if(ca==="-"){ obj.ques = 22;}
				else if(ca==="0"){ obj.ques = 1;}
				else if(ca!=="."){ obj.ques = 1; obj.qnum = parseInt(ca);}
			});
		};
		fio.encodeBoard_kanpen = function(){
			this.encodeCell( function(obj){
				if     (bd.startid===bd.cnum(obj.bx,obj.by)){ return "+ ";}
				else if(obj.ques===21){ return "| ";}
				else if(obj.ques===22){ return "- ";}
				else if(obj.ques=== 1){
					return (obj.qnum>0 ? obj.qnum.toString() : "0")+" ";
				}
				else{ return ". ";}
			});
		};

		fio.decodeBoard_old = function(){
			var sv_num = [];
			this.decodeCell( function(obj,ca){
				var c = bd.cnum(obj.bx,obj.by);
				sv_num[c]=-1;
				if     (ca==="#"){ obj.ques = 1;}
				else if(ca==="o"){ bd.startid=c;}
				else if(ca!=="."){
					if     (ca.charAt(0)==="i"){ obj.ques = 21;}
					else if(ca.charAt(0)==="w"){ obj.ques = 22;}
					if(ca.length>1){ sv_num[c] = parseInt(ca.substr(1));}
				}
			});
			bd.hinfo.generateGates();

			for(var c=0;c<bd.cellmax;c++){
				if(sv_num[c]!==-1){ bd.hinfo.data[bd.hinfo.getGateid(c)].number = sv_num[c];}
			}
			for(var c=0;c<bd.cellmax;c++){
				var idlist=bd.hinfo.getConnectingGate(c), min=1000;
				for(var i=0;i<idlist.length;i++){
					var val=bd.hinfo.data[idlist[i]].number;
					if(val>0){ min=Math.min(min,val);}
				}
				bd.cell[c].qnum = (min<1000?min:-1);
			}
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){
			bd.hinfo.generateAll();

			if( !this.checkAllCell(function(c){ return (bd.QuC(c)==1 && line.lcntCell(c)>0);}) ){
				this.setAlert('黒マスに線が通っています。','A line is over a black cell.'); return false;
			}

			if( !this.checkLcntCell(4) ){
				this.setAlert('交差している線があります。','There is a crossing line.'); return false;
			}

			if( !this.checkLcntCell(3) ){
				this.setAlert('分岐している線があります。','There is a branch line.'); return false;
			}

			if( !this.checkGateLine(1) ){
				this.setAlert('線が２回以上通過している旗門があります。','A line goes through a gate twice or more.'); return false;
			}

			if( !this.checkStartid() ){
				this.setAlert('○から線が２本出ていません。','A line goes through a gate twice or more.'); return false;
			}

			if( !this.checkGateNumber() ){
				this.setAlert('旗門を通過する順番が間違っています。','The order of passing the gate is wrong.'); return false;
			}

			if( !this.checkLcntCell(1) ){
				this.setAlert('線が途中で途切れています。','There is a dead-end line.'); return false;
			}

			if( !this.checkOneLoop() ){
				this.setAlert('輪っかが一つではありません。','There are two or more loops.'); return false;
			}

			if( !this.checkGateLine(2) ){
				this.setAlert('線が通過していない旗門があります。','There is a gate that the line is not passing.'); return false;
			}

			return true;
		};
		ans.check1st = function(){ return this.checkLcntCell(1);};

		ans.checkStartid = function(){
			if(line.lcntCell(bd.startid)!=2){
				bd.sErC(bd.startid,1);
				return false;
			}
			return true;
		};
		ans.checkGateLine = function(type){
			var result = true;
			for(var r=1;r<=bd.hinfo.max;r++){
				var cnt=0;
				for(var i=0;i<bd.hinfo.data[r].clist.length;i++){
					if(line.lcntCell(bd.hinfo.data[r].clist[i])>0){ cnt++;}
				}
				if((type==1 && cnt>1)||(type==2 && cnt==0)){
					if(this.inAutoCheck){ return false;}
					bd.sErC(bd.hinfo.data[r].clist, 4);
					bd.sErC(bd.hinfo.getGatePole(r),1)
					result = false;
				}
			}
			return result;
		};
		ans.checkGateNumber = function(){
			var sid = [];
			if(bd.isLine(bd.rb(bd.startid))){ sid.push({id:bd.rb(bd.startid),dir:4});}
			if(bd.isLine(bd.db(bd.startid))){ sid.push({id:bd.db(bd.startid),dir:2});}
			if(bd.isLine(bd.lb(bd.startid))){ sid.push({id:bd.lb(bd.startid),dir:3});}
			if(bd.isLine(bd.ub(bd.startid))){ sid.push({id:bd.ub(bd.startid),dir:1});}

			for(var i=0;i<sid.length;i++){
				var bx=bd.border[sid[i].id].bx, by=bd.border[sid[i].id].by;
				var dir=sid[i].dir, ordertype=-1, passing=0;

				while(1){
					switch(dir){ case 1: by--; break; case 2: by++; break; case 3: bx--; break; case 4: bx++; break;}
					if((bx+by)%2==0){
						var cc = bd.cnum(bx,by);
						if(cc==bd.startid){ return true;} // ちゃんと戻ってきた

						if(bd.QuC(cc)==21 || bd.QuC(cc)==22){
							var r = bd.hinfo.getGateid(cc);
							var gatenumber = bd.hinfo.data[r].number;
							passing++;
							if(gatenumber<=0){ } // 何もしない
							else if(ordertype==-1){
								if(gatenumber*2-1==bd.hinfo.max){ } // ど真ん中の数字なら何もしない
								else if(passing==gatenumber)               { ordertype=1;}
								else if(passing==bd.hinfo.max+1-gatenumber){ break;      } // 逆方向なので逆の方向から回る
								else{
									bd.sErC(bd.hinfo.data[r].clist, 4);
									bd.sErC(bd.hinfo.getGatePole(r),1)
									return false;
								}
							}
							else if(ordertype==1 && passing!=gatenumber){
								bd.sErC(bd.hinfo.data[r].clist, 4);
								bd.sErC(bd.hinfo.getGatePole(r),1)
								return false;
							}
						}

						if     (line.lcntCell(cc)!=2){ break;}
						else if(dir!=1 && bd.isLine(bd.bnum(bx,by+1))){ dir=2;}
						else if(dir!=2 && bd.isLine(bd.bnum(bx,by-1))){ dir=1;}
						else if(dir!=3 && bd.isLine(bd.bnum(bx+1,by))){ dir=4;}
						else if(dir!=4 && bd.isLine(bd.bnum(bx-1,by))){ dir=3;}
					}
					else{
						var id = bd.bnum(bx,by);
						if(!bd.isLine(id)){ break;} // 途切れてたら、何事もなかったように終了
					}
				}
			}
			return true;
		};
	}
};

//---------------------------------------------------------
//---------------------------------------------------------
HurdleData = function(){
	this.clist  = [];		// この旗門に含まれるセルのリスト
	this.number = -1;		// この旗門が持つ順番
	this.val    = 0;		// この旗門の方向(21:タテ 22:ヨコ)
	this.x1 = this.x2 = this.y1 = this.y2 = -1; // 旗門のサイズ(両端の黒マスIDを取得するのに必要)
};

Hurdle = function(){
	this.max    = 0;
	this.gateid = [];
	this.data   = [];
};
Hurdle.prototype = {
	// 旗門が持つ旗門IDを取得する
	getGateid : function(cc){
		if(cc<0 || cc>=bd.cellmax){ return -1;}
		return this.gateid[cc];
	},

	// 旗門の両端にある黒マスの場所のIDを取得する
	getGatePole : function(gateid){
		var clist = [];
		var cc1,cc2;
		if(this.data[gateid].val==21){
			cc1 = bd.cnum(this.data[gateid].x1, this.data[gateid].y1-2);
			cc2 = bd.cnum(this.data[gateid].x1, this.data[gateid].y2+2);
		}
		else if(this.data[gateid].val==22){
			cc1 = bd.cnum(this.data[gateid].x1-2, this.data[gateid].y1);
			cc2 = bd.cnum(this.data[gateid].x2+2, this.data[gateid].y1);
		}
		else{ return [];}
		if(cc1!==null && bd.QuC(cc1)===1){ clist.push(cc1);}
		if(cc2!==null && bd.QuC(cc2)===1){ clist.push(cc2);}
		return clist;
	},
	// 黒マスの周りに繋がっている旗門IDをリストにして返す
	getConnectingGate : function(c){
		var cc, idlist=[];
		cc=bd.up(c); if(cc!==null && bd.QuC(cc)===21){ idlist.push(this.gateid[cc]);}
		cc=bd.dn(c); if(cc!==null && bd.QuC(cc)===21){ idlist.push(this.gateid[cc]);}
		cc=bd.lt(c); if(cc!==null && bd.QuC(cc)===22){ idlist.push(this.gateid[cc]);}
		cc=bd.rt(c); if(cc!==null && bd.QuC(cc)===22){ idlist.push(this.gateid[cc]);}
		return idlist;
	},

	//---------------------------------------------------------
	init : function(){
		this.max=0;
		for(var c=0;c<bd.cellmax;c++){ this.gateid[c] = -1;}
		this.data=[];
	},

	generateAll : function(){
		this.generateGates();
		this.generateGateNumber();
	},

	generateGates : function(){
		this.init();
		for(var c=0;c<bd.cellmax;c++){
			if(bd.QuC(c)==0 || bd.QuC(c)==1 || this.getGateid(c)!=-1){ continue;}

			var bx=bd.cell[c].bx, by=bd.cell[c].by;
			var val=bd.QuC(c);

			this.max++;
			this.data[this.max] = new HurdleData();
			while(1){
				var cc = bd.cnum(bx,by);
				if(cc===null || bd.QuC(cc)!==val){ break;}

				this.data[this.max].clist.push(cc);
				this.gateid[cc]=this.max;
				if(val==21){ by+=2;}else{ bx+=2;}
			}
			this.data[this.max].x1 = bd.cell[c].bx;
			this.data[this.max].y1 = bd.cell[c].by;
			this.data[this.max].x2 = (val==22?bx-2:bx);
			this.data[this.max].y2 = (val==21?by-2:by);
			this.data[this.max].val = val;
		}
	},

	generateGateNumber : function(){
		// 一旦すべての旗門のnumberを消す
		for(var r=1;r<=this.max;r++){ this.data[r].number=-1;}

		// 数字がどの旗門に繋がっているかをnums配列にとってくる
		var nums = [];
		for(var r=1;r<=this.max;r++){ nums[r] = [];}
		for(var c=0;c<bd.cellmax;c++){
			if(bd.QuC(c)==1){
				var qn = bd.getNum(c);
				if(qn<=0 || qn>this.max){ continue;}
				var idlist = this.getConnectingGate(c);
				for(var i=0;i<idlist.length;i++){ nums[idlist[i]].push(qn);}
			}
		}

		// セットされた数字を全てのnumsから消す関数
		var delnum = ee.binder(this, function(dn){ for(var r=1;r<=this.max;r++){
			var atmp = [];
			for(var i=0;i<nums[r].length;i++){ if(dn[nums[r][i]]!=1){ atmp.push(nums[r][i]);} }
			nums[r] = atmp;
		} });
		var decnumber = [];
		for(var n=1;n<=this.max;n++){ decnumber[n] = 0;}

		// 旗門nに繋がる数字が2つとも同じ数字の場合、無条件で旗門に数字をセット
		for(var r=1;r<=this.max;r++){
			if(nums[r].length==2 && nums[r][0]>0 && nums[r][0]==nums[r][1]){
				this.data[r].number = nums[r][0];
				decnumber[nums[r][0]] = 1
				nums[r] = [];
			}
		}
		delnum(decnumber);

		// 旗門に繋がる2つの数字が異なる場合、もしくは1つの数字が繋がる場合
		var repeatflag = true;
		while(repeatflag){
			repeatflag = false;
			for(var n=1;n<=this.max;n++){ decnumber[n] = 0;}
			var numcnt = [];

			// 競合していない数字がいくつ残っているか数える
			for(var n=1;n<=this.max;n++){ numcnt[n] = 0;}
			for(var r=1;r<=this.max;r++){ if(nums[r].length==1){ numcnt[nums[r][0]]++;} }

			// 各旗門をチェック
			for(var r=1;r<=this.max;r++){
				// 2つ以上の数字が繋がっている場合はダメです
				// また、複数箇所の旗門の候補になっている場合もダメ
				var cand=(nums[r].length==1?nums[r][0]:-1);
				if(cand>0 && numcnt[cand]>1){ cand=-1;}

				// 旗門に数字をセット
				if(cand>0){
					this.data[r].number = cand;
					decnumber[cand] = 1;
					nums[r] = [];
					repeatflag = true;	//再ループする
				}
			}
			delnum(decnumber);

			// ここまででセットされたやつがあるなら、初めからループ
			if(repeatflag){ continue;}

			// 重なっていても、1つだけに繋がっている数字を判定したい。。
			for(var n=1;n<=this.max;n++){ numcnt[n] = 0;}
			for(var r=1;r<=this.max;r++){ for(var i=0;i<nums[r].length;i++){ numcnt[nums[r][i]]++;} }

			// 各旗門をチェック
			for(var r=1;r<=this.max;r++){
				var cand=-1;
				for(var i=0;i<nums[r].length;i++){
					if(numcnt[nums[r][i]]==1){ cand=(cand==-1?nums[r][i]:-1);}
				}

				// 旗門に数字をセット
				if(cand>0){
					this.data[r].number = cand;
					decnumber[cand] = 1;
					nums[r] = [];
					repeatflag = true;	//再ループする
				}
			}
			delnum(decnumber);
		}
	}
};
