//
// パズル固有スクリプト部 はなれ組版 hanare.js v3.4.0
//
pzprv3.createCustoms('hanare', {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputedit : function(){
		if(this.mousestart || this.mousemove){
			this.inputborder();
		}
		else if(this.mouseend && this.notInputted()){
			this.inputqnum_hanare();
		}
	},
	inputplay : function(){
		if(this.mousestart){
			if     (this.btn.Left) { this.inputqnum_hanare();}
			else if(this.btn.Right){ this.inputDot();}
		}
		else if(this.mousemove){
			this.inputDot();
		}
	},

	inputqnum_hanare : function(){
		var cell = this.getcell();
		if(cell.isnull || cell===this.mouseCell){ return;}
		var result = cell.setNum_hanare(1);
		if(result!==null){
			this.inputData = (result===-1?0:1);
			this.mouseCell = cell;
			cell.draw();
		}
	},

	inputDot : function(){
		var cell = this.getcell();
		if(cell.isnull || cell===this.mouseCell || cell.getQnum()!==-1){ return;}

		if(this.inputData===null){ this.inputData=(cell.getQsub()===1?0:1);}

		cell.setAnum(-1);
		cell.setQsub(this.inputData===1?1:0);
		this.mouseCell = cell;
		cell.draw();
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,
	enableplay : true,

	keyinput : function(ca){
		this.key_inputqnum_hanare(ca);
	},
	key_inputqnum_hanare : function(ca){
		var cell=this.cursor.getTCC(), val=-1;

		if('0'<=ca && ca<='9'){ val = 1;}
		else if(ca==='-') { val = (this.owner.playmode?-2:-1);}
		else if(ca===' ') { val = -1;}
		else{ return;}

		cell.setNum_hanare(val);
		this.prev = cell;
		cell.draw();
	}
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	setNum_hanare : function(val){
		if(val>=0){
			var o=this.owner, rooms=o.board.rooms;
			val = rooms.getCntOfRoomByCell(this);
			if(val>this.maxnum){ return null;}

			var clist = rooms.getClistByCell(this), cell2=null;
			for(var i=0;i<clist.length;i++){
				if(clist[i].isNum()){ cell2=clist[i]; break;}
			}
			if(this===cell2){ val=(o.playmode?-2:-1);}
			else if(cell2!==null){
				if(o.playmode && cell2.qnum!==-1){ return null;}
				cell2.setNum(o.playmode?-2:-1);
				cell2.draw();
			}
			else{ /* c2===null */
				if(this.qsub===1){ val=-1;}
			}
		}
		this.setNum(val);
		return val;
	}
},
Board:{
	qcols : 8,
	qrows : 8,

	isborder : 1
},

AreaRoomManager:{
	enabled : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	setColors : function(){
		this.gridcolor = this.gridcolor_DLIGHT;
		this.dotcolor = this.dotcolor_PINK;
	},
	paint : function(){
		this.drawBGCells();
		this.drawGrid();

		this.drawDotCells(true);
		this.drawNumbers();

		this.drawBorders();

		this.drawChassis();

		this.drawCursor();
	},
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		this.decodeBorder();
		this.decodeNumber16();
	},
	pzlexport : function(type){
		this.encodeBorder();
		this.encodeNumber16();
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeBorderQues();
		this.decodeCellQnum();
		this.decodeCellAnumsub();
	},
	encodeData : function(){
		this.encodeBorderQues();
		this.encodeCellQnum();
		this.encodeCellAnumsub();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		var rinfo = this.owner.board.getRoomInfo();
		if( !this.checkDoubleNumber(rinfo) ){
			this.setAlert('1つの部屋に2つ以上の数字が入っています。','A room has plural numbers.'); return false;
		}

		if( !this.checkAnsNumberAndSize(rinfo) ){
			this.setAlert('数字と部屋の大きさが違います。','The size of the room is not equal to the number.'); return false;
		}

		if( !this.checkDiffNumber() ){
			this.setAlert('２つの数字の差とその間隔が正しくありません。','The distance of the paired numbers is not equal to the diff of them.'); return false;
		}

		if( !this.checkNoNumber(rinfo) ){
			this.setAlert('数字の入っていない部屋があります。','A room has no numbers.'); return false;
		}

		return true;
	},

	checkDiffNumber : function(){
		function eachcell(cell2){
			distance++;
			if(!cell2.isNum()){ /* nop */ }
			else if(!cell2.isValidNum(cell2)){ c=null;}
			else{
				if(cell!==null){
					if(Math.abs(num-cell2.getNum())!==distance){
						if(this.inAutoCheck){ return false;}
						cell.seterr(1);
						cell2.seterr(1)
						result = false;
					}
				}
				cell=cell2;
				num=cell2.getNum();
				distance=-1;
			}
		}

		var result = true, bd = this.owner.board;
		for(var bx=bd.minbx+1;bx<=bd.maxbx-1;bx+=2){
			var cell=null, num, distance;
			for(var by=bd.minby+1;by<=bd.maxby-1;by+=2){
				eachcell(bd.getc(bx,by));
			}
		}
		for(var by=bd.minby+1;by<=bd.maxby-1;by+=2){
			var cell=null, num, distance;
			for(var bx=bd.minbx+1;bx<=bd.maxbx-1;bx+=2){
				eachcell(bd.getc(bx,by));
			}
		}
		return result;
	},

	checkAnsNumberAndSize : function(rinfo){
		var result = true;
		for(var r=1;r<=rinfo.max;r++){
			var clist = rinfo.getclist(r), num = -1;
			for(var i=0;i<clist.length;i++){ if(clist[i].isNum()){ num=clist[i].getNum(); break;}}

			if( num!==-1 && num!==clist.length ){
				if(this.inAutoCheck){ return false;}
				clist.seterr(1);
				result = false;
			}
		}
		return result;
	}
}
});
