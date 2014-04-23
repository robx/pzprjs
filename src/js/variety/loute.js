//
// パズル固有スクリプト部 エルート・さしがね版 loute.js v3.4.1
//
pzpr.classmgr.makeCustom('loute', {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.owner.playmode){
			if(this.mousestart || this.mousemove){
				if(this.btn.Left && this.isBorderMode()){ this.inputborder();}
				else{ this.inputQsubLine();}
			}
		}
		else if(this.owner.editmode){
			if(this.mousestart || this.mousemove){ this.inputarrow_cell_loute();}
			else if(this.mouseend && this.notInputted()){ this.inputqnum_loute();}
		}
	},

	inputarrow_cell_loute : function(){
		var pos = this.getpos(0);
		if(this.prevPos.equals(pos)){ return;}

		var dir = pos.NDIR, cell = this.prevPos.getc();
		if(!cell.isnull){
			var dir = this.getdir(this.prevPos, pos);
			if(dir!==pos.NDIR){
				cell.setQdir(cell.getQdir()!==dir?dir:0);
				cell.setQnum(-1);
				cell.draw();
				this.mousereset();
				return;
			}
		}
		this.prevPos = pos;
	},

	inputqnum_loute : function(){
		var cell = this.getcell();
		if(cell.isnull){ return;}

		if(cell!==this.cursor.getTCC()){
			this.setcursor(cell);
		}
		else{
			this.inputcell_loute(cell);
		}
	},
	inputcell_loute : function(cell){
		var dir = cell.getQdir();
		if(dir!==5){
			var array = [0,5,1,2,3,4,-2], len = array.length;
			if(this.btn.Left){
				for(var i=0;i<=len-1;i++){
					if(dir===array[i]){
						cell.setQdir(array[((i<len-1)?i+1:0)]);
						break;
					}
				}
			}
			else if(this.btn.Right){
				for(var i=len-1;i>=0;i--){
					if(dir===array[i]){
						cell.setQdir(array[((i>0)?i-1:len-1)]);
						break;
					}
				}
				if(cell.getQdir()===5 && this.owner.pid==='sashigane'){ cell.setQnum(cell.nummaxfunc());}
			}
		}
		else{
			var qn = cell.getNum(), min, max;
			if(this.owner.pid==='sashigane'){ max=cell.nummaxfunc(), min=cell.numminfunc();}
			if(this.btn.Left){
				if(this.owner.pid==='loute'){ cell.setQdir(1);}
				else if(qn<min){ cell.setNum(min);}
				else if(qn<max){ cell.setNum(qn+1);}
				else           { cell.setNum(-1); cell.setQdir(1);}
			}
			else if(this.btn.Right){
				if(this.owner.pid==='loute'){ cell.setQdir(0);}
				else if(qn>max){ cell.setNum(max);}
				else if(qn>min){ cell.setNum(qn-1);}
				else if(qn!==-1){ cell.setNum(-1);}
				else            { cell.setQdir(0);}
			}
		}
		cell.draw();
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,
	moveTarget : function(ca){
		if(this.isSHIFT){ return false;}
		return this.moveTCell(ca);
	},

	keyinput : function(ca){
		if(this.key_inputdirec(ca)){ return;}

		if(this.owner.pid==='loute'){
			this.key_arrow_loute(ca);
		}
		else if(this.owner.pid==='sashigane'){
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

		var cell = this.cursor.getTCC(), val=-1;

		if('1'<=ca && ca<='4'){ val = parseInt(ca); val = (cell.getQdir()!==val?val:0);}
		else if(ca==='-') { val = (cell.getQdir()!==-2?-2:0);}
		else if(ca==='q') { val = (cell.getQdir()!==5?5:0);}
		else if(ca===' ') { val = 0;}
		else if(ca==='s1'){ val = -2;}
		else{ return;}

		cell.setQdir(val);
		this.prev = cell;
		cell.draw();
	},

	key_inputqnum_sashigane : function(ca){
		var cell = this.cursor.getTCC();
		if(ca==='q'){
			cell.setQdir((cell.getQdir()!==5)?5:0);
			cell.setQnum(-1);
		}
		else if(ca==='-'){
			cell.setQdir((cell.getQdir()!==-2||cell.getQnum()!==-1)?-2:0);
			cell.setQnum(-1);
		}
		else if(ca===' '){
			cell.setQdir(0);
			cell.setQnum(-1);
		}
		else{
			this.key_inputqnum_main(cell,ca);
			if(cell.isNum() && cell.getQdir()!==5){ cell.setQdir(5);}
		}

		this.prev = cell;
		cell.draw();
	}
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	nummaxfunc : function(){
		var bd=this.owner.board, bx=this.bx, by=this.by;
		var col = (((bx<(bd.maxbx>>1))?(bd.maxbx-bx+2):bx+2)>>1);
		var row = (((by<(bd.maxby>>1))?(bd.maxby-by+2):by+2)>>1);
		return (col+row-1);
	},
	numminfunc : function(){
		return ((this.owner.board.qcols>=2?2:1)+(this.owner.board.qrows>=2?2:1)-1);
	},
	minnum : 3,

	getObjNum : function(){ return this.qdir;},
	isCircle : function(){ return this.qdir===5;}
},

Board:{
	qcols : 8,
	qrows : 8,

	hasborder : 1,

	getLblockInfo : function(){
		var rinfo = this.getRoomInfo();
		rinfo.place = [];

		for(var r=1;r<=rinfo.max;r++){
			var clist = rinfo.room[r].clist, d = clist.getRectSize();

			/* 四角形のうち別エリアとなっている部分を調べる */
			/* 幅が1なので座標自体は調べなくてよいはず      */
			var subclist = this.cellinside(d.x1,d.y1,d.x2,d.y2).filter(function(cell){ return (rinfo.getRoomID(cell)!==r);});
			var dl = subclist.getRectSize();
			if( subclist.length==0 || (dl.cols*dl.rows!=dl.cnt) || ((d.cols-1)!==dl.cols) || ((d.rows-1)!==dl.rows) ){
				rinfo.room[r].shape = 0;
				for(var i=0;i<clist.length;i++){ rinfo.place[clist[i].id] = 0;}
			}
			else{
				rinfo.room[r].shape = 1; /* 幅が1のL字型 */
				for(var i=0;i<clist.length;i++){ rinfo.place[clist[i].id] = 1;} /* L字型ブロックのセル */

				/* 端のセル */
				var edge1=null, edge2=null;
				if     ((d.x1===dl.x1&&d.y1===dl.y1)||(d.x2===dl.x2&&d.y2===dl.y2))
							{ edge1 = this.getc(d.x1,d.y2).id; edge2 = this.getc(d.x2,d.y1).id;}
				else if((d.x1===dl.x1&&d.y2===dl.y2)||(d.x2===dl.x2&&d.y1===dl.y1))
							{ edge1 = this.getc(d.x1,d.y1).id; edge2 = this.getc(d.x2,d.y2).id;}
				rinfo.place[edge1] = 2;
				rinfo.place[edge2] = 2;

				/* 角のセル */
				var corner=null;
				if     (d.x1===dl.x1 && d.y1===dl.y1){ corner = this.getc(d.x2,d.y2).id;}
				else if(d.x1===dl.x1 && d.y2===dl.y2){ corner = this.getc(d.x2,d.y1).id;}
				else if(d.x2===dl.x2 && d.y1===dl.y1){ corner = this.getc(d.x1,d.y2).id;}
				else if(d.x2===dl.x2 && d.y2===dl.y2){ corner = this.getc(d.x1,d.y1).id;}
				rinfo.place[corner] = 3;
			}
		}
		
		return rinfo;
	}
},
BoardExec:{
	adjustBoardData : function(key,d){
		this.adjustNumberArrow(key,d);
	}
},

AreaRoomManager:{
	enabled : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	initialize : function(){
		this.Common.prototype.initialize.call(this);

		this.gridcolor = this.gridcolor_DLIGHT;
		this.setBorderColorFunc('qans');

		this.circleratio = [0.40, 0.40];	/* 線幅を1pxにする */

		this.fontAnscolor = "black"; /* 矢印用 */

		if(this.owner.pid==='sashigane'){
			this.globalfontsizeratio = 0.85;

			this.hideHatena = true;
		}
	},
	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();
		this.drawBorders();

		this.drawCellArrows();
		this.drawCircles();
		this.drawHatenas_loute();
		if(this.owner.pid==='sashigane'){ this.drawNumbers();}

		this.drawBorderQsubs();

		this.drawChassis();

		this.drawTarget();
	},

	getCircleStrokeColor : function(cell){
		if(cell.isCircle()){ return this.cellcolor;}
		return null;
	},
	getCircleFillColor : function(cell){
		return null;
	},

	drawHatenas_loute : function(){
		var g = this.vinc('cell_hatena', 'auto');
		var ratio = (this.owner.pid==='sashigane' ? [0.8] : [0.94]);
		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i], px = cell.bx*this.bw, py = cell.by*this.bh;
			var text = (cell.qdir===-2 ? "?" : "");
			var option = { key:"cell_h_"+cell.id };
			option.ratio = ratio;
			option.color = (cell.error===1 ? this.fontErrcolor : this.fontcolor);
			this.disptext(text, px, py, option);
		}
	}
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
		var c=0, i=0, bstr = this.outbstr, bd = this.owner.board;
		for(i=0;i<bstr.length;i++){
			var obj = bd.cell[c], ca = bstr.charAt(i);

			if(this.include(ca,"0","9")||this.include(ca,"a","f"))
							  { obj.qdir = parseInt(ca,16);}
			else if(ca == '.'){ obj.qdir = -2;}
			else if(ca >= 'g' && ca <= 'z'){ c += (parseInt(ca,36)-16);}

			c++;
			if(c > bd.cellmax){ break;}
		}
		this.outbstr = bstr.substr(i);
	},
	encodeLoute : function(){
		var count=0, cm="", bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			var pstr = "", dir = bd.cell[c].qdir;

			if     (dir===-2){ pstr = ".";}
			else if(dir!== 0){ pstr = dir.toString(16);}
			else{ count++;}

			if(count==0){ cm += pstr;}
			else if(pstr || count==20){ cm+=((15+count).toString(36)+pstr); count=0;}
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
		var c=0, i=0, bstr = this.outbstr, bd = this.owner.board;
		for(i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i), obj=bd.cell[c];

			if(this.include(ca,"0","9")||this.include(ca,"a","f"))
							  { obj.qdir = 5; obj.qnum = parseInt(ca,16);}
			else if(ca == '-'){ obj.qdir = 5; obj.qnum = parseInt(bstr.substr(i+1,2),16); i+=2;}
			else if(ca == '.'){ obj.qdir = 5;}
			else if(ca == '%'){ obj.qdir = -2;}
			else if(ca>='g' && ca<='j'){ obj.qdir = (parseInt(ca,20)-15);}
			else if(ca>='k' && ca<='z'){ c+=(parseInt(ca,36)-20);}

			c++;
			if(c>=bd.cellmax){ break;}
		}
		this.outbstr = bstr.substr(i+1);
	},
	encodeSashigane : function(){
		var cm = "", count = 0, bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
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
		this.decodeCell( function(obj,ca){
			if(ca.charAt(0)==="o"){
				obj.qdir = 5;
				if(ca.length>1){ obj.qnum = parseInt(ca.substr(1));}
			}
			else if(ca==="-"){ obj.qdir = -2;}
			else if(ca!=="."){ obj.qdir = parseInt(ca);}
		});

		this.decodeBorderAns();
	},
	encodeData : function(){
		var pid = this.owner.pid;
		this.encodeCell( function(obj){
			if(pid==='sashigane' && obj.qdir===5){
				return "o"+(obj.qnum!==-1?obj.qnum:'')+" ";
			}
			else if(obj.qdir===-2){ return "- ";}
			else if(obj.qdir!== 0){ return obj.qdir+" ";}
			else{ return ". ";}
		});

		this.encodeBorderAns();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		var rinfo = this.owner.board.getLblockInfo();
		if( !this.checkArrowCorner1(rinfo) ){ return 'awBlkEdge';}
		if( !this.checkArrowCorner2(rinfo) ){ return 'awNotPtCnr';}
		if( !this.checkCircleCorner(rinfo) ){ return 'ciNotOnCnr';}

		if( (this.owner.pid==='sashigane') && !this.checkNumberAndSize(rinfo) ){ return 'bkSizeNe';}

		if( !this.checkBorderCount(1,0) ){ return 'bdDeadEnd';}

		if( !this.checkLblock(rinfo) ){ return 'bkNotLshape';}

		return null;
	},

	checkArrowCorner1 : function(rinfo){
		var result = true;
		for(var id=1;id<=rinfo.max;id++){
			if(rinfo.room[id].shape===0){ continue;}

			var error = false, clist = rinfo.room[id].clist;
			for(var i=0;i<clist.length;i++){
				var cell = clist[i], num = cell.getObjNum();
				if(num>=1 && num<=4 && rinfo.place[cell.id]!==2){
					if(this.checkOnly){ return false;}
					clist.seterr(1);
					result = false;
					break;
				}
			}
		}
		return result;
	},

	checkArrowCorner2 : function(rinfo){
		var result = true;
		for(var id=1;id<=rinfo.max;id++){
			if(rinfo.room[id].shape===0){ continue;}

			var error = false, clist = rinfo.room[id].clist;
			for(var i=0;i<clist.length;i++){
				var cell = clist[i], adb = cell.adjborder, num = cell.getObjNum();
				if(num>=1 && num<=4 &&
				   ((num===cell.UP && adb.top.isBorder()   ) ||
					(num===cell.DN && adb.bottom.isBorder()) ||
					(num===cell.LT && adb.left.isBorder()  ) ||
					(num===cell.RT && adb.right.isBorder() ) ) )
				{
					if(this.checkOnly){ return false;}
					clist.seterr(1);
					result = false;
					break;
				}
			}
		}
		return result;
	},

	checkCircleCorner : function(rinfo){
		var result = true;
		for(var id=1;id<=rinfo.max;id++){
			if(rinfo.room[id].shape===0){ continue;}

			var clist = rinfo.room[id].clist;
			for(var i=0;i<clist.length;i++){
				var cell = clist[i];
				if(cell.isCircle() && rinfo.place[cell.id]!==3){
					if(this.checkOnly){ return false;}
					clist.seterr(1);
					result = false;
					break;
				}
			}
		}
		return result;
	},

	checkLblock : function(rinfo){
		var result = true;
		for(var id=1;id<=rinfo.max;id++){
			if(rinfo.room[id].shape===0){
				if(this.checkOnly){ return false;}
				rinfo.room[id].clist.seterr(1);
				result = false;
			}
		}
		return result;
	}
},

FailCode:{
	bkNotLshape : ["ブロックが幅1のL字型になっていません。","A block is not L-shape or whose width is not one."],
	awBlkEdge  : ["矢印がブロックの端にありません。","An arrow is not at the edge of the block."],
	awNotPtCnr : ["矢印の先にブロックの角がありません。","An arrow doesn't indicate the corner of a block."],
	ciNotOnCnr : ["白丸がブロックの角にありません。","A circle is out of the corner."]
}
});
