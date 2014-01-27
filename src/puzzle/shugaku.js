//
// パズル固有スクリプト部 修学旅行の夜版 shugaku.js v3.4.0
//

pzpr.createCustoms('shugaku', {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.owner.playmode){
			if(this.btn.Left){
				if(this.mousestart || this.mousemove){ this.inputFuton();}
				else if(this.mouseend){ this.inputFuton2();}
			}
			else if(this.btn.Right){
				if(this.mousestart || this.mousemove){ this.inputcell_shugaku();}
			}
		}
		else if(this.owner.editmode){
			if(this.mousestart){ this.inputqnum();}
		}
	},

	inputFuton : function(){
		var cell = this.getcell();

		if(!this.firstPoint.valid()){
			if(cell.isnull || cell.isNum()){ return;}
			this.mouseCell = cell;
			this.inputData = 1;
			this.firstPoint.set(this.inputPoint);
			cell.draw();
		}
		else{
			var old = this.inputData, adj = null;
			if(cell.isnull){ /* nop */} // 何もしない
			else if(this.mouseCell===cell){ this.inputData = 1;} // 入力開始時と同じセルの場合
			else{
				var dx=(this.inputPoint.bx-this.firstPoint.bx), dy=(this.inputPoint.by-this.firstPoint.by);
				if     (dx-dy>0 && dx+dy>0){ adj=this.mouseCell.rt(); this.inputData=5;}
				else if(dx-dy>0 && dx+dy<0){ adj=this.mouseCell.up(); this.inputData=2;}
				else if(dx-dy<0 && dx+dy>0){ adj=this.mouseCell.dn(); this.inputData=3;}
				else if(dx-dy<0 && dx+dy<0){ adj=this.mouseCell.lt(); this.inputData=4;}
				if(adj===null || adj.isnull || adj.isNum()){ this.inputData=6;}
			}
			if(old!=this.inputData){ this.mouseCell.drawaround();}
		}
	},
	inputFuton2 : function(){
		if(this.mouseCell.isnull){ return;}
		var cell = this.mouseCell;

		this.changeHalf(cell);
		if(this.inputData!==1 && this.inputData!==6){ cell.setQans(40+this.inputData); cell.setQsub(0);}
		else if(this.inputData=== 6){ cell.setQans(41); cell.setQsub(0);}
		else if(cell.getQans()===41){ cell.setQans(46); cell.setQsub(0);}
		else if(cell.getQans()===46){ cell.setQans(0);  cell.setQsub(1);}
//		else if(cell.getQans()=== 1){ cell.setQans(0);  cell.setQsub(0);}
		else                        { cell.setQans(41); cell.setQsub(0);}

		var adj = this.currentTargetADJ();
		if(!adj.isnull){
			this.changeHalf(adj);
			adj.setQans({2:48,3:47,4:50,5:49}[this.inputData]);
			adj.setQsub(0);
		}

		this.mousereset();
		cell.drawaround();
		this.mouseCell = this.owner.board.emptycell;
	},

	inputcell_shugaku : function(){
		var cell = this.getcell();
		if(cell.isnull || cell===this.mouseCell || cell.isNum()){ return;}
		if(this.inputData===null){
			if     (cell.getQans()===1){ this.inputData = 2;}
			else if(cell.getQsub()===1){ this.inputData = 3;}
			else{ this.inputData = 1;}
		}
		this.changeHalf(cell);
		this.mouseCell = cell;

		cell.setQans(this.inputData==1?1:0);
		cell.setQsub(this.inputData==2?1:0);

		cell.drawaround();
	},

	changeHalf : function(cell){
		var qa=cell.getQans(), adj=null;
		if     (qa===42 || qa===47){ adj=cell.up();}
		else if(qa===43 || qa===48){ adj=cell.dn();}
		else if(qa===44 || qa===49){ adj=cell.lt();}
		else if(qa===45 || qa===50){ adj=cell.rt();}

		if     (adj===null){ /* nop */ }
		else if(adj.getQans()>=42 && adj.getQans()<=45){ adj.setQans(41);}
		else if(adj.getQans()>=47 && adj.getQans()<=50){ adj.setQans(46);}
	},
	currentTargetADJ : function(){
		if(!this.mouseCell.isnull){
			var cell = this.mouseCell;
			switch(this.inputData){
				case 2: return cell.up();
				case 3: return cell.dn();
				case 4: return cell.lt();
				case 5: return cell.rt();
			}
		}
		return this.owner.board.emptycell;
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
	numberIsWhite : true,

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
		var k = pzpr.consts;
		var trans = {};
		switch(key){
			case k.FLIPY: trans={42:43,43:42,47:48,48:47}; break;	// 上下反転
			case k.FLIPX: trans={44:45,45:44,49:50,50:49}; break;	// 左右反転
			case k.TURNR: trans={42:45,45:43,43:44,44:42,47:50,50:48,48:49,49:47}; break;	// 右90°回転
			case k.TURNL: trans={42:44,44:43,43:45,45:42,47:49,49:48,48:50,50:47}; break;	// 左90°回転
			default: return;
		}
		var clist = this.owner.board.cell;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i], val = trans[cell.qans];
			if(!!val){ cell.qans=val;}
		}
	}
},

AreaBlackManager:{
	enabled : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	hideHatena : true,

	initialize : function(){
		this.Common.prototype.initialize.call(this);

		this.gridcolor = this.gridcolor_LIGHT;
		this.errbcolor1 = this.errbcolor1_DARK;
		this.bgcolor = "rgb(208, 208, 208)";
		this.targetbgcolor = "rgb(255, 192, 192)";
		this.circleratio = [0.47, 0.42];
	},
	paint : function(){
		this.drawDotCells(false);
		this.drawDashedGrid();
		this.drawBlackCells();

		this.drawFutons();
		this.drawPillows();
		this.drawBorders();

		this.drawCircles();
		this.drawNumbers();

		this.drawChassis();

		this.drawTarget();
	},

	drawFutons : function(){
		var g = this.vinc('cell_back', 'crispEdges'), mv = this.owner.mouse, tc = null, adj = null;

		var inputting=(!mv.mouseCell.isnull && mv.firstPoint.valid());
		if(inputting){ // ふとん入力中
			tc  = mv.mouseCell;
			adj = mv.currentTargetADJ();
		}

		var header = "c_full_";
		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i], isdraw = (cell.qans>=41);
			var color = (cell.error===1 ? this.errbcolor1 : "white");
			if(inputting){
				if(cell===tc || cell===adj){ isdraw=true; color=this.targetbgcolor;}
			}

			if(isdraw){
				g.fillStyle = color;
				if(this.vnop(header+cell.id,this.FILL)){
					var rpx = (cell.bx-1)*this.bw, rpy = (cell.by-1)*this.bh;
					g.fillRect(rpx+1, rpy+1, this.cw-1, this.ch-1);
				}
			}
			else{ this.vhide(header+cell.id);}
		}
	},
	drawPillows : function(){
		var g = this.vinc('cell_pillow', 'crispEdges'), mv = this.owner.mouse, tc = null, adj = null;

		var inputting=(!mv.mouseCell.isnull && mv.firstPoint.valid());
		if(inputting){ // ふとん入力中
			tc  = mv.mouseCell;
			adj = mv.currentTargetADJ();
		}

		var header = "c_pillow_";
		var clist = this.range.cells;
		var rw = this.bw*0.7-1, rh = this.bh*0.7-1;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i], isdraw = (cell.qans>=41 && cell.qans<=45);
			if(inputting){
				if     (!isdraw && tc ===cell){ isdraw = true;}
				else if( isdraw && adj===cell){ isdraw = false;}
			}

			if(isdraw){
				g.lineWidth = 1;
				g.strokeStyle = "black";
				if     (inputting && tc===cell){ g.fillStyle = this.targetbgcolor;}
				else if(cell.error===1)        { g.fillStyle = this.errbcolor1;   }
				else                           { g.fillStyle = "white";}

				if(this.vnop(header+cell.id,this.FILL)){
					var px = cell.bx*this.bw, py = cell.by*this.bh;
					g.shapeRect(px-rw, py-rh, rw*2+1, rh*2+1);
				}
			}
			else{ this.vhide([header+cell.id]);}
		}
	},

	getBorderColor : function(border){
		var isdraw = border.isBorder(), mv = this.owner.mouse;

		if(!mv.mouseCell.isnull && mv.firstPoint.valid()){ // ふとん入力中
			var cc1 = border.sidecell[0], cc2 = border.sidecell[1];
			var tc = mv.mouseCell, adj = mv.currentTargetADJ();
			var istc  = (cc1===tc  || cc2===tc);
			var isadj = (cc1===adj || cc2===adj);
			if     (istc && isadj){ isdraw = false;}
			else if(istc || isadj){ isdraw = true;}
		}

		return (isdraw ? "black" : null);
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
		var c=0, bstr = this.outbstr, bd = this.owner.board;
		for(var i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i), cell = bd.cell[c];
			if     (ca>='0' && ca<='4'){ cell.qnum = parseInt(ca,36);}
			else if(ca==='5')          { cell.qnum = -2;}
			else{ c+=(parseInt(ca,36)-6);}

			c++;
			if(c>=bd.cellmax){ break;}
		}
		this.outbstr = bstr.substr(i+1);
	},
	encodeShugaku : function(){
		var cm="", count=0, bd=this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
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
		this.decodeCell( function(obj,ca){
			if     (ca==="5"){ obj.qnum = -2;}
			else if(ca==="#"){ obj.qans = 1;}
			else if(ca==="-"){ obj.qsub = 1;}
			else if(ca>="a" && ca<="j"){ obj.qans = parseInt(ca,20)+31;}
			else if(ca!=="."){ obj.qnum = parseInt(ca);}
		});
	},
	encodeData : function(){
		this.encodeCell( function(obj){
			if     (obj.qnum>=0) { return (obj.qnum.toString() + " ");}
			else if(obj.qnum===-2){return "5 ";}
			else if(obj.qans===1){ return "# ";}
			else if(obj.qans>=41){ return ((obj.qans-31).toString(20) + " ");}
			else if(obj.qsub===1){ return "- ";}
			else                 { return ". ";}
		});
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.checkKitamakura() ){ return 'kitamakura';}
		if( !this.check2x2BlackCell() ){ return 'bc2x2';}
		if( !this.checkDir4PillowOver() ){ return 'nmPillowGt';}
		if( !this.checkFullSizeFuton() ){ return 'futonHalf';}
		if( !this.checkFutonAisle() ){ return 'futonMidPos';}

		var binfo = this.owner.board.getBCellInfo();
		if( !this.checkOneArea(binfo) ){ return 'bcDivide';}

		if( !this.checkDir4PillowLess() ){ return 'nmPillowLt';}
		if( !this.checkEmptyCell_shugaku() ){ return 'ceEmpty';}

		return null;
	},

	checkDir4PillowOver : function(){
		return this.checkDir4Cell(function(cell){ return cell.isPillow();},2)
	},
	checkDir4PillowLess : function(){
		return this.checkDir4Cell(function(cell){ return cell.isPillow();},1);
	},
	checkFullSizeFuton : function(){
		return this.checkAllCell(function(cell){ return (cell.getQans()===41||cell.getQans()===46);});
	},
	checkEmptyCell_shugaku : function(){
		return this.checkAllCell(function(cell){ return (cell.noNum() && cell.getQans()===0);});
	},

	checkKitamakura : function(){
		var result = true, bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c];
			if(cell.getQans()===43){
				if(this.checkOnly){ return false;}
				cell.seterr(1);
				cell.dn().seterr(1);
				result = false;
			}
		}
		return result;
	},

	checkFutonAisle : function(){
		var result = true, bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c];
			if(cell.isNum()){ continue;}

			var adj=null;
			switch(cell.getQans()){
				case 42: adj = cell.up(); break;
				case 43: adj = cell.dn(); break;
				case 44: adj = cell.lt(); break;
				case 45: adj = cell.rt(); break;
				default: continue;
			}
			if( cell.countDir4Cell(function(cell){ return cell.isBlack();})===0 &&
				adj .countDir4Cell(function(cell){ return cell.isBlack();})===0 )
			{
				if(this.checkOnly){ return false;}
				cell.seterr(1);
				adj.seterr(1);
				result = false;
			}
		}
		return result;
	}
},

FailCode:{
	bcDivide : ["通路が分断されています。","Aisle is divided."],
	nmPillowGt : ["柱のまわりにある枕の数が間違っています。", "The number of pillows around the number is wrong."],
	nmPillowLt : ["柱のまわりにある枕の数が間違っています。", "The number of pillows around the number is wrong."],
	kitamakura : ["北枕になっている布団があります。", "There is a 'Kita-makura' futon."],
	futonHalf  : ["布団が2マスになっていません。", "There is a half-size futon."],
	futonMidPos: ["通路に接していない布団があります。", "There is a futon separated to aisle."],
	ceEmpty : ["布団でも黒マスでもないマスがあります。", "There is an empty cell."]
}
});
