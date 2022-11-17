// Notify.js v3.5.0
/* global getEL:readonly */

//---------------------------------------------------------------------------
// ★Notifyクラス alert, confirm関連を管理します
//---------------------------------------------------------------------------
ui.notify = {
	onconfirm: null,

	//---------------------------------------------------------------------------
	// notify.reset()      Notificationの設定を初期化する
	//---------------------------------------------------------------------------
	reset: function() {
		/* イベントを割り当てる */
		this.walkElement(getEL("notifies"));
	},

	//---------------------------------------------------------------------------
	// notify.walkElement()  エレメントを探索して領域の初期設定を行う
	//---------------------------------------------------------------------------
	walkElement: function(parent) {
		var notify = this;
		ui.misc.walker(parent, function(el) {
			if (el.nodeType === 1) {
				/* ボタン領域 */
				var role = ui.customAttr(el, "buttonExec");
				if (!!role) {
					pzpr.util.addEvent(
						el,
						!pzpr.env.API.touchevent ? "click" : "mousedown",
						notify,
						notify[role]
					);
				}

				/* タイトルバーでボックスを動かす設定 */
				if (el.className === "titlebar") {
					pzpr.util.addEvent(
						el,
						"mousedown",
						ui.popupmgr,
						ui.popupmgr.titlebardown
					);
				}
			}
		});
	},

	//--------------------------------------------------------------------------------
	// ui.alert()   現在の言語に応じたダイアログを表示する
	// ui.confirm() 現在の言語に応じた選択ダイアログを表示し、結果を返す
	// ui.setVerticalPosition() 指定したエレメントの盾位置を画面中央に設定して表示する
	//--------------------------------------------------------------------------------
	alert: function(str) {
		getEL("notification").innerHTML = str;
		this.setVerticalPosition(getEL("assertbox"));
	},
	confirm: function(str, func) {
		getEL("confirmcaption").innerHTML = str;
		this.setVerticalPosition(getEL("confirmbox"));
		this.onconfirm = func;
	},
	setVerticalPosition: function(el) {
		var elbg = getEL("notifybg");
		elbg.style.display = "block";
		el.style.display = "inline-block";

		/* innerHeightがIE8以下にないので、代わりに背景要素の高さ(height=100%), 幅を取得します */
		var rect = pzpr.util.getRect(el),
			rectbg = pzpr.util.getRect(elbg);
		el.style.top = (rectbg.height - rect.height) / 2 + "px";
		el.style.left = (rectbg.width - rect.width) / 2 + "px";
	},

	//---------------------------------------------------------------------------
	// notify.closealert()  alertを非表示に戻す
	//---------------------------------------------------------------------------
	closealert: function(e) {
		getEL("assertbox").style.display = "none";
		getEL("notifybg").style.display = "none";
		e.preventDefault();
		e.stopPropagation();
	},

	//---------------------------------------------------------------------------
	// notify.confirmtrue()  confirmでOKが押された時の処理を記入する
	// notify.confirmfalse() confirmでCancelが押されたときの処理を記入する
	//---------------------------------------------------------------------------
	confirmtrue: function(e) {
		if (!!this.onconfirm) {
			this.onconfirm();
		}
		this.onconfirm = null;
		this.confirmfalse(e);
	},
	confirmfalse: function(e) {
		getEL("confirmbox").style.display = "none";
		getEL("notifybg").style.display = "none";
		e.preventDefault();
		e.stopPropagation();
	}
};
