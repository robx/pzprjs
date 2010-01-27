// ContextManager.js rev28
 
(function(){

/* ------------- */
/*   variables   */
/* ------------- */
var _win = this,
	_doc = document,
	_mf = Math.floor,
	_ms = Math.sin,
	_mc = Math.cos,
	_2PI = 2*Math.PI,

	_IE = !!(window.attachEvent && !window.opera),

	Z  = 10,
	Z2 = Z/2,

	_color = [],
	flags = { debugmode:false },
	_types = ['svg','canvas','sl','flash','vml'],

	VML = 0,
	SVG = 1,
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

/* ------------------------------------------- */
/*   VectorContext(VML)クラス用const文字列集   */
/* ------------------------------------------- */
var V_TAG_GROUP   = '<v:group unselectable="on"',
	V_TAG_SHAPE   = '<v:shape unselectable="on"',
	V_TAG_TEXTBOX = '<v:textbox unselectable="on"',
	V_TAGEND      = '>',
	V_TAGEND_NULL = ' />',
	V_CLOSETAG_SHAPE   = '</v:shape>',
	V_CLOSETAG_TEXTBOX = '</v:textbox>',

	V_ATT_ID    = ' id="',
	V_ATT_PATH  = ' path="',
	V_ATT_STYLE = ' style="',
	V_ATT_COORDSIZE    = ' coordsize="100,100"',
	V_ATT_FILLCOLOR    = ' fillcolor="',
	V_ATT_STROKECOLOR  = ' strokecolor="',
	V_ATT_STROKEWEIGHT = ' strokeweight="',
	V_ATT_END = '"',
	V_ATT_STYLE_TEXTBOX = ' style="white-space:nowrap;cursor:default;font:10px sans-serif;"',

	V_STYLE_LEFT = 'left:',
	V_STYLE_TOP  = 'top:',
	V_STYLE_END  = ';',

	V_PATH_MOVE   = ' m',
	V_PATH_LINE   = ' l',
	V_PATH_CLOSE  = ' x',
	V_PATH_NOSTROKE = ' ns',
	V_PATH_NOFILL   = ' nf';

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

	S_NONE = 'none';

/* --------------------------------- */
/*   VectorContextクラス用変数など   */
/* --------------------------------- */
var EL_ID_HEADER = "canvas_o_",
	EMPTY = '';

/* ----------------------- */
/*   VectorContextクラス   */
/* ----------------------- */
var VectorContext = function(type, idname){
	// canvasに存在するプロパティ＆デフォルト値
	this.fillStyle    = 'black';
	this.strokeStyle  = 'black';
	this.lineWidth    = 1;
	this.textAlign    = 'center';
	this.textBaseline = 'middle';

	// 外部から変更される追加プロパティ
	this.vid      = '';
	this.elements = [];

	// variables for internal
	this.type   = type;
	this.target = null;
	this.parent = null;
	this.idname = idname;
	this.canvasid = EL_ID_HEADER+idname;
	this.currentpath = [];
	this.lastpath    = '';
	this.isAA = false;

	// Silverlight用
	this.content = null;

	this.canvas = false;
	this.vml    = false;
	this.svg    = false;
	this.sl     = false;
	this.flash  = false;

	// define const
	if(this.type===SVG || this.type===SL){
		this.PATH_MOVE  = S_PATH_MOVE;
		this.PATH_LINE  = S_PATH_LINE;
		this.PATH_CLOSE = S_PATH_CLOSE;
		if(this.type===SVG){ this.svg = true;}
		if(this.type===SL) { this.sl  = true;}
	}
	else if(this.type===VML){
		this.PATH_MOVE  = V_PATH_MOVE;
		this.PATH_LINE  = V_PATH_LINE;
		this.PATH_CLOSE = V_PATH_CLOSE;
		this.vml = true;
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
			if     (this.type===SVG){ child = this.appendSVG(parent,rect.width,rect.height);}
			else if(this.type===SL) { child = this.appendSL (parent,rect.width,rect.height);}
			else if(this.type===VML){ child = this.appendVML(parent,rect.width,rect.height);}

			var self = this;
			//parent.className = "canvas";
			parent.style.display  = 'block';
			parent.style.position = 'relative';
			parent.style.overflow = 'hidden';
			if(flags.debugmode){
				parent.style.backgroundColor = "#efefef";
				parent.style.border = "solid 1px silver";
			}
			parent.unselectable = 'on';
			parent.getContext = function(type){ return self;};
			this.parent = parent;

			this.target = child;
			this.addVectorElement(true,false,false,[0,0,rect.width,rect.height]);
		}
		this.target = child;
	},
	appendSVG : function(parent, width, height){
		var svgtop = _doc.createElementNS(SVGNS,'svg');
		svgtop.setAttribute('id', this.canvasid);
//		svgtop.setAttribute('unselectable', 'on');
		svgtop.setAttribute(S_ATT_RENDERING, 'crispEdges');

		svgtop.setAttribute('font-size', "10px");
		svgtop.setAttribute('font-family', "sans-serif");
		svgtop.setAttribute('width', width);
		svgtop.setAttribute('height', height);
		svgtop.setAttribute('viewBox', [0,0,width,height].join(' '));

		parent.appendChild(svgtop);
		return svgtop;
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
		return vmltop;
	},
	appendSL : function(parent, width, height){
		parent.innerHTML = [
			'<object type="application/x-silverlight" width="100%" height="100%" id="',this.canvasid,'_object" />',
			'<param name="windowless" value="true" />',
			'<param name="background" value="#00000000" />',	// アルファ値0 = 透明
			'<param name="source" value="#',this.canvasid,'_script" />',
		//	'<param name="onLoad" value="onSLload" />',	// 前は100%,100%設定が必要だったみたい
			'</object>',
			'<script type="text/xaml" id="',this.canvasid,'_script">',
			'<Canvas xmlns="http://schemas.microsoft.com/client/2007" Name="',this.canvasid,'" />',
			'</script>'
		].join('');

		this.content = document.getElementById([this.canvasid,'object'].join('_')).content;
		return this.content.findName(this.canvasid);
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
					layer.setAttribute('unselectable', 'on');
					this.target.appendChild(layer);
				}
				else if(this.type===SL){
					layer = this.content.createFromXaml(['<Canvas Name="',lid,'"/>'].join(''));
					this.target.children.add(layer);
				}
				else{
					layer = _doc.createElement('div');
					layer.id = lid;
					layer.unselectable = 'on';
					layer.style.position = 'absolute';
					layer.style.left   = '0px';
					layer.style.top    = '0px';
					this.target.appendChild(layer);
				}
			}
			this.target = layer;
		}
	},
	getContextElement : function(){ return _doc.getElementById(this.canvasid);},
	getLayerElement   : function(){ return this.target;},

	changeSize : function(width,height){
		this.parent.style.width  = width + 'px';
		this.parent.style.height = height + 'px';

		var child = this.parent.firstChild;
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
		//this.clearCanvas();
	},
	changeOrigin : function(left,top){
		var child = this.parent.firstChild;
		if(this.type===SVG){
			var m = child.getAttribute('viewBox').split(/ /);
			m[0]=left, m[1]=top;
			child.setAttribute('viewBox', m.join(' '));
		}
		else if(this.type===VML || this.type===SL){
			child.style.position = 'absolute';
			child.style.left = (-left-2)+'px';
			child.style.top  = (-top -2)+'px';
		}
	},
	clearCanvas : function(){
		if(this.type!==SL){ _doc.getElementById(this.idname).innerHTML = '';}

		this.elements = [];
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
		if(this.type!==VML){ this.currentpath.push(this.PATH_MOVE,x,y);}else{ this.currentpath.push(this.PATH_MOVE,x*Z-Z2,y*Z-Z2);}
		this.lastpath = this.PATH_MOVE;
	},
	lineTo : function(x,y){
		if(this.lastpath!==this.PATH_LINE){ this.currentpath.push(this.PATH_LINE);}
		if(this.type!==VML){ this.currentpath.push(x,y);}else{ this.currentpath.push(x*Z-Z2,y*Z-Z2);}
		this.lastpath = this.PATH_LINE;
	},
	arc : function(cx,cy,r,startRad,endRad,antiClockWise){
		if(this.type===VML){ cx=cx*Z-Z2, cy=cy*Z-Z2, r=_mf(r*Z);}
		var sx = _mf(cx + r*_mc(startRad)), sy = _mf(cy + r*_ms(startRad)),
			ex = _mf(cx + r*_mc(endRad)),   ey = _mf(cy + r*_ms(endRad));
		if(this.type===VML){
			var com = (antiClockWise ? 'at' : 'wa');
			if(endRad-startRad>=2*Math.PI){ sx+=1;}
			this.currentpath.push(com,(cx-r),(cy-r),(cx+r),(cy+r),sx,sy,ex,ey);
			this.lastpath = com;
		}
		else{
			if(sy==ey){ sy+=0.125;}
			var unknownflag = (startRad>endRad)^(Math.abs(endRad-startRad)>Math.PI);
			var islong = ((antiClockWise^unknownflag)?1:0), sweep = ((islong==0^unknownflag)?1:0);
			this.currentpath.push(this.PATH_MOVE,sx,sy,S_PATH_ARCTO,r,r,0,islong,sweep,ex,ey);
			this.lastpath = S_PATH_ARCTO;
			this.isAA = true;
		}
	},

	/* Canvas API functions (for drawing) */
	fill       : function(){ this.addVectorElement(false,true,false,[]);},
	stroke     : function(){ this.addVectorElement(false,false,true,[]);},
	fillRect   : function(x,y,w,h){ this.addVectorElement(true,true,false,[x,y,w,h]);},
	strokeRect : function(x,y,w,h){ this.addVectorElement(true,false,true,[x,y,w,h]);},

	fillText : function(text,x,y){ switch(this.type){
	case SVG:
		var el = _doc.createElementNS(SVGNS,'text');
		if(!!this.vid){ this.elements[this.vid] = el;}
		el.setAttribute('x', x);
		el.setAttribute('y', y);
		el.appendChild(_doc.createTextNode(text));
		this.target.appendChild(el);
		break;

	case SL:
		var ar = ['<TextBlock Canvas.Left="',x,'" Canvas.Top="',y,'">',text,'</TextBlock>'];
		var xaml = this.content.createFromXaml(ar.join(''));
		if(!!this.vid){ this.elements[this.vid] = xaml;}
		this.target.children.add(xaml);
		break;

	case VML:
		var ar = [V_TAG_SHAPE, V_ATT_COORDSIZE];
		ar.push(V_ATT_STYLE, V_STYLE_LEFT,x,V_STYLE_END, V_STYLE_TOP,y,V_STYLE_END, V_ATT_END,
				V_ATT_PATH, this.pathRect([x,y,200,30]), V_PATH_NOFILL, V_PATH_NOSTROKE, V_ATT_END,
				V_TAGEND,

				V_TAG_TEXTBOX);
		if(!!this.vid){ ar.push(V_ATT_ID, this.vid, V_ATT_END); }
		ar.push(V_ATT_STYLE_TEXTBOX, V_TAGEND, text, V_CLOSETAG_TEXTBOX,
				V_CLOSETAG_SHAPE);

		this.target.insertAdjacentHTML(BEFOREEND, ar.join(''));
		if(!!this.vid){ this.elements[this.vid] = _doc.getElementById(this.vid);}
		break;
	}},

	/* extended functions */
	fillstroke : function(){ this.addVectorElement(false,true,true,[]);},

	pathRect : function(size){
		var x=size[0], y=size[1], w=size[2], h=size[3];
		if(this.type===VML){ x=x*Z-Z2,y=y*Z-Z2, w=w*Z, h=h*Z;}
		return [this.PATH_MOVE,x,y,this.PATH_LINE,(x+w),y,(x+w),(y+h),x,(y+h),this.PATH_CLOSE].join(' ');
	},

	setLinePath : function(){
		var _args = arguments, _len = _args.length, svg=(this.type!==VML);
		this.currentpath = [];
		for(var i=0,len=_len-((_len|1)?1:2);i<len;i+=2){
			if     (i==0){ this.currentpath.push(this.PATH_MOVE);}
			else if(i==2){ this.currentpath.push(this.PATH_LINE);}
			this.currentpath.push((svg?_args[i]:_args[i]*Z-Z2), (svg?_args[i+1]:_args[i+1]*Z-Z2));
		}
		if(_args[_len-1]){ this.currentpath.push(this.PATH_CLOSE);}
	},
	setOffsetLinePath : function(){
		var _args = arguments, _len = _args.length, svg=(this.type!==VML), m=[_args[0],_args[1]];
		this.currentpath = [];
		for(var i=2,len=_len-((_len|1)?1:2);i<len;i+=2){
			m[i] = _args[i] + m[0];
			m[i+1] = _args[i+1] + m[1];
		}
		for(var i=2,len=_len-((_len|1)?1:2);i<len;i+=2){
			if     (i==2){ this.currentpath.push(this.PATH_MOVE);}
			else if(i==4){ this.currentpath.push(this.PATH_LINE);}
			this.currentpath.push((svg?m[i]:m[i]*Z-Z2), (svg?m[i+1]:m[i+1]*Z-Z2));
		}
		if(_args[_len-1]){ this.currentpath.push(this.PATH_CLOSE);}
	},
	setDashSize : function(size){
		if(this.type===SVG){
			this.elements[this.vid].setAttribute('stroke-dasharray', size);
		}
		else if(this.type===SL){
			this.elements[this.vid].StrokeDashArray = size;
		}
		else if(this.type===VML){
			var el = _doc.createElement('v:stroke');
			if     (size<=2){ el.dashstyle = 'ShortDash';}
			else if(size<=5){ el.dashstyle = 'Dash';}
			else            { el.dashstyle = 'LongDash';}
			this.elements[this.vid].appendChild(el);
		}
	},

	strokeLine : function(x1,y1,x2,y2){
		if(this.type===VML){ x1=x1*Z, y1=y1*Z, x2=x2*Z, y2=y2*Z;}
		var stack = this.currentpath;
		this.currentpath = [this.PATH_MOVE,x1,y1,this.PATH_LINE,x2,y2];
		this.addVectorElement(false,false,true,[]);
		this.currentpath = stack;
	},
	strokeCross : function(cx,cy,l){
		if(this.type===VML){ cx=cx*Z-Z2, cy=cy*Z-Z2, l=_mf(l*Z);}
		var stack = this.currentpath;
		this.currentpath = [];
		this.currentpath.push(this.PATH_MOVE,(cx-l),(cy-l),this.PATH_LINE,(cx+l),(cy+l));
		this.currentpath.push(this.PATH_MOVE,(cx-l),(cy+l),this.PATH_LINE,(cx+l),(cy-l));
		this.addVectorElement(false,false,true,[]);
		this.currentpath = stack;
	},
	fillCircle : function(cx,cy,r){
		var stack = this.currentpath;
		this.currentpath = [];
		this.arc(cx,cy,r,0,_2PI,false);
		this.currentpath.push(this.PATH_CLOSE);
		this.addVectorElement(false,true,false,[]);
		this.currentpath = stack;
	},
	strokeCircle : function(cx,cy,r){
		var stack = this.currentpath;
		this.currentpath = [];
		this.arc(cx,cy,r,0,_2PI,false);
		this.currentpath.push(this.PATH_CLOSE);
		this.addVectorElement(false,false,true,[]);
		this.currentpath = stack;
	},

	addVectorElement : function(isrect,isfill,isstroke,size){
	var path = (isrect ? this.pathRect(size) : this.currentpath.join(' '));
	switch(this.type){
	case SVG:
		var el = _doc.createElementNS(SVGNS,'path');
		if(!!this.vid){ this.elements[this.vid] = el;}
		el.setAttribute('d', path);
		el.setAttribute(S_ATT_FILL,   (isfill ? parsecolor(this.fillStyle) : S_NONE));
		el.setAttribute(S_ATT_STROKE, (isstroke ? parsecolor(this.strokeStyle) : S_NONE));
		if(isstroke) { el.setAttribute(S_ATT_STROKEWIDTH, this.lineWidth, 'px');}
		if(this.isAA){ el.setAttribute(S_ATT_RENDERING, 'auto'); this.isAA = false;}

		this.target.appendChild(el);
		break;

	case SL:
		var ar = ['<Path Data="', path ,'"'];
		if(isfill)  { ar.push(' Fill="', parsecolor(this.fillStyle), '"');}
		if(isstroke){ ar.push(' Stroke="', parsecolor(this.strokeStyle), '" StrokeThickness="', this.lineWidth, '"');}
		ar.push(' />');

		var xaml = this.content.createFromXaml(ar.join(''));
		if(!!this.vid){ this.elements[this.vid] = xaml;}
		this.target.children.add(xaml);
		break;

	case VML:
		path = [path, (!isfill ? V_PATH_NOFILL : EMPTY), (!isstroke ? V_PATH_NOSTROKE : EMPTY)].join('');
		var ar = [V_TAG_SHAPE];
		if(!!this.vid){ ar = [V_TAG_SHAPE, V_ATT_ID, this.vid, V_ATT_END]; }
		ar.push(V_ATT_COORDSIZE, V_ATT_PATH, path, V_ATT_END);
		if(isfill)  { ar.push(V_ATT_FILLCOLOR, parsecolor(this.fillStyle), V_ATT_END);}
		if(isstroke){ ar.push(V_ATT_STROKECOLOR, parsecolor(this.strokeStyle), V_ATT_END, V_ATT_STROKEWEIGHT, this.lineWidth, 'px', V_ATT_END);}
		ar.push(V_TAGEND_NULL);

		this.target.insertAdjacentHTML(BEFOREEND, ar.join(''));
		if(!!this.vid){ this.elements[this.vid] = _doc.getElementById(this.vid);}
		break;
	}}
};

/* -------------------- */
/*   Canvas追加関数群   */
/* -------------------- */
CanvasRenderingContext2D_wrapper = function(idname, type){
	// canvasに存在するプロパティ＆デフォルト値
	this.fillStyle    = 'black';
	this.strokeStyle  = 'black';
	this.lineWidth    = 1;
	this.textAlign    = 'center';
	this.textBaseline = 'middle';

	this.OFFSETX = 0;
	this.OFFSETY = 0;

	this.vml    = (type===VML);
	this.svg    = false;
	this.canvas = (type===CANVAS);
	this.sl     = (type===SL);
	this.flash  = (type===FLASH);

	this.initElement(idname);
};

//function addCanvasFunctions(){ _extend(CanvasRenderingContext2D.prototype, {
CanvasRenderingContext2D_wrapper.prototype = {
	/* extend functions (initialize) */
	initElement : function(idname){
		this.canvasid = EL_ID_HEADER+idname;

		var parent = _doc.getElementById(idname);
		var canvas = _doc.getElementById(this.canvasid);

		var rect = getRectSize(parent);
		canvas.width  = rect.width;
		canvas.height = rect.height;
		canvas.style.position = 'relative';
		canvas.style.width  = rect.width + 'px';
		canvas.style.height = rect.height + 'px';

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
		}

		this.parent = parent;
	},
	setLayer    : function(layerid){ },
	getContextElement : function(){ return _doc.getElementById(this.canvasid);},
	getLayerElement   : function(){ return _doc.getElementById(this.canvasid);},

	changeSize : function(width,height){
		this.parent.style.width  = width + 'px';
		this.parent.style.height = height + 'px';
//		this.changeCanvasSize(width,height);

		var canvas = this.parent.firstChild;
		var left = parseInt(canvas.style.left), top = parseInt(canvas.style.top);
		width += (left<0?-left:0); height += (top<0?-top:0);
		canvas.style.width  = width + 'px';
		canvas.style.height = height + 'px';
		canvas.width  = width;
		canvas.height = height;
	},
	changeOrigin : function(left,top){
		var canvas = this.parent.firstChild;
		canvas.style.position = 'relative';
		canvas.style.left = (parseInt(canvas.style.left) - left) + 'px';
		canvas.style.top  = (parseInt(canvas.style.top ) - top)  + 'px';

		this.OFFSETX = -left;//(left<0?-left:0);
		this.OFFSETY = -top;//(top<0?-top:0);

//		this.changeCanvasSize(parseInt(canvas.style.width), parseInt(canvas.style.height));
	},
//	changeCanvasSize : function(width,height){
//		var canvas = this.parent.firstChild;
//		var left = parseInt(canvas.style.left), top = parseInt(canvas.style.top);
//		width += (left<0?-left:0); height += (top<0?-top:0);
//		canvas.style.width  = width + 'px';
//		canvas.style.height = height + 'px';
//		canvas.width  = width;
//		canvas.height = height;
//	},
	setProperties : function(){
		this.context.fillStyle    = this.fillStyle;
		this.context.strokeStyle  = this.strokeStyle;
		this.context.lineWidth    = this.lineWidth;
		//this.textAlign    = this.textAlign    = 'center';
		//this.textBaseline = this.textBaseline = 'middle';
	},

	/* Canvas API functions (for path) */
	beginPath : function(){ this.context.beginPath();},
	closePath : function(){ this.context.closePath();},
	moveTo : function(x,y){ this.context.moveTo(x+this.OFFSETX,y+this.OFFSETY);},
	lineTo : function(x,y){ this.context.lineTo(x+this.OFFSETX,y+this.OFFSETY);},
	arc : function(cx,cy,r,startRad,endRad,antiClockWise){
		this.context.arc(cx+this.OFFSETX,cy+this.OFFSETY,r,startRad,endRad,antiClockWise);
	},

	/* Canvas API functions (for drawing) */
	fill       : function(){ this.setProperties(); this.context.fill();},
	stroke     : function(){ this.setProperties(); this.context.stroke();},
	fillRect   : function(x,y,w,h){ this.setProperties(); this.context.fillRect(x+this.OFFSETX,y+this.OFFSETY,w,h);},
	strokeRect : function(x,y,w,h){ this.setProperties(); this.context.strokeRect(x+this.OFFSETX,y+this.OFFSETY,w,h);},
	fillText   : function(text,x,y){ this.setProperties(); this.context.fillText(text,x+this.OFFSETX,y+this.OFFSETY);},

	/* extended functions */
	fillstroke : function(){
		this.setProperties();
		this.context.fill();
		this.context.stroke();
	},

	setLinePath : function(){
		var _args = arguments, _len = _args.length;
		for(var i=0,len=_len-((_len|1)?1:2);i<len;i+=2){
			if(i==0){ this.context.moveTo(_args[i],_args[i+1]);}
			else    { this.context.lineTo(_args[i],_args[i+1]);}
		}
		if(_args[_len-1]){ this.context.closePath();}
	},
	setOffsetLinePath : function(){
		var _args = arguments, _len = _args.length, m=[];
		for(var i=2,len=_len-((_len|1)?1:2);i<len;i+=2){
			m[i] = _args[i] + m[0];
			m[i+1] = _args[i+1] + m[1];
		}
		for(var i=0,len=_len-((_len|1)?1:2);i<len;i+=2){
			if(i==0){ this.context.moveTo(_args[i],_args[i+1]);}
			else    { this.context.lineTo(_args[i],_args[i+1]);}
		}
		if(_args[_len-1]){ this.context.closePath();}
	},
	setDashSize : function(size){ },

	strokeLine : function(x1,y1,x2,y2){
		this.setProperties();
		this.context.beginPath();
		this.context.moveTo(x1+this.OFFSETX,y1+this.OFFSETY);
		this.context.lineTo(x2+this.OFFSETX,y2+this.OFFSETY);
		this.context.stroke();
	},
	strokeCross : function(cx,cy,l){
		this.setProperties();
		this.context.beginPath();
		this.context.moveTo(cx-l+this.OFFSETX,cy-l+this.OFFSETY);
		this.context.lineTo(cx+l+this.OFFSETX,cy+l+this.OFFSETY);
		this.context.moveTo(cx-l+this.OFFSETX,cy+l+this.OFFSETY);
		this.context.lineTo(cx+l+this.OFFSETX,cy-l+this.OFFSETY);
		this.context.stroke();
	},
	fillCircle : function(cx,cy,r){
		this.setProperties();
		this.context.beginPath();
		this.context.arc(cx+this.OFFSETX,cy+this.OFFSETY,r,0,_2PI,false);
		this.context.fill();
	},
	strokeCircle : function(cx,cy,r){
		this.setProperties();
		this.context.beginPath();
		this.context.arc(cx+this.OFFSETX,cy+this.OFFSETY,r,0,_2PI,false);
		this.context.stroke();
	},

	clearCanvas : function(){
		if(!!this.parent.style.backgroundColor){
			this.setProperties();
			this.context.fillStyle = parsecolorrev(this.parent.style.backgroundColor);
			var rect = getRectSize(this.parent);
			this.context.fillRect(this.OFFSETX,this.OFFSETY,rect.width,rect.height);
		}
	}

};

/* ------------------------------ */
/*   ContextManagerオブジェクト   */
/* ------------------------------ */
var ContextManager = (function(){
	var _doc = document, o = {};

	/* Selected & Enable types */
	o.current = {};
	o.enable  = {};

	/* externs */
	o.color = _color;
	o.parse = parsecolor;

	o.initAllElement = function(){
		this.initElementsByClassName('canvas');
	};
	o.initElementsByClassName = function(classname){
		var elements = _doc.getElementsByTagName('div');
		for(var i=0;i<elements.length;i++){
			if(elements[i].className.match(classname)){ this.initElementById(elements[i].id);}
		}
	};
	o.initElementsById = function(idlist){
		for(var i=0;i<idlist.length;i++){ this.initElementById(idlist[i]);}
	};
	o.initElementById = function(idname){
		var canvasid = EL_ID_HEADER + idname;
		if(!!_doc.getElementById(canvasid)){ return;}

		if     (this.current.vml){ new VectorContext(VML, idname);}
		else if(this.current.svg){ new VectorContext(SVG, idname);}
		else if(this.current.sl) { new VectorContext(SL,  idname);}
		else if(this.current.canvas){
			var parent = _doc.getElementById(idname);
			canvas = _doc.createElement('canvas');
			canvas.id = canvasid;
			parent.appendChild(canvas);

			new CanvasRenderingContext2D_wrapper(idname, CANVAS);
		}
	};
	o.select = function(type){
		if(this.enable[type]!==true){ return false;}
		for(var i=0;i<_types.length;i++){ o.current[_types[i]]=false;}
		this.current[type] = true;
		return true;
	};

	// この関数は、ContextManager.jsが読み込まれた時に一回だけ実行されます。
	(function(){
		o.enable.canvas = (!!_doc.createElement('canvas').getContext);
		o.enable.svg    = (!!_doc.createElementNS && !!_doc.createElementNS(SVGNS, 'svg').suspendRedraw);
		o.enable.sl     = (function(){ try{ return (new ActiveXObject("AgControl.AgControl")).IsVersionSupported("1.0");}catch(e){} return false;})();
		o.enable.flash  = false;
		o.enable.vml    = _IE;

		if(o.enable.vml){
			/* addNameSpace for VML */
			_doc.namespaces.add("v", "urn:schemas-microsoft-com:vml");

			/* addStyleSheet for VML */
			var text = [];
			text.push("v\\:group { behavior: url(#default#VML); display:inline; position:absolute; width:100%; height:100%; overflow:hidden; }");
			text.push("v\\:shape { behavior: url(#default#VML); position:absolute; width:10px; height:10px; }");
			text.push("v\\:textbox, v\\:stroke { behavior: url(#default#VML); }");
			_doc.createStyleSheet().cssText = text.join('');
		}

		for(var i=0;i<_types.length;i++){ o.current[_types[i]]=false;}
		if     (o.enable.svg)   { o.current.svg    = true;}
		else if(o.enable.canvas){ o.current.canvas = true;}
		else if(o.enable.sl)    { o.current.sl     = true;}
		else if(o.enable.flash) { o.current.flash  = true;}
		else if(o.enable.vml)   { o.current.vml    = true;}
	})();

	return o;
})();

/* extern */
_win.ContextManager = ContextManager;

})();
