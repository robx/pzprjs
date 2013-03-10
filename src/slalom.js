//
// パズル固有スクリプト部 スラローム版 slalom.js v3.4.0
//
(function(){

var k = pzprv3.consts;

pzprv3.createCustoms('slalom', {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputedit : function(){
		if(this.mousestart || this.mousemove){ this.inputGate();}
		else if(this.mouseend){
			if(this.inputData==10){ this.inputStartid();}
			else if(this.notInputted()){ this.inputGate_end();}
		}
	},
	inputplay : function(){
		if(this.mousestart || this.mousemove){
			if     (this.btn.Left) { this.inputLine();}
			else if(this.btn.Right){ this.inputpeke();}
		}
		else if(this.mouseend && this.notInputted()){
			if(this.btn.Left){ this.inputpeke();}
		}
	},
	inputRed : function(){ this.dispRedLine();},

	inputGate_end : function(){
		var cell = this.getcell();
		if(cell.isnull){ return;}

		if(cell!==this.cursor.getTCC()){
			this.setcursor(cell);
		}
		else{
			this.inputGate_end_main(cell);
		}
	},
	inputGate_end_main : function(cell){
		if     (this.btn.Left ){ cell.setQues({0:1,1:21,21:22,22:0}[cell.getQues()]);}
		else if(this.btn.Right){ cell.setQues({0:22,22:21,21:1,1:0}[cell.getQues()]);}
		cell.setNum(-1);
		this.owner.board.hinfo.generateGates();

		cell.draw();
		this.owner.board.startcell.draw();
	},

	inputStartid : function(){
		this.inputData = null;
		var st = this.owner.board.startcell;
		st.draw();
		if(this.firstCell!==st){
			var cell0 = this.firstCell;
			this.owner.opemgr.addOpe_Startpos(cell0.bx,cell0.by, st.bx,st.by);
		}
	},
	inputGate : function(){
		var cell = this.getcell();
		if(cell.isnull){ return;}

		var pos = cell.getaddr();
		var input=false, bd = this.owner.board;

		// 初回はこの中に入ってきます。
		if(this.mouseCell.isnull){
			if(cell===bd.startcell){ this.inputData=10; input=true;}
			else{ this.firstPoint.set(this.inputPoint);}
		}
		// 黒マス上なら何もしない
		else if(cell.getQues()===1){ }
		// startposの入力中の場合
		else if(this.inputData==10){
			if(cell!==this.mouseCell){
				if(this.firstCell.isnull){ this.firstCell = this.mouseCell;}
				var cell0 = bd.startcell;
				bd.startcell = cell;
				cell0.draw();
				input=true;
			}
		}
		// まだ入力されていない(1つめの入力の)場合
		else if(this.inputData===null){
			if(cell===this.mouseCell){
				var mx=Math.abs(this.inputPoint.px-this.firstPoint.px);
				var my=Math.abs(this.inputPoint.py-this.firstPoint.py);
				if     (my>=8){ this.inputData=21; input=true;}
				else if(mx>=8){ this.inputData=22; input=true;}
			}
			else{
				var dir = this.getdir(this.prevPos, pos);
				if     (dir===k.UP || dir===k.DN){ this.inputData=21; input=true;}
				else if(dir===k.LT || dir===k.RT){ this.inputData=22; input=true;}
			}

			if(input){
				if(cell.getQues()===this.inputData){ this.inputData=0;}
				this.firstPoint.reset();
			}
		}
		// 入力し続けていて、別のマスに移動した場合
		else if(cell!==this.mouseCell){
			if(this.inputData==0){ this.inputData=0; input=true;}
			else{
				var dir = this.getdir(this.prevPos, pos);
				if     (dir===k.UP || dir===k.DN){ this.inputData=21; input=true;}
				else if(dir===k.LT || dir===k.RT){ this.inputData=22; input=true;}
			}
		}

		// 描画・後処理
		if(input){
			if(this.inputData!==10){ cell.setQues(this.inputData);}
			bd.hinfo.generateGates();

			cell.draw();
			bd.startcell.draw();
		}
		this.prevPos   = pos;
		this.mouseCell = cell;
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,
	enableplay : true,
	moveTarget : function(ca){
		if(this.owner.editmode && ca!='x'){ return this.moveTCell(ca);}
		return false;
	},

	keyinput : function(ca){
		if(ca=='x'){ this.owner.painter.drawNumbersOnGate(true); return;}
		this.key_inputqnum_slalom(ca);
	},
	key_inputqnum_slalom : function(ca){
		var cell = this.cursor.getTCC(), bd = this.owner.board;

		if(ca=='q'||ca=='w'||ca=='e'||ca=='r'||ca=='s'||ca==' '){
			var old=cell.getQues(), newques=-1;
			if     (ca=='q'){ newques=(old!=1?1:0);}
			else if(ca=='w'){ newques=21;}
			else if(ca=='e'){ newques=22;}
			else if(ca=='r'||ca==' '){ newques= 0;}
			else if(ca=='s'){ bd.inputstartid(cell);}
			else{ return;}
			if(old==newques){ return;}

			if(newques!==-1){
				cell.setQues(newques);
				if(newques==0){ cell.setNum(-1);}
				if(old==21||old==22||newques==21||newques==22){ bd.hinfo.generateGates();}

				cell.draw();
				bd.startcell.draw();
			}
		}
		else if(cell.getQues()===1){
			this.key_inputqnum(ca);
		}
	},
	keyup : function(ca){
		if(ca=='x'){ this.owner.painter.drawNumbersOnGate(false);}
	},

	enablemake_p : true,
	generate : function(mode,type){
		this.imgCR = [4,1];
		this.inputcol('image','knumq','q',[0,0]);
		this.inputcol('image','knums','s',[1,0]);
		this.inputcol('image','knumw','w',[2,0]);
		this.inputcol('image','knume','e',[3,0]);
		this.inputcol('num','knumr','r',' ');
		this.insertrow();
		this.inputcol('num','knum1','1','1');
		this.inputcol('num','knum2','2','2');
		this.inputcol('num','knum3','3','3');
		this.inputcol('num','knum4','4','4');
		this.inputcol('num','knum5','5','5');
		this.insertrow();
		this.inputcol('num','knum6','6','6');
		this.inputcol('num','knum7','7','7');
		this.inputcol('num','knum8','8','8');
		this.inputcol('num','knum9','9','9');
		this.inputcol('num','knum0','0','0');
		this.insertrow();
		this.inputcol('num','knum.','-','-');
		this.inputcol('num','knum_',' ',' ');
		this.insertrow();
	}
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	disInputHatena : true,

	nummaxfunc : function(){
		return Math.min(this.owner.board.hinfo.max, this.maxnum);
	}
},
Border:{
	enableLineNG : true
},
Board:{
	isborder : 1,

	hinfo : null,

	initialize2 : function(){
		this.SuperFunc.initialize2.call(this);
		this.hinfo = this.owner.newInstance('HurdleManager');
	},
	initBoardSize : function(col,row){
		this.SuperFunc.initBoardSize.call(this,col,row);

		this.startcell = this.emptycell;
		this.hinfo.init();
	},

	startcell : null,
	inputstartid : function(cell){
		if(cell!==this.startcell){
			var cell0 = this.startcell;
			this.owner.opemgr.addOpe_Startpos(cell0.bx,cell0.by, cell.bx,cell.by);

			this.startcell = cell;
			cell0.draw();
			cell.draw();
		}
	},

	posinfo : {},
	adjustBoardData : function(key,d){
		if(key & k.TURN){
			var tques={21:22,22:21};
			var clist = this.cellinside(d.x1,d.y1,d.x2,d.y2);
			for(var i=0;i<clist.length;i++){
				var cell = clist[i];
				var val=tques[cell.getQues()]; if(!!val){ cell.setQues(val);}
			}
		}

		this.posinfo = this.getAfterPos(key,d,this.startcell);
	},
	adjustBoardData2 : function(key,d){
		var info = this.posinfo;
		this.startcell = this.getc(info.bx2, info.by2);

		var opemgr = this.owner.opemgr;
		if((key & k.REDUCE) && !opemgr.undoExec && !opemgr.redoExec){
			opemgr.forceRecord = true;
			if(info.isdel){
				opemgr.addOpe_Startpos(info.bx1,info.by1, info.bx2,info.by2);
			}
			opemgr.forceRecord = false;
		}

		this.hinfo.generateGates();	// 念のため
	}
},

"StartposOperation:Operation":{
	setData : function(x1, y1, x2, y2){
		this.bx1 = x1;
		this.by1 = y1;
		this.bx2 = x2;
		this.by2 = y2;
	},
	decode : function(str){
		if(strs[0]!=='PS'){ return false;}
		this.bx1 = +strs[1];
		this.by1 = +strs[2];
		this.bx2 = +strs[3];
		this.by2 = +strs[4];
		return true;
	},
	toString : function(){
		return ['PS', this.bx1, this.by1, this.bx2, this.by2].join(',');
	},

	undo : function(){ this.exec(this.bx1, this.by1);},
	redo : function(){ this.exec(this.bx2, this.by2);},
	exec : function(bx, by){
		var bd = this.owner.board, cell = bd.getc(bx, by), cell0;
		cell0 = bd.startcell; bd.startcell = cell;
		cell0.draw();
		cell.draw();
	}
},

OperationManager:{
	addOpe_Startpos : function(x1, y1, x2, y2){
		// 操作を登録する
		this.addOpe_common(function(){
			var ope = this.owner.newInstance('StartposOperation');
			ope.setData(x1, y1, x2, y2);
			return ope;
		});
	},
	decodeOpe : function(strs){
		var ope = this.owner.newInstance('StartposOperation');
		if(ope.decode(strs)){ return ope;}

		return this.SuperFunc.decodeOpe.call(this, strs);
	}
},

LineManager:{
	isCenterLine : true
},

Properties:{
	flag_redline : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	irowake : 1,

	setColors : function(){
		this.gridcolor = this.gridcolor_LIGHT;
		this.linecolor = "rgb(32, 32, 255)";	// 色分けなしの場合
		this.pekecolor = "rgb(0, 160, 0)";
		this.errlinebgcolor = "rgb(160, 150, 255)";
		this.errbcolor1 = this.errbcolor1_DARK;
		this.fontcolor = this.fontErrcolor = "white";
	},
	paint : function(){
		this.drawBGCells();
		this.drawGrid();

		this.drawGates()

		this.drawBlackCells();
		this.drawNumbers();

		this.drawPekes();
		this.drawLines();

		this.drawStartpos();

		this.drawChassis();

		this.drawTarget();
	},

	getCellColor : function(cell){
		if(cell.ques===1){
			if     (cell.error===0){ return this.cellcolor;}
			else if(cell.error===1){ return this.errcolor1;}
		}
		return null;
	},

	drawGates : function(){
		var g = this.vinc('cell_gate', 'auto');

		var lw = Math.max(this.cw/10, 3);	//LineWidth
		var lm = lw/2;						//LineMargin
		var ll = lw*1.1;					//LineLength
		var headers = ["c_dl21", "c_dl22"];

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i], id = cell.id;
			g.fillStyle = (cell.error===4 ? this.errcolor1 : this.cellcolor);

			if(cell.ques===21){ //たて
				if(this.vnop([headers[0],id].join("_"),this.FILL)){
					var px = (cell.bx*this.bw)-lm+1, py, rpy = (cell.by-1)*this.bh, max = rpy+this.ch;
					g.beginPath();
					for(py=rpy;py<max;py+=ll*2){
						g.moveTo(px,   py);
						g.lineTo(px+lw,py);
						g.lineTo(px+lw,py+ll);
						g.lineTo(px,   py+ll);
						g.lineTo(px,   py);
					}
					g.closePath();
					g.fill();
				}
			}
			else{ this.vhide([headers[0],id].join("_"));}

			if(cell.ques===22){ //よこ
				if(this.vnop([headers[1],id].join("_"),this.FILL)){
					var px, py = (cell.by*this.bh)-lm+1, rpx = (cell.bx-1)*this.bw, max = rpx+this.cw;
					g.beginPath();
					for(px=rpx;px<max;px+=ll*2){
						g.moveTo(px,   py);
						g.lineTo(px+ll,py);
						g.lineTo(px+ll,py+lw);
						g.lineTo(px,   py+lw);
						g.lineTo(px,   py);
					}
					g.closePath();
					g.fill();
				}
			}
			else{ this.vhide([headers[1],id].join("_"));}
		}
	},

	drawStartpos : function(){
		var g = this.vinc('cell_circle', 'auto');

		var cell = this.owner.board.startcell, d = this.range;
		if(cell.bx<d.x1 || d.x2<cell.bx || cell.by<d.y1 || d.y2<cell.by){ return;}

		var rsize = this.cw*0.45, rsize2 = this.cw*0.40;
		var csize = (rsize+rsize2)/2, csize2 = rsize2-rsize;
		var vids = ["sposa_","sposb_"];
		this.vdel(vids);

		g.lineWidth = (csize2>=1 ? csize2 : 1);
		g.strokeStyle = this.cellcolor;
		g.fillStyle = (this.owner.mouse.inputData==10 ? this.errbcolor1 : "white");
		if(this.vnop(vids[0],this.FILL)){
			g.shapeCircle((cell.bx*this.bw), (cell.by*this.bh), csize);
		}

		this.dispnumStartpos();
	},
	dispnumStartpos : function(){
		var g = this.vinc('cell_numberpos', 'auto'), bd = this.owner.board;

		var cell = bd.startcell, num = bd.hinfo.max;
		if(num>=0){
			var fontratio = (num<10?0.75:0.66);
			var px = cell.bx*this.bw, py = cell.by*this.bh;
			this.dispnum('stpos', 1, ""+num, fontratio, "black", px, py);
		}
		else{ this.hidenum(key);}
	},

	repaintParts : function(blist){
		var clist = blist.cellinside();
		for(var i=0;i<clist.length;i++){
			var cell = clist[i];
			if(cell!==this.owner.board.startcell){ continue;}

			this.range = {x1:cell.bx,y1:cell.by,x2:cell.bx,y2:cell.by};
			this.drawStartpos();

			// startは一箇所だけなので、描画したら終了してよい
			break;
		}
	},

	// Xキー押した時に数字を表示するメソッド
	drawNumbersOnGate : function(keydown){
		var bd = this.owner.board;
		if(keydown){ bd.hinfo.generateGateNumber();}

		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c];
			if(cell.ques!==21 && cell.ques!==22){ continue;}
			var key='cell_'+c;

			var r = bd.hinfo.getGateid(c);
			var num = (r>0?bd.hinfo.data[r].number:-1);
			if(keydown && num>0){
				var fontratio = (num<10?0.8:(num<100?0.7:0.55));
				var px = cell.bx*this.bw, py = cell.by*this.bh;
				this.dispnum(key, 1, ""+num, fontratio ,"tomato", px, py);
			}
			else{ this.hidenum(key);}
		}
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		this.decodeSlalom((this.checkpflag("p")?1:0));
	},
	pzlexport : function(type){
		this.owner.board.hinfo.generateAll();

		if(type===0){ this.outpflag='p';}

		return this.encodeSlalom((type===0?1:0));
	},

	decodeKanpen : function(){
		this.owner.fio.decodeBoard_kanpen();
		this.owner.board.hinfo.generateGates();
	},
	encodeKanpen : function(){
		this.owner.fio.encodeBoard_kanpen();
	},

	decodeSlalom : function(ver){
		var bstr = this.outbstr;
		var array = bstr.split("/");

		var c=0, i=0, bd = this.owner.board;
		for(i=0;i<array[0].length;i++){
			var ca = array[0].charAt(i), cell = bd.cell[c];

			if     (ca==='1'){ cell.ques = 1;}
			else if(ca==='2'){ cell.ques = 21;}
			else if(ca==='3'){ cell.ques = 22;}
			else if(this.include(ca,"4","9")||this.include(ca,"a","z")){ c+=(parseInt(ca,36)-4);}

			c++;
			if(c>=bd.cellmax){ break;}
		}
		bd.hinfo.generateGates();

		if(ver===0){
			var r=1;
			for(i=i+1;i<array[0].length;i++){
				var ca = array[0].charAt(i);

				if(this.include(ca,"0","9")||this.include(ca,"a","f")){
					bd.hinfo.data[r].number = parseInt(ca,16);
				}
				else if(ca==='-'){
					bd.hinfo.data[r].number = parseInt(bstr.substr(i+1,2),16); i+=2;
				}
				else if(this.include(ca,"g","z")){ r+=(parseInt(ca,36)-16);}

				r++;
				if(r>bd.hinfo.max){ break;}
			}

			for(var c=0;c<bd.cellmax;c++){
				var idlist=bd.hinfo.getConnectingGate(c), min=1000;
				for(var i=0;i<idlist.length;i++){
					var val=bd.hinfo.data[idlist[i]].number;
					if(val>0){ min=Math.min(min,val);}
				}
				bd.cell[c].qnum = (min<1000?min:-1);
			}
		}
		else if(ver===1){
			var c=0, spare=0;
			for(i=i+1;i<array[0].length;i++){
				var cell = bd.cell[c];
				if(cell.ques!==1){ i--;}
				else if(spare>0){ i--; spare--;}
				else{
					var ca = array[0].charAt(i);

					if(this.include(ca,"0","9")||this.include(ca,"a","f")){
						cell.qnum = parseInt(ca,16);
					}
					else if(ca=='-'){
						cell.qnum = parseInt(bstr.substr(i+1,2),16); i+=2;
					}
					else if(ca>='g' && ca<='z'){ spare = (parseInt(ca,36)-15)-1;}
				}
				c++;
				if(c>=bd.cellmax){ break;}
			}
		}

		bd.startcell = bd.cell[parseInt(array[1])];

		this.outbstr = array[0].substr(i);
	},
	encodeSlalom : function(ver){
		var cm="", count=0, bd=this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			var pstr="", cell=bd.cell[c];
			if     (cell.ques=== 1){ pstr = "1";}
			else if(cell.ques===21){ pstr = "2";}
			else if(cell.ques===22){ pstr = "3";}
			else{ count++;}

			if(count===0){ cm += pstr;}
			else if(pstr || count===32){ cm+=((3+count).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm+=(3+count).toString(36);}

		count=0;
		if(ver===0){
			for(var r=1;r<=bd.hinfo.max;r++){
				var pstr = "";
				var val = bd.hinfo.data[r].number;

				if     (val>= 0 && val< 16){ pstr =       val.toString(16);}
				else if(val>=16 && val<256){ pstr = "-" + val.toString(16);}
				else{ count++;}

				if(count===0){ cm += pstr;}
				else if(pstr || count===20){ cm+=((15+count).toString(36)+pstr); count=0;}
			}
			if(count>0){ cm+=(15+count).toString(36);}
		}
		else if(ver===1){
			for(var c=0;c<bd.cellmax;c++){
				var cell = bd.cell[c];
				if(cell.ques!==1){ continue;}

				var pstr = "", val = cell.qnum;
				if     (val>= 1 && val< 16){ pstr =       val.toString(16);}
				else if(val>=16 && val<256){ pstr = "-" + val.toString(16);}
				else{ count++;}

				if(count===0){ cm += pstr;}
				else if(pstr || count===20){ cm+=((15+count).toString(36)+pstr); count=0;}
			}
			if(count>0){ cm+=(15+count).toString(36);}
		}

		cm += ("/"+bd.startcell.id.toString());

		this.outbstr += cm;
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		if(this.filever==1){
			this.decodeBoard_pzpr();
			this.decodeBorderLine();
			this.owner.board.hinfo.generateGates();
		}
		else if(this.filever==0){
			this.decodeBoard_old();
			this.decodeBorderLine();
		}
	},
	encodeData : function(){
		this.owner.board.hinfo.generateAll();

		this.filever = 1;
		this.encodeBoard_pzpr();
		this.encodeBorderLine();
	},

	kanpenOpen : function(){
		this.decodeBoard_kanpen();
		this.decodeBorderLine();

		this.owner.board.hinfo.generateGates();
	},
	kanpenSave : function(){
		this.owner.board.hinfo.generateAll();

		this.encodeBoard_kanpen();
		this.encodeBorderLine();
	},

	decodeBoard_pzpr : function(){
		var bd = this.owner.board;
		this.decodeCell( function(obj,ca){
			if     (ca==="o"){ bd.startcell = obj;}
			else if(ca==="i"){ obj.ques = 21;}
			else if(ca==="-"){ obj.ques = 22;}
			else if(ca==="#"){ obj.ques = 1;}
			else if(ca!=="."){ obj.ques = 1; obj.qnum = parseInt(ca);}
		});
	},
	encodeBoard_pzpr : function(){
		var bd = this.owner.board;
		this.encodeCell( function(obj){
			if     (bd.startcell===obj){ return "o ";}
			else if(obj.ques===21){ return "i ";}
			else if(obj.ques===22){ return "- ";}
			else if(obj.ques=== 1){
				return (obj.qnum>0 ? obj.qnum.toString() : "#")+" ";
			}
			else{ return ". ";}
		});
	},

	decodeBoard_kanpen : function(){
		var bd = this.owner.board;
		this.decodeCell( function(obj,ca){
			if     (ca==="+"){ bd.startcell = obj;}
			else if(ca==="|"){ obj.ques = 21;}
			else if(ca==="-"){ obj.ques = 22;}
			else if(ca==="0"){ obj.ques = 1;}
			else if(ca!=="."){ obj.ques = 1; obj.qnum = parseInt(ca);}
		});
	},
	encodeBoard_kanpen : function(){
		var bd = this.owner.board;
		this.encodeCell( function(obj){
			if     (bd.startcell===obj){ return "+ ";}
			else if(obj.ques===21){ return "| ";}
			else if(obj.ques===22){ return "- ";}
			else if(obj.ques=== 1){
				return (obj.qnum>0 ? obj.qnum.toString() : "0")+" ";
			}
			else{ return ". ";}
		});
	},

	decodeBoard_old : function(){
		var sv_num = [], bd = this.owner.board;
		this.decodeCell( function(obj,ca){
			var c = obj.id;
			sv_num[c]=-1;
			if     (ca==="#"){ obj.ques = 1;}
			else if(ca==="o"){ bd.startcell = obj;}
			else if(ca!=="."){
				if     (ca.charAt(0)==="i"){ obj.ques = 21;}
				else if(ca.charAt(0)==="w"){ obj.ques = 22;}
				if(ca.length>1){ sv_num[c] = parseInt(ca.substr(1));}
			}
		});
		bd.hinfo.generateGates();

		for(var c=0;c<bd.cellmax;c++){
			if(sv_num[c]!==-1){ bd.hinfo.data[bd.hinfo.getGateid(c)].number = sv_num[c];}
		}
		for(var c=0;c<bd.cellmax;c++){
			var idlist=bd.hinfo.getConnectingGate(c), min=1000;
			for(var i=0;i<idlist.length;i++){
				var val=bd.hinfo.data[idlist[i]].number;
				if(val>0){ min=Math.min(min,val);}
			}
			bd.cell[c].qnum = (min<1000?min:-1);
		}
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){
		this.owner.board.hinfo.generateAll();

		if( !this.checkAllCell(function(cell){ return (cell.getQues()===1 && cell.lcnt()>0);}) ){
			this.setAlert('黒マスに線が通っています。','A line is over a black cell.'); return false;
		}

		if( !this.checkLcntCell(4) ){
			this.setAlert('交差している線があります。','There is a crossing line.'); return false;
		}

		if( !this.checkLcntCell(3) ){
			this.setAlert('分岐している線があります。','There is a branch line.'); return false;
		}

		if( !this.checkGateLine(1) ){
			this.setAlert('線が２回以上通過している旗門があります。','A line goes through a gate twice or more.'); return false;
		}

		if( !this.checkStartid() ){
			this.setAlert('○から線が２本出ていません。','A line goes through a gate twice or more.'); return false;
		}

		if( !this.checkGateNumber() ){
			this.setAlert('旗門を通過する順番が間違っています。','The order of passing the gate is wrong.'); return false;
		}

		if( !this.checkLcntCell(1) ){
			this.setAlert('線が途中で途切れています。','There is a dead-end line.'); return false;
		}

		if( !this.checkOneLoop() ){
			this.setAlert('輪っかが一つではありません。','There are two or more loops.'); return false;
		}

		if( !this.checkGateLine(2) ){
			this.setAlert('線が通過していない旗門があります。','There is a gate that the line is not passing.'); return false;
		}

		return true;
	},
	check1st : function(){ return this.checkLcntCell(1);},

	checkStartid : function(){
		var start = this.owner.board.startcell;
		if(start.lcnt()!=2){
			start.seterr(1);
			return false;
		}
		return true;
	},
	checkGateLine : function(type){
		var result = true, bd = this.owner.board;
		for(var r=1;r<=bd.hinfo.max;r++){
			var cnt=0, clist=bd.hinfo.getclist(r);
			for(var i=0;i<clist.length;i++){
				if(clist[i].lcnt()>0){ cnt++;}
			}
			if((type==1 && cnt>1)||(type==2 && cnt==0)){
				if(this.inAutoCheck){ return false;}
				clist.seterr(4);
				bd.hinfo.getGatePole(r).seterr(1)
				result = false;
			}
		}
		return result;
	},
	checkGateNumber : function(){
		var sid = [], bd = this.owner.board, startcell = bd.startcell;
		if(startcell.rb().isLine()){ sid.push({obj:startcell.rb(),dir:4});}
		if(startcell.db().isLine()){ sid.push({obj:startcell.db(),dir:2});}
		if(startcell.lb().isLine()){ sid.push({obj:startcell.lb(),dir:3});}
		if(startcell.ub().isLine()){ sid.push({obj:startcell.ub(),dir:1});}

		for(var i=0;i<sid.length;i++){
			var pos = sid[i].obj.getaddr();
			var dir=sid[i].dir, ordertype=-1, passing=0;

			while(1){
				pos.movedir(dir,1);
				if(pos.oncell()){
					var cell = pos.getc();
					if(cell===bd.startcell){ return true;} // ちゃんと戻ってきた

					if(cell.getQues()===21 || cell.getQues()===22){
						var r = bd.hinfo.getGateid(cell.id);
						var gatenumber = bd.hinfo.data[r].number;
						passing++;
						if(gatenumber<=0){ } // 何もしない
						else if(ordertype==-1){
							if(gatenumber*2-1==bd.hinfo.max){ } // ど真ん中の数字なら何もしない
							else if(passing==gatenumber)               { ordertype=1;}
							else if(passing==bd.hinfo.max+1-gatenumber){ break;      } // 逆方向なので逆の方向から回る
							else{
								bd.hinfo.getclist(r).seterr(4);
								bd.hinfo.getGatePole(r).seterr(1);
								return false;
							}
						}
						else if(ordertype==1 && passing!=gatenumber){
							bd.hinfo.getclist(r).seterr(4);
							bd.hinfo.getGatePole(r).seterr(1);
							return false;
						}
					}

					if     (cell.lcnt()!==2){ break;}
					else if(dir!=1 && cell.db().isLine()){ dir=2;}
					else if(dir!=2 && cell.ub().isLine()){ dir=1;}
					else if(dir!=3 && cell.rb().isLine()){ dir=4;}
					else if(dir!=4 && cell.lb().isLine()){ dir=3;}
				}
				else{
					if(!pos.getb().isLine()){ break;} // 途切れてたら、何事もなかったように終了
				}
			}
		}
		return true;
	}
},

//---------------------------------------------------------
//---------------------------------------------------------
HurdleData:{
	initialize : function(){
		this.idlist = [];		// この旗門に含まれるセルのリスト
		this.number = -1;		// この旗門が持つ順番
		this.val    = 0;		// この旗門の方向(21:タテ 22:ヨコ)
		this.x1 = this.x2 = this.y1 = this.y2 = -1; // 旗門のサイズ(両端の黒マスIDを取得するのに必要)
	}
},

HurdleManager:{
	// 旗門が持つ旗門IDを取得する
	getGateid : function(cc){
		if(cc<0 || cc>=this.owner.board.cellmax){ return -1;}
		return this.gateid[cc];
	},

	// 旗門の両端にある黒マスの場所のセルを取得する
	getGatePole : function(gateid){
		var bd = this.owner.board;
		var clist = this.owner.newInstance('CellList'), cell1, cell2;
		if(this.data[gateid].val==21){
			cell1 = bd.getc(this.data[gateid].x1, this.data[gateid].y1-2);
			cell2 = bd.getc(this.data[gateid].x1, this.data[gateid].y2+2);
		}
		else if(this.data[gateid].val==22){
			cell1 = bd.getc(this.data[gateid].x1-2, this.data[gateid].y1);
			cell2 = bd.getc(this.data[gateid].x2+2, this.data[gateid].y1);
		}
		else{ return [];}
		if(!cell1.isnull && cell1.getQues()===1){ clist.add(cell1);}
		if(!cell2.isnull && cell2.getQues()===1){ clist.add(cell2);}
		return clist;
	},
	// 黒マスの周りに繋がっている旗門IDをリストにして返す
	getConnectingGate : function(c){
		var bd = this.owner.board, cell=bd.cell[c], cell2, idlist=[];
		cell2=cell.up(); if(!cell2.isnull && cell2.getQues()===21){ idlist.push(this.gateid[cell2.id]);}
		cell2=cell.dn(); if(!cell2.isnull && cell2.getQues()===21){ idlist.push(this.gateid[cell2.id]);}
		cell2=cell.lt(); if(!cell2.isnull && cell2.getQues()===22){ idlist.push(this.gateid[cell2.id]);}
		cell2=cell.rt(); if(!cell2.isnull && cell2.getQues()===22){ idlist.push(this.gateid[cell2.id]);}
		return idlist;
	},

	getclist : function(gateid){
		var o = this.owner, bd = o.board;
		var idlist = this.data[gateid].idlist, clist = o.newInstance('CellList');
		for(var i=0;i<idlist.length;i++){ clist.add(bd.cell[idlist[i]]);}
		return clist;
	},

	//---------------------------------------------------------
	init : function(){
		this.max=0;
		this.gateid=[];
		for(var c=0;c<this.owner.board.cellmax;c++){ this.gateid[c] = -1;}
		this.data=[];
	},

	generateAll : function(){
		this.generateGates();
		this.generateGateNumber();
	},

	generateGates : function(){
		var bd = this.owner.board;
		this.init();
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c], val = cell.getQues();
			if(val===0 || val===1 || this.getGateid(cell.id)!==-1){ continue;}

			var pos = cell.getaddr(), isvert=(val===21);

			this.max++;
			this.data[this.max] = this.owner.newInstance('HurdleData');
			while(1){
				var cell2 = pos.getc();
				if(cell2.isnull || cell2.getQues()!==val){ break;}

				this.data[this.max].idlist.push(cell2.id);
				this.gateid[cell2.id]=this.max;
				if(isvert){ pos.move(0,2);}else{ pos.move(2,0);}
			}
			this.data[this.max].x1 = cell.bx;
			this.data[this.max].y1 = cell.by;
			this.data[this.max].x2 = (!isvert?pos.bx-2:pos.bx);
			this.data[this.max].y2 = ( isvert?pos.by-2:pos.by);
			this.data[this.max].val = val;
		}
	},

	generateGateNumber : function(){
		// 一旦すべての旗門のnumberを消す
		for(var r=1;r<=this.max;r++){ this.data[r].number=-1;}

		// 数字がどの旗門に繋がっているかをnums配列にとってくる
		var nums = [], bd = this.owner.board;
		for(var r=1;r<=this.max;r++){ nums[r] = [];}
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c];
			if(cell.getQues()===1){
				var qn = cell.getNum();
				if(qn<=0 || qn>this.max){ continue;}
				var idlist = this.getConnectingGate(c);
				for(var i=0;i<idlist.length;i++){ nums[idlist[i]].push(qn);}
			}
		}

		// セットされた数字を全てのnumsから消す関数
		var self = this, delnum = function(dn){ for(var r=1;r<=self.max;r++){
			var atmp = [];
			for(var i=0;i<nums[r].length;i++){ if(dn[nums[r][i]]!=1){ atmp.push(nums[r][i]);} }
			nums[r] = atmp;
		} };
		var decnumber = [];
		for(var n=1;n<=this.max;n++){ decnumber[n] = 0;}

		// 旗門nに繋がる数字が2つとも同じ数字の場合、無条件で旗門に数字をセット
		for(var r=1;r<=this.max;r++){
			if(nums[r].length==2 && nums[r][0]>0 && nums[r][0]==nums[r][1]){
				this.data[r].number = nums[r][0];
				decnumber[nums[r][0]] = 1
				nums[r] = [];
			}
		}
		delnum(decnumber);

		// 旗門に繋がる2つの数字が異なる場合、もしくは1つの数字が繋がる場合
		var repeatflag = true;
		while(repeatflag){
			repeatflag = false;
			for(var n=1;n<=this.max;n++){ decnumber[n] = 0;}
			var numcnt = [];

			// 競合していない数字がいくつ残っているか数える
			for(var n=1;n<=this.max;n++){ numcnt[n] = 0;}
			for(var r=1;r<=this.max;r++){ if(nums[r].length==1){ numcnt[nums[r][0]]++;} }

			// 各旗門をチェック
			for(var r=1;r<=this.max;r++){
				// 2つ以上の数字が繋がっている場合はダメです
				// また、複数箇所の旗門の候補になっている場合もダメ
				var cand=(nums[r].length==1?nums[r][0]:-1);
				if(cand>0 && numcnt[cand]>1){ cand=-1;}

				// 旗門に数字をセット
				if(cand>0){
					this.data[r].number = cand;
					decnumber[cand] = 1;
					nums[r] = [];
					repeatflag = true;	//再ループする
				}
			}
			delnum(decnumber);

			// ここまででセットされたやつがあるなら、初めからループ
			if(repeatflag){ continue;}

			// 重なっていても、1つだけに繋がっている数字を判定したい。。
			for(var n=1;n<=this.max;n++){ numcnt[n] = 0;}
			for(var r=1;r<=this.max;r++){ for(var i=0;i<nums[r].length;i++){ numcnt[nums[r][i]]++;} }

			// 各旗門をチェック
			for(var r=1;r<=this.max;r++){
				var cand=-1;
				for(var i=0;i<nums[r].length;i++){
					if(numcnt[nums[r][i]]==1){ cand=(cand==-1?nums[r][i]:-1);}
				}

				// 旗門に数字をセット
				if(cand>0){
					this.data[r].number = cand;
					decnumber[cand] = 1;
					nums[r] = [];
					repeatflag = true;	//再ループする
				}
			}
			delnum(decnumber);
		}
	}
}
});

})();
