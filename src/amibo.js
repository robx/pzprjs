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
		var cc = this.cellid();
		if(cc===null){ return;}

		var pos = new pzprv3.core.Address(bd.cell[cc].bx, bd.cell[cc].by);
		var input=false;

		// 初回はこの中に入ってきます。
		if(this.mouseCell===null){ this.firstPoint.set(this.inputPoint);}
		// 黒マス上なら何もしない
		else if(bd.isNum(cc)){ }
		// まだ入力されていない(1つめの入力の)場合
		else if(this.inputData===null){
			if(cc===this.mouseCell){
				var mx=Math.abs(this.inputPoint.x-this.firstPoint.x);
				var my=Math.abs(this.inputPoint.y-this.firstPoint.y);
				if     (my>=8){ this.inputData=1; input=true;}
				else if(mx>=8){ this.inputData=2; input=true;}
			}
			else{
				var dir = this.getdir(this.prevPos, pos);
				if     (dir===bd.UP || dir===bd.DN){ this.inputData=1; input=true;}
				else if(dir===bd.LT || dir===bd.RT){ this.inputData=2; input=true;}
			}

			if(input){
				if(bd.QaC(cc) & this.inputData){ this.inputData*=-1;}
				this.firstPoint.reset();
			}
		}
		// 入力し続けていて、別のマスに移動した場合
		else if(cc!==this.mouseCell){
			var dir = this.getdir(this.prevPos, pos);
			if     (dir===bd.UP || dir===bd.DN){ this.inputData=(this.inputData>0?1:-1); input=true;}
			else if(dir===bd.LT || dir===bd.RT){ this.inputData=(this.inputData>0?2:-2); input=true;}
		}

		// 描画・後処理
		if(input){
			if     (this.inputData=== 1){ bd.sQaC(cc,[1,1,3,3][bd.QaC(cc)]);}
			else if(this.inputData=== 2){ bd.sQaC(cc,[2,3,2,3][bd.QaC(cc)]);}
			else if(this.inputData===-1){ bd.sQaC(cc,[0,0,2,2][bd.QaC(cc)]);}
			else if(this.inputData===-2){ bd.sQaC(cc,[0,1,0,1][bd.QaC(cc)]);}
			pc.paintCell(cc);
		}
		this.prevPos   = pos;
		this.mouseCell = cc;
	},
	clickTateyoko : function(){
		var cc  = this.cellid();
		if(cc===null || bd.isNum(cc)){ return;}

		bd.sQaC(cc, (this.btn.Left?[1,2,3,0]:[3,0,1,2])[bd.QaC(cc)]);
		pc.paintCell(cc);
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
Board:{
	isborder : 1,

	qcols : 8,
	qrows : 8,

	numberIsWhite : true,

	nummaxfunc : function(cc){
		var bx=this.cell[cc].bx, by=this.cell[cc].by;
		var col = (((bx<(this.maxbx>>1))?(this.maxbx-bx):bx)>>1);
		var row = (((by<(this.maxby>>1))?(this.maxby-by):by)>>1);
		return Math.max(col, row);
	},
	minnum : 2,

	getBarInfo : function(){
		var self = this;
		function eachcell(tc, qa_chk, vert){
			var tc=self.cnum(bx,by), qa=self.QaC(tc);
			if(qa===qa_chk||qa===3){
				if(id===null){
					binfo.max++;
					binfo.room[binfo.max] = {idlist:[],link:[],pole:[],vert:vert};
					id=binfo.max;
					if(tc0!==null){ binfo.pole[tc0].push(id);}
				}
				binfo.room[id].idlist.push(tc);
				binfo.id[tc].push(id);
			}
			else if(id!==null){ binfo.pole[tc].push(id); id=null;}
			tc0 = tc;
		}

		var binfo = new pzprv3.core.AreaInfo();
		binfo.pole = [];
		for(var c=0;c<this.cellmax;c++){ binfo.id[c]=[]; binfo.pole[c]=[];}
		for(var bx=this.minbx+1;bx<=this.maxbx-1;bx+=2){
			var id=null, tc0=null;
			for(var by=this.minby+1;by<=this.maxby-1;by+=2){
				eachcell(this.cnum(bx,by),1,true);
			}
		}
		for(var by=this.minby+1;by<=this.maxby-1;by+=2){
			var id=null, tc0=null;
			for(var bx=this.minbx+1;bx<=this.maxbx-1;bx+=2){
				eachcell(this.cnum(bx,by),2,false);
			}
		}
		
		for(var c=0;c<this.cellmax;c++){
			if(binfo.id[c].length==2){ /* 0～2になる */
				binfo.room[binfo.id[c][0]].link.push(binfo.id[c][1]);
				binfo.room[binfo.id[c][1]].link.push(binfo.id[c][0]);
			}
			if(this.isNum(c)){
				for(var i=0;i<binfo.pole[c].length;i++){
					binfo.room[binfo.pole[c][i]].pole.push(c);
				}
			}
			else{ binfo.pole[c] = [];}
		}
		return binfo;
	},

	setErrorBar : function(bardata){
		var clist = bardata.idlist, vert = bardata.vert;
		for(var i=0;i<clist.length;i++){
			var c=clist[i], err=this.cell[c].error;
			if     (err===4){ /* nop */ }
			else if(err===5){ if(!vert){ this.sErC([c],4);}}
			else if(err===6){ if( vert){ this.sErC([c],4);}}
			else{ this.sErC([c],(vert?5:6));}
		}
	}
},

AreaManager:{
	initialize : function(owner){
		this.owner = owner;
		this.barinfo = null;

		this.disrec = 0;
	},

	init : function(){
		this.barinfo = new this.owner.classes.AreaBarData(this.owner);
	},
	resetArea : function(){
		this.barinfo.reset();
	},

	setCell : function(cc){
		if(!this.isenableRecord()){ return;}

		this.barinfo.setCell(cc);
	}
},

MenuExec:{
	adjustBoardData : function(key,d){
		if(key & this.TURN){ // 回転だけ
			for(var c=0;c<bd.cellmax;c++){ bd.sQaC(c,[0,2,1,3][bd.QaC(c)]);}
		}
	},

	irowakeRemake : function(){
		bd.areas.barinfo.newIrowake();
		if(pp.getVal('irowake')){ pc.paintAll();}
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
		this.SuperFunc.setRange.call(this,x1-2,y1-2,x2+2,y2+2);
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

	getBarColor : function(c,vert){
		var err=bd.cell[c].error, color="";
		if(err===1||err===4||((err===5&&vert)||(err===6&&!vert))){ color = this.errlinecolor1;}
		else if(err!==0){ color = this.errlinecolor2;}
		else if(!pp.getVal('irowake') || !bd.cell[c].color){ color = this.linecolor;}
		else{ color = bd.cell[c].color;}
		return color;
	},

	drawTateyokos : function(){
		var g = this.vinc('cell_tateyoko', 'crispEdges');

		var headers = ["c_bar1_", "c_bar2_"];
		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var c = clist[i];
			var lw = Math.max(this.cw/6, 3);	//LineWidth
			var lp = (this.bw-lw/2);			//LinePadding

			var qa=bd.cell[c].qans;

			if(qa!==-1){
				if(qa===1 || qa===3){
					g.fillStyle = this.getBarColor(c,true);
					if(this.vnop(headers[0]+c,this.FILL)){
						g.fillRect(this.cell[c].rpx+lp, this.cell[c].rpy, lw, this.ch+1);
					}
				}
				else{ this.vhide(headers[0]+c);}

				if(qa===2 || qa===3){
					g.fillStyle = this.getBarColor(c,false);
					if(this.vnop(headers[1]+c,this.FILL)){
						g.fillRect(this.cell[c].rpx, this.cell[c].rpy+lp, this.cw+1, lw);
					}
				}
				else{ this.vhide(headers[1]+c);}
			}
			else{ this.vhide([headers[0]+c, headers[1]+c]);}
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
			var c = clist[i];
			if(!bd.isNum(c)){
				this.vhide([headers[0]+c, headers[1]+c, headers[2]+c, headers[3]+c]);
				continue;
			}

			var lw = Math.max(this.cw/6, 3);	//LineWidth
			var lp = (this.bw-lw/2);			//LinePadding
			var px = this.cell[c].px, this.cell[c].py;

			var cc = bd.up(c);
			if(cc!==null && (bd.cell[cc].qans===1||bd.cell[cc].qans===3)){
				g.fillStyle = this.getBarColor(cc,true);
				if(this.vnop(headers[0]+c,this.FILL)){
					g.fillRect(px-bw+lp, py-bh, lw, bh);
				}
			}
			else{ this.vhide(headers[0]+c);}

			var cc = bd.dn(c);
			if(cc!==null && (bd.cell[cc].qans===1||bd.cell[cc].qans===3)){
				g.fillStyle = this.getBarColor(cc,true);
				if(this.vnop(headers[1]+c,this.FILL)){
					g.fillRect(px-bw+lp, py+1, lw, bh);
				}
			}
			else{ this.vhide(headers[1]+c);}

			var cc = bd.lt(c);
			if(cc!==null && (bd.cell[cc].qans===2||bd.cell[cc].qans===3)){
				g.fillStyle = this.getBarColor(cc,false);
				if(this.vnop(headers[2]+c,this.FILL)){
					g.fillRect(px-bw, py-bh+lp, bw, lw);
				}
			}
			else{ this.vhide(headers[2]+c);}

			var cc = bd.rt(c);
			if(cc!==null && (bd.cell[cc].qans===2||bd.cell[cc].qans===3)){
				g.fillStyle = this.getBarColor(cc,false);
				if(this.vnop(headers[3]+c,this.FILL)){
					g.fillRect(px+1, py-bh+lp, bw, lw);
				}
			}
			else{ this.vhide(headers[3]+c);}
		}
	},

	drawPekeBorder : function(){
		var g = this.vinc('border_pbd', 'crispEdges');

		g.fillStyle = "rgb(64,64,64)";
		var header = "b_qsub2_";

		var idlist = this.range.borders;
		for(var i=0;i<idlist.length;i++){
			var id = idlist[i];
			if(bd.border[id].qsub===2){
				if(this.vnop(header+id,this.NONE)){
					var lw = this.lw + this.addlw, lm = this.lm, mgn=this.ch*0.2;
					var bx = bd.border[id].bx, by = bd.border[id].by;
					var px = this.border[id].px, py = this.border[id].py;
					if     (by&1){ g.fillRect(px-lm, py-this.bh-lm+mgn, lw, this.ch+lw-mgn*2);}
					else if(bx&1){ g.fillRect(px-this.bw-lm+mgn, py-lm, this.cw+lw-mgn*2, lw);}
				}
			}
			else{ this.vhide(header+id);}
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

		for(var c=0;c<bd.cellmax;c++){ if(!bd.isNum(c)){ bd.sErC([c],2);}}
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
		for(var i=0;i<bd.cellmax;i++){ bd.sErC([i],0);}

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
			if(!bd.isNum(c)){ continue;}
			var cid = binfo.pole[c];
			if((type===1 && cid.length>1) || (type===2 && cid.length===0)){
				if(this.inAutoCheck){ return false;}
				bd.sErC([c],1);
				result = false;
			}
		}
		return result;
	},
	checkPoleLength : function(binfo,type){
		var result=true;
		for(var c=0;c<bd.cellmax;c++){
			if(!bd.isValidNum(c)){ continue;}
			for(var i=0,len=binfo.pole[c].length;i<len;i++){
				var qn=bd.getNum(c), id=binfo.pole[c][i], llen=binfo.room[id].idlist.length;
				if((type===1 && llen>qn) || (type===2 && llen<qn)){
					if(this.inAutoCheck){ return false;}
					bd.sErC([c],1);
					bd.setErrorBar(binfo.room[id]);
					result = false;
				}
			}
		}
		return result;
	},
	checkCrossedLength : function(binfo){
		var result=true;
		for(var id=1,len=binfo.room.length;id<len;id++){
			var check = false;
			for(var i=0,len2=binfo.room[id].link.length;i<len2;i++){
				var id2 = binfo.room[id].link[i];
				if(binfo.room[id].idlist.length===binfo.room[id2].idlist.length){ check=true; break;}
			}
			if(!check){
				if(this.inAutoCheck){ return false;}
				bd.setErrorBar(binfo.room[id]);
				result = false;
			}
		}
		return result;
	},

	checkLoop : function(){
		var result=true, sinfo={cell:[]};
		for(var c=0;c<bd.cellmax;c++){
			sinfo.cell[c] = bd.areas.barinfo.getcid(c, bd.areas.barinfo.cellinfo[c]);
		}

		var sdata=[];
		for(var c=0;c<bd.cellmax;c++){ sdata[c] =(bd.QaC(c)!==0?0:null);}
		for(var c=0;c<bd.cellmax;c++){
			if(sdata[c]!==0){ continue;}
			this.searchloop(c, sinfo, sdata);
		}

		for(var c=0;c<bd.cellmax;c++){
			if(sdata[c]===1){
				if(this.inAutoCheck){ return false;}
				bd.sErC([c],4);
				result = false;
			}
		}
		return result;
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

	isvalid : function(c){ return (bd.QaC(c)>0)},

	//--------------------------------------------------------------------------------
	// info.reset() 線の情報を初期化する
	//--------------------------------------------------------------------------------
	reset : function(){
		pzprv3.core.AreaData.prototype.reset.call(this);
		this.newIrowake();
	},

	//--------------------------------------------------------------------------------
	// info.setCell()        線が入力されたり消された時に、線IDの情報を変更する
	// info.setCell_main()   線が入力されたり消された時に、線IDの情報を変更する
	//--------------------------------------------------------------------------------
	setCell : function(cc){
		var val = this.getlink(cc), old = this.cellinfo[cc];
		if(val===old){ return;}
		else if(val===0||val===15||old===0||old===15){
			this.setCell_main(cc, val, old);
		}
		else{
			this.setCell_main(cc, 0, old);
			this.setCell_main(cc, val, 0);
		}
	},
	setCell_main : function(cc, val, old){
		this.cellinfo[cc] = val;

		var isset = (val>old), cid = this.getcid(cc, (val>old?val:old));
		// 新たに黒マス(白マス)になった時
		if(isset){
			if(cid.length===0 && old!==0){ /* nop */ }
			if(cid.length<=1){ this.assignCell(cc, (cid.length===1?cid[0]:null));}
			else             { this.combineInfo(cc, cid);}
		}
		// 黒マス(白マス)ではなくなった時
		else{
			if(cid.length===0 && val!==0){ /* nop */ }
			else if(cid.length<=1 && val===0){ this.removeCell(cc);}
			else                             { this.remakeInfo(cc, cid);}
		}
	},

	//--------------------------------------------------------------------------------
	// info.getlink() 上下左右に繋がるかの情報を取得する
	//--------------------------------------------------------------------------------
	getlink : function(cc){
		return [0,3,12,15][bd.QaC(cc)];
		var val = 0, qa = bd.QaC(cc);
		if(qa>0 && this.isvalid(cc)){
			if(bd.ub(cc)!==null && qa!==2){ val+=1;}
			if(bd.db(cc)!==null && qa!==2){ val+=2;}
			if(bd.lb(cc)!==null && qa!==1){ val+=4;}
			if(bd.rb(cc)!==null && qa!==1){ val+=8;}
		}
		return val;
	}
}
};
