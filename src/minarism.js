//
// パズル固有スクリプト部 マイナリズム版 minarism.js v3.4.0
//
pzprv3.custom.minarism = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mousedown : function(){
		if(k.editmode && this.btn.Left){ this.inputmark_mousemove();}
		else if(k.playmode){ this.inputqnum();}
	},
	mouseup : function(){
		if(k.editmode && this.notInputted()){ this.inputmark_mouseup();}
	},
	mousemove : function(){
		if(k.editmode && this.btn.Left){ this.inputmark_mousemove();}
	},

	inputmark_mousemove : function(){
		var pos = this.borderpos(0);
		if(bd.cnum(pos.x,pos.y)===null){ return;}

		var id = this.getnb(this.prevPos, pos);
		if(id!==null){
			this.inputData = this.getdir(this.prevPos, pos);
			bd.sDiB(id,(this.inputData!=bd.DiB(id)?this.inputData:0));
			pc.paintBorder(id);
			this.mousereset();
		}
		this.prevPos = pos;
	},
	inputmark_mouseup : function(){
		var pos = this.borderpos(0.33);
		if(!bd.isinside(pos.x,pos.y)){ return;}

		if(!tc.pos.equals(pos)){
			var tcp = tc.getTCP(), flag = false;
			tc.setTCP(pos);
			pc.paintPos(tcp);
			pc.paintPos(pos);
		}
		else{
			var id = bd.bnum(pos.x, pos.y);
			if(id!==null){
				var qn=bd.QnB(id), qs=bd.DiB(id);
				var qm=((pos.x&1)?0:2), max=Math.max(bd.qcols,bd.qrows)-1;
				if(this.btn.Left){
					if     (qn===-1 && qs===0)   { bd.sQnB(id,-1); bd.sDiB(id,qm+1);}
					else if(qn===-1 && qs===qm+1){ bd.sQnB(id,-1); bd.sDiB(id,qm+2);}
					else if(qn===-1 && qs===qm+2){ bd.sQnB(id, 1); bd.sDiB(id,0);}
					else if(qn===max)            { bd.sQnB(id,-2); bd.sDiB(id,0);}
					else if(qn===-2)             { bd.sQnB(id,-1); bd.sDiB(id,0);}
					else{ bd.sQnB(id,qn+1);}
				}
				else if(this.btn.Right){
					if     (qn===-1 && qs===0)   { bd.sQnB(id,-2); bd.sDiB(id,0);}
					else if(qn===-2)             { bd.sQnB(id,max);bd.sDiB(id,0);}
					else if(qn=== 1 && qs===0)   { bd.sQnB(id,-1); bd.sDiB(id,qm+2);}
					else if(qn===-1 && qs===qm+2){ bd.sQnB(id,-1); bd.sDiB(id,qm+1);}
					else if(qn===-1 && qs===qm+1){ bd.sQnB(id,-1); bd.sDiB(id,0);}
					else{ bd.sQnB(id,qn-1);}
				}
				pc.paintBorder(id);
			}
		}
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,
	enableplay : true,
	moveTarget : function(ca){
		if     (k.editmode){ return this.moveTBorder(ca);}
		else if(k.playmode){ return this.moveTCell(ca);}
		return false;
	},

	keyinput : function(ca){
		if     (k.editmode){ this.key_inputmark(ca);}
		else if(k.playmode){ this.key_inputqnum(ca);}
	},
	key_inputmark : function(ca){
		var id = tc.getTBC();
		if(id===null){ return;}

		if(ca=='q'||ca=='w'||ca=='e' || ca==' ' || ca=='-'){
			var tmp=k.NONE;
			if(ca=='q'){ tmp=((bd.border[id].bx&1)?k.UP:k.LT);}
			if(ca=='w'){ tmp=((bd.border[id].bx&1)?k.DN:k.RT);}

			bd.sDiB(id,(bd.DiB(id)!==tmp?tmp:k.NONE));
			bd.sQnB(id,-1);
		}
		else if('0'<=ca && ca<='9'){
			var num = parseInt(ca);
			var max = Math.max(bd.qcols,bd.qrows)-1;

			bd.sDiB(id,k.NONE);
			if(bd.QnB(id)<=0 || this.prev!=id){ if(num<=max){ bd.sQnB(id,num);}}
			else{
				if(bd.QnB(id)*10+num<=max){ bd.sQnB(id,bd.QnB(id)*10+num);}
				else if(num<=max){ id.sQnB(id,num);}
			}
		}
		else{ return;}

		pc.paintBorder(id);
	}
},

TargetCursor:{
	adjust_modechange : function(){
		this.pos.x -= ((this.pos.x+1)%2);
		this.pos.y -= ((this.pos.y+1)%2);
	}
},

//---------------------------------------------------------
// 盤面管理系
Board:{
	qcols : 7,
	qrows : 7,

	isborder : 1,

	nummaxfunc : function(cc){
		return Math.max(this.qcols,this.qrows);
	}
},

MenuExec:{
	adjustBoardData : function(key,d){
		this.adjustBorderArrow(key,d);
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	hideHatena : true,

	setColors : function(){
		this.gridcolor = this.gridcolor_LIGHT;
	},
	paint : function(){
		this.drawBDBase();

		this.drawBGCells();
		this.drawDashedGrid();

		this.drawBDNumbers_and_IneqSigns();
		this.drawNumbers();

		this.drawChassis();

		this.drawTarget_minarism();
	},

	drawBDBase : function(){
		if(!g.use.canvas){ return;}
		var csize = this.cw*0.29;
		var idlist = this.range.borders;
		for(var i=0;i<idlist.length;i++){
			var id = idlist[i];

			if(bd.border[id].qdir!==0 || bd.border[id].qnum!==-1){
				g.fillStyle = "white";
				g.fillRect(bd.border[id].px-csize, bd.border[id].py-csize, 2*csize+1, 2*csize+1);
			}
		}
	},
	drawBDNumbers_and_IneqSigns : function(){
		this.vinc('border_marks', 'auto');

		var csize = this.cw*0.27;
		var ssize = this.cw*0.22;
		var headers = ["b_cp_", "b_is1_", "b_is2_"];

		g.lineWidth = 1;
		g.strokeStyle = this.cellcolor;

		var idlist = this.range.borders;
		for(var i=0;i<idlist.length;i++){
			var id=idlist[i], obj=bd.border[id], key=['border',id].join('_');
			// ○の描画
			if(obj.qnum!=-1){
				g.fillStyle = (obj.error==1 ? this.errcolor1 : "white");
				if(this.vnop(headers[0]+id,this.FILL)){
					g.shapeCircle(obj.px, obj.py, csize);
				}
			}
			else{ this.vhide([headers[0]+id]);}

			// 数字の描画
			if(obj.qnum>0){
				this.dispnum(key, 1, ""+obj.qnum, 0.45, this.borderfontcolor, obj.px, obj.py);
			}
			else{ this.hideEL(key);}

			// 不等号の描画
			this.vhide([headers[1]+id, headers[2]+id]);
			if(obj.qdir!==k.NONE){
				if(this.vnop(headers[((obj.qdir+1)&1)+1]+id,this.NONE)){
					switch(obj.qdir){
						case k.UP: g.setOffsetLinePath(obj.px,obj.py ,-ssize,+ssize ,0,-ssize ,+ssize,+ssize, false); break;
						case k.DN: g.setOffsetLinePath(obj.px,obj.py ,-ssize,-ssize ,0,+ssize ,+ssize,-ssize, false); break;
						case k.LT: g.setOffsetLinePath(obj.px,obj.py ,+ssize,-ssize ,-ssize,0 ,+ssize,+ssize, false); break;
						case k.RT: g.setOffsetLinePath(obj.px,obj.py ,-ssize,-ssize ,+ssize,0 ,-ssize,+ssize, false); break;
					}
					g.stroke();
				}
			}
		}
	},

	drawTarget_minarism : function(){
		this.drawCursor(k.playmode);
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		this.decodeMinarism(type);
	},
	pzlexport : function(type){
		this.encodeMinarism(type);
	},

	decodeMinarism : function(type){
		// 盤面外数字のデコード
		var id=0, a=0, mgn=0, bstr = this.outbstr;
		for(var i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i);

			if(type==1){
				if     (id<bd.qcols*bd.qrows)  { mgn=((id/bd.qcols)|0);}
				else if(id<2*bd.qcols*bd.qrows){ mgn=bd.qrows;}
			}
			var obj = bd.border[id-mgn];

			var tmp=0;
			if     (this.include(ca,'0','9')||this.include(ca,'a','f')){ obj.qnum = parseInt(ca,16);}
			else if(ca==="-"){ obj.qnum = parseInt(bstr.substr(i+1,2),16); i+=2;}
			else if(ca==="."){ obj.qnum = -2;}
			else if(ca==="g"){ tmp = ((type===0 || id<bd.qcols*bd.qrows)?1:2);}
			else if(ca==="h"){ tmp = ((type===0 || id<bd.qcols*bd.qrows)?2:1);}
			else if(this.include(ca,'i','z')){ id+=(parseInt(ca,36)-18);}
			else if(type===1 && ca==="/"){ id=bd.cellmax-1;}

			if     (tmp===1){ obj.qdir = ((obj.bx&1)?k.UP:k.LT);}
			else if(tmp===2){ obj.qdir = ((obj.bx&1)?k.DN:k.RT);}

			id++;
			if(id>=2*bd.qcols*bd.qrows){ a=i+1; break;}
		}
		this.outbstr = bstr.substr(a);
	},
	encodeMinarism : function(type){
		var cm="", count=0, mgn=0;
		for(var id=0,max=bd.bdmax+(type===0?0:bd.qcols);id<max;id++){
			if(type===1){
				if(id>0 && id<=(bd.qcols-1)*bd.qrows && id%(bd.qcols-1)==0){ count++;}
				if(id==(bd.qcols-1)*bd.qrows){ if(count>0){ cm+=(17+count).toString(36); count=0;} cm += "/";}
			}

			if(id<bd.bdmax){
				var pstr="", dir=bd.border[id].qdir, qnum=bd.border[id].qnum;

				if     (dir===k.UP||dir===k.LT){ pstr = ((type===0 || id<bd.cellmax)?"g":"h");}
				else if(dir===k.DN||dir===k.RT){ pstr = ((type===0 || id<bd.cellmax)?"h":"g");}
				else if(qnum===-2){ pstr = ".";}
				else if(qnum>= 0&&qnum< 16){ pstr = ""+ qnum.toString(16);}
				else if(qnum>=16&&qnum<256){ pstr = "-"+qnum.toString(16);}
				else{ count++;}
			}
			else{ count++;}

			if(count==0){ cm += pstr;}
			else if(pstr||count==18){ cm+=((17+count).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm+=(17+count).toString(36);}

		this.outbstr += cm;
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeBorder( function(obj,ca){
			if     (ca==="a"){ obj.qdir = ((obj.bx&1)?k.UP:k.LT);}
			else if(ca==="b"){ obj.qdir = ((obj.bx&1)?k.DN:k.RT);}
			else if(ca==="."){ obj.qnum = -2;}
			else if(ca!=="0"){ obj.qnum = parseInt(ca);}
		});
		this.decodeCellAnumsub();
	},
	encodeData : function(){
		this.encodeBorder( function(obj){
			var dir=obj.qdir;
			if     (dir===k.UP||dir===k.LT){ return "a ";}
			else if(dir===k.DN||dir===k.RT){ return "b ";}
			else if(obj.qnum===-2){ return ". ";}
			else if(obj.qnum!==-1){ return ""+obj.qnum.toString()+" ";}
			else                  { return "0 ";}
		});
		this.encodeCellAnumsub();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.checkRowsCols(this.isDifferentNumberInClist, function(c){ return bd.getNum(c);}) ){
			this.setAlert('同じ列に同じ数字が入っています。','There are same numbers in a row.'); return false;
		}

		if( !this.checkBDnumber() ){
			this.setAlert('丸付き数字とその両側の数字の差が一致していません。', 'The Difference between two Adjacent cells is not equal to the number on circle.'); return false;
		}

		if( !this.checkBDmark() ){
			this.setAlert('不等号と数字が矛盾しています。', 'A inequality sign is not correct.'); return false;
		}

		if( !this.checkAllCell(function(c){ return bd.noNum(c);}) ){
			this.setAlert('数字の入っていないマスがあります。','There is a empty cell.'); return false;
		}

		return true;
	},
	check1st : function(){ return this.checkAllCell(bd.noNum);},

	checkBDnumber : function(){
		return this.checkBDSideCell(function(id,a1,a2){
			return (bd.QnB(id)>0 && bd.QnB(id)!==Math.abs(a1-a2));
		});
	},
	checkBDmark : function(){
		return this.checkBDSideCell(function(id,a1,a2){
			var mark = bd.DiB(id);
			return !(mark==0 || ((mark===1||mark===3) && a1<a2) || ((mark===2||mark===4) && a1>a2));
		});
	},
	checkBDSideCell : function(func){
		var result = true;
		for(var id=0;id<bd.bdmax;id++){
			var cc1 = bd.border[id].cellcc[0], cc2 = bd.border[id].cellcc[1];
			var num1 = bd.getNum(cc1), num2 = bd.getNum(cc2);
			if(num1>0 && num2>0 && func(id,num1,num2)){
				if(this.inAutoCheck){ return false;}
				bd.sErC([cc1,cc2],1);
				result = false;
			}
		}
		return result;
	}
}
};
