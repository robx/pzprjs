// Encode.js v3.4.0

//---------------------------------------------------------------------------
// ★Encodeクラス URLのエンコード/デコードを扱う
//---------------------------------------------------------------------------
// URLエンコード/デコード
// Encodeクラス
pzprv3.createCommonClass('Encode',
{
	initialize : function(){
		this.pflag = "";
		this.outpflag  = '';
		this.outsize   = '';
		this.outbstr   = '';
	},

	// 定数(URL形式)
	PZPRV3  : 0,
	PZPRV3E : 3,
	PZPRAPP : 1,
	KANPEN  : 2,
	KANPENP : 5,
	HEYAAPP : 4,

	urlbase : {
		0: "http://%DOMAIN%/p.html?%PID%/",                   /* PZPRV3  */
		3: "http://%DOMAIN%/p.html?%PID%_edit/",              /* PZPRV3E */
		1: "http://indi.s58.xrea.com/%PID%/sa/q.html?",       /* PZPRAPP */
		2: "http://www.kanpen.net/%KID%.html?problem=",       /* KANPEN  */
		5: "http://www.kanpen.net/%KID%.html?pzpr=",          /* KANPENP */
		4: "http://www.geocities.co.jp/heyawake/?problem="    /* HEYAAPP */
	},

	//---------------------------------------------------------------------------
	// enc.checkpflag()   pflagに指定した文字列が含まれているか調べる
	//---------------------------------------------------------------------------
	checkpflag : function(ca){ return (this.pflag.indexOf(ca)>=0);},

	//---------------------------------------------------------------------------
	// enc.pzlinput()   parseURI()を行った後に呼び出し、各パズルのpzlimport関数を呼び出す
	// enc.getURLBase() URLの元となる部分を取得する
	// 
	// enc.pzlimport()    各パズルのURL入力用(オーバーライド用)
	// enc.pzlexport()    各パズルのURL出力用(オーバーライド用)
	//---------------------------------------------------------------------------
	pzlinput : function(){
		var uri = pzprv3.base.dec;

		bd.initBoardSize(uri.cols, uri.rows);

		if(!!uri.bstr){
			this.pflag = uri.pflag;
			switch(uri.type){
			case this.PZPRV3: case this.PZPRAPP: case this.PZPRV3E:
				this.outbstr = uri.bstr;
				this.pzlimport(uri.type);
				break;
			case this.KANPEN:
				fio.lineseek = 0;
				fio.dataarray = uri.bstr.replace(/_/g, " ").split("/");
				this.decodeKanpen();
				break;
			case this.HEYAAPP:
				this.outbstr = uri.bstr;
				this.decodeHeyaApp();
				break;
			}
		}

		bd.resetInfo();
		pc.resize_canvas();
	},
	pzloutput : function(type){
		if(type===this.KANPEN && bd.puzzleid=='lits'){ type = this.KANPENP;}
		var size='', ispflag=false;

		this.outpflag = '';
		this.outsize = '';
		this.outbstr = '';

		switch(type){
		case this.PZPRV3: case this.PZPRV3E:
			this.pzlexport(this.PZPRV3);
			size = (!this.outsize ? [bd.qcols,bd.qrows].join('/') : this.outsize);
			ispflag = (!!this.outpflag);
			break;

		case this.PZPRAPP: case this.KANPENP:
			this.pzlexport(this.PZPRAPP);
			size = (!this.outsize ? [bd.qcols,bd.qrows].join('/') : this.outsize);
			ispflag = true;
			break;

		case this.KANPEN:
			fio.datastr = "";
			this.encodeKanpen()
			this.outbstr = fio.datastr.replace(/ /g, "_");
			size = (!this.outsize ? [bd.qrows,bd.qcols].join('/') : this.outsize);
			break;

		case this.HEYAAPP:
			this.encodeHeyaApp();
			size = [bd.qcols,bd.qrows].join('x');
			break;

		default:
			return '';
		}

		var pdata = (ispflag?[this.outpflag]:[]).concat([size, this.outbstr]).join("/");
		return this.getURLBase(type) + pdata;
	},
	getURLBase : function(type){
		var str = this.urlbase[type];

		var domain = document.domain;
		if(!domain){ domain = "pzv.jp";}
		else if(domain == "indi.s58.xrea.com"){ domain = "indi.s58.xrea.com/pzpr/v3";}

		if(type===this.PZPRAPP){
			if     (bd.puzzleid==='pipelinkr'){ str=str.replace("%PID%","pipelink");}
			else if(bd.puzzleid==='heyabon')  { str=str.replace("%PID%","bonsan");}
		}
		return str.replace("%DOMAIN%", domain)
				  .replace("%PID%", PZLINFO.toURLID(bd.puzzleid))
				  .replace("%KID%", PZLINFO.toKanpen(bd.puzzleid));
	},

	// オーバーライド用
	pzlimport : function(type){ },
	pzlexport : function(type){ },
	decodeKanpen : function(){ },
	encodeKanpen : function(){ },
	decodeHeyaApp : function(){ },
	encodeHeyaApp : function(){ },

	//---------------------------------------------------------------------------
	// enc.decode4Cell()  quesが0～4までの場合、デコードする
	// enc.encode4Cell()  quesが0～4までの場合、問題部をエンコードする
	//---------------------------------------------------------------------------
	decode4Cell : function(){
		var c=0, i=0, bstr = this.outbstr;
		for(i=0;i<bstr.length;i++){
			var obj = bd.cell[c], ca = bstr.charAt(i);
			if     (this.include(ca,"0","4")){ obj.qnum = parseInt(ca,16);}
			else if(this.include(ca,"5","9")){ obj.qnum = parseInt(ca,16)-5;  c++; }
			else if(this.include(ca,"a","e")){ obj.qnum = parseInt(ca,16)-10; c+=2;}
			else if(this.include(ca,"g","z")){ c+=(parseInt(ca,36)-16);}
			else if(ca=="."){ obj.qnum=-2;}

			c++;
			if(c>=bd.cellmax){ break;}
		}
		this.outbstr = bstr.substr(i+1);
	},
	encode4Cell : function(){
		var count=0, cm="";
		for(var c=0;c<bd.cellmax;c++){
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
		var c=0, i=0, bstr = this.outbstr;
		for(i=0;i<bstr.length;i++){
			var obj = bd.cross[c], ca = bstr.charAt(i);
			if     (this.include(ca,"0","4")){ obj.qnum = parseInt(ca,16);}
			else if(this.include(ca,"5","9")){ obj.qnum = parseInt(ca,16)-5;  c++; }
			else if(this.include(ca,"a","e")){ obj.qnum = parseInt(ca,16)-10; c+=2;}
			else if(this.include(ca,"g","z")){ c+=(parseInt(ca,36)-16);}
			else if(ca=="."){ obj.qnum=-2;}

			c++;
			if(c>=bd.crossmax){ break;}
		}
		this.outbstr = bstr.substr(i+1);
	},
	encode4Cross : function(){
		var count=0, cm="";
		for(var c=0;c<bd.crossmax;c++){
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
		var c=0, i=0, bstr = this.outbstr;
		for(i=0;i<bstr.length;i++){
			var obj = bd.cell[c], ca = bstr.charAt(i);

			if     (ca == '.')				 { obj.qnum = -2;}
			else if(this.include(ca,"0","9")){ obj.qnum = parseInt(ca,10);}
			else if(this.include(ca,"a","z")){ c += (parseInt(ca,36)-10);}

			c++;
			if(c > bd.cellmax){ break;}
		}
		this.outbstr = bstr.substr(i);
	},
	encodeNumber10 : function(){
		var cm="", count=0;
		for(var c=0;c<bd.cellmax;c++){
			var pstr="", qn=bd.cell[c].qnum;

			if     (qn===-2)       { pstr = ".";}
			else if(qn>=0 && qn<10){ pstr = qn.toString(10);}
			else{ count++;}

			if(count==0){ cm += pstr;}
			else if(pstr || count==26){ cm+=((9+count).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm+=(9+count).toString(36);}

		this.outbstr += cm;
	},

	//---------------------------------------------------------------------------
	// enc.decodeNumber16()  quesが0～8192?までの場合、デコードする
	// enc.encodeNumber16()  quesが0～8192?までの場合、問題部をエンコードする
	//---------------------------------------------------------------------------
	decodeNumber16 : function(){
		var c=0, i=0, bstr = this.outbstr;
		for(i=0;i<bstr.length;i++){
			var obj = bd.cell[c], ca = bstr.charAt(i);

			if(this.include(ca,"0","9")||this.include(ca,"a","f"))
							  { obj.qnum = parseInt(ca,16);}
			else if(ca == '-'){ obj.qnum = parseInt(bstr.substr(i+1,2),16);      i+=2;}
			else if(ca == '+'){ obj.qnum = parseInt(bstr.substr(i+1,3),16);      i+=3;}
			else if(ca == '='){ obj.qnum = parseInt(bstr.substr(i+1,3),16)+4096; i+=3;}
			else if(ca == '%'){ obj.qnum = parseInt(bstr.substr(i+1,3),16)+8192; i+=3;}
			else if(ca == '.'){ obj.qnum = -2;}
			else if(ca >= 'g' && ca <= 'z'){ c += (parseInt(ca,36)-16);}

			c++;
			if(c > bd.cellmax){ break;}
		}
		this.outbstr = bstr.substr(i);
	},
	encodeNumber16 : function(){
		var count=0, cm="";
		for(var c=0;c<bd.cellmax;c++){
			var pstr = "", qn = bd.cell[c].qnum;

			if     (qn==  -2           ){ pstr = ".";}
			else if(qn>=   0 && qn<  16){ pstr =       qn.toString(16);}
			else if(qn>=  16 && qn< 256){ pstr = "-" + qn.toString(16);}
			else if(qn>= 256 && qn<4096){ pstr = "+" + qn.toString(16);}
			else if(qn>=4096 && qn<8192){ pstr = "=" + (qn-4096).toString(16);}
			else if(qn>=8192           ){ pstr = "%" + (qn-8192).toString(16);}
			else{ count++;}

			if(count==0){ cm += pstr;}
			else if(pstr || count==20){ cm+=((15+count).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm+=(15+count).toString(36);}

		this.outbstr += cm;
	},

	//---------------------------------------------------------------------------
	// enc.decodeRoomNumber16()  部屋＋部屋の一つのquesが0～8192?までの場合、デコードする
	// enc.encodeRoomNumber16()  部屋＋部屋の一つのquesが0～8192?までの場合、問題部をエンコードする
	//---------------------------------------------------------------------------
	decodeRoomNumber16 : function(){
		bd.areas.rinfo.reset();
		if(bd.areas.roomNumber){ bd.areas.moveRoomNumber();}
		var r=1, i=0, bstr = this.outbstr;
		for(i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i), c=bd.areas.getTopOfRoom(r), obj=bd.cell[c];

			if(this.include(ca,"0","9")||this.include(ca,"a","f"))
							  { obj.qnum = parseInt(ca,16);}
			else if(ca == '-'){ obj.qnum = parseInt(bstr.substr(i+1,2),16);       i+=2;}
			else if(ca == '+'){ obj.qnum = parseInt(bstr.substr(i+1,3),16);       i+=3;}
			else if(ca == '='){ obj.qnum = parseInt(bstr.substr(i+1,3),16)+4096;  i+=3;}
			else if(ca == '%'){ obj.qnum = parseInt(bstr.substr(i+1,3),16)+8192;  i+=3;}
			else if(ca == '*'){ obj.qnum = parseInt(bstr.substr(i+1,3),16)+12240; i+=4;}
			else if(ca == '$'){ obj.qnum = parseInt(bstr.substr(i+1,3),16)+77776; i+=5;}
			else if(ca >= 'g' && ca <= 'z'){ r += (parseInt(ca,36)-16);}

			r++;
			if(r > bd.areas.rinfo.max){ break;}
		}
		this.outbstr = bstr.substr(i);
	},
	encodeRoomNumber16 : function(){
		bd.areas.rinfo.reset();
		if(bd.areas.roomNumber){ bd.areas.moveRoomNumber();}
		var count=0, cm="";
		for(var r=1;r<=bd.areas.rinfo.max;r++){
			var pstr = "", qn = bd.cell[bd.areas.getTopOfRoom(r)].qnum;

			if     (qn>=    0 && qn<   16){ pstr =       qn.toString(16);}
			else if(qn>=   16 && qn<  256){ pstr = "-" + qn.toString(16);}
			else if(qn>=  256 && qn< 4096){ pstr = "+" + qn.toString(16);}
			else if(qn>= 4096 && qn< 8192){ pstr = "=" + (qn-4096).toString(16);}
			else if(qn>= 8192 && qn<12240){ pstr = "%" + (qn-8192).toString(16);}
			else if(qn>=12240 && qn<77776){ pstr = "*" + (qn-12240).toString(16);}
			else if(qn>=77776            ){ pstr = "$" + (qn-77776).toString(16);} // 最大1126352
			else{ count++;}

			if(count==0){ cm += pstr;}
			else if(pstr || count==20){ cm+=((15+count).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm+=(15+count).toString(36);}

		this.outbstr += cm;
	},

	//---------------------------------------------------------------------------
	// enc.decodeArrowNumber16()  矢印付きquesが0～8192?までの場合、デコードする
	// enc.encodeArrowNumber16()  矢印付きquesが0～8192?までの場合、問題部をエンコードする
	//---------------------------------------------------------------------------
	decodeArrowNumber16 : function(){
		var c=0, i=0, bstr = this.outbstr;
		for(i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i), obj=bd.cell[c];

			if(this.include(ca,"0","4")){
				var ca1 = bstr.charAt(i+1);
				obj.qdir = parseInt(ca,16);
				obj.qnum = (ca1!="." ? parseInt(ca1,16) : -2);
				i++;
			}
			else if(this.include(ca,"5","9")){
				obj.qdir = parseInt(ca,16)-5;
				obj.qnum = parseInt(bstr.substr(i+1,2),16);
				i+=2;
			}
			else if(ca>='a' && ca<='z'){ c+=(parseInt(ca,36)-10);}

			c++;
			if(c > bd.cellmax){ break;}
		}
		this.outbstr = bstr.substr(i);
	},
	encodeArrowNumber16 : function(){
		var cm = "", count = 0;
		for(var c=0;c<bd.cellmax;c++){
			var pstr="", dir=bd.cell[c].qdir, qn=bd.cell[c].qnum;
			if     (qn===-2)        { pstr=(dir  )+".";}
			else if(qn>= 0&&qn<  16){ pstr=(dir  )+qn.toString(16);}
			else if(qn>=16&&qn< 256){ pstr=(dir+5)+qn.toString(16);}
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

		if(bstr){
			pos1 = Math.min(((((bd.qcols-1)*bd.qrows+4)/5)|0)     , bstr.length);
			pos2 = Math.min((((bd.qcols*(bd.qrows-1)+4)/5)|0)+pos1, bstr.length);
		}
		else{ pos1 = 0; pos2 = 0;}

		id = 0;
		for(var i=0;i<pos1;i++){
			var ca = parseInt(bstr.charAt(i),32);
			for(var w=0;w<5;w++){
				if(id<(bd.qcols-1)*bd.qrows){
					bd.border[id].ques=((ca&twi[w])?1:0);
					id++;
				}
			}
		}

		id = (bd.qcols-1)*bd.qrows;
		for(var i=pos1;i<pos2;i++){
			var ca = parseInt(bstr.charAt(i),32);
			for(var w=0;w<5;w++){
				if(id<bd.bdinside){
					bd.border[id].ques=((ca&twi[w])?1:0);
					id++;
				}
			}
		}

		bd.areas.rinfo.reset();
		if(bd.areas.roomNumber){ bd.areas.moveRoomNumber();}
		this.outbstr = bstr.substr(pos2);
	},
	encodeBorder : function(){
		var cm="", twi=[16,8,4,2,1], num, pass;

		num = 0; pass = 0;
		for(var id=0;id<(bd.qcols-1)*bd.qrows;id++){
			pass+=(bd.border[id].ques * twi[num]); num++;
			if(num===5){ cm += pass.toString(32); num=0; pass=0;}
		}
		if(num>0){ cm += pass.toString(32);}

		num = 0; pass = 0;
		for(var id=(bd.qcols-1)*bd.qrows;id<bd.bdinside;id++){
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
		var cc=0, i=0, bstr = this.outbstr, cp=(bd.iscross===2?1:0), cp2=(cp<<1);
		var rows=(bd.qrows-1+cp2), cols=(bd.qcols-1+cp2);
		for(i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i);

			if(this.include(ca,"0","9")||this.include(ca,"a","z")){
				cc += parseInt(ca,36);
				var bx = ((  cc%cols    +(1-cp))<<1);
				var by = ((((cc/cols)|0)+(1-cp))<<1);

				if(by>bd.maxby-2*(1-cp)){ i++; break;}
				bd.cross[bd.xnum(bx,by)].qnum = 1;
			}
			else if(ca == '.'){ cc+=35;}

			cc++;
			if(cc>=cols*rows){ i++; break;}
		}
		this.outbstr = bstr.substr(i);
	},
	encodeCrossMark : function(){
		var cm="", count=0, cp=(bd.iscross===2?1:0), cp2=(cp<<1);
		var rows=(bd.qrows-1+cp2), cols=(bd.qcols-1+cp2);
		for(var c=0,max=cols*rows;c<max;c++){
			var pstr="";
			var bx = ((  c%cols    +(1-cp))<<1);
			var by = ((((c/cols)|0)+(1-cp))<<1);

			if(bd.cross[bd.xnum(bx,by)].qnum===1){ pstr = ".";}
			else{ count++;}

			if(pstr){ cm += count.toString(36); count=0;}
			else if(count==36){ cm += "."; count=0;}
		}
		if(count>0){ cm += count.toString(36);}

		this.outbstr += cm;
	},

	//---------------------------------------------------------------------------
	// enc.decodeCircle() 白丸・黒丸をデコードする
	// enc.encodeCircle() 白丸・黒丸をエンコードする
	//---------------------------------------------------------------------------
	decodeCircle : function(){
		var bstr = this.outbstr, c=0, tri=[9,3,1], max=(bd.qcols*bd.qrows);
		var pos = (bstr ? Math.min(((bd.qcols*bd.qrows+2)/3)|0, bstr.length) : 0);
		for(var i=0;i<pos;i++){
			var ca = parseInt(bstr.charAt(i),27);
			for(var w=0;w<3;w++){
				if(c<max){
					var val = ((ca/tri[w])|0)%3;
					if(val>0){ bd.cell[c].qnum=val;}
					c++;
				}
			}
		}
		this.outbstr = bstr.substr(pos);
	},
	encodeCircle : function(){
		var cm="", num=0, pass=0, tri=[9,3,1];
		for(var c=0;c<bd.cellmax;c++){
			if(bd.cell[c].qnum>0){ pass+=(bd.cell[c].qnum*tri[num]);}
			num++;
			if(num===3){ cm += pass.toString(27); num=0; pass=0;}
		}
		if(num>0){ cm += pass.toString(27);}

		this.outbstr += cm;
	},

	//---------------------------------------------------------------------------
	// enc.decodecross_old() Crossの問題部をデコードする(旧形式)
	//---------------------------------------------------------------------------
	decodecross_old : function(){
		var bstr = this.outbstr, c=0;
		for(var i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i);
			if(this.include(ca,"0","4")){ bd.cross[c].qnum = parseInt(ca);}

			c++;
			if(c>=bd.crossmax){ i++; break;}
		}

		this.outbstr = bstr.substr(i);
	},

	//---------------------------------------------------------------------------
	// enc.include()    文字列caはbottomとupの間にあるか
	//---------------------------------------------------------------------------
	include : function(ca, bottom, up){
		return (bottom <= ca && ca <= up);
	}
});
