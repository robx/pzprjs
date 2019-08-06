//
// パズル固有スクリプト部 天体ショー版 tentaisho.js
//
(function(pidlist, classbase){
	if(typeof module==='object' && module.exports){module.exports = [pidlist, classbase];}
	else{ pzpr.classmgr.makeCustom(pidlist, classbase);}
}(
['tentaisho'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputModes:{edit:['circle-unshade','circle-shade','bgpaint'],play:['border','subline']},
	mouseinput : function(){ // オーバーライド
		if(this.puzzle.editmode && this.inputMode!=='auto'){
			if(this.mousestart){ this.inputstar();}
		}
		else{
			this.common.mouseinput.call(this);
		}
	},
	mouseinput_other : function(){
		if(this.inputMode==='bgpaint'){ this.inputBGcolor1();}
	},
	mouseinput_auto : function(){
		if(this.puzzle.playmode){
			if(this.mousestart || this.mousemove){
				if(this.btn==='left' && this.isBorderMode()){ this.inputborder_tentaisho();}
				else{ this.inputQsubLine();}
			}
			else if(this.mouseend && this.notInputted()){ this.inputBGcolor3();}
		}
		else if(this.puzzle.editmode){
			if(this.mousestart && this.btn==='left'){
				this.inputstar();
			}
			else if((this.mousestart || this.mousemove) && this.btn==='right'){
				this.inputBGcolor1();
			}
		}
	},

	inputBGcolor1 : function(){
		var cell = this.getcell();
		if(cell.isnull || cell===this.mouseCell){ return;}
		if(this.inputData===null){ this.inputData=(cell.qsub===0)?3:0;}
		cell.setQsub(this.inputData);
		this.mouseCell = cell;
		cell.draw();
	},
	inputBGcolor3 : function(){
		if(!this.puzzle.playeronly && this.puzzle.getConfig('discolor')){ return;}

		var pos = this.getpos(0.34);
		var star = pos.gets();
		if(star===null || star.getStar()===0){ return;}

		var cell = star.validcell();
		if(cell!==null){
			var clist = cell.room.clist;
			if(clist.encolor()){ clist.draw();}
		}
	},
	inputborder_tentaisho : function(){
		var pos = this.getpos(0.34);
		if(this.prevPos.equals(pos)){ return;}

		var border = this.prevPos.getborderobj(pos);
		if(!border.isnull){
			if(this.inputData===null){ this.inputData=(border.qans===0?1:0);}
			border.setQans(this.inputData);
			border.draw();
		}
		this.prevPos = pos;
	},
	inputstar : function(){
		var pos = this.getpos(0.25);
		if(this.prevPos.equals(pos)){ return;}

		var star = pos.gets();
		if(star!==null){
			if   (this.inputMode==='circle-unshade'){ star.setStar(star.getStar()!==1?1:0);}
			else if(this.inputMode==='circle-shade'){ star.setStar(star.getStar()!==2?2:0);}
			else if(this.btn==='left') { star.setStar({0:1,1:2,2:0}[star.getStar()]);}
			else if(this.btn==='right'){ star.setStar({0:2,1:0,2:1}[star.getStar()]);}
			else { this.prevPos = pos; return;}
			star.draw();
		}
		this.prevPos = pos;
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,
	moveTarget : function(ca){ return this.moveTBorder(ca); },

	keyinput : function(ca){
		this.key_inputstar(ca);
	},
	key_inputstar : function(ca){
		var star = this.cursor.gets();
		if(star!==null){
			if     (ca==='1'){ star.setStar(1);}
			else if(ca==='2'){ star.setStar(2);}
			else if(ca===' '||ca==='-'||ca==='0'||ca==='3'){ star.setStar(0);}
			else { return;}
			star.draw();
		}
	}
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	qnum : 0,
	minnum : 0,

	disInputHatena : true
},
Cross:{
	qnum : 0,
	minnum : 0
},
Border:{
	qnum : 0,
	minnum : 0
},

Star:{
	bx : null,
	by : null,

	isnull : true,
	id : null,

	piece : null,

	getStar : function(){
		return this.piece.qnum;
	},
	setStar : function(val){
		this.puzzle.opemgr.disCombine = true;
		this.piece.setQnum(val);
		this.puzzle.opemgr.disCombine = false;
		this.puzzle.board.roommgr.setExtraData(this.validcell().room);
	},
	iserror : function(){
		return (this.piece.error>0);
	},

	// 星に線が通っていないなら、近くのセルを返す
	validcell : function(){
		var piece = this.piece, cell = null;
		if(piece.group==='cell')
			{ cell = piece;}
		else if(piece.group==='cross' && piece.lcnt===0)
			{ cell = piece.relcell(-1,-1);}
		else if(piece.group==='border' && piece.qans===0)
			{ cell = piece.sidecell[0];}
		return cell;
	},

	draw : function(){
		this.puzzle.painter.paintRange(this.bx-1, this.by-1, this.bx+1, this.by+1);
	},
	getaddr : function(){
		return (new this.klass.Address(this.bx, this.by));
	}
},
Address:{
	gets : function(){ return this.board.gets(this.bx, this.by);}
},
TargetCursor:{
	gets : function(){ return this.board.gets(this.bx, this.by);}
},
CellList:{
	encolor : function(){
		var star = this.getAreaStarInfo().star;
		var flag = false, ret = (star!==null ? star.getStar() : 0);
		for(var i=0;i<this.length;i++){
			var cell = this[i];
			if(!this.puzzle.playeronly && cell.qsub===3 && ret!==2){ continue;}
			else if(cell.qsub!==(ret>0?ret:0)){
				cell.setQsub(ret>0?ret:0);
				flag = true;
			}
		}
		return flag;
	},
	getAreaStarInfo : function(){
		var ret = {star:null, err:-1};
		for(var i=0;i<this.length;i++){
			var cell=this[i];
			var slist = this.board.starinside(cell.bx,cell.by,cell.bx+1,cell.by+1);
			for(var n=0;n<slist.length;n++){
				var star=slist[n];
				if(star.getStar()>0 && star.validcell()!==null){
					if(ret.err===0){ return {star:null, err:-2};}
					ret = {star:star, err:0};
				}
			}
		}
		return ret;
	},
	// 一部qsubで消したくないものがあるため上書き
	subclear : function(){
		var isrec = true;
		var props = [], norec = {};
		if(this.length>0){
			props = this[0].getproplist(['sub','info']);
			norec = this[0].propnorec;
		}
		for(var i=0;i<this.length;i++){
			var piece = this[i];
			for(var j=0;j<props.length;j++){
				var pp = props[j], def = piece.constructor.prototype[pp];
				if(piece[pp]!==def && !(pp==='qsub' && piece.qsub===3)){
					if(isrec && !norec[pp]){ piece.addOpe(pp, piece[pp], def);}
					piece[pp] = def;
				}
			}
		}
	}
},

Board:{
	hascross  : 1,
	hasborder : 1,

	createExtraObject : function(){
		this.star = []; /* インスタンス化 */
	},
	initExtraObject : function(col,row){
		this.initStar(this.cols,this.rows);
	},

	// 星アクセス用関数
	starmax : 0,
	star : [],
	initStar : function(col,row){
		this.starmax = (2*col-1)*(2*row-1);
		this.star = [];
		for(var id=0;id<this.starmax;id++){
			this.star[id] = new this.klass.Star();
			var star = this.star[id];
			star.id = id;
			star.isnull = false;

			star.bx = id%(2*col-1)+1;
			star.by = ((id/(2*col-1))|0)+1;
			star.piece = star.getaddr().getobj();
		}
	},
	gets : function(bx,by){
		var id = null, qc=this.cols, qr=this.rows;
		if((bx<=0||bx>=(qc<<1)||by<=0||by>=(qr<<1))){ }
		else{ id = (bx-1)+(by-1)*(2*qc-1);}

		return (id!==null ? this.star[id] : null);
	},
	starinside : function(x1,y1,x2,y2){
		var slist = new this.klass.PieceList();
		for(var by=y1;by<=y2;by++){ for(var bx=x1;bx<=x2;bx++){
			var star = this.gets(bx,by);
			if(!!star){ slist.add(star);}
		}}
		return slist;
	},

	// 色をつける系関数
	encolorall : function(){
		var rooms = this.board.roommgr.components;
		for(var id=0;id<rooms.length;id++){ rooms[id].clist.encolor();}
		this.puzzle.redraw();
	}
},
BoardExec:{
	adjustBoardData2 : function(key,d){
		var bd = this.board;
		bd.initStar(bd.cols, bd.rows);
	}
},

AreaRoomGraph:{
	enabled : true,

	setExtraData : function(component){
		component.clist = new this.klass.CellList(component.getnodeobjs());
		var ret = component.clist.getAreaStarInfo();
		component.star  = ret.star;
		component.error = ret.err;
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	gridcolor_type : "LIGHT",

	bgcellcolor_func : "qsub3",
	qsubcolor1 : "rgb(176,255,176)",
	qsubcolor2 : "rgb(108,108,108)",

	qanscolor : "rgb(72, 72, 72)",

	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();

		this.drawQansBorders();
		this.drawBorderQsubs();

		this.drawStars();

		this.drawChassis();

		this.drawTarget_tentaisho();
	},

	drawStars : function(){
		var g = this.vinc('star', 'auto', true);

		g.lineWidth = Math.max(this.cw*0.04, 1);
		var d = this.range;
		var slist = this.board.starinside(d.x1,d.y1,d.x2,d.y2);
		for(var i=0;i<slist.length;i++){
			var star = slist[i], bx=star.bx, by=star.by;

			g.vid = "s_star1_"+star.id;
			if(star.getStar()===1){
				g.strokeStyle = (star.iserror() ? this.errcolor1 : this.quescolor);
				g.fillStyle   = "white";
				g.shapeCircle(bx*this.bw, by*this.bh, this.cw*0.16);
			}
			else{ g.vhide();}

			g.vid = "s_star2_"+star.id;
			if(star.getStar()===2){
				g.fillStyle = (star.iserror() ? this.errcolor1 : this.quescolor);
				g.fillCircle(bx*this.bw, by*this.bh, this.cw*0.18);
			}
			else{ g.vhide();}
		}
	},

	drawTarget_tentaisho : function(){
		this.drawCursor(false,this.puzzle.editmode);
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodeStar();
	},
	encodePzpr : function(type){
		this.encodeStar();
	},

	decodeKanpen : function(){
		this.fio.decodeStarFile();
	},
	encodeKanpen : function(){
		this.fio.encodeStarFile();
	},

	decodeStar : function(bstr){
		var bd = this.board;
		bd.disableInfo();
		var s=0, bstr = this.outbstr;
		for(var i=0;i<bstr.length;i++){
			var star = bd.star[s], ca = bstr.charAt(i);
			if(this.include(ca,"0","f")){
				var val = parseInt(ca,16);
				star.setStar(val%2+1);
				s+=((val>>1)+1);
			}
			else if(this.include(ca,"g","z")){ s+=(parseInt(ca,36)-15);}

			if(s>=bd.starmax){ break;}
		}
		bd.enableInfo();
		this.outbstr = bstr.substr(i+1);
	},
	encodeStar : function(){
		var count = 0, cm = "", bd = this.board;
		for(var s=0;s<bd.starmax;s++){
			var pstr = "", star = bd.star[s];
			if(star.getStar()>0){
				for(var i=1;i<=7;i++){
					var star2 = bd.star[s+i];
					if(!!star2 && star2.getStar()>0){
						pstr=""+(2*(i-1)+(star.getStar()-1)).toString(16);
						s+=(i-1); break;
					}
				}
				if(pstr===""){ pstr=(13+star.getStar()).toString(16); s+=7;}
			}
			else{ count++;}

			if(count===0){ cm += pstr;}
			else if(pstr || count===20){ cm += ((count+15).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm += ((count+15).toString(36));}

		this.outbstr += cm;
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeStarFile();
		this.decodeBorderAns();
		this.decodeCellQsub();
	},
	encodeData : function(){
		this.encodeStarFile();
		this.encodeBorderAns();
		this.encodeCellQsub();
	},

	kanpenOpen : function(){
		this.decodeStarFile();
		this.decodeAnsAreaRoom();
	},
	kanpenSave : function(){
		this.encodeStarFile();
		this.encodeAnsAreaRoom();
	},

	decodeStarFile : function(){
		var  bd = this.board, s=0, data = '';
		for(var i=0,rows=2*bd.rows-1;i<rows;i++){
			var line = this.readLine();
			if(line){
				data += line.match(/[12\.]+/)[0];
			}
		}
		bd.disableInfo();
		for(var s=0;s<data.length;++s){
			var star = bd.star[s], ca = data.charAt(s);
			if     (ca==="1"){ star.setStar(1);}
			else if(ca==="2"){ star.setStar(2);}
		}
		bd.enableInfo();
	},
	encodeStarFile : function(){
		var bd = this.board, s=0;
		for(var by=1;by<=2*bd.rows-1;by++){
			var data = '';
			for(var bx=1;bx<=2*bd.cols-1;bx++){
				var star = bd.star[s];
				if     (star.getStar()===1){ data += "1";}
				else if(star.getStar()===2){ data += "2";}
				else                       { data += ".";}
				s++;
			}
			this.writeLine(data);
		}
	},
	decodeAnsAreaRoom : function(){
		this.decodeAreaRoom_com(false);
	},
	encodeAnsAreaRoom : function(){
		this.encodeAreaRoom_com(false);
	},

	kanpenOpenXML : function(){
		this.decodeStar_XMLBoard();
		this.decodeAnsAreaRoom_XMLAnswer();
	},
	kanpenSaveXML : function(){
		this.encodeStar_XMLBoard();
		this.encodeAnsAreaRoom_XMLAnswer();
	},
	decodeStar_XMLBoard : function(){
		var nodes = this.xmldoc.querySelectorAll('board number');
		for(var i=0;i<nodes.length;i++){
			var node = nodes[i];
			var star = this.board.gets(+node.getAttribute('c'), +node.getAttribute('r'));
			if(star!==null){ star.setStar(+node.getAttribute('n'));}
		}
	},
	encodeStar_XMLBoard : function(){
		var boardnode = this.xmldoc.querySelector('board');
		var bd = this.board;
		for(var s=0;s<bd.starmax;s++){
			var star = bd.star[s], val = star.getStar();
			if(val>0){
				boardnode.appendChild(this.createXMLNode('number',{r:star.by,c:star.bx,n:val}));
			}
		}
	},
	decodeAnsAreaRoom_XMLAnswer : function(){
		var rdata = [];
		this.decodeCellXMLArow(function(cell, name){
			if(name==='u'){ rdata.push(-1);}
			else{ rdata.push(+name.substr(1));}
		});
		this.rdata2Border(false, rdata);
		this.board.roommgr.rebuild();
	},
	encodeAnsAreaRoom_XMLAnswer : function(){
		var bd = this.board;
		bd.roommgr.rebuild();
		var rooms = bd.roommgr.components;
		this.xmldoc.querySelector('answer').appendChild(this.createXMLNode('areas',{N:rooms.length}));
		this.encodeCellXMLArow(function(cell){
			var roomid = rooms.indexOf(cell.room);
			return (roomid>=0 ? 'n'+roomid : 'u');
		});
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checklist : [
		"checkStarOnLine",
		"checkAvoidStar",
		"checkFractal",
		"checkStarRegion"
	],

	checkStarOnLine : function(){
		var bd = this.board;
		for(var s=0;s<bd.starmax;s++){
			var star = bd.star[s];
			if(star.getStar()<=0 || star.validcell()!==null){ continue;}

			this.failcode.add("bdPassStar");
			if(this.checkOnly){ break;}
			switch(star.piece.group){
				case "cross":  star.piece.setCrossBorderError(); break;
				case "border": star.piece.seterr(1);             break;
			}
		}
	},

	checkFractal : function(){
		var rooms = this.board.roommgr.components;
		allloop:
		for(var r=0;r<rooms.length;r++){
			var clist = rooms[r].clist;
			var star = rooms[r].star;
			if(star===null){ continue;}
			for(var i=0;i<clist.length;i++){
				var cell = clist[i];
				var cell2 = this.board.getc(star.bx*2-cell.bx, star.by*2-cell.by);
				if(!cell2.isnull && cell.room===cell2.room){ continue;}

				this.failcode.add("bkNotSymSt");
				if(this.checkOnly){ break allloop;}
				clist.seterr(1);
			}
		}
	},

	checkAvoidStar  : function(){ this.checkErrorFlag(-1, "bkNoStar");},
	checkStarRegion : function(){ this.checkErrorFlag(-2, "bkPlStar");},
	checkErrorFlag : function(val, code){
		var rooms = this.board.roommgr.components;
		for(var r=0;r<rooms.length;r++){
			if(rooms[r].error!==val){ continue;}

			this.failcode.add(code);
			if(this.checkOnly){ break;}
			rooms[r].clist.seterr(1);
		}
	}
},

FailCode:{
	bkNoStar   : ["星が含まれていない領域があります。","A block has no stars."],
	bdPassStar : ["星を線が通過しています。", "A line goes over the star."],
	bkNotSymSt : ["領域が星を中心に点対称になっていません。", "An area is not point symmetric about the star."],
	bkPlStar   : ["星が複数含まれる領域があります。","A block has two or more stars."]
}
}));
