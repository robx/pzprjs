//
// パズル固有スクリプト部 カックロ版 kakuro.js v3.4.0
//
(function(){

var k = pzprv3.consts;

pzprv3.createCustoms('kakuro', {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputedit : function(){ if(this.mousestart){ this.input51();}},
	inputplay : function(){ if(this.mousestart){ this.inputqnum();}}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,
	enableplay : true,

	keyinput : function(ca){
		if     (this.owner.editmode){ this.inputnumber51(ca,{2:45,4:45});}
		else if(this.owner.playmode){ this.key_inputqnum(ca);}
	}
},

TargetCursor:{
	adjust_modechange : function(){
		if(this.owner.playmode){
			if(this.pos.bx<1){ this.pos.bx = 1;}
			if(this.pos.by<1){ this.pos.by = 1;}
		}
	}
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	qnum : 0,
	qdir : 0,

	/* 問題の0入力は↓の特別処理で可能にしてます */
	disInputHatena : true,

	maxnum : 9,

	// この関数は回答モードでしか呼ばれないはず、
	getNum : function(){ return this.anum;},
	setNum : function(val){ this.setAnum(val>0 ? val : -1);},

	// 問題入力モードだけ、、0でも入力できるようにする
	prehook : {
		anum : function(num){ return (this.minnum>0 && num===0);}
	}
},

EXCell:{
	qnum : 0,
	qdir : 0
},

Board:{
	qcols : 11,
	qrows : 11,

	isborder : 1,
	isexcell : 1,

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
	getBGCellColor : function(cell){
		if     (cell.error== 1){ return this.errbcolor1;}
		else if(cell.ques===51){ return "rgb(192,192,192)";}
		return null;
	},
	getBGEXcellColor : function(excell){
		if(excell.error){ return this.errbcolor1;   }
		else            { return "rgb(192,192,192)";}
	},
	// オーバーライド 境界線用
	getBorderColor : function(border){
		var cell1 = border.sidecell[0], cell2 = border.sidecell[1];
		if(!cell1.isnull && !cell2.isnull && ((cell1.ques===51)^(cell2.ques===51))){
			return this.cellcolor;
		}
		return null;
	},

	drawNumbers_kakuro : function(){
		var g = this.vinc('cell_number', 'auto');

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i], key = ['cell',cell.id,'anum'].join('_');
			if(!cell.is51cell() && cell.anum>0){
				var color = (cell.error===1 ? this.fontErrcolor : this.fontAnscolor);
				var text  = ""+cell.anum;
				var px = cell.bx*this.bw, py = cell.by*this.bh;
				this.dispnum(key, 1, text, 0.80, color, px, py);
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
		this.owner.fio.decodeCellQnum51_kanpen();
	},
	encodeKanpen : function(){
		this.outsize = [this.owner.board.qrows+1, this.owner.board.qcols+1].join("/");

		this.owner.fio.encodeCellQnum51_kanpen();
	},

	decodeKakuro : function(){
		// 盤面内数字のデコード
		var cell=0, a=0, bstr = this.outbstr, bd = this.owner.board;
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
		for(var bx=1;bx<bd.maxbx;bx+=2){
			if(!bd.getc(bx,1).is51cell()){
				bd.getex(bx,-1).qdir = this.decval(bstr.charAt(i));
				i++;
			}
		}
		for(var by=1;by<bd.maxby;by+=2){
			if(!bd.getc(1,by).is51cell()){
				bd.getex(-1,by).qnum = this.decval(bstr.charAt(i));
				i++;
			}
		}

		this.outbstr = bstr.substr(a);
	},
	encodeKakuro : function(type){
		var cm="", bd = this.owner.board;

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
			if(!bd.getc(bx,1).is51cell()){
				cm+=this.encval(bd.getex(bx,-1).qdir);
			}
		}
		for(var by=1;by<bd.maxby;by+=2){
			if(!bd.getc(1,by).is51cell()){
				cm+=this.encval(bd.getex(-1,by).qnum);
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
		this.sizestr = [this.owner.board.qrows+1, this.owner.board.qcols+1].join("/");

		this.encodeCellQnum51_kanpen();
		this.datastr += "/";
		this.encodeQans_kanpen();
	},

	decodeCellQnum51_kanpen : function(){
		var bd = this.owner.board;
		for(;;){
			var data = this.readLine();
			if(!data){ break;}

			var item = data.split(" ");
			if(item.length<=1){ return;}
			else if(item[0]==0 && item[1]==0){ }
			else if(item[0]==0 || item[1]==0){
				var excell = bd.getex(parseInt(item[1])*2-1,parseInt(item[0])*2-1);
				if     (item[0]==0){ excell.qdir = parseInt(item[3]);}
				else if(item[1]==0){ excell.qnum = parseInt(item[2]);}
			}
			else{
				var cell = bd.getc(parseInt(item[1])*2-1,parseInt(item[0])*2-1);
				cell.ques = 51;
				cell.qdir = parseInt(item[3]);
				cell.qnum = parseInt(item[2]);
			}
		}
	},
	encodeCellQnum51_kanpen : function(){
		var bd = this.owner.board;
		for(var by=bd.minby+1;by<bd.maxby;by+=2){ for(var bx=bd.minbx+1;bx<bd.maxbx;bx+=2){
			var item=[((by+1)>>1).toString(),((bx+1)>>1).toString(),0,0];

			if(bx===-1&&by===-1){ }
			else if(bx===-1||by===-1){
				var excell = bd.getex(bx,by);
				if(bx===-1){ item[2]=excell.qnum.toString();}
				if(by===-1){ item[3]=excell.qdir.toString();}
			}
			else{
				var cell = bd.getc(bx,by);
				if(cell.ques!==51){ continue;}
				item[2]=cell.qnum.toString();
				item[3]=cell.qdir.toString();
			}
			this.datastr += (item.join(" ")+"/");
		}}
	},

	decodeQans_kanpen : function(){
		var bd = this.owner.board, barray = this.readLines(bd.qrows+1);
		for(var by=bd.minby+1;by<bd.maxby;by+=2){
			if(((by+1)>>1)>=barray.length){ break;}
			var arr = barray[(by+1)>>1].split(" ");
			for(var bx=bd.minbx+1;bx<bd.maxbx;bx+=2){
				if(arr[(bx+1)>>1]==''){ continue;}
				var cell = bd.getc(bx,by);
				if(!cell.isnull && arr[(bx+1)>>1]!="." && arr[(bx+1)>>1]!="0"){
					cell.anum = parseInt(arr[(bx+1)>>1]);
				}
			}
		}
	},
	encodeQans_kanpen : function(){
		var bd = this.owner.board;
		for(var by=bd.minby+1;by<bd.maxby;by+=2){
			for(var bx=bd.minbx+1;bx<bd.maxbx;bx+=2){
				var cell = bd.getc(bx,by);
				if(cell.isnull){ this.datastr += ". ";}
				else if(cell.ques===51){ this.datastr += ". ";}
				else if(cell.anum  > 0){ this.datastr += (cell.anum.toString() + " ");}
				else                   { this.datastr += "0 ";}
			}
			if(by<bd.maxby-1){ this.datastr += "/";}
		}
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.checkRowsColsPartly(this.isSameNumber, function(cell){ return cell.is51cell();}, true) ){
			this.setAlert('同じ数字が同じ列に入っています。','Same number is in the same row.'); return false;
		}

		if( !this.checkRowsColsPartly(this.isTotalNumber, function(cell){ return cell.is51cell();}, false) ){
			this.setAlert('数字の下か右にある数字の合計が間違っています。','The sum of the cells is not correct.'); return false;
		}

		if( !this.checkAllCell(function(cell){ return (!cell.is51cell() && cell.getAnum()<=0);}) ){
			this.setAlert('すべてのマスに数字が入っていません。','There is a empty cell.'); return false;
		}

		return true;
	},
	check1st : function(){ return this.checkAllCell(function(cell){ return (!cell.is51cell() && cell.getAnum()<=0);});},

	isSameNumber : function(keycellpos, clist){
		if(!this.isDifferentNumberInClist(clist, function(cell){ return cell.getAnum();})){
			this.owner.board.getobj(keycellpos[0],keycellpos[1]).seterr(1);
			return false;
		}
		return true;
	},
	isTotalNumber : function(keycellpos, clist){
		var number, keyobj=this.owner.board.getobj(keycellpos[0], keycellpos[1]), dir=keycellpos[2];
		if     (dir===k.RT){ number = keyobj.getQnum();}
		else if(dir===k.DN){ number = keyobj.getQdir();}

		var sum = 0;
		for(var i=0;i<clist.length;i++){
			if(clist[i].getAnum()>0){ sum += clist[i].getAnum();}
			else{ return true;}
		}
		if(number>0 && sum!=number){
			keyobj.seterr(1);
			clist.seterr(1);
			return false;
		}
		return true;
	}
}
});

})();
