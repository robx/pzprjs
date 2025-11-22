// Boot.js v3.4.0

(function() {

	/********************************/
	/* 初期化時のみ使用するルーチン */
	/********************************/

	var onload_pzv = null;
	var onload_pzl = null;
	var onload_option = {};

	//---------------------------------------------------------------------------
	// ★boot() window.onload直後の処理
	//---------------------------------------------------------------------------
	pzpr.on("load", function boot() {
		var pzl;
		// Get URL search hash and check localStorage to see if a board state is saved
		if (!localStorageAvailable()) {
			pzl = importData()
		} else {
			var key = 'pzpr_' + getPuzzleString()
			var puzzleStr = localStorage.getItem(key)
			if (!puzzleStr) {
				pzl = importData()
			} else {
				pzl = importData(puzzleStr) // Local storage was available and key was found
			}
		}
		if (!pzl) {
			setTimeout(boot,0);
		}
		startPuzzle();
	});

	function importData(string) {
		if (!onload_pzl) {
			/* 1) 盤面複製・index.htmlからのファイル入力/Database入力か */
			/* 2) URL(?以降)をチェック */
			if (!string) {
				onload_pzl = importURL();
			} else {
				onload_pzl = importFromString(string);
			}
			
			/* 指定されたパズルがない場合はさようなら～ */
			if (!onload_pzl || !onload_pzl.pid) {
				failOpen();
			}
		}

		return true;
	}

	function failOpen() {
		if (!!ui.puzzle && !!ui.puzzle.pid) {
			return;
		}
		var title2 = document.getElementById("title2");
		if (!!title2) {
			title2.innerHTML = "Fail to import puzzle data or URL.";
		}
		document.getElementById("menupanel").innerHTML = "";
	}

	function startPuzzle() {
		var pzl = onload_pzl;
		ui.pzv = onload_pzv; // for the puzz.link callback

		/* IE SVGのtextLengthがうまく指定できていないので回避策を追加 */
		if (
			(function(ua) {
				return (
					ua.match(/MSIE/) || (ua.match(/AppleWebKit/) && ua.match(/Edge/))
				);
			})(navigator.userAgent)
		) {
			onload_option.graphic = "canvas";
		}

		/* パズルオブジェクトの作成 */
		var element = document.getElementById("divques");
		var puzzle = (ui.puzzle = new pzpr.Puzzle(element, onload_option));
		pzpr.connectKeyEvents(puzzle);

		/* パズルオブジェクト作成〜open()間に呼ぶ */
		ui.event.onload_func(onload_option);

		// 単体初期化処理のルーチンへ
		puzzle.once("fail-open", failOpen);
		puzzle.open(pzl);
		if (onload_option.variant !== void 0) {
			puzzle.config.set("variant", true);
		}

		puzzle.on("request-aux-editor", ui.auxeditor.open);

		if (!!onload_option.net) {
			ui.network.configure(onload_option.net, onload_option.key);
		}

		return true;
	}

	//---------------------------------------------------------------------------
	// ★importURL() 初期化時にURLを解析し、パズルの種類・エディタ/player判定を行う
	//---------------------------------------------------------------------------
	function importURL() {
		/* index.htmlからURLが入力されていない場合は現在のURLの?以降をとってくる */
		var puzString = getPuzzleString();
		return importFromString(puzString);
	}
	//Splitting functionality from above for flexibility.

	//Return the string associated with the puzzle
	function getPuzzleString() {
		var search = location.search;
		if (!search) {
			return null;
		}
		if (search.charAt(0) === "?") {
			search = search.slice(1); //Non-deprecated version of substr
		}

		while (search.match(/^(\w+)\=(\w+)\&(.*)/)) {
			onload_option[RegExp.$1] = RegExp.$2;
			search = RegExp.$3;
		}
		return search
	}
	//Import from a puzzle string. This can come from the URL or from localStorage
	function importFromString(string) {
		if (!string) {
			return null;
		}

		onload_pzv = string;
		var pzl = pzpr.parser.parseURL(string);
		var startmode = pzl.mode || (!pzl.body ? "editor" : "player");
		onload_option.type = onload_option.type || startmode;

		return pzl;
	}

	//---------------------------------------------------------------------------
	// Functionality to support browser caching
	//---------------------------------------------------------------------------

	//Taken directly from stackoverflow. Apparently this is the most broadly compatible version. https://stackoverflow.com/questions/16427636/check-if-localstorage-is-available
	function localStorageAvailable() {
		var test = 'test';
		try {
			localStorage.setItem(test,test);
			localStorage.removeItem(test)
			return true;
		} catch (e) {
			return false;
		}
	}

	//Save board state. Creates an entry in localStorage whose key is a 'pzpr_' identifier plus the current board state puzzle string.
	//Board state puzzle string is the same thing you get from duplicating the board state
	function saveBoardState() {
		var key = 'pzpr_' + getPuzzleString()
		var url = ui.puzzle.getURL(
					pzpr.parser.URL_PZPRFILE,
					ui.puzzle.playeronly ? "player" : "editor"
				);
		//Strip url to the last option. This is the "puzzle string" we want
		url = url.substring(url.indexOf('?')+1) //Skip to the search parameters part of the url
		while (url.match(/^(\w+)\=(\w+)\&(.*)/)) {
			url = RegExp.$3;
		}
		try {
			localStorage.setItem(key,url)
		} catch (e) {
			console.log(e)
		}
	}

	//Events that trigger a board state save
	document.addEventListener("visibilitychange", function() {
        if (document.visibilityState === "hidden") {
            saveBoardState();
        }
    });
})();
