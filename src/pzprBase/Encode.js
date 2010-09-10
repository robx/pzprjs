// Encode.js v3.3.2

//---------------------------------------------------------------------------
// ★Encodeクラス URLのエンコード/デコードを扱う
//    p.html?(pid)/(qdata)
//                  qdata -> [(pflag)/](cols)/(rows)/(bstr)
//---------------------------------------------------------------------------
// URLエンコード/デコード
// Encodeクラス
Encode = function(){
	this.uri = {};

	this.uri.type;		// 入力されたURLのサイト指定部分
	this.uri.qdata;		// 入力されたURLの問題部分

	this.uri.pflag;		// 入力されたURLのフラグ部分
	this.uri.cols;		// 入力されたURLの横幅部分
	this.uri.rows;		// 入力されたURLの縦幅部分
	this.uri.bstr;		// 入力されたURLの盤面部分

	this.pidKanpen = '';
	this.pidforURL = '';

	this.outpflag  = '';
	this.outsize   = '';
	this.outbstr   = '';

	// 定数(URL形式)
	this.PZPRV3  = 0;
	this.PZPRV3E = 3;
	this.PAPRAPP = 1;
	this.KANPEN  = 2;
	this.KANPENP = 5;
	this.HEYAAPP = 4;
};
Encode.prototype = {
	//---------------------------------------------------------------------------
	// enc.init()           Encodeオブジェクトで持つ値を初期化する
	// enc.first_parseURI() 起動時にURLを解析して、puzzleidの抽出やエディタ/player判定を行う
	// enc.parseURI()       入力されたURLがどのサイト用か判定してthis.uriに値を保存する
	// enc.parseURI_xxx()   pzlURI部をpflag,bstr等の部分に分割する
	//---------------------------------------------------------------------------
	init : function(){
		this.uri.type = this.PZPRV3;
		this.uri.qdata = "";

		this.uri.pflag = "";
		this.uri.cols = 0;
		this.uri.rows = 0;
		this.uri.bstr = "";

		this.outpflag  = '';
		this.outsize   = '';
		this.outbstr   = '';
	},

	first_parseURI : function(search){
		if(search.length<=0){ return "";}

		this.init();

		var startmode = 'PLAYER';

		if     (search=="?test")       { startmode = 'TEST';   search = 'country';}
		else if(search.match(/^\?m\+/)){ startmode = 'EDITOR'; search = search.substr(3);}
		else if(search.match(/_test/)) { startmode = 'TEST';   search = search.substr(1).replace(/_test/, '');}
		else if(search.match(/_edit/)) { startmode = 'EDITOR'; search = search.substr(1).replace(/_edit/, '');}
		else if(!search.match(/\//))   { startmode = 'EDITER'; search = search.substr(1);}
		else                           { startmode = 'PLAYER'; search = search.substr(1);}
		switch(startmode){
			case 'PLAYER': k.EDITOR = false; k.editmode = false; break;
			case 'EDITOR': k.EDITOR = true;  k.editmode = true;  break;
			case 'TEST'  : k.EDITOR = true;  k.editmode = false; k.scriptcheck = true; break;
		}
		k.PLAYER    = !k.EDITOR;
		k.playmode  = !k.editmode;

		var pid = search, purl = '';
		var qs = search.indexOf("/");
		if(qs>=0){
			pid  = search.substr(0,qs);
			purl = search.substr(qs+1);
		}

		// alias機能
		switch(pid){
			case 'yajilin'    : this.pidforURL = 'yajilin'; pid = 'yajirin'; break;
			case 'akari'      : this.pidforURL = 'akari';   pid = 'lightup'; break;
			case 'bijutsukan' : this.pidforURL = 'akari';   pid = 'lightup'; break;
			case 'slitherlink': this.pidforURL = pid = 'slither'; break;
			case 'numberlink' : this.pidforURL = pid = 'numlin';  break;
			case 'hakyukoka'  : this.pidforURL = pid = 'ripple';  break;
			case 'masyu'      : this.pidforURL = pid = 'mashu';   break;
			default           : this.pidforURL = pid;
		}

		return {id:pid, url:purl}
	},
	parseURI : function(url){
		this.init();

		// textarea上の改行が実際の改行扱いになるUAに対応(Operaとか)
		url = url.replace(/(\r|\n)/g,"");

		// カンペンの場合
		if(url.match(/www\.kanpen\.net/) || url.match(/www\.geocities(\.co)?\.jp\/pencil_applet/) ){
			// カンペンだけどデータ形式はへやわけアプレット
			if(url.indexOf("?heyawake=")>=0){
				this.parseURI_heyaapp(url.substr(url.indexOf("?heyawake=")+10));
			}
			// カンペンだけどデータ形式はぱずぷれ
			else if(url.indexOf("?pzpr=")>=0){
				this.parseURI_pzpr(url.substr(url.indexOf("?pzpr=")+6));
			}
			else{
				this.parseURI_kanpen(url.substr(url.indexOf("?problem=")+9));
			}
		}
		// へやわけアプレットの場合
		else if(url.match(/www\.geocities(\.co)?\.jp\/heyawake/)){
			this.parseURI_heyaapp(url.substr(url.indexOf("?problem=")+9));
		}
		// ぱずぷれの場合
		else{ // if(url.match(/indi\.s58\.xrea\.com/)){
			// ぱずぷれアプレットのURL
			if(url.match(/\/(sa|sc)\/pzpr\/v3/)){
				this.parseURI_pzpr(url.substr(url.indexOf("?")));
				this.uri.type = this.PZPRAPP; // ぱずぷれアプレット/URLジェネレータ
			}
			// ぱずぷれv3のURL
			else{
				this.parseURI_pzpr(url.substr(url.indexOf("/", url.indexOf("?"))+1));
			}
		}
	},
	parseURI_pzpr : function(qstr){
		this.uri.type = this.PZPRV3; // ぱずぷれv3
		this.uri.qdata = qstr;
		var inp = qstr.split("/");
		if(!isNaN(parseInt(inp[0]))){ inp.unshift("");}

		this.uri.pflag = inp.shift();
		this.uri.cols = parseInt(inp.shift());
		this.uri.rows = parseInt(inp.shift());
		this.uri.bstr = inp.join("/");
	},
	parseURI_kanpen : function(qstr){
		this.uri.type = this.KANPEN; // カンペン
		this.uri.qdata = qstr;
		var inp = qstr.split("/");

		if(k.puzzleid=="sudoku"){
			this.uri.rows = this.uri.cols = parseInt(inp.shift());
		}
		else{
			this.uri.rows = parseInt(inp.shift());
			this.uri.cols = parseInt(inp.shift());
			if(k.puzzleid=="kakuro"){ this.uri.rows--; this.uri.cols--;}
		}
		this.uri.bstr = inp.join("/");
	},
	parseURI_heyaapp : function(qstr){
		this.uri.type = this.HEYAAPP; // へやわけアプレット
		this.uri.qdata = qstr;
		var inp = qstr.split("/");

		var size = inp.shift().split("x");
		this.uri.cols = parseInt(size[0]);
		this.uri.rows = parseInt(size[1]);
		this.uri.bstr = inp.join("/");
	},

	//---------------------------------------------------------------------------
	// enc.checkpflag()   pflagに指定した文字列が含まれているか調べる
	//---------------------------------------------------------------------------
	checkpflag : function(ca){ return (this.uri.pflag.indexOf(ca)>=0);},

	//---------------------------------------------------------------------------
	// enc.pzlinput()   parseURI()を行った後に呼び出し、各パズルのpzlimport関数を呼び出す
	// enc.getURLBase() URLの元となる部分を取得する
	// 
	// enc.pzlimport()    各パズルのURL入力用(オーバーライド用)
	// enc.pzlexport()    各パズルのURL出力用(オーバーライド用)
	//---------------------------------------------------------------------------
	pzlinput : function(){
		if(this.uri.cols && this.uri.rows){
			bd.initBoardSize(this.uri.cols, this.uri.rows);
		}
		if(this.uri.bstr){
			switch(this.uri.type){
			case this.PZPRV3: case this.PZPRAPP: case this.PZPRV3E:
				this.outbstr = this.uri.bstr;
				this.pzlimport(this.uri.type);
				break;
			case this.KANPEN:
				fio.lineseek = 0;
				fio.dataarray = this.uri.bstr.replace(/_/g, " ").split("/");
				this.decodeKanpen();
				break;
			case this.HEYAAPP:
				this.decodeHeyaApp();
				break;
			}
			base.resetInfo(true);

			if(!base.initProcess){
				base.resize_canvas();
			}
		}
	},
	pzloutput : function(type){
		if(type===this.KANPEN && k.puzzleid=='lits'){ type = this.KANPENP;}
		var size='', ispflag=false;

		this.outpflag = '';
		this.outsize = '';
		this.outbstr = '';

		switch(type){
		case this.PZPRV3: case this.PZPRV3E:
			this.pzlexport(this.PZPRV3);
			size = (!this.outsize ? [k.qcols,k.qrows].join('/') : this.outsize);
			ispflag = (!!this.outpflag);
			break;

		case this.PZPRAPP: case this.KANPENP:
			this.pzlexport(this.PZPRAPP);
			size = (!this.outsize ? [k.qcols,k.qrows].join('/') : this.outsize);
			ispflag = true;
			break;

		case this.KANPEN:
			fio.datastr = "";
			this.encodeKanpen()
			this.outbstr = fio.datastr.replace(/ /g, "_");
			size = (!this.outsize ? [k.qrows,k.qcols].join('/') : this.outsize);
			break;

		case this.HEYAAPP:
			this.encodeHeyaApp();
			size = [k.qcols,k.qrows].join('x');
			break;

		default:
			return '';
		}

		var pdata = (ispflag?[this.outpflag]:[]).concat([size, this.outbstr]).join("/");
		return this.getURLBase(type) + pdata;
	},
	getURLBase : function(type){
		var domain = _doc.domain;
		if(!domain){ domain = "pzv.jp";}
		else if(domain == "indi.s58.xrea.com"){ domain = "indi.s58.xrea.com/pzpr/v3";}

		var urls = {};
		urls[this.PZPRV3]  = "http://%DOMAIN%/p.html?%PID%/";
		urls[this.PZPRV3E] = "http://%DOMAIN%/p.html?%PID%_edit/";
		urls[this.PZPRAPP] = "http://indi.s58.xrea.com/%PID%/sa/q.html?";
		urls[this.KANPEN]  = "http://www.kanpen.net/%KID%.html?problem=";
		urls[this.KANPENP] = "http://www.kanpen.net/%KID%.html?pzpr=";
		urls[this.HEYAAPP] = "http://www.geocities.co.jp/heyawake/?problem=";

		return urls[type].replace("%PID%",this.pidforURL)
						 .replace("%KID%",this.pidKanpen)
						 .replace("%DOMAIN%",domain);
	},

	// オーバーライド用
	pzlimport : function(type,bstr){ },
	pzlexport : function(type){ },
	decodeKanpen : function(){ },
	encodeKanpen : function(){ },
	decodeHeyaApp : function(bstr){ },
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
		area.resetRarea();
		var r=1, i=0, bstr = this.outbstr;
		for(i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i), c=area.getTopOfRoom(r), obj=bd.cell[c];

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
			if(r > area.room.max){ break;}
		}
		this.outbstr = bstr.substr(i);
	},
	encodeRoomNumber16 : function(){
		area.resetRarea();
		var count=0, cm="";
		for(var r=1;r<=area.room.max;r++){
			var pstr = "", qn = bd.cell[area.getTopOfRoom(r)].qnum;

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
			pos1 = Math.min(((((k.qcols-1)*k.qrows+4)/5)|0)     , bstr.length);
			pos2 = Math.min((((k.qcols*(k.qrows-1)+4)/5)|0)+pos1, bstr.length);
		}
		else{ pos1 = 0; pos2 = 0;}

		id = 0;
		for(var i=0;i<pos1;i++){
			var ca = parseInt(bstr.charAt(i),32);
			for(var w=0;w<5;w++){
				if(id<(k.qcols-1)*k.qrows){
					bd.border[id].ques=((ca&twi[w])?1:0);
					id++;
				}
			}
		}

		id = (k.qcols-1)*k.qrows;
		for(var i=pos1;i<pos2;i++){
			var ca = parseInt(bstr.charAt(i),32);
			for(var w=0;w<5;w++){
				if(id<bd.bdinside){
					bd.border[id].ques=((ca&twi[w])?1:0);
					id++;
				}
			}
		}

		area.resetRarea();
		this.outbstr = bstr.substr(pos2);
	},
	encodeBorder : function(){
		var cm="", twi=[16,8,4,2,1], num, pass;

		num = 0; pass = 0;
		for(var id=0;id<(k.qcols-1)*k.qrows;id++){
			pass+=(bd.border[id].ques * twi[num]); num++;
			if(num===5){ cm += pass.toString(32); num=0; pass=0;}
		}
		if(num>0){ cm += pass.toString(32);}

		num = 0; pass = 0;
		for(var id=(k.qcols-1)*k.qrows;id<bd.bdinside;id++){
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
		var cc=0, i=0, bstr = this.outbstr, cp=(k.iscross===2?1:0), cp2=(cp<<1);
		var rows=(k.qrows-1+cp2), cols=(k.qcols-1+cp2);
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
		var cm="", count=0, cp=(k.iscross===2?1:0), cp2=(cp<<1);
		var rows=(k.qrows-1+cp2), cols=(k.qcols-1+cp2);
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
		var bstr = this.outbstr, c=0, tri=[9,3,1], max=(k.qcols*k.qrows);
		var pos = (bstr ? Math.min(((k.qcols*k.qrows+2)/3)|0, bstr.length) : 0);
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
};
