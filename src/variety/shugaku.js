//
// パズル固有スクリプト部 修学旅行の夜版 shugaku.js
//
(function(pidlist, classbase){
	if(typeof module==='object' && module.exports){module.exports = [pidlist, classbase];}
	else{ pzpr.classmgr.makeCustom(pidlist, classbase);}
}(
['shugaku'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputModes : {edit:['number'],play:['futon','shade','unshade','clear']},
	mouseinput : function(){ // オーバーライド
		switch(this.inputMode){
		case 'number': case 'number-':
			this.mouseinput_number();
			break;
		case 'futon':
			if(this.mousestart || this.mousemove){ this.inputFuton();}
			else if(this.mouseend){ this.inputFuton2();}
			break;
		case 'shade': case 'unshade': case 'clear':
			this.inputcell_shugaku();
			break;
		case 'auto':
			this.mouseinput_auto();
			break;
		}
	},
	mouseinput_auto : function(){
		if(this.puzzle.playmode){
			if(this.btn==='left'){
				if(this.mousestart || this.mousemove){ this.inputFuton();}
				else if(this.mouseend){ this.inputFuton2();}
			}
			else if(this.btn==='right'){
				if(this.mousestart || this.mousemove){ this.inputcell_shugaku();}
			}
		}
		else if(this.puzzle.editmode){
			if(this.mousestart){ this.inputqnum();}
		}
	},

	inputFuton : function(){
		var cell = this.getcell();

		if(this.inputData===null){
			if(cell.isnull || cell.isNum()){ return;}
			if(cell.qans===46 || cell.qans===1 || cell.qsub===1){
				this.inputcell_shugaku();
			}
			else{
				this.mouseCell = cell;
				this.inputData = 41;
				this.firstPoint.set(this.inputPoint);
				cell.draw();
			}
			return;
		}

		if(this.inputData<=3){
			this.inputcell_shugaku();
		}
		else{
			var old = this.inputData, adj = null;
			if(cell.isnull){ /* nop */} // 何もしない
			else if(this.mouseCell===cell){ this.inputData = 41;} // 入力開始時と同じセルの場合
			else{
				var dx=(this.inputPoint.bx-this.firstPoint.bx), dy=(this.inputPoint.by-this.firstPoint.by);
				var adc = this.mouseCell.adjacent;
				if     (dx-dy>0 && dx+dy>0){ adj=adc.right;  this.inputData=45;}
				else if(dx-dy>0 && dx+dy<0){ adj=adc.top;    this.inputData=42;}
				else if(dx-dy<0 && dx+dy>0){ adj=adc.bottom; this.inputData=43;}
				else if(dx-dy<0 && dx+dy<0){ adj=adc.left;   this.inputData=44;}
				if(adj===null || adj.isnull || adj.isNum()){ this.inputData=46;}
			}
			if(old!==this.inputData){ this.mouseCell.drawaround();}
		}
	},
	inputFuton2 : function(){
		if(this.mouseCell.isnull || !this.inputData || this.inputData<=3){ return;}
		var cell = this.mouseCell;

		this.changeHalf(cell);
		if(this.inputData!==41 && this.inputData!==46){ cell.setQans(this.inputData); cell.setQsub(0);}
		else if(this.inputData===46){ cell.setQans(41); cell.setQsub(0);}
		else if(cell.qans===41){ cell.setQans(46); cell.setQsub(0);}
		else if(this.inputMode==='futon'){
			if     (cell.qans===46){ cell.setQans(0);  cell.setQsub(0);}
			else                   { cell.setQans(41); cell.setQsub(0);}
		}
		else{
			if     (cell.qans===46){ cell.setQans(1);  cell.setQsub(0);}
			else if(cell.qans=== 1){ cell.setQans(0);  cell.setQsub(1);}
			else if(cell.qsub=== 1){ cell.setQans(0);  cell.setQsub(0);}
			else                   { cell.setQans(41); cell.setQsub(0);}
		}

		var adj = this.currentTargetADJ();
		if(!adj.isnull){
			this.changeHalf(adj);
			adj.setQans({42:48,43:47,44:50,45:49}[this.inputData]);
			adj.setQsub(0);
		}

		this.mousereset();
		cell.drawaround();
		this.mouseCell = this.board.emptycell;
	},

	inputcell_shugaku : function(){
		var cell = this.getcell();
		if(cell.isnull || cell===this.mouseCell || cell.isNum()){ return;}
		if(this.inputData===null){ switch(this.inputMode){
			case 'shade':   this.inputData = (cell.qans!==1?1:3); break;
			case 'unshade': this.inputData = (cell.qsub!==1?2:3); break;
			case 'clear': case 'futon': this.inputData = 3; break;
			default: // 'auto'
				if     (cell.qans===1){ this.inputData = 2;}
				else if(cell.qsub===1){ this.inputData = 3;}
				else{ this.inputData = 1;}
				break;
		}}

		this.changeHalf(cell);
		this.mouseCell = cell;

		cell.setQans(this.inputData===1?1:0);
		cell.setQsub(this.inputData===2?1:0);

		cell.drawaround();
	},

	changeHalf : function(cell){
		var qa=cell.qans, adc=cell.adjacent, adj=null;
		if     (qa===42 || qa===47){ adj=adc.top;   }
		else if(qa===43 || qa===48){ adj=adc.bottom;}
		else if(qa===44 || qa===49){ adj=adc.left;  }
		else if(qa===45 || qa===50){ adj=adc.right; }

		if     (adj===null){ /* nop */ }
		else if(adj.qans>=42 && adj.qans<=45){ adj.setQans(41);}
		else if(adj.qans>=47 && adj.qans<=50){ adj.setQans(46);}
	},
	currentTargetADJ : function(){
		if(!this.mouseCell.isnull){
			var adc = this.mouseCell.adjacent;
			switch(this.inputData){
				case 42: return adc.top;
				case 43: return adc.bottom;
				case 44: return adc.left;
				case 45: return adc.right;
			}
		}
		return this.board.emptycell;
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

	isPillow : function(){ return (this.qans>=41 && this.qans<=45);}
},
Border:{
	// 41～45:まくらありふとんマス 46～50:まくらなしふとんマス
	// 42/47,43/48,44/49,45/50:それぞれ上・下・左・右だけ境界線がない
	isbdh_cc1 : {41:1,42:1,44:1,45:1,46:1,47:1,49:1,50:1},
	isbdh_cc2 : {41:1,43:1,44:1,45:1,46:1,48:1,49:1,50:1},
	isbdv_cc1 : {41:1,42:1,43:1,44:1,46:1,47:1,48:1,49:1},
	isbdv_cc2 : {41:1,42:1,43:1,45:1,46:1,47:1,48:1,50:1},

	isBorder : function(){
		var qa1 = this.sidecell[0].qans;
		var qa2 = this.sidecell[1].qans;
		if(this.isVert()){ return (!!this.isbdv_cc1[qa1] || !!this.isbdv_cc2[qa2]);}
		else             { return (!!this.isbdh_cc1[qa1] || !!this.isbdh_cc2[qa2]);}
	}
},

Board:{
	hasborder : 1
},
BoardExec:{
	adjustBoardData : function(key,d){
		var trans = {};
		switch(key){
			case this.FLIPY: trans={42:43,43:42,47:48,48:47}; break;	// 上下反転
			case this.FLIPX: trans={44:45,45:44,49:50,50:49}; break;	// 左右反転
			case this.TURNR: trans={42:45,45:43,43:44,44:42,47:50,50:48,48:49,49:47}; break;	// 右90°回転
			case this.TURNL: trans={42:44,44:43,43:45,45:42,47:49,49:48,48:50,50:47}; break;	// 左90°回転
			default: return;
		}
		var clist = this.board.cell;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i], val = trans[cell.qans];
			if(!!val){ cell.qans=val;}
		}
	}
},

AreaShadeGraph:{
	enabled : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	hideHatena : true,

	qanscolor : "black",
	bcolor : "rgb(208, 208, 208)",
	targetbgcolor : "rgb(255, 192, 192)",	/* 入力中の布団の色 */
	undefcolor : "silver",					/* 未確定マスの色 */

	circleratio : [0.47, 0.42],

	numbercolor_func : "qnum",

	paint : function(){
		this.drawBGCells();
		this.drawShadedCells();
		this.drawDotCells(false);
		this.drawDashedGrid();

		this.drawFutons();
		this.drawPillows();
		this.drawBorders();

		this.drawCircles();
		this.drawQuesNumbers();

		this.drawChassis();

		this.drawTarget();
	},

	getBGCellColor_error1 : function(cell){
		if(this.puzzle.execConfig('undefcell') && cell.qans===0 && cell.qnum===-1){ return this.undefcolor;}
		else if(cell.error===1||cell.qinfo===1){ return this.errbcolor1;}
		return null;
	},

	drawFutons : function(){
		var g = this.vinc('cell_futon', 'crispEdges', true), mv = this.puzzle.mouse, tc = null, adj = null;

		var inputting=(!mv.mouseCell.isnull && mv.firstPoint.bx!==null && mv.inputData>=40);
		if(inputting){ // ふとん入力中
			tc  = mv.mouseCell;
			adj = mv.currentTargetADJ();
		}

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i], isdraw = (cell.qans>=41);
			var color = (cell.error===1 ? this.errbcolor1 : "white");
			if(inputting){
				if(cell===tc || cell===adj){ isdraw=true; color=this.targetbgcolor;}
			}

			g.vid = "c_futon_"+cell.id;
			if(isdraw){
				g.fillStyle = color;
				g.fillRectCenter(cell.bx*this.bw, cell.by*this.bh, this.bw, this.bh);
			}
			else{ g.vhide();}
		}
	},
	drawPillows : function(){
		var g = this.vinc('cell_pillow', 'crispEdges', true), mv = this.puzzle.mouse, tc = null, adj = null;

		var inputting=(!mv.mouseCell.isnull && mv.firstPoint.bx!==null);
		if(inputting){ // ふとん入力中
			tc  = mv.mouseCell;
			adj = mv.currentTargetADJ();
		}

		var clist = this.range.cells;
		var rw = this.bw*0.7-1, rh = this.bh*0.7-1;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i], isdraw = (cell.qans>=41 && cell.qans<=45);
			if(inputting){
				if     (!isdraw && tc ===cell){ isdraw = true;}
				else if( isdraw && adj===cell){ isdraw = false;}
			}

			g.vid = "c_pillow_"+cell.id;
			if(isdraw){
				g.lineWidth = 1;
				g.strokeStyle = (!cell.trial ? "black" : this.trialcolor);
				if     (inputting && tc===cell){ g.fillStyle = this.targetbgcolor;}
				else if(cell.error===1)        { g.fillStyle = this.errbcolor1;   }
				else                           { g.fillStyle = "white";}
				g.shapeRectCenter(cell.bx*this.bw, cell.by*this.bh, rw, rh);
			}
			else{ g.vhide();}
		}
	},

	getBorderColor : function(border){
		var isdraw = border.isBorder(), mv = this.puzzle.mouse, trial = false;
		var cell1 = border.sidecell[0], cell2 = border.sidecell[1];

		if(!mv.mouseCell.isnull && mv.firstPoint.bx!==null){ // ふとん入力中
			var tc = mv.mouseCell, adj = mv.currentTargetADJ();
			var istc  = (cell1===tc  || cell2===tc);
			var isadj = (cell1===adj || cell2===adj);
			if     (istc && isadj){ isdraw = false;} // 入力中布団の真ん中の線は描画しない
			else if(istc || isadj){ // 入力中布団の真ん中以外の線は描画する
				isdraw = true;
				if(this.board.trialstage>0){ trial = true;}
			}
		}
		else{
			trial = ((cell1.trial||cell1.qans===0) && (cell2.trial||cell2.qans===0));
		}

		return (isdraw ? (!trial ? this.shadecolor : this.trialcolor) : null);
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodeShugaku();
	},
	encodePzpr : function(type){
		this.encodeShugaku();
	},

	decodeShugaku : function(){
		var c=0, bstr = this.outbstr, bd = this.board;
		for(var i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i), cell = bd.cell[c];
			if     (ca>='0' && ca<='4'){ cell.qnum = parseInt(ca,36);}
			else if(ca==='5')          { cell.qnum = -2;}
			else{ c+=(parseInt(ca,36)-6);}

			c++;
			if(!bd.cell[c]){ break;}
		}
		this.outbstr = bstr.substr(i+1);
	},
	encodeShugaku : function(){
		var cm="", count=0, bd=this.board;
		for(var c=0;c<bd.cell.length;c++){
			var pstr = "", val = bd.cell[c].qnum;

			if     (val===-2){ pstr = "5";}
			else if(val!==-1){ pstr = val.toString(36);}
			else{ count++;}

			if(count===0){ cm += pstr;}
			else if(pstr || count===30){ cm+=((5+count).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm+=(5+count).toString(36);}
		this.outbstr += cm;
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCell( function(cell,ca){
			if     (ca==="5"){ cell.qnum = -2;}
			else if(ca==="#"){ cell.qans = 1;}
			else if(ca==="-"){ cell.qsub = 1;}
			else if(ca>="a" && ca<="j"){ cell.qans = parseInt(ca,20)+31;}
			else if(ca!=="."){ cell.qnum = +ca;}
		});
	},
	encodeData : function(){
		this.encodeCell( function(cell){
			if     (cell.qnum>=0) { return cell.qnum+" ";}
			else if(cell.qnum===-2){return "5 ";}
			else if(cell.qans===1){ return "# ";}
			else if(cell.qans>=41){ return ((cell.qans-31).toString(20) + " ");}
			else if(cell.qsub===1){ return "- ";}
			else                  { return ". ";}
		});
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checklist : [
		"checkKitamakura",
		"check2x2ShadeCell",
		"checkDir4PillowOver",
		"checkFullSizeFuton",
		"checkFutonAisle",
		"checkConnectShade",
		"checkDir4PillowLess",
		"checkEmptyCell_shugaku+"
	],

	checkDir4PillowOver : function(){
		this.checkDir4Cell(function(cell){ return cell.isPillow();},2, "nmPillowGt");
	},
	checkDir4PillowLess : function(){
		this.checkDir4Cell(function(cell){ return cell.isPillow();},1, "nmPillowLt");
	},
	checkFullSizeFuton : function(){
		this.checkAllCell(function(cell){ return (cell.qans===41||cell.qans===46);}, "futonHalf");
	},
	checkEmptyCell_shugaku : function(){
		this.checkAllCell(function(cell){ return (cell.noNum() && cell.qans===0);}, "ceEmpty");
	},

	checkKitamakura : function(){
		var bd = this.board;
		for(var c=0;c<bd.cell.length;c++){
			var cell = bd.cell[c];
			if(cell.qans!==43){ continue;}

			this.failcode.add("kitamakura");
			if(this.checkOnly){ break;}
			cell.seterr(1);
			cell.adjacent.bottom.seterr(1);
		}
	},

	checkFutonAisle : function(){
		var bd = this.board;
		for(var c=0;c<bd.cell.length;c++){
			var cell = bd.cell[c];
			if(cell.isNum()){ continue;}

			var adc=cell.adjacent, adj=null;
			switch(cell.qans){
				case 42: adj = adc.top;    break;
				case 43: adj = adc.bottom; break;
				case 44: adj = adc.left;   break;
				case 45: adj = adc.right;  break;
				default: continue;
			}
			if( cell.countDir4Cell(function(cell){ return cell.isShade();})>0 ||
				adj .countDir4Cell(function(cell){ return cell.isShade();})>0 ){ continue;}

			this.failcode.add("futonMidPos");
			if(this.checkOnly){ break;}
			cell.seterr(1);
			adj.seterr(1);
		}
	}
},

FailCode:{
	csDivide : ["通路が分断されています。","Aisle is divided."],
	nmPillowGt : ["柱のまわりにある枕の数が間違っています。", "The number of pillows around the number is wrong."],
	nmPillowLt : ["柱のまわりにある枕の数が間違っています。", "The number of pillows around the number is wrong."],
	kitamakura : ["北枕になっている布団があります。", "There is a 'Kita-makura' futon."],
	futonHalf  : ["布団が2マスになっていません。", "There is a half-size futon."],
	futonMidPos: ["通路に接していない布団があります。", "There is a futon separated to aisle."],
	ceEmpty : ["布団でも黒マスでもないマスがあります。", "There is an empty cell."]
}
}));
