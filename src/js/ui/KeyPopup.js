// KeyPopup.js v3.4.0

//---------------------------------------------------------------------------
// ★KeyPopupクラス マウスからキーボード入力する際のPopupウィンドウを管理する
//---------------------------------------------------------------------------
// キー入力用Popupウィンドウ
ui.keypopup =
{
	/* メンバ変数 */
	paneltype : {1:0, 3:0},	/* パネルのタイプ */
	element : null,			/* キーポップアップのエレメント */

	tdcolor : "black",	/* 文字の色 */
	imgCR : [1,1],		/* img表示用画像の横×縦のサイズ */

	imgs  : [],			/* resize用 */

	basepanel : null,
	clearflag : false,

	/* どの文字配置を作成するかのテーブル */
	type : {
		slither    : [3,0],
		nawabari   : [4,0],
		fourcells  : [4,0],
		fivecells  : [4,0],
		fillmat    : [4,0],
		paintarea  : [4,0],
		lightup    : [4,0],
		shakashaka : [4,0],
		gokigen    : [4,0],
		wagiri     : [4,0],
		shugaku    : [4,0],
		creek      : [4,0],
		ichimaga   : [4,0],
		ichimagam  : [4,0],
		ichimagax  : [4,0],
		sukoro     : [4,4],
		sukororoom : [4,4],
		lookair    : [5,0],
		tawa       : [6,0],
		hashikake  : [8,0],
		amibo      : [10,0],
		bag        : [10,0],
		bdblock    : [10,0],
		country    : [10,0],
		usotatami  : [10,0],
		heyawake   : [10,0],
		ayeheya    : [10,0],
		kurodoko   : [10,0],
		nagenawa   : [10,0],
		ringring   : [10,0],
		numlin     : [10,0],
		nurikabe   : [10,0],
		nuribou    : [10,0],
		mochikoro  : [10,0],
		mochinyoro : [10,0],
		shikaku    : [10,0],
		aho        : [10,0],
		shimaguni  : [10,0],
		chocona    : [10,0],
		yajitatami : [10,0],
		tasquare   : [10,0],
		kurotto    : [10,0],
		bonsan     : [10,0],
		heyabon    : [10,0],
		yosenabe   : [10,0],
		firefly    : [10,0],
		tateyoko   : [10,0],
		factors    : [10,10],
		fillomino  : [10,10],
		renban     : [10,10],
		ripple     : [10,10],
		cojun      : [10,10],
		sudoku     : [10,10],
		nanro      : [10,10],
		view       : [10,10],
		kakuru     : [10,10],
		tilepaint  : [51,0],
		triplace   : [51,0],
		kakuro     : [51,10],
		
		slalom     : [101,0],
		reflect    : [102,0],
		pipelink   : [111,0],
		pipelinkr  : [111,0],
		loopsp     : [111,0],
		tatamibari : [112,0],
		hakoiri    : [113,113],
		kusabi     : [114,0]
	},

	//---------------------------------------------------------------------------
	// kp.display()     キーポップアップを表示する
	//---------------------------------------------------------------------------
	display : function(){
		var mode = ui.getConfig('mode');
		if(this.element && !!this.paneltype[mode] && ui.menuconfig.get('keypopup')){

			this.element.style.display = 'block';

			getEL('panelbase1').style.display = (mode==1?'block':'none');
			getEL('panelbase3').style.display = (mode==3?'block':'none');
		}
		else if(!!this.element){
			this.element.style.display = 'none';
		}
	},

	//---------------------------------------------------------------------------
	// kp.create()      キーポップアップを生成して初期化する
	// kp.createtable() キーポップアップのポップアップを作成する
	//---------------------------------------------------------------------------
	create : function(){
		if(!!this.element){
			getEL('panelbase1').innerHTML = '';
			getEL('panelbase3').innerHTML = '';
		}
		
		this.imgs = [];			// resize用
		
		var type = this.type[ui.puzzle.pid];
		if(!type){ type=[0,0];}
		
		this.paneltype = { 1:(pzpr.EDITOR?type[0]:0), 3:(type[1])};
		if(!this.paneltype[1] && !this.paneltype[3]){ return;}
		
		if(!this.element){ this.element = this.makeKeyPopup();}
		
		if(this.paneltype[1]!==0){ this.createtable(1);}
		if(this.paneltype[3]!==0){ this.createtable(3);}
		
		this.resizepanel();
		
		var bar = getEL('barkeypopup');
		ui.event.addMouseDownEvent(bar, ui.popupmgr, ui.popupmgr.titlebardown);
		ui.event.addEvent(bar, 'dblclick', ui.menuconfig, function(){ this.set('keypopup',false)});
	},
	createtable : function(mode,type){
		this.basepanel = getEL('panelbase'+mode);
		this.basepanel.innerHTML = '';
		
		if(mode==3){ this.tdcolor = ui.puzzle.painter.fontAnscolor;}

		this.generate(mode);
	},

	//---------------------------------------------------------------------------
	// kp.makeKeyPopup() キーポップアップのパネルを作成する
	//---------------------------------------------------------------------------
	makeKeyPopup : function(){
		var keypopup, bar;
		var rect = pzpr.util.getRect(getEL('divques'));
		
		keypopup = createEL('div');
		keypopup.className = 'popup';
		keypopup.id = 'keypopup';
		keypopup.style.left   = (rect.left+48)+'px';
		keypopup.style.top    = (rect.top +48)+'px';
		keypopup.style.zIndex = 100;
		getEL("popup_parent").appendChild(keypopup);
		
		bar = createEL('div');
		bar.className = 'titlebar';
		bar.id = 'barkeypopup';
		bar.appendChild(_doc.createTextNode("panel"));
		pzpr.util.unselectable(bar);
		keypopup.appendChild(bar);
		
		var panel = createEL('div');
		panel.className = 'panelbase';
		panel.id = 'panelbase1';
		keypopup.appendChild(panel);
		
		panel = createEL('div');
		panel.className = 'panelbase';
		panel.id = 'panelbase3';
		keypopup.appendChild(panel);
		
		return keypopup;
	},

	//---------------------------------------------------------------------------
	// kp.generate()    キーポップアップのテーブルを作成する
	// kp.gentable4()   キーポップアップの0～4を入力できるテーブルを作成する
	// kp.gentable10()  キーポップアップの0～9を入力できるテーブルを作成する
	// kp.gentable51()  キーポップアップの[＼],0～9を入力できるテーブルを作成する
	//---------------------------------------------------------------------------
	generate : function(mode){
		var type = this.paneltype[mode];
		if     (type===4) { this.gentable4 (mode);}
		else if(type===10){ this.gentable10(mode);}
		else if(type===51){ this.gentable51(mode);}

		else if(type===3) { this.gentable3(mode);}
		else if(type===5) { this.gentable5(mode);}
		else if(type===6) { this.gentable6(mode);}
		else if(type===8) { this.gentable8(mode);}

		else if(type===101){ this.generate_slalom(mode);}
		else if(type===102){ this.generate_reflect(mode);}
		else if(type===111){ this.generate_pipelink(mode);}
		else if(type===112){ this.generate_tatamibari(mode);}
		else if(type===113){ this.generate_hakoiri(mode);}
		else if(type===114){ this.generate_kusabi(mode);}
	},
	gentable4 : function(mode){
		var pid=ui.puzzle.pid;
		this.inputcol('num','1','1');
		this.inputcol('num','2','2');
		this.inputcol('num','3','3');
		this.inputcol('num','4','4');
		this.insertrow();
		if((mode==3)&&(pid==='sukoro'||pid==='sukororoom')){
			this.tdcolor = ui.puzzle.painter.mbcolor;
			this.inputcol('num','q','○');
			this.inputcol('num','w','×');
			this.tdcolor = "black";
			this.inputcol('num',' ',' ');
			this.inputcol('empty','','');
		}
		else{
			this.inputcol('num','0','0');
			this.inputcol('empty','','');
			this.inputcol('num',' ',' ');
			if(!ui.puzzle.painter.hideHatena){
				this.inputcol('num','-','?');
			}
			else{
				var cap = '?';
				switch(pid){
					case 'lightup': case 'shakashaka':                           cap='■'; break;
					case 'gokigen': case 'wagiri': case 'shugaku': case 'creek': cap='○'; break;
				}
				this.inputcol('num','-',cap);
			}
		}
		this.insertrow();
	},
	gentable10 : function(mode){
		var pid = ui.puzzle.pid;
		if((mode==3)&&(ui.puzzle.Cell.prototype.numberWithMB)){
			this.tdcolor = ui.puzzle.painter.mbcolor;
			this.inputcol('num','q','○');
			this.inputcol('num','w','×');
			this.tdcolor = "black";
			this.inputcol('num',' ',' ');
			this.inputcol('empty','','');
			this.insertrow();
		}
		if((mode==1)&&(pid==='kakuru'||pid==='tateyoko')){
			this.inputcol('num','q1','■');
			this.inputcol('num','q2','□');
			this.inputcol('num',' ',' ');
			this.inputcol('num','-','?');
			this.insertrow();
		}
		
		this.inputcol('num','0','0');
		this.inputcol('num','1','1');
		this.inputcol('num','2','2');
		this.inputcol('num','3','3');
		this.insertrow();
		this.inputcol('num','4','4');
		this.inputcol('num','5','5');
		this.inputcol('num','6','6');
		this.inputcol('num','7','7');
		this.insertrow();
		this.inputcol('num','8','8');
		this.inputcol('num','9','9');
		if(!((mode==3)&&(ui.puzzle.Cell.prototype.numberWithMB))){
			this.inputcol('num',' ',' ');
		}
		else{
			this.inputcol('empty','','');
		}
		if((mode===3)||(pid==='kakuru'||pid==='tateyoko')){
			this.inputcol('empty','','','');
		}
		else if(!ui.puzzle.painter.hideHatena){
			this.inputcol('num','-','?');
		}
		else if(pid==='tasquare'){
			this.inputcol('num','-','□');
		}
		else if(pid==='kurotto'||pid==='bonsan'||pid==='heyabon'||pid==='yosenabe'){
			this.inputcol('num','-','○');
		}
		this.insertrow();
	},
	gentable51 : function(mode){
		this.inputcol('image','q',[0,0]);
		this.inputcol('num',' ',' ');
		this.inputcol('num','1','1');
		this.inputcol('num','2','2');
		this.insertrow();
		this.inputcol('num','3','3');
		this.inputcol('num','4','4');
		this.inputcol('num','5','5');
		this.inputcol('num','6','6');
		this.insertrow();
		this.inputcol('num','7','7');
		this.inputcol('num','8','8');
		this.inputcol('num','9','9');
		this.inputcol('num','0','0');
		this.insertrow();
	},

	//---------------------------------------------------------------------------
	// kp.gentable3()  キーポップアップの0～4を入力できるテーブルを作成する
	// kp.gentable5()  キーポップアップの0～5を入力できるテーブルを作成する
	// kp.gentable6()  キーポップアップの0～6を入力できるテーブルを作成する
	// kp.gentable8()  キーポップアップの0～8を入力できるテーブルを作成する
	//---------------------------------------------------------------------------
	gentable3 : function(mode){
		this.inputcol('num','1','1');
		this.inputcol('num','2','2');
		this.inputcol('num','3','3');
		this.insertrow();
		this.inputcol('num','0','0');
		this.inputcol('num',' ',' ');
		this.inputcol('num','-','?');
		this.insertrow();
	},
	gentable5: function(mode){
		this.inputcol('num','1','1');
		this.inputcol('num','2','2');
		this.inputcol('num','3','3');
		this.insertrow();
		this.inputcol('num','4','4');
		this.inputcol('num','5','5');
		this.inputcol('empty','','');
		this.insertrow();
		this.inputcol('num','0','0');
		this.inputcol('num',' ',' ');
		this.inputcol('num','-','?');
		this.insertrow();
	},
	gentable6 : function(mode){
		this.inputcol('num','1','1');
		this.inputcol('num','2','2');
		this.inputcol('num','3','3');
		this.insertrow();
		this.inputcol('num','4','4');
		this.inputcol('num','5','5');
		this.inputcol('num','6','6');
		this.insertrow();
		this.inputcol('num','0','0');
		this.inputcol('num',' ',' ');
		this.inputcol('num','-','?');
		this.insertrow();
	},
	gentable8 : function(mode){
		this.inputcol('num','1','1');
		this.inputcol('num','2','2');
		this.inputcol('num','3','3');
		this.inputcol('num','4','4');
		this.insertrow();
		this.inputcol('num','5','5');
		this.inputcol('num','6','6');
		this.inputcol('num','7','7');
		this.inputcol('num','8','8');
		this.insertrow();
		this.inputcol('num',' ',' ');
		this.inputcol('num','-','○');
		this.insertrow();
	},

	//---------------------------------------------------------------------------
	// kp.generate_slalom()     スラローム用のテーブルを作成する
	// kp.generate_reflect()    リフレクトリンク用のテーブルを作成する
	//---------------------------------------------------------------------------
	generate_slalom : function(mode){
		this.imgCR = [4,1];
		this.inputcol('image','q',[0,0]);
		this.inputcol('image','s',[1,0]);
		this.inputcol('image','w',[2,0]);
		this.inputcol('image','e',[3,0]);
		this.inputcol('num','r',' ');
		this.insertrow();
		this.inputcol('num','1','1');
		this.inputcol('num','2','2');
		this.inputcol('num','3','3');
		this.inputcol('num','4','4');
		this.inputcol('num','5','5');
		this.insertrow();
		this.inputcol('num','6','6');
		this.inputcol('num','7','7');
		this.inputcol('num','8','8');
		this.inputcol('num','9','9');
		this.inputcol('num','0','0');
		this.insertrow();
		this.inputcol('num','-','-');
		this.inputcol('num',' ',' ');
		this.insertrow();
	},
	generate_reflect : function(mode){
		this.imgCR = [4,1];
		this.inputcol('image','q',[0,0]);
		this.inputcol('image','w',[1,0]);
		this.inputcol('image','e',[2,0]);
		this.inputcol('image','r',[3,0]);
		this.inputcol('num','t','╋');
		this.inputcol('num','y',' ');
		this.insertrow();
		this.inputcol('num','1','1');
		this.inputcol('num','2','2');
		this.inputcol('num','3','3');
		this.inputcol('num','4','4');
		this.inputcol('num','5','5');
		this.inputcol('num','6','6');
		this.insertrow();
		this.inputcol('num','7','7');
		this.inputcol('num','8','8');
		this.inputcol('num','9','9');
		this.inputcol('num','0','0');
		this.inputcol('num','-','-');
		this.insertrow();
	},

	//---------------------------------------------------------------------------
	// kp.generate_pipelink()   パイプリンク、帰ってきたパイプリンク、環状線スペシャル用のテーブルを作成する
	// kp.generate_tatamibari() タタミバリ用のテーブルを作成する
	// kp.generate_hakoiri()    はこいり○△□用のテーブルを作成する
	// kp.generate_kusabi()     クサビリンク用のテーブルを作成する
	//---------------------------------------------------------------------------
	generate_pipelink : function(mode){
		var pid = ui.puzzle.pid;
		this.inputcol('num','q','╋');
		this.inputcol('num','w','┃');
		this.inputcol('num','e','━');
		this.inputcol('num','r',' ');
		if     (pid==='pipelink') { this.inputcol('empty','','');}
		else if(pid==='pipelinkr'){ this.inputcol('num','1','○');}
		else if(pid==='loopsp')   { this.inputcol('num','-','○');}
		this.insertrow();
		this.inputcol('num','a','┗');
		this.inputcol('num','s','┛');
		this.inputcol('num','d','┓');
		this.inputcol('num','f','┏');
		if(pid!=='loopsp'){ this.inputcol('num','-','?');}
		this.insertrow();
		
		if(pid==='loopsp'){
			this.inputcol('num','1','1');
			this.inputcol('num','2','2');
			this.inputcol('num','3','3');
			this.inputcol('num','4','4');
			this.inputcol('num','5','5');
			this.insertrow();
			this.inputcol('num','6','6');
			this.inputcol('num','7','7');
			this.inputcol('num','8','8');
			this.inputcol('num','9','9');
			this.inputcol('num','0','0');
			this.insertrow();
		}
	},
	generate_tatamibari : function(mode){
		this.inputcol('num','q','╋');
		this.inputcol('num','w','┃');
		this.inputcol('num','e','━');
		this.insertrow();
		this.inputcol('num','r',' ');
		this.inputcol('num','-','?');
		this.inputcol('empty','','');
		this.insertrow();
	},
	generate_hakoiri : function(mode){
		this.inputcol('num','1','○');
		this.inputcol('num','2','△');
		this.inputcol('num','3','□');
		this.insertrow();
		if(mode==3){ this.tdcolor = "rgb(255, 96, 191)";}
		this.inputcol('num','4',(mode===1 ? '?' : '・'));
		if(mode==3){ this.tdcolor = "black";}
		this.inputcol('num',' ',' ');
		this.inputcol('empty','','');
		this.insertrow();
	},
	generate_kusabi : function(mode){
		this.inputcol('num','1','同');
		this.inputcol('num','2','短');
		this.inputcol('num','3','長');
		this.insertrow();
		this.inputcol('num','-','○');
		this.inputcol('num',' ',' ');
		this.inputcol('empty','','');
		this.insertrow();
	},

	//---------------------------------------------------------------------------
	// kp.inputcol()  テーブルのセルを追加する
	// kp.insertrow() テーブルの行を追加する
	//---------------------------------------------------------------------------
	inputcol : function(type, ca, disp){
		var _div = null, _child = null;
		if(type!=='empty'){
			_div = createEL('div');
			_div.className = 'kpcell kpcellvalid';
			_div.onclick = function(){ ui.puzzle.key.keyevent(ca,0);};
			pzpr.util.unselectable(_div);
		}
		else{
			_div = createEL('div');
			_div.className = 'kpcell kpcellempty';
			pzpr.util.unselectable(_div);
		}

		if(type==='num'){
			_child = createEL('span');
			_child.className   = 'kpnum';
			_child.style.color = this.tdcolor;
			_child.innerHTML   = disp;
			pzpr.util.unselectable(_child);
		}
		else if(type==='image'){
			_child = createEL('img');
			_child.className = 'kpimg';
			var pid = ui.puzzle.pid;
			if(!pzpr.env.API.dataURL){
				_child.src = "./img/"+pid+"_kp.gif";
			}
			else{
				_child.src = "data:image/gif;base64,"+this.dataurl[!!this.dataurl[pid] ? pid : 'shitappa'];
			}
			pzpr.util.unselectable(_child);
			this.imgs.push({'el':_child, 'x':disp[0], 'y':disp[1]});
		}

		if(this.clearflag){ _div.style.clear='both'; this.clearflag=false;}
		if(!!_child){ _div.appendChild(_child);}
		this.basepanel.appendChild(_div);
	},
	insertrow : function(){
		this.clearflag = true;
	},

	//---------------------------------------------------------------------------
	// kp.resizepanel() キーポップアップのセルのサイズを変更する
	//---------------------------------------------------------------------------
	resizepanel : function(){
		var cellsize = Math.min(ui.puzzle.painter.cw, 120);
		if(cellsize<20){ cellsize=20;}

		var dsize = (cellsize*0.90)|0, tsize = (cellsize*0.70)|0;
		for(var i=0,len=this.imgs.length;i<len;i++){
			var obj = this.imgs[i], img=obj.el;
			img.style.width  = ""+(dsize*this.imgCR[0])+"px";
			img.style.height = ""+(dsize*this.imgCR[1])+"px";
			img.style.clip   = "rect("+(dsize*obj.y+1)+"px,"+(dsize*(obj.x+1))+"px,"+(dsize*(obj.y+1))+"px,"+(dsize*obj.x+1)+"px)";
			img.style.top    = "-"+(obj.y*dsize)+"px";
			img.style.left   = "-"+(obj.x*dsize)+"px";
		}

		ui.misc.modifyCSS({
			"div.kpcell" : { width:(""+dsize+"px"), height:(""+dsize+"px"), lineHeight:(""+dsize+"px")},
			"span.kpnum" : { fontSize:(""+tsize+"px")}
		});
	},

	dataurl : {
		slalom   : "R0lGODlhAAFAAMIEAAICAmBgYJ+fn///////AP//AP//AP//ACH5BAEKAAQALAAAAAAAAUAAAAP+OLrc/jDKSau9OOvNu/9gKI5kaZ5oqq5s675wLM90bd94ru+24AdAH68BKBqHNqNyyWw6n9DSD2oMCHhMZI3K7XqLI0Hgq7TmstoZec0GhMTt8jW5TKvj+OhnnFfOaWh2MH2EdR0ChUtmd0qCMYmJHXxOQFZ/P5OUjEeOL5CFHJmKfxFTmp2oIZ+EG6JVpBVwTQGptR2rfRquAIsbiLO2wRi4eRm7tB+yS7DCzQ7EeBi/yyO7zCiBziTQcRfTfiWuyCzZ2iLcbReu1yDrLeXmIOhsFt9F7CGu74bx5/NkFkSNO2EPAL4R8Prd+vclFpODbxKWkKhQA8OGFAS2EAX+UR6/ih4ueqFQsGPEMiCDieySUZGLkilrreTSEpwLjjFTzaRCweULewNz2tmpR4JPTyhTUBQ6geiTCUBjiFKxlGkEp06gUoMxVelHqxawNpmAE4Y9kxyqevw4dkFbt+XeQhBbtezPrSfUfpDLN67fr8/oNpLQ1SxeE3pDZuv7Ve4Ax4EFgyF8uMVZr4MxZ368+O9mzoCJSJ5cqjILeyAZb3bMuupo0hAucw3tTDUnBa0bu36tNemLwmCRvHbT1Lflo8GHDO9JG0XU5MJ5kzWdwm7e5tBFjyaJXAVMzbCzX5Ve3OaK5+CJizdKnrLx9GgXfl4fWbJD6iQ0rkgMfXmvBX0pfEcVdvT5x113+SF43Xz0MWBgTeYliF+DgLTH3IShMBEUhTc8eCCGxjQRH4fkWAjhe744MSKJ+5l4YoQhisjiDh4GRMmKBRmx4lq3zQiafa08YQlUu+goA3/J1agOFUH44CQQXOyoCoHrKelNkXj08giV4lkpTSJaHslldl5Kg2UXYW4SHotlapAjk1Iu2KOPVplCyZB05pmDk0Lo6eefgAYq6KCEFmrooSwkAAA7",
		reflect  : "R0lGODlhAAFAAIABAAAAAP///yH5BAEKAAEALAAAAAAAAUAAAAL+jI+py+0Po5y02ouz3rz7D4biSJbmiabqyrbuC8fyTNf2jef6bgD8H/A9AMSi8YhMKpdJCPMJjSKdQiCOGJFqt9Mh96vNYq22ogSMflLT7OPZTJ4ZJ+362GGv0+dxmHufh7YW+EXR1cdy+EbINcgoVdGEqCJp+BjmdRlloTSJ0smpCeUoWmlp6hmyhFHKRNoKFwqaCuLKCqvIgJt7OkvLoZaxy4c3fHcx+ruRLGz8WrrMrCxrq+GciQu8OR25HZ2N3dqByS3m/S0eLuqxVf7si76ufvnR6K7bXp9eDK2ff4+gUK1+/DSpEggwCEJ/9OYFEiEIYMSDDQsyGpHmXkb+jBUbGOQ4URmbEh3xXSTRZlpKkict2jGhh1ZMlg8dbqQ50tPLE4Tegfm0s0+eFDVd3oQ5NE5RnkE9NkWaFEhPSjOdriQ6lUdLrDmN2qOaNcejFlethuQatsxYskdN/mS7Vm3cRGcXtAU7V4Y8F3UV9EWb9wVBvgvdkiO8V/BgxIcNn2P8EXJJycG8rtILi3JgzfDsNlacecWuGp/9QqIxDO8+OY89S8M8mmls0q9dV0N9DWVu2rcd84KdGmTwG5XNosJtrArD4cQvW1YuN/nA5NCj/7G8g3qseLuvHDf9m7d2bdqrN79u/JjY8uq7sZeK3jF89ubNvZ/fHnx+7/Q96z9nrtV2bpHRn4A2SUfgfgEpyF+BiziolH8HMNgghP8hqJQTCW3IYYcefghiiCKOSGKJJp6IYooqrlhOAQA7",
		shitappa : "R0lGODlhQABAAIABAAAAAP//ACH5BAEKAAEALAAAAABAAEAAAAL6jI+py+0Po5y02ouz3rz7DwHiSJbmiaZnqLbuW7LwTMdPjdcyCUb8veo5fkOUsEFEjgK2YyLJ+DWdBuiCOHVaFcmscPtcIrwg8Fh8Rn/VUXbVvIG/RW13R860z+k9PJys4ad3AIghyFc0aHEI4IMnwQj5uEMpqWjZCIToeFmZmDlRyAmqtIlJWhG5OMnVyRrWeeUaW2c66nkhKmvbykuhC4u6K7xKm+ebRlyMHIwb+Kh6F12qbCg3La2InY28za3s/T3sXGYV7pF1jt41y7yOpv5hEy/PQ18f9Ek1fF8OnAPwxY6ABP8VPMgIYcF9DBs6fAgxosSJFBMUAAA7"
	}
};
