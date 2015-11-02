// Encode.js v3.4.1

//---------------------------------------------------------------------------
// ★Encodeクラス URLのエンコード/デコードを扱う
//---------------------------------------------------------------------------
// URLエンコード/デコード
// Encodeクラス
pzpr.classmgr.makeCommon({
//---------------------------------------------------------
Encode:{
	pflag    : "",
	outpflag : '',
	outcols  : null,
	outrows  : null,
	outbstr  : '',

	//---------------------------------------------------------------------------
	// enc.checkpflag()   pflagに指定した文字列が含まれているか調べる
	//---------------------------------------------------------------------------
	checkpflag : function(ca){ return (this.pflag.indexOf(ca)>=0);},

	//---------------------------------------------------------------------------
	// enc.decodeURL()   parseURL()を行い、各種各パズルのdecode関数を呼び出す
	// enc.encodeURL()   各種各パズルのencode関数を呼び出し、URLを出力する
	// 
	// enc.decodePzpr()  各パズルのURL入力用(オーバーライド用)
	// enc.encodePzpr()  各パズルのURL出力用(オーバーライド用)
	//---------------------------------------------------------------------------
	decodeURL : function(url){
		var pzl = pzpr.parser.parseURL(url), puzzle = this.puzzle, bd = puzzle.board;

		bd.initBoardSize(pzl.cols, pzl.rows);

		if(!!pzl.bstr){
			this.pflag = pzl.pflag;
			this.outbstr = pzl.bstr;
			switch(pzl.type){
			case pzl.URL_PZPRV3: case pzl.URL_PZPRAPP: case pzl.URL_PZPRV3E:
				this.decodePzpr(pzl.type);
				break;
			case pzl.URL_KANPEN:
				puzzle.fio.lineseek = 0;
				puzzle.fio.dataarray = this.outbstr.replace(/_/g, " ").split("/");
				this.decodeKanpen();
				break;
			case pzl.URL_HEYAAPP:
				this.decodeHeyaApp();
				break;
			}
		}

		bd.rebuildInfo();

		puzzle.execListener('openurl', pzl.url);
	},
	encodeURL : function(type){
		var puzzle = this.puzzle, pid = puzzle.pid, fileio = puzzle.fio, bd = puzzle.board;
		var pzl = new pzpr.parser.URLData('');
		
		type = type || pzl.URL_PZPRV3; /* type===pzl.URL_AUTO(0)もまとめて変換する */
		if(type===pzl.URL_KANPEN && pid==='lits'){ type = pzl.URL_KANPENP;}

		this.outpflag = null;
		this.outcols = bd.qcols;
		this.outrows = bd.qrows;
		this.outbstr = '';

		switch(type){
		case pzl.URL_PZPRV3: case pzl.URL_PZPRV3E:
			this.encodePzpr(pzl.URL_PZPRV3);
			break;

		case pzl.URL_KANPENP:
			var ispencilbox = pzpr.variety.info[pid].exists.pencilbox;
			if(!ispencilbox){ throw "no Implemention";}
			/* falls through */
		case pzl.URL_PZPRAPP:
			this.encodePzpr(pzl.URL_PZPRAPP);
			this.outpflag = this.outpflag || "";
			break;

		case pzl.URL_KANPEN:
			fileio.datastr = "";
			this.encodeKanpen();
			this.outbstr = fileio.datastr.replace(/\r?\n/g,"/").replace(/ /g, "_");
			fileio.datastr = "";
			break;

		case pzl.URL_HEYAAPP:
			this.encodeHeyaApp();
			break;

		default:
			throw "no Implemention";
		}

		pzl.id    = pid;
		pzl.type  = type;
		pzl.pflag = this.outpflag;
		pzl.cols  = this.outcols;
		pzl.rows  = this.outrows;
		pzl.bstr  = this.outbstr;

		return pzl.generate();
	},

	// オーバーライド用
	decodePzpr : function(type){ throw "no Implemention";},
	encodePzpr : function(type){ throw "no Implemention";},
	decodeKanpen : function(){ throw "no Implemention";},
	encodeKanpen : function(){ throw "no Implemention";},
	decodeHeyaApp : function(){ throw "no Implemention";},
	encodeHeyaApp : function(){ throw "no Implemention";}
}
});
