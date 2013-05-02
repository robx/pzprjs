//
// パズル固有スクリプト部 波及効果・コージュン版 ripple.js v3.4.0
//
pzprv3.createCustoms('ripple', {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.owner.playmode){
			if(this.mousestart){ this.inputqnum();}
		}
		else if(this.owner.editmode){
			if(this.mousestart || (this.mousemove && this.btn.Left)){
				this.inputborder();
			}
			else if(this.mouseend && this.notInputted()){
				this.inputqnum();
			}
		}
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,
	enableplay : true
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	nummaxfunc : function(){
		return this.owner.board.rooms.getCntOfRoomByCell(this);
	}
},
Board:{
	isborder : 1
},
"Board@cojun":{
	qcols : 8,
	qrows : 8
},

AreaRoomManager:{
	enabled : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	setColors : function(){
		this.gridcolor = this.gridcolor_DLIGHT;
	},
	paint : function(){
		this.drawBGCells();
		this.drawGrid();

		this.drawNumbers();

		this.drawBorders();

		this.drawChassis();

		this.drawCursor();
	}
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
	},

	decodeKanpen : function(){
		this.owner.fio.decodeAreaRoom();
		this.owner.fio.decodeCellQnum_kanpen();
	},
	encodeKanpen : function(){
		this.owner.fio.encodeAreaRoom();
		this.owner.fio.encodeCellQnum_kanpen();
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
	},

	kanpenOpen : function(){
		this.decodeAreaRoom();
		this.decodeCellQnum_kanpen();
		this.decodeCellAnum_kanpen();
	},
	kanpenSave : function(){
		this.encodeAreaRoom();
		this.encodeCellQnum_kanpen();
		this.encodeCellAnum_kanpen();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		var rinfo = this.owner.board.getRoomInfo();
		if( !this.checkDifferentNumberInRoom(rinfo, function(cell){ return cell.getNum();}) ){
			this.setAlert('1つの部屋に同じ数字が複数入っています。','A room has two or more same numbers.'); return false;
		}

		if( (this.owner.pid==='ripple') && !this.checkRippleNumber() ){
			this.setAlert('数字よりもその間隔が短いところがあります。','The gap of the same kind of number is smaller than the number.'); return false;
		}

		if( (this.owner.pid==='cojun') && !this.checkSideCell(function(cell1,cell2){ return cell1.sameNumber(cell2);}) ){
			this.setAlert('同じ数字がタテヨコに連続しています。','Same numbers are adjacent.'); return false;
		}

		if( (this.owner.pid==='cojun') && !this.checkUpperNumber(rinfo) ){
			this.setAlert('同じ部屋で上に小さい数字が乗っています。','There is an small number on big number in a room.'); return false;
		}

		if( !this.checkNoNumCell() ){
			this.setAlert('数字の入っていないマスがあります。','There is an empty cell.'); return false;
		}

		return true;
	},
	check1st : function(){ return this.checkNoNumCell();},

	checkRippleNumber : function(){
		var result = true, bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			var cell=bd.cell[c], num=cell.getNum(), bx=cell.bx, by=cell.by;
			if(num<=0){ continue;}
			for(var i=2;i<=num*2;i+=2){
				var cell2 = bd.getc(bx+i,by);
				if(!cell2.isnull && cell2.getNum()===num){
					if(this.inAutoCheck){ return false;}
					cell.seterr(1);
					cell2.seterr(1);
					result = false;
				}
			}
			for(var i=2;i<=num*2;i+=2){
				var cell2 = bd.getc(bx,by+i);
				if(!cell2.isnull && cell2.getNum()===num){
					if(this.inAutoCheck){ return false;}
					cell.seterr(1);
					cell2.seterr(1);
					result = false;
				}
			}
		}
		return result;
	},

	checkUpperNumber : function(rinfo){
		var result = true, bd = this.owner.board;
		for(var c=0;c<bd.cellmax-bd.qcols;c++){
			var cell=bd.cell[c], cell2=cell.dn(), dc=cell2.id;
			if(rinfo.id[c]!=rinfo.id[dc] || !cell.isNum() || !cell2.isNum()){ continue;}
			if(cell2.getNum()>cell.getNum()){
				if(this.inAutoCheck){ return false;}
				cell.seterr(1);
				cell2.seterr(1);
				result = false;
			}
		}
		return result;
	}
}
});
