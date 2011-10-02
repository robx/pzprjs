//
// パズル固有スクリプト部 カックル版 kakuru.js v3.4.0
//
pzprv3.custom.kakuru = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputedit : function(){ if(this.mousestart){ this.inputqnum_kakuru();}},
	inputplay : function(){ if(this.mousestart){ this.inputqnum_kakuru();}},
	inputqnum_kakuru : function(){
		var cell = this.getcell();
		if(cell.isnull || (cell.getQues()===1 && cell===tc.getTCC())){ return;}
		this.inputqnum();
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,
	enableplay : true,

	keyinput : function(ca){
		this.key_inputqnum_kakuru(ca);
	},
	key_inputqnum_kakuru : function(ca){
		var cell = tc.getTCC();

		if(('0'<=ca && ca<='9') || ca==='-'){
			if(cell.getQues()===1){ return;}
			if(!this.key_inputqnum_main(cell,ca)){ return;}
		}
		else if(ca===' '){
			if(this.owner.editmode){ cell.setQues(0);}
			cell.setNum(-1);
		}
		// qはキーボードのQ, q1,q2はキーポップアップから
		else if(this.owner.editmode && (ca==='q'||ca==='q1'||ca==='q2')){
			if(ca==='q'){ ca = (cell.getQues()!==1?'q1':'q2');}
			if(ca==='q1'){
				cell.setQues(1);
				cell.setNum(-1);
			}
			else if(ca=='q2'){ cell.setQues(0);}
		}
		else{ return;}

		this.prev = cell;
		pc.paintCell(cell);
	},

	enablemake_p : true,
	enableplay_p : true,
	generate : function(mode,type){
		if(mode==1){
			this.inputcol('num','knumq1','q1','■');
			this.inputcol('num','knumq2','q2','□');
			this.inputcol('empty','','','');
			this.inputcol('empty','','','');
			this.insertrow();
		}
		this.inputcol('num','knum1','1','1');
		this.inputcol('num','knum2','2','2');
		this.inputcol('num','knum3','3','3');
		this.inputcol('num','knum4','4','4');
		this.insertrow();
		this.inputcol('num','knum5','5','5');
		this.inputcol('num','knum6','6','6');
		this.inputcol('num','knum7','7','7');
		this.inputcol('num','knum8','8','8');
		this.insertrow();
		this.inputcol('num','knum9','9','9');
		if(mode==1){ this.inputcol('num','knum0','0','0');}
		if(mode==1){ this.inputcol('num','knum_','-','?');}
		this.inputcol('num','knum.',' ',' ');
		this.insertrow();
	}
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	nummaxfunc : function(){
		return (bd.owner.editmode?44:9);
	}
},
Board:{
	qcols : 7,
	qrows : 7
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	setColors : function(){
		this.gridcolor = this.gridcolor_LIGHT;

		this.errbcolor1 = this.errbcolor1_DARK;
		this.errbcolor2 = "white";
	},
	paint : function(){
		this.drawBGCells();
		this.drawGrid();
		this.drawBlackCells();

		this.drawNumbers();

		this.drawChassis();

		this.drawCursor();
	},

	// オーバーライド drawBGCells用
	getBGCellColor : function(cell){
		if     (cell.qnum !==-1){ return "rgb(208, 208, 208)";}
		else if(cell.error=== 1){ return this.errbcolor1;}
		return null;
	},
	// オーバーライド drawBlackCells用
	getCellColor : function(cell){
		if(cell.ques===1){ return this.cellcolor;}
		return null;
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		this.decodeKakuru();
	},
	pzlexport : function(type){
		this.encodeKakuru();
	},

	decodeKakuru : function(){
		var cell=0, i=0, bstr = this.outbstr;
		for(i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i), obj=bd.cell[cell];

			if     (ca==='+'){ obj.ques = 1;}
			else if(this.include(ca,"k","z")){ cell+=(parseInt(ca,36)-19);}
			else if(ca!=='.'){ obj.qnum = this.decval(ca);}

			cell++;
			if(cell>=bd.cellmax){ break;}
		}
		this.outbstr = bstr.substr(i);
	},
	encodeKakuru : function(type){
		var cm="", count=0;
		for(var c=0;c<bd.cellmax;c++){
			var pstr="", obj=bd.cell[c];
			if     (obj.ques=== 1){ pstr = "+";}
			else if(obj.qnum!==-1){ pstr = this.encval(obj.qnum);}
			else{ count++;}

			if(count===0){ cm+=pstr;}
			else if(pstr || count===17){
				if(count===1){ cm+=("."+pstr);}
				else{ cm+=((count+18).toString(36)+pstr);}
				count=0;
			}
		}
		if(count===1){ cm+=".";}
		else if(count>1){ cm+=((count+18).toString(36));}

		this.outbstr += cm;
	},
	decval : function(ca){
		if     (ca==='_')        { return -2;}
		else if(ca>='0'&&ca<='9'){ return parseInt(ca,36);}
		else if(ca>='a'&&ca<='j'){ return parseInt(ca,36);}
		else if(ca>='A'&&ca<='Z'){ return parseInt(ca,36)+10;}
		return "";
	},
	encval : function(val){
		if     (val===-2)        { return "_";}
		else if(val>= 1&&val<=19){ return val.toString(36).toLowerCase();}
		else if(val>=20&&val<=45){ return (val-10).toString(36).toUpperCase();}
		return "0";
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCell( function(obj,ca){
			if     (ca==="b"){ obj.ques = 1;}
			else if(ca==="?"){ obj.qnum =-2;}
			else if(ca!=="."){ obj.qnum = parseInt(ca);}
		});
		this.decodeCell( function(obj,ca){
			if(ca!=="."&&ca!=="0"){ obj.anum = parseInt(ca);}
		});
	},
	encodeData : function(){
		this.encodeCell( function(obj){
			if     (obj.ques=== 1){ return "b ";}
			else if(obj.qnum===-2){ return "? ";}
			else if(obj.qnum>=  0){ return ""+obj.qnum.toString()+" ";}
			else{ return ". ";}
		});
		this.encodeCell( function(obj){
			if(obj.ques===1||obj.qnum!==-1){ return ". ";}
			return (obj.anum!==-1 ? ""+obj.anum.toString()+" " : "0 ");
		});
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.checkAroundPrenums() ){
			this.setAlert('初めから出ている数字の周りに同じ数字が入っています。','There are same numbers around the pre-numbered cell.'); return false;
		}

		if( !this.checkNumber() ){
			this.setAlert('初めから出ている数字の周りに入る数の合計が正しくありません。','A sum of numbers around the pre-numbered cell is incorrect.'); return false;
		}

		if( !this.checkAroundNumbers() ){
			this.setAlert('同じ数字がタテヨコナナメに隣接しています。','Same numbers is adjacent.'); return false;
		}

		if( !this.checkAllCell(function(cell){ return (cell.getQues()===0 && cell.noNum());}) ){
			this.setAlert('何も入っていないマスがあります。','There is a empty cell.'); return false;
		}

		return true;
	},
	check1st : function(){ return this.checkAllCell(function(cell){ return (cell.getQues()===0 && cell.noNum());});},

	checkAroundPrenums : function(type){
		var result = true;
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c];
			if(cell.getQues()===1 || cell.getQnum()<=0){ continue;}

			var bx=cell.bx, by=cell.by;
			var d={1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0};
			var clist=new pzprv3.core.PieceList(this.owner), clist0 = bd.cellinside(bx-2,by-2,bx+2,by+2);
			clist.add(cell);
			for(var i=0;i<clist0.length;i++){
				var cell2 = clist0[i];
				if(cell!==cell2 && cell2.ques===0 && cell2.qnum===-1){
					var qa = cell2.anum;
					if(qa>0){ d[qa]++; clist.add(cell2);}
				}
			}
			for(var n=1;n<=9;n++){
				if(d[n]>1){
					if(this.inAutoCheck){ return false;}
					cell.seterr(1);
					for(i=0;i<clist.length;i++){ if(clist[i].getAnum()===n){ clist[i].seterr(1);} }
					result = false;
				}
			}
		}
		return result;
	},
	checkNumber : function(type){
		var result = true;
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c];
			if(cell.getQues()===1 || cell.getQnum()<=0){ continue;}

			var cnt=0, bx=cell.bx, by=cell.by;
			var clist=new pzprv3.core.PieceList(this.owner), clist0 = bd.cellinside(bx-2,by-2,bx+2,by+2);
			clist.add(cell);
			for(var i=0;i<clist0.length;i++){
				var cell2 = clist0[i];
				if(cell!==cell2 && cell2.ques===0 && cell2.qnum===-1){
					var qa = cell2.anum;
					if(qa>0){ cnt+=qa; clist.add(cell2);}
					else    { cnt=cell.getQnum(); break;}
				}
			}
			if(cell.getQnum()!==cnt){
				if(this.inAutoCheck){ return false;}
				clist.seterr(1); result = false;
			}
		}
		return result;
	},
	checkAroundNumbers : function(){
		var result = true;
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c];
			if(cell.getAnum()<=0){ continue;}
			var bx = cell.bx, by = cell.by;
			var clist=new pzprv3.core.PieceList(this.owner), clist0 = bd.cellinside(bx,by,bx+2,by+2);
			clist.add(cell);
			clist0.add(bd.getc(bx-2,by+2)); // 右・左下・下・右下の4箇所だけチェック
			for(var i=0;i<clist0.length;i++){
				var cell2 = clist0[i];
				if(cell!==cell2 && cell.anum===cell2.anum){ clist.add(cell2);}
			}
			if(clist.length>1){
				if(this.inAutoCheck){ return false;}
				clist.seterr(1); result = false;
			}
		}
		return result;
	}
}
};
