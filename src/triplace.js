//
// パズル固有スクリプト部 トリプレイス版 triplace.js v3.4.0
//
(function(){

var k = pzprv3.consts;

pzprv3.createCustoms('triplace', {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputedit : function(){
		if(this.mousestart){ this.input51();}
	},
	inputplay : function(){
		if(this.mousestart || this.mousemove){
			if(!this.owner.key.isZ){
				if     (this.btn.Left) { this.inputborderans();}
				else if(this.btn.Right){ this.inputQsubLine();}
			}
			else{ this.inputBGcolor();}
		}
		else if(this.mouseend && this.notInputted()){
			this.inputBGcolor();
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
		this.inputnumber51(ca,{2:(bd.qcols-(this.cursor.pos.bx>>1)-1), 4:(bd.qrows-(this.cursor.pos.by>>1)-1)});
	},

	enablemake_p : true,
	paneltype    : 51
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	qnum:-1,
	qdir:-1,

	disInputHatena : true,

	minnum : 0,

	set51cell : function(){
		this.setQues(51);
		this.setQnum(-1);
		this.setQdir(-1);
		this.set51aroundborder();
	},
	remove51cell : function(){
		this.setQues(0);
		this.setQnum(-1);
		this.setQdir(-1);
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
EXCell:{
	qnum:-1,
	qdir:-1
},
Board:{
	isborder : 1,
	isexcell : 1,

	initialize2 : function(){
		this.SuperFunc.initialize2.call(this);
		this.tiles = this.owner.newInstance('AreaTriTileManager');
	},

	getTileInfo : function(){
		var tinfo = this.tiles.getAreaInfo();
		for(var r=1;r<=tinfo.max;r++){
			var d = tinfo.getclist(r).getRectSize();
			tinfo.room[r].is1x3=((((d.x1===d.x2)||(d.y1===d.y2))&&d.cnt===3)?1:0);
		}
		return tinfo;
	},

	adjustBoardData : function(key,d){
		this.adjustQues51_1(key,d);
	},
	adjustBoardData2 : function(key,d){
		this.adjustQues51_2(key,d);
	}
},

"AreaTriTileManager:AreaBorderManager":{
	enabled : true,
	relation : ['cell','border'],
	isvalid : function(cell){ return (!cell.is51cell());},
	bdfunc : function(border){ return border.isBorder();}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	setColors : function(){
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
	pzlimport : function(type){
		this.decodeTriplace();
	},
	pzlexport : function(type){
		this.encodeTriplace();
	},

	decodeTriplace : function(){
		// 盤面内数字のデコード
		var id=0, a=0, bstr = this.outbstr;
		bd.disableInfo();
		for(var i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i), obj=bd.cell[id];

			if(ca>='g' && ca<='z'){ id+=(parseInt(ca,36)-16);}
			else{
				obj.set51cell();
				if     (ca==='_'){}
				else if(ca==='%'){ obj.qdir = parseInt(bstr.charAt(i+1),36); i++;}
				else if(ca==='$'){ obj.qnum = parseInt(bstr.charAt(i+1),36); i++;}
				else if(ca==='-'){
					obj.qdir = (bstr.charAt(i+1)!=="." ? parseInt(bstr.charAt(i+1),16) : -1);
					obj.qnum = parseInt(bstr.substr(i+2,2),16);
					i+=3;
				}
				else if(ca==='+'){
					obj.qdir = parseInt(bstr.substr(i+1,2),16);
					obj.qnum = (bstr.charAt(i+3)!=="." ? parseInt(bstr.charAt(i+3),16) : -1);
					i+=3;
				}
				else if(ca==='='){
					obj.qdir = parseInt(bstr.substr(i+1,2),16);
					obj.qnum = parseInt(bstr.substr(i+3,2),16);
					i+=4;
				}
				else{
					obj.qdir = (bstr.charAt(i)  !=="." ? parseInt(bstr.charAt(i),16) : -1);
					obj.qnum = (bstr.charAt(i+1)!=="." ? parseInt(bstr.charAt(i+1),16) : -1);
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
			var ca = bstr.charAt(i);
			if     (ca==='.'){ bd.excell[id].qdir = -1;}
			else if(ca==='-'){ bd.excell[id].qdir = parseInt(bstr.substr(i+1,2),16); i+=2;}
			else             { bd.excell[id].qdir = parseInt(ca,16);}
			id++;
			if(id>=bd.qcols){ a=i+1; break;}
		}
		for(var i=a;i<bstr.length;i++){
			var ca = bstr.charAt(i);
			if     (ca==='.'){ bd.excell[id].qnum = -1;}
			else if(ca==='-'){ bd.excell[id].qnum = parseInt(bstr.substr(i+1,2),16); i+=2;}
			else             { bd.excell[id].qnum = parseInt(ca,16);}
			id++;
			if(id>=bd.qcols+bd.qrows){ a=i+1; break;}
		}

		this.outbstr = bstr.substr(a);
	},
	encodeTriplace : function(type){
		var cm="";

		// 盤面内側の数字部分のエンコード
		var count=0;
		for(var c=0;c<bd.cellmax;c++){
			var pstr = "", obj=bd.cell[c];

			if(obj.ques===51){
				if(obj.qnum===-1 && obj.qdir===-1){ pstr="_";}
				else if(obj.qdir==-1 && obj.qnum<35){ pstr="$"+obj.qnum.toString(36);}
				else if(obj.qnum==-1 && obj.qdir<35){ pstr="%"+obj.qdir.toString(36);}
				else{
					pstr+=obj.qdir.toString(16);
					pstr+=obj.qnum.toString(16);

					if     (obj.qnum>=16 && obj.qdir>=16){ pstr = ("="+pstr);}
					else if(obj.qnum>=16){ pstr = ("-"+pstr);}
					else if(obj.qdir>=16){ pstr = ("+"+pstr);}
				}
			}
			else{ count++;}

			if(count===0){ cm += pstr;}
			else if(pstr || count===20){ cm += ((count+15).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm += (count+15).toString(36);}

		// 盤面外側の数字部分のエンコード
		for(var c=0;c<bd.qcols;c++){
			var num = bd.excell[c].qdir;
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

		var tiles = bd.getTileInfo();
		if( !this.checkAllArea(tiles, function(w,h,a,n){ return (a>=3);} ) ){
			this.setAlert('サイズが3マスより小さいブロックがあります。','The size of block is smaller than two.'); return false;
		}

		if( !this.checkRowsColsPartly(function(pos,clist){ return this.isTileCount(pos,clist,tiles);}, function(cell){ return cell.is51cell();}, false) ){
			this.setAlert('数字の下か右にあるまっすぐのブロックの数が間違っています。','The number of straight blocks underward or rightward is not correct.'); return false;
		}

		if( !this.checkAllArea(tiles, function(w,h,a,n){ return (a<=3);} ) ){
			this.setAlert('サイズが3マスより大きいブロックがあります。','The size of block is bigger than four.'); return false;
		}

		return true;
	},

	isTileCount : function(keycellpos, clist, tiles){
		var number, keyobj=bd.getobj(keycellpos[0], keycellpos[1]), dir=keycellpos[2];
		if     (dir===k.RT){ number = keyobj.getQnum();}
		else if(dir===k.DN){ number = keyobj.getQdir();}

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
}
});

})();
