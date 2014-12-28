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
			cell.setQues(cell.ice()?0:6);
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
		this.common.initialize.call(this);

		var puzzle = this.owner;
		this.arrowin  = new puzzle.InAddress(2,0);
		this.arrowout = new puzzle.OutAddress(4,0);
		this.arrowin.partner  = this.arrowout;
		this.arrowout.partner = this.arrowin;

		this.iceinfo = this.addInfoList(puzzle.AreaIcebarnManager);
	},

	initBoardSize : function(col,row){
		this.common.initBoardSize.call(this,col,row);

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
	},

	getTraceInfo : function(){
		var border = this.arrowin.getb(), dir=border.qdir, pos = border.getaddr();
		var info = {lastcell:this.emptycell, lastborder:border, blist:(new this.owner.BorderList()), dir:dir, count:1};
		info.blist.add(border);

		while(1){
			pos.movedir(dir,1);
			if(pos.oncell()){
				var cell = info.lastcell = pos.getc();
				if(cell.isnull){ break;}
				else if(!cell.ice()){
					var adb = cell.adjborder;
					if     (cell.lcnt!==2){ }
					else if(dir!==1 && adb.bottom.isLine()){ dir=2;}
					else if(dir!==2 && adb.top.isLine()   ){ dir=1;}
					else if(dir!==3 && adb.right.isLine() ){ dir=4;}
					else if(dir!==4 && adb.left.isLine()  ){ dir=3;}
					info.dir = dir;
				}

				if(this.owner.pid!=='icebarn'){
					var num = cell.getNum();
					if(num!==-1){
						if(num!==-2 && num!==info.count){ break;}
						info.count++;
					}
				}
			}
			else{
				border = info.lastborder = pos.getb();
				if(!border.isLine()){ break;}
				
				info.blist.add(border);
				var arrow = border.getArrow();
				if(arrow!==border.NDIR && dir!==arrow){ break;}
			}
		}

		return info;
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

	init : function(bx,by){
		this.bx = bx;
		this.by = by;
		if(!!this.owner.board){ this.setarrow(this.getb());}
		return this;
	},

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
		this.setarrow(this.getb());
		
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
		this.property = (strs[0]==='PI'?'in':'out');
		this.bx1 = +strs[1];
		this.by1 = +strs[2];
		this.bx2 = +strs[3];
		this.by2 = +strs[4];
		return true;
	},
	toString : function(){
		return [(this.property==='in'?'PI':'PO'), this.bx1, this.by1, this.bx2, this.by2].join(',');
	},

	undo : function(){ this.exec(this.bx1, this.by1);},
	redo : function(){ this.exec(this.bx2, this.by2);},
	exec : function(bx, by){
		var bd = this.owner.board, border = bd.getb(bx,by);
		if     (this.property==='in') { bd.arrowin.set(border);}
		else if(this.property==='out'){ bd.arrowout.set(border);}
	}
},

OperationManager:{
	initialize : function(){
		this.common.initialize.call(this);
		
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
	gridcolor_type : "LIGHT",
	linecolor_type : "LIGHT",

	bgcellcolor_func : "icebarn",
	bordercolor_func : "ice",

	errcolor1 : "red",

	fontShadecolor : "black", /* icelom, icelom2用 this.fontcolorと同じ */

	maxYdeg : 0.70,

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
		var g = this.vinc('border_arrow', 'crispEdges', true);

		var ll = this.cw*0.35;				//LineLength
		var lw = Math.max(this.cw/36, 1);	//LineWidth
		var lm = lw/2;						//LineMargin

		var blist = this.range.borders;
		for(var i=0;i<blist.length;i++){
			var border = blist[i], dir=border.getArrow();
			var px = border.bx*this.bw, py = border.by*this.bh;

			g.fillStyle = (border.error===4 ? this.errcolor1 : this.quescolor);
			g.vid = "b_ar_"+border.id;
			if(dir!==border.NDIR){
				switch(dir){
					case border.UP: case border.DN: g.fillRectCenter(px, py, lm, ll); break;
					case border.LT: case border.RT: g.fillRectCenter(px, py, ll, lm); break;
				}
			}
			else{ g.vhide();}

			/* 1つのidでは2方向しかとれないはず */
			g.vid = "b_tipa_"+border.id;
			if(dir===border.UP||dir===border.LT){
				g.beginPath();
				switch(dir){
					case border.UP: g.setOffsetLinePath(px,py ,0,-ll ,-ll/2,-ll*0.4 ,ll/2,-ll*0.4, true); break;
					case border.LT: g.setOffsetLinePath(px,py ,-ll,0 ,-ll*0.4,-ll/2 ,-ll*0.4,ll/2, true); break;
				}
				g.fill();
			}
			else{ g.vhide();}

			g.vid = "b_tipb_"+border.id;
			if(dir===border.DN||dir===border.RT){
				g.beginPath();
				switch(dir){
					case border.DN: g.setOffsetLinePath(px,py ,0,+ll ,-ll/2, ll*0.4 ,ll/2, ll*0.4, true); break;
					case border.RT: g.setOffsetLinePath(px,py , ll,0 , ll*0.4,-ll/2 , ll*0.4,ll/2, true); break;
				}
				g.fill();
			}
			else{ g.vhide();}
		}
	},
	drawInOut : function(){
		var g = this.context, bd = this.owner.board, border;

		g.vid = "string_in";
		border = bd.arrowin.getb();
		if(border.id>=bd.bdinside && border.id<bd.bdmax){
			var bx = border.bx, by = border.by, px = bx*this.bw, py = by*this.bh;
			if     (by===bd.minby){                  py-=0.6*this.ch;}
			else if(by===bd.maxby){                  py+=0.6*this.ch;}
			else if(bx===bd.minbx){ px-=0.5*this.cw; py-=0.3*this.ch;}
			else if(bx===bd.maxbx){ px+=0.5*this.cw; py-=0.3*this.ch;}
			g.fillStyle = (border.error===4 ? this.errcolor1 : this.quescolor);
			this.disptext("IN", px, py, {ratio:[0.55]});
		}
		else{ g.vhide();}

		g.vid = "string_out";
		border = bd.arrowout.getb();
		if(border.id>=bd.bdinside && border.id<bd.bdmax){
			var bx = border.bx, by = border.by, px = bx*this.bw, py = by*this.bh;
			if     (by===bd.minby){                  py-=0.6*this.ch;}
			else if(by===bd.maxby){                  py+=0.6*this.ch;}
			else if(bx===bd.minbx){ px-=0.7*this.cw; py-=0.3*this.ch;}
			else if(bx===bd.maxbx){ px+=0.7*this.cw; py-=0.3*this.ch;}
			g.fillStyle = (border.error===4 ? this.errcolor1 : this.quescolor);
			this.disptext("OUT", px, py, {ratio:[0.55]});
		}
		else{ g.vhide();}
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
		var urlver = (type===parser.URL_PZPRV3 ? 3 : (this.checkpflag("c") ? 2 : 1));
		
		if(urlver===2){
			var barray = this.outbstr.split("/");
			this.outbstr = [barray[2], barray[0], barray[1]].join("/");
		}
		
		if     (urlver>= 2){ this.decodeIce();}
		else               { this.decodeIce_old1();}
		
		if     (urlver===3){ this.decodeBorderArrow();}
		else if(urlver===2){ this.decodeBorderArrow_old2();}
		else               { this.decodeBorderArrow_old1();}
		
		this.decodeInOut();
	},
	encodePzpr : function(type){
		var parser = pzpr.parser;
		var urlver = (type===parser.URL_PZPRV3 ? 3 : 1);
		
		if(urlver===3){ this.encodeIce();}
		else          { this.encodeIce_old1();}
		
		if(urlver===3){ this.encodeBorderArrow();}
		else          { this.encodeBorderArrow_old1();}
		
		this.encodeInOut();
	},

	decodeIce_old1 : function(){
		var bstr = this.outbstr, bd = this.owner.board;

		var c=0, twi=[8,4,2,1];
		for(var i=0;i<bstr.length;i++){
			var num = parseInt(bstr.charAt(i),32);
			for(var w=0;w<4;w++){
				if(c<bd.cellmax){
					bd.cell[c].ques = (num&twi[w]?6:0);
					c++;
				}
			}
			if(c>=bd.cellmax){ break;}
		}
		this.outbstr = bstr.substr(i+1);
	},
	encodeIce_old1 : function(){
		var cm = "", num=0, pass=0, bd = this.owner.board, twi=[8,4,2,1];
		for(var c=0;c<bd.cellmax;c++){
			if(bd.cell[c].ques===6){ pass+=twi[num];} num++;
			if(num===4){ cm += pass.toString(16); num=0; pass=0;}
		}
		if(num>0){ cm += pass.toString(16);}

		this.outbstr += cm;
	},

	decodeBorderArrow : function(){
		var bstr = this.outbstr, bd = this.owner.board;

		bd.disableInfo();
		var id=0, a=0;
		for(var i=a;i<bstr.length;i++){
			var ca = bstr.charAt(i);
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
		for(var i=a;i<bstr.length;i++){
			var ca = bstr.charAt(i);
			if(ca!=='z'){
				id += parseInt(ca,36);
				if(id<bd.bdinside){
					var border = bd.border[id];
					border.setArrow(border.isHorz()?border.DN:border.RT);
				}
				id++;
			}
			else{ id+=35;}
			if(id>=bd.bdinside){ a=i+1; break;}
		}
		bd.enableInfo();

		this.outbstr = bstr.substr(a);
	},
	encodeBorderArrow : function(){
		var cm = "", num=0, bd=this.owner.board;
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

		this.outbstr += cm;
	},
	decodeBorderArrow_old2 : function(){
		var bstr = this.outbstr, bd = this.owner.board;

		bd.disableInfo();
		var id=0, a=0;
		for(var i=a;i<bstr.length;i++){
			var ca = bstr.charAt(i);
			if     (ca>='0' && ca<='9'){ var num=parseInt(ca), border=bd.border[id]; border.setArrow((!(num&1)?border.LT:border.RT)); id+=((num>>1)+1);}
			else if(ca>='a' && ca<='z'){ var num=parseInt(ca,36); id+=(num-9);}
			else{ id++;}
			if(id>=(bd.qcols-1)*bd.qrows){ a=i+1; break;}
		}
		id=(bd.qcols-1)*bd.qrows;
		for(var i=a;i<bstr.length;i++){
			var ca = bstr.charAt(i);
			if     (ca>='0' && ca<='9'){ var num=parseInt(ca), border=bd.border[id]; border.setArrow((!(num&1)?border.UP:border.DN)); id+=((num>>1)+1);}
			else if(ca>='a' && ca<='z'){ var num=parseInt(ca,36); id+=(num-9);}
			else{ id++;}
			if(id>=bd.bdinside){ a=i+1; break;}
		}
		bd.enableInfo();

		this.outbstr = bstr.substr(a);
	},
	decodeBorderArrow_old1 : function(){
		var bstr, barray = this.outbstr.substr(1).split("/"), bd = this.owner.board;

		bd.disableInfo();
		if(!!(bstr = barray.shift())){
			var array = bstr.split("+");
			for(var i=0;i<array.length;i++){ var border=bd.cell[array[i]].adjborder.bottom; border.setArrow(border.UP);}
		}
		if(!!(bstr = barray.shift())){
			var array = bstr.split("+");
			for(var i=0;i<array.length;i++){ var border=bd.cell[array[i]].adjborder.bottom; border.setArrow(border.DN);}
		}
		if(!!(bstr = barray.shift())){
			var array = bstr.split("+");
			for(var i=0;i<array.length;i++){ var border=bd.cell[array[i]].adjborder.right; border.setArrow(border.LT);}
		}
		if(!!(bstr = barray.shift())){
			var array = bstr.split("+");
			for(var i=0;i<array.length;i++){ var border=bd.cell[array[i]].adjborder.right; border.setArrow(border.RT);}
		}
		bd.enableInfo();
		
		this.outbstr = "/"+barray.join("/");
	},
	encodeBorderArrow_old1 : function(){
		var cm = "", bd = this.owner.board;

		cm += ("/" + bd.cell.filter(function(cell){ var border=cell.adjborder.bottom; return (border.id<bd.bdinside && border.getArrow()===border.UP);}).join("+"));
		cm += ("/" + bd.cell.filter(function(cell){ var border=cell.adjborder.bottom; return (border.id<bd.bdinside && border.getArrow()===border.DN);}).join("+"));
		cm += ("/" + bd.cell.filter(function(cell){ var border=cell.adjborder.right;  return (border.id<bd.bdinside && border.getArrow()===border.LT);}).join("+"));
		cm += ("/" + bd.cell.filter(function(cell){ var border=cell.adjborder.right;  return (border.id<bd.bdinside && border.getArrow()===border.RT);}).join("+"));

		this.outbstr += cm;
	}
},
"Encode@icelom,icelom2":{
	decodePzpr : function(type){
		this.decodeIce();
		this.decodeNumber16();
		this.decodeInOut();

		if(this.owner.pid==='icelom'){
			this.owner.pid = (this.checkpflag("a")?'icelom':'icelom2');
		}
	},
	encodePzpr : function(type){
		this.encodeIce();
		this.encodeNumber16();
		this.encodeInOut();

		if(this.owner.pid==='icelom'){ this.outpflag="a";}
	}
},
Encode:{
	decodeInOut : function(){
		var barray = this.outbstr.split("/"), bd = this.owner.board;

		bd.arrowin.seturlid (parseInt(barray[1]));
		bd.arrowout.seturlid(parseInt(barray[2]));

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
		this.decodeBorderArrow();
		this.decodeBorderLine();
	},
	encodeData : function(){
		var bd = this.owner.board;
		this.datastr += (bd.arrowin.getid()+"\n"+bd.arrowout.getid()+"\n");
		this.encodeCell( function(obj){
			return (obj.ques===6?"1 ":"0 ");
		});
		this.encodeBorderArrow();
		this.encodeBorderLine();
	},

	decodeBorderArrow : function(){
		var bd = this.owner.board;
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
	},
	encodeBorderArrow : function(){
		this.encodeBorder( function(obj){
			var dir = obj.getArrow();
			if     (dir===obj.UP||dir===obj.LT){ return "1 ";}
			else if(dir===obj.DN||dir===obj.RT){ return "2 ";}
			else                               { return "0 ";}
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
		this.decodeBorderLine();
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
		this.encodeBorderLine();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){
		var pid = this.owner.pid;

		if( !this.checkBranchLine() ){ return 'lnBranch';}

		if( !this.checkCrossOutOfIce() ){ return 'lnCrossExIce';}
		if( !this.checkIceLines() ){ return 'lnCurveOnIce';}

		if( !this.checkValidStart() ){ return 'stInvalid';}
		if( !this.checkLineOnStart() ){ return 'stNotLine';}

		var info = this.owner.board.getTraceInfo();
		if( !this.checkDeadendRoad(info) ){ return 'stDeadEnd';}
		if( !this.checkKeepInside(info) ){ return 'stOffField';}
		if( pid==='icebarn' && !this.checkAlongArrow(info) ){ return 'awInverse';}
		if( pid!=='icebarn' && !this.checkNumberOrder(info) ){ return 'nmOrder';}

		if( !this.checkOneLoop() ){ return 'lnPlLoop';}

		if( (pid==='icelom') && !this.checkUnreachedUnshadeCell() ){ return 'ceEmpty';}

		if( (pid!=='icelom') && !this.checkIgnoreIcebarn() ){ return 'bkNoLine';}

		if( (pid==='icebarn') && !this.checkAllArrow() ){ return 'lnExArrow';}

		if( (pid!=='icebarn') && !this.checkNoLineNumber() ){ return 'nmUnpass';}

		if( !this.checkDeadendLine() ){ return 'lnDeadEnd';}

		return null;
	},

	checkCrossOutOfIce : function(){
		return this.checkAllCell(function(cell){ return (cell.lcnt===4 && !cell.ice());});
	},
	checkUnreachedUnshadeCell : function(){
		return this.checkAllCell(function(cell){ return (cell.lcnt===0 && !cell.ice());});
	},
	checkIgnoreIcebarn : function(){
		return this.checkLinesInArea(this.owner.board.iceinfo.getAreaInfo(), function(w,h,a,n){ return (a!==0);});
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

	checkValidStart : function(){
		var bd = this.owner.board, border = bd.arrowin.getb();
		return (border.by!==bd.minby || border.by!==bd.maxby || border.bx!==bd.minbx || border.bx!==bd.maxbx);
	},
	checkLineOnStart : function(){
		var border = this.owner.board.arrowin.getb();
		if(!border.isLine()){ border.seterr(4); return false;}
		return true;
	},
	checkDeadendRoad : function(info){ return this.checkTrace(info, function(info){ return info.lastborder.isLine();});},
	checkAlongArrow  : function(info){ return this.checkTrace(info, function(info){ return (info.lastborder.getArrow()===info.dir);});},
	checkKeepInside : function(info){
		return this.checkTrace(info, function(info){
			var border = info.lastborder, bd = border.owner.board;
			return (border.id<bd.bdinside || border.id===bd.arrowout.getid());
		});
	},
	checkNumberOrder : function(info){
		return this.checkTrace(info, function(info){
			var cell = info.lastcell;
			if(cell.qnum<0 || cell.qnum===info.count){ return true;}
			cell.seterr(1);
			return false;
		});
	},
	checkTrace : function(info, evalfunc){
		if(!evalfunc(info)){
			this.owner.board.border.seterr(-1);
			info.blist.seterr(1);
			return false;
		}
		return true;
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
	ceEmpty : ["通過していない白マスがあります。","The line doesn't pass all of the non-icy cell."]
}
});
