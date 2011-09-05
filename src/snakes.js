//
// パズル固有スクリプト部 へびいちご版 snakes.js v3.4.0
//
pzprv3.custom.snakes = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputedit : function(){
		if(this.mousestart || (this.mousemove && this.notInputted())){
			this.inputdirec();
		}
		else if(this.mouseend && this.notInputted()){
			this.inputqnum_snakes();
		}
	},
	inputplay : function(){
		if(this.mousestart || this.mousemove){
			if(!this.inputDot_snakes()){
				this.dragnumber_snakes();
			}
		}
		else if(this.mouseend && this.notInputted()){
			this.inputqnum_snakes();
		}
	},

	dragnumber_snakes : function(){
		var cc = this.cellid();
		if(cc===null||cc===this.mouseCell){ return;}
		if(this.mouseCell===null){
			this.inputData = bd.AnC(cc)!==-1?bd.AnC(cc):10;
			this.mouseCell = cc;
		}
		else if(bd.QnC(cc)==-1 && this.inputData>=1 && this.inputData<=5){
			if     (this.btn.Left ) this.inputData++;
			else if(this.btn.Right) this.inputData--;
			if(this.inputData>=1 && this.inputData<=5){
				bd.sDiC(cc, 0);
				bd.sAnC(cc, this.inputData); bd.sQsC(cc,0);
				this.mouseCell = cc;
				pc.paintCell(cc);
			}
		}
		else if(bd.QnC(cc)==-1 && this.inputData==10){
			bd.sAnC(cc, -1); bd.sQsC(cc,0);
			pc.paintCell(cc);
		}
	},
	inputDot_snakes : function(){
		if(!this.btn.Right || (this.inputData!==null && this.inputData>=0)){ return false;}

		var cc = this.cellid();
		if(cc===null||cc===this.mouseCell){ return (this.inputData<0);}

		if(this.inputData===null){
			if(bd.AnC(cc)===-1){
				this.inputData = (bd.QsC(cc)!==1?-2:-3);
				return true;
			}
			return false;
		}

		bd.sAnC(cc,-1);
		bd.sQsC(cc,(this.inputData===-2?1:0));
		pc.paintCell(cc);
		this.mouseCell = cc;
		return true;
	},
	inputqnum_snakes : function(){
		if(this.owner.editmode){ bd.minnum = 1;}
		this.mouseCell=null;
		this.inputqnum();
		bd.minnum = 0;
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
Board:{
	isborder : 1,

	maxnum : 5,
	minnum : 0,

	getSnakeInfo : function(){
		var sinfo = new pzprv3.core.AreaInfo();
		for(var fc=0;fc<this.cellmax;fc++){ sinfo.id[fc]=(this.AnC(fc)>0?0:-1);}
		for(var fc=0;fc<this.cellmax;fc++){
			if(sinfo.id[fc]!==0){ continue;}
			sinfo.max++;
			sinfo.room[sinfo.max] = {idlist:[]};

			var stack=[fc], id=sinfo.max;
			while(stack.length>0){
				var c=stack.pop();
				if(sinfo.id[c]!==0){ continue;}
				sinfo.id[c] = id;
				sinfo.room[id].idlist.push(c);
				var clist = bd.getdir4clist(c);
				for(var i=0;i<clist.length;i++){
					if(Math.abs(this.AnC(c)-this.AnC(clist[i][0]))===1){ stack.push(clist[i][0]);}
				}
			}
		}
		return sinfo;
	}
},

MenuExec:{
	adjustBoardData : function(key,d){
		this.adjustNumberArrow(key,d);
	}
},

Menu:{
	menufix : function(){
		this.addUseToFlags();

		pp.addCheck('snakebd','setting',false,'へび境界線有効','Enable snake border');
		pp.setLabel('snakebd', 'へびの周りに境界線を表示する', 'Draw border around a snake.');
		pp.funcs['snakebd'] = function(){ pc.paintAll();};
	}
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
		if(!pp.getVal('snakebd')){ return false;}

		var cc1 = border.cellcc[0], cc2 = border.cellcc[1];
		if(cc1!==null && cc2!==null &&
		   (bd.cell[cc1].qnum===-1 && bd.cell[cc2].qnum===-1) &&
		   (bd.cell[cc1].anum!==-1 || bd.cell[cc2].anum!==-1) &&
		   ( ((bd.cell[cc1].anum===-1)^(bd.cell[cc2].anum===-1)) ||
			 (Math.abs(bd.cell[cc1].anum-bd.cell[cc2].anum)!==1)) )
		{
			return this.borderQanscolor;
		}
		return null;
	},

	drawAnswerNumbers : function(){
		var g = this.vinc('cell_number', 'auto');

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var c = clist[i], obj = bd.cell[c], key='cell_'+c;
			if(obj.qnum===-1 && obj.anum>0){
				var px = this.cell[c].px, py = this.cell[c].py;
				this.dispnum(key, 1, ""+obj.anum, 0.8, this.fontAnscolor, px, py);
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

		var sinfo = bd.getSnakeInfo();
		if( !this.checkAllArea(sinfo, function(w,h,a,n){ return (a==5);} ) ){
			this.setAlert('大きさが５ではない蛇がいます。','The size of a snake is not five.'); return false;
		}

		if( !this.checkDifferentNumberInRoom(sinfo, function(c){ return bd.AnC(c);}) ){
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
		var result = true;
		var func = function(sinfo,c1,c2){ return (sinfo.id[c1]>0 && sinfo.id[c2]>0 && sinfo.id[c1]!=sinfo.id[c2]);};
		for(var c=0;c<bd.cellmax;c++){
			if(bd.cell[c].bx<bd.maxbx-2 && func(sinfo,c,c+1)){
				if(this.inAutoCheck){ return false;}
				bd.sErC(sinfo.room[sinfo.id[c]].idlist,1);
				bd.sErC(sinfo.room[sinfo.id[c+1]].idlist,1);
				result = false;
			}
			if(bd.cell[c].by<bd.maxby-2 && func(sinfo,c,c+bd.qcols)){
				if(this.inAutoCheck){ return false;}
				bd.sErC(sinfo.room[sinfo.id[c]].idlist,1);
				bd.sErC(sinfo.room[sinfo.id[c+bd.qcols]].idlist,1);
				result = false;
			}
		}
		return result;
	},

	checkArrowNumber : function(){
		var result = true;
		var gonext = function(){
			// bx,by,clist,ccは319行目で宣言されてるものと同一です。
			cc = bd.cnum(bx,by);
			if(cc!==null){ clist.push(cc);}
			return (cc!==null && bd.cell[cc].qnum===-1 && bd.cell[cc].anum===-1);
		};
		var noans = function(cc){ return (cc===null || bd.cell[cc].qnum!==-1 || bd.cell[cc].anum===-1);}

		for(var c=0;c<bd.cellmax;c++){
			var num=bd.QnC(c), dir=bd.DiC(c);
			if(num<0 || dir===0){ continue;}

			var bx=bd.cell[c].bx, by=bd.cell[c].by, clist=[c], cc;
			switch(dir){
				case bd.UP: by-=2; while(gonext()){ by-=2;} break;
				case bd.DN: by+=2; while(gonext()){ by+=2;} break;
				case bd.LT: bx-=2; while(gonext()){ bx-=2;} break;
				case bd.RT: bx+=2; while(gonext()){ bx+=2;} break;
			}
			// ccは数字のあるマスのIDか、null(盤面外)を指す

			// 矢印つき数字が0で、その先に回答の数字がある
			if(num===0 && !noans(cc)){
				if(this.inAutoCheck){ return false;}
				if(num>0){ bd.sErC(clist,1);}
				else{ bd.sErC([c,cc],1);}
				result = false;
			}
			// 矢印つき数字が1以上で、その先に回答の数字がない or 回答の数字が違う
			else if(num>0 && (noans(cc) || bd.cell[cc].anum!==num)){
				if(this.inAutoCheck){ return false;}
				bd.sErC([c,cc],1);
				result = false;
			}
		}
		return result;
	},
	checkSnakesView : function(sinfo){
		var result = true;
		var gonext = function(){
			// bx,by,clist,ccは366行目で宣言されてるものと同一です。
			cc = bd.cnum(bx,by);
			if(cc!==null){ clist.push(cc);}
			return (cc!==null && bd.cell[cc].qnum===-1 && bd.cell[cc].anum===-1);
		};

		for(var r=1;r<=sinfo.max;r++){
			var idlist=sinfo.room[r].idlist, c1=null, dir=bd.NDIR, c2;

			for(var i=0;i<idlist.length;i++){ if(bd.AnC(idlist[i])===1){ c1=idlist[i]; break;}}
			if(c1===null){ continue;}

			c2=bd.dn(c1); if(c2!==null && bd.AnC(c2)===2){ dir=bd.UP;}
			c2=bd.up(c1); if(c2!==null && bd.AnC(c2)===2){ dir=bd.DN;}
			c2=bd.rt(c1); if(c2!==null && bd.AnC(c2)===2){ dir=bd.LT;}
			c2=bd.lt(c1); if(c2!==null && bd.AnC(c2)===2){ dir=bd.RT;}
			if(dir===bd.NDIR){ continue;}

			var bx = bd.cell[c1].bx, by = bd.cell[c1].by, clist=[c1], cc;
			switch(dir){
				case bd.UP: by-=2; while(gonext()){ by-=2;} break;
				case bd.DN: by+=2; while(gonext()){ by+=2;} break;
				case bd.LT: bx-=2; while(gonext()){ bx-=2;} break;
				case bd.RT: bx+=2; while(gonext()){ bx+=2;} break;
			}
			// ccは数字のあるマスのIDか、null(盤面外)を指す

			var sid=sinfo.id[cc];
			if(cc!==null && bd.AnC(cc)>0 && bd.QnC(cc)===-1 && sid>0 && r!=sid){
				if(this.inAutoCheck){ return false;}
				bd.sErC(clist,1);
				bd.sErC(idlist,1);
				bd.sErC(sinfo.room[sid].idlist,1);
				result = false;
			}
		}
		return result;
	}
}
};
