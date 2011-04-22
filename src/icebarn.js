//
// パズル固有スクリプト部 アイスバーン版 icebarn.js v3.4.0
//
pzprv3.custom.icebarn = {
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
		if(k.playmode && this.btn.Left && this.notInputted()){
			this.inputpeke();
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
				if(this.inputData===null){ this.inputData=((bd.getArrow(id)!==dir)?1:0);}
				bd.setArrow(id, ((this.inputData===1)?dir:0));
			}
			else{
				if(this.inputData===null){ this.inputarrow_inout(id,dir);}
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
		if     ((bx===bd.minbx && dir===bd.RT)||(bx===bd.maxbx && dir===bd.LT)||
				(by===bd.minby && dir===bd.DN)||(by===bd.maxby && dir===bd.UP)){ return 1;}
		else if((bx===bd.minbx && dir===bd.LT)||(bx===bd.maxbx && dir===bd.RT)||
				(by===bd.minby && dir===bd.UP)||(by===bd.maxby && dir===bd.DN)){ return 2;}
		return 0;
	}
},

//---------------------------------------------------------
// 盤面管理系
Board:{
	qcols : 8,
	qrows : 8,

	isborder : 2,

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
			um.addOpe(this.OTHER, 'in', 0, this.arrowin, id);
			this.arrowin = id;
			if     (this.border[id].by===this.maxby){ this.setArrow(id,this.UP);}
			else if(this.border[id].by===this.minby){ this.setArrow(id,this.DN);}
			else if(this.border[id].bx===this.maxbx){ this.setArrow(id,this.LT);}
			else if(this.border[id].bx===this.minbx){ this.setArrow(id,this.RT);}
		}
	},
	setarrowout : function(id){
		if(!isNaN(id)){
			um.addOpe(this.OTHER, 'out', 0, this.arrowout, id);
			this.arrowout = id;
			if     (this.border[id].by===this.minby){ this.setArrow(id,this.UP);}
			else if(this.border[id].by===this.maxby){ this.setArrow(id,this.DN);}
			else if(this.border[id].bx===this.minbx){ this.setArrow(id,this.LT);}
			else if(this.border[id].bx===this.maxbx){ this.setArrow(id,this.RT);}
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

		this.group = bd.OTHER;
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

LineManager:{
	isCenterLine : true,
	isLineCross  : true
},

AreaManager:{
	getIcebarnArea : function(){
		return this.searchEXT(function(c){ return (bd.QuC(c)==6);}, null);
	}
},

MenuExec:{
	adjustBoardData : function(key,d){
		this.adjustBorderArrow(key,d);

		bd.arrowin  = this.adjustBoardObject(key,d,bd.BORDER,bd.arrowin);
		bd.arrowout = this.adjustBoardObject(key,d,bd.BORDER,bd.arrowout);
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
	bdmargin       : 1.00,
	bdmargin_image : 1.00,

	irowake : 1,

	setColors : function(){
		this.gridcolor = this.gridcolor_LIGHT;
		this.linecolor = this.linecolor_LIGHT;
		this.errcolor1 = "red";
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

		this.drawBorderArrows();

		this.drawChassis();

		this.drawInOut();
	},

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
			if(bd.isArrow(idlist[i])){
				this.drawBorderArrow1(idlist[i],true);
			}
		}
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		if     (type==0){ this.decodeIcebarn();}
		else if(type==1){
			if(this.checkpflag("c")){ this.decodeIcebarn_old2();}
			else                    { this.decodeIcebarn_old1();}
		}
	},
	pzlexport : function(type){
		if     (type==0){ return this.encodeIcebarn();}
		else if(type==1){ return this.encodeIcebarn_old1();}
	},

	decodeIcebarn : function(){
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

		bd.disableInfo();
		var id=0;
		for(var i=a;i<barray[0].length;i++){
			var ca = barray[0].charAt(i);
			if(ca!=='z'){
				id += parseInt(ca,36);
				if(id<bd.bdinside){ bd.setArrow(id,(!!(bd.border[id].bx&1)?bd.UP:bd.LT));}
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
				if(id<bd.bdinside){ bd.setArrow(id,(!!(bd.border[id].bx&1)?bd.DN:bd.RT));}
				id++;
			}
			else{ id+=35;}
			if(id>=bd.bdinside){ break;}
		}

		bd.inputarrowin (parseInt(barray[1])+bd.bdinside);
		bd.inputarrowout(parseInt(barray[2])+bd.bdinside);
		bd.enableInfo();

		this.outbstr = "";
	},
	encodeIcebarn : function(){
		var cm = "", num=0, pass=0, twi=[16,8,4,2,1];
		for(var c=0;c<bd.cellmax;c++){
			if(bd.cell[c].ques===6){ pass+=twi[num];} num++;
			if(num==5){ cm += pass.toString(32); num=0; pass=0;}
		}
		if(num>0){ cm += pass.toString(32);}

		num=0;
		for(var id=0;id<bd.bdinside;id++){
			var dir = bd.getArrow(id);
			if(dir===bd.UP||dir===bd.LT){ cm+=num.toString(36); num=0;}
			else{
				num++;
				if(num>=35){ cm+="z"; num=0;}
			}
		}
		if(num>0){ cm+=num.toString(36);}

		num=0;
		for(var id=0;id<bd.bdinside;id++){
			var dir = bd.getArrow(id);
			if(dir===bd.DN||dir===bd.RT){ cm+=num.toString(36); num=0;}
			else{
				num++;
				if(num>=35){ cm+="z"; num=0;}
			}
		}
		if(num>0){ cm+=num.toString(36);}

		cm += ("/"+(bd.arrowin-bd.bdinside)+"/"+(bd.arrowout-bd.bdinside));

		this.outbstr += cm;
	},

	decodeIcebarn_old2 : function(){
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

		bd.disableInfo();
		var id=0;
		for(var i=a;i<barray[2].length;i++){
			var ca = barray[2].charAt(i);
			if     (ca>='0' && ca<='9'){ var num=parseInt(ca); bd.setArrow(id, ((num&1)?bd.UP:bd.DN)); id+=((num>>1)+1);}
			else if(ca>='a' && ca<='z'){ var num=parseInt(ca,36); id+=(num-9);}
			else{ id++;}
			if(id>=(bd.qcols-1)*bd.qrows){ a=i+1; break;}
		}
		id=(bd.qcols-1)*bd.qrows;
		for(var i=a;i<barray[2].length;i++){
			var ca = barray[2].charAt(i);
			if     (ca>='0' && ca<='9'){ var num=parseInt(ca); bd.setArrow(id, ((num&1)?bd.LT:bd.RT)); id+=((num>>1)+1);}
			else if(ca>='a' && ca<='z'){ var num=parseInt(ca,36); id+=(num-9);}
			else{ id++;}
			if(id>=bd.bdinside){ break;}
		}

		bd.inputarrowin (parseInt(barray[0])+bd.bdinside);
		bd.inputarrowout(parseInt(barray[1])+bd.bdinside);
		bd.enableInfo();

		this.outbstr = "";
	},
	decodeIcebarn_old1 : function(){
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

		bd.disableInfo();
		if(barray[1]!=""){
			var array = barray[1].split("+");
			for(var i=0;i<array.length;i++){ bd.setArrow(bd.db(array[i]),bd.UP);}
		}
		if(barray[2]!=""){
			var array = barray[2].split("+");
			for(var i=0;i<array.length;i++){ bd.setArrow(bd.db(array[i]),bd.DN);}
		}
		if(barray[3]!=""){
			var array = barray[3].split("+");
			for(var i=0;i<array.length;i++){ bd.setArrow(bd.rb(array[i]),bd.LT);}
		}
		if(barray[4]!=""){
			var array = barray[4].split("+");
			for(var i=0;i<array.length;i++){ bd.setArrow(bd.rb(array[i]),bd.RT);}
		}

		bd.inputarrowin (parseInt(barray[5])+bd.bdinside);
		bd.inputarrowout(parseInt(barray[6])+bd.bdinside);
		bd.enableInfo();

		this.outbstr = "";
	},
	encodeIcebarn_old1 : function(){
		var cm = "", num=0, pass=0, twi=[8,4,2,1];
		for(var c=0;c<bd.cellmax;c++){
			if(bd.cell[c].ques===6){ pass+=twi[num];} num++;
			if(num===4){ cm += pass.toString(16); num=0; pass=0;}
		}
		if(num>0){ cm += pass.toString(16);}
		cm += "/";

		var array = [];
		for(var c=0;c<bd.cellmax;c++){ if(bd.cell[c].by<bd.maxby && bd.getArrow(bd.db(c))===bd.UP){ array.push(c);} }
		cm += (array.join("+") + "/");
		array = [];
		for(var c=0;c<bd.cellmax;c++){ if(bd.cell[c].by<bd.maxby && bd.getArrow(bd.db(c))===bd.DN){ array.push(c);} }
		cm += (array.join("+") + "/");
		array = [];
		for(var c=0;c<bd.cellmax;c++){ if(bd.cell[c].bx<bd.maxbx && bd.getArrow(bd.rb(c))===bd.LT){ array.push(c);} }
		cm += (array.join("+") + "/");
		array = [];
		for(var c=0;c<bd.cellmax;c++){ if(bd.cell[c].bx<bd.maxbx && bd.getArrow(bd.rb(c))===bd.RT){ array.push(c);} }
		cm += (array.join("+") + "/");

		cm += ((bd.arrowin-bd.bdinside)+"/"+(bd.arrowout-bd.bdinside));

		this.outbstr += cm;
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		bd.disableInfo();
		bd.inputarrowin (parseInt(this.readLine()));
		bd.inputarrowout(parseInt(this.readLine()));
		bd.enableInfo();

		this.decodeCell( function(obj,ca){
			if(ca==="1"){ obj.ques = 6;}
		});
		bd.disableInfo();
		this.decodeBorder( function(obj,ca){
			if(ca!=="0"){
				var id = bd.bnum(obj.bx, obj.by), val = parseInt(ca);
				if(val===1&&!!(obj.bx&1)){ bd.setArrow(id,bd.UP);}
				if(val===2&&!!(obj.bx&1)){ bd.setArrow(id,bd.DN);}
				if(val===1&& !(obj.bx&1)){ bd.setArrow(id,bd.LT);}
				if(val===2&& !(obj.bx&1)){ bd.setArrow(id,bd.RT);}
			}
		});
		bd.enableInfo();
		this.decodeBorder( function(obj,ca){
			if     (ca==="1" ){ obj.line = 1;}
			else if(ca==="-1"){ obj.qsub = 2;}
		});
	},
	encodeData : function(){
		this.datastr += (bd.arrowin+"/"+bd.arrowout+"/");
		this.encodeCell( function(obj){
			return (obj.ques===6?"1 ":"0 ");
		});
		this.encodeBorder( function(obj){
			var id = bd.bnum(obj.bx, obj.by), dir = bd.getArrow(id);
			if     (dir===bd.UP||dir===bd.LT){ return "1 ";}
			else if(dir===bd.DN||dir===bd.RT){ return "2 ";}
			else                             { return "0 ";}
		});
		this.encodeBorder( function(obj){
			if     (obj.line===1){ return "1 ";}
			else if(obj.qsub===2){ return "-1 ";}
			else                 { return "0 ";}
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
			this.setAlert('矢印を逆に通っています。', 'A line goes through an arrow reverse.'); return false;
		}

		if( !this.checkOneLoop() ){
			this.setAlert('線がひとつながりではありません。', 'Lines are not countinuous.'); return false;
		}

		if( !this.checkLinesInArea(bd.areas.getIcebarnArea(), function(w,h,a,n){ return (a!=0);}) ){
			this.setAlert('すべてのアイスバーンを通っていません。', 'A icebarn is not gone through.'); return false;
		}

		if( !this.checkAllArrow() ){
			this.setAlert('線が通っていない矢印があります。', 'A line doesn\'t go through some arrows.'); return false;
		}

		if( !this.checkLcntCell(1) ){
			this.setAlert('途中で途切れている線があります。', 'There is a dead-end line.'); return false;
		}

		return true;
	},

	checkAllArrow : function(){
		var result = true;
		for(var id=0;id<bd.bdmax;id++){
			if(bd.isArrow(id) && !bd.isLine(id)){
				if(this.inAutoCheck){ return false;}
				bd.sErB([id],3);
				result = false;
			}
		}
		return result;
	},

	checkLine : function(){
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
					if     (bd.lines.lcntCell(cc)!=2){ dir=dir;}
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
				if(dir===[0,2,1,4,3][bd.getArrow(id)]){ return 4;}
			}
		}

		bd.sErBAll(0);

		return 0;
	},
}
};
