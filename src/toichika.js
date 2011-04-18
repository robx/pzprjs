//
// パズル固有スクリプト部 遠い誓い版 toichika.js v3.4.0
//
pzprv3.custom.toichika = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mousedown : function(){
		if(k.editmode){
			this.checkBorderMode();
			if(this.bordermode){ this.inputborder();}
			else               { this.inputarrow_cell();}
		}
		else if(k.playmode){
			if(this.btn.Left){ this.inputarrow_cell();}
			else if(this.btn.Right){ this.inputDot();}
		}
	},
	mouseup : function(){
		if(this.notInputted()){ this.inputqnum();}
	},
	mousemove : function(){
		if(k.editmode){
			if(this.bordermode){ this.inputborder();}
			else               { this.inputarrow_cell();}
		}
		else if(k.playmode){
			if     (this.btn.Left) { this.inputarrow_cell();}
			else if(this.btn.Right){ this.inputDot();}
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
	moveTarget : function(ca){
		if(this.isSHIFT){ return false;}
		return this.moveTCell(ca);
	},

	keyinput : function(ca){
		this.key_toichika(ca);
	},
	key_toichika : function(ca){
		if     (ca==='1'||ca==='w'||(this.isSHIFT && ca===k.KEYUP)){ ca='1';}
		else if(ca==='2'||ca==='s'||(this.isSHIFT && ca===k.KEYRT)){ ca='4';}
		else if(ca==='3'||ca==='z'||(this.isSHIFT && ca===k.KEYDN)){ ca='2';}
		else if(ca==='4'||ca==='a'||(this.isSHIFT && ca===k.KEYLT)){ ca='3';}
		else if(ca==='5'||ca==='q'||ca==='-')                      { ca='s1';}
		else if(ca==='6'||ca==='e'||ca===' ')                      { ca=' ';}
	},
},

//---------------------------------------------------------
// 盤面管理系
Board:{
	isborder : 1,

	numberAsObject : true,

	maxnum : 4,

	getPairedArrowsInfo : function(){
		var ainfo=[], isarrow=[];
		for(var c=0;c<this.cellmax;c++){ isarrow[c]=this.isNum(c);}
		for(var c=0;c<this.cellmax;c++){
			if(this.noNum(c)){ continue;}
			var bx=this.cell[c].bx, by=this.cell[c].by, tc=c, dir=this.getNum(c);

			while(1){
				switch(dir){ case k.UP: by-=2; break; case k.DN: by+=2; break; case k.LT: bx-=2; break; case k.RT: bx+=2; break;}
				tc = this.cnum(bx,by);
				if(tc===null){ ainfo.push([c]); break;}
				if(!!isarrow[tc]){
					var tdir = this.getNum(tc);
					if(tdir!==[0,k.DN,k.UP,k.RT,k.LT][dir]){ ainfo.push([c]);}
					else{ ainfo.push([c,tc]);}
					break;
				}
			}
		}
		return ainfo;
	}
},

AreaManager:{
	hasroom : true
},

MenuExec:{
	adjustBoardData : function(key,d){
		this.adjustCellArrow(key,d);
	}
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
	pzlimport : function(type){
		this.decodeBorder();
		this.decode4Cell_toichika();
	},
	pzlexport : function(type){
		this.encodeBorder();
		this.encode4Cell_toichika();
	},

	decode4Cell_toichika : function(){
		var c=0, i=0, bstr = this.outbstr;
		for(i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i);

			if(this.include(ca,"1","4")){ bd.cell[c].qnum = parseInt(bstr.substr(i,1),10);}
			else if(ca==='.')           { bd.cell[c].qnum = -2;}
			else                        { c += (parseInt(ca,36)-5);}

			c++;
			if(c>=bd.cellmax){ break;}
		}
		this.outbstr = bstr.substr(i);
	},
	encode4Cell_toichika : function(){
		var cm="", count=0;
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

		var rinfo = bd.areas.getRoomInfo();
		if( !this.checkDoubleNumber(rinfo) ){
			this.setAlert('1つの国に2つ以上の矢印が入っています。','A country has plural arrows.'); return false;
		}

		var ainfo = bd.getPairedArrowsInfo();
		if( !this.checkAdjacentCountries(rinfo, ainfo) ){
			this.setAlert('辺を共有する国にペアとなる矢印が入っています。','There are paired arrows in adjacent countries.'); return false;
		}

		if( !this.checkDirectionOfArrow(ainfo) ){
			this.setAlert('矢印の先にペアとなる矢印がいません。','There is not paired arrow in the direction of an arrow.'); return false;
		}

		if( !this.checkNoNumber(rinfo) ){
			this.setAlert('国に矢印が入っていません。','A country has no arrow.'); return false;
		}

		return true;
	},

	checkDirectionOfArrow : function(ainfo){
		var result = true;
		for(var i=0;i<ainfo.length;i++){
			if(ainfo[i].length===1){
				bd.sErC(ainfo[i],1);
				result = false;
			}
		}
		return result;
	},
	checkAdjacentCountries : function(rinfo, ainfo){
		// 隣接エリア情報を取得して、形式を変換
		var sides=bd.areas.getSideAreaInfo(rinfo), adjs=[];
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
				bd.sErC(rinfo.room[r1].idlist,1);
				bd.sErC(rinfo.room[r2].idlist,1);
				result = false;
			}
		}
		return result;
	}
}
};
