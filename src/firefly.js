//
// パズル固有スクリプト部 ホタルビーム版 firefly.js v3.4.0
//
pzprv3.custom.firefly = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mousedown : function(){
		if(k.editmode){ this.inputdirec();}
		else if(k.playmode){
			if     (this.btn.Left) { this.inputLine();}
			else if(this.btn.Right){ this.inputpeke();}
		}
	},
	mouseup : function(){
		if(this.notInputted()){
			if(k.editmode && bd.cnum(this.prevPos.x,this.prevPos.y)===this.cellid()){
				this.inputqnum();
			}
			else if(k.playmode && this.btn.Left){
				this.inputpeke();
			}
		}
	},
	mousemove : function(){
		if(k.editmode){
			if(this.notInputted()){ this.inputdirec();}
		}
		else if(k.playmode){
			if     (this.btn.Left) { this.inputLine();}
			else if(this.btn.Right){ this.inputpeke();}
		}
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
		if(this.key_inputdirec(ca)){ return;}
		this.key_inputqnum(ca);
	}
},

//---------------------------------------------------------
// 盤面管理系
Board:{
	isborder : 1,

	numzero : true
},

LineManager:{
	isCenterLine : true
},

AreaManager:{
	lineToArea : true
},

MenuExec:{
	adjustBoardData : function(key,d){
		this.adjustNumberArrow(key,d);
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	bdmargin       : 0.50,
	bdmargin_image : 0.10,

	irowake : 1,

	hideHatena : true,

	setColors : function(){
		this.gridcolor = this.gridcolor_LIGHT;

		this.fontErrcolor = this.fontcolor;
		this.fontsizeratio = 0.85;
	},
	paint : function(){
		this.drawDashedCenterLines();
		this.drawLines();

		this.drawPekes(0);

		this.drawFireflies();
		this.drawNumbers();

		this.drawTarget();
	},

	drawFireflies : function(){
		this.vinc('cell_firefly', 'auto');

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){ this.drawFirefly1(clist[i]);}
	},
	drawFirefly1 : function(c){
		if(c===null){ return;}

		var rsize  = this.cw*0.40;
		var rsize3 = this.cw*0.10;
		var headers = ["c_cira_", "c_cirb_"];

		if(bd.cell[c].qnum!=-1){
			var px=bd.cell[c].cpx, py=bd.cell[c].cpy;

			g.lineWidth = 1.5;
			g.strokeStyle = this.cellcolor;
			g.fillStyle = (bd.cell[c].error===1 ? this.errbcolor1 : "white");
			if(this.vnop(headers[0]+c,this.FILL)){
				g.shapeCircle(px, py, rsize);
			}

			this.vdel([headers[1]+c]);
			if(bd.cell[c].qdir!=0){
				g.fillStyle = this.cellcolor;
				switch(bd.cell[c].qdir){
					case bd.UP: py-=(rsize-1); break;
					case bd.DN: py+=(rsize-1); break;
					case bd.LT: px-=(rsize-1); break;
					case bd.RT: px+=(rsize-1); break;
				}
				if(this.vnop(headers[1]+c,this.NONE)){
					g.fillCircle(px, py, rsize3);
				}
			}
		}
		else{ this.vhide([headers[0]+c, headers[1]+c]);}
	},

	repaintParts : function(idlist){
		var clist = bd.lines.getClistFromIdlist(idlist);
		for(var i=0;i<clist.length;i++){
			this.drawFirefly1(clist[i]);
			this.drawNumber1(clist[i]);
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
		this.decodeBorderLine();
	},
	encodeData : function(){
		this.encodeCellDirecQnum();
		this.encodeBorderLine();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.checkLcntCell_firefly(3) ){
			this.setAlert('分岐している線があります。', 'There is a branch line.'); return false;
		}
		if( !this.checkLcntCell_firefly(4) ){
			this.setAlert('線が交差しています。', 'There is a crossing line.'); return false;
		}

		var xinfo = this.getErrorFlag_line();
		if( !this.checkErrorFlag_line(xinfo,4) ){
			this.setAlert('黒点同士が線で繋がっています。', 'Black points are connected each other.'); return false;
		}
		if( !this.checkErrorFlag_line(xinfo,3) ){
			this.setAlert('白丸の、黒点でない部分どうしがくっついています。', 'Fireflies are connected without a line starting from black point.'); return false;
		}
		if( !this.checkErrorFlag_line(xinfo,2) ){
			this.setAlert('線の曲がった回数が数字と違っています。', 'The number of curves is different from a firefly\'s number.'); return false;
		}
		if( !this.checkErrorFlag_line(xinfo,1) ){
			this.setAlert('線が途中で途切れています。', 'There is a dead-end line.'); return false;
		}

		this.performAsLine = true;
		if( !this.checkOneArea( bd.areas.getLareaInfo() ) ){
			this.setAlert('線が全体で一つながりになっていません。', 'All lines and fireflies are not connected each other.'); return false;
		}

		if( !this.checkLcntCell_firefly(1) ){
			this.setAlert('線が途中で途切れています。', 'There is a dead-end line.'); return false;
		}

		if( !this.checkFireflyBeam() ){
			this.setAlert('ホタルから線が出ていません。', 'There is a lonely firefly.'); return false;
		}

		return true;
	},

	checkLcntCell_firefly : function(val){
		if(bd.lines.ltotal[val]==0){ return true;}
		return this.checkAllCell(function(c){ return (bd.noNum(c) && bd.lines.lcntCell(c)==val);});
	},
	checkFireflyBeam : function(){
		var result = true;
		for(var c=0;c<bd.cellmax;c++){
			if(bd.noNum(c) || bd.DiC(c)==0){ continue;}
			if((bd.DiC(c)==bd.UP && !bd.isLine(bd.ub(c))) || (bd.DiC(c)==bd.DN && !bd.isLine(bd.db(c))) ||
			   (bd.DiC(c)==bd.LT && !bd.isLine(bd.lb(c))) || (bd.DiC(c)==bd.RT && !bd.isLine(bd.rb(c))) )
			{
				if(this.inAutoCheck){ return false;}
				bd.sErC([c],1);
				result = false;
			}
		}
		return result;
	},

	isErrorFlag_line : function(xinfo){
		var room=xinfo.room[xinfo.max], ccnt=room.ccnt, length=room.length;
		var c1=room.cells[0], c2=room.cells[1], dir1=room.dir1, dir2=room.dir2;

		// qd1 スタート地点の黒点の方向 qd2 到達地点の線の方向
		var qd1=bd.DiC(c1), qd2=(c2!==null?bd.DiC(c2):k.NONE), qn=-1, err=0;
		if((dir1===qd1)^(dir2===qd2)){ qn=bd.QnC((dir1===qd1)?c1:c2);}

		if     (c2!==null && (dir1===qd1) && (dir2===qd2)){ err=4;}
		else if(c2!==null && (dir1!==qd1) && (dir2!==qd2)){ err=3;}
		else if(c2!==null && qn>=0 && qn!==ccnt){ err=2; room.cells[1]=null;}
		else if(c2===null){ err=1;}
		room.error = err;
	}
}
};
