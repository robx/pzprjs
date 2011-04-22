//
// パズル固有スクリプト部 シャカシャカ版 shakashaka.js v3.4.0
//
pzprv3.custom.shakashaka = {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mousedown : function(){
		if(k.playmode){ this.inputTriangle(0);}
		if(k.editmode){ this.inputqnum();}
	},
	mouseup : function(){
		if(k.playmode && pp.getVal('use')==2 && this.notInputted()){
			this.inputTriangle(2);
		}
	},
	mousemove : function(){
		if(k.playmode && pp.getVal('use')==2 && this.mouseCell!==null){
			this.inputTriangle(1);
		}
	},

	inputTriangle : function(use2step){
		var use = pp.getVal('use'), cc;
		if(use!=2 || use2step==0){
			cc = this.cellid();
			if(cc===null || bd.isNum(cc)){ this.mousereset(); return;}
		}

		if(use==1){
			if(this.btn.Left){
				var dx = this.inputPoint.x - bd.cell[cc].px;
				var dy = this.inputPoint.y - bd.cell[cc].py;
				if(dx>0&&dx<=pc.cw/2){
					if(dy>0&&dy<=pc.ch/2){ this.inputData = 5;}
					else if  (dy>pc.ch/2){ this.inputData = 2;}
				}
				else if(dx>pc.cw/2){
					if(dy>0&&dy<=pc.ch/2){ this.inputData = 4;}
					else if  (dy>pc.ch/2){ this.inputData = 3;}
				}

				bd.sQaC(cc, (bd.QaC(cc)!==this.inputData?this.inputData:0));
				bd.sQsC(cc, 0);
			}
			else if(this.btn.Right){
				bd.sQaC(cc, 0);
				bd.sQsC(cc, (bd.QsC(cc)===0?1:0));
			}
		}
		else if(use==2){
			if(use2step==0){
				// 最初はどこのセルをクリックしたか取得するだけ
				this.firstPoint.set(this.inputPoint);
				this.mouseCell = cc;
				return;
			}

			var dx=(this.inputPoint.x-this.firstPoint.x), dy=(this.inputPoint.y-this.firstPoint.y);
			cc = this.mouseCell;

			if(use2step==1){
				// 一定以上動いていたら三角形を入力
				var diff = 12;
				if     (dx<=-diff && dy>= diff){ this.inputData=2;}
				else if(dx<=-diff && dy<=-diff){ this.inputData=5;}
				else if(dx>= diff && dy>= diff){ this.inputData=3;}
				else if(dx>= diff && dy<=-diff){ this.inputData=4;}

				if(this.inputData!==null){
					bd.sQaC(cc, (bd.QaC(cc)!==this.inputData)?this.inputData:0);
					bd.sQsC(cc, 0);
					this.mousereset();
				}
			}
			else if(use2step==2){
				// ほとんど動いていなかった場合は・を入力
				if(Math.abs(dx)<=3 && Math.abs(dy)<=3){
					bd.sQaC(cc, 0);
					bd.sQsC(cc, (bd.QsC(cc)==1?0:1));
				}
			}
		}
		else if(use==3){
			if(this.btn.Left){
				if     (bd.QsC(cc)===1){ bd.sQaC(cc,0); bd.sQsC(cc,0);}
				else if(bd.QaC(cc)===0){ bd.sQaC(cc,2); bd.sQsC(cc,0);}
				else if(bd.QaC(cc)===5){ bd.sQaC(cc,0); bd.sQsC(cc,1);}
				else{ bd.sQaC(cc,bd.QaC(cc)+1); bd.sQsC(cc,0);}
			}
			else if(this.btn.Right){
				if     (bd.QsC(cc)===1){ bd.sQaC(cc,5); bd.sQsC(cc,0);}
				else if(bd.QaC(cc)===0){ bd.sQaC(cc,0); bd.sQsC(cc,1);}
				else if(bd.QaC(cc)===2){ bd.sQaC(cc,0); bd.sQsC(cc,0);}
				else{ bd.sQaC(cc,bd.QaC(cc)-1); bd.sQsC(cc,0);}
			}
		}

		pc.paintCell(cc);
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
	numzero : true,

	numberIsWhite : true,

	maxnum : 4,
	isTri : function(c){ return (!!this.cell[c] && this.cell[c].qans!==0);},

	getSlopeWareaInfo : function(){
		var winfo = new pzprv3.core.AreaInfo();
		for(var c=0;c<this.cellmax;c++){ winfo.id[c]=(this.noNum(c)?0:null);}
		for(var c=0;c<this.cellmax;c++){
			if(winfo.id[c]!==0){ continue;}
			winfo.max++;
			winfo.room[winfo.max] = {idlist:[]};
			this.sw0(winfo, c, winfo.max);
		}
		return winfo;
	},
	sw0 : function(winfo,c,areaid){
		winfo.id[c] = areaid;
		winfo.room[areaid].idlist.push(c);
		var a=this.QaC(c), b, cc;
		cc=this.up(c); if(cc!==null){ b=this.QaC(cc); if(winfo.id[cc]===0 && (a!==4&&a!==5) && (b!==2&&b!==3)){ this.sw0(winfo,cc,areaid);} }
		cc=this.dn(c); if(cc!==null){ b=this.QaC(cc); if(winfo.id[cc]===0 && (a!==2&&a!==3) && (b!==4&&b!==5)){ this.sw0(winfo,cc,areaid);} }
		cc=this.lt(c); if(cc!==null){ b=this.QaC(cc); if(winfo.id[cc]===0 && (a!==2&&a!==5) && (b!==3&&b!==4)){ this.sw0(winfo,cc,areaid);} }
		cc=this.rt(c); if(cc!==null){ b=this.QaC(cc); if(winfo.id[cc]===0 && (a!==3&&a!==4) && (b!==2&&b!==5)){ this.sw0(winfo,cc,areaid);} }
	}
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

		pp.addChild('use_1', 'use', 'クリックした位置', 'Position of Cell');
		pp.addChild('use_2', 'use', 'ドラッグ入力', 'Drag Type');
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
