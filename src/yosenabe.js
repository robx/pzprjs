//
// パズル固有スクリプト部 よせなべ版 yosenabe.js v3.3.5
//
Puzzles.yosenabe = function(){ };
Puzzles.yosenabe.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 8;}
		if(!k.qrows){ k.qrows = 8;}

		k.isborder = 1;

		k.isCenterLine  = true;
		k.isInputHatena = true;

		base.setFloatbgcolor("rgb(127,96,64)");
	},
	menufix : function(){ },

	protoChange : function(){
		this.protoval = {
			cell : {qnum:Cell.prototype.defqnum, qdir:Cell.prototype.defqdir},
		};
		Cell.prototype.defqnum = -1;
		Cell.prototype.defqdir = -1;
	},
	protoOriginal : function(){
		Cell.prototype.defqnum = this.protoval.cell.qnum;
		Cell.prototype.defqdir = this.protoval.cell.qdir;
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(k.editmode){ if(this.btn.Right){ this.inputNabe();}}
			else if(k.playmode){
				if(this.btn.Left) { this.inputLine();}
				if(this.btn.Right){ this.inputpeke();}
			}
		};
		mv.mouseup = function(){
			if(this.notInputted()){
				if(k.editmode){ this.inputqnum_yosenabe();}
			}
		};
		mv.mousemove = function(){
			if(k.editmode){ if(this.btn.Right){ this.inputNabe();}}
			else if(k.playmode){
				if(this.btn.Left) { this.inputLine();}
				if(this.btn.Right){ this.inputpeke();}
			}
		};
		mv.inputNabe = function(){
			var cc = this.cellid();
			if(cc===null || cc===this.mouseCell){ return;}
			if(bd.isNum(cc)){ this.inputqnum(); return;}
			else if(bd.DiC(cc)!==-1){ this.inputqnum_yosenabe(); return;}

			if(this.inputData===null){ this.inputData = (bd.QuC(cc)==6?0:6);}

			bd.sQuC(cc, this.inputData);
			pc.paintCellAround(cc);
			this.mouseCell = cc;
		};

		mv.inputqnum_yosenabe = function(){
			var cc = this.cellid();
			if(cc===null || cc===this.mouseCell){ return;}

			if(cc===tc.getTCC()){
				var max = bd.nummaxfunc(cc), num, type, val=-1;

				if     (bd.QnC(cc)!==-1){ num=bd.QnC(cc); type=1;} /* ○数字 */
				else if(bd.DiC(cc)!==-1){ num=bd.DiC(cc); type=2;} /* なべの数字 */
				else{ num=-1; type=((bd.QuC(cc)===6)?2:1);}

				if(this.btn.Left){
					if     (num===max){ val = -1;}
					else if(num===-1) { val = -2;}
					else if(num===-2) { val = 1;}
					else              { val = num+1;}
				}
				else if(this.btn.Right){
					if     (num===-1){ val = max;}
					else if(num===-2){ val = -1;}
					else if(num=== 1){ val = -2;}
					else             { val = num-1;}
				}

				if     (type===1){ bd.sQnC(cc,val);}
				else if(type===2){ bd.sDiC(cc,val);}
			}
			else{
				var cc0 = tc.getTCC();
				tc.setTCC(cc);
				pc.paintCell(cc0);
			}
			this.mouseCell = cc;

			pc.paintCell(cc);
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(k.playmode){ return;}
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum_yosenabe(ca);
		};
		kc.key_inputqnum_yosenabe = function(ca){
			var cc = tc.getTCC(), num;
			if(ca=='q'||ca=='q1'||ca=='q2'){
				if(ca=='q') { ca = (bd.QnC(cc)!==-1?'q1':'q2');}
				if     (ca=='q1' && bd.QnC(cc)!==-1){ bd.sDiC(cc,bd.QnC(cc)); bd.sQnC(cc,-1);}
				else if(ca=='q2' && bd.DiC(cc)!==-1){ bd.sQnC(cc,bd.DiC(cc)); bd.sDiC(cc,-1);}
			}
			else if(ca=='w'){
				bd.sQuC(cc,(bd.QuC(cc)==6?0:6));
			}
			else{
				var max = bd.nummaxfunc(cc), val=-1, cur=-1;

				if     (bd.QnC(cc)!==-1){ cur=bd.QnC(cc); type=1;} /* ○数字 */
				else if(bd.DiC(cc)!==-1){ cur=bd.DiC(cc); type=2;} /* なべの数字 */
				else{ cur=-1; type=((bd.QuC(cc)===6)?2:1);}

				if('0'<=ca && ca<='9'){
					var num = parseInt(ca);
					if(cur<=0 || cur*10+num>max || this.prev!=cc){ cur=0;}
					val = cur*10+num;
					if(val>max){ return;}
				}
				else if(ca==='-') { val = -2;}
				else if(ca===' ') { val = -1;}
				else{ return;}

				if     (type===1){ bd.sQnC(cc,val);}
				else if(type===2){ bd.sDiC(cc,val);}
			}

			this.prev=cc;
			pc.paintCell(cc);
		};

		if(k.EDITOR){
			kp.kpgenerate = function(mode){
				this.inputcol('num','knum0','0','0');
				this.inputcol('num','knum1','1','1');
				this.inputcol('num','knum.','-','○');
				this.inputcol('num','knum_',' ',' ');
				this.insertrow();
				this.inputcol('num','knum2','2','2');
				this.inputcol('num','knum3','3','3');
				this.inputcol('num','knum4','4','4');
				this.inputcol('num','knum5','5','5');
				this.insertrow();
				this.inputcol('num','knum6','6','6');
				this.inputcol('num','knum7','7','7');
				this.inputcol('num','knum8','8','8');
				this.inputcol('num','knum9','9','9');
				this.insertrow();
			};
			kp.generate(kp.ORIGINAL, true, false);
			kp.kpinput = function(ca){
				kc.key_inputqnum(ca);
			};
		}

		menu.ex.adjustBoardData = function(key,d){};
		menu.ex.adjustBoardData2 = function(key,d){};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_LIGHT;
		pc.icecolor = "rgb(224,224,224)";
		pc.setBGCellColorFunc('icebarn');
		pc.setBorderColorFunc('ice');

		pc.circleratio = [0.38, 0.38];

		pc.paint = function(){
			this.drawBGCells();
			this.drawGrid();
			this.drawBorders();

			this.drawTip();
			this.drawLines();

			this.drawCirclesAtNumber_yosenabe();
			this.drawNumbers();

			this.drawPekes(0);

			this.drawChassis();

			this.drawTarget();
		};

		pc.drawNumber1 = function(c){
			var obj = bd.cell[c], key = ['cell',c].join('_'), num = (obj.qnum>0 ? obj.qnum : obj.qdir);
			if(num>0 || (obj.qdir===-2)){
				var text      = (num>=0 ? ""+num : "?");
				var fontratio = (num<10?0.8:(num<100?0.7:0.55));
				var color     = this.getCellNumberColor(c);
				if(obj.qnum!==-1){ fontratio *= 0.9;}
				this.dispnum(key, 1, text, fontratio, color, obj.cpx, obj.cpy);
			}
			else{ this.hidenum(key);}
		};
		pc.getCellNumberColor = function(c){
			var obj = bd.cell[c], color = this.fontcolor;
			if(obj.error===1 || obj.error===4){
				color = this.fontErrcolor;
			}
			else{
				color = this.fontcolor;
			}
			return color;
		};

		pc.drawCirclesAtNumber_yosenabe = function(){
			this.vinc('cell_circle', 'auto');

			var rsize  = this.cw*this.circleratio[0];
			var rsize2 = this.cw*this.circleratio[1];
			var headers = ["c_cira_", "c_cirb_"];

			var clist = this.range.cells;
			for(var i=0;i<clist.length;i++){
				var c = clist[i], error = bd.cell[c].error;

				if(bd.cell[c].qnum!==-1){
					g.lineWidth = this.cw*0.05;
					g.fillStyle = ((error===1||error===4) ? this.errbcolor1 : this.circledcolor);
					if(this.vnop(headers[1]+c,this.FILL)){
						g.fillCircle(bd.cell[c].cpx, bd.cell[c].cpy, rsize2);
					}

					g.strokeStyle = ((error===1||error===4) ? this.errcolor1 : this.cellcolor);
					if(this.vnop(headers[0]+c,this.STROKE)){
						g.strokeCircle(bd.cell[c].cpx, bd.cell[c].cpy, rsize);
					}
				}
				else{ this.vhide([headers[0]+c, headers[1]+c]);}
			}
		};

		pc.drawTip = function(){
			this.vinc('cell_linetip', 'auto');

			var tsize = this.cw*0.30;
			var tplus = this.cw*0.05;
			var header = "c_tip_";

			var clist = this.range.cells;
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				this.vdel([header+c]);
				if(line.lcntCell(c)==1 && bd.cell[c].qnum==-1){
					var dir=0, id=null;
					if     (bd.isLine(bd.ub(c))){ dir=2; id=bd.ub(c);}
					else if(bd.isLine(bd.db(c))){ dir=1; id=bd.db(c);}
					else if(bd.isLine(bd.lb(c))){ dir=4; id=bd.lb(c);}
					else if(bd.isLine(bd.rb(c))){ dir=3; id=bd.rb(c);}

					g.lineWidth = this.lw; //LineWidth
					if     (bd.border[id].error==1){ g.strokeStyle = this.errlinecolor1; g.lineWidth=g.lineWidth+1;}
					else if(bd.border[id].error==2){ g.strokeStyle = this.errlinecolor2;}
					else                           { g.strokeStyle = this.linecolor;}

					if(this.vnop(header+c,this.STROKE)){
						var px=bd.cell[c].cpx+1, py=bd.cell[c].cpy+1;
						if     (dir==1){ g.setOffsetLinePath(px,py ,-tsize, tsize ,0,-tplus , tsize, tsize, false);}
						else if(dir==2){ g.setOffsetLinePath(px,py ,-tsize,-tsize ,0, tplus , tsize,-tsize, false);}
						else if(dir==3){ g.setOffsetLinePath(px,py , tsize,-tsize ,-tplus,0 , tsize, tsize, false);}
						else if(dir==4){ g.setOffsetLinePath(px,py ,-tsize,-tsize , tplus,0 ,-tsize, tsize, false);}
						g.stroke();
					}
				}
			}
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decodeIcelom();
			this.decodeNumber16_yosenabe();
		};
		enc.pzlexport = function(type){
			this.encodeIcelom();
			this.encodeNumber16_yosenabe();
		};

		enc.decodeIcelom = function(){
			var bstr = this.outbstr;

			var a=0, c=0, twi=[16,8,4,2,1];
			for(var i=0;i<bstr.length;i++){
				var num = parseInt(bstr.charAt(i),32);
				for(var w=0;w<5;w++){
					if(c<bd.cellmax){
						bd.sQuC(c,(num&twi[w]?6:0));
						c++;
					}
				}
				if(c>=bd.cellmax){ a=i+1; break;}
			}
			this.outbstr = bstr.substr(a);
		};
		enc.encodeIcelom = function(){
			var cm = "", num=0, pass=0, twi=[16,8,4,2,1];
			for(var c=0;c<bd.cellmax;c++){
				if(bd.cell[c].ques===6){ pass+=twi[num];} num++;
				if(num==5){ cm += pass.toString(32); num=0; pass=0;}
			}
			if(num>0){ cm += pass.toString(32);}

			this.outbstr += cm;
		};

		enc.decodeNumber16_yosenabe = function(){
			var c=0, i=0, bstr = this.outbstr;
			for(i=0;i<bstr.length;i++){
				var obj = bd.cell[c], ca = bstr.charAt(i);

				if(this.include(ca,"0","9")||this.include(ca,"a","f"))
								  { obj.qnum = parseInt(ca,16);}
				else if(ca == '-'){ obj.qnum = parseInt(bstr.substr(i+1,2),16); i+=2;}
				else if(ca == '.'){ obj.qnum = -2;}
				else if(ca == 'i'){ obj.qdir = parseInt(bstr.substr(i+1,1),16); i+=1;}
				else if(ca == 'g'){ obj.qdir = parseInt(bstr.substr(i+1,2),16); i+=2;}
				else if(ca == 'h'){ obj.qdir = -2;}
				else if(ca >= 'j' && ca <= 'z'){ c += (parseInt(ca,36)-19);}

				c++;
				if(c >= bd.cellmax){ break;}
			}
			this.outbstr = bstr.substr(i+1);
		};
		enc.encodeNumber16_yosenabe = function(){
			var count=0, cm="";
			for(var c=0;c<bd.cellmax;c++){
				var pstr = "", qn = bd.cell[c].qnum, qd = bd.cell[c].qdir;

				if     (qn== -2          ){ pstr = ".";}
				else if(qn>=  0 && qn< 16){ pstr =       qn.toString(16);}
				else if(qn>= 16 && qn<256){ pstr = "-" + qn.toString(16);}
				else if(qd== -2          ){ pstr = "h";}
				else if(qd>=  0 && qd< 16){ pstr = "i" + qd.toString(16);}
				else if(qd>= 16 && qd<256){ pstr = "g" + qd.toString(16);}
				else{ count++;}

				if(count==0){ cm += pstr;}
				else if(pstr || count==17){ cm+=((18+count).toString(36)+pstr); count=0;}
			}
			if(count>0){ cm+=(18+count).toString(36);}

			this.outbstr += cm;
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeCell( function(obj,ca){
				if(ca.charAt(0)=='i'){ obj.ques=6; ca=ca.substr(1);}
				if(ca.charAt(0)=='o'){
					ca=ca.substr(1);
					if(!!ca){ obj.qnum=parseInt(ca);}
					else{ obj.qnum=-2;}
				}
				else if(!!ca&&ca!=='.'){ obj.qdir=parseInt(ca);}
			});
			this.decodeBorderLine();
		};
		fio.encodeData = function(){
			this.encodeCell( function(obj){
				var ca = "";
				if(obj.ques===6){ ca += "i";}
				if(obj.qnum!==-1){
					ca += "o";
					if(obj.qnum>=0){ ca += obj.qnum.toString();}
				}
				else if(obj.qdir>0){ ca += obj.qdir.toString();}

				return ((!!ca?ca:".")+" ");
			});
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

			this.performAsLine = false;
			var linfo = line.getLareaInfo();
			if( !this.checkDoubleNumber(linfo) ){
				this.setAlert('具材が繋がっています。','There are connected fillings.'); return false;
			}
			if( !this.checkLineOverLetter() ){
				this.setAlert('具材の上を線が通過しています。','A line goes through a filling.'); return false;
			}

			if( !this.checkAllArea(linfo, f_true, function(w,h,a,n){ return (w==1||h==1);}) ){
				this.setAlert('曲がっている線があります。','A line has curve.'); return false;
			}

			var iarea = ans.getCrockInfo();
			// 問題のチェック
			if( !this.checkAllCell(function(c){ return (bd.QuC(c)!==6 && bd.DiC(c)!==-1);} ) ){
				this.setAlert('鍋の外に数字が書いてあります。','There is a number out of a crock.'); return false;
			}

			if( !this.checkAllArea(iarea, function(c){ return bd.DiC(c)!==-1;}, function(w,h,a,n){ return a<=1;}) ){
				this.setAlert('鍋に数字が２つ以上書いてあります。','There is a number out of a crock.'); return false;
			}

			this.movedPosition(linfo);

			if( !this.checkFillingCount(iarea, this.getMoved) ){
				this.setAlert('具材の合計値が正しくありません。','Sum of filling is not equal to a crock.'); return false;
			}

			if( !this.checkNoObjectInRoom(iarea, this.getMoved) ){
				this.setAlert('具材のない鍋があります。','A crock has no circle.'); return false;
			}

			if( !this.checkAllCell(function(c){ return (ans.getMoved(c)!==-1 && bd.QuC(c)!==6);} ) ){
				this.setAlert('鍋に入っていない具材があります。','A filling isn\'t in a crock.'); return false;
			}

			this.performAsLine = true;
			if( !this.checkDisconnectLine(linfo) ){
				this.setAlert('○につながっていない線があります。','A line doesn\'t connect any circle.'); return false;
			}

			return true;
		};
		ans.check1st = function(){ return true;};

		ans.checkLineOverLetter = function(func){
			var result = true;
			for(var c=0;c<bd.cellmax;c++){
				if(line.lcntCell(c)>=2 && bd.isNum(c)){
					if(this.inAutoCheck){ return false;}
					if(result){ bd.sErBAll(2);}
					ans.setCellLineError(c,true);
					result = false;
				}
			}
			return result;
		};

		ans.movedPosition = function(linfo){
			this.before = new AreaInfo();
			for(var c=0;c<bd.cellmax;c++){ this.before.id[c]=c;}
			for(var r=1;r<=linfo.max;r++){
				if(linfo.room[r].idlist.length<=1){ continue;}
				var before=null, after=null;
				for(var i=0;i<linfo.room[r].idlist.length;i++){
					var c=linfo.room[r].idlist[i];
					if(line.lcntCell(c)===1){
						if(bd.isNum(c)){ before=c;}else{ after=c;}
					}
				}
				if(before!==null && after!==null){
					this.before.id[after]=before;
					this.before.id[before]=null;
				}
			}
		};
		ans.getMoved = function(cc){ return ((cc!==null && ans.before.id[cc]!==null) ? bd.QnC(ans.before.id[cc]) : -1);};
		ans.getBeforeCell = function(cc){ return ans.before.id[cc];};

		ans.getCrockInfo = function(){
			var iarea = new AreaInfo();
			for(var cc=0;cc<bd.cellmax;cc++){ iarea.id[cc]=(bd.QuC(cc)==6?0:null); }
			for(var cc=0;cc<bd.cellmax;cc++){
				if(iarea.id[cc]!==0){ continue;}
				iarea.max++;
				iarea[iarea.max] = {clist:[]};
				area.sc0(cc,iarea);

				iarea.room[iarea.max] = {idlist:iarea[iarea.max].clist};
			}
			return iarea;
		};
		
		ans.checkFillingCount = function(iarea, getval){
			var result = true;
			for(var id=1;id<=iarea.max;id++){
				var clist = iarea.room[id].idlist, num = null;
				for(var i=0;i<clist.length;i++){
					var qd = bd.DiC(clist[i]);
					if(qd!==-1){
						if(num!==null && num!==qd){ num=null; break;}
						num=qd;
					}
				}
				if(num===null){ continue;}

				var count = 0;
				for(var i=0;i<clist.length;i++){
					if(getval(clist[i])>=0){ count += getval(clist[i]);}
				}

				if(count>0 && num!==count){
					if(this.inAutoCheck){ return false;}
					bd.sErC(iarea.room[id].idlist,1);
					for(var i=0;i<clist.length;i++){
						bd.sErC([this.getBeforeCell(clist[i])],4);
					}
					result = false;
				}
			}
			return result;
		};
	}
};
