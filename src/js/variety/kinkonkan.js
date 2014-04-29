//
// パズル固有スクリプト部 キンコンカン版 kinkonkan.js v3.4.1
//
pzpr.classmgr.makeCustom(['kinkonkan'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.owner.playmode){
			if(this.mousestart){
				this.inputslash();
			}
			else if(this.mousemove){
				if(this.inputData!==null){ this.inputslash();}
			}
		}
		else if(this.owner.editmode){
			if(this.mousestart){
				this.input_onstart();
			}
			else if(this.mousemove){
				if(this.btn.Left){ this.inputborder();}
			}
		}
		
		if(this.mouseend){
			if(this.inputData==12){ this.owner.board.lightclear();}
		}
	},

	inputslash : function(){
		var cell = this.getcell();
		if(cell.isnull){ this.inputflash(); return;}

		if     (this.inputData===3){ cell.setQans(0); cell.setQsub(1);}
		else if(this.inputData===4){ cell.setQans(0); cell.setQsub(0);}
		else if(this.inputData!==null){ return;}
		else if(this.btn.Left){
			if     (cell.getQans()===31){ cell.setQans(32); cell.setQsub(0); this.inputData=2;}
			else if(cell.getQans()===32){ cell.setQans(0);  cell.setQsub(1); this.inputData=3;}
			else if(cell.getQsub()=== 1){ cell.setQans(0);  cell.setQsub(0); this.inputData=4;}
			else                        { cell.setQans(31); cell.setQsub(0); this.inputData=1;}
		}
		else if(this.btn.Right){
			if     (cell.getQans()===31){ cell.setQans(0);  cell.setQsub(0); this.inputData=4;}
			else if(cell.getQans()===32){ cell.setQans(31); cell.setQsub(0); this.inputData=1;}
			else if(cell.getQsub()=== 1){ cell.setQans(32); cell.setQsub(0); this.inputData=2;}
			else                        { cell.setQans(0);  cell.setQsub(1); this.inputData=3;}
		}

		cell.drawaround();
	},
	inputflash : function(){
		var excell = this.getpos(0).getex();
		if(excell.isnull || this.mouseCell===excell){ return;}
		if(excell.id>=this.owner.board.excellmax-4){ return;}

		if(this.inputData!=11 && this.inputData!==null){ }
		else if(this.inputData===null && excell.qlight===1){ this.inputData=12;}
		else{
			this.owner.board.flashlight(excell.id);
			this.owner.redraw();
			this.inputData=11;
		}
		this.mouseCell = excell;
	},
	input_onstart : function(){
		var obj = this.getcell_excell();
		if(obj.isnull){ return;}

		if(obj.group!=='excell'){
			this.inputborder();
		}
		else if(obj!==this.cursor.getobj()){
			this.setcursor(obj);
			this.mousereset();
		}
		else{
			var excell = obj;
			if(excell.qlight!==1){ this.owner.board.flashlight(excell.id);}
			else{ this.owner.board.lightclear();}
			this.owner.redraw();

			this.mousereset();
		}
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,
	moveTarget : function(ca){
		var cursor = this.cursor;
		var excell0 = cursor.getex(), flag = true, dir = excell0.NDIR;

		if     (ca===this.KEYUP){
			if(cursor.by===cursor.maxy && cursor.minx<cursor.bx && cursor.bx<cursor.maxx){ cursor.by=cursor.miny;}
			else if(cursor.by>cursor.miny){ dir=excell0.UP;}else{ flag=false;}
		}
		else if(ca===this.KEYDN){
			if(cursor.by===cursor.miny && cursor.minx<cursor.bx && cursor.bx<cursor.maxx){ cursor.by=cursor.maxy;}
			else if(cursor.by<cursor.maxy){ dir=excell0.DN;}else{ flag=false;}
		}
		else if(ca===this.KEYLT){
			if(cursor.bx===cursor.maxx && cursor.miny<cursor.by && cursor.by<cursor.maxy){ cursor.bx=cursor.minx;}
			else if(cursor.bx>cursor.minx){ dir=excell0.LT;}else{ flag=false;}
		}
		else if(ca===this.KEYRT){
			if(cursor.bx===cursor.minx && cursor.miny<cursor.by && cursor.by<cursor.maxy){ cursor.bx=cursor.maxx;}
			else if(cursor.bx<cursor.maxx){ dir=excell0.RT;}else{ flag=false;}
		}
		else{ flag=false;}

		if(flag){
			if(dir!==excell0.NDIR){ cursor.movedir(dir,2);}

			excell0.draw();
			cursor.draw();
			this.stopEvent();	/* カーソルを移動させない */
		}
		return flag;
	},

	keyinput : function(ca){
		this.key_inputexcell(ca);
	},
	key_inputexcell : function(ca){
		var excell = this.cursor.getex(), bd = this.owner.board;
		if((excell.bx===bd.minbx+1||excell.bx===bd.maxbx-1)&&
		   (excell.by===bd.minby+1||excell.by===bd.maxby-1)){ return;}

		var qn = excell.getQnum();
		if('0'<=ca && ca<='9'){
			var num = parseInt(ca);

			if(qn<=0 || this.prev!==excell){
				if(num<=excell.maxnum){ excell.setQnum(num);}
			}
			else{
				if(qn*10+num<=excell.maxnum){ excell.setQnum(qn*10+num);}
				else if (num<=excell.maxnum){ excell.setQnum(num);}
			}
		}
		else if(ca.length===1 && 'a'<=ca && ca<='z'){
			var num = parseInt(ca,36)-10;
			var canum = excell.getQchar();
			if     ((canum-1)%26==num && canum>0 && canum<79){ excell.setQchar(canum+26);}
			else if((canum-1)%26==num){ excell.setQchar(0);}
			else{ excell.setQchar(num+1);}
		}
		else if(ca=='-'){
			if(qn!==-1){ excell.setQnum(-1);}
			else       { excell.setQnum(-1); excell.setQchar(0);}
		}
		else if(ca=='F4'){
			if(excell.qlight!==1){ this.owner.board.flashlight(excell.id);}
			else{ this.owner.board.lightclear();}
			this.owner.redraw();
		}
		else if(ca==' '){ excell.setQnum(-1); excell.setQchar(0);}
		else{ return;}

		this.prev = excell;
		this.cursor.draw();
	}
},

TargetCursor:{
	initCursor : function(){
		this.init(-1,-1);
	}
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	qlight : 0,
	propinfo : ['error', 'qinfo', 'qlight'],
	propnorec : { color:1, error:1, qinfo:1, qlight:1 }
},

EXCell:{
	qlight : 0,
	propinfo : ['error', 'qinfo', 'qlight'],
	propnorec : { color:1, error:1, qinfo:1, qlight:1 },

	minnum : 0
},

Board:{
	qcols : 8,
	qrows : 8,

	hasborder : 1,
	hasexcell : 2,

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
		if     (pos.by===this.minby+1){ dir=2;}
		else if(pos.by===this.maxby-1){ dir=1;}
		else if(pos.bx===this.minbx+1){ dir=4;}
		else if(pos.bx===this.maxbx-1){ dir=3;}

		while(dir!==0){
			pos.movedir(dir,2);

			var cell = pos.getc();
			if(cell.isnull){ break;}

			var qb = cell.getQans(), cc = cell.id;
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
			else{ ldata[cc]=1; continue;}

			ccnt++;
			if(ccnt>this.cellmax){ break;} // 念のためガード条件(多分引っかからない)
		}

		var destec = pos.getex().id;
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
BoardExec:{
	adjustBoardData : function(key,d){
		var bd = this.owner.board;
		if(key & this.TURNFLIP){ // 反転・回転全て
			var clist = this.owner.board.cell;
			for(var i=0;i<clist.length;i++){
				var cell = clist[i];
				cell.setQans({0:0,31:32,32:31}[cell.getQans()]);
			}
		}
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

		this.gridcolor = this.gridcolor_LIGHT;
		this.errcolor1 = this.cellcolor; // drawSlashes関係
		this.errcolor2 = this.cellcolor; // drawSlashes関係

		this.lightcolor = "rgb(255, 255, 127)";
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
			var cell = clist[i], id = cell.id, err = cell.error, ql = cell.qlight;
			if(err!==0 || ql!==0){
				if     (err==1){ g.fillStyle = this.errbcolor1;}
				else if(ql > 0){ g.fillStyle = this.lightcolor;}
				var px = cell.bx*this.bw, py = cell.by*this.bh;
				if(err===1 || ql===1){
					if(this.vnop(headers[0]+id,this.FILL)){
						g.fillRectCenter(px, py, this.bw+0.5, this.bh+0.5);
					}
				}
				else{ this.drawTriangle1(px, py, ql, headers[ql-1]+id);}
			}
			else{ g.vhide([headers[0]+id, headers[1]+id, headers[2]+id, headers[3]+id, headers[4]+id, headers[5]+id]);}
		}
	},

	getBGEXcellColor : function(excell){
		if(excell.qlight===1){ return this.lightcolor;}
		return null;
	},
	drawNumbers_kinkonkan : function(){
		var g = this.vinc('excell_number', 'auto');

		var header = "ex_full_";
		var exlist = this.range.excells;
		for(var i=0;i<exlist.length;i++){
			var excell = exlist[i], num=excell.qnum, canum=excell.qchar;
			var px = excell.bx*this.bw, py = excell.by*this.bh;
			var text = "";
			if(canum===0 && num===-1){}
			else if(canum> 0&&canum<= 26){ text+=(canum+ 9).toString(36).toUpperCase();}
			else if(canum>26&&canum<= 52){ text+=(canum-17).toString(36).toLowerCase();}
			else if(canum>52&&canum<= 78){ text+=(canum-43).toString(36).toUpperCase();}
			else if(canum>78&&canum<=104){ text+=(canum-69).toString(36).toLowerCase();}
			if(num>=0){ text+=num.toString(10);}

			var option = { key:"excell_text_"+excell.id };
			option.color = this.fontErrcolor;
			if(excell.error!==1){ option.color = (canum<=52 ? this.fontcolor : this.fontAnscolor);}
			option.ratio = ((canum===0||num<10) ? [0.66] : [0.55]);
			this.disptext(text, px, py, option);
		}
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodeBorder();
		this.decodeKinkonkan();
	},
	encodePzpr : function(type){
		this.encodeBorder();
		this.encodeKinkonkan();
	},

	decodeKinkonkan : function(){
		// 盤面外数字のデコード
		var subint = [];
		var ec=0, a=0, bstr = this.outbstr, bd = this.owner.board;
		for(var i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i), obj=bd.excell[ec];

			if     (this.include(ca,'A','Z')){ subint.push(ec); obj.qchar = parseInt(ca,36)-9;}
			else if(this.include(ca,'0','9')){ subint.push(ec); obj.qchar = parseInt(ca,36)-9+(parseInt(bstr.charAt(i+1))+1)*26; i++;}
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
		var cm="", cm2="", bd = this.owner.board;

		// 盤面外部分のエンコード
		var count=0;
		for(var ec=0;ec<bd.excellmax-4;ec++){
			var pstr = "", val = bd.excell[ec].qchar, qnum = bd.excell[ec].qnum;

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

		var bd = this.owner.board, item = this.getItemList(bd.qrows+2);
		for(var i=0;i<item.length;i++) {
			var ca = item[i];
			if(ca==="."){ continue;}

			var bx = i%(bd.qcols+2)*2-1, by = ((i/(bd.qcols+2))<<1)-1;
			var excell = bd.getex(bx,by);
			if(!excell.isnull){
				var inp = ca.split(",");
				if(inp[0]!==""){ excell.qchar = parseInt(inp[0]);}
				if(inp[1]!==""){ excell.qnum  = parseInt(inp[1]);}
				continue;
			}

			if(this.filever==1){
				var cell = bd.getc(bx,by);
				if(!cell.isnull){
					if     (ca==="+"){ cell.qsub = 1;}
					else if(ca==="1"){ cell.qans = 31;}
					else if(ca==="2"){ cell.qans = 32;}
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

		var bd = this.owner.board;
		for(var by=-1;by<bd.maxby;by+=2){
			for(var bx=-1;bx<bd.maxbx;bx+=2){
				var excell = bd.getex(bx,by);
				if(!excell.isnull){
					var dir=excell.qchar, qn=excell.qnum;
					var str1 = (dir!== 0?dir.toString():"");
					var str2 = (qn !==-1?qn.toString():"");
					this.datastr += ((str1=="" && str2=="")?(". "):(""+str1+","+str2+" "));
					continue;
				}

				var cell = bd.getc(bx,by);
				if(!cell.isnull){
					if     (cell.qans===31){ this.datastr += "1 ";}
					else if(cell.qans===32){ this.datastr += "2 ";}
					else if(cell.qsub=== 1){ this.datastr += "+ ";}
					else                   { this.datastr += ". ";}
					continue;
				}

				this.datastr += ". ";
			}
			this.datastr += "\n";
		}
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		var rinfo = this.owner.board.getRoomInfo();
		if( !this.checkNoPluralMirrorsInRoom(rinfo) ){ return 'bkObjGe2';}
		if( !this.checkMirrors(1) ){ return 'pairedLetterNe';}
		if( !this.checkMirrors(2) ){ return 'pairedNumberNe'}
		if( !this.checkExistMirrorInRoom(rinfo) ){ return 'bkNoObj';}

		return null;
	},

	checkNoPluralMirrorsInRoom : function(rinfo){
		return this.checkAllBlock(rinfo, function(cell){ return cell.getQans()!==0;}, function(w,h,a,n){ return (a<=1);});
	},
	checkExistMirrorInRoom : function(rinfo){
		return this.checkAllBlock(rinfo, function(cell){ return cell.getQans()!==0;}, function(w,h,a,n){ return (a!=0);});
	},

	checkMirrors : function(type){
		var d = [], bd = this.owner.board;
		for(var ec=0;ec<bd.excellmax-4;ec++){
			var excell = bd.excell[ec];
			if(!isNaN(d[ec]) || excell.getQnum()===-1 || excell.getQchar()===0){ continue;}
			var ret = bd.searchLight(excell.id, (!this.checkOnly)), excell2 = bd.excell[ret.dest];
			if( (type==1&& (excell.getQchar()!==excell2.getQchar()) )||
				(type==2&&((excell.getQnum() !==excell2.getQnum()) || excell.getQnum()!==ret.cnt))
			){
				return false;
			}
			d[ec]=1; d[ret.dest]=1;
		}
		return true;
	}
},

FailCode:{
	bkNoObj  : ["斜線の引かれていない部屋があります。", "A room has no mirrors."],
	bkObjGe2 : ["斜線が複数引かれた部屋があります。", "A room has plural mirrors."],
	pairedLetterNe : ["光が同じ文字の場所へ到達しません。", "Beam from a light doesn't reach one's pair."],
	pairedNumberNe : ["光の反射回数が正しくありません。", "The count of refrection is wrong."]
}
});
