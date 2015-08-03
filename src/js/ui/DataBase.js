// DataBase.js v3.4.0
/* global ui:false, createEL:false, getEL:false */

//---------------------------------------------------------------------------
// ★ProblemDataクラス データベースに保存する1つのデータを保持する
//---------------------------------------------------------------------------
ui.ProblemData = function(){
	this.id = null;
	this.pid = '';
	this.col = '';
	this.row = '';
	this.hard = 0;
	this.pdata = '';
	this.time = 0;
	this.comment = '';

	if(arguments.length>0){ this.parse(arguments[0]);}
};
ui.ProblemData.prototype =
{
	updatePuzzleData : function(id){
		var puzzle = ui.puzzle;
		this.id = id;
		this.pid = puzzle.pid;
		this.col = puzzle.board.qcols;
		this.row = puzzle.board.qrows;
		this.pdata = puzzle.getFileData(pzpr.parser.FILE_PZPR).replace(/\r?\n/g,"/");
		this.time = (pzpr.util.currentTime()/1000)|0;
	},
	getFileData : function(){
		return this.pdata.replace(/\//g,"\n");
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
};

//---------------------------------------------------------------------------
// ★Popup_DataBaseクラス データベース用ポップアップメニューの作成を行う
//---------------------------------------------------------------------------
ui.popupmgr.addpopup('database',
{
	formname : 'database',
	
	show : function(px,py){
		ui.popupmgr.popups.template.show.call(this,px,py);
		ui.database.openDialog();
	},
	close : function(){
		ui.database.closeDialog();
		ui.popupmgr.popups.template.close.call(this);
	},

	//---------------------------------------------------------------------------
	// database_handler() データベースmanagerへ処理を渡します
	//---------------------------------------------------------------------------
	database_handler : function(e){
		ui.database.clickHandler(e.target.name);
	}
});

//---------------------------------------------------------------------------
// ★DataBaseManagerクラス Web Storage用 データベースの設定・管理を行う
//---------------------------------------------------------------------------
ui.database = {
	dbh    : null,	// データベースハンドラ

	DBsid  : -1,	// 現在選択されているリスト中のID
	DBlist : [],	// 現在一覧にある問題のリスト

	sync   : false,	// 一覧がDataBaseのデータと合っているかどうかを表す

	update : function(){ ui.database.updateDialog();},

	//---------------------------------------------------------------------------
	// dbm.openDialog()   データベースダイアログが開いた時の処理
	// dbm.closeDialog()  データベースダイアログが閉じた時の処理
	//---------------------------------------------------------------------------
	openDialog : function(){
		// データベースを開く
		if(pzpr.env.storage.localST){ this.dbh = new ui.DataBaseHandler_LS(this);}
		else{ return;}

		this.sync = false;
		this.dbh.convert();
		this.dbh.importDBlist();
	},
	closeDialog : function(){
		this.DBlist = [];
	},

	//---------------------------------------------------------------------------
	// dbm.clickHandler()  フォーム上のボタンが押された時、各関数にジャンプする
	//---------------------------------------------------------------------------
	clickHandler : function(name){
		if(this.sync===false){ return;}
		switch(name){
			case 'sorts'   : this.displayDataTableList();	// breakがないのはわざとです
			/* falls through */
			case 'datalist': this.selectDataTable(); break;
			case 'tableup' : this.upDataTable();     break;
			case 'tabledn' : this.downDataTable();   break;
			case 'open'    : this.openDataTable();   break;
			case 'save'    : this.saveDataTable();   break;
			case 'overwrite' : this.saveDataTable(); break;
			case 'updateinfo': this.updateInfo();    break;
			case 'del'     : this.deleteDataTable(); break;
		}
	},

	//---------------------------------------------------------------------------
	// dbm.getDataID()    選択中データの(this.DBlistのkeyとなる)IDを取得する
	// dbm.updateDialog() 管理テーブル情報やダイアログの表示を更新する
	//---------------------------------------------------------------------------
	getDataID : function(){
		/* jshint eqeqeq:false */
		var val = document.database.datalist.value;
		if(val!=="new" && val!==""){
			for(var i=0;i<this.DBlist.length;i++){
				if(this.DBlist[i].id==val){ return i;}
			}
		}
		return -1;
	},
	updateDialog : function(){
		this.dbh.updateManageData();
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
		this.appendNewOption(-1, ui.selectStr("&nbsp;&lt;新しく保存する&gt;","&nbsp;&lt;New Save&gt;"));
	},
	appendNewOption : function(id, str){
		/* jshint eqeqeq:false */
		var opt = createEL('option');
		opt.setAttribute('value', (id!=-1 ? id : "new"));
		opt.innerHTML = str;
		if(this.DBsid==id){ opt.setAttribute('selected', "selected");}

		document.database.datalist.appendChild(opt);
	},
	getRowString : function(row){
		/* jshint eqeqeq:false */
		var hardstr = [
			{ja:'−'      , en:'-'     },
			{ja:'らくらく', en:'Easy'  },
			{ja:'おてごろ', en:'Normal'},
			{ja:'たいへん', en:'Hard'  },
			{ja:'アゼン'  , en:'Expert'}
		];

		var str = "";
		str += ((row.id<10?"&nbsp;":"")+row.id+" :&nbsp;");
		str += (pzpr.variety.info[row.pid][ui.getConfig('language')]+"&nbsp;");
		str += (""+row.col+"×"+row.row+" &nbsp;");
		if(!!row.hard || row.hard=='0'){
			str += (hardstr[row.hard][ui.getConfig('language')]+"&nbsp;");
		}
		str += ("("+this.dateString(row.time*1000)+")");
		return str;
	},
	dateString : function(time){
		function ni(num){ return (num<10?"0":"")+num;}
		var date = new Date();
		date.setTime(time);
		return (ni(date.getFullYear()%100)+"/"+ni(date.getMonth()+1)+"/"+ni(date.getDate())+ " " +
				ni(date.getHours()) + ":" + ni(date.getMinutes()));
	},

	//---------------------------------------------------------------------------
	// dbm.selectDataTable() データを選択して、コメントなどを表示する
	//---------------------------------------------------------------------------
	selectDataTable : function(){
		var selected = this.getDataID(), form = document.database, item;
		if(selected>=0){
			item = this.DBlist[selected];
			getEL("database_cand").innerHTML = "";
		}
		else{
			item = new ui.ProblemData();
			item.updatePuzzleData(-1);
			getEL("database_cand").innerHTML = ui.selectStr("(新規保存)", "(Candidate)");
		}
		form.comtext.value = ""+item.comment;
		form.hard.value    = ""+item.hard;
		getEL("database_variety").innerHTML = pzpr.variety.info[item.pid][ui.getConfig('language')] + "&nbsp;" + item.col+"×"+item.row;
		getEL("database_date").innerHTML    = this.dateString(item.time*1000);

		var sid = this.DBsid = parseInt(item.id); /* selected id */
		var sortbyid = (form.sorts.value==='idlist');
		form.tableup.disabled = (!sortbyid || sid===-1 || sid===1);
		form.tabledn.disabled = (!sortbyid || sid===-1 || sid===this.DBlist.length);
		form.updateinfo.disabled = (sid===-1);
		form.open.style.color = (sid===-1 ? "silver" : "");
		form.del.style.color  = (sid===-1 ? "silver" : "");
		form.save.style.display      = (sid===-1 ? "" : "none");
		form.overwrite.style.display = (sid===-1 ? "none" : "");
	},

	//---------------------------------------------------------------------------
	// dbm.upDataTable()      データの一覧での位置をひとつ上にする
	// dbm.downDataTable()    データの一覧での位置をひとつ下にする
	// dbm.convertDataTable() データの一覧での位置を入れ替える
	//---------------------------------------------------------------------------
	upDataTable : function(){
		var selected = this.getDataID();
		if(selected===-1 || selected===0){ return;}
		this.convertDataTable(selected, selected-1);
	},
	downDataTable : function(){
		var selected = this.getDataID();
		if(selected===-1 || selected===this.DBlist.length-1){ return;}
		this.convertDataTable(selected, selected+1);
	},
	convertDataTable : function(sid, tid){
		this.DBsid = this.DBlist[tid].id;

		/* idプロパティ以外を入れ替える */
		var id = this.DBlist[sid].id;
		this.DBlist[sid].id = this.DBlist[tid].id;
		this.DBlist[tid].id = id;
		var row = this.DBlist[sid];
		this.DBlist[sid] = this.DBlist[tid];
		this.DBlist[tid] = row;

		this.sync = false;
		this.dbh.saveItem(sid, tid);
	},

	//---------------------------------------------------------------------------
	// dbm.openDataTable()  データの盤面に読み込む
	// dbm.saveDataTable()  データの盤面を保存/上書きする
	//---------------------------------------------------------------------------
	openDataTable : function(){
		var id = this.getDataID(); if(id===-1){ return;}
		var filestr = this.DBlist[id].getFileData();
		ui.notify.confirm("このデータを読み込みますか？ (現在の盤面は破棄されます)",
						  "Recover selected data? (Current board is erased)",
						  function(){ ui.puzzle.open(filestr);});
	},
	saveDataTable : function(){
		var id = this.getDataID(), dbm = this;
		function refresh(){
			var list = dbm.DBlist, item = list[id];
			if(id===-1){ /* newSave */
				id = list.length;
				item = list[id] = new ui.ProblemData();
				item.comment = document.database.comtext.value;
				item.hard    = document.database.hard.value;
			}
			item.updatePuzzleData(id+1);
			dbm.DBsid = item.id;
			
			dbm.sync = false;
			dbm.dbh.saveItem(id);
		}
		
		if(id===-1){ refresh();}
		else       { ui.notify.confirm("このデータに上書きしますか？","Overwrite selected data?", refresh);}
	},

	//---------------------------------------------------------------------------
	// dbm.editComment()   データのコメントを更新する
	// dbm.editDifficult() データの難易度を更新する
	//---------------------------------------------------------------------------
	updateInfo : function(){
		var id = this.getDataID(); if(id===-1){ return;}

		this.DBlist[id].comment = document.database.comtext.value;
		this.DBlist[id].hard    = document.database.hard.value;

		this.sync = false;
		this.dbh.saveItem(id);
	},

	//---------------------------------------------------------------------------
	// dbm.deleteDataTable() 選択している盤面データを削除する
	//---------------------------------------------------------------------------
	deleteDataTable : function(){
		var id = this.getDataID(), dbm = this; if(id===-1){ return;}
		ui.notify.confirm("このデータを完全に削除しますか？","Delete selected data?", function(){
			var list = dbm.DBlist, sID = list[id].id, max = list.length;
			for(var i=sID-1;i<max-1;i++){ list[i] = list[i+1]; list[i].id--;}
			list.pop();

			dbm.sync = false;
			dbm.dbh.deleteItem(sID, max);
		});
	}
};

//---------------------------------------------------------------------------
// ★DataBaseHandler_LSクラス Web localStorage用 データベースハンドラ
//---------------------------------------------------------------------------
ui.DataBaseHandler_LS = function(parent){
	this.pheader = 'pzprv3_storage:data:';
	this.parent = parent;

	this.createManageDataTable();
	this.createDataBase();
};
ui.DataBaseHandler_LS.prototype =
{
	//---------------------------------------------------------------------------
	// dbm.dbh.importDBlist()  DataBaseからDBlistを作成する
	//---------------------------------------------------------------------------
	importDBlist : function(){
		this.parent.DBlist = [];
		for(var i=1;true;i++){
			var row = new ui.ProblemData(localStorage[this.pheader+i]);
			if(row.id===null){ break;}
			this.parent.DBlist.push(row);
		}
		this.parent.update();
	},

	//---------------------------------------------------------------------------
	// dbm.dbh.createManageDataTable() 管理情報テーブルを作成する(消去はなし)
	// dbm.dbh.updateManageData()      管理情報レコードを更新する
	//---------------------------------------------------------------------------
	createManageDataTable : function(){
		localStorage['pzprv3_storage:version'] = '2.0';
	},
	updateManageData : function(){
		localStorage['pzprv3_storage:count'] = this.parent.DBlist.length;
		localStorage['pzprv3_storage:time']  = (pzpr.util.currentTime()/1000)|0;
	},

	//---------------------------------------------------------------------------
	// dbm.dbh.createDataBase()     テーブルを作成する
	//---------------------------------------------------------------------------
	createDataBase : function(){
	},

	//---------------------------------------------------------------------------
	// dbm.dbh.saveItem() databaseの指定されたIDを保存する
	//---------------------------------------------------------------------------
	saveItem : function(){
		var args = arguments;
		for(var i=0;i<args.length;i++){
			var item = this.parent.DBlist[args[i]];
			localStorage[this.pheader+item.id] = item.toString();
		}
		this.parent.update();
	},

	//---------------------------------------------------------------------------
	// dbm.dbh.deleteItem() 選択している盤面データを削除する
	//---------------------------------------------------------------------------
	deleteItem : function(sID, max){
		for(var i=parseInt(sID);i<max;i++){
			var data = new ui.ProblemData(localStorage[this.pheader+(i+1)]);
			data.id--;
			localStorage[this.pheader+i] = data.toString();
		}
		localStorage.removeItem(this.pheader+max);
		this.parent.update();
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
		for(var pid in pzpr.variety.info){ // いらないのもあるけど、問題ないのでOK
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
				var row = new ui.ProblemData();
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
		localStorage['pzprv3_storage:time']  = (pzpr.util.currentTime()/1000)|0;
		for(var i=0;i<puzzles.length;i++){
			puzzles[i].id = (i+1);
			localStorage['pzprv3_storage:data:'+(i+1)] = puzzles[i].toString();
		}
	}
};
