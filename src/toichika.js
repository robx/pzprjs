//
// パズル固有スクリプト部 遠い誓い版 toichika.js v3.4.0
//

pzprv3.createCustoms('toichika', {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.owner.playmode){
			if(this.mousestart || this.mousemove){
				if     (this.btn.Left) { this.inputarrow_cell();}
				else if(this.btn.Right){ this.inputDot();}
			}
			else if(this.mouseend && this.notInputted()){ this.inputqnum();}
		}
		else if(this.owner.editmode){
			if(this.mousestart || this.mousemove){
				if(this.mousestart){ this.checkBorderMode();}

				if(this.bordermode){ this.inputborder();}
				else               { this.inputarrow_cell();}
			}
			else if(this.mouseend && this.notInputted()){ this.inputqnum();}
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
	moveTarget : function(ca){
		if(this.isSHIFT){ return false;}
		return this.moveTCell(ca);
	},

	keyinput : function(ca){
		this.key_toichika(ca);
	},
	key_toichika : function(ca){
		if     (ca==='1'||ca==='w'||(this.isSHIFT && ca===this.KEYUP)){ ca='1';}
		else if(ca==='2'||ca==='s'||(this.isSHIFT && ca===this.KEYRT)){ ca='4';}
		else if(ca==='3'||ca==='z'||(this.isSHIFT && ca===this.KEYDN)){ ca='2';}
		else if(ca==='4'||ca==='a'||(this.isSHIFT && ca===this.KEYLT)){ ca='3';}
		else if(ca==='5'||ca==='q'||ca==='-')                         { ca='s1';}
		else if(ca==='6'||ca==='e'||ca===' ')                         { ca=' ';}
		this.key_inputqnum(ca);
	},
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	numberAsObject : true,

	maxnum : 4
},
Board:{
	isborder : 1,

	getPairedArrowsInfo : function(){
		var k = pzprv3.consts;
		var ainfo=[], isarrow=[];
		for(var c=0;c<this.cellmax;c++){ isarrow[c]=this.cell[c].isNum();}
		for(var c=0;c<this.cellmax;c++){
			var cell0 = this.cell[c];
			if(cell0.noNum()){ continue;}
			var pos=cell0.getaddr(), dir=cell0.getNum();

			while(1){
				pos.movedir(dir,2);
				var cell = pos.getc();
				if(cell.isnull){ ainfo.push([cell0.id]); break;}
				if(!!isarrow[cell.id]){
					if(cell.getNum()!==[0,k.DN,k.UP,k.RT,k.LT][dir]){ ainfo.push([cell0.id]);}
					else{ ainfo.push([cell.id,cell0.id]);}
					break;
				}
			}
		}
		return ainfo;
	}
},
BoardExec:{
	adjustBoardData : function(key,d){
		this.adjustCellArrow(key,d);
	}
},

AreaRoomManager:{
	enabled : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	setColors : function(){
		this.gridcolor = this.gridcolor_LIGHT;
		this.dotcolor = this.dotcolor_PINK;
	},
	paint : function(){
		this.drawBGCells();
		this.drawGrid();
		this.drawBorders();

		this.drawDotCells(true);
		this.drawCellArrows();
		this.drawHatenas();

		this.drawChassis();

		this.drawCursor();
	},
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodeBorder();
		this.decode4Cell_toichika();
	},
	encodePzpr : function(type){
		this.encodeBorder();
		this.encode4Cell_toichika();
	},

	decode4Cell_toichika : function(){
		var c=0, i=0, bstr = this.outbstr, bd=this.owner.board;
		for(i=0;i<bstr.length;i++){
			var cell = bd.cell[c], ca = bstr.charAt(i);

			if(this.include(ca,"1","4")){ cell.qnum = parseInt(bstr.substr(i,1),10);}
			else if(ca==='.')           { cell.qnum = -2;}
			else                        { c += (parseInt(ca,36)-5);}

			c++;
			if(c>=bd.cellmax){ break;}
		}
		this.outbstr = bstr.substr(i);
	},
	encode4Cell_toichika : function(){
		var cm="", count=0, bd=this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			var pstr = "", val = bd.cell[c].qnum;

			if     (val===-2)        { pstr = ".";}
			else if(val>=1 && val<=4){ pstr = val.toString(10);}
			else{ count++;}

			if(count===0){ cm += pstr;}
			else if(pstr || count===31){ cm+=((4+count).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm+=(4+count).toString(36);}

		this.outbstr += cm;
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeAreaRoom();
		this.decodeCellQnum();
		this.decodeCellAnumsub();
	},
	encodeData : function(){
		this.encodeAreaRoom();
		this.encodeCellQnum();
		this.encodeCellAnumsub();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		var rinfo = this.owner.board.getRoomInfo();
		if( !this.checkDoubleNumber(rinfo) ){ return 31016;}

		var ainfo = this.owner.board.getPairedArrowsInfo();
		if( !this.checkAdjacentCountries(rinfo, ainfo) ){ return 91501;}
		if( !this.checkDirectionOfArrow(ainfo) ){ return 91511;}
		if( !this.checkNoNumber(rinfo) ){ return 31017;}

		return 0;
	},

	checkDirectionOfArrow : function(ainfo){
		var result = true;
		for(var i=0;i<ainfo.length;i++){
			if(ainfo[i].length===1){
				this.owner.board.cell[ainfo[i]].seterr(1);
				result = false;
			}
		}
		return result;
	},
	checkAdjacentCountries : function(rinfo, ainfo){
		// 隣接エリア情報を取得して、形式を変換
		var sides=this.owner.board.getSideAreaInfo(rinfo), adjs=[];
		for(var r=1;r<=rinfo.max-1;r++){
			adjs[r]=[];
			for(var i=0;i<sides[r].length;i++){ adjs[r][sides[r][i]]=true;}
			for(var s=r+1;s<=rinfo.max;s++){ if(!adjs[r][s]){ adjs[r][s]=false;}}
		}

		// ここから実際の判定
		var result = true;
		for(var i=0;i<ainfo.length;i++){
			if(ainfo[i].length===1){ continue;}
			var r1 = rinfo.id[ainfo[i][0]], r2 = rinfo.id[ainfo[i][1]];
			if((r1<r2 ? adjs[r1][r2] : adjs[r2][r1])>0){
				rinfo.getclist(r1).seterr(1);
				rinfo.getclist(r2).seterr(1);
				result = false;
			}
		}
		return result;
	}
}
});
