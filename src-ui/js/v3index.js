(function(){

/* variables */
var v3index = {
	doclang  : pzpr.lang,
	complete : false,
	testdoc  : false,
	captions : [],
	phtml    : "p.html",
	extend : function(obj){ for(var n in obj){ this[n] = obj[n];}}
};

var _doc = document;
var self = v3index;

self.doclang = JSON.parse(localStorage['pzprv3_config:ui']||'{}').language || pzpr.lang;

if(location.search==='?en'||location.search==='?ja'){
	self.doclang = location.search.substr(1,2);
}
if(location.href.match(/\/tests\/index/)){
	self.doclang = 'ja';
	self.testdoc = true;
}
if(location.hostname==='puzz.link'){
	// puzz.link serves p.html at puzz.link/p
	self.phtml = "p";
}

function getEL(id){ return _doc.getElementById(id);}
function customAttr(el, name){
	var value = "";
	if(el.dataset!==void 0){ value = el.dataset[name];}
	/* IE10, Firefox5, Chrome7, Safari5.1以下のフォールバック */
	else{
		var lowername = "data-";
		for(var i=0;i<name.length;i++){
			var ch = name[i] || name.charAt(i);
			lowername += ((ch>="A" && ch<="Z") ? ("-" + ch.toLowerCase()) : ch);
		}
		value = el[lowername] || el.getAttribute(lowername) || "";
	}
	return value;
}

v3index.extend({
	/* onload function */
	onload_func : function(){
		if(!window.pzprfaq && !self.input_init()){
			var el = getEL("puzmenu_input");
			if(!!el){
				el.parentNode.removeChild(el);
				getEL("table_input").style.display = 'none';
			}
		}

		Array.prototype.slice.call(_doc.querySelectorAll('#puztypes > li')).forEach(function(el){
			if(el.id.match(/puzmenu_(.+)$/)){
				var typename = RegExp.$1;
				el.addEventListener("click",(function(typename){ return function(e){self.click_tab(typename);};})(typename),false);
			}
		});
		if(!!getEL('puztypes')){ getEL('puztypes').style.display = "block";}

		self.disp_tab();

		self.setTranslation();
		self.translate();
	},
	input_init : function(){
		var cnt=0;
		if(self.urlif.init()) { cnt++;}
		if(self.fileif.init()){ cnt++;}

		return (cnt>0);
	},

	/* tab-click function */
	click_tab : function(typename){
		Array.prototype.slice.call(_doc.querySelectorAll('#puztypes > li')).forEach(function(el){
			el.className = (el.id==='puzmenu_'+typename ? "puzmenusel" : "puzmenu");
		});
		self.disp_tab();
		if(customAttr(_doc.querySelector('li.puzmenusel'),'table')==='all'){ self.set_puzzle_filter(typename);}
		if(typename==="input"){ self.dbif.display();} /* iPhone用 */
	},
	/* display contents and tables in tabs function */
	disp_tab : function(){
		var isdisp = {};
		Array.prototype.slice.call(_doc.querySelectorAll('#puztypes > li')).forEach(function(el){
			if(!el.id.match(/puzmenu_(.+)$/)){ return;}
			var tablename = 'table_'+customAttr(el, 'table');
			if(isdisp[tablename]===void 0){ isdisp[tablename] = false;}
			if(isdisp[tablename]===false && el.className==='puzmenusel'){ isdisp[tablename] = true;}
		});
		Array.prototype.slice.call(_doc.querySelectorAll('div.puztable')).forEach(function(el){
			el.style.display = (!!isdisp[el.id||'1'] ? 'block' : 'none');
		});
	},

	/* filter-click function */
	set_puzzle_filter : function(filtername){
		/* Set visibility of each puzzle */
		Array.prototype.slice.call(_doc.querySelectorAll('.lists ul > li')).forEach(function(el){
			var pid = pzpr.variety.toPID(customAttr(el, 'pid'));
			if(!!pid){
				var isdisp = (filtername==='all' || filtername===(self.variety[pid] ? self.variety[pid].tab : 'extra'));
				el.style.display = (isdisp ? '' : 'none');
			}
		});
		/* Set visibility of each flexbox */
		Array.prototype.slice.call(_doc.querySelectorAll('.lists ul')).forEach(function(el){
			var count = 0;
			Array.prototype.slice.call(el.querySelectorAll('li')).forEach(function(el){
				if(el.style.display!=='none'){ count++;}
			});
			el.parentNode.style.display = (count>0 ? '' : 'none');
		});
	},

	/* Language display functions */
	setlang : function(lang){
		self.doclang = lang;
		self.translate();

		var setting = JSON.parse(localStorage['pzprv3_config:ui']||'{}');
		setting.language = lang;
		localStorage['pzprv3_config:ui'] = JSON.stringify(setting);
	},
	setTranslation : function(){
		Array.prototype.slice.call(_doc.querySelectorAll('.lists li')).forEach(function(el){
			var pinfo = pzpr.variety(customAttr(el, 'pid'));
			var pid = pinfo.pid;
			if(!pinfo.valid){ return;}
			if(el.childNodes.length===0){
				el.className = (self.variety[pid] ? self.variety[pid].state : 'omopa');
				el.innerHTML = '<a href="'+v3index.phtml+'?'+pid+(!self.testdoc?'':'_test')+'"></a>';
			}
			self.captions.push({anode:el.firstChild, str_jp:pinfo.ja, str_en:pinfo.en});
		});
	},
	translate : function(){
		/* キャプションの設定 */
		for(var i=0;i<this.captions.length;i++){
			var obj = this.captions[i];
			if(!!obj.anode){
				var text = (self.doclang==="ja" ? obj.str_jp : obj.str_en);
				obj.anode.innerHTML = text.replace(/(\(.+\))/g, "<small>$1</small>");
			}
		}
		Array.prototype.slice.call(_doc.body.querySelectorAll('[lang="ja"]')).forEach(function(el){
			el.style.display = (self.doclang==='ja' ? '' : 'none');
		});
		Array.prototype.slice.call(_doc.body.querySelectorAll('[lang="en"]')).forEach(function(el){
			el.style.display = (self.doclang==='en' ? '' : 'none');
		});
	}
});

/* addEventListener */
window.addEventListener('load', self.onload_func, false);

/* extern */
window.v3index = v3index;

})();

/*********************/
/* URLInput function */
/*********************/
(function(){

var v3index = window.v3index;

v3index.urlif = {
	extend : function(obj){ for(var n in obj){ this[n] = obj[n];}}
};

var _doc = document;
var _form;
var self = v3index.urlif;

function getEL(id){ return _doc.getElementById(id);}

v3index.urlif.extend({
	init : function(){
		_form = _doc.urlinput;
		if(!!_form){
			getEL("urlinput_btn").addEventListener("click", self.urlinput, false);
			return true;
		}
	},
	urlinput : function(e){
		var url = getEL("urlinput_text").value;
		if(!!url){
			localStorage['pzprv3_urldata'] = url;
			window.open('./p', '');
		}
	}
});

})();

/*********************/
/* FileRead function */
/*********************/
(function(){

var v3index = window.v3index;

v3index.fileif = {
	extend : function(obj){ for(var n in obj){ this[n] = obj[n];}}
};

var _doc = document;
var _form;
var self = v3index.fileif;

v3index.fileif.extend({
	init : function(){
		_form = _doc.fileform;
		if(!!_form){
			_form.filebox.addEventListener("change", self.fileinput, false);
			return true;
		}
	},

	fileinput : function(e){
		var fileEL = _doc.fileform.filebox;
		if(typeof FileReader !== 'undefined'){
			var reader = new FileReader();
			reader.onload = function(e){
				self.fileonload.call(self, e.target.result);
			};
			reader.readAsText(fileEL.files[0]);
		}
		else if(typeof FileList !== 'undefined' &&
			typeof File.prototype.getAsText !== 'undefined')
		{
			if(!fileEL.files[0]){ return;}
			this.fileonload(fileEL.files[0].getAsText(''));
		}

		_doc.fileform.reset();
	},
	fileonload : function(str){
		if(!!str){
			var farray = str.replace(/[\t\r]*\n/g,"\n").split(/\n/);
			var fstr = "";
			for(var i=0;i<farray.length;i++){
				if(farray[i].match(/^http\:\/\//)){ break;}
				fstr += (farray[i]+"\n");
			}

			localStorage['pzprv3_filedata'] = fstr;
			window.open('./p', '');
		}
	}
});

})();

/*********************/
/* Database function */
/*********************/
(function(){

var v3index = window.v3index;

var pstate = {
	lunch :['nurikabe','tilepaint','norinori','nurimaze','heyawake','hitori','slither','mashu','yajilin',
			'slalom','numlin','hashikake','herugolf','shikaku','tentaisho','kakuro','sudoku','fillomino','ripple',
			'akari','shakashaka'],
	testa :['nagare','dosufuwa','usoone','moonsun'],
	trial :['stostone','armyants'],
	lunch2:['box','lits','kurodoko','goishi'],
	lunch3:['minarism','factors'],
	nigun :['creek','mochikoro','tasquare','kurotto','shimaguni','yajikazu','bag','country','reflect','icebarn',
			'firefly','kaero','yosenabe','bdblock','fivecells','sashigane','tatamibari','sukoro',
			'gokigen','tateyoko','kinkonkan','hebi','makaro','juosan'],
	omopa :['nuribou','tawa','lookair','paintarea','chocona','kurochute','mejilink',
			'pipelink','loopsp','nagenawa','kouchoku','ringring','pipelinkr','barns','icelom','icelom2',
			'wblink','kusabi','ichimaga','ichimagam','ichimagax','amibo','bonsan','heyabon','rectslider',
			'nawabari','triplace','fourcells','kramma','kramman','shwolf','loute','fillmat','usotatami','yajitatami',
			'kakuru','view','bosanowa','nanro','cojun','renban','sukororoom','hanare','kazunori',
			'wagiri','shugaku','hakoiri','roma','toichika','cbblock','nondango','onsen'],
	orig  :['mochinyoro','ayeheya','aho'],
	genre :['tapa','arukone','yinyang','building','kropki','starbattle','easyasabc','walllogic'],
	add   :['angleloop', 'doubleback', 'nurimisaki', 'meander', 'satogaeri', 'scrin', 'heteromino',
			'yajilin-regions', 'dbchoco', 'geradeweg', 'pencils', 'curvedata', 'aquarium', 'compass', 'castle']
};
var tabstate = {
	lunch:'lunch', lunch2:'lunch', lunch3:'nigun',
	testa:'nigun', nigun:'nigun',
	trial:'omopa', omopa:'omopa',
	orig :'extra', genre:'extra',
	add  :'add'
};

var genres = {};
for(var state in pstate){
	pstate[state].forEach(function(pid){
		genres[pzpr.variety.toPID(pid)] = {state:state, tab:tabstate[state]};
	});
}

v3index.extend({variety:genres});

})();
