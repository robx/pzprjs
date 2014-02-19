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
		var mode = ui.menu.getConfigVal('mode');
		if(this.element && !!this.paneltype[mode] && ui.menu.getMenuConfig('keypopup')){

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
	// kp.clear()       キーポップアップを削除する
	//---------------------------------------------------------------------------
	create : function(){
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
		ui.event.addEvent(bar, 'dblclick', ui.menu, function(){ this.setMenuConfig('keypopup',false)});
	},
	createtable : function(mode,type){
		this.basepanel = getEL('panelbase'+mode);
		this.basepanel.innerHTML = '';
		
		if(mode==3){ this.tdcolor = ui.puzzle.painter.fontAnscolor;}

		this.generate(mode);
	},
	clear : function(){
		if(!!this.element){
			getEL('panelbase1').innerHTML = '';
			getEL('panelbase3').innerHTML = '';
		}
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
			_div.onclick = function(){ ui.puzzle.key.keyinput(ca,0);};
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
				_child.src = this.dataurl[!!this.dataurl[pid] ? pid : 'shitappa'];
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

		ui.menu.modifyCSS({
			"div.kpcell" : { width:(""+dsize+"px"), height:(""+dsize+"px"), lineHeight:(""+dsize+"px")},
			"span.kpnum" : { fontSize:(""+tsize+"px")}
		});
	},

	dataurl : {
		slalom   : "data:image/gif;base64,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",
		reflect  : "data:image/gif;base64,R0lGODlhAAFAALMAAAAAAP///////////////////////////////////////////////////////////yH5BAEAAAEALAAAAAAAAUAAAAT+MMhJq7046827/2AojmRpnmiqrmzrvnAsz3Rt33iu73zv/8CgcEgsGo8SAHIZUG4A0Kh0Sq1ar1UOdsvtUrVOJhHa8ZrP3yd6bS6TxcKoh03fguv46VwO/0k/eYFvGoKBgH99PHqHhXR3jWsgaYk4k3uQaI+YXiFZlDaekpttaqNdIlafNKmoplyarqGisqotVySxWLC5fK2stSy6uLyWGMTFs7/AKHYlx4iEz4Mjr8sn1c7Su7HX2Na+wibapcTMp9+d593l5LkppOhu6uvu7a4qZ/HbyvT39qMrMukzli9gvWjcDBYcSCFSsIQITdlyyLAJRYUA/zVy4Yhhx4n+GSNielFnYEmSITNIRPnRGp4YKQmOhJHnW02YM0UKkmEIWE+cGzWeBPpS1c4ZkPaxWXU0UaEaQXUO5fm0T1SkTVVmpVqVSVJQP7XehPoVSU6yRaUKBFu2yKYcY8W2RNs2zlu4U2UuxXvXbt9Kcy/kZfvXhz8dgS0kplt4B0TEF/XCg3zY8WPKkyXPw7ySc0zPzdTeMswLdGPT/ARntlz6xrEgqxVzAvKM8EE/m1V7I/0aa2/Yu3WHoz2OZnHgwzUj412bZfMhoeXSIi4tDMbn0EeLtu63+sPq3LsvEn0EfK9+x8dMl70cuXlz5sNnHy99mtv49tPh90pfM3/88slHs99/+bFXoHoABrgddmadpxccCToolHcQHtiQhQhGeImGVik4AYYZcrgghVZpUdGJKKao4oostujiizDGKOOMNNZo443xRAAAOw==",
		shitappa : "data:image/gif;base64,R0lGODlhQABAALMAAAAAAP///////////////////////////////////////////////////////////yH5BAEAAAEALAAAAABAAEAAAAT+MMhJq7046827/2AojmRpnmiqrhzgvnAsz3Q9t3au7zHO/8DeJkgM+mCsDnJ4S2qWT5ozA6W+AsJppYpZZrUS7gX61Yot1bLzvL1S1Cz22z2nr+1dfFh+4u9deXopfliCf4BJhHxwJoqGE4wkjohRjyKTAEqEHpicm0egnpaimUyUmqOhlaUfkaisVqeksCGdl59oqbhtqWO6vYGyr6ojrr7Cucggxry0x863wIXKddDR1M3EjZu2g92x1pJ+396W5OXU5+jW6uvP2nFi7Spl8/Rpv9j3dPYrQv3+kAAM2GQVmGcD4zErwnDHkYYQF0aciIlixIMYM2rcyLGjx48EICtEAAA7"
	}
};
