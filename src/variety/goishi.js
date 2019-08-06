//
// パズル固有スクリプト部 碁石ひろい版 goishi.js
//
(function(pidlist, classbase){
	if(typeof module==='object' && module.exports){module.exports = [pidlist, classbase];}
	else{ pzpr.classmgr.makeCustom(pidlist, classbase);}
}(
['goishi'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.puzzle.playmode && this.mousestart){
			if(this.btn==='left'){ this.inputqans();}
		}
		else if(this.puzzle.editmode && this.mousestart){
			this.inputstone();
		}
	},

	inputstone : function(){
		var cell = this.getcell();
		if(cell.isnull){ return;}

		if(cell!==this.cursor.getc()){
			this.setcursor(cell);
		}
		cell.setStone();
		cell.draw();
	},
	inputqans : function(){
		var cell = this.getcell();
		if(cell.isnull || !cell.isStone() || cell.anum!==-1){ return;}

		var max=0, bd = this.board, bcell=bd.emptycell;
		for(var c=0;c<bd.cell.length;c++){
			var cell2 = bd.cell[c];
			if(cell2.anum>max){
				max = cell2.anum;
				bcell = cell2;
			}
		}

		// すでに1つ以上の碁石が取られている場合
		if(!bcell.isnull){
			var tmp, d = {x1:cell.bx, y1:cell.by, x2:bcell.bx, y2:bcell.by};

			// 自分の上下左右にmaxな碁石がない場合は何もしない
			if(d.x1!==d.x2 && d.y1!==d.y2){ return;}
			else if(d.x1===d.x2){
				if(d.y1>d.y2){ tmp=d.y2; d.y2=d.y1; d.y1=tmp;}
				d.y1+=2; d.y2-=2;
			}
			else{ // if(d.y1===d.y2)
				if(d.x1>d.x2){ tmp=d.x2; d.x2=d.x1; d.x1=tmp;}
				d.x1+=2; d.x2-=2;
			}
			// 間に碁石がある場合は何もしない
			for(var bx=d.x1;bx<=d.x2;bx+=2){ for(var by=d.y1;by<=d.y2;by+=2){
				var cell2 = bd.getc(bx,by);
				if(!cell2.isnull && cell2.isStone()){
					if(cell2.anum===-1 || (max>=2 && cell2.anum===max-1)){ return;}
				}
			} }
		}

		cell.setAnum(max+1);
		cell.draw();
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,

	keyinput : function(ca){
		this.key_inputstone(ca);
	},
	key_inputstone : function(ca){
		if(ca==='q'){
			var cell = this.cursor.getc();
			cell.setStone();
			cell.draw();
		}
	}
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	ques : 7,

	isStone : function(){ return this.ques!==7;},
	setStone : function(){
		if     (this.ques=== 7){ this.setQues(0);}
		else if(this.anum===-1){ this.setQues(7);} // 数字のマスは消せません
	}
},

Board:{
	disable_subclear : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	errcolor1 : "rgb(208, 0, 0)",
	errbcolor1 : "rgb(255, 192, 192)",

	paint : function(){
		this.drawCenterLines();

		this.drawCircles();
		this.drawCellSquare();
		this.drawAnsNumbers();

		this.drawTarget();
	},

	drawCenterLines : function(){
		var g = this.vinc('centerline', 'crispEdges', true), bd = this.board;

		var x1=this.range.x1, y1=this.range.y1, x2=this.range.x2, y2=this.range.y2;
		if(x1<bd.minbx+1){ x1=bd.minbx+1;} if(x2>bd.maxbx-1){ x2=bd.maxbx-1;}
		if(y1<bd.minby+1){ y1=bd.minby+1;} if(y2>bd.maxby-1){ y2=bd.maxby-1;}
		x1-=(~x1&1); y1-=(~y1&1); x2+=(~x2&1); y2+=(~y2&1); /* (x1,y1)-(x2,y2)を外側の奇数範囲まで広げる */

		g.lineWidth = 1;
		g.strokeStyle = this.gridcolor;
		for(var i=x1;i<=x2;i+=2){
			var px = i*this.bw, py1 = y1*this.bh, py2 = y2*this.bh;
			g.vid = "cliney_"+i;
			g.strokeLine(px, py1, px, py2);
		}
		for(var i=y1;i<=y2;i+=2){
			var py = i*this.bh, px1 = x1*this.bw, px2 = x2*this.bw;
			g.vid = "clinex_"+i;
			g.strokeLine(px1, py, px2, py);
		}
	},

	getCircleStrokeColor : function(cell){
		if(cell.isStone() && cell.anum===-1){
			return (cell.error===1 ? this.errcolor1 : this.quescolor);
		}
		return null;
	},
	getCircleFillColor : function(cell){
		if(cell.isStone() && cell.anum===-1){
			return (cell.error===1 ? this.errbcolor1 : "white");
		}
		return null;
	},

	drawCellSquare : function(){
		var g = this.vinc('cell_number_base', 'crispEdges');

		var rw = this.bw*0.8-2;
		var rh = this.bh*0.8-2;
		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i];

			g.vid = "c_sq_"+cell.id;
			if(cell.isStone() && cell.anum!==-1){
				g.fillStyle = (cell.error===1 ? this.errbcolor1 : "white");
				g.fillRectCenter(cell.bx*this.bw, cell.by*this.bh, rw, rh);
			}
			else{ g.vhide();}
		}
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodeGoishi();
	},
	encodePzpr : function(type){
		this.encodeGoishi();
	},

	decodeKanpen : function(){
		this.fio.decodeGoishi_kanpen();
	},
	encodeKanpen : function(){
		this.fio.encodeGoishi_kanpen();
	},

	decodeGoishi : function(){
		var bstr = this.outbstr, c=0, bd=this.board, twi=[16,8,4,2,1];
		bd.disableInfo();
		for(var i=0;i<bstr.length;i++){
			var num = parseInt(bstr.charAt(i),32);
			for(var w=0;w<5;w++){
				if(!!bd.cell[c]){
					bd.cell[c].setQues(num&twi[w]?7:0);
					c++;
				}
			}
			if(!bd.cell[c]){ break;}
		}
		bd.enableInfo();
		this.outbstr = bstr.substr(i+1);
	},
	// エンコード時は、盤面サイズの縮小という特殊処理を行ってます
	encodeGoishi : function(){
		var d = this.getSizeOfBoard_goishi();

		var cm="", count=0, pass=0, twi=[16,8,4,2,1];
		for(var by=d.y1;by<=d.y2;by+=2){
			for(var bx=d.x1;bx<=d.x2;bx+=2){
				var cell = this.board.getc(bx,by);
				if(cell.isnull || !cell.isStone()){ pass+=twi[count];} count++;
				if(count===5){ cm += pass.toString(32); count=0; pass=0;}
			}
		}
		if(count>0){ cm += pass.toString(32);}
		this.outbstr += cm;

		this.outcols = d.cols;
		this.outrows = d.rows;
	},

	getSizeOfBoard_goishi : function(){
		var x1=9999, x2=-1, y1=9999, y2=-1, count=0, bd = this.board;
		for(var c=0;c<bd.cell.length;c++){
			var cell = bd.cell[c];
			if(!cell.isStone()){ continue;}
			if(x1>cell.bx){ x1=cell.bx;}
			if(x2<cell.bx){ x2=cell.bx;}
			if(y1>cell.by){ y1=cell.by;}
			if(y2<cell.by){ y2=cell.by;}
			count++;
		}
		if(count===0){ return {x1:0, y1:0, x2:1, y2:1, cols:2, rows:2};}
		if(this.puzzle.getConfig('bdpadding')){ return {x1:x1-2, y1:y1-2, x2:x2+2, y2:y2+2, cols:(x2-x1+6)/2, rows:(y2-y1+6)/2};}
		return {x1:x1, y1:y1, x2:x2, y2:y2, cols:(x2-x1+2)/2, rows:(y2-y1+2)/2};
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeGoishiFile();
	},
	encodeData : function(){
		this.encodeGoishiFile();
	},

	kanpenOpen : function(){
		this.decodeGoishi_kanpen();
		this.decodeQansPos_kanpen();
	},
	kanpenSave : function(){
		this.encodeGoishi_kanpen();
		this.encodeQansPos_kanpen();
	},

	decodeGoishiFile : function(){
		this.decodeCell( function(cell,ca){
			if(ca!=='.'){
				cell.ques = 0;
				if(ca!=='0'){ cell.anum = +ca;}
			}
		});
	},
	encodeGoishiFile : function(){
		this.encodeCell( function(cell){
			if(cell.ques===0){
				return (cell.anum!==-1 ? cell.anum+" " : "0 ");
			}
			return ". ";
		});
	},

	decodeGoishi_kanpen : function(){
		this.decodeCell( function(cell,ca){
			if(ca==='1'){ cell.ques = 0;}
		});
	},
	encodeGoishi_kanpen : function(){
		var bd = this.board;
		for(var by=bd.minby+1;by<bd.maxby;by+=2){
			var data = '';
			for(var bx=bd.minbx+1;bx<bd.maxbx;bx+=2){
				data += (bd.getc(bx,by).isStone() ? "1 " : ". ");
			}
			this.writeLine(data);
		}
	},

	decodeQansPos_kanpen : function(){
		for(;;){
			var data = this.readLine();
			if(!data){ return;}
			var item = data.split(" ");
			if(item.length<=1){ return;}
			else{
				var cell = this.board.getc((+item[2])*2+1,(+item[1])*2+1);
				cell.ques = 0;
				cell.anum = +item[0];
			}
		}
	},
	encodeQansPos_kanpen : function(){
		var stones = [], bd = this.board;
		for(var by=bd.minby+1;by<bd.maxby;by+=2){ for(var bx=bd.minbx+1;bx<bd.maxbx;bx+=2){
			var cell = bd.getc(bx,by);
			if(cell.ques!==0 || cell.anum===-1){ continue;}

			var pos = [bx>>1, by>>1];
			stones[cell.anum-1] = pos;
		}}
		for(var i=0,len=stones.length;i<len;i++){
			var item = [(i+1), stones[i][1], stones[i][0]];
			this.writeLine(item.join(" "));
		}
	},

	kanpenOpenXML : function(){
		this.decodeCellQnum_goishi_XMLBoard();
		this.decodeQansPos_XMLAnswer();
	},
	kanpenSaveXML : function(){
		this.encodeCellQnum_goishi_XMLBoard();
		this.encodeQansPos_XMLAnswer();
	},

	decodeCellQnum_goishi_XMLBoard : function(){
		this.decodeCellXMLBoard(function(cell, val){
			if(val===1){ cell.ques = 0;}
		});
	},
	encodeCellQnum_goishi_XMLBoard : function(){
		this.encodeCellXMLBoard(function(cell){
			return (cell.ques===0 ? '1' : null);
		});
	},

	decodeQansPos_XMLAnswer : function(){
		var nodes = this.xmldoc.querySelectorAll('answer picked');
		for(var i=0;i<nodes.length;i++){
			var node = nodes[i];
			var bx = 2*(+node.getAttribute('c'))-1;
			var by = 2*(+node.getAttribute('r'))-1;
			this.board.getc(bx,by).anum = +node.getAttribute('n');
		}
	},
	encodeQansPos_XMLAnswer : function(){
		var boardnode = this.xmldoc.querySelector('answer');
		var bd = this.board;
		for(var ans=1;;ans++){
			var cell = null;
			for(var c=0;c<bd.cell.length;c++){
				if(bd.cell[c].anum===ans){ cell = bd.cell[c]; break;}
			}
			if(!cell){ break;}
			boardnode.appendChild(this.createXMLNode('picked',{n:ans,r:(cell.by>>1)+1,c:(cell.bx>>1)+1}));
		}
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checklist : [
		"checkStoneExist",
		"checkPickedStone"
	],

	checkStoneExist : function(){
		if(!this.puzzle.execConfig('allowempty')){
			if(this.board.cell.some(function(cell){ return cell.isStone();})){ return;}
			this.failcode.add("brNoStone");
		}
	},

	checkPickedStone :function(){
		this.checkAllCell(function(cell){ return (cell.isStone() && cell.anum===-1);}, "goishiRemains");
	}
},

FailCode:{
	brNoStone : ["盤面に碁石がありません。","There are no goishis on the board."],
	goishiRemains : ["拾われていない碁石があります。","There is remaining Goishi."]
}
}));
