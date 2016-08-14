//
// パズル固有スクリプト部 カックル版 kakuru.js
//
(function(pidlist, classbase){
	if(typeof module==='object' && module.exports){module.exports = [pidlist, classbase];}
	else{ pzpr.classmgr.makeCustom(pidlist, classbase);}
}(
['kakuru'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.mousestart){ this.inputqnum_kakuru();}
	},
	inputqnum_kakuru : function(){
		var cell = this.getcell();
		if(cell.isnull || (cell.ques===1 && cell===this.cursor.getc())){ return;}
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
		var cell = this.cursor.getc();
		if(cell.enableSubNumberArray && ca==='shift' && cell.noNum()){
			this.cursor.chtarget();
		}
		else if(('0'<=ca && ca<='9') || ca==='BS' || ca==='-'){
			if(cell.ques===1){ return;}
			this.key_inputqnum_main(cell,ca);
		}
		else if(ca===' '){
			if(this.puzzle.editmode){ cell.setQues(0);}
			cell.setNum(-1);
			cell.draw();
			this.prev = cell;
		}
		// qはキーボードのQ, q1,q2はキーポップアップから
		else if(this.puzzle.editmode && (ca==='q'||ca==='q1'||ca==='q2')){
			if(ca==='q'){ ca = (cell.ques!==1?'q1':'q2');}
			if(ca==='q1'){
				cell.setQues(1);
				cell.setNum(-1);
			}
			else if(ca==='q2'){ cell.setQues(0);}
			cell.draw();
			this.prev = cell;
		}
		else{ return;}
	}
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	enableSubNumberArray : true,
	maxnum : function(){
		return (this.puzzle.editmode?44:9);
	}
},
Board:{
	cols : 7,
	rows : 7
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	gridcolor_type : "LIGHT",

	cellcolor_func : "ques",

	paint : function(){
		this.drawBGCells();
		this.drawTargetSubNumber();
		this.drawGrid();
		this.drawShadedCells();

		this.drawSubNumbers();
		this.drawNumbers();

		this.drawChassis();

		this.drawCursor();
	},

	// オーバーライド drawBGCells用
	getBGCellColor : function(cell){
		if     (cell.qnum !==-1){ return "rgb(208, 208, 208)";}
		else if(cell.error=== 1){ return this.errbcolor1;}
		return null;
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodeKakuru();
	},
	encodePzpr : function(type){
		this.encodeKakuru();
	},

	decodeKakuru : function(){
		var c=0, i=0, bstr = this.outbstr, bd = this.board;
		for(i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i), cell=bd.cell[c];

			if     (ca==='+'){ cell.ques = 1;}
			else if(this.include(ca,"k","z")){ c+=(parseInt(ca,36)-19);}
			else if(ca!=='.'){ cell.qnum = this.decval(ca);}

			c++;
			if(!bd.cell[c]){ break;}
		}
		this.outbstr = bstr.substr(i);
	},
	encodeKakuru : function(type){
		var cm="", count=0, bd = this.board;
		for(var c=0;c<bd.cell.length;c++){
			var pstr="", cell=bd.cell[c];
			if     (cell.ques=== 1){ pstr = "+";}
			else if(cell.qnum!==-1){ pstr = this.encval(cell.qnum);}
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
		return -1;
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
		this.decodeCell( function(cell,ca){
			if     (ca==="b"){ cell.ques = 1;}
			else if(ca==="?"){ cell.qnum =-2;}
			else if(ca!=="."){ cell.qnum = +ca;}
		});
		this.decodeCell( function(cell,ca){
			if(ca!=="."&&ca!=="0"){ cell.anum = +ca;}
		});
	},
	encodeData : function(){
		this.encodeCell( function(cell){
			if     (cell.ques=== 1){ return "b ";}
			else if(cell.qnum===-2){ return "? ";}
			else if(cell.qnum>=  0){ return cell.qnum+" ";}
			else{ return ". ";}
		});
		this.encodeCell( function(cell){
			if(cell.ques===1||cell.qnum!==-1){ return ". ";}
			return (cell.anum!==-1 ? cell.anum+" " : "0 ");
		});
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checklist : [
		"checkAroundPlNums",
		"checkSumOfNumber",
		"checkAdjacentNumbers",
		"checkNoNumCell+"
	],

	checkAroundPlNums : function(type){
		var bd = this.board;
		allloop:
		for(var c=0;c<bd.cell.length;c++){
			var cell = bd.cell[c];
			if(cell.ques===1 || cell.qnum<=0){ continue;}

			var bx=cell.bx, by=cell.by;
			var d={1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0};
			var clist=new this.klass.CellList(), clist0 = bd.cellinside(bx-2,by-2,bx+2,by+2);
			clist.add(cell);
			for(var i=0;i<clist0.length;i++){
				var cell2 = clist0[i];
				if(cell!==cell2 && cell2.ques===0 && cell2.qnum===-1){
					var qa = cell2.anum;
					if(qa>0){ d[qa]++; clist.add(cell2);}
				}
			}
			for(var n=1;n<=9;n++){
				if(d[n]<=1){ continue;}
				
				this.failcode.add("nqAroundDup");
				if(this.checkOnly){ break allloop;}
				cell.seterr(1);
				clist.filter(function(cell){ return (cell.anum===n);}).seterr(1);
			}
		}
	},
	checkSumOfNumber : function(type){
		var bd = this.board;
		for(var c=0;c<bd.cell.length;c++){
			var cell = bd.cell[c];
			if(cell.ques===1 || cell.qnum<=0){ continue;}

			var cnt=0, bx=cell.bx, by=cell.by;
			var clist=new this.klass.CellList(), clist0 = bd.cellinside(bx-2,by-2,bx+2,by+2);
			clist.add(cell);
			for(var i=0;i<clist0.length;i++){
				var cell2 = clist0[i];
				if(cell!==cell2 && cell2.ques===0 && cell2.qnum===-1){
					var qa = cell2.anum;
					if(qa>0){ cnt+=qa; clist.add(cell2);}
					else    { cnt=cell.qnum; break;}
				}
			}
			if(cell.qnum===cnt){ continue;}
			
			this.failcode.add("nqAroundSumNe");
			if(this.checkOnly){ break;}
			clist.seterr(1);
		}
	},
	checkAdjacentNumbers : function(){
		var bd = this.board;
		for(var c=0;c<bd.cell.length;c++){
			var cell = bd.cell[c];
			if(cell.anum<=0){ continue;}
			var bx = cell.bx, by = cell.by;
			var clist=new this.klass.CellList(), clist0 = bd.cellinside(bx,by,bx+2,by+2);
			clist.add(cell);
			clist0.add(bd.getc(bx-2,by+2)); // 右・左下・下・右下の4箇所だけチェック
			for(var i=0;i<clist0.length;i++){
				var cell2 = clist0[i];
				if(cell!==cell2 && cell.anum===cell2.anum){ clist.add(cell2);}
			}
			if(clist.length<=1){ continue;}
			
			this.failcode.add("nmAround");
			if(this.checkOnly){ break;}
			clist.seterr(1);
		}
	}
},

FailCode:{
	nmAround : ["同じ数字がタテヨコナナメに隣接しています。","Same numbers are adjacent."],
	nqAroundDup : ["初めから出ている数字の周りに同じ数字が入っています。","There are same numbers around the pre-numbered cell."],
	nqAroundSumNe : ["初めから出ている数字の周りに入る数の合計が正しくありません。","A sum of numbers around the pre-numbered cell is incorrect."]
}
}));
