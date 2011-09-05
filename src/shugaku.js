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
		var cc = this.cellid();

		if(!this.firstPoint.valid()){
			if(cc===null || bd.isNum(cc)){ return;}
			this.mouseCell = cc;
			this.inputData = 1;
			this.firstPoint.set(this.inputPoint);
			pc.paintCell(cc);
		}
		else{
			var old = this.inputData, adj;
			if(cc===null){ /* nop */} // 何もしない
			else if(this.mouseCell===cc){ this.inputData = 1;} // 入力開始時と同じセルの場合
			else{
				var dx=(this.inputPoint.x-this.firstPoint.x), dy=(this.inputPoint.y-this.firstPoint.y);
				if     (dx-dy>0 && dx+dy>0){ adj=bd.rt(this.mouseCell); this.inputData=5;}
				else if(dx-dy>0 && dx+dy<0){ adj=bd.up(this.mouseCell); this.inputData=2;}
				else if(dx-dy<0 && dx+dy>0){ adj=bd.dn(this.mouseCell); this.inputData=3;}
				else if(dx-dy<0 && dx+dy<0){ adj=bd.lt(this.mouseCell); this.inputData=4;}
				if(adj==null || bd.isNum(adj)){ this.inputData=6;}
			}
			if(old!=this.inputData){ pc.paintCellAround(this.mouseCell);}
		}
	},
	inputFuton2 : function(){
		if(this.mouseCell===null){ return;}
		var cc = this.mouseCell

		this.changeHalf(cc);
		if(this.inputData!==1 && this.inputData!==6){ bd.sQaC(cc, 40+this.inputData); bd.sQsC(cc, 0);}
		else if(this.inputData===6){ bd.sQaC(cc,41); bd.sQsC(cc, 0);}
		else{
			if     (bd.QaC(cc)===41){ bd.sQaC(cc,46); bd.sQsC(cc, 0);}
			else if(bd.QaC(cc)===46){ bd.sQaC(cc, 0); bd.sQsC(cc, 1);}
//			else if(bd.QsC(cc)=== 1){ bd.sQaC(cc, 0); bd.sQsC(cc, 0);}
			else                    { bd.sQaC(cc,41); bd.sQsC(cc, 0);}
		}

		cc = this.currentTargetADJ();
		if(cc!==null){
			this.changeHalf(cc);
			bd.sQaC(cc, {2:48,3:47,4:50,5:49}[this.inputData]); bd.sQsC(cc, 0);
		}

		cc = this.mouseCell;
		this.mouseCell = null;
		pc.paintCellAround(cc);
	},

	inputcell_shugaku : function(){
		var cc = this.cellid();
		if(cc===null || cc===this.mouseCell || bd.isNum(cc)){ return;}
		if(this.inputData===null){
			if     (bd.QaC(cc)===1){ this.inputData = 2;}
			else if(bd.QsC(cc)===1){ this.inputData = 3;}
			else{ this.inputData = 1;}
		}
		this.changeHalf(cc);
		this.mouseCell = cc; 

		bd.sQaC(cc, (this.inputData==1?1:0));
		bd.sQsC(cc, (this.inputData==2?1:0));

		pc.paintCellAround(cc);
	},

	changeHalf : function(cc){
		var adj=null;
		if     (bd.QaC(cc)===42 || bd.QaC(cc)===47){ adj=bd.up(cc);}
		else if(bd.QaC(cc)===43 || bd.QaC(cc)===48){ adj=bd.dn(cc);}
		else if(bd.QaC(cc)===44 || bd.QaC(cc)===49){ adj=bd.lt(cc);}
		else if(bd.QaC(cc)===45 || bd.QaC(cc)===50){ adj=bd.rt(cc);}

		if     (adj===null){ /* nop */ }
		else if(bd.QaC(adj)>=42 && bd.QaC(adj)<=45){ bd.sQaC(adj,41);}
		else if(bd.QaC(adj)>=47 && bd.QaC(adj)<=50){ bd.sQaC(adj,46);}
	},
	currentTargetADJ : function(){
		if(this.mouseCell===null){ return null;}
		switch(this.inputData){
			case 2: return bd.up(this.mouseCell);
			case 3: return bd.dn(this.mouseCell);
			case 4: return bd.lt(this.mouseCell);
			case 5: return bd.rt(this.mouseCell);
		}
		return null;
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
Board:{
	isborder : 1,

	numberIsWhite : true,

	maxnum : 4,
	minnum : 0,

	isPillow : function(c){
		return (!!this.cell[c] && (this.cell[c].qans>=41 && this.cell[c].qans<=45));
	},

	// 41～45:まくらありふとんマス 46～50:まくらなしふとんマス
	// 42/47,43/48,44/49,45/50:それぞれ上・下・左・右だけ境界線がない
	isbdh_cc1 : {41:1,42:1,44:1,45:1,46:1,47:1,49:1,50:1},
	isbdh_cc2 : {41:1,43:1,44:1,45:1,46:1,48:1,49:1,50:1},
	isbdv_cc1 : {41:1,42:1,43:1,44:1,46:1,47:1,48:1,49:1},
	isbdv_cc2 : {41:1,42:1,43:1,45:1,46:1,47:1,48:1,50:1},
	isBorder : function(id){
		var qa1 = this.QaC(this.border[id].cellcc[0]);
		var qa2 = this.QaC(this.border[id].cellcc[1]);
		if(this.border[id].bx&1){ return (!!this.isbdh_cc1[qa1] || !!this.isbdh_cc2[qa2]);}
		else                    { return (!!this.isbdv_cc1[qa1] || !!this.isbdv_cc2[qa2]);}
	}
},

AreaManager:{
	checkBlackCell : true
},

MenuExec:{
	adjustBoardData : function(key,d){
		var trans = {};
		switch(key){
			case this.FLIPY: trans={42:43,43:42,47:48,48:47}; break;	// 上下反転
			case this.FLIPX: trans={44:45,45:44,49:50,50:49}; break;	// 左右反転
			case this.TURNR: trans={42:45,45:43,43:44,44:42,47:50,50:48,48:49,49:47}; break;	// 右90°回転
			case this.TURNL: trans={42:44,44:43,43:45,45:42,47:49,49:48,48:50,50:47}; break;	// 左90°回転
			default: return;
		}
		for(var c=0;c<bd.cellmax;c++){
			var val=trans[bd.QaC(c)]; if(!!val){ bd.cell[c].qans=val;}
		}
	}
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
		var g = this.vinc('cell_back', 'crispEdges');

		var inputting=(mv.mouseCell!==null && mv.firstPoint.valid()), tc=null, adj=null;
		if(inputting){ // ふとん入力中
			tc  = mv.mouseCell;
			adj = mv.currentTargetADJ();
		}

		var header = "c_full_";
		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var c = clist[i], isdraw = (bd.cell[c].qans>=41);
			var color = (bd.cell[c].error===1 ? this.errbcolor1 : "white");
			if(inputting){
				if(c===tc || c===adj){ isdraw=true; color=this.targetbgcolor;}
			}

			if(isdraw){
				g.fillStyle = color;
				if(this.vnop(header+c,this.FILL)){
					g.fillRect(bd.cell[c].px+1, bd.cell[c].py+1, this.cw-1, this.ch-1);
				}
			}
			else{ this.vhide(header+c);}
		}
	},
	drawPillows : function(){
		var g = this.vinc('cell_pillow', 'crispEdges');

		var inputting=(mv.mouseCell!==null && mv.firstPoint.valid()), tc=null, adj=null;
		if(inputting){ // ふとん入力中
			tc  = mv.mouseCell;
			adj = mv.currentTargetADJ();
		}

		var header = "c_pillow_";
		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var c = clist[i], isdraw = (bd.cell[c].qans>=41 && bd.cell[c].qans<=45);
			if(inputting){
				if     (!isdraw && tc ===c){ isdraw = true;}
				else if( isdraw && adj===c){ isdraw = false;}
			}

			if(isdraw){
				g.lineWidth = 1;
				g.strokeStyle = "black";
				if     (inputting && tc===c) { g.fillStyle = this.targetbgcolor;}
				else if(bd.cell[c].error===1){ g.fillStyle = this.errbcolor1;   }
				else                         { g.fillStyle = "white";}

				if(this.vnop(header+c,this.FILL)){
					var mgnw = this.cw*0.15, mgnh = this.ch*0.15;
					g.shapeRect(bd.cell[c].px+mgnw+1, bd.cell[c].py+mgnh+1, this.cw-mgnw*2-1, this.ch-mgnh*2-1);
				}
			}
			else{ this.vhide([header+c]);}
		}
	},

	getBorderColor : function(border){
		var isdraw = bd.isBorder(border.id);

		if(mv.mouseCell!==null && mv.firstPoint.valid()){ // ふとん入力中
			var cc1 = border.cellcc[0], cc2 = border.cellcc[1];
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

		if( !this.check2x2Block( function(c){ return bd.isBlack(c);} ) ){
			this.setAlert('2x2の黒マスのかたまりがあります。', 'There is a 2x2 block of black cells.'); return false;
		}

		if( !this.checkDir4Cell(function(c){ return bd.isPillow(c);},2) ){
			this.setAlert('柱のまわりにある枕の数が間違っています。', 'The number of pillows around the number is wrong.'); return false;
		}

		if( !this.checkAllCell(function(c){ return (bd.QaC(c)===41||bd.QaC(c)===46);}) ){
			this.setAlert('布団が2マスになっていません。', 'There is a half-size futon.'); return false;
		}

		if( !this.checkFutonAisle() ){
			this.setAlert('通路に接していない布団があります。', 'There is a futon separated to aisle.'); return false;
		}

		if( !this.checkOneArea( bd.areas.getBCellInfo() ) ){
			this.setAlert('黒マスが分断されています。', 'Aisle is divided.'); return false;
		}

		if( !this.checkDir4Cell(function(c){ return bd.isPillow(c);},1) ){
			this.setAlert('柱のまわりにある枕の数が間違っています。', 'The number of pillows around the number is wrong.'); return false;
		}

		if( !this.checkAllCell(function(c){ return (bd.noNum(c) && bd.QaC(c)===0);}) ){
			this.setAlert('布団でも黒マスでもないマスがあります。', 'There is an empty cell.'); return false;
		}

		return true;
	},

	checkKitamakura : function(){
		var result = true;
		for(var c=0;c<bd.cellmax;c++){
			if(bd.QaC(c)===43){
				if(this.inAutoCheck){ return false;}
				bd.sErC([c,bd.dn(c)],1);
				result = false;
			}
		}
		return result;
	},

	checkFutonAisle : function(){
		var result = true;
		for(var c=0;c<bd.cellmax;c++){
			if(bd.isNum(c)){ continue;}

			var adj=null;
			switch(bd.QaC(c)){
				case 42: adj = bd.up(c); break;
				case 43: adj = bd.dn(c); break;
				case 44: adj = bd.lt(c); break;
				case 45: adj = bd.rt(c); break;
				default: continue;
			}
			if( bd.countDir4Cell(c  ,function(c){ return bd.isBlack(c);})===0 &&
				bd.countDir4Cell(adj,function(c){ return bd.isBlack(c);})===0 )
			{
				if(this.inAutoCheck){ return false;}
				bd.sErC([c,adj],1);
				result = false;
			}
		}
		return result;
	}
}
};
