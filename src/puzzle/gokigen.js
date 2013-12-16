//
// パズル固有スクリプト部 ごきげんななめ、ごきげんななめ・輪切版 gokigen.js v3.4.0
//
(function(){

var k = pzpr.consts;

pzpr.createCustoms('gokigen', {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.owner.playmode && this.mousestart){
			this.inputslash();
		}
		else if(this.owner.editmode && this.mousestart){
			if(this.owner.pid==='gokigen')    { this.inputcross();}
			else if(this.owner.pid==='wagiri'){ this.inputquestion();}
		}
	},
	inputRed : function(){
		if(this.owner.playmode){
			if(this.owner.pid==='gokigen'){ this.dispBlue();}
		}
	},

	inputslash : function(){
		var cell = this.getcell();
		if(cell.isnull){ return;}

		var use = this.owner.get('use'), sl=(this.btn.Left?31:32), qa = cell.getQans();
		if     (use===1){ cell.setQans(qa!==sl?sl:0);}
		else if(use===2){ cell.setQans((this.btn.Left?{0:31,31:32,32:0}:{0:32,31:0,32:31})[qa]);}

		cell.drawaround();
	}
},
"MouseEvent@gokigen":{
	dispBlue : function(){
		var cell = this.getcell();
		this.mousereset();
		if(cell.isnull || cell.getQans()===0){ return;}

		var fcross = cell.relcross((cell.qans===31?-1:1), -1);
		var bd = this.owner.board, check = bd.searchline(fcross);
		for(var c=0;c<bd.cellmax;c++){
			var cell2 = bd.cell[c];
			if(cell2.getQans()===31 && check[cell2.relcross(-1,-1).id]===1){ cell2.seterr(2);}
			if(cell2.getQans()===32 && check[cell2.relcross( 1,-1).id]===1){ cell2.seterr(2);}
		}

		bd.haserror = true;
		this.owner.redraw();
	}
},
"MouseEvent@wagiri":{
	inputquestion : function(){
		var pos = this.getpos(0.33);
		if(!pos.isinside()){ return;}

		if(!this.cursor.pos.equals(pos)){
			this.setcursorpos(pos);
		}
		else if(pos.oncross()){
			this.inputcross();
		}
		else if(pos.oncell()){
			this.inputwagiri(pos);
		}
	},
	inputwagiri : function(pos){
		var cell = pos.getc();
		if(cell.isnull){ return;}

		var trans = (this.btn.Left ? [-1,1,0,2,-2] : [2,-2,0,-1,1]);
		cell.setNum(trans[cell.getQnum()+2]);
		cell.draw();
	}
},

//---------------------------------------------------------
// キーボード入力系
"KeyEvent@gokigen":{
	enablemake : true,
	moveTarget : function(ca){ return this.moveTCross(ca);},

	keyinput : function(ca){
		this.key_inputcross(ca);
	}
},
"KeyEvent@wagiri":{
	enablemake : true,
	moveTarget : function(ca){ return this.moveTBorder(ca);},

	keyinput : function(ca){
		this.key_wagiri(ca);
	},
	key_wagiri : function(ca){
		var pos = this.cursor.getTCP();
		if(pos.oncross()){
			this.key_inputcross(ca);
		}
		else if(pos.oncell()){
			var cell = this.cursor.getTCC(), val = 0;
			if     (ca=='1'){ val= 1;}
			else if(ca=='2'){ val= 2;}
			else if(ca=='-'){ val=-2;}
			else if(ca==' '){ val=-1;}

			if(!cell.isnull && val!==0){
				cell.setNum(val);
				cell.draw();
			}
		}
	}
},

TargetCursor:{
	crosstype : true
},

//---------------------------------------------------------
// 盤面管理系
Cross:{
	maxnum : 4,
	minnum : 0
},
Board:{
	qcols : 7,
	qrows : 7,

	iscross : 2,

	// 正答判定用
	getSlashData : function(){
		var sdata=[], sinfo=this.getSlashInfo();
		for(var c=0;c<this.cellmax;c++){ sdata[c] =(this.cell[c].qans!==0?0:-1);}
		for(var c=0;c<this.cellmax;c++){
			if(sdata[c]!==0){ continue;}

			var cell = this.cell[c];
			var fcross = cell.relcross((cell.qans===31?-1:1), -1);
			this.searchloop(fcross.id, sinfo, sdata);
		}
		for(var c=0;c<this.cellmax;c++){ if(sdata[c]===0){ sdata[c]=2;} }
		return sdata;
	},
	searchloop : function(fc, sinfo, sdata){
		var passed=[];
		for(var xc=0;xc<this.crossmax;xc++){ passed[xc]=false;}

		var xc=fc, history=[{cell:null,cross:fc}];

		while(history.length>0){
			var cc=null, xc=history[history.length-1].cross;
			passed[xc] = true;

			// 今まで通っていないセルを調べる
			for(var i=0;i<sinfo.cross[xc].length;i++){
				var cellid = sinfo.cross[xc][i];
				if(!!sinfo.cell[cellid].length){ cc=cellid; break;}
			}

			// セルを経由してその先の交点へ
			if(cc!==null){
				var xc2 = sinfo.cell[cc][((sinfo.cell[cc][0]!==xc)?0:1)];
				history.push({cell:cc,cross:null});
				sinfo.cell[cc] = []

				// ループになった場合 => ループフラグをセットする
				if(!!passed[xc2]){
					for(var i=history.length-1;i>=0;i--){
						if(history[i].cross===xc2){ break;}
						sdata[history[i].cell] = 1;
					}
				}
				// 先の交点でループ判定にならなかった場合 => 次のループへ
				else{
					history[history.length-1].cross = xc2;
					continue;
				}
			}
			else{ sinfo.cross[xc] = [];}	/* 全て通過済み */

			// 一つ前に戻る
			var h = history.pop();
			if(sdata[h.cell]===0){ sdata[h.cell]=2;}
		}
	},

	getSlashInfo : function(){
		var sinfo={cell:[],cross:[]};
		for(var c=0;c<this.crossmax;c++){ sinfo.cross[c]=[];}
		for(var c=0;c<this.cellmax;c++){
			sinfo.cell[c]=[];
			var cell=this.cell[c], cross1, cross2;
			if     (cell.qans===31){ cross1=cell.relcross(-1,-1); cross2=cell.relcross(1,1);}
			else if(cell.qans===32){ cross1=cell.relcross(-1,1); cross2=cell.relcross(1,-1);}
			else{ continue;}

			sinfo.cell[c] = [cross1.id,cross2.id];
			sinfo.cross[cross1.id].push(c);
			sinfo.cross[cross2.id].push(c);
		}
		return sinfo;
	},

	searchline : function(fcross){
		var check = [], stack=[fcross];
		for(var i=0;i<this.crossmax;i++){ check[i]=0;}

		while(stack.length>0){
			var cross=stack.pop();
			if(check[cross.id]!==0){ continue;}
			check[cross.id]=1;

			var nc;
			nc=cross.relcross(-2,-2); if(!nc.isnull && check[nc.id]===0 && cross.relcell(-1,-1).getQans()===31){ stack.push(nc);}
			nc=cross.relcross( 2,-2); if(!nc.isnull && check[nc.id]===0 && cross.relcell( 1,-1).getQans()===32){ stack.push(nc);}
			nc=cross.relcross(-2, 2); if(!nc.isnull && check[nc.id]===0 && cross.relcell(-1, 1).getQans()===32){ stack.push(nc);}
			nc=cross.relcross( 2, 2); if(!nc.isnull && check[nc.id]===0 && cross.relcell( 1, 1).getQans()===31){ stack.push(nc);}
		}
		return check;
	}
},
BoardExec:{
	adjustBoardData : function(key,d){
		var bd = this.owner.board;
		if(key & pzpr.consts.TURNFLIP){ // 反転・回転全て
			var clist = this.owner.board.cell;
			for(var i=0;i<clist.length;i++){
				var cell = clist[i];
				cell.setQans({0:0,31:32,32:31}[cell.getQans()]);
			}
		}
	}
},

Flags:{
	use     : true,
	redline : true,
	disable_subclear : true
},
"Flags@wagiri":{
	use     : true,
	disable_subclear : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	margin : 0.50,

	initialize : function(){
		this.Common.prototype.initialize.call(this);

		this.gridcolor = this.gridcolor_DLIGHT;
		this.errcolor1 = "red";
		if(this.owner.pid==='gokigen'){
			this.errcolor2 = "rgb(32, 32, 255)";
		}
		else if(this.owner.pid==='wagiri'){
			this.errcolor2 = "rgb(0, 0, 127)";
		}

		this.crosssize = 0.33;
	},
	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid(false);

		if(this.owner.pid==='wagiri'){ this.drawNumbers();}
		this.drawSlashes();

		this.drawCrosses();
		this.drawTarget();
	},

	// オーバーライド
	getBGCellColor : function(cell){
		if(cell.qans===0 && cell.error===1){ return this.errbcolor1;}
		return null;
	}
},
"Graphic@wagiri":{
	// オーバーライド
	paintRange : function(x1,y1,x2,y2){
		var o = this.owner, bd = o.board;
		if(!bd.haserror && o.get('colorslash')){
			this.setRange(bd.minbx, bd.minby, bd.maxbx, bd.maxby);
		}
		else{
			this.setRange(x1,y1,x2,y2);
		}
		this.prepaint();
	},

	drawNumber1 : function(cell){
		var num = cell.qnum, key='cell_'+cell.id;
		if(num!==-1){
			var text = (num!==-2 ? ({1:"輪",2:"切"})[num] : "?");
			var px = cell.bx*this.bw, py = cell.by*this.bh;
			this.dispnum(key, 1, text, 0.70, this.fontcolor, px, py);
		}
		else{ this.hidenum(key);}
	},

	drawSlashes : function(){
		var o = this.owner, bd = o.board;
		if(!bd.haserror && o.get('colorslash')){
			var sdata=bd.getSlashData();
			for(var c=0;c<bd.cellmax;c++){ if(sdata[c]>0){ bd.cell[c].seterr(sdata[c]);} }

			this.Common.prototype.drawSlashes.call(this);

			for(var c=0;c<bd.cellmax;c++){ if(sdata[c]>0){ bd.cell[c].seterr(0);} }
		}
		else{
			this.Common.prototype.drawSlashes.call(this);
		}
	},

	drawTarget : function(){
		var islarge = !this.owner.cursor.pos.onborder();
		this.drawCursor(islarge,this.owner.editmode);
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
"Encode@gokigen":{
	decodePzpr : function(type){
		var oldflag = ((type===k.URL_PZPRAPP && !this.checkpflag("c")) || (type===k.URL_PZPRV3 && this.checkpflag("d")));
		if(!oldflag){ this.decode4Cross();}
		else        { this.decodecross_old();}
	},
	encodePzpr : function(type){
		if(type===k.URL_PZPRAPP){ this.outpflag = 'c';}
		this.encode4Cross();
	}
},
"Encode@wagiri":{
	decodePzpr : function(type){
		this.decode4Cross();
		this.decodeNumber10();
	},
	encodePzpr : function(type){
		this.encode4Cross();
		this.encodeNumber10();
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCrossNum();
		if(this.owner.pid==='wagiri'){ this.decodeCellQnum();}
		this.decodeCell( function(obj,ca){
			if     (ca==="1"){ obj.qans = 31;}
			else if(ca==="2"){ obj.qans = 32;}
		});
	},
	encodeData : function(){
		this.encodeCrossNum();
		if(this.owner.pid==='wagiri'){ this.encodeCellQnum();}
		this.encodeCell( function(obj){
			if     (obj.qans===31){ return "1 ";}
			else if(obj.qans===32){ return "2 ";}
			else                  { return ". ";}
		});
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){
		var pid = this.owner.pid;

		var sdata=this.owner.board.getSlashData();
		if( (pid==='gokigen') && !this.checkLoopLine_gokigen(sdata) ){ return 'slLoop';}

		if( (pid==='wagiri') && !this.checkLoopLine_wagiri(sdata, false) ){ return 'slLoopGiri';}

		if( !this.checkQnumCross() ){ return 'crConnSlNe';}

		if( (pid==='wagiri') && !this.checkLoopLine_wagiri(sdata, true) ){ return 'slNotLoopWa';}

		if( !this.checkNoSlashCell() ){ return 'ceEmpty';}

		return 'complete';
	},

	checkLoopLine_gokigen : function(sdata){
		var errclist = this.owner.board.cell.filter(function(cell){ return (sdata[cell.id]===1);});
		errclist.seterr(1);
		return (errclist.length===0);
	},
	checkLoopLine_wagiri : function(sdata, checkLoop){
		var result = true, bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			if(!checkLoop && sdata[c]==1 && bd.cell[c].getQnum()===2){ result = false;}
			if( checkLoop && sdata[c]==2 && bd.cell[c].getQnum()===1){ result = false;}
		}
		if(!result){ for(var c=0;c<bd.cellmax;c++){ if(sdata[c]>0){ bd.cell[c].seterr(sdata[c]);} } }
		return result;
	},

	checkQnumCross : function(){
		var result = true, bd = this.owner.board, sinfo = bd.getSlashInfo();
		for(var c=0;c<bd.crossmax;c++){
			var cross = bd.cross[c], qn = cross.getQnum();
			if(qn>=0 && qn!=sinfo.cross[c].length){
				if(this.checkOnly){ return false;}
				cross.seterr(1);
				result = false;
			}
		}
		return result;
	},

	checkNoSlashCell : function(){
		return this.checkAllCell(function(cell){ return (cell.getQans()===0);});
	}
},

FailCode:{
	slLoop      : ["斜線で輪っかができています。", "There is a loop consisted in some slashes."],
	slLoopGiri  : ["'切'が含まれた線が輪っかになっています。", "There is a loop that consists '切'."],
	slNotLoopWa : ["'輪'が含まれた線が輪っかになっていません。", "There is not a loop that consists '輪'."],
	crConnSlNe  : ["数字に繋がる線の数が間違っています。", "A number is not equal to count of lines that is connected to it."],
	ceEmpty     : ["斜線がないマスがあります。","There is an empty cell."]
}
});

})();
