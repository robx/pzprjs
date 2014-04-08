// FileData.js v3.4.1

//---------------------------------------------------------------------------
// ★FileIOクラス ファイルのデータ形式エンコード/デコードを扱う
//---------------------------------------------------------------------------
pzpr.classmgr.makeCommon({
//---------------------------------------------------------
FileIO:{
	filever   : 0,
	lineseek  : 0,
	dataarray : null,
	datastr   : "",
	currentType : 0,

	//---------------------------------------------------------------------------
	// fio.filedecode()  ファイルデータ(文字列)からのデコード実行関数
	//---------------------------------------------------------------------------
	filedecode : function(datastr){
		var puzzle = this.owner, pzl = pzpr.parser.parseFile(datastr, puzzle.pid);

		puzzle.board.initBoardSize(pzl.cols, pzl.rows);

		this.filever = pzl.filever;
		this.lineseek = 0;
		this.dataarray = pzl.bstr.split("\n");
		this.currentType = pzl.type;

		// メイン処理
		if     (this.currentType===pzl.FILE_PZPR){ this.decodeData();}
		else if(this.currentType===pzl.FILE_PBOX){ this.kanpenOpen();}

		puzzle.opemgr.decodeLines();

		puzzle.board.resetInfo();

		this.dataarray = null;

		return '';
	},
	//---------------------------------------------------------------------------
	// fio.fileencode() ファイルデータ(文字列)へのエンコード実行関数
	//---------------------------------------------------------------------------
	fileencode : function(type){
		var puzzle = this.owner, bd = puzzle.board;
		var pzl = new pzpr.parser.FileData('', puzzle.pid);
		
		type = type || pzl.FILE_PZPR; /* type===pzl.FILE_AUTO(0)もまとめて変換する */

		this.filever = 0;
		this.datastr = "";
		this.currentType = type;
		if(this.currentType===pzl.FILE_PZPH){ this.currentType = pzl.FILE_PZPR;}

		// メイン処理
		puzzle.opemgr.disableRecord();
		
		if     (this.currentType===pzl.FILE_PZPR){ this.encodeData();}
		else if(this.currentType===pzl.FILE_PBOX){ this.kanpenSave();}
		
		if(type===pzl.FILE_PZPH){ this.datastr += puzzle.opemgr.toString();}
		
		puzzle.opemgr.enableRecord();

		pzl.type  = this.currentType;
		pzl.filever = this.filever;
		pzl.cols  = bd.qcols;
		pzl.rows  = bd.qrows;
		pzl.bstr  = this.datastr;

		this.datastr = "";

		return pzl.generate();
	},

	//---------------------------------------------------------------------------
	// fio.readLine()    ファイルに書かれている1行の文字列を返す
	// fio.readLines()   ファイルに書かれている複数行の文字列を返す
	// fio.getItemList() ファイルに書かれている改行＋スペース区切りの
	//                   複数行の文字列を配列にして返す
	//---------------------------------------------------------------------------
	readLine : function(){
		this.lineseek++;
		return this.dataarray[this.lineseek-1];
	},
	readLines : function(rows){
		this.lineseek += rows;
		return this.dataarray.slice(this.lineseek-rows, this.lineseek);
	},

	getItemList : function(rows){
		var item = [];
		var array = this.readLines(rows);
		for(var i=0;i<array.length;i++){
			var array1 = array[i].split(" ");
			var array2 = [];
			for(var c=0;c<array1.length;c++){
				if(array1[c]!=""){ array2.push(array1[c]);}
			}
			item = item.concat(array2);
		}
		return item;
	},

	//---------------------------------------------------------------------------
	// fio.decodeObj()     配列で、個別文字列から個別セルなどの設定を行う
	// fio.decodeCell()    配列で、個別文字列から個別セルの設定を行う
	// fio.decodeCross()   配列で、個別文字列から個別Crossの設定を行う
	// fio.decodeBorder()  配列で、個別文字列から個別Borderの設定を行う
	//---------------------------------------------------------------------------
	decodeObj : function(func, group, startbx, startby, endbx, endby){
		var bx=startbx, by=startby, step=2;
		var item=this.getItemList((endby-startby)/step+1);
		for(var i=0;i<item.length;i++){
			func(this.owner.board.getObjectPos(group, bx, by), item[i]);

			bx+=step;
			if(bx>endbx){ bx=startbx; by+=step;}
			if(by>endby){ break;}
		}
	},
	decodeCell   : function(func){
		this.decodeObj(func, 'cell', 1, 1, 2*this.owner.board.qcols-1, 2*this.owner.board.qrows-1);
	},
	decodeCross  : function(func){
		this.decodeObj(func, 'cross', 0, 0, 2*this.owner.board.qcols,   2*this.owner.board.qrows  );
	},
	decodeBorder : function(func){
		var o = this.owner, bd = o.board;
		if(bd.hasborder===1 || o.pid==='bosanowa' || (o.pid==='fourcells' && this.filever===0)){
			this.decodeObj(func, 'border', 2, 1, 2*bd.qcols-2, 2*bd.qrows-1);
			this.decodeObj(func, 'border', 1, 2, 2*bd.qcols-1, 2*bd.qrows-2);
		}
		else if(bd.hasborder===2){
			if(this.currentType===pzpr.parser.FILE_PZPR){
				this.decodeObj(func, 'border', 0, 1, 2*bd.qcols  , 2*bd.qrows-1);
				this.decodeObj(func, 'border', 1, 0, 2*bd.qcols-1, 2*bd.qrows  );
			}
			// pencilboxでは、outsideborderの時はぱずぷれとは順番が逆になってます
			else if(this.currentType===pzpr.parser.FILE_PBOX){
				this.decodeObj(func, 'border', 1, 0, 2*bd.qcols-1, 2*bd.qrows  );
				this.decodeObj(func, 'border', 0, 1, 2*bd.qcols  , 2*bd.qrows-1);
			}
		}
	},

	//---------------------------------------------------------------------------
	// fio.encodeObj()     個別セルデータ等から個別文字列の設定を行う
	// fio.encodeCell()    個別セルデータから個別文字列の設定を行う
	// fio.encodeCross()   個別Crossデータから個別文字列の設定を行う
	// fio.encodeBorder()  個別Borderデータから個別文字列の設定を行う
	//---------------------------------------------------------------------------
	encodeObj : function(func, group, startbx, startby, endbx, endby){
		var step=2;
		for(var by=startby;by<=endby;by+=step){
			for(var bx=startbx;bx<=endbx;bx+=step){
				this.datastr += func(this.owner.board.getObjectPos(group, bx, by));
			}
			this.datastr += "\n";
		}
	},
	encodeCell   : function(func){
		this.encodeObj(func, 'cell', 1, 1, 2*this.owner.board.qcols-1, 2*this.owner.board.qrows-1);
	},
	encodeCross  : function(func){
		this.encodeObj(func, 'cross', 0, 0, 2*this.owner.board.qcols,   2*this.owner.board.qrows  );
	},
	encodeBorder : function(func){
		var o = this.owner, bd = o.board;
		if(bd.hasborder===1 || o.pid==='bosanowa'){
			this.encodeObj(func, 'border', 2, 1, 2*bd.qcols-2, 2*bd.qrows-1);
			this.encodeObj(func, 'border', 1, 2, 2*bd.qcols-1, 2*bd.qrows-2);
		}
		else if(bd.hasborder===2){
			if(this.currentType===pzpr.parser.FILE_PZPR){
				this.encodeObj(func, 'border', 0, 1, 2*bd.qcols  , 2*bd.qrows-1);
				this.encodeObj(func, 'border', 1, 0, 2*bd.qcols-1, 2*bd.qrows  );
			}
			// pencilboxでは、outsideborderの時はぱずぷれとは順番が逆になってます
			else if(this.currentType===pzpr.parser.FILE_PBOX){
				this.encodeObj(func, 'border', 1, 0, 2*bd.qcols-1, 2*bd.qrows  );
				this.encodeObj(func, 'border', 0, 1, 2*bd.qcols  , 2*bd.qrows-1);
			}
		}
	}
}
});
