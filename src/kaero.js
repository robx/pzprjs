//
// パズル固有スクリプト部 お家に帰ろう版 kaero.js v3.4.0
//
pzprv3.createCustoms('kaero', {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.owner.playmode){
			if(this.mousestart || this.mousemove){
				if     (this.btn.Left) { this.inputLine();}
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

		if     (cell.getQsub()===0){ cell.setQsub(this.btn.Left?1:2);}
		else if(cell.getQsub()===1){ cell.setQsub(this.btn.Left?2:0);}
		else if(cell.getQsub()===2){ cell.setQsub(this.btn.Left?0:1);}
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
		var cell = this.cursor.getTCC();

		if('a'<=ca && ca<='z'){
			var num = parseInt(ca,36)-10;
			var canum = cell.getQnum();
			if     ((canum-1)%26==num && canum>0 && canum<=26){ cell.setQnum(canum+26);}
			else if((canum-1)%26==num){ cell.setQnum(-1);}
			else{ cell.setQnum(num+1);}
		}
		else if(ca=='-'){ cell.setQnum(cell.getQnum()!==-2?-2:-1);}
		else if(ca==' '){ cell.setQnum(-1);}
		else{ return;}

		this.prev = cell;
		cell.draw();
	}
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	maxnum : 52,

	// 正答判定用
	base : null
},

Board:{
	qcols : 6,
	qrows : 6,

	isborder : 1
},

LineManager:{
	isCenterLine : true
},

AreaRoomManager:{
	enabled : true
},
AreaLineManager:{
	enabled : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	setColors : function(){
		this.gridcolor = this.gridcolor_LIGHT;
		this.qsubcolor1 = "rgb(224, 224, 255)";
		this.qsubcolor2 = "rgb(255, 255, 144)";
		this.setBGCellColorFunc('qsub2');
	},
	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();
		this.drawBorders();

		this.drawTip();
		this.drawPekes();
		this.drawLines();

		this.drawCellSquare();
		this.drawNumbers_kaero();

		this.drawChassis();

		this.drawTarget();
	},

	drawCellSquare : function(){
		var g = this.vinc('cell_number_base', 'crispEdges');

		var rw = this.bw*0.7-1;
		var rh = this.bh*0.7-1;
		var header = "c_sq_";

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i];
			if(cell.qnum!=-1){
				if     (cell.error===1){ g.fillStyle = this.errbcolor1;}
				else if(cell.qsub ===1){ g.fillStyle = this.qsubcolor1;}
				else if(cell.qsub ===2){ g.fillStyle = this.qsubcolor2;}
				else                   { g.fillStyle = "white";}

				if(this.vnop(header+cell.id,this.FILL)){
					var px = cell.bx*this.bw, py = cell.by*this.bh;
					g.fillRect(px-rw, py-rh, rw*2+1, rh*2+1);
				}
			}
			else{ this.vhide(header+cell.id);}
		}
	},
	drawNumbers_kaero : function(){
		var g = this.vinc('cell_number', 'auto');

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i], key='cell_'+cell.id, num = cell.qnum;
			if(num!==-1){
				var color = (cell.error===0 ? this.fontcolor : this.fontErrcolor);

				var text="";
				if     (num==-2)         { text ="?";}
				else if(num> 0&&num<= 26){ text+=(num+ 9).toString(36).toUpperCase();}
				else if(num>26&&num<= 52){ text+=(num-17).toString(36).toLowerCase();}
				else{ text+=num;}

				var px = cell.bx*this.bw, py = cell.by*this.bh;
				this.dispnum(key, 1, text, 0.85, color, px, py);
			}
			else{ this.hideEL(key);}
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
			if     (qnum==-2){ pstr = ".";}
			else if(qnum>= 1 && qnum<=26){ pstr = ""+ (qnum+9).toString(36).toUpperCase();}
			else if(qnum>=27 && qnum<=36){ pstr = ""+ (qnum-27).toString(10);}
			else if(qnum>=37 && qnum<=72){ pstr = "-"+ (qnum-37).toString(36).toUpperCase();}
			else{ count++;}

			if(count==0){ cm += pstr;}
			else if(pstr||count==26){ cm+=((9+count).toString(36).toLowerCase()+pstr); count=0;}
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
		if( !this.checkLcntCell(3) ){ return 40201;}
		if( !this.checkLcntCell(4) ){ return 40301;}

		var linfo = this.owner.board.getLareaInfo();
		if( !this.checkDoubleObject(linfo) ){ return 30015;}
		if( !this.checkLineOverLetter() ){ return 43101;}

		var rinfo = this.owner.board.getRoomInfo();
		this.owner.board.searchMovedPosition(linfo);

		if( !this.checkSameObjectInRoom_kaero(rinfo) ){ return 30031;}
		if( !this.checkGatheredObject(rinfo) ){ return 30401;}
		if( !this.checkNoMovedObjectInRoom(rinfo) ){ return 30411;}

		if( !this.checkDisconnectLine(linfo) ){ return 43201;}

		return 0;
	},

	// checkSameObjectInRoom()にbaseを付加した関数
	checkSameObjectInRoom_kaero : function(rinfo){
		var result=true;
		for(var r=1;r<=rinfo.max;r++){
			var clist = rinfo.getclist(r), rnum=-1;
			for(var i=0;i<clist.length;i++){
				var cell=clist[i], num=cell.base.qnum;
				if(num===-1 || rnum===num){ continue;}
				else if(rnum===-1){ rnum=num; continue;}

				if(this.checkOnly){ return false;}
				clist.seterr(1);
				for(var i=0;i<clist.length;i++){
					var cell2 = clist[i].base;
					if(!cell2.isnull && cell2.error===0){ cell2.seterr(4);}
				}
				result = false;
			}
		}
		return result;
	},

	// 同じ値であれば、同じ部屋に存在することを判定する
	checkGatheredObject : function(rinfo){
		var max=0, bd=this.owner.board;
		for(var c=0;c<bd.cellmax;c++){ var num=bd.cell[c].base.qnum; if(max<num){ max=num;} }
		for(var num=0;num<=max;num++){
			var clist = bd.cell.filter(function(cell){ return (num===cell.base.qnum);}), rid=null;
			for(var i=0;i<clist.length;i++){
				var cell=clist[i], r=rinfo.getRoomID(cell);
				if(r===null || rid===r){ continue;}
				else if(rid===null){ rid=r; continue;}
				
				clist.seterr(1);
				for(var i=0;i<clist.length;i++){
					var cell2 = clist[i].base;
					if(!cell2.isnull && cell2.error===0){ cell2.seterr(4);}
				}
				return false;
			}
		}
		return true;
	}
}
});
