// testonly.js v3.1.9

	function testonly_func(){
		$("#float_other").append("<font color=white>&nbsp;«”\‘ª’è</font><br>\n")
						 .append("<div class=\"smenu_tmp\" id=\"perfeval\">&nbsp;³“š”»’èŠÔ</div>\n")
						 .append("<div class=\"smenu_tmp\" id=\"painteval\">&nbsp;paintAll()ŠÔ</div>\n")
						 .append("<div class=\"smenu_tmp\" id=\"resizeeval\">&nbsp;resize•`‰æŠÔ</div>\n");
		$("#perfeval").click(perfeval);
		$("#painteval").click(painteval);
		$("#resizeeval").click(resizeeval);

		$("div.smenu_tmp").each(function(){
			$(this).hover(menu.submenuhover.ebind(menu), menu.submenuout.ebind(menu));
			this.className = "smenu";
			$(this).css("font-size",'10pt');
		});
	}

	function perfeval(){
		timeeval(puz.check.bind(puz));
	}
	function painteval(){
		timeeval(pc.paintAll.bind(pc));
	}
	function resizeeval(){
		timeeval(base.resize_canvas.bind(base));
	}

	function timeeval(func){
		var count=0;
		var old = (new Date()).getTime();
		while((new Date()).getTime() - old < 3000){
			count++;

			func();
		}
		var time = (new Date()).getTime() - old;

		alert("‘ª’èŠÔ "+time+"ms\n"+"‘ª’è‰ñ” "+count+"‰ñ\n"+"•½‹ÏŠÔ "+(time/count)+"ms")
	}
