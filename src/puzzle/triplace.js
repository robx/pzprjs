//
// パズル固有スクリプト部 トリプレイス版 triplace.js v3.4.0
//

pzpr.createCustoms('triplace', {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.owner.playmode){
			if(this.mousestart || this.mousemove){
				if(!this.owner.key.isZ){
					if(this.btn.Left){
						if(this.mousestart){ this.checkBorderMode();}

						if(this.bordermode){ this.inputborder();}
						else               { this.inputQsubLine();}
					}
					else if(this.btn.Right){ this.inputQsubLine();}
				}
				else{ this.inputBGcolor();}
			}
			else if(this.mouseend && this.notInputted()){
				this.inputBGcolor();
			}
		}
		else if(this.owner.editmode){
			if(this.mousestart){ this.input51();}
		}
	},

	inputBGcolor : function(){
		var cell = this.getcell();
		if(cell.isnull || cell.is51cell() || cell===this.mouseCell){ return;}
		if(this.inputData===null){
			if(this.btn.Left){
				if     (cell.getQsub()===0){ this.inputData=1;}
				else if(cell.getQsub()===1){ this.inputData=2;}
				else                       { this.inputData=0;}
			}
			else if(this.btn.Right){
				if     (cell.getQsub()===0){ this.inputData=2;}
				else if(cell.getQsub()===1){ this.inputData=0;}
				else                       { this.inputData=1;}
			}
		}
		cell.setQsub(this.inputData);
		this.mouseCell = cell;
		cell.draw();
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,

	keyinput : function(ca){
		this.inputnumber51(ca,
			{2 : (this.owner.board.qcols-(this.cursor.pos.bx>>1)-1),
			 4 : (this.owner.board.qrows-(this.cursor.pos.by>>1)-1)});
	}
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	disInputHatena : true,

	minnum : 0,

	set51cell : function(){
		this.setQues(51);
		this.setQnum(-1);
		this.setQnum2(-1);
		this.set51aroundborder();
	},
	remove51cell : function(){
		this.setQues(0);
		this.setQnum(-1);
		this.setQnum2(-1);
		this.set51aroundborder();
	},
	set51aroundborder : function(){
		var list = this.getdir4cblist();
		for(var i=0;i<list.length;i++){
			var cell2=list[i][0], border=list[i][1];
			if(!border.isnull){
				border.setQues((this.is51cell()^cell2.is51cell())?1:0);
			}
		}
	}
},
Board:{
	isborder : 1,
	isexcell : 1,

	initialize : function(){
		this.Common.prototype.initialize.call(this);

		this.tiles = this.addInfoList('AreaTriTileManager');
	},

	getTileInfo : function(){
		var tinfo = this.tiles.getAreaInfo();
		for(var r=1;r<=tinfo.max;r++){
			var d = tinfo.room[r].clist.getRectSize();
			tinfo.room[r].is1x3=((((d.x1===d.x2)||(d.y1===d.y2))&&d.cnt===3)?1:0);
		}
		return tinfo;
	}
},
BoardExec:{
	adjustBoardData : function(key,d){
		this.adjustQues51_1(key,d);
	},
	adjustBoardData2 : function(key,d){
		this.adjustQues51_2(key,d);
	}
},

"AreaTriTileManager:AreaManager":{
	enabled : true,
	relation : ['cell','border'],
	isvalid : function(cell){ return (!cell.is51cell());},
	bdfunc : function(border){ return border.isBorder();}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	initialize : function(){
		this.Common.prototype.initialize.call(this);

		this.gridcolor = this.gridcolor_LIGHT;
		this.borderQanscolor = "rgb(0, 160, 0)";
		this.setBGCellColorFunc('qsub2');
	},
	paint : function(){
		this.drawBGCells();
		this.drawBGEXcells();
		this.drawQues51();

		this.drawGrid();
		this.drawQansBorders();
		this.drawQuesBorders();

		this.drawBorderQsubs();

		this.drawChassis_ex1(false);

		this.drawNumbersOn51();

		this.drawTarget();
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodeTriplace();
	},
	encodePzpr : function(type){
		this.encodeTriplace();
	},

	decodeTriplace : function(){
		// 盤面内数字のデコード
		var id=0, a=0, bstr = this.outbstr, bd = this.owner.board;
		bd.disableInfo();
		for(var i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i), cell=bd.cell[id];

			if(ca>='g' && ca<='z'){ id+=(parseInt(ca,36)-16);}
			else{
				cell.set51cell();
				if     (ca==='_'){}
				else if(ca==='%'){ cell.qnum2 = parseInt(bstr.charAt(i+1),36); i++;}
				else if(ca==='$'){ cell.qnum  = parseInt(bstr.charAt(i+1),36); i++;}
				else if(ca==='-'){
					cell.qnum2 = (bstr.charAt(i+1)!=="." ? parseInt(bstr.charAt(i+1),16) : -1);
					cell.qnum  = parseInt(bstr.substr(i+2,2),16);
					i+=3;
				}
				else if(ca==='+'){
					cell.qnum2 = parseInt(bstr.substr(i+1,2),16);
					cell.qnum  = (bstr.charAt(i+3)!=="." ? parseInt(bstr.charAt(i+3),16) : -1);
					i+=3;
				}
				else if(ca==='='){
					cell.qnum2 = parseInt(bstr.substr(i+1,2),16);
					cell.qnum  = parseInt(bstr.substr(i+3,2),16);
					i+=4;
				}
				else{
					cell.qnum2 = (bstr.charAt(i)  !=="." ? parseInt(bstr.charAt(i),16) : -1);
					cell.qnum  = (bstr.charAt(i+1)!=="." ? parseInt(bstr.charAt(i+1),16) : -1);
					i+=1;
				}
			}

			id++;
			if(id>=bd.cellmax){ a=i+1; break;}
		}
		bd.enableInfo();

		// 盤面外数字のデコード
		id=0;
		for(var i=a;i<bstr.length;i++){
			var ca = bstr.charAt(i), excell = bd.excell[id];
			if     (ca==='.'){ excell.qnum2 = -1;}
			else if(ca==='-'){ excell.qnum2 = parseInt(bstr.substr(i+1,2),16); i+=2;}
			else             { excell.qnum2 = parseInt(ca,16);}
			id++;
			if(id>=bd.qcols){ a=i+1; break;}
		}
		for(var i=a;i<bstr.length;i++){
			var ca = bstr.charAt(i), excell = bd.excell[id];
			if     (ca==='.'){ excell.qnum = -1;}
			else if(ca==='-'){ excell.qnum = parseInt(bstr.substr(i+1,2),16); i+=2;}
			else             { excell.qnum = parseInt(ca,16);}
			id++;
			if(id>=bd.qcols+bd.qrows){ a=i+1; break;}
		}

		this.outbstr = bstr.substr(a);
	},
	encodeTriplace : function(type){
		var cm="", bd=this.owner.board;

		// 盤面内側の数字部分のエンコード
		var count=0;
		for(var c=0;c<bd.cellmax;c++){
			var pstr = "", cell=bd.cell[c];

			if(cell.ques===51){
				if(cell.qnum===-1 && cell.qnum2===-1){ pstr="_";}
				else if(cell.qnum2===-1 && cell.qnum <35){ pstr="$"+cell.qnum.toString(36);}
				else if(cell.qnum ===-1 && cell.qnum2<35){ pstr="%"+cell.qnum2.toString(36);}
				else{
					pstr+=cell.qnum2.toString(16);
					pstr+=cell.qnum.toString(16);

					if     (cell.qnum >=16 && cell.qnum2>=16){ pstr = ("="+pstr);}
					else if(cell.qnum >=16){ pstr = ("-"+pstr);}
					else if(cell.qnum2>=16){ pstr = ("+"+pstr);}
				}
			}
			else{ count++;}

			if(count===0){ cm += pstr;}
			else if(pstr || count===20){ cm += ((count+15).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm += (count+15).toString(36);}

		// 盤面外側の数字部分のエンコード
		for(var c=0;c<bd.qcols;c++){
			var num = bd.excell[c].qnum2;
			if     (num<  0){ cm += ".";}
			else if(num< 16){ cm += num.toString(16);}
			else if(num<256){ cm += ("-"+num.toString(16));}
		}
		for(var c=bd.qcols;c<bd.qcols+bd.qrows;c++){
			var num = bd.excell[c].qnum;
			if     (num<  0){ cm += ".";}
			else if(num< 16){ cm += num.toString(16);}
			else if(num<256){ cm += ("-"+num.toString(16));}
		}

		this.outbstr += cm;
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCellQnum51();
		this.decodeBorderAns();
		this.decodeCell( function(obj,ca){
			if     (ca==="+"){ obj.qsub = 1;}
			else if(ca==="-"){ obj.qsub = 2;}
		});
	},
	encodeData : function(){
		this.encodeCellQnum51();
		this.encodeBorderAns();
		this.encodeCell( function(obj){
			if     (obj.qsub===1){ return "+ ";}
			else if(obj.qsub===2){ return "- ";}
			else                 { return ". ";}
		});
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		var tiles = this.owner.board.getTileInfo();
		if( !this.checkOverThreeCells(tiles) ){ return 'bkSizeLt3';}
		if( !this.checkRowsColsTileCount(tiles) ){ return 'asLblockNe';}
		if( !this.checkLessThreeCells(tiles) ){ return 'bkSizeGt3';}

		return null;
	},

	checkOverThreeCells : function(tiles){
		return this.checkAllArea(tiles, function(w,h,a,n){ return (a>=3);});
	},
	checkLessThreeCells : function(tiles){
		return this.checkAllArea(tiles, function(w,h,a,n){ return (a<=3);});
	},

	checkRowsColsTileCount : function(tiles){
		var evalfunc = function(pos,clist){ return this.isTileCount(pos,clist,tiles);};
		return this.checkRowsColsPartly(evalfunc, function(cell){ return cell.is51cell();}, false)
	},
	isTileCount : function(keycellpos, clist, tiles){
		var number, keyobj=this.owner.board.getobj(keycellpos[0], keycellpos[1]), dir=keycellpos[2];
		var k = pzpr.consts;
		if     (dir===k.RT){ number = keyobj.getQnum();}
		else if(dir===k.DN){ number = keyobj.getQnum2();}

		var count = 0, counted = [];
		for(var i=0;i<clist.length;i++){
			var tid = tiles.getRoomID(clist[i]);
			if(tiles.room[tid].is1x3==1 && !counted[tid]){ count++; counted[tid] = true;}
		}
		if(number>=0 && count!=number){
			keyobj.seterr(1);
			clist.seterr(1);
			return false;
		}
		return true;
	}
},

FailCode:{
	bkSizeLt3 : ["サイズが3マスより小さいブロックがあります。","The size of block is smaller than three."],
	bkSizeGt3 : ["サイズが3マスより大きいブロックがあります。","The size of block is larger than three."],
	asLblockNe : ["数字の下か右にあるまっすぐのブロックの数が間違っています。","The number of straight blocks underward or rightward is not correct."]
}
});
