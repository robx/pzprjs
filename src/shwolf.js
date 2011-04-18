//
// パズル固有スクリプト部 ヤギとオオカミ版 shwolf.js v3.4.0
//
pzprv3.custom.shwolf = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mousedown : function(){
		if(k.editmode){ this.inputcrossMark();}
		else if(k.playmode){
			if     (this.btn.Left) { this.inputborderans();}
			else if(this.btn.Right){ this.inputQsubLine();}
		}
	},
	mouseup : function(){
		if(this.notInputted()){
			if(k.editmode){ this.inputqnum();}
		}
	},
	mousemove : function(){
		if(k.playmode){
			if     (this.btn.Left) { this.inputborderans();}
			else if(this.btn.Right){ this.inputQsubLine();}
		}
	},

	// オーバーライド
	inputBD : function(flag){
		var pos = this.borderpos(0.35);
		if(this.prevPos.equals(pos)){ return;}

		var id = this.getborderID(this.prevPos, pos);
		if(id!==null){
			if(this.inputData===null){ this.inputData=(bd.isBorder(id)?0:1);}

			var d = bd.getlinesize(id);
			var idlist = new pzprv3.core.IDList(bd.borderinside(d.x1,d.y1,d.x2,d.y2));
			for(var i=0;i<idlist.data.length;i++){
				if     (this.inputData===1){ bd.setBorder(idlist.data[i]);}
				else if(this.inputData===0){ bd.removeBorder(idlist.data[i]);}
			}

			pc.paintRange(d.x1-1,d.y1-1,d.x2+1,d.y2+1);
		}
		this.prevPos = pos;
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true
},

//---------------------------------------------------------
// 盤面管理系
Board:{
	iscross  : 1,
	isborder : 1,

	numberAsObject : true,

	maxnum : 2,

	getlinesize : function(id){
		var bx=this.border[id].bx, by=this.border[id].by;
		var d = {x1:bx, x2:bx, y1:by, y2:by};
		if(this.border[id].bx&1){
			while(d.x1>this.minbx && this.QnX(this.xnum(d.x1-1,by))!==1){d.x1-=2;}
			while(d.x2<this.maxbx && this.QnX(this.xnum(d.x2+1,by))!==1){d.x2+=2;}
		}
		else if(this.border[id].by&1){
			while(d.y1>this.minby && this.QnX(this.xnum(bx,d.y1-1))!==1){d.y1-=2;}
			while(d.y2<this.maxby && this.QnX(this.xnum(bx,d.y2+1))!==1){d.y2+=2;}
		}
		return d;
	}
},

AreaManager:{
	hasroom : true
},

Menu:{
	menuinit : function(){
		this.SuperFunc.menuinit.call(this);
		if(base.dec.enableSaveImage){
			if(ee.br.Gecko && !location.hostname){
				ee('ms_imagesavep').el.className = 'smenunull';
			}
		}
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	setColors : function(){
		this.gridcolor = this.gridcolor_DLIGHT;
		this.borderQanscolor = "rgb(64, 64, 255)";
		this.setBorderColorFunc('qans');

		this.crosssize = 0.15;
		this.imgtile = new (pzprv3.getPuzzleClass('ImageTile'))('./src/img/shwolf_obj.png',2,1);
	},
	paint : function(){
		this.drawBGCells();
		this.drawDashedGrid();
		this.drawBorders();

		this.drawSheepWolf();
		this.drawCrossMarks();

		this.drawBorderQsubs();

		this.drawChassis();

		this.drawTarget();
	},

	// numobj:？表示用 numobj2:画像表示用
	drawSheepWolf : function(){
		this.vinc('cell_number_image', 'auto');

		if(!this.imgtile.loaded){
			var func = arguments.callee;
			setTimeout(function(){func.call(pc);},10);
			return;
		}

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var c = clist[i], obj = bd.cell[c];
			var keyques = ['cell',c].join('_'), keyimg = ['cell',c,'quesimg'].join('_');
			if(obj.qnum===-2){
				this.dispnum(keyques, 1, "?", 0.8, this.fontcolor, obj.cpx, obj.cpy);
			}
			else{ this.hidenum(keyques);}

			if(obj.qnum>0){
				this.vshow(keyimg);
				this.imgtile.putImage(bd.cell[c].qnum-1, g,obj.px,obj.py,this.cw,this.ch);
			}
			else{ this.vhide(keyimg);}
		}
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		this.decodeCrossMark();
		this.decodeCircle();
	},
	pzlexport : function(type){
		this.encodeCrossMark();
		this.encodeCircle();
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCellQnum();
		this.decodeCrossNum();
		this.decodeBorderAns();
	},
	encodeData : function(){
		this.encodeCellQnum();
		this.encodeCrossNum();
		this.encodeBorderAns();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.checkLcntCross(3,0) ){
			this.setAlert('分岐している線があります。','There is a branched line.'); return false;
		}
		if( !this.checkLcntCross(4,1) ){
			this.setAlert('線が黒点上で交差しています。','There is a crossing line on the black point.'); return false;
		}
		if( !this.checkLcntCurve() ){
			this.setAlert('線が黒点以外で曲がっています。','A line curves out of the black points.'); return false;
		}

		if( !this.checkLineChassis() ){
			this.setAlert('外枠につながっていない線があります。','A line doesn\'t connect to the chassis.'); return false;
		}

		var rinfo = bd.areas.getRoomInfo();
		if( !this.checkNoNumber(rinfo) ){
			this.setAlert('ヤギもオオカミもいない領域があります。','An area has neither sheeps nor wolves.'); return false;
		}

		if( !this.checkSameObjectInRoom(rinfo, function(c){ return bd.getNum(c);}) ){
			this.setAlert('ヤギとオオカミが両方いる領域があります。','An area has both sheeps and wolves.'); return false;
		}

		if( !this.checkLcntCross(1,0) ){
			this.setAlert('途中で途切れている線があります。','There is a dead-end line.'); return false;
		}

		return true;
	},
	check1st : function(){ return this.checkLcntCross(1,0);},

	checkLcntCurve : function(){
		var result = true;
		for(var bx=bd.minbx+2;bx<=bd.maxbx-2;bx+=2){
			for(var by=bd.minby+2;by<=bd.maxby-2;by+=2){
				var xc = bd.xnum(bx,by);
				if(bd.areas.lcntCross(xc)===2 && bd.QnX(xc)!==1){
					if(    !(bd.QaB(bd.bnum(bx  ,by-1))===1 && bd.QaB(bd.bnum(bx  ,by+1))===1)
						&& !(bd.QaB(bd.bnum(bx-1,by  ))===1 && bd.QaB(bd.bnum(bx+1,by  ))===1) )
					{
						if(this.inAutoCheck){ return false;}
						bd.setCrossBorderError(bx,by);
						result = false;
					}
				}
			}
		}
		return result;
	},

	checkLineChassis : function(){
		var result = true;
		var lines = [];
		for(var id=0;id<bd.bdmax;id++){ lines[id]=bd.QaB(id);}
		for(var bx=bd.minbx;bx<=bd.maxbx;bx+=2){
			for(var by=bd.minby;by<=bd.maxby;by+=2){
				/* 盤面端から探索をスタートする */
				if((bx===bd.minbx||bx===bd.maxbx)^(by===bd.minby||by===bd.maxby)){
					if     (by===bd.minby){ this.clearLineInfo(lines,bx,by,2);}
					else if(by===bd.maxby){ this.clearLineInfo(lines,bx,by,1);}
					else if(bx===bd.minbx){ this.clearLineInfo(lines,bx,by,4);}
					else if(bx===bd.maxbx){ this.clearLineInfo(lines,bx,by,3);}
				}
			}
		}
		for(var id=0;id<bd.bdmax;id++){
			if(lines[id]!==1){ continue;}

			if(this.inAutoCheck){ return false;}
			var errborder = [];
			for(var i=0;i<bd.bdmax;i++){ if(lines[i]==1){ errborder.push(i);} }
			if(result){ bd.sErBAll(2);}
			bd.sErB(errborder,1);
			result = false;
		}

		return result;
	},
	clearLineInfo : function(lines,bx,by,dir){
		while(1){
			switch(dir){ case 1: by--; break; case 2: by++; break; case 3: bx--; break; case 4: bx++; break;}
			if(!((bx+by)&1)){
				var xc = bd.xnum(bx,by), id;
				if(xc!==null && bd.QnX(xc)===1){
					id=bd.bnum(bx,by-1); if(id!==null && bd.border[id].qans===1){ this.clearLineInfo(lines,bx,by,1);}
					id=bd.bnum(bx,by+1); if(id!==null && bd.border[id].qans===1){ this.clearLineInfo(lines,bx,by,2);}
					id=bd.bnum(bx-1,by); if(id!==null && bd.border[id].qans===1){ this.clearLineInfo(lines,bx,by,3);}
					id=bd.bnum(bx+1,by); if(id!==null && bd.border[id].qans===1){ this.clearLineInfo(lines,bx,by,4);}
					break;
				}
			}
			else{
				var id = bd.bnum(bx,by);
				if(id===null || lines[id]===0){ break;}
				lines[id]=0;
			}
		}
	}
},

//---------------------------------------------------------
//---------------------------------------------------------
ImageTile:{
	initialize : function(src,col,row){
		this.image = new Image();
		this.image.src = src;

		this.cols = col;
		this.rows = row;

		this.width  = 0;
		this.height = 0;
		this.cw     = 0;
		this.ch     = 0;
		this.loaded = false;

		var self = this;
		setTimeout(function(){
			if(self.image.height>0){ self.load_func.call(self);}
			else{ setTimeout(arguments.callee,10);}
		},10);
	},
	load_func : function(){
		this.width  = this.image.width;
		this.height = this.image.height;
		this.cw     = this.width/this.cols;
		this.ch     = this.height/this.rows;
		this.loaded = true;
	},
	putImage : function(id,ctx,dx,dy,dw,dh){
		if(this.loaded){
			if(dw===(void 0)){ dw=this.cw; dh=this.ch;}
			var col=id%this.cols, row=(id/this.cols)|0;
			ctx.drawImage(this.image, col*this.cw,row*this.ch,this.cw,this.ch, dx,dy,dw,dh);
			return true;
		}
		return false;
	}
}
};
