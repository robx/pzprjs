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
	xmldoc    : null,
	datastr   : "",
	currentType : 0,

	//---------------------------------------------------------------------------
	// fio.filedecode()  ファイルデータ(文字列)からのデコード実行関数
	//---------------------------------------------------------------------------
	filedecode : function(datastr){
		var puzzle = this.puzzle, bd = puzzle.board, pzl = pzpr.parser.parseFile(datastr, puzzle.pid);
		var filetype = this.currentType = pzl.type;

		bd.initBoardSize(pzl.cols, pzl.rows);

		this.filever = pzl.filever;
		if(filetype!==pzl.FILE_PBOX_XML){
			this.lineseek = 0;
			this.dataarray = pzl.body.split("\n");
		}
		else{
			this.xmldoc = pzl.body;
		}

		// メイン処理
		if     (filetype===pzl.FILE_PZPR)    { this.decodeData();}
		else if(filetype===pzl.FILE_PBOX)    { this.kanpenOpen();}
		else if(filetype===pzl.FILE_PBOX_XML){ this.kanpenOpenXML();}

		puzzle.metadata.update(pzl.metadata);
		if(pzl.history && (filetype===pzl.FILE_PZPR)){
			puzzle.opemgr.decodeHistory(pzl.history);
		}

		bd.rebuildInfo();

		this.dataarray = null;
	},
	//---------------------------------------------------------------------------
	// fio.fileencode() ファイルデータ(文字列)へのエンコード実行関数
	//---------------------------------------------------------------------------
	fileencode : function(filetype, option){
		var puzzle = this.puzzle, bd = puzzle.board;
		var pzl = new pzpr.parser.FileData('', puzzle.pid);
		
		this.currentType = filetype = filetype || pzl.FILE_PZPR; /* type===pzl.FILE_AUTO(0)もまとめて変換する */
		option = option || {};

		this.filever = 0;
		this.datastr = "";
		if(filetype===pzl.FILE_PBOX_XML){
			this.xmldoc = (new DOMParser()).parseFromString('<?xml version="1.0" encoding="utf-8" ?><puzzle />', 'text/xml');
			var puzzlenode = this.xmldoc.querySelector('puzzle');
			puzzlenode.appendChild(this.createXMLNode('board'));
			puzzlenode.appendChild(this.createXMLNode('answer'));
		}

		// メイン処理
		if     (filetype===pzl.FILE_PZPR)    { this.encodeData();}
		else if(filetype===pzl.FILE_PBOX)    { this.kanpenSave();}
		else if(filetype===pzl.FILE_PBOX_XML){ this.kanpenSaveXML();}
		else{ throw "no Implemention";}

		pzl.type  = filetype;
		pzl.filever = this.filever;
		pzl.cols  = bd.cols;
		pzl.rows  = bd.rows;
		if(filetype!==pzl.FILE_PBOX_XML){
			pzl.body = this.datastr;
		}
		else{
			pzl.body = this.xmldoc;
		}
		pzl.metadata.update(puzzle.metadata);
		if(option.history && (filetype===pzl.FILE_PZPR)){
			pzl.history = puzzle.opemgr.encodeHistory();
		}

		this.datastr = "";

		return pzl.generate();
	},

	// オーバーライド用
	decodeData : function(){ throw "no Implemention";},
	encodeData : function(){ throw "no Implemention";},
	kanpenOpen : function(){ throw "no Implemention";},
	kanpenSave : function(){ throw "no Implemention";},
	kanpenOpenXML : function(){ throw "no Implemention";},
	kanpenSaveXML : function(){ throw "no Implemention";},

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
				if(array1[c]!==""){ array2.push(array1[c]);}
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
			func(this.board.getObjectPos(group, bx, by), item[i]);

			bx+=step;
			if(bx>endbx){ bx=startbx; by+=step;}
			if(by>endby){ break;}
		}
	},
	decodeCell   : function(func){
		this.decodeObj(func, 'cell', 1, 1, 2*this.board.cols-1, 2*this.board.rows-1);
	},
	decodeCross  : function(func){
		this.decodeObj(func, 'cross', 0, 0, 2*this.board.cols,   2*this.board.rows  );
	},
	decodeBorder : function(func){
		var puzzle = this.puzzle, bd = puzzle.board;
		if(bd.hasborder===1 || puzzle.pid==='bosanowa' || (puzzle.pid==='fourcells' && this.filever===0)){
			this.decodeObj(func, 'border', 2, 1, 2*bd.cols-2, 2*bd.rows-1);
			this.decodeObj(func, 'border', 1, 2, 2*bd.cols-1, 2*bd.rows-2);
		}
		else if(bd.hasborder===2){
			if(this.currentType===pzpr.parser.FILE_PZPR){
				this.decodeObj(func, 'border', 0, 1, 2*bd.cols  , 2*bd.rows-1);
				this.decodeObj(func, 'border', 1, 0, 2*bd.cols-1, 2*bd.rows  );
			}
			// pencilboxでは、outsideborderの時はぱずぷれとは順番が逆になってます
			else if(this.currentType===pzpr.parser.FILE_PBOX){
				this.decodeObj(func, 'border', 1, 0, 2*bd.cols-1, 2*bd.rows  );
				this.decodeObj(func, 'border', 0, 1, 2*bd.cols  , 2*bd.rows-1);
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
				this.datastr += func(this.board.getObjectPos(group, bx, by));
			}
			this.datastr += "\n";
		}
	},
	encodeCell   : function(func){
		this.encodeObj(func, 'cell', 1, 1, 2*this.board.cols-1, 2*this.board.rows-1);
	},
	encodeCross  : function(func){
		this.encodeObj(func, 'cross', 0, 0, 2*this.board.cols,   2*this.board.rows  );
	},
	encodeBorder : function(func){
		var puzzle = this.puzzle, bd = puzzle.board;
		if(bd.hasborder===1 || puzzle.pid==='bosanowa'){
			this.encodeObj(func, 'border', 2, 1, 2*bd.cols-2, 2*bd.rows-1);
			this.encodeObj(func, 'border', 1, 2, 2*bd.cols-1, 2*bd.rows-2);
		}
		else if(bd.hasborder===2){
			if(this.currentType===pzpr.parser.FILE_PZPR){
				this.encodeObj(func, 'border', 0, 1, 2*bd.cols  , 2*bd.rows-1);
				this.encodeObj(func, 'border', 1, 0, 2*bd.cols-1, 2*bd.rows  );
			}
			// pencilboxでは、outsideborderの時はぱずぷれとは順番が逆になってます
			else if(this.currentType===pzpr.parser.FILE_PBOX){
				this.encodeObj(func, 'border', 1, 0, 2*bd.cols-1, 2*bd.rows  );
				this.encodeObj(func, 'border', 0, 1, 2*bd.cols  , 2*bd.rows-1);
			}
		}
	},

	//---------------------------------------------------------------------------
	// fio.decodeCellXMLBoard()  配列で、個別文字列から個別セルの設定を行う (XML board用)
	// fio.decodeCellXMLBrow()   配列で、個別文字列から個別セルの設定を行う (XML board用)
	// fio.decodeCellXMLArow()   配列で、個別文字列から個別セルの設定を行う (XML answer用)
	// fio.encodeCellXMLBoard()  個別セルデータから個別文字列の設定を行う (XML board用)
	// fio.encodeCellXMLBrow()   個別セルデータから個別文字列の設定を行う (XML board用)
	// fio.encodeCellXMLArow()   個別セルデータから個別文字列の設定を行う (XML answer用)
	// fio.createXMLNode()  指定されたattributeを持つXMLのノードを作成する
	//---------------------------------------------------------------------------
	decodeCellXMLBoard : function(func){
		var nodes = this.xmldoc.querySelectorAll('board number');
		for(var i=0;i<nodes.length;i++){
			var node = nodes[i];
			var cell = this.board.getc(+node.getAttribute('c')*2-1, +node.getAttribute('r')*2-1);
			if(!cell.isnull){ func(cell, +node.getAttribute('n'));}
		}
	},
	encodeCellXMLBoard : function(func){
		var boardnode = this.xmldoc.querySelector('board');
		var bd = this.board;
		for(var i=0;i<bd.cell.length;i++){
			var cell = bd.cell[i], val = func(cell);
			if(val!==null){
				boardnode.appendChild(this.createXMLNode('number',{r:((cell.by/2)|0)+1,c:((cell.bx/2)|0)+1,n:val}));
			}
		}
	},
	
	PBOX_ADJUST : 0,
	decodeCellXMLBrow : function(func){ this.decodeCellXMLrow_com(func, 'board', 'brow');},
	encodeCellXMLBrow : function(func){ this.encodeCellXMLrow_com(func, 'board', 'brow');},
	decodeCellXMLArow : function(func){ this.decodeCellXMLrow_com(func, 'answer', 'arow');},
	encodeCellXMLArow : function(func){ this.encodeCellXMLrow_com(func, 'answer', 'arow');},
	decodeCellXMLrow_com : function(func, parentnodename, targetnodename){
		var rownodes = this.xmldoc.querySelectorAll(parentnodename+' '+targetnodename);
		var ADJ = this.PBOX_ADJUST;
		for(var b=0;b<rownodes.length;b++){
			var bx=1-ADJ, by = (+rownodes[b].getAttribute('row'))*2-1-ADJ;
			var nodes = rownodes[b].childNodes;
			for(var i=0;i<nodes.length;i++){
				if(nodes[i].nodeType!==1){ continue;}
				var name = nodes[i].nodeName, n = nodes[i].getAttribute('n') || 1;
				if     (name==='z'){ name = 'n0';}
				else if(name==='n'){ name = 'n'+(+nodes[i].getAttribute('v'));}
				for(var j=0;j<n;j++){
					func(this.board.getobj(bx,by), name);
					bx+=2;
				}
			}
		}
	},
	encodeCellXMLrow_com : function(func, parentnodename, targetnodename){
		var boardnode = this.xmldoc.querySelector(parentnodename);
		var ADJ = this.PBOX_ADJUST;
		var bd = this.board;
		for(var by=1-ADJ;by<=bd.maxby;by+=2){
			var rownode = this.createXMLNode(targetnodename,{row:(((by+ADJ)/2)|0)+1});
			for(var bx=1-ADJ;bx<=bd.maxbx;bx+=2){
				var piece = bd.getobj(bx,by), nodename = func(piece), node;
				if(nodename.match(/n(\d\d+)/) || nodename.match(/n(\-\d+)/)){
					node = this.createXMLNode('n', {v:RegExp.$1});
				}
				else if(nodename==='n0'){ node = this.createXMLNode('z');}
				else{ node = this.createXMLNode(nodename);}
				rownode.appendChild(node);
			}
			boardnode.appendChild(rownode);
		}
	},

	createXMLNode : function(name, attrs){
		var node = this.xmldoc.createElement(name);
		if(!!attrs){ for(var i in attrs){ node.setAttribute(i, attrs[i]);} }
		return node;
	}
}
});
