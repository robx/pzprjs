// Encode.js v3.4.0

//---------------------------------------------------------------------------
// ★Encodeクラス URLのエンコード/デコードを扱う
//---------------------------------------------------------------------------
// URLエンコード/デコード
// Encodeクラス
pzpr.createPuzzleClass('Encode',
{
	pflag    : "",
	outpflag : '',
	outsize  : '',
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
		var pzl = pzpr.url.parseURL(url), o = this.owner;

		o.board.initBoardSize(pzl.cols, pzl.rows);

		if(!!pzl.bstr){
			this.pflag = pzl.pflag;
			switch(pzl.type){
			case k.URL_PZPRV3: case k.URL_PZPRAPP: case k.URL_PZPRV3E:
				this.outbstr = pzl.bstr;
				this.decodePzpr(pzl.type);
				break;
			case k.URL_KANPEN:
				o.fio.lineseek = 0;
				o.fio.dataarray = pzl.bstr.replace(/_/g, " ").split("/");
				this.decodeKanpen();
				break;
			case k.URL_HEYAAPP:
				this.outbstr = pzl.bstr;
				this.decodeHeyaApp();
				break;
			}
		}

		o.board.resetInfo();
	},
	encodeURL : function(type){
		var o = this.owner;
		var size='', ispflag=false, col = o.board.qcols, row = o.board.qrows;
		
		if(isNaN(type) || type===k.URL_AUTO){ type=k.URL_PZPRV3;}
		if(type===k.URL_KANPEN && o.pid=='lits'){ type = k.URL_KANPENP;}

		o.opemgr.disableRecord();

		this.outpflag = '';
		this.outsize = '';
		this.outbstr = '';

		switch(type){
		case k.URL_PZPRV3: case k.URL_PZPRV3E:
			this.encodePzpr(k.URL_PZPRV3);
			size = (!this.outsize ? [col,row].join('/') : this.outsize);
			ispflag = (!!this.outpflag);
			break;

		case k.URL_PZPRAPP: case k.URL_KANPENP:
			this.encodePzpr(k.URL_PZPRAPP);
			size = (!this.outsize ? [col,row].join('/') : this.outsize);
			ispflag = true;
			break;

		case k.URL_KANPEN:
			o.fio.datastr = "";
			this.encodeKanpen()
			this.outbstr = o.fio.datastr.replace(/\r?\n/g,"/").replace(/ /g, "_");
			size = (!this.outsize ? [row,col].join('/') : this.outsize);
			break;

		case k.URL_HEYAAPP:
			this.encodeHeyaApp();
			size = [col,row].join('x');
			break;

		default:
			return '';
		}

		o.opemgr.enableRecord();

		var pdata = (ispflag?[this.outpflag]:[]).concat([size, this.outbstr]).join("/");
		return pzpr.url.constructURL({id:o.pid, type:type, qdata:pdata});
	},

	// オーバーライド用
	decodePzpr : function(type){ },
	encodePzpr : function(type){ },
	decodeKanpen : function(){ },
	encodeKanpen : function(){ },
	decodeHeyaApp : function(){ },
	encodeHeyaApp : function(){ }
});
