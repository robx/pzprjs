//
// パズル固有スクリプト部 アイスバーン・アイスローム・アイスローム２版 icebarn.js v3.4.1
//
pzpr.classmgr.makeCustom(['icebarn','icelom','icelom2'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.owner.playmode){
			if(this.btn.Left){
				if(this.mousestart || this.mousemove){ this.inputLine();}
				else if(this.mouseend && this.notInputted()){ this.inputpeke();}
			}
			else if(this.btn.Right){
				if(this.mousestart || this.mousemove){ this.inputpeke();}
			}
		}
		else if(this.owner.editmode){
			if(this.mousestart || this.mousemove){
				if     (this.btn.Left) { this.inputarrow();}
				else if(this.btn.Right){ this.inputIcebarn();}
			}
			else if(this.owner.pid!=='icebarn' && this.mouseend && this.notInputted()){
				this.inputqnum();
			}
		}
	},
	inputRed : function(){ this.dispRedLine();},

	inputIcebarn : function(){
		var cell = this.getcell();
		if(cell.isnull || cell===this.mouseCell){ return;}
		if(this.owner.pid!=='icebarn' && cell.isNum()){ this.inputqnum(); return;}

		if(this.inputData===null){ this.inputData = (cell.ice()?0:6);}

		cell.setQues(this.inputData);
		cell.drawaround();
		this.mouseCell = cell;
	},
	inputarrow : function(){
		var pos = this.getpos(0);
		if(this.prevPos.equals(pos)){ return;}

		var border = this.getnb(this.prevPos, pos);
		if(!border.isnull && !this.mousestart){
			var dir = this.getdir(this.prevPos, pos);

			if(border.id<this.owner.board.bdinside){
				if(this.owner.pid==='icebarn'){
					if(this.inputData===null){ this.inputData=((border.getArrow()!==dir)?1:0);}
					border.setArrow((this.inputData===1)?dir:0);
				}
			}
			else{
				if(this.inputData===null){ this.inputarrow_inout(border,dir);}
			}
			border.draw();
		}
		this.prevPos = pos;
	},
	inputarrow_inout : function(border,dir){
		var val = this.checkinout(border,dir), bd = this.owner.board;
		if     (val===1){ bd.arrowin.input(border);  this.mousereset();}
		else if(val===2){ bd.arrowout.input(border); this.mousereset();}
	},
	/* 0:どちらでもない 1:IN 2:OUT */
	checkinout : function(border,dir){
		if(border.isnull){ return 0;}
		var bd=this.owner.board, bx=border.bx, by=border.by;
		if     ((bx===bd.minbx && dir===border.RT)||(bx===bd.maxbx && dir===border.LT)||
				(by===bd.minby && dir===border.DN)||(by===bd.maxby && dir===border.UP)){ return 1;}
		else if((bx===bd.minbx && dir===border.LT)||(bx===bd.maxbx && dir===border.RT)||
				(by===bd.minby && dir===border.UP)||(by===bd.maxby && dir===border.DN)){ return 2;}
		return 0;
	}
},

//---------------------------------------------------------
// キーボード入力系
"KeyEvent@icelom,icelom2":{
	enablemake : true,

	keyinput : function(ca){
		if(this.key_inputIcebarn(ca)){ return;}
		this.key_inputqnum(ca);
	},
	key_inputIcebarn : function(ca){
		var cell = this.cursor.getc();

		if(ca==='q'){
			cell.getQues(cell.ice()?0:6);
		}
		else if(ca===' ' && cell.noNum()){
			cell.setQues(0);
		}
		else{ return false;}

		cell.drawaround();
		this.prev = cell;
		return true;
	}
},

//---------------------------------------------------------
// 盤面管理系
Border:{
	getArrow : function(){ return this.qdir;},
	setArrow : function(val){ this.setQdir(val);},
	isArrow  : function(){ return (this.qdir>0);}
},

"CellList@icebarn":{
	/* list.join() オブジェクトのIDをjoin()して返す */
	join : function(str){
		var idlist = [];
		for(var i=0;i<this.length;i++){ idlist.push(this[i].id);}
		return idlist.join(str);
	}
},

Board:{
	qcols : 8,
	qrows : 8,

	hasborder : 2,

	arrowin  : null,
	arrowout : null,

	initialize : function(){
		this.Common.prototype.initialize.call(this);

		var puzzle = this.owner;
		this.arrowin  = new puzzle.InAddress(2,0);
		this.arrowout = new puzzle.OutAddress(4,0);
		this.arrowin.partner  = this.arrowout;
		this.arrowout.partner = this.arrowin;

		this.iceinfo = this.addInfoList(puzzle.AreaIcebarnManager);
	},

	initBoardSize : function(col,row){
		this.Common.prototype.initBoardSize.call(this,col,row);

		this.disableInfo();
		if(col>=3){
			this.arrowin.init (this.minbx+1, this.minby);
			this.arrowout.init(this.minbx+5, this.minby);
		}
		else{
			this.arrowin.init (1, this.minby);
			this.arrowout.init(1, this.maxby);
		}
		this.enableInfo();
	},

	exchangeinout : function(){
		var old_in  = this.arrowin.getb();
		var old_out = this.arrowout.getb();
		old_in.setArrow(0);
		old_out.setArrow(0);
		this.arrowin.set(old_out);
		this.arrowout.set(old_in);
		
		this.arrowin.draw();
		this.arrowout.draw();
	}
},
BoardExec:{
	posinfo_in  : {},
	posinfo_out : {},
	adjustBoardData : function(key,d){
		var bd = this.owner.board;
		this.adjustBorderArrow(key,d);

		this.posinfo_in  = this.getAfterPos(key,d,bd.arrowin.getb());
		this.posinfo_out = this.getAfterPos(key,d,bd.arrowout.getb());
	},
	adjustBoardData2 : function(key,d){
		var puzzle = this.owner, bd = puzzle.board, opemgr = puzzle.opemgr;
		var info1 = this.posinfo_in, info2 = this.posinfo_out, isrec;
		
		isrec = ((key & this.REDUCE) && (info1.isdel) && (!opemgr.undoExec && !opemgr.redoExec));
		if(isrec){ opemgr.forceRecord = true;}
		bd.arrowin.set(info1.pos);
		if(isrec){ opemgr.forceRecord = false;}
		
		isrec = ((key & this.REDUCE) && (info2.isdel) && (!opemgr.undoExec && !opemgr.redoExec));
		if(isrec){ opemgr.forceRecord = true;}
		bd.arrowout.set(info2.pos);
		if(isrec){ opemgr.forceRecord = false;}
	}
},

"InOutAddress:Address":{
	type : "",
	partner : null,

	getid : function(){
		return this.getb().id;
	},
	setid : function(id){
		this.input(this.owner.board.border[id]);
	},
	geturlid : function(){
		return this.getb().id - this.owner.board.bdinside;
	},
	seturlid : function(id){
		var bd = this.owner.board;
		this.input(bd.border[id + bd.bdinside]);
	},

	input : function(border){
		if(!this.partner.equals(border)){
			if(!this.equals(border)){
				this.getb().setArrow(0);
				this.set(border);
			}
		}
		else{
			this.owner.board.exchangeinout();
		}
	},
	set : function(pos){
		var pos0 = this.getaddr();
		this.addOpe(pos.bx, pos.by);
		
		this.bx = pos.bx;
		this.by = pos.by;
		this.setarrow(this.owner.board.getb(pos.bx, pos.by));
		
		pos0.draw();
		this.draw();
	},

	addOpe : function(bx, by){
		if(this.bx===bx && this.by===by){ return;}
		this.owner.opemgr.add(new this.owner.InOutOperation(this.type, this.bx,this.by, bx,by));
	}
},
"InAddress:InOutAddress":{
	type : "in",
	
	setarrow : function(border){
		/* setarrowin_arrow */
		var bd = this.owner.board;
		if     (border.by===bd.maxby){ border.setArrow(border.UP);}
		else if(border.by===bd.minby){ border.setArrow(border.DN);}
		else if(border.bx===bd.maxbx){ border.setArrow(border.LT);}
		else if(border.bx===bd.minbx){ border.setArrow(border.RT);}
	}
},
"OutAddress:InOutAddress":{
	type : "out",
	
	setarrow : function(border){
		/* setarrowout_arrow */
		var bd = this.owner.board;
		if     (border.by===bd.minby){ border.setArrow(border.UP);}
		else if(border.by===bd.maxby){ border.setArrow(border.DN);}
		else if(border.bx===bd.minbx){ border.setArrow(border.LT);}
		else if(border.bx===bd.maxbx){ border.setArrow(border.RT);}
	}
},
"InOutOperation:Operation":{
	property : '',

	setData : function(property, x1, y1, x2, y2){
		this.property = property;
		this.bx1 = x1;
		this.by1 = y1;
		this.bx2 = x2;
		this.by2 = y2;
	},
	decode : function(strs){
		if(strs[0]!=='PI' && strs[0]!=='PO'){ return false;}
		this.property = (strs[0]=='PI'?'in':'out');
		this.bx1 = +strs[1];
		this.by1 = +strs[2];
		this.bx2 = +strs[3];
		this.by2 = +strs[4];
		return true;
	},
	toString : function(){
		return [(this.property=='in'?'PI':'PO'), this.bx1, this.by1, this.bx2, this.by2].join(',');
	},

	undo : function(){ this.exec(this.bx1, this.by1);},
	redo : function(){ this.exec(this.bx2, this.by2);},
	exec : function(bx, by){
		var bd = this.owner.board, border = bd.getb(bx,by), border0;
		if     (this.property==='in') { bd.arrowin.set(border);}
		else if(this.property==='out'){ bd.arrowout.set(border);}
	}
},

OperationManager:{
	initialize : function(){
		this.Common.prototype.initialize.call(this);
		
		this.operationlist.push(this.owner.InOutOperation);
	}
},

LineManager:{
	isCenterLine : true,
	isLineCross  : true
},

"AreaIcebarnManager:AreaManager":{
	enabled : true,
	relation : ['cell'],
	isvalid : function(cell){ return cell.ice();}
},

Flags:{
	redline : true,
	irowake : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	initialize : function(){
		this.Common.prototype.initialize.call(this);

		this.gridcolor = this.gridcolor_LIGHT;
		this.linecolor = this.linecolor_LIGHT;
		this.errcolor1 = "red";
		if(this.owner.pid!=='icebarn'){ this.fontShadecolor = this.fontcolor;}
		this.setBGCellColorFunc('icebarn');
		this.setBorderColorFunc('ice');

		this.maxYdeg = 0.70;
	},
	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();

		this.drawBorders();

		this.drawLines();
		this.drawPekes();

		if(this.owner.pid!=='icebarn'){ this.drawNumbers();}

		this.drawBorderArrows();

		this.drawChassis();

		if(this.owner.pid!=='icebarn'){ this.drawTarget();}

		this.drawInOut();
	},

	getCanvasCols : function(){
		var bd = this.owner.board, cols = this.getBoardCols()+2*this.margin;
		if(pzpr.PLAYER){
			if(bd.arrowin.bx===bd.minbx || bd.arrowout.bx===bd.minbx){ cols+=0.7;}
			if(bd.arrowin.bx===bd.maxbx || bd.arrowout.bx===bd.maxbx){ cols+=0.7;}
		}
		else{ cols+=1.4;}
		return cols;
	},
	getCanvasRows : function(){
		var bd = this.owner.board, rows = this.getBoardRows()+2*this.margin;
		if(pzpr.PLAYER){
			if(bd.arrowin.by===bd.minby || bd.arrowout.by===bd.minby){ rows+=0.7;}
			if(bd.arrowin.by===bd.maxby || bd.arrowout.by===bd.maxby){ rows+=0.7;}
		}
		else{ rows+=1.4;}
		return rows;
	},
	getOffsetCols : function(){
		var bd = this.owner.board, cols = 0;
		if(pzpr.PLAYER){
			if(bd.arrowin.bx===bd.minbx || bd.arrowout.bx===bd.minbx){ cols+=0.35;}
			if(bd.arrowin.bx===bd.maxbx || bd.arrowout.bx===bd.maxbx){ cols-=0.35;}
		}
		return cols;
	},
	getOffsetRows : function(){
		var bd = this.owner.board, rows = 0;
		if(pzpr.PLAYER){
			if(bd.arrowin.by===bd.minby || bd.arrowout.by===bd.minby){ rows+=0.35;}
			if(bd.arrowin.by===bd.maxby || bd.arrowout.by===bd.maxby){ rows-=0.35;}
		}
		return rows;
	},

	drawBorderArrows : function(){
		var g = this.vinc('border_arrow', 'crispEdges');

		var ll = this.cw*0.35;				//LineLength
		var lw = Math.max(this.cw/36, 1);	//LineWidth
		var lm = lw/2;						//LineMargin

		var headers = ["b_ar_","b_tipa_","b_tipb_"]; /* 1つのidでは2方向しかとれないはず */
		var blist = this.range.borders;
		for(var i=0;i<blist.length;i++){
			var border = blist[i], id = border.id, dir=border.getArrow();

			g.vhide([headers[0]+id, headers[1]+id, headers[2]+id]);
			if(dir>=1 && dir<=4){
				var px = border.bx*this.bw, py = border.by*this.bh;

				g.fillStyle = (border.error===4 ? this.errcolor1 : this.cellcolor);
				if(this.vnop(headers[0]+id,this.FILL)){
					switch(dir){
						case border.UP: case border.DN: g.fillRectCenter(px, py, lm, ll); break;
						case border.LT: case border.RT: g.fillRectCenter(px, py, ll, lm); break;
					}
				}

				if(this.vnop(headers[((dir+1)&1)+1]+id,this.FILL)){
					switch(dir){
						case border.UP: g.setOffsetLinePath(px,py ,0,-ll ,-ll/2,-ll*0.4 ,ll/2,-ll*0.4, true); break;
						case border.DN: g.setOffsetLinePath(px,py ,0,+ll ,-ll/2, ll*0.4 ,ll/2, ll*0.4, true); break;
						case border.LT: g.setOffsetLinePath(px,py ,-ll,0 ,-ll*0.4,-ll/2 ,-ll*0.4,ll/2, true); break;
						case border.RT: g.setOffsetLinePath(px,py , ll,0 , ll*0.4,-ll/2 , ll*0.4,ll/2, true); break;
					}
					g.fill();
				}
			}
		}
	},
	drawInOut : function(){
		var g = this.context, bd = this.owner.board, border;

		border = bd.arrowin.getb();
		if(border.id>=bd.bdinside && border.id<bd.bdmax){
			g.fillStyle = (border.error===4 ? this.errcolor1 : this.cellcolor);
			var bx = border.bx, by = border.by, px = bx*this.bw, py = by*this.bh;
			if     (by===bd.minby){                  py-=0.6*this.ch;}
			else if(by===bd.maxby){                  py+=0.6*this.ch;}
			else if(bx===bd.minbx){ px-=0.5*this.cw; py-=0.3*this.ch;}
			else if(bx===bd.maxbx){ px+=0.5*this.cw; py-=0.3*this.ch;}
			this.disptext("IN", px, py, {key:"string_in",ratio:[0.55]});
		}
		border = bd.arrowout.getb();
		if(border.id>=bd.bdinside && border.id<bd.bdmax){
			g.fillStyle = (border.error===4 ? this.errcolor1 : this.cellcolor);
			var bx = border.bx, by = border.by, px = bx*this.bw, py = by*this.bh;
			if     (by===bd.minby){                  py-=0.6*this.ch;}
			else if(by===bd.maxby){                  py+=0.6*this.ch;}
			else if(bx===bd.minbx){ px-=0.7*this.cw; py-=0.3*this.ch;}
			else if(bx===bd.maxbx){ px+=0.7*this.cw; py-=0.3*this.ch;}
			this.disptext("OUT", px, py, {key:"string_out",ratio:[0.55]});
		}
	},

	repaintParts : function(blist){
		this.range.borders = blist;

		this.drawBorderArrows();
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
"Encode@icebarn":{
	decodePzpr : function(type){
		var parser = pzpr.parser;
		if     (type===parser.URL_PZPRV3){ this.decodeIcebarn();}
		else if(type===parser.URL_PZPRAPP){
			if(this.checkpflag("c")){ this.decodeIcebarn_old2();}
			else                    { this.decodeIcebarn_old1();}
		}
	},
	encodePzpr : function(type){
		var parser = pzpr.parser;
		if     (type===parser.URL_PZPRV3){ return this.encodeIcebarn();}
		else if(type===parser.URL_PZPRAPP){ return this.encodeIcebarn_old1();}
	},

	decodeIcebarn : function(){
		var barray = this.outbstr.split("/");

		var a=0, c=0, bd=this.owner.board, twi=[16,8,4,2,1];
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

		bd.disableInfo();
		var id=0;
		for(var i=a;i<barray[0].length;i++){
			var ca = barray[0].charAt(i);
			if(ca!=='z'){
				id += parseInt(ca,36);
				if(id<bd.bdinside){
					var border = bd.border[id];
					border.setArrow(border.isHorz()?border.UP:border.LT);
				}
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
				if(id<bd.bdinside){
					var border = bd.border[id];
					border.setArrow(border.isHorz()?border.DN:border.RT);
				}
				id++;
			}
			else{ id+=35;}
			if(id>=bd.bdinside){ break;}
		}
		bd.enableInfo();

		bd.arrowin.seturlid (parseInt(barray[1]));
		bd.arrowout.seturlid(parseInt(barray[2]));

		this.outbstr = "";
	},
	encodeIcebarn : function(){
		var cm = "", num=0, pass=0, bd=this.owner.board, twi=[16,8,4,2,1];
		for(var c=0;c<bd.cellmax;c++){
			if(bd.cell[c].ques===6){ pass+=twi[num];} num++;
			if(num==5){ cm += pass.toString(32); num=0; pass=0;}
		}
		if(num>0){ cm += pass.toString(32);}

		num=0;
		for(var id=0;id<bd.bdinside;id++){
			var border = bd.border[id];
			var dir = border.getArrow();
			if(dir===border.UP||dir===border.LT){ cm+=num.toString(36); num=0;}
			else{
				num++;
				if(num>=35){ cm+="z"; num=0;}
			}
		}
		if(num>0){ cm+=num.toString(36);}

		num=0;
		for(var id=0;id<bd.bdinside;id++){
			var border = bd.border[id];
			var dir = border.getArrow();
			if(dir===border.DN||dir===border.RT){ cm+=num.toString(36); num=0;}
			else{
				num++;
				if(num>=35){ cm+="z"; num=0;}
			}
		}
		if(num>0){ cm+=num.toString(36);}

		cm += ("/"+bd.arrowin.geturlid()+"/"+bd.arrowout.geturlid());

		this.outbstr += cm;
	},

	decodeIcebarn_old2 : function(){
		var barray = this.outbstr.split("/");

		var a=0, c=0, bd = this.owner.board, twi=[16,8,4,2,1];
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

		bd.disableInfo();
		var id=0;
		for(var i=a;i<barray[2].length;i++){
			var ca = barray[2].charAt(i);
			if     (ca>='0' && ca<='9'){ var num=parseInt(ca), border=bd.border[id]; border.setArrow(((num&1)?border.UP:border.DN)); id+=((num>>1)+1);}
			else if(ca>='a' && ca<='z'){ var num=parseInt(ca,36); id+=(num-9);}
			else{ id++;}
			if(id>=(bd.qcols-1)*bd.qrows){ a=i+1; break;}
		}
		id=(bd.qcols-1)*bd.qrows;
		for(var i=a;i<barray[2].length;i++){
			var ca = barray[2].charAt(i);
			if     (ca>='0' && ca<='9'){ var num=parseInt(ca), border=bd.border[id]; border.setArrow(((num&1)?border.LT:border.RT)); id+=((num>>1)+1);}
			else if(ca>='a' && ca<='z'){ var num=parseInt(ca,36); id+=(num-9);}
			else{ id++;}
			if(id>=bd.bdinside){ break;}
		}
		bd.enableInfo();

		bd.arrowin.seturlid (parseInt(barray[0]));
		bd.arrowout.seturlid(parseInt(barray[1]));

		this.outbstr = "";
	},
	decodeIcebarn_old1 : function(){
		var barray = this.outbstr.split("/");

		var a=0, c=0, bd = this.owner.board, twi=[8,4,2,1];
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

		bd.disableInfo();
		if(barray[1]!=""){
			var array = barray[1].split("+");
			for(var i=0;i<array.length;i++){ var border=bd.cell[array[i]].adjborder.bottom; border.setArrow(border.UP);}
		}
		if(barray[2]!=""){
			var array = barray[2].split("+");
			for(var i=0;i<array.length;i++){ var border=bd.cell[array[i]].adjborder.bottom; border.setArrow(border.DN);}
		}
		if(barray[3]!=""){
			var array = barray[3].split("+");
			for(var i=0;i<array.length;i++){ var border=bd.cell[array[i]].adjborder.right; border.setArrow(border.LT);}
		}
		if(barray[4]!=""){
			var array = barray[4].split("+");
			for(var i=0;i<array.length;i++){ var border=bd.cell[array[i]].adjborder.right; border.setArrow(border.RT);}
		}
		bd.enableInfo();

		bd.arrowin.seturlid (parseInt(barray[5]));
		bd.arrowout.seturlid(parseInt(barray[6]));

		this.outbstr = "";
	},
	encodeIcebarn_old1 : function(){
		var cm = "", num=0, pass=0, bd = this.owner.board, twi=[8,4,2,1];
		for(var c=0;c<bd.cellmax;c++){
			if(bd.cell[c].ques===6){ pass+=twi[num];} num++;
			if(num===4){ cm += pass.toString(16); num=0; pass=0;}
		}
		if(num>0){ cm += pass.toString(16);}
		cm += "/";

		cm += (bd.cell.filter(function(cell){ var border=cell.adjborder.bottom; return (border.getArrow()===border.UP);}).join("+") + "/");
		cm += (bd.cell.filter(function(cell){ var border=cell.adjborder.bottom; return (border.getArrow()===border.DN);}).join("+") + "/");
		cm += (bd.cell.filter(function(cell){ var border=cell.adjborder.right;  return (border.getArrow()===border.LT);}).join("+") + "/");
		cm += (bd.cell.filter(function(cell){ var border=cell.adjborder.right;  return (border.getArrow()===border.RT);}).join("+") + "/");

		cm += (bd.arrowin.geturlid()+"/"+bd.arrowout.geturlid());

		this.outbstr += cm;
	}
},
"Encode@icelom,icelom2":{
	decodePzpr : function(type){
		this.decodeIcelom();
		this.decodeNumber16();
		this.decodeInOut();

		if(this.owner.pid==='icelom'){
			this.owner.pid = (this.checkpflag("a")?'icelom':'icelom2');
		}
	},
	encodePzpr : function(type){
		this.encodeIcelom();
		this.encodeNumber16();
		this.encodeInOut();

		if(this.owner.pid==='icelom'){ this.outpflag="a";}
	},

	decodeIcelom : function(){
		var bstr = this.outbstr;

		var a=0, c=0, bd=this.owner.board, twi=[16,8,4,2,1];
		for(var i=0;i<bstr.length;i++){
			var num = parseInt(bstr.charAt(i),32);
			for(var w=0;w<5;w++){
				if(c<bd.cellmax){
					bd.cell[c].ques = (num&twi[w]?6:0);
					c++;
				}
			}
			if(c>=bd.cellmax){ a=i+1; break;}
		}
		this.outbstr = bstr.substr(a);
	},
	encodeIcelom : function(){
		var cm = "", num=0, pass=0, bd=this.owner.board, twi=[16,8,4,2,1];
		for(var c=0;c<bd.cellmax;c++){
			if(bd.cell[c].ques===6){ pass+=twi[num];} num++;
			if(num==5){ cm += pass.toString(32); num=0; pass=0;}
		}
		if(num>0){ cm += pass.toString(32);}

		this.outbstr += cm;
	},

	decodeInOut : function(){
		var barray = this.outbstr.substr(1).split("/");

		var bd = this.owner.board;
		bd.arrowin.seturlid (parseInt(barray[0]));
		bd.arrowout.seturlid(parseInt(barray[1]));

		this.outbstr = "";
	},
	encodeInOut : function(){
		var bd = this.owner.board;
		this.outbstr += ("/"+bd.arrowin.geturlid()+"/"+bd.arrowout.geturlid());
	}
},
//---------------------------------------------------------
"FileIO@icebarn":{
	decodeData : function(){
		var bd = this.owner.board;
		bd.arrowin.setid (parseInt(this.readLine()));
		bd.arrowout.setid(parseInt(this.readLine()));

		this.decodeCell( function(obj,ca){
			if(ca==="1"){ obj.ques = 6;}
		});
		bd.disableInfo();
		this.decodeBorder( function(obj,ca){
			if(ca!=="0"){
				var val = parseInt(ca), isvert = obj.isVert();
				if(val===1&&!isvert){ obj.setArrow(obj.UP);}
				if(val===2&&!isvert){ obj.setArrow(obj.DN);}
				if(val===1&& isvert){ obj.setArrow(obj.LT);}
				if(val===2&& isvert){ obj.setArrow(obj.RT);}
			}
		});
		bd.enableInfo();
		this.decodeBorder( function(obj,ca){
			if     (ca==="1" ){ obj.line = 1;}
			else if(ca==="-1"){ obj.qsub = 2;}
		});
	},
	encodeData : function(){
		var bd = this.owner.board;
		this.datastr += (bd.arrowin.getid()+"\n"+bd.arrowout.getid()+"\n");
		this.encodeCell( function(obj){
			return (obj.ques===6?"1 ":"0 ");
		});
		this.encodeBorder( function(obj){
			var dir = obj.getArrow();
			if     (dir===obj.UP||dir===obj.LT){ return "1 ";}
			else if(dir===obj.DN||dir===obj.RT){ return "2 ";}
			else                               { return "0 ";}
		});
		this.encodeBorder( function(obj){
			if     (obj.line===1){ return "1 ";}
			else if(obj.qsub===2){ return "-1 ";}
			else                 { return "0 ";}
		});
	}
},
"FileIO@icelom,icelom2":{
	decodeData : function(){
		var bd = this.owner.board;
		bd.arrowin.setid (parseInt(this.readLine()));
		bd.arrowout.setid(parseInt(this.readLine()));

		var pzltype = this.readLine();
		if(this.owner.pid==='icelom'){
			this.owner.pid = (pzltype==="allwhite"?'icelom':'icelom2');
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
	},
	encodeData : function(){
		var bd = this.owner.board;
		var pzltype = (this.owner.pid==='icelom'?"allwhite":"skipwhite");

		this.datastr += (bd.arrowin.getid()+"\n"+bd.arrowout.getid()+"\n"+pzltype+"\n");
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
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){
		var pid = this.owner.pid;

		if( !this.checkLineCount(3) ){ return 'lnBranch';}

		if( !this.checkCrossOutOfIce() ){ return 'lnCrossExIce';}
		if( !this.checkIceLines() ){ return 'lnCurveOnIce';}

		var flag = this.checkLine();
		if( flag==-1 ){ return 'stInvalid';}
		if( flag==1 ){ return 'stNotLine';}
		if( flag==2 ){ return 'stDeadEnd';}
		if( flag==3 ){ return 'stOffField';}
		if( pid==='icebarn' && flag==4 ){ return 'awInverse';}
		if( pid!=='icebarn' && flag==5 ){ return 'nmOrder';}

		if( !this.checkOneLoop() ){ return 'lnPlLoop';}

		if( (pid==='icelom') && !this.checkUnreachedWhiteCell() ){ return 'ceEmpty';}

		if( (pid!=='icelom') && !this.checkIgnoreIcebarn() ){ return 'bkNoLine';}

		if( (pid==='icebarn') && !this.checkAllArrow() ){ return 'lnExArrow';}

		if( (pid!=='icebarn') && !this.checkNoLineNumber() ){ return 'nmUnpass';}

		if( !this.checkLineCount(1) ){ return 'lnDeadEnd';}

		return null;
	},

	checkCrossOutOfIce : function(){
		return this.checkAllCell(function(cell){ return (cell.lcnt===4 && !cell.ice());});
	},
	checkUnreachedWhiteCell : function(){
		return this.checkAllCell(function(cell){ return (cell.lcnt===0 && !cell.ice());});
	},
	checkIgnoreIcebarn : function(){
		return this.checkLinesInArea(this.owner.board.iceinfo.getAreaInfo(), function(w,h,a,n){ return (a!=0);})
	},
	checkNoLineNumber : function(){
		return this.checkAllCell(function(cell){ return (cell.lcnt===0 && cell.isNum());});
	},

	checkAllArrow : function(){
		var result = true, bd = this.owner.board;
		for(var id=0;id<bd.bdmax;id++){
			var border = bd.border[id];
			if(border.isArrow() && !border.isLine()){
				if(this.checkOnly){ return false;}
				border.seterr(4);
				result = false;
			}
		}
		return result;
	},

	checkLine : function(){
		var bd = this.owner.board, border = bd.arrowin.getb(), dir=0, count=1;
		if     (border.by===bd.minby){ dir=2;}else if(border.by===bd.maxby){ dir=1;}
		else if(border.bx===bd.minbx){ dir=4;}else if(border.bx===bd.maxbx){ dir=3;}
		if(dir==0){ return -1;}
		if(!border.isLine()){ border.seterr(4); return 1;}

		bd.border.seterr(-1);
		border.seterr(1);

		var pos = border.getaddr();
		while(1){
			pos.movedir(dir,1);
			if(pos.oncell()){
				var cell = pos.getc();
				if(cell.isnull){ continue;}
				else if(!cell.ice()){
					var adb = cell.adjborder;
					if     (cell.lcnt!==2){ dir=dir;}
					else if(dir!=1 && adb.bottom.isLine()){ dir=2;}
					else if(dir!=2 && adb.top.isLine()   ){ dir=1;}
					else if(dir!=3 && adb.right.isLine() ){ dir=4;}
					else if(dir!=4 && adb.left.isLine()  ){ dir=3;}
				}

				if(this.owner.pid!=='icebarn'){
					var num = cell.getNum();
					if(num===-1){ continue;}
					if(num!==-2 && num!==count){ cell.seterr(1); return 5;}
					count++;
				}
			}
			else{
				var border = pos.getb();
				border.seterr(1);
				if(!border.isLine()){ return 2;}
				if(bd.arrowout.equals(border)){ break;}
				else if(border.id>=bd.bdinside){ return 3;}
				if(dir===[0,2,1,4,3][border.getArrow()]){ return 4;}
			}
		}

		bd.border.seterr(0);

		return 0;
	}
},

FailCode:{
	bkNoLine  : ["すべてのアイスバーンを通っていません。", "A icebarn is not gone through."],
	lnPlLoop  : ["線がひとつながりではありません。","Lines are not countinuous."],
	lnExArrow : ["線が通っていない矢印があります。","A line doesn't go through some arrows."],
	nmOrder   : ["数字の通過順が間違っています。","A line goes through an arrow reverse."],
	nmUnpass  : ["通過していない数字があります。","The line doesn't pass all of the number."],
	stInvalid : ["スタート位置を特定できませんでした。","System can't detect start position."],
	stNotLine : ["INに線が通っていません。","The line doesn't go through the 'IN' arrow."],
	stDeadEnd : ["途中で途切れている線があります。","There is a dead-end line."],
	stOffField : ["盤面の外に出てしまった線があります","A line is not reached out the 'OUT' arrow."],
	awInverse : ["矢印を逆に通っています。","A line goes through an arrow reverse."],
	ceEmpty : ["通過していない白マスがあります。","The line doesn't pass all of the white cell."]
}
});
