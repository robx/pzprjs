//
// パズル固有スクリプト部 あみぼー版 amibo.js v3.4.0
//
pzprv3.custom.amibo = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputedit : function(){
		if(this.mousestart){ this.inputqnum();}
	},
	inputplay : function(){
		if(this.mousestart || this.mousemove){
			if     (this.btn.Left) { this.inputTateyoko();}
			else if(this.btn.Right){ this.inputpeke();}
		}
		else if(this.mouseend){
			if(this.notInputted()){ this.clickTateyoko();}
		}
	},

	inputTateyoko : function(){
		var cell = this.getcell();
		if(cell.isnull){ return;}

		var pos = cell.getaddr();
		var input=false;

		// 初回はこの中に入ってきます。
		if(this.mouseCell.isnull){ this.firstPoint.set(this.inputPoint);}
		// 黒マス上なら何もしない
		else if(cell.isNum()){ }
		// まだ入力されていない(1つめの入力の)場合
		else if(this.inputData===null){
			if(cell===this.mouseCell){
				var mx=Math.abs(this.inputPoint.px-this.firstPoint.px);
				var my=Math.abs(this.inputPoint.py-this.firstPoint.py);
				if     (my>=8){ this.inputData=1; input=true;}
				else if(mx>=8){ this.inputData=2; input=true;}
			}
			else{
				var dir = this.getdir(this.prevPos, pos);
				if     (dir===bd.UP || dir===bd.DN){ this.inputData=1; input=true;}
				else if(dir===bd.LT || dir===bd.RT){ this.inputData=2; input=true;}
			}

			if(input){
				if(cell.getQans() & this.inputData){ this.inputData*=-1;}
				this.firstPoint.reset();
			}
		}
		// 入力し続けていて、別のマスに移動した場合
		else if(cell!==this.mouseCell){
			var dir = this.getdir(this.prevPos, pos);
			if     (dir===bd.UP || dir===bd.DN){ this.inputData=(this.inputData>0?1:-1); input=true;}
			else if(dir===bd.LT || dir===bd.RT){ this.inputData=(this.inputData>0?2:-2); input=true;}
		}

		// 描画・後処理
		if(input){
			if     (this.inputData=== 1){ cell.setQans([1,1,3,3][cell.getQans()]);}
			else if(this.inputData=== 2){ cell.setQans([2,3,2,3][cell.getQans()]);}
			else if(this.inputData===-1){ cell.setQans([0,0,2,2][cell.getQans()]);}
			else if(this.inputData===-2){ cell.setQans([0,1,0,1][cell.getQans()]);}
			cell.draw();
		}
		this.prevPos   = pos;
		this.mouseCell = cell;
	},
	clickTateyoko : function(){
		var cell  = this.getcell();
		if(cell.isnull || cell.isNum()){ return;}

		cell.setQans((this.btn.Left?[1,2,3,0]:[3,0,1,2])[cell.getQans()]);
		cell.draw();
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,

	enablemake_p : true,
	paneltype    : 10
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	numberIsWhite : true,

	nummaxfunc : function(){
		var bx=this.bx, by=this.by;
		var col = (((bx<(bd.maxbx>>1))?(bd.maxbx-bx):bx)>>1);
		var row = (((by<(bd.maxby>>1))?(bd.maxby-by):by)>>1);
		return Math.max(col, row);
	},
	minnum : 2
},
Board:{
	isborder : 1,

	qcols : 8,
	qrows : 8,

	getBarInfo : function(){
		var self = this;
		function eachcell(cell, qa_chk, vert){
			var qa=cell.getQans();
			if(qa===qa_chk||qa===3){
				if(roomid===null){
					binfo.addRoom(vert);
					roomid = binfo.max;
					if(cell2!==null){ binfo.pole[cell2.id].push(roomid);}
				}
				binfo.addCell(cell)
			}
			else if(roomid!==null){ binfo.pole[cell.id].push(roomid); roomid=null;}
			cell2 = cell;
		}

		var binfo = this.owner.newInstance('AreaBarInfo');
		for(var bx=this.minbx+1;bx<=this.maxbx-1;bx+=2){
			var roomid=null, cell2=null;
			for(var by=this.minby+1;by<=this.maxby-1;by+=2){
				eachcell(this.getc(bx,by),1,true);
			}
		}
		for(var by=this.minby+1;by<=this.maxby-1;by+=2){
			var roomid=null, cell2=null;
			for(var bx=this.minbx+1;bx<=this.maxbx-1;bx+=2){
				eachcell(this.getc(bx,by),2,false);
			}
		}
		
		for(var c=0;c<this.cellmax;c++){
			if(binfo.id[c].length==2){ /* 0～2になる */
				binfo.room[binfo.id[c][0]].link.push(binfo.id[c][1]);
				binfo.room[binfo.id[c][1]].link.push(binfo.id[c][0]);
			}
			if(this.cell[c].isNum()){
				for(var i=0;i<binfo.pole[c].length;i++){
					binfo.room[binfo.pole[c][i]].pole.push(c);
				}
			}
			else{ binfo.pole[c] = [];}
		}
		return binfo;
	},

	adjustBoardData : function(key,d){
		if(key & this.TURN){ // 回転だけ
			for(var c=0;c<this.cellmax;c++){ this.cell[c].setQans([0,2,1,3][this.cell[c].getQans()]);}
		}
	}
},
"AreaBarInfo:AreaCellInfo":{
	initialize : function(){
		this.SuperFunc.initialize.call(this);

		this.pole = [];

		for(var c=0;c<bd.cellmax;c++){
			this.id[c]=[];
			this.pole[c]=[];
		}
	},

	addRoom : function(vert){
		this.max++;
		this.room[this.max] = {idlist:[],link:[],pole:[],vert:vert};
	},
	addCell : function(cell){
		this.room[this.max].idlist.push(cell.id);
		this.id[cell.id].push(this.max);
	},

	getclist : function(areaid){
		var room = this.room[areaid], idlist = room.idlist;
		var clist = this.owner.newInstance('CellList');
		for(var i=0;i<idlist.length;i++){ clist.add(bd.cell[idlist[i]]);}
		clist.pole = room.pole;
		clist.link = room.link;
		clist.vert = room.vert;
		return clist;
	}
},
CellList:{
	initialize : function(){
		this.link = [];
		this.pole = [];
		this.vert = false
	},

	setErrorBar : function(){
		var vert = this.vert;
		for(var i=0;i<this.length;i++){
			var cell=this[i], err=cell.error;
			if     (err===4){ /* nop */ }
			else if(err===5){ if(!vert){ cell.seterr(4);}}
			else if(err===6){ if( vert){ cell.seterr(4);}}
			else{ cell.seterr(vert?5:6);}
		}
	}
},

AreaManager:{
	initialize : function(){
		this.barinfo = null;

		this.disrec = 0;
	},

	init : function(){
		this.barinfo = this.owner.newInstance('AreaBarData');
	},
	resetArea : function(){
		this.barinfo.reset();
	},

	setCellInfo : function(cell){
		if(!this.isenableRecord()){ return;}

		this.barinfo.setCellInfo(cell);
	}
},

Menu:{
	irowakeRemake : function(){
		bd.areas.barinfo.newIrowake();
		if(this.owner.getConfig('irowake')){ this.owner.painter.paintAll();}
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	irowake : 1,

	hideHatena : true,

	setColors : function(){
		this.gridcolor = this.gridcolor_LIGHT;
		this.linecolor = this.linecolor_LIGHT;
		this.fontcolor = this.fontErrcolor = "black";

		this.fontsizeratio = 0.85;
		this.circleratio = [0.42, 0.42];
	},

	setRange : function(x1,y1,x2,y2){
		this.SuperFunc.setRange.call(this, x1-2, y1-2, x2+2, y2+2);
	},
	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();

		this.drawTateyokos()
		this.drawTateyokos_sub();

		this.drawCirclesAtNumber();
		this.drawNumbers();

		this.drawPekeBorder();

		this.drawChassis();

		this.drawTarget();
	},

	getBarColor : function(cell,vert){
		var err=cell.error, color="";
		if(err===1||err===4||((err===5&&vert)||(err===6&&!vert))){ color = this.errlinecolor;}
		else if(err!==0){ color = this.errlinebgcolor;}
		else if(!this.owner.getConfig('irowake') || !cell.color){ color = this.linecolor;}
		else{ color = cell.color;}
		return color;
	},

	drawTateyokos : function(){
		var g = this.vinc('cell_tateyoko', 'crispEdges');

		var headers = ["c_bar1_", "c_bar2_"];
		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i], id = cell.id;
			var lw = Math.max(this.cw/6, 3);	//LineWidth
			var lp = (this.bw-lw/2);			//LinePadding

			var qa=cell.qans;
			if(qa!==-1){
				var rpx = (cell.bx-1)*this.bw, rpy = (cell.by-1)*this.bh;
				if(qa===1 || qa===3){
					g.fillStyle = this.getBarColor(cell,true);
					if(this.vnop(headers[0]+id,this.FILL)){
						g.fillRect(rpx+lp, rpy, lw, this.ch+1);
					}
				}
				else{ this.vhide(headers[0]+id);}

				if(qa===2 || qa===3){
					g.fillStyle = this.getBarColor(cell,false);
					if(this.vnop(headers[1]+id,this.FILL)){
						g.fillRect(rpx, rpy+lp, this.cw+1, lw);
					}
				}
				else{ this.vhide(headers[1]+id);}
			}
			else{ this.vhide([headers[0]+id, headers[1]+id]);}
		}
	},

	// 白丸と線の間に隙間があいてしまうので、隙間部分を描画する
	drawTateyokos_sub : function(){
		var g = this.vinc('cell_tateyoko', 'crispEdges'); /* 同じレイヤでよい */

		g.fillStyle = this.linecolor;

		var headers = ["c_bars1_", "c_bars2_", "c_bars3_", "c_bars4_"];
		var clist = this.range.cells;
		var bw = this.bw, bh = this.bh;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i], id = cell.id;
			if(!cell.isNum()){
				this.vhide([headers[0]+id, headers[1]+id, headers[2]+id, headers[3]+id]);
				continue;
			}

			var lw = Math.max(this.cw/6, 3);	//LineWidth
			var lp = (this.bw-lw/2);			//LinePadding
			var px = cell.bx*this.bw, py = cell.by*this.bh;

			var cell2 = cell.up(), qa = cell2.qans;
			if(qa===1||qa===3){
				g.fillStyle = this.getBarColor(cell2,true);
				if(this.vnop(headers[0]+id,this.FILL)){
					g.fillRect(px-bw+lp, py-bh, lw, bh);
				}
			}
			else{ this.vhide(headers[0]+id);}

			var cell2 = cell.dn(), qa = cell2.qans;
			if(qa===1||qa===3){
				g.fillStyle = this.getBarColor(cell2,true);
				if(this.vnop(headers[1]+id,this.FILL)){
					g.fillRect(px-bw+lp, py+1, lw, bh);
				}
			}
			else{ this.vhide(headers[1]+id);}

			var cell2 = cell.lt(), qa = cell2.qans;
			if(qa===2||qa===3){
				g.fillStyle = this.getBarColor(cell2,false);
				if(this.vnop(headers[2]+id,this.FILL)){
					g.fillRect(px-bw, py-bh+lp, bw, lw);
				}
			}
			else{ this.vhide(headers[2]+id);}

			var cell2 = cell.rt(), qa = cell2.qans;
			if(qa===2||qa===3){
				g.fillStyle = this.getBarColor(cell2,false);
				if(this.vnop(headers[3]+id,this.FILL)){
					g.fillRect(px+1, py-bh+lp, bw, lw);
				}
			}
			else{ this.vhide(headers[3]+id);}
		}
	},

	drawPekeBorder : function(){
		var g = this.vinc('border_pbd', 'crispEdges');

		g.fillStyle = "rgb(64,64,64)";
		var header = "b_qsub2_";
		var rw = this.bw*0.6;

		var blist = this.range.borders;
		for(var i=0;i<blist.length;i++){
			var border = blist[i];
			if(border.qsub===2){
				if(this.vnop(header+border.id,this.NONE)){
					var lw = this.lw + this.addlw, lm = this.lm;
					var px = border.bx*this.bw, py = border.by*this.bh;
					if(border.isVert()){ g.fillRect(px-lm, py-rw-lm, lw, rw*2+lw);}
					else               { g.fillRect(px-rw-lm, py-lm, rw*2+lw, lw);}
				}
			}
			else{ this.vhide(header+border.id);}
		}
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		this.decodeNumber10();
	},
	pzlexport : function(type){
		this.encodeNumber10();
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCell( function(obj,ca){
			if     (ca==="l"){ obj.qans = 1;}
			else if(ca==="-"){ obj.qans = 2;}
			else if(ca==="+"){ obj.qans = 3;}
			else if(ca==="#"){ obj.qnum = -2;}
			else if(ca!=="."){ obj.qnum = parseInt(ca);}
		});
		this.decodeBorderLine();
	},
	encodeData : function(){
		this.encodeCell( function(obj){
			if     (obj.qans=== 1){ return "l ";}
			else if(obj.qans=== 2){ return "- ";}
			else if(obj.qans=== 3){ return "+ ";}
			else if(obj.qnum>=  0){ return (obj.qnum.toString() + " ");}
			else if(obj.qnum===-2){ return "# ";}
			else                  { return ". ";}
		});
		this.encodeBorderLine();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		var binfo = bd.getBarInfo();
		if( !this.checkLineCount(binfo, 1) ){
			this.setAlert('白丸に線が2本以上つながっています。','Prural lines connect to a white circle.'); return false;
		}

		bd.cell.filter(function(cell){ return cell.noNum();}).seterr(-1);
		if( !this.checkLoop() ){
			this.setAlert('棒で輪っかができています。','There is a looped bars.'); return false;
		}

		if( !this.checkPoleLength(binfo,1) ){
			this.setAlert('白丸から出る棒の長さが長いです。','The length of the bar is long.'); return false;
		}

		if( !this.checkCrossedLength(binfo) ){
			this.setAlert('同じ長さの棒と交差していません。','A bar doesn\'t cross the bar whose length is the same.'); return false;
		}

		if( !this.checkPoleLength(binfo,2) ){
			this.setAlert('白丸から出る棒の長さが短いです。','The length of the bar is short.'); return false;
		}
		bd.cell.seterr(0);

		if( !this.checkLineCount(binfo, 2) ){
			this.setAlert('白丸に線がつながっていません。','No bar connects to a white circle.'); return false;
		}

		if( !this.checkOneArea( bd.areas.barinfo.getAreaInfo() ) ){
			this.setAlert('棒が１つに繋がっていません。','Bars are devided.'); return false;
		}

		return true;
	},
	check1st : function(){ return this.checkOneArea( bd.areas.barinfo.getAreaInfo() );},

	checkLineCount : function(binfo, type){
		var result = true;
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c];
			if(!cell.isNum()){ continue;}
			var cid = binfo.pole[c];
			if((type===1 && cid.length>1) || (type===2 && cid.length===0)){
				if(this.inAutoCheck){ return false;}
				cell.seterr(1);
				result = false;
			}
		}
		return result;
	},
	checkPoleLength : function(binfo,type){
		var result=true;
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c];
			if(!cell.isValidNum()){ continue;}
			for(var i=0,len=binfo.pole[c].length;i<len;i++){
				var qn=cell.getNum(), id=binfo.pole[c][i], clist = binfo.getclist(id), llen=clist.length;
				if((type===1 && llen>qn) || (type===2 && llen<qn)){
					if(this.inAutoCheck){ return false;}
					cell.seterr(1);
					clist.setErrorBar();
					result = false;
				}
			}
		}
		return result;
	},
	checkCrossedLength : function(binfo){
		var result=true;
		for(var id=1,max=binfo.max;id<=max;id++){
			var check = false, linkid = binfo.room[id].link, clist = binfo.getclist(id);
			for(var i=0,len=linkid.length;i<len;i++){
				if(clist.length===binfo.getclist(linkid[i]).length){ check=true; break;}
			}
			if(!check){
				if(this.inAutoCheck){ return false;}
				clist.setErrorBar();
				result = false;
			}
		}
		return result;
	},

	checkLoop : function(){
		var sinfo={cell:[]};
		for(var c=0;c<bd.cellmax;c++){
			sinfo.cell[c] = bd.areas.barinfo.getcellaround(bd.cell[c]);
		}

		var sdata=[];
		for(var c=0;c<bd.cellmax;c++){ sdata[c] =(bd.cell[c].getQans()!==0?0:null);}
		for(var c=0;c<bd.cellmax;c++){
			if(sdata[c]!==0){ continue;}
			this.searchloop(c, sinfo, sdata);
		}

		var errclist = bd.cell.filter(function(cell){ return (sdata[cell.id]===1)});
		if(errclist.length>0){
			errclist.seterr(4);
			return false;
		}
		return true;
	},
	searchloop : function(fc, sinfo, sdata){
		var passed=[], history=[fc];
		for(var c=0;c<bd.cellmax;c++){ passed[c]=false;}

		while(history.length>0){
			var c = history[history.length-1];
			passed[c] = true;

			// セルを経由してその先の交点へ
			var cc = (sinfo.cell[c].length>0?sinfo.cell[c][0]:null);
			if(cc!==null){
				// 通過した道の参照を外す
				for(var i=0;i<sinfo.cell[c].length;i++) { if(sinfo.cell[c][i]===cc){ sinfo.cell[c].splice(i,1);}}
				for(var i=0;i<sinfo.cell[cc].length;i++){ if(sinfo.cell[cc][i]===c){ sinfo.cell[cc].splice(i,1);}}

				// ループになった場合 => ループフラグをセットする
				if(!!passed[cc]){
					sdata[cc] = 1;
					for(var i=history.length-1;i>=0;i--){
						if(history[i]===cc){ break;}
						sdata[history[i]] = 1;
					}
				}
				// 先の交点でループ判定にならなかった場合 => 次のセルへ進む
				else{ history.push(cc);}
			}
			else{
				// 全て通過済み -> 一つ前に戻る
				var cell = history.pop();
				if(sdata[cell]===0){ sdata[cell]=2;}
			}
		}
	}
},

//---------------------------------------------------------
//---------------------------------------------------------
"AreaBarData:AreaData":{

	isvalid : function(cell){ return (cell.getQans()>0);},
	getlink : function(cell){
		var qa = cell.getQans(), link = ([0,3,12,15][qa]);
		return (qa>0?16:0) + link;
	},

	reset : function(){
		pzprv3.core.AreaData.prototype.reset.call(this);
		this.newIrowake();
	}
}
};
