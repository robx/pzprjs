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
	qdir : -1  // ○なし数字として扱う
},
Board:{
	qcols : 8,
	qrows : 8,

	isborder : 1,

	initialize : function(){
		this.SuperFunc.initialize.call(this);
		this.iceinfo = this.addInfoList('AreaCrockManager');
	}
},

LineManager:{
	isCenterLine : true
},

AreaLineManager:{
	enabled : true
},
"AreaCrockManager:AreaManager":{
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
	decodePzpr : function(type){
		this.decodeIcelom();
		this.decodeNumber16_yosenabe();
	},
	encodePzpr : function(type){
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

		if( !this.checkLcntCell(3) ){ return 40201;}
		if( !this.checkLcntCell(4) ){ return 40301;}

		var linfo = bd.getLareaInfo();

		if( !this.checkDoubleObject(linfo) ){ return 30017;}
		if( !this.checkLineOverLetter() ){ return 43104;}

		if( !this.checkCurveLine(linfo) ){ return 20013;}

		// 問題のチェック (1)
		if( !this.checkQuesNumber() ){ return 90701;}

		var iarea = bd.iceinfo.getAreaInfo();
		// 問題のチェック (2)
		if( !this.checkDoubleNumberInNabe(iarea) ){ return 90711;}

		bd.searchMovedPosition(linfo);
		if( !this.checkFillingCount(iarea) ){ return 90721;}
		if( !this.checkNoMovedObjectInRoom(iarea) ){ return 90731;}
		if( !this.checkFillingOutOfNabe() ){ return 90741;}

		if( !this.checkDisconnectLine(linfo) ){ return 43204;}

		return 0;
	},

	checkCurveLine : function(linfo){
		return this.checkAllArea(linfo, function(w,h,a,n){ return (w===1||h===1);});
	},
	checkQuesNumber : function(){
		return this.checkAllCell(function(cell){ return (!cell.ice() && cell.getQdir()!==-1);});
	},

	checkDoubleNumberInNabe : function(iarea){
		return this.checkAllBlock(iarea, function(cell){ return (cell.getQdir()!==-1);}, function(w,h,a,n){ return (a<2);});
	},
	checkFillingOutOfNabe : function(){
		return this.checkAllCell(function(cell){ return (cell.base.isNum() && !cell.ice());});
	},

	checkFillingCount : function(iarea){
		var result = true;
		for(var id=1;id<=iarea.max;id++){
			var clist = iarea.room[id].clist, num = null;
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
				if(this.checkOnly){ return false;}
				clist.seterr(1);
				for(var i=0;i<clist.length;i++){ clist[i].base.seterr(4);}
				result = false;
			}
		}
		return result;
	}
}
});
