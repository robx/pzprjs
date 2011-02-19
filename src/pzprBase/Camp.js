// Camp.js rev94
 
(function(){

// 多重定義防止
if(!!window.Camp){ return;}

/* ------------- */
/*   variables   */
/* ------------- */
var _win = this,
	_doc = document,
	_ms = Math.sin,
	_mc = Math.cos,
	_2PI = 2*Math.PI,

	_IE = !!(window.attachEvent && !window.opera),

	Z  = 10,
	Z2 = Z/2,

	_color = [],
	flags = { debugmode:false },
	_types = ['svg','canvas','sl','flash','vml'],
	_initializing = 0,

	VML    = 0,
	SVG    = 1,
	CANVAS = 2,
	SL     = 3,
	FLASH  = 4,

	BEFOREEND = 'BeforeEnd';

/* ---------- */
/*   arrays   */
/* ---------- */
var _hex = (function(){
	var tbl = [];
	for(var r=256;r<512;r++){ tbl[r-256]=r.toString(16).substr(1);}
	return tbl;
})();

/* ------------ */
/*   共通関数   */
/* ------------ */
function getRectSize(el){
	return { width :(el.offsetWidth  || el.clientWidth),
			 height:(el.offsetHeight || el.clientHeight)};
}
function parsecolor(rgbstr){
	if(!_color[rgbstr]){
		if(rgbstr.substr(0,4)==='rgb('){
			var m = rgbstr.match(/\d+/g);
			_color[rgbstr] = ["#",_hex[m[0]],_hex[m[1]],_hex[m[2]]].join('');
		}
		else{ _color[rgbstr] = rgbstr;}
	}
	return _color[rgbstr];
}
function parsecolorrev(colorstr){
	if(colorstr.match(/\#([0-9a-f][0-9a-f])([0-9a-f][0-9a-f])([0-9a-f][0-9a-f])/)){
		var m0 = parseInt(RegExp.$1,16).toString();
		var m1 = parseInt(RegExp.$2,16).toString();
		var m2 = parseInt(RegExp.$3,16).toString();
		return ["rgb(",m0,',',m1,',',m2,")"].join('');
	}
	return colorstr;
}
function _extend(obj, ads){
	for(var name in ads){ obj[name] = ads[name];}
}

/* ------------------ */
/*   TypeListクラス   */
/* ------------------ */
var TypeList = function(){
	this.canvas = false;
	this.vml    = false;
	this.svg    = false;
	this.sl     = false;
	this.flash  = false;
};

/* ------------------------------------------- */
/*   VectorContext(VML)クラス用const文字列集   */
/* ------------------------------------------- */
var V_TAG_SHAPE    = '<v:shape',
	V_TAG_GROUP    = '<v:group',
	V_TAG_IMAGE    = '<v:image',
	V_TAG_TEXTPATH = '<v:textpath',
	V_TAG_POLYLINE = '<v:polyline',
	V_TAG_PATH_FOR_TEXTPATH = '<v:path textpathok="t" />',
	V_EL_UNSELECTABLE = '', // デフォルトはunselectableでない
//	V_EL_UNSELECTABLE = ' unselectable="on"',
	V_TAGEND      = '>',
	V_TAGEND_NULL = ' />',
	V_CLOSETAG_SHAPE    = '</v:shape>',
	V_CLOSETAG_GROUP    = '</v:group>',
	V_CLOSETAG_IMAGE    = '</v:image>',
	V_CLOSETAG_TEXTPATH = '</v:textpath>',
	V_CLOSETAG_POLYLINE = '</v:polyline>',

	V_ATT_ID     = ' id="',
	V_ATT_PATH   = ' path="',
	V_ATT_POINTS = ' points="',
	V_ATT_STYLE  = ' style="',
	V_ATT_STRING = ' string="',
	V_ATT_COORDSIZE    = ' coordsize="100,100"',
	V_ATT_FILLCOLOR    = ' fillcolor="',
	V_ATT_STROKECOLOR  = ' strokecolor="',
	V_ATT_STROKEWEIGHT = ' strokeweight="',
	V_ATT_END = '"',
	V_ATT_STYLE_TEXTBOX = ' style="white-space:nowrap;cursor:default;font:10px sans-serif;"',
	V_DEF_ATT_POLYLINE  = ' stroked="f" filled="t"',
	V_DEF_ATT_TEXTPATH  = ' on="t" xscale="t"',

	V_STYLE_LEFT  = 'left:',
	V_STYLE_TOP   = 'top:',
	V_STYLE_FONT  = 'font:',
	V_STYLE_ALIGN = 'v-text-align:',
	V_STYLE_END   = ';',

	V_PATH_MOVE   = ' m',
	V_PATH_LINE   = ' l',
	V_PATH_CLOSE  = ' x',
	V_PATH_NOSTROKE = ' ns',
	V_PATH_NOFILL   = ' nf',

	V_HEIGHT = { top:-0.7, hanging:-0.66, middle:-0.3, alphabetic:0, bottom:0.1 };

/* ------------------------------------------- */
/*   VectorContext(SVG)クラス用const文字列集   */
/* ------------------------------------------- */
var SVGNS   = "http://www.w3.org/2000/svg",
	XLINKNS = "http://www.w3.org/1999/xlink",
	S_PATH_MOVE   = ' M',
	S_PATH_LINE   = ' L',
	S_PATH_ARCTO  = ' A',
	S_PATH_CLOSE  = ' z',

	S_ATT_ID          = 'id',
	S_ATT_FILL        = 'fill',
	S_ATT_STROKE      = 'stroke',
	S_ATT_STROKEWIDTH = 'stroke-width',
	S_ATT_RENDERING   = 'shape-rendering',

	S_NONE = 'none',

	S_ANCHOR = { left:'start', center:'middle', right:'end'},
	S_HEIGHT = { top:-0.7, hanging:-0.66, middle:-0.3, alphabetic:0, bottom:0.1 },

/* ------------------------------------------ */
/*   VectorContext(SL)クラス用const文字列集   */
/* ------------------------------------------ */
	SL_WIDTH = { left:0, center:0.5, right:1 },
	SL_HEIGHT = { top:0.2, hanging:0.2, middle:0.5, alphabetic:0.7, bottom:0.8 },

/* --------------------------------- */
/*   VectorContextクラス用変数など   */
/* --------------------------------- */
	EL_ID_HEADER = "canvas_o_",
	ME    = null,
	EMPTY = '';

function initME(){
	ME = _doc.createElement('div');
	ME.style.display  = 'inline';
	ME.style.position = 'absolute';
	ME.style.left     = '-9000px';
	ME.innerHTML = '';
	_doc.body.appendChild(ME);

	Camp.ME = ME;
}

/* ----------------------- */
/*   VectorContextクラス   */
/* ----------------------- */
var VectorContext = function(type, idname){
	// canvasに存在するプロパティ＆デフォルト値
	this.fillStyle    = 'black';
	this.strokeStyle  = 'black';
	this.lineWidth    = 1;
	this.font         = '14px system';
	this.textAlign    = 'center';
	this.textBaseline = 'middle';
	this.canvas = null;	// 親エレメントとなるdivエレメント

	// changeOrigin用(Sinverlight用)
	this.x0 = 0;
	this.y0 = 0;

	// 外部から変更される追加プロパティ
	this.vid      = '';
	this.elements = [];
	this.lastElement = null;

	// variables for internal
	this.type   = type;
	this.target = null;	// エレメントの追加対象となるオブジェクト
	this.child  = null;	// this.canvasの直下にあるエレメント
	this.idname = idname;
	this.canvasid = EL_ID_HEADER+idname;
	this.cpath    = [];
	this.lastpath = '';

	this.currentLayerId = '_empty';
	this.isedgearray    = {_empty:false};
	this.isedge         = false;

	// Silverlight用
	this.content = null;

	this.use = new TypeList();

	// define const
	if(this.type===SVG || this.type===SL){
		this.PATH_MOVE  = S_PATH_MOVE;
		this.PATH_LINE  = S_PATH_LINE;
		this.PATH_CLOSE = S_PATH_CLOSE;
		if(this.type===SVG){ this.use.svg = true;}
		if(this.type===SL) { this.use.sl  = true;}
	}
	else if(this.type===VML){
		this.PATH_MOVE  = V_PATH_MOVE;
		this.PATH_LINE  = V_PATH_LINE;
		this.PATH_CLOSE = V_PATH_CLOSE;
		this.use.vml = true;
	}

	this.initElement();
};
VectorContext.prototype = {
	/* additional functions (for initialize) */
	initElement : function(){
		var child = null;
		if(this.type!==SL){ child = _doc.getElementById(this.canvasid)}
		else if(!!this.content){ child = this.content.findName(this.canvasid);}

		if(!child){
			this.canvas = _doc.getElementById(this.idname);
			if     (this.type===SVG){ this.appendSVG();}
			else if(this.type===SL) { this.appendSL ();}
			else if(this.type===VML){ this.appendVML();}

			if(this.type!==SL){ this.afterInit();}
		}
		else{
			this.target = child;
		}
	},
	afterInit : function(){
		var parent = this.canvas;
		var child  = this.child;
		var rect   = getRectSize(parent);

		var self = this;
		//parent.className = "canvas";
		parent.style.display  = 'block';
		parent.style.position = 'relative';
		parent.style.overflow = 'hidden';
		if(flags.debugmode){
			parent.style.backgroundColor = "#efefef";
			parent.style.border = "solid 1px silver";
		}
		parent.getContext = function(type){ return self;};
		parent.toDataURL = function(type){ return null; /* 未サポート */ };

		this.target = this.child;
		this.rect(0,0,rect.width,rect.height);
		this.addVectorElement(false,false);

		_initializing--;
	},

	appendSVG : function(){
		var rect = getRectSize(this.canvas);

		var top = _doc.createElementNS(SVGNS,'svg');
		top.setAttribute('id', this.canvasid);
		top.setAttribute('font-size', "10px");
		top.setAttribute('font-family', "sans-serif");
		top.setAttribute('width', rect.width);
		top.setAttribute('height', rect.height);
		top.setAttribute('viewBox', [0,0,rect.width,rect.height].join(' '));

		this.canvas.appendChild(top);
		this.child = top;
	},
	appendVML : function(){
		var rect = getRectSize(this.canvas);

		var top = _doc.createElement('div');
		top.id = this.canvasid;

		top.style.position = 'absolute';
		top.style.left   = '-2px';
		top.style.top    = '-2px';
		top.style.width  = rect.width + 'px';
		top.style.height = rect.height + 'px';

		this.canvas.appendChild(top);
		this.child = top;
	},
	appendSL : function(){
		var self = this, funcname = "_function_" + this.canvasid + "_onload";
		_win[funcname] = function(sender, context, source){
			self.content = document.getElementById([self.canvasid,'object'].join('_')).content;
			self.child = self.content.findName(self.canvasid);
			self.afterInit.call(self);
		};

		this.canvas.innerHTML = [
			'<object type="application/x-silverlight" width="100%" height="100%" id="',this.canvasid,'_object" />',
			'<param name="windowless" value="true" />',
			'<param name="background" value="#00000000" />',	// アルファ値0 = 透明
			'<param name="source" value="#',this.canvasid,'_script" />',
			'<param name="onLoad" value="',funcname,'" />',	// 前は100%,100%設定が必要だったみたい
			'</object>',
			'<script type="text/xaml" id="',this.canvasid,'_script">',
			'<Canvas xmlns="http://schemas.microsoft.com/client/2007" Name="',this.canvasid,'" />',
			'</script>'
		].join('');
	},
	setLayer : function(layerid){
		this.initElement();
		if(!!layerid){
			var lid = [this.canvasid,"layer",layerid].join('_');
			var layer = (this.type!==SL ? _doc.getElementById(lid) : this.content.findName(lid));
			if(!layer){
				if(this.type===SVG){
					layer = _doc.createElementNS(SVGNS,'g');
					layer.setAttribute('id', lid);
					this.target.appendChild(layer);
				}
				else if(this.type===SL){
					layer = this.content.createFromXaml(['<Canvas Name="',lid,'"/>'].join(''));
					this.target.children.add(layer);
				}
				else{
					layer = _doc.createElement('div');
					layer.id = lid;
					layer.unselectable = (!!V_EL_UNSELECTABLE ? 'on' : '');
					layer.style.position = 'absolute';
					layer.style.left   = '0px';
					layer.style.top    = '0px';
					this.target.appendChild(layer);
				}
			}
			this.target = layer;
		}

		this.currentLayerId = (!!layerid ? layerid : '_empty');
		if(this.type!==SVG){
			if(this.isedgearray[this.currentLayerId] === void 0){
				this.isedgearray[this.currentLayerId] = false;
			}
			this.isedge = this.isedgearray[this.currentLayerId];
		}
	},
	setRendering : function(render){
		if(this.type===SVG){
			this.target.setAttribute(S_ATT_RENDERING, render);
		}
		else{
			this.isedgearray[this.currentLayerId] = (render==='crispEdges');
			this.isedge = this.isedgearray[this.currentLayerId];
		}
	},
	setUnselectable : function(unsel){
		if(unsel===(void 0)){ unsel = true;}else{ unsel = !!unsel;}
		if(this.type===VML){
			V_EL_UNSELECTABLE = (unsel ? ' unselectable="on"' : '');
			this.canvas.unselectable = (unsel ? 'on' : '');
			this.child.unselectable  = (unsel ? 'on' : '');
		}
		else if(this.type===SL){
			this.canvas.unselectable = (unsel ? 'on' : '');
		}
		else if(this.type===SVG){
			this.canvas.style.MozUserSelect    = (unsel ? 'none' : 'text');
			this.canvas.style.WebkitUserSelect = (unsel ? 'none' : 'text');
			this.canvas.style.userSelect       = (unsel ? 'none' : 'text');
		}
	},
	getContextElement : function(){ return this.child;},
	getLayerElement   : function(){ return this.target;},

	changeSize : function(width,height){
		this.canvas.style.width  = width + 'px';
		this.canvas.style.height = height + 'px';

		var child = this.canvas.firstChild;
		if(this.type===SVG){
			child.setAttribute('width', width);
			child.setAttribute('height', height);
			var m = child.getAttribute('viewBox').split(/ /);
			child.setAttribute('viewBox', [m[0],m[1],width,height].join(' '));
		}
		else if(this.type==SL){
			// 描画されないことがあるため、サイズを2度設定するおまじない
			child.height = (height+1)+'px';

			child.width  = width + 'px';
			child.height = height + 'px';
		}
		else if(this.type==VML){
			child.style.width  = width + 'px';
			child.style.height = height + 'px';
		}
	},
	clear : function(){
		if(this.type===SVG || this.type===VML){
			var top = this.canvas.firstChild, el = top.firstChild;
			while(!!el){ top.removeChild(el); el=top.firstChild;}
		}
		else if(this.type===SL) { this.content.findName(this.canvasid).children.clear();}

		this.vid = '';
		this.elements = [];
		this.lastElement = null;
		this.initElement();
	},

	/* Canvas API functions (for path) */
	beginPath : function(){
		this.cpath = [];
		this.lastpath = '';
	},
	closePath : function(){
		this.cpath.push(this.PATH_CLOSE);
		this.lastpath = this.PATH_CLOSE;
	},
	moveTo : function(x,y){
		if(this.type===VML){ x=(x*Z-Z2)|0; y=(y*Z-Z2)|0;}
		else if(this.type===SL) {
			x = (this.isedge ? (x+this.x0+0.5)|0 : x+this.x0);
			y = (this.isedge ? (y+this.y0+0.5)|0 : y+this.y0);
		}
		this.cpath.push(this.PATH_MOVE,x,y);
		this.lastpath = this.PATH_MOVE;
	},
	lineTo : function(x,y){
		if(this.lastpath!==this.PATH_LINE){ this.cpath.push(this.PATH_LINE);}
		if(this.type===VML){ x=(x*Z-Z2)|0; y=(y*Z-Z2)|0;}
		else if(this.type===SL) {
			x = (this.isedge ? (x+this.x0+0.5)|0 : x+this.x0);
			y = (this.isedge ? (y+this.y0+0.5)|0 : y+this.y0);
		}
		this.cpath.push(x,y);
		this.lastpath = this.PATH_LINE;
	},
	rect : function(x,y,w,h){
		if(this.type===VML){ x=(x*Z-Z2)|0; y=(y*Z-Z2)|0, w=(w*Z)|0, h=(h*Z)|0;}
		else if(this.type===SL) {
			x = (this.isedge ? (x+this.x0+0.5)|0 : x+this.x0);
			y = (this.isedge ? (y+this.y0+0.5)|0 : y+this.y0);
			w = (this.isedge ? (w+0.5)|0 : w);
			h = (this.isedge ? (h+0.5)|0 : h);
		}
		this.cpath.push(this.PATH_MOVE,x,y,this.PATH_LINE,(x+w),y,(x+w),(y+h),x,(y+h),this.PATH_CLOSE);
	},
	arc : function(cx,cy,r,startRad,endRad,antiClockWise){
		if(this.type===SL) {
			cx = (this.isedge ? (cx+this.x0+0.5)|0 : cx+this.x0);
			cy = (this.isedge ? (cy+this.y0+0.5)|0 : cy+this.y0);
		}
		var sx,sy,ex,ey;
		if(endRad-startRad>=_2PI){ sx=cx+r, sy=cy, ex=cx+r, ey=cy;}
		else{
			sx = cx + r*_mc(startRad), sy = cy + r*_ms(startRad),
			ex = cx + r*_mc(endRad),   ey = cy + r*_ms(endRad);
		}
		if(this.type===VML){
			cx=(cx*Z-Z2)|0, cy=(cy*Z-Z2)|0, r=(r*Z)|0;
			sx=(sx*Z-Z2)|0, sy=(sy*Z-Z2)|0, ex=(ex*Z-Z2)|0, ey=(ey*Z-Z2)|0;
			var com = (antiClockWise ? 'at' : 'wa');
			if(endRad-startRad>=_2PI){ sx+=1;}
			this.cpath.push(com,(cx-r),(cy-r),(cx+r),(cy+r),sx,sy,ex,ey);
			this.lastpath = com;
		}
		else{
			if(endRad-startRad>=_2PI){ sy+=0.125;}
			var unknownflag = (startRad>endRad)^(Math.abs(endRad-startRad)>Math.PI);
			var islong = ((antiClockWise^unknownflag)?1:0), sweep = ((islong==0^unknownflag)?1:0);
			this.cpath.push(this.PATH_MOVE,sx,sy,S_PATH_ARCTO,r,r,0,islong,sweep,ex,ey);
			this.lastpath = S_PATH_ARCTO;
		}
	},

	/* Canvas API functions (for drawing) */
	fill       : function(){ this.addVectorElement(true,false);},
	stroke     : function(){ this.addVectorElement(false,true);},
	fillRect   : function(x,y,w,h){
		var stack = this.cpath;
		this.cpath = [];
		this.rect(x,y,w,h);
		this.addVectorElement(true,false);
		this.cpath = stack;
	},
	strokeRect : function(x,y,w,h){
		var stack = this.cpath;
		this.cpath = [];
		this.rect(x,y,w,h);
		this.addVectorElement(false,true);
		this.cpath = stack;
	},
	shapeRect  : function(x,y,w,h){
		var stack = this.cpath;
		this.cpath = [];
		this.rect(x,y,w,h);
		this.addVectorElement(true,true);
		this.cpath = stack;
	},

	fillText : function(text,x,y){
		if     (this.type===SVG){ this.fillText = this.fillText_SVG;}
		else if(this.type===SL) { this.fillText = this.fillText_SL;}
		else if(this.type===VML){ this.fillText = this.fillText_VML;}
		this.fillText(text,x,y);
	},
	fillText_SVG : function(text,x,y){
		var already = (!!this.vid && !!this.elements[this.vid]);

		ME.style.font = this.font; ME.innerHTML = text;
		var top = y - (ME.offsetHeight * S_HEIGHT[this.textBaseline.toLowerCase()]);

		var el = (already ? this.elements[this.vid] : _doc.createElementNS(SVGNS,'text'));
		el.setAttribute('x', x);
		el.setAttribute('y', top);
		el.setAttribute(S_ATT_FILL, parsecolor(this.fillStyle));
		el.setAttribute('text-anchor', S_ANCHOR[this.textAlign.toLowerCase()]);
		el.style.font = this.font;
		if(!already){
			el.appendChild(_doc.createTextNode(text));
			this.target.appendChild(el);
			this.lastElement = el;
		}
		else{
			el.replaceChild(_doc.createTextNode(text), el.firstChild);
		}

		if(!already && !!this.vid){ this.elements[this.vid] = this.lastElement; this.vid='';}
	},
	fillText_SL : function(text,x,y){
		var already = (!!this.vid && !!this.elements[this.vid]);

		ME.style.font = this.font;
		var xaml;
		if(!already){
			var wid = parseInt(this.canvas.offsetWidth);
			var left = x + this.x0 - wid * SL_WIDTH[this.textAlign.toLowerCase()];
			var ar = [
				'<TextBlock Canvas.Left="', left, '" Canvas.Top="',(y+this.y0),
				'" Width="', wid, '" TextAlignment="', this.textAlign,
				'" Foreground="black" />'
			];
			xaml = this.content.createFromXaml(ar.join(''));
		}
		else{ xaml = this.elements[this.vid];}

		xaml["Foreground"] = parsecolor(this.fillStyle);
		xaml["FontFamily"] = ME.style.fontFamily.replace(/\"/g,'\'');
		xaml["FontSize"]   = parseInt(ME.style.fontSize);
		xaml["Text"] = text;
		var offset = xaml.ActualHeight * SL_HEIGHT[this.textBaseline.toLowerCase()];
		xaml["Canvas.Top"] = y+this.y0 - (!isNaN(offset)?offset:0);

		if(!already){
			this.target.children.add(xaml);
			this.lastElement = xaml;
		}

		if(!already && !!this.vid){ this.elements[this.vid] = this.lastElement; this.vid='';}
	},
	fillText_VML : function(text,x,y){
		var already = (!!this.vid && !!this.elements[this.vid]);

		x=(x*Z-Z2)|0, y=(y*Z-Z2)|0;
		ME.style.font = this.font; ME.innerHTML = text;
		var top  = y - ((ME.offsetHeight * V_HEIGHT[this.textBaseline.toLowerCase()])*Z-Z2)|0;

		var wid = (ME.offsetWidth*Z-Z2)|0;
		var left = x - (wid * SL_WIDTH[this.textAlign.toLowerCase()])|0;

		if(!already){
			var ar = [
				V_TAG_GROUP, V_ATT_COORDSIZE, V_TAGEND,
					V_TAG_POLYLINE, V_ATT_POINTS, [left,top,left+wid,top].join(','), V_ATT_END,
					V_DEF_ATT_POLYLINE, V_ATT_FILLCOLOR, parsecolor(this.fillStyle), V_ATT_END, V_TAGEND,
						V_TAG_PATH_FOR_TEXTPATH,
						
						V_TAG_TEXTPATH, V_DEF_ATT_TEXTPATH, V_ATT_STRING, text, V_ATT_END,
						V_ATT_STYLE, V_STYLE_FONT, this.font, V_STYLE_END,
						V_STYLE_ALIGN, this.textAlign, V_STYLE_END, V_ATT_END, V_TAGEND_NULL,
					V_CLOSETAG_POLYLINE,
				V_CLOSETAG_GROUP
			];

			this.target.insertAdjacentHTML(BEFOREEND, ar.join(''));
			this.lastElement = this.target.lastChild.lastChild;
		}
		else{
			var el = this.elements[this.vid];
//			el.points = [left,top,left+wid,top].join(',');
			el.fillcolor = parsecolor(this.fillStyle);
			el.lastChild.style.font = this.font;
			el.lastChild.string = text;
		}

		if(!already && !!this.vid){ this.elements[this.vid] = this.lastElement; this.vid='';}
	},

	drawImage : function(image,sx,sy,sw,sh,dx,dy,dw,dh){
		if     (this.type===SVG){ this.drawImage = this.drawImage_SVG;}
		else if(this.type===SL) { this.drawImage = this.drawImage_SL;}
		else if(this.type===VML){ this.drawImage = this.drawImage_VML;}
		this.drawImage(image,sx,sy,sw,sh,dx,dy,dw,dh);
	},
	drawImage_SVG : function(image,sx,sy,sw,sh,dx,dy,dw,dh){
		if(sw===(void 0)){ sw=image.width; sh=image.height;}
		if(dx===(void 0)){ dx=sx; sx=0; dy=sy; sy=0; dw=sw; dh=sh;}
		var already = (!!this.vid && !!this.elements[this.vid]);

		var el = (already ? this.elements[this.vid] : _doc.createElementNS(SVGNS, "svg"));
		el.setAttribute("viewBox", [sx,sy,sw,sh].join(" "));
		el.setAttribute("x", dx);
		el.setAttribute("y", dy);
		el.setAttribute("width",  dw);
		el.setAttribute("height", dh);

		var img = (already ? el.firstChild : _doc.createElementNS(SVGNS, "image"));
		img.setAttributeNS(null, "width",  image.width);
		img.setAttributeNS(null, "height", image.height);
		img.setAttributeNS(XLINKNS, "xlink:href", image.src);
		if(!already){
			el.appendChild(img);
			this.target.appendChild(el);
			this.lastElement = el;
		}

		if(!already && !!this.vid){ this.elements[this.vid] = this.lastElement; this.vid='';}
	},
	drawImage_SL : function(image,sx,sy,sw,sh,dx,dy,dw,dh){
		if(sw===(void 0)){ sw=image.width; sh=image.height;}
		if(dx===(void 0)){ dx=sx; sx=0; dy=sy; sy=0; dw=sw; dh=sh;}
		var already = (!!this.vid && !!this.elements[this.vid]);

		var xaml;
		if(!already){
			var ar = ['<Image Source="', image.src, '" />'];
			xaml = this.content.createFromXaml(ar.join(''));
		}
		else{
			xaml = this.elements[this.vid];
			xaml["Source"] = image.src;
		}

		xaml["Canvas.Left"] = dx-sx*(dw/sw)+this.x0;
		xaml["Canvas.Top"]  = dy-sy*(dh/sh)+this.y0;
		xaml["Width"]  = image.width*(dw/sw);
		xaml["Height"] = image.height*(dh/sh);
		xaml.Clip = this.content.createFromXaml(
			['<RectangleGeometry Rect="',sx*(dw/sw),',',sy*(dh/sh),',',dw,',',dh,'" />'].join(''));

		if(!already){
			this.target.children.add(xaml);
			this.lastElement = xaml;
		}

		if(!already && !!this.vid){ this.elements[this.vid] = this.lastElement; this.vid='';}
	},
	drawImage_VML : function(image,sx,sy,sw,sh,dx,dy,dw,dh){
		if(sw===(void 0)){ sw=image.width; sh=image.height;}
		if(dx===(void 0)){ dx=sx; sx=0; dy=sy; sy=0; dw=sw; dh=sh;}
		var already = (!!this.vid && !!this.elements[this.vid]);

		var el;
		if(!already){
			var ar = [V_TAG_IMAGE, ' src="', image.src, V_ATT_END, V_ATT_COORDSIZE, V_TAGEND_NULL];
			this.target.insertAdjacentHTML(BEFOREEND, ar.join(''));
			this.lastElement = this.target.lastChild;
			el = this.lastElement;
		}
		else{
			el = this.elements[this.vid];
			el.src = image.src;
		}
		el.style.left = dx;
		el.style.top  = dy;
		el.style.width  = dw;
		el.style.height = dh;
		el.cropleft = sx/image.width;
		el.croptop  = sy/image.height;
		el.cropright  = (1-(sx+sw)/image.width);
		el.cropbottom = (1-(sy+sh)/image.height);

		if(!already && !!this.vid){ this.elements[this.vid] = this.lastElement; this.vid='';}
	},

	/* Canvas API functions (for transform) */
	translate : function(left,top){
		var child = this.canvas.firstChild;
		if(this.type===SVG){
			var m = child.getAttribute('viewBox').split(/ /);
			m[0]=-left, m[1]=-top;
			child.setAttribute('viewBox', m.join(' '));
		}
		else if(this.type===VML){
			child.style.position = 'absolute';
			child.style.left = left+'px';
			child.style.top  = top +'px';
		}
		else if(this.type===SL){
			this.x0 = left;//(left<0?-left:0);
			this.y0 = top;//(top<0?-top:0);
		}
	},

	/* extended functions */
	shape : function(){ this.addVectorElement(true,true);},

	setLinePath : function(){
		var _args = arguments, _len = _args.length, svg=(this.type!==VML);
		this.cpath = [];
		for(var i=0,len=_len-((_len|1)?1:2);i<len;i+=2){
			if     (i==0){ this.cpath.push(this.PATH_MOVE);}
			else if(i==2){ this.cpath.push(this.PATH_LINE);}

			var a1=_args[i], a2=_args[i+1];
			if(this.type===VML){ a1=(a1*Z-Z2)|0, a2=(a2*Z-Z2)|0;}
			else if(this.type===SL) {
				a1 = (this.isedge ? (a1+this.x0+0.5)|0 : a1+this.x0);
				a2 = (this.isedge ? (a2+this.y0+0.5)|0 : a2+this.y0);
			}
			this.cpath.push(a1,a2);
		}
		if(_args[_len-1]){ this.cpath.push(this.PATH_CLOSE);}
	},
	setOffsetLinePath : function(){
		var _args = arguments, _len = _args.length, svg=(this.type!==VML), m=[_args[0],_args[1]];
		this.cpath = [];
		for(var i=2,len=_len-((_len|1)?1:2);i<len;i+=2){
			m[i] = _args[i] + m[0];
			m[i+1] = _args[i+1] + m[1];

			if(this.type===VML){ m[i]=(m[i]*Z-Z2)|0, m[i+1]=(m[i+1]*Z-Z2)|0;}
			else if(this.type===SL) {
				m[i]   = (this.isedge ? (m[i]  +this.x0+0.5)|0 : m[i]  +this.x0);
				m[i+1] = (this.isedge ? (m[i+1]+this.y0+0.5)|0 : m[i+1]+this.y0);
			}
		}
		for(var i=2,len=_len-((_len|1)?1:2);i<len;i+=2){
			if     (i==2){ this.cpath.push(this.PATH_MOVE);}
			else if(i==4){ this.cpath.push(this.PATH_LINE);}
			this.cpath.push(m[i], m[i+1]);
		}
		if(_args[_len-1]){ this.cpath.push(this.PATH_CLOSE);}
	},
	setDashSize : function(size){
		if(!this.lastElement){ return;}
		if(this.type===SVG){
			this.lastElement.setAttribute('stroke-dasharray', size);
		}
		else if(this.type===SL){
			this.lastElement.StrokeDashArray = ''+size;
		}
		else if(this.type===VML){
			var el = _doc.createElement('v:stroke');
			if     (size<=2){ el.dashstyle = 'ShortDash';}
			else if(size<=5){ el.dashstyle = 'Dash';}
			else            { el.dashstyle = 'LongDash';}
			this.lastElement.appendChild(el);
		}
	},

	strokeLine : function(x1,y1,x2,y2){
		if     (this.type===VML){ x1=(x1*Z)|0, y1=(y1*Z)|0, x2=(x2*Z)|0, y2=(y2*Z)|0;}
		else if(this.type===SL) {
			x1 = (this.isedge ? (x1+this.x0+0.5)|0 : x1+this.x0);
			y1 = (this.isedge ? (y1+this.y0+0.5)|0 : y1+this.y0);
			x2 = (this.isedge ? (x2+this.x0+0.5)|0 : x2+this.x0);
			y2 = (this.isedge ? (y2+this.y0+0.5)|0 : y2+this.y0);
		}
		var stack = this.cpath;
		this.cpath = [this.PATH_MOVE,x1,y1,this.PATH_LINE,x2,y2];
		this.addVectorElement(false,true);
		this.cpath = stack;
	},
	strokeCross : function(cx,cy,l){
		if     (this.type===VML){ cx=(cx*Z-Z2)|0, cy=(cy*Z-Z2)|0, l=(l*Z)|0;}
		else if(this.type===SL) {
			cx = (this.isedge ? (cx+this.x0+0.5)|0 : cx+this.x0);
			cy = (this.isedge ? (cy+this.y0+0.5)|0 : cy+this.y0);
			l  = (this.isedge ? (l+0.5)|0 : l);
		}
		var stack = this.cpath;
		this.cpath = [this.PATH_MOVE,(cx-l),(cy-l),this.PATH_LINE,(cx+l),(cy+l),
							this.PATH_MOVE,(cx-l),(cy+l),this.PATH_LINE,(cx+l),(cy-l)];
		this.addVectorElement(false,true);
		this.cpath = stack;
	},
	fillCircle : function(cx,cy,r){
		var stack = this.cpath;
		this.cpath = [];
		this.arc(cx,cy,r,0,_2PI,false);
		this.cpath.push(this.PATH_CLOSE);
		this.addVectorElement(true,false);
		this.cpath = stack;
	},
	strokeCircle : function(cx,cy,r){
		var stack = this.cpath;
		this.cpath = [];
		this.arc(cx,cy,r,0,_2PI,false);
		this.cpath.push(this.PATH_CLOSE);
		this.addVectorElement(false,true);
		this.cpath = stack;
	},
	shapeCircle : function(cx,cy,r){
		var stack = this.cpath;
		this.cpath = [];
		this.arc(cx,cy,r,0,_2PI,false);
		this.cpath.push(this.PATH_CLOSE);
		this.addVectorElement(true,true);
		this.cpath = stack;
	},

	addVectorElement : function(isfill,isstroke){
		if     (this.type===SVG){ this.addVectorElement = this.addVectorElement_SVG;}
		else if(this.type===SL) { this.addVectorElement = this.addVectorElement_SL;}
		else if(this.type===VML){ this.addVectorElement = this.addVectorElement_VML;}
		this.addVectorElement(isfill,isstroke);
	},
	addVectorElement_SVG : function(isfill,isstroke){
		var path = this.cpath.join(' ');

		var el = _doc.createElementNS(SVGNS,'path');
		el.setAttribute('d', path);
		el.setAttribute(S_ATT_FILL,   (isfill ? parsecolor(this.fillStyle) : S_NONE));
		el.setAttribute(S_ATT_STROKE, (isstroke ? parsecolor(this.strokeStyle) : S_NONE));
		if(isstroke) { el.setAttribute(S_ATT_STROKEWIDTH, this.lineWidth, 'px');}

		this.target.appendChild(el);
		this.lastElement = el;

		if(!!this.vid){ this.elements[this.vid] = this.lastElement; this.vid='';}
	},
	addVectorElement_SL : function(isfill,isstroke){
		var path = this.cpath.join(' ');

		var ar = ['<Path Data="', path ,'"'];
		if(isfill)  { ar.push(' Fill="', parsecolor(this.fillStyle), '"');}
		if(isstroke){ ar.push(' Stroke="', parsecolor(this.strokeStyle), '" StrokeThickness="', this.lineWidth, '"');}
		ar.push(' />');

		var xaml = this.content.createFromXaml(ar.join(''));
		this.lastElement = xaml;
		this.target.children.add(xaml);

		if(!!this.vid){ this.elements[this.vid] = this.lastElement; this.vid='';}
	},
	addVectorElement_VML : function(isfill,isstroke){
		var path = this.cpath.join(' ');

		path = [path, (!isfill ? V_PATH_NOFILL : EMPTY), (!isstroke ? V_PATH_NOSTROKE : EMPTY)].join('');
		var ar = [V_TAG_SHAPE, V_EL_UNSELECTABLE, V_ATT_COORDSIZE, V_ATT_PATH, path, V_ATT_END];
		if(isfill)  { ar.push(V_ATT_FILLCOLOR, parsecolor(this.fillStyle), V_ATT_END);}
		if(isstroke){ ar.push(V_ATT_STROKECOLOR, parsecolor(this.strokeStyle), V_ATT_END, V_ATT_STROKEWEIGHT, this.lineWidth, 'px', V_ATT_END);}
		ar.push(V_TAGEND_NULL);

		this.target.insertAdjacentHTML(BEFOREEND, ar.join(''));
		this.lastElement = this.target.lastChild;

		if(!!this.vid){ this.elements[this.vid] = this.lastElement; this.vid='';}
	}
};

/* -------------------- */
/*   Canvas追加関数群   */
/* -------------------- */
var CanvasRenderingContext2D_wrapper = function(type, idname){
	// canvasに存在するプロパティ＆デフォルト値
	this.fillStyle    = 'black';
	this.strokeStyle  = 'black';
	this.lineWidth    = 1;
	this.font         = '14px system';
	this.textAlign    = 'center';
	this.textBaseline = 'middle';
	this.canvas = null;		// 親エレメントとなるdivエレメント

	// variables for internal
	this.idname   = idname;
	this.canvasid = EL_ID_HEADER+idname;
	this.child    = null;		// this.canvasの直下にあるエレメント
	this.context  = null;	// 本来のCanvasRenderingContext2Dオブジェクト

	this.currentLayerId = '_empty';
	this.isedgearray    = {_empty:false};
	this.isedge         = false;

	this.use = new TypeList();
	this.use.vml    = (type===VML);
	this.use.svg    = false;
	this.use.canvas = (type===CANVAS);
	this.use.sl     = (type===SL);
	this.use.flash  = (type===FLASH);

	this.initElement();
};

//function addCanvasFunctions(){ _extend(CanvasRenderingContext2D.prototype, {
CanvasRenderingContext2D_wrapper.prototype = {
	/* extend functions (initialize) */
	initElement : function(){
		var parent = _doc.getElementById(this.idname);
		var canvas = _doc.getElementById(this.canvasid);

		if(!canvas){
			canvas = _doc.createElement('canvas');
			canvas.id = this.canvasid;
			parent.appendChild(canvas);
		}

		var rect = getRectSize(parent);
		canvas.width  = rect.width;
		canvas.height = rect.height;
		canvas.style.position = 'relative';
		canvas.style.width  = rect.width + 'px';
		canvas.style.height = rect.height + 'px';

		this.child = canvas;

		var self = this;
		//parent.className = "canvas";
		parent.style.display  = 'block';
		parent.style.position = 'relative';
		parent.style.overflow = 'hidden';
		if(flags.debugmode){
			parent.style.backgroundColor = "#efefef";
			parent.style.border = "solid 1px silver";
		}
		//parent.getContext = function(type){ return canvas.getContext(type);}
		parent.getContext = function(type){
			self.context = canvas.getContext(type);
			return self;
		};
		parent.toDataURL = function(type){ 
			return (!!type ? canvas.toDataURL(type) : canvas.toDataURL());
		};

		this.canvas = parent;
		_initializing--;
	},
	setLayer : function(layerid){
		this.currentLayerId = (!!layerid ? layerid : '_empty');
		if(this.isedgearray[this.currentLayerId] === void 0){
			this.isedgearray[this.currentLayerId] = false;
		}
		this.isedge = this.isedgearray[this.currentLayerId];
	},
	setRendering : function(render){
		this.isedgearray[this.currentLayerId] = (render==='crispEdges');
		this.isedge = this.isedgearray[this.currentLayerId];
	},
	setUnselectable : function(unsel){
		if(unsel===(void 0)){ unsel = true;}else{ unsel = !!unsel;}
		this.canvas.style.MozUserSelect    = (unsel ? 'none' : 'text');
		this.canvas.style.WebkitUserSelect = (unsel ? 'none' : 'text');
		this.canvas.style.userSelect       = (unsel ? 'none' : 'text');
	},
	getContextElement : function(){ return this.child;},
	getLayerElement   : function(){ return this.child;},

	changeSize : function(width,height){
		this.canvas.style.width  = width + 'px';
		this.canvas.style.height = height + 'px';

		var canvas = this.canvas.firstChild;
		var left = parseInt(canvas.style.left), top = parseInt(canvas.style.top);
		width += (left<0?-left:0); height += (top<0?-top:0);
		canvas.style.width  = width + 'px';
		canvas.style.height = height + 'px';
		canvas.width  = width;
		canvas.height = height;
	},
	clear : function(){
		if(!!this.canvas.style.backgroundColor){
			this.setProperties();
			this.context.setTransform(1,0,0,1,0,0); // 変形をリセット
			this.context.fillStyle = parsecolorrev(this.canvas.style.backgroundColor);
			var rect = getRectSize(this.canvas);
			this.context.fillRect(0,0,rect.width,rect.height);
		}
	},

	/* 内部用関数 */
	setProperties : function(){
		this.context.fillStyle    = this.fillStyle;
		this.context.strokeStyle  = this.strokeStyle;
		this.context.lineWidth    = this.lineWidth;
		this.context.font         = this.font;
		this.context.textAlign    = this.textAlign;
		this.context.textBaseline = this.textBaseline;
	},

	/* Canvas API functions (for path) */
	beginPath : function(){ this.context.beginPath();},
	closePath : function(){ this.context.closePath();},
	moveTo : function(x,y){
		x = (this.isedge ? (x+0.5)|0 : x);
		y = (this.isedge ? (y+0.5)|0 : y);
		this.context.moveTo(x,y);
	},
	lineTo : function(x,y){
		x = (this.isedge ? (x+0.5)|0 : x);
		y = (this.isedge ? (y+0.5)|0 : y);
		this.context.lineTo(x,y);
	},
	rect : function(x,y,w,h){
		x = (this.isedge ? (x+0.5)|0 : x);
		y = (this.isedge ? (y+0.5)|0 : y);
		this.context.rect(x,y,w,h);
	},
	arc  : function(cx,cy,r,startRad,endRad,antiClockWise){
		cx = (this.isedge ? (cx+0.5)|0 : cx);
		cy = (this.isedge ? (cy+0.5)|0 : cy);
		this.context.arc(px,py,r,startRad,endRad,antiClockWise);
	},

	/* Canvas API functions (for drawing) */
	fill       : function(){ this.setProperties(); this.context.fill();},
	stroke     : function(){ this.setProperties(); this.context.stroke();},
	fillRect   : function(x,y,w,h){
		x = (this.isedge ? (x+0.5)|0 : x);
		y = (this.isedge ? (y+0.5)|0 : y);
		this.setProperties();
		this.context.fillRect(x,y,w,h);
	},
	strokeRect : function(x,y,w,h){
		x = (this.isedge ? (x+0.5)|0 : x);
		y = (this.isedge ? (y+0.5)|0 : y);
		this.setProperties();
		this.context.strokeRect(x,y,w,h);
	},
	fillText : function(text,x,y){
		this.setProperties();
		this.context.fillText(text,x,y);
	},
	drawImage : function(image,sx,sy,sw,sh,dx,dy,dw,dh){
		this.context.drawImage(image,sx,sy,sw,sh,dx,dy,dw,dh);
	},

	/* Canvas API functions (for transform) */
	translate : function(left,top){
		this.context.translate(left, top);
	},

	/* extended functions */
	shape : function(){
		this.setProperties();
		this.context.fill();
		this.context.stroke();
	},
	shapeRect : function(x,y,w,h){
		x = (this.isedge ? (x+0.5)|0 : x);
		y = (this.isedge ? (y+0.5)|0 : y);
		w = (this.isedge ? (w+0.5)|0 : w);
		h = (this.isedge ? (h+0.5)|0 : h);

		this.setProperties();
		this.context.fillRect(x,y,w,h);
		this.context.strokeRect(x,y,w,h);
	},

	setLinePath : function(){
		var _args = arguments, _len = _args.length;
		this.context.beginPath();
		for(var i=0,len=_len-((_len|1)?1:2);i<len;i+=2){
			var a1 = (this.isedge ? (_args[i]  +0.5)|0 : _args[i]  );
				a2 = (this.isedge ? (_args[i+1]+0.5)|0 : _args[i+1]);
			if(i==0){ this.context.moveTo(a1,a2);}
			else    { this.context.lineTo(a1,a2);}
		}
		if(_args[_len-1]){ this.context.closePath();}
	},
	setOffsetLinePath : function(){
		var _args = arguments, _len = _args.length, m=[_args[0],_args[1]];
		this.context.beginPath();
		for(var i=2,len=_len-((_len|1)?1:2);i<len;i+=2){
			m[i]   = _args[i]   + m[0];
			m[i+1] = _args[i+1] + m[1];
		}
		for(var i=2,len=_len-((_len|1)?1:2);i<len;i+=2){
			var a1 = (this.isedge ? (m[i]  +0.5)|0 : m[i]);
				a2 = (this.isedge ? (m[i+1]+0.5)|0 : m[i+1]);
			if(i===2){ this.context.moveTo(a1,a2);}
			else     { this.context.lineTo(a1,a2);}
		}
		if(_args[_len-1]){ this.context.closePath();}
	},
	setDashSize : function(size){ },

	strokeLine : function(x1,y1,x2,y2){
		x1 = (this.isedge ? (x1+0.5)|0 : x1);
		y1 = (this.isedge ? (y1+0.5)|0 : y1);
		x2 = (this.isedge ? (x2+0.5)|0 : x2);
		y2 = (this.isedge ? (y2+0.5)|0 : y2);

		this.setProperties();
		this.context.beginPath();
		this.context.moveTo(x1,y1);
		this.context.lineTo(x2,y2);
		this.context.stroke();
	},
	strokeCross : function(cx,cy,l){
		var x1 = (this.isedge ? (cx-l+0.5)|0 : cx-l),
			y1 = (this.isedge ? (cy-l+0.5)|0 : cy-l),
			x2 = (this.isedge ? (cx+l+0.5)|0 : cx+l),
			y2 = (this.isedge ? (cy+l+0.5)|0 : cy+l);

		this.setProperties();
		this.context.beginPath();
		this.context.moveTo(x1,y1);
		this.context.lineTo(x2,y2);
		this.context.moveTo(x1,y2);
		this.context.lineTo(x2,y1);
		this.context.stroke();
	},
	fillCircle : function(cx,cy,r){
		cx = (this.isedge ? (cx+0.5)|0 : cx);
		cy = (this.isedge ? (cy+0.5)|0 : cy);
		this.setProperties();
		this.context.beginPath();
		this.context.arc(cx,cy,r,0,_2PI,false);
		this.context.fill();
	},
	strokeCircle : function(cx,cy,r){
		cx = (this.isedge ? (cx+0.5)|0 : cx);
		cy = (this.isedge ? (cy+0.5)|0 : cy);
		this.setProperties();
		this.context.beginPath();
		this.context.arc(cx,cy,r,0,_2PI,false);
		this.context.stroke();
	},
	shapeCircle : function(cx,cy,r){
		cx = (this.isedge ? (cx+0.5)|0 : cx);
		cy = (this.isedge ? (cy+0.5)|0 : cy);
		this.setProperties();
		this.context.beginPath();
		this.context.arc(cx,cy,r,0,_2PI,false);
		this.context.fill();
		this.context.stroke();
	}

};

/* -------------------- */
/*   Campオブジェクト   */
/* -------------------- */
var Camp = function(idname, type){
	Camp.initElementById.apply(Camp, [idname, type]);
};
_extend( Camp, {
	/* externs */
	color : _color,
	parse : parsecolor,
	ME    : null,

	/* Selected & Enable types */
	enable  : new TypeList(),
	current : new TypeList(),

	/* functions */
	initAllElements : function(){
		var elements = _doc.getElementsByTagName('camp');
		for(var i=0;i<elements.length;i++){ this.initElementById(elements[i].id, type);}
	},
	initElementsById : function(idlist, type){
		for(var i=0;i<idlist.length;i++){ this.initElementById(idlist[i], type);}
	},
	initElementById : function(idname, type){
		if(!!_doc.getElementById(EL_ID_HEADER + idname)){ return;}
		if(!ME){ initME();}

		var choice = new TypeList();
		if((type===void 0)||(this.enable[type]!==true)){ choice = this.current;}
		else{ choice[type] = true;}

		_initializing++;
		if     (choice.svg){ new VectorContext(SVG, idname);}
		else if(choice.sl) { new VectorContext(SL,  idname);}
		else if(choice.vml){ new VectorContext(VML, idname);}
		else if(choice.canvas){
			new CanvasRenderingContext2D_wrapper(CANVAS, idname);
		}
	},

	select : function(type){
		if(this.enable[type]!==true){ return false;}
		for(var i=0;i<_types.length;i++){ this.current[_types[i]]=false;}
		this.current[type] = true;
		return true;
	},
	setflags : function(type, value){
		flags[type] = value;
	},

	isready : function(){ return (_initializing===0);}
});

/* ----------------------------------------------- */
/* Camp.enable, Camp.currentオブジェクトデータ設定 */
/* ----------------------------------------------- */

//	/* Camp.enable 設定 */
	Camp.enable.canvas = (!!_doc.createElement('canvas').getContext);
	Camp.enable.svg    = (!!_doc.createElementNS && !!_doc.createElementNS(SVGNS, 'svg').suspendRedraw);
	Camp.enable.sl     = (function(){ try{ return (new ActiveXObject("AgControl.AgControl")).IsVersionSupported("1.0");}catch(e){} return false;})();
	Camp.enable.flash  = false;
	Camp.enable.vml    = _IE;

//	/* Camp.current設定 */
	for(var i=0;i<_types.length;i++){ Camp.current[_types[i]]=false;}
	if     (Camp.enable.svg)   { Camp.current.svg    = true;}
	else if(Camp.enable.canvas){ Camp.current.canvas = true;}
	else if(Camp.enable.sl)    { Camp.current.sl     = true;}
	else if(Camp.enable.flash) { Camp.current.flash  = true;}
	else if(Camp.enable.vml)   { Camp.current.vml    = true;}

	/* 初期設定 for VML */
	if(Camp.enable.vml){
		/* addNameSpace for VML */
		_doc.namespaces.add("v", "urn:schemas-microsoft-com:vml");

		/* addStyleSheet for VML */
		var text = [];
		text.push("v\\:shape, v\\:group, v\\:polyline, v\\:image { behavior: url(#default#VML); position:absolute; width:10px; height:10px; }");
		text.push("v\\:path, v\\:textpath, v\\:stroke { behavior: url(#default#VML); }");
		_doc.write('<style type="text/css" rel="stylesheet">');
		_doc.write(text.join(''));
		_doc.write('</style>');
	}

	/* 初期設定 for Campタグ */
	var text = [];
	text.push("camp { display: block; }\n");
	_doc.write('<style type="text/css" rel="stylesheet">');
	_doc.write(text.join(''));
	_doc.write('</style>');

		// IE用ハック
	if(_IE){ _doc.createElement('camp');}

	_win.Camp = Camp;

})();
