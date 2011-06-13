//
// パズル固有スクリプト部 はなれ組版 hanare.js v3.4.0
//
pzprv3.custom.hanare = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mousedown : function(){
		if     (k.editmode){ this.inputborder();}
		else if(k.playmode){
			if     (this.btn.Left) { this.inputqnum_hanare();}
			else if(this.btn.Right){ this.inputDot();}
		}
	},
	mouseup : function(){
		if(k.editmode && this.notInputted()){ this.inputqnum_hanare();}
	},
	mousemove : function(){
		if     (k.editmode){ this.inputborder();}
		else if(k.playmode){ this.inputDot();}
	},

	inputqnum_hanare : function(){
		var cc = this.cellid();
		if(cc===null || cc===this.mouseCell){ return;}
		var result = bd.setNum_hanare(cc,1);
		if(result!==null){
			this.inputData = (result===-1?0:1);
			this.mouseCell = cc;
			pc.paintCell(cc);
		}
	},

	inputDot : function(){
		var cc = this.cellid();
		if(cc===null || cc===this.mouseCell || bd.QnC(cc)!==-1){ return;}

		if(this.inputData===null){ this.inputData=(bd.QsC(cc)===1?0:1);}

		bd.sAnC(cc,-1);
		bd.sQsC(cc,(this.inputData===1?1:0));
		this.mouseCell = cc;
		pc.paintCell(cc);
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
		var cc=tc.getTCC(), val=-1;

		if('0'<=ca && ca<='9'){ val = 1;}
		else if(ca==='-') { val = (k.playmode?-2:-1);}
		else if(ca===' ') { val = -1;}
		else{ return;}

		bd.setNum_hanare(cc,val);
		this.prev = cc;
		pc.paintCell(cc);
	}
},

//---------------------------------------------------------
// 盤面管理系
Board:{
	qcols : 8,
	qrows : 8,

	isborder : 1,

	setNum_hanare : function(c,val){
		if(val>=0){
			val = this.areas.rinfo.getCntOfRoomByCell(c);
			if(val>this.maxnum){ return null;}

			var clist = this.areas.rinfo[this.areas.rinfo.id[c]].clist, c2=null;
			for(var i=0;i<clist.length;i++){
				if(this.isNum(clist[i])){ c2=clist[i]; break;}
			}
			if(c===c2){ val=(k.playmode?-2:-1);}
			else if(c2!==null){
				if(k.playmode && this.cell[c2].qnum!==-1){ return null;}
				this.setNum(c2,(k.playmode?-2:-1));
				pc.paintCell(c2);
			}
			else{ /* c2===null */
				if(this.cell[c].qsub===1){ val=-1;}
			}
		}
		this.setNum(c,val);
		return val;
	}
},

AreaManager:{
	hasroom : true
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

		var rinfo = bd.areas.getRoomInfo();
		if( !this.checkDoubleNumber(rinfo) ){
			this.setAlert('1つの部屋に2つ以上の数字が入っています。','A room has plural numbers.'); return false;
		}

		if( !this.checkNumberAndSize(rinfo) ){
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
		function eachcell(tc){
			distance++;
			if(!bd.isNum(tc)){ /* nop */ }
			else if(!bd.isValidNum(tc)){ c=null;}
			else{
				if(c!==null){
					if(Math.abs(num-bd.getNum(tc))!==distance){
						if(this.inAutoCheck){ return false;}
						bd.sErC([c,tc],1);
						result = false;
					}
				}
				c=tc;
				num=bd.getNum(tc);
				distance=-1;
			}
		}

		var result = true;
		for(var bx=bd.minbx+1;bx<=bd.maxbx-1;bx+=2){
			var c=null, num, distance;
			for(var by=bd.minby+1;by<=bd.maxby-1;by+=2){
				eachcell(bd.cnum(bx,by));
			}
		}
		for(var by=bd.minby+1;by<=bd.maxby-1;by+=2){
			var c=null, num, distance;
			for(var bx=bd.minbx+1;bx<=bd.maxbx-1;bx+=2){
				eachcell(bd.cnum(bx,by));
			}
		}
		return result;
	}
}
};
