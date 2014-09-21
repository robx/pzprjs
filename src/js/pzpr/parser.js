// Parser.js v3.4.1

(function(){

var URL_AUTO    = 0,
	URL_PZPRV3  = 6,
	URL_PZPRV3E = 3,
	URL_PZPRAPP = 1,
	URL_KANPEN  = 2,
	URL_KANPENP = 5,
	URL_HEYAAPP = 4,
	
	FILE_AUTO = 0,
	FILE_PZPR = 1,
	FILE_PBOX = 2,
	FILE_PZPH = 3;

pzpr.parser = {
	
	// 定数(URL形式)
	URL_AUTO    : URL_AUTO,
	URL_PZPRV3  : URL_PZPRV3,
	URL_PZPRV3E : URL_PZPRV3E,
	URL_PZPRAPP : URL_PZPRAPP,
	URL_KANPEN  : URL_KANPEN,
	URL_KANPENP : URL_KANPENP,
	URL_HEYAAPP : URL_HEYAAPP,
	
	// 定数(ファイル形式)
	FILE_AUTO : FILE_AUTO,
	FILE_PZPR : FILE_PZPR,
	FILE_PBOX : FILE_PBOX,
	FILE_PZPH : FILE_PZPH,
	
	/* 入力された文字列を、URLおよびファイルデータとして解析し返します        */
	/* ただし最初から解析済みのデータが渡された場合は、それをそのまま返します */
	parse : function(data, variety){
		if(data instanceof this.URLData || data instanceof this.FileData){ return data;}
		
		/* 改行が2つ以上ある場合はファイルデータ、それ以下ではURLとして扱います */
		/* orでつなげようとしましたが、URLの/を改行扱いしてしまうのでダメでした */
		if(data.indexOf("pzprv3")===0 || data.indexOf("\n",data.indexOf("\n"))>-1){
			return this.parseFile(data, variety);
		}
		return this.parseURL(data);
	},
	
	parseURL : function(url){
		if(url instanceof this.URLData){ return url;}
		
		url = url.replace(/(\r|\n)/g,""); // textarea上の改行が実際の改行扱いになるUAに対応(Operaとか)
		return (new pzpr.parser.URLData(url)).parse();
	},
	parseFile : function(fstr, variety){
		if(fstr instanceof this.FileData){ return fstr;}
		
		fstr = fstr.replace(/[\t\r]*\n/g,"\n").replace(/\//g,"\n");
		return (new pzpr.parser.FileData(fstr, variety)).parse();
	}
};

//---------------------------------------------------------------------------
// ★ URLData() URLデータのencode/decodeのためのオブジェクト
//---------------------------------------------------------------------------
pzpr.parser.URLData = function(url){
	this.url = url;
}
pzpr.parser.URLData.prototype = {
	id      : '',
	type    : URL_AUTO,	/* ==0 */
	url     : "",
	qdata   : "",
	pflag   : null,
	cols    : 0,
	rows    : 0,
	bstr    : "",
	
	isurl : true,
	
	// 定数(URL形式)
	URL_AUTO    : URL_AUTO,
	URL_PZPRV3  : URL_PZPRV3,
	URL_PZPRV3E : URL_PZPRV3E,
	URL_PZPRAPP : URL_PZPRAPP,
	URL_KANPEN  : URL_KANPEN,
	URL_KANPENP : URL_KANPENP,
	URL_HEYAAPP : URL_HEYAAPP,
	
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
				this.type = this.URL_HEYAAPP;
			}
			// カンペンだけどデータ形式はぱずぷれ
			else if(url.indexOf("?pzpr=")>=0){
				this.qdata = url.substr(url.indexOf("?pzpr=")+6);
				this.type = this.URL_PZPRV3;
			}
			else{
				this.qdata = url.substr(url.indexOf("?problem=")+9);
				this.type = this.URL_KANPEN;
			}
		}
		// へやわけアプレットの場合
		else if(url.match(/www\.geocities(\.co)?\.jp\/heyawake/)){
			this.id = 'heyawake';
			this.qdata = url.substr(url.indexOf("?problem=")+9);
			this.type = this.URL_HEYAAPP;
		}
		// ぱずぷれアプレットの場合
		else if(url.match(/indi\.s58\.xrea\.com\/(.+)\/(sa|sc)\//)){
			this.id = RegExp.$1;
			this.qdata = url.substr(url.indexOf("?"));
			this.type = this.URL_PZPRAPP;
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
			this.type = this.URL_PZPRV3;
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
			case this.URL_PZPRV3:  url="http://%DOMAIN%/p.html?%PID%/"; break;
			case this.URL_PZPRV3E: url="http://%DOMAIN%/p.html?%PID%_edit/"; break;
			case this.URL_PZPRAPP: url="http://indi.s58.xrea.com/%PID%/sa/q.html?"; break;
			case this.URL_KANPEN:  url="http://www.kanpen.net/%KID%.html?problem="; break;
			case this.URL_KANPENP: url="http://www.kanpen.net/%KID%.html?pzpr="; break;
			case this.URL_HEYAAPP: url="http://www.geocities.co.jp/heyawake/?problem="; break;
		}

		var domain = document.domain;
		if(!domain){ domain = "pzv.jp";}
		else if(domain == "indi.s58.xrea.com"){ domain = "indi.s58.xrea.com/pzpr/v3";}

		if(this.type===this.URL_PZPRAPP){
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
		if(this.type!==this.URL_KANPEN && this.type!==this.URL_HEYAAPP){
			if(!isNaN(parseInt(inp[0]))){ inp.unshift("");}
			this.pflag = inp.shift();
		}
		
		/* サイズを表す文字列 */
		if(this.type===this.URL_KANPEN){
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
		else if(this.type===this.URL_HEYAAPP){
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
		if(pzl.type!==this.URL_KANPEN && pzl.type!==this.URL_HEYAAPP){
			if(pzl.pflag!==null){ out.push(pzl.pflag);}
		}

		/* サイズを表す文字列 */
		if(pzl.type===this.URL_KANPEN){
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
		else if(pzl.type===this.URL_HEYAAPP){
			out.push([col, row].join("x"));
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
// ★ FileData() ファイルデータのencode/decodeのためのオブジェクト
//---------------------------------------------------------------------------
pzpr.parser.FileData = function(fstr, variety){
	this.id   = (!!variety ? variety : '');
	this.fstr = fstr;
}
pzpr.parser.FileData.prototype = {
	id      : '',
	type    : FILE_AUTO,	/* == 0 */
	filever : 0,
	fstr    : "",
	qdata   : "",
	cols    : 0,
	rows    : 0,
	bstr    : "",
	history : "",
	
	isfile : true,
	
	// 定数(ファイル形式)
	FILE_AUTO : FILE_AUTO,
	FILE_PZPR : FILE_PZPR,
	FILE_PBOX : FILE_PBOX,
	FILE_PZPH : FILE_PZPH,
	
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
		var lines = this.fstr.split("\n");
		var firstline = lines.shift();
		
		/* ヘッダからパズルの種類・ファイルの種類を判定する */
		var type = this.type = (firstline.match(/^pzprv3/) ? this.FILE_PZPR : this.FILE_PBOX);
		if(type===this.FILE_PZPR){
			if(firstline.match(/pzprv3\.(\d+)/)){ this.filever = +RegExp.$1;}
			this.id = lines.shift();
		}
		else if(type===this.FILE_PBOX){
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
		if(this.type===this.FILE_PZPR || this.type===this.FILE_PZPH){
			return [(this.filever===0?"pzprv3":("pzprv3." + this.filever)), this.id, ""].join("\n");
		}
		return "";
	},
	
	//---------------------------------------------------------------------------
	// ★ parseFileData() ファイルの内容からサイズなどを求める
	//---------------------------------------------------------------------------
	parseFileData : function(){
		var lines = this.qdata.split("\n"), col = 0, row = 0;
		
		/* サイズを表す文字列 */
		if(this.type===this.FILE_PBOX && this.id==="kakuro"){
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
		var bstrs = [], historypos = null;
		for(var i=0;i<lines.length;i++){
			/* かなり昔のぱずぷれファイルは最終行にURLがあったので、末尾扱いする */
			if(lines[i].match(/^http\:\/\//)){ break;}
			
			/* 履歴行に到達した場合 */
			if(lines[i].match(/history:\{|__HISTORY__/)){ historypos=i; break;}
			
			bstrs.push(lines[i]);
		}
		this.bstr = bstrs.join("\n");
		
		/* 履歴部分の読み込み */
		if(this.type===this.FILE_PZPR && historypos!==null){
			var histrs = [], count = 0, cnt;
			for(var i=historypos;i<lines.length;i++){
				histrs.push(lines[i]);
				
				cnt = count;
				count += (lines[i].match(/\{/g)||[]).length;
				count -= (lines[i].match(/\}/g)||[]).length;
				if(cnt>0 && count==0){ break;}
			}
			this.history = histrs.join("\n");
			this.type = this.FILE_PZPH;
		}
		
		return true;
	},
	
	//---------------------------------------------------------------------------
	// ★ outputFileData() パズル種類, URL種類, fstrからファイルのデータを生成する
	//---------------------------------------------------------------------------
	outputFileData : function(){
		var pzl = this, col = pzl.cols, row = pzl.rows, out = [];

		/* サイズを表す文字列 */
		if(pzl.type===this.FILE_PBOX && pzl.id==="kakuro"){
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

		/* 履歴出力がある形式ならば出力する */
		if(pzl.type===this.FILE_PZPH){
			out.push(pzl.history);
		}

		return out.join("\n");
	}
};

})();
