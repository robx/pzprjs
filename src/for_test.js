// for_test.js v3.3.1

debug.extend({
	testonly_func : function(){
		_doc.testform.starttest.style.display = 'inline';
		_doc.testform.starttest.onclick = ee.binder(this, this.starttest);
		
		if(!ee('testdiv')){
			var el = _doc.createElement('div');
			el.id = 'testdiv';
			el.style.textAlign  = 'left';
			el.style.fontSize   = '8pt';
			el.style.lineHeight = '100%';
			_doc.body.appendChild(el);
		}
	},

	keydown : function(ca){
		if(ca=='F7'){ this.accheck1();}
		else if(kc.isCTRL && ca=='F8'){ this.disppoptest();}
		else if(kc.isCTRL && ca=='F9'){ this.starttest();}
		else if(kc.isCTRL && kc.isSHIFT && ca=='F10'){ this.all_test();}
		else{ return false;}

		kc.tcMoved = true;
		return true;
	},

	all_test : function(){
		var pnum=0, term=debug.urls.length-1;
		debug.phase = 99;

		var tam = setInterval(function(){
			if(debug.phase != 99){ return;}
			debug.phase = 0;

			var newid = debug.urls[pnum][0];
			base.reload_func(newid, debug.urls[pnum][1], ee.binder(debug, debug.sccheck));

			if(pnum >= term){ clearInterval(tam);}

			debug.addTextarea("Test ("+pnum+", "+newid+") start.");
			pnum++;
		},500);
	},

	accheck1 : function(){
		var outputstr = fio.fileencode(fio.PZPH);

		ans.inCheck = true;
		ans.disableSetError();
		ans.alstr = { jp:'' ,en:''};
		ans.checkAns();
		ans.enableSetError();
		ans.inCheck = false;

		this.addTextarea("\t\t\t[\""+ans.alstr.jp+"\",\""+outputstr+"\"],");
	},

	starttest : function(){
		this.erasetext();
		this.sccheck();
	},

	phase : 0,
	sccheck : function(){
		if(pp.getVal('autocheck')){ pp.setVal('autocheck',false);}
		var n=0, alstr='', qstr='', mint=80, fint=50;
		this.phase = 10;
		var tim = setInterval(function(){
		//Encode test--------------------------------------------------------------
		switch(debug.phase){
		case 10:
			(function(){
				var col = k.qcols;
				var row = k.qrows;
				var pfg = enc.uri.pflag;
				var str = enc.uri.bstr;

				var inp = enc.getURLBase(enc.PZPRV3)+(pfg?(pfg+"/"):"")+(col+"/"+row)+("/"+str);
				var ta  = enc.pzloutput(enc.PZPRV3);

				debug.addTextarea("Encode test   = "+(inp==ta?"pass":"failure...<BR> "+inp+"<BR> "+ta));

				setTimeout(function(){
					if(k.isKanpenExist){ debug.phase = 11;}
					else{ debug.phase = (debug.acs[k.puzzleid])?20:30;}
				},fint);
			})();
			break;
		case 11:
			(function(){
				var bd2 = debug.bd_freezecopy();

				_doc.urlinput.ta.value = enc.pzloutput(enc.KANPEN);
				menu.pop = ee("pop1_5");
				menu.ex.urlinput({});

				debug.addTextarea("Encode kanpen = "+(debug.bd_compare(bd,bd2)?"pass":"failure..."));

				setTimeout(function(){
					debug.phase = (debug.acs[k.puzzleid])?20:30;
				},fint);
			})();
			break;
		//Answer test--------------------------------------------------------------
		case 20:
			(function(){
				alstr = debug.acs[k.puzzleid][n][0];
				qstr  = debug.acs[k.puzzleid][n][1];
				fio.filedecode(debug.acs[k.puzzleid][n][1]);
				setTimeout(function(){
					ans.inCheck = true;
					ans.alstr = { jp:'' ,en:''};
					ans.checkAns();
					pc.paintAll();
					ans.inCheck = false;

					var iserror = false, misstr = false;
					                  for(var c=0;c<bd.cellmax  ;c++){if(bd.cell[c].error!=0  ){ iserror = true;}}
					if(!!k.isexcell){ for(var c=0;c<bd.excellmax;c++){if(bd.excell[c].error!=0){ iserror = true;}}}
					if(!!k.iscross) { for(var c=0;c<bd.crossmax ;c++){if(bd.cross[c].error!=0 ){ iserror = true;}}}
					if(!!k.isborder){ for(var i=0;i<bd.bdmax    ;i++){if(bd.border[i].error!=0){ iserror = true;}}}
					if(k.puzzleid=='nagenawa' && n==0){ iserror = true;}
					if(debug.acs[k.puzzleid][n][0] != ""){ iserror = !iserror;}

					if(ans.alstr.jp != debug.acs[k.puzzleid][n][0]){ misstr = true;}

					debug.addTextarea("Answer test "+(n+1)+" = "+((!iserror&&!misstr)?"pass":"failure...")+" \""+debug.acs[k.puzzleid][n][0]+"\"");

					n++;
					if(n<debug.acs[k.puzzleid].length){ debug.phase = 20;}
					else{ debug.phase = (menu.ispencilbox ? 31 : 30);}
				},fint);
			})();
			break;
		//FileIO test--------------------------------------------------------------
		case 30:
			(function(){
				var outputstr = fio.fileencode(fio.PZPR);

				var bd2 = debug.bd_freezecopy();

				bd.initBoardSize(1,1);
				base.resetInfo();
				base.resize_canvas();

				setTimeout(function(){
					fio.filedecode(outputstr);
					debug.addTextarea("FileIO test   = "+(debug.bd_compare(bd,bd2)?"pass":"failure..."));

					fio.filedecode(debug.acs[k.puzzleid][debug.acs[k.puzzleid].length-1][1]);
					debug.phase = (k.puzzleid != 'tawa')?40:50;
				},fint);
			})();
			break;
		case 31:
			(function(){
				var outputstr = fio.fileencode(fio.PBOX);

				var bd2 = debug.bd_freezecopy();

				bd.initBoardSize(1,1);
				base.resetInfo();
				base.resize_canvas();

				setTimeout(function(){
					fio.filedecode(outputstr);

					debug.qsubf = !(k.puzzleid=='fillomino'||k.puzzleid=='hashikake'||k.puzzleid=='kurodoko'||k.puzzleid=='shikaku'||k.puzzleid=='tentaisho');
					debug.addTextarea("FileIO kanpen = "+(debug.bd_compare(bd,bd2)?"pass":"failure..."));
					debug.qsubf = true;

					debug.phase = 30;
				},fint);
			})();
			break;
		//Turn test--------------------------------------------------------------
		case 40:
			(function(){
				var bd2 = debug.bd_freezecopy();
				var func = function(){ menu.pop = ee("pop2_2"); menu.ex.popupadjust({srcElement:{name:'turnr'}}); menu.pop = '';};
				func();
				setTimeout(function(){ func(); setTimeout(function(){ func(); setTimeout(function(){ func();
					debug.addTextarea("TurnR test 1  = "+(debug.bd_compare(bd,bd2)?"pass":"failure..."));
					debug.phase = 41;
				},fint); },fint); },fint);
			})();
			break;
		case 41:
			(function(){
				var bd2 = debug.bd_freezecopy();
				var func = function(){ um.undo(1);};
				func();
				setTimeout(function(){ func(); setTimeout(function(){ func(); setTimeout(function(){ func();
					debug.addTextarea("TurnR test 2  = "+(debug.bd_compare(bd,bd2)?"pass":"failure..."));
					debug.phase = 45;
				},fint); },fint); },fint);
			})();
			break;
		case 45:
			(function(){
				var bd2 = debug.bd_freezecopy();
				var func = function(){ menu.pop = ee("pop2_2"); menu.ex.popupadjust({srcElement:{name:'turnl'}}); menu.pop = '';};
				func();
				setTimeout(function(){ func(); setTimeout(function(){ func(); setTimeout(function(){ func();
					debug.addTextarea("TurnL test 1  = "+(debug.bd_compare(bd,bd2)?"pass":"failure..."));
					debug.phase = 46;
				},fint); },fint); },fint);
			})();
			break;
		case 46:
			(function(){
				var bd2 = debug.bd_freezecopy();
				var func = function(){ um.undo(1);};
				func();
				setTimeout(function(){ func(); setTimeout(function(){ func(); setTimeout(function(){ func();
					debug.addTextarea("TurnL test 2  = "+(debug.bd_compare(bd,bd2)?"pass":"failure..."));
					debug.phase = 50;
				},fint); },fint); },fint);
			})();
			break;
		//Flip test--------------------------------------------------------------
		case 50:
			(function(){
				var bd2 = debug.bd_freezecopy();
				menu.pop = ee("pop2_2"); menu.ex.popupadjust({srcElement:{name:'flipx'}});

				setTimeout(function(){ menu.pop = ee("pop2_2"); menu.ex.popupadjust({srcElement:{name:'flipx'}}); menu.pop = '';
					debug.addTextarea("FlipX test 1  = "+(debug.bd_compare(bd,bd2)?"pass":"failure..."));
					debug.phase = 51;
				},fint);
			})();
			break;
		case 51:
			(function(){
				var bd2 = debug.bd_freezecopy();
				um.undo(1);

				setTimeout(function(){ um.undo(1);
					debug.addTextarea("FlipX test 2  = "+(debug.bd_compare(bd,bd2)?"pass":"failure..."));
					debug.phase = 55;
				},fint);
			})();
			break;
		case 55:
			(function(){
				var bd2 = debug.bd_freezecopy();
				menu.pop = ee("pop2_2"); menu.ex.popupadjust({srcElement:{name:'flipy'}});

				setTimeout(function(){ menu.pop = ee("pop2_2"); menu.ex.popupadjust({srcElement:{name:'flipy'}}); menu.pop = '';
					debug.addTextarea("FlipY test 1  = "+(debug.bd_compare(bd,bd2)?"pass":"failure..."));
					debug.phase = 56;
				},fint);
			})();
			break;
		case 56:
			(function(){
				var bd2 = debug.bd_freezecopy();
				um.undo(1);

				setTimeout(function(){ um.undo(1);
					debug.addTextarea("FlipY test 2  = "+(debug.bd_compare(bd,bd2)?"pass":"failure..."));
					debug.phase = 60;
				},fint);
			})();
			break;
		//Adjust test--------------------------------------------------------------
		case 60:
			debug.phase=0;
			(function(){
				var bd2 = debug.bd_freezecopy();
				var func = function(nid){ menu.pop = ee("pop2_1"); menu.ex.popupadjust({srcElement:{name:nid}}); menu.pop = '';};
				setTimeout(function(){ func('expandup'); setTimeout(function(){ func('expandrt');
				setTimeout(function(){ func('expanddn'); setTimeout(function(){ func('expandlt');
				setTimeout(function(){ func('reduceup'); setTimeout(function(){ func('reducert');
				setTimeout(function(){ func('reducedn'); setTimeout(function(){ func('reducelt');
					debug.addTextarea("Adjust test 1 = "+(debug.bd_compare(bd,bd2)?"pass":"failure..."));
					debug.phase = 61;
				},fint); },fint); },fint); },fint); },fint); },fint); },fint); },fint);
			})();
			break;
		case 61: // ワンクッション置く
			setTimeout(function(){ debug.phase = 62;},((fint/2)|0));
			break;
		case 62:
			(function(){
				var bd2 = debug.bd_freezecopy();
				var func = function(){ um.undo(1);};
				func();
				setTimeout(function(){ func(); setTimeout(function(){ func(); setTimeout(function(){ func();
				setTimeout(function(){ func(); setTimeout(function(){ func(); setTimeout(function(){ func(); setTimeout(function(){ func();
					debug.addTextarea("Adjust test 2 = "+(debug.bd_compare(bd,bd2)?"pass":"failure..."));
					debug.phase = 90;
				},fint); },fint); },fint); },fint); },fint); },fint); },fint);
			})();
			break;
		//test end--------------------------------------------------------------
		case 90:
			clearInterval(tim);
			debug.addTextarea("Test end.");
			debug.phase = 99;
			return;
		}
		debug.phase=0;
		},mint);
	},
	taenable : true,
	addTextarea : function(str){
		if(!k.br.Gecko){ ee('testarea').el.value += (str+"\n");}
		else{ ee('testdiv').appendHTML(str).appendBR();}
	},

	qsubf : true,
	bd_freezecopy : function(){
		var bd2 = {cell:[],excell:[],cross:[],border:[]};
		for(var c=0;c<bd.cellmax;c++){
			bd2.cell[c] = {};
			bd2.cell[c].ques=bd.cell[c].ques;
			bd2.cell[c].qnum=bd.cell[c].qnum;
			bd2.cell[c].qdir=bd.cell[c].qdir;
			bd2.cell[c].anum=bd.cell[c].anum;
			bd2.cell[c].qans=bd.cell[c].qans;
			bd2.cell[c].qsub=bd.cell[c].qsub;
		}
		if(!!k.isexcell){
			for(var c=0;c<bd.excellmax;c++){
				bd2.excell[c] = {};
				bd2.excell[c].qnum=bd.excell[c].qnum;
				bd2.excell[c].qdir=bd.excell[c].qdir;
			}
		}
		if(!!k.iscross){
			for(var c=0;c<bd.crossmax;c++){
				bd2.cross[c] = {};
				bd2.cross[c].ques=bd.cross[c].ques;
				bd2.cross[c].qnum=bd.cross[c].qnum;
			}
		}
		if(!!k.isborder){
			for(var i=0;i<bd.bdmax;i++){
				bd2.border[i] = {};
				bd2.border[i].ques=bd.border[i].ques;
				bd2.border[i].qnum=bd.border[i].qnum;
				bd2.border[i].qans=bd.border[i].qans;
				bd2.border[i].qsub=bd.border[i].qsub;
				bd2.border[i].line=bd.border[i].line;
			}
		}
		return bd2;
	},
	bd_compare : function(bd1,bd2){
//		debug.taenable = false;
		var result = true;
		for(var c=0,len=Math.min(bd1.cell.length,bd2.cell.length);c<len;c++){
			if(bd1.cell[c].ques!=bd2.cell[c].ques){ result = false; debug.addTextarea("cell ques "+c+" "+bd1.cell[c].ques+" &lt;- "+bd2.cell[c].ques);}
			if(bd1.cell[c].qnum!=bd2.cell[c].qnum){ result = false; debug.addTextarea("cell qnum "+c+" "+bd1.cell[c].qnum+" &lt;- "+bd2.cell[c].qnum);}
			if(bd1.cell[c].qdir!=bd2.cell[c].qdir){ result = false; debug.addTextarea("cell qdir "+c+" "+bd1.cell[c].qdir+" &lt;- "+bd2.cell[c].qdir);}
			if(bd1.cell[c].anum!=bd2.cell[c].anum){ result = false; debug.addTextarea("cell anum "+c+" "+bd1.cell[c].anum+" &lt;- "+bd2.cell[c].anum);}
			if(bd1.cell[c].qans!=bd2.cell[c].qans){ result = false; debug.addTextarea("cell qans "+c+" "+bd1.cell[c].qans+" &lt;- "+bd2.cell[c].qans);}
			if(bd1.cell[c].qsub!=bd2.cell[c].qsub){
				if(debug.qsubf){ result = false; debug.addTextarea("cell qsub "+c+" "+bd1.cell[c].qsub+" &lt;- "+bd2.cell[c].qsub);}
				else{ bd1.cell[c].qsub = bd2.cell[c].qsub;}
			}
		}
		if(!!k.isexcell){
			for(var c=0;c<bd1.excell.length;c++){
				if(bd1.excell[c].qnum!=bd2.excell[c].qnum ){ result = false;}
				if(bd1.excell[c].qdir!=bd2.excell[c].qdir){ result = false;}
			}
		}
		if(!!k.iscross){
			for(var c=0;c<bd1.cross.length;c++){
				if(bd1.cross[c].ques!=bd2.cross[c].ques){ result = false;}
				if(bd1.cross[c].qnum!=bd2.cross[c].qnum){ result = false;}
			}
		}
		if(!!k.isborder){
			for(var i=0;i<bd1.border.length;i++){
				if(bd1.border[i].ques!=bd2.border[i].ques){ result = false; debug.addTextarea("border ques "+i+" "+bd1.border[i].ques+" &lt;- "+bd2.border[i].ques);}
				if(bd1.border[i].qnum!=bd2.border[i].qnum){ result = false; debug.addTextarea("border qnum "+i+" "+bd1.border[i].qnum+" &lt;- "+bd2.border[i].qnum);}
				if(bd1.border[i].qans!=bd2.border[i].qans){ result = false; debug.addTextarea("border qans "+i+" "+bd1.border[i].qans+" &lt;- "+bd2.border[i].qans);}
				if(bd1.border[i].line!=bd2.border[i].line){ result = false; debug.addTextarea("border line "+i+" "+bd1.border[i].line+" &lt;- "+bd2.border[i].line);}
				if(bd1.border[i].qsub!=bd2.border[i].qsub){
					if(debug.qsubf){ result = false; debug.addTextarea("border qsub "+i+" "+bd1.border[i].qsub+" &lt;- "+bd2.border[i].qsub);}
					else{ bd1.border[i].qsub = bd2.border[i].qsub;}
				}
			}
		}
//		debug.taenable = true;
		return result;
	},

	acs : {
		aho : [
			["数字の入っていない領域があります。","pzprv3/aho/6/6/4 . . . 2 6 /4 . . . . . /. . . 6 . . /. . 3 . . . /. . . . . 2 /2 3 . . . 4 /1 0 1 0 0 /1 1 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 1 0 0 0 /0 1 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /"],
			["1つの領域に2つ以上の数字が入っています。","pzprv3/aho/6/6/4 . . . 2 6 /4 . . . . . /. . . 6 . . /. . 3 . . . /. . . . . 2 /2 3 . . . 4 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /"],
			["大きさが3の倍数ではないのに四角形ではない領域があります。","pzprv3/aho/6/6/4 . . . 2 6 /4 . . . . . /. . . 6 . . /. . 3 . . . /. . . . . 2 /2 3 . . . 4 /-1 -1 -1 1 1 /0 0 0 1 1 /0 0 0 1 -1 /0 1 0 1 -1 /1 1 1 1 0 /1 0 1 0 0 /1 1 1 1 -1 -1 /1 1 1 1 1 -1 /0 0 1 1 -1 -1 /1 1 0 1 1 1 /0 0 1 0 1 1 /"],
			["大きさが3の倍数である領域がL字型になっていません。","pzprv3/aho/6/6/4 . . . 2 6 /4 . . . . . /. . . 6 . . /. . 3 . . . /. . . . . 2 /2 3 . . . 4 /-1 -1 -1 1 1 /0 0 0 1 1 /0 0 0 1 -1 /1 1 1 1 -1 /1 1 0 1 0 /1 1 0 0 0 /1 1 1 1 -1 -1 /1 1 1 1 1 -1 /0 1 1 0 -1 -1 /1 0 0 1 1 1 /0 0 1 1 1 1 /"],
			["数字と領域の大きさが違います。","pzprv3/aho/6/6/4 . . . 2 6 /4 . . . . . /. . . 6 . . /. . 3 . . . /. . . . . 2 /2 3 . . . 4 /-1 -1 2 0 1 /0 0 1 0 1 /0 0 0 1 -1 /0 1 0 1 -1 /1 0 1 1 0 /1 1 0 0 0 /1 1 1 0 -1 -1 /1 1 1 1 1 -1 /0 0 1 1 -1 -1 /1 1 1 0 1 1 /0 0 1 1 1 1 /"],
			["途切れている線があります。","pzprv3/aho/6/6/4 . . . 2 6 /4 . . . . . /. . . 6 . . /. . 3 . . . /. . . . . 2 /2 3 . . . 4 /-1 -1 -1 1 1 /0 0 0 1 1 /1 0 0 1 -1 /0 1 0 1 -1 /1 0 1 1 0 /1 1 0 0 0 /1 1 1 1 -1 -1 /1 1 1 1 1 -1 /0 0 1 1 -1 -1 /1 1 1 0 1 1 /0 0 1 1 1 1 /"],
			["","pzprv3/aho/6/6/4 . . . 2 6 /4 . . . . . /. . . 6 . . /. . 3 . . . /. . . . . 2 /2 3 . . . 4 /-1 -1 -1 1 1 /0 0 0 1 1 /0 0 0 1 -1 /0 1 0 1 -1 /1 0 1 1 0 /1 1 0 0 0 /1 1 1 1 -1 -1 /1 1 1 1 1 -1 /0 0 1 1 -1 -1 /1 1 1 0 1 1 /0 0 1 1 1 1 /"]
		],
		ayeheya : [
			["黒マスがタテヨコに連続しています。","pzprv3/ayeheya/6/6/11/0 0 1 1 1 2 /0 0 1 1 1 3 /4 4 5 5 6 6 /7 7 5 5 6 6 /7 7 8 8 8 8 /7 7 9 10 10 10 /. . . . . . /. . . . . . /. . 2 . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. # . . . . /. # . . . . /. . . . . . /. . . . . . /. . . . . . /"],
			["白マスが分断されています。","pzprv3/ayeheya/6/6/11/0 0 1 1 1 2 /0 0 1 1 1 3 /4 4 5 5 6 6 /7 7 5 5 6 6 /7 7 8 8 8 8 /7 7 9 10 10 10 /. . . . . . /. . . . . . /. . 2 . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . # /. . . . # . /. . . # . . /. . # . . . /. # . . . . /# . . . . . /"],
			["部屋の中の黒マスが点対称に配置されていません。","pzprv3/ayeheya/6/6/11/0 0 1 1 1 2 /0 0 1 1 1 3 /4 4 5 5 6 6 /7 7 5 5 6 6 /7 7 8 8 8 8 /7 7 9 10 10 10 /. . . . . . /. . . . . . /. . 2 . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . # . # . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /"],
			["部屋の数字と黒マスの数が一致していません。","pzprv3/ayeheya/6/6/11/0 0 1 1 1 2 /0 0 1 1 1 3 /4 4 5 5 6 6 /7 7 5 5 6 6 /7 7 8 8 8 8 /7 7 9 10 10 10 /. . . . . . /. . . . . . /. . 2 . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /"],
			["白マスが3部屋連続で続いています。","pzprv3/ayeheya/6/6/11/0 0 1 1 1 2 /0 0 1 1 1 3 /4 4 5 5 6 6 /7 7 5 5 6 6 /7 7 8 8 8 8 /7 7 9 10 10 10 /. . . . . . /. . . . . . /. . 2 . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . # . . . /. . . # . . /. . . . . . /. . . . . . /"],
			["四角形ではない部屋があります。","pzprv3/ayeheya/6/6/9/0 1 1 2 2 2 /1 1 1 2 2 2 /1 1 3 3 4 4 /5 5 3 3 4 4 /5 5 6 6 6 6 /5 5 7 8 8 8 /. . . . . . /. . . . . . /. . 2 . . . /. . . . . . /. . . . . . /. . . . . . /# . . . . . /. . . . . . /. . . # . # /# . # . # . /. . . . . . /. # . # . # /"],
			["","pzprv3/ayeheya/6/6/11/0 0 1 1 1 2 /0 0 1 1 1 3 /4 4 5 5 6 6 /7 7 5 5 6 6 /7 7 8 8 8 8 /7 7 9 10 10 10 /. . . . . . /. . . . . . /. . 2 . . . /. . . . . . /. . . . . . /. . . . . . /# + + + + # /+ # + + + + /+ + + # + # /# + # . # . /+ + . . . . /+ # . # . # /"]
		],
		bag : [
			["分岐している線があります。","pzprv3/bag/6/6/. 3 . . . . /. . . . . . /. 2 . . 3 . /. . . 11 . . /. . 3 . . . /3 . . . 2 . /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 0 /0 0 0 0 0 0 0 /0 0 1 0 0 0 0 /0 0 1 0 0 0 0 /0 0 1 0 0 0 0 /0 0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /1 1 1 1 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /"],
			["線が交差しています。","pzprv3/bag/6/6/. 3 . . . . /. . . . . . /. 2 . . 3 . /. . . 11 . . /. . 3 . . . /3 . . . 2 . /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 1 0 0 0 0 /0 0 1 0 0 0 0 /0 0 1 0 0 0 0 /0 0 1 0 0 0 0 /0 0 1 0 0 0 0 /0 0 0 0 0 0 0 /0 0 1 0 0 0 /0 0 0 0 0 0 /1 1 1 1 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /"],
			["輪っかが一つではありません。","pzprv3/bag/6/6/. 3 . . . . /. . . . . . /. 2 . . 3 . /. . . 11 . . /. . 3 . . . /3 . . . 2 . /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 1 0 1 0 0 /0 0 0 1 1 0 0 /1 0 0 0 0 0 0 /1 0 0 0 0 0 0 /1 0 1 0 0 0 0 /0 0 0 0 0 0 0 /0 0 1 1 0 0 /0 0 1 0 0 0 /1 1 0 1 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /1 1 0 0 0 0 /0 0 0 0 0 0 /"],
			["途中で途切れている線があります。","pzprv3/bag/6/6/. 3 . . . . /. . . . . . /. 2 . . 3 . /. . . 11 . . /. . 3 . . . /3 . . . 2 . /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 1 0 1 0 0 /0 0 0 0 1 0 0 /1 0 0 0 0 0 0 /1 0 0 0 0 0 0 /1 0 1 0 0 0 0 /0 0 0 0 0 0 0 /0 0 1 1 0 0 /0 0 1 0 0 0 /1 1 1 1 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /1 1 0 0 0 0 /0 0 0 0 0 0 /"],
			["輪の内側に入っていない数字があります。","pzprv3/bag/6/6/. 3 . . . . /. . . . . . /. 2 . . 3 . /. . . 11 . . /. . 3 . . . /3 . . . 2 . /0 0 0 1 2 0 /2 2 2 1 2 2 /2 1 2 1 1 2 /1 1 1 1 1 1 /1 2 1 1 2 2 /1 2 2 1 1 2 /0 0 0 1 1 0 0 /0 0 0 1 1 0 0 /0 1 1 1 0 1 0 /1 0 0 0 0 0 1 /1 1 1 0 1 0 0 /1 1 0 1 0 1 0 /0 0 0 1 0 0 /0 0 0 0 0 0 /0 1 0 0 1 0 /1 0 1 0 0 1 /0 1 0 0 1 1 /0 0 1 0 1 0 /1 0 0 1 1 0 /"],
			["数字と輪の内側になる4方向のマスの合計が違います。","pzprv3/bag/6/6/. 3 . . . . /. . . . . . /. 2 . . 3 . /. . . 11 . . /. . 3 . . . /3 . . . 2 . /1 1 1 1 2 0 /2 2 2 1 2 2 /2 1 2 1 1 2 /1 1 1 1 1 1 /1 2 1 1 2 2 /1 2 2 1 1 2 /1 0 0 0 1 0 0 /0 0 0 1 1 0 0 /0 1 1 1 0 1 0 /1 0 0 0 0 0 1 /1 1 1 0 1 0 0 /1 1 0 1 0 1 0 /1 1 1 1 0 0 /1 1 1 0 0 0 /0 1 0 0 1 0 /1 0 1 0 0 1 /0 1 0 0 1 1 /0 0 1 0 1 0 /1 0 0 1 1 0 /"],
			["","pzprv3/bag/6/6/. 3 . . . . /. . . . . . /. 2 . . 3 . /. . . 11 . . /. . 3 . . . /3 . . . 2 . /2 1 1 1 2 0 /2 2 2 1 2 2 /2 1 2 1 1 2 /1 1 1 1 1 1 /1 2 1 1 2 2 /1 2 2 1 1 2 /0 1 0 0 1 0 0 /0 0 0 1 1 0 0 /0 1 1 1 0 1 0 /1 0 0 0 0 0 1 /1 1 1 0 1 0 0 /1 1 0 1 0 1 0 /0 1 1 1 0 0 /0 1 1 0 0 0 /0 1 0 0 1 0 /1 0 1 0 0 1 /0 1 0 0 1 1 /0 0 1 0 1 0 /1 0 0 1 1 0 /"]
		],
		barns : [
			["線が引かれていないマスがあります。","pzprv3/barns/5/5/. . . . . /. . 1 1 . /. 1 1 1 . /. 1 1 . . /. . . . . /0 1 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 1 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			["分岐している線があります。","pzprv3/barns/5/5/. . . . . /. . 1 1 . /. 1 1 1 . /. 1 1 . . /. . . . . /0 1 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 1 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /1 1 1 1 /0 1 0 0 0 /0 1 0 0 0 /0 1 0 0 0 /0 1 0 0 0 /"],
			["氷の部分以外で線が交差しています。","pzprv3/barns/5/5/. . . . . /. . 1 1 . /. 1 1 1 . /. 1 1 . . /. . . . . /0 1 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 1 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 1 /1 1 1 1 /0 0 0 0 /0 0 0 0 /0 1 1 1 /0 1 0 0 1 /0 1 0 0 0 /0 1 0 0 0 /0 1 0 0 0 /"],
			["氷の部分で線が曲がっています。","pzprv3/barns/5/5/. . . . . /. . 1 1 . /. 1 1 1 . /. 1 1 . . /. . . . . /0 1 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 1 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 1 /0 0 1 1 /0 1 0 0 /0 0 0 0 /0 1 1 1 /0 0 0 0 1 /0 0 1 0 0 /0 1 0 0 0 /0 1 0 0 0 /"],
			["輪っかが一つではありません。","pzprv3/barns/5/5/. . . . . /. . 1 1 . /. 1 1 1 . /. 1 1 . . /. . . . . /0 1 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 1 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 1 /0 0 1 1 /0 0 0 0 /0 0 0 0 /0 1 1 1 /0 0 0 0 1 /0 0 0 0 0 /0 1 0 0 0 /0 1 0 0 0 /"],
			["途中で途切れている線があります。","pzprv3/barns/5/5/. . . . . /. . 1 1 . /. 1 1 1 . /. 1 1 . . /. . . . . /0 1 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 1 /0 0 0 0 0 /0 0 0 0 0 /1 0 1 1 /0 1 1 1 /1 1 1 1 /1 0 0 0 /1 1 0 1 /1 1 1 0 1 /1 0 1 0 0 /0 0 1 0 1 /1 0 1 1 1 /"],
			["","pzprv3/barns/5/5/. . . . . /. . 1 1 . /. 1 1 1 . /. 1 1 . . /. . . . . /0 1 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 1 /0 0 0 0 0 /0 0 0 0 0 /1 0 1 1 /0 1 1 1 /1 1 1 1 /1 1 1 0 /1 1 -1 1 /1 1 1 -1 1 /1 -1 1 -1 0 /-1 -1 1 -1 1 /1 -1 1 1 1 /"]
		],
		bdblock : [
			["黒点以外のところで線が分岐しています。","pzprv3/bdblock/5/5/1 2 3 4 5 /. . . . . /. . . . 5 /1 . 4 . . /. 3 . . . /. 1 1 1 1 . /. . . . . . /. 1 . . . . /. . . . . 1 /1 . . . . . /. . . 1 . . /1 0 0 0 /1 0 0 0 /1 0 0 0 /1 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /1 1 1 0 0 /"],
			["黒点以外のところで線が交差しています。","pzprv3/bdblock/5/5/1 2 3 4 5 /. . . . . /. . . . 5 /1 . 4 . . /. 3 . . . /. 1 1 1 1 . /. . . . . . /. 1 . . . . /. . . . . 1 /1 . . . . . /. . . 1 . . /1 0 0 0 /1 0 0 0 /1 1 0 0 /0 1 1 0 /0 0 1 0 /0 0 0 0 0 /0 1 0 0 0 /0 1 1 0 0 /1 1 0 0 0 /"],
			["数字のないブロックがあります。","pzprv3/bdblock/5/5/1 2 3 4 5 /. . . . . /. . . . 5 /1 . 4 . . /. 3 . . . /. 1 1 1 1 . /. . . . . . /. 1 . . . . /. . . . . 1 /1 . . . . . /. . . 1 . . /1 0 0 0 /1 0 0 0 /1 1 0 0 /0 1 1 0 /0 0 1 0 /0 0 0 0 0 /0 1 0 0 0 /0 0 0 1 1 /1 1 0 0 0 /"],
			["１つのブロックに異なる数字が入っています。","pzprv3/bdblock/5/5/1 2 3 4 5 /. . . . . /. . . . 5 /1 . 4 . . /. 3 . . . /. 1 1 1 1 . /. . . . . . /. 1 . . . . /. . . . . 1 /1 . . . . . /. . . 1 . . /0 1 0 0 /0 1 0 0 /0 1 0 0 /0 1 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /1 1 0 0 0 /"],
			["同じ数字が異なるブロックに入っています。","pzprv3/bdblock/5/5/1 2 3 4 5 /. . . . . /. . . . 5 /1 . 4 . . /. 3 . . 1 /. 1 1 1 1 . /. . . . . . /. 1 . . . . /. . . . 1 1 /1 . . . . . /. . . 1 1 . /1 1 1 1 /1 1 1 1 /1 0 1 1 /1 1 0 1 /0 0 1 1 /0 0 0 0 0 /0 1 0 0 0 /0 0 1 0 1 /1 0 1 0 0 /"],
			["途中で途切れている線があります。","pzprv3/bdblock/5/5/1 2 3 4 5 /. . . . . /. . . . 5 /1 . 4 . . /. 3 . . . /. 1 1 1 1 . /. . . . . . /. 1 . . . . /. . . . . 1 /1 . . . . . /. . . 1 1 . /1 1 1 1 /1 1 1 1 /1 0 1 1 /1 1 0 0 /0 0 1 1 /0 0 0 0 0 /0 1 0 0 0 /0 0 1 0 1 /1 0 1 0 0 /"],
			["線が３本以上出ていない黒点があります。","pzprv3/bdblock/5/5/1 2 3 4 5 /. . . . . /. . . . 5 /1 . 4 . . /. 3 . . . /. 1 1 1 1 . /. . . . . . /. 1 . . . . /. . . . . 1 /1 . . . . . /. . . 1 1 . /1 1 1 1 /1 1 1 1 /1 0 1 1 /1 1 0 0 /0 0 1 0 /0 0 0 0 0 /0 1 0 0 0 /0 0 1 0 1 /1 0 1 0 0 /"],
			["線が出ていない黒点があります。","pzprv3/bdblock/5/5/1 2 3 4 5 /. . . . . /. . . . 5 /1 . 4 . . /. 3 . . . /. 1 1 1 1 . /. . . . . . /. 1 . . . . /. . . . . 1 /1 . . . 1 . /. . . 1 . . /1 1 1 1 /1 1 1 1 /1 0 1 1 /1 1 0 0 /0 0 1 0 /0 0 0 0 0 /0 1 0 0 0 /0 0 1 0 1 /1 0 1 0 0 /"],
			["","pzprv3/bdblock/5/5/1 2 3 4 5 /. . . . . /. . . . 5 /1 . 4 . . /. 3 . . . /. 1 1 1 1 . /. . . . . . /. 1 . . . . /. . . . . 1 /1 . . . . . /. . . 1 . . /1 1 1 1 /1 1 1 1 /1 -1 1 1 /1 1 -1 -1 /-1 -1 1 -1 /0 0 -1 -1 0 /0 1 -1 -1 0 /0 -1 1 -1 1 /1 -1 1 -1 -1 /"]
		],
		bonsan : [
			["分岐している線があります。","pzprv3/bonsan/5/5/. 1 . . 0 /. - . . . /. 1 2 1 . /3 . . 1 . /. - . - . /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 1 1 0 /0 1 1 0 /0 0 0 0 /0 1 1 0 /0 1 1 0 /0 0 0 0 0 /1 1 0 1 1 /1 1 0 1 1 /0 0 0 0 0 /0 0 0 0 /0 0 1 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 1 0 0 /0 0 1 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			["線が交差しています。","pzprv3/bonsan/5/5/. 1 . . 0 /. - . . . /. 1 2 1 . /3 . . 1 . /. - . - . /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 1 1 0 /0 1 1 0 /0 0 0 0 /0 1 1 0 /0 1 1 0 /0 0 0 0 0 /1 1 0 1 1 /1 1 0 1 1 /0 0 0 0 0 /0 0 0 0 /0 1 1 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 1 0 0 /0 0 1 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			["○が繋がっています。","pzprv3/bonsan/5/5/. 1 . . 0 /. - . . . /. 1 2 1 . /3 . . 1 . /. - . - . /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 1 1 0 /0 1 1 0 /0 0 0 0 /0 1 1 0 /0 1 1 0 /0 0 0 0 0 /1 1 0 1 1 /1 1 0 1 1 /0 0 0 0 0 /0 0 0 0 /0 1 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 1 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			["○の上を線が通過しています。","pzprv3/bonsan/5/5/. 1 . . 0 /. - . . . /. 1 2 1 . /3 . . 1 . /. - . - . /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 1 1 0 /0 1 1 0 /0 0 0 0 /0 1 1 0 /0 1 1 0 /0 0 0 0 0 /1 1 0 1 1 /1 1 0 1 1 /0 0 0 0 0 /0 0 0 0 /1 1 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /1 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			["曲がっている線があります。","pzprv3/bonsan/5/5/. 1 . . 0 /. - . . . /. 1 2 1 . /3 . . 1 . /. - . - . /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 1 1 0 /0 1 1 0 /0 0 0 0 /0 1 1 0 /0 1 1 0 /0 0 0 0 0 /1 1 0 1 1 /1 1 0 1 1 /0 0 0 0 0 /0 0 0 0 /1 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /1 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			["数字と線の長さが違います。","pzprv3/bonsan/5/5/. 1 . . 0 /. - . . . /. 1 2 1 . /3 . . 1 . /. - . - . /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 1 1 0 /0 1 1 0 /0 0 0 0 /0 1 1 0 /0 1 1 0 /0 0 0 0 0 /1 1 0 1 1 /1 1 0 1 1 /0 0 0 0 0 /0 1 1 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			["部屋の中の○が点対称に配置されていません。","pzprv3/bonsan/5/5/. 1 . . 0 /. - . . . /. 1 2 1 . /3 . . 1 . /. - . - . /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 1 1 0 /0 1 1 0 /0 0 0 0 /0 1 1 0 /0 1 1 0 /0 0 0 0 0 /1 1 0 1 1 /1 1 0 1 1 /0 0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			["○のない部屋があります。","pzprv3/bonsan/5/5/. 1 . . 0 /. - . . . /. 1 2 1 . /3 . . 1 . /. - . - . /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 1 1 0 /0 1 1 0 /0 0 0 0 /0 1 1 0 /0 1 1 0 /0 0 0 0 0 /1 1 0 1 1 /1 1 0 1 1 /0 0 0 0 0 /0 1 0 0 /0 1 1 0 /0 0 0 0 /0 0 0 1 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 1 0 0 /0 0 1 0 0 /"],
			["○から線が出ていません。","pzprv3/bonsan/5/5/. 1 . . 0 /. 4 . . . /. 1 2 1 . /3 . . 1 . /. - . - . /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 1 1 0 /0 1 1 0 /0 0 0 0 /0 1 1 0 /0 1 1 0 /0 0 0 0 0 /1 1 0 1 1 /1 1 0 1 1 /0 0 0 0 0 /0 1 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 1 /1 0 0 0 /1 0 0 0 0 /1 0 0 1 0 /1 1 1 0 0 /0 0 1 0 0 /"],
			["○につながっていない線があります。","pzprv3/bonsan/5/5/. 1 . . 0 /. - . . . /. 1 2 1 . /3 . . 1 . /. - . - . /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 1 1 0 /0 1 1 0 /0 0 0 0 /0 1 1 0 /0 1 1 0 /0 0 0 0 0 /1 1 0 1 1 /1 1 0 1 1 /0 0 0 0 0 /0 1 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 1 /1 0 0 0 /1 0 0 0 0 /1 0 0 1 1 /1 1 1 0 0 /0 0 1 0 0 /"],
			["","pzprv3/bonsan/5/5/. 1 . . 0 /. - . . . /. 1 2 1 . /3 . . 1 . /. - . - . /2 1 2 0 2 /1 2 1 2 0 /0 1 1 1 0 /0 2 1 1 2 /2 0 2 2 0 /0 1 1 0 /0 1 1 0 /0 0 0 0 /0 1 1 0 /0 1 1 0 /0 0 0 0 0 /1 1 0 1 1 /1 1 0 1 1 /0 0 0 0 0 /0 1 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 1 /1 0 0 0 /1 0 0 0 0 /1 0 0 1 0 /1 1 1 0 0 /0 0 1 0 0 /"]
		],
		bosanowa : [
			["数字とその隣の数字の差の合計が合っていません。","pzprv3/bosanowa/5/6/. 2 0 . . . /. 0 0 0 2 . /0 0 . 0 0 0 /0 3 0 4 0 . /. 0 3 . . . /. . 3 . . . /. 4 0 0 . . /0 0 . 0 0 0 /0 . 0 . 0 . /. 0 . . . . /. . . . . /. . . . . /. . . . . /. . . . . /. . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /"],
			["数字の入っていないマスがあります。","pzprv3/bosanowa/5/6/. 2 0 . . . /. 0 0 0 2 . /0 0 . 0 0 0 /0 3 0 4 0 . /. 0 3 . . . /. . 0 . . . /. 0 0 0 . . /0 0 . 0 0 0 /0 . 0 . 0 . /. 0 . . . . /. . . . . /. . . . . /. . . . . /. . . . . /. . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /"],
			["","pzprv3/bosanowa/5/6/. 2 0 . . . /. 0 0 0 2 . /0 0 . 0 0 0 /0 3 0 4 0 . /. 0 3 . . . /. . 3 . . . /. 3 5 4 . . /6 3 . 3 2 1 /3 . 5 . 2 . /. 2 . . . . /. 1 . . . /. 2 1 2 . /3 . . 1 . /0 . 1 2 . /. . . . . /. 1 2 . . . /. 0 . 1 0 . /3 0 . 1 0 . /. . . . . . /"]
		],
		box : [
			["数字と黒マスになった数字の合計が正しくありません。","pzprv3/box/5/5/0 7 10 9 9 7 /9 . # . . . /6 . + . . . /7 . + . . . /2 + # + + + /15 # # # # # /"],
			["","pzprv3/box/5/5/0 7 10 9 9 7 /9 + # # # + /6 # + + + # /7 + + # # + /2 + # + + + /15 # # # # # /"]
		],
		chocona : [
			["黒マスのカタマリが正方形か長方形ではありません。","pzprv3/chocona/6/6/11/0 0 1 1 1 1 /0 2 2 2 2 2 /3 4 5 6 7 7 /3 4 5 6 7 7 /3 5 5 8 9 9 /3 10 10 8 8 9 /3 . 3 . . . /. 1 . . . . /2 2 . 2 1 . /. . . . . . /. . . . 3 . /. 2 . . . . /# # . . . . /# # # # # # /. . . . . . /. . . . . . /. . . . . . /. . . . . . /"],
			["数字のある領域と、領域の中にある黒マスの数が違います。","pzprv3/chocona/6/6/11/0 0 1 1 1 1 /0 2 2 2 2 2 /3 4 5 6 7 7 /3 4 5 6 7 7 /3 5 5 8 9 9 /3 10 10 8 8 9 /3 . 3 . . . /. 1 . . . . /2 2 . 2 1 . /. . . . . . /. . . . 3 . /. 2 . . . . /# # . # # # /# # . # # # /. . . . . . /. . . . . . /. . . . . . /. . . . . . /"],
			["","pzprv3/chocona/6/6/11/0 0 1 1 1 1 /0 2 2 2 2 2 /3 4 5 6 7 7 /3 4 5 6 7 7 /3 5 5 8 9 9 /3 10 10 8 8 9 /3 . 3 . . . /. 1 . . . . /2 2 . 2 1 . /. . . . . . /. . . . 3 . /. 2 . . . . /# # + # # # /# # + + + + /# # + # + # /# # + # + + /. . + + # # /. # # + # # /"]
		],
		cojun : [
			["1つの部屋に同じ数字が複数入っています。","pzprv3/cojun/4/4/1 1 0 /0 1 0 /1 1 0 /1 0 0 /1 0 0 0 /1 1 1 1 /0 0 1 1 /. . 3 . /. . . . /. . . . /. 3 . . /. . . . /. . . 3 /. . . . /. . . . /"],
			["同じ数字がタテヨコに連続しています。","pzprv3/cojun/4/4/1 1 0 /0 1 0 /1 1 0 /1 0 0 /1 0 0 0 /1 1 1 1 /0 0 1 1 /. . 3 . /. . . . /. . . . /. 3 . . /. 3 . . /. . . . /. . . . /. . . . /"],
			["同じ部屋で上に小さい数字が乗っています。","pzprv3/cojun/4/4/1 1 0 /0 1 0 /1 1 0 /1 0 0 /1 0 0 0 /1 1 1 1 /0 0 1 1 /. . 3 . /. . . . /. . . . /. 3 . . /1 2 . . /3 1 4 . /. . . . /. . . . /"],
			["数字の入っていないマスがあります。","pzprv3/cojun/4/4/1 1 0 /0 1 0 /1 1 0 /1 0 0 /1 0 0 0 /1 1 1 1 /0 0 1 1 /. . 3 . /. . . . /. . . . /. 3 . . /1 2 . 4 /3 1 2 1 /. . 1 2 /. . 2 1 /"],
			["","pzprv3/cojun/4/4/1 1 0 /0 1 0 /1 1 0 /1 0 0 /1 0 0 0 /1 1 1 1 /0 0 1 1 /. . 3 . /. . . . /. . . . /. 3 . . /1 2 . 4 /3 1 2 1 /2 4 1 2 /1 . 2 1 /"]
		],
		country : [
			["分岐している線があります。","pzprv3/country/5/5/7/0 0 1 1 2 /0 0 1 1 2 /3 4 4 4 2 /3 5 5 6 6 /3 5 5 6 6 /2 . . . . /. . . . . /1 2 . . . /. . . . . /. . . . . /0 0 0 0 /1 1 1 1 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 1 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			["交差している線があります。","pzprv3/country/5/5/7/0 0 1 1 2 /0 0 1 1 2 /3 4 4 4 2 /3 5 5 6 6 /3 5 5 6 6 /2 . . . . /. . . . . /1 2 . . . /. . . . . /. . . . . /0 0 0 0 /1 1 1 1 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 1 0 0 0 /0 1 0 0 0 /0 1 0 0 0 /0 1 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			["線が１つの国を２回以上通っています。","pzprv3/country/5/5/7/0 0 1 1 2 /0 0 1 1 2 /3 4 4 4 2 /3 5 5 6 6 /3 5 5 6 6 /2 . . . . /. . . . . /1 2 . . . /. . . . . /. . . . . /0 1 1 0 /0 0 0 0 /1 0 0 0 /0 0 0 0 /1 1 1 0 /0 1 0 1 0 /0 1 0 1 0 /1 0 0 1 0 /1 0 0 1 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			["数字のある国と線が通過するマスの数が違います。","pzprv3/country/5/5/7/0 0 1 1 2 /0 0 1 1 2 /3 4 4 4 2 /3 5 5 6 6 /3 5 5 6 6 /2 . . . . /. . . . . /1 2 . . . /. . . . . /. . . . . /0 1 0 0 /1 0 0 0 /1 1 0 0 /0 1 0 1 /0 1 1 0 /0 1 0 0 0 /1 0 0 0 0 /0 0 1 0 0 /0 1 0 1 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			["線の通っていない国があります。","pzprv3/country/5/5/8/0 0 1 1 2 /0 0 1 1 2 /3 4 4 5 2 /3 6 6 7 7 /3 6 6 7 7 /2 . . . . /. . . . . /1 2 . . . /. . . . . /. . . . . /0 0 1 0 /1 1 0 1 /1 1 0 0 /0 1 0 1 /0 1 1 0 /0 0 1 1 0 /1 0 0 0 1 /0 0 1 0 1 /0 1 0 1 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			["線が通らないマスが、太線をはさんでタテヨコにとなりあっています。","pzprv3/country/5/5/7/0 0 1 1 2 /0 0 1 1 2 /3 4 4 4 2 /3 5 5 6 6 /3 5 5 6 6 /2 . . . . /. . . . . /1 2 . . . /. . . . . /. . . . . /0 0 1 1 /1 1 0 0 /1 1 0 0 /0 1 0 1 /0 1 1 0 /0 0 1 0 1 /1 0 0 0 1 /0 0 1 0 1 /0 1 0 1 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			["途中で途切れている線があります。","pzprv3/country/5/5/7/0 0 1 1 2 /0 0 1 1 2 /3 4 4 4 2 /3 5 5 6 6 /3 5 5 6 6 /2 . . . . /. . . . . /1 2 . . . /. . . . . /. . . . . /0 0 1 0 /1 1 0 0 /1 1 0 0 /0 1 0 1 /0 1 1 0 /0 0 1 1 0 /1 0 0 0 1 /0 0 1 0 1 /0 1 0 1 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			["輪っかが一つではありません。","pzprv3/country/5/5/7/0 0 1 1 2 /0 0 1 1 2 /3 4 4 4 2 /3 5 5 6 6 /3 5 5 6 6 /2 . . . . /. . . . . /1 3 . . . /. . . . . /. . . . . /0 0 1 0 /1 1 0 1 /1 1 1 1 /0 1 1 0 /0 1 1 0 /0 0 1 1 0 /1 0 0 0 1 /0 0 0 0 0 /0 1 0 1 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			["","pzprv3/country/5/5/7/0 0 1 1 2 /0 0 1 1 2 /3 4 4 4 2 /3 5 5 6 6 /3 5 5 6 6 /2 . . . . /. . . . . /1 2 . . . /. . . . . /. . . . . /0 0 1 0 /1 1 0 1 /1 1 0 0 /0 1 0 1 /0 1 1 0 /0 0 1 1 0 /1 0 0 0 1 /0 0 1 0 1 /0 1 0 1 0 /2 2 1 0 0 /1 1 0 1 0 /1 1 1 2 1 /2 1 0 1 0 /2 1 0 0 0 /"]
		],
		creek : [
			["数字のまわりにある黒マスの数が間違っています。","pzprv3/creek/6/6/. 0 . . . 0 . /. . . . 2 . . /. . 2 2 . . . /1 . . 1 . 2 . /1 . 4 . 3 . . /. . . . . . . /. . . . . . . /# # . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /"],
			["白マスが分断されています。","pzprv3/creek/6/6/. 0 . . . 0 . /. . . . 2 . . /. . 2 2 . . . /1 . . 1 . 2 . /1 . 4 . 3 . . /. . . . . . . /. . . . . . . /. . . . . . /. . . # . . /# # # . # # /. . . . . . /. . . . . . /. . . . . . /"],
			["数字のまわりにある黒マスの数が間違っています。","pzprv3/creek/6/6/. 0 . . . 0 . /. . . . 2 . . /. . 2 2 . . . /1 . . 1 . 2 . /1 . 4 . 3 . . /. . . . . . . /. . . . . . . /. . . . . . /. . . . # . /. . . . # . /. # # . # . /. # # # # . /. . . . . . /"],
			["","pzprv3/creek/6/6/. 0 . . . 0 . /. . . . 2 . . /. . 2 2 . . . /1 . . 1 . 2 . /1 . 4 . 3 . . /. . . . . . . /. . . . . . . /. + + + + . /. # # # # + /. + + + # + /# # # + # + /. # # # # + /. . + + + + /"]
		],
		factors : [
			["同じ列に同じ数字が入っています。","pzprv3/factors/5/5/1 1 0 1 /1 1 1 1 /1 1 1 1 /1 1 1 0 /1 1 0 0 /1 0 1 1 0 /0 1 0 0 1 /1 0 0 1 1 /0 1 1 1 1 /5 4 6 . 5 /3 . 40 12 . /. 10 . . 2 /8 . . 3 . /. 3 20 . . /5 . . . 5 /. . . . 1 /. . . . . /. . . . . /. . . . . /"],
			["ブロックの数字と数字の積が同じではありません。","pzprv3/factors/5/5/1 1 0 1 /1 1 1 1 /1 1 1 1 /1 1 1 0 /1 1 0 0 /1 0 1 1 0 /0 1 0 0 1 /1 0 0 1 1 /0 1 1 1 1 /5 4 6 . 5 /3 . 40 12 . /. 10 . . 2 /8 . . 3 . /. 3 20 . . /5 . . . 2 /. . . . 5 /. . . . . /. . . . . /. . . . . /"],
			["数字の入っていないマスがあります。","pzprv3/factors/5/5/1 1 0 1 /1 1 1 1 /1 1 1 1 /1 1 1 0 /1 1 0 0 /1 0 1 1 0 /0 1 0 0 1 /1 0 0 1 1 /0 1 1 1 1 /5 4 6 . 5 /3 . 40 12 . /. 10 . . 2 /8 . . 3 . /. 3 20 . . /5 4 . . 1 /3 1 . 4 5 /1 . . 3 . /. . . . . /. . . . . /"],
			["","pzprv3/factors/5/5/1 1 0 1 /1 1 1 1 /1 1 1 1 /1 1 1 0 /1 1 0 0 /1 0 1 1 0 /0 1 0 0 1 /1 0 0 1 1 /0 1 1 1 1 /5 4 6 . 5 /3 . 40 12 . /. 10 . . 2 /8 . . 3 . /. 3 20 . . /5 4 3 2 1 /3 1 2 4 5 /1 5 4 3 2 /4 2 5 1 3 /2 3 1 5 4 /"]
		],
		fillmat : [
			["十字の交差点があります。","pzprv3/fillmat/5/5/3 . . 3 . /. . . . . /. . 1 . . /. . . . . /. 1 . . 4 /0 1 0 0 /0 1 0 0 /0 1 0 0 /0 1 0 0 /0 1 0 0 /0 0 0 0 0 /1 1 1 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			["隣り合うタタミの大きさが同じです。","pzprv3/fillmat/5/5/3 . . 3 . /. . . . . /. . 1 . . /. . . . . /. 1 . . 4 /0 0 1 1 /0 0 1 1 /0 0 1 1 /0 0 0 0 /0 0 0 0 /1 1 1 0 0 /0 0 0 0 0 /0 0 0 1 0 /0 0 0 0 0 /"],
			["「幅１マス、長さ１～４マス」ではないタタミがあります。","pzprv3/fillmat/5/5/3 . . 3 . /. . . . . /. . 1 . . /. . . . . /. 1 . . 4 /1 0 0 0 /1 0 0 0 /1 0 0 0 /1 0 0 0 /1 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			["1つのタタミに2つ以上の数字が入っています。","pzprv3/fillmat/5/5/3 . . 3 . /. . . . . /. . 1 . . /. . . . . /. 1 . . 4 /0 0 0 1 /0 0 1 0 /1 0 0 0 /0 1 0 0 /0 0 0 1 /1 1 1 1 1 /1 1 1 1 1 /1 1 1 1 1 /1 1 1 1 1 /"],
			["数字とタタミの大きさが違います。","pzprv3/fillmat/5/5/3 . . 3 . /. . . . . /. . 1 . . /. . . . . /. 1 . . 4 /0 1 0 0 /0 0 0 1 /0 -1 2 -1 /1 0 -1 -1 /-1 -1 2 0 /1 1 1 1 1 /1 1 1 1 1 /1 1 1 1 1 /1 1 1 1 1 /"],
			["","pzprv3/fillmat/5/5/3 . . 3 . /. . . . . /. . 1 . . /. . . . . /. 1 . . 4 /1 1 0 0 /1 1 0 1 /1 1 1 1 /1 1 1 1 /1 1 1 1 /0 -1 1 1 1 /0 -1 1 1 -1 /1 -1 1 -1 -1 /0 1 -1 0 -1 /"]
		],
		fillomino : [
			["数字が含まれていないブロックがあります。","pzprv3/fillomino/6/6/. . 4 . . . /. 5 3 . 2 . /. . . . 5 2 /3 3 . . . . /. 2 . 1 4 . /. . . 3 . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /0 0 0 1 0 /0 0 0 0 1 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 1 0 /0 0 0 0 0 1 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /"],
			["ブロックの大きさより数字のほうが大きいです。","pzprv3/fillomino/6/6/. . 4 . . . /. 5 3 . 2 . /. . . . 5 2 /3 3 . . . . /. 2 . 1 4 . /. . . 3 . . /. . . . . . /. . . . . . /. . . . . . /. . . . 5 . /. . . . . . /. . . . . . /0 0 0 0 0 /0 0 0 0 0 /0 0 0 1 1 /0 0 0 1 1 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 1 0 /0 0 0 0 0 0 /0 0 0 0 1 0 /0 0 0 0 0 0 /"],
			["同じ数字のブロックが辺を共有しています。","pzprv3/fillomino/6/6/. . 4 . . . /. 5 3 . 2 . /. . . . 5 2 /3 3 . . . . /. 2 . 1 4 . /. . . 3 . . /. . . . . . /. . . . . . /. 3 3 3 . . /. . . . 5 . /. . . . . . /. . . . . . /0 0 0 0 0 /0 1 1 0 0 /1 1 0 1 1 /0 1 0 0 1 /0 0 0 0 0 /0 0 0 0 0 /0 0 1 0 0 0 /0 1 0 1 1 0 /1 0 1 1 0 0 /1 1 0 0 1 0 /0 0 0 0 0 0 /"],
			["ブロックの大きさよりも数字が小さいです。","pzprv3/fillomino/6/6/. . 4 . . . /. 5 3 . 2 . /. . . . 5 2 /3 3 . . . . /. 2 . 1 4 . /. . . 3 . . /. . . . . . /. . . . . . /. . 3 3 . . /. . 5 5 5 . /. . 5 . . . /. . 5 . . . /0 0 0 0 0 /0 1 1 0 0 /0 1 0 1 1 /0 1 0 0 1 /1 1 1 0 0 /0 1 1 0 0 /0 0 1 0 0 0 /0 0 0 1 1 0 /1 1 1 1 0 0 /0 1 0 1 1 0 /1 0 0 0 0 0 /"],
			["複数種類の数字が入っているブロックがあります。","pzprv3/fillomino/6/6/. . 4 . . . /. 5 3 . 2 . /. . . . 5 2 /3 3 . . . . /. 2 . 1 4 . /. . . 3 . . /. . . . . . /. . . . . . /. . 3 3 . . /. . 5 5 5 . /. . 5 . . . /1 . . . . . /0 0 0 0 0 /0 1 1 0 0 /0 1 0 1 1 /0 1 0 0 1 /1 1 1 0 0 /1 0 0 0 0 /0 0 1 0 0 0 /0 0 0 1 1 0 /1 1 1 1 0 0 /0 1 0 1 1 0 /0 0 1 0 0 0 /"],
			["ブロックの大きさより数字のほうが大きいです。","pzprv3/fillomino/6/6/. . 4 . . . /. 5 3 . 2 . /. . . . 5 2 /3 3 . . . . /. 2 . 1 4 . /. . . 3 . . /. . . . . . /. . . . . 1 /. . 3 3 . . /. . 5 5 5 . /3 . 5 . . . /1 2 3 . . . /0 1 0 0 0 /0 1 1 0 1 /0 1 0 1 1 /0 1 0 0 1 /1 1 1 1 0 /1 1 0 0 1 /0 0 1 1 1 1 /0 0 0 1 1 1 /1 1 1 1 0 0 /0 1 0 1 1 1 /1 0 1 1 1 0 /"],
			["数字の入っていないマスがあります。","pzprv3/fillomino/6/6/. . 4 . . . /. 5 3 . 2 . /. . . . 5 2 /3 3 . . . . /. 2 . 1 4 . /. . . 3 . . /. . . . . . /. . . . . 1 /. . 3 3 . . /. . 5 5 5 2 /2 . 5 . . . /1 3 3 . 4 . /0 1 0 0 0 /0 1 1 0 1 /1 1 0 1 1 /0 1 0 0 1 /0 1 1 1 0 /1 0 0 1 0 /0 0 1 1 1 1 /1 0 0 1 1 1 /0 1 1 1 0 0 /1 1 0 1 1 1 /1 1 1 1 0 0 /"],
			["","pzprv3/fillomino/6/6/. . 4 . . . /. 5 3 . 2 . /. . . . 5 2 /3 3 . . . . /. 2 . 1 4 . /. . . 3 . . /5 5 . 4 4 4 /5 . . 2 . 1 /3 5 3 3 . . /. . 5 5 5 2 /2 . 5 . . 4 /1 3 3 . 4 4 /0 1 0 0 0 /0 1 1 0 1 /1 1 0 1 1 /0 1 0 0 1 /0 1 1 1 0 /1 0 0 1 0 /0 0 1 1 1 1 /1 0 0 1 1 1 /0 1 1 1 0 0 /1 1 0 1 1 1 /1 1 1 1 0 0 /"]
		],
		firefly : [
			["分岐している線があります。","pzprv3/firefly/5/5/4,0 . . . 2,1 /. 3,- . 3,0 . /. . . . . /. 1,0 . 2,2 . /1,1 . . . 1,1 /1 1 1 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 1 0 0 /0 0 1 0 0 /0 0 1 0 0 /0 0 0 0 0 /"],
			["線が交差しています。","pzprv3/firefly/5/5/4,0 . . . 2,1 /. 3,- . 3,0 . /. . . . . /. 1,0 . 2,2 . /1,1 . . . 1,1 /1 1 0 0 /0 0 0 0 /0 1 1 0 /0 0 0 0 /0 0 0 0 /0 0 1 0 0 /0 0 1 1 0 /0 1 1 0 0 /0 0 0 0 0 /"],
			["黒点同士が線で繋がっています。","pzprv3/firefly/5/5/4,0 . . . 2,1 /. 3,- . 3,0 . /. . . . . /. 1,0 . 2,2 . /1,1 . . . 1,1 /1 0 0 0 /0 0 1 0 /0 1 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 1 0 0 /0 1 0 0 0 /0 0 0 0 0 /"],
			["線の曲がった回数が数字と違っています。","pzprv3/firefly/5/5/4,0 . . . 2,1 /. 3,- . 3,0 . /. . . . . /. 1,0 . 2,2 . /1,1 . . . 1,1 /1 1 1 1 /0 1 0 0 /0 1 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 1 0 0 /0 1 0 0 0 /0 0 0 0 0 /"],
			["線が途中で途切れています。","pzprv3/firefly/5/5/4,0 . . . 2,1 /. 3,- . 3,0 . /. . . . . /. 1,0 . 2,2 . /1,1 . . . 1,1 /1 1 1 1 /0 0 0 0 /0 1 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 1 0 0 /0 1 0 0 0 /0 0 0 0 0 /"],
			["線が全体で一つながりになっていません。","pzprv3/firefly/5/5/4,0 . . . 2,1 /. 3,- . 3,0 . /. . . . . /. 1,0 . 2,2 . /1,1 . . . 1,1 /1 1 1 1 /1 1 1 1 /0 0 0 0 /1 0 0 1 /0 1 1 0 /1 0 0 0 1 /0 0 0 0 0 /0 0 0 0 0 /1 1 0 1 1 /"],
			["線が途中で途切れています。","pzprv3/firefly/5/5/4,0 . . . 2,1 /. 3,- . 3,0 . /. . . . . /. 1,0 . 2,2 . /1,1 . . . 1,1 /1 1 1 1 /1 1 1 1 /0 0 0 0 /1 0 0 1 /0 1 1 0 /1 0 0 0 1 /0 0 0 0 0 /0 1 0 0 0 /1 1 0 1 1 /"],
			["ホタルから線が出ていません。","pzprv3/firefly/5/5/4,0 . . . 2,1 /. 3,- . 3,0 . /. . . . . /. 1,0 . 2,2 . /1,1 . . . 1,1 /1 1 1 1 /1 1 1 1 /0 0 0 0 /0 0 0 1 /0 1 1 0 /1 0 0 0 1 /0 1 0 0 0 /0 1 0 0 0 /0 1 0 1 1 /"],
			["白丸の、黒点でない部分どうしがくっついています。","pzprv3/firefly/5/5/4,0 . . . 2,1 /. 3,- . 3,0 . /. . . . . /. 1,0 . 2,2 . /1,1 . . . 1,1 /1 1 1 1 /1 1 1 1 /0 0 0 0 /1 0 0 1 /0 1 1 0 /1 0 0 0 1 /0 1 0 1 0 /0 1 0 1 0 /1 1 0 1 1 /"],
			["","pzprv3/firefly/5/5/4,0 . . . 2,1 /. 3,- . 3,0 . /. . . . . /. 1,0 . 2,2 . /1,1 . . . 1,1 /1 1 1 1 /1 1 1 1 /-1 -1 -1 -1 /1 0 0 1 /0 1 1 0 /1 -1 -1 -1 1 /0 1 0 0 -1 /0 1 0 0 -1 /1 1 0 1 1 /"]
		],
		fourcells : [
			["サイズが4マスより小さいブロックがあります。","pzprv3/fourcells/6/6/. . 1 . . . /. 2 . 3 . . /. . . 3 . . /. . 1 . . . /. . . 2 . . /2 . 3 . . 2 /1 0 0 0 0 /1 0 0 1 1 /0 0 0 1 1 /0 0 0 0 0 /1 0 1 0 0 /0 0 0 0 0 /0 0 0 0 1 0 /1 0 0 0 0 0 /0 0 0 0 1 0 /0 1 1 0 0 0 /0 1 1 0 0 0 /"],
			["数字の周りにある境界線の本数が違います。","pzprv3/fourcells/6/6/. . 1 . . . /. 2 . 3 . . /. . . 3 . . /. . 1 . . . /. . . 2 . . /2 . 3 . . 2 /1 -1 -1 1 0 /-1 1 1 0 0 /1 1 0 0 0 /0 0 1 0 0 /1 0 0 0 0 /-1 0 1 0 0 /-1 1 -1 1 0 0 /1 -1 1 0 0 0 /-1 1 1 0 0 0 /1 1 1 0 0 0 /-1 1 1 0 0 0 /"],
			["途中で途切れている線があります。","pzprv3/fourcells/6/6/. . 1 . . . /. 2 . 3 . . /. . . 3 . . /. . 1 . . . /. . . 2 . . /2 . 3 . . 2 /1 -1 -1 1 0 /-1 1 1 0 0 /1 1 1 0 0 /0 1 0 1 0 /1 1 1 0 0 /-1 0 1 0 0 /-1 1 -1 1 0 0 /1 -1 1 1 1 0 /-1 1 0 1 0 0 /1 0 0 1 0 0 /-1 1 1 0 0 0 /"],
			["サイズが4マスより大きいブロックがあります。","pzprv3/fourcells/6/6/. . 1 . . . /. 2 . 3 . . /. . . 3 . . /. . 1 . . . /. . . 2 . . /2 . 3 . . 2 /1 -1 -1 1 0 /-1 1 1 0 1 /1 1 1 0 0 /0 1 0 1 0 /1 1 1 0 0 /-1 0 1 0 0 /-1 1 -1 1 0 1 /1 -1 1 1 1 0 /-1 1 0 1 0 0 /1 0 0 1 0 0 /-1 1 1 0 0 0 /"],
			["","pzprv3/fourcells/6/6/. . 1 . . . /. 2 . 3 . . /. . . 3 . . /. . 1 . . . /. . . 2 . . /2 . 3 . . 2 /1 -1 -1 1 0 /-1 1 1 0 1 /1 1 1 0 0 /0 1 0 1 1 /1 1 1 -1 1 /-1 0 1 1 0 /-1 1 -1 1 0 1 /1 -1 1 1 1 0 /-1 1 0 1 1 1 /1 0 0 1 0 0 /-1 1 1 -1 1 0 /"]
		],
		goishi : [
			["拾われていない碁石があります。","pzprv3/goishi/7/6/. . . . . . /. . 0 0 . . /. 5 . 4 . . /. 0 . 3 . . /. 0 0 2 1 . /. . . 0 . . /. . . . . . /"],
			["","pzprv3/goishi/7/6/. . . . . . /. . 9 10 . . /. 5 . 4 . . /. 6 . 3 . . /. 7 8 2 1 . /. . . 11 . . /. . . . . . /"]
		],
		gokigen : [
			["斜線で輪っかができています。","pzprv3/gokigen/4/4/. . . 0 . /. 4 . . . /2 . . . 2 /. . . . . /. 1 . 0 . /. 2 1 . /2 . . 1 /1 . . 2 /. 1 2 . /"],
			["数字に繋がる線の数が間違っています。","pzprv3/gokigen/4/4/. . . 0 . /. 4 . . . /2 . . . 2 /. . . . . /. 1 . 0 . /. 2 1 . /2 . . 1 /1 . . 2 /. . 2 . /"],
			["斜線がないマスがあります。","pzprv3/gokigen/4/4/. . . 0 . /. 4 . . . /2 . . . 2 /. . . . . /. 1 . 0 . /1 2 1 2 /2 1 . 1 /1 . . 2 /. 2 2 1 /"],
			["","pzprv3/gokigen/4/4/. . . 0 . /. 4 . . . /2 . . . 2 /. . . . . /. 1 . 0 . /1 2 1 2 /2 1 1 1 /1 1 2 2 /2 2 2 1 /"]
		],
		hakoiri : [
			["同じ記号がタテヨコナナメに隣接しています。","pzprv3/hakoiri/5/5/4/0 0 0 1 1 /0 0 2 1 1 /3 2 2 2 1 /3 3 2 3 3 /3 3 3 3 3 /1 . . . 3 /. . . 1 . /. . . . . /2 3 . 2 . /. 1 . . 1 /. . . . . /. 1 2 . . /+ . . 3 . /. . . . . /+ . . . . /"],
			["1つのハコに4つ以上の記号が入っています。","pzprv3/hakoiri/5/5/4/0 0 0 1 1 /0 0 2 1 1 /3 2 2 2 1 /3 3 2 3 3 /3 3 3 3 3 /1 . . . 3 /. . . 1 . /. . . . . /2 3 . 2 . /. 1 . . 1 /. . . . . /. . 2 . . /+ . . 3 . /. . . . . /+ . . . . /"],
			["1つのハコに同じ記号が複数入っています。","pzprv3/hakoiri/5/5/4/0 0 0 1 1 /0 0 0 1 1 /2 0 0 0 1 /2 2 0 3 3 /2 2 3 3 3 /1 . . . 3 /. . . 1 . /. . . . . /2 3 . 2 . /. 1 . . 1 /. . . . . /. . . . . /+ 1 . 3 . /. . . . . /+ . . . . /"],
			["タテヨコにつながっていない記号があります。","pzprv3/hakoiri/5/5/5/0 0 0 1 1 /0 0 2 1 1 /3 2 2 2 1 /3 3 2 4 4 /3 3 4 4 4 /1 . . . 3 /. . . 1 . /. . . . . /2 3 . 2 . /. 1 . . 1 /. . . . . /. . . . . /. . . . . /. . . . . /. . . . . /"],
			["1つのハコに2つ以下の記号しか入っていません。","pzprv3/hakoiri/5/5/5/0 0 0 1 1 /0 0 2 1 1 /3 2 2 2 1 /3 3 2 4 4 /3 3 4 4 4 /. . . . 3 /. . . 1 . /. . . . . /2 3 . 2 . /. 1 . . 1 /. + + . . /2 3 2 . 2 /+ 1 + 3 . /. . + . + /+ . + 3 . /"],
			["","pzprv3/hakoiri/5/5/5/0 0 0 1 1 /0 0 2 1 1 /3 2 2 2 1 /3 3 2 4 4 /3 3 4 4 4 /1 . . . 3 /. . . 1 . /. . . . . /2 3 . 2 . /. 1 . . 1 /. + + . . /2 3 2 . 2 /+ 1 + 3 . /. . + . + /+ . + 3 . /"]
		],
		hashikake : [
			["数字につながる橋の数が違います。","pzprv3/hashikake/5/5/4 . 2 . . /. 3 . . 2 /3 . . . . /. 3 . 1 . /3 . 4 . 3 /2 2 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /2 0 0 0 0 /2 0 0 0 0 /2 0 0 0 0 /2 0 0 0 0 /"],
			["線が全体で一つながりになっていません。","pzprv3/hashikake/5/5/4 . 2 . . /. 3 . . 2 /3 . . . . /. 3 . 1 . /3 . 4 . 3 /2 2 0 0 /0 1 1 1 /-1 0 0 0 /0 0 0 0 /0 0 0 0 /2 0 0 0 0 /2 1 0 0 0 /1 1 0 0 0 /1 0 0 0 0 /"],
			["数字につながる橋の数が違います。","pzprv3/hashikake/5/5/4 . 2 . . /. 3 . . 2 /3 . . . . /. 3 . 1 . /3 . 4 . 3 /2 2 0 0 /0 1 1 1 /-1 0 0 0 /0 1 1 0 /1 1 1 1 /2 0 0 0 0 /2 1 0 0 1 /1 1 0 0 1 /1 0 0 0 1 /"],
			["","pzprv3/hashikake/5/5/4 . 2 . . /. 3 . . 2 /3 . . . . /. 3 . 1 . /3 . 4 . 3 /2 2 0 0 /0 1 1 1 /-1 0 -1 -1 /0 1 1 -1 /2 2 2 2 /2 0 0 0 0 /2 2 0 0 1 /1 2 0 -1 1 /1 0 0 -1 1 /"]
		],
		heyawake : [
			["黒マスがタテヨコに連続しています。","pzprv3/heyawake/6/6/8/0 1 1 2 2 3 /0 1 1 2 2 3 /0 1 1 2 2 3 /4 4 4 4 4 3 /5 5 5 6 6 3 /5 5 5 6 6 7 /2 2 . 2 . 2 /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. # . . . . /. # . . . . /. . . . . . /. . . . . . /"],
			["白マスが分断されています。","pzprv3/heyawake/6/6/8/0 1 1 2 2 3 /0 1 1 2 2 3 /0 1 1 2 2 3 /4 4 4 4 4 3 /5 5 5 6 6 3 /5 5 5 6 6 7 /2 2 . 2 . 2 /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /# . # . . . /. . . # . . /# . # . . . /. # . . . . /. . . . . . /. . . . . . /"],
			["部屋の数字と黒マスの数が一致していません。","pzprv3/heyawake/6/6/8/0 1 1 2 2 3 /0 1 1 2 2 3 /0 1 1 2 2 3 /4 4 4 4 4 3 /5 5 5 6 6 3 /5 5 5 6 6 7 /2 2 . 2 . 2 /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /# . . . . . /. . . # . . /# . # . # . /. # . . . . /. . . . . . /. . . . . . /"],
			["白マスが3部屋連続で続いています。","pzprv3/heyawake/6/6/8/0 1 1 2 2 3 /0 1 1 2 2 3 /0 1 1 2 2 3 /4 4 4 4 4 3 /5 5 5 6 6 3 /5 5 5 6 6 7 /2 2 . 2 . 2 /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /# + # + + # /+ + + # + + /# + # + # + /+ + + + + + /. # . # . # /. . . . . . /"],
			["四角形ではない部屋があります。","pzprv3/heyawake/6/6/7/0 1 1 2 2 3 /0 1 1 2 2 3 /0 1 1 2 2 3 /4 4 4 4 4 3 /5 5 5 6 6 3 /5 5 5 6 6 6 /2 2 . 2 . 2 /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /# + # + + # /+ + + # + + /# + # + # + /+ + + + + + /. # . # . # /. . . . . . /"],
			["","pzprv3/heyawake/6/6/8/0 1 1 2 2 3 /0 1 1 2 2 3 /0 1 1 2 2 3 /4 4 4 4 4 3 /5 5 5 6 6 3 /5 5 5 6 6 7 /2 2 . 2 . 2 /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /# + # + + # /+ + + # + + /# + # + # + /+ + + + + + /. # . # . # /. . # . . . /"]
		],
		hitori : [
			["黒マスがタテヨコに連続しています。","pzprv3/hitori/4/4/1 1 1 4 /1 4 2 3 /3 3 2 1 /4 2 1 3 /# . . . /# . . . /. . . . /. . . . /"],
			["白マスが分断されています。","pzprv3/hitori/4/4/1 1 1 4 /1 4 2 3 /3 3 2 1 /4 2 1 3 /# . . . /. . . # /# . # . /. # . . /"],
			["同じ列に同じ数字が入っています。","pzprv3/hitori/4/4/1 1 1 4 /1 4 2 3 /3 3 2 1 /4 2 1 3 /# . . . /. . . . /# . # . /. . . # /"],
			["","pzprv3/hitori/4/4/1 1 1 4 /1 4 2 3 /3 3 2 1 /4 2 1 3 /# + # . /+ + + . /# + # . /+ + + # /"]
		],
		icebarn : [
			["分岐している線があります。","pzprv3/icebarn/8/8/115/123/0 0 1 1 1 0 0 0 /1 1 0 1 0 1 1 1 /1 1 0 1 0 1 1 1 /1 1 0 1 0 0 0 0 /0 0 0 0 0 1 0 1 /1 1 0 0 0 1 1 1 /1 1 0 1 0 1 1 1 /0 0 1 1 1 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 1 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 2 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 2 0 0 0 0 /2 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 /0 0 0 0 0 0 1 0 /0 0 0 0 0 0 0 0 /0 2 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 1 /0 0 0 2 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 1 1 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 1 0 0 0 0 /0 0 0 1 0 0 0 0 /0 0 0 1 0 0 0 0 /0 0 0 1 0 0 0 0 /0 0 0 1 0 0 0 0 /0 1 0 1 0 0 0 0 /0 1 0 0 0 0 0 0 /0 1 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 /"],
			["氷の部分以外で線が交差しています。","pzprv3/icebarn/8/8/115/123/0 0 1 1 1 0 0 0 /1 1 0 1 0 1 1 1 /1 1 0 1 0 1 1 1 /1 1 0 1 0 0 0 0 /0 0 0 0 0 1 0 1 /1 1 0 0 0 1 1 1 /1 1 0 1 0 1 1 1 /0 0 1 1 1 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 1 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 2 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 2 0 0 0 0 /2 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 /0 0 0 0 0 0 1 0 /0 0 0 0 0 0 0 0 /0 2 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 1 /0 0 0 2 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 1 1 1 1 1 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 1 0 0 0 0 /0 0 0 1 0 0 1 0 /0 0 0 1 0 0 1 0 /0 0 0 1 0 0 1 0 /0 0 0 1 0 0 1 0 /0 1 0 1 0 0 0 0 /0 1 0 0 0 0 0 0 /0 1 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 /"],
			["氷の部分で線が曲がっています。","pzprv3/icebarn/8/8/115/123/0 0 1 1 1 0 0 0 /1 1 0 1 0 1 1 1 /1 1 0 1 0 1 1 1 /1 1 0 1 0 0 0 0 /0 0 0 0 0 1 0 1 /1 1 0 0 0 1 1 1 /1 1 0 1 0 1 1 1 /0 0 1 1 1 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 1 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 2 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 2 0 0 0 0 /2 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 /0 0 0 0 0 0 1 0 /0 0 0 0 0 0 0 0 /0 2 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 1 /0 0 0 2 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 1 0 0 /0 0 0 0 1 1 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 1 0 0 0 0 /0 0 0 1 0 0 1 0 /0 0 0 1 0 0 1 0 /0 0 0 1 0 0 1 0 /0 0 0 1 0 1 0 0 /0 1 0 0 0 0 0 0 /0 1 0 0 0 0 0 0 /0 1 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 /"],
			["INに線が通っていません。","pzprv3/icebarn/8/8/115/123/0 0 1 1 1 0 0 0 /1 1 0 1 0 1 1 1 /1 1 0 1 0 1 1 1 /1 1 0 1 0 0 0 0 /0 0 0 0 0 1 0 1 /1 1 0 0 0 1 1 1 /1 1 0 1 0 1 1 1 /0 0 1 1 1 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 1 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 2 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 2 0 0 0 0 /2 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 /0 0 0 0 0 0 1 0 /0 0 0 0 0 0 0 0 /0 2 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 1 /0 0 0 2 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 1 1 1 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 /0 0 0 0 0 0 1 0 /0 0 0 0 0 0 1 0 /0 0 0 0 0 0 1 0 /0 0 0 0 0 0 1 0 /0 1 0 0 0 0 0 0 /0 1 0 0 0 0 0 0 /0 1 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 /"],
			["途中で途切れている線があります。","pzprv3/icebarn/8/8/115/123/0 0 1 1 1 0 0 0 /1 1 0 1 0 1 1 1 /1 1 0 1 0 1 1 1 /1 1 0 1 0 0 0 0 /0 0 0 0 0 1 0 1 /1 1 0 0 0 1 1 1 /1 1 0 1 0 1 1 1 /0 0 1 1 1 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 1 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 2 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 2 0 0 0 0 /2 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 /0 0 0 0 0 0 1 0 /0 0 0 0 0 0 0 0 /0 2 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 1 /0 0 0 2 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 1 1 1 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 1 0 0 0 0 /0 0 0 1 0 0 1 0 /0 0 0 1 0 0 1 0 /0 0 0 1 0 0 1 0 /0 0 0 1 0 0 1 0 /0 1 0 0 0 0 0 0 /0 1 0 0 0 0 0 0 /0 1 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 /"],
			["盤面の外に出てしまった線があります。","pzprv3/icebarn/8/8/115/123/0 0 1 1 1 0 0 0 /1 1 0 1 0 1 1 1 /1 1 0 1 0 1 1 1 /1 1 0 1 0 0 0 0 /0 0 0 0 0 1 0 1 /1 1 0 0 0 1 1 1 /1 1 0 1 0 1 1 1 /0 0 1 1 1 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 1 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 2 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 2 0 0 0 0 /2 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 /0 0 0 0 0 0 1 0 /0 0 0 0 0 0 0 0 /0 2 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 1 /0 0 0 2 0 0 0 0 /0 0 0 0 0 0 0 1 1 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 1 1 1 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 1 0 0 0 0 /0 0 0 1 0 0 1 0 /0 0 0 1 0 0 1 0 /0 0 0 1 0 0 1 0 /0 0 0 1 0 0 1 0 /0 1 0 0 0 0 0 0 /0 1 0 0 0 0 0 0 /0 1 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 /"],
			["矢印を逆に通っています。","pzprv3/icebarn/8/8/115/123/0 0 1 1 1 0 0 0 /1 1 0 1 0 1 1 1 /1 1 0 1 0 1 1 1 /1 1 0 1 0 0 0 0 /0 0 0 0 0 1 0 1 /1 1 0 0 0 1 1 1 /1 1 0 1 0 1 1 1 /0 0 1 1 1 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 1 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 2 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 2 0 0 0 0 /2 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 /0 0 0 0 0 0 1 0 /0 0 0 0 0 0 0 0 /0 2 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 1 /0 0 0 2 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 1 1 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 1 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 1 0 0 0 0 /0 0 0 1 0 0 0 0 /0 0 0 1 0 0 0 0 /0 0 1 1 1 0 0 0 /0 0 1 1 1 0 0 0 /0 1 0 0 0 0 0 0 /0 1 0 0 0 0 0 0 /0 1 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 /"],
			["線がひとつながりではありません。","pzprv3/icebarn/8/8/115/123/0 0 1 1 1 0 0 0 /1 1 0 1 0 1 1 1 /1 1 0 1 0 1 1 1 /1 1 0 1 0 0 0 0 /0 0 0 0 0 1 0 1 /1 1 0 0 0 1 1 1 /1 1 0 1 0 1 1 1 /0 0 1 1 1 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 1 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 2 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 2 0 0 0 0 /2 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 /0 0 0 0 0 0 1 0 /0 0 0 0 0 0 0 0 /0 2 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 1 /0 0 0 2 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 -1 -1 -1 0 /0 0 0 1 1 -1 -1 -1 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 1 0 0 0 0 /0 0 0 -1 1 -1 -1 -1 0 /0 0 0 1 1 -1 -1 -1 0 /0 0 1 1 1 1 0 1 0 /0 0 0 1 0 0 0 0 /0 0 0 1 0 0 0 0 /0 0 0 1 0 0 0 0 /0 0 1 1 1 0 0 0 /0 0 1 1 1 0 0 1 /0 1 1 -1 0 0 0 1 /0 1 1 1 1 0 0 1 /0 1 0 1 0 0 0 1 /0 0 0 1 0 0 0 0 /"],
			["すべてのアイスバーンを通っていません。","pzprv3/icebarn/8/8/115/123/0 0 1 1 1 0 0 0 /1 1 0 1 0 1 1 1 /1 1 0 1 0 1 1 1 /1 1 0 1 0 0 0 0 /0 0 0 0 0 1 0 1 /1 0 0 0 0 1 1 1 /1 0 0 1 0 1 1 1 /0 0 1 1 1 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 1 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 2 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 2 0 0 0 0 /2 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 /0 0 0 0 0 0 1 0 /0 0 0 0 0 0 0 0 /0 2 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 1 /0 0 0 2 0 0 0 0 /0 1 1 1 1 1 1 0 0 /0 0 0 0 0 -1 -1 -1 0 /0 0 0 1 1 -1 -1 -1 0 /0 0 0 0 0 1 0 1 0 /0 1 0 0 1 1 1 0 0 /0 0 0 -1 1 -1 -1 -1 0 /0 0 0 1 1 -1 -1 -1 0 /0 0 1 1 1 1 0 1 0 /0 0 0 1 0 0 0 0 /1 0 0 1 0 0 1 0 /1 0 0 1 0 0 1 0 /1 0 1 1 1 0 1 0 /1 0 1 1 0 1 0 1 /0 1 1 -1 0 1 1 1 /0 1 1 1 1 1 1 1 /0 1 0 1 0 1 1 1 /0 0 0 1 0 0 0 0 /"],
			["線が通っていない矢印があります。","pzprv3/icebarn/8/8/115/123/0 0 1 1 1 0 0 0 /1 1 0 1 0 1 1 1 /1 1 0 1 0 1 1 1 /1 1 0 1 0 0 0 0 /0 0 0 0 0 1 0 1 /1 1 0 0 0 1 1 1 /1 1 0 1 0 1 1 1 /0 0 1 1 1 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 1 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 2 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 2 0 0 0 0 /2 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 /0 0 0 0 0 0 1 0 /0 0 0 0 0 0 0 0 /0 2 0 0 0 0 0 0 /2 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 1 /0 0 0 2 0 0 0 0 /0 1 1 1 1 1 1 0 0 /0 0 0 0 0 -1 -1 -1 0 /0 0 0 1 1 -1 -1 -1 0 /0 0 0 0 0 1 0 1 0 /0 1 0 0 1 1 1 0 0 /0 0 0 -1 1 -1 -1 -1 0 /0 0 0 1 1 -1 -1 -1 0 /0 0 1 1 1 1 0 1 0 /0 0 0 1 0 0 0 0 /1 0 0 1 0 0 1 0 /1 0 0 1 0 0 1 0 /1 0 1 1 1 0 1 0 /1 0 1 1 0 1 0 1 /0 1 1 -1 0 1 1 1 /0 1 1 1 1 1 1 1 /0 1 0 1 0 1 1 1 /0 0 0 1 0 0 0 0 /"],
			["","pzprv3/icebarn/8/8/115/123/0 0 1 1 1 0 0 0 /1 1 0 1 0 1 1 1 /1 1 0 1 0 1 1 1 /1 1 0 1 0 0 0 0 /0 0 0 0 0 1 0 1 /1 1 0 0 0 1 1 1 /1 1 0 1 0 1 1 1 /0 0 1 1 1 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 1 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 2 0 0 0 0 0 /0 0 0 0 0 0 0 0 0 /0 0 0 2 0 0 0 0 /2 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 /0 0 0 0 0 0 1 0 /0 0 0 0 0 0 0 0 /0 2 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 1 /0 0 0 2 0 0 0 0 /0 1 1 1 1 1 1 0 0 /0 0 0 0 0 -1 -1 -1 0 /0 0 0 1 1 -1 -1 -1 0 /0 0 0 0 0 1 0 1 0 /0 1 0 0 1 1 1 0 0 /0 0 0 -1 1 -1 -1 -1 0 /0 0 0 1 1 -1 -1 -1 0 /0 0 1 1 1 1 0 1 0 /0 0 0 1 0 0 0 0 /1 0 0 1 0 0 1 0 /1 0 0 1 0 0 1 0 /1 0 1 1 1 0 1 0 /1 0 1 1 0 1 0 1 /0 1 1 -1 0 1 1 1 /0 1 1 1 1 1 1 1 /0 1 0 1 0 1 1 1 /0 0 0 1 0 0 0 0 /"]
		],
		icelom : [
			["分岐している線があります。","pzprv3/icelom/6/6/75/64/allwhite/. i . 3 i . /i i i . . . /i . i . . . /. . . i . i /. i . i i i /2 . 1 . i . /0 1 1 0 0 0 0 /0 0 0 0 0 0 0 /0 0 0 0 0 0 0 /1 1 0 0 0 0 0 /0 0 0 0 0 0 0 /0 0 0 0 0 0 0 /0 0 0 0 0 0 /1 0 0 0 0 0 /1 0 0 0 0 0 /1 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /"],
			["氷の部分以外で線が交差しています。","pzprv3/icelom/6/6/75/64/allwhite/. i . 3 i . /i i i . . . /i . i . . . /. . . i . i /. i . i i i /2 . 1 . i . /0 1 1 0 0 0 0 /0 0 0 0 0 0 0 /0 0 0 0 0 0 0 /1 1 0 0 0 0 0 /0 0 0 0 0 0 0 /0 1 0 0 0 0 0 /0 0 0 0 0 0 /1 0 0 0 0 0 /1 0 0 0 0 0 /1 0 0 0 0 0 /1 0 0 0 0 0 /1 0 0 0 0 0 /0 0 0 0 0 0 /"],
			["氷の部分で線が曲がっています。","pzprv3/icelom/6/6/75/64/allwhite/. i . 3 i . /i i i . . . /i . i . . . /. . . i . i /. i . i i i /2 . 1 . i . /0 0 0 0 1 1 0 /0 1 1 1 0 0 0 /0 0 0 0 0 0 0 /1 0 0 0 0 0 0 /0 0 0 0 0 0 0 /0 0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 1 0 0 /1 0 0 0 0 0 /1 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /"],
			["INに線が通っていません。","pzprv3/icelom/6/6/75/64/allwhite/. i . 3 i . /i i i . . . /i . i . . . /. . . i . i /. i . i i i /2 . 1 . i . /0 1 1 0 0 0 0 /0 0 0 0 0 0 0 /0 0 0 0 0 0 0 /0 0 0 0 0 0 0 /0 0 0 0 0 0 0 /0 0 0 0 0 0 0 /0 0 0 0 0 0 /1 0 0 0 0 0 /1 0 0 0 0 0 /1 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /"],
			["途中で途切れている線があります。","pzprv3/icelom/6/6/75/64/allwhite/. i . 3 i . /i i i . . . /i . i . . . /. . . i . i /. i . i i i /2 . 1 . i . /0 1 1 0 0 0 0 /0 0 0 0 0 0 0 /0 0 0 0 0 0 0 /1 0 0 0 0 0 0 /0 0 0 0 0 0 0 /0 0 0 0 0 0 0 /0 0 0 0 0 0 /1 0 0 0 0 0 /1 0 0 0 0 0 /1 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /"],
			["盤面の外に出てしまった線があります。","pzprv3/icelom/6/6/75/64/allwhite/. i . 3 i . /i i i . . . /i . i . . . /. . . i . i /. i . i i i /2 . 1 . i . /0 1 1 -1 1 1 0 /0 0 0 0 0 0 0 /0 0 0 0 0 1 1 /1 0 0 1 1 0 0 /0 1 1 0 0 0 0 /0 1 0 0 0 0 0 /0 0 0 0 1 0 /1 0 1 1 1 1 /1 0 1 0 0 0 /1 0 1 0 1 0 /0 0 0 0 0 0 /1 0 0 0 0 0 /0 0 0 0 0 0 /"],
			["数字の通過順が間違っています。","pzprv3/icelom/6/6/75/64/allwhite/. i . 3 i . /i i i . . . /i . i . . . /. . . i . i /. i . i i i /2 . 1 . i . /0 1 1 -1 1 1 0 /0 0 0 0 0 0 0 /0 0 1 1 1 0 0 /1 0 0 1 1 0 0 /0 1 1 0 0 0 0 /0 1 0 0 0 0 0 /0 0 0 0 1 0 /1 0 1 1 1 1 /1 0 1 0 0 0 /1 1 1 0 1 0 /0 1 0 0 0 0 /1 1 0 0 0 0 /0 0 0 0 0 0 /"],
			["線がひとつながりではありません。","pzprv3/icelom/6/6/75/64/allwhite/. i . 3 i . /i i i . . . /i . i . . . /. . . i . i /. i . i i i /2 . 1 . i . /0 1 1 -1 0 0 0 /0 0 0 0 1 0 0 /0 0 1 1 -1 1 0 /1 0 0 1 1 0 0 /0 1 1 0 0 0 0 /0 1 -1 1 1 1 0 /0 0 0 0 1 0 /1 0 1 0 1 1 /1 0 1 1 -1 0 /1 1 1 0 1 1 /0 1 0 0 0 1 /1 1 1 0 0 1 /0 0 0 0 0 0 /"],
			["通過していない白マスがあります。","pzprv3/icelom/6/6/75/64/allwhite/. i . 3 i . /i i i . . . /i . i . . . /. . . i . i /. i . i i i /2 . 1 . i . /0 1 1 -1 0 0 0 /0 0 0 0 1 0 0 /0 0 1 1 -1 1 0 /1 0 0 1 1 0 0 /0 1 1 0 0 0 0 /0 1 -1 1 1 1 0 /0 0 0 0 1 0 /1 0 1 0 1 0 /1 0 1 1 -1 0 /1 1 1 0 1 1 /0 1 0 0 0 1 /1 1 1 0 0 1 /0 0 0 0 0 0 /"],
			["通過していない数字があります。","pzprv3/icelom/6/6/75/64/allwhite/. i . 3 i . /i i i . . . /i . i . . . /. . . i . i /. i . i4 i i /2 . 1 . i . /0 1 1 -1 1 1 0 /0 0 0 0 0 1 0 /0 0 1 1 -1 1 0 /1 0 0 1 1 0 0 /0 1 1 0 0 0 0 /0 1 -1 1 1 1 0 /0 0 0 0 1 0 /1 0 1 1 1 1 /1 0 1 1 -1 0 /1 1 1 0 1 1 /0 1 0 0 0 1 /1 1 1 0 0 1 /0 0 0 0 0 0 /"],
			["","pzprv3/icelom/6/6/75/64/allwhite/. i . 3 i . /i i i . . . /i . i . . . /. . . i . i /. i . i i i /2 . 1 . i . /0 1 1 -1 1 1 0 /0 0 0 0 0 1 0 /0 0 1 1 -1 1 0 /1 0 0 1 1 0 0 /0 1 1 0 0 0 0 /0 1 -1 1 1 1 0 /0 0 0 0 1 0 /1 0 1 1 1 1 /1 0 1 1 -1 0 /1 1 1 0 1 1 /0 1 0 0 0 1 /1 1 1 0 0 1 /0 0 0 0 0 0 /"]
		],
		ichimaga : [
			["分岐している線があります。","pzprv3/ichimaga/5/5/mag/2 . 2 . . /. 4 . . . /1 . . 4 . /. . 1 . . /. 2 . . 2 /1 1 1 1 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 1 0 /0 0 0 1 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			["線が交差しています。","pzprv3/ichimaga/5/5/mag/2 . 2 . . /. 4 . . . /1 . . 4 . /. . 1 . . /. 2 . . 2 /1 1 1 0 /0 0 1 1 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 1 1 0 /0 0 0 1 1 /0 0 0 0 1 /0 0 0 0 1 /"],
			["同じ数字同士が線で繋がっています。","pzprv3/ichimaga/5/5/mag/2 . 2 . . /. 4 . . . /1 . . 4 . /. . 1 . . /. 2 . . 2 /0 0 0 0 /1 1 1 0 /0 1 1 1 /0 0 0 0 /0 0 0 1 /0 1 0 0 0 /0 1 0 1 0 /0 0 0 1 0 /0 0 0 1 0 /"],
			["線が2回以上曲がっています。","pzprv3/ichimaga/5/5/def/2 . 2 . . /. 4 . . . /1 . . 4 . /. . 1 . . /. 2 . . 2 /0 0 0 0 /1 0 1 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 1 0 0 0 /0 1 1 1 0 /0 0 1 0 0 /0 0 0 0 0 /"],
			["線が途中で途切れています。","pzprv3/ichimaga/5/5/def/2 . 2 . . /. 4 . . . /1 . . 4 . /. . 1 . . /. 2 . . 2 /0 0 0 0 /1 1 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 1 0 0 0 /0 1 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			["線が全体で一つながりになっていません。","pzprv3/ichimaga/5/5/def/2 . 2 . . /. 4 . . . /1 . . 4 . /. . 1 . . /. 2 . . 2 /0 0 0 0 /1 1 0 0 /0 0 1 1 /0 0 0 0 /0 0 0 0 /0 1 0 0 0 /0 1 0 1 0 /0 0 0 1 0 /0 0 0 0 0 /"],
			["","pzprv3/ichimaga/5/5/cross/2 . 2 . . /. 4 . . . /1 . . 4 . /. . 1 . . /. 2 . . 2 /1 0 1 0 /1 1 0 0 /1 1 1 1 /0 0 1 0 /0 1 1 1 /1 1 1 1 0 /0 1 0 1 0 /0 1 0 1 1 /0 1 0 0 1 /"],
			["○から出る線の本数が正しくありません。","pzprv3/ichimaga/5/5/cross/2 . 2 . . /. 4 . . . /1 . . 4 . /. . 1 . . /. 2 . . 2 /1 0 1 0 /1 1 0 0 /1 1 1 1 /0 0 1 0 /1 1 1 1 /1 1 1 1 0 /0 1 0 1 0 /1 1 0 1 1 /1 1 0 0 1 /"],
			["線が交差しています。","pzprv3/ichimaga/5/5/def/2 . 2 . . /. 4 . . . /1 . . 4 . /. . 1 . . /. 2 . . 2 /1 0 1 0 /1 1 0 0 /1 1 1 1 /0 0 1 0 /1 1 1 1 /1 1 1 1 0 /0 1 0 1 0 /0 1 0 1 1 /0 1 0 0 1 /"],
			["線が全体で一つながりになっていません。","pzprv3/ichimaga/5/5/def/2 . 2 . . /. 4 . . . /1 . . 4 . /. . 1 . . /. 2 . . 2 /1 0 1 0 /1 1 0 0 /0 0 0 1 /0 0 1 0 /1 1 1 1 /1 1 1 1 0 /0 1 0 1 0 /1 1 0 1 1 /0 1 0 0 1 /"],
			["線が途中で途切れています。","pzprv3/ichimaga/5/5/def/2 . 2 . . /. 4 . . . /1 . . 4 . /. . 1 . . /. 2 . . 2 /1 0 1 0 /1 1 0 0 /0 0 0 1 /0 0 1 0 /1 1 0 1 /1 1 1 1 0 /0 1 0 1 0 /1 1 0 1 1 /1 1 0 0 1 /"],
			["○から出る線の本数が正しくありません。","pzprv3/ichimaga/5/5/def/2 . 2 . . /. 4 . . . /1 . . 4 . /. . 1 . . /. 2 . . 2 /1 0 1 0 /1 1 0 0 /0 0 0 1 /0 0 1 0 /0 1 1 1 /1 1 1 1 0 /0 1 0 1 0 /0 1 0 1 1 /0 1 0 0 1 /"],
			["","pzprv3/ichimaga/5/5/def/2 . 2 . . /. 4 . . . /1 . . 4 . /. . 1 . . /. 2 . . 2 /1 0 1 -1 /1 1 0 -1 /-1 -1 1 1 /0 -1 -1 0 /1 0 0 1 /1 1 1 1 -1 /-1 1 -1 1 -1 /1 1 1 1 1 /1 1 -1 1 1 /"]
		],
		kaero : [
			["分岐している線があります。","pzprv3/kaero/3/3/2 3 2 /. . . /1 . 1 /. . . /. . . /. . . /0 1 /1 1 /0 1 /1 0 0 /0 1 0 /0 0 /1 1 /0 0 /1 0 0 /0 1 0 /"],
			["線が交差しています。","pzprv3/kaero/3/3/2 3 2 /. . . /1 . 1 /. . . /. . . /. . . /0 1 /1 1 /0 1 /1 0 0 /0 1 0 /0 0 /1 1 /0 0 /0 1 0 /0 1 0 /"],
			["アルファベットが繋がっています。","pzprv3/kaero/3/3/2 3 2 /. . . /1 . 1 /. . . /. . . /. . . /0 1 /1 1 /0 1 /1 0 0 /0 1 0 /0 0 /1 0 /0 0 /0 1 0 /1 0 0 /"],
			["アルファベットの上を線が通過しています。","pzprv3/kaero/3/3/2 3 2 /. . . /1 . 1 /. . . /. . . /. . . /0 1 /1 1 /0 1 /1 0 0 /0 1 0 /0 0 /1 0 /1 0 /0 0 0 /1 0 0 /"],
			["１つのブロックに異なるアルファベットが入っています。","pzprv3/kaero/3/3/2 3 2 /. . . /1 . 1 /. . . /. . . /. . . /0 1 /1 1 /0 1 /1 0 0 /0 1 0 /0 0 /0 0 /0 0 /0 0 0 /0 0 0 /"],
			["同じアルファベットが異なるブロックに入っています。","pzprv3/kaero/3/3/2 3 2 /. . . /1 . 1 /. . . /. . . /. . . /0 1 /1 1 /1 1 /1 0 0 /0 1 0 /0 0 /1 1 /0 1 /1 0 0 /0 0 0 /"],
			["アルファベットのないブロックがあります。","pzprv3/kaero/3/3/2 3 2 /. . . /1 . 1 /. . . /. . . /. . . /0 1 /1 1 /0 1 /1 0 0 /1 1 0 /0 0 /1 1 /0 1 /1 0 0 /0 0 0 /"],
			["アルファベットにつながっていない線があります。","pzprv3/kaero/3/3/2 3 2 /. . . /1 . 1 /. . . /. . . /. . . /1 1 /0 0 /0 0 /0 1 0 /1 1 1 /0 0 /0 1 /0 1 /1 0 0 /0 0 0 /"],
			["","pzprv3/kaero/3/3/2 3 2 /. . . /1 . 1 /+ - - /. . - /- - + /0 1 /1 1 /0 1 /1 0 0 /0 1 0 /0 0 /1 1 /0 1 /1 0 0 /0 0 0 /"]
		],
		kakuro : [
			["同じ数字が同じ列に入っています。","pzprv3/kakuro/5/5/0 0 12 4 0 0 /0 8,4 . . 0,10 0,0 /10 . . . . 0,10 /3 . . 3,17 . . /0 21,0 . . . . /0 0,0 12,0 . . 0,0 /. . . . . /2 . . . . /2 . . . . /. . . . . /. . . . . /"],
			["数字の下か右にある数字の合計が間違っています。","pzprv3/kakuro/5/5/0 0 12 4 0 0 /0 8,4 . . 0,10 0,0 /10 . . . . 0,10 /3 . . 3,17 . . /0 21,0 . . . . /0 0,0 12,0 . . 0,0 /. . 3 . . /3 4 1 5 . /1 2 . . . /. . . . . /. . . . . /"],
			["すべてのマスに数字が入っていません。","pzprv3/kakuro/5/5/0 0 12 4 0 0 /0 8,4 . . 0,10 0,0 /10 . . . . 0,10 /3 . . 3,17 . . /0 21,0 . . . . /0 0,0 12,0 . . 0,0 /. . 3 . . /3 4 1 2 . /1 2 . 1 2 /. . 9 . 8 /. . 8 4 . /"],
			["","pzprv3/kakuro/5/5/0 0 12 4 0 0 /0 8,4 . . 0,10 0,0 /10 . . . . 0,10 /3 . . 3,17 . . /0 21,0 . . . . /0 0,0 12,0 . . 0,0 /. 5 3 . . /3 4 1 2 . /1 2 . 1 2 /. 1 9 3 8 /. . 8 4 . /"]
		],
		kakuru : [
			["初めから出ている数字の周りに同じ数字が入っています。","pzprv3/kakuru/5/5/3 . 10 b 4 /b . . . . /23 . 38 . 11 /. . . . b /16 b 20 . 3 /. 0 . . . /. 0 0 2 2 /. 0 . 0 . /0 0 0 0 . /. . . 0 . /"],
			["初めから出ている数字の周りに入る数の合計が正しくありません。","pzprv3/kakuru/5/5/3 . 10 b 4 /b . . . . /23 . 38 . 11 /. . . . b /16 b 20 . 3 /. 1 . . . /. 2 5 3 1 /. 0 . 0 . /0 0 0 0 . /. . . 0 . /"],
			["同じ数字がタテヨコナナメに隣接しています。","pzprv3/kakuru/5/5/3 . 10 b 4 /b . . . . /23 . . . 11 /. . . . b /16 b 20 . 3 /. 1 . . . /. 2 4 3 1 /. 0 3 0 . /0 0 0 0 . /. . . 0 . /"],
			["何も入っていないマスがあります。","pzprv3/kakuru/5/5/3 . 10 b 4 /b . . . . /23 . 38 . 11 /. . . . b /16 b 20 . 3 /. 2 . . . /. 1 4 3 1 /. 0 . 5 . /0 0 0 2 . /. . . 1 . /"],
			["","pzprv3/kakuru/5/5/3 . 10 b 4 /b . . . . /23 . 38 . 11 /. . . . b /16 b 20 . 3 /. 2 . . . /. 1 4 3 1 /. 6 . 5 . /7 9 8 2 . /. . . 1 . /"]
		],
		kinkonkan : [
			["斜線が複数引かれた部屋があります。","pzprv3/kinkonkan/4/4/5/0 0 1 1 /2 2 1 1 /2 2 3 3 /4 4 3 3 /. 2,2 1,1 . 4,1 . /3,2 . . . . . /. . . . . 1,1 /. . . . . . /3,2 . . . . 4,1 /. . . 2,2 . . /. . . . /. 1 . . /1 . . . /. . . . /"],
			["光が同じ文字の場所へ到達しません。","pzprv3/kinkonkan/4/4/5/0 0 1 1 /2 2 1 1 /2 2 3 3 /4 4 3 3 /. 2,2 1,1 . 4,1 . /3,2 . . . . . /. . . . . 1,1 /. . . . . . /3,2 . . . . 4,1 /. . . 2,2 . . /. + . + /+ 2 + + /+ + + + /. . + 1 /"],
			["光の反射回数が正しくありません。","pzprv3/kinkonkan/4/4/5/0 0 1 1 /2 2 1 1 /2 2 3 3 /4 4 3 3 /. 2,2 1,1 . 4,1 . /3,3 . . . . . /. . . . . 1,1 /. . . . . . /3,3 . . . . 4,1 /. . . 2,2 . . /1 + 1 + /+ 1 + + /+ + + + /2 + + 1 /"],
			["斜線の引かれていない部屋があります。","pzprv3/kinkonkan/4/4/6/0 0 1 2 /3 3 1 2 /3 3 4 4 /5 5 4 4 /. 2,2 1,1 . 4,1 . /3,2 . . . . . /. . . . . 1,1 /. . . . . . /3,2 . . . . 4,1 /. . . 2,2 . . /1 + 1 + /+ 1 + + /+ + + + /2 + + 1 /"],
			["","pzprv3/kinkonkan/4/4/5/0 0 1 1 /2 2 1 1 /2 2 3 3 /4 4 3 3 /. 2,2 1,1 . 4,1 . /3,2 . . . . . /. . . . . 1,1 /. . . . . . /3,2 . . . . 4,1 /. . . 2,2 . . /1 + 1 + /+ 1 + + /+ + + + /2 + + 1 /"]
		],
		kramma : [
			["分岐している線があります。","pzprv3/kramma/5/5/2 . . . 1 /. 1 2 . . /. 2 1 2 . /1 . 2 1 . /. 1 . . 2 /. . . . . . /. . . . 1 . /. . . 1 . . /. . 1 . . . /. 1 . . . . /. . . . . . /0 0 1 0 /0 0 1 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /1 1 1 1 1 /0 0 0 0 0 /0 0 0 0 0 /"],
			["線が黒点上で交差しています。","pzprv3/kramma/5/5/2 . . . 1 /. 1 2 . . /. 2 1 2 . /1 . 2 1 . /. 1 . . 2 /. . . . . . /. . . . 1 . /. . . 1 . . /. . 1 . . . /. 1 . . . . /. . . . . . /0 0 1 0 /0 0 1 0 /0 0 1 0 /0 0 1 0 /0 0 0 0 /0 0 0 0 0 /1 1 1 1 1 /0 0 0 0 0 /0 1 1 0 0 /"],
			["線が黒点以外で曲がっています。","pzprv3/kramma/5/5/2 . . . 1 /. 1 2 . . /. 2 1 2 . /1 . 2 1 . /. 1 . . 2 /. . . . . . /. . . . 1 . /. . . 1 . . /. . 1 . . . /. 1 . . . . /. . . . . . /0 0 0 0 /0 0 0 0 /0 0 1 0 /0 0 1 0 /0 0 0 0 /0 0 0 0 0 /1 1 1 0 0 /0 0 0 0 0 /0 1 1 0 0 /"],
			["白丸も黒丸も含まれない領域があります。","pzprv3/kramma/5/5/2 . . . 1 /. 1 2 . . /. 2 1 2 . /1 . 2 1 . /. 1 . . 2 /. . . . . . /. . . . 1 . /. . . 1 . . /. . 1 . . . /. 1 . . . . /. . . . . . /1 0 0 1 /1 0 0 0 /1 0 0 0 /1 0 0 0 /0 0 0 0 /1 1 1 1 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			["白丸と黒丸が両方含まれる領域があります。","pzprv3/kramma/5/5/2 . . . 1 /. 1 2 . . /. 2 1 2 . /1 . 2 1 . /. 1 . . 2 /. . . . . . /. . . . 1 . /. . . 1 . . /. . 1 . . . /. 1 . . . . /. . . . . . /1 0 0 1 /1 0 0 0 /1 0 0 0 /1 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			["途中で途切れている線があります。","pzprv3/kramma/5/5/2 . . . 1 /. 1 2 . . /. 2 1 2 . /1 . 2 1 . /. 1 . . 2 /. . . . . . /. . . 1 1 . /. . . 1 . . /. . 1 . . . /. 1 . . . . /. . . . . . /1 1 1 1 /1 1 0 0 /1 1 1 0 /1 0 1 0 /0 0 1 0 /0 0 0 0 1 /1 1 1 0 0 /0 0 1 1 1 /0 1 1 1 1 /"],
			["黒点上を線が通過していません。","pzprv3/kramma/5/5/2 . . . 1 /. 1 2 . . /. 2 1 2 . /1 . 2 1 . /. 1 . . 2 /. . . . . . /. . . 1 1 . /. . . 1 . . /. . 1 . . . /. 1 . . . . /. . . . . . /1 1 0 1 /1 1 0 0 /1 1 1 0 /1 0 1 0 /0 0 1 0 /0 0 0 0 1 /1 1 1 0 0 /0 0 1 1 1 /0 1 1 1 1 /"],
			["","pzprv3/kramma/5/5/2 . . . 1 /. 1 2 . . /. 2 1 2 . /1 . 2 1 . /. 1 . . 2 /. . . . . . /. . . . 1 . /. . . 1 . . /. . 1 . . . /. 1 . . . . /. . . . . . /1 1 -1 1 /1 1 -1 -1 /1 1 1 -1 /1 -1 1 0 /0 -1 1 0 /-1 -1 -1 -1 1 /1 1 1 -1 -1 /-1 -1 1 1 1 /0 1 1 1 1 /"]
		],
		kurochute : [
			["黒マスがタテヨコに連続しています。","pzprv3/kurochute/5/5/1 3 2 . . /. . . 1 . /. . 1 . . /. 2 . . . /. . 3 3 2 /. . . . . /. 1 . . . /. 1 . . . /. . . . . /. . . . . /"],
			["白マスが分断されています。","pzprv3/kurochute/5/5/1 3 2 . . /. . . 1 . /. . 1 . . /. 2 . . . /. . 3 3 2 /- . . . . /1 + 1 . . /+ 1 . 1 . /. . . . 1 /. . . . . /"],
			["数字の数だけ離れたマスのうち、1マスだけ黒マスになっていません。","pzprv3/kurochute/5/5/1 3 2 . . /. . . 1 . /. . 1 . . /. 2 . . . /. . 3 3 2 /- - - + 1 /1 + 1 . + /+ + . 1 . /. - + . . /1 . - - . /"],
			["","pzprv3/kurochute/5/5/1 3 2 . . /. . . 1 . /. . 1 . . /. 2 . . . /. . 3 3 2 /- - - + 1 /1 + 1 . + /+ + . . 1 /. - + 1 . /1 . - - . /"]
		],
		kurodoko : [
			["黒マスがタテヨコに連続しています。","pzprv3/kurodoko/5/5/. . . 7 . /5 . . . . /. . 2 . . /. . . . 2 /. 4 . . . /. . . . . /. . . . . /. . . . . /. . # . . /. . # . . /"],
			["白マスが分断されています。","pzprv3/kurodoko/5/5/. . . 7 . /5 . . . . /. . 2 . . /. . . . 2 /. 4 . . . /. # . . . /. . # . . /. # . . . /. . # . . /. . . # . /"],
			["数字と黒マスにぶつかるまでの4方向のマスの合計が違います。","pzprv3/kurodoko/5/5/. . . 7 . /5 . . . . /. . 2 . . /. . . . 2 /. 4 . . . /# + + + . /+ + # + + /+ # + + # /+ + # + + /# + + + # /"],
			["","pzprv3/kurodoko/5/5/. . . 7 . /5 . . . . /. . 2 . . /. . . . 2 /. 4 . . . /+ # + + . /+ + # + + /+ # + + # /+ + # + + /# + + + # /"]
		],
		kusabi : [
			["分岐している線があります。","pzprv3/kusabi/5/5/3 1 1 . . /. . . 2 . /. . 1 2 . /. . 1 . . /. . . . 3 /0 0 0 0 /0 0 0 0 /1 1 0 0 /0 0 0 0 /0 0 0 0 /1 0 0 0 0 /1 0 0 0 0 /1 0 0 0 0 /1 0 0 0 0 /"],
			["線が交差しています。","pzprv3/kusabi/5/5/3 1 1 . . /. . . 2 . /. . 1 2 . /. . 1 . . /. . . . 3 /0 0 0 0 /0 0 0 0 /1 1 0 0 /0 0 0 0 /0 1 0 0 /1 1 0 0 0 /1 1 0 0 0 /0 1 0 0 0 /0 1 1 0 0 /"],
			["3つ以上の丸がつながっています。","pzprv3/kusabi/5/5/3 1 1 . . /. . . 2 . /. . 1 2 . /. . 1 . . /. . . . 3 /0 1 1 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 1 0 0 /0 1 0 1 0 /0 1 0 0 0 /0 1 0 0 0 /0 1 1 0 0 /"],
			["丸の上を線が通過しています。","pzprv3/kusabi/5/5/3 1 1 . . /. . . 2 . /. . 1 2 . /. . 1 . . /. . . . 3 /0 0 0 0 /1 0 0 0 /0 0 0 0 /1 1 1 1 /0 0 0 0 /0 0 0 0 0 /1 0 0 0 0 /1 0 0 0 0 /0 0 0 0 1 /"],
			["丸がコの字型に繋がっていません。","pzprv3/kusabi/5/5/3 1 1 . . /. . . 2 . /. . 1 2 . /. . 1 . . /. . . . 3 /0 0 0 0 /0 1 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 1 0 0 0 /0 0 1 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			["繋がる丸が正しくありません。","pzprv3/kusabi/5/5/3 1 1 . . /. . . 2 . /. . 1 2 . /. . 1 . . /. . . . 3 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 1 1 0 /0 1 0 0 0 /0 1 0 0 0 /0 1 0 1 0 /0 1 0 1 0 /"],
			["線が2回以上曲がっています。","pzprv3/kusabi/5/5/3 1 1 . . /. . . 2 . /. . 1 2 . /. . 1 . . /. . . . 3 /0 0 0 0 /0 1 1 0 /1 0 0 0 /0 0 0 0 /0 0 0 0 /1 0 0 0 0 /1 1 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			["線が2回曲がっていません。","pzprv3/kusabi/5/5/3 1 1 . . /. . . 2 . /. . 1 2 . /. . 1 . . /. . . . 3 /0 0 0 0 /0 0 1 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 1 0 0 /-1 -1 0 0 0 /-1 -1 0 0 0 /"],
			["線の長さが同じではありません。","pzprv3/kusabi/5/5/3 1 1 . . /. . . 2 . /. . 1 2 . /. . 1 . . /. . . . 3 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 1 0 0 /0 1 0 0 0 /0 1 0 0 0 /0 1 0 0 0 /0 1 1 0 0 /"],
			["線の長短の指示に反してます。","pzprv3/kusabi/5/5/2 1 1 . . /. . . 2 . /. . 1 3 . /. . 1 . . /. . . . 3 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /1 1 1 0 /1 0 0 0 0 /1 0 0 0 0 /1 0 0 1 0 /1 0 0 1 0 /"],
			["途切れている線があります。","pzprv3/kusabi/5/5/3 1 1 . . /. . . 2 . /. . 1 2 . /. . 1 . . /. . . . 3 /0 0 0 0 /0 1 0 0 /0 0 0 0 /0 0 0 0 /1 1 1 0 /1 1 1 0 0 /1 0 0 0 0 /1 -1 0 0 0 /1 -1 0 1 0 /"],
			["丸につながっていない線があります。","pzprv3/kusabi/5/5/3 1 1 . . /. . . 2 . /. . 1 2 . /. . 1 . . /. . . . 3 /0 0 0 1 /0 1 0 0 /-1 1 0 0 /-1 1 0 0 /1 1 1 0 /1 1 1 0 1 /1 -1 0 0 1 /1 1 0 1 1 /1 -1 0 1 0 /"],
			["どこにもつながっていない丸があります。","pzprv3/kusabi/5/5/3 1 1 . . /. . . 2 . /. . 1 2 . /. . 1 . . /. . . . 3 /0 0 0 0 /0 1 0 0 /-1 1 0 0 /-1 1 0 0 /1 1 1 0 /1 1 1 0 0 /1 -1 0 0 0 /1 1 0 1 0 /1 -1 0 1 0 /"],
			["","pzprv3/kusabi/5/5/3 1 1 . . /. . . 2 . /. . 1 2 . /. . 1 . . /. . . . 3 /0 0 0 1 /0 1 0 0 /-1 1 0 0 /-1 1 0 0 /1 1 1 0 /1 1 1 1 1 /1 -1 0 0 1 /1 1 0 1 1 /1 -1 0 1 1 /"]
		],
		lightup : [
			["数字のまわりにある照明の数が間違っています。","pzprv3/lightup/6/6/. . . . . . /. . 4 . . . /. # . . 2 . /# 0 # . . . /. # . 1 . . /. . . . . . /"],
			["照明に別の照明の光が当たっています。","pzprv3/lightup/6/6/. . # . . # /. # 4 # . . /. . # . 2 . /. 0 . . # . /. . . 1 . . /. . . . . . /"],
			["数字のまわりにある照明の数が間違っています。","pzprv3/lightup/6/6/. . # . . . /. # 4 # . . /. . # . 2 # /+ 0 . . # . /. + . 1 . . /. . . . . . /"],
			["照明に照らされていないセルがあります。","pzprv3/lightup/6/6/. . # . . . /. # 4 # . . /. . # . 2 # /+ 0 . . # . /. + . 1 . . /. . . # . . /"],
			["","pzprv3/lightup/6/6/. . # . . . /. # 4 # . . /. . # . 2 # /+ 0 . . # . /# + . 1 . . /. . . # . . /"]
		],
		lits : [
			["2x2の黒マスのかたまりがあります。","pzprv3/lits/4/4/3/0 0 1 1 /0 0 1 2 /0 1 1 2 /2 2 2 2 /# # . . /# # . . /. . . . /. . . . /"],
			["５マス以上の黒マスがある部屋が存在します。","pzprv3/lits/4/4/3/0 0 1 1 /0 0 1 2 /0 1 1 2 /2 2 2 2 /. . # # /. . # . /. # # . /. . . . /"],
			["1つの部屋に入る黒マスが2つ以上に分裂しています。","pzprv3/lits/4/4/3/0 0 1 1 /0 0 1 2 /0 1 1 2 /2 2 2 2 /. . # # /. . . . /. # # # /. . . . /"],
			["同じ形のテトロミノが接しています。","pzprv3/lits/4/4/3/0 0 1 1 /0 0 1 2 /0 1 1 2 /2 2 2 2 /# # # # /# . # . /# . # . /. . . . /"],
			["黒マスが分断されています。","pzprv3/lits/4/4/3/0 0 1 1 /0 0 1 2 /0 1 1 2 /2 2 2 2 /# . # # /# . # . /# . # . /. . . . /"],
			["黒マスがない部屋があります。","pzprv3/lits/4/4/3/0 0 1 1 /0 0 1 2 /0 1 1 2 /2 2 2 2 /# . # # /# # # . /# . # . /. . . . /"],
			["黒マスのカタマリが４マス未満の部屋があります。","pzprv3/lits/4/4/3/0 0 1 1 /0 0 1 2 /0 1 1 2 /2 2 2 2 /# . # # /# # # . /# . # . /. . # # /"],
			["","pzprv3/lits/4/4/3/0 0 1 1 /0 0 1 2 /0 1 1 2 /2 2 2 2 /# + # # /# # # + /# + # + /# # # # /"]
		],
		loopsp : [
			["最初から引かれている線があるマスに線が足されています。","pzprv3/loopsp/5/5/. . . . . /. a . g . /1 . 1 . 2 /. d . f . /. . . . . /0 0 0 0 /0 0 1 1 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 1 0 /0 0 0 1 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			["分岐している線があります。","pzprv3/loopsp/5/5/. . . . . /. a . g . /1 . 1 . 2 /. d . f . /. . . . . /0 0 0 0 /0 1 0 0 /0 0 0 0 /0 1 1 0 /0 0 0 0 /0 1 1 0 0 /0 1 0 0 0 /0 1 0 0 0 /0 0 0 1 0 /"],
			["○の部分で線が交差しています。","pzprv3/loopsp/5/5/. . . . . /. a . g . /1 . 1 . 2 /. d . f . /. . . . . /0 0 0 0 /0 0 0 0 /1 1 1 0 /0 0 0 0 /0 0 0 0 /0 0 1 0 0 /0 0 1 0 0 /0 0 1 0 0 /0 0 1 0 0 /"],
			["異なる数字を含んだループがあります。","pzprv3/loopsp/5/5/. . . . . /. a . g . /1 . 1 . 2 /. d . f . /. . . . . /1 1 1 1 /0 0 0 0 /1 1 0 0 /0 0 0 0 /0 0 1 1 /1 0 0 0 1 /1 0 0 0 1 /0 0 1 0 1 /0 0 1 0 1 /"],
			["同じ数字が異なるループに含まれています。","pzprv3/loopsp/5/5/. . . . . /. a . g . /1 . 1 . 2 /. d . f . /. . . . . /1 0 1 1 /0 0 0 1 /0 0 1 0 /0 1 0 0 /1 1 0 0 /1 1 1 0 1 /1 1 1 1 0 /1 1 0 0 0 /1 0 1 0 0 /"],
			["○を含んでいないループがあります。","pzprv3/loopsp/5/5/. . . . . /. a . g . /1 . 1 . 2 /. d . f . /. . . . . /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 1 0 /0 -1 1 -1 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 1 1 0 /"],
			["┼のマスから線が4本出ていません。","pzprv3/loopsp/5/5/. . . . . /. a . g . /1 . 1 . 2 /. d . f . /. . . . . /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			["線が引かれていないマスがあります。","pzprv3/loopsp/5/5/. . . . . /. a . g . /1 . 1 . 2 /. d . f . /. . . . . /1 0 1 1 /1 1 0 1 /0 0 0 1 /0 1 1 0 /0 0 0 1 /1 1 1 0 1 /0 1 0 1 0 /0 1 0 0 1 /0 0 0 1 1 /"],
			["途中で途切れている線があります。","pzprv3/loopsp/5/5/. . . . . /. a . g . /1 . 1 . 2 /. d . f . /. . . . . /1 -1 1 1 /1 1 -1 1 /1 1 -1 1 /0 1 1 0 /0 1 -1 1 /1 1 1 -1 1 /-1 1 -1 1 0 /1 1 1 0 1 /1 0 1 1 1 /"],
			["","pzprv3/loopsp/5/5/. . . . . /. a . g . /1 . 1 . 2 /. d . f . /. . . . . /1 -1 1 1 /1 1 -1 1 /1 1 -1 1 /0 1 1 0 /1 1 -1 1 /1 1 1 -1 1 /-1 1 -1 1 0 /1 1 1 0 1 /1 0 1 1 1 /"]
		],
		mashu : [
			["分岐している線があります。","pzprv3/mashu/6/6/. . 1 . . . /. 2 . . 1 . /. . . . . . /. . . 2 . . /. 1 . . . . /. . . . . . /0 0 1 1 0 /0 0 0 0 0 /1 1 1 1 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 1 0 0 0 /0 0 1 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /"],
			["線が交差しています。","pzprv3/mashu/6/6/. . 1 . . . /. 2 . . 1 . /. . . . . . /. . . 2 . . /. 1 . . . . /. . . . . . /0 0 1 1 0 /0 0 0 0 0 /1 1 1 1 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 1 0 0 0 /0 0 1 0 0 0 /0 0 1 0 0 0 /0 0 1 0 0 0 /0 0 1 0 0 0 /"],
			["白丸の上で線が曲がっています。","pzprv3/mashu/6/6/. . 1 . . . /. 2 . . 1 . /. . . . . . /. . . 2 . . /. 1 . . . . /. . . . . . /0 0 1 1 0 /0 0 0 0 0 /0 0 1 1 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 1 0 0 0 /0 0 1 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /"],
			["黒丸の上で線が直進しています。","pzprv3/mashu/6/6/. . 1 . . . /. 2 . . 1 . /. . . . . . /. . . 2 . . /. 1 . . . . /. . . . . . /0 0 0 0 0 /0 1 1 -1 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 0 /0 1 0 0 0 0 /0 1 0 1 0 0 /0 -1 0 1 0 0 /0 0 0 1 0 0 /"],
			["黒丸の隣で線が曲がっています。","pzprv3/mashu/6/6/. . 1 . . . /. 2 . . 1 . /. . . . . . /. . . 2 . . /. 1 . . . . /. . . . . . /1 1 1 0 0 /0 1 1 -1 0 /0 0 0 0 0 /0 0 1 0 0 /0 0 0 0 0 /0 0 0 0 0 /1 0 0 0 0 0 /0 1 0 0 0 0 /0 1 0 1 0 0 /0 -1 1 0 0 0 /0 0 0 0 0 0 /"],
			["白丸の隣で線が曲がっていません。","pzprv3/mashu/6/6/. . 1 . . . /. 2 . . 1 . /. . . . . . /. . . 2 . . /. 1 . . . . /. . . . . . /1 1 1 1 0 /0 1 1 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /1 0 0 0 0 0 /1 1 0 0 0 0 /1 1 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /"],
			["線が上を通っていない丸があります。","pzprv3/mashu/6/6/. . 1 . . . /. 2 . . 1 . /. . . . . . /. . . 2 . . /. 1 . . . . /. . . . . . /1 1 1 0 0 /0 1 1 -1 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /1 0 0 1 0 0 /0 1 0 0 0 0 /0 1 0 0 0 0 /0 -1 0 0 0 0 /0 0 0 0 0 0 /"],
			["線が途中で途切れています。","pzprv3/mashu/6/6/. . 1 . . . /. 2 . . 1 . /. . . . . . /. . . 2 . . /. 1 . . . . /. . . . . . /1 1 1 0 1 /0 1 1 -1 0 /0 0 0 0 0 /0 1 0 0 0 /1 1 0 0 0 /0 0 0 0 0 /1 0 0 1 1 1 /1 1 0 0 1 1 /1 1 0 0 0 1 /1 -1 0 1 0 0 /0 0 0 1 0 0 /"],
			["輪っかが一つではありません。","pzprv3/mashu/6/6/. . 1 . . . /. 2 . . 1 . /. . . . . . /. . . 2 . . /. 1 . . . . /. . . . . . /1 1 1 0 1 /0 1 1 -1 0 /0 0 0 0 0 /0 1 1 0 0 /1 1 0 0 0 /0 0 1 0 1 /1 0 0 1 1 1 /1 1 0 0 1 1 /1 1 0 0 1 1 /1 -1 0 1 1 1 /0 0 1 1 1 1 /"],
			["","pzprv3/mashu/6/6/. . 1 . . . /. 2 . . 1 . /. . . . . . /. . . 2 . . /. 1 . . . . /. . . . . . /1 1 1 0 1 /0 1 1 -1 0 /0 0 1 1 0 /0 1 -1 1 1 /1 1 0 0 0 /0 0 1 0 0 /1 0 0 1 1 1 /1 1 0 0 1 1 /1 1 1 -1 0 1 /1 -1 0 1 0 0 /0 0 1 1 0 0 /"]
		],
		mejilink : [
			["分岐している線があります。","pzprv3/mejilink/4/4/1 0 1 1 1 /2 2 1 1 1 /2 0 1 1 1 /1 0 0 0 1 /1 1 1 1 /1 0 0 0 /2 0 0 1 /1 1 0 1 /1 1 1 1 /"],
			["線が交差しています。","pzprv3/mejilink/4/4/1 0 1 1 1 /1 1 1 2 1 /1 0 2 2 1 /1 0 0 0 1 /1 1 1 1 /1 0 0 0 /1 0 2 2 /2 2 0 2 /1 1 1 1 /"],
			["タイルと周囲の線が引かれない点線の長さが異なります。","pzprv3/mejilink/4/4/2 0 1 1 1 /1 2 1 1 1 /2 0 1 1 1 /2 0 0 0 1 /2 2 1 1 /2 0 0 0 /2 0 0 1 /1 1 0 1 /2 2 2 2 /"],
			["途中で途切れている線があります。","pzprv3/mejilink/4/4/2 0 1 2 2 /1 2 1 2 2 /2 0 1 2 2 /2 0 0 1 2 /2 2 2 1 /2 0 0 0 /2 0 0 1 /1 1 0 0 /2 2 2 2 /"],
			["輪っかが一つではありません。","pzprv3/mejilink/4/4/2 2 0 2 2 /2 2 0 2 2 /1 0 0 0 1 /2 1 0 1 2 /2 1 1 2 /1 0 0 1 /2 1 1 2 /2 2 2 2 /2 2 2 2 /"],
			["","pzprv3/mejilink/4/4/2 0 -1 1 2 /-1 2 -1 1 2 /2 0 -1 2 1 /2 0 0 0 2 /2 2 2 2 /2 0 0 0 /2 0 0 2 /-1 -1 0 2 /2 2 2 2 /"]
		],
		minarism : [
			["同じ列に同じ数字が入っています。","pzprv3/minarism/4/4/b b b /0 0 0 /0 0 0 /0 0 0 /2 1 0 0 /0 0 0 0 /0 0 a 0 /4 . . 4 /. . . . /. . . . /. . . . /"],
			["丸付き数字とその両側の数字の差が一致していません。","pzprv3/minarism/4/4/b b b /0 0 0 /0 0 0 /0 0 0 /2 1 0 0 /0 0 0 0 /0 0 a 0 /4 3 2 1 /1 . . . /. . . . /. . . . /"],
			["不等号と数字が矛盾しています。","pzprv3/minarism/4/4/b b b /0 0 0 /0 0 0 /0 0 0 /2 1 0 0 /0 0 0 0 /0 0 a 0 /4 3 2 1 /2 4 . . /. . 3 . /. . 1 . /"],
			["数字の入っていないマスがあります。","pzprv3/minarism/4/4/b b b /0 0 0 /0 0 0 /0 0 0 /2 1 0 0 /0 0 0 0 /0 0 a 0 /4 3 2 1 /2 4 1 3 /. . 3 . /. . 4 . /"],
			["","pzprv3/minarism/4/4/b b b /0 0 0 /0 0 0 /0 0 0 /2 1 0 0 /0 0 0 0 /0 0 a 0 /4 3 2 1 /2 4 1 3 /1 2 3 4 /3 1 4 2 /"]
		],
		mochikoro : [
			["2x2の黒マスのかたまりがあります。","pzprv3/mochikoro/5/5/4 . . . . /. . . . . /. 2 . . . /. . . . . /1 . . . 1 /. . . # # /. . . # # /. . . . . /. . . . . /. . . . . /"],
			["孤立した白マスのブロックがあります。","pzprv3/mochikoro/5/5/4 . . . . /. . . . . /. 2 . . . /. . . . . /1 . . . 1 /+ + + + # /# # # # # /. . . . . /. . . . . /. . . . . /"],
			["四角形でない白マスのブロックがあります。","pzprv3/mochikoro/5/5/4 . . . . /. . . . . /. 2 . . . /. . . . . /1 . . . 1 /+ + + + # /# # # # + /. . # + + /. . . # # /. . . . . /"],
			["1つのブロックに2つ以上の数字が入っています。","pzprv3/mochikoro/5/5/4 . . . . /. . . . . /. 2 . . . /. . . . . /1 . . . 1 /+ + # + . /. . # . + /. . # . + /# # . # # /. . # . . /"],
			["数字とブロックの面積が違います。","pzprv3/mochikoro/5/5/4 . . . . /. . . . . /. 2 . . . /. . . . . /1 . . . 1 /+ + + + # /# # # # + /# + + # + /+ # # + # /+ # + # + /"],
			["","pzprv3/mochikoro/5/5/4 . . . . /. . . . . /. 2 . . . /. . . . . /1 . . . 1 /+ + + + # /# # # # + /# + # + # /# + # + # /+ # + # + /"]
		],
		mochinyoro : [
			["2x2の黒マスのかたまりがあります。","pzprv3/mochinyoro/5/5/. . . . . /. 4 . 2 . /. . . . . /. 2 . . . /. . . . 1 /. . . . . /. . . . . /. . . . . /. . # # . /. . # # . /"],
			["孤立した白マスのブロックがあります。","pzprv3/mochinyoro/5/5/. . . . . /. 4 . 2 . /. . . . . /. 2 . . . /. . . . 1 /. . # . . /. . # . . /# # # . . /. . . . . /. . . . . /"],
			["四角形でない白マスのブロックがあります。","pzprv3/mochinyoro/5/5/. . . . . /. 4 . 2 . /. . . . . /. 2 . . . /. . . . 1 /+ + # . . /+ + # . . /# # + . . /. . . . . /. . . . . /"],
			["1つのブロックに2つ以上の数字が入っています。","pzprv3/mochinyoro/5/5/. . . . . /. 4 . 2 . /. . . . . /. 2 . . . /. . . . 1 /+ + # . # /+ + # . # /. . # # . /. . # . # /# # . # . /"],
			["数字とブロックの面積が違います。","pzprv3/mochinyoro/5/5/. . . . . /. 4 . 2 . /. . . . . /. 2 . . . /. . . . 1 /+ + # . . /+ + # + . /# # + # # /# + # + # /# # # # + /"],
			["四角形になっている黒マスのブロックがあります。","pzprv3/mochinyoro/5/5/. . . . . /. 4 . 2 . /. . . . . /. 2 . . . /. . . . 1 /+ + # + # /+ + # + # /# # + # # /# + # + # /# + # # + /"],
			["","pzprv3/mochinyoro/5/5/. . . . . /. 4 . 2 . /. . . . . /. 2 . . . /. . . . 1 /+ + # # # /+ + # + + /# # + # # /# + # + # /# + # # + /"]
		],
		nagenawa : [
			["線が引かれていません。","pzprv3/nagenawa/6/6/13/0 0 1 1 2 2 /0 3 3 4 4 2 /5 3 6 6 4 7 /5 8 6 6 9 7 /10 8 8 9 9 11 /10 10 12 12 11 11 /3 . 0 . 1 . /. 1 . 3 . . /1 . 4 . . . /. 2 . . . . /3 . . 2 . . /. . . . . . /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /"],
			["数字のある部屋と線が通過するマスの数が違います。","pzprv3/nagenawa/6/6/13/0 0 1 1 2 2 /0 3 3 4 4 2 /5 3 6 6 4 7 /5 8 6 6 9 7 /10 8 8 9 9 11 /10 10 12 12 11 11 /3 . 0 . 1 . /. 1 . 3 . . /1 . 4 . . . /. 2 . . . . /3 . . 2 . . /. . . . . . /1 0 0 0 0 /0 0 0 0 0 /1 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /1 1 0 0 0 0 /1 1 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 2 2 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /"],
			["分岐している線があります。","pzprv3/nagenawa/6/6/13/0 0 1 1 2 2 /0 3 3 4 4 2 /5 3 6 6 4 7 /5 8 6 6 9 7 /10 8 8 9 9 11 /10 10 12 12 11 11 /3 . 0 . 1 . /. 1 . 3 . . /1 . 4 . . . /. 2 . . . . /3 . . 2 . . /. . . . . . /1 0 0 0 0 /1 0 0 0 0 /0 0 0 0 0 /1 0 0 0 0 /1 0 0 0 0 /1 0 0 0 0 /1 1 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /1 0 0 0 0 0 /1 0 0 0 0 0 /0 0 2 2 0 0 /0 0 2 0 0 0 /2 2 0 0 0 0 /1 0 0 0 0 0 /1 0 0 0 0 0 /1 1 0 0 0 0 /"],
			["途中で途切れている線があります。","pzprv3/nagenawa/6/6/13/0 0 1 1 2 2 /0 3 3 4 4 2 /5 3 6 6 4 7 /5 8 6 6 9 7 /10 8 8 9 9 11 /10 10 12 12 11 11 /3 . 0 . 1 . /. 1 . 3 . . /1 . 4 . . . /. 2 . . . . /3 . . 2 . . /. . . . . . /1 0 0 0 0 /1 0 0 1 0 /0 0 1 1 0 /1 0 0 0 0 /0 0 0 0 0 /1 0 0 0 0 /1 1 0 0 0 0 /0 0 0 1 0 0 /0 0 1 1 0 0 /1 1 0 0 0 0 /1 1 0 0 0 0 /0 0 2 2 0 0 /0 0 2 0 0 0 /2 2 0 0 0 0 /1 0 0 0 0 0 /1 0 2 0 0 0 /1 1 0 0 0 0 /"],
			["数字のある部屋と線が通過するマスの数が違います。","pzprv3/nagenawa/6/6/13/0 0 1 1 2 2 /0 3 3 4 4 2 /5 3 6 6 4 7 /5 8 6 6 9 7 /10 8 8 9 9 11 /10 10 12 12 11 11 /3 . 0 . 1 . /. 1 . 3 . . /1 . 4 . . . /. 2 . . . . /3 . . 2 . . /. . . . . . /1 0 0 0 0 /1 0 0 1 0 /0 0 1 1 0 /1 0 1 0 0 /0 0 0 0 0 /1 0 0 0 0 /1 1 0 0 0 0 /0 0 0 1 1 0 /0 0 1 1 0 0 /1 1 0 0 0 0 /1 1 0 0 0 0 /0 0 2 2 0 0 /0 0 2 0 0 0 /2 2 0 0 0 0 /1 0 0 0 0 0 /1 0 2 0 0 0 /1 1 0 0 0 0 /"],
			["長方形か正方形でない輪っかがあります。","pzprv3/nagenawa/6/6/13/0 0 1 1 2 2 /0 3 3 4 4 2 /5 3 6 6 4 7 /5 8 6 6 9 7 /10 8 8 9 9 11 /10 10 12 12 11 11 /3 . 0 . 1 . /. 1 . 3 . . /1 . 4 . . . /. . . . . . /3 . . 2 . . /. . . . . . /1 0 0 0 0 /1 0 0 1 1 /0 0 1 1 0 /1 0 1 1 0 /0 0 1 0 0 /1 0 1 1 1 /1 1 0 0 0 0 /0 0 0 1 0 1 /0 0 1 1 1 1 /1 1 0 1 0 1 /1 1 1 0 0 1 /0 0 2 2 0 0 /0 0 2 0 0 0 /2 2 0 0 0 0 /1 0 0 0 0 0 /1 0 2 0 0 0 /1 1 0 0 0 0 /"],
			["","pzprv3/nagenawa/6/6/13/0 0 1 1 2 2 /0 3 3 4 4 2 /5 3 6 6 4 7 /5 8 6 6 9 7 /10 8 8 9 9 11 /10 10 12 12 11 11 /3 . 0 . 1 . /. 1 . 3 . . /1 . 4 . . . /. 2 . . . . /3 . . 2 . . /. . . . . . /1 0 0 0 0 /1 0 0 1 1 /0 0 1 1 0 /1 0 1 1 0 /0 0 0 0 0 /1 0 0 1 1 /1 1 0 0 0 0 /0 0 0 1 0 1 /0 0 1 1 1 1 /1 1 0 1 0 1 /1 1 0 1 0 1 /0 0 2 2 0 0 /0 0 2 0 0 0 /2 2 0 0 0 0 /1 0 0 0 0 0 /1 0 2 0 0 0 /1 1 0 0 0 0 /"]
		],
		nanro : [
			["数字が2x2のかたまりになっています。","pzprv3/nanro/4/4/5/0 0 0 1 /2 3 3 1 /2 3 3 1 /2 4 4 4 /. . . 1 /3 . . . /. . . . /. 1 . . /. . . . /. . . - /3 2 . - /3 . - - /"],
			["同じ数字が境界線を挟んで隣り合っています。","pzprv3/nanro/4/4/5/0 0 0 1 /2 3 3 1 /2 3 3 1 /2 4 4 4 /. . . 1 /3 . . . /. . . . /. 1 . . /. . . . /. 3 3 - /3 . 3 - /3 . - - /"],
			["複数種類の数字が入っているブロックがあります。","pzprv3/nanro/4/4/5/0 0 0 1 /2 3 3 1 /2 3 3 1 /2 4 4 4 /. . . 1 /3 . . . /. . . . /. 1 . . /. + . . /. . 1 - /3 - 2 - /3 . - - /"],
			["入っている数字の数が数字より多いです。","pzprv3/nanro/4/4/5/0 0 0 1 /2 3 3 1 /2 3 3 1 /2 4 4 4 /. . . 1 /3 . . . /. . . . /. 1 . . /. + . . /. . 1 - /3 - 1 - /3 . - - /"],
			["タテヨコにつながっていない数字があります。","pzprv3/nanro/4/4/5/0 0 0 1 /2 3 3 1 /2 3 3 1 /2 4 4 4 /. . . 1 /3 . . . /. . . . /. 1 . . /. + . . /. 1 . - /3 - . - /3 . - - /"],
			["入っている数字の数が数字より少ないです。","pzprv3/nanro/4/4/5/0 0 0 1 /2 3 3 1 /2 3 3 1 /2 4 4 4 /. . . 1 /3 . . . /. . . . /. 1 . . /. 3 3 . /. 1 . - /3 - . - /3 . - - /"],
			["数字が含まれていないブロックがあります。","pzprv3/nanro/4/4/6/0 0 0 1 /2 3 4 1 /2 3 4 1 /2 5 5 5 /. . . 1 /3 . . . /. . . . /. 1 . . /. 2 2 . /. 1 . - /3 - . - /3 . - - /"],
			["","pzprv3/nanro/4/4/5/0 0 0 1 /2 3 3 1 /2 3 3 1 /2 4 4 4 /. . . 1 /3 . . . /. . . . /. 1 . . /. 2 2 . /. 1 . - /3 - . - /3 . - - /"]
		],
		nawabari : [
			["部屋の形が長方形ではありません。","pzprv3/nawabari/5/5/. . . . . /. 0 . 1 . /. . . . . /. 2 . 1 . /. . . . . /0 0 1 0 /0 0 1 0 /0 1 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 1 0 0 /1 1 0 0 0 /0 0 0 0 0 /"],
			["数字の入っていない部屋があります。","pzprv3/nawabari/5/5/. . . . . /. 0 . 1 . /. . . . . /. 2 . 1 . /. . . . . /0 0 1 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /1 1 1 1 1 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			["1つの部屋に2つ以上の数字が入っています。","pzprv3/nawabari/5/5/. . . . . /. 0 . 1 . /. . . . . /. 2 . 1 . /. . . . . /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			["数字の周りにある境界線の本数が違います。","pzprv3/nawabari/5/5/. . . . . /. 0 . 1 . /. . . . . /. 2 . 1 . /. . . . . /0 0 1 0 /0 0 1 0 /0 0 1 0 /0 0 1 0 /0 0 1 0 /0 0 0 0 0 /0 0 0 1 1 /1 1 1 0 0 /0 0 0 0 0 /"],
			["途中で途切れている線があります。","pzprv3/nawabari/5/5/. . . . . /. 0 . 1 . /. . . . . /. 2 . 1 . /. . . . . /0 0 1 0 /0 0 1 0 /0 0 1 0 /0 1 0 0 /0 1 0 0 /0 0 0 0 0 /0 0 0 0 0 /1 1 1 1 1 /0 0 1 0 0 /"],
			["","pzprv3/nawabari/5/5/. . . . . /. 0 . 1 . /. . . . . /. 2 . 1 . /. . . . . /0 0 1 0 /0 0 1 0 /0 0 1 0 /0 1 0 0 /0 1 0 0 /0 0 0 0 0 /0 0 0 0 0 /1 1 1 1 1 /0 0 0 0 0 /"]
		],
		norinori : [
			["２マスより大きい黒マスのカタマリがあります。","pzprv3/norinori/5/5/5/0 0 1 2 2 /1 1 1 2 2 /1 3 3 2 2 /3 3 3 3 3 /4 4 3 3 3 /# # . . . /. # . . . /. . . . . /. . . . . /. . . . . /"],
			["２マス以上の黒マスがある部屋が存在します。","pzprv3/norinori/5/5/5/0 0 1 2 2 /1 1 1 2 2 /1 3 3 2 2 /3 3 3 3 3 /4 4 3 3 3 /# # + . # /+ + # # . /# . . . # /. . . . # /. . . . . /"],
			["１マスだけの黒マスのカタマリがあります。","pzprv3/norinori/5/5/5/0 0 1 2 2 /1 1 1 2 2 /1 3 3 2 2 /3 3 3 3 3 /4 4 3 3 3 /# # + + + /+ + # # + /# . . + . /+ + . . . /# # + . . /"],
			["１マスしか黒マスがない部屋があります。","pzprv3/norinori/5/5/5/0 0 1 2 2 /1 1 1 2 2 /1 3 3 2 2 /3 3 3 3 3 /4 4 3 3 3 /# # + + + /+ + # # + /# # + + . /+ + . . . /# # + . . /"],
			["黒マスがない部屋があります。","pzprv3/norinori/5/5/5/0 0 1 2 2 /1 1 1 2 2 /1 3 3 2 2 /3 3 3 3 3 /4 4 3 3 3 /# # + + + /+ + + + + /+ + + + . /+ + . . . /# # + . . /"],
			["","pzprv3/norinori/5/5/5/0 0 1 2 2 /1 1 1 2 2 /1 3 3 2 2 /3 3 3 3 3 /4 4 3 3 3 /# # + + + /+ + # # + /# # + + # /+ + . . # /# # + . . /"]
		],
		numlin : [
			["分岐している線があります。","pzprv3/numlin/5/5/1 . . . . /2 . . 3 . /. . . . . /. 1 . . 2 /. . . . 3 /0 0 0 0 /1 1 1 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 1 0 0 0 /0 1 0 0 0 /0 0 0 0 0 /"],
			["線が交差しています。","pzprv3/numlin/5/5/1 . . . . /2 . . 3 . /. . . . . /. 1 . . 2 /. . . . 3 /1 0 0 0 /1 1 1 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 1 0 0 0 /0 1 0 0 0 /0 1 0 0 0 /0 0 0 0 0 /"],
			["3つ以上の数字がつながっています。","pzprv3/numlin/5/5/1 . . . . /2 . . 3 . /. . . . . /. 1 . . 2 /. . . . 3 /1 1 1 1 /1 1 1 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /1 0 0 0 1 /0 0 0 0 1 /0 0 0 0 1 /0 0 0 0 1 /"],
			["異なる数字がつながっています。","pzprv3/numlin/5/5/1 . . . . /2 . . 3 . /. . . . . /. 1 . . 2 /. . . . 3 /1 1 0 0 /0 0 0 0 /0 0 0 0 /0 0 1 1 /0 0 0 0 /0 0 1 0 0 /0 0 1 0 0 /0 0 1 0 0 /0 0 0 0 0 /"],
			["数字の上を線が通過しています。","pzprv3/numlin/5/5/1 . . . . /2 . . 3 . /. . . . . /. 1 . . 2 /. . . . 3 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 1 1 /0 0 0 0 /0 0 1 0 1 /0 0 1 0 1 /0 0 1 0 1 /0 0 0 0 0 /"],
			["途切れている線があります。","pzprv3/numlin/5/5/1 . . . . /2 . . 3 . /. . . . . /. 1 . . 2 /. . . . 3 /1 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 1 /0 1 0 0 0 /0 1 0 1 0 /0 0 0 1 0 /0 0 0 1 0 /"],
			["数字につながっていない線があります。","pzprv3/numlin/5/5/1 . . . . /2 . . 3 . /. . . . . /. 1 . . 2 /. . . . 3 /1 0 0 0 /0 0 0 0 /0 0 1 0 /0 0 0 0 /0 0 1 0 /0 1 0 0 0 /0 1 0 0 0 /0 1 1 1 0 /0 0 1 1 0 /"],
			["どこにもつながっていない数字があります。","pzprv3/numlin/5/5/1 . . . . /2 . . 3 . /. . . . . /. 1 . . 2 /. . . . 3 /1 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 1 /0 1 0 0 0 /0 1 0 1 0 /0 1 0 1 0 /0 0 0 1 0 /"],
			["","pzprv3/numlin/5/5/1 . . . . /2 . . 3 . /. . . . . /. 1 . . 2 /. . . . 3 /1 -1 1 1 /0 -1 0 0 /0 -1 -1 0 /0 -1 -1 0 /1 1 -1 1 /0 1 1 0 1 /1 1 1 1 1 /1 1 1 1 1 /1 0 1 1 0 /"]
		],
		nuribou : [
			["「幅１マス、長さ１マス以上」ではない黒マスのカタマリがあります。","pzprv3/nuribou/5/5/1 . 2 . . /. . . . 1 /. 4 . . . /. . . . . /. . . . 7 /. . . . . /# # # . . /. . # . . /. . # . . /. . . . . /"],
			["同じ面積の黒マスのカタマリが、角を共有しています。","pzprv3/nuribou/5/5/1 . 2 . . /. . . . 1 /. 4 . . . /. . . . . /. . . . 7 /+ # + + # /# + # # + /. . + + # /. . . . . /. . . . . /"],
			["数字の入っていないシマがあります。","pzprv3/nuribou/5/5/1 . 2 . . /. . . . 1 /. 4 . . . /. . . . . /. . . . 7 /+ # + + # /# + # # + /# + + + # /. # . . . /. . # # . /"],
			["1つのシマに2つ以上の数字が入っています。","pzprv3/nuribou/5/5/1 . 2 . . /. . . . 1 /. 4 . . . /. . . . . /. . . . 7 /+ # + + # /# + # # + /# + + + # /. . . . . /. . . . . /"],
			["数字とシマの面積が違います。","pzprv3/nuribou/5/5/1 . 2 . . /. . . . 1 /. 4 . . . /. . . . . /. . . . 7 /+ # + # . /+ # + # + /# + # . # /. . # . . /. . # . . /"],
			["","pzprv3/nuribou/5/5/1 . 2 . . /. . . . 1 /. 4 . . . /. . . . . /. . . . 7 /+ # + + # /# + # # + /# + + + # /+ # # # . /. . . . . /"]
		],
		nurikabe : [
			["2x2の黒マスのかたまりがあります。","pzprv3/nurikabe/5/5/. 5 . . . /. . 2 . . /# # . . . /# # 1 . . /. . . 3 . /"],
			["数字の入っていないシマがあります。","pzprv3/nurikabe/5/5/. 5 # # . /. # 2 . # /. # # # # /. # 1 . . /# . . 3 . /"],
			["黒マスが分断されています。","pzprv3/nurikabe/5/5/. 5 # # # /. # 2 . # /. . # # # /. . 1 . . /# . . 3 . /"],
			["1つのシマに2つ以上の数字が入っています。","pzprv3/nurikabe/5/5/. 5 # # # /. # 2 . # /. # # # # /. . 1 . . /. . . 3 . /"],
			["数字とシマの面積が違います。","pzprv3/nurikabe/5/5/. 5 # # # /. # 2 . # /. # # # # /. # 1 # . /. # # 3 . /"],
			["","pzprv3/nurikabe/5/5/+ 5 # # # /+ # 2 + # /+ # # # # /+ # 1 # . /# # # 3 . /"]
		],
		paintarea : [
			["白マスと黒マスの混在したタイルがあります。","pzprv3/paintarea/5/5/12/0 1 2 2 2 /0 3 2 2 4 /5 6 6 7 4 /5 8 9 10 4 /8 8 9 11 11 /. . . . . /. 4 . . . /. . . . . /. . . 1 . /. . . . . /. . + + + /. . # # . /. . . . . /. . . . . /. . . . . /"],
			["黒マスがひとつながりになっていません。","pzprv3/paintarea/5/5/13/0 1 2 2 2 /0 3 4 4 5 /6 7 7 8 5 /6 9 10 11 5 /9 9 10 12 12 /. . . . . /. 4 . . . /. . . . . /. . . 1 . /. . . . . /# # + + + /# + # # . /. # # . . /. . . . . /. . . . . /"],
			["2x2の黒マスのかたまりがあります。","pzprv3/paintarea/5/5/13/0 1 2 2 2 /0 3 4 4 5 /6 7 7 8 5 /6 9 10 11 5 /9 9 10 12 12 /. . . . . /. 4 . . . /. . . . . /. . . 1 . /. . . . . /# # + + + /# + # # . /# # # . . /# # . . . /# # . . . /"],
			["数字の上下左右にある黒マスの数が間違っています。","pzprv3/paintarea/5/5/13/0 1 2 2 2 /0 3 4 4 5 /6 7 7 8 5 /6 9 10 11 5 /9 9 10 12 12 /. . . . . /. 4 . . . /. . . . . /. . . 1 . /. . . . . /# # + + + /# + # # . /# # # . . /# + + . . /+ + + . . /"],
			["2x2の白マスのかたまりがあります。","pzprv3/paintarea/5/5/13/0 1 2 2 2 /0 3 4 4 5 /6 7 7 8 5 /6 9 10 11 5 /9 9 10 12 12 /. . . . . /. 4 . . . /. . . . . /. . . 1 . /. . . . . /# # + + + /# + # # # /# # # . # /# + + . # /+ + + . . /"],
			["","pzprv3/paintarea/5/5/13/0 1 2 2 2 /0 3 4 4 5 /6 7 7 8 5 /6 9 10 11 5 /9 9 10 12 12 /. . . . . /. 4 . . . /. . . . . /. . . 1 . /. . . . . /# # + + + /# + # # + /# # # + + /# + # # + /+ + # + + /"]
		],
		pipelink : [
			["最初から引かれている線があるマスに線が足されています。","pzprv3/pipelink/5/5/circle/. . . . . /. a . . . /. . . e . /. . a . . /. . . . . /0 0 0 0 /0 0 0 0 /0 0 0 1 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 1 0 /0 0 0 1 0 /0 0 0 0 0 /"],
			["分岐している線があります。","pzprv3/pipelink/5/5/circle/. . . . . /. a . . . /. . . e . /. . a . . /. . . . . /0 0 0 0 /0 0 0 0 /0 0 1 0 /0 0 1 1 /0 0 0 0 /0 0 0 0 0 /0 0 0 1 0 /0 0 1 0 0 /0 0 1 0 0 /"],
			["○の部分以外で線が交差しています。","pzprv3/pipelink/5/5/circle/. . . . . /. a . . . /. o . e . /. . a . . /. . . . . /0 0 0 0 /0 0 0 0 /1 1 1 0 /0 0 1 1 /0 0 0 0 /0 0 0 0 0 /0 1 1 1 0 /0 1 1 0 0 /0 0 0 0 0 /"],
			["輪っかが一つではありません。","pzprv3/pipelink/5/5/circle/. . . . . /. a . . . /. . . e . /. . a . . /. . . . . /1 0 0 0 /1 1 0 0 /0 0 0 0 /0 1 1 0 /0 0 1 0 /1 1 0 0 0 /0 1 0 0 0 /0 0 1 0 0 /0 0 1 1 0 /"],
			["┼のマスから線が4本出ていません。","pzprv3/pipelink/5/5/circle/. . . . . /. a . . . /. . . e . /. . a . . /. . . . . /1 0 1 1 /1 1 1 0 /1 1 1 0 /0 0 1 0 /1 1 1 0 /1 1 1 0 1 /0 1 1 1 1 /1 1 1 0 1 /1 0 0 1 0 /"],
			["分岐している線があります。","pzprv3/pipelink/5/5/circle/. . . . . /. a . . . /. . . e . /. . a . . /. . . . . /1 0 1 1 /1 1 1 0 /1 1 1 0 /0 1 1 0 /1 1 0 1 /1 1 1 0 1 /0 0 1 1 1 /1 0 1 0 1 /1 0 1 1 1 /"],
			["線が引かれていないマスがあります。","pzprv3/pipelink/5/5/circle/. . . . . /. a . . . /. . . e . /. . a . . /. . . . . /1 0 1 1 /1 1 1 0 /1 1 1 0 /0 1 1 1 /1 1 0 0 /1 1 1 0 1 /0 1 1 1 1 /1 1 1 0 1 /1 0 1 0 0 /"],
			["途中で途切れている線があります。","pzprv3/pipelink/5/5/circle/. . . . . /. a . . . /. . . e . /. . a . . /. . . . . /1 0 1 1 /1 1 1 0 /1 1 1 0 /0 1 1 0 /1 1 0 0 /1 1 1 0 1 /0 1 1 1 1 /1 1 1 0 1 /1 0 1 1 1 /"],
			["","pzprv3/pipelink/5/5/circle/. . . . . /. a . . . /. . . e . /. . a . . /. . . . . /1 -1 1 1 /1 1 1 -1 /1 1 1 -1 /-1 1 1 0 /1 1 0 1 /1 1 1 -1 1 /-1 1 1 1 1 /1 1 1 -1 1 /1 -1 1 1 1 /"]
		],
		reflect : [
			["分岐している線があります。","pzprv3/reflect/5/5/49 . . . . /. . . . . /. . . 2 . /. . + . . /. . . . 24 /0 0 0 0 /0 0 0 0 /0 1 1 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 1 0 /0 0 1 0 0 /0 0 1 0 0 /"],
			["十字以外の場所で線が交差しています。","pzprv3/reflect/5/5/49 . . . . /. . . . . /. . . 2 . /. . + . . /. . . . 24 /0 0 0 0 /0 0 0 0 /0 1 1 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 1 1 0 /0 0 1 0 0 /0 0 1 0 0 /"],
			["三角形の数字とそこから延びる線の長さが一致していません。","pzprv3/reflect/5/5/49 . . . . /. . . . . /. . . 2 . /. . + . . /. . . . 24 /0 0 0 0 /0 0 0 0 /0 0 1 0 /0 0 0 0 /0 0 1 1 /0 0 0 0 0 /0 0 0 1 0 /0 0 1 0 1 /0 0 1 0 1 /"],
			["線が三角形を通過していません。","pzprv3/reflect/5/5/49 . . . . /. . . . . /. . . 2 . /. . + . . /. . . . 24 /1 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /1 0 1 1 /1 0 0 0 0 /1 0 0 0 0 /1 0 1 0 0 /1 0 1 0 1 /"],
			["三角形の数字とそこから延びる線の長さが一致していません。","pzprv3/reflect/5/5/49 . . . . /. . . . . /. . . 2 . /. . + . . /. . . . 24 /1 0 0 0 /0 0 0 0 /0 0 1 0 /0 0 0 0 /1 0 1 1 /1 0 0 0 0 /1 0 0 1 0 /1 0 1 0 0 /1 0 1 0 1 /"],
			["十字の場所で線が交差していません。","pzprv3/reflect/5/5/49 . . . . /. . . . . /. . . 2 . /. . + . . /. . . . 24 /1 1 1 1 /0 0 0 0 /0 0 1 0 /0 0 0 0 /1 0 1 1 /1 0 0 0 1 /1 0 0 1 0 /1 0 1 0 0 /1 0 1 0 1 /"],
			["線が途中で途切れています。","pzprv3/reflect/5/5/49 . . . . /. . . . . /. . . 2 . /. . . . . /. . . . 2-2 /1 1 1 1 /0 1 1 0 /0 1 1 0 /0 0 1 1 /1 0 1 1 /1 0 0 0 1 /1 1 0 1 0 /1 0 0 0 0 /1 0 1 0 1 /"],
			["輪っかが一つではありません。","pzprv3/reflect/5/5/49 . . . . /. . . . . /. . . 2 . /. . . . . /. . . . 2-2 /1 1 1 1 /0 1 1 0 /0 1 1 0 /0 0 0 0 /1 1 1 1 /1 0 0 0 1 /1 1 0 1 1 /1 0 0 0 1 /1 0 0 0 1 /"],
			["","pzprv3/reflect/5/5/49 . . . . /. . . . . /. . . 2 . /. . + . . /. . . . 24 /1 1 1 1 /0 0 -1 1 /0 -1 1 0 /-1 1 1 1 /1 0 1 1 /1 0 0 -1 1 /1 0 -1 1 0 /1 -1 1 0 0 /1 1 1 0 1 /"]
		],
		renban : [
			["1つの部屋に同じ数字が複数入っています。","pzprv3/renban/4/4/1 1 1 /1 1 1 /0 1 1 /0 1 1 /1 0 1 0 /0 0 0 0 /1 1 1 0 /1 . . . /. . . . /. . . 5 /. 2 . . /. 3 . . /2 . . . /. 3 . . /. . . . /"],
			["数字の入っていないマスがあります。","pzprv3/renban/4/4/1 1 1 /1 1 1 /0 1 1 /0 1 1 /1 0 1 0 /0 0 0 0 /1 1 1 0 /1 . . . /. . . . /. . . 5 /. 2 . . /. 3 . . /2 . . . /. 5 . . /4 . . . /"],
			["数字の差がその間にある線の長さと等しくありません。","pzprv3/renban/4/4/1 1 1 /1 1 1 /0 1 1 /0 1 1 /1 0 1 0 /0 0 0 0 /1 1 1 0 /1 . . . /. . . . /. . . 5 /. 2 . . /. 3 7 . /2 4 8 . /6 5 9 . /3 . 7 . /"],
			["","pzprv3/renban/4/4/1 1 1 /1 1 1 /0 1 1 /0 1 1 /1 0 1 0 /0 0 0 0 /1 1 1 0 /1 . . . /. . . . /. . . 5 /. 2 . . /. 3 7 3 /2 4 8 4 /6 5 9 . /3 . 6 2 /"]
		],
		ripple : [
			["1つの部屋に同じ数字が複数入っています。","pzprv3/ripple/4/4/0 1 0 /0 1 1 /0 1 1 /1 0 1 /1 1 0 1 /1 1 0 0 /1 0 1 0 /. . . . /. 1 4 . /. 3 2 . /. . . . /. . . . /. . . . /. . . . /. . 3 . /"],
			["数字よりもその間隔が短いところがあります。","pzprv3/ripple/4/4/0 1 0 /0 1 1 /0 1 1 /1 0 1 /1 1 0 1 /1 1 0 0 /1 0 1 0 /. . . . /. 1 4 . /. 3 2 . /. . . . /1 2 . . /2 . . . /4 . . 3 /1 2 1 . /"],
			["数字の入っていないマスがあります。","pzprv3/ripple/4/4/0 1 0 /0 1 1 /0 1 1 /1 0 1 /1 1 0 1 /1 1 0 0 /1 0 1 0 /. . . . /. 1 4 . /. 3 2 . /. . . . /1 2 . . /2 . . . /4 . . . /1 2 1 . /"],
			["","pzprv3/ripple/4/4/0 1 0 /0 1 1 /0 1 1 /1 0 1 /1 1 0 1 /1 1 0 0 /1 0 1 0 /. . . . /. 1 4 . /. 3 2 . /. . . . /1 2 3 1 /2 . . 2 /4 . . 1 /1 2 1 3 /"]
		],
		shakashaka : [
			["数字のまわりにある黒い三角形の数が間違っています。","pzprv3/shakashaka/6/6/2 . . . 1 . /. . . 3 . . /. . 4 . . . /3 . . . . . /. . . . . . /. . . 1 . . /. 5 4 . . . /5 . 3 . . . /2 3 . . . . /. . . . . . /. . . . . . /. 2 3 . 2 3 /"],
			["白マスが長方形(正方形)ではありません。","pzprv3/shakashaka/6/6/2 . . . 1 . /. . . 3 . . /. . 4 . . . /3 . . . . . /. . . . . . /. . . 1 . . /. 5 4 . . . /5 . 3 . . . /2 3 . . . . /. . . . . . /. . . . . . /. . . . 2 3 /"],
			["白マスが長方形(正方形)ではありません。","pzprv3/shakashaka/6/6/2 . . . 1 . /. . . 3 . 5 /. . 4 . . . /3 . . . . . /. . . . . . /. . . 5 . . /. 5 4 . . . /5 . 3 . . . /2 3 . . 5 4 /. 5 4 5 . 3 /5 . 3 2 . 4 /2 3 . . 2 3 /"],
			["白マスが長方形(正方形)ではありません。","pzprv3/shakashaka/6/6/2 . . . 1 . /. . . 3 . . /. . 4 . . . /3 . . . . . /. . . . . . /. . . 1 . . /. 5 4 . . . /5 . 3 . 5 4 /2 3 . 5 5 3 /. 5 4 2 3 . /5 . 3 . 5 4 /2 3 . . 2 3 /"],
			["数字のまわりにある黒い三角形の数が間違っています。","pzprv3/shakashaka/6/6/2 . . . 1 . /. . . 3 . . /. . 4 . . . /3 . . . . . /. . . . . . /. . . 1 . . /. 5 4 . . . /5 . 3 . . . /2 3 . . 5 4 /. 5 4 5 . 3 /5 . 3 2 . 4 /2 3 . . 2 3 /"],
			["","pzprv3/shakashaka/6/6/2 . . . 1 . /. . . 3 . . /. . 4 . . . /3 . . . . . /. . . . . . /. . . 1 . . /. 5 4 + . + /5 . 3 . 5 4 /2 3 . 5 . 3 /. 5 4 2 3 . /5 . 3 + 5 4 /2 3 + . 2 3 /"]
		],
		shikaku : [
			["数字の入っていない領域があります。","pzprv3/shikaku/6/6/. . . . 3 . /5 6 . . 6 . /. . . . . . /. . . . . . /. 6 . . 2 3 /. 5 . . . . /0 0 0 0 0 /0 1 0 1 0 /0 1 0 1 0 /0 1 0 1 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 1 1 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 1 1 0 0 /0 0 0 0 0 0 /"],
			["1つの領域に2つ以上の数字が入っています。","pzprv3/shikaku/6/6/. . . . 3 . /5 6 . . 6 . /. . . . . . /. . . . . . /. 6 . . 2 3 /. 5 . . . . /0 0 0 0 0 /1 0 0 0 0 /1 0 0 0 0 /1 0 0 0 0 /1 0 0 0 0 /0 -1 -1 -1 0 /0 0 0 0 0 0 /-1 0 0 0 0 0 /-1 0 0 0 0 0 /-1 0 0 0 0 0 /0 1 1 1 1 0 /"],
			["四角形ではない領域があります。","pzprv3/shikaku/6/6/. . . . 3 . /5 6 . . 6 . /. . . . . . /. . . . . . /. 6 . . 2 3 /. 5 . . . . /0 1 1 0 0 /1 0 1 0 0 /1 0 1 0 0 /1 -1 1 0 1 /1 -1 1 0 1 /0 -1 -1 -1 1 /0 1 0 1 1 1 /-1 0 0 0 0 0 /-1 1 1 1 1 1 /-1 -1 -1 0 0 0 /1 1 1 1 1 0 /"],
			["数字と領域の大きさが違います。","pzprv3/shikaku/6/6/. . . . 3 . /5 6 . . 6 . /. . . . . . /. . . . . . /. 6 . . 2 3 /. 5 . . . . /1 0 1 0 0 /1 0 1 0 0 /1 0 1 0 0 /1 -1 1 0 1 /1 -1 1 0 1 /0 -1 -1 -1 1 /0 0 0 1 1 1 /-1 1 1 0 0 0 /-1 0 0 1 1 1 /-1 -1 -1 0 0 0 /1 1 1 1 1 0 /"],
			["途切れている線があります。","pzprv3/shikaku/6/6/. . . . 3 . /5 6 . . 6 . /. . . . . . /. . . . . . /. 6 . . 2 3 /. 5 . . . . /1 0 1 0 0 /1 0 1 0 0 /1 0 1 0 0 /1 -1 0 1 1 /1 -1 1 1 1 /0 -1 -1 -1 1 /0 0 0 1 1 1 /-1 0 0 0 0 0 /-1 1 1 1 1 1 /-1 -1 -1 0 0 0 /1 1 1 1 1 0 /"],
			["","pzprv3/shikaku/6/6/. . . . 3 . /5 6 . . 6 . /. . . . . . /. . . . . . /. 6 . . 2 3 /. 5 . . . . /1 -1 1 0 0 /1 0 1 0 0 /1 -1 1 0 0 /1 -1 0 1 1 /1 -1 0 1 1 /0 -1 -1 -1 1 /0 -1 -1 1 1 1 /-1 -1 -1 0 0 0 /-1 1 1 1 1 1 /-1 -1 -1 0 0 0 /1 1 1 1 1 0 /"]
		],
		shimaguni : [
			["異なる海域にある国どうしが辺を共有しています。","pzprv3/shimaguni/6/6/8/0 0 0 1 2 3 /4 4 5 1 2 3 /4 4 5 1 2 2 /5 5 5 1 2 2 /6 6 6 6 6 6 /6 6 7 7 7 7 /3 . . . 3 . /2 . . . . . /. . . . . . /. . . . . . /4 . . . . . /. . 3 . . . /# # # . . . /# # . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /"],
			["1つの海域に入る国が2つ以上に分裂しています。","pzprv3/shimaguni/6/6/8/0 0 0 1 2 3 /4 4 5 1 2 3 /4 4 5 1 2 2 /5 5 5 1 2 2 /6 6 6 6 6 6 /6 6 7 7 7 7 /3 . . . 3 . /2 . . . . . /. . . . . . /. . . . . . /4 . . . . . /. . 3 . . . /# # # + . . /+ + + . . . /# # + . . . /+ + # . . . /# # + # # # /# # . . . . /"],
			["海域内の数字と国のマス数が一致していません。","pzprv3/shimaguni/6/6/8/0 0 0 1 2 3 /4 4 5 1 2 3 /4 4 5 1 2 2 /5 5 5 1 2 2 /6 6 6 6 6 6 /6 6 7 7 7 7 /3 . . . 3 . /2 . . . . . /. . . . . . /. . . . . . /4 . . . . . /. . 3 . . . /# # # + . . /+ + + . . . /# # + . . . /+ + # . . . /# # + + + + /# + . . . . /"],
			["隣り合う海域にある国の大きさが同じです。","pzprv3/shimaguni/6/6/8/0 0 0 1 2 3 /4 4 5 1 2 3 /4 4 5 1 2 2 /5 5 5 1 2 2 /6 6 6 6 6 6 /6 6 7 7 7 7 /3 . . . 3 . /2 . . . . . /. . . . . . /. . . . . . /4 . . . . . /. . 3 . . . /# # # + . . /+ + + . . . /# # + # . # /+ + # + # # /# # + + + + /# # + # # # /"],
			["黒マスのカタマリがない海域があります。","pzprv3/shimaguni/6/6/8/0 0 0 1 2 3 /4 4 5 1 2 3 /4 4 5 1 2 2 /5 5 5 1 2 2 /6 6 6 6 6 6 /6 6 7 7 7 7 /3 . . . 3 . /2 . . . . . /. . . . . . /. . . . . . /4 . . . . . /. . 3 . . . /# # # + . . /+ + + # . . /# # + # . # /+ + # + # # /# # + + + + /# # + # # # /"],
			["","pzprv3/shimaguni/6/6/8/0 0 0 1 2 3 /4 4 5 1 2 3 /4 4 5 1 2 2 /5 5 5 1 2 2 /6 6 6 6 6 6 /6 6 7 7 7 7 /3 . . . 3 . /2 . . . . . /. . . . . . /. . . . . . /4 . . . . . /. . 3 . . . /# # # + . # /+ + + # + + /# # + # + # /+ + # + # # /# # + + + + /# # + # # # /"]
		],
		shugaku : [
			["北枕になっている布団があります。","pzprv3/shugaku/5/5/. . . . . /. . 5 . . /. . . . . /c 4 . 2 . /g . . . . /"],
			["2x2の黒マスのかたまりがあります。","pzprv3/shugaku/5/5/. . . . . /. . 5 # # /. a . # # /a 4 a 2 . /j d . . . /"],
			["柱のまわりにある枕の数が間違っています。","pzprv3/shugaku/5/5/. - - - . /. - 5 - # /. a - # # /a 4 a 2 a /j d . a . /"],
			["布団が2マスになっていません。","pzprv3/shugaku/5/5/. . . . . /. . 5 . . /h a . . . /b 4 a 2 . /j d . . . /"],
			["通路に接していない布団があります。","pzprv3/shugaku/5/5/. . . . . /. h 5 . . /h b h . . /b 4 b 2 . /j d # # # /"],
			["黒マスが分断されています。","pzprv3/shugaku/5/5/# # # # . /# h 5 . . /h b h . . /b 4 b 2 . /j d # # # /"],
			["柱のまわりにある枕の数が間違っています。","pzprv3/shugaku/5/5/# # # # . /# h 5 # . /h b h # # /b 4 b 2 # /j d # # # /"],
			["布団でも黒マスでもないマスがあります。","pzprv3/shugaku/5/5/# # # # # /# h . h # /h b h b # /b 4 b 2 # /j d # # # /"],
			["","pzprv3/shugaku/5/5/# # # # # /# h 5 h # /h b h b # /b 4 b 2 # /j d # # # /"]
		],
		shwolf : [
			["分岐している線があります。","pzprv3/shwolf/5/5/1 . 2 2 2 /. 1 1 . 1 /. 2 . 2 . /1 . 1 2 . /1 1 2 . 1 /. . . . . . /. 1 . . 1 . /. . . . . . /. . . . . . /. 1 . . 1 . /. . . . . . /0 0 0 0 /1 0 0 0 /1 0 0 0 /1 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /1 1 1 1 0 /"],
			["線が黒点上で交差しています。","pzprv3/shwolf/5/5/1 . 2 2 2 /. 1 1 . 1 /. 2 . 2 . /1 . 1 2 . /1 1 2 . 1 /. . . . . . /. 1 . . 1 . /. . . . . . /. . . . . . /. 1 . . 1 . /. . . . . . /0 0 0 0 /1 0 0 0 /1 0 0 0 /1 0 0 0 /1 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /1 1 1 1 0 /"],
			["線が黒点以外で曲がっています。","pzprv3/shwolf/5/5/1 . 2 2 2 /. 1 1 . 1 /. 2 . 2 . /1 . 1 2 . /1 1 2 . 1 /. . . . . . /. 1 . . 1 . /. . . . . . /. . . . . . /. 1 . . 1 . /. . . . . . /0 0 0 0 /1 0 0 0 /1 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 1 1 1 1 /0 0 0 0 0 /"],
			["外枠につながっていない線があります。","pzprv3/shwolf/5/5/1 . 2 2 2 /. 1 1 . 1 /. 2 . 2 . /1 . 1 2 . /1 1 2 . 1 /. . . . . . /. 1 . . 1 . /. . . . . . /. . . . . . /. 1 . . 1 . /. . . . . . /0 0 0 0 /1 0 0 0 /1 0 0 0 /1 0 0 0 /0 0 0 0 /0 1 1 1 0 /0 0 0 0 0 /0 0 0 0 0 /0 1 1 1 0 /"],
			["ヤギもオオカミもいない領域があります。","pzprv3/shwolf/5/5/1 . 2 2 2 /. 1 1 . 1 /. 2 . 2 . /1 . 1 2 . /1 1 2 . 1 /. . . . . . /. 1 . . 1 . /. . . . . . /. . . . . . /. 1 . . 1 . /. . . . . . /0 0 1 0 /1 0 1 1 /1 0 1 1 /1 0 1 1 /1 0 1 1 /0 1 1 1 0 /1 1 1 1 1 /0 0 0 0 0 /0 0 0 0 0 /"],
			["ヤギとオオカミが両方いる領域があります。","pzprv3/shwolf/5/5/1 . 2 2 2 /. 1 1 . 1 /. 2 . 2 . /1 . 1 2 . /1 1 2 . 1 /. . . . . . /. 1 . . 1 . /. . . . . . /. . . . . . /. 1 . . 1 . /. . . . . . /0 0 1 0 /1 0 1 0 /1 0 1 0 /1 0 1 0 /1 0 1 1 /0 1 1 1 0 /1 1 1 1 1 /0 0 0 0 0 /0 0 0 0 0 /"],
			["途中で途切れている線があります。","pzprv3/shwolf/5/5/1 . 2 2 2 /. 1 1 . 1 /. . . 2 . /1 . 1 2 . /1 1 2 . 1 /. . . . . . /. 1 . . 1 . /. . . . . . /. . . . . . /. 1 . . 1 . /. . . . . . /0 1 1 0 /0 1 1 0 /0 1 1 0 /0 1 1 0 /0 1 1 0 /0 1 1 1 1 /1 1 1 1 1 /0 0 0 0 0 /0 1 1 1 1 /"],
			["","pzprv3/shwolf/5/5/1 . 2 2 2 /. 1 1 . 1 /. 2 . 2 . /1 . 1 2 . /1 1 2 . 1 /. . . . . . /. 1 . . 1 . /. . . . . . /. . . . . . /. 1 . . 1 . /. . . . . . /0 1 1 0 /1 1 1 0 /1 1 1 -1 /1 1 1 -1 /-1 1 1 -1 /0 1 1 1 1 /1 1 1 1 1 /-1 0 -1 -1 -1 /-1 1 1 1 1 /"]
		],
		slalom : [
			["黒マスに線が通っています。","pzprv3/slalom/6/6/. . . . . . /w # . # w4 # /w # . # w # /. . . . . . /. # # w1 # . /. . . o . . /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 1 0 0 0 0 /0 1 0 0 0 0 /"],
			["交差している線があります。","pzprv3/slalom/6/6/. . . . . . /w # . # w4 # /w # . . w # /. . . . . . /. # # w1 # . /. . . o . . /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 1 1 1 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 1 0 0 /0 0 0 1 0 0 /0 0 0 1 0 0 /"],
			["分岐している線があります。","pzprv3/slalom/6/6/. . . . . . /w # . # w4 # /w # . . w # /. . . . . . /. # # w1 # . /. . . o . . /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 1 1 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 1 0 0 /0 0 0 1 0 0 /0 0 0 1 0 0 /"],
			["線が２回以上通過している旗門があります。","pzprv3/slalom/6/6/. . . . . . /w # . # w4 # /w w w # w # /. . . . . . /. # # w1 # . /. . . o . . /1 1 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /1 1 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /1 0 1 0 0 0 /1 0 1 0 0 0 /1 0 1 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /"],
			["旗門を通過する順番が間違っています。","pzprv3/slalom/6/6/. . . . . . /w # . # w4 # /w # . # w # /. . . . . . /. # # w1 # . /. . . o . . /1 1 1 1 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 1 0 /0 0 0 0 0 /1 1 1 0 0 /1 0 0 0 1 0 /1 0 0 0 1 0 /1 0 0 0 1 0 /1 0 0 1 0 0 /1 0 0 1 0 0 /"],
			["線が途中で途切れています。","pzprv3/slalom/6/6/. . . . . . /w # . # w4 # /w # . # w # /. . . . . . /. # # w1 # . /. . . o . . /1 1 1 1 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /1 1 1 0 0 /1 0 0 0 1 0 /1 0 0 0 1 0 /1 0 0 0 1 0 /0 0 0 1 0 0 /0 0 0 1 0 0 /"],
			["輪っかが一つではありません。","pzprv3/slalom/6/6/. . . . . . /w # . # w4 # /w # . # w # /. . . . . . /. # # w1 # . /. . . o . . /1 1 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /1 1 0 1 1 /0 0 0 0 0 /0 0 0 1 1 /1 0 1 0 0 0 /1 0 1 0 0 0 /1 0 1 0 0 0 /0 0 0 1 0 1 /0 0 0 1 0 1 /"],
			["線が通過していない旗門があります。","pzprv3/slalom/6/6/. . . . . . /w # . # w4 # /w # . # w # /. . . . . . /. # # w1 # . /. . . o . . /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /1 1 1 1 1 /0 0 0 0 0 /1 1 1 1 1 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /1 0 0 0 0 1 /1 0 0 0 0 1 /"],
			["","pzprv3.1/slalom/6/6/. . . . . . /- # . 4 - 4 /- # . # - # /. . . . . . /. # 1 - 1 . /. . . o . . /1 1 1 1 0 /0 0 0 0 0 /0 0 0 0 0 /1 1 1 0 1 /0 0 0 0 0 /-1 -1 -1 1 1 /1 0 -1 0 1 0 /1 0 -1 0 1 0 /1 0 -1 0 1 0 /-1 0 0 1 0 1 /-1 0 0 1 0 1 /"]
		],
		slither : [
			["分岐している線があります。","pzprv3/slither/5/5/2 . . 1 . /. 2 . . 1 /. . 2 . . /3 . . 3 . /. 0 . . 3 /1 0 0 0 0 0 /1 1 0 0 0 0 /1 0 0 0 0 0 /1 0 0 0 0 0 /1 0 0 0 0 0 /1 1 0 0 0 /0 1 0 0 0 /0 0 0 0 0 /1 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			["線が交差しています。","pzprv3/slither/5/5/2 . . 1 . /. 2 . . 1 /. . 2 . . /3 . . 3 . /. 0 . . 3 /1 0 0 0 0 0 /1 1 0 1 0 0 /1 1 1 0 1 0 /1 1 1 0 1 0 /0 0 0 0 1 0 /1 1 0 0 0 /0 1 1 0 0 /0 0 1 0 0 /0 0 0 0 0 /1 0 1 1 1 /0 0 0 0 0 /"],
			["数字の周りにある境界線の本数が違います。","pzprv3/slither/5/5/2 . . 1 . /. 2 . . 1 /. . 2 . . /3 . . 3 . /. 0 . . 3 /1 0 0 0 0 0 /1 1 0 1 0 0 /1 1 1 0 0 0 /1 1 1 0 0 0 /0 0 0 0 0 0 /1 1 0 0 0 /0 1 1 0 0 /0 0 1 0 0 /0 0 0 0 0 /1 0 1 1 0 /0 0 0 0 0 /"],
			["輪っかが一つではありません。","pzprv3/slither/5/5/2 . . 0 . /. 2 . . 1 /. . 2 . . /3 . . 3 . /. 0 . . 3 /1 0 1 0 0 0 /1 1 0 0 0 0 /1 1 1 0 0 1 /1 1 1 1 1 1 /0 0 0 0 1 1 /1 1 0 0 0 /0 1 0 0 0 /0 0 1 1 1 /0 0 0 1 0 /1 0 1 0 0 /0 0 0 0 1 /"],
			["途中で途切れている線があります。","pzprv3/slither/5/5/2 . . 1 . /. 2 . . 1 /. . 2 . . /3 . . 3 . /. 0 . . 3 /1 0 0 0 0 0 /1 1 0 1 0 0 /1 1 1 0 0 1 /1 1 1 1 1 1 /0 0 0 0 1 1 /1 1 1 1 0 /0 1 1 0 0 /0 0 1 0 1 /0 0 0 1 0 /1 0 1 0 0 /0 0 0 0 1 /"],
			["","pzprv3/slither/5/5/2 . . 1 . /. 2 . . 1 /. . 2 . . /3 . . 3 . /. 0 . . 3 /1 -1 0 -1 -1 1 /1 1 -1 1 -1 1 /1 1 1 0 0 1 /1 1 1 1 1 1 /-1 -1 -1 0 1 1 /1 1 1 1 1 /-1 1 1 -1 -1 /0 -1 1 0 0 /0 0 0 1 0 /1 -1 1 -1 0 /-1 0 -1 0 1 /"]
		],
		snakes : [
			["大きさが５ではない蛇がいます。","pzprv3/snakes/5/5/. 2,1 . . . /. . . . 2,3 /. . 2,0 . . /4,5 . . . . /. . . 4,1 . /. . . . . /. 1 . . . /. . . . . /. . . . . /. . . . . /"],
			["同じ数字が入っています。","pzprv3/snakes/5/5/. 2,1 . . . /. . . . 2,3 /. . 2,0 . . /4,5 . . . . /. . . 4,1 . /. . . . . /. 1 2 3 . /. . . 2 . /. . . 1 . /. . . . . /"],
			["別々の蛇が接しています。","pzprv3/snakes/5/5/. 2,1 . . . /. . . . 2,3 /. . 2,0 . . /4,5 . . . . /. . . 4,1 . /. . 3 2 1 /2 1 4 5 . /3 4 . . . /. 5 + . . /+ + + . . /"],
			["矢印の方向にある数字が正しくありません。","pzprv3/snakes/5/5/. 2,1 . . . /. . . . 2,3 /. . 2,0 . . /4,5 . . . . /. . . 4,1 . /. . . . . /2 1 + . . /3 4 + 4 5 /. 5 + 3 2 /+ + + . 1 /"],
			["蛇の視線の先に別の蛇がいます。","pzprv3/snakes/5/5/. 2,1 . . . /. . . . 2,3 /. . 2,0 . . /4,5 . . . . /. . . 4,1 . /. . . . . /2 1 + 5 . /3 4 + 4 3 /. 5 + . 2 /+ + + . 1 /"],
			["","pzprv3/snakes/5/5/. 2,1 . . . /. . . . 2,3 /. . 2,0 . . /4,5 . . . . /. . . 4,1 . /. . . . . /2 1 + . . /3 4 + 4 3 /. 5 + 5 2 /+ + + . 1 /"]
		],
		sudoku : [
			["同じブロックに同じ数字が入っています。","pzprv3/sudoku/4/. 1 . . /. . . 2 /3 . . . /. . 3 . /. . . . /1 . . . /. . . . /. . . . /"],
			["同じ列に同じ数字が入っています。","pzprv3/sudoku/4/. 1 . . /. . . 2 /3 . . . /. . 3 . /. . . . /. . . . /. . . . /. 1 . . /"],
			["数字の入っていないマスがあります。","pzprv3/sudoku/4/. 1 . . /. . . 2 /3 . . . /. . 3 . /2 . . . /. . . . /. 4 2 . /1 2 . . /"],
			["","pzprv3/sudoku/4/. 1 . . /. . . 2 /3 . . . /. . 3 . /2 . 4 3 /4 3 1 . /. 4 2 1 /1 2 . 4 /"]
		],
		sukoro : [
			["同じ数字がタテヨコに連続しています。","pzprv3/sukoro/5/5/2 . 2 . . /. 4 . 2 . /. . . . . /. 2 . 4 . /. . 2 . 2 /. 3 . . . /3 . 3 . . /2 3 . . . /. . 3 . . /. 2 . . . /"],
			["数字と、その数字の上下左右に入る数字の数が一致していません。","pzprv3/sukoro/5/5/2 . 2 . . /. 4 . 2 . /. . . . . /. 2 . 4 . /. . 2 . 2 /. 3 . . . /3 . 3 . . /2 3 . . . /. . 3 . . /. . . . . /"],
			["タテヨコにつながっていない数字があります。","pzprv3/sukoro/5/5/. . 1 . . /. 1 . . . /. . . . . /. 2 . . . /. . 2 . . /1 3 . . . /. . . . . /. . 1 . . /. . 4 1 . /1 3 . . . /"],
			["","pzprv3/sukoro/5/5/2 . 2 . . /. 4 . 2 . /. . . . . /. 2 . 4 . /. . 2 . 2 /. 3 . - - /3 . 3 . - /2 3 - 3 2 /- . 3 . 3 /. - . 3 . /"]
		],
		sukororoom : [
			["1つの部屋に同じ数字が複数入っています。","pzprv3/sukororoom/5/5/0 0 1 0 /0 1 1 1 /1 1 1 0 /0 1 1 0 /1 0 1 1 /1 1 1 0 1 /1 0 1 1 1 /0 1 1 1 1 /1 1 0 0 1 /. . 3 . . /. . . . . /. . 2 . . /. . . . . /. . 3 . . /3 . . . . /. . . . . /. . . . . /. . . . . /. . . . . /"],
			["数字のあるなしが混在した部屋があります。","pzprv3/sukororoom/5/5/0 0 1 0 /0 1 1 1 /1 1 1 0 /0 1 1 0 /1 0 1 1 /1 1 1 0 1 /1 0 1 1 1 /0 1 1 1 1 /1 1 0 0 1 /. . 3 . . /. . . . . /. . 2 . . /. . . . . /. . 3 . . /. . . . . /. . . . . /. . . . . /. . . . . /. . . . . /"],
			["数字と、その数字の上下左右に入る数字の数が一致していません。","pzprv3/sukororoom/5/5/0 0 1 0 /0 1 1 1 /1 1 1 0 /0 1 1 0 /1 0 1 1 /1 1 1 0 1 /1 0 1 1 1 /0 1 1 1 1 /1 1 0 0 1 /. . 3 . . /. . . . . /. . 2 . . /. . . . . /. . 3 . . /1 4 . . . /. . . . . /. . . . . /. . + . . /. + . . . /"],
			["タテヨコにつながっていない数字があります。","pzprv3/sukororoom/5/5/0 0 1 0 /0 1 1 1 /1 1 1 0 /0 1 1 0 /1 0 1 1 /1 1 1 0 1 /1 0 1 1 1 /0 1 1 1 1 /1 1 0 0 1 /. . 3 . . /. . . . . /. . . . . /. . . . . /. . 3 . . /1 2 . + + /- - + + . /. - . . . /. . + + + /. + . + . /"],
			["数字の入っていないマスがあります。","pzprv3/sukororoom/5/5/0 0 1 0 /0 1 1 1 /1 1 1 0 /0 1 1 0 /1 0 1 1 /1 1 1 0 1 /1 0 1 1 1 /0 1 1 1 1 /1 1 0 0 1 /. . 3 . . /. . . . . /. . 2 . . /. . . . . /. . 3 . . /1 2 . + + /- - + + . /. - . . . /. . + + + /. + . + . /"],
			["","pzprv3/sukororoom/5/5/0 0 1 0 /0 1 1 1 /1 1 1 0 /0 1 1 0 /1 0 1 1 /1 1 1 0 1 /1 0 1 1 1 /0 1 1 1 1 /1 1 0 0 1 /. . 3 . . /. . . . . /. . 2 . . /. . . . . /. . 3 . . /1 2 . 3 1 /- - 3 2 - /1 - . - - /2 3 4 3 1 /- 2 . 2 - /"]
		],
		tasquare : [
			["正方形でない黒マスのカタマリがあります。","pzprv3/tasquare/6/6/1 # - . . . /4 # # . . 1 /. . . 3 . . /. . 5 . . . /5 . . . . - /. . . 2 . 1 /"],
			["白マスが分断されています。","pzprv3/tasquare/6/6/1 . - # . . /4 . # . . 1 /. # . 3 . . /# . 5 . . . /5 . . . . - /. . . 2 . 1 /"],
			["数字とそれに接する黒マスの大きさの合計が一致しません。","pzprv3/tasquare/6/6/1 . - . . . /4 . . . . 1 /. . . 3 . . /. . 5 . . . /5 . . . . - /. . . 2 . 1 /"],
			["数字のない□に黒マスが接していません。","pzprv3/tasquare/6/6/1 # - . . # /4 . . # . 1 /# # . 3 # . /# # 5 # . . /5 . . . . - /# . # 2 # 1 /"],
			["","pzprv3/tasquare/6/6/1 # - + + # /4 + + # + 1 /# # + 3 # + /# # 5 # + # /5 . + + + - /# . # 2 # 1 /"]
		],
		tatamibari : [
			["十字の交差点があります。","pzprv3/tatamibari/5/5/. . . . . /. . c . a /a . . . b /. c a . . /a c . c . /0 0 0 0 /0 0 0 0 /0 0 0 0 /1 1 0 0 /1 1 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 1 0 0 0 /1 1 0 0 0 /"],
			["記号の入っていないタタミがあります。","pzprv3/tatamibari/5/5/. . . . . /. . c . a /a . . . b /. c a . . /a c . c . /1 1 0 0 /1 1 0 0 /1 1 0 0 /1 1 0 0 /1 1 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 1 0 0 0 /0 1 0 0 0 /"],
			["正方形でないタタミがあります。","pzprv3/tatamibari/5/5/. . . . . /. . c . a /a . . . b /. c a . . /a c . c . /1 0 0 1 /1 0 0 1 /0 0 0 0 /1 1 0 0 /1 1 0 0 /0 0 0 0 0 /0 1 1 1 0 /0 1 0 0 0 /0 1 0 0 0 /"],
			["横長ではないタタミがあります。","pzprv3/tatamibari/5/5/. . . . . /. . c . a /a . . . b /. c a . . /a c . c . /0 0 0 0 /0 0 0 0 /0 0 0 1 /1 1 0 1 /1 1 0 1 /0 0 0 0 0 /0 0 0 0 1 /0 1 0 0 0 /0 1 0 0 0 /"],
			["縦長ではないタタミがあります。","pzprv3/tatamibari/5/5/. . . . . /. . c . a /a . . . b /. c a . . /a c . c . /0 0 1 0 /0 0 1 0 /0 0 0 0 /1 1 0 0 /1 1 0 0 /0 0 0 0 0 /0 0 0 1 1 /0 1 0 0 0 /0 1 0 0 0 /"],
			["1つのタタミに2つ以上の記号が入っています。","pzprv3/tatamibari/5/5/. . . . . /. . c . a /a . . . b /. c a . . /a c . c . /0 0 0 0 /0 0 0 0 /0 0 0 0 /1 1 0 0 /1 1 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 1 0 0 0 /0 1 0 0 0 /"],
			["タタミの形が長方形ではありません。","pzprv3/tatamibari/5/5/. . . . . /. . c . a /a . . . b /. c a . . /a c . c . /0 1 0 1 /0 1 0 1 /0 1 1 0 /1 1 1 1 /1 1 1 0 /0 0 0 0 0 /0 0 1 1 1 /1 1 0 1 0 /0 1 0 0 1 /"],
			["途中で途切れている線があります。","pzprv3/tatamibari/5/5/. . . . . /. . c . a /a . . . b /. c a . . /a c . c . /0 1 0 1 /0 1 0 1 /0 1 1 0 /1 1 1 1 /1 1 1 0 /0 0 0 0 0 /0 0 1 1 1 /1 1 0 1 1 /0 1 0 0 0 /"],
			["","pzprv3/tatamibari/5/5/. . . . . /. . c . a /a . . . b /. c a . . /a c . c . /-1 1 0 1 /0 1 0 1 /-1 1 1 0 /1 1 1 0 /1 1 1 0 /-1 -1 0 0 0 /-1 -1 1 1 1 /1 1 -1 1 1 /0 1 -1 0 0 /"]
		],
		tateyoko : [
			["黒マスに繋がる線の数が正しくありません。","pzprv3/tateyoko/5/5/. . 3 . . /. e . e 2 /. . 5 . . /2 a . b . /. . 3 . . /0 0 0 0 0 /2 . 2 . 2 /0 0 0 0 0 /0 . 0 . 0 /0 0 0 0 0 /"],
			["1つの棒に2つ以上の数字が入っています。","pzprv3/tateyoko/5/5/. . 3 . . /. e . e 2 /. . 5 . . /2 a . b . /. . 3 . . /0 0 1 0 0 /0 . 1 . 0 /0 0 1 0 0 /0 . 1 . 0 /0 0 1 0 0 /"],
			["数字と棒の長さが違います。","pzprv3/tateyoko/5/5/. . 3 . . /. e . e 2 /. . 5 . . /2 a . b . /. . 3 . . /0 0 0 0 0 /0 . 0 . 0 /0 2 2 2 2 /0 . 0 . 0 /0 0 0 0 0 /"],
			["黒マスに繋がる線の数が正しくありません。","pzprv3/tateyoko/5/5/. . 3 . . /. e . e 2 /. . 5 . . /2 a . b . /. . 3 . . /0 0 0 0 0 /0 . 0 . 0 /2 2 2 2 2 /0 . 0 . 0 /0 0 0 0 0 /"],
			["何も入っていないマスがあります。","pzprv3/tateyoko/5/5/. . 3 . . /. e . e 2 /. . 5 . . /2 a . b . /. . 3 . . /1 2 2 2 1 /1 . 1 . 1 /2 2 2 2 2 /1 . 2 . 2 /1 2 2 2 0 /"],
			["","pzprv3/tateyoko/5/5/. . 3 . . /. e . e 2 /. . 5 . . /2 a . b . /. . 3 . . /1 2 2 2 1 /1 . 1 . 1 /2 2 2 2 2 /1 . 2 . 2 /1 2 2 2 1 /"]
		],
		tawa : [
			["数字の周りに入っている黒マスの数が違います。","pzprv3/tawa/5/5/0/. 2 . . 2 /. . 3 . /. . . . . /. 5 . . /2 . . . 2 /"],
			["黒マスの下に黒マスがありません。","pzprv3/tawa/5/5/0/. 2 . # 2 /. . 3 # /. . . . . /. 5 . # /2 . . # 2 /"],
			["黒マスが横に3マス以上続いています。","pzprv3/tawa/5/5/0/. 2 . # 2 /. . 3 # /# # # # . /. 5 . # /2 . . # 2 /"],
			["","pzprv3/tawa/5/5/0/# 2 + # 2 /# + 3 # /+ # # + # /# 5 # # /2 # + # 2 /"]
		],
		tentaisho : [
			["星を線が通過しています。","pzprv3/tentaisho/5/5/1...2...1/........./2....1..2/........./.1...2..1/........./......1../..2....../2.....2../1 0 0 0 /1 0 0 0 /1 0 0 0 /1 0 0 0 /1 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			["星が含まれていない領域があります。","pzprv3/tentaisho/5/5/1...2...1/........./2....1..2/........./.1...2..1/........./......1../..2....../2.....2../1 1 0 0 /1 1 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 1 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			["領域が星を中心に点対称になっていません。","pzprv3/tentaisho/5/5/1...2...1/........./2....1..2/........./.1...2..1/........./......1../..2....../2.....2../1 0 0 0 /1 1 0 0 /0 1 0 0 /0 0 0 0 /0 0 0 0 /1 1 0 0 0 /1 0 0 0 0 /1 1 0 0 0 /0 0 0 0 0 /1 0 0 0 0 /2 1 0 0 0 /1 1 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			["星が複数含まれる領域があります。","pzprv3/tentaisho/5/5/1...2...1/........./2....1..2/........./.1...2..1/........./......1../..2....../2.....2../1 0 0 0 /1 1 0 0 /0 1 0 0 /1 1 0 0 /1 1 0 0 /1 1 0 0 0 /1 0 0 0 0 /0 1 0 0 0 /1 0 0 0 0 /1 0 0 0 0 /2 1 0 0 0 /1 1 0 0 0 /1 2 0 0 0 /2 2 0 0 0 /"],
			["","pzprv3/tentaisho/5/5/1...2...1/........./2....1..2/........./.1...2..1/........./......1../..2....../2.....2../1 0 0 1 /1 1 0 1 /0 1 0 1 /1 1 0 0 /1 1 0 0 /1 1 1 1 1 /1 0 1 1 1 /0 1 1 1 1 /1 0 1 1 1 /1 2 2 2 1 /2 1 1 1 2 /1 1 2 2 1 /1 2 1 1 1 /2 2 2 2 2 /"]
		],
		tilepaint : [
			["白マスと黒マスの混在したタイルがあります。","pzprv3/tilepaint/6/6/19/0 1 1 2 3 3 /4 4 1 2 3 5 /6 7 1 8 8 9 /6 10 1 11 11 9 /12 12 13 14 11 15 /16 16 16 17 17 18 /0 2 3 4 2 3 2 /2 . . . . . . /4 . . . . . . /3 . . . . . . /3 . . . . . . /3 . . . . . . /1 . . . . . . /. # # . . . /. . # . . . /. . + . . . /. . + . . . /. . . . . . /. . . . . . /"],
			["数字の下か右にある黒マスの数が間違っています。","pzprv3/tilepaint/6/6/20/0 1 1 2 3 3 /4 4 1 2 3 5 /6 7 8 9 9 10 /6 11 8 12 12 10 /13 13 14 15 12 16 /17 17 17 18 18 19 /0 2 3 4 2 3 2 /2 . . . . . . /4 . . . . . . /3 . . . . . . /3 . . . . . . /3 . . . . . . /1 . . . . . . /. # # . . . /. . # . . . /. . + . . . /. . + . . . /. . . . . . /. . . . . . /"],
			["","pzprv3/tilepaint/6/6/20/0 1 1 2 3 3 /4 4 1 2 3 5 /6 7 8 9 9 10 /6 11 8 12 12 10 /13 13 14 15 12 16 /17 17 17 18 18 19 /0 2 3 4 2 3 2 /2 . . . . . . /4 . . . . . . /3 . . . . . . /3 . . . . . . /3 . . . . . . /1 . . . . . . /+ # # + + + /# # # + + # /+ + # # # + /+ + # # # + /# # + + # + /+ + + + + # /"]
		],
		toichika : [
			["1つの国に2つ以上の矢印が入っています。","pzprv3/toichika/4/4/6/0 1 1 2 /3 1 2 2 /3 3 4 5 /3 4 4 4 /4 . . . /. . . . /. . . . /. . . . /. . . . /2 . . . /. . . . /4 . . . /"],
			["辺を共有する国にペアとなる矢印が入っています。","pzprv3/toichika/4/4/6/0 1 1 2 /3 1 2 2 /3 3 4 5 /3 4 4 4 /4 . . . /. . . . /. . . . /. . . . /. + 3 . /. + . . /. . . . /. . . . /"],
			["矢印の先にペアとなる矢印がいません。","pzprv3/toichika/4/4/6/0 1 1 2 /3 1 2 2 /3 3 4 5 /3 4 4 4 /4 . . . /. . . . /. . . . /. . . . /. + + 3 /. 2 + + /. . . . /. . . . /"],
			["国に矢印が入っていません。","pzprv3/toichika/4/4/6/0 1 1 2 /3 1 2 2 /3 3 4 5 /3 4 4 4 /4 . . . /. . . . /. . . . /. . . . /. + + 3 /. 2 + + /. + . . /. 1 . . /"],
			["","pzprv3/toichika/4/4/6/0 1 1 2 /3 1 2 2 /3 3 4 5 /3 4 4 4 /4 . . . /. . . . /. . . . /. . . . /. + + 3 /+ 2 + + /4 + + 3 /+ 1 + + /"]
		],
		triplace : [
			["サイズが3マスより小さいブロックがあります。","pzprv3/triplace/5/5/0 -1 0 -1 1 -1 /-1 -1,2 . . . . /-1 . . . -1,-1 . /-1 . . . . . /1 . -1,1 . . . /1 . . . . -1,-1 /0 0 0 0 /1 0 0 0 /1 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /1 0 0 0 0 /0 0 0 0 0 /. . . . . /. . . . . /. . . . . /. . . . . /. . . . . /"],
			["数字の下か右にあるまっすぐのブロックの数が間違っています。","pzprv3/triplace/5/5/0 -1 0 -1 1 -1 /-1 -1,2 . . . . /-1 . . . -1,-1 . /-1 . . . . . /1 . -1,1 . . . /1 . . . . -1,-1 /0 0 0 0 /1 0 0 0 /1 0 0 0 /0 0 0 0 /-1 -1 1 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 1 0 /1 0 1 -1 0 /. - . . . /+ - . . . /+ - . . . /+ . . - . /+ + + - . /"],
			["サイズが3マスより大きいブロックがあります。","pzprv3/triplace/5/5/0 -1 0 -1 1 -1 /-1 -1,2 . . . . /-1 . . . -1,-1 . /-1 . . . . . /1 . -1,1 . . . /1 . . . . -1,-1 /0 1 0 0 /1 0 0 0 /1 0 0 0 /0 0 0 0 /-1 -1 1 0 /0 0 1 0 1 /0 0 0 0 0 /0 0 0 1 0 /1 0 1 -1 0 /. - . . . /+ - . . . /+ - . . . /+ . . - . /+ + + - . /"],
			["","pzprv3/triplace/5/5/0 -1 0 -1 1 -1 /-1 -1,2 . . . . /-1 . . . -1,-1 . /-1 . . . . . /1 . -1,1 . . . /1 . . . . -1,-1 /0 1 0 0 /1 0 0 0 /1 0 1 0 /0 0 1 0 /-1 -1 1 0 /0 0 1 0 1 /0 1 1 0 0 /0 0 -1 1 1 /1 0 1 -1 0 /. - + + + /+ - - . . /+ - - . . /+ . - - - /+ + + - . /"]
		],
		usotatami : [
			["十字の交差点があります。","pzprv3/usotatami/5/5/1 . 1 3 . /2 . . . . /1 . 1 . 3 /. 1 2 1 . /. 3 . . 2 /1 0 0 0 /1 0 0 0 /1 0 0 0 /1 0 0 0 /1 0 0 0 /1 1 1 1 1 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			["数字の入っていないタタミがあります。","pzprv3/usotatami/5/5/1 . 1 3 . /2 . . . . /1 . 1 . 3 /. 1 2 1 . /. 3 . . 2 /0 0 0 0 /1 0 0 0 /1 0 0 0 /1 0 0 0 /1 0 0 0 /1 1 1 1 1 /0 1 1 1 1 /0 0 0 0 0 /0 0 0 0 0 /"],
			["1つのタタミに2つ以上の数字が入っています。","pzprv3/usotatami/5/5/1 . 1 3 . /2 . . . . /1 . 1 . 3 /. 1 2 1 . /. 3 . . 2 /0 0 0 0 /1 0 0 0 /1 0 0 0 /1 0 0 0 /1 0 0 0 /1 1 1 1 1 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			["数字とタタミの大きさが同じです。","pzprv3/usotatami/5/5/1 . 1 3 . /2 . . . . /1 . 1 . 3 /. 1 2 1 . /. 3 . . 2 /0 1 1 1 /1 1 1 1 /1 1 0 1 /1 1 1 1 /0 0 1 1 /1 1 0 0 0 /1 0 1 1 0 /0 0 1 1 0 /1 1 1 0 1 /"],
			["途切れている線があります。","pzprv3/usotatami/5/5/1 . 1 3 . /2 . . . . /1 . 1 . 3 /. 1 2 1 . /. 3 . . 2 /0 1 1 0 /1 1 1 0 /1 1 0 1 /1 1 1 1 /1 0 1 1 /1 1 0 0 1 /1 0 1 1 1 /0 0 1 1 0 /0 1 1 0 1 /"],
			["幅が１マスではないタタミがあります。","pzprv3/usotatami/5/5/1 . 1 3 . /2 . . . . /1 . 1 . 3 /. 1 2 1 . /. 3 . . 2 /0 1 1 0 /1 1 1 0 /1 1 0 1 /1 1 1 1 /1 0 1 1 /1 1 0 0 0 /1 0 1 1 1 /0 0 1 1 0 /0 1 1 0 1 /"],
			["","pzprv3/usotatami/5/5/1 . 1 3 . /2 . . . . /1 . 1 . 3 /. 1 2 1 . /. 3 . . 2 /-1 1 1 1 /1 1 1 1 /1 1 0 1 /1 1 1 1 /1 0 1 1 /1 1 0 0 -1 /1 -1 1 1 -1 /0 -1 1 1 -1 /0 1 1 0 1 /"]
		],
		view : [
			["同じ数字がタテヨコに連続しています。","pzprv3/view/5/5/. . . . . /. . 4 0 1 /. 3 . 2 . /1 0 1 . . /. . . . . /- - - . . /- - . . . /. . - . . /. . . . . /. 0 . . . /"],
			["数字と、他のマスにたどり着くまでのマスの数の合計が一致していません。","pzprv3/view/5/5/. . . . . /. . 4 0 1 /. 3 . 2 . /1 0 1 . . /. . . . . /- - - . + /- - . . . /+ . - . - /. . . + + /- + + . . /"],
			["タテヨコにつながっていない数字があります。","pzprv3/view/5/5/. . . . . /. . 4 0 1 /. 3 . 4 . /1 0 2 . . /. . . . . /- - - + + /- - . . . /+ . - . - /. . . . + /- + + . . /"],
			["数字の入っていないマスがあります。","pzprv3/view/5/5/. . . . . /. . 4 0 1 /. 3 . 2 . /1 0 1 . . /. . . . . /- - - + + /- - . . . /2 . - . - /. . . 0 + /- + + + . /"],
			["","pzprv3/view/5/5/. . . . . /. . 4 0 1 /. 3 . 2 . /1 0 1 . . /. . . . . /- - - 3 0 /- - . . . /2 . - . - /. . . 0 2 /- 1 0 1 . /"]
		],
		wagiri : [
			["\"切\"が含まれた線が輪っかになっています。","pzprv3/wagiri/4/4/. . . . . /. 4 . . 1 /. . 2 . . /0 . . 2 . /. . . . . /. 1 . . /. . 2 . /. 1 . . /. . 1 . /1 2 1 . /2 1 2 . /. . . . /. . . . /"],
			["数字に繋がる線の数が間違っています。","pzprv3/wagiri/4/4/. . . . . /. 4 . . 1 /. . 2 . . /0 . . 2 . /. . . . . /. 1 . . /. . 2 . /. 1 . . /. . 1 . /1 2 1 1 /2 1 1 2 /. . . . /. . . . /"],
			["\"輪\"が含まれた線が輪っかになっていません。","pzprv3/wagiri/4/4/. . . . . /. 4 . . 1 /. . 2 . . /0 . . 2 . /. . . . . /. 1 . . /. . 2 . /. 1 . . /. . 1 . /1 2 1 1 /2 1 1 1 /1 2 2 . /2 1 2 1 /"],
			["斜線がないマスがあります。","pzprv3/wagiri/4/4/. . . . . /. 4 . . 1 /. . 2 . . /0 . . 2 . /. . . . . /. 1 . . /. . 2 . /. 1 . . /. . 1 . /1 2 1 1 /2 1 1 1 /1 2 2 2 /. 1 2 2 /"],
			["","pzprv3/wagiri/4/4/. . . . . /. 4 . . 1 /. . 2 . . /0 . . 2 . /. . . . . /. 1 . . /. . 2 . /. 1 . . /. . 1 . /1 2 1 1 /2 1 1 1 /1 2 2 2 /2 1 2 2 /"]
		],
		wblink : [
			["線が交差しています。","pzprv3/wblink/5/5/1 1 . 2 . /. . 2 . 1 /. 1 . . 2 /2 1 . 2 1 /2 . . 1 2 /0 0 0 0 /0 0 0 0 /0 1 1 1 /0 0 0 0 /0 0 0 0 /0 0 0 1 0 /0 0 0 1 0 /0 0 0 1 0 /0 0 0 0 0 /"],
			["3つ以上の○が繋がっています。","pzprv3/wblink/5/5/1 1 . 2 . /. . 2 . 1 /. 1 . . 2 /2 1 . 2 1 /2 . . 1 2 /0 0 0 0 /0 0 0 0 /0 0 0 0 /1 1 1 1 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			["白丸同士が繋がっています。","pzprv3/wblink/5/5/1 1 . 2 . /. . 2 . 1 /. 1 . . 2 /2 1 . 2 1 /2 . . 1 2 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 1 0 0 0 /0 1 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
			["黒丸同士が繋がっています。","pzprv3/wblink/5/5/1 1 . 2 . /. . 2 . 1 /. 1 . . 2 /2 1 . 2 1 /2 . . 1 2 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 1 0 /0 0 0 1 0 /0 0 0 1 0 /0 0 0 0 0 /"],
			["○から線が出ていません。","pzprv3/wblink/5/5/1 1 . 2 . /. . 2 . 1 /. 1 . . 2 /2 1 . 2 1 /2 . . 1 2 /-1 1 1 0 /0 0 1 1 /0 0 0 0 /0 1 1 0 /1 1 1 0 /1 -1 0 0 0 /1 -1 0 0 0 /1 -1 0 0 0 /0 0 0 0 0 /"],
			["","pzprv3/wblink/5/5/1 1 . 2 . /. . 2 . 1 /. 1 . . 2 /2 1 . 2 1 /2 . . 1 2 /-1 1 1 0 /0 0 1 1 /0 1 1 1 /0 1 1 0 /1 1 1 0 /1 -1 0 0 0 /1 -1 0 0 0 /1 -1 0 0 0 /0 0 0 -1 1 /"]
		],
		yajikazu : [
			["黒マスがタテヨコに連続しています。","pzprv3/yajikazu/6/6/4,0 . . . . 2,3 /1,99 . . . . . /. . . . 3,2 . /. . . . . . /. 1,2 . . 3,2 . /1,2 . 1,1 . . . /+ + . . . . /# + . . . . /# . . . . . /. . . . . . /. . . . . . /. . . . . . /"],
			["白マスが分断されています。","pzprv3/yajikazu/6/6/4,0 . . . . 2,3 /1,99 . . . . . /. . . . 3,2 . /. . . . . . /. 1,2 . . 3,2 . /1,2 . 1,1 . . . /+ + + + + + /# + . . + # /+ # . . + + /. . # . + # /. . . # + + /. . # . + # /"],
			["矢印の方向にある黒マスの数が正しくありません。","pzprv3/yajikazu/6/6/4,0 . . . . 2,3 /1,99 . . . . . /. . . . 3,2 . /. . . . . . /. 1,2 . . 3,2 . /1,2 . 1,1 . . . /+ + + + + + /# + . + + # /+ # . # + + /+ + . . + # /. + . . + + /. . . . + # /"],
			["","pzprv3/yajikazu/6/6/4,0 . . . . 2,3 /1,99 . . . . . /. . . . 3,2 . /. . . . . . /. 1,2 . . 3,2 . /1,2 . 1,1 . . . /+ + + + + + /# + # + + # /+ # + # + + /+ + + . + # /+ # + # + + /# + + . + # /"]
		],
		yajirin : [
			["分岐している線があります。","pzprv3/yajirin/5/5/. . . . . /. . . . . /. . . 3,2 . /. . . . . /. . . . 1,0 /. . . . . /. . . . . /. . . . . /. . . . . /. . . . . /1 1 1 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 1 0 0 0 /0 1 0 0 0 /0 1 0 0 0 /0 0 0 0 0 /"],
			["交差している線があります。","pzprv3/yajirin/5/5/. . . . . /. . . . . /. . . 3,2 . /. . . . . /. . . . 1,0 /. . . . . /. . . . . /. . . . . /. . . . . /. . . . . /0 0 1 0 /1 1 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 1 1 0 0 /0 1 0 0 0 /0 1 0 0 0 /0 0 0 0 0 /"],
			["黒マスの上に線が引かれています。","pzprv3/yajirin/5/5/. . . . . /. . . . . /. . . 3,2 . /. . . . . /. . . . 1,0 /. . . # . /. . . . . /# . # . . /. . . . . /. . . . . /1 1 0 1 /1 0 1 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /1 0 1 1 0 /0 1 0 0 0 /0 1 0 0 0 /0 0 0 0 0 /"],
			["黒マスがタテヨコに連続しています。","pzprv3/yajirin/5/5/. . . . . /. . . . . /. . . 3,2 . /. . . . . /. . . . 1,0 /. . . . . /. . . . . /# . # . . /. . # . . /. . . . . /1 1 0 1 /1 0 1 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /1 0 1 1 0 /0 1 0 0 0 /0 1 0 0 0 /0 0 0 0 0 /"],
			["矢印の方向にある黒マスの数が正しくありません。","pzprv3/yajirin/5/5/. . . . . /. . . . . /. . . 3,2 . /. . . . . /. . . . 1,0 /. . . . . /. . . . + /# . . . + /. . + . + /. . . # . /1 1 -1 1 /1 -1 1 -1 /0 0 0 -1 /1 -1 1 1 /1 1 0 0 /1 -1 1 1 1 /0 1 0 0 1 /0 1 0 0 1 /1 -1 1 0 0 /"],
			["途切れている線があります。","pzprv3/yajirin/5/5/. . . . . /. . . . . /. . . 3,2 . /. . . . . /. . . . 1,0 /. . . . . /. . . . + /# . # . + /. . + . + /. . . . . /1 1 0 1 /1 0 1 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /1 0 1 1 0 /0 1 0 0 0 /0 1 0 0 0 /0 0 0 0 0 /"],
			["輪っかが一つではありません。","pzprv3/yajirin/5/5/. . . . . /. . . . . /. . . 3,2 . /. . . . . /. . . . 1,0 /. . . . . /. . . . + /# . # . + /. . + . + /. . . . . /1 1 0 1 /1 1 0 1 /0 0 0 0 /0 0 1 0 /0 0 1 0 /1 0 1 1 1 /0 0 0 0 0 /0 0 0 0 0 /0 0 1 1 0 /"],
			["黒マスも線も引かれていないマスがあります。","pzprv3/yajirin/5/5/. . . . . /. . . . . /. . . 3,2 . /. . . . . /. . . . 1,0 /. . . . . /. . . . + /# . # . + /. . + . + /. . . . . /1 1 0 1 /1 0 1 0 /0 0 0 0 /0 1 0 1 /0 0 1 0 /1 0 1 1 1 /0 1 0 0 1 /0 1 0 0 1 /0 0 1 1 0 /"],
			["","pzprv3/yajirin/5/5/. . . . . /. . . . . /. . . 3,2 . /. . . . . /. . . . 1,0 /. . . . . /. . . . + /# . # . + /. . + . + /. . . # . /1 1 -1 1 /1 -1 1 -1 /0 0 0 -1 /1 -1 1 1 /1 1 0 0 /1 -1 1 1 1 /0 1 0 0 1 /0 1 0 0 1 /1 -1 1 0 0 /"]
		],
		perftest : [
			["","pzprv3/country/10/18/44/0 0 1 1 1 2 2 2 3 4 4 4 5 5 6 6 7 8 /0 9 1 10 10 10 11 2 3 4 12 4 4 5 6 13 13 8 /0 9 1 1 10 10 11 2 3 12 12 12 4 5 14 13 13 15 /0 9 9 9 10 16 16 16 16 17 12 18 4 5 14 13 15 15 /19 19 19 20 20 20 21 17 17 17 22 18 18 14 14 23 23 24 /19 25 25 26 26 21 21 17 22 22 22 18 27 27 27 24 24 24 /28 28 29 26 30 31 21 32 22 33 33 33 33 34 35 35 35 36 /28 29 29 26 30 31 32 32 32 37 38 39 34 34 40 40 35 36 /41 29 29 42 30 31 31 32 31 37 38 39 34 34 34 40 35 36 /41 43 42 42 30 30 31 31 31 37 38 38 38 40 40 40 36 36 /3 . 6 . . 4 . . 2 . . . . . . . . 1 /. . . 5 . . . . . . . . . . . . . . /. . . . . . . . . 1 . . . . . . . . /. . . . . . . . . . . . . . . . . . /3 . . 2 . . . 4 . . . . . . . . . . /. . . 3 . . . . 4 . . . 2 . . . . . /. . . . 3 6 . . . 4 . . . . . . . . /. 5 . . . . . . . 2 . . 3 . . . . . /. . . . . . . . . . . . . . . . . . /. . . . . . . . . . . . . . . . 5 . /0 0 1 1 0 0 1 0 0 1 1 0 0 0 1 1 0 /1 0 0 0 1 0 0 0 1 0 0 1 0 0 0 0 1 /0 0 1 0 1 0 0 1 0 0 0 0 0 0 0 0 0 /0 1 1 0 0 0 1 0 0 1 1 0 1 0 0 0 1 /1 1 0 0 1 0 0 1 1 0 0 0 0 1 0 1 0 /0 1 0 1 0 1 0 0 1 1 1 0 1 0 0 1 1 /1 0 1 0 0 0 0 1 0 1 1 1 0 0 1 1 0 /0 1 0 0 0 0 1 0 0 0 0 1 1 0 1 0 0 /0 1 1 0 1 1 0 0 1 0 1 0 0 0 0 0 0 /1 1 1 0 0 0 1 1 0 0 1 1 1 1 1 0 1 /0 0 1 0 1 0 1 1 0 1 0 1 0 0 1 0 1 0 /1 1 1 0 0 1 1 1 1 0 0 0 1 0 1 0 0 1 /1 1 0 1 1 0 1 0 0 0 0 0 1 0 1 0 0 1 /1 0 0 0 1 0 0 1 0 1 0 1 0 1 1 0 1 0 /0 0 1 0 0 1 0 0 0 0 0 1 0 0 0 1 0 0 /0 1 0 1 1 0 1 0 1 0 0 0 1 1 0 0 0 1 /1 0 1 0 1 0 1 1 0 1 0 0 0 1 1 0 1 1 /1 1 0 0 1 0 0 0 0 1 0 1 0 0 0 1 1 1 /1 0 0 1 0 0 1 0 1 0 1 0 0 0 0 1 1 1 /2 2 1 1 1 2 0 0 2 0 1 0 0 0 0 0 0 2 /1 1 1 2 1 1 0 0 0 1 2 1 0 0 1 2 0 0 /1 0 1 1 1 1 0 0 1 2 2 2 1 0 1 2 2 0 /1 0 0 1 1 2 1 0 2 1 1 1 1 0 1 2 1 0 /1 1 0 2 1 1 2 0 0 0 2 1 2 1 1 1 0 2 /2 1 0 1 1 1 0 2 0 0 0 0 1 1 2 1 0 0 /1 0 1 1 1 2 1 1 0 0 0 0 0 0 1 0 0 0 /0 1 1 2 1 2 1 1 2 1 2 0 1 0 1 0 0 0 /0 1 1 0 1 1 1 2 0 1 0 1 2 2 2 1 0 0 /0 0 0 1 2 2 1 1 0 2 0 0 1 0 1 0 0 0 /"]
		]
	},

	urls : [
		['aho'        , '6/6/4i264n6j3n223i4'],
		['ayeheya'    , '6/6/99aa8c0vu0ufk2k'],
		['bag'        , '6/6/g3q2h3jbj3i3i2g'],
		['barns'      , '5/5/06ec080000100'],
		['bdblock'    , '5/5/100089082/12345o51g4i3i'],
		['bonsan'     , '5/5/co360rr0g1h0g.j121g3h1h.g.g'],
		['bosanowa'   , '6/5/jo9037g2n2n3g4j3i'],
		['box'        , '5/5/7a9979672f'],
		['chocona'    , '6/6/8guumlfvo1eq33122g21g32'],
		['cojun'      , '4/4/pd0hsoh3p3h'],
		['country'    , '5/5/amda0uf02h12h'],
		['creek'      , '6/6/gagaich2cgb6769dt'],
		['factors'    , '5/5/rvvcm9jf54653-28ca2833-14'],
		['fillmat'    , '5/5/3b3h1h1b4'],
		['fillomino'  , '6/6/h4j53g2k5233k2g14j3h'],
		['firefly'    , '5/5/40c21a3.a30g10a22a11c11'],
		['fourcells'  , '6/6/b1d2a3e3d1f2b2a3b2'],
		['goishi'     , '6/7/vsten1tvo'],
		['gokigen'    , '4/4/iaegcgcj6a'],
		['hakoiri'    , '5/5/4qb44qb41c3c1f23a2b1b1'],
		['hashikake'  , '5/5/4g2i3h23k3g1g3g4g3'],
		['heyawake'   , '6/6/lll155007rs12222j'],
		['hitori'     , '4/4/1114142333214213'],
		['icebarn'    , '8/8/73btfk05ovbjghzpwz9bwm/3/11'],
		['icelom'     , 'a/6/6/9e50an10i3zl2g1i/15/4'],
		['ichimaga'   , 'm/5/5/7cgegbegbgcc'],
		['kaero'      , '3/3/egh0BCBcAaA'],
		['kakuro'     , '5/5/48la0.na0lh3l0Bn.0cl.c4a3'],
		['kakuru'     , '5/5/3.a+4+mD.S.bm+g+A.3'],
		['kinkonkan'  , '4/4/94gof0BAaDbBaCbCaAaD21122211'],
		['kramma'     , '5/5/32223i3f2fb99i'],
		['kurochute'  , '5/5/132k1i1i2k332'],
		['kurodoko'   , '5/5/i7g5l2l2g4i'],
		['kusabi'     , '5/5/311e2c12c1f3'],
		['lightup'    , '6/6/nekcakbl'],
		['lits'       , '4/4/9q02jg'],
		['loopsp'     , '5/5/sgnmn1n1n2njnls'],
		['mashu'      , '6/6/1063000i3000'],
		['mejilink'   , '4/4/g9rm4'],
		['minarism'   , '4/4/hhhq21pgi'],
		['mochikoro'  , '5/5/4p2n1i1'],
		['mochinyoro' , '5/5/l4g2m2m1'],
		['nagenawa'   , '6/6/alrrlafbaaqu3011314g223h'],
		['nanro'      , '4/4/6r0s1oi13n1h'],
		['nawabari'   , '5/5/f0a1g2a1f'],
		['norinori'   , '5/5/cag4ocjo'],
		['numlin'     , '5/5/1j2h3m1h2j3'],
		['nuribou'    , '5/5/1g2l1g4r7'],
		['nurikabe'   , '5/5/g5k2o1k3g'],
		['paintarea'  , '5/5/pmvmfuejf4k1f'],
		['pipelink'   , '5/5/mamejan'],
		['reflect'    , '5/5/49l20c5f24'],
		['renban'     , '4/4/vmok3g1p5g2h'],
		['ripple'     , '4/4/9n8rigk14h32k'],
		['shakashaka' , '6/6/cgbhdhegdrb'],
		['shikaku'    , '6/6/j3g56h6t6h23g5j'],
		['shimaguni'  , '6/6/7fe608s0e3uf3g3g2g43'],
		['shugaku'    , '5/5/c5d462b'],
		['shwolf'     , '5/5/0282bocb6ajf9'],
		['slalom'     , 'p/6/6/9314131314131a1131ag44j11/33'],
		['slither'    , '5/5/cbcbcddad'],
		['snakes'     , '5/5/a21g23b20b45g41a'],
		['sudoku'     , '4/4/g1k23k3g'],
		['sukoro'     , '5/5/2a2c4a2g2a4c2a2'],
		['sukororoom' , '5/5/4vjbtnfpb3i2i3b'],
		['tasquare'   , '6/6/1g.i4j1i3j5i5j.i2g1'],
		['tatamibari' , '5/5/m3g11i2g31h13g3g'],
		['tateyoko'   , '5/5/i23i3ono2i25i22pnqi33i2'],
		['tawa'       , '5/5/0/a2b2b3g5b2c2'],
		['tentaisho'  , '5/5/67eh94fi65en8dbf'],
		['tilepaint'  , '6/6/mfttf5ovqrrvzv234232243331'],
		['toichika'   , '4/4/n70kt84j'],
		['triplace'   , '5/5/%2m_m%1m_.0.1....11'],
		['usotatami'  , '5/5/1a13a2d1a1a3a121b3b2'],
		['view'       , '5/5/m401g3g2g101m'],
		['wagiri'     , '4/4/lebcacja1d2b1d1a'],
		['wblink'     , '5/5/ci6a2ln1i'],
		['yajikazu'   , '6/6/40d23663i32h12b32a12a11c'],
		['yajirin'    , '5/5/m32j10']
	]
});
