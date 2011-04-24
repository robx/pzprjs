// DataBase.js v3.4.0

//---------------------------------------------------------------------------
// ★ProblemDataクラス データベースに保存する1つのデータを保持する
//---------------------------------------------------------------------------
pzprv3.createCoreClass('ProblemData',
{
	initialize : function(){
		this.id = null;
		this.pid = '';
		this.col = '';
		this.row = '';
		this.hard = 0;
		this.pdata = '';
		this.time = 0;
		this.comment = '';

		if(arguments.length>0){ this.parse(arguments[0]);}
	},
	setnewData : function(id){
		this.id = id;
		this.pid = bd.puzzleid;
		this.col = bd.qcols;
		this.row = bd.qrows;
		this.hard = 0;
		this.pdata = fio.fileencode(fio.PZPH);
		this.time = (pzprv3.timer.now()/1000)|0;
		this.comment = '';
	},
	toString : function(){
		var data = {
			id:this.id, pid:this.pid,
			col:this.col, row:this.row,
			hard:this.hard, pdata:this.pdata,
			time:this.time, comment:this.comment
		};
		return JSON.stringify(data);
	},
	parse : function(str){
		if(str===(void 0)){ this.id=null; return this;}
		var data = JSON.parse(str);
		for(var key in data){ this[key]=data[key];}
		return this;
	}
});

//---------------------------------------------------------------------------
// ★DataBaseManagerクラス Web Storage用 データベースの設定・管理を行う
//---------------------------------------------------------------------------
pzprv3.createCoreClass('DataBaseManager',
{
	initialize : function(){
		this.dbh    = null;	// データベースハンドラ

		this.DBsid  = -1;	// 現在選択されているリスト中のID
		this.DBlist = [];	// 現在一覧にある問題のリスト

		var self    = this;
		this.update = function(){ self.updateDialog.call(self);};
		this.sync   = false;
	},

	//---------------------------------------------------------------------------
	// dbm.openDialog() データベースダイアログが開いた時の処理
	//---------------------------------------------------------------------------
	openDialog : function(){
		// データベースを開く
		if(ee.storage.localST){ this.dbh = new pzprv3.core.DataBaseHandler_LS();}
		else{ return;}

		this.sync = false;
		this.dbh.convert();
		this.dbh.importDBlist(this, this.update);
	},

	//---------------------------------------------------------------------------
	// dbm.closeDialog()   データベースダイアログが閉じた時の処理
	// dbm.clickHandler()  フォーム上のボタンが押された時、各関数にジャンプする
	//---------------------------------------------------------------------------
	closeDialog : function(){
		this.DBlist = [];
	},
	clickHandler : function(e){
		if(this.sync===false){ return;}
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
	// dbm.getDataID()    選択中データの(this.DBlistのkeyとなる)IDを取得する
	// dbm.updateDialog() 管理テーブル情報やダイアログの表示を更新する
	//---------------------------------------------------------------------------
	getDataID : function(){
		var val = document.database.datalist.value;
		if(val!="new" && val!=""){
			for(var i=0;i<this.DBlist.length;i++){
				if(this.DBlist[i].id==val){ return i;}
			}
		}
		return -1;
	},
	updateDialog : function(){
		this.dbh.updateManageData(this);
		this.displayDataTableList();
		this.selectDataTable();
		this.sync = true;
	},

	//---------------------------------------------------------------------------
	// dbm.displayDataTableList() 保存しているデータの一覧を表示する
	// dbm.appendNewOption()      option要素を生成する
	// dbm.getRowString()         1データから文字列を生成する
	// dbm.dateString()           時刻の文字列を生成する
	//---------------------------------------------------------------------------
	displayDataTableList : function(){
		switch(document.database.sorts.value){
			case 'idlist' : this.DBlist = this.DBlist.sort(function(a,b){ return (a.id-b.id);}); break;
			case 'newsave': this.DBlist = this.DBlist.sort(function(a,b){ return (b.time-a.time || a.id-b.id);}); break;
			case 'oldsave': this.DBlist = this.DBlist.sort(function(a,b){ return (a.time-b.time || a.id-b.id);}); break;
			case 'size'   : this.DBlist = this.DBlist.sort(function(a,b){ return (a.col-b.col || a.row-b.row || a.hard-b.hard || a.id-b.id);}); break;
		}

		document.database.datalist.innerHTML = "";
		for(var i=0;i<this.DBlist.length;i++){
			var row = this.DBlist[i];
			if(!!row){ this.appendNewOption(row.id, this.getRowString(row));}
		}
		this.appendNewOption(-1, "&nbsp;&lt;新しく保存する&gt;");
	},
	appendNewOption : function(id, str){
		var opt = document.createElement('option');
		opt.setAttribute('value', (id!=-1 ? id : "new"));
		opt.innerHTML = str;
		if(this.DBsid==id){ opt.setAttribute('selected', "selected");}

		document.database.datalist.appendChild(opt);
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
		str += (pzprv3.PZLINFO.info[row.pid].ja+"&nbsp;");
		str += (""+row.col+"×"+row.row+" &nbsp;");
		if(!!row.hard || row.hard=='0'){
			str += (hardstr[row.hard][menu.language]+"&nbsp;");
		}
		str += ("("+this.dateString(row.time*1000)+")");
		return str;
	},
	dateString : function(time){
		var ni   = function(num){ return (num<10?"0":"")+num;};
		var str  = "";
		var date = new Date();
		date.setTime(time);

		str += (ni(date.getFullYear()%100) + "/" + ni(date.getMonth()+1) + "/" + ni(date.getDate())+" ");
		str += (ni(date.getHours()) + ":" + ni(date.getMinutes()));
		return str;
	},

	//---------------------------------------------------------------------------
	// dbm.selectDataTable() データを選択して、コメントなどを表示する
	//---------------------------------------------------------------------------
	selectDataTable : function(){
		var selected = this.getDataID(), _doc = document;
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
	// dbm.upDataTable_M()      データの一覧での位置をひとつ上にする
	// dbm.downDataTable_M()    データの一覧での位置をひとつ下にする
	// dbm.convertDataTable_M() データの一覧での位置を入れ替える
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
		var id = this.DBlist[sid].id;
		this.DBlist[sid].id = this.DBlist[tid].id;
		this.DBlist[tid].id = id;
		var row = this.DBlist[sid];
		this.DBlist[sid] = this.DBlist[tid];
		this.DBlist[tid] = row;

		this.sync = false;
		this.dbh.convertDataTableID(this, sid, tid, this.update);
	},

	//---------------------------------------------------------------------------
	// dbm.openDataTable_M()  データの盤面に読み込む
	// dbm.saveDataTable_M()  データの盤面を保存する
	//---------------------------------------------------------------------------
	openDataTable_M : function(){
		var id = this.getDataID(); if(id===-1){ return;}
		if(!confirm("このデータを読み込みますか？ (現在の盤面は破棄されます)")){ return;}

		this.dbh.openDataTable(this, id, null);
	},
	saveDataTable_M : function(){
		var id = this.getDataID(), refresh = false;
		if(id===-1){
			id = this.DBlist.length;
			refresh = true;

			this.DBlist[id] = new pzprv3.core.ProblemData();
			this.DBlist[id].setnewData(id+1);
			var str = prompt("コメントがある場合は入力してください。","");
			this.DBlist[id].comment = (!!str ? str : '');
			this.DBsid = this.DBlist[id].id;
		}
		else{
			if(!confirm("このデータに上書きしますか？")){ return;}
		}

		this.sync = false;
		this.dbh.saveDataTable(this, id, this.update);
	},

	//---------------------------------------------------------------------------
	// dbm.editComment_M()   データのコメントを更新する
	// dbm.editDifficult_M() データの難易度を更新する
	//---------------------------------------------------------------------------
	editComment_M : function(){
		var id = this.getDataID(); if(id===-1){ return;}

		var str = prompt("この問題に対するコメントを入力してください。",this.DBlist[id].comment);
		if(str==null){ return;}
		this.DBlist[id].comment = str;

		this.sync = false;
		this.dbh.updateComment(this, id, this.update);
	},
	editDifficult_M : function(){
		var id = this.getDataID(); if(id===-1){ return;}

		var hard = prompt("この問題の難易度を設定してください。\n[0:なし 1:らくらく 2:おてごろ 3:たいへん 4:アゼン]",this.DBlist[id].hard);
		if(hard==null){ return;}
		this.DBlist[id].hard = ((hard=='1'||hard=='2'||hard=='3'||hard=='4')?hard:0);

		this.sync = false;
		this.dbh.updateDifficult(this, id, this.update);
	},

	//---------------------------------------------------------------------------
	// dbm.deleteDataTable_M() 選択している盤面データを削除する
	//---------------------------------------------------------------------------
	deleteDataTable_M : function(){
		var id = this.getDataID(); if(id===-1){ return;}
		if(!confirm("このデータを完全に削除しますか？")){ return;}

		var sID = this.DBlist[id].id, max = this.DBlist.length;
		for(var i=sID-1;i<max-1;i++){ this.DBlist[i] = this.DBlist[i+1]; this.DBlist[i].id--;}
		this.DBlist.pop();

		this.sync = false;
		this.dbh.deleteDataTable(this, sID, max, this.update);
	}
});

//---------------------------------------------------------------------------
// ★DataBaseHandler_LSクラス Web localStorage用 データベースハンドラ
//---------------------------------------------------------------------------
pzprv3.createCoreClass('DataBaseHandler_LS',
{
	//---------------------------------------------------------------------------
	// dbm.dbh.initialize()    初期化時にデータベースを開く
	// dbm.dbh.importDBlist()  DataBaseからDBlistを作成する
	//---------------------------------------------------------------------------
	initialize : function(){
		this.pheader = 'pzprv3_storage:data:';

		this.createManageDataTable();
		this.createDataBase();
	},
	importDBlist : function(parent, callback){
		parent.DBlist = [];
		for(var i=1;true;i++){
			var row = new pzprv3.core.ProblemData(localStorage[this.pheader+i]);
			if(row.id==null){ break;}
			parent.DBlist.push(row);
		}
		if(!!callback){ callback();}
	},

	//---------------------------------------------------------------------------
	// dbm.dbh.createManageDataTable() 管理情報テーブルを作成する(消去はなし)
	// dbm.dbh.updateManageData()      管理情報レコードを更新する
	//---------------------------------------------------------------------------
	createManageDataTable : function(){
		localStorage['pzprv3_storage:version'] = '2.0';
	},
	updateManageData : function(parent){
		localStorage['pzprv3_storage:count'] = parent.DBlist.length;
		localStorage['pzprv3_storage:time']  = (pzprv3.timer.now()/1000)|0;
	},

	//---------------------------------------------------------------------------
	// dbm.dbh.createDataBase()     テーブルを作成する
	//---------------------------------------------------------------------------
	createDataBase : function(){
	},

	//---------------------------------------------------------------------------
	// dbm.dbh.convertDataTableID() データのIDを付け直す
	//---------------------------------------------------------------------------
	convertDataTableID : function(parent, sid, tid, callback){
		var sID = parent.DBlist[sid].id, tID = parent.DBlist[tid].id;
		localStorage[this.pheader+sID] = parent.DBlist[sid].toString();
		localStorage[this.pheader+tID] = parent.DBlist[tid].toString();
		if(!!callback){ callback();}
	},

	//---------------------------------------------------------------------------
	// dbm.dbh.openDataTable()   データの盤面に読み込む
	// dbm.dbh.saveDataTable()   データの盤面を保存する
	//---------------------------------------------------------------------------
	openDataTable : function(parent, id, callback){
		var data = new pzprv3.core.ProblemData(localStorage[this.pheader+parent.DBlist[id].id]);
		menu.ex.fileonload(data.pdata);
		if(!!callback){ callback();}
	},
	saveDataTable : function(parent, id, callback){
		parent.DBlist[id].pdata = fio.fileencode(fio.PZPH);
		localStorage[this.pheader+parent.DBlist[id].id] = parent.DBlist[id].toString();
		if(!!callback){ callback();}
	},

	//---------------------------------------------------------------------------
	// dbm.dbh.updateComment()   データのコメントを更新する
	// dbm.dbh.updateDifficult() データの難易度を更新する
	//---------------------------------------------------------------------------
	updateComment : function(parent, id, callback){
		localStorage[this.pheader+parent.DBlist[id].id] = parent.DBlist[id].toString();
		if(!!callback){ callback();}
	},
	updateDifficult : function(parent, id, callback){
		localStorage[this.pheader+parent.DBlist[id].id] = parent.DBlist[id].toString();
		if(!!callback){ callback();}
	},
	//---------------------------------------------------------------------------
	// dbm.dbh.deleteDataTable() 選択している盤面データを削除する
	//---------------------------------------------------------------------------
	deleteDataTable : function(parent, sID, max, callback){
		for(var i=parseInt(sID);i<max;i++){
			var data = new pzprv3.core.ProblemData(localStorage[this.pheader+(i+1)]);
			data.id--;
			localStorage[this.pheader+i] = data.toString();
		}
		localStorage.removeItem(this.pheader+max);
		if(!!callback){ callback();}
	},

	//---------------------------------------------------------------------------
	// dbm.dbh.convert() データ形式をコンバート
	//---------------------------------------------------------------------------
	convert : function(){
		var keys=['id', 'col', 'row', 'hard', 'pdata', 'time', 'comment'];
		if(!localStorage['pzprv3_manage']){ return;}

		var timemax=0, countall=0;
		delete localStorage['pzprv3_manage'];
		delete localStorage['pzprv3_manage:manage'];

		var puzzles = [];
		for(var pid in pzprv3.PZLINFO.info){ // いらないのもあるけど、問題ないのでOK
			if(!localStorage['pzprv3_'+pid]){ continue;}
			var mheader = 'pzprv3_manage:manage!'+pid+'!';
			var count = localStorage[mheader+'count'];
			var ptime = localStorage[mheader+'time'];
			delete localStorage[mheader+'count'];
			delete localStorage[mheader+'time'];

			if(ptime > timemax){ ptime = timemax;}
			countall += count;

			delete localStorage['pzprv3_'+pid];
			delete localStorage['pzprv3_'+pid+':puzdata'];
			for(var i=0;i<count;i++){
				var pheader = 'pzprv3_'+pid+':puzdata!'+(i+1)+'!';
				var row = new pzprv3.core.ProblemData();
				row.pid = pid;
				for(var c=0;c<7;c++){
					row[keys[c]] = localStorage[pheader+keys[c]];
					delete localStorage[pheader+keys[c]];
				}
				puzzles.push(row);
			}
		}

		puzzles.sort(function(a,b){ return (a.time-b.time || a.id-b.id);});
		localStorage['pzprv3_storage:version'] = '2.0';
		localStorage['pzprv3_storage:count'] = puzzles.length;
		localStorage['pzprv3_storage:time']  = (pzprv3.timer.now()/1000)|0;
		for(var i=0;i<puzzles.length;i++){
			puzzles[i].id = (i+1);
			localStorage['pzprv3_storage:data:'+(i+1)] = puzzles[i].toString();
		}
	}
});
