//
// パズル固有スクリプト部 ろーま版 roma.js v3.4.0
//
pzprv3.custom.roma = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputedit : function(){
		if(this.mousestart || this.mousemove){
			if(this.mousestart){ this.checkBorderMode();}

			if(this.bordermode){ this.inputborder();}
			else               { this.inputarrow_cell();}
		}
		else if(this.mouseend && this.notInputted()){
			this.inputqnum();
		}
	},
	inputplay : function(){
		if(this.mousestart || this.mousemove){
			this.inputarrow_cell();
		}
		else if(this.mouseend && this.notInputted()){
			this.inputqnum();
		}
	},
	inputRed : function(){ this.dispRoad();},

	dispRoad : function(){
		var cell = this.getcell();
		if(cell.isnull){ return;}

		var ldata = [];
		for(var c=0;c<bd.cellmax;c++){ ldata[c]=-1;}
		bd.trackBall1(cell.id,ldata);
		for(var c=0;c<bd.cellmax;c++){
			if     (ldata[c]===1){ bd.cell[c].seterr(2);}
			else if(ldata[c]===2){ bd.cell[c].seterr(3);}
		}
		bd.haserror = true;
		this.owner.painter.paintAll();
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,
	moveTarget : function(ca){
		if(this.isSHIFT){ return false;}
		return this.moveTCell(ca);
	},

	keyinput : function(ca){
		this.key_roma(ca);
	},
	key_roma : function(ca){
		if     (ca==='1'||(this.isSHIFT && ca===this.KEYUP)){ ca='1';}
		else if(ca==='2'||(this.isSHIFT && ca===this.KEYRT)){ ca='4';}
		else if(ca==='3'||(this.isSHIFT && ca===this.KEYDN)){ ca='2';}
		else if(ca==='4'||(this.isSHIFT && ca===this.KEYLT)){ ca='3';}
		else if(ca==='q')                                   { ca='5';}
		else if(this.owner.editmode && (ca==='5'||ca==='-')){ ca='s1';}
		else if(ca==='6'||ca===' ')                         { ca=' ';}
		this.key_inputqnum(ca);
	}
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	numberAsObject : true,

	nummaxfunc : function(){
		return (this.owner.editmode?5:4);
	}
},
Board:{
	qcols : 8,
	qrows : 8,

	isborder : 1,

	trackBall1 : function(startcc, ldata){
		var startcell = this.cell[startcc], pos = startcell.getaddr();
		var dir=startcell.getNum(), result=(dir===5);
		ldata[startcell.id]=0;

		while(dir>=1 && dir<=4){
			pos.movedir(dir,2);

			var cell = pos.getc();
			if(cell.isnull){ break;}
			if(ldata[cell.id]!==-1){ result=(ldata[cell.id]===2); break;}

			ldata[cell.id]=0;

			dir=cell.getNum();
			if(dir===5){ result=true;}
		}

		var stack=[startcell];
		while(stack.length>0){
			var cell2=stack.pop();
			if(cell2!==startcell && ldata[cell2.id]!==-1){ continue;}
			ldata[cell2.id]=0;
			var tcell, dir=cell2.getNum();
			tcell=cell2.up(); if( dir!==1 && !tcell.isnull && ldata[tcell.id]===-1 && tcell.getNum()===2 ){ stack.push(tcell);}
			tcell=cell2.dn(); if( dir!==2 && !tcell.isnull && ldata[tcell.id]===-1 && tcell.getNum()===1 ){ stack.push(tcell);}
			tcell=cell2.lt(); if( dir!==3 && !tcell.isnull && ldata[tcell.id]===-1 && tcell.getNum()===4 ){ stack.push(tcell);}
			tcell=cell2.rt(); if( dir!==4 && !tcell.isnull && ldata[tcell.id]===-1 && tcell.getNum()===3 ){ stack.push(tcell);}
		}

		for(var c=0;c<this.cellmax;c++){
			if(ldata[c]===0){ ldata[c] = (result?2:1)}
		}
		return result;
	},

	adjustBoardData : function(key,d){
		this.adjustCellArrow(key,d);
	}
},

AreaManager:{
	hasroom : true
},

Menu:{
	menufix : function(pp){
		pp.addCheck('dispred','setting', false, '通り道のチェック', 'Check Road');
		pp.setLabel('dispred', 'クリックした矢印が通る道をチェックする', 'Check the road that passes clicked arrow.');
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	setColors : function(){
		this.gridcolor = this.gridcolor_LIGHT;
		this.dotcolor = this.dotcolor_PINK;
		this.errbcolor2 = "rgb(255, 224, 192)";
		this.errbcolor3 = "rgb(192, 192, 255)";
	},
	paint : function(){
		this.drawBGCells();
		this.drawGrid();
		this.drawBorders();

		this.drawCellArrows();
		this.drawGoals();
		this.drawHatenas();

		this.drawChassis();

		this.drawCursor();
	},

	getBGCellColor : function(cell){
		if     (cell.error===1){ return this.errbcolor1;}
		else if(cell.error===2){ return this.errbcolor2;}
		else if(cell.error===3){ return this.errbcolor3;}
		return null;
	},

	drawGoals : function(){
		var g = this.vinc('cell_circle', 'auto');

		var rsize = this.cw*this.circleratio[0];
		var header = "c_cir_";
		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i];
			if(cell.qnum===5){
				g.fillStyle = (cell.error===1 ? this.errcolor1 : this.cellcolor);
				if(this.vnop(header+cell.id,this.FILL)){
					g.fillCircle((cell.bx*this.bw), (cell.by*this.bh), rsize);
				}
			}
			else{ this.vhide(header+cell.id);}
		}
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		this.decodeBorder();
		this.decodeNumber10();
	},
	pzlexport : function(type){
		this.encodeBorder();
		this.encodeNumber10();
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeAreaRoom();
		this.decodeCellQnum();
		this.decodeCellAnumsub();
	},
	encodeData : function(){
		this.encodeAreaRoom();
		this.encodeCellQnum();
		this.encodeCellAnumsub();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.checkDifferentNumberInRoom(bd.areas.getRoomInfo(), function(cell){ var num=cell.getNum(); return ((num>=1&&num<=4)?num:-1);}) ){
			this.setAlert('1つの領域に2つ以上の同じ矢印が入っています。','An area has plural same arrows.'); return false;
		}

		if( !this.checkBalls() ){
			this.setAlert('ゴールにたどり着かないセルがあります。','A cell cannot reach a goal.'); return false;
		}

		return true;
	},

	checkBalls : function(){
		var ldata = [];
		for(var c=0;c<bd.cellmax;c++){ ldata[c]=(bd.cell[c].getNum()===5?2:-1);}
		for(var c=0;c<bd.cellmax;c++){
			if(ldata[c]!==-1){ continue;}
			if(!bd.trackBall1(c,ldata) && this.inAutoCheck){ return false;}
		}

		var result = true;
		for(var c=0;c<bd.cellmax;c++){
			if(ldata[c]===1){ bd.cell[c].seterr(1); result=false;}
		}
		return result;
	}
}
};
