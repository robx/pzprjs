//
// パズル固有スクリプト部 快刀乱麻・新・快刀乱麻版 kramma.js v3.4.0
//
Puzzles.kramma = function(){ };
Puzzles.kramma.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 8;}
		if(!k.qrows){ k.qrows = 8;}

		k.iscross  = 1;
		k.isborder = 1;

		k.hasroom         = true;
		k.isDispHatena    = true;
		k.isInputHatena   = true;
		k.inputQnumDirect = true;
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
			if(k.editmode){
				if(k.puzzleid==='kramman'){ this.inputcrossMark();}
			}
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

		bd.maxnum = 2;
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_DLIGHT;
		pc.borderQanscolor = "rgb(64, 64, 255)";
		pc.setBorderColorFunc('qans');

		pc.crosssize = 0.15;

		pc.paint = function(){
			this.drawBGCells();
			this.drawDashedGrid();
			this.drawBorders();

			this.drawQnumCircles();
			if(k.puzzleid==='kramman'){ this.drawCrossMarks();}

			this.drawHatenas();

			this.drawBorderQsubs();

			this.drawChassis();
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			if(!this.checkpflag("c")){ this.decodeCrossMark();}
			this.decodeCircle();

			this.checkPuzzleid();
		};
		enc.pzlexport = function(type){
			if(k.puzzleid==='kramman'){ this.encodeCrossMark();}else{ this.outpflag="c";}
			this.encodeCircle();
		};

		enc.checkPuzzleid = function(){
			if(k.puzzleid==='kramma'){
				for(var c=0;c<bd.crossmax;c++){
					if(bd.cross[c].qnum===1){ k.puzzleid='kramman'; break;}
				}
				menu.displayTitle();
			}
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeCellQnum();
			this.decodeCrossNum();
			this.decodeBorderAns();

			enc.checkPuzzleid();
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
			if( (k.puzzleid==='kramman') && !this.checkLcntCross(4,1) ){
				this.setAlert('線が黒点上で交差しています。','There is a crossing line on the black point.'); return false;
			}
			if( (k.puzzleid==='kramman') && !this.checkLcntCurve() ){
				this.setAlert('線が黒点以外で曲がっています。','A line curves out of the black points.'); return false;
			}

			rinfo = bd.areas.getRoomInfo();
			if( !this.checkNoNumber(rinfo) ){
				this.setAlert('白丸も黒丸も含まれない領域があります。','An area has no marks.'); return false;
			}

			if( !this.checkSameObjectInRoom(rinfo, bd.getNum) ){
				this.setAlert('白丸と黒丸が両方含まれる領域があります。','An area has both white and black circles.'); return false;
			}

			if( !this.checkLcntCross(1,0) ){
				this.setAlert('途中で途切れている線があります。','There is a dead-end line.'); return false;
			}
			if( (k.puzzleid==='kramman') && !this.checkLcntCross(0,1) ){
				this.setAlert('黒点上を線が通過していません。','No lines on the black point.'); return false;
			}

			return true;
		};

		ans.checkLcntCurve = function(){
			var result = true;
			for(var bx=bd.minbx+2;bx<=bd.maxbx-2;bx+=2){
				for(var by=bd.minby+2;by<=bd.maxby-2;by+=2){
					var xc = bd.xnum(bx,by);
					if(bd.areas.lcntCross(xc)===2 && bd.QnX(xc)!==1){
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
	}
};
