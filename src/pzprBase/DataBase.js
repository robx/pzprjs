// DataBase.js v3.3.2

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
			case 'idlist' : this.DBlist = this.DBlist.sort(function(a,b){ return (a.id-b.id);}); break;
			case 'newsave': this.DBlist = this.DBlist.sort(function(a,b){ return (b.time-a.time || a.id-b.id);}); break;
			case 'oldsave': this.DBlist = this.DBlist.sort(function(a,b){ return (a.time-b.time || a.id-b.id);}); break;
			case 'size'   : this.DBlist = this.DBlist.sort(function(a,b){ return (a.col-b.col || a.row-b.row || a.hard-b.hard || a.id-b.id);}); break;
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
			{ja:'−'       , en:'-'     },
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
