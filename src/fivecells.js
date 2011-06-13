//
// パズル固有スクリプト部 ファイブセルズ版 fivecells.js v3.4.0
//
pzprv3.custom.fivecells = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mousedown : function(){
		if(k.editmode){ this.inputqnum();}
		else if(k.playmode){
			if     (this.btn.Left) { this.inputborderans();}
			else if(this.btn.Right){ this.inputQsubLine();}
		}
	},
	mousemove : function(){
		if(k.playmode){
			if     (this.btn.Left) { this.inputborderans();}
			else if(this.btn.Right){ this.inputQsubLine();}
		}
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,

	keyinput : function(ca){
		if(ca=='w'){ this.key_inputvalid(ca);}
		else{ this.key_inputqnum(ca);}
	},
	key_inputvalid : function(ca){
		if(ca=='w'){
			var cc = tc.getTCC();
			if(cc!==null){
				bd.sQuC(cc,(bd.QuC(cc)!==7?7:0));
				bd.setNum(cc,-1);
				pc.paintCell(cc);
			}
		}
	},

	enablemake_p : true,
	paneltype    : 1
},

//---------------------------------------------------------
// 盤面管理系
Board:{
	isborder : 2,

	maxnum : 3,
	minnum : 0,

	initialize : function(pid){
		this.SuperFunc.initialize.call(this,pid);

		this.posthook.cell.ques = function(c){ this.areas.setCell(c);};

		this.akariinfo = []; /* インスタンス化 */
	},

	initBoardSize : function(col,row){
		this.SuperFunc.initBoardSize.call(this,col,row);

		var odd = (col*row)%5;
		if(odd>=1){ this.cell[this.cnum(this.minbx+1,this.minby+1)].ques=7;}
		if(odd>=2){ this.cell[this.cnum(this.maxbx-1,this.minby+1)].ques=7;}
		if(odd>=3){ this.cell[this.cnum(this.minbx+1,this.maxby-1)].ques=7;}
		if(odd>=4){ this.cell[this.cnum(this.maxbx-1,this.maxby-1)].ques=7;}
	},

	// 入力可能できないマスかどうか
	isEmpty : function(c){ return ( !this.cell[c] || this.cell[c].ques===7);},
	isValid : function(c){ return (!!this.cell[c] && this.cell[c].ques===0);},

	isBorder : function(id){
		return ((!!this.border[id] && (this.border[id].qans>0)) || this.isQuesBorder(id));
	},
	isQuesBorder : function(id){
		var cc1 = this.border[id].cellcc[0], cc2 = this.border[id].cellcc[1];
		return !!(this.isEmpty(cc1)^this.isEmpty(cc2));
	},

	getdir4Border_fivecells : function(cc){
		var cnt=0, cblist=this.getdir4cblist(cc);
		for(var i=0;i<cblist.length;i++){
			var tc=cblist[i][0], tid=cblist[i][1];
			if(tc===null || this.isEmpty(tc) || this.isBorder(tid)){ cnt++;}
		}
		return cnt;
	}
},

AreaManager:{
	hasroom : true
},


//---------------------------------------------------------
// 画像表示系
Graphic:{
	setColors : function(){
		this.gridcolor = this.gridcolor_DLIGHT;
	},
	paint : function(){
		this.drawBGCells();

		this.drawValidDashedGrid();
		this.drawQansBorders();
		this.drawQuesBorders();

		this.drawNumbers();
		this.drawBorderQsubs();

		this.drawTarget();
	},

	getQansBorderColor : function(border){
		if(border.qans===1){
			var err = border.error;
			if     (err===1){ return this.errcolor1;          }
			else if(err===2){ return this.errborderQanscolor2;}
			else            { return this.borderQanscolor;    }
		}
		return null;
	},
	getQuesBorderColor : function(border){
		return (bd.isQuesBorder(border.id) ? this.cellcolor : null);
	},

	drawValidDashedGrid : function(){
		var g = this.vinc('grid_waritai', 'crispEdges');

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
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		this.decodeFivecells();
	},
	pzlexport : function(type){
		this.encodeFivecells();
	},

	// decode/encodeNumber10関数の改造版にします
	decodeFivecells : function(){
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
	},
	encodeFivecells : function(){
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
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCell( function(obj,ca){
			obj.ques = 0;
			if     (ca==="*"){ obj.ques = 7;}
			else if(ca==="-"){ obj.qnum = -2;}
			else if(ca!=="."){ obj.qnum = parseInt(ca);}
		});
		this.decodeBorderAns();
	},
	encodeData : function(){
		this.encodeCell( function(obj){
			if     (obj.ques=== 7){ return "* ";}
			else if(obj.qnum===-2){ return "- ";}
			else if(obj.qnum>=  0){ return (obj.qnum.toString() + " ");}
			else                  { return ". ";}
		});
		this.encodeBorderAns();
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		var rinfo = bd.areas.getRoomInfo();
		if( !this.checkAllArea(rinfo, function(w,h,a,n){ return (a>=5);} ) ){
			this.setAlert('サイズが5マスより小さいブロックがあります。','The size of block is smaller than five.'); return false;
		}

		if( !this.checkdir4BorderAns() ){
			this.setAlert('数字の周りにある境界線の本数が違います。','The number is not equal to the number of border lines around it.'); return false;
		}

		if( !this.checkLcntCross(1,0) ){
			this.setAlert('途中で途切れている線があります。','There is a dead-end line.'); return false;
		}

		if( !this.checkAllArea(rinfo, function(w,h,a,n){ return (a<=5);} ) ){
			this.setAlert('サイズが5マスより大きいブロックがあります。','The size of block is larger than five.'); return false;
		}

		return true;
	},

	checkdir4BorderAns : function(){
		var result = true;
		for(var c=0;c<bd.cellmax;c++){
			if(bd.isValidNum(c) && bd.getdir4Border_fivecells(c)!==bd.QnC(c)){
				if(this.inAutoCheck){ return false;}
				bd.sErC([c],1);
				result = false;
			}
		}
		return result;
	}
}
};
