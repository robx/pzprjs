// EncodeCommon.js v3.4.1

pzpr.classmgr.makeCommon({
//---------------------------------------------------------
Encode:{
	//---------------------------------------------------------------------------
	// enc.include()    文字列caはbottomとupの間にあるか
	//---------------------------------------------------------------------------
	include : function(ca, bottom, up){
		return (bottom <= ca && ca <= up);
	},

	//---------------------------------------------------------------------------
	// enc.decode4Cell()  quesが0～4までの場合、デコードする
	// enc.encode4Cell()  quesが0～4までの場合、問題部をエンコードする
	//---------------------------------------------------------------------------
	decode4Cell : function(){
		var c=0, i=0, bstr = this.outbstr, bd = this.board;
		for(i=0;i<bstr.length;i++){
			var cell = bd.cell[c], ca = bstr.charAt(i);
			if     (this.include(ca,"0","4")){ cell.qnum = parseInt(ca,16);}
			else if(this.include(ca,"5","9")){ cell.qnum = parseInt(ca,16)-5;  c++; }
			else if(this.include(ca,"a","e")){ cell.qnum = parseInt(ca,16)-10; c+=2;}
			else if(this.include(ca,"g","z")){ c+=(parseInt(ca,36)-16);}
			else if(ca==="."){ cell.qnum=-2;}

			c++;
			if(!bd.cell[c]){ break;}
		}
		this.outbstr = bstr.substr(i+1);
	},
	encode4Cell : function(){
		var count=0, cm="", bd = this.board;
		for(var c=0;c<bd.cell.length;c++){
			var pstr="", qn=bd.cell[c].qnum;

			if(qn>=0){
				if     (!!bd.cell[c+1]&&bd.cell[c+1].qnum!==-1){ pstr=""+    qn .toString(16);}
				else if(!!bd.cell[c+2]&&bd.cell[c+2].qnum!==-1){ pstr=""+ (5+qn).toString(16); c++; }
				else										   { pstr=""+(10+qn).toString(16); c+=2;}
			}
			else if(qn===-2){ pstr=".";}
			else{ count++;}

			if     (count=== 0){ cm += pstr;}
			else if(pstr || count===20){ cm += ((count+15).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm += ((count+15).toString(36));}

		this.outbstr += cm;
	},

	//---------------------------------------------------------------------------
	// enc.decode4Cross()  quesが0～4までの場合、デコードする
	// enc.encode4Cross()  quesが0～4までの場合、問題部をエンコードする
	//---------------------------------------------------------------------------
	decode4Cross : function(){
		var c=0, i=0, bstr = this.outbstr, bd = this.board;
		for(i=0;i<bstr.length;i++){
			var cross = bd.cross[c], ca = bstr.charAt(i);
			if     (this.include(ca,"0","4")){ cross.qnum = parseInt(ca,16);}
			else if(this.include(ca,"5","9")){ cross.qnum = parseInt(ca,16)-5;  c++; }
			else if(this.include(ca,"a","e")){ cross.qnum = parseInt(ca,16)-10; c+=2;}
			else if(this.include(ca,"g","z")){ c+=(parseInt(ca,36)-16);}
			else if(ca==="."){ cross.qnum=-2;}

			c++;
			if(!bd.cross[c]){ break;}
		}
		this.outbstr = bstr.substr(i+1);
	},
	encode4Cross : function(){
		var count=0, cm="", bd = this.board;
		for(var c=0;c<bd.cross.length;c++){
			var pstr="", qn=bd.cross[c].qnum;

			if(qn>=0){
				if     (!!bd.cross[c+1]&&bd.cross[c+1].qnum!==-1){ pstr=""+    qn .toString(16);}
				else if(!!bd.cross[c+2]&&bd.cross[c+2].qnum!==-1){ pstr=""+( 5+qn).toString(16); c++; }
				else											 { pstr=""+(10+qn).toString(16); c+=2;}
			}
			else if(qn===-2){ pstr=".";}
			else{ count++;}

			if     (count=== 0){ cm += pstr;}
			else if(pstr || count===20){ cm += ((count+15).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm += ((count+15).toString(36));}

		this.outbstr += cm;
	},

	//---------------------------------------------------------------------------
	// enc.decodeNumber10()  quesが0～9までの場合、デコードする
	// enc.encodeNumber10()  quesが0～9までの場合、問題部をエンコードする
	//---------------------------------------------------------------------------
	decodeNumber10 : function(){
		var c=0, i=0, bstr = this.outbstr, bd = this.board;
		for(i=0;i<bstr.length;i++){
			var cell = bd.cell[c], ca = bstr.charAt(i);

			if     (ca === '.')				 { cell.qnum = -2;}
			else if(this.include(ca,"0","9")){ cell.qnum = parseInt(ca,10);}
			else if(this.include(ca,"a","z")){ c += (parseInt(ca,36)-10);}

			c++;
			if(!bd.cell[c]){ break;}
		}
		this.outbstr = bstr.substr(i+1);
	},
	encodeNumber10 : function(){
		var cm="", count=0, bd = this.board;
		for(var c=0;c<bd.cell.length;c++){
			var pstr="", qn=bd.cell[c].qnum;

			if     (qn===-2)       { pstr = ".";}
			else if(qn>=0 && qn<10){ pstr = qn.toString(10);}
			else{ count++;}

			if(count===0){ cm += pstr;}
			else if(pstr || count===26){ cm+=((9+count).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm+=(9+count).toString(36);}

		this.outbstr += cm;
	},

	//---------------------------------------------------------------------------
	// enc.decodeNumber16()  quesが0～8192?までの場合、デコードする
	// enc.encodeNumber16()  quesが0～8192?までの場合、問題部をエンコードする
	//---------------------------------------------------------------------------
	decodeNumber16 : function(){
		var c=0, i=0, bstr = this.outbstr, bd = this.board;
		for(i=0;i<bstr.length;i++){
			var cell = bd.cell[c], ca = bstr.charAt(i);

			if(this.include(ca,"0","9")||this.include(ca,"a","f"))
							   { cell.qnum = parseInt(ca,16);}
			else if(ca === '-'){ cell.qnum = parseInt(bstr.substr(i+1,2),16);      i+=2;}
			else if(ca === '+'){ cell.qnum = parseInt(bstr.substr(i+1,3),16);      i+=3;}
			else if(ca === '='){ cell.qnum = parseInt(bstr.substr(i+1,3),16)+4096; i+=3;}
			else if(ca === '%'){ cell.qnum = parseInt(bstr.substr(i+1,3),16)+8192; i+=3;}
			else if(ca === '.'){ cell.qnum = -2;}
			else if(ca >= 'g' && ca <= 'z'){ c += (parseInt(ca,36)-16);}

			c++;
			if(!bd.cell[c]){ break;}
		}
		this.outbstr = bstr.substr(i+1);
	},
	encodeNumber16 : function(){
		var count=0, cm="", bd = this.board;
		for(var c=0;c<bd.cell.length;c++){
			var pstr = "", qn = bd.cell[c].qnum;

			if     (qn=== -2           ){ pstr = ".";}
			else if(qn>=   0 && qn<  16){ pstr =       qn.toString(16);}
			else if(qn>=  16 && qn< 256){ pstr = "-" + qn.toString(16);}
			else if(qn>= 256 && qn<4096){ pstr = "+" + qn.toString(16);}
			else if(qn>=4096 && qn<8192){ pstr = "=" + (qn-4096).toString(16);}
			else if(qn>=8192           ){ pstr = "%" + (qn-8192).toString(16);}
			else{ count++;}

			if(count===0){ cm += pstr;}
			else if(pstr || count===20){ cm+=((15+count).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm+=(15+count).toString(36);}

		this.outbstr += cm;
	},

	//---------------------------------------------------------------------------
	// enc.decodeRoomNumber16()  部屋＋部屋の一つのquesが0～8192?までの場合、デコードする
	// enc.encodeRoomNumber16()  部屋＋部屋の一つのquesが0～8192?までの場合、問題部をエンコードする
	//---------------------------------------------------------------------------
	decodeRoomNumber16 : function(){
		var r=0, i=0, bstr = this.outbstr, bd = this.board;
		bd.roommgr.rebuild();
		for(i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i), top=bd.roommgr.components[r].top;

			if(this.include(ca,"0","9")||this.include(ca,"a","f"))
							   { top.qnum = parseInt(ca,16);}
			else if(ca === '-'){ top.qnum = parseInt(bstr.substr(i+1,2),16);       i+=2;}
			else if(ca === '+'){ top.qnum = parseInt(bstr.substr(i+1,3),16);       i+=3;}
			else if(ca === '='){ top.qnum = parseInt(bstr.substr(i+1,3),16)+4096;  i+=3;}
			else if(ca === '%'){ top.qnum = parseInt(bstr.substr(i+1,3),16)+8192;  i+=3;}
			else if(ca === '*'){ top.qnum = parseInt(bstr.substr(i+1,4),16)+12240; i+=4;}
			else if(ca === '$'){ top.qnum = parseInt(bstr.substr(i+1,5),16)+77776; i+=5;}
			else if(ca >= 'g' && ca <= 'z'){ r += (parseInt(ca,36)-16);}

			r++;
			if(r >= bd.roommgr.components.length){ break;}
		}
		this.outbstr = bstr.substr(i+1);
	},
	encodeRoomNumber16 : function(){
		var count=0, cm="", bd = this.board;
		bd.roommgr.rebuild();
		for(var r=0;r<bd.roommgr.components.length;r++){
			var pstr = "", qn = bd.roommgr.components[r].top.qnum;

			if     (qn>=    0 && qn<   16){ pstr =       qn.toString(16);}
			else if(qn>=   16 && qn<  256){ pstr = "-" + qn.toString(16);}
			else if(qn>=  256 && qn< 4096){ pstr = "+" + qn.toString(16);}
			else if(qn>= 4096 && qn< 8192){ pstr = "=" + (qn-4096).toString(16);}
			else if(qn>= 8192 && qn<12240){ pstr = "%" + (qn-8192).toString(16);}
			else if(qn>=12240 && qn<77776){ pstr = "*" + (qn-12240).toString(16);}
			else if(qn>=77776            ){ pstr = "$" + (qn-77776).toString(16);} // 最大1126352
			else{ count++;}

			if(count===0){ cm += pstr;}
			else if(pstr || count===20){ cm+=((15+count).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm+=(15+count).toString(36);}

		this.outbstr += cm;
	},

	//---------------------------------------------------------------------------
	// enc.decodeArrowNumber16()  矢印付きquesが0～8192?までの場合、デコードする
	// enc.encodeArrowNumber16()  矢印付きquesが0～8192?までの場合、問題部をエンコードする
	//---------------------------------------------------------------------------
	decodeArrowNumber16 : function(){
		var c=0, i=0, bstr = this.outbstr, bd = this.board;
		for(i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i), cell=bd.cell[c];

			if(this.include(ca,"0","4")){
				var ca1 = bstr.charAt(i+1);
				cell.qdir = parseInt(ca,16);
				cell.qnum = (ca1!=="." ? parseInt(ca1,16) : -2);
				i++;
			}
			else if(this.include(ca,"5","9")){
				cell.qdir = parseInt(ca,16)-5;
				cell.qnum = parseInt(bstr.substr(i+1,2),16);
				i+=2;
			}
			else if(ca==="-"){
				cell.qdir = parseInt(bstr.substr(i+1,1),16);
				cell.qnum = parseInt(bstr.substr(i+2,3),16);
				i+=4;
			}
			else if(ca>='a' && ca<='z'){ c+=(parseInt(ca,36)-10);}

			c++;
			if(!bd.cell[c]){ break;}
		}
		this.outbstr = bstr.substr(i+1);
	},
	encodeArrowNumber16 : function(){
		var cm = "", count = 0, bd = this.board;
		for(var c=0;c<bd.cell.length;c++){
			var pstr="", dir=bd.cell[c].qdir, qn=bd.cell[c].qnum;
			if     (qn===-2)         { pstr=(dir  )+".";}
			else if(qn>=  0&&qn<  16){ pstr=(dir  )+qn.toString(16);}
			else if(qn>= 16&&qn< 256){ pstr=(dir+5)+qn.toString(16);}
			else if(qn>=256&&qn<4096){ pstr="-"+(dir)+qn.toString(16);}
			else{ count++;}

			if     (count=== 0){ cm += pstr;}
			else if(pstr || count===26){ cm += ((count+9).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm += (count+9).toString(36);}

		this.outbstr += cm;
	},

	//---------------------------------------------------------------------------
	// enc.decodeBorder() 問題の境界線をデコードする
	// enc.encodeBorder() 問題の境界線をエンコードする
	//---------------------------------------------------------------------------
	decodeBorder : function(){
		var pos1, pos2, bstr = this.outbstr, id, twi=[16,8,4,2,1];
		var bd = this.board;

		if(bstr){
			pos1 = Math.min(((((bd.cols-1)*bd.rows+4)/5)|0)     , bstr.length);
			pos2 = Math.min((((bd.cols*(bd.rows-1)+4)/5)|0)+pos1, bstr.length);
		}
		else{ pos1 = 0; pos2 = 0;}

		id = 0;
		for(var i=0;i<pos1;i++){
			var ca = parseInt(bstr.charAt(i),32);
			for(var w=0;w<5;w++){
				if(id<(bd.cols-1)*bd.rows){
					bd.border[id].ques=((ca&twi[w])?1:0);
					id++;
				}
			}
		}

		id = (bd.cols-1)*bd.rows;
		for(var i=pos1;i<pos2;i++){
			var ca = parseInt(bstr.charAt(i),32);
			for(var w=0;w<5;w++){
				var border = bd.border[id];
				if(!!border && border.inside){
					border.ques=((ca&twi[w])?1:0);
					id++;
				}
			}
		}

		bd.roommgr.rebuild();
		this.outbstr = bstr.substr(pos2);
	},
	encodeBorder : function(){
		var cm="", twi=[16,8,4,2,1], num = 0, pass = 0;
		var bd = this.board;

		for(var id=0;id<(bd.cols-1)*bd.rows;id++){
			pass+=(bd.border[id].ques * twi[num]); num++;
			if(num===5){ cm += pass.toString(32); num=0; pass=0;}
		}
		if(num>0){ cm += pass.toString(32);}

		num = 0; pass = 0;
		for(var id=(bd.cols-1)*bd.rows;id<(2*bd.cols*bd.rows-bd.cols-bd.rows);id++){
			pass+=(bd.border[id].ques * twi[num]); num++;
			if(num===5){ cm += pass.toString(32); num=0; pass=0;}
		}
		if(num>0){ cm += pass.toString(32);}

		this.outbstr += cm;
	},

	//---------------------------------------------------------------------------
	// enc.decodeCrossMark() 黒点をデコードする
	// enc.encodeCrossMark() 黒点をエンコードする
	//---------------------------------------------------------------------------
	decodeCrossMark : function(){
		var cc=0, i=0, bstr = this.outbstr, bd = this.board;
		var cp=(bd.hascross===2?1:0), cp2=(cp<<1);
		var rows=(bd.rows-1+cp2), cols=(bd.cols-1+cp2);
		for(i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i);

			if(this.include(ca,"0","9")||this.include(ca,"a","z")){
				cc += parseInt(ca,36);
				var bx = ((  cc%cols    +(1-cp))<<1);
				var by = ((((cc/cols)|0)+(1-cp))<<1);

				if(by>bd.maxby-2*(1-cp)){ i++; break;}
				bd.getx(bx,by).qnum = 1;
			}
			else if(ca === '.'){ cc+=35;}

			cc++;
			if(cc>=cols*rows){ i++; break;}
		}
		this.outbstr = bstr.substr(i);
	},
	encodeCrossMark : function(){
		var cm="", count=0, bd = this.board;
		var cp=(bd.hascross===2?1:0), cp2=(cp<<1);
		var rows=(bd.rows-1+cp2), cols=(bd.cols-1+cp2);
		for(var c=0,max=cols*rows;c<max;c++){
			var pstr="";
			var bx = ((  c%cols    +(1-cp))<<1);
			var by = ((((c/cols)|0)+(1-cp))<<1);

			if(bd.getx(bx,by).qnum===1){ pstr = ".";}
			else{ count++;}

			if(pstr){ cm += count.toString(36); count=0;}
			else if(count===36){ cm += "."; count=0;}
		}
		if(count>0){ cm += count.toString(36);}

		this.outbstr += cm;
	},

	//---------------------------------------------------------------------------
	// enc.decodeCircle() 白丸・黒丸をデコードする
	// enc.encodeCircle() 白丸・黒丸をエンコードする
	//---------------------------------------------------------------------------
	decodeCircle : function(){
		var bd = this.board;
		var bstr = this.outbstr, c=0, tri=[9,3,1];
		var pos = (bstr ? Math.min(((bd.cols*bd.rows+2)/3)|0, bstr.length) : 0);
		for(var i=0;i<pos;i++){
			var ca = parseInt(bstr.charAt(i),27);
			for(var w=0;w<3;w++){
				if(!!bd.cell[c]){
					var val = ((ca/tri[w])|0)%3;
					if(val>0){ bd.cell[c].qnum=val;}
					c++;
				}
			}
		}
		this.outbstr = bstr.substr(pos);
	},
	encodeCircle : function(){
		var bd = this.board;
		var cm="", num=0, pass=0, tri=[9,3,1];
		for(var c=0;c<bd.cell.length;c++){
			if(bd.cell[c].qnum>0){ pass+=(bd.cell[c].qnum*tri[num]);}
			num++;
			if(num===3){ cm += pass.toString(27); num=0; pass=0;}
		}
		if(num>0){ cm += pass.toString(27);}

		this.outbstr += cm;
	},

	//---------------------------------------------------------------------------
	// enc.decodeIce() cell.ques===6をデコードする
	// enc.encodeIce() cell.ques===6をエンコードする
	//---------------------------------------------------------------------------
	decodeQues : function(val){
		var bstr = this.outbstr, bd = this.board;

		var c=0, twi=[16,8,4,2,1];
		for(var i=0;i<bstr.length;i++){
			var num = parseInt(bstr.charAt(i),32);
			for(var w=0;w<5;w++){
				if(!!bd.cell[c]){
					bd.cell[c].ques = (num&twi[w]?val:0);
					c++;
				}
			}
			if(!bd.cell[c]){ break;}
		}
		this.outbstr = bstr.substr(i+1);
	},
	encodeQues : function(val){
		var cm = "", num=0, pass=0, twi=[16,8,4,2,1], bd = this.board;
		for(var c=0;c<bd.cell.length;c++){
			if(bd.cell[c].ques===val){ pass+=twi[num];} num++;
			if(num===5){ cm += pass.toString(32); num=0; pass=0;}
		}
		if(num>0){ cm += pass.toString(32);}

		this.outbstr += cm;
	},
	decodeIce : function(){
		this.decodeQues(6);
	},
	encodeIce : function(){
		this.encodeQues(6);
	},
	decodeEmpty : function(){
		this.decodeQues(7);
	},
	encodeEmpty : function(){
		this.encodeQues(7);
	},

	//---------------------------------------------------------------------------
	// enc.decodecross_old() Crossの問題部をデコードする(旧形式)
	//---------------------------------------------------------------------------
	decodecross_old : function(){
		var bstr = this.outbstr, c=0, bd = this.board;
		for(var i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i);
			if(this.include(ca,"0","4")){ bd.cross[c].qnum = parseInt(ca,10);}

			c++;
			if(!bd.cross[c]){ i++; break;}
		}

		this.outbstr = bstr.substr(i);
	}
}
});
