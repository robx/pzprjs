// Boot.js v3.4.0

(function(){

var k = pzprv3.consts;


//---------------------------------------------------------------------------
// ★Popup_Debugクラス  poptest関連のポップアップメニュー表示用
//---------------------------------------------------------------------------
pzprv3.createCoreClass('Popup_Debug:PopupMenu',
{
	formname : 'testform',
	
	initialize : function(puzzle){
		pzprv3.core.PopupMenu.prototype.initialize.call(this,puzzle);
		this.makeElement();
		this.makeForm();
		this.setEvent();
	},
	
	//------------------------------------------------------------------------------
	// makeForm() URL入力のポップアップメニューを作成する
	//------------------------------------------------------------------------------
	makeForm : function(){
		this.settitle("pop_test", "pop_test");
		
		this.addTextArea({name:"testarea", id:"testarea", cols:'40', rows:'16', wrap:'off'});
		this.form.testarea.style.fontSize = '10pt';
		this.addBR();
		
		var debug = pzprv3.debug;
		this.addExecButton("テスト", "Test", function(){ debug.starttest();}, {name:'starttest'});
		this.form.starttest.style.display = 'none';
		this.addText(" ", " ");
		
		this.addExecButton("T1", "T1", function(){ debug.perfeval();});
		this.addExecButton("T2", "T2", function(){ debug.painteval()});
		this.addExecButton("T3", "T3", function(){ debug.resizeeval()});
		this.addText(" ", " ");
		
		if(this.puzzle.pid==='country'){
			this.addExecButton("Perf", "Perf", function(){ debug.loadperf();});
		}
		this.addExecButton("img", "img", function(){ debug.adjustimage();});
		if(pzprv3.storage.localST){
			this.addExecButton("DB", "DB", function(){ debug.dispdatabase();});
		}
		this.addBR();
		
		this.addExecButton("Save", "Save", function(){ debug.filesave()});
		if(pzprv3.ui.ispencilbox){
			this.addExecButton("PBSave", "PBSave", function(){ debug.filesave_pencilbox()});
		}
		this.addText(" ", " ");
		
		this.addExecButton("Load", "Load", function(){ debug.fileopen();});
		this.addExecButton("消去", "Cls", function(){ debug.erasetext();});
		this.addCancelButton();

		if(pzprv3.debugmode){ this.testonly_func();}	/* テスト用 */
	},
	
	show : function(px,py){
		var _pop_style = this.pop.style;
		_pop_style.display = 'inline';
		_pop_style.left = '40px';
		_pop_style.top  = '80px';

		/* デバッグ対象に設定 */
		pzprv3.debug.settarget(this.puzzle);
	}
});

//---------------------------------------------------------------------------
// ★Debugクラス  poptest関連の実行関数など
//---------------------------------------------------------------------------
pzprv3.createCoreClass('Debug',
{
	targetowner : null,
	settarget : function(puzzle){
		this.targetowner = puzzle;
	},

	// debugmode===true時はオーバーライドされます
	keydown : function(ca){
		var kc = this.targetowner.key;
		if(kc.isCTRL && ca=='F8'){
			pzprv3.ui.popups.debug.show();
			kc.tcMoved = true;
			return true;
		}
		return false;
	},

	filesave : function(){
		this.setTA(this.targetowner.fio.fileencode(k.PZPH).replace(/\//g,"\n"));
		this.addTA(this.targetowner.fio.history.replace(/\//g,"\n").replace(/\[\[slash\]\]/g,"/"));
	},
	filesave_pencilbox : function(){
		this.setTA(this.targetowner.fio.fileencode(k.PBOX).replace(/\//g,"\n"));
	},

	fileopen : function(){
		var dataarray = this.getTA().replace(/\//g,"[[slash]]").split("\n");
		var owner = this.targetowner;
		owner.openByFileData(data.pdata);
		owner.waitReady(function(){
			pzprv3.ui.menuinit(owner.config);	/* メニュー関係初期化 */
			pzprv3.event.setEvents();			/* イベントをくっつける */
			pzprv3.timer.reset();				/* タイマーリセット(最後) */
		});
	},

	erasetext : function(){
		this.setTA('');
		if(pzprv3.debugmode){ pzprv3.getEL('testdiv').innerHTML = '';}
	},

	perfeval : function(){
		var ans = this.targetowner.checker;
		this.timeeval("正答判定測定", function(){ ans.checkAns();});
	},
	painteval : function(){
		var pc = this.targetowner.painter;
		this.timeeval("描画時間測定", function(){ pc.paintAll();});
	},
	resizeeval : function(){
		var pc = this.targetowner.painter;
		this.timeeval("resize描画測定", function(){ pc.forceRedraw();});
	},
	timeeval : function(text,func){
		this.addTA(text);
		var count=0, old = pzprv3.currentTime();
		while(pzprv3.currentTime() - old < 3000){
			count++;

			func();
		}
		var time = pzprv3.currentTime() - old;

		this.addTA("測定データ "+time+"ms / "+count+"回\n"+"平均時間   "+(time/count)+"ms")
	},

	dispdatabase : function(){
		var text = "";
		for(var i=0;i<localStorage.length;i++){
			var key = localStorage.key(i);
			text += (""+key+" "+localStorage[key]+"\n");
		}
		this.setTA(text);
	},

	loadperf : function(){
		var owner = this.targetowner;
		owner.openByFileData("pzprv3/country/10/18/44/0 0 1 1 1 2 2 2 3 4 4 4 5 5 6 6 7 8 /0 9 1 10 10 10 11 2 3 4 12 4 4 5 6 13 13 8 /0 9 1 1 10 10 11 2 3 12 12 12 4 5 14 13 13 15 /0 9 9 9 10 16 16 16 16 17 12 18 4 5 14 13 15 15 /19 19 19 20 20 20 21 17 17 17 22 18 18 14 14 23 23 24 /19 25 25 26 26 21 21 17 22 22 22 18 27 27 27 24 24 24 /28 28 29 26 30 31 21 32 22 33 33 33 33 34 35 35 35 36 /28 29 29 26 30 31 32 32 32 37 38 39 34 34 40 40 35 36 /41 29 29 42 30 31 31 32 31 37 38 39 34 34 34 40 35 36 /41 43 42 42 30 30 31 31 31 37 38 38 38 40 40 40 36 36 /3 . 6 . . 4 . . 2 . . . . . . . . 1 /. . . 5 . . . . . . . . . . . . . . /. . . . . . . . . 1 . . . . . . . . /. . . . . . . . . . . . . . . . . . /3 . . 2 . . . 4 . . . . . . . . . . /. . . 3 . . . . 4 . . . 2 . . . . . /. . . . 3 6 . . . 4 . . . . . . . . /. 5 . . . . . . . 2 . . 3 . . . . . /. . . . . . . . . . . . . . . . . . /. . . . . . . . . . . . . . . . 5 . /0 0 1 1 0 0 1 0 0 1 1 0 0 0 1 1 0 /1 0 0 0 1 0 0 0 1 0 0 1 0 0 0 0 1 /0 0 1 0 1 0 0 1 0 0 0 0 0 0 0 0 0 /0 1 1 0 0 0 1 0 0 1 1 0 1 0 0 0 1 /1 1 0 0 1 0 0 1 1 0 0 0 0 1 0 1 0 /0 1 0 1 0 1 0 0 1 1 1 0 1 0 0 1 1 /1 0 1 0 0 0 0 1 0 1 1 1 0 0 1 1 0 /0 1 0 0 0 0 1 0 0 0 0 1 1 0 1 0 0 /0 1 1 0 1 1 0 0 1 0 1 0 0 0 0 0 0 /1 1 1 0 0 0 1 1 0 0 1 1 1 1 1 0 1 /0 0 1 0 1 0 1 1 0 1 0 1 0 0 1 0 1 0 /1 1 1 0 0 1 1 1 1 0 0 0 1 0 1 0 0 1 /1 1 0 1 1 0 1 0 0 0 0 0 1 0 1 0 0 1 /1 0 0 0 1 0 0 1 0 1 0 1 0 1 1 0 1 0 /0 0 1 0 0 1 0 0 0 0 0 1 0 0 0 1 0 0 /0 1 0 1 1 0 1 0 1 0 0 0 1 1 0 0 0 1 /1 0 1 0 1 0 1 1 0 1 0 0 0 1 1 0 1 1 /1 1 0 0 1 0 0 0 0 1 0 1 0 0 0 1 1 1 /1 0 0 1 0 0 1 0 1 0 1 0 0 0 0 1 1 1 /2 2 1 1 1 2 0 0 2 0 1 0 0 0 0 0 0 2 /1 1 1 2 1 1 0 0 0 1 2 1 0 0 1 2 0 0 /1 0 1 1 1 1 0 0 1 2 2 2 1 0 1 2 2 0 /1 0 0 1 1 2 1 0 2 1 1 1 1 0 1 2 1 0 /1 1 0 2 1 1 2 0 0 0 2 1 2 1 1 1 0 2 /2 1 0 1 1 1 0 2 0 0 0 0 1 1 2 1 0 0 /1 0 1 1 1 2 1 1 0 0 0 0 0 0 1 0 0 0 /0 1 1 2 1 2 1 1 2 1 2 0 1 0 1 0 0 0 /0 1 1 0 1 1 1 2 0 1 0 1 2 2 2 1 0 0 /0 0 0 1 2 2 1 1 0 2 0 0 1 0 1 0 0 0 /");
		owner.waitReady(function(){
			owner.setConfig('mode',3);
			owner.setConfig('irowake',true);
			
			pzprv3.ui.menuinit(owner.config);	/* メニュー関係初期化 */
			pzprv3.event.setEvents();			/* イベントをくっつける */
			pzprv3.timer.reset();				/* タイマーリセット(最後) */
		});
	},

	adjustimage : function(){
		var col = this.targetowner.board.qcols, size = 17;
		if     (col<= 6){ size = 28;}
		else if(col<= 8){ size = 27;}
		else if(col<= 8){ size = 24;}
		else if(col<= 9){ size = 21;}
		else if(col<=18){ size = 19;}
		pzprv3.ui.imagesave(false,size);
	},

	getTA : function(){ return document.testform.testarea.value;},
	setTA : function(str){ document.testform.testarea.value  = str;},
	addTA : function(str){ document.testform.testarea.value += (str+"\n");}
});

})();
