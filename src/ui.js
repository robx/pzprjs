
(function(){
	var dir="", srcs=document.getElementsByTagName('script');
	for(var i=0;i<srcs.length;i++){
		var result = srcs[i].src.match(/^(.*\/)pzprv3\.js$/);
		if(result){
			if(result[1].match(/\/$/)){ dir = result[1];}
			else{ dir = result[1]+'/';}
			break;
		}
	}

	var files = [
		"pzprUI/Boot.js",
		"pzprUI/UI.js",
		"pzprUI/Menu.js",
		"pzprUI/MenuArea.js",
		"pzprUI/PopupMenu.js",
		"pzprUI/ToolArea.js",
		"pzprUI/KeyPopup.js",
		"pzprUI/DataBase.js",
		"pzprUI/Timer.js",
		"pzprUI/Debug.js"
	];
	for(var i=0;i<files.length;i++){
		document.writeln('<script type="text/javascript" src="'+dir+files[i]+'"></script>');
	}
})();
