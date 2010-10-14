
/* variables */
var typelist = [];
var current  = '';

/* common function */
function addEvent(element,type,func){
	if(!!element.addEventListener){ element.addEventListener(type,func,false);}
	else if(!!element.attachEvent){ element.attachEvent("on"+type,func);}
	else                          { element["on"+type] = func;}
}

/* onload function */
function onload_func(){
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

		var urlinput = function(e){
			var url = document.getElementById("urlinput_text").value;
			if(!!url){
				localStorage['pzprv3_urldata'] = url;
				window.open('./p.html', '');
			}
		};
		var el = document.getElementById("urlinput_btn");
		if(!!el){ el.addEventListener("click", urlinput, false);}
	}
	disp();
}
function reset_func(){
	typelist = [];
	current  = '';
	onload_func();
}

/* tab-click function */
function click_tab(e){
	var el = (e.target || e.srcElement);
	if(!!el){ current = el.id.substr(8); disp();}
}

/* display tabs and tables function */
function disp(){
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
}

/* addEventListener */
addEvent(window, 'load', onload_func);
