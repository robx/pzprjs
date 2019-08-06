//
// パズル固有スクリプト部 キンコンカン版 kinkonkan.js
//
(function(pidlist, classbase){
	if(typeof module==='object' && module.exports){module.exports = [pidlist, classbase];}
	else{ pzpr.classmgr.makeCustom(pidlist, classbase);}
}(
['kinkonkan'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputModes : {edit:['border','letter','letter-','number','clear']},
	mouseinput_clear : function(){
		this.inputclean_excell();
	},
	mouseinput_number : function(){
		if(this.mousestart){ this.inputqnum_excell();}
	},
	mouseinput_other : function(){
		if(this.inputMode.indexOf('letter')===0 && this.mousestart){ this.inputqchar_excell();}
	},
	mouseinput_auto : function(){
		if(this.puzzle.playmode){
			if(this.mousestart || (this.mousemove && this.inputData!==null)){
				this.inputslash();
			}
		}
		else if(this.puzzle.editmode){
			if(this.mousestart){
				this.inputedit_onstart();
			}
			else if(this.mousemove){
				if(this.btn==='left'){ this.inputborder();}
			}
		}
	},

	// board.haslightがerrclear関数で消えてしまうのでその前に値を保存しておく
	mouseevent : function(step){
		this.isclearflash = false;
		if(step===0){
			var excell = this.getpos(0).getex();
			if(!excell.isnull && excell.qinfo===1){ this.isclearflash = true;}
		}

		this.common.mouseevent.call(this, step);
	},

	inputslash : function(){
		var cell = this.getcell();
		if(cell.isnull){ this.inputflash(); return;}

		var state = this.inputData;
		// ドラッグ入力時のインプットルーチン
		if     (state===-1 || state===0){ }
		else if(state!==null){ return;} // 1,2,11,12
		// マウスボタン押下時のインプットルーチン
		else{
			var current = cell.getState();
			if     (this.btn==='left') { state = ((current + 6) % 4) - 1;}
			else if(this.btn==='right'){ state = ((current + 4) % 4) - 1;}
		}

		cell.setState(state);
		cell.drawaround();

		this.inputData = state;
	},
	inputflash : function(){
		var excell = this.getpos(0).getex(), puzzle = this.puzzle, board = puzzle.board;
		if(excell.isnull || this.mouseCell===excell){ return;}

		if(this.isclearflash){
			board.lightclear();
			this.mousereset();
		}
		else{
			board.flashlight(excell);
			this.inputData=11;
			this.mouseCell = excell;
		}
	},

	inputedit_onstart : function(){
		var piece = this.getcell_excell(); /* cell or excell */
		var bd = this.board;
		if(piece.isnull){ return;}

		if(piece.group!=='excell'){
			this.inputborder();
		}
		else if(piece!==this.cursor.getex()){
			this.setcursor(piece);
			this.mousereset();
		}
		else{
			var excell = piece;
			if(excell.qinfo!==1){ bd.flashlight(excell);}
			else{ bd.lightclear();}

			this.mousereset();
		}
	},

	inputclean_excell : function(){
		var excell = this.getcell_excell();
		if(excell.isnull || excell.group!=='excell'){ return;}

		this.mouseCell = excell;

		var exlist = new this.klass.EXCellList([excell]);
		if(this.puzzle.playmode){ exlist.ansclear();}
		else                    { exlist.allclear();}

		excell.draw();
	},
	inputqnum_excell : function(){
		var excell = this.getcell_excell();
		if(excell.isnull || excell.group!=='excell'){ return;}

		if(excell!==this.cursor.getex()){
			this.setcursor(excell);
		}
		else{
			this.inputqnum_main(excell);
		}
	},
	inputqchar_excell : function(){
		var excell = this.getcell_excell();
		if(excell.isnull || excell.group!=='excell'){ return;}

		if(excell!==this.cursor.getex()){
			this.setcursor(excell);
		}
		else{
			var val = excell.qchar, isInc = ((this.inputMode==='letter')===(this.btn==='left'));
			if(isInc){ val = (val<104 ? val+1 : 0);}
			else     { val = (val>0 ? val-1 : 104);}
			excell.setQchar(val);
			excell.draw();
		}
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,
	moveTarget  : function(ca){
		return this.moveEXCell(ca);
	},

	keyinput : function(ca){
		this.key_inputexcell(ca);
	},
	key_inputexcell : function(ca){
		var excell = this.cursor.getex(), bd = this.board;
		if((excell.bx===bd.minbx+1||excell.bx===bd.maxbx-1)&&
		   (excell.by===bd.minby+1||excell.by===bd.maxby-1)){ return;}

		var qn = excell.qnum;
		if('0'<=ca && ca<='9'){
			var num = +ca, max = excell.getmaxnum();

			if(qn<=0 || this.prev!==excell){
				if(num<=max){ excell.setQnum(num);}
			}
			else{
				if(qn*10+num<=max){ excell.setQnum(qn*10+num);}
				else if (num<=max){ excell.setQnum(num);}
			}
		}
		else if(ca.length===1 && 'a'<=ca && ca<='z'){
			var num = parseInt(ca,36)-10;
			var canum = excell.qchar;
			if     ((canum-1)%26===num && canum>0 && canum<79){ excell.setQchar(canum+26);}
			else if((canum-1)%26===num){ excell.setQchar(0);}
			else{ excell.setQchar(num+1);}
		}
		else if(ca==='-'){
			if(qn!==-1){ excell.setQnum(-1);}
			else       { excell.setQnum(-1); excell.setQchar(0);}
		}
		else if(ca==='F4'){
			if(excell.qinfo!==1){ bd.flashlight(excell);}
			else{ bd.lightclear();}
		}
		else if(ca===' '){ excell.setQnum(-1); excell.setQchar(0);}
		else{ return;}

		this.prev = excell;
		this.cursor.draw();
	}
},

TargetCursor:{
	initCursor : function(){
		this.init(-1,-1);
	}
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	// Qans/Qsubを統合して扱うkanpen的な関数
	// ここでは なし=0, 斜線=1/2, 補助記号=-1
	getState : function(){
		return (this.qans>30 ? this.qans-30 : (this.qsub!==0 ? -1 : 0));
	},
	setState : function(val){
		var qans = [-1,0,31,32][val+1];
		if(qans!==-1){ this.setQans(qans); this.setQsub(0);}
		else         { this.setQans(0);    this.setQsub(1);}
	}
},

EXCell:{
	disInputHatena : true,
	minnum : 0
},

Board:{
	cols : 8,
	rows : 8,

	hasborder : 1,
	hasexcell : 2,

	haslight : false,

	flashlight : function(excell){
		this.lightclear();
		this.searchLight(excell, true);
		this.puzzle.redraw();
	},
	lightclear : function(){
		if(!this.haslight){ return;}
		for(var i=0;i<this.cell.length  ;i++){ this.cell[i].qinfo=0;}
		for(var i=0;i<this.excell.length;i++){ this.excell[i].qinfo=0;}
		this.haslight = false;
		this.puzzle.redraw();
	},
	searchLight : function(startexcell, setlight){
		var ccnt=0, ldata = [];
		for(var c=0;c<this.cell.length;c++){ ldata[c]=0;}

		var pos = startexcell.getaddr(), dir=0;
		if     (pos.by===this.minby+1){ dir=2;}
		else if(pos.by===this.maxby-1){ dir=1;}
		else if(pos.bx===this.minbx+1){ dir=4;}
		else if(pos.bx===this.maxbx-1){ dir=3;}

		while(dir!==0){
			pos.movedir(dir,2);

			var cell = pos.getc();
			if(cell.isnull){ break;}

			var qb = cell.qans, cc = cell.id;
			if(qb===31){
				if     (dir===1){ ldata[cc]=(!isNaN({4:1,1:1}[ldata[cc]])?1:2); dir=3;}
				else if(dir===2){ ldata[cc]=(!isNaN({2:1,1:1}[ldata[cc]])?1:4); dir=4;}
				else if(dir===3){ ldata[cc]=(!isNaN({2:1,1:1}[ldata[cc]])?1:4); dir=1;}
				else if(dir===4){ ldata[cc]=(!isNaN({4:1,1:1}[ldata[cc]])?1:2); dir=2;}
			}
			else if(qb===32){
				if     (dir===1){ ldata[cc]=(!isNaN({5:1,1:1}[ldata[cc]])?1:3); dir=4;}
				else if(dir===2){ ldata[cc]=(!isNaN({3:1,1:1}[ldata[cc]])?1:5); dir=3;}
				else if(dir===3){ ldata[cc]=(!isNaN({5:1,1:1}[ldata[cc]])?1:3); dir=2;}
				else if(dir===4){ ldata[cc]=(!isNaN({3:1,1:1}[ldata[cc]])?1:5); dir=1;}
			}
			else{ ldata[cc]=1; continue;}

			ccnt++;
			if(ccnt>2*this.cell.length){ break;} // 念のためガード条件(多分引っかからない)
		}

		var destec = pos.getex().id;
		if(!!setlight){
			for(var c=0;c<this.excell.length;c++){ this.excell[c].qinfo=0;}
			startexcell.qinfo = 1;
			this.excell[destec].qinfo  = 1;
			for(var c=0;c<this.cell.length;c++){ this.cell[c].qinfo=ldata[c];}
			this.hasinfo = true;
		}

		return {cnt:ccnt, dest:destec};
	}
},
BoardExec:{
	adjustBoardData : function(key,d){
		if(key & this.TURNFLIP){ // 反転・回転全て
			var clist = this.board.cell;
			for(var i=0;i<clist.length;i++){
				var cell = clist[i];
				cell.setQans({0:0,31:32,32:31}[cell.qans]);
			}
		}
	}
},

AreaRoomGraph:{
	enabled : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	gridcolor_type : "LIGHT",

	errcolor1 : "black",	// drawSlashes関係 quescolorと同じ
	errcolor2 : "black",	// drawSlashes関係 quescolorと同じ

	lightcolor : "rgb(255, 255, 127)",

	paint : function(){
		this.drawBGCells_kinkonkan();
		this.drawDotCells();

		this.drawGrid();
		this.drawBorders();

		this.drawSlashes();

		this.drawBGEXcells();
		this.drawNumbersEXcell();
		this.drawChassis();

		this.drawTarget();
	},

	drawBGCells_kinkonkan : function(){
		var g = this.vinc('cell_back', 'crispEdges');

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i], info = cell.error || cell.qinfo;
			var px = cell.bx*this.bw, py = cell.by*this.bh;

			g.fillStyle = (cell.error!==0 ? this.errbcolor1 : this.lightcolor);

			g.vid = "c_bglight_"+cell.id;
			if     (info===1){ g.fillRectCenter(px, py, this.bw+0.5, this.bh+0.5);}
			else if(info!==0){ this.drawTriangle1(px, py, cell.qinfo);}
			else{ g.vhide();}
		}
	},
	getBGEXcellColor : function(excell){
		if(excell.qinfo===1){ return this.lightcolor;}
		return null;
	},

	fontsizeratio : 0.6,
	fontwidth : [null,0.5,0.4],
	getQuesNumberText : function(excell){
		var text="", canum = excell.qchar, num = excell.qnum;
		if(canum===0){ text = "";}
		else{ text = this.getNumberTextCore_letter(canum<=52 ? canum : canum-52);}
		if(num>=0){ text+=num.toString(10);}
		return text;
	},
	getQuesNumberColor : function(excell){
		if     (excell.error===1){ return "rgb(192, 0, 0)";}
		else if(excell.qchar>52) { return "blue";} // 2色目
		return this.quescolor;
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodeBorder();
		this.decodeKinkonkan();
	},
	encodePzpr : function(type){
		this.encodeBorder();
		this.encodeKinkonkan();
	},

	decodeKinkonkan : function(){
		// 盤面外数字のデコード
		var subint = [];
		var ec=0, a=0, bstr = this.outbstr, bd = this.board;
		for(var i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i), excell=bd.excell[ec];

			if     (this.include(ca,'A','Z')){ subint.push(ec); excell.qchar = parseInt(ca,36)-9;}
			else if(this.include(ca,'0','9')){ subint.push(ec); excell.qchar = parseInt(ca,36)-9+(parseInt(bstr.charAt(i+1),10)+1)*26; i++;}
			else if(this.include(ca,'a','z')){ ec+=(parseInt(ca,36)-10);}

			ec++;
			if(ec>=bd.excell.length){ a=i+1; break;}
		}
		ec=0;
		for(var i=a;i<bstr.length;i++){
			var ca = bstr.charAt(i), excell=bd.excell[subint[ec]];
			if     (ca==='.'){ excell.qnum = -2;}
			else if(ca==='-'){ excell.qnum = parseInt(bstr.substr(i+1,2),16); i+=2;}
			else             { excell.qnum = parseInt(bstr.substr(i  ,1),16);}

			ec++;
			if(ec>=subint.length){ a=i+1; break;}
		}

		this.outbstr = bstr.substr(a);
	},
	encodeKinkonkan : function(){
		var cm="", cm2="", bd = this.board;

		// 盤面外部分のエンコード
		var count=0;
		for(var ec=0;ec<bd.excell.length;ec++){
			var pstr = "", val = bd.excell[ec].qchar, qnum = bd.excell[ec].qnum;

			if(val> 0 && val<=104){
				if(val<=26){ pstr = (val+9).toString(36).toUpperCase();}
				else       { pstr = (((val-1)/26-1)|0).toString(10) + ((val-1)%26+10).toString(16).toUpperCase();}

				if     (qnum===-2){ cm2+=".";}
				else if(qnum  <16){ cm2+=("" +qnum.toString(16));}
				else              { cm2+=("-"+qnum.toString(16));}
			}
			else{ count++;}

			if(count===0){ cm += pstr;}
			else if(pstr || count===26){ cm+=((9+count).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm+=(9+count).toString(36);}

		this.outbstr += (cm+cm2);
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeAreaRoom();
		this.decodeKinkonkan();
		if(this.filever===0){
			this.decodeKinkonkanAns_old();
		}
	},
	encodeData : function(){
		this.filever = 1;
		this.encodeAreaRoom();
		this.encodeKinkonkan();
	},

	decodeKinkonkan : function(){
		var filever = this.filever;
		this.decodeCellExcell(function(obj, ca){
			if(ca==="."){ return;}
			else if(obj.group==='excell'){
				var inp = ca.split(",");
				if(inp[0]!==""){ obj.qchar = +inp[0];}
				if(inp[1]!==""){ obj.qnum  = +inp[1];}
			}
			else if(obj.group==='cell' && filever===1){
				if     (ca==="+"){ obj.qsub = 1;}
				else if(ca==="1"){ obj.qans = 31;}
				else if(ca==="2"){ obj.qans = 32;}
			}
		});
	},
	encodeKinkonkan : function(){
		this.encodeCellExcell(function(obj){
			if(obj.isnull){}
			else if(obj.group==='excell'){
				var dir=obj.qchar, qn=obj.qnum;
				var str1 = (dir!== 0 ? ""+dir : "");
				var str2 = (qn !==-1 ? ""+qn  : "");
				if(str1||str2){ return (str1+","+str2+" ");}
			}
			else if(obj.group==='cell'){
				if     (obj.qans===31){ return "1 ";}
				else if(obj.qans===32){ return "2 ";}
				else if(obj.qsub=== 1){ return "+ ";}
			}
			return ". ";
		});
	},

	decodeKinkonkanAns_old : function(){
		this.decodeCell( function(cell,ca){
			if     (ca==="+"){ cell.qsub = 1;}
			else if(ca==="1"){ cell.qans = 31;}
			else if(ca==="2"){ cell.qans = 32;}
		});
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checklist : [
		"checkSingleMirrorInRoom",
		"checkPairMirror",
		"checkReflectionCount",
		"checkExistMirrorInRoom"
	],

	checkSingleMirrorInRoom : function(){
		this.checkAllBlock(this.board.roommgr, function(cell){ return cell.qans!==0;}, function(w,h,a,n){ return (a<=1);}, "bkObjGe2");
	},
	checkExistMirrorInRoom : function(){
		this.checkAllBlock(this.board.roommgr, function(cell){ return cell.qans!==0;}, function(w,h,a,n){ return (a!==0);}, "bkNoObj");
	},

	checkPairMirror      : function(){ this.checkMirrors(1, "pairedLetterNe");},
	checkReflectionCount : function(){ this.checkMirrors(2, "pairedNumberNe");},
	checkMirrors : function(type, code){
		var d = [], bd = this.board, result = true, errorExcell = null;
		for(var ec=0;ec<bd.excell.length;ec++){
			var excell = bd.excell[ec];
			if(!isNaN(d[ec]) || excell.qnum===-1 || excell.qchar===0){ continue;}
			var ret = bd.searchLight(excell, false), excell2 = bd.excell[ret.dest];
			if( (type===1&& (excell.qchar!==excell2.qchar) )||
				(type===2&&((excell.qnum !==excell2.qnum) || excell.qnum!==ret.cnt))
			){
				result = false;
				if(this.checkOnly){ break;}

				excell.seterr(1);
				excell2.seterr(1);
				if(!errorExcell){ errorExcell = excell;}
			}
			d[ec]=1; d[ret.dest]=1;
		}
		if(!result){
			this.failcode.add(code);
			if(errorExcell){ bd.searchLight(errorExcell, true);}
		}
	}
},

FailCode:{
	bkNoObj  : ["斜線の引かれていない部屋があります。", "A room has no mirrors."],
	bkObjGe2 : ["斜線が複数引かれた部屋があります。", "A room has plural mirrors."],
	pairedLetterNe : ["光が同じ文字の場所へ到達しません。", "Beam from a light doesn't reach one's pair."],
	pairedNumberNe : ["光の反射回数が正しくありません。", "The count of refrection is wrong."]
}
}));
