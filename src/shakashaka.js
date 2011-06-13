//
// パズル固有スクリプト部 シャカシャカ版 shakashaka.js v3.4.0
//
pzprv3.custom.shakashaka = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mousedown : function(){
		if(k.playmode){
			if(pp.getVal('use')==3){ this.inputTriangle_onebtn();}
			else if(this.btn.Left){
				if     (pp.getVal('use')==1){ this.inputTriangle_corner();}
				else if(pp.getVal('use')==2){ this.inputTriangle_pull_start();}
			}
			else if(this.btn.Right){
				this.inputDot();
			}
		}
		if(k.editmode){ this.inputqnum();}
	},
	mouseup : function(){
		if(k.playmode){
			if(pp.getVal('use')==2 && this.inputData===null){
				this.inputTriangle_pull_end();
			}
		}
	},
	mousemove : function(){
		if(k.playmode){
			if(this.inputData===null){
				if(pp.getVal('use')==2){  this.inputTriangle_pull_move();}
			}
			else if(this.inputData>=2 && this.inputData<=5){
				this.inputTriangle_drag();
			}
			else{ // this.inputData==0か-1
				this.inputDot();
			}
		}
	},

	inputTriangle_corner : function(){
		var cc = this.cellid();
		if(cc===null || bd.isNum(cc)){ return;}

		this.inputData = this.checkCornerData(cc);
		if(this.inputData===bd.QaC(cc)){ this.inputData = 0;}

		this.setAnswer(cc, this.inputData);
		this.mouseCell = cc;
		pc.paintCell(cc);
	},
	checkCornerData : function(cc){
		var dx = this.inputPoint.x - bd.cell[cc].cpx;
		var dy = this.inputPoint.y - bd.cell[cc].cpy;
		if(dx<=0){ return ((dy<=0)?5:2);}
		else     { return ((dy<=0)?4:3);}
	},

	inputTriangle_pull_start : function(){
		var cc = this.cellid();
		if(cc===null || bd.isNum(cc)){ this.mousereset(); return;}

		// 最初はどこのセルをクリックしたか取得するだけ
		this.firstPoint.set(this.inputPoint);
		this.mouseCell = cc;
	},
	inputTriangle_pull_move : function(){
		var cc = this.mouseCell;
		var dx = (this.inputPoint.x-this.firstPoint.x);
		var dy = (this.inputPoint.y-this.firstPoint.y);

		// 一定以上動いていたら三角形を入力
		var diff = 12;
		if     (dx<=-diff && dy>= diff){ this.inputData = 2;}
		else if(dx<=-diff && dy<=-diff){ this.inputData = 5;}
		else if(dx>= diff && dy>= diff){ this.inputData = 3;}
		else if(dx>= diff && dy<=-diff){ this.inputData = 4;}

		if(this.inputData!==null){
			if(this.inputData===bd.QaC(cc)){ this.inputData = 0;}
			this.setAnswer(cc, this.inputData);
			this.mouseCell = cc;
		}
		pc.paintCell(cc);
	},
	inputTriangle_pull_end : function(){
		var dx = (this.inputPoint.x-this.firstPoint.x);
		var dy = (this.inputPoint.y-this.firstPoint.y);

		// ほとんど動いていなかった場合は・を入力
		if(Math.abs(dx)<=3 && Math.abs(dy)<=3){
			var cc = this.mouseCell;
			this.setAnswer(cc,(bd.QsC(cc)!==1?-1:0));
			pc.paintCell(cc);
		}
	},

	inputTriangle_drag : function(){
		if(this.inputData===null || this.inputData<=0){ return;}

		var cc = this.cellid();
		if(cc===null || bd.isNum(cc)){ return;}

		var dbx=bd.cell[cc].bx-bd.cell[this.mouseCell].bx;
		var dby=bd.cell[cc].by-bd.cell[this.mouseCell].by;
		var tri=this.checkCornerData(cc), ret=null, cur=this.inputData;
		if((dbx===2 && dby===2)||(dbx===-2 && dby===-2)){ // 左上・右下
			if(cur===2||cur===4){ ret=cur;}
		}
		else if((dbx===2 && dby===-2)||(dbx===-2 && dby===2)){ // 右上・左下
			if(cur===3||cur===5){ ret=cur;}
		}
		else if(dbx===0 && dby===-2){ // 上下反転(上側)
			if(((cur===2||cur===3)&&(tri!==cur))||((cur===4||cur===5)&&(tri===cur))){
				ret=[null,null,5,4,3,2][cur];
			}
		}
		else if(dbx===0 && dby===2){  // 上下反転(下側)
			if(((cur===4||cur===5)&&(tri!==cur))||((cur===2||cur===3)&&(tri===cur))){
				ret=[null,null,5,4,3,2][cur];
			}
		}
		else if(dbx===-2 && dby===0){ // 左右反転(左側)
			if(((cur===3||cur===4)&&(tri!==cur))||((cur===2||cur===5)&&(tri===cur))){
				ret=[null,null,3,2,5,4][cur];
			}
		}
		else if(dbx===2 && dby===0){  // 左右反転(右側)
			if(((cur===2||cur===5)&&(tri!==cur))||((cur===3||cur===4)&&(tri===cur))){
				ret=[null,null,3,2,5,4][cur];
			}
		}

		if(ret!==null){
			this.setAnswer(cc,ret);
			this.inputData = ret;
			this.mouseCell = cc;
			pc.paintCell(cc);
		}
	},
	inputDot : function(){
		var cc = this.cellid();
		if(cc===null || bd.isNum(cc)){ return;}

		if(this.inputData===null){ this.inputData = (bd.QsC(cc)===1?0:-1);}

		this.setAnswer(cc, this.inputData);
		this.mouseCell = cc;
		pc.paintCell(cc);
	},

	inputTriangle_onebtn : function(){
		var cc = this.cellid();
		if(cc===null || bd.isNum(cc)){ return;}

		var ans = this.getAnswer(cc);
		if     (this.btn.Left) { this.inputData = [0,2,1,3,4,5,-1][ans+1];}
		else if(this.btn.Right){ this.inputData = [5,-1,1,0,2,3,4][ans+1];}
		this.setAnswer(cc, this.inputData);
		this.mouseCell = cc;
		pc.paintCell(cc);
	},

	getAnswer : function(c){
		if(c===null || bd.isNum(c)){ return 0;}
		if     (bd.QaC(c)>0)  { return bd.QaC(c);}
		else if(bd.QsC(c)===1){ return -1;}
		return 0;
	},
	setAnswer : function(c,val){
		if(c===null || bd.isNum(c)){ return;}
		bd.sQaC(c,((val>=2&&val<=5)?val:0));
		bd.sQsC(c,((val===-1)?1:0));
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,

	enablemake_p : true,
	paneltype    : 2
},

//---------------------------------------------------------
// 盤面管理系
Board:{
	numberIsWhite : true,

	maxnum : 4,
	minnum : 0,
	isTri : function(c){ return (!!this.cell[c] && this.cell[c].qans!==0);},

	getSlopeWareaInfo : function(){
		var winfo = new pzprv3.core.AreaInfo();
		for(var fc=0;fc<this.cellmax;fc++){ winfo.id[fc]=(this.noNum(fc)?0:null);}
		for(var fc=0;fc<this.cellmax;fc++){
			if(winfo.id[fc]!==0){ continue;}
			winfo.max++;
			winfo.room[winfo.max] = {idlist:[]};

			var stack=[fc], id=winfo.max;
			while(stack.length>0){
				var c=stack.pop();
				if(winfo.id[c]!==0){ continue;}
				winfo.id[c] = id;
				winfo.room[id].idlist.push(c);
				var a=this.QaC(c), b, cc;
				cc=this.up(c); if(cc!==null){ b=this.QaC(cc); if(winfo.id[cc]===0 && (a!==4&&a!==5) && (b!==2&&b!==3)){ stack.push(cc);} }
				cc=this.dn(c); if(cc!==null){ b=this.QaC(cc); if(winfo.id[cc]===0 && (a!==2&&a!==3) && (b!==4&&b!==5)){ stack.push(cc);} }
				cc=this.lt(c); if(cc!==null){ b=this.QaC(cc); if(winfo.id[cc]===0 && (a!==2&&a!==5) && (b!==3&&b!==4)){ stack.push(cc);} }
				cc=this.rt(c); if(cc!==null){ b=this.QaC(cc); if(winfo.id[cc]===0 && (a!==3&&a!==4) && (b!==2&&b!==5)){ stack.push(cc);} }
			}
		}
		return winfo;
	},
},

MenuExec:{
	adjustBoardData : function(key,d){
		var trans = [];
		switch(key){
			case this.FLIPY: trans=[0,1,5,4,3,2]; break;	// 上下反転
			case this.FLIPX: trans=[0,1,3,2,5,4]; break;	// 左右反転
			case this.TURNR: trans=[0,1,5,2,3,4]; break;	// 右90°回転
			case this.TURNL: trans=[0,1,3,4,5,2]; break;	// 左90°回転
			default: return;
		}
		for(var c=0;c<bd.cellmax;c++){
			var val=trans[bd.QaC(c)]; if(!!val){ bd.cell[c].qans=val;}
		}
	}
},

Menu:{
	menufix : function(){
		pp.addSelect('use','setting',(!ee.mobile?1:2),[1,2,3], '三角形の入力方法', 'Input Triangle Type');
		pp.setLabel ('use', '三角形の入力方法', 'Input Triangle Type');

		pp.addChild('use_1', 'use', 'クリックした位置', 'Corner-side');
		pp.addChild('use_2', 'use', '引っ張り入力', 'Pull-to-Input');
		pp.addChild('use_3', 'use', '1ボタン', 'One Button');
	}
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	hideHatena : true,

	setColors : function(){
		this.gridcolor = this.gridcolor_LIGHT;
		this.fontcolor = this.fontErrcolor = "white";
		this.setCellColorFunc('qnum');
	},
	paint : function(){
		this.drawBGCells();
		this.drawDotCells(false);
		this.drawDashedGrid();
		this.drawBlackCells();
		this.drawNumbers();

		this.drawTriangle();

		this.drawChassis();

		this.drawTarget();
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	pzlimport : function(type){
		this.decode4Cell();
	},
	pzlexport : function(type){
		this.encode4Cell();
	},

	decodeKanpen : function(){
		fio.decodeCellQnumb();
	},
	encodeKanpen : function(){
		fio.encodeCellQnumb();
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCellQnumb();
		this.decodeCellQanssub();
	},
	encodeData : function(){
		this.encodeCellQnumb();
		this.encodeCellQanssub();
	},

	kanpenOpen : function(){
		this.decodeCell( function(obj,ca){
			if     (ca==="5"){ obj.qnum = -2;}
			else if(ca!=="."){ obj.qnum = parseInt(ca);}
		});
		this.decodeCell( function(obj,ca){
			if     (ca==="+"){ obj.qsub = 1;}
			else if(ca!=="."){ obj.qans = parseInt(ca);}
		});
	},
	kanpenSave : function(){
		this.encodeCell( function(obj){
			if     (obj.qnum>=  0){ return (obj.qnum.toString() + " ");}
			else if(obj.qnum===-2){ return "5 ";}
			else                  { return ". ";}
		});
		this.encodeCell( function(obj){
			if     (obj.qsub=== 1){ return "+ ";}
			else if(obj.qans>=  2){ return (obj.qans.toString() + " ");}
			else                  { return ". ";}
		});
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checkAns : function(){

		if( !this.checkDir4Cell(function(c){ return bd.isTri(c);},2) ){
			this.setAlert('数字のまわりにある黒い三角形の数が間違っています。','The number of triangles in four adjacent cells is bigger than it.'); return false;
		}

		if( !this.checkWhiteArea() ){
			this.setAlert('白マスが長方形(正方形)ではありません。','A mass of white cells is not rectangle.'); return false;
		}

		if( !this.checkDir4Cell(function(c){ return bd.isTri(c);},1) ){
			this.setAlert('数字のまわりにある黒い三角形の数が間違っています。','The number of triangles in four adjacent cells is smaller than it.'); return false;
		}

		return true;
	},

	checkWhiteArea : function(){
		var result = true;
		var winfo = bd.getSlopeWareaInfo();
		for(var id=1;id<=winfo.max;id++){
			var clist=winfo.room[id].idlist, d=bd.getSizeOfClist(clist), cnt=0;
			for(var i=0;i<clist.length;i++){ if(bd.QaC(clist[i])===0){ cnt++;}}
			if(d.cols*d.rows!=cnt && !this.isAreaRect_slope(winfo,id)){
				if(this.inAutoCheck){ return false;}
				bd.sErC(clist,1);
				result = false;
			}
		}
		return result;
	},
	// 斜め領域判定用
	isAreaRect_slope : function(winfo,id){
		for(var i=0;i<winfo.room[id].idlist.length;i++){
			var c = winfo.room[id].idlist[i];
			var a = bd.QaC(c);
			if( ((a==4||a==5)^(bd.up(c)===null||winfo.id[bd.up(c)]!=id)) ||
				((a==2||a==3)^(bd.dn(c)===null||winfo.id[bd.dn(c)]!=id)) ||
				((a==2||a==5)^(bd.lt(c)===null||winfo.id[bd.lt(c)]!=id)) ||
				((a==3||a==4)^(bd.rt(c)===null||winfo.id[bd.rt(c)]!=id)) )
			{
				return false;
			}
		}
		return true;
	}
}
};
