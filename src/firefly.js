//
// パズル固有スクリプト部 ホタルビーム版 firefly.js v3.3.2
//
Puzzles.firefly = function(){ };
Puzzles.firefly.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}
		if(!k.qrows){ k.qrows = 10;}

		k.irowake  = 1;
		k.isborder = 1;

		k.isCenterLine    = true;
		k.dispzero        = true;
		k.isInputHatena   = true;

		k.bdmargin       = 0.50;
		k.bdmargin_image = 0.10;

		base.setTitle("ホタルビーム", 'Hotaru Beam'); //'Glow of Fireflies');
		base.setFloatbgcolor("rgb(0, 224, 0)");
	},
	menufix : function(){ },

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(k.editmode) this.inputdirec();
			else if(k.playmode){
				if(this.btn.Left) this.inputLine();
				else if(this.btn.Right) this.inputpeke();
			}
		};
		mv.mouseup = function(){
			if(this.notInputted()){
				if(k.editmode && bd.cnum(this.prevPos.x,this.prevPos.y)===this.cellid()){
					this.inputqnum();
				}
				else if(k.playmode && this.btn.Left){
					this.inputpeke();
				}
			}
		};
		mv.mousemove = function(){
			if(k.editmode){
				if(this.notInputted()) this.inputdirec();
			}
			else if(k.playmode){
				if(this.btn.Left) this.inputLine();
				else if(this.btn.Right) this.inputpeke();
			}
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(k.playmode){ return;}
			if(this.key_inputdirec(ca)){ return;}
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum(ca);
		};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_LIGHT;

		pc.fontErrcolor = pc.fontcolor;
		pc.fontsizeratio = 0.85;

		pc.paint = function(){
			this.drawDashedCenterLines();
			this.drawLines();

			this.drawPekes(0);

			this.drawFireflies();
			this.drawNumbers();

			this.drawTarget();
		};

		pc.drawFireflies = function(){
			this.vinc('cell_firefly', 'auto');

			var clist = this.range.cells;
			for(var i=0;i<clist.length;i++){ this.drawFirefly1(clist[i]);}
		};
		pc.drawFirefly1 = function(c){
			if(c===null){ return;}

			var rsize  = this.cw*0.40;
			var rsize3 = this.cw*0.10;
			var headers = ["c_cira_", "c_cirb_"];

			if(bd.cell[c].qnum!=-1){
				var px=bd.cell[c].cpx, py=bd.cell[c].cpy;

				g.lineWidth = 1.5;
				g.strokeStyle = this.cellcolor;
				g.fillStyle = (bd.cell[c].error===1 ? this.errbcolor1 : "white");
				if(this.vnop(headers[0]+c,this.FILL)){
					g.shapeCircle(px, py, rsize);
				}

				this.vdel([headers[1]+c]);
				if(bd.cell[c].qdir!=0){
					g.fillStyle = this.cellcolor;
					switch(bd.cell[c].qdir){
						case k.UP: py-=(rsize-1); break;
						case k.DN: py+=(rsize-1); break;
						case k.LT: px-=(rsize-1); break;
						case k.RT: px+=(rsize-1); break;
					}
					if(this.vnop(headers[1]+c,this.NONE)){
						g.fillCircle(px, py, rsize3);
					}
				}
			}
			else{ this.vhide([headers[0]+c, headers[1]+c]);}
		};

		pc.repaintParts = function(idlist){
			var clist = line.getClistFromIdlist(idlist);
			for(var i=0;i<clist.length;i++){
				this.drawFirefly1(clist[i]);
				this.drawNumber1(clist[i]);
			}
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decodeArrowNumber16();
		};
		enc.pzlexport = function(type){
			this.encodeArrowNumber16();
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeCellDirecQnum();
			this.decodeBorderLine();
		};
		fio.encodeData = function(){
			this.encodeCellDirecQnum();
			this.encodeBorderLine();
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			if( !this.checkLcntCell(3) ){
				this.setAlert('分岐している線があります。', 'There is a branch line.'); return false;
			}
			if( !this.checkLcntCell(4) ){
				this.setAlert('線が交差しています。', 'There is a crossing line.'); return false;
			}

			var errinfo = this.searchFireflies();
			if( !this.checkErrorFlag(errinfo,3) ){
				this.setAlert('黒点同士が線で繋がっています。', 'Black points are connected each other.'); return false;
			}
			if( !this.checkErrorFlag(errinfo,2) ){
				this.setAlert('線の曲がった回数が数字と違っています。', 'The number of curves is different from a firefly\'s number.'); return false;
			}
			if( !this.checkErrorFlag(errinfo,1) ){
				this.setAlert('線が途中で途切れています。', 'There is a dead-end line.'); return false;
			}

			this.performAsLine = true;
			if( !this.checkOneArea( line.getLareaInfo() ) ){
				this.setAlert('線が全体で一つながりになっていません。', 'All lines and fireflies are not connected each other.'); return false;
			}

			if( !this.checkLcntCell(1) ){
				this.setAlert('線が途中で途切れています。', 'There is a dead-end line.'); return false;
			}

			if( !this.checkFireflyBeam() ){
				this.setAlert('ホタルから線が出ていません。', 'There is a lonely firefly.'); return false;
			}

			if( !this.checkStrangeLine(errinfo) ){
				this.setAlert('白丸の、黒点でない部分どうしがくっついています。', 'Fireflies are connected without a line starting from black point.'); return false;
			}

			bd.sErBAll(0);
			return true;
		};
		ans.check1st = function(){ return true;};

		ans.checkLcntCell = function(val){
			var result = true;
			if(line.ltotal[val]==0){ return true;}
			for(var c=0;c<bd.cellmax;c++){
				if(bd.noNum(c) && line.lcntCell(c)==val){
					if(this.inAutoCheck){ return false;}
					if(result){ bd.sErBAll(2);}
					ans.setCellLineError(c,false);
					result = false;
				}
			}
			return result;
		};
		ans.checkFireflyBeam = function(){
			var result = true;
			for(var c=0;c<bd.cellmax;c++){
				if(bd.noNum(c) || bd.DiC(c)==0){ continue;}
				if((bd.DiC(c)==k.UP && !bd.isLine(bd.ub(c))) || (bd.DiC(c)==k.DN && !bd.isLine(bd.db(c))) ||
				   (bd.DiC(c)==k.LT && !bd.isLine(bd.lb(c))) || (bd.DiC(c)==k.RT && !bd.isLine(bd.rb(c))) )
				{
					if(this.inAutoCheck){ return false;}
					bd.sErC([c],1);
					result = false;
				}
			}
			return result;
		};
		ans.checkStrangeLine = function(errinfo){
			var idlist = [];
			for(var id=0;id<bd.bdmax;id++){
				if(bd.isLine(id) && errinfo.check[id]!=2){ idlist.push(id);}
			}
			if(idlist.length>0){
				bd.sErBAll(2);
				bd.sErB(idlist,1);
				return false;
			}
			return true;
		};

		ans.searchFireflies = function(){
			var errinfo={data:[],check:[]};
			for(var i=0;i<bd.bdmax;i++){ errinfo.check[i]=0;}

			for(var c=0;c<bd.cellmax;c++){
				var dir=bd.DiC(c), qn=bd.QnC(c);
				if(qn===-1 || dir===0){ continue;}

				var ccnt = 0;
				var idlist = [];
				var bx=bd.cell[c].bx, by=bd.cell[c].by;
				while(1){
					switch(dir){ case 1: by--; break; case 2: by++; break; case 3: bx--; break; case 4: bx++; break;}
					if(!((bx+by)&1)){
						var cc = bd.cnum(bx,by);
						if(cc===null || bd.isNum(cc)){ break;}
						else if(dir!==1 && bd.isLine(bd.bnum(bx,by+1))){ if(dir!==2){ ccnt++;} dir=2;}
						else if(dir!==2 && bd.isLine(bd.bnum(bx,by-1))){ if(dir!==1){ ccnt++;} dir=1;}
						else if(dir!==3 && bd.isLine(bd.bnum(bx+1,by))){ if(dir!==4){ ccnt++;} dir=4;}
						else if(dir!==4 && bd.isLine(bd.bnum(bx-1,by))){ if(dir!==3){ ccnt++;} dir=3;}
					}
					else{
						var id = bd.bnum(bx,by);
						if(!bd.isLine(id)){ break;}
						idlist.push(id);
					}
				}
				if(idlist.length<=0){ continue;}

				for(var i=0;i<idlist.length;i++){ errinfo.check[idlist[i]]=2;}

				var cc=bd.cnum(bx,by), dic=(cc!==null?bd.DiC(cc):k.NONE);
				if(cc!==null && ((dic===k.UP && dir===k.DN) || (dic===k.DN && dir===k.UP) || (dic===k.LT && dir===k.RT) || (dic===k.RT && dir===k.LT) ))
					{ errinfo.data.push({errflag:3,cells:[c,cc],idlist:idlist});}
				else if(cc!==null && qn!==-2 && qn!==ccnt)
					{ errinfo.data.push({errflag:2,cells:[c],idlist:idlist});}
				else if(cc===null)
					{ errinfo.data.push({errflag:1,cells:[c],idlist:idlist});}
			}
			return errinfo;
		};
		ans.checkErrorFlag = function(errinfo, val){
			var result = true;
			for(var i=0,len=errinfo.data.length;i<len;i++){
				if(errinfo.data[i].errflag!=val){ continue;}

				if(this.inAutoCheck){ return false;}
				bd.sErC(errinfo.data[i].cells,1);
				if(result){ bd.sErBAll(2);}
				bd.sErB(errinfo.data[i].idlist,1);
				result = false;
			}
			return result;
		};
	}
};
