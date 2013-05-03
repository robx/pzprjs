//
// パズル固有スクリプト部 へびいちご版 snakes.js v3.4.0
//
(function(){

var k = pzprv3.consts;

pzprv3.createCustoms('snakes', {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.owner.playmode){
			if(this.mousestart || this.mousemove){
				if(!this.inputDot_snakes()){
					this.dragnumber_snakes();
				}
			}
		}
		else if(this.owner.editmode){
			if(this.mousestart || (this.mousemove && this.notInputted())){
				this.inputdirec();
			}
		}
		
		if(this.mouseend && this.notInputted()){
			this.inputqnum_snakes();
		}
	},

	dragnumber_snakes : function(){
		var cell = this.getcell();
		if(cell.isnull||cell===this.mouseCell){ return;}
		if(this.mouseCell.isnull){
			this.inputData = cell.getAnum()!==-1?cell.getAnum():10;
			this.mouseCell = cell;
		}
		else if(cell.getQnum()==-1 && this.inputData>=1 && this.inputData<=5){
			if     (this.btn.Left ) this.inputData++;
			else if(this.btn.Right) this.inputData--;
			if(this.inputData>=1 && this.inputData<=5){
				cell.setQdir(0);
				cell.setAnum(this.inputData);
				cell.setQsub(0);
				this.mouseCell = cell;
				cell.draw();
			}
		}
		else if(cell.getQnum()===-1 && this.inputData==10){
			cell.setAnum(-1);
			cell.setQsub(0);
			cell.draw();
		}
	},
	inputDot_snakes : function(){
		if(!this.btn.Right || (this.inputData!==null && this.inputData>=0)){ return false;}

		var cell = this.getcell();
		if(cell.isnull||cell===this.mouseCell){ return (this.inputData<0);}

		if(this.inputData===null){
			if(cell.getAnum()===-1){
				this.inputData = (cell.getQsub()!==1?-2:-3);
				return true;
			}
			return false;
		}

		cell.setAnum(-1);
		cell.setQsub(this.inputData===-2?1:0);
		cell.draw();
		this.mouseCell = cell;
		return true;
	},
	inputqnum_snakes : function(){
		var cell = this.getcell();
		if(!cell.isnull){
			if(this.owner.playmode){ cell.minnum = 1;}
			this.mouseCell = this.owner.board.emptycell;
			this.inputqnum();
			cell.minnum = 0;
		}
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,
	enableplay : true,
	moveTarget : function(ca){
		if(this.isSHIFT){ return false;}
		return this.moveTCell(ca);
	},

	keyinput : function(ca){
		if(this.owner.editmode && this.key_inputdirec(ca)){ return;}

		if(this.owner.playmode && (ca==='q'||ca==='-')){ ca='s1';}
		this.key_inputqnum(ca);
	}
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	maxnum : 5,
	minnum : 0
},
Board:{
	isborder : 1,

	getSnakeInfo : function(){
		var sinfo = this.owner.newInstance('AreaCellInfo');
		for(var fc=0;fc<this.cellmax;fc++){ sinfo.id[fc]=(this.cell[fc].getAnum()>0?0:-1);}
		for(var fc=0;fc<this.cellmax;fc++){
			if(!sinfo.emptyCell(this.cell[fc])){ continue;}
			sinfo.addRoom();

			var stack=[this.cell[fc]];
			while(stack.length>0){
				var cell = stack.pop();
				if(!sinfo.emptyCell(cell)){ continue;}
				sinfo.addCell(cell);

				var list = cell.getdir4clist();
				for(var i=0;i<list.length;i++){
					var cell2 = list[i][0];
					if(Math.abs(cell.getAnum()-cell2.getAnum())===1){ stack.push(cell2);}
				}
			}
		}
		return sinfo;
	},

	adjustBoardData : function(key,d){
		this.adjustNumberArrow(key,d);
	}
},

Flags:{
	use : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	hideHatena : true,

	setColors : function(){
		this.gridcolor = this.gridcolor_LIGHT;
		this.dotcolor = this.dotcolor_PINK;
		this.fontcolor = this.fontErrcolor = "white";
		this.setCellColorFunc('qnum');
	},
	paint : function(){
		this.drawBGCells();
		this.drawDotCells(true);
		this.drawDashedGrid();

		this.drawBorders();

		this.drawBlackCells();
		this.drawArrowNumbers();
		this.drawAnswerNumbers();

		this.drawChassis();

		this.drawCursor();
	},

	getBorderColor : function(border){
		if(!this.owner.getConfig('snakebd')){ return false;}

		var cell1 = border.sidecell[0], cell2 = border.sidecell[1];
		if(!cell1.isnull && !cell2.isnull &&
		   (cell1.qnum===-1 && cell2.qnum===-1) &&
		   (cell1.anum!==-1 || cell2.anum!==-1) &&
		   ( ((cell1.anum===-1)^(cell2.anum===-1)) || (Math.abs(cell1.anum-cell2.anum)!==1)) )
		{
			return this.borderQanscolor;
		}
		return null;
	},

	drawAnswerNumbers : function(){
		var g = this.vinc('cell_number', 'auto');

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i], key='cell_'+cell.id;
			if(cell.qnum===-1 && cell.anum>0){
				var px = cell.bx*this.bw, py = cell.by*this.bh;
				this.dispnum(key, 1, ""+cell.anum, 0.8, this.fontAnscolor, px, py);
			}
			/* 不要な文字はdrawArrowNumbersで消しているので、ここでは消さない */
		}
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		this.decodeArrowNumber16();
	},
	pzlexport : function(type){
		this.encodeArrowNumber16();
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCellDirecQnum();
		this.decodeCellAnumsub();
	},
	encodeData : function(){
		this.encodeCellDirecQnum();
		this.encodeCellAnumsub();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		var sinfo = this.owner.board.getSnakeInfo();
		if( !this.checkAllArea(sinfo, function(w,h,a,n){ return (a==5);} ) ){
			this.setAlert('大きさが５ではない蛇がいます。','The size of a snake is not five.'); return false;
		}

		if( !this.checkDifferentNumberInRoom(sinfo, function(cell){ return cell.getAnum();}) ){
			this.setAlert('同じ数字が入っています。','A Snake has same plural marks.'); return false;
		}

		if( !this.checkSideCell2(sinfo) ){
			this.setAlert('別々の蛇が接しています。','Other snakes are adjacent.'); return false;
		}

		if( !this.checkArrowNumber() ){
			this.setAlert('矢印の方向にある数字が正しくありません。','The number in the direction of the arrow is not correct.'); return false;
		}

		if( !this.checkSnakesView(sinfo) ){
			this.setAlert('蛇の視線の先に別の蛇がいます。','A snake can see another snake.'); return false;
		}

		return true;
	},

	checkSideCell2 : function(sinfo){
		var result = true, bd = this.owner.board;
		var func = function(sinfo,cell1,cell2){
			var r1 = sinfo.getRoomID(cell1), r2 = sinfo.getRoomID(cell2);
			return (r1>0 && r2>0 && r1!==r2);
		};
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c], cell2 = cell.rt();
			if(!cell2.isnull && func(sinfo,cell,cell2)){
				if(this.inAutoCheck){ return false;}
				sinfo.getclistbycell(cell).seterr(1);
				sinfo.getclistbycell(cell2).seterr(1);
				result = false;
			}
			cell2 = cell.dn();
			if(!cell2.isnull && func(sinfo,cell,cell2)){
				if(this.inAutoCheck){ return false;}
				sinfo.getclistbycell(cell).seterr(1);
				sinfo.getclistbycell(cell2).seterr(1);
				result = false;
			}
		}
		return result;
	},

	checkArrowNumber : function(){
		var result = true, bd = this.owner.board;
		var gonext = function(){
			cell2 = pos.getc();
			return (!cell2.isnull && cell2.qnum===-1 && cell2.anum===-1);
		};
		var noans = function(cell2){ return (cell2.isnull || cell2.qnum!==-1 || cell2.anum===-1);}

		for(var c=0;c<bd.cellmax;c++){
			var cell=bd.cell[c], num=cell.getQnum(), dir=cell.getQdir();
			if(num<0 || dir===0){ continue;}

			var cell2, pos=cell.getaddr();
			pos.movedir(dir,2);
			while(gonext()){ pos.movedir(dir,2);}
			// cell2は数字のあるマスのIDか、null(盤面外)を指す

			// 矢印つき数字が0で、その先に回答の数字がある
			if(num===0 && !noans(cell2)){
				if(this.inAutoCheck){ return false;}
				cell.seterr(1);
				if(num<=0){ cell2.seterr(1);}
				result = false;
			}
			// 矢印つき数字が1以上で、その先に回答の数字がない or 回答の数字が違う
			else if(num>0 && (noans(cell2) || cell2.anum!==num)){
				if(this.inAutoCheck){ return false;}
				cell.seterr(1);
				cell2.seterr(1);
				result = false;
			}
		}
		return result;
	},
	checkSnakesView : function(sinfo){
		var result = true;
		for(var r=1;r<=sinfo.max;r++){
			var clist = sinfo.getclist(r);
			var cell = clist.filter(function(cell){ return (cell.getAnum()===1)})[0];
			if(!cell){ continue;}

			var cell2, dir=k.NDIR;
			cell2=cell.dn(); if(!cell2.isnull && cell2.getAnum()===2){ dir=k.UP;}
			cell2=cell.up(); if(!cell2.isnull && cell2.getAnum()===2){ dir=k.DN;}
			cell2=cell.rt(); if(!cell2.isnull && cell2.getAnum()===2){ dir=k.LT;}
			cell2=cell.lt(); if(!cell2.isnull && cell2.getAnum()===2){ dir=k.RT;}
			if(dir===k.NDIR){ continue;}

			var pos = cell.getaddr(), clist2 = this.owner.newInstance('CellList');
			clist2.add(cell);
			while(!cell.isnull){
				pos.movedir(dir,2);
				cell = pos.getc();

				if(!cell.isnull){ clist2.add(cell);}
				if(cell.isnull || cell.qnum!==-1 || cell.anum!==-1){ break;}
			}
			// cellは数字のあるマスか、null(盤面外)を指す

			var sid=sinfo.getRoomID(cell);
			if(!cell.isnull && cell.getAnum()>0 && cell.getQnum()===-1 && sid>0 && r!=sid){
				if(this.inAutoCheck){ return false;}
				clist2.seterr(1);
				clist.seterr(1);
				sinfo.getclist(sid).seterr(1);
				result = false;
			}
		}
		return result;
	}
}
});

})();
