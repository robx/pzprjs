//
// パズル固有スクリプト部 エルート・さしがね版 loute.js v3.4.0
//
pzprv3.custom.loute = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mousedown : function(){
		if     (k.editmode){ return this.inputarrow_cell_loute();}
		else if(k.playmode){
			if     (this.btn.Left) { this.inputborderans();}
			else if(this.btn.Right){ this.inputQsubLine();}
		}
	},
	mouseup : function(){
		if(k.editmode && this.notInputted()){ return this.inputqnum_loute();}
	},
	mousemove : function(){
		if     (k.editmode){ return this.inputarrow_cell_loute();}
		else if(k.playmode){
			if     (this.btn.Left) { this.inputborderans();}
			else if(this.btn.Right){ this.inputQsubLine();}
		}
	},

	inputarrow_cell_loute : function(){
		var pos = this.borderpos(0);
		if(this.prevPos.equals(pos)){ return;}

		var dir = bd.NDIR, cc = bd.cnum(this.prevPos.x, this.prevPos.y);
		if(cc!==null){
			var dir = this.getdir(this.prevPos, pos);
			if(dir!==bd.NDIR){
				bd.sDiC(cc,(bd.DiC(cc)!==dir?dir:0));
				bd.sQnC(cc,-1);
				pc.paintCell(cc);
				this.mousereset();
				return;
			}
		}
		this.prevPos = pos;
	},

	inputqnum_loute : function(){
		var cc = this.cellid();
		if(cc===null || cc===this.mouseCell){ return;}

		if(cc===tc.getTCC()){
			var dir = bd.DiC(cc);
			if(dir!==5){
				var array = [0,5,1,2,3,4,-2], flag = false;
				if(this.btn.Left){
					for(var i=0;i<array.length-1;i++){
						if(!flag && dir===array[i]){ bd.sDiC(cc,array[i+1]); flag=true;}
					}
					if(!flag && dir===array[array.length-1]){ bd.sDiC(cc,array[0]); flag=true;}
				}
				else if(this.btn.Right){
					for(var i=array.length;i>0;i--){
						if(!flag && dir===array[i]){ bd.sDiC(cc,array[i-1]); flag=true;}
					}
					if(!flag && dir===array[0]){ bd.sDiC(cc,array[array.length-1]); flag=true;}
					if(bd.DiC(cc)===5 && this.owner.pid==='sashigane'){ bd.sQnC(cc,bd.nummaxfunc(cc));}
				}
			}
			else{
				var qn = bd.getNum(cc), min, max;
				if(this.owner.pid==='sashigane'){ max=bd.nummaxfunc(cc), min=bd.numminfunc(cc);}
				if(this.btn.Left){
					if(this.owner.pid==='loute'){ bd.sDiC(cc,1);}
					else if(qn<min){ bd.setNum(cc,min);}
					else if(qn<max){ bd.setNum(cc,qn+1);}
					else           { bd.setNum(cc,-1); bd.sDiC(cc,1);}
				}
				else if(this.btn.Right){
					if(this.owner.pid==='loute'){ bd.sDiC(cc,0);}
					else if(qn>max){ bd.setNum(cc,max);}
					else if(qn>min){ bd.setNum(cc,qn-1);}
					else if(qn!==-1){ bd.setNum(cc,-1);}
					else            { bd.sDiC(cc,0);}
				}
			}
		}
		else{
			var cc0 = tc.getTCC();
			tc.setTCC(cc);
			pc.paintCell(cc0);
		}

		pc.paintCell(cc);
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

		var cc = tc.getTCC(), val=-1;

		if('1'<=ca && ca<='4'){ val = parseInt(ca); val = (bd.DiC(cc)!==val?val:0);}
		else if(ca==='-') { val = (bd.DiC(cc)!==-2?-2:0);}
		else if(ca==='q') { val = (bd.DiC(cc)!==5?5:0);}
		else if(ca===' ') { val = 0;}
		else if(ca==='s1'){ val = -2;}
		else{ return;}

		bd.sDiC(cc,val);
		this.prev = cc;
		pc.paintCell(cc);
	},

	key_inputqnum_sashigane : function(ca){
		var cc = tc.getTCC();
		if(ca==='q'){
			bd.sDiC(cc,((bd.DiC(cc)!==5)?5:0));
			bd.sQnC(cc,-1);
		}
		else if(ca==='-'){
			bd.sDiC(cc,((bd.DiC(cc)!==-2||bd.QnC(cc)!==-1)?-2:0));
			bd.sQnC(cc,-1);
		}
		else if(ca===' '){
			bd.sDiC(cc,0);
			bd.sQnC(cc,-1);
		}
		else{
			this.key_inputqnum_main(cc,ca);
			if(bd.isNum(cc) && bd.DiC(cc)!==5){ bd.sDiC(cc,5);}
		}

		this.prev=cc;
		pc.paintCell(cc);
	}
},

//---------------------------------------------------------
// 盤面管理系
Board:{
	qcols : 8,
	qrows : 8,

	isborder : 1,

	getLblockInfo : function(){
		var rinfo = bd.areas.getRoomInfo();
		rinfo.place = [];

		for(var id=1;id<=rinfo.max;id++){
			var clist = rinfo.room[id].idlist;
			var d = bd.getSizeOfClist(clist);
			var subclist = [];
			for(var bx=d.x1;bx<=d.x2;bx+=2){
				for(var by=d.y1;by<=d.y2;by+=2){
					var cc = bd.cnum(bx,by);
					if(rinfo.id[cc]!=id){ subclist.push(cc);}
				}
			}
			/* 四角形のうち別エリアとなっている部分を調べる */
			/* 幅が1なので座標自体は調べなくてよいはず      */
			var dl = bd.getSizeOfClist(subclist);
			if( subclist.length==0 || (dl.cols*dl.rows!=dl.cnt) || ((d.cols-1)!==dl.cols) || ((d.rows-1)!==dl.rows) ){
				rinfo.room[id].shape = 0;
				for(var i=0;i<clist.length;i++){ rinfo.place[clist[i]] = 0;}
			}
			else{
				rinfo.room[id].shape = 1; /* 幅が1のL字型 */
				for(var i=0;i<clist.length;i++){ rinfo.place[clist[i]] = 1;} /* L字型ブロックのセル */

				/* 端のセル */
				var edge1=null, edge2=null;
				if     ((d.x1===dl.x1&&d.y1===dl.y1)||(d.x2===dl.x2&&d.y2===dl.y2))
							{ edge1 = bd.cnum(d.x1,d.y2); edge2 = bd.cnum(d.x2,d.y1);}
				else if((d.x1===dl.x1&&d.y2===dl.y2)||(d.x2===dl.x2&&d.y1===dl.y1))
							{ edge1 = bd.cnum(d.x1,d.y1); edge2 = bd.cnum(d.x2,d.y2);}
				rinfo.place[edge1] = 2;
				rinfo.place[edge2] = 2;

				/* 角のセル */
				var corner=null;
				if     (d.x1===dl.x1 && d.y1===dl.y1){ corner = bd.cnum(d.x2,d.y2);}
				else if(d.x1===dl.x1 && d.y2===dl.y2){ corner = bd.cnum(d.x2,d.y1);}
				else if(d.x2===dl.x2 && d.y1===dl.y1){ corner = bd.cnum(d.x1,d.y2);}
				else if(d.x2===dl.x2 && d.y2===dl.y2){ corner = bd.cnum(d.x1,d.y1);}
				rinfo.place[corner] = 3;
			}
		}
		
		return rinfo;
	},

	nummaxfunc : function(cc){
		var bx=this.cell[cc].bx, by=this.cell[cc].by;
		var col = (((bx<(this.maxbx>>1))?(this.maxbx-bx+2):bx+2)>>1);
		var row = (((by<(this.maxby>>1))?(this.maxby-by+2):by+2)>>1);
		return (col+row-1);
	},
	numminfunc : function(cc){
		return ((this.qcols>=2?2:1)+(this.qrows>=2?2:1)-1);
	},
	minnum : 3,

	getObjNum : function(c){ return this.DiC(c);},
	isCircle  : function(c){ return this.DiC(c)===5;}
},

AreaManager:{
	hasroom : true
},

MenuExec:{
	adjustBoardData : function(key,d){
		this.adjustNumberArrow(key,d);
	}
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
			var c = clist[i];
			if(bd.isCircle(c)){
				g.strokeStyle = this.cellcolor;
				if(this.vnop(header+c,this.STROKE)){
					g.strokeCircle(bd.cell[c].cpx, bd.cell[c].cpy, rsize2);
				}
			}
			else{ this.vhide([header+c]);}
		}
	},
	drawHatenas_loute : function(){
		var g = this.vinc('cell_hatena', 'auto');
		var ratio = 0.8/this.fontsizeratio;

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var obj = bd.cell[clist[i]], key = 'cell_h_'+clist[i];
			if(obj.qdir===-2){
				var color = (obj.error===1 ? this.fontErrcolor : this.fontcolor);
				this.dispnum(key, 1, "?", ratio, color, obj.cpx, obj.cpy);
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
			var ca = bstr.charAt(i), obj=bd.cell[c];

			if(this.include(ca,"0","9")||this.include(ca,"a","f"))
							  { obj.qdir = 5; obj.qnum = parseInt(ca,16);}
			else if(ca == '-'){ obj.qdir = 5; obj.qnum = parseInt(bstr.substr(i+1,2),16); i+=2;}
			else if(ca == '.'){ obj.qdir = 5;}
			else if(ca == '%'){ obj.qdir = -2;}
			else if(ca>='g' && ca<='j'){ obj.qdir = (parseInt(ca,20)-15);}
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

			var error = false, clist = rinfo.room[id].idlist;
			for(var i=0;i<clist.length;i++){
				var cc = clist[i], num = bd.getObjNum(cc);
				if(num>=1 && num<=4 && rinfo.place[cc]!==2){
					if(this.inAutoCheck){ return false;}
					bd.sErC(rinfo.room[id].idlist,1);
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

			var error = false, clist = rinfo.room[id].idlist;
			for(var i=0;i<clist.length;i++){
				var cc = clist[i], num = bd.getObjNum(cc);
				if(num>=1 && num<=4 &&
				   ((num===bd.UP && bd.isBorder(bd.ub(cc))) ||
					(num===bd.DN && bd.isBorder(bd.db(cc))) ||
					(num===bd.LT && bd.isBorder(bd.lb(cc))) ||
					(num===bd.RT && bd.isBorder(bd.rb(cc)))) )
				{
					if(this.inAutoCheck){ return false;}
					bd.sErC(rinfo.room[id].idlist,1);
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

			var clist = rinfo.room[id].idlist;
			for(var i=0;i<clist.length;i++){
				var cc = clist[i];
				if(bd.isCircle(cc) && rinfo.place[cc]!==3){
					if(this.inAutoCheck){ return false;}
					bd.sErC(rinfo.room[id].idlist,1);
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
				bd.sErC(rinfo.room[id].idlist,1);
				result = false;
			}
		}
		return result;
	}
}
};
