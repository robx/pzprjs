//
// パズル固有スクリプト部 エルート版 loute.js v3.4.0
//
pzprv3.custom.loute = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mousedown : function(){
		if(k.editmode){
			this.inputarrow_cell();
		}
		else if(k.playmode){
			if     (this.btn.Left) { this.inputborderans();}
			else if(this.btn.Right){ this.inputQsubLine();}
		}
	},
	mouseup : function(){
		if(k.editmode && this.notInputted()){ this.inputqnum_loute();}
	},
	mousemove : function(){
		if(k.editmode){
			this.inputarrow_cell();
		}
		else if(k.playmode){
			if     (this.btn.Left) { this.inputborderans();}
			else if(this.btn.Right){ this.inputQsubLine();}
		}
	},

	inputqnum_loute : function(){
		var cc = this.cellid();
		if(cc===null || cc===this.mouseCell){ return;}

		if(cc===tc.getTCC()){
			var qn = bd.QnC(cc), array = [-1,5,1,2,3,4,-2], flag = false;
			if(this.btn.Left){
				for(var i=0;i<array.length-1;i++){
					if(!flag && qn===array[i]){ bd.sQnC(cc,array[i+1]); flag=true;}
				}
				if(!flag && qn===array[array.length-1]){ bd.sQnC(cc,array[0]); flag=true;}
			}
			else if(this.btn.Right){
				for(var i=array.length;i>0;i--){
					if(!flag && qn===array[i]){ bd.sQnC(cc,array[i-1]); flag=true;}
				}
				if(!flag && qn===array[0]){ bd.sQnC(cc,array[array.length-1]); flag=true;}
			}
		}
		else{
			var cc0 = tc.getTCC();
			tc.setTCC(cc);
			pc.paintCell(cc0);
		}

		pc.paintCell(cc);
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
		this.key_loute(ca);
	},
	key_loute : function(ca){
		if     (ca==='1'||(this.isSHIFT && ca===this.KEYUP)){ ca='1';}
		else if(ca==='2'||(this.isSHIFT && ca===this.KEYRT)){ ca='4';}
		else if(ca==='3'||(this.isSHIFT && ca===this.KEYDN)){ ca='2';}
		else if(ca==='4'||(this.isSHIFT && ca===this.KEYLT)){ ca='3';}
		else if(ca==='5'||ca==='q')                         { ca='5';}
		else if(ca==='-')                                   { ca='s1';}
		else if(ca==='6'||ca===' ')                         { ca=' ';}
	}
},

//---------------------------------------------------------
// 盤面管理系
Board:{
	qcols : 8,
	qrows : 8,

	isborder : 1,

	numberAsObject : true,

	maxnum : 5,

	getLblockInfo : function(){
		var rinfo = bd.areas.getRoomInfo();
		rinfo.place = [];

		for(var id=1;id<=rinfo.max;id++){
			var clist = rinfo.room[id].idlist;
			var d = bd.getSizeOfClist(clist);
			var subclist = [];
			for(var bx=d.x1;bx<=d.x2;bx+=2){
				for(var by=d.y1;by<=d.y2;by+=2){
					var cc = bd.cnum(bx,by);
					if(rinfo.id[cc]!=id){ subclist.push(cc);}
				}
			}
			/* 四角形のうち別エリアとなっている部分を調べる */
			/* 幅が1なので座標自体は調べなくてよいはず      */
			var dl = bd.getSizeOfClist(subclist);
			if( subclist.length==0 || (dl.cols*dl.rows!=dl.cnt) || ((d.cols-1)!==dl.cols) || ((d.rows-1)!==dl.rows) ){
				rinfo.room[id].shape = 0;
				for(var i=0;i<clist.length;i++){ rinfo.place[clist[i]] = 0;}
			}
			else{
				rinfo.room[id].shape = 1; /* 幅が1のL字型 */
				for(var i=0;i<clist.length;i++){ rinfo.place[clist[i]] = 1;} /* L字型ブロックのセル */

				/* 端のセル */
				var edge1=null, edge2=null;
				if     ((d.x1===dl.x1&&d.y1===dl.y1)||(d.x2===dl.x2&&d.y2===dl.y2))
							{ edge1 = bd.cnum(d.x1,d.y2); edge2 = bd.cnum(d.x2,d.y1);}
				else if((d.x1===dl.x1&&d.y2===dl.y2)||(d.x2===dl.x2&&d.y1===dl.y1))
							{ edge1 = bd.cnum(d.x1,d.y1); edge2 = bd.cnum(d.x2,d.y2);}
				rinfo.place[edge1] = 2;
				rinfo.place[edge2] = 2;

				/* 角のセル */
				var corner=null;
				if     (d.x1===dl.x1 && d.y1===dl.y1){ corner = bd.cnum(d.x2,d.y2);}
				else if(d.x1===dl.x1 && d.y2===dl.y2){ corner = bd.cnum(d.x2,d.y1);}
				else if(d.x2===dl.x2 && d.y1===dl.y1){ corner = bd.cnum(d.x1,d.y2);}
				else if(d.x2===dl.x2 && d.y2===dl.y2){ corner = bd.cnum(d.x1,d.y1);}
				rinfo.place[corner] = 3;
			}
		}
		
		return rinfo;
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

//---------------------------------------------------------
// 画像表示系
Graphic:{
	setColors : function(){
		this.gridcolor = this.gridcolor_DLIGHT;
		this.setBorderColorFunc('qans');

		this.circledcolor = "black";
		this.circleratio = [0.35, 0.40];
	},
	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();
		this.drawBorders();

		this.drawCellArrows();
		this.drawCircles();
		this.drawHatenas();

		this.drawBorderQsubs();

		this.drawChassis();

		this.drawTarget();
	},

	drawCircles : function(){
		this.vinc('cell_circle', 'auto');

		var rsize2 = this.cw*this.circleratio[1];
		var header = "c_cir_";
		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var c = clist[i];
			if(bd.cell[c].qnum===5){
				g.strokeStyle = this.cellcolor;
				if(this.vnop(header+c,this.STROKE)){
					g.strokeCircle(bd.cell[c].cpx, bd.cell[c].cpy, rsize2);
				}
			}
			else{ this.vhide([header+c]);}
		}
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		this.decodeNumber16();
	},
	pzlexport : function(type){
		this.encodeNumber16();
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCellQnum();
		this.decodeBorderAns();
	},
	encodeData : function(){
		this.encodeCellQnum();
		this.encodeBorderAns();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		var rinfo = bd.getLblockInfo();
		if( !this.checkArrowCorner1(rinfo) ){
			this.setAlert('矢印がブロックの端にありません。','An arrow is not at the edge of the block.'); return false;
		}

		if( !this.checkArrowCorner2(rinfo) ){
			this.setAlert('矢印の先にブロックの角がありません。','An arrow doesn\'t indicate the corner of a block.'); return false;
		}

		if( !this.checkCircleCorner(rinfo) ){
			this.setAlert('白丸がブロックの角にありません。','A circle is out of the corner.'); return false;
		}

		if( !this.checkLcntCross(1,0) ){
			this.setAlert('途切れている線があります。','There is a dead-end line.'); return false;
		}

		if( !this.checkLblock(rinfo) ){
			this.setAlert('ブロックが幅1のL字型になっていません。','A block is not L-shape or whose width is not one.'); return false;
		}

		return true;
	},

	checkArrowCorner1 : function(rinfo){
		var result = true;
		for(var id=1;id<=rinfo.max;id++){
			if(rinfo.room[id].shape===0){ continue;}

			var error = false, clist = rinfo.room[id].idlist;
			for(var i=0;i<clist.length;i++){
				var cc = clist[i], num = bd.getNum(cc);
				if(num>=1 && num<=4 && rinfo.place[cc]!==2){
					if(this.inAutoCheck){ return false;}
					bd.sErC(rinfo.room[id].idlist,1);
					result = false;
					break;
				}
			}
		}
		return result;
	},

	checkArrowCorner2 : function(rinfo){
		var result = true;
		for(var id=1;id<=rinfo.max;id++){
			if(rinfo.room[id].shape===0){ continue;}

			var error = false, clist = rinfo.room[id].idlist;
			for(var i=0;i<clist.length;i++){
				var cc = clist[i], num = bd.getNum(cc);
				if(num>=1 && num<=4 &&
				   ((num===bd.UP && bd.isBorder(bd.ub(cc))) ||
					(num===bd.DN && bd.isBorder(bd.db(cc))) ||
					(num===bd.LT && bd.isBorder(bd.lb(cc))) ||
					(num===bd.RT && bd.isBorder(bd.rb(cc)))) )
				{
					if(this.inAutoCheck){ return false;}
					bd.sErC(rinfo.room[id].idlist,1);
					result = false;
					break;
				}
			}
		}
		return result;
	},

	checkCircleCorner : function(rinfo){
		var result = true;
		for(var id=1;id<=rinfo.max;id++){
			if(rinfo.room[id].shape===0){ continue;}

			var clist = rinfo.room[id].idlist;
			for(var i=0;i<clist.length;i++){
				var cc = clist[i];
				if(bd.getNum(cc)===5 && rinfo.place[cc]!==3){
					if(this.inAutoCheck){ return false;}
					bd.sErC(rinfo.room[id].idlist,1);
					result = false;
					break;
				}
			}
		}
		return result;
	},

	checkLblock : function(rinfo){
		var result = true;
		for(var id=1;id<=rinfo.max;id++){
			if(rinfo.room[id].shape===0){
				if(this.inAutoCheck){ return false;}
				bd.sErC(rinfo.room[id].idlist,1);
				result = false;
			}
		}
		return result;
	}
}
};
