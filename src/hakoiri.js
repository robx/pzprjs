//
// パズル固有スクリプト部 はこいり○△□版 hakoiri.js v3.4.0
//
pzprv3.custom.hakoiri = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputedit : function(){
		if(this.mousestart || this.mousemove){
			this.inputborder();
		}
		else if(this.mouseend && this.notInputted()){
			this.mouseCell=null;
			this.inputqnum();
		}
	},
	inputplay : function(){
		if(this.mousestart){
			if(this.btn.Left){ this.inputqnum();}
		}
		else if(this.mousemove){
			if(this.btn.Right){ this.inputDot();}
		}
		else if(this.mouseend && this.notInputted()){
			if(this.btn.Right){ this.inputqnum();}
		}
	},

	inputDot : function(){
		var cc = this.cellid();
		if(cc===null || cc===this.mouseCell || bd.QnC(cc)!==-1){ return;}

		if(this.inputData===null){ this.inputData=(bd.QsC(cc)===1?0:1);}

		bd.sAnC(cc,-1);
		bd.sQsC(cc,(this.inputData===1?1:0));
		this.mouseCell = cc;
		pc.paintCell(cc);
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,
	enableplay : true,

	keyinput : function(ca){
		this.key_hakoiri(ca);
	},
	key_hakoiri : function(ca){
		if     (ca==='1'||ca==='q'||ca==='a'||ca==='z'){ ca='1';}
		else if(ca==='2'||ca==='w'||ca==='s'||ca==='x'){ ca='2';}
		else if(ca==='3'||ca==='e'||ca==='d'||ca==='c'){ ca='3';}
		else if(ca==='4'||ca==='r'||ca==='f'||ca==='v'){ ca='s1';}
		else if(ca==='5'||ca==='t'||ca==='g'||ca==='b'){ ca=' ';}
		this.key_inputqnum(ca);
	},

	enablemake_p : true,
	enableplay_p : true,
	generate : function(mode,type){
		if(mode==3){ this.tdcolor = pc.fontAnscolor;}
		this.inputcol('num','knum1','1','○');
		this.inputcol('num','knum2','2','△');
		this.inputcol('num','knum3','3','□');
		this.insertrow();
		if(mode==3){ this.tdcolor = "rgb(255, 96, 191)";}
		this.inputcol('num','knum4','4',(mode===1 ? '?' : '・'));
		if(mode==3){ this.tdcolor = "black";}
		this.inputcol('num','knum_',' ',' ');
		this.inputcol('empty','','','');
		this.insertrow();
	}
},

//---------------------------------------------------------
// 盤面管理系
Board:{
	isborder : 1,

	numberAsObject : true,

	maxnum : 3
},

AreaManager:{
	hasroom    : true,
	linkNumber : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	setColors : function(){
		this.bcolor = this.bcolor_GREEN;
		this.bbcolor = "rgb(127, 127, 127)";
		this.dotcolor = this.dotcolor_PINK;
	},
	paint : function(){
		this.drawBGCells();
		this.drawGrid();
		this.drawBorders();

		this.drawDotCells(true);
		this.drawQnumMarks();
		this.drawHatenas();

		this.drawChassis();

		this.drawCursor();
	},

	drawQnumMarks : function(){
		var g = this.vinc('cell_mark', 'auto');

		var rsize = this.cw*0.30, tsize=this.cw*0.26;
		var lampcolor = "rgb(0, 127, 96)";
		var headers = ["c_mk1_", "c_mk2_", "c_mk3_"];
		g.lineWidth = 2;

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var c = clist[i], num=bd.getNum(c), px, py;
			this.vhide([headers[0]+c, headers[1]+c, headers[2]+c]);
			if(num<=0){ continue;}

			g.strokeStyle = this.getCellNumberColor(bd.cell[c]);
			var px=this.cell[c].px, py=this.cell[c].py;
			if(this.vnop(headers[(num-1)]+c,this.STROKE)){
				switch(num){
				case 1:
					g.strokeCircle(px, py, rsize);
					break;
				case 2:
					g.setOffsetLinePath(px, py, 0,-tsize, -rsize,tsize, rsize,tsize, true);
					g.stroke();
					break;
				case 3:
					g.strokeRect(px-rsize, py-rsize, 2*rsize, 2*rsize);
					break;
				}
			}
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

		if( !this.checkAroundMarks() ){
			this.setAlert('同じ記号がタテヨコナナメに隣接しています。','Same marks are adjacent.'); return false;
		}

		var rinfo = bd.areas.getRoomInfo();
		if( !this.checkAllBlock(rinfo, function(c){ return bd.isNum(c);}, function(w,h,a,n){ return (a<=3);}) ){
			this.setAlert('1つのハコに4つ以上の記号が入っています。','A box has four or more marks.'); return false;
		}

		if( !this.checkDifferentNumberInRoom(rinfo, function(c){ return bd.getNum(c);}) ){
			this.setAlert('1つのハコに同じ記号が複数入っています。','A box has same plural marks.'); return false;
		}

		if( !this.checkOneArea( bd.areas.getNumberInfo() ) ){
			this.setAlert('タテヨコにつながっていない記号があります。','Marks are devided.'); return false;
		}

		if( !this.checkAllBlock(rinfo, function(c){ return bd.isNum(c);}, function(w,h,a,n){ return (a>=3);}) ){
			this.setAlert('1つのハコに2つ以下の記号しか入っていません。','A box has tow or less marks.'); return false;
		}

		return true;
	},

	checkAroundMarks : function(){
		var result = true;
		for(var c=0;c<bd.cellmax;c++){
			var num = bd.getNum(c);
			if(num<0){ continue;}
			var bx = bd.cell[c].bx, by = bd.cell[c].by, target=0, clist=[c];
			var func = function(cc){ return (cc!==null && num==bd.getNum(cc));};
			// 右・左下・下・右下だけチェック
			target = bd.cnum(bx+2,by  ); if(func(target)){ clist.push(target);}
			target = bd.cnum(bx  ,by+2); if(func(target)){ clist.push(target);}
			target = bd.cnum(bx-2,by+2); if(func(target)){ clist.push(target);}
			target = bd.cnum(bx+2,by+2); if(func(target)){ clist.push(target);}

			if(clist.length>1){
				if(this.inAutoCheck){ return false;}
				bd.sErC(clist,1);
				result = false;
			}
		}
		return result;
	}
}
};
