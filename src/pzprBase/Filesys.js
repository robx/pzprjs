// Filesys.js v3.2.4

//---------------------------------------------------------------------------
// ★FileIOクラス ファイルのデータ形式エンコード/デコードを扱う
//---------------------------------------------------------------------------
FileIO = function(){
	this.filever = 0;
	this.lineseek = 0;
	this.dataarray = [];
	this.datastr = "";

	this.db = null;
	this.dbmgr = null;
	this.DBtype = 0;
	this.DBsid  = -1;
	this.DBlist = [];
};
FileIO.prototype = {
	//---------------------------------------------------------------------------
	// fio.filedecode() ファイルを開く時、ファイルデータからのデコード実行関数
	//                  [menu.ex.fileopen] -> [fileio.xcg@iframe] -> [ここ]
	//---------------------------------------------------------------------------
	filedecode : function(datastr, type){
		this.filever = 0;
		this.lineseek = 0;
		this.dataarray = datastr.split("/");

		// ヘッダの処理
		if(type===1){
			if(!this.readLine().match(/pzprv3\.?(\d+)?/)){ alert('ぱずぷれv3形式のファイルではありません。'); return;}
			if(RegExp.$1){ this.filever = parseInt(RegExp.$1);}

			if(this.readLine()!=k.puzzleid){ alert(base.getPuzzleName()+'のファイルではありません。'); return;}
		}

		// サイズを表す文字列
		var row, col;
		if(k.puzzleid!=="sudoku"){
			row = parseInt(this.readLine(), 10);
			col = parseInt(this.readLine(), 10);
			if(type===2 && k.puzzleid==="kakuro"){ row--; col--;}
		}
		else{
			row = col = parseInt(this.readLine(), 10);
		}
		if(row<=0 || col<=0){ return;}
		bd.initBoardSize(col, row); // 盤面を指定されたサイズで初期化

		// メイン処理
		um.disableRecord(); um.disableInfo();
		if     (type===1){ this.decodeData();}
		else if(type===2){ this.kanpenOpen();}
		um.enableRecord(); um.enableInfo();

		this.dataarray = null; // 重くなりそうなので初期化

		base.resetInfo(true);
		base.resize_canvas();
	},
	//---------------------------------------------------------------------------
	// fio.fileencode() ファイル文字列へのエンコード、ファイル保存実行関数
	//                  [[menu.ex.filesave] -> [ここ]] -> [fileio.xcg@iframe]
	//---------------------------------------------------------------------------
	fileencode : function(type){
		this.filever = 0;
		this.sizestr = "";
		this.datastr = "";

		// メイン処理
		if     (type===1){ this.encodeData();}
		else if(type===2){ this.kanpenSave();}

		// サイズを表す文字列
		if(!this.sizestr){ this.sizestr = [k.qrows, k.qcols].join("/");}
		this.datastr = [this.sizestr, this.datastr].join("/");

		// ヘッダの処理
		if(type===1){
			var header = (this.filever===0 ? "pzprv3" : ("pzprv3."+this.filever));
			this.datastr = [header, k.puzzleid, this.datastr].join("/");
		}

		// 末尾のURL追加処理
		if(type===1){
			this.datastr += "//" +enc.pzloutput((!k.isKanpenExist || k.puzzleid==="lits") ? 0 : 2);
		}

		return this.datastr;
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
	// fio.decodeBorder()  配列で、個別文字列から個別Border(外枠上なし)の設定を行う
	// fio.decodeBorder2() 配列で、個別文字列から個別Border(外枠上あり)の設定を行う
	//---------------------------------------------------------------------------
	decodeObj : function(func, width, height, getid){
		var item = this.getItemList(height);
		for(var i=0;i<item.length;i++){ func(getid(i%width,mf(i/width)), item[i]);}
	},
	decodeCell   : function(func){
		this.decodeObj(func, k.qcols  , k.qrows  , function(cx,cy){return bd.cnum(cx,cy);});
	},
	decodeCross  : function(func){
		this.decodeObj(func, k.qcols+1, k.qrows+1, function(cx,cy){return bd.xnum(cx,cy);});
	},
	decodeBorder : function(func){
		this.decodeObj(func, k.qcols-1, k.qrows  , function(cx,cy){return bd.bnum(2*cx+2,2*cy+1);});
		this.decodeObj(func, k.qcols  , k.qrows-1, function(cx,cy){return bd.bnum(2*cx+1,2*cy+2);});
	},
	decodeBorder2: function(func){
		this.decodeObj(func, k.qcols+1, k.qrows  , function(cx,cy){return bd.bnum(2*cx  ,2*cy+1);});
		this.decodeObj(func, k.qcols  , k.qrows+1, function(cx,cy){return bd.bnum(2*cx+1,2*cy  );});
	},

	//---------------------------------------------------------------------------
	// fio.encodeObj()     個別セルデータ等から個別文字列の設定を行う
	// fio.encodeCell()    個別セルデータから個別文字列の設定を行う
	// fio.encodeCross()   個別Crossデータから個別文字列の設定を行う
	// fio.encodeBorder()  個別Borderデータ(外枠上なし)から個別文字列の設定を行う
	// fio.encodeBorder2() 個別Borderデータ(外枠上あり)から個別文字列の設定を行う
	//---------------------------------------------------------------------------
	encodeObj : function(func, width, height, getid){
		for(var cy=0;cy<height;cy++){
			for(var cx=0;cx<width;cx++){
				this.datastr += func(getid(cx,cy));
			}
			this.datastr += "/";
		}
	},
	encodeCell   : function(func){
		this.encodeObj(func, k.qcols  , k.qrows  , function(cx,cy){return bd.cnum(cx,cy);});
	},
	encodeCross  : function(func){
		this.encodeObj(func, k.qcols+1, k.qrows+1, function(cx,cy){return bd.xnum(cx,cy);});
	},
	encodeBorder : function(func){
		this.encodeObj(func, k.qcols-1, k.qrows  , function(cx,cy){return bd.bnum(2*cx+2,2*cy+1);})
		this.encodeObj(func, k.qcols  , k.qrows-1, function(cx,cy){return bd.bnum(2*cx+1,2*cy+2);});
	},
	encodeBorder2: function(func){
		this.encodeObj(func, k.qcols+1, k.qrows  , function(cx,cy){return bd.bnum(2*cx  ,2*cy+1);})
		this.encodeObj(func, k.qcols  , k.qrows+1, function(cx,cy){return bd.bnum(2*cx+1,2*cy  );});
	},

	//---------------------------------------------------------------------------
	// fio.decodeCellQues41_42() 黒丸と白丸のデコードを行う
	// fio.encodeCellQues41_42() 黒丸と白丸のエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellQues41_42 : function(){
		this.decodeCell( function(c,ca){
			if     (ca === "-"){ bd.sQnC(c, -2);}
			else if(ca === "1"){ bd.sQuC(c, 41);}
			else if(ca === "2"){ bd.sQuC(c, 42);}
		});
	},
	encodeCellQues41_42 : function(){
		this.encodeCell( function(c){
			if     (bd.QuC(c)===41){ return "1 ";}
			else if(bd.QuC(c)===42){ return "2 ";}
			else if(bd.QnC(c)===-2){ return "- ";}
			else                   { return ". ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeCellQnum() 問題数字のデコードを行う
	// fio.encodeCellQnum() 問題数字のエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellQnum : function(){
		this.decodeCell( function(c,ca){
			if     (ca === "-"){ bd.sQnC(c, -2);}
			else if(ca !== "."){ bd.sQnC(c, parseInt(ca));}
		});
	},
	encodeCellQnum : function(){
		this.encodeCell( function(c){
			if     (bd.QnC(c)>=0)  { return (bd.QnC(c).toString() + " ");}
			else if(bd.QnC(c)===-2){ return "- ";}
			else                   { return ". ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeCellQnumb() 黒＋問題数字のデコードを行う
	// fio.encodeCellQnumb() 黒＋問題数字のエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellQnumb : function(){
		this.decodeCell( function(c,ca){
			if     (ca === "5"){ bd.sQnC(c, -2);}
			else if(ca !== "."){ bd.sQnC(c, parseInt(ca));}
		});
	},
	encodeCellQnumb : function(){
		this.encodeCell( function(c){
			if     (bd.QnC(c)>=0)  { return (bd.QnC(c).toString() + " ");}
			else if(bd.QnC(c)===-2){ return "5 ";}
			else                   { return ". ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeCellQnumAns() 問題数字＋黒マス白マスのデコードを行う
	// fio.encodeCellQnumAns() 問題数字＋黒マス白マスのエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellQnumAns : function(){
		this.decodeCell( function(c,ca){
			if     (ca === "#"){ bd.setBlack(c);}
			else if(ca === "+"){ bd.sQsC(c, 1);}
			else if(ca === "-"){ bd.sQnC(c, -2);}
			else if(ca !== "."){ bd.sQnC(c, parseInt(ca));}
		});
	},
	encodeCellQnumAns : function(){
		this.encodeCell( function(c){
			if     (bd.QnC(c)>=0) { return (bd.QnC(c).toString() + " ");}
			else if(bd.QnC(c)===-2){return "- ";}
			else if(bd.isBlack(c)){ return "# ";}
			else if(bd.QsC(c)===1){ return "+ ";}
			else                  { return ". ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeCellDirecQnum() 方向＋問題数字のデコードを行う
	// fio.encodeCellDirecQnum() 方向＋問題数字のエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellDirecQnum : function(){
		this.decodeCell( function(c,ca){
			if(ca !== "."){
				var inp = ca.split(",");
				bd.sDiC(c, (inp[0]!=="0"?parseInt(inp[0]): 0));
				bd.sQnC(c, (inp[1]!=="-"?parseInt(inp[1]):-2));
			}
		});
	},
	encodeCellDirecQnum : function(){
		this.encodeCell( function(c){
			if(bd.QnC(c)!==-1){
				var ca1 = (bd.DiC(c)!== 0?(bd.DiC(c)).toString():"0");
				var ca2 = (bd.QnC(c)!==-2?(bd.QnC(c)).toString():"-");
				return ""+ca1+","+ca2+" ";
			}
			else{ return ". ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeCellAns() 黒マス白マスのデコードを行う
	// fio.encodeCellAns() 黒マス白マスのエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellAns : function(){
		this.decodeCell( function(c,ca){
			if     (ca === "#"){ bd.setBlack(c);}
			else if(ca === "+"){ bd.sQsC(c, 1); }
		});
	},
	encodeCellAns : function(){
		this.encodeCell( function(c){
			if     (bd.isBlack(c)){ return "# ";}
			else if(bd.QsC(c)===1){ return "+ ";}
			else                  { return ". ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeCellQanssub() 回答数字と背景色のデコードを行う
	// fio.encodeCellQanssub() 回答数字と背景色のエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellQanssub : function(){
		this.decodeCell( function(c,ca){
			if     (ca === "+"){ bd.sQsC(c, 1);}
			else if(ca === "-"){ bd.sQsC(c, 2);}
			else if(ca === "="){ bd.sQsC(c, 3);}
			else if(ca === "%"){ bd.sQsC(c, 4);}
			else if(ca !== "."){ bd.sQaC(c, parseInt(ca));}
		});
	},
	encodeCellQanssub : function(){
		this.encodeCell( function(c){
			//if(bd.QuC(c)!=0 || bd.QnC(c)!=-1){ return ". ";}
			if     (bd.QaC(c)!==-1){ return (bd.QaC(c).toString() + " ");}
			else if(bd.QsC(c)===1 ){ return "+ ";}
			else if(bd.QsC(c)===2 ){ return "- ";}
			else if(bd.QsC(c)===3 ){ return "= ";}
			else if(bd.QsC(c)===4 ){ return "% ";}
			else                   { return ". ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeCellQsub() 背景色のデコードを行う
	// fio.encodeCellQsub() 背景色のエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellQsub : function(){
		this.decodeCell( function(c,ca){
			if(ca != "0"){ bd.sQsC(c, parseInt(ca));}
		});
	},
	encodeCellQsub : function(){
		this.encodeCell( function(c){
			if     (bd.QsC(c)>0){ return (bd.QsC(c).toString() + " ");}
			else                { return "0 ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeCrossNum() 交点の数字のデコードを行う
	// fio.encodeCrossNum() 交点の数字のエンコードを行う
	//---------------------------------------------------------------------------
	decodeCrossNum : function(){
		this.decodeCross( function(c,ca){
			if     (ca === "-"){ bd.sQnX(c, -2);}
			else if(ca !== "."){ bd.sQnX(c, parseInt(ca));}
		});
	},
	encodeCrossNum : function(){
		this.encodeCross( function(c){
			if     (bd.QnX(c)>=0)  { return (bd.QnX(c).toString() + " ");}
			else if(bd.QnX(c)===-2){ return "- ";}
			else                   { return ". ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeBorderQues() 問題の境界線のデコードを行う
	// fio.encodeBorderQues() 問題の境界線のエンコードを行う
	//---------------------------------------------------------------------------
	decodeBorderQues : function(){
		this.decodeBorder( function(c,ca){
			if(ca === "1"){ bd.sQuB(c, 1);}
		});
	},
	encodeBorderQues : function(){
		this.encodeBorder( function(c){
			if     (bd.QuB(c)===1){ return "1 ";}
			else                  { return "0 ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeBorderLine() Lineのデコードを行う
	// fio.encodeBorderLine() Lineのエンコードを行う
	//---------------------------------------------------------------------------
	decodeBorderLine : function(){
		var svfunc = bd.isLineNG;
		bd.isLineNG = function(id){ return false;};

		this.decodeBorder( function(c,ca){
			if     (ca === "-1"){ bd.sQsB(c, 2);}
			else if(ca !== "0" ){ bd.sLiB(c, parseInt(ca));}
		});

		bd.isLineNG = svfunc;
	},
	encodeBorderLine : function(){
		this.encodeBorder( function(c){
			if     (bd.LiB(c)>  0){ return ""+bd.LiB(c)+" ";}
			else if(bd.QsB(c)===2){ return "-1 ";}
			else                  { return "0 ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeBorderAns() 問題・回答の境界線のデコードを行う
	// fio.encodeBorderAns() 問題・回答の境界線のエンコードを行う
	//---------------------------------------------------------------------------
	decodeBorderAns : function(){
		this.decodeBorder( function(c,ca){
			if     (ca === "1" ){ bd.sQaB(c, 1);}
			else if(ca === "2" ){ bd.sQaB(c, 1); bd.sQsB(c, 1);}
			else if(ca === "-1"){ bd.sQsB(c, 1);}
		});
	},
	encodeBorderAns : function(){
		this.encodeBorder( function(c){
			if     (bd.QaB(c)===1 && bd.QsB(c)===1){ return "2 ";}
			else if(bd.QaB(c)===1){ return "1 ";}
			else if(bd.QsB(c)===1){ return "-1 ";}
			else                  { return "0 ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeBorderAns2() 問題・回答の境界線のデコード(外枠あり)を行う
	// fio.encodeBorderAns2() 問題・回答の境界線のエンコード(外枠あり)を行う
	//---------------------------------------------------------------------------
	decodeBorderAns2 : function(){
		this.decodeBorder2( function(c,ca){
			if     (ca === "1" ){ bd.sQaB(c, 1);}
			else if(ca === "2" ){ bd.sQsB(c, 1);}
			else if(ca === "3" ){ bd.sQaB(c, 1); bd.sQsB(c, 1);}
			else if(ca === "-1"){ bd.sQsB(c, 2);}
		});
	},
	encodeBorderAns2 : function(){
		this.encodeBorder2( function(c){
			if     (bd.QaB(c)===1 && bd.QsB(c)===1){ return "3 ";}
			else if(bd.QsB(c)===1){ return "2 ";}
			else if(bd.QaB(c)===1){ return "1 ";}
			else if(bd.QsB(c)===2){ return "-1 ";}
			else                  { return "0 ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeAreaRoom() 部屋のデコードを行う
	// fio.encodeAreaRoom() 部屋のエンコードを行う
	// fio.decodeAnsAreaRoom() (回答用)部屋のデコードを行う
	// fio.encodeAnsAreaRoom() (回答用)部屋のエンコードを行う
	//---------------------------------------------------------------------------
	decodeAreaRoom : function(){ this.decodeAreaRoom_com(true);},
	encodeAreaRoom : function(){ this.encodeAreaRoom_com(true);},
	decodeAnsAreaRoom : function(){ this.decodeAreaRoom_com(false);},
	encodeAnsAreaRoom : function(){ this.encodeAreaRoom_com(false);},

	decodeAreaRoom_com : function(isques){
		this.readLine();
		this.rdata2Border(isques, this.getItemList(k.qrows));

		area.resetRarea();
	},
	encodeAreaRoom_com : function(isques){
		var rinfo = area.getRoomInfo();

		this.datastr += (rinfo.max+"/");
		for(var c=0;c<bd.cellmax;c++){
			this.datastr += (""+(rinfo.id[c]-1)+" ");
			if((c+1)%k.qcols==0){ this.datastr += "/";}
		}
	},
	//---------------------------------------------------------------------------
	// fio.rdata2Border() 入力された配列から境界線を入力する
	//---------------------------------------------------------------------------
	rdata2Border : function(isques, rdata){
		var func = (isques ? bd.sQuB : bd.sQaB);
		for(var id=0;id<bd.bdmax;id++){
			var cc1 = bd.cc1(id), cc2 = bd.cc2(id);
			func.apply(bd, [id, (cc1!=-1 && cc2!=-1 && rdata[cc1]!=rdata[cc2]?1:0)]);
		}
	},
	//---------------------------------------------------------------------------
	// fio.decodeCellQnum51() [＼]のデコードを行う
	// fio.encodeCellQnum51() [＼]のエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellQnum51 : function(){
		var item = this.getItemList(k.qrows+1);
		for(var i=0;i<item.length;i++) {
			var cx=i%(k.qcols+1)-1, cy=mf(i/(k.qcols+1))-1;
			if(item[i]!="."){
				if     (cy===-1){ bd.sDiE(bd.exnum(cx,cy), parseInt(item[i]));}
				else if(cx===-1){ bd.sQnE(bd.exnum(cx,cy), parseInt(item[i]));}
				else{
					var inp = item[i].split(",");
					var c = bd.cnum(cx,cy);
					mv.set51cell(c, true);
					bd.sQnC(c, inp[0]);
					bd.sDiC(c, inp[1]);
				}
			}
		}
	},
	encodeCellQnum51 : function(){
		var str = "";
		for(var cy=-1;cy<k.qrows;cy++){
			for(var cx=-1;cx<k.qcols;cx++){
				if     (cx===-1 && cy==-1){ str += "0 ";}
				else if(cy===-1){ str += (""+bd.DiE(bd.exnum(cx,cy)).toString()+" ");}
				else if(cx===-1){ str += (""+bd.QnE(bd.exnum(cx,cy)).toString()+" ");}
				else{
					var c = bd.cnum(cx,cy);
					if(bd.QuC(c)===51){ str += (""+bd.QnC(c).toString()+","+bd.DiC(c).toString()+" ");}
					else{ str += ". ";}
				}
			}
			str += "/";
		}
		this.datastr += str;
	},
	//---------------------------------------------------------------------------
	// fio.decodeCellQnum_kanpen() カンペン用問題数字のデコードを行う
	// fio.encodeCellQnum_kanpen() カンペン用問題数字のエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellQnum_kanpen : function(){
		this.decodeCell( function(c,ca){
			if(ca != "."){ bd.sQnC(c, parseInt(ca));}
		});
	},
	encodeCellQnum_kanpen : function(){
		this.encodeCell( function(c){
			return (bd.QnC(c)>=0)?(bd.QnC(c).toString() + " "):". ";
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeCellQans_kanpen() カンペン用回答数字のデコードを行う
	// fio.encodeCellQans_kanpen() カンペン用回答数字のエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellQans_kanpen : function(){
		this.decodeCell( function(c,ca){
			if(ca!="."&&ca!="0"){ bd.sQaC(c, parseInt(ca));}
		});
	},
	encodeCellQans_kanpen : function(){
		this.encodeCell( function(c){
			if     (bd.QnC(c)!=-1){ return ". ";}
			else if(bd.QaC(c)==-1){ return "0 ";}
			else                  { return ""+bd.QaC(c).toString()+" ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeCellQnumAns_kanpen() カンペン用問題数字＋黒マス白マスのデコードを行う
	// fio.encodeCellQnumAns_kanpen() カンペン用問題数字＋黒マス白マスのエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellQnumAns_kanpen : function(){
		this.decodeCell( function(c,ca){
			if     (ca == "#"){ bd.setBlack(c);}
			else if(ca == "+"){ bd.sQsC(c, 1);}
			else if(ca != "."){ bd.sQnC(c, parseInt(ca));}
		});
	},
	encodeCellQnumAns_kanpen : function(){
		this.encodeCell( function(c){
			if     (bd.QnC(c)>=0 ){ return (bd.QnC(c).toString() + " ");}
			else if(bd.isBlack(c)){ return "# ";}
			else if(bd.QsC(c)==1 ){ return "+ ";}
			else                  { return ". ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeSquareRoom() カンペン用四角形の部屋のデコードを行う
	// fio.encodeSquareRoom() カンペン用四角形の部屋のエンコードを行う
	// fio.decodeAnsSquareRoom() (回答用)カンペン用四角形の部屋のデコードを行う
	// fio.encodeAnsSquareRoom() (回答用)カンペン用四角形の部屋のエンコードを行う
	//---------------------------------------------------------------------------
	decodeSquareRoom : function(){ this.decodeSquareRoom_com(true);},
	encodeSquareRoom : function(){ this.encodeSquareRoom_com(true);},
	decodeAnsSquareRoom : function(){ this.decodeSquareRoom_com(false);},
	encodeAnsSquareRoom : function(){ this.encodeSquareRoom_com(false);},

	decodeSquareRoom_com : function(isques){
		var rmax = parseInt(this.readLine());
		var barray = this.readLines(rmax);
		var rdata = [];
		for(var i=0;i<barray.length;i++){
			if(barray[i]==""){ break;}
			var pce = barray[i].split(" ");
			var sp = { y1:parseInt(pce[0]), x1:parseInt(pce[1]), y2:parseInt(pce[2]), x2:parseInt(pce[3]), num:pce[4]};
			if(sp.num!=""){ bd.sQnC(bd.cnum(sp.x1,sp.y1), parseInt(sp.num,10));}
			for(var cx=sp.x1;cx<=sp.x2;cx++){
				for(var cy=sp.y1;cy<=sp.y2;cy++){
					rdata[bd.cnum(cx,cy)] = i;
				}
			}
		}
		this.rdata2Border(isques, rdata);

		area.resetRarea();
	},
	encodeSquareRoom_com : function(isques){
		var rinfo = area.getRoomInfo();

		this.datastr += (rinfo.max+"/");
		for(var id=1;id<=rinfo.max;id++){
			var d = ans.getSizeOfClist(rinfo.room[id].idlist,f_true);
			var num = bd.QnC(area.getTopOfRoom(id));
			this.datastr += (""+d.y1+" "+d.x1+" "+d.y2+" "+d.x2+" "+(num>=0 ? ""+num : "")+"/");
		}
	},

//---------------------------------------------------------------------------
// ★Local Storage用データベースの設定・管理を行う
//---------------------------------------------------------------------------
	//---------------------------------------------------------------------------
	// fio.choiceDataBase() LocalStorageが使えるかどうか判定する
	//---------------------------------------------------------------------------
	choiceDataBase : function(){
		if(window.google && google.gears){ this.DBtype=1; return 1;}
		var factory = 0;

		// FireFox
		if (typeof GearsFactory != 'undefined') { factory=11;}
		else{
			try {
				// IE
				var axobj = new ActiveXObject('Gears.Factory');
				factory=21;
			} catch (e) {
				// Safari
				if((typeof navigator.mimeTypes != 'undefined') && navigator.mimeTypes["application/x-googlegears"]){
					factory=31;
				}
			}
		}
		this.DBtype=(factory>0?1:0);
		return factory;
	},

	//---------------------------------------------------------------------------
	// fio.initDataBase() データベースを新規作成する
	// fio.dropDataBase() データベースを削除する
	// fio.remakeDataBase() データベースを再構築する
	// fio.updateManager() 更新時間を更新する
	//---------------------------------------------------------------------------
	initDataBase : function(){
		if(this.DBtype===0){ return false;}
		else if(this.DBtype===1){
			this.dbmgr = google.gears.factory.create('beta.database', '1.0');
			this.dbmgr.open('pzprv3_manage');
			this.dbmgr.execute('CREATE TABLE IF NOT EXISTS manage (puzzleid primary key,version,count,lastupdate)');
			this.dbmgr.close();

//			this.remakeDataBase2();

			this.db    = google.gears.factory.create('beta.database', '1.0');
			this.db.open('pzprv3_'+k.puzzleid);
			this.db.execute('CREATE TABLE IF NOT EXISTS pzldata (id int primary key,col,row,hard,pdata,time,comment)');
			this.db.close();
		}
		else if(this.DBtype===2){
			this.dbmgr = openDataBase('pzprv3_manage', '1.0');
			this.dbmgr.transaction(function(tx){
				tx.executeSql('CREATE TABLE IF NOT EXISTS manage (puzzleid primary key,version,count,lastupdate)');
			});

			this.db = openDataBase('pzprv3_'+k.puzzleid, '1.0');
			this.db.transaction(function(tx){
				tx.executeSql('CREATE TABLE IF NOT EXISTS pzldata (id int primary key,col,row,hard,pdata,time,comment)');
			});
		}

		this.updateManager(false);

		var sortlist = { idlist:"ID順", newsave:"保存が新しい順", oldsave:"保存が古い順", size:"サイズ/難易度順"};
		var str="";
		for(s in sortlist){ str += ("<option value=\""+s+"\">"+sortlist[s]+"</option>");}
		document.database.sorts.innerHTML = str;

		return true;
	},
	dropDataBase : function(){
		if(this.DBtype===1){
			this.dbmgr.open('pzprv3_manage');
			this.dbmgr.execute('DELETE FROM manage WHERE puzzleid=?',[k.puzzleid]);
			this.dbmgr.close();

			this.db.open('pzprv3_'+k.puzzleid);
			this.db.execute('DROP TABLE IF EXISTS pzldata');
			this.db.close();
		}
		else if(this.DBtype===2){
			this.dbmgr.transaction(function(tx){
				tx.executeSql('DELETE FROM manage WHERE puzzleid=?',[k.puzzleid]);
			});

			this.db.transaction(function(tx){
				tx.executeSql('DROP TABLE IF EXISTS pzldata');
			});
		}
	},

	remakeDataBase : function(){
		this.DBlist = [];

		this.db.open('pzprv3_'+k.puzzleid);
		var rs = this.db.execute('SELECT * FROM pzldata');
		while(rs.isValidRow()){
			var src = {};
			for(var i=0;i<rs.fieldCount();i++){ src[rs.fieldName(i)] = rs.field(i);}
			this.DBlist.push(src);
			rs.next();
		}
		rs.close();

		this.db.execute('DROP TABLE IF EXISTS pzldata');
		this.db.execute('CREATE TABLE IF NOT EXISTS pzldata (id int primary key,col,row,hard,pdata,time,comment)');

		for(var r=0;r<this.DBlist.length;r++){
			var row=this.DBlist[r];
			this.db.execute('INSERT INTO pzldata VALUES(?,?,?,?,?,?,?)',[row.id,row.col,row.row,row.hard,row.pdata,row.time,row.comment]);
		}

		this.db.close();
	},

	updateManager : function(flag){
		var count = -1;
		if(this.DBtype===1){
			if(!flag){
				this.db.open('pzprv3_'+k.puzzleid);
				var rs = this.db.execute('SELECT COUNT(*) FROM pzldata');
				count = (rs.isValidRow()?rs.field(0):0);
				this.db.close();
			}
			else{ count=this.DBlist.length;}

			this.dbmgr.open('pzprv3_manage');
			this.dbmgr.execute('INSERT OR REPLACE INTO manage VALUES(?,?,?,?)',[k.puzzleid,'1.0',count,mf((new Date()).getTime()/1000)]);
			this.dbmgr.close();
		}
		else if(this.DBtype===2){
			if(!flag){
				this.db.transaction(function(tx){
					tx.executeSql('SELECT COUNT(*) FROM pzldata',function(){},function(tx,rs){ count = rs.rows[0];});
				});
			}
			else{ count=this.DBlist.length;}

			this.dbmgr.transaction(function(tx){
				tx.executeSql('INSERT OR REPLACE INTO manage VALUES(?,?,?,?)',[k.puzzleid,'1.0',count,mf((new Date()).getTime()/1000)]);
			});
		}
	},

	//---------------------------------------------------------------------------
	// fio.clickHandler()  フォーム上のボタンが押された時、各関数にジャンプする
	//---------------------------------------------------------------------------
	clickHandler : function(e){
		switch(ee.getSrcElement(e).name){
			case 'sorts'   : this.displayDataTableList(); break;
			case 'datalist': this.selectDataTable(); break;
			case 'tableup' : this.upDataTable();     break;
			case 'tabledn' : this.downDataTable();   break;
			case 'open'    : this.openDataTable();   break;
			case 'save'    : this.saveDataTable();   break;
			case 'comedit' : this.editComment();     break;
			case 'difedit' : this.editDifficult();   break;
			case 'del'     : this.deleteDataTable(); break;
		}
	},

	//---------------------------------------------------------------------------
	// fio.displayDataTableList() 保存しているデータの一覧を表示する
	// fio.ni()                   文字列で1桁なら0をつける
	// fio.getDataTableList()     保存しているデータの一覧を取得する
	//---------------------------------------------------------------------------
	displayDataTableList : function(){
		if(this.DBtype>0){
			switch(document.database.sorts.value){
				case 'idlist':  this.DBlist = this.DBlist.sort(function(a,b){ return (a.id-b.id);}); break;
				case 'newsave': this.DBlist = this.DBlist.sort(function(a,b){ return (b.time-a.time || a.id-b.id);}); break;
				case 'oldsave': this.DBlist = this.DBlist.sort(function(a,b){ return (a.time-b.time || a.id-b.id);}); break;
				case 'size':    this.DBlist = this.DBlist.sort(function(a,b){ return (a.col-b.col || a.row-b.row || a.hard-b.hard || a.id-b.id);}); break;
			}

			var html = "";
			for(var i=0;i<this.DBlist.length;i++){
				var row = this.DBlist[i];
				if(!row){ alert(i);}
				var src = ((row.id<10?"&nbsp;":"")+row.id+" :&nbsp;");
				var dt = new Date(); dt.setTime(row.time*1000);
				src += (" "+this.ni(dt.getFullYear()%100)+"/"+this.ni(dt.getMonth()+1)+"/"+this.ni(dt.getDate())+" "+this.ni(dt.getHours())+":"+this.ni(dt.getMinutes()) + "&nbsp;&nbsp;");
				src += (""+row.col+"×"+row.row+"&nbsp;&nbsp;");
				if     (menu.isLangJP()){ src += ({0:'－',1:'らくらく',2:'おてごろ',3:'たいへん',4:'アゼン'}[row.hard]);}
				else if(menu.isLangEN()){ src += ({0:'-',1:'Easy',2:'Normal',3:'Hard',4:'Expert'}[row.hard]);}
				html += ("<option value=\""+row.id+"\""+(this.DBsid==row.id?" selected":"")+">"+src+"</option>\n");
			}
			html += ("<option value=\"new\""+(this.DBsid==-1?" selected":"")+">&nbsp;&lt;新しく保存する&gt;</option>\n");
			document.database.datalist.innerHTML = html;

			this.selectDataTable();
		}
	},
	ni : function(num){ return (num<10?"0"+num:""+num);},
	getDataTableList : function(){
		this.DBlist = [];
		if(this.DBtype===1){
			this.db.open('pzprv3_'+k.puzzleid);
			var rs = this.db.execute('SELECT * FROM pzldata');
			while(rs.isValidRow()){
				var src = {};
				for(var i=0;i<rs.fieldCount();i++){ src[rs.fieldName(i)] = rs.field(i);}
				this.DBlist.push(src);
				rs.next();
			}
			rs.close();
			this.db.close();
			this.displayDataTableList();
		}
		else if(this.DBtype===2){
			var self = this;
			this.db.transaction(function(tx){
				tx.executeSql('SELECT * FROM pzldata',[],function(tx,rs){
				for(var r=0;r<rs.rows.length;r++){ self.DBlist.push(rs.rows[r]);}
				self.DBlist = rs;
				self.displayDataTableList();
			}); });
		}
	},

	//---------------------------------------------------------------------------
	// fio.upDataTable()        データの一覧での位置をひとつ上にする
	// fio.downDataTable()      データの一覧での位置をひとつ下にする
	// fio.convertDataTableID() データのIDを付け直す
	//---------------------------------------------------------------------------
	upDataTable : function(){
		var selected = this.getDataID();
		if(this.DBtype===0 || selected===-1 || selected===0){ return;}

		this.convertDataTableID(selected, selected-1);
	},
	downDataTable : function(){
		var selected = this.getDataID();
		if(this.DBtype===0 || selected===-1 || selected===this.DBlist.length-1){ return;}

		this.convertDataTableID(selected, selected+1);
	},
	convertDataTableID : function(selected,target){
		var sid = this.DBsid;
		var tid = this.DBlist[target].id;
		this.DBsid = tid;

		this.DBlist[selected].id = tid;
		this.DBlist[target].id   = sid;

		if(this.DBtype===1){
			this.db.open('pzprv3_'+k.puzzleid);
			this.db.execute('UPDATE pzldata SET id=? WHERE ID==?',[0  ,sid]);
			this.db.execute('UPDATE pzldata SET id=? WHERE ID==?',[sid,tid]);
			this.db.execute('UPDATE pzldata SET id=? WHERE ID==?',[tid,  0]);
			this.db.close();

			this.displayDataTableList();
		}
		else if(this.DBtype===2){
			var self = this;
			this.db.transaction(function(tx){
				tx.executeSql('UPDATE pzldata SET id=? WHERE ID==?',[0  ,sid]);
				tx.executeSql('UPDATE pzldata SET id=? WHERE ID==?',[sid,tid]);
				tx.executeSql('UPDATE pzldata SET id=? WHERE ID==?',[tid,  0]);
			},f_true,self.displayDataTableList);
		}

		this.updateManager(true);
	},

	//---------------------------------------------------------------------------
	// fio.getDataID()       データのIDを取得する
	// fio.selectDataTable() データを選択して、コメントなどを表示する
	//---------------------------------------------------------------------------
	getDataID : function(){
		if(document.database.datalist.value!="new" && document.database.datalist.value!=""){
			for(var i=0;i<this.DBlist.length;i++){
				if(this.DBlist[i].id===document.database.datalist.value){ return i;}
			}
		}
		return -1;
	},
	selectDataTable : function(){
		var selected = this.getDataID();
		if(selected>=0){
			document.database.comtext.value = ""+this.DBlist[selected].comment;
			this.DBsid = this.DBlist[selected].id;
		}
		else{
			document.database.comtext.value = "";
			this.DBsid = -1;
		}

		document.database.tableup.disabled = (document.database.sorts.value!=='idlist' || this.DBsid===-1 || this.DBsid===1);
		document.database.tabledn.disabled = (document.database.sorts.value!=='idlist' || this.DBsid===-1 || this.DBsid===this.DBlist.length);
		document.database.comedit.disabled = (this.DBsid===-1);
		document.database.difedit.disabled = (this.DBsid===-1);
		document.database.open.disabled    = (this.DBsid===-1);
		document.database.del.disabled     = (this.DBsid===-1);
	},

	//---------------------------------------------------------------------------
	// fio.openDataTable()   データの盤面に読み込む
	// fio.saveDataTable()   データの盤面を保存する
	//---------------------------------------------------------------------------
	openDataTable : function(){
		var id = this.getDataID();
		if(id===-1 || !confirm("このデータを読み込みますか？ (現在の盤面は破棄されます)")){ return;}

		if(this.DBtype===1){
			this.db.open('pzprv3_'+k.puzzleid);

			var id = this.getDataID();
			var rs = this.db.execute('SELECT * FROM pzldata WHERE ID==?',[this.DBlist[id].id]);
			this.filedecode(rs.field(4),1);

			rs.close();
			this.db.close();
		}
		else if(this.DBtype===2){
			var self = this;
			this.db.transaction(function(tx){
				tx.executeSql('SELECT * FROM pzldata WHERE ID==?',[self.DBlist[id].id],
					function(tx,rs){ self.filedecode(rs.rows[0].pdata,1); }
				);
			});
		}
	},
	saveDataTable : function(){
		var id = this.getDataID();
		if(this.DBtype===0 || (id!==-1 && !confirm("このデータに上書きしますか？"))){ return;}

		var time = mf((new Date()).getTime()/1000);
		var pdata = this.fileencode(1);
		var str = "";
		if(id===-1){ str = prompt("コメントがある場合は入力してください。",""); if(str==null){ str="";} }
		else       { str = this.DBlist[this.getDataID()].comment;}

		if(this.DBtype===1){
			this.db.open('pzprv3_'+k.puzzleid);
			if(id===-1){
				id = this.DBlist.length+1;
				this.db.execute('INSERT INTO pzldata VALUES(?,?,?,?,?,?,?)',[id,k.qcols,k.qrows,0,pdata,time,str]);
			}
			else{
				id = document.database.datalist.value;
				this.db.execute('INSERT OR REPLACE INTO pzldata VALUES(?,?,?,?,?,?,?)',[id,k.qcols,k.qrows,0,pdata,time,str]);
			}
			this.db.close();
			this.getDataTableList();
		}
		else if(this.DBtype===2){
			var self = this;
			if(id===-1){
				id = this.DBlist.length+1;
				this.db.transaction(function(tx){
					tx.executeSql('INSERT INTO pzldata VALUES(?,?,?,?,?,?,?)',[id,k.qcols,k.qrows,0,pdata,time,str]);
				},f_true,self.getDataTableList);
			}
			else{
				id = document.database.datalist.value;
				this.db.transaction(function(tx){
					tx.executeSql('INSERT OR REPLACE INTO pzldata VALUES(?,?,?,?,?,?,?)',[id,k.qcols,k.qrows,0,pdata,time,str]);
				},f_true,self.getDataTableList);
			}
		}

		this.updateManager(true);
	},

	//---------------------------------------------------------------------------
	// fio.editComment()   データのコメントを更新する
	// fio.editDifficult() データの難易度を更新する
	//---------------------------------------------------------------------------
	editComment : function(){
		var id = this.getDataID();
		if(this.DBtype===0 || id===-1){ return;}

		var str = prompt("この問題に対するコメントを入力してください。",this.DBlist[id].comment);
		if(str==null){ return;}

		this.DBlist[id].comment = str;

		if(this.DBtype===1){
			this.db.open('pzprv3_'+k.puzzleid);

			this.db.execute('UPDATE pzldata SET comment=? WHERE ID==?',[str,this.DBlist[id].id]);
			this.db.close();

			this.displayDataTableList();
		}
		else if(this.DBtype===2){
			var self = this;
			this.db.transaction(function(tx){
				tx.executeSql('UPDATE pzldata SET comment=? WHERE ID==?',[str,self.DBlist[id].id]);
			},f_true,self.displayDataTableList);
		}

		this.updateManager(true);
	},
	editDifficult : function(){
		var id = this.getDataID();
		if(this.DBtype===0 || id===-1){ return;}

		var hard = prompt("この問題の難易度を設定してください。\n[0:なし 1:らくらく 2:おてごろ 3:たいへん 4:アゼン]",this.DBlist[id].hard);
		if(hard==null){ return;}

		this.DBlist[id].hard = ((hard==='1'||hard==='2'||hard==='3'||hard==='4')?hard:0);

		if(this.DBtype===1){
			this.db.open('pzprv3_'+k.puzzleid);

			this.db.execute('UPDATE pzldata SET hard=? WHERE ID==?',[hard,this.DBlist[id].id]);
			this.db.close();

			this.displayDataTableList();
		}
		else if(this.DBtype===2){
			var self = this;
			this.db.transaction(function(tx){
				tx.executeSql('UPDATE pzldata SET hard=? WHERE ID==?',[hard,self.DBlist[id].id]);
			},f_true,self.displayDataTableList);
		}

		this.updateManager(true);
	},

	//---------------------------------------------------------------------------
	// fio.deleteDataTable() 選択している盤面データを削除する
	//---------------------------------------------------------------------------
	deleteDataTable : function(){
		var id = this.getDataID();
		if(this.DBtype===0 || id===-1 || !confirm("このデータを完全に削除しますか？")){ return;}

		if(this.DBtype===1){
			this.db.open('pzprv3_'+k.puzzleid);

			this.db.execute('DELETE FROM pzldata WHERE ID==?',[this.DBlist[id].id]);

			this.DBlist = this.DBlist.sort(function(a,b){ return (a.id-b.id);});
			for(var i=id+1;i<this.DBlist.length;i++){
				this.db.execute('UPDATE pzldata SET id=? WHERE ID==?',[this.DBlist[i].id-1,this.DBlist[i].id]);
				this.DBlist[i].id--;
				this.DBlist[i-1] = this.DBlist[i];
			}
			this.DBlist.splice(this.DBlist.length-1,1);

			this.db.close();
			this.displayDataTableList();
		}
		else if(this.DBtype===2){
			var self = this;
			this.db.transaction(function(tx){
				tx.executeSql('DELETE FROM pzldata WHERE ID==?',[self.DBlist[id].id]);
				self.DBlist = self.DBlist.sort(function(a,b){ return (a.id-b.id);});
				for(var i=id+1;i<self.DBlist.length;i++){
					tx.executeSql('UPDATE pzldata SET id=? WHERE ID==?',[self.DBlist[i].id-1,self.DBlist[i].id]);
					self.DBlist[i].id--;
					self.DBlist[i-1] = self.DBlist[i];
				}
				self.DBlist.splice(this.DBlist.length-1,1);
			},f_true,self.displayDataTableList);
		}

		this.updateManager(true);
	}
};
