//
// パズル固有スクリプト部 ヤギとオオカミ版 shwolf.js v3.3.0
//
Puzzles.shwolf = function(){ };
Puzzles.shwolf.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}	// 盤面の横幅
		if(!k.qrows){ k.qrows = 10;}	// 盤面の縦幅
		k.irowake  = 0;		// 0:色分け設定無し 1:色分けしない 2:色分けする

		k.iscross  = 1;		// 1:盤面内側のCrossがあるパズル 2:外枠上を含めてCrossがあるパズル
		k.isborder = 1;		// 1:Border/Lineが操作可能なパズル 2:外枠上も操作可能なパズル
		k.isexcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

		k.isLineCross     = false;	// 線が交差するパズル
		k.isCenterLine    = false;	// マスの真ん中を通る線を回答として入力するパズル
		k.isborderAsLine  = false;	// 境界線をlineとして扱う
		k.hasroom         = true;	// いくつかの領域に分かれている/分けるパズル
		k.roomNumber      = false;	// 部屋の問題の数字が1つだけ入るパズル

		k.dispzero        = false;	// 0を表示するかどうか
		k.isDispHatena    = true;	// qnumが-2のときに？を表示する
		k.isAnsNumber     = false;	// 回答に数字を入力するパズル
		k.NumberWithMB    = false;	// 回答の数字と○×が入るパズル
		k.linkNumber      = false;	// 数字がひとつながりになるパズル

		k.BlackCell       = false;	// 黒マスを入力するパズル
		k.NumberIsWhite   = false;	// 数字のあるマスが黒マスにならないパズル
		k.RBBlackCell     = false;	// 連黒分断禁のパズル
		k.checkBlackCell  = false;	// 正答判定で黒マスの情報をチェックするパズル
		k.checkWhiteCell  = false;	// 正答判定で白マスの情報をチェックするパズル

		k.ispzprv3ONLY    = true;	// ぱずぷれアプレットには存在しないパズル
		k.isKanpenExist   = false;	// pencilbox/カンペンにあるパズル

		base.setTitle("ヤギとオオカミ","Sheeps and Wolves");
		base.setExpression("　左ドラッグで境界線が、右ドラッグで補助記号が入力できます。",
						   " Left Button Drag to input border lines, Right to input auxiliary marks.");
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
				if(k.editmode) this.inputQues([0,41,42,-2]);
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
			if(pos.x==this.mouseCell.x && pos.y==this.mouseCell.y){ return;}

			var id = bd.bnum(pos.x, pos.y);
			if(id===-1 && this.mouseCell.x){ id = bd.bnum(this.mouseCell.x, this.mouseCell.y);}

			if(this.mouseCell!=-1 && id!=-1){
				if((!(pos.x&1) && this.mouseCell.x===pos.x && Math.abs(this.mouseCell.y-pos.y)===1) ||
				   (!(pos.y&1) && this.mouseCell.y===pos.y && Math.abs(this.mouseCell.x-pos.x)===1) )
				{
					this.mouseCell=-1
					if(this.inputData==-1){ this.inputData=(bd.isBorder(id)?0:1);}

					var idlist = [id];
					var bx1, bx2, by1, by2;
					if(bd.border[id].bx&1){
						var bx = bd.border[id].bx;
						while(bx>bd.minbx){ if(bd.QnX(bd.xnum(bx-1,bd.border[id].by))===1){ break;} bx-=2;} bx1 = bx;
						while(bx<bd.maxbx){ if(bd.QnX(bd.xnum(bx+1,bd.border[id].by))===1){ break;} bx+=2;} bx2 = bx;
						by1 = by2 = bd.border[id].by;
					}
					else if(bd.border[id].by&1){
						var by = bd.border[id].by;
						while(by>bd.minby){ if(bd.QnX(bd.xnum(bd.border[id].bx,by-1))===1){ break;} by-=2;} by1 = by;
						while(by<bd.maxby){ if(bd.QnX(bd.xnum(bd.border[id].bx,by+1))===1){ break;} by+=2;} by2 = by;
						bx1 = bx2 = bd.border[id].bx;
					}
					idlist = [];
					for(var i=bx1;i<=bx2;i+=2){ for(var j=by1;j<=by2;j+=2){ idlist.push(bd.bnum(i,j)); } }

					for(var i=0;i<idlist.length;i++){
						if(idlist[i]===-1){ continue;}
						if     (this.inputData==1){ bd.setBorder(idlist[i]);}
						else if(this.inputData==0){ bd.removeBorder(idlist[i]);}
						pc.paintBorder(idlist[i]);
					}
				}
			}
			this.mouseCell = pos;
		};
		mv.inputQuesDirectly = true;

		// キーボード入力系
		kc.keyinput = function(ca){ };
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_DLIGHT;
		pc.borderQanscolor = "rgb(64, 64, 255)";
		pc.setBorderColorFunc('qans');

		pc.crosssize = 0.15;
		pc.imgobj = new ImageManager_shwolf();

		pc.paint = function(x1,y1,x2,y2){
			this.drawBGCells(x1,y1,x2,y2);
			this.drawDashedGrid(x1,y1,x2,y2);
			this.drawBorders(x1,y1,x2,y2);

			this.drawSheepWolf(x1,y1,x2,y2);
			this.drawCrossMarks(x1,y1,x2+1,y2+1);

			this.drawBorderQsubs(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);
		};

		// numobj:？表示用 numobj2:画像表示用
		pc.drawSheepWolf = function(x1,y1,x2,y2){
			this.vinc('cell_number_image', 'auto');

			var clist = bd.cellinside(x1,y1,x2,y2);
			for(var i=0;i<clist.length;i++){
				var c = clist[i], obj = bd.cell[c];
				var keyques = ['cell',c].join('_'), keyimg = ['cell',c,'quesimg'].join('_');
				if(obj.ques===-2){
					this.dispnum(keyques, 1, "?", 0.8, this.fontcolor, obj.cpx, obj.cpy);
				}
				else{ this.hideEL(keyques);}

				if(obj.ques>0){
					this.dispimage1(keyimg, c);
				}
				else{ this.hideEL(keyimg);}
			}
		};
		pc.dispimage1 = function(key, c){
			var xpos = {41:0,42:1}[bd.cell[c].ques], ypos=0;

			if(!this.fillTextPrecisely){
				var img = this.numobj[key];
				if(!img){
					img = this.numobj[key] = ee.createEL(this.EL_IMGOBJ, '');
					img.src = this.imgobj.src;
					img.style.width  = ""+(this.imgobj.cols*this.cw)+"px";
					img.style.height = ""+(this.imgobj.rows*this.ch)+"px";
				}
				img.style.left   = mf(k.cv_oft.x+bd.cell[c].px+1 - xpos*this.cw)+"px";
				img.style.top    = mf(k.cv_oft.y+bd.cell[c].py+1 - ypos*this.cw)+"px";
				img.style.clip   = "rect("+mf(this.cw*ypos+1)+"px,"+mf(this.cw*(xpos+1))+"px,"+mf(this.cw*(ypos+1))+"px,"+mf(this.cw*xpos+1)+"px)";
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
			this.decodeCircle41_42();
		};
		enc.pzlexport = function(type){
			this.encodeCrossMark();
			this.encodeCircle41_42();
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeCellQues41_42();
			this.decodeCrossNum();
			this.decodeBorderAns();
		};
		fio.encodeData = function(){
			this.encodeCellQues41_42();
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
			if( !this.checkNoObjectInRoom(rinfo, function(c){ return (bd.QuC(c)!=0?bd.QuC(c):-1);}) ){
				this.setAlert('ヤギもオオカミもいない領域があります。','An area has neither sheeps nor wolves.'); return false;
			}

			if( !this.checkSameObjectInRoom(rinfo, function(c){ return (bd.QuC(c)!=0?bd.QuC(c):-1);}) ){
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
					if(bd.QnX(bd.xnum(bx,by))==1){
						if(bd.QaB(bd.bnum(bx,by-1))==1){ this.cl0(lines,bx,by,1);}
						if(bd.QaB(bd.bnum(bx,by+1))==1){ this.cl0(lines,bx,by,2);}
						if(bd.QaB(bd.bnum(bx-1,by))==1){ this.cl0(lines,bx,by,3);}
						if(bd.QaB(bd.bnum(bx+1,by))==1){ this.cl0(lines,bx,by,4);}
						break;
					}
				}
				else{
					var id = bd.bnum(bx,by);
					if(id==-1 || lines[id]==0){ break;}
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
