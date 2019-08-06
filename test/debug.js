// for_test.js v3.6.0
/* global pzpr:readonly */

(function(){

if(typeof window==='undefined'){ return;}

var puzzle = window.puzzle;

pzpr.on('load', function(){
	/* index.htmlからURLが入力されていない場合は現在のURLの?以降をとってくる */
	var search = location.search;

	/* 一旦先頭の?記号を取り除く */
	if(search.charAt(0)==="?"){ search = search.substr(1);}

	var onload_option = {};
	while(search.match(/^(\w+)\=(\w+)\&?(.*)/)){
		onload_option[RegExp.$1] = RegExp.$2;
		search = RegExp.$3;
	}

	// エディタモードかplayerモードか、等を判定する
	if(!search){ search = 'country';}

	var pzl = pzpr.parser.parseURL(search), pid = pzl.pid;

	/* テスト用ファイルのinclude */
	/* eslint-disable no-use-before-define */
	debug.includeDebugScript(pid, function(){
		/* パズルオブジェクトの作成 */
		onload_option.mode = 'play';
		onload_option.config = {irowake:true};
		puzzle = window.puzzle = new pzpr.Puzzle(document.getElementById('divques'), onload_option);
		pzpr.connectKeyEvents(puzzle);

		puzzle.open((!!pzl.cols && !!pzl.rows && !!pzl.body) ? pzl : pid+"/"+debug.urls[pid]);
		puzzle.on('key', debug.keydown);
		puzzle.on('mode', debug.initinputmodelist);
		document.getElementById('inputmode').addEventListener('change',debug.setinputmode,false);
	});
	/* eslint-enable no-use-before-define */
});

/* Debug用オブジェクトに関数などを追加する */
var debug = window.debug =
{
	keydown : function(puzzle, ca){
		if(puzzle.key.keydown){
			if(ca==='F7'){ debug.accheck1();}
			else if(ca==='ctrl+F9'){ debug.starttest();}
			else if(ca==='shift+ctrl+F10'){ debug.all_test();}
			else{ return;}
		}
	},
	initinputmodelist : function(puzzle){
		var el = document.getElementById('inputmode');
		el.innerHTML = '';
		puzzle.mouse.getInputModeList().forEach(function(mode){
			var opt = document.createElement('option');
			opt.text = opt.value = mode;
			el.appendChild(opt);
			if(puzzle.mouse.inputMode===mode){ opt.selected = true;}
		});
	},
	setinputmode : function(e){
		var el = document.getElementById('inputmode');
		puzzle.mouse.setInputMode(el.options[el.selectedIndex].value);
	},

	filesave : function(){
		this.setTA(puzzle.getFileData(pzpr.parser.FILE_PZPR));
	},
	filesave_trial : function(){
		this.setTA(puzzle.getFileData(pzpr.parser.FILE_PZPR, {trial:true}));
	},
	filesave_history : function(){
		this.setTA(puzzle.getFileData(pzpr.parser.FILE_PZPR, {history:true}));
	},
	filesave_pencilbox : function(){
		if(puzzle.info.exists.pencilbox){
			this.setTA(puzzle.getFileData(pzpr.parser.FILE_PBOX));
		}
		else{
			this.setTA("");
		}
	},
	filesave_pencilbox_xml : function(){
		if(puzzle.info.exists.pencilbox){
			this.setTA(puzzle.getFileData(pzpr.parser.FILE_PBOX_XML).replace(/\>/g,'>\n'));
		}
		else{
			this.setTA("");
		}
	},

	fileopen : function(){
		puzzle.open(this.getTA());
	},

	erasetext : function(){
		this.setTA('');
	},

	perfeval : function(){
		var ans = puzzle.checker;
		this.timeeval("正答判定", function(){ ans.resetCache(); ans.checkAns();});
	},
	painteval : function(){
		this.timeeval("描画時間", function(){ puzzle.redraw();});
	},
	resizeeval : function(){
		this.timeeval("resize描画", function(){ puzzle.redraw(true);});
	},
	searcheval : function(){
		var graph = puzzle.board.linegraph;
		graph.rebuild();
		var nodes = [];
		for(var i=0;i<graph.components.length;i++){
			nodes = nodes.concat(graph.components[i].nodes);
		}
		this.timeeval("search linemgr", function(){
			graph.components = [];
			graph.modifyNodes = nodes;
			graph.searchGraph();
		});
	},
	rebuildeval : function(){
		var graph = puzzle.board.linegraph;
		this.timeeval("reset linemgr", function(){ graph.rebuild();});
	},
	timeeval : function(text,func){
		var count=0, old = pzpr.util.currentTime();
		while(pzpr.util.currentTime() - old < 3000){
			count++;

			func();
		}
		var time = pzpr.util.currentTime() - old;
		this.addTA(text+" ave. "+(time/count)+"ms");
	},

	getTA : function(){ return document.getElementById('testarea').value;},
	setTA : function(str){ document.getElementById('testarea').value  = str;},
	addTA : function(str){
		if(!!window.console){ console.log(str);}
		document.getElementById('testarea').value += (str+"\n");
	},

	includeDebugScript : function(pid, callback){
		if(!!this.includedScript[pid]){ return;}
		var _script = document.createElement('script');
		_script.type = 'text/javascript';
		_script.src = './script/test_'+pid+'.js';
		if(!!callback){ _script.onload = callback;}
		document.getElementsByTagName('head')[0].appendChild(_script);
		this.includedScript[pid] = true;
	},
	includedScript : {},

	loadperf : function(){
		puzzle.open(perfstr, function(puzzle){ // eslint-disable-line no-use-before-define
			puzzle.setMode('playmode');
			puzzle.setConfig('irowake',true);
		});
	},

	accheck1 : function(){
		puzzle.checker.checkOnly = false;
		puzzle.checker.checkAns();
		var outputstr = puzzle.getFileData(pzpr.parser.FILE_PZPR).replace(/\r?\n/g, "/");
		var failcode  = puzzle.checker.failcode[0];
		var failstr   = (!!failcode ? "'"+failcode+"'" : "null");
		puzzle.board.haserror = true;
		puzzle.board.errclear();
		puzzle.redraw();
		this.addTA("\t\t["+failstr+",\""+outputstr+"\"],");
	},

	urls : {},
	acs  : {},
	inputs : {},
	addDebugData : function(pid, data){
		debug.urls[pid]   = data.url;
		debug.acs[pid]    = data.failcheck;
		debug.inputs[pid] = data.inputs || [];
	},

	execinput : function(str){
		var strs = str.split(/,/);
		switch(strs[0]){
			case 'newboard':
				var urls = [puzzle.pid, strs[1], strs[2]];
				if(puzzle.pid==='tawa'){ urls.push(strs[3]);}
				puzzle.open(urls.join("/"));
				break;
			case 'clear':
				puzzle.clear();
				break;
			case 'ansclear':
				puzzle.ansclear();
				break;
			case 'playmode':
			case 'editmode':
				puzzle.setMode(strs[0]);
				break;
			case 'setconfig':
				if     (strs[2]==="true") { puzzle.setConfig(strs[1], true);}
				else if(strs[2]==="false"){ puzzle.setConfig(strs[1], false);}
				else                      { puzzle.setConfig(strs[1], strs[2]);}
				break;
			case 'key':
				strs.shift();
				puzzle.key.inputKeys.apply(puzzle.key, strs);
				break;
			case 'cursor':
				puzzle.cursor.init(+strs[1], +strs[2]);
				break;
			case 'mouse':
				this.execmouse(strs);
				break;
		}
	},
	execmouse : function(strs){
		var matches = (strs[1].match(/(left|right)(.*)/)[2]||"").match(/x([0-9]+)/);
		var repeat = matches ? +matches[1] : 1;
		var args = [];
		if     (strs[1].substr(0,4)==="left") { args.push('left');}
		else if(strs[1].substr(0,5)==="right"){ args.push('right');}
		for(var i=2;i<strs.length;i++){ args.push(+strs[i]);}
		for(var t=0;t<repeat;t++){
			puzzle.mouse.inputPath.apply(puzzle.mouse, args);
		}
	},
	inputcheck_popup : function(){
		this.inputcheck(this.getTA());
	},
	inputcheck : function(text){
		var config = puzzle.saveConfig();
		var inparray = eval("["+text+"]");
		for(var n=0;n<inparray.length;n++){
			var data = inparray[n];
			if(data.input===void 0 || !data.input){ continue;}
			for(var i=0;i<data.input.length;i++){
				this.execinput(data.input[i]);
			}
		}
		this.execinput("playmode");
		puzzle.restoreConfig(config);
	},

	alltimer : false,
	idlist : [],
	pid  : '',
	pnum : 0,
	starttime : 0,
	totalfails : 0,
	all_test : function(){
		if(this.alltimer!==false){ return;}
		var self = this;
		self.pnum = 0;
		self.totalfails = 0;
		self.idlist = pzpr.variety.getList().sort();
		self.starttime = pzpr.util.currentTime();
		self.alltimer = true;
		self.each_test();
	},
	each_test : function(){
		var self = debug;
		if(self.idlist.length===0){
			if(self.alltimer){
				var ms = ((pzpr.util.currentTime() - self.starttime)/100)|0;
				var timetext = ""+((ms/10)|0)+"."+(ms%10)+" sec.";
				self.addTA("Total time: "+timetext);
				self.alltimer = false;
				alert(["All tests done.", "pzpr.js: v"+pzpr.version, "Total time: "+timetext, "Fail count="+self.totalfails].join('\n'));
			}
			return;
		}

		var newid = self.idlist[0];
		if(!!newid && !self.urls[newid]){
			self.includeDebugScript(newid);
			setTimeout(self.each_test,0);
			return;
		}

		self.idlist.shift();
		self.pnum++;
		puzzle.open(newid+"/"+self.urls[newid], function(){
			/* スクリプトチェック開始 */
			self.sccheck();
			self.addTA("Test ("+self.pnum+", "+newid+") start.");
		});
	},

	starttest : function(){
		this.erasetext();
		this.sccheck();
	},

	fails : 0,
	sccheck : function(){
		var self = this;
		self.fails = 0;
		self.testing = false;
		self.pid = puzzle.pid;

		var testlist = [];
		testlist.push('check_encode');
		if(puzzle.info.exists.kanpen){
			testlist.push('check_encode_kanpen');
		}
		testlist.push('check_answer');
		testlist.push('check_input');
		testlist.push('check_file');
		if(puzzle.info.exists.pencilbox){
			testlist.push('check_file_pbox');
			testlist.push('check_file_pbox_xml');
		}
		if(self.pid!=='tawa'){
			testlist.push('check_turnR1');
			testlist.push('check_turnR2');
			testlist.push('check_turnL1');
			testlist.push('check_turnL2');
		}
		testlist.push('check_flipX1');
		testlist.push('check_flipX2');
		testlist.push('check_flipY1');
		testlist.push('check_flipY2');
		testlist.push('check_adjust1');
		testlist.push('check_adjust2');
		testlist.push('check_end');

		setTimeout(function tests(){
			if(!self.testing && testlist.length>0){
				self.testing = true;
				self[testlist.shift()](self);
			}
			if(testlist.length>0){ setTimeout(tests,0);}
			else{
				self.totalfails += self.fails;
				self.each_test();
			}
		},0);
	},
	//Encode test--------------------------------------------------------------
	check_encode : function(self){
		var pzl = new pzpr.parser.URLData('');
		pzl.pid   = self.pid;
		pzl.type  = pzl.URL_PZPRV3;
		var inp = pzl.outputURLType() + self.urls[self.pid];
		var ta  = puzzle.getURL(pzl.URL_PZPRV3);

		if(inp!==ta){ self.addTA("Encode test   = failure...<BR> "+inp+"<BR> "+ta); self.fails++;}
		else if(!self.alltimer){ self.addTA("Encode test   = pass");}

		self.testing = false;
	},
	check_encode_kanpen : function(self){
		var bd = puzzle.board, bd2 = bd.freezecopy();
		var kanpen_url = puzzle.getURL(pzpr.parser.URL_KANPEN);

		if(pzpr.parser(kanpen_url).pid!==puzzle.pid){
			self.addTA("Encode kanpen = id fail..."); self.fails++;
		}
		puzzle.open(kanpen_url, function(){
			if(!self.bd_compare(bd,bd2)){
				self.addTA("Encode kanpen = failure..."); self.fails++;
			}
			else if(!self.alltimer){ self.addTA("Encode kanpen = pass");}

			self.testing = false;
		});
	},
	//Answer test--------------------------------------------------------------
	check_answer : function(self){
		var acsstr = self.acs[self.pid];
		var config = puzzle.saveConfig();
		puzzle.setConfig('forceallcell',true);
		for(var n=0;n<acsstr.length;n++){
			puzzle.open(acsstr[n][1]);
			var faildata = puzzle.check(true), expectcode = acsstr[n][0];
			var iserror = (!!expectcode ? (faildata[0]!==expectcode) : (!faildata.complete));
			var errdesc = (!!expectcode ? expectcode : 'complete')+":"+(new puzzle.klass.CheckInfo(expectcode).gettext());

			var judge = (!iserror ? "pass" : "failure...");
			if(iserror){ self.fails++;}

			if(iserror || !self.alltimer){
				self.addTA("Answer test "+(n+1)+" = "+judge+" ("+errdesc+")");
			}
		}
		puzzle.restoreConfig(config);
		self.testing = false;
	},
	//Input test---------------------------------------------------------------
	check_input : function(self){
		var inps = self.inputs[self.pid];
		if(inps.length>0){
			var filedata = puzzle.getFileData();
			var count=0, pass=0;
			var config = puzzle.saveConfig();
			for(var n=0;n<inps.length;n++){
				var data = inps[n];
				if(data.input!==void 0 && !!data.input){
					for(var i=0;i<data.input.length;i++){
						self.execinput(data.input[i]);
					}
				}
				if(data.result!==void 0 && !!data.result){
					var iserror = (data.result!==puzzle.getFileData(pzpr.parser.FILE_PZPR).replace(/\r?\n/g, "/"));
					count++;
					if(iserror){ self.fails++; self.addTA("Input Error No."+n);}
					if(!iserror){ pass++;}
				}
			}
			if(!self.alltimer || pass!==count){
				self.addTA("Input test Pass = "+pass+"/"+count);
			}
			self.execinput("playmode");
			puzzle.restoreConfig(config);
			puzzle.open(filedata);
		}
		self.testing = false;
	},
	//FileIO test--------------------------------------------------------------
	check_file : function(self){
		var bd = puzzle.board, bd2 = bd.freezecopy();
		var outputstr = puzzle.getFileData(pzpr.parser.FILE_PZPR);

		puzzle.painter.suspendAll();
		bd.initBoardSize(1,1);
		bd.rebuildInfo();

		puzzle.open(outputstr, function(){
			if(!self.bd_compare(bd,bd2)){ self.addTA("FileIO test   = failure..."); self.fails++;}
			else if(!self.alltimer){ self.addTA("FileIO test   = pass");}

			self.testing = false;
		});
	},
	check_file_pbox : function(self){
		var bd = puzzle.board, bd2 = bd.freezecopy();
		var outputstr = puzzle.getFileData(pzpr.parser.FILE_PBOX);

		puzzle.painter.suspendAll();
		bd.initBoardSize(1,1);
		bd.rebuildInfo();

		puzzle.open(outputstr, function(){
			if(!self.bd_compare(bd,bd2,true)){ self.addTA("FileIO kanpen = failure..."); self.fails++;}
			else if(!self.alltimer){ self.addTA("FileIO kanpen = pass");}

			self.testing = false;
		});
	},
	check_file_pbox_xml : function(self){
		var bd = puzzle.board, bd2 = bd.freezecopy();
		var outputstr = puzzle.getFileData(pzpr.parser.FILE_PBOX_XML);

		puzzle.painter.suspendAll();
		bd.initBoardSize(1,1);
		bd.rebuildInfo();

		puzzle.open(outputstr, function(){
			if(!self.bd_compare(bd,bd2,true)){ self.addTA("FileIO kanpenXML = failure..."); self.fails++;}
			else if(!self.alltimer){ self.addTA("FileIO kanpenXML = pass");}

			self.testing = false;
		});
	},
	//Turn test--------------------------------------------------------------
	check_turnR1 : function(self){
		var bd = puzzle.board, bd2 = bd.freezecopy();
		for(var i=0;i<4;i++){ bd.operate('turnr');}

		if(!self.bd_compare(bd,bd2)){ self.addTA("TurnR test 1  = failure..."); self.fails++;}
		else if(!self.alltimer){ self.addTA("TurnR test 1  = pass");}

		self.testing = false;
	},
	check_turnR2 : function(self){
		var bd = puzzle.board, bd2 = bd.freezecopy();
		for(var i=0;i<4;i++){ puzzle.undo();}

		if(!self.bd_compare(bd,bd2)){ self.addTA("TurnR test 2  = failure..."); self.fails++;}
		else if(!self.alltimer){ self.addTA("TurnR test 2  = pass");}

		self.testing = false;
	},

	check_turnL1 : function(self){
		var bd = puzzle.board, bd2 = bd.freezecopy();
		for(var i=0;i<4;i++){ bd.operate('turnl');}

		if(!self.bd_compare(bd,bd2)){ self.addTA("TurnL test 1  = failure..."); self.fails++;}
		else if(!self.alltimer){ self.addTA("TurnL test 1  = pass");}

		self.testing = false;
	},
	check_turnL2 : function(self){
		var bd = puzzle.board, bd2 = bd.freezecopy();
		for(var i=0;i<4;i++){ puzzle.undo();}

		if(!self.bd_compare(bd,bd2)){ self.addTA("TurnL test 2  = failure..."); self.fails++;}
		else if(!self.alltimer){ self.addTA("TurnL test 2  = pass");}

		self.testing = false;
	},
	//Flip test--------------------------------------------------------------
	check_flipX1 : function(self){
		var bd = puzzle.board, bd2 = bd.freezecopy();
		for(var i=0;i<2;i++){ bd.operate('flipx');}

		if(!self.bd_compare(bd,bd2)){ self.addTA("FlipX test 1  = failure..."); self.fails++;}
		else if(!self.alltimer){ self.addTA("FlipX test 1  = pass");}

		self.testing = false;
	},
	check_flipX2 : function(self){
		var bd = puzzle.board, bd2 = bd.freezecopy();
		for(var i=0;i<2;i++){ puzzle.undo();}

		if(!self.bd_compare(bd,bd2)){ self.addTA("FlipX test 2  = failure..."); self.fails++;}
		else if(!self.alltimer){ self.addTA("FlipX test 2  = pass");}

		self.testing = false;
	},

	check_flipY1 : function(self){
		var bd = puzzle.board, bd2 = bd.freezecopy();
		for(var i=0;i<2;i++){ bd.operate('flipy');}

		if(!self.bd_compare(bd,bd2)){ self.addTA("FlipY test 1  = failure..."); self.fails++;}
		else if(!self.alltimer){ self.addTA("FlipY test 1  = pass");}

		self.testing = false;
	},
	check_flipY2 : function(self){
		var bd = puzzle.board, bd2 = bd.freezecopy();
		for(var i=0;i<2;i++){ puzzle.undo();}

		if(!self.bd_compare(bd,bd2)){ self.addTA("FlipY test 2  = failure..."); self.fails++;}
		else if(!self.alltimer){ self.addTA("FlipY test 2  = pass");}

		self.testing = false;
	},
	//Adjust test--------------------------------------------------------------
	check_adjust1 : function(self){
		var bd = puzzle.board, bd2 = bd.freezecopy();
		var names = ['expandup','expanddn','expandlt','expandrt','reduceup','reducedn','reducelt','reducert'];
		for(var i=0;i<8;i++){ bd.operate(names[i]);}

		if(!self.bd_compare(bd,bd2)){ self.addTA("Adjust test 1  = failure..."); self.fails++;}
		else if(!self.alltimer){ self.addTA("Adjust test 1  = pass");}

		self.testing = false;
	},
	check_adjust2 : function(self){
		var bd = puzzle.board, bd2 = bd.freezecopy();
		for(var i=0;i<8;i++){ puzzle.undo();}

		if(!self.bd_compare(bd,bd2)){ self.addTA("Adjust test 2  = failure..."); self.fails++;}
		else if(!self.alltimer){ self.addTA("Adjust test 2  = pass");}

		self.testing = false;
	},
	//test end--------------------------------------------------------------
	check_end : function(self){
		if(!self.alltimer){ self.addTA("Test end.");}

		self.testing = false;
	},

	bd_compare : function(bd1,bd2,iskanpen){
		var result = true;
		var pid = bd1.pid;
		var ignore_qsub = (!!iskanpen && (pid==='fillomino'||pid==='hashikake'||pid==='heyabon'||pid==='kurodoko'||pid==='shikaku'||pid==='tentaisho'));
		var self = this;
		bd1.compareData(bd2,function(group, c, a){
			if(ignore_qsub && (a==='qsub' || a==='qcmp')){ return;}
			self.addTA(group+"["+c+"]."+a+" "+bd1[group][c][a]+" <- "+bd2[group][c][a]);
			result = false;
		});
		return result;
	}
};

window.ui = {debug:{addDebugData: debug.addDebugData}};

var perfstr = "pzprv3/country/10/18/44/0 0 1 1 1 2 2 2 3 4 4 4 5 5 6 6 7 8 /0 9 1 10 10 10 11 2 3 4 12 4 4 5 6 13 13 8 /0 9 1 1 10 10 11 2 3 12 12 12 4 5 14 13 13 15 /0 9 9 9 10 16 16 16 16 17 12 18 4 5 14 13 15 15 /19 19 19 20 20 20 21 17 17 17 22 18 18 14 14 23 23 24 /19 25 25 26 26 21 21 17 22 22 22 18 27 27 27 24 24 24 /28 28 29 26 30 31 21 32 22 33 33 33 33 34 35 35 35 36 /28 29 29 26 30 31 32 32 32 37 38 39 34 34 40 40 35 36 /41 29 29 42 30 31 31 32 31 37 38 39 34 34 34 40 35 36 /41 43 42 42 30 30 31 31 31 37 38 38 38 40 40 40 36 36 /3 . 6 . . 4 . . 2 . . . . . . . . 1 /. . . 5 . . . . . . . . . . . . . . /. . . . . . . . . 1 . . . . . . . . /. . . . . . . . . . . . . . . . . . /3 . . 2 . . . 4 . . . . . . . . . . /. . . 3 . . . . 4 . . . 2 . . . . . /. . . . 3 6 . . . 4 . . . . . . . . /. 5 . . . . . . . 2 . . 3 . . . . . /. . . . . . . . . . . . . . . . . . /. . . . . . . . . . . . . . . . 5 . /0 0 1 1 0 0 1 0 0 1 1 0 0 0 1 1 0 /1 0 0 0 1 0 0 0 1 0 0 1 0 0 0 0 1 /0 0 1 0 1 0 0 1 0 0 0 0 0 0 0 0 0 /0 1 1 0 0 0 1 0 0 1 1 0 1 0 0 0 1 /1 1 0 0 1 0 0 1 1 0 0 0 0 1 0 1 0 /0 1 0 1 0 1 0 0 1 1 1 0 1 0 0 1 1 /1 0 1 0 0 0 0 1 0 1 1 1 0 0 1 1 0 /0 1 0 0 0 0 1 0 0 0 0 1 1 0 1 0 0 /0 1 1 0 1 1 0 0 1 0 1 0 0 0 0 0 0 /1 1 1 0 0 0 1 1 0 0 1 1 1 1 1 0 1 /0 0 1 0 1 0 1 1 0 1 0 1 0 0 1 0 1 0 /1 1 1 0 0 1 1 1 1 0 0 0 1 0 1 0 0 1 /1 1 0 1 1 0 1 0 0 0 0 0 1 0 1 0 0 1 /1 0 0 0 1 0 0 1 0 1 0 1 0 1 1 0 1 0 /0 0 1 0 0 1 0 0 0 0 0 1 0 0 0 1 0 0 /0 1 0 1 1 0 1 0 1 0 0 0 1 1 0 0 0 1 /1 0 1 0 1 0 1 1 0 1 0 0 0 1 1 0 1 1 /1 1 0 0 1 0 0 0 0 1 0 1 0 0 0 1 1 1 /1 0 0 1 0 0 1 0 1 0 1 0 0 0 0 1 1 1 /2 2 1 1 1 2 0 0 2 0 1 0 0 0 0 0 0 2 /1 1 1 2 1 1 0 0 0 1 2 1 0 0 1 2 0 0 /1 0 1 1 1 1 0 0 1 2 2 2 1 0 1 2 2 0 /1 0 0 1 1 2 1 0 2 1 1 1 1 0 1 2 1 0 /1 1 0 2 1 1 2 0 0 0 2 1 2 1 1 1 0 2 /2 1 0 1 1 1 0 2 0 0 0 0 1 1 2 1 0 0 /1 0 1 1 1 2 1 1 0 0 0 0 0 0 1 0 0 0 /0 1 1 2 1 2 1 1 2 1 2 0 1 0 1 0 0 0 /0 1 1 0 1 1 1 2 0 1 0 1 2 2 2 1 0 0 /0 0 0 1 2 2 1 1 0 2 0 0 1 0 1 0 0 0 /".replace(/\//g, "\n");

})();
