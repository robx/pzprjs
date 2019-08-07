//
// パズル固有スクリプト部 エルート・さしがね版 loute.js
//
(function(pidlist, classbase){
	if(typeof module==='object' && module.exports){module.exports = [pidlist, classbase];}
	else{ pzpr.classmgr.makeCustom(pidlist, classbase);}
}(
['loute','sashigane'], {
//---------------------------------------------------------
// マウス入力系
"MouseEvent@loute":{
	inputModes:{edit:['arrow','circle-unshade','undef','clear'],play:['border','subline']}
},
"MouseEvent@sashigane":{
	inputModes:{edit:['arrow','number','undef','clear'],play:['border','subline']},
	mouseinput_number : function(){
		if(this.mousestart){ this.inputqnum_loute();}
	}
},
MouseEvent:{
	mouseinput : function(){ // オーバーライド
		if(this.inputMode==='undef' || this.inputMode==='circle-unshade'){
			if(this.mousestart){ this.inputqnum_loute();}
		}
		else{ this.common.mouseinput.call(this);}
	},
	mouseinput_auto : function(){
		if(this.puzzle.playmode){
			if(this.mousestart || this.mousemove){
				if(this.btn==='left' && this.isBorderMode()){ this.inputborder();}
				else{ this.inputQsubLine();}
			}
		}
		else if(this.puzzle.editmode){
			if(this.mousestart || this.mousemove){ this.inputarrow_cell();}
			else if(this.mouseend && this.notInputted()){ this.inputqnum_loute();}
		}
	},

	inputarrow_cell_main : function(cell, dir){
		cell.setQdir(cell.qdir!==dir?dir:0);
		cell.setQnum(-1);
	},

	inputqnum_loute : function(){
		var cell = this.getcell();
		if(cell.isnull){ return;}

		if(cell!==this.cursor.getc() && this.inputMode==='auto'){
			this.setcursor(cell);
		}
		else{
			this.inputcell_loute(cell);
		}
	},
	inputcell_loute : function(cell){
		var dir = cell.qdir, num = cell.qnum, val;
		// -4to-1:Arrow 0:? 1:何もなし 2:丸のみ 3以上:数字
		if     (dir=== 5){ val = (num!==-1 ? num : 2);}
		else if(dir=== 0){ val = 1;}
		else if(dir===-2){ val = 0;}
		else             { val = dir - 5;}

		var min = -4, max = cell.getmaxnum();
		if(this.pid==='loute'){ max = 2;}
		if(this.inputMode==='circle-unshade' || this.inputMode.match(/number/)){ min = 1;}
		if(this.inputMode==='undef'){ max = 1; min = 0;}

		if(this.btn==='left'){
			if(min<=val && val<max){ val++;  }
			else                   { val=min;}
		}
		else if(this.btn==='right'){
			if(min<val && val<=max){ val--;  }
			else                   { val=max;}
		}

		if     (val >=2){ cell.setQdir(5);     cell.setNum(val>=3 ? val : -1);}
		else if(val===1){ cell.setQdir(0);     cell.setNum(-1);}
		else if(val===0){ cell.setQdir(-2);    cell.setNum(-1);}
		else            { cell.setQdir(val+5); cell.setNum(-1);}
		cell.draw();
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,
	moveTarget : function(ca){
		if(ca.match(/shift/)){ return false;}
		return this.moveTCell(ca);
	},

	keyinput : function(ca){
		if(this.key_inputarrow(ca)){ return;}

		if(this.pid==='loute'){
			this.key_arrow_loute(ca);
		}
		else if(this.pid==='sashigane'){
			this.key_inputqnum_sashigane(ca);
		}
	},

	key_arrow_loute : function(ca){
		if     (ca==='1')          { ca='1';}
		else if(ca==='2')          { ca='4';}
		else if(ca==='3')          { ca='2';}
		else if(ca==='4')          { ca='3';}
		else if(ca==='5'||ca==='q'){ ca='q';}
		else if(ca==='6'||ca===' '){ ca=' ';}

		var cell = this.cursor.getc(), val=-1;

		if('1'<=ca && ca<='4'){ val = +ca; val = (cell.qdir!==val?val:0);}
		else if(ca==='-') { val = (cell.qdir!==-2?-2:0);}
		else if(ca==='q') { val = (cell.qdir!==5?5:0);}
		else if(ca===' '||ca==='BS'){ val = 0;}
		else if(ca==='s1'){ val = -2;}
		else{ return;}

		cell.setQdir(val);
		this.prev = cell;
		cell.draw();
	},

	key_inputqnum_sashigane : function(ca){
		var cell = this.cursor.getc();
		if(ca==='q'){
			cell.setQdir((cell.qdir!==5)?5:0);
			cell.setQnum(-1);
		}
		else if(ca==='-'){
			cell.setQdir((cell.qdir!==-2||cell.qnum!==-1)?-2:0);
			cell.setQnum(-1);
		}
		else if(ca==='BS' && cell.qdir===5){
			if(cell.qnum!==-1){
				this.key_inputqnum_main(cell,ca);
				if(cell.qnum===-2){
					cell.setQnum(-1);
				}
			}
			else{
				cell.setQdir(0);
				cell.setQnum(-2);
			}
		}
		else if(ca===' ' || ca==='BS'){
			cell.setQdir(0);
			cell.setQnum(-1);
		}
		else{
			this.key_inputqnum_main(cell,ca);
			if(cell.isNum() && cell.qdir!==5){ cell.setQdir(5);}
		}

		this.prev = cell;
		cell.draw();
	}
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	maxnum : function(){
		var bd=this.board, bx=this.bx, by=this.by;
		var col = (((bx<(bd.maxbx>>1))?(bd.maxbx-bx+2):bx+2)>>1);
		var row = (((by<(bd.maxby>>1))?(bd.maxby-by+2):by+2)>>1);
		return (col+row-1);
	},
	minnum : 3,

	place : 0, // setLblockInfoでの設定用
	getObjNum : function(){ return this.qdir;},
	isCircle : function(){ return this.qdir===5;}
},

Board:{
	cols : 8,
	rows : 8,

	hasborder : 1
},
BoardExec:{
	adjustBoardData : function(key,d){
		this.adjustNumberArrow(key,d);
	}
},

AreaRoomGraph:{
	enabled : true,

	// オーバーライド
	resetExtraData : function(cell){
		cell.place = 0;
	},
	setExtraData : function(component){
		component.clist = new this.klass.CellList(component.getnodeobjs());
		component.shape = 0;

		var clist = component.clist, d = clist.getRectSize(), bd = this.board;

		/* 四角形のうち別エリアとなっている部分を調べる */
		/* 幅が1なので座標自体は調べなくてよいはず      */
		var subclist = this.board.cellinside(d.x1,d.y1,d.x2,d.y2).filter(function(cell){ return (cell.room!==component);});
		var dl = subclist.getRectSize();
		if( subclist.length===0 || (dl.cols*dl.rows!==dl.cnt) || ((d.cols-1)!==dl.cols) || ((d.rows-1)!==dl.rows) ){
			component.shape = 0;
			for(var i=0;i<clist.length;i++){ clist[i].place = 0;}
		}
		else{
			component.shape = 1; /* 幅が1のL字型 */
			for(var i=0;i<clist.length;i++){ clist[i].place = 1;} /* L字型ブロックのセル */

			/* 端のセル */
			var isUL = (d.x1===dl.x1&&d.y1===dl.y1), isUR = (d.x2===dl.x2&&d.y1===dl.y1),
				isDL = (d.x1===dl.x1&&d.y2===dl.y2), isDR = (d.x2===dl.x2&&d.y2===dl.y2);
			if     (isUL||isDR){ bd.getc(d.x1,d.y2).place = 2; bd.getc(d.x2,d.y1).place = 2;}
			else if(isDL||isUR){ bd.getc(d.x1,d.y1).place = 2; bd.getc(d.x2,d.y2).place = 2;}

			/* 角のセル */
			if     (isUL){ bd.getc(d.x2,d.y2).place = 3;}
			else if(isDL){ bd.getc(d.x2,d.y1).place = 3;}
			else if(isUR){ bd.getc(d.x1,d.y2).place = 3;}
			else if(isDR){ bd.getc(d.x1,d.y1).place = 3;}
		}
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	gridcolor_type : "DLIGHT",

	bordercolor_func : "qans",
	numbercolor_func : "qnum",

	circleratio : [0.40, 0.40],		/* 線幅を1pxにする */

	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();
		this.drawBorders();

		this.drawCellArrows();
		this.drawHatenas_loute();
		if(this.pid==='sashigane'){  this.drawCircledNumbers();}
		else if(this.pid==='loute'){ this.drawCircles();}

		this.drawBorderQsubs();

		this.drawChassis();

		this.drawTarget();
	},

	getCircleStrokeColor : function(cell){
		if(cell.isCircle()){ return this.quescolor;}
		return null;
	},
	circlefillcolor_func : "null",

	drawHatenas_loute : function(){
		var g = this.vinc('cell_hatena', 'auto');
		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i];
			g.vid = "cell_text_h_"+cell.id;
			if(cell.qdir===-2){
				g.fillStyle = (cell.error===1 ? this.errcolor1 : this.quescolor);
				this.disptext("?", cell.bx*this.bw, cell.by*this.bh);
			}
			else{ g.vhide();}
		}
	}
},
"Grahpic@sashigane":{
	hideHatena : true
},

//---------------------------------------------------------
// URLエンコード/デコード処理
"Encode@loute":{
	decodePzpr : function(type){
		this.decodeLoute();
	},
	encodePzpr : function(type){
		this.encodeLoute();
	},

	decodeLoute : function(){
		var c=0, i=0, bstr = this.outbstr, bd = this.board;
		for(i=0;i<bstr.length;i++){
			var cell = bd.cell[c], ca = bstr.charAt(i);

			if(this.include(ca,"0","9")||this.include(ca,"a","f"))
							   { cell.qdir = parseInt(ca,16);}
			else if(ca === '.'){ cell.qdir = -2;}
			else if(ca >= 'g' && ca <= 'z'){ c += (parseInt(ca,36)-16);}

			c++;
			if(c >= bd.cell.length){ break;}
		}
		this.outbstr = bstr.substr(i);
	},
	encodeLoute : function(){
		var count=0, cm="", bd = this.board;
		for(var c=0;c<bd.cell.length;c++){
			var pstr = "", dir = bd.cell[c].qdir;

			if     (dir===-2){ pstr = ".";}
			else if(dir!== 0){ pstr = dir.toString(16);}
			else{ count++;}

			if(count===0){ cm += pstr;}
			else if(pstr || count===20){ cm+=((15+count).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm+=(15+count).toString(36);}

		this.outbstr += cm;
	}
},
"Encode@sashigane":{
	decodePzpr : function(type){
		this.decodeSashigane();
	},
	encodePzpr : function(type){
		this.encodeSashigane();
	},

	decodeSashigane : function(){
		var c=0, i=0, bstr = this.outbstr, bd = this.board;
		for(i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i), cell=bd.cell[c];

			if(this.include(ca,"0","9")||this.include(ca,"a","f"))
							   { cell.qdir = 5; cell.qnum = parseInt(ca,16);}
			else if(ca === '-'){ cell.qdir = 5; cell.qnum = parseInt(bstr.substr(i+1,2),16); i+=2;}
			else if(ca === '.'){ cell.qdir = 5;}
			else if(ca === '%'){ cell.qdir = -2;}
			else if(ca>='g' && ca<='j'){ cell.qdir = (parseInt(ca,20)-15);}
			else if(ca>='k' && ca<='z'){ c+=(parseInt(ca,36)-20);}

			c++;
			if(!bd.cell[c]){ break;}
		}
		this.outbstr = bstr.substr(i+1);
	},
	encodeSashigane : function(){
		var cm = "", count = 0, bd = this.board;
		for(var c=0;c<bd.cell.length;c++){
			var pstr="", dir=bd.cell[c].qdir, qn=bd.cell[c].qnum;
			if(dir===5){
				if     (qn>= 0&&qn<  16){ pstr=    qn.toString(16);}
				else if(qn>=16&&qn< 256){ pstr="-"+qn.toString(16);}
				else                    { pstr=".";}
			}
			else if(dir===-2){ pstr="%";}
			else if(dir!==0) { pstr=(dir+15).toString(20);}
			else{ count++;}

			if     (count=== 0){ cm += pstr;}
			else if(pstr || count===16){ cm += ((count+19).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm += (count+19).toString(36);}

		this.outbstr += cm;
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCell( function(cell,ca){
			if(ca.charAt(0)==="o"){
				cell.qdir = 5;
				if(ca.length>1){ cell.qnum = +ca.substr(1);}
			}
			else if(ca==="-"){ cell.qdir = -2;}
			else if(ca!=="."){ cell.qdir = +ca;}
		});

		this.decodeBorderAns();
	},
	encodeData : function(){
		var pid = this.pid;
		this.encodeCell( function(cell){
			if(pid==='sashigane' && cell.qdir===5){
				return "o"+(cell.qnum!==-1?cell.qnum:'')+" ";
			}
			else if(cell.qdir===-2){ return "- ";}
			else if(cell.qdir!== 0){ return cell.qdir+" ";}
			else{ return ". ";}
		});

		this.encodeBorderAns();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checklist : [
		"checkArrowCorner1",
		"checkArrowCorner2",
		"checkCircleCorner",
		"checkNumberAndSize+@sashigane",
		"checkBorderDeadend",
		"checkLblock"
	],

	checkArrowCorner1 : function(){
		var rooms = this.board.roommgr.components;
		allloop:
		for(var id=0;id<rooms.length;id++){
			if(rooms[id].shape===0){ continue;}

			var clist = rooms[id].clist;
			for(var i=0;i<clist.length;i++){
				var cell = clist[i], num = cell.getObjNum();
				if(num<1 || num>4 || cell.place===2){ continue;}

				this.failcode.add("arBlkEdge");
				if(this.checkOnly){ break allloop;}
				clist.seterr(1);
				break;
			}
		}
	},

	checkArrowCorner2 : function(){
		var rooms = this.board.roommgr.components;
		allloop:
		for(var id=0;id<rooms.length;id++){
			if(rooms[id].shape===0){ continue;}

			var clist = rooms[id].clist;
			for(var i=0;i<clist.length;i++){
				var cell = clist[i], adb = cell.adjborder, num = cell.getObjNum();
				if(num<1 || num>4 ||
				  !((num===cell.UP && adb.top.isBorder()   ) ||
					(num===cell.DN && adb.bottom.isBorder()) ||
					(num===cell.LT && adb.left.isBorder()  ) ||
					(num===cell.RT && adb.right.isBorder() ) ) ){ continue;}

				this.failcode.add("arNotPtCnr");
				if(this.checkOnly){ break allloop;}
				clist.seterr(1);
				break;
			}
		}
	},

	checkCircleCorner : function(){
		var rooms = this.board.roommgr.components;
		allloop:
		for(var id=0;id<rooms.length;id++){
			if(rooms[id].shape===0){ continue;}

			var clist = rooms[id].clist;
			for(var i=0;i<clist.length;i++){
				var cell = clist[i];
				if(!cell.isCircle() || cell.place===3){ continue;}

				this.failcode.add("ciNotOnCnr");
				if(this.checkOnly){ break allloop;}
				clist.seterr(1);
				break;
			}
		}
	},

	checkLblock : function(){
		var rooms = this.board.roommgr.components;
		for(var id=0;id<rooms.length;id++){
			if(rooms[id].shape!==0){ continue;}

			this.failcode.add("bkNotLshape");
			if(this.checkOnly){ break;}
			rooms[id].clist.seterr(1);
		}
	}
},

FailCode:{
	bkNotLshape : ["ブロックが幅1のL字型になっていません。","A block is not L-shape or whose width is not one."],
	arBlkEdge  : ["矢印がブロックの端にありません。","An arrow is not at the edge of the block."],
	arNotPtCnr : ["矢印の先にブロックの角がありません。","An arrow doesn't indicate the corner of a block."],
	ciNotOnCnr : ["白丸がブロックの角にありません。","A circle is out of the corner."]
}
}));
