// Answer.js v3.4.1

//---------------------------------------------------------------------------
// ★AnsCheckクラス 答えチェック関連の関数を扱う
//---------------------------------------------------------------------------

// 回答チェッククラス
// AnsCheckクラス
pzpr.classmgr.makeCommon({
//---------------------------------------------------------
AnsCheck:{
	initialize : function(){
		this.inCheck = false;
		this.checkOnly = false;

		this.makeCheckList();
	},
	failcodemode : (void 0),
	failcode : (void 0),
	_info    : (void 0),
	checklist : [],

	//---------------------------------------------------------------------------
	// ans.makeCheckList() 最初にchecklistの配列を生成する
	//---------------------------------------------------------------------------
	makeCheckList : function(){
		/* 当該パズルで使用しないchecklistのアイテムをフィルタリング */
		var checklist = this.checklist, order = [];
		for(var i=0;i<checklist.length;i++){
			var item = checklist[i], isexist = true, prio = 0;
			if(item.match('@')){
				isexist = pzpr.util.checkpid(item.substr(item.indexOf('@')+1), this.puzzle.pid);
				item = item.substr(0,item.indexOf('@'));
			}
			if(isexist){
				prio = (item.match(/\+/)||[]).length;
				item = item.replace(/\+/g,"");
				order.push([this[item], prio]);
			}
		}

		this.checklist_normal = [];
		for(var i=0; i<order.length; i++){ this.checklist_normal.push(order[i][0]);}

		/* autocheck用のエラーをソートする */
		order = order.sort(function(a,b){ return b[1] - a[1];});
		this.checklist_auto = [];
		for(var i=0; i<order.length; i++){ this.checklist_auto.push(order[i][0]);}
	},

	//---------------------------------------------------------------------------
	// ans.check()     答えのチェックを行う
	// ans.checkAns()  答えのチェックを行い、エラーコードを返す(nullはNo Error)
	//---------------------------------------------------------------------------
	check : function(activemode){
		var puzzle = this.puzzle, bd = this.board;
		this.inCheck = true;

		if(!!activemode){
			this.checkOnly = false;
			this.checkAns(false);
			if(!this.failcode.complete){
				bd.haserror = true;
				puzzle.redraw(true);	/* 描画キャッシュを破棄して描画し直す */
			}
		}
		/* activemodeでなく、前回の判定結果が残っていない場合はチェックします */
		else if(this.failcode===void 0 || this.failcodemode!==activemode){
			bd.disableSetError();
			this.checkOnly = true;
			this.checkAns(activemode===false);
			this.failcodemode = activemode;
			bd.enableSetError();
		}
		/* activemodeでなく、前回の判定結果が残っている場合はそれを返します */

		this.inCheck = false;
		return this.failcode;
	},
	checkAns : function(break_if_error){
		this.failcode = new this.klass.CheckInfo();
		var checkSingleError = (!this.puzzle.getConfig("multierr") || break_if_error);
		var checklist = ((this.checkOnly && checkSingleError) ? this.checklist_auto : this.checklist_normal);
		for(var i=0;i<checklist.length;i++){
			checklist[i].call(this);
			if(checkSingleError && (this.failcode.length>0)){ break;}
		}
		if(!break_if_error){ this.failcode.text = this.failcode.gettext();}
	},

	//---------------------------------------------------------------------------
	// ans.resetCache() 前回のエラー情報等を破棄する
	//---------------------------------------------------------------------------
	resetCache : function(){
		this.failcode = this.failcodemode = void 0;
		this._info    = {};
	}
},

//---------------------------------------------------------------------------
// ★CheckInfoクラス ans.checkで返すインスタンスのクラス
//---------------------------------------------------------------------------
CheckInfo:{
	initialize : function(code){
		this.add(code);
	},
	complete : true,
	undecided : false,
	text : '',
	length : 0,
	lastcode : null,

	add : function(code){
		if(!code){ return;}
		if(code!==this.lastcode){ this[this.length++] = this.lastcode = code;}
		this.complete = false;
	},
	gettext : function(lang){
		var puzzle = this.puzzle, textlist = puzzle.faillist, texts = [];
		var langcode = ((lang || pzpr.lang)==="ja"?0:1);
		if(this.length===0){ return textlist.complete[langcode];}
		for(var i=0;i<this.length;i++){
			var textitem = textlist[this[i]] || textlist.invalid;
			texts.push(textitem[langcode]);
		}
		return texts.join("\n");
	},
	setUndecided : function(){
		this.undecided = true;
	}
},

//---------------------------------------------------------------------------
// ★FailCodeクラス 答えの文字列を扱う
//---------------------------------------------------------------------------
// FailCodeクラス
FailCode:{
	complete : ["正解です！","Complete!"],
	invalid  : ["不明なエラーです","Invalid Error"]
}
});
