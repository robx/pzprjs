//
// パズル固有スクリプト部 天体ショー版 tentaisho.js v3.3.3
//
Puzzles.tentaisho = function(){ };
Puzzles.tentaisho.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}
		if(!k.qrows){ k.qrows = 10;}

		k.iscross  = 1;
		k.isborder = 1;

		k.dispzero        = true;
		k.hasroom         = true;

		k.ispzprv3ONLY    = true;
		k.isKanpenExist   = true;

		base.setFloatbgcolor("rgb(0, 224, 0)");
	},
	menufix : function(){
		if(k.EDITOR){
			pp.addCheck('discolor','setting',false,'色分け無効化','Disable color');
			pp.setLabel('discolor', '星クリックによる色分けを無効化する', 'Disable Coloring up by clicking star');
		}

		var el = ee.createEL(menu.EL_BUTTON, 'btncolor');
		menu.addButtons(el, ee.binder(mv, mv.encolorall), "色をつける","Color up");
		ee('btnarea').appendEL(el);
	},

	protoChange : function(){
		this.protoval = {
			cell   : Cell.prototype.defqnum,
			cross  : Cross.prototype.defqnum,
			border : Border.prototype.defqnum
		};
		Cell.prototype.defqnum = 0;
		Cross.prototype.defqnum = 0;
		Border.prototype.defqnum = 0;
	},
	protoOriginal : function(){
		Cell.prototype.defqnum   = this.protoval.cell;
		Cross.prototype.defqnum  = this.protoval.cross;
		Border.prototype.defqnum = this.protoval.border;
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(k.editmode){
				if(this.btn.Left) this.inputstar();
				else if(this.btn.Right) this.inputBGcolor1();
			}
			else if(k.playmode){
				if(this.btn.Left){ this.checkBorderMode();}
				if(this.bordermode){ this.inputborder_tentaisho();}
				else{ this.inputQsubLine();}
			}
		};
		mv.mouseup = function(){
			if(k.playmode && this.notInputted()) this.inputBGcolor3();
		};
		mv.mousemove = function(){
			if(k.editmode){
				if(this.btn.Right) this.inputBGcolor1();
			}
			else if(k.playmode){
				if(this.bordermode){ this.inputborder_tentaisho();}
				else{ this.inputQsubLine();}
			}
		};

		mv.inputBGcolor1 = function(){
			var cc = this.cellid();
			if(cc===null || cc==this.mouseCell){ return;}
			if(this.inputData===null){ this.inputData=(bd.QsC(cc)==0)?3:0;}
			bd.sQsC(cc, this.inputData);
			this.mouseCell = cc; 
			pc.paintCell(cc);
		};
		mv.inputBGcolor3 = function(){
			if(k.EDITOR){ if(pp.getVal('discolor')){ return;} }

			var pos = this.borderpos(0.34);
			var id = bd.snum(pos.x, pos.y);
			if(id===null || bd.getStar(id)===0){ return;}

			var cc=null, group=bd.star[id].group, gid=bd.star[id].groupid;
			if(group===k.CELL){
				cc = bd.star[id].groupid;
			}
			else if(group===k.CROSS && area.lcntCross(gid)===0){
				cc = bd.cnum(bd.star[id].bx-1, bd.star[id].by-1);
			}
			else if(group===k.BORDER && bd.QaB(gid)===0){
				cc = bd.border[gid].cellcc[0];
			}

			if(cc!==null){
				var clist = area.room[area.room.id[cc]].clist;
				if(mv.encolor(clist)){
					var d = ans.getSizeOfClist(clist,f_true);
					pc.paintRange(d.x1, d.y1, d.x2, d.y2);
				}
			}
		};
		mv.inputborder_tentaisho = function(){
			var pos = this.borderpos(0.34);
			if(this.prevPos.equals(pos)){ return;}

			var id = this.getborderID(this.prevPos, pos);
			if(id!==null){
				if(this.inputData===null){ this.inputData=(bd.QaB(id)===0?1:0);}
				bd.sQaB(id, this.inputData);
				pc.paintBorder(id);
			}
			this.prevPos = pos;
		};
		mv.inputstar = function(){
			var pos = this.borderpos(0.25);
			if(this.prevPos.equals(pos)){ return;}

			var id = bd.snum(pos.x, pos.y);
			if(id!==null){
				if(this.btn.Left)      { bd.setStar(id, {0:1,1:2,2:0}[bd.getStar(id)]);}
				else if(this.btn.Right){ bd.setStar(id, {0:2,1:0,2:1}[bd.getStar(id)]);}
			}
			this.prevPos = pos;
			pc.paintPos(pos);
		};

		mv.encolorall = function(){
			var rinfo = area.getRoomInfo();
			for(var id=1;id<=rinfo.max;id++){ this.encolor(rinfo.room[id].idlist);}
			pc.paintAll();
		};
		mv.encolor = function(clist){
			var id = ans.getAreaStarInfo(clist).id;
			var flag = false, ret = (id!==null ? bd.getStar(id) : 0);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				if(k.EDITOR && bd.QsC(c)==3 && ret!=2){ continue;}
				else if(bd.QsC(c)!=(ret>0?ret:0)){
					bd.sQsC(c,(ret>0?ret:0));
					flag = true;
				}
			}
			return flag;
		};

		// キーボード入力系 => なし

		// 一部qsubで消したくないものがあるため上書き
		menu.ex.ASconfirm = function(){
			if(menu.confirmStr("補助記号を消去しますか？","Do you want to erase the auxiliary marks?")){
				um.newOperation(true);
				for(i=0;i<bd.cellmax;i++){
					if(bd.QsC(i)===1){
						um.addOpe(k.CELL,k.QSUB,i,bd.QsC(i),0);
						bd.cell[i].qsub = 0;
					}
				}
				for(i=0;i<bd.bdmax;i++){
					if(bd.QsB(i)!==0){
						um.addOpe(k.BORDER,k.QSUB,i,bd.QsB(i),0);
						bd.border[i].qsub = 0;
					}
				}

				pc.paintAll();
			}
		};

		// starmax変数関連
		menu.ex.adjustSpecial2 = function(key,d){
			bd.initSpecial(k.qcols, k.qrows);
		};
		bd.initSpecial = function(col,row){
			this.starmax = (2*col-1)*(2*row-1);
			this.star = [];
			for(var id=0;id<this.starmax;id++){
				this.star[id] = {};
				var obj = this.star[id];
				obj.bx = id%(2*col-1)+1;
				obj.by = ((id/(2*col-1))|0)+1;
				if((obj.bx&1)===1 && (obj.by&1)===1){
					obj.group   = k.CELL;
					obj.groupid = bd.cnum(obj.bx, obj.by, col, row);
				}
				else if((obj.bx&1)===0 && (obj.by&1)===0){
					obj.group   = k.CROSS;
					obj.groupid = bd.xnum(obj.bx, obj.by, col, row);
				}
				else{
					obj.group   = k.BORDER;
					obj.groupid = bd.bnum(obj.bx, obj.by, col, row);
				}
			}
		};
		bd.starmax = 0;
		bd.star = [];
		bd.initSpecial(k.qcols, k.qrows);

		// Board関数
		bd.snum = function(sx,sy){
			if(sx<=bd.minbx || bd.maxbx<=sx || sy<=bd.minby || bd.maxby<=sy){ return null;}
			return ((sx-1)+(sy-1)*(2*k.qcols-1));
		};
		bd.starinside = function(x1,y1,x2,y2){
			var idlist = [];
			for(var by=y1;by<=y2;by++){ for(var bx=x1;bx<=x2;bx++){
				var id = this.snum(bx,by);
				if(id!==null){ idlist.push(id);}
			}}
			return idlist;
		};

		bd.getStar = function(id){
			if     (bd.star[id].group===k.CELL) { return bd.QnC(bd.star[id].groupid);}
			else if(bd.star[id].group===k.CROSS){ return bd.QnX(bd.star[id].groupid);}
			else                                { return bd.QnB(bd.star[id].groupid);}
		};
		bd.isStarError = function(id){
			return (bd.getObject(bd.star[id].group,bd.star[id].groupid).error!==0);
		};
		bd.setStar = function(id,val){
			um.disCombine = 1;
			if     (bd.star[id].group===k.CELL) { bd.sQnC(bd.star[id].groupid, val);}
			else if(bd.star[id].group===k.CROSS){ bd.sQnX(bd.star[id].groupid, val);}
			else                                { bd.sQnB(bd.star[id].groupid, val);}
			um.disCombine = 0;
		};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_LIGHT;
		pc.borderQanscolor = "rgb(72, 72, 72)";
		pc.qsubcolor1 = "rgb(176,255,176)";
		pc.qsubcolor2 = "rgb(108,108,108)";
		pc.errbcolor1 = pc.errbcolor1_DARK;
		pc.setBGCellColorFunc('qsub3');

		pc.paint = function(){
			this.drawBGCells();
			this.drawDashedGrid();

			this.drawBorderAnswers();
			this.drawBorderQsubs();

			this.drawStars();

			this.drawChassis();
		};

		pc.drawBorderAnswers = function(){
			this.vinc('border', 'crispEdges');

			var lw = this.lw, lm = this.lm;
			var header = "b_bd_";

			var idlist = this.range.borders;
			for(var i=0;i<idlist.length;i++){
				var id = idlist[i];
				if(bd.border[id].qans===1){
					if     (bd.border[id].error===1){ g.fillStyle = this.errcolor1;}
					else if(bd.border[id].error===2){ g.fillStyle = this.errborderQanscolor2;}
					else                            { g.fillStyle = this.borderQanscolor;}

					if(this.vnop(header+id,this.FILL)){
						if     (bd.border[id].by&1){ g.fillRect(bd.border[id].px-lm, bd.border[id].py-this.bh-lm,  lw, this.ch+lw);}
						else if(bd.border[id].bx&1){ g.fillRect(bd.border[id].px-this.bw-lm, bd.border[id].py-lm,  this.cw+lw, lw);}
					}
				}
				else{ this.vhide(header+id);}
			}
		};
		pc.drawStars = function(){
			this.vinc('star', 'auto');

			g.lineWidth = Math.max(this.cw*0.04, 1);
			var headers = ["s_star1_", "s_star2_"];

			var d = this.range;
			var idlist = bd.starinside(d.x1,d.y1,d.x2,d.y2);
			for(var i=0;i<idlist.length;i++){
				var id = idlist[i], bx=bd.star[id].bx, by=bd.star[id].by;

				if(bd.getStar(id)===1){
					g.strokeStyle = (bd.isStarError(id) ? this.errcolor1 : this.cellcolor);
					g.fillStyle   = "white";
					if(this.vnop(headers[0]+id,this.STROKE)){
						g.shapeCircle(bx*this.bw, by*this.bh, this.cw*0.16);
					}
				}
				else{ this.vhide(headers[0]+id);}

				if(bd.getStar(id)===2){
					g.fillStyle = (bd.isStarError(id) ? this.errcolor1 : this.cellcolor);
					if(this.vnop(headers[1]+id,this.FILL)){
						g.fillCircle(bx*this.bw, by*this.bh, this.cw*0.18);
					}
				}
				else{ this.vhide(headers[1]+id);}
			}
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decodeStar();
		};
		enc.pzlexport = function(type){
			this.encodeStar();
		};

		enc.decodeKanpen = function(){
			fio.decodeStarFile();
		};
		enc.encodeKanpen = function(){
			fio.encodeStarFile();
		};

		enc.decodeStar = function(bstr){
			bd.disableInfo();
			var s=0, bstr = this.outbstr;
			for(var i=0;i<bstr.length;i++){
				var ca = bstr.charAt(i);
				if(this.include(ca,"0","f")){
					var val = parseInt(ca,16);
					bd.setStar(s,val%2+1);
					s+=((val>>1)+1);
				}
				else if(this.include(ca,"g","z")){ s+=(parseInt(ca,36)-15);}

				if(s>=bd.starmax){ break;}
			}
			bd.enableInfo();
			this.outbstr = bstr.substr(i+1);
		};
		enc.encodeStar = function(){
			var count = 0;
			var cm = "";

			for(var s=0;s<bd.starmax;s++){
				var pstr = "";
				if(bd.getStar(s)>0){
					for(var i=1;i<=7;i++){
						if(!!bd.star[s+i] && bd.getStar(s+i)>0){
							pstr=""+(2*(i-1)+(bd.getStar(s)-1)).toString(16);
							s+=(i-1); break;
						}
					}
					if(pstr===""){ pstr=(13+bd.getStar(s)).toString(16); s+=7;}
				}
				else{ count++;}

				if(count==0){ cm += pstr;}
				else if(pstr || count==20){ cm += ((count+15).toString(36)+pstr); count=0;}
			}
			if(count>0){ cm += ((count+15).toString(36));}

			this.outbstr += cm;
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeStarFile();
			this.decodeBorderAns();
			this.decodeCellQsub();
		};
		fio.encodeData = function(){
			this.encodeStarFile();
			this.encodeBorderAns();
			this.encodeCellQsub();
		};

		fio.kanpenOpen = function(){
			this.decodeStarFile();
			this.decodeAnsAreaRoom();
		};
		fio.kanpenSave = function(){
			this.encodeStarFile();
			this.encodeAnsAreaRoom();
		};

		fio.decodeStarFile = function(){
			var array = this.readLines(2*k.qrows-1), s=0;
			bd.disableInfo();
			for(var i=0;i<array.length;i++){
				for(var c=0;c<array[i].length;c++){
					if     (array[i].charAt(c)==="1"){ bd.setStar(s, 1);}
					else if(array[i].charAt(c)==="2"){ bd.setStar(s, 2);}
					s++;
				}
			}
			bd.enableInfo();
		};
		fio.encodeStarFile = function(){
			var s=0;
			for(var by=1;by<=2*k.qrows-1;by++){
				for(var bx=1;bx<=2*k.qcols-1;bx++){
					if     (bd.getStar(s)===1){ this.datastr += "1";}
					else if(bd.getStar(s)===2){ this.datastr += "2";}
					else                      { this.datastr += ".";}
					s++;
				}
				this.datastr += "/";
			}
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			if( !this.checkStarOnLine() ){
				this.setAlert('星を線が通過しています。', 'A line goes over the star.'); return false;
			}

			var rinfo = this.getAreaStarInfoAll();
			if( !this.checkErrorFlag(rinfo, -1) ){
				this.setAlert('星が含まれていない領域があります。','A block has no stars.'); return false;
			}

			if( !this.checkFractal(rinfo) ){
				this.setAlert('領域が星を中心に点対称になっていません。', 'A area is not point symmetric about the star.'); return false;
			}

			if( !this.checkErrorFlag(rinfo, -2) ){
				this.setAlert('星が複数含まれる領域があります。','A block has two or more stars.'); return false;
			}

			return true;
		};

		ans.checkStarOnLine = function(){
			var result = true;
			for(var s=0;s<bd.starmax;s++){
				if(bd.getStar(s)<=0){ continue;}

				var group=bd.star[s].group, gid=bd.star[s].groupid;
				if(group===k.CROSS && area.lcntCross(gid)!==0){
					if(this.inAutoCheck){ return false;}
					this.setCrossBorderError(bd.star[s].bx, bd.star[s].by);
					result = false;
				}
				else if(group===k.BORDER && bd.QaB(gid)!==0){
					if(this.inAutoCheck){ return false;}
					bd.sErB(gid,1);
					result = false;
				}
			}
			return result;
		};

		ans.getAreaStarInfoAll = function(){
			var rinfo = area.getRoomInfo();
			for(var id=1;id<=rinfo.max;id++){
				var obj = this.getAreaStarInfo(rinfo.room[id].idlist);
				rinfo.room[id].starid = obj.id;
				rinfo.room[id].error  = obj.err;
			}
			return rinfo;
		};
		ans.getAreaStarInfo = function(clist){
			var cnt=0, ret={id:null, err:-1};
			for(var i=0;i<clist.length;i++){
				var c=clist[i], bx=bd.cell[c].bx, by=bd.cell[c].by;
				var idlist = bd.starinside(bx,by,bx+1,by+1);
				for(var n=0;n<idlist.length;n++){
					var id=idlist[n], group=bd.star[id].group, gid=bd.star[id].groupid;
					if(bd.getStar(id)>0){
						if( group===k.CELL ||
						   (group===k.CROSS && area.lcntCross(gid)===0) ||
						   (group===k.BORDER && bd.QaB(gid)===0)
						)
						{ cnt++; ret={id:id, err:0};}
					}
				}

				if(cnt>1){ return {id:null, err:-2};}
			}
			return ret;
		};

		ans.checkFractal = function(rinfo){
			var result = true;
			for(var r=1;r<=rinfo.max;r++){
				var room = rinfo.room[r];
				var id = room.starid;
				if(id===null){ continue;}
				var sx=bd.star[id].bx, sy=bd.star[id].by;
				for(var i=0;i<room.idlist.length;i++){
					var c=room.idlist[i];
					var ccopy = bd.cnum(sx*2-bd.cell[c].bx, sy*2-bd.cell[c].by);
					if(ccopy===null || rinfo.id[c]!=rinfo.id[ccopy]){
						if(this.inAutoCheck){ return false;}
						bd.sErC(room.idlist,1); result = false;
					}
				}
			}
			return result;
		};

		ans.checkErrorFlag = function(rinfo, val){
			var result = true;
			for(var id=1;id<=rinfo.max;id++){
				if(rinfo.room[id].error!==val){ continue;}

				if(this.inAutoCheck){ return false;}
				bd.sErC(rinfo.room[id].idlist,1);
				result = false;
			}
			return result;
		};
	}
};
