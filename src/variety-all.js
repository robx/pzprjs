
/* concat前のテスト用スクリプト */

/* jshint node: true, evil: true */

var scriptcount = scriptcount || 0;

(function(){
	var component = [
		"variety/amibo",
		"variety/bag",
		"variety/barns",
		"variety/bdblock",
		"variety/bonsan",
		"variety/bosanowa",
		"variety/box",
		"variety/cbblock",
		"variety/country",
		"variety/creek",
		"variety/dosufuwa",
		"variety/factors",
		"variety/fillmat",
		"variety/fillomino",
		"variety/firefly",
		"variety/goishi",
		"variety/gokigen",
		"variety/hakoiri",
		"variety/hanare",
		"variety/hashikake",
		"variety/herugolf",
		"variety/heyawake",
		"variety/hitori",
		"variety/icebarn",
		"variety/ichimaga",
		"variety/juosan",
		"variety/kaero",
		"variety/kakuro",
		"variety/kakuru",
		"variety/kazunori",
		"variety/kinkonkan",
		"variety/kouchoku",
		"variety/kramma",
		"variety/kurochute",
		"variety/kurodoko",
		"variety/kurotto",
		"variety/kusabi",
		"variety/lightup",
		"variety/lits",
		"variety/lookair",
		"variety/loopsp",
		"variety/loute",
		"variety/makaro",
		"variety/mashu",
		"variety/mejilink",
		"variety/minarism",
		"variety/nagare",
		"variety/nagenawa",
		"variety/nanro",
		"variety/nawabari",
		"variety/numlin",
		"variety/nurikabe",
		"variety/nurimaze",
		"variety/paintarea",
		"variety/pipelink",
		"variety/reflect",
		"variety/renban",
		"variety/ripple",
		"variety/roma",
		"variety/shakashaka",
		"variety/shikaku",
		"variety/shimaguni",
		"variety/shugaku",
		"variety/slalom",
		"variety/slither",
		"variety/snakes",
		"variety/sudoku",
		"variety/sukoro",
		"variety/tapa",
		"variety/tasquare",
		"variety/tatamibari",
		"variety/tateyoko",
		"variety/tawa",
		"variety/tentaisho",
		"variety/tilepaint",
		"variety/toichika",
		"variety/triplace",
		"variety/wblink",
		"variety/yajikazu",
		"variety/yajirin",
		"variety/yajitatami",
		"variety/yosenabe"
	];

	if(typeof exports==='undefined'){
		var dir = (function getpath(){
			var srcs=document.getElementsByTagName('script');
			for(var i=0;i<srcs.length;i++){
				var result = srcs[i].src.match(/^(.*\/)pzpr\.js$/);
				if(result){ return result[1] + (!result[1].match(/\/$/) ? '/' : '');}
			}
			return "";
		})();
		
		for(var i=0; i<component.length; i++){
			if(component[i].match(/^ui/)){ continue;}
			scriptcount++;
			var file = dir+component[i]+".js";
			document.write('<script type="text/javascript" src="'+file+'" onload="scriptcount--;"></script>');
		}
	}
	else{
		var dir = "src/";
		exports.files = component.map(function(mod){ return dir+mod+".js";});
	}
})();
