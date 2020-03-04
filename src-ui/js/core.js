window.ui = require('./ui/UI.js');
window.ui.event = require('./ui/Event.js');
window.ui.listener = require('./ui/Listener.js');
window.ui.menuconfig = require('./ui/MenuConfig.js');
window.ui.urlconfig = require('./ui/UrlConfig.js');
window.ui.misc = require('./ui/Misc.js');
window.ui.menuarea = require('./ui/MenuArea.js');
window.ui.popupmgr = require('./ui/PopupMenu.js');
window.ui.toolarea = require('./ui/ToolArea.js');
window.ui.notify = require('./ui/Notify.js');
window.ui.keypopup = require('./ui/KeyPopup.js');
timer = require('./ui/Timer.js');
window.ui.timer = timer.timer
window.ui.undotimer = timer.undotimer
window.ui.auxeditor = require('./ui/AuxEditor.js'); // changes popupmgr


require('./ui/Boot.js');
