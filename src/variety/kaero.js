//
// パズル固有スクリプト部 お家に帰ろう・ぐんたいあり版 kaero.js
//
(function(pidlist, classbase){
	if(typeof module==='object' && module.exports){module.exports = [pidlist, classbase];}
	else{ pzpr.classmgr.makeCustom(pidlist, classbase);}
}(
['kaero','armyants'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputModes : {edit:['border','number','clear'],play:['line','peke','bgcolor','bgcolor1','bgcolor2','clear']},
	mouseinput_auto : function(){
		if(this.puzzle.playmode){
			if(this.mousestart || this.mousemove){
				if     (this.btn==='left') { this.inputLine();}
				else if(this.btn==='right'){ this.inputpeke();}
			}
			else if(this.mouseend && this.notInputted()){
				this.inputlight();
			}
		}
		else if(this.puzzle.editmode){
			if(this.mousestart || this.mousemove){ this.inputborder();}
			else if(this.mouseend && this.notInputted()){ this.inputqnum();}
		}
	},

	inputlight : function(){
		var cell = this.getcell();
		if(cell.isnull){ return;}

		if     (cell.qsub===0){ cell.setQsub(this.btn==='left'?1:2);}
		else if(cell.qsub===1){ cell.setQsub(this.btn==='left'?2:0);}
		else if(cell.qsub===2){ cell.setQsub(this.btn==='left'?0:1);}
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
"Cell@kaero":{
	numberAsLetter : true,
	maxnum : 52
},
"Cell@armyants":{
	maxnum : function(){
		var max=this.board.cell.length;
		return (max<=999?max:999);
	},
	getNextStepCell : function(step){
		var adjnodes = this.antnodes[0].nodes;
		var dirinfo = [];
		for(var i=0;i<adjnodes.length;++i){
			var adjcell = adjnodes[i].obj;
			if(adjcell.base.qnum===step+1 || adjcell.base.qnum===-2){
				dirinfo.push({dir:this.getdir(adjcell, 2), cell:adjcell});
			}
		}
		return dirinfo;
	}
},
CellList:{
	getDeparture : function(){ return this.map(function(cell){ return cell.base;}).notnull();}
},
"CellList@armyants":{
	isCmp: function(){
		if(this.length===1 && (this[0].base.qnum===1||this[0].base.qnum===-2)){ return true;}
		var firstcell = this.filter(function(cell){ return cell.base.qnum===1;})[0];
		if(!!firstcell){
			return this.traceNumber(firstcell);
		}
		else{
			var firstcells = this.filter(function(cell){ return cell.base.qnum===-2;});
			for(var i=0;i<firstcells.length;++i){
				if(this.traceNumber(firstcells[i])){ return true;}
			}
		}
		return false;
	},
	// 2マスの以上のアリに対してサーチを行う
	traceNumber : function(firstcell){
		var history = [{prev:null, cell:firstcell, next:firstcell.getNextStepCell(1)}];
		while(history.length>0 && history.length<this.length){
			var data = history[history.length-1], cell = data.cell, nextdata = null;
			while(!nextdata && data.next.length>0){
				var nextinfo = data.next.shift();
				var cell2 = nextinfo.cell;
				if(cell2!==data.prev){
					nextdata = {prev:cell, cell:cell2, next:cell2.getNextStepCell(history.length+1)};
				}
			}

			if(!!nextdata){ history.push(nextdata);}
			else          { history.pop();}
		}
		// 全てのセルに到達した場合 => trueを返す
		return (history.length>=this.length);
	}
},
"Border@armyants":{
	enableLineNG : true,
	isLineNG : function(){ return this.isBorder();}
},

Board:{
	cols : 6,
	rows : 6,

	hasborder : 1
},
"Board@armyants":{
	addExtraInfo : function(){
		this.antmgr = this.addInfoList(this.klass.AreaAntGraph);
	}
},

LineGraph:{
	enabled : true,
	moveline : true
},

"AreaRoomGraph@kaero":{
	enabled : true
},

'AreaAntGraph:AreaGraphBase@armyants':{
	enabled : true,
	relation : {'cell.qnum':'node','border.line':'move'},
	setComponentRefs : function(obj, component){ obj.ant = component;},
	getObjNodeList   : function(nodeobj){ return nodeobj.antnodes;},
	resetObjNodeList : function(nodeobj){ nodeobj.antnodes = [];},

	isnodevalid : function(cell){ return (cell.base.qnum!==-1);},
	isedgevalidbynodeobj : function(cell1, cell2){
		var num1 = cell1.base.qnum, num2 = cell2.base.qnum;
		return (num1===-2) || (num2===-2) || ((num1===-1)===(num2===-1)) && (Math.abs(num1-num2)===1);
	},
	modifyOtherInfo : function(border,relation){
		this.setEdgeByNodeObj(border.sidecell[0]);
		this.setEdgeByNodeObj(border.sidecell[1]);
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	gridcolor_type : "LIGHT",

	bgcellcolor_func : "qsub2",
	numbercolor_func : "move",
	qsubcolor1 : "rgb(224, 224, 255)",
	qsubcolor2 : "rgb(255, 255, 144)",

	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();
		this.drawBorders();

		this.drawTip();
		this.drawPekes();
		this.drawDepartures();
		this.drawLines();

		this.drawCellSquare();
		this.drawQuesNumbers();

		this.drawChassis();

		this.drawTarget();
	},

	drawCellSquare : function(){
		var g = this.vinc('cell_number_base', 'crispEdges', true);

		var rw = this.bw*0.7-1;
		var rh = this.bh*0.7-1;
		var isdrawmove = this.puzzle.execConfig('dispmove');

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i];
			g.vid = "c_sq_"+cell.id;
			if((!isdrawmove && cell.isDeparture()) || (isdrawmove && cell.isDestination())){
				if     (cell.error===1){ g.fillStyle = this.errbcolor1;}
				else if(cell.qsub ===1){ g.fillStyle = this.qsubcolor1;}
				else if(cell.qsub ===2){ g.fillStyle = this.qsubcolor2;}
				else                   { g.fillStyle = this.bgcolor;}

				g.fillRectCenter(cell.bx*this.bw, cell.by*this.bh, rw, rh);
			}
			else{ g.vhide();}
		}
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodeBorder();
		if(this.pid==='kaero'){ this.decodeKaero();}
		else                  { this.decodeNumber16();}
	},
	encodePzpr : function(type){
		this.encodeBorder();
		if(this.pid==='kaero'){ this.encodeKaero();}
		else                  { this.encodeNumber16();}
	},

	decodeKaero : function(){
		var c=0, a=0, bstr = this.outbstr, bd = this.board;
		for(var i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i), cell=bd.cell[c];

			if     (this.include(ca,'0','9')){ cell.qnum = parseInt(ca,36)+27;}
			else if(this.include(ca,'A','Z')){ cell.qnum = parseInt(ca,36)-9; }
			else if(ca==="-"){ cell.qnum = parseInt(bstr.charAt(i+1),36)+37; i++;}
			else if(ca==="."){ cell.qnum = -2;}
			else if(this.include(ca,'a','z')){ c+=(parseInt(ca,36)-10);}

			c++;
			if(!bd.cell[c]){ a=i+1; break;}
		}

		this.outbstr = bstr.substring(a);
	},
	encodeKaero : function(){
		var cm="", count=0, bd = this.board;
		for(var c=0;c<bd.cell.length;c++){
			var pstr = "", qnum = bd.cell[c].qnum;
			if     (qnum===-2){ pstr = ".";}
			else if(qnum>= 1 && qnum<=26){ pstr = ""+ (qnum+9).toString(36).toUpperCase();}
			else if(qnum>=27 && qnum<=36){ pstr = ""+ (qnum-27).toString(10);}
			else if(qnum>=37 && qnum<=72){ pstr = "-"+ (qnum-37).toString(36).toUpperCase();}
			else{ count++;}

			if(count===0){ cm += pstr;}
			else if(pstr||count===26){ cm+=((9+count).toString(36).toLowerCase()+pstr); count=0;}
		}
		if(count>0){ cm+=(9+count).toString(36).toLowerCase();}

		this.outbstr += cm;
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCellQnum();
		this.decodeCellQanssub();
		this.decodeBorderQues();
		this.decodeBorderLine();
	},
	encodeData : function(){
		this.encodeCellQnum();
		this.encodeCellQanssub();
		this.encodeBorderQues();
		this.encodeBorderLine();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
"AnsCheck@kaero#1":{
	checklist : [
		"checkBranchLine",
		"checkCrossLine",
		"checkConnectObject",
		"checkLineOverLetter",

		"checkSameObjectInRoom_kaero",
		"checkGatheredObject",
		"checkNoObjectBlock",

		"checkDisconnectLine"
	]
},
"AnsCheck@armyants#1":{
	checklist : [
		"checkBranchLine",
		"checkCrossLine",
		"checkConnectObject",
		"checkLineOverLetter",
		"checkLineOverBorder",

		"checkUniqueNumberInBlock",
		"checkNumberWithinSize",
		"checkSideCell_ants",
		"checkAntNumber",

		"checkDisconnectLine",
		"checkNumberExist"
	]
},
"AnsCheck@kaero":{
	// checkSameObjectInRoom()にbaseを付加した関数
	checkSameObjectInRoom_kaero : function(){
		var rooms = this.board.roommgr.components;
		allloop:
		for(var r=0;r<rooms.length;r++){
			var clist = rooms[r].clist, rnum=-1;
			var cbase = clist.getDeparture();
			for(var i=0;i<cbase.length;i++){
				var num=cbase[i].qnum;
				if(rnum===-1){ rnum=num;}
				else if(rnum!==num){
					this.failcode.add("bkPlNum");
					if(this.checkOnly){ break allloop;}
					if(!this.puzzle.execConfig('dispmove')){ cbase.seterr(4);}
					clist.seterr(1);
				}
			}
		}
	},

	// 同じ値であれば、同じ部屋に存在することを判定する
	checkGatheredObject : function(){
		var max=0, bd=this.board;
		for(var c=0;c<bd.cell.length;c++){ var num=bd.cell[c].base.qnum; if(max<num){ max=num;} }
		allloop:
		for(var num=0;num<=max;num++){
			var clist = bd.cell.filter(function(cell){ return (num===cell.base.qnum);}), rid=null;
			for(var i=0;i<clist.length;i++){
				var room = clist[i].room;
				if(rid===null){ rid=room;}
				else if(room!==null && rid!==room){
					this.failcode.add("bkSepNum");
					if(!this.puzzle.execConfig('dispmove')){ clist.getDeparture().seterr(4);}
					clist.seterr(1);
					break allloop;
				}
			}
		}
	},

	checkNoObjectBlock : function(){
		this.checkNoMovedObjectInRoom(this.board.roommgr);
	}
},
"AnsCheck@armyants":{
	checkLineOverBorder : function(){
		var bd = this.board, result = true;
		for(var id=0;id<bd.border.length;id++){
			var border = bd.border[id];
			if(!border.isBorder() || !border.isLine()){ continue;}

			result = false;
			if(this.checkOnly){ break;}
			border.seterr(1);
		}
		if(!result){
			this.failcode.add("laOnBorder");
			bd.border.setnoerr();
		}
	},

	checkUniqueNumberInBlock : function(){
		this.checkDifferentNumberInRoom_main(this.board.antmgr, this.isDifferentNumberInClistBase);
	},
	isDifferentNumberInClistBase : function(clist){
		return this.isIndividualObject(clist, function(cell){ return cell.base.qnum;});
	},

	checkNumberWithinSize : function(){
		this.checkAllCell( function(cell){ return (cell.ant && (cell.base.qnum > cell.ant.clist.length));}, "ceNumGtSize" );
	},

	checkAntNumber : function(){
		var areas = this.board.antmgr.components;
		for(var id=0;id<areas.length;id++){
			var ant = areas[id];
			if(ant.clist.isCmp()){ continue;}

			this.failcode.add("bkWrongNum");
			if(this.checkOnly){ break;}
			this.board.cell.setnoerr();
			ant.clist.seterr(1);
		}
	},

	checkSideCell_ants : function(){
		var result = true, bd = this.board;
		for(var c=0;c<bd.cell.length;c++){
			var cell = bd.cell[c], errcell = null, cell2 = cell.adjacent.right, cell3 = cell.adjacent.bottom;
			if(!cell.ant){ continue;}
			if     (!cell2.isnull && !!cell2.ant && cell.ant!==cell2.ant){ errcell = cell2;}
			else if(!cell3.isnull && !!cell3.ant && cell.ant!==cell3.ant){ errcell = cell3;}
			if(!!errcell){
				result = false;
				if(this.checkOnly){ break;}
				cell.ant.clist.seterr(1);
				errcell.ant.clist.seterr(1);
			}
		}
		if(!result){ this.failcode.add("bsAnt");}
	}
},

"FailCode@kaero":{
	bkNoNum : ["アルファベットのないブロックがあります。","A block has no letters."],
	bkPlNum : ["１つのブロックに異なるアルファベットが入っています。","A block has plural kinds of letters."],
	bkSepNum : ["同じアルファベットが異なるブロックに入っています。","Same kinds of letters are placed different blocks."]
},
"FailCode@armyants":{
	laOnNum    :["数字の上を線が通過しています。","There is a line across a number."],
	laOnBorder :["線が境界線をまたいでいます。","There is a line across a border."],
	bsAnt      :["別々のアリが接しています。","Other ants are adjacent."],
	bkWrongNum :["アリの数字がおかしいです。","Numbers on the ant is wrong."],
	ceNumGtSize:["数字がアリの大きさよりも大きいです。","A number is greater than the size of the ant."],
	nmBranch   :["アリが分岐しています。","An ant could have branch."]
}
}));
