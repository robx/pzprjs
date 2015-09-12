// FileDataCommon.js v3.4.1

pzpr.classmgr.makeCommon({
//---------------------------------------------------------
FileIO:{
	//---------------------------------------------------------------------------
	// fio.decodeCellQnum() 問題数字のデコードを行う
	// fio.encodeCellQnum() 問題数字のエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellQnum : function(){
		this.decodeCell( function(obj,ca){
			if     (ca==="-"){ obj.qnum = -2;}
			else if(ca!=="."){ obj.qnum = parseInt(ca);}
		});
	},
	encodeCellQnum : function(){
		this.encodeCell( function(obj){
			if     (obj.qnum>=0)  { return (obj.qnum.toString()+" ");}
			else if(obj.qnum===-2){ return "- ";}
			else                  { return ". ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeCellQnumb() 黒背景な問題数字のデコードを行う
	// fio.encodeCellQnumb() 黒背景な問題数字のエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellQnumb : function(){
		this.decodeCell( function(obj,ca){
			if     (ca==="5"){ obj.qnum = -2;}
			else if(ca!=="."){ obj.qnum = parseInt(ca);}
		});
	},
	encodeCellQnumb : function(){
		this.encodeCell( function(obj){
			if     (obj.qnum>=0)  { return (obj.qnum.toString()+" ");}
			else if(obj.qnum===-2){ return "5 ";}
			else                  { return ". ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeCellQnumAns() 問題数字＋黒マス白マスのデコードを行う
	// fio.encodeCellQnumAns() 問題数字＋黒マス白マスのエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellQnumAns : function(){
		this.decodeCell( function(obj,ca){
			if     (ca==="#"){ obj.qans = 1;}
			else if(ca==="+"){ obj.qsub = 1;}
			else if(ca==="-"){ obj.qnum = -2;}
			else if(ca!=="."){ obj.qnum = parseInt(ca);}
		});
	},
	encodeCellQnumAns : function(){
		this.encodeCell( function(obj){
			if     (obj.qnum>=0) { return (obj.qnum.toString() + " ");}
			else if(obj.qnum===-2){return "- ";}
			else if(obj.qans===1){ return "# ";}
			else if(obj.qsub===1){ return "+ ";}
			else                 { return ". ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeCellDirecQnum() 方向＋問題数字のデコードを行う
	// fio.encodeCellDirecQnum() 方向＋問題数字のエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellDirecQnum : function(){
		this.decodeCell( function(obj,ca){
			if(ca!=="."){
				var inp = ca.split(",");
				obj.qdir = (inp[0]!=="0"?parseInt(inp[0]): 0);
				obj.qnum = (inp[1]!=="-"?parseInt(inp[1]):-2);
			}
		});
	},
	encodeCellDirecQnum : function(){
		this.encodeCell( function(obj){
			if(obj.qnum!==-1){
				var ca1 = (obj.qdir!== 0?obj.qdir.toString():"0");
				var ca2 = (obj.qnum!==-2?obj.qnum.toString():"-");
				return [ca1, ",", ca2, " "].join('');
			}
			else{ return ". ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeCellAns() 黒マス白マスのデコードを行う
	// fio.encodeCellAns() 黒マス白マスのエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellAns : function(){
		this.decodeCell( function(obj,ca){
			if     (ca==="#"){ obj.qans = 1;}
			else if(ca==="+"){ obj.qsub = 1;}
		});
	},
	encodeCellAns : function(){
		this.encodeCell( function(obj){
			if     (obj.qans===1){ return "# ";}
			else if(obj.qsub===1){ return "+ ";}
			else                 { return ". ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeCellQanssub() 黒マスと背景色のデコードを行う
	// fio.encodeCellQanssub() 黒マスと背景色のエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellQanssub : function(){
		this.decodeCell( function(obj,ca){
			if     (ca==="+"){ obj.qsub = 1;}
			else if(ca==="-"){ obj.qsub = 2;}
			else if(ca==="="){ obj.qsub = 3;}
			else if(ca==="%"){ obj.qsub = 4;}
			else if(ca!=="."){ obj.qans = parseInt(ca);}
		});
	},
	encodeCellQanssub : function(){
		this.encodeCell( function(obj){
			if     (obj.qans!==0){ return (obj.qans.toString() + " ");}
			else if(obj.qsub===1){ return "+ ";}
			else if(obj.qsub===2){ return "- ";}
			else if(obj.qsub===3){ return "= ";}
			else if(obj.qsub===4){ return "% ";}
			else                 { return ". ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeCellAnumsub() 回答数字と背景色のデコードを行う
	// fio.encodeCellAnumsub() 回答数字と背景色のエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellAnumsub : function(){
		this.decodeCell( function(obj,ca){
			if     (ca==="+"){ obj.qsub = 1;}
			else if(ca==="-"){ obj.qsub = 2;}
			else if(ca==="="){ obj.qsub = 3;}
			else if(ca==="%"){ obj.qsub = 4;}
			else if(ca!=="."){ obj.anum = parseInt(ca);}
		});
	},
	encodeCellAnumsub : function(){
		this.encodeCell( function(obj){
			if     (obj.anum!==-1){ return (obj.anum.toString() + " ");}
			else if(obj.qsub===1) { return "+ ";}
			else if(obj.qsub===2) { return "- ";}
			else if(obj.qsub===3) { return "= ";}
			else if(obj.qsub===4) { return "% ";}
			else                  { return ". ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeCellQsub() 背景色のデコードを行う
	// fio.encodeCellQsub() 背景色のエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellQsub : function(){
		this.decodeCell( function(obj,ca){
			if(ca!=="0"){ obj.qsub = parseInt(ca);}
		});
	},
	encodeCellQsub : function(){
		this.encodeCell( function(obj){
			if(obj.qsub>0){ return (obj.qsub.toString() + " ");}
			else          { return "0 ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeCrossNum() 交点の数字のデコードを行う
	// fio.encodeCrossNum() 交点の数字のエンコードを行う
	//---------------------------------------------------------------------------
	decodeCrossNum : function(){
		this.decodeCross( function(obj,ca){
			if     (ca==="-"){ obj.qnum = -2;}
			else if(ca!=="."){ obj.qnum = parseInt(ca);}
		});
	},
	encodeCrossNum : function(){
		this.encodeCross( function(obj){
			if     (obj.qnum>=0)  { return (obj.qnum.toString() + " ");}
			else if(obj.qnum===-2){ return "- ";}
			else                  { return ". ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeBorderQues() 問題の境界線のデコードを行う
	// fio.encodeBorderQues() 問題の境界線のエンコードを行う
	//---------------------------------------------------------------------------
	decodeBorderQues : function(){
		this.decodeBorder( function(obj,ca){
			if(ca==="1"){ obj.ques = 1;}
		});
	},
	encodeBorderQues : function(){
		this.encodeBorder( function(obj){
			return (obj.ques===1?"1":"0")+" ";
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeBorderAns() 問題・回答の境界線のデコードを行う
	// fio.encodeBorderAns() 問題・回答の境界線のエンコードを行う
	//---------------------------------------------------------------------------
	decodeBorderAns : function(){
		this.decodeBorder( function(obj,ca){
			if     (ca==="2" ){ obj.qans = 1; obj.qsub = 1;}
			else if(ca==="1" ){ obj.qans = 1;}
			else if(ca==="-1"){ obj.qsub = 1;}
		});
	},
	encodeBorderAns : function(){
		this.encodeBorder( function(obj){
			if     (obj.qans===1 && obj.qsub===1){ return "2 ";}
			else if(obj.qans===1){ return "1 ";}
			else if(obj.qsub===1){ return "-1 ";}
			else                 { return "0 ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeBorderLine() Lineのデコードを行う
	// fio.encodeBorderLine() Lineのエンコードを行う
	//---------------------------------------------------------------------------
	decodeBorderLine : function(){
		this.decodeBorder( function(obj,ca){
			if     (ca==="-1"){ obj.qsub = 2;}
			else if(ca!=="0" ){ obj.line = parseInt(ca);}
		});
	},
	encodeBorderLine : function(){
		this.encodeBorder( function(obj){
			if     (obj.line>  0){ return ""+obj.line+" ";}
			else if(obj.qsub===2){ return "-1 ";}
			else                 { return "0 ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeAreaRoom() 部屋のデコードを行う
	// fio.encodeAreaRoom() 部屋のエンコードを行う
	//---------------------------------------------------------------------------
	decodeAreaRoom : function(){ this.decodeAreaRoom_com(true);},
	encodeAreaRoom : function(){ this.encodeAreaRoom_com(true);},
	decodeAreaRoom_com : function(isques){
		this.readLine();
		this.rdata2Border(isques, this.getItemList(this.owner.board.qrows));

		this.owner.board.rooms.reset();
	},
	encodeAreaRoom_com : function(isques){
		var bd = this.owner.board, rinfo = bd.getRoomInfo();

		this.datastr += (rinfo.max+"\n");
		for(var c=0;c<bd.cellmax;c++){
			this.datastr += (""+(rinfo.id[c]>0 ? rinfo.id[c]-1 : ".")+" ");
			if((c+1)%bd.qcols===0){ this.datastr += "\n";}
		}
	},
	//---------------------------------------------------------------------------
	// fio.rdata2Border() 入力された配列から境界線を入力する
	//---------------------------------------------------------------------------
	rdata2Border : function(isques, rdata){
		var bd = this.owner.board;
		for(var id=0;id<bd.bdmax;id++){
			var border = bd.border[id], cell1 = border.sidecell[0], cell2 = border.sidecell[1];
			var isdiff = (!cell1.isnull && !cell2.isnull && rdata[cell1.id]!==rdata[cell2.id]);
			border[(isques?'ques':'qans')] = (isdiff?1:0);
		}
	},
	//---------------------------------------------------------------------------
	// fio.decodeCellQnum51() [＼]のデコードを行う
	// fio.encodeCellQnum51() [＼]のエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellQnum51 : function(){
		var bd = this.owner.board, item = this.getItemList(bd.qrows+1);
		bd.disableInfo(); /* mv.set51cell()用 */
		for(var i=0;i<item.length;i++) {
			if(item[i]==="."){ continue;}

			var bx=(i%(bd.qcols+1)-1)*2+1, by=(((i/(bd.qcols+1))|0)-1)*2+1;
			if(bx===-1 || by===-1){
				var excell = bd.getex(bx,by);
				var property = ((excell.by===-1)?'qnum2':'qnum');
				excell[property] = parseInt(item[i]);
			}
			else{
				var inp = item[i].split(",");
				var cell = bd.getc(bx,by);
				cell.set51cell();
				cell.qnum  = parseInt(inp[0]);
				cell.qnum2 = parseInt(inp[1]);
			}
		}
		bd.enableInfo(); /* mv.set51cell()用 */
	},
	encodeCellQnum51 : function(){
		var bd = this.owner.board, str = "";
		for(var by=bd.minby+1;by<bd.maxby;by+=2){
			for(var bx=bd.minbx+1;bx<bd.maxbx;bx+=2){
				if     (bx===-1 && by===-1){ str += "0 ";}
				else if(bx===-1 || by===-1){
					var excell = bd.getex(bx,by);
					var property = ((excell.by===-1)?'qnum2':'qnum');
					str += (""+excell[property].toString()+" ");
				}
				else{
					var cell = bd.getc(bx,by);
					if(cell.ques===51){
						str += (""+cell.qnum.toString()+","+cell.qnum2.toString()+" ");
					}
					else{ str += ". ";}
				}
			}
			str += "\n";
		}
		this.datastr += str;
	},
	//---------------------------------------------------------------------------
	// fio.decodeCellQnum_kanpen() pencilbox用問題数字のデコードを行う
	// fio.encodeCellQnum_kanpen() pencilbox用問題数字のエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellQnum_kanpen : function(){
		this.decodeCell( function(obj,ca){
			if(ca!=="."){ obj.qnum = parseInt(ca);}
		});
	},
	encodeCellQnum_kanpen : function(){
		this.encodeCell( function(obj){
			return ((obj.qnum>=0)?(obj.qnum.toString() + " "):". ");
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeCellAnum_kanpen() pencilbox用回答数字のデコードを行う
	// fio.encodeCellAnum_kanpen() pencilbox用回答数字のエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellAnum_kanpen : function(){
		this.decodeCell( function(obj,ca){
			if(ca!=="."&&ca!=="0"){ obj.anum = parseInt(ca);}
		});
	},
	encodeCellAnum_kanpen : function(){
		this.encodeCell( function(obj){
			if     (obj.qnum!==-1){ return ". ";}
			else if(obj.anum===-1){ return "0 ";}
			else                  { return ""+obj.anum.toString()+" ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeCellQnumAns_kanpen() pencilbox用問題数字＋黒マス白マスのデコードを行う
	// fio.encodeCellQnumAns_kanpen() pencilbox用問題数字＋黒マス白マスのエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellQnumAns_kanpen : function(){
		this.decodeCell( function(obj,ca){
			if     (ca==="#"){ obj.qans = 1;}
			else if(ca==="+"){ obj.qsub = 1;}
			else if(ca==="?"){ obj.qnum = -2;}
			else if(ca!=="."){ obj.qnum = parseInt(ca);}
		});
	},
	encodeCellQnumAns_kanpen : function(){
		this.encodeCell( function(obj){
			if     (obj.qnum>=0 ){ return (obj.qnum.toString() + " ");}
			else if(obj.qnum===-2){return "? ";}
			else if(obj.qans===1){ return "# ";}
			else if(obj.qsub===1){ return "+ ";}
			else                 { return ". ";}
		});
	},

	//---------------------------------------------------------------------------
	// fio.decodeCellQnum_XMLBoard() pencilbox XML用問題用数字のデコードを行う
	// fio.encodeCellQnum_XMLBoard() pencilbox XML用問題用数字のエンコードを行う
	//---------------------------------------------------------------------------
	UNDECIDED_NUM_XML : -1,
	decodeCellQnum_XMLBoard : function(){
		var minnum = (this.owner.board.cell[0].getminnum()>0 ? 1 : 0);
		var undecnum = this.UNDECIDED_NUM_XML;
		this.decodeCellXMLBoard(function(cell, val){
			if(val===undecnum)  { cell.qnum = -2;}
			else if(val>=minnum){ cell.qnum = val;}
		});
	},
	encodeCellQnum_XMLBoard : function(){
		var minnum = (this.owner.board.cell[0].getminnum()>0 ? 1 : 0);
		var undecnum = this.UNDECIDED_NUM_XML;
		this.encodeCellXMLBoard(function(cell){
			var val = null;
			if     (cell.qnum===-2)   { val = undecnum;}
			else if(cell.qnum>=minnum){ val = cell.qnum;}
			return val;
		});
	},

	//---------------------------------------------------------------------------
	// fio.decodeCellQnum_XMLBoard() pencilbox XML用問題用数字(browタイプ)のデコードを行う
	// fio.encodeCellQnum_XMLBoard() pencilbox XML用問題用数字(browタイプ)のエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellQnum_XMLBoard_Brow : function(){
		var undecnum = this.UNDECIDED_NUM_XML;
		this.decodeCellXMLBrow(function(cell, name){
			if(name==='n'+undecnum){ cell.qnum = -2;}
			else if(name!=='s'){ cell.qnum = +name.substr(1);}
		});
	},
	encodeCellQnum_XMLBoard_Brow : function(){
		var undecnum = this.UNDECIDED_NUM_XML;
		this.encodeCellXMLBrow(function(cell){
			if(cell.qnum===-2){ return 'n'+undecnum;}
			else if(cell.qnum>=0){ return 'n'+cell.qnum;}
			return 's';
		});
	},

	//---------------------------------------------------------------------------
	// fio.decodeCellAnum_XMLBoard() pencilbox XML用回答用数字のデコードを行う
	// fio.encodeCellAnum_XMLBoard() pencilbox XML用回答用数字のエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellAnum_XMLAnswer : function(){
		this.decodeCellXMLArow(function(cell, name){
			if(name==='n0'){ cell.anum = -1;}
			else if(name!=='s'){ cell.anum = +name.substr(1);}
		});
	},
	encodeCellAnum_XMLAnswer : function(){
		this.encodeCellXMLArow(function(cell){
			if(cell.anum>0){ return 'n'+cell.anum;}
			else if(cell.anum===-1){ return 'n0';}
			return 's';
		});
	},

	//---------------------------------------------------------------------------
	// fio.decodeAreaRoom_XMLBoard() pencilbox XML用問題用不定形部屋のデコードを行う
	// fio.encodeAreaRoom_XMLBoard() pencilbox XML用問題用不定形部屋のエンコードを行う
	//---------------------------------------------------------------------------
	decodeAreaRoom_XMLBoard : function(){
		var rdata = [];
		this.decodeCellXMLBrow(function(cell, name){
			rdata.push(+name.substr(1));
		});
		this.rdata2Border(true, rdata);
		this.owner.board.rooms.reset();
	},
	encodeAreaRoom_XMLBoard : function(){
		var bd = this.owner.board, rinfo = bd.getRoomInfo();
		this.xmldoc.querySelector('board').appendChild(this.createXMLNode('areas',{N:rinfo.max}));
		this.encodeCellXMLBrow(function(cell){
			return 'n'+(rinfo.id[cell.id]>0 ? rinfo.id[cell.id]-1 : -1);
		});
	},

	//---------------------------------------------------------------------------
	// fio.decodeCellAns_XMLAnswer() pencilbox XML用黒マスのデコードを行う
	// fio.encodeCellAns_XMLAnswer() pencilbox XML用黒マスのエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellAns_XMLAnswer : function(){
		this.decodeCellXMLArow(function(cell, name){
			if     (name==='w'){ cell.qans = 1;}
			else if(name==='s'){ cell.qsub = 1;}
		});
	},
	encodeCellAns_XMLAnswer : function(){
		this.encodeCellXMLArow(function(cell){
			if     (cell.qans===1){ return 'w';}
			else if(cell.qsub===1){ return 's';}
			return 'u';
		});
	},

	//---------------------------------------------------------------------------
	// fio.decodeBorderLine_XMLAnswer() pencilbox XML用Lineのデコードを行う
	// fio.encodeBorderLine_XMLAnswer() pencilbox XML用Lineのエンコードを行う
	//---------------------------------------------------------------------------
	decodeBorderLine_XMLAnswer : function(){
		this.decodeCellXMLArow(function(cell, name){
			var val = 0;
			var bdh = cell.adjborder.bottom, bdv = cell.adjborder.right;
			if(name.charAt(0)==='n'){ val = +name.substr(1);}
			else{
				if(name.match(/h/)){ val+=1;}
				if(name.match(/v/)){ val+=2;}
			}
			if(val&1){ bdh.line = 1;}
			if(val&2){ bdv.line = 1;}
			if(val&4){ bdh.qsub = 2;}
			if(val&8){ bdv.qsub = 2;}
		});
	},
	encodeBorderLine_XMLAnswer : function(){
		this.encodeCellXMLArow(function(cell){
			var val = 0, nodename = '';
			var bdh = cell.adjborder.bottom, bdv = cell.adjborder.right;
			if(bdh.line===1){ val += 1;}
			if(bdv.line===1){ val += 2;}
			if(bdh.qsub===2){ val += 4;}
			if(bdv.qsub===2){ val += 8;}
			
			if     (val===0){ nodename = 's';}
			else if(val===1){ nodename = 'h';}
			else if(val===2){ nodename = 'v';}
			else if(val===3){ nodename = 'hv';}
			else{ nodename = 'n'+val;}
			return nodename;
		});
	}
}
});
