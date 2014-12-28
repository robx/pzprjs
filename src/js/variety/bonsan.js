//
// パズル固有スクリプト部 ぼんさん・へやぼん・四角スライダー版 bonsan.js v3.4.2
//
pzpr.classmgr.makeCustom(['bonsan','heyabon','rectslider'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.owner.playmode){
			if(this.mousestart || this.mousemove){
				if(this.btn.Left){ this.inputMoveLine();}
			}
			else if(this.mouseend && this.notInputted()){ this.inputlight();}
		}
		else if(this.owner.editmode){
			if(this.mousestart || this.mousemove){
				if(this.owner.pid==='heyabon'){ this.inputborder();}
			}
			else if(this.mouseend && this.notInputted()){ this.inputqnum();}
		}
	},

	inputLine : function(){
		this.common.inputLine.call(this);
		
		/* "丸数字を移動表示しない"場合の背景色描画準備 */
		if(this.owner.execConfig('autocmp') && !this.owner.execConfig('dispmove') && !this.notInputted()){
			this.inputautodark();
		}
	},
	inputautodark : function(){
		/* 最後に入力した線を取得する */
		var opemgr = this.owner.opemgr, lastope = opemgr.lastope;
		if(lastope.group!=='border' || lastope.property!=='line'){ return;}
		var border = this.owner.board.getb(lastope.bx, lastope.by);
		
		/* 線を引いた/消した箇所にある領域を取得 */
		var linfo = this.owner.board.linfo;
		var clist = new this.owner.CellList();
		Array.prototype.push.apply(clist, border.lineedge);
		clist = clist.notnull().filter(function(cell){ return !!linfo.id[cell.id];});
		
		/* 改めて描画対象となるセルを取得して再描画 */
		clist.each(function(cell){
			linfo.getClistByCell(cell).each(function(cell){ if(cell.isNum()){ cell.draw();}});
		});
	},

	inputlight : function(){
		var cell = this.getcell();
		if(cell.isnull){ return;}

		var puzzle = this.owner;
		if(puzzle.pid!=='rectslider' && puzzle.execConfig('autocmp') && this.inputdark(cell)){ return;}

		if     (cell.qsub===0){ cell.setQsub(this.btn.Left?1:2);}
		else if(cell.qsub===1){ cell.setQsub(this.btn.Left?2:0);}
		else if(cell.qsub===2){ cell.setQsub(this.btn.Left?0:1);}
		cell.draw();
	},
	inputdark : function(cell){
		var targetcell = (!this.owner.execConfig('dispmove') ? cell : cell.base),
			distance = 0.60,
			dx = this.inputPoint.bx-cell.bx, /* ここはtargetcellではなくcell */
			dy = this.inputPoint.by-cell.by;
		if(targetcell.qnum===-2 && dx*dx+dy*dy<distance*distance){
			targetcell.setQcmp(targetcell.qcmp===0 ? 1 : 0);
			targetcell.draw();
			return true;
		}
		return false;
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
	isCmp : function(){
		var targetcell = (!this.owner.execConfig('dispmove') ? this : this.base);
		if(targetcell.qcmp===1){ return true;}
		
		var	num   = targetcell.getNum(),
			clist = this.owner.board.linfo.getClistByCell(this),
			d     = clist.getRectSize();
		return ((d.cols===1||d.rows===1) && (num===clist.length-1));
	},
	
	maxnum : function(){
		var bd=this.owner.board, bx=this.bx, by=this.by;
		var col = (((bx<(bd.maxbx>>1))?(bd.maxbx-bx):bx)>>1);
		var row = (((by<(bd.maxby>>1))?(bd.maxby-by):by)>>1);
		return Math.max(col, row);
	},
	minnum : 0
},

Board:{
	qcols : 8,
	qrows : 8,

	hasborder : 1
},
"Board@rectslider":{
	initialize : function(){
		this.common.initialize.call(this);

		/* AreaLineManagerより後にすること */
		this.rects = this.addInfoList(this.owner.AreaSlideMaanger);
	}
},

LineManager:{
	isCenterLine : true
},

"AreaRoomManager@bonsan,heyabon":{
	enabled : true
},
AreaLineManager:{
	enabled : true,
	moveline : true
},
"AreaSlideMaanger:AreaShadeManager@rectslider":{
	enabled : true,
	relation : ['cell','line'],
	isvalid : function(cell){ return cell.base.qnum!==-1;},
	bdfunc : function(border){ return false;},
	
	setLine : function(border){
		if(!this.enabled){ return;}
		
		var cell1 = border.sidecell[0], cell2 = border.sidecell[1];
		var linfo = this.owner.board.linfo, clist = new this.owner.CellList(), rects = this;
		var id1 = linfo.id[cell1.id], id2 = linfo.id[cell2.id];
		if(id1===id2 && id1!==null){ clist.extend(linfo.getClistByCell(cell1));}
		else{
			if(id1!==null){ clist.extend(linfo.area[id1].clist);}else{ clist.add(cell1);}
			if(id2!==null){ clist.extend(linfo.area[id2].clist);}else{ clist.add(cell2);}
		}
		clist = clist.filter(function(cell){ return (cell.base.qnum!==-1 || rects.id[cell.id]!==null);});
		
		var cidlist = [];
		for(var i=0;i<clist.length;i++){
			this.calcLinkInfo(clist[i]);
			cidlist.push(clist[i].id);
			cidlist = cidlist.concat(this.getLinkCell(clist[i]));
		}
		this.remakeInfo(cidlist);
	}
},

Flags:{
	autocmp : "number"
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	hideHatena : true,

	gridcolor_type : "LIGHT",

	bgcellcolor_func : "qsub2",
	qsubcolor1 : "rgb(224, 224, 255)",
	qsubcolor2 : "rgb(255, 255, 144)",

	circlefillcolor_func : "qcmp",

	globalfontsizeratio : 0.9,	// 数字の倍率

	paint : function(){
		this.drawBGCells();
		this.drawGrid();
		if(this.owner.pid==='heyabon'){ this.drawBorders();}

		this.drawTip();
		this.drawDepartures();
		this.drawLines();

		this.drawCircles();
		this.drawNumbers();

		this.drawChassis();

		this.drawTarget();
	}
},
"Graphic@rectslider":{
	globalfontsizeratio : 1.0,	// 数字の倍率

	fontShadecolor : "white",
	qcmpcolor : "gray",
	mbcolor : "green",

	paint : function(){
		this.drawDashedGrid();

		this.drawTip();
		this.drawDepartures();
		this.drawLines();

		this.drawShadedCells();
		this.drawMBs();

		this.drawNumbers();

		this.drawChassis();

		this.drawTarget();
	},

	getCellColor : function(cell){
		var puzzle = this.owner, targetcell = (puzzle.execConfig('dispmove') ? cell.base : cell);
		if(targetcell.qnum===-1){ return null;}
		if(puzzle.execConfig('dispmove') && puzzle.mouse.mouseCell===targetcell){ return this.movecolor;}
		
		var info = cell.error || cell.qinfo;
		if     (info===0){ return this.quescolor;}
		else if(info===1){ return this.errcolor1;}
		return null;
	},
	getCellNumberColor : function(cell){
		return (this.owner.execConfig('autocmp') && cell.isCmp() ? this.qcmpcolor : this.fontShadecolor);
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		if(!this.checkpflag("c")){ this.decodeBorder();}
		this.decodeNumber16();

		this.checkPuzzleid();
	},
	encodePzpr : function(type){
		if(type===1 || this.owner.pid==='heyabon'){ this.encodeBorder();}else{ this.outpflag="c";}
		this.encodeNumber16();
	},

	checkPuzzleid : function(){
		var o=this.owner, bd=o.board;
		if(o.pid==='bonsan'){
			for(var id=0;id<bd.bdmax;id++){
				if(bd.border[id].ques===1){ o.pid='heyabon'; break;}
			}
		}
	}
},
"Encode@rectslider":{
	decodePzpr : function(type){
		this.decodeNumber16();
	},
	encodePzpr : function(type){
		this.encodeNumber16();
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCellQnum();
		this.decodeCellQsubQcmp();
		if(this.owner.pid!=='rectslider'){ this.decodeBorderQues();}
		this.decodeBorderLine();

		this.owner.enc.checkPuzzleid();
	},
	encodeData : function(){
		this.encodeCellQnum();
		this.encodeCellQsubQcmp();
		if(this.owner.pid!=='rectslider'){ this.encodeBorderQues();}
		this.encodeBorderLine();
	},

	/* decode/encodeCellQsubの上位互換です */
	decodeCellQsubQcmp : function(){
		this.decodeCell( function(obj,ca){
			if(ca!=="0"){
				var num = parseInt(ca);
				obj.qsub = num & 0x0f;
				obj.qcmp = (num >> 4)|0;
			}
		});
	},
	encodeCellQsubQcmp : function(){
		this.encodeCell( function(obj){
			var num = obj.qsub + (obj.qcmp << 4);
			return (num.toString() + " ");
		});
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){
		var pid = this.owner.pid;

		if( !this.checkBranchLine() ){ return 'lnBranch';}
		if( !this.checkCrossLine() ){ return 'lnCross';}

		if( !this.checkConnectObject() ){ return 'nmConnected';}
		if( !this.checkLineOverLetter() ){ return 'laOnNum';}

		if( !this.checkCurveLine() ){ return 'laCurve';}

		if(pid==='rectslider'){
			if( !this.checkMovedBlockRect() ){ return 'csNotRect';}
			if( !this.checkMovedBlockSize() ){ return 'bkSize1';}
		}

		if( !this.checkLineLength() ){ return 'laLenNe';}

		if(pid==='bonsan'){ 
			if( !this.checkFractal() ){ return 'brObjNotSym';}
		}
		else if(pid==='heyabon'){
			if( !this.checkFractal() ){ return 'bkObjNotSym';}
			if( !this.checkNoObjectBlock() ){ return 'bkNoNum';}
		}

		if( !this.checkNoLineCircle() ){ return 'nmIsolate';}

		if( !this.checkDisconnectLine() ){ return 'laIsolate';}

		return null;
	},

	checkCurveLine : function(){
		return this.checkAllArea(this.getLareaInfo(), function(w,h,a,n){ return (w===1||h===1);});
	},
	checkLineLength : function(){
		return this.checkAllArea(this.getLareaInfo(), function(w,h,a,n){ return (n<0||a===1||n===a-1);});
	},
	checkNoLineCircle : function(){
		return this.checkAllCell(function(cell){ return (cell.qnum>=1 && cell.lcnt===0);});
	},

	checkFractal : function(){
		var result = true;
		var rinfo = this.getRoomInfo();
		for(var id=1;id<=rinfo.max;id++){
			var clist = rinfo.area[id].clist, d = clist.getRectSize();
			d.xx=d.x1+d.x2; d.yy=d.y1+d.y2;
			for(var i=0;i<clist.length;i++){
				var cell = clist[i];
				if(cell.isDestination() ^ this.owner.board.getc(d.xx-cell.bx, d.yy-cell.by).isDestination()){
					clist.filter(function(cell){ return cell.isDestination();}).seterr(1);
					result = false;
				}
			}
		}
		return result;
	},
	checkNoObjectBlock : function(){
		return this.checkNoMovedObjectInRoom(this.getRoomInfo());
	}
},
"AnsCheck@rectslider":{
	getRectInfo : function(){
		return (this._info.rect = this._info.rect || this.owner.board.rects.getAreaInfo());
	},

	checkMovedBlockRect : function(){
		return this.checkAllArea(this.getRectInfo(), function(w,h,a,n){ return (w*h===a);});
	},
	checkMovedBlockSize : function(){
		return this.checkAllArea(this.getRectInfo(), function(w,h,a,n){ return (a>1);});
	}
},

FailCode:{
	bkNoNum : ["○のない部屋があります。","A room has no circle."],
	bkObjNotSym : ["部屋の中の○が点対称に配置されていません。", "Position of circles in the room is not point symmetric."],
	brObjNotSym : ["○が点対称に配置されていません。", "Position of circles is not point symmetric."],
	laOnNum : ["○の上を線が通過しています。","A line goes through a circle."],
	laIsolate : ["○につながっていない線があります。","A line doesn't connect any circle."],
	nmConnected : ["○が繋がっています。","There are connected circles."],
	nmIsolate : ["○から線が出ていません。","A circle doesn't start any line."]
},
"FailCode@rectslider":{
	csNotRect : ["黒マスのカタマリが正方形か長方形ではありません。","A mass of shaded cells is not rectangle."],
	bkSize1   : ["黒マスが一つで孤立しています。","There is a isolated shaded cells."],
	laOnNum   : ["黒マスの上を線が通過しています。","A line goes through a shaded cell."],
	laIsolate : ["黒マスにつながっていない線があります。","A line doesn't connect any shaded cell."],
	nmConnected : ["黒マスが繋がっています。","There are connected shaded cells."],
	nmIsolate : ["黒マスから線が出ていません。","A shaded cell doesn't start any line."]
}
});
