// for_test.js v3.4.0
(function(){

var k = pzprv3.consts;

/* Debug用オブジェクトに関数などを追加する */
ui.debug.extend(
{
	loadperf : function(){
		ui.openFileData(perfstr, function(){
			ui.puzzle.setConfig('mode',3);
			ui.puzzle.setConfig('irowake',true);
		});
	},
	
	accheck1 : function(){
		var outputstr = ui.puzzle.getFileData(k.FILE_PZPH).replace(/[\r\n]+/g, "/");
		var failcode  = ui.puzzle.anscheckSilent();
		this.addTextarea("\t\t\t["+failcode+",\""+outputstr+"\"],");
	},

	urls : {},
	acs  : {},
	addDebugData : function(pid, data){
		this.urls[pid] = data.url;
		this.acs[pid] = data.failcheck;
	},

	alltimer : null,
	phase : 99,
	pid : '',
	all_test : function(){
		if(this.alltimer != null){ return;}
		var pnum=0, term, idlist=[], self = this;
		self.phase = 99;

		for(var id in pzprurl.info){ idlist.push(id);}
		idlist.sort();
		term = idlist.length;

		self.alltimer = setInterval(function(){
			var newid = idlist[pnum];
			if(!self.urls[newid]){
				pzprv3.includeFile("tests/test_"+newid+".js");
				return;
			}

			if(self.phase != 99){ return;}
			self.phase = 0;
			self.pid = newid;
			ui.openURL("?"+newid+"/"+self.urls[newid], function(){
				/* スクリプトチェック開始 */
				self.sccheck();
				self.addTextarea("Test ("+pnum+", "+newid+") start.");
				pnum++;
				if(pnum >= term){ clearInterval(self.alltimer);}
			});
		},500);
	},

	starttest : function(){
		this.erasetext();
		this.sccheck();
	},

	fails : 0,
	sccheck : function(){
		if(ui.puzzle.getConfig('autocheck')){ ui.puzzle.setConfig('autocheck',false);}
		var self = this;

		self.fails = 0;
		self.pid = ui.puzzle.pid;
		setTimeout(function(){ self.check_encode(self);},0);
	},
	//Encode test--------------------------------------------------------------
	check_encode : function(self){
		var inp = pzprurl.constructURL({id:self.pid, type:pzprurl.PZPRV3, qdata:self.urls[self.pid]});
		var ta  = ui.puzzle.getURL(pzprurl.PZPRV3);

		if(inp!=ta){ self.addTextarea("Encode test   = failure...<BR> "+inp+"<BR> "+ta); self.fails++;}
		else if(!self.alltimer){ self.addTextarea("Encode test   = pass");}

		setTimeout(function(){ self.check_encode_kanpen(self);},0);
	},
	check_encode_kanpen : function(self){
		if(pzprurl.info[self.pid].exists.kanpen){
			var o = ui.puzzle, bd = o.board, bd2 = self.bd_freezecopy(bd);

			ui.openURL(o.getURL(pzprurl.KANPEN), function(){
				if(o.getConfig('autocheck')){ o.setConfig('autocheck',false);}

				if(!self.bd_compare(bd,bd2)){ self.addTextarea("Encode kanpen = failure..."); self.fails++;}
				else if(!self.alltimer){ self.addTextarea("Encode kanpen = pass");}
			});
		}
		setTimeout(function(){ self.check_answer(self);},0);
	},
	//Answer test--------------------------------------------------------------
	check_answer : function(self){
		var acsstr = self.acs[self.pid], len = self.acs[self.pid].length;
		for(var n=0;n<acsstr.length;n++){
			ui.openFileData(acsstr[n][1].replace(/\//g,"\n"));
			var failcode = ui.puzzle.anscheck(), compcode = acsstr[n][0];
			var iserror = (failcode !== compcode);
			var errdesc = "("+compcode+":"+pzprv3.failcode[compcode].ja+")";

			var judge = (!iserror ? "pass" : "failure...");
			if(iserror){ self.fails++;}

			if(iserror || !self.alltimer){
				self.addTextarea("Answer test "+(n+1)+" = "+judge+" "+errdesc);
			}
		}
		setTimeout(function(){ self.check_file(self);},0);
	},
	//FileIO test--------------------------------------------------------------
	check_file : function(self){
		var o = ui.puzzle, bd = o.board;
		var outputstr = o.getFileData(k.FILE_PZPR);
		var bd2 = self.bd_freezecopy(bd);

		o.painter.suspendAll();
		bd.initBoardSize(1,1);
		bd.resetInfo();

		ui.openFileData(outputstr, function(){
			if(!self.bd_compare(bd,bd2)){ self.addTextarea("FileIO test   = failure..."); self.fails++;}
			else if(!self.alltimer){ self.addTextarea("FileIO test   = pass");}
		});

		setTimeout(function(){ self.check_file_pbox(self);},0);
	},
	check_file_pbox : function(self){
		if(ui.menu.ispencilbox){
			var o = ui.puzzle, bd = o.board, pid = o.pid;
			var outputstr = o.getFileData(k.FILE_PBOX);
			var bd2 = self.bd_freezecopy(bd);

			o.painter.suspendAll();
			bd.initBoardSize(1,1);
			bd.resetInfo();

			ui.openFileData(outputstr, function(){
				self.qsubf = !(pid=='fillomino'||pid=='hashikake'||pid=='kurodoko'||pid=='shikaku'||pid=='tentaisho');
				if(!self.bd_compare(bd,bd2)){ self.addTextarea("FileIO kanpen = failure..."); self.fails++;}
				else if(!self.alltimer){ self.addTextarea("FileIO kanpen = pass");}
				self.qsubf = true;
			});
		}
		setTimeout(function(){ self.check_turnR1(self);},0);
	},
	//Turn test--------------------------------------------------------------
	check_turnR1 : function(self){
		if(ui.puzzle.getConfig('autocheck')){ ui.puzzle.setConfig('autocheck',false);}

		var bd = ui.puzzle.board, bd2 = self.bd_freezecopy(bd);
		for(var i=0;i<4;i++){ bd.execadjust('turnr');}

		if(!self.bd_compare(bd,bd2)){ self.addTextarea("TurnR test 1  = failure..."); self.fails++;}
		else if(!self.alltimer){ self.addTextarea("TurnR test 1  = pass");}

		setTimeout(function(){ self.check_turnR2(self);},0);
	},
	check_turnR2 : function(self){
		var bd = ui.puzzle.board, bd2 = self.bd_freezecopy(bd);
		for(var i=0;i<4;i++){ ui.puzzle.undo();}

		if(!self.bd_compare(bd,bd2)){ self.addTextarea("TurnR test 2  = failure..."); self.fails++;}
		else if(!self.alltimer){ self.addTextarea("TurnR test 2  = pass");}

		setTimeout(function(){ self.check_turnL1(self);},0);
	},

	check_turnL1 : function(self){
		var bd = ui.puzzle.board, bd2 = self.bd_freezecopy(bd);
		for(var i=0;i<4;i++){ bd.execadjust('turnl');}

		if(!self.bd_compare(bd,bd2)){ self.addTextarea("TurnL test 1  = failure..."); self.fails++;}
		else if(!self.alltimer){ self.addTextarea("TurnL test 1  = pass");}

		setTimeout(function(){ self.check_turnL2(self);},0);
	},
	check_turnL2 : function(self){
		var bd = ui.puzzle.board, bd2 = self.bd_freezecopy(bd);
		for(var i=0;i<4;i++){ ui.puzzle.undo();}

		if(!self.bd_compare(bd,bd2)){ self.addTextarea("TurnL test 2  = failure..."); self.fails++;}
		else if(!self.alltimer){ self.addTextarea("TurnL test 2  = pass");}

		setTimeout(function(){ self.check_flipX1(self);},0);
	},
	//Flip test--------------------------------------------------------------
	check_flipX1 : function(self){
		var bd = ui.puzzle.board, bd2 = self.bd_freezecopy(bd);
		for(var i=0;i<2;i++){ bd.execadjust('flipx');}

		if(!self.bd_compare(bd,bd2)){ self.addTextarea("FlipX test 1  = failure..."); self.fails++;}
		else if(!self.alltimer){ self.addTextarea("FlipX test 1  = pass");}

		setTimeout(function(){ self.check_flipX2(self);},0);
	},
	check_flipX2 : function(self){
		var bd = ui.puzzle.board, bd2 = self.bd_freezecopy(bd);
		for(var i=0;i<2;i++){ ui.puzzle.undo();}

		if(!self.bd_compare(bd,bd2)){ self.addTextarea("FlipX test 2  = failure..."); self.fails++;}
		else if(!self.alltimer){ self.addTextarea("FlipX test 2  = pass");}

		setTimeout(function(){ self.check_flipY1(self);},0);
	},

	check_flipY1 : function(self){
		var bd = ui.puzzle.board, bd2 = self.bd_freezecopy(bd);
		for(var i=0;i<2;i++){ bd.execadjust('flipy');}

		if(!self.bd_compare(bd,bd2)){ self.addTextarea("FlipY test 1  = failure..."); self.fails++;}
		else if(!self.alltimer){ self.addTextarea("FlipY test 1  = pass");}

		setTimeout(function(){ self.check_flipY2(self);},0);
	},
	check_flipY2 : function(self){
		var bd = ui.puzzle.board, bd2 = self.bd_freezecopy(bd);
		for(var i=0;i<2;i++){ ui.puzzle.undo();}

		if(!self.bd_compare(bd,bd2)){ self.addTextarea("FlipY test 2  = failure..."); self.fails++;}
		else if(!self.alltimer){ self.addTextarea("FlipY test 2  = pass");}

		setTimeout(function(){ self.check_adjust1(self);},0);
	},
	//Adjust test--------------------------------------------------------------
	check_adjust1 : function(self){
		var bd = ui.puzzle.board, bd2 = self.bd_freezecopy(bd);
		var names = ['expandup','expanddn','expandlt','expandrt','reduceup','reducedn','reducelt','reducert'];
		for(var i=0;i<8;i++){ bd.execadjust(names[i]);}

		if(!self.bd_compare(bd,bd2)){ self.addTextarea("Adjust test 1  = failure..."); self.fails++;}
		else if(!self.alltimer){ self.addTextarea("Adjust test 1  = pass");}

		setTimeout(function(){ self.check_adjust2(self);},0);
	},
	check_adjust2 : function(self){
		var bd = ui.puzzle.board, bd2 = self.bd_freezecopy(bd);
		for(var i=0;i<8;i++){ ui.puzzle.undo();}

		if(!self.bd_compare(bd,bd2)){ self.addTextarea("Adjust test 2  = failure..."); self.fails++;}
		else if(!self.alltimer){ self.addTextarea("Adjust test 2  = pass");}

		setTimeout(function(){ self.check_end(self);},0);
	},
	//test end--------------------------------------------------------------
	check_end : function(self){
		if(!self.alltimer){ self.addTextarea("Test end.");}
		self.phase = 99;
	},

	taenable : true,
	addTextarea : function(str){
		if(!pzprv3.browser.Gecko){ pzprv3.getEL('testarea').value += (str+"\n");}
		else{
			pzprv3.getEL('testdiv').appendChild(document.createTextNode(str));
			pzprv3.getEL('testdiv').appendChild(document.createElement('br'));
		}
	},

	qsubf : true,
	bd_freezecopy : function(bd1){
		var bd2 = {cell:[],cross:[],border:[],excell:[]};
		for(var c=0;c<bd1.cellmax;c++){
			bd2.cell[c] = {};
			bd2.cell[c].ques=bd1.cell[c].ques;
			bd2.cell[c].qnum=bd1.cell[c].qnum;
			bd2.cell[c].qdir=bd1.cell[c].qdir;
			bd2.cell[c].anum=bd1.cell[c].anum;
			bd2.cell[c].qans=bd1.cell[c].qans;
			bd2.cell[c].qsub=bd1.cell[c].qsub;
		}
		if(!!bd1.isexcell){
			for(var c=0;c<bd1.excellmax;c++){
				bd2.excell[c] = {};
				bd2.excell[c].qnum=bd1.excell[c].qnum;
				bd2.excell[c].qdir=bd1.excell[c].qdir;
			}
		}
		if(!!bd1.iscross){
			for(var c=0;c<bd1.crossmax;c++){
				bd2.cross[c] = {};
				bd2.cross[c].ques=bd1.cross[c].ques;
				bd2.cross[c].qnum=bd1.cross[c].qnum;
			}
		}
		if(!!bd1.isborder){
			for(var i=0;i<bd1.bdmax;i++){
				bd2.border[i] = {};
				bd2.border[i].ques=bd1.border[i].ques;
				bd2.border[i].qnum=bd1.border[i].qnum;
				bd2.border[i].qans=bd1.border[i].qans;
				bd2.border[i].qsub=bd1.border[i].qsub;
				bd2.border[i].line=bd1.border[i].line;
			}
		}
		return bd2;
	},
	bd_compare : function(bd1,bd2){
//		this.taenable = false;
		var result = true;
		for(var c=0,len=Math.min(bd1.cell.length,bd2.cell.length);c<len;c++){
			if(bd1.cell[c].ques!=bd2.cell[c].ques){ result = false; this.addTextarea("cell ques "+c+" "+bd1.cell[c].ques+" &lt;- "+bd2.cell[c].ques);}
			if(bd1.cell[c].qnum!=bd2.cell[c].qnum){ result = false; this.addTextarea("cell qnum "+c+" "+bd1.cell[c].qnum+" &lt;- "+bd2.cell[c].qnum);}
			if(bd1.cell[c].qdir!=bd2.cell[c].qdir){ result = false; this.addTextarea("cell qdir "+c+" "+bd1.cell[c].qdir+" &lt;- "+bd2.cell[c].qdir);}
			if(bd1.cell[c].anum!=bd2.cell[c].anum){ result = false; this.addTextarea("cell anum "+c+" "+bd1.cell[c].anum+" &lt;- "+bd2.cell[c].anum);}
			if(bd1.cell[c].qans!=bd2.cell[c].qans){ result = false; this.addTextarea("cell qans "+c+" "+bd1.cell[c].qans+" &lt;- "+bd2.cell[c].qans);}
			if(bd1.cell[c].qsub!=bd2.cell[c].qsub){
				if(this.qsubf){ result = false; this.addTextarea("cell qsub "+c+" "+bd1.cell[c].qsub+" &lt;- "+bd2.cell[c].qsub);}
				else{ bd1.cell[c].qsub = bd2.cell[c].qsub;}
			}
		}
		if(!!bd1.isexcell){
			for(var c=0;c<bd1.excell.length;c++){
				if(bd1.excell[c].qnum!=bd2.excell[c].qnum ){ result = false;}
				if(bd1.excell[c].qdir!=bd2.excell[c].qdir){ result = false;}
			}
		}
		if(!!bd1.iscross){
			for(var c=0;c<bd1.cross.length;c++){
				if(bd1.cross[c].ques!=bd2.cross[c].ques){ result = false;}
				if(bd1.cross[c].qnum!=bd2.cross[c].qnum){ result = false;}
			}
		}
		if(!!bd1.isborder){
			for(var i=0;i<bd1.border.length;i++){
				if(bd1.border[i].ques!=bd2.border[i].ques){ result = false; this.addTextarea("border ques "+i+" "+bd1.border[i].ques+" &lt;- "+bd2.border[i].ques);}
				if(bd1.border[i].qnum!=bd2.border[i].qnum){ result = false; this.addTextarea("border qnum "+i+" "+bd1.border[i].qnum+" &lt;- "+bd2.border[i].qnum);}
				if(bd1.border[i].qans!=bd2.border[i].qans){ result = false; this.addTextarea("border qans "+i+" "+bd1.border[i].qans+" &lt;- "+bd2.border[i].qans);}
				if(bd1.border[i].line!=bd2.border[i].line){ result = false; this.addTextarea("border line "+i+" "+bd1.border[i].line+" &lt;- "+bd2.border[i].line);}
				if(bd1.border[i].qsub!=bd2.border[i].qsub){
					if(this.qsubf){ result = false; this.addTextarea("border qsub "+i+" "+bd1.border[i].qsub+" &lt;- "+bd2.border[i].qsub);}
					else{ bd1.border[i].qsub = bd2.border[i].qsub;}
				}
			}
		}
//		this.taenable = true;
		return result;
	}
});

var perfstr = "pzprv3/country/10/18/44/0 0 1 1 1 2 2 2 3 4 4 4 5 5 6 6 7 8 /0 9 1 10 10 10 11 2 3 4 12 4 4 5 6 13 13 8 /0 9 1 1 10 10 11 2 3 12 12 12 4 5 14 13 13 15 /0 9 9 9 10 16 16 16 16 17 12 18 4 5 14 13 15 15 /19 19 19 20 20 20 21 17 17 17 22 18 18 14 14 23 23 24 /19 25 25 26 26 21 21 17 22 22 22 18 27 27 27 24 24 24 /28 28 29 26 30 31 21 32 22 33 33 33 33 34 35 35 35 36 /28 29 29 26 30 31 32 32 32 37 38 39 34 34 40 40 35 36 /41 29 29 42 30 31 31 32 31 37 38 39 34 34 34 40 35 36 /41 43 42 42 30 30 31 31 31 37 38 38 38 40 40 40 36 36 /3 . 6 . . 4 . . 2 . . . . . . . . 1 /. . . 5 . . . . . . . . . . . . . . /. . . . . . . . . 1 . . . . . . . . /. . . . . . . . . . . . . . . . . . /3 . . 2 . . . 4 . . . . . . . . . . /. . . 3 . . . . 4 . . . 2 . . . . . /. . . . 3 6 . . . 4 . . . . . . . . /. 5 . . . . . . . 2 . . 3 . . . . . /. . . . . . . . . . . . . . . . . . /. . . . . . . . . . . . . . . . 5 . /0 0 1 1 0 0 1 0 0 1 1 0 0 0 1 1 0 /1 0 0 0 1 0 0 0 1 0 0 1 0 0 0 0 1 /0 0 1 0 1 0 0 1 0 0 0 0 0 0 0 0 0 /0 1 1 0 0 0 1 0 0 1 1 0 1 0 0 0 1 /1 1 0 0 1 0 0 1 1 0 0 0 0 1 0 1 0 /0 1 0 1 0 1 0 0 1 1 1 0 1 0 0 1 1 /1 0 1 0 0 0 0 1 0 1 1 1 0 0 1 1 0 /0 1 0 0 0 0 1 0 0 0 0 1 1 0 1 0 0 /0 1 1 0 1 1 0 0 1 0 1 0 0 0 0 0 0 /1 1 1 0 0 0 1 1 0 0 1 1 1 1 1 0 1 /0 0 1 0 1 0 1 1 0 1 0 1 0 0 1 0 1 0 /1 1 1 0 0 1 1 1 1 0 0 0 1 0 1 0 0 1 /1 1 0 1 1 0 1 0 0 0 0 0 1 0 1 0 0 1 /1 0 0 0 1 0 0 1 0 1 0 1 0 1 1 0 1 0 /0 0 1 0 0 1 0 0 0 0 0 1 0 0 0 1 0 0 /0 1 0 1 1 0 1 0 1 0 0 0 1 1 0 0 0 1 /1 0 1 0 1 0 1 1 0 1 0 0 0 1 1 0 1 1 /1 1 0 0 1 0 0 0 0 1 0 1 0 0 0 1 1 1 /1 0 0 1 0 0 1 0 1 0 1 0 0 0 0 1 1 1 /2 2 1 1 1 2 0 0 2 0 1 0 0 0 0 0 0 2 /1 1 1 2 1 1 0 0 0 1 2 1 0 0 1 2 0 0 /1 0 1 1 1 1 0 0 1 2 2 2 1 0 1 2 2 0 /1 0 0 1 1 2 1 0 2 1 1 1 1 0 1 2 1 0 /1 1 0 2 1 1 2 0 0 0 2 1 2 1 1 1 0 2 /2 1 0 1 1 1 0 2 0 0 0 0 1 1 2 1 0 0 /1 0 1 1 1 2 1 1 0 0 0 0 0 0 1 0 0 0 /0 1 1 2 1 2 1 1 2 1 2 0 1 0 1 0 0 0 /0 1 1 0 1 1 1 2 0 1 0 1 2 2 2 1 0 0 /0 0 0 1 2 2 1 1 0 2 0 0 1 0 1 0 0 0 /".replace(/\//g, "\n");

})();
