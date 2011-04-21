//
// パズル固有スクリプト部 お家に帰ろう版 kaero.js v3.4.0
//
pzprv3.custom.kaero = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mousedown : function(){
		if(k.editmode){ this.inputborder();}
		else if(k.playmode){
			if     (this.btn.Left) { this.inputLine();}
			else if(this.btn.Right){ this.inputpeke();}
		}
	},
	mouseup : function(){
		if(this.notInputted()){
			if     (k.editmode){ this.inputqnum();}
			else if(k.playmode){ this.inputlight();}
		}
	},
	mousemove : function(){
		if(k.editmode){ this.inputborder();}
		else if(k.playmode){
			if     (this.btn.Left) { this.inputLine();}
			else if(this.btn.Right){ this.inputpeke();}
		}
	},

	inputlight : function(){
		var cc = this.cellid();
		if(cc===null){ return;}

		if     (bd.QsC(cc)==0){ bd.sQsC(cc, (this.btn.Left?1:2));}
		else if(bd.QsC(cc)==1){ bd.sQsC(cc, (this.btn.Left?2:0));}
		else if(bd.QsC(cc)==2){ bd.sQsC(cc, (this.btn.Left?0:1));}
		pc.paintCell(cc);
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
		var c = tc.getTCC();

		if('a'<=ca && ca<='z'){
			var num = parseInt(ca,36)-10;
			var canum = bd.QnC(c);
			if     ((canum-1)%26==num && canum>0 && canum<=26){ bd.sQnC(c,canum+26);}
			else if((canum-1)%26==num){ bd.sQnC(c,-1);}
			else{ bd.sQnC(c,num+1);}
		}
		else if(ca=='-'){ bd.sQnC(c,(bd.QnC(c)!=-2?-2:-1));}
		else if(ca==' '){ bd.sQnC(c,-1);}
		else{ return;}

		this.prev = c;
		pc.paintCell(tc.getTCC());
	}
},

//---------------------------------------------------------
// 盤面管理系
Board:{
	qcols : 6,
	qrows : 6,

	isborder : 1,

	maxnum : 52,

	getMovedPosition : function(linfo){
		var minfo = new pzprv3.core.AreaInfo();
		for(var c=0;c<bd.cellmax;c++){ minfo.id[c]=c;}
		for(var r=1;r<=linfo.max;r++){
			if(linfo.room[r].idlist.length<=1){ continue;}
			var before=null, after=null;
			for(var i=0;i<linfo.room[r].idlist.length;i++){
				var c=linfo.room[r].idlist[i];
				if(bd.lines.lcntCell(c)===1){
					if(bd.isNum(c)){ before=c;}else{ after=c;}
				}
			}
			if(before!==null && after!==null){
				minfo.id[after]=before;
				minfo.id[before]=null;
			}
		}
		return minfo;
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

	drawTip : function(){
		this.vinc('cell_linetip', 'auto');

		var tsize = this.cw*0.30;
		var tplus = this.cw*0.05;
		var header = "c_tip_";

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var c = clist[i];
			this.vdel([header+c]);
			if(bd.lines.lcntCell(c)===1 && bd.cell[c].qnum===-1){
				var dir=0, id=null;
				if     (bd.isLine(bd.ub(c))){ dir=2; id=bd.ub(c);}
				else if(bd.isLine(bd.db(c))){ dir=1; id=bd.db(c);}
				else if(bd.isLine(bd.lb(c))){ dir=4; id=bd.lb(c);}
				else if(bd.isLine(bd.rb(c))){ dir=3; id=bd.rb(c);}

				g.lineWidth = this.lw; //LineWidth
				if     (bd.border[id].error===1){ g.strokeStyle = this.errlinecolor1; g.lineWidth=g.lineWidth+1;}
				else if(bd.border[id].error===2){ g.strokeStyle = this.errlinecolor2;}
				else                            { g.strokeStyle = this.linecolor;}

				if(this.vnop(header+c,this.STROKE)){
					var px=bd.cell[c].cpx+1, py=bd.cell[c].cpy+1;
					if     (dir===1){ g.setOffsetLinePath(px,py ,-tsize, tsize ,0,-tplus , tsize, tsize, false);}
					else if(dir===2){ g.setOffsetLinePath(px,py ,-tsize,-tsize ,0, tplus , tsize,-tsize, false);}
					else if(dir===3){ g.setOffsetLinePath(px,py , tsize,-tsize ,-tplus,0 , tsize, tsize, false);}
					else if(dir===4){ g.setOffsetLinePath(px,py ,-tsize,-tsize , tplus,0 ,-tsize, tsize, false);}
					g.stroke();
				}
			}
		}
	},
	drawCellSquare : function(){
		this.vinc('cell_number_base', 'crispEdges');

		var mgnw = this.cw*0.15;
		var mgnh = this.ch*0.15;
		var header = "c_sq_";

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var c = clist[i], obj=bd.cell[c];
			if(obj.qnum!=-1){
				if     (obj.error===1){ g.fillStyle = this.errbcolor1;}
				else if(obj.error===2){ g.fillStyle = this.errbcolor2;}
				else if(obj.qsub ===1){ g.fillStyle = this.qsubcolor1;}
				else if(obj.qsub ===2){ g.fillStyle = this.qsubcolor2;}
				else                  { g.fillStyle = "white";}

				if(this.vnop(header+c,this.FILL)){
					g.fillRect(bd.cell[c].px+mgnw+1, bd.cell[c].py+mgnh+1, this.cw-mgnw*2-1, this.ch-mgnh*2-1);
				}
			}
			else{ this.vhide(header+c);}
		}
	},
	drawNumbers_kaero : function(){
		this.vinc('cell_number', 'auto');

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var c = clist[i], obj = bd.cell[c], key='cell_'+c;
			if(bd.cell[c].qnum!==-1){
				var num=bd.cell[c].qnum;

				var color = (bd.cell[c].error===0 ? this.fontcolor : this.fontErrcolor);

				var text="";
				if     (num==-2)         { text ="?";}
				else if(num> 0&&num<= 26){ text+=(num+ 9).toString(36).toUpperCase();}
				else if(num>26&&num<= 52){ text+=(num-17).toString(36).toLowerCase();}
				else{ text+=num;}

				this.dispnum(key, 1, text, 0.85, color, obj.cpx, obj.cpy);
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

		var rinfo = bd.areas.getRoomInfo(), minfo = bd.getMovedPosition(linfo);
		var mfunc = function(c){ return ((c!==null && minfo.id[c]!==null) ? bd.QnC(minfo.id[c]) : -1);};
		this.getBeforeCell = function(c){ return minfo.id[c];};

		this.performAsLine = false;
		if( !this.checkSameObjectInRoom(rinfo, mfunc) ){
			this.setAlert('１つのブロックに異なるアルファベットが入っています。','A block has plural kinds of letters.'); return false;
		}
		if( !this.checkGatheredObject(rinfo, mfunc) ){
			this.setAlert('同じアルファベットが異なるブロックに入っています。','Same kinds of letters are placed different blocks.'); return false;
		}
		if( !this.checkNoObjectInRoom(rinfo, mfunc) ){
			this.setAlert('アルファベットのないブロックがあります。','A block has no letters.'); return false;
		}

		this.performAsLine = true;
		if( !this.checkDisconnectLine(linfo) ){
			this.setAlert('アルファベットにつながっていない線があります。','A line doesn\'t connect any letter.'); return false;
		}

		return true;
	},
	getBeforeCell : function(c){ return 0;}, /* 苦しい... */

	checkLineOverLetter : function(func){
		var result = true;
		for(var c=0;c<bd.cellmax;c++){
			if(bd.lines.lcntCell(c)>=2 && bd.isNum(c)){
				if(this.inAutoCheck){ return false;}
				if(result){ bd.sErBAll(2);}
				bd.setCellLineError(c,true);
				result = false;
			}
		}
		return result;
	}
}
};
