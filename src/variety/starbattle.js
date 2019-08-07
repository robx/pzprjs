//
// パズル固有スクリプト部 スターバトル版 starbattle.js
//
(function(){

// 星を描画するときの頂点の位置
var starXOffset = [ 0,  0.235,  0.95,  0.38,  0.588, 0,  -0.588, -0.38, -0.95,  -0.235];
var starYOffset = [-1, -0.309, -0.309, 0.124, 0.809, 0.4, 0.809, 0.124, -0.309, -0.309];

(function(pidlist, classbase){
	if(typeof module==='object' && module.exports){module.exports = [pidlist, classbase];}
	else{ pzpr.classmgr.makeCustom(pidlist, classbase);}
}(
['starbattle'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	use : true,
	RBShadeCell : true,
	inputModes : {play:['star','unshade','dot']},
	mouseinput_other : function(){
		if(this.inputMode==='star' && this.mousestart){ this.inputcell_starbattle();}
		if(this.inputMode==='dot' && this.mousestart){ this.inputdot();}
	},
	mouseinput_auto : function(){
		if(this.puzzle.playmode){
			if(this.mousestart&&this.btn==="left"){
				this.inputdot();
			}
			if(this.mousestart || this.mousemove){
				if(this.inputData===3){ return;}
				this.inputcell_starbattle();
			}
		}
		else if(this.puzzle.editmode){
			if(this.mousestart || this.mousemove){ this.inputEdit();}
		}
	},

	inputcell_starbattle : function(){
		var cell = this.getcell();
		if(cell.isnull || cell===this.mouseCell){ return;}
		if(this.inputData===null){ this.decIC(cell);}

		cell.setQans(this.inputData===1 ? 1 : 0);
		cell.setQsub(this.inputData===2 ? 1 : 0);
		cell.draw();

		this.mouseCell = cell;

		if(this.inputData===1){ this.mousereset();}
	},

	inputEdit : function(){
		// 初回はこの中に入ってきます。
		if(this.inputData===null){
			this.inputEdit_first();
		}
		// 境界線の入力中の場合
		else{
			this.inputborder();
		}
	},
	inputEdit_first : function(){
		var bd = this.board, bx = this.inputPoint.bx, by = this.inputPoint.by, rect = bd.starCount.rect;
		if((bx>=rect.bx1) && (bx<=rect.bx2) && (by>=rect.by1) && (by<=rect.by2)){
			var val = this.getNewNumber(bd.starCount, bd.starCount.count);
			if(val===null){ return;}
			bd.starCount.set(val);
			this.mousereset();
		}
		// その他は境界線の入力へ
		else{
			this.inputborder();
		}
	},
	inputdot : function(){
		var pos = this.getpos(0.15);
		if(this.prevPos.equals(pos)){ return;}

		var dot = pos.getDot();
		if(dot!==null){
			if(this.inputData===null){ this.inputData=3;}
			else if(this.inputData!==3){ return;}
			dot.setDot(dot.getDot()!==1?1:0);
			dot.draw();
			this.prevPos = pos;
		}
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,
	moveTarget : function(){ return false;},

	keyinput : function(ca){
		if(this.keydown && this.puzzle.editmode){
			this.key_inputqnum_starbattle(ca);
		}
	},
	key_inputqnum_starbattle : function(ca){
		var bd=this.puzzle.board;
		var val = this.getNewNumber(bd.starCount, ca, bd.starCount.count);
		if(val===null){ return;}
		bd.starCount.set(val);
		this.prev = bd.starCount;
	}
},

Dot:{
	bx : null,
	by : null,

	isnull : true,
	id : null,

	piece : null,

	getDot : function(){
		return this.piece.qsub;
	},
	setDot : function(val){
		this.puzzle.opemgr.disCombine = true;
		this.piece.setQsub(val);
		this.puzzle.opemgr.disCombine = false;
	},
	getTrial : function(){
		return this.piece.trial;
	},

	draw : function(){
		this.puzzle.painter.paintRange(this.bx-1, this.by-1, this.bx+1, this.by+1);
	},
	getaddr : function(){
		return (new this.klass.Address(this.bx, this.by));
	}
},
Address:{
	getDot : function(){ return this.board.getDot(this.bx, this.by);}
},
TargetCursor:{
	getDot : function(){ return this.board.getDot(this.bx, this.by);}
},
//---------------------------------------------------------
// 盤面管理系
Board:{
	hasborder : 1,

	starCount : null,
	dotmax : 0,
	dots : [],

	createExtraObject : function(){
		this.starCount = new this.klass.StarCount(1);
		this.dots = [];
	},
	initExtraObject : function(col,row){
		this.starCount.init(1);
		this.initDots(this.cols,this.rows);
	},

	initDots : function(col,row){
		this.dotsmax = (2*col-1)*(2*row-1);
		this.dots = [];
		for(var id=0;id<this.dotsmax;id++){
			this.dots[id] = new this.klass.Dot();
			var dot = this.dots[id];
			dot.id = id;

			dot.bx = id%(2*col-1)+1;
			dot.by = ((id/(2*col-1))|0)+1;
			if(dot.bx%2===1&&dot.by%2===1){ continue;}

			dot.isnull = false;
			dot.piece = dot.getaddr().getobj();
		}
	},
	getDot : function(bx,by){
		var qc=this.cols, qr=this.rows;
		if((bx<=0||bx>=(qc<<1)||by<=0||by>=(qr<<1))){ return null;}
		var id=(bx-1)+(by-1)*(2*qc-1);
		var dot=this.dots[id];
		return (dot.isnull?null:dot);
	},
	isDot : function(bx,by){
		var dot=this.getDot(bx,by);
		if(dot!==null){ return dot.getDot()===1;}
		return false;
	},
	isStar: function(bx,by){
		var cell=this.getc(bx,by);
		return cell.qans===1;
	},
	dotIsRedundant : function(bx,by){
		var dot = this.getDot(bx,by);
		if(dot===null||dot.isnull){ return false;}
		var piece = dot.piece;
		if(piece.group==='cross'){
			return this.isStar(bx-1,by-1) || this.isStar(bx-1,by+1)
				|| this.isStar(bx+1,by-1) || this.isStar(bx+1,by+1);
		}
		else if(piece.group==='border'){
			if(piece.isvert){
				return this.isStar(bx-1,by) || this.isStar(bx+1,by);
			}
			else{
				return this.isStar(bx,by-1) || this.isStar(bx,by+1);
			}
		}
		return false;
	},

	dotinside : function(x1,y1,x2,y2){
		var dlist = new this.klass.PieceList();
		for(var by=y1;by<=y2;by++){ for(var bx=x1;bx<=x2;bx++){
			var dot = this.getDot(bx,by);
			if(!!dot){ dlist.add(dot);}
		}}
		return dlist;
	}
},
BoardExec:{
	adjustBoardData2 : function(key,d){
		var bd = this.board;
		bd.initDots(bd.cols, bd.rows);
	}
},
StarCount:{
	count : 1,
	rect : null,
	initialize : function(val){
		this.count = val;
		this.rect = {
			bx1 : -1, by1 : -1,
			bx2 : -1, by2 : -1
		};
	},
	init : function(val){
		this.count = val;
		var bd=this.puzzle.board;
		this.rect = {
			bx1 : bd.maxbx-3.15, by1 : -1.8,
			bx2 : bd.maxbx-0.15, by2 : -0.2
		};
	},
	set : function(val){
		if(val<=0){ val = 1;}
		if(this.count !== val){
			this.addOpe(this.count, val);
			this.count = val;
			this.draw();
		}
	},
	getmaxnum:function(){
		var bd = this.board;
		return Math.max(Math.floor(bd.cols/4),1);
	},
	getminnum:function(){ return 1;},
	addOpe : function(old,num){
		this.puzzle.opemgr.add(new this.klass.StarCountOperation(old, num));
	},
	draw : function(){
		this.puzzle.painter.paintRange(this.board.minbx,-1,this.board.maxbx,-1);
	}
},
"StarCountOperation:Operation":{
	type : 'starCount',
	setData : function(old, num){
		this.old = old;
		this.num = num;
	},
	decode : function(strs){
		if(strs[0]!=='AS'){ return false;}
		this.old = +strs[1];
		this.num = +strs[2];
		return true;
	},
	toString : function(){
		return ['AS', this.old, this.num].join(',');
	},
	undo : function(){ this.exec(this.old);},
	redo : function(){ this.exec(this.num);},
	exec : function(num){
		this.board.starCount.set(num);
	}
},
OperationManager:{
	addExtraOperation : function(){
		this.operationlist.push(this.klass.StarCountOperation);
	}
},

AreaRoomGraph:{
	enabled : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();

		this.drawBorders();

		this.drawDots();
		this.drawDashes();
		this.drawStars();

		this.drawChassis();

		this.drawStarCount();
		this.drawCursor_starbattle();
	},

	/* 上に星の個数表示領域を追加 */
	getCanvasRows : function(){
		return this.getBoardRows()+2*this.margin+0.8;
	},
	getOffsetRows : function(){ return 0.4;},
	setRangeObject : function(x1,y1,x2,y2){
		this.common.setRangeObject.call(this,x1,y1,x2,y2);
		this.range.starCount = (y1<0);
	},
	copyBufferData : function(g,g2,x1,y1,x2,y2){
		this.common.copyBufferData.call(this,g,g2,x1,y1,x2,y2);
		if(g.use.canvas && this.range.starCount){
			var bd = this.board;
			var sx1 = 0, sy1 = 0, sx2 = g2.child.width, sy2 = (bd.minby-0.1)*this.bh+this.y0;
			g.context.clearRect(sx1, sy1-this.y0, sx2, sy2);
			g.drawImage(g2.child, sx1, sy1, (sx2-sx1), (sy2-sy1), sx1-this.x0, sy1-this.y0, (sx2-sx1), (sy2-sy1));
		}
	},

	drawDots : function(){
		var g = this.vinc('dot', 'auto', true);

		g.lineWidth = Math.max(this.cw*0.04, 1);
		var d = this.range;
		var dlist = this.board.dotinside(d.x1,d.y1,d.x2,d.y2);
		for(var i=0;i<dlist.length;i++){
			var dot = dlist[i], bx=dot.bx, by=dot.by;
			g.vid = "s_dot_"+dot.id;
			if(dot.getDot()===1&&!this.board.dotIsRedundant(bx,by)){
				g.fillStyle = dot.getTrial()?this.trialcolor:this.pekecolor;
				g.fillCircle(bx*this.bw, by*this.bh, this.cw*0.15);
			}
			else{ g.vhide();}
		}
	},
	drawDashes : function(){
		var g = this.vinc('cell_dash', 'auto', true);
		g.lineWidth = 2;
		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i], px, py;
			g.vid = "c_dash_" + cell.id;
			if(cell.qsub===1){
				var px = cell.bx*this.bw, py = cell.by*this.bh;
				g.strokeStyle = (!cell.trial ? this.mbcolor : "rgb(192, 192, 192)");
				g.strokeLine(px-0.2*this.bw,py,px+0.2*this.bw,py);
			}
			else{ g.vhide();}
		}
	},
	drawStars : function(){
		var g = this.vinc('cell_star', 'auto', true);
		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i];
			g.vid = 'c_star_'+cell.id;
			if(cell.qans===1){
				g.fillStyle = (!cell.trial ? this.qanscolor : this.trialcolor);
				this.dispStar(g, cell.bx*this.bw, cell.by*this.bh, this.bw*0.8, this.bh*0.8);
			}
			else{ g.vhide();}
		}
	},

	drawStarCount : function(){
		var g = this.vinc('starcount', 'auto', true), bd = this.board;
		if(!this.range.starCount){ return;}

		if(g.use.canvas){
			g.context.clearRect(0, -this.y0, g.child.width, (bd.minby-0.1)*this.bh+this.y0);
		}

		g.fillStyle = this.quescolor;

		g.vid = 'bd_starCount';
		g.font         = ((this.ch*0.66)|0) + "px " + this.fontfamily;
		g.textAlign    = 'right';
		g.textBaseline = 'middle';
		g.fillText(''+bd.starCount.count, (bd.maxbx-1.8)*this.bw, -this.bh);

		g.vid = 'bd_star';
		this.dispStar(g, (bd.maxby-1)*this.bw, -this.bh, this.bw*0.7, this.bh*0.7);
	},
	drawCursor_starbattle : function(){
		var g = this.vinc('target_cursor', 'crispEdges', true), bd = this.board;
		if(!this.range.starCount){ return;}

		var isdraw = (this.puzzle.editmode && this.puzzle.getConfig('cursor') && !this.outputImage);
		g.vid = "ti";
		if(isdraw){
			var rect = bd.starCount.rect;
			g.strokeStyle = this.targetColor1;
			g.lineWidth = (Math.max(this.cw/16, 2))|0;
			g.strokeRect(rect.bx1*this.bw, rect.by1*this.bh, (rect.bx2-rect.bx1)*this.bw, (rect.by2-rect.by1)*this.bh);
		}
		else{ g.vhide();}
	},

	dispStar : function(g, px, py, sizeX, sizeY){
		g.beginPath();
		g.moveTo(px, py-sizeY);
		for(var p=1;p<10;p++){ g.lineTo(px+sizeX*starXOffset[p], py+sizeY*starYOffset[p]);}
		g.closePath();
		g.fill();
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodeStarCount();
		this.decodeBorder();
	},
	encodePzpr : function(type){
		this.encodeStarCount();
		this.encodeBorder();
	},

	decodeStarCount : function(){
		var barray = this.outbstr.split("/"), bd = this.board;
		bd.starCount.count = +barray[0];
		this.outbstr = (!!barray[1] ? barray[1] : '');
	},
	encodeStarCount : function(){
		this.outbstr = (this.board.starCount.count+"/");
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.board.starCount.count = +this.readLine();

		this.decodeAreaRoom();
		this.decodeCellAns();
	},
	encodeData : function(){
		this.writeLine(this.board.starCount.count);

		this.encodeAreaRoom();
		this.encodeCellAns();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checklist : [
		"checkAroundStars",
		"checkOverSaturatedStars",
		"checkInsufficientStars",
		"checkStarCountInLine"
	],

	checkAroundStars : function(){
		var bd = this.board;
		for(var c=0;c<bd.cell.length;c++){
			var cell = bd.cell[c];
			if(cell.qans!==1){ continue;}
			var target=null, clist=new this.klass.CellList();
			// 右・左下・下・右下だけチェック
			clist.add(cell);
			target = cell.relcell( 2,0); if(target.qans===1){ clist.add(target);}
			target = cell.relcell( 0,2); if(target.qans===1){ clist.add(target);}
			target = cell.relcell(-2,2); if(target.qans===1){ clist.add(target);}
			target = cell.relcell( 2,2); if(target.qans===1){ clist.add(target);}
			if(clist.length<=1){ continue;}

			this.failcode.add("starAround");
			if(this.checkOnly){ break;}
			clist.seterr(1);
		}
	},
	checkInsufficientStars : function(){
		var bd = this.board;
		this.checkAllBlock(bd.roommgr, function(cell){ return cell.qans===1;}, function(w,h,a,n){ return (a>=bd.starCount.count);}, "bkStarLt");
	},
	checkOverSaturatedStars : function(){
		var bd = this.board;
		this.checkAllBlock(bd.roommgr, function(cell){ return cell.qans===1;}, function(w,h,a,n){ return (a<=bd.starCount.count);}, "bkStarGt");
	},
	checkStarCountInLine : function(){
		this.checkRowsCols(this.isStarCountInClist, "lnStarNe");
	},
	isStarCountInClist : function(clist){
		var result = (clist.filter(function(cell){ return cell.qans===1;}).length === this.board.starCount.count);
		if(!result){ clist.seterr(1);}
		return result;
	}
},

FailCode:{
	starAround : ["星がタテヨコナナメに隣接しています。","Some stars touch."],
	bkStarGt : ["ブロックに入る星の数が多すぎます。","The number of stars in an area is too large."],
	bkStarLt : ["ブロックに入る星の数が少ないです。","The number of stars in an area is too small."],
	lnStarNe : ["1つの行に入る星の数が間違っています。","The number of stars in a line is wrong."]
}
}));

})();
