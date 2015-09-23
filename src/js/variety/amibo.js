//
// パズル固有スクリプト部 あみぼー版 amibo.js v3.4.1
//
pzpr.classmgr.makeCustom(['amibo'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.owner.playmode){
			if(this.mousestart || this.mousemove){
				if     (this.btn.Left) { this.inputTateyoko();}
				else if(this.btn.Right){ this.inputpeke();}
			}
			if(this.mouseend && this.notInputted()){
				this.clickTateyoko();
			}
		}
		else if(this.owner.editmode){
			if(this.mousestart){ this.inputqnum();}
		}
	},

	clickTateyoko : function(){
		var cell  = this.getcell();
		if(cell.isnull || cell.isNum()){ return;}

		cell.setQans((this.btn.Left?{0:12,12:13,13:11,11:0}:{0:11,11:13,13:12,12:0})[cell.qans]);
		cell.draw();
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	numberRemainsUnshaded : true,

	maxnum : function(){
		var bd=this.owner.board, bx=this.bx, by=this.by;
		var col = (((bx<(bd.maxbx>>1))?(bd.maxbx-bx):bx)>>1);
		var row = (((by<(bd.maxby>>1))?(bd.maxby-by):by)>>1);
		return Math.max(col, row);
	},
	minnum : 2
},
Board:{
	hasborder : 1,

	qcols : 8,
	qrows : 8,

	initialize : function(){
		this.common.initialize.call(this);

		this.barinfo = this.addInfoList(this.owner.AreaBarManager);
	},

	irowakeRemake : function(){
		this.barinfo.newIrowake();
	},

	getBarInfo : function(){ return this.barinfo.getBarInfo();}
},
BoardExec:{
	adjustBoardData : function(key,d){
		if(key & this.TURN){ // 回転だけ
			var tans = {0:0,11:11,12:13,13:12};
			var clist = this.owner.board.cell;
			for(var i=0;i<clist.length;i++){
				var cell = clist[i];
				cell.setQans(tans[cell.qans]);
			}
		}
	}
},

"AreaBarManager:AreaManager":{
	enabled : true,
	relation : ['cell'],
	
	isvalid : function(cell){
		return (cell.qans>0);
	},
	
	rebuild : function(){
		this.owner.AreaManager.prototype.rebuild.call(this);
		this.newIrowake();
	},
	
	calcLinkInfo : function(cell){
		return (this.linkinfo[cell.id] = {0:0,11:31,12:19,13:28}[cell.qans]);
	},

	irowakeEnable : function(){
		return this.owner.flags.irowake;
	},
	irowakeValid : function(){
		return this.owner.getConfig('irowake');
	},
	getNewColor : function(){
		return this.owner.painter.getNewLineColor();
	},

	getBarInfo : function(){
		var puzzle = this.owner, bd = puzzle.board;
		function eachcell(cell, vert){
			var qa = cell.qans, isbar = (qa===11 || qa===(vert?12:13));
			if(!bar && isbar){
				bar = binfo.addArea();
				bar.vert = vert;
				if(cell2!==null){ binfo.pole[cell2.id].push(bar.id);}
			}
			else if(!!bar && !isbar){
				binfo.pole[cell.id].push(bar.id);
				bar = null;
			}
			
			if(!!bar && isbar){
				bar.clist.add(cell);
				binfo.id[cell.id].push(bar.id);	// タテヨコで別のIDにするため、配列にする
			}
			cell2 = cell;
		}

		var binfo = new puzzle.AreaBarInfo();
		for(var bx=bd.minbx+1;bx<=bd.maxbx-1;bx+=2){
			var bar=null, cell2=null;
			for(var by=bd.minby+1;by<=bd.maxby-1;by+=2){
				eachcell(bd.getc(bx,by),true);
			}
		}
		for(var by=bd.minby+1;by<=bd.maxby-1;by+=2){
			var bar=null, cell2=null;
			for(var bx=bd.minbx+1;bx<=bd.maxbx-1;bx+=2){
				eachcell(bd.getc(bx,by),false);
			}
		}
		
		for(var c=0;c<bd.cellmax;c++){
			if(binfo.id[c].length===2){ /* 0～2になる */
				binfo.area[binfo.id[c][0]].link.push(binfo.id[c][1]);
				binfo.area[binfo.id[c][1]].link.push(binfo.id[c][0]);
			}
			if(bd.cell[c].isNum()){
				for(var i=0;i<binfo.pole[c].length;i++){
					binfo.area[binfo.pole[c][i]].pole.push(c);
				}
			}
			else{ binfo.pole[c] = [];}
		}
		return binfo;
	}
},
"AreaBarInfo:AreaInfo":{
	initialize : function(){
		this.owner.AreaInfo.prototype.initialize.call(this);

		this.pole = [];

		for(var c=0,len=this.owner.board.cellmax;c<len;c++){
			this.id[c]=[];
			this.pole[c]=[];
		}
	},
	addArea : function(){
		var areaid = ++this.max;
		return (this.area[areaid] = {
			clist:(new this.owner.CellList()), id:areaid,
			link:[], pole:[], vert:false
		});
	}
},
CellList:{
	setErrorBar : function(vert){
		for(var i=0;i<this.length;i++){
			var cell=this[i], err=cell.error;
			if     (err===4){ /* nop */ }
			else if(err===5){ if(!vert){ cell.seterr(4);}}
			else if(err===6){ if( vert){ cell.seterr(4);}}
			else{ cell.seterr(vert?5:6);}
		}
	}
},

/* 互換性のための定義 */
ObjectOperation:{
	decode : function(strs){
		var result = this.common.decode.call(this,strs);
		this.old = [0,12,13,11][this.old];
		this.num = [0,12,13,11][this.num];
		return result;
	}
},

Flags:{
	irowake : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	hideHatena : true,

	gridcolor_type : "LIGHT",
	linecolor_type : "LIGHT",

	fontcolor    : "black",
	fontErrcolor : "black",

	globalfontsizeratio : 0.85,
	circleratio : [0.45, 0.40],

	setRange : function(x1,y1,x2,y2){
		this.common.setRange.call(this, x1-2, y1-2, x2+2, y2+2);
	},
	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();

		this.drawTateyokos();
		this.drawTateyokos_sub();

		this.drawCircles();
		this.drawNumbers();

		this.drawPekeBorder();

		this.drawChassis();

		this.drawTarget();
	},

	// 白丸と線の間に隙間があいてしまうので、隙間部分を描画する
	drawTateyokos_sub : function(){
		var g = this.vinc('cell_tateyoko', 'crispEdges', true); /* 同じレイヤでよい */

		g.fillStyle = this.linecolor;
		var clist = this.range.cells;
		var bw = this.bw, bh = this.bh;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i], isnum = cell.isNum();

			var lw = Math.max(bw/3, 3);			//LineWidth
			var lp = (bw-lw/2);					//LinePadding
			var px = cell.bx*bw, py = cell.by*bh;

			var cell2 = cell.adjacent.top, qa = cell2.qans;
			g.vid = "c_bars1a_"+cell.id;
			if(isnum && (qa===11||qa===12)){
				g.fillStyle = this.getBarColor(cell2,true);
				g.fillRect(px-bw+lp, py-bh, lw, bh);
			}
			else{ g.vhide();}

			var cell2 = cell.adjacent.bottom, qa = cell2.qans;
			g.vid = "c_bars1b_"+cell.id;
			if(isnum && (qa===11||qa===12)){
				g.fillStyle = this.getBarColor(cell2,true);
				g.fillRect(px-bw+lp, py+1, lw, bh);
			}
			else{ g.vhide();}

			var cell2 = cell.adjacent.left, qa = cell2.qans;
			g.vid = "c_bars2a_"+cell.id;
			if(isnum && (qa===11||qa===13)){
				g.fillStyle = this.getBarColor(cell2,false);
				g.fillRect(px-bw, py-bh+lp, bw, lw);
			}
			else{ g.vhide();}

			var cell2 = cell.adjacent.right, qa = cell2.qans;
			g.vid = "c_bars2b_"+cell.id;
			if(isnum && (qa===11||qa===13)){
				g.fillStyle = this.getBarColor(cell2,false);
				g.fillRect(px+1, py-bh+lp, bw, lw);
			}
			else{ g.vhide();}
		}
	},

	drawPekeBorder : function(){
		var g = this.vinc('border_pbd', 'crispEdges', true);

		g.fillStyle = this.borderQsubcolor2;
		var rw = this.bw*0.6;
		var lm = this.lm;

		var blist = this.range.borders;
		for(var i=0;i<blist.length;i++){
			var border = blist[i];
			g.vid = "b_qsub2_"+border.id;
			if(border.qsub===2){
				var px = border.bx*this.bw, py = border.by*this.bh;
				if(border.isVert()){ g.fillRectCenter(px, py, lm, rw+lm);}
				else               { g.fillRectCenter(px, py, rw+lm, lm);}
			}
			else{ g.vhide();}
		}
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodeNumber10();
	},
	encodePzpr : function(type){
		this.encodeNumber10();
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCell( function(obj,ca){
			if     (ca==="l"){ obj.qans = 12;}
			else if(ca==="-"){ obj.qans = 13;}
			else if(ca==="+"){ obj.qans = 11;}
			else if(ca==="#"){ obj.qnum = -2;}
			else if(ca!=="."){ obj.qnum = +ca;}
		});
		this.decodeBorderLine();
	},
	encodeData : function(){
		this.encodeCell( function(obj){
			if     (obj.qans===12){ return "l ";}
			else if(obj.qans===13){ return "- ";}
			else if(obj.qans===11){ return "+ ";}
			else if(obj.qnum>=  0){ return obj.qnum+" ";}
			else if(obj.qnum===-2){ return "# ";}
			else                  { return ". ";}
		});
		this.encodeBorderLine();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checklist : [
		"checkNotMultiBar",

		"checkLoop_amibo",
		"checkLongBar",
		"checkCrossedLength",
		"checkShortBar",

		"checkSingleBar",

		"checkAllBarConnect+"
	],

	getBarInfo : function(){
		return (this._info.bar = this._info.bar || this.owner.board.getBarInfo());
	},
	getConnectionInfo : function(){
		return (this._info.bararea = this._info.bararea || this.owner.board.barinfo.getAreaInfo());
	},

	checkNotMultiBar : function(){ this.checkOutgoingBars(1, "nmLineGt1");},
	checkSingleBar   : function(){ this.checkOutgoingBars(2, "nmNoLine");},
	checkOutgoingBars : function(type, code){
		var bd = this.owner.board;
		var binfo = this.getBarInfo();
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c];
			if(!cell.isNum()){ continue;}
			var cid = binfo.pole[c];
			if((type===1 && cid.length<=1) || (type===2 && cid.length>0)){ continue;}
			
			this.failcode.add(code);
			if(this.checkOnly){ break;}
			cell.seterr(1);
		}
	},
	checkLongBar  : function(){ this.checkPoleLength(1, "lbLenGt");},
	checkShortBar : function(){ this.checkPoleLength(2, "lbLenLt");},
	checkPoleLength : function(type, code){
		var result = true, bd = this.owner.board;
		var binfo = this.getBarInfo();
		
		allloop:
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c];
			if(!cell.isValidNum()){ continue;}
			for(var i=0,len=binfo.pole[c].length;i<len;i++){
				var qn=cell.getNum(), id=binfo.pole[c][i], bar = binfo.area[id], clist = bar.clist, llen=clist.length;
				if((type===1 && llen<=qn) || (type===2 && llen>=qn)){ continue;}
				
				result = false;
				if(this.checkOnly){ break allloop;}
				cell.seterr(1);
				clist.setErrorBar(bar.vert);
			}
		}
		if(!result){
			this.failcode.add(code);
			bd.cell.filter(function(cell){ return cell.noNum();}).setnoerr();
		}
	},
	checkCrossedLength : function(){
		var result=true;
		var binfo = this.getBarInfo();
		for(var id=1,max=binfo.max;id<=max;id++){
			var check = false, bar = binfo.area[id], linkid = bar.link, clist = bar.clist;
			for(var i=0,len=linkid.length;i<len;i++){
				if(clist.length===binfo.area[linkid[i]].clist.length){ check=true; break;}
			}
			if(check){ continue;}
			
			result = false;
			if(this.checkOnly){ break;}
			clist.setErrorBar(bar.vert);
		}
		if(!result){
			this.failcode.add("lbNotCrossEq");
			this.owner.board.cell.filter(function(cell){ return cell.noNum();}).setnoerr();
		}
	},

	checkAllBarConnect : function(){
		this.checkOneArea(this.getConnectionInfo(), "lbDivide");
	},

	checkLoop_amibo : function(){
		var sinfo={cell:[]}, bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			sinfo.cell[c] = bd.barinfo.getLinkCell(bd.cell[c]);
		}

		var sdata=[];
		for(var c=0;c<bd.cellmax;c++){ sdata[c] =(bd.cell[c].qans!==0?0:null);}
		for(var c=0;c<bd.cellmax;c++){
			if(sdata[c]!==0){ continue;}
			this.searchloop(c, sinfo, sdata);
		}

		var errclist = bd.cell.filter(function(cell){ return (sdata[cell.id]===1);});
		if(errclist.length>0){
			this.failcode.add("lbLoop");
			bd.cell.filter(function(cell){ return cell.noNum();}).setnoerr();
			errclist.seterr(4);
		}
	},
	searchloop : function(fc, sinfo, sdata){
		var passed=[], history=[fc];
		for(var c=0;c<this.owner.board.cellmax;c++){ passed[c]=false;}

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

FailCode:{
	lbDivide : ["棒が１つに繋がっていません。","Bars are devided."],
	lbLenGt : ["白丸から出る棒の長さが長いです。","The length of the bar is long."],
	lbLenLt : ["白丸から出る棒の長さが短いです。","The length of the bar is short."],
	lbLoop : ["棒で輪っかができています。","There is a looped bars."],
	lbNotCrossEq : ["同じ長さの棒と交差していません。","A bar doesn't cross the bar whose length is the same."],
	nmLineGt1 : ["白丸に線が2本以上つながっています。","Prural lines connect to a white circle."],
	nmNoLine  : ["白丸に線がつながっていません。","No bar connects to a white circle."]
}
});
