// FileData.js v3.4.0

pzpr.addConsts({
	// 定数(ファイル形式)
	FILE_AUTO : 0,
	FILE_PZPR : 1,
	FILE_PBOX : 2,
	FILE_PZPH : 3
});

//---------------------------------------------------------------------------
// ★FileIOクラス ファイルのデータ形式エンコード/デコードを扱う
//---------------------------------------------------------------------------
pzpr.createPuzzleClass('FileIO',
{
	filever   : 0,
	lineseek  : 0,
	dataarray : null,
	datastr   : "",
	currentType : k.FILE_PZPR,

	//---------------------------------------------------------------------------
	// fio.filedecode()  ファイルデータ(文字列)からのデコード実行関数
	//---------------------------------------------------------------------------
	filedecode : function(datastr){
		var o = this.owner;

		this.filever = 0;
		this.lineseek = 0;
		this.dataarray = datastr.split("\n");

		// ヘッダの処理
		if(this.readLine().match(/pzprv3\.?(\d+)?/)){
			if(RegExp.$1){ this.filever = parseInt(RegExp.$1);}
			if(this.readLine()!==this.owner.pid){ ;} /* パズルIDが入っている */
			this.currentType = k.FILE_PZPR;
		}
		else{
			this.lineseek = 0;
			this.currentType = k.FILE_PBOX;
		}

		// サイズを表す文字列
		var row, col;
		if(o.pid!=="sudoku"){
			row = parseInt(this.readLine(), 10);
			col = parseInt(this.readLine(), 10);
			if(this.currentType===k.FILE_PBOX && o.pid==="kakuro"){ row--; col--;}
		}
		else{
			row = col = parseInt(this.readLine(), 10);
		}
		if(row<=0 || col<=0){ return '';}
		this.owner.board.initBoardSize(col, row); // 盤面を指定されたサイズで初期化

		// メイン処理
		if     (this.currentType===k.FILE_PZPR){ this.decodeData();}
		else if(this.currentType===k.FILE_PBOX){ this.kanpenOpen();}

		o.opemgr.decodeLines();

		o.board.resetInfo();

		this.dataarray = null;

		return '';
	},
	//---------------------------------------------------------------------------
	// fio.fileencode() ファイルデータ(文字列)へのエンコード実行関数
	//---------------------------------------------------------------------------
	fileencode : function(type){
		if(isNaN(type) || type===k.FILE_AUTO){ type=k.FILE_PZPR;}

		this.filever = 0;
		this.sizestr = "";
		this.datastr = "";
		this.currentType = type;
		if(this.currentType===k.FILE_PZPH){ this.currentType = k.FILE_PZPR;}

		// メイン処理
		var o = this.owner;
		o.opemgr.disableRecord();
		if     (this.currentType===k.FILE_PZPR){ this.encodeData();}
		else if(this.currentType===k.FILE_PBOX){ this.kanpenSave();}
		o.opemgr.enableRecord();

		// サイズを表す文字列
		if(!this.sizestr){ this.sizestr = [o.board.qrows, o.board.qcols].join("\n");}
		this.datastr = [this.sizestr, this.datastr].join("\n");

		// ヘッダの処理
		if(this.currentType===k.FILE_PZPR){
			var header = (this.filever===0 ? "pzprv3" : ("pzprv3."+this.filever));
			this.datastr = [header, o.pid, this.datastr].join("\n");
		}
		var bstr = this.datastr;

		// 末尾の履歴情報追加処理
		if(type===k.FILE_PZPH){ bstr += o.opemgr.toString();}

		return bstr;
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
		this.decodeObj(func, k.CELL, 1, 1, 2*this.owner.board.qcols-1, 2*this.owner.board.qrows-1);
	},
	decodeCross  : function(func){
		this.decodeObj(func, k.CROSS, 0, 0, 2*this.owner.board.qcols,   2*this.owner.board.qrows  );
	},
	decodeBorder : function(func){
		var o = this.owner, bd = o.board;
		if(bd.hasborder===1 || o.pid==='bosanowa' || (o.pid==='fourcells' && this.filever===0)){
			this.decodeObj(func, k.BORDER, 2, 1, 2*bd.qcols-2, 2*bd.qrows-1);
			this.decodeObj(func, k.BORDER, 1, 2, 2*bd.qcols-1, 2*bd.qrows-2);
		}
		else if(bd.hasborder===2){
			if(this.currentType===k.FILE_PZPR){
				this.decodeObj(func, k.BORDER, 0, 1, 2*bd.qcols  , 2*bd.qrows-1);
				this.decodeObj(func, k.BORDER, 1, 0, 2*bd.qcols-1, 2*bd.qrows  );
			}
			// pencilboxでは、outsideborderの時はぱずぷれとは順番が逆になってます
			else if(this.currentType===k.FILE_PBOX){
				this.decodeObj(func, k.BORDER, 1, 0, 2*bd.qcols-1, 2*bd.qrows  );
				this.decodeObj(func, k.BORDER, 0, 1, 2*bd.qcols  , 2*bd.qrows-1);
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
		this.encodeObj(func, k.CELL, 1, 1, 2*this.owner.board.qcols-1, 2*this.owner.board.qrows-1);
	},
	encodeCross  : function(func){
		this.encodeObj(func, k.CROSS, 0, 0, 2*this.owner.board.qcols,   2*this.owner.board.qrows  );
	},
	encodeBorder : function(func){
		var o = this.owner, bd = o.board;
		if(bd.hasborder===1 || o.pid==='bosanowa'){
			this.encodeObj(func, k.BORDER, 2, 1, 2*bd.qcols-2, 2*bd.qrows-1);
			this.encodeObj(func, k.BORDER, 1, 2, 2*bd.qcols-1, 2*bd.qrows-2);
		}
		else if(bd.hasborder===2){
			if(this.currentType===k.FILE_PZPR){
				this.encodeObj(func, k.BORDER, 0, 1, 2*bd.qcols  , 2*bd.qrows-1);
				this.encodeObj(func, k.BORDER, 1, 0, 2*bd.qcols-1, 2*bd.qrows  );
			}
			// pencilboxでは、outsideborderの時はぱずぷれとは順番が逆になってます
			else if(this.currentType===k.FILE_PBOX){
				this.encodeObj(func, k.BORDER, 1, 0, 2*bd.qcols-1, 2*bd.qrows  );
				this.encodeObj(func, k.BORDER, 0, 1, 2*bd.qcols  , 2*bd.qrows-1);
			}
		}
	}
});
