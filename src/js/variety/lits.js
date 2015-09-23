//
// パズル固有スクリプト部 ＬＩＴＳ・のりのり版 lits.js v3.4.1
//
pzpr.classmgr.makeCustom(['lits','norinori'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.puzzle.playmode){
			if(this.mousestart || this.mousemove){ this.inputcell();}
		}
		else if(this.puzzle.editmode){
			if(this.mousestart || this.mousemove){ this.inputborder();}
		}
	}
},

//---------------------------------------------------------
// 盤面管理系
Board:{
	hasborder : 1,

	getTetrominoInfo : function(rinfo){
		var tinfo = new this.klass.AreaInfo(); /* 各セルに入る黒マスのテトロミノの形が入る */
		for(var c=0;c<this.cellmax;c++){ tinfo.id[c]=null;}
		for(var r=1;r<=rinfo.max;r++){
			var clist = rinfo.area[r].clist.filter(function(cell){ return cell.isShade();});
			var len = clist.length;
			if(len===4){
				var cell0=clist.getTopCell(), bx0=cell0.bx, by0=cell0.by, value=0;
				for(var i=0;i<len;i++){ value += (((clist[i].by-by0)>>1)*10+((clist[i].bx-bx0)>>1));}
				switch(value){
					case 13: case 15: case 27: case 31: case 33: case 49: case 51:
						for(var i=0;i<len;i++){ tinfo.id[clist[i].id]="L";} break;
					case 6: case 60:
						for(var i=0;i<len;i++){ tinfo.id[clist[i].id]="I";} break;
					case 14: case 30: case 39: case 41:
						for(var i=0;i<len;i++){ tinfo.id[clist[i].id]="T";} break;
					case 20: case 24: case 38: case 42:
						for(var i=0;i<len;i++){ tinfo.id[clist[i].id]="S";} break;
				}
			}
		}
		return this.getBlockInfo(tinfo);
	},
	getBlockInfo : function(tinfo){
		var dinfo = new this.klass.AreaInfo(); /* 同じ部屋に含まれる黒マスのつながり情報 */
		for(var c=0;c<this.cellmax;c++){ dinfo.id[c]=(tinfo.id[c]!==null?0:null);}
		for(var c=0;c<this.cellmax;c++){
			var cell0 = this.cell[c];
			if(dinfo.id[cell0.id]!==0){ continue;}
			var area = dinfo.addArea();
			var stack=[cell0], n=0;
			while(stack.length>0){
				var cell = stack.pop();
				if(dinfo.id[cell.id]!==0){ continue;}

				area.clist[n++] = cell;
				dinfo.id[cell.id] = area.id;

				var list = cell.getdir4clist();
				for(var i=0;i<list.length;i++){
					if(tinfo.id[cell.id]===tinfo.id[list[i][0].id]){ stack.push(list[i][0]);}
				}
			}
			area.clist.length = n;
		}
		return dinfo;
	}
},

CellList:{
	isSeqBlock : function(){
		var stack=(this.length>0?[this[0]]:[]), count=this.length, passed={};
		for(var i=0;i<count;i++){ passed[this[i].id]=0;}
		while(stack.length>0){
			var cell=stack.pop();
			if(passed[cell.id]===1){ continue;}
			count--;
			passed[cell.id]=1;
			var list = cell.getdir4clist();
			for(var i=0;i<list.length;i++){
				if(passed[list[i][0].id]===0){ stack.push(list[i][0]);}
			}
		}
		return (count===0);
	}
},

AreaShadeManager:{
	enabled : true
},
AreaRoomManager:{
	enabled : true
},

Flags:{
	use : true
},
"Flags@lits":{
	use    : true,
	redblk : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	paint : function(){
		this.drawBGCells();
		if(this.pid==='lits'){ this.drawDotCells(false);}
		this.drawGrid();
		if(this.pid==='norinori'){ this.drawShadedCells();}

		this.drawBorders();

		this.drawChassis();

		if(this.pid==='norinori'){ this.drawBoxBorders(false);}
	}
},
"Graphic@lits":{
	gridcolor_type : "DARK",

	bgcellcolor_func : "qans2",
	qanscolor : "rgb(96, 96, 96)",
	errcolor2 : "rgb(32, 32, 255)"
},
"Graphic@norinori":{
	gridcolor_type : "LIGHT",

	bgcellcolor_func : "qsub1",
	bcolor : "rgb(96, 224, 160)",
	bbcolor : "rgb(96, 127, 127)"
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		var parser = pzpr.parser;
		var oldflag = ((type===parser.URL_PZPRV3  &&  this.checkpflag("d")) ||
					   (type===parser.URL_PZPRAPP && !this.checkpflag("c")));
		if(!oldflag || this.pid==='norinori'){
			this.decodeBorder();
		}
		else{
			this.decodeLITS_old();
		}
	},
	encodePzpr : function(type){
		if(type===pzpr.parser.URL_PZPRV3 || this.pid==='norinori'){
			this.encodeBorder();
		}
		else{
			this.outpflag='c';
			this.encodeBorder();
		}
	},

	decodeKanpen : function(){
		this.puzzle.fio.decodeAreaRoom();
	},
	encodeKanpen : function(){
		this.puzzle.fio.encodeAreaRoom();
	},

	decodeLITS_old : function(){
		var bstr = this.outbstr, bd = this.board;
		for(var id=0;id<bd.bdmax;id++){
			var border = bd.border[id];
			var cell1 = border.sidecell[0], cell2 = border.sidecell[1];
			if(!cell1.isnull && !cell2.isnull && bstr.charAt(cell1.id)!==bstr.charAt(cell2.id)){ border.ques = 1;}
		}
		this.outbstr = bstr.substr(bd.cellmax);
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeAreaRoom();
		this.decodeCellAns();
	},
	encodeData : function(){
		this.encodeAreaRoom();
		this.encodeCellAns();
	},

	kanpenOpen : function(){
		this.decodeAreaRoom();
		this.decodeCellAns();
	},
	kanpenSave : function(){
		this.encodeAreaRoom();
		this.encodeCellAns();
	},

	kanpenOpenXML : function(){
		this.decodeAreaRoom_XMLBoard();
		this.decodeCellAns_XMLAnswer();
	},
	kanpenSaveXML : function(){
		this.encodeAreaRoom_XMLBoard();
		this.encodeCellAns_XMLAnswer();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
"AnsCheck@lits#1":{
	checklist : [
		"check2x2ShadeCell",
		"checkOverShadeCellInArea",
		"checkSeqBlocksInRoom",
		"checkTetromino",
		"checkConnectShade",
		"checkNoShadeCellInArea",
		"checkLessShadeCellInArea"
	]
},
"AnsCheck@norinori#1":{
	checklist : [
		"checkOverShadeCell",
		"checkOverShadeCellInArea",
		"checkSingleShadeCell",
		"checkSingleShadeCellInArea",
		"checkNoShadeCellInArea"
	]
},
"AnsCheck@lits":{
	checkOverShadeCellInArea : function(){
		this.checkAllBlock(this.getRoomInfo(), function(cell){ return cell.isShade();}, function(w,h,a,n){ return (a<=4);}, "bkShadeGt4");
	},
	checkLessShadeCellInArea : function(){
		this.checkAllBlock(this.getRoomInfo(), function(cell){ return cell.isShade();}, function(w,h,a,n){ return (a>=4);}, "bkShadeLt4");
	},

	// 部屋の中限定で、黒マスがひとつながりかどうか判定する
	checkSeqBlocksInRoom : function(){
		var bd = this.board;
		for(var r=1;r<=bd.rooms.max;r++){
			var clist = bd.rooms.area[r].clist.filter(function(cell){ return cell.isShade();});
			if(clist.isSeqBlock()){ continue;}
			
			this.failcode.add("bkShadeDivide");
			if(this.checkOnly){ break;}
			clist.seterr(1);
		}
	},

	checkTetromino : function(){
		var rinfo = this.getRoomInfo();
		var dinfo = this.board.getTetrominoInfo(rinfo);
		for(var r=1;r<=dinfo.max;r++){
			var clist = dinfo.area[r].clist;
			if(clist.length<=4){ continue;}
			
			this.failcode.add("bsSameShape");
			if(this.checkOnly){ break;}
			clist.seterr(2);
		}
	}
},
"AnsCheck@norinori":{
	checkOverShadeCell : function(){
		this.checkAllArea(this.getShadeInfo(), function(w,h,a,n){ return (a<=2);}, "csGt2");
	},
	checkSingleShadeCell : function(){
		this.checkAllArea(this.getShadeInfo(), function(w,h,a,n){ return (a>=2);}, "csLt2");
	},

	checkOverShadeCellInArea : function(){
		this.checkAllBlock(this.getRoomInfo(), function(cell){ return cell.isShade();}, function(w,h,a,n){ return (a<=2);}, "bkShadeGt2");
	},
	checkSingleShadeCellInArea : function(){
		this.checkAllBlock(this.getRoomInfo(), function(cell){ return cell.isShade();}, function(w,h,a,n){ return (a!==1);}, "bkShadeLt2");
	}
},

"FailCode@lits":{
	bkShadeLt4 : ["黒マスのカタマリが４マス未満の部屋があります。","A room has three or less shaded cells."],
	bkShadeGt4 : ["５マス以上の黒マスがある部屋が存在します。", "A room has five or more shaded cells."],
	bsSameShape : ["同じ形のテトロミノが接しています。","Some Tetrominos that are the same shape are Adjacent."]
},

"FailCode@norinori":{
	csLt2 : ["１マスだけの黒マスのカタマリがあります。","There is a single shaded cell."],
	csGt2 : ["２マスより大きい黒マスのカタマリがあります。","The size of a mass of shaded cells is over two."],
	bkShadeLt2 : ["１マスしか黒マスがない部屋があります。","A room has only one shaded cell."],
	bkShadeGt2 : ["２マス以上の黒マスがある部屋が存在します。","A room has three or mode shaded cells."]
}
});
