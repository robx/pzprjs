//
// パズル固有スクリプト部 アイスローム・アイスローム２版 icelom.js v3.4.0
//
Puzzles.icelom = function(){ };
Puzzles.icelom.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 8;}
		if(!k.qrows){ k.qrows = 8;}

		k.irowake  = 1;
		k.isborder = 2;

		k.isLineCross     = true;
		k.isCenterLine    = true;
		k.isDispHatena    = true;
		k.isInputHatena   = true;

		k.ispzprv3ONLY    = true;

		k.bdmargin       = 1.00;
		k.bdmargin_image = 1.00;

		base.setFloatbgcolor("rgb(0, 0, 127)");
	},
	menufix : function(){
		menu.addRedLineToFlags();
	},

	protoChange : function(){
		Operation.prototype.decodeSpecial = function(strs){
			this.property = (strs[0]=='PI'?'in':'out');
			this.old = bd.bnum(strs[1], strs[2]);
			this.num = bd.bnum(strs[3], strs[4]);
		};
		Operation.prototype.toStringSpecial = function(){
			var prefix = (this.property=='in'?'PI':'PO');
			var obj1=bd.border[this.old], obj2=bd.border[this.num];
			var bx1=(!!obj1 ? obj1.bx : -1), by1=(!!obj1 ? obj1.by : -1);
			var bx2=(!!obj2 ? obj2.bx : -1), by2=(!!obj2 ? obj2.by : -1);
			return [prefix, bx1, by1, bx2, by2].join(',');
		};
	},
	protoOriginal : function(){
		Operation.prototype.decodeSpecial = function(strs){};
		Operation.prototype.toStringSpecial = function(){};
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(kc.isZ ^ pp.getVal('dispred')){ this.dispRedLine(); return;}
			if(k.editmode){
				if(this.btn.Left) this.inputarrow();
				else if(this.btn.Right) this.inputIcebarn();
			}
			else if(k.playmode){
				if(this.btn.Left) this.inputLine();
				else if(this.btn.Right) this.inputpeke();
			}
		};
		mv.mouseup = function(){
			if(this.notInputted()){
				if(k.editmode){ this.inputqnum();}
				else if(k.playmode && this.btn.Left){ this.inputpeke();}
			}
		};
		mv.mousemove = function(){
			if(k.editmode){
				if(this.btn.Left) this.inputarrow();
				else if(this.btn.Right) this.inputIcebarn();
			}
			else if(k.playmode){
				if(this.btn.Left) this.inputLine();
				else if(this.btn.Right) this.inputpeke();
			}
		};
		mv.inputIcebarn = function(){
			var cc = this.cellid();
			if(cc===null || cc===this.mouseCell){ return;}
			if(bd.isNum(cc)){ this.inputqnum(); return;}

			if(this.inputData===null){ this.inputData = (bd.QuC(cc)==6?0:6);}

			bd.sQuC(cc, this.inputData);
			pc.paintCellAround(cc);
			this.mouseCell = cc;
		};
		mv.inputarrow = function(){
			var pos = this.borderpos(0);
			if(this.prevPos.equals(pos)){ return;}

			var id = this.getnb(this.prevPos, pos);
			if(id!==null && !this.ismousedown){
				var dir = this.getdir(this.prevPos, pos);
				var val = ((dir===k.UP||dir===k.LT)?1:2);

				if(id>=bd.bdinside){
					if(this.inputData===null){
						val = this.checkinout(id,dir);
						if     (val===1){ bd.inputarrowin(id);  this.mousereset();}
						else if(val===2){ bd.inputarrowout(id); this.mousereset();}
					}
				}
				pc.paintBorder(id);
				pc.paintBorder(id);
			}
			this.prevPos = pos;
		};
		/* 0:どちらでもない 1:IN 2:OUT */
		mv.checkinout = function(id,dir){
			if(bd.border[id]===(void 0)){ return 0;}
			var bx=bd.border[id].bx, by=bd.border[id].by;
			if     ((bx===bd.minbx && dir===k.RT)||(bx===bd.maxbx && dir===k.LT)||
					(by===bd.minby && dir===k.DN)||(by===bd.maxby && dir===k.UP)){ return 1;}
			else if((bx===bd.minbx && dir===k.LT)||(bx===bd.maxbx && dir===k.RT)||
					(by===bd.minby && dir===k.UP)||(by===bd.maxby && dir===k.DN)){ return 2;}
			return 0;
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(k.playmode){ return;}
			if(this.moveTCell(ca)){ return;}
			if(this.key_inputIcebarn(ca)){ return;}
			this.key_inputqnum(ca);
		};

		kc.key_inputIcebarn = function(ca){
			var cc = tc.getTCC();

			if(ca==='q'){
				bd.sQuC(cc, bd.QuC(cc)==6?0:6);
			}
			else if(ca===' ' && bd.noNum(cc)){
				bd.sQuC(cc, 0);
			}
			else{ return false;}

			pc.paintCellAround(cc);
			this.prev = cc;
			return true;
		};

		bd.getArrow = function(id){ return this.QuB(id); };
		bd.setArrow = function(id,val){ if(id!==null){ this.sQuB(id,val);}};
		bd.isArrow  = function(id){ return (this.QuB(id)>0);};

		if(!bd.arrowin) { bd.arrowin  = null;}
		if(!bd.arrowout){ bd.arrowout = null;}
		bd.setarrowin = function(id){
			um.addOpe(k.OTHER, 'in', 0, this.arrowin, id);
			this.arrowin = id;
			this.setArrow(id, ((this.border[id].bx===bd.maxbx||this.border[id].by===bd.maxby)?1:2));
		};
		bd.setarrowout = function(id){
			um.addOpe(k.OTHER, 'out', 0, this.arrowout, id);
			this.arrowout = id;
			this.setArrow(id, ((this.border[id].bx===bd.minbx||this.border[id].by===bd.minby)?1:2));
		};
		bd.inputarrowin = function(id){
			var old_in=this.arrowin, old_out=this.arrowout;
			if(old_out==id){ this.setarrowout(old_in);}
			else{ this.setArrow(old_in, 0);}
			this.setarrowin(id);
			
			pc.paintBorder(old_in);
		};
		bd.inputarrowout = function(id){
			var old_in=this.arrowin, old_out=this.arrowout;
			if(old_in==id){ this.setarrowin(old_out);}
			else{ this.setArrow(old_out, 0);}
			this.setarrowout(id);
			
			pc.paintBorder(old_out);
		};
		um.execSpecial = function(ope, num){
			var id0 = bd.startid;
			if     (this.property==='in') { bd.arrowin  = num;}
			else if(this.property==='out'){ bd.arrowout = num;}
			this.stackBorder(id0);
			this.stackBorder(num);
		};

		bd.disableInfo();
		bd.inputarrowin (0 + bd.bdinside, 1);
		bd.inputarrowout(2 + bd.bdinside, 1);
		bd.enableInfo();

		bd.initSpecial = function(col,row){
			this.bdinside = 2*col*row-(col+row);

			if(this.arrowin<k.qcols+this.bdinside){ if(this.arrowin>col+this.bdinside){ this.arrowin=col+this.bdinside-1;} }
			else{ if(this.arrowin>col+row+this.bdinside){ this.arrowin=col+row+this.bdinside-1;} }

			if(this.arrowout<k.qcols+this.bdinside){ if(this.arrowout>col+this.bdinside){ this.arrowout=col+this.bdinside-1;} }
			else{ if(this.arrowout>col+row+this.bdinside){ this.arrowout=col+row+this.bdinside-1;} }

			if(this.arrowin==this.arrowout){ this.arrowin--;}
		};

		menu.ex.adjustSpecial = function(key,d){
			var xx=(d.x1+d.x2), yy=(d.y1+d.y2);
			var ibx=bd.border[bd.arrowin ].bx, iby=bd.border[bd.arrowin ].by;
			var obx=bd.border[bd.arrowout].bx, oby=bd.border[bd.arrowout].by;
			switch(key){
			case this.FLIPY: // 上下反転
				bd.arrowin  = bd.bnum(ibx,yy-iby);
				bd.arrowout = bd.bnum(obx,yy-oby);
				break;
			case this.FLIPX: // 左右反転
				bd.arrowin  = bd.bnum(xx-ibx,iby);
				bd.arrowout = bd.bnum(xx-obx,oby);
				break;
			case this.TURNR: // 右90°反転
				bd.arrowin  = bd.bnum(yy-iby,ibx,k.qrows,k.qcols);
				bd.arrowout = bd.bnum(yy-oby,obx,k.qrows,k.qcols);
				break;
			case this.TURNL: // 左90°反転
				bd.arrowin  = bd.bnum(iby,xx-ibx,k.qrows,k.qcols);
				bd.arrowout = bd.bnum(oby,xx-obx,k.qrows,k.qcols);
				break;
			case this.EXPANDUP: case this.EXPANDDN: // 上下盤面拡大
				bd.arrowin  += 2*k.qcols-1;
				bd.arrowout += 2*k.qcols-1;
				break;
			case this.EXPANDLT: case this.EXPANDRT: // 左右盤面拡大
				bd.arrowin  += 2*k.qrows-1;
				bd.arrowout += 2*k.qrows-1;
				break;
			case this.REDUCEUP: case this.REDUCEDN: // 上下盤面縮小
				bd.arrowin  -= 2*k.qcols-1;
				bd.arrowout -= 2*k.qcols-1;
				break;
			case this.REDUCELT: case this.REDUCERT: // 左右盤面縮小
				bd.arrowin  -= 2*k.qrows-1;
				bd.arrowout -= 2*k.qrows-1;
				break;
			}
		};
		menu.ex.expandborder = function(key){ };
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_LIGHT;
		pc.linecolor = pc.linecolor_LIGHT;
		pc.errcolor1 = "red";
		pc.fontBCellcolor = pc.fontcolor;
		pc.setBGCellColorFunc('icebarn');
		pc.setBorderColorFunc('ice');

		pc.maxYdeg = 0.70;

		pc.paint = function(){
			this.drawBGCells();
			this.drawDashedGrid();

			this.drawBorders();

			this.drawLines();
			this.drawPekes(1);

			this.drawNumbers();

			this.drawArrows();

			this.drawChassis();

			this.drawTarget();

			this.drawInOut();
		};

		// IN/OUTの矢印用に必要ですね。。
		pc.drawArrows = function(){
			this.vinc('border_arrow', 'crispEdges');

			var idlist = this.range.borders;
			for(var i=0;i<idlist.length;i++){ this.drawArrow1(idlist[i], bd.isArrow(idlist[i]));}
		};
		pc.drawArrow1 = function(id, flag){
			var vids = ["b_ar_"+id,"b_dt1_"+id,"b_dt2_"+id];
			if(!flag){ this.vhide(vids); return;}

			var ll = this.cw*0.35;				//LineLength
			var lw = Math.max(this.cw/36, 1);	//LineWidth
			var lm = lw/2;						//LineMargin
			var px=bd.border[id].px, py=bd.border[id].py;

			g.fillStyle = (bd.border[id].error===3 ? this.errcolor1 : this.cellcolor);
			if(this.vnop(vids[0],this.FILL)){
				if(bd.border[id].bx&1){ g.fillRect(px-lm, py-ll, lw, ll*2);}
				if(bd.border[id].by&1){ g.fillRect(px-ll, py-lm, ll*2, lw);}
			}

			if(bd.getArrow(id)===1){
				if(this.vnop(vids[1],this.FILL)){
					if(bd.border[id].bx&1){ g.setOffsetLinePath(px,py ,0,-ll ,-ll/2,-ll*0.4 ,ll/2,-ll*0.4, true);}
					if(bd.border[id].by&1){ g.setOffsetLinePath(px,py ,-ll,0 ,-ll*0.4,-ll/2 ,-ll*0.4,ll/2, true);}
					g.fill();
				}
			}
			else{ this.vhide(vids[1]);}
			if(bd.getArrow(id)===2){
				if(this.vnop(vids[2],this.FILL)){
					if(bd.border[id].bx&1){ g.setOffsetLinePath(px,py ,0,+ll ,-ll/2, ll*0.4 ,ll/2, ll*0.4, true);}
					if(bd.border[id].by&1){ g.setOffsetLinePath(px,py , ll,0 , ll*0.4,-ll/2 , ll*0.4,ll/2, true);}
					g.fill();
				}
			}
			else{ this.vhide(vids[2]);}
		};
		pc.drawInOut = function(){
			if(bd.arrowin<bd.bdinside || bd.arrowin>=bd.bdmax || bd.arrowout<bd.bdinside || bd.arrowout>=bd.bdmax){ return;}

			g.fillStyle = (bd.border[bd.arrowin].error===3 ? this.errcolor1 : this.cellcolor);
			var bx = bd.border[bd.arrowin].bx, by = bd.border[bd.arrowin].by;
			var px = bd.border[bd.arrowin].px, py = bd.border[bd.arrowin].py;
			if     (by===bd.minby){ this.dispnum("string_in", 1, "IN", 0.55, "black", px,             py-0.6*this.ch);}
			else if(by===bd.maxby){ this.dispnum("string_in", 1, "IN", 0.55, "black", px,             py+0.6*this.ch);}
			else if(bx===bd.minbx){ this.dispnum("string_in", 1, "IN", 0.55, "black", px-0.5*this.cw, py-0.3*this.ch);}
			else if(bx===bd.maxbx){ this.dispnum("string_in", 1, "IN", 0.55, "black", px+0.5*this.cw, py-0.3*this.ch);}

			g.fillStyle = (bd.border[bd.arrowout].error===3 ? this.errcolor1 : this.cellcolor);
			var bx = bd.border[bd.arrowout].bx, by = bd.border[bd.arrowout].by;
			var px = bd.border[bd.arrowout].px, py = bd.border[bd.arrowout].py;
			if     (by===bd.minby){ this.dispnum("string_out", 1, "OUT", 0.55, "black", px,             py-0.6*this.ch);}
			else if(by===bd.maxby){ this.dispnum("string_out", 1, "OUT", 0.55, "black", px,             py+0.6*this.ch);}
			else if(bx===bd.minbx){ this.dispnum("string_out", 1, "OUT", 0.55, "black", px-0.7*this.cw, py-0.3*this.ch);}
			else if(bx===bd.maxbx){ this.dispnum("string_out", 1, "OUT", 0.55, "black", px+0.7*this.cw, py-0.3*this.ch);}
		};

		pc.repaintParts = function(idlist){
			for(var i=0;i<idlist.length;i++){
				if(idlist[i]===bd.arrowin || idlist[i]===bd.arrowout){
					this.drawArrow1(idlist[i],true);
				}
			}
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decodeIcelom();
			this.decodeNumber16();
			this.decodeInOut();

			if(k.puzzleid==='icelom'){
				k.puzzleid = (this.checkpflag("a")?'icelom':'icelom2');
				menu.displayTitle();
			}
		};
		enc.pzlexport = function(type){
			this.encodeIcelom();
			this.encodeNumber16();
			this.encodeInOut();
		};

		enc.decodeIcelom = function(){
			var bstr = this.outbstr;

			var a=0, c=0, twi=[16,8,4,2,1];
			for(var i=0;i<bstr.length;i++){
				var num = parseInt(bstr.charAt(i),32);
				for(var w=0;w<5;w++){
					if(c<bd.cellmax){
						bd.sQuC(c,(num&twi[w]?6:0));
						c++;
					}
				}
				if(c>=bd.cellmax){ a=i+1; break;}
			}
			this.outbstr = bstr.substr(a);
		};
		enc.encodeIcelom = function(){
			var cm = "", num=0, pass=0, twi=[16,8,4,2,1];
			for(var c=0;c<bd.cellmax;c++){
				if(bd.cell[c].ques===6){ pass+=twi[num];} num++;
				if(num==5){ cm += pass.toString(32); num=0; pass=0;}
			}
			if(num>0){ cm += pass.toString(32);}

			this.outbstr += cm;
		};

		enc.decodeInOut = function(){
			var barray = this.outbstr.substr(1).split("/");

			bd.disableInfo();
			bd.setArrow(bd.arrowin,0); bd.setArrow(bd.arrowout,0);
			bd.arrowin = bd.arrowout = null;
			bd.inputarrowin (parseInt(barray[0])+bd.bdinside);
			bd.inputarrowout(parseInt(barray[1])+bd.bdinside);
			bd.enableInfo();

			this.outbstr = "";
		};
		enc.encodeInOut = function(){
			this.outbstr += ("/"+(bd.arrowin-bd.bdinside)+"/"+(bd.arrowout-bd.bdinside));
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			bd.disableInfo();
			bd.inputarrowin (parseInt(this.readLine()));
			bd.inputarrowout(parseInt(this.readLine()));
			bd.enableInfo();

			var pzltype = this.readLine();
			if(k.puzzleid==='icelom'){
				k.puzzleid = (pzltype==="allwhite"?'icelom':'icelom2');
				menu.displayTitle();
			}

			this.decodeCell( function(obj,ca){
				if(ca.charAt(0)==='i'){ obj.ques=6; ca=ca.substr(1);}

				if(ca!=='' && ca!=='.'){
					obj.qnum = (ca!=='?' ? parseInt(ca) : -2);
				}
			});
			this.decodeBorder( function(obj,ca){
				if     (ca==="1" ){ obj.line = 1;}
				else if(ca==="-1"){ obj.qsub = 2;}
			});
		};
		fio.encodeData = function(){
			var pzltype = (k.puzzleid==='icelom'?"allwhite":"skipwhite");

			this.datastr += (bd.arrowin+"/"+bd.arrowout+"/"+pzltype+"/");
			this.encodeCell( function(obj){
				var istr = (obj.ques===6 ? "i" : ""), qstr='';
				if     (obj.qnum===-1){ qstr = (istr==="" ? ". " : " ");}
				else if(obj.qnum===-2){ qstr = "? ";}
				else{ qstr = obj.qnum+" ";}
				return istr+qstr;
			});
			this.encodeBorder( function(obj){
				if     (obj.line===1){ return "1 "; }
				else if(obj.qsub===2){ return "-1 ";}
				else                 { return "0 "; }
			});
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			if( !this.checkLcntCell(3) ){
				this.setAlert('分岐している線があります。','There is a branch line.'); return false;
			}

			if( !this.checkAllCell(function(c){ return (line.lcntCell(c)===4 && bd.QuC(c)!==6);}) ){
				this.setAlert('氷の部分以外で線が交差しています。', 'A Line is crossed outside of ice.'); return false;
			}
			if( !this.checkIceLines() ){
				this.setAlert('氷の部分で線が曲がっています。', 'A Line curve on ice.'); return false;
			}

			var flag = this.searchLine();
			if( flag==-1 ){
				this.setAlert('スタート位置を特定できませんでした。', 'The system can\'t detect start position.'); return false;
			}
			if( flag==1 ){
				this.setAlert('INに線が通っていません。', 'The line doesn\'t go through the \'IN\' arrow.'); return false;
			}
			if( flag==2 ){
				this.setAlert('途中で途切れている線があります。', 'There is a dead-end line.'); return false;
			}
			if( flag==3 ){
				this.setAlert('盤面の外に出てしまった線があります。', 'A line is not reached out the \'OUT\' arrow.'); return false;
			}
			if( flag==4 ){
				this.setAlert('数字の通過順が間違っています。', 'A line goes through an arrow reverse.'); return false;
			}

			if( !this.checkOneLoop() ){
				this.setAlert('線がひとつながりではありません。', 'Lines are not countinuous.'); return false;
			}

			if( !this.checkLcntCell(1) ){
				this.setAlert('途中で途切れている線があります。', 'There is a dead-end line.'); return false;
			}

			if( (k.puzzleid==='icelom') && !this.checkAllCell(function(c){ return (line.lcntCell(c)===0 && bd.QuC(c)!==6);}) ){
				this.setAlert('通過していない白マスがあります。', 'The line doesn\'t pass all of the white cell.'); return false;
			}

			if( (k.puzzleid==='icelom2') && !this.checkIcebarns() ){
				this.setAlert('すべてのアイスバーンを通っていません。', 'A icebarn is not gone through.'); return false;
			}

			if( !this.checkAllCell(function(c){ return (line.lcntCell(c)===0 && bd.isNum(c));}) ){
				this.setAlert('通過していない数字があります。', 'The line doesn\'t pass all of the number.'); return false;
			}

			return true;
		};

		ans.checkIcebarns = function(){
			var iarea = new AreaInfo();
			for(var cc=0;cc<bd.cellmax;cc++){ iarea.id[cc]=(bd.QuC(cc)==6?0:null); }
			for(var cc=0;cc<bd.cellmax;cc++){
				if(iarea.id[cc]!==0){ continue;}
				iarea.max++;
				iarea[iarea.max] = {clist:[]};
				area.sc0(cc,iarea);

				iarea.room[iarea.max] = {idlist:iarea[iarea.max].clist};
			}

			return this.checkLinesInArea(iarea, function(w,h,a,n){ return (a!=0);});
		};

		ans.searchLine = function(){
			var bx=bd.border[bd.arrowin].bx, by=bd.border[bd.arrowin].by;
			var dir=0, count=1;
			if     (by===bd.minby){ dir=2;}else if(by===bd.maxby){ dir=1;}
			else if(bx===bd.minbx){ dir=4;}else if(bx===bd.maxbx){ dir=3;}
			if(dir==0){ return -1;}
			if(!bd.isLine(bd.arrowin)){ bd.sErB([bd.arrowin],3); return 1;}

			bd.sErBAll(2);
			bd.sErB([bd.arrowin],1);

			while(1){
				switch(dir){ case 1: by--; break; case 2: by++; break; case 3: bx--; break; case 4: bx++; break;}
				if(!((bx+by)&1)){
					var cc = bd.cnum(bx,by);
					if(cc===null){ continue;}
					if(bd.QuC(cc)!=6){
						if     (line.lcntCell(cc)!=2){ dir=dir;}
						else if(dir!=1 && bd.isLine(bd.bnum(bx,by+1))){ dir=2;}
						else if(dir!=2 && bd.isLine(bd.bnum(bx,by-1))){ dir=1;}
						else if(dir!=3 && bd.isLine(bd.bnum(bx+1,by))){ dir=4;}
						else if(dir!=4 && bd.isLine(bd.bnum(bx-1,by))){ dir=3;}
					}

					var num = bd.getNum(cc);
					if(num===-1){ continue;}
					if(num!==-2 && num!==count){ bd.sErC([cc],1); return 4;}
					count++;
				}
				else{
					var id = bd.bnum(bx,by);
					bd.sErB([id],1);
					if(!bd.isLine(id)){ return 2;}
					if(bd.arrowout===id){ break;}
					else if(id===null || id>=bd.bdinside){ return 3;}
				}
			}

			bd.sErBAll(0);

			return 0;
		};
	}
};
