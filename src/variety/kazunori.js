//
// パズル固有スクリプト部 かずのりのへや版 kazunori.js
//
(function(pidlist, classbase){
	if(typeof module==='object' && module.exports){module.exports = [pidlist, classbase];}
	else{ pzpr.classmgr.makeCustom(pidlist, classbase);}
}(
['kazunori'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputModes : {edit:['border','number'],play:['number','clear']},
	mouseinput_number: function(){
		if(this.mousestart){
			if(this.puzzle.editmode){ this.inputmark_mouseup();}
			else                    { this.inputqnum();}
		}
	},
	mouseinput_auto : function(){
		if(this.puzzle.playmode){
			if(this.mousestart){ this.inputqnum();}
		}
		else if(this.puzzle.editmode){
			if(this.mousestart || this.mousemove){
				if(this.btn==='left'){ this.inputborder();}
			}
			else if(this.mouseend && this.notInputted()){
				this.inputmark_mouseup();
			}
		}
	},

	inputmark_mouseup : function(){
		var pos = this.getpos(0.33);
		if(!pos.isinside()){ return;}

		if(!this.cursor.equals(pos)){
			this.setcursor(pos);
			pos.draw();
		}
		else{
			var border = pos.getb();
			if(border.isnull){ return;}

			var qn=border.qnum, max=border.maxnum();
			if(this.btn==='left'){
				if     (qn===-1){ border.setQnum(-2);}
				else if(qn===-2){ border.setQnum( 2);}
				else if(qn>=max){ border.setQnum(-1);}
				else{ border.setQnum(qn+1);}
			}
			else if(this.btn==='right'){
				if     (qn===-1){ border.setQnum(max);}
				else if(qn=== 2){ border.setQnum(-2);}
				else if(qn===-2){ border.setQnum(-1);}
				else{ border.setQnum(qn-1);}
			}
			border.draw();
		}
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,
	enableplay : true,
	moveTarget : function(ca){
		if     (this.puzzle.editmode){ return this.moveTBorder(ca);}
		else if(this.puzzle.playmode){ return this.moveTCell(ca);}
		return false;
	},

	keyinput : function(ca){
		if     (this.puzzle.editmode){ this.key_inputmark(ca);}
		else if(this.puzzle.playmode){ this.key_inputqnum(ca);}
	},
	key_inputmark : function(ca){
		var border = this.cursor.getb();
		if(border.isnull){ return;}

		if     (ca===' '){ border.setQnum(-1);}
		else if(ca==='-'){ border.setQnum(border.qnum!==-2 ? -2 : -1);}
		else if('0'<=ca && ca<='9'){
			var num = +ca, cur = border.qnum;
			var max = border.maxnum();
			if(this.prev===border && cur>0 && cur*10+num<=max){ num = cur*10+num;}
			if(num>0 && num<=max){ border.setQnum(num);}
		}
		else{ return;}

		this.prev = border;
		border.draw();
	}
},

TargetCursor:{
	adjust_modechange : function(){
		this.bx -= ((this.bx+1)%2);
		this.by -= ((this.by+1)%2);
	}
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	enableSubNumberArray : true,
	maxnum : function(){
		return ((this.room.clist.length+1)/2)|0;
	}
},
Border:{
	maxnum : function(){
		return (this.sidecell[0].maxnum()+this.sidecell[1].maxnum())|0;
	}
},
Board:{
	cols : 8,
	rows : 8,

	hasborder : 1,
	disable_subclear : true,

	addExtraInfo : function(){
		this.norigraph = this.addInfoList(this.klass.AreaNoriGraph);
	}
},
BoardExec:{
	adjustBoardData : function(key,d){
		this.adjustBorderArrow(key,d);
	}
},

AreaRoomGraph:{
	enabled : true
},
"AreaNoriGraph:AreaGraphBase":{
	enabled : true,
	relation : {'cell.anum':'node', 'border.ques':'separator'},
	setComponentRefs : function(obj, component){ obj.nori = component;},
	getObjNodeList   : function(nodeobj){ return nodeobj.norinodes;},
	resetObjNodeList : function(nodeobj){ nodeobj.norinodes = [];},

	isnodevalid : function(cell){ return (cell.anum>0);},
	isedgevalidbylinkobj : function(border){
		return (border.sideobj[0].anum===border.sideobj[1].anum) && !border.isBorder();
	},
	isedgevalidbynodeobj : function(cell1, cell2){
		return (cell1.anum===cell2.anum) && !this.board.getb(((cell1.bx+cell2.bx)>>1), ((cell1.by+cell2.by)>>1)).isBorder();
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	hideHatena : true,

	gridcolor_type : "LIGHT",

	paint : function(){
		this.drawBGCells();
		this.drawTargetSubNumber();
		this.drawGrid();
		this.drawBorders();

		this.drawQuesNumbersBD();
		this.drawSubNumbers();
		this.drawAnsNumbers();

		this.drawChassis();

		this.drawTarget_minarism();
	},

	drawQuesNumbersBD : function(){
		var g = this.vinc('border_nums', 'auto', true);

		var csize = this.cw*0.27;

		g.lineWidth = 1;
		g.strokeStyle = this.quescolor;

		var option = {ratio:0.45};
		var blist = this.range.borders;
		for(var i=0;i<blist.length;i++){
			var border=blist[i], px = border.bx*this.bw, py = border.by*this.bh;

			// ○の描画
			g.vid = "b_cp_"+border.id;
			if(border.qnum!==-1){
				g.fillStyle = (border.error===1 ? this.errbcolor1 : "white");
				g.shapeCircle(px, py, csize);
			}
			else{ g.vhide();}

			// 数字の描画
			g.vid = "border_text_"+border.id;
			if(border.qnum>0){
				g.fillStyle = this.quescolor;
				this.disptext(""+border.qnum, px, py, option);
			}
			else{ g.vhide();}
		}
	},

	drawTarget_minarism : function(){
		this.drawCursor(this.puzzle.playmode);
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(){
		this.decodeBorder();
		this.decodeBorderNumber();
	},
	encodePzpr : function(){
		this.encodeBorder();
		this.encodeBorderNumber();
	},

	decodeBorderNumber : function(){
		var id=0, bstr = this.outbstr, bd=this.board;
		for(var i=0;i<bstr.length;i++){
			var border = bd.border[id], ca = bstr.charAt(i);

			if     (this.include(ca,'0','9')||this.include(ca,'a','f')){ border.qnum = parseInt(ca,16);}
			else if(ca==="-"){ border.qnum = parseInt(bstr.substr(i+1,2),16); i+=2;}
			else if(ca==="."){ border.qnum = -2;}
			else if(this.include(ca,'g','z')){ id+=(parseInt(ca,36)-16);}

			id++;
			if(!bd.border[id]){ break;}
		}
		this.outbstr = bstr.substr(i+1);
	},
	encodeBorderNumber : function(){
		var cm="", count=0, bd=this.board;
		for(var id=0,max=bd.border.length;id<max;id++){
			var pstr="", border=bd.border[id], qnum=border.qnum;

			if     (qnum===-2)         { pstr = ".";}
			else if(qnum>= 0&&qnum< 16){ pstr = ""+ qnum.toString(16);}
			else if(qnum>=16&&qnum<256){ pstr = "-"+qnum.toString(16);}
			else{ count++;}

			if(count===0){ cm += pstr;}
			else if(pstr || count===20){ cm+=((15+count).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm+=(15+count).toString(36);}

		this.outbstr += cm;
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeBorder( function(border,ca){
			if     (ca==="|"){ border.ques = 1;}
			else if(ca==="-"){ border.ques = 1; border.qnum = -2;}
			else if(ca==="!"){ border.qnum = -2;}
			else if(ca!=="."){
				if(ca.charAt(0)!=="!"){ border.ques = 1;}else{ ca = ca.substr(1);}
				border.qnum = +ca;
			}
		});
		this.decodeCellAnumsub();
	},
	encodeData : function(){
		this.encodeBorder( function(border){
			if     (border.qnum>=  0){ return (border.ques===1?"":"!")+border.qnum+" ";}
			else if(border.qnum===-2){ return (border.ques===1?"- ":"! ");}
			else                     { return (border.ques===1?"| ":". ");}
		});
		this.encodeCellAnumsub();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checklist : [
		"checkBlockEvenSize", // 問題確認用
		"check2x2SameNumber",
		"checkOverSaturatedNumberInRoom",
		"checkSumOfNumber",
		"checkNoNumCell+",
		"checkSingleNoriSize"
	],

	checkBlockEvenSize : function(){
		this.checkAllArea(this.board.roommgr, function(w,h,a,n){ return ((a&1)===0);}, "bkOddSize");
	},
	checkSingleNoriSize : function(){
		this.checkAllArea(this.board.norigraph, function(w,h,a,n){ return (a>=2);}, "nmNotLink");
	},
	checkSumOfNumber : function(){
		var boardborder = this.board.border;
		for(var id=0;id<boardborder.length;id++){
			var border = boardborder[id], cell1 = border.sidecell[0], cell2 = border.sidecell[1];
			if(border.qnum<=0){ continue;}
			var num1 = cell1.anum, num2 = cell2.anum;
			if(num1===-1 || num2===-1 || border.qnum===num1+num2){ continue;}

			this.failcode.add("nmSumNe");
			if(this.checkOnly){ break;}
			border.seterr(1);
			cell1.seterr(1);
			cell2.seterr(1);
		}
	},
	check2x2SameNumber : function(){
		var bd = this.board;
		allloop:
		for(var c=0;c<bd.cell.length;c++){
			var cell = bd.cell[c], bx=cell.bx, by=cell.by;
			if(bx>=bd.maxbx-1 || by>=bd.maxby-1){ continue;}

			var clist = bd.cellinside(bx, by, bx+2, by+2);
			if(clist[0].anum<=0){ continue;}
			for(var i=1;i<4;i++){
				if(clist[0].anum!==clist[i].anum){ continue allloop;}
			}

			this.failcode.add("nmSame2x2");
			if(this.checkOnly){ break;}
			clist.seterr(1);
		}
	},
	checkOverSaturatedNumberInRoom : function(){
		var rooms = this.board.roommgr.components;
		for(var r=0;r<rooms.length;r++){
			var clist = rooms[r].clist;
			var d = [], max = clist[0].getmaxnum(), min = clist[0].getminnum();
			for(var n=min;n<=max;n++){ d[n]=0;}
			for(var i=0;i<clist.length;i++){ if(clist[i].anum>=min){ d[clist[i].anum]++;} }
			var clist2 = clist.filter(function(cell){ return (d[cell.anum]>=3);});
			if(clist2.length===0){ continue;}

			this.failcode.add("bkSameNumGt2");
			if(this.checkOnly){ break;}
			clist2.seterr(1);
		}
	}
},

FailCode:{
	nmSame2x2    : ["同じ数字が2x2のかたまりになっています。","There is a 2x2 block of the same number."],
	nmSumNe      : ["丸付き数字とその両側の数字の和が一致していません。", "The sum between two adjacent cells is not equal to the number on circle."],
	nmNotLink    : ["同じ数字が部屋の中でつながっていません。","A number doesn't link to other cells in the room."],
	bkSameNumGt2 : ["部屋の同じ数字が3つ以上入っています","The room has three or more same numbers."],
	bkOddSize    : ["部屋のサイズが奇数になっています。", "The size of the room is not even."]
}
}));
