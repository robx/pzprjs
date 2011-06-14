//
// パズル固有スクリプト部 ぼんさん・へやぼん版 bonsan.js v3.4.0
//
pzprv3.custom.bonsan = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mousedown : function(){
		if(k.editmode){
			if(this.owner.pid==='heyabon'){ this.inputborder();}
		}
		else if(k.playmode){
			if(this.btn.Left){ this.inputLine();}
		}
	},
	mouseup : function(){
		if(this.notInputted()){
			if(k.editmode){ this.inputqnum();}
			else if(k.playmode){ this.inputlight();}
		}
	},
	mousemove : function(){
		if(k.editmode){
			if(this.owner.pid==='heyabon'){ this.inputborder();}
		}
		else if(k.playmode){
			if(this.btn.Left){ this.inputLine();}
		}
	},

	inputlight : function(){
		var cc = this.cellid();
		if(cc===null){ return;}

		if     (bd.QsC(cc)==0){ bd.sQsC(cc, (this.btn.Left?1:2));}
		else if(bd.QsC(cc)==1){ bd.sQsC(cc, (this.btn.Left?2:0));}
		else if(bd.QsC(cc)==2){ bd.sQsC(cc, (this.btn.Left?0:1));}
		pc.paintCell(cc);
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,

	enablemake_p : true,
	generate : function(mode,type){
		this.inputcol('num','knum0','0','0');
		this.inputcol('num','knum1','1','1');
		this.inputcol('num','knum.','-','○');
		this.inputcol('num','knum_',' ',' ');
		this.insertrow();
		this.inputcol('num','knum2','2','2');
		this.inputcol('num','knum3','3','3');
		this.inputcol('num','knum4','4','4');
		this.inputcol('num','knum5','5','5');
		this.insertrow();
		this.inputcol('num','knum6','6','6');
		this.inputcol('num','knum7','7','7');
		this.inputcol('num','knum8','8','8');
		this.inputcol('num','knum9','9','9');
		this.insertrow();
	}
},

//---------------------------------------------------------
// 盤面管理系
Board:{
	qcols : 8,
	qrows : 8,

	isborder : 1,

	nummaxfunc : function(cc){
		return Math.max(this.qcols,this.qrows)-1;
	},
	minnum : 0,

	getMovedPosition : function(linfo){
		var minfo = new pzprv3.core.AreaInfo();
		for(var c=0;c<this.cellmax;c++){ minfo.id[c]=c;}
		for(var r=1;r<=linfo.max;r++){
			if(linfo.room[r].idlist.length<=1){ continue;}
			var before=null, after=null;
			for(var i=0;i<linfo.room[r].idlist.length;i++){
				var c=linfo.room[r].idlist[i];
				if(this.lines.lcntCell(c)===1){
					if(this.isNum(c)){ before=c;}else{ after=c;}
				}
			}
			if(before!==null && after!==null){
				minfo.id[after]=before;
				minfo.id[before]=null;
			}
		}
		return minfo;
	}
},

LineManager:{
	isCenterLine : true
},

AreaManager:{
	hasroom : true,
	lineToArea : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	hideHatena : true,

	setColors : function(){
		this.gridcolor = this.gridcolor_LIGHT;
		this.qsubcolor1 = "rgb(224, 224, 255)";
		this.qsubcolor2 = "rgb(255, 255, 144)";
		this.setBGCellColorFunc('qsub2');

		this.fontsizeratio = 0.9;	// 数字の倍率
		this.circleratio = [0.38, 0.38];
	},
	paint : function(){
		this.drawBGCells();
		this.drawGrid();
		if(this.owner.pid==='heyabon'){ this.drawBorders();}

		this.drawTip();
		this.drawLines();
		//this.drawPekes(0);

		this.drawCirclesAtNumber();
		this.drawNumbers();

		this.drawChassis();

		this.drawTarget();
	},

	drawTip : function(){
		var g = this.vinc('cell_linetip', 'auto');

		var tsize = this.cw*0.30;
		var tplus = this.cw*0.05;
		var header = "c_tip_";

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var c = clist[i];
			this.vdel([header+c]);
			if(bd.lines.lcntCell(c)==1 && bd.cell[c].qnum==-1){
				var dir=0, id=null;
				if     (bd.isLine(bd.ub(c))){ dir=2; id=bd.ub(c);}
				else if(bd.isLine(bd.db(c))){ dir=1; id=bd.db(c);}
				else if(bd.isLine(bd.lb(c))){ dir=4; id=bd.lb(c);}
				else if(bd.isLine(bd.rb(c))){ dir=3; id=bd.rb(c);}

				g.lineWidth = this.lw; //LineWidth
				if     (bd.border[id].error==1){ g.strokeStyle = this.errlinecolor1; g.lineWidth=g.lineWidth+1;}
				else if(bd.border[id].error==2){ g.strokeStyle = this.errlinecolor2;}
				else                           { g.strokeStyle = this.linecolor;}

				if(this.vnop(header+c,this.STROKE)){
					var px=bd.cell[c].cpx+1, py=bd.cell[c].cpy+1;
					if     (dir==1){ g.setOffsetLinePath(px,py ,-tsize, tsize ,0,-tplus , tsize, tsize, false);}
					else if(dir==2){ g.setOffsetLinePath(px,py ,-tsize,-tsize ,0, tplus , tsize,-tsize, false);}
					else if(dir==3){ g.setOffsetLinePath(px,py , tsize,-tsize ,-tplus,0 , tsize, tsize, false);}
					else if(dir==4){ g.setOffsetLinePath(px,py ,-tsize,-tsize , tplus,0 ,-tsize, tsize, false);}
					g.stroke();
				}
			}
		}
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		if(!this.checkpflag("c")){ this.decodeBorder();}
		this.decodeNumber16();

		this.checkPuzzleid();
	},
	pzlexport : function(type){
		if(type===1 || this.owner.pid==='heyabon'){ this.encodeBorder();}else{ this.outpflag="c";}
		this.encodeNumber16();
	},

	checkPuzzleid : function(){
		if(this.owner.pid==='bonsan'){
			for(var id=0;id<bd.bdmax;id++){
				if(bd.border[id].ques===1){ this.owner.pid='heyabon'; break;}
			}
			menu.displayDesign();
		}
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCellQnum();
		this.decodeCellQsub();
		this.decodeBorderQues();
		this.decodeBorderLine();

		enc.checkPuzzleid();
	},
	encodeData : function(){
		this.encodeCellQnum();
		this.encodeCellQsub();
		this.encodeBorderQues();
		this.encodeBorderLine();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){
		this.performAsLine = true;

		if( !this.checkLcntCell(3) ){
			this.setAlert('分岐している線があります。','There is a branch line.'); return false;
		}
		if( !this.checkLcntCell(4) ){
			this.setAlert('線が交差しています。','There is a crossing line.'); return false;
		}

		this.performAsLine = false;
		var linfo = bd.areas.getLareaInfo();
		if( !this.checkDoubleNumber(linfo) ){
			this.setAlert('○が繋がっています。','There are connected circles.'); return false;
		}
		if( !this.checkLineOverLetter() ){
			this.setAlert('○の上を線が通過しています。','A line goes through a circle.'); return false;
		}

		if( !this.checkAllArea(linfo, function(w,h,a,n){ return (w==1||h==1);}) ){
			this.setAlert('曲がっている線があります。','A line has curve.'); return false;
		}
		if( !this.checkAllArea(linfo, function(w,h,a,n){ return (n<0||n==a-1);}) ){
			this.setAlert('数字と線の長さが違います。','The length of a line is wrong.'); return false;
		}

		var rinfo = bd.areas.getRoomInfo(), minfo = bd.getMovedPosition(linfo);
		var mfunc = function(c){ return ((c!==null && minfo.id[c]!==null) ? bd.QnC(minfo.id[c]) : -1);};
		if( (this.owner.pid==='bonsan') && !this.checkFractal(rinfo, mfunc) ){
			this.setAlert('○が点対称に配置されていません。', 'Position of circles is not point symmetric.'); return false;
		}
		if( (this.owner.pid==='heyabon') && !this.checkFractal(rinfo, mfunc) ){
			this.setAlert('部屋の中の○が点対称に配置されていません。', 'Position of circles in the room is not point symmetric.'); return false;
		}
		if( (this.owner.pid==='heyabon') && !this.checkNoObjectInRoom(rinfo, mfunc) ){
			this.setAlert('○のない部屋があります。','A room has no circle.'); return false;
		}

		if( !this.checkAllCell(function(c){ return (bd.QnC(c)>=1 && bd.lines.lcntCell(c)==0);} ) ){
			this.setAlert('○から線が出ていません。','A circle doesn\'t start any line.'); return false;
		}

		this.performAsLine = true;
		if( !this.checkDisconnectLine(linfo) ){
			this.setAlert('○につながっていない線があります。','A line doesn\'t connect any circle.'); return false;
		}

		return true;
	},

	checkLineOverLetter : function(func){
		var result = true;
		for(var c=0;c<bd.cellmax;c++){
			if(bd.lines.lcntCell(c)>=2 && bd.isNum(c)){
				if(this.inAutoCheck){ return false;}
				if(result){ bd.sErBAll(2);}
				bd.setCellLineError(c,true);
				result = false;
			}
		}
		return result;
	},

	checkFractal : function(rinfo, getval){
		for(var id=1;id<=rinfo.max;id++){
			var d = bd.getSizeOfClist(rinfo.room[id].idlist);
			d.xx=d.x1+d.x2, d.yy=d.y1+d.y2;
			for(var i=0;i<rinfo.room[id].idlist.length;i++){
				var c=rinfo.room[id].idlist[i];
				if(getval(c)!=-1 ^ getval(bd.cnum(d.xx-bd.cell[c].bx, d.yy-bd.cell[c].by))!=-1){
					for(var a=0;a<rinfo.room[id].idlist.length;a++){
						if(getval(rinfo.room[id].idlist[a])!=-1){
							bd.sErC([rinfo.room[id].idlist[a]],1);
						}
					}
					return false;
				}
			}
		}
		return true;
	}
}
};
