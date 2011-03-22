(function(){

/* variables */
var typelist = [];
var current  = '';

/* common function */
var addEvent = function(element,type,func){
	if(!!element.addEventListener){ element.addEventListener(type,func,false);}
	else if(!!element.attachEvent){ element.attachEvent("on"+type,func);}
	else                          { element["on"+type] = func;}
};

/* onload function */
var onload_func = function(){
	if(!current){
		var el = document.getElementById("puztypes").firstChild;
		while(!!el){
			if(!!el.tagName && el.tagName.toLowerCase()==='li' &&
			   !!el.id      && el.id.match(/puzmenu_(.+)$/)){
				var typename = RegExp.$1;
				typelist.push(typename);
				addEvent(el,"click",click_tab);
				if(el.className=="puzmenusel"){ current = typename;}
			}
			el = el.nextSibling;
		}
		if(!current && typelist.length>0){ current = typelist[0];}

		el = document.getElementById("urlinput_btn");
		if(!!el){ addEvent(el,"click",urlinput);}
	}
	disp();
};

var reset_func = function(){
	typelist = [];
	current  = '';
	onload_func();
};


/* input-URL function */
var urlinput = function(e){
	var url = document.getElementById("urlinput_text").value;
	if(!!url){
		localStorage['pzprv3_urldata'] = url;
		window.open('./p.html', '');
	}
};

/* tab-click function */
var click_tab = function(e){
	var el = (e.target || e.srcElement);
	if(!!el){ current = el.id.substr(8); disp();}
};

/* display tabs and tables function */
var disp = function(){
	for(var i=0;i<typelist.length;i++){
		var el = document.getElementById("puzmenu_"+typelist[i]);
		var table = document.getElementById("table_"+typelist[i]);
		if(typelist[i]===current){
			el.className = "puzmenusel";
			try     { table.style.display = 'table';}
			catch(e){ table.style.display = 'block';} //IE raises error
		}
		else{
			el.className = "puzmenu";
			table.style.display = 'none';
		}
	}
};

/* addEventListener */
addEvent(window, 'load', onload_func);

})();
