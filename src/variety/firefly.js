//
// パズル固有スクリプト部 ホタルビーム版 firefly.js
//
(function(pidlist, classbase){
	if(typeof module==='object' && module.exports){module.exports = [pidlist, classbase];}
	else{ pzpr.classmgr.makeCustom(pidlist, classbase);}
}(
['firefly'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputModes : {edit:['number','direc','clear'],play:['line','peke']},
	mouseinput_auto : function(){
		if(this.puzzle.playmode){
			if(this.btn==='left'){
				if(this.mousestart || this.mousemove){ this.inputLine();}
				else if(this.mouseend && this.notInputted()){ this.inputpeke();}
			}
			else if(this.btn==='right'){
				if(this.mousestart || this.mousemove){ this.inputpeke();}
			}
		}
		else if(this.puzzle.editmode){
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
		if(ca.match(/shift/)){ return false;}
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
	hasborder : 1
},
BoardExec:{
	adjustBoardData : function(key,d){
		this.adjustNumberArrow(key,d);
	}
},

LineGraph:{
	enabled : true,
	makeClist : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	hideHatena : true,

	irowake : true,

	gridcolor_type : "LIGHT",

	numbercolor_func : "fixed",

	fontsizeratio : 0.65,			/* 丸数字 */

	paint : function(){
		this.drawBGCells();
		this.drawDashedCenterLines();
		this.drawLines();

		this.drawPekes();

		this.drawCircledNumbers();
		this.drawFireflyDots();

		this.drawTarget();
	},

	drawFireflyDots : function(){
		var g = this.vinc('cell_firefly', 'auto');

		g.fillStyle = this.quescolor;
		var rsize  = this.cw*0.40;
		var rsize3 = this.cw*0.10;
		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i];

			g.vid = "c_cirdot_"+cell.id;
			if(cell.qnum!==-1 && cell.qdir!==cell.NDIR){
				var px = cell.bx*this.bw, py = cell.by*this.bh;
				switch(cell.qdir){
					case cell.UP: py-=(rsize-1); break;
					case cell.DN: py+=(rsize-1); break;
					case cell.LT: px-=(rsize-1); break;
					case cell.RT: px+=(rsize-1); break;
				}
				g.fillCircle(px, py, rsize3);
			}
			else{ g.vhide();}
		}
	},

	repaintParts : function(blist){
		this.range.cells = blist.cellinside();

		this.drawCircledNumbers();
		this.drawFireflyDots();
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
	checklist : [
		"checkLineExist+",
		"checkBranchConnectLine",
		"checkCrossConnectLine",

		"checkConnectPoints",
		"checkConnectCircles",
		"checkCurveCount",
		"checkLineShapeDeadend",
		"checkConnectAllNumber",

		"checkDeadendConnectLine+",

		"checkFireflyBeam"
	],

	checkFireflyBeam : function(){
		var bd = this.board;
		for(var c=0;c<bd.cell.length;c++){
			var cell = bd.cell[c], dir=cell.qdir;
			if(cell.noNum() || dir===0){ continue;}
			if(cell.reldirbd(dir,1).isLine()){ continue;}

			this.failcode.add("nmNoLine");
			if(this.checkOnly){ break;}
			cell.seterr(1);
		}
	},

	checkConnectPoints : function(){
		this.checkLineShape(function(path){
			var cell1=path.cells[0], cell2=path.cells[1];
			return (!cell2.isnull && path.dir1===cell1.qdir && path.dir2===cell2.qdir);
		}, "lcInvDirB");
	},
	checkConnectCircles : function(){
		this.checkLineShape(function(path){
			var cell1=path.cells[0], cell2=path.cells[1];
			return (!cell2.isnull && path.dir1!==cell1.qdir && path.dir2!==cell2.qdir);
		}, "lcInvDirW");
	},
	checkCurveCount : function(){
		this.checkLineShape(function(path){
			var cell1=path.cells[0], cell2=path.cells[1];
			var qn=((path.dir1===cell1.qdir) ? cell1 : cell2).qnum;
			return (!cell2.isnull && qn>=0 && qn!==path.ccnt);
		}, "lcCurveNe");
	}
},

FailCode:{
	nmNoLine : ["ホタルから線が出ていません。", "There is a lonely firefly."],
	lcInvDirB : ["黒点同士が線で繋がっています。","Points are connected each other."],
	lcInvDirW : ["白丸の、黒点でない部分どうしがくっついています。","Fireflies are connected without a line starting from point."],
	lcCurveNe : ["線の曲がった回数が数字と違っています。","The number of curves is different from a firefly's number."]
}
}));
