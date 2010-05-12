// Filesys.js v3.3.1

//---------------------------------------------------------------------------
// ★FileIOクラス ファイルのデータ形式エンコード/デコードを扱う
//---------------------------------------------------------------------------
FileIO = function(){
	this.filever = 0;
	this.lineseek = 0;
	this.dataarray = [];
	this.datastr = "";
	this.urlstr = "";
	this.currentType = 1;

	// 定数(ファイル形式)
	this.PZPR = 1;
	this.PBOX = 2;

	this.dbm = new DataBaseManager();
};
FileIO.prototype = {
	//---------------------------------------------------------------------------
	// fio.filedecode() ファイルを開く時、ファイルデータからのデコード実行関数
	//                  [menu.ex.fileopen] -> [fileio.xcg@iframe] -> [ここ]
	//---------------------------------------------------------------------------
	filedecode : function(datastr){
		this.filever = 0;
		this.lineseek = 0;
		this.dataarray = datastr.split("/");

		// ヘッダの処理
		if(this.readLine().match(/pzprv3\.?(\d+)?/)){
			if(RegExp.$1){ this.filever = parseInt(RegExp.$1);}
			if(this.readLine()!=k.puzzleid){ alert(base.getPuzzleName()+'のファイルではありません。'); return;}
			this.currentType = this.PZPR;
		}
		else{
			this.lineseek = 0;
			this.currentType = this.PBOX;
		}

		// サイズを表す文字列
		var row, col;
		if(k.puzzleid!=="sudoku"){
			row = parseInt(this.readLine(), 10);
			col = parseInt(this.readLine(), 10);
			if(this.currentType===this.PBOX && k.puzzleid==="kakuro"){ row--; col--;}
		}
		else{
			row = col = parseInt(this.readLine(), 10);
		}
		if(row<=0 || col<=0){ return;}
		bd.initBoardSize(col, row); // 盤面を指定されたサイズで初期化

		// メイン処理
		base.disableInfo();
		if     (this.currentType===this.PZPR){ this.decodeData();}
		else if(this.currentType===this.PBOX){ this.kanpenOpen();}
		base.enableInfo();

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
		this.urlstr = "";
		this.currentType = type;

		// メイン処理
		if     (this.currentType===this.PZPR){ this.encodeData();}
		else if(this.currentType===this.PBOX){ this.kanpenSave();}

		// サイズを表す文字列
		if(!this.sizestr){ this.sizestr = [k.qrows, k.qcols].join("/");}
		this.datastr = [this.sizestr, this.datastr].join("/");

		// ヘッダの処理
		if(this.currentType===this.PZPR){
			var header = (this.filever===0 ? "pzprv3" : ("pzprv3."+this.filever));
			this.datastr = [header, k.puzzleid, this.datastr].join("/");
		}
		var bstr = this.datastr;

		// 末尾のURL追加処理
		if(this.currentType===this.PZPR){
			this.urlstr = enc.pzloutput((!k.isKanpenExist || k.puzzleid==="lits") ? enc.PZPRV3 : enc.KANPEN);
		}

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
	decodeObj : function(func, getid, startbx, startby, endbx, endby){
		var bx=startbx, by=startby, step=2;
		var item=this.getItemList((endby-startby)/step+1);
		for(var i=0;i<item.length;i++){
			func(getid.call(bd,bx,by), item[i]);

			bx+=step;
			if(bx>endbx){ bx=startbx; by+=step;}
			if(by>endby){ break;}
		}
	},
	decodeCell   : function(func){
		this.decodeObj(func, bd.cnum, 1, 1, 2*k.qcols-1, 2*k.qrows-1);
	},
	decodeCross  : function(func){
		this.decodeObj(func, bd.xnum, 0, 0, 2*k.qcols,   2*k.qrows  );
	},
	decodeBorder : function(func){
		if(k.isborder===1 || k.puzzleid==='bosanowa'){
			this.decodeObj(func, bd.bnum, 2, 1, 2*k.qcols-2, 2*k.qrows-1);
			this.decodeObj(func, bd.bnum, 1, 2, 2*k.qcols-1, 2*k.qrows-2);
		}
		else if(k.isborder===2){
			if(this.currentType===this.PZPR){
				this.decodeObj(func, bd.bnum, 0, 1, 2*k.qcols  , 2*k.qrows-1);
				this.decodeObj(func, bd.bnum, 1, 0, 2*k.qcols-1, 2*k.qrows  );
			}
			// pencilboxでは、outsideborderの時はぱずぷれとは順番が逆になってます
			else if(this.currentType===this.PBOX){
				this.decodeObj(func, bd.bnum, 1, 0, 2*k.qcols-1, 2*k.qrows  );
				this.decodeObj(func, bd.bnum, 0, 1, 2*k.qcols  , 2*k.qrows-1);
			}
		}
	},

	//---------------------------------------------------------------------------
	// fio.encodeObj()     個別セルデータ等から個別文字列の設定を行う
	// fio.encodeCell()    個別セルデータから個別文字列の設定を行う
	// fio.encodeCross()   個別Crossデータから個別文字列の設定を行う
	// fio.encodeBorder()  個別Borderデータから個別文字列の設定を行う
	//---------------------------------------------------------------------------
	encodeObj : function(func, getid, startbx, startby, endbx, endby){
		var step=2;
		for(var by=startby;by<=endby;by+=step){
			for(var bx=startbx;bx<=endbx;bx+=step){
				this.datastr += func(getid.call(bd,bx,by));
			}
			this.datastr += "/";
		}
	},
	encodeCell   : function(func){
		this.encodeObj(func, bd.cnum, 1, 1, 2*k.qcols-1, 2*k.qrows-1);
	},
	encodeCross  : function(func){
		this.encodeObj(func, bd.xnum, 0, 0, 2*k.qcols,   2*k.qrows  );
	},
	encodeBorder : function(func){
		if(k.isborder===1 || k.puzzleid==='bosanowa'){
			this.encodeObj(func, bd.bnum, 2, 1, 2*k.qcols-2, 2*k.qrows-1);
			this.encodeObj(func, bd.bnum, 1, 2, 2*k.qcols-1, 2*k.qrows-2);
		}
		else if(k.isborder===2){
			if(this.currentType===this.PZPR){
				this.encodeObj(func, bd.bnum, 0, 1, 2*k.qcols  , 2*k.qrows-1);
				this.encodeObj(func, bd.bnum, 1, 0, 2*k.qcols-1, 2*k.qrows  );
			}
			// pencilboxでは、outsideborderの時はぱずぷれとは順番が逆になってます
			else if(this.currentType===this.PBOX){
				this.encodeObj(func, bd.bnum, 1, 0, 2*k.qcols-1, 2*k.qrows  );
				this.encodeObj(func, bd.bnum, 0, 1, 2*k.qcols  , 2*k.qrows-1);
			}
		}
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
		this.decodeBorder( function(c,ca){
			if     (ca === "1" ){ bd.sQaB(c, 1);}
			else if(ca === "2" ){ bd.sQsB(c, 1);}
			else if(ca === "3" ){ bd.sQaB(c, 1); bd.sQsB(c, 1);}
			else if(ca === "-1"){ bd.sQsB(c, 2);}
		});
	},
	encodeBorderAns2 : function(){
		this.encodeBorder( function(c){
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
			var cc1 = bd.border[id].cellcc[0], cc2 = bd.border[id].cellcc[1];
			func.apply(bd, [id, (cc1!==null && cc2!==null && rdata[cc1]!=rdata[cc2]?1:0)]);
		}
	},
	//---------------------------------------------------------------------------
	// fio.decodeCellQnum51() [＼]のデコードを行う
	// fio.encodeCellQnum51() [＼]のエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellQnum51 : function(){
		var item = this.getItemList(k.qrows+1);
		for(var i=0;i<item.length;i++) {
			var bx=(i%(k.qcols+1)-1)*2+1, by=(((i/(k.qcols+1))|0)-1)*2+1;
			if(item[i]!="."){
				if     (by===-1){ bd.sDiE(bd.exnum(bx,by), parseInt(item[i]));}
				else if(bx===-1){ bd.sQnE(bd.exnum(bx,by), parseInt(item[i]));}
				else{
					var inp = item[i].split(",");
					var c = bd.cnum(bx,by);
					mv.set51cell(c, true);
					bd.sQnC(c, inp[0]);
					bd.sDiC(c, inp[1]);
				}
			}
		}
	},
	encodeCellQnum51 : function(){
		var str = "";
		for(var by=bd.minby+1;by<bd.maxby;by+=2){
			for(var bx=bd.minbx+1;bx<bd.maxbx;bx+=2){
				if     (bx===-1 && by==-1){ str += "0 ";}
				else if(by===-1){ str += (""+bd.DiE(bd.exnum(bx,by)).toString()+" ");}
				else if(bx===-1){ str += (""+bd.QnE(bd.exnum(bx,by)).toString()+" ");}
				else{
					var c = bd.cnum(bx,by);
					if(bd.QuC(c)===51){ str += (""+bd.QnC(c).toString()+","+bd.DiC(c).toString()+" ");}
					else{ str += ". ";}
				}
			}
			str += "/";
		}
		this.datastr += str;
	},
	//---------------------------------------------------------------------------
	// fio.decodeCellQnum_kanpen() pencilbox用問題数字のデコードを行う
	// fio.encodeCellQnum_kanpen() pencilbox用問題数字のエンコードを行う
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
	// fio.decodeCellQans_kanpen() pencilbox用回答数字のデコードを行う
	// fio.encodeCellQans_kanpen() pencilbox用回答数字のエンコードを行う
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
	// fio.decodeCellQnumAns_kanpen() pencilbox用問題数字＋黒マス白マスのデコードを行う
	// fio.encodeCellQnumAns_kanpen() pencilbox用問題数字＋黒マス白マスのエンコードを行う
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
	// fio.decodeSquareRoom() pencilbox用四角形の部屋のデコードを行う
	// fio.encodeSquareRoom() pencilbox用四角形の部屋のエンコードを行う
	// fio.decodeAnsSquareRoom() (回答用)pencilbox用四角形の部屋のデコードを行う
	// fio.encodeAnsSquareRoom() (回答用)pencilbox用四角形の部屋のエンコードを行う
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
			for(var n=0;n<4;n++){ if(!isNaN(pce[n])){ pce[n]=parseInt(pce[n]);} }

			var sp = {y1:2*pce[0]+1, x1:2*pce[1]+1, y2:2*pce[2]+1, x2:2*pce[3]+1};
			if(isques && pce[4]!=""){ bd.sQnC(bd.cnum(sp.x1,sp.y1), parseInt(pce[4],10));}
			this.setRdataRect(rdata, i, sp);
		}
		this.rdata2Border(isques, rdata);

		area.resetRarea();
	},
	setRdataRect : function(rdata, i, sp){
		for(var bx=sp.x1;bx<=sp.x2;bx+=2){
			for(var by=sp.y1;by<=sp.y2;by+=2){
				rdata[bd.cnum(bx,by)] = i;
			}
		}
	},
	encodeSquareRoom_com : function(isques){
		var rinfo = area.getRoomInfo();

		this.datastr += (rinfo.max+"/");
		for(var id=1;id<=rinfo.max;id++){
			var d = ans.getSizeOfClist(rinfo.room[id].idlist,f_true);
			var num = (isques ? bd.QnC(area.getTopOfRoom(id)) : -1);
			this.datastr += (""+(d.y1>>1)+" "+(d.x1>>1)+" "+(d.y2>>1)+" "+(d.x2>>1)+" "+(num>=0 ? ""+num : "")+"/");
		}
	}
};

//---------------------------------------------------------------------------
// ★DataBaseManagerクラス Web SQL DataBase用 データベースの設定・管理を行う
//---------------------------------------------------------------------------
DataBaseManager = function(){
	this.dbh    = null;	// データベースハンドラ

	//this.DBtype = 0;
	this.DBaccept = 0;	// データベースのタイプ 1:Gears 2:WebDB 4:IdxDB 8:localStorage

	this.DBsid  = -1;	// 現在選択されているリスト中のID
	this.DBlist = [];	// 現在一覧にある問題のリスト
	this.keys = ['id', 'col', 'row', 'hard', 'pdata', 'time', 'comment']; // キーの並び

	this.selectDBtype();
};
DataBaseManager.prototype = {
	//---------------------------------------------------------------------------
	// fio.dbm.selectDBtype() Web DataBaseが使えるかどうか判定する(起動時)
	// fio.dbm.requestGears() gears_init.jsを読み出すか判定する
	//---------------------------------------------------------------------------
	selectDBtype : function(){
		// HTML5 - Web localStorage判定用
		if(!!window.localStorage){
			// FirefoxはローカルだとlocalStorageが使えない
			if(!k.br.Gecko || !!location.hostname){ this.DBaccept |= 0x08;}
		}

		// HTML5 - Web DataBase判定用
		if(!!window.openDatabase){
			try{	// Opera10.50対策
				var dbtmp = openDatabase('pzprv3_manage', '1.0');	// Chrome3対策
				if(!!dbtmp){ this.DBaccept |= 0x02;}
			}
			catch(e){}
		}

		// 以下はGears用(gears_init.jsの判定ルーチン的なもの)
		// Google Chorme用(既にGearsが存在するか判定)
		try{
			if((window.google && google.gears) || // 既にGearsが初期化済
			   (typeof GearsFactory != 'undefined') || 										// Firefoxの時
			   (!!window.ActiveXObject && (!!(new ActiveXObject('Gears.Factory')))) ||		// IEの時
			   (!!navigator.mimeTypes && navigator.mimeTypes["application/x-googlegears"]))	// Webkitの時
			{ this.DBaccept |= 0x01;}
		}
		catch(e){}
	},
	requireGears : function(){
		return !!(this.DBaccept & 0x01);
	},

	//---------------------------------------------------------------------------
	// fio.dbm.openDialog()    データベースダイアログが開いた時の処理
	// fio.dbm.openHandler()   データベースハンドラを開く
	//---------------------------------------------------------------------------
	openDialog : function(){
		this.openHandler();
		this.update();
	},
	openHandler : function(){
		// データベースを開く
		var type = 0;
		if     (this.DBaccept & 0x08){ type = 4;}
		else if(this.DBaccept & 0x04){ type = 3;}
		else if(this.DBaccept & 0x02){ type = 2;}
		else if(this.DBaccept & 0x01){ type = 1;}

		switch(type){
			case 1: case 2: this.dbh = new DataBaseHandler_SQL((type===2)); break;
			case 4:         this.dbh = new DataBaseHandler_LS(); break;
			default: return;
		}
		this.dbh.importDBlist(this);

		var sortlist = { idlist:"ID順", newsave:"保存が新しい順", oldsave:"保存が古い順", size:"サイズ/難易度順"};
		var str="";
		for(s in sortlist){ str += ("<option value=\""+s+"\">"+sortlist[s]+"</option>");}
		_doc.database.sorts.innerHTML = str;
	},

	//---------------------------------------------------------------------------
	// fio.dbm.closeDialog()   データベースダイアログが閉じた時の処理
	// fio.dbm.clickHandler()  フォーム上のボタンが押された時、各関数にジャンプする
	//---------------------------------------------------------------------------
	closeDialog : function(){
		this.DBlist = [];
	},
	clickHandler : function(e){
		switch(ee.getSrcElement(e).name){
			case 'sorts'   : this.displayDataTableList();	// breakがないのはわざとです
			case 'datalist': this.selectDataTable();   break;
			case 'tableup' : this.upDataTable_M();     break;
			case 'tabledn' : this.downDataTable_M();   break;
			case 'open'    : this.openDataTable_M();   break;
			case 'save'    : this.saveDataTable_M();   break;
			case 'comedit' : this.editComment_M();     break;
			case 'difedit' : this.editDifficult_M();   break;
			case 'del'     : this.deleteDataTable_M(); break;
		}
	},

	//---------------------------------------------------------------------------
	// fio.dbm.getDataID()  選択中データの(this.DBlistのkeyとなる)IDを取得する
	// fio.dbm.update()     管理テーブル情報やダイアログの表示を更新する
	//---------------------------------------------------------------------------
	getDataID : function(){
		if(_doc.database.datalist.value!="new" && _doc.database.datalist.value!=""){
			for(var i=0;i<this.DBlist.length;i++){
				if(this.DBlist[i].id==_doc.database.datalist.value){ return i;}
			}
		}
		return -1;
	},
	update : function(){
		this.dbh.updateManageData(this);
			this.displayDataTableList();
			this.selectDataTable();
	},

	//---------------------------------------------------------------------------
	// fio.dbm.displayDataTableList() 保存しているデータの一覧を表示する
	// fio.dbm.getRowString()         1データから文字列を生成する
	// fio.dbm.dateString()           時刻の文字列を生成する
	//---------------------------------------------------------------------------
	displayDataTableList : function(){
			switch(_doc.database.sorts.value){
				case 'idlist':  this.DBlist = this.DBlist.sort(function(a,b){ return (a.id-b.id);}); break;
				case 'newsave': this.DBlist = this.DBlist.sort(function(a,b){ return (b.time-a.time || a.id-b.id);}); break;
				case 'oldsave': this.DBlist = this.DBlist.sort(function(a,b){ return (a.time-b.time || a.id-b.id);}); break;
				case 'size':    this.DBlist = this.DBlist.sort(function(a,b){ return (a.col-b.col || a.row-b.row || a.hard-b.hard || a.id-b.id);}); break;
			}

			var html = "";
			for(var i=0;i<this.DBlist.length;i++){
				var row = this.DBlist[i];
			if(!row){ continue;}//alert(i);}

			var valstr = " value=\""+row.id+"\"";
			var selstr = (this.DBsid==row.id?" selected":"");
			html += ("<option" + valstr + selstr + ">" + this.getRowString(row)+"</option>\n");
			}
			html += ("<option value=\"new\""+(this.DBsid==-1?" selected":"")+">&nbsp;&lt;新しく保存する&gt;</option>\n");
			_doc.database.datalist.innerHTML = html;
	},
	getRowString : function(row){
		var hardstr = [
			{ja:'−'      , en:'-'     },
			{ja:'らくらく', en:'Easy'  },
			{ja:'おてごろ', en:'Normal'},
			{ja:'たいへん', en:'Hard'  },
			{ja:'アゼン'  , en:'Expert'}
		];

		var str = "";
		str += ((row.id<10?"&nbsp;":"")+row.id+" :&nbsp;");
		str += (this.dateString(row.time*1000)+" &nbsp;");
		str += (""+row.col+"×"+row.row+" &nbsp;");
		if(!!row.hard || row.hard=='0'){
			str += (hardstr[row.hard][menu.language]);
		}
		return str;
	},
	dateString : function(time){
		var ni   = function(num){ return (num<10?"0":"")+num;};
		var str  = " ";
		var date = new Date();
		date.setTime(time);

		str += (ni(date.getFullYear()%100) + "/" + ni(date.getMonth()+1) + "/" + ni(date.getDate())+" ");
		str += (ni(date.getHours()) + ":" + ni(date.getMinutes()));
		return str;
	},

	//---------------------------------------------------------------------------
	// fio.dbm.selectDataTable() データを選択して、コメントなどを表示する
	//---------------------------------------------------------------------------
	selectDataTable : function(){
		var selected = this.getDataID();
		if(selected>=0){
			_doc.database.comtext.value = ""+this.DBlist[selected].comment;
			this.DBsid = parseInt(this.DBlist[selected].id);
		}
		else{
			_doc.database.comtext.value = "";
			this.DBsid = -1;
		}

		_doc.database.tableup.disabled = (_doc.database.sorts.value!=='idlist' || this.DBsid===-1 || this.DBsid===1);
		_doc.database.tabledn.disabled = (_doc.database.sorts.value!=='idlist' || this.DBsid===-1 || this.DBsid===this.DBlist.length);
		_doc.database.comedit.disabled = (this.DBsid===-1);
		_doc.database.difedit.disabled = (this.DBsid===-1);
		_doc.database.open.disabled    = (this.DBsid===-1);
		_doc.database.del.disabled     = (this.DBsid===-1);
	},

	//---------------------------------------------------------------------------
	// fio.dbm.upDataTable_M()      データの一覧での位置をひとつ上にする
	// fio.dbm.downDataTable_M()    データの一覧での位置をひとつ下にする
	// fio.dbm.convertDataTable_M() データの一覧での位置を入れ替える
	//---------------------------------------------------------------------------
	upDataTable_M : function(){
		var selected = this.getDataID();
		if(selected===-1 || selected===0){ return;}
		this.convertDataTable_M(selected, selected-1);
	},
	downDataTable_M : function(){
		var selected = this.getDataID();
		if(selected===-1 || selected===this.DBlist.length-1){ return;}
		this.convertDataTable_M(selected, selected+1);
	},
	convertDataTable_M : function(sid, tid){
		this.DBsid = this.DBlist[tid].id;
		var row = {};
		for(var c=1;c<7;c++){ row[this.keys[c]]              = this.DBlist[sid][this.keys[c]];}
		for(var c=1;c<7;c++){ this.DBlist[sid][this.keys[c]] = this.DBlist[tid][this.keys[c]];}
		for(var c=1;c<7;c++){ this.DBlist[tid][this.keys[c]] = row[this.keys[c]];}

		this.dbh.convertDataTableID(this, sid, tid);
		this.update();
	},

	//---------------------------------------------------------------------------
	// fio.dbm.openDataTable_M()  データの盤面に読み込む
	// fio.dbm.saveDataTable_M()  データの盤面を保存する
	//---------------------------------------------------------------------------
	openDataTable_M : function(){
		var id = this.getDataID(); if(id===-1){ return;}
		if(!confirm("このデータを読み込みますか？ (現在の盤面は破棄されます)")){ return;}

		this.dbh.openDataTable(this, id);
	},
	saveDataTable_M : function(){
		var id = this.getDataID(), refresh = false;
			if(id===-1){
			id = this.DBlist.length;
			refresh = true;

			this.DBlist[id] = {};
			var str = prompt("コメントがある場合は入力してください。","");
			this.DBlist[id].comment = (!!str ? str : '');
			this.DBlist[id].hard = 0;
			this.DBlist[id].id = id+1;
			this.DBsid = this.DBlist[id].id;
			}
			else{
			if(!confirm("このデータに上書きしますか？")){ return;}
		}
		this.DBlist[id].col   = k.qcols;
		this.DBlist[id].row   = k.qrows;
		this.DBlist[id].time  = (tm.now()/1000)|0;

		this.dbh.saveDataTable(this, id);
		this.update();
	},

	//---------------------------------------------------------------------------
	// fio.dbm.editComment_M()   データのコメントを更新する
	// fio.dbm.editDifficult_M() データの難易度を更新する
	//---------------------------------------------------------------------------
	editComment_M : function(){
		var id = this.getDataID(); if(id===-1){ return;}

		var str = prompt("この問題に対するコメントを入力してください。",this.DBlist[id].comment);
		if(str==null){ return;}

		this.DBlist[id].comment = str;
		this.dbh.updateComment(this, id);
		this.update();
	},
	editDifficult_M : function(){
		var id = this.getDataID(); if(id===-1){ return;}

		var hard = prompt("この問題の難易度を設定してください。\n[0:なし 1:らくらく 2:おてごろ 3:たいへん 4:アゼン]",this.DBlist[id].hard);
		if(hard==null){ return;}

		this.DBlist[id].hard = ((hard=='1'||hard=='2'||hard=='3'||hard=='4')?hard:0);
		this.dbh.updateDifficult(this, id);
		this.update();
	},

	//---------------------------------------------------------------------------
	// fio.dbm.deleteDataTable_M() 選択している盤面データを削除する
	//---------------------------------------------------------------------------
	deleteDataTable_M : function(){
		var id = this.getDataID(); if(id===-1){ return;}
		if(!confirm("このデータを完全に削除しますか？")){ return;}

		var sID = this.DBlist[id].id, max = this.DBlist.length;
		for(var i=sID-1;i<max-1;i++){
			for(var c=1;c<7;c++){ this.DBlist[i][this.keys[c]] = this.DBlist[i+1][this.keys[c]];}
		}
		this.DBlist.pop();

		this.dbh.deleteDataTable(this, sID, max);
		this.update();
	}

	//---------------------------------------------------------------------------
	// fio.dbm.convertDataBase() もし将来必要になったら...
	//---------------------------------------------------------------------------
/*	convertDataBase : function(){
		// ここまで旧データベース
		this.dbh.importDBlist(this);
		this.dbh.dropDataBase();

		// ここから新データベース
		this.dbh.createDataBase();
		this.dbh.setupDBlist(this);
	}
*/
};

//---------------------------------------------------------------------------
// ★DataBaseHandler_LSクラス Web localStorage用 データベースハンドラ
//---------------------------------------------------------------------------
DataBaseHandler_LS = function(){
	this.pheader = 'pzprv3_' + k.puzzleid + ':puzdata';
	this.keys = fio.dbm.keys;

	this.initialize();
};
DataBaseHandler_LS.prototype = {
	//---------------------------------------------------------------------------
	// fio.dbm.dbh.initialize()    初期化時にデータベースを開く
	// fio.dbm.dbh.importDBlist()  DataBaseからDBlistを作成する
	//---------------------------------------------------------------------------
	initialize : function(){
		this.createManageDataTable();
		this.createDataBase();
	},
	importDBlist : function(parent){
		parent.DBlist = [];
		var r=0;
		while(1){
			r++; var row = {};
			for(var c=0;c<7;c++){ row[this.keys[c]] = localStorage[this.pheader+'!'+r+'!'+this.keys[c]];}
			if(row.id==null){ break;}
			row.pdata = "";
			parent.DBlist.push(row);
		}
	},

	//---------------------------------------------------------------------------
	// fio.dbm.dbh.createManageDataTable() 管理情報テーブルを作成する(消去はなし)
	// fio.dbm.dbh.updateManageData()      管理情報レコードを更新する
	//---------------------------------------------------------------------------
	createManageDataTable : function(){
		localStorage['pzprv3_manage']        = 'DataBase';
		localStorage['pzprv3_manage:manage'] = 'Table';
	},
	updateManageData : function(parent){
		var mheader = 'pzprv3_manage:manage!'+k.puzzleid;
		localStorage[mheader+'!count'] = parent.DBlist.length;
		localStorage[mheader+'!time']  = (tm.now()/1000)|0;
	},

	//---------------------------------------------------------------------------
	// fio.dbm.dbh.createDataBase()     テーブルを作成する
	//---------------------------------------------------------------------------
	createDataBase : function(){
		localStorage['pzprv3_'+k.puzzleid]            = 'DataBase';
		localStorage['pzprv3_'+k.puzzleid+':puzdata'] = 'Table';
	},

	//---------------------------------------------------------------------------
	// fio.dbm.dbh.convertDataTableID() データのIDを付け直す
	//---------------------------------------------------------------------------
	convertDataTableID : function(parent, sid, tid){
		var sID = parent.DBlist[sid].id, tID = parent.DBlist[tid].id;
		var sheader=this.pheader+'!'+sID, theader=this.pheader+'!'+tID, row = {};
		for(var c=1;c<7;c++){ localStorage[sheader+'!'+this.keys[c]] = parent.DBlist[sid][this.keys[c]];}
		for(var c=1;c<7;c++){ localStorage[theader+'!'+this.keys[c]] = parent.DBlist[tid][this.keys[c]];}
	},

	//---------------------------------------------------------------------------
	// fio.dbm.dbh.openDataTable()   データの盤面に読み込む
	// fio.dbm.dbh.saveDataTable()   データの盤面を保存する
	//---------------------------------------------------------------------------
	openDataTable : function(parent, id){
		var pdata = localStorage[this.pheader+'!'+parent.DBlist[id].id+'!pdata'];
		fio.filedecode(pdata);
	},
	saveDataTable : function(parent, id){
		var row = parent.DBlist[id];
		for(var c=0;c<7;c++){ localStorage[this.pheader+'!'+row.id+'!'+this.keys[c]] = (c!==4 ? row[this.keys[c]] : fio.fileencode(1));}
	},

	//---------------------------------------------------------------------------
	// fio.dbm.dbh.updateComment()   データのコメントを更新する
	// fio.dbm.dbh.updateDifficult() データの難易度を更新する
	//---------------------------------------------------------------------------
	updateComment : function(parent, id){
		var row = parent.DBlist[id];
		localStorage[this.pheader+'!'+row.id+'!comment'] = row.comment;
	},
	updateDifficult : function(parent, id){
		var row = parent.DBlist[id];
		localStorage[this.pheader+'!'+row.id+'!hard'] = row.hard;
	},
	//---------------------------------------------------------------------------
	// fio.dbm.dbh.deleteDataTable() 選択している盤面データを削除する
	//---------------------------------------------------------------------------
	deleteDataTable : function(parent, sID, max){
		for(var i=parseInt(sID);i<max;i++){
			var headers = [this.pheader+'!'+(i+1), this.pheader+'!'+i];
			for(var c=1;c<7;c++){ localStorage[headers[1]+'!'+this.keys[c]] = localStorage[headers[0]+'!'+this.keys[c]];}
		}
		var dheader = this.pheader+'!'+max;
		for(var c=0;c<7;c++){ localStorage.removeItem(dheader+'!'+this.keys[c]);}
	}
};

//---------------------------------------------------------------------------
// ★DataBaseHandler_SQLクラス Web SQL DataBase用 データベースハンドラ
//---------------------------------------------------------------------------
DataBaseHandler_SQL = function(isSQLDB){
	this.db    = null;	// パズル個別のデータベース
	this.dbmgr = null;	// pzprv3_managerデータベース
	this.isSQLDB = isSQLDB;

	this.initialize();
};
DataBaseHandler_SQL.prototype = {
	//---------------------------------------------------------------------------
	// fio.dbm.dbh.initialize()    初期化時にデータベースを開く
	// fio.dbm.dbh.importDBlist()  DataBaseからDBlistを作成する
	// fio.dbm.dbh.setupDBlist()   DBlistのデータをDataBaseに代入する
	//---------------------------------------------------------------------------
	initialize : function(){
		var wrapper1 = new DataBaseObject_SQL(this.isSQLDB);
		var wrapper2 = new DataBaseObject_SQL(this.isSQLDB);

		this.dbmgr = wrapper1.openDatabase('pzprv3_manage', '1.0');
		this.db    = wrapper2.openDatabase('pzprv3_'+k.puzzleid, '1.0');

		this.createManageDataTable();
		this.createDataBase();
	},
	importDBlist : function(parent){
		parent.DBlist = [];
		this.db.transaction(
			function(tx){
				tx.executeSql('SELECT * FROM pzldata',[],function(tx,rs){
					var i=0, keys=parent.keys;
					for(var r=0;r<rs.rows.length;r++){
						parent.DBlist[i] = {};
						for(var c=0;c<7;c++){ parent.DBlist[i][keys[c]] = rs.rows.item(r)[keys[c]];}
						parent.DBlist[i].pdata = "";
						i++;
					}
				});
			},
			function(){ },
			function(){ fio.dbm.update();}
		);
	},
/*	setupDBlist : function(parent){
		for(var r=0;r<parent.DBlist.length;r++){
			this.saveDataTable(parent, r);
		}
	},
*/
	//---------------------------------------------------------------------------
	// fio.dbm.dbh.createManageDataTable() 管理情報テーブルを作成する(消去はなし)
	// fio.dbm.dbh.updateManageData()      管理情報レコードを作成・更新する
	// fio.dbm.dbh.deleteManageData()      管理情報レコードを削除する
	//---------------------------------------------------------------------------
	createManageDataTable : function(){
		this.dbmgr.transaction( function(tx){
			tx.executeSql('CREATE TABLE IF NOT EXISTS manage (puzzleid primary key,version,count,lastupdate)',[]);
		});
	},
	updateManageData : function(parent){
		var count = parent.DBlist.length;
		var time = (tm.now()/1000)|0;
		this.dbmgr.transaction( function(tx){
			tx.executeSql('INSERT OR REPLACE INTO manage VALUES(?,?,?,?)', [k.puzzleid, '1.0', count, time]);
		});
	},
/*	deleteManageData : function(){
		this.dbmgr.transaction( function(tx){
			tx.executeSql('DELETE FROM manage WHERE puzzleid=?',[k.puzzleid]);
		});
	},
*/
	//---------------------------------------------------------------------------
	// fio.dbm.dbh.createDataBase()      テーブルを作成する
	// fio.dbm.dbh.dropDataBase()        テーブルを削除する
	// fio.dbm.dbh.forcedeleteDataBase() テーブルを削除する
	//---------------------------------------------------------------------------
	createDataBase : function(){
		this.db.transaction( function(tx){
			tx.executeSql('CREATE TABLE IF NOT EXISTS pzldata (id int primary key,col,row,hard,pdata,time,comment)',[]);
		});
	},
/*	dropDataBase : function(){
		this.db.transaction( function(tx){
			tx.executeSql('DROP TABLE IF EXISTS pzldata',[]);
		});
	},
	forceDeleteDataBase : function(parent){
		this.deleteManageData();
		this.dropDataBase();
	},*/

	//---------------------------------------------------------------------------
	// fio.dbm.dbh.convertDataTableID() データのIDを付け直す
	//---------------------------------------------------------------------------
	convertDataTableID : function(parent, sid, tid){
		var sID = parent.DBlist[sid].id, tID = parent.DBlist[tid].id;
		this.db.transaction( function(tx){
			tx.executeSql('UPDATE pzldata SET id=? WHERE ID==?',[0  ,sID]);
			tx.executeSql('UPDATE pzldata SET id=? WHERE ID==?',[sID,tID]);
			tx.executeSql('UPDATE pzldata SET id=? WHERE ID==?',[tID,  0]);
		});
	},

	//---------------------------------------------------------------------------
	// fio.dbm.dbh.openDataTable()   データの盤面に読み込む
	// fio.dbm.dbh.saveDataTable()   データの盤面を保存する
	//---------------------------------------------------------------------------
	openDataTable : function(parent, id){
		this.db.transaction( function(tx){
			tx.executeSql('SELECT * FROM pzldata WHERE ID==?',[parent.DBlist[id].id],
				function(tx,rs){ fio.filedecode(rs.rows.item(0)['pdata']);}
			);
		});
	},
	saveDataTable : function(parent, id){
		var row = parent.DBlist[id];
		this.db.transaction( function(tx){
			tx.executeSql('INSERT INTO pzldata VALUES(?,?,?,?,?,?,?)',[row.id,row.col,row.row,row.hard,fio.fileencode(1),row.time,row.comment]);
		});
	},

	//---------------------------------------------------------------------------
	// fio.dbm.dbh.updateComment()   データのコメントを更新する
	// fio.dbm.dbh.updateDifficult() データの難易度を更新する
	//---------------------------------------------------------------------------
	updateComment : function(parent, id){
		var row = parent.DBlist[id];
		this.db.transaction( function(tx){
			tx.executeSql('UPDATE pzldata SET comment=? WHERE ID==?',[row.comment, row.id]);
		});
	},
	updateDifficult : function(parent, id){
		var row = parent.DBlist[id];
		this.db.transaction( function(tx){
			tx.executeSql('UPDATE pzldata SET hard=? WHERE ID==?',[row.hard, row.id]);
		});
	},

	//---------------------------------------------------------------------------
	// fio.dbm.dbh.deleteDataTable() 選択している盤面データを削除する
	//---------------------------------------------------------------------------
	deleteDataTable : function(parent, sID, max){
		this.db.transaction( function(tx){
			tx.executeSql('DELETE FROM pzldata WHERE ID==?',[sID]);
			for(var i=parseInt(sID);i<max;i++){
				tx.executeSql('UPDATE pzldata SET id=? WHERE ID==?',[i,i+1]);
			}
		});
	}
};

//---------------------------------------------------------------------------
// ★DataBaseObject_SQLクラス  Web SQL DataBase用 データベースのラッパークラス
//---------------------------------------------------------------------------
DataBaseObject_SQL = function(isSQLDB){
	this.name    = '';
	this.version = 0;
	this.isSQLDB = isSQLDB;

	this.object = null;
};
DataBaseObject_SQL.prototype = {
	openDatabase : function(name, ver){
		this.name    = name;
		this.version = ver;
		if(this.isSQLDB){
			this.object = openDatabase(this.name, this.version);
		}
		else{
			this.object = google.gears.factory.create('beta.database', this.version);
		}
		return this;
	},

	// Gears用ラッパーみたいなもの
	transaction : function(execfunc, errorfunc, compfunc){
		if(typeof errorfunc == 'undefined'){ errorfunc = f_true;}
		if(typeof compfunc  == 'undefined'){ compfunc  = f_true;}

		if(this.isSQLDB){
			// execfuncの第一引数txはSQLTransactionオブジェクト(tx.executeSqlは下の関数を指さない)
			this.object.transaction(execfunc, errorfunc, compfunc);
		}
		else{
			this.object.open(this.name);
			// execfuncの第一引数txはthisにしておく(tx.executeSqlは下の関数を指す)
			execfunc(this);
			this.object.close();

			compfunc();
		}
	},
	// Gears用ラッパー
	executeSql : function(statement, args, callback){
		var resultSet = this.object.execute(statement, args);
		// 以下はcallback用
		if(typeof callback != 'undefined'){
			var r=0, rows = {};
			rows.rowarray = [];
			while(resultSet.isValidRow()){
				var row = {};
				for(var i=0,len=resultSet.fieldCount();i<len;i++){
					row[i] = row[resultSet.fieldName(i)] = resultSet.field(i);
				}
				rows.rowarray[r] = row;
				resultSet.next();
				r++;
			}
			resultSet.close();

			rows.length = r;
			rows.item = function(r){ return this.rowarray[r];};

			var rs = {rows:rows};
			callback(this, rs);
		}
	}
};
