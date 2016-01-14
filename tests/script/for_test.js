// for_test.js v3.6.0
/* jshint evil:true, devel:true, latedef:false */
/* global pzpr:false */
(function(){

var puzzle = window.puzzle;

pzpr.addLoadListener(function(){
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
	debug.includeDebugScript(pid, function(){
		/* パズルオブジェクトの作成 */
		onload_option.config = {mode:pzpr.Puzzle.prototype.MODE_PLAYER, irowake:true};
		puzzle = window.puzzle = new pzpr.Puzzle(document.getElementById('divques'), onload_option);
		pzpr.connectKeyEvents(puzzle);
		
		puzzle.open((!!pzl.cols && !!pzl.rows && !!pzl.body) ? pzl : pid+"/"+debug.urls[pid]);
		puzzle.on('key', debug.keydown);
	});
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
			
			puzzle.key.stopEvent();	/* カーソルを移動させない */
		}
	},

	filesave : function(){
		this.setTA(puzzle.getFileData(pzpr.parser.FILE_PZPR, {history:true}));
	},
	filesave_pencilbox : function(){
		if(pzpr.variety.info[puzzle.pid].exists.pencilbox){
			this.setTA(puzzle.getFileData(pzpr.parser.FILE_PBOX));
		}
		else{
			this.setTA("");
		}
	},
	filesave_pencilbox_xml : function(){
		if(pzpr.variety.info[puzzle.pid].exists.pencilbox){
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
		_script.src = pzpr.util.getpath()+'../tests/script/test_'+pid+'.js';
		if(!!callback){ _script.onload = callback;}
		document.getElementsByTagName('head')[0].appendChild(_script);
		this.includedScript[pid] = true;
	},
	includedScript : {},

	loadperf : function(){
		puzzle.open(perfstr, function(puzzle){
			puzzle.modechange(puzzle.MODE_PLAYER);
			puzzle.setConfig('irowake',true);
		});
	},

	accheck1 : function(){
		puzzle.checker.checkOnly = false;
		puzzle.checker.checkAns();
		var outputstr = puzzle.getFileData(pzpr.parser.FILE_PZPR).replace(/\r?\n/g, "/");
		var failcode  = puzzle.checker.failcode[0];
		var failstr   = (!!failcode ? "\""+failcode+"\"" : "null");
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
				puzzle.modechange(puzzle.MODE_PLAYER);
				break;
			case 'editmode':
				puzzle.modechange(puzzle.MODE_EDITOR);
				break;
			case 'setconfig':
				if     (strs[2]==="true") { puzzle.setConfig(strs[1], true);}
				else if(strs[2]==="false"){ puzzle.setConfig(strs[1], false);}
				else                      { puzzle.setConfig(strs[1], strs[2]);}
				break;
			case 'key':
				for(var i=1;i<strs.length;i++){
					puzzle.key.keyevent(strs[i],0);
					puzzle.key.keyevent(strs[i],1);
				}
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
		for(var t=0;t<repeat;t++){
			var mv = puzzle.mouse;
			if     (strs[1].substr(0,4)==="left") { mv.btn='left';}
			else if(strs[1].substr(0,5)==="right"){ mv.btn='right';}
			
			mv.moveTo(+strs[2], +strs[3]);
			for(var i=4;i<strs.length-1;i+=2){ /* 奇数個の最後の一つは切り捨て */
				mv.lineTo(+strs[i], +strs[i+1]);
			}
			mv.inputEnd(2);
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

	alltimer : null,
	phase : 99,
	pid : '',
	all_test : function(){
		if(this.alltimer !== null){ return;}
		var pnum=0, term, idlist=[], self = this, starttime = pzpr.util.currentTime();
		self.phase = 99;

		for(var id in pzpr.variety.info){ idlist.push(id);}
		idlist.sort();
		term = idlist.length;

		self.alltimer = setInterval(function(){
			var newid = idlist[pnum];
			if(!self.urls[newid]){
				self.includeDebugScript(newid);
				return;
			}

			if(self.phase !== 99){ return;}
			self.phase = 0;
			self.pid = newid;
			puzzle.open(newid+"/"+self.urls[newid], function(){
				/* スクリプトチェック開始 */
				self.sccheck();
				self.addTA("Test ("+pnum+", "+newid+") start.");
				pnum++;
				if(pnum >= term){
					clearInterval(self.alltimer);
					var ms = ((pzpr.util.currentTime() - starttime)/100)|0;
					self.addTA("Total time: "+((ms/10)|0)+"."+(ms%10)+" sec.");
				}
			});
		},100);
	},

	starttest : function(){
		this.erasetext();
		this.sccheck();
	},

	fails : 0,
	sccheck : function(){
		var self = this;

		self.fails = 0;
		self.pid = puzzle.pid;
		setTimeout(function(){ self.check_encode(self);},0);
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

		setTimeout(function(){ self.check_encode_kanpen(self);},0);
	},
	check_encode_kanpen : function(self){
		if(pzpr.variety.info[self.pid].exists.kanpen){
			var bd = puzzle.board, bd2 = self.bd_freezecopy(bd);
			var kanpen_url = puzzle.getURL(pzpr.parser.URL_KANPEN);
			var fails_org = self.fails;

			if(pzpr.parser.parse(kanpen_url).pid!==puzzle.pid){
				self.addTA("Encode kanpen = id fail..."); self.fails++;
			}
			puzzle.open(kanpen_url, function(){
				if(!self.bd_compare(bd,bd2)){
					self.addTA("Encode kanpen = failure..."); self.fails++;
				}
				
				if(!self.alltimer && (fails_org===self.fails)){ self.addTA("Encode kanpen = pass");}
				
				setTimeout(function(){ self.check_answer(self);},0);
			});
		}
		else{
			setTimeout(function(){ self.check_answer(self);},0);
		}
	},
	//Answer test--------------------------------------------------------------
	check_answer : function(self){
		var acsstr = self.acs[self.pid];
		for(var n=0;n<acsstr.length;n++){
			puzzle.open(acsstr[n][1]);
			var faildata = puzzle.check(true), expectcode = acsstr[n][0];
			var iserror = (!!expectcode ? (faildata[0]!==expectcode) : (!faildata.complete));
			var errdesc = (!!expectcode ? expectcode : 'complete')+":"+(new puzzle.klass.CheckInfo(expectcode).text());

			var judge = (!iserror ? "pass" : "failure...");
			if(iserror){ self.fails++;}

			if(iserror || !self.alltimer){
				self.addTA("Answer test "+(n+1)+" = "+judge+" ("+errdesc+")");
			}
		}
		setTimeout(function(){ self.check_input(self);},0);
	},
	//Input test---------------------------------------------------------------
	check_input : function(self){
		var filedata = puzzle.getFileData();
		var inps = self.inputs[self.pid];
		if(inps.length>0){
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
		}

		puzzle.open(filedata,function(){ self.check_file(self);});
	},
	//FileIO test--------------------------------------------------------------
	check_file : function(self){
		var bd = puzzle.board;
		var outputstr = puzzle.getFileData(pzpr.parser.FILE_PZPR);
		var bd2 = self.bd_freezecopy(bd);

		puzzle.painter.suspendAll();
		bd.initBoardSize(1,1);
		bd.rebuildInfo();

		puzzle.open(outputstr, function(){
			if(!self.bd_compare(bd,bd2)){ self.addTA("FileIO test   = failure..."); self.fails++;}
			else if(!self.alltimer){ self.addTA("FileIO test   = pass");}

			setTimeout(function(){
				if(pzpr.variety.info[self.pid].exists.pencilbox){ self.check_file_pbox(self);}
				else{ self.check_turnR1(self);}
			},0);
		});
	},
	check_file_pbox : function(self){
		var bd = puzzle.board, pid = puzzle.pid;
		var outputstr = puzzle.getFileData(pzpr.parser.FILE_PBOX);
		var bd2 = self.bd_freezecopy(bd);

		puzzle.painter.suspendAll();
		bd.initBoardSize(1,1);
		bd.rebuildInfo();

		puzzle.open(outputstr, function(){
			self.qsubf = !(pid==='fillomino'||pid==='hashikake'||pid==='heyabon'||pid==='kurodoko'||pid==='shikaku'||pid==='tentaisho');
			if(!self.bd_compare(bd,bd2)){ self.addTA("FileIO kanpen = failure..."); self.fails++;}
			else if(!self.alltimer){ self.addTA("FileIO kanpen = pass");}
			self.qsubf = true;

			setTimeout(function(){ self.check_file_pbox_xml(self);},0);
		});
	},
	check_file_pbox_xml : function(self){
		var bd = puzzle.board, pid = puzzle.pid;
		var outputstr = puzzle.getFileData(pzpr.parser.FILE_PBOX_XML);
		var bd2 = self.bd_freezecopy(bd);

		puzzle.painter.suspendAll();
		bd.initBoardSize(1,1);
		bd.rebuildInfo();

		puzzle.open(outputstr, function(){
			self.qsubf = !(pid==='fillomino'||pid==='hashikake'||pid==='heyabon'||pid==='kurodoko'||pid==='shikaku'||pid==='tentaisho');
			if(!self.bd_compare(bd,bd2)){ self.addTA("FileIO kanpenXML = failure..."); self.fails++;}
			else if(!self.alltimer){ self.addTA("FileIO kanpenXML = pass");}
			self.qsubf = true;

			setTimeout(function(){ self.check_turnR1(self);},0);
		});
	},
	//Turn test--------------------------------------------------------------
	check_turnR1 : function(self){
		var bd = puzzle.board, bd2 = self.bd_freezecopy(bd);
		for(var i=0;i<4;i++){ bd.exec.execadjust('turnr');}

		if(!self.bd_compare(bd,bd2)){ self.addTA("TurnR test 1  = failure..."); self.fails++;}
		else if(!self.alltimer){ self.addTA("TurnR test 1  = pass");}

		setTimeout(function(){ self.check_turnR2(self);},0);
	},
	check_turnR2 : function(self){
		var bd = puzzle.board, bd2 = self.bd_freezecopy(bd);
		for(var i=0;i<4;i++){ puzzle.undo();}

		if(!self.bd_compare(bd,bd2)){ self.addTA("TurnR test 2  = failure..."); self.fails++;}
		else if(!self.alltimer){ self.addTA("TurnR test 2  = pass");}

		setTimeout(function(){ self.check_turnL1(self);},0);
	},

	check_turnL1 : function(self){
		var bd = puzzle.board, bd2 = self.bd_freezecopy(bd);
		for(var i=0;i<4;i++){ bd.exec.execadjust('turnl');}

		if(!self.bd_compare(bd,bd2)){ self.addTA("TurnL test 1  = failure..."); self.fails++;}
		else if(!self.alltimer){ self.addTA("TurnL test 1  = pass");}

		setTimeout(function(){ self.check_turnL2(self);},0);
	},
	check_turnL2 : function(self){
		var bd = puzzle.board, bd2 = self.bd_freezecopy(bd);
		for(var i=0;i<4;i++){ puzzle.undo();}

		if(!self.bd_compare(bd,bd2)){ self.addTA("TurnL test 2  = failure..."); self.fails++;}
		else if(!self.alltimer){ self.addTA("TurnL test 2  = pass");}

		setTimeout(function(){ self.check_flipX1(self);},0);
	},
	//Flip test--------------------------------------------------------------
	check_flipX1 : function(self){
		var bd = puzzle.board, bd2 = self.bd_freezecopy(bd);
		for(var i=0;i<2;i++){ bd.exec.execadjust('flipx');}

		if(!self.bd_compare(bd,bd2)){ self.addTA("FlipX test 1  = failure..."); self.fails++;}
		else if(!self.alltimer){ self.addTA("FlipX test 1  = pass");}

		setTimeout(function(){ self.check_flipX2(self);},0);
	},
	check_flipX2 : function(self){
		var bd = puzzle.board, bd2 = self.bd_freezecopy(bd);
		for(var i=0;i<2;i++){ puzzle.undo();}

		if(!self.bd_compare(bd,bd2)){ self.addTA("FlipX test 2  = failure..."); self.fails++;}
		else if(!self.alltimer){ self.addTA("FlipX test 2  = pass");}

		setTimeout(function(){ self.check_flipY1(self);},0);
	},

	check_flipY1 : function(self){
		var bd = puzzle.board, bd2 = self.bd_freezecopy(bd);
		for(var i=0;i<2;i++){ bd.exec.execadjust('flipy');}

		if(!self.bd_compare(bd,bd2)){ self.addTA("FlipY test 1  = failure..."); self.fails++;}
		else if(!self.alltimer){ self.addTA("FlipY test 1  = pass");}

		setTimeout(function(){ self.check_flipY2(self);},0);
	},
	check_flipY2 : function(self){
		var bd = puzzle.board, bd2 = self.bd_freezecopy(bd);
		for(var i=0;i<2;i++){ puzzle.undo();}

		if(!self.bd_compare(bd,bd2)){ self.addTA("FlipY test 2  = failure..."); self.fails++;}
		else if(!self.alltimer){ self.addTA("FlipY test 2  = pass");}

		setTimeout(function(){ self.check_adjust1(self);},0);
	},
	//Adjust test--------------------------------------------------------------
	check_adjust1 : function(self){
		var bd = puzzle.board, bd2 = self.bd_freezecopy(bd);
		var names = ['expandup','expanddn','expandlt','expandrt','reduceup','reducedn','reducelt','reducert'];
		for(var i=0;i<8;i++){ bd.exec.execadjust(names[i]);}

		if(!self.bd_compare(bd,bd2)){ self.addTA("Adjust test 1  = failure..."); self.fails++;}
		else if(!self.alltimer){ self.addTA("Adjust test 1  = pass");}

		setTimeout(function(){ self.check_adjust2(self);},0);
	},
	check_adjust2 : function(self){
		var bd = puzzle.board, bd2 = self.bd_freezecopy(bd);
		for(var i=0;i<8;i++){ puzzle.undo();}

		if(!self.bd_compare(bd,bd2)){ self.addTA("Adjust test 2  = failure..."); self.fails++;}
		else if(!self.alltimer){ self.addTA("Adjust test 2  = pass");}

		setTimeout(function(){ self.check_end(self);},0);
	},
	//test end--------------------------------------------------------------
	check_end : function(self){
		if(!self.alltimer){ self.addTA("Test end.");}
		self.phase = 99;
	},

	qsubf : true,
	bd_freezecopy : function(bd1){
		var bd2 = {cell:[],cross:[],border:[],excell:[]};
		for(var c=0;c<bd1.cell.length;c++){
			bd2.cell[c] = {};
			bd2.cell[c].ques=bd1.cell[c].ques;
			bd2.cell[c].qnum=bd1.cell[c].qnum;
			bd2.cell[c].qdir=bd1.cell[c].qdir;
			bd2.cell[c].anum=bd1.cell[c].anum;
			bd2.cell[c].qans=bd1.cell[c].qans;
			bd2.cell[c].qsub=bd1.cell[c].qsub;
		}
		for(var c=0;c<bd1.excell.length;c++){
			bd2.excell[c] = {};
			bd2.excell[c].qnum=bd1.excell[c].qnum;
			bd2.excell[c].qdir=bd1.excell[c].qdir;
		}
		for(var c=0;c<bd1.cross.length;c++){
			bd2.cross[c] = {};
			bd2.cross[c].ques=bd1.cross[c].ques;
			bd2.cross[c].qnum=bd1.cross[c].qnum;
		}
		for(var i=0;i<bd1.border.length;i++){
			bd2.border[i] = {};
			bd2.border[i].ques=bd1.border[i].ques;
			bd2.border[i].qnum=bd1.border[i].qnum;
			bd2.border[i].qans=bd1.border[i].qans;
			bd2.border[i].qsub=bd1.border[i].qsub;
			bd2.border[i].line=bd1.border[i].line;
		}
		return bd2;
	},
	bd_compare : function(bd1,bd2){
		var result = true;
		for(var c=0,len=Math.min(bd1.cell.length,bd2.cell.length);c<len;c++){
			if(bd1.cell[c].ques!==bd2.cell[c].ques){ result = false; this.addTA("cell ques "+c+" "+bd1.cell[c].ques+" &lt;- "+bd2.cell[c].ques);}
			if(bd1.cell[c].qnum!==bd2.cell[c].qnum){ result = false; this.addTA("cell qnum "+c+" "+bd1.cell[c].qnum+" &lt;- "+bd2.cell[c].qnum);}
			if(bd1.cell[c].qdir!==bd2.cell[c].qdir){ result = false; this.addTA("cell qdir "+c+" "+bd1.cell[c].qdir+" &lt;- "+bd2.cell[c].qdir);}
			if(bd1.cell[c].anum!==bd2.cell[c].anum){ result = false; this.addTA("cell anum "+c+" "+bd1.cell[c].anum+" &lt;- "+bd2.cell[c].anum);}
			if(bd1.cell[c].qans!==bd2.cell[c].qans){ result = false; this.addTA("cell qans "+c+" "+bd1.cell[c].qans+" &lt;- "+bd2.cell[c].qans);}
			if(bd1.cell[c].qsub!==bd2.cell[c].qsub){
				if(this.qsubf){ result = false; this.addTA("cell qsub "+c+" "+bd1.cell[c].qsub+" &lt;- "+bd2.cell[c].qsub);}
				else{ bd1.cell[c].qsub = bd2.cell[c].qsub;}
			}
		}
		if(!!bd1.isexcell){
			for(var c=0;c<bd1.excell.length;c++){
				if(bd1.excell[c].qnum!==bd2.excell[c].qnum ){ result = false;}
				if(bd1.excell[c].qdir!==bd2.excell[c].qdir){ result = false;}
			}
		}
		if(!!bd1.iscross){
			for(var c=0;c<bd1.cross.length;c++){
				if(bd1.cross[c].ques!==bd2.cross[c].ques){ result = false;}
				if(bd1.cross[c].qnum!==bd2.cross[c].qnum){ result = false;}
			}
		}
		if(!!bd1.isborder){
			for(var i=0;i<bd1.border.length;i++){
				if(bd1.border[i].ques!==bd2.border[i].ques){ result = false; this.addTA("border ques "+i+" "+bd1.border[i].ques+" &lt;- "+bd2.border[i].ques);}
				if(bd1.border[i].qnum!==bd2.border[i].qnum){ result = false; this.addTA("border qnum "+i+" "+bd1.border[i].qnum+" &lt;- "+bd2.border[i].qnum);}
				if(bd1.border[i].qans!==bd2.border[i].qans){ result = false; this.addTA("border qans "+i+" "+bd1.border[i].qans+" &lt;- "+bd2.border[i].qans);}
				if(bd1.border[i].line!==bd2.border[i].line){ result = false; this.addTA("border line "+i+" "+bd1.border[i].line+" &lt;- "+bd2.border[i].line);}
				if(bd1.border[i].qsub!==bd2.border[i].qsub){
					if(this.qsubf){ result = false; this.addTA("border qsub "+i+" "+bd1.border[i].qsub+" &lt;- "+bd2.border[i].qsub);}
					else{ bd1.border[i].qsub = bd2.border[i].qsub;}
				}
			}
		}
		return result;
	}
};

window.ui = {debug:{addDebugData: debug.addDebugData}};

var perfstr = "pzprv3/country/10/18/44/0 0 1 1 1 2 2 2 3 4 4 4 5 5 6 6 7 8 /0 9 1 10 10 10 11 2 3 4 12 4 4 5 6 13 13 8 /0 9 1 1 10 10 11 2 3 12 12 12 4 5 14 13 13 15 /0 9 9 9 10 16 16 16 16 17 12 18 4 5 14 13 15 15 /19 19 19 20 20 20 21 17 17 17 22 18 18 14 14 23 23 24 /19 25 25 26 26 21 21 17 22 22 22 18 27 27 27 24 24 24 /28 28 29 26 30 31 21 32 22 33 33 33 33 34 35 35 35 36 /28 29 29 26 30 31 32 32 32 37 38 39 34 34 40 40 35 36 /41 29 29 42 30 31 31 32 31 37 38 39 34 34 34 40 35 36 /41 43 42 42 30 30 31 31 31 37 38 38 38 40 40 40 36 36 /3 . 6 . . 4 . . 2 . . . . . . . . 1 /. . . 5 . . . . . . . . . . . . . . /. . . . . . . . . 1 . . . . . . . . /. . . . . . . . . . . . . . . . . . /3 . . 2 . . . 4 . . . . . . . . . . /. . . 3 . . . . 4 . . . 2 . . . . . /. . . . 3 6 . . . 4 . . . . . . . . /. 5 . . . . . . . 2 . . 3 . . . . . /. . . . . . . . . . . . . . . . . . /. . . . . . . . . . . . . . . . 5 . /0 0 1 1 0 0 1 0 0 1 1 0 0 0 1 1 0 /1 0 0 0 1 0 0 0 1 0 0 1 0 0 0 0 1 /0 0 1 0 1 0 0 1 0 0 0 0 0 0 0 0 0 /0 1 1 0 0 0 1 0 0 1 1 0 1 0 0 0 1 /1 1 0 0 1 0 0 1 1 0 0 0 0 1 0 1 0 /0 1 0 1 0 1 0 0 1 1 1 0 1 0 0 1 1 /1 0 1 0 0 0 0 1 0 1 1 1 0 0 1 1 0 /0 1 0 0 0 0 1 0 0 0 0 1 1 0 1 0 0 /0 1 1 0 1 1 0 0 1 0 1 0 0 0 0 0 0 /1 1 1 0 0 0 1 1 0 0 1 1 1 1 1 0 1 /0 0 1 0 1 0 1 1 0 1 0 1 0 0 1 0 1 0 /1 1 1 0 0 1 1 1 1 0 0 0 1 0 1 0 0 1 /1 1 0 1 1 0 1 0 0 0 0 0 1 0 1 0 0 1 /1 0 0 0 1 0 0 1 0 1 0 1 0 1 1 0 1 0 /0 0 1 0 0 1 0 0 0 0 0 1 0 0 0 1 0 0 /0 1 0 1 1 0 1 0 1 0 0 0 1 1 0 0 0 1 /1 0 1 0 1 0 1 1 0 1 0 0 0 1 1 0 1 1 /1 1 0 0 1 0 0 0 0 1 0 1 0 0 0 1 1 1 /1 0 0 1 0 0 1 0 1 0 1 0 0 0 0 1 1 1 /2 2 1 1 1 2 0 0 2 0 1 0 0 0 0 0 0 2 /1 1 1 2 1 1 0 0 0 1 2 1 0 0 1 2 0 0 /1 0 1 1 1 1 0 0 1 2 2 2 1 0 1 2 2 0 /1 0 0 1 1 2 1 0 2 1 1 1 1 0 1 2 1 0 /1 1 0 2 1 1 2 0 0 0 2 1 2 1 1 1 0 2 /2 1 0 1 1 1 0 2 0 0 0 0 1 1 2 1 0 0 /1 0 1 1 1 2 1 1 0 0 0 0 0 0 1 0 0 0 /0 1 1 2 1 2 1 1 2 1 2 0 1 0 1 0 0 0 /0 1 1 0 1 1 1 2 0 1 0 1 2 2 2 1 0 0 /0 0 0 1 2 2 1 1 0 2 0 0 1 0 1 0 0 0 /".replace(/\//g, "\n");

})();
