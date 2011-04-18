//
// パズル固有スクリプト部 カックロ版 kakuro.js v3.4.0
//
pzprv3.custom.kakuro = {
//---------------------------------------------------------
// フラグ
Flags:{
	setting : function(pid){
		this.qcols = 11;
		this.qrows = 11;

		this.isborder = 1;
		this.isexcell = 1;

		this.isAnsNumber     = true;

		this.floatbgcolor = "rgb(96, 96, 96)";
	}
},

//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mousedown : function(){
		if     (k.editmode){ this.input51();}
		else if(k.playmode){ this.inputqnum();}
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,
	enableplay : true,

	keyinput : function(ca){
		if     (k.editmode){ this.inputnumber51(ca,{2:45,4:45});}
		else if(k.playmode){ this.key_inputqnum(ca);}
	}
},

KeyPopup:{
	paneltype  : 51,
	enablemake : true,
	enableplay : true,
	generate : function(mode,type){
		if(mode===3){ this.gentable10(mode,type);}
		else        { this.gentable51(mode,type);}
	}
},

TargetCursor:{
	adjust_modechange : function(){
		if(k.playmode){
			if(this.pos.x<1) this.pos.x = 1;
			if(this.pos.y<1) this.pos.y = 1;
		}
	},
	targetdir : 2
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	qnum : 0,
	qdir : 0
},

EXCell:{
	qnum : 0,
	qdir : 0
},

Board:{
	maxnum : 9,

	// 問題入力モードだけ、、0でも入力できるようにする
	sQnC : function(id, num) {
		um.addOpe(k.CELL, k.QNUM, id, this.cell[id].qnum, num);
		this.cell[id].qnum = num;
	},

	// この関数は回答モードでしか呼ばれないはず、
	getNum : function(c){ return this.cell[c].anum;},
	setNum : function(c,val){ this.sAnC(c, (val>0 ? val : -1));}
},

MenuExec:{
	adjustBoardData : function(key,d){
		this.adjustQues51_1(key,d);
	},
	adjustBoardData2 : function(key,d){
		this.adjustQues51_2(key,d);
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	setColors : function(){
		this.ttcolor = "rgb(255,255,127)";
	},
	paint : function(){
		this.drawBGCells();
		this.drawBGEXcells();
		this.drawQues51();

		this.drawGrid();
		this.drawBorders();

		this.drawChassis_ex1(false);

		this.drawNumbersOn51();
		this.drawNumbers_kakuro();

		this.drawCursor();
	},

	// オーバーライド drawBGCells用
	setBGCellColor : function(cc){
		var err = (bd.cell[cc].error===1), q51 = (bd.cell[cc].ques===51);
		if     (err){ g.fillStyle = this.errbcolor1;    return true;}
		else if(q51){ g.fillStyle = "rgb(192,192,192)"; return true;}
		return false;
	},
	setBGEXcellColor : function(cc){
		var err = (bd.excell[cc].error===1);
		if(err){ g.fillStyle = this.errbcolor1;   }
		else   { g.fillStyle = "rgb(192,192,192)";}
		return true;
	},
	// オーバーライド 境界線用
	setBorderColor : function(id){
		var cc1 = bd.border[id].cellcc[0], cc2 = bd.border[id].cellcc[1];
		if(cc1!==null && cc2!==null && ((bd.cell[cc1].ques===51)^(bd.cell[cc2].ques===51))){
			g.fillStyle = this.cellcolor;
			return true;
		}
		return false;
	},

	drawNumbers_kakuro : function(){
		this.vinc('cell_number', 'auto');

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var c = clist[i], key = ['cell',c,'anum'].join('_');
			if(bd.cell[c].ques!==51 && bd.cell[c].anum>0){
				var obj = bd.cell[c];
				var color = (bd.cell[c].error===1 ? this.fontErrcolor : this.fontAnscolor);
				var text  = ""+bd.cell[c].anum;
				this.dispnum(key, 1, text, 0.80, color, obj.cpx, obj.cpy);
			}
			else{ this.hideEL(key);}
		}
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		this.decodeKakuro();
	},
	pzlexport : function(type){
		this.encodeKakuro();
	},

	decodeKanpen : function(){
		fio.decodeCellQnum51_kanpen();
	},
	encodeKanpen : function(){
		this.outsize = [k.qrows+1, k.qcols+1].join("/");

		fio.encodeCellQnum51_kanpen();
	},

	decodeKakuro : function(){
		// 盤面内数字のデコード
		var cell=0, a=0, bstr = this.outbstr;
		for(var i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i), obj=bd.cell[cell];
			if(ca>='k' && ca<='z'){ cell+=(parseInt(ca,36)-19);}
			else{
				obj.ques = 51;
				if(ca!='.'){
					obj.qdir = this.decval(ca);
					obj.qnum = this.decval(bstr.charAt(i+1));
					i++;
				}
				cell++;
			}
			if(cell>=bd.cellmax){ a=i+1; break;}
		}

		// 盤面外数字のデコード
		var i=a;
		for(bx=1;bx<bd.maxbx;bx+=2){
			if(bd.cell[bd.cnum(bx,1)].ques!==51){
				bd.excell[bd.exnum(bx,-1)].qdir = this.decval(bstr.charAt(i));
				i++;
			}
		}
		for(by=1;by<bd.maxby;by+=2){
			if(bd.cell[bd.cnum(1,by)].ques!==51){
				bd.excell[bd.exnum(-1,by)].qnum = this.decval(bstr.charAt(i));
				i++;
			}
		}

		this.outbstr = bstr.substr(a);
	},
	encodeKakuro : function(type){
		var cm="";

		// 盤面内側の数字部分のエンコード
		var count=0;
		for(var c=0;c<bd.cellmax;c++){
			var pstr="", obj=bd.cell[c];

			if(obj.ques===51){
				if(obj.qnum<=0 && obj.qdir<=0){ pstr = ".";}
				else{ pstr = ""+this.encval(obj.qdir)+this.encval(obj.qnum);}
			}
			else{ count++;}

			if     (count===0){ cm += pstr;}
			else if(pstr || count===16){ cm += ((count+19).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm += (count+19).toString(36);}

		// 盤面外側の数字部分のエンコード
		for(var bx=1;bx<bd.maxbx;bx+=2){
			if(bd.cell[bd.cnum(bx,1)].ques!==51){
				cm+=this.encval(bd.excell[bd.exnum(bx,-1)].qdir);
			}
		}
		for(var by=1;by<bd.maxby;by+=2){
			if(bd.cell[bd.cnum(1,by)].ques!==51){
				cm+=this.encval(bd.excell[bd.exnum(-1,by)].qnum);
			}
		}

		this.outbstr += cm;
	},

	decval : function(ca){
		if     (ca>='0'&&ca<='9'){ return parseInt(ca,36);}
		else if(ca>='a'&&ca<='j'){ return parseInt(ca,36);}
		else if(ca>='A'&&ca<='Z'){ return parseInt(ca,36)+10;}
		return "";
	},
	encval : function(val){
		if     (val>= 1&&val<=19){ return val.toString(36).toLowerCase();}
		else if(val>=20&&val<=45){ return (val-10).toString(36).toUpperCase();}
		return "0";
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
			this.decodeCellQnum51();
			this.decodeCellAnumsub();
	},
	encodeData : function(){
			this.encodeCellQnum51();
			this.encodeCellAnumsub();
	},

	kanpenOpen : function(){
		this.decodeCellQnum51_kanpen();
		this.decodeQans_kanpen();
	},
	kanpenSave : function(){
		this.sizestr = [k.qrows+1, k.qcols+1].join("/");

		this.encodeCellQnum51_kanpen();
		this.datastr += "/";
		this.encodeQans_kanpen();
	},

	decodeCellQnum51_kanpen : function(){
		for(;;){
			var data = this.readLine();
			if(!data){ break;}

			var item = data.split(" ");
			if(item.length<=1){ return;}
			else if(item[0]==0 && item[1]==0){ }
			else if(item[0]==0 || item[1]==0){
				var ec=bd.exnum(parseInt(item[1])*2-1,parseInt(item[0])*2-1);
				if     (item[0]==0){ bd.excell[ec].qdir = parseInt(item[3]);}
				else if(item[1]==0){ bd.excell[ec].qnum = parseInt(item[2]);}
			}
			else{
				var c=bd.cnum(parseInt(item[1])*2-1,parseInt(item[0])*2-1);
				bd.cell[c].ques = 51;
				bd.cell[c].qdir = parseInt(item[3]);
				bd.cell[c].qnum = parseInt(item[2]);
			}
		}
	},
	encodeCellQnum51_kanpen : function(){
		for(var by=bd.minby+1;by<bd.maxby;by+=2){ for(var bx=bd.minbx+1;bx<bd.maxbx;bx+=2){
			var item=[((by+1)>>1).toString(),((bx+1)>>1).toString(),0,0];

			if(bx===-1&&by===-1){ }
			else if(bx===-1||by===-1){
				var ec = bd.exnum(bx,by);
				if(bx===-1){ item[2]=bd.excell[ec].qnum.toString();}
				if(by===-1){ item[3]=bd.excell[ec].qdir.toString();}
			}
			else{
				var c = bd.cnum(bx,by);
				if(bd.cell[c].ques!==51){ continue;}
				item[2]=bd.cell[c].qnum.toString();
				item[3]=bd.cell[c].qdir.toString();
			}
			this.datastr += (item.join(" ")+"/");
		}}
	},

	decodeQans_kanpen : function(){
		var barray = this.readLines(k.qrows+1);
		for(var by=bd.minby+1;by<bd.maxby;by+=2){
			if(((by+1)>>1)>=barray.length){ break;}
			var arr = barray[(by+1)>>1].split(" ");
			for(var bx=bd.minbx+1;bx<bd.maxbx;bx+=2){
				if(arr[(bx+1)>>1]==''){ continue;}
				var c = bd.cnum(bx,by);
				if(c!==null && arr[(bx+1)>>1]!="." && arr[(bx+1)>>1]!="0"){
					bd.cell[c].anum = parseInt(arr[(bx+1)>>1]);
				}
			}
		}
	},
	encodeQans_kanpen : function(){
		for(var by=bd.minby+1;by<bd.maxby;by+=2){
			for(var bx=bd.minbx+1;bx<bd.maxbx;bx+=2){
				var c = bd.cnum(bx,by), obj = bd.cell[c];
				if(c===null){ this.datastr += ". ";}
				else if(obj.ques===51){ this.datastr += ". ";}
				else if(obj.anum  > 0){ this.datastr += (obj.anum.toString() + " ");}
				else                  { this.datastr += "0 ";}
			}
			if(by<bd.maxby-1){ this.datastr += "/";}
		}
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.checkRowsColsPartly(this.isSameNumber, function(cc){ return (bd.QuC(cc)==51);}, true) ){
			this.setAlert('同じ数字が同じ列に入っています。','Same number is in the same row.'); return false;
		}

		if( !this.checkRowsColsPartly(this.isTotalNumber, function(cc){ return (bd.QuC(cc)==51);}, false) ){
			this.setAlert('数字の下か右にある数字の合計が間違っています。','The sum of the cells is not correct.'); return false;
		}

		if( !this.checkAllCell(function(c){ return (bd.QuC(c)!==51 && bd.AnC(c)<=0);}) ){
			this.setAlert('すべてのマスに数字が入っていません。','There is a empty cell.'); return false;
		}

		return true;
	},
	check1st : function(){ return this.checkAllCell(function(c){ return (bd.QuC(c)!==51 && bd.AnC(c)<=0);});},

	isSameNumber : function(keycellpos, clist){
		if(!this.isDifferentNumberInClist(clist, function(c){ return bd.AnC(c);})){
			var isex = (keycellpos[0]===-1 || keycellpos[1]===-1);
			if(isex){ bd.sErE(bd.exnum(keycellpos[0],keycellpos[1]),1);}
			else    { bd.sErC(bd.cnum (keycellpos[0],keycellpos[1]),1);}
			return false;
		}
		return true;
	},
	isTotalNumber : function(keycellpos, clist){
		var number, bx=keycellpos[0], by=keycellpos[1], dir=keycellpos[2];
		if     (dir===k.RT){ number = (bx===-1 ? bd.QnE(bd.exnum(-1,by)) : bd.QnC(bd.cnum(bx,by)));}
		else if(dir===k.DN){ number = (by===-1 ? bd.DiE(bd.exnum(bx,-1)) : bd.DiC(bd.cnum(bx,by)));}

		var sum = 0;
		for(var i=0;i<clist.length;i++){
			if(bd.AnC(clist[i])>0){ sum += bd.AnC(clist[i]);}
			else{ return true;}
		}
		if(number>0 && sum!=number){
			var isex = (keycellpos[0]===-1 || keycellpos[1]===-1);
			if(isex){ bd.sErE(bd.exnum(keycellpos[0],keycellpos[1]),1);}
			else    { bd.sErC(bd.cnum (keycellpos[0],keycellpos[1]),1);}
			bd.sErC(clist,1);
			return false;
		}
		return true;
	}
}
};
