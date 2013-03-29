// KeyPopup.js v3.4.0
(function(){

var k = pzprv3.consts;

//---------------------------------------------------------------------------
// ★KeyPopupクラス マウスからキーボード入力する際のPopupウィンドウを管理する
//---------------------------------------------------------------------------
// キー入力用Popupウィンドウ
pzprv3.createCoreClass('KeyPopup',
{
	initialize : function(puzzle){
		this.puzzle = puzzle;

		this.haspanel = {	// 有効かどうか
			1 : (this.enablemake_p && pzprv3.EDITOR),
			3 : this.enableplay_p
		};
		this.element = null;				// キーポップアップのエレメント

		this.prefix;
		this.tdcolor = "black";
		this.imgCR = [1,1];		// img表示用画像の横×縦のサイズ

		this.imgs  = [];			// resize用

		this.basetmp   = null;
		this.clearflag = false;

		// ElementTemplate
		this.node_empty = pzprv3.createEL('div');
		this.node_empty.className = 'kpcell kpcellempty';
		pzprv3.unselectable(this.node_empty);
		
		this.node_div = pzprv3.createEL('div');
		this.node_div.className = 'kpcell kpcellvalid';
		pzprv3.unselectable(this.node_div);
		
		this.node_num = pzprv3.createEL('span');
		this.node_num.className = 'kpnum';
		pzprv3.unselectable(this.node_num);
		
		this.node_img = pzprv3.createEL('img');
		this.node_img.className = 'kpimg';
		pzprv3.unselectable(this.node_img);
	},

	enablemake_p : true,
	enableplay_p : false,
	paneltype    : 10,

	//---------------------------------------------------------------------------
	// kp.display()     キーポップアップを表示する
	//---------------------------------------------------------------------------
	display : function(){
		var mode = this.owner.getConfig('mode');
		if(this.element && this.haspanel[mode] && this.owner.getConfig('keypopup')){

			this.element.style.display = 'block';

			pzprv3.getEL('panelbase1').style.display = (mode==1?'block':'none');
			pzprv3.getEL('panelbase3').style.display = (mode==3?'block':'none');
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
		if(!this.haspanel[1] && !this.haspanel[3]){ return;}
		
		if(!this.element){
			this.element = this.makeKeyPopup();
		}
		
		if(this.enablemake_p && pzprv3.EDITOR){ this.createtable(1);}
		if(this.enableplay_p)                 { this.createtable(3);}
	},
	createtable : function(mode){
		this.prefix = ['kp',mode,'_'].join('');

		this.basetmp = pzprv3.getEL('panelbase'+mode);
		this.basetmp.innerHTML = '';

		this.generate(mode,this.paneltype);
	},

	//---------------------------------------------------------------------------
	// kp.makeKeyPopup() キーポップアップのパネルを作成する
	//---------------------------------------------------------------------------
	makeKeyPopup : function(){
		var keypopup, bar, _doc = document, o = this.owner;
		var rect = pzprv3.getRect(pzprv3.getEL('divques'));
		
		keypopup = _doc.createElement('div');
		keypopup.className = 'popup';
		keypopup.id = 'keypopup';
		keypopup.style.left   = (rect.left+48)+'px';
		keypopup.style.top    = (rect.top +48)+'px';
		keypopup.style.zIndex = 100;
		pzprv3.getEL("popup_parent").appendChild(keypopup);
		
		bar = _doc.createElement('div');
		bar.className = 'titlebar';
		bar.id = 'barkeypopup';
		bar.appendChild(_doc.createTextNode("panel"));
		pzprv3.unselectable(bar);
		keypopup.appendChild(bar);
		pzprv3.event.addMouseDownEvent(bar, pzprv3.ui.popupmgr, pzprv3.ui.popupmgr.titlebardown);
		pzprv3.event.addEvent(bar, 'dblclick', o, function(){ o.setConfig('keypopup',false)});
		
		var panel = _doc.createElement('div');
		panel.className = 'panelbase';
		panel.id = 'panelbase1';
		keypopup.appendChild(panel);
		
		panel = _doc.createElement('div');
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
	generate : function(mode,type){
		if     (type===10){ this.gentable10(mode,type);}
		else if(type===51){ this.gentable51(mode,type);}
		else              { this.gentable4 (mode,type);} // 1,2,4の場合
	},
	gentable4 : function(mode,type){
		this.inputcol('num','knum0','0','0');
		this.inputcol('num','knum1','1','1');
		this.inputcol('num','knum2','2','2');
		this.inputcol('num','knum3','3','3');
		this.insertrow();
		this.inputcol('num','knum4','4','4');
		this.inputcol('empty','','','');
		this.inputcol('num','knum_',' ',' ');
		if     (type==1){ this.inputcol('num','knum.','-','?');}
		else if(type==2){ this.inputcol('num','knum.','-','■');}
		else if(type==4){ this.inputcol('num','knum.','-','○');}
		this.insertrow();
	},
	gentable10 : function(mode,type){
		this.inputcol('num','knum0','0','0');
		this.inputcol('num','knum1','1','1');
		this.inputcol('num','knum2','2','2');
		this.inputcol('num','knum3','3','3');
		this.insertrow();
		this.inputcol('num','knum4','4','4');
		this.inputcol('num','knum5','5','5');
		this.inputcol('num','knum6','6','6');
		this.inputcol('num','knum7','7','7');
		this.insertrow();
		this.inputcol('num','knum8','8','8');
		this.inputcol('num','knum9','9','9');
		this.inputcol('num','knum_',' ',' ');
		if(mode==1){ this.inputcol('num','knum.','-','?');}else{ this.inputcol('empty','','','');}
		this.insertrow();
	},
	gentable51 : function(mode,type){
		this.inputcol('image','knumq','q',[0,0]);
		this.inputcol('num','knum_',' ',' ');
		this.inputcol('num','knum1','1','1');
		this.inputcol('num','knum2','2','2');
		this.insertrow();
		this.inputcol('num','knum3','3','3');
		this.inputcol('num','knum4','4','4');
		this.inputcol('num','knum5','5','5');
		this.inputcol('num','knum6','6','6');
		this.insertrow();
		this.inputcol('num','knum7','7','7');
		this.inputcol('num','knum8','8','8');
		this.inputcol('num','knum9','9','9');
		this.inputcol('num','knum0','0','0');
		this.insertrow();
	},

	//---------------------------------------------------------------------------
	// kp.inputcol()  テーブルのセルを追加する
	// kp.insertrow() テーブルの行を追加する
	//---------------------------------------------------------------------------
	inputcol : function(type, id, ca, disp){
		var _div = null, _child = null, self = this;
		if(type!=='empty'){
			_div = this.node_div.cloneNode(false);
			_div.id = this.prefix+id;
			_div.onclick = function(){ self.puzzle.key.keyinput(ca);};
		}
		else{ _div = this.node_empty.cloneNode(false);}

		if(type==='num'){
			_child = this.node_num.cloneNode(false);
			_child.id = this.prefix+id+"_s";
			_child.style.color = this.tdcolor;
			_child.innerHTML   = disp;
		}
		else if(type==='image'){
			_child = this.node_img.cloneNode(false);
			_child.id = this.prefix+id+"_i";
			_child.src = "./src/img/"+this.owner.pid+"_kp.gif";
			this.imgs.push({'el':_child, 'x':disp[0], 'y':disp[1]});
		}

		if(this.clearflag){ _div.style.clear='both'; this.clearflag=false;}
		if(!!_child){ _div.appendChild(_child);}
		this.basetmp.appendChild(_div);
	},
	insertrow : function(){
		this.clearflag = true;
	},

	//---------------------------------------------------------------------------
	// kp.resizepanel() キーポップアップのセルのサイズを変更する
	//---------------------------------------------------------------------------
	resizepanel : function(){
		var cellsize = Math.min(this.owner.painter.cw, 120);
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

		pzprv3.ui.modifyCSS({
			"div.kpcell" : { width:(""+dsize+"px"), height:(""+dsize+"px"), lineHeight:(""+dsize+"px")},
			"span.kpnum" : { fontSize:(""+tsize+"px")}
		});
	}
});

})();
