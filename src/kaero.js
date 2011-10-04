//
// パズル固有スクリプト部 お家に帰ろう版 kaero.js v3.4.0
//
pzprv3.custom.kaero = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputedit : function(){
		if(this.mousestart || this.mousemove){ this.inputborder();}
		else if(this.mouseend && this.notInputted()){ this.inputqnum();}
	},
	inputplay : function(){
		if(this.mousestart || this.mousemove){
			if     (this.btn.Left) { this.inputLine();}
			else if(this.btn.Right){ this.inputpeke();}
		}
		else if(this.mouseend && this.notInputted()){
			this.inputlight();
		}
	},

	inputlight : function(){
		var cell = this.getcell();
		if(cell.isnull){ return;}

		if     (cell.getQsub()===0){ cell.setQsub(this.btn.Left?1:2);}
		else if(cell.getQsub()===1){ cell.setQsub(this.btn.Left?2:0);}
		else if(cell.getQsub()===2){ cell.setQsub(this.btn.Left?0:1);}
		cell.draw();
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,

	keyinput : function(ca){
		this.key_inputqnum_kaero(ca);
	},
	key_inputqnum_kaero : function(ca){
		var cell = tc.getTCC();

		if('a'<=ca && ca<='z'){
			var num = parseInt(ca,36)-10;
			var canum = cell.getQnum();
			if     ((canum-1)%26==num && canum>0 && canum<=26){ cell.setQnum(canum+26);}
			else if((canum-1)%26==num){ cell.setQnum(-1);}
			else{ cell.setQnum(num+1);}
		}
		else if(ca=='-'){ cell.setQnum(cell.getQnum()!==-2?-2:-1);}
		else if(ca==' '){ cell.setQnum(-1);}
		else{ return;}

		this.prev = cell;
		cell.draw();
	}
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	maxnum : 52,

	// 正答判定用
	qnum2 : -1,
	base : null
},

Board:{
	qcols : 6,
	qrows : 6,

	isborder : 1,

	searchMovedPosition : function(linfo){
		var minfo = this.owner.newInstance('AreaCellInfo');
		for(var c=0;c<this.cellmax;c++){ this.cell[c].qnum2=this.cell[c].qnum; this.cell[c].base = null;}
		for(var r=1;r<=linfo.max;r++){
			var clist = linfo.getclist(r);
			if(clist.length<=1){ continue;}
			var before=null, after=null;
			for(var i=0;i<clist.length;i++){
				var cell=clist[i];
				if(cell.lcnt()===1){
					if(cell.isNum()){ before=cell;}else{ after=cell;}
				}
			}
			if(before!==null && after!==null){
				after.qnum2 = before.qnum;
				before.qnum2 = -1;
				after.base = before;
			}
		}
	}
},

LineManager:{
	isCenterLine : true
},

AreaManager:{
	hasroom : true,
	lineToArea : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	setColors : function(){
		this.gridcolor = this.gridcolor_LIGHT;
		this.qsubcolor1 = "rgb(224, 224, 255)";
		this.qsubcolor2 = "rgb(255, 255, 144)";
		this.setBGCellColorFunc('qsub2');
	},
	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();
		this.drawBorders();

		this.drawTip();
		this.drawPekes(0);
		this.drawLines();

		this.drawCellSquare();
		this.drawNumbers_kaero();

		this.drawChassis();

		this.drawTarget();
	},

	drawCellSquare : function(){
		var g = this.vinc('cell_number_base', 'crispEdges');

		var rw = this.bw*0.7-1;
		var rh = this.bh*0.7-1;
		var header = "c_sq_";

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i];
			if(cell.qnum!=-1){
				if     (cell.error===1){ g.fillStyle = this.errbcolor1;}
				else if(cell.error===2){ g.fillStyle = this.errbcolor2;}
				else if(cell.qsub ===1){ g.fillStyle = this.qsubcolor1;}
				else if(cell.qsub ===2){ g.fillStyle = this.qsubcolor2;}
				else                   { g.fillStyle = "white";}

				if(this.vnop(header+cell.id,this.FILL)){
					g.fillRect(cell.px-rw, cell.py-rh, rw*2+1, rh*2+1);
				}
			}
			else{ this.vhide(header+cell.id);}
		}
	},
	drawNumbers_kaero : function(){
		var g = this.vinc('cell_number', 'auto');

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i], key='cell_'+cell.id, num = cell.qnum;
			if(num!==-1){
				var color = (cell.error===0 ? this.fontcolor : this.fontErrcolor);

				var text="";
				if     (num==-2)         { text ="?";}
				else if(num> 0&&num<= 26){ text+=(num+ 9).toString(36).toUpperCase();}
				else if(num>26&&num<= 52){ text+=(num-17).toString(36).toLowerCase();}
				else{ text+=num;}

				this.dispnum(key, 1, text, 0.85, color, cell.px, cell.py);
			}
			else{ this.hideEL(key);}
		}
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		this.decodeBorder();
		this.decodeKaero();
	},
	pzlexport : function(type){
		this.encodeBorder();
		this.encodeKaero();
	},

	decodeKaero : function(){
		var c=0, a=0, bstr = this.outbstr;
		for(var i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i), obj=bd.cell[c];

			if     (this.include(ca,'0','9')){ obj.qnum = parseInt(ca,36)+27;}
			else if(this.include(ca,'A','Z')){ obj.qnum = parseInt(ca,36)-9; }
			else if(ca==="-"){ obj.qnum = parseInt(bstr.charAt(i+1),36)+37; i++;}
			else if(ca==="."){ obj.qnum = -2;}
			else if(this.include(ca,'a','z')){ c+=(parseInt(ca,36)-10);}

			c++;
			if(c>=bd.cellmax){ a=i+1; break;}
		}

		this.outbstr = bstr.substring(a);
	},
	encodeKaero : function(){
		var cm="", count=0;
		for(var c=0;c<bd.cellmax;c++){
			var pstr = "", qnum = bd.cell[c].qnum;
			if     (qnum==-2){ pstr = ".";}
			else if(qnum>= 1 && qnum<=26){ pstr = ""+ (qnum+9).toString(36).toUpperCase();}
			else if(qnum>=27 && qnum<=36){ pstr = ""+ (qnum-27).toString(10);}
			else if(qnum>=37 && qnum<=72){ pstr = "-"+ (qnum-37).toString(36).toUpperCase();}
			else{ count++;}

			if(count==0){ cm += pstr;}
			else if(pstr||count==26){ cm+=((9+count).toString(36).toLowerCase()+pstr); count=0;}
		}
		if(count>0){ cm+=(9+count).toString(36).toLowerCase();}

		this.outbstr += cm;
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCellQnum();
		this.decodeCellQanssub();
		this.decodeBorderQues();
		this.decodeBorderLine();
	},
	encodeData : function(){
		this.encodeCellQnum();
		this.encodeCellQanssub();
		this.encodeBorderQues();
		this.encodeBorderLine();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){
		this.performAsLine = true;

		if( !this.checkLcntCell(3) ){
			this.setAlert('分岐している線があります。','There is a branch line.'); return false;
		}
		if( !this.checkLcntCell(4) ){
			this.setAlert('線が交差しています。','There is a crossing line.'); return false;
		}

		var linfo = bd.areas.getLareaInfo();
		if( !this.checkDoubleNumber(linfo) ){
			this.setAlert('アルファベットが繋がっています。','There are connected letters.'); return false;
		}
		if( !this.checkLineOverLetter() ){
			this.setAlert('アルファベットの上を線が通過しています。','A line goes through a letter.'); return false;
		}

		var rinfo = bd.areas.getRoomInfo();
		bd.searchMovedPosition(linfo);

		this.performAsLine = false;
		if( !this.checkSameObjectInRoom_kaero(rinfo) ){
			this.setAlert('１つのブロックに異なるアルファベットが入っています。','A block has plural kinds of letters.'); return false;
		}
		if( !this.checkGatheredObject(rinfo) ){
			this.setAlert('同じアルファベットが異なるブロックに入っています。','Same kinds of letters are placed different blocks.'); return false;
		}
		if( !this.checkNoObjectInRoom(rinfo, function(cell){ return cell.qnum2;}) ){
			this.setAlert('アルファベットのないブロックがあります。','A block has no letters.'); return false;
		}

		this.performAsLine = true;
		if( !this.checkDisconnectLine(linfo) ){
			this.setAlert('アルファベットにつながっていない線があります。','A line doesn\'t connect any letter.'); return false;
		}

		return true;
	},

	checkLineOverLetter : function(func){
		var result = true;
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c];
			if(cell.lcnt()>=2 && cell.isNum()){
				if(this.inAutoCheck){ return false;}
				if(result){ bd.border.seterr(2);}
				cell.setCellLineError(true);
				result = false;
			}
		}
		return result;
	},

	checkSameObjectInRoom_kaero : function(rinfo){
		var result=true, d=[];
		for(var i=1;i<=rinfo.max;i++){ d[i]=-1;}
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c], val = cell.qnum2;
			if(rinfo.id[c]===null || val===-1){ continue;}
			if(d[rinfo.id[c]]===-1 && val!==-1){ d[rinfo.id[c]] = val;}
			else if(d[rinfo.id[c]]!==val){
				if(this.inAutoCheck){ return false;}

				if(this.performAsLine){ bd.border.seterr(2); rinfo.setErrLareaByCell(cell,1);}
				else{ rinfo.getclistbycell(cell).seterr(1);}

				// 違うのはエラー表示部だけ
				for(var cc=0;cc<bd.cellmax;cc++){
					var cell2 = bd.cell[cc];
					if(rinfo.getRoomID(cell)===rinfo.getRoomID(cell2) && cell2.base!==null && rinfo.getRoomInfo(cell)!==rinfo.getRoomInfo(cell2.base))
						{ cell2.base.seterr(4);}
				}
				result = false;
			}
		}
		return result;
	},

	// 同じ値であれば、同じ部屋に存在することを判定する
	checkGatheredObject : function(rinfo){
		var d=[], dmax=0, val=[];
		for(var c=0;c<bd.cellmax;c++){ val[c]=bd.cell[c].qnum2; if(dmax<val[c]){ dmax=val[c];} }
		for(var i=0;i<=dmax;i++){ d[i]=-1;}
		for(var c=0;c<bd.cellmax;c++){
			if(val[c]===-1){ continue;}
			if(d[val[c]]===-1){ d[val[c]] = rinfo.id[c];}
			else if(d[val[c]]!==rinfo.id[c]){
				bd.cell.filter(function(cell){ return (val[c]===cell.getQnum());}).seterr(1);
				return false;
			}
		}
		return true;
	}
}
};
