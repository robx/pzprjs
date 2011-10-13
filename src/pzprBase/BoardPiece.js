// BoardPiece.js v3.4.0
(function(){

var k = pzprv3.consts;

//---------------------------------------------------------------------------
// ★BoardPieceクラス Cell, Cross, Border, EXCellクラスのベース
//---------------------------------------------------------------------------
pzprv3.createCommonClass('BoardPiece',
{
	initialize : function(){
		this.bx;	// X座標(border座標系)を保持する
		this.by;	// Y座標(border座標系)を保持する
	},

	group : 'none',
	isnull : true,

	iscellobj   : false,
	iscrossobj  : false,
	isborderobj : false,
	isexcellobj : false,

	id : null,
	error: 0,

	propall : [],
	propans : [],
	propsub : [],

	// 入力できる最大・最小の数字
	maxnum : 255,
	minnum : 1,

	//---------------------------------------------------------------------------
	// getaddr() 自分の盤面中での位置を返す
	// relcell(), relcross(), relbd(), relexcell() 相対位置に存在するオブジェクトを返す
	//---------------------------------------------------------------------------
	getaddr : function(){ return this.owner.newInstance('Address',[this.bx, this.by]);},

	relcell   : function(dx,dy){ return bd.getc(this.bx+dx,this.by+dy);},
	relcross  : function(dx,dy){ return bd.getx(this.bx+dx,this.by+dy);},
	relbd     : function(dx,dy){ return bd.getb(this.bx+dx,this.by+dy);},
	relexcell : function(dx,dy){ return bd.getex(this.bx+dx,this.by+dy);},
	
	//---------------------------------------------------------------------------
	// ub() db() lb() rb()  セルや交点の上下左右にある境界線のIDを返す
	//---------------------------------------------------------------------------
	ub : function(){ return bd.getb(this.bx,this.by-1);},
	db : function(){ return bd.getb(this.bx,this.by+1);},
	lb : function(){ return bd.getb(this.bx-1,this.by);},
	rb : function(){ return bd.getb(this.bx+1,this.by);},

	//---------------------------------------------------------------------------
	// setdata() Cell,Cross,Border,EXCellの値を設定する
	//---------------------------------------------------------------------------
	setdata : function(prop, num){
		if(!!this.prehook[prop]){ if(this.prehook[prop].call(this,num)){ return;}}

		this.owner.undo.addOpe_Object(this, prop, this[prop], num);
		this[prop] = num;

		if(!!this.posthook[prop]){ this.posthook[prop].call(this,num);}
	},
	
	//---------------------------------------------------------------------------
	// nummaxfunc() 入力できる数字の最大値を返す
	// numminfunc() 入力できる数字の最小値を返す
	//---------------------------------------------------------------------------
	nummaxfunc : function(){ return this.maxnum;},
	numminfunc : function(){ return this.minnum;},

	//---------------------------------------------------------------------------
	// prehook  値の設定前にやっておく処理や、設定禁止処理を行う
	// posthook 値の設定後にやっておく処理を行う
	//---------------------------------------------------------------------------
	prehook  : {},
	posthook : {},

	//---------------------------------------------------------------------------
	// draw()   盤面に自分の周囲を描画する
	//---------------------------------------------------------------------------
	draw : function(){
		this.owner.painter.paintRange(this.bx-1, this.by-1, this.bx+1, this.by+1);
	},

	//---------------------------------------------------------------------------
	// seterr() error値を設定する
	//---------------------------------------------------------------------------
	seterr : function(num){
		if(bd.isenableSetError()){ this.error = num;}
	},

	//---------------------------------------------------------------------------
	// allclear() 位置,描画情報以外をクリアする
	// ansclear() qans,anum,line,qsub,error情報をクリアする
	// subclear() qsub,error情報をクリアする
	// comclear() 3つの共通処理
	//---------------------------------------------------------------------------
	allclear : function(isrec) { /* undo,redo以外で盤面縮小やったときは, isrec===true */
		this.comclear(this.propall, isrec);
		if(this.color!==(void 0)){ this.color = "";}
		this.error = 0;
	},
	ansclear : function(){
		this.comclear(this.propans, true);
		if(this.color!==(void 0)){ this.color = "";}
		this.error = 0;
	},
	subclear : function(){
		this.comclear(this.propsub, true);
		this.error = 0;
	},

	comclear : function(props, isrec){
		for(var i=0;i<props.length;i++){
			var def = this.constructor.prototype[props[i]];
			if(this[props[i]]!==def){
				if(isrec){ this.owner.undo.addOpe_Object(this, props[i], this[props[i]], def);}
				this[props[i]] = def;
			}
		}
	}
});

//---------------------------------------------------------------------------
// ★Cellクラス BoardクラスがCellの数だけ保持する
//---------------------------------------------------------------------------
// ボードメンバデータの定義(1)
// Cellクラスの定義
pzprv3.createCommonClass('Cell:BoardPiece',
{
	group : 'cell',

	iscellobj : true,

	// デフォルト値
	ques : 0,	// セルの問題データを保持する(1:黒マス 2-5:三角形 6:アイス 7:盤面外 11-17:十字型 21-22:旗門 51:カックロ)
	qans : 0,	// セルの回答データを保持する(1:黒マス/あかり 2-5:三角形 11-13:棒 31-32:斜線 41-50:ふとん)
	qdir : 0,	// セルの問題データを保持する(数字につく矢印/カックロの下側)
	qnum :-1,	// セルの問題データを保持する(数字/○△□/単体矢印/白丸黒丸/カックロの右側)
	anum :-1,	// セルの回答データを保持する(数字/○△□/単体矢印)
	qsub : 0,	// セルの補助データを保持する(1:白マス 1-2:背景色/○× 3:絵になる部分)
	color: "",	// 色分けデータを保持する

	propall : ['ques', 'qans', 'qdir', 'qnum', 'anum', 'qsub'],
	propans : ['qans', 'anum', 'qsub'],
	propsub : ['qsub'],
	
	disInputHatena : false,	// qnum==-2を入力できないようにする
	
	numberWithMB   : false,	// 回答の数字と○×が入るパズル(○は数字が入っている扱いされる)
	numberAsObject : false,	// 数字以外でqnum/anumを使用する(同じ値を入力で消去できたり、回答で・が入力できる)
	
	numberIsWhite  : false,	// 数字のあるマスが黒マスにならないパズル
	
	//---------------------------------------------------------------------------
	// cell.up() dn() lt() rt()  セルの上下左右に接するセルのIDを返す
	//---------------------------------------------------------------------------
	up : function(){ return bd.getc(this.bx,this.by-2);},
	dn : function(){ return bd.getc(this.bx,this.by+2);},
	lt : function(){ return bd.getc(this.bx-2,this.by);},
	rt : function(){ return bd.getc(this.bx+2,this.by);},

	//---------------------------------------------------------------------------
	// オブジェクト設定値のgetter/setter
	//---------------------------------------------------------------------------
	getQues : function(){ return this.ques;},
	setQues : function(val){ this.setdata(k.QUES, val);},

	getQans : function(){ return this.qans;},
	setQans : function(val){ this.setdata(k.QANS, val);},

	getQdir : function(){ return this.qdir;},
	setQdir : function(val){ this.setdata(k.QDIR, val);},

	getQnum : function(){ return this.qnum;},
	setQnum : function(val){ this.setdata(k.QNUM, val);},

	getAnum : function(){ return this.anum;},
	setAnum : function(val){ this.setdata(k.ANUM, val);},

	getQsub : function(){ return this.qsub;},
	setQsub : function(val){ this.setdata(k.QSUB, val);},

	//---------------------------------------------------------------------------
	// prehook  値の設定前にやっておく処理や、設定禁止処理を行う
	// posthook 値の設定後にやっておく処理を行う
	//---------------------------------------------------------------------------
	prehook : {
		ques : function(num){ if(this.owner.classes.Border.prototype.enableLineCombined){ this.setCombinedLine(num);} return false;},
		qnum : function(num){ return (this.minnum>0 && num===0);},
		anum : function(num){ return (this.minnum>0 && num===0);},
	},
	posthook : {
		qnum : function(num){ bd.areas.setCellInfo(this);},
		anum : function(num){ bd.areas.setCellInfo(this);},
		qans : function(num){ bd.areas.setCellInfo(this);},
		qsub : function(num){ if(this.numberWithMB){ bd.areas.setCellInfo(this);}} /* bd.numberWithMBの○を文字扱い */
	},

	//---------------------------------------------------------------------------
	// cell.lcnt()       セルに存在する線の本数を返す
	// cell.iscrossing() 指定されたセル/交点で線が交差する場合にtrueを返す
	//---------------------------------------------------------------------------
	lcnt       : function(){ return (!!bd.lines.lcnt[this.id]?bd.lines.lcnt[this.id]:0);},
	iscrossing : function(){ return bd.lines.isLineCross;},

	//---------------------------------------------------------------------------
	// cell.drawaround() 盤面に自分の周囲1マスを含めて描画する
	//---------------------------------------------------------------------------
	drawaround : function(){
		this.owner.painter.paintRange(this.bx-3, this.by-3, this.bx+3, this.by+3);
	},

	//---------------------------------------------------------------------------
	// cell.isBlack()   該当するCellが黒マスかどうか返す
	// cell.isWhite()   該当するCellが白マスかどうか返す
	// cell.setBlack()  該当するCellに黒マスをセットする
	// cell.setWhite()  該当するCellに白マスをセットする
	//---------------------------------------------------------------------------
	isBlack : function(){ return this.qans===1;},
	isWhite : function(){ return this.qans!==1;},
	setBlack : function(){ this.setQans(1);},
	setWhite : function(){ this.setQans(0);},
	
	//-----------------------------------------------------------------------
	// cell.getNum()     該当するCellの数字を返す
	// cell.setNum()     該当するCellに数字を設定する
	//-----------------------------------------------------------------------
	getNum : function(){ return (this.qnum!==-1 ? this.qnum : this.anum);},
	setNum : function(val){
		if(this.minnum>0 && val===0){ return;}
		// editmode時 val>=0は数字 val=-1は消去 val=-2は？など
		if(this.owner.editmode){
			val = (((this.numberAsObject||val===-2) && this.qnum===val)?-1:val);
			this.setQnum(val);
			this.setAnum(-1);
			if(this.numberIsWhite) { this.setQans(0);}
			if(this.owner.painter.bcolor==="white"){ this.setQsub(0);}
		}
		// playmode時 val>=0は数字 val=-1は消去 numberAsObjectの・はval=-2 numberWithMBの○×はval=-2,-3
		else if(this.qnum===-1){
			var vala = ((val>-1 && !(this.numberAsObject && this.anum=== val  ))? val  :-1);
			var vals = ((val<-1 && !(this.numberAsObject && this.qsub===-val-1))?-val-1: 0);
			this.setAnum(vala);
			this.setQsub(vals);
			this.setQdir(0);
		}
	},
	
	//-----------------------------------------------------------------------
	// cell.isNum()       該当するCellに数字があるか返す
	// cell.noNum()       該当するCellに数字がないか返す
	// cell.isValidNum()  該当するCellに0以上の数字があるか返す
	// cell.isNumberObj() 該当するCellに数字or○があるか返す
	// cell.sameNumber()  ２つのCellに同じ有効な数字があるか返す
	//-----------------------------------------------------------------------
	isNum : function(){ return this.id!==null && (this.qnum!==-1 || this.anum!==-1);},
	noNum : function(){ return this.id!==null && (this.qnum===-1 && this.anum===-1);},
	isValidNum  : function(){ return this.id!==null && (this.qnum>=0||(this.anum>=0 && this.qnum===-1));},
	isNumberObj : function(){ return (this.qnum!==-1 || this.anum!==-1 || (this.numberWithMB && this.qsub===1));},
	sameNumber : function(cell){ return (this.isValidNum() && (this.getNum()===cell.getNum()));},

	//---------------------------------------------------------------------------
	// cell.is51cell()     [＼]のセルかチェックする(カックロ以外はオーバーライドされる)
	// cell.set51cell()    [＼]を作成する(カックロ以外はオーバーライドされる)
	// cell.remove51cell() [＼]を消去する(カックロ以外はオーバーライドされる)
	//---------------------------------------------------------------------------
	// ※とりあえずカックロ用
	is51cell : function(){ return (this.ques===51);},
	set51cell : function(val){
		this.setQues(51);
		this.setQnum(0);
		this.setQdir(0);
		this.setAnum(-1);
	},
	remove51cell : function(val){
		this.setQues(0);
		this.setQnum(0);
		this.setQdir(0);
		this.setAnum(-1);
	},

	//---------------------------------------------------------------------------
	// cell.ice() アイスのマスかどうか判定する
	//---------------------------------------------------------------------------
	ice : function(){ return (this.ques===6);},

	//---------------------------------------------------------------------------
	// cell.isEmpty() / cell.isValid() 不定形盤面などで、入力できるマスか判定する
	//---------------------------------------------------------------------------
	isEmpty : function(){ return ( this.isnull || this.ques===7);},
	isValid : function(){ return (!this.isnull && this.ques!==7);},

	//---------------------------------------------------------------------------
	// cell.isLineStraight()   セルの上で線が直進しているか判定する
	//---------------------------------------------------------------------------
	isLineStraight : function(){
		if     (this.ub().isLine() && this.db().isLine()){ return true;}
		else if(this.lb().isLine() && this.rb().isLine()){ return true;}
		return false;
	},

	//---------------------------------------------------------------------------
	// cell.setCombinedLine() 自分のセルの設定に応じて周りの線を設定する
	// cell.isLP()  線が必ず存在するセルの条件を判定する
	// cell.noLP()  線が引けないセルの条件を判定する
	//---------------------------------------------------------------------------
	setCombinedLine : function(){	// bd.sQuCから呼ばれる
		if(this.owner.classes.Border.prototype.enableLineCombined){
			var bx=this.bx, by=this.by;
			var blist = bd.borderinside(bx-1,by-1,bx+1,by+1);
			for(var i=0;i<blist.length;i++){
				var border=blist[i];
				if        (border.line===0 && border.isLineEX()){ border.setLineVal(1);}
				// 黒マスが入力されたら線を消すとかやりたい場合、↓のコメントアウトをはずす
				// else if(border.line!==0 && border.isLineNG()){ border.setLineVal(0);}
			}
		}
	},

	// 下記の関数で用いる定数
	isLPobj : {
		1 : {11:1,12:1,14:1,15:1}, /* k.UP */
		2 : {11:1,12:1,16:1,17:1}, /* k.DN */
		3 : {11:1,13:1,15:1,16:1}, /* k.LT */
		4 : {11:1,13:1,14:1,17:1}  /* k.RT */
	},
	noLPobj : {
		1 : {1:1,4:1,5:1,13:1,16:1,17:1,21:1}, /* k.UP */
		2 : {1:1,2:1,3:1,13:1,14:1,15:1,21:1}, /* k.DN */
		3 : {1:1,2:1,5:1,12:1,14:1,17:1,22:1}, /* k.LT */
		4 : {1:1,3:1,4:1,12:1,15:1,16:1,22:1}  /* k.RT */
	},

	isLP : function(dir){
		return !!this.isLPobj[dir][this.ques];
	},
	// ans.checkenableLinePartsからnoLP()関数が直接呼ばれている
	noLP : function(dir){
		return !!this.noLPobj[dir][this.ques];
	},

	//---------------------------------------------------------------------------
	// cell.countDir4Cell()  上下左右4方向で条件func==trueになるマスの数をカウントする
	//---------------------------------------------------------------------------
	countDir4Cell : function(func){
		var cnt=0, cell;
		cell=this.up(); if(!cell.isnull && func(cell)){ cnt++;}
		cell=this.dn(); if(!cell.isnull && func(cell)){ cnt++;}
		cell=this.lt(); if(!cell.isnull && func(cell)){ cnt++;}
		cell=this.rt(); if(!cell.isnull && func(cell)){ cnt++;}
		return cnt;
	},

	//---------------------------------------------------------------------------
	// cell.getdir4clist()   上下左右4方向の存在するセルを返す
	// cell.getdir4cblist()  上下左右4方向のセル＆境界線＆方向を返す
	//---------------------------------------------------------------------------
	getdir4clist : function(){
		var cell, list=[];
		cell=this.up(); if(!cell.isnull){ list.push([cell,k.UP]);}
		cell=this.dn(); if(!cell.isnull){ list.push([cell,k.DN]);}
		cell=this.lt(); if(!cell.isnull){ list.push([cell,k.LT]);}
		cell=this.rt(); if(!cell.isnull){ list.push([cell,k.RT]);}
		return list;
	},
	getdir4cblist : function(){
		var cell, border, cblist=[];
		cell=this.up(); border=this.ub(); if(!cell.isnull || !border.isnull){ cblist.push([cell,border,k.UP]);}
		cell=this.dn(); border=this.db(); if(!cell.isnull || !border.isnull){ cblist.push([cell,border,k.DN]);}
		cell=this.lt(); border=this.lb(); if(!cell.isnull || !border.isnull){ cblist.push([cell,border,k.LT]);}
		cell=this.rt(); border=this.rb(); if(!cell.isnull || !border.isnull){ cblist.push([cell,border,k.RT]);}
		return cblist;
	},

	//---------------------------------------------------------------------------
	// cell.setCellLineError()    セルと周りの線にエラーフラグを設定する
	//---------------------------------------------------------------------------
	setCellLineError : function(flag){
		var bx=this.bx, by=this.by;
		if(flag){ this.seterr(1);}
		bd.borderinside(bx-1,by-1,bx+1,by+1).seterr(1);
	}
});

//---------------------------------------------------------------------------
// ★Crossクラス BoardクラスがCrossの数だけ保持する(iscross==1の時)
//---------------------------------------------------------------------------
// ボードメンバデータの定義(2)
// Crossクラスの定義
pzprv3.createCommonClass('Cross:BoardPiece',
{
	group : 'cross',

	iscrossobj : true,

	// デフォルト値
	ques : 0,	// 交差点の問題データ(黒点)を保持する
	qnum :-1,	// 交差点の問題データ(数字)を保持する

	propall : ['ques', 'qnum'],
	propans : [],
	propsub : [],

	//---------------------------------------------------------------------------
	// オブジェクト設定値のgetter/setter
	//---------------------------------------------------------------------------
	getQues : function(){ return this.ques;},
	setQues : function(val){ this.setdata(k.QUES, val);},

	getQnum : function(){ return this.qnum;},
	setQnum : function(val){ this.setdata(k.QNUM, val);},

	//---------------------------------------------------------------------------
	// cross.lcnt()       交点に存在する線の本数を返す
	// cross.iscrossing() 指定されたセル/交点で線が交差する場合にtrueを返す
	//---------------------------------------------------------------------------
	lcnt       : function(){ return (!!bd.lines.lcnt[this.id]?bd.lines.lcnt[this.id]:0);},
	iscrossing : function(){ return bd.lines.isLineCross;}
});

//---------------------------------------------------------------------------
// ★Borderクラス BoardクラスがBorderの数だけ保持する(isborder==1の時)
//---------------------------------------------------------------------------
// ボードメンバデータの定義(3)
// Borderクラスの定義
pzprv3.createCommonClass('Border:BoardPiece',
{
	initialize : function(){
		pzprv3.core.BoardPiece.prototype.initialize.call(this);

		this.sidecell  = [null,null];	// 隣接セルのオブジェクト
		this.sidecross = [null,null];	// 隣接交点のオブジェクト
		this.lineedge  = [];			// LineManager用
	},
	group : 'border',

	isborderobj : true,

	// デフォルト値
	ques : 0,	// 境界線の問題データを保持する(問題境界線)
	qans : 0,	// 境界線の回答データを保持する(回答境界線)
	qdir : 0,	// 境界線の問題データを保持する(アイスバーンの矢印/マイナリズムの不等号)
	qnum :-1,	// 境界線の問題データを保持する(マイナリズムの数字/天体ショーの星)
	line : 0,	// 線の回答データを保持する(スリリンなどの線もこっち)
	qsub : 0,	// 境界線の補助データを保持する(1:補助線/2:×)
	color: "",	// 色分けデータを保持する

	isvert: false,	// true:境界線が垂直(縦) false:境界線が水平(横)

	propall : ['ques', 'qans', 'qdir', 'qnum', 'line', 'qsub'],
	propans : ['qans', 'line', 'qsub'],
	propsub : ['qsub'],

	// isLineNG関連の変数など
	enableLineNG       : false,
	enableLineCombined : false,

	//---------------------------------------------------------------------------
	// オブジェクト設定値のgetter/setter
	//---------------------------------------------------------------------------
	getQues : function(){ return this.ques;},
	setQues : function(val){ this.setdata(k.QUES, val);},

	getQans : function(){ return this.qans;},
	setQans : function(val){ this.setdata(k.QANS, val);},

	getQdir : function(){ return this.qdir;},
	setQdir : function(val){ this.setdata(k.QDIR, val);},

	getQnum : function(){ return this.qnum;},
	setQnum : function(val){ this.setdata(k.QNUM, val);},

	getLineVal : function(){ return this.line;},
	setLineVal : function(val){ this.setdata(k.LINE, val);},

	getQsub : function(){ return this.qsub;},
	setQsub : function(val){ this.setdata(k.QSUB, val);},

	//---------------------------------------------------------------------------
	// prehook  値の設定前にやっておく処理や、設定禁止処理を行う
	// posthook 値の設定後にやっておく処理を行う
	//---------------------------------------------------------------------------
	prehook : {
		qans : function(num){ return (this.ques!==0);},
		line : function(num){ return (this.checkStableLine(num));}
	},
	posthook : {
		ques : function(num){ bd.areas.setBorderInfo(this);},
		qans : function(num){ bd.areas.setBorderInfo(this);},
		line : function(num){ bd.lines.setLineInfo(this); bd.areas.setBorderInfo(this);}
	},

	//---------------------------------------------------------------------------
	// border.draw() 盤面に自分の周囲を描画する (Borderはちょっと範囲が広い)
	//---------------------------------------------------------------------------
	draw : function(){
		this.owner.painter.paintRange(this.bx-2, this.by-2, this.bx+2, this.by+2);
	},

	//-----------------------------------------------------------------------
	// border.isLine()      該当するBorderにlineが引かれているか判定する
	// border.setLine()     該当するBorderに線を引く
	// border.setPeke()     該当するBorderに×印をつける
	// border.removeLine()  該当するBorderから線を消す
	//-----------------------------------------------------------------------
	isLine : function(){ return this.line>0;},
	setLine    : function(id){ this.setLineVal(1); this.setQsub(0);},
	setPeke    : function(id){ this.setLineVal(0); this.setQsub(2);},
	removeLine : function(id){ this.setLineVal(0); this.setQsub(0);},

	//---------------------------------------------------------------------------
	// border.isBorder()     該当するBorderに境界線が引かれているか判定する
	// border.setBorder()    該当するBorderに境界線を引く
	// border.removeBorder() 該当するBorderから線を消す
	//---------------------------------------------------------------------------
	isBorder  : function(){ return (this.ques>0 || this.qans>0);},
	setBorder : function(){
		if(this.owner.editmode){ this.setQues(1); this.setQans(0);}
		else if(this.ques!==1){ this.setQans(1);}
	},
	removeBorder : function(){
		if(this.owner.editmode){ this.setQues(0); this.setQans(0);}
		else if(this.ques!==1){ this.setQans(0);}
	},

	//---------------------------------------------------------------------------
	// border.isVert()  該当するBorderが垂直(縦)かどうか返す
	// border.isHorz()  該当するBorderに水平(横)かどうか返す
	//---------------------------------------------------------------------------
	isVert : function(){ return  this.isvert;},
	isHorz : function(){ return !this.isvert;},

	//---------------------------------------------------------------------------
	// border.checkStableLine() 線が引けない or 必ず存在する状態になっているか判定する
	// border.isLineEX() 線が必ず存在するborderの条件を判定する
	// border.isLineNG() 線が引けないborderの条件を判定する
	//---------------------------------------------------------------------------
	// [pipelink, loopsp], [barns, slalom, reflect, yajirin]で呼ばれる関数
	checkStableLine : function(num){	// bd.sLiBから呼ばれる
		if(this.enableLineNG){
			if(this.enableLineCombined){
				return ( (num!==0 && this.isLineNG()) ||
						 (num===0 && this.isLineEX()) );
			}
			return (num!==0 && this.isLineNG());
		}
		return false;
	},

	// bd.sQuC => bd.setCombinedLineから呼ばれる関数 (exist->ex)
	//  -> cellidの片方がnullになっていることを考慮していません
	isLineEX : function(){
		var cell1 = this.sidecell[0], cell2 = this.sidecell[1];
		return this.isVert() ? (cell1.isLP(k.RT) && cell2.isLP(k.LT)) :
							   (cell1.isLP(k.DN) && cell2.isLP(k.UP));
	},
	// bd.sLiB => bd.checkStableLineから呼ばれる関数
	//  -> cellidの片方がnullになっていることを考慮していません
	isLineNG : function(){
		var cell1 = this.sidecell[0], cell2 = this.sidecell[1];
		return this.isVert() ? (cell1.noLP(k.RT) || cell2.noLP(k.LT)) :
							   (cell1.noLP(k.DN) || cell2.noLP(k.UP));
	}
});

//---------------------------------------------------------------------------
// ★EXCellクラス BoardクラスがEXCellの数だけ保持する
//---------------------------------------------------------------------------
// ボードメンバデータの定義(4)
// EXCellクラスの定義
pzprv3.createCommonClass('EXCell:BoardPiece',
{
	group : 'excell',

	isexcellobj : true,

	// デフォルト値
	qdir : 0,	// セルの問題データ(方向)を保持する(矢印 or カックロの下側)
	qnum :-1,	// セルの問題データ(数字)を保持する(数字 or カックロの右側)

	propall : ['qdir', 'qnum'],
	propans : [],
	propsub : [],

	//---------------------------------------------------------------------------
	// オブジェクト設定値のgetter/setter
	//---------------------------------------------------------------------------
	getQdir : function(){ return this.qdir;},
	setQdir : function(val){ this.setdata(k.QDIR, val);},

	getQnum : function(){ return this.qnum;},
	setQnum : function(val){ this.setdata(k.QNUM, val);}
});

//----------------------------------------------------------------------------
// ★Addressクラス (bx,by)座標を扱う
//---------------------------------------------------------------------------
// Addressクラス
pzprv3.createCommonClass('Address',
{
	initialize : function(bx,by){
		this.init(bx,by);
	},

	reset  : function()   { this.bx = null;  this.by = null;},
	equals : function(pos){ return (this.bx===pos.bx && this.by===pos.by);},
	clone  : function()   { return this.owner.newInstance('Address',[this.bx, this.by]);},

	set  : function(pos)  { this.bx = pos.bx; this.by = pos.by; return this;},
	init : function(bx,by){ this.bx  = bx; this.by  = by; return this;},
	move : function(dx,dy){ this.bx += dx; this.by += dy; return this;},
	rel  : function(dx,dy){ return this.owner.newInstance('Address',[this.bx+dx, this.by+dy]);},

	oncell   : function(){ return !!( (this.bx&1)&& (this.by&1));},
	oncross  : function(){ return !!(!(this.bx&1)&&!(this.by&1));},
	onborder : function(){ return !!((this.bx+this.by)&1);},
	
	getc  : function(){ return bd.getc(this.bx, this.by);},
	getx  : function(){ return bd.getx(this.bx, this.by);},
	getb  : function(){ return bd.getb(this.bx, this.by);},
	getex : function(){ return bd.getex(this.bx, this.by);},
	
	movedir : function(dir,dd){
		switch(dir){
			case 1: this.by-=dd; break; /* k.UP */
			case 2: this.by+=dd; break; /* k.DN */
			case 3: this.bx-=dd; break; /* k.LT */
			case 4: this.bx+=dd; break; /* k.RT */
		}
		return this;
	},

	//---------------------------------------------------------------------------
	// pos.draw() 盤面に自分の周囲を描画する
	//---------------------------------------------------------------------------
	draw : function(){
		this.owner.painter.paintRange(this.bx-1, this.by-1, this.bx+1, this.by+1);
	},

	//---------------------------------------------------------------------------
	// pos.isinside() この場所が盤面内かどうか判断する
	//---------------------------------------------------------------------------
	isinside : function(){
		return (this.bx>=bd.minbx && this.bx<=bd.maxbx &&
				this.by>=bd.minby && this.by<=bd.maxby);
	}
});

//----------------------------------------------------------------------------
// ★PieceListクラス オブジェクトの配列を扱う
//---------------------------------------------------------------------------
pzprv3.createCommonClass('PieceList',
{
	length : 0,
	
	name : 'PieceList',
	
	//--------------------------------------------------------------------------------
	// list.add()      与えられたオブジェクトを配列の末尾に追加する(push()相当)
	// list.addList()  与えられた配列を配列の末尾に追加する(concat()に近い)
	// list.unshift()  与えられたオブジェクトを配列の先頭に入れる
	// list.pop()      配列の最後のオブジェクトを取り除いて返す
	// list.remove()   与えられたオブジェクトを配列から取り除く
	//--------------------------------------------------------------------------------
	add : function(obj){
		this[this.length] = obj;
		this.length++;
	},
	addList : function(objs){
		for(var i=0;i<objs.length;i++){ this[this.length+i] = objs[i];}
		this.length += objs.length;
	},
	unshift : function(obj){
		for(var i=this.length;i>=0;i--){ this[i+1] = this[i];}
		this[0] = obj;
		this.length++;
	},
	
	pop : function(){
		this.length--;
		delete this[this.length];
	},
	remove : function(obj){
		for(var n=0,i=0;i<this.length;i++){
			if(this[i]!==obj){ this[n]=this[i]; n++;}
		}
		this.length--;
		delete this[this.length];
	},
	
	//--------------------------------------------------------------------------------
	// ☆Arrayオブジェクト関連の関数
	// list.join()     オブジェクトのIDをjoin()して返す
	// list.some()     条件がtrueとなるオブジェクトが存在するか判定する
	// list.filter()   条件がtrueとなるオブジェクトを抽出したclistを新たに作成する
	// list.include()  与えられたオブジェクトが配列に存在するか判定する
	// list.reverse()  保持している配列の順番を逆にする
	//--------------------------------------------------------------------------------
	join : function(str){
		var idlist = [];
		for(var i=0;i<this.length;i++){ idlist.push(this[i].id);}
		return idlist.join(str);
	},
	some : function(cond){
		for(var i=0;i<this.length;i++){ if(cond(this[i])){ return true;}}
		return false;
	},
	filter : function(cond){
		var list = this.owner.newInstance(this.name);
		for(var i=0;i<this.length;i++){ if(cond(this[i])){ list.add(this[i]);}}
		return list;
	},
	include : function(obj){
		for(var i=0;i<this.length;i++){ if(this[i]===obj){ return true;}}
		return false;
	},
	reverse : function(){
		for(var i=0,len=(this.length<<1);i<len;i++){
			var tmp = this[i], j = ((this.length-1)-i);
			this[i] = this[j];
			this[j] = tmp;
		}
	},
	
	//--------------------------------------------------------------------------------
	// list.seterr()  保持しているオブジェクトにerror値を設定する
	//--------------------------------------------------------------------------------
	seterr : function(num){
		if(!bd.isenableSetError()){ return;}
		for(var i=0;i<this.length;i++){ this[i].error = num;}
	}
});

//----------------------------------------------------------------------------
// ★CellListクラス Cellの配列を扱う
//---------------------------------------------------------------------------
pzprv3.createCommonClass('CellList:PieceList',
{
	name : 'CellList',

	//---------------------------------------------------------------------------
	// clist.getRectSize()  指定されたCellのリストの上下左右の端と、セルの数を返す
	//---------------------------------------------------------------------------
	getRectSize : function(){
		var d = { x1:bd.maxbx+1, x2:bd.minbx-1, y1:bd.maxby+1, y2:bd.minby-1, cols:0, rows:0, cnt:0};
		for(var i=0;i<this.length;i++){
			var cell = this[i];
			if(d.x1>cell.bx){ d.x1=cell.bx;}
			if(d.x2<cell.bx){ d.x2=cell.bx;}
			if(d.y1>cell.by){ d.y1=cell.by;}
			if(d.y2<cell.by){ d.y2=cell.by;}
			d.cnt++;
		}
		d.cols = (d.x2-d.x1+2)/2;
		d.rows = (d.y2-d.y1+2)/2;
		return d;
	},

	//--------------------------------------------------------------------------------
	// clist.getQnumCell()  指定されたClistの中で一番左上にある数字のあるセルを返す
	//--------------------------------------------------------------------------------
	getQnumCell : function(){
		for(var i=0,len=this.length;i<len;i++){
			if(this[i].isNum()){ return this[i];}
		}
		return bd.emptycell;
	}
});

//----------------------------------------------------------------------------
// ★CrossListクラス Crossの配列を扱う
//---------------------------------------------------------------------------
pzprv3.createCommonClass('CrossList:PieceList',{
	name : 'CrossList'
});

//----------------------------------------------------------------------------
// ★BorderListクラス Borderの配列を扱う
//---------------------------------------------------------------------------
pzprv3.createCommonClass('BorderList:PieceList',
{
	name : 'BorderList',

	//---------------------------------------------------------------------------
	// blist.cellinside()  線が重なるセルのリストを取得する
	// blist.crossinside() 線が重なる交点のリストを取得する
	//---------------------------------------------------------------------------
	cellinside : function(){
		var clist = this.owner.newInstance('CellList'), pushed = [];
		for(var i=0;i<this.length;i++){
			var border=this[i], cell1=border.sidecell[0], cell2=border.sidecell[1];
			if(!cell1.isnull && pushed[cell1.id]!==true){ clist.add(cell1); pushed[cell1.id]=true;}
			if(!cell2.isnull && pushed[cell2.id]!==true){ clist.add(cell2); pushed[cell2.id]=true;}
		}
		return clist;
	},
	crossinside : function(){
		var clist = this.owner.newInstance('CrossList'), pushed = [];
		for(var i=0;i<this.length;i++){
			var border=this[i], cross1=border.sidecross[0], cross2=border.sidecross[1];
			if(!cross1.isnull && pushed[cross1.id]!==true){ clist.add(cross1); pushed[cross1.id]=true;}
			if(!cross2.isnull && pushed[cross2.id]!==true){ clist.add(cross2); pushed[cross2.id]=true;}
		}
		return clist;
	}
});

//----------------------------------------------------------------------------
// ★EXCellListクラス EXCellの配列を扱う
//---------------------------------------------------------------------------
pzprv3.createCommonClass('EXCellList:PieceList',{
	name : 'EXCellList'
});

//---------------------------------------------------------------------------
// ★AreaInfoクラス 主に色分けの情報を管理する
//   id : null   どの部屋にも属さないセル(黒マス情報で白マスのセル、等)
//         0     どの部屋に属させるかの処理中
//         1以上 その番号の部屋に属する
//---------------------------------------------------------------------------
pzprv3.createCommonClass('AreaCellInfo',
{
	initialize : function(){
		this.max  = 0;	// 最大の部屋番号(1～maxまで存在するよう構成してください)
		this.id   = [];	// 各セル/線などが属する部屋番号を保持する
		this.room = [];	// 各部屋のidlist等の情報を保持する(info.room[id].idlistで取得)
	},

	addRoom : function(){
		this.max++;
		this.room[this.max] = {idlist:[]};
	},
	getRoomID : function(obj){ return this.id[obj.id];},
	setRoomID : function(obj, areaid){
		this.room[areaid].idlist.push(obj.id);
		this.id[obj.id] = areaid;
	},

	addCell   : function(cell){ this.setRoomID(cell, this.max);},
	emptyCell : function(cell){ return (this.id[cell.id]===0);},

	getclistbycell : function(cell)  { return this.getclist(this.id[cell.id]);},
	getclist : function(areaid){
		var idlist = this.room[areaid].idlist, clist = this.owner.newInstance('CellList');
		for(var i=0;i<idlist.length;i++){ clist.add(bd.cell[idlist[i]]);}
		return clist;
	},

	//---------------------------------------------------------------------------
	// info.setErrLareaByCell() ひとつながりになった線が存在するマスにエラーを設定する
	// info.setErrLareaById()   ひとつながりになった線が存在するマスにエラーを設定する
	//---------------------------------------------------------------------------
	setErrLareaByCell : function(cell, val){
		this.setErrLareaById(this.id[cell.id], val);
	},
	setErrLareaById : function(areaid, val){
		var self = this;
		bd.border.filter(function(border){
			var cc1 = border.sidecell[0].id, cc2 = border.sidecell[1].id;
			return (border.isLine() && self.id[cc1]===areaid && self.id[cc2]===areaid);
		}).seterr(val);

		bd.cell.filter(function(cell){
			return (self.id[cell.id]===areaid && cell.isNum());
		}).seterr(4);
	}
});

// AreaBorderInfoクラス
pzprv3.createCommonClass('AreaBorderInfo:AreaCellInfo',
{
	addBorder : function(border){ this.setRoomID(border, this.max);},
	emptyBorder : function(border){ return (this.id[border.id]===0);},

	getblist : function(areaid){
		var idlist = this.room[areaid].idlist, blist = this.owner.newInstance('BorderList');
		for(var i=0;i<idlist.length;i++){ blist.add(bd.border[idlist[i]]);}
		return blist;
	},

	addCell   : function(cell){ },
	emptyCell : function(cell){ return true;},
	getclistbycell : function(cell){ },
	getclist : function(areaid){ }
});

})();
