// event.js v3.4.1

(function() {
	//---------------------------------------------------------------
	// 起動時関連関数
	//---------------------------------------------------------------
	var preinit = true;
	var loadfun = [];
	pzpr.on = function(eventtype, func) {
		if (eventtype === "load") {
			if (preinit) {
				loadfun.push(func);
			} else {
				func();
			}
		}
	};

	//----------------------------------------------------------------------
	// 起動時処理実行処理
	//----------------------------------------------------------------------
	function postload(e) {
		if (navigator && "serviceWorker" in navigator) {
			navigator.serviceWorker.getRegistrations().then(function(registrations) {
				registrations.forEach(function(registration) {
					registration.unregister();
				});

				if (registrations.length > 0 && location) {
					setTimeout(function() {
						location.reload();
					}, 500);
				}
			});
		}

		if (preinit) {
			preinit = false;
			for (var i = 0; i < loadfun.length; i++) {
				loadfun[i]();
			}
			loadfun = [];
		}
	}

	if (!pzpr.env.browser) {
	} else if (document.readyState === "complete") {
		setTimeout(postload, 10);
	} else {
		document.addEventListener("DOMContentLoaded", postload, false);
		window.addEventListener("load", postload, false);
	}

	//---------------------------------------------------------------------------
	// addKeyEvents()  キーボード入力発生時に指定されたパズルへ通知する準備を行う
	// exec????()      各パズルのキー入力へ分岐する
	//---------------------------------------------------------------------------
	var keytarget = null;
	function execKeyDown(e) {
		if (!!keytarget && !!keytarget.key) {
			keytarget.key.e_keydown(e);
		}
	}
	function execKeyUp(e) {
		if (!!keytarget && !!keytarget.key) {
			keytarget.key.e_keyup(e);
		}
	}
	pzpr.on("load", function addKeyEvents() {
		// キー入力イベントの設定
		pzpr.util.addEvent(document, "keydown", pzpr, execKeyDown);
		pzpr.util.addEvent(document, "keyup", pzpr, execKeyUp);
	});

	//---------------------------------------------------------------------------
	// connectKeyEvents()  キーボード入力に関するイベントを指定したパズルへ通知する準備を行う
	//---------------------------------------------------------------------------
	pzpr.connectKeyEvents = function(puzzle) {
		keytarget = puzzle;
	};
})();
