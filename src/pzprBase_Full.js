/* 
 * pzprBase.js
 * 
 * pzprBase.js is a base script for playing nikoli puzzles on Web
 * written in JavaScript.
 * 
 * @author  dk22
 * @version v3.3.1pre
 * @date    2010-07-16
 * 
 * This script is licensed under the MIT license. See below,
 * http://www.opensource.org/licenses/mit-license.php
 * 
 */

var pzprversion="v3.3.1pre";
 
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
	V_TAG_TEXTPATH = '<v:textpath',
	V_TAG_POLYLINE = '<v:polyline',
	V_TAG_PATH_FOR_TEXTPATH = '<v:path textpathok="t" />';
	V_EL_UNSELECTABLE = '', // デフォルトはunselectableでない
//	V_EL_UNSELECTABLE = ' unselectable="on"',
	V_TAGEND      = '>',
	V_TAGEND_NULL = ' />',
	V_CLOSETAG_SHAPE    = '</v:shape>',
	V_CLOSETAG_GROUP    = '</v:group>',
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

	V_HEIGHT = { top:-0.3, hanging:-0.3, middle:0, alphabetic:0.4, bottom:0.45 };

/* ------------------------------------------- */
/*   VectorContext(SVG)クラス用const文字列集   */
/* ------------------------------------------- */
var SVGNS = "http://www.w3.org/2000/svg",
	S_PATH_MOVE   = ' M',
	S_PATH_LINE   = ' L',
	S_PATH_ARCTO  = ' A',
	S_PATH_CLOSE  = ' z',

	S_ATT_ID          = 'id';
	S_ATT_FILL        = 'fill';
	S_ATT_STROKE      = 'stroke';
	S_ATT_STROKEWIDTH = 'stroke-width',
	S_ATT_RENDERING   = 'shape-rendering',

	SVG_ANCHOR = {
		left   : 'start',
		center : 'middle',
		right  : 'end'
	},

	S_NONE = 'none',

	S_HEIGHT = { top:-0.7, hanging:-0.66, middle:-0.35, alphabetic:0, bottom:0.1 },

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
	this.OFFSETX = 0;
	this.OFFSETY = 0;

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
	this.currentpath = [];
	this.lastpath    = '';

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

	this.initElement(idname);
};
VectorContext.prototype = {
	/* additional functions (for initialize) */
	initElement : function(idname){
		var child = null;
		if(this.type!==SL){ child = _doc.getElementById(this.canvasid)}
		else if(!!this.content){ child = this.content.findName(this.canvasid);}

		if(!child){
			var parent = _doc.getElementById(idname);
			var rect = getRectSize(parent);
			if     (this.type===SVG){ this.appendSVG(parent,rect.width,rect.height);}
			else if(this.type===SL) { this.appendSL (parent,rect.width,rect.height);}
			else if(this.type===VML){ this.appendVML(parent,rect.width,rect.height);}

			if(this.type!==SL){ this.afterInit();}
		}
		else{
			this.target = child;
		}
	},
	afterInit : function(){
		var parent = _doc.getElementById(this.idname);
		var rect   = getRectSize(parent);
		var child  = this.child;

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
		this.canvas = parent;

		this.target = this.child;
		this.rect(0,0,rect.width,rect.height);
		this.addVectorElement(false,false);

		_initializing--;
	},

	appendSVG : function(parent, width, height){
		var svgtop = _doc.createElementNS(SVGNS,'svg');
		svgtop.setAttribute('id', this.canvasid);
		svgtop.setAttribute('font-size', "10px");
		svgtop.setAttribute('font-family', "sans-serif");
		svgtop.setAttribute('width', width);
		svgtop.setAttribute('height', height);
		svgtop.setAttribute('viewBox', [0,0,width,height].join(' '));

		parent.appendChild(svgtop);
		this.child = svgtop;
	},
	appendVML : function(parent, width, height){
		var vmltop = _doc.createElement('div');
		vmltop.id = this.canvasid;

		vmltop.style.position = 'absolute';
		vmltop.style.left   = '-2px';
		vmltop.style.top    = '-2px';
		vmltop.style.width  = width + 'px';
		vmltop.style.height = height + 'px';

		parent.appendChild(vmltop);
		this.child = vmltop;
	},
	appendSL : function(parent, width, height){
		var self = this, funcname = "_function_" + this.canvasid + "_onload";
		_win[funcname] = function(sender, context, source){
			self.content = document.getElementById([self.canvasid,'object'].join('_')).content;
			self.child = self.content.findName(self.canvasid);
			self.afterInit.call(self);
		};

		parent.innerHTML = [
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
		this.initElement(this.idname);
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
			child.setAttribute('viewBox', [0,0,width,height].join(' '));
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
	changeOrigin : function(left,top){
		var child = this.canvas.firstChild;
		if(this.type===SVG){
			var m = child.getAttribute('viewBox').split(/ /);
			m[0]=left, m[1]=top;
			child.setAttribute('viewBox', m.join(' '));
		}
		else if(this.type===VML){
			child.style.position = 'absolute';
			child.style.left = (-left-2)+'px';
			child.style.top  = (-top -2)+'px';
		}
		else if(this.type===SL){
			this.OFFSETX = -left;//(left<0?-left:0);
			this.OFFSETY = -top;//(top<0?-top:0);
		}
	},
	clear : function(){
		if(this.type!==SL){ _doc.getElementById(this.idname).innerHTML = '';}

		this.vid = '';
		this.elements = [];
		this.lastElement = null;
		this.initElement(this.idname);

		if(this.type===SL){ this.target.children.clear();}
	},

	/* Canvas API functions (for path) */
	beginPath : function(){
		this.currentpath = [];
		this.lastpath = '';
	},
	closePath : function(){
		this.currentpath.push(this.PATH_CLOSE);
		this.lastpath = this.PATH_CLOSE;
	},
	moveTo : function(x,y){
		if(this.type===VML){ x=(x*Z-Z2)|0; y=(y*Z-Z2)|0;}
		else if(this.type===SL) {
			x = (this.isedge ? (x+this.OFFSETX+0.5)|0 : x+this.OFFSETX);
			y = (this.isedge ? (y+this.OFFSETY+0.5)|0 : y+this.OFFSETY);
		}
		this.currentpath.push(this.PATH_MOVE,x,y);
		this.lastpath = this.PATH_MOVE;
	},
	lineTo : function(x,y){
		if(this.lastpath!==this.PATH_LINE){ this.currentpath.push(this.PATH_LINE);}
		if(this.type===VML){ x=(x*Z-Z2)|0; y=(y*Z-Z2)|0;}
		else if(this.type===SL) {
			x = (this.isedge ? (x+this.OFFSETX+0.5)|0 : x+this.OFFSETX);
			y = (this.isedge ? (y+this.OFFSETY+0.5)|0 : y+this.OFFSETY);
		}
		this.currentpath.push(x,y);
		this.lastpath = this.PATH_LINE;
	},
	rect : function(x,y,w,h){
		if(this.type===VML){ x=(x*Z-Z2)|0; y=(y*Z-Z2)|0, w=(w*Z)|0, h=(h*Z)|0;}
		else if(this.type===SL) {
			x = (this.isedge ? (x+this.OFFSETX+0.5)|0 : x+this.OFFSETX);
			y = (this.isedge ? (y+this.OFFSETY+0.5)|0 : y+this.OFFSETY);
			w = (this.isedge ? (w+0.5)|0 : w);
			h = (this.isedge ? (h+0.5)|0 : h);
		}
		this.currentpath.push(this.PATH_MOVE,x,y,this.PATH_LINE,(x+w),y,(x+w),(y+h),x,(y+h),this.PATH_CLOSE);
	},
	arc : function(cx,cy,r,startRad,endRad,antiClockWise){
		if(this.type===SL) {
			cx = (this.isedge ? (cx+this.OFFSETX+0.5)|0 : cx+this.OFFSETX);
			cy = (this.isedge ? (cy+this.OFFSETY+0.5)|0 : cy+this.OFFSETY);
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
			this.currentpath.push(com,(cx-r),(cy-r),(cx+r),(cy+r),sx,sy,ex,ey);
			this.lastpath = com;
		}
		else{
			if(endRad-startRad>=_2PI){ sy+=0.125;}
			var unknownflag = (startRad>endRad)^(Math.abs(endRad-startRad)>Math.PI);
			var islong = ((antiClockWise^unknownflag)?1:0), sweep = ((islong==0^unknownflag)?1:0);
			this.currentpath.push(this.PATH_MOVE,sx,sy,S_PATH_ARCTO,r,r,0,islong,sweep,ex,ey);
			this.lastpath = S_PATH_ARCTO;
		}
	},

	/* Canvas API functions (for drawing) */
	fill       : function(){ this.addVectorElement(true,false);},
	stroke     : function(){ this.addVectorElement(false,true);},
	fillRect   : function(x,y,w,h){
		var stack = this.currentpath;
		this.currentpath = [];
		this.rect(x,y,w,h);
		this.addVectorElement(true,false);
		this.currentpath = stack;
	},
	strokeRect : function(x,y,w,h){
		var stack = this.currentpath;
		this.currentpath = [];
		this.rect(x,y,w,h);
		this.addVectorElement(false,true);
		this.currentpath = stack;
	},
	shapeRect  : function(x,y,w,h){
		var stack = this.currentpath;
		this.currentpath = [];
		this.rect(x,y,w,h);
		this.addVectorElement(true,true);
		this.currentpath = stack;
	},

	fillText : function(text,x,y){
		switch(this.type){
		case SVG:
			ME.style.font = this.font; ME.innerHTML = text;
			var top = y - (ME.offsetHeight * S_HEIGHT[this.textBaseline.toLowerCase()]);

			var el = _doc.createElementNS(SVGNS,'text');
			el.setAttribute('x', x);
			el.setAttribute('y', top);
			el.setAttribute(S_ATT_FILL, parsecolor(this.fillStyle));
			el.setAttribute('text-anchor', SVG_ANCHOR[this.textAlign.toLowerCase()]);
			el.style.font = this.font;
			el.appendChild(_doc.createTextNode(text));
			this.target.appendChild(el);
			this.lastElement = el;
			break;

		case SL:
			ME.style.font = this.font;
			var fontFamily = ME.style.fontFamily.replace(/\"/g,'\'');
			var fontSize   = parseInt(ME.style.fontSize);
			var wid = parseInt(this.canvas.offsetWidth);
			var left = x + this.OFFSETX - wid * SL_WIDTH[this.textAlign.toLowerCase()];
			var ar = [
				'<TextBlock Canvas.Left="', left, '" Canvas.Top="',(y+this.OFFSETY),
				'" Width="', wid, '" TextAlignment="', this.textAlign,
				'" FontFamily="', fontFamily, '" FontSize="', fontSize,
				'" Foreground="', parsecolor(this.fillStyle), '" Text="',text, '" />'
			];
			var xaml = this.content.createFromXaml(ar.join(''));
			this.lastElement = this.elements[this.vid] = xaml;

			var offset = xaml.ActualHeight * SL_HEIGHT[this.textBaseline.toLowerCase()];
			xaml["Canvas.Top"] = y+this.OFFSETY - (!isNaN(offset)?offset:0);
			this.target.children.add(xaml);
			break;

		case VML:
			x=(x*Z-Z2)|0, y=(y*Z-Z2)|0;
			ME.style.font = this.font; ME.innerHTML = text;
			var top  = y - ((ME.offsetHeight * V_HEIGHT[this.textBaseline.toLowerCase()])*Z-Z2)|0;

			var wid = (ME.offsetWidth*Z-Z2)|0;
			var left = x - (wid * SL_WIDTH[this.textAlign.toLowerCase()])|0;

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
			break;
		}
		if(!!this.vid){ this.elements[this.vid] = this.lastElement;}
	},

	/* extended functions */
	shape : function(){ this.addVectorElement(true,true);},

	setLinePath : function(){
		var _args = arguments, _len = _args.length, svg=(this.type!==VML);
		this.currentpath = [];
		for(var i=0,len=_len-((_len|1)?1:2);i<len;i+=2){
			if     (i==0){ this.currentpath.push(this.PATH_MOVE);}
			else if(i==2){ this.currentpath.push(this.PATH_LINE);}

			var a1=_args[i], a2=_args[i+1];
			if(this.type===VML){ a1=(a1*Z-Z2)|0, a2=(a2*Z-Z2)|0;}
			else if(this.type===SL) {
				a1 = (this.isedge ? (a1+this.OFFSETX+0.5)|0 : a1+this.OFFSETX);
				a2 = (this.isedge ? (a2+this.OFFSETY+0.5)|0 : a2+this.OFFSETY);
			}
			this.currentpath.push(a1,a2);
		}
		if(_args[_len-1]){ this.currentpath.push(this.PATH_CLOSE);}
	},
	setOffsetLinePath : function(){
		var _args = arguments, _len = _args.length, svg=(this.type!==VML), m=[_args[0],_args[1]];
		this.currentpath = [];
		for(var i=2,len=_len-((_len|1)?1:2);i<len;i+=2){
			m[i] = _args[i] + m[0];
			m[i+1] = _args[i+1] + m[1];

			if(this.type===VML){ m[i]=(m[i]*Z-Z2)|0, m[i+1]=(m[i+1]*Z-Z2)|0;}
			else if(this.type===SL) {
				m[i]   = (this.isedge ? (m[i]  +this.OFFSETX+0.5)|0 : m[i]  +this.OFFSETX);
				m[i+1] = (this.isedge ? (m[i+1]+this.OFFSETY+0.5)|0 : m[i+1]+this.OFFSETY);
			}
		}
		for(var i=2,len=_len-((_len|1)?1:2);i<len;i+=2){
			if     (i==2){ this.currentpath.push(this.PATH_MOVE);}
			else if(i==4){ this.currentpath.push(this.PATH_LINE);}
			this.currentpath.push(m[i], m[i+1]);
		}
		if(_args[_len-1]){ this.currentpath.push(this.PATH_CLOSE);}
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
			x1 = (this.isedge ? (x1+this.OFFSETX+0.5)|0 : x1+this.OFFSETX);
			y1 = (this.isedge ? (y1+this.OFFSETY+0.5)|0 : y1+this.OFFSETY);
			x2 = (this.isedge ? (x2+this.OFFSETX+0.5)|0 : x2+this.OFFSETX);
			y2 = (this.isedge ? (y2+this.OFFSETY+0.5)|0 : y2+this.OFFSETY);
		}
		var stack = this.currentpath;
		this.currentpath = [this.PATH_MOVE,x1,y1,this.PATH_LINE,x2,y2];
		this.addVectorElement(false,true);
		this.currentpath = stack;
	},
	strokeCross : function(cx,cy,l){
		if     (this.type===VML){ cx=(cx*Z-Z2)|0, cy=(cy*Z-Z2)|0, l=(l*Z)|0;}
		else if(this.type===SL) {
			cx = (this.isedge ? (cx+this.OFFSETX+0.5)|0 : cx+this.OFFSETX);
			cy = (this.isedge ? (cy+this.OFFSETY+0.5)|0 : cy+this.OFFSETY);
			l  = (this.isedge ? (l+0.5)|0 : l);
		}
		var stack = this.currentpath;
		this.currentpath = [this.PATH_MOVE,(cx-l),(cy-l),this.PATH_LINE,(cx+l),(cy+l),
							this.PATH_MOVE,(cx-l),(cy+l),this.PATH_LINE,(cx+l),(cy-l)];
		this.addVectorElement(false,true);
		this.currentpath = stack;
	},
	fillCircle : function(cx,cy,r){
		var stack = this.currentpath;
		this.currentpath = [];
		this.arc(cx,cy,r,0,_2PI,false);
		this.currentpath.push(this.PATH_CLOSE);
		this.addVectorElement(true,false);
		this.currentpath = stack;
	},
	strokeCircle : function(cx,cy,r){
		var stack = this.currentpath;
		this.currentpath = [];
		this.arc(cx,cy,r,0,_2PI,false);
		this.currentpath.push(this.PATH_CLOSE);
		this.addVectorElement(false,true);
		this.currentpath = stack;
	},
	shapeCircle : function(cx,cy,r){
		var stack = this.currentpath;
		this.currentpath = [];
		this.arc(cx,cy,r,0,_2PI,false);
		this.currentpath.push(this.PATH_CLOSE);
		this.addVectorElement(true,true);
		this.currentpath = stack;
	},

	addVectorElement : function(isfill,isstroke){
	var path = this.currentpath.join(' ');
	switch(this.type){
	case SVG:
		var el = _doc.createElementNS(SVGNS,'path');
		el.setAttribute('d', path);
		el.setAttribute(S_ATT_FILL,   (isfill ? parsecolor(this.fillStyle) : S_NONE));
		el.setAttribute(S_ATT_STROKE, (isstroke ? parsecolor(this.strokeStyle) : S_NONE));
		if(isstroke) { el.setAttribute(S_ATT_STROKEWIDTH, this.lineWidth, 'px');}

		this.target.appendChild(el);
		this.lastElement = el;
		break;

	case SL:
		var ar = ['<Path Data="', path ,'"'];
		if(isfill)  { ar.push(' Fill="', parsecolor(this.fillStyle), '"');}
		if(isstroke){ ar.push(' Stroke="', parsecolor(this.strokeStyle), '" StrokeThickness="', this.lineWidth, '"');}
		ar.push(' />');

		var xaml = this.content.createFromXaml(ar.join(''));
		this.lastElement = xaml;
		this.target.children.add(xaml);
		break;

	case VML:
		path = [path, (!isfill ? V_PATH_NOFILL : EMPTY), (!isstroke ? V_PATH_NOSTROKE : EMPTY)].join('');
		var ar = [V_TAG_SHAPE, V_EL_UNSELECTABLE, V_ATT_COORDSIZE, V_ATT_PATH, path, V_ATT_END];
		if(isfill)  { ar.push(V_ATT_FILLCOLOR, parsecolor(this.fillStyle), V_ATT_END);}
		if(isstroke){ ar.push(V_ATT_STROKECOLOR, parsecolor(this.strokeStyle), V_ATT_END, V_ATT_STROKEWEIGHT, this.lineWidth, 'px', V_ATT_END);}
		ar.push(V_TAGEND_NULL);

		this.target.insertAdjacentHTML(BEFOREEND, ar.join(''));
		this.lastElement = this.target.lastChild;
		break;
	}
	if(!!this.vid){ this.elements[this.vid] = this.lastElement;}
	}
};

/* -------------------- */
/*   Canvas追加関数群   */
/* -------------------- */
CanvasRenderingContext2D_wrapper = function(type, idname){
	// canvasに存在するプロパティ＆デフォルト値
	this.fillStyle    = 'black';
	this.strokeStyle  = 'black';
	this.lineWidth    = 1;
	this.font         = '14px system';
	this.textAlign    = 'center';
	this.textBaseline = 'middle';
	this.canvas = null;		// 親エレメントとなるdivエレメント

	// changeOrigin用
	this.OFFSETX = 0;
	this.OFFSETY = 0;

	// variables for internal
	this.canvasid = '';
	this.child  = null;		// this.canvasの直下にあるエレメント
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

	this.initElement(idname);
};

//function addCanvasFunctions(){ _extend(CanvasRenderingContext2D.prototype, {
CanvasRenderingContext2D_wrapper.prototype = {
	/* extend functions (initialize) */
	initElement : function(idname){
		this.canvasid = EL_ID_HEADER+idname;

		var parent = _doc.getElementById(idname);
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
	changeOrigin : function(left,top){
//		var canvas = this.canvas.firstChild;
//		canvas.style.position = 'relative';
//		canvas.style.left = (parseInt(canvas.style.left) - left) + 'px';
//		canvas.style.top  = (parseInt(canvas.style.top ) - top)  + 'px';

		this.OFFSETX = -left;//(left<0?-left:0);
		this.OFFSETY = -top;//(top<0?-top:0);
	},
	clear : function(){
		if(!!this.canvas.style.backgroundColor){
			this.setProperties();
			this.context.fillStyle = parsecolorrev(this.canvas.style.backgroundColor);
			var rect = getRectSize(this.canvas);
			this.context.fillRect(this.OFFSETX,this.OFFSETY,rect.width,rect.height);
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
		x = (this.isedge ? (x+this.OFFSETX+0.5)|0 : x+this.OFFSETX);
		y = (this.isedge ? (y+this.OFFSETY+0.5)|0 : y+this.OFFSETY);
		this.context.moveTo(x,y);
	},
	lineTo : function(x,y){
		x = (this.isedge ? (x+this.OFFSETX+0.5)|0 : x+this.OFFSETX);
		y = (this.isedge ? (y+this.OFFSETY+0.5)|0 : y+this.OFFSETY);
		this.context.lineTo(x,y);
	},
	rect : function(x,y,w,h){
		x = (this.isedge ? (x+this.OFFSETX+0.5)|0 : x+this.OFFSETX);
		y = (this.isedge ? (y+this.OFFSETY+0.5)|0 : y+this.OFFSETY);
		w = (this.isedge ? (w+0.5)|0 : w);
		h = (this.isedge ? (h+0.5)|0 : h);
		this.context.rect(x,y,w,h);
	},
	arc  : function(cx,cy,r,startRad,endRad,antiClockWise){
		cx = (this.isedge ? (cx+this.OFFSETX+0.5)|0 : cx+this.OFFSETX);
		cy = (this.isedge ? (cy+this.OFFSETY+0.5)|0 : cy+this.OFFSETY);
		this.context.arc(px,py,r,startRad,endRad,antiClockWise);
	},

	/* Canvas API functions (for drawing) */
	fill       : function(){ this.setProperties(); this.context.fill();},
	stroke     : function(){ this.setProperties(); this.context.stroke();},
	fillRect   : function(x,y,w,h){
		x = (this.isedge ? (x+this.OFFSETX+0.5)|0 : x+this.OFFSETX);
		y = (this.isedge ? (y+this.OFFSETY+0.5)|0 : y+this.OFFSETY);
		w = (this.isedge ? (w+0.5)|0 : w);
		h = (this.isedge ? (h+0.5)|0 : h);

		this.setProperties();
		this.context.fillRect(x,y,w,h);
	},
	strokeRect : function(x,y,w,h){
		x = (this.isedge ? (x+this.OFFSETX+0.5)|0 : x+this.OFFSETX);
		y = (this.isedge ? (y+this.OFFSETY+0.5)|0 : y+this.OFFSETY);
		w = (this.isedge ? (w+0.5)|0 : w);
		h = (this.isedge ? (h+0.5)|0 : h);

		this.setProperties();
		this.context.strokeRect(x,y,w,h);
	},
	fillText : function(text,x,y){
		this.setProperties();
		this.context.fillText(text,x+this.OFFSETX,y+this.OFFSETY);
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
			var a1 = (this.isedge ? (_args[i]  +this.OFFSETX+0.5)|0 : _args[i]  +this.OFFSETX);
				a2 = (this.isedge ? (_args[i+1]+this.OFFSETY+0.5)|0 : _args[i+1]+this.OFFSETY);
			if(i==0){ this.context.moveTo(a1,a2);}
			else    { this.context.lineTo(a1,a2);}
		}
		if(_args[_len-1]){ this.context.closePath();}
	},
	setOffsetLinePath : function(){
		var _args = arguments, _len = _args.length, m=[_args[0]+this.OFFSETX,_args[1]+this.OFFSETY];
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
		x1 = (this.isedge ? (x1+this.OFFSETX+0.5)|0 : x1+this.OFFSETX);
		y1 = (this.isedge ? (y1+this.OFFSETY+0.5)|0 : y1+this.OFFSETY);
		x2 = (this.isedge ? (x2+this.OFFSETX+0.5)|0 : x2+this.OFFSETX);
		y2 = (this.isedge ? (y2+this.OFFSETY+0.5)|0 : y2+this.OFFSETY);

		this.setProperties();
		this.context.beginPath();
		this.context.moveTo(x1,y1);
		this.context.lineTo(x2,y2);
		this.context.stroke();
	},
	strokeCross : function(cx,cy,l){
		var x1 = (this.isedge ? (cx-l+this.OFFSETX+0.5)|0 : cx-l+this.OFFSETX),
			y1 = (this.isedge ? (cy-l+this.OFFSETY+0.5)|0 : cy-l+this.OFFSETY),
			x2 = (this.isedge ? (cx+l+this.OFFSETX+0.5)|0 : cx+l+this.OFFSETX),
			y2 = (this.isedge ? (cy+l+this.OFFSETY+0.5)|0 : cy+l+this.OFFSETY);

		this.setProperties();
		this.context.beginPath();
		this.context.moveTo(x1,y1);
		this.context.lineTo(x2,y2);
		this.context.moveTo(x1,y2);
		this.context.lineTo(x2,y1);
		this.context.stroke();
	},
	fillCircle : function(cx,cy,r){
		cx = (this.isedge ? (cx+this.OFFSETX+0.5)|0 : cx+this.OFFSETX);
		cy = (this.isedge ? (cy+this.OFFSETY+0.5)|0 : cy+this.OFFSETY);
		this.setProperties();
		this.context.beginPath();
		this.context.arc(cx,cy,r,0,_2PI,false);
		this.context.fill();
	},
	strokeCircle : function(cx,cy,r){
		cx = (this.isedge ? (cx+this.OFFSETX+0.5)|0 : cx+this.OFFSETX);
		cy = (this.isedge ? (cy+this.OFFSETY+0.5)|0 : cy+this.OFFSETY);
		this.setProperties();
		this.context.beginPath();
		this.context.arc(cx,cy,r,0,_2PI,false);
		this.context.stroke();
	},
	shapeCircle : function(cx,cy,r){
		cx = (this.isedge ? (cx+this.OFFSETX+0.5)|0 : cx+this.OFFSETX);
		cy = (this.isedge ? (cy+this.OFFSETY+0.5)|0 : cy+this.OFFSETY);
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
		text.push("v\\:shape, v\\:group, v\\:polyline { behavior: url(#default#VML); position:absolute; width:10px; height:10px; }");
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

//----------------------------------------------------------------------------
// ★グローバル変数
//---------------------------------------------------------------------------
// Pointクラス
Point = function(xx,yy){ this.x = xx; this.y = yy;};
Point.prototype = {
	set : function(pos){ this.x = pos.x; this.y = pos.y;},
	reset : function(){ this.x = null; this.y = null;},
	valid : function(){ return (this.x!==null && this.y!==null);},
	equals : function(pos){ return (this.x===pos.x && this.y===pos.y);}
};
// Addressクラス
Address = function(xx,yy){ this.x = xx; this.y = yy;};
Address.prototype = Point.prototype;

// 各種パラメータの定義
var k = {
	// 各パズルのsetting()関数で設定されるもの
	qcols    : 0,			// 盤面の横幅
	qrows    : 0,			// 盤面の縦幅
	irowake  : 0,			// 0:色分け設定無し 1:色分けしない 2:色分けする

	iscross  : 0,			// 1:盤面内側のCrossがあるパズル 2:外枠上を含めてCrossがあるパズル
	isborder : 0,			// 1:Border/Lineが操作可能なパズル 2:外枠上も操作可能なパズル
	isexcell : 0,			// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

	isLineCross    : false,	// 線が交差するパズル
	isCenterLine   : false,	// マスの真ん中を通る線を回答として入力するパズル
	isborderAsLine : false,	// 境界線をlineとして扱う
	hasroom        : false,	// いくつかの領域に分かれている/分けるパズル
	roomNumber     : false,	// 問題の数字が部屋の左上に1つだけ入るパズル

	dispzero       : false,	// 0を表示するかどうか
	isDispHatena   : true,	// qnumが-2のときに？を表示する
	isAnsNumber    : false,	// 回答に数字を入力するパズル
	NumberWithMB   : false,	// 回答の数字と○×が入るパズル
	linkNumber     : false,	// 数字がひとつながりになるパズル

	BlackCell      : false,	// 黒マスを入力するパズル
	NumberIsWhite  : false,	// 数字のあるマスが黒マスにならないパズル
	RBBlackCell    : false,	// 連黒分断禁のパズル
	checkBlackCell : false,	// 正答判定で黒マスの情報をチェックするパズル
	checkWhiteCell : false,	// 正答判定で白マスの情報をチェックするパズル

	ispzprv3ONLY   : false,	// ぱずぷれアプレットには存在しないパズル
	isKanpenExist  : false,	// pencilbox/カンペンにあるパズル

	// 各パズルのsetting()関数で設定されることがあるもの
	bdmargin       : 0.70,	// 枠外の一辺のmargin(セル数換算)
	bdmargin_image : 0.15,	// 画像出力時のbdmargin値

	// 内部で自動的に設定されるグローバル変数
	puzzleid  : '',			// パズルのID("creek"など)

	EDITOR    : true,		// エディタモード
	PLAYER    : false,		// playerモード
	editmode  : true,		// 問題配置モード
	playmode  : false,		// 回答モード

	cellsize : 36,			// デフォルトのセルサイズ
	cwidth   : 36,			// セルの横幅
	cheight  : 36,			// セルの縦幅
	bwidth   : 18,			// セルの横幅/2
	bheight  : 18,			// セルの縦幅/2

	p0       : new Point(0, 0),	// Canvas中での盤面の左上座標
	cv_oft   : new Point(0, 0),	// Canvasのwindow内での左上座標

	br:{
		IE    : (!!(window.attachEvent && !window.opera)),
		Opera : (!!window.opera),
		WebKit: (navigator.userAgent.indexOf('AppleWebKit/') > -1),
		Gecko : (navigator.userAgent.indexOf('Gecko')>-1 && navigator.userAgent.indexOf('KHTML') == -1),

		WinWebKit: (navigator.userAgent.indexOf('AppleWebKit/') > -1 && navigator.userAgent.indexOf('Win') > -1),
		IE6      : (navigator.userAgent.match(/MSIE (\d+)/) && parseInt(RegExp.$1)==6),
		IE7      : (navigator.userAgent.match(/MSIE (\d+)/) && parseInt(RegExp.$1)==7),
		IE8      : (navigator.userAgent.match(/MSIE (\d+)/) && parseInt(RegExp.$1)==8)
	},
	os:{
		iPhoneOS : (navigator.userAgent.indexOf('like Mac OS X') > -1),
		Android  : (navigator.userAgent.indexOf('Android') > -1)
	},
	vml : Camp.current.vml,

	// const値
	BOARD  : 'board',
	CELL   : 'cell',
	CROSS  : 'cross',
	BORDER : 'border',
	EXCELL : 'excell',

	QUES : 'ques',
	QNUM : 'qnum',
	QDIR : 'qdir',
	QANS : 'qans',
	ANUM : 'anum',
	LINE : 'line',
	QSUB : 'qsub',

	NONE : 0,	// 方向なし
	UP : 1,		// up
	DN : 2,		// down
	LT : 3,		// left
	RT : 4,		// right

	KEYUP : 'up',
	KEYDN : 'down',
	KEYLT : 'left',
	KEYRT : 'right',

	// for_test.js用
	scriptcheck : false
};

//---------------------------------------------------------------------------
// ★その他のグローバル変数
//---------------------------------------------------------------------------
var g;				// グラフィックコンテキスト
var Puzzles = [];	// パズル個別クラス
var _doc = document;

// localStorageがなくてglobalStorage対応(Firefox3.0)ブラウザのハック
if(typeof localStorage != "object" && typeof globalStorage == "object"){
	localStorage = globalStorage[location.host];
}

//---------------------------------------------------------------------------
// ★共通グローバル関数
// f_true()  trueを返す関数オブジェクト(引数に空関数を書くのがめんどくさいので)
//---------------------------------------------------------------------------
function f_true(){ return true;}

//---------------------------------------------------------------------------
// ★ElementManagerクラス Element関係の処理
//    ee() 指定したidのElementExtを取得する
//---------------------------------------------------------------------------
(function(){

// definition
var
	// local scope
	_doc = document,
	_win = this,

	// browsers
	_IE     = k.br.IE,

	/* ここからクラス定義です  varでドット付きは、最左辺に置けません */

	// define and map _ElementManager class
	_ELm = _ElementManager = _win.ee = function(id){
		if(typeof id === 'string'){
			if(!_elx[id]){
				var el = _doc.getElementById(id);
				if(!el){ return null;}
				_elx[id] = new _ELx(el);
			}
			return _elx[id];
		}

		var el = id;
		if(!!el.id){
			if(!_elx[el.id]){ _elx[el.id] = new _ELx(el);}
			return _elx[el.id];
		}

		return ((!!el) ? new _ELx(el) : null);
	},
	_elx = _ElementManager._cache    = {},
	_elp = _ElementManager._template = [],
	_elpcnt = _ElementManager._tempcnt = 0;

	// define and map _ElementManager.ElementExt class
	_ELx = _ElementManager.ElementExt = function(el){
		this.el     = el;
		this.parent = el.parentNode;
		this.pdisp  = 'none';
	},
	_ELp = _ElementManager.ElementTemplate = function(parent, tag, attr, style, func){
		this.parent  = parent;
		this.tagName = tag;
		this.attr    = attr;
		this.style   = style;
		this.func    = func;
	},

	// Utility functions
	_extend = function(obj, ads){
		for(var name in ads){ obj[name] = ads[name];}
	},
	_toArray = function(args){
		if(!args){ return [];}
		var array = [];
		for(var i=0,len=args.length;i<len;i++){ array[i]=args[i];}
		return array;
	}
;

// implementation of _ElementManage class
_extend( _ElementManager, {

	//----------------------------------------------------------------------
	// ee.clean()  内部用の変数を初期化する
	//----------------------------------------------------------------------
	clean : function(){
		_elx = null;
		_elx = {};
		_elpcnt  = 0;
		_elp = null;
		_elp = [];
	},

	//----------------------------------------------------------------------
	// ee.addTemplate()  指定した内容のElementTemplateを作成してIDを返す
	// ee.createEL()     ElementTemplateからエレメントを作成して返す
	//----------------------------------------------------------------------
	addTemplate : function(parent, tag, attr_i, style_i, func_i){
		if(!tag){ return;}

		if(!parent){ parent = null;}
		else if(typeof parent == 'string'){ parent = ee(parent).el;}

		var attr  = {};
		var style = (style_i || {});
		var func  = (func_i  || {});

		if(!!attr_i){
			for(var name in attr_i){
				if(name==='unselectable' && attr_i[name]==='on'){
					style['userSelect'] = style['MozUserSelect'] = style['KhtmlUserSelect'] = 'none';
					attr['unselectable'] = 'on';
				}
				else{ attr[name] = attr_i[name];}
			}
		}

		_elp[_elpcnt++] = new _ELp(parent, tag, attr, style, func_i);
		return (_elpcnt-1);
	},
	createEL : function(tid, id){
		if(!_elp[tid]){ return null;}

		var temp = _elp[tid];
		var el = _doc.createElement(temp.tagName);

		if(!!id){ el.id = id;}
		for(var name in temp.attr) { el[name]       = temp.attr[name]; }
		for(var name in temp.style){ el.style[name] = temp.style[name];}
		for(var name in temp.func) { el["on"+name]  = temp.func[name]; }

		if(!!temp.parent){ temp.parent.appendChild(el);} // 後ろじゃないとIEでエラーになる。。
		return el;
	},

	//----------------------------------------------------------------------
	// ee.getSrcElement() イベントが起こったエレメントを返す
	// ee.pageX()         イベントが起こったページ上のX座標を返す
	// ee.pageY()         イベントが起こったページ上のY座標を返す
	// ee.windowWidth()   ウィンドウの幅を返す
	// ee.windowHeight()  ウィンドウの高さを返す
	//----------------------------------------------------------------------
	getSrcElement : function(e){
		return e.target || e.srcElement;
	},
	pageX : function(e){
		_ElementManager.pageX = (
			(!_IE) ? function(e){ return e.pageX;}
				   : function(e){ return e.clientX + (_doc.documentElement.scrollLeft || _doc.body.scrollLeft);}
		);
		return _ElementManager.pageX(e);
	},
	pageY : function(e){
		_ElementManager.pageY = (
			(!_IE) ? function(e){ return e.pageY;}
				   : function(e){ return e.clientY + (_doc.documentElement.scrollTop  || _doc.body.scrollTop);}
		);
		return _ElementManager.pageY(e);
	},

	windowWidth : function(){
		_ElementManager.windowWidth = (
			(!_IE) ? function(){ return innerWidth;}
				   : function(){ return _doc.body.clientWidth;}
		);
		return _ElementManager.windowWidth();
	},
	windowHeight : function(){
		_ElementManager.windowHeight = (
			(!_IE) ? function(){ return innerHeight;}
				   : function(){ return _doc.body.clientHeight;}
		);
		return _ElementManager.windowHeight();
	},

	//----------------------------------------------------------------------
	// ee.binder()   thisをbindする
	// ee.ebinder()  thisとイベントをbindする
	//----------------------------------------------------------------------
	binder : function(){
		var args=_toArray(arguments); var obj = args.shift(), __method = args.shift();
		return function(){
			return __method.apply(obj, (args.length>0?args[0]:[]).concat(_toArray(arguments)));
		}
	},
	ebinder : function(){
		var args=_toArray(arguments); var obj = args.shift(), __method = args.shift(), rest = (args.length>0?args[0]:[]);
		return function(e){
			return __method.apply(obj, [e||_win.event].concat(args.length>0?args[0]:[]).concat(_toArray(arguments)));
		}
	},

	//----------------------------------------------------------------------
	// ee.stopPropagation() イベントの起こったエレメントより上にイベントを
	//                      伝播させないようにする
	// ee.preventDefault()  イベントの起こったエレメントで、デフォルトの
	//                      イベントが起こらないようにする
	//----------------------------------------------------------------------
	stopPropagation : function(e){
		if(!!e.stopPropagation){ e.stopPropagation();}
		else{ e.cancelBubble = true;}
	},
	preventDefault : function(e){
		if(!!e.preventDefault){ e.preventDefault();}
		else{ e.returnValue = true;}
	}
});

// implementation of _ElementManager.ElementExt class
_ElementManager.ElementExt.prototype = {
	//----------------------------------------------------------------------
	// ee.getRect()   エレメントの四辺の座標を返す
	// ee.getWidth()  エレメントの幅を返す
	// ee.getHeight() エレメントの高さを返す
	//----------------------------------------------------------------------
	getRect : function(){
		this.getRect = ((!!document.createElement('div').getBoundingClientRect) ?
			((!_IE) ?
				function(){
					var _html = _doc.documentElement, _body = _doc.body, rect = this.el.getBoundingClientRect();
					var left   = rect.left   + _win.scrollX;
					var top    = rect.top    + _win.scrollY;
					var right  = rect.right  + _win.scrollX;
					var bottom = rect.bottom + _win.scrollY;
					return { top:top, bottom:bottom, left:left, right:right};
				}
			:
				function(){
					var _html = _doc.documentElement, _body = _doc.body, rect = this.el.getBoundingClientRect();
					var left   = rect.left   + ((_body.scrollLeft || _html.scrollLeft) - _html.clientLeft);
					var top    = rect.top    + ((_body.scrollTop  || _html.scrollTop ) - _html.clientTop );
					var right  = rect.right  + ((_body.scrollLeft || _html.scrollLeft) - _html.clientLeft);
					var bottom = rect.bottom + ((_body.scrollTop  || _html.scrollTop ) - _html.clientTop );
					return { top:top, bottom:bottom, left:left, right:right};
				}
			)
		:
			function(){
				var left = 0, top = 0, el = this.el;
				while(!!el){
					left += +(!isNaN(el.offsetLeft) ? el.offsetLeft : el.clientLeft);
					top  += +(!isNaN(el.offsetTop)  ? el.offsetTop  : el.clientTop );
					el = el.offsetParent;
				}
				var right  = left + (this.el.offsetWidth  || this.el.clientWidth);
				var bottom = top  + (this.el.offsetHeight || this.el.clientHeight);
				return { top:top, bottom:bottom, left:left, right:right};
			}
		);
		return this.getRect();
	},
	getWidth  : function(){ return this.el.offsetWidth  || this.el.clientWidth; },
	getHeight : function(){ return this.el.offsetHeight || this.el.clientHeight;},

	//----------------------------------------------------------------------
	// ee.unselectable()         エレメントを選択できなくする
	// ee.replaceChildrenClass() 子要素のクラスを変更する
	// ee.remove()               エレメントを削除する
	// ee.removeNextAll()        同じ親要素を持ち、自分より後ろにあるエレメントを削除する
	//----------------------------------------------------------------------
	unselectable : function(){
		this.el.style.MozUserSelect   = 'none';
		this.el.style.KhtmlUserSelect = 'none';
		this.el.style.userSelect      = 'none';
		this.el.unselectable = "on";
		return this;
	},

	replaceChildrenClass : function(before, after){
		var el = this.el.firstChild;
		while(!!el){
			if(el.className===before){ el.className = after;}
			el = el.nextSibling;
		}
	},

	remove : function(){
		this.parent.removeChild(this.el);
		return this;
	},
	removeNextAll : function(targetbase){
		var el = this.el.lastChild;
		while(!!el){
			if(el===targetbase){ break;}
			if(!!el){ this.el.removeChild(el);}else{ break;}

			el = this.el.lastChild;
		}
		return this;
	},

	//----------------------------------------------------------------------
	// ee.appendHTML() 指定したHTMLを持つspanエレメントを子要素の末尾に追加する
	// ee.appendBR()   <BR>を子要素の末尾に追加する
	// ee.appendEL()   指定したエレメントを子要素の末尾に追加する
	// ee.appendTo()   自分を指定した親要素の末尾に追加する
	// ee.insertBefore() エレメントを自分の前に追加する
	// ee.insertAfter()  エレメントを自分の後ろに追加する
	//----------------------------------------------------------------------
	appendHTML : function(html){
		var sel = _doc.createElement('span');
		sel.innerHTML = html;
		this.el.appendChild(sel);
		return this;
	},
	appendBR : function(){
		this.el.appendChild(_doc.createElement('br'));
		return this;
	},
	appendEL : function(el){
		this.el.appendChild(el);
		return this;
	},

	appendTo : function(elx){
		elx.el.appendChild(this.el);
		this.parent = elx.el;
		return this;
	},

	insertBefore : function(baseel){
		this.parent = baseel.parentNode;
		this.parent.insertBefore(this.el,baseel);
		return this;
	},
	insertAfter : function(baseel){
		this.parent = baseel.parentNode;
		this.parent.insertBefore(this.el,baseel.nextSibling);
		return this;
	}
};

})();

//---------------------------------------------------------------------------
// ★Timerクラス
//---------------------------------------------------------------------------
Timer = function(){
	// ** 一般タイマー
	this.TID;				// タイマーID
	this.timerInterval = 100;

	this.st       = 0;		// タイマースタート時のgetTime()取得値(ミリ秒)
	this.current  = 0;		// 現在のgetTime()取得値(ミリ秒)

	// 経過時間表示用変数
	this.bseconds = 0;		// 前回ラベルに表示した時間(秒数)
	this.timerEL = ee('timerpanel').el;

	// 自動正答判定用変数
	this.lastAnsCnt  = 0;	// 前回正答判定した時の、OperationManagerに記録されてた問題/回答入力のカウント
	this.worstACtime = 0;	// 正答判定にかかった時間の最悪値(ミリ秒)
	this.nextACtime  = 0;	// 次に自動正答判定ルーチンに入ることが可能になる時間

	// 一般タイマースタート
	this.start();

	// ** Undoタイマー
	this.TIDundo = null;	// タイマーID
	this.undoInterval = 25

	// Undo/Redo用変数
	this.undoWaitTime  = 300;	// 1回目にwaitを多く入れるための値
	this.undoWaitCount = 0;

	if(k.br.IE){
		this.timerInterval *= 2;
		this.undoInterval  *= 2;
	}
};
Timer.prototype = {
	//---------------------------------------------------------------------------
	// tm.now()        現在の時間を取得する
	// tm.reset()      タイマーのカウントを0にして、スタートする
	// tm.start()      update()関数を200ms間隔で呼び出す
	// tm.update()     200ms単位で呼び出される関数
	//---------------------------------------------------------------------------
	now : function(){ return (new Date()).getTime();},
	reset : function(){
		this.worstACtime = 0;
		this.timerEL.innerHTML = this.label()+"00:00";

		clearInterval(this.TID);
		this.start();
	},
	start : function(){
		this.st = this.now();
		this.TID = setInterval(ee.binder(this, this.update), this.timerInterval);
	},
	update : function(){
		this.current = this.now();

		if(k.PLAYER){ this.updatetime();}
		if(pp.getVal('autocheck')){ this.ACcheck();}
	},

	//---------------------------------------------------------------------------
	// tm.updatetime() 秒数の表示を行う
	// tm.label()      経過時間に表示する文字列を返す
	//---------------------------------------------------------------------------
	updatetime : function(){
		var seconds = ((this.current - this.st)/1000)|0;
		if(this.bseconds == seconds){ return;}

		var hours   = (seconds/3600)|0;
		var minutes = ((seconds/60)|0) - hours*60;
		seconds = seconds - minutes*60 - hours*3600;

		if(minutes < 10) minutes = "0" + minutes;
		if(seconds < 10) seconds = "0" + seconds;

		this.timerEL.innerHTML = [this.label(), (!!hours?hours+":":""), minutes, ":", seconds].join('');

		this.bseconds = seconds;
	},
	label : function(){
		return menu.selectStr("経過時間：","Time: ");
	},

	//---------------------------------------------------------------------------
	// tm.ACcheck()    自動正解判定を呼び出す
	//---------------------------------------------------------------------------
	ACcheck : function(){
		if(this.current>this.nextACtime && this.lastAnsCnt!=um.anscount && !ans.inCheck){
			this.lastAnsCnt = um.anscount;
			if(!ans.autocheck()){ return;}

			this.worstACtime = Math.max(this.worstACtime, (this.now()-this.current));
			this.nextACtime = this.current + (this.worstACtime<250 ? this.worstACtime*4+120 : this.worstACtime*2+620);
		}
	},

	//---------------------------------------------------------------------------
	// tm.startUndoTimer()  Undo/Redo呼び出しを開始する
	// tm.stopUndoTimer()   Undo/Redo呼び出しを終了する
	// tm.procUndo()        Undo/Redo呼び出しを実行する
	// tm.execUndo()        Undo/Redo関数を呼び出す
	//---------------------------------------------------------------------------
	startUndoTimer : function(){
		this.undoWaitCount = this.undoWaitTime/this.undoInterval;
		if(!this.TIDundo){ this.TIDundo = setInterval(ee.binder(this, this.procUndo), this.undoInterval);}
		this.execUndo();
	},
	stopUndoTimer : function(){
		kc.inUNDO=false;
		kc.inREDO=false;
		clearInterval(this.TIDundo);
		this.TIDundo = null;
	},
	procUndo : function(){
		if(!kc.isCTRL || (!kc.inUNDO && !kc.inREDO)){ this.stopUndoTimer();}
		else if(this.undoWaitCount>0)               { this.undoWaitCount--;}
		else{ execUndo();}
	},
	execUndo : function(){
		if     (kc.inUNDO){ um.undo();}
		else if(kc.inREDO){ um.redo();}
	}
};

//---------------------------------------------------------------------------
// ★Cellクラス BoardクラスがCellの数だけ保持する
//---------------------------------------------------------------------------
// ボードメンバデータの定義(1)
// Cellクラスの定義
Cell = function(){
	this.bx;	// セルのX座標(border座標系)を保持する
	this.by;	// セルのY座標(border座標系)を保持する
	this.px;	// セルの描画用X座標を保持する
	this.py;	// セルの描画用Y座標を保持する
	this.cpx;	// セルの描画用中心X座標を保持する
	this.cpy;	// セルの描画用中心Y座標を保持する

	this.ques;	// セルの問題データ(形状)を保持する
	this.qnum;	// セルの問題データ(数字)を保持する(数字 or カックロの右側)
	this.qdir;	// セルの問題データ(方向)を保持する(矢印 or カックロの下側)
	this.anum;	// セルの回答(数字/○△□/単体矢印))データを保持する
	this.qans;	// セルの回答(黒マス/斜線/あかり/棒/ふとん)データを保持する
	this.qsub;	// セルの補助データを保持する(白マス or 背景色)
	this.error;	// エラーデータを保持する
};
Cell.prototype = {
	// デフォルト値
	defques : 0,
	defqnum : -1,
	defqdir : 0,
	defanum : -1,
	defqans : 0,
	defqsub : 0,

	//---------------------------------------------------------------------------
	// cell.allclear() セルの位置,描画情報以外をクリアする
	// cell.ansclear() セルのanum,qsub,error情報をクリアする
	// cell.subclear() セルのqsub,error情報をクリアする
	//---------------------------------------------------------------------------
	allclear : function(id,isrec) {
		if(this.ques!==this.defques){ if(isrec){ um.addOpe(k.CELL, k.QUES, id, this.ques, this.defques);} this.ques=this.defques;}
		if(this.qnum!==this.defqnum){ if(isrec){ um.addOpe(k.CELL, k.QNUM, id, this.qnum, this.defqnum);} this.qnum=this.defqnum;}
		if(this.qdir!==this.defqdir){ if(isrec){ um.addOpe(k.CELL, k.QDIR, id, this.qdir, this.defqdir);} this.qdir=this.defqdir;}
		if(this.anum!==this.defanum){ if(isrec){ um.addOpe(k.CELL, k.ANUM, id, this.anum, this.defanum);} this.anum=this.defanum;}
		if(this.qans!==this.defqans){ if(isrec){ um.addOpe(k.CELL, k.QANS, id, this.qans, this.defqans);} this.qans=this.defqans;}
		if(this.qsub!==this.defqsub){ if(isrec){ um.addOpe(k.CELL, k.QSUB, id, this.qsub, this.defqsub);} this.qsub=this.defqsub;}
		this.error = 0;
	},
	ansclear : function(id) {
		if(this.anum!==this.defanum){ um.addOpe(k.CELL, k.ANUM, id, this.anum, this.defanum); this.anum=this.defanum;}
		if(this.qans!==this.defqans){ um.addOpe(k.CELL, k.QANS, id, this.qans, this.defqans); this.qans=this.defqans;}
		if(this.qsub!==this.defqsub){ um.addOpe(k.CELL, k.QSUB, id, this.qsub, this.defqsub); this.qsub=this.defqsub;}
		this.error = 0;
	},
	subclear : function(id) {
		if(this.qsub!==this.defqsub){ um.addOpe(k.CELL, k.QSUB, id, this.qsub, this.defqsub); this.qsub=this.defqsub;}
		this.error = 0;
	}
};

//---------------------------------------------------------------------------
// ★Crossクラス BoardクラスがCrossの数だけ保持する(iscross==1の時)
//---------------------------------------------------------------------------
// ボードメンバデータの定義(2)
// Crossクラスの定義
Cross = function(){
	this.bx;	// 交差点のX座標(border座標系)を保持する
	this.by;	// 交差点のY座標(border座標系)を保持する
	this.px;	// 交差点の描画用X座標を保持する
	this.py;	// 交差点の描画用Y座標を保持する

	this.ques;	// 交差点の問題データ(黒点)を保持する
	this.qnum;	// 交差点の問題データ(数字)を保持する
	this.error;	// エラーデータを保持する
};
Cross.prototype = {
	// デフォルト値
	defques : 0,
	defqnum : -1,

	//---------------------------------------------------------------------------
	// cross.allclear() 交差点の位置,描画情報以外をクリアする
	// cross.ansclear() 交差点のerror情報をクリアする
	// cross.subclear() 交差点のerror情報をクリアする
	//---------------------------------------------------------------------------
	allclear : function(id,isrec) {
		if(this.ques!==this.defques){ if(isrec){ um.addOpe(k.CROSS, k.QUES, id, this.ques, this.defques);} this.ques=this.defques;}
		if(this.qnum!==this.defqnum){ if(isrec){ um.addOpe(k.CROSS, k.QNUM, id, this.qnum, this.defqnum);} this.qnum=this.defqnum;}
		this.error = 0;
	},
	ansclear : function(id) {
		this.error = 0;
	},
	subclear : function(id) {
		this.error = 0;
	}
};

//---------------------------------------------------------------------------
// ★Borderクラス BoardクラスがBorderの数だけ保持する(isborder==1の時)
//---------------------------------------------------------------------------
// ボードメンバデータの定義(3)
// Borderクラスの定義
Border = function(){
	this.bx;	// 境界線のX座標(border座標系)を保持する
	this.by;	// 境界線のY座標(border座標系)を保持する
	this.px;	// 境界線の描画X座標を保持する
	this.py;	// 境界線の描画Y座標を保持する

	this.ques;	// 境界線の問題データを保持する(境界線 or マイナリズムの不等号)
	this.qnum;	// 境界線の問題データを保持する(マイナリズムの数字)
	this.qans;	// 境界線の回答データを保持する(回答境界線 or スリリンなどの線)
	this.qsub;	// 境界線の補助データを保持する(1:補助線/2:×)
	this.line;	// 線の回答データを保持する
	this.color;	// 線の色分けデータを保持する
	this.error;	// エラーデータを保持する

	this.cellcc  = [null,null];	// 隣接セルのID
	this.crosscc = [null,null];	// 隣接交点のID
};
Border.prototype = {
	// デフォルト値
	defques : 0,
	defqnum : -1,
	defqans : 0,
	defline : 0,
	defqsub : 0,

	//---------------------------------------------------------------------------
	// border.allclear() 境界線の位置,描画情報以外をクリアする
	// border.ansclear() 境界線のqans,qsub,line,color,error情報をクリアする
	// border.subclear() 境界線のqsub,error情報をクリアする
	//---------------------------------------------------------------------------
	allclear : function(id,isrec) {
		if(this.ques!==this.defques){ if(isrec){ um.addOpe(k.BORDER, k.QUES, id, this.ques, this.defques);} this.ques=this.defques;}
		if(this.qnum!==this.defqnum){ if(isrec){ um.addOpe(k.BORDER, k.QNUM, id, this.qnum, this.defqnum);} this.qnum=this.defqnum;}
		if(this.qans!==this.defqans){ if(isrec){ um.addOpe(k.BORDER, k.QANS, id, this.qans, this.defqans);} this.qans=this.defqans;}
		if(this.line!==this.defline){ if(isrec){ um.addOpe(k.BORDER, k.LINE, id, this.line, this.defline);} this.line=this.defline;}
		if(this.qsub!==this.defqsub){ if(isrec){ um.addOpe(k.BORDER, k.QSUB, id, this.qsub, this.defqsub);} this.qsub=this.defqsub;}
		this.color = "";
		this.error = 0;
	},
	ansclear : function(id) {
		if(this.qans!==this.defqans){ um.addOpe(k.BORDER, k.QANS, id, this.qans, this.defqans); this.qans=this.defqans;}
		if(this.line!==this.defline){ um.addOpe(k.BORDER, k.LINE, id, this.line, this.defline); this.line=this.defline;}
		if(this.qsub!==this.defqsub){ um.addOpe(k.BORDER, k.QSUB, id, this.qsub, this.defqsub); this.qsub=this.defqsub;}
		this.color = "";
		this.error = 0;
	},
	subclear : function(id) {
		if(this.qsub!==this.defqsub){ um.addOpe(k.BORDER, k.QSUB, id, this.qsub, this.defqsub); this.qsub=this.defqsub;}
		this.error = 0;
	}
};

//---------------------------------------------------------------------------
// ★EXCellクラス BoardクラスがEXCellの数だけ保持する
//---------------------------------------------------------------------------
// ボードメンバデータの定義(4)
// EXCellクラスの定義
EXCell = function(){
	this.bx;	// セルのX座標(border座標系)を保持する
	this.by;	// セルのY座標(border座標系)を保持する
	this.px;	// セルの描画用X座標を保持する
	this.py;	// セルの描画用Y座標を保持する

	this.qnum;	// セルの問題データ(数字)を保持する(数字 or カックロの右側)
	this.qdir;	// セルの問題データ(方向)を保持する(矢印 or カックロの下側)
};
EXCell.prototype = {
	// デフォルト値
	defqnum : -1,
	defqdir : 0,

	//---------------------------------------------------------------------------
	// excell.allclear() セルの位置,描画情報以外をクリアする
	// excell.ansclear() セルのerror情報をクリアする
	// excell.subclear() セルのerror情報をクリアする
	//---------------------------------------------------------------------------
	allclear : function(id,isrec) {
		if(this.qnum!==this.defqnum){ if(isrec){ um.addOpe(k.EXCELL, k.QNUM, id, this.qnum, this.defqnum);} this.qnum=this.defqnum;}
		if(this.qdir!==this.defqdir){ if(isrec){ um.addOpe(k.EXCELL, k.QDIR, id, this.qdir, this.defqdir);} this.qdir=this.defqdir;}
		this.error = 0;
	},
	ansclear : function(id) {
		this.error = 0;
	},
	subclear : function(id) {
		this.error = 0;
	}
};

//---------------------------------------------------------------------------
// ★Boardクラス 盤面の情報を保持する。Cell, Cross, Borderのオブジェクトも保持する
//---------------------------------------------------------------------------
// Boardクラスの定義
Board = function(){
	this.cell   = [];
	this.cross  = [];
	this.border = [];
	this.excell = [];

	this.cellmax   = 0;		// セルの数
	this.crossmax  = 0;		// 交点の数
	this.bdmax     = 0;		// 境界線の数
	this.excellmax = 0;		// 拡張セルの数

	this.bdinside = 0;		// 盤面の内側(外枠上でない)に存在する境界線の本数

	this.maxnum   = 255;	// 入力できる最大の数字

	this.numberAsObject = false;	// 数字を表示する時に、数字以外で表示する

	// 盤面の範囲
	this.minbx = 0;
	this.minby = 0;
	this.maxbx = 2*k.qcols;
	this.maxby = 2*k.qrows;

	// isLineNG関連の変数など
	this.enableLineNG = false;
	this.enableLineCombined = false;

	this.isLPobj = {};
	this.isLPobj[k.UP] = {11:1,12:1,14:1,15:1};
	this.isLPobj[k.DN] = {11:1,12:1,16:1,17:1};
	this.isLPobj[k.LT] = {11:1,13:1,15:1,16:1};
	this.isLPobj[k.RT] = {11:1,13:1,14:1,17:1};

	this.noLPobj = {};
	this.noLPobj[k.UP] = {1:1,4:1,5:1,13:1,16:1,17:1,21:1};
	this.noLPobj[k.DN] = {1:1,2:1,3:1,13:1,14:1,15:1,21:1};
	this.noLPobj[k.LT] = {1:1,2:1,5:1,12:1,14:1,17:1,22:1};
	this.noLPobj[k.RT] = {1:1,3:1,4:1,12:1,15:1,16:1,22:1};

	// 盤面サイズの初期化
	this.initBoardSize(k.qcols,k.qrows);
};
Board.prototype = {
	//---------------------------------------------------------------------------
	// bd.initBoardSize() 指定されたサイズで盤面の初期化を行う
	// bd.initSpecial()   パズル個別で初期化を行いたい処理を入力する
	//---------------------------------------------------------------------------
	initBoardSize : function(col,row){
		this.allclear(false); // initGroupで、新Objectに対してはallclearが個別に呼ばれます

						{ this.initGroup(k.CELL,   col, row);}
		if(!!k.iscross) { this.initGroup(k.CROSS,  col, row);}
		if(!!k.isborder){ this.initGroup(k.BORDER, col, row);}
		if(!!k.isexcell){ this.initGroup(k.EXCELL, col, row);}

		this.initSpecial(col,row);

		k.qcols = col;
		k.qrows = row;

		this.setminmax();
		this.setposAll();
	},
	initSpecial : function(){ },

	//---------------------------------------------------------------------------
	// bd.initGroup()     数を比較して、オブジェクトの追加か削除を行う
	// bd.getGroup()      指定したタイプのオブジェクト配列を返す
	// bd.estimateSize()  指定したオブジェクトがいくつになるか計算を行う
	// bd.newObject()     指定されたタイプの新しいオブジェクトを返す
	// bd.getObject()     指定されたタイプ・IDのオブジェクトを返す
	//---------------------------------------------------------------------------
	initGroup : function(type, col, row){
		var group = this.getGroup(type);
		var len = this.estimateSize(type, col, row), clen = group.length;
		// 既存のサイズより小さくなるならdeleteする
		if(clen>len){
			for(var id=clen-1;id>=len;id--){ delete group[id]; group.pop();}
		}
		// 既存のサイズより大きくなるなら追加する
		else if(clen<len){
			for(var id=clen;id<len;id++){
				group.push(this.newObject(type));
				group[id].allclear(id,false);
			}
		}
		this.setposGroup(type);
		return (len-clen);
	},
	getGroup : function(type){
		if     (type===k.CELL)  { return this.cell;}
		else if(type===k.CROSS) { return this.cross;}
		else if(type===k.BORDER){ return this.border;}
		else if(type===k.EXCELL){ return this.excell;}
		return [];
	},
	estimateSize : function(type, col, row){
		if     (type===k.CELL)  { return col*row;}
		else if(type===k.CROSS) { return (col+1)*(row+1);}
		else if(type===k.BORDER){
			if     (k.isborder===1){ return 2*col*row-(col+row);}
			else if(k.isborder===2){ return 2*col*row+(col+row);}
		}
		else if(type===k.EXCELL){
			if     (k.isexcell===1){ return col+row+1;}
			else if(k.isexcell===2){ return 2*col+2*row+4;}
		}
		return 0;
	},
	newObject : function(type){
		if     (type===k.CELL)  { return (new Cell());}
		else if(type===k.CROSS) { return (new Cross());}
		else if(type===k.BORDER){ return (new Border());}
		else if(type===k.EXCELL){ return (new EXCell());}
		return (void 0);
	},
	getObject : function(type,id){
		if     (type===k.CELL)  { return bd.cell[id];}
		else if(type===k.CROSS) { return bd.cross[id];}
		else if(type===k.BORDER){ return bd.border[id];}
		else if(type===k.EXCELL){ return bd.excell[id];}
		return (void 0);
	},

	//---------------------------------------------------------------------------
	// bd.setposAll()    全てのCell, Cross, BorderオブジェクトのsetposCell()等を呼び出す
	//                   盤面の新規作成や、拡大/縮小/回転/反転時などに呼び出される
	// bd.setposGroup()  指定されたタイプのsetpos関数を呼び出す
	// bd.setposCell()   該当するidのセルのbx,byプロパティを設定する
	// bd.setposCross()  該当するidの交差点のbx,byプロパティを設定する
	// bd.setposBorder() 該当するidの境界線/Lineのbx,byプロパティを設定する
	// bd.setposEXCell() 該当するidのExtendセルのbx,byプロパティを設定する
	// bd.set_xnum()     crossは存在しないが、bd._xnumだけ設定したい場合に呼び出す
	//---------------------------------------------------------------------------
	// setpos関連関数 <- 各Cell等が持っているとメモリを激しく消費するのでここに置くこと.
	setposAll : function(){
		this.setposCells();
		if(!!k.iscross) { this.setposCrosses();}
		if(!!k.isborder){ this.setposBorders();}
		if(!!k.isexcell){ this.setposEXcells();}

		this.setcacheAll();
		this.setcoordAll();
	},
	setposGroup : function(type){
		if     (type===k.CELL)  { this.setposCells();}
		else if(type===k.CROSS) { this.setposCrosses();}
		else if(type===k.BORDER){ this.setposBorders();}
		else if(type===k.EXCELL){ this.setposEXcells();}
	},

	setposCells : function(){
		this.cellmax = this.cell.length;
		for(var id=0;id<this.cellmax;id++){
			var obj = this.cell[id];
			obj.bx = (id%k.qcols)*2+1;
			obj.by = ((id/k.qcols)<<1)+1;
		}
	},
	setposCrosses : function(){
		this.crossmax = this.cross.length;
		for(var id=0;id<this.crossmax;id++){
			var obj = this.cross[id];
			obj.bx = (id%(k.qcols+1))*2;
			obj.by = (id/(k.qcols+1))<<1;
		}
	},
	setposBorders : function(){
		this.bdinside = 2*k.qcols*k.qrows-(k.qcols+k.qrows);
		this.bdmax = this.border.length;
		for(var id=0;id<this.bdmax;id++){
			var obj=this.border[id], i=id;
			if(i>=0 && i<(k.qcols-1)*k.qrows){ obj.bx=(i%(k.qcols-1))*2+2; obj.by=((i/(k.qcols-1))<<1)+1;} i-=((k.qcols-1)*k.qrows);
			if(i>=0 && i<k.qcols*(k.qrows-1)){ obj.bx=(i%k.qcols)*2+1;     obj.by=((i/k.qcols)<<1)+2;    } i-=(k.qcols*(k.qrows-1));
			if(k.isborder===2){
				if(i>=0 && i<k.qcols){ obj.bx=i*2+1;     obj.by=0;        } i-=k.qcols;
				if(i>=0 && i<k.qcols){ obj.bx=i*2+1;     obj.by=2*k.qrows;} i-=k.qcols;
				if(i>=0 && i<k.qrows){ obj.bx=0;         obj.by=i*2+1;    } i-=k.qrows;
				if(i>=0 && i<k.qrows){ obj.bx=2*k.qcols; obj.by=i*2+1;    } i-=k.qrows;
			}
		}
	},
	setposEXcells : function(){
		this.excellmax = this.excell.length;
		for(var id=0;id<this.excellmax;id++){
			var obj = this.excell[id], i=id;
			obj.bx=-1;
			obj.by=-1;
			if(k.isexcell===1){
				if(i>=0 && i<k.qcols){ obj.bx=i*2+1; obj.by=-1;    continue;} i-=k.qcols;
				if(i>=0 && i<k.qrows){ obj.bx=-1;    obj.by=i*2+1; continue;} i-=k.qrows;
			}
			else if(k.isexcell===2){
				if(i>=0 && i<k.qcols){ obj.bx=i*2+1;       obj.by=-1;          continue;} i-=k.qcols;
				if(i>=0 && i<k.qcols){ obj.bx=i*2+1;       obj.by=2*k.qrows+1; continue;} i-=k.qcols;
				if(i>=0 && i<k.qrows){ obj.bx=-1;          obj.by=i*2+1;       continue;} i-=k.qrows;
				if(i>=0 && i<k.qrows){ obj.bx=2*k.qcols+1; obj.by=i*2+1;       continue;} i-=k.qrows;
				if(i===0)            { obj.bx=-1;          obj.by=-1;          continue;} i--;
				if(i===0)            { obj.bx=2*k.qcols+1; obj.by=-1;          continue;} i--;
				if(i===0)            { obj.bx=-1;          obj.by=2*k.qrows+1; continue;} i--;
				if(i===0)            { obj.bx=2*k.qcols+1; obj.by=2*k.qrows+1; continue;} i--;
			}
		}
	},

	//---------------------------------------------------------------------------
	// bd.setcacheAll() 全てのCell, Cross, Borderオブジェクトの_cnum等をキャッシュする
	//---------------------------------------------------------------------------
	setcacheAll : function(){
		for(var id=0;id<this.bdmax;id++){
			var obj = this.border[id];

			obj.cellcc[0] = this.cnum(obj.bx-(obj.by&1), obj.by-(obj.bx&1));
			obj.cellcc[1] = this.cnum(obj.bx+(obj.by&1), obj.by+(obj.bx&1));

			obj.crosscc[0] = this.xnum(obj.bx-(obj.bx&1), obj.by-(obj.by&1));
			obj.crosscc[1] = this.xnum(obj.bx+(obj.bx&1), obj.by+(obj.by&1));
		}
	},

	//---------------------------------------------------------------------------
	// bd.setcoordAll() 全てのCell, Cross, BorderオブジェクトのsetcoordCell()等を呼び出す
	// bd.setminmax()   盤面のbx,byの最小値/最大値をセットする
	// bd.isinside()    指定された(bx,by)が盤面内かどうか判断する
	//---------------------------------------------------------------------------
	setcoordAll : function(){
		var x0=k.p0.x, y0=k.p0.y;
		{
			for(var id=0;id<this.cellmax;id++){
				var obj = this.cell[id];
				obj.px = x0 + (obj.bx-1)*k.bwidth;
				obj.py = y0 + (obj.by-1)*k.bheight;
				obj.cpx = x0 + obj.bx*k.bwidth;
				obj.cpy = y0 + obj.by*k.bheight;
			}
		}
		if(!!k.iscross){
			for(var id=0;id<this.crossmax;id++){
				var obj = this.cross[id];
				obj.px = x0 + obj.bx*k.bwidth;
				obj.py = y0 + obj.by*k.bheight;
			}
		}
		if(!!k.isborder){
			for(var id=0;id<this.bdmax;id++){
				var obj = this.border[id];
				obj.px = x0 + obj.bx*k.bwidth;
				obj.py = y0 + obj.by*k.bheight;
			}
		}
		if(!!k.isexcell){
			for(var id=0;id<this.excellmax;id++){
				var obj = this.excell[id];
				obj.px = x0 + (obj.bx-1)*k.bwidth;
				obj.py = y0 + (obj.by-1)*k.bheight;
			}
		}
	},

	setminmax : function(){
		var extUL = (k.isexcell===1 || k.isexcell===2);
		var extDR = (k.isexcell===2);
		this.minbx = (!extUL ? 0 : -2);
		this.minby = (!extUL ? 0 : -2);
		this.maxbx = (!extDR ? 2*k.qcols : 2*k.qcols+2);
		this.maxby = (!extDR ? 2*k.qrows : 2*k.qrows+2);

		tc.adjust();
	},
	isinside : function(bx,by){
		return (bx>=this.minbx && bx<=this.maxbx && by>=this.minby && by<=this.maxby);
	},

	//---------------------------------------------------------------------------
	// bd.allclear() 全てのCell, Cross, Borderオブジェクトのallclear()を呼び出す
	// bd.ansclear() 全てのCell, Cross, Borderオブジェクトのansclear()を呼び出す
	// bd.subclear() 全てのCell, Cross, Borderオブジェクトのsubclear()を呼び出す
	// bd.errclear() 全てのCell, Cross, Borderオブジェクトのerrorプロパティを0にして、Canvasを再描画する
	//---------------------------------------------------------------------------
	// 呼び出し元：this.initBoardSize()
	allclear : function(isrec){
		for(var i=0;i<this.cellmax  ;i++){ this.cell[i].allclear(i,isrec);}
		for(var i=0;i<this.crossmax ;i++){ this.cross[i].allclear(i,isrec);}
		for(var i=0;i<this.bdmax    ;i++){ this.border[i].allclear(i,isrec);}
		for(var i=0;i<this.excellmax;i++){ this.excell[i].allclear(i,isrec);}
	},
	// 呼び出し元：回答消去ボタン押した時
	ansclear : function(){
		for(var i=0;i<this.cellmax  ;i++){ this.cell[i].ansclear(i);}
		for(var i=0;i<this.crossmax ;i++){ this.cross[i].ansclear(i);}
		for(var i=0;i<this.bdmax    ;i++){ this.border[i].ansclear(i);}
		for(var i=0;i<this.excellmax;i++){ this.excell[i].ansclear(i);}
	},
	// 呼び出し元：補助消去ボタン押した時
	subclear : function(){
		for(var i=0;i<this.cellmax  ;i++){ this.cell[i].subclear(i);}
		for(var i=0;i<this.crossmax ;i++){ this.cross[i].subclear(i);}
		for(var i=0;i<this.bdmax    ;i++){ this.border[i].subclear(i);}
		for(var i=0;i<this.excellmax;i++){ this.excell[i].subclear(i);}
	},

	errclear : function(isrepaint){
		if(!ans.errDisp){ return;}

		for(var i=0;i<this.cellmax  ;i++){ this.cell[i].error=0;}
		for(var i=0;i<this.crossmax ;i++){ this.cross[i].error=0;}
		for(var i=0;i<this.bdmax    ;i++){ this.border[i].error=0;}
		for(var i=0;i<this.excellmax;i++){ this.excell[i].error=0;}

		ans.errDisp = false;
		if(isrepaint!==false){ pc.paintAll();}
	},

	//---------------------------------------------------------------------------
	// bd.idnum()  (X,Y)の位置にあるオブジェクトのIDを返す
	//---------------------------------------------------------------------------
	idnum : function(type,bx,by,qc,qr){
		if     (type===k.CELL)  { return this.cnum(bx,by,qc,qr);}
		else if(type===k.CROSS) { return this.xnum(bx,by,qc,qr);}
		else if(type===k.BORDER){ return this.bnum(bx,by,qc,qr);}
		else if(type===k.EXCELL){ return this.exnum(bx,by,qc,qr);}
		return null;
	},

	//---------------------------------------------------------------------------
	// bd.cnum()  (X,Y)の位置にあるCellのIDを、盤面の大きさを(qc×qr)で計算して返す
	// bd.xnum()  (X,Y)の位置にあるCrossのIDを、盤面の大きさを(qc×qr)で計算して返す
	// bd.bnum()  (X,Y)の位置にあるBorderのIDを、盤面の大きさを(qc×qr)で計算して返す
	// bd.exnum() (X,Y)の位置にあるextendCellのIDを、盤面の大きさを(qc×qr)で計算して返す
	//---------------------------------------------------------------------------
	cnum : function(bx,by,qc,qr){
		if(qc===(void 0)){ qc=k.qcols; qr=k.qrows;}
		if((bx<0||bx>(qc<<1)||by<0||by>(qr<<1))||(!(bx&1))||(!(by&1))){ return null;}
		return (bx>>1)+(by>>1)*qc;
	},
	xnum : function(bx,by,qc,qr){
		if(qc===(void 0)){ qc=k.qcols; qr=k.qrows;}
		if((bx<0||bx>(qc<<1)||by<0||by>(qr<<1))||(!!(bx&1))||(!!(by&1))){ return null;}
		return (bx>>1)+(by>>1)*(qc+1);
	},
	bnum : function(bx,by,qc,qr){
		if(qc===(void 0)){ qc=k.qcols; qr=k.qrows;}
		if(bx>=1&&bx<=2*qc-1&&by>=1&&by<=2*qr-1){
			if     (!(bx&1) &&  (by&1)){ return ((bx>>1)-1)+(by>>1)*(qc-1);}
			else if( (bx&1) && !(by&1)){ return (bx>>1)+((by>>1)-1)*qc+(qc-1)*qr;}
		}
		else if(k.isborder==2){
			if     (by===0   &&(bx&1)&&(bx>=1&&bx<=2*qc-1)){ return (qc-1)*qr+qc*(qr-1)+(bx>>1);}
			else if(by===2*qr&&(bx&1)&&(bx>=1&&bx<=2*qc-1)){ return (qc-1)*qr+qc*(qr-1)+qc+(bx>>1);}
			else if(bx===0   &&(by&1)&&(by>=1&&by<=2*qr-1)){ return (qc-1)*qr+qc*(qr-1)+2*qc+(by>>1);}
			else if(bx===2*qc&&(by&1)&&(by>=1&&by<=2*qr-1)){ return (qc-1)*qr+qc*(qr-1)+2*qc+qr+(by>>1);}
		}
		return null;
	},
	exnum : function(bx,by,qc,qr){
		if(qc===(void 0)){ qc=k.qcols; qr=k.qrows;}
		if(k.isexcell===1){
			if(bx===-1&&by===-1){ return qc+qr;}
			else if(by===-1&&bx>0&&bx<2*qc){ return (bx>>1);}
			else if(bx===-1&&by>0&&by<2*qr){ return qc+(by>>1);}
		}
		else if(k.isexcell===2){
			if     (by===-1    &&bx>0&&bx<2*qc){ return (bx>>1);}
			else if(by===2*qr+1&&bx>0&&bx<2*qc){ return qc+(bx>>1);}
			else if(bx===-1    &&by>0&&by<2*qr){ return 2*qc+(by>>1);}
			else if(bx===2*qc+1&&by>0&&by<2*qr){ return 2*qc+qr+(by>>1);}
			else if(bx===-1    &&by===-1    ){ return 2*qc+2*qr;}
			else if(bx===2*qc+1&&by===-1    ){ return 2*qc+2*qr+1;}
			else if(bx===-1    &&by===2*qr+1){ return 2*qc+2*qr+2;}
			else if(bx===2*qc+1&&by===2*qr+1){ return 2*qc+2*qr+3;}
		}
		return null;
	},

	//---------------------------------------------------------------------------
	// bd.objectinside() 座標(x1,y1)-(x2,y2)に含まれるオブジェクトのIDリストを取得する
	//---------------------------------------------------------------------------
	objectinside : function(type,x1,y1,x2,y2){
		if     (type===k.CELL)  { return this.cellinside  (x1,y1,x2,y2);}
		else if(type===k.CROSS) { return this.crossinside (x1,y1,x2,y2);}
		else if(type===k.BORDER){ return this.borderinside(x1,y1,x2,y2);}
		else if(type===k.EXCELL){ return this.excellinside(x1,y1,x2,y2);}
		return [];
	},

	//---------------------------------------------------------------------------
	// bd.cellinside()   座標(x1,y1)-(x2,y2)に含まれるCellのIDリストを取得する
	// bd.crossinside()  座標(x1,y1)-(x2,y2)に含まれるCrossのIDリストを取得する
	// bd.borderinside() 座標(x1,y1)-(x2,y2)に含まれるBorderのIDリストを取得する
	// bd.excellinside() 座標(x1,y1)-(x2,y2)に含まれるExcellのIDリストを取得する
	//---------------------------------------------------------------------------
	cellinside : function(x1,y1,x2,y2){
		var clist = [];
		for(var by=(y1|1);by<=y2;by+=2){ for(var bx=(x1|1);bx<=x2;bx+=2){
			var c = this.cnum(bx,by);
			if(c!==null){ clist.push(c);}
		}}
		return clist;
	},
	crossinside : function(x1,y1,x2,y2){
		var clist = [];
		for(var by=y1+(y1&1);by<=y2;by+=2){ for(var bx=x1+(x1&1);bx<=x2;bx+=2){
			var c = this.xnum(bx,by);
			if(c!==null){ clist.push(c);}
		}}
		return clist;
	},
	borderinside : function(x1,y1,x2,y2){
		var idlist = [];
		for(var by=y1;by<=y2;by++){ for(var bx=x1;bx<=x2;bx++){
			if(bx&1===by&1){ continue;}
			var id = this.bnum(bx,by);
			if(id!==null){ idlist.push(id);}
		}}
		return idlist;
	},
	excellinside : function(x1,y1,x2,y2){
		var exlist = [];
		for(var by=(y1|1);by<=y2;by+=2){ for(var bx=(x1|1);bx<=x2;bx+=2){
			var c = this.exnum(bx,by);
			if(c!==null){ exlist.push(c);}
		}}
		return exlist;
	},

	//---------------------------------------------------------------------------
	// bd.up() bd.dn() bd.lt() bd.rt()  セルの上下左右に接するセルのIDを返す
	//---------------------------------------------------------------------------
	up : function(cc){ return this.cell[cc]?this.cnum(this.cell[cc].bx  ,this.cell[cc].by-2):null;},	//上のセルのIDを求める
	dn : function(cc){ return this.cell[cc]?this.cnum(this.cell[cc].bx  ,this.cell[cc].by+2):null;},	//下のセルのIDを求める
	lt : function(cc){ return this.cell[cc]?this.cnum(this.cell[cc].bx-2,this.cell[cc].by  ):null;},	//左のセルのIDを求める
	rt : function(cc){ return this.cell[cc]?this.cnum(this.cell[cc].bx+2,this.cell[cc].by  ):null;},	//右のセルのIDを求める

	//---------------------------------------------------------------------------
	// bd.ub() bd.db() bd.lb() bd.rb()  セルの上下左右にある境界線のIDを返す
	//---------------------------------------------------------------------------
	ub : function(cc){ return this.cell[cc]?this.bnum(this.cell[cc].bx  ,this.cell[cc].by-1):null;},	//セルの上の境界線のIDを求める
	db : function(cc){ return this.cell[cc]?this.bnum(this.cell[cc].bx  ,this.cell[cc].by+1):null;},	//セルの下の境界線のIDを求める
	lb : function(cc){ return this.cell[cc]?this.bnum(this.cell[cc].bx-1,this.cell[cc].by  ):null;},	//セルの左の境界線のIDを求める
	rb : function(cc){ return this.cell[cc]?this.bnum(this.cell[cc].bx+1,this.cell[cc].by  ):null;},	//セルの右の境界線のIDを求める

	//---------------------------------------------------------------------------
	// bd.isLineEX() 線が必ず存在するborderの条件を判定する
	// bd.isLP***()  線が必ず存在するセルの条件を判定する
	// 
	// bd.isLineNG() 線が引けないborderの条件を判定する
	// bd.noLP***()  線が引けないセルの条件を判定する
	//---------------------------------------------------------------------------
	// bd.sQuC => bd.setCombinedLineから呼ばれる関数 (exist->ex)
	//  -> cellidの片方がnullになっていることを考慮していません
	isLineEX : function(id){
		var cc1 = bd.border[id].cellcc[0], cc2 = bd.border[id].cellcc[1];
		return bd.border[id].bx&1 ? (bd.isLP(cc1,k.DN) && bd.isLP(cc2,k.UP)) :
									(bd.isLP(cc1,k.RT) && bd.isLP(cc2,k.LT));
	},
	isLP : function(cc,dir){
		return !!this.isLPobj[dir][this.cell[cc].ques];
	},

	// bd.sLiB => bd.checkStableLineから呼ばれる関数
	//  -> cellidの片方がnullになっていることを考慮していません
	isLineNG : function(id){
		var cc1 = bd.border[id].cellcc[0], cc2 = bd.border[id].cellcc[1];
		return bd.border[id].bx&1 ? (bd.noLP(cc1,k.DN) || bd.noLP(cc2,k.UP)) :
									(bd.noLP(cc1,k.RT) || bd.noLP(cc2,k.LT));
	},
	// ans.checkenableLinePartsからnoLP()関数が直接呼ばれている
	noLP : function(cc,dir){
		return !!this.noLPobj[dir][this.cell[cc].ques];
	},

	//---------------------------------------------------------------------------
	// bd.checkStableLine() 線が引けない or 必ず存在する状態になっているか判定する
	// bd.setCombinedLine() 自分のセルの設定に応じて周りの線を設定する
	//---------------------------------------------------------------------------
	// [pipelink, loopsp], [barns, slalom, reflect, yajirin]で呼ばれる関数
	checkStableLine : function(id, num){	// bd.sLiBから呼ばれる
		if(this.enableLineCombined){
			return ( (num!==0 && this.isLineNG(id)) ||
					 (num===0 && this.isLineEX(id)) );
		}
		return (num!==0 && this.isLineNG(id));
	},
	setCombinedLine : function(cc){	// bd.sQuBから呼ばれる
		var bx=bd.cell[cc].bx, by=bd.cell[cc].by;
		var idlist = this.borderinside(bx-1,by-1,bx+1,by+1);
		for(var i=0;i<idlist.length;i++){
			var id=idlist[i];
			if        (this.border[id].line===0 && this.isLineEX(id)){ this.sLiB(id,1);}
			// 黒マスが入力されたら線を消すとかやりたい場合、↓のコメントアウトをはずす
			// else if(this.border[id].line!==0 && this.isLineNG(id)){ this.sLiB(id,0);}
		}
	},

	//---------------------------------------------------------------------------
	// bd.isLineStraight()   セルの上で線が直進しているか判定する
	//---------------------------------------------------------------------------
	isLineStraight : function(cc){
		if     (this.isLine(this.ub(cc)) && this.isLine(this.db(cc))){ return true;}
		else if(this.isLine(this.lb(cc)) && this.isLine(this.rb(cc))){ return true;}
		return false;
	},

	//---------------------------------------------------------------------------
	// bd.nummaxfunc() 入力できる数字の最大値を返す
	//---------------------------------------------------------------------------
	nummaxfunc : function(cc){
		return this.maxnum;
	},

	//---------------------------------------------------------------------------
	// sQuC / QuC : bd.setQuesCell() / bd.getQuesCell()  該当するCellのquesを設定する/返す
	// sQnC / QnC : bd.setQnumCell() / bd.getQnumCell()  該当するCellのqnumを設定する/返す
	// sQsC / QsC : bd.setQsubCell() / bd.getQsubCell()  該当するCellのqsubを設定する/返す
	// sAnC / AnC : bd.setQansCell() / bd.getQansCell()  該当するCellのanumを設定する/返す
	// sDiC / DiC : bd.setDirecCell()/ bd.getDirecCell() 該当するCellのqdirを設定する/返す
	//---------------------------------------------------------------------------
	// Cell関連Get/Set関数 <- 各Cellが持っているとメモリを激しく消費するのでここに置くこと.
	sQuC : function(id, num) {
		um.addOpe(k.CELL, k.QUES, id, this.cell[id].ques, num);
		this.cell[id].ques = num;

		if(this.enableLineCombined){ this.setCombinedLine(id);}
	},
	// overwrite by lightup.js and kakuro.js
	sQnC : function(id, num) {
		if(!k.dispzero && num===0){ return;}

		um.addOpe(k.CELL, k.QNUM, id, this.cell[id].qnum, num);
		this.cell[id].qnum = num;

		area.setCell('number',id);
	},
	sAnC : function(id, num) {
		if(!k.dispzero && num===0){ return;}

		um.addOpe(k.CELL, k.ANUM, id, this.cell[id].anum, num);
		this.cell[id].anum = num;

		area.setCell('number',id);
	},
	// override by lightup.js, shugaku.js
	sQaC : function(id, num) {
		um.addOpe(k.CELL, k.QANS, id, this.cell[id].qans, num);
		this.cell[id].qans = num;

		area.setCell('block',id);
	},
	sQsC : function(id, num) {
		um.addOpe(k.CELL, k.QSUB, id, this.cell[id].qsub, num);
		this.cell[id].qsub = num;

		if(k.NumberWithMB){ area.setCell('number',id);}
	},
	sDiC : function(id, num) {
		um.addOpe(k.CELL, k.QDIR, id, this.cell[id].qdir, num);
		this.cell[id].qdir = num;
	},

	QuC : function(id){ return this.cell[id].ques;},
	QnC : function(id){ return this.cell[id].qnum;},
	AnC : function(id){ return this.cell[id].anum;},
	QaC : function(id){ return this.cell[id].qans;},
	QsC : function(id){ return this.cell[id].qsub;},
	DiC : function(id){ return this.cell[id].qdir;},

	//---------------------------------------------------------------------------
	// sQnE / QnE : bd.setQnumEXcell() / bd.getQnumEXcell()  該当するEXCellのqnumを設定する/返す
	// sDiE / DiE : bd.setDirecEXcell()/ bd.getDirecEXcell() 該当するEXCellのqdirを設定する/返す
	//---------------------------------------------------------------------------
	// EXcell関連Get/Set関数
	sQnE : function(id, num) {
		um.addOpe(k.EXCELL, k.QNUM, id, this.excell[id].qnum, num);
		this.excell[id].qnum = num;
	},
	sDiE : function(id, num) {
		um.addOpe(k.EXCELL, k.QDIR, id, this.excell[id].qdir, num);
		this.excell[id].qdir = num;
	},

	QnE : function(id){ return this.excell[id].qnum;},
	DiE : function(id){ return this.excell[id].qdir;},

	//---------------------------------------------------------------------------
	// sQuX / QuX : bd.setQuesCross(id,num) / bd.getQuesCross() 該当するCrossのquesを設定する/返す
	// sQnX / QnX : bd.setQnumCross(id,num) / bd.getQnumCross() 該当するCrossのqnumを設定する/返す
	//---------------------------------------------------------------------------
	// Cross関連Get/Set関数 <- 各Crossが持っているとメモリを激しく消費するのでここに置くこと.
	sQuX : function(id, num) {
		um.addOpe(k.CROSS, k.QUES, id, this.cross[id].ques, num);
		this.cross[id].ques = num;
	},
	sQnX : function(id, num) {
		um.addOpe(k.CROSS, k.QNUM, id, this.cross[id].qnum, num);
		this.cross[id].qnum = num;
	},

	QuX : function(id){ return this.cross[id].ques;},
	QnX : function(id){ return this.cross[id].qnum;},

	//---------------------------------------------------------------------------
	// sQuB / QuB : bd.setQuesBorder() / bd.getQuesBorder() 該当するBorderのquesを設定する/返す
	// sQnB / QnB : bd.setQnumBorder() / bd.getQnumBorder() 該当するBorderのqnumを設定する/返す
	// sQaB / QaB : bd.setQansBorder() / bd.getQansBorder() 該当するBorderのqansを設定する/返す
	// sQsB / QsB : bd.setQsubBorder() / bd.getQsubBorder() 該当するBorderのqsubを設定する/返す
	// sLiB / LiB : bd.setLineBorder() / bd.getLineBorder() 該当するBorderのlineを設定する/返す
	//---------------------------------------------------------------------------
	// Border関連Get/Set関数 <- 各Borderが持っているとメモリを激しく消費するのでここに置くこと.
	sQuB : function(id, num) {
		um.addOpe(k.BORDER, k.QUES, id, this.border[id].ques, num);
		this.border[id].ques = num;

		area.setBorder(id,(num>0));
	},
	sQnB : function(id, num) {
		um.addOpe(k.BORDER, k.QNUM, id, this.border[id].qnum, num);
		this.border[id].qnum = num;
	},
	sQaB : function(id, num) {
		if(this.border[id].ques!==0){ return;}

		um.addOpe(k.BORDER, k.QANS, id, this.border[id].qans, num);
		this.border[id].qans = num;

		area.setBorder(id,(num>0));
	},
	sQsB : function(id, num) {
		um.addOpe(k.BORDER, k.QSUB, id, this.border[id].qsub, num);
		this.border[id].qsub = num;
	},
	sLiB : function(id, num) {
		if(this.enableLineNG && this.checkStableLine(id,num)){ return;}

		um.addOpe(k.BORDER, k.LINE, id, this.border[id].line, num);
		this.border[id].line = num;

		line.setLine(id,(num>0));
	},

	QuB : function(id){ return this.border[id].ques;},
	QnB : function(id){ return this.border[id].qnum;},
	QaB : function(id){ return this.border[id].qans;},
	QsB : function(id){ return this.border[id].qsub;},
	LiB : function(id){ return this.border[id].line;},

	//---------------------------------------------------------------------------
	// sErC / ErC : bd.setErrorCell()   / bd.getErrorCell()   該当するCellのerrorを設定する/返す
	// sErX / ErX : bd.setErrorCross()  / bd.getErrorCross()  該当するCrossのerrorを設定する/返す
	// sErB / ErB : bd.setErrorBorder() / bd.getErrorBorder() 該当するBorderのerrorを設定する/返す
	// sErE / ErE : bd.setErrorEXcell() / bd.getErrorEXcell() 該当するEXcellのerrorを設定する/返す
	// sErBAll() すべてのborderにエラー値を設定する
	//---------------------------------------------------------------------------
	// Get/SetError関数(setは配列で入力)
	sErC : function(idlist, num) {
		if(!ans.isenableSetError()){ return;}
		if(!idlist.push){ idlist = [idlist];}
		for(var i=0;i<idlist.length;i++){ if(!!this.cell[idlist[i]]){ this.cell[idlist[i]].error = num;} }
	},
	sErX : function(idlist, num) {
		if(!ans.isenableSetError()){ return;}
		if(!idlist.push){ idlist = [idlist];}
		for(var i=0;i<idlist.length;i++){ if(!!this.cross[idlist[i]]){ this.cross[idlist[i]].error = num;} }
	},
	sErB : function(idlist, num) {
		if(!ans.isenableSetError()){ return;}
		if(!idlist.push){ idlist = [idlist];}
		for(var i=0;i<idlist.length;i++){ if(!!this.border[idlist[i]]){ this.border[idlist[i]].error = num;} }
	},
	sErE : function(idlist, num) {
		if(!ans.isenableSetError()){ return;}
		if(!idlist.push){ idlist = [idlist];}
		for(var i=0;i<idlist.length;i++){ if(!!this.excell[idlist[i]]){ this.excell[idlist[i]].error = num;} }
	},
	sErBAll : function(num){
		if(!ans.isenableSetError()){ return;}
		for(var i=0;i<bd.bdmax;i++){ this.border[i].error = num;}
	},

	// ErC : function(id){ return (!!this.cell[id]  ?this.cell[id].error  :undef);},
	// ErX : function(id){ return (!!this.cross[id] ?this.cross[id].error :undef);},
	// ErB : function(id){ return (!!this.border[id]?this.border[id].error:undef);},
	// ErE : function(id){ return (!!this.excell[id]?this.excell[id].error:undef);},

	//---------------------------------------------------------------------------
	// bd.isBlack()   該当するCellが黒マスかどうか返す
	// bd.isWhite()   該当するCellが白マスかどうか返す
	// bd.setBlack()  該当するCellに黒マスをセットする
	// bd.setWhite()  該当するCellに白マスをセットする
	//---------------------------------------------------------------------------
	isBlack : function(c){ return (!!bd.cell[c] && bd.cell[c].qans===1);},
	isWhite : function(c){ return (!!bd.cell[c] && bd.cell[c].qans!==1);},

	setBlack : function(c){ this.sQaC(c, 1);},
	setWhite : function(c){ this.sQaC(c, 0);},

	//-----------------------------------------------------------------------
	// bd.isNum()      該当するCellに数字があるか返す
	// bd.noNum()      該当するCellに数字がないか返す
	// bd.isValidNum() 該当するCellに0以上の数字があるか返す
	// bd.sameNumber() ２つのCellに同じ有効な数字があるか返す
	//
	// bd.getNum()     該当するCellの数字を返す
	// bd.setNum()     該当するCellに数字を設定する
	//-----------------------------------------------------------------------
	isNum : function(c){
		return (!!bd.cell[c] && (bd.cell[c].qnum!==-1 || bd.cell[c].anum!==-1));
	},
	noNum : function(c){
		return (!bd.cell[c] || (bd.cell[c].qnum===-1 && bd.cell[c].anum===-1));
	},
	isValidNum : function(c){
		return (!!bd.cell[c] && (bd.cell[c].qnum>=0 ||(bd.cell[c].anum>=0 && bd.cell[c].qnum===-1)));
	},
	sameNumber : function(c1,c2){
		return (bd.isValidNum(c1) && (bd.getNum(c1)===bd.getNum(c2)));
	},

	getNum : function(c){
		return (bd.cell[c].qnum!==-1 ? bd.cell[c].qnum : bd.cell[c].anum);
	},
	setNum : function(c,val){
		if(!k.dispzero && val===0){ return;}
		var fl = this.numberAsObject;
		if(k.editmode){
			val = (((fl||val===-2) && this.cell[c].qnum===val)?-1:val);
			this.sQnC(c, val);
			if(k.isAnsNumber)  { this.sAnC(c,-1);}
			if(k.NumberIsWhite){ this.sQaC(c, 0);}
			if(k.isAnsNumber||pc.bcolor==="white"){ this.sQsC(c, 0);}
		}
		else if(this.cell[c].qnum===-1){
			var vala = ((val>-1 && !(fl && this.cell[c].anum=== val  ))? val  :-1);
			var vals = ((val<-1 && !(fl && this.cell[c].qsub===-val-1))?-val-1: 0);
			this.sAnC(c, vala);
			this.sQsC(c, vals);
			this.sDiC(c, 0);
		}
	},

	//-----------------------------------------------------------------------
	// bd.isLine()      該当するBorderにlineが引かれているか判定する
	// bd.setLine()     該当するBorderに線を引く
	// bd.removeLine()  該当するBorderから線を消す
	//-----------------------------------------------------------------------
	isLine     : function(id){ return (!!bd.border[id] && bd.border[id].line>0);},
	setLine    : function(id){ this.sLiB(id, 1); this.sQsB(id, 0);},
	setPeke    : function(id){ this.sLiB(id, 0); this.sQsB(id, 2);},
	removeLine : function(id){ this.sLiB(id, 0); this.sQsB(id, 0);},

	//---------------------------------------------------------------------------
	// bd.isBorder()     該当するBorderに境界線が引かれているか判定する
	// bd.setBorder()    該当するBorderに境界線を引く
	// bd.removeBorder() 該当するBorderから線を消す
	// bd.setBsub()      該当するBorderに境界線用の補助記号をつける
	// bd.removeBsub()   該当するBorderから境界線用の補助記号をはずす
	//---------------------------------------------------------------------------
	isBorder     : function(id){
		return (!!bd.border[id] && (bd.border[id].ques>0 || bd.border[id].qans>0));
	},
	setBorder    : function(id){
		if(k.editmode){ this.sQuB(id,1); this.sQaB(id,0);}
		else if(this.border[id].ques!==1){ this.sQaB(id,1);}
	},
	removeBorder : function(id){
		if(k.editmode){ this.sQuB(id,0); this.sQaB(id,0);}
		else if(this.border[id].ques!==1){ this.sQaB(id,0);}
	}
};

//---------------------------------------------------------------------------
// ★Graphicクラス Canvasに描画する
//---------------------------------------------------------------------------
// パズル共通 Canvas/DOM制御部
// Graphicクラスの定義
Graphic = function(){
	// 盤面のCellを分ける色
	this.gridcolor = "black";

	// セルの色(黒マス)
	this.cellcolor = "black";
	this.errcolor1 = "rgb(224, 0, 0)";
	this.errcolor2 = "rgb(64, 64, 255)";
	this.errcolor3 = "rgb(0, 191, 0)";

	// セルの丸数字の中に書く色
	this.circledcolor = "white";

	// セルの○×の色(補助記号)
	this.mbcolor = "rgb(255, 160, 127)";

	this.qsubcolor1 = "rgb(160,255,160)";
	this.qsubcolor2 = "rgb(255,255,127)";
	this.qsubcolor3 = "rgb(192,192,192)";	// 絵が出るパズルの背景入力

	// フォントの色(白マス/黒マス)
	this.fontcolor = "black";
	this.fontAnscolor = "rgb(0, 160, 0)";
	this.fontErrcolor = "rgb(191, 0, 0)";
	this.fontBCellcolor = "rgb(224, 224, 224)";

	this.borderfontcolor = "black";

	// セルの背景色(白マス)
	this.bcolor = "white";
	this.dotcolor = "black";
	this.errbcolor1 = "rgb(255, 160, 160)";
	this.errbcolor2 = "rgb(64, 255, 64)";

	this.icecolor = "rgb(192, 224, 255)";

	// ques=51のとき、入力できる場所の背景色(TargetTriangle)
	this.ttcolor = "rgb(127,255,127)";

	// 境界線の色
	this.borderQuescolor = "black";
	this.borderQanscolor = "rgb(0, 191, 0)";
	this.borderQsubcolor = "rgb(255, 0, 255)";

	this.errborderQanscolor2 = "rgb(160, 160, 160)";

	this.bbcolor = "rgb(96, 96, 96)"; // 境界線と黒マスを分ける色(BoxBorder)

	// 線・×の色
	this.linecolor = "rgb(0, 160, 0)";	// 色分けなしの場合
	this.pekecolor = "rgb(32, 32, 255)";

	this.errlinecolor1 = "rgb(255, 0, 0)";
	this.errlinecolor2 = "rgb(160, 160, 160)";

	// 入力ターゲットの色
	this.targetColor1 = "rgb(255, 64,  64)";
	this.targetColor3 = "rgb(64,  64, 255)";

	// 盤面(枠の中)の背景色
	this.bgcolor = '';

	// 色々なパズルで定義してた固定色
	this.gridcolor_BLACK  = "black";
	this.gridcolor_LIGHT  = "rgb(127, 127, 127)";	/* ほとんどはこの色を指定している */
	this.gridcolor_DLIGHT = "rgb(160, 160, 160)";	/* 領域分割系で使ってることが多い */
	this.gridcolor_SLIGHT = "rgb(191, 191, 191)";	/* 部屋＋線を引くパズル           */
	this.gridcolor_THIN   = "rgb(224, 224, 224)";	/* 問題入力時のみGrid表示のパズル */

	this.bcolor_GREEN  = "rgb(160, 255, 160)";
	this.dotcolor_PINK = "rgb(255, 96, 191)";
	this.errbcolor1_DARK = "rgb(255, 127, 127)";
	this.linecolor_LIGHT = "rgb(0, 192, 0)";

	// その他
	this.fontsizeratio = 1.0;	// 数字Fontサイズの倍率
	this.crosssize = 0.4;
	this.circleratio = [0.40, 0.34];

	// 描画単位
	this.cw = k.cwidth;
	this.ch = k.cheight;
	this.bw = k.bwidth;
	this.bh = k.bheight;

	this.lw = 1;		// LineWidth 境界線・Lineの太さ
	this.lm = 1;		// LineMargin
	this.lwratio = 12;	// onresize_processでlwの値の算出に用いる
	this.addlw = 0;		// エラー時に線の太さを広げる

	this.bdheader = "b_bd";	// drawBorder1で使うheader

	this.chassisflag = true;	// false: Gridを外枠の位置にも描画する

	this.lastHdeg = 0;
	this.lastYdeg = 0;
	this.minYdeg = 0.18;
	this.maxYdeg = 0.70;

	this.zidx = 1;
	this.zidx_array=[];

	this.EL_NUMOBJ = ee.addTemplate('numobj_parent', 'div', {className:'divnum', unselectable:'on'}, null, null);
	this.EL_IMGOBJ = ee.addTemplate('numobj_parent', 'img', {className:'imgnum', unselectable:'on'}, null, null);

	this.numobj = {};					// エレメントへの参照を保持する
	this.fillTextPrecisely  = false;	// 数字をg.fillText()で描画

	this.isdrawBC = false;
	this.isdrawBD = false;

	/* vnop関数用 */
	this.STROKE      = 0;
	this.FILL        = 1;
	this.FILL_STROKE = 2;
	this.NONE        = 3;
	this.vnop_FILL   = [false,true,true,false];
	this.vnop_STROKE = [true,false,true,false];
};
Graphic.prototype = {
	//---------------------------------------------------------------------------
	// pc.onresize_process() resize時にサイズを変更する
	//---------------------------------------------------------------------------
	onresize_process : function(){
		this.cw = k.cwidth;
		this.ch = k.cheight;

		this.bw = k.bwidth;
		this.bh = k.bheight;

		this.lw = Math.max(k.cwidth/this.lwratio, 3);
		this.lm = (this.lw-1)/2;
	},
	//---------------------------------------------------------------------------
	// pc.prepaint()    paint関数を呼び出す
	// pc.paint()       座標(x1,y1)-(x2,y2)を再描画する。各パズルのファイルでオーバーライドされる。
	//
	// pc.paintAll()    全体を再描画する
	// pc.paintRange()  座標(x1,y1)-(x2,y2)を再描画する。
	// pc.paintPos()    指定された(X,Y)を再描画する
	//
	// pc.paintCell()   指定されたCellを再描画する
	// pc.paintCellAround() 指定されたCellの周りを含めて再描画する
	// pc.paintCross()  指定されたCrossを再描画する
	// pc.paintBorder() 指定されたBorderの周りを再描画する
	// pc.paintLine()   指定されたLineの周りを再描画する
	// pc.paintEXcell() 指定されたEXCellを再描画する
	//---------------------------------------------------------------------------
	paint : function(x1,y1,x2,y2){ }, //オーバーライド用

	prepaint : function(x1,y1,x2,y2){
		this.flushCanvas(x1,y1,x2,y2);
	//	this.flushCanvasAll();

		this.paint(x1,y1,x2,y2);
	},

	paintAll : function(){
		this.prepaint(-1,-1,2*k.qcols+1,2*k.qrows+1);
	},
	paintRange : function(x1,y1,x2,y2){
		this.prepaint(x1,y1,x2,y2);
	},
	paintPos : function(pos){
		this.prepaint(pos.x-1, pos.y-1, pos.x+1, pos.y+1);
	},

	paintCell : function(cc){
		if(isNaN(cc) || !bd.cell[cc]){ return;}
		this.prepaint(bd.cell[cc].bx-1, bd.cell[cc].by-1, bd.cell[cc].bx+1, bd.cell[cc].by+1);
	},
	paintCellAround : function(cc){
		if(isNaN(cc) || !bd.cell[cc]){ return;}
		this.prepaint(bd.cell[cc].bx-3, bd.cell[cc].by-3, bd.cell[cc].bx+3, bd.cell[cc].by+3);
	},
	paintCross : function(cc){
		if(isNaN(cc) || !bd.cross[cc]){ return;}
		this.prepaint(bd.cross[cc].bx-1, bd.cross[cc].by-1, bd.cross[cc].bx+1, bd.cross[cc].by+1);
	},
	paintBorder : function(id){
		if(isNaN(id) || !bd.border[id]){ return;}
		if(bd.border[id].bx&1){
			this.prepaint(bd.border[id].bx-2, bd.border[id].by-1, bd.border[id].bx+2, bd.border[id].by+1);
		}
		else{
			this.prepaint(bd.border[id].bx-1, bd.border[id].by-2, bd.border[id].bx+1, bd.border[id].by+2);
		}
	},
	paintLine : function(id){
		if(isNaN(id) || !bd.border[id]){ return;}
		if(bd.border[id].bx&1){
			this.prepaint(bd.border[id].bx-1, bd.border[id].by-2, bd.border[id].bx+1, bd.border[id].by+2);
		}
		else{
			this.prepaint(bd.border[id].bx-2, bd.border[id].by-1, bd.border[id].bx+2, bd.border[id].by+1);
		}
	},
	paintEXcell : function(ec){
		if(isNaN(ec) || !bd.excell[ec]){ return;}
		this.prepaint(bd.excell[ec].bx-1, bd.excell[ec].by-1, bd.excell[ec].bx+1, bd.excell[ec].by+1);
	},

	//---------------------------------------------------------------------------
	// pc.getNewLineColor() 新しい色を返す
	//---------------------------------------------------------------------------
	getNewLineColor : function(){
		var loopcount = 0;

		while(1){
			var Rdeg = ((Math.random() * 384)|0)-64; if(Rdeg<0){Rdeg=0;} if(Rdeg>255){Rdeg=255;}
			var Gdeg = ((Math.random() * 384)|0)-64; if(Gdeg<0){Gdeg=0;} if(Gdeg>255){Gdeg=255;}
			var Bdeg = ((Math.random() * 384)|0)-64; if(Bdeg<0){Bdeg=0;} if(Bdeg>255){Bdeg=255;}

			// HLSの各組成値を求める
			var Cmax = Math.max(Rdeg,Math.max(Gdeg,Bdeg));
			var Cmin = Math.min(Rdeg,Math.min(Gdeg,Bdeg));

			var Hdeg = 0;
			var Ldeg = (Cmax+Cmin)*0.5 / 255;
			var Sdeg = (Cmax===Cmin?0:(Cmax-Cmin)/((Ldeg<=0.5)?(Cmax+Cmin):(2*255-Cmax-Cmin)) );

			if(Cmax==Cmin){ Hdeg = 0;}
			else if(Rdeg>=Gdeg && Rdeg>=Bdeg){ Hdeg = (    60*(Gdeg-Bdeg)/(Cmax-Cmin)+360)%360;}
			else if(Gdeg>=Rdeg && Gdeg>=Bdeg){ Hdeg = (120+60*(Bdeg-Rdeg)/(Cmax-Cmin)+360)%360;}
			else if(Bdeg>=Gdeg && Bdeg>=Rdeg){ Hdeg = (240+60*(Rdeg-Gdeg)/(Cmax-Cmin)+360)%360;}

			// YCbCrのYを求める
			var Ydeg = (0.29891*Rdeg + 0.58661*Gdeg + 0.11448*Bdeg) / 255;

			if( (this.minYdeg<Ydeg && Ydeg<this.maxYdeg) && (Math.abs(this.lastYdeg-Ydeg)>0.15) && (Sdeg<0.02 || 0.40<Sdeg)
				 && (((360+this.lastHdeg-Hdeg)%360>=45)&&((360+this.lastHdeg-Hdeg)%360<=315)) ){
				this.lastHdeg = Hdeg;
				this.lastYdeg = Ydeg;
				//alert("rgb("+Rdeg+", "+Gdeg+", "+Bdeg+")\nHLS("+(Hdeg|0)+", "+(""+((Ldeg*1000)|0)*0.001).slice(0,5)+", "+(""+((Sdeg*1000|0))*0.001).slice(0,5)+")\nY("+(""+((Ydeg*1000)|0)*0.001).slice(0,5)+")");
				return "rgb("+Rdeg+","+Gdeg+","+Bdeg+")";
			}

			loopcount++;
			if(loopcount>100){ return "rgb("+Rdeg+","+Gdeg+","+Bdeg+")";}
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawBlackCells() Cellの、境界線の上から描画される■黒マスをCanvasに書き込む
	// pc.setCellColor()   前景色の設定・描画判定する
	// pc.setCellColorFunc()   pc.setCellColor関数を設定する
	//
	// pc.drawBGCells()    Cellの、境界線の下に描画される背景色をCanvasに書き込む
	// pc.setBGCellColor() 背景色の設定・描画判定する
	// pc.setBGCellColorFunc() pc.setBGCellColor関数を設定する
	//---------------------------------------------------------------------------
	// err==2になるlitsは、drawBGCellsで描画してます。。
	drawBlackCells : function(x1,y1,x2,y2){
		this.vinc('cell_front', 'crispEdges');
		var header = "c_fullb_";

		if(g.use.canvas && this.isdrawBC && !this.isdrawBD){ x1--; y1--; x2++; y2++;}
		var clist = bd.cellinside(x1,y1,x2,y2);
		for(var i=0;i<clist.length;i++){
			var c = clist[i];
			if(this.setCellColor(c)){
				if(this.vnop(header+c,this.FILL)){
					g.fillRect(bd.cell[c].px, bd.cell[c].py, this.cw+1, this.ch+1);
				}
			}
			else{ this.vhide(header+c); continue;}
		}
		this.isdrawBC = true;
	},
	// 'qans'用
	setCellColor : function(c){
		var err = bd.cell[c].error;
		if(bd.cell[c].qans!==1){ return false;}
		else if(err===0){ g.fillStyle = this.cellcolor; return true;}
		else if(err===1){ g.fillStyle = this.errcolor1; return true;}
		return false;
	},
	setCellColorFunc : function(type){
		switch(type){
		case 'qnum':
			this.setCellColor = function(c){
				var err = bd.cell[c].error;
				if(bd.cell[c].qnum===-1){ return false;}
				else if(err===0){ g.fillStyle = this.cellcolor; return true;}
				else if(err===1){ g.fillStyle = this.errcolor1; return true;}
				return false;
			};
			break;
		default:
			break;
		}
	},

	drawBGCells : function(x1,y1,x2,y2){
		this.vinc('cell_back', 'crispEdges');
		var header = "c_full_";
		var clist = bd.cellinside(x1,y1,x2,y2);
		for(var i=0;i<clist.length;i++){
			var c = clist[i];
			if(this.setBGCellColor(c)){
				if(this.vnop(header+c,this.FILL)){
					g.fillRect(bd.cell[c].px, bd.cell[c].py, this.cw, this.ch);
				}
			}
			else{ this.vhide(header+c); continue;}
		}
	},
	// 'error1'用
	setBGCellColor : function(c){
		if(bd.cell[c].error===1){ g.fillStyle = this.errbcolor1; return true;}
		return false;
	},
	setBGCellColorFunc : function(type){
		switch(type){
		case 'error2':
			this.setBGCellColor = function(c){
				var cell = bd.cell[c];
				if     (cell.error===1){ g.fillStyle = this.errbcolor1; return true;}
				else if(cell.error===2){ g.fillStyle = this.errbcolor2; return true;}
				return false;
			}
			break;
		case 'qans1':
			this.setBGCellColor = function(c){
				var cell = bd.cell[c];
				if(cell.qans===1){
					g.fillStyle = (cell.error===1 ? this.errcolor1 : this.cellcolor);
					return true;
				}
				if     (cell.error===1){ g.fillStyle = this.errbcolor1; return true;}
				else if(cell.qsub ===1 && this.bcolor!=="white"){ g.fillStyle = this.bcolor; return true;}
				return false;
			};
			break;
		case 'qans2':
			this.setBGCellColor = function(c){
				var cell = bd.cell[c];
				if(cell.qans===1){
					if     (cell.error===0){ g.fillStyle = this.cellcolor;}
					else if(cell.error===1){ g.fillStyle = this.errcolor1;}
					else if(cell.error===2){ g.fillStyle = this.errcolor2;}
					return true;
				}
				if     (cell.error===1){ g.fillStyle = this.errbcolor1; return true;}
				else if(cell.qsub ===1 && this.bcolor!=="white"){ g.fillStyle = this.bcolor; return true;}
				return false;
			};
			break;
		case 'qsub1':
			this.setBGCellColor = function(c){
				var cell = bd.cell[c];
				if     (cell.error===1){ g.fillStyle = this.errbcolor1; return true;}
				else if(cell.qsub ===1){ g.fillStyle = this.bcolor;     return true;}
				return false;
			};
			break;
		case 'qsub2':
			this.setBGCellColor = function(c){
				var cell = bd.cell[c];
				if     (cell.error===1){ g.fillStyle = this.errbcolor1; return true;}
				else if(cell.qsub ===1){ g.fillStyle = this.qsubcolor1; return true;}
				else if(cell.qsub ===2){ g.fillStyle = this.qsubcolor2; return true;}
				return false;
			};
			break;
		case 'qsub3':
			this.setBGCellColor = function(c){
				var cell = bd.cell[c];
				if     (cell.error===1){ g.fillStyle = this.errbcolor1; return true;}
				else if(cell.qsub ===1){ g.fillStyle = this.qsubcolor1; return true;}
				else if(cell.qsub ===2){ g.fillStyle = this.qsubcolor2; return true;}
				else if(cell.qsub ===3){ g.fillStyle = this.qsubcolor3; return true;}
				return false;
			};
			break;
		case 'icebarn':
			this.setBGCellColor = function(c){
				var cell = bd.cell[c];
				if     (cell.error===1){ g.fillStyle = this.errbcolor1; return true;}
				else if(cell.ques ===6){ g.fillStyle = this.icecolor;   return true;}
				return false;
			};
			break;
		default:
			break;
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawBGEXcells()    EXCellに描画される背景色をCanvasに書き込む
	// pc.setBGEXcellColor() 背景色の設定・描画判定する
	//---------------------------------------------------------------------------
	drawBGEXcells : function(x1,y1,x2,y2){
		this.vinc('excell_back', 'crispEdges');

		var header = "ex_full_";
		var exlist = bd.excellinside(x1-1,y1-1,x2,y2);
		for(var i=0;i<exlist.length;i++){
			var c = exlist[i];
			if(this.setBGEXcellColor(c)){
				if(this.vnop(header+c,this.FILL)){
					g.fillRect(bd.excell[c].px+1, bd.excell[c].py+1, this.cw-1, this.ch-1);
				}
			}
			else{ this.vhide(header+c); continue;}
		}
	},
	setBGEXcellColor : function(c){
		if(bd.excell[c].error===1){ g.fillStyle = this.errbcolor1; return true;}
		return false;
	},

	//---------------------------------------------------------------------------
	// pc.drawDotCells()  ・だけをCanvasに書き込む
	//---------------------------------------------------------------------------
	drawDotCells : function(x1,y1,x2,y2,isrect){
		this.vinc('cell_dot', (isrect ? 'crispEdges' : 'auto'));

		var dsize = Math.max(this.cw*(isrect?0.075:0.06), 2);
		var header = "c_dot_";
		g.fillStyle = this.dotcolor;

		var clist = bd.cellinside(x1,y1,x2,y2);
		for(var i=0;i<clist.length;i++){
			var c = clist[i];
			if(bd.cell[c].qsub===1){
				if(this.vnop(header+c,this.NONE)){
					if(isrect){ g.fillRect(bd.cell[c].cpx-dsize, bd.cell[c].cpy-dsize, dsize*2, dsize*2);}
					else      { g.fillCircle(bd.cell[c].cpx, bd.cell[c].cpy, dsize);}
				}
			}
			else{ this.vhide(header+c);}
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawNumbers()  Cellの数字をCanvasに書き込む
	// pc.drawNumber1()  Cellに数字を記入するためdispnum関数を呼び出す
	// pc.getCellNumberColor()  Cellの数字の色を設定する
	// 
	// pc.drawArrowNumbers() Cellの数字と矢印をCanvasに書き込む
	// pc.drawHatenas()     ques===-2の時に？をCanvasに書き込む
	//---------------------------------------------------------------------------
	drawNumbers : function(x1,y1,x2,y2){
		this.vinc('cell_number', 'auto');

		var clist = bd.cellinside(x1,y1,x2,y2);
		for(var i=0;i<clist.length;i++){ this.drawNumber1(clist[i]);}
	},
	drawNumber1 : function(c){
		var obj = bd.cell[c], key = ['cell',c].join('_'), num = bd.getNum(c);
		if(num>0 || (k.dispzero && num===0) || (k.isDispHatena && num===-2)){
			var text      = (num>=0 ? ""+num : "?");
			var fontratio = (num<10?0.8:(num<100?0.7:0.55));
			var color     = this.getCellNumberColor(c);
			this.dispnum(key, 1, text, fontratio, color, obj.cpx, obj.cpy);
		}
		else{ this.hideEL(key);}
	},
	getCellNumberColor : function(c){
		var obj = bd.cell[c], color = this.fontcolor;
		if(!k.isAnsNumber && ((k.BlackCell && obj.qans===1) || (!k.BlackCell && obj.ques!==0))){
			color = this.fontBCellcolor;
		}
		else if(obj.error===1 || obj.error===4){
			color = this.fontErrcolor;
		}
		else if(k.isAnsNumber && obj.qnum===-1){
			color = this.fontAnscolor;
		}
		return color;
	},

	drawArrowNumbers : function(x1,y1,x2,y2){
		this.vinc('cell_arrownumber', 'auto');

		var headers = ["c_ar1_", "c_dt1_", "c_dt2_", "c_ar3_", "c_dt3_", "c_dt4_"];
		var ll = this.cw*0.7;				//LineLength
		var ls = (this.cw-ll)/2;			//LineStart
		var lw = Math.max(this.cw/24, 1);	//LineWidth
		var lm = lw/2;						//LineMargin

		if(g.use.canvas && this.isdrawBC && !this.isdrawBD){ x1--; y1--; x2++; y2++;}
		var clist = bd.cellinside(x1,y1,x2,y2);
		for(var i=0;i<clist.length;i++){
			var c = clist[i];

			if(bd.cell[c].qnum!==-1 && (bd.cell[c].qnum!==-2||k.isDispHatena)){
				var ax=px=bd.cell[c].px, ay=py=bd.cell[c].py, dir = bd.cell[c].qdir;

				if     (bd.cell[c].qans ===1){ g.fillStyle = this.fontBCellcolor;}
				else if(bd.cell[c].error===1){ g.fillStyle = this.fontErrcolor;}
				else                         { g.fillStyle = this.fontcolor;}

				// 矢印の描画(上下向き)
				if(dir===k.UP||dir===k.DN){
					// 矢印の線の描画
					ax+=(this.cw-ls*1.5-lm); ay+=(ls+1);
					if(this.vnop(headers[0]+c,this.FILL)){ g.fillRect(ax, ay, lw, ll);}
					ax+=lw/2;

					// 矢じりの描画
					if(dir===k.UP){
						if(this.vnop(headers[1]+c,this.FILL)){
							g.setOffsetLinePath(ax,ay, 0,0, -ll/6,ll/3, ll/6,ll/3, true);
							g.fill();
						}
					}
					else{ this.vhide(headers[1]+c);}
					if(dir===k.DN){
						if(this.vnop(headers[2]+c,this.FILL)){
							g.setOffsetLinePath(ax,ay+ll, 0,0, -ll/6,-ll/3, ll/6,-ll/3, true);
							g.fill();
						}
					}
					else{ this.vhide(headers[2]+c);}
				}
				else{ this.vhide([headers[0]+c, headers[1]+c, headers[2]+c]);}

				// 矢印の描画(左右向き)
				if(dir===k.LT||dir===k.RT){
					// 矢印の線の描画
					ax+=(ls+1); ay+=(ls*1.5-lm);
					if(this.vnop(headers[3]+c,this.FILL)){ g.fillRect(ax, ay, ll, lw);}
					ay+=lw/2;

					// 矢じりの描画
					if(dir===k.LT){
						if(this.vnop(headers[4]+c,this.FILL)){
							g.setOffsetLinePath(ax,ay, 0,0, ll/3,-ll/6, ll/3,ll/6, true);
							g.fill();
						}
					}
					else{ this.vhide(headers[4]+c);}
					if(dir===k.RT){
						if(this.vnop(headers[5]+c,this.FILL)){
							g.setOffsetLinePath(ax+ll,ay, 0,0, -ll/3,-ll/6, -ll/3,ll/6, true);
							g.fill();
						}
					}
					else{ this.vhide(headers[5]+c);}
				}
				else{ this.vhide([headers[3]+c, headers[4]+c, headers[5]+c]);}

				// 数字の描画
				var num = bd.getNum(c), text = (num>=0 ? ""+num : "?");
				var fontratio = (num<10?0.8:(num<100?0.7:0.55));
				var color = g.fillStyle;

				var cpx = bd.cell[c].cpx, cpy = bd.cell[c].cpy;
				if     (dir===k.UP||dir===k.DN){ fontratio *= 0.85; cpx-=this.cw*0.1;}
				else if(dir===k.LT||dir===k.RT){ fontratio *= 0.85; cpy+=this.ch*0.1;}

				this.dispnum('cell_'+c, 1, text, fontratio, color, cpx, cpy);
			}
			else{
				this.vhide([headers[0]+c, headers[1]+c, headers[2]+c, headers[3]+c, headers[4]+c, headers[5]+c]);
				this.hideEL('cell_'+c);
			}
		}
	},
	drawHatenas : function(x1,y1,x2,y2){
		this.vinc('cell_number', 'auto');

		var clist = bd.cellinside(x1,y1,x2,y2);
		for(var i=0;i<clist.length;i++){
			var obj = bd.cell[clist[i]], key = 'cell_'+clist[i];
			if(obj.ques===-2||obj.qnum===-2){
				var color = (obj.error===1 ? this.fontErrcolor : this.fontcolor);
				this.dispnum(key, 1, "?", 0.8, color, obj.cpx, obj.cpy);
			}
			else{ this.hideEL(key);}
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawCrosses()    Crossの丸数字をCanvasに書き込む
	// pc.drawCrossMarks() Cross上の黒点をCanvasに書き込む
	//---------------------------------------------------------------------------
	drawCrosses : function(x1,y1,x2,y2){
		this.vinc('cross_base', 'auto');

		var csize = this.cw*this.crosssize+1;
		var header = "x_cp_";
		g.lineWidth = 1;

		var clist = bd.crossinside(x1,y1,x2,y2);
		for(var i=0;i<clist.length;i++){
			var c = clist[i], obj = bd.cross[c], key = ['cross',c].join('_');
			// ○の描画
			if(obj.qnum!==-1){
				g.fillStyle = (obj.error===1 ? this.errcolor1 : "white");
				g.strokeStyle = "black";
				if(this.vnop(header+c,this.FILL_STROKE)){
					g.shapeCircle(obj.px, obj.py, csize);
				}
			}
			else{ this.vhide([header+c]);}

			// 数字の描画
			if(obj.qnum>=0){
				this.dispnum(key, 1, ""+obj.qnum, 0.6, this.fontcolor, obj.px, obj.py);
			}
			else{ this.hideEL(key);}
		}
	},
	drawCrossMarks : function(x1,y1,x2,y2){
		this.vinc('cross_mark', 'auto');

		var csize = this.cw*this.crosssize;
		var header = "x_cm_";

		var clist = bd.crossinside(x1,y1,x2,y2);
		for(var i=0;i<clist.length;i++){
			var c = clist[i];
			if(bd.cross[c].qnum===1){
				g.fillStyle = (bd.cross[c].error===1 ? this.errcolor1 : this.cellcolor);
				if(this.vnop(header+c,this.FILL)){
					g.fillCircle(bd.cross[c].px, bd.cross[c].py, csize);
				}
			}
			else{ this.vhide(header+c);}
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawBorders()        境界線をCanvasに書き込む
	// pc.drawBorder1()        1カ所の境界線をCanvasに書き込む
	// pc.setBorderColor()     境界線の設定・描画判定する
	// pc.setBorderColorFunc() pc.setBorderColor関数を設定する
	//---------------------------------------------------------------------------
	drawBorders : function(x1,y1,x2,y2){
		this.vinc('border', 'crispEdges');

		var idlist = bd.borderinside(x1-1,y1-1,x2+1,y2+1);
		for(var i=0;i<idlist.length;i++){ this.drawBorder1(idlist[i]);}
		this.isdrawBD = true;
	},
	drawBorder1 : function(id){
		var vid = [this.bdheader, id].join("_");
		if(this.setBorderColor(id)){
			if(this.vnop(vid,this.FILL)){
				var lw = this.lw + this.addlw, lm = this.lm;
				var bx = bd.border[id].bx, by = bd.border[id].by;
				var px = bd.border[id].px, py = bd.border[id].py;
				if     (by&1){ g.fillRect(px-lm, py-this.bh-lm, lw, this.ch+lw);}
				else if(bx&1){ g.fillRect(px-this.bw-lm, py-lm, this.cw+lw, lw);}
			}
		}
		else{ this.vhide(vid);}
	},

	setBorderColor : function(id){
		if(bd.border[id].ques===1){ g.fillStyle = this.borderQuescolor; return true;}
		return false;
	},
	setBorderColorFunc : function(type){
		switch(type){
		case 'qans':
			this.setBorderColor = function(id){
				var err=bd.border[id].error;
				if(bd.isBorder(id)){
					if     (err===1){ g.fillStyle = this.errcolor1;          }
					else if(err===2){ g.fillStyle = this.errborderQanscolor2;}
					else            { g.fillStyle = this.borderQanscolor;    }
					return true;
				}
				return false;
			}
			break;
		case 'ice':
			this.setBorderColor = function(id){
				var cc1 = bd.border[id].cellcc[0], cc2 = bd.border[id].cellcc[1];
				if(cc1!==null && cc2!==null && (bd.cell[cc1].ques===6^bd.cell[cc2].ques===6)){
					g.fillStyle = this.cellcolor;
					return true;
				}
				return false;
			}
			break;
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawBorderQsubs() 境界線用の補助記号をCanvasに書き込む
	// pc.drawBoxBorders()  境界線と黒マスの間の線を描画する
	//---------------------------------------------------------------------------
	drawBorderQsubs : function(x1,y1,x2,y2){
		this.vinc('border_qsub', 'crispEdges');

		var m = this.cw*0.15; //Margin
		var header = "b_qsub1_";
		g.fillStyle = this.borderQsubcolor;

		var idlist = bd.borderinside(x1-1,y1-1,x2+1,y2+1);
		for(var i=0;i<idlist.length;i++){
			var id = idlist[i];
			if(bd.border[id].qsub===1){
				if(this.vnop(header+id,this.NONE)){
					if     (bd.border[id].bx&1){ g.fillRect(bd.border[id].px, bd.border[id].py-this.bh+m, 1, this.ch-2*m);}
					else if(bd.border[id].by&1){ g.fillRect(bd.border[id].px-this.bw+m, bd.border[id].py, this.cw-2*m, 1);}
				}
			}
			else{ this.vhide(header+id);}
		}
	},

	// 外枠がない場合は考慮していません
	drawBoxBorders  : function(x1,y1,x2,y2,tileflag){
		this.vinc('boxborder', 'crispEdges');

		var lw = this.lw, lm = this.lm;
		var cw = this.cw;
		var ch = this.ch;
		var chars = ['u','d','l','r'];

		g.fillStyle = this.bbcolor;

		var clist = bd.cellinside(x1,y1,x2,y2);
		for(var i=0;i<clist.length;i++){
			var c = clist[i], vids=[];
			for(var n=0;n<12;n++){ vids[n]=['c_bb',n,c].join('_');}
			if(bd.cell[c].qans!==1){ this.vhide(vids); continue;}

			var bx = bd.cell[c].bx, by = bd.cell[c].by;
			var px = bd.cell[c].px, py = bd.cell[c].py;
			var px1 = px+lm+1, px2 = px+cw-lm-1;
			var py1 = py+lm+1, py2 = py+ch-lm-1;

			// この関数を呼ぶ場合は全てk.isoutsideborder===0なので
			// 外枠用の考慮部分を削除しています。
			var UPin = (by>2), DNin = (by<2*k.qrows-2);
			var LTin = (bx>2), RTin = (bx<2*k.qcols-2);

			var isUP = (!UPin || bd.border[bd.bnum(bx  ,by-1)].ques===1);
			var isDN = (!DNin || bd.border[bd.bnum(bx  ,by+1)].ques===1);
			var isLT = (!LTin || bd.border[bd.bnum(bx-1,by  )].ques===1);
			var isRT = (!RTin || bd.border[bd.bnum(bx+1,by  )].ques===1);

			var isUL = (!UPin || !LTin || bd.border[bd.bnum(bx-2,by-1)].ques===1 || bd.border[bd.bnum(bx-1,by-2)].ques===1);
			var isUR = (!UPin || !RTin || bd.border[bd.bnum(bx+2,by-1)].ques===1 || bd.border[bd.bnum(bx+1,by-2)].ques===1);
			var isDL = (!DNin || !LTin || bd.border[bd.bnum(bx-2,by+1)].ques===1 || bd.border[bd.bnum(bx-1,by+2)].ques===1);
			var isDR = (!DNin || !RTin || bd.border[bd.bnum(bx+2,by+1)].ques===1 || bd.border[bd.bnum(bx+1,by+2)].ques===1);

			if(isUP){ if(this.vnop(vids[0],this.NONE)){ g.fillRect(px1, py1, cw-lw,1    );} }else{ this.vhide(vids[0]);}
			if(isDN){ if(this.vnop(vids[1],this.NONE)){ g.fillRect(px1, py2, cw-lw,1    );} }else{ this.vhide(vids[1]);}
			if(isLT){ if(this.vnop(vids[2],this.NONE)){ g.fillRect(px1, py1, 1    ,ch-lw);} }else{ this.vhide(vids[2]);}
			if(isRT){ if(this.vnop(vids[3],this.NONE)){ g.fillRect(px2, py1, 1    ,ch-lw);} }else{ this.vhide(vids[3]);}

			if(tileflag){
				if(!isUP&&(isUL||isLT)){ if(this.vnop(vids[4],this.NONE)){ g.fillRect(px1, py-lm, 1   ,lw+1);} }else{ this.vhide(vids[4]);}
				if(!isUP&&(isUR||isRT)){ if(this.vnop(vids[5],this.NONE)){ g.fillRect(px2, py-lm, 1   ,lw+1);} }else{ this.vhide(vids[5]);}
				if(!isLT&&(isUL||isUP)){ if(this.vnop(vids[6],this.NONE)){ g.fillRect(px-lm, py1, lw+1,1   );} }else{ this.vhide(vids[6]);}
				if(!isLT&&(isDL||isDN)){ if(this.vnop(vids[7],this.NONE)){ g.fillRect(px-lm, py2, lw+1,1   );} }else{ this.vhide(vids[7]);}
			}
			else{
				if(!isUP&&(isUL||isLT)){ if(this.vnop(vids[4] ,this.NONE)){ g.fillRect(px1, py , 1   ,lm+1);} }else{ this.vhide(vids[4] );}
				if(!isUP&&(isUR||isRT)){ if(this.vnop(vids[5] ,this.NONE)){ g.fillRect(px2, py , 1   ,lm+1);} }else{ this.vhide(vids[5] );}
				if(!isDN&&(isDL||isLT)){ if(this.vnop(vids[6] ,this.NONE)){ g.fillRect(px1, py2, 1   ,lm+1);} }else{ this.vhide(vids[6] );}
				if(!isDN&&(isDR||isRT)){ if(this.vnop(vids[7] ,this.NONE)){ g.fillRect(px2, py2, 1   ,lm+1);} }else{ this.vhide(vids[7] );}
				if(!isLT&&(isUL||isUP)){ if(this.vnop(vids[8] ,this.NONE)){ g.fillRect(px , py1, lm+1,1   );} }else{ this.vhide(vids[8] );}
				if(!isLT&&(isDL||isDN)){ if(this.vnop(vids[9] ,this.NONE)){ g.fillRect(px , py2, lm+1,1   );} }else{ this.vhide(vids[9] );}
				if(!isRT&&(isUR||isUP)){ if(this.vnop(vids[10],this.NONE)){ g.fillRect(px2, py1, lm+1,1   );} }else{ this.vhide(vids[10]);}
				if(!isRT&&(isDR||isDN)){ if(this.vnop(vids[11],this.NONE)){ g.fillRect(px2, py2, lm+1,1   );} }else{ this.vhide(vids[11]);}
			}
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawLines()    回答の線をCanvasに書き込む
	// pc.drawLine1()    回答の線をCanvasに書き込む(1カ所のみ)
	// pc.setLineColor() 描画する線の色を設定する
	// pc.drawPekes()    境界線上の×をCanvasに書き込む
	//---------------------------------------------------------------------------
	drawLines : function(x1,y1,x2,y2){
		this.vinc('line', 'crispEdges');

		var idlist = bd.borderinside(x1-1,y1-1,x2+1,y2+1);
		for(var i=0;i<idlist.length;i++){ this.drawLine1(idlist[i]);}
		this.addlw = 0;
	},
	drawLine1 : function(id){
		var vid = "b_line_"+id;
		if(this.setLineColor(id)){
			if(this.vnop(vid,this.FILL)){
				var lw = this.lw + this.addlw, lm = this.lm;
				var bx = bd.border[id].bx, by = bd.border[id].by;
				var px = bd.border[id].px, py = bd.border[id].py;
				if     (k.isCenterLine===!!(bx&1)){ g.fillRect(px-lm, py-this.bh-lm, lw, this.ch+lw);}
				else if(k.isCenterLine===!!(by&1)){ g.fillRect(px-this.bw-lm, py-lm, this.cw+lw, lw);}
			}
		}
		else{ this.vhide(vid);}
	},
	setLineColor : function(id){
		this.addlw = 0;
		if(bd.isLine(id)){
			if     (bd.border[id].error===1){ g.fillStyle = this.errlinecolor1; if(g.use.canvas){ this.addlw=1;}}
			else if(bd.border[id].error===2){ g.fillStyle = this.errlinecolor2;}
			else if(k.irowake===0 || !pp.getVal('irowake') || !bd.border[id].color){ g.fillStyle = this.linecolor;}
			else{ g.fillStyle = bd.border[id].color;}
			return true;
		}
		return false;
	},
	drawPekes : function(x1,y1,x2,y2,flag){
		if(!g.use.canvas && flag===2){ return;}

		this.vinc('border_peke', 'auto');

		var size = this.cw*0.15+1; if(size<4){ size=4;}
		var headers = ["b_peke0_", "b_peke1_"];
		g.fillStyle = "white";
		g.strokeStyle = this.pekecolor;
		g.lineWidth = 1;

		var idlist = bd.borderinside(x1-1,y1-1,x2+1,y2+1);
		for(var i=0;i<idlist.length;i++){
			var id = idlist[i];
			if(bd.border[id].qsub!==2){ this.vhide([headers[0]+id, headers[1]+id]); continue;}

			if(g.use.canvas){
				if(flag===0 || flag===2){
					if(this.vnop(headers[0]+id,this.NONE)){
						g.fillRect(bd.border[id].px-size, bd.border[id].py-size, 2*size+1, 2*size+1);
					}
				}
				else{ this.vhide(headers[0]+id);}
			}

			if(flag===0 || flag===1){
				if(this.vnop(headers[1]+id,this.NONE)){
					g.strokeCross(bd.border[id].px, bd.border[id].py, size-1);
				}
			}
			else{ this.vhide(headers[1]+id);}
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawTriangle()   三角形をCanvasに書き込む
	// pc.drawTriangle1()  三角形をCanvasに書き込む(1マスのみ)
	//---------------------------------------------------------------------------
	drawTriangle : function(x1,y1,x2,y2){
		this.vinc('cell_triangle', 'auto');
		var headers = ["c_tri2_", "c_tri3_", "c_tri4_", "c_tri5_"];

		if(g.use.canvas && k.puzzleid!=='reflect'){ x1--; y1--; x2++; y2++;}
		var clist = bd.cellinside(x1,y1,x2,y2);
		for(var i=0;i<clist.length;i++){
			var c = clist[i];
			var num = (bd.cell[c].ques!==0?bd.cell[c].ques:bd.cell[c].qans);

			this.vhide([headers[0]+c, headers[1]+c, headers[2]+c, headers[3]+c]);
			if(num>=2 && num<=5){
				switch(k.puzzleid){
				case 'reflect':
					g.fillStyle = ((bd.cell[c].error===1||bd.cell[c].error===4) ? this.errcolor1 : this.cellcolor);
					break;
				default:
					g.fillStyle = this.cellcolor;
					break;
				}

				this.drawTriangle1(bd.cell[c].px,bd.cell[c].py,num,headers[num-2]+c);
			}
		}
	},
	drawTriangle1 : function(px,py,num,vid){
		if(this.vnop(vid,this.FILL)){
			var cw = this.cw, ch = this.ch, mgn = (k.puzzleid==="reflect"?1:0);
			switch(num){
				case 2: g.setOffsetLinePath(px,py, mgn,mgn,  mgn,ch+1, cw+1,ch+1, true); break;
				case 3: g.setOffsetLinePath(px,py, cw+1,mgn, mgn,ch+1, cw+1,ch+1, true); break;
				case 4: g.setOffsetLinePath(px,py, mgn,mgn,  cw+1,mgn, cw+1,ch+1, true); break;
				case 5: g.setOffsetLinePath(px,py, mgn,mgn,  cw+1,mgn, mgn ,ch+1, true); break;
			}
			g.fill();
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawMBs()    Cell上の○,×をCanvasに書き込む
	//---------------------------------------------------------------------------
	drawMBs : function(x1,y1,x2,y2){
		this.vinc('cell_mb', 'auto');
		g.strokeStyle = this.mbcolor;
		g.lineWidth = 1;

		var rsize = this.cw*0.35;
		var headers = ["c_MB1_", "c_MB2a_"];

		var clist = bd.cellinside(x1,y1,x2,y2);
		for(var i=0;i<clist.length;i++){
			var c = clist[i];
			if(bd.cell[c].qsub===0){ this.vhide([headers[0]+c, headers[1]+c]); continue;}

			switch(bd.cell[c].qsub){
			case 1:
				if(this.vnop(headers[0]+c,this.NONE)){
					g.strokeCircle(bd.cell[c].cpx, bd.cell[c].cpy, rsize);
				}
				this.vhide(headers[1]+c);
				break;
			case 2:
				if(this.vnop(headers[1]+c,this.NONE)){
					g.strokeCross(bd.cell[c].cpx, bd.cell[c].cpy, rsize);
				}
				this.vhide(headers[0]+c);
				break;
			}
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawQnumCircles()    Cell上の黒丸と白丸をCanvasに書き込む
	// pc.drawCirclesAtNumber() 数字が描画されるCellの丸を書き込む
	// pc.drawCircle1AtNumber() 数字が描画されるCellの丸を書き込む(1マスのみ)
	//---------------------------------------------------------------------------
	drawQnumCircles : function(x1,y1,x2,y2){
		this.vinc('cell_circle', 'auto');

		g.lineWidth = Math.max(this.cw*(this.circleratio[0]-this.circleratio[1]), 1);
		var rsize1 = this.cw*(this.circleratio[0]+this.circleratio[1])/2;
		var rsize2 = this.cw*this.circleratio[0];
		var headers = ["c_cirw_", "c_cirb_"];
		var clist = bd.cellinside(x1,y1,x2,y2);
		for(var i=0;i<clist.length;i++){
			var c = clist[i];

			if(bd.cell[c].qnum===1){
				g.strokeStyle = (bd.cell[c].error===1 ? this.errcolor1  : this.cellcolor);
				g.fillStyle   = (bd.cell[c].error===1 ? this.errbcolor1 : "white");
				if(this.vnop(headers[0]+c,this.FILL_STROKE)){
					g.shapeCircle(bd.cell[c].cpx, bd.cell[c].cpy, rsize1);
				}
			}
			else{ this.vhide(headers[0]+c);}

			if(bd.cell[c].qnum===2){
				g.fillStyle = (bd.cell[c].error===1 ? this.errcolor1 : this.cellcolor);
				if(this.vnop(headers[1]+c,this.FILL)){
					g.fillCircle(bd.cell[c].cpx, bd.cell[c].cpy, rsize2);
				}
			}
			else{ this.vhide(headers[1]+c);}
		}
	},
	drawCirclesAtNumber : function(x1,y1,x2,y2){
		this.vinc('cell_circle', 'auto');

		var clist = bd.cellinside(x1-2,y1-2,x2+2,y2+2);
		for(var i=0;i<clist.length;i++){ this.drawCircle1AtNumber(clist[i]);}
	},
	drawCircle1AtNumber : function(c){
		if(c===null){ return;}

		var rsize  = this.cw*this.circleratio[0];
		var rsize2 = this.cw*this.circleratio[1];
		var headers = ["c_cira_", "c_cirb_"];

		if(bd.cell[c].qnum!==-1){
			g.lineWidth = this.cw*0.05;
			g.fillStyle = (bd.cell[c].error===1 ? this.errbcolor1 : this.circledcolor);
			if(this.vnop(headers[1]+c,this.FILL)){
				g.fillCircle(bd.cell[c].cpx, bd.cell[c].cpy, rsize2);
			}

			g.strokeStyle = (bd.cell[c].error===1 ? this.errcolor1 : this.cellcolor);
			if(this.vnop(headers[0]+c,this.STROKE)){
				g.strokeCircle(bd.cell[c].cpx, bd.cell[c].cpy, rsize);
			}
		}
		else{ this.vhide([headers[0]+c, headers[1]+c]);}
	},

	//---------------------------------------------------------------------------
	// pc.drawLineParts()   ╋などをCanvasに書き込む
	// pc.drawLineParts1()  ╋などをCanvasに書き込む(1マスのみ)
	//---------------------------------------------------------------------------
	drawLineParts : function(x1,y1,x2,y2){
		this.vinc('cell_lineparts', 'crispEdges');

		var clist = bd.cellinside(x1,y1,x2,y2);
		for(var i=0;i<clist.length;i++){ this.drawLineParts1(clist[i]);}
	},
	drawLineParts1 : function(id){
		var vids = ["c_lp1_"+id, "c_lp2_"+id, "c_lp3_"+id, "c_lp4_"+id];

		var qu = bd.cell[id].ques;
		if(qu>=11 && qu<=17){
			var lw  = this.lw, lm = this.lm;
			var hhp = this.bh+this.lm, hwp = this.bw+this.lm;
			var px  = bd.cell[id].px, py = bd.cell[id].py;
			var cpx = bd.cell[id].cpx, cpy = bd.cell[id].cpy;
			g.fillStyle = this.borderQuescolor;

			var flag  = {11:15, 12:3, 13:12, 14:9, 15:5, 16:6, 17:10}[qu];
			if(flag&1){ if(this.vnop(vids[0],this.NONE)){ g.fillRect(cpx-lm, py    , lw, hhp);} }else{ this.vhide(vids[0]);}
			if(flag&2){ if(this.vnop(vids[1],this.NONE)){ g.fillRect(cpx-lm, cpy-lm, lw, hhp);} }else{ this.vhide(vids[1]);}
			if(flag&4){ if(this.vnop(vids[2],this.NONE)){ g.fillRect(px    , cpy-lm, hwp, lw);} }else{ this.vhide(vids[2]);}
			if(flag&8){ if(this.vnop(vids[3],this.NONE)){ g.fillRect(cpx-lm, cpy-lm, hwp, lw);} }else{ this.vhide(vids[3]);}
		}
		else{ this.vhide(vids);}
	},

	//---------------------------------------------------------------------------
	// pc.drawQues51()         Ques===51があるようなパズルで、描画関数を呼び出す
	// pc.drawSlash51Cells()   [＼]のナナメ線をCanvasに書き込む
	// pc.drawSlash51EXcells() EXCell上の[＼]のナナメ線をCanvasに書き込む
	// pc.drawEXCellGrid()     EXCell間の境界線をCanvasに書き込む
	//---------------------------------------------------------------------------
	drawQues51 : function(x1,y1,x2,y2){
		this.drawEXCellGrid(x1,y1,x2,y2);
		this.drawSlash51Cells(x1,y1,x2,y2);
		this.drawSlash51EXcells(x1,y1,x2,y2);
		this.drawTargetTriangle(x1,y1,x2,y2);
	},
	drawSlash51Cells : function(x1,y1,x2,y2){
		this.vinc('cell_ques51', 'crispEdges');

		var header = "c_slash51_";
		g.strokeStyle = this.cellcolor;
		g.lineWidth = 1;
		var clist = bd.cellinside(x1,y1,x2,y2);
		for(var i=0;i<clist.length;i++){
			var c = clist[i], px = bd.cell[c].px, py = bd.cell[c].py;

			if(bd.cell[c].ques===51){
				if(this.vnop(header+c,this.NONE)){
					g.strokeLine(px+1,py+1, px+this.cw,py+this.ch);
				}
			}
			else{ this.vhide(header+c);}
		}
	},
	drawSlash51EXcells : function(x1,y1,x2,y2){
		this.vinc('excell_ques51', 'crispEdges');

		var header = "ex_slash51_";
		g.strokeStyle = this.cellcolor;
		g.lineWidth = 1;
		var exlist = bd.excellinside(x1-1,y1-1,x2,y2);
		for(var i=0;i<exlist.length;i++){
			var c = exlist[i], px = bd.excell[c].px, py = bd.excell[c].py;
			if(this.vnop(header+c,this.NONE)){
				g.strokeLine(px+1,py+1, px+this.cw,py+this.ch);
			}
		}
	},
	drawEXCellGrid : function(x1,y1,x2,y2){
		this.vinc('grid_excell', 'crispEdges');

		g.fillStyle = this.cellcolor;
		var headers = ["ex_bdx_", "ex_bdy_"];
		var exlist = bd.excellinside(x1-1,y1-1,x2,y2);
		for(var i=0;i<exlist.length;i++){
			var c = exlist[i], px = bd.excell[c].px, py = bd.excell[c].py;

			if(bd.excell[c].by===-1 && bd.excell[c].bx<bd.maxbx){
				if(this.vnop(headers[0]+c,this.NONE)){
					g.fillRect(px+this.cw, py, 1, this.ch);
				}
			}

			if(bd.excell[c].bx===-1 && bd.excell[c].by<bd.maxby){
				if(this.vnop(headers[1]+c,this.NONE)){
					g.fillRect(px, py+this.ch, this.cw, 1);
				}
			}
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawNumbersOn51()   [＼]に数字を記入する
	// pc.drawNumbersOn51_1() 1つの[＼]に数字を記入する
	//---------------------------------------------------------------------------
	drawNumbersOn51 : function(x1,y1,x2,y2){
		this.vinc('cell_number51', 'auto');

		for(var bx=(x1|1)-2;bx<=x2+2;bx+=2){
			for(var by=(y1|1)-2;by<=y2+2;by+=2){
				// cell上だった場合
				if(bx!==-1 && by!==-1){
					var c = bd.cnum(bx,by);
					if(c!==null){ this.drawNumbersOn51_1('cell', c);}
				}
				// excell上だった場合
				else{
					var c = bd.exnum(bx,by);
					if(c!==null){ this.drawNumbersOn51_1('excell', c);}
				}
			}
		}
	},
	drawNumbersOn51_1 : function(family, c){
		var val, err, guard, nb, type, str, obj=bd[family][c];
		var keys = [[family,c,'ques51','rt'].join('_'), [family,c,'ques51','dn'].join('_')];

		if(family==='excell' || bd.cell[c].ques===51){
			for(var i=0;i<2;i++){
				if     (i===0){ val=obj.qnum, guard=obj.by, nb=bd.cnum(obj.bx+2, obj.by), type=4;} // 1回目は右向き
				else if(i===1){ val=obj.qdir, guard=obj.bx, nb=bd.cnum(obj.bx, obj.by+2), type=2;} // 2回目は下向き

				if(val!==-1 && guard!==-1 && nb!==null && bd.cell[nb].ques!==51){
					var color = (obj.error===1?this.fontErrcolor:this.fontcolor);
					var text = (val>=0?""+val:"");

					this.dispnum(keys[i], type, text, 0.45, color, obj.px+this.bw, obj.py+this.bh);
				}
				else{ this.hideEL(keys[i]);}
			}
		}
		else{
			this.hideEL(keys[0]);
			this.hideEL(keys[1]);
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawTarget()  入力対象となる場所を描画する
	// pc.drawCursor()  キーボードからの入力対象をCanvasに書き込む
	// pc.drawTargetTriangle() [＼]のうち入力対象のほうに背景色をつける
	//---------------------------------------------------------------------------
	drawTarget : function(x1,y1,x2,y2){
		this.drawCursor(x1, y1, x2, y2, true, k.editmode);
	},

	drawCursor : function(x1,y1,x2,y2,islarge,isdraw){
		this.vinc('target_cursor', 'crispEdges');

		if(isdraw!==false && pp.getVal('cursor')){
			if(tc.cursor.x < x1-1 || x2+1 < tc.cursor.x){ return;}
			if(tc.cursor.y < y1-1 || y2+1 < tc.cursor.y){ return;}

			var cpx = k.p0.x + tc.cursor.x*this.bw + 0.5;
			var cpy = k.p0.y + tc.cursor.y*this.bh + 0.5;
			var w, size;
			if(islarge!==false){ w = (Math.max(this.cw/16, 2))|0; size = this.bw-0.5;}
			else	           { w = (Math.max(this.cw/24, 1))|0; size = this.bw*0.56;}

			this.vdel(["ti1_","ti2_","ti3_","ti4_"]);
			g.fillStyle = (k.editmode?this.targetColor1:this.targetColor3);
			if(this.vnop("ti1_",this.FILL)){ g.fillRect(cpx-size,   cpy-size,   size*2, w);}
			if(this.vnop("ti2_",this.FILL)){ g.fillRect(cpx-size,   cpy-size,   w, size*2);}
			if(this.vnop("ti3_",this.FILL)){ g.fillRect(cpx-size,   cpy+size-w, size*2, w);}
			if(this.vnop("ti4_",this.FILL)){ g.fillRect(cpx+size-w, cpy-size,   w, size*2);}
		}
		else{ this.vhide(["ti1_","ti2_","ti3_","ti4_"]);}
	},

	drawTargetTriangle : function(x1,y1,x2,y2){
		this.vinc('target_triangle', 'auto');

		var vid = "target_triangle";
		this.vdel([vid]);

		if(k.playmode){ return;}

		if(tc.cursor.x < x1 || x2+2 < tc.cursor.x){ return;}
		if(tc.cursor.y < y1 || y2+2 < tc.cursor.y){ return;}

		var cc = tc.getTCC(), ex = null;
		if(cc===null){ ex = tc.getTEC();}
		var target = kc.detectTarget(cc,ex);
		if(target===0){ return;}

		g.fillStyle = this.ttcolor;
		this.drawTriangle1(k.p0.x+(tc.cursor.x>>1)*this.cw, k.p0.y+(tc.cursor.y>>1)*this.ch, (target===2?4:2), vid);
	},

	//---------------------------------------------------------------------------
	// pc.drawDashedCenterLines() セルの中心から中心にひかれる点線をCanvasに描画する
	//---------------------------------------------------------------------------
	drawDashedCenterLines : function(x1,y1,x2,y2){
		this.vinc('centerline', 'crispEdges');
		if(x1<bd.minbx+1){ x1=bd.minbx+1;} if(x2>bd.maxbx-1){ x2=bd.maxbx-1;}
		if(y1<bd.minby+1){ y1=bd.minby+1;} if(y2>bd.maxby-1){ y2=bd.maxby-1;}
		x1|=1, y1|=1;

		if(g.use.canvas){
			g.fillStyle = this.gridcolor;
			for(var i=x1;i<=x2;i+=2){
				for(var j=(k.p0.y+y1*this.bh),len=(k.p0.y+y2*this.bh);j<len;j+=6){
					g.fillRect(k.p0.x+i*this.bw, j, 1, 3);
				}
			}
			for(var i=y1;i<=y2;i+=2){
				for(var j=(k.p0.x+x1*this.bw),len=(k.p0.x+x2*this.bw);j<len;j+=6){
					g.fillRect(j, k.p0.y+i*this.bh, 3, 1);
				}
			}
		}
		else{
			g.lineWidth = 1;
			g.strokeStyle = this.gridcolor;
			for(var i=x1;i<=x2;i+=2){ if(this.vnop("cliney_"+i,this.NONE)){
				var px = k.p0.x+i*this.bw, py1 = k.p0.y+y1*this.bh, py2 = k.p0.y+y2*this.bh;
				g.strokeLine(px, py1, px, py2);
				g.setDashSize(3);
			}}
			for(var i=y1;i<=y2;i+=2){ if(this.vnop("clinex_"+i,this.NONE)){
				var py = k.p0.y+i*this.bh, px1 = k.p0.x+x1*this.bw, px2 = k.p0.x+x2*this.bw;
				g.strokeLine(px1, py, px2, py);
				g.setDashSize(3);
			}}
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawGrid()        セルの枠線(実線)をCanvasに書き込む
	// pc.drawDashedGrid()  セルの枠線(点線)をCanvasに書き込む
	//---------------------------------------------------------------------------
	drawGrid : function(x1,y1,x2,y2,isdraw){
		this.vinc('grid', 'crispEdges');

		// 外枠まで描画するわけじゃないので、maxbxとか使いません
		if(x1<0){ x1=0;} if(x2>2*k.qcols){ x2=2*k.qcols;}
		if(y1<0){ y1=0;} if(y2>2*k.qrows){ y2=2*k.qrows;}
		x1-=(x1&1), y1-=(y1&1);

		var bs=((k.isborder!==2&&this.chassisflag)?2:0);
		var xa = Math.max(x1,0+bs), xb = Math.min(x2,2*k.qcols-bs);
		var ya = Math.max(y1,0+bs), yb = Math.min(y2,2*k.qrows-bs);

		isdraw = (isdraw!==false?true:false);
		if(isdraw){
			g.fillStyle = this.gridcolor;
			for(var i=xa;i<=xb;i+=2){ if(this.vnop("bdy_"+i,this.NONE)){ g.fillRect(k.p0.x+i*this.bw, k.p0.y+y1*this.bh, 1, (y2-y1)*this.bh+1);} }
			for(var i=ya;i<=yb;i+=2){ if(this.vnop("bdx_"+i,this.NONE)){ g.fillRect(k.p0.x+x1*this.bw, k.p0.y+i*this.bh, (x2-x1)*this.bw+1, 1);} }
		}
		else{
			if(!g.use.canvas){
				for(var i=xa;i<=xb;i+=2){ this.vhide("bdy_"+i);}
				for(var i=ya;i<=yb;i+=2){ this.vhide("bdx_"+i);}
			}
		}
	},
	drawDashedGrid : function(x1,y1,x2,y2){
		this.vinc('grid', 'crispEdges');
		if(x1<bd.minbx){ x1=bd.minbx;} if(x2>bd.maxbx){ x2=bd.maxbx;}
		if(y1<bd.minby){ y1=bd.minby;} if(y2>bd.maxby){ y2=bd.maxby;}
		x1-=(x1&1), y1-=(y1&1);

		var dotmax   = this.cw/10+3;
		var dotCount = Math.max(this.cw/dotmax, 1);
		var dotSize  = this.cw/(dotCount*2);

		//var bs=((k.isborder!==2&&this.chassisflag)?1:0);
		var bs=(this.chassisflag?2:0);
		var xa = Math.max(x1,bd.minbx+bs), xb = Math.min(x2,bd.maxbx-bs);
		var ya = Math.max(y1,bd.minby+bs), yb = Math.min(y2,bd.maxby-bs);

		if(g.use.canvas){
			g.fillStyle = this.gridcolor;
			for(var i=xa;i<=xb;i+=2){
				var px = k.p0.x+i*this.bw;
				for(var j=(k.p0.y+y1*this.bh),len=(k.p0.y+y2*this.bh);j<len;j+=(2*dotSize)){
					g.fillRect(px, j, 1, dotSize);
				}
			}
			for(var i=ya;i<=yb;i+=2){
				var py = k.p0.y+i*this.bh;
				for(var j=(k.p0.x+x1*this.bw),len=(k.p0.x+x2*this.bw);j<len;j+=(2*dotSize)){
					g.fillRect(j, py, dotSize, 1);
				}
			}
		}
		else{
			// strokeぶん0.5ずらす
			g.lineWidth = 1;
			g.strokeStyle = this.gridcolor;
			for(var i=xa;i<=xb;i+=2){ if(this.vnop("bdy_"+i,this.NONE)){
				var px = k.p0.x+i*this.bw+0.5, py1 = k.p0.y+y1*this.bh, py2 = k.p0.y+y2*this.bh;
				g.strokeLine(px, py1, px, py2);
				g.setDashSize(dotSize);
			}}
			for(var i=ya;i<=yb;i+=2){ if(this.vnop("bdx_"+i,this.NONE)){
				var py = k.p0.y+i*this.bh+0.5, px1 = k.p0.x+x1*this.bw, px2 = k.p0.x+x2*this.bw;
				g.strokeLine(px1, py, px2, py);
				g.setDashSize(dotSize);
			}}
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawChassis()     外枠をCanvasに書き込む
	// pc.drawChassis_ex1() k.isextencdell==1の時の外枠をCanvasに書き込む
	//---------------------------------------------------------------------------
	drawChassis : function(x1,y1,x2,y2){
		this.vinc('chassis', 'crispEdges');

		// ex===0とex===2で同じ場所に描画するので、maxbxとか使いません
		if(x1<0){ x1=0;} if(x2>2*k.qcols){ x2=2*k.qcols;}
		if(y1<0){ y1=0;} if(y2>2*k.qrows){ y2=2*k.qrows;}

		var lw = (k.puzzleid!=='bosanowa'?this.lw:1), bw = this.bw, bh = this.bh;
		var boardWidth = k.qcols*this.cw, boardHeight = k.qrows*this.ch;
		g.fillStyle = "black";

		if(g.use.canvas){
			if(x1===0)        { g.fillRect(k.p0.x      -lw+1, k.p0.y+y1*bh-lw+1,  lw, (y2-y1)*bh+2*lw-2);}
			if(x2===2*k.qcols){ g.fillRect(k.p0.x+boardWidth, k.p0.y+y1*bh-lw+1,  lw, (y2-y1)*bh+2*lw-2);}
			if(y1===0)        { g.fillRect(k.p0.x+x1*bw-lw+1, k.p0.y      -lw+1,  (x2-x1)*bw+2*lw-2, lw); }
			if(y2===2*k.qrows){ g.fillRect(k.p0.x+x1*bw-lw+1, k.p0.y+boardHeight, (x2-x1)*bw+2*lw-2, lw); }
		}
		else{
			if(this.vnop("chs1_",this.NONE)){ g.fillRect(k.p0.x-lw+1,        k.p0.y-lw+1, lw, boardHeight+2*lw-2);}
			if(this.vnop("chs2_",this.NONE)){ g.fillRect(k.p0.x+boardWidth,  k.p0.y-lw+1, lw, boardHeight+2*lw-2);}
			if(this.vnop("chs3_",this.NONE)){ g.fillRect(k.p0.x-lw+1,        k.p0.y-lw+1, boardWidth+2*lw-2, lw); }
			if(this.vnop("chs4_",this.NONE)){ g.fillRect(k.p0.x-lw+1, k.p0.y+boardHeight, boardWidth+2*lw-2, lw); }
		}
	},
	drawChassis_ex1 : function(x1,y1,x2,y2,boldflag){
		this.vinc('chassis_ex1', 'crispEdges');
		if(x1<=0){ x1=bd.minbx;} if(x2>bd.maxbx){ x2=bd.maxbx;}
		if(y1<=0){ y1=bd.minby;} if(y2>bd.maxby){ y2=bd.maxby;}

		var lw = this.lw, lm = this.lm, bw = this.bw, bh = this.bh;
		var boardWidth = k.qcols*this.cw, boardHeight = k.qrows*this.ch;
		g.fillStyle = "black";

		// extendcell==1も含んだ外枠の描画
		if(g.use.canvas){
			if(x1===bd.minbx){ g.fillRect(k.p0.x-this.cw-lw+1, k.p0.y+y1*bh-lw+1,   lw, (y2-y1)*bh+2*lw-2);}
			if(x2===bd.maxbx){ g.fillRect(k.p0.x+boardWidth,   k.p0.y+y1*bh-lw+1,   lw, (y2-y1)*bh+2*lw-2);}
			if(y1===bd.minby){ g.fillRect(k.p0.x+x1*bw-lw+1,   k.p0.y-this.ch-lw+1, (x2-x1)*bw+2*lw-2, lw);}
			if(y2===bd.maxby){ g.fillRect(k.p0.x+x1*bw-lw+1,   k.p0.y+boardHeight,  (x2-x1)*bw+2*lw-2, lw);}
		}
		else{
			if(this.vnop("chsex1_1_",this.NONE)){ g.fillRect(k.p0.x-this.cw-lw+1, k.p0.y-this.ch-lw+1, lw, boardHeight+this.ch+2*lw-2);}
			if(this.vnop("chsex1_2_",this.NONE)){ g.fillRect(k.p0.x+boardWidth,   k.p0.y-this.ch-lw+1, lw, boardHeight+this.ch+2*lw-2);}
			if(this.vnop("chsex1_3_",this.NONE)){ g.fillRect(k.p0.x-this.cw-lw+1, k.p0.y-this.ch-lw+1, boardWidth+this.cw+2*lw-2, lw); }
			if(this.vnop("chsex1_4_",this.NONE)){ g.fillRect(k.p0.x-this.cw-lw+1, k.p0.y+boardHeight,  boardWidth+this.cw+2*lw-2, lw); }
		}

		// 通常のセルとextendcell==1の間の描画
		if(boldflag){
			// すべて太線で描画する場合
			if(g.use.canvas){
				if(x1<=0){ g.fillRect(k.p0.x-lw+1, k.p0.y+y1*bh-lw+1, lw, (y2-y1)*bh+lw-1);}
				if(y1<=0){ g.fillRect(k.p0.x+x1*bw-lw+1, k.p0.y-lw+1, (x2-x1)*bw+lw-1, lw); }
			}
			else{
				if(this.vnop("chs1_",this.NONE)){ g.fillRect(k.p0.x-lw+1, k.p0.y-lw+1, lw, boardHeight+lw-1);}
				if(this.vnop("chs2_",this.NONE)){ g.fillRect(k.p0.x-lw+1, k.p0.y-lw+1, boardWidth+lw-1,  lw);}
			}
		}
		else{
			// ques==51のセルが隣接している時に細線を描画する場合
			if(g.use.canvas){
				if(x1<=0){ g.fillRect(k.p0.x, k.p0.y+y1*bh, 1, (y2-y1)*bh);}
				if(y1<=0){ g.fillRect(k.p0.x+x1*bw, k.p0.y, (x2-x1)*bw, 1); }
			}
			else{
				if(this.vnop("chs1_",this.NONE)){ g.fillRect(k.p0.x, k.p0.y, 1, boardHeight);}
				if(this.vnop("chs2_",this.NONE)){ g.fillRect(k.p0.x, k.p0.y, boardWidth, 1); }
			}

			var headers = ["chs1_sub_", "chs2_sub_"];
			var clist = bd.cellinside(x1-1,y1-1,x2+1,y2+1);
			for(var i=0;i<clist.length;i++){
				var c = clist[i], bx = bd.cell[c].bx, by = bd.cell[c].by;
				var px = bd.cell[c].px, py = bd.cell[c].py;
				if(bx===1){
					if(bd.cell[c].ques!==51){
						if(this.vnop(headers[0]+by,this.NONE)){
							g.fillRect(k.p0.x-lm, py-lm, lw, this.ch+lw);
						}
					}
					else{ this.vhide([headers[0]+by]);}
				}
				if(by===1){
					if(bd.cell[c].ques!==51){
						if(this.vnop(headers[1]+bx,this.NONE)){
							g.fillRect(px-lm, k.p0.x-lm, this.cw+lw, lw);
						}
					}
					else{ this.vhide([headers[1]+bx]);}
				}
			}
		}
	},

	//---------------------------------------------------------------------------
	// pc.resetVectorFunctions() flushCanvas, vnop系関数をリセットする
	// pc.flushCanvas()    指定された領域を白で塗りつぶす
	// pc.flushCanvasAll() Canvas全面を白で塗りつぶす
	//---------------------------------------------------------------------------
	resetVectorFunctions : function(){
		this.flushCanvasAll = Graphic.prototype.flushCanvasAll;
		this.flushCanvas    = Graphic.prototype.flushCanvas;
		this.vnop  = Graphic.prototype.vnop;
		this.vhide = Graphic.prototype.vhide;
		this.vdel  = Graphic.prototype.vdel;
		this.vinc  = Graphic.prototype.vinc;
	},

	flushCanvasAll : function(){
		this.flushCanvasAll = ((g.use.canvas) ?
			function(){
				this.numobj = {};
				base.numparent.innerHTML = '';
			}
		:
			function(){
				g.clear();
				this.zidx=0;
				this.zidx_array=[];

				this.numobj = {};
				base.numparent.innerHTML = '';

				this.vinc('board_base', 'crispEdges');
				g.fillStyle = (!this.bgcolor ? "rgb(255, 255, 255)" : this.bgcolor);
				if(this.vnop("boardfull",this.NONE)){
					g.fillRect(k.p0.x, k.p0.y, k.qcols*this.cw, k.qrows*this.ch);
				}
			}
		);
		this.flushCanvasAll();
	},
	flushCanvas : function(x1,y1,x2,y2){
		this.flushCanvas = ((g.use.canvas) ?
			function(x1,y1,x2,y2){
				g.fillStyle = (!this.bgcolor ? "rgb(255, 255, 255)" : this.bgcolor);
				g.fillRect(k.p0.x+x1*this.bw, k.p0.y+y1*this.bh, (x2-x1)*this.bw, (y2-y1)*this.bh);
			}
		:
			function(x1,y1,x2,y2){ this.zidx=1;}
		);
		this.flushCanvas(x1,y1,x2,y2);
	},

	//---------------------------------------------------------------------------
	// pc.vnop()  VMLで既に描画されているオブジェクトを再描画せず、色は設定する
	// pc.vhide() VMLで既に描画されているオブジェクトを隠す
	// pc.vdel()  VMLで既に描画されているオブジェクトを削除する
	// pc.vinc()  z-indexに設定される値を+1する
	//---------------------------------------------------------------------------
	vnop : function(vid, ccflag){
		this.vnop = ((g.use.canvas) ?
			f_true
		:
			// ccflag -> 0:strokeのみ, 1:fillのみ, 2:両方, 3:色の変更なし
			function(vid, ccflag){
				g.vid = vid;
				if(!g.elements[vid]){ return true;}

				var el = g.elements[vid],
					isfill   = this.vnop_FILL[ccflag],
					isstroke = this.vnop_STROKE[ccflag];

				if(g.use.vml){
					el.style.display = 'inline';
					if(isfill)  { el.fillcolor   = Camp.parse(g.fillStyle);}
					if(isstroke){ el.strokecolor = Camp.parse(g.strokeStyle);}
				}
				else if(g.use.sl){
					el.Visibility = "Visible";
					if(isfill)  { el.fill   = Camp.parse(g.fillStyle);  }
					if(isstroke){ el.stroke = Camp.parse(g.strokeStyle);}
				}
				else if(g.use.svg){
					el.style.display = 'inline';
					if(isfill)  { el.setAttribute('fill',  Camp.parse(g.fillStyle));}
					if(isstroke){ el.setAttribute('stroke',Camp.parse(g.strokeStyle));}
				}
				return false;
			}
		);
		return this.vnop(vid, ccflag);
	},
	vhide : function(vid){
		this.vhide = ((g.use.canvas) ?
			f_true
		:
			function(vid){
				if(typeof vid === 'string'){ vid = [vid];}
				for(var i=0;i<vid.length;i++){
					if(!g.elements[vid[i]]){ continue;}

					if(!g.use.sl){ g.elements[vid[i]].style.display = 'none';}
					else{ g.elements[vid[i]].Visibility = "Collapsed";}
				}
			}
		);
		this.vhide(vid);
	},
	vdel : function(vid){
		this.vdel = ((g.use.canvas) ?
			f_true
		:
			function(vid){
				for(var i=0;i<vid.length;i++){
					if(!g.elements[vid[i]]){ continue;}

					if(!g.use.sl){ g.target.removeChild(g.elements[vid[i]]);}
					else{ g.elements[vid[i]].Visibility = "Collapsed";}
					g.elements[vid[i]] = null;
				}
			}
		);
		this.vdel(vid);
	},
	vinc : function(layerid, rendering){
		this.vinc = ((g.use.canvas) ?
			function(layerid, rendering){
				g.setLayer(layerid);
				if(rendering){ g.setRendering(rendering);}
			}
		:
			function(layerid, rendering){
				g.vid = "";
				g.setLayer(layerid);

				if(!this.zidx_array[layerid]){
					this.zidx++;
					this.zidx_array[layerid] = this.zidx;
					if(rendering){ g.setRendering(rendering);}
					if(!g.use.sl){ g.getLayerElement().style.zIndex = this.zidx;}
					else{ g.getLayerElement()["Canvas.ZIndex"] = this.zidx;}
				}
			}
		);
		this.vinc(layerid, rendering);
	},

	//---------------------------------------------------------------------------
	// pc.showEL()   エレメントを表示する
	// pc.hideEL()   エレメントを隠す
	// pc.dispnum()  数字を記入するための共通関数
	//---------------------------------------------------------------------------
	showEL : function(key){
		// 呼び出し元は if(!this.fillTextPrecisely) の中だけなので
		// hideELにある条件は見なくてもよさそう。
		this.numobj[key].style.display = 'inline';
	},
	hideEL : function(key){
		if(!!this.numobj[key]){
			this.numobj[key].style.display = 'none';
		}
	},
	dispnum : function(key, type, text, fontratio, color, px, py){
		if(!this.fillTextPrecisely){
			if(k.br.IE6 || k.br.IE7){ py+=2;}

			// エレメントを取得
			var el = this.numobj[key];
			if(!el){ el = this.numobj[key] = ee.createEL(this.EL_NUMOBJ,'');}

			el.innerHTML = text;

			var fontsize = (this.cw*fontratio*this.fontsizeratio)|0;
			el.style.fontSize = (""+ fontsize + 'px');

			this.showEL(key);	// 先に表示しないとwid,hgt=0になって位置がずれる

			var wid = el.offsetWidth;
			var hgt = el.offsetHeight;

			if(type===1){
				px+=2; // なんかちょっとずれる
				el.style.left = k.cv_oft.x+px-wid/2 + 'px';
				el.style.top  = k.cv_oft.y+py-hgt/2 + 'px';
			}
			else{
				if     (type===3||type===4){ el.style.left = k.cv_oft.x+px+this.bw-wid -1 + 'px';}
				else if(type===2||type===5){ el.style.left = k.cv_oft.x+px-this.bw     +3 + 'px';}
				if     (type===2||type===3){ el.style.top  = k.cv_oft.y+py+this.bh-hgt -1 + 'px';}
				else if(type===4||type===5){ el.style.top  = k.cv_oft.y+py-this.bh     +2 + 'px';}
			}

			el.style.color = color;
		}
		// Nativeな方法はこっちなんだけど、、(前は計5～6%くらい遅くなってた)
		else{
			g.font = ""+((this.cw*fontratio*this.fontsizeratio)|0)+"px 'Serif'";
			g.fillStyle = color;
			if(type===1){
				g.textAlign = 'center'; g.textBaseline = 'middle';
			}
			else{
				g.textAlign    = ((type===3||type===4)?'right':'left');
				g.textBaseline = ((type===2||type===3)?'alphabetic':'top');
				px += ((type===3||type===4)?this.bw-1:-this.bw+2), py += ((type===2||type===3)?this.bh-2:-this.bh+1);
			}
			g.fillText(text, px, py);
		}
	}
};

//---------------------------------------------------------------------------
// ★MouseEventクラス マウス入力に関する情報の保持とイベント処理を扱う
//---------------------------------------------------------------------------
// パズル共通 マウス入力部
// MouseEventクラスを定義
var MouseEvent = function(){
	this.enableMouse = true;	// マウス入力は有効か

	this.inputPoint = new Point(null, null);	// 入力イベントが発生したpixel位置

	this.mouseCell;		// 入力されたセル等のID
	this.inputData;		// 入力中のデータ番号(実装依存)
	this.firstCell;		// mousedownされた時のセルのID(連黒分断禁用)
	this.firstPoint = new Point(null, null);	// mousedownされた時のpixel位置
	this.prevPos    = new Address(null, null);	// 前回のマウス入力イベントのborder座標
	this.btn = {};		// 押されているボタン
	this.mousereset();

	this.enableInputHatena = k.isDispHatena;
	this.inputqnumDirectly = false;

	this.mouseoffset;
	if(k.br.IE6||k.br.IE7||k.br.IE8){ this.mouseoffset = {x:2,y:2};}
	else if(k.br.WinWebKit){ this.mouseoffset = {x:1,y:1};}
	else                   { this.mouseoffset = {x:0,y:0};}
};
MouseEvent.prototype = {
	//---------------------------------------------------------------------------
	// mv.mousereset() マウス入力に関する情報を初期化する
	//---------------------------------------------------------------------------
	mousereset : function(){
		this.mouseCell = null;
		this.inputData = null;
		this.firstCell = null;
		this.firstPoint.reset();
		this.prevPos.reset();
		this.btn = { Left:false, Middle:false, Right:false};

		if(this.previdlist!==(void 0)){ this.previdlist = [];}
	},

	//---------------------------------------------------------------------------
	// mv.e_mousedown() Canvas上でマウスのボタンを押した際のイベント共通処理
	// mv.e_mouseup()   Canvas上でマウスのボタンを放した際のイベント共通処理
	// mv.e_mousemove() Canvas上でマウスを動かした際のイベント共通処理
	// mv.e_mouseout()  マウスカーソルがウィンドウから離れた際のイベント共通処理
	//---------------------------------------------------------------------------
	//イベントハンドラから呼び出される
	// この3つのマウスイベントはCanvasから呼び出される(mvをbindしている)
	e_mousedown : function(e){
		if(this.enableMouse){
			this.setButtonFlag(e);
			// SHIFTキーを押している時は左右ボタン反転
			if(((kc.isSHIFT)^pp.getVal('lrcheck'))&&(this.btn.Left^this.btn.Right)){
				this.btn.Left = !this.btn.Left; this.btn.Right = !this.btn.Right;
			}
			if(this.btn.Middle){ this.modeflip();} //中ボタン
			else{
				if(ans.errDisp){ bd.errclear();}
				um.newOperation(true);
				this.setposition(e);
				this.mousedown();	// 各パズルのルーチンへ
			}
		}
		ee.stopPropagation(e);
		ee.preventDefault(e);
		return false;
	},
	e_mouseup   : function(e){
		if(this.enableMouse && !this.btn.Middle && (this.btn.Left || this.btn.Right)){
			um.newOperation(false);
			this.setposition(e);
			this.mouseup();		// 各パズルのルーチンへ
			this.mousereset();
		}
		ee.stopPropagation(e);
		ee.preventDefault(e);
		return false;
	},
	e_mousemove : function(e){
		// ポップアップメニュー移動中は当該処理が最優先
		if(!!menu.movingpop){ return true;}

		if(this.enableMouse && !this.btn.Middle && (this.btn.Left || this.btn.Right)){
			um.newOperation(false);
			this.setposition(e);
			this.mousemove();	// 各パズルのルーチンへ
		}
		ee.stopPropagation(e);
		ee.preventDefault(e);
		return false;
	},
	e_mouseout : function(e) {
		um.newOperation(false);
	},

	//---------------------------------------------------------------------------
	// mv.mousedown() Canvas上でマウスのボタンを押した際のイベント処理。各パズルのファイルでオーバーライドされる。
	// mv.mouseup()   Canvas上でマウスのボタンを放した際のイベント処理。各パズルのファイルでオーバーライドされる。
	// mv.mousemove() Canvas上でマウスを動かした際のイベント処理。各パズルのファイルでオーバーライドされる。
	//---------------------------------------------------------------------------
	//オーバーライド用
	mousedown : function(){ },
	mouseup   : function(){ },
	mousemove : function(){ },

	//---------------------------------------------------------------------------
	// mv.setButtonFlag() 左/中/右ボタンが押されているか設定する
	//---------------------------------------------------------------------------
	setButtonFlag : function(e){
		this.setButtonFlag = ((!k.os.iPhoneOS && !k.os.Android) ? (
		 (k.br.IE) ?
			function(e){ this.btn = { Left:(e.button===1), Middle:(e.button===4), Right:(e.button===2)};}
		:(k.br.WinWebKit) ?
			function(e){ this.btn = { Left:(e.button===0), Middle:(e.button===1), Right:(e.button===2)};}
		:(k.br.WebKit) ?
			function(e){
				this.btn = { Left:(e.which===1 && !e.metaKey), Middle:false, Right:(e.which===1 && !!e.metaKey) };
			}
		:
			function(e){
				this.btn = (!!e.which ? { Left:(e.which ===1), Middle:(e.which ===2), Right:(e.which ===3)}
									  : { Left:(e.button===0), Middle:(e.button===1), Right:(e.button===2)});
			}
		):
			function(e){ this.btn = { Left:(e.touches.length===1), Middle:false, Right:(e.touches.length>1)};}
		);
		this.setButtonFlag(e);
	},

	//---------------------------------------------------------------------------
	// mv.setposition()   イベントが起こった座標をinputPointに代入
	// mv.notInputted()   盤面への入力が行われたかどうか判定する
	// mv.modeflip()      中ボタンでモードを変更するときの処理
	//---------------------------------------------------------------------------
	setposition : function(e){
		this.setposition = ((!k.os.iPhoneOS && !k.os.Android) ?
			function(e){
				this.inputPoint.x = ee.pageX(e) -k.cv_oft.x-k.p0.x - this.mouseoffset.x;
				this.inputPoint.y = ee.pageY(e) -k.cv_oft.y-k.p0.y - this.mouseoffset.y;
			}
		:
			function(e){
				var len=e.touches.length , pos=new Pos(0,0);
				if(len>0){
					for(var i=0,len=e.touches.length;i<len;i++){
						pos.x += e.pageX; pos.y += e.pageY;
					}
					this.inputPoint.x = (((pos.x/len) -k.cv_oft.x-k.p0.x)|0);
					this.inputPoint.y = (((pos.y/len) -k.cv_oft.y-k.p0.y)|0);
				}
			}
		);
		this.setposition(e);
	},

	notInputted : function(){ return !um.changeflag;},
	modeflip    : function(){ if(k.EDITOR){ pp.setVal('mode', (k.playmode?1:3));} },

	// 共通関数
	//---------------------------------------------------------------------------
	// mv.cellid()    入力された位置がどのセルのIDに該当するかを返す
	// mv.crossid()   入力された位置がどの交差点のIDに該当するかを返す
	// mv.borderid()  入力された位置がどの境界線・LineのIDに該当するかを返す(クリック用)
	// mv.excellid()  入力された位置がどのEXCELLのIDに該当するかを返す
	// mv.borderpos() 入力された位置が仮想セル上でどこの(X*2,Y*2)に該当するかを返す。
	//                外枠の左上が(0,0)で右下は(k.qcols*2,k.qrows*2)。rcは0～0.5のパラメータ。
	//---------------------------------------------------------------------------
	cellid : function(){
		var pos = this.borderpos(0);
		if(this.inputPoint.x%k.cwidth===0 || this.inputPoint.y%k.cheight===0){ return null;} // ぴったりは無効
		return bd.cnum(pos.x,pos.y);
	},
	crossid : function(){
		var pos = this.borderpos(0.5);
		return bd.xnum(pos.x,pos.y);
	},
	excellid : function(){
		var pos = this.borderpos(0);
		if(this.inputPoint.x%k.cwidth===0 || this.inputPoint.y%k.cheight===0){ return null;} // ぴったりは無効
		return bd.exnum(pos.x,pos.y);
	},
	borderpos : function(rc){
		// マイナスでもシームレスな値にしたいので、+4して-4する
		var pm = rc*k.cwidth, px=(this.inputPoint.x+pm+2*k.cwidth), py=(this.inputPoint.y+pm+2*k.cheight);
		var bx = ((px/k.cwidth)|0)*2  + ((px%k.cwidth <2*pm)?0:1) - 4;
		var by = ((py/k.cheight)|0)*2 + ((py%k.cheight<2*pm)?0:1) - 4;

		return new Address(bx,by);
	},

	borderid : function(spc){
		var bx = ((this.inputPoint.x/k.cwidth)<<1)+1, by = ((this.inputPoint.y/k.cheight)<<1)+1;
		var dx = this.inputPoint.x%k.cwidth,          dy = this.inputPoint.y%k.cheight;

		// 真ん中のあたりはどこにも該当しないようにする
		if(k.isLineCross){
			if(!k.isborderAsLine){
				var m1=spc*k.cwidth, m2=(1-spc)*k.cwidth;
				if((dx<m1||m2<dx) && (dy<m1||m2<dy)){ return null;}
			}
			else{
				var m1=(0.5-spc)*k.cwidth, m2=(0.5+spc)*k.cwidth;
				if(m1<dx && dx<m2 && m1<dy && dy<m2){ return null;}
			}
		}

		if(dx<k.cwidth-dy){	//左上
			if(dx>dy){ return bd.bnum(bx  ,by-1);}	//左上＆右上 -> 上
			else     { return bd.bnum(bx-1,by  );}	//左上＆左下 -> 左
		}
		else{	//右下
			if(dx>dy){ return bd.bnum(bx+1,by  );}	//右下＆右上 -> 右
			else     { return bd.bnum(bx,  by+1);}	//右下＆左下 -> 下
		}
		return null;
	},

	//---------------------------------------------------------------------------
	// mv.inputcell() Cellのqans(回答データ)に0/1/2のいずれかを入力する。
	// mv.decIC()     0/1/2どれを入力すべきかを決定する。
	//---------------------------------------------------------------------------
	inputcell : function(){
		var cc = this.cellid();
		if(cc===null || cc===this.mouseCell){ return;}
		if(this.inputData===null){ this.decIC(cc);}

		this.mouseCell = cc; 

		if(k.NumberIsWhite && bd.QnC(cc)!==-1 && (this.inputData===1||(this.inputData===2 && pc.bcolor==="white"))){ return;}
		if(k.RBBlackCell && this.inputData===1){
			if(this.firstCell===null){ this.firstCell = cc;}
			var obj1=bd.cell[this.firstCell], obj2=bd.cell[cc];
			if(((obj1.bx&2)^(obj1.by&2))!==((obj2.bx&2)^(obj2.by&2))){ return;}
		}

		(this.inputData==1?bd.setBlack:bd.setWhite).apply(bd,[cc]);
		bd.sQsC(cc, (this.inputData===2?1:0));

		pc.paintCell(cc);
	},
	decIC : function(cc){
		if(pp.getVal('use')==1){
			if     (this.btn.Left) { this.inputData=(bd.isWhite(cc)  ? 1 : 0); }
			else if(this.btn.Right){ this.inputData=((bd.QsC(cc)!==1)? 2 : 0); }
		}
		else if(pp.getVal('use')==2){
			if(this.btn.Left){
				if     (bd.isBlack(cc)){ this.inputData=2;}
				else if(bd.QsC(cc)===1){ this.inputData=0;}
				else{ this.inputData=1;}
			}
			else if(this.btn.Right){
				if     (bd.isBlack(cc)){ this.inputData=0;}
				else if(bd.QsC(cc)===1){ this.inputData=1;}
				else{ this.inputData=2;}
			}
		}
	},
	//---------------------------------------------------------------------------
	// mv.inputqnum()      Cellのqnum(数字データ)に数字を入力する
	// mv.inputqnum_main() Cellのqnum(数字データ)に数字を入力する(メイン処理)
	//---------------------------------------------------------------------------
	inputqnum : function(){
		var cc = this.cellid();
		if(cc===null || cc===this.mouseCell){ return;}

		if(cc===tc.getTCC() || this.inputqnumDirectly){
			if(k.editmode && k.roomNumber){ cc = area.getTopOfRoomByCell(cc);}

			var type=0;
			if     (k.editmode)       { type =-1;}
			else if(k.NumberWithMB)   { type = 2;}
			else if(bd.numberAsObject){ type = 1;}
			this.inputqnum_main(cc,type);
		}
		else{
			var cc0 = tc.getTCC();
			tc.setTCC(cc);
			pc.paintCell(cc0);
		}
		this.mouseCell = cc;

		pc.paintCell(cc);
	},
	inputqnum_main : function(cc,type){
		if(k.playmode && bd.QnC(cc)!==Cell.prototype.defqnum){ return;}

		var max = bd.nummaxfunc(cc), bn = (k.dispzero?0:1);
		var num=bd.getNum(cc), sub=(k.editmode ? 0 : bd.QsC(cc));
		var val=-1, vals=0, ishatena=(k.editmode && this.enableInputHatena);

		// playmode: typeは0以上、subに何かの値が入る
		// editmode: typeは-1固定、subは常に0が入る
		if(this.btn.Left){
			if     (num===max){ if(type>=1){ vals = 1;}}
			else if(sub===1)  { if(type>=2){ vals = 2;}}
			else if(sub===2)  { val = -1;}
			else if(num===-1) { val = (ishatena ? -2 : bn);}
			else if(num===-2) { val = bn;}
			else              { val = num+1;}
		}
		else if(this.btn.Right){
			if     (sub===1) { val = max;}
			else if(sub===2) { vals = 1;}
			else if(num===-1 && type>=1){ vals = type;}
			else if(num===-1){ val = max;}
			else if(num===-2){ val = -1;}
			else if(num===bn){ val = (ishatena ? -2 : -1);}
			else             { val = num-1;}
		}
		bd.setNum(cc,(val-vals));
	},

	//---------------------------------------------------------------------------
	// mv.inputQues() Cellのquesデータをarrayのとおりに入力する
	//---------------------------------------------------------------------------
	inputQues : function(array){
		var cc = this.cellid();
		if(cc===null){ return;}

		var flag=false;
		if(cc!==tc.getTCC()){
			var cc0 = tc.getTCC();
			tc.setTCC(cc);
			pc.paintCell(cc0);
			flag = true;
		}
		else{
			var qu = bd.QuC(cc);
			if(this.btn.Left){
				for(var i=0;i<array.length-1;i++){
					if(!flag && qu===array[i]){ bd.sQuC(cc,array[i+1]); flag=true;}
				}
				if(!flag && qu===array[array.length-1]){ bd.sQuC(cc,array[0]); flag=true;}
			}
			else if(this.btn.Right){
				for(var i=array.length;i>0;i--){
					if(!flag && qu===array[i]){ bd.sQuC(cc,array[i-1]); flag=true;}
				}
				if(!flag && qu===array[0]){ bd.sQuC(cc,array[array.length-1]); flag=true;}
			}
		}

		if(flag){ pc.paintCell(cc);}
	},

	//---------------------------------------------------------------------------
	// mv.inputMB()   Cellのqsub(補助記号)の○, ×データを入力する
	//---------------------------------------------------------------------------
	inputMB : function(){
		var cc = this.cellid();
		if(cc===null){ return;}

		bd.sQsC(cc, (this.btn.Left?[1,2,0]:[2,0,1])[bd.QsB(cc)]);
		pc.paintCell(cc);
	},

	//---------------------------------------------------------------------------
	// mv.inputdirec() Cellのdirec(方向)のデータを入力する
	// mv.getdir()     入力がどの方向になるか取得する
	//---------------------------------------------------------------------------
	inputdirec : function(){
		var pos = this.borderpos(0);
		if(this.prevPos.equals(pos)){ return;}

		var cc=bd.cnum(this.prevPos.x, this.prevPos.y);
		if(cc!==null){
			if(bd.QnC(cc)!==-1){
				var dir = this.getdir(this.prevPos, pos);
				if(dir!==k.NONE){
					bd.sDiC(cc, (bd.DiC(cc)!==dir?dir:0));
					pc.paintCell(cc);
				}
			}
		}
		this.prevPos = pos;
	},
	getdir : function(base, current){
		if     (current.y-base.y===-2){ return k.UP;}
		else if(current.y-base.y=== 2){ return k.DN;}
		else if(current.x-base.x===-2){ return k.LT;}
		else if(current.x-base.x=== 2){ return k.RT;}
		return k.NONE;
	},

	//---------------------------------------------------------------------------
	// mv.inputtile()  黒タイル、白タイルを入力する
	//---------------------------------------------------------------------------
	inputtile : function(){
		var cc = this.cellid();
		if(cc===null || cc===this.mouseCell || bd.QuC(cc)===51){ return;}
		if(this.inputData===null){ this.decIC(cc);}

		this.mouseCell = cc; 
		var areaid = area.getRoomID(cc);

		for(var i=0;i<area.room[areaid].clist.length;i++){
			var c = area.room[areaid].clist[i];
			if(this.inputData==1 || bd.QsC(c)!=3){
				(this.inputData==1?bd.setBlack:bd.setWhite).apply(bd,[c]);
				bd.sQsC(c, (this.inputData==2?1:0));
			}
		}
		var d = ans.getSizeOfClist(area.room[areaid].clist,f_true);

		pc.paintRange(d.x1, d.y1, d.x2, d.y2);
	},

	//---------------------------------------------------------------------------
	// mv.input51()   [＼]を作ったり消したりする
	// mv.set51cell() [＼]を作成・消去するときの共通処理関数(カックロ以外はオーバーライドされる)
	//---------------------------------------------------------------------------
	input51 : function(){
		var ec = this.excellid();
		if(ec!==null){
			var pos = new Address(bd.excell[ec].bx, bd.excell[ec].by);
			var tcp=tc.getTCP();
			tc.setTCP(pos);
			pc.paintPos(tcp);
			pc.paintPos(pos);
			return;
		}

		var cc = this.cellid();
		if(cc===null){ return;}

		if(cc!==tc.getTCC()){
			var tcp=tc.getTCP();
			tc.setTCC(cc);
			pc.paintPos(tcp);
		}
		else{
			if(this.btn.Left){
				if(bd.QuC(cc)!=51){ this.set51cell(cc,true);}
				else{ kc.chtarget('shift');}
			}
			else if(this.btn.Right){ this.set51cell(cc,false);}
		}
		pc.paintCell(cc);
	},
	// ※とりあえずカックロ用
	set51cell : function(cc,val){
		if(val===true){
			bd.sQuC(cc,51);
			bd.sQnC(cc,0);
			bd.sDiC(cc,0);
			bd.sAnC(cc,-1);
		}
		else{
			bd.sQuC(cc,0);
			bd.sQnC(cc,0);
			bd.sDiC(cc,0);
			bd.sAnC(cc,-1);
		}
	},

	//---------------------------------------------------------------------------
	// mv.inputcross()     Crossのques(問題データ)に0～4を入力する。
	// mv.inputcrossMark() Crossの黒点を入力する。
	//---------------------------------------------------------------------------
	inputcross : function(){
		var cc = this.crossid();
		if(cc===null || cc===this.mouseCell){ return;}

		if(cc===tc.getTXC()){
			if(this.btn.Left){
				if(bd.QnX(cc)==4){ bd.sQnX(cc,-2);}
				else{ bd.sQnX(cc,bd.QnX(cc)+1);}
			}
			else if(this.btn.Right){
				if(bd.QnX(cc)==-2){ bd.sQnX(cc,4);}
				else{ bd.sQnX(cc,bd.QnX(cc)-1);}
			}
		}
		else{
			var cc0 = tc.getTXC();
			tc.setTXC(cc);
			pc.paintCross(cc0);
		}
		this.mouseCell = cc;

		pc.paintCross(cc);
	},
	inputcrossMark : function(){
		var pos = this.borderpos(0.24);
		if((pos.x&1) || (pos.y&1)){ return;}
		var bm = (k.iscross===2?0:2);
		if(pos.x<bd.minbx+bm || pos.x>bd.maxbx-bm || pos.y<bd.minby+bm || pos.y>bd.maxby-bm){ return;}

		var cc = bd.xnum(pos.x,pos.y);
		if(cc===null){ return;}

		um.disCombine = 1;
		bd.sQnX(cc,(bd.QnX(cc)==1)?-1:1);
		um.disCombine = 0;

		pc.paintCross(cc);
	},
	//---------------------------------------------------------------------------
	// mv.inputborder()    盤面境界線の問題データを入力する
	// mv.inputborderans() 盤面境界線の回答データを入力する
	// mv.inputBD()        上記二つの共通処理関数
	// mv.getborderID()    入力対象となる境界線のIDを取得する
	//---------------------------------------------------------------------------
	inputborder : function(){ this.inputBD(0);},
	inputborderans : function(){ this.inputBD(1);},
	inputBD : function(flag){
		var pos = this.borderpos(0.35);
		if(this.prevPos.equals(pos)){ return;}

		var id = this.getborderID(this.prevPos, pos);
		if(id!==null){
			if(flag!==2){
				if(this.inputData===null){ this.inputData=(bd.isBorder(id)?0:1);}
				if     (this.inputData===1){ bd.setBorder(id);}
				else if(this.inputData===0){ bd.removeBorder(id);}
			}
			else{
				if(this.inputData===null){ this.inputData=(bd.isLine(id)?0:1);}
				if     (this.inputData===1){ bd.setLine(id);}
				else if(this.inputData===0){ bd.removeLine(id);}
			}
			pc.paintBorder(id);
		}
		this.prevPos = pos;
	},
	getborderID : function(base, current){
		if(((current.x&1)===0 && base.x===current.x && Math.abs(base.y-current.y)===1) ||
		   ((current.y&1)===0 && base.y===current.y && Math.abs(base.x-current.x)===1) )
			{ return ((((base.x+base.y)&1)===1) ? bd.bnum(base.x, base.y) : bd.bnum(current.x, current.y));}
		return null;
	},

	//---------------------------------------------------------------------------
	// mv.inputLine()     盤面の線を入力する
	// mv.inputQsubLine() 盤面の境界線用補助記号を入力する
	// mv.inputLine1()    上記二つの共通処理関数
	// mv.getnb()         上下左右に隣接する境界線のIDを取得する
	//---------------------------------------------------------------------------
	inputLine : function(){
		if(!k.isborderAsLine){ this.inputLine1(0);}
		else                 { this.inputBD(2);}
	},
	inputQsubLine : function(){ this.inputLine1(1);},
	inputLine1 : function(flag){
		var pos = this.borderpos(0);
		if(this.prevPos.equals(pos)){ return;}

		var id = this.getnb(this.prevPos, pos);
		if(id!==null){
			if(flag===0){
				if(this.inputData===null){ this.inputData=(bd.isLine(id)?0:1);}
				if     (this.inputData===1){ bd.setLine(id);}
				else if(this.inputData===0){ bd.removeLine(id);}
			}
			else if(flag===1){
				if(this.inputData===null){ this.inputData=(bd.QsB(id)===0?1:0);}
				if     (this.inputData===1){ bd.sQsB(id, 1);}
				else if(this.inputData===0){ bd.sQsB(id, 0);}
			}
			pc.paintLine(id);
		}
		this.prevPos = pos;
	},
	getnb : function(base, current){
		if     (current.y-base.y===-2){ return bd.bnum(base.x  ,base.y-1);}
		else if(current.y-base.y=== 2){ return bd.bnum(base.x  ,base.y+1);}
		else if(current.x-base.x===-2){ return bd.bnum(base.x-1,base.y  );}
		else if(current.x-base.x=== 2){ return bd.bnum(base.x+1,base.y  );}
		return null;
	},

	//---------------------------------------------------------------------------
	// mv.inputpeke()   盤面の線が通らないことを示す×を入力する
	//---------------------------------------------------------------------------
	inputpeke : function(){
		var pos = this.borderpos(0.22);
		if(this.prevPos.equals(pos)){ return;}

		var id = bd.bnum(pos.x, pos.y);
		if(id!==null){
			if(this.inputData===null){ this.inputData=(bd.QsB(id)===0?2:3);}
			if     (this.inputData===2){ bd.setPeke(id);}
			else if(this.inputData===3){ bd.removeLine(id);}
			pc.paintLine(id);
		}
		this.prevPos = pos;
	},

	//---------------------------------------------------------------------------
	// mv.dispRed() ひとつながりの黒マスを赤く表示する
	// mv.db0()     ななめつながりの黒マスを赤く表示する(再起呼び出し用関数)
	// mv.dispRedLine()  ひとつながりの線を赤く表示する
	//---------------------------------------------------------------------------
	dispRed : function(){
		var cc = this.cellid();
		this.mousereset();
		if(cc===null || !bd.isBlack(cc)){ return;}
		if(!k.RBBlackCell){ bd.sErC(area.bcell[area.bcell.id[cc]].clist,1);}
		else{ this.db0(function(c){ return (bd.isBlack(c) && bd.cell[c].error===0);},cc,1);}
		ans.errDisp = true;
		pc.paintAll();
	},
	db0 : function(func, cc, num){
		if(bd.cell[cc].error!==0){ return;}
		bd.sErC([cc],num);
		var bx=bd.cell[cc].bx, by=bd.cell[cc].by, clist=bd.cellinside(bx-2,by-2,bx+2,by+2);
		for(var i=0;i<clist.length;i++){
			var c = clist[i];
			if(c!==cc && func(c)){ this.db0(func, c, num);}
		}
	},

	dispRedLine : function(){
		var id = this.borderid(0.15);
		this.mousereset();
		if(id===null){ return;}

		if(!bd.isLine(id)){
			var cc = (!k.isborderAsLine?this.cellid():this.crossid());
			if(cc===null || (line.iscrossing(cc) && (line.lcntCell(cc)==3 || line.lcntCell(cc)==4))){ return;}

			var bx, by;
			if(k.isbordeAsLine==0){ bx = (cc%k.qcols)<<1, by = (cc/k.qcols)<<1;}
			else{ bx = (cc%(k.qcols+1))<<1, by = (cc/(k.qcols+1))<<1;}
			id = (function(bx,by){
				if     (bd.isLine(bd.bnum(bx-1,by))){ return bd.bnum(bx-1,by);}
				else if(bd.isLine(bd.bnum(bx+1,by))){ return bd.bnum(bx+1,by);}
				else if(bd.isLine(bd.bnum(bx,by-1))){ return bd.bnum(bx,by-1);}
				else if(bd.isLine(bd.bnum(bx,by+1))){ return bd.bnum(bx,by+1);}
				return null;
			})(bx,by);
		}
		if(id===null){ return;}

		bd.sErBAll(2); bd.sErB(line.data[line.data.id[id]].idlist,1);
		ans.errDisp = true;
		pc.paintAll();
	}
};

//---------------------------------------------------------------------------
// ★KeyEventクラス キーボード入力に関する情報の保持とイベント処理を扱う
//---------------------------------------------------------------------------
// パズル共通 キーボード入力部
// KeyEventクラスを定義
KeyEvent = function(){
	this.enableKey = true;	// キー入力は有効か

	this.isCTRL;
	this.isALT;	// ALTはメニュー用なので極力使わない
	this.isSHIFT;
	this.inUNDO;
	this.inREDO;
	this.tcMoved;	// カーソル移動時にスクロールさせない
	this.keyPressed;
	this.ca;
	this.prev;

	this.keyreset();
};
KeyEvent.prototype = {
	//---------------------------------------------------------------------------
	// kc.keyreset() キーボード入力に関する情報を初期化する
	//---------------------------------------------------------------------------
	keyreset : function(){
		this.isCTRL  = false;
		this.isALT   = false;
		this.isSHIFT = false;
		this.inUNDO  = false;
		this.inREDO  = false;
		this.tcMoved = false;
		this.keyPressed = false;
		this.prev = null;
		this.ca = '';
		if(this.isZ){ this.isZ = false;}
		if(this.isX){ this.isX = false;}
	},

	//---------------------------------------------------------------------------
	// kc.e_keydown()  キーを押した際のイベント共通処理
	// kc.e_keyup()    キーを離した際のイベント共通処理
	// kc.e_keypress() キー入力した際のイベント共通処理(-キー用)
	//---------------------------------------------------------------------------
	// この3つのキーイベントはwindowから呼び出される(kcをbindしている)
	// 48～57は0～9キー、65～90はa～z、96～105はテンキー、112～123はF1～F12キー
	e_keydown : function(e){
		if(this.enableKey){
			um.newOperation(true);
			this.ca = this.getchar(e, this.getKeyCode(e));
			this.tcMoved = false;
			if(!this.isZ){ bd.errclear();}

			if(!this.keydown_common(e)){
				if(this.ca){ this.keyinput(this.ca);}	// 各パズルのルーチンへ
				this.keyPressed = true;
			}

			if(this.tcMoved){
				ee.preventDefault(e);
				return false;
			}
		}
	},
	e_keyup : function(e){
		if(this.enableKey){
			um.newOperation(false);
			this.ca = this.getchar(e, this.getKeyCode(e));
			this.keyPressed = false;

			if(!this.keyup_common(e)){
				if(this.ca){ this.keyup(this.ca);}	// 各パズルのルーチンへ
			}
		}
	},
	//(keypressのみ)45は-(マイナス)
	e_keypress : function(e){
		if(this.enableKey){
			um.newOperation(false);
			this.ca = this.getcharp(e, this.getKeyCode(e));

			if(this.ca){ this.keyinput(this.ca);}	// 各パズルのルーチンへ
		}
	},

	//---------------------------------------------------------------------------
	// base.e_SLkeydown() Silverlightオブジェクトにフォーカスがある時、キーを押した際のイベント共通処理
	// base.e_SLkeyup()   Silverlightオブジェクトにフォーカスがある時、キーを離した際のイベント共通処理
	//---------------------------------------------------------------------------
	e_SLkeydown : function(sender, keyEventArgs){
		var emulate = { keyCode : keyEventArgs.platformKeyCode, shiftKey:keyEventArgs.shift, ctrlKey:keyEventArgs.ctrl,
						altKey:false, returnValue:false, preventDefault:f_true };
		return kc.e_keydown(emulate);
	},
	e_SLkeyup : function(sender, keyEventArgs){
		var emulate = { keyCode : keyEventArgs.platformKeyCode, shiftKey:keyEventArgs.shift, ctrlKey:keyEventArgs.ctrl,
						altKey:false, returnValue:false, preventDefault:f_true };
		return kc.e_keyup(emulate);
	},

	//---------------------------------------------------------------------------
	// kc.keyinput() キーを押した際のイベント処理。各パズルのファイルでオーバーライドされる。
	// kc.keyup()    キーを離した際のイベント処理。各パズルのファイルでオーバーライドされる。
	//---------------------------------------------------------------------------
	// オーバーライド用
	keyinput : function(ca){ },
	keyup    : function(ca){ },

	//---------------------------------------------------------------------------
	// kc.getchar()    入力されたキーを表す文字列を返す
	// kc.getcharp()   入力されたキーを表す文字列を返す(keypressの時)
	// kc.getKeyCode() 入力されたキーのコードを数字で返す
	//---------------------------------------------------------------------------
	getchar : function(e, keycode){
		if     (e.keyCode == 38)            { return k.KEYUP;}
		else if(e.keyCode == 40)            { return k.KEYDN;}
		else if(e.keyCode == 37)            { return k.KEYLT;}
		else if(e.keyCode == 39)            { return k.KEYRT;}
		else if(48<=keycode && keycode<=57) { return (keycode - 48).toString(36);}
		else if(65<=keycode && keycode<=90) { return (keycode - 55).toString(36);} //アルファベット
		else if(96<=keycode && keycode<=105){ return (keycode - 96).toString(36);} //テンキー対応
		else if(112<=keycode && keycode<=123){return 'F'+(keycode - 111).toString(10);}
		else if(keycode==32 || keycode==46) { return ' ';} // 32はスペースキー 46はdelキー
		else if(keycode==8)                 { return 'BS';}
		else if(e.shiftKey)                 { return 'shift';}
		else{ return '';}
	},
	getcharp : function(e, keycode){
		if(keycode==45){ return '-';}
		else{ return '';}
	},
	getKeyCode : function(e){
		return !!e.keyCode ? e.keyCode: e.charCode;
	},

	//---------------------------------------------------------------------------
	// kc.keydown_common() キーを押した際のイベント共通処理(Shift,Undo,F2等)
	// kc.keyup_common()   キーを離した際のイベント共通処理(Shift,Undo等)
	//---------------------------------------------------------------------------
	keydown_common : function(e){
		var flag = false;
		if(!this.isSHIFT && e.shiftKey){ this.isSHIFT=true; }
		if(!this.isCTRL  && e.ctrlKey ){ this.isCTRL=true;  flag = true; }
		if(!this.isALT   && e.altKey  ){ this.isALT=true;   flag = true; }

		if(this.isCTRL && this.ca=='z'){ this.inUNDO=true; flag = true; tm.startUndoTimer();}
		if(this.isCTRL && this.ca=='y'){ this.inREDO=true; flag = true; tm.startUndoTimer();}

		if(this.ca=='F2' && k.EDITOR){ // 112～123はF1～F12キー
			if     (k.editmode && !this.isSHIFT){ pp.setVal('mode',3); flag = true;}
			else if(k.playmode &&  this.isSHIFT){ pp.setVal('mode',1); flag = true;}
		}
		flag = (flag || debug.keydown(this.ca));

		return flag;
	},
	keyup_common : function(e){
		var flag = false;
		if(this.isSHIFT && !e.shiftKey){ this.isSHIFT=false; flag = true; }
		if((this.isCTRL || this.inUNDO || this.inREDO)  && !e.ctrlKey ){ this.isCTRL=false;  flag = true; this.inUNDO = false; this.inREDO = false; }
		if(this.isALT   && !e.altKey  ){ this.isALT=false;   flag = true; }

		if(this.inUNDO && this.ca=='z'){ this.inUNDO=false; flag = true; }
		if(this.inREDO && this.ca=='y'){ this.inREDO=false; flag = true; }

		return flag;
	},
	//---------------------------------------------------------------------------
	// kc.moveTCell()   Cellのキーボードからの入力対象を矢印キーで動かす
	// kc.moveTCross()  Crossのキーボードからの入力対象を矢印キーで動かす
	// kc.moveTBorder() Borderのキーボードからの入力対象を矢印キーで動かす
	// kc.moveTC()      上記3つの関数の共通処理
	//---------------------------------------------------------------------------
	moveTCell   : function(ca){ return this.moveTC(ca,2);},
	moveTCross  : function(ca){ return this.moveTC(ca,2);},
	moveTBorder : function(ca){ return this.moveTC(ca,1);},
	moveTC : function(ca,mv){
		var tcp = tc.getTCP(), flag = false;
		switch(ca){
			case k.KEYUP: if(tcp.y-mv>=tc.miny){ tc.decTCY(mv); flag = true;} break;
			case k.KEYDN: if(tcp.y+mv<=tc.maxy){ tc.incTCY(mv); flag = true;} break;
			case k.KEYLT: if(tcp.x-mv>=tc.minx){ tc.decTCX(mv); flag = true;} break;
			case k.KEYRT: if(tcp.x+mv<=tc.maxx){ tc.incTCX(mv); flag = true;} break;
		}

		if(flag){
			pc.paintPos(tcp);
			pc.paintPos(tc.getTCP());
			this.tcMoved = true;
		}
		return flag;
	},

	//---------------------------------------------------------------------------
	// kc.key_inputcross() 上限maxまでの数字をCrossの問題データをして入力する(keydown時)
	//---------------------------------------------------------------------------
	key_inputcross : function(ca){
		var cc = tc.getTXC();
		var max = bd.nummaxfunc(cc), val=-1;

		if('0'<=ca && ca<='9'){
			var num = parseInt(ca), cur = bd.QnX(cc);
			if(cur<=0 || cur*10+num>max){ cur=0;}
			val = cur*10+num;
			if(val>max){ return;}
		}
		else if(ca==='-'){ bd.sQnX(cc,(bd.QnX(cc)!==-2 ? -2 : -1));}
		else if(ca===' '){ bd.sQnX(cc,-1);}
		else{ return;}

		bd.sQnX(cc,val);
		pc.paintCross(cc);
	},
	//---------------------------------------------------------------------------
	// kc.key_inputqnum() 上限maxまでの数字をCellの問題データをして入力する(keydown時)
	//---------------------------------------------------------------------------
	key_inputqnum : function(ca){
		var cc = tc.getTCC();
		if(k.editmode && k.roomNumber){ cc = area.getTopOfRoomByCell(cc);}
		var max = bd.nummaxfunc(cc), val=-1;

		if('0'<=ca && ca<='9'){
			var num = parseInt(ca), cur = bd.getNum(cc);
			if(cur<=0 || cur*10+num>max || this.prev!=cc){ cur=0;}
			val = cur*10+num;
			if(val>max){ return;}
		}
		else if(ca==='-') { val = (k.editmode?-2:-1);}
		else if(ca===' ') { val = -1;}
		else if(ca==='s1'){ val = -2;}
		else if(ca==='s2'){ val = -3;}
		else{ return;}

		bd.setNum(cc,val);
		this.prev = cc;
		pc.paintCell(cc);
	},

	//---------------------------------------------------------------------------
	// kc.key_inputdirec()  四方向の矢印などを設定する
	//---------------------------------------------------------------------------
	key_inputdirec : function(ca){
		if(!this.isSHIFT){ return false;}

		var cc = tc.getTCC();
		if(bd.QnC(cc)===-1){ return false;}

		var flag = true;
		switch(ca){
			case k.KEYUP: bd.sDiC(cc, (bd.DiC(cc)!=k.UP?k.UP:0)); break;
			case k.KEYDN: bd.sDiC(cc, (bd.DiC(cc)!=k.DN?k.DN:0)); break;
			case k.KEYLT: bd.sDiC(cc, (bd.DiC(cc)!=k.LT?k.LT:0)); break;
			case k.KEYRT: bd.sDiC(cc, (bd.DiC(cc)!=k.RT?k.RT:0)); break;
			default: flag = false;
		}

		if(flag){
			pc.paintPos(tc.getTCP());
			this.tcMoved = true;
		}
		return flag;
	},

	//---------------------------------------------------------------------------
	// kc.inputnumber51()  [＼]の数字等を入力する
	// kc.setnum51()      モード別に数字を設定する
	// kc.getnum51()      モード別に数字を取得する
	//---------------------------------------------------------------------------
	inputnumber51 : function(ca,max_obj){
		if(this.chtarget(ca)){ return;}

		var cc = tc.getTCC(), ex = null;
		if(cc===null){ ex = tc.getTEC();}
		var target = this.detectTarget(cc,ex);
		if(target===0 || (cc!==null && bd.QuC(cc)===51)){
			if(ca==='q' && cc!==null){
				mv.set51cell(cc,(bd.QuC(cc)!==51));
				pc.paintPos(tc.getTCP());
				return;
			}
		}
		if(target==0){ return;}

		var def = (target==2 ? Cell.prototype.defqnum : Cell.prototype.defqdir);
		var max = max_obj[target], val=def;

		if('0'<=ca && ca<='9'){
			var num=parseInt(ca), cur=this.getnum51(cc,ex,target);
			if(cur<=0 || cur*10+num>max || this.prev!=cc){ cur=0;}
			val = cur*10+num;
			if(val>max){ return;}
		}
		else if(ca=='-' || ca==' '){ val=def;}
		else{ return;}

		this.setnum51(cc,ex,target,val);
		this.prev = cc;
		pc.paintPos (tc.getTCP());
	},
	setnum51 : function(cc,ex,target,val){
		if(cc!=null){ (target==2 ? bd.sQnC(cc,val) : bd.sDiC(cc,val));}
		else        { (target==2 ? bd.sQnE(ex,val) : bd.sDiE(ex,val));}
	},
	getnum51 : function(cc,ex,target){
		if(cc!=null){ return (target==2 ? bd.QnC(cc) : bd.DiC(cc));}
		else        { return (target==2 ? bd.QnE(ex) : bd.DiE(ex));}
	},

	//---------------------------------------------------------------------------
	// kc.chtarget()     SHIFTを押した時に[＼]の入力するところを選択する
	// kc.detectTarget() [＼]の右・下どちらに数字を入力するか判断する
	//---------------------------------------------------------------------------
	chtarget : function(ca){
		if(ca!='shift'){ return false;}
		if(tc.targetdir==2){ tc.targetdir=4;}
		else{ tc.targetdir=2;}
		pc.paintCell(tc.getTCC());
		return true;
	},
	detectTarget : function(cc,ex){
		if((cc===null && ex===null) || (cc!==null && bd.QuC(cc)!==51)){ return 0;}
		if(cc===bd.cellmax-1 || ex===k.qcols+k.qrows){ return 0;}
		if(cc!==null){
			if	  ((bd.rt(cc)===null || bd.QuC(bd.rt(cc))===51) &&
				   (bd.dn(cc)===null || bd.QuC(bd.dn(cc))===51)){ return 0;}
			else if(bd.rt(cc)===null || bd.QuC(bd.rt(cc))===51){ return 4;}
			else if(bd.dn(cc)===null || bd.QuC(bd.dn(cc))===51){ return 2;}
		}
		else if(ex!==null){
			if	  ((bd.excell[ex].by===-1 && bd.QuC(bd.cnum(bd.excell[ex].bx,1))===51) ||
				   (bd.excell[ex].bx===-1 && bd.QuC(bd.cnum(1,bd.excell[ex].by))===51)){ return 0;}
			else if(bd.excell[ex].by===-1){ return 4;}
			else if(bd.excell[ex].bx===-1){ return 2;}
		}

		return tc.targetdir;
	}
};

//---------------------------------------------------------------------------
// ★KeyPopupクラス マウスからキーボード入力する際のPopupウィンドウを管理する
//---------------------------------------------------------------------------
// キー入力用Popupウィンドウ
// KeyPopupクラス
KeyPopup = function(){
	this.haspanel = {1:false, 3:false};	// 有効かどうか
	this.element = null;				// キーポップアップのエレメント

	this.tdcolor = "black";
	this.imgCR = [1,1];		// img表示用画像の横×縦のサイズ

	this.tds  = [];			// resize用
	this.imgs = [];			// resize用

	this.tbodytmp = null;
	this.trtmp    = null;

	this.ORIGINAL = 99;

	// ElementTemplate
	this.EL_KPNUM   = ee.addTemplate('','td', {unselectable:'on', className:'kpnum'}, null, null);
	this.EL_KPEMPTY = ee.addTemplate('','td', {unselectable:'on'}, null, null);
	this.EL_KPIMG   = ee.addTemplate('','td', {unselectable:'on', className:'kpimgcell'}, null, null);
	this.EL_KPIMG_DIV = ee.addTemplate('','div', {unselectable:'on', className:'kpimgdiv'}, null, null);
	this.EL_KPIMG_IMG = ee.addTemplate('','img', {unselectable:'on', className:'kpimg', src:"./src/img/"+k.puzzleid+"_kp.gif"}, null, null);
};
KeyPopup.prototype = {
	//---------------------------------------------------------------------------
	// kp.kpinput()     キーポップアップから入力された時の処理をオーバーライドで記述する
	// kp.display()     キーポップアップを表示する
	// kp.inputnumber() kpinput関数を呼び出す
	//---------------------------------------------------------------------------
	// オーバーライド用
	kpinput : function(ca){ },

	display : function(){
		var mode = pp.getVal('mode');
		if(this.element && this.haspanel[mode] && pp.getVal('keypopup')){

			this.element.style.display = 'block';

			ee('panelbase1').el.style.display = (mode==1?'block':'none');
			ee('panelbase3').el.style.display = (mode==3?'block':'none');
		}
		else{
			this.element.style.display = 'none';
		}
	},
	inputnumber : function(e, ca){
		this.kpinput(ca);
	},

	//---------------------------------------------------------------------------
	// kp.generate()   キーポップアップを生成して初期化する
	// kp.gentable()   キーポップアップのテーブルを作成する
	// kp.gentable10() キーポップアップの0～9を入力できるテーブルを作成する
	// kp.gentable4()  キーポップアップの0～4を入力できるテーブルを作成する
	//---------------------------------------------------------------------------
	generate : function(type, enablemake, enableplay, func){
		if(!this.element){
			var rect = ee('divques').getRect();
			this.element = ee('keypopup').el;
			this.element.style.left   = (rect.left+48)+'px';
			this.element.style.top    = (rect.top +48)+'px';
			this.element.style.zIndex = 100;
			ee('barkeypopup').el.ondblclick = function(){ pp.setVal('keypopup',false)};
		}

		if(enablemake && k.EDITOR){ this.gentable(1, type, func);}
		if(enableplay)            { this.gentable(3, type, func);}
	},

	gentable : function(mode, type, func){
		this.haspanel[mode] = true;

		var basediv = ee('panelbase'+mode).el;
		basediv.innerHTML = '';

		var table = _doc.createElement('table');
		table.cellSpacing = '2pt';
		basediv.appendChild(table);

		this.tbodytmp = _doc.createElement('tbody');
		table.appendChild(this.tbodytmp);

		this.trtmp = null;
		if(func)							  { func.apply(kp, [mode]);}
		else if(type==0 || type==3)			  { this.gentable10(mode,type);}
		else if(type==1 || type==2 || type==4){ this.gentable4 (mode,type);}
	},

	gentable10 : function(mode, type){
		this.inputcol('num','knum0','0','0');
		this.inputcol('num','knum1','1','1');
		this.inputcol('num','knum2','2','2');
		this.inputcol('num','knum3','3','3');
		this.insertrow();
		this.inputcol('num','knum4','4','4');
		this.inputcol('num','knum5','5','5');
		this.inputcol('num','knum6','6','6');
		this.inputcol('num','knum7','7','7');
		this.insertrow();
		this.inputcol('num','knum8','8','8');
		this.inputcol('num','knum9','9','9');
		this.inputcol('num','knum_',' ',' ');
		if     (type==0){ (mode==1)?this.inputcol('num','knum.','-','?'):this.inputcol('empty','knum.','','');}
		else if(type==3){ this.inputcol('num','knum.','-','□');}
		this.insertrow();
	},
	gentable4 : function(mode, type, tbody){
		this.inputcol('num','knum0','0','0');
		this.inputcol('num','knum1','1','1');
		this.inputcol('num','knum2','2','2');
		this.inputcol('num','knum3','3','3');
		this.insertrow();
		this.inputcol('num','knum4','4','4');
		this.inputcol('empty','knumx','','');
		this.inputcol('num','knum_',' ',' ');
		if     (type==1){ (mode==1)?this.inputcol('num','knum.','-','?'):this.inputcol('empty','knum.','','');}
		else if(type==2){ this.inputcol('num','knum.', '-', '■');}
		else if(type==4){ this.inputcol('num','knum.', '-', '○');}
		this.insertrow();
	},

	//---------------------------------------------------------------------------
	// kp.inputcol()  テーブルのセルを追加する
	// kp.insertrow() テーブルの行を追加する
	//---------------------------------------------------------------------------
	inputcol : function(type, id, ca, disp){
		if(!this.trtmp){ this.trtmp = _doc.createElement('tr');}
		var _td = null;
		if(type==='num'){
			_td = ee.createEL(this.EL_KPNUM, id);
			_td.style.color = this.tdcolor;
			_td.innerHTML   = disp;
			_td.onclick     = ee.ebinder(this, this.inputnumber, [ca]);
		}
		else if(type==='empty'){
			_td = ee.createEL(this.EL_KPEMPTY, '');
		}
		else if(type==='image'){
			var _img = ee.createEL(this.EL_KPIMG_IMG, ""+id+"_i");
			var _div = ee.createEL(this.EL_KPIMG_DIV, '');
			_div.appendChild(_img);

			_td = ee.createEL(this.EL_KPIMG, id);
			_td.onclick   = ee.ebinder(this, this.inputnumber, [ca]);
			_td.appendChild(_div);

			this.imgs.push({'el':_img, 'x':disp[0], 'y':disp[1]});
		}

		if(_td){
			this.tds.push(_td);
			this.trtmp.appendChild(_td);
		}
	},
	insertrow : function(){
		if(this.trtmp){
			this.tbodytmp.appendChild(this.trtmp);
			this.trtmp = null;
		}
	},

	//---------------------------------------------------------------------------
	// kp.resize() キーポップアップのセルのサイズを変更する
	//---------------------------------------------------------------------------
	resize : function(){
		var tfunc = function(el,tsize){
			el.style.width    = ""+((tsize*0.90)|0)+"px"
			el.style.height   = ""+((tsize*0.90)|0)+"px"
			el.style.fontSize = ""+((tsize*0.70)|0)+"px";
		};
		var ifunc = function(obj,bsize){
			obj.el.style.width  = ""+(bsize*kp.imgCR[0])+"px";
			obj.el.style.height = ""+(bsize*kp.imgCR[1])+"px";
			obj.el.style.clip   = "rect("+(bsize*obj.y+1)+"px,"+(bsize*(obj.x+1))+"px,"+(bsize*(obj.y+1))+"px,"+(bsize*obj.x+1)+"px)";
			obj.el.style.top    = "-"+(obj.y*bsize+1)+"px";
			obj.el.style.left   = "-"+(obj.x*bsize+1)+"px";
		};

		if(k.cellsize>=24){
			for(var i=0,len=this.tds.length ;i<len;i++){ tfunc(this.tds[i],  k.cellsize);}
			for(var i=0,len=this.imgs.length;i<len;i++){ ifunc(this.imgs[i], (k.cellsize*0.90)|0);}
		}
		else{
			for(var i=0,len=this.tds.length ;i<len;i++){ tfunc(this.tds[i],  22);}
			for(var i=0,len=this.imgs.length;i<len;i++){ ifunc(this.imgs[i], 18);}
		}
	}
};

//---------------------------------------------------------------------------
// ★TCellクラス キー入力のターゲットを保持する
//---------------------------------------------------------------------------

TCell = function(){
	// 現在入力ターゲットになっている場所(border座標系)
	this.cursor = new Address(1,1);

	// 有効な範囲(minx,miny)-(maxx,maxy)
	this.minx = 1;
	this.miny = 1;
	this.maxx = 2*k.qcols-1;
	this.maxy = 2*k.qrows-1;

	this.crosstype = false;
};
TCell.prototype = {
	//---------------------------------------------------------------------------
	// tc.adjust()   範囲とターゲットの位置を調節する
	// tc.setAlign() モード変更時に位置がおかしい場合に調節する(オーバーライド用)
	// tc.setCrossType() 交点入力用にプロパティをセットする
	//---------------------------------------------------------------------------
	adjust : function(){
		if(this.crosstype){
			this.minx = 0;
			this.miny = 0;
			this.maxx = 2*k.qcols;
			this.maxy = 2*k.qrows;
		}
		else{
			var extUL = (k.isexcell===1 || k.isexcell===2);
			var extDR = (k.isexcell===2);
			this.minx = (!extUL ? 1 : -1);
			this.miny = (!extUL ? 1 : -1);
			this.maxx = (!extDR ? 2*k.qcols-1 : 2*k.qcols+1);
			this.maxy = (!extDR ? 2*k.qrows-1 : 2*k.qrows+1);
		}

		if(this.cursor.x<this.minx){ this.cursor.x=this.minx;}
		if(this.cursor.y<this.miny){ this.cursor.y=this.miny;}
		if(this.cursor.x>this.maxx){ this.cursor.x=this.maxx;}
		if(this.cursor.y>this.maxy){ this.cursor.y=this.maxy;}
	},
	setAlign : function(){ },

	setCrossType : function(){
		this.crosstype = true;
		this.adjust();
		this.setTCP(new Address(0,0));
	},

	//---------------------------------------------------------------------------
	// tc.incTCX(), tc.incTCY(), tc.decTCX(), tc.decTCY() ターゲットの位置を動かす
	//---------------------------------------------------------------------------
	incTCX : function(mv){ this.cursor.x+=mv;},
	incTCY : function(mv){ this.cursor.y+=mv;},
	decTCX : function(mv){ this.cursor.x-=mv;},
	decTCY : function(mv){ this.cursor.y-=mv;},

	//---------------------------------------------------------------------------
	// tc.getTCP() ターゲットの位置をAddressクラスのオブジェクトで取得する
	// tc.setTCP() ターゲットの位置をAddressクラスのオブジェクトで設定する
	// tc.getTCC() ターゲットの位置をCellのIDで取得する
	// tc.setTCC() ターゲットの位置をCellのIDで設定する
	// tc.getTXC() ターゲットの位置をCrossのIDで取得する
	// tc.setTXC() ターゲットの位置をCrossのIDで設定する
	// tc.getTBC() ターゲットの位置をBorderのIDで取得する
	// tc.setTBC() ターゲットの位置をBorderのIDで設定する
	// tc.getTEC() ターゲットの位置をEXCellのIDで取得する
	// tc.setTEC() ターゲットの位置をEXCellのIDで設定する
	//---------------------------------------------------------------------------
	getTCP : function(){ return this.cursor;},
	setTCP : function(pos){
		if(pos.x<this.minx || this.maxx<pos.x || pos.y<this.miny || this.maxy<pos.y){ return;}
		this.cursor.set(pos);
	},
	getTCC : function(){ return bd.cnum(this.cursor.x, this.cursor.y);},
	setTCC : function(id){
		if(!bd.cell[id]){ return;}
		this.cursor = new Address(bd.cell[id].bx, bd.cell[id].by);
	},
	getTXC : function(){ return bd.xnum(this.cursor.x, this.cursor.y);},
	setTXC : function(id){
		if(!bd.cross[id]){ return;}
		this.cursor = new Address(bd.cross[id].bx, bd.cross[id].by);
	},
	getTBC : function(){ return bd.bnum(this.cursor.x, this.cursor.y);},
	setTBC : function(id){
		if(!bd.border[id]){ return;}
		this.cursor = new Address(bd.border[id].bx, bd.border[id].by);
	},
	getTEC : function(){ return bd.exnum(this.cursor.x, this.cursor.y);},
	setTEC : function(id){
		if(!bd.excell[id]){ return;}
		this.cursor = new Address(bd.excell[id].bx, bd.excell[id].by);
	}
};

//---------------------------------------------------------------------------
// ★Encodeクラス URLのエンコード/デコードを扱う
//    p.html?(pid)/(qdata)
//                  qdata -> [(pflag)/](cols)/(rows)/(bstr)
//---------------------------------------------------------------------------
// URLエンコード/デコード
// Encodeクラス
Encode = function(){
	this.uri = {};

	this.uri.type;		// 入力されたURLのサイト指定部分
	this.uri.qdata;		// 入力されたURLの問題部分

	this.uri.pflag;		// 入力されたURLのフラグ部分
	this.uri.cols;		// 入力されたURLの横幅部分
	this.uri.rows;		// 入力されたURLの縦幅部分
	this.uri.bstr;		// 入力されたURLの盤面部分

	this.pidKanpen = '';
	this.pidforURL = '';

	this.outpflag  = '';
	this.outsize   = '';
	this.outbstr   = '';

	// 定数(URL形式)
	this.PZPRV3  = 0;
	this.PZPRV3E = 3;
	this.PAPRAPP = 1;
	this.KANPEN  = 2;
	this.KANPENP = 5;
	this.HEYAAPP = 4;
};
Encode.prototype = {
	//---------------------------------------------------------------------------
	// enc.init()           Encodeオブジェクトで持つ値を初期化する
	// enc.first_parseURI() 起動時にURLを解析して、puzzleidの抽出やエディタ/player判定を行う
	// enc.parseURI()       入力されたURLがどのサイト用か判定してthis.uriに値を保存する
	// enc.parseURI_xxx()   pzlURI部をpflag,bstr等の部分に分割する
	//---------------------------------------------------------------------------
	init : function(){
		this.uri.type = this.PZPRV3;
		this.uri.qdata = "";

		this.uri.pflag = "";
		this.uri.cols = 0;
		this.uri.rows = 0;
		this.uri.bstr = "";

		this.outpflag  = '';
		this.outsize   = '';
		this.outbstr   = '';
	},

	first_parseURI : function(search){
		if(search.length<=0){ return "";}

		this.init();

		var startmode = 'PLAYER';

		if     (search=="?test")       { startmode = 'TEST';   search = 'country';}
		else if(search.match(/^\?m\+/)){ startmode = 'EDITOR'; search = search.substr(3);}
		else if(search.match(/_test/)) { startmode = 'TEST';   search = search.substr(1).replace(/_test/, '');}
		else if(search.match(/_edit/)) { startmode = 'EDITOR'; search = search.substr(1).replace(/_edit/, '');}
		else if(!search.match(/\//))   { startmode = 'EDITER'; search = search.substr(1);}
		else                           { startmode = 'PLAYER'; search = search.substr(1);}
		switch(startmode){
			case 'PLAYER': k.EDITOR = false; k.editmode = false; break;
			case 'EDITOR': k.EDITOR = true;  k.editmode = true;  break;
			case 'TEST'  : k.EDITOR = true;  k.editmode = false; k.scriptcheck = true; break;
		}
		k.PLAYER    = !k.EDITOR;
		k.playmode  = !k.editmode;

		var qs = search.indexOf("/");
		if(qs>=0){
			this.parseURI_pzpr(search.substr(qs+1));
			if(!!this.uri.cols){ k.qcols = this.uri.cols;}
			if(!!this.uri.rows){ k.qrows = this.uri.rows;}

			search = search.substr(0,qs);
		}

		// alias機能
		var pid = search;
		switch(pid){
			case 'yajilin'    : this.pidforURL = 'yajilin'; pid = 'yajirin'; break;
			case 'akari'      : this.pidforURL = 'akari';   pid = 'lightup'; break;
			case 'bijutsukan' : this.pidforURL = 'akari';   pid = 'lightup'; break;
			case 'slitherlink': this.pidforURL = pid = 'slither'; break;
			case 'numberlink' : this.pidforURL = pid = 'numlin';  break;
			case 'hakyukoka'  : this.pidforURL = pid = 'ripple';  break;
			case 'masyu'      : this.pidforURL = pid = 'mashu';   break;
			default           : this.pidforURL = pid;
		}
		k.puzzleid = pid;
	},
	parseURI : function(url){
		this.init();

		// textarea上の改行が実際の改行扱いになるUAに対応(Operaとか)
		url = url.replace(/(\r|\n)/g,"");

		// カンペンの場合
		if(url.match(/www\.kanpen\.net/) || url.match(/www\.geocities(\.co)?\.jp\/pencil_applet/) ){
			// カンペンだけどデータ形式はへやわけアプレット
			if(url.indexOf("?heyawake=")>=0){
				this.parseURI_heyaapp(url.substr(url.indexOf("?heyawake=")+10));
			}
			// カンペンだけどデータ形式はぱずぷれ
			else if(url.indexOf("?pzpr=")>=0){
				this.parseURI_pzpr(url.substr(url.indexOf("?pzpr=")+6));
			}
			else{
				this.parseURI_kanpen(url.substr(url.indexOf("?problem=")+9));
			}
		}
		// へやわけアプレットの場合
		else if(url.match(/www\.geocities(\.co)?\.jp\/heyawake/)){
			this.parseURI_heyaapp(url.substr(url.indexOf("?problem=")+9));
		}
		// ぱずぷれの場合
		else{ // if(url.match(/indi\.s58\.xrea\.com/)){
			// ぱずぷれアプレットのURL
			if(url.match(/\/(sa|sc)\/pzpr\/v3/)){
				this.parseURI_pzpr(url.substr(url.indexOf("?")));
				this.uri.type = this.PZPRAPP; // ぱずぷれアプレット/URLジェネレータ
			}
			// ぱずぷれv3のURL
			else{
				this.parseURI_pzpr(url.substr(url.indexOf("/", url.indexOf("?"))+1));
			}
		}
	},
	parseURI_pzpr : function(qstr){
		this.uri.type = this.PZPRV3; // ぱずぷれv3
		this.uri.qdata = qstr;
		var inp = qstr.split("/");
		if(!isNaN(parseInt(inp[0]))){ inp.unshift("");}

		this.uri.pflag = inp.shift();
		this.uri.cols = parseInt(inp.shift());
		this.uri.rows = parseInt(inp.shift());
		this.uri.bstr = inp.join("/");
	},
	parseURI_kanpen : function(qstr){
		this.uri.type = this.KANPEN; // カンペン
		this.uri.qdata = qstr;
		var inp = qstr.split("/");

		if(k.puzzleid=="sudoku"){
			this.uri.rows = this.uri.cols = parseInt(inp.shift());
		}
		else{
			this.uri.rows = parseInt(inp.shift());
			this.uri.cols = parseInt(inp.shift());
			if(k.puzzleid=="kakuro"){ this.uri.rows--; this.uri.cols--;}
		}
		this.uri.bstr = inp.join("/");
	},
	parseURI_heyaapp : function(qstr){
		this.uri.type = this.HEYAAPP; // へやわけアプレット
		this.uri.qdata = qstr;
		var inp = qstr.split("/");

		var size = inp.shift().split("x");
		this.uri.cols = parseInt(size[0]);
		this.uri.rows = parseInt(size[1]);
		this.uri.bstr = inp.join("/");
	},

	//---------------------------------------------------------------------------
	// enc.checkpflag()   pflagに指定した文字列が含まれているか調べる
	//---------------------------------------------------------------------------
	checkpflag : function(ca){ return (this.uri.pflag.indexOf(ca)>=0);},

	//---------------------------------------------------------------------------
	// enc.pzlinput()   parseURI()を行った後に呼び出し、各パズルのpzlimport関数を呼び出す
	// enc.getURLBase() URLの元となる部分を取得する
	// 
	// enc.pzlimport()    各パズルのURL入力用(オーバーライド用)
	// enc.pzlexport()    各パズルのURL出力用(オーバーライド用)
	//---------------------------------------------------------------------------
	pzlinput : function(){
		if(this.uri.cols && this.uri.rows){
			bd.initBoardSize(this.uri.cols, this.uri.rows);
		}
		if(this.uri.bstr){
			switch(this.uri.type){
			case this.PZPRV3: case this.PZPRAPP: case this.PZPRV3E:
				this.outbstr = this.uri.bstr;
				this.pzlimport(this.uri.type);
				break;
			case this.KANPEN:
				fio.lineseek = 0;
				fio.dataarray = this.uri.bstr.replace(/_/g, " ").split("/");
				this.decodeKanpen();
				break;
			case this.HEYAAPP:
				this.decodeHeyaApp();
				break;
			}
			base.resetInfo(true);

			if(!base.initProcess){
				base.resize_canvas();
			}
		}
	},
	pzloutput : function(type){
		if(type===this.KANPEN && k.puzzleid=='lits'){ type = this.KANPENP;}
		var size='', ispflag=false;

		this.outpflag = '';
		this.outsize = '';
		this.outbstr = '';

		switch(type){
		case this.PZPRV3: case this.PZPRV3E:
			this.pzlexport(this.PZPRV3);
			size = (!this.outsize ? [k.qcols,k.qrows].join('/') : this.outsize);
			ispflag = (!!this.outpflag);
			break;

		case this.PZPRAPP: case this.KANPENP:
			this.pzlexport(this.PZPRAPP);
			size = (!this.outsize ? [k.qcols,k.qrows].join('/') : this.outsize);
			ispflag = true;
			break;

		case this.KANPEN:
			fio.datastr = "";
			this.encodeKanpen()
			this.outbstr = fio.datastr.replace(/ /g, "_");
			size = (!this.outsize ? [k.qrows,k.qcols].join('/') : this.outsize);
			break;

		case this.HEYAAPP:
			this.encodeHeyaApp();
			size = [k.qcols,k.qrows].join('x');
			break;

		default:
			return '';
		}

		var pdata = (ispflag?[this.outpflag]:[]).concat([size, this.outbstr]).join("/");
		return this.getURLBase(type) + pdata;
	},
	getURLBase : function(type){
		var domain = _doc.domain;
		if(!domain){ domain = "pzv.jp";}
		else if(domain == "indi.s58.xrea.com"){ domain = "indi.s58.xrea.com/pzpr/v3";}

		var urls = {};
		urls[this.PZPRV3]  = "http://%DOMAIN%/p.html?%PID%/";
		urls[this.PZPRV3E] = "http://%DOMAIN%/p.html?%PID%_edit/";
		urls[this.PZPRAPP] = "http://indi.s58.xrea.com/%PID%/sa/q.html?";
		urls[this.KANPEN]  = "http://www.kanpen.net/%KID%.html?problem=";
		urls[this.KANPENP] = "http://www.kanpen.net/%KID%.html?pzpr=";
		urls[this.HEYAAPP] = "http://www.geocities.co.jp/heyawake/?problem=";

		return urls[type].replace("%PID%",this.pidforURL)
						 .replace("%KID%",this.pidKanpen)
						 .replace("%DOMAIN%",domain);
	},

	// オーバーライド用
	pzlimport : function(type,bstr){ },
	pzlexport : function(type){ },
	decodeKanpen : function(){ },
	encodeKanpen : function(){ },
	decodeHeyaApp : function(bstr){ },
	encodeHeyaApp : function(){ },

	//---------------------------------------------------------------------------
	// enc.decode4Cell()  quesが0～4までの場合、デコードする
	// enc.encode4Cell()  quesが0～4までの場合、問題部をエンコードする
	//---------------------------------------------------------------------------
	decode4Cell : function(){
		var c=0, i=0, bstr = this.outbstr;
		for(i=0;i<bstr.length;i++){
			var obj = bd.cell[c], ca = bstr.charAt(i);
			if     (this.include(ca,"0","4")){ obj.qnum = parseInt(ca,16);}
			else if(this.include(ca,"5","9")){ obj.qnum = parseInt(ca,16)-5;  c++; }
			else if(this.include(ca,"a","e")){ obj.qnum = parseInt(ca,16)-10; c+=2;}
			else if(this.include(ca,"g","z")){ c+=(parseInt(ca,36)-16);}
			else if(ca=="."){ obj.qnum=-2;}

			c++;
			if(c>=bd.cellmax){ break;}
		}
		this.outbstr = bstr.substr(i+1);
	},
	encode4Cell : function(){
		var count=0, cm="";
		for(var c=0;c<bd.cellmax;c++){
			var pstr="", qn=bd.cell[c].qnum;

			if(qn>=0){
				if     (!!bd.cell[c+1]&&bd.cell[c+1].qnum!==-1){ pstr=""+    qn .toString(16);}
				else if(!!bd.cell[c+2]&&bd.cell[c+2].qnum!==-1){ pstr=""+ (5+qn).toString(16); c++; }
				else										   { pstr=""+(10+qn).toString(16); c+=2;}
			}
			else if(qn===-2){ pstr=".";}
			else{ count++;}

			if     (count=== 0){ cm += pstr;}
			else if(pstr || count===20){ cm += ((count+15).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm += ((count+15).toString(36));}

		this.outbstr += cm;
	},

	//---------------------------------------------------------------------------
	// enc.decode4Cross()  quesが0～4までの場合、デコードする
	// enc.encode4Cross()  quesが0～4までの場合、問題部をエンコードする
	//---------------------------------------------------------------------------
	decode4Cross : function(){
		var c=0, i=0, bstr = this.outbstr;
		for(i=0;i<bstr.length;i++){
			var obj = bd.cross[c], ca = bstr.charAt(i);
			if     (this.include(ca,"0","4")){ obj.qnum = parseInt(ca,16);}
			else if(this.include(ca,"5","9")){ obj.qnum = parseInt(ca,16)-5;  c++; }
			else if(this.include(ca,"a","e")){ obj.qnum = parseInt(ca,16)-10; c+=2;}
			else if(this.include(ca,"g","z")){ c+=(parseInt(ca,36)-16);}
			else if(ca=="."){ obj.qnum=-2;}

			c++;
			if(c>=bd.crossmax){ break;}
		}
		this.outbstr = bstr.substr(i+1);
	},
	encode4Cross : function(){
		var count=0, cm="";
		for(var c=0;c<bd.crossmax;c++){
			var pstr="", qn=bd.cross[c].qnum;

			if(qn>=0){
				if     (!!bd.cross[c+1]&&bd.cross[c+1].qnum!==-1){ pstr=""+    qn .toString(16);}
				else if(!!bd.cross[c+2]&&bd.cross[c+2].qnum!==-1){ pstr=""+( 5+qn).toString(16); c++; }
				else											 { pstr=""+(10+qn).toString(16); c+=2;}
			}
			else if(qn===-2){ pstr=".";}
			else{ count++;}

			if     (count=== 0){ cm += pstr;}
			else if(pstr || count===20){ cm += ((count+15).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm += ((count+15).toString(36));}

		this.outbstr += cm;
	},

	//---------------------------------------------------------------------------
	// enc.decodeNumber10()  quesが0～9までの場合、デコードする
	// enc.encodeNumber10()  quesが0～9までの場合、問題部をエンコードする
	//---------------------------------------------------------------------------
	decodeNumber10 : function(){
		var c=0, i=0, bstr = this.outbstr;
		for(i=0;i<bstr.length;i++){
			var obj = bd.cell[c], ca = bstr.charAt(i);

			if     (ca == '.')				 { obj.qnum = -2;}
			else if(this.include(ca,"0","9")){ obj.qnum = parseInt(ca,10);}
			else if(this.include(ca,"a","z")){ c += (parseInt(ca,36)-10);}

			c++;
			if(c > bd.cellmax){ break;}
		}
		this.outbstr = bstr.substr(i);
	},
	encodeNumber10 : function(){
		var cm="", count=0;
		for(var c=0;c<bd.cellmax;c++){
			var pstr="", qn=bd.cell[c].qnum;

			if     (qn===-2)       { pstr = ".";}
			else if(qn>=0 && qn<10){ pstr = qn.toString(10);}
			else{ count++;}

			if(count==0){ cm += pstr;}
			else if(pstr || count==26){ cm+=((9+count).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm+=(9+count).toString(36);}

		this.outbstr += cm;
	},

	//---------------------------------------------------------------------------
	// enc.decodeNumber16()  quesが0～8192?までの場合、デコードする
	// enc.encodeNumber16()  quesが0～8192?までの場合、問題部をエンコードする
	//---------------------------------------------------------------------------
	decodeNumber16 : function(){
		var c=0, i=0, bstr = this.outbstr;
		for(i=0;i<bstr.length;i++){
			var obj = bd.cell[c], ca = bstr.charAt(i);

			if(this.include(ca,"0","9")||this.include(ca,"a","f"))
							  { obj.qnum = parseInt(ca,16);}
			else if(ca == '-'){ obj.qnum = parseInt(bstr.substr(i+1,2),16);      i+=2;}
			else if(ca == '+'){ obj.qnum = parseInt(bstr.substr(i+1,3),16);      i+=3;}
			else if(ca == '='){ obj.qnum = parseInt(bstr.substr(i+1,3),16)+4096; i+=3;}
			else if(ca == '%'){ obj.qnum = parseInt(bstr.substr(i+1,3),16)+8192; i+=3;}
			else if(ca == '.'){ obj.qnum = -2;}
			else if(ca >= 'g' && ca <= 'z'){ c += (parseInt(ca,36)-16);}

			c++;
			if(c > bd.cellmax){ break;}
		}
		this.outbstr = bstr.substr(i);
	},
	encodeNumber16 : function(){
		var count=0, cm="";
		for(var c=0;c<bd.cellmax;c++){
			var pstr = "", qn = bd.cell[c].qnum;

			if     (qn==  -2           ){ pstr = ".";}
			else if(qn>=   0 && qn<  16){ pstr =       qn.toString(16);}
			else if(qn>=  16 && qn< 256){ pstr = "-" + qn.toString(16);}
			else if(qn>= 256 && qn<4096){ pstr = "+" + qn.toString(16);}
			else if(qn>=4096 && qn<8192){ pstr = "=" + (qn-4096).toString(16);}
			else if(qn>=8192           ){ pstr = "%" + (qn-8192).toString(16);}
			else{ count++;}

			if(count==0){ cm += pstr;}
			else if(pstr || count==20){ cm+=((15+count).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm+=(15+count).toString(36);}

		this.outbstr += cm;
	},

	//---------------------------------------------------------------------------
	// enc.decodeRoomNumber16()  部屋＋部屋の一つのquesが0～8192?までの場合、デコードする
	// enc.encodeRoomNumber16()  部屋＋部屋の一つのquesが0～8192?までの場合、問題部をエンコードする
	//---------------------------------------------------------------------------
	decodeRoomNumber16 : function(){
		area.resetRarea();
		var r=1, i=0, bstr = this.outbstr;
		for(i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i), c=area.getTopOfRoom(r), obj=bd.cell[c];

			if(this.include(ca,"0","9")||this.include(ca,"a","f"))
							  { obj.qnum = parseInt(ca,16);}
			else if(ca == '-'){ obj.qnum = parseInt(bstr.substr(i+1,2),16);       i+=2;}
			else if(ca == '+'){ obj.qnum = parseInt(bstr.substr(i+1,3),16);       i+=3;}
			else if(ca == '='){ obj.qnum = parseInt(bstr.substr(i+1,3),16)+4096;  i+=3;}
			else if(ca == '%'){ obj.qnum = parseInt(bstr.substr(i+1,3),16)+8192;  i+=3;}
			else if(ca == '*'){ obj.qnum = parseInt(bstr.substr(i+1,3),16)+12240; i+=4;}
			else if(ca == '$'){ obj.qnum = parseInt(bstr.substr(i+1,3),16)+77776; i+=5;}
			else if(ca >= 'g' && ca <= 'z'){ r += (parseInt(ca,36)-16);}

			r++;
			if(r > area.room.max){ break;}
		}
		this.outbstr = bstr.substr(i);
	},
	encodeRoomNumber16 : function(){
		area.resetRarea();
		var count=0, cm="";
		for(var r=1;r<=area.room.max;r++){
			var pstr = "", qn = bd.cell[area.getTopOfRoom(r)].qnum;

			if     (qn>=    0 && qn<   16){ pstr =       qn.toString(16);}
			else if(qn>=   16 && qn<  256){ pstr = "-" + qn.toString(16);}
			else if(qn>=  256 && qn< 4096){ pstr = "+" + qn.toString(16);}
			else if(qn>= 4096 && qn< 8192){ pstr = "=" + (qn-4096).toString(16);}
			else if(qn>= 8192 && qn<12240){ pstr = "%" + (qn-8192).toString(16);}
			else if(qn>=12240 && qn<77776){ pstr = "*" + (qn-12240).toString(16);}
			else if(qn>=77776            ){ pstr = "$" + (qn-77776).toString(16);} // 最大1126352
			else{ count++;}

			if(count==0){ cm += pstr;}
			else if(pstr || count==20){ cm+=((15+count).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm+=(15+count).toString(36);}

		this.outbstr += cm;
	},

	//---------------------------------------------------------------------------
	// enc.decodeArrowNumber16()  矢印付きquesが0～8192?までの場合、デコードする
	// enc.encodeArrowNumber16()  矢印付きquesが0～8192?までの場合、問題部をエンコードする
	//---------------------------------------------------------------------------
	decodeArrowNumber16 : function(){
		var c=0, i=0, bstr = this.outbstr;
		for(i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i), obj=bd.cell[c];

			if(this.include(ca,"0","4")){
				var ca1 = bstr.charAt(i+1);
				obj.qdir = parseInt(ca,16);
				obj.qnum = (ca1!="." ? parseInt(ca1,16) : -2);
				i++;
			}
			else if(this.include(ca,"5","9")){
				obj.qdir = parseInt(ca,16)-5;
				obj.qnum = parseInt(bstr.substr(i+1,2),16);
				i+=2;
			}
			else if(ca>='a' && ca<='z'){ c+=(parseInt(ca,36)-10);}

			c++;
			if(c > bd.cellmax){ break;}
		}
		this.outbstr = bstr.substr(i);
	},
	encodeArrowNumber16 : function(){
		var cm = "", count = 0;
		for(var c=0;c<bd.cellmax;c++){
			var pstr="", dir=bd.cell[c].qdir, qn=bd.cell[c].qnum;
			if     (qn===-2)        { pstr=(dir  )+".";}
			else if(qn>= 0&&qn<  16){ pstr=(dir  )+qn.toString(16);}
			else if(qn>=16&&qn< 256){ pstr=(dir+5)+qn.toString(16);}
			else{ count++;}

			if     (count=== 0){ cm += pstr;}
			else if(pstr || count===26){ cm += ((count+9).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm += (count+9).toString(36);}

		this.outbstr += cm;
	},

	//---------------------------------------------------------------------------
	// enc.decodeBorder() 問題の境界線をデコードする
	// enc.encodeBorder() 問題の境界線をエンコードする
	//---------------------------------------------------------------------------
	decodeBorder : function(){
		var pos1, pos2, bstr = this.outbstr, id, twi=[16,8,4,2,1];

		if(bstr){
			pos1 = Math.min(((((k.qcols-1)*k.qrows+4)/5)|0)     , bstr.length);
			pos2 = Math.min((((k.qcols*(k.qrows-1)+4)/5)|0)+pos1, bstr.length);
		}
		else{ pos1 = 0; pos2 = 0;}

		id = 0;
		for(var i=0;i<pos1;i++){
			var ca = parseInt(bstr.charAt(i),32);
			for(var w=0;w<5;w++){
				if(id<(k.qcols-1)*k.qrows){
					bd.border[id].ques=((ca&twi[w])?1:0);
					id++;
				}
			}
		}

		id = (k.qcols-1)*k.qrows;
		for(var i=pos1;i<pos2;i++){
			var ca = parseInt(bstr.charAt(i),32);
			for(var w=0;w<5;w++){
				if(id<bd.bdinside){
					bd.border[id].ques=((ca&twi[w])?1:0);
					id++;
				}
			}
		}

		area.resetRarea();
		this.outbstr = bstr.substr(pos2);
	},
	encodeBorder : function(){
		var cm="", twi=[16,8,4,2,1], num, pass;

		num = 0; pass = 0;
		for(var id=0;id<(k.qcols-1)*k.qrows;id++){
			pass+=(bd.border[id].ques * twi[num]); num++;
			if(num===5){ cm += pass.toString(32); num=0; pass=0;}
		}
		if(num>0){ cm += pass.toString(32);}

		num = 0; pass = 0;
		for(var id=(k.qcols-1)*k.qrows;id<bd.bdinside;id++){
			pass+=(bd.border[id].ques * twi[num]); num++;
			if(num===5){ cm += pass.toString(32); num=0; pass=0;}
		}
		if(num>0){ cm += pass.toString(32);}

		this.outbstr += cm;
	},

	//---------------------------------------------------------------------------
	// enc.decodeCrossMark() 黒点をデコードする
	// enc.encodeCrossMark() 黒点をエンコードする
	//---------------------------------------------------------------------------
	decodeCrossMark : function(){
		var cc=0, i=0, bstr = this.outbstr, cp=(k.iscross===2?1:0), cp2=(cp<<1);
		var rows=(k.qrows-1+cp2), cols=(k.qcols-1+cp2);
		for(i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i);

			if(this.include(ca,"0","9")||this.include(ca,"a","z")){
				cc += parseInt(ca,36);
				var bx = ((  cc%cols    +(1-cp))<<1);
				var by = ((((cc/cols)|0)+(1-cp))<<1);

				if(by>bd.maxby-2*(1-cp)){ i++; break;}
				bd.cross[bd.xnum(bx,by)].qnum = 1;
			}
			else if(ca == '.'){ cc+=35;}

			cc++;
			if(cc>=cols*rows){ i++; break;}
		}
		this.outbstr = bstr.substr(i);
	},
	encodeCrossMark : function(){
		var cm="", count=0, cp=(k.iscross===2?1:0), cp2=(cp<<1);
		var rows=(k.qrows-1+cp2), cols=(k.qcols-1+cp2);
		for(var c=0,max=cols*rows;c<max;c++){
			var pstr="";
			var bx = ((  c%cols    +(1-cp))<<1);
			var by = ((((c/cols)|0)+(1-cp))<<1);

			if(bd.cross[bd.xnum(bx,by)].qnum===1){ pstr = ".";}
			else{ count++;}

			if(pstr){ cm += count.toString(36); count=0;}
			else if(count==36){ cm += "."; count=0;}
		}
		if(count>0){ cm += count.toString(36);}

		this.outbstr += cm;
	},

	//---------------------------------------------------------------------------
	// enc.decodeCircle() 白丸・黒丸をデコードする
	// enc.encodeCircle() 白丸・黒丸をエンコードする
	//---------------------------------------------------------------------------
	decodeCircle : function(){
		var bstr = this.outbstr, c=0, tri=[9,3,1], max=(k.qcols*k.qrows);
		var pos = (bstr ? Math.min(((k.qcols*k.qrows+2)/3)|0, bstr.length) : 0);
		for(var i=0;i<pos;i++){
			var ca = parseInt(bstr.charAt(i),27);
			for(var w=0;w<3;w++){
				if(c<max){
					var val = ((ca/tri[w])|0)%3;
					if(val>0){ bd.cell[c].qnum=val;}
					c++;
				}
			}
		}
		this.outbstr = bstr.substr(pos);
	},
	encodeCircle : function(){
		var cm="", num=0, pass=0, tri=[9,3,1];
		for(var c=0;c<bd.cellmax;c++){
			if(bd.cell[c].qnum>0){ pass+=(bd.cell[c].qnum*tri[num]);}
			num++;
			if(num===3){ cm += pass.toString(27); num=0; pass=0;}
		}
		if(num>0){ cm += pass.toString(27);}

		this.outbstr += cm;
	},

	//---------------------------------------------------------------------------
	// enc.decodecross_old() Crossの問題部をデコードする(旧形式)
	//---------------------------------------------------------------------------
	decodecross_old : function(){
		var bstr = this.outbstr, c=0;
		for(var i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i);
			if(this.include(ca,"0","4")){ bd.cross[c].qnum = parseInt(ca);}

			c++;
			if(c>=bd.crossmax){ i++; break;}
		}

		this.outbstr = bstr.substr(i);
	},

	//---------------------------------------------------------------------------
	// enc.include()    文字列caはbottomとupの間にあるか
	//---------------------------------------------------------------------------
	include : function(ca, bottom, up){
		return (bottom <= ca && ca <= up);
	}
};

//---------------------------------------------------------------------------
// ★FileIOクラス ファイルのデータ形式エンコード/デコードを扱う
//---------------------------------------------------------------------------
FileIO = function(){
	this.filever = 0;
	this.lineseek = 0;
	this.dataarray = [];
	this.datastr = "";
	this.urlstr = "";
	this.currentType = 1;

	// 定数(ファイル形式)
	this.PZPR = 1;
	this.PBOX = 2;

	this.dbm = new DataBaseManager();
};
FileIO.prototype = {
	//---------------------------------------------------------------------------
	// fio.filedecode() ファイルを開く時、ファイルデータからのデコード実行関数
	//                  [menu.ex.fileopen] -> [fileio.xcg@iframe] -> [ここ]
	//---------------------------------------------------------------------------
	filedecode : function(datastr){
		this.filever = 0;
		this.lineseek = 0;
		this.dataarray = datastr.split("/");

		// ヘッダの処理
		if(this.readLine().match(/pzprv3\.?(\d+)?/)){
			if(RegExp.$1){ this.filever = parseInt(RegExp.$1);}
			if(this.readLine()!=k.puzzleid){ alert(base.getPuzzleName()+'のファイルではありません。'); return;}
			this.currentType = this.PZPR;
		}
		else{
			this.lineseek = 0;
			this.currentType = this.PBOX;
		}

		// サイズを表す文字列
		var row, col;
		if(k.puzzleid!=="sudoku"){
			row = parseInt(this.readLine(), 10);
			col = parseInt(this.readLine(), 10);
			if(this.currentType===this.PBOX && k.puzzleid==="kakuro"){ row--; col--;}
		}
		else{
			row = col = parseInt(this.readLine(), 10);
		}
		if(row<=0 || col<=0){ return;}
		bd.initBoardSize(col, row); // 盤面を指定されたサイズで初期化

		// メイン処理
		if     (this.currentType===this.PZPR){ this.decodeData();}
		else if(this.currentType===this.PBOX){ this.kanpenOpen();}

		this.dataarray = null; // 重くなりそうなので初期化

		base.resetInfo(true);
		base.resize_canvas();
	},
	//---------------------------------------------------------------------------
	// fio.fileencode() ファイル文字列へのエンコード、ファイル保存実行関数
	//                  [[menu.ex.filesave] -> [ここ]] -> [fileio.xcg@iframe]
	//---------------------------------------------------------------------------
	fileencode : function(type){
		this.filever = 0;
		this.sizestr = "";
		this.datastr = "";
		this.urlstr = "";
		this.currentType = type;

		// メイン処理
		if     (this.currentType===this.PZPR){ this.encodeData();}
		else if(this.currentType===this.PBOX){ this.kanpenSave();}

		// サイズを表す文字列
		if(!this.sizestr){ this.sizestr = [k.qrows, k.qcols].join("/");}
		this.datastr = [this.sizestr, this.datastr].join("/");

		// ヘッダの処理
		if(this.currentType===this.PZPR){
			var header = (this.filever===0 ? "pzprv3" : ("pzprv3."+this.filever));
			this.datastr = [header, k.puzzleid, this.datastr].join("/");
		}
		var bstr = this.datastr;

		// 末尾のURL追加処理
		if(this.currentType===this.PZPR){
			this.urlstr = enc.pzloutput((!k.isKanpenExist || k.puzzleid==="lits") ? enc.PZPRV3 : enc.KANPEN);
		}

		return bstr;
	},

	//---------------------------------------------------------------------------
	// fio.readLine()    ファイルに書かれている1行の文字列を返す
	// fio.readLines()   ファイルに書かれている複数行の文字列を返す
	// fio.getItemList() ファイルに書かれている改行＋スペース区切りの
	//                   複数行の文字列を配列にして返す
	//---------------------------------------------------------------------------
	readLine : function(){
		this.lineseek++;
		return this.dataarray[this.lineseek-1];
	},
	readLines : function(rows){
		this.lineseek += rows;
		return this.dataarray.slice(this.lineseek-rows, this.lineseek);
	},

	getItemList : function(rows){
		var item = [];
		var array = this.readLines(rows);
		for(var i=0;i<array.length;i++){
			var array1 = array[i].split(" ");
			var array2 = [];
			for(var c=0;c<array1.length;c++){
				if(array1[c]!=""){ array2.push(array1[c]);}
			}
			item = item.concat(array2);
		}
		return item;
	},

	//---------------------------------------------------------------------------
	// fio.decodeObj()     配列で、個別文字列から個別セルなどの設定を行う
	// fio.decodeCell()    配列で、個別文字列から個別セルの設定を行う
	// fio.decodeCross()   配列で、個別文字列から個別Crossの設定を行う
	// fio.decodeBorder()  配列で、個別文字列から個別Borderの設定を行う
	//---------------------------------------------------------------------------
	decodeObj : function(func, group, startbx, startby, endbx, endby){
		var bx=startbx, by=startby, step=2;
		var item=this.getItemList((endby-startby)/step+1);
		for(var i=0;i<item.length;i++){
			func(bd.getObject(group, bd.idnum(group,bx,by)), item[i]);

			bx+=step;
			if(bx>endbx){ bx=startbx; by+=step;}
			if(by>endby){ break;}
		}
	},
	decodeCell   : function(func){
		this.decodeObj(func, k.CELL, 1, 1, 2*k.qcols-1, 2*k.qrows-1);
	},
	decodeCross  : function(func){
		this.decodeObj(func, k.CROSS, 0, 0, 2*k.qcols,   2*k.qrows  );
	},
	decodeBorder : function(func){
		if(k.isborder===1 || k.puzzleid==='bosanowa'){
			this.decodeObj(func, k.BORDER, 2, 1, 2*k.qcols-2, 2*k.qrows-1);
			this.decodeObj(func, k.BORDER, 1, 2, 2*k.qcols-1, 2*k.qrows-2);
		}
		else if(k.isborder===2){
			if(this.currentType===this.PZPR){
				this.decodeObj(func, k.BORDER, 0, 1, 2*k.qcols  , 2*k.qrows-1);
				this.decodeObj(func, k.BORDER, 1, 0, 2*k.qcols-1, 2*k.qrows  );
			}
			// pencilboxでは、outsideborderの時はぱずぷれとは順番が逆になってます
			else if(this.currentType===this.PBOX){
				this.decodeObj(func, k.BORDER, 1, 0, 2*k.qcols-1, 2*k.qrows  );
				this.decodeObj(func, k.BORDER, 0, 1, 2*k.qcols  , 2*k.qrows-1);
			}
		}
	},

	//---------------------------------------------------------------------------
	// fio.encodeObj()     個別セルデータ等から個別文字列の設定を行う
	// fio.encodeCell()    個別セルデータから個別文字列の設定を行う
	// fio.encodeCross()   個別Crossデータから個別文字列の設定を行う
	// fio.encodeBorder()  個別Borderデータから個別文字列の設定を行う
	//---------------------------------------------------------------------------
	encodeObj : function(func, group, startbx, startby, endbx, endby){
		var step=2;
		for(var by=startby;by<=endby;by+=step){
			for(var bx=startbx;bx<=endbx;bx+=step){
				this.datastr += func(bd.getObject(group, bd.idnum(group,bx,by)));
			}
			this.datastr += "/";
		}
	},
	encodeCell   : function(func){
		this.encodeObj(func, k.CELL, 1, 1, 2*k.qcols-1, 2*k.qrows-1);
	},
	encodeCross  : function(func){
		this.encodeObj(func, k.CROSS, 0, 0, 2*k.qcols,   2*k.qrows  );
	},
	encodeBorder : function(func){
		if(k.isborder===1 || k.puzzleid==='bosanowa'){
			this.encodeObj(func, k.BORDER, 2, 1, 2*k.qcols-2, 2*k.qrows-1);
			this.encodeObj(func, k.BORDER, 1, 2, 2*k.qcols-1, 2*k.qrows-2);
		}
		else if(k.isborder===2){
			if(this.currentType===this.PZPR){
				this.encodeObj(func, k.BORDER, 0, 1, 2*k.qcols  , 2*k.qrows-1);
				this.encodeObj(func, k.BORDER, 1, 0, 2*k.qcols-1, 2*k.qrows  );
			}
			// pencilboxでは、outsideborderの時はぱずぷれとは順番が逆になってます
			else if(this.currentType===this.PBOX){
				this.encodeObj(func, k.BORDER, 1, 0, 2*k.qcols-1, 2*k.qrows  );
				this.encodeObj(func, k.BORDER, 0, 1, 2*k.qcols  , 2*k.qrows-1);
			}
		}
	},

	//---------------------------------------------------------------------------
	// fio.decodeCellQnum() 問題数字のデコードを行う
	// fio.encodeCellQnum() 問題数字のエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellQnum : function(){
		this.decodeCell( function(obj,ca){
			if     (ca==="-"){ obj.qnum = -2;}
			else if(ca!=="."){ obj.qnum = parseInt(ca);}
		});
	},
	encodeCellQnum : function(){
		this.encodeCell( function(obj){
			if     (obj.qnum>=0)  { return (obj.qnum.toString()+" ");}
			else if(obj.qnum===-2){ return "- ";}
			else                  { return ". ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeCellQnumb() 黒背景な問題数字のデコードを行う
	// fio.encodeCellQnumb() 黒背景な問題数字のエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellQnumb : function(){
		this.decodeCell( function(obj,ca){
			if     (ca==="5"){ obj.qnum = -2;}
			else if(ca!=="."){ obj.qnum = parseInt(ca);}
		});
	},
	encodeCellQnumb : function(){
		this.encodeCell( function(obj){
			if     (obj.qnum>=0)  { return (obj.qnum.toString()+" ");}
			else if(obj.qnum===-2){ return "5 ";}
			else                  { return ". ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeCellQnumAns() 問題数字＋黒マス白マスのデコードを行う
	// fio.encodeCellQnumAns() 問題数字＋黒マス白マスのエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellQnumAns : function(){
		this.decodeCell( function(obj,ca){
			if     (ca==="#"){ obj.qans = 1;}
			else if(ca==="+"){ obj.qsub = 1;}
			else if(ca==="-"){ obj.qnum = -2;}
			else if(ca!=="."){ obj.qnum = parseInt(ca);}
		});
	},
	encodeCellQnumAns : function(){
		this.encodeCell( function(obj){
			if     (obj.qnum>=0) { return (obj.qnum.toString() + " ");}
			else if(obj.qnum===-2){return "- ";}
			else if(obj.qans===1){ return "# ";}
			else if(obj.qsub===1){ return "+ ";}
			else                 { return ". ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeCellDirecQnum() 方向＋問題数字のデコードを行う
	// fio.encodeCellDirecQnum() 方向＋問題数字のエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellDirecQnum : function(){
		this.decodeCell( function(obj,ca){
			if(ca!=="."){
				var inp = ca.split(",");
				obj.qdir = (inp[0]!=="0"?parseInt(inp[0]): 0);
				obj.qnum = (inp[1]!=="-"?parseInt(inp[1]):-2);
			}
		});
	},
	encodeCellDirecQnum : function(){
		this.encodeCell( function(obj){
			if(obj.qnum!==-1){
				var ca1 = (obj.qdir!== 0?obj.qdir.toString():"0");
				var ca2 = (obj.qnum!==-2?obj.qnum.toString():"-");
				return [ca1, ",", ca2, " "].join('');
			}
			else{ return ". ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeCellAns() 黒マス白マスのデコードを行う
	// fio.encodeCellAns() 黒マス白マスのエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellAns : function(){
		this.decodeCell( function(obj,ca){
			if     (ca==="#"){ obj.qans = 1;}
			else if(ca==="+"){ obj.qsub = 1;}
		});
	},
	encodeCellAns : function(){
		this.encodeCell( function(obj){
			if     (obj.qans===1){ return "# ";}
			else if(obj.qsub===1){ return "+ ";}
			else                 { return ". ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeCellQanssub() 黒マスと背景色のデコードを行う
	// fio.encodeCellQanssub() 黒マスと背景色のエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellQanssub : function(){
		this.decodeCell( function(obj,ca){
			if     (ca==="+"){ obj.qsub = 1;}
			else if(ca==="-"){ obj.qsub = 2;}
			else if(ca==="="){ obj.qsub = 3;}
			else if(ca==="%"){ obj.qsub = 4;}
			else if(ca!=="."){ obj.qans = parseInt(ca);}
		});
	},
	encodeCellQanssub : function(){
		this.encodeCell( function(obj){
			if     (obj.qans!==0){ return (obj.qans.toString() + " ");}
			else if(obj.qsub===1){ return "+ ";}
			else if(obj.qsub===2){ return "- ";}
			else if(obj.qsub===3){ return "= ";}
			else if(obj.qsub===4){ return "% ";}
			else                 { return ". ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeCellAnumsub() 回答数字と背景色のデコードを行う
	// fio.encodeCellAnumsub() 回答数字と背景色のエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellAnumsub : function(){
		this.decodeCell( function(obj,ca){
			if     (ca==="+"){ obj.qsub = 1;}
			else if(ca==="-"){ obj.qsub = 2;}
			else if(ca==="="){ obj.qsub = 3;}
			else if(ca==="%"){ obj.qsub = 4;}
			else if(ca!=="."){ obj.anum = parseInt(ca);}
		});
	},
	encodeCellAnumsub : function(){
		this.encodeCell( function(obj){
			if     (obj.anum!==-1){ return (obj.anum.toString() + " ");}
			else if(obj.qsub===1) { return "+ ";}
			else if(obj.qsub===2) { return "- ";}
			else if(obj.qsub===3) { return "= ";}
			else if(obj.qsub===4) { return "% ";}
			else                  { return ". ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeCellQsub() 背景色のデコードを行う
	// fio.encodeCellQsub() 背景色のエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellQsub : function(){
		this.decodeCell( function(obj,ca){
			if(ca!=="0"){ obj.qsub = parseInt(ca);}
		});
	},
	encodeCellQsub : function(){
		this.encodeCell( function(obj){
			if(obj.qsub>0){ return (obj.qsub.toString() + " ");}
			else          { return "0 ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeCrossNum() 交点の数字のデコードを行う
	// fio.encodeCrossNum() 交点の数字のエンコードを行う
	//---------------------------------------------------------------------------
	decodeCrossNum : function(){
		this.decodeCross( function(obj,ca){
			if     (ca==="-"){ obj.qnum = -2;}
			else if(ca!=="."){ obj.qnum = parseInt(ca);}
		});
	},
	encodeCrossNum : function(){
		this.encodeCross( function(obj){
			if     (obj.qnum>=0)  { return (obj.qnum.toString() + " ");}
			else if(obj.qnum===-2){ return "- ";}
			else                  { return ". ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeBorderQues() 問題の境界線のデコードを行う
	// fio.encodeBorderQues() 問題の境界線のエンコードを行う
	//---------------------------------------------------------------------------
	decodeBorderQues : function(){
		this.decodeBorder( function(obj,ca){
			if(ca==="1"){ obj.ques = 1;}
		});
	},
	encodeBorderQues : function(){
		this.encodeBorder( function(obj){
			return (obj.ques===1?"1":"0")+" ";
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeBorderAns() 問題・回答の境界線のデコードを行う
	// fio.encodeBorderAns() 問題・回答の境界線のエンコードを行う
	//---------------------------------------------------------------------------
	decodeBorderAns : function(){
		this.decodeBorder( function(obj,ca){
			if     (ca==="2" ){ obj.qans = 1; obj.qsub = 1;}
			else if(ca==="1" ){ obj.qans = 1;}
			else if(ca==="-1"){ obj.qsub = 1;}
		});
	},
	encodeBorderAns : function(){
		this.encodeBorder( function(obj){
			if     (obj.qans===1 && obj.qsub===1){ return "2 ";}
			else if(obj.qans===1){ return "1 ";}
			else if(obj.qsub===1){ return "-1 ";}
			else                 { return "0 ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeBorderLine() Lineのデコードを行う
	// fio.encodeBorderLine() Lineのエンコードを行う
	//---------------------------------------------------------------------------
	decodeBorderLine : function(){
		this.decodeBorder( function(obj,ca){
			if     (ca==="-1"){ obj.qsub = 2;}
			else if(ca!=="0" ){ obj.line = parseInt(ca);}
		});
	},
	encodeBorderLine : function(){
		this.encodeBorder( function(obj){
			if     (obj.line>  0){ return ""+obj.line+" ";}
			else if(obj.qsub===2){ return "-1 ";}
			else                 { return "0 ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeAreaRoom() 部屋のデコードを行う
	// fio.encodeAreaRoom() 部屋のエンコードを行う
	// fio.decodeAnsAreaRoom() (回答用)部屋のデコードを行う
	// fio.encodeAnsAreaRoom() (回答用)部屋のエンコードを行う
	//---------------------------------------------------------------------------
	decodeAreaRoom : function(){ this.decodeAreaRoom_com(true);},
	encodeAreaRoom : function(){ this.encodeAreaRoom_com(true);},
	decodeAnsAreaRoom : function(){ this.decodeAreaRoom_com(false);},
	encodeAnsAreaRoom : function(){ this.encodeAreaRoom_com(false);},

	decodeAreaRoom_com : function(isques){
		this.readLine();
		this.rdata2Border(isques, this.getItemList(k.qrows));

		area.resetRarea();
	},
	encodeAreaRoom_com : function(isques){
		var rinfo = area.getRoomInfo();

		this.datastr += (rinfo.max+"/");
		for(var c=0;c<bd.cellmax;c++){
			this.datastr += (""+(rinfo.id[c]-1)+" ");
			if((c+1)%k.qcols===0){ this.datastr += "/";}
		}
	},
	//---------------------------------------------------------------------------
	// fio.rdata2Border() 入力された配列から境界線を入力する
	//---------------------------------------------------------------------------
	rdata2Border : function(isques, rdata){
		for(var id=0;id<bd.bdmax;id++){
			var cc1 = bd.border[id].cellcc[0], cc2 = bd.border[id].cellcc[1];
			var isdiff = (cc1!==null && cc2!==null && rdata[cc1]!=rdata[cc2]);
			bd.border[id][(isques?'ques':'qans')] = (isdiff?1:0);
		}
	},
	//---------------------------------------------------------------------------
	// fio.decodeCellQnum51() [＼]のデコードを行う
	// fio.encodeCellQnum51() [＼]のエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellQnum51 : function(){
		var item = this.getItemList(k.qrows+1);
		base.disableInfo(); /* mv.set51cell()用 */
		for(var i=0;i<item.length;i++) {
			if(item[i]=="."){ continue;}

			var bx=(i%(k.qcols+1)-1)*2+1, by=(((i/(k.qcols+1))|0)-1)*2+1;
			if(bx===-1 || by===-1){
				var ec = bd.exnum(bx,by);
				var property = ((by===-1)?'qdir':'qnum');
				bd.excell[ec][property] = parseInt(item[i]);
			}
			else{
				var inp = item[i].split(",");
				var c = bd.cnum(bx,by);
				mv.set51cell(c, true);
				bd.cell[c].qnum = parseInt(inp[0]);
				bd.cell[c].qdir = parseInt(inp[1]);
			}
		}
		base.enableInfo(); /* mv.set51cell()用 */
	},
	encodeCellQnum51 : function(){
		var str = "";
		for(var by=bd.minby+1;by<bd.maxby;by+=2){
			for(var bx=bd.minbx+1;bx<bd.maxbx;bx+=2){
				if     (bx===-1 && by===-1){ str += "0 ";}
				else if(bx===-1 || by===-1){
					var ec = bd.exnum(bx,by);
					var property = ((by===-1)?'qdir':'qnum');
					str += (""+bd.excell[ec][property].toString()+" ");
				}
				else{
					var c = bd.cnum(bx,by);
					if(bd.cell[c].ques===51){
						str += (""+bd.cell[c].qnum.toString()+","+bd.cell[c].qdir.toString()+" ");
					}
					else{ str += ". ";}
				}
			}
			str += "/";
		}
		this.datastr += str;
	},
	//---------------------------------------------------------------------------
	// fio.decodeCellQnum_kanpen() pencilbox用問題数字のデコードを行う
	// fio.encodeCellQnum_kanpen() pencilbox用問題数字のエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellQnum_kanpen : function(){
		this.decodeCell( function(obj,ca){
			if(ca!=="."){ obj.qnum = parseInt(ca);}
		});
	},
	encodeCellQnum_kanpen : function(){
		this.encodeCell( function(obj){
			return ((obj.qnum>=0)?(obj.qnum.toString() + " "):". ");
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeCellAnum_kanpen() pencilbox用回答数字のデコードを行う
	// fio.encodeCellAnum_kanpen() pencilbox用回答数字のエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellAnum_kanpen : function(){
		this.decodeCell( function(obj,ca){
			if(ca!=="."&&ca!=="0"){ obj.anum = parseInt(ca);}
		});
	},
	encodeCellAnum_kanpen : function(){
		this.encodeCell( function(obj){
			if     (obj.qnum!==-1){ return ". ";}
			else if(obj.anum===-1){ return "0 ";}
			else                  { return ""+obj.anum.toString()+" ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeCellQnumAns_kanpen() pencilbox用問題数字＋黒マス白マスのデコードを行う
	// fio.encodeCellQnumAns_kanpen() pencilbox用問題数字＋黒マス白マスのエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellQnumAns_kanpen : function(){
		this.decodeCell( function(obj,ca){
			if     (ca==="#"){ obj.qans = 1;}
			else if(ca==="+"){ obj.qsub = 1;}
			else if(ca!=="."){ obj.qnum = parseInt(ca);}
		});
	},
	encodeCellQnumAns_kanpen : function(){
		this.encodeCell( function(obj){
			if     (obj.qnum>=0 ){ return (obj.qnum.toString() + " ");}
			else if(obj.qans===1){ return "# ";}
			else if(obj.qsub===1){ return "+ ";}
			else                 { return ". ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeSquareRoom() pencilbox用四角形の部屋のデコードを行う
	// fio.encodeSquareRoom() pencilbox用四角形の部屋のエンコードを行う
	// fio.decodeAnsSquareRoom() (回答用)pencilbox用四角形の部屋のデコードを行う
	// fio.encodeAnsSquareRoom() (回答用)pencilbox用四角形の部屋のエンコードを行う
	//---------------------------------------------------------------------------
	decodeSquareRoom : function(){ this.decodeSquareRoom_com(true);},
	encodeSquareRoom : function(){ this.encodeSquareRoom_com(true);},
	decodeAnsSquareRoom : function(){ this.decodeSquareRoom_com(false);},
	encodeAnsSquareRoom : function(){ this.encodeSquareRoom_com(false);},

	decodeSquareRoom_com : function(isques){
		var rmax = parseInt(this.readLine());
		var barray = this.readLines(rmax);
		var rdata = [];
		for(var i=0;i<barray.length;i++){
			if(barray[i]==""){ break;}
			var pce = barray[i].split(" ");
			for(var n=0;n<4;n++){ if(!isNaN(pce[n])){ pce[n]=parseInt(pce[n]);} }

			var sp = {y1:2*pce[0]+1, x1:2*pce[1]+1, y2:2*pce[2]+1, x2:2*pce[3]+1};
			if(isques && pce[4]!=""){
				var c = bd.cnum(sp.x1,sp.y1);
				bd.cell[c].qnum = parseInt(pce[4],10);
			}
			this.setRdataRect(rdata, i, sp);
		}
		this.rdata2Border(isques, rdata);

		area.resetRarea();
	},
	setRdataRect : function(rdata, i, sp){
		for(var bx=sp.x1;bx<=sp.x2;bx+=2){
			for(var by=sp.y1;by<=sp.y2;by+=2){
				rdata[bd.cnum(bx,by)] = i;
			}
		}
	},
	encodeSquareRoom_com : function(isques){
		var rinfo = area.getRoomInfo();

		this.datastr += (rinfo.max+"/");
		for(var id=1;id<=rinfo.max;id++){
			var d = ans.getSizeOfClist(rinfo.room[id].idlist,f_true);
			var num = (isques ? bd.cell[area.getTopOfRoom(id)].qnum : -1);
			this.datastr += (""+(d.y1>>1)+" "+(d.x1>>1)+" "+(d.y2>>1)+" "+(d.x2>>1)+" "+(num>=0 ? ""+num : "")+"/");
		}
	}
};

//---------------------------------------------------------------------------
// ★DataBaseManagerクラス Web SQL DataBase用 データベースの設定・管理を行う
//---------------------------------------------------------------------------
DataBaseManager = function(){
	this.dbh    = null;	// データベースハンドラ

	//this.DBtype = 0;
	this.DBaccept = 0;	// データベースのタイプ 1:Gears 2:WebDB 4:IdxDB 8:localStorage

	this.DBsid  = -1;	// 現在選択されているリスト中のID
	this.DBlist = [];	// 現在一覧にある問題のリスト
	this.keys = ['id', 'col', 'row', 'hard', 'pdata', 'time', 'comment']; // キーの並び

	this.selectDBtype();
};
DataBaseManager.prototype = {
	//---------------------------------------------------------------------------
	// fio.dbm.selectDBtype() Web DataBaseが使えるかどうか判定する(起動時)
	// fio.dbm.requestGears() gears_init.jsを読み出すか判定する
	//---------------------------------------------------------------------------
	selectDBtype : function(){
		// HTML5 - Web localStorage判定用
		if(!!window.localStorage){
			// FirefoxはローカルだとlocalStorageが使えない
			if(!k.br.Gecko || !!location.hostname){ this.DBaccept |= 0x08;}
		}

		// HTML5 - Web DataBase判定用
		if(!!window.openDatabase){
			try{	// Opera10.50対策
				var dbtmp = openDatabase('pzprv3_manage', '1.0');	// Chrome3対策
				if(!!dbtmp){ this.DBaccept |= 0x02;}
			}
			catch(e){}
		}

		// 以下はGears用(gears_init.jsの判定ルーチン的なもの)
		// Google Chorme用(既にGearsが存在するか判定)
		try{
			if((window.google && google.gears) || // 既にGearsが初期化済
			   (typeof GearsFactory != 'undefined') || 										// Firefoxの時
			   (!!window.ActiveXObject && (!!(new ActiveXObject('Gears.Factory')))) ||		// IEの時
			   (!!navigator.mimeTypes && navigator.mimeTypes["application/x-googlegears"]))	// Webkitの時
			{ this.DBaccept |= 0x01;}
		}
		catch(e){}
	},
	requireGears : function(){
		return !!(this.DBaccept & 0x01);
	},

	//---------------------------------------------------------------------------
	// fio.dbm.openDialog()    データベースダイアログが開いた時の処理
	// fio.dbm.openHandler()   データベースハンドラを開く
	//---------------------------------------------------------------------------
	openDialog : function(){
		this.openHandler();
		this.update();
	},
	openHandler : function(){
		// データベースを開く
		var type = 0;
		if     (this.DBaccept & 0x08){ type = 4;}
		else if(this.DBaccept & 0x04){ type = 3;}
		else if(this.DBaccept & 0x02){ type = 2;}
		else if(this.DBaccept & 0x01){ type = 1;}

		switch(type){
			case 1: case 2: this.dbh = new DataBaseHandler_SQL((type===2)); break;
			case 4:         this.dbh = new DataBaseHandler_LS(); break;
			default: return;
		}
		this.dbh.importDBlist(this);

		var sortlist = { idlist:"ID順", newsave:"保存が新しい順", oldsave:"保存が古い順", size:"サイズ/難易度順"};
		var str="";
		for(s in sortlist){ str += ("<option value=\""+s+"\">"+sortlist[s]+"</option>");}
		_doc.database.sorts.innerHTML = str;
	},

	//---------------------------------------------------------------------------
	// fio.dbm.closeDialog()   データベースダイアログが閉じた時の処理
	// fio.dbm.clickHandler()  フォーム上のボタンが押された時、各関数にジャンプする
	//---------------------------------------------------------------------------
	closeDialog : function(){
		this.DBlist = [];
	},
	clickHandler : function(e){
		switch(ee.getSrcElement(e).name){
			case 'sorts'   : this.displayDataTableList();	// breakがないのはわざとです
			case 'datalist': this.selectDataTable();   break;
			case 'tableup' : this.upDataTable_M();     break;
			case 'tabledn' : this.downDataTable_M();   break;
			case 'open'    : this.openDataTable_M();   break;
			case 'save'    : this.saveDataTable_M();   break;
			case 'comedit' : this.editComment_M();     break;
			case 'difedit' : this.editDifficult_M();   break;
			case 'del'     : this.deleteDataTable_M(); break;
		}
	},

	//---------------------------------------------------------------------------
	// fio.dbm.getDataID()  選択中データの(this.DBlistのkeyとなる)IDを取得する
	// fio.dbm.update()     管理テーブル情報やダイアログの表示を更新する
	//---------------------------------------------------------------------------
	getDataID : function(){
		if(_doc.database.datalist.value!="new" && _doc.database.datalist.value!=""){
			for(var i=0;i<this.DBlist.length;i++){
				if(this.DBlist[i].id==_doc.database.datalist.value){ return i;}
			}
		}
		return -1;
	},
	update : function(){
		this.dbh.updateManageData(this);
			this.displayDataTableList();
			this.selectDataTable();
	},

	//---------------------------------------------------------------------------
	// fio.dbm.displayDataTableList() 保存しているデータの一覧を表示する
	// fio.dbm.getRowString()         1データから文字列を生成する
	// fio.dbm.dateString()           時刻の文字列を生成する
	//---------------------------------------------------------------------------
	displayDataTableList : function(){
			switch(_doc.database.sorts.value){
				case 'idlist':  this.DBlist = this.DBlist.sort(function(a,b){ return (a.id-b.id);}); break;
				case 'newsave': this.DBlist = this.DBlist.sort(function(a,b){ return (b.time-a.time || a.id-b.id);}); break;
				case 'oldsave': this.DBlist = this.DBlist.sort(function(a,b){ return (a.time-b.time || a.id-b.id);}); break;
				case 'size':    this.DBlist = this.DBlist.sort(function(a,b){ return (a.col-b.col || a.row-b.row || a.hard-b.hard || a.id-b.id);}); break;
			}

			var html = "";
			for(var i=0;i<this.DBlist.length;i++){
				var row = this.DBlist[i];
			if(!row){ continue;}//alert(i);}

			var valstr = " value=\""+row.id+"\"";
			var selstr = (this.DBsid==row.id?" selected":"");
			html += ("<option" + valstr + selstr + ">" + this.getRowString(row)+"</option>\n");
			}
			html += ("<option value=\"new\""+(this.DBsid==-1?" selected":"")+">&nbsp;&lt;新しく保存する&gt;</option>\n");
			_doc.database.datalist.innerHTML = html;
	},
	getRowString : function(row){
		var hardstr = [
			{ja:'−'      , en:'-'     },
			{ja:'らくらく', en:'Easy'  },
			{ja:'おてごろ', en:'Normal'},
			{ja:'たいへん', en:'Hard'  },
			{ja:'アゼン'  , en:'Expert'}
		];

		var str = "";
		str += ((row.id<10?"&nbsp;":"")+row.id+" :&nbsp;");
		str += (this.dateString(row.time*1000)+" &nbsp;");
		str += (""+row.col+"×"+row.row+" &nbsp;");
		if(!!row.hard || row.hard=='0'){
			str += (hardstr[row.hard][menu.language]);
		}
		return str;
	},
	dateString : function(time){
		var ni   = function(num){ return (num<10?"0":"")+num;};
		var str  = " ";
		var date = new Date();
		date.setTime(time);

		str += (ni(date.getFullYear()%100) + "/" + ni(date.getMonth()+1) + "/" + ni(date.getDate())+" ");
		str += (ni(date.getHours()) + ":" + ni(date.getMinutes()));
		return str;
	},

	//---------------------------------------------------------------------------
	// fio.dbm.selectDataTable() データを選択して、コメントなどを表示する
	//---------------------------------------------------------------------------
	selectDataTable : function(){
		var selected = this.getDataID();
		if(selected>=0){
			_doc.database.comtext.value = ""+this.DBlist[selected].comment;
			this.DBsid = parseInt(this.DBlist[selected].id);
		}
		else{
			_doc.database.comtext.value = "";
			this.DBsid = -1;
		}

		_doc.database.tableup.disabled = (_doc.database.sorts.value!=='idlist' || this.DBsid===-1 || this.DBsid===1);
		_doc.database.tabledn.disabled = (_doc.database.sorts.value!=='idlist' || this.DBsid===-1 || this.DBsid===this.DBlist.length);
		_doc.database.comedit.disabled = (this.DBsid===-1);
		_doc.database.difedit.disabled = (this.DBsid===-1);
		_doc.database.open.disabled    = (this.DBsid===-1);
		_doc.database.del.disabled     = (this.DBsid===-1);
	},

	//---------------------------------------------------------------------------
	// fio.dbm.upDataTable_M()      データの一覧での位置をひとつ上にする
	// fio.dbm.downDataTable_M()    データの一覧での位置をひとつ下にする
	// fio.dbm.convertDataTable_M() データの一覧での位置を入れ替える
	//---------------------------------------------------------------------------
	upDataTable_M : function(){
		var selected = this.getDataID();
		if(selected===-1 || selected===0){ return;}
		this.convertDataTable_M(selected, selected-1);
	},
	downDataTable_M : function(){
		var selected = this.getDataID();
		if(selected===-1 || selected===this.DBlist.length-1){ return;}
		this.convertDataTable_M(selected, selected+1);
	},
	convertDataTable_M : function(sid, tid){
		this.DBsid = this.DBlist[tid].id;
		var row = {};
		for(var c=1;c<7;c++){ row[this.keys[c]]              = this.DBlist[sid][this.keys[c]];}
		for(var c=1;c<7;c++){ this.DBlist[sid][this.keys[c]] = this.DBlist[tid][this.keys[c]];}
		for(var c=1;c<7;c++){ this.DBlist[tid][this.keys[c]] = row[this.keys[c]];}

		this.dbh.convertDataTableID(this, sid, tid);
		this.update();
	},

	//---------------------------------------------------------------------------
	// fio.dbm.openDataTable_M()  データの盤面に読み込む
	// fio.dbm.saveDataTable_M()  データの盤面を保存する
	//---------------------------------------------------------------------------
	openDataTable_M : function(){
		var id = this.getDataID(); if(id===-1){ return;}
		if(!confirm("このデータを読み込みますか？ (現在の盤面は破棄されます)")){ return;}

		this.dbh.openDataTable(this, id);
	},
	saveDataTable_M : function(){
		var id = this.getDataID(), refresh = false;
			if(id===-1){
			id = this.DBlist.length;
			refresh = true;

			this.DBlist[id] = {};
			var str = prompt("コメントがある場合は入力してください。","");
			this.DBlist[id].comment = (!!str ? str : '');
			this.DBlist[id].hard = 0;
			this.DBlist[id].id = id+1;
			this.DBsid = this.DBlist[id].id;
			}
			else{
			if(!confirm("このデータに上書きしますか？")){ return;}
		}
		this.DBlist[id].col   = k.qcols;
		this.DBlist[id].row   = k.qrows;
		this.DBlist[id].time  = (tm.now()/1000)|0;

		this.dbh.saveDataTable(this, id);
		this.update();
	},

	//---------------------------------------------------------------------------
	// fio.dbm.editComment_M()   データのコメントを更新する
	// fio.dbm.editDifficult_M() データの難易度を更新する
	//---------------------------------------------------------------------------
	editComment_M : function(){
		var id = this.getDataID(); if(id===-1){ return;}

		var str = prompt("この問題に対するコメントを入力してください。",this.DBlist[id].comment);
		if(str==null){ return;}

		this.DBlist[id].comment = str;
		this.dbh.updateComment(this, id);
		this.update();
	},
	editDifficult_M : function(){
		var id = this.getDataID(); if(id===-1){ return;}

		var hard = prompt("この問題の難易度を設定してください。\n[0:なし 1:らくらく 2:おてごろ 3:たいへん 4:アゼン]",this.DBlist[id].hard);
		if(hard==null){ return;}

		this.DBlist[id].hard = ((hard=='1'||hard=='2'||hard=='3'||hard=='4')?hard:0);
		this.dbh.updateDifficult(this, id);
		this.update();
	},

	//---------------------------------------------------------------------------
	// fio.dbm.deleteDataTable_M() 選択している盤面データを削除する
	//---------------------------------------------------------------------------
	deleteDataTable_M : function(){
		var id = this.getDataID(); if(id===-1){ return;}
		if(!confirm("このデータを完全に削除しますか？")){ return;}

		var sID = this.DBlist[id].id, max = this.DBlist.length;
		for(var i=sID-1;i<max-1;i++){
			for(var c=1;c<7;c++){ this.DBlist[i][this.keys[c]] = this.DBlist[i+1][this.keys[c]];}
		}
		this.DBlist.pop();

		this.dbh.deleteDataTable(this, sID, max);
		this.update();
	}

	//---------------------------------------------------------------------------
	// fio.dbm.convertDataBase() もし将来必要になったら...
	//---------------------------------------------------------------------------
/*	convertDataBase : function(){
		// ここまで旧データベース
		this.dbh.importDBlist(this);
		this.dbh.dropDataBase();

		// ここから新データベース
		this.dbh.createDataBase();
		this.dbh.setupDBlist(this);
	}
*/
};

//---------------------------------------------------------------------------
// ★DataBaseHandler_LSクラス Web localStorage用 データベースハンドラ
//---------------------------------------------------------------------------
DataBaseHandler_LS = function(){
	this.pheader = 'pzprv3_' + k.puzzleid + ':puzdata';
	this.keys = fio.dbm.keys;

	this.initialize();
};
DataBaseHandler_LS.prototype = {
	//---------------------------------------------------------------------------
	// fio.dbm.dbh.initialize()    初期化時にデータベースを開く
	// fio.dbm.dbh.importDBlist()  DataBaseからDBlistを作成する
	//---------------------------------------------------------------------------
	initialize : function(){
		this.createManageDataTable();
		this.createDataBase();
	},
	importDBlist : function(parent){
		parent.DBlist = [];
		var r=0;
		while(1){
			r++; var row = {};
			for(var c=0;c<7;c++){ row[this.keys[c]] = localStorage[this.pheader+'!'+r+'!'+this.keys[c]];}
			if(row.id==null){ break;}
			row.pdata = "";
			parent.DBlist.push(row);
		}
	},

	//---------------------------------------------------------------------------
	// fio.dbm.dbh.createManageDataTable() 管理情報テーブルを作成する(消去はなし)
	// fio.dbm.dbh.updateManageData()      管理情報レコードを更新する
	//---------------------------------------------------------------------------
	createManageDataTable : function(){
		localStorage['pzprv3_manage']        = 'DataBase';
		localStorage['pzprv3_manage:manage'] = 'Table';
	},
	updateManageData : function(parent){
		var mheader = 'pzprv3_manage:manage!'+k.puzzleid;
		localStorage[mheader+'!count'] = parent.DBlist.length;
		localStorage[mheader+'!time']  = (tm.now()/1000)|0;
	},

	//---------------------------------------------------------------------------
	// fio.dbm.dbh.createDataBase()     テーブルを作成する
	//---------------------------------------------------------------------------
	createDataBase : function(){
		localStorage['pzprv3_'+k.puzzleid]            = 'DataBase';
		localStorage['pzprv3_'+k.puzzleid+':puzdata'] = 'Table';
	},

	//---------------------------------------------------------------------------
	// fio.dbm.dbh.convertDataTableID() データのIDを付け直す
	//---------------------------------------------------------------------------
	convertDataTableID : function(parent, sid, tid){
		var sID = parent.DBlist[sid].id, tID = parent.DBlist[tid].id;
		var sheader=this.pheader+'!'+sID, theader=this.pheader+'!'+tID, row = {};
		for(var c=1;c<7;c++){ localStorage[sheader+'!'+this.keys[c]] = parent.DBlist[sid][this.keys[c]];}
		for(var c=1;c<7;c++){ localStorage[theader+'!'+this.keys[c]] = parent.DBlist[tid][this.keys[c]];}
	},

	//---------------------------------------------------------------------------
	// fio.dbm.dbh.openDataTable()   データの盤面に読み込む
	// fio.dbm.dbh.saveDataTable()   データの盤面を保存する
	//---------------------------------------------------------------------------
	openDataTable : function(parent, id){
		var pdata = localStorage[this.pheader+'!'+parent.DBlist[id].id+'!pdata'];
		fio.filedecode(pdata);
	},
	saveDataTable : function(parent, id){
		var row = parent.DBlist[id];
		for(var c=0;c<7;c++){ localStorage[this.pheader+'!'+row.id+'!'+this.keys[c]] = (c!==4 ? row[this.keys[c]] : fio.fileencode(1));}
	},

	//---------------------------------------------------------------------------
	// fio.dbm.dbh.updateComment()   データのコメントを更新する
	// fio.dbm.dbh.updateDifficult() データの難易度を更新する
	//---------------------------------------------------------------------------
	updateComment : function(parent, id){
		var row = parent.DBlist[id];
		localStorage[this.pheader+'!'+row.id+'!comment'] = row.comment;
	},
	updateDifficult : function(parent, id){
		var row = parent.DBlist[id];
		localStorage[this.pheader+'!'+row.id+'!hard'] = row.hard;
	},
	//---------------------------------------------------------------------------
	// fio.dbm.dbh.deleteDataTable() 選択している盤面データを削除する
	//---------------------------------------------------------------------------
	deleteDataTable : function(parent, sID, max){
		for(var i=parseInt(sID);i<max;i++){
			var headers = [this.pheader+'!'+(i+1), this.pheader+'!'+i];
			for(var c=1;c<7;c++){ localStorage[headers[1]+'!'+this.keys[c]] = localStorage[headers[0]+'!'+this.keys[c]];}
		}
		var dheader = this.pheader+'!'+max;
		for(var c=0;c<7;c++){ localStorage.removeItem(dheader+'!'+this.keys[c]);}
	}
};

//---------------------------------------------------------------------------
// ★DataBaseHandler_SQLクラス Web SQL DataBase用 データベースハンドラ
//---------------------------------------------------------------------------
DataBaseHandler_SQL = function(isSQLDB){
	this.db    = null;	// パズル個別のデータベース
	this.dbmgr = null;	// pzprv3_managerデータベース
	this.isSQLDB = isSQLDB;

	this.initialize();
};
DataBaseHandler_SQL.prototype = {
	//---------------------------------------------------------------------------
	// fio.dbm.dbh.initialize()    初期化時にデータベースを開く
	// fio.dbm.dbh.importDBlist()  DataBaseからDBlistを作成する
	// fio.dbm.dbh.setupDBlist()   DBlistのデータをDataBaseに代入する
	//---------------------------------------------------------------------------
	initialize : function(){
		var wrapper1 = new DataBaseObject_SQL(this.isSQLDB);
		var wrapper2 = new DataBaseObject_SQL(this.isSQLDB);

		this.dbmgr = wrapper1.openDatabase('pzprv3_manage', '1.0');
		this.db    = wrapper2.openDatabase('pzprv3_'+k.puzzleid, '1.0');

		this.createManageDataTable();
		this.createDataBase();
	},
	importDBlist : function(parent){
		parent.DBlist = [];
		this.db.transaction(
			function(tx){
				tx.executeSql('SELECT * FROM pzldata',[],function(tx,rs){
					var i=0, keys=parent.keys;
					for(var r=0;r<rs.rows.length;r++){
						parent.DBlist[i] = {};
						for(var c=0;c<7;c++){ parent.DBlist[i][keys[c]] = rs.rows.item(r)[keys[c]];}
						parent.DBlist[i].pdata = "";
						i++;
					}
				});
			},
			function(){ },
			function(){ fio.dbm.update();}
		);
	},
/*	setupDBlist : function(parent){
		for(var r=0;r<parent.DBlist.length;r++){
			this.saveDataTable(parent, r);
		}
	},
*/
	//---------------------------------------------------------------------------
	// fio.dbm.dbh.createManageDataTable() 管理情報テーブルを作成する(消去はなし)
	// fio.dbm.dbh.updateManageData()      管理情報レコードを作成・更新する
	// fio.dbm.dbh.deleteManageData()      管理情報レコードを削除する
	//---------------------------------------------------------------------------
	createManageDataTable : function(){
		this.dbmgr.transaction( function(tx){
			tx.executeSql('CREATE TABLE IF NOT EXISTS manage (puzzleid primary key,version,count,lastupdate)',[]);
		});
	},
	updateManageData : function(parent){
		var count = parent.DBlist.length;
		var time = (tm.now()/1000)|0;
		this.dbmgr.transaction( function(tx){
			tx.executeSql('INSERT OR REPLACE INTO manage VALUES(?,?,?,?)', [k.puzzleid, '1.0', count, time]);
		});
	},
/*	deleteManageData : function(){
		this.dbmgr.transaction( function(tx){
			tx.executeSql('DELETE FROM manage WHERE puzzleid=?',[k.puzzleid]);
		});
	},
*/
	//---------------------------------------------------------------------------
	// fio.dbm.dbh.createDataBase()      テーブルを作成する
	// fio.dbm.dbh.dropDataBase()        テーブルを削除する
	// fio.dbm.dbh.forcedeleteDataBase() テーブルを削除する
	//---------------------------------------------------------------------------
	createDataBase : function(){
		this.db.transaction( function(tx){
			tx.executeSql('CREATE TABLE IF NOT EXISTS pzldata (id int primary key,col,row,hard,pdata,time,comment)',[]);
		});
	},
/*	dropDataBase : function(){
		this.db.transaction( function(tx){
			tx.executeSql('DROP TABLE IF EXISTS pzldata',[]);
		});
	},
	forceDeleteDataBase : function(parent){
		this.deleteManageData();
		this.dropDataBase();
	},*/

	//---------------------------------------------------------------------------
	// fio.dbm.dbh.convertDataTableID() データのIDを付け直す
	//---------------------------------------------------------------------------
	convertDataTableID : function(parent, sid, tid){
		var sID = parent.DBlist[sid].id, tID = parent.DBlist[tid].id;
		this.db.transaction( function(tx){
			tx.executeSql('UPDATE pzldata SET id=? WHERE ID==?',[0  ,sID]);
			tx.executeSql('UPDATE pzldata SET id=? WHERE ID==?',[sID,tID]);
			tx.executeSql('UPDATE pzldata SET id=? WHERE ID==?',[tID,  0]);
		});
	},

	//---------------------------------------------------------------------------
	// fio.dbm.dbh.openDataTable()   データの盤面に読み込む
	// fio.dbm.dbh.saveDataTable()   データの盤面を保存する
	//---------------------------------------------------------------------------
	openDataTable : function(parent, id){
		this.db.transaction( function(tx){
			tx.executeSql('SELECT * FROM pzldata WHERE ID==?',[parent.DBlist[id].id],
				function(tx,rs){ fio.filedecode(rs.rows.item(0)['pdata']);}
			);
		});
	},
	saveDataTable : function(parent, id){
		var row = parent.DBlist[id];
		this.db.transaction( function(tx){
			tx.executeSql('INSERT INTO pzldata VALUES(?,?,?,?,?,?,?)',[row.id,row.col,row.row,row.hard,fio.fileencode(1),row.time,row.comment]);
		});
	},

	//---------------------------------------------------------------------------
	// fio.dbm.dbh.updateComment()   データのコメントを更新する
	// fio.dbm.dbh.updateDifficult() データの難易度を更新する
	//---------------------------------------------------------------------------
	updateComment : function(parent, id){
		var row = parent.DBlist[id];
		this.db.transaction( function(tx){
			tx.executeSql('UPDATE pzldata SET comment=? WHERE ID==?',[row.comment, row.id]);
		});
	},
	updateDifficult : function(parent, id){
		var row = parent.DBlist[id];
		this.db.transaction( function(tx){
			tx.executeSql('UPDATE pzldata SET hard=? WHERE ID==?',[row.hard, row.id]);
		});
	},

	//---------------------------------------------------------------------------
	// fio.dbm.dbh.deleteDataTable() 選択している盤面データを削除する
	//---------------------------------------------------------------------------
	deleteDataTable : function(parent, sID, max){
		this.db.transaction( function(tx){
			tx.executeSql('DELETE FROM pzldata WHERE ID==?',[sID]);
			for(var i=parseInt(sID);i<max;i++){
				tx.executeSql('UPDATE pzldata SET id=? WHERE ID==?',[i,i+1]);
			}
		});
	}
};

//---------------------------------------------------------------------------
// ★DataBaseObject_SQLクラス  Web SQL DataBase用 データベースのラッパークラス
//---------------------------------------------------------------------------
DataBaseObject_SQL = function(isSQLDB){
	this.name    = '';
	this.version = 0;
	this.isSQLDB = isSQLDB;

	this.object = null;
};
DataBaseObject_SQL.prototype = {
	openDatabase : function(name, ver){
		this.name    = name;
		this.version = ver;
		if(this.isSQLDB){
			this.object = openDatabase(this.name, this.version);
		}
		else{
			this.object = google.gears.factory.create('beta.database', this.version);
		}
		return this;
	},

	// Gears用ラッパーみたいなもの
	transaction : function(execfunc, errorfunc, compfunc){
		if(typeof errorfunc == 'undefined'){ errorfunc = f_true;}
		if(typeof compfunc  == 'undefined'){ compfunc  = f_true;}

		if(this.isSQLDB){
			// execfuncの第一引数txはSQLTransactionオブジェクト(tx.executeSqlは下の関数を指さない)
			this.object.transaction(execfunc, errorfunc, compfunc);
		}
		else{
			this.object.open(this.name);
			// execfuncの第一引数txはthisにしておく(tx.executeSqlは下の関数を指す)
			execfunc(this);
			this.object.close();

			compfunc();
		}
	},
	// Gears用ラッパー
	executeSql : function(statement, args, callback){
		var resultSet = this.object.execute(statement, args);
		// 以下はcallback用
		if(typeof callback != 'undefined'){
			var r=0, rows = {};
			rows.rowarray = [];
			while(resultSet.isValidRow()){
				var row = {};
				for(var i=0,len=resultSet.fieldCount();i<len;i++){
					row[i] = row[resultSet.fieldName(i)] = resultSet.field(i);
				}
				rows.rowarray[r] = row;
				resultSet.next();
				r++;
			}
			resultSet.close();

			rows.length = r;
			rows.item = function(r){ return this.rowarray[r];};

			var rs = {rows:rows};
			callback(this, rs);
		}
	}
};

//---------------------------------------------------------------------------
// ★AnsCheckクラス 答えチェック関連の関数を扱う
//---------------------------------------------------------------------------

// 回答チェッククラス
// AnsCheckクラス
AnsCheck = function(){
	this.performAsLine = false;
	this.errDisp = false;
	this.setError = true;
	this.inCheck = false;
	this.inAutoCheck = false;
	this.alstr = { jp:'' ,en:''};
};
AnsCheck.prototype = {

	//---------------------------------------------------------------------------
	// ans.check()     答えのチェックを行う(checkAns()を呼び出す)
	// ans.checkAns()  答えのチェックを行う(オーバーライド用)
	// ans.check1st()  オートチェック時に初めに判定を行う(オーバーライド用)
	// ans.setAlert()  check()から戻ってきたときに返す、エラー内容を表示するalert文を設定する
	//---------------------------------------------------------------------------
	check : function(){
		this.inCheck = true;
		this.alstr = { jp:'' ,en:''};
		kc.keyreset();
		mv.mousereset();

		if(!this.checkAns()){
			menu.alertStr(this.alstr.jp, this.alstr.en);
			this.errDisp = true;
			pc.paintAll();
			this.inCheck = false;
			return false;
		}

		menu.alertStr("正解です！","Complete!");
		this.inCheck = false;
		return true;
	},
	checkAns : function(){},	//オーバーライド用
	//check1st : function(){},	//オーバーライド用
	setAlert : function(strJP, strEN){
		this.alstr.jp = strJP;
		this.alstr.en = (!!strEN ? strEN : strJP);
	},

	//---------------------------------------------------------------------------
	// ans.autocheck()    答えの自動チェックを行う(alertがでなかったり、エラー表示を行わない)
	// ans.autocheck1st() autocheck前に、軽い正答判定を行う
	//
	// ans.disableSetError()  盤面のオブジェクトにエラーフラグを設定できないようにする
	// ans.enableSetError()   盤面のオブジェクトにエラーフラグを設定できるようにする
	// ans.isenableSetError() 盤面のオブジェクトにエラーフラグを設定できるかどうかを返す
	//---------------------------------------------------------------------------
	autocheck : function(){
		if(!pp.getVal('autocheck') || k.editmode || this.inCheck){ return;}

		var ret = false;

		this.inCheck = this.inAutoCheck = true;
		this.disableSetError();

		if(this.autocheck1st() && this.checkAns() && this.inCheck){
			mv.mousereset();
			menu.alertStr("正解です！","Complete!");
			ret = true;
			pp.setVal('autocheck',false);
		}
		this.enableSetError();
		this.inCheck = this.inAutoCheck = false;

		return ret;
	},
	// リンク系は重いので最初に端点を判定する
	autocheck1st : function(){
		if(this.check1st){ return this.check1st();}
		else if( (k.isCenterLine && !ans.checkLcntCell(1)) || (k.isborderAsLine && !ans.checkLcntCross(1,0)) ){ return false;}
		return true;
	},

	disableSetError  : function(){ this.setError = false;},
	enableSetError   : function(){ this.setError = true; },
	isenableSetError : function(){ return this.setError; },

	//---------------------------------------------------------------------------
	// ans.setErrLareaByCell() ひとつながりになった線が存在するマスにエラーを設定する
	// ans.setErrLareaById()   ひとつながりになった線が存在するマスにエラーを設定する
	//---------------------------------------------------------------------------
	setErrLareaByCell : function(cinfo, c, val){ this.setErrLareaById(cinfo, cinfo.id[c], val); },
	setErrLareaById : function(cinfo, areaid, val){
		var blist = [];
		for(var id=0;id<bd.bdmax;id++){
			if(!bd.isLine(id)){ continue;}
			var cc1 = bd.border[id].cellcc[0], cc2 = bd.border[id].cellcc[1];
			if(cinfo.id[cc1]===areaid && cinfo.id[cc1]===cinfo.id[cc2]){ blist.push(id);}
		}
		bd.sErB(blist,val);

		var clist = [];
		for(var c=0;c<bd.cellmax;c++){ if(cinfo.id[c]===areaid && bd.isNum(c)){ clist.push(c);} }
		bd.sErC(clist,4);
	},

	//---------------------------------------------------------------------------
	// ans.checkAllCell()   条件func==trueになるマスがあったらエラーを設定する
	// ans.checkNoNumCell() 数字の入っていないセルがあるか判定する
	// ans.checkIceLines()  アイスバーン上で線が曲がっているか判定する
	//---------------------------------------------------------------------------
	checkAllCell : function(func){
		var result = true;
		for(var c=0;c<bd.cellmax;c++){
			if(func(c)){
				if(this.inAutoCheck){ return false;}
				bd.sErC([c],1);
				result = false;
			}
		}
		return result;
	},
	checkNoNumCell : function(){
		return this.checkAllCell(bd.noNum);
	},
	checkIceLines : function(){
		return this.checkAllCell( function(c){
			return (line.lcntCell(c)===2 && bd.QuC(c)===6 && !bd.isLineStraight(c));
		});
	},

	//---------------------------------------------------------------------------
	// ans.checkDir4Cell()  セルの周囲4マスの条件がfunc==trueの時、エラーを設定する
	// ans.countDir4Cell()  上下左右4方向で条件func==trueになるマスの数をカウントする
	// ans.checkSideCell()  隣り合った2つのセルが条件func==trueの時、エラーを設定する
	// ans.check2x2Block()  2x2のセルが全て条件func==trueの時、エラーを設定する
	//---------------------------------------------------------------------------
	checkDir4Cell : function(iscount, type){ // 0:違う 1:numより小さい 2:numより大きい
		var result = true;
		for(var c=0;c<bd.cellmax;c++){
			if(!bd.isValidNum(c)){ continue;}
			var num = bd.getNum(c), count=this.countDir4Cell(c,iscount);
			if((type!==1 && num<count) || (type!==2 && num>count)){
				if(this.inAutoCheck){ return false;}
				bd.sErC([c],1);
				result = false;
			}
		}
		return result;
	},
	countDir4Cell : function(c, func){
		if(c<0 || c>=bd.cellmax || c===null){ return 0;}
		var cnt=0, cc;
		cc=bd.up(c); if(cc!==null && func(cc)){ cnt++;}
		cc=bd.dn(c); if(cc!==null && func(cc)){ cnt++;}
		cc=bd.lt(c); if(cc!==null && func(cc)){ cnt++;}
		cc=bd.rt(c); if(cc!==null && func(cc)){ cnt++;}
		return cnt;
	},

	checkSideCell : function(func){
		var result = true;
		for(var c=0;c<bd.cellmax;c++){
			if(bd.cell[c].bx<bd.maxbx-1 && func(c,bd.rt(c))){
				if(this.inAutoCheck){ return false;}
				bd.sErC([c,bd.rt(c)],1);
				result = false;
			}
			if(bd.cell[c].by<bd.maxby-1 && func(c,bd.dn(c))){
				if(this.inAutoCheck){ return false;}
				bd.sErC([c,bd.dn(c)],1);
				result = false;
			}
		}
		return result;
	},

	check2x2Block : function(func){
		var result = true;
		for(var c=0;c<bd.cellmax;c++){
			if(bd.cell[c].bx<bd.maxbx-1 && bd.cell[c].by<bd.maxby-1){
				var cnt=0, bx=bd.cell[c].bx, by=bd.cell[c].by;
				var clist = bd.cellinside(bx, by, bx+2, by+2);
				for(var i=0;i<clist.length;i++){ if(func(clist[i])){ cnt++;}}
				if(cnt===4){
					if(this.inAutoCheck){ return false;}
					bd.sErC(clist,1);
					result = false;
				}
			}
		}
		return result;
	},

	//---------------------------------------------------------------------------
	// ans.checkOneArea()  白マス/黒マス/線がひとつながりかどうかを判定する
	// ans.checkOneLoop()  交差あり線が一つかどうか判定する
	// ans.checkLcntCell() セルから出ている線の本数について判定する
	// ans.setCellLineError() セルと周りの線にエラーフラグを設定する
	// ans.checkenableLineParts() '一部があかされている'線の部分に、線が引かれているか判定する
	//---------------------------------------------------------------------------
	checkOneArea : function(cinfo){
		if(cinfo.max>1){
			if(this.performAsLine){ bd.sErBAll(2); this.setErrLareaByCell(cinfo,1,1); }
			if(!this.performAsLine || k.puzzleid=="firefly"){ bd.sErC(cinfo.room[1].idlist,1);}
			return false;
		}
		return true;
	},

	checkOneLoop : function(){
		var xinfo = line.getLineInfo();
		if(xinfo.max>1){
			bd.sErBAll(2);
			bd.sErB(xinfo.room[1].idlist,1);
			return false;
		}
		return true;
	},

	checkLcntCell : function(val){
		var result = true;
		if(line.ltotal[val]==0){ return true;}
		for(var c=0;c<bd.cellmax;c++){
			if(line.lcnt[c]==val){
				if(this.inAutoCheck){ return false;}
				if(!this.performAsLine){ bd.sErC([c],1);}
				else{ if(result){ bd.sErBAll(2);} this.setCellLineError(c,true);}
				result = false;
			}
		}
		return result;
	},

	setCellLineError : function(cc, flag){
		if(flag){ bd.sErC([cc],1);}
		var bx=bd.cell[cc].bx, by=bd.cell[cc].by;
		bd.sErB(bd.borderinside(bx-1,by-1,bx+1,by+1), 1);
	},

	checkenableLineParts : function(val){
		var result = true;
		for(var c=0;c<bd.cellmax;c++){
			if( (bd.isLine(bd.ub(c)) && bd.noLP(c,k.UP)) ||
				(bd.isLine(bd.db(c)) && bd.noLP(c,k.DN)) ||
				(bd.isLine(bd.lb(c)) && bd.noLP(c,k.LT)) ||
				(bd.isLine(bd.rb(c)) && bd.noLP(c,k.RT)) )
			{
				if(this.inAutoCheck){ return false;}
				bd.sErC([c],1);
				result = false;
			}
		}
		return result;
	},

	//---------------------------------------------------------------------------
	// ans.checkAllArea()    すべてのfuncを満たすマスで構成されるエリアがevalfuncを満たすかどうか判定する
	//
	// ans.checkDisconnectLine() 数字などに繋がっていない線の判定を行う
	// ans.checkNumberAndSize()  エリアにある数字と面積が等しいか判定する
	// ans.checkNoNumber()       部屋に数字が含まれていないかの判定を行う
	// ans.checkDoubleNumber()   部屋に数字が2つ以上含まれていないように判定を行う
	// ans.checkTripleNumber()   部屋に数字が3つ以上含まれていないように判定を行う
	// ans.checkBlackCellCount() 領域内の数字と黒マスの数が等しいか判定する
	// ans.checkBlackCellInArea()部屋にある黒マスの数の判定を行う
	// ans.checkAreaRect()       領域が全て四角形であるかどうか判定する
	// ans.checkLinesInArea()    領域の中で線が通っているセルの数を判定する
	// ans.checkNoObjectInRoom() エリアに指定されたオブジェクトがないと判定する
	//
	// ans.getQnumCellInArea() 部屋の中で一番左上にある数字を返す
	// ans.getSizeOfClist()    指定されたCellのリストの上下左右の端と、その中で条件funcを満たすセルの数を返す
	//---------------------------------------------------------------------------
	checkAllArea : function(cinfo, func, evalfunc){
		var result = true;
		for(var id=1;id<=cinfo.max;id++){
			var cc = (k.roomNumber ? area.getTopOfRoomByCell(cinfo.room[id].idlist[0])
								   : this.getQnumCellOfClist(cinfo.room[id].idlist));
			var d = this.getSizeOfClist(cinfo.room[id].idlist,func);
			var n = (cc!==null?bd.QnC(cc):-1);

			if( !evalfunc(d.cols, d.rows, d.cnt, n) ){
				if(this.inAutoCheck){ return false;}
				if(this.performAsLine){ if(result){ bd.sErBAll(2);} this.setErrLareaById(cinfo,id,1);}
				else{ bd.sErC(cinfo.room[id].idlist,(k.puzzleid!="tateyoko"?1:4));}
				result = false;
			}
		}
		return result;
	},

	checkDisconnectLine  : function(cinfo){ return this.checkAllArea(cinfo, bd.isNum,   function(w,h,a,n){ return (n!=-1 || a>0); } );},
	checkNumberAndSize   : function(cinfo){ return this.checkAllArea(cinfo, f_true,     function(w,h,a,n){ return (n<= 0 || n==a);} );},

	checkNoNumber        : function(cinfo){ return this.checkAllArea(cinfo, bd.isNum,   function(w,h,a,n){ return (a!=0);}          );},
	checkDoubleNumber    : function(cinfo){ return this.checkAllArea(cinfo, bd.isNum,   function(w,h,a,n){ return (a< 2);}          );},
	checkTripleNumber    : function(cinfo){ return this.checkAllArea(cinfo, bd.isNum,   function(w,h,a,n){ return (a< 3);}          );},

	checkBlackCellCount  : function(cinfo)          { return this.checkAllArea(cinfo, bd.isBlack, function(w,h,a,n){ return (n<0 || n===a);});},
	checkBlackCellInArea : function(cinfo, evalfunc){ return this.checkAllArea(cinfo, bd.isBlack, function(w,h,a,n){ return evalfunc(a);}   );},
	checkAreaRect        : function(cinfo)          { return this.checkAllArea(cinfo, f_true,     function(w,h,a,n){ return (w*h===a)}      );},

	checkLinesInArea     : function(cinfo, evalfunc){ return this.checkAllArea(cinfo, function(c){ return line.lcnt[c]>0;}, evalfunc);},
	checkNoObjectInRoom  : function(cinfo, getvalue){ return this.checkAllArea(cinfo, function(c){ return getvalue(c)!==-1;}, function(w,h,a,n){ return (a!=0);});},

	getQnumCellOfClist : function(clist){
		for(var i=0,len=clist.length;i<len;i++){
			if(bd.QnC(clist[i])!==-1){ return clist[i];}
		}
		return null;
	},
	getSizeOfClist : function(clist, func){
		var d = { x1:bd.maxbx+1, x2:bd.minbx-1, y1:bd.maxby+1, y2:bd.minby-1, cols:0, rows:0, cnt:0 };
		for(var i=0;i<clist.length;i++){
			if(d.x1>bd.cell[clist[i]].bx){ d.x1=bd.cell[clist[i]].bx;}
			if(d.x2<bd.cell[clist[i]].bx){ d.x2=bd.cell[clist[i]].bx;}
			if(d.y1>bd.cell[clist[i]].by){ d.y1=bd.cell[clist[i]].by;}
			if(d.y2<bd.cell[clist[i]].by){ d.y2=bd.cell[clist[i]].by;}
			if(func(clist[i])){ d.cnt++;}
		}
		d.cols = (d.x2-d.x1+2)/2;
		d.rows = (d.y2-d.y1+2)/2;
		return d;
	},

	//---------------------------------------------------------------------------
	// ans.checkSideAreaSize()     境界線をはさんで接する部屋のgetvalで得られるサイズが異なることを判定する
	// ans.checkSideAreaCell()     境界線をはさんでタテヨコに接するセルの判定を行う
	//---------------------------------------------------------------------------
	checkSideAreaSize : function(rinfo, getval){
		var adjs = [];
		for(var r=1;r<=rinfo.max-1;r++){
			adjs[r] = [];
			for(var s=r+1;s<=rinfo.max;s++){ adjs[r][s]=0;}
		}

		for(var id=0;id<bd.bdmax;id++){
			if(!bd.isBorder(id)){ continue;}
			var cc1 = bd.border[id].cellcc[0], cc2 = bd.border[id].cellcc[1];
			if(cc1===null || cc2===null){ continue;}
			var r1=rinfo.id[cc1], r2=rinfo.id[cc2];
			try{
				if(r1<r2){ adjs[r1][r2]++;}
				if(r1>r2){ adjs[r2][r1]++;}
			}catch(e){ alert([r1,r2]); throw 0;}
		}

		for(var r=1;r<=rinfo.max-1;r++){
			for(var s=r+1;s<=rinfo.max;s++){
				if(adjs[r][s]==0){ continue;}
				var a1=getval(rinfo,r), a2=getval(rinfo,s);
				if(a1>0 && a2>0 && a1==a2){
					bd.sErC(rinfo.room[r].idlist,1);
					bd.sErC(rinfo.room[s].idlist,1);
					return false;
				}
			}
		}

		return true;
	},

	checkSideAreaCell : function(rinfo, func, flag){
		for(var id=0;id<bd.bdmax;id++){
			if(!bd.isBorder(id)){ continue;}
			var cc1 = bd.border[id].cellcc[0], cc2 = bd.border[id].cellcc[1];
			if(cc1!==null && cc2!==null && func(cc1, cc2)){
				if(!flag){ bd.sErC([cc1,cc2],1);}
				else{ bd.sErC(area.room[area.room.id[cc1]].clist,1); bd.sErC(area.room[area.room.id[cc2]].clist,1); }
				return false;
			}
		}
		return true;
	},

	//---------------------------------------------------------------------------
	// ans.checkSeqBlocksInRoom()   部屋の中限定で、黒マスがひとつながりかどうか判定する
	// ans.checkSameObjectInRoom()  部屋の中のgetvalueの値が1種類であるか判定する
	// ans.checkGatheredObject()    同じgetvalueの値であれば、同じ部屋に存在することを判定する
	// ans.checkDifferentNumberInRoom() 部屋の中に同じ数字が存在しないことを判定する
	// ans.isDifferentNumberInClist()   clistの中に同じ数字が存在しないことを判定だけを行う
	//---------------------------------------------------------------------------
	checkSeqBlocksInRoom : function(){
		var result = true;
		for(var id=1;id<=area.room.max;id++){
			var data = {max:0,id:[]};
			for(var c=0;c<bd.cellmax;c++){ data.id[c] = ((area.room.id[c]===id && bd.isBlack(c))?0:null);}
			for(var c=0;c<bd.cellmax;c++){
				if(data.id[c]!==0){ continue;}
				data.max++;
				data[data.max] = {clist:[]};
				area.sc0(c, data);
			}
			if(data.max>1){
				if(this.inAutoCheck){ return false;}
				bd.sErC(area.room[id].clist,1);
				result = false;
			}
		}
		return result;
	},

	checkSameObjectInRoom : function(rinfo, getvalue){
		var result=true, d=[], val=[];
		for(var c=0;c<bd.cellmax;c++){ val[c]=getvalue(c);}
		for(var i=1;i<=rinfo.max;i++){ d[i]=-1;}
		for(var c=0;c<bd.cellmax;c++){
			if(rinfo.id[c]===null || val[c]===-1){ continue;}
			if(d[rinfo.id[c]]===-1 && val[c]!==-1){ d[rinfo.id[c]] = val[c];}
			else if(d[rinfo.id[c]]!==val[c]){
				if(this.inAutoCheck){ return false;}

				if(this.performAsLine){ bd.sErBAll(2); this.setErrLareaByCell(rinfo,c,1);}
				else{ bd.sErC(rinfo.room[rinfo.id[c]].idlist,1);}
				if(k.puzzleid=="kaero"){
					for(var cc=0;cc<bd.cellmax;cc++){
						if(rinfo.id[c]===rinfo.id[cc] && this.getBeforeCell(cc)!==null && rinfo.id[c]!==rinfo.id[this.getBeforeCell(cc)])
							{ bd.sErC([this.getBeforeCell(cc)],4);}
					}
				}
				result = false;
			}
		}
		return result;
	},
	checkGatheredObject : function(rinfo, getvalue){
		var d=[], dmax=0, val=[];
		for(var c=0;c<bd.cellmax;c++){ val[c]=getvalue(c); if(dmax<val[c]){ dmax=val[c];} }
		for(var i=0;i<=dmax;i++){ d[i]=-1;}
		for(var c=0;c<bd.cellmax;c++){
			if(val[c]===-1){ continue;}
			if(d[val[c]]===-1){ d[val[c]] = rinfo.id[c];}
			else if(d[val[c]]!==rinfo.id[c]){
				var clist = [];
				for(var cc=0;cc<bd.cellmax;cc++){
					if(k.puzzleid=="kaero"){ if(val[c]===bd.QnC(cc)){ clist.push(cc);}}
					else{ if(rinfo.id[c]===rinfo.id[cc] || d[val[c]]===rinfo.id[cc]){ clist.push(cc);} }
				}
				bd.sErC(clist,1);
				return false;
			}
		}
		return true;
	},

	checkDifferentNumberInRoom : function(rinfo, numfunc){
		var result = true;
		for(var id=1;id<=rinfo.max;id++){
			if(!this.isDifferentNumberInClist(rinfo.room[id].idlist, numfunc)){
				if(this.inAutoCheck){ return false;}
				bd.sErC(rinfo.room[id].idlist,1);
				result = false;
			}
		}
		return result;
	},
	isDifferentNumberInClist : function(clist, numfunc){
		var result = true, d = [], num = [], bottom = (k.dispzero?1:0);
		for(var n=bottom,max=bd.nummaxfunc(clist[0]);n<=max;n++){ d[n]=0;}
		for(var i=0;i<clist.length;i++){ num[clist[i]] = numfunc.apply(bd,[clist[i]]);}

		for(var i=0;i<clist.length;i++){ if(num[clist[i]]>=bottom){ d[num[clist[i]]]++;} }
		for(var i=0;i<clist.length;i++){
			if(num[clist[i]]>=bottom && d[num[clist[i]]]>=2){ bd.sErC([clist[i]],1); result = false;}
		}
		return result;
	},

	//---------------------------------------------------------------------------
	// ans.checkRowsCols()            タテ列・ヨコ列の数字の判定を行う
	// ans.checkRowsColsPartly()      黒マスや[＼]等で分かれるタテ列・ヨコ列の数字の判定を行う
	//---------------------------------------------------------------------------
	checkRowsCols : function(evalfunc, numfunc){
		var result = true;
		for(var by=1;by<=bd.maxby;by+=2){
			var clist = bd.cellinside(bd.minbx+1,by,bd.maxbx-1,by);
			if(!evalfunc.apply(this,[clist, numfunc])){
				if(this.inAutoCheck){ return false;}
				result = false;
			}
		}
		for(var bx=1;bx<=bd.maxbx;bx+=2){
			var clist = bd.cellinside(bx,bd.minby+1,bx,bd.maxby-1);
			if(!evalfunc.apply(this,[clist, numfunc])){
				if(this.inAutoCheck){ return false;}
				result = false;
			}
		}
		return result;
	},
	checkRowsColsPartly : function(evalfunc, areainfo, termfunc, multierr){
		var result = true;
		for(var by=1;by<=bd.maxby;by+=2){
			var bx=1;
			while(bx<=bd.maxbx){
				for(var tx=bx;tx<=bd.maxbx;tx+=2){ if(termfunc.apply(this,[bd.cnum(tx,by)])){ break;}}
				var clist = bd.cellinside(bx,by,tx-2,by);
				var total = (k.isexcell!==1 ? 0 : (bx===1 ? bd.QnE(bd.exnum(-1,by)) : bd.QnC(bd.cnum(bx-2,by))));

				if(!evalfunc.apply(this,[total, [bx-2,by], clist, areainfo])){
					if(!multierr || this.inAutoCheck){ return false;}
					result = false;
				}
				bx = tx+2;
			}
		}
		for(var bx=1;bx<=bd.maxbx;bx+=2){
			var by=1;
			while(by<=bd.maxby){
				for(var ty=by;ty<=bd.maxby;ty+=2){ if(termfunc.apply(this,[bd.cnum(bx,ty)])){ break;}}
				var clist = bd.cellinside(bx,by,bx,ty-2);
				var total = (k.isexcell!==1 ? 0 : (by===1 ? bd.DiE(bd.exnum(bx,-1)) : bd.DiC(bd.cnum(bx,by-2))));

				if(!evalfunc.apply(this,[total, [bx,by-2], clist, areainfo])){
					if(!multierr || this.inAutoCheck){ return false;}
					result = false;
				}
				by = ty+2;
			}
		}
		return result;
	},

	//---------------------------------------------------------------------------
	// ans.checkLcntCross()      ある交点との周り四方向の境界線の数を判定する(bp==1:黒点が打たれている場合)
	// ans.setCrossBorderError() ある交点とその周り四方向にエラーフラグを設定する
	//---------------------------------------------------------------------------
	checkLcntCross : function(val, bp){
		var result = true;
		for(var by=0;by<=bd.maxby;by+=2){
			for(var bx=0;bx<=bd.maxbx;bx+=2){
				if(k.iscross===1 && (bx===bd.minbx||by===bd.minby||bx===bd.maxbx||by===bd.maxby)){ continue;}
				var id = (bx>>1)+(by>>1)*(k.qcols+1);
				var lcnts = (!k.isborderAsLine?area.lcnt[id]:line.lcnt[id]);
				if(lcnts==val && (bp==0 || (bp==1&&bd.QnX(bd.xnum(bx,by))==1) || (bp==2&&bd.QnX(bd.xnum(bx,by))!=1) )){
					if(this.inAutoCheck){ return false;}
					if(result){ bd.sErBAll(2);}
					this.setCrossBorderError(bx,by);
					result = false;
				}
			}
		}
		return result;
	},
	setCrossBorderError : function(bx,by){
		if(k.iscross!==0){ bd.sErX([bd.xnum(bx,by)], 1);}
		bd.sErB(bd.borderinside(bx-1,by-1,bx+1,by+1), 1);
	}
};

//---------------------------------------------------------------------------
// ★OperationManagerクラス 操作情報を扱い、Undo/Redoの動作を実装する
//---------------------------------------------------------------------------
// 入力情報管理クラス
// Operationクラス
Operation = function(obj, property, id, old, num){
	this.obj = obj;
	this.property = property;
	this.id = id;
	this.old = old;
	this.num = num;
	this.chain = um.chainflag;
};

// OperationManagerクラス
OperationManager = function(){
	this.ope = [];			// Operationクラスを保持する配列
	this.current = 0;		// 現在の表示操作番号を保持する
	this.disrec = 0;		// このクラスからの呼び出し時は1にする
	this.forceRecord = false;	// 強制的に登録する(盤面縮小時限定)
	this.chainflag = 0;		// 前のOperationとくっつけて、一回のUndo/Redoで変化できるようにする
	this.disCombine = 0;	// 数字がくっついてしまうので、それを一時的に無効にするためのフラグ

	this.anscount = 0;			// 補助以外の操作が行われた数を保持する(autocheck用)
	this.changeflag = false;	// 操作が行われたらtrueにする(mv.notInputted()用)

	this.undoExec = false;		// Undo中
	this.redoExec = false;		// Redo中
	this.reqReset = false;		// Undo/Redo時に盤面回転等が入っていた時、resize,resetInfo関数のcallを要求する
	this.range = { x1:bd.maxbx+1, y1:bd.maxby+1, x2:bd.minbx-1, y2:bd.minby-1};
};
OperationManager.prototype = {
	//---------------------------------------------------------------------------
	// um.disableRecord()  操作の登録を禁止する
	// um.enableRecord()   操作の登録を許可する
	// um.isenableRecord() 操作の登録できるかを返す
	// um.enb_btn()        html上の[戻][進]ボタンを押すことが可能か設定する
	// um.allerase()       記憶していた操作を全て破棄する
	// um.newOperation()   マウス、キー入力開始時に呼び出す
	//---------------------------------------------------------------------------

	// 今この関数でレコード禁止になるのは、UndoRedo時、URLdecode、fileopen、adjustGeneral/Special時
	// 連動して実行しなくなるのはaddOpe().
	//  -> ここで使っているUndo/RedoとaddOpe以外はbd.QuC系関数を使用しないように変更
	//     変な制限事項がなくなるし、動作速度にもかなり効くしね
	disableRecord : function(){ this.disrec++; },
	enableRecord  : function(){ if(this.disrec>0){ this.disrec--;} },
	isenableRecord : function(){ return (this.forceRecord || this.disrec===0);},

	enb_btn : function(){
		ee('btnundo').el.disabled = ((!this.ope.length || this.current==0)               ? 'true' : '');
		ee('btnredo').el.disabled = ((!this.ope.length || this.current==this.ope.length) ? 'true' : '');
	},
	allerase : function(){
		for(var i=this.ope.length-1;i>=0;i--){ this.ope.pop();}
		this.current  = 0;
		this.anscount = 0;
		this.enb_btn();
	},
	newOperation : function(flag){	// キー、ボタンを押し始めたときはtrue
		this.chainflag = 0;
		if(flag){ this.changeflag = false;}
	},

	//---------------------------------------------------------------------------
	// um.addOpe() 指定された操作を追加する。id等が同じ場合は最終操作を変更する
	//---------------------------------------------------------------------------
	addOpe : function(obj, property, id, old, num){
		if(!this.isenableRecord() || (old===num && obj!==k.BOARD)){ return;}

		var lastid = this.ope.length-1;

		if(this.current < this.ope.length){
			for(var i=this.ope.length-1;i>=this.current;i--){ this.ope.pop();}
			lastid = -1;
		}

		// 前回と同じ場所なら前回の更新のみ
		if( lastid>=0 &&
			this.disCombine==0 &&
			this.ope[lastid].obj == obj           &&
			this.ope[lastid].property == property &&
			this.ope[lastid].id == id             &&
			this.ope[lastid].num == old           &&
			( (obj == k.CELL && ( property==k.QNUM || (property==k.ANUM && k.isAnsNumber) )) || obj == k.CROSS)
		)
		{
			this.ope[lastid].num = num;
		}
		else{
			this.ope.push(new Operation(obj, property, id, old, num));
			this.current++;
			if(this.chainflag==0){ this.chainflag = 1;}
		}

		if(property!=k.QSUB){ this.anscount++;}
		this.changeflag = true;
		this.enb_btn();
	},

	//---------------------------------------------------------------------------
	// um.undo()  Undoを実行する
	// um.redo()  Redoを実行する
	// um.preproc()  Undo/Redo実行前の処理を行う
	// um.postproc() Undo/Redo実行後の処理を行う
	// um.exec()  操作opeを反映する。undo(),redo()から内部的に呼ばれる
	//---------------------------------------------------------------------------
	undo : function(){
		if(this.current==0){ return;}
		this.undoExec = true;
		this.preproc();

		while(this.current>0){
			var ope = this.ope[this.current-1];

			this.exec(ope, ope.old);
			if(ope.property!=k.QSUB){ this.anscount--;}
			this.current--;

			if(!this.ope[this.current].chain){ break;}
		}

		this.postproc();
		this.undoExec = false;
		if(this.current==0){ kc.inUNDO=false;}
	},
	redo : function(){
		if(this.current==this.ope.length){ return;}
		this.redoExec = true;
		this.preproc();

		while(this.current<this.ope.length){
			var ope = this.ope[this.current];

			this.exec(ope, ope.num);
			if(ope.property!=k.QSUB){ this.anscount++;}
			this.current++;

			if(this.current<this.ope.length && !this.ope[this.current].chain){ break;}
		}

		this.postproc();
		this.redoExec = false;
		if(this.ope.length==0){ kc.inREDO=false;}
	},
	preproc : function(){
		this.reqReset=false;

		this.range = { x1:bd.maxbx+1, y1:bd.maxby+1, x2:bd.minbx-1, y2:bd.minby-1};
		this.disableRecord();
	},
	postproc : function(){
		if(this.reqReset){
			this.reqReset=false;

			bd.setposAll();
			bd.setminmax();
			base.enableInfo();
			base.resetInfo(false);
			base.resize_canvas();
		}
		else{
			pc.paintRange(this.range.x1, this.range.y1, this.range.x2, this.range.y2);
		}
		this.enableRecord();
		this.enb_btn();
	},
	exec : function(ope, num){
		var pp = ope.property;
		if(ope.obj == k.CELL){
			if     (pp == k.QUES){ bd.sQuC(ope.id, num);}
			else if(pp == k.QNUM){ bd.sQnC(ope.id, num);}
			else if(pp == k.QDIR){ bd.sDiC(ope.id, num);}
			else if(pp == k.ANUM){ bd.sAnC(ope.id, num);}
			else if(pp == k.QANS){ bd.sQaC(ope.id, num);}
			else if(pp == k.QSUB){ bd.sQsC(ope.id, num);}
			this.paintStack(bd.cell[ope.id].bx-1, bd.cell[ope.id].by-1, bd.cell[ope.id].bx+1, bd.cell[ope.id].by+1);
		}
		else if(ope.obj == k.EXCELL){
			if     (pp == k.QNUM){ bd.sQnE(ope.id, num);}
			else if(pp == k.QDIR){ bd.sDiE(ope.id, num);}
		}
		else if(ope.obj == k.CROSS){
			if     (pp == k.QUES){ bd.sQuX(ope.id, num);}
			else if(pp == k.QNUM){ bd.sQnX(ope.id, num);}
			this.paintStack(bd.cross[ope.id].bx-1, bd.cross[ope.id].by-1, bd.cross[ope.id].bx+1, bd.cross[ope.id].by+1);
		}
		else if(ope.obj == k.BORDER){
			if     (pp == k.QUES){ bd.sQuB(ope.id, num);}
			else if(pp == k.QNUM){ bd.sQnB(ope.id, num);}
			else if(pp == k.QANS){ bd.sQaB(ope.id, num);}
			else if(pp == k.QSUB){ bd.sQsB(ope.id, num);}
			else if(pp == k.LINE){ bd.sLiB(ope.id, num);}
			this.paintBorder(ope.id);
		}
		else if(ope.obj == k.BOARD){
			var d = {x1:0, y1:0, x2:2*k.qcols, y2:2*k.qrows};

			if(num & menu.ex.TURNFLIP){ menu.ex.turnflip    (num,d);}
			else                      { menu.ex.expandreduce(num,d);}

			base.disableInfo();
			this.range = {x1:bd.minbx,y1:bd.minby,x2:bd.maxbx,y2:bd.maxby};
			this.reqReset = true;
		}
	},
	//---------------------------------------------------------------------------
	// um.paintBorder()  Borderの周りを描画するため、どの範囲まで変更が入ったか記憶しておく
	// um.paintStack()   変更が入った範囲を返す
	//---------------------------------------------------------------------------
	paintBorder : function(id){
		if(isNaN(id) || !bd.border[id]){ return;}
		if(bd.border[id].bx&1){
			this.paintStack(bd.border[id].bx-2, bd.border[id].by-1, bd.border[id].bx+2, bd.border[id].by+1);
		}
		else{
			this.paintStack(bd.border[id].bx-1, bd.border[id].by-2, bd.border[id].bx+1, bd.border[id].by+2);
		}
	},
	paintStack : function(x1,y1,x2,y2){
		if(this.range.x1 > x1){ this.range.x1 = x1;}
		if(this.range.y1 > y1){ this.range.y1 = y1;}
		if(this.range.x2 < x2){ this.range.x2 = x2;}
		if(this.range.y2 < y2){ this.range.y2 = y2;}
	}
};

//---------------------------------------------------------------------------
// ★Menuクラス [ファイル]等のメニューの動作を設定する
//---------------------------------------------------------------------------

// メニュー描画/取得/html表示系
// Menuクラス
Menu = function(){
	this.dispfloat  = [];			// 現在表示しているフロートメニューウィンドウ(オブジェクト)
	this.floatpanel = [];			// (2段目含む)フロートメニューオブジェクトのリスト
	this.pop        = "";			// 現在表示しているポップアップウィンドウ(オブジェクト)

	this.movingpop  = "";			// 移動中のポップアップメニュー
	this.offset = new Point(0, 0);	// ポップアップウィンドウの左上からの位置

	this.btnstack   = [];			// ボタンの情報(idnameと文字列のリスト)
	this.labelstack = [];			// span等の文字列の情報(idnameと文字列のリスト)

	this.ex = new MenuExec();
	this.ex.init();

	this.language = 'ja';

	this.ispencilbox = (k.isKanpenExist && (k.puzzleid!=="nanro" && k.puzzleid!=="ayeheya" && k.puzzleid!=="kurochute"));

	// ElementTemplate : メニュー領域
	var menu_funcs = {mouseover : ee.ebinder(this, this.menuhover), mouseout  : ee.ebinder(this, this.menuout)};
	this.EL_MENU  = ee.addTemplate('menupanel','li', {className:'menu'}, null, menu_funcs);

	// ElementTemplate : フロートメニュー
	var float_funcs = {mouseout:ee.ebinder(this, this.floatmenuout)};
	this.EL_FLOAT = ee.addTemplate('float_parent','menu', {className:'floatmenu'}, {backgroundColor:base.floatbgcolor}, float_funcs);

	// ElementTemplate : フロートメニュー(中身)
	var smenu_funcs  = {mouseover: ee.ebinder(this, this.submenuhover), mouseout: ee.ebinder(this, this.submenuout), click:ee.ebinder(this, this.submenuclick)};
	var select_funcs = {mouseover: ee.ebinder(this, this.submenuhover), mouseout: ee.ebinder(this, this.submenuout)};
	this.EL_SMENU    = ee.addTemplate('','li', {className:'smenu'}, null, smenu_funcs);
	this.EL_SPARENT  = ee.addTemplate('','li', {className:'smenu'}, null, select_funcs);
	this.EL_SELECT   = ee.addTemplate('','li', {className:'smenu'}, {fontWeight :'900', fontSize:'10pt'}, select_funcs);
	this.EL_CHECK    = ee.addTemplate('','li', {className:'smenu'}, {paddingLeft:'6pt', fontSize:'10pt'}, smenu_funcs);
	this.EL_LABEL    = ee.addTemplate('','li', {className:'smenulabel'}, null, null);
	this.EL_CHILD    = this.EL_CHECK;
	this.EL_SEPARATE = (
		// IE7以下向けのCSSハックをやめて、ここで設定するようにした
		(!k.br.IE6) ? ee.addTemplate('','li', {className:'smenusep', innerHTML:'&nbsp;'}, null, null)
					: ee.addTemplate('','li', {className:'smenusep', innerHTML:'&nbsp;'}, {lineHeight :'2pt', display:'inline'}, null)
	);

	// ElementTemplate : 管理領域
	this.EL_DIVPACK  = ee.addTemplate('','div',  null, null, null);
	this.EL_SPAN     = ee.addTemplate('','span', {unselectable:'on'}, null, null);
	this.EL_CHECKBOX = ee.addTemplate('','input',{type:'checkbox', check:''}, null, {click:ee.ebinder(this, this.checkclick)});
	this.EL_SELCHILD = ee.addTemplate('','div',  {className:'flag',unselectable:'on'}, null, {click:ee.ebinder(this, this.selectclick)});

	// ElementTemplate : ボタン
	this.EL_BUTTON = ee.addTemplate('','input', {type:'button'}, null, null);
	this.EL_UBUTTON = ee.addTemplate('btnarea','input', {type:'button'}, null, null);
};
Menu.prototype = {
	//---------------------------------------------------------------------------
	// menu.menuinit()   メニュー、サブメニュー、フロートメニュー、ボタン、
	//                   管理領域、ポップアップメニューの初期設定を行う
	// menu.menureset()  メニュー用の設定を消去する
	//
	// menu.addButtons() ボタンの情報を変数に登録する
	// menu.addLabels()  ラベルの情報を変数に登録する
	//---------------------------------------------------------------------------
	menuinit : function(){
		this.menuarea();
		this.managearea();
		this.poparea();

		this.displayAll();
	},

	menureset : function(){
		this.dispfloat  = [];
		this.floatpanel = [];
		this.pop        = "";
		this.btnstack   = [];
		this.labelstack = [];
		this.managestack = [];

		this.popclose();
		this.menuclear();
		this.floatmenuclose(0);

		ee('float_parent').el.innerHTML = '';

		if(!!ee('btncolor2')){ ee('btncolor2').remove();}
		ee('btnarea').el.innerHTML = '';

		ee('urlbuttonarea').el.innerHTML = '';

		ee('menupanel') .el.innerHTML = '';
		ee('usepanel')  .el.innerHTML = '';
		ee('checkpanel').el.innerHTML = '';

		pp.reset();
	},

	addButtons : function(el, func, strJP, strEN){
		if(!!func) el.onclick = func;
		ee(el).unselectable();
		this.btnstack.push({el:el, str:{ja:strJP, en:strEN}});
	},
	addLabels  : function(el, strJP, strEN){
		this.labelstack.push({el:el, str:{ja:strJP, en:strEN}});
	},

	//---------------------------------------------------------------------------
	// menu.displayAll() 全てのメニュー、ボタン、ラベルに対して文字列を設定する
	// menu.setdisplay() 管理パネルとサブメニューに表示する文字列を個別に設定する
	//---------------------------------------------------------------------------
	displayAll : function(){
		for(var i in pp.flags){ this.setdisplay(i);}
		for(var i=0,len=this.btnstack.length;i<len;i++){
			if(!this.btnstack[i].el){ continue;}
			this.btnstack[i].el.value = this.btnstack[i].str[menu.language];
		}
		for(var i=0,len=this.labelstack.length;i<len;i++){
			if(!this.labelstack[i].el){ continue;}
			this.labelstack[i].el.innerHTML = this.labelstack[i].str[menu.language];
		}
	},
	setdisplay : function(idname){
		switch(pp.type(idname)){
		case pp.MENU:
			var menu = ee('ms_'+idname);
			if(!!menu){ menu.el.innerHTML = "["+pp.getMenuStr(idname)+"]";}
			break;

		case pp.SMENU: case pp.LABEL: case pp.SPARENT:
			var smenu = ee('ms_'+idname);
			if(!!smenu){ smenu.el.innerHTML = pp.getMenuStr(idname);}
			break;

		case pp.SELECT:
			var smenu = ee('ms_'+idname), label = ee('cl_'+idname);
			if(!!smenu){ smenu.el.innerHTML = "&nbsp;"+pp.getMenuStr(idname);}	// メニュー上の表記の設定
			if(!!label){ label.el.innerHTML = pp.getLabel(idname);}			// 管理領域上の表記の設定
			for(var i=0,len=pp.flags[idname].child.length;i<len;i++){ this.setdisplay(""+idname+"_"+pp.flags[idname].child[i]);}
			break;

		case pp.CHILD:
			var smenu = ee('ms_'+idname), manage = ee('up_'+idname);
			var issel = (pp.getVal(idname) == pp.getVal(pp.flags[idname].parent));
			var cap = pp.getMenuStr(idname);
			if(!!smenu){ smenu.el.innerHTML = (issel?"+":"&nbsp;")+cap;}	// メニューの項目
			if(!!manage){													// 管理領域の項目
				manage.el.innerHTML = cap;
				manage.el.className = (issel?"childsel":"child");
			}
			break;

		case pp.CHECK:
			var smenu = ee('ms_'+idname), check = ee('ck_'+idname), label = ee('cl_'+idname);
			var flag = pp.getVal(idname);
			if(!!smenu){ smenu.el.innerHTML = (flag?"+":"&nbsp;")+pp.getMenuStr(idname);}	// メニュー
			if(!!check){ check.el.checked   = flag;}					// 管理領域(チェックボックス)
			if(!!label){ label.el.innerHTML = pp.getLabel(idname);}		// 管理領域(ラベル)
			break;
		}
	},

//--------------------------------------------------------------------------------------------------------------

	//---------------------------------------------------------------------------
	// menu.menuarea()   メニューの初期設定を行う
	//---------------------------------------------------------------------------
	menuarea : function(){
		var am = ee.binder(pp, pp.addMenu),
			at = ee.binder(pp, pp.addSParent),
			as = ee.binder(pp, pp.addSmenu),
			au = ee.binder(pp, pp.addSelect),
			ac = ee.binder(pp, pp.addCheck),
			aa = ee.binder(pp, pp.addCaption),
			ai = ee.binder(pp, pp.addChild),
			ap = ee.binder(pp, pp.addSeparator),
			af = ee.binder(pp, pp.addFlagOnly),
			sl = ee.binder(pp, pp.setLabel);

		// *ファイル ==========================================================
		am('file', "ファイル", "File");

		as('newboard', 'file', '新規作成','New Board');
		as('urlinput', 'file', 'URL入力', 'Import from URL');
		as('urloutput','file', 'URL出力', 'Export URL');
		ap('sep_file', 'file');
		as('fileopen', 'file', 'ファイルを開く','Open the file');
		at('filesavep', 'file', 'ファイル保存 ->',  'Save the file as ... ->');
		if(fio.dbm.DBaccept>0){
			as('database',  'file', '一時保存/戻す', 'Temporary Stack');
		}
		if(base.enableSaveImage){
			ap('sep_image', 'file');
			at('imagesavep', 'file', '画像を保存 ->', 'Save as image file');
		}

		// *ファイル - ファイル保存 -------------------------------------------
		as('filesave',  'filesavep', 'ぱずぷれv3形式',  'Puz-Pre v3 format');
		if(this.ispencilbox){
			as('filesave2', 'filesavep', 'pencilbox形式', 'Pencilbox format');
		}

		// *ファイル - 画像を保存 -------------------------------------------
		if(base.enableSaveImage){
			as('imagedl',   'imagesavep', '画像をダウンロード', 'Download the image');
			as('imagesave', 'imagesavep', '別ウィンドウで開く', 'Open another window');
		}

		// *編集 ==============================================================
		am('edit', "編集", "Edit");

		as('adjust', 'edit', '盤面の調整', 'Adjust the Board');
		as('turn',   'edit', '反転・回転', 'Filp/Turn the Board');

		// *表示 ==============================================================
		am('disp', "表示", "Display");

		as('dispsize', 'disp','サイズ指定','Cell Size');
		ap('sep_disp0',  'disp');

		au('size','disp',2,[0,1,2,3,4], '表示サイズ','Cell Size');
		ap('sep_disp1',  'disp');

		if(!!k.irowake){
			ac('irowake','disp',(k.irowake==2?true:false),'線の色分け','Color coding');
			sl('irowake', '線の色分けをする', 'Color each lines');
		}
		ac('cursor','disp',true,'カーソルの表示','Display cursor');
		ac('adjsize', 'disp', true, '自動横幅調節', 'Auto Size Adjust');
		ap('sep_disp2', 'disp');
		as('repaint', 'disp', '盤面の再描画', 'Repaint whole board');
		as('manarea', 'disp', '管理領域を隠す', 'Hide Management Area');

		// *表示 - 表示サイズ -------------------------------------------------
		aa('cap_dispmode','size','表示モード','Display mode');
		ai('size_0', 'size', 'サイズ 極小', 'Ex Small');
		ai('size_1', 'size', 'サイズ 小',   'Small');
		ai('size_2', 'size', 'サイズ 標準', 'Normal');
		ai('size_3', 'size', 'サイズ 大',   'Large');
		ai('size_4', 'size', 'サイズ 特大', 'Ex Large');

		// *設定 ==============================================================
		am('setting', "設定", "Setting");

		if(k.EDITOR){
			au('mode','setting',(k.editmode?1:3),[1,3],'モード', 'mode');
			sl('mode','モード', 'mode');
		}
		else{
			af('mode', 3);
		}

		puz.menufix();	// 各パズルごとのメニュー追加

		ac('autocheck','setting', k.playmode, '正答自動判定', 'Auto Answer Check');
		ac('lrcheck',  'setting', false, 'マウス左右反転', 'Mouse button inversion');
		sl('lrcheck', 'マウスの左右ボタンを反転する', 'Invert button of the mouse');
		if(kp.haspanel[1] || kp.haspanel[3]){
			ac('keypopup', 'setting', false, 'パネル入力', 'Panel inputting');
			sl('keypopup', '数字・記号をパネルで入力する', 'Input numbers by panel');
		}
		au('language', 'setting', 'ja', ['ja','en'], '言語', 'Language');

		// *設定 - モード -----------------------------------------------------
		ai('mode_1', 'mode', '問題作成モード', 'Edit mode'  );
		ai('mode_3', 'mode', '回答モード',     'Answer mode');

		// *設定 - 言語 -------------------------------------------------------
		ai('language_ja', 'language', '日本語',  '日本語');
		ai('language_en', 'language', 'English', 'English');

		// *その他 ============================================================
		am('other', "その他", "Others");

		as('credit',  'other', 'ぱずぷれv3について',   'About PUZ-PRE v3');
		ap('sep_other','other');
		at('link',     'other', 'リンク', 'Link');
		at('debug',    'other', 'デバッグ', 'Debug');

		// *その他 - リンク ---------------------------------------------------
		as('jumpv3',  'link', 'ぱずぷれv3のページへ', 'Jump to PUZ-PRE v3 page');
		as('jumptop', 'link', '連続発破保管庫TOPへ',  'Jump to indi.s58.xrea.com');
		as('jumpblog','link', 'はっぱ日記(blog)へ',   'Jump to my blog');

		// *その他 - デバッグ -------------------------------------------------
		as('poptest', 'debug', 'pop_testを表示', 'Show pop_test window');

		this.createAllFloat();
	},

	//---------------------------------------------------------------------------
	// menu.addUseToFlags()       「操作方法」サブメニュー登録用共通関数
	// menu.addRedLineToFlags()   「線のつながりをチェック」サブメニュー登録用共通関数
	// menu.addRedBlockToFlags()  「黒マスのつながりをチェック」サブメニュー登録用共通関数
	// menu.addRedBlockRBToFlags()「ナナメ黒マスのつながりをチェック」サブメニュー登録用共通関数
	//---------------------------------------------------------------------------
	addUseToFlags : function(){
		pp.addSelect('use','setting',1,[1,2], '操作方法', 'Input Type');
		pp.setLabel ('use', '操作方法', 'Input Type');

		pp.addChild('use_1','use','左右ボタン','LR Button');
		pp.addChild('use_2','use','1ボタン',   'One Button');
	},
	addRedLineToFlags : function(){
		pp.addCheck('dispred','setting',false,'繋がりチェック','Continuous Check');
		pp.setLabel('dispred', '線のつながりをチェックする', 'Check countinuous lines');
	},
	addRedBlockToFlags : function(){
		pp.addCheck('dispred','setting',false,'繋がりチェック','Continuous Check');
		pp.setLabel('dispred', '黒マスのつながりをチェックする', 'Check countinuous black cells');
	},
	addRedBlockRBToFlags : function(){
		pp.addCheck('dispred','setting',false,'繋がりチェック','Continuous Check');
		pp.setLabel('dispred', 'ナナメ黒マスのつながりをチェックする', 'Check countinuous black cells with its corner');
	},

	//---------------------------------------------------------------------------
	// menu.createAllFloat() 登録されたサブメニューから全てのフロートメニューを作成する
	//---------------------------------------------------------------------------
	createAllFloat : function(){
		for(var i=0;i<pp.flaglist.length;i++){
			var id = pp.flaglist[i];
			if(!pp.flags[id]){ continue;}

			var smenu, smenuid = 'ms_'+id;
			switch(pp.type(id)){
				case pp.MENU:     smenu = ee.createEL(this.EL_MENU,    smenuid); continue; break;
				case pp.SEPARATE: smenu = ee.createEL(this.EL_SEPARATE,smenuid); break;
				case pp.LABEL:    smenu = ee.createEL(this.EL_LABEL,   smenuid); break;
				case pp.SELECT:   smenu = ee.createEL(this.EL_SELECT,  smenuid); break;
				case pp.SMENU:    smenu = ee.createEL(this.EL_SMENU,   smenuid); break;
				case pp.CHECK:    smenu = ee.createEL(this.EL_CHECK,   smenuid); break;
				case pp.CHILD:    smenu = ee.createEL(this.EL_CHILD,   smenuid); break;
				case pp.SPARENT:
					var dispnormal = (pp.getMenuStr(id).indexOf("->")>=0);
					smenu = ee.createEL((dispnormal ? this.EL_SPARENT : this.EL_SELECT), smenuid);
					break;
				default: continue; break;
			}

			var parentid = pp.flags[id].parent;
			if(!this.floatpanel[parentid]){
				this.floatpanel[parentid] = ee.createEL(this.EL_FLOAT, 'float_'+parentid);
			}
			this.floatpanel[parentid].appendChild(smenu);
		}

		// 'setting'だけはセパレータを後から挿入する
		var el = ee('float_setting').el, fw = el.firstChild.style.fontWeight
		for(var i=1,len=el.childNodes.length;i<len;i++){
			var node = el.childNodes[i];
			if(fw!=node.style.fontWeight){
				var smenu = ee.createEL(this.EL_SEPARATE,'');
				ee(smenu).insertBefore(node);
				i++; len++; // 追加したので1たしておく
			}
			fw=node.style.fontWeight;
		}

		// その他の調整
		if(k.PLAYER){
			ee('ms_newboard') .el.className = 'smenunull';
			ee('ms_urloutput').el.className = 'smenunull';
			ee('ms_adjust')   .el.className = 'smenunull';
		}
		ee('ms_jumpv3')  .el.style.fontSize = '10pt'; ee('ms_jumpv3')  .el.style.paddingLeft = '8pt';
		ee('ms_jumptop') .el.style.fontSize = '10pt'; ee('ms_jumptop') .el.style.paddingLeft = '8pt';
		ee('ms_jumpblog').el.style.fontSize = '10pt'; ee('ms_jumpblog').el.style.paddingLeft = '8pt';
	},

	//---------------------------------------------------------------------------
	// menu.menuhover(e) メニューにマウスが乗ったときの表示設定を行う
	// menu.menuout(e)   メニューからマウスが外れた時の表示設定を行う
	// menu.menuclear()  メニュー/サブメニュー/フロートメニューを全て選択されていない状態に戻す
	//---------------------------------------------------------------------------
	menuhover : function(e){
		if(!!this.movingpop){ return true;}

		var idname = ee.getSrcElement(e).id.substr(3);
		this.floatmenuopen(e,idname,0);
		ee('menupanel').replaceChildrenClass('menusel','menu');
		ee.getSrcElement(e).className = "menusel";
	},
	menuout   : function(e){
		if(!this.insideOfMenu(e)){
			this.menuclear();
			this.floatmenuclose(0);
		}
	},
	menuclear : function(){
		ee('menupanel').replaceChildrenClass('menusel','menu');
	},

	//---------------------------------------------------------------------------
	// menu.submenuhover(e) サブメニューにマウスが乗ったときの表示設定を行う
	// menu.submenuout(e)   サブメニューからマウスが外れたときの表示設定を行う
	// menu.submenuclick(e) 通常/選択型/チェック型サブメニューがクリックされたときの動作を実行する
	//---------------------------------------------------------------------------
	submenuhover : function(e){
		var idname = ee.getSrcElement(e).id.substr(3);
		if(ee.getSrcElement(e).className==="smenu"){ ee.getSrcElement(e).className="smenusel";}
		if(pp.flags[idname] && (pp.type(idname)===pp.SELECT || pp.type(idname)===pp.SPARENT)){
			if(ee.getSrcElement(e).className!=='smenunull'){
				this.floatmenuopen(e,idname,this.dispfloat.length);
			}
		}
	},
	submenuout   : function(e){
		var idname = ee.getSrcElement(e).id.substr(3);
		if(ee.getSrcElement(e).className==="smenusel"){ ee.getSrcElement(e).className="smenu";}
		if(pp.flags[idname] && (pp.type(idname)===pp.SELECT || pp.type(idname)===pp.SPARENT)){
			this.floatmenuout(e);
		}
	},
	submenuclick : function(e){
		var idname = ee.getSrcElement(e).id.substr(3);
		if(ee.getSrcElement(e).className==="smenunull"){ return;}
		this.menuclear();
		this.floatmenuclose(0);

		switch(pp.type(idname)){
			case pp.SMENU: this.popopen(e, idname); break;
			case pp.CHILD: pp.setVal(pp.flags[idname].parent, pp.getVal(idname)); break;
			case pp.CHECK: pp.setVal(idname, !pp.getVal(idname)); break;
		}
	},

	//---------------------------------------------------------------------------
	// menu.floatmenuopen()  マウスがメニュー項目上に来た時にフロートメニューを表示する
	// menu.floatmenuclose() フロートメニューをcloseする
	// menu.floatmenuout(e)  マウスがフロートメニューを離れた時にフロートメニューをcloseする
	// menu.insideOf()       イベントeがエレメントの範囲内で起こったか？
	// menu.insideOfMenu()   マウスがメニュー領域の中にいるか判定する
	//---------------------------------------------------------------------------
	floatmenuopen : function(e, idname, depth){
		if(depth===0){ this.menuclear();}
		this.floatmenuclose(depth);

		if(depth>0 && !this.dispfloat[depth-1]){ return;}

		var rect = ee(ee.getSrcElement(e).id).getRect();
		var _float = this.floatpanel[idname];
		if(depth==0){
			_float.style.left = rect.left   + 1 + 'px';
			_float.style.top  = rect.bottom + 1 + 'px';
		}
		else{
			if(!k.br.IE6){
				_float.style.left = rect.right - 3 + 'px';
				_float.style.top  = rect.top   - 3 + 'px';
			}
			else{
				_float.style.left = ee.pageX(e)  + 'px';
				_float.style.top  = rect.top - 3 + 'px';
			}
		}
		_float.style.zIndex   = 101+depth;
		_float.style.display  = 'block';

		this.dispfloat.push(_float);
	},
	// マウスが離れたときにフロートメニューをクローズする
	// フロート->メニュー側に外れた時は、関数終了直後にfloatmenuopen()が呼ばれる
	floatmenuclose : function(depth){
		for(var i=this.dispfloat.length-1;i>=depth;i--){
			if(i!==0){
				var parentsmenuid = "ms_" + this.dispfloat[i].id.substr(6);
				ee(parentsmenuid).el.className = 'smenu';
			}
			this.dispfloat[i].style.display = 'none';
			this.dispfloat.pop();
		}
	},

	floatmenuout : function(e){
		for(var i=this.dispfloat.length-1;i>=0;i--){
			if(this.insideOf(this.dispfloat[i],e)){
				this.floatmenuclose(i+1);
				return;
			}
		}
		// ここに来るのはすべて消える場合
		this.menuclear();
		this.floatmenuclose(0);
	},

	insideOf : function(el, e){
		var ex = ee.pageX(e);
		var ey = ee.pageY(e);
		var rect = ee(el.id).getRect();
		return (ex>=rect.left && ex<=rect.right && ey>=rect.top && ey<=rect.bottom);
	},
	insideOfMenu : function(e){
		var ex = ee.pageX(e);
		var ey = ee.pageY(e);
		var rect_f = ee('ms_file').getRect(), rect_o = ee('ms_other').getRect();
		return (ex>=rect_f.left && ex<=rect_o.right && ey>=rect_f.top);
	},

//--------------------------------------------------------------------------------------------------------------

	//---------------------------------------------------------------------------
	// menu.managearea()   管理領域の初期化を行う(内容はサブメニューのものを参照)
	// menu.checkclick()   管理領域のチェックボタンが押されたとき、チェック型の設定を設定する
	// menu.selectclick()  選択型サブメニュー項目がクリックされたときの動作
	//---------------------------------------------------------------------------
	managearea : function(){
		// usearea & checkarea
		for(var n=0;n<pp.flaglist.length;n++){
			var idname = pp.flaglist[n];
			if(!pp.flags[idname] || !pp.getLabel(idname)){ continue;}
			var _div = ee(ee.createEL(this.EL_DIVPACK,'div_'+idname));
			//_div.el.innerHTML = "";

			switch(pp.type(idname)){
			case pp.SELECT:
				_div.appendEL(ee.createEL(this.EL_SPAN, 'cl_'+idname));
				_div.appendHTML("&nbsp;|&nbsp;");
				for(var i=0;i<pp.flags[idname].child.length;i++){
					var num = pp.flags[idname].child[i];
					_div.appendEL(ee.createEL(this.EL_SELCHILD, ['up',idname,num].join("_")));
					_div.appendHTML('&nbsp;');
				}
				_div.appendBR();

				ee('usepanel').appendEL(_div.el);
				break;

			case pp.CHECK:
				_div.appendEL(ee.createEL(this.EL_CHECKBOX, 'ck_'+idname));
				_div.appendHTML("&nbsp;");
				_div.appendEL(ee.createEL(this.EL_SPAN, 'cl_'+idname));
				_div.appendBR();

				ee('checkpanel').appendEL(_div.el);
				break;
			}
		}

		// 色分けチェックボックス用の処理
		if(k.irowake){
			// 横にくっつけたいボタンを追加
			var el = ee.createEL(this.EL_BUTTON, 'ck_btn_irowake');
			this.addButtons(el, ee.binder(menu.ex, menu.ex.irowakeRemake), "色分けしなおす", "Change the color of Line");
			ee('ck_btn_irowake').insertAfter(ee('cl_irowake').el);

			// 色分けのやつを一番下に持ってくる
			var el = ee('checkpanel').el.removeChild(ee('div_irowake').el);
			ee('checkpanel').el.appendChild(el);
		}

		// 左上に出てくるやつ
		ee('translation').unselectable().el.onclick = ee.binder(this, this.translate);
		this.addLabels(ee('translation').el, "English", "日本語");

		// 説明文の場所
		ee('expression').el.innerHTML = base.expression.ja;

		// 管理領域の表示/非表示設定
		if(k.EDITOR){
			ee('timerpanel').el.style.display = 'none';
			ee('separator2').el.style.display = 'none';
		}
		if(!!ee('ck_keypopup')){ pp.funcs.keypopup();}

		// (Canvas下) ボタンの初期設定
		ee.createEL(this.EL_UBUTTON, 'btncheck');
		ee('btnarea').appendHTML('&nbsp;');
		ee.createEL(this.EL_UBUTTON, 'btnundo');
		ee.createEL(this.EL_UBUTTON, 'btnredo');
		ee('btnarea').appendHTML('&nbsp;');
		ee.createEL(this.EL_UBUTTON, 'btnclear');
		ee.createEL(this.EL_UBUTTON, 'btnclear2');

		this.addButtons(ee("btncheck").el,  ee.binder(ans, ans.check),             "チェック", "Check");
		this.addButtons(ee("btnundo").el,   ee.binder(um, um.undo),                "戻",       "<-");
		this.addButtons(ee("btnredo").el,   ee.binder(um, um.redo),                "進",       "->");
		this.addButtons(ee("btnclear").el,  ee.binder(menu.ex, menu.ex.ACconfirm), "回答消去", "Erase Answer");
		this.addButtons(ee("btnclear2").el, ee.binder(menu.ex, menu.ex.ASconfirm), "補助消去", "Erase Auxiliary Marks");

		// 初期値ではどっちも押せない
		ee('btnundo').el.disabled = true;
		ee('btnredo').el.disabled = true;

		// なぜかF5で更新するとtrueになってるので応急処置...
		ee('btnclear') .el.disabled = false;
		ee('btnclear2').el.disabled = false;

		if(k.irowake!=0){
			var el = ee.createEL(this.EL_BUTTON, 'btncolor2');
			this.addButtons(el, ee.binder(menu.ex, menu.ex.irowakeRemake), "色分けしなおす", "Change the color of Line");
			ee('btncolor2').insertAfter(ee('btnclear2').el).el.style.display = 'none';
		}
	},

	checkclick : function(e){
		var el = ee.getSrcElement(e);
		var idname = el.id.substr(3);
		pp.setVal(idname, !!el.checked);
	},
	selectclick : function(e){
		var list = ee.getSrcElement(e).id.split('_');
		pp.setVal(list[1], list[2]);
	},

//--------------------------------------------------------------------------------------------------------------

	//---------------------------------------------------------------------------
	// menu.poparea()       ポップアップメニューの初期設定を行う
	//---------------------------------------------------------------------------
	poparea : function(){

		//=====================================================================
		//// 各タイトルバーの動作設定
		var pop = ee('popup_parent').el.firstChild;
		while(!!pop){
			var _el = pop.firstChild;
			while(!!_el){
				if(_el.className==='titlebar'){
					this.titlebarfunc(_el);
					break;
				}
				_el = _el.nextSibling;
			}
			pop = pop.nextSibling;
		}
		this.titlebarfunc(ee('credit3_1').el);

		_doc.onmousemove = ee.ebinder(this,this.titlebarmove);
		_doc.onmouseup   = ee.ebinder(this,this.titlebarup);

		//=====================================================================
		//// formボタンの動作設定・その他のCaption設定
		var btn = ee.binder(this, this.addButtons);
		var lab = ee.binder(this, this.addLabels);
		var close = ee.ebinder(this, this.popclose);
		var func = null;

		// 盤面の新規作成 -----------------------------------------------------
		func = ee.ebinder(this.ex, this.ex.newboard);
		lab(ee('bar1_1').el,      "盤面の新規作成",         "Createing New Board");
		lab(ee('pop1_1_cap0').el, "盤面を新規作成します。", "Create New Board.");
		if(k.puzzleid!=='sudoku' && k.puzzleid!=='tawa'){
			lab(ee('pop1_1_cap1').el, "よこ",                   "Cols");
			lab(ee('pop1_1_cap2').el, "たて",                   "Rows");
		}
		btn(_doc.newboard.newboard, func,  "新規作成",   "Create");
		btn(_doc.newboard.cancel,   close, "キャンセル", "Cancel");

		// URL入力 ------------------------------------------------------------
		func = ee.ebinder(this.ex, this.ex.urlinput);
		lab(ee('bar1_2').el,      "URL入力",                     "Import from URL");
		lab(ee('pop1_2_cap0').el, "URLから問題を読み込みます。", "Import a question from URL.");
		btn(_doc.urlinput.urlinput, func,  "読み込む",   "Import");
		btn(_doc.urlinput.cancel,   close, "キャンセル", "Cancel");

		// URL出力 ------------------------------------------------------------
		func = ee.ebinder(this.ex, this.ex.urloutput);
		lab(ee('bar1_3').el, "URL出力", "Export URL");
		var btt = function(name, strJP, strEN, eval){
			if(eval===false){ return;}
			var el = ee.createEL(menu.EL_BUTTON,''); el.name = name;
			ee('urlbuttonarea').appendEL(el).appendBR();
			btn(el, func, strJP, strEN);
		};
		btt('pzprv3',     "ぱずぷれv3のURLを出力する",           "Output PUZ-PRE v3 URL",          true);
		btt('pzprapplet', "ぱずぷれ(アプレット)のURLを出力する", "Output PUZ-PRE(JavaApplet) URL", !k.ispzprv3ONLY);
		btt('kanpen',     "カンペンのURLを出力する",             "Output Kanpen URL",              k.isKanpenExist);
		btt('heyaapp',    "へやわけアプレットのURLを出力する",   "Output Heyawake-Applet URL",     (k.puzzleid==="heyawake"));
		btt('pzprv3edit', "ぱずぷれv3の再編集用URLを出力する",   "Output PUZ-PRE v3 Re-Edit URL",  true);
		ee("urlbuttonarea").appendBR();
		func = ee.ebinder(this.ex, this.ex.openurl);
		btn(_doc.urloutput.openurl, func,  "このURLを開く", "Open this URL on another window/tab");
		btn(_doc.urloutput.close,   close, "閉じる", "Close");

		// ファイル入力 -------------------------------------------------------
		func = ee.ebinder(this.ex, this.ex.fileopen);
		lab(ee('bar1_4').el,      "ファイルを開く", "Open file");
		lab(ee('pop1_4_cap0').el, "ファイル選択",   "Choose file");
		_doc.fileform.filebox.onchange = func;
		btn(_doc.fileform.close,    close, "閉じる",     "Close");

		// データベースを開く -------------------------------------------------
		func = ee.ebinder(fio.dbm, fio.dbm.clickHandler);
		lab(ee('bar1_8').el, "一時保存/戻す", "Temporary Stack");
		_doc.database.sorts   .onchange = func;
		_doc.database.datalist.onchange = func;
		_doc.database.tableup .onclick  = func;
		_doc.database.tabledn .onclick  = func;
		btn(_doc.database.open,     func,  "データを読み込む",   "Load");
		btn(_doc.database.save,     func,  "盤面を保存",         "Save");
		lab(ee('pop1_8_com').el, "コメント:", "Comment:");
		btn(_doc.database.comedit,  func,  "コメントを編集する", "Edit Comment");
		btn(_doc.database.difedit,  func,  "難易度を設定する",   "Set difficulty");
		btn(_doc.database.del,      func,  "削除",               "Delete");
		btn(_doc.database.close,    close, "閉じる",             "Close");

		// 盤面の調整 ---------------------------------------------------------
		func = ee.ebinder(this.ex, this.ex.popupadjust);
		lab(ee('bar2_1').el,      "盤面の調整",             "Adjust the board");
		lab(ee('pop2_1_cap0').el, "盤面の調整を行います。", "Adjust the board.");
		lab(ee('pop2_1_cap1').el, "拡大",  "Expand");
		btn(_doc.adjust.expandup,   func,  "上",     "UP");
		btn(_doc.adjust.expanddn,   func,  "下",     "Down");
		btn(_doc.adjust.expandlt,   func,  "左",     "Left");
		btn(_doc.adjust.expandrt,   func,  "右",     "Right");
		lab(ee('pop2_1_cap2').el, "縮小", "Reduce");
		btn(_doc.adjust.reduceup,   func,  "上",     "UP");
		btn(_doc.adjust.reducedn,   func,  "下",     "Down");
		btn(_doc.adjust.reducelt,   func,  "左",     "Left");
		btn(_doc.adjust.reducert,   func,  "右",     "Right");
		btn(_doc.adjust.close,      close, "閉じる", "Close");

		// 反転・回転 ---------------------------------------------------------
		lab(ee('bar2_2').el,      "反転・回転",                  "Flip/Turn the board");
		lab(ee('pop2_2_cap0').el, "盤面の回転・反転を行います。","Flip/Turn the board.");
		btn(_doc.flip.turnl,  func,  "左90°回転", "Turn left by 90 degree");
		btn(_doc.flip.turnr,  func,  "右90°回転", "Turn right by 90 degree");
		btn(_doc.flip.flipy,  func,  "上下反転",   "Flip upside down");
		btn(_doc.flip.flipx,  func,  "左右反転",   "Flip leftside right");
		btn(_doc.flip.close,  close, "閉じる",     "Close");

		// credit -------------------------------------------------------------
		lab(ee('bar3_1').el,   "credit", "credit");
		lab(ee('credit3_1').el,"ぱずぷれv3 "+pzprversion+"<br>\n<br>\nぱずぷれv3は はっぱ/連続発破が作成しています。<br>\nライブラリとしてuuCanvas1.0, Google Gearsを使用しています。<br>\n<br>\n",
							   "PUZ-PRE v3 "+pzprversion+"<br>\n<br>\nPUZ-PRE v3 id made by happa.<br>\nThis script use uuCanvas1.0 and Google Gears as libraries.&nbsp;<br>\n<br>\n");
		btn(_doc.credit.close,  close, "閉じる", "OK");

		// 表示サイズ ---------------------------------------------------------
		func = ee.ebinder(this, this.ex.dispsize);
		lab(ee('bar4_1').el,      "表示サイズの変更",         "Change size");
		lab(ee('pop4_1_cap0').el, "表示サイズを変更します。", "Change the display size.");
		lab(ee('pop4_1_cap1').el, "表示サイズ",               "Display size");
		btn(_doc.dispsize.dispsize, func,  "変更する",   "Change");
		btn(_doc.dispsize.cancel,   close, "キャンセル", "Cancel");

		// poptest ------------------------------------------------------------
		debug.poptest_func();
	},

	//---------------------------------------------------------------------------
	// menu.popopen()  ポップアップメニューを開く
	// menu.popclose() ポップアップメニューを閉じる
	//---------------------------------------------------------------------------
	popopen : function(e, idname){
		// 表示しているウィンドウがある場合は閉じる
		this.popclose();

		// この中でmenu.popも設定されます。
		if(pp.funcs[idname]){ pp.funcs[idname]();}

		// ポップアップメニューを表示する
		if(this.pop){
			var _pop = this.pop.el;
			_pop.style.left = ee.pageX(e) - 8 + 'px';
			_pop.style.top  = ee.pageY(e) - 8 + 'px';
			_pop.style.display = 'inline';
		}
	},
	popclose : function(){
		if(this.pop){
			if(this.pop.el.id=='pop1_8'){
				fio.dbm.closeDialog();
			}

			this.pop.el.style.display = "none";
			this.pop = '';
			this.menuclear();
			this.movingpop = "";
			kc.enableKey = true;
		}
	},

	//---------------------------------------------------------------------------
	// menu.titlebarfunc()  下の4つのイベントをイベントハンドラにくっつける
	// menu.titlebardown()  タイトルバーをクリックしたときの動作を行う(タイトルバーにbind)
	// menu.titlebarup()    タイトルバーでボタンを離したときの動作を行う(documentにbind)
	// menu.titlebarmove()  タイトルバーからマウスを動かしたときポップアップメニューを動かす(documentにbind)
	//---------------------------------------------------------------------------
	titlebarfunc : function(bar){
		bar.onmousedown = ee.ebinder(this, this.titlebardown);
		ee(bar).unselectable().el;
	},

	titlebardown : function(e){
		var pop = ee.getSrcElement(e).parentNode;
		this.movingpop = pop;
		this.offset.x = ee.pageX(e) - parseInt(pop.style.left);
		this.offset.y = ee.pageY(e) - parseInt(pop.style.top);
	},
	titlebarup : function(e){
		var pop = this.movingpop;
		if(!!pop){
			this.movingpop = "";
		}
	},
	titlebarmove : function(e){
		var pop = this.movingpop;
		if(!!pop){
			pop.style.left = ee.pageX(e) - this.offset.x + 'px';
			pop.style.top  = ee.pageY(e) - this.offset.y + 'px';
		}
	},

//--------------------------------------------------------------------------------------------------------------

	//--------------------------------------------------------------------------------
	// menu.translate()  htmlの言語を変える
	// menu.setLang()    言語を設定する
	// menu.selectStr()  現在の言語に応じた文字列を返す
	// menu.alertStr()   現在の言語に応じたダイアログを表示する
	// menu.confirmStr() 現在の言語に応じた選択ダイアログを表示し、結果を返す
	//--------------------------------------------------------------------------------
	translate : function(){
		this.setLang(this.language==='ja' ? 'en' : 'ja');
	},
	setLang : function(ln){
		this.language = ln;
		_doc.title = base.gettitle();
		ee('title2').el.innerHTML = base.gettitle();
		ee('expression').el.innerHTML = base.expression[this.language];

		this.displayAll();
		this.ex.dispmanstr();

		base.resize_canvas();
	},
	selectStr  : function(strJP, strEN){ return (this.language==='ja' ? strJP : strEN);},
	alertStr   : function(strJP, strEN){ alert(this.language==='ja' ? strJP : strEN);},
	confirmStr : function(strJP, strEN){ return confirm(this.language==='ja' ? strJP : strEN);},
};

//--------------------------------------------------------------------------------------------------------------

//---------------------------------------------------------------------------
// ★Propertiesクラス 設定値の値などを保持する
//---------------------------------------------------------------------------
Caption = function(){
	this.menu  = '';
	this.label = '';
};
SSData = function(){
	this.id     = '';
	this.type   = 0;
	this.val    = 1;
	this.parent = 1;
	this.child  = [];

	this.str    = { ja: new Caption(), en: new Caption()};
	//this.func   = null;
};
Properties = function(){
	this.flags    = [];	// サブメニュー項目の情報(SSDataクラスのオブジェクトの配列になる)
	this.flaglist = [];	// idnameの配列

	// const
	this.MENU     = 6;
	this.SPARENT  = 7;
	this.SMENU    = 0;
	this.SELECT   = 1;
	this.CHECK    = 2;
	this.LABEL    = 3;
	this.CHILD    = 4;
	this.SEPARATE = 5;
};
Properties.prototype = {
	reset : function(){
		this.flags    = [];
		this.flaglist = [];
	},

	//---------------------------------------------------------------------------
	// pp.addMenu()      メニュー最上位の情報を登録する
	// pp.addSParent()   フロートメニューを開くサブメニュー項目を登録する
	// pp.addSmenu()     Popupメニューを開くサブメニュー項目を登録する
	// pp.addCaption()   Captionとして使用するサブメニュー項目を登録する
	// pp.addSeparator() セパレータとして使用するサブメニュー項目を登録する
	// pp.addCheck()     選択型サブメニュー項目に表示する文字列を設定する
	// pp.addSelect()    チェック型サブメニュー項目に表示する文字列を設定する
	// pp.addChild()     チェック型サブメニュー項目の子要素を設定する
	// pp.addFlagOnly()  情報のみを登録する
	//---------------------------------------------------------------------------
	addMenu : function(idname, strJP, strEN){
		this.addFlags(idname, '', this.MENU, null, strJP, strEN);
	},
	addSParent : function(idname, parent, strJP, strEN){
		this.addFlags(idname, parent, this.SPARENT, null, strJP, strEN);
	},

	addSmenu : function(idname, parent, strJP, strEN){
		this.addFlags(idname, parent, this.SMENU, null, strJP, strEN);
	},

	addCaption : function(idname, parent, strJP, strEN){
		this.addFlags(idname, parent, this.LABEL, null, strJP, strEN);
	},
	addSeparator : function(idname, parent){
		this.addFlags(idname, parent, this.SEPARATE, null, '', '');
	},

	addCheck : function(idname, parent, first, strJP, strEN){
		this.addFlags(idname, parent, this.CHECK, first, strJP, strEN);
	},
	addSelect : function(idname, parent, first, child, strJP, strEN){
		this.addFlags(idname, parent, this.SELECT, first, strJP, strEN);
		this.flags[idname].child = child;
	},
	addChild : function(idname, parent, strJP, strEN){
		var list = idname.split("_");
		this.addFlags(idname, list[0], this.CHILD, list[1], strJP, strEN);
	},

	addFlagOnly : function(idname, first){
		this.addFlags(idname, '', '', first, '', '');
	},

	//---------------------------------------------------------------------------
	// pp.addFlags()  上記関数の内部共通処理
	// pp.setLabel()  管理領域に表記するラベル文字列を設定する
	//---------------------------------------------------------------------------
	addFlags : function(idname, parent, type, first, strJP, strEN){
		this.flags[idname] = {
			id     : idname,
			type   : type,
			val    : first,
			parent : parent,
			str : {
				ja : { menu:strJP, label:''},
				en : { menu:strEN, label:''}
			}
		}
		this.flaglist.push(idname);
	},

	setLabel : function(idname, strJP, strEN){
		if(!this.flags[idname]){ return;}
		this.flags[idname].str.ja.label = strJP;
		this.flags[idname].str.en.label = strEN;
	},

	//---------------------------------------------------------------------------
	// pp.getMenuStr() 管理パネルと選択型/チェック型サブメニューに表示する文字列を返す
	// pp.getLabel()   管理パネルとチェック型サブメニューに表示する文字列を返す
	// pp.type()       設定値のサブメニュータイプを返す
	//
	// pp.getVal()     各フラグのvalの値を返す
	// pp.setVal()     各フラグの設定値を設定する
	// pp.setValOnly() 各フラグの設定値を設定する。設定時に実行される関数は呼ばない
	//---------------------------------------------------------------------------
	getMenuStr : function(idname){ return this.flags[idname].str[menu.language].menu; },
	getLabel   : function(idname){ return this.flags[idname].str[menu.language].label;},
	type       : function(idname){ return this.flags[idname].type;},

	getVal : function(idname){ return this.flags[idname]?this.flags[idname].val:null;},
	setVal : function(idname, newval, isexecfunc){
		if(!!this.flags[idname] && (this.flags[idname].type===this.CHECK ||
									this.flags[idname].type===this.SELECT))
		{
			this.flags[idname].val = newval;
			menu.setdisplay(idname);
			if(this.funcs[idname] && isexecfunc!==false){ this.funcs[idname](newval);}
		}
	},
	setValOnly : function(idname, newval){ this.setVal(idname, newval, false);},

//--------------------------------------------------------------------------------------------------------------
	// submenuから呼び出される関数たち
	funcs : {
		urlinput  : function(){ menu.pop = ee("pop1_2");},
		urloutput : function(){ menu.pop = ee("pop1_3"); _doc.urloutput.ta.value = "";},
		fileopen  : function(){ menu.pop = ee("pop1_4");},
		filesave  : function(){ menu.ex.filesave(fio.PZPR);},
		filesave2 : function(){ if(!!fio.kanpenSave){ menu.ex.filesave(fio.PBOX);}},
		imagedl   : function(){ menu.ex.imagesave(true);},
		imagesave : function(){ menu.ex.imagesave(false);},
		database  : function(){ menu.pop = ee("pop1_8"); fio.dbm.openDialog();},
		adjust    : function(){ menu.pop = ee("pop2_1");},
		turn      : function(){ menu.pop = ee("pop2_2");},
		credit    : function(){ menu.pop = ee("pop3_1");},
		jumpv3    : function(){ window.open('./', '', '');},
		jumptop   : function(){ window.open('../../', '', '');},
		jumpblog  : function(){ window.open('http://d.hatena.ne.jp/sunanekoroom/', '', '');},
		irowake   : function(){ pc.paintAll();},
		cursor    : function(){ pc.paintAll();},
		manarea   : function(){ menu.ex.dispman();},
		poptest   : function(){ debug.disppoptest();},
		mode      : function(num){ menu.ex.modechange(num);},
		size      : function(num){ base.resize_canvas();},
		repaint   : function(num){ base.resize_canvas();},
		adjsize   : function(num){ base.resize_canvas();},
		language  : function(str){ menu.setLang(str);},

		newboard : function(){
			menu.pop = ee("pop1_1");
			if(k.puzzleid!="sudoku"){
				_doc.newboard.col.value = k.qcols;
				_doc.newboard.row.value = k.qrows;
			}
			kc.enableKey = false;
		},
		dispsize : function(){
			menu.pop = ee("pop4_1");
			_doc.dispsize.cs.value = k.cellsize;
			kc.enableKey = false;
		},
		keypopup : function(){
			var f = kp.haspanel[pp.flags['mode'].val];
			ee('ck_keypopup').el.disabled    = (f?"":"true");
			ee('cl_keypopup').el.style.color = (f?"black":"silver");

			kp.display();
		}
	}
};

//---------------------------------------------------------------------------
// ★debugオブジェクト  poptest関連の関数など
//---------------------------------------------------------------------------
var debug = {
	extend : function(object){
		for(var i in object){ this[i] = object[i];}
	},

	poptest_func : function(){
		menu.titlebarfunc(ee('bartest').el);

		_doc.testform.t1.onclick        = ee.binder(this, this.perfeval);
		_doc.testform.t2.onclick        = ee.binder(this, this.painteval);
		_doc.testform.t3.onclick        = ee.binder(this, this.resizeeval);
		_doc.testform.perfload.onclick  = ee.binder(this, this.loadperf);

		_doc.testform.filesave.onclick  = ee.binder(this, this.filesave);
		_doc.testform.pbfilesave.onclick  = ee.binder(this, this.filesave_pencilbox);

		_doc.testform.fileopen.onclick  = ee.binder(this, this.fileopen);
		_doc.testform.database.onclick  = ee.binder(this, this.dispdatabase);

		_doc.testform.erasetext.onclick = ee.binder(this, this.erasetext);
		_doc.testform.close.onclick     = function(e){ ee('poptest').el.style.display = 'none';};

		_doc.testform.testarea.style.fontSize = '10pt';

		_doc.testform.starttest.style.display = 'none';

		_doc.testform.perfload.style.display = (k.puzzleid!=='country' ? 'none' : 'inline');
		_doc.testform.pbfilesave.style.display = (!menu.ispencilbox ? 'none' : 'inline');
		_doc.testform.database.style.display = (!fio.DBaccept<0x08 ? 'none' : 'inline');

		if(k.scriptcheck){ debug.testonly_func();}	// テスト用
	},

	disppoptest : function(){
		var _pop_style = ee('poptest').el.style;
		_pop_style.display = 'inline';
		_pop_style.left = '40px';
		_pop_style.top  = '80px';
	},

	// k.scriptcheck===true時はオーバーライドされます
	keydown : function(ca){
		if(kc.isCTRL && ca=='F8'){
			this.disppoptest();
			kc.tcMoved = true;
			return true;
		}
		return false;
	},

	filesave : function(){
		this.setTA(fio.fileencode(fio.PZPR).replace(/\//g,"\n"));
		this.addTA('');
		this.addTA(fio.urlstr);
	},
	filesave_pencilbox : function(){
		this.setTA(fio.fileencode(fio.PBOX).replace(/\//g,"\n"));
	},

	fileopen : function(){
		var dataarray = this.getTA().split("\n");
		fio.filedecode(dataarray.join("/"));
	},

	erasetext : function(){
		this.setTA('');
		if(k.scriptcheck){ ee('testdiv').el.innerHTML = '';}
	},

	perfeval : function(){
		this.timeeval("正答判定測定",ee.binder(ans, ans.checkAns));
	},
	painteval : function(){
		this.timeeval("描画時間測定",ee.binder(pc, pc.paintAll));
	},
	resizeeval : function(){
		this.timeeval("resize描画測定",ee.binder(base, base.resize_canvas));
	},
	timeeval : function(text,func){
		this.addTA(text);
		var count=0, old = tm.now();
		while(tm.now() - old < 3000){
			count++;

			func();
		}
		var time = tm.now() - old;

		this.addTA("測定データ "+time+"ms / "+count+"回\n"+"平均時間   "+(time/count)+"ms")
	},

	dispdatabase : function(){
		var text = "";
		for(var i=0;i<localStorage.length;i++){
			var key = localStorage.key(i);
			text += (""+key+" "+localStorage[key]+"\n");
		}
		this.setTA(text);
	},

	loadperf : function(){
		fio.filedecode("pzprv3/country/10/18/44/0 0 1 1 1 2 2 2 3 4 4 4 5 5 6 6 7 8 /0 9 1 10 10 10 11 2 3 4 12 4 4 5 6 13 13 8 /0 9 1 1 10 10 11 2 3 12 12 12 4 5 14 13 13 15 /0 9 9 9 10 16 16 16 16 17 12 18 4 5 14 13 15 15 /19 19 19 20 20 20 21 17 17 17 22 18 18 14 14 23 23 24 /19 25 25 26 26 21 21 17 22 22 22 18 27 27 27 24 24 24 /28 28 29 26 30 31 21 32 22 33 33 33 33 34 35 35 35 36 /28 29 29 26 30 31 32 32 32 37 38 39 34 34 40 40 35 36 /41 29 29 42 30 31 31 32 31 37 38 39 34 34 34 40 35 36 /41 43 42 42 30 30 31 31 31 37 38 38 38 40 40 40 36 36 /3 . 6 . . 4 . . 2 . . . . . . . . 1 /. . . 5 . . . . . . . . . . . . . . /. . . . . . . . . 1 . . . . . . . . /. . . . . . . . . . . . . . . . . . /3 . . 2 . . . 4 . . . . . . . . . . /. . . 3 . . . . 4 . . . 2 . . . . . /. . . . 3 6 . . . 4 . . . . . . . . /. 5 . . . . . . . 2 . . 3 . . . . . /. . . . . . . . . . . . . . . . . . /. . . . . . . . . . . . . . . . 5 . /0 0 1 1 0 0 1 0 0 1 1 0 0 0 1 1 0 /1 0 0 0 1 0 0 0 1 0 0 1 0 0 0 0 1 /0 0 1 0 1 0 0 1 0 0 0 0 0 0 0 0 0 /0 1 1 0 0 0 1 0 0 1 1 0 1 0 0 0 1 /1 1 0 0 1 0 0 1 1 0 0 0 0 1 0 1 0 /0 1 0 1 0 1 0 0 1 1 1 0 1 0 0 1 1 /1 0 1 0 0 0 0 1 0 1 1 1 0 0 1 1 0 /0 1 0 0 0 0 1 0 0 0 0 1 1 0 1 0 0 /0 1 1 0 1 1 0 0 1 0 1 0 0 0 0 0 0 /1 1 1 0 0 0 1 1 0 0 1 1 1 1 1 0 1 /0 0 1 0 1 0 1 1 0 1 0 1 0 0 1 0 1 0 /1 1 1 0 0 1 1 1 1 0 0 0 1 0 1 0 0 1 /1 1 0 1 1 0 1 0 0 0 0 0 1 0 1 0 0 1 /1 0 0 0 1 0 0 1 0 1 0 1 0 1 1 0 1 0 /0 0 1 0 0 1 0 0 0 0 0 1 0 0 0 1 0 0 /0 1 0 1 1 0 1 0 1 0 0 0 1 1 0 0 0 1 /1 0 1 0 1 0 1 1 0 1 0 0 0 1 1 0 1 1 /1 1 0 0 1 0 0 0 0 1 0 1 0 0 0 1 1 1 /1 0 0 1 0 0 1 0 1 0 1 0 0 0 0 1 1 1 /2 2 1 1 1 2 0 0 2 0 1 0 0 0 0 0 0 2 /1 1 1 2 1 1 0 0 0 1 2 1 0 0 1 2 0 0 /1 0 1 1 1 1 0 0 1 2 2 2 1 0 1 2 2 0 /1 0 0 1 1 2 1 0 2 1 1 1 1 0 1 2 1 0 /1 1 0 2 1 1 2 0 0 0 2 1 2 1 1 1 0 2 /2 1 0 1 1 1 0 2 0 0 0 0 1 1 2 1 0 0 /1 0 1 1 1 2 1 1 0 0 0 0 0 0 1 0 0 0 /0 1 1 2 1 2 1 1 2 1 2 0 1 0 1 0 0 0 /0 1 1 0 1 1 1 2 0 1 0 1 2 2 2 1 0 0 /0 0 0 1 2 2 1 1 0 2 0 0 1 0 1 0 0 0 /");
		pp.setVal('mode',3);
		pp.setVal('irowake',true);
	},

	getTA : function(){ return _doc.testform.testarea.value;},
	setTA : function(str){ _doc.testform.testarea.value  = str;},
	addTA : function(str){ _doc.testform.testarea.value += (str+"\n");}
};

//---------------------------------------------------------------------------
// ★MenuExecクラス ポップアップウィンドウ内でボタンが押された時の処理内容を記述する
//---------------------------------------------------------------------------

// Menuクラス実行部
MenuExec = function(){
	this.displaymanage = true;
	this.qnumw;	// Ques==51の回転･反転用
	this.qnumh;	// Ques==51の回転･反転用
	this.qnums;	// reduceでisOneNumber時の後処理用

	this.reader;	// FileReaderオブジェクト
	this.enableReadText = false;

	// expand/reduce処理用
	this.insex = {};
	this.insex[k.CELL]   = {1:true};
	this.insex[k.CROSS]  = (k.iscross===1 ? {2:true} : {0:true});
	this.insex[k.BORDER] = {1:true, 2:true};
	this.insex[k.EXCELL] = {1:true};

	// 定数
	this.EXPAND = 0x10;
	this.REDUCE = 0x20;
	this.TURN   = 0x40;
	this.FLIP   = 0x80;
	this.TURNFLIP = this.TURN|this.FLIP;

	this.EXPANDUP = this.EXPAND|k.UP;
	this.EXPANDDN = this.EXPAND|k.DN;
	this.EXPANDLT = this.EXPAND|k.LT;
	this.EXPANDRT = this.EXPAND|k.RT;

	this.REDUCEUP = this.REDUCE|k.UP;
	this.REDUCEDN = this.REDUCE|k.DN;
	this.REDUCELT = this.REDUCE|k.LT;
	this.REDUCERT = this.REDUCE|k.RT;

	this.TURNL = this.TURN|1;
	this.TURNR = this.TURN|2;

	this.FLIPX = this.FLIP|1;
	this.FLIPY = this.FLIP|2;

	this.boardtype = {
		expandup: [this.REDUCEUP, this.EXPANDUP],
		expanddn: [this.REDUCEDN, this.EXPANDDN],
		expandlt: [this.REDUCELT, this.EXPANDLT],
		expandrt: [this.REDUCERT, this.EXPANDRT],
		reduceup: [this.EXPANDUP, this.REDUCEUP],
		reducedn: [this.EXPANDDN, this.REDUCEDN],
		reducelt: [this.EXPANDLT, this.REDUCELT],
		reducert: [this.EXPANDRT, this.REDUCERT],

		turnl: [this.TURNR, this.TURNL],
		turnr: [this.TURNL, this.TURNR],
		flipy: [this.FLIPY, this.FLIPY],
		flipx: [this.FLIPX, this.FLIPX]
	};
};
MenuExec.prototype = {
	//------------------------------------------------------------------------------
	// menu.ex.init() オブジェクトの初期化処理
	//------------------------------------------------------------------------------
	init : function(){
		if(typeof FileReader == 'undefined'){
			this.reader = null;

			if(typeof FileList != 'undefined' &&
			   typeof File.prototype.getAsText != 'undefined')
			{
				this.enableGetText = true;
			}
		}
		else{
			this.reader = new FileReader();
			this.reader.onload = ee.ebinder(this, function(e){
				this.fileonload(ee.getSrcElement(e).result);
			});
		}
	},

	//------------------------------------------------------------------------------
	// menu.ex.modechange() モード変更時の処理を行う
	//------------------------------------------------------------------------------
	modechange : function(num){
		k.editmode = (num==1);
		k.playmode = (num==3);
		kc.prev = null;
		ans.errDisp=true;
		bd.errclear();
		if(kp.haspanel[1] || kp.haspanel[3]){ pp.funcs.keypopup();}
		tc.setAlign();
		pc.paintAll();
	},

	//------------------------------------------------------------------------------
	// menu.ex.newboard()  新規盤面を作成する
	//------------------------------------------------------------------------------
	newboard : function(e){
		if(menu.pop){
			var col,row;
			if(k.puzzleid!=="sudoku"){
				col = (parseInt(_doc.newboard.col.value))|0;
				row = (parseInt(_doc.newboard.row.value))|0;
			}
			else{
				if     (_doc.newboard.size[0].checked){ col=row= 9;}
				else if(_doc.newboard.size[1].checked){ col=row=16;}
				else if(_doc.newboard.size[2].checked){ col=row=25;}
				else if(_doc.newboard.size[3].checked){ col=row= 4;}
			}

			if(col>0 && row>0){ bd.initBoardSize(col,row);}
			menu.popclose();

			base.resetInfo(true);
			base.resize_canvas();				// Canvasを更新する
		}
	},

	//------------------------------------------------------------------------------
	// menu.ex.urlinput()   URLを入力する
	// menu.ex.urloutput()  URLを出力する
	// menu.ex.openurl()    「このURLを開く」を実行する
	//------------------------------------------------------------------------------
	urlinput : function(e){
		if(menu.pop){
			enc.parseURI(_doc.urlinput.ta.value);
			enc.pzlinput();

			tm.reset();
			menu.popclose();
		}
	},
	urloutput : function(e){
		if(menu.pop){
			switch(ee.getSrcElement(e).name){
				case "pzprv3":     _doc.urloutput.ta.value = enc.pzloutput(enc.PZPRV3);  break;
				case "pzprapplet": _doc.urloutput.ta.value = enc.pzloutput(enc.PAPRAPP); break;
				case "kanpen":     _doc.urloutput.ta.value = enc.pzloutput(enc.KANPEN);  break;
				case "pzprv3edit": _doc.urloutput.ta.value = enc.pzloutput(enc.PZPRV3E); break;
				case "heyaapp":    _doc.urloutput.ta.value = enc.pzloutput(enc.HEYAAPP); break;
			}
		}
	},
	openurl : function(e){
		if(menu.pop){
			if(_doc.urloutput.ta.value!==''){
				var win = window.open(_doc.urloutput.ta.value, '', '');
			}
		}
	},

	//------------------------------------------------------------------------------
	// menu.ex.fileopen()   ファイルを開く
	// menu.ex.fileonload() File API用ファイルを開いたイベントの処理
	// menu.ex.filesave()   ファイルを保存する
	//------------------------------------------------------------------------------
	fileopen : function(e){
		if(menu.pop){ menu.popclose();}
		var fileEL = _doc.fileform.filebox;

		if(!!this.reader || this.enableGetText){
			var fitem = fileEL.files[0];
			if(!fitem){ return;}

			if(!!this.reader){ this.reader.readAsText(fitem);}
			else             { this.fileonload(fitem.getAsText(''));}
		}
		else{
			if(!fileEL.value){ return;}
			_doc.fileform.submit();
		}

		_doc.fileform.reset();
		tm.reset();
	},
	fileonload : function(data){
		var farray = data.split(/[\t\r\n]+/);
		var fstr = "";
		for(var i=0;i<farray.length;i++){
			if(farray[i].match(/^http\:\/\//)){ break;}
			fstr += (farray[i]+"/");
		}

		fio.filedecode(fstr);

		_doc.fileform.reset();
		tm.reset();
	},

	filesave : function(ftype){
		var fname = prompt("保存するファイル名を入力して下さい。", k.puzzleid+".txt");
		if(!fname){ return;}
		var prohibit = ['\\', '/', ':', '*', '?', '"', '<', '>', '|'];
		for(var i=0;i<prohibit.length;i++){ if(fname.indexOf(prohibit[i])!=-1){ alert('ファイル名として使用できない文字が含まれています。'); return;} }

		_doc.fileform2.filename.value = fname;

		if     (navigator.platform.indexOf("Win")!==-1){ _doc.fileform2.platform.value = "Win";}
		else if(navigator.platform.indexOf("Mac")!==-1){ _doc.fileform2.platform.value = "Mac";}
		else                                           { _doc.fileform2.platform.value = "Others";}

		_doc.fileform2.ques.value   = fio.fileencode(ftype);
		_doc.fileform2.urlstr.value = fio.urlstr;
		_doc.fileform2.operation.value = 'save';

		_doc.fileform2.submit();
	},

	//------------------------------------------------------------------------------
	// menu.ex.imagesave() 画像を保存する
	//------------------------------------------------------------------------------
	imagesave : function(isDL){
		// 現在の設定を保存する
		var temp_flag   = pc.fillTextPrecisely;
		var temp_margin = k.bdmargin;
		var temp_cursor = pp.getVal('cursor');

		try{
			// 設定値・変数をcanvas用のものに変更
			pc.fillTextPrecisely = true;
			k.bdmargin = k.bdmargin_image;
			pp.setValOnly('cursor', false);
			g = ee('divques_sub').el.getContext("2d");

			// canvas要素の設定を適用して、再描画
			base.resize_canvas();

			// canvasの描画内容をDataURLとして取得する
			var url = g.canvas.toDataURL();

			if(isDL){
				_doc.fileform2.filename.value  = k.puzzleid+'.gif';
				_doc.fileform2.urlstr.value    = url.replace('data:image/png;base64,', '');
				_doc.fileform2.operation.value = 'imagesave';
				_doc.fileform2.submit();
			}
			else{
				window.open(url, '', '');
			}
		}
		catch(e){
			menu.alertStr('画像の出力に失敗しました..','Fail to Output the Image..');
		}

		// 設定値・変数を元に戻す
		pc.fillTextPrecisely = temp_flag;
		k.bdmargin = temp_margin;
		pp.setValOnly('cursor', temp_cursor);
		base.initCanvas();

		// その他の設定を元に戻して、再描画
		base.resize_canvas();
	},

	//------------------------------------------------------------------------------
	// menu.ex.dispsize()  Canvasでのマス目の表示サイズを変更する
	//------------------------------------------------------------------------------
	dispsize : function(e){
		if(menu.pop){
			var csize = parseInt(_doc.dispsize.cs.value);
			if(csize>0){ k.cellsize = (csize|0);}

			menu.popclose();
			base.resize_canvas();	// Canvasを更新する
		}
	},

	//---------------------------------------------------------------------------
	// menu.ex.irowakeRemake() 「色分けしなおす」ボタンを押した時に色分けしなおす
	//---------------------------------------------------------------------------
	irowakeRemake : function(){
		line.newIrowake();
		if(pp.getVal('irowake')){ pc.paintAll();}
	},

	//------------------------------------------------------------------------------
	// menu.ex.dispman()    管理領域を隠す/表示するが押された時に動作する
	// menu.ex.dispmanstr() 管理領域を隠す/表示するにどの文字列を表示するか
	//------------------------------------------------------------------------------
	dispman : function(e){
		var idlist = ['expression','usepanel','checkpanel'];
		var seplist = k.EDITOR ? ['separator1'] : ['separator1','separator2'];

		if(this.displaymanage){
			for(var i=0;i<idlist.length;i++)        { ee(idlist[i])  .el.style.display = 'none';}
			for(var i=0;i<seplist.length;i++)       { ee(seplist[i]) .el.style.display = 'none';}
			if(k.irowake!=0 && pp.getVal('irowake')){ ee('btncolor2').el.style.display = 'inline';}
			ee('menuboard').el.style.paddingBottom = '0pt';
		}
		else{
			for(var i=0;i<idlist.length;i++)        { ee(idlist[i])  .el.style.display = 'block';}
			for(var i=0;i<seplist.length;i++)       { ee(seplist[i]) .el.style.display = 'block';}
			if(k.irowake!=0 && pp.getVal('irowake')){ ee("btncolor2").el.style.display = 'none';}
			ee('menuboard').el.style.paddingBottom = '8pt';
		}
		this.displaymanage = !this.displaymanage;
		this.dispmanstr();

		base.resize_canvas();	// canvasの左上座標等を更新して再描画
	},
	dispmanstr : function(){
		if(!this.displaymanage){ ee('ms_manarea').el.innerHTML = menu.selectStr("管理領域を表示","Show management area");}
		else                   { ee('ms_manarea').el.innerHTML = menu.selectStr("管理領域を隠す","Hide management area");}
	},

	//------------------------------------------------------------------------------
	// menu.ex.popupadjust()  "盤面の調整""回転・反転"でボタンが押された時に
	//                        対応する関数へジャンプする
	//------------------------------------------------------------------------------
	popupadjust : function(e){
		if(menu.pop){
			um.newOperation(true);

			var name = ee.getSrcElement(e).name;
			if(name.indexOf("reduce")===0){
				if(name==="reduceup"||name==="reducedn"){
					if(k.qrows<=1){ return;}
				}
				else if(name==="reducelt"||name==="reducert"){
					if(k.qcols<=1 && (k.puzzleid!=="tawa" || bd.lap!==3)){ return;}
				}
			}

			var d = {x1:0, y1:0, x2:2*k.qcols, y2:2*k.qrows};
			if (name.match(/(expand|reduce)/)){ this.expandreduce(this.boardtype[name][1],d);}
			else if(name.match(/(turn|flip)/)){ this.turnflip    (this.boardtype[name][1],d);}

			// reduceはここ必須
			um.addOpe(k.BOARD, name, 0, this.boardtype[name][0], this.boardtype[name][1]);

			bd.setminmax();
			if(!um.undoExec){ base.resetInfo(false);}
			base.resize_canvas();				// Canvasを更新する
		}
	},

	//------------------------------------------------------------------------------
	// menu.ex.expandreduce() 盤面の拡大・縮小を実行する
	// menu.ex.expandGroup()  オブジェクトの追加を行う
	// menu.ex.reduceGroup()  オブジェクトの消去を行う
	//------------------------------------------------------------------------------
	expandreduce : function(key,d){
		base.disableInfo();
		this.adjustBoardData(key,d);

		if(key & this.EXPAND){
			if     (key===this.EXPANDUP||key===this.EXPANDDN){ k.qrows++;}
			else if(key===this.EXPANDLT||key===this.EXPANDRT){ k.qcols++;}

							{ this.expandGroup(k.CELL,   key);}
			if(!!k.iscross) { this.expandGroup(k.CROSS,  key);}
			if(!!k.isborder){ this.expandGroup(k.BORDER, key);}
			if(!!k.isexcell){ this.expandGroup(k.EXCELL, key);}
		}
		else if(key & this.REDUCE){
							{ this.reduceGroup(k.CELL,   key);}
			if(!!k.iscross) { this.reduceGroup(k.CROSS,  key);}
			if(!!k.isborder){ this.reduceGroup(k.BORDER, key);}
			if(!!k.isexcell){ this.reduceGroup(k.EXCELL, key);}

			if     (key===this.REDUCEUP||key===this.REDUCEDN){ k.qrows--;}
			else if(key===this.REDUCELT||key===this.REDUCERT){ k.qcols--;}
		}
		bd.setposAll();

		this.adjustBoardData2(key,d);
		base.enableInfo();
	},
	expandGroup : function(type,key){
		var margin = bd.initGroup(type, k.qcols, k.qrows);
		var group = bd.getGroup(type);
		for(var i=group.length-1;i>=0;i--){
			if(!!this.insex[type][this.distObj(type,i,key)]){
				group[i] = bd.newObject(type);
				group[i].allclear(i,false);
				margin--;
			}
			else if(margin>0){ group[i] = group[i-margin];}
		}

		if(type===k.BORDER){ this.expandborder(key);}
	},
	reduceGroup : function(type,key){
		if(type===k.BORDER){ this.reduceborder(key);}

		var margin=0, group = bd.getGroup(type), isrec=(!um.undoExec && !um.redoExec);
		if(isrec){ um.forceRecord = true;}
		for(var i=0;i<group.length;i++){
			if(!!this.insex[type][this.distObj(type,i,key)]){
				group[i].allclear(i,isrec);
				margin++;
			}
			else if(margin>0){ group[i-margin] = group[i];}
		}
		for(var i=0;i<margin;i++){ group.pop();}
		if(isrec){ um.forceRecord = false;}
	},

	//------------------------------------------------------------------------------
	// menu.ex.turnflip()      回転・反転処理を実行する
	// menu.ex.turnflipGroup() turnflip()から内部的に呼ばれる回転実行部
	//------------------------------------------------------------------------------
	turnflip : function(key,d){
		base.disableInfo();
		this.adjustBoardData(key,d);

		if(key & this.TURN){
			var tmp = k.qcols; k.qcols = k.qrows; k.qrows = tmp;
			bd.setposAll();
			d = {x1:0, y1:0, x2:2*k.qcols, y2:2*k.qrows};
		}

						  { this.turnflipGroup(k.CELL,   key, d);}
		if(!!k.iscross)   { this.turnflipGroup(k.CROSS,  key, d);}
		if(!!k.isborder)  { this.turnflipGroup(k.BORDER, key, d);}
		if(k.isexcell===2){ this.turnflipGroup(k.EXCELL, key, d);}
		else if(k.isexcell===1 && (key & this.FLIP)){
			var d2 = {x1:d.x1, y1:d.y1, x2:d.x2, y2:d.y2};
			if     (key===this.FLIPY){ d2.x1 = d2.x2 = -1;}
			else if(key===this.FLIPX){ d2.y1 = d2.y2 = -1;}
			this.turnflipGroup(k.EXCELL, key, d2);
		}
		bd.setposAll();

		this.adjustBoardData2(key,d);
		base.enableInfo();
	},
	turnflipGroup : function(type,key,d){
		var ch=[], idlist=bd.objectinside(type,d.x1,d.y1,d.x2,d.y2);
		for(var i=0;i<idlist.length;i++){ ch[idlist[i]]=false;}

		var group = bd.getGroup(type);
		var xx=(d.x1+d.x2), yy=(d.y1+d.y2);
		for(var source=0;source<group.length;source++){
			if(ch[source]!==false){ continue;}

			var tmp = group[source], target = source;
			while(ch[target]===false){
				ch[target]=true;
				// nextになるものがtargetに移動してくる、、という考えかた。
				// ここでは移動前のIDを取得しています
				switch(key){
					case this.FLIPY: next = bd.idnum(type, group[target].bx, yy-group[target].by); break;
					case this.FLIPX: next = bd.idnum(type, xx-group[target].bx, group[target].by); break;
					case this.TURNR: next = bd.idnum(type, group[target].by, xx-group[target].bx, k.qrows, k.qcols); break;
					case this.TURNL: next = bd.idnum(type, yy-group[target].by, group[target].bx, k.qrows, k.qcols); break;
				}

				if(ch[next]===false){
					group[target] = group[next];
					target = next;
				}
				else{
					group[target] = tmp;
					break;
				}
			}
		}
	},

	//---------------------------------------------------------------------------
	// menu.ex.distObj()      上下左右いずれかの外枠との距離を求める
	//---------------------------------------------------------------------------
	distObj : function(type,id,key){
		var obj = bd.getObject(type, id);
		if(!obj){ return -1;}

		key &= 0x0F;
		if     (key===k.UP){ return obj.by;}
		else if(key===k.DN){ return 2*k.qrows-obj.by;}
		else if(key===k.LT){ return obj.bx;}
		else if(key===k.RT){ return 2*k.qcols-obj.bx;}
		return -1;
	},

	//---------------------------------------------------------------------------
	// menu.ex.expandborder() 盤面の拡大時、境界線を伸ばす
	// menu.ex.reduceborder() 盤面の縮小時、線を移動する
	// menu.ex.copyBorder()   (expand/reduceBorder用) 指定したデータをコピーする
	// menu.ex.innerBorder()  (expand/reduceBorder用) ひとつ内側に入ったborderのidを返す
	// menu.ex.outerBorder()  (expand/reduceBorder用) ひとつ外側に行ったborderのidを返す
	//---------------------------------------------------------------------------
	expandborder : function(key){
		// borderAsLineじゃないUndo時は、後でオブジェクトを代入するので下の処理はパス
		if(k.isborderAsLine || !um.undoExec){
			// 直前のexpandGroupで、bx,byプロパティが不定なままなので設定する
			bd.setposBorders();

			var dist = (k.isborderAsLine?2:1);
			for(var id=0;id<bd.bdmax;id++){
				if(this.distObj(k.BORDER,id,key)!==dist){ continue;}

				var source = (k.isborderAsLine ? this.outerBorder(id,key) : this.innerBorder(id,key));
				this.copyBorder(id,source);
				if(k.isborderAsLine){ bd.border[source].allclear(source,false);}
			}
		}
	},
	reduceborder : function(key){
		if(k.isborderAsLine){
			for(var id=0;id<bd.bdmax;id++){
				if(this.distObj(k.BORDER,id,key)!==0){ continue;}

				var source = this.innerBorder(id,key);
				this.copyBorder(id,source);
			}
		}
	},

	copyBorder : function(id1,id2){
		bd.border[id1].ques  = bd.border[id2].ques;
		bd.border[id1].qans  = bd.border[id2].qans;
		if(k.isborderAsLine){
			bd.border[id1].line  = bd.border[id2].line;
			bd.border[id1].qsub  = bd.border[id2].qsub;
			bd.border[id1].color = bd.border[id2].color;
		}
	},
	innerBorder : function(id,key){
		var bx=bd.border[id].bx, by=bd.border[id].by;
		key &= 0x0F;
		if     (key===k.UP){ return bd.bnum(bx, by+2);}
		else if(key===k.DN){ return bd.bnum(bx, by-2);}
		else if(key===k.LT){ return bd.bnum(bx+2, by);}
		else if(key===k.RT){ return bd.bnum(bx-2, by);}
		return null;
	},
	outerBorder : function(id,key){
		var bx=bd.border[id].bx, by=bd.border[id].by;
		key &= 0x0F;
		if     (key===k.UP){ return bd.bnum(bx, by-2);}
		else if(key===k.DN){ return bd.bnum(bx, by+2);}
		else if(key===k.LT){ return bd.bnum(bx-2, by);}
		else if(key===k.RT){ return bd.bnum(bx+2, by);}
		return null;
	},

	//------------------------------------------------------------------------------
	// menu.ex.adjustBoardData()  回転・反転開始前に各セルの調節を行う(共通処理)
	// menu.ex.adjustBoardData2() 回転・反転終了後に各セルの調節を行う(共通処理)
	// 
	// menu.ex.adjustSpecial()    回転・反転・盤面調節開始前に各セルの調節を行う(各パズルのオーバーライド用)
	// menu.ex.adjustSpecial2()   回転・反転・盤面調節終了後に各セルの調節を行う(各パズルのオーバーライド用)
	// 
	// menu.ex.adjustQues51_1()   [＼]セルの調整(adjustSpecial関数に代入する用)
	// menu.ex.adjustQues51_2()   [＼]セルの調整(adjustSpecial2関数に代入する用)
	//------------------------------------------------------------------------------
	adjustBoardData : function(key,d){
		this.adjustSpecial.call(this,key,d);

		if(key & this.TURNFLIP){
			var tques={};
			switch(key){
				case this.FLIPY: tques={2:5,3:4,4:3,5:2,14:17,15:16,16:15,17:14}; break;
				case this.FLIPX: tques={2:3,3:2,4:5,5:4,14:15,15:14,16:17,17:16}; break;
				case this.TURNR: tques={2:5,3:2,4:3,5:4,12:13,13:12,14:17,15:14,16:15,17:16,21:22,22:21}; break;
				case this.TURNL: tques={2:3,3:4,4:5,5:2,12:13,13:12,14:15,15:16,16:17,17:14,21:22,22:21}; break;
			}

			var tdir={};
			switch(key){
				case this.FLIPY: tdir={1:2,2:1}; break;			// 上下反転
				case this.FLIPX: tdir={3:4,4:3}; break;			// 左右反転
				case this.TURNR: tdir={1:4,2:3,3:1,4:2}; break;	// 右90°回転
				case this.TURNL: tdir={1:3,2:4,3:2,4:1}; break;	// 左90°回転
			}

			var clist = bd.cellinside(d.x1,d.y1,d.x2,d.y2);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				var val=tques[bd.QuC(c)]; if(!!val){ bd.sQuC(c,val);}
				if(k.isexcell!==1){
					var val=tdir[bd.DiC(c)]; if(!!val){ bd.sDiC(c,val);}
				}
			}
		}

		if((key & this.REDUCE) && k.roomNumber){
			this.qnums = [];
			for(var i=0;i<bd.cell.length;i++){
				if(!!this.insex[k.CELL][this.distObj(k.CELL,i,key)] && bd.cell[i].qnum!==-1){
					this.qnums.push({ areaid:area.getRoomID(i), val:bd.cell[i].qnum});
				}
			}
		}
	},
	adjustBoardData2 : function(key,d){
		if((key & this.REDUCE) && k.roomNumber){
			area.resetArea();
			for(var i=0;i<this.qnums.length;i++){
				var c = area.getTopOfRoom(this.qnums[i].areaid);
				bd.cell[c].qnum = this.qnums[i].val;
			}
		}

		this.adjustSpecial2.call(this,key,d);
	},
	adjustSpecial  : function(key,d){ },
	adjustSpecial2 : function(key,d){ },

	adjustQues51_1 : function(key,d){
		var bx1=(d.x1|1), by1=(d.y1|1);
		this.qnumw = [];
		this.qnumh = [];

		for(var by=by1;by<=d.y2;by+=2){
			this.qnumw[by] = [bd.QnE(bd.exnum(-1,by))];
			for(var bx=bx1;bx<=d.x2;bx+=2){
				var cc = bd.cnum(bx,by);
				if(cc!==null && bd.QuC(cc)===51){ this.qnumw[by].push(bd.QnC(cc));}
			}
		}
		for(var bx=bx1;bx<=d.x2;bx+=2){
			this.qnumh[bx] = [bd.DiE(bd.exnum(bx,-1))];
			for(var by=by1;by<=d.y2;by+=2){
				var cc = bd.cnum(bx,by);
				if(cc!==null && bd.QuC(cc)===51){ this.qnumh[bx].push(bd.DiC(cc));}
			}
		}
	},
	adjustQues51_2 : function(key,d){
		var xx=(d.x1+d.x2), yy=(d.y1+d.y2), bx1=(d.x1|1), by1=(d.y1|1), idx;

		switch(key){
		case this.FLIPY: // 上下反転
			for(var bx=bx1;bx<=d.x2;bx+=2){
				idx = 1; this.qnumh[bx] = this.qnumh[bx].reverse();
				bd.sDiE(bd.exnum(bx,-1), this.qnumh[bx][0]);
				for(var by=by1;by<=d.y2;by+=2){
					var cc = bd.cnum(bx,by);
					if(cc!==null && bd.QuC(cc)===51){ bd.sDiC(cc, this.qnumh[bx][idx]); idx++;}
				}
			}
			break;

		case this.FLIPX: // 左右反転
			for(var by=by1;by<=d.y2;by+=2){
				idx = 1; this.qnumw[by] = this.qnumw[by].reverse();
				bd.sQnE(bd.exnum(-1,by), this.qnumw[by][0]);
				for(var bx=bx1;bx<=d.x2;bx+=2){
					var cc = bd.cnum(bx,by);
					if(cc!==null && bd.QuC(cc)===51){ bd.sQnC(cc, this.qnumw[by][idx]); idx++;}
				}
			}
			break;

		case this.TURNR: // 右90°反転
			for(var by=by1;by<=d.y2;by+=2){
				idx = 1; this.qnumh[by] = this.qnumh[by].reverse();
				bd.sQnE(bd.exnum(-1,by), this.qnumh[by][0]);
				for(var bx=bx1;bx<=d.x2;bx+=2){
					var cc = bd.cnum(bx,by);
					if(cc!==null && bd.QuC(cc)===51){ bd.sQnC(cc, this.qnumh[by][idx]); idx++;}
				}
			}
			for(var bx=bx1;bx<=d.x2;bx+=2){
				idx = 1;
				bd.sDiE(bd.exnum(bx,-1), this.qnumw[xx-bx][0]);
				for(var by=by1;by<=d.y2;by+=2){
					var cc = bd.cnum(bx,by);
					if(cc!==null && bd.QuC(cc)===51){ bd.sDiC(cc, this.qnumw[xx-bx][idx]); idx++;}
				}
			}
			break;

		case this.TURNL: // 左90°反転
			for(var by=by1;by<=d.y2;by+=2){
				idx = 1;
				bd.sQnE(bd.exnum(-1,by), this.qnumh[yy-by][0]);
				for(var bx=bx1;bx<=d.x2;bx+=2){
					var cc = bd.cnum(bx,by);
					if(cc!==null && bd.QuC(cc)===51){ bd.sQnC(cc, this.qnumh[yy-by][idx]); idx++;}
				}
			}
			for(var bx=bx1;bx<=d.x2;bx+=2){
				idx = 1; this.qnumw[bx] = this.qnumw[bx].reverse();
				bd.sDiE(bd.exnum(bx,-1), this.qnumw[bx][0]);
				for(var by=by1;by<=d.y2;by+=2){
					var cc = bd.cnum(bx,by);
					if(cc!==null && bd.QuC(cc)===51){ bd.sDiC(cc, this.qnumw[bx][idx]); idx++;}
				}
			}
			break;
		}
	},

	//------------------------------------------------------------------------------
	// menu.ex.ACconfirm()  「回答消去」ボタンを押したときの処理
	// menu.ex.ASconfirm()  「補助消去」ボタンを押したときの処理
	//------------------------------------------------------------------------------
	ACconfirm : function(){
		if(menu.confirmStr("回答を消去しますか？","Do you want to erase the Answer?")){
			um.newOperation(true);

			bd.ansclear();
			base.resetInfo(false);
			pc.paintAll();
		}
	},
	ASconfirm : function(){
		if(menu.confirmStr("補助記号を消去しますか？","Do you want to erase the auxiliary marks?")){
			um.newOperation(true);

			bd.subclear();
			pc.paintAll();
		}
	}
};

//---------------------------------------------------------------------------
// ★AreaInfoクラス 主に色分けの情報を管理する
//   id : null   どの部屋にも属さないセル(黒マス情報で白マスのセル、等)
//         0     どの部屋に属させるかの処理中
//         1以上 その番号の部屋に属する
//---------------------------------------------------------------------------
AreaInfo = function(){
	this.max  = 0;	// 最大の部屋番号(1～maxまで存在するよう構成してください)
	this.id   = [];	// 各セル/線などが属する部屋番号を保持する
	this.room = [];	// 各部屋のidlist等の情報を保持する(info.room[id].idlistで取得)
};

//---------------------------------------------------------------------------
// ★LineManagerクラス 主に色分けの情報を管理する
//---------------------------------------------------------------------------
// LineManagerクラスの定義
LineManager = function(){
	this.lcnt    = [];
	this.ltotal  = [];

	this.disableLine = (!k.isCenterLine && !k.isborderAsLine);
	this.data    = {};	// 線id情報

	this.typeA = 'A';
	this.typeB = 'B';
	this.typeC = 'C';

	this.init();
};
LineManager.prototype = {

	//---------------------------------------------------------------------------
	// line.init()        変数の起動時の初期化を行う
	// line.resetLcnts()  lcnts等の変数の初期化を行う
	// line.newIrowake()  線の情報が再構築された際、線に色をつける
	// line.lcntCell()    セルに存在する線の本数を返す
	//---------------------------------------------------------------------------
	init : function(){
		if(this.disableLine){ return;}

		// lcnt, ltotal変数(配列)初期化
		if(k.isCenterLine){
			for(var c=0;c<bd.cellmax;c++){ this.lcnt[c]=0;}
			this.ltotal=[(k.qcols*k.qrows), 0, 0, 0, 0];
		}
		else{
			for(var c=0,len=(k.qcols+1)*(k.qrows+1);c<len;c++){ this.lcnt[c]=0;}
			this.ltotal=[((k.qcols+1)*(k.qrows+1)), 0, 0, 0, 0];
		}

		// その他の変数初期化
		this.data = {max:0,id:[]};
		for(var id=0;id<bd.bdmax;id++){ this.data.id[id] = null;}
	},

	resetLcnts : function(){
		if(this.disableLine){ return;}

		this.init();
		var bid = [];
		for(var id=0;id<bd.bdmax;id++){
			if(bd.isLine(id)){
				this.data.id[id] = 0;
				bid.push(id);

				var cc1, cc2;
				if(k.isCenterLine){ cc1 = bd.border[id].cellcc[0];  cc2 = bd.border[id].cellcc[1]; }
				else              { cc1 = bd.border[id].crosscc[0]; cc2 = bd.border[id].crosscc[1];}

				if(cc1!==null){ this.ltotal[this.lcnt[cc1]]--; this.lcnt[cc1]++; this.ltotal[this.lcnt[cc1]]++;}
				if(cc2!==null){ this.ltotal[this.lcnt[cc2]]--; this.lcnt[cc2]++; this.ltotal[this.lcnt[cc2]]++;}
			}
			else{
				this.data.id[id] = null;
			}
		}
		this.lc0main(bid);
		if(k.irowake!==0){ this.newIrowake();}
	},
	newIrowake : function(){
		for(var i=1;i<=this.data.max;i++){
			var idlist = this.data[i].idlist;
			if(idlist.length>0){
				var newColor = pc.getNewLineColor();
				for(var n=0;n<idlist.length;n++){
					bd.border[idlist[n]].color = newColor;
				}
			}
		}
	},
	lcntCell  : function(cc){ return (!!this.lcnt[cc]?this.lcnt[cc]:0);},

	//---------------------------------------------------------------------------
	// line.gettype()    線が引かれた/消された時に、typeA/typeB/typeCのいずれか判定する
	// line.isTpos()     pieceが、指定されたcc内でidの反対側にあるか判定する
	// line.iscrossing() 指定されたセル/交点で線が交差する場合にtrueを返す
	//---------------------------------------------------------------------------
	gettype : function(cc,id,isset){
		var erase = (isset?0:1);
		if(cc===null){
			return this.typeA;
		}
		else if(!this.iscrossing(cc)){
			return ((this.lcnt[cc]===(1-erase))?this.typeA:this.typeB);
		}
		else{
			if     (this.lcnt[cc]===(1-erase) || (this.lcnt[cc]===(3-erase) && this.isTpos(cc,id))){ return this.typeA;}
			else if(this.lcnt[cc]===(2-erase) ||  this.lcnt[cc]===(4-erase)){ return this.typeB;}
			return this.typeC;
		}
	},
	isTpos : function(cc,id){
		//   │ ←id                    
		// ━┷━                       
		//   ・ ←この場所に線があるか？
		if(k.isCenterLine){
			return !bd.isLine(bd.bnum( 2*bd.cell[cc].bx-bd.border[id].bx, 2*bd.cell[cc].by-bd.border[id].by ));
		}
		else{
			return !bd.isLine(bd.bnum( 4*(cc%(k.qcols+1))-bd.border[id].bx, 4*((cc/(k.qcols+1))|0)-bd.border[id].by ));
		}
	},
	iscrossing : function(cc){ return k.isLineCross;},

	//---------------------------------------------------------------------------
	// line.setLine()         線が引かれたり消された時に、lcnt変数や線の情報を生成しなおす
	// line.setLineInfo()     線が引かれた時に、線の情報を生成しなおす
	// line.removeLineInfo()  線が消された時に、線の情報を生成しなおす
	// line.combineLineInfo() 線が引かれた時に、周りの線が全てくっついて1つの線が
	//                        できる場合の線idの再設定を行う
	// line.remakeLineInfo()  線が引かれたり消された時、新たに2つ以上の線ができる
	//                        可能性がある場合の線idの再設定を行う
	//---------------------------------------------------------------------------
	setLine : function(id, isset){
		if(this.disableLine || !base.isenableInfo()){ return;}
		if(isset===(this.data.id[id]!==null)){ return;}

		var cc1, cc2;
		if(k.isCenterLine){ cc1 = bd.border[id].cellcc[0];  cc2 = bd.border[id].cellcc[1]; }
		else              { cc1 = bd.border[id].crosscc[0]; cc2 = bd.border[id].crosscc[1];}

		if(isset){
			if(cc1!==null){ this.ltotal[this.lcnt[cc1]]--; this.lcnt[cc1]++; this.ltotal[this.lcnt[cc1]]++;}
			if(cc2!==null){ this.ltotal[this.lcnt[cc2]]--; this.lcnt[cc2]++; this.ltotal[this.lcnt[cc2]]++;}
		}
		else{
			if(cc1!==null){ this.ltotal[this.lcnt[cc1]]--; this.lcnt[cc1]--; this.ltotal[this.lcnt[cc1]]++;}
			if(cc2!==null){ this.ltotal[this.lcnt[cc2]]--; this.lcnt[cc2]--; this.ltotal[this.lcnt[cc2]]++;}
		}

		//---------------------------------------------------------------------------
		// (A)くっつきなし                        (B)単純くっつき
		//     ・      │    - 交差ありでlcnt=1     ┃      │    - 交差なしでlcnt=2～4
		//   ・ ━   ・┝━  - 交差なしでlcnt=1   ・┗━  ━┿━  - 交差ありでlcnt=2or4
		//     ・      │    - 交差ありでlcnt=3     ・      │                         
		// 
		// (C)複雑くっつき
		//    ┃        │   - 交差ありでlcnt=3(このパターン)
		//  ━┛・ => ━┷━   既存の線情報が別々になってしまう
		//    ・        ・   
		//---------------------------------------------------------------------------
		var type1 = this.gettype(cc1,id,isset), type2 = this.gettype(cc2,id,isset);
		if(isset){
			// (A)+(A)の場合 -> 新しい線idを割り当てる
			if(type1===this.typeA && type2===this.typeA){
				this.data.max++;
				this.data[this.data.max] = {idlist:[id]};
				this.data.id[id] = this.data.max;
				bd.border[id].color = pc.getNewLineColor();
			}
			// (A)+(B)の場合 -> 既存の線にくっつける
			else if((type1===this.typeA && type2===this.typeB) || (type1===this.typeB && type2===this.typeA)){
				var bid = (this.getbid(id,1))[0];
				this.data[this.data.id[bid]].idlist.push(id);
				this.data.id[id] = this.data.id[bid];
				bd.border[id].color = bd.border[bid].color;
			}
			// (B)+(B)の場合 -> くっついた線で、大きい方の線idに統一する
			else if(type1===this.typeB && type2===this.typeB){
				this.combineLineInfo(id);
			}
			// その他の場合
			else{
				this.remakeLineInfo(id,1);
			}
		}
		else{
			// (A)+(A)の場合 -> 線id自体を消滅させる
			if(type1===this.typeA && type2===this.typeA){
				this.data[this.data.id[id]] = {idlist:[]};
				this.data.id[id] = null;
				bd.border[id].color = "";
			}
			// (A)+(B)の場合 -> 既存の線から取り除く
			else if((type1===this.typeA && type2===this.typeB) || (type1===this.typeB && type2===this.typeA)){
				var ownid = this.data.id[id], idlist = this.data[ownid].idlist;
				for(var i=0;i<idlist.length;i++){ if(idlist[i]===id){ idlist.splice(i,1); break;} }
				this.data.id[id] = null;
				bd.border[id].color = "";
			}
			// (B)+(B)の場合、その他の場合 -> 分かれた線にそれぞれ新しい線idをふる
			else{
				this.remakeLineInfo(id,0);
				bd.border[id].color = "";
			}
		}
	},

	combineLineInfo : function(id){
		var dataid = this.data.id;

		// この関数の突入条件より、bid.lengthは必ず2になる
		// →ならなかった... くっつく線のID数は必ず2以下になる
		var bid = this.getbid(id,1);
		var did = [dataid[bid[0]], null];
		for(var i=0;i<bid.length;i++){
			if(did[0]!=dataid[bid[i]]){
				did[1]=dataid[bid[i]];
				break;
			}
		}

		var newColor = bd.border[bid[0]].color;
		// くっつく線のID数が2種類の場合
		if(did[1] != null){
			// どっちが長いの？
			var longid = did[0], shortid = did[1];
			if(this.data[did[0]].idlist.length < this.data[did[1]].idlist.length){
				longid=did[1]; shortid=did[0];
				newColor = bd.border[bid[1]].color;
			}

			// つながった線は全て同じIDにする
			var longidlist  = this.data[longid].idlist;
			var shortidlist = this.data[shortid].idlist;
			for(var n=0,len=shortidlist.length;n<len;n++){
				longidlist.push(shortidlist[n]);
				dataid[shortidlist[n]] = longid;
			}
			this.data[shortid].idlist = [];

			longidlist.push(id);
			dataid[id] = longid;

			// 色を同じにする
			for(var i=0,len=longidlist.length;i<len;i++){
				bd.border[longidlist[i]].color = newColor;
			}
			this.repaintLine(longidlist, id);
		}
		// くっつく線のID数が1種類の場合 => 既存の線にくっつける
		else{
			this.data[did[0]].idlist.push(id);
			dataid[id] = did[0];
			bd.border[id].color = newColor;
		}
	},
	remakeLineInfo : function(id,val){
		var dataid = this.data.id;
		var oldmax = this.data.max;	// いままでのthis.data.max値

		// つなげた線のIDを一旦0にして、max+1, max+2, ...を割り振りしなおす関数

		// つながった線の線情報を一旦0にする
		var bid = this.getbid(id,val);
		var oldlongid = dataid[bid[0]], longColor = bd.border[bid[0]].color;
		for(var i=0,len=bid.length;i<len;i++){
			var current = dataid[bid[i]];
			if(current<=0){ continue;}
			var idlist = this.data[current].idlist;
			if(this.data[oldlongid].idlist.length < idlist.length){
				oldlongid = current;
				longColor = bd.border[bid[i]].color;
			}
			for(var n=0,len2=idlist.length;n<len2;n++){ dataid[idlist[n]] = 0;}
			this.data[current] = {idlist:[]};
		}

		// 自分のIDの情報を変更する
		if(val>0){ dataid[id] =  0; bid.unshift(id);}
		else     { dataid[id] = null;}

		// 新しいidを設定する
		this.lc0main(bid);

		// できた中でもっとも長い線に、従来最も長かった線の色を継承する
		// それ以外の線には新しい色を付加する

		// できた線の中でもっとも長いものを取得する
		var newlongid = oldmax+1;
		for(var current=oldmax+1;current<=this.data.max;current++){
			var idlist = this.data[current].idlist;
			if(this.data[newlongid].idlist.length<idlist.length){ newlongid = current;}
		}

		// 新しい色の設定
		for(var current=oldmax+1;current<=this.data.max;current++){
			var newColor = (current===newlongid ? longColor : pc.getNewLineColor());
			var idlist = this.data[current].idlist;
			for(var n=0,len=idlist.length;n<len;n++){ bd.border[idlist[n]].color = newColor;}
			this.repaintLine(idlist, id);
		}
	},

	//---------------------------------------------------------------------------
	// line.repaintLine()  ひとつながりの線を再描画する
	// line.repaintParts() repaintLine()関数で、さらに上から描画しなおしたい処理を書く
	//                     canvas描画時のみ呼ばれます(他は描画しなおす必要なし)
	// line.getClistFromIdlist() idlistの線が重なるセルのリストを取得する
	// line.getXlistFromIdlist() idlistの線が重なる交点のリストを取得する
	//---------------------------------------------------------------------------
	repaintLine : function(idlist, id){
		if(!pp.getVal('irowake')){ return;}
		for(var i=0,len=idlist.length;i<len;i++){
			if(id===idlist[i]){ continue;}
			pc.drawLine1(idlist[i]);
		}
		if(g.use.canvas){ this.repaintParts(idlist);}
	},
	repaintParts : function(idlist){ }, // オーバーライド用

	getClistFromIdlist : function(idlist){
		var cdata=[], clist=[];
		for(var c=0;c<bd.cellmax;c++){ cdata[c]=false;}
		for(var i=0;i<idlist.length;i++){
			cdata[bd.border[idlist[i]].cellcc[0]] = true;
			cdata[bd.border[idlist[i]].cellcc[1]] = true;
		}
		for(var c=0;c<bd.cellmax;c++){ if(cdata[c]){ clist.push(c);} }
		return clist;
	},
	getXlistFromIdlist : function(idlist){
		var cdata=[], xlist=[], crossmax=(k.qcols+1)*(k.qrows+1);
		for(var c=0;c<crossmax;c++){ cdata[c]=false;}
		for(var i=0;i<idlist.length;i++){
			cdata[bd.border[idlist[i]].crosscc[0]] = true;
			cdata[bd.border[idlist[i]].crosscc[1]] = true;
		}
		for(var c=0;c<crossmax;c++){ if(cdata[c]){ xlist.push(c);} }
		return xlist;
	},

	//---------------------------------------------------------------------------
	// line.getbid()  指定したpieceに繋がる、最大6箇所に引かれている線を全て取得する
	// line.lc0main() 指定されたpieceのリストに対して、lc0関数を呼び出す
	// line.lc0()     ひとつながりの線にlineidを設定する(再帰呼び出し用関数)
	//---------------------------------------------------------------------------
	getbid : function(id,val){
		var erase=(val>0?0:1), bx=bd.border[id].bx, by=bd.border[id].by;
		var dx=((k.isCenterLine^(bx%2===0))?2:0), dy=(2-dx);	// (dx,dy) = (2,0) or (0,2)

		var cc1 = bd.border[id].cellcc[0], cc2 = bd.border[id].cellcc[1];
		if(!k.isCenterLine){ cc1 = bd.border[id].crosscc[0]; cc2 = bd.border[id].crosscc[1];}
		// 交差ありでk.isborderAsLine==true(->k.isCenterLine==false)のパズルは作ってないはず
		// 今までのオモパで該当するのもスリザーボックスくらいだったような、、

		var lines=[];
		if(cc1!==null){
			var iscrossing=this.iscrossing(cc1), lcnt=this.lcnt[cc1];
			if(iscrossing && lcnt>=(4-erase)){
				lines.push(bd.bnum(bx-dy,   by-dx  )); // cc1からのstraight
			}
			else if(lcnt>=(2-erase) && !(iscrossing && lcnt===(3-erase) && this.isTpos(cc1,id))){
				lines.push(bd.bnum(bx-dy,   by-dx  )); // cc1からのstraight
				lines.push(bd.bnum(bx-1,    by-1   )); // cc1からのcurve1
				lines.push(bd.bnum(bx+dx-1, by+dy-1)); // cc1からのcurve2
			}
		}
		if(cc2!==null){
			var iscrossing=this.iscrossing(cc2), lcnt=this.lcnt[cc2];
			if(iscrossing && lcnt>=(4-erase)){
				lines.push(bd.bnum(bx+dy,   by+dx  )); // cc2からのstraight
			}
			else if(lcnt>=(2-erase) && !(iscrossing && lcnt===(3-erase) && this.isTpos(cc2,id))){
				lines.push(bd.bnum(bx+dy,   by+dx  )); // cc2からのstraight
				lines.push(bd.bnum(bx+1,    by+1   )); // cc2からのcurve1
				lines.push(bd.bnum(bx-dx+1, by-dy+1)); // cc2からのcurve2
			}
		}

		var bid = [];
		for(var i=0;i<lines.length;i++){ if(bd.isLine(lines[i])){ bid.push(lines[i]);}}
		return bid;
	},

	lc0main : function(bid){
		for(var i=0,len=bid.length;i<len;i++){
			if(this.data.id[bid[i]]!=0){ continue;}	// 既にidがついていたらスルー
			var bx=bd.border[bid[i]].bx, by=bd.border[bid[i]].by;
			this.data.max++;
			this.data[this.data.max] = {idlist:[]};
			if(!k.isCenterLine^(bx&1)){ this.lc0(bx,by+1,1,this.data.max); this.lc0(bx,by,2,this.data.max);}
			else                      { this.lc0(bx+1,by,3,this.data.max); this.lc0(bx,by,4,this.data.max);}
		}
	},
	lc0 : function(bx,by,dir,newid){
		while(1){
			switch(dir){ case 1: by--; break; case 2: by++; break; case 3: bx--; break; case 4: bx++; break;}
			if((bx+by)%2===0){
				var cc = (k.isCenterLine?bd.cnum:bd.xnum).call(bd,bx,by);
				if(cc===null){ break;}
				else if(this.lcnt[cc]>=3){
					if(!this.iscrossing(cc)){
						if(bd.isLine(bd.bnum(bx,by-1))){ this.lc0(bx,by,1,newid);}
						if(bd.isLine(bd.bnum(bx,by+1))){ this.lc0(bx,by,2,newid);}
						if(bd.isLine(bd.bnum(bx-1,by))){ this.lc0(bx,by,3,newid);}
						if(bd.isLine(bd.bnum(bx+1,by))){ this.lc0(bx,by,4,newid);}
						break;
					}
					/* lcnt>=3でiscrossing==trueの時は直進＝何もしない */
				}
				else{
					if     (dir!=1 && bd.isLine(bd.bnum(bx,by+1))){ dir=2;}
					else if(dir!=2 && bd.isLine(bd.bnum(bx,by-1))){ dir=1;}
					else if(dir!=3 && bd.isLine(bd.bnum(bx+1,by))){ dir=4;}
					else if(dir!=4 && bd.isLine(bd.bnum(bx-1,by))){ dir=3;}
				}
			}
			else{
				var id = bd.bnum(bx,by);
				if(this.data.id[id]!=0){ break;}
				this.data.id[id] = newid;
				this.data[newid].idlist.push(id);
			}
		}
	},

	//--------------------------------------------------------------------------------
	// line.getLineInfo()    線情報をAreaInfo型のオブジェクトで返す
	// line.getLareaInfo()   同じ線がまたがるセルの情報をAreaInfo型のオブジェクトで返す
	//                       (これだけは旧型の生成方法でやってます)
	//--------------------------------------------------------------------------------
	getLineInfo : function(){
		var info = new AreaInfo();
		for(var id=0;id<bd.bdmax;id++){ info.id[id]=(bd.isLine(id)?0:null);}
		for(var id=0;id<bd.bdmax;id++){
			if(info.id[id]!=0){ continue;}
			info.max++;
			info.room[info.max] = {idlist:this.data[this.data.id[id]].idlist}; /* 参照だけなのでconcat()じゃなくてよい */
			for(var i=0;i<info.room[info.max].idlist.length;i++){
				info.id[info.room[info.max].idlist[i]] = info.max;
			}
		}
		return info;
	},
	getLareaInfo : function(){
		var linfo = new AreaInfo();
		for(var c=0;c<bd.cellmax;c++){ linfo.id[c]=(this.lcnt[c]>0?0:null);}
		for(var c=0;c<bd.cellmax;c++){
			if(linfo.id[c]!=0){ continue;}
			linfo.max++;
			linfo.room[linfo.max] = {idlist:[]};
			this.sr0(linfo, c, linfo.max);
		}
		return linfo;
	},
	sr0 : function(linfo, i, areaid){
		linfo.id[i] = areaid;
		linfo.room[areaid].idlist.push(i);
		if( bd.isLine(bd.ub(i)) && linfo.id[bd.up(i)]===0 ){ this.sr0(linfo, bd.up(i), areaid);}
		if( bd.isLine(bd.db(i)) && linfo.id[bd.dn(i)]===0 ){ this.sr0(linfo, bd.dn(i), areaid);}
		if( bd.isLine(bd.lb(i)) && linfo.id[bd.lt(i)]===0 ){ this.sr0(linfo, bd.lt(i), areaid);}
		if( bd.isLine(bd.rb(i)) && linfo.id[bd.rt(i)]===0 ){ this.sr0(linfo, bd.rt(i), areaid);}
	}
};

//--------------------------------------------------------------------------------
// ★AreaManagerクラス 部屋のTOP-Cellの位置等の情報を扱う
//   ※このクラスで管理しているareaidは、処理を簡略化するために
//     領域に属するIDがなくなっても情報としては消していません。
//     そのため、1～maxまで全て中身が存在しているとは限りません。
//     回答チェックやファイル出力前には一旦resetRarea()等が必要です。
//--------------------------------------------------------------------------------
// 部屋のTOPに数字を入力する時の、ハンドリング等
AreaManager = function(){
	this.lcnt  = [];	// 交点id -> 交点から出る線の本数
	this.isbd  = [];

	this.room  = {};	// 部屋情報を保持する
	this.bcell = {};	// 黒マス情報を保持する
	this.wcell = {};	// 白マス情報を保持する

	this.init();
};
AreaManager.prototype = {
	//--------------------------------------------------------------------------------
	// area.init()       起動時に変数を初期化する
	// area.resetArea()  部屋、黒マス、白マスの情報をresetする
	//--------------------------------------------------------------------------------
	init : function(){
		this.initRarea();
		this.initBarea();
		this.initWarea();
	},
	resetArea : function(){
		if(!!k.isborder && !k.isborderAsLine){ this.resetRarea();}
		if(k.checkBlackCell || k.linkNumber) { this.resetBarea();}
		if(k.checkWhiteCell)                 { this.resetWarea();}
	},

	//--------------------------------------------------------------------------------
	// area.initRarea()  部屋関連の変数を初期化する
	// area.resetRarea() 部屋の情報をresetして、1から割り当てしなおす
	// 
	// area.lcntCross()  指定された位置のCrossの上下左右のうち境界線が引かれている(ques==1 or qans==1の)数を求める
	// area.getRoomID()  このオブジェクトで管理しているセルの部屋IDを取得する
	// area.setRoomID()  このオブジェクトで管理しているセルの部屋IDを設定する
	// area.getTopOfRoomByCell() 指定したセルが含まれる領域のTOPの部屋を取得する
	// area.getTopOfRoom()       指定した領域のTOPの部屋を取得する
	// area.getCntOfRoomByCell() 指定したセルが含まれる領域の大きさを抽出する
	// area.getCntOfRoom()       指定した領域の大きさを抽出する
	//--------------------------------------------------------------------------------
	initRarea : function(){
		// 部屋情報初期化
		this.room = {max:1,id:[],1:{top:0,clist:[]}};
		for(var c=0;c<bd.cellmax;c++){ this.room.id[c] = 1; this.room[1].clist[c] = c;}

		// lcnt変数初期化
		this.lcnt = [];
		for(var c=0;c<(k.qcols+1)*(k.qrows+1);c++){ this.lcnt[c]=0;}

		if(k.isborder===1){
			for(var by=bd.minby;by<=bd.maxby;by+=2){
				for(var bx=bd.minbx;bx<=bd.maxbx;bx+=2){
					if(bx===bd.minbx || bx===bd.maxbx || by===bd.minby || by===bd.maxby){
						var c = (bx>>1)+(by>>1)*(k.qcols+1);
						this.lcnt[c]=2;
					}
				}
			}
		}

		// isbd変数初期化
		this.isbd = [];
		for(var id=0;id<bd.bdmax;id++){ this.isbd[id]=false;}

		if(!k.hasroom){ return;}
		for(var id=0;id<bd.bdmax;id++){
			if(bd.isBorder(id)){ this.setRinfo(id, true);}
		}
	},
	resetRarea : function(){
		if(!k.hasroom){ return;}

		this.initRarea();
		this.room.max = 0;
		for(var cc=0;cc<bd.cellmax;cc++){ this.room.id[cc]=0;}
		for(var cc=0;cc<bd.cellmax;cc++){
			if(this.room.id[cc]!=0){ continue;}
			this.room.max++;
			this.room[this.room.max] = {top:null,clist:[]};
			this.sr0(cc,this.room,bd.isBorder);
		}

		// 部屋ごとに、TOPの場所に数字があるかどうか判断して移動する
		if(k.roomNumber){
			for(var r=1;r<=this.room.max;r++){
				this.setTopOfRoom(r);

				var val = -1, clist = this.room[r].clist;
				for(var i=0,len=clist.length;i<len;i++){
					var c = clist[i];
					if(this.room.id[c]===r && bd.cell[c].qnum!==-1){
						if(val===-1){ val = bd.cell[c].qnum;}
						if(this.room[r].top!==c){ bd.sQnC(c, -1);}
					}
				}
				if(val!==-1 && bd.QnC(this.room[r].top)===-1){ bd.sQnC(this.room[r].top, val);}
			}
		}
	},

	lcntCross : function(id){ return this.lcnt[id];},

	getRoomID : function(cc){ return this.room.id[cc];},
//	setRoomID : function(cc,val){ this.room.id[cc] = val;},

	getTopOfRoomByCell : function(cc){ return this.room[this.room.id[cc]].top;},
	getTopOfRoom       : function(id){ return this.room[id].top;},

	getCntOfRoomByCell : function(cc){ return this.room[this.room.id[cc]].clist.length;},
//	getCntOfRoom       : function(id){ return this.room[id].clist.length;},

	//--------------------------------------------------------------------------------
	// area.setRinfo()     境界線が引かれたり消されてたりした時に、変数の内容を変更する
	// area.setBorder()    境界線が引かれたり消されてたりした時に、部屋情報を更新する
	// area.setTopOfRoom() セルのリストから部屋のTOPを設定する
	// area.sr0()          setBorder()から呼ばれて、初期idを含む一つの部屋の領域を、指定されたareaidにする
	//---------------------------------------------------------------------------
	setRinfo : function(id,isset){
		var cc1 = bd.border[id].crosscc[0], cc2 = bd.border[id].crosscc[1];
		if(isset){
			if(cc1!==null){ this.lcnt[cc1]++;}
			if(cc2!==null){ this.lcnt[cc2]++;}
		}
		else{
			if(cc1!==null){ this.lcnt[cc1]--;}
			if(cc2!==null){ this.lcnt[cc2]--;}
		}
		this.isbd[id] = isset;
	},

	setBorder : function(id,isset){
		if(!k.hasroom || !base.isenableInfo()){ return;}
		if(isset===this.isbd[id]){ return;}
		this.setRinfo(id,isset);

		var xc1 = bd.border[id].crosscc[0], xc2 = bd.border[id].crosscc[1];
		var cc1 = bd.border[id].cellcc[0],  cc2 = bd.border[id].cellcc[1];
		var room = this.room, roomid = room.id;
		if(isset){
			if(this.lcnt[xc1]===1 || this.lcnt[xc2]===1){ return;}
			if(cc1===null || cc2===null || roomid[cc1]!==roomid[cc2]){ return;}

			var baseid = roomid[cc1];

			// まず下or右側のセルから繋がるセルのroomidを変更する
			room.max++;
			room[room.max] = {top:null,clist:[]}
			this.sr0(cc2,room,bd.isBorder);

			// 部屋が分割されていなかったら、元に戻して終了
			if(roomid[cc1] === room.max){
				for(var i=0,len=room[room.max].clist.length;i<len;i++){
					roomid[room[room.max].clist[i]] = baseid;
				}
				room.max--;
				return;
			}

			// roomの情報を更新する
			var clist = room[baseid].clist.concat();
			room[baseid].clist = [];
			room[room.max].clist = [];
			for(var i=0,len=clist.length;i<len;i++){
				room[roomid[clist[i]]].clist.push(clist[i]);
			}

			// TOPの情報を設定する
			if(k.roomNumber){
				if(roomid[room[baseid].top]===baseid){
					this.setTopOfRoom(room.max);
				}
				else{
					room[room.max].top = room[baseid].top;
					this.setTopOfRoom(baseid);
				}
			}
		}
		else{
			if(this.lcnt[xc1]===0 || this.lcnt[xc2]===0){ return;}
			if(cc1===null || cc2===null || roomid[cc1]===roomid[cc2]){ return;}

			// k.roomNumberの時 どっちの数字を残すかは、TOP同士の位置で比較する
			if(k.roomNumber){
				var merged, keep;

				var tc1 = room[roomid[cc1]].top, tc2 = room[roomid[cc2]].top;
				var tbx1 = bd.cell[tc1].bx, tbx2 = bd.cell[tc2].bx;
				if(tbx1>tbx2 || (tbx1===tbx2 && tc1>tc2)){ merged = tc1; keep = tc2;}
				else                                     { merged = tc2; keep = tc1;}

				// 消える部屋のほうの数字を消す
				if(bd.QnC(merged)!==-1){
					// 数字が消える部屋にしかない場合 -> 残るほうに移動させる
					if(bd.QnC(keep)===-1){ bd.sQnC(keep, bd.QnC(merged)); pc.paintCell(keep);}
					bd.sQnC(merged,-1); pc.paintCell(merged);
				}
			}

			// room, roomidを更新
			var r1 = roomid[cc1], r2 = roomid[cc2], clist = room[r2].clist;
			for(var i=0;i<clist.length;i++){
				roomid[clist[i]] = r1;
				room[r1].clist.push(clist[i]);
			}
			room[r2] = {top:null,clist:[]};
		}
	},
	setTopOfRoom : function(roomid){
		var cc=null, bx=bd.maxbx, by=bd.maxby;
		var clist = this.room[roomid].clist;
		for(var i=0;i<clist.length;i++){
			var tc = bd.cell[clist[i]];
			if(tc.bx>bx || (tc.bx===bx && tc.by>=by)){ continue;}
			cc=clist[i];
			bx=tc.bx;
			by=tc.by;
		}
		this.room[roomid].top = cc;
	},
	sr0 : function(c,data,func){
		data.id[c] = data.max;
		data[data.max].clist.push(c);
		var tc;
		tc=bd.up(c); if( tc!==null && data.id[tc]!==data.max && !func(bd.ub(c)) ){ this.sr0(tc,data,func);}
		tc=bd.dn(c); if( tc!==null && data.id[tc]!==data.max && !func(bd.db(c)) ){ this.sr0(tc,data,func);}
		tc=bd.lt(c); if( tc!==null && data.id[tc]!==data.max && !func(bd.lb(c)) ){ this.sr0(tc,data,func);}
		tc=bd.rt(c); if( tc!==null && data.id[tc]!==data.max && !func(bd.rb(c)) ){ this.sr0(tc,data,func);}
	},

	//--------------------------------------------------------------------------------
	// area.isBlock()    このオブジェクト内で黒マスがある扱いする条件
	// area.initBarea()  黒マス関連の変数を初期化する
	// area.resetBarea() 黒マスの情報をresetして、1から割り当てしなおす
	// area.initWarea()  白マス関連の変数を初期化する
	// area.resetWarea() 白マスの情報をresetして、1から割り当てしなおす
	//--------------------------------------------------------------------------------
	isBlock : function(cc){
		if(!k.linkNumber){ return bd.isBlack(cc);}
		else{ return (bd.isNum(cc)||(k.NumberWithMB && (bd.QsC(cc)===1)));}
		return false;
	},

	initBarea : function(){
		this.bcell = {max:0,id:[]};
		for(var c=0;c<bd.cellmax;c++){
			this.bcell.id[c] = null;
		}
	},
	resetBarea : function(){
		this.initBarea();
		for(var cc=0;cc<bd.cellmax;cc++){
			this.bcell.id[cc]=(this.isBlock(cc) ? 0 : null);
		}
		for(var cc=0;cc<bd.cellmax;cc++){
			if(this.bcell.id[cc]!==0){ continue;}
			this.bcell.max++;
			this.bcell[this.bcell.max] = {clist:[]};
			this.sc0(cc,this.bcell);
		}
	},

	initWarea : function(){
		this.wcell = {max:1,id:[],1:{clist:[]}};
		for(var c=0;c<bd.cellmax;c++){
			this.wcell.id[c] = 1;
			this.wcell[1].clist[c]=c;
		}
	},
	resetWarea : function(){
		this.initWarea();
		this.wcell.max = 0;
		for(var cc=0;cc<bd.cellmax;cc++){ this.wcell.id[cc]=(bd.isWhite(cc)?0:null); }
		for(var cc=0;cc<bd.cellmax;cc++){
			if(this.wcell.id[cc]!==0){ continue;}
			this.wcell.max++;
			this.wcell[this.wcell.max] = {clist:[]};
			this.sc0(cc,this.wcell);
		}
	},

	//--------------------------------------------------------------------------------
	// area.setCell()    黒マス・白マスが入力されたり消された時に、黒マス/白マスIDの情報を変更する
	// area.setBWCell()  setCellから呼ばれる関数
	// area.sc0()        初期idを含む一つの領域内のareaidを指定されたものにする
	//--------------------------------------------------------------------------------
	setCell : function(type,cc){
		if(type==='block'){
			if(k.checkBlackCell){ this.setBWCell(cc,bd.isBlack(cc),this.bcell);}
			if(k.checkWhiteCell){ this.setBWCell(cc,bd.isWhite(cc),this.wcell);}
		}
		else if(type==='number'){
			if(k.linkNumber)	{ this.setBWCell(cc,this.isBlock(cc),this.bcell);}
		}
	},
	setBWCell : function(cc,isset,data){
		if(!base.isenableInfo()){ return;}
		if(isset===(data.id[cc]!==null)){ return;}

		var cid = [], dataid = data.id, tc;
		tc=bd.up(cc); if(tc!==null && dataid[tc]!==null){ cid.push(tc);}
		tc=bd.dn(cc); if(tc!==null && dataid[tc]!==null){ cid.push(tc);}
		tc=bd.lt(cc); if(tc!==null && dataid[tc]!==null){ cid.push(tc);}
		tc=bd.rt(cc); if(tc!==null && dataid[tc]!==null){ cid.push(tc);}

		// 新たに黒マス(白マス)になった時
		if(isset){
			// まわりに黒マス(白マス)がない時は新しいIDで登録です
			if(cid.length===0){
				data.max++;
				data[data.max] = {clist:[cc]};
				dataid[cc] = data.max;
			}
			// 1方向にあるときは、そこにくっつけばよい
			else if(cid.length===1){
				data[dataid[cid[0]]].clist.push(cc);
				dataid[cc] = dataid[cid[0]];
			}
			// 2方向以上の時
			else{
				// 周りで一番大きな黒マスは？
				var largeid = dataid[cid[0]];
				for(var i=1;i<cid.length;i++){
					if(data[largeid].clist.length < data[dataid[cid[i]]].clist.length){ largeid=dataid[cid[i]];}
				}
				// つながった黒マス(白マス)は全て同じIDにする
				for(var i=0;i<cid.length;i++){
					if(dataid[cid[i]]===largeid){ continue;}
					var clist = data[dataid[cid[i]]].clist;
					for(var n=0,len=clist.length;n<len;n++){
						dataid[clist[n]] = largeid;
						data[largeid].clist.push(clist[n]);
					}
					clist = [];
				}
				// 自分をくっつける
				dataid[cc] = largeid;
				data[largeid].clist.push(cc);
			}
		}
		// 黒マス(白マス)ではなくなった時
		else{
			// まわりに黒マス(白マス)がない時は情報を消去するだけ
			if(cid.length===0){
				data[dataid[cc]].clist = [];
				dataid[cc] = null;
			}
			// まわり1方向の時も自分を消去するだけでよい
			else if(cid.length===1){
				var ownid = dataid[cc], clist = data[ownid].clist;
				for(var i=0;i<clist.length;i++){ if(clist[i]===cc){ clist.splice(i,1); break;} }
				dataid[cc] = null;
			}
			// 2方向以上の時は考慮が必要
			else{
				// 一度自分の領域の黒マス(白マス)情報を無効にする
				var ownid = dataid[cc], clist = data[ownid].clist;
				for(var i=0;i<clist.length;i++){ dataid[clist[i]] = 0;}
				data[ownid].clist = [];

				// 自分を黒マス(白マス)情報から消去
				dataid[cc] = null;

				// まわりのIDが0なセルに黒マス(白マス)IDをセットしていく
				for(var i=0;i<cid.length;i++){
					if(dataid[cid[i]]!==0){ continue;}
					data.max++;
					data[data.max] = {clist:[]};
					this.sc0(cid[i],data);
				}
			}
		}
	},
	sc0 : function(c,data){
		data.id[c] = data.max;
		data[data.max].clist.push(c);
		var tc;
		tc=bd.up(c); if( tc!==null && data.id[tc]===0 ){ this.sc0(tc,data);}
		tc=bd.dn(c); if( tc!==null && data.id[tc]===0 ){ this.sc0(tc,data);}
		tc=bd.lt(c); if( tc!==null && data.id[tc]===0 ){ this.sc0(tc,data);}
		tc=bd.rt(c); if( tc!==null && data.id[tc]===0 ){ this.sc0(tc,data);}
	},

	//--------------------------------------------------------------------------------
	// area.getRoomInfo()  部屋情報をAreaInfo型のオブジェクトで返す
	// area.getBCellInfo() 黒マス情報をAreaInfo型のオブジェクトで返す
	// area.getWCellInfo() 白マス情報をAreaInfo型のオブジェクトで返す
	// area.getNumberInfo() 数字情報(=黒マス情報)をAreaInfo型のオブジェクトで返す
	// area.getAreaInfo()  上記関数の共通処理
	//--------------------------------------------------------------------------------
	getRoomInfo  : function(){ return this.getAreaInfo(this.room);},
	getBCellInfo : function(){ return this.getAreaInfo(this.bcell);},
	getWCellInfo : function(){ return this.getAreaInfo(this.wcell);},
	getNumberInfo : function(){ return this.getAreaInfo(this.bcell);},
	getAreaInfo : function(block){
		var info = new AreaInfo();
		for(var c=0;c<bd.cellmax;c++){ info.id[c]=(block.id[c]>0?0:null);}
		for(var c=0;c<bd.cellmax;c++){
			if(info.id[c]!==0){ continue;}
			info.max++;
			var clist = block[block.id[c]].clist;
			info.room[info.max] = {idlist:clist}; /* 参照だけなのでconcat()じゃなくてよい */
			for(var i=0,len=clist.length;i<len;i++){ info.id[clist[i]] = info.max;}
		}
		return info;
	}
};

//---------------------------------------------------------------------------
// ★PBaseクラス ぱずぷれv3のベース処理やその他の処理を行う
//---------------------------------------------------------------------------

// PBaseクラス
PBase = function(){
	this.floatbgcolor = "black";
	this.proto        = 0;	// 各クラスのprototypeがパズル用スクリプトによって変更されているか
	this.userlang     = 'ja';
	this.expression   = { ja:'' ,en:''};
	this.puzzlename   = { ja:'' ,en:''};
	this.numparent    = null;	// 'numobj_parent'を示すエレメント
	this.resizetimer  = null;	// resizeタイマー
	this.initProcess  = true;	// 初期化中かどうか
	this.enableSaveImage = false;	// 画像保存が有効か

	this.disinfo = 0;			// LineManager, AreaManagerを呼び出さないようにする
};
PBase.prototype = {
	//---------------------------------------------------------------------------
	// base.preload_func()
	//   このファイルが呼ばれたときに実行される関数 -> onLoad前の最小限の設定を行う
	//---------------------------------------------------------------------------
	preload_func : function(){
		// URLの取得 -> URLの?以下ををpuzzleid部とpzlURI部に分割
		enc = new Encode();
		enc.first_parseURI(location.search);
		if(!k.puzzleid){ location.href = "./";} // 指定されたパズルがない場合はさようなら～

		// パズル専用ファイルの読み込み
		if(k.scriptcheck){
			_doc.writeln("<script type=\"text/javascript\" src=\"src/for_test.js\"></script>");
		}
		_doc.writeln("<script type=\"text/javascript\" src=\"src/"+k.puzzleid+".js\"></script>");

		fio = new FileIO();
		if(fio.dbm.requireGears()){
			// 必要な場合、gears_init.jsの読み込み
			_doc.writeln("<script type=\"text/javascript\" src=\"src/gears_init.js\"></script>");
		}

		// onLoadとonResizeに動作を割り当てる
		window.onload   = ee.ebinder(this, this.onload_func);
		window.onresize = ee.ebinder(this, this.onresize_func);
	},

	//---------------------------------------------------------------------------
	// base.onload_func()
	//   ページがLoadされた時の処理。各クラスのオブジェクトへの読み込み等初期設定を行う
	//---------------------------------------------------------------------------
	onload_func : function(){
		Camp('divques');
		if(Camp.enable.canvas && !!_doc.createElement('canvas').toDataURL){
			this.enableSaveImage = true;
			Camp('divques_sub', 'canvas');
		}

		var self = this;
		var tim = setInterval(function(){
			if(Camp.isready()){
				clearInterval(tim);
				self.onload_func2.apply(self);
			}
		},10);
	},
	onload_func2 : function(){
		this.initCanvas();
		this.initObjects();
		this.setEvents();	// イベントをくっつける

		if(k.PLAYER){ this.accesslog();}	// アクセスログをとってみる
		tm = new Timer();	// タイマーオブジェクトの生成とタイマースタート

		this.initProcess = false;
	},

	//---------------------------------------------------------------------------
	// base.initObjects()   キャンバスの初期化
	// base.initObjects()   各オブジェクトの生成などの処理
	// base.doc_design()    onload_func()で呼ばれる。htmlなどの設定を行う
	// base.checkUserLang() 言語環境をチェックして日本語でない場合英語表示にする
	//---------------------------------------------------------------------------
	initCanvas : function(){
		this.numparent = ee('numobj_parent').el;		// 数字表示用
		g = ee('divques').unselectable().el.getContext("2d");
	},
	initObjects : function(){
		this.proto = 0;

		puz = new Puzzles[k.puzzleid]();	// パズル固有オブジェクト
		puz.setting();						// パズル固有の変数設定(デフォルト等)
		if(this.proto){ puz.protoChange();}

		// クラス初期化
		tc = new TCell();		// キー入力のターゲット管理オブジェクト
		bd = new Board();		// 盤面オブジェクト
		mv = new MouseEvent();	// マウス入力オブジェクト
		kc = new KeyEvent();	// キーボード入力オブジェクト
		kp = new KeyPopup();	// 入力パネルオブジェクト
		pc = new Graphic();		// 描画系オブジェクト
		ans = new AnsCheck();	// 正解判定オブジェクト
		um   = new OperationManager();	// 操作情報管理オブジェクト
		area = new AreaManager();		// 部屋情報等管理オブジェクト
		line = new LineManager();		// 線の情報管理オブジェクト

		menu = new Menu();		// メニューを扱うオブジェクト
		pp = new Properties();	// メニュー関係の設定値を保持するオブジェクト

		// 各パズルごとの設定(後付け分)
		puz.input_init();
		puz.graphic_init();
		puz.encode_init();
		puz.answer_init();

		// メニュー関係初期化
		menu.menuinit();		// メニューの設定
		this.doc_design();		// デザイン変更関連関数の呼び出し
		this.checkUserLang();	// 言語のチェック

		enc.pzlinput();			// URLからパズルのデータを読み出す
		this.resize_canvas();

		if(!!puz.finalfix){ puz.finalfix();}		// パズル固有の後付け設定
	},
	// 背景画像とかtitle・背景画像・html表示の設定
	doc_design : function(){
		_doc.title = this.gettitle();
		ee('title2').el.innerHTML = this.gettitle();

		_doc.body.style.backgroundImage = "url(./bg/"+k.puzzleid+".gif)";
		if(k.br.IE6){
			ee('title2').el.style.marginTop = "24px";
			ee('separator1').el.style.margin = '0pt';
			ee('separator2').el.style.margin = '0pt';
		}
	},
	checkUserLang : function(){
		this.userlang = (navigator.browserLanguage ||
						 navigator.language        ||
						 navigator.userLanguage);
		if(this.userlang.substr(0,2)!=='ja'){ pp.setVal('language','en');}
	},

	//---------------------------------------------------------------------------
	// base.setEvents()       マウス入力、キー入力のイベントの設定を行う
	//---------------------------------------------------------------------------
	setEvents : function(first){
		// マウス入力イベントの設定
		var canvas = ee('divques').el;
		if(!k.os.iPhoneOS && !k.os.Android){
			canvas.onmousedown   = ee.ebinder(mv, mv.e_mousedown);
			canvas.onmousemove   = ee.ebinder(mv, mv.e_mousemove);
			canvas.onmouseup     = ee.ebinder(mv, mv.e_mouseup  );
			canvas.oncontextmenu = function(){ return false;};

			this.numparent.onmousedown   = ee.ebinder(mv, mv.e_mousedown);
			this.numparent.onmousemove   = ee.ebinder(mv, mv.e_mousemove);
			this.numparent.onmouseup     = ee.ebinder(mv, mv.e_mouseup  );
			this.numparent.oncontextmenu = function(){ return false;};
		}
		// iPhoneOS用のタッチイベント設定
		else{
			canvas.addEventListener("touchstart", ee.ebinder(mv, mv.e_mousedown), false);
			canvas.addEventListener("touchmove",  ee.ebinder(mv, mv.e_mousemove), false);
			canvas.addEventListener("touchend",   ee.ebinder(mv, mv.e_mouseup),   false);

			this.numparent.addEventListener("touchstart", ee.ebinder(mv, mv.e_mousedown), false);
			this.numparent.addEventListener("touchmove",  ee.ebinder(mv, mv.e_mousemove), false);
			this.numparent.addEventListener("touchend",   ee.ebinder(mv, mv.e_mouseup),   false);
		}

		// キー入力イベントの設定
		_doc.onkeydown  = ee.ebinder(kc, kc.e_keydown);
		_doc.onkeyup    = ee.ebinder(kc, kc.e_keyup);
		_doc.onkeypress = ee.ebinder(kc, kc.e_keypress);
		// Silverlightのキー入力イベント設定
		if(g.use.sl){
			var sender = g.content.findName(g.canvasid);
			sender.AddEventListener("KeyDown", kc.e_SLkeydown);
			sender.AddEventListener("KeyUp",   kc.e_SLkeyup);
		}

		// File API＋Drag&Drop APIの設定
		if(!!menu.ex.reader){
			var DDhandler = function(e){
				menu.ex.reader.readAsText(e.dataTransfer.files[0]);
				e.preventDefault();
				e.stopPropagation();
			}
			window.addEventListener('dragover', function(e){ e.preventDefault();}, true);
			window.addEventListener('drop', DDhandler, true);
		}

		// onBlurにイベントを割り当てる
		_doc.onblur = ee.ebinder(this, this.onblur_func);
	},

	//---------------------------------------------------------------------------
	// base.disableInfo()  Area/LineManagerへの登録を禁止する
	// base.enableInfo()   Area/LineManagerへの登録を許可する
	// base.isenableInfo() Area/LineManagerへの登録ができるかを返す
	// base.resetInfo()    AreaInfo等、盤面読み込み時に初期化される情報を呼び出す
	//---------------------------------------------------------------------------
	disableInfo : function(){
		um.disableRecord();
		this.disinfo++;
	},
	enableInfo : function(){
		um.enableRecord();
		if(this.disinfo>0){ this.disinfo--;}
	},
	isenableInfo : function(){
		return (this.disinfo===0);
	},
	resetInfo : function(iserase){
		if(iserase){ um.allerase();}
		area.resetArea();
		line.resetLcnts();
	},

	//---------------------------------------------------------------------------
	// base.gettitle()         現在開いているタイトルを返す
	// base.getPuzzleName()    現在開いているパズルの名前を返す
	// base.setTitle()         パズルの名前を設定する
	// base.setExpression()    説明文を設定する
	// base.setFloatbgcolor()  フロートメニューの背景色を設定する
	//---------------------------------------------------------------------------
	gettitle : function(){
		if(k.EDITOR){ return ""+this.getPuzzleName()+menu.selectStr(" エディタ - ぱずぷれv3"," editor - PUZ-PRE v3");}
		else		{ return ""+this.getPuzzleName()+menu.selectStr(" player - ぱずぷれv3"  ," player - PUZ-PRE v3");}
	},
	getPuzzleName : function(){ return menu.selectStr(this.puzzlename.ja,this.puzzlename.en);},
	setTitle      : function(strJP, strEN){ this.puzzlename.ja = strJP; this.puzzlename.en = (!!strEN ? strEN : strJP);},
	setExpression : function(strJP, strEN){ this.expression.ja = strJP; this.expression.en = (!!strEN ? strEN : strJP);},
	setFloatbgcolor : function(color){ this.floatbgcolor = color;},

	//---------------------------------------------------------------------------
	// base.onresize_func()  ウィンドウリサイズ時に呼ばれる関数
	// base.resize_canvas()  ウィンドウのLoad/Resize時の処理。Canvas/表示するマス目の大きさを設定する。
	//---------------------------------------------------------------------------
	onresize_func : function(){
		if(this.resizetimer){ clearTimeout(this.resizetimer);}
		this.resizetimer = setTimeout(ee.binder(this, this.resize_canvas),250);
	},
	resize_canvas : function(){
		var wwidth = ee.windowWidth()-6;	//  margin/borderがあるので、適当に引いておく
		var cols   = (bd.maxbx-bd.minbx)/2+2*k.bdmargin; // canvasの横幅がセル何個分に相当するか
		var rows   = (bd.maxby-bd.minby)/2+2*k.bdmargin; // canvasの縦幅がセル何個分に相当するか
		if(k.puzzleid==='box'){ cols++; rows++;}

		var cratio = {0:(19/36), 1:0.75, 2:1.0, 3:1.5, 4:3.0}[pp.getVal('size')];
		var cr = {base:cratio,limit:0.40}, ws = {base:0.80,limit:0.96}, ci=[];
		ci[0] = (wwidth*ws.base )/(k.cellsize*cr.base );
		ci[1] = (wwidth*ws.limit)/(k.cellsize*cr.limit);

		var mwidth = wwidth*ws.base-4; // margin/borderがあるので、適当に引いておく

		// 特に縮小が必要ない場合
		if(!pp.getVal('adjsize') || cols < ci[0]){
			mwidth = wwidth*ws.base-4;
			k.cwidth = k.cheight = (k.cellsize*cr.base)|0;
		}
		// base～limit間でサイズを自動調節する場合
		else if(cols < ci[1]){
			var ws_tmp = ws.base+(ws.limit-ws.base)*((k.qcols-ci[0])/(ci[1]-ci[0]));
			mwidth = wwidth*ws_tmp-4;
			k.cwidth = k.cheight = (mwidth/cols)|0; // 外枠ぎりぎりにする
		}
		// 自動調整の下限値を超える場合
		else{
			mwidth = wwidth*ws.limit-4;
			k.cwidth = k.cheight = (k.cellsize*cr.limit)|0;
		}
		k.bwidth  = k.cwidth/2; k.bheight = k.cheight/2;

		// mainのサイズ変更
		ee('main').el.style.width = ''+(mwidth|0)+'px';

		// 盤面のセルID:0が描画される位置の設定
		k.p0.x = k.p0.y = (k.cwidth*k.bdmargin)|0;
		// extendxell==0でない時は位置をずらす
		if(!!k.isexcell){ k.p0.x += k.cwidth; k.p0.y += k.cheight;}

		// Canvasのサイズ変更
		pc.resetVectorFunctions();
		g.changeSize((cols*k.cwidth)|0, (rows*k.cheight)|0);

		// canvasの上に文字・画像を表示する時のOffset指定
		var rect = ee('divques').getRect();
		k.cv_oft.x = rect.left;
		k.cv_oft.y = rect.top;

		kp.resize();
		bd.setcoordAll();
		pc.onresize_process();

		// 再描画
		pc.flushCanvasAll();
		pc.paintAll();
	},

	//---------------------------------------------------------------------------
	// base.onblur_func() ウィンドウからフォーカスが離れた時に呼ばれる関数
	//---------------------------------------------------------------------------
	onblur_func : function(){
		kc.keyreset();
		mv.mousereset();
	},

	//---------------------------------------------------------------------------
	// base.reload_func()  別パズルのファイルを読み込む関数
	// base.reload_func2() パズル種類を変更して、初期化する関数
	//---------------------------------------------------------------------------
	reload_func : function(contents){
		this.initProcess = true;

		// idを取得して、ファイルを読み込み
		if(!Puzzles[contents.id]){
			var _script = _doc.createElement('script');
			_script.type = 'text/javascript';
			_script.src = "src/"+contents.id+".js";

			// headじゃないけど、、しょうがないかぁ。。
			_doc.body.appendChild(_script);
		}

		// 中身を読み取れるまでwait
		var self = this;
		var tim = setInterval(function(){
			if(!!Puzzles[contents.id]){
				clearInterval(tim);
				self.reload_func2.call(self, contents);
				self.initProcess = false;

				if(!!contents.callback){
					contents.callback();
				}
			}
		},10);
	},
	reload_func2 : function(contents){
		// 各パズルでオーバーライドしているものを、元に戻す
		if(base.proto){ puz.protoOriginal();}

		// 各HTML要素等を初期化する
		menu.menureset();
		this.numparent.innerHTML = '';

		ee.clean();

		k.puzzleid = contents.id;

		// 各種パラメータのうち各パズルで初期化されないやつをここで初期化
		k.qcols = 0;
		k.qrows = 0;
		k.cellsize = 36;
		k.bdmargin = 0.70;
		k.bdmargin_image = 0.10;

		// 通常preload_funcで初期化されるenc,fioをここで生成する
		enc = new Encode();
		fio = new FileIO();

		if(!!contents.url){ enc.parseURI_pzpr(contents.url);}
		if(!!enc.uri.cols){ k.qcols = enc.uri.cols;}
		if(!!enc.uri.rows){ k.qrows = enc.uri.rows;}

		// onload後の初期化ルーチンへジャンプする
		this.initObjects();
	},

	//---------------------------------------------------------------------------
	// base.accesslog() playerのアクセスログをとる
	//---------------------------------------------------------------------------
	accesslog : function(){
		if(_doc.domain!=='indi.s58.xrea.com' &&
		   _doc.domain!=='pzprv3.sakura.ne.jp' &&
		   !_doc.domain.match(/pzv\.jp/)){ return;}

		// 送信
		var xmlhttp = false;
		if(typeof ActiveXObject != "undefined"){
			try { xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");}
			catch (e) { xmlhttp = false;}
		}
		if(!xmlhttp && typeof XMLHttpRequest != "undefined") {
			xmlhttp = new XMLHttpRequest();
		}
		if(xmlhttp){
			var refer = _doc.referrer;
			refer = refer.replace(/\?/g,"%3f");
			refer = refer.replace(/\&/g,"%26");
			refer = refer.replace(/\=/g,"%3d");
			refer = refer.replace(/\//g,"%2f");

			var data = [
				("scr="     + "pzprv3"),
				("pid="     + k.puzzleid),
				("referer=" + refer),
				("pzldata=" + enc.uri.qdata)
			].join('&');

			xmlhttp.open("POST", "./record.cgi");
			xmlhttp.onreadystatechange = function(){};
			xmlhttp.setRequestHeader("Content-Type" , "application/x-www-form-urlencoded");
			xmlhttp.send(data);
		}
	}
};

base = new PBase();	// onLoadまでの最小限の設定を行う
base.preload_func();
