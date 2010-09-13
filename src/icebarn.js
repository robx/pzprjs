//
// パズル固有スクリプト部 アイスバーン版 icebarn.js v3.3.2
//
Puzzles.icebarn = function(){ };
Puzzles.icebarn.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 8;}
		if(!k.qrows){ k.qrows = 8;}

		k.irowake  = 1;
		k.isborder = 2;

		k.isLineCross     = true;
		k.isCenterLine    = true;

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
		};
		Operation.prototype.toStringSpecial = function(){
			var prefix = (this.property=='in'?'PI':'PO');
			return [prefix, 0, 0, this.old, this.num].join(',');
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
			if(k.playmode && this.btn.Left && this.notInputted()){
				this.inputpeke();
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
			if(this.inputData===null){ this.inputData = (bd.QuC(cc)==6?0:6);}

			bd.sQuC(cc, this.inputData);
			pc.paintCellAround(cc);
			this.mouseCell = cc;
		};
		mv.inputarrow = function(){
			var pos = this.borderpos(0);
			if(this.prevPos.equals(pos)){ return;}

			var id = this.getnb(this.prevPos, pos);
			if(id!==null){
				var dir = this.getdir(this.prevPos, pos);
				if(this.inputData===null){ this.inputData = ((dir===k.UP||dir===k.LT) ? 1 : 2);}

				if(id<bd.bdinside){
					if(this.inputData==bd.getArrow(id)){ this.inputData=0;}
					bd.setArrow(id,this.inputData);
				}
				else{
					if(bd.border[id].bx===0 || bd.border[id].by===0){
						if     (this.inputData==1){ bd.inputarrowout(id);}
						else if(this.inputData==2){ bd.inputarrowin (id);}
					}
					else{
						if     (this.inputData==1){ bd.inputarrowin (id);}
						else if(this.inputData==2){ bd.inputarrowout(id);}
					}
				}
				pc.paintBorder(id);
			}
			this.prevPos = pos;
		};

		// キーボード入力系
		kc.keyinput = function(ca){ if(ca=='z' && !this.keyPressed){ this.isZ=true;}};
		kc.keyup = function(ca){ if(ca=='z'){ this.isZ=false;}};
		kc.isZ = false;

		bd.getArrow = function(id){ return this.QuB(id); };
		bd.setArrow = function(id,val){ if(id!==null){ this.sQuB(id,val);}};
		bd.isArrow  = function(id){ return (this.QuB(id)>0);};

		if(!bd.arrowin) { bd.arrowin  = null;}
		if(!bd.arrowout){ bd.arrowout = null;}
		bd.inputarrowin = function(id){
			var dir=((this.border[id].bx===0||this.border[id].by===0)?1:2);
			this.setArrow(this.arrowin,0);
			pc.paintBorder(this.arrowin);
			if(this.arrowout==id){
				um.addOpe(k.OTHER, 'out', 0, this.arrowout, this.arrowin);
				this.arrowout = this.arrowin;
				this.setArrow(this.arrowout, ((dir+1)%2)+1);
				pc.paintBorder(this.arrowout);
			}
			um.addOpe(k.OTHER, 'in', 0, this.arrowin, id);
			this.arrowin = id;
			this.setArrow(this.arrowin, (dir%2)+1);
		};
		bd.inputarrowout = function(id){
			var dir=((this.border[id].bx===0||this.border[id].by===0)?1:2);
			this.setArrow(this.arrowout,0);
			pc.paintBorder(this.arrowout);
			if(this.arrowin==id){
				um.addOpe(k.OTHER, 'in', 0, this.arrowin, this.arrowout);
				this.arrowin = this.arrowout;
				this.setArrow(this.arrowin, (dir%2)+1);
				pc.paintBorder(this.arrowin);
			}
			um.addOpe(k.OTHER, 'out', 0, this.arrowout, id);
			this.arrowout = id;
			this.setArrow(this.arrowout, ((dir+1)%2)+1);
		};
		um.execSpecial = function(ope, num){
			if     (this.property==='in') { bd.arrowin  = num;}
			else if(this.property==='out'){ bd.arrowout = num;}
			this.stackBorder(num);
		};

		bd.initSpecial = function(col,row){
			this.bdinside = 2*col*row-(col+row);
			if(base.initProcess){
				this.inputarrowin (0 + this.bdinside, 1);
				this.inputarrowout(2 + this.bdinside, 1);
			}
			else{
				if(this.arrowin<k.qcols+this.bdinside){ if(this.arrowin>col+this.bdinside){ this.arrowin=col+this.bdinside-1;} }
				else{ if(this.arrowin>col+row+this.bdinside){ this.arrowin=col+row+this.bdinside-1;} }

				if(this.arrowout<k.qcols+this.bdinside){ if(this.arrowout>col+this.bdinside){ this.arrowout=col+this.bdinside-1;} }
				else{ if(this.arrowout>col+row+this.bdinside){ this.arrowout=col+row+this.bdinside-1;} }

				if(this.arrowin==this.arrowout){ this.arrowin--;}
			}
		}

		menu.ex.adjustSpecial = function(key,d){
			var xx=(d.x1+d.x2), yy=(d.y1+d.y2);
			var ibx=bd.border[bd.arrowin ].bx, iby=bd.border[bd.arrowin ].by;
			var obx=bd.border[bd.arrowout].bx, oby=bd.border[bd.arrowout].by;
			switch(key){
			case this.FLIPY: // 上下反転
				bd.arrowin  = bd.bnum(ibx,yy-iby);
				bd.arrowout = bd.bnum(obx,yy-oby);
				for(var id=0;id<bd.bdmax;id++){
					if((bd.border[id].bx&1)&&bd.isArrow(id)){ bd.border[id].ques={1:2,2:1}[bd.getArrow(id)]; }
				}
				break;
			case this.FLIPX: // 左右反転
				bd.arrowin  = bd.bnum(xx-ibx,iby);
				bd.arrowout = bd.bnum(xx-obx,oby);
				for(var id=0;id<bd.bdmax;id++){
					if((bd.border[id].by&1)&&bd.isArrow(id)){ bd.border[id].ques={1:2,2:1}[bd.getArrow(id)]; }
				}
				break;
			case this.TURNR: // 右90°反転
				bd.arrowin  = bd.bnum(yy-iby,ibx,k.qrows,k.qcols);
				bd.arrowout = bd.bnum(yy-oby,obx,k.qrows,k.qcols);
				for(var id=0;id<bd.bdmax;id++){
					if((bd.border[id].bx&1)&&bd.isArrow(id)){ bd.border[id].ques={1:2,2:1}[bd.getArrow(id)]; }
				}
				break;
			case this.TURNL: // 左90°反転
				bd.arrowin  = bd.bnum(iby,xx-ibx,k.qrows,k.qcols);
				bd.arrowout = bd.bnum(oby,xx-obx,k.qrows,k.qcols);
				for(var id=0;id<bd.bdmax;id++){
					if((bd.border[id].by&1)&&bd.isArrow(id)){ bd.border[id].ques={1:2,2:1}[bd.getArrow(id)]; }
				}
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
		pc.setBGCellColorFunc('icebarn');
		pc.setBorderColorFunc('ice');

		pc.maxYdeg = 0.70;

		pc.paint = function(){
			this.drawBGCells();
			this.drawDashedGrid();

			this.drawBorders();

			this.drawLines();
			this.drawPekes(1);

			this.drawArrows();

			this.drawChassis();

			this.drawInOut();
		};

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
			var lm = lw/2;					//LineMargin
			var px=bd.border[id].px, py=bd.border[id].py;

			g.fillStyle = (bd.border[id].error===3 ? this.errcolor1 : this.cellcolor);
			if(this.vnop(vids[0],this.FILL)){
				var mr = Math.round;
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
				if(bd.isArrow(idlist[i])){
					this.drawArrow1(idlist[i],true);
				}
			}
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			if(type==0){ bstr = this.decodeIcebarn();}
			else if(type==1){
				if(this.checkpflag("c")){ bstr = this.decodeIcebarn_old2();}
				else{ bstr = this.decodeIcebarn_old1();}
			}
		};
		enc.pzlexport = function(type){
			if     (type==0){ return this.encodeIcebarn();}
			else if(type==1){ return this.encodeIcebarn_old1();}
		};

		enc.decodeIcebarn = function(){
			var barray = this.outbstr.split("/");

			var a=0, c=0, twi=[16,8,4,2,1];
			for(var i=0;i<barray[0].length;i++){
				var num = parseInt(barray[0].charAt(i),32);
				for(var w=0;w<5;w++){
					if(c<bd.cellmax){
						bd.cell[c].ques = (num&twi[w]?6:0);
						c++;
					}
				}
				if(c>=bd.cellmax){ a=i+1; break;}
			}

			base.disableInfo();
			var id=0;
			for(var i=a;i<barray[0].length;i++){
				var ca = barray[0].charAt(i);
				if(ca!=='z'){
					id += parseInt(ca,36);
					if(id<bd.bdinside){ bd.setArrow(id,1);}
					id++;
				}
				else{ id+=35;}
				if(id>=bd.bdinside){ a=i+1; break;}
			}

			id=0;
			for(var i=a;i<barray[0].length;i++){
				var ca = barray[0].charAt(i);
				if(ca!=='z'){
					id += parseInt(ca,36);
					if(id<bd.bdinside){ bd.setArrow(id,2);}
					id++;
				}
				else{ id+=35;}
				if(id>=bd.bdinside){ break;}
			}

			bd.setArrow(bd.arrowin,0); bd.setArrow(bd.arrowout,0);
			bd.arrowin = bd.arrowout = null;
			bd.inputarrowin (parseInt(barray[1])+bd.bdinside);
			bd.inputarrowout(parseInt(barray[2])+bd.bdinside);
			base.enableInfo();

			this.outbstr = "";
		};
		enc.encodeIcebarn = function(){
			var cm = "", num=0, pass=0, twi=[16,8,4,2,1];
			for(c=0;c<bd.cellmax;c++){
				if(bd.cell[c].ques===6){ pass+=twi[num];} num++;
				if(num==5){ cm += pass.toString(32); num=0; pass=0;}
			}
			if(num>0){ cm += pass.toString(32);}

			num=0;
			for(var id=0;id<bd.bdinside;id++){
				if(bd.getArrow(id)===1){ cm+=num.toString(36); num=0;}
				else{
					num++;
					if(num>=35){ cm+="z"; num=0;}
				}
			}
			if(num>0){ cm+=num.toString(36);}

			num=0;
			for(var id=0;id<bd.bdinside;id++){
				if(bd.getArrow(id)===2){ cm+=num.toString(36); num=0;}
				else{
					num++;
					if(num>=35){ cm+="z"; num=0;}
				}
			}
			if(num>0){ cm+=num.toString(36);}

			cm += ("/"+(bd.arrowin-bd.bdinside)+"/"+(bd.arrowout-bd.bdinside));

			this.outbstr += cm;
		};

		enc.decodeIcebarn_old2 = function(){
			var barray = this.outbstr.split("/");

			var a=0, c=0, twi=[16,8,4,2,1];
			for(var i=0;i<barray[0].length;i++){
				var num = parseInt(barray[0].charAt(i),32);
				for(var w=0;w<5;w++){
					if(c<bd.cellmax){
						bd.cell[c].ques = (num&twi[w]?6:0);
						c++;
					}
				}
				if(c>=bd.cellmax){ a=i+1; break;}
			}

			base.disableInfo();
			var id=0;
			for(var i=a;i<barray[2].length;i++){
				var ca = barray[2].charAt(i);
				if     (ca>='0' && ca<='9'){ var num=parseInt(ca); bd.setArrow(id, num%2+1); id+=((num>>1)+1);}
				else if(ca>='a' && ca<='z'){ var num=parseInt(ca,36); id+=(num-9);}
				else{ id++;}
				if(id>=(k.qcols-1)*k.qrows){ a=i+1; break;}
			}
			id=(k.qcols-1)*k.qrows;
			for(var i=a;i<barray[2].length;i++){
				var ca = barray[2].charAt(i);
				if     (ca>='0' && ca<='9'){ var num=parseInt(ca); bd.setArrow(id, num%2+1); id+=((num>>1)+1);}
				else if(ca>='a' && ca<='z'){ var num=parseInt(ca,36); id+=(num-9);}
				else{ id++;}
				if(id>=bd.bdinside){ break;}
			}

			bd.setArrow(bd.arrowin,0); bd.setArrow(bd.arrowout,0);
			bd.arrowin = bd.arrowout = null;
			bd.inputarrowin (parseInt(barray[0])+bd.bdinside);
			bd.inputarrowout(parseInt(barray[1])+bd.bdinside);
			base.enableInfo();

			this.outbstr = "";
		};
		enc.decodeIcebarn_old1 = function(){
			var barray = this.outbstr.split("/");

			var a=0, c=0, twi=[8,4,2,1];
			for(var i=0;i<barray[0].length;i++){
				var num = parseInt(barray[0].charAt(i),32);
				for(var w=0;w<4;w++){
					if(c<bd.cellmax){
						bd.cell[c].ques = (num&twi[w]?6:0);
						c++;
					}
				}
				if(c>=bd.cellmax){ break;}
			}

			base.disableInfo();
			if(barray[1]!=""){
				var array = barray[1].split("+");
				for(var i=0;i<array.length;i++){ bd.setArrow(bd.db(array[i]),1);}
			}
			if(barray[2]!=""){
				var array = barray[2].split("+");
				for(var i=0;i<array.length;i++){ bd.setArrow(bd.db(array[i]),2);}
			}
			if(barray[3]!=""){
				var array = barray[3].split("+");
				for(var i=0;i<array.length;i++){ bd.setArrow(bd.rb(array[i]),1);}
			}
			if(barray[4]!=""){
				var array = barray[4].split("+");
				for(var i=0;i<array.length;i++){ bd.setArrow(bd.rb(array[i]),2);}
			}

			bd.setArrow(bd.arrowin,0); bd.setArrow(bd.arrowout,0);
			bd.arrowin = bd.arrowout = null;
			bd.inputarrowin (parseInt(barray[5])+bd.bdinside);
			bd.inputarrowout(parseInt(barray[6])+bd.bdinside);
			base.enableInfo();

			this.outbstr = "";
		};
		enc.encodeIcebarn_old1 = function(){
			var cm = "", num=0, pass=0, twi=[8,4,2,1];
			for(var c=0;c<bd.cellmax;c++){
				if(bd.cell[c].ques===6){ pass+=twi[num];} num++;
				if(num===4){ cm += pass.toString(16); num=0; pass=0;}
			}
			if(num>0){ cm += pass.toString(16);}
			cm += "/";

			var array = [];
			for(var c=0;c<bd.cellmax;c++){ if(bd.cell[c].by<bd.maxby && bd.getArrow(bd.db(c))==1){ array.push(c);} }
			cm += (array.join("+") + "/");
			array = [];
			for(var c=0;c<bd.cellmax;c++){ if(bd.cell[c].by<bd.maxby && bd.getArrow(bd.db(c))==2){ array.push(c);} }
			cm += (array.join("+") + "/");
			array = [];
			for(var c=0;c<bd.cellmax;c++){ if(bd.cell[c].bx<bd.maxbx && bd.getArrow(bd.rb(c))==1){ array.push(c);} }
			cm += (array.join("+") + "/");
			array = [];
			for(var c=0;c<bd.cellmax;c++){ if(bd.cell[c].bx<bd.maxbx && bd.getArrow(bd.rb(c))==2){ array.push(c);} }
			cm += (array.join("+") + "/");

			cm += ((bd.arrowin-bd.bdinside)+"/"+(bd.arrowout-bd.bdinside));

			this.outbstr += cm;
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			bd.inputarrowin (parseInt(this.readLine()));
			bd.inputarrowout(parseInt(this.readLine()));

			this.decodeCell( function(obj,ca){
				if(ca==="1"){ obj.ques = 6;}
			});
			base.disableInfo();
			this.decodeBorder( function(obj,ca){
				if(ca!=="0"){
					var id = bd.bnum(obj.bx, obj.by);
					bd.setArrow(id, parseInt(ca));
				}
			});
			base.enableInfo();
			this.decodeBorder( function(obj,ca){
				if     (ca==="1" ){ obj.line = 1;}
				else if(ca==="-1"){ obj.qsub = 2;}
			});
		};
		fio.encodeData = function(){
			this.datastr += (bd.arrowin+"/"+bd.arrowout+"/");
			this.encodeCell( function(obj){
				return (obj.ques===6?"1 ":"0 ");
			});
			this.encodeBorder( function(obj){
				var id = bd.bnum(obj.bx, obj.by);
				if     (bd.getArrow(id)===1){ return "1 ";}
				else if(bd.getArrow(id)===2){ return "2 ";}
				else                        { return "0 ";}
			});
			this.encodeBorder( function(obj){
				if     (obj.line===1){ return "1 ";}
				else if(obj.qsub===2){ return "-1 ";}
				else                 { return "0 ";}
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
				this.setAlert('矢印を逆に通っています。', 'A line goes through an arrow reverse.'); return false;
			}

			if( !this.checkOneLoop() ){
				this.setAlert('線がひとつながりではありません。', 'Lines are not countinuous.'); return false;
			}

			if( !this.checkIcebarns() ){
				this.setAlert('すべてのアイスバーンを通っていません。', 'A icebarn is not gone through.'); return false;
			}

			if( !this.checkAllArrow() ){
				this.setAlert('線が通っていない矢印があります。', 'A line doesn\'t go through some arrows.'); return false;
			}

			if( !this.checkLcntCell(1) ){
				this.setAlert('途中で途切れている線があります。', 'There is a dead-end line.'); return false;
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

		ans.checkAllArrow = function(){
			var result = true;
			for(var id=0;id<bd.bdmax;id++){
				if(bd.isArrow(id) && !bd.isLine(id)){
					if(this.inAutoCheck){ return false;}
					bd.sErB([id],3);
					result = false;
				}
			}
			return result;
		};

		ans.searchLine = function(){
			var bx=bd.border[bd.arrowin].bx, by=bd.border[bd.arrowin].by;
			var dir=0;
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
				}
				else{
					var id = bd.bnum(bx,by);
					bd.sErB([id],1);
					if(!bd.isLine(id)){ return 2;}
					if(bd.arrowout==id){ break;}
					else if(id===null || id>=bd.bdinside){ return 3;}

					if(((dir==1||dir==3) && bd.getArrow(id)==2) || ((dir==2||dir==4) && bd.getArrow(id)==1)){ return 4;}
				}
			}

			bd.sErBAll(0);

			return 0;
		};
	}
};
