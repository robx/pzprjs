//
// パズル固有スクリプト部 お家に帰ろう版 kaero.js v3.4.1
//
pzpr.classmgr.makeCustom(['kaero'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.owner.playmode){
			if(this.mousestart || this.mousemove){
				if     (this.btn.Left) { this.inputMoveLine();}
				else if(this.btn.Right){ this.inputpeke();}
			}
			else if(this.mouseend && this.notInputted()){
				this.inputlight();
			}
		}
		else if(this.owner.editmode){
			if(this.mousestart || this.mousemove){ this.inputborder();}
			else if(this.mouseend && this.notInputted()){ this.inputqnum();}
		}
	},

	inputlight : function(){
		var cell = this.getcell();
		if(cell.isnull){ return;}

		if     (cell.qsub===0){ cell.setQsub(this.btn.Left?1:2);}
		else if(cell.qsub===1){ cell.setQsub(this.btn.Left?2:0);}
		else if(cell.qsub===2){ cell.setQsub(this.btn.Left?0:1);}
		cell.draw();
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,

	keyinput : function(ca){
		this.key_inputqnum_kaero(ca);
	},
	key_inputqnum_kaero : function(ca){
		var cell = this.cursor.getc();

		if(ca.length>1){ return;}
		else if('a'<=ca && ca<='z'){
			var num = parseInt(ca,36)-10;
			var canum = cell.qnum;
			if     ((canum-1)%26===num && canum>0 && canum<=26){ cell.setQnum(canum+26);}
			else if((canum-1)%26===num){ cell.setQnum(-1);}
			else{ cell.setQnum(num+1);}
		}
		else if(ca==='-'){ cell.setQnum(cell.qnum!==-2?-2:-1);}
		else if(ca===' '){ cell.setQnum(-1);}
		else{ return;}

		this.prev = cell;
		cell.draw();
	}
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	maxnum : 52
},
CellList:{
	getDeparture : function(){ return this.map(function(cell){ return cell.base;}).notnull();}
},

Board:{
	qcols : 6,
	qrows : 6,

	hasborder : 1
},

LineManager:{
	isCenterLine : true
},

AreaRoomManager:{
	enabled : true
},
AreaLineManager:{
	enabled : true,
	moveline : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	gridcolor_type : "LIGHT",

	bgcellcolor_func : "qsub2",
	qsubcolor1 : "rgb(224, 224, 255)",
	qsubcolor2 : "rgb(255, 255, 144)",

	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();
		this.drawBorders();

		this.drawTip();
		this.drawPekes();
		this.drawDepartures();
		this.drawLines();

		this.drawCellSquare();
		this.drawNumbers_kaero();

		this.drawChassis();

		this.drawTarget();
	},

	drawCellSquare : function(){
		var g = this.vinc('cell_number_base', 'crispEdges', true);

		var rw = this.bw*0.7-1;
		var rh = this.bh*0.7-1;
		var isdrawmove = this.owner.execConfig('dispmove');

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i];
			g.vid = "c_sq_"+cell.id;
			if((!isdrawmove && cell.isDeparture()) || (isdrawmove && cell.isDestination())){
				if     (cell.error===1){ g.fillStyle = this.errbcolor1;}
				else if(cell.qsub ===1){ g.fillStyle = this.qsubcolor1;}
				else if(cell.qsub ===2){ g.fillStyle = this.qsubcolor2;}
				else                   { g.fillStyle = "white";}

				g.fillRectCenter(cell.bx*this.bw, cell.by*this.bh, rw, rh);
			}
			else{ g.vhide();}
		}
	},
	drawNumbers_kaero : function(){
		var g = this.vinc('cell_number', 'auto');
		var isdrawmove = this.owner.execConfig('dispmove');

		var option = {ratio:[0.85]};
		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i], px = cell.bx*this.bw, py = cell.by*this.bh;
			var num = (isdrawmove ? cell.base : cell).qnum, text = "";
			g.vid = "cell_text_"+cell.id;
			if(num!==-1){
				if     (num===-2)        { text = "?";}
				else if(num> 0&&num<= 26){ text+=(num+ 9).toString(36).toUpperCase();}
				else if(num>26&&num<= 52){ text+=(num-17).toString(36).toLowerCase();}
				else{ text+=num;}

				g.fillStyle = this.getCellNumberColor(cell);
				this.disptext(text, px, py, option);
			}
			else{ g.vhide();}
		}
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodeBorder();
		this.decodeKaero();
	},
	encodePzpr : function(type){
		this.encodeBorder();
		this.encodeKaero();
	},

	decodeKaero : function(){
		var c=0, a=0, bstr = this.outbstr, bd = this.owner.board;
		for(var i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i), obj=bd.cell[c];

			if     (this.include(ca,'0','9')){ obj.qnum = parseInt(ca,36)+27;}
			else if(this.include(ca,'A','Z')){ obj.qnum = parseInt(ca,36)-9; }
			else if(ca==="-"){ obj.qnum = parseInt(bstr.charAt(i+1),36)+37; i++;}
			else if(ca==="."){ obj.qnum = -2;}
			else if(this.include(ca,'a','z')){ c+=(parseInt(ca,36)-10);}

			c++;
			if(c>=bd.cellmax){ a=i+1; break;}
		}

		this.outbstr = bstr.substring(a);
	},
	encodeKaero : function(){
		var cm="", count=0, bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			var pstr = "", qnum = bd.cell[c].qnum;
			if     (qnum===-2){ pstr = ".";}
			else if(qnum>= 1 && qnum<=26){ pstr = ""+ (qnum+9).toString(36).toUpperCase();}
			else if(qnum>=27 && qnum<=36){ pstr = ""+ (qnum-27).toString(10);}
			else if(qnum>=37 && qnum<=72){ pstr = "-"+ (qnum-37).toString(36).toUpperCase();}
			else{ count++;}

			if(count===0){ cm += pstr;}
			else if(pstr||count===26){ cm+=((9+count).toString(36).toLowerCase()+pstr); count=0;}
		}
		if(count>0){ cm+=(9+count).toString(36).toLowerCase();}

		this.outbstr += cm;
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCellQnum();
		this.decodeCellQanssub();
		this.decodeBorderQues();
		this.decodeBorderLine();
	},
	encodeData : function(){
		this.encodeCellQnum();
		this.encodeCellQanssub();
		this.encodeBorderQues();
		this.encodeBorderLine();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.checkBranchLine() ){ return 'lnBranch';}
		if( !this.checkCrossLine() ){ return 'lnCross';}

		if( !this.checkConnectObject() ){ return 'nmConnected';}
		if( !this.checkLineOverLetter() ){ return 'laOnNum';}

		if( !this.checkSameObjectInRoom_kaero() ){ return 'bkPlNum';}
		if( !this.checkGatheredObject() ){ return 'bkSepNum';}
		if( !this.checkNoObjectBlock() ){ return 'bkNoNum';}

		if( !this.checkDisconnectLine() ){ return 'laIsolate';}

		return null;
	},

	// checkSameObjectInRoom()にbaseを付加した関数
	checkSameObjectInRoom_kaero : function(){
		var result = true;
		var rinfo = this.getRoomInfo();
		for(var r=1;r<=rinfo.max;r++){
			var clist = rinfo.area[r].clist, rnum=-1;
			var cbase = clist.getDeparture();
			for(var i=0;i<cbase.length;i++){
				var num=cbase[i].qnum;
				if(rnum===-1){ rnum=num;}
				else if(rnum!==num){
					if(this.checkOnly){ return false;}
					if(!this.owner.execConfig('dispmove')){ cbase.seterr(4);}
					clist.seterr(1);
					result = false;
				}
			}
		}
		return result;
	},

	// 同じ値であれば、同じ部屋に存在することを判定する
	checkGatheredObject : function(){
		var max=0, bd=this.owner.board;
		var rinfo = this.getRoomInfo();
		for(var c=0;c<bd.cellmax;c++){ var num=bd.cell[c].base.qnum; if(max<num){ max=num;} }
		for(var num=0;num<=max;num++){
			var clist = bd.cell.filter(function(cell){ return (num===cell.base.qnum);}), rid=null;
			for(var i=0;i<clist.length;i++){
				var r=rinfo.getRoomID(clist[i]);
				if(rid===null){ rid=r;}
				else if(r!==null && rid!==r){
					if(!this.owner.execConfig('dispmove')){ clist.getDeparture().seterr(4);}
					clist.seterr(1);
					return false;
				}
			}
		}
		return true;
	},

	checkNoObjectBlock : function(){
		return this.checkNoMovedObjectInRoom(this.getRoomInfo());
	}
},

FailCode:{
	bkNoNum : ["アルファベットのないブロックがあります。","A block has no letters."],
	bkPlNum : ["１つのブロックに異なるアルファベットが入っています。","A block has plural kinds of letters."],
	bkSepNum : ["同じアルファベットが異なるブロックに入っています。","Same kinds of letters are placed different blocks."]
}
});
