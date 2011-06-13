//
// パズル固有スクリプト部 あみぼー版 amibo.js v3.4.0
//
pzprv3.custom.amibo = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mousedown : function(){
		if     (k.editmode){ this.inputqnum();}
		else if(k.playmode){
			if     (this.btn.Left) { this.inputTateyoko();}
			else if(this.btn.Right){ this.inputpeke();}
		}
	},
	mouseup : function(){
		if(k.playmode && this.notInputted()){ this.clickTateyoko();}
	},
	mousemove : function(){
		if(k.playmode){
			if     (this.btn.Left) { this.inputTateyoko();}
			else if(this.btn.Right){ this.inputpeke();}
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
Cell:{
	color : ""
},

Board:{
	isborder : 1,

	qcols : 8,
	qrows : 8,

	numberIsWhite : true,

	initialize : function(pid){
		this.SuperFunc.initialize.call(this,pid);

		this.bars = new (pzprv3.getPuzzleClass('BarManager'))();

		this.posthook.cell.qans = this.setInfo;
	},
	initBoardSize : function(col,row){
		this.SuperFunc.initBoardSize.call(this,col,row);

		this.bars.init();
	},

	setInfo : function(c,num){
		this.bars.setCell(c);
	},

	disableInfo : function(){
		this.SuperFunc.disableInfo.call(this);
		this.bars.disableRecord();
	},
	enableInfo : function(){
		this.SuperFunc.enableInfo.call(this);
		this.bars.enableRecord();
	},
	resetInfo : function(){
		this.bars.resetInfo();
	},

	nummaxfunc : function(cc){
		var bx=this.cell[cc].bx, by=this.cell[cc].by;
		var col = (((bx<(this.maxbx>>1))?(this.maxbx-bx):bx)>>1);
		var row = (((by<(this.maxby>>1))?(this.maxby-by):by)>>1);
		return Math.max(col, row);
	},

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

MenuExec:{
	adjustBoardData : function(key,d){
		if(key & this.TURN){ // 回転だけ
			for(var c=0;c<bd.cellmax;c++){ bd.sQaC(c,[0,2,1,3][bd.QaC(c)]);}
		}
	},

	irowakeRemake : function(){
		bd.bars.newIrowake();
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
						g.fillRect(bd.cell[c].px+lp, bd.cell[c].py, lw, this.ch+1);
					}
				}
				else{ this.vhide(headers[0]+c);}

				if(qa===2 || qa===3){
					g.fillStyle = this.getBarColor(c,false);
					if(this.vnop(headers[1]+c,this.FILL)){
						g.fillRect(bd.cell[c].px, bd.cell[c].py+lp, this.cw+1, lw);
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
		for(var i=0;i<clist.length;i++){
			var c = clist[i];
			if(!bd.isNum(c)){
				this.vhide([headers[0]+c, headers[1]+c, headers[2]+c, headers[3]+c]);
				continue;
			}

			var lw = Math.max(this.cw/6, 3);	//LineWidth
			var lp = (this.bw-lw/2);			//LinePadding

			var cc = bd.up(c);
			if(cc!==null && (bd.cell[cc].qans===1||bd.cell[cc].qans===3)){
				g.fillStyle = this.getBarColor(cc,true);
				if(this.vnop(headers[0]+c,this.FILL)){
					g.fillRect(bd.cell[c].px+lp, bd.cell[c].py, lw, this.bh);
				}
			}
			else{ this.vhide(headers[0]+c);}

			var cc = bd.dn(c);
			if(cc!==null && (bd.cell[cc].qans===1||bd.cell[cc].qans===3)){
				g.fillStyle = this.getBarColor(cc,true);
				if(this.vnop(headers[1]+c,this.FILL)){
					g.fillRect(bd.cell[c].px+lp, bd.cell[c].py+this.bh+1, lw, this.bh);
				}
			}
			else{ this.vhide(headers[1]+c);}

			var cc = bd.lt(c);
			if(cc!==null && (bd.cell[cc].qans===2||bd.cell[cc].qans===3)){
				g.fillStyle = this.getBarColor(cc,false);
				if(this.vnop(headers[2]+c,this.FILL)){
					g.fillRect(bd.cell[c].px, bd.cell[c].py+lp, this.bw, lw);
				}
			}
			else{ this.vhide(headers[2]+c);}

			var cc = bd.rt(c);
			if(cc!==null && (bd.cell[cc].qans===2||bd.cell[cc].qans===3)){
				g.fillStyle = this.getBarColor(cc,false);
				if(this.vnop(headers[3]+c,this.FILL)){
					g.fillRect(bd.cell[c].px+this.bw+1, bd.cell[c].py+lp, this.bw, lw);
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
					var px = bd.border[id].px, py = bd.border[id].py;
					if     (by&1){ g.fillRect(px-lm, py-this.bh-lm+mgn, lw, this.ch+lw-mgn*2);}
					else if(bx&1){ g.fillRect(px-this.bw-lm+mgn, py-lm, this.cw+lw-mgn*2, lw);}
				}
			}
			else{ this.vhide(header+id);}
		}
	},

	repaintBars : function(clist){
		var d = bd.getSizeOfClist(clist);
		this.paintRange(d.x1,d.y1,d.x2,d.y2);
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

		if( !this.checkOneArea( bd.bars.getAreaInfo() ) ){
			this.setAlert('棒が１つに繋がっていません。','Bars are devided.'); return false;
		}

		return true;
	},
	check1st : function(){ return this.checkOneArea( bd.bars.getAreaInfo() );},

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
			sinfo.cell[c]=bd.bars.getcid(c, (!bd.isNum(c)?bd.QaC(c):0));
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
BarManager:{
	initialize : function(){
		this.cellinfo = {};	// qansを保持しておく

		this.barinfo = {};	// 線の情報を保持する
		this.disrec = 0;
	},

	//--------------------------------------------------------------------------------
	// bars.disableRecord()  操作の登録を禁止する
	// bars.enableRecord()   操作の登録を許可する
	// bars.isenableRecord() 操作の登録できるかを返す
	//--------------------------------------------------------------------------------
	disableRecord : function(){ this.disrec++; },
	enableRecord  : function(){ if(this.disrec>0){ this.disrec--;} },
	isenableRecord : function(){ return (this.disrec===0);},

	//--------------------------------------------------------------------------------
	// bars.init()      黒マス関連の変数を初期化する
	// bars.resetInfo() 黒マスの情報をresetして、1から割り当てしなおす
	//--------------------------------------------------------------------------------
	init : function(){
		this.barinfo = {max:0,id:[]};
		for(var c=0;c<bd.cellmax;c++){
			this.cellinfo[c] = 0;
			this.barinfo.id[c] = null;
		}
	},
	resetInfo : function(){
		this.init();
		for(var cc=0;cc<bd.cellmax;cc++){
			this.cellinfo[cc] = bd.QaC(cc);
			this.barinfo.id[cc]=(this.cellinfo[cc]!==0 ? 0 : null);
		}
		for(var cc=0;cc<bd.cellmax;cc++){
			if(this.barinfo.id[cc]!==0){ continue;}
			this.barinfo.max++;
			this.barinfo[this.barinfo.max] = {clist:[]};
			this.sc0(cc,this.barinfo);
		}
		this.newIrowake();
	},

	//---------------------------------------------------------------------------
	// bars.newIrowake()  線の情報が再構築された際、線に色をつける
	//---------------------------------------------------------------------------
	newIrowake : function(){
		for(var i=1;i<=this.barinfo.max;i++){
			var clist = this.barinfo[i].clist;
			if(clist.length>0){
				var newColor = pc.getNewLineColor();
				for(var n=0;n<clist.length;n++){
					bd.cell[clist[n]].color = newColor;
				}
			}
		}
	},

	//--------------------------------------------------------------------------------
	// bars.setCell()        線が入力されたり消された時に、線IDの情報を変更する
	// bars.setBar()         線が入力されたり消された時に、線IDの情報を変更する
	// bars.combineBarInfo() 線が引かれた時に、周りの線が全てくっついて1つの線が
	//                       できる場合の線idの再設定を行う
	// bars.remakeBarInfo()  線が引かれたり消された時、新たに2つ以上の線ができる
	//                       可能性がある場合の線idの再設定を行う
	// bars.sc0()            初期idを含む一つの領域内のareaidを指定されたものにする
	//--------------------------------------------------------------------------------
	setCell : function(cc){
		if(!this.isenableRecord()){ return;}

		var val = bd.QaC(cc), old = this.cellinfo[cc];
		if(val===old){ return;}
		else if(val===0||val===3||old===0||old===3){
			this.setBar(cc, val, old);
		}
		else{
			this.setBar(cc, 0, old);
			this.setBar(cc, val, 0);
		}
	},
	setBar : function(cc, val, old){
		this.cellinfo[cc] = val;

		var isset = (val>old), data = this.barinfo, dataid = data.id;
		var cid = this.getcid(cc, (val>old?val:old));

		// 新たに線が引かれた場合
		if(isset){
			// まわりに線がない時は新しいIDで登録です
			if(cid.length===0){
				if(old===0){
					data.max++;
					data[data.max] = {clist:[cc]};
					dataid[cc] = data.max;
					bd.cell[cc].color = pc.getNewLineColor();
				}
			}
			// 1方向にあるときは、そこにくっつけばよい
			else if(cid.length===1){
				data[dataid[cid[0]]].clist.push(cc);
				dataid[cc] = dataid[cid[0]];
				bd.cell[cc].color = bd.cell[cid[0]].color;
			}
			// 2方向以上の時
			else{
				this.combineBarInfo(cc,cid);
			}
		}
		// 線が消えた場合
		else{
			// まわりに線がない時は情報を消去するだけ
			if(cid.length===0){
				if(val===0){
					data[dataid[cc]].clist = [];
					dataid[cc] = null;
					bd.cell[cc].color = "";
				}
			}
			// まわり1方向の時も自分を消去するだけでよい
			else if(cid.length===1 && val===0){
				var ownid = dataid[cc], clist = data[ownid].clist;
				for(var i=0;i<clist.length;i++){ if(clist[i]===cc){ clist.splice(i,1); break;} }
				dataid[cc] = null;
				bd.cell[cc].color = "";
			}
			// 2方向以上の時は考慮が必要
			else{
				this.remakeBarInfo(cc,cid);
			}
		}
	},
	combineBarInfo : function(cc, cid){
		var data=this.barinfo, dataid = data.id;

		// 周りで一番大きな線は？
		var largeid = dataid[cid[0]];
		var newColor = bd.cell[cid[0]].color;
		for(var i=1;i<cid.length;i++){
			if(data[largeid].clist.length < data[dataid[cid[i]]].clist.length){
				largeid = dataid[cid[i]];
				newColor = bd.cell[cid[i]].color;
			}
		}
		// つながった線は全て同じIDにする
		for(var i=0;i<cid.length;i++){
			var lineid = dataid[cid[i]];
			if(lineid===largeid){ continue;}
			var clist = data[lineid].clist;
			for(var n=0,len=clist.length;n<len;n++){
				dataid[clist[n]] = largeid;
				data[largeid].clist.push(clist[n]);
			}
			data[lineid].clist = [];
		}
		// 自分をくっつける
		if(dataid[cc]!==largeid){
			dataid[cc] = largeid;
			data[largeid].clist.push(cc);
		}

		// 色を同じにする
		for(var i=0,len=data[largeid].clist.length;i<len;i++){
			bd.cell[data[largeid].clist[i]].color = newColor;
		}
		if(pp.getVal('irowake')){ pc.repaintBars(data[largeid].clist);}
	},
	remakeBarInfo : function(cc, cid){
		var data=this.barinfo, dataid = data.id;

		// 一度自分を含む領域の線情報を無効にする
		var ownid = dataid[cc], org_clist = data[ownid].clist, longColor = bd.cell[cc].color;
		for(var i=0;i<org_clist.length;i++){ dataid[org_clist[i]] = 0;}
		data[ownid].clist = [];

		// 自分を線情報から消去 or くっつけなおす
		if(bd.QaC(cc)===0){
			dataid[cc] = null;
			bd.cell[cc].color = "";
		}
		else{ cid.unshift(cc);}

		// まわりのIDが0なセルに線IDをセットしていく
		var ids = [];
		for(var i=0;i<cid.length;i++){
			if(dataid[cid[i]]!==0){ continue;}
			data.max++;
			data[data.max] = {clist:[]};
			this.sc0(cid[i],data);
			ids.push(data.max);
		}

		// できた中でもっとも長い線に、従来最も長かった線の色を継承する
		// それ以外の線には新しい色を付加する
		if(ids.length>1){
			// できた線の中でもっとも長いものを取得する
			var longid = ids[0];
			for(var i=1;i<ids.length;i++){
				if(data[longid].clist.length < data[ids[i]].clist.length){ longid = ids[i];}
			}

			// 新しい色の設定
			for(var i=0;i<ids.length;i++){
				var newColor = (ids[i]===longid ? longColor : pc.getNewLineColor());
				var clist = data[ids[i]].clist;
				for(var n=0,len=clist.length;n<len;n++){ bd.cell[clist[n]].color = newColor;}
			}
			if(pp.getVal('irowake')){ pc.repaintBars(org_clist);}
		}
	},

	sc0 : function(c,data){
		data.id[c] = data.max;
		data[data.max].clist.push(c);

		var cid = this.getcid(c, this.cellinfo[c]);
		for(var i=0;i<cid.length;i++){ if(data.id[cid[i]]===0){ this.sc0(cid[i],data);}}
	},

	getcid : function(c,qa){
		var cid = [], dataid = this.barinfo.id, tc;
		if(qa!==2){
			tc=bd.up(c); if(tc!==null && dataid[tc]!==null && bd.QaC(tc)!==2){ cid.push(tc);}
			tc=bd.dn(c); if(tc!==null && dataid[tc]!==null && bd.QaC(tc)!==2){ cid.push(tc);}
		}
		if(qa!==1){
			tc=bd.lt(c); if(tc!==null && dataid[tc]!==null && bd.QaC(tc)!==1){ cid.push(tc);}
			tc=bd.rt(c); if(tc!==null && dataid[tc]!==null && bd.QaC(tc)!==1){ cid.push(tc);}
		}
		return cid;
	},

	//--------------------------------------------------------------------------------
	// bars.getAreaInfo()  情報をAreaInfo型のオブジェクトで返す
	//--------------------------------------------------------------------------------
	getAreaInfo : function(block){
		var data = this.barinfo, info = new pzprv3.core.AreaInfo();
		for(var c=0;c<bd.cellmax;c++){ info.id[c]=(data.id[c]>0?0:null);}
		for(var c=0;c<bd.cellmax;c++){
			if(info.id[c]!==0){ continue;}
			info.max++;
			var clist = data[data.id[c]].clist;
			info.room[info.max] = {idlist:clist}; /* 参照だけなのでconcat()じゃなくてよい */
			for(var i=0,len=clist.length;i<len;i++){ info.id[clist[i]] = info.max;}
		}
		return info;
	}

}
};
