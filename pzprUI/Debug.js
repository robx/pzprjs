// Boot.js v3.4.0

(function(){

/* uiオブジェクト生成待ち */
if(!ui || !ui.popupmgr){ setTimeout(setTimeout(arguments.callee),15); return;}

var k = pzprv3.consts;

//---------------------------------------------------------------------------
// ★Popup_Debugクラス  poptest関連のポップアップメニュー表示用
//---------------------------------------------------------------------------
ui.popupmgr.addpopup('debug',
{
	formname : 'testform',
	disable_remove : true,
	
	//------------------------------------------------------------------------------
	// makeForm() URL入力のポップアップメニューを作成する
	//------------------------------------------------------------------------------
	makeForm : function(){
		this.settitle("pop_test", "pop_test");
		
		this.addTextArea({name:"testarea", id:"testarea", cols:'40', rows:'16', wrap:'off'});
		this.form.testarea.style.fontSize = '10pt';
		this.addBR();
		
		var debug = ui.debug;
		if(ui.debugmode){
			this.addExecButton("テスト", "Test", function(){ debug.starttest();}, {name:'starttest'});
			this.addText(" ", " ");
		}
		
		this.addExecButton("T1", "T1", function(){ debug.perfeval();});
		this.addExecButton("T2", "T2", function(){ debug.painteval()});
		this.addExecButton("T3", "T3", function(){ debug.resizeeval()});
		this.addText(" ", " ");
		
		if(ui.puzzle.pid==='country'){
			this.addExecButton("Perf", "Perf", function(){ debug.loadperf();});
		}
		this.addExecButton("img", "img", function(){ debug.adjustimage();});
		if(pzprv3.storage.localST){
			this.addExecButton("DB", "DB", function(){ debug.dispdatabase();});
		}
		this.addBR();
		
		this.addExecButton("Save", "Save", function(){ debug.filesave()});
		if(ui.menu.ispencilbox){
			this.addExecButton("PBSave", "PBSave", function(){ debug.filesave_pencilbox()});
		}
		this.addText(" ", " ");
		
		this.addExecButton("Load", "Load", function(){ debug.fileopen();});
		this.addExecButton("消去", "Cls", function(){ debug.erasetext();});
		this.addCancelButton();

		/* テスト用文字列出力要素を追加 */
		if(ui.debugmode && !pzprv3.getEL('testdiv')){
			var el = document.createElement('div');
			el.id = 'testdiv';
			el.style.textAlign  = 'left';
			el.style.fontSize   = '8pt';
			el.style.lineHeight = '100%';
			document.body.appendChild(el);
		}
	},
	
	show : function(px,py){
		if(!this.pop){
			this.makeElement();
			this.makeForm();
			this.setEvent();
		}
		this.pop.style.display = 'inline';
		this.pop.style.left = '40px';
		this.pop.style.top  = '80px';
	}
});

//---------------------------------------------------------------------------
// ★Debugクラス  poptest関連の実行関数など
//---------------------------------------------------------------------------
ui.debug =
{
	extend : function(proto){
		for(var name in proto){ this[name] = proto[name];}
	},

	// debugmode===true時はオーバーライドされます
	keydown : function(ca){
		var kc = ui.puzzle.key;
		if(!ui.debugmode){
			if(kc.isCTRL && ca=='F8'){ this.disppoptest();}
			else{ return false;}
		}
		else{
			if(ca=='F7'){ this.accheck1();}
			else if(kc.isCTRL && ca=='F8'){ this.disppoptest();}
			else if(kc.isCTRL && ca=='F9'){ this.starttest();}
			else if(kc.isCTRL && kc.isSHIFT && ca=='F10'){ this.all_test();}
			else{ return false;}
		}
		kc.stopEvent();	/* カーソルを移動させない */
		return true;
	},
	disppoptest : function(){
		ui.menu.popups.debug.show();
	},

	starttest : function(){},

	filesave : function(){
		this.setTA(ui.puzzle.fio.fileencode(k.PZPH).replace(/\//g,"\n"));
		this.addTA(ui.puzzle.fio.history.replace(/\//g,"\n").replace(/\[\[slash\]\]/g,"/"));
	},
	filesave_pencilbox : function(){
		this.setTA(ui.puzzle.fio.fileencode(k.PBOX).replace(/\//g,"\n"));
	},

	fileopen : function(){
		var dataarray = this.getTA().replace(/\//g,"[[slash]]").split("\n");
		ui.puzzle.openByFileData(data.pdata);
		ui.waitReady();
	},

	erasetext : function(){
		this.setTA('');
		if(ui.debugmode){ pzprv3.getEL('testdiv').innerHTML = '';}
	},

	perfeval : function(){
		var ans = ui.puzzle.checker;
		this.timeeval("正答判定測定", function(){ ans.checkAns();});
	},
	painteval : function(){
		this.timeeval("描画時間測定", function(){ ui.puzzle.drawCanvas();});
	},
	resizeeval : function(){
		this.timeeval("resize描画測定", function(){ ui.puzzle.refreshCanvas();});
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
		ui.puzzle.openByFileData("pzprv3/country/10/18/44/0 0 1 1 1 2 2 2 3 4 4 4 5 5 6 6 7 8 /0 9 1 10 10 10 11 2 3 4 12 4 4 5 6 13 13 8 /0 9 1 1 10 10 11 2 3 12 12 12 4 5 14 13 13 15 /0 9 9 9 10 16 16 16 16 17 12 18 4 5 14 13 15 15 /19 19 19 20 20 20 21 17 17 17 22 18 18 14 14 23 23 24 /19 25 25 26 26 21 21 17 22 22 22 18 27 27 27 24 24 24 /28 28 29 26 30 31 21 32 22 33 33 33 33 34 35 35 35 36 /28 29 29 26 30 31 32 32 32 37 38 39 34 34 40 40 35 36 /41 29 29 42 30 31 31 32 31 37 38 39 34 34 34 40 35 36 /41 43 42 42 30 30 31 31 31 37 38 38 38 40 40 40 36 36 /3 . 6 . . 4 . . 2 . . . . . . . . 1 /. . . 5 . . . . . . . . . . . . . . /. . . . . . . . . 1 . . . . . . . . /. . . . . . . . . . . . . . . . . . /3 . . 2 . . . 4 . . . . . . . . . . /. . . 3 . . . . 4 . . . 2 . . . . . /. . . . 3 6 . . . 4 . . . . . . . . /. 5 . . . . . . . 2 . . 3 . . . . . /. . . . . . . . . . . . . . . . . . /. . . . . . . . . . . . . . . . 5 . /0 0 1 1 0 0 1 0 0 1 1 0 0 0 1 1 0 /1 0 0 0 1 0 0 0 1 0 0 1 0 0 0 0 1 /0 0 1 0 1 0 0 1 0 0 0 0 0 0 0 0 0 /0 1 1 0 0 0 1 0 0 1 1 0 1 0 0 0 1 /1 1 0 0 1 0 0 1 1 0 0 0 0 1 0 1 0 /0 1 0 1 0 1 0 0 1 1 1 0 1 0 0 1 1 /1 0 1 0 0 0 0 1 0 1 1 1 0 0 1 1 0 /0 1 0 0 0 0 1 0 0 0 0 1 1 0 1 0 0 /0 1 1 0 1 1 0 0 1 0 1 0 0 0 0 0 0 /1 1 1 0 0 0 1 1 0 0 1 1 1 1 1 0 1 /0 0 1 0 1 0 1 1 0 1 0 1 0 0 1 0 1 0 /1 1 1 0 0 1 1 1 1 0 0 0 1 0 1 0 0 1 /1 1 0 1 1 0 1 0 0 0 0 0 1 0 1 0 0 1 /1 0 0 0 1 0 0 1 0 1 0 1 0 1 1 0 1 0 /0 0 1 0 0 1 0 0 0 0 0 1 0 0 0 1 0 0 /0 1 0 1 1 0 1 0 1 0 0 0 1 1 0 0 0 1 /1 0 1 0 1 0 1 1 0 1 0 0 0 1 1 0 1 1 /1 1 0 0 1 0 0 0 0 1 0 1 0 0 0 1 1 1 /1 0 0 1 0 0 1 0 1 0 1 0 0 0 0 1 1 1 /2 2 1 1 1 2 0 0 2 0 1 0 0 0 0 0 0 2 /1 1 1 2 1 1 0 0 0 1 2 1 0 0 1 2 0 0 /1 0 1 1 1 1 0 0 1 2 2 2 1 0 1 2 2 0 /1 0 0 1 1 2 1 0 2 1 1 1 1 0 1 2 1 0 /1 1 0 2 1 1 2 0 0 0 2 1 2 1 1 1 0 2 /2 1 0 1 1 1 0 2 0 0 0 0 1 1 2 1 0 0 /1 0 1 1 1 2 1 1 0 0 0 0 0 0 1 0 0 0 /0 1 1 2 1 2 1 1 2 1 2 0 1 0 1 0 0 0 /0 1 1 0 1 1 1 2 0 1 0 1 2 2 2 1 0 0 /0 0 0 1 2 2 1 1 0 2 0 0 1 0 1 0 0 0 /");
		ui.waitReady(function(){
			ui.puzzle.setConfig('mode',3);
			ui.puzzle.setConfig('irowake',true);
		});
	},

	adjustimage : function(){
		var col = ui.puzzle.board.qcols, size = 17;
		if     (col<= 6){ size = 28;}
		else if(col<= 8){ size = 27;}
		else if(col<= 8){ size = 24;}
		else if(col<= 9){ size = 21;}
		else if(col<=18){ size = 19;}
		ui.menu.imagesave(false,size);
	},

	getTA : function(){ return document.testform.testarea.value;},
	setTA : function(str){ document.testform.testarea.value  = str;},
	addTA : function(str){ document.testform.testarea.value += (str+"\n");}
};

})();
