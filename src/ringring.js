//
// パズル固有スクリプト部 リングリング版 ringring.js v3.3.5
//
Puzzles.ringring = function(){ };
Puzzles.ringring.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 8;}
		if(!k.qrows){ k.qrows = 8;}

		k.irowake  = 1;
		k.isborder = 1;

		k.isLineCross     = true;
		k.isCenterLine    = true;

		k.ispzprv3ONLY    = true;

		base.setFloatbgcolor("rgb(0, 127, 0)");
	},
	menufix : function(){
		menu.addRedLineToFlags();
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(kc.isZ ^ pp.getVal('dispred')){ this.dispRedLine(); return;}
			if(k.editmode) this.inputblock();
			else if(k.playmode){
				if(this.btn.Left) { this.inputLine();}
				if(this.btn.Right){ this.inputpeke();}
			}
		};
		mv.mouseup = function(){ };
		mv.mousemove = function(){
			if(k.playmode){
				if(this.btn.Left) { this.inputLine();}
				if(this.btn.Right){ this.inputpeke();}
			}
		};

		mv.inputblock = function(){
			var cc = this.cellid();
			if(cc===null){ return;}

			bd.sQuC(cc,(bd.QuC(cc)===0?1:0));
			pc.paintCell(cc);
		};

		bd.enableLineNG = true;
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_SLIGHT;

		pc.paint = function(){
			this.drawBGCells();
			this.drawDashedGrid();
			this.drawBlackCells();

			this.drawLines();
			this.drawPekes(0);

			this.drawChassis();
		};

		//オーバーライド
		pc.setCellColor = function(c){
			if(bd.cell[c].ques===1){ g.fillStyle = this.cellcolor; return true;}
			return false;
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decodeBlockCell();
		};
		enc.pzlexport = function(type){
			this.encodeBlockCell();
		};

		// 元ネタはencode/decodeCrossMark
		enc.decodeBlockCell = function(){
			var cc=0, i=0, bstr = this.outbstr;
			for(i=0;i<bstr.length;i++){
				var ca = bstr.charAt(i);

				if(this.include(ca,"0","9")||this.include(ca,"a","z")){
					cc += parseInt(ca,36);
					bd.cell[cc].ques = 1;
				}
				else if(ca == '.'){ cc+=35;}

				cc++;
				if(cc>=bd.cellmax){ i++; break;}
			}
			this.outbstr = bstr.substr(i);
		};
		enc.encodeBlockCell = function(){
			var cm="", count=0;
			for(var c=0;c<bd.cellmax;c++){
				var pstr="";
				if(bd.cell[c].ques===1){ pstr = ".";}
				else{ count++;}

				if(pstr){ cm += count.toString(36); count=0;}
				else if(count==36){ cm += "."; count=0;}
			}
			//if(count>0){ cm += count.toString(36);}

			this.outbstr += cm;
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeCellBlock();
			this.decodeBorderLine();
		};
		fio.encodeData = function(){
			this.encodeCellBlock();
			this.encodeBorderLine();
		};

		fio.decodeCellBlock = function(){
			this.decodeCell( function(obj,ca){
				if(ca==="1"){ obj.ques = 1;}
			});
		};
		fio.encodeCellBlock = function(){
			this.encodeCell( function(obj){
				return (obj.ques===1?"1 ":"0 ");
			});
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			var cnt=0;
			for(var i=0;i<bd.bdmax;i++){ if(bd.isLine(i)){ cnt++;} }
			if( cnt==0 ){ this.setAlert('線が引かれていません。','There is no line on the board.'); return false;}

			if( !this.checkAllCell(function(c){ return (line.lcntCell(c)>0 && bd.QuC(c)===1);}) ){
				this.setAlert('黒マスの上に線が引かれています。','There is a line on the black cell.'); return false;
			}

			if( !this.checkLcntCell(3) ){
				this.setAlert('分岐している線があります。','There is a branch line.'); return false;
			}
			if( !this.checkLcntCell(1) ){
				this.setAlert('途中で途切れている線があります。', 'There is a dead-end line.'); return false;
			}

			if( !this.checkAllLoopRect() ){
				this.setAlert('長方形か正方形でない輪っかがあります。','There is a non-rectangle loop.'); return false;
			}

			if( !this.checkAllCell(function(c){ return (line.lcntCell(c)===0 && bd.QuC(c)===0);}) ){
				this.setAlert('白マスの上に線が引かれていません。','There is no line on the white cell.'); return false;
			}

			return true;
		};

		ans.checkAllLoopRect = function(){
			var result = true;
			var xinfo = line.getLineInfo();
			for(var r=1;r<=xinfo.max;r++){
				if(this.isLoopRect(xinfo.room[r].idlist)){ continue;}

				if(this.inAutoCheck){ return false;}
				if(result){ bd.sErBAll(2);}
				bd.sErB(xinfo.room[r].idlist,1);
				result = false;
			}
			return result;
		};
		ans.isLoopRect = function(list){
			var x1=bd.maxbx, x2=bd.minbx, y1=bd.maxby, y2=bd.minby;
			for(var i=0;i<list.length;i++){
				if(x1>bd.border[list[i]].bx){ x1=bd.border[list[i]].bx;}
				if(x2<bd.border[list[i]].bx){ x2=bd.border[list[i]].bx;}
				if(y1>bd.border[list[i]].by){ y1=bd.border[list[i]].by;}
				if(y2<bd.border[list[i]].by){ y2=bd.border[list[i]].by;}
			}
			for(var i=0;i<list.length;i++){
				if(bd.border[list[i]].bx!=x1 && bd.border[list[i]].bx!=x2 && bd.border[list[i]].by!=y1 && bd.border[list[i]].by!=y2){ return false;}
			}
			return true;
		};
	}
};
