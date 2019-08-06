//
// パズル固有スクリプト部 シャカシャカ版 shakashaka.js
//
(function(pidlist, classbase){
	if(typeof module==='object' && module.exports){module.exports = [pidlist, classbase];}
	else{ pzpr.classmgr.makeCustom(pidlist, classbase);}
}(
['shakashaka'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputModes : {edit:['number','clear'],play:['objblank','completion']},
	mouseinput_auto : function(){
		if(this.puzzle.playmode){
			var use = +this.puzzle.getConfig('use_tri');
			if(use===1){
				if(this.btn==='left'){
					if(this.mousestart){ this.inputTriangle_corner_start();}
					else if(this.mousemove && this.inputData!==null){
						this.inputMove();
					}
				}
				else if(this.btn==='right'){
					if(this.mousestart || this.mousemove){ this.inputDot();}
				}
			}
			else if(use===2){
				if(this.btn==='left'){
					if(this.mousestart){
						this.inputTriangle_pull_start();
					}
					else if(this.mousemove && this.inputData===null){
						this.inputTriangle_pull_move();
					}
					else if(this.mousemove && this.inputData!==null){
						this.inputMove();
					}
					else if(this.mouseend && this.notInputted()){
						this.inputTriangle_pull_end();
					}
				}
				else if(this.btn==='right'){
					if(this.mousestart || this.mousemove){ this.inputDot();}
				}
			}
			else if(use===3){
				if(this.mousestart){ this.inputTriangle_onebtn();}
			}
			if(this.mouseend && this.notInputted()){ this.inputqcmp();}
		}
		else if(this.puzzle.editmode){
			if(this.mousestart){ this.inputqnum();}
		}
	},

	inputMove : function(){
		if(this.inputData>=2 && this.inputData<=5){
			this.inputTriangle_drag();
		}
		else if(this.inputData===0 || this.inputData===-1){
			this.inputDot();
		}
	},

	inputTriangle_corner_start : function(){
		var cell = this.getcell();
		if(cell.isnull){ return;}

		this.inputData = this.checkCornerData(cell);

		cell.setAnswer(this.inputData);
		this.mouseCell = cell;
		cell.draw();
	},
	checkCornerData : function(cell){
		if(cell.isNum()){ return -1;}

		var val = null;
		if(this.puzzle.getConfig('support_tri')){
			// Input support mode
			var adc = cell.adjacent, wall = {count:0};
			var data = {top:[2,3],bottom:[4,5],left:[3,4],right:[2,5]};
			for(var key in adc){
				var cell2 = adc[key];
				wall[key] = (cell2.isWall() || cell2.qans===data[key][0] || cell2.qans===data[key][1]);
				if(wall[key]){ ++wall.count;}
			}

			if(wall.count>2 || (wall.count===2 && ((wall.top && wall.bottom) || (wall.left && wall.right)))){
				return (cell.qsub===0 ? -1 : 0);
			}

			if(wall.count===2){
				if     (wall.bottom && wall.left) { val = 2;}
				else if(wall.bottom && wall.right){ val = 3;}
				else if(wall.top    && wall.right){ val = 4;}
				else if(wall.top    && wall.left) { val = 5;}
				else                              { val = 0;}
			}
		}

		if(val===null){
			var dx = this.inputPoint.bx - cell.bx;
			var dy = this.inputPoint.by - cell.by;
			if(dx<=0){ val = ((dy<=0)?5:2);}
			else     { val = ((dy<=0)?4:3);}
		}
		if(val===cell.qans){ val = -1;}
		else if(cell.qsub===1){ val = 0;}
		return val;
	},

	inputTriangle_pull_start : function(){
		var cell = this.getcell();
		if(cell.isnull || cell.isNum()){ this.mousereset(); return;}

		// 最初はどこのセルをクリックしたか取得するだけ
		this.firstPoint.set(this.inputPoint);
		this.mouseCell = cell;
	},
	inputTriangle_pull_move : function(){
		var cell = this.mouseCell;
		var dx = (this.inputPoint.bx-this.firstPoint.bx);
		var dy = (this.inputPoint.by-this.firstPoint.by);

		// 一定以上動いていたら三角形を入力
		var diff = 0.33;
		if     (dx<=-diff && dy>= diff){ this.inputData = 2;}
		else if(dx<=-diff && dy<=-diff){ this.inputData = 5;}
		else if(dx>= diff && dy>= diff){ this.inputData = 3;}
		else if(dx>= diff && dy<=-diff){ this.inputData = 4;}

		if(this.inputData!==null){
			if(this.inputData===cell.qans){ this.inputData = 0;}
			cell.setAnswer(this.inputData);
		}
		cell.draw();
	},
	inputTriangle_pull_end : function(){
		var dx = (this.inputPoint.bx-this.firstPoint.bx);
		var dy = (this.inputPoint.by-this.firstPoint.by);

		// ほとんど動いていなかった場合は・を入力
		if(Math.abs(dx)<=0.1 && Math.abs(dy)<=0.1){
			var cell = this.mouseCell;
			cell.setAnswer(cell.qsub!==1?-1:0);
			cell.draw();
		}
	},

	inputTriangle_drag : function(){
		if(this.inputData===null || this.inputData<=0){ return;}

		var cell = this.getcell();
		if(cell.isnull || cell.isNum()){ return;}

		var dbx=cell.bx-this.mouseCell.bx;
		var dby=cell.by-this.mouseCell.by;
		var tri=this.checkCornerData(cell), ret=null, cur=this.inputData;
		if((dbx===2 && dby===2)||(dbx===-2 && dby===-2)){ // 左上・右下
			if(cur===2||cur===4){ ret=cur;}
		}
		else if((dbx===2 && dby===-2)||(dbx===-2 && dby===2)){ // 右上・左下
			if(cur===3||cur===5){ ret=cur;}
		}
		else if(dbx===0 && dby===-2){ // 上下反転(上側)
			if(((cur===2||cur===3)&&(tri!==cur))||((cur===4||cur===5)&&(tri===cur))){
				ret=[null,null,5,4,3,2][cur];
			}
		}
		else if(dbx===0 && dby===2){  // 上下反転(下側)
			if(((cur===4||cur===5)&&(tri!==cur))||((cur===2||cur===3)&&(tri===cur))){
				ret=[null,null,5,4,3,2][cur];
			}
		}
		else if(dbx===-2 && dby===0){ // 左右反転(左側)
			if(((cur===3||cur===4)&&(tri!==cur))||((cur===2||cur===5)&&(tri===cur))){
				ret=[null,null,3,2,5,4][cur];
			}
		}
		else if(dbx===2 && dby===0){  // 左右反転(右側)
			if(((cur===2||cur===5)&&(tri!==cur))||((cur===3||cur===4)&&(tri===cur))){
				ret=[null,null,3,2,5,4][cur];
			}
		}

		if(ret!==null){
			cell.setAnswer(ret);
			this.inputData = ret;
			this.mouseCell = cell;
			cell.draw();
		}
	},
	inputDot : function(){
		var cell = this.getcell();
		if(cell.isnull || cell.isNum()){ return;}

		if(this.inputData===null){ this.inputData = (cell.qsub===1?0:-1);}

		cell.setAnswer(this.inputData);
		this.mouseCell = cell;
		cell.draw();
	},

	inputTriangle_onebtn : function(){
		var cell = this.getcell();
		if(cell.isnull || cell.isNum()){ return;}

		var ans = cell.getAnswer();
		if     (this.btn==='left') { this.inputData = [0,2,1,3,4,5,-1][ans+1];}
		else if(this.btn==='right'){ this.inputData = [5,-1,1,0,2,3,4][ans+1];}
		cell.setAnswer(this.inputData);
		this.mouseCell = cell;
		cell.draw();
	},

	inputqcmp : function(){
		var cell = this.getcell();
		if(cell.isnull || cell.noNum()){ return;}

		cell.setQcmp(+!cell.qcmp);
		cell.draw();

		this.mousereset();
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

	maxnum : 4,
	minnum : 0,

	getAnswer : function(){
		if(this.isNum()){ return 0;}
		if     (this.qans>0)  { return this.qans;}
		else if(this.qsub===1){ return -1;}
		return 0;
	},
	setAnswer : function(val){
		if(this.isNum()){ return;}
		this.setQans((val>=2&&val<=5)?val:0);
		this.setQsub((val===-1)?1:0);
	},

	isTri : function(){ return this.qans!==0;},
	isWall : function(){ return (this.qsub===1 || this.isnull || this.isNum());}
},
Board:{
	addExtraInfo : function(){
		this.wrectmgr = this.addInfoList(this.klass.AreaWrectGraph);
	}
},
BoardExec:{
	adjustBoardData : function(key,d){
		var trans = [];
		switch(key){
			case this.FLIPY: trans=[0,1,5,4,3,2]; break;	// 上下反転
			case this.FLIPX: trans=[0,1,3,2,5,4]; break;	// 左右反転
			case this.TURNR: trans=[0,1,5,2,3,4]; break;	// 右90°回転
			case this.TURNL: trans=[0,1,3,4,5,2]; break;	// 左90°回転
			default: return;
		}
		var clist = this.board.cell;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i], val = trans[cell.qans];
			if(!!val){ cell.qans=val;}
		}
	}
},
"AreaWrectGraph:AreaGraphBase":{
	enabled : true,
	relation : {'cell.qnum':'node', 'cell.qans':'node'},
	setComponentRefs : function(obj, component){ obj.wrect = component;},
	getObjNodeList   : function(nodeobj){ return nodeobj.wrectnodes;},
	resetObjNodeList : function(nodeobj){ nodeobj.wrectnodes = [];},

	isnodevalid : function(cell){ return cell.qnum===-1;},
	sldir : [[],
		[true,false,true,true,false,false],
		[true,false,false,false,true,true],
		[true,false,false,true,true,false],
		[true,false,true,false,false,true]
	],
	isedgevalidbynodeobj : function(cell1,cell2){
		return (this.sldir[cell1.getdir(cell2,2)][cell1.qans] &&
				this.sldir[cell2.getdir(cell1,2)][cell2.qans]);
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	hideHatena : true,

	gridcolor_type : "LIGHT",

	qanscolor : "black",
	fgcellcolor_func : "qnum",
	fontShadecolor : "white",
	qcmpcolor : "rgb(127,127,127)",

	paint : function(){
		this.drawBGCells();
		this.drawDotCells(false);
		this.drawDashedGrid();
		this.drawQuesCells();
		this.drawQuesNumbers();

		this.drawTriangle();

		this.drawChassis();

		this.drawTarget();
	},
	getTriangleColor : function(cell){
		return (!cell.trial ? this.shadecolor : this.trialcolor);
	},
	getQuesNumberColor : function(cell){
		return (cell.qcmp===1 ? this.qcmpcolor : this.fontShadecolor);
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decode4Cell();
	},
	encodePzpr : function(type){
		this.encode4Cell();
	},

	decodeKanpen : function(){
		this.fio.decodeCellQnumb();
	},
	encodeKanpen : function(){
		this.fio.encodeCellQnumb();
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCellQnumb();
		this.decodeCellQanssubcmp();
	},
	encodeData : function(){
		this.encodeCellQnumb();
		this.encodeCellQanssubcmp();
	},

	decodeCellQanssubcmp : function(){
		this.decodeCell( function(cell,ca){
			if     (ca==="+"){ cell.qsub = 1;}
			else if(ca==="-"){ cell.qcmp = 1;}
			else if(ca!=="."){ cell.qans = +ca;}
		});
	},
	encodeCellQanssubcmp : function(){
		this.encodeCell( function(cell){
			if     (cell.qans!==0){ return cell.qans+" ";}
			else if(cell.qsub===1){ return "+ ";}
			else if(cell.qcmp===1){ return "- ";}
			else                  { return ". ";}
		});
	},

	kanpenOpen : function(){
		this.decodeCell( function(cell,ca){
			if     (ca==="5"){ cell.qnum = -2;}
			else if(ca!=="."){ cell.qnum = +ca;}
		});
		this.decodeCell( function(cell,ca){
			if     (ca==="+"){ cell.qsub = 1;}
			else if(ca!=="."){ cell.qans = +ca;}
		});
	},
	kanpenSave : function(){
		this.encodeCell( function(cell){
			if     (cell.qnum>=  0){ return cell.qnum+" ";}
			else if(cell.qnum===-2){ return "5 ";}
			else                  { return ". ";}
		});
		this.encodeCell( function(cell){
			if     (cell.qsub=== 1){ return "+ ";}
			else if(cell.qans>=  2){ return cell.qans+" ";}
			else                   { return ". ";}
		});
	},

	kanpenOpenXML : function(){
		this.decodeCellQnum_XMLBoard();
		this.decodeCellShakashaka_XMLAnswer();
	},
	kanpenSaveXML : function(){
		this.encodeCellQnum_XMLBoard();
		this.encodeCellShakashaka_XMLAnswer();
	},

	UNDECIDED_NUM_XML : -2,

	decodeCellShakashaka_XMLAnswer : function(){
		this.decodeCellXMLArow(function(cell, name){
			if(name.charAt(0)==='n'){ cell.qans = (((+name.substr(1))-1)&3)+2;}
			else if(name==='s') { cell.qsub = 1;}
		});
	},
	encodeCellShakashaka_XMLAnswer : function(){
		this.encodeCellXMLArow(function(cell){
			if     (cell.qans>0)  { return 'n'+(((cell.qans-1)&3)+4);}
			else if(cell.qsub===1){ return 's';}
			return 'u';
		});
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checklist : [
		"checkTriangleExist",
		"checkOverTriangle",
		"checkWhiteArea",
		"checkLessTriangle"
	],

	checkTriangleExist : function(){
		if(!this.puzzle.execConfig('allowempty')){
			if(this.board.cell.some(function(cell){ return cell.qans>0;})){ return;}
			this.failcode.add("brNoTriangle");
		}
	},

	checkOverTriangle : function(){
		this.checkDir4Cell(function(cell){ return cell.isTri();},2, "nmTriangleGt");
	},
	checkLessTriangle : function(){
		this.checkDir4Cell(function(cell){ return cell.isTri();},1, "nmTriangleLt");
	},

	checkWhiteArea : function(){
		var areas = this.board.wrectmgr.components;
		for(var id=0;id<areas.length;id++){
			var clist=areas[id].clist, d=clist.getRectSize();
			var cnt = clist.filter(function(cell){ return (cell.qans===0);}).length;
			if(d.cols*d.rows===cnt || this.isAreaRect_slope(areas[id])){ continue;}

			this.failcode.add("cuNotRectx");
			if(this.checkOnly){ break;}
			clist.seterr(1);
		}
	},
	// 斜め領域判定用
	isAreaRect_slope : function(area){
		var clist = area.clist;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i], adc = cell.adjacent, a = cell.qans;
			if( ((a===4||a===5)!==(adc.top.wrect   !==area)) ||
				((a===2||a===3)!==(adc.bottom.wrect!==area)) ||
				((a===2||a===5)!==(adc.left.wrect  !==area)) ||
				((a===3||a===4)!==(adc.right.wrect !==area)) )
			{
				return false;
			}
		}
		return true;
	}
},

FailCode:{
	brNoTriangle : ["盤面に三角形がありません。","There are no triangles on the board."],
	cuNotRectx : ["白マスが長方形(正方形)ではありません。","A white area is not rectangle."],
	nmTriangleGt : ["数字のまわりにある黒い三角形の数が間違っています。","The number of triangles in four adjacent cells is bigger than it."],
	nmTriangleLt : ["数字のまわりにある黒い三角形の数が間違っています。","The number of triangles in four adjacent cells is smaller than it."]
}
}));
