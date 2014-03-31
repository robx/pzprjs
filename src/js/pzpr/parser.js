// Parser.js v3.4.1

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

pzpr.parser = {
	parseURL : function(url){
		return parseURLType(url);
	},
	constructURL : function(pzl){
		return constructURLType(pzl);
	}
};

//---------------------------------------------------------------------------
// ★ parseURLType() 入力されたURLからどのパズルか、およびURLの種類を抽出する
//                   入力=URL 例:http://pzv.jp/p.html?(pid)/(qdata)
//                   出力={id:パズル種類, type:URL種類, qdata:タテヨコ以下のデータ}
//---------------------------------------------------------------------------
function parseURLType(url){
	url = url.replace(/(\r|\n)/g,""); // textarea上の改行が実際の改行扱いになるUAに対応(Operaとか)

	var pzl = {id:'',type:k.URL_AUTO,qdata:''};
	// カンペンの場合
	if(url.match(/www\.kanpen\.net/) || url.match(/www\.geocities(\.co)?\.jp\/pencil_applet/) ){
		url.match(/([0-9a-z]+)\.html/);
		pzl.id = RegExp.$1;
		// カンペンだけどデータ形式はへやわけアプレット
		if(url.indexOf("?heyawake=")>=0){
			pzl.qdata = url.substr(url.indexOf("?heyawake=")+10);
			pzl.type = k.URL_HEYAAPP;
		}
		// カンペンだけどデータ形式はぱずぷれ
		else if(url.indexOf("?pzpr=")>=0){
			pzl.qdata = url.substr(url.indexOf("?pzpr=")+6);
			pzl.type = k.URL_PZPRV3;
		}
		else{
			pzl.qdata = url.substr(url.indexOf("?problem=")+9);
			pzl.type = k.URL_KANPEN;
		}
	}
	// へやわけアプレットの場合
	else if(url.match(/www\.geocities(\.co)?\.jp\/heyawake/)){
		pzl.id = 'heyawake';
		pzl.qdata = url.substr(url.indexOf("?problem=")+9);
		pzl.type = k.URL_HEYAAPP;
	}
	// ぱずぷれアプレットの場合
	else if(url.match(/indi\.s58\.xrea\.com\/(.+)\/(sa|sc)\//)){
		pzl.id = RegExp.$1;
		pzl.qdata = url.substr(url.indexOf("?"));
		pzl.type = k.URL_PZPRAPP;
	}
	// ぱずぷれv3の場合
	else{
		var qs = url.indexOf("/", url.indexOf("?"));
		if(qs>-1){
			pzl.id = url.substring(url.indexOf("?")+1,qs);
			pzl.qdata = url.substr(qs+1);
		}
		else{
			pzl.id = url.substr(url.indexOf("?")+1);
		}
		pzl.id = pzl.id.replace(/(m\+|_edit|_test|_play)/,'');
		pzl.type = k.URL_PZPRV3;
	}
	pzl.id = pzpr.variety.toPID(pzl.id);

	return parseURLData(pzl);
}

//---------------------------------------------------------------------------
// ★ parseURLData() URLを縦横・問題部分などに分解する
//                   qdata -> [(pflag)/](cols)/(rows)/(bstr)
//---------------------------------------------------------------------------
function parseURLData(pzl){
	var inp=pzl.qdata.split("/");
	
	switch(pzl.type){
	case k.URL_KANPEN:
		pzl.pflag = '';
		if(pzl.id=="sudoku"){
			pzl.rows = pzl.cols = parseInt(inp.shift());
		}
		else{
			pzl.rows = parseInt(inp.shift());
			pzl.cols = parseInt(inp.shift());
			if(pzl.id=="kakuro"){ pzl.rows--; pzl.cols--;}
		}
		pzl.bstr = inp.join("/");
		break;

	case k.URL_HEYAAPP:
		var size = inp.shift().split("x");
		pzl.pflag = '';
		pzl.cols = parseInt(size[0]);
		pzl.rows = parseInt(size[1]);
		pzl.bstr = inp.join("/");
		break;

	default:
		if(!isNaN(parseInt(inp[0]))){ inp.unshift("");}
		pzl.pflag = inp.shift();
		pzl.cols = parseInt(inp.shift());
		pzl.rows = parseInt(inp.shift());
		pzl.bstr = inp.join("/");
		break;
	}
	return pzl;
}

//---------------------------------------------------------------------------
// ★ constructURLType() パズル種類, URL種類, qdataからURLを生成する
//---------------------------------------------------------------------------
function constructURLType(pzl){
	var str='', type=pzl.type;
	if     (type===k.URL_PZPRV3) { str = "http://%DOMAIN%/p.html?%PID%/";}
	else if(type===k.URL_PZPRV3E){ str = "http://%DOMAIN%/p.html?%PID%_edit/";}
	else if(type===k.URL_PZPRAPP){ str = "http://indi.s58.xrea.com/%PID%/sa/q.html?";}
	else if(type===k.URL_KANPEN) { str = "http://www.kanpen.net/%KID%.html?problem=";}
	else if(type===k.URL_KANPENP){ str = "http://www.kanpen.net/%KID%.html?pzpr=";}
	else if(type===k.URL_HEYAAPP){ str = "http://www.geocities.co.jp/heyawake/?problem=";}

	var domain = document.domain;
	if(!domain){ domain = "pzv.jp";}
	else if(domain == "indi.s58.xrea.com"){ domain = "indi.s58.xrea.com/pzpr/v3";}

	if(type===k.URL_PZPRAPP){
		if     (pzl.id==='pipelinkr'){ str=str.replace("%PID%","pipelink");}
		else if(pzl.id==='heyabon')  { str=str.replace("%PID%","bonsan");}
	}
	var urlbase = str.replace("%DOMAIN%", domain)
					 .replace("%PID%", pzpr.variety.toURLID(pzl.id))
					 .replace("%KID%", pzpr.variety.toKanpen(pzl.id));
	return urlbase + pzl.qdata;
}
