//
// パズル固有スクリプト部 縦横さん版 juosan.js
//
(function(pidlist, classbase){
	if(typeof module==='object' && module.exports){module.exports = [pidlist, classbase];}
	else{ pzpr.classmgr.makeCustom(pidlist, classbase);}
}(
['juosan'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputModes : {edit:['border','number','clear'],play:['bar']},
	mouseinput_auto : function(){
		if(this.puzzle.playmode){
			this.inputTateyoko();
		}
		else if(this.puzzle.editmode){
			if(this.mousestart || this.mousemove){ this.inputborder();}
			else if(this.mouseend && this.notInputted()){ this.inputqnum();}
		}
	},

	clickTateyoko : function(){
		var cell  = this.getcell();
		if(cell.isnull){ return;}

		cell.setQans((this.btn==='left'?{0:12,12:13,13:0}:{0:13,12:0,13:12})[cell.qans]);
		cell.draw();
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	maxnum : function(){
		return Math.min(999, this.room.clist.length);
	}
},
Board:{
	hasborder : 1,
	disable_subclear : true
},

BoardExec:{
	adjustBoardData : function(key,d){
		if(key & this.TURN){ // 回転だけ
			var tans = {0:0,12:13,13:12};
			var clist = this.board.cellinside(d.x1,d.y1,d.x2,d.y2);
			for(var i=0;i<clist.length;i++){
				var cell = clist[i];
				cell.setQans(tans[cell.qans]);
			}
		}
	}
},

AreaRoomGraph:{
	enabled : true,
	hastop : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	gridcolor_type : "LIGHT",
	numbercolor_func : "fixed",

	fontsizeratio : 0.45,
	textoption : {position:5}, /* this.TOPLEFT */

	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();

		this.drawTateyokos();

		this.drawQuesNumbers();
		this.drawBorders();

		this.drawChassis();

		this.drawTarget();
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodeBorder();
		this.decodeRoomNumber16();
	},
	encodePzpr : function(type){
		this.encodeBorder();
		this.encodeRoomNumber16();
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeAreaRoom();
		this.decodeCellQnum();
		this.decodeCellBar();
	},
	encodeData : function(){
		this.encodeAreaRoom();
		this.encodeCellQnum();
		this.encodeCellBar();
	},

	decodeCellBar : function(){
		this.decodeCell( function(cell,ca){
			if     (ca==="1"){ cell.qans = 12;}
			else if(ca==="2"){ cell.qans = 13;}
		});
	},
	encodeCellBar : function(){
		this.encodeCell( function(cell){
			if(cell.ques!==1){
				if     (cell.qans===0) { return "0 ";}
				else if(cell.qans===12){ return "1 ";}
				else if(cell.qans===13){ return "2 ";}
			}
			return ". ";
		});
	}
},
//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checklist : [
		"checkParallelBarCount",
		"checkMajorityBarOver",
		"checkMajorityBarLack",
		"checkEmptyCell_juosan+"
	],

	checkParallelBarCount : function(){
		this.checkRowsColsSeparate(this.isParallelCount, function(cell){ return cell.qans;}, "baParaGe3");
	},
	checkRowsColsSeparate : function(evalfunc, categoryfunc, code){
		var result = true, bd = this.board, info;
		allloop: do{
			/* 横方向サーチ */
			info = {isvert:false};
			for(var by=1;by<=bd.maxby;by+=2){
				for(var bx=1;bx<=bd.maxbx;bx+=2){
					var val = categoryfunc(bd.getc(bx,by)), tx = bx;
					while((tx+2<bd.maxbx) && (categoryfunc(bd.getc(tx+2,by))===val)){ tx+=2;}
					if(!evalfunc.call(this, bd.cellinside(bx,by,tx,by), info)){
						result = false;
						if(this.checkOnly){ break allloop;}
					}
					bx = tx; /* 次のループはbx=tx+2 */
				}
			}
			/* 縦方向サーチ */
			info = {isvert:true};
			for(var bx=1;bx<=bd.maxbx;bx+=2){
				for(var by=1;by<=bd.maxby;by+=2){
					var val = categoryfunc(bd.getc(bx,by)), ty = by;
					while((ty+2<bd.maxby) && (categoryfunc(bd.getc(bx,ty+2))===val)){ ty+=2;}
					if(!evalfunc.call(this, bd.cellinside(bx,by,bx,ty), info)){
						result = false;
						if(this.checkOnly){ break allloop;}
					}
					by = ty; /* 次のループはbx=ty+2 */
				}
			}
		} while(0);

		if(!result){
			this.failcode.add(code);
			this.board.cell.setnoerr();
		}
		return result;
	},
	isParallelCount : function(clist, info){
		if     (clist[0].qans===0)                 { return true;}
		else if(clist[0].qans===12 &&  info.isvert){ return true;}
		else if(clist[0].qans===13 && !info.isvert){ return true;}
		else if(clist.length>=3){ clist.seterr(4); return false;}
		return true;
	},

	checkMajorityBarOver : function(){ this.checkMajorityBarCount(true,  "bkMajorBarGt");},
	checkMajorityBarLack : function(){ this.checkMajorityBarCount(false, "bkMajorBarLt");},
	checkMajorityBarCount : function(isover, code){
		var result = true, rooms = this.board.roommgr.components;
		for(var r=0;r<rooms.length;r++){
			var area = rooms[r];
			if(!area.top.isValidNum()){ continue;}
			var clist = area.clist, vcount=0, hcount=0, count=0;
			for(var i=0;i<clist.length;i++){
				if     (clist[i].qans===12){ vcount++;}
				else if(clist[i].qans===13){ hcount++;}
			}
			count = (vcount>hcount ? vcount : hcount);
			if((area.top.qnum===count) || (isover===(count<=area.top.qnum))){ continue;}

			result = false;
			if(this.checkOnly){ break;}
			if     (vcount>hcount){ clist.filter(function(cell){ return cell.qans===12;}).seterr(4);}
			else if(vcount<hcount){ clist.filter(function(cell){ return cell.qans===13;}).seterr(4);}
		}
		if(!result){
			this.failcode.add(code);
			this.board.cell.setnoerr();
		}
	},

	checkEmptyCell_juosan : function(){
		this.checkAllCell(function(cell){ return (cell.qans===0);}, "ceNoBar");
	}
},

FailCode:{
	ceNoBar : ["何も入っていないマスがあります。","There is an empty cell."],
	baParaGe3 : ["縦棒か横棒が3マス以上並んでいます。","There are at least there vertical or horizonal bars in parallel."],
	bkMajorBarGt : ["縦棒か横棒の多い方の数が部屋の数字より多いです。","The number of majority of vartial or horizonal bars is grater than the number of the area."],
	bkMajorBarLt : ["縦棒か横棒の多い方の数が部屋の数字より少ないです。","The number of majority of vartial or horizonal bars is less than the number of the area."]
}
}));
