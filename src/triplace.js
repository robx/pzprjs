//
// パズル固有スクリプト部 トリプレイス版 triplace.js v3.3.2
//
Puzzles.triplace = function(){ };
Puzzles.triplace.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}
		if(!k.qrows){ k.qrows = 10;}

		k.isborder = 1;
		k.isexcell = 1;

		k.hasroom         = true;
		k.dispzero        = true;

		k.ispzprv3ONLY    = true;

		base.setTitle("トリプレイス","Tri-place");
		base.setFloatbgcolor("rgb(96, 96, 96)");
		base.proto = 1;
	},
	menufix : function(){ },

	protoChange : function(){
		this.protoval = {
			cell   : {qnum:Cell.prototype.defqnum,   qdir:Cell.prototype.defqdir},
			excell : {qnum:EXCell.prototype.defqnum, qdir:EXCell.prototype.defqdir}
		};
		Cell.prototype.defqnum = -1;
		Cell.prototype.defqdir = -1;
		EXCell.prototype.defqnum = -1;
		EXCell.prototype.defqdir = -1;
	},
	protoOriginal : function(){
		Cell.prototype.defqnum = this.protoval.cell.qnum;
		Cell.prototype.defqdir = this.protoval.cell.qdir;
		EXCell.prototype.defqnum = this.protoval.excell.qnum;
		EXCell.prototype.defqdir = this.protoval.excell.qdir;
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(k.editmode){ this.input51();}
			else if(k.playmode){
				if(!kc.isZ){
					if(this.btn.Left) this.inputborderans();
					else if(this.btn.Right) this.inputQsubLine();
				}
				else this.inputBGcolor();
			}
		};
		mv.mouseup = function(){
			if(k.playmode && this.notInputted()) this.inputBGcolor();
		};
		mv.mousemove = function(){
			if(k.playmode){
				if(!kc.isZ){
					if(this.btn.Left) this.inputborderans();
					else if(this.btn.Right) this.inputQsubLine();
				}
				else this.inputBGcolor();
			}
		};
		mv.set51cell = function(c,val){
			bd.sQuC(c,(val?51:0));
			bd.sQnC(c,-1);
			bd.sDiC(c,-1);

			var id, cc;
			id=bd.ub(c),cc=bd.up(c); if(id!==null){ bd.sQuB(id, ((cc!==null && bd.QuC(cc)!==51)?1:0));}
			id=bd.db(c),cc=bd.dn(c); if(id!==null){ bd.sQuB(id, ((cc!==null && bd.QuC(cc)!==51)?1:0));}
			id=bd.lb(c),cc=bd.lt(c); if(id!==null){ bd.sQuB(id, ((cc!==null && bd.QuC(cc)!==51)?1:0));}
			id=bd.rb(c),cc=bd.rt(c); if(id!==null){ bd.sQuB(id, ((cc!==null && bd.QuC(cc)!==51)?1:0));}
		};
		mv.inputBGcolor = function(){
			var cc = this.cellid();
			if(cc===null || cc===this.mouseCell || bd.QuC(cc)==51){ return;}
			if(this.inputData===null){
				if(this.btn.Left){
					if     (bd.QsC(cc)==0){ this.inputData=1;}
					else if(bd.QsC(cc)==1){ this.inputData=2;}
					else                  { this.inputData=0;}
				}
				else if(this.btn.Right){
					if     (bd.QsC(cc)==0){ this.inputData=2;}
					else if(bd.QsC(cc)==1){ this.inputData=0;}
					else                  { this.inputData=1;}
				}
			}
			bd.sQsC(cc, this.inputData);
			this.mouseCell = cc;
			pc.paintCell(cc);
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(k.playmode){
				if(ca=='z' && !this.keyPressed){ this.isZ=true; }
				return;
			}
			if(this.moveTCell(ca)){ return;}
			this.inputnumber51(ca,{2:(k.qcols-(tc.cursor.x>>1)-1), 4:(k.qrows-(tc.cursor.y>>1)-1)});
		};
		kc.keyup    = function(ca){ if(ca=='z'){ this.isZ=false;}};

		kc.isZ = false;

		if(k.EDITOR){
			kp.generate(51, true, false);
			kp.imgCR = [1,1];
			kp.kpinput = function(ca){
				kc.inputnumber51(ca,{2:(k.qcols-(tc.cursor.x>>1)-1), 4:(k.qrows-(tc.cursor.y>>1)-1)});
			};
		}

		menu.ex.adjustSpecial  = menu.ex.adjustQues51_1;
		menu.ex.adjustSpecial2 = menu.ex.adjustQues51_2;

		tc.targetdir = 2;
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_LIGHT;
		pc.borderQanscolor = "rgb(0, 160, 0)";
		pc.setBGCellColorFunc('qsub2');

		pc.paint = function(){
			this.drawBGCells();
			this.drawBGEXcells();
			this.drawQues51();

			this.drawGrid();
			this.drawQansBorders();
			this.drawQuesBorders();

			this.drawBorderQsubs();

			this.drawChassis_ex1(false);

			this.drawNumbersOn51();

			this.drawTarget();
		};

		// 問題と回答の境界線を別々に描画するようにします
		pc.drawQansBorders = function(){
			this.vinc('border_answer', 'crispEdges');
			this.bdheader = "b_bdans";
			this.setBorderColor = function(id){ return (bd.border[id].qans===1);};

			g.fillStyle = this.borderQanscolor;
			var idlist = this.range.borders;
			for(var i=0;i<idlist.length;i++){ this.drawBorder1(idlist[i]);}
			this.isdrawBD = true;
		};
		pc.drawQuesBorders = function(){
			this.vinc('border_question', 'crispEdges');
			this.bdheader = "b_bdques";
			this.setBorderColor = function(id){ return (bd.border[id].ques===1);};

			g.fillStyle = this.borderQuescolor;
			var idlist = this.range.borders;
			for(var i=0;i<idlist.length;i++){ this.drawBorder1(idlist[i]);}
			this.isdrawBD = true;
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decodeTriplace();
		};
		enc.pzlexport = function(type){
			this.encodeTriplace();
		};

		enc.decodeTriplace = function(){
			// 盤面内数字のデコード
			var cell=0, a=0, bstr = this.outbstr;
			base.disableInfo();
			for(var i=0;i<bstr.length;i++){
				var ca = bstr.charAt(i), obj=bd.cell[cell];

				if(ca>='g' && ca<='z'){ cell+=(parseInt(ca,36)-16);}
				else{
					mv.set51cell(cell,true);
					if     (ca==='_'){}
					else if(ca==='%'){ obj.qdir = parseInt(bstr.charAt(i+1),36); i++;}
					else if(ca==='$'){ obj.qnum = parseInt(bstr.charAt(i+1),36); i++;}
					else if(ca==='-'){
						obj.qdir = (bstr.charAt(i+1)!=="." ? parseInt(bstr.charAt(i+1),16) : -1);
						obj.qnum = parseInt(bstr.substr(i+2,2),16);
						i+=3;
					}
					else if(ca==='+'){
						obj.qdir = parseInt(bstr.substr(i+1,2),16);
						obj.qnum = (bstr.charAt(i+3)!=="." ? parseInt(bstr.charAt(i+3),16) : -1);
						i+=3;
					}
					else if(ca==='='){
						obj.qdir = parseInt(bstr.substr(i+1,2),16);
						obj.qnum = parseInt(bstr.substr(i+3,2),16);
						i+=4;
					}
					else{
						obj.qdir = (bstr.charAt(i)  !=="." ? parseInt(bstr.charAt(i),16) : -1);
						obj.qnum = (bstr.charAt(i+1)!=="." ? parseInt(bstr.charAt(i+1),16) : -1);
						i+=1;
					}
				}

				cell++;
				if(cell>=bd.cellmax){ a=i+1; break;}
			}
			base.enableInfo();

			// 盤面外数字のデコード
			cell=0;
			for(var i=a;i<bstr.length;i++){
				var ca = bstr.charAt(i);
				if     (ca==='.'){ bd.excell[cell].qdir = -1;}
				else if(ca==='-'){ bd.excell[cell].qdir = parseInt(bstr.substr(i+1,2),16); i+=2;}
				else             { bd.excell[cell].qdir = parseInt(ca,16);}
				cell++;
				if(cell>=k.qcols){ a=i+1; break;}
			}
			for(var i=a;i<bstr.length;i++){
				var ca = bstr.charAt(i);
				if     (ca==='.'){ bd.excell[cell].qnum = -1;}
				else if(ca==='-'){ bd.excell[cell].qnum = parseInt(bstr.substr(i+1,2),16); i+=2;}
				else             { bd.excell[cell].qnum = parseInt(ca,16);}
				cell++;
				if(cell>=k.qcols+k.qrows){ a=i+1; break;}
			}

			this.outbstr = bstr.substr(a);
		};
		enc.encodeTriplace = function(type){
			var cm="";

			// 盤面内側の数字部分のエンコード
			var count=0;
			for(var c=0;c<bd.cellmax;c++){
				var pstr = "", obj=bd.cell[c];

				if(obj.ques===51){
					if(obj.qnum===-1 && obj.qdir===-1){ pstr="_";}
					else if(obj.qdir==-1 && obj.qnum<35){ pstr="$"+obj.qnum.toString(36);}
					else if(obj.qnum==-1 && obj.qdir<35){ pstr="%"+obj.qdir.toString(36);}
					else{
						pstr+=obj.qdir.toString(16);
						pstr+=obj.qnum.toString(16);

						if     (obj.qnum>=16 && obj.qdir>=16){ pstr = ("="+pstr);}
						else if(obj.qnum>=16){ pstr = ("-"+pstr);}
						else if(obj.qdir>=16){ pstr = ("+"+pstr);}
					}
				}
				else{ count++;}

				if(count===0){ cm += pstr;}
				else if(pstr || count===20){ cm += ((count+15).toString(36)+pstr); count=0;}
			}
			if(count>0){ cm += (count+15).toString(36);}

			// 盤面外側の数字部分のエンコード
			for(var c=0;c<k.qcols;c++){
				var num = bd.excell[c].qdir;
				if     (num<  0){ cm += ".";}
				else if(num< 16){ cm += num.toString(16);}
				else if(num<256){ cm += ("-"+num.toString(16));}
			}
			for(var c=k.qcols;c<k.qcols+k.qrows;c++){
				var num = bd.excell[c].qnum;
				if     (num<  0){ cm += ".";}
				else if(num< 16){ cm += num.toString(16);}
				else if(num<256){ cm += ("-"+num.toString(16));}
			}

			this.outbstr += cm;
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeCellQnum51();
			this.decodeBorderAns();
			this.decodeCell( function(obj,ca){
				if     (ca==="+"){ obj.qsub = 1;}
				else if(ca==="-"){ obj.qsub = 2;}
			});
		};
		fio.encodeData = function(){
			this.encodeCellQnum51();
			this.encodeBorderAns();
			this.encodeCell( function(obj){
				if     (obj.qsub===1){ return "+ ";}
				else if(obj.qsub===2){ return "- ";}
				else                 { return ". ";}
			});
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			var tiles = this.getTileInfo();
			if( !this.checkAllArea(tiles, f_true, function(w,h,a,n){ return (a>=3);} ) ){
				this.setAlert('サイズが3マスより小さいブロックがあります。','The size of block is smaller than two.'); return false;
			}

			if( !this.checkRowsColsPartly(this.isTileCount, tiles, function(cc){ return (bd.QuC(cc)==51);}, false) ){
				this.setAlert('数字の下か右にあるまっすぐのブロックの数が間違っています。','The number of straight blocks underward or rightward is not correct.'); return false;
			}

			if( !this.checkAllArea(tiles, f_true, function(w,h,a,n){ return (a<=3);} ) ){
				this.setAlert('サイズが3マスより大きいブロックがあります。','The size of block is bigger than four.'); return false;
			}

			return true;
		};

		ans.getTileInfo = function(){
			var tinfo = new AreaInfo();
			for(var c=0;c<bd.cellmax;c++){ tinfo.id[c]=(bd.QuC(c)!=51?0:null);}
			for(var c=0;c<bd.cellmax;c++){
				if(tinfo.id[c]!==0){ continue;}
				tinfo.max++;
				tinfo[tinfo.max] = {clist:[]};
				area.sr0(c, tinfo, bd.isBorder);

				var clist = tinfo[tinfo.max].clist;
				var d = ans.getSizeOfClist(clist,f_true);

				tinfo.room[tinfo.max] = {idlist:clist, is1x3:((((d.x1===d.x2)||(d.y1===d.y2))&&d.cnt===3)?1:0)};
			}
			return tinfo;
		};

		ans.isTileCount = function(number, keycellpos, clist, tiles){
			var count = 0, counted = [];
			for(var i=0;i<clist.length;i++){
				var tid = tiles.id[clist[i]];
				if(tiles.room[tid].is1x3==1 && !counted[tid]){ count++; counted[tid] = true;}
			}
			if(number>=0 && count!=number){
				var isex = (keycellpos[0]===-1 || keycellpos[1]===-1);
				if(isex){ bd.sErE(bd.exnum(keycellpos[0],keycellpos[1]),1);}
				else    { bd.sErC(bd.cnum (keycellpos[0],keycellpos[1]),1);}
				bd.sErC(clist,1);
				return false;
			}
			return true;
		};
	}
};
