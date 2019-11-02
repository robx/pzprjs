//
// パズル固有スクリプト部 コンビブロック版 cbblock.js
//
(function(pidlist, classbase){
	if(typeof module==='object' && module.exports){module.exports = [pidlist, classbase];}
	else{ pzpr.classmgr.makeCustom(pidlist, classbase);}
}(
['cbblock', 'dbchoco'], {
//---------------------------------------------------------
// マウス入力系
"MouseEvent@cbblock":{
	inputModes : {edit:['border'],play:['border','subline']},
	mouseinput_auto : function(){
		if(this.puzzle.playmode){
			if(this.mousestart || this.mousemove){
				if(this.btn==='left' && this.isBorderMode()){ this.inputborder();}
				else{ this.inputQsubLine();}
			}
		}
		else if(this.puzzle.editmode){
			if(this.mousestart || this.mousemove){
				this.inputborder();
			}
		}
	}
},
"MouseEvent@dbchoco":{
	inputModes : {edit:['shade','number','clear'],play:['border','subline']},
	mouseinput_auto : function(){
		if(this.puzzle.playmode){
			if(this.mousestart || this.mousemove){
				if(this.btn==='left' && this.isBorderMode()){ this.inputborder();}
				else{ this.inputQsubLine();}
			}
		}
		else if(this.puzzle.editmode){
			var cell = this.getcell();
			if(cell.isnull){ return;}

			if(this.mousestart && (this.btn!=='right' || cell===this.cursor.getc())) {
				this.inputData = -1;
			}

			if( (this.mousestart && cell!==this.cursor.getc() && this.btn==='right') ||
				(this.mousemove && this.inputData>=0)) {
				this.inputShade();
			}
			else if(this.mouseend && this.notInputted()) {
				if(cell!==this.cursor.getc() && this.inputMode==='auto' && this.btn==='left') {
					this.setcursor(cell);
				}
				else{
					this.inputqnum(cell);
				}
			}
		}
	},
	inputShade : function(){
		this.inputIcebarn();
	}
},

"KeyEvent@dbchoco":{
	enablemake : true,

	keyinput : function(ca){
		if(ca==='q'){
			var cell = this.cursor.getc();
			cell.setQues(cell.ques!==6?6:0);
			this.prev=cell;
			cell.draw();
		} else {
			this.key_inputqnum(ca);
		}
	}
},

//---------------------------------------------------------
// 盤面管理系
"Border@cbblock":{
	ques : 1,

	enableLineNG : true,

	// 線を引かせたくないので上書き
	isLineNG : function(){ return (this.ques===1);},

	isGround : function(){ return (this.ques>0);}
},

Board:{
	cols : 8,
	rows : 8,

	hascross  : 1,
	hasborder : 1,

	addExtraInfo : function(){
		this.tilegraph  = this.addInfoList(this.klass.AreaTileGraph);
		this.blockgraph = this.addInfoList(this.klass.AreaBlockGraph);
	}
},

"Cell@dbchoco": {
	maxnum: function() {
		var bd=this.board;
		return (bd.cols*bd.rows)>>1;
	}
},

"AreaTileGraph:AreaGraphBase":{
	enabled : true,
	setComponentRefs : function(obj, component){ obj.tile = component;},
	getObjNodeList   : function(nodeobj){ return nodeobj.tilenodes;},
	resetObjNodeList : function(nodeobj){ nodeobj.tilenodes = [];},

	isnodevalid : function(nodeobj){ return true;},

	setExtraData : function(component){
		// Call super class
		this.klass.AreaGraphBase.prototype.setExtraData.call(this, component);

		if(this.rebuildmode || component.clist.length === 0) {return;}

		// A tile is always contained within a single block.
		var block = component.clist[0].block;
		if(block) {
			this.board.blockgraph.setComponentInfo(block);
		}
	}
},
"AreaTileGraph@cbblock":{
	relation : {'border.ques':'separator'},
	isedgevalidbylinkobj : function(border){ return border.isGround();}
},
"AreaTileGraph@dbchoco":{
	relation : {'border.qans':'separator', 'cell.ques':'node'},
	isedgevalidbylinkobj : function(border){
		if(border.sidecell[0].isnull || border.sidecell[1].isnull) {return false;}
		return border.qans === 0 && border.sidecell[0].ques === border.sidecell[1].ques;
	}
},

"AreaBlockGraph:AreaRoomGraph":{
	enabled : true,
	getComponentRefs : function(obj){ return obj.block;}, // getSideAreaInfo用
	setComponentRefs : function(obj, component){ obj.block = component;},
	getObjNodeList   : function(nodeobj){ return nodeobj.blocknodes;},
	resetObjNodeList : function(nodeobj){ nodeobj.blocknodes = [];},

	isedgevalidbylinkobj : function(border){ return border.qans===0;},

	setExtraData : function(component){
		var cnt=0;
		var clist = component.clist = new this.klass.CellList(component.getnodeobjs());
		component.size = clist.length;

		var tiles = this.board.tilegraph.components;
		for(var i=0;i<tiles.length;i++){ tiles[i].count=0;}
		for(var i=0;i<clist.length;i++){
			// It's possible that this function is called before all cells are connected to a tile.
			if(!clist[i].tile) {
				// Abort the count and wait until all cells in the grid are connected.
				component.dotcnt = 0;
				return;
			}
			clist[i].tile.count++;
		}
		for(var i=0;i<tiles.length;i++){ if(tiles[i].count>0){ cnt++;}}
		component.dotcnt = cnt;
	}
},

CellList:{
	getBlockShapes : function(){
		if(!!this.shape){ return this.shape;}

		var bd=this.board;
		var d=this.getRectSize();
		var data=[[],[],[],[],[],[],[],[]];
		var shapes={cols:d.cols, rows:d.rows, data:[]};

		for(var by=0;by<2*d.rows;by+=2){
			for(var bx=0;bx<2*d.cols;bx+=2){
				data[0].push(this.include(bd.getc(d.x1+bx,d.y1+by))?1:0);
				data[1].push(this.include(bd.getc(d.x1+bx,d.y2-by))?1:0);
			}
		}
		for(var bx=0;bx<2*d.cols;bx+=2){
			for(var by=0;by<2*d.rows;by+=2){
				data[4].push(this.include(bd.getc(d.x1+bx,d.y1+by))?1:0);
				data[5].push(this.include(bd.getc(d.x1+bx,d.y2-by))?1:0);
			}
		}
		data[2]=data[1].concat().reverse(); data[3]=data[0].concat().reverse();
		data[6]=data[5].concat().reverse(); data[7]=data[4].concat().reverse();
		for(var i=0;i<8;i++){ shapes.data[i]=data[i].join('');}
		return (this.shape = shapes);
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	gridcolor_type : "LIGHT",

	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();
		this.drawBorders();

		this.drawBorderQsubs();

		this.drawBaseMarks();

		this.drawChassis();

		this.drawPekes();

		if(this.pid==="dbchoco") {
			this.drawQuesNumbers();
			this.drawTarget();
		}
	}
},

"Graphic@cbblock":{
	// オーバーライド
	getBorderColor : function(border){
		if(border.ques===1){
			var cell2=border.sidecell[1];
			return ((cell2.isnull || cell2.error===0) ? "white" : this.errbcolor1);
		}
		else if(border.qans===1){
			if(border.error===1){ return this.errcolor1;}
			if(border.trial){ return this.trialcolor;}
			return this.qanscolor;
		}
		return null;
	}
},

"Graphic@dbchoco":{
	bgcellcolor_func : "icebarn",
	icecolor : "rgb(204,204,204)",

	bordercolor_func : 'qans'
},

//---------------------------------------------------------
// URLエンコード/デコード処理
"Encode@cbblock":{
	decodePzpr : function(type){
		this.decodeCBBlock();
	},
	encodePzpr : function(type){
		this.encodeCBBlock();
	},

	decodeCBBlock : function(){
		var bstr = this.outbstr, bd = this.board, twi=[16,8,4,2,1];
		var pos = (bstr?Math.min((((bd.border.length+4)/5)|0),bstr.length):0), id=0;
		for(var i=0;i<pos;i++){
			var ca = parseInt(bstr.charAt(i),32);
			for(var w=0;w<5;w++){
				if(!!bd.border[id]){
					bd.border[id].ques = (ca&twi[w]?1:0);
					id++;
				}
			}
		}
		this.outbstr = bstr.substr(pos);
	},
	encodeCBBlock : function(){
		var num=0, pass=0, cm="", bd = this.board, twi=[16,8,4,2,1];
		for(var id=0,max=bd.border.length;id<max;id++){
			if(bd.border[id].isGround()){ pass+=twi[num];} num++;
			if(num===5){ cm += pass.toString(32); num=0; pass=0;}
		}
		if(num>0){ cm += pass.toString(32);}
		this.outbstr += cm;
	}
},

"Encode@dbchoco":{
	decodePzpr : function(type){
		this.decodeDBChoco();
	},
	encodePzpr : function(type){
		this.encodeDBChoco();
	},

	decodeDBChoco : function(){
		this.decodeIce();
		this.decodeNumber16();
	},
	encodeDBChoco : function(){
		this.encodeIce();
		this.encodeNumber16();
	}
},

//---------------------------------------------------------
"FileIO@cbblock":{
	decodeData : function(){
		this.decodeBorder( function(border,ca){
			if     (ca==="3" ){ border.ques = 0; border.qans = 1; border.qsub = 1;}
			else if(ca==="1" ){ border.ques = 0; border.qans = 1;}
			else if(ca==="-1"){ border.ques = 1; border.qsub = 1;}
			else if(ca==="-2"){ border.ques = 0; border.qsub = 1;}
			else if(ca==="2" ){ border.ques = 0;}
			else              { border.ques = 1;}
		});
	},
	encodeData : function(){
		this.encodeBorder( function(border){
			if     (border.qans===1 && border.qsub===1){ return "3 ";}
			else if(border.qans===1){ return "1 ";}
			else if(border.ques===1 && border.qsub===1){ return "-1 ";}
			else if(border.ques===0 && border.qsub===1){ return "-2 ";}
			else if(border.ques===0){ return "2 ";}
			else                    { return "0 ";}
		});
	}
},

"FileIO@dbchoco":{
	decodeData : function(){
		this.decodeCell( function(cell,ca){
			if(ca.charAt(0)==="-"){cell.ques=6; ca = ca.substr(1);}

			if(ca==="0") {cell.qnum = -2;}
			else if(ca!=="." && (+ca)>0){cell.qnum = +ca;}
		});
		this.decodeBorderAns();
	},
	encodeData : function(){
		this.encodeCell(function(cell){
			var ca = "";
			if(cell.ques===6) { ca += "-";}

			if (cell.qnum===-2) { ca += "0";}
			else if (cell.qnum!==-1){ ca += cell.qnum.toString();}

			if(ca === "") { ca = "."; }
			return ca+" ";
		});
		this.encodeBorderAns();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checklist : [
		"checkBorderDeadend",
		"checkSingleBlock",
		"checkSmallNumberArea@dbchoco",
		"checkBlockNotRect@cbblock",
		"checkDifferentShapeBlock@cbblock",
		"checkLargeBlock",
		"checkEqualShapes@dbchoco",
		"checkLargeNumberArea@dbchoco"
	],

	checkBlockNotRect : function(){
		this.checkAllArea(this.board.blockgraph, function(w,h,a,n){ return (w*h!==a);}, "bkRect");
	},

	checkSingleBlock : function(){ this.checkMiniBlockCount(1, "bkSubLt2");},
	checkLargeBlock  : function(){ this.checkMiniBlockCount(3, "bkSubGt2");},
	checkMiniBlockCount : function(flag, code){
		var blocks = this.board.blockgraph.components;
		for(var r=0;r<blocks.length;r++){
			var cnt=blocks[r].dotcnt;
			if((flag===1&&cnt>1) || (flag===3&&cnt<=2)){ continue;}

			this.failcode.add(code);
			if(this.checkOnly){ break;}
			blocks[r].clist.seterr(1);
		}
	},

	checkDifferentShapeBlock : function(){
		var sides = this.board.blockgraph.getSideAreaInfo();
		for(var i=0;i<sides.length;i++){
			var area1 = sides[i][0], area2 = sides[i][1];
			if(area1.dotcnt!==2 || area2.dotcnt!==2) {continue;}
			if(this.isDifferentShapeBlock(area1, area2)){ continue;}

			this.failcode.add("bsSameShape");
			if(this.checkOnly){ break;}
			area1.clist.seterr(1);
			area2.clist.seterr(1);
		}
	},
	isDifferentShapeBlock : function(area1, area2){
		if(area1.size!==area2.size){ return true;}
		var s1 = area1.clist.getBlockShapes(), s2 = area2.clist.getBlockShapes();
		var t1=((s1.cols===s2.cols && s1.rows===s2.rows)?0:4);
		var t2=((s1.cols===s2.rows && s1.rows===s2.cols)?8:4);
		for(var t=t1;t<t2;t++){ if(s2.data[0]===s1.data[t]){ return false;}}
		return true;
	},

	checkSmallNumberArea: function() {
		return this.checkNumberArea(-1, "bkSizeLt");
	},
	checkLargeNumberArea: function() {
		return this.checkNumberArea(+1, "bkSizeGt");
	},

	checkNumberArea : function(factor, code){
		var tiles = this.board.tilegraph.components;
		for(var r=0;r<tiles.length;r++){
			var clist = tiles[r].clist, d = clist.length;
			for(var i=0;i<clist.length;i++){
				var cell = clist[i];
				var qnum = cell.qnum;
				if(qnum <= 0) {continue;}
				if((factor < 0 && d < qnum) || (factor > 0 && d > qnum)) {
					this.failcode.add(code);
					if(this.checkOnly){ return; }
					clist.seterr(1);
				}
			}
		}
	},

	checkEqualShapes: function() {
		var blocks = this.board.blockgraph.components;
		for(var r=0;r<blocks.length;r++){
			var block = blocks[r];
			if(block.dotcnt!==2){continue;}
			if(this.isEqualShapes(block.clist)){continue;}

			this.failcode.add("bkDifferentShape");
			if(this.checkOnly){ break;}
			block.clist.seterr(1);
		}
	},

	isEqualShapes: function(clist) {
		for(var i=0;i<clist.length;i++){
			var cell = clist[i];
			var borders = [cell.adjborder.right, cell.adjborder.bottom];

			for(var b=0;b<borders.length;b++){
				var bd = borders[b];
				if(!bd || bd.isnull) {continue;}
				var side0 = bd.sidecell[0]; var side1 = bd.sidecell[1];

				if(bd.qans === 0 && !side0.isnull && !side1.isnull && side0.ques !== side1.ques) {
					return !this.isDifferentShapeBlock(side0.tile, side1.tile);
				}
			}
		}
		return false;
	}
},

"FailCode@cbblock":{
	bkRect : ["ブロックが四角形になっています。","A block is rectangle."],
	bsSameShape : ["同じ形のブロックが接しています。","The blocks that has the same shape are adjacent."],
	bkSubLt2 : ["ブロックが1つの点線からなる領域で構成されています。","A block has one area framed by dotted line."],
	bkSubGt2 : ["ブロックが3つ以上の点線からなる領域で構成されています。","A block has three or more areas framed by dotted line."]
},

"FailCode@dbchoco":{
	bkSubLt2 : ["1色のマスしか入っていないブロックがあります。","A block contains a single color."],
	bkSubGt2 : ["同じ色のマスの塊が3個以上入っているブロックがあります。","A block has three or more shapes."],
	bkSizeLt : ["数字よりも少ないマス数しかない同じ色のマスの塊があります。","A number is bigger than the size of the shape."],
	bkSizeGt : ["数字よりも大きいマス数になっている同じ色のマスの塊があります。","A number is smaller than the size of the shape."],
	bkDifferentShape: ["同じ形でないマスの塊を含むブロックがあります。","The two shapes inside a block are different."]
}
}));
