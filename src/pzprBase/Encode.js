// Encode.js v3.2.3p2

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
	this.outpflag  = '';
	this.outsize   = '';
	this.outbstr   = '';
};
Encode.prototype = {
	//---------------------------------------------------------------------------
	// enc.init()           Encodeオブジェクトで持つ値を初期化する
	// enc.first_parseURI() 起動時にURLを解析して、puzzleidの抽出やエディタ/player判定を行う
	// enc.parseURI()       入力されたURLがどのサイト用か判定してthis.uriに値を保存する
	// enc.parseURI_xxx()   pzlURI部をpflag,bstr等の部分に分割する
	//---------------------------------------------------------------------------
	init : function(){
		this.uri.type = 0;
		this.uri.qdata = "";

		this.uri.pflag = "";
		this.uri.cols = 0;
		this.uri.rows = 0;
		this.uri.bstr = "";

		this.pidKanpen = '';
		this.outpflag  = '';
		this.outsize   = '';
		this.outbstr   = '';
	},

	first_parseURI : function(search){
		if(search.length<=0){ return "";}

		this.init();

		if(search.substr(0,3)=="?m+" || search.substr(0,3)=="?m/"){
			k.editmode = true;
			k.playmode = false;
			k.EDITOR = true;
			k.PLAYER = false;
			k.autocheck = false;
			search = search.substr(3);
		}
		else{
			k.editmode = false;
			k.playmode = true;
			k.EDITOR = !!k.scriptcheck;
			k.PLAYER =  !k.scriptcheck;
			k.autocheck = true;
			search = search.substr(1);
		}

		var qs = search.indexOf("/");
		if(qs>=0){
			this.parseURI_pzpr(search.substr(qs+1));
			return search.substr(0,qs);
		}

		return search;
	},
	parseURI : function(url){
		this.init();

		// なぜかOperaはtextarea上の改行が実際の改行扱いになってしまうっぽい
		if(k.br.Opera){ url = url.replace(/(\r|\n)/g,"");}

		// ぱずぷれの場合
		if(url.match(/indi\.s58\.xrea\.com/)){
			// ぱずぷれv3のURL
			if(!url.match(/\/(sa|sc)\//)){
				this.parseURI_pzpr(url.substr(url.indexOf("/", url.indexOf("?"))+1));
			}
			// ぱずぷれアプレットのURL
			else{
				this.parseURI_pzpr(url.substr(url.indexOf("?")));
				this.uri.type = 1; // 1はぱずぷれアプレット/URLジェネレータ
			}
		}
		// カンペンの場合
		else if(url.match(/www\.kanpen\.net/) || url.match(/www\.geocities(\.co)?\.jp\/pencil_applet/) ){
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
	},
	parseURI_pzpr : function(qstr){
		this.uri.type = 0; // 0はぱずぷれv3
		this.uri.qdata = qstr;
		var inp = qstr.split("/");
		if(!isNaN(parseInt(inp[0]))){ inp.unshift("");}

		this.uri.pflag = inp.shift();
		this.uri.cols = parseInt(inp.shift());
		this.uri.rows = parseInt(inp.shift());
		this.uri.bstr = inp.join("/");
	},
	parseURI_kanpen : function(qstr){
		this.uri.type = 2; // 2はカンペン
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
		this.uri.type = 4; // 4はへやわけアプレット
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
	// enc.getURLbase() このスクリプトが置いてあるURLを表示する
	// enc.getDocbase() このスクリプトが置いてあるドメイン名を表示する
	// enc.kanpenbase() カンペンのドメイン名を表示する
	// 
	// enc.pzlimport()    各パズルのURL入力用(オーバーライド用)
	// enc.pzlexport()    各パズルのURL出力用(オーバーライド用)
	//---------------------------------------------------------------------------
	pzlinput : function(){
		if(this.uri.cols && this.uri.rows){
			bd.initBoardSize(this.uri.cols, this.uri.rows);
		}
		if(this.uri.bstr){
			um.disableRecord(); um.disableInfo();
			switch(this.uri.type){
			case 0: case 1: case 3:
				this.outbstr = this.uri.bstr;
				this.pzlimport(this.uri.type);
				break;
			case 2:
				fio.lineseek = 0;
				fio.dataarray = this.uri.bstr.replace(/_/g, " ").split("/");
				this.decodeKanpen();
				break;
			case 4:
				this.decodeHeyaApp();
				break;
			}
			um.enableRecord(); um.enableInfo();

			bd.ansclear();

			base.resetInfo(true);
			base.resize_canvas_onload();
		}
	},
	pzloutput : function(type){
		this.outpflag = '';
		this.outsize = '';
		this.outbstr = '';

		if(type===0 || type===3 || type===1 || (type===2 && k.puzzleid=='lits')){
			this.pzlexport(((type===0 || type===3)?0:1));

			var size = [k.qcols,k.qrows].join('/');
			if(!!this.outsize){ size = this.outsize;}

			var pflag = this.outpflag, bstr = this.outbstr;

			if(type===0 || type===3){
				return [this.getURLbase(),(type===3?"m+":""),k.puzzleid,"/",(!!pflag?(pflag+"/"):""),size,"/",bstr].join('');
			}
			else if(type===1){
				return [this.getDocbase(),k.puzzleid,"/sa/m.html?",pflag,"/",size,"/",bstr].join('');
			}
			else if(type===2){
				return [this.kanpenbase(),this.pidKanpen,".html?pzpr=",pflag,"/",size,"/",bstr].join('');
			}
		}
		else if(type===2){
			fio.datastr = "";
			this.encodeKanpen()
			var bstr = fio.datastr.replace(/ /g, "_");

			var size = [k.qrows,k.qcols].join('/');
			if(!!this.outsize){ size = this.outsize;}

			return [this.kanpenbase(),this.pidKanpen,".html?problem=",size,"/",bstr].join('');
		}
		else if(type===4){
			var bstr = this.encodeHeyaApp(bstr);
			var size = [k.qcols,k.qrows].join('x');

			return ["http://www.geocities.co.jp/heyawake/?problem=",size,"/",bstr].join('');
		}

		return '';
	},
	getURLbase : function(){ return "http://indi.s58.xrea.com/pzpr/v3/p.html?";},
	getDocbase : function(){ return "http://indi.s58.xrea.com/";},
	kanpenbase : function(){ return "http://www.kanpen.net/";},

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
			var ca = bstr.charAt(i);
			if     (this.include(ca,"0","4")){ bd.sQnC(c, parseInt(ca,16));    c++; }
			else if(this.include(ca,"5","9")){ bd.sQnC(c, parseInt(ca,16)-5);  c+=2;}
			else if(this.include(ca,"a","e")){ bd.sQnC(c, parseInt(ca,16)-10); c+=3;}
			else if(this.include(ca,"g","z")){ c+=(parseInt(ca,36)-15);}
			else if(ca=="."){ bd.sQnC(c, -2); c++;}

			if(c>=bd.cellmax){ break;}
		}
		this.outbstr = bstr.substr(i+1);
	},
	encode4Cell : function(){
		var count=0, cm = "";
		for(var i=0;i<bd.cellmax;i++){
			var pstr = "";

			if(bd.QnC(i)>=0){
				if     (i<bd.cellmax-1&&(bd.QnC(i+1)>=0||bd.QnC(i+1)==-2)){ pstr=""+bd.QnC(i).toString(16);}
				else if(i<bd.cellmax-2&&(bd.QnC(i+2)>=0||bd.QnC(i+2)==-2)){ pstr=""+(5+bd.QnC(i)).toString(16); i++;}
				else{ pstr=""+(10+bd.QnC(i)).toString(16); i+=2;}
			}
			else if(bd.QnC(i)==-2){ pstr=".";}
			else{ pstr=" "; count++;}

			if(count==0)      { cm += pstr;}
			else if(pstr!=" "){ cm += ((count+15).toString(36)+pstr); count=0;}
			else if(count==20){ cm += "z"; count=0;}
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
			var ca = bstr.charAt(i);
			if     (this.include(ca,"0","4")){ bd.sQnX(c, parseInt(ca,16));    c++; }
			else if(this.include(ca,"5","9")){ bd.sQnX(c, parseInt(ca,16)-5);  c+=2;}
			else if(this.include(ca,"a","e")){ bd.sQnX(c, parseInt(ca,16)-10); c+=3;}
			else if(this.include(ca,"g","z")){ c+=(parseInt(ca,36)-15);}
			else if(ca=="."){ bd.sQnX(c, -2); c++;}

			if(c>=bd.crossmax){ break;}
		}
		this.outbstr = bstr.substr(i+1);
	},
	encode4Cross : function(){
		var count = 0, cm = "";
		for(var i=0;i<bd.crossmax;i++){
			var pstr = "";

			if(bd.QnX(i)>=0){
				if     (i<bd.crossmax-1&&(bd.QnX(i+1)>=0||bd.QnX(i+1)==-2)){ pstr=""+bd.QnX(i).toString(16);}
				else if(i<bd.crossmax-2&&(bd.QnX(i+2)>=0||bd.QnX(i+2)==-2)){ pstr=""+(5+bd.QnX(i)).toString(16); i++;}
				else{ pstr=""+(10+bd.QnX(i)).toString(16); i+=2;}
			}
			else if(bd.QnX(i)==-2){ pstr=".";}
			else{ pstr=" "; count++;}

			if(count==0)      { cm += pstr;}
			else if(pstr!=" "){ cm += ((count+15).toString(36)+pstr); count=0;}
			else if(count==20){ cm += "z"; count=0;}
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
			var ca = bstr.charAt(i);

			if     (this.include(ca,"0","9")){ bd.sQnC(c, parseInt(bstr.substr(i,1),10)); c++;}
			else if(this.include(ca,"a","z")){ c += (parseInt(ca,36)-9);}
			else if(ca == '.'){ bd.sQnC(c, -2); c++;}
			else{ c++;}

			if(c > bd.cellmax){ break;}
		}
		this.outbstr = bstr.substr(i);
	},
	encodeNumber10 : function(){
		var cm="", count=0;
		for(var i=0;i<bd.cellmax;i++){
			pstr = "";
			var val = bd.QnC(i);

			if     (val==  -2            ){ pstr = ".";}
			else if(val>=   0 && val<  10){ pstr =       val.toString(10);}
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
			var ca = bstr.charAt(i);

			if(this.include(ca,"0","9")||this.include(ca,"a","f"))
							  { bd.sQnC(c, parseInt(bstr.substr(i,  1),16));      c++;}
			else if(ca == '.'){ bd.sQnC(c, -2);                                   c++;      }
			else if(ca == '-'){ bd.sQnC(c, parseInt(bstr.substr(i+1,2),16));      c++; i+=2;}
			else if(ca == '+'){ bd.sQnC(c, parseInt(bstr.substr(i+1,3),16));      c++; i+=3;}
			else if(ca == '='){ bd.sQnC(c, parseInt(bstr.substr(i+1,3),16)+4096); c++; i+=3;}
			else if(ca == '%'){ bd.sQnC(c, parseInt(bstr.substr(i+1,3),16)+8192); c++; i+=3;}
			else if(ca >= 'g' && ca <= 'z'){ c += (parseInt(ca,36)-15);}
			else{ c++;}

			if(c > bd.cellmax){ break;}
		}
		this.outbstr = bstr.substr(i);
	},
	encodeNumber16 : function(){
		var count=0, cm="";
		for(var i=0;i<bd.cellmax;i++){
			pstr = "";
			var val = bd.QnC(i);

			if     (val==  -2            ){ pstr = ".";}
			else if(val>=   0 && val<  16){ pstr =       val.toString(16);}
			else if(val>=  16 && val< 256){ pstr = "-" + val.toString(16);}
			else if(val>= 256 && val<4096){ pstr = "+" + val.toString(16);}
			else if(val>=4096 && val<8192){ pstr = "=" + (val-4096).toString(16);}
			else if(val>=8192            ){ pstr = "%" + (val-8192).toString(16);}
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
			var ca = bstr.charAt(i);

			if(this.include(ca,"0","9")||this.include(ca,"a","f"))
							  { bd.sQnC(area.getTopOfRoom(r), parseInt(bstr.substr(i,  1),16));      r++;}
			else if(ca == '-'){ bd.sQnC(area.getTopOfRoom(r), parseInt(bstr.substr(i+1,2),16));      r++; i+=2;}
			else if(ca == '+'){ bd.sQnC(area.getTopOfRoom(r), parseInt(bstr.substr(i+1,3),16));      r++; i+=3;}
			else if(ca == '='){ bd.sQnC(area.getTopOfRoom(r), parseInt(bstr.substr(i+1,3),16)+4096); r++; i+=3;}
			else if(ca == '%'){ bd.sQnC(area.getTopOfRoom(r), parseInt(bstr.substr(i+1,3),16)+8192); r++; i+=3;}
			else if(ca == '*'){ bd.sQnC(area.getTopOfRoom(r), parseInt(bstr.substr(i+1,3),16)+12240); r++; i+=4;}
			else if(ca == '$'){ bd.sQnC(area.getTopOfRoom(r), parseInt(bstr.substr(i+1,3),16)+77776); r++; i+=5;}
			else if(ca >= 'g' && ca <= 'z'){ r += (parseInt(ca,36)-15);}
			else{ r++;}

			if(r > area.room.max){ break;}
		}
		this.outbstr = bstr.substr(i);
	},
	encodeRoomNumber16 : function(){
		area.resetRarea();
		var count=0, cm="";
		for(var i=1;i<=area.room.max;i++){
			var pstr = "";
			var val = bd.QnC(area.getTopOfRoom(i));

			if     (val>=     0 && val<    16){ pstr =       val.toString(16);}
			else if(val>=    16 && val<   256){ pstr = "-" + val.toString(16);}
			else if(val>=   256 && val<  4096){ pstr = "+" + val.toString(16);}
			else if(val>=  4096 && val<  8192){ pstr = "=" + (val-4096).toString(16);}
			else if(val>=  8192 && val< 12240){ pstr = "%" + (val-8192).toString(16);}
			else if(val>= 12240 && val< 77776){ pstr = "*" + (val-12240).toString(16);}
			else if(val>= 77776              ){ pstr = "$" + (val-77776).toString(16);} // 最大1126352
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
			var ca = bstr.charAt(i);

			if     (ca=='0'){ bd.sQnC(c, parseInt(bstr.substr(i+1,1),16)); c++; i++; }
			else if(ca=='5'){ bd.sQnC(c, parseInt(bstr.substr(i+1,2),16)); c++; i+=2;}
			else if(this.include(ca,"1","4")){
				bd.sDiC(c, parseInt(ca,16));
				if(bstr.charAt(i+1)!="."){ bd.sQnC(c, parseInt(bstr.substr(i+1,1),16));}
				else{ bd.sQnC(c,-2);}
				c++; i++;
			}
			else if(this.include(ca,"6","9")){
				bd.sDiC(c, parseInt(ca,16)-5);
				bd.sQnC(c, parseInt(bstr.substr(i+1,2),16));
				c++; i+=2;
			}
			else if(ca>='a' && ca<='z'){ c+=(parseInt(ca,36)-9);}
			else{ c++;}

			if(c > bd.cellmax){ break;}
		}
		this.outbstr = bstr.substr(i);
	},
	encodeArrowNumber16 : function(){
		var cm = "", count = 0;
		for(var c=0;c<bd.cellmax;c++){
			var pstr="";
			if(bd.QnC(c)!=-1){
				if     (bd.QnC(c)==-2){ pstr=((bd.DiC(c)==0?0:bd.DiC(c)  )+".");}
				else if(bd.QnC(c)< 16){ pstr=((bd.DiC(c)==0?0:bd.DiC(c)  )+bd.QnC(c).toString(16));}
				else if(bd.QnC(c)<256){ pstr=((bd.DiC(c)==0?5:bd.DiC(c)+5)+bd.QnC(c).toString(16));}
			}
			else{ pstr=" "; count++;}

			if(count==0)      { cm += pstr;}
			else if(pstr!=" "){ cm += ((count+9).toString(36)+pstr); count=0;}
			else if(count==26){ cm += "z"; count=0;}
		}
		if(count>0){ cm += (count+9).toString(36);}

		this.outbstr += cm;
	},

	//---------------------------------------------------------------------------
	// enc.decodeBorder() 問題の境界線をデコードする
	// enc.encodeBorder() 問題の境界線をエンコードする
	//---------------------------------------------------------------------------
	decodeBorder : function(){
		var pos1, pos2, bstr = this.outbstr;

		if(bstr){
			pos1 = Math.min(mf(((k.qcols-1)*k.qrows+4)/5)     , bstr.length);
			pos2 = Math.min(mf((k.qcols*(k.qrows-1)+4)/5)+pos1, bstr.length);
		}
		else{ pos1 = 0; pos2 = 0;}

		for(var i=0;i<pos1;i++){
			var ca = parseInt(bstr.charAt(i),32);
			for(var w=0;w<5;w++){
				if(i*5+w<(k.qcols-1)*k.qrows){ bd.sQuB(i*5+w,(ca&Math.pow(2,4-w)?1:0));}
			}
		}

		var oft = (k.qcols-1)*k.qrows;
		for(var i=0;i<pos2-pos1;i++){
			var ca = parseInt(bstr.charAt(i+pos1),32);
			for(var w=0;w<5;w++){
				if(i*5+w<k.qcols*(k.qrows-1)){ bd.sQuB(i*5+w+oft,(ca&Math.pow(2,4-w)?1:0));}
			}
		}

		area.resetRarea();
		this.outbstr = bstr.substr(pos2);
	},
	encodeBorder : function(){
		var num, pass;
		var cm = "";

		num = 0; pass = 0;
		for(var i=0;i<(k.qcols-1)*k.qrows;i++){
			if(bd.QuB(i)==1){ pass+=Math.pow(2,4-num);}
			num++; if(num==5){ cm += pass.toString(32); num=0; pass=0;}
		}
		if(num>0){ cm += pass.toString(32);}

		num = 0; pass = 0;
		for(var i=(k.qcols-1)*k.qrows;i<bd.bdinside;i++){
			if(bd.QuB(i)==1){ pass+=Math.pow(2,4-num);}
			num++; if(num==5){ cm += pass.toString(32); num=0; pass=0;}
		}
		if(num>0){ cm += pass.toString(32);}

		this.outbstr += cm;
	},

	//---------------------------------------------------------------------------
	// enc.decodeCrossMark() 黒点をデコードする
	// enc.encodeCrossMark() 黒点をエンコードする
	//---------------------------------------------------------------------------
	decodeCrossMark : function(){
		var cc=-1, i=0, bstr = this.outbstr
		for(i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i);

			if(this.include(ca,"0","9")||this.include(ca,"a","z")){
				cc += (parseInt(ca,36)+1);
				var cx = (k.isoutsidecross==1?   cc%(k.qcols+1) :   cc%(k.qcols-1) +1);
				var cy = (k.isoutsidecross==1?mf(cc/(k.qcols+1)):mf(cc/(k.qcols-1))+1);

				if(cy>=k.qrows+(k.isoutsidecross==1?1:0)){ i++; break;}
				bd.sQnX(bd.xnum(cx,cy), 1);
			}
			else if(ca == '.'){ cc += 36;}
			else{ cc++;}

			if(cc >= (k.isoutsidecross==1?(k.qcols+1)*(k.qrows+1):(k.qcols-1)*(k.qrows-1))-1){ i++; break;}
		}
		this.outbstr = bstr.substr(i);
	},
	encodeCrossMark : function(){
		var cm = "", count = 0;
		for(var i=0;i<(k.isoutsidecross==1?(k.qcols+1)*(k.qrows+1):(k.qcols-1)*(k.qrows-1));i++){
			var pstr = "";
			var cx = (k.isoutsidecross==1?   i%(k.qcols+1) :   i%(k.qcols-1) +1);
			var cy = (k.isoutsidecross==1?mf(i/(k.qcols+1)):mf(i/(k.qcols-1))+1);

			if(bd.QnX(bd.xnum(cx,cy))==1){ pstr = ".";}
			else{ pstr=" "; count++;}

			if(pstr!=" "){ cm += count.toString(36); count=0;}
			else if(count==36){ cm += "."; count=0;}
		}
		if(count>0){ cm += count.toString(36);}

		this.outbstr += cm;
	},

	//---------------------------------------------------------------------------
	// enc.decodeCircle41_42() 白丸・黒丸をデコードする
	// enc.encodeCircle41_42() 白丸・黒丸をエンコードする
	//---------------------------------------------------------------------------
	decodeCircle41_42 : function(){
		var bstr = this.outbstr;
		var pos = bstr?Math.min(mf((k.qcols*k.qrows+2)/3), bstr.length):0;
		for(var i=0;i<pos;i++){
			var ca = parseInt(bstr.charAt(i),27);
			for(var w=0;w<3;w++){
				if(i*3+w<k.qcols*k.qrows){
					if     (mf(ca/Math.pow(3,2-w))%3==1){ bd.sQuC(i*3+w,41);}
					else if(mf(ca/Math.pow(3,2-w))%3==2){ bd.sQuC(i*3+w,42);}
				}
			}
		}
		this.outbstr = bstr.substr(pos);
	},
	encodeCircle41_42 : function(){
		var cm="", num=0, pass=0;
		for(var i=0;i<bd.cellmax;i++){
			if     (bd.QuC(i)==41){ pass+=(  Math.pow(3,2-num));}
			else if(bd.QuC(i)==42){ pass+=(2*Math.pow(3,2-num));}
			num++; if(num==3){ cm += pass.toString(27); num=0; pass=0;}
		}
		if(num>0){ cm += pass.toString(27);}

		this.outbstr += cm;
	},

	//---------------------------------------------------------------------------
	// enc.decodecross_old() Crossの問題部をデコードする(旧形式)
	//---------------------------------------------------------------------------
	decodecross_old : function(){
		var bstr = this.outbstr;
		for(var i=0;i<Math.min(bstr.length, bd.crossmax);i++){
			if     (bstr.charAt(i)=="0"){ bd.sQnX(i,0);}
			else if(bstr.charAt(i)=="1"){ bd.sQnX(i,1);}
			else if(bstr.charAt(i)=="2"){ bd.sQnX(i,2);}
			else if(bstr.charAt(i)=="3"){ bd.sQnX(i,3);}
			else if(bstr.charAt(i)=="4"){ bd.sQnX(i,4);}
			else{ bd.sQnX(i,-1);}
		}
		for(var j=bstr.length;j<bd.crossmax;j++){ bd.sQnX(j,-1);}

		this.outbstr = bstr.substr(i);
	},

	//---------------------------------------------------------------------------
	// enc.include()    文字列caはbottomとupの間にあるか
	//---------------------------------------------------------------------------
	include : function(ca, bottom, up){
		if(bottom <= ca && ca <= up) return true;
		return false;
	}
};
