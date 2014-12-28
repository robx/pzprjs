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
	failcode : (void 0),
	_info    : (void 0),

	//---------------------------------------------------------------------------
	// ans.makeCheckList() 最初にchecklistの配列を生成する
	//---------------------------------------------------------------------------
	makeCheckList : function(){
		if(!this.checklist){ return;}

		/* 当該パズルで使用しないchecklistのアイテムをフィルタリング */
		var checklist = this.checklist, order = [];
		for(var i=0;i<checklist.length;i++){
			var item = checklist[i], isexist = true, prio = 0;
			if(item.match('@')){
				isexist = pzpr.util.checkpid(item.substr(item.indexOf('@')+1), this.owner.pid);
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
	check : function(activemode, multierr){
		var puzzle = this.owner, bd = puzzle.board;
		this.inCheck = true;
		
		if(activemode){
			this.checkOnly = false;
			this.checkAns(multierr);
			if(!this.failcode.complete){
				bd.haserror = true;
				puzzle.redraw();
			}
		}
		/* activemodeでなく、前回の判定結果が残っている場合はそれを返します */
		else if(this.failcode===void 0){
			bd.disableSetError();
			this.checkOnly = true;
			this.checkAns(false);
			bd.enableSetError();
		}
		
		this.inCheck = false;
		return this.failcode;
	},
	checkAns : function(multierr){
		this.failcode = new this.owner.CheckInfo();
		var checklist = (this.checkOnly ? this.checklist_auto : this.checklist_normal);
		var errcount = 0;
		for(var i=0;i<checklist.length;i++){
			checklist[i].call(this);
			if(!multierr && (errcount<this.failcode.length)){ break;}
			errcount = this.failcode.length;
		}
	},

	//---------------------------------------------------------------------------
	// ans.resetCache() 前回のエラー情報等を破棄する
	//---------------------------------------------------------------------------
	resetCache : function(){
		this.failcode = void 0;
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
	length : 0,
	lastcode : null,
	
	add : function(code){
		if(!code){ return;}
		if(code!==this.lastcode){ this[this.length++] = this.lastcode = code;}
		this.complete = false;
	},
	text : function(lang){
		var puzzle = this.owner, textlist = puzzle.faillist, texts = [];
		var langcode = ((lang || puzzle.getConfig('language'))==="ja"?0:1);
		if(this.length===0){ return textlist.complete[langcode];}
		for(var i=0;i<this.length;i++){
			var textitem = textlist[this[i]] || textlist.invalid;
			texts.push(textitem[langcode]);
		}
		return texts.join("\n");
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
