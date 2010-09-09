//
// パズル固有スクリプト部 ヤギとオオカミ版 shwolf.js v3.3.2
//
Puzzles.shwolf = function(){ };
Puzzles.shwolf.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}
		if(!k.qrows){ k.qrows = 10;}

		k.iscross  = 1;
		k.isborder = 1;

		k.hasroom         = true;
		k.isDispHatena    = true;
		k.isInputHatena   = true;
		k.inputQnumDirect = true;
		k.numberAsObject  = true;

		k.ispzprv3ONLY    = true;

		base.setTitle("ヤギとオオカミ","Sheeps and Wolves");
		base.setFloatbgcolor("rgb(96, 96, 96)");
	},
	menufix : function(){ },
	finalfix : function(){
		if(base.enableSaveImage){
			if(k.br.Gecko && !location.hostname){
				ee('ms_imagesavep').el.className = 'smenunull';
			}
		}
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(k.editmode) this.inputcrossMark();
			else if(k.playmode){
				if(this.btn.Left) this.inputborderans();
				else if(this.btn.Right) this.inputQsubLine();
			}
		};
		mv.mouseup = function(){
			if(this.notInputted()){
				if(k.editmode) this.inputqnum();
			}
		};
		mv.mousemove = function(){
			if(k.playmode){
				if(this.btn.Left) this.inputborderans();
				else if(this.btn.Right) this.inputQsubLine();
			}
		};
		// オーバーライド
		mv.inputBD = function(flag){
			var pos = this.borderpos(0.35);
			if(this.prevPos.equals(pos)){ return;}

			var id = this.getborderID(this.prevPos, pos);
			if(id!==null){
				if(this.inputData===null){ this.inputData=(bd.isBorder(id)?0:1);}

				var d = this.getrange(id);
				var idlist = new IDList(bd.borderinside(d.x1,d.y1,d.x2,d.y2));
				for(var i=0;i<idlist.data.length;i++){
					if     (this.inputData===1){ bd.setBorder(idlist.data[i]);}
					else if(this.inputData===0){ bd.removeBorder(idlist.data[i]);}
				}

				pc.paintRange(d.x1-1,d.y1-1,d.x2+1,d.y2+1);
			}
			this.prevPos = pos;
		};
		mv.getrange = function(id){
			var bx=bd.border[id].bx, by=bd.border[id].by;
			var d = {x1:bx, x2:bx, y1:by, y2:by};
			if(bd.border[id].bx&1){
				while(d.x1>bd.minbx && bd.QnX(bd.xnum(d.x1-1,by))!==1){d.x1-=2;}
				while(d.x2<bd.maxbx && bd.QnX(bd.xnum(d.x2+1,by))!==1){d.x2+=2;}
			}
			else if(bd.border[id].by&1){
				while(d.y1>bd.minby && bd.QnX(bd.xnum(bx,d.y1-1))!==1){d.y1-=2;}
				while(d.y2<bd.maxby && bd.QnX(bd.xnum(bx,d.y2+1))!==1){d.y2+=2;}
			}
			return d;
		};

		// キーボード入力系
		kc.keyinput = function(ca){ };

		bd.maxnum = 2;
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_DLIGHT;
		pc.borderQanscolor = "rgb(64, 64, 255)";
		pc.setBorderColorFunc('qans');

		pc.crosssize = 0.15;
		pc.imgobj = new ImageManager_shwolf();

		pc.paint = function(){
			this.drawBGCells();
			this.drawDashedGrid();
			this.drawBorders();

			this.drawSheepWolf();
			this.drawCrossMarks();

			this.drawBorderQsubs();

			this.drawChassis();
		};

		// numobj:？表示用 numobj2:画像表示用
		pc.drawSheepWolf = function(){
			this.vinc('cell_number_image', 'auto');

			var clist = this.range.cells;
			for(var i=0;i<clist.length;i++){
				var c = clist[i], obj = bd.cell[c];
				var keyques = ['cell',c].join('_'), keyimg = ['cell',c,'quesimg'].join('_');
				if(obj.qnum===-2){
					this.dispnum(keyques, 1, "?", 0.8, this.fontcolor, obj.cpx, obj.cpy);
				}
				else{ this.hideEL(keyques);}

				if(obj.qnum>0){
					this.dispimage1(keyimg, c);
				}
				else{ this.hideEL(keyimg);}
			}
		};
		pc.dispimage1 = function(key, c){
			var xpos = bd.cell[c].qnum-1, ypos=0;

			if(!this.fillTextPrecisely){
				var img = this.numobj[key];
				if(!img){
					img = this.numobj[key] = ee.createEL(this.EL_IMGOBJ, '');
					img.src = this.imgobj.src;
					img.style.width  = ""+(this.imgobj.cols*this.cw)+"px";
					img.style.height = ""+(this.imgobj.rows*this.ch)+"px";
				}
				img.style.left   = ((pc.pageX + bd.cell[c].px+1 - xpos*this.cw)|0)+"px";
				img.style.top    = ((pc.pageY + bd.cell[c].py+1 - ypos*this.cw)|0)+"px";
				img.style.clip   = "rect("+((this.cw*ypos+1)|0)+"px,"+((this.cw*(xpos+1))|0)+"px,"+((this.cw*(ypos+1))|0)+"px,"+((this.cw*xpos+1)|0)+"px)";
				this.showEL(key);
			}
			else{
				// Camp.jsにg.drawImageが未実装です。。
				var iobj = this.imgobj;
				g.context.drawImage(iobj.image, xpos*iobj.cw, ypos*iobj.ch, iobj.cw, iobj.ch,
												bd.cell[c].px, bd.cell[c].py, this.cw, this.ch);
			}
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decodeCrossMark();
			this.decodeCircle();
		};
		enc.pzlexport = function(type){
			this.encodeCrossMark();
			this.encodeCircle();
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeCellQnum();
			this.decodeCrossNum();
			this.decodeBorderAns();
		};
		fio.encodeData = function(){
			this.encodeCellQnum();
			this.encodeCrossNum();
			this.encodeBorderAns();
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

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

			var rinfo = area.getRoomInfo();
			if( !this.checkNoNumber(rinfo) ){
				this.setAlert('ヤギもオオカミもいない領域があります。','An area has neither sheeps nor wolves.'); return false;
			}

			if( !this.checkSameObjectInRoom(rinfo, bd.getNum) ){
				this.setAlert('ヤギとオオカミが両方いる領域があります。','An area has both sheeps and wolves.'); return false;
			}

			if( !this.checkLcntCross(1,0) ){
				this.setAlert('途中で途切れている線があります。','There is a dead-end line.'); return false;
			}

			return true;
		};
		ans.check1st = function(){ return this.checkLcntCross(1,0);};

		ans.checkLcntCurve = function(){
			var result = true;
			for(var bx=bd.minbx+2;bx<=bd.maxbx-2;bx+=2){
				for(var by=bd.minby+2;by<=bd.maxby-2;by+=2){
					var xc = bd.xnum(bx,by);
					if(area.lcntCross(xc)===2 && bd.QnX(xc)!==1){
						if(    !(bd.QaB(bd.bnum(bx  ,by-1))===1 && bd.QaB(bd.bnum(bx  ,by+1))===1)
							&& !(bd.QaB(bd.bnum(bx-1,by  ))===1 && bd.QaB(bd.bnum(bx+1,by  ))===1) )
						{
							if(this.inAutoCheck){ return false;}
							this.setCrossBorderError(bx,by);
							result = false;
						}
					}
				}
			}
			return result;
		};

		ans.checkLineChassis = function(){
			var result = true;
			var lines = [];
			for(var id=0;id<bd.bdmax;id++){ lines[id]=bd.QaB(id);}
			for(var bx=bd.minbx;bx<=bd.maxbx;bx+=2){
				for(var by=bd.minby;by<=bd.maxby;by+=2){
					if((bx===bd.minbx||bx===bd.maxbx)^(by===bd.minby||by===bd.maxby)){
						if     (by===bd.minby){ this.cl0(lines,bx,by,2);}
						else if(by===bd.maxby){ this.cl0(lines,bx,by,1);}
						else if(bx===bd.minbx){ this.cl0(lines,bx,by,4);}
						else if(bx===bd.maxbx){ this.cl0(lines,bx,by,3);}
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
		};
		ans.cl0 = function(lines,bx,by,dir){
			while(1){
				switch(dir){ case 1: by--; break; case 2: by++; break; case 3: bx--; break; case 4: bx++; break;}
				if(!((bx+by)&1)){
					var xc = bd.xnum(bx,by), id;
					if(xc!==null && bd.QnX(xc)===1){
						id=bd.bnum(bx,by-1); if(id!==null && bd.border[id].qans===1){ this.cl0(lines,bx,by,1);}
						id=bd.bnum(bx,by+1); if(id!==null && bd.border[id].qans===1){ this.cl0(lines,bx,by,2);}
						id=bd.bnum(bx-1,by); if(id!==null && bd.border[id].qans===1){ this.cl0(lines,bx,by,3);}
						id=bd.bnum(bx+1,by); if(id!==null && bd.border[id].qans===1){ this.cl0(lines,bx,by,4);}
						break;
					}
				}
				else{
					var id = bd.bnum(bx,by);
					if(id===null || lines[id]===0){ break;}
					lines[id]=0;
				}
			}
		};
	}
};

ImageManager_shwolf = function(){
	this.src = './src/img/shwolf_obj.gif';

	this.image = new Image();
	this.image.src = this.src;

	this.cols = 2;
	this.rows = 1;

	this.cw = this.image.width/this.cols;
	this.ch = this.image.height/this.rows;
};
