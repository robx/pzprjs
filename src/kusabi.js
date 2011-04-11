//
// パズル固有スクリプト部 クサビリンク版 kusabi.js v3.4.0
//
Puzzles.kusabi = function(){ };
Puzzles.kusabi.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}
		if(!k.qrows){ k.qrows = 10;}

		k.isborder = 1;

		k.isCenterLine    = true;
		k.isInputHatena   = true;
		k.numberAsObject  = true;

		k.ispzprv3ONLY    = true;

		base.setFloatbgcolor("rgb(96, 96, 96)");
	},
	menufix : function(){ },

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(k.editmode){ this.inputqnum();}
			else if(k.playmode){
				if(this.btn.Left) this.inputLine();
				else if(this.btn.Right) this.inputpeke();
			}
		};
		mv.mouseup = function(){
			if(k.playmode && this.btn.Left && this.notInputted()){
				this.inputpeke();
			}
		};
		mv.mousemove = function(){
			if(k.playmode){
				if(this.btn.Left) this.inputLine();
				else if(this.btn.Right) this.inputpeke();
			}
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(k.playmode){ return;}
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum(ca);
		};

		if(k.EDITOR){
			kp.kpgenerate = function(mode){
				this.inputcol('num','knum1','1','同');
				this.inputcol('num','knum2','2','短');
				this.inputcol('num','knum3','3','長');
				this.insertrow();
				this.inputcol('num','knum.','-','○');
				this.inputcol('num','knum_',' ',' ');
				this.inputcol('empty','','','');
				this.insertrow();
			};
			kp.generate(kp.ORIGINAL, true, false);
			kp.kpinput = function(ca){
				kc.key_inputqnum(ca);
			};
		}

		bd.maxnum = 3;
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_LIGHT;
		pc.circleratio = [0.40, 0.40];

		pc.paint = function(){
			this.drawBGCells();
			this.drawGrid();

			this.drawPekes(0);
			this.drawLines();

			this.drawCirclesAtNumber();
			this.drawNumbers();

			this.drawChassis();

			this.drawTarget();
		};
		pc.drawNumber1 = function(id){
			var num = bd.cell[id].qnum, obj = bd.cell[id], key='cell_'+id;
			if(num>=1 && num<=3){
				var text = ({1:"同",2:"短",3:"長"})[num];
				this.dispnum(key, 1, text, 0.65, this.fontcolor, obj.cpx, obj.cpy);
			}
			else{ this.hideEL(key);}
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decodeNumber10();
		};
		enc.pzlexport = function(type){
			this.encodeNumber10();
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeCellQnum();
			this.decodeBorderLine();
		};
		fio.encodeData = function(){
			this.encodeCellQnum();
			this.encodeBorderLine();
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){
			this.performAsLine = true;

			if( !this.checkLcntCell(3) ){
				this.setAlert('分岐している線があります。','There is a branch line.'); return false;
			}
			if( !this.checkLcntCell(4) ){
				this.setAlert('線が交差しています。','There is a crossing line.'); return false;
			}

			var linfo = bd.lines.getLareaInfo();
			if( !this.checkTripleNumber(linfo) ){
				this.setAlert('3つ以上の丸がつながっています。','Three or more objects are connected.'); return false;
			}
			if( !this.check2Line() ){
				this.setAlert('丸の上を線が通過しています。','A line goes through a circle.'); return false;
			}

			var errinfo = this.searchConnectedLine();
			if( !this.checkErrorFlag(errinfo,7) ){
				this.setAlert('丸がコの字型に繋がっていません。','The shape of a line is not correct.'); return false;
			}
			if( !this.checkErrorFlag(errinfo,6) ){
				this.setAlert('繋がる丸が正しくありません。','The type of connected circle is wrong.'); return false;
			}
			if( !this.checkErrorFlag(errinfo,5) ){
				this.setAlert('線が2回以上曲がっています。','A line turns twice or more.'); return false;
			}
			if( !this.checkErrorFlag(errinfo,4) ){
				this.setAlert('線が2回曲がっていません。','A line turns only once or lower.'); return false;
			}
			if( !this.checkErrorFlag(errinfo,3) ){
				this.setAlert('線の長さが同じではありません。','The length of lines is differnet.'); return false;
			}
			if( !this.checkErrorFlag(errinfo,2) ){
				this.setAlert('線の長短の指示に反してます。','The length of lines is not suit for the label of object.'); return false;
			}
			if( !this.checkErrorFlag(errinfo,1) ){
				this.setAlert('途切れている線があります。','There is a dead-end line.'); return false;
			}

			if( !this.checkDisconnectLine(linfo) ){
				this.setAlert('丸につながっていない線があります。','A line doesn\'t connect any circle.'); return false;
			}

			if( !this.checkAllCell(function(c){ return (bd.lines.lcntCell(c)===0 && bd.isNum(c));}) ){
				this.setAlert('どこにもつながっていない丸があります。','A circle is not connected another object.'); return false;
			}

			return true;
		};
		ans.check1st = function(){ return this.checkAllCell(function(c){ return (bd.lines.lcntCell(c)===0 && bd.isNum(c));});};

		ans.check2Line = function(){ return this.checkLine(function(c){ return (bd.lines.lcntCell(c)>=2 && bd.isNum(c));}); };
		ans.checkLine = function(func){
			var result = true;
			for(var c=0;c<bd.cellmax;c++){
				if(func(c)){
					if(this.inAutoCheck){ return false;}
					if(result){ bd.sErBAll(2);}
					ans.setCellLineError(c,true);
					result = false;
				}
			}
			return result;
		};

		ans.searchConnectedLine = function(){
			var errinfo = {data:[]}, visited = new AreaInfo();
			for(var id=0;id<bd.bdmax;id++){ visited[id]=0;}

			for(var c=0;c<bd.cellmax;c++){
				if(bd.noNum(c) || bd.lines.lcntCell(c)===0){ continue;}

				var cc      = null;	// ループから抜けたときに到達地点のIDが入る
				var ccnt    = 0;	// 曲がった回数
				var dir     = 0;	// 現在向かっている方向/最後に向かった方向
				var dir1    = 0;	// 最初に向かった方向
				var length1 = 0;	// 一回曲がる前の線の長さ
				var length2 = 0;	// 二回曲がった後の線の長さ
				var idlist  = [];	// 通過したlineのリスト(エラー表示用)
				var bx=bd.cell[c].bx, by=bd.cell[c].by;	// 現在地
				while(1){
					switch(dir){ case 1: by--; break; case 2: by++; break; case 3: bx--; break; case 4: bx++; break;}
					if(((bx+by)&1)===0){
						cc = bd.cnum(bx,by);
						if(dir!=0 && bd.isNum(cc)){ break;}
						else if(dir!==1 && bd.isLine(bd.bnum(bx,by+1))){ if(dir!==0&&dir!==2){ ccnt++;} dir=2;}
						else if(dir!==2 && bd.isLine(bd.bnum(bx,by-1))){ if(dir!==0&&dir!==1){ ccnt++;} dir=1;}
						else if(dir!==3 && bd.isLine(bd.bnum(bx+1,by))){ if(dir!==0&&dir!==4){ ccnt++;} dir=4;}
						else if(dir!==4 && bd.isLine(bd.bnum(bx-1,by))){ if(dir!==0&&dir!==3){ ccnt++;} dir=3;}
					}
					else{
						cc=null;
						var id = bd.bnum(bx,by);
						if(id===null || visited[id]!==0 || !bd.isLine(id)){ break;}
						idlist.push(id);
						visited[id]=1;
						if(dir1===0){ dir1=dir;}
						if     (ccnt===0){ length1++;}
						else if(ccnt===2){ length2++;}
					}
				}

				if(idlist.length<=0){ continue;}

				var qn=(c!==null?bd.QnC(c):-1), qnn=(cc!==null?bd.QnC(cc):-1);
				if(ccnt===2 && !((dir1===1&&dir===2)||(dir1===2&&dir===1)||(dir1===3&&dir===4)||(dir1===4&&dir===3)))
					{ errinfo.data.push({errflag:7,cells:[c,cc],idlist:idlist});}
				else if(cc!==null && ccnt===2 && !((qn===1&&qnn===1) || (qn===2&&qnn===3) || (qn===3&&qnn===2) || qn===-2 || qnn===-2))
					{ errinfo.data.push({errflag:6,cells:[c,cc],idlist:idlist});}
				else if(ccnt>2)
					{ errinfo.data.push({errflag:5,cells:[c,cc],idlist:idlist});}
				else if(cc!==null && ccnt<2)
					{ errinfo.data.push({errflag:4,cells:[c,cc],idlist:idlist});}
				else if(cc!==null && ccnt===2 && (qn===1||qnn===1) && length1!==length2)
					{ errinfo.data.push({errflag:3,cells:[c,cc],idlist:idlist});}
				else if(cc!==null && ccnt===2 && (((qn===2||qnn===3) && length1>=length2) || ((qn===3||qnn===2) && length1<=length2)))
					{ errinfo.data.push({errflag:2,cells:[c,cc],idlist:idlist});}
				else if(cc===null || qnn===-1)
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
