//
// パズル固有スクリプト部 アイスローム・アイスローム２版 icelom.js v3.4.0
//
pzprv3.custom.icelom = {
//---------------------------------------------------------
// フラグ
Flags:{
	setting : function(pid){
		this.qcols = 8;
		this.qrows = 8;

		this.irowake  = 1;
		this.isborder = 2;

		this.isLineCross     = true;
		this.isCenterLine    = true;
		this.isDispHatena    = true;
		this.isInputHatena   = true;

		this.bdmargin       = 1.00;
		this.bdmargin_image = 1.00;

		this.floatbgcolor = "rgb(0, 0, 127)";
	}
},

//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mousedown : function(){
		if(kc.isZ ^ pp.getVal('dispred')){ this.dispRedLine();}
		else if(k.editmode){
			if     (this.btn.Left) { this.inputarrow();}
			else if(this.btn.Right){ this.inputIcebarn();}
		}
		else if(k.playmode){
			if     (this.btn.Left) { this.inputLine();}
			else if(this.btn.Right){ this.inputpeke();}
		}
	},
	mouseup : function(){
		if(this.notInputted()){
			if(k.editmode){ this.inputqnum();}
			else if(k.playmode && this.btn.Left){ this.inputpeke();}
		}
	},
	mousemove : function(){
		if(k.editmode){
			if     (this.btn.Left) { this.inputarrow();}
			else if(this.btn.Right){ this.inputIcebarn();}
		}
		else if(k.playmode){
			if     (this.btn.Left) { this.inputLine();}
			else if(this.btn.Right){ this.inputpeke();}
		}
	},

	inputIcebarn : function(){
		var cc = this.cellid();
		if(cc===null || cc===this.mouseCell){ return;}
		if(bd.isNum(cc)){ this.inputqnum(); return;}

		if(this.inputData===null){ this.inputData = (bd.QuC(cc)==6?0:6);}

		bd.sQuC(cc, this.inputData);
		pc.paintCellAround(cc);
		this.mouseCell = cc;
	},
	inputarrow : function(){
		var pos = this.borderpos(0);
		if(this.prevPos.equals(pos)){ return;}

		var id = this.getnb(this.prevPos, pos);
		if(id!==null && !this.ismousedown){
			var dir = this.getdir(this.prevPos, pos);

			if(id<bd.bdinside){
			}
			else{
				this.inputarrow_inout(id,dir);
			}
			pc.paintBorder(id);
		}
		this.prevPos = pos;
	},
	inputarrow_inout : function(id,dir){
		val = this.checkinout(id,dir), old_id=null;
		if     (val===1){ old_id = bd.arrowin;  bd.inputarrowin(id);}
		else if(val===2){ old_id = bd.arrowout; bd.inputarrowout(id);}
		if(old_id!==null){
			pc.paintBorder(old_id);
			this.mousereset();
		}
	},
	/* 0:どちらでもない 1:IN 2:OUT */
	checkinout : function(id,dir){
		if(bd.border[id]===(void 0)){ return 0;}
		var bx=bd.border[id].bx, by=bd.border[id].by;
		if     ((bx===bd.minbx && dir===k.RT)||(bx===bd.maxbx && dir===k.LT)||
				(by===bd.minby && dir===k.DN)||(by===bd.maxby && dir===k.UP)){ return 1;}
		else if((bx===bd.minbx && dir===k.LT)||(bx===bd.maxbx && dir===k.RT)||
				(by===bd.minby && dir===k.UP)||(by===bd.maxby && dir===k.DN)){ return 2;}
		return 0;
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	keyinput : function(ca){
		if(k.playmode){ return;}
		if(this.moveTCell(ca)){ return;}
		if(this.key_inputIcebarn(ca)){ return;}
		this.key_inputqnum(ca);
	},
	key_inputIcebarn : function(ca){
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
	}
},

//---------------------------------------------------------
// 盤面管理系
Board:{
	arrowin  : 0,
	arrowout : 1,

	initBoardSize : function(col,row){
		this.SuperFunc.initBoardSize.call(this,col,row);

		this.disableInfo();
		if(col>=3){
			this.inputarrowin (this.bnum(this.minbx+1, this.minby));
			this.inputarrowout(this.bnum(this.minbx+5, this.minby));
		}
		else{
			this.inputarrowin (this.bnum(1, this.minby));
			this.inputarrowout(this.bnum(1, this.maxby));
		}
		this.enableInfo();
	},

	getArrow : function(id){ return this.DiB(id); },
	setArrow : function(id,val){ if(id!==null && !!this.border[id]){ this.sDiB(id,val);}},
	isArrow  : function(id){ return (this.DiB(id)>0);},

	inputarrowin : function(id){
		var old_in=this.arrowin, old_out=this.arrowout;
		if(old_out==id){ this.setarrowout(old_in);}
		else{ this.setArrow(old_in, 0);}
		this.setarrowin(id);
	},
	inputarrowout : function(id){
		var old_in=this.arrowin, old_out=this.arrowout;
		if(old_in==id){ this.setarrowin(old_out);}
		else{ this.setArrow(old_out, 0);}
		this.setarrowout(id);
	},

	setarrowin : function(id){
		if(!isNaN(id)){
			um.addOpe(k.OTHER, 'in', 0, this.arrowin, id);
			this.arrowin = id;
			if     (this.border[id].by===this.maxby){ this.setArrow(id,k.UP);}
			else if(this.border[id].by===this.minby){ this.setArrow(id,k.DN);}
			else if(this.border[id].bx===this.maxbx){ this.setArrow(id,k.LT);}
			else if(this.border[id].bx===this.minbx){ this.setArrow(id,k.RT);}
		}
	},
	setarrowout : function(id){
		if(!isNaN(id)){
			um.addOpe(k.OTHER, 'out', 0, this.arrowout, id);
			this.arrowout = id;
			if     (this.border[id].by===this.minby){ this.setArrow(id,k.UP);}
			else if(this.border[id].by===this.maxby){ this.setArrow(id,k.DN);}
			else if(this.border[id].bx===this.minbx){ this.setArrow(id,k.LT);}
			else if(this.border[id].bx===this.maxbx){ this.setArrow(id,k.RT);}
		}
	}
},

Operation:{
	exec : function(num){
		if(this.SuperFunc.exec.call(this,num)){ return;}

		var id0 = bd.startid;
		if     (this.property==='in') { bd.arrowin  = num;}
		else if(this.property==='out'){ bd.arrowout = num;}
		um.stackBorder(id0);
		um.stackBorder(num);
	},
	decode : function(strs){
		if(this.SuperFunc.decode.call(this,strs)){ return;}

		this.group = k.OTHER;
		this.property = (strs[0]=='PI'?'in':'out');
		this.old = bd.bnum(strs[1], strs[2]);
		this.num = bd.bnum(strs[3], strs[4]);
	},
	toString : function(){
		var str = this.SuperFunc.toString.call(this);
		if(!!str){ return str;}

		var prefix = (this.property=='in'?'PI':'PO');
		var obj1=bd.border[this.old], obj2=bd.border[this.num];
		var bx1=(!!obj1 ? obj1.bx : -1), by1=(!!obj1 ? obj1.by : -1);
		var bx2=(!!obj2 ? obj2.bx : -1), by2=(!!obj2 ? obj2.by : -1);
		return [prefix, bx1, by1, bx2, by2].join(',');
	}
},

MenuExec:{
	adjustBoardData : function(key,d){
		this.adjustBorderArrow(key,d);

		bd.arrowin  = this.adjustBoardObject(key,d,k.BORDER,bd.arrowin);
		bd.arrowout = this.adjustBoardObject(key,d,k.BORDER,bd.arrowout);
	}
},

Menu:{
	menufix : function(){
		this.addRedLineToFlags();
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
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
		this.vinc('border_arrow', 'crispEdges');

		var idlist = this.range.borders;
		for(var i=0;i<idlist.length;i++){ this.drawBorderArrow1(idlist[i]);}
	},
	drawBorderArrow1 : function(id){
		var headers = ["b_ar_","b_tipa_","b_tipb_"]; /* 1つのidでは2方向しかとれないはず */

		var ll = this.cw*0.35;				//LineLength
		var lw = Math.max(this.cw/36, 1);	//LineWidth
		var lm = lw/2;						//LineMargin
		var px=bd.border[id].px, py=bd.border[id].py, dir=bd.getArrow(id);

		this.vhide([headers[0]+id, headers[1]+id, headers[2]+id]);
		if(dir>=1 && dir<=4){
			g.fillStyle = (bd.border[id].error===3 ? this.errcolor1 : this.cellcolor);
			if(this.vnop(headers[0]+id,this.FILL)){
				switch(dir){
					case k.UP: case k.DN: g.fillRect(px-lm, py-ll, lw, ll*2); break;
					case k.LT: case k.RT: g.fillRect(px-ll, py-lm, ll*2, lw); break;
				}
			}

			if(this.vnop(headers[((dir+1)&1)+1]+id,this.FILL)){
				switch(dir){
					case k.UP: g.setOffsetLinePath(px,py ,0,-ll ,-ll/2,-ll*0.4 ,ll/2,-ll*0.4, true); break;
					case k.DN: g.setOffsetLinePath(px,py ,0,+ll ,-ll/2, ll*0.4 ,ll/2, ll*0.4, true); break;
					case k.LT: g.setOffsetLinePath(px,py ,-ll,0 ,-ll*0.4,-ll/2 ,-ll*0.4,ll/2, true); break;
					case k.RT: g.setOffsetLinePath(px,py , ll,0 , ll*0.4,-ll/2 , ll*0.4,ll/2, true); break;
				}
				g.fill();
			}
		}
	},
	drawInOut : function(){
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
	},

	repaintParts : function(idlist){
		for(var i=0;i<idlist.length;i++){
			if(idlist[i]===bd.arrowin || idlist[i]===bd.arrowout){
				this.drawBorderArrow1(idlist[i],true);
			}
		}
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		this.decodeIcelom();
		this.decodeNumber16();
		this.decodeInOut();

		if(k.puzzleid==='icelom'){
			k.puzzleid = (this.checkpflag("a")?'icelom':'icelom2');
			menu.displayDesign();
		}
	},
	pzlexport : function(type){
		this.encodeIcelom();
		this.encodeNumber16();
		this.encodeInOut();

		if(k.puzzleid==='icelom'){ this.outpflag="a";}
	},

	decodeIcelom : function(){
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
		bd.inputarrowin (parseInt(barray[0])+bd.bdinside);
		bd.inputarrowout(parseInt(barray[1])+bd.bdinside);
		bd.enableInfo();

		this.outbstr = "";
	},
	encodeInOut : function(){
		this.outbstr += ("/"+(bd.arrowin-bd.bdinside)+"/"+(bd.arrowout-bd.bdinside));
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		bd.inputarrowin (parseInt(this.readLine()));
		bd.inputarrowout(parseInt(this.readLine()));

		var pzltype = this.readLine();
		if(k.puzzleid==='icelom'){
			k.puzzleid = (pzltype==="allwhite"?'icelom':'icelom2');
			menu.displayDesign();
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
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.checkLcntCell(3) ){
			this.setAlert('分岐している線があります。','There is a branch line.'); return false;
		}

		if( !this.checkAllCell(function(c){ return (bd.lines.lcntCell(c)===4 && bd.QuC(c)!==6);}) ){
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

		if( (k.puzzleid==='icelom') && !this.checkAllCell(function(c){ return (bd.lines.lcntCell(c)===0 && bd.QuC(c)!==6);}) ){
			this.setAlert('通過していない白マスがあります。', 'The line doesn\'t pass all of the white cell.'); return false;
		}

		if( (k.puzzleid==='icelom2') && !this.checkIcebarns() ){
			this.setAlert('すべてのアイスバーンを通っていません。', 'A icebarn is not gone through.'); return false;
		}

		if( !this.checkAllCell(function(c){ return (bd.lines.lcntCell(c)===0 && bd.isNum(c));}) ){
			this.setAlert('通過していない数字があります。', 'The line doesn\'t pass all of the number.'); return false;
		}

		return true;
	},

	checkIcebarns : function(){
		var iarea = new pzprv3.core.AreaInfo();
		for(var cc=0;cc<bd.cellmax;cc++){ iarea.id[cc]=(bd.QuC(cc)==6?0:null); }
		for(var cc=0;cc<bd.cellmax;cc++){
			if(iarea.id[cc]!==0){ continue;}
			iarea.max++;
			iarea[iarea.max] = {clist:[]};
			bd.areas.sc0(cc,iarea);

			iarea.room[iarea.max] = {idlist:iarea[iarea.max].clist};
		}

		return this.checkLinesInArea(iarea, function(w,h,a,n){ return (a!=0);});
	},

	checkLine : function(){
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
					if     (bd.lines.lcntCell(cc)!=2){ dir=dir;}
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
	}
}
};
