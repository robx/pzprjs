//
// パズル固有スクリプト部 キンコンカン版 kinkonkan.js v3.4.0
//
pzprv3.custom.kinkonkan = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputedit : function(){
		if(this.mousestart){
			if(!this.clickexcell()){ this.inputborder();}
		}
		else if(this.mousemove){
			if(this.btn.Left){ this.inputborder();}
		}
		else if(this.mouseend){
			if(this.inputData==12){ bd.lightclear();}
		}
	},
	inputplay : function(){
		if(this.mousestart){
			this.inputslash();
		}
		else if(this.mousemove){
			if(this.inputData!==null){ this.inputslash();}
		}
		else if(this.mouseend){
			if(this.inputData==12){ bd.lightclear();}
		}
	},

	inputslash : function(){
		var cc = this.cellid();
		if(cc===null){ this.inputflash(); return;}

		if     (this.inputData===3){ bd.sQaC(cc,0); bd.sQsC(cc,1);}
		else if(this.inputData===4){ bd.sQaC(cc,0); bd.sQsC(cc,0);}
		else if(this.inputData!==null){ return;}
		else if(this.btn.Left){
			if     (bd.QaC(cc)===31){ bd.sQaC(cc,32); bd.sQsC(cc,0); this.inputData=2;}
			else if(bd.QaC(cc)===32){ bd.sQaC(cc, 0); bd.sQsC(cc,1); this.inputData=3;}
			else if(bd.QsC(cc)=== 1){ bd.sQaC(cc, 0); bd.sQsC(cc,0); this.inputData=4;}
			else                    { bd.sQaC(cc,31); bd.sQsC(cc,0); this.inputData=1;}
		}
		else if(this.btn.Right){
			if     (bd.QaC(cc)===31){ bd.sQaC(cc, 0); bd.sQsC(cc,0); this.inputData=4;}
			else if(bd.QaC(cc)===32){ bd.sQaC(cc,31); bd.sQsC(cc,0); this.inputData=1;}
			else if(bd.QsC(cc)=== 1){ bd.sQaC(cc,32); bd.sQsC(cc,0); this.inputData=2;}
			else                    { bd.sQaC(cc, 0); bd.sQsC(cc,1); this.inputData=3;}
		}

		pc.paintCellAround(cc);
	},
	inputflash : function(){
		var pos = this.borderpos(0), ec = bd.exnum(pos.x,pos.y)
		if(ec===null || this.mouseCell===ec){ return;}
		if(ec>=bd.excellmax-4){ return;}

		if(this.inputData!=11 && this.inputData!==null){ }
		else if(this.inputData===null && bd.excell[ec].qlight===1){ this.inputData=12;}
		else{
			bd.flashlight(ec);
			pc.paintAll();
			this.inputData=11;
		}
		this.mouseCell=ec;
	},
	clickexcell : function(){
		var ec = this.excellid();
		if(ec===null){ return false;}

		var ec0 = tc.getTEC();
		if(ec!==null && ec!=ec0){
			tc.setTEC(ec);
			pc.paintEXcell(ec);
			pc.paintEXcell(ec0);
		}
		else if(ec!==null && ec===ec0){
			if(bd.excell[ec].qlight!==1){ bd.flashlight(ec);}
			else{ bd.lightclear();}
			pc.paintAll();
		}

		this.btn.Left = false;
		return true;
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,
	moveTarget : function(ca){
		var cc0 = tc.getTEC(), tcp = tc.getTCP();
		var flag = true;

		if     (ca===this.KEYUP){
			if(tcp.y===tc.maxy && tc.minx<tcp.x && tcp.x<tc.maxx){ tc.pos.y=tc.miny;}
			else if(tcp.y>tc.miny){ tc.decTCY(2);}else{ flag=false;}
		}
		else if(ca===this.KEYDN){
			if(tcp.y===tc.miny && tc.minx<tcp.x && tcp.x<tc.maxx){ tc.pos.y=tc.maxy;}
			else if(tcp.y<tc.maxy){ tc.incTCY(2);}else{ flag=false;}
		}
		else if(ca===this.KEYLT){
			if(tcp.x===tc.maxx && tc.miny<tcp.y && tcp.y<tc.maxy){ tc.pos.x=tc.minx;}
			else if(tcp.x>tc.minx){ tc.decTCX(2);}else{ flag=false;}
		}
		else if(ca===this.KEYRT){
			if(tcp.x===tc.minx && tc.miny<tcp.y && tcp.y<tc.maxy){ tc.pos.x=tc.maxx;}
			else if(tcp.x<tc.maxx){ tc.incTCX(2);}else{ flag=false;}
		}
		else{ flag=false;}

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

		if('0'<=ca && ca<='9'){
			var num = parseInt(ca);

			if(bd.QnE(ec)<=0 || this.prev!=ec){
				if(num<=bd.maxnum){ bd.sQnE(ec,num);}
			}
			else{
				if(bd.QnE(ec)*10+num<=bd.maxnum){ bd.sQnE(ec,bd.QnE(ec)*10+num);}
				else if(num<=bd.maxnum){ bd.sQnE(ec,num);}
			}
		}
		else if(ca.length===1 && 'a'<=ca && ca<='z'){
			var num = parseInt(ca,36)-10;
			var canum = bd.DiE(ec);
			if     ((canum-1)%26==num && canum>0 && canum<79){ bd.sDiE(ec,canum+26);}
			else if((canum-1)%26==num){ bd.sDiE(ec,0);}
			else{ bd.sDiE(ec,num+1);}
		}
		else if(ca=='-'){
			if(bd.QnE(ec)!=-1){ bd.sQnE(ec,-1);}
			else              { bd.sQnE(ec,-1); bd.sDiE(ec,0);}
		}
		else if(ca=='F4'){
			if(bd.excell[ec].qlight!==1){ bd.flashlight(ec);}
			else{ bd.lightclear();}
			pc.paintAll();
		}
		else if(ca==' '){ bd.sQnE(ec,-1); bd.sDiE(ec,0);}
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
Cell:{
	qlight : 0,
	allclear : function(id,isrec){
		this.SuperFunc.allclear.call(this,id,isrec);
		this.qlight = 0;
	},
	ansclear : function(id){
		this.SuperFunc.ansclear.call(this,id);
		this.qlight = 0;
	},
	subclear : function(id){
		this.SuperFunc.subclear.call(this,id);
		this.qlight = 0;
	}
},

EXCell:{
	qlight : 0,
	allclear : function(id,isrec){
		this.SuperFunc.allclear.call(this,id,isrec);
		this.qlight = 0;
	},
	ansclear : function(id){
		this.SuperFunc.ansclear.call(this,id);
		this.qlight = 0;
	},
	subclear : function(id){
		this.SuperFunc.subclear.call(this,id);
		this.qlight = 0;
	}
},

Board:{
	qcols : 8,
	qrows : 8,

	isborder : 1,
	isexcell : 2,

	minnum : 0,

	errclear : function(isrepaint){
		this.SuperFunc.errclear.call(this,false);

		this.lightclear();
		pc.paintAll();
	},

	haslight : false,
	lightclear : function(){
		if(!this.haslight){ return;}
		for(var i=0;i<this.cellmax  ;i++){ this.cell[i].qlight=0;}
		for(var i=0;i<this.excellmax;i++){ this.excell[i].qlight=0;}
		this.haslight = false;
	},
	flashlight : function(ec){
		this.lightclear();
		this.searchLight(ec, true);
	},

	searchLight : function(startec, setlight){
		var ccnt=0, ldata = [];
		for(var c=0;c<this.cellmax;c++){ ldata[c]=0;}

		var pos = this.excell[startec].getaddr(), dir=0;
		if     (pos.y===this.minby+1){ dir=2;}
		else if(pos.y===this.maxby-1){ dir=1;}
		else if(pos.x===this.minbx+1){ dir=4;}
		else if(pos.x===this.maxbx-1){ dir=3;}

		while(dir!==0){
			pos.move(dir);
			pos.move(dir);

			var cc = pos.cellid();
			if(cc===null){ break;}

			var qb = this.QaC(cc);
			if(qb===31){
				if     (dir===1){ ldata[cc]=(!isNaN({4:1,1:1}[ldata[cc]])?1:2); dir=3;}
				else if(dir===2){ ldata[cc]=(!isNaN({2:1,1:1}[ldata[cc]])?1:4); dir=4;}
				else if(dir===3){ ldata[cc]=(!isNaN({2:1,1:1}[ldata[cc]])?1:4); dir=1;}
				else if(dir===4){ ldata[cc]=(!isNaN({4:1,1:1}[ldata[cc]])?1:2); dir=2;}
			}
			else if(qb===32){
				if     (dir===1){ ldata[cc]=(!isNaN({5:1,1:1}[ldata[cc]])?1:3); dir=4;}
				else if(dir===2){ ldata[cc]=(!isNaN({3:1,1:1}[ldata[cc]])?1:5); dir=3;}
				else if(dir===3){ ldata[cc]=(!isNaN({5:1,1:1}[ldata[cc]])?1:3); dir=2;}
				else if(dir===4){ ldata[cc]=(!isNaN({3:1,1:1}[ldata[cc]])?1:5); dir=1;}
			}
			else if(cc!==null){ ldata[cc]=1; continue;}

			ccnt++;
			if(ccnt>this.cellmax){ break;} // 念のためガード条件(多分引っかからない)
		}

		var destec = pos.excellid();
		if(!!setlight){
			for(var c=0;c<this.excellmax;c++){ this.excell[c].qlight=0;}
			this.excell[startec].qlight = 1;
			this.excell[destec].qlight  = 1;
			for(var c=0;c<this.cellmax;c++){ this.cell[c].qlight=ldata[c];}
			this.haslight = true;
		}

		return {cnt:ccnt, dest:destec};
	}
},

AreaManager:{
	hasroom : true
},

MenuExec:{
	adjustBoardData : function(key,d){
		if(key & this.TURNFLIP){ // 反転・回転全て
			for(var c=0;c<bd.cellmax;c++){ bd.sQaC(c,{0:0,31:32,32:31}[bd.QaC(c)]);}
		}
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	bdmargin       : 0.15,
	bdmargin_image : 0.10,

	setColors : function(){
		this.gridcolor = this.gridcolor_LIGHT;
		this.errcolor1 = this.cellcolor; // drawSlashes関係
		this.errcolor2 = this.cellcolor; // drawSlashes関係

		this.errbcolor2 = "rgb(255, 255, 127)";
		this.dotcolor = this.dotcolor_PINK;
	},
	paint : function(){
		this.drawBGCells_kinkonkan();
		this.drawDotCells(true);

		this.drawGrid();
		this.drawBorders();

		this.drawSlashes();

		this.drawBGEXcells();
		this.drawNumbers_kinkonkan();
		this.drawChassis();

		this.drawTarget();
	},

	drawBGCells_kinkonkan : function(){
		var g = this.vinc('cell_back', 'crispEdges');

		var headers = ["c_full_", "c_tri2_", "c_tri3_", "c_tri4_", "c_tri5_"];
		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var c = clist[i], err = bd.cell[c].error, ql = bd.cell[c].qlight;
			if(err!==0 || ql!==0){
				if     (err==1){ g.fillStyle = this.errbcolor1;}
				else if(ql > 0){ g.fillStyle = this.errbcolor2;}
				if(err===1 || ql===1){
					if(this.vnop(headers[0]+c,this.FILL)){
						g.fillRect(this.cell[c].px, this.cell[c].py, this.cw, this.ch);
					}
				}
				else{ this.drawTriangle1(this.cell[c].px, this.cell[c].py, ql, headers[ql-1]+c);}
			}
			else{ this.vhide([headers[0]+c, headers[1]+c, headers[2]+c, headers[3]+c, headers[4]+c, headers[5]+c]);}
		}
	},

	getBGEXcellColor : function(excell){
		if(excell.qlight===1){ return this.errbcolor2;}
		return null;
	},
	drawNumbers_kinkonkan : function(){
		var g = this.vinc('excell_number', 'auto');

		var header = "ex_full_";
		var exlist = this.range.excells;
		for(var i=0;i<exlist.length;i++){
			var c = exlist[i], obj = bd.excell[c], key = 'excell_'+c;

			if(obj.qdir!==0 || obj.qnum!==-1){
				var num=obj.qnum, canum=obj.qdir;

				var color = this.fontErrcolor;
				if(obj.error!==1){ color=(canum<=52?this.fontcolor:this.fontAnscolor);}

				var fontratio = 0.66;
				if(canum>0&&num>=10){ fontratio = 0.55;}

				var text="";
				if     (canum> 0&&canum<= 26){ text+=(canum+ 9).toString(36).toUpperCase();}
				else if(canum>26&&canum<= 52){ text+=(canum-17).toString(36).toLowerCase();}
				else if(canum>52&&canum<= 78){ text+=(canum-43).toString(36).toUpperCase();}
				else if(canum>78&&canum<=104){ text+=(canum-69).toString(36).toLowerCase();}
				if(num>=0){ text+=num.toString(10);}

				var px = this.excell[c].rpx + this.bw, py = this.excell[c].rpy + this.bh;
				this.dispnum(key, 1, text, fontratio, color, px, py);
			}
			else{ this.hideEL(key);}
		}
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		this.decodeBorder();
		this.decodeKinkonkan();
	},
	pzlexport : function(type){
		this.encodeBorder();
		this.encodeKinkonkan();
	},

	decodeKinkonkan : function(){
		// 盤面外数字のデコード
		var subint = [];
		var ec=0, a=0, bstr = this.outbstr;
		for(var i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i), obj=bd.excell[ec];

			if     (this.include(ca,'A','Z')){ subint.push(ec); obj.qdir = parseInt(ca,36)-9;}
			else if(this.include(ca,'0','9')){ subint.push(ec); obj.qdir = parseInt(ca,36)-9+(parseInt(bstr.charAt(i+1))+1)*26; i++;}
			else if(this.include(ca,'a','z')){ ec+=(parseInt(ca,36)-10);}

			ec++;
			if(ec>=bd.excellmax-4){ a=i+1; break;}
		}
		ec=0;
		for(var i=a;i<bstr.length;i++){
			var ca = bstr.charAt(i), obj=bd.excell[subint[ec]];
			if     (ca==='.'){ obj.qnum = -2;}
			else if(ca==='-'){ obj.qnum = parseInt(bstr.substr(i+1,2),16); i+=2;}
			else             { obj.qnum = parseInt(bstr.substr(i  ,1),16);}

			ec++;
			if(ec>=subint.length){ a=i+1; break;}
		}

		this.outbstr = bstr.substr(a);
	},
	encodeKinkonkan : function(){
		var cm="", cm2="";

		// 盤面外部分のエンコード
		var count=0;
		for(var ec=0;ec<bd.excellmax-4;ec++){
			var pstr = "", val = bd.excell[ec].qdir, qnum = bd.excell[ec].qnum;

			if(val> 0 && val<=104){
				if(val<=26){ pstr = (val+9).toString(36).toUpperCase();}
				else       { pstr = (((val-1)/26-1)|0).toString() + ((val-1)%26+10).toString(16).toUpperCase();}

				if     (qnum==-2){ cm2+=".";}
				else if(qnum <16){ cm2+=("" +qnum.toString(16));}
				else             { cm2+=("-"+qnum.toString(16));}
			}
			else{ count++;}

			if(count===0){ cm += pstr;}
			else if(pstr || count===26){ cm+=((9+count).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm+=(9+count).toString(36);}

		this.outbstr += (cm+cm2);
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeAreaRoom();

		var item = this.getItemList(bd.qrows+2);
		for(var i=0;i<item.length;i++) {
			var ca = item[i];
			if(ca==="."){ continue;}

			var bx = i%(bd.qcols+2)*2-1, by = ((i/(bd.qcols+2))<<1)-1;
			var ec = bd.exnum(bx,by);
			if(ec!==null){
				var inp = ca.split(",");
				if(inp[0]!==""){ bd.excell[ec].qdir = parseInt(inp[0]);}
				if(inp[1]!==""){ bd.excell[ec].qnum = parseInt(inp[1]);}
				continue;
			}

			if(this.filever==1){
				var c = bd.cnum(bx,by);
				if(c!==null){
					if     (ca==="+"){ bd.cell[c].qsub = 1;}
					else if(ca==="1"){ bd.cell[c].qans = 31;}
					else if(ca==="2"){ bd.cell[c].qans = 32;}
				}
			}
		}

		if(this.filever==0){
			this.decodeCell( function(obj,ca){
				if     (ca==="+"){ obj.qsub = 1;}
				else if(ca==="1"){ obj.qans = 31;}
				else if(ca==="2"){ obj.qans = 32;}
			});
		}
	},
	encodeData : function(){
		this.filever = 1;
		this.encodeAreaRoom();

		for(var by=-1;by<bd.maxby;by+=2){
			for(var bx=-1;bx<bd.maxbx;bx+=2){
				var ec = bd.exnum(bx,by);
				if(ec!==null){
					var dir=bd.excell[ec].qdir, qn=bd.excell[ec].qnum;
					var str1 = (dir!== 0?dir.toString():"");
					var str2 = (qn !==-1?qn.toString():"");
					this.datastr += ((str1=="" && str2=="")?(". "):(""+str1+","+str2+" "));
					continue;
				}

				var c = bd.cnum(bx,by);
				if(c!==null){
					if     (bd.cell[c].qans===31){ this.datastr += "1 ";}
					else if(bd.cell[c].qans===32){ this.datastr += "2 ";}
					else if(bd.cell[c].qsub=== 1){ this.datastr += "+ ";}
					else                         { this.datastr += ". ";}
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

		var rinfo = bd.areas.getRoomInfo();
		if( !this.checkAllBlock(rinfo, function(c){ return bd.QaC(c)!==0;}, function(w,h,a,n){ return (a<=1);}) ){
			this.setAlert('斜線が複数引かれた部屋があります。', 'A room has plural mirrors.'); return false;
		}

		if( !this.checkMirrors(1) ){
			this.setAlert('光が同じ文字の場所へ到達しません。', 'Beam from a light doesn\'t reach one\'s pair.'); return false;
		}

		if( !this.checkMirrors(2) ){
			this.setAlert('光の反射回数が正しくありません。', 'The count of refrection is wrong.'); return false;
		}

		if( !this.checkAllBlock(rinfo, function(c){ return bd.QaC(c)!==0;}, function(w,h,a,n){ return (a!=0);}) ){
			this.setAlert('斜線の引かれていない部屋があります。', 'A room has no mirrors.'); return false;
		}

		return true;
	},

	checkMirrors : function(type){
		var d = [];
		for(var ec=0;ec<bd.excellmax-4;ec++){
			if(!isNaN(d[ec]) || bd.QnE(ec)==-1 || bd.DiE(ec)==0){ continue;}
			var ret = bd.searchLight(ec, (!this.inAutoCheck));
			if( (type==1&& (bd.DiE(ec)!=bd.DiE(ret.dest)) )||
				(type==2&&((bd.QnE(ec)!=bd.QnE(ret.dest)) || bd.QnE(ec)!=ret.cnt))
			){
				return false;
			}
			d[ec]=1; d[ret.dest]=1;
		}
		return true;
	}
}
};
