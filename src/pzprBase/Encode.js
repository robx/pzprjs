// Encode.js v3.2.0p3

//---------------------------------------------------------------------------
// ★Encodeクラス URLのエンコード/デコードを扱う
//    p.html?(pid)/(qdata)
//                  qdata -> [(pflag)/](cols)/(rows)/(bstr)
//---------------------------------------------------------------------------
// URLエンコード/デコード
// Encodeクラス
Encode = function(search){
	this.uri = [];
	this.uri.pid = "";			// 入力されたURLのID部分
	this.uri.qdata = "";		// 入力されたURLの問題部分

	this.uri.pflag = "";		// 入力されたURLのフラグ部分
	this.uri.cols = 0;			// 入力されたURLの横幅部分
	this.uri.rows = 0;			// 入力されたURLの縦幅部分
	this.uri.bstr = "";			// 入力されたURLの盤面部分

	this.first_decode(search);
};
Encode.prototype = {
	//---------------------------------------------------------------------------
	// enc.init()         Encodeオブジェクトで持つ値を初期化する
	// enc.first_decode() はじめにURLを解析してpuzzleidやエディタかplayerかを判断する
	// enc.pzlinput()     "URLを入力"または起動時の設定完了後に呼ばれて、各パズルのpzlinput関数を呼び出す
	// enc.pzlimport()    各パズルのURL入力用(オーバーライド用)
	//---------------------------------------------------------------------------
	init : function(){
		this.uri.pid = "";
		this.uri.qdata = "";
		this.uri.pflag = "";
		this.uri.cols = 0;
		this.uri.rows = 0;
		this.uri.bstr = "";
	},
	first_decode : function(search){
		if(search.length>0){
			if(search.substring(0,3)=="?m+"){
				k.callmode = "pmake"; k.mode = 1;
				search = search.substring(3, search.length);
			}
			else{
				k.callmode = ((!k.scriptcheck)?"pplay":"pmake"); k.mode = 3;
				search = search.substring(1, search.length);
			}
			this.data_decode(search, 0)
		}
	},
	pzlinput : function(type){
		if(k.puzzleid=="icebarn" && bd.arrowin==-1 && bd.arrowout==-1){
			bd.inputarrowin (0 + bd.bdinside, 1);
			bd.inputarrowout(2 + bd.bdinside, 1);
		}

		if(this.uri.bstr){
			this.pzlimport(type, this.uri.bstr);

			bd.ansclear();
			um.allerase();

			base.resize_canvas_onload();
		}
	},
	pzlimport : function(type,bstr){ },	// オーバーライド用
	pzlexport : function(type){ },		// オーバーライド用

	//---------------------------------------------------------------------------
	// enc.get_search()   入力されたURLの?以下の部分を返す
	// enc.data_decode()  pzlURI部をpflag,bstr等の部分に分割する
	// enc.checkpflag()   pflagに指定した文字列が含まれているか調べる
	//---------------------------------------------------------------------------
	get_search : function(url){
		var type = 0;	// 0はぱずぷれv3とする
		if(url.indexOf("indi.s58.xrea.com", 0)>=0){
			if(url.indexOf("/sa/", 0)>=0 || url.indexOf("/sc/", 0)>=0){ type = 1;} // 1はぱずぷれ/URLジェネレータとする
		}
		else if(url.indexOf("www.kanpen.net", 0)>=0 || url.indexOf("www.geocities.jp/pencil_applet", 0)>=0 ){
			// カンペンだけどURLはへやわけアプレット
			if(url.indexOf("heyawake=", 0)>=0){
				url = "http://www.geocities.jp/heyawake/?problem="+url.substring(url.indexOf("heyawake=", 0)+9,url.length);
				type = 4;
			}
			// カンペンだけどURLはぱずぷれ
			else if(url.indexOf("pzpr=", 0)>=0){
				url = "http://indi.s58.xrea.com/"+k.puzzleid+"/sa/q.html?"+url.substring(url.indexOf("pzpr=", 0)+5,url.length);
				type = 0;
			}
			else{ type = 2;} // 2はカンペンとする
		}
		else if(url.indexOf("www.geocities.jp/heyawake", 0)>=0 || url.indexOf("www.geocities.co.jp/heyawake", 0)>=0){
			type = 4; // 4はへやわけアプレット
		}

		var qus;
		if(type!=2){ qus = url.indexOf("?", 0);}
		else if(url.indexOf("www.kanpen.net", 0)>=0){ qus = url.indexOf("www.kanpen.net", 0);}
		else if(url.indexOf("www.geocities.jp/pencil_applet", 0)>=0){ qus = url.indexOf("www.geocities.jp/pencil_applet", 0);}

		if(qus>=0){
			this.data_decode(url.substring(qus+1,url.length), type);
		}
		else{
			this.init();
		}
		return type;
	},
	data_decode : function(search, type){
		this.init();

		if(type==0||type==1){
			var idx = search.indexOf("/", 0);

			if(idx==-1){
				this.uri.pid = search.substring(0, search.length);
				this.uri.qdata = "";
				return;
			}

			this.uri.pid = search.substring(0, idx);
			if(type==0){
				this.uri.qdata = search.substring(idx+1, search.length);
			}
			else if(type==1){
				this.uri.qdata = search;
			}

			var inp = this.uri.qdata.split("/");
			if(!isNaN(parseInt(inp[0]))){ inp.unshift("");}

			if(inp.length==3){
				this.uri.pflag = inp.shift();
				this.uri.cols = parseInt(inp.shift());
				this.uri.rows = parseInt(inp.shift());
			}
			else if(inp.length>=4){
				this.uri.pflag = inp.shift();
				this.uri.cols = parseInt(inp.shift());
				this.uri.rows = parseInt(inp.shift());
				this.uri.bstr = inp.join("/");
			}
		}
		else if(type==2){
			//this.uri.pid = "heyawake";
			var idx = search.indexOf("=", 0);
			this.uri.qdata = search.substring(idx+1, search.length);

			var inp = this.uri.qdata.split("/");

			if(!isNaN(parseInt(inp[0]))){ inp.unshift("");}

			this.uri.pflag = inp.shift();
			if(k.puzzleid!="sudoku"){
				this.uri.rows = parseInt(inp.shift());
				this.uri.cols = parseInt(inp.shift());
				if(k.puzzleid=="kakuro"){ this.uri.rows--; this.uri.cols--;}
			}
			else{
				this.uri.rows = this.uri.cols = parseInt(inp.shift());
			}
			this.uri.bstr = inp.join("/");
		}
		else if(type==4){
			this.uri.pid = "heyawake";
			var idx = search.indexOf("=", 0);
			this.uri.qdata = search.substring(idx+1, search.length);

			var inp = this.uri.qdata.split("/");

			this.uri.pflag = "";
			var inp0 = inp.shift().split("x");
			this.uri.cols = parseInt(inp0[0]);
			this.uri.rows = parseInt(inp0[1]);
			this.uri.bstr = inp.join("/");
		}

	},
	checkpflag : function(ca){ return (this.uri.pflag.indexOf(ca)>=0);},

	//---------------------------------------------------------------------------
	// enc.decode4()  quesが0～4までの場合、デコードする
	// enc.encode4()  quesが0～4までの場合、問題部をエンコードする
	//---------------------------------------------------------------------------
	decode4 : function(bstr, func, max){
		var cell=0, i=0;
		for(i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i);
			if     (this.include(ca,"0","4")){ func(cell, parseInt(ca,16));    cell++; }
			else if(this.include(ca,"5","9")){ func(cell, parseInt(ca,16)-5);  cell+=2;}
			else if(this.include(ca,"a","e")){ func(cell, parseInt(ca,16)-10); cell+=3;}
			else if(this.include(ca,"g","z")){ cell+=(parseInt(ca,36)-15);}
			else if(ca=="."){ func(cell, -2); cell++;}

			if(cell>=max){ break;}
		}
		return bstr.substring(i+1,bstr.length);
	},
	encode4 : function(func, max){
		var count = 0, cm = "";
		for(var i=0;i<max;i++){
			var pstr = "";

			if(func(i)>=0){
				if(func(i+1)>=0||func(i+1)==-2){ pstr=""+func(i).toString(16);}
				else if(func(i+2)>=0||func(i+2)==-2){ pstr=""+(5+func(i)).toString(16); i++;}
				else{ pstr=""+(10+func(i)).toString(16); i+=2;}
			}
			else if(func(i)==-2){ pstr=".";}
			else{ pstr=" "; count++;}

			if(count==0)      { cm += pstr;}
			else if(pstr!=" "){ cm += ((count+15).toString(36)+pstr); count=0;}
			else if(count==20){ cm += "z"; count=0;}
		}
		if(count>0){ cm += ((count+15).toString(36));}

		return cm;
	},

	//---------------------------------------------------------------------------
	// enc.decodeNumber10()  quesが0～9までの場合、デコードする
	// enc.encodeNumber10()  quesが0～9までの場合、問題部をエンコードする
	//---------------------------------------------------------------------------
	decodeNumber10 : function(bstr){
		var c=0, i=0;
		for(i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i);

			if     (this.include(ca,"0","9")){ bd.sQnC(c, parseInt(bstr.substring(i,i+1),10)); c++;}
			else if(this.include(ca,"a","z")){ c += (parseInt(ca,36)-9);}
			else if(ca == '.'){ bd.sQnC(c, -2); c++;}
			else{ c++;}

			if(c > bd.cell.length){ break;}
		}
		return bstr.substring(i,bstr.length);
	},
	encodeNumber10 : function(){
		var cm="", count=0;
		for(var i=0;i<bd.cell.length;i++){
			pstr = "";
			var val = bd.QnC(i);

			if     (val==  -2            ){ pstr = ".";}
			else if(val>=   0 && val<  10){ pstr =       val.toString(10);}
			else{ count++;}

			if(count==0){ cm += pstr;}
			else if(pstr || count==26){ cm+=((9+count).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm+=(9+count).toString(36);}

		return cm;
	},

	//---------------------------------------------------------------------------
	// enc.decodeNumber16()  quesが0～8192?までの場合、デコードする
	// enc.encodeNumber16()  quesが0～8192?までの場合、問題部をエンコードする
	//---------------------------------------------------------------------------
	decodeNumber16 : function(bstr){
		var c = 0, i=0;
		for(i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i);

			if(this.include(ca,"0","9")||this.include(ca,"a","f")){ bd.sQnC(c, parseInt(bstr.substring(i,i+1),16)); c++;}
			else if(ca == '.'){ bd.sQnC(c, -2);                                        c++;      }
			else if(ca == '-'){ bd.sQnC(c, parseInt(bstr.substring(i+1,i+3),16));      c++; i+=2;}
			else if(ca == '+'){ bd.sQnC(c, parseInt(bstr.substring(i+1,i+4),16));      c++; i+=3;}
			else if(ca == '='){ bd.sQnC(c, parseInt(bstr.substring(i+1,i+4),16)+4096); c++; i+=3;}
			else if(ca == '%'){ bd.sQnC(c, parseInt(bstr.substring(i+1,i+4),16)+8192); c++; i+=3;}
			else if(ca >= 'g' && ca <= 'z'){ c += (parseInt(ca,36)-15);}
			else{ c++;}

			if(c > bd.cell.length){ break;}
		}
		return bstr.substring(i,bstr.length);
	},
	encodeNumber16 : function(){
		var count=0, cm="";
		for(var i=0;i<bd.cell.length;i++){
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

		return cm;
	},

	//---------------------------------------------------------------------------
	// enc.decodeRoomNumber16()  部屋＋部屋の一つのquesが0～8192?までの場合、デコードする
	// enc.encodeRoomNumber16()  部屋＋部屋の一つのquesが0～8192?までの場合、問題部をエンコードする
	//---------------------------------------------------------------------------
	decodeRoomNumber16 : function(bstr){
		room.resetRarea();
		var r = 1, i=0;
		for(i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i);

			if(this.include(ca,"0","9")||this.include(ca,"a","f")){ bd.sQnC(room.getTopOfRoom(r), parseInt(bstr.substring(i,i+1),16)); r++;}
			else if(ca == '-'){ bd.sQnC(room.getTopOfRoom(r), parseInt(bstr.substring(i+1,i+3),16));      r++; i+=2;}
			else if(ca == '+'){ bd.sQnC(room.getTopOfRoom(r), parseInt(bstr.substring(i+1,i+4),16));      r++; i+=3;}
			else if(ca == '='){ bd.sQnC(room.getTopOfRoom(r), parseInt(bstr.substring(i+1,i+4),16)+4096); r++; i+=3;}
			else if(ca == '%'){ bd.sQnC(room.getTopOfRoom(r), parseInt(bstr.substring(i+1,i+4),16)+8192); r++; i+=3;}
			else if(ca == '*'){ bd.sQnC(room.getTopOfRoom(r), parseInt(bstr.substring(i+1,i+4),16)+12240); r++; i+=4;}
			else if(ca == '$'){ bd.sQnC(room.getTopOfRoom(r), parseInt(bstr.substring(i+1,i+4),16)+77776); r++; i+=5;}
			else if(ca >= 'g' && ca <= 'z'){ r += (parseInt(ca,36)-15);}
			else{ r++;}

			if(r > room.rareamax){ break;}
		}
		return bstr.substring(i,bstr.length);
	},
	encodeRoomNumber16 : function(){
		room.resetRarea();
		var count=0, cm="";
		for(var i=1;i<=room.rareamax;i++){
			var pstr = "";
			var val = bd.QnC(room.getTopOfRoom(i));

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

		return cm;
	},

	//---------------------------------------------------------------------------
	// enc.decodeArrowNumber16()  矢印付きquesが0～8192?までの場合、デコードする
	// enc.encodeArrowNumber16()  矢印付きquesが0～8192?までの場合、問題部をエンコードする
	//---------------------------------------------------------------------------
	decodeArrowNumber16 : function(bstr){
		var c=0, i=0;
		for(i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i);

			if     (ca=='0'){ bd.sQnC(c, parseInt(bstr.substring(i+1,i+2),16)); c++; i++; }
			else if(ca=='5'){ bd.sQnC(c, parseInt(bstr.substring(i+1,i+3),16)); c++; i+=2;}
			else if(this.include(ca,"1","4")){
				bd.sDiC(c, parseInt(ca,16));
				if(bstr.charAt(i+1)!="."){ bd.sQnC(c, parseInt(bstr.substring(i+1,i+2),16));}
				else{ bd.sQnC(c,-2);}
				c++; i++;
			}
			else if(this.include(ca,"6","9")){
				bd.sDiC(c, parseInt(ca,16)-5);
				bd.sQnC(c, parseInt(bstr.substring(i+1,i+3),16));
				c++; i+=2;
			}
			else if(ca>='a' && ca<='z'){ c+=(parseInt(ca,36)-9);}
			else{ c++;}

			if(c > bd.cell.length){ break;}
		}
		return bstr.substring(i,bstr.length);
	},
	encodeArrowNumber16 : function(){
		var cm = "", count = 0;
		for(var c=0;c<bd.cell.length;c++){
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

		return cm;
	},

	//---------------------------------------------------------------------------
	// enc.decodeBorder() 問題の境界線をデコードする
	// enc.encodeBorder() 問題の境界線をエンコードする
	//---------------------------------------------------------------------------
	decodeBorder : function(bstr){
		var pos1, pos2;

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

		return bstr.substring(pos2,bstr.length);
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

		return cm;
	},

	//---------------------------------------------------------------------------
	// enc.decodeCrossMark() 黒点をデコードする
	// enc.encodeCrossMark() 黒点をエンコードする
	//---------------------------------------------------------------------------
	decodeCrossMark : function(bstr){
		var cc = -1, i=0;
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
		return bstr.substring(i, bstr.length);
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

		return cm;
	},

	//---------------------------------------------------------------------------
	// enc.decodecross_old() Crossの問題部をデコードする(旧形式)
	//---------------------------------------------------------------------------
	decodecross_old : function(bstr){
		for(var i=0;i<Math.min(bstr.length, bd.cross.length);i++){
			if     (bstr.charAt(i)=="0"){ bd.sQnX(i,0);}
			else if(bstr.charAt(i)=="1"){ bd.sQnX(i,1);}
			else if(bstr.charAt(i)=="2"){ bd.sQnX(i,2);}
			else if(bstr.charAt(i)=="3"){ bd.sQnX(i,3);}
			else if(bstr.charAt(i)=="4"){ bd.sQnX(i,4);}
			else{ bd.sQnX(i,-1);}
		}
		for(var j=bstr.length;j<bd.cross.length;j++){ bd.sQnX(j,-1);}

		return bstr.substring(i,bstr.length);
	},

	//---------------------------------------------------------------------------
	// enc.include()    文字列caはbottomとupの間にあるか
	// enc.getURLbase() このスクリプトが置いてあるURLを表示する
	// enc.getDocbase() このスクリプトが置いてあるドメイン名を表示する
	// enc.kanpenbase() カンペンのドメイン名を表示する
	//---------------------------------------------------------------------------
	include : function(ca, bottom, up){
		if(bottom <= ca && ca <= up) return true;
		return false;
	},
	getURLbase : function(){ return "http://indi.s58.xrea.com/pzpr/v3/p.html";},
	getDocbase : function(){ return "http://indi.s58.xrea.com/";},
	kanpenbase : function(){ return "http://www.kanpen.net/";}
};
