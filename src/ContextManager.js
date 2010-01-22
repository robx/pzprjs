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

	flags = {
		debugmode : false,
		useUC     : false, // uuCanvas(SlverLightモード)
		pathUC    : 'src/uuCanvas.js',
		useFC     : false, // FlashCanvas.js
		pathFC    : 'flashcanvas.js'
	},

	BEFOREEND = 'BeforeEnd';

/* ------------ */
/*   共通関数   */
/* ------------ */
function getRectSize(el){
	return { width :(el.offsetWidth  || el.clientWidth),
			 height:(el.offsetHeight || el.clientHeight)};
}
function parsecolor(rgbstr){
	if(rgbstr.match(/rgb\(/)){
		var m = rgbstr.match(/\d+/g);
		for(var i=0;i<m.length;i++){ m[i]=parseInt(m[i]).toString(16);}
		return ["#",m[0],m[1],m[2]].join('');
	}
	return rgbstr;
}
function parsecolorrev(colorstr){
	if(colorstr.match(/\#([0-9a-f][0-9a-f])([0-9a-f][0-9a-f])([0-9a-f][0-9a-f])/)){
		var m0 = parseInt(RegExp.$1,16).toString();
		var m1 = parseInt(RegExp.$2,16).toString();
		var m2 = parseInt(RegExp.$3,16).toString();
		return ["rgb(",m[0],',',m[1],',',m[2],")"].join('');
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
	V_PATH_NOFILL   = ' nf',

	V_DEF_LINEWIDTH = 1;

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
var VML = 0,
	SVG = 3,

	EL_ID_HEADER = "canvas_o_",

	DEF_LINEWIDTH = 1;

/* ----------------------- */
/*   VectorContextクラス   */
/* ----------------------- */
var VectorContext = function(type, idname){
	// canvasに存在するプロパティ＆デフォルト値
	this.fillStyle    = 'black';
	this.strokeStyle  = 'black';
	this.lineWidth    = DEF_LINEWIDTH;
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

	// define const
	if(this.type===SVG){
		this.PATH_MOVE  = S_PATH_MOVE;
		this.PATH_LINE  = S_PATH_LINE;
		this.PATH_CLOSE = S_PATH_CLOSE;
	}
	else if(this.type===VML){
		this.PATH_MOVE  = V_PATH_MOVE;
		this.PATH_LINE  = V_PATH_LINE;
		this.PATH_CLOSE = V_PATH_CLOSE;
	}

	this.initElement(idname);
};
VectorContext.prototype = {
	/* additional functions (for initialize) */
	initElement : function(idname){
		var child = _doc.getElementById(this.canvasid);

		if(!child){
			var parent = _doc.getElementById(idname);
			var rect = getRectSize(parent);
			if     (this.type===SVG){ child = this.appendSVG(parent,rect.width,rect.height);}
			else if(this.type===VML){ child = this.appendVML(parent,rect.width,rect.height);}
			parent.appendChild(child);

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

		return svgtop;
	},
	appendVML : function(parent, width, height){
		var vmltop = _doc.createElement('v:group');
		vmltop.id = this.canvasid;
//		vmltop.unselectable = 'on';

		vmltop.style.position = 'relative';
		vmltop.style.left   = '-2px';
		vmltop.style.top    = '-2px';
		vmltop.style.width  = width + 'px';
		vmltop.style.height = height + 'px';
		vmltop.coordsize = [width*Z, height*Z].join(',');

		return vmltop;
	},
	setLayer : function(layerid){
		if(!!layerid){
			var lid = [this.canvasid,"layer",layerid].join('_');
			var layer = _doc.getElementById(lid);
			if(!layer){
				if(this.type===SVG){
					layer = _doc.createElementNS(SVGNS,'g');
					layer.setAttribute('id', lid);
					layer.setAttribute('unselectable', 'on');
				}
				else{
					layer = _doc.createElement('v:group');
					layer.id = lid;
					layer.unselectable = 'on';
				}

				this.initElement(this.idname);
				this.target.appendChild(layer);
			}
			this.target = layer;
		}
		else{ this.initElement(this.idname);}
	},
	getContextElement : function(){ return document.getElementById(this.canvasid);},
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
		else if(this.type==VML){
			child.style.width  = width + 'px';
			child.style.height = height + 'px';
			child.coordsize = [width*Z, height*Z].join(',');
		}
		this.clearCanvas();
	},
	changeOrigin : function(left,top){
		var child = this.parent.firstChild;
		if(this.type===SVG){
			var m = child.getAttribute('viewBox').split(/ /);
			m[0]=left, m[1]=top;
			child.setAttribute('viewBox', m.join(' '));
		}
		else if(this.type==VML){
			child.coordorigin = [left*Z, top*Z].join(',');
		}
	},
	clearCanvas : function(){
		document.getElementById(this.idname).innerHTML = '';
		this.elements = [];
		this.initElement(this.idname);
	},

	setColor : function(rgbstr){
		if(this.vid){
			var el = this.elements[this.vid];
			var color = parsecolor(rgbstr);
			if(this.type===SVG){
				if     (el.fill  !=='none'){ el.setAttribute('fill',  color);}
				else if(el.stroke!=='none'){ el.setAttribute('stroke',color);}
			}
			else if(this.type===VML){
				if     (!!el.fillcolor)  { el.fillcolor   = color;}
				else if(!!el.strokecolor){ el.strokecolor = color;}
			}
		}
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
		if(this.type===SVG){ this.currentpath.push(this.PATH_MOVE,x,y);}else{ this.currentpath.push(this.PATH_MOVE,x*Z-Z2,y*Z-Z2);}
		this.lastpath = this.PATH_MOVE;
	},
	lineTo : function(x,y){
		if(this.lastpath!==this.PATH_LINE){ this.currentpath.push(this.PATH_LINE);}
		if(this.type===SVG){ this.currentpath.push(x,y);}else{ this.currentpath.push(x*Z-Z2,y*Z-Z2);}
		this.lastpath = this.PATH_LINE;
	},
	arc : function(cx,cy,r,startRad,endRad,antiClockWise){
		if(this.type===VML){ cx=cx*Z-Z2, cy=cy*Z-Z2, r=r*Z;}
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

	case VML:
		var ar = [V_TAG_SHAPE];
		ar.push(V_ATT_STYLE, V_STYLE_LEFT,(x*Z-Z2),V_STYLE_END, V_STYLE_TOP,(y*Z-Z2),V_STYLE_END, V_ATT_END);
		ar.push(V_ATT_PATH, this.pathRect([x,y,200,30]), V_PATH_CLOSE, V_PATH_NOFILL, V_PATH_NOSTROKE, V_ATT_END);
		ar.push(V_TAGEND);

		ar.push(V_TAG_TEXTBOX);
		if(!!this.vid){ ar.push(V_ATT_ID, this.vid, V_ATT_END); }
		ar.push(V_ATT_STYLE_TEXTBOX, V_TAGEND, text, V_CLOSETAG_TEXTBOX);

		ar.push(V_CLOSETAG_SHAPE);

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
		var _args = arguments, _len = _args.length, svg=(this.type===SVG);
		this.currentpath = [];
		for(var i=0,len=_len-((_len|1)?1:2);i<len;i+=2){
			if     (i==0){ this.currentpath.push(this.PATH_MOVE);}
			else if(i==2){ this.currentpath.push(this.PATH_LINE);}
			this.currentpath.push((svg?_args[i]:_args[i]*Z-Z2), (svg?_args[i+1]:_args[i+1]*Z-Z2));
		}
		if(_args[_len-1]){ this.currentpath.push(this.PATH_CLOSE);}
	},
	setOffsetLinePath : function(){
		var _args = arguments, _len = _args.length, svg=(this.type===SVG), m=[_args[0],_args[1]];
		this.currentpath = [];
		for(var i=2,len=_len-((_len|1)?1:2);i<len;i+=2){
			m[i] = _args[i] + m[0];
			m[i+1] = _args[i+1] + m[1];
		}
		for(var i=0,len=_len-((_len|1)?1:2);i<len;i+=2){
			if     (i==0){ this.currentpath.push(this.PATH_MOVE);}
			else if(i==2){ this.currentpath.push(this.PATH_LINE);}
			this.currentpath.push((svg?m[i]:m[i]*Z-Z2), (svg?m[i+1]:m[i+1]*Z-Z2));
		}
		if(_args[_len-1]){ this.currentpath.push(this.PATH_CLOSE);}
	},

	strokeLine : function(x1,y1,x2,y2){
		if(this.type===VML){ x1=x1*Z-Z2, y1=y1*Z-Z2, x2=x2*Z-Z2, y2=y2*Z-Z2;}
		var stack = this.currentpath;
		this.currentpath = [this.PATH_MOVE,x1,y1,this.PATH_LINE,x2,y2];
		this.addVectorElement(false,false,true,[]);
		this.currentpath = stack;
	},
	strokeCross : function(cx,cy,l){
		if(this.type===VML){ cx=cx*Z-Z2, cy=cy*Z-Z2, l=l*Z;}
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

	addVectorElement : function(isrect,isfill,isstroke,size){ switch(this.type){
	case SVG:
		var el = _doc.createElementNS(SVGNS,'path');
		if(!!this.vid){ this.elements[this.vid] = el;}
		el.setAttribute(S_ATT_FILL,   (isfill ? parsecolor(this.fillStyle) : S_NONE));
		el.setAttribute(S_ATT_STROKE, (isstroke ? parsecolor(this.strokeStyle) : S_NONE));
		if(isstroke){
			el.setAttribute(S_ATT_STROKEWIDTH, (!!this.lineWidth ? this.lineWidth : S_DEF_LINEWIDTH)+'px');
		}
		if(this.lastpath==S_PATH_ARCTO){ el.setAttribute(S_ATT_RENDERING, 'auto');}
		el.setAttribute('d', (isrect ? this.pathRect(size) : this.currentpath.join(' ')));

		this.target.appendChild(el);
		break;

	case VML:
		var ar = [V_TAG_SHAPE];
		if(!!this.vid){ ar.push(V_ATT_ID, this.vid, V_ATT_END); }
		if(isfill){
			ar.push(V_ATT_FILLCOLOR, parsecolor(this.fillStyle), V_ATT_END);
		}
		if(isstroke){
			ar.push(V_ATT_STROKECOLOR, parsecolor(this.strokeStyle), V_ATT_END);
			ar.push(V_ATT_STROKEWEIGHT, (!!this.lineWidth ? this.lineWidth+'px' : V_DEF_LINEWIDTH+'px'), V_ATT_END);
		}
		ar.push(V_ATT_PATH, (isrect ? this.pathRect(size) : this.currentpath.join(' ')));
		if(!isfill)  { ar.push(V_PATH_NOFILL);}
		if(!isstroke){ ar.push(V_PATH_NOSTROKE);}
		ar.push(V_ATT_END);
		ar.push(V_TAGEND_NULL);
		this.target.insertAdjacentHTML(BEFOREEND, ar.join(''));
		if(!!this.vid){ this.elements[this.vid] = _doc.getElementById(this.vid);}
		break;
	}}
};

/* -------------------- */
/*   Canvas追加関数群   */
/* -------------------- */
CanvasRenderingContext2D_wrapper = function(idname){
	// canvasに存在するプロパティ＆デフォルト値
	this.fillStyle    = 'black';
	this.strokeStyle  = 'black';
	this.lineWidth    = DEF_LINEWIDTH;
	this.textAlign    = 'center';
	this.textBaseline = 'middle';

	this.context = null;
	this.OFFSETX = 0;
	this.OFFSETY = 0;

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
	setColor    : function(rgbstr) { },
	getContextElement : function(){ return document.getElementById(this.canvasid);},
	getLayerElement   : function(){ return document.getElementById(this.canvasid);},

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
		this.context.arc(cx+this.OFFSETX,cy+this.OFFSETY,r,startRad,endRad,antiCloskWise);
	},

	/* Canvas API functions (for drawing) */
	fill       : function(){ this.setProperties(); this.context.fill();},
	stroke     : function(){ this.setProperties(); this.context.stroke();},
	fillRect   : function(x,y,w,h){ this.setProperties(); this.context.fillRect(x+this.OFFSETX,y+this.OFFSETY,w,h);},
	strokeRect : function(x,y,w,h){ this.setProperties(); this.context.strokeRect(x+this.OFFSETX,y+this.OFFSETY,w,h);},
/*	fillText   : function(text,x,y){ this.setProperties(); this.context.fillText(text,x+this.OFFSETX,y+this.OFFSETY);},

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
		this.setProperties();
		this.context.fillStyle = parsecolorrev(this.parent.style.backgroundColor);
		alert(this.context.fillStyle);
		var rect = getRectSize(this.parent);
		this.context.fillRect(this.OFFSETX,this.OFFSETY,rect.width,rect.height);
	}

};

/* ------------------------------ */
/*   ContextManagerオブジェクト   */
/* ------------------------------ */
var ContextManager = (function(){
	var _doc = document,
		o = {};

	o.vml    = false;
	o.sl     = false;
	o.flash  = false;
	o.svg    = false;
	o.canvas = false;

	o.parse  = parsecolor;

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

		if(this.vml){
			new VectorContext(VML, idname);
		}
		else if(this.svg){
			new VectorContext(SVG, idname);
		}
		else if(this.canvas || this.sl || this.flash){
			/* 追加した後じゃないと、getContext～initElementできない */
			var parent = _doc.getElementById(idname);
			canvas = _doc.createElement('canvas');
			canvas.id = canvasid;
			parent.appendChild(canvas);

			if(this.canvas){
				new CanvasRenderingContext2D_wrapper(idname);
			}
			else if(this.sl){
				uuCanvas.init(canvas, false);
				parent.getContext = function(type){ return canvas.getContext(type);}
			}
			else if(this.flash){
				FlashCanvas.initElement(canvas);
				parent.getContext = function(type){ return canvas.getContext(type);}
			}
		}
	};
	o.select = function(type){
		if(this.vml || this.sl || this.flash){ return;}
		else if(this.svg && type=='canvas'){ this.svg=false; this.canvas=true; }
		else if(this.canvas && type=='svg'){ this.svg=true;  this.canvas=false;}
	};

	// この関数は、ContextManager.jsが読み込まれた時に一回だけ実行されます。
	(function(){
		var enableCanvas = (!!_doc.createElement('canvas').getContext);
		var enableSVG    = (!!_doc.createElementNS && !!_doc.createElementNS(SVGNS, 'svg').suspendRedraw);
		var enableFlash  = (flags.useFC);
		var enableSL     = (flags.useUC && _IE && (function(){
			try {
				var a=["1.0","2.0","3.0","4.0"], i=a.length, o=new ActiveXObject("AgControl.AgControl");
				while(i--){ if(o.IsVersionSupported(a[i])){ return true;} }
			} catch(e){}
			return false;
		})());

		if     (enableSVG)   { o.svg    = true;}
		else if(enableCanvas){ o.canvas = true;}
		else if(enableSL)    { o.sl     = true;}
		else if(enableFlash) { o.flash  = true;}
		else                 { o.vml    = true;}

		if(o.vml){
			/* addNameSpace for VML */
			_doc.namespaces.add("v", "urn:schemas-microsoft-com:vml");

			/* addStyleSheet for VML */
			var text = [];
			text.push("v\\:group { behavior: url(#default#VML); display:inline; position:absolute; width:100%; height:100%; overflow:hidden; }");
			text.push("v\\:shape { behavior: url(#default#VML); position:relative; width:100%; height:100%; }");
			text.push("v\\:textbox { behavior: url(#default#VML); }");
			_doc.createStyleSheet().cssText = text.join('');
		}
		if(o.sl){
			// uuCanvas.jsを有効にする
			_doc.write('<script type="text/xaml" id="xaml"><?xml version="1.0"?>\n');
			_doc.write('  <Canvas xmlns="http://schemas.microsoft.com/client/2007"></Canvas></script>\n');
			_doc.write(['<script type="text/javascript" src="',flags.pathUC,'"></script>\n'].join(''));
		}
		if(o.flash){
			// FlashCanvasを読み込む
			_doc.write(['<script type="text/javascript" src="',flags.pathFC,'"></script>\n'].join(''));
		}
	})();

	return o;
})();

/* extern */
_win.ContextManager = ContextManager;

})();
