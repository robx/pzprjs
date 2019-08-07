/* jshint devel:true */
/* global ui:false */

ui.popupmgr.addpopup('auxeditor',
{
    formname : 'auxeditor',

    close: function() {
        if(ui.auxeditor.cb && ui.auxeditor.puzzle) {
            ui.auxeditor.cb(ui.auxeditor.puzzle);
            ui.auxeditor.cb = null;
        }
        
        ui.popupmgr.popups.template.close.apply(this);
    },

    init : function(){
        ui.popupmgr.popups.template.init.call(this);

        function btnfactory(role){
            return function(e){ ui.toolarea[role](e); if(e.type!=='click'){ e.preventDefault(); e.stopPropagation();}};
        }
        function addbtnevent(el,type,role){ pzpr.util.addEvent(el, type, ui.toolarea, btnfactory(role));}

        ui.misc.walker(this.form, function(el){
            if(el.nodeType===1){
                if(el.className==="config"){
                    ui.toolarea.items[ui.customAttr(el,"config")] = {el:el};
                }
                else if(el.className.match(/child/)){
                    var parent = el.parentNode.parentNode, idname = ui.customAttr(parent,"config");
                    var item = ui.toolarea.items[idname];
                    if(!item.children){ item.children=[];}
                    item.children.push(el);
                    
                    addbtnevent(el, "mousedown", "toolclick");
                }
            }
        });
    }
});

ui.auxeditor = {
    open: function(sender, pid, url, cb) {
        ui.popupmgr.open("auxeditor", 0, 0);

        if(!ui.auxeditor.puzzle) {
            var element = document.getElementById('divauxeditor');
            ui.auxeditor.puzzle = new pzpr.Puzzle(element, {type: "player", cellsize: 32});
        }
        var pz = ui.auxeditor.puzzle;

        pz.open(pid+"/"+url, function() {
            ui.popupmgr.popups.auxeditor.titlebar.innerText = ui.selectStr(pz.info.ja, pz.info.en);
        });

        ui.auxeditor.cb = cb;
        ui.menuconfig.set("auxeditor_inputmode", "auto");
        // TODO calculate cellsize
        // TODO open at different coordinates
    }
};
