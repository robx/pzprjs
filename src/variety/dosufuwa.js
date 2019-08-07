//
// パズル固有スクリプト部 ドッスンフワリ版 dosufuwa.js
//
(function(pidlist, classbase){
	if(typeof module==='object' && module.exports){module.exports = [pidlist, classbase];}
	else{ pzpr.classmgr.makeCustom(pidlist, classbase);}
}(
['dosufuwa'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputModes : {edit:['shade','border'],play:['balloon','ironball','objblank']},
	mouseinput : function(){ // オーバーライド
		if(this.puzzle.playmode && this.inputMode!=='auto'){
			this.inputcell_dosufuwa();
		}
		else if(this.inputMode==='shade'){ if(this.mousestart){ this.inputblock();}}
		else{ this.common.mouseinput.call(this);}
	},
	mouseinput_auto : function(){
		if(this.puzzle.playmode){
			if(this.mousestart || this.mousemove){ this.inputcell_dosufuwa();}
		}
		else if(this.puzzle.editmode){
			if(this.mousestart || this.mousemove){ this.inputborder();}
			else if(this.mouseend && this.notInputted()){ this.inputblock();}
		}
	},

	inputcell_dosufuwa : function(){
		var cell = this.getcell();
		if(cell.isnull || cell===this.mouseCell || cell.ques===1){ return;}

		if(this.inputData===null){
			if(this.inputMode==='balloon'){
				this.inputData = (cell.qans!==1?1:0);
			}
			else if(this.inputMode==='ironball'){
				this.inputData = (cell.qans!==2?1:0);
			}
			else if(this.inputMode==='objblank'){
				this.inputData = (cell.qsub!==1?-2:0);
			}
			else if(this.btn==='left'){
				if     (cell.qans===1){ this.inputData=2;}
				else if(cell.qans===2){ this.inputData=-2;}
				else if(cell.qsub===1){ this.inputData=0;}
				else{ this.inputData=1;}
			}
			else if(this.btn==='right'){
				if     (cell.qans===1){ this.inputData=0;}
				else if(cell.qans===2){ this.inputData=1;}
				else if(cell.qsub===1){ this.inputData=2;}
				else{ this.inputData=-2;}
			}
		}
		else if((this.inputData===1 && this.mouseCell.getdir(cell,2)!==cell.UP) ||
				(this.inputData===2 && this.mouseCell.getdir(cell,2)!==cell.DN)){ return;}

		if(this.inputData>=0){
			cell.setQans(this.inputData);
			cell.setQsub(0);
		}
		else{
			cell.setQans(0);
			cell.setQsub(1);
		}
		cell.draw();
		this.mouseCell = cell;
	},
	inputblock : function(){
		var cell = this.getcell();
		if(cell.isnull){ return;}

		cell.setQues(cell.ques===0?1:0);
		cell.setQans(0);
		cell.setQsub(0);
		cell.draw();
	}
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	posthook : {
		qans : function(num){ this.room.checkAutoCmp();}
	}
},
Border:{
	isBorder : function(){
		return this.isnull || this.ques>0 || !!(this.sidecell[0].ques===1 || this.sidecell[1].ques===1);
	}
},
CellList:{
	checkCmp : function(){
		var bcnt=0, icnt=0;
		for(var i=0;i<this.length;i++){
			if(this[i].qans===1){ bcnt++;}
			else if(this[i].qans===2){ icnt++;}
		}
		return (bcnt===1 && icnt===1);
	}
},
Board:{
	hasborder : 1
},

AreaRoomGraph:{
	enabled : true,
	isnodevalid : function(cell){ return (cell.ques===0);}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	gridcolor_type : "LIGHT",

	autocmp : 'room',

	qanscolor : "black",
	bgcellcolor_func : "qcmp",

	paint : function(){
		this.drawBGCells();
		this.drawGrid();
		this.drawQuesCells();

		this.drawDotCells(false);
		this.drawCircles();

		this.drawBorders();

		this.drawChassis();
	},

	getCircleStrokeColor : function(cell){
		if(cell.qans===1){
			return (cell.error===1 ? this.errcolor1 : (!cell.trial ? this.shadecolor : this.trialcolor));
		}
		return null;
	},
	getCircleFillColor : function(cell){
		if(cell.qans===1){
			return (cell.error===1 ? this.errbcolor1 : "white");
		}
		else if(cell.qans===2){
			return (cell.error===1 ? this.errcolor1 : (!cell.trial ? this.shadecolor : this.trialcolor));
		}
		return null;
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodeBorder();
		this.decodeBlockCell();
	},
	encodePzpr : function(type){
		this.encodeBorder_makaro();
		this.encodeBlockCell();
	},

	// 元ネタはencode/decodeCrossMark
	decodeBlockCell : function(){
		var cc=0, i=0, bstr = this.outbstr, bd = this.board;
		for(i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i);

			if(this.include(ca,"0","9")||this.include(ca,"a","z")){
				cc += parseInt(ca,36);
				if(bd.cell[cc]){ bd.cell[cc].ques = 1;}
			}
			else if(ca === '.'){ cc+=35;}

			cc++;
			if(!bd.cell[cc]){ i++; break;}
		}
		this.outbstr = bstr.substr(i);
	},
	encodeBlockCell : function(){
		var cm="", count=0, bd = this.board;
		for(var c=0;c<bd.cell.length;c++){
			var pstr="";
			if(bd.cell[c].ques===1){ pstr = ".";}
			else{ count++;}

			if(pstr){ cm += count.toString(36); count=0;}
			else if(count===36){ cm += "."; count=0;}
		}
		//if(count>0){ cm += count.toString(36);}

		this.outbstr += cm;
	},

	encodeBorder_makaro : function(){
		/* 同じ見た目のパズルにおけるURLを同じにするため、          */
		/* 一時的にborder.ques=1にしてURLを出力してから元に戻します */
		var bd = this.board, sv_ques = [];
		for(var id=0;id<bd.border.length;id++){
			sv_ques[id] = bd.border[id].ques;
			bd.border[id].ques = (bd.border[id].isBorder() ? 1 : 0);
		}

		this.encodeBorder();

		for(var id=0;id<bd.border.length;id++){
			bd.border[id].ques = sv_ques[id];
		}
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeAreaRoom();
		this.decodeCellQanssub();
	},
	encodeData : function(){
		this.encodeAreaRoom();
		this.encodeCellQanssub();
	},

	// オーバーライド
	decodeAreaRoom_com : function(isques){
		var bd = this.board;
		this.readLine();
		var items = this.getItemList(bd.rows);
		this.rdata2Border(isques, items);

		for(var c=0;c<bd.cell.length;c++){
			if(items[c]==='#'){ bd.cell[c].ques = 1;}
		}

		bd.roommgr.rebuild();
	},
	encodeAreaRoom_com : function(isques){
		var bd = this.board;
		bd.roommgr.rebuild();
		var rooms = bd.roommgr.components;
		this.writeLine(rooms.length);
		var data = '';
		for(var c=0;c<bd.cell.length;c++){
			var roomid = rooms.indexOf(bd.cell[c].room);
			data += (""+(roomid>=0 ? roomid : "#")+" ");
			if((c+1)%bd.cols===0){
				this.writeLine(data);
				data = '';
			}
		}
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checklist : [
		"checkOverUnshadeCircle",
		"checkOverShadeCircle",
		"checkBalloonIsTop",
		"checkIronBallIsBottom",
		"checkNoUnshadeCircle+",
		"checkNoShadeCircle+"
	],

	checkOverUnshadeCircle : function(){
		this.checkAllBlock(this.board.roommgr, function(cell){ return cell.qans===1;}, function(w,h,a,n){ return (a<=1);}, "bkUCGe2");
	},
	checkOverShadeCircle : function(){
		this.checkAllBlock(this.board.roommgr, function(cell){ return cell.qans===2;}, function(w,h,a,n){ return (a<=1);}, "bkSCGe2");
	},
	checkNoUnshadeCircle : function(){
		this.checkAllBlock(this.board.roommgr, function(cell){ return cell.qans===1;}, function(w,h,a,n){ return (a>=1);}, "bkNoUC");
	},
	checkNoShadeCircle : function(){
		this.checkAllBlock(this.board.roommgr, function(cell){ return cell.qans===2;}, function(w,h,a,n){ return (a>=1);}, "bkNoSC");
	},

	checkBalloonIsTop : function(){
		this.checkAllCell( function(cell){ var cell2 = cell.adjacent.top; return (cell.qans===1 && !cell2.isnull && cell2.ques!==1 && cell2.qans!==1);}, "cuNotTop" );
	},
	checkIronBallIsBottom : function(){
		this.checkAllCell( function(cell){ var cell2 = cell.adjacent.bottom; return (cell.qans===2 && !cell2.isnull && cell2.ques!==1 && cell2.qans!==2);}, "csNotBottom" );
	}
},

FailCode:{
	bkUCGe2 : ["1つの領域に風船が複数入っています。","An area has two or more balloons."],
	bkSCGe2 : ["1つの領域に鉄球が複数入っています。","An area has two or more iron balls."],
	bkNoUC  : ["風船が入っていない領域があります。","An area has no balloon."],
	bkNoSC  : ["鉄球が入っていない領域があります。","An area has no iron ball."],
	cuNotTop    : ["風船の上に風船や黒マスがありません。","A balloon is not on the top of the row or under another balloon."],
	csNotBottom : ["鉄球の下の鉄球や黒マスがありません。","An iron ball is not on the bottom of the row or on another iron ball."]
}
}));
