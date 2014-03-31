// Parser.js v3.4.1

(function(){

pzpr.addConsts({
	// 定数(URL形式)
	URL_AUTO    : 0,
	URL_PZPRV3  : 6,
	URL_PZPRV3E : 3,
	URL_PZPRAPP : 1,
	URL_KANPEN  : 2,
	URL_KANPENP : 5,
	URL_HEYAAPP : 4
});

pzpr.addConsts({
	// 定数(ファイル形式)
	FILE_AUTO : 0,
	FILE_PZPR : 1,
	FILE_PBOX : 2,
	FILE_PZPH : 3
});

var k = pzpr.consts;

pzpr.parser = {
	parseURL : function(url){
		url = url.replace(/(\r|\n)/g,""); // textarea上の改行が実際の改行扱いになるUAに対応(Operaとか)
		return (new pzpr.parser.ParsedURLData(url)).parse();
	},
	parseFile : function(fstr, variety){
		fstr = fstr.replace(/[\t\r]*\n/g,"\n").replace(/\//g,"\n");
		return (new pzpr.parser.ParsedFileData(fstr, variety)).parse();
	}
};

//---------------------------------------------------------------------------
// ★ parsedURLData() URLデータのencode/decodeのためのオブジェクト
//---------------------------------------------------------------------------
pzpr.parser.ParsedURLData = function(url){
	this.url = url;
}
pzpr.parser.ParsedURLData.prototype = {
	id      : '',
	type    : k.URL_AUTO,
	url     : "",
	qdata   : "",
	pflag   : null,
	cols    : 0,
	rows    : 0,
	bstr    : "",
	
	parse : function (){
		this.parseURLType();
		this.parseURLData();
		return this;
	},
	generate : function (){
		return this.outputURLType() + this.outputURLData();
	},
	
	//---------------------------------------------------------------------------
	// ★ parseURLType() 入力されたURLからどのパズルか、およびURLの種類を抽出する
	//                   入力=URL 例:http://pzv.jp/p.html?(pid)/(qdata)
	//                   出力={id:パズル種類, type:URL種類, qdata:タテヨコ以下のデータ}
	//                         qdata -> [(pflag)/](cols)/(rows)/(bstr)
	//---------------------------------------------------------------------------
	parseURLType : function(){
		/* URLからパズルの種類・URLの種類を判定する */
		var url = this.url;
		// カンペンの場合
		if(url.match(/www\.kanpen\.net/) || url.match(/www\.geocities(\.co)?\.jp\/pencil_applet/) ){
			url.match(/([0-9a-z]+)\.html/);
			this.id = RegExp.$1;
			// カンペンだけどデータ形式はへやわけアプレット
			if(url.indexOf("?heyawake=")>=0){
				this.qdata = url.substr(url.indexOf("?heyawake=")+10);
				this.type = k.URL_HEYAAPP;
			}
			// カンペンだけどデータ形式はぱずぷれ
			else if(url.indexOf("?pzpr=")>=0){
				this.qdata = url.substr(url.indexOf("?pzpr=")+6);
				this.type = k.URL_PZPRV3;
			}
			else{
				this.qdata = url.substr(url.indexOf("?problem=")+9);
				this.type = k.URL_KANPEN;
			}
		}
		// へやわけアプレットの場合
		else if(url.match(/www\.geocities(\.co)?\.jp\/heyawake/)){
			this.id = 'heyawake';
			this.qdata = url.substr(url.indexOf("?problem=")+9);
			this.type = k.URL_HEYAAPP;
		}
		// ぱずぷれアプレットの場合
		else if(url.match(/indi\.s58\.xrea\.com\/(.+)\/(sa|sc)\//)){
			this.id = RegExp.$1;
			this.qdata = url.substr(url.indexOf("?"));
			this.type = k.URL_PZPRAPP;
		}
		// ぱずぷれv3の場合
		else{
			var qs = url.indexOf("/", url.indexOf("?"));
			if(qs>-1){
				this.id = url.substring(url.indexOf("?")+1,qs);
				this.qdata = url.substr(qs+1);
			}
			else{
				this.id = url.substr(url.indexOf("?")+1);
			}
			this.id = this.id.replace(/(m\+|_edit|_test|_play)/,'');
			this.type = k.URL_PZPRV3;
		}
		this.id = pzpr.variety.toPID(this.id);
	},

	//---------------------------------------------------------------------------
	// ★ outputURLType() パズル種類, URL種類からURLを生成する
	//---------------------------------------------------------------------------
	outputURLType : function(){
		/* URLの種類からURLを取得する */
		var url = "", type = this.type;
		switch(this.type){
			case k.URL_PZPRV3:  url="http://%DOMAIN%/p.html?%PID%/"; break;
			case k.URL_PZPRV3E: url="http://%DOMAIN%/p.html?%PID%_edit/"; break;
			case k.URL_PZPRAPP: url="http://indi.s58.xrea.com/%PID%/sa/q.html?"; break;
			case k.URL_KANPEN:  url="http://www.kanpen.net/%KID%.html?problem="; break;
			case k.URL_KANPENP: url="http://www.kanpen.net/%KID%.html?pzpr="; break;
			case k.URL_HEYAAPP: url="http://www.geocities.co.jp/heyawake/?problem="; break;
		}

		var domain = document.domain;
		if(!domain){ domain = "pzv.jp";}
		else if(domain == "indi.s58.xrea.com"){ domain = "indi.s58.xrea.com/pzpr/v3";}

		if(this.type===k.URL_PZPRAPP){
			if     (this.id==='pipelinkr'){ url=url.replace("%PID%","pipelink");}
			else if(this.id==='heyabon')  { url=url.replace("%PID%","bonsan");}
		}

		return url.replace("%DOMAIN%", domain)
				  .replace("%PID%", pzpr.variety.toURLID(this.id))
				  .replace("%KID%", pzpr.variety.toKanpen(this.id));
	},

	//---------------------------------------------------------------------------
	// ★ parseURLData() URLを縦横・問題部分などに分解する
	//                   qdata -> [(pflag)/](cols)/(rows)/(bstr)
	//---------------------------------------------------------------------------
	parseURLData : function(){
		var inp = this.qdata.split("/"), col = 0, row = 0;
		/* URLにつけるオプション */
		if(this.type!==k.URL_KANPEN && this.type!==k.URL_HEYAAPP){
			if(!isNaN(parseInt(inp[0]))){ inp.unshift("");}
			this.pflag = inp.shift();
		}
		
		/* サイズを表す文字列 */
		if(this.type===k.URL_KANPEN){
			if(this.id==="kakuro"){
				row = +inp.shift() - 1;
				col = +inp.shift() - 1;
			}
			else if(this.id=="sudoku"){
				row = col = +inp.shift();
			}
			else{
				row = +inp.shift();
				col = +inp.shift();
			}
		}
		else if(this.type===k.URL_HEYAAPP){
			var size = inp.shift().split("x");
			col = +size[0];
			row = +size[1];
		}
		else{
			col = +inp.shift();
			row = +inp.shift();
		}
		this.rows = row;
		this.cols = col;

		/* サイズ以降のデータを取得 */
		this.bstr = inp.join("/");
	},

	//---------------------------------------------------------------------------
	// ★ outputURLData() qdataを生成する
	//---------------------------------------------------------------------------
	outputURLData : function(){
		var pzl = this, col = pzl.cols, row = pzl.rows, out = [];

		/* URLにつけるオプション */
		if(pzl.type!==k.URL_KANPEN && pzl.type!==k.URL_HEYAAPP){
			if(pzl.pflag!==null){ out.push(pzl.pflag);}
		}

		/* サイズを表す文字列 */
		if(pzl.type===k.URL_KANPEN){
			if(pzl.id==="kakuro"){
				out.push(row + 1);
				out.push(col + 1);
			}
			else if(pzl.id==="sudoku"){
				out.push(col);
			}
			else{
				out.push(row);
				out.push(col);
			}
		}
		else if(pzl.type===k.URL_HEYAAPP){
			out.push([cols, row].join("x"));
		}
		else{
			out.push(col);
			out.push(row);
		}

		/* サイズ以降のデータを設定 */
		out.push(pzl.bstr);

		return out.join("/");
	}
};

//---------------------------------------------------------------------------
// ★ parsedFileData() ファイルデータのencode/decodeのためのオブジェクト
//---------------------------------------------------------------------------
pzpr.parser.ParsedFileData = function(fstr, variety){
	this.id   = (!!variety ? variety : '');
	this.fstr = fstr;
}
pzpr.parser.ParsedFileData.prototype = {
	id      : '',
	type    : k.FILE_AUTO,
	filever : 0,
	fstr    : "",
	qdata   : "",
	cols    : 0,
	rows    : 0,
	bstr    : "",
	
	parse : function(){
		var result = (this.parseFileType() && this.parseFileData());
		return (result ? this : null);
	},
	generate : function(){
		return this.outputFileType() + this.outputFileData();
	},
	
	//---------------------------------------------------------------------------
	// ★ parseFileType() 入力されたファイルのデータからどのパズルか、およびパズルの種類を抽出する
	//                   出力={id:パズル種類, type:ファイル種類, fstr:ファイルの内容}
	//---------------------------------------------------------------------------
	parseFileType : function(){
		var lines = this.fstr.split(/\n/);
		var firstline = lines.shift();
		
		/* ヘッダからパズルの種類・ファイルの種類を判定する */
		var type = this.type = (firstline.match(/^pzprv3/) ? k.FILE_PZPR : k.FILE_PBOX);
		if(type===k.FILE_PZPR){
			if(firstline.match(/pzprv3\.(\d+)/)){ this.filever = +RegExp.$1;}
			this.id = lines.shift();
		}
		else if(type===k.FILE_PBOX){
			lines.unshift(firstline);
		}
		this.qdata = lines.join("\n");
		
		return (!!this.id);
	},
	
	//---------------------------------------------------------------------------
	// ★ outputFileType() パズル種類, ファイル種類からヘッダを生成する
	//---------------------------------------------------------------------------
	outputFileType : function(){
		/* ヘッダの処理 */
		if(this.type===k.FILE_PZPR){
			return [(this.filever===0?"pzprv3":("pzprv3." + this.filever)), this.id, ""].join("\n");
		}
		return "";
	},
	
	//---------------------------------------------------------------------------
	// ★ parseFileData() ファイルの内容からサイズなどを求める
	//---------------------------------------------------------------------------
	parseFileData : function(){
		var lines = this.qdata.split(/\n/), col = 0, row = 0;
		
		/* サイズを表す文字列 */
		if(this.type===k.FILE_PBOX && this.id==="kakuro"){
			row = +lines.shift() - 1;
			col = +lines.shift() - 1;
		}
		else if(this.id==="sudoku"){
			row = col = +lines.shift();
		}
		else{
			row = +lines.shift();
			col = +lines.shift();
		}
		if(row<=0 || col<=0){ return false;}
		this.rows = row;
		this.cols = col;
		
		/* サイズ以降のデータを取得 */
		var bstrs = [];
		for(var i=0;i<lines.length;i++){
			if(lines[i].match(/^http\:\/\//)){ break;}
			bstrs.push(lines[i]);
		}
		this.bstr = bstrs.join("\n");
		
		return true;
	},
	
	//---------------------------------------------------------------------------
	// ★ outputFileData() パズル種類, URL種類, fstrからファイルのデータを生成する
	//---------------------------------------------------------------------------
	outputFileData : function(){
		var pzl = this, col = pzl.cols, row = pzl.rows, out = [];

		/* サイズを表す文字列 */
		if(pzl.type===k.FILE_PBOX && pzl.id==="kakuro"){
			out.push(row + 1);
			out.push(col + 1);
		}
		else if(pzl.id==="sudoku"){
			out.push(col);
		}
		else{
			out.push(row);
			out.push(col);
		}

		/* サイズ以降のデータを設定 */
		out.push(pzl.bstr);

		return out.join("\n");
	}
}

})();
