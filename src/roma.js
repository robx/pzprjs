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
		var cc = this.cellid();
		if(cc===null){ return;}

		var ldata = [];
		for(var c=0;c<bd.cellmax;c++){ ldata[c]=-1;}
		bd.trackBall1(cc,ldata);
		for(var c=0;c<bd.cellmax;c++){
			if     (ldata[c]===1){ bd.sErC([c],2);}
			else if(ldata[c]===2){ bd.sErC([c],3);}
		}
		bd.haserror = true;
		pc.paintAll();
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
Board:{
	qcols : 8,
	qrows : 8,

	isborder : 1,

	numberAsObject : true,

	nummaxfunc : function(){
		return (this.owner.editmode?5:4);
	},

	trackBall1 : function(startcc, ldata){
		var bx=this.cell[startcc].bx, by=this.cell[startcc].by;
		var dir=this.getNum(startcc), result=(dir===5);
		ldata[startcc]=0;

		while(dir>=1 && dir<=4){
			switch(dir){ case 1: by-=2; break; case 2: by+=2; break; case 3: bx-=2; break; case 4: bx+=2; break;}
			var c=this.cnum(bx,by);
			if(c===null){ break;}
			if(ldata[c]!==-1){ result=(ldata[c]===2); break;}

			ldata[c]=0;

			dir=this.getNum(c);
			if(dir===5){ result=true;}
		}

		var stack=[startcc];
		while(stack.length>0){
			var c=stack.pop();
			if(c!=startcc && ldata[c]!==-1){ continue;}
			ldata[c]=0;
			var tc, dir=this.getNum(c);
			tc=this.up(c); if( dir!==1 && tc!==null && ldata[tc]===-1 && this.getNum(tc)===2 ){ stack.push(tc);}
			tc=this.dn(c); if( dir!==2 && tc!==null && ldata[tc]===-1 && this.getNum(tc)===1 ){ stack.push(tc);}
			tc=this.lt(c); if( dir!==3 && tc!==null && ldata[tc]===-1 && this.getNum(tc)===4 ){ stack.push(tc);}
			tc=this.rt(c); if( dir!==4 && tc!==null && ldata[tc]===-1 && this.getNum(tc)===3 ){ stack.push(tc);}
		}

		for(var c=0;c<this.cellmax;c++){
			if(ldata[c]===0){ ldata[c] = (result?2:1)}
		}
		return result;
	}
},

AreaManager:{
	hasroom : true
},

MenuExec:{
	adjustBoardData : function(key,d){
		this.adjustCellArrow(key,d);
	}
},

Menu:{
	menufix : function(){
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
			var c = clist[i];
			if(bd.cell[c].qnum===5){
				g.fillStyle = (bd.cell[c].error===1 ? this.errcolor1 : this.cellcolor);
				if(this.vnop(header+c,this.FILL)){
					g.fillCircle(this.cell[c].px, this.cell[c].py, rsize);
				}
			}
			else{ this.vhide(header+c);}
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

		if( !this.checkDifferentNumberInRoom(bd.areas.getRoomInfo(), function(c){ var num=bd.getNum(c); return ((num>=1&&num<=4)?num:-1);}) ){
			this.setAlert('1つの領域に2つ以上の同じ矢印が入っています。','An area has plural same arrows.'); return false;
		}

		if( !this.checkBalls() ){
			this.setAlert('ゴールにたどり着かないセルがあります。','A cell cannot reach a goal.'); return false;
		}

		return true;
	},

	checkBalls : function(){
		var ldata = [];
		for(var c=0;c<bd.cellmax;c++){ ldata[c]=(bd.getNum(c)===5?2:-1);}
		for(var c=0;c<bd.cellmax;c++){
			if(ldata[c]!==-1){ continue;}
			if(!bd.trackBall1(c,ldata) && this.inAutoCheck){ return false;}
		}

		var result = true;
		for(var c=0;c<bd.cellmax;c++){
			if(ldata[c]===1){ bd.sErC([c],1); result=false;}
		}
		return result;
	}
}
};
