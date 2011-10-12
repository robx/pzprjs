//
// パズル固有スクリプト部 ホタルビーム版 firefly.js v3.4.0
//
pzprv3.createCustoms('firefly', {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputedit : function(){
		if(!this.notInputted()){ return;}
		if(this.mousestart || this.mousemove){
			this.inputdirec();
		}
		else if(this.mouseend){
			if(this.prevPos.getc()===this.getcell()){ this.inputqnum();}
		}
	},
	inputplay : function(){
		if(this.mousestart || this.mousemove){
			if     (this.btn.Left) { this.inputLine();}
			else if(this.btn.Right){ this.inputpeke();}
		}
		else if(this.mouseend && this.notInputted()){
			if(this.btn.Left){ this.inputpeke();}
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
Cell:{
	minnum : 0
},
Board:{
	isborder : 1,

	adjustBoardData : function(key,d){
		this.adjustNumberArrow(key,d);
	}
},

LineManager:{
	isCenterLine : true
},

AreaManager:{
	lineToArea : true
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
		var g = this.vinc('cell_firefly', 'auto');

		g.lineWidth = 1.5;
		g.strokeStyle = this.cellcolor;

		var rsize  = this.cw*0.40;
		var rsize3 = this.cw*0.10;

		var headers = ["c_cira_", "c_cirb_"];
		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i], id = cell.id;

			if(cell.qnum!==-1){
				var px = cell.bx*this.bw, py = cell.by*this.bh;

				g.fillStyle = (cell.error===1 ? this.errbcolor1 : "white");
				if(this.vnop(headers[0]+id,this.FILL)){
					g.shapeCircle(px, py, rsize);
				}

				this.vdel([headers[1]+id]);
				if(cell.qdir!==0){
					g.fillStyle = this.cellcolor;
					switch(cell.qdir){
						case bd.UP: py-=(rsize-1); break;
						case bd.DN: py+=(rsize-1); break;
						case bd.LT: px-=(rsize-1); break;
						case bd.RT: px+=(rsize-1); break;
					}
					if(this.vnop(headers[1]+id,this.NONE)){
						g.fillCircle(px, py, rsize3);
					}
				}
			}
			else{ this.vhide([headers[0]+id, headers[1]+id]);}
		}
	},

	repaintParts : function(blist){
		this.range.cells = blist.cellinside();

		this.drawFireflies();
		this.drawNumbers();
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
		return this.checkAllCell(function(cell){ return (cell.noNum() && cell.lcnt()==val);});
	},
	checkFireflyBeam : function(){
		var result = true;
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c], dir=cell.getQdir();
			if(cell.noNum() || dir===0){ continue;}
			if(!cell.getaddr().movedir(dir,1).getb().isLine()){
				if(this.inAutoCheck){ return false;}
				cell.seterr(1);
				result = false;
			}
		}
		return result;
	},

	isErrorFlag_line : function(xinfo){
		var room=xinfo.room[xinfo.max], ccnt=room.ccnt, length=room.length;
		var cell1=room.cells[0], cell2=room.cells[1], dir1=room.dir1, dir2=room.dir2;

		// qd1 スタート地点の黒点の方向 qd2 到達地点の線の方向
		var qd1=cell1.getQdir(), qd2=(!cell2.isnull?cell2.getQdir():bd.NDIR), qn=-1, err=0;
		if((dir1===qd1)^(dir2===qd2)){ qn=(dir1===qd1?cell1:cell2).getQnum();}

		if     (!cell2.isnull && (dir1===qd1) && (dir2===qd2)){ err=4;}
		else if(!cell2.isnull && (dir1!==qd1) && (dir2!==qd2)){ err=3;}
		else if(!cell2.isnull && qn>=0 && qn!==ccnt){ err=2; room.cells=[cell1];}
		else if( cell2.isnull){ err=1;}
		room.error = err;
	}
}
});
