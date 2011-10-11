//
// パズル固有スクリプト部 アイスローム・アイスローム２版 icelom.js v3.4.0
//
pzprv3.custom.icelom = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputedit : function(){
		if(this.mousestart || this.mousemove){
			if     (this.btn.Left) { this.inputborder();}
			else if(this.btn.Right){ this.inputIcebarn();}
		}
		else if(this.mouseend && this.notInputted()){
			this.inputqnum();
		}
	},
	inputplay : function(){
		if(this.mousestart || this.mousemove){
			if     (this.btn.Left) { this.inputLine();}
			else if(this.btn.Right){ this.inputpeke();}
		}
		else if(this.mouseend && this.notInputted()){
			if(this.btn.Left){ this.inputpeke();}
		}
	},
	inputRed : function(){ this.dispRedLine();},

	inputIcebarn : function(){
		var cell = this.getcell();
		if(cell.isnull || cell===this.mouseCell){ return;}
		if(cell.isNum()){ this.inputqnum(); return;}

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

			if(border.id<bd.bdinside){
			}
			else{
				this.inputarrow_inout(border,dir);
			}
			border.draw();
		}
		this.prevPos = pos;
	},
	inputarrow_inout : function(border,dir){
		var val = this.checkinout(border,dir), border0=null;
		if     (val===1){ border0 = bd.arrowin;  bd.inputarrowin(border);}
		else if(val===2){ border0 = bd.arrowout; bd.inputarrowout(border);}
		if(border0!==null){
			border0.draw();
			this.mousereset();
		}
	},
	/* 0:どちらでもない 1:IN 2:OUT */
	checkinout : function(border,dir){
		if(border.isnull){ return 0;}
		var bx=border.bx, by=border.by;
		if     ((bx===bd.minbx && dir===bd.RT)||(bx===bd.maxbx && dir===bd.LT)||
				(by===bd.minby && dir===bd.DN)||(by===bd.maxby && dir===bd.UP)){ return 1;}
		else if((bx===bd.minbx && dir===bd.LT)||(bx===bd.maxbx && dir===bd.RT)||
				(by===bd.minby && dir===bd.UP)||(by===bd.maxby && dir===bd.DN)){ return 2;}
		return 0;
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,

	keyinput : function(ca){
		if(this.key_inputIcebarn(ca)){ return;}
		this.key_inputqnum(ca);
	},
	key_inputIcebarn : function(ca){
		var cell = this.cursor.getTCC();

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
	getArrow : function(){ return this.qdir; },
	setArrow : function(val){ this.setQdir(val);},
	isArrow  : function(){ return (this.qdir>0);}
},

Board:{
	qcols : 8,
	qrows : 8,

	isborder : 2,

	arrowin  : null,
	arrowout : null,

	initBoardSize : function(col,row){
		this.SuperFunc.initBoardSize.call(this,col,row);

		this.arrowin  = this.border[0];
		this.arrowout = this.border[1];

		this.disableInfo();
		if(col>=3){
			this.inputarrowin (this.getb(this.minbx+1, this.minby));
			this.inputarrowout(this.getb(this.minbx+5, this.minby));
		}
		else{
			this.inputarrowin (this.getb(1, this.minby));
			this.inputarrowout(this.getb(1, this.maxby));
		}
		this.enableInfo();
	},

	inputarrowin : function(border){
		var old_in=this.arrowin, old_out=this.arrowout;
		if(old_out===border){ this.setarrowout(old_in);}else{ old_in.setArrow(0);}
		this.setarrowin(border);
	},
	inputarrowout : function(border){
		var old_in=this.arrowin, old_out=this.arrowout;
		if(old_in===border){ this.setarrowin(old_out);}else{ old_out.setArrow(0);}
		this.setarrowout(border);
	},

	setarrowin : function(border){
		if(this.owner.undo.isenableRecord()){
			this.owner.undo.addOpe_InOut('in', this.arrowin.bx,this.arrowin.by, border.bx,border.by);
		}
		this.arrowin = border;

		this.setarrowin_arrow(border);
	},
	setarrowin_arrow : function(border){
		if     (border.by===this.maxby){ border.setArrow(this.UP);}
		else if(border.by===this.minby){ border.setArrow(this.DN);}
		else if(border.bx===this.maxbx){ border.setArrow(this.LT);}
		else if(border.bx===this.minbx){ border.setArrow(this.RT);}
	},

	setarrowout : function(border){
		if(this.owner.undo.isenableRecord()){
			this.owner.undo.addOpe_InOut('out', this.arrowout.bx,this.arrowout.by, border.bx,border.by);
		}
		this.arrowout = border;

		this.setarrowout_arrow(border);
	},
	setarrowout_arrow : function(border){
		if     (border.by===this.minby){ border.setArrow(this.UP);}
		else if(border.by===this.maxby){ border.setArrow(this.DN);}
		else if(border.bx===this.minbx){ border.setArrow(this.LT);}
		else if(border.bx===this.maxbx){ border.setArrow(this.RT);}
	},

	posinfo_in  : {},
	posinfo_out : {},
	adjustBoardData : function(key,d){
		this.adjustBorderArrow(key,d);

		this.posinfo_in  = this.getAfterPos(key,d,this.arrowin);
		this.posinfo_out = this.getAfterPos(key,d,this.arrowout);
	},
	adjustBoardData2 : function(key,d){
		var info1 = this.posinfo_in, info2 = this.posinfo_out;
		this.arrowin  = this.getb(info1.bx2, info1.by2);
		this.arrowout = this.getb(info2.bx2, info2.by2);

		var um = this.owner.undo;
		if((key & this.REDUCE) && !um.undoExec && !um.redoExec){
			um.forceRecord = true;
			if(info1.isdel){
				um.addOpe_InOut('in', info1.bx1,info1.by1, info1.bx2,info1.by2);
				this.setarrowin_arrow (this.arrowin);
			}
			if(info2.isdel){
				um.addOpe_InOut('out', info2.bx1,info2.by1, info2.bx2,info2.by2);
				this.setarrowout_arrow(this.arrowout);
			}
			um.forceRecord = false;
		}
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
	decode : function(str){
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
		var border0, border = bd.getb(bx,by);
		if     (this.property==='in') { border0 = bd.arrowin;  bd.arrowin  = border;}
		else if(this.property==='out'){ border0 = bd.arrowout; bd.arrowout = border;}
		border0.draw();
		border.draw();
	}
},

OperationManager:{
	addOpe_InOut : function(property, x1, y1, x2, y2){
		// 操作を登録する
		this.addOpe_common(function(){
			var ope = this.owner.newInstance('InOutOperation');
			ope.setData(property, x1, y1, x2, y2);
			return ope;
		});
	},
	decodeOpe : function(strs){
		var ope = this.owner.newInstance('InOutOperation');
		if(ope.decode(strs)){ return ope;}

		return this.SuperFunc.decodeOpe.call(this, strs);
	}
},

LineManager:{
	isCenterLine : true,
	isLineCross  : true
},

"AreaIcebarnData:AreaData":{
	isvalid : function(cell){ return cell.ice();}
},

Menu:{
	menufix : function(){
		this.addRedLineToFlags();
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	bdmargin       : 1.00,
	bdmargin_image : 1.00,

	irowake : 1,

	setColors : function(){
		this.gridcolor = this.gridcolor_LIGHT;
		this.linecolor = this.linecolor_LIGHT;
		this.errcolor1 = "red";
		this.fontBCellcolor = this.fontcolor;
		this.setBGCellColorFunc('icebarn');
		this.setBorderColorFunc('ice');

		this.maxYdeg = 0.70;
	},
	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();

		this.drawBorders();

		this.drawLines();
		this.drawPekes(1);

		this.drawNumbers();

		this.drawBorderArrows();

		this.drawChassis();

		this.drawTarget();

		this.drawInOut();
	},

	// IN/OUTの矢印用に必要ですね。。
	drawBorderArrows : function(){
		var g = this.vinc('border_arrow', 'crispEdges');

		var ll = this.cw*0.35;				//LineLength
		var lw = Math.max(this.cw/36, 1);	//LineWidth
		var lm = lw/2;						//LineMargin

		var headers = ["b_ar_","b_tipa_","b_tipb_"]; /* 1つのidでは2方向しかとれないはず */
		var blist = this.range.borders;
		for(var i=0;i<blist.length;i++){
			var border = blist[i], id = border.id, dir=border.getArrow();

			this.vhide([headers[0]+id, headers[1]+id, headers[2]+id]);
			if(dir>=1 && dir<=4){
				var px = border.bx*this.bw, py = border.by*this.bh;

				g.fillStyle = (border.error===4 ? this.errcolor1 : this.cellcolor);
				if(this.vnop(headers[0]+id,this.FILL)){
					switch(dir){
						case bd.UP: case bd.DN: g.fillRect(px-lm, py-ll, lw, ll*2); break;
						case bd.LT: case bd.RT: g.fillRect(px-ll, py-lm, ll*2, lw); break;
					}
				}

				if(this.vnop(headers[((dir+1)&1)+1]+id,this.FILL)){
					switch(dir){
						case bd.UP: g.setOffsetLinePath(px,py ,0,-ll ,-ll/2,-ll*0.4 ,ll/2,-ll*0.4, true); break;
						case bd.DN: g.setOffsetLinePath(px,py ,0,+ll ,-ll/2, ll*0.4 ,ll/2, ll*0.4, true); break;
						case bd.LT: g.setOffsetLinePath(px,py ,-ll,0 ,-ll*0.4,-ll/2 ,-ll*0.4,ll/2, true); break;
						case bd.RT: g.setOffsetLinePath(px,py , ll,0 , ll*0.4,-ll/2 , ll*0.4,ll/2, true); break;
					}
					g.fill();
				}
			}
		}
	},
	drawInOut : function(){
		var g = this.currentContext, border;

		border = bd.arrowin;
		if(border.id>=bd.bdinside && border.id<bd.bdmax){
			g.fillStyle = (border.error===4 ? this.errcolor1 : this.cellcolor);
			var bx = border.bx, by = border.by, px = bx*this.bw, py = by*this.bh;
			if     (by===bd.minby){ this.dispnum("string_in", 1, "IN", 0.55, "black", px,             py-0.6*this.ch);}
			else if(by===bd.maxby){ this.dispnum("string_in", 1, "IN", 0.55, "black", px,             py+0.6*this.ch);}
			else if(bx===bd.minbx){ this.dispnum("string_in", 1, "IN", 0.55, "black", px-0.5*this.cw, py-0.3*this.ch);}
			else if(bx===bd.maxbx){ this.dispnum("string_in", 1, "IN", 0.55, "black", px+0.5*this.cw, py-0.3*this.ch);}
		}
		border = bd.arrowout;
		if(border.id>=bd.bdinside && border.id<bd.bdmax){
			g.fillStyle = (border.error===4 ? this.errcolor1 : this.cellcolor);
			var bx = border.bx, by = border.by, px = bx*this.bw, py = by*this.bh;
			if     (by===bd.minby){ this.dispnum("string_out", 1, "OUT", 0.55, "black", px,             py-0.6*this.ch);}
			else if(by===bd.maxby){ this.dispnum("string_out", 1, "OUT", 0.55, "black", px,             py+0.6*this.ch);}
			else if(bx===bd.minbx){ this.dispnum("string_out", 1, "OUT", 0.55, "black", px-0.7*this.cw, py-0.3*this.ch);}
			else if(bx===bd.maxbx){ this.dispnum("string_out", 1, "OUT", 0.55, "black", px+0.7*this.cw, py-0.3*this.ch);}
		}
	},

	repaintParts : function(blist){
		this.range.borders = blist;

		this.drawBorderArrows();
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		this.decodeIcelom();
		this.decodeNumber16();
		this.decodeInOut();

		if(this.owner.pid==='icelom'){
			this.owner.pid = (this.checkpflag("a")?'icelom':'icelom2');
			this.owner.menu.displayDesign();
		}
	},
	pzlexport : function(type){
		this.encodeIcelom();
		this.encodeNumber16();
		this.encodeInOut();

		if(this.owner.pid==='icelom'){ this.outpflag="a";}
	},

	decodeIcelom : function(){
		var bstr = this.outbstr;

		var a=0, c=0, twi=[16,8,4,2,1];
		for(var i=0;i<bstr.length;i++){
			var num = parseInt(bstr.charAt(i),32);
			for(var w=0;w<5;w++){
				if(c<bd.cellmax){
					bd.cell[c].setQues(num&twi[w]?6:0);
					c++;
				}
			}
			if(c>=bd.cellmax){ a=i+1; break;}
		}
		this.outbstr = bstr.substr(a);
	},
	encodeIcelom : function(){
		var cm = "", num=0, pass=0, twi=[16,8,4,2,1];
		for(var c=0;c<bd.cellmax;c++){
			if(bd.cell[c].ques===6){ pass+=twi[num];} num++;
			if(num==5){ cm += pass.toString(32); num=0; pass=0;}
		}
		if(num>0){ cm += pass.toString(32);}

		this.outbstr += cm;
	},

	decodeInOut : function(){
		var barray = this.outbstr.substr(1).split("/");

		bd.disableInfo();
		bd.inputarrowin (bd.border[parseInt(barray[0])+bd.bdinside]);
		bd.inputarrowout(bd.border[parseInt(barray[1])+bd.bdinside]);
		bd.enableInfo();

		this.outbstr = "";
	},
	encodeInOut : function(){
		this.outbstr += ("/"+(bd.arrowin.id-bd.bdinside)+"/"+(bd.arrowout.id-bd.bdinside));
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		bd.inputarrowin (bd.border[parseInt(this.readLine())]);
		bd.inputarrowout(bd.border[parseInt(this.readLine())]);

		var pzltype = this.readLine();
		if(this.owner.pid==='icelom'){
			this.owner.pid = (pzltype==="allwhite"?'icelom':'icelom2');
			this.owner.menu.displayDesign();
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
		var pzltype = (this.owner.pid==='icelom'?"allwhite":"skipwhite");

		this.datastr += (bd.arrowin.id+"/"+bd.arrowout.id+"/"+pzltype+"/");
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

		if( !this.checkLcntCell(3) ){
			this.setAlert('分岐している線があります。','There is a branch line.'); return false;
		}

		if( !this.checkAllCell(function(cell){ return (cell.lcnt()===4 && !cell.ice());}) ){
			this.setAlert('氷の部分以外で線が交差しています。', 'A Line is crossed outside of ice.'); return false;
		}
		if( !this.checkIceLines() ){
			this.setAlert('氷の部分で線が曲がっています。', 'A Line curve on ice.'); return false;
		}

		var flag = this.checkLine();
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

		if( (this.owner.pid==='icelom') && !this.checkAllCell(function(cell){ return (cell.lcnt()===0 && !cell.ice());}) ){
			this.setAlert('通過していない白マスがあります。', 'The line doesn\'t pass all of the white cell.'); return false;
		}

		if( (this.owner.pid==='icelom2') && !this.checkIgnoreIcebarn() ){
			this.setAlert('すべてのアイスバーンを通っていません。', 'A icebarn is not gone through.'); return false;
		}

		if( !this.checkAllCell(function(cell){ return (cell.lcnt()===0 && cell.isNum());}) ){
			this.setAlert('通過していない数字があります。', 'The line doesn\'t pass all of the number.'); return false;
		}

		return true;
	},

	checkIgnoreIcebarn : function(){
		var iarea = this.owner.newInstance('AreaIcebarnData').getAreaInfo();
		return this.checkLinesInArea(iarea, function(w,h,a,n){ return (a!=0);})
	},

	checkLine : function(){
		var pos = bd.arrowin.getaddr(), dir=0, count=1;
		if     (pos.by===bd.minby){ dir=2;}else if(pos.by===bd.maxby){ dir=1;}
		else if(pos.bx===bd.minbx){ dir=4;}else if(pos.bx===bd.maxbx){ dir=3;}
		if(dir==0){ return -1;}
		if(!bd.arrowin.isLine()){ bd.arrowin.seterr(4); return 1;}

		bd.border.seterr(-1);
		bd.arrowin.seterr(1);

		while(1){
			pos.movedir(dir,1);
			if(pos.oncell()){
				var cell = pos.getc();
				if(cell.isnull){ continue;}
				else if(!cell.ice()){
					if     (cell.lcnt()!==2){ dir=dir;}
					else if(dir!=1 && cell.db().isLine()){ dir=2;}
					else if(dir!=2 && cell.ub().isLine()){ dir=1;}
					else if(dir!=3 && cell.rb().isLine()){ dir=4;}
					else if(dir!=4 && cell.lb().isLine()){ dir=3;}
				}

				var num = cell.getNum();
				if(num===-1){ continue;}
				if(num!==-2 && num!==count){ cell.seterr(1); return 4;}
				count++;
			}
			else{
				var border = pos.getb();
				border.seterr(1);
				if(!border.isLine()){ return 2;}
				if(bd.arrowout===border){ break;}
				else if(border.id>=bd.bdinside){ return 3;}
			}
		}

		bd.border.seterr(0);

		return 0;
	}
}
};
