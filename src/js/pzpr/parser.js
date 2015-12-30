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
	FILE_PBOX_XML = 3;

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
	FILE_PBOX_XML : FILE_PBOX_XML,
	
	/* 入力された文字列を、URLおよびファイルデータとして解析し返します        */
	/* ただし最初から解析済みのデータが渡された場合は、それをそのまま返します */
	parse : function(data, variety){
		if(data instanceof this.URLData || data instanceof this.FileData){ return data;}
		
		return this.parseFile(data, variety) || this.parseURL(data);
	},
	
	parseURL : function(url){
		if(url instanceof this.URLData){ return url;}
		
		url = url.replace(/(\r|\n)/g,""); // textarea上の改行が実際の改行扱いになるUAに対応(Operaとか)
		return (new pzpr.parser.URLData(url)).parse();
	},
	parseFile : function(fstr, variety){
		if(fstr instanceof this.FileData){ return fstr;}
		
		if(!fstr.match(/^\<\?xml/)){ // jshint ignore:line
			fstr = fstr.replace(/[\t\r]*\n/g,"\n").replace(/\//g,"\n");
		}
		return (new pzpr.parser.FileData(fstr, variety)).parse();
	}
};

//---------------------------------------------------------------------------
// ★ URLData() URLデータのencode/decodeのためのオブジェクト
//---------------------------------------------------------------------------
pzpr.parser.URLData = function(url){
	this.url = url;
};
pzpr.parser.URLData.prototype = {
	pid     : '',
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
	//                   出力={pid:パズル種類, type:URL種類, qdata:タテヨコ以下のデータ}
	//                         qdata -> [(pflag)/](cols)/(rows)/(bstr)
	//---------------------------------------------------------------------------
	parseURLType : function(){
		/* URLからパズルの種類・URLの種類を判定する */
		var url = this.url;
		// カンペンの場合
		if(url.match(/www\.kanpen\.net/) || url.match(/www\.geocities(\.co)?\.jp\/pencil_applet/) ){
			url.match(/([0-9a-z]+)\.html/);
			this.pid = RegExp.$1;
			// カンペンだけどデータ形式はへやわけアプレット
			if(url.indexOf("?heyawake=")>=0){
				this.qdata = url.substr(url.indexOf("?heyawake=")+10);
				this.type = URL_HEYAAPP;
			}
			// カンペンだけどデータ形式はぱずぷれ
			else if(url.indexOf("?pzpr=")>=0){
				this.qdata = url.substr(url.indexOf("?pzpr=")+6);
				this.type = URL_PZPRV3;
			}
			else{
				this.qdata = url.substr(url.indexOf("?problem=")+9);
				this.type = URL_KANPEN;
			}
		}
		// へやわけアプレットの場合
		else if(url.match(/www\.geocities(\.co)?\.jp\/heyawake/)){
			this.pid = 'heyawake';
			this.qdata = url.substr(url.indexOf("?problem=")+9);
			this.type = URL_HEYAAPP;
		}
		// ぱずぷれアプレットの場合
		else if(url.match(/indi\.s58\.xrea\.com\/(.+)\/(sa|sc)\//)){
			this.pid = RegExp.$1;
			this.qdata = url.substr(url.indexOf("?"));
			this.type = URL_PZPRAPP;
		}
		// ぱずぷれv3の場合
		else{
			var qs = url.indexOf("/", url.indexOf("?"));
			if(qs>-1){
				this.pid = url.substring(url.indexOf("?")+1,qs);
				this.qdata = url.substr(qs+1);
			}
			else{
				this.pid = url.substr(url.indexOf("?")+1);
			}
			this.pid = this.pid.replace(/(m\+|_edit|_test|_play)/,'');
			this.type = URL_PZPRV3;
		}
		this.pid = pzpr.variety.toPID(this.pid);
	},

	//---------------------------------------------------------------------------
	// ★ outputURLType() パズル種類, URL種類からURLを生成する
	//---------------------------------------------------------------------------
	outputURLType : function(){
		/* URLの種類からURLを取得する */
		var domain = document.domain, url = "", pid = this.pid;
		if(!!domain){ domain += location.pathname;}
		else{ domain = "pzv.jp/p.html";}
		switch(this.type){
			case URL_PZPRV3:  url="http://"+domain+"?%PID%/"; break;
			case URL_PZPRV3E: url="http://"+domain+"?%PID%_edit/"; break;
			case URL_PZPRAPP: url="http://indi.s58.xrea.com/%PID%/sa/q.html?"; break;
			case URL_KANPEN:  url="http://www.kanpen.net/%KID%.html?problem="; break;
			case URL_KANPENP: url="http://www.kanpen.net/%KID%.html?pzpr="; break;
			case URL_HEYAAPP: url="http://www.geocities.co.jp/heyawake/?problem="; break;
		}

		if(this.type===URL_PZPRAPP){
			if     (pid==='pipelinkr'){ url=url.replace("%PID%","pipelink");}
			else if(pid==='heyabon')  { url=url.replace("%PID%","bonsan");}
		}

		return url.replace("%PID%", pzpr.variety.toURLID(pid))
				  .replace("%KID%", pzpr.variety.toKanpen(pid));
	},

	//---------------------------------------------------------------------------
	// ★ parseURLData() URLを縦横・問題部分などに分解する
	//                   qdata -> [(pflag)/](cols)/(rows)/(bstr)
	//---------------------------------------------------------------------------
	parseURLData : function(){
		var inp = this.qdata.split("/"), col = 0, row = 0;
		/* URLにつけるオプション */
		if(this.type!==URL_KANPEN && this.type!==URL_HEYAAPP){
			if(!isNaN(inp[0])){ inp.unshift("");}
			this.pflag = inp.shift();
		}
		
		/* サイズを表す文字列 */
		if(this.type===URL_KANPEN){
			if(this.pid==="kakuro"){
				row = +inp.shift() - 1;
				col = +inp.shift() - 1;
			}
			else if(this.pid==="sudoku"){
				row = col = +inp.shift();
			}
			else{
				row = +inp.shift();
				col = +inp.shift();
			}
		}
		else if(this.type===URL_HEYAAPP){
			var size = inp.shift().split("x");
			col = +size[0];
			row = +size[1];
		}
		else{
			col = +inp.shift() || NaN;
			row = +inp.shift() || NaN;
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
		if(pzl.type!==URL_KANPEN && pzl.type!==URL_HEYAAPP){
			if(pzl.pflag!==null){ out.push(pzl.pflag);}
		}

		/* サイズを表す文字列 */
		if(pzl.type===URL_KANPEN){
			if(pzl.pid==="kakuro"){
				out.push(row + 1);
				out.push(col + 1);
			}
			else if(pzl.pid==="sudoku"){
				out.push(col);
			}
			else{
				out.push(row);
				out.push(col);
			}
		}
		else if(pzl.type===URL_HEYAAPP){
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
	this.pid  = (!!variety ? variety : '');
	this.fstr = fstr;
	this.metadata = new pzpr.MetaData();
};
pzpr.parser.FileData.prototype = {
	pid     : '',
	type    : FILE_AUTO,	/* == 0 */
	filever : 0,
	fstr    : "",
	qdata   : "",
	cols    : 0,
	rows    : 0,
	bstr    : "",
	history : "",
	metadata: null,
	xmldoc  : null,
	
	isfile : true,
	
	// 定数(ファイル形式)
	FILE_AUTO : FILE_AUTO,
	FILE_PZPR : FILE_PZPR,
	FILE_PBOX : FILE_PBOX,
	FILE_PBOX_XML : FILE_PBOX_XML,
	
	parse : function(){
		var result = (this.parseFileType() && this.parseFileData());
		return (result ? this : null);
	},
	generate : function(){
		return this.outputFileType() + this.outputFileData();
	},
	
	//---------------------------------------------------------------------------
	// ★ parseFileType() 入力されたファイルのデータからどのパズルか、およびパズルの種類を抽出する
	//                   出力={pid:パズル種類, type:ファイル種類, fstr:ファイルの内容}
	//---------------------------------------------------------------------------
	parseFileType : function(){
		var lines = this.fstr.split("\n");
		var firstline = lines.shift();
		
		/* ヘッダからパズルの種類・ファイルの種類を判定する */
		if(firstline.match(/^pzprv3/)){
			this.type = FILE_PZPR;
			if(firstline.match(/pzprv3\.(\d+)/)){ this.filever = +RegExp.$1;}
			this.pid = lines.shift();
			this.qdata = lines.join("\n");
		}
		else if(firstline.match(/^\<\?xml/)){ // jshint ignore:line
			this.type = FILE_PBOX_XML;
			lines.unshift(firstline);
			this.qdata = lines.join("\n");
			if(!!DOMParser){
				this.xmldoc = (new DOMParser()).parseFromString(this.qdata, 'text/xml');
				this.pid = this.xmldoc.querySelector('puzzle').getAttribute('type');
			}
			else{ this.pid = '';}
		}
		else if(firstline.match(/^\d+$/)){
			this.type = FILE_PBOX;
			lines.unshift(firstline);
			this.qdata = lines.join("\n");
		}
		else{ this.pid = '';}
		this.pid = pzpr.variety.toPID(this.pid);
		
		return (!!this.pid);
	},
	
	//---------------------------------------------------------------------------
	// ★ outputFileType() パズル種類, ファイル種類からヘッダを生成する
	//---------------------------------------------------------------------------
	outputFileType : function(){
		/* ヘッダの処理 */
		if(this.type===FILE_PZPR){
			return [(this.filever===0?"pzprv3":("pzprv3." + this.filever)), this.pid, ""].join("\n");
		}
		else if(this.type===FILE_PBOX_XML){
			this.xmldoc.querySelector('puzzle').setAttribute('type', pzpr.variety.toKanpen(this.pid));
		}
		return "";
	},
	
	//---------------------------------------------------------------------------
	// ★ parseFileData() ファイルの内容からサイズなどを求める
	//---------------------------------------------------------------------------
	parseFileData : function(){
		var lines = this.qdata.split("\n"), col = 0, row = 0;
		
		/* サイズを表す文字列 */
		if(this.type===FILE_PBOX_XML){
			row = +this.xmldoc.querySelector('size').getAttribute('row');
			col = +this.xmldoc.querySelector('size').getAttribute('col');
			if(this.pid==="slither"||this.pid==='kakuro'){ row--; col--;}
		}
		else if(this.type===FILE_PBOX && this.pid==="kakuro"){
			row = +lines.shift() - 1;
			col = +lines.shift() - 1;
		}
		else if(this.pid==="sudoku"){
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
		if(this.type===FILE_PZPR){
			var historypos = null, str = "", strs = [], isinfo = false;
			for(var i=0;i<lines.length;i++){
				/* かなり昔のぱずぷれファイルは最終行にURLがあったので、末尾扱いする */
				if(lines[i].match(/^http\:\/\//)){ break;}
				
				/* info行に到達した場合 */
				if(lines[i].match(/info:\{/)){ historypos=i; isinfo = true; break;}
				
				/* 履歴行に到達した場合 */
				if(lines[i].match(/history:\{|__HISTORY__/)){ historypos=i; break;}
				
				strs.push(lines[i]);
			}
			this.bstr += strs.join('\n');
			
			/* 履歴部分の読み込み */
			if(historypos!==null && !!window.JSON){
				var count = 0, cnt;
				for(var i=historypos;i<lines.length;i++){
					str += lines[i];
					
					cnt = count;
					count += (lines[i].match(/\{/g)||[]).length;
					count -= (lines[i].match(/\}/g)||[]).length;
					if(cnt>0 && count===0){ break;}
				}
			}
			
			/* 履歴出力があったら入力する */
			if(!!window.JSON){
				if(isinfo && (str.substr(0,5)==="info:")){
					var info = JSON.parse(str.substr(5));
					this.metadata.copydata(info.metadata);
					this.history = info.history || '';
				}
				else if(str.substr(0,8)==="history:"){
					this.history = JSON.parse(str.substr(8));
				}
			}
		}
		else if(this.type===FILE_PBOX){
			this.bstr = lines.join("\n");
		}
		else if(this.type===FILE_PBOX_XML){
			if(!!DOMParser){
				var metanode = this.xmldoc.querySelector('property'), meta = this.metadata;
				meta.author = metanode.querySelector('author').getAttribute('value');
				meta.source = metanode.querySelector('source').getAttribute('value');
				meta.hard   = metanode.querySelector('difficulty').getAttribute('value');
				var commentnode = metanode.querySelector('comment');
				meta.comment= (!!commentnode ? commentnode.childNodes[0].data : '');
			}
		}
		
		return true;
	},
	
	//---------------------------------------------------------------------------
	// ★ outputFileData() パズル種類, URL種類, fstrからファイルのデータを生成する
	//---------------------------------------------------------------------------
	outputFileData : function(){
		var pzl = this, col = pzl.cols, row = pzl.rows, out = [];
		var puzzlenode = (this.type===FILE_PBOX_XML ? this.xmldoc.querySelector('puzzle') : null);

		/* サイズを表す文字列 */
		if(pzl.type===FILE_PBOX_XML){
			if(pzl.pid==="slither"||pzl.pid==='kakuro'){ row++; col++;}
			puzzlenode.appendChild(this.createXMLNode('size', {row:row, col:col}));
		}
		else if(pzl.type===FILE_PBOX && pzl.pid==="kakuro"){
			out.push(row + 1);
			out.push(col + 1);
		}
		else if(pzl.pid==="sudoku"){
			out.push(col);
		}
		else{
			out.push(row);
			out.push(col);
		}

		/* サイズ以降のデータを設定 */
		if(pzl.type!==FILE_PBOX_XML){
			out.push(pzl.bstr);
		}

		/* 履歴・メタデータ出力がある形式ならば出力する */
		if((pzl.type===FILE_PZPR) && !!window.JSON){
			if(!pzl.metadata.empty()){
				var info = {metadata:pzl.metadata.getvaliddata()};
				if(pzl.history){ info.history = pzl.history;}
				out.push("info:" + JSON.stringify(info,null,1));
			}
			else if(pzl.history){
				out.push("history:" + JSON.stringify(pzl.history,null,1));
			}
		}
		else if(pzl.type===FILE_PBOX_XML){
			var propnode = this.createXMLNode('property'), meta = pzl.metadata;
			propnode.appendChild(this.createXMLNode('author',     {value:meta.author}));
			propnode.appendChild(this.createXMLNode('source',     {value:meta.source}));
			propnode.appendChild(this.createXMLNode('difficulty', {value:meta.hard}));
			if(!!meta.comment){
				var commentnode = this.createXMLNode('comment');
				commentnode.appendChild(this.xmldoc.createTextNode(meta.comment));
				propnode.appendChild(commentnode);
			}
			puzzlenode.appendChild(propnode);
			
			// 順番を入れ替え
			puzzlenode.appendChild(puzzlenode.querySelector('board'));
			puzzlenode.appendChild(puzzlenode.querySelector('answer'));
		}

		var outputdata;
		if(pzl.type!==FILE_PBOX_XML){
			outputdata = out.join("\n");
		}
		else{
			outputdata = (new XMLSerializer()).serializeToString(this.xmldoc);
			if(!outputdata.match(/^\<\?xml/)){ // jshint ignore:line
				outputdata = '<?xml version="1.0" encoding="UTF-8"?>\n' + outputdata; // IE向け回避策
			}
		}
		return outputdata;
	},

	createXMLNode : function(name, attrs){
		var node = this.xmldoc.createElement(name);
		if(!!attrs){ for(var i in attrs){ node.setAttribute(i, attrs[i]);} }
		return node;
	}
};

})();
