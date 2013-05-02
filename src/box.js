//
// パズル固有スクリプト部 ボックス版 box.js v3.4.0
//
(function(){

var k = pzprv3.consts;

pzprv3.createCustoms('box', {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.owner.playmode){
			if(this.mousestart || this.mousemove){ this.inputcell();}
		}
		else if(this.owner.editmode){
			if(this.mousestart){ this.input_onstart();}
		}
	},

	input_onstart : function(){
		var excell = this.getcell_excell();
		if(excell.isnull || !excell.isexcellobj){ return;}

		if(excell!==this.cursor.getTEC()){
			this.setcursor(excell);
		}
		else{
			this.inputnumber(excell);
		}
	},
	inputnumber : function(excell){
		var qn = excell.getQnum(), max=excell.nummaxfunc();
		if(this.btn.Left){ excell.setQnum(qn!==max ? qn+1 : 0);}
		else if(this.btn.Right){ excell.setQnum(qn!==0 ? qn-1 : max);}

		excell.draw();
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,
	moveTarget : function(ca){
		var tc = this.cursor;
		var excell0 = tc.getTEC(), tcp = tc.getTCP(), dir = k.NDIR;
		switch(ca){
			case this.KEYUP: if(tcp.bx===tc.minx && tc.miny<tcp.by){ dir=k.UP;} break;
			case this.KEYDN: if(tcp.bx===tc.minx && tc.maxy>tcp.by){ dir=k.DN;} break;
			case this.KEYLT: if(tcp.by===tc.miny && tc.minx<tcp.bx){ dir=k.LT;} break;
			case this.KEYRT: if(tcp.by===tc.miny && tc.maxx>tcp.bx){ dir=k.RT;} break;
		}

		if(dir!==k.NDIR){
			tc.pos.movedir(dir,2);

			excell0.draw();
			tc.getTCP().draw();
			this.stopEvent();	/* カーソルを移動させない */

			return true;
		}
		return false;
	},

	keyinput : function(ca){
		this.key_inputexcell(ca);
	},
	key_inputexcell : function(ca){
		var excell = this.cursor.getTEC(), qn = excell.getQnum();
		var max = excell.nummaxfunc();

		if('0'<=ca && ca<='9'){
			var num = parseInt(ca);

			if(qn<=0 || this.prev!==excell){
				if(num<=max){ excell.setQnum(num);}
			}
			else{
				if(qn*10+num<=max){ excell.setQnum(qn*10+num);}
				else if (num<=max){ excell.setQnum(num);}
			}
		}
		else if(ca==' ' || ca=='-'){ excell.setQnum(0);}
		else{ return;}

		this.prev = excell;
		this.cursor.getTCP().draw();
	}
},

TargetCursor:{
	initCursor : function(){
		this.setTEC(this.owner.board.excell[0]);
	}
},

//---------------------------------------------------------
// 盤面管理系
EXCell:{
	qnum : 0,

	disInputHatena : true,

	nummaxfunc : function(){
		var bx=this.bx, by=this.by, cnt;
		if(bx===-1 && by===-1){ return;}
		var sum=0;
		for(var n=(bx===-1?this.owner.board.qrows:this.owner.board.qcols);n>0;n--){ sum+=n;}
		return sum;
	},
	minnum : 0
},

Board:{
	qcols : 9,
	qrows : 9,

	isexcell : 1,

	adjustBoardData : function(key,d){
		var bx1=(d.x1|1), by1=(d.y1|1);
		this.qnumw = [];
		this.qnumh = [];

		for(var by=by1;by<=d.y2;by+=2){ this.qnumw[by] = this.getex(-1,by).getQnum();}
		for(var bx=bx1;bx<=d.x2;bx+=2){ this.qnumh[bx] = this.getex(bx,-1).getQnum();}
	},
	adjustBoardData2 : function(key,d){
		var xx=(d.x1+d.x2), yy=(d.y1+d.y2), bx1=(d.x1|1), by1=(d.y1|1);

		switch(key){
		case k.FLIPY: // 上下反転
			for(var bx=bx1;bx<=d.x2;bx+=2){ this.getex(bx,-1).setQnum(this.qnumh[bx]);}
			break;

		case k.FLIPX: // 左右反転
			for(var by=by1;by<=d.y2;by+=2){ this.getex(-1,by).setQnum(this.qnumw[by]);}
			break;

		case k.TURNR: // 右90°反転
			for(var by=by1;by<=d.y2;by+=2){ this.getex(-1,by).setQnum(this.qnumh[by]);}
			for(var bx=bx1;bx<=d.x2;bx+=2){ this.getex(bx,-1).setQnum(this.qnumw[xx-bx]);}
			break;

		case k.TURNL: // 左90°反転
			for(var by=by1;by<=d.y2;by+=2){ this.getex(-1,by).setQnum(this.qnumh[yy-by]);}
			for(var bx=bx1;bx<=d.x2;bx+=2){ this.getex(bx,-1).setQnum(this.qnumw[bx]);}
			break;
		}
	}
},

Properties:{
	flag_use : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	bdmargin       : 0.65,
	bdmargin_image : 0.60,

	paint : function(){
		this.drawBGCells();
		this.drawDotCells(false);
		this.drawBlackCells();
		this.drawGrid();

		this.drawBGEXcells();
		this.drawNumbers_box();

		this.drawCircledNumbers_box();

		this.drawChassis();

		this.drawTarget();
	},

	drawNumbers_box : function(){
		var g = this.vinc('excell_number', 'auto');

		var header = "ex_full_";
		var exlist = this.range.excells;
		for(var i=0;i<exlist.length;i++){
			var excell = exlist[i], key="excell_"+excell.id;
			if(excell.id>=this.owner.board.qcols+this.owner.board.qrows){ continue;}

			if(excell.bx===-1 && excell.by===-1){ continue;}
			var color = (excell.error!==1 ? this.fontcolor : this.fontErrcolor);
			var fontratio = (excell.qnum<10?0.8:0.7);
			var px = excell.bx*this.bw, py = excell.by*this.bh;
			this.dispnum(key, 1, ""+excell.qnum, fontratio, color, px, py);
		}
	},

	drawCircledNumbers_box : function(){
		var list = [], bd = this.owner.board;
		var x1=this.range.x1, y1=this.range.y1, x2=this.range.x2, y2=this.range.y2;
		if(x2>=bd.maxbx){ for(var by=(y1|1),max=Math.min(bd.maxby,y2);by<=max;by+=2){ list.push([bd.maxbx+1,by]);}}
		if(y2>=bd.maxby){ for(var bx=(x1|1),max=Math.min(bd.maxbx,x2);bx<=max;bx+=2){ list.push([bx,bd.maxby+1]);}}

		var g = this.vinc('excell_circle', 'auto');
		var header = "ex2_cir_", rsize  = this.cw*0.36;
		g.fillStyle   = this.circledcolor;
		g.strokeStyle = this.cellcolor;
		for(var i=0;i<list.length;i++){
			var num = ((list[i][0]!==bd.maxbx+1 ? list[i][0] : list[i][1])+1)>>1;
			if(num<=0){ continue;}

			if(this.vnop([header,list[i][0],list[i][1]].join("_"),this.NONE)){
				g.shapeCircle(list[i][0]*this.bw, list[i][1]*this.bh, rsize);
			}
		}

		var g = this.vinc('excell_number2', 'auto');
		var key = "ex2_cir_";
		for(var i=0;i<list.length;i++){
			var num = ((list[i][0]!==bd.maxbx+1 ? list[i][0] : list[i][1])+1)>>1;
			if(num<=0){ continue;}

			var key = [header,list[i][0],list[i][1]].join("_");
			var fontratio = (num<10?0.7:0.6);
			this.dispnum(key, 1, ""+num, fontratio, this.fontcolor, list[i][0]*this.bw, list[i][1]*this.bh);
		}
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		this.decodeBox();
	},
	pzlexport : function(type){
		this.encodeBox();
	},

	decodeBox : function(){
		var cm="", ec=0, bstr = this.outbstr, bd = this.owner.board;
		for(var a=0;a<bstr.length;a++){
			var ca=bstr.charAt(a), obj=bd.excell[ec];
			if(ca==='-'){ obj.qnum = parseInt(bstr.substr(a+1,2),32); a+=2;}
			else        { obj.qnum = parseInt(ca,32);}
			ec++;
			if(ec >= bd.qcols+bd.qrows){ a++; break;}
		}

		this.outbstr = bstr.substr(a);
	},
	encodeBox : function(){
		var cm="", bd = this.owner.board;
		for(var ec=0,len=bd.qcols+bd.qrows;ec<len;ec++){
			var qnum=bd.excell[ec].qnum;
			if(qnum<32){ cm+=("" +qnum.toString(32));}
			else       { cm+=("-"+qnum.toString(32));}
		}

		this.outbstr += cm;
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		var bd = this.owner.board, item = this.getItemList(bd.qrows+1);
		for(var i=0;i<item.length;i++) {
			var ca = item[i];
			if(ca=="."){ continue;}

			var bx = i%(bd.qcols+1)*2-1, by = ((i/(bd.qcols+1))<<1)-1;
			var excell = bd.getex(bx,by);
			if(!excell.isnull){
				excell.qnum = parseInt(ca);
			}

			var cell = bd.getc(bx,by);
			if(!cell.isnull){
				if     (ca==="#"){ cell.qans = 1;}
				else if(ca==="+"){ cell.qsub = 1;}
			}
		}
	},
	encodeData : function(){
		var bd = this.owner.board;
		for(var by=-1;by<bd.maxby;by+=2){
			for(var bx=-1;bx<bd.maxbx;bx+=2){
				var excell = bd.getex(bx,by);
				if(!excell.isnull){
					this.datastr += (excell.qnum.toString()+" ");
					continue;
				}

				var cell = bd.getc(bx,by);
				if(!cell.isnull){
					if     (cell.qans===1){ this.datastr += "# ";}
					else if(cell.qsub===1){ this.datastr += "+ ";}
					else                  { this.datastr += ". ";}
					continue;
				}

				this.datastr += ". ";
			}
			this.datastr += "/";
		}
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.checkBlackCells() ){
			this.setAlert('数字と黒マスになった数字の合計が正しくありません。', 'A number is not equal to the sum of the number of black cells.'); return false;
		}

		return true;
	},

	checkBlackCells : function(type){
		var result = true, bd = this.owner.board;
		for(var ec=0;ec<bd.excellmax;ec++){
			var excell = bd.excell[ec];
			var qn=excell.getQnum(), pos=excell.getaddr(), val=0, cell;
			var clist=this.owner.newInstance('CellList')
			if(pos.by===-1 && pos.bx>0 && pos.bx<2*bd.qcols){
				cell = pos.move(0,2).getc();
				while(!cell.isnull){
					if(cell.qans===1){ val+=((pos.by+1)>>1);}
					clist.add(cell);
					cell = pos.move(0,2).getc();
				}
			}
			else if(pos.bx===-1 && pos.by>0 && pos.by<2*bd.qrows){
				cell = pos.move(2,0).getc();
				while(!cell.isnull){
					if(cell.qans===1){ val+=((pos.bx+1)>>1);}
					clist.add(cell);
					cell = pos.move(2,0).getc();
				}
			}
			else{ continue;}

			if(qn!==val){
				if(this.inAutoCheck){ return false;}
				excell.seterr(1);
				clist.seterr(1);
				result = false;
			}
		}
		return result;
	}
}
});

})();
