var v3index = {};

(function(){

/* variables */
v3index = {
	typelist : [],
	current  : '',
	language : 'ja',
	extend : function(obj){ for(var n in obj){ this[n] = obj[n];}}
};

var _doc = document;
var self = v3index;
var typelist = self.typelist;

v3index.extend({
	/* common function */
	addEvent : function(element,type,func){
		if(!!element.addEventListener){ element.addEventListener(type,func,false);}
		else if(!!element.attachEvent){ element.attachEvent("on"+type,func);}
		else                          { element["on"+type] = func;}
	},

	/* onload function */
	onload_func : function(){
		if(!self.current){
			var el = _doc.getElementById("puztypes").firstChild;
			while(!!el){
				if(!!el.tagName && el.tagName.toLowerCase()==='li' &&
				   !!el.id      && el.id.match(/puzmenu_(.+)$/)){
					var typename = RegExp.$1;
					typelist.push(typename);
					self.addEvent(el,"click",self.click_tab);
					if(el.className=="puzmenusel"){ self.current = typename;}
				}
				el = el.nextSibling;
			}
			if(!self.current && typelist.length>0){ self.current = typelist[0];}

			var userlang = (navigator.browserLanguage || navigator.language || navigator.userLanguage);
			if(userlang.substr(0,2)!=='ja'){ self.language = 'en';}

			el = _doc.getElementById("urlinput_btn");
			if(!!el){ self.addEvent(el,"click",self.urlinput);}

			self.dbif.init();
		}
		self.disp();
	},

	reset_func : function(){
		typelist = [];
		self.current  = '';
		self.onload_func();
	},


	/* input-URL function */
	urlinput : function(e){
		var url = _doc.getElementById("urlinput_text").value;
		if(!!url){
			localStorage['pzprv3_urldata'] = url;
			window.open('./p.html', '');
		}
	},

	/* tab-click function */
	click_tab : function(e){
		var el = (e.target || e.srcElement);
		if(!!el){ self.current = el.id.substr(8); self.disp();}
	},

	/* display tabs and tables function */
	disp : function(){
		for(var i=0;i<typelist.length;i++){
			var el = _doc.getElementById("puzmenu_"+typelist[i]);
			var table = _doc.getElementById("table_"+typelist[i]);
			if(typelist[i]===self.current){
				el.className = "puzmenusel";
				try     { table.style.display = 'table';}
				catch(e){ table.style.display = 'block';} //IE raises error
			}
			else{
				el.className = "puzmenu";
				table.style.display = 'none';
			}
		}
	}
});

/* addEventListener */
self.addEvent(window, 'load', self.onload_func);

})();

/*********************/
/* Database function */
/*********************/
(function(){

v3index.dbif = {
	list   : [],
	LS     : false,
	extend : function(obj){ for(var n in obj){ this[n] = obj[n];}}
};

var _doc = document;
var _form;
var self = v3index.dbif;
var DBlist = self.list;
var isGecko = (navigator.userAgent.indexOf('Gecko')>-1 && navigator.userAgent.indexOf('KHTML') == -1);
var pheader = '';

v3index.dbif.extend({
	init : function(){
		// HTML5 - Web localStorage判定用(localStorage)
		try{ if(!!window.localStorage && (!isGecko || !!location.hostname)){ self.LS = true;}}
		catch(e){}

		if(self.LS){
			_form = _doc.database;
			
			v3index.addEvent(_form.sorts,    "change", self.display);
			v3index.addEvent(_form.datalist, "change", self.select);
			v3index.addEvent(_form.open,     "click",  self.open);
			
			pheader = 'pzprv3_storage:data:';
			self.importlist(self.display);
		}
	},
	importlist : function(callback){
		DBlist = [];
		for(var i=1;true;i++){
			var row = JSON.parse(localStorage[pheader+i]);
			if(!row || row.id==null){ break;}
			DBlist.push(row);
		}
		if(!!callback){ callback();}
	},
	display : function(){
		switch(_form.sorts.value){
			case 'idlist' : DBlist = DBlist.sort(function(a,b){ return (a.id-b.id);}); break;
			case 'newsave': DBlist = DBlist.sort(function(a,b){ return (b.time-a.time || a.id-b.id);}); break;
			case 'oldsave': DBlist = DBlist.sort(function(a,b){ return (a.time-b.time || a.id-b.id);}); break;
			case 'size'   : DBlist = DBlist.sort(function(a,b){ return (a.col-b.col || a.row-b.row || a.hard-b.hard || a.id-b.id);}); break;
		}

		_form.datalist.innerHTML = "";
		for(var i=0;i<DBlist.length;i++){
			var row = DBlist[i];
			if(!!row){
				var opt = _doc.createElement('option');
				opt.setAttribute('value', row.id);
				opt.innerHTML = self.getcaption(row);
				_form.datalist.appendChild(opt);
			}
		}
	},
	getcaption : function(row){
		var hardstr = [
			{ja:'−'       , en:'-'     },
			{ja:'らくらく', en:'Easy'  },
			{ja:'おてごろ', en:'Normal'},
			{ja:'たいへん', en:'Hard'  },
			{ja:'アゼン'  , en:'Expert'}
		];

		var datestr = (function(){
			var ni = function(num){ return (num<10?"0":"")+num;}, str = "", date = new Date();
			date.setTime(row.time*1000);
			str += (ni(date.getFullYear()%100) + "/" + ni(date.getMonth()+1) + "/" + ni(date.getDate())+" ");
			str += (ni(date.getHours()) + ":" + ni(date.getMinutes()));
			return str;
		})();

		var str = "";
		str += ((row.id<10?"&nbsp;":"")+row.id+" :&nbsp;");
		str += (PZLNAME[v3index.language][row.pid]+"&nbsp;");
		str += (""+row.col+"×"+row.row+" &nbsp;");
		if(!!row.hard || row.hard=='0'){
			str += (hardstr[row.hard][v3index.language]+"&nbsp;");
		}
		str += ("("+datestr+")");
		return str;
	},

	select : function(){
		var selected = self.getvalue();
		_form.comtext.value = (selected>=0 ? ""+DBlist[selected].comment : "");
	},
	open : function(){
		var selected = self.getvalue();
		if(selected>=0){
			var str = DBlist[selected].pdata;
			if(!!str){
				localStorage['pzprv3_filedata'] = str;
				window.open('./p.html', '');
			}
		}
	},
	getvalue : function(){
		var val = _form.datalist.value;
		if(val!=""){
			for(var i=0;i<DBlist.length;i++){
				if(DBlist[i].id==val){ return i;}
			}
		}
		return -1;
	}
});

})();
