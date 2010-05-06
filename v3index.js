
/* variables */
var typelist = ['all','lunch','nigun','omopa','other','notice'];
var current  = 'notice';

/* common function */
function addEvent(element,type,func){
	if(!!element.addEventListener){
		element.addEventListener(type,func,false);
	}
	else if(!!element.attachEvent){
		element.attachEvent("on"+type,func);
	}
}

/* onload function */
function onload_func(){
	for(var i=0;i<typelist.length;i++){
		addEvent(document.getElementById("puzmenu_"+typelist[i]),"click",click_tab);
	}
	disp();
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
			el.style.backgroundColor = "white";
			el.style.color           = "black";
			el.style.cursor          = "default";

			try{ table.style.display = 'table';}
			catch(e){ table.style.display = 'block';} //IE raises error
			table.style.width   = '100%';
		}
		else{
			el.style.backgroundColor = "#dfdfdf";
			el.style.color           = "gray";
			el.style.cursor          = "pointer";

			table.style.display = 'none';
		}
	}
}

/* addEventListener */
addEvent(window, 'load', onload_func);
