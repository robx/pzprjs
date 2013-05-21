//
// パズル固有スクリプト部 ホタルビーム版 firefly.js v3.4.0
//
(function(){

var k = pzprv3.consts;

pzprv3.createCustoms('firefly', {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.owner.playmode){
			if(this.btn.Left){
				if(this.mousestart || this.mousemove){ this.inputLine();}
				else if(this.mouseend && this.notInputted()){ this.inputpeke();}
			}
			else if(this.btn.Right){
				if(this.mousestart || this.mousemove){ this.inputpeke();}
			}
		}
		else if(this.owner.editmode){
			if(!this.notInputted()){ return;}
			if(this.mousestart || this.mousemove){
				this.inputdirec();
			}
			else if(this.mouseend){
				if(this.prevPos.getc()===this.getcell()){ this.inputqnum();}
			}
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
	isborder : 1
},
BoardExec:{
	adjustBoardData : function(key,d){
		this.adjustNumberArrow(key,d);
	}
},

LineManager:{
	isCenterLine : true
},

AreaLineManager:{
	enabled : true
},

Flags:{
	irowake : 1
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	hideHatena : true,

	setColors : function(){
		this.gridcolor = this.gridcolor_LIGHT;

		this.fontErrcolor = this.fontcolor;
		this.fontsizeratio = 0.85;
	},
	paint : function(){
		this.drawDashedCenterLines();
		this.drawLines();

		this.drawPekes();

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
						case k.UP: py-=(rsize-1); break;
						case k.DN: py+=(rsize-1); break;
						case k.LT: px-=(rsize-1); break;
						case k.RT: px+=(rsize-1); break;
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
	decodePzpr : function(type){
		this.decodeArrowNumber16();
	},
	encodePzpr : function(type){
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

		if( !this.checkLcntCell_firefly(3) ){ return 40201;}
		if( !this.checkLcntCell_firefly(4) ){ return 40301;}

		var xinfo = this.getErrorFlag_line();
		if( !this.checkErrorFlag_line(xinfo,4) ){ return 49911;}
		if( !this.checkErrorFlag_line(xinfo,3) ){ return 49921;}
		if( !this.checkErrorFlag_line(xinfo,2) ){ return 49931;}
		if( !this.checkErrorFlag_line(xinfo,1) ){ return 43401;}

		var linfo = this.owner.board.getLareaInfo();
		if( !this.checkOneArea(linfo) ){ return 43601;}

		if( !this.checkLcntCell_firefly(1) ){ return 40101;}

		if( !this.checkFireflyBeam() ){ return 49901;}

		return 0;
	},

	checkLcntCell_firefly : function(val){
		if(this.owner.board.lines.ltotal[val]==0){ return true;}
		return this.checkAllCell(function(cell){ return (cell.noNum() && cell.lcnt()==val);});
	},
	checkFireflyBeam : function(){
		var result = true, bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c], dir=cell.getQdir();
			if(cell.noNum() || dir===0){ continue;}
			if(!cell.getaddr().movedir(dir,1).getb().isLine()){
				if(this.checkOnly){ return false;}
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
		var qd1=cell1.getQdir(), qd2=(!cell2.isnull?cell2.getQdir():k.NDIR), qn=-1, err=0;
		if((dir1===qd1)^(dir2===qd2)){ qn=(dir1===qd1?cell1:cell2).getQnum();}

		if     (!cell2.isnull && (dir1===qd1) && (dir2===qd2)){ err=4;}
		else if(!cell2.isnull && (dir1!==qd1) && (dir2!==qd2)){ err=3;}
		else if(!cell2.isnull && qn>=0 && qn!==ccnt){ err=2; room.cells=[cell1];}
		else if( cell2.isnull){ err=1;}
		room.error = err;
	}
}
});

})();
