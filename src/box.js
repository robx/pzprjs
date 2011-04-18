//
// パズル固有スクリプト部 ボックス版 box.js v3.4.0
//
pzprv3.custom.box = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mousedown : function(){
		if     (k.editmode){ this.clickexcell();}
		else if(k.playmode){ this.inputcell();}
	},
	mousemove : function(){
		if(k.playmode){ this.inputcell();}
	},

	clickexcell : function(){
		var ec = this.excellid();
		if(ec===null){ return;}

		var ec0 = tc.getTEC();
		if(ec!==ec0){
			tc.setTEC(ec);
			pc.paintEXcell(ec0);
		}
		else{
			var qn = bd.QnE(ec), max=bd.nummaxfunc(ec);
			if(this.btn.Left){ bd.sQnE(ec,(qn!==max ? qn+1 : 0));}
			else if(this.btn.Right){ bd.sQnE(ec,(qn!==0 ? qn-1 : max));}
		}
		pc.paintEXcell(ec);

		this.mousereset();
		return true;
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,
	moveTarget : function(ca){
		var cc0 = tc.getTEC(), tcp = tc.getTCP(), flag = false;
		switch(ca){
			case k.KEYUP: if(tcp.x===tc.minx && tc.miny<tcp.y){ tc.decTCY(2); flag=true;} break;
			case k.KEYDN: if(tcp.x===tc.minx && tc.maxy>tcp.y){ tc.incTCY(2); flag=true;} break;
			case k.KEYLT: if(tcp.y===tc.miny && tc.minx<tcp.x){ tc.decTCX(2); flag=true;} break;
			case k.KEYRT: if(tcp.y===tc.miny && tc.maxx>tcp.x){ tc.incTCX(2); flag=true;} break;
		}

		if(flag){
			pc.paintEXcell(cc0);
			pc.paintEXcell(tc.getTEC());
			this.tcMoved = true;
		}
		return flag;
	},

	keyinput : function(ca){
		this.key_inputexcell(ca);
	},
	key_inputexcell : function(ca){
		var ec = tc.getTEC();
		var max = bd.nummaxfunc(ec);

		if('0'<=ca && ca<='9'){
			var num = parseInt(ca);

			if(bd.QnE(ec)<=0 || this.prev!=ec){
				if(num<=max){ bd.sQnE(ec,num);}
			}
			else{
				if(bd.QnE(ec)*10+num<=max){ bd.sQnE(ec,bd.QnE(ec)*10+num);}
				else if(num<=max){ bd.sQnE(ec,num);}
			}
		}
		else if(ca==' ' || ca=='-'){ bd.sQnE(ec,0);}
		else{ return;}

		this.prev = ec;
		pc.paintEXcell(tc.getTEC());
	}
},

TargetCursor:{
	initCursor : function(){
		this.setTEC(0);
	}
},

//---------------------------------------------------------
// 盤面管理系
EXCell:{
	qnum : 0
},

Board:{
	qcols : 9,
	qrows : 9,

	isexcell : 1,

	numzero        : true,
	disInputHatena : true,

	nummaxfunc : function(ec){
		var bx=this.excell[ec].bx, by=this.excell[ec].by, cnt;
		if(bx===-1 && by===-1){ return;}
		var sum=0;
		for(var n=(bx===-1?this.qrows:this.qcols);n>0;n--){ sum+=n;}
		return sum;
	}
},

MenuExec:{
	adjustBoardData : function(key,d){
		var bx1=(d.x1|1), by1=(d.y1|1);
		this.qnumw = [];
		this.qnumh = [];

		for(var by=by1;by<=d.y2;by+=2){ this.qnumw[by] = bd.QnE(bd.exnum(-1,by));}
		for(var bx=bx1;bx<=d.x2;bx+=2){ this.qnumh[bx] = bd.QnE(bd.exnum(bx,-1));}
	},
	adjustBoardData2 : function(key,d){
		var xx=(d.x1+d.x2), yy=(d.y1+d.y2), bx1=(d.x1|1), by1=(d.y1|1);

		switch(key){
		case this.FLIPY: // 上下反転
			for(var bx=bx1;bx<=d.x2;bx+=2){ bd.sQnE(bd.exnum(bx,-1), this.qnumh[bx]);}
			break;

		case this.FLIPX: // 左右反転
			for(var by=by1;by<=d.y2;by+=2){ bd.sQnE(bd.exnum(-1,by), this.qnumw[by]);}
			break;

		case this.TURNR: // 右90°反転
			for(var by=by1;by<=d.y2;by+=2){ bd.sQnE(bd.exnum(-1,by), this.qnumh[by]);}
			for(var bx=bx1;bx<=d.x2;bx+=2){ bd.sQnE(bd.exnum(bx,-1), this.qnumw[xx-bx]);}
			break;

		case this.TURNL: // 左90°反転
			for(var by=by1;by<=d.y2;by+=2){ bd.sQnE(bd.exnum(-1,by), this.qnumh[yy-by]);}
			for(var bx=bx1;bx<=d.x2;bx+=2){ bd.sQnE(bd.exnum(bx,-1), this.qnumw[bx]);}
			break;
		}
	}
},

Menu:{
	menufix : function(){
		this.addUseToFlags();
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	bdmargin       : 0.15,
	bdmargin_image : 0.10,

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
		this.vinc('excell_number', 'auto');

		var header = "ex_full_";
		var exlist = this.range.excells;
		for(var i=0;i<exlist.length;i++){
			var c = exlist[i], obj = bd.excell[c], key="excell_"+c;
			if(c>=bd.qcols+bd.qrows){ continue;}

			if(obj.bx===-1 && obj.by===-1){ continue;}
			var color = (obj.error!==1 ? this.fontcolor : this.fontErrcolor);
			var fontratio = (obj.qnum<10?0.8:0.7);
			this.dispnum(key, 1, ""+obj.qnum, fontratio, color, obj.px+this.bw, obj.py+this.bh);
		}
	},

	drawCircledNumbers_box : function(){
		var exlist = [];
		var x1=this.range.x1, y1=this.range.y1, x2=this.range.x2, y2=this.range.y2;
		if(x2>=bd.maxbx){ for(var by=(y1|1),max=Math.min(bd.maxby,y2);by<=max;by+=2){ exlist.push([bd.maxbx+1,by]);}}
		if(y2>=bd.maxby){ for(var bx=(x1|1),max=Math.min(bd.maxbx,x2);bx<=max;bx+=2){ exlist.push([bx,bd.maxby+1]);}}

		this.vinc('excell_circle', 'auto');
		var header = "ex2_cir_", rsize  = this.cw*0.36;
		g.fillStyle   = this.circledcolor;
		g.strokeStyle = this.cellcolor;
		for(var i=0;i<exlist.length;i++){
			var num = ((exlist[i][0]!==bd.maxbx+1 ? exlist[i][0] : exlist[i][1])+1)>>1;
			if(num<=0){ continue;}

			if(this.vnop([header,exlist[i][0],exlist[i][1]].join("_"),this.NONE)){
				g.shapeCircle(exlist[i][0]*this.bw, exlist[i][1]*this.bh, rsize);
			}
		}

		this.vinc('excell_number2', 'auto');
		var key = "ex2_cir_";
		for(var i=0;i<exlist.length;i++){
			var num = ((exlist[i][0]!==bd.maxbx+1 ? exlist[i][0] : exlist[i][1])+1)>>1;
			if(num<=0){ continue;}

			var key = [header,exlist[i][0],exlist[i][1]].join("_");
			var fontratio = (num<10?0.7:0.6);
			this.dispnum(key, 1, ""+num, fontratio, this.fontcolor, exlist[i][0]*this.bw, exlist[i][1]*this.bh);
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
		var cm="", ec=0, bstr = this.outbstr;
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
		var cm="";
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
		var item = this.getItemList(bd.qrows+1);
		for(var i=0;i<item.length;i++) {
			var ca = item[i];
			if(ca=="."){ continue;}

			var bx = i%(bd.qcols+1)*2-1, by = ((i/(bd.qcols+1))<<1)-1;
			var ec = bd.exnum(bx,by);
			if(ec!==null){
				bd.excell[ec].qnum = parseInt(ca);
			}

			var c = bd.cnum(bx,by);
			if(c!==null){
				if     (ca==="#"){ bd.cell[c].qans = 1;}
				else if(ca==="+"){ bd.cell[c].qsub = 1;}
			}
		}
	},
	encodeData : function(){
		for(var by=-1;by<bd.maxby;by+=2){
			for(var bx=-1;bx<bd.maxbx;bx+=2){
				var ec = bd.exnum(bx,by);
				if(ec!==null){
					this.datastr += (bd.excell[ec].qnum.toString()+" ");
					continue;
				}

				var c = bd.cnum(bx,by);
				if(c!==null){
					if     (bd.cell[c].qans===1){ this.datastr += "# ";}
					else if(bd.cell[c].qsub===1){ this.datastr += "+ ";}
					else                        { this.datastr += ". ";}
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
		var result = true;
		for(var ec=0;ec<bd.excellmax;ec++){
			var qn=bd.QnE(ec), bx=bd.excell[ec].bx, by=bd.excell[ec].by, val=0, clist=[];
			if(by===-1 && bx>0 && bx<2*bd.qcols){
				for(var y=1;y<2*bd.qrows;y+=2){
					var c = bd.cnum(bx,y);
					if(bd.cell[c].qans===1){ val+=((y+1)>>1);}
					clist.push(c);
				}
			}
			else if(bx===-1 && by>0 && by<2*bd.qrows){
				for(var x=1;x<2*bd.qcols;x+=2){
					var c = bd.cnum(x,by);
					if(bd.cell[c].qans===1){ val+=((x+1)>>1);}
					clist.push(c);
				}
			}
			else{ continue;}

			if(qn!==val){
				if(this.inAutoCheck){ return false;}
				bd.sErE([ec],1);
				bd.sErC(clist,1);
				result = false;
			}
		}
		return result;
	}
}
};
