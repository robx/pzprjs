// Filesys.js v3.4.0
(function(){

var k = pzprv3.consts;
pzprv3.addConsts({
	// 定数(ファイル形式)
	PZPR : 1,
	PBOX : 2,
	PZPH : 3
});

//---------------------------------------------------------------------------
// ★FileIOクラス ファイルのデータ形式エンコード/デコードを扱う
//---------------------------------------------------------------------------
pzprv3.createPuzzleClass('FileIO',
{
	initialize : function(){
		this.filever = 0;
		this.lineseek = 0;
		this.dataarray = [];
		this.datastr = "";
		this.history = "";
		this.currentType = 1;
	},

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
			this.currentType = k.PZPR;
		}
		else{
			this.lineseek = 0;
			this.currentType = k.PBOX;
		}

		// サイズを表す文字列
		var row, col;
		if(o.pid!=="sudoku"){
			row = parseInt(this.readLine(), 10);
			col = parseInt(this.readLine(), 10);
			if(this.currentType===k.PBOX && o.pid==="kakuro"){ row--; col--;}
		}
		else{
			row = col = parseInt(this.readLine(), 10);
		}
		if(row<=0 || col<=0){ return '';}
		this.owner.board.initBoardSize(col, row); // 盤面を指定されたサイズで初期化

		// メイン処理
		if     (this.currentType===k.PZPR){ this.decodeData();}
		else if(this.currentType===k.PBOX){ this.kanpenOpen();}

		o.opemgr.decodeLines();

		o.board.resetInfo();

		this.dataarray = null;

		return '';
	},
	//---------------------------------------------------------------------------
	// fio.fileencode() ファイルデータ(文字列)へのエンコード実行関数
	//---------------------------------------------------------------------------
	fileencode : function(type){
		this.filever = 0;
		this.sizestr = "";
		this.datastr = "";
		this.history = "";
		this.currentType = type;
		if(this.currentType===k.PZPH){ this.currentType = k.PZPR;}

		// メイン処理
		var o = this.owner;
		if     (this.currentType===k.PZPR){ this.encodeData();}
		else if(this.currentType===k.PBOX){ this.kanpenSave();}

		// サイズを表す文字列
		if(!this.sizestr){ this.sizestr = [o.board.qrows, o.board.qcols].join("\n");}
		this.datastr = [this.sizestr, this.datastr].join("\n");

		// ヘッダの処理
		if(this.currentType===k.PZPR){
			var header = (this.filever===0 ? "pzprv3" : ("pzprv3."+this.filever));
			this.datastr = [header, o.pid, this.datastr].join("\n");
		}
		var bstr = this.datastr;

		// 末尾の履歴情報追加処理
		if(type===k.PZPH){ this.history = o.opemgr.toString();}

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
		if(bd.isborder===1 || o.pid==='bosanowa' || (o.pid==='fourcells' && this.filever===0)){
			this.decodeObj(func, k.BORDER, 2, 1, 2*bd.qcols-2, 2*bd.qrows-1);
			this.decodeObj(func, k.BORDER, 1, 2, 2*bd.qcols-1, 2*bd.qrows-2);
		}
		else if(bd.isborder===2){
			if(this.currentType===k.PZPR){
				this.decodeObj(func, k.BORDER, 0, 1, 2*bd.qcols  , 2*bd.qrows-1);
				this.decodeObj(func, k.BORDER, 1, 0, 2*bd.qcols-1, 2*bd.qrows  );
			}
			// pencilboxでは、outsideborderの時はぱずぷれとは順番が逆になってます
			else if(this.currentType===k.PBOX){
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
		if(bd.isborder===1 || o.pid==='bosanowa'){
			this.encodeObj(func, k.BORDER, 2, 1, 2*bd.qcols-2, 2*bd.qrows-1);
			this.encodeObj(func, k.BORDER, 1, 2, 2*bd.qcols-1, 2*bd.qrows-2);
		}
		else if(bd.isborder===2){
			if(this.currentType===k.PZPR){
				this.encodeObj(func, k.BORDER, 0, 1, 2*bd.qcols  , 2*bd.qrows-1);
				this.encodeObj(func, k.BORDER, 1, 0, 2*bd.qcols-1, 2*bd.qrows  );
			}
			// pencilboxでは、outsideborderの時はぱずぷれとは順番が逆になってます
			else if(this.currentType===k.PBOX){
				this.encodeObj(func, k.BORDER, 1, 0, 2*bd.qcols-1, 2*bd.qrows  );
				this.encodeObj(func, k.BORDER, 0, 1, 2*bd.qcols  , 2*bd.qrows-1);
			}
		}
	},

	//---------------------------------------------------------------------------
	// fio.decodeCellQnum() 問題数字のデコードを行う
	// fio.encodeCellQnum() 問題数字のエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellQnum : function(){
		this.decodeCell( function(obj,ca){
			if     (ca==="-"){ obj.qnum = -2;}
			else if(ca!=="."){ obj.qnum = parseInt(ca);}
		});
	},
	encodeCellQnum : function(){
		this.encodeCell( function(obj){
			if     (obj.qnum>=0)  { return (obj.qnum.toString()+" ");}
			else if(obj.qnum===-2){ return "- ";}
			else                  { return ". ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeCellQnumb() 黒背景な問題数字のデコードを行う
	// fio.encodeCellQnumb() 黒背景な問題数字のエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellQnumb : function(){
		this.decodeCell( function(obj,ca){
			if     (ca==="5"){ obj.qnum = -2;}
			else if(ca!=="."){ obj.qnum = parseInt(ca);}
		});
	},
	encodeCellQnumb : function(){
		this.encodeCell( function(obj){
			if     (obj.qnum>=0)  { return (obj.qnum.toString()+" ");}
			else if(obj.qnum===-2){ return "5 ";}
			else                  { return ". ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeCellQnumAns() 問題数字＋黒マス白マスのデコードを行う
	// fio.encodeCellQnumAns() 問題数字＋黒マス白マスのエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellQnumAns : function(){
		this.decodeCell( function(obj,ca){
			if     (ca==="#"){ obj.qans = 1;}
			else if(ca==="+"){ obj.qsub = 1;}
			else if(ca==="-"){ obj.qnum = -2;}
			else if(ca!=="."){ obj.qnum = parseInt(ca);}
		});
	},
	encodeCellQnumAns : function(){
		this.encodeCell( function(obj){
			if     (obj.qnum>=0) { return (obj.qnum.toString() + " ");}
			else if(obj.qnum===-2){return "- ";}
			else if(obj.qans===1){ return "# ";}
			else if(obj.qsub===1){ return "+ ";}
			else                 { return ". ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeCellDirecQnum() 方向＋問題数字のデコードを行う
	// fio.encodeCellDirecQnum() 方向＋問題数字のエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellDirecQnum : function(){
		this.decodeCell( function(obj,ca){
			if(ca!=="."){
				var inp = ca.split(",");
				obj.qdir = (inp[0]!=="0"?parseInt(inp[0]): 0);
				obj.qnum = (inp[1]!=="-"?parseInt(inp[1]):-2);
			}
		});
	},
	encodeCellDirecQnum : function(){
		this.encodeCell( function(obj){
			if(obj.qnum!==-1){
				var ca1 = (obj.qdir!== 0?obj.qdir.toString():"0");
				var ca2 = (obj.qnum!==-2?obj.qnum.toString():"-");
				return [ca1, ",", ca2, " "].join('');
			}
			else{ return ". ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeCellAns() 黒マス白マスのデコードを行う
	// fio.encodeCellAns() 黒マス白マスのエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellAns : function(){
		this.decodeCell( function(obj,ca){
			if     (ca==="#"){ obj.qans = 1;}
			else if(ca==="+"){ obj.qsub = 1;}
		});
	},
	encodeCellAns : function(){
		this.encodeCell( function(obj){
			if     (obj.qans===1){ return "# ";}
			else if(obj.qsub===1){ return "+ ";}
			else                 { return ". ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeCellQanssub() 黒マスと背景色のデコードを行う
	// fio.encodeCellQanssub() 黒マスと背景色のエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellQanssub : function(){
		this.decodeCell( function(obj,ca){
			if     (ca==="+"){ obj.qsub = 1;}
			else if(ca==="-"){ obj.qsub = 2;}
			else if(ca==="="){ obj.qsub = 3;}
			else if(ca==="%"){ obj.qsub = 4;}
			else if(ca!=="."){ obj.qans = parseInt(ca);}
		});
	},
	encodeCellQanssub : function(){
		this.encodeCell( function(obj){
			if     (obj.qans!==0){ return (obj.qans.toString() + " ");}
			else if(obj.qsub===1){ return "+ ";}
			else if(obj.qsub===2){ return "- ";}
			else if(obj.qsub===3){ return "= ";}
			else if(obj.qsub===4){ return "% ";}
			else                 { return ". ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeCellAnumsub() 回答数字と背景色のデコードを行う
	// fio.encodeCellAnumsub() 回答数字と背景色のエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellAnumsub : function(){
		this.decodeCell( function(obj,ca){
			if     (ca==="+"){ obj.qsub = 1;}
			else if(ca==="-"){ obj.qsub = 2;}
			else if(ca==="="){ obj.qsub = 3;}
			else if(ca==="%"){ obj.qsub = 4;}
			else if(ca!=="."){ obj.anum = parseInt(ca);}
		});
	},
	encodeCellAnumsub : function(){
		this.encodeCell( function(obj){
			if     (obj.anum!==-1){ return (obj.anum.toString() + " ");}
			else if(obj.qsub===1) { return "+ ";}
			else if(obj.qsub===2) { return "- ";}
			else if(obj.qsub===3) { return "= ";}
			else if(obj.qsub===4) { return "% ";}
			else                  { return ". ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeCellQsub() 背景色のデコードを行う
	// fio.encodeCellQsub() 背景色のエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellQsub : function(){
		this.decodeCell( function(obj,ca){
			if(ca!=="0"){ obj.qsub = parseInt(ca);}
		});
	},
	encodeCellQsub : function(){
		this.encodeCell( function(obj){
			if(obj.qsub>0){ return (obj.qsub.toString() + " ");}
			else          { return "0 ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeCrossNum() 交点の数字のデコードを行う
	// fio.encodeCrossNum() 交点の数字のエンコードを行う
	//---------------------------------------------------------------------------
	decodeCrossNum : function(){
		this.decodeCross( function(obj,ca){
			if     (ca==="-"){ obj.qnum = -2;}
			else if(ca!=="."){ obj.qnum = parseInt(ca);}
		});
	},
	encodeCrossNum : function(){
		this.encodeCross( function(obj){
			if     (obj.qnum>=0)  { return (obj.qnum.toString() + " ");}
			else if(obj.qnum===-2){ return "- ";}
			else                  { return ". ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeBorderQues() 問題の境界線のデコードを行う
	// fio.encodeBorderQues() 問題の境界線のエンコードを行う
	//---------------------------------------------------------------------------
	decodeBorderQues : function(){
		this.decodeBorder( function(obj,ca){
			if(ca==="1"){ obj.ques = 1;}
		});
	},
	encodeBorderQues : function(){
		this.encodeBorder( function(obj){
			return (obj.ques===1?"1":"0")+" ";
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeBorderAns() 問題・回答の境界線のデコードを行う
	// fio.encodeBorderAns() 問題・回答の境界線のエンコードを行う
	//---------------------------------------------------------------------------
	decodeBorderAns : function(){
		this.decodeBorder( function(obj,ca){
			if     (ca==="2" ){ obj.qans = 1; obj.qsub = 1;}
			else if(ca==="1" ){ obj.qans = 1;}
			else if(ca==="-1"){ obj.qsub = 1;}
		});
	},
	encodeBorderAns : function(){
		this.encodeBorder( function(obj){
			if     (obj.qans===1 && obj.qsub===1){ return "2 ";}
			else if(obj.qans===1){ return "1 ";}
			else if(obj.qsub===1){ return "-1 ";}
			else                 { return "0 ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeBorderLine() Lineのデコードを行う
	// fio.encodeBorderLine() Lineのエンコードを行う
	//---------------------------------------------------------------------------
	decodeBorderLine : function(){
		this.decodeBorder( function(obj,ca){
			if     (ca==="-1"){ obj.qsub = 2;}
			else if(ca!=="0" ){ obj.line = parseInt(ca);}
		});
	},
	encodeBorderLine : function(){
		this.encodeBorder( function(obj){
			if     (obj.line>  0){ return ""+obj.line+" ";}
			else if(obj.qsub===2){ return "-1 ";}
			else                 { return "0 ";}
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
		this.rdata2Border(isques, this.getItemList(this.owner.board.qrows));

		this.owner.board.rooms.reset();
	},
	encodeAreaRoom_com : function(isques){
		var bd = this.owner.board, rinfo = bd.getRoomInfo();

		this.datastr += (rinfo.max+"\n");
		for(var c=0;c<bd.cellmax;c++){
			this.datastr += (""+(rinfo.id[c]-1)+" ");
			if((c+1)%bd.qcols===0){ this.datastr += "\n";}
		}
	},
	//---------------------------------------------------------------------------
	// fio.rdata2Border() 入力された配列から境界線を入力する
	//---------------------------------------------------------------------------
	rdata2Border : function(isques, rdata){
		var bd = this.owner.board;
		for(var id=0;id<bd.bdmax;id++){
			var border = bd.border[id], cell1 = border.sidecell[0], cell2 = border.sidecell[1];
			var isdiff = (!cell1.isnull && !cell2.isnull && rdata[cell1.id]!=rdata[cell2.id]);
			border[(isques?'ques':'qans')] = (isdiff?1:0);
		}
	},
	//---------------------------------------------------------------------------
	// fio.decodeCellQnum51() [＼]のデコードを行う
	// fio.encodeCellQnum51() [＼]のエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellQnum51 : function(){
		var bd = this.owner.board, item = this.getItemList(bd.qrows+1);
		bd.disableInfo(); /* mv.set51cell()用 */
		for(var i=0;i<item.length;i++) {
			if(item[i]=="."){ continue;}

			var bx=(i%(bd.qcols+1)-1)*2+1, by=(((i/(bd.qcols+1))|0)-1)*2+1;
			if(bx===-1 || by===-1){
				var excell = bd.getex(bx,by);
				var property = ((excell.by===-1)?'qdir':'qnum');
				excell[property] = parseInt(item[i]);
			}
			else{
				var inp = item[i].split(",");
				var cell = bd.getc(bx,by);
				cell.set51cell();
				cell.qnum = parseInt(inp[0]);
				cell.qdir = parseInt(inp[1]);
			}
		}
		bd.enableInfo(); /* mv.set51cell()用 */
	},
	encodeCellQnum51 : function(){
		var bd = this.owner.board, str = "";
		for(var by=bd.minby+1;by<bd.maxby;by+=2){
			for(var bx=bd.minbx+1;bx<bd.maxbx;bx+=2){
				if     (bx===-1 && by===-1){ str += "0 ";}
				else if(bx===-1 || by===-1){
					var excell = bd.getex(bx,by);
					var property = ((excell.by===-1)?'qdir':'qnum');
					str += (""+excell[property].toString()+" ");
				}
				else{
					var cell = bd.getc(bx,by);
					if(cell.ques===51){
						str += (""+cell.qnum.toString()+","+cell.qdir.toString()+" ");
					}
					else{ str += ". ";}
				}
			}
			str += "\n";
		}
		this.datastr += str;
	},
	//---------------------------------------------------------------------------
	// fio.decodeCellQnum_kanpen() pencilbox用問題数字のデコードを行う
	// fio.encodeCellQnum_kanpen() pencilbox用問題数字のエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellQnum_kanpen : function(){
		this.decodeCell( function(obj,ca){
			if(ca!=="."){ obj.qnum = parseInt(ca);}
		});
	},
	encodeCellQnum_kanpen : function(){
		this.encodeCell( function(obj){
			return ((obj.qnum>=0)?(obj.qnum.toString() + " "):". ");
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeCellAnum_kanpen() pencilbox用回答数字のデコードを行う
	// fio.encodeCellAnum_kanpen() pencilbox用回答数字のエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellAnum_kanpen : function(){
		this.decodeCell( function(obj,ca){
			if(ca!=="."&&ca!=="0"){ obj.anum = parseInt(ca);}
		});
	},
	encodeCellAnum_kanpen : function(){
		this.encodeCell( function(obj){
			if     (obj.qnum!==-1){ return ". ";}
			else if(obj.anum===-1){ return "0 ";}
			else                  { return ""+obj.anum.toString()+" ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeCellQnumAns_kanpen() pencilbox用問題数字＋黒マス白マスのデコードを行う
	// fio.encodeCellQnumAns_kanpen() pencilbox用問題数字＋黒マス白マスのエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellQnumAns_kanpen : function(){
		this.decodeCell( function(obj,ca){
			if     (ca==="#"){ obj.qans = 1;}
			else if(ca==="+"){ obj.qsub = 1;}
			else if(ca!=="."){ obj.qnum = parseInt(ca);}
		});
	},
	encodeCellQnumAns_kanpen : function(){
		this.encodeCell( function(obj){
			if     (obj.qnum>=0 ){ return (obj.qnum.toString() + " ");}
			else if(obj.qans===1){ return "# ";}
			else if(obj.qsub===1){ return "+ ";}
			else                 { return ". ";}
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
			if(isques && pce[4]!=""){
				var cell = this.owner.board.getc(sp.x1,sp.y1);
				cell.qnum = parseInt(pce[4],10);
			}
			this.setRdataRect(rdata, i, sp);
		}
		this.rdata2Border(isques, rdata);

		this.owner.board.rooms.reset();
	},
	setRdataRect : function(rdata, i, sp){
		for(var bx=sp.x1;bx<=sp.x2;bx+=2){
			for(var by=sp.y1;by<=sp.y2;by+=2){
				rdata[this.owner.board.getc(bx,by).id] = i;
			}
		}
	},
	encodeSquareRoom_com : function(isques){
		var bd = this.owner.board, rinfo = bd.getRoomInfo();

		this.datastr += (rinfo.max+"\n");
		for(var id=1;id<=rinfo.max;id++){
			var d = rinfo.getclist(id).getRectSize();
			var num = (isques ? bd.rooms.getTopOfRoom(id).qnum : -1);
			this.datastr += (""+(d.y1>>1)+" "+(d.x1>>1)+" "+(d.y2>>1)+" "+(d.x2>>1)+" "+(num>=0 ? ""+num : "")+"\n");
		}
	}
});

})();
