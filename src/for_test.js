// for_test.js v3.4.0
(function(){

var k = pzprv3.consts;

/* Debug用オブジェクトに関数などを追加する */
ui.debug.extend(
{
	accheck1 : function(){
		var outputstr = ui.puzzle.fio.fileencode(k.PZPH).replace(/[\r\n]+/g, "/");
		var failcode = ui.puzzle.anscheckSilent();
		this.addTextarea("\t\t\t["+failcode+",\""+outputstr+"\"],");
	},

	alltimer : null,
	phase : 99,
	pid : '',
	all_test : function(){
		if(this.alltimer != null){ return;}
		var pnum=0, term, idlist=[], self = this;
		self.phase = 99;

		for(var i in self.urls){ idlist.push(i);}
		idlist.sort();
		term = idlist.length;

		self.alltimer = setInterval(function(){
			if(self.phase != 99){ return;}
			self.phase = 0;

			var newid = idlist[pnum];
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
		var inp = pzprv3.getURLBase(k.PZPRV3, self.pid)+self.urls[self.pid];
		var ta  = ui.puzzle.enc.pzloutput(k.PZPRV3);

		if(inp!=ta){ self.addTextarea("Encode test   = failure...<BR> "+inp+"<BR> "+ta); self.fails++;}
		else if(!self.alltimer){ self.addTextarea("Encode test   = pass");}

		setTimeout(function(){ self.check_encode_kanpen(self);},0);
	},
	check_encode_kanpen : function(self){
		if(pzprv3.PZLINFO.info[self.pid].exists.kanpen){
			var o = ui.puzzle, bd = o.board, bd2 = self.bd_freezecopy(bd);

			ui.openURL(o.enc.pzloutput(k.KANPEN), function(){
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
			var errdesc = "("+compcode+":"+pzprv3.failcode[compcode][0]+")";

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
		var o = ui.puzzle, bd = o.board, outputstr = o.fio.fileencode(k.PZPR);
		var bd2 = self.bd_freezecopy(bd);

		o.painter.suspendAll();
		bd.initBoardSize(1,1);
		bd.resetInfo();

		o.fio.filedecode(outputstr);
		o.painter.unsuspend();

		if(!self.bd_compare(bd,bd2)){ self.addTextarea("FileIO test   = failure..."); self.fails++;}
		else if(!self.alltimer){ self.addTextarea("FileIO test   = pass");}

		setTimeout(function(){ self.check_file_pbox(self);},0);
	},
	check_file_pbox : function(self){
		if(ui.menu.ispencilbox){
			var o = ui.puzzle, bd = o.board, pid = o.pid, outputstr = o.fio.fileencode(k.PBOX);
			var bd2 = self.bd_freezecopy(bd);

			o.painter.suspendAll();
			bd.initBoardSize(1,1);
			bd.resetInfo();

			o.fio.filedecode(outputstr);
			o.painter.unsuspend();

			self.qsubf = !(pid=='fillomino'||pid=='hashikake'||pid=='kurodoko'||pid=='shikaku'||pid=='tentaisho');
			if(!self.bd_compare(bd,bd2)){ self.addTextarea("FileIO kanpen = failure..."); self.fails++;}
			else if(!self.alltimer){ self.addTextarea("FileIO kanpen = pass");}
			self.qsubf = true;
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
	},

	acs : {
		amibo : [
			[48301,"pzprv3/amibo/5/5/2 . . . 4 /. # - - . /3 l . . . /. l # 3 . /. . . . . /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			[48311,"pzprv3/amibo/5/5/2 - - . 4 /. # . . l /3 + - - + /. l # 3 l /- + - - + /0 0 -1 -1 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			[50421,"pzprv3/amibo/5/5/2 - + . 4 /. # l . l /3 - - - + /. . # 3 l /. . . . l /0 0 -1 -1 /-1 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /-1 -1 0 0 0 /0 0 -1 0 0 /0 0 -1 0 0 /0 0 0 0 0 /"],
			[48321,"pzprv3/amibo/5/5/2 - + . 4 /. # l . l /3 - - . l /. . # 3 l /. . . . l /0 0 -1 -1 /-1 0 0 0 /0 0 0 -1 /0 0 0 0 /0 0 0 0 /-1 -1 0 0 0 /-1 0 -1 0 0 /-1 0 -1 0 0 /-1 0 0 0 0 /"],
			[50431,"pzprv3/amibo/5/5/2 - + l 4 /. # l + + /3 - - + l /. . # 3 . /. . . . . /0 0 -1 -1 /-1 0 0 0 /0 0 0 -1 /0 0 -1 -1 /0 0 0 0 /-1 -1 0 0 0 /-1 0 -1 0 0 /-1 0 -1 0 0 /-1 0 0 -1 0 /"],
			[43511,"pzprv3/amibo/5/5/2 - + l 4 /. # l l l /3 - - + l /. . # 3 l /. - - - + /0 0 -1 -1 /-1 0 0 0 /0 0 0 -1 /0 0 -1 -1 /-1 0 0 0 /-1 -1 0 0 0 /-1 0 -1 0 0 /-1 0 -1 0 0 /-1 0 0 -1 0 /"],
			[43611,"pzprv3/amibo/5/5/2 - + l 4 /. # + + l /3 - - + l /- + # 3 l /. + - - + /0 0 -1 -1 /-1 0 0 0 /0 0 0 -1 /0 0 -1 -1 /-1 0 0 0 /-1 -1 0 0 0 /-1 0 -1 0 0 /-1 0 -1 0 0 /-1 0 0 -1 0 /"],
			[0,"pzprv3/amibo/5/5/2 - + l 4 /. # + + + /3 - - + l /- + # 3 l /. + - - + /0 0 -1 -1 /-1 0 0 0 /0 0 0 -1 /0 0 -1 -1 /-1 0 0 0 /-1 -1 0 0 0 /-1 0 -1 0 0 /-1 0 -1 0 0 /-1 0 0 -1 0 /"]
		],
		aho : [
			[30004,"pzprv3/aho/6/6/4 . . . 2 6 /4 . . . . . /. . . 6 . . /. . 3 . . . /. . . . . 2 /2 3 . . . 4 /1 0 1 0 0 /1 1 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 1 0 0 0 /0 1 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /"],
			[30012,"pzprv3/aho/6/6/4 . . . 2 6 /4 . . . . . /. . . 6 . . /. . 3 . . . /. . . . . 2 /2 3 . . . 4 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /"],
			[39301,"pzprv3/aho/6/6/4 . . . 2 6 /4 . . . . . /. . . 6 . . /. . 3 . . . /. . . . . 2 /2 3 . . . 4 /-1 -1 -1 1 1 /0 0 0 1 1 /0 0 0 1 -1 /0 1 0 1 -1 /1 1 1 1 0 /1 0 1 0 0 /1 1 1 1 -1 -1 /1 1 1 1 1 -1 /0 0 1 1 -1 -1 /1 1 0 1 1 1 /0 0 1 0 1 1 /"],
			[39311,"pzprv3/aho/6/6/4 . . . 2 6 /4 . . . . . /. . . 6 . . /. . 3 . . . /. . . . . 2 /2 3 . . . 4 /-1 -1 -1 1 1 /0 0 0 1 1 /0 0 0 1 -1 /1 1 1 1 -1 /1 1 0 1 0 /1 1 0 0 0 /1 1 1 1 -1 -1 /1 1 1 1 1 -1 /0 1 1 0 -1 -1 /1 0 0 1 1 1 /0 0 1 1 1 1 /"],
			[30021,"pzprv3/aho/6/6/4 . . . 2 6 /4 . . . . . /. . . 6 . . /. . 3 . . . /. . . . . 2 /2 3 . . . 4 /-1 -1 2 0 1 /0 0 1 0 1 /0 0 0 1 -1 /0 1 0 1 -1 /1 0 1 1 0 /1 1 0 0 0 /1 1 1 0 -1 -1 /1 1 1 1 1 -1 /0 0 1 1 -1 -1 /1 1 1 0 1 1 /0 0 1 1 1 1 /"],
			[32101,"pzprv3/aho/6/6/4 . . . 2 6 /4 . . . . . /. . . 6 . . /. . 3 . . . /. . . . . 2 /2 3 . . . 4 /-1 -1 -1 1 1 /0 0 0 1 1 /1 0 0 1 -1 /0 1 0 1 -1 /1 0 1 1 0 /1 1 0 0 0 /1 1 1 1 -1 -1 /1 1 1 1 1 -1 /0 0 1 1 -1 -1 /1 1 1 0 1 1 /0 0 1 1 1 1 /"],
			[0,"pzprv3/aho/6/6/4 . . . 2 6 /4 . . . . . /. . . 6 . . /. . 3 . . . /. . . . . 2 /2 3 . . . 4 /-1 -1 -1 1 1 /0 0 0 1 1 /0 0 0 1 -1 /0 1 0 1 -1 /1 0 1 1 0 /1 1 0 0 0 /1 1 1 1 -1 -1 /1 1 1 1 1 -1 /0 0 1 1 -1 -1 /1 1 1 0 1 1 /0 0 1 1 1 1 /"]
		],
		ayeheya : [
			[10021,"pzprv3/ayeheya/6/6/11/0 0 1 1 1 2 /0 0 1 1 1 3 /4 4 5 5 6 6 /7 7 5 5 6 6 /7 7 8 8 8 8 /7 7 9 10 10 10 /. . . . . . /. . . . . . /. . 2 . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. # . . . . /. # . . . . /. . . . . . /. . . . . . /. . . . . . /"],
			[10020,"pzprv3/ayeheya/6/6/11/0 0 1 1 1 2 /0 0 1 1 1 3 /4 4 5 5 6 6 /7 7 5 5 6 6 /7 7 8 8 8 8 /7 7 9 10 10 10 /. . . . . . /. . . . . . /. . 2 . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . # /. . . . # . /. . . # . . /. . # . . . /. # . . . . /# . . . . . /"],
			[90111,"pzprv3/ayeheya/6/6/11/0 0 1 1 1 2 /0 0 1 1 1 3 /4 4 5 5 6 6 /7 7 5 5 6 6 /7 7 8 8 8 8 /7 7 9 10 10 10 /. . . . . . /. . . . . . /. . 2 . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . # . # . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /"],
			[30091,"pzprv3/ayeheya/6/6/11/0 0 1 1 1 2 /0 0 1 1 1 3 /4 4 5 5 6 6 /7 7 5 5 6 6 /7 7 8 8 8 8 /7 7 9 10 10 10 /. . . . . . /. . . . . . /. . 2 . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /"],
			[90101,"pzprv3/ayeheya/6/6/11/0 0 1 1 1 2 /0 0 1 1 1 3 /4 4 5 5 6 6 /7 7 5 5 6 6 /7 7 8 8 8 8 /7 7 9 10 10 10 /. . . . . . /. . . . . . /. . 2 . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . # . . . /. . . # . . /. . . . . . /. . . . . . /"],
			[20010,"pzprv3/ayeheya/6/6/9/0 1 1 2 2 2 /1 1 1 2 2 2 /1 1 3 3 4 4 /5 5 3 3 4 4 /5 5 6 6 6 6 /5 5 7 8 8 8 /. . . . . . /. . . . . . /. . 2 . . . /. . . . . . /. . . . . . /. . . . . . /# . . . . . /. . . . . . /. . . # . # /# . # . # . /. . . . . . /. # . # . # /"],
			[0,"pzprv3/ayeheya/6/6/11/0 0 1 1 1 2 /0 0 1 1 1 3 /4 4 5 5 6 6 /7 7 5 5 6 6 /7 7 8 8 8 8 /7 7 9 10 10 10 /. . . . . . /. . . . . . /. . 2 . . . /. . . . . . /. . . . . . /. . . . . . /# + + + + # /+ # + + + + /+ + + # + # /# + # . # . /+ + . . . . /+ # . # . # /"]
		],
		bag : [
			[40201,"pzprv3/bag/6/6/. 3 . . . . /. . . . . . /. 2 . . 3 . /. . . 11 . . /. . 3 . . . /3 . . . 2 . /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 0 /0 0 0 0 0 0 0 /0 0 1 0 0 0 0 /0 0 1 0 0 0 0 /0 0 1 0 0 0 0 /0 0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /1 1 1 1 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /"],
			[40301,"pzprv3/bag/6/6/. 3 . . . . /. . . . . . /. 2 . . 3 . /. . . 11 . . /. . 3 . . . /3 . . . 2 . /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 1 0 0 0 0 /0 0 1 0 0 0 0 /0 0 1 0 0 0 0 /0 0 1 0 0 0 0 /0 0 1 0 0 0 0 /0 0 0 0 0 0 0 /0 0 1 0 0 0 /0 0 0 0 0 0 /1 1 1 1 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /"],
			[41101,"pzprv3/bag/6/6/. 3 . . . . /. . . . . . /. 2 . . 3 . /. . . 11 . . /. . 3 . . . /3 . . . 2 . /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 1 0 1 0 0 /0 0 0 1 1 0 0 /1 0 0 0 0 0 0 /1 0 0 0 0 0 0 /1 0 1 0 0 0 0 /0 0 0 0 0 0 0 /0 0 1 1 0 0 /0 0 1 0 0 0 /1 1 0 1 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /1 1 0 0 0 0 /0 0 0 0 0 0 /"],
			[40101,"pzprv3/bag/6/6/. 3 . . . . /. . . . . . /. 2 . . 3 . /. . . 11 . . /. . 3 . . . /3 . . . 2 . /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 1 0 1 0 0 /0 0 0 0 1 0 0 /1 0 0 0 0 0 0 /1 0 0 0 0 0 0 /1 0 1 0 0 0 0 /0 0 0 0 0 0 0 /0 0 1 1 0 0 /0 0 1 0 0 0 /1 1 1 1 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /1 1 0 0 0 0 /0 0 0 0 0 0 /"],
			[29101,"pzprv3/bag/6/6/. 3 . . . . /. . . . . . /. 2 . . 3 . /. . . 11 . . /. . 3 . . . /3 . . . 2 . /0 0 0 1 2 0 /2 2 2 1 2 2 /2 1 2 1 1 2 /1 1 1 1 1 1 /1 2 1 1 2 2 /1 2 2 1 1 2 /0 0 0 1 1 0 0 /0 0 0 1 1 0 0 /0 1 1 1 0 1 0 /1 0 0 0 0 0 1 /1 1 1 0 1 0 0 /1 1 0 1 0 1 0 /0 0 0 1 0 0 /0 0 0 0 0 0 /0 1 0 0 1 0 /1 0 1 0 0 1 /0 1 0 0 1 1 /0 0 1 0 1 0 /1 0 0 1 1 0 /"],
			[29111,"pzprv3/bag/6/6/. 3 . . . . /. . . . . . /. 2 . . 3 . /. . . 11 . . /. . 3 . . . /3 . . . 2 . /1 1 1 1 2 0 /2 2 2 1 2 2 /2 1 2 1 1 2 /1 1 1 1 1 1 /1 2 1 1 2 2 /1 2 2 1 1 2 /1 0 0 0 1 0 0 /0 0 0 1 1 0 0 /0 1 1 1 0 1 0 /1 0 0 0 0 0 1 /1 1 1 0 1 0 0 /1 1 0 1 0 1 0 /1 1 1 1 0 0 /1 1 1 0 0 0 /0 1 0 0 1 0 /1 0 1 0 0 1 /0 1 0 0 1 1 /0 0 1 0 1 0 /1 0 0 1 1 0 /"],
			[0,"pzprv3/bag/6/6/. 3 . . . . /. . . . . . /. 2 . . 3 . /. . . 11 . . /. . 3 . . . /3 . . . 2 . /2 1 1 1 2 0 /2 2 2 1 2 2 /2 1 2 1 1 2 /1 1 1 1 1 1 /1 2 1 1 2 2 /1 2 2 1 1 2 /0 1 0 0 1 0 0 /0 0 0 1 1 0 0 /0 1 1 1 0 1 0 /1 0 0 0 0 0 1 /1 1 1 0 1 0 0 /1 1 0 1 0 1 0 /0 1 1 1 0 0 /0 1 1 0 0 0 /0 1 0 0 1 0 /1 0 1 0 0 1 /0 1 0 0 1 1 /0 0 1 0 1 0 /1 0 0 1 1 0 /"]
		],
		barns : [
			[50151,"pzprv3/barns/5/5/. . . . . /. . 1 1 . /. 1 1 1 . /. 1 1 . . /. . . . . /0 1 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 1 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			[40201,"pzprv3/barns/5/5/. . . . . /. . 1 1 . /. 1 1 1 . /. 1 1 . . /. . . . . /0 1 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 1 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /1 1 1 1 /0 1 0 0 0 /0 1 0 0 0 /0 1 0 0 0 /0 1 0 0 0 /"],
			[40501,"pzprv3/barns/5/5/. . . . . /. . 1 1 . /. 1 1 1 . /. 1 1 . . /. . . . . /0 1 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 1 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 1 /1 1 1 1 /0 0 0 0 /0 0 0 0 /0 1 1 1 /0 1 0 0 1 /0 1 0 0 0 /0 1 0 0 0 /0 1 0 0 0 /"],
			[40601,"pzprv3/barns/5/5/. . . . . /. . 1 1 . /. 1 1 1 . /. 1 1 . . /. . . . . /0 1 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 1 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 1 /0 0 1 1 /0 1 0 0 /0 0 0 0 /0 1 1 1 /0 0 0 0 1 /0 0 1 0 0 /0 1 0 0 0 /0 1 0 0 0 /"],
			[41101,"pzprv3/barns/5/5/. . . . . /. . 1 1 . /. 1 1 1 . /. 1 1 . . /. . . . . /0 1 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 1 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 1 /0 0 1 1 /0 0 0 0 /0 0 0 0 /0 1 1 1 /0 0 0 0 1 /0 0 0 0 0 /0 1 0 0 0 /0 1 0 0 0 /"],
			[40101,"pzprv3/barns/5/5/. . . . . /. . 1 1 . /. 1 1 1 . /. 1 1 . . /. . . . . /0 1 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 1 /0 0 0 0 0 /0 0 0 0 0 /1 0 1 1 /0 1 1 1 /1 1 1 1 /1 0 0 0 /1 1 0 1 /1 1 1 0 1 /1 0 1 0 0 /0 0 1 0 1 /1 0 1 1 1 /"],
			[0,"pzprv3/barns/5/5/. . . . . /. . 1 1 . /. 1 1 1 . /. 1 1 . . /. . . . . /0 1 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 1 /0 0 0 0 0 /0 0 0 0 0 /1 0 1 1 /0 1 1 1 /1 1 1 1 /1 1 1 0 /1 1 -1 1 /1 1 1 -1 1 /1 -1 1 -1 0 /-1 -1 1 -1 1 /1 -1 1 1 1 /"]
		],
		bdblock : [
			[32501,"pzprv3/bdblock/5/5/1 2 3 4 5 /. . . . . /. . . . 5 /1 . 4 . . /. 3 . . . /. 1 1 1 1 . /. . . . . . /. 1 . . . . /. . . . . 1 /1 . . . . . /. . . 1 . . /1 0 0 0 /1 0 0 0 /1 0 0 0 /1 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /1 1 1 0 0 /"],
			[32511,"pzprv3/bdblock/5/5/1 2 3 4 5 /. . . . . /. . . . 5 /1 . 4 . . /. 3 . . . /. 1 1 1 1 . /. . . . . . /. 1 . . . . /. . . . . 1 /1 . . . . . /. . . 1 . . /1 0 0 0 /1 0 0 0 /1 1 0 0 /0 1 1 0 /0 0 1 0 /0 0 0 0 0 /0 1 0 0 0 /0 1 1 0 0 /1 1 0 0 0 /"],
			[30002,"pzprv3/bdblock/5/5/1 2 3 4 5 /. . . . . /. . . . 5 /1 . 4 . . /. 3 . . . /. 1 1 1 1 . /. . . . . . /. 1 . . . . /. . . . . 1 /1 . . . . . /. . . 1 . . /1 0 0 0 /1 0 0 0 /1 1 0 0 /0 1 1 0 /0 0 1 0 /0 0 0 0 0 /0 1 0 0 0 /0 0 0 1 1 /1 1 0 0 0 /"],
			[30028,"pzprv3/bdblock/5/5/1 2 3 4 5 /. . . . . /. . . . 5 /1 . 4 . . /. 3 . . . /. 1 1 1 1 . /. . . . . . /. 1 . . . . /. . . . . 1 /1 . . . . . /. . . 1 . . /0 1 0 0 /0 1 0 0 /0 1 0 0 /0 1 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /1 1 0 0 0 /"],
			[30402,"pzprv3/bdblock/5/5/1 2 3 4 5 /. . . . . /. . . . 5 /1 . 4 . . /. 3 . . 1 /. 1 1 1 1 . /. . . . . . /. 1 . . . . /. . . . 1 1 /1 . . . . . /. . . 1 1 . /1 1 1 1 /1 1 1 1 /1 0 1 1 /1 1 0 1 /0 0 1 1 /0 0 0 0 0 /0 1 0 0 0 /0 0 1 0 1 /1 0 1 0 0 /"],
			[32101,"pzprv3/bdblock/5/5/1 2 3 4 5 /. . . . . /. . . . 5 /1 . 4 . . /. 3 . . . /. 1 1 1 1 . /. . . . . . /. 1 . . . . /. . . . . 1 /1 . . . . . /. . . 1 1 . /1 1 1 1 /1 1 1 1 /1 0 1 1 /1 1 0 0 /0 0 1 1 /0 0 0 0 0 /0 1 0 0 0 /0 0 1 0 1 /1 0 1 0 0 /"],
			[32611,"pzprv3/bdblock/5/5/1 2 3 4 5 /. . . . . /. . . . 5 /1 . 4 . . /. 3 . . . /. 1 1 1 1 . /. . . . . . /. 1 . . . . /. . . . . 1 /1 . . . . . /. . . 1 1 . /1 1 1 1 /1 1 1 1 /1 0 1 1 /1 1 0 0 /0 0 1 0 /0 0 0 0 0 /0 1 0 0 0 /0 0 1 0 1 /1 0 1 0 0 /"],
			[32621,"pzprv3/bdblock/5/5/1 2 3 4 5 /. . . . . /. . . . 5 /1 . 4 . . /. 3 . . . /. 1 1 1 1 . /. . . . . . /. 1 . . . . /. . . . . 1 /1 . . . 1 . /. . . 1 . . /1 1 1 1 /1 1 1 1 /1 0 1 1 /1 1 0 0 /0 0 1 0 /0 0 0 0 0 /0 1 0 0 0 /0 0 1 0 1 /1 0 1 0 0 /"],
			[0,"pzprv3/bdblock/5/5/1 2 3 4 5 /. . . . . /. . . . 5 /1 . 4 . . /. 3 . . . /. 1 1 1 1 . /. . . . . . /. 1 . . . . /. . . . . 1 /1 . . . . . /. . . 1 . . /1 1 1 1 /1 1 1 1 /1 -1 1 1 /1 1 -1 -1 /-1 -1 1 -1 /0 0 -1 -1 0 /0 1 -1 -1 0 /0 -1 1 -1 1 /1 -1 1 -1 -1 /"]
		],
		bonsan:[
			[40201,"pzprv3/bonsan/5/5/. . . - . /. - . . . /2 . . . - /. . . 3 . /. 2 . . . /0 0 0 0 0 /0 0 0 0 0 /1 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /1 1 1 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 1 0 0 /0 0 0 0 0 /"],
			[40301,"pzprv3/bonsan/5/5/. . . - . /. - . . . /2 . . . - /. . . 3 . /. 2 . . . /0 0 0 0 0 /0 0 0 0 0 /1 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /1 1 1 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 1 0 0 /0 0 1 0 0 /"],
			[30016,"pzprv3/bonsan/5/5/. . . - . /. - . . . /2 . . . - /. . . 3 . /. 2 . . . /0 0 0 0 0 /0 0 0 0 0 /1 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 /0 0 0 0 /1 1 1 1 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			[43102,"pzprv3/bonsan/5/5/. . . - . /. - . . . /2 . . . - /. . . 3 . /. 2 . . . /0 0 0 0 0 /0 0 0 0 0 /1 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 1 0 0 0 /0 1 0 0 0 /0 1 0 0 0 /0 0 0 0 0 /"],
			[20013,"pzprv3/bonsan/5/5/. . . - . /. - . . . /2 . . . - /. . . 3 . /. 2 . . . /0 0 0 0 0 /0 1 1 1 2 /1 0 0 0 0 /2 1 1 1 0 /0 0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 /0 0 0 0 /1 1 0 0 /1 1 1 0 /0 0 0 0 /0 0 0 0 0 /0 0 1 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			[50401,"pzprv3/bonsan/5/5/. . . - . /. - . . . /2 . . . - /. . . 3 . /. 2 . . . /0 0 0 0 0 /0 1 1 1 2 /1 0 0 0 0 /2 1 1 1 0 /0 0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 /0 0 0 0 /1 1 1 0 /1 1 1 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			[30501,"pzprv3/bonsan/5/5/. . . - . /. - . . . /2 . . . - /. . . 3 . /. 2 . . . /0 0 0 0 0 /0 1 1 1 2 /1 0 0 0 0 /2 1 1 1 0 /0 0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /1 1 1 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			[50411,"pzprv3/bonsan/5/5/. . . - . /. - . . . /2 . . . - /. . . 3 . /. 2 . . . /2 2 0 0 0 /0 1 1 1 2 /0 0 0 0 1 /2 1 1 1 0 /0 1 1 2 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 1 1 0 /0 1 1 1 /0 0 0 0 /1 1 1 0 /0 1 1 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			[43202,"pzprv3/bonsan/5/5/. . . - . /. - . . . /2 . . . - /. . . 3 . /. 2 . . . /2 2 0 0 0 /0 1 1 1 2 /0 0 0 0 1 /2 1 1 1 0 /0 1 1 2 2 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 1 1 0 /0 1 1 1 /0 1 1 0 /1 1 1 0 /0 1 1 0 /1 0 0 0 0 /1 0 0 0 0 /0 0 0 0 1 /0 0 0 0 1 /"],
			[0,"pzprv3/bonsan/5/5/. . . - . /. - . . . /2 . . . - /. . . 3 . /. 2 . . . /2 2 0 0 0 /1 1 1 1 2 /1 0 0 0 1 /2 1 1 1 0 /0 1 1 2 2 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 1 1 0 /0 1 1 1 /0 0 0 0 /1 1 1 0 /0 1 1 0 /1 0 0 0 0 /1 0 0 0 0 /0 0 0 0 1 /0 0 0 0 1 /"]
		],
		bosanowa : [
			[69401,"pzprv3/bosanowa/5/6/. 2 0 . . . /. 0 0 0 2 . /0 0 . 0 0 0 /0 3 0 4 0 . /. 0 3 . . . /. . 3 . . . /. 4 0 0 . . /0 0 . 0 0 0 /0 . 0 . 0 . /. 0 . . . . /. . . . . /. . . . . /. . . . . /. . . . . /. . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /"],
			[50201,"pzprv3/bosanowa/5/6/. 2 0 . . . /. 0 0 0 2 . /0 0 . 0 0 0 /0 3 0 4 0 . /. 0 3 . . . /. . 0 . . . /. 0 0 0 . . /0 0 . 0 0 0 /0 . 0 . 0 . /. 0 . . . . /. . . . . /. . . . . /. . . . . /. . . . . /. . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /"],
			[0,"pzprv3/bosanowa/5/6/. 2 0 . . . /. 0 0 0 2 . /0 0 . 0 0 0 /0 3 0 4 0 . /. 0 3 . . . /. . 3 . . . /. 3 5 4 . . /6 3 . 3 2 1 /3 . 5 . 2 . /. 2 . . . . /. 1 . . . /. 2 1 2 . /3 . . 1 . /0 . 1 2 . /. . . . . /. 1 2 . . . /. 0 . 1 0 . /3 0 . 1 0 . /. . . . . . /"]
		],
		box : [
			[90001,"pzprv3/box/5/5/0 7 10 9 9 7 /9 . # . . . /6 . + . . . /7 . + . . . /2 + # + + + /15 # # # # # /"],
			[0,"pzprv3/box/5/5/0 7 10 9 9 7 /9 + # # # + /6 # + + + # /7 + + # # + /2 + # + + + /15 # # # # # /"]
		],
		cbblock : [
			[39401,"pzprv3/cbblock/4/4/1 0 2 /0 2 0 /2 2 2 /0 2 2 /1 2 2 0 /0 2 2 2 /2 0 2 0 /"],
			[10017,"pzprv3/cbblock/4/4/-2 0 1 /0 2 0 /2 2 2 /0 2 2 /1 1 1 0 /0 2 2 2 /2 0 2 0 /"],
			[39411,"pzprv3/cbblock/4/4/1 0 2 /0 1 0 /1 1 2 /0 2 1 /-2 1 2 0 /0 1 1 1 /1 0 1 0 /"],
			[0,"pzprv3/cbblock/4/4/1 0 2 /0 1 0 /1 -2 1 /0 1 2 /-2 1 2 0 /0 1 1 1 /1 0 1 0 /"]
		],
		chocona : [
			[10011,"pzprv3/chocona/6/6/11/0 0 1 1 1 1 /0 2 2 2 2 2 /3 4 5 6 7 7 /3 4 5 6 7 7 /3 5 5 8 9 9 /3 10 10 8 8 9 /3 . 3 . . . /. 1 . . . . /2 2 . 2 1 . /. . . . . . /. . . . 3 . /. 2 . . . . /# # . . . . /# # # # # # /. . . . . . /. . . . . . /. . . . . . /. . . . . . /"],
			[30092,"pzprv3/chocona/6/6/11/0 0 1 1 1 1 /0 2 2 2 2 2 /3 4 5 6 7 7 /3 4 5 6 7 7 /3 5 5 8 9 9 /3 10 10 8 8 9 /3 . 3 . . . /. 1 . . . . /2 2 . 2 1 . /. . . . . . /. . . . 3 . /. 2 . . . . /# # . # # # /# # . # # # /. . . . . . /. . . . . . /. . . . . . /. . . . . . /"],
			[0,"pzprv3/chocona/6/6/11/0 0 1 1 1 1 /0 2 2 2 2 2 /3 4 5 6 7 7 /3 4 5 6 7 7 /3 5 5 8 9 9 /3 10 10 8 8 9 /3 . 3 . . . /. 1 . . . . /2 2 . 2 1 . /. . . . . . /. . . . 3 . /. 2 . . . . /# # + # # # /# # + + + + /# # + # + # /# # + # + + /. . + + # # /. # # + # # /"]
		],
		cojun : [
			[30421,"pzprv3/cojun/4/4/1 1 0 /0 1 0 /1 1 0 /1 0 0 /1 0 0 0 /1 1 1 1 /0 0 1 1 /. . 3 . /. . . . /. . . . /. 3 . . /. . . . /. . . 3 /. . . . /. . . . /"],
			[60101,"pzprv3/cojun/4/4/1 1 0 /0 1 0 /1 1 0 /1 0 0 /1 0 0 0 /1 1 1 1 /0 0 1 1 /. . 3 . /. . . . /. . . . /. 3 . . /. 3 . . /. . . . /. . . . /. . . . /"],
			[69511,"pzprv3/cojun/4/4/1 1 0 /0 1 0 /1 1 0 /1 0 0 /1 0 0 0 /1 1 1 1 /0 0 1 1 /. . 3 . /. . . . /. . . . /. 3 . . /1 2 . . /3 1 4 . /. . . . /. . . . /"],
			[50171,"pzprv3/cojun/4/4/1 1 0 /0 1 0 /1 1 0 /1 0 0 /1 0 0 0 /1 1 1 1 /0 0 1 1 /. . 3 . /. . . . /. . . . /. 3 . . /1 2 . 4 /3 1 2 1 /. . 1 2 /. . 2 1 /"],
			[0,"pzprv3/cojun/4/4/1 1 0 /0 1 0 /1 1 0 /1 0 0 /1 0 0 0 /1 1 1 1 /0 0 1 1 /. . 3 . /. . . . /. . . . /. 3 . . /1 2 . 4 /3 1 2 1 /2 4 1 2 /1 . 2 1 /"]
		],
		country : [
			[40201,"pzprv3/country/5/5/7/0 0 1 1 2 /0 0 1 1 2 /3 4 4 4 2 /3 5 5 6 6 /3 5 5 6 6 /2 . . . . /. . . . . /1 2 . . . /. . . . . /. . . . . /0 0 0 0 /1 1 1 1 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 1 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			[40301,"pzprv3/country/5/5/7/0 0 1 1 2 /0 0 1 1 2 /3 4 4 4 2 /3 5 5 6 6 /3 5 5 6 6 /2 . . . . /. . . . . /1 2 . . . /. . . . . /. . . . . /0 0 0 0 /1 1 1 1 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 1 0 0 0 /0 1 0 0 0 /0 1 0 0 0 /0 1 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			[39001,"pzprv3/country/5/5/7/0 0 1 1 2 /0 0 1 1 2 /3 4 4 4 2 /3 5 5 6 6 /3 5 5 6 6 /2 . . . . /. . . . . /1 2 . . . /. . . . . /. . . . . /0 1 1 0 /0 0 0 0 /1 0 0 0 /0 0 0 0 /1 1 1 0 /0 1 0 1 0 /0 1 0 1 0 /1 0 0 1 0 /1 0 0 1 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			[30301,"pzprv3/country/5/5/7/0 0 1 1 2 /0 0 1 1 2 /3 4 4 4 2 /3 5 5 6 6 /3 5 5 6 6 /2 . . . . /. . . . . /1 2 . . . /. . . . . /. . . . . /0 1 0 0 /1 0 0 0 /1 1 0 0 /0 1 0 1 /0 1 1 0 /0 1 0 0 0 /1 0 0 0 0 /0 0 1 0 0 /0 1 0 1 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			[30311,"pzprv3/country/5/5/8/0 0 1 1 2 /0 0 1 1 2 /3 4 4 5 2 /3 6 6 7 7 /3 6 6 7 7 /2 . . . . /. . . . . /1 2 . . . /. . . . . /. . . . . /0 0 1 0 /1 1 0 1 /1 1 0 0 /0 1 0 1 /0 1 1 0 /0 0 1 1 0 /1 0 0 0 1 /0 0 1 0 1 /0 1 0 1 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			[30121,"pzprv3/country/5/5/7/0 0 1 1 2 /0 0 1 1 2 /3 4 4 4 2 /3 5 5 6 6 /3 5 5 6 6 /2 . . . . /. . . . . /1 2 . . . /. . . . . /. . . . . /0 0 1 1 /1 1 0 0 /1 1 0 0 /0 1 0 1 /0 1 1 0 /0 0 1 0 1 /1 0 0 0 1 /0 0 1 0 1 /0 1 0 1 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			[40101,"pzprv3/country/5/5/7/0 0 1 1 2 /0 0 1 1 2 /3 4 4 4 2 /3 5 5 6 6 /3 5 5 6 6 /2 . . . . /. . . . . /1 2 . . . /. . . . . /. . . . . /0 0 1 0 /1 1 0 0 /1 1 0 0 /0 1 0 1 /0 1 1 0 /0 0 1 1 0 /1 0 0 0 1 /0 0 1 0 1 /0 1 0 1 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			[41101,"pzprv3/country/5/5/7/0 0 1 1 2 /0 0 1 1 2 /3 4 4 4 2 /3 5 5 6 6 /3 5 5 6 6 /2 . . . . /. . . . . /1 3 . . . /. . . . . /. . . . . /0 0 1 0 /1 1 0 1 /1 1 1 1 /0 1 1 0 /0 1 1 0 /0 0 1 1 0 /1 0 0 0 1 /0 0 0 0 0 /0 1 0 1 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			[0,"pzprv3/country/5/5/7/0 0 1 1 2 /0 0 1 1 2 /3 4 4 4 2 /3 5 5 6 6 /3 5 5 6 6 /2 . . . . /. . . . . /1 2 . . . /. . . . . /. . . . . /0 0 1 0 /1 1 0 1 /1 1 0 0 /0 1 0 1 /0 1 1 0 /0 0 1 1 0 /1 0 0 0 1 /0 0 1 0 1 /0 1 0 1 0 /2 2 1 0 0 /1 1 0 1 0 /1 1 1 2 1 /2 1 0 1 0 /2 1 0 0 0 /"]
		],
		creek : [
			[10018,"pzprv3/creek/6/6/. 0 . . . 0 . /. . . . 2 . . /. . 2 2 . . . /1 . . 1 . 2 . /1 . 4 . 3 . . /. . . . . . . /. . . . . . . /# # . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /"],
			[10007,"pzprv3/creek/6/6/. 0 . . . 0 . /. . . . 2 . . /. . 2 2 . . . /1 . . 1 . 2 . /1 . 4 . 3 . . /. . . . . . . /. . . . . . . /. . . . . . /. . . # . . /# # # . # # /. . . . . . /. . . . . . /. . . . . . /"],
			[10019,"pzprv3/creek/6/6/. 0 . . . 0 . /. . . . 2 . . /. . 2 2 . . . /1 . . 1 . 2 . /1 . 4 . 3 . . /. . . . . . . /. . . . . . . /. . . . . . /. . . . # . /. . . . # . /. # # . # . /. # # # # . /. . . . . . /"],
			[0,"pzprv3/creek/6/6/. 0 . . . 0 . /. . . . 2 . . /. . 2 2 . . . /1 . . 1 . 2 . /1 . 4 . 3 . . /. . . . . . . /. . . . . . . /. + + + + . /. # # # # + /. + + + # + /# # # + # + /. # # # # + /. . + + + + /"]
		],
		factors : [
			[10038,"pzprv3/factors/5/5/1 1 0 1 /1 1 1 1 /1 1 1 1 /1 1 1 0 /1 1 0 0 /1 0 1 1 0 /0 1 0 0 1 /1 0 0 1 1 /0 1 1 1 1 /5 4 6 . 5 /3 . 40 12 . /. 10 . . 2 /8 . . 3 . /. 3 20 . . /5 . . . 5 /. . . . 1 /. . . . . /. . . . . /. . . . . /"],
			[69601,"pzprv3/factors/5/5/1 1 0 1 /1 1 1 1 /1 1 1 1 /1 1 1 0 /1 1 0 0 /1 0 1 1 0 /0 1 0 0 1 /1 0 0 1 1 /0 1 1 1 1 /5 4 6 . 5 /3 . 40 12 . /. 10 . . 2 /8 . . 3 . /. 3 20 . . /5 . . . 2 /. . . . 5 /. . . . . /. . . . . /. . . . . /"],
			[50171,"pzprv3/factors/5/5/1 1 0 1 /1 1 1 1 /1 1 1 1 /1 1 1 0 /1 1 0 0 /1 0 1 1 0 /0 1 0 0 1 /1 0 0 1 1 /0 1 1 1 1 /5 4 6 . 5 /3 . 40 12 . /. 10 . . 2 /8 . . 3 . /. 3 20 . . /5 4 . . 1 /3 1 . 4 5 /1 . . 3 . /. . . . . /. . . . . /"],
			[0,"pzprv3/factors/5/5/1 1 0 1 /1 1 1 1 /1 1 1 1 /1 1 1 0 /1 1 0 0 /1 0 1 1 0 /0 1 0 0 1 /1 0 0 1 1 /0 1 1 1 1 /5 4 6 . 5 /3 . 40 12 . /. 10 . . 2 /8 . . 3 . /. 3 20 . . /5 4 3 2 1 /3 1 2 4 5 /1 5 4 3 2 /4 2 5 1 3 /2 3 1 5 4 /"]
		],
		fillmat : [
			[32301,"pzprv3/fillmat/5/5/3 . . 3 . /. . . . . /. . 1 . . /. . . . . /. 1 . . 4 /0 1 0 0 /0 1 0 0 /0 1 0 0 /0 1 0 0 /0 1 0 0 /0 0 0 0 0 /1 1 1 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			[30221,"pzprv3/fillmat/5/5/3 . . 3 . /. . . . . /. . 1 . . /. . . . . /. 1 . . 4 /0 0 1 1 /0 0 1 1 /0 0 1 1 /0 0 0 0 /0 0 0 0 /1 1 1 0 0 /0 0 0 0 0 /0 0 0 1 0 /0 0 0 0 0 /"],
			[10032,"pzprv3/fillmat/5/5/3 . . 3 . /. . . . . /. . 1 . . /. . . . . /. 1 . . 4 /1 0 0 0 /1 0 0 0 /1 0 0 0 /1 0 0 0 /1 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			[30013,"pzprv3/fillmat/5/5/3 . . 3 . /. . . . . /. . 1 . . /. . . . . /. 1 . . 4 /0 0 0 1 /0 0 1 0 /1 0 0 0 /0 1 0 0 /0 0 0 1 /1 1 1 1 1 /1 1 1 1 1 /1 1 1 1 1 /1 1 1 1 1 /"],
			[30023,"pzprv3/fillmat/5/5/3 . . 3 . /. . . . . /. . 1 . . /. . . . . /. 1 . . 4 /0 1 0 0 /0 0 0 1 /0 -1 2 -1 /1 0 -1 -1 /-1 -1 2 0 /1 1 1 1 1 /1 1 1 1 1 /1 1 1 1 1 /1 1 1 1 1 /"],
			[0,"pzprv3/fillmat/5/5/3 . . 3 . /. . . . . /. . 1 . . /. . . . . /. 1 . . 4 /1 1 0 0 /1 1 0 1 /1 1 1 1 /1 1 1 1 /1 1 1 1 /0 -1 1 1 1 /0 -1 1 1 -1 /1 -1 1 -1 -1 /0 1 -1 0 -1 /"]
		],
		fillomino : [
			[30002,"pzprv3/fillomino/6/6/. . 4 . . . /. 5 3 . 2 . /. . . . 5 2 /3 3 . . . . /. 2 . 1 4 . /. . . 3 . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /0 0 0 1 0 /0 0 0 0 1 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 1 0 /0 0 0 0 0 1 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /"],
			[31005,"pzprv3/fillomino/6/6/. . 4 . . . /. 5 3 . 2 . /. . . . 5 2 /3 3 . . . . /. 2 . 1 4 . /. . . 3 . . /. . . . . . /. . . . . . /. . . . . . /. . . . 5 . /. . . . . . /. . . . . . /0 0 0 0 0 /0 0 0 0 0 /0 0 0 1 1 /0 0 0 1 1 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 1 0 /0 0 0 0 0 0 /0 0 0 0 1 0 /0 0 0 0 0 0 /"],
			[30201,"pzprv3/fillomino/6/6/. . 4 . . . /. 5 3 . 2 . /. . . . 5 2 /3 3 . . . . /. 2 . 1 4 . /. . . 3 . . /. . . . . . /. . . . . . /. 3 3 3 . . /. . . . 5 . /. . . . . . /. . . . . . /0 0 0 0 0 /0 1 1 0 0 /1 1 0 1 1 /0 1 0 0 1 /0 0 0 0 0 /0 0 0 0 0 /0 0 1 0 0 0 /0 1 0 1 1 0 /1 0 1 1 0 0 /1 1 0 0 1 0 /0 0 0 0 0 0 /"],
			[31006,"pzprv3/fillomino/6/6/. . 4 . . . /. 5 3 . 2 . /. . . . 5 2 /3 3 . . . . /. 2 . 1 4 . /. . . 3 . . /. . . . . . /. . . . . . /. . 3 3 . . /. . 5 5 5 . /. . 5 . . . /. . 5 . . . /0 0 0 0 0 /0 1 1 0 0 /0 1 0 1 1 /0 1 0 0 1 /1 1 1 0 0 /0 1 1 0 0 /0 0 1 0 0 0 /0 0 0 1 1 0 /1 1 1 1 0 0 /0 1 0 1 1 0 /1 0 0 0 0 0 /"],
			[31004,"pzprv3/fillomino/6/6/. . 4 . . . /. 5 3 . 2 . /. . . . 5 2 /3 3 . . . . /. 2 . 1 4 . /. . . 3 . . /. . . . . . /. . . . . . /. . 3 3 . . /. . 5 5 5 . /. . 5 . . . /1 . . . . . /0 0 0 0 0 /0 1 1 0 0 /0 1 0 1 1 /0 1 0 0 1 /1 1 1 0 0 /1 0 0 0 0 /0 0 1 0 0 0 /0 0 0 1 1 0 /1 1 1 1 0 0 /0 1 0 1 1 0 /0 0 1 0 0 0 /"],
			[31005,"pzprv3/fillomino/6/6/. . 4 . . . /. 5 3 . 2 . /. . . . 5 2 /3 3 . . . . /. 2 . 1 4 . /. . . 3 . . /. . . . . . /. . . . . 1 /. . 3 3 . . /. . 5 5 5 . /3 . 5 . . . /1 2 3 . . . /0 1 0 0 0 /0 1 1 0 1 /0 1 0 1 1 /0 1 0 0 1 /1 1 1 1 0 /1 1 0 0 1 /0 0 1 1 1 1 /0 0 0 1 1 1 /1 1 1 1 0 0 /0 1 0 1 1 1 /1 0 1 1 1 0 /"],
			[50171,"pzprv3/fillomino/6/6/. . 4 . . . /. 5 3 . 2 . /. . . . 5 2 /3 3 . . . . /. 2 . 1 4 . /. . . 3 . . /. . . . . . /. . . . . 1 /. . 3 3 . . /. . 5 5 5 2 /2 . 5 . . . /1 3 3 . 4 . /0 1 0 0 0 /0 1 1 0 1 /1 1 0 1 1 /0 1 0 0 1 /0 1 1 1 0 /1 0 0 1 0 /0 0 1 1 1 1 /1 0 0 1 1 1 /0 1 1 1 0 0 /1 1 0 1 1 1 /1 1 1 1 0 0 /"],
			[0,"pzprv3/fillomino/6/6/. . 4 . . . /. 5 3 . 2 . /. . . . 5 2 /3 3 . . . . /. 2 . 1 4 . /. . . 3 . . /5 5 . 4 4 4 /5 . . 2 . 1 /3 5 3 3 . . /. . 5 5 5 2 /2 . 5 . . 4 /1 3 3 . 4 4 /0 1 0 0 0 /0 1 1 0 1 /1 1 0 1 1 /0 1 0 0 1 /0 1 1 1 0 /1 0 0 1 0 /0 0 1 1 1 1 /1 0 0 1 1 1 /0 1 1 1 0 0 /1 1 0 1 1 1 /1 1 1 1 0 0 /"]
		],
		firefly : [
			[40201,"pzprv3/firefly/5/5/4,0 . . . 2,1 /. 3,- . 3,0 . /. . . . . /. 1,0 . 2,2 . /1,1 . . . 1,1 /1 1 1 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 1 0 0 /0 0 1 0 0 /0 0 1 0 0 /0 0 0 0 0 /"],
			[40301,"pzprv3/firefly/5/5/4,0 . . . 2,1 /. 3,- . 3,0 . /. . . . . /. 1,0 . 2,2 . /1,1 . . . 1,1 /1 1 0 0 /0 0 0 0 /0 1 1 0 /0 0 0 0 /0 0 0 0 /0 0 1 0 0 /0 0 1 1 0 /0 1 1 0 0 /0 0 0 0 0 /"],
			[49911,"pzprv3/firefly/5/5/4,0 . . . 2,1 /. 3,- . 3,0 . /. . . . . /. 1,0 . 2,2 . /1,1 . . . 1,1 /1 0 0 0 /0 0 1 0 /0 1 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 1 0 0 /0 1 0 0 0 /0 0 0 0 0 /"],
			[49931,"pzprv3/firefly/5/5/4,0 . . . 2,1 /. 3,- . 3,0 . /. . . . . /. 1,0 . 2,2 . /1,1 . . . 1,1 /1 1 1 1 /0 1 0 0 /0 1 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 1 0 0 /0 1 0 0 0 /0 0 0 0 0 /"],
			[43401,"pzprv3/firefly/5/5/4,0 . . . 2,1 /. 3,- . 3,0 . /. . . . . /. 1,0 . 2,2 . /1,1 . . . 1,1 /1 1 1 1 /0 0 0 0 /0 1 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 1 0 0 /0 1 0 0 0 /0 0 0 0 0 /"],
			[43601,"pzprv3/firefly/5/5/4,0 . . . 2,1 /. 3,- . 3,0 . /. . . . . /. 1,0 . 2,2 . /1,1 . . . 1,1 /1 1 1 1 /1 1 1 1 /0 0 0 0 /1 0 0 1 /0 1 1 0 /1 0 0 0 1 /0 0 0 0 0 /0 0 0 0 0 /1 1 0 1 1 /"],
			[43401,"pzprv3/firefly/5/5/4,0 . . . 2,1 /. 3,- . 3,0 . /. . . . . /. 1,0 . 2,2 . /1,1 . . . 1,1 /1 1 1 1 /1 1 1 1 /0 0 0 0 /1 0 0 1 /0 1 1 0 /1 0 0 0 1 /0 0 0 0 0 /0 1 0 0 0 /1 1 0 1 1 /"],
			[49901,"pzprv3/firefly/5/5/4,0 . . . 2,1 /. 3,- . 3,0 . /. . . . . /. 1,0 . 2,2 . /1,1 . . . 1,1 /1 1 1 1 /1 1 1 1 /0 0 0 0 /0 0 0 1 /0 1 1 0 /1 0 0 0 1 /0 1 0 0 0 /0 1 0 0 0 /0 1 0 1 1 /"],
			[49921,"pzprv3/firefly/5/5/4,0 . . . 2,1 /. 3,- . 3,0 . /. . . . . /. 1,0 . 2,2 . /1,1 . . . 1,1 /1 1 1 1 /1 1 1 1 /0 0 0 0 /1 0 0 1 /0 1 1 0 /1 0 0 0 1 /0 1 0 1 0 /0 1 0 1 0 /1 1 0 1 1 /"],
			[0,"pzprv3/firefly/5/5/4,0 . . . 2,1 /. 3,- . 3,0 . /. . . . . /. 1,0 . 2,2 . /1,1 . . . 1,1 /1 1 1 1 /1 1 1 1 /-1 -1 -1 -1 /1 0 0 1 /0 1 1 0 /1 -1 -1 -1 1 /0 1 0 0 -1 /0 1 0 0 -1 /1 1 0 1 1 /"]
		],
		fivecells : [
			[30036,"pzprv3/fivecells/6/6/* 2 . . 1 . /. . . . . . /. . 0 . . . /. . . 2 . . /1 . . . . . /. . . . 3 . /0 0 0 1 0 0 0 /0 0 1 0 0 0 0 /0 0 0 0 0 0 0 /0 0 0 0 0 0 0 /0 0 0 0 0 0 0 /0 0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 1 0 0 0 /1 1 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /"],
			[32401,"pzprv3/fivecells/6/6/* 2 . . 1 . /. . . . . . /. . 0 . . . /. . . 2 . . /1 . . . . . /. . . . 3 . /0 0 -1 1 -1 -1 0 /0 0 1 1 0 0 0 /0 1 -1 -1 1 0 0 /0 0 1 1 -1 0 0 /0 0 0 0 0 0 0 /0 0 0 0 0 0 0 /0 0 0 0 0 0 /0 -1 1 0 -1 0 /0 1 -1 1 0 0 /0 1 -1 1 0 0 /0 0 1 2 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /"],
			[32101,"pzprv3/fivecells/6/6/* 2 . . 1 . /. . . . . . /. . 0 . . . /. . . 2 . . /1 . . . . . /. . . . 3 . /0 0 -1 1 -1 -1 0 /0 0 1 1 -1 1 0 /0 1 -1 -1 1 0 0 /0 1 1 1 -1 0 0 /0 -1 1 0 0 0 0 /0 1 0 0 0 1 0 /0 0 0 0 0 0 /0 -1 1 -1 -1 1 /0 1 -1 1 1 0 /1 1 -1 1 0 0 /-1 -1 1 -1 0 0 /-1 1 0 0 1 0 /0 0 0 0 0 0 /"],
			[30038,"pzprv3/fivecells/6/6/* 2 . . 1 . /. . . . . . /. . 0 . . . /. . . 2 . . /1 . . . . . /. . . . 3 . /0 0 -1 1 -1 -1 0 /0 0 1 1 -1 1 0 /0 1 -1 -1 1 0 0 /0 0 1 1 -1 0 0 /0 -1 1 1 0 0 0 /0 1 0 0 0 1 0 /0 0 0 0 0 0 /0 -1 1 -1 -1 1 /0 1 -1 1 1 0 /1 1 -1 1 0 0 /-1 -1 1 -1 0 0 /-1 1 0 1 1 0 /0 0 0 0 0 0 /"],
			[0,"pzprv3/fivecells/6/6/* 2 . . 1 . /. . . . . . /. . 0 . . . /. . . 2 . . /1 . . . . . /. . . . 3 . /0 0 -1 1 -1 -1 0 /0 0 1 1 -1 1 0 /0 1 -1 -1 1 1 0 /0 0 1 1 -1 1 0 /0 -1 1 1 0 1 0 /0 1 0 0 0 1 0 /0 0 0 0 0 0 /0 -1 1 -1 -1 1 /0 1 -1 1 1 -1 /1 1 -1 1 0 -1 /-1 -1 1 -1 0 -1 /-1 1 0 1 1 0 /0 0 0 0 0 0 /"]
		],
		fourcells : [
			[30035,"pzprv3/fourcells/6/6/. . 1 . . . /. 2 . 3 . . /. . . 3 . . /. . 1 . . . /. . . 2 . . /2 . 3 . . 2 /1 0 0 0 0 /1 0 0 1 1 /0 0 0 1 1 /0 0 0 0 0 /1 0 1 0 0 /0 0 0 0 0 /0 0 0 0 1 0 /1 0 0 0 0 0 /0 0 0 0 1 0 /0 1 1 0 0 0 /0 1 1 0 0 0 /"],
			[32401,"pzprv3/fourcells/6/6/. . 1 . . . /. 2 . 3 . . /. . . 3 . . /. . 1 . . . /. . . 2 . . /2 . 3 . . 2 /1 -1 -1 1 0 /-1 1 1 0 0 /1 1 0 0 0 /0 0 1 0 0 /1 0 0 0 0 /-1 0 1 0 0 /-1 1 -1 1 0 0 /1 -1 1 0 0 0 /-1 1 1 0 0 0 /1 1 1 0 0 0 /-1 1 1 0 0 0 /"],
			[32101,"pzprv3/fourcells/6/6/. . 1 . . . /. 2 . 3 . . /. . . 3 . . /. . 1 . . . /. . . 2 . . /2 . 3 . . 2 /1 -1 -1 1 0 /-1 1 1 0 0 /1 1 1 0 0 /0 1 0 1 0 /1 1 1 0 0 /-1 0 1 0 0 /-1 1 -1 1 0 0 /1 -1 1 1 1 0 /-1 1 0 1 0 0 /1 0 0 1 0 0 /-1 1 1 0 0 0 /"],
			[30037,"pzprv3/fourcells/6/6/. . 1 . . . /. 2 . 3 . . /. . . 3 . . /. . 1 . . . /. . . 2 . . /2 . 3 . . 2 /1 -1 -1 1 0 /-1 1 1 0 1 /1 1 1 0 0 /0 1 0 1 0 /1 1 1 0 0 /-1 0 1 0 0 /-1 1 -1 1 0 1 /1 -1 1 1 1 0 /-1 1 0 1 0 0 /1 0 0 1 0 0 /-1 1 1 0 0 0 /"],
			[0,"pzprv3/fourcells/6/6/. . 1 . . . /. 2 . 3 . . /. . . 3 . . /. . 1 . . . /. . . 2 . . /2 . 3 . . 2 /1 -1 -1 1 0 /-1 1 1 0 1 /1 1 1 0 0 /0 1 0 1 1 /1 1 1 -1 1 /-1 0 1 1 0 /-1 1 -1 1 0 1 /1 -1 1 1 1 0 /-1 1 0 1 1 1 /1 0 0 1 0 0 /-1 1 1 -1 1 0 /"]
		],
		goishi : [
			[91001,"pzprv3/goishi/7/6/. . . . . . /. . 0 0 . . /. 5 . 4 . . /. 0 . 3 . . /. 0 0 2 1 . /. . . 0 . . /. . . . . . /"],
			[0,"pzprv3/goishi/7/6/. . . . . . /. . 9 10 . . /. 5 . 4 . . /. 6 . 3 . . /. 7 8 2 1 . /. . . 11 . . /. . . . . . /"]
		],
		gokigen : [
			[90501,"pzprv3/gokigen/4/4/. . . 0 . /. 4 . . . /2 . . . 2 /. . . . . /. 1 . 0 . /. 2 1 . /2 . . 1 /1 . . 2 /. 1 2 . /"],
			[90511,"pzprv3/gokigen/4/4/. . . 0 . /. 4 . . . /2 . . . 2 /. . . . . /. 1 . 0 . /. 2 1 . /2 . . 1 /1 . . 2 /. . 2 . /"],
			[50131,"pzprv3/gokigen/4/4/. . . 0 . /. 4 . . . /2 . . . 2 /. . . . . /. 1 . 0 . /1 2 1 2 /2 1 . 1 /1 . . 2 /. 2 2 1 /"],
			[0,"pzprv3/gokigen/4/4/. . . 0 . /. 4 . . . /2 . . . 2 /. . . . . /. 1 . 0 . /1 2 1 2 /2 1 1 1 /1 1 2 2 /2 2 2 1 /"]
		],
		hakoiri : [
			[60211,"pzprv3/hakoiri/5/5/4/0 0 0 1 1 /0 0 2 1 1 /3 2 2 2 1 /3 3 2 3 3 /3 3 3 3 3 /1 . . . 3 /. . . 1 . /. . . . . /2 3 . 2 . /. 1 . . 1 /. . . . . /. 1 2 . . /+ . . 3 . /. . . . . /+ . . . . /"],
			[31013,"pzprv3/hakoiri/5/5/4/0 0 0 1 1 /0 0 2 1 1 /3 2 2 2 1 /3 3 2 3 3 /3 3 3 3 3 /1 . . . 3 /. . . 1 . /. . . . . /2 3 . 2 . /. 1 . . 1 /. . . . . /. . 2 . . /+ . . 3 . /. . . . . /+ . . . . /"],
			[30423,"pzprv3/hakoiri/5/5/4/0 0 0 1 1 /0 0 0 1 1 /2 0 0 0 1 /2 2 0 3 3 /2 2 3 3 3 /1 . . . 3 /. . . 1 . /. . . . . /2 3 . 2 . /. 1 . . 1 /. . . . . /. . . . . /+ 1 . 3 . /. . . . . /+ . . . . /"],
			[10010,"pzprv3/hakoiri/5/5/5/0 0 0 1 1 /0 0 2 1 1 /3 2 2 2 1 /3 3 2 4 4 /3 3 4 4 4 /1 . . . 3 /. . . 1 . /. . . . . /2 3 . 2 . /. 1 . . 1 /. . . . . /. . . . . /. . . . . /. . . . . /. . . . . /"],
			[31014,"pzprv3/hakoiri/5/5/5/0 0 0 1 1 /0 0 2 1 1 /3 2 2 2 1 /3 3 2 4 4 /3 3 4 4 4 /. . . . 3 /. . . 1 . /. . . . . /2 3 . 2 . /. 1 . . 1 /. + + . . /2 3 2 . 2 /+ 1 + 3 . /. . + . + /+ . + 3 . /"],
			[0,"pzprv3/hakoiri/5/5/5/0 0 0 1 1 /0 0 2 1 1 /3 2 2 2 1 /3 3 2 4 4 /3 3 4 4 4 /1 . . . 3 /. . . 1 . /. . . . . /2 3 . 2 . /. 1 . . 1 /. + + . . /2 3 2 . 2 /+ 1 + 3 . /. . + . + /+ . + 3 . /"]
		],
		hanare : [
			[30003,"pzprv3/hanare/4/4/1 0 0 /1 1 0 /1 1 1 /0 1 0 /0 1 1 1 /1 0 0 1 /1 0 1 0 /. . . . /. . . . /. . . . /. . . 3 /. . . . /. . . . /. . . . /. . . . /"],
			[69901,"pzprv3/hanare/4/4/1 0 0 /1 1 0 /1 1 1 /0 1 0 /0 1 1 1 /1 0 0 1 /1 0 1 0 /. . . . /. . . . /. . . . /. . . 3 /2 3 + + /+ + 3 + /1 + + + /+ 4 + . /"],
			[30011,"pzprv3/hanare/4/4/1 0 0 /1 1 0 /1 1 1 /0 1 0 /0 1 1 1 /0 0 0 1 /1 0 1 0 /. . . . /. . . . /. . . . /. . . 3 /2 + 3 + /+ + 3 + /1 + + + /+ 4 + . /"],
			[31008,"pzprv3/hanare/4/4/1 0 0 /1 1 0 /1 1 1 /0 1 0 /0 1 1 1 /0 0 0 1 /1 0 1 0 /. . . . /. . . . /. . . . /. . . 3 /+ + 3 + /+ + 3 + /2 + + + /+ 4 + . /"],
			[0,"pzprv3/hanare/4/4/1 0 0 /1 1 0 /1 1 1 /0 1 0 /0 1 1 1 /1 0 0 1 /1 0 1 0 /. . . . /. . . . /. . . . /. . . 3 /2 + 3 + /+ + 3 + /1 + + + /+ 4 + . /"]
		],
		hashikake : [
			[49801,"pzprv3/hashikake/5/5/4 . 2 . . /. 3 . . 2 /3 . . . . /. 3 . 1 . /3 . 4 . 3 /2 2 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /2 0 0 0 0 /2 0 0 0 0 /2 0 0 0 0 /2 0 0 0 0 /"],
			[43601,"pzprv3/hashikake/5/5/4 . 2 . . /. 3 . . 2 /3 . . . . /. 3 . 1 . /3 . 4 . 3 /2 2 0 0 /0 1 1 1 /-1 0 0 0 /0 0 0 0 /0 0 0 0 /2 0 0 0 0 /2 1 0 0 0 /1 1 0 0 0 /1 0 0 0 0 /"],
			[49811,"pzprv3/hashikake/5/5/4 . 2 . . /. 3 . . 2 /3 . . . . /. 3 . 1 . /3 . 4 . 3 /2 2 0 0 /0 1 1 1 /-1 0 0 0 /0 1 1 0 /1 1 1 1 /2 0 0 0 0 /2 1 0 0 1 /1 1 0 0 1 /1 0 0 0 1 /"],
			[0,"pzprv3/hashikake/5/5/4 . 2 . . /. 3 . . 2 /3 . . . . /. 3 . 1 . /3 . 4 . 3 /2 2 0 0 /0 1 1 1 /-1 0 -1 -1 /0 1 1 -1 /2 2 2 2 /2 0 0 0 0 /2 2 0 0 1 /1 2 0 -1 1 /1 0 0 -1 1 /"]
		],
		heyabon : [
			[40201,"pzprv3/heyabon/5/5/. 1 . . 0 /. - . . . /. 1 2 1 . /3 . . 1 . /. - . - . /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 1 1 0 /0 1 1 0 /0 0 0 0 /0 1 1 0 /0 1 1 0 /0 0 0 0 0 /1 1 0 1 1 /1 1 0 1 1 /0 0 0 0 0 /0 0 0 0 /0 0 1 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 1 0 0 /0 0 1 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			[40301,"pzprv3/heyabon/5/5/. 1 . . 0 /. - . . . /. 1 2 1 . /3 . . 1 . /. - . - . /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 1 1 0 /0 1 1 0 /0 0 0 0 /0 1 1 0 /0 1 1 0 /0 0 0 0 0 /1 1 0 1 1 /1 1 0 1 1 /0 0 0 0 0 /0 0 0 0 /0 1 1 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 1 0 0 /0 0 1 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			[30016,"pzprv3/heyabon/5/5/. 1 . . 0 /. - . . . /. 1 2 1 . /3 . . 1 . /. - . - . /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 1 1 0 /0 1 1 0 /0 0 0 0 /0 1 1 0 /0 1 1 0 /0 0 0 0 0 /1 1 0 1 1 /1 1 0 1 1 /0 0 0 0 0 /0 0 0 0 /0 1 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 1 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			[43102,"pzprv3/heyabon/5/5/. 1 . . 0 /. - . . . /. 1 2 1 . /3 . . 1 . /. - . - . /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 1 1 0 /0 1 1 0 /0 0 0 0 /0 1 1 0 /0 1 1 0 /0 0 0 0 0 /1 1 0 1 1 /1 1 0 1 1 /0 0 0 0 0 /0 0 0 0 /1 1 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /1 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			[20013,"pzprv3/heyabon/5/5/. 1 . . 0 /. - . . . /. 1 2 1 . /3 . . 1 . /. - . - . /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 1 1 0 /0 1 1 0 /0 0 0 0 /0 1 1 0 /0 1 1 0 /0 0 0 0 0 /1 1 0 1 1 /1 1 0 1 1 /0 0 0 0 0 /0 0 0 0 /1 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /1 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			[50401,"pzprv3/heyabon/5/5/. 1 . . 0 /. - . . . /. 1 2 1 . /3 . . 1 . /. - . - . /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 1 1 0 /0 1 1 0 /0 0 0 0 /0 1 1 0 /0 1 1 0 /0 0 0 0 0 /1 1 0 1 1 /1 1 0 1 1 /0 0 0 0 0 /0 1 1 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			[30511,"pzprv3/heyabon/5/5/. 1 . . 0 /. - . . . /. 1 2 1 . /3 . . 1 . /. - . - . /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 1 1 0 /0 1 1 0 /0 0 0 0 /0 1 1 0 /0 1 1 0 /0 0 0 0 0 /1 1 0 1 1 /1 1 0 1 1 /0 0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			[30025,"pzprv3/heyabon/5/5/. 1 . . 0 /. - . . . /. 1 2 1 . /3 . . 1 . /. - . - . /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 1 1 0 /0 1 1 0 /0 0 0 0 /0 1 1 0 /0 1 1 0 /0 0 0 0 0 /1 1 0 1 1 /1 1 0 1 1 /0 0 0 0 0 /0 1 0 0 /0 1 1 0 /0 0 0 0 /0 0 0 1 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 1 0 0 /0 0 1 0 0 /"],
			[50411,"pzprv3/heyabon/5/5/. 1 . . 0 /. 4 . . . /. 1 2 1 . /3 . . 1 . /. - . - . /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 1 1 0 /0 1 1 0 /0 0 0 0 /0 1 1 0 /0 1 1 0 /0 0 0 0 0 /1 1 0 1 1 /1 1 0 1 1 /0 0 0 0 0 /0 1 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 1 /1 0 0 0 /1 0 0 0 0 /1 0 0 1 0 /1 1 1 0 0 /0 0 1 0 0 /"],
			[43202,"pzprv3/heyabon/5/5/. 1 . . 0 /. - . . . /. 1 2 1 . /3 . . 1 . /. - . - . /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 1 1 0 /0 1 1 0 /0 0 0 0 /0 1 1 0 /0 1 1 0 /0 0 0 0 0 /1 1 0 1 1 /1 1 0 1 1 /0 0 0 0 0 /0 1 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 1 /1 0 0 0 /1 0 0 0 0 /1 0 0 1 1 /1 1 1 0 0 /0 0 1 0 0 /"],
			[0,"pzprv3/heyabon/5/5/. 1 . . 0 /. - . . . /. 1 2 1 . /3 . . 1 . /. - . - . /2 1 2 0 2 /1 2 1 2 0 /0 1 1 1 0 /0 2 1 1 2 /2 0 2 2 0 /0 1 1 0 /0 1 1 0 /0 0 0 0 /0 1 1 0 /0 1 1 0 /0 0 0 0 0 /1 1 0 1 1 /1 1 0 1 1 /0 0 0 0 0 /0 1 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 1 /1 0 0 0 /1 0 0 0 0 /1 0 0 1 0 /1 1 1 0 0 /0 0 1 0 0 /"]
		],
		heyawake : [
			[10021,"pzprv3/heyawake/6/6/8/0 1 1 2 2 3 /0 1 1 2 2 3 /0 1 1 2 2 3 /4 4 4 4 4 3 /5 5 5 6 6 3 /5 5 5 6 6 7 /2 2 . 2 . 2 /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. # . . . . /. # . . . . /. . . . . . /. . . . . . /"],
			[10020,"pzprv3/heyawake/6/6/8/0 1 1 2 2 3 /0 1 1 2 2 3 /0 1 1 2 2 3 /4 4 4 4 4 3 /5 5 5 6 6 3 /5 5 5 6 6 7 /2 2 . 2 . 2 /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /# . # . . . /. . . # . . /# . # . . . /. # . . . . /. . . . . . /. . . . . . /"],
			[30091,"pzprv3/heyawake/6/6/8/0 1 1 2 2 3 /0 1 1 2 2 3 /0 1 1 2 2 3 /4 4 4 4 4 3 /5 5 5 6 6 3 /5 5 5 6 6 7 /2 2 . 2 . 2 /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /# . . . . . /. . . # . . /# . # . # . /. # . . . . /. . . . . . /. . . . . . /"],
			[90101,"pzprv3/heyawake/6/6/8/0 1 1 2 2 3 /0 1 1 2 2 3 /0 1 1 2 2 3 /4 4 4 4 4 3 /5 5 5 6 6 3 /5 5 5 6 6 7 /2 2 . 2 . 2 /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /# + # + + # /+ + + # + + /# + # + # + /+ + + + + + /. # . # . # /. . . . . . /"],
			[20010,"pzprv3/heyawake/6/6/7/0 1 1 2 2 3 /0 1 1 2 2 3 /0 1 1 2 2 3 /4 4 4 4 4 3 /5 5 5 6 6 3 /5 5 5 6 6 6 /2 2 . 2 . 2 /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /# + # + + # /+ + + # + + /# + # + # + /+ + + + + + /. # . # . # /. . . . . . /"],
			[0,"pzprv3/heyawake/6/6/8/0 1 1 2 2 3 /0 1 1 2 2 3 /0 1 1 2 2 3 /4 4 4 4 4 3 /5 5 5 6 6 3 /5 5 5 6 6 7 /2 2 . 2 . 2 /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /# + # + + # /+ + + # + + /# + # + # + /+ + + + + + /. # . # . # /. . # . . . /"]
		],
		hitori : [
			[10021,"pzprv3/hitori/4/4/1 1 1 4 /1 4 2 3 /3 3 2 1 /4 2 1 3 /# . . . /# . . . /. . . . /. . . . /"],
			[10020,"pzprv3/hitori/4/4/1 1 1 4 /1 4 2 3 /3 3 2 1 /4 2 1 3 /# . . . /. . . # /# . # . /. # . . /"],
			[90201,"pzprv3/hitori/4/4/1 1 1 4 /1 4 2 3 /3 3 2 1 /4 2 1 3 /# . . . /. . . . /# . # . /. . . # /"],
			[0,"pzprv3/hitori/4/4/1 1 1 4 /1 4 2 3 /3 3 2 1 /4 2 1 3 /# + # . /+ + + . /# + # . /+ + + # /"]
		],
		icebarn : [
			[40201,"pzprv3/icebarn/8/8/115/123/0 0 1 1 1 0 0 0 /1 1 0 1 0 1 1 1 /1 1 0 1 0 1 1 1 /1 1 0 1 0 0 0 0 /0 0 0 0 0 1 0 1 /1 1 0 0 0 1 1 1 /1 1 0 1 0 1 1 1 /0 0 1 1 1 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 1 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 2 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 2 0 0 0 0 /2 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 /0 0 0 0 0 0 1 0 /0 0 0 0 0 0 0 0 /0 2 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 1 /0 0 0 2 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 1 1 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 1 0 0 0 0 /0 0 0 1 0 0 0 0 /0 0 0 1 0 0 0 0 /0 0 0 1 0 0 0 0 /0 0 0 1 0 0 0 0 /0 1 0 1 0 0 0 0 /0 1 0 0 0 0 0 0 /0 1 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 /"],
			[40501,"pzprv3/icebarn/8/8/115/123/0 0 1 1 1 0 0 0 /1 1 0 1 0 1 1 1 /1 1 0 1 0 1 1 1 /1 1 0 1 0 0 0 0 /0 0 0 0 0 1 0 1 /1 1 0 0 0 1 1 1 /1 1 0 1 0 1 1 1 /0 0 1 1 1 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 1 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 2 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 2 0 0 0 0 /2 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 /0 0 0 0 0 0 1 0 /0 0 0 0 0 0 0 0 /0 2 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 1 /0 0 0 2 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 1 1 1 1 1 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 1 0 0 0 0 /0 0 0 1 0 0 1 0 /0 0 0 1 0 0 1 0 /0 0 0 1 0 0 1 0 /0 0 0 1 0 0 1 0 /0 1 0 1 0 0 0 0 /0 1 0 0 0 0 0 0 /0 1 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 /"],
			[40601,"pzprv3/icebarn/8/8/115/123/0 0 1 1 1 0 0 0 /1 1 0 1 0 1 1 1 /1 1 0 1 0 1 1 1 /1 1 0 1 0 0 0 0 /0 0 0 0 0 1 0 1 /1 1 0 0 0 1 1 1 /1 1 0 1 0 1 1 1 /0 0 1 1 1 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 1 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 2 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 2 0 0 0 0 /2 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 /0 0 0 0 0 0 1 0 /0 0 0 0 0 0 0 0 /0 2 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 1 /0 0 0 2 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 1 0 0 /0 0 0 0 1 1 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 1 0 0 0 0 /0 0 0 1 0 0 1 0 /0 0 0 1 0 0 1 0 /0 0 0 1 0 0 1 0 /0 0 0 1 0 1 0 0 /0 1 0 0 0 0 0 0 /0 1 0 0 0 0 0 0 /0 1 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 /"],
			[49411,"pzprv3/icebarn/8/8/115/123/0 0 1 1 1 0 0 0 /1 1 0 1 0 1 1 1 /1 1 0 1 0 1 1 1 /1 1 0 1 0 0 0 0 /0 0 0 0 0 1 0 1 /1 1 0 0 0 1 1 1 /1 1 0 1 0 1 1 1 /0 0 1 1 1 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 1 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 2 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 2 0 0 0 0 /2 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 /0 0 0 0 0 0 1 0 /0 0 0 0 0 0 0 0 /0 2 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 1 /0 0 0 2 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 1 1 1 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 /0 0 0 0 0 0 1 0 /0 0 0 0 0 0 1 0 /0 0 0 0 0 0 1 0 /0 0 0 0 0 0 1 0 /0 1 0 0 0 0 0 0 /0 1 0 0 0 0 0 0 /0 1 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 /"],
			[49421,"pzprv3/icebarn/8/8/115/123/0 0 1 1 1 0 0 0 /1 1 0 1 0 1 1 1 /1 1 0 1 0 1 1 1 /1 1 0 1 0 0 0 0 /0 0 0 0 0 1 0 1 /1 1 0 0 0 1 1 1 /1 1 0 1 0 1 1 1 /0 0 1 1 1 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 1 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 2 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 2 0 0 0 0 /2 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 /0 0 0 0 0 0 1 0 /0 0 0 0 0 0 0 0 /0 2 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 1 /0 0 0 2 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 1 1 1 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 1 0 0 0 0 /0 0 0 1 0 0 1 0 /0 0 0 1 0 0 1 0 /0 0 0 1 0 0 1 0 /0 0 0 1 0 0 1 0 /0 1 0 0 0 0 0 0 /0 1 0 0 0 0 0 0 /0 1 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 /"],
			[49431,"pzprv3/icebarn/8/8/115/123/0 0 1 1 1 0 0 0 /1 1 0 1 0 1 1 1 /1 1 0 1 0 1 1 1 /1 1 0 1 0 0 0 0 /0 0 0 0 0 1 0 1 /1 1 0 0 0 1 1 1 /1 1 0 1 0 1 1 1 /0 0 1 1 1 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 1 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 2 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 2 0 0 0 0 /2 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 /0 0 0 0 0 0 1 0 /0 0 0 0 0 0 0 0 /0 2 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 1 /0 0 0 2 0 0 0 0 /0 0 0 0 0 0 0 1 1 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 1 1 1 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 1 0 0 0 0 /0 0 0 1 0 0 1 0 /0 0 0 1 0 0 1 0 /0 0 0 1 0 0 1 0 /0 0 0 1 0 0 1 0 /0 1 0 0 0 0 0 0 /0 1 0 0 0 0 0 0 /0 1 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 /"],
			[49441,"pzprv3/icebarn/8/8/115/123/0 0 1 1 1 0 0 0 /1 1 0 1 0 1 1 1 /1 1 0 1 0 1 1 1 /1 1 0 1 0 0 0 0 /0 0 0 0 0 1 0 1 /1 1 0 0 0 1 1 1 /1 1 0 1 0 1 1 1 /0 0 1 1 1 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 1 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 2 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 2 0 0 0 0 /2 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 /0 0 0 0 0 0 1 0 /0 0 0 0 0 0 0 0 /0 2 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 1 /0 0 0 2 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 1 1 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 1 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 1 0 0 0 0 /0 0 0 1 0 0 0 0 /0 0 0 1 0 0 0 0 /0 0 1 1 1 0 0 0 /0 0 1 1 1 0 0 0 /0 1 0 0 0 0 0 0 /0 1 0 0 0 0 0 0 /0 1 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 /"],
			[41102,"pzprv3/icebarn/8/8/115/123/0 0 1 1 1 0 0 0 /1 1 0 1 0 1 1 1 /1 1 0 1 0 1 1 1 /1 1 0 1 0 0 0 0 /0 0 0 0 0 1 0 1 /1 1 0 0 0 1 1 1 /1 1 0 1 0 1 1 1 /0 0 1 1 1 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 1 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 2 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 2 0 0 0 0 /2 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 /0 0 0 0 0 0 1 0 /0 0 0 0 0 0 0 0 /0 2 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 1 /0 0 0 2 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 -1 -1 -1 0 /0 0 0 1 1 -1 -1 -1 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 1 0 0 0 0 /0 0 0 -1 1 -1 -1 -1 0 /0 0 0 1 1 -1 -1 -1 0 /0 0 1 1 1 1 0 1 0 /0 0 0 1 0 0 0 0 /0 0 0 1 0 0 0 0 /0 0 0 1 0 0 0 0 /0 0 1 1 1 0 0 0 /0 0 1 1 1 0 0 1 /0 1 1 -1 0 0 0 1 /0 1 1 1 1 0 0 1 /0 1 0 1 0 0 0 1 /0 0 0 1 0 0 0 0 /"],
			[30321,"pzprv3/icebarn/8/8/115/123/0 0 1 1 1 0 0 0 /1 1 0 1 0 1 1 1 /1 1 0 1 0 1 1 1 /1 1 0 1 0 0 0 0 /0 0 0 0 0 1 0 1 /1 0 0 0 0 1 1 1 /1 0 0 1 0 1 1 1 /0 0 1 1 1 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 1 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 2 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 2 0 0 0 0 /2 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 /0 0 0 0 0 0 1 0 /0 0 0 0 0 0 0 0 /0 2 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 1 /0 0 0 2 0 0 0 0 /0 1 1 1 1 1 1 0 0 /0 0 0 0 0 -1 -1 -1 0 /0 0 0 1 1 -1 -1 -1 0 /0 0 0 0 0 1 0 1 0 /0 1 0 0 1 1 1 0 0 /0 0 0 -1 1 -1 -1 -1 0 /0 0 0 1 1 -1 -1 -1 0 /0 0 1 1 1 1 0 1 0 /0 0 0 1 0 0 0 0 /1 0 0 1 0 0 1 0 /1 0 0 1 0 0 1 0 /1 0 1 1 1 0 1 0 /1 0 1 1 0 1 0 1 /0 1 1 -1 0 1 1 1 /0 1 1 1 1 1 1 1 /0 1 0 1 0 1 1 1 /0 0 0 1 0 0 0 0 /"],
			[49461,"pzprv3/icebarn/8/8/115/123/0 0 1 1 1 0 0 0 /1 1 0 1 0 1 1 1 /1 1 0 1 0 1 1 1 /1 1 0 1 0 0 0 0 /0 0 0 0 0 1 0 1 /1 1 0 0 0 1 1 1 /1 1 0 1 0 1 1 1 /0 0 1 1 1 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 1 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 2 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 2 0 0 0 0 /2 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 /0 0 0 0 0 0 1 0 /0 0 0 0 0 0 0 0 /0 2 0 0 0 0 0 0 /2 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 1 /0 0 0 2 0 0 0 0 /0 1 1 1 1 1 1 0 0 /0 0 0 0 0 -1 -1 -1 0 /0 0 0 1 1 -1 -1 -1 0 /0 0 0 0 0 1 0 1 0 /0 1 0 0 1 1 1 0 0 /0 0 0 -1 1 -1 -1 -1 0 /0 0 0 1 1 -1 -1 -1 0 /0 0 1 1 1 1 0 1 0 /0 0 0 1 0 0 0 0 /1 0 0 1 0 0 1 0 /1 0 0 1 0 0 1 0 /1 0 1 1 1 0 1 0 /1 0 1 1 0 1 0 1 /0 1 1 -1 0 1 1 1 /0 1 1 1 1 1 1 1 /0 1 0 1 0 1 1 1 /0 0 0 1 0 0 0 0 /"],
			[0,"pzprv3/icebarn/8/8/115/123/0 0 1 1 1 0 0 0 /1 1 0 1 0 1 1 1 /1 1 0 1 0 1 1 1 /1 1 0 1 0 0 0 0 /0 0 0 0 0 1 0 1 /1 1 0 0 0 1 1 1 /1 1 0 1 0 1 1 1 /0 0 1 1 1 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 1 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 2 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 2 0 0 0 0 /2 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 /0 0 0 0 0 0 1 0 /0 0 0 0 0 0 0 0 /0 2 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 1 /0 0 0 2 0 0 0 0 /0 1 1 1 1 1 1 0 0 /0 0 0 0 0 -1 -1 -1 0 /0 0 0 1 1 -1 -1 -1 0 /0 0 0 0 0 1 0 1 0 /0 1 0 0 1 1 1 0 0 /0 0 0 -1 1 -1 -1 -1 0 /0 0 0 1 1 -1 -1 -1 0 /0 0 1 1 1 1 0 1 0 /0 0 0 1 0 0 0 0 /1 0 0 1 0 0 1 0 /1 0 0 1 0 0 1 0 /1 0 1 1 1 0 1 0 /1 0 1 1 0 1 0 1 /0 1 1 -1 0 1 1 1 /0 1 1 1 1 1 1 1 /0 1 0 1 0 1 1 1 /0 0 0 1 0 0 0 0 /"]
		],
		icelom : [
			[40201,"pzprv3/icelom/6/6/75/64/allwhite/. i . 3 i . /i i i . . . /i . i . . . /. . . i . i /. i . i i i /2 . 1 . i . /0 1 1 0 0 0 0 /0 0 0 0 0 0 0 /0 0 0 0 0 0 0 /1 1 0 0 0 0 0 /0 0 0 0 0 0 0 /0 0 0 0 0 0 0 /0 0 0 0 0 0 /1 0 0 0 0 0 /1 0 0 0 0 0 /1 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /"],
			[40501,"pzprv3/icelom/6/6/75/64/allwhite/. i . 3 i . /i i i . . . /i . i . . . /. . . i . i /. i . i i i /2 . 1 . i . /0 1 1 0 0 0 0 /0 0 0 0 0 0 0 /0 0 0 0 0 0 0 /1 1 0 0 0 0 0 /0 0 0 0 0 0 0 /0 1 0 0 0 0 0 /0 0 0 0 0 0 /1 0 0 0 0 0 /1 0 0 0 0 0 /1 0 0 0 0 0 /1 0 0 0 0 0 /1 0 0 0 0 0 /0 0 0 0 0 0 /"],
			[40601,"pzprv3/icelom/6/6/75/64/allwhite/. i . 3 i . /i i i . . . /i . i . . . /. . . i . i /. i . i i i /2 . 1 . i . /0 0 0 0 1 1 0 /0 1 1 1 0 0 0 /0 0 0 0 0 0 0 /1 0 0 0 0 0 0 /0 0 0 0 0 0 0 /0 0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 1 0 0 /1 0 0 0 0 0 /1 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /"],
			[49411,"pzprv3/icelom/6/6/75/64/allwhite/. i . 3 i . /i i i . . . /i . i . . . /. . . i . i /. i . i i i /2 . 1 . i . /0 1 1 0 0 0 0 /0 0 0 0 0 0 0 /0 0 0 0 0 0 0 /0 0 0 0 0 0 0 /0 0 0 0 0 0 0 /0 0 0 0 0 0 0 /0 0 0 0 0 0 /1 0 0 0 0 0 /1 0 0 0 0 0 /1 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /"],
			[49421,"pzprv3/icelom/6/6/75/64/allwhite/. i . 3 i . /i i i . . . /i . i . . . /. . . i . i /. i . i i i /2 . 1 . i . /0 1 1 0 0 0 0 /0 0 0 0 0 0 0 /0 0 0 0 0 0 0 /1 0 0 0 0 0 0 /0 0 0 0 0 0 0 /0 0 0 0 0 0 0 /0 0 0 0 0 0 /1 0 0 0 0 0 /1 0 0 0 0 0 /1 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /"],
			[49431,"pzprv3/icelom/6/6/75/64/allwhite/. i . 3 i . /i i i . . . /i . i . . . /. . . i . i /. i . i i i /2 . 1 . i . /0 1 1 -1 1 1 0 /0 0 0 0 0 0 0 /0 0 0 0 0 1 1 /1 0 0 1 1 0 0 /0 1 1 0 0 0 0 /0 1 0 0 0 0 0 /0 0 0 0 1 0 /1 0 1 1 1 1 /1 0 1 0 0 0 /1 0 1 0 1 0 /0 0 0 0 0 0 /1 0 0 0 0 0 /0 0 0 0 0 0 /"],
			[49451,"pzprv3/icelom/6/6/75/64/allwhite/. i . 3 i . /i i i . . . /i . i . . . /. . . i . i /. i . i i i /2 . 1 . i . /0 1 1 -1 1 1 0 /0 0 0 0 0 0 0 /0 0 1 1 1 0 0 /1 0 0 1 1 0 0 /0 1 1 0 0 0 0 /0 1 0 0 0 0 0 /0 0 0 0 1 0 /1 0 1 1 1 1 /1 0 1 0 0 0 /1 1 1 0 1 0 /0 1 0 0 0 0 /1 1 0 0 0 0 /0 0 0 0 0 0 /"],
			[41102,"pzprv3/icelom/6/6/75/64/allwhite/. i . 3 i . /i i i . . . /i . i . . . /. . . i . i /. i . i i i /2 . 1 . i . /0 1 1 -1 0 0 0 /0 0 0 0 1 0 0 /0 0 1 1 -1 1 0 /1 0 0 1 1 0 0 /0 1 1 0 0 0 0 /0 1 -1 1 1 1 0 /0 0 0 0 1 0 /1 0 1 0 1 1 /1 0 1 1 -1 0 /1 1 1 0 1 1 /0 1 0 0 0 1 /1 1 1 0 0 1 /0 0 0 0 0 0 /"],
			[50301,"pzprv3/icelom/6/6/75/64/allwhite/. i . 3 i . /i i i . . . /i . i . . . /. . . i . i /. i . i i i /2 . 1 . i . /0 1 1 -1 0 0 0 /0 0 0 0 1 0 0 /0 0 1 1 -1 1 0 /1 0 0 1 1 0 0 /0 1 1 0 0 0 0 /0 1 -1 1 1 1 0 /0 0 0 0 1 0 /1 0 1 0 1 0 /1 0 1 1 -1 0 /1 1 1 0 1 1 /0 1 0 0 0 1 /1 1 1 0 0 1 /0 0 0 0 0 0 /"],
			[49471,"pzprv3/icelom/6/6/75/64/allwhite/. i . 3 i . /i i i . . . /i . i . . . /. . . i . i /. i . i4 i i /2 . 1 . i . /0 1 1 -1 1 1 0 /0 0 0 0 0 1 0 /0 0 1 1 -1 1 0 /1 0 0 1 1 0 0 /0 1 1 0 0 0 0 /0 1 -1 1 1 1 0 /0 0 0 0 1 0 /1 0 1 1 1 1 /1 0 1 1 -1 0 /1 1 1 0 1 1 /0 1 0 0 0 1 /1 1 1 0 0 1 /0 0 0 0 0 0 /"],
			[0,"pzprv3/icelom/6/6/75/64/allwhite/. i . 3 i . /i i i . . . /i . i . . . /. . . i . i /. i . i i i /2 . 1 . i . /0 1 1 -1 1 1 0 /0 0 0 0 0 1 0 /0 0 1 1 -1 1 0 /1 0 0 1 1 0 0 /0 1 1 0 0 0 0 /0 1 -1 1 1 1 0 /0 0 0 0 1 0 /1 0 1 1 1 1 /1 0 1 1 -1 0 /1 1 1 0 1 1 /0 1 0 0 0 1 /1 1 1 0 0 1 /0 0 0 0 0 0 /"]
		],
		icelom2 : [
			[40201,"pzprv3/icelom2/6/6/60/69/skipwhite/. . 3 . i . /i . i . i i /i 4 i 5 . . /. . 2 i 1 i /i i . i . i /. i . 6 . . /0 1 0 0 0 0 0 /0 0 0 0 0 0 0 /0 0 0 0 0 0 0 /0 0 0 0 0 0 0 /0 0 0 0 0 0 0 /0 0 0 0 0 0 0 /1 0 0 0 0 0 /1 0 0 0 0 0 /1 0 0 0 0 0 /1 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /"],
			[40501,"pzprv3/icelom2/6/6/60/69/skipwhite/. . 3 . i . /i . i . i i /i 4 i 5 . . /. . 2 i 1 i /i i . i . i /. i . 6 . . /0 0 0 0 0 0 0 /0 0 0 0 0 0 0 /0 0 0 0 0 0 0 /0 1 1 0 0 0 0 /0 0 0 0 0 0 0 /0 0 0 0 0 0 0 /1 0 0 0 0 0 /1 0 0 0 0 0 /1 1 0 0 0 0 /1 1 0 0 0 0 /0 1 0 0 0 0 /0 1 0 0 0 0 /0 0 0 0 0 0 /"],
			[40601,"pzprv3/icelom2/6/6/60/69/skipwhite/. . 3 . i . /i . i . i i /i 4 i 5 . . /. . 2 i 1 i /i i . i . i /. i . 6 . . /0 0 0 0 0 0 0 /0 0 0 0 0 0 0 /0 0 0 0 0 0 0 /0 0 0 0 0 0 0 /0 1 1 0 0 0 0 /0 0 0 0 0 0 0 /1 0 0 0 0 0 /1 0 0 0 0 0 /1 0 0 0 0 0 /1 0 0 0 0 0 /1 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /"],
			[49411,"pzprv3/icelom2/6/6/60/69/skipwhite/. . 3 . i . /i . i . i i /i 4 i 5 . . /. . 2 i 1 i /i i . i . i /. i . 6 . . /0 0 0 0 0 0 0 /0 0 0 0 0 0 0 /0 0 0 0 0 0 0 /0 -1 0 0 0 0 0 /0 -1 -1 0 0 0 0 /0 1 1 0 0 0 0 /0 0 0 0 0 0 /1 0 0 0 0 0 /1 0 0 0 0 0 /1 0 0 0 0 0 /1 -1 0 0 0 0 /1 -1 0 0 0 0 /0 0 0 0 0 0 /"],
			[49421,"pzprv3/icelom2/6/6/60/69/skipwhite/. . 3 . i . /i . i . i i /i 4 i 5 . . /. . 2 i 1 i /i i . i . i /. i . 6 . . /0 0 0 0 0 0 0 /0 0 0 0 0 0 0 /0 0 0 0 0 0 0 /0 -1 0 0 0 0 0 /0 -1 -1 0 0 0 0 /0 1 1 0 0 0 0 /1 0 0 0 0 0 /1 0 0 0 0 0 /1 0 0 0 0 0 /1 0 0 0 0 0 /1 -1 0 0 0 0 /1 -1 0 0 0 0 /0 0 0 0 0 0 /"],
			[49431,"pzprv3/icelom2/6/6/60/69/skipwhite/. . 3 . i . /i . i . i i /i 4 i 5 . . /. . 2 i 1 i /i i . i . i /. i . 6 . . /0 0 0 0 0 0 0 /0 0 0 0 0 0 0 /0 0 0 0 0 0 0 /0 -1 0 0 0 0 0 /0 -1 -1 0 0 0 0 /0 1 1 0 0 0 0 /1 0 0 0 0 0 /1 0 0 0 0 0 /1 0 0 0 0 0 /1 0 0 0 0 0 /1 -1 0 0 0 0 /1 -1 0 0 0 0 /0 0 1 0 0 0 /"],
			[49451,"pzprv3/icelom2/6/6/60/69/skipwhite/. . 3 . i . /i . i . i i /i 4 i 5 . . /. . 2 i 1 i /i i . i . i /. i . 6 . . /0 0 0 0 1 1 0 /0 0 0 0 -1 -1 0 /0 0 1 1 1 -1 0 /0 -1 0 0 0 0 0 /0 -1 -1 1 1 0 0 /0 1 1 0 0 1 0 /1 0 0 0 0 0 /1 0 0 0 -1 1 /1 0 0 0 -1 1 /1 0 0 0 1 1 /1 -1 -1 0 1 1 /1 -1 1 0 0 1 /0 0 0 0 0 0 /"],
			[49421,"pzprv3/icelom2/6/6/60/69/skipwhite/. . 3 . i . /i . i . i i /i 4 i 5 . . /. . 2 i 1 i /i i . i . i /. i . 6 . . /0 0 0 0 1 1 0 /0 0 0 0 -1 -1 0 /0 0 0 0 0 -1 0 /0 -1 0 1 1 0 0 /0 -1 -1 1 1 0 0 /0 1 1 0 0 1 0 /1 0 0 0 0 0 /1 0 0 0 -1 1 /1 0 0 0 -1 1 /1 0 0 0 0 1 /1 -1 -1 0 1 1 /1 -1 1 0 0 1 /0 0 0 0 0 0 /"],
			[41102,"pzprv3/icelom2/6/6/60/69/skipwhite/. . 3 . i . /i . i . i i /i 4 i 5 . . /. . 2 i 1 i /i i . i . i /. i . . . . /0 0 0 1 1 1 0 /0 0 1 1 -1 -1 0 /0 0 1 1 0 -1 0 /0 -1 0 1 1 0 0 /0 -1 -1 1 1 0 0 /0 1 1 0 1 1 0 /1 0 0 0 0 0 /1 0 1 0 -1 1 /1 1 1 1 -1 1 /1 0 1 0 0 1 /1 -1 -1 0 1 1 /1 -1 1 0 0 1 /0 0 0 1 0 0 /"],
			[30321,"pzprv3/icelom2/6/6/60/69/skipwhite/. . 4 . i . /i . i . i i /i 3 i 5 . . /. . 2 i 1 i /i i . i . i /. i . 5 . . /0 0 1 1 1 1 0 /0 0 0 0 -1 -1 0 /0 0 0 0 0 -1 0 /0 -1 1 1 1 0 0 /0 -1 -1 1 1 0 0 /0 1 1 0 1 1 0 /1 0 0 0 0 0 /1 1 0 0 -1 1 /1 1 0 0 -1 1 /1 1 0 0 0 1 /1 -1 -1 0 1 1 /1 -1 1 0 0 1 /0 0 0 1 0 0 /"],
			[49471,"pzprv3/icelom2/6/6/60/69/skipwhite/. . 3 . i . /i . i . i i /i 4 i 5 . . /. . 2 i 1 i /i i . i . i /. i . 4 . . /0 0 0 1 1 1 0 /0 0 0 0 -1 -1 0 /0 0 0 0 0 -1 0 /0 -1 0 1 1 0 0 /0 -1 -1 1 1 0 0 /0 1 1 0 1 1 0 /1 0 0 0 0 0 /1 0 1 0 -1 1 /1 0 1 0 -1 1 /1 0 1 0 0 1 /1 -1 -1 0 1 1 /1 -1 1 0 0 1 /0 0 0 1 0 0 /"],
			[0,"pzprv3/icelom2/6/6/60/69/skipwhite/. . 3 . i . /i . i . i i /i 4 i 5 . . /. . 2 i 1 i /i i . i . i /. i . 6 . . /0 0 1 -1 1 1 0 /0 0 0 0 -1 -1 0 /0 0 1 1 0 -1 0 /0 -1 0 1 1 0 0 /0 -1 -1 1 1 0 0 /0 1 1 0 1 1 0 /1 0 0 0 0 0 /1 1 1 1 -1 1 /1 1 1 1 -1 1 /1 0 1 0 0 1 /1 -1 -1 0 1 1 /1 -1 1 0 0 1 /0 0 0 1 0 0 /"]
		],
		ichimaga : [
			[40201,"pzprv3/ichimaga/5/5/def/. 3 . . . /. . 4 . . /3 . . . 3 /. . 1 . . /. . . 2 . /1 1 1 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /1 1 1 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			[48121,"pzprv3/ichimaga/5/5/def/. 3 . . . /. . 4 . . /3 . . . 3 /. . 1 . . /. . . 2 . /1 1 -1 0 /0 0 0 0 /0 1 0 0 /0 0 0 0 /0 0 0 0 /1 1 1 0 0 /0 1 0 0 0 /0 0 1 0 0 /0 0 0 0 0 /"],
			[40301,"pzprv3/ichimaga/5/5/def/. 3 . . . /. . 4 . . /3 . . . 3 /. . 1 . . /. . . 2 . /1 1 -1 0 /0 0 0 0 /1 1 0 0 /0 0 0 0 /0 0 0 0 /1 1 1 0 0 /1 1 0 0 0 /1 1 0 0 0 /0 0 0 0 0 /"],
			[43601,"pzprv3/ichimaga/5/5/def/. 3 . . . /. . 4 . . /3 . . . 3 /. . 1 . . /. . . 2 . /1 1 -1 0 /0 1 1 1 /1 0 0 1 /0 0 0 0 /0 0 1 0 /1 1 1 -1 0 /1 -1 1 -1 1 /1 0 0 0 1 /0 0 1 0 0 /"],
			[43401,"pzprv3/ichimaga/5/5/def/. 3 . . . /. . 4 . . /3 . . . 3 /. . 1 . . /. . . 2 . /1 1 -1 0 /0 1 1 1 /1 0 0 1 /0 0 0 0 /0 0 0 0 /1 1 1 -1 0 /1 -1 1 -1 1 /1 0 0 0 1 /0 0 0 0 0 /"],
			[48101,"pzprv3/ichimaga/5/5/def/. 3 . . . /. . 4 . . /2 . . . 3 /. . 1 . . /. . . 2 . /1 1 -1 0 /0 1 1 1 /1 1 -1 1 /1 1 0 0 /0 0 0 1 /1 1 1 -1 0 /1 -1 1 -1 1 /1 -1 -1 1 1 /0 0 0 1 1 /"],
			[50411,"pzprv3/ichimaga/5/5/def/. 3 . . . /. . 4 . . /3 . . . 3 /. . 1 . . /. - . 2 . /1 1 -1 0 /0 1 1 1 /1 1 -1 1 /1 1 0 0 /0 0 0 1 /1 1 1 -1 0 /1 -1 1 -1 1 /1 -1 -1 1 1 /0 0 0 1 1 /"],
			[0,"pzprv3/ichimaga/5/5/def/. 3 . . . /. . 4 . . /3 . . . 3 /. . 1 . . /. . . 2 . /1 1 -1 0 /0 1 1 1 /1 1 -1 1 /1 1 0 0 /0 0 0 1 /1 1 1 -1 0 /1 -1 1 -1 1 /1 -1 -1 1 1 /0 0 0 1 1 /"],
		],
		ichimagam : [
			[40201,"pzprv3/ichimaga/5/5/mag/2 . 2 . . /. 4 . . . /1 . . 4 . /. . 1 . . /. 2 . . 2 /1 1 1 1 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 1 0 /0 0 0 1 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			[40301,"pzprv3/ichimaga/5/5/mag/2 . 2 . . /. 4 . . . /1 . . 4 . /. . 1 . . /. 2 . . 2 /1 1 1 0 /0 0 1 1 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 1 1 0 /0 0 0 1 1 /0 0 0 0 1 /0 0 0 0 1 /"],
			[48111,"pzprv3/ichimaga/5/5/mag/2 . 2 . . /. 4 . . . /1 . . 4 . /. . 1 . . /. 2 . . 2 /0 0 0 0 /1 1 1 0 /0 1 1 1 /0 0 0 0 /0 0 0 1 /0 1 0 0 0 /0 1 0 1 0 /0 0 0 1 0 /0 0 0 1 0 /"],
			[48121,"pzprv3/ichimaga/5/5/mag/2 . 2 . . /. 4 . . . /1 . . 4 . /. . 1 . . /. 2 . . 2 /0 0 0 0 /1 0 1 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 1 0 0 0 /0 1 1 1 0 /0 0 1 0 0 /0 0 0 0 0 /"],
			[43401,"pzprv3/ichimaga/5/5/mag/2 . 2 . . /. 4 . . . /1 . . 4 . /. . 1 . . /. 2 . . 2 /0 0 0 0 /1 1 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 1 0 0 0 /0 1 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			[43601,"pzprv3/ichimaga/5/5/mag/2 . 2 . . /. 4 . . . /1 . . 4 . /. . 1 . . /. 2 . . 2 /0 0 0 0 /1 1 0 0 /0 0 1 1 /0 0 0 0 /0 0 0 0 /0 1 0 0 0 /0 1 0 1 0 /0 0 0 1 0 /0 0 0 0 0 /"],
			[48101,"pzprv3/ichimagam/5/5/mag/2 . 2 . . /. 4 . . . /1 . . 4 . /. . 1 . . /. 2 . . 2 /1 0 1 0 /1 1 0 0 /0 0 1 1 /0 0 0 0 /1 1 0 1 /1 1 1 1 0 /0 1 0 1 0 /1 1 1 1 1 /1 1 1 1 1 /"],
			[50411,"pzprv3/ichimagam/5/5/mag/2 . 2 . . /. 4 . . - /1 . . 4 . /. . 1 . . /. 2 . . 2 /1 0 1 0 /1 1 0 0 /0 0 1 1 /0 0 0 0 /1 0 0 1 /1 1 1 1 0 /0 1 0 1 0 /1 1 1 1 1 /1 1 0 1 1 /"],
			[0,"pzprv3/ichimaga/5/5/mag/2 . 2 . . /. 4 . . . /1 . . 4 . /. . 1 . . /. 2 . . 2 /1 0 1 -1 /1 1 0 -1 /-1 -1 1 1 /0 -1 -1 0 /1 0 0 1 /1 1 1 1 -1 /-1 1 -1 1 -1 /1 1 1 1 1 /1 1 -1 1 1 /"]
		],
		ichimagax : [
			[40201,"pzprv3/ichimagax/5/5/cross/. 3 . 1 . /. . 4 . . /3 . . . 1 /. . 4 . . /. 3 . 1 . /1 1 0 0 /1 1 1 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /1 1 1 0 0 /1 0 1 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			[48121,"pzprv3/ichimagax/5/5/cross/. 3 . 1 . /. . 4 . . /3 . . . 1 /. . 4 . . /. 3 . 1 . /1 1 0 0 /0 1 1 0 /1 0 0 0 /0 1 0 0 /0 0 0 0 /1 1 1 0 0 /1 0 1 0 0 /0 1 0 0 0 /0 0 0 0 0 /"],
			[43601,"pzprv3/ichimagax/5/5/cross/. 3 . 1 . /. . 4 . . /3 . . . 1 /. . 4 . . /. 3 . 1 . /1 1 0 0 /0 1 1 0 /1 0 0 0 /0 0 0 0 /1 1 0 0 /1 1 1 0 0 /1 0 1 0 0 /1 0 0 0 0 /0 1 0 0 0 /"],
			[43401,"pzprv3/ichimagax/5/5/cross/. 3 . 1 . /. . 4 . . /3 . . . 1 /. . 4 . . /. 3 . 1 . /1 1 0 0 /0 1 1 0 /0 0 0 0 /0 1 1 0 /1 1 0 0 /1 1 1 0 0 /1 0 1 0 0 /1 0 1 0 0 /1 1 1 1 0 /"],
			[48101,"pzprv3/ichimagax/5/5/cross/. 3 . 1 . /. . 4 . . /3 . . . 1 /. . 4 . . /. 3 . 1 . /1 1 0 0 /0 1 1 0 /0 0 0 0 /0 1 1 0 /1 1 0 0 /1 1 1 1 0 /1 0 1 0 0 /1 0 1 0 0 /1 1 1 1 0 /"],
			[50411,"pzprv3/ichimagax/5/5/cross/. 3 . 1 . /. . 4 . . /3 . . . 1 /. . 4 . - /. 3 . 1 . /1 1 0 0 /0 1 1 0 /1 1 1 1 /0 1 1 0 /1 1 0 0 /1 1 1 1 0 /1 0 1 0 0 /1 0 1 0 0 /1 1 1 1 0 /"],
			[0,"pzprv3/ichimagax/5/5/cross/. 3 . 1 . /. . 4 . . /3 . . . 1 /. . 4 . . /. 3 . 1 . /1 1 0 -1 /-1 1 1 -1 /1 1 1 1 /-1 1 1 0 /1 1 0 0 /1 1 1 1 -1 /1 -1 1 0 -1 /1 -1 1 0 0 /1 1 1 1 0 /"]
		],
		kaero : [
			[40201,"pzprv3/kaero/3/3/2 3 2 /. . . /1 . 1 /. . . /. . . /. . . /0 1 /1 1 /0 1 /1 0 0 /0 1 0 /0 0 /1 1 /0 0 /1 0 0 /0 1 0 /"],
			[40301,"pzprv3/kaero/3/3/2 3 2 /. . . /1 . 1 /. . . /. . . /. . . /0 1 /1 1 /0 1 /1 0 0 /0 1 0 /0 0 /1 1 /0 0 /0 1 0 /0 1 0 /"],
			[30015,"pzprv3/kaero/3/3/2 3 2 /. . . /1 . 1 /. . . /. . . /. . . /0 1 /1 1 /0 1 /1 0 0 /0 1 0 /0 0 /1 0 /0 0 /0 1 0 /1 0 0 /"],
			[43101,"pzprv3/kaero/3/3/2 3 2 /. . . /1 . 1 /. . . /. . . /. . . /0 1 /1 1 /0 1 /1 0 0 /0 1 0 /0 0 /1 0 /1 0 /0 0 0 /1 0 0 /"],
			[30031,"pzprv3/kaero/3/3/2 3 2 /. . . /1 . 1 /. . . /. . . /. . . /0 1 /1 1 /0 1 /1 0 0 /0 1 0 /0 0 /0 0 /0 0 /0 0 0 /0 0 0 /"],
			[30401,"pzprv3/kaero/3/3/2 3 2 /. . . /1 . 1 /. . . /. . . /. . . /0 1 /1 1 /1 1 /1 0 0 /0 1 0 /0 0 /1 1 /0 1 /1 0 0 /0 0 0 /"],
			[30411,"pzprv3/kaero/3/3/2 3 2 /. . . /1 . 1 /. . . /. . . /. . . /0 1 /1 1 /0 1 /1 0 0 /1 1 0 /0 0 /1 1 /0 1 /1 0 0 /0 0 0 /"],
			[43201,"pzprv3/kaero/3/3/2 3 2 /. . . /1 . 1 /. . . /. . . /. . . /1 1 /0 0 /0 0 /0 1 0 /1 1 1 /0 0 /0 1 /0 1 /1 0 0 /0 0 0 /"],
			[0,"pzprv3/kaero/3/3/2 3 2 /. . . /1 . 1 /+ - - /. . - /- - + /0 1 /1 1 /0 1 /1 0 0 /0 1 0 /0 0 /1 1 /0 1 /1 0 0 /0 0 0 /"]
		],
		kakuro : [
			[10035,"pzprv3/kakuro/5/5/0 0 12 4 0 0 /0 8,4 . . 0,10 0,0 /10 . . . . 0,10 /3 . . 3,17 . . /0 21,0 . . . . /0 0,0 12,0 . . 0,0 /. . . . . /2 . . . . /2 . . . . /. . . . . /. . . . . /"],
			[10036,"pzprv3/kakuro/5/5/0 0 12 4 0 0 /0 8,4 . . 0,10 0,0 /10 . . . . 0,10 /3 . . 3,17 . . /0 21,0 . . . . /0 0,0 12,0 . . 0,0 /. . 3 . . /3 4 1 5 . /1 2 . . . /. . . . . /. . . . . /"],
			[50161,"pzprv3/kakuro/5/5/0 0 12 4 0 0 /0 8,4 . . 0,10 0,0 /10 . . . . 0,10 /3 . . 3,17 . . /0 21,0 . . . . /0 0,0 12,0 . . 0,0 /. . 3 . . /3 4 1 2 . /1 2 . 1 2 /. . 9 . 8 /. . 8 4 . /"],
			[0,"pzprv3/kakuro/5/5/0 0 12 4 0 0 /0 8,4 . . 0,10 0,0 /10 . . . . 0,10 /3 . . 3,17 . . /0 21,0 . . . . /0 0,0 12,0 . . 0,0 /. 5 3 . . /3 4 1 2 . /1 2 . 1 2 /. 1 9 3 8 /. . 8 4 . /"]
		],
		kakuru : [
			[69301,"pzprv3/kakuru/5/5/3 . 10 b 4 /b . . . . /23 . 38 . 11 /. . . . b /16 b 20 . 3 /. 0 . . . /. 0 0 2 2 /. 0 . 0 . /0 0 0 0 . /. . . 0 . /"],
			[69311,"pzprv3/kakuru/5/5/3 . 10 b 4 /b . . . . /23 . 38 . 11 /. . . . b /16 b 20 . 3 /. 1 . . . /. 2 5 3 1 /. 0 . 0 . /0 0 0 0 . /. . . 0 . /"],
			[60201,"pzprv3/kakuru/5/5/3 . 10 b 4 /b . . . . /23 . . . 11 /. . . . b /16 b 20 . 3 /. 1 . . . /. 2 4 3 1 /. 0 3 0 . /0 0 0 0 . /. . . 0 . /"],
			[50191,"pzprv3/kakuru/5/5/3 . 10 b 4 /b . . . . /23 . 38 . 11 /. . . . b /16 b 20 . 3 /. 2 . . . /. 1 4 3 1 /. 0 . 5 . /0 0 0 2 . /. . . 1 . /"],
			[0,"pzprv3/kakuru/5/5/3 . 10 b 4 /b . . . . /23 . 38 . 11 /. . . . b /16 b 20 . 3 /. 2 . . . /. 1 4 3 1 /. 6 . 5 . /7 9 8 2 . /. . . 1 . /"]
		],
		kinkonkan : [
			[31011,"pzprv3/kinkonkan/4/4/5/0 0 1 1 /2 2 1 1 /2 2 3 3 /4 4 3 3 /. 2,2 1,1 . 4,1 . /3,2 . . . . . /. . . . . 1,1 /. . . . . . /3,2 . . . . 4,1 /. . . 2,2 . . /. . . . /. 1 . . /1 . . . /. . . . /"],
			[91201,"pzprv3/kinkonkan/4/4/5/0 0 1 1 /2 2 1 1 /2 2 3 3 /4 4 3 3 /. 2,2 1,1 . 4,1 . /3,2 . . . . . /. . . . . 1,1 /. . . . . . /3,2 . . . . 4,1 /. . . 2,2 . . /. + . + /+ 2 + + /+ + + + /. . + 1 /"],
			[91211,"pzprv3/kinkonkan/4/4/5/0 0 1 1 /2 2 1 1 /2 2 3 3 /4 4 3 3 /. 2,2 1,1 . 4,1 . /3,3 . . . . . /. . . . . 1,1 /. . . . . . /3,3 . . . . 4,1 /. . . 2,2 . . /1 + 1 + /+ 1 + + /+ + + + /2 + + 1 /"],
			[31012,"pzprv3/kinkonkan/4/4/6/0 0 1 2 /3 3 1 2 /3 3 4 4 /5 5 4 4 /. 2,2 1,1 . 4,1 . /3,2 . . . . . /. . . . . 1,1 /. . . . . . /3,2 . . . . 4,1 /. . . 2,2 . . /1 + 1 + /+ 1 + + /+ + + + /2 + + 1 /"],
			[0,"pzprv3/kinkonkan/4/4/5/0 0 1 1 /2 2 1 1 /2 2 3 3 /4 4 3 3 /. 2,2 1,1 . 4,1 . /3,2 . . . . . /. . . . . 1,1 /. . . . . . /3,2 . . . . 4,1 /. . . 2,2 . . /1 + 1 + /+ 1 + + /+ + + + /2 + + 1 /"]
		],
		kouchoku : [
			[42111,"pzprv3/kouchoku/4/4/1 . . . 2 /. . - . . /. 1 . 2 3 /. 2 . . . /- . - 3 . /0/"],
			[49701,"pzprv3/kouchoku/4/4/1 . . . 2 /. . - . . /. 1 . 2 3 /. 2 . . . /- . - 3 . /1/0 2 6 0/"],
			[40211,"pzprv3/kouchoku/4/4/1 . . . 2 /. . - . . /. 1 . 2 3 /. 2 . . . /- . - 3 . /3/0 0 4 2/0 0 2 4/0 0 0 8/"],
			[49711,"pzprv3/kouchoku/4/4/1 . . . 2 /. . - . . /. 1 . 2 3 /. 2 . . . /- . - 3 . /1/0 0 4 8/"],
			[49731,"pzprv3/kouchoku/4/4/1 . . . 2 /. . - . . /. 1 . 2 3 /. 2 . . . /- . - 3 . /1/0 0 6 4/"],
			[49741,"pzprv3/kouchoku/4/4/1 . . . 2 /. . - . . /. 1 . 2 3 /. 2 . . . /- . - 3 . /2/2 6 8 0/2 4 4 8/"],
			[41111,"pzprv3/kouchoku/4/4/1 . . . 2 /. . - . . /. 1 . 2 3 /. 2 . . . /- . - 3 . /2/2 6 8 0/0 0 2 4/"],
			[40111,"pzprv3/kouchoku/4/4/1 . . . 2 /. . - . . /. 1 . 2 3 /. 2 . . . /- . - 3 . /1/0 0 2 4/"],
			[49751,"pzprv3/kouchoku/4/4/1 . . . 2 /. - - . . /. 1 . 2 3 /. 2 . . . /- . - 3 . /10/0 0 2 4/2 6 6 4/6 4 8 0/6 8 8 4/4 2 8 4/4 2 8 0/0 0 0 8/2 4 4 8/0 8 2 6/4 8 6 8/"],
			[49761,"pzprv3/kouchoku/4/4/1 . . . 2 /. . - . . /. 1 . - 3 /. 2 . . . /- . - 3 . /10/0 0 2 4/2 6 6 4/6 4 8 0/6 8 8 4/4 2 8 4/4 2 8 0/0 0 0 8/2 4 4 8/0 8 2 6/4 8 6 8/"],
			[0,"pzprv3/kouchoku/4/4/1 . . . 2 /. . - . . /. 1 . 2 3 /. 2 . . . /- . - 3 . /10/0 0 2 4/2 6 6 4/6 4 8 0/6 8 8 4/4 2 8 4/4 2 8 0/0 0 0 8/2 4 4 8/0 8 2 6/4 8 6 8/"]
		],
		kramma : [
			[30007,"pzprv3/kramma/5/5/1 . . 2 2 /. 1 1 . 2 /. 2 . 1 . /1 . 2 1 . /1 1 . . 2 /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /1 0 1 0 /1 0 1 0 /1 0 1 0 /1 0 1 0 /1 0 1 0 /1 1 1 1 1 /1 1 1 1 1 /-1 -1 -1 -1 -1 /0 0 0 0 0 /"],
			[30026,"pzprv3/kramma/5/5/1 . . 2 2 /. 1 1 . 2 /. 2 . 1 . /1 . 2 1 . /1 1 . . 2 /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /1 0 1 0 /1 0 1 0 /1 0 1 0 /1 0 1 0 /1 0 1 0 /0 0 0 0 0 /1 1 1 1 1 /-1 -1 -1 -1 -1 /0 0 0 0 0 /"],
			[0,"pzprv3/kramma/5/5/1 . . 2 2 /. 1 1 . 2 /. 2 . 1 . /1 . 2 1 . /1 1 . . 2 /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /1 0 1 -1 /1 0 1 -1 /1 -1 1 -1 /1 -1 1 -1 /1 0 1 -1 /-1 -1 -1 -1 -1 /1 1 1 1 1 /-1 -1 -1 -1 -1 /1 1 1 1 1 /"]
		],
		kramman : [
			[32201,"pzprv3/kramman/5/5/2 . . . 1 /. 1 2 . . /. 2 1 2 . /1 . 2 1 . /. 1 . . 2 /. . . . . . /. . . . 1 . /. . . 1 . . /. . 1 . . . /. 1 . . . . /. . . . . . /0 0 1 0 /0 0 1 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /1 1 1 1 1 /0 0 0 0 0 /0 0 0 0 0 /"],
			[32601,"pzprv3/kramman/5/5/2 . . . 1 /. 1 2 . . /. 2 1 2 . /1 . 2 1 . /. 1 . . 2 /. . . . . . /. . . . 1 . /. . . 1 . . /. . 1 . . . /. 1 . . . . /. . . . . . /0 0 1 0 /0 0 1 0 /0 0 1 0 /0 0 1 0 /0 0 0 0 /0 0 0 0 0 /1 1 1 1 1 /0 0 0 0 0 /0 1 1 0 0 /"],
			[32521,"pzprv3/kramman/5/5/2 . . . 1 /. 1 2 . . /. 2 1 2 . /1 . 2 1 . /. 1 . . 2 /. . . . . . /. . . . 1 . /. . . 1 . . /. . 1 . . . /. 1 . . . . /. . . . . . /0 0 0 0 /0 0 0 0 /0 0 1 0 /0 0 1 0 /0 0 0 0 /0 0 0 0 0 /1 1 1 0 0 /0 0 0 0 0 /0 1 1 0 0 /"],
			[30007,"pzprv3/kramman/5/5/2 . . . 1 /. 1 2 . . /. 2 1 2 . /1 . 2 1 . /. 1 . . 2 /. . . . . . /. . . . 1 . /. . . 1 . . /. . 1 . . . /. 1 . . . . /. . . . . . /1 0 0 1 /1 0 0 0 /1 0 0 0 /1 0 0 0 /0 0 0 0 /1 1 1 1 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			[30026,"pzprv3/kramman/5/5/2 . . . 1 /. 1 2 . . /. 2 1 2 . /1 . 2 1 . /. 1 . . 2 /. . . . . . /. . . . 1 . /. . . 1 . . /. . 1 . . . /. 1 . . . . /. . . . . . /1 0 0 1 /1 0 0 0 /1 0 0 0 /1 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			[32101,"pzprv3/kramman/5/5/2 . . . 1 /. 1 2 . . /. 2 1 2 . /1 . 2 1 . /. 1 . . 2 /. . . . . . /. . . 1 1 . /. . . 1 . . /. . 1 . . . /. 1 . . . . /. . . . . . /1 1 1 1 /1 1 0 0 /1 1 1 0 /1 0 1 0 /0 0 1 0 /0 0 0 0 1 /1 1 1 0 0 /0 0 1 1 1 /0 1 1 1 1 /"],
			[32621,"pzprv3/kramman/5/5/2 . . . 1 /. 1 2 . . /. 2 1 2 . /1 . 2 1 . /. 1 . . 2 /. . . . . . /. . . 1 1 . /. . . 1 . . /. . 1 . . . /. 1 . . . . /. . . . . . /1 1 0 1 /1 1 0 0 /1 1 1 0 /1 0 1 0 /0 0 1 0 /0 0 0 0 1 /1 1 1 0 0 /0 0 1 1 1 /0 1 1 1 1 /"],
			[0,"pzprv3/kramman/5/5/2 . . . 1 /. 1 2 . . /. 2 1 2 . /1 . 2 1 . /. 1 . . 2 /. . . . . . /. . . . 1 . /. . . 1 . . /. . 1 . . . /. 1 . . . . /. . . . . . /1 1 -1 1 /1 1 -1 -1 /1 1 1 -1 /1 -1 1 0 /0 -1 1 0 /-1 -1 -1 -1 1 /1 1 1 -1 -1 /-1 -1 1 1 1 /0 1 1 1 1 /"]
		],
		kurochute : [
			[10021,"pzprv3/kurochute/5/5/1 3 2 . . /. . . 1 . /. . 1 . . /. 2 . . . /. . 3 3 2 /. . . . . /. 1 . . . /. 1 . . . /. . . . . /. . . . . /"],
			[10020,"pzprv3/kurochute/5/5/1 3 2 . . /. . . 1 . /. . 1 . . /. 2 . . . /. . 3 3 2 /- . . . . /1 + 1 . . /+ 1 . 1 . /. . . . 1 /. . . . . /"],
			[90401,"pzprv3/kurochute/5/5/1 3 2 . . /. . . 1 . /. . 1 . . /. 2 . . . /. . 3 3 2 /- - - + 1 /1 + 1 . + /+ + . 1 . /. - + . . /1 . - - . /"],
			[0,"pzprv3/kurochute/5/5/1 3 2 . . /. . . 1 . /. . 1 . . /. 2 . . . /. . 3 3 2 /- - - + 1 /1 + 1 . + /+ + . . 1 /. - + 1 . /1 . - - . /"]
		],
		kurodoko : [
			[10021,"pzprv3/kurodoko/5/5/. . . 7 . /5 . . . . /. . 2 . . /. . . . 2 /. 4 . . . /. . . . . /. . . . . /. . . . . /. . # . . /. . # . . /"],
			[10020,"pzprv3/kurodoko/5/5/. . . 7 . /5 . . . . /. . 2 . . /. . . . 2 /. 4 . . . /. # . . . /. . # . . /. # . . . /. . # . . /. . . # . /"],
			[90301,"pzprv3/kurodoko/5/5/. . . 7 . /5 . . . . /. . 2 . . /. . . . 2 /. 4 . . . /# + + + . /+ + # + + /+ # + + # /+ + # + + /# + + + # /"],
			[0,"pzprv3/kurodoko/5/5/. . . 7 . /5 . . . . /. . 2 . . /. . . . 2 /. 4 . . . /+ # + + . /+ + # + + /+ # + + # /+ + # + + /# + + + # /"]
		],
		kusabi : [
			[40201,"pzprv3/kusabi/5/5/3 1 1 . . /. . . 2 . /. . 1 2 . /. . 1 . . /. . . . 3 /0 0 0 0 /0 0 0 0 /1 1 0 0 /0 0 0 0 /0 0 0 0 /1 0 0 0 0 /1 0 0 0 0 /1 0 0 0 0 /1 0 0 0 0 /"],
			[40301,"pzprv3/kusabi/5/5/3 1 1 . . /. . . 2 . /. . 1 2 . /. . 1 . . /. . . . 3 /0 0 0 0 /0 0 0 0 /1 1 0 0 /0 0 0 0 /0 1 0 0 /1 1 0 0 0 /1 1 0 0 0 /0 1 0 0 0 /0 1 1 0 0 /"],
			[43302,"pzprv3/kusabi/5/5/3 1 1 . . /. . . 2 . /. . 1 2 . /. . 1 . . /. . . . 3 /0 1 1 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 1 0 0 /0 1 0 1 0 /0 1 0 0 0 /0 1 0 0 0 /0 1 1 0 0 /"],
			[43102,"pzprv3/kusabi/5/5/3 1 1 . . /. . . 2 . /. . 1 2 . /. . 1 . . /. . . . 3 /0 0 0 0 /1 0 0 0 /0 0 0 0 /1 1 1 1 /0 0 0 0 /0 0 0 0 0 /1 0 0 0 0 /1 0 0 0 0 /0 0 0 0 1 /"],
			[48201,"pzprv3/kusabi/5/5/3 1 1 . . /. . . 2 . /. . 1 2 . /. . 1 . . /. . . . 3 /0 0 0 0 /0 1 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 1 0 0 0 /0 0 1 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			[48211,"pzprv3/kusabi/5/5/3 1 1 . . /. . . 2 . /. . 1 2 . /. . 1 . . /. . . . 3 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 1 1 0 /0 1 0 0 0 /0 1 0 0 0 /0 1 0 1 0 /0 1 0 1 0 /"],
			[48221,"pzprv3/kusabi/5/5/3 1 1 . . /. . . 2 . /. . 1 2 . /. . 1 . . /. . . . 3 /0 0 0 0 /0 1 1 0 /1 0 0 0 /0 0 0 0 /0 0 0 0 /1 0 0 0 0 /1 1 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			[48231,"pzprv3/kusabi/5/5/3 1 1 . . /. . . 2 . /. . 1 2 . /. . 1 . . /. . . . 3 /0 0 0 0 /0 0 1 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 1 0 0 /-1 -1 0 0 0 /-1 -1 0 0 0 /"],
			[48241,"pzprv3/kusabi/5/5/3 1 1 . . /. . . 2 . /. . 1 2 . /. . 1 . . /. . . . 3 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 1 0 0 /0 1 0 0 0 /0 1 0 0 0 /0 1 0 0 0 /0 1 1 0 0 /"],
			[48251,"pzprv3/kusabi/5/5/2 1 1 . . /. . . 2 . /. . 1 3 . /. . 1 . . /. . . . 3 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /1 1 1 0 /1 0 0 0 0 /1 0 0 0 0 /1 0 0 1 0 /1 0 0 1 0 /"],
			[43401,"pzprv3/kusabi/5/5/3 1 1 . . /. . . 2 . /. . 1 2 . /. . 1 . . /. . . . 3 /0 0 0 0 /0 1 0 0 /0 0 0 0 /0 0 0 0 /1 1 1 0 /1 1 1 0 0 /1 0 0 0 0 /1 -1 0 0 0 /1 -1 0 1 0 /"],
			[43202,"pzprv3/kusabi/5/5/3 1 1 . . /. . . 2 . /. . 1 2 . /. . 1 . . /. . . . 3 /0 0 0 1 /0 1 0 0 /-1 1 0 0 /-1 1 0 0 /1 1 1 0 /1 1 1 0 1 /1 -1 0 0 1 /1 1 0 1 1 /1 -1 0 1 0 /"],
			[43502,"pzprv3/kusabi/5/5/3 1 1 . . /. . . 2 . /. . 1 2 . /. . 1 . . /. . . . 3 /0 0 0 0 /0 1 0 0 /-1 1 0 0 /-1 1 0 0 /1 1 1 0 /1 1 1 0 0 /1 -1 0 0 0 /1 1 0 1 0 /1 -1 0 1 0 /"],
			[0,"pzprv3/kusabi/5/5/3 1 1 . . /. . . 2 . /. . 1 2 . /. . 1 . . /. . . . 3 /0 0 0 1 /0 1 0 0 /-1 1 0 0 /-1 1 0 0 /1 1 1 0 /1 1 1 1 1 /1 -1 0 0 1 /1 1 0 1 1 /1 -1 0 1 1 /"]
		],
		lightup : [
			[10039,"pzprv3/lightup/6/6/. . . . . . /. . 4 . . . /. # . . 2 . /# 0 # . . . /. # . 1 . . /. . . . . . /"],
			[90801,"pzprv3/lightup/6/6/. . # . . # /. # 4 # . . /. . # . 2 . /. 0 . . # . /. . . 1 . . /. . . . . . /"],
			[10039,"pzprv3/lightup/6/6/. . # . . . /. # 4 # . . /. . # . 2 # /+ 0 . . # . /. + . 1 . . /. . . . . . /"],
			[90811,"pzprv3/lightup/6/6/. . # . . . /. # 4 # . . /. . # . 2 # /+ 0 . . # . /. + . 1 . . /. . . # . . /"],
			[0,"pzprv3/lightup/6/6/. . # . . . /. # 4 # . . /. . # . 2 # /+ 0 . . # . /# + . 1 . . /. . . # . . /"]
		],
		lits : [
			[10001,"pzprv3/lits/4/4/3/0 0 1 1 /0 0 1 2 /0 1 1 2 /2 2 2 2 /# # . . /# # . . /. . . . /. . . . /"],
			[30081,"pzprv3/lits/4/4/3/0 0 1 1 /0 0 1 2 /0 1 1 2 /2 2 2 2 /. . # # /. . # . /. # # . /. . . . /"],
			[30032,"pzprv3/lits/4/4/3/0 0 1 1 /0 0 1 2 /0 1 1 2 /2 2 2 2 /. . # # /. . . . /. # # # /. . . . /"],
			[90031,"pzprv3/lits/4/4/3/0 0 1 1 /0 0 1 2 /0 1 1 2 /2 2 2 2 /# # # # /# . # . /# . # . /. . . . /"],
			[10005,"pzprv3/lits/4/4/3/0 0 1 1 /0 0 1 2 /0 1 1 2 /2 2 2 2 /# . # # /# . # . /# . # . /. . . . /"],
			[30041,"pzprv3/lits/4/4/3/0 0 1 1 /0 0 1 2 /0 1 1 2 /2 2 2 2 /# . # # /# # # . /# . # . /. . . . /"],
			[30071,"pzprv3/lits/4/4/3/0 0 1 1 /0 0 1 2 /0 1 1 2 /2 2 2 2 /# . # # /# # # . /# . # . /. . # # /"],
			[0,"pzprv3/lits/4/4/3/0 0 1 1 /0 0 1 2 /0 1 1 2 /2 2 2 2 /# + # # /# # # + /# + # + /# # # # /"]
		],
		loopsp : [
			[50121,"pzprv3/loopsp/5/5/. . . . . /. a . g . /1 . 1 . 2 /. d . f . /. . . . . /0 0 0 0 /0 0 1 1 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 1 0 /0 0 0 1 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			[40201,"pzprv3/loopsp/5/5/. . . . . /. a . g . /1 . 1 . 2 /. d . f . /. . . . . /0 0 0 0 /0 1 0 0 /0 0 0 0 /0 1 1 0 /0 0 0 0 /0 1 1 0 0 /0 1 0 0 0 /0 1 0 0 0 /0 0 0 1 0 /"],
			[49341,"pzprv3/loopsp/5/5/. . . . . /. a . g . /1 . 1 . 2 /. d . f . /. . . . . /0 0 0 0 /0 0 0 0 /1 1 1 0 /0 0 0 0 /0 0 0 0 /0 0 1 0 0 /0 0 1 0 0 /0 0 1 0 0 /0 0 1 0 0 /"],
			[49601,"pzprv3/loopsp/5/5/. . . . . /. a . g . /1 . 1 . 2 /. d . f . /. . . . . /1 1 1 1 /0 0 0 0 /1 1 0 0 /0 0 0 0 /0 0 1 1 /1 0 0 0 1 /1 0 0 0 1 /0 0 1 0 1 /0 0 1 0 1 /"],
			[49611,"pzprv3/loopsp/5/5/. . . . . /. a . g . /1 . 1 . 2 /. d . f . /. . . . . /1 0 1 1 /0 0 0 1 /0 0 1 0 /0 1 0 0 /1 1 0 0 /1 1 1 0 1 /1 1 1 1 0 /1 1 0 0 0 /1 0 1 0 0 /"],
			[49621,"pzprv3/loopsp/5/5/. . . . . /. a . g . /1 . 1 . 2 /. d . f . /. . . . . /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 1 0 /0 -1 1 -1 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 1 1 0 /"],
			[40421,"pzprv3/loopsp/5/5/. . . . . /. a . g . /1 . 1 . 2 /. d . f . /. . . . . /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			[50151,"pzprv3/loopsp/5/5/. . . . . /. a . g . /1 . 1 . 2 /. d . f . /. . . . . /1 0 1 1 /1 1 0 1 /0 0 0 1 /0 1 1 0 /0 0 0 1 /1 1 1 0 1 /0 1 0 1 0 /0 1 0 0 1 /0 0 0 1 1 /"],
			[40101,"pzprv3/loopsp/5/5/. . . . . /. a . g . /1 . 1 . 2 /. d . f . /. . . . . /1 -1 1 1 /1 1 -1 1 /1 1 -1 1 /0 1 1 0 /0 1 -1 1 /1 1 1 -1 1 /-1 1 -1 1 0 /1 1 1 0 1 /1 0 1 1 1 /"],
			[0,"pzprv3/loopsp/5/5/. . . . . /. a . g . /1 . 1 . 2 /. d . f . /. . . . . /1 -1 1 1 /1 1 -1 1 /1 1 -1 1 /0 1 1 0 /1 1 -1 1 /1 1 1 -1 1 /-1 1 -1 1 0 /1 1 1 0 1 /1 0 1 1 1 /"]
		],
		loute : [
			[39501,"pzprv3/loute/5/5/5 . . . 3 /. . 1 . . /1 . . . 1 /. . 2 . . /4 . . . 5 /0 0 0 0 /0 1 0 0 /1 0 0 0 /1 0 0 0 /0 0 0 0 /1 1 0 0 0 /0 1 0 0 0 /0 0 0 0 0 /1 0 0 0 0 /"],
			[39511,"pzprv3/loute/5/5/5 . . . 3 /. . 1 . . /1 . . . 1 /. . 2 . . /4 . . . 5 /0 0 0 0 /0 0 0 0 /1 0 0 0 /0 1 0 0 /0 0 0 0 /0 0 0 0 0 /1 0 0 0 0 /0 1 0 0 0 /1 1 0 0 0 /"],
			[39521,"pzprv3/loute/5/5/5 . . . 3 /. . 1 . . /1 . . . 1 /. . 2 . . /4 . . . 5 /0 0 0 0 /1 0 0 0 /1 0 0 0 /0 1 1 0 /0 1 0 0 /0 1 0 0 0 /0 0 0 0 0 /1 0 1 0 0 /0 0 0 1 1 /"],
			[32101,"pzprv3/loute/5/5/5 . . . 3 /. . 1 . . /1 . . . 1 /. . 2 . . /4 . . . 5 /-1 1 0 -1 /1 1 1 0 /1 0 0 1 /-1 1 1 1 /-1 -1 1 -1 /-1 1 0 1 1 /-1 0 1 0 0 /1 0 1 0 1 /1 1 -1 1 -1 /"],
			[30039,"pzprv3/loute/5/5/5 . . . 3 /. . 1 . . /1 . . . 1 /. . 2 . . /4 . . . 5 /-1 1 0 -1 /1 1 1 0 /1 0 0 1 /-1 1 1 1 /-1 -1 1 -1 /-1 1 0 1 1 /-1 0 1 1 0 /1 0 1 0 1 /1 1 -1 1 -1 /"],
			[0,"pzprv3/loute/5/5/5 . . . 3 /. . 1 . . /1 . . . 1 /. . 2 . . /4 . . . 5 /-1 1 0 -1 /1 1 1 0 /1 1 0 1 /-1 1 1 1 /-1 -1 1 -1 /-1 1 0 1 1 /-1 0 1 1 0 /1 0 1 0 1 /1 1 -1 1 -1 /"]
		],
		mashu : [
			[40201,"pzprv3/mashu/6/6/. . 1 . . . /. 2 . . 1 . /. . . . . . /. . . 2 . . /. 1 . . . . /. . . . . . /0 0 1 1 0 /0 0 0 0 0 /1 1 1 1 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 1 0 0 0 /0 0 1 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /"],
			[40301,"pzprv3/mashu/6/6/. . 1 . . . /. 2 . . 1 . /. . . . . . /. . . 2 . . /. 1 . . . . /. . . . . . /0 0 1 1 0 /0 0 0 0 0 /1 1 1 1 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 1 0 0 0 /0 0 1 0 0 0 /0 0 1 0 0 0 /0 0 1 0 0 0 /0 0 1 0 0 0 /"],
			[49211,"pzprv3/mashu/6/6/. . 1 . . . /. 2 . . 1 . /. . . . . . /. . . 2 . . /. 1 . . . . /. . . . . . /0 0 1 1 0 /0 0 0 0 0 /0 0 1 1 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 1 0 0 0 /0 0 1 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /"],
			[49231,"pzprv3/mashu/6/6/. . 1 . . . /. 2 . . 1 . /. . . . . . /. . . 2 . . /. 1 . . . . /. . . . . . /0 0 0 0 0 /0 1 1 -1 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 0 /0 1 0 0 0 0 /0 1 0 1 0 0 /0 -1 0 1 0 0 /0 0 0 1 0 0 /"],
			[49241,"pzprv3/mashu/6/6/. . 1 . . . /. 2 . . 1 . /. . . . . . /. . . 2 . . /. 1 . . . . /. . . . . . /1 1 1 0 0 /0 1 1 -1 0 /0 0 0 0 0 /0 0 1 0 0 /0 0 0 0 0 /0 0 0 0 0 /1 0 0 0 0 0 /0 1 0 0 0 0 /0 1 0 1 0 0 /0 -1 1 0 0 0 /0 0 0 0 0 0 /"],
			[49221,"pzprv3/mashu/6/6/. . 1 . . . /. 2 . . 1 . /. . . . . . /. . . 2 . . /. 1 . . . . /. . . . . . /1 1 1 1 0 /0 1 1 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /1 0 0 0 0 0 /1 1 0 0 0 0 /1 1 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /"],
			[49201,"pzprv3/mashu/6/6/. . 1 . . . /. 2 . . 1 . /. . . . . . /. . . 2 . . /. 1 . . . . /. . . . . . /1 1 1 0 0 /0 1 1 -1 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /1 0 0 1 0 0 /0 1 0 0 0 0 /0 1 0 0 0 0 /0 -1 0 0 0 0 /0 0 0 0 0 0 /"],
			[40101,"pzprv3/mashu/6/6/. . 1 . . . /. 2 . . 1 . /. . . . . . /. . . 2 . . /. 1 . . . . /. . . . . . /1 1 1 0 1 /0 1 1 -1 0 /0 0 0 0 0 /0 1 0 0 0 /1 1 0 0 0 /0 0 0 0 0 /1 0 0 1 1 1 /1 1 0 0 1 1 /1 1 0 0 0 1 /1 -1 0 1 0 0 /0 0 0 1 0 0 /"],
			[41101,"pzprv3/mashu/6/6/. . 1 . . . /. 2 . . 1 . /. . . . . . /. . . 2 . . /. 1 . . . . /. . . . . . /1 1 1 0 1 /0 1 1 -1 0 /0 0 0 0 0 /0 1 1 0 0 /1 1 0 0 0 /0 0 1 0 1 /1 0 0 1 1 1 /1 1 0 0 1 1 /1 1 0 0 1 1 /1 -1 0 1 1 1 /0 0 1 1 1 1 /"],
			[0,"pzprv3/mashu/6/6/. . 1 . . . /. 2 . . 1 . /. . . . . . /. . . 2 . . /. 1 . . . . /. . . . . . /1 1 1 0 1 /0 1 1 -1 0 /0 0 1 1 0 /0 1 -1 1 1 /1 1 0 0 0 /0 0 1 0 0 /1 0 0 1 1 1 /1 1 0 0 1 1 /1 1 1 -1 0 1 /1 -1 0 1 0 0 /0 0 1 1 0 0 /"]
		],
		mejilink : [
			[40201,"pzprv3/mejilink/4/4/1 0 1 1 1 /2 2 1 1 1 /2 0 1 1 1 /1 0 0 0 1 /1 1 1 1 /1 0 0 0 /2 0 0 1 /1 1 0 1 /1 1 1 1 /"],
			[40301,"pzprv3/mejilink/4/4/1 0 1 1 1 /1 1 1 2 1 /1 0 2 2 1 /1 0 0 0 1 /1 1 1 1 /1 0 0 0 /1 0 2 2 /2 2 0 2 /1 1 1 1 /"],
			[39101,"pzprv3/mejilink/4/4/2 0 1 1 1 /1 2 1 1 1 /2 0 1 1 1 /2 0 0 0 1 /2 2 1 1 /2 0 0 0 /2 0 0 1 /1 1 0 1 /2 2 2 2 /"],
			[40101,"pzprv3/mejilink/4/4/2 0 1 2 2 /1 2 1 2 2 /2 0 1 2 2 /2 0 0 1 2 /2 2 2 1 /2 0 0 0 /2 0 0 1 /1 1 0 0 /2 2 2 2 /"],
			[41101,"pzprv3/mejilink/4/4/2 2 0 2 2 /2 2 0 2 2 /1 0 0 0 1 /2 1 0 1 2 /2 1 1 2 /1 0 0 1 /2 1 1 2 /2 2 2 2 /2 2 2 2 /"],
			[0,"pzprv3/mejilink/4/4/2 0 -1 1 2 /-1 2 -1 1 2 /2 0 -1 2 1 /2 0 0 0 2 /2 2 2 2 /2 0 0 0 /2 0 0 2 /-1 -1 0 2 /2 2 2 2 /"]
		],
		minarism : [
			[10037,"pzprv3/minarism/4/4/b b b /0 0 0 /0 0 0 /0 0 0 /2 1 0 0 /0 0 0 0 /0 0 a 0 /4 . . 4 /. . . . /. . . . /. . . . /"],
			[69101,"pzprv3/minarism/4/4/b b b /0 0 0 /0 0 0 /0 0 0 /2 1 0 0 /0 0 0 0 /0 0 a 0 /4 3 2 1 /1 . . . /. . . . /. . . . /"],
			[69111,"pzprv3/minarism/4/4/b b b /0 0 0 /0 0 0 /0 0 0 /2 1 0 0 /0 0 0 0 /0 0 a 0 /4 3 2 1 /2 4 . . /. . 3 . /. . 1 . /"],
			[50171,"pzprv3/minarism/4/4/b b b /0 0 0 /0 0 0 /0 0 0 /2 1 0 0 /0 0 0 0 /0 0 a 0 /4 3 2 1 /2 4 1 3 /. . 3 . /. . 4 . /"],
			[0,"pzprv3/minarism/4/4/b b b /0 0 0 /0 0 0 /0 0 0 /2 1 0 0 /0 0 0 0 /0 0 a 0 /4 3 2 1 /2 4 1 3 /1 2 3 4 /3 1 4 2 /"]
		],
		mochikoro : [
			[10001,"pzprv3/mochikoro/5/5/4 . . . . /. . . . . /. 2 . . . /. . . . . /1 . . . 1 /. . . # # /. . . # # /. . . . . /. . . . . /. . . . . /"],
			[10008,"pzprv3/mochikoro/5/5/4 . . . . /. . . . . /. 2 . . . /. . . . . /1 . . . 1 /+ + + + # /# # # # # /. . . . . /. . . . . /. . . . . /"],
			[10012,"pzprv3/mochikoro/5/5/4 . . . . /. . . . . /. 2 . . . /. . . . . /1 . . . 1 /+ + + + # /# # # # + /. . # + + /. . . # # /. . . . . /"],
			[30010,"pzprv3/mochikoro/5/5/4 . . . . /. . . . . /. 2 . . . /. . . . . /1 . . . 1 /+ + # + . /. . # . + /. . # . + /# # . # # /. . # . . /"],
			[30020,"pzprv3/mochikoro/5/5/4 . . . . /. . . . . /. 2 . . . /. . . . . /1 . . . 1 /+ + + + # /# # # # + /# + + # + /+ # # + # /+ # + # + /"],
			[0,"pzprv3/mochikoro/5/5/4 . . . . /. . . . . /. 2 . . . /. . . . . /1 . . . 1 /+ + + + # /# # # # + /# + # + # /# + # + # /+ # + # + /"]
		],
		mochinyoro : [
			[10001,"pzprv3/mochinyoro/5/5/. . . . . /. 4 . 2 . /. . . . . /. 2 . . . /. . . . 1 /. . . . . /. . . . . /. . . . . /. . # # . /. . # # . /"],
			[10008,"pzprv3/mochinyoro/5/5/. . . . . /. 4 . 2 . /. . . . . /. 2 . . . /. . . . 1 /. . # . . /. . # . . /# # # . . /. . . . . /. . . . . /"],
			[10012,"pzprv3/mochinyoro/5/5/. . . . . /. 4 . 2 . /. . . . . /. 2 . . . /. . . . 1 /+ + # . . /+ + # . . /# # + . . /. . . . . /. . . . . /"],
			[30010,"pzprv3/mochinyoro/5/5/. . . . . /. 4 . 2 . /. . . . . /. 2 . . . /. . . . 1 /+ + # . # /+ + # . # /. . # # . /. . # . # /# # . # . /"],
			[30020,"pzprv3/mochinyoro/5/5/. . . . . /. 4 . 2 . /. . . . . /. 2 . . . /. . . . 1 /+ + # . . /+ + # + . /# # + # # /# + # + # /# # # # + /"],
			[10013,"pzprv3/mochinyoro/5/5/. . . . . /. 4 . 2 . /. . . . . /. 2 . . . /. . . . 1 /+ + # + # /+ + # + # /# # + # # /# + # + # /# + # # + /"],
			[0,"pzprv3/mochinyoro/5/5/. . . . . /. 4 . 2 . /. . . . . /. 2 . . . /. . . . 1 /+ + # # # /+ + # + + /# # + # # /# + # + # /# + # # + /"]
		],
		nagenawa : [
			[42101,"pzprv3/nagenawa/6/6/13/0 0 1 1 2 2 /0 3 3 4 4 2 /5 3 6 6 4 7 /5 8 6 6 9 7 /10 8 8 9 9 11 /10 10 12 12 11 11 /3 . 0 . 1 . /. 1 . 3 . . /1 . 4 . . . /. 2 . . . . /3 . . 2 . . /. . . . . . /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /"],
			[30331,"pzprv3/nagenawa/6/6/13/0 0 1 1 2 2 /0 3 3 4 4 2 /5 3 6 6 4 7 /5 8 6 6 9 7 /10 8 8 9 9 11 /10 10 12 12 11 11 /3 . 0 . 1 . /. 1 . 3 . . /1 . 4 . . . /. 2 . . . . /3 . . 2 . . /. . . . . . /1 0 0 0 0 /0 0 0 0 0 /1 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /1 1 0 0 0 0 /1 1 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 2 2 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /"],
			[40201,"pzprv3/nagenawa/6/6/13/0 0 1 1 2 2 /0 3 3 4 4 2 /5 3 6 6 4 7 /5 8 6 6 9 7 /10 8 8 9 9 11 /10 10 12 12 11 11 /3 . 0 . 1 . /. 1 . 3 . . /1 . 4 . . . /. 2 . . . . /3 . . 2 . . /. . . . . . /1 0 0 0 0 /1 0 0 0 0 /0 0 0 0 0 /1 0 0 0 0 /1 0 0 0 0 /1 0 0 0 0 /1 1 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /1 0 0 0 0 0 /1 0 0 0 0 0 /0 0 2 2 0 0 /0 0 2 0 0 0 /2 2 0 0 0 0 /1 0 0 0 0 0 /1 0 0 0 0 0 /1 1 0 0 0 0 /"],
			[40101,"pzprv3/nagenawa/6/6/13/0 0 1 1 2 2 /0 3 3 4 4 2 /5 3 6 6 4 7 /5 8 6 6 9 7 /10 8 8 9 9 11 /10 10 12 12 11 11 /3 . 0 . 1 . /. 1 . 3 . . /1 . 4 . . . /. 2 . . . . /3 . . 2 . . /. . . . . . /1 0 0 0 0 /1 0 0 1 0 /0 0 1 1 0 /1 0 0 0 0 /0 0 0 0 0 /1 0 0 0 0 /1 1 0 0 0 0 /0 0 0 1 0 0 /0 0 1 1 0 0 /1 1 0 0 0 0 /1 1 0 0 0 0 /0 0 2 2 0 0 /0 0 2 0 0 0 /2 2 0 0 0 0 /1 0 0 0 0 0 /1 0 2 0 0 0 /1 1 0 0 0 0 /"],
			[30341,"pzprv3/nagenawa/6/6/13/0 0 1 1 2 2 /0 3 3 4 4 2 /5 3 6 6 4 7 /5 8 6 6 9 7 /10 8 8 9 9 11 /10 10 12 12 11 11 /3 . 0 . 1 . /. 1 . 3 . . /1 . 4 . . . /. 2 . . . . /3 . . 2 . . /. . . . . . /1 0 0 0 0 /1 0 0 1 0 /0 0 1 1 0 /1 0 1 0 0 /0 0 0 0 0 /1 0 0 0 0 /1 1 0 0 0 0 /0 0 0 1 1 0 /0 0 1 1 0 0 /1 1 0 0 0 0 /1 1 0 0 0 0 /0 0 2 2 0 0 /0 0 2 0 0 0 /2 2 0 0 0 0 /1 0 0 0 0 0 /1 0 2 0 0 0 /1 1 0 0 0 0 /"],
			[49501,"pzprv3/nagenawa/6/6/13/0 0 1 1 2 2 /0 3 3 4 4 2 /5 3 6 6 4 7 /5 8 6 6 9 7 /10 8 8 9 9 11 /10 10 12 12 11 11 /3 . 0 . 1 . /. 1 . 3 . . /1 . 4 . . . /. . . . . . /3 . . 2 . . /. . . . . . /1 0 0 0 0 /1 0 0 1 1 /0 0 1 1 0 /1 0 1 1 0 /0 0 1 0 0 /1 0 1 1 1 /1 1 0 0 0 0 /0 0 0 1 0 1 /0 0 1 1 1 1 /1 1 0 1 0 1 /1 1 1 0 0 1 /0 0 2 2 0 0 /0 0 2 0 0 0 /2 2 0 0 0 0 /1 0 0 0 0 0 /1 0 2 0 0 0 /1 1 0 0 0 0 /"],
			[0,"pzprv3/nagenawa/6/6/13/0 0 1 1 2 2 /0 3 3 4 4 2 /5 3 6 6 4 7 /5 8 6 6 9 7 /10 8 8 9 9 11 /10 10 12 12 11 11 /3 . 0 . 1 . /. 1 . 3 . . /1 . 4 . . . /. 2 . . . . /3 . . 2 . . /. . . . . . /1 0 0 0 0 /1 0 0 1 1 /0 0 1 1 0 /1 0 1 1 0 /0 0 0 0 0 /1 0 0 1 1 /1 1 0 0 0 0 /0 0 0 1 0 1 /0 0 1 1 1 1 /1 1 0 1 0 1 /1 1 0 1 0 1 /0 0 2 2 0 0 /0 0 2 0 0 0 /2 2 0 0 0 0 /1 0 0 0 0 0 /1 0 2 0 0 0 /1 1 0 0 0 0 /"]
		],
		nanro : [
			[10003,"pzprv3/nanro/4/4/5/0 0 0 1 /2 3 3 1 /2 3 3 1 /2 4 4 4 /. . . 1 /3 . . . /. . . . /. 1 . . /. . . . /. . . - /3 2 . - /3 . - - /"],
			[30111,"pzprv3/nanro/4/4/5/0 0 0 1 /2 3 3 1 /2 3 3 1 /2 4 4 4 /. . . 1 /3 . . . /. . . . /. 1 . . /. . . . /. 3 3 - /3 . 3 - /3 . - - /"],
			[31004,"pzprv3/nanro/4/4/5/0 0 0 1 /2 3 3 1 /2 3 3 1 /2 4 4 4 /. . . 1 /3 . . . /. . . . /. 1 . . /. + . . /. . 1 - /3 - 2 - /3 . - - /"],
			[69701,"pzprv3/nanro/4/4/5/0 0 0 1 /2 3 3 1 /2 3 3 1 /2 4 4 4 /. . . 1 /3 . . . /. . . . /. 1 . . /. + . . /. . 1 - /3 - 1 - /3 . - - /"],
			[10009,"pzprv3/nanro/4/4/5/0 0 0 1 /2 3 3 1 /2 3 3 1 /2 4 4 4 /. . . 1 /3 . . . /. . . . /. 1 . . /. + . . /. 1 . - /3 - . - /3 . - - /"],
			[69711,"pzprv3/nanro/4/4/5/0 0 0 1 /2 3 3 1 /2 3 3 1 /2 4 4 4 /. . . 1 /3 . . . /. . . . /. 1 . . /. 3 3 . /. 1 . - /3 - . - /3 . - - /"],
			[31007,"pzprv3/nanro/4/4/6/0 0 0 1 /2 3 4 1 /2 3 4 1 /2 5 5 5 /. . . 1 /3 . . . /. . . . /. 1 . . /. 2 2 . /. 1 . - /3 - . - /3 . - - /"],
			[0,"pzprv3/nanro/4/4/5/0 0 0 1 /2 3 3 1 /2 3 3 1 /2 4 4 4 /. . . 1 /3 . . . /. . . . /. 1 . . /. 2 2 . /. 1 . - /3 - . - /3 . - - /"]
		],
		nawabari : [
			[20010,"pzprv3/nawabari/5/5/. . . . . /. 0 . 1 . /. . . . . /. 2 . 1 . /. . . . . /0 0 1 0 /0 0 1 0 /0 1 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 1 0 0 /1 1 0 0 0 /0 0 0 0 0 /"],
			[30003,"pzprv3/nawabari/5/5/. . . . . /. 0 . 1 . /. . . . . /. 2 . 1 . /. . . . . /0 0 1 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /1 1 1 1 1 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			[30011,"pzprv3/nawabari/5/5/. . . . . /. 0 . 1 . /. . . . . /. 2 . 1 . /. . . . . /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			[32401,"pzprv3/nawabari/5/5/. . . . . /. 0 . 1 . /. . . . . /. 2 . 1 . /. . . . . /0 0 1 0 /0 0 1 0 /0 0 1 0 /0 0 1 0 /0 0 1 0 /0 0 0 0 0 /0 0 0 1 1 /1 1 1 0 0 /0 0 0 0 0 /"],
			[32101,"pzprv3/nawabari/5/5/. . . . . /. 0 . 1 . /. . . . . /. 2 . 1 . /. . . . . /0 0 1 0 /0 0 1 0 /0 0 1 0 /0 1 0 0 /0 1 0 0 /0 0 0 0 0 /0 0 0 0 0 /1 1 1 1 1 /0 0 1 0 0 /"],
			[0,"pzprv3/nawabari/5/5/. . . . . /. 0 . 1 . /. . . . . /. 2 . 1 . /. . . . . /0 0 1 0 /0 0 1 0 /0 0 1 0 /0 1 0 0 /0 1 0 0 /0 0 0 0 0 /0 0 0 0 0 /1 1 1 1 1 /0 0 0 0 0 /"]
		],
		norinori : [
			[10031,"pzprv3/norinori/5/5/5/0 0 1 2 2 /1 1 1 2 2 /1 3 3 2 2 /3 3 3 3 3 /4 4 3 3 3 /# # . . . /. # . . . /. . . . . /. . . . . /. . . . . /"],
			[30061,"pzprv3/norinori/5/5/5/0 0 1 2 2 /1 1 1 2 2 /1 3 3 2 2 /3 3 3 3 3 /4 4 3 3 3 /# # + . # /+ + # # . /# . . . # /. . . . # /. . . . . /"],
			[10030,"pzprv3/norinori/5/5/5/0 0 1 2 2 /1 1 1 2 2 /1 3 3 2 2 /3 3 3 3 3 /4 4 3 3 3 /# # + + + /+ + # # + /# . . + . /+ + . . . /# # + . . /"],
			[30051,"pzprv3/norinori/5/5/5/0 0 1 2 2 /1 1 1 2 2 /1 3 3 2 2 /3 3 3 3 3 /4 4 3 3 3 /# # + + + /+ + # # + /# # + + . /+ + . . . /# # + . . /"],
			[30041,"pzprv3/norinori/5/5/5/0 0 1 2 2 /1 1 1 2 2 /1 3 3 2 2 /3 3 3 3 3 /4 4 3 3 3 /# # + + + /+ + + + + /+ + + + . /+ + . . . /# # + . . /"],
			[0,"pzprv3/norinori/5/5/5/0 0 1 2 2 /1 1 1 2 2 /1 3 3 2 2 /3 3 3 3 3 /4 4 3 3 3 /# # + + + /+ + # # + /# # + + # /+ + . . # /# # + . . /"]
		],
		numlin : [
			[40201,"pzprv3/numlin/5/5/1 . . . . /2 . . 3 . /. . . . . /. 1 . . 2 /. . . . 3 /0 0 0 0 /1 1 1 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 1 0 0 0 /0 1 0 0 0 /0 0 0 0 0 /"],
			[40301,"pzprv3/numlin/5/5/1 . . . . /2 . . 3 . /. . . . . /. 1 . . 2 /. . . . 3 /1 0 0 0 /1 1 1 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 1 0 0 0 /0 1 0 0 0 /0 1 0 0 0 /0 0 0 0 0 /"],
			[43303,"pzprv3/numlin/5/5/1 . . . . /2 . . 3 . /. . . . . /. 1 . . 2 /. . . . 3 /1 1 1 1 /1 1 1 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /1 0 0 0 1 /0 0 0 0 1 /0 0 0 0 1 /0 0 0 0 1 /"],
			[30029,"pzprv3/numlin/5/5/1 . . . . /2 . . 3 . /. . . . . /. 1 . . 2 /. . . . 3 /1 1 0 0 /0 0 0 0 /0 0 0 0 /0 0 1 1 /0 0 0 0 /0 0 1 0 0 /0 0 1 0 0 /0 0 1 0 0 /0 0 0 0 0 /"],
			[43103,"pzprv3/numlin/5/5/1 . . . . /2 . . 3 . /. . . . . /. 1 . . 2 /. . . . 3 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 1 1 /0 0 0 0 /0 0 1 0 1 /0 0 1 0 1 /0 0 1 0 1 /0 0 0 0 0 /"],
			[43401,"pzprv3/numlin/5/5/1 . . . . /2 . . 3 . /. . . . . /. 1 . . 2 /. . . . 3 /1 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 1 /0 1 0 0 0 /0 1 0 1 0 /0 0 0 1 0 /0 0 0 1 0 /"],
			[43203,"pzprv3/numlin/5/5/1 . . . . /2 . . 3 . /. . . . . /. 1 . . 2 /. . . . 3 /1 0 0 0 /0 0 0 0 /0 0 1 0 /0 0 0 0 /0 0 1 0 /0 1 0 0 0 /0 1 0 0 0 /0 1 1 1 0 /0 0 1 1 0 /"],
			[43503,"pzprv3/numlin/5/5/1 . . . . /2 . . 3 . /. . . . . /. 1 . . 2 /. . . . 3 /1 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 1 /0 1 0 0 0 /0 1 0 1 0 /0 1 0 1 0 /0 0 0 1 0 /"],
			[0,"pzprv3/numlin/5/5/1 . . . . /2 . . 3 . /. . . . . /. 1 . . 2 /. . . . 3 /1 -1 1 1 /0 -1 0 0 /0 -1 -1 0 /0 -1 -1 0 /1 1 -1 1 /0 1 1 0 1 /1 1 1 1 1 /1 1 1 1 1 /1 0 1 1 0 /"]
		],
		nuribou : [
			[10004,"pzprv3/nuribou/5/5/1 . 2 . . /. . . . 1 /. 4 . . . /. . . . . /. . . . 7 /. . . . . /# # # . . /. . # . . /. . # . . /. . . . . /"],
			[10005,"pzprv3/nuribou/5/5/1 . 2 . . /. . . . 1 /. 4 . . . /. . . . . /. . . . 7 /+ # + + # /# + # # + /. . + + # /. . . . . /. . . . . /"],
			[10014,"pzprv3/nuribou/5/5/1 . 2 . . /. . . . 1 /. 4 . . . /. . . . . /. . . . 7 /+ # + + # /# + # # + /# + + + # /. # . . . /. . # # . /"],
			[30009,"pzprv3/nuribou/5/5/1 . 2 . . /. . . . 1 /. 4 . . . /. . . . . /. . . . 7 /+ # + + # /# + # # + /# + + + # /. . . . . /. . . . . /"],
			[30019,"pzprv3/nuribou/5/5/1 . 2 . . /. . . . 1 /. 4 . . . /. . . . . /. . . . 7 /+ # + # . /+ # + # + /# + # . # /. . # . . /. . # . . /"],
			[0,"pzprv3/nuribou/5/5/1 . 2 . . /. . . . 1 /. 4 . . . /. . . . . /. . . . 7 /+ # + + # /# + # # + /# + + + # /+ # # # . /. . . . . /"]
		],
		nurikabe : [
			[10001,"pzprv3/nurikabe/5/5/. 5 . . . /. . 2 . . /# # . . . /# # 1 . . /. . . 3 . /"],
			[10014,"pzprv3/nurikabe/5/5/. 5 # # . /. # 2 . # /. # # # # /. # 1 . . /# . . 3 . /"],
			[10005,"pzprv3/nurikabe/5/5/. 5 # # # /. # 2 . # /. . # # # /. . 1 . . /# . . 3 . /"],
			[30009,"pzprv3/nurikabe/5/5/. 5 # # # /. # 2 . # /. # # # # /. . 1 . . /. . . 3 . /"],
			[30019,"pzprv3/nurikabe/5/5/. 5 # # # /. # 2 . # /. # # # # /. # 1 # . /. # # 3 . /"],
			[0,"pzprv3/nurikabe/5/5/+ 5 # # # /+ # 2 + # /+ # # # # /+ # 1 # . /# # # 3 . /"]
		],
		paintarea : [
			[30030,"pzprv3/paintarea/5/5/12/0 1 2 2 2 /0 3 2 2 4 /5 6 6 7 4 /5 8 9 10 4 /8 8 9 11 11 /. . . . . /. 4 . . . /. . . . . /. . . 1 . /. . . . . /. . + + + /. . # # . /. . . . . /. . . . . /. . . . . /"],
			[10005,"pzprv3/paintarea/5/5/13/0 1 2 2 2 /0 3 4 4 5 /6 7 7 8 5 /6 9 10 11 5 /9 9 10 12 12 /. . . . . /. 4 . . . /. . . . . /. . . 1 . /. . . . . /# # + + + /# + # # . /. # # . . /. . . . . /. . . . . /"],
			[10001,"pzprv3/paintarea/5/5/13/0 1 2 2 2 /0 3 4 4 5 /6 7 7 8 5 /6 9 10 11 5 /9 9 10 12 12 /. . . . . /. 4 . . . /. . . . . /. . . 1 . /. . . . . /# # + + + /# + # # . /# # # . . /# # . . . /# # . . . /"],
			[10027,"pzprv3/paintarea/5/5/13/0 1 2 2 2 /0 3 4 4 5 /6 7 7 8 5 /6 9 10 11 5 /9 9 10 12 12 /. . . . . /. 4 . . . /. . . . . /. . . 1 . /. . . . . /# # + + + /# + # # . /# # # . . /# + + . . /+ + + . . /"],
			[10002,"pzprv3/paintarea/5/5/13/0 1 2 2 2 /0 3 4 4 5 /6 7 7 8 5 /6 9 10 11 5 /9 9 10 12 12 /. . . . . /. 4 . . . /. . . . . /. . . 1 . /. . . . . /# # + + + /# + # # # /# # # . # /# + + . # /+ + + . . /"],
			[0,"pzprv3/paintarea/5/5/13/0 1 2 2 2 /0 3 4 4 5 /6 7 7 8 5 /6 9 10 11 5 /9 9 10 12 12 /. . . . . /. 4 . . . /. . . . . /. . . 1 . /. . . . . /# # + + + /# + # # + /# # # + + /# + # # + /+ + # + + /"]
		],
		pipelink : [
			[50121,"pzprv3/pipelink/5/5/circle/. . . . . /. a . . . /. . . e . /. . a . . /. . . . . /0 0 0 0 /0 0 0 0 /0 0 0 1 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 1 0 /0 0 0 1 0 /0 0 0 0 0 /"],
			[40201,"pzprv3/pipelink/5/5/circle/. . . . . /. a . . . /. . . e . /. . a . . /. . . . . /0 0 0 0 /0 0 0 0 /0 0 1 0 /0 0 1 1 /0 0 0 0 /0 0 0 0 0 /0 0 0 1 0 /0 0 1 0 0 /0 0 1 0 0 /"],
			[41101,"pzprv3/pipelink/5/5/circle/. . . . . /. a . . . /. . . e . /. . a . . /. . . . . /1 0 0 0 /1 1 0 0 /0 0 0 0 /0 1 1 0 /0 0 1 0 /1 1 0 0 0 /0 1 0 0 0 /0 0 1 0 0 /0 0 1 1 0 /"],
			[40421,"pzprv3/pipelink/5/5/circle/. . . . . /. a . . . /. . . e . /. . a . . /. . . . . /1 0 1 1 /1 1 1 0 /1 1 1 0 /0 0 1 0 /1 1 1 0 /1 1 1 0 1 /0 1 1 1 1 /1 1 1 0 1 /1 0 0 1 0 /"],
			[40201,"pzprv3/pipelink/5/5/circle/. . . . . /. a . . . /. . . e . /. . a . . /. . . . . /1 0 1 1 /1 1 1 0 /1 1 1 0 /0 1 1 0 /1 1 0 1 /1 1 1 0 1 /0 0 1 1 1 /1 0 1 0 1 /1 0 1 1 1 /"],
			[50151,"pzprv3/pipelink/5/5/circle/. . . . . /. a . . . /. . . e . /. . a . . /. . . . . /1 0 1 1 /1 1 1 0 /1 1 1 0 /0 1 1 1 /1 1 0 0 /1 1 1 0 1 /0 1 1 1 1 /1 1 1 0 1 /1 0 1 0 0 /"],
			[40101,"pzprv3/pipelink/5/5/circle/. . . . . /. a . . . /. . . e . /. . a . . /. . . . . /1 0 1 1 /1 1 1 0 /1 1 1 0 /0 1 1 0 /1 1 0 0 /1 1 1 0 1 /0 1 1 1 1 /1 1 1 0 1 /1 0 1 1 1 /"],
			[0,"pzprv3/pipelink/5/5/circle/. . . . . /. a . . . /. . . e . /. . a . . /. . . . . /1 -1 1 1 /1 1 1 -1 /1 1 1 -1 /-1 1 1 0 /1 1 0 1 /1 1 1 -1 1 /-1 1 1 1 1 /1 1 1 -1 1 /1 -1 1 1 1 /"]
		],
		pipelinkr : [
			[50121,"pzprv3/pipelinkr/5/5/circle/. . . . . /. a o . . /. o o o . /. . o f . /. . . . . /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 1 1 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 1 0 /"],
			[40201,"pzprv3/pipelinkr/5/5/circle/. . . . . /. a o . . /. o o o . /. . o f . /. . . . . /0 0 0 0 /1 1 0 0 /0 0 0 0 /0 1 1 0 /0 0 0 0 /0 1 0 0 0 /0 1 0 0 0 /0 1 0 0 0 /0 1 0 1 0 /"],
			[40502,"pzprv3/pipelinkr/5/5/circle/. . . . . /. a o . . /. o o o . /. . o f . /. . . . . /0 0 0 0 /1 1 0 0 /0 0 0 0 /1 1 1 0 /0 0 0 0 /0 1 0 0 0 /0 1 0 0 0 /0 1 0 0 0 /0 1 0 1 0 /"],
			[40602,"pzprv3/pipelinkr/5/5/circle/. . . . . /. a o . . /. o o o . /. . o f . /. . . . . /0 0 0 0 /1 1 0 0 /0 0 0 1 /0 1 1 -1 /0 0 0 1 /0 1 0 0 0 /0 1 0 1 0 /0 1 0 -1 1 /0 0 0 1 1 /"],
			[41101,"pzprv3/pipelinkr/5/5/circle/. . . . . /. a o . . /. o o o . /. . o f . /. . . . . /0 0 0 1 /1 1 1 1 /1 1 1 1 /0 1 1 -1 /0 1 0 1 /0 1 1 0 1 /0 1 1 -1 0 /0 1 1 -1 1 /0 0 1 1 1 /"],
			[40421,"pzprv3/pipelinkr/5/5/circle/. . . . . /. a o . . /. o o o . /. . o f . /. . . . . /0 0 1 1 /0 1 1 1 /1 1 1 1 /0 1 1 -1 /0 1 0 1 /0 0 1 0 1 /0 1 1 -1 0 /0 1 1 -1 1 /0 0 1 1 1 /"],
			[50151,"pzprv3/pipelinkr/5/5/circle/. . . . . /. a o . . /. o o o . /. . o f . /. . . . . /1 0 1 1 /1 1 1 1 /1 1 1 1 /0 1 1 -1 /0 1 0 1 /1 1 1 0 1 /0 1 1 -1 0 /0 1 1 -1 1 /0 0 1 1 1 /"],
			[40101,"pzprv3/pipelinkr/5/5/circle/. . . . . /. a o . . /. o o o . /. . o f . /. . . . . /1 0 1 1 /1 1 1 1 /1 1 1 1 /0 1 1 -1 /0 1 0 1 /1 1 1 0 1 /0 1 1 -1 0 /1 1 1 -1 1 /1 0 1 1 1 /"],
			[0,"pzprv3/pipelinkr/5/5/circle/. . . . . /. a o . . /. o o o . /. . o f . /. . . . . /1 0 1 1 /1 1 1 1 /1 1 1 1 /0 1 1 -1 /1 1 0 1 /1 1 1 0 1 /0 1 1 -1 0 /1 1 1 -1 1 /1 0 1 1 1 /"]
		],
		reflect : [
			[40201,"pzprv3/reflect/5/5/49 . . . . /. . . . . /. . . 2 . /. . + . . /. . . . 24 /0 0 0 0 /0 0 0 0 /0 1 1 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 1 0 /0 0 1 0 0 /0 0 1 0 0 /"],
			[40401,"pzprv3/reflect/5/5/49 . . . . /. . . . . /. . . 2 . /. . + . . /. . . . 24 /0 0 0 0 /0 0 0 0 /0 1 1 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 1 1 0 /0 0 1 0 0 /0 0 1 0 0 /"],
			[19111,"pzprv3/reflect/5/5/49 . . . . /. . . . . /. . . 2 . /. . + . . /. . . . 24 /0 0 0 0 /0 0 0 0 /0 0 1 0 /0 0 0 0 /0 0 1 1 /0 0 0 0 0 /0 0 0 1 0 /0 0 1 0 1 /0 0 1 0 1 /"],
			[19101,"pzprv3/reflect/5/5/49 . . . . /. . . . . /. . . 2 . /. . + . . /. . . . 24 /1 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /1 0 1 1 /1 0 0 0 0 /1 0 0 0 0 /1 0 1 0 0 /1 0 1 0 1 /"],
			[19121,"pzprv3/reflect/5/5/49 . . . . /. . . . . /. . . 2 . /. . + . . /. . . . 24 /1 0 0 0 /0 0 0 0 /0 0 1 0 /0 0 0 0 /1 0 1 1 /1 0 0 0 0 /1 0 0 1 0 /1 0 1 0 0 /1 0 1 0 1 /"],
			[40411,"pzprv3/reflect/5/5/49 . . . . /. . . . . /. . . 2 . /. . + . . /. . . . 24 /1 1 1 1 /0 0 0 0 /0 0 1 0 /0 0 0 0 /1 0 1 1 /1 0 0 0 1 /1 0 0 1 0 /1 0 1 0 0 /1 0 1 0 1 /"],
			[40101,"pzprv3/reflect/5/5/49 . . . . /. . . . . /. . . 2 . /. . . . . /. . . . 2-2 /1 1 1 1 /0 1 1 0 /0 1 1 0 /0 0 1 1 /1 0 1 1 /1 0 0 0 1 /1 1 0 1 0 /1 0 0 0 0 /1 0 1 0 1 /"],
			[41101,"pzprv3/reflect/5/5/49 . . . . /. . . . . /. . . 2 . /. . . . . /. . . . 2-2 /1 1 1 1 /0 1 1 0 /0 1 1 0 /0 0 0 0 /1 1 1 1 /1 0 0 0 1 /1 1 0 1 1 /1 0 0 0 1 /1 0 0 0 1 /"],
			[0,"pzprv3/reflect/5/5/49 . . . . /. . . . . /. . . 2 . /. . + . . /. . . . 24 /1 1 1 1 /0 0 -1 1 /0 -1 1 0 /-1 1 1 1 /1 0 1 1 /1 0 0 -1 1 /1 0 -1 1 0 /1 -1 1 0 0 /1 1 1 0 1 /"]
		],
		renban : [
			[30421,"pzprv3/renban/4/4/1 1 1 /1 1 1 /0 1 1 /0 1 1 /1 0 1 0 /0 0 0 0 /1 1 1 0 /1 . . . /. . . . /. . . 5 /. 2 . . /. 3 . . /2 . . . /. 3 . . /. . . . /"],
			[50171,"pzprv3/renban/4/4/1 1 1 /1 1 1 /0 1 1 /0 1 1 /1 0 1 0 /0 0 0 0 /1 1 1 0 /1 . . . /. . . . /. . . 5 /. 2 . . /. 3 . . /2 . . . /. 5 . . /4 . . . /"],
			[69811,"pzprv3/renban/4/4/1 1 1 /1 1 1 /0 1 1 /0 1 1 /1 0 1 0 /0 0 0 0 /1 1 1 0 /1 . . . /. . . . /. . . 5 /. 2 . . /. 3 7 . /2 4 8 . /6 5 9 . /3 . 7 . /"],
			[0,"pzprv3/renban/4/4/1 1 1 /1 1 1 /0 1 1 /0 1 1 /1 0 1 0 /0 0 0 0 /1 1 1 0 /1 . . . /. . . . /. . . 5 /. 2 . . /. 3 7 3 /2 4 8 4 /6 5 9 . /3 . 6 2 /"]
		],
		ringring : [
			[50102,"pzprv3/ringring/5/5/1 0 0 1 1 /0 0 0 0 0 /0 1 0 1 0 /0 0 0 1 0 /0 0 0 0 0 /0 1 0 0 /1 1 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 1 0 0 0 /1 1 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			[42101,"pzprv3/ringring/5/5/1 0 0 1 1 /0 0 0 0 0 /0 0 0 1 0 /0 0 0 1 0 /0 0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			[40201,"pzprv3/ringring/5/5/1 0 0 1 1 /0 0 0 0 0 /0 0 0 1 0 /0 0 0 1 0 /0 0 0 0 0 /0 1 0 0 /1 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 1 0 0 0 /1 1 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			[40101,"pzprv3/ringring/5/5/1 0 0 1 1 /0 0 0 0 0 /0 0 0 1 0 /0 0 0 1 0 /0 0 0 0 0 /0 1 0 0 /1 1 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 1 0 0 0 /1 1 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			[49501,"pzprv3/ringring/5/5/1 0 0 1 1 /0 0 0 0 0 /0 0 0 1 0 /0 0 0 1 0 /0 0 0 0 0 /0 1 0 0 /1 0 1 1 /0 0 0 0 /0 0 0 0 /1 1 1 1 /0 1 1 0 0 /1 0 0 0 1 /1 0 0 0 1 /1 0 -1 0 1 /"],
			[50311,"pzprv3/ringring/5/5/1 0 0 1 1 /0 0 0 0 0 /0 0 0 1 0 /0 0 0 1 0 /0 0 0 0 0 /0 1 0 0 /1 1 1 1 /0 1 0 0 /0 0 0 0 /1 1 1 1 /0 1 1 0 0 /1 1 1 0 1 /1 0 0 0 1 /1 0 -1 0 1 /"],
			[0,"pzprv3/ringring/5/5/1 0 0 1 1 /0 0 0 0 0 /0 0 0 1 0 /0 0 0 1 0 /0 0 0 0 0 /0 1 0 0 /1 1 1 1 /0 0 0 0 /0 1 0 0 /1 1 1 1 /0 1 1 0 0 /1 1 1 0 1 /1 1 1 0 1 /1 0 -1 0 1 /"]
		],
		ripple : [
			[30421,"pzprv3/ripple/4/4/0 1 0 /0 1 1 /0 1 1 /1 0 1 /1 1 0 1 /1 1 0 0 /1 0 1 0 /. . . . /. 1 4 . /. 3 2 . /. . . . /. . . . /. . . . /. . . . /. . 3 . /"],
			[69501,"pzprv3/ripple/4/4/0 1 0 /0 1 1 /0 1 1 /1 0 1 /1 1 0 1 /1 1 0 0 /1 0 1 0 /. . . . /. 1 4 . /. 3 2 . /. . . . /1 2 . . /2 . . . /4 . . 3 /1 2 1 . /"],
			[50171,"pzprv3/ripple/4/4/0 1 0 /0 1 1 /0 1 1 /1 0 1 /1 1 0 1 /1 1 0 0 /1 0 1 0 /. . . . /. 1 4 . /. 3 2 . /. . . . /1 2 . . /2 . . . /4 . . . /1 2 1 . /"],
			[0,"pzprv3/ripple/4/4/0 1 0 /0 1 1 /0 1 1 /1 0 1 /1 1 0 1 /1 1 0 0 /1 0 1 0 /. . . . /. 1 4 . /. 3 2 . /. . . . /1 2 3 1 /2 . . 2 /4 . . 1 /1 2 1 3 /"]
		],
		roma : [
			[31015,"pzprv3/roma/4/4/6/0 0 1 1 /0 2 2 1 /3 2 4 5 /3 3 5 5 /. . 2 . /1 2 . . /. . 5 3 /. 3 . . /. 1 . . /. . . . /. . . . /. . . . /"],
			[91401,"pzprv3/roma/4/4/6/0 0 1 1 /0 2 2 1 /3 2 4 5 /3 3 5 5 /. . 2 . /1 2 . . /. . 5 3 /. 3 . . /4 2 . 3 /. . 4 1 /4 . . . /1 . . . /"],
			[0,"pzprv3/roma/4/4/6/0 0 1 1 /0 2 2 1 /3 2 4 5 /3 3 5 5 /. . 2 . /1 2 . . /. . 5 3 /. 3 . . /4 2 . 3 /. . 3 1 /4 4 . . /1 . 4 1 /"]
		],
		sashigane : [
			[39501,"pzprv3/sashigane/5/5/4 . . . o /. . . . . /o3 . 2 . 1 /. . . . . /4 . . . o4 /0 0 1 0 /1 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 1 1 0 0 /1 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			[39511,"pzprv3/sashigane/5/5/4 . . . o /. . . . . /o3 . 2 . 1 /. . . . . /4 . . . o4 /1 0 0 0 /0 0 1 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 1 1 0 0 /1 1 1 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			[39521,"pzprv3/sashigane/5/5/4 . . . o /. . . . . /o3 . 2 . 1 /. . . . . /4 . . . o4 /-1 1 0 0 /0 1 1 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /1 0 0 1 1 /0 0 1 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			[30022,"pzprv3/sashigane/5/5/4 . . . o /. . . . . /o3 . 2 . 1 /. . . . . /4 . . . o4 /-1 0 0 -1 /0 0 0 1 /0 0 0 1 /0 0 0 1 /1 -1 -1 -1 /1 0 0 1 -1 /0 0 0 0 -1 /0 0 0 0 1 /0 1 1 1 -1 /"],
			[32101,"pzprv3/sashigane/5/5/4 . . . o /. . . . . /o3 . 2 . 1 /. . . . . /4 . . . o4 /-1 0 0 -1 /0 0 0 1 /-1 1 0 1 /1 0 0 1 /-1 1 -1 -1 /1 0 0 1 -1 /1 1 0 0 -1 /-1 1 1 0 1 /1 -1 1 1 -1 /"],
			[30039,"pzprv3/sashigane/5/5/4 . . . o /. . . . . /o3 . 2 . 1 /. . . . . /4 . . . o4 /-1 0 0 -1 /0 0 1 1 /-1 1 1 1 /1 1 0 1 /-1 1 -1 -1 /1 1 1 1 -1 /1 1 1 0 -1 /-1 1 -1 1 1 /1 -1 1 1 -1 /"],
			[0,"pzprv3/sashigane/5/5/4 . . . o /. . . . . /o3 . 2 . 1 /. . . . . /4 . . . o4 /-1 0 0 -1 /0 0 0 1 /-1 1 1 1 /1 1 0 1 /-1 1 -1 -1 /1 1 1 1 -1 /1 1 1 0 -1 /-1 1 -1 1 1 /1 -1 1 1 -1 /"]
		],
		shakashaka : [
			[10040,"pzprv3/shakashaka/6/6/2 . . . 1 . /. . . 3 . . /. . 4 . . . /3 . . . . . /. . . . . . /. . . 1 . . /. 5 4 . . . /5 . 3 . . . /2 3 . . . . /. . . . . . /. . . . . . /. 2 3 . 2 3 /"],
			[90901,"pzprv3/shakashaka/6/6/2 . . . 1 . /. . . 3 . . /. . 4 . . . /3 . . . . . /. . . . . . /. . . 1 . . /. 5 4 . . . /5 . 3 . . . /2 3 . . . . /. . . . . . /. . . . . . /. . . . 2 3 /"],
			[90901,"pzprv3/shakashaka/6/6/2 . . . 1 . /. . . 3 . 5 /. . 4 . . . /3 . . . . . /. . . . . . /. . . 5 . . /. 5 4 . . . /5 . 3 . . . /2 3 . . 5 4 /. 5 4 5 . 3 /5 . 3 2 . 4 /2 3 . . 2 3 /"],
			[90901,"pzprv3/shakashaka/6/6/2 . . . 1 . /. . . 3 . . /. . 4 . . . /3 . . . . . /. . . . . . /. . . 1 . . /. 5 4 . . . /5 . 3 . 5 4 /2 3 . 5 5 3 /. 5 4 2 3 . /5 . 3 . 5 4 /2 3 . . 2 3 /"],
			[10040,"pzprv3/shakashaka/6/6/2 . . . 1 . /. . . 3 . . /. . 4 . . . /3 . . . . . /. . . . . . /. . . 1 . . /. 5 4 . . . /5 . 3 . . . /2 3 . . 5 4 /. 5 4 5 . 3 /5 . 3 2 . 4 /2 3 . . 2 3 /"],
			[0,"pzprv3/shakashaka/6/6/2 . . . 1 . /. . . 3 . . /. . 4 . . . /3 . . . . . /. . . . . . /. . . 1 . . /. 5 4 + . + /5 . 3 . 5 4 /2 3 . 5 . 3 /. 5 4 2 3 . /5 . 3 + 5 4 /2 3 + . 2 3 /"]
		],
		shikaku : [
			[30004,"pzprv3/shikaku/6/6/. . . . 3 . /5 6 . . 6 . /. . . . . . /. . . . . . /. 6 . . 2 3 /. 5 . . . . /0 0 0 0 0 /0 1 0 1 0 /0 1 0 1 0 /0 1 0 1 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 1 1 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 1 1 0 0 /0 0 0 0 0 0 /"],
			[30012,"pzprv3/shikaku/6/6/. . . . 3 . /5 6 . . 6 . /. . . . . . /. . . . . . /. 6 . . 2 3 /. 5 . . . . /0 0 0 0 0 /1 0 0 0 0 /1 0 0 0 0 /1 0 0 0 0 /1 0 0 0 0 /0 -1 -1 -1 0 /0 0 0 0 0 0 /-1 0 0 0 0 0 /-1 0 0 0 0 0 /-1 0 0 0 0 0 /0 1 1 1 1 0 /"],
			[20011,"pzprv3/shikaku/6/6/. . . . 3 . /5 6 . . 6 . /. . . . . . /. . . . . . /. 6 . . 2 3 /. 5 . . . . /0 1 1 0 0 /1 0 1 0 0 /1 0 1 0 0 /1 -1 1 0 1 /1 -1 1 0 1 /0 -1 -1 -1 1 /0 1 0 1 1 1 /-1 0 0 0 0 0 /-1 1 1 1 1 1 /-1 -1 -1 0 0 0 /1 1 1 1 1 0 /"],
			[30021,"pzprv3/shikaku/6/6/. . . . 3 . /5 6 . . 6 . /. . . . . . /. . . . . . /. 6 . . 2 3 /. 5 . . . . /1 0 1 0 0 /1 0 1 0 0 /1 0 1 0 0 /1 -1 1 0 1 /1 -1 1 0 1 /0 -1 -1 -1 1 /0 0 0 1 1 1 /-1 1 1 0 0 0 /-1 0 0 1 1 1 /-1 -1 -1 0 0 0 /1 1 1 1 1 0 /"],
			[32101,"pzprv3/shikaku/6/6/. . . . 3 . /5 6 . . 6 . /. . . . . . /. . . . . . /. 6 . . 2 3 /. 5 . . . . /1 0 1 0 0 /1 0 1 0 0 /1 0 1 0 0 /1 -1 0 1 1 /1 -1 1 1 1 /0 -1 -1 -1 1 /0 0 0 1 1 1 /-1 0 0 0 0 0 /-1 1 1 1 1 1 /-1 -1 -1 0 0 0 /1 1 1 1 1 0 /"],
			[0,"pzprv3/shikaku/6/6/. . . . 3 . /5 6 . . 6 . /. . . . . . /. . . . . . /. 6 . . 2 3 /. 5 . . . . /1 -1 1 0 0 /1 0 1 0 0 /1 -1 1 0 0 /1 -1 0 1 1 /1 -1 0 1 1 /0 -1 -1 -1 1 /0 -1 -1 1 1 1 /-1 -1 -1 0 0 0 /-1 1 1 1 1 1 /-1 -1 -1 0 0 0 /1 1 1 1 1 0 /"]
		],
		shimaguni : [
			[30101,"pzprv3/shimaguni/6/6/8/0 0 0 1 2 3 /4 4 5 1 2 3 /4 4 5 1 2 2 /5 5 5 1 2 2 /6 6 6 6 6 6 /6 6 7 7 7 7 /3 . . . 3 . /2 . . . . . /. . . . . . /. . . . . . /4 . . . . . /. . 3 . . . /# # # . . . /# # . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /"],
			[30033,"pzprv3/shimaguni/6/6/8/0 0 0 1 2 3 /4 4 5 1 2 3 /4 4 5 1 2 2 /5 5 5 1 2 2 /6 6 6 6 6 6 /6 6 7 7 7 7 /3 . . . 3 . /2 . . . . . /. . . . . . /. . . . . . /4 . . . . . /. . 3 . . . /# # # + . . /+ + + . . . /# # + . . . /+ + # . . . /# # + # # # /# # . . . . /"],
			[30093,"pzprv3/shimaguni/6/6/8/0 0 0 1 2 3 /4 4 5 1 2 3 /4 4 5 1 2 2 /5 5 5 1 2 2 /6 6 6 6 6 6 /6 6 7 7 7 7 /3 . . . 3 . /2 . . . . . /. . . . . . /. . . . . . /4 . . . . . /. . 3 . . . /# # # + . . /+ + + . . . /# # + . . . /+ + # . . . /# # + + + + /# + . . . . /"],
			[30211,"pzprv3/shimaguni/6/6/8/0 0 0 1 2 3 /4 4 5 1 2 3 /4 4 5 1 2 2 /5 5 5 1 2 2 /6 6 6 6 6 6 /6 6 7 7 7 7 /3 . . . 3 . /2 . . . . . /. . . . . . /. . . . . . /4 . . . . . /. . 3 . . . /# # # + . . /+ + + . . . /# # + # . # /+ + # + # # /# # + + + + /# # + # # # /"],
			[30042,"pzprv3/shimaguni/6/6/8/0 0 0 1 2 3 /4 4 5 1 2 3 /4 4 5 1 2 2 /5 5 5 1 2 2 /6 6 6 6 6 6 /6 6 7 7 7 7 /3 . . . 3 . /2 . . . . . /. . . . . . /. . . . . . /4 . . . . . /. . 3 . . . /# # # + . . /+ + + # . . /# # + # . # /+ + # + # # /# # + + + + /# # + # # # /"],
			[0,"pzprv3/shimaguni/6/6/8/0 0 0 1 2 3 /4 4 5 1 2 3 /4 4 5 1 2 2 /5 5 5 1 2 2 /6 6 6 6 6 6 /6 6 7 7 7 7 /3 . . . 3 . /2 . . . . . /. . . . . . /. . . . . . /4 . . . . . /. . 3 . . . /# # # + . # /+ + + # + + /# # + # + # /+ + # + # # /# # + + + + /# # + # # # /"]
		],
		shugaku : [
			[91301,"pzprv3/shugaku/5/5/. . . . . /. . 5 . . /. . . . . /c 4 . 2 . /g . . . . /"],
			[10001,"pzprv3/shugaku/5/5/. . . . . /. . 5 # # /. a . # # /a 4 a 2 . /j d . . . /"],
			[10042,"pzprv3/shugaku/5/5/. - - - . /. - 5 - # /. a - # # /a 4 a 2 a /j d . a . /"],
			[91311,"pzprv3/shugaku/5/5/. . . . . /. . 5 . . /h a . . . /b 4 a 2 . /j d . . . /"],
			[91321,"pzprv3/shugaku/5/5/. . . . . /. h 5 . . /h b h . . /b 4 b 2 . /j d # # # /"],
			[10006,"pzprv3/shugaku/5/5/# # # # . /# h 5 . . /h b h . . /b 4 b 2 . /j d # # # /"],
			[10043,"pzprv3/shugaku/5/5/# # # # . /# h 5 # . /h b h # # /b 4 b 2 # /j d # # # /"],
			[50211,"pzprv3/shugaku/5/5/# # # # # /# h . h # /h b h b # /b 4 b 2 # /j d # # # /"],
			[0,"pzprv3/shugaku/5/5/# # # # # /# h 5 h # /h b h b # /b 4 b 2 # /j d # # # /"]
		],
		shwolf : [
			[32201,"pzprv3/shwolf/5/5/1 . 2 2 2 /. 1 1 . 1 /. 2 . 2 . /1 . 1 2 . /1 1 2 . 1 /. . . . . . /. 1 . . 1 . /. . . . . . /. . . . . . /. 1 . . 1 . /. . . . . . /0 0 0 0 /1 0 0 0 /1 0 0 0 /1 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /1 1 1 1 0 /"],
			[32601,"pzprv3/shwolf/5/5/1 . 2 2 2 /. 1 1 . 1 /. 2 . 2 . /1 . 1 2 . /1 1 2 . 1 /. . . . . . /. 1 . . 1 . /. . . . . . /. . . . . . /. 1 . . 1 . /. . . . . . /0 0 0 0 /1 0 0 0 /1 0 0 0 /1 0 0 0 /1 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /1 1 1 1 0 /"],
			[32521,"pzprv3/shwolf/5/5/1 . 2 2 2 /. 1 1 . 1 /. 2 . 2 . /1 . 1 2 . /1 1 2 . 1 /. . . . . . /. 1 . . 1 . /. . . . . . /. . . . . . /. 1 . . 1 . /. . . . . . /0 0 0 0 /1 0 0 0 /1 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 1 1 1 1 /0 0 0 0 0 /"],
			[32701,"pzprv3/shwolf/5/5/1 . 2 2 2 /. 1 1 . 1 /. 2 . 2 . /1 . 1 2 . /1 1 2 . 1 /. . . . . . /. 1 . . 1 . /. . . . . . /. . . . . . /. 1 . . 1 . /. . . . . . /0 0 0 0 /1 0 0 0 /1 0 0 0 /1 0 0 0 /0 0 0 0 /0 1 1 1 0 /0 0 0 0 0 /0 0 0 0 0 /0 1 1 1 0 /"],
			[30008,"pzprv3/shwolf/5/5/1 . 2 2 2 /. 1 1 . 1 /. 2 . 2 . /1 . 1 2 . /1 1 2 . 1 /. . . . . . /. 1 . . 1 . /. . . . . . /. . . . . . /. 1 . . 1 . /. . . . . . /0 0 1 0 /1 0 1 1 /1 0 1 1 /1 0 1 1 /1 0 1 1 /0 1 1 1 0 /1 1 1 1 1 /0 0 0 0 0 /0 0 0 0 0 /"],
			[30027,"pzprv3/shwolf/5/5/1 . 2 2 2 /. 1 1 . 1 /. 2 . 2 . /1 . 1 2 . /1 1 2 . 1 /. . . . . . /. 1 . . 1 . /. . . . . . /. . . . . . /. 1 . . 1 . /. . . . . . /0 0 1 0 /1 0 1 0 /1 0 1 0 /1 0 1 0 /1 0 1 1 /0 1 1 1 0 /1 1 1 1 1 /0 0 0 0 0 /0 0 0 0 0 /"],
			[32101,"pzprv3/shwolf/5/5/1 . 2 2 2 /. 1 1 . 1 /. . . 2 . /1 . 1 2 . /1 1 2 . 1 /. . . . . . /. 1 . . 1 . /. . . . . . /. . . . . . /. 1 . . 1 . /. . . . . . /0 1 1 0 /0 1 1 0 /0 1 1 0 /0 1 1 0 /0 1 1 0 /0 1 1 1 1 /1 1 1 1 1 /0 0 0 0 0 /0 1 1 1 1 /"],
			[0,"pzprv3/shwolf/5/5/1 . 2 2 2 /. 1 1 . 1 /. 2 . 2 . /1 . 1 2 . /1 1 2 . 1 /. . . . . . /. 1 . . 1 . /. . . . . . /. . . . . . /. 1 . . 1 . /. . . . . . /0 1 1 0 /1 1 1 0 /1 1 1 -1 /1 1 1 -1 /-1 1 1 -1 /0 1 1 1 1 /1 1 1 1 1 /-1 0 -1 -1 -1 /-1 1 1 1 1 /"]
		],
		slalom : [
			[50102,"pzprv3/slalom/6/6/. . . . . . /w # . # w4 # /w # . # w # /. . . . . . /. # # w1 # . /. . . o . . /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 1 0 0 0 0 /0 1 0 0 0 0 /"],
			[40301,"pzprv3/slalom/6/6/. . . . . . /w # . # w4 # /w # . . w # /. . . . . . /. # # w1 # . /. . . o . . /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 1 1 1 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 1 0 0 /0 0 0 1 0 0 /0 0 0 1 0 0 /"],
			[40201,"pzprv3/slalom/6/6/. . . . . . /w # . # w4 # /w # . . w # /. . . . . . /. # # w1 # . /. . . o . . /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 1 1 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 1 0 0 /0 0 0 1 0 0 /0 0 0 1 0 0 /"],
			[49301,"pzprv3/slalom/6/6/. . . . . . /w # . # w4 # /w w w # w # /. . . . . . /. # # w1 # . /. . . o . . /1 1 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /1 1 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /1 0 1 0 0 0 /1 0 1 0 0 0 /1 0 1 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /"],
			[49311,"pzprv3.1/slalom/6/6/. . . . . . /- # . 4 - 4 /- # . # - # /. . . . . . /. # 1 - 1 . /. . . o . . /1 1 1 1 0 /0 0 0 0 0 /0 0 0 0 0 /1 1 1 0 1 /0 0 0 0 0 /-1 -1 -1 1 1 /1 0 -1 0 1 0 /1 0 -1 0 1 0 /1 0 -1 0 1 0 /-1 0 0 0 0 1 /-1 0 0 0 0 1 /"],
			[49321,"pzprv3/slalom/6/6/. . . . . . /w # . # w4 # /w # . # w # /. . . . . . /. # # w1 # . /. . . o . . /1 1 1 1 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 1 0 /0 0 0 0 0 /1 1 1 0 0 /1 0 0 0 1 0 /1 0 0 0 1 0 /1 0 0 0 1 0 /1 0 0 1 0 0 /1 0 0 1 0 0 /"],
			[40101,"pzprv3/slalom/6/6/. . . . . . /w # . # w4 # /w # . # w # /. . . . . . /. # # w1 # . /. . . o . . /1 1 1 1 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /1 1 1 0 0 /1 0 0 0 1 0 /1 0 0 0 1 0 /1 0 0 0 1 0 /0 0 0 1 0 0 /0 0 0 1 0 0 /"],
			[41101,"pzprv3/slalom/6/6/. . . . . . /w # . # w4 # /w # . # w # /. . . . . . /. # # w1 # . /. . . o . . /1 1 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /1 1 0 1 1 /0 0 0 0 0 /0 0 0 1 1 /1 0 1 0 0 0 /1 0 1 0 0 0 /1 0 1 0 0 0 /0 0 0 1 0 1 /0 0 0 1 0 1 /"],
			[49331,"pzprv3/slalom/6/6/. . . . . . /w # . # w4 # /w # . # w # /. . . . . . /. # # w1 # . /. . . o . . /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /1 1 1 1 1 /0 0 0 0 0 /1 1 1 1 1 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /1 0 0 0 0 1 /1 0 0 0 0 1 /"],
			[0,"pzprv3.1/slalom/6/6/. . . . . . /- # . 4 - 4 /- # . # - # /. . . . . . /. # 1 - 1 . /. . . o . . /1 1 1 1 0 /0 0 0 0 0 /0 0 0 0 0 /1 1 1 0 1 /0 0 0 0 0 /-1 -1 -1 1 1 /1 0 -1 0 1 0 /1 0 -1 0 1 0 /1 0 -1 0 1 0 /-1 0 0 1 0 1 /-1 0 0 1 0 1 /"]
		],
		slither : [
			[40201,"pzprv3/slither/5/5/2 . . 1 . /. 2 . . 1 /. . 2 . . /3 . . 3 . /. 0 . . 3 /1 0 0 0 0 0 /1 1 0 0 0 0 /1 0 0 0 0 0 /1 0 0 0 0 0 /1 0 0 0 0 0 /1 1 0 0 0 /0 1 0 0 0 /0 0 0 0 0 /1 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			[40301,"pzprv3/slither/5/5/2 . . 1 . /. 2 . . 1 /. . 2 . . /3 . . 3 . /. 0 . . 3 /1 0 0 0 0 0 /1 1 0 1 0 0 /1 1 1 0 1 0 /1 1 1 0 1 0 /0 0 0 0 1 0 /1 1 0 0 0 /0 1 1 0 0 /0 0 1 0 0 /0 0 0 0 0 /1 0 1 1 1 /0 0 0 0 0 /"],
			[49101,"pzprv3/slither/5/5/2 . . 1 . /. 2 . . 1 /. . 2 . . /3 . . 3 . /. 0 . . 3 /1 0 0 0 0 0 /1 1 0 1 0 0 /1 1 1 0 0 0 /1 1 1 0 0 0 /0 0 0 0 0 0 /1 1 0 0 0 /0 1 1 0 0 /0 0 1 0 0 /0 0 0 0 0 /1 0 1 1 0 /0 0 0 0 0 /"],
			[41101,"pzprv3/slither/5/5/2 . . 0 . /. 2 . . 1 /. . 2 . . /3 . . 3 . /. 0 . . 3 /1 0 1 0 0 0 /1 1 0 0 0 0 /1 1 1 0 0 1 /1 1 1 1 1 1 /0 0 0 0 1 1 /1 1 0 0 0 /0 1 0 0 0 /0 0 1 1 1 /0 0 0 1 0 /1 0 1 0 0 /0 0 0 0 1 /"],
			[40101,"pzprv3/slither/5/5/2 . . 1 . /. 2 . . 1 /. . 2 . . /3 . . 3 . /. 0 . . 3 /1 0 0 0 0 0 /1 1 0 1 0 0 /1 1 1 0 0 1 /1 1 1 1 1 1 /0 0 0 0 1 1 /1 1 1 1 0 /0 1 1 0 0 /0 0 1 0 1 /0 0 0 1 0 /1 0 1 0 0 /0 0 0 0 1 /"],
			[0,"pzprv3/slither/5/5/2 . . 1 . /. 2 . . 1 /. . 2 . . /3 . . 3 . /. 0 . . 3 /1 -1 0 -1 -1 1 /1 1 -1 1 -1 1 /1 1 1 0 0 1 /1 1 1 1 1 1 /-1 -1 -1 0 1 1 /1 1 1 1 1 /-1 1 1 -1 -1 /0 -1 1 0 0 /0 0 0 1 0 /1 -1 1 -1 0 /-1 0 -1 0 1 /"]
		],
		snakes : [
			[31009,"pzprv3/snakes/5/5/. 2,1 . . . /. . . . 2,3 /. . 2,0 . . /4,5 . . . . /. . . 4,1 . /. . . . . /. 1 . . . /. . . . . /. . . . . /. . . . . /"],
			[31010,"pzprv3/snakes/5/5/. 2,1 . . . /. . . . 2,3 /. . 2,0 . . /4,5 . . . . /. . . 4,1 . /. . . . . /. 1 2 3 . /. . . 2 . /. . . 1 . /. . . . . /"],
			[30231,"pzprv3/snakes/5/5/. 2,1 . . . /. . . . 2,3 /. . 2,0 . . /4,5 . . . . /. . . 4,1 . /. . 3 2 1 /2 1 4 5 . /3 4 . . . /. 5 + . . /+ + + . . /"],
			[50511,"pzprv3/snakes/5/5/. 2,1 . . . /. . . . 2,3 /. . 2,0 . . /4,5 . . . . /. . . 4,1 . /. . . . . /2 1 + . . /3 4 + 4 5 /. 5 + 3 2 /+ + + . 1 /"],
			[91101,"pzprv3/snakes/5/5/. 2,1 . . . /. . . . 2,3 /. . 2,0 . . /4,5 . . . . /. . . 4,1 . /. . . . . /2 1 + 5 . /3 4 + 4 3 /. 5 + . 2 /+ + + . 1 /"],
			[0,"pzprv3/snakes/5/5/. 2,1 . . . /. . . . 2,3 /. . 2,0 . . /4,5 . . . . /. . . 4,1 . /. . . . . /2 1 + . . /3 4 + 4 3 /. 5 + 5 2 /+ + + . 1 /"]
		],
		sudoku : [
			[30422,"pzprv3/sudoku/4/. 1 . . /. . . 2 /3 . . . /. . 3 . /. . . . /1 . . . /. . . . /. . . . /"],
			[10037,"pzprv3/sudoku/4/. 1 . . /. . . 2 /3 . . . /. . 3 . /. . . . /. . . . /. . . . /. 1 . . /"],
			[50171,"pzprv3/sudoku/4/. 1 . . /. . . 2 /3 . . . /. . 3 . /2 . . . /. . . . /. 4 2 . /1 2 . . /"],
			[0,"pzprv3/sudoku/4/. 1 . . /. . . 2 /3 . . . /. . 3 . /2 . 4 3 /4 3 1 . /. 4 2 1 /1 2 . 4 /"]
		],
		sukoro : [
			[60101,"pzprv3/sukoro/5/5/2 . 2 . . /. 4 . 2 . /. . . . . /. 2 . 4 . /. . 2 . 2 /. 3 . . . /3 . 3 . . /2 3 . . . /. . 3 . . /. 2 . . . /"],
			[69201,"pzprv3/sukoro/5/5/2 . 2 . . /. 4 . 2 . /. . . . . /. 2 . 4 . /. . 2 . 2 /. 3 . . . /3 . 3 . . /2 3 . . . /. . 3 . . /. . . . . /"],
			[10009,"pzprv3/sukoro/5/5/. . 1 . . /. 1 . . . /. . . . . /. 2 . . . /. . 2 . . /1 3 . . . /. . . . . /. . 1 . . /. . 4 1 . /1 3 . . . /"],
			[0,"pzprv3/sukoro/5/5/2 . 2 . . /. 4 . 2 . /. . . . . /. 2 . 4 . /. . 2 . 2 /. 3 . - - /3 . 3 . - /2 3 - 3 2 /- . 3 . 3 /. - . 3 . /"]
		],
		sukororoom : [
			[30421,"pzprv3/sukororoom/5/5/0 0 1 0 /0 1 1 1 /1 1 1 0 /0 1 1 0 /1 0 1 1 /1 1 1 0 1 /1 0 1 1 1 /0 1 1 1 1 /1 1 0 0 1 /. . 3 . . /. . . . . /. . 2 . . /. . . . . /. . 3 . . /3 . . . . /. . . . . /. . . . . /. . . . . /. . . . . /"],
			[31003,"pzprv3/sukororoom/5/5/0 0 1 0 /0 1 1 1 /1 1 1 0 /0 1 1 0 /1 0 1 1 /1 1 1 0 1 /1 0 1 1 1 /0 1 1 1 1 /1 1 0 0 1 /. . 3 . . /. . . . . /. . 2 . . /. . . . . /. . 3 . . /. . . . . /. . . . . /. . . . . /. . . . . /. . . . . /"],
			[69201,"pzprv3/sukororoom/5/5/0 0 1 0 /0 1 1 1 /1 1 1 0 /0 1 1 0 /1 0 1 1 /1 1 1 0 1 /1 0 1 1 1 /0 1 1 1 1 /1 1 0 0 1 /. . 3 . . /. . . . . /. . 2 . . /. . . . . /. . 3 . . /1 4 . . . /. . . . . /. . . . . /. . + . . /. + . . . /"],
			[10009,"pzprv3/sukororoom/5/5/0 0 1 0 /0 1 1 1 /1 1 1 0 /0 1 1 0 /1 0 1 1 /1 1 1 0 1 /1 0 1 1 1 /0 1 1 1 1 /1 1 0 0 1 /. . 3 . . /. . . . . /. . . . . /. . . . . /. . 3 . . /1 2 . + + /- - + + . /. - . . . /. . + + + /. + . + . /"],
			[50181,"pzprv3/sukororoom/5/5/0 0 1 0 /0 1 1 1 /1 1 1 0 /0 1 1 0 /1 0 1 1 /1 1 1 0 1 /1 0 1 1 1 /0 1 1 1 1 /1 1 0 0 1 /. . 3 . . /. . . . . /. . 2 . . /. . . . . /. . 3 . . /1 2 . + + /- - + + . /. - . . . /. . + + + /. + . + . /"],
			[0,"pzprv3/sukororoom/5/5/0 0 1 0 /0 1 1 1 /1 1 1 0 /0 1 1 0 /1 0 1 1 /1 1 1 0 1 /1 0 1 1 1 /0 1 1 1 1 /1 1 0 0 1 /. . 3 . . /. . . . . /. . 2 . . /. . . . . /. . 3 . . /1 2 . 3 1 /- - 3 2 - /1 - . - - /2 3 4 3 1 /- 2 . 2 - /"]
		],
		tasquare : [
			[10016,"pzprv3/tasquare/6/6/1 # - . . . /4 # # . . 1 /. . . 3 . . /. . 5 . . . /5 . . . . - /. . . 2 . 1 /"],
			[10007,"pzprv3/tasquare/6/6/1 . - # . . /4 . # . . 1 /. # . 3 . . /# . 5 . . . /5 . . . . - /. . . 2 . 1 /"],
			[10022,"pzprv3/tasquare/6/6/1 . - . . . /4 . . . . 1 /. . . 3 . . /. . 5 . . . /5 . . . . - /. . . 2 . 1 /"],
			[10023,"pzprv3/tasquare/6/6/1 # - . . # /4 . . # . 1 /# # . 3 # . /# # 5 # . . /5 . . . . - /# . # 2 # 1 /"],
			[0,"pzprv3/tasquare/6/6/1 # - + + # /4 + + # + 1 /# # + 3 # + /# # 5 # + # /5 . + + + - /# . # 2 # 1 /"]
		],
		tatamibari : [
			[32301,"pzprv3/tatamibari/5/5/. . . . . /. . c . a /a . . . b /. c a . . /a c . c . /0 0 0 0 /0 0 0 0 /0 0 0 0 /1 1 0 0 /1 1 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 1 0 0 0 /1 1 0 0 0 /"],
			[30006,"pzprv3/tatamibari/5/5/. . . . . /. . c . a /a . . . b /. c a . . /a c . c . /1 1 0 0 /1 1 0 0 /1 1 0 0 /1 1 0 0 /1 1 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 1 0 0 0 /0 1 0 0 0 /"],
			[33101,"pzprv3/tatamibari/5/5/. . . . . /. . c . a /a . . . b /. c a . . /a c . c . /1 0 0 1 /1 0 0 1 /0 0 0 0 /1 1 0 0 /1 1 0 0 /0 0 0 0 0 /0 1 1 1 0 /0 1 0 0 0 /0 1 0 0 0 /"],
			[33111,"pzprv3/tatamibari/5/5/. . . . . /. . c . a /a . . . b /. c a . . /a c . c . /0 0 0 0 /0 0 0 0 /0 0 0 1 /1 1 0 1 /1 1 0 1 /0 0 0 0 0 /0 0 0 0 1 /0 1 0 0 0 /0 1 0 0 0 /"],
			[33121,"pzprv3/tatamibari/5/5/. . . . . /. . c . a /a . . . b /. c a . . /a c . c . /0 0 1 0 /0 0 1 0 /0 0 0 0 /1 1 0 0 /1 1 0 0 /0 0 0 0 0 /0 0 0 1 1 /0 1 0 0 0 /0 1 0 0 0 /"],
			[30014,"pzprv3/tatamibari/5/5/. . . . . /. . c . a /a . . . b /. c a . . /a c . c . /0 0 0 0 /0 0 0 0 /0 0 0 0 /1 1 0 0 /1 1 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 1 0 0 0 /0 1 0 0 0 /"],
			[20012,"pzprv3/tatamibari/5/5/. . . . . /. . c . a /a . . . b /. c a . . /a c . c . /0 1 0 1 /0 1 0 1 /0 1 1 0 /1 1 1 1 /1 1 1 0 /0 0 0 0 0 /0 0 1 1 1 /1 1 0 1 0 /0 1 0 0 1 /"],
			[32101,"pzprv3/tatamibari/5/5/. . . . . /. . c . a /a . . . b /. c a . . /a c . c . /0 1 0 1 /0 1 0 1 /0 1 1 0 /1 1 1 1 /1 1 1 0 /0 0 0 0 0 /0 0 1 1 1 /1 1 0 1 1 /0 1 0 0 0 /"],
			[0,"pzprv3/tatamibari/5/5/. . . . . /. . c . a /a . . . b /. c a . . /a c . c . /-1 1 0 1 /0 1 0 1 /-1 1 1 0 /1 1 1 0 /1 1 1 0 /-1 -1 0 0 0 /-1 -1 1 1 1 /1 1 -1 1 1 /0 1 -1 0 0 /"]
		],
		tateyoko : [
			[90601,"pzprv3/tateyoko/5/5/. . 3 . . /. e . e 2 /. . 5 . . /2 a . b . /. . 3 . . /0 0 0 0 0 /2 . 2 . 2 /0 0 0 0 0 /0 . 0 . 0 /0 0 0 0 0 /"],
			[30018,"pzprv3/tateyoko/5/5/. . 3 . . /. e . e 2 /. . 5 . . /2 a . b . /. . 3 . . /0 0 1 0 0 /0 . 1 . 0 /0 0 1 0 0 /0 . 1 . 0 /0 0 1 0 0 /"],
			[30024,"pzprv3/tateyoko/5/5/. . 3 . . /. e . e 2 /. . 5 . . /2 a . b . /. . 3 . . /0 0 0 0 0 /0 . 0 . 0 /0 2 2 2 2 /0 . 0 . 0 /0 0 0 0 0 /"],
			[90611,"pzprv3/tateyoko/5/5/. . 3 . . /. e . e 2 /. . 5 . . /2 a . b . /. . 3 . . /0 0 0 0 0 /0 . 0 . 0 /2 2 2 2 2 /0 . 0 . 0 /0 0 0 0 0 /"],
			[50141,"pzprv3/tateyoko/5/5/. . 3 . . /. e . e 2 /. . 5 . . /2 a . b . /. . 3 . . /1 2 2 2 1 /1 . 1 . 1 /2 2 2 2 2 /1 . 2 . 2 /1 2 2 2 0 /"],
			[0,"pzprv3/tateyoko/5/5/. . 3 . . /. e . e 2 /. . 5 . . /2 a . b . /. . 3 . . /1 2 2 2 1 /1 . 1 . 1 /2 2 2 2 2 /1 . 2 . 2 /1 2 2 2 1 /"]
		],
		tawa : [
			[10024,"pzprv3/tawa/5/5/0/. 2 . . 2 /. . 3 . /. . . . . /. 5 . . /2 . . . 2 /"],
			[90021,"pzprv3/tawa/5/5/0/. 2 . # 2 /. . 3 # /. . . . . /. 5 . # /2 . . # 2 /"],
			[90011,"pzprv3/tawa/5/5/0/. 2 . # 2 /. . 3 # /# # # # . /. 5 . # /2 . . # 2 /"],
			[0,"pzprv3/tawa/5/5/0/# 2 + # 2 /# + 3 # /+ # # + # /# 5 # # /2 # + # 2 /"]
		],
		tentaisho : [
			[39201,"pzprv3/tentaisho/5/5/1...2...1/........./2....1..2/........./.1...2..1/........./......1../..2....../2.....2../1 0 0 0 /1 0 0 0 /1 0 0 0 /1 0 0 0 /1 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			[39211,"pzprv3/tentaisho/5/5/1...2...1/........./2....1..2/........./.1...2..1/........./......1../..2....../2.....2../1 1 0 0 /1 1 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 1 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			[39221,"pzprv3/tentaisho/5/5/1...2...1/........./2....1..2/........./.1...2..1/........./......1../..2....../2.....2../1 0 0 0 /1 1 0 0 /0 1 0 0 /0 0 0 0 /0 0 0 0 /1 1 0 0 0 /1 0 0 0 0 /1 1 0 0 0 /0 0 0 0 0 /1 0 0 0 0 /2 1 0 0 0 /1 1 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			[39231,"pzprv3/tentaisho/5/5/1...2...1/........./2....1..2/........./.1...2..1/........./......1../..2....../2.....2../1 0 0 0 /1 1 0 0 /0 1 0 0 /1 1 0 0 /1 1 0 0 /1 1 0 0 0 /1 0 0 0 0 /0 1 0 0 0 /1 0 0 0 0 /1 0 0 0 0 /2 1 0 0 0 /1 1 0 0 0 /1 2 0 0 0 /2 2 0 0 0 /"],
			[0,"pzprv3/tentaisho/5/5/1...2...1/........./2....1..2/........./.1...2..1/........./......1../..2....../2.....2../1 0 0 1 /1 1 0 1 /0 1 0 1 /1 1 0 0 /1 1 0 0 /1 1 1 1 1 /1 0 1 1 1 /0 1 1 1 1 /1 0 1 1 1 /1 2 2 2 1 /2 1 1 1 2 /1 1 2 2 1 /1 2 1 1 1 /2 2 2 2 2 /"]
		],
		tilepaint : [
			[30030,"pzprv3/tilepaint/6/6/19/0 1 1 2 3 3 /4 4 1 2 3 5 /6 7 1 8 8 9 /6 10 1 11 11 9 /12 12 13 14 11 15 /16 16 16 17 17 18 /0 2 3 4 2 3 2 /2 . . . . . . /4 . . . . . . /3 . . . . . . /3 . . . . . . /3 . . . . . . /1 . . . . . . /. # # . . . /. . # . . . /. . + . . . /. . + . . . /. . . . . . /. . . . . . /"],
			[10029,"pzprv3/tilepaint/6/6/20/0 1 1 2 3 3 /4 4 1 2 3 5 /6 7 8 9 9 10 /6 11 8 12 12 10 /13 13 14 15 12 16 /17 17 17 18 18 19 /0 2 3 4 2 3 2 /2 . . . . . . /4 . . . . . . /3 . . . . . . /3 . . . . . . /3 . . . . . . /1 . . . . . . /. # # . . . /. . # . . . /. . + . . . /. . + . . . /. . . . . . /. . . . . . /"],
			[0,"pzprv3/tilepaint/6/6/20/0 1 1 2 3 3 /4 4 1 2 3 5 /6 7 8 9 9 10 /6 11 8 12 12 10 /13 13 14 15 12 16 /17 17 17 18 18 19 /0 2 3 4 2 3 2 /2 . . . . . . /4 . . . . . . /3 . . . . . . /3 . . . . . . /3 . . . . . . /1 . . . . . . /+ # # + + + /# # # + + # /+ + # # # + /+ + # # # + /# # + + # + /+ + + + + # /"]
		],
		toichika : [
			[31016,"pzprv3/toichika/4/4/6/0 1 1 2 /3 1 2 2 /3 3 4 5 /3 4 4 4 /4 . . . /. . . . /. . . . /. . . . /. . . . /2 . . . /. . . . /4 . . . /"],
			[91501,"pzprv3/toichika/4/4/6/0 1 1 2 /3 1 2 2 /3 3 4 5 /3 4 4 4 /4 . . . /. . . . /. . . . /. . . . /. + 3 . /. + . . /. . . . /. . . . /"],
			[91511,"pzprv3/toichika/4/4/6/0 1 1 2 /3 1 2 2 /3 3 4 5 /3 4 4 4 /4 . . . /. . . . /. . . . /. . . . /. + + 3 /. 2 + + /. . . . /. . . . /"],
			[31017,"pzprv3/toichika/4/4/6/0 1 1 2 /3 1 2 2 /3 3 4 5 /3 4 4 4 /4 . . . /. . . . /. . . . /. . . . /. + + 3 /. 2 + + /. + . . /. 1 . . /"],
			[0,"pzprv3/toichika/4/4/6/0 1 1 2 /3 1 2 2 /3 3 4 5 /3 4 4 4 /4 . . . /. . . . /. . . . /. . . . /. + + 3 /+ 2 + + /4 + + 3 /+ 1 + + /"]
		],
		triplace : [
			[31001,"pzprv3/triplace/5/5/0 -1 0 -1 1 -1 /-1 -1,2 . . . . /-1 . . . -1,-1 . /-1 . . . . . /1 . -1,1 . . . /1 . . . . -1,-1 /0 0 0 0 /1 0 0 0 /1 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /1 0 0 0 0 /0 0 0 0 0 /. . . . . /. . . . . /. . . . . /. . . . . /. . . . . /"],
			[10034,"pzprv3/triplace/5/5/0 -1 0 -1 1 -1 /-1 -1,2 . . . . /-1 . . . -1,-1 . /-1 . . . . . /1 . -1,1 . . . /1 . . . . -1,-1 /0 0 0 0 /1 0 0 0 /1 0 0 0 /0 0 0 0 /-1 -1 1 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 1 0 /1 0 1 -1 0 /. - . . . /+ - . . . /+ - . . . /+ . . - . /+ + + - . /"],
			[31002,"pzprv3/triplace/5/5/0 -1 0 -1 1 -1 /-1 -1,2 . . . . /-1 . . . -1,-1 . /-1 . . . . . /1 . -1,1 . . . /1 . . . . -1,-1 /0 1 0 0 /1 0 0 0 /1 0 0 0 /0 0 0 0 /-1 -1 1 0 /0 0 1 0 1 /0 0 0 0 0 /0 0 0 1 0 /1 0 1 -1 0 /. - . . . /+ - . . . /+ - . . . /+ . . - . /+ + + - . /"],
			[0,"pzprv3/triplace/5/5/0 -1 0 -1 1 -1 /-1 -1,2 . . . . /-1 . . . -1,-1 . /-1 . . . . . /1 . -1,1 . . . /1 . . . . -1,-1 /0 1 0 0 /1 0 0 0 /1 0 1 0 /0 0 1 0 /-1 -1 1 0 /0 0 1 0 1 /0 1 1 0 0 /0 0 -1 1 1 /1 0 1 -1 0 /. - + + + /+ - - . . /+ - - . . /+ . - - - /+ + + - . /"]
		],
		usotatami : [
			[32301,"pzprv3/usotatami/5/5/1 . 1 3 . /2 . . . . /1 . 1 . 3 /. 1 2 1 . /. 3 . . 2 /1 0 0 0 /1 0 0 0 /1 0 0 0 /1 0 0 0 /1 0 0 0 /1 1 1 1 1 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			[30005,"pzprv3/usotatami/5/5/1 . 1 3 . /2 . . . . /1 . 1 . 3 /. 1 2 1 . /. 3 . . 2 /0 0 0 0 /1 0 0 0 /1 0 0 0 /1 0 0 0 /1 0 0 0 /1 1 1 1 1 /0 1 1 1 1 /0 0 0 0 0 /0 0 0 0 0 /"],
			[30013,"pzprv3/usotatami/5/5/1 . 1 3 . /2 . . . . /1 . 1 . 3 /. 1 2 1 . /. 3 . . 2 /0 0 0 0 /1 0 0 0 /1 0 0 0 /1 0 0 0 /1 0 0 0 /1 1 1 1 1 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			[30034,"pzprv3/usotatami/5/5/1 . 1 3 . /2 . . . . /1 . 1 . 3 /. 1 2 1 . /. 3 . . 2 /0 1 1 1 /1 1 1 1 /1 1 0 1 /1 1 1 1 /0 0 1 1 /1 1 0 0 0 /1 0 1 1 0 /0 0 1 1 0 /1 1 1 0 1 /"],
			[32101,"pzprv3/usotatami/5/5/1 . 1 3 . /2 . . . . /1 . 1 . 3 /. 1 2 1 . /. 3 . . 2 /0 1 1 0 /1 1 1 0 /1 1 0 1 /1 1 1 1 /1 0 1 1 /1 1 0 0 1 /1 0 1 1 1 /0 0 1 1 0 /0 1 1 0 1 /"],
			[30001,"pzprv3/usotatami/5/5/1 . 1 3 . /2 . . . . /1 . 1 . 3 /. 1 2 1 . /. 3 . . 2 /0 1 1 0 /1 1 1 0 /1 1 0 1 /1 1 1 1 /1 0 1 1 /1 1 0 0 0 /1 0 1 1 1 /0 0 1 1 0 /0 1 1 0 1 /"],
			[0,"pzprv3/usotatami/5/5/1 . 1 3 . /2 . . . . /1 . 1 . 3 /. 1 2 1 . /. 3 . . 2 /-1 1 1 1 /1 1 1 1 /1 1 0 1 /1 1 1 1 /1 0 1 1 /1 1 0 0 -1 /1 -1 1 1 -1 /0 -1 1 1 -1 /0 1 1 0 1 /"]
		],
		view : [
			[60101,"pzprv3/view/5/5/. . . . . /. . 4 0 1 /. 3 . 2 . /1 0 1 . . /. . . . . /- - - . . /- - . . . /. . - . . /. . . . . /. 0 . . . /"],
			[69211,"pzprv3/view/5/5/. . . . . /. . 4 0 1 /. 3 . 2 . /1 0 1 . . /. . . . . /- - - . + /- - . . . /+ . - . - /. . . + + /- + + . . /"],
			[10009,"pzprv3/view/5/5/. . . . . /. . 4 0 1 /. 3 . 4 . /1 0 2 . . /. . . . . /- - - + + /- - . . . /+ . - . - /. . . . + /- + + . . /"],
			[50181,"pzprv3/view/5/5/. . . . . /. . 4 0 1 /. 3 . 2 . /1 0 1 . . /. . . . . /- - - + + /- - . . . /2 . - . - /. . . 0 + /- + + + . /"],
			[0,"pzprv3/view/5/5/. . . . . /. . 4 0 1 /. 3 . 2 . /1 0 1 . . /. . . . . /- - - 3 0 /- - . . . /2 . - . - /. . . 0 2 /- 1 0 1 . /"]
		],
		wagiri : [
			[90521,"pzprv3/wagiri/4/4/. . . . . /. 4 . . 1 /. . 2 . . /0 . . 2 . /. . . . . /. 1 . . /. . 2 . /. 1 . . /. . 1 . /1 2 1 . /2 1 2 . /. . . . /. . . . /"],
			[90511,"pzprv3/wagiri/4/4/. . . . . /. 4 . . 1 /. . 2 . . /0 . . 2 . /. . . . . /. 1 . . /. . 2 . /. 1 . . /. . 1 . /1 2 1 1 /2 1 1 2 /. . . . /. . . . /"],
			[90531,"pzprv3/wagiri/4/4/. . . . . /. 4 . . 1 /. . 2 . . /0 . . 2 . /. . . . . /. 1 . . /. . 2 . /. 1 . . /. . 1 . /1 2 1 1 /2 1 1 1 /1 2 2 . /2 1 2 1 /"],
			[50131,"pzprv3/wagiri/4/4/. . . . . /. 4 . . 1 /. . 2 . . /0 . . 2 . /. . . . . /. 1 . . /. . 2 . /. 1 . . /. . 1 . /1 2 1 1 /2 1 1 1 /1 2 2 2 /. 1 2 2 /"],
			[0,"pzprv3/wagiri/4/4/. . . . . /. 4 . . 1 /. . 2 . . /0 . . 2 . /. . . . . /. 1 . . /. . 2 . /. 1 . . /. . 1 . /1 2 1 1 /2 1 1 1 /1 2 2 2 /2 1 2 2 /"]
		],
		wblink : [
			[40301,"pzprv3/wblink/5/5/1 1 . 2 . /. . 2 . 1 /. 1 . . 2 /2 1 . 2 1 /2 . . 1 2 /0 0 0 0 /0 0 0 0 /0 1 1 1 /0 0 0 0 /0 0 0 0 /0 0 0 1 0 /0 0 0 1 0 /0 0 0 1 0 /0 0 0 0 0 /"],
			[43302,"pzprv3/wblink/5/5/1 1 . 2 . /. . 2 . 1 /. 1 . . 2 /2 1 . 2 1 /2 . . 1 2 /0 0 0 0 /0 0 0 0 /0 0 0 0 /1 1 1 1 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			[48001,"pzprv3/wblink/5/5/1 1 . 2 . /. . 2 . 1 /. 1 . . 2 /2 1 . 2 1 /2 . . 1 2 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 1 0 0 0 /0 1 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			[48011,"pzprv3/wblink/5/5/1 1 . 2 . /. . 2 . 1 /. 1 . . 2 /2 1 . 2 1 /2 . . 1 2 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 1 0 /0 0 0 1 0 /0 0 0 1 0 /0 0 0 0 0 /"],
			[43505,"pzprv3/wblink/5/5/1 1 . 2 . /. . 2 . 1 /. 1 . . 2 /2 1 . 2 1 /2 . . 1 2 /-1 1 1 0 /0 0 1 1 /0 0 0 0 /0 1 1 0 /1 1 1 0 /1 -1 0 0 0 /1 -1 0 0 0 /1 -1 0 0 0 /0 0 0 0 0 /"],
			[0,"pzprv3/wblink/5/5/1 1 . 2 . /. . 2 . 1 /. 1 . . 2 /2 1 . 2 1 /2 . . 1 2 /-1 1 1 0 /0 0 1 1 /0 1 1 1 /0 1 1 0 /1 1 1 0 /1 -1 0 0 0 /1 -1 0 0 0 /1 -1 0 0 0 /0 0 0 -1 1 /"]
		],
		yajikazu : [
			[10021,"pzprv3/yajikazu/6/6/4,0 . . . . 2,3 /1,99 . . . . . /. . . . 3,2 . /. . . . . . /. 1,2 . . 3,2 . /1,2 . 1,1 . . . /+ + . . . . /# + . . . . /# . . . . . /. . . . . . /. . . . . . /. . . . . . /"],
			[10020,"pzprv3/yajikazu/6/6/4,0 . . . . 2,3 /1,99 . . . . . /. . . . 3,2 . /. . . . . . /. 1,2 . . 3,2 . /1,2 . 1,1 . . . /+ + + + + + /# + . . + # /+ # . . + + /. . # . + # /. . . # + + /. . # . + # /"],
			[10028,"pzprv3/yajikazu/6/6/4,0 . . . . 2,3 /1,99 . . . . . /. . . . 3,2 . /. . . . . . /. 1,2 . . 3,2 . /1,2 . 1,1 . . . /+ + + + + + /# + . + + # /+ # . # + + /+ + . . + # /. + . . + + /. . . . + # /"],
			[0,"pzprv3/yajikazu/6/6/4,0 . . . . 2,3 /1,99 . . . . . /. . . . 3,2 . /. . . . . . /. 1,2 . . 3,2 . /1,2 . 1,1 . . . /+ + + + + + /# + # + + # /+ # + # + + /+ + + . + # /+ # + # + + /# + + . + # /"]
		],
		yajirin : [
			[40201,"pzprv3/yajirin/5/5/. . . . . /. . . . . /. . . 3,2 . /. . . . . /. . . . 1,0 /. . . . . /. . . . . /. . . . . /. . . . . /. . . . . /1 1 1 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 1 0 0 0 /0 1 0 0 0 /0 1 0 0 0 /0 0 0 0 0 /"],
			[40301,"pzprv3/yajirin/5/5/. . . . . /. . . . . /. . . 3,2 . /. . . . . /. . . . 1,0 /. . . . . /. . . . . /. . . . . /. . . . . /. . . . . /0 0 1 0 /1 1 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 1 1 0 0 /0 1 0 0 0 /0 1 0 0 0 /0 0 0 0 0 /"],
			[50101,"pzprv3/yajirin/5/5/. . . . . /. . . . . /. . . 3,2 . /. . . . . /. . . . 1,0 /. . . # . /. . . . . /# . # . . /. . . . . /. . . . . /1 1 0 1 /1 0 1 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /1 0 1 1 0 /0 1 0 0 0 /0 1 0 0 0 /0 0 0 0 0 /"],
			[10021,"pzprv3/yajirin/5/5/. . . . . /. . . . . /. . . 3,2 . /. . . . . /. . . . 1,0 /. . . . . /. . . . . /# . # . . /. . # . . /. . . . . /1 1 0 1 /1 0 1 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /1 0 1 1 0 /0 1 0 0 0 /0 1 0 0 0 /0 0 0 0 0 /"],
			[10028,"pzprv3/yajirin/5/5/. . . . . /. . . . . /. . . 3,2 . /. . . . . /. . . . 1,0 /. . . . . /. . . . + /# . . . + /. . + . + /. . . # . /1 1 -1 1 /1 -1 1 -1 /0 0 0 -1 /1 -1 1 1 /1 1 0 0 /1 -1 1 1 1 /0 1 0 0 1 /0 1 0 0 1 /1 -1 1 0 0 /"],
			[40101,"pzprv3/yajirin/5/5/. . . . . /. . . . . /. . . 3,2 . /. . . . . /. . . . 1,0 /. . . . . /. . . . + /# . # . + /. . + . + /. . . . . /1 1 0 1 /1 0 1 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /1 0 1 1 0 /0 1 0 0 0 /0 1 0 0 0 /0 0 0 0 0 /"],
			[41101,"pzprv3/yajirin/5/5/. . . . . /. . . . . /. . . 3,2 . /. . . . . /. . . . 1,0 /. . . . . /. . . . + /# . # . + /. . + . + /. . . . . /1 1 0 1 /1 1 0 1 /0 0 0 0 /0 0 1 0 /0 0 1 0 /1 0 1 1 1 /0 0 0 0 0 /0 0 0 0 0 /0 0 1 1 0 /"],
			[50111,"pzprv3/yajirin/5/5/. . . . . /. . . . . /. . . 3,2 . /. . . . . /. . . . 1,0 /. . . . . /. . . . + /# . # . + /. . + . + /. . . . . /1 1 0 1 /1 0 1 0 /0 0 0 0 /0 1 0 1 /0 0 1 0 /1 0 1 1 1 /0 1 0 0 1 /0 1 0 0 1 /0 0 1 1 0 /"],
			[0,"pzprv3/yajirin/5/5/. . . . . /. . . . . /. . . 3,2 . /. . . . . /. . . . 1,0 /. . . . . /. . . . + /# . # . + /. . + . + /. . . # . /1 1 -1 1 /1 -1 1 -1 /0 0 0 -1 /1 -1 1 1 /1 1 0 0 /1 -1 1 1 1 /0 1 0 0 1 /0 1 0 0 1 /1 -1 1 0 0 /"]
		],
		yajitatami : [
			[32301,"pzprv3/yajitatami/5/5/. . 3,2 3,3 . /2,2 2,2 . . . /. . . . . /. . . . . /. . . 1,2 3,3 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /1 1 0 0 /1 1 0 0 /1 0 0 0 /0 0 0 0 /0 0 0 0 /-1 -1 0 0 0 /1 1 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			[50501,"pzprv3/yajitatami/5/5/. . 3,2 3,3 . /2,2 2,2 . . . /. . . . . /. . . . . /. . . 1,2 3,3 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /1 1 0 0 /1 1 0 0 /-1 0 0 0 /0 0 0 0 /0 0 0 0 /-1 -1 0 0 0 /1 1 0 0 0 /1 1 0 0 0 /0 0 0 0 0 /"],
			[10033,"pzprv3/yajitatami/5/5/. . 3,2 3,3 . /2,2 2,2 . . . /. . . . . /. . . . . /. . . 1,2 3,3 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /1 1 1 0 /1 1 1 0 /-1 0 0 0 /1 1 1 0 /1 1 0 1 /-1 -1 -1 0 0 /1 1 1 0 0 /1 1 1 0 0 /-1 0 1 1 0 /"],
			[33201,"pzprv3/yajitatami/5/5/. . 3,2 3,3 . /2,2 2,2 . . . /. . . . . /. . . . . /. . . 1,2 3,3 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /1 1 1 0 /1 1 1 0 /-1 0 0 1 /1 1 0 1 /1 1 0 1 /-1 -1 -1 0 0 /1 1 1 0 1 /1 1 0 0 -1 /-1 0 1 1 -1 /"],
			[30023,"pzprv3/yajitatami/5/5/. . 3,2 3,3 . /2,2 2,2 . . . /. . . . . /. . . . . /. . . 1,2 3,3 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /1 1 1 0 /1 1 1 0 /-1 0 0 1 /1 1 0 1 /1 1 0 1 /-1 -1 -1 1 1 /1 1 1 0 1 /1 1 0 0 -1 /-1 0 1 1 -1 /"],
			[30001,"pzprv3/yajitatami/5/5/. . 3,2 3,3 . /2,2 2,2 . . . /. . . . . /. . . . . /. . . 1,2 3,3 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /1 1 1 1 /1 1 1 1 /-1 0 1 1 /1 1 0 1 /1 1 0 1 /-1 -1 -1 -1 0 /1 1 1 -1 1 /1 1 0 1 -1 /-1 0 1 1 -1 /"],
			[0,"pzprv3/yajitatami/5/5/. . 3,2 3,3 . /2,2 2,2 . . . /. . . . . /. . . . . /. . . 1,2 3,3 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /1 1 1 1 /1 1 1 1 /-1 0 1 1 /1 1 0 1 /1 1 0 1 /-1 -1 -1 -1 0 /1 1 1 -1 1 /1 1 1 1 -1 /-1 0 1 1 -1 /"]
		],
		yosenabe : [
			[40201,"pzprv3/yosenabe/5/5/o1 i3 i o2 i5 /. . o5 . i /i2 . . . i /i . o1 . . /i o2 i i o3 /0 0 0 0 /1 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /1 0 0 0 0 /1 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			[40301,"pzprv3/yosenabe/5/5/o1 i3 i o2 i5 /. . o5 . i /i2 . . . i /i . o1 . . /i o2 i i o3 /0 0 0 0 /0 0 1 1 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 1 0 /0 0 0 1 0 /0 0 0 1 0 /0 0 0 1 0 /"],
			[30017,"pzprv3/yosenabe/5/5/o1 i3 i o2 i5 /. . o5 . i /i2 . . . i /i . o1 . . /i o2 i i o3 /1 1 1 -1 /0 -1 1 1 /0 0 0 -1 /0 0 0 0 /0 0 0 0 /0 0 -1 -1 -1 /0 0 -1 -1 -1 /0 0 0 0 -1 /0 0 0 0 0 /"],
			[43104,"pzprv3/yosenabe/5/5/o1 i3 i o2 i5 /. . o5 . i /i2 . . . i /i . o1 . . /i o2 i i o3 /0 0 1 -1 /0 -1 1 1 /0 0 0 -1 /0 0 0 0 /1 1 0 0 /0 0 -1 -1 -1 /0 0 -1 -1 -1 /0 0 0 0 -1 /0 0 0 0 0 /"],
			[20013,"pzprv3/yosenabe/5/5/o1 i3 i o2 i5 /. . o5 . i /i2 . . . i /i . o1 . . /i o2 i i o3 /1 0 1 -1 /0 -1 1 1 /1 0 0 -1 /0 0 0 0 /0 0 0 0 /0 1 -1 -1 -1 /0 1 -1 -1 -1 /0 0 0 0 -1 /0 0 0 0 0 /"],
			[90701,"pzprv3/yosenabe/5/5/o1 i3 i o2 i5 /. . o5 . i /i2 4 . . i /i . o1 . . /i o2 i i o3 /1 0 1 -1 /0 -1 1 1 /0 0 0 -1 /0 0 0 0 /0 0 0 0 /0 0 -1 -1 -1 /0 0 -1 -1 -1 /0 0 0 0 -1 /0 0 0 0 0 /"],
			[90711,"pzprv3/yosenabe/5/5/o1 i3 i o2 i5 /. . o5 . i /i2 . . . i /i2 . o1 . . /i2 o2 i i o3 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			[90721,"pzprv3/yosenabe/5/5/o1 i3 i o2 i5 /. . o5 . i /i2 . . . i /i . o1 . . /i o2 i i o3 /0 0 1 -1 /0 -1 1 1 /0 0 0 -1 /0 0 0 0 /0 0 0 0 /0 1 -1 -1 -1 /0 1 -1 -1 -1 /0 1 0 0 -1 /0 1 0 0 0 /"],
			[90731,"pzprv3/yosenabe/5/5/o1 i3 i o2 i5 /. . o5 . i /i2 . . . i /i . o1 . . /i o2 i i o3 /1 0 1 -1 /0 -1 1 1 /0 0 0 -1 /0 0 0 0 /0 0 0 0 /0 0 -1 -1 -1 /0 0 -1 -1 -1 /0 0 0 0 -1 /0 0 0 0 0 /"],
			[90741,"pzprv3/yosenabe/5/5/o1 i3 i o2 i5 /. . o5 . i /i2 . . . i /i . o1 . . /i o2 i i o3 /1 0 1 -1 /0 -1 1 1 /0 0 0 -1 /0 0 0 0 /1 0 0 0 /0 0 -1 -1 -1 /0 0 -1 -1 -1 /0 0 0 0 -1 /0 0 1 0 0 /"],
			[43204,"pzprv3/yosenabe/5/5/o1 i3 i o2 i5 /. . o5 . i /i2 . . . i /i . o1 . . /i o2 i i o3 /1 0 1 -1 /0 -1 1 1 /0 1 1 -1 /0 0 0 0 /1 0 0 1 /0 0 -1 -1 -1 /0 0 -1 -1 -1 /0 0 0 0 -1 /0 0 1 0 0 /"],
			[0,"pzprv3/yosenabe/5/5/o1 i3 i o2 i5 /. . o5 . i /i2 . . . i /i . o1 . . /i o2 i i o3 /1 0 1 -1 /0 -1 1 1 /0 0 0 -1 /0 0 0 0 /1 0 0 1 /0 0 -1 -1 -1 /0 0 -1 -1 -1 /0 0 0 0 -1 /0 0 1 0 0 /"]
		]
	},

	urls : {
		aho        : '6/6/4i264n6j3n223i4',
		amibo      : '5/5/2c4a.c3f.3f',
		ayeheya    : '6/6/99aa8c0vu0ufk2k',
		bag        : '6/6/g3q2h3jbj3i3i2g',
		barns      : '5/5/06ec080000100',
		bdblock    : '5/5/100089082/12345o51g4i3i',
		bonsan     : 'c/5/5/i.h.i2i.i3h2i',
		bosanowa   : '6/5/jo9037g2n2n3g4j3i',
		box        : '5/5/7a9979672f',
		cbblock    : '4/4/ah0oa',
		chocona    : '6/6/8guumlfvo1eq33122g21g32',
		cojun      : '4/4/pd0hsoh3p3h',
		country    : '5/5/amda0uf02h12h',
		creek      : '6/6/gagaich2cgb6769dt',
		factors    : '5/5/rvvcm9jf54653-28ca2833-14',
		fillmat    : '5/5/3b3h1h1b4',
		fillomino  : '6/6/h4j53g2k5233k2g14j3h',
		firefly    : '5/5/40c21a3.a30g10a22a11c11',
		fivecells  : '6/6/72b1i0f2b1i3a',
		fourcells  : '6/6/b1d2a3e3d1f2b2a3b2',
		goishi     : '6/7/vsten1tvo',
		gokigen    : '4/4/iaegcgcj6a',
		hakoiri    : '5/5/4qb44qb41c3c1f23a2b1b1',
		hanare     : '4/4/jegf6gu3',
		hashikake  : '5/5/4g2i3h23k3g1g3g4g3',
		heyawake   : '6/6/lll155007rs12222j',
		heyabon    : '5/5/co360rr0g1h0g.j121g3h1h.g.g',
		hitori     : '4/4/1114142333214213',
		icebarn    : '8/8/73btfk05ovbjghzpwz9bwm/3/11',
		icelom     : 'a/6/6/9e50an10i3zl2g1i/15/4',
		icelom2    : '6/6/1at0bl80h3p4g5j2g1p6h/0/9',
		ichimaga   : '5/5/gdiedgdbic',
		ichimagam  : '5/5/7cgegbegbgcc',
		ichimagax  : '5/5/g8bgedgbeg8b',
		kaero      : '3/3/egh0BCBcAaA',
		kakuro     : '5/5/48la0.na0lh3l0Bn.0cl.c4a3',
		kakuru     : '5/5/3.a+4+mD.S.bm+g+A.3',
		kinkonkan  : '4/4/94gof0BAaDbBaCbCaAaD21122211',
		kouchoku   : '4/4/a2b1.2a0bc0b2.0.c0',
		kramma     : 'c/5/5/9ock3ba9i',
		kramman    : '5/5/32223i3f2fb99i',
		kurochute  : '5/5/132k1i1i2k332',
		kurodoko   : '5/5/i7g5l2l2g4i',
		kusabi     : '5/5/311e2c12c1f3',
		lightup    : '6/6/nekcakbl',
		lits       : '4/4/9q02jg',
		loopsp     : '5/5/sgnmn1n1n2njnls',
		loute      : '5/5/5i3h1h1i1h2h4i5',
		mashu      : '6/6/1063000i3000',
		mejilink   : '4/4/g9rm4',
		minarism   : '4/4/hhhq21pgi',
		mochikoro  : '5/5/4p2n1i1',
		mochinyoro : '5/5/l4g2m2m1',
		nagenawa   : '6/6/alrrlafbaaqu3011314g223h',
		nanro      : '4/4/6r0s1oi13n1h',
		nawabari   : '5/5/f0a1g2a1f',
		norinori   : '5/5/cag4ocjo',
		numlin     : '5/5/1j2h3m1h2j3',
		nuribou    : '5/5/1g2l1g4r7',
		nurikabe   : '5/5/g5k2o1k3g',
		paintarea  : '5/5/pmvmfuejf4k1f',
		pipelink   : '5/5/mamejan',
		pipelinkr  : '5/5/ma0j2j0fm',
		reflect    : '5/5/49l20c5f24',
		renban     : '4/4/vmok3g1p5g2h',
		ringring   : '5/5/02084',
		ripple     : '4/4/9n8rigk14h32k',
		roma       : '4/4/augddgb2a12d53a3b',
		sashigane  : '5/5/jm.o3khkgojm4',
		shakashaka : '6/6/cgbhdhegdrb',
		shikaku    : '6/6/j3g56h6t6h23g5j',
		shimaguni  : '6/6/7fe608s0e3uf3g3g2g43',
		shugaku    : '5/5/c5d462b',
		shwolf     : '5/5/0282bocb6ajf9',
		slalom     : 'p/6/6/9314131314131a1131ag44j11/33',
		slither    : '5/5/cbcbcddad',
		snakes     : '5/5/a21g23b20b45g41a',
		sudoku     : '4/4/g1k23k3g',
		sukoro     : '5/5/2a2c4a2g2a4c2a2',
		sukororoom : '5/5/4vjbtnfpb3i2i3b',
		tasquare   : '6/6/1g.i4j1i3j5i5j.i2g1',
		tatamibari : '5/5/m3g11i2g31h13g3g',
		tateyoko   : '5/5/i23i3ono2i25i22pnqi33i2',
		tawa       : '5/5/0/a2b2b3g5b2c2',
		tentaisho  : '5/5/67eh94fi65en8dbf',
		tilepaint  : '6/6/mfttf5ovqrrvzv234232243331',
		toichika   : '4/4/n70kt84j',
		triplace   : '5/5/%2m_m%1m_.0.1....11',
		usotatami  : '5/5/1a13a2d1a1a3a121b3b2',
		view       : '5/5/m401g3g2g101m',
		wagiri     : '4/4/lebcacja1d2b1d1a',
		wblink     : '5/5/ci6a2ln1i',
		yajikazu   : '6/6/40d23663i32h12b32a12a11c',
		yajirin    : '5/5/m32j10',
		yajitatami : '5/5/b3233a2222p1233',
		yosenabe   : '5/5/d1hgm1i3j2i5k5ki2o1l2k3'
	}
});

})();
