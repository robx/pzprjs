//
// パズル固有スクリプト部 ろーま版 roma.js v3.4.0
//
pzprv3.custom.roma = {
//---------------------------------------------------------
// フラグ
Flags:{
	setting : function(pid){
		this.qcols = 8;
		this.qrows = 8;

		this.isborder = 1;

		this.hasroom         = true;
		this.isDispHatena    = true;
		this.isInputHatena   = true;
		this.isAnsNumber     = true;
		this.numberAsObject  = true;

		this.floatbgcolor = "rgb(127, 160, 96)";
	}
},

//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mousedown : function(){
		if(kc.isZ ^ pp.getVal('disproad')){ this.dispRoad();}
		else if(k.editmode){
			this.checkBorderMode();
			if(this.bordermode){ this.inputborder();}
			else               { this.inputarrow_cell();}
		}
		else if(k.playmode){ this.inputarrow_cell();}
	},
	mouseup : function(){
		if(this.notInputted()){
			if(!(kc.isZ ^ pp.getVal('disproad'))){ this.inputqnum();}
		}
	},
	mousemove : function(){
		if(k.editmode){
			if(this.bordermode){ this.inputborder();}
			else               { this.inputarrow_cell();}
		}
		else if(k.playmode){ this.inputarrow_cell();}
	},

	dispRoad : function(){
		var cc = this.cellid();
		if(cc===null){ return;}

		var ldata = [];
		for(var c=0;c<bd.cellmax;c++){ ldata[c]=-1;}
		ans.checkBall1(cc,ldata);
		for(var c=0;c<bd.cellmax;c++){
			if     (ldata[c]===1){ bd.sErC([c],2);}
			else if(ldata[c]===2){ bd.sErC([c],3);}
		}
		ans.errDisp = true;
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
		if     (ca==='1'||(this.isSHIFT && ca===k.KEYUP)){ ca='1';}
		else if(ca==='2'||(this.isSHIFT && ca===k.KEYRT)){ ca='4';}
		else if(ca==='3'||(this.isSHIFT && ca===k.KEYDN)){ ca='2';}
		else if(ca==='4'||(this.isSHIFT && ca===k.KEYLT)){ ca='3';}
		else if(ca==='q')                                { ca='5';}
		else if(k.editmode && (ca==='5'||ca==='-'))      { ca='s1';}
		else if(ca==='6'||ca===' ')                      { ca=' ';}
	}
},

//---------------------------------------------------------
// 盤面管理系
Board:{
	nummaxfunc : function(){
		return (k.editmode?5:4);
	}
},

MenuExec:{
	adjustBoardData : function(key,d){
		this.adjustCellArrow(key,d);
	}
},

Menu:{
	menufix : function(){
		pp.addCheck('disproad','setting', false, '通り道のチェック', 'Check Road');
		pp.setLabel('disproad', 'クリックした矢印が通る道をチェックする', 'Check the road that passes clicked arrow.');
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

	setBGCellColor : function(c){
		var cell = bd.cell[c];
		if     (cell.error===1){ g.fillStyle = this.errbcolor1; return true;}
		else if(cell.error===2){ g.fillStyle = this.errbcolor2; return true;}
		else if(cell.error===3){ g.fillStyle = this.errbcolor3; return true;}
		return false;
	},

	drawGoals : function(){
		this.vinc('cell_circle', 'auto');

		var rsize = this.cw*this.circleratio[0];
		var header = "c_cir_";
		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var c = clist[i];
			if(bd.cell[c].qnum===5){
				g.fillStyle = (bd.cell[c].error===1 ? this.errcolor1 : this.cellcolor);
				if(this.vnop(header+c,this.FILL)){
					g.fillCircle(bd.cell[c].cpx, bd.cell[c].cpy, rsize);
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
			if(!this.checkBall1(c,ldata) && this.inAutoCheck){ return false;}
		}

		var result = true;
		for(var c=0;c<bd.cellmax;c++){
			if(ldata[c]===1){ bd.sErC([c],1); result=false;}
		}
		return result;
	},
	checkBall1 : function(startcc, ldata){
		var bx=bd.cell[startcc].bx, by=bd.cell[startcc].by;
		var dir=bd.getNum(startcc), cc=startcc, result=(dir===5);
		ldata[cc]=0;

		while(dir>=1 && dir<=4){
			switch(dir){ case 1: by-=2; break; case 2: by+=2; break; case 3: bx-=2; break; case 4: bx+=2; break;}
			cc = bd.cnum(bx,by);
			if(cc===null){ break;}
			if(ldata[cc]!==-1){ result=(ldata[cc]===2); break;}

			ldata[cc]=0;

			dir=bd.getNum(cc);
			if(dir===5){ result=true;}
		}
		ans.cb0(startcc, ldata);

		for(var c=0;c<bd.cellmax;c++){
			if(ldata[c]===0){ ldata[c] = (result?2:1)}
		}
		return result;
	},
	cb0 : function(c, ldata){
		ldata[c]=0;
		var tc, dir=bd.getNum(c);
		tc=bd.up(c); if( dir!==1 && tc!==null && ldata[tc]===-1 && bd.getNum(tc)===2 ){ this.cb0(tc,ldata);}
		tc=bd.dn(c); if( dir!==2 && tc!==null && ldata[tc]===-1 && bd.getNum(tc)===1 ){ this.cb0(tc,ldata);}
		tc=bd.lt(c); if( dir!==3 && tc!==null && ldata[tc]===-1 && bd.getNum(tc)===4 ){ this.cb0(tc,ldata);}
		tc=bd.rt(c); if( dir!==4 && tc!==null && ldata[tc]===-1 && bd.getNum(tc)===3 ){ this.cb0(tc,ldata);}
	}
}
};
