//
// パズル固有スクリプト部 よせなべ版 yosenabe.js v3.4.0
//
pzprv3.createCustoms('yosenabe', {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.owner.playmode){
			if(this.mousestart || this.mousemove){
				if     (this.btn.Left) { this.inputLine();}
				else if(this.btn.Right){ this.inputpeke();}
			}
		}
		else if(this.owner.editmode){
			if(this.mousestart || this.mousemove){
				if(this.btn.Right){ this.inputNabe();}
			}
			else if(this.mouseend && this.notInputted()){
				this.inputqnum_yosenabe();
			}
		}
	},

	inputNabe : function(){
		var cell = this.getcell();
		if(cell.isnull || cell===this.mouseCell){ return;}
		if(cell.isNum()){ this.inputqnum(); return;}
		else if(cell.getQdir()!==-1){ this.inputqnum_yosenabe(); return;}

		if(this.inputData===null){ this.inputData = (cell.ice()?0:6);}

		cell.setQues(this.inputData);
		cell.drawaround();
		this.mouseCell = cell;
	},

	inputqnum_yosenabe : function(){
		var cell = this.getcell();
		if(cell.isnull || cell===this.mouseCell){ return;}

		if(cell!==this.cursor.getTCC()){
			this.setcursor(cell);
		}
		else{
			this.inputnumber_yosenabe(cell);
		}
		this.mouseCell = cell;
	},
	inputnumber_yosenabe : function(cell){
		var max = cell.nummaxfunc(), num, type, val=-1;

		if     (cell.getQnum()!==-1){ num=cell.getQnum(); type=1;} /* ○数字 */
		else if(cell.getQdir()!==-1){ num=cell.getQdir(); type=2;} /* なべの数字 */
		else{ num=-1; type=(cell.ice()?2:1);}

		if(this.btn.Left){
			if     (num===max){ val = -1;}
			else if(num===-1) { val = -2;}
			else if(num===-2) { val = 1;}
			else              { val = num+1;}
		}
		else if(this.btn.Right){
			if     (num===-1){ val = max;}
			else if(num===-2){ val = -1;}
			else if(num=== 1){ val = -2;}
			else             { val = num-1;}
		}

		if     (type===1){ cell.setQnum(val);}
		else if(type===2){ cell.setQdir(val);}

		cell.draw();
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,

	keyinput : function(ca){
		this.key_inputqnum_yosenabe(ca);
	},
	key_inputqnum_yosenabe : function(ca){
		var cell = this.cursor.getTCC(), num;
		if(ca==='q'||ca==='q1'||ca==='q2'){
			if(ca==='q') { ca = (cell.getQnum()!==-1?'q1':'q2');}
			if     (ca==='q1' && cell.getQnum()!==-1){ cell.setQdir(cell.getQnum()); cell.setQnum(-1);}
			else if(ca==='q2' && cell.getQdir()!==-1){ cell.setQnum(cell.getQdir()); cell.setQdir(-1);}
		}
		else if(ca=='w'){
			cell.setQues(cell.ice()?0:6);
		}
		else{
			var max = cell.nummaxfunc(), val=-1, cur=-1;

			if     (cell.getQnum()!==-1){ cur=cell.getQnum(); type=1;} /* ○数字 */
			else if(cell.getQdir()!==-1){ cur=cell.getQdir(); type=2;} /* なべの数字 */
			else{ cur=-1; type=(cell.ice()?2:1);}

			if('0'<=ca && ca<='9'){
				var num = parseInt(ca);
				if(cur<=0 || cur*10+num>max || this.prev!==cell){ cur=0;}
				val = cur*10+num;
				if(val>max){ return;}
			}
			else if(ca==='-') { val = -2;}
			else if(ca===' ') { val = -1;}
			else{ return;}

			if     (type===1){ cell.setQnum(val);}
			else if(type===2){ cell.setQdir(val);}
		}

		this.prev=cell;
		cell.draw();
	}
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	qnum : -1, // ○つき数字として扱う
	qdir : -1, // ○なし数字として扱う

	// 正答判定用
	base : null
},
Board:{
	qcols : 8,
	qrows : 8,

	isborder : 1,

	initialize2 : function(){
		this.SuperFunc.initialize2.call(this);
		this.iceinfo = this.owner.newInstance('AreaCrockManager');
	}
},

LineManager:{
	isCenterLine : true
},

AreaLineManager:{
	enabled : true
},
"AreaCrockManager:AreaCellManager":{
	enabled : true,
	relation : ['cell'],
	isvalid : function(cell){ return cell.ice();}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	setColors : function(){
		this.gridcolor = this.gridcolor_LIGHT;
		this.icecolor = "rgb(224,224,224)";
		this.setBGCellColorFunc('icebarn');
		this.setBorderColorFunc('ice');

		this.circleratio = [0.38, 0.38];
	},
	paint : function(){
		this.drawBGCells();
		this.drawGrid();
		this.drawBorders();

		this.drawTip();
		this.drawLines();

		this.drawCirclesAtNumber();
		this.drawNumbers();

		this.drawPekes();

		this.drawChassis();

		this.drawTarget();
	},

	drawNumber1 : function(cell){
		var key = ['cell',cell.id].join('_'), num = (cell.qnum>0 ? cell.qnum : cell.qdir);
		if(num>0 || (cell.qdir===-2)){
			var text      = (num>=0 ? ""+num : "?");
			var fontratio = (num<10?0.8:(num<100?0.7:0.55));
			var color     = this.getCellNumberColor(cell);
			if(cell.qnum!==-1){ fontratio *= 0.9;}
			var px = cell.bx*this.bw, py = cell.by*this.bh;
			this.dispnum(key, 1, text, fontratio, color, px, py);
		}
		else{ this.hidenum(key);}
	},
	getCellNumberColor : function(cell){
		return ((cell.error===1 || cell.error===4) ? this.fontErrcolor : this.fontcolor);
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		this.decodeIcelom();
		this.decodeNumber16_yosenabe();
	},
	pzlexport : function(type){
		this.encodeIcelom();
		this.encodeNumber16_yosenabe();
	},

	decodeIcelom : function(){
		var bstr = this.outbstr, bd = this.owner.board;

		var a=0, c=0, twi=[16,8,4,2,1];
		for(var i=0;i<bstr.length;i++){
			var num = parseInt(bstr.charAt(i),32);
			for(var w=0;w<5;w++){
				if(c<bd.cellmax){
					bd.cell[c].setQues(num&twi[w]?6:0);
					c++;
				}
			}
			if(c>=bd.cellmax){ a=i+1; break;}
		}
		this.outbstr = bstr.substr(a);
	},
	encodeIcelom : function(){
		var cm = "", num=0, pass=0, twi=[16,8,4,2,1], bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			if(bd.cell[c].ques===6){ pass+=twi[num];} num++;
			if(num==5){ cm += pass.toString(32); num=0; pass=0;}
		}
		if(num>0){ cm += pass.toString(32);}

		this.outbstr += cm;
	},

	decodeNumber16_yosenabe : function(){
		var c=0, i=0, bstr = this.outbstr, bd = this.owner.board;
		for(i=0;i<bstr.length;i++){
			var cell = bd.cell[c], ca = bstr.charAt(i);

			if(this.include(ca,"0","9")||this.include(ca,"a","f"))
							  { cell.qnum = parseInt(ca,16);}
			else if(ca == '-'){ cell.qnum = parseInt(bstr.substr(i+1,2),16); i+=2;}
			else if(ca == '.'){ cell.qnum = -2;}
			else if(ca == 'i'){ cell.qdir = parseInt(bstr.substr(i+1,1),16); i+=1;}
			else if(ca == 'g'){ cell.qdir = parseInt(bstr.substr(i+1,2),16); i+=2;}
			else if(ca == 'h'){ cell.qdir = -2;}
			else if(ca >= 'j' && ca <= 'z'){ c += (parseInt(ca,36)-19);}

			c++;
			if(c >= bd.cellmax){ break;}
		}
		this.outbstr = bstr.substr(i+1);
	},
	encodeNumber16_yosenabe : function(){
		var count=0, cm="", bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			var pstr = "", qn = bd.cell[c].qnum, qd = bd.cell[c].qdir;

			if     (qn== -2          ){ pstr = ".";}
			else if(qn>=  0 && qn< 16){ pstr =       qn.toString(16);}
			else if(qn>= 16 && qn<256){ pstr = "-" + qn.toString(16);}
			else if(qd== -2          ){ pstr = "h";}
			else if(qd>=  0 && qd< 16){ pstr = "i" + qd.toString(16);}
			else if(qd>= 16 && qd<256){ pstr = "g" + qd.toString(16);}
			else{ count++;}

			if(count==0){ cm += pstr;}
			else if(pstr || count==17){ cm+=((18+count).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm+=(18+count).toString(36);}

		this.outbstr += cm;
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCell( function(cell,ca){
			if(ca.charAt(0)=='i'){ cell.ques=6; ca=ca.substr(1);}
			if(ca.charAt(0)=='o'){
				ca=ca.substr(1);
				if(!!ca){ cell.qnum=parseInt(ca);}
				else{ cell.qnum=-2;}
			}
			else if(!!ca&&ca!=='.'){ cell.qdir=parseInt(ca);}
		});
		this.decodeBorderLine();
	},
	encodeData : function(){
		this.encodeCell( function(cell){
			var ca = "";
			if(cell.ques===6){ ca += "i";}
			if(cell.qnum!==-1){
				ca += "o";
				if(cell.qnum>=0){ ca += cell.qnum.toString();}
			}
			else if(cell.qdir>0){ ca += cell.qdir.toString();}

			return ((!!ca?ca:".")+" ");
		});
		this.encodeBorderLine();
	},
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){
		var bd = this.owner.board;
		this.performAsLine = true;

		if( !this.checkLcntCell(3) ){
			this.setAlert('分岐している線があります。','There is a branch line.'); return false;
		}
		if( !this.checkLcntCell(4) ){
			this.setAlert('線が交差しています。','There is a crossing line.'); return false;
		}

		this.performAsLine = false;
		var linfo = bd.getLareaInfo();

		if( !this.checkDoubleNumber(linfo) ){
			this.setAlert('具材が繋がっています。','There are connected fillings.'); return false;
		}
		if( !this.checkLineOverLetter() ){
			this.setAlert('具材の上を線が通過しています。','A line goes through a filling.'); return false;
		}

		if( !this.checkAllArea(linfo, function(w,h,a,n){ return (w==1||h==1);}) ){
			this.setAlert('曲がっている線があります。','A line has curve.'); return false;
		}

		// 問題のチェック (1)
		if( !this.checkAllCell(function(cell){ return (!cell.ice() && cell.getQdir()!==-1);} ) ){
			this.setAlert('鍋の外に数字が書いてあります。','There is a number out of a crock.'); return false;
		}

		var iarea = bd.iceinfo.getAreaInfo();
		// 問題のチェック (2)
		if( !this.checkAllBlock(iarea, function(cell){ return (cell.getQdir()!==-1);}, function(w,h,a,n){ return (a<2);}) ){
			this.setAlert('鍋に数字が２つ以上書いてあります。','There is a number out of a crock.'); return false;
		}

		bd.searchMovedPosition(linfo);

		if( !this.checkFillingCount(iarea) ){
			this.setAlert('具材の合計値が正しくありません。','Sum of filling is not equal to a crock.'); return false;
		}

		if( !this.checkNoObjectInRoom(iarea, function(cell){ return cell.base.qnum;}) ){
			this.setAlert('具材のない鍋があります。','A crock has no circle.'); return false;
		}

		if( !this.checkAllCell(function(cell){ return (cell.base.isNum() && !cell.ice());} ) ){
			this.setAlert('鍋に入っていない具材があります。','A filling isn\'t in a crock.'); return false;
		}

		this.performAsLine = true;
		if( !this.checkDisconnectLine(linfo) ){
			this.setAlert('○につながっていない線があります。','A line doesn\'t connect any circle.'); return false;
		}

		return true;
	},

	checkLineOverLetter : function(){
		var result = true, bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			var cell = bd.cell[c];
			if(cell.lcnt()>=2 && cell.isNum()){
				if(this.inAutoCheck){ return false;}
				if(result){ bd.border.seterr(-1);}
				cell.setCellLineError(true);
				result = false;
			}
		}
		return result;
	},
	
	checkFillingCount : function(iarea){
		var result = true;
		for(var id=1;id<=iarea.max;id++){
			var clist = iarea.getclist(id), num = null;
			for(var i=0;i<clist.length;i++){
				var qd = clist[i].getQdir();
				if(qd!==-1){
					if(num!==null && num!==qd){ num=null; break;}
					num=qd;
				}
			}
			if(num===null){ continue;}

			var count = 0;
			for(var i=0;i<clist.length;i++){
				if(clist[i].base.isValidNum()){ count += clist[i].base.qnum;}
			}

			if(count>0 && num!==count){
				if(this.inAutoCheck){ return false;}
				clist.seterr(1);
				for(var i=0;i<clist.length;i++){ clist[i].base.seterr(4);}
				result = false;
			}
		}
		return result;
	}
}
});
