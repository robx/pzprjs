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
		var pzl = pzpr.parser.parseURL(url), puzzle = this.owner;

		puzzle.board.initBoardSize(pzl.cols, pzl.rows);

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

		puzzle.board.resetInfo();
	},
	encodeURL : function(type){
		var puzzle = this.owner, bd = puzzle.board;
		var pzl = new pzpr.parser.URLData('');
		
		type = type || pzl.URL_PZPRV3; /* type===pzl.URL_AUTO(0)もまとめて変換する */
		if(type===pzl.URL_KANPEN && puzzle.pid=='lits'){ type = pzl.URL_KANPENP;}

		puzzle.opemgr.disableRecord();

		this.outpflag = null;
		this.outcols = bd.qcols;
		this.outrows = bd.qrows;
		this.outbstr = '';

		switch(type){
		case pzl.URL_PZPRV3: case pzl.URL_PZPRV3E:
			this.encodePzpr(pzl.URL_PZPRV3);
			break;

		case pzl.URL_PZPRAPP: case pzl.URL_KANPENP:
			this.encodePzpr(pzl.URL_PZPRAPP);
			this.outpflag = this.outpflag || "";
			break;

		case pzl.URL_KANPEN:
			puzzle.fio.datastr = "";
			this.encodeKanpen()
			this.outbstr = puzzle.fio.datastr.replace(/\r?\n/g,"/").replace(/ /g, "_");
			puzzle.fio.datastr = "";
			break;

		case pzl.URL_HEYAAPP:
			this.encodeHeyaApp();
			break;
		}

		puzzle.opemgr.enableRecord();

		pzl.id    = puzzle.pid;
		pzl.type  = type;
		pzl.pflag = this.outpflag;
		pzl.cols  = this.outcols;
		pzl.rows  = this.outrows;
		pzl.bstr  = this.outbstr;

		return pzl.generate();
	},

	// オーバーライド用
	decodePzpr : function(type){ },
	encodePzpr : function(type){ },
	decodeKanpen : function(){ },
	encodeKanpen : function(){ },
	decodeHeyaApp : function(){ },
	encodeHeyaApp : function(){ }
}
});
