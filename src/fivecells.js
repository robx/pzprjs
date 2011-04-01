//
// パズル固有スクリプト部 ファイブセルズ版 fivecells.js v3.3.3
//
Puzzles.fivecells = function(){ };
Puzzles.fivecells.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}
		if(!k.qrows){ k.qrows = 10;}

		k.isborder = 2;

		k.dispzero        = true;
		k.isDispHatena    = true;
		k.isInputHatena   = true;

		k.ispzprv3ONLY    = true;

		base.setFloatbgcolor("rgb(127, 127, 255)");
	},
	menufix : function(){ },

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(k.editmode){ this.inputqnum();}
			else if(k.playmode){
				if(this.btn.Left) this.inputborderans();
				else if(this.btn.Right) this.inputQsubLine();
			}
		};
		mv.mouseup = function(){ };
		mv.mousemove = function(){
			if(k.playmode){
				if(this.btn.Left) this.inputborderans();
				else if(this.btn.Right) this.inputQsubLine();
			}
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(k.playmode){ return;}
			else if(this.moveTCell(ca)){ return;}
			else if(ca=='w'){
				var cc = tc.getTCC();
				if(cc!==null){
					bd.sQuC(cc,(bd.QuC(cc)!==7?7:0));
					bd.setNum(cc,-1);
					pc.paintCell(cc);
				}
			}
			else{ this.key_inputqnum(ca);}
		};

		if(k.EDITOR){
			kp.generate(1, true, false);
			kp.kpinput = function(ca){
				kc.key_inputqnum(ca);
			};
		}

		// 入力可能できないマスかどうか
		bd.isEmpty = function(c){ return ( !bd.cell[c] || bd.cell[c].ques===7)};
		bd.isValid = function(c){ return (!!bd.cell[c] && bd.cell[c].ques===0)};

		bd.maxnum = 3;

		bd.initSpecial = function(col,row){
			var odd = (col*row)%5;
			if(odd>=1){ bd.cell[bd.cnum(      1,      1,col,row)].ques=7;}
			if(odd>=2){ bd.cell[bd.cnum(2*col-1,      1,col,row)].ques=7;}
			if(odd>=3){ bd.cell[bd.cnum(      1,2*row-1,col,row)].ques=7;}
			if(odd>=4){ bd.cell[bd.cnum(2*col-1,2*row-1,col,row)].ques=7;}
		};
		bd.initSpecial(k.qcols,k.qrows); /* bd.initBoardSize()実行後なので一度ここで呼び出す */
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_DLIGHT;
		pc.setBorderColorFunc('qans');

		pc.paint = function(){
			this.drawBGCells();

			this.drawValidDashedGrid();
			this.drawQansBorders();
			this.drawQuesBorders();

			this.drawNumbers();
			this.drawBorderQsubs();

			this.drawTarget();
		};

		// 問題と回答の境界線を別々に描画するようにします(triplaceからコピー)
		pc.drawQansBorders = function(){
			this.vinc('border_answer', 'crispEdges');
			this.bdheader = "b_bdans";
			this.setBorderColor = function(id){
				if(bd.border[id].qans===1){
					var err = bd.border[id].error;
					if     (err===1){ g.fillStyle = this.errcolor1;          }
					else if(err===2){ g.fillStyle = this.errborderQanscolor2;}
					else            { g.fillStyle = this.borderQanscolor;    }
					return true;
				}
				return false;
			};

			g.fillStyle = this.borderQanscolor;
			var idlist = this.range.borders;
			for(var i=0;i<idlist.length;i++){ this.drawBorder1(idlist[i]);}
			this.isdrawBD = true;
		};
		pc.drawQuesBorders = function(){
			this.vinc('border_question', 'crispEdges');
			this.bdheader = "b_bdques";
			this.setBorderColor = function(id){
				var cc1 = bd.border[id].cellcc[0], cc2 = bd.border[id].cellcc[1];
				return (bd.isEmpty(cc1)^bd.isEmpty(cc2));
			};

			g.fillStyle = this.borderQuescolor;
			var idlist = this.range.borders;
			for(var i=0;i<idlist.length;i++){ this.drawBorder1(idlist[i]);}
			this.isdrawBD = true;
		};

		pc.drawValidDashedGrid = function(){
			this.vinc('grid_waritai', 'crispEdges');

			var dotmax   = this.cw/10+3;
			var dotCount = Math.max(this.cw/dotmax, 1);
			var dotSize  = this.cw/(dotCount*2);

			var csize = this.cw*0.20;
			var header = "b_grid_wari_";
			var idlist = this.range.borders;
			for(var n=0;n<idlist.length;n++){
				var id = idlist[n], cc1 = bd.border[id].cellcc[0], cc2 = bd.border[id].cellcc[1];
				if(bd.isValid(cc1) && bd.isValid(cc2)){
					var px = bd.border[id].px, py = bd.border[id].py;
					if(g.use.canvas){
						g.fillStyle = this.gridcolor;
						if     (bd.border[id].by&1){
							for(var t=py-this.bh,max=py+this.bh;t<max;t+=(2*dotSize)){ g.fillRect(px, t, 1, dotSize);}
						}
						else if(bd.border[id].bx&1){
							for(var t=px-this.bw,max=px+this.bw;t<max;t+=(2*dotSize)){ g.fillRect(t, py, dotSize, 1);}
						}
					}
					else{
						if(this.vnop(header+id,this.NONE)){
							// strokeぶん0.5ずらす
							g.lineWidth = 1;
							g.strokeStyle = this.gridcolor;

							if     (bd.border[id].by&1){ g.strokeLine(px+0.5, py-this.bh, px+0.5, py+this.bh);}
							else if(bd.border[id].bx&1){ g.strokeLine(px-this.bw, py+0.5, px+this.bw, py+0.5);}
							g.setDashSize(dotSize);
						}
					}
				}
				else{ this.vhide(header+id);}
			}
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decodeFivecells();
		};
		enc.pzlexport = function(type){
			this.encodeFivecells();
		};

		//---------------------------------------------------------
		// decode/encodeNumber10関数の改造版にします
		enc.decodeFivecells = function(){
			var c=0, i=0, bstr = this.outbstr;
			for(i=0;i<bstr.length;i++){
				var obj = bd.cell[c], ca = bstr.charAt(i);

				obj.ques = 0;
				if     (ca == '7')				 { obj.ques = 7;}
				else if(ca == '.')				 { obj.qnum = -2;}
				else if(this.include(ca,"0","9")){ obj.qnum = parseInt(ca,10);}
				else if(this.include(ca,"a","z")){ c += (parseInt(ca,36)-10);}

				c++;
				if(c > bd.cellmax){ break;}
			}
			this.outbstr = bstr.substr(i);
		};
		enc.encodeFivecells = function(){
			var cm="", count=0;
			for(var c=0;c<bd.cellmax;c++){
				var pstr="", qn=bd.cell[c].qnum, qu=bd.cell[c].ques;

				if     (qu=== 7){ pstr = "7";}
				else if(qn===-2){ pstr = ".";}
				else if(qn!==-1){ pstr = qn.toString(10);} // 0～3
				else{ count++;}

				if(count==0){ cm += pstr;}
				else if(pstr || count==26){ cm+=((9+count).toString(36)+pstr); count=0;}
			}
			if(count>0){ cm+=(9+count).toString(36);}

			this.outbstr += cm;
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeCell( function(obj,ca){
				obj.ques = 0;
				if     (ca==="*"){ obj.ques = 7;}
				else if(ca==="-"){ obj.qnum = -2;}
				else if(ca!=="."){ obj.qnum = parseInt(ca);}
			});
			this.decodeBorderAns();
		};
		fio.encodeData = function(){
			this.encodeCell( function(obj){
				if     (obj.ques=== 7){ return "* ";}
				else if(obj.qnum===-2){ return "- ";}
				else if(obj.qnum>=  0){ return (obj.qnum.toString() + " ");}
				else                  { return ". ";}
			});
			this.encodeBorderAns();
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			var rinfo = ans.getValidRoomInfo();
			if( !this.checkAllArea(rinfo, f_true, function(w,h,a,n){ return (a>=5);} ) ){
				this.setAlert('サイズが5マスより小さいブロックがあります。','The size of block is smaller than five.'); return false;
			}

			if( !this.checkdir4BorderAns() ){
				this.setAlert('数字の周りにある境界線の本数が違います。','The number is not equal to the number of border lines around it.'); return false;
			}

			if( !this.checkLcntCross_fivecells() ){
				this.setAlert('途中で途切れている線があります。','There is a dead-end line.'); return false;
			}

			if( !this.checkAllArea(rinfo, f_true, function(w,h,a,n){ return (a<=5);} ) ){
				this.setAlert('サイズが5マスより大きいブロックがあります。','The size of block is larger than five.'); return false;
			}

			return true;
		};

		ans.getValidRoomInfo = function(){
			var rinfo = new AreaInfo();
			for(var c=0;c<bd.cellmax;c++){ rinfo.id[c]=(bd.isValid(c)?0:null);}
			for(var c=0;c<bd.cellmax;c++){
				if(rinfo.id[c]!=0){ continue;}
				rinfo.max++;
				rinfo.room[rinfo.max] = {idlist:[]};
				var stack = [c];
				while(stack.length>0){
					var cc=stack.pop();
					if(rinfo.id[cc]!==0){ continue;}
					rinfo.id[cc] = rinfo.max;
					rinfo.room[rinfo.max].idlist.push(cc);

					var cblist = this.getdir4cblist(cc);
					for(var i=0;i<cblist.length;i++){
						var tc=cblist[i][0], tid=cblist[i][1];
						if(tc!==null && rinfo.id[tc]===0 && !bd.isBorder(tid)){ stack.push(tc);}
					}
				}
			}
			return rinfo;
		};
		ans.getdir4cblist = function(c){
			var cc, id, cblist=[];
			cc=bd.up(c); id=bd.ub(c); if(cc!==null || id!==null){ cblist.push([cc,id,k.UP]);}
			cc=bd.dn(c); id=bd.db(c); if(cc!==null || id!==null){ cblist.push([cc,id,k.DN]);}
			cc=bd.lt(c); id=bd.lb(c); if(cc!==null || id!==null){ cblist.push([cc,id,k.LT]);}
			cc=bd.rt(c); id=bd.rb(c); if(cc!==null || id!==null){ cblist.push([cc,id,k.RT]);}
			return cblist;
		};

		ans.checkdir4BorderAns = function(){
			var result = true;
			for(var c=0;c<bd.cellmax;c++){
				if(bd.isValidNum(c) && this.checkdir4Border1(c)!==bd.QnC(c)){
					if(this.inAutoCheck){ return false;}
					bd.sErC([c],1);
					result = false;
				}
			}
			return result;
		};
		ans.checkdir4Border1 = function(cc){
			var cnt=0, cblist=this.getdir4cblist(cc);
			for(var i=0;i<cblist.length;i++){
				var tc=cblist[i][0], tid=cblist[i][1];
				if(tc===null || bd.isEmpty(tc) || bd.isBorder(tid)){ cnt++;}
			}
			return cnt;
		};

		/* AreaManagerを無効にしているので、別に作る */
		ans.checkLcntCross_fivecells = function(){
			var result=true;
			for(var by=bd.minby+2;by<=bd.maxby-2;by+=2){
				for(var bx=bd.minbx+2;bx<=bd.maxbx-2;bx+=2){
					if(this.getLcntCross(bx,by)===1){
						if(this.inAutoCheck){ return false;}
						if(result){ bd.sErBAll(2);}
						this.setCrossBorderError(bx,by);
						result = false;
					}
				}
			}
			return result;
		};
		ans.getLcntCross = function(bx, by){
			var cnt=0;
			if(this.isBorder_fivecells(bd.bnum(bx,by-1))){ cnt++;}
			if(this.isBorder_fivecells(bd.bnum(bx,by+1))){ cnt++;}
			if(this.isBorder_fivecells(bd.bnum(bx-1,by))){ cnt++;}
			if(this.isBorder_fivecells(bd.bnum(bx+1,by))){ cnt++;}
			return cnt;
		};
		ans.isBorder_fivecells = function(id){
			if(id===null){ return false;} /* 外枠境界線もIDつきなのでfalseでよい */
			if(bd.border[id].qans===1){ return true;} /* 回答の境界線 */

			var cc1 = bd.border[id].cellcc[0], cc2 = bd.border[id].cellcc[1];
			return (bd.isEmpty(cc1)^bd.isEmpty(cc2)); /* 問題の境界線 */
		};
	}
};
