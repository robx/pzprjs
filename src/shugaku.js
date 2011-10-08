//
// パズル固有スクリプト部 修学旅行の夜版 shugaku.js v3.4.0
//
pzprv3.custom.shugaku = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputedit : function(){
		if(this.mousestart){ this.inputqnum();}
	},
	inputplay : function(){
		if(this.mousestart || this.mousemove){
			if     (this.btn.Left) { this.inputFuton();}
			else if(this.btn.Right){ this.inputcell_shugaku();}
		}
		else if(this.mouseend){
			if(this.btn.Left){ this.inputFuton2();}
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
				var dx=(this.inputPoint.px-this.firstPoint.px), dy=(this.inputPoint.py-this.firstPoint.py);
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
		this.mouseCell = bd.newObject(bd.CELL);
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
		if(this.mouseCell.isnull){ return bd.newObject(bd.CELL);}
		var cell = this.mouseCell;
		switch(this.inputData){
			case 2: return cell.up();
			case 3: return cell.dn();
			case 4: return cell.lt();
			case 5: return cell.rt();
		}
		return bd.newObject(bd.CELL);
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,

	enablemake_p : true,
	paneltype    : 4
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
	isborder : 1,

	adjustBoardData : function(key,d){
		var trans = {};
		switch(key){
			case this.FLIPY: trans={42:43,43:42,47:48,48:47}; break;	// 上下反転
			case this.FLIPX: trans={44:45,45:44,49:50,50:49}; break;	// 左右反転
			case this.TURNR: trans={42:45,45:43,43:44,44:42,47:50,50:48,48:49,49:47}; break;	// 右90°回転
			case this.TURNL: trans={42:44,44:43,43:45,45:42,47:49,49:48,48:50,50:47}; break;	// 左90°回転
			default: return;
		}
		for(var c=0;c<this.cellmax;c++){
			var val=trans[this.cell[c].qans]; if(!!val){ this.cell[c].qans=val;}
		}
	}
},

AreaManager:{
	checkBlackCell : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	hideHatena : true,

	setColors : function(){
		this.gridcolor = this.gridcolor_LIGHT;
		this.errbcolor1 = this.errbcolor1_DARK;
		this.bgcolor = "rgb(208, 208, 208)";
		this.targetbgcolor = "rgb(255, 192, 192)";
		this.circleratio = [0.44, 0.44];
	},
	paint : function(){
		this.drawDotCells(false);
		this.drawDashedGrid();
		this.drawBlackCells();

		this.drawFutons();
		this.drawPillows();
		this.drawBorders();

		this.drawCirclesAtNumber();
		this.drawNumbers();

		this.drawChassis();

		this.drawTarget();
	},

	drawFutons : function(){
		var g = this.vinc('cell_back', 'crispEdges'), mv = this.owner.mouse;

		var inputting=(!mv.mouseCell.isnull && mv.firstPoint.valid()), tc=null, adj=null;
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
					g.fillRect(cell.rpx+1, cell.rpy+1, this.cw-1, this.ch-1);
				}
			}
			else{ this.vhide(header+cell.id);}
		}
	},
	drawPillows : function(){
		var g = this.vinc('cell_pillow', 'crispEdges'), mv = this.owner.mouse;

		var inputting=(!mv.mouseCell.isnull && mv.firstPoint.valid()), tc=null, adj=null;
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
					g.shapeRect(cell.px-rw, cell.py-rh, rw*2+1, rh*2+1);
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
	pzlimport : function(type){
		this.decodeShugaku();
	},
	pzlexport : function(type){
		this.encodeShugaku();
	},

	decodeShugaku : function(){
		var c=0, bstr = this.outbstr;
		for(var i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i);
			if     (ca>='0' && ca<='4'){ bd.cell[c].qnum = parseInt(ca,36);}
			else if(ca==='5')          { bd.cell[c].qnum = -2;}
			else{ c+=(parseInt(ca,36)-6);}

			c++;
			if(c>=bd.cellmax){ break;}
		}
		this.outbstr = bstr.substr(i);
	},
	encodeShugaku : function(){
		var cm="", count=0;
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

		if( !this.checkKitamakura() ){
			this.setAlert('北枕になっている布団があります。', 'There is a \'Kita-makura\' futon.'); return false;
		}

		if( !this.check2x2Block( function(cell){ return cell.isBlack();} ) ){
			this.setAlert('2x2の黒マスのかたまりがあります。', 'There is a 2x2 block of black cells.'); return false;
		}

		if( !this.checkDir4Cell(function(cell){ return cell.isPillow();},2) ){
			this.setAlert('柱のまわりにある枕の数が間違っています。', 'The number of pillows around the number is wrong.'); return false;
		}

		if( !this.checkAllCell(function(cell){ return (cell.getQans()===41||cell.getQans()===46);}) ){
			this.setAlert('布団が2マスになっていません。', 'There is a half-size futon.'); return false;
		}

		if( !this.checkFutonAisle() ){
			this.setAlert('通路に接していない布団があります。', 'There is a futon separated to aisle.'); return false;
		}

		if( !this.checkOneArea( bd.areas.getBCellInfo() ) ){
			this.setAlert('黒マスが分断されています。', 'Aisle is divided.'); return false;
		}

		if( !this.checkDir4Cell(function(cell){ return cell.isPillow();},1) ){
			this.setAlert('柱のまわりにある枕の数が間違っています。', 'The number of pillows around the number is wrong.'); return false;
		}

		if( !this.checkAllCell(function(cell){ return (cell.noNum() && cell.getQans()===0);}) ){
			this.setAlert('布団でも黒マスでもないマスがあります。', 'There is an empty cell.'); return false;
		}

		return true;
	},

	checkKitamakura : function(){
		var result = true;
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c];
			if(cell.getQans()===43){
				if(this.inAutoCheck){ return false;}
				cell.seterr(1);
				cell.dn().seterr(1);
				result = false;
			}
		}
		return result;
	},

	checkFutonAisle : function(){
		var result = true;
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
				if(this.inAutoCheck){ return false;}
				cell.seterr(1);
				adj.seterr(1);
				result = false;
			}
		}
		return result;
	}
}
};
