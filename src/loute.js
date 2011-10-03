//
// パズル固有スクリプト部 エルート・さしがね版 loute.js v3.4.0
//
pzprv3.custom.loute = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputedit : function(){
		if(this.mousestart || this.mousemove){ this.inputarrow_cell_loute();}
		else if(this.mouseend && this.notInputted()){ this.inputqnum_loute();}
	},
	inputplay : function(){
		if(this.mousestart || this.mousemove){
			if     (this.btn.Left) { this.inputborderans();}
			else if(this.btn.Right){ this.inputQsubLine();}
		}
	},

	inputarrow_cell_loute : function(){
		var pos = this.borderpos(0);
		if(this.prevPos.equals(pos)){ return;}

		var dir = bd.NDIR, cell = this.prevPos.getc();
		if(!cell.isnull){
			var dir = this.getdir(this.prevPos, pos);
			if(dir!==bd.NDIR){
				cell.setQdir(cell.getQdir()!==dir?dir:0);
				cell.setQnum(-1);
				pc.paintCell(cell);
				this.mousereset();
				return;
			}
		}
		this.prevPos = pos;
	},

	inputqnum_loute : function(){
		var cell = this.getcell();
		if(cell.isnull){ return;}

		if(cell===tc.getTCC()){
			var dir = cell.getQdir();
			if(dir!==5){
				var array = [0,5,1,2,3,4,-2], flag = false;
				if(this.btn.Left){
					for(var i=0;i<array.length-1;i++){
						if(!flag && dir===array[i]){ cell.setQdir(array[i+1]); flag=true;}
					}
					if(!flag && dir===array[array.length-1]){ cell.setQdir(array[0]); flag=true;}
				}
				else if(this.btn.Right){
					for(var i=array.length;i>0;i--){
						if(!flag && dir===array[i]){ cell.setQdir(array[i-1]); flag=true;}
					}
					if(!flag && dir===array[0]){ cell.setQdir(array[array.length-1]); flag=true;}
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
		}
		else{
			var cell0 = tc.getTCC();
			tc.setTCC(cell);
			pc.paintCell(cell0);
		}

		pc.paintCell(cell);
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

		var cell = tc.getTCC(), val=-1;

		if('1'<=ca && ca<='4'){ val = parseInt(ca); val = (cell.getQdir()!==val?val:0);}
		else if(ca==='-') { val = (cell.getQdir()!==-2?-2:0);}
		else if(ca==='q') { val = (cell.getQdir()!==5?5:0);}
		else if(ca===' ') { val = 0;}
		else if(ca==='s1'){ val = -2;}
		else{ return;}

		cell.setQdir(val);
		this.prev = cell;
		pc.paintCell(cell);
	},

	key_inputqnum_sashigane : function(ca){
		var cell = tc.getTCC();
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
		pc.paintCell(cell);
	}
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	nummaxfunc : function(){
		var bx=this.bx, by=this.by;
		var col = (((bx<(bd.maxbx>>1))?(bd.maxbx-bx+2):bx+2)>>1);
		var row = (((by<(bd.maxby>>1))?(bd.maxby-by+2):by+2)>>1);
		return (col+row-1);
	},
	numminfunc : function(){
		return ((bd.qcols>=2?2:1)+(bd.qrows>=2?2:1)-1);
	},
	minnum : 3,

	getObjNum : function(){ return this.qdir;},
	isCircle : function(){ return this.qdir===5;}
},

Board:{
	qcols : 8,
	qrows : 8,

	isborder : 1,

	getLblockInfo : function(){
		var rinfo = bd.areas.getRoomInfo();
		rinfo.place = [];

		for(var r=1;r<=rinfo.max;r++){
			var clist = rinfo.getclist(r), d = clist.getRectSize();

			/* 四角形のうち別エリアとなっている部分を調べる */
			/* 幅が1なので座標自体は調べなくてよいはず      */
			var subclist = bd.cellinside(d.x1,d.y1,d.x2,d.y2).filter(function(cell){ return (rinfo.getRoomID(cell)!==r);});
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
							{ edge1 = bd.getc(d.x1,d.y2).id; edge2 = bd.getc(d.x2,d.y1).id;}
				else if((d.x1===dl.x1&&d.y2===dl.y2)||(d.x2===dl.x2&&d.y1===dl.y1))
							{ edge1 = bd.getc(d.x1,d.y1).id; edge2 = bd.getc(d.x2,d.y2).id;}
				rinfo.place[edge1] = 2;
				rinfo.place[edge2] = 2;

				/* 角のセル */
				var corner=null;
				if     (d.x1===dl.x1 && d.y1===dl.y1){ corner = bd.getc(d.x2,d.y2).id;}
				else if(d.x1===dl.x1 && d.y2===dl.y2){ corner = bd.getc(d.x2,d.y1).id;}
				else if(d.x2===dl.x2 && d.y1===dl.y1){ corner = bd.getc(d.x1,d.y2).id;}
				else if(d.x2===dl.x2 && d.y2===dl.y2){ corner = bd.getc(d.x1,d.y1).id;}
				rinfo.place[corner] = 3;
			}
		}
		
		return rinfo;
	},

	adjustBoardData : function(key,d){
		this.adjustNumberArrow(key,d);
	}
},

AreaManager:{
	hasroom : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	setColors : function(){
		this.gridcolor = this.gridcolor_DLIGHT;
		this.setBorderColorFunc('qans');

		this.circledcolor = "black";
		this.circleratio = [0.35, 0.40];

		this.fontAnscolor = "black"; /* 矢印用 */

		if(this.owner.pid==='sashigane'){
			this.fontsizeratio = 0.85;

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

	drawCircles : function(){
		var g = this.vinc('cell_circle', 'auto');

		var rsize2 = this.cw*this.circleratio[1];
		var header = "c_cir_";
		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i];
			if(cell.isCircle()){
				g.strokeStyle = this.cellcolor;
				if(this.vnop(header+cell.id,this.STROKE)){
					g.strokeCircle(cell.px, cell.py, rsize2);
				}
			}
			else{ this.vhide([header+cell.id]);}
		}
	},
	drawHatenas_loute : function(){
		var g = this.vinc('cell_hatena', 'auto');
		var ratio = 0.8/this.fontsizeratio;

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i], key = 'cell_h_'+cell.id;
			if(cell.qdir===-2){
				var color = (cell.error===1 ? this.fontErrcolor : this.fontcolor);
				this.dispnum(key, 1, "?", ratio, color, cell.px, cell.py);
			}
			else{ this.hidenum(key);}
		}
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		if(this.owner.pid==='loute'){
			this.decodeLoute();
		}
		else if(this.owner.pid==='sashigane'){
			this.decodeSashigane();
		}
	},
	pzlexport : function(type){
		if(this.owner.pid==='loute'){
			this.encodeLoute();
		}
		else if(this.owner.pid==='sashigane'){
			this.encodeSashigane();
		}
	},

	decodeLoute : function(){
		var c=0, i=0, bstr = this.outbstr;
		for(i=0;i<bstr.length;i++){
			var cell = bd.cell[c], ca = bstr.charAt(i);

			if(this.include(ca,"0","9")||this.include(ca,"a","f"))
							  { cell.qdir = parseInt(ca,16);}
			else if(ca == '.'){ cell.qdir = -2;}
			else if(ca >= 'g' && ca <= 'z'){ c += (parseInt(ca,36)-16);}

			c++;
			if(c > bd.cellmax){ break;}
		}
		this.outbstr = bstr.substr(i);
	},
	encodeLoute : function(){
		var count=0, cm="";
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
	},

	decodeSashigane : function(){
		var c=0, i=0, bstr = this.outbstr;
		for(i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i), cell=bd.cell[c];

			if(this.include(ca,"0","9")||this.include(ca,"a","f"))
							  { cell.qdir = 5; cell.qnum = parseInt(ca,16);}
			else if(ca == '-'){ cell.qdir = 5; cell.qnum = parseInt(bstr.substr(i+1,2),16); i+=2;}
			else if(ca == '.'){ cell.qdir = 5;}
			else if(ca == '%'){ cell.qdir = -2;}
			else if(ca>='g' && ca<='j'){ cell.qdir = (parseInt(ca,20)-15);}
			else if(ca>='k' && ca<='z'){ c+=(parseInt(ca,36)-20);}

			c++;
			if(c > bd.cellmax){ break;}
		}
		this.outbstr = bstr.substr(i);
	},
	encodeSashigane : function(){
		var cm = "", count = 0;
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
		this.decodeCell( function(cell,ca){
			if(ca.charAt(0)==="o"){
				cell.qdir = 5;
				if(ca.length>1){ cell.qnum = parseInt(ca.substr(1));}
			}
			else if(ca==="-"){ cell.qdir = -2;}
			else if(ca!=="."){ cell.qdir = parseInt(ca);}
		});

		this.decodeBorderAns();
	},
	encodeData : function(){
		var pid = this.owner.pid;
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
	checkAns : function(){

		var rinfo = bd.getLblockInfo();
		if( !this.checkArrowCorner1(rinfo) ){
			this.setAlert('矢印がブロックの端にありません。','An arrow is not at the edge of the block.'); return false;
		}

		if( !this.checkArrowCorner2(rinfo) ){
			this.setAlert('矢印の先にブロックの角がありません。','An arrow doesn\'t indicate the corner of a block.'); return false;
		}

		if( !this.checkCircleCorner(rinfo) ){
			this.setAlert('白丸がブロックの角にありません。','A circle is out of the corner.'); return false;
		}

		if( (this.owner.pid==='sashigane') && !this.checkNumberAndSize(rinfo) ){
			this.setAlert('数字とブロックのサイズが違います。','The size of the block is not equal to the number.'); return false;
		}

		if( !this.checkLcntCross(1,0) ){
			this.setAlert('途切れている線があります。','There is a dead-end line.'); return false;
		}

		if( !this.checkLblock(rinfo) ){
			this.setAlert('ブロックが幅1のL字型になっていません。','A block is not L-shape or whose width is not one.'); return false;
		}

		return true;
	},

	checkArrowCorner1 : function(rinfo){
		var result = true;
		for(var id=1;id<=rinfo.max;id++){
			if(rinfo.room[id].shape===0){ continue;}

			var error = false, clist = rinfo.getclist(id);
			for(var i=0;i<clist.length;i++){
				var cell = clist[i], num = cell.getObjNum();
				if(num>=1 && num<=4 && rinfo.place[cell.id]!==2){
					if(this.inAutoCheck){ return false;}
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

			var error = false, clist = rinfo.getclist(id);
			for(var i=0;i<clist.length;i++){
				var cell = clist[i], num = cell.getObjNum();
				if(num>=1 && num<=4 &&
				   ((num===bd.UP && cell.ub().isBorder()) ||
					(num===bd.DN && cell.db().isBorder()) ||
					(num===bd.LT && cell.lb().isBorder()) ||
					(num===bd.RT && cell.rb().isBorder())) )
				{
					if(this.inAutoCheck){ return false;}
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

			var clist = rinfo.getclist(id);
			for(var i=0;i<clist.length;i++){
				var cell = clist[i];
				if(cell.isCircle() && rinfo.place[cell.id]!==3){
					if(this.inAutoCheck){ return false;}
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
				if(this.inAutoCheck){ return false;}
				rinfo.getclist(id).seterr(1);
				result = false;
			}
		}
		return result;
	}
}
};
