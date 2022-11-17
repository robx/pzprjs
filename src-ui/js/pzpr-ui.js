/* eslint-env node */
exports.files = [
	"common/intro",
	"ui/Boot",
	"ui/UI",
	"common/langs",
	"ui/Event",
	"ui/Listener",
	"ui/MenuConfig",
	"ui/UrlConfig",
	"ui/Misc",
	"ui/MenuArea",
	"ui/PopupMenu",
	"ui/ToolArea",
	"ui/Notify",
	"ui/KeyPopup",
	"ui/Timer",
	"ui/AuxEditor",
	"ui/Network",
	"common/outro"
].map(function(mod) {
	return "src-ui/js/" + mod + ".js";
});
