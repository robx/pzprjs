//
// パズル固有スクリプト部 Tapa版 tapa.js
//
(function(){

	function sameArray(array1, array2){
		if(array1.length!==array2.length){ return false;}
		for(var k=0;k<array2.length;k++){
			if(array1[k]!==array2[k]){ return false;}
		}
		return true;
	}

pzpr.classmgr.makeCustom(['tapa'], {
//---------------------------------------------------------
// マウス入力系
MouseEvent:{
	mouseinput : function(){
		if(this.owner.playmode){
			if(this.mousestart || this.mousemove){ this.inputcell_tapa();}
		}
		else if(this.owner.editmode){
			if(this.mousestart){ this.inputqnum_tapa();}
		}
	},

	// 条件部分にあるqnumがqnumsに変わっているだけですが。。
	inputcell_tapa : function(){
		var cell = this.getcell();
		if(cell.isnull || cell===this.mouseCell){ return;}
		if(this.inputData===null){ this.decIC(cell);}

		this.mouseCell = cell;

		if(cell.numberRemainsUnshaded && cell.qnums.length!==0 && (this.inputData===1||(this.inputData===2 && this.owner.painter.bcolor==="white"))){ return;}
		if(this.RBShadeCell && this.inputData===1){
			if(this.firstCell.isnull){ this.firstCell = cell;}
			var cell0 = this.firstCell;
			if(((cell0.bx&2)^(cell0.by&2))!==((cell.bx&2)^(cell.by&2))){ return;}
		}

		(this.inputData===1?cell.setShade:cell.clrShade).call(cell);
		cell.setQsub(this.inputData===2?1:0);

		cell.draw();
	},
	decIC : function(cell){
		if(this.owner.getConfig('use')===1){
			if     (this.btn.Left) { this.inputData=(cell.isUnshade()? 1 : 0); }
			else if(this.btn.Right){ this.inputData=((cell.qsub!==1) ? 2 : 0); }
		}
		else if(this.owner.getConfig('use')===2){
			if(cell.numberRemainsUnshaded && cell.qnums.length!==0){
				this.inputData=((cell.qsub!==1)? 2 : 0);
			}
			else if(this.btn.Left){
				if     (cell.isShade()){ this.inputData=2;}
				else if(cell.qsub===1) { this.inputData=0;}
				else{ this.inputData=1;}
			}
			else if(this.btn.Right){
				if     (cell.isShade()){ this.inputData=0;}
				else if(cell.qsub===1) { this.inputData=1;}
				else{ this.inputData=2;}
			}
		}
	},

	inputqnum_tapa : function(){
		var cell = this.getcell();
		if(cell.isnull || cell===this.mouseCell){ return;}

		if(cell!==this.cursor.getc()){
			this.setcursor(cell);
		}
		else{
			this.inputqnum_tapa_main(cell);
		}
		this.mouseCell = cell;
	},
	inputqnum_tapa_main : function(cell){
		var states = cell.qnum_states, state = 0;
		for(var i=0;i<states.length;i++){
			if(sameArray(cell.qnums, states[i])){ state = i; break;}
		}

		if(this.btn.Left){
			if(state<states.length-1){ state++;}
			else{ state = 0;}
		}
		else if(this.btn.Right){
			if(state>0){ state--;}
			else{ state = states.length-1;}
		}
		cell.setNums(states[state]);

		cell.draw();
	}
},

//---------------------------------------------------------
// キーボード入力系
KeyEvent:{
	enablemake : true,

	keyinput : function(ca){
		this.key_inputqnum_tapa(ca);
	},
	key_inputqnum_tapa : function(ca){
		var cell = this.cursor.getc(), nums = cell.qnums, val=[];

		if(('0'<=ca && ca<='8') || ca==='-'){
			var num = (ca!=='-' ? +ca : -2);
			if(this.prev===cell && nums.length<=3){
				for(var i=0;i<nums.length;i++){ val.push(nums[i]);}
			}
			val.push(num);
			if(val.length>1){
				var sum = 0;
				for(var i=0;i<val.length;i++){ sum+=(val[i]>=0?val[i]:1);}
				if((val.length+sum)>8){ val = [num];}
				else{
					for(var i=0;i<val.length;i++){ if(val[i]===0){val=[num]; break;}}
				}
			}
		}
		else if(ca===' '){ val = [];}
		else{ return;}

		cell.setNums(val);

		this.prev = cell;
		cell.draw();
	}
},

//---------------------------------------------------------
// 盤面管理系
Cell:{
	minnum : 0,
	qnums  : null, // Array型
	qnum_states : (function(){
		var states = [ [],[-2],[0],[1],[2],[3],[4],[5],[6],[7],[8] ], sum=0;
		for(var n1=0;n1<=5;n1++){ for(var n2=0;n2<=5;n2++){
			sum = (n1>0?n1:1)+(n2>0?n2:1);
			if(sum<=6){ states.push([(n1>0?n1:-2),(n2>0?n2:-2)]);}
		}}
		for(var n1=0;n1<=3;n1++){ for(var n2=0;n2<=3;n2++){ for(var n3=0;n3<=3;n3++){
			sum = (n1>0?n1:1)+(n2>0?n2:1)+(n3>0?n3:1);
			if(sum<=5){	states.push([(n1>0?n1:-2),(n2>0?n2:-2),(n3>0?n3:-2)]);}
		}}}
		states.push([1,1,1,1]);
		return states;
	})(),
	
	numberRemainsUnshaded : true,
	
	initialize : function(){
		this.qnums = [];
	},
	setNums : function(val){
		this.setQnums(val);
		this.setQans(0);
		this.setQsub(0);
	},
	setQnums : function(val){
		if(sameArray(this.qnums, val)){ return;}
		this.addOpeQnums(this.qnums, val);
		this.qnums = val;
	},
	addOpeQnums : function(old, val){
		if(sameArray(old, val)){ return;}
		this.owner.opemgr.add(new this.owner.ObjectOperation2(this, old, val));
	},

	getShadedLength : function(){
		var addrs = [], result = [], shaded = "";
		var bx = this.bx, by = this.by, bd = this.owner.board;
		if(bx>bd.minbx+1 && bx<bd.maxbx-1 && by>bd.minby+1 && by<bd.maxby-1){
			addrs = [-2,-2, 0,-2, 2,-2, 2,0, 2,2, 0,2, -2,2, -2,0];
		}
		else if(bx===bd.minbx+1){ addrs = [0,-2,  2,-2,  2, 0,  2, 2,  0,2];}
		else if(by===bd.minby+1){ addrs = [2, 0,  2, 2,  0, 2, -2, 2, -2,0];}
		else if(bx===bd.maxbx-1){ addrs = [0,-2, -2,-2, -2, 0, -2, 2,  0,2];}
		else if(by===bd.maxby-1){ addrs = [2, 0,  2,-2,  0,-2, -2,-2, -2,0];}
		for(var k=0;k<addrs.length;k+=2){
			var cell = this.relcell(addrs[k],addrs[k+1]);
			if(!cell.isnull){ shaded += ""+(cell.isShade()?1:0);}
		}
		var shades = shaded.split(/0+/);
		if(shades.length>0){
			if(shades[0].length===0){ shades.shift();}
			if(shades[shades.length-1].length===0){ shades.pop();}
			if(shaded.length===8 && shades.length>1 && shaded.charAt(0)==='1' && shaded.charAt(7)==='1'){
				shades[0] += shades.pop();
			}
			for(var i=0;i<shades.length;i++){ result.push(shades[i].length);}
		}
		if(result.length===0){ result = [0];}
		return result;
	}
},
CellList:{
	allclear : function(isrec){
		pzpr.common.CellList.prototype.allclear.call(this,isrec);
		
		for(var i=0;i<this.length;i++){
			var cell = this[i];
			if(cell.qnums.length>0){
				if(isrec){ cell.addOpeQnums(cell.qnums, []);}
				cell.qnums = [];
			}
		}
	}
},
"ObjectOperation2:Operation":{
	setData : function(cell, old, val){
		this.bx = cell.bx;
		this.by = cell.by;
		this.old = old;
		this.val = val;
		this.property = 'qnums';
	},
	decode : function(strs){
		if(strs.shift()!=='CR'){ return false;}
		this.bx = +strs.shift();
		this.by = +strs.shift();
		var str = strs.join(',');
		var strs2 = str.substr(1,str.length-2).split(/\],\[/);
		if(strs2[0].length===0){ this.old = [];}
		else{
			this.old = strs2[0].split(/,/);
			for(var i=0;i<this.old.length;i++){ this.old[i] = +this.old[i];}
		}
		if(strs2[1].length===0){ this.val = [];}
		else{
			this.val = strs2[1].split(/,/);
			for(var i=0;i<this.val.length;i++){ this.val[i] = +this.val[i];}
		}
		return true;
	},
	toString : function(){
		return ['CR', this.bx, this.by, '['+this.old.join(',')+']', '['+this.val.join(',')+']'].join(',');
	},

	isModify : function(lastope){
		// 前回と同じ場所なら前回の更新のみ
		if( lastope.property === this.property &&
			lastope.bx       === this.bx &&
			lastope.by       === this.by &&
			sameArray(lastope.val, this.old)
		)
		{
			lastope.val = this.val;
			return true;
		}
		return false;
	},

	undo : function(){ this.exec(this.old);},
	redo : function(){ this.exec(this.val);},
	exec : function(val){
		var puzzle = this.owner, cell = puzzle.board.getc(this.bx, this.by);
		cell.setQnums(val);
		cell.draw();
		puzzle.checker.resetCache();
	}
},

OperationManager:{
	initialize : function(){
		this.common.initialize.call(this);
		
		this.operationlist.push(this.owner.ObjectOperation2);
	}
},

AreaShadeManager:{
	enabled : true
},

Flags:{
	use    : true,
	redblk : true
},

//---------------------------------------------------------
// 画像表示系
Graphic:{
	paint : function(){
		this.drawBGCells();
		this.drawDotCells(false);
		this.drawGrid();
		this.drawShadedCells();

		this.drawNumbers_tapa();

		this.drawChassis();

		this.drawTarget();
	},
	
	drawNumbers_tapa : function(){
		var g = this.vinc('cell_number', 'auto');
		var bw = this.bw, bh = this.bh, basesize = this.fontsizeratio[0];
		var opts = [
			{ option:{ratio:[basesize]},     pos:[{x:0,y:0}] },
			{ option:{ratio:[basesize*0.7]}, pos:[{x:-0.4,y:-0.4},{x:0.4,y:0.4}] },
			{ option:{ratio:[basesize*0.6]}, pos:[{x:-0.5,y:-0.4},{x:0,y:0.4},{x:0.5,y:-0.4}] },
			{ option:{ratio:[basesize*0.5]}, pos:[{x:0,y:-0.5},{x:0.55,y:0},{x:0,y:0.5},{x:-0.55,y:0}] }
		];

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i], bx = cell.bx, by = cell.by;
			var nums = cell.qnums, n = nums.length;

			g.fillStyle = this.getCellNumberColor(cell);
			for(var k=0;k<4;k++){
				g.vid = "cell_text_"+cell.id+"_"+k;
				if(k<n && nums[k]!==-1){
					var opt = opts[n-1], px = (bx+opt.pos[k].x)*bw, py = (by+opt.pos[k].y)*bh;
					var text = (nums[k]>=0?""+nums[k]:"?");
					this.disptext(text, px, py, opt.option);
				}
				else{ g.vhide();}
			}
		}
	}
},

//---------------------------------------------------------
// URLエンコード/デコード処理
Encode:{
	decodePzpr : function(type){
		this.decodeNumber_tapa();
	},
	encodePzpr : function(type){
		this.encodeNumber_tapa();
	},

	decodeNumber_tapa : function(){
		var c=0, i=0, bstr = this.outbstr, bd = this.owner.board;
		for(i=0;i<bstr.length;i++){
			var cell = bd.cell[c], ca = bstr.charAt(i);

			if(this.include(ca,"0","8")){ cell.qnums = [parseInt(ca,10)];}
			else if(ca === '9'){ cell.qnums = [1,1,1,1];}
			else if(ca === '.'){ cell.qnums = [-2];}
			else if(this.include(ca,"a","f")){
				var num = parseInt(bstr.substr(i,2),36), val = [];
				if(num>=360 && num<396){
					num -= 360;
					val = [0,0];
					val[0] = (num/6)|0; num-=val[0]*6;
					val[1] = num;
				}
				else if(num>=396 && num<460){
					num -= 396;
					val = [0,0,0];
					val[0] = (num/16)|0; num-=val[0]*16;
					val[1] = (num/ 4)|0; num-=val[1]*4;
					val[2] = num;
				}
				else if(num>=460 && num<476){
					num -= 460;
					val = [0,0,0,0];
					val[0] = (num/8)|0; num-=val[0]*8;
					val[1] = (num/4)|0; num-=val[1]*4;
					val[2] = (num/2)|0; num-=val[2]*2;
					val[3] = num;
				}
				for(var k=0;k<4;k++){ if(val[k]===0){ val[k] = -2;}}
				cell.qnums = val;
				i++;
			}
			else if(ca >= 'g' && ca <= 'z'){ c += (parseInt(ca,36)-16);}

			c++;
			if(c>=bd.cellmax){ break;}
		}
		this.outbstr = bstr.substr(i+1);
	},
	encodeNumber_tapa : function(){
		var count=0, cm="", bd = this.owner.board;
		for(var c=0;c<bd.cellmax;c++){
			var pstr = "", qn = bd.cell[c].qnums;

			if(qn.length===1){
				if(qn[0]===-2){ pstr = ".";}
				else{ pstr = qn[0].toString(10);}
			}
			else if(qn.length===2){
				pstr = ((qn[0]>0?qn[0]:0)*6 + (qn[1]>0?qn[1]:0) + 360).toString(36);
			}
			else if(qn.length===3){
				pstr = ((qn[0]>0?qn[0]:0)*16 + (qn[1]>0?qn[1]:0)*4 + (qn[2]>0?qn[2]:0) + 396).toString(36);
			}
			else if(qn.length===4){
				if(sameArray(qn,[1,1,1,1])){ pstr = '9';}
				else{
					pstr = ((qn[0]>0?1:0)*8 + (qn[1]>0?1:0)*4 + (qn[2]>0?1:0)*2 + (qn[3]>0?1:0) + 460).toString(36);
				}
			}
			else{ count++;}

			if(count===0){ cm += pstr;}
			else if(pstr || count===20){ cm+=((15+count).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm+=(15+count).toString(36);}

		this.outbstr += cm;
	}
},
//---------------------------------------------------------
FileIO:{
	decodeData : function(){
		this.decodeCellQnumAns_tapa();
	},
	encodeData : function(){
		this.encodeCellQnumAns_tapa();
	},

	decodeCellQnumAns_tapa : function(){
		this.decodeCell( function(cell,ca){
			if     (ca==="#"){ cell.qans = 1;}
			else if(ca==="+"){ cell.qsub = 1;}
			else if(ca!=="."){
				cell.qnums = [];
				var array = ca.split(/,/);
				for(var i=0;i<array.length;i++){
					cell.qnums.push(array[i]!=="-"?+array[i]:-2);
				}
			}
		});
	},
	encodeCellQnumAns_tapa : function(){
		this.encodeCell( function(cell){
			if(cell.qnums.length>0){
				var array = [];
				for(var i=0;i<cell.qnums.length;i++){
					array.push(cell.qnums[i]>=0?""+cell.qnums[i]:"-");
				}
				return (array.join(',')+" ");
			}
			else if(cell.qans===1){ return "# ";}
			else if(cell.qsub===1){ return "+ ";}
			else                  { return ". ";}
		});
	}
},

//---------------------------------------------------------
// 正解判定処理実行部
AnsCheck:{
	checklist : [
		"check2x2ShadeCell",
		"checkCountOfClueCell",
		"checkConnectShade+"
	],

	checkCountOfClueCell : function(){
		this.checkAllCell(function(cell){ // trueになるマスがエラー扱い
			if(cell.qnums.length===0){ return false;}
			var shades = cell.getShadedLength(); // 順番の考慮は不要
			if(cell.qnums.length!==shades.length){ return true;}
			var result = true;
			for(var i=0,imax=cell.qnums.length;i<imax;i++){
				for(var k=i,kmax=i+shades.length;k<kmax;k++){
					if(cell.qnums[k%imax]>=0 && cell.qnums[k%imax]!==shades[k-i]){ break;}
				}
				if(k===kmax){ result = false; break;}
			}
			return result;
		}, "ceTapaNe");
	}
},

FailCode:{
	ceTapaNe : ["数字と周囲の黒マスの長さが異なっています。","The number is not equal to the length of surrounding shaded cells."]
}
});

})();
