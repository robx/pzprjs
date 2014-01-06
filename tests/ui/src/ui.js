
(function(){
	var dir="", srcs=document.getElementsByTagName('script');
	for(var i=0;i<srcs.length;i++){
		var result = srcs[i].src.match(/^(.*\/)ui\.js$/);
		if(result){
			if(result[1].match(/\/$/)){ dir = result[1];}
			else{ dir = result[1]+'/';}
			break;
		}
	}

	var files = [
		"ui/Boot.js",
		"ui/UI.js",
		"ui/Menu.js",
		"ui/MenuArea.js",
		"ui/PopupMenu.js",
		"ui/ToolArea.js",
		"ui/KeyPopup.js",
		"ui/DataBase.js",
		"ui/Timer.js",
		"ui/Debug.js"
	];
	for(var i=0;i<files.length;i++){
		document.writeln('<script type="text/javascript" src="'+dir+files[i]+'"></script>');
	}
})();
