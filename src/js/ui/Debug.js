// Debug.js v3.4.0
/* global ui:false, getEL:false */

//---------------------------------------------------------------------------
// ★Popup_Debugクラス  poptest関連のポップアップメニュー表示用
//---------------------------------------------------------------------------
ui.popupmgr.addpopup('debug',
{
	formname : 'debug',
	multipopup : true,
	
	setFormEvent : function(){
		if(!ui.debugmode){
			var form = this.form;
			form.starttest.style.display = "none";
			form.all_test.style.display = "none";
			form.loadperf.style.display = "none";
			form.inputcheck_popup.style.display = "none";
		}
	},
	handler : function(e){
		ui.debug[e.target.name]();
	},
	
	show : function(px,py){
		ui.popupmgr.popups.template.show.call(this,40,80);
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
		if(ca==='alt+p'){ this.disppoptest();}
		else{ return false;}
		
		ui.puzzle.key.stopEvent();	/* カーソルを移動させない */
		return true;
	},
	disppoptest : function(){
		ui.popupmgr.popups.debug.show();
	},

	filesave : function(){
		this.setTA(ui.puzzle.getFileData(pzpr.parser.FILE_PZPH));
	},
	filesave_pencilbox : function(){
		if(pzpr.variety.info[ui.puzzle.pid].exists.kanpen){
			this.setTA(ui.puzzle.getFileData(pzpr.parser.FILE_PBOX));
		}
		else{
			this.setTA("");
		}
	},

	fileopen : function(){
		ui.puzzle.open(this.getTA());
	},

	erasetext : function(){
		this.setTA('');
	},

	perfeval : function(){
		var ans = ui.puzzle.checker;
		this.timeeval("正答判定測定", function(){ ans.resetCache(); ans.checkAns();});
	},
	painteval : function(){
		this.timeeval("描画時間測定", function(){ ui.puzzle.redraw();});
	},
	resizeeval : function(){
		this.timeeval("resize描画測定", function(){ ui.puzzle.adjustCanvasSize();});
	},
	timeeval : function(text,func){
		this.addTA(text);
		var count=0, old = pzpr.util.currentTime();
		while(pzpr.util.currentTime() - old < 3000){
			count++;

			func();
		}
		var time = pzpr.util.currentTime() - old;

		this.addTA("測定データ "+time+"ms / "+count+"回\n"+"平均時間   "+(time/count)+"ms");
	},

	dispdatabase : function(){
		var text = "";
		for(var i=0;i<localStorage.length;i++){
			var key = localStorage.key(i);
			if(key.match(/^pzprv3/)){
				text += (""+key+" "+localStorage[key]+"\n");
			}
		}
		this.setTA(text);
	},

	getTA : function(){ return document.getElementById('testarea').value;},
	setTA : function(str){ document.getElementById('testarea').value  = str;},
	addTA : function(str){ document.getElementById('testarea').value += (str+"\n");},

	includeDebugScript : function(filename){
		if(!!this.includedScript[filename]){ return;}
		var _script = document.createElement('script');
		_script.type = 'text/javascript';
		_script.src = pzpr.util.getpath()+'../../tests/script/'+filename;
		document.getElementsByTagName('head')[0].appendChild(_script);
		this.includedScript[filename] = true;
	},
	includedScript : {}
};
