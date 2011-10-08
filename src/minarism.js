//
// パズル固有スクリプト部 マイナリズム版 minarism.js v3.4.0
//
pzprv3.custom.minarism = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	inputedit : function(){
		if(this.mousestart || this.mousemove){
			if(this.btn.Left){ this.inputmark_mousemove();}
		}
		else if(this.mouseend && this.notInputted()){
			this.inputmark_mouseup();
		}
	},
	inputplay : function(){
		if(this.mousestart){ this.inputqnum();}
	},

	inputmark_mousemove : function(){
		var pos = this.getpos(0);
		if(pos.getc().isnull){ return;}

		var border = this.getnb(this.prevPos, pos);
		if(!border.isnull){
			this.inputData = this.getdir(this.prevPos, pos);
			border.setQdir(this.inputData!==border.getQdir()?this.inputData:0);
			border.draw();
			this.mousereset();
			return;
		}
		this.prevPos = pos;
	},
	inputmark_mouseup : function(){
		var pos = this.getpos(0.33);
		if(!pos.isinside()){ return;}

		if(!tc.pos.equals(pos)){
			this.setcursorpos(pos);
			pos.draw();
		}
		else{
			var border = pos.getb();
			if(!border.isnull){ return;}

			var qn=border.getQnum(), qs=border.getQdir();
			var qm=(border.isHorz()?0:2), max=Math.max(bd.qcols,bd.qrows)-1;
			if(this.btn.Left){
				if     (qn===-1 && qs===0)   { border.setQnum(-1); border.setQdir(qm+1);}
				else if(qn===-1 && qs===qm+1){ border.setQnum(-1); border.setQdir(qm+2);}
				else if(qn===-1 && qs===qm+2){ border.setQnum(1);  border.setQdir(0);}
				else if(qn===max)            { border.setQnum(-2); border.setQdir(0);}
				else if(qn===-2)             { border.setQnum(-1); border.setQdir(0);}
				else{ border.setQnum(id,qn+1);}
			}
			else if(this.btn.Right){
				if     (qn===-1 && qs===0)   { border.setQnum(-2); border.setQdir(0);}
				else if(qn===-2)             { border.setQnum(max);border.setQdir(0);}
				else if(qn=== 1 && qs===0)   { border.setQnum(-1); border.setQdir(qm+2);}
				else if(qn===-1 && qs===qm+2){ border.setQnum(-1); border.setQdir(qm+1);}
				else if(qn===-1 && qs===qm+1){ border.setQnum(-1); border.setQdir(0);}
				else{ border.setQnum(id,qn-1);}
			}
			border.draw();
		}
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,
	enableplay : true,
	moveTarget : function(ca){
		if     (this.owner.editmode){ return this.moveTBorder(ca);}
		else if(this.owner.playmode){ return this.moveTCell(ca);}
		return false;
	},

	keyinput : function(ca){
		if     (this.owner.editmode){ this.key_inputmark(ca);}
		else if(this.owner.playmode){ this.key_inputqnum(ca);}
	},
	key_inputmark : function(ca){
		var border = tc.getTBC();
		if(border.isnull){ return;}

		if(ca=='q'||ca=='w'||ca=='e' || ca==' ' || ca=='-'){
			var tmp=bd.NDIR;
			if(ca=='q'){ tmp=(border.isHorz()?bd.UP:bd.LT);}
			if(ca=='w'){ tmp=(border.isHorz()?bd.DN:bd.RT);}

			border.setQdir(border.getQdir()!==tmp?tmp:bd.NDIR);
			border.setQnum(-1);
		}
		else if('0'<=ca && ca<='9'){
			var num = parseInt(ca), cur = border.getQnum();
			var max = Math.max(bd.qcols,bd.qrows)-1;

			border.setQdir(bd.NDIR);
			if(cur<=0 || this.prev!==border){ if(num<=max){ border.setQnum(num);}}
			else{
				if(cur*10+num<=max){ border.setQnum(cur*10+num);}
				else if  (num<=max){ border.setQnum(num);}
			}
		}
		else{ return;}

		this.prev = border;
		border.draw();
	}
},

TargetCursor:{
	adjust_modechange : function(){
		this.pos.bx -= ((this.pos.bx+1)%2);
		this.pos.by -= ((this.pos.by+1)%2);
	}
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	nummaxfunc : function(){
		return Math.max(bd.qcols,bd.qrows);
	}
},
Board:{
	qcols : 7,
	qrows : 7,

	isborder : 1,

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
		var g = this.vinc('border_base', 'auto');
		if(!g.use.canvas){ return;}

		var csize = this.cw*0.29;
		var blist = this.range.borders;
		for(var i=0;i<blist.length;i++){
			var border = blist[i];

			if(border.qdir!==0 || border.qnum!==-1){
				g.fillStyle = "white";
				g.fillRect(border.px-csize, border.py-csize, 2*csize+1, 2*csize+1);
			}
		}
	},
	drawBDNumbers_and_IneqSigns : function(){
		var g = this.vinc('border_marks', 'auto');

		var csize = this.cw*0.27;
		var ssize = this.cw*0.22;
		var headers = ["b_cp_", "b_is1_", "b_is2_"];

		g.lineWidth = 1;
		g.strokeStyle = this.cellcolor;

		var blist = this.range.borders;
		for(var i=0;i<blist.length;i++){
			var border=blist[i], id=border.id, key=['border',id].join('_');
			var px = border.px, py = border.py;
			// ○の描画
			if(border.qnum!=-1){
				g.fillStyle = (border.error===1 ? this.errcolor1 : "white");
				if(this.vnop(headers[0]+id,this.FILL)){
					g.shapeCircle(px, py, csize);
				}
			}
			else{ this.vhide([headers[0]+id]);}

			// 数字の描画
			if(border.qnum>0){
				this.dispnum(key, 1, ""+border.qnum, 0.45, "black", px, py);
			}
			else{ this.hideEL(key);}

			// 不等号の描画
			this.vhide([headers[1]+id, headers[2]+id]);
			if(border.qdir!==bd.NDIR){
				if(this.vnop(headers[((border.qdir+1)&1)+1]+id,this.NONE)){
					switch(border.qdir){
						case bd.UP: g.setOffsetLinePath(px,py ,-ssize,+ssize ,0,-ssize ,+ssize,+ssize, false); break;
						case bd.DN: g.setOffsetLinePath(px,py ,-ssize,-ssize ,0,+ssize ,+ssize,-ssize, false); break;
						case bd.LT: g.setOffsetLinePath(px,py ,+ssize,-ssize ,-ssize,0 ,+ssize,+ssize, false); break;
						case bd.RT: g.setOffsetLinePath(px,py ,-ssize,-ssize ,+ssize,0 ,-ssize,+ssize, false); break;
					}
					g.stroke();
				}
			}
		}
	},

	drawTarget_minarism : function(){
		this.drawCursor(this.owner.playmode);
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

			if     (tmp===1){ obj.qdir = (obj.isHorz()?bd.UP:bd.LT);}
			else if(tmp===2){ obj.qdir = (obj.isHorz()?bd.DN:bd.RT);}

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

				if     (dir===bd.UP||dir===bd.LT){ pstr = ((type===0 || id<bd.cellmax)?"g":"h");}
				else if(dir===bd.DN||dir===bd.RT){ pstr = ((type===0 || id<bd.cellmax)?"h":"g");}
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
			if     (ca==="a"){ obj.qdir = (obj.isHorz()?bd.UP:bd.LT);}
			else if(ca==="b"){ obj.qdir = (obj.isHorz()?bd.DN:bd.RT);}
			else if(ca==="."){ obj.qnum = -2;}
			else if(ca!=="0"){ obj.qnum = parseInt(ca);}
		});
		this.decodeCellAnumsub();
	},
	encodeData : function(){
		this.encodeBorder( function(obj){
			var dir=obj.qdir;
			if     (dir===bd.UP||dir===bd.LT){ return "a ";}
			else if(dir===bd.DN||dir===bd.RT){ return "b ";}
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

		if( !this.checkRowsCols(this.isDifferentNumberInClist, function(cell){ return cell.getNum();}) ){
			this.setAlert('同じ列に同じ数字が入っています。','There are same numbers in a row.'); return false;
		}

		if( !this.checkBDnumber() ){
			this.setAlert('丸付き数字とその両側の数字の差が一致していません。', 'The Difference between two Adjacent cells is not equal to the number on circle.'); return false;
		}

		if( !this.checkBDmark() ){
			this.setAlert('不等号と数字が矛盾しています。', 'A inequality sign is not correct.'); return false;
		}

		if( !this.checkAllCell(function(cell){ return cell.noNum();}) ){
			this.setAlert('数字の入っていないマスがあります。','There is a empty cell.'); return false;
		}

		return true;
	},
	check1st : function(){ return this.checkAllCell(function(cell){ return cell.noNum();});},

	checkBDnumber : function(){
		return this.checkBDSideCell(function(border,a1,a2){
			return (border.getQnum()>0 && border.getQnum()!==Math.abs(a1-a2));
		});
	},
	checkBDmark : function(){
		return this.checkBDSideCell(function(border,a1,a2){
			var mark = border.getQdir();
			return !(mark==0 || ((mark===1||mark===3) && a1<a2) || ((mark===2||mark===4) && a1>a2));
		});
	},
	checkBDSideCell : function(func){
		var result = true;
		for(var id=0;id<bd.bdmax;id++){
			var border = bd.border[id], cell1 = border.sidecell[0], cell2 = border.sidecell[1];
			var num1 = cell1.getNum(), num2 = cell2.getNum();
			if(num1>0 && num2>0 && func(border,num1,num2)){
				if(this.inAutoCheck){ return false;}
				cell1.seterr(1);
				cell2.seterr(1);
				result = false;
			}
		}
		return result;
	}
}
};
