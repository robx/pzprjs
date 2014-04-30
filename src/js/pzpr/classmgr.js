// classmgr.js v3.4.1

//---------------------------------------------------------------
// クラス設定用関数など
//---------------------------------------------------------------
pzpr.common = {};	// CoreClass保存用
pzpr.custom = {};	// パズル別クラス保存用

//----------------------------------------------------------------------------
// ★pzpr.classmgrオブジェクト (クラス作成関数等)
//---------------------------------------------------------------------------
pzpr.classmgr = {
	//---------------------------------------------------------------
	// 共通クラス・パズル別クラスに継承させる親クラスを生成する
	//---------------------------------------------------------------
	makeCommon : function(commonbase){
		var commonclass = commonbase;
		this.createCommon(commonclass);
	},
	createCommon : function(commonclass){
		var common = pzpr.common;
		for(var key in commonclass){
			var realname = this.searchName(key).real;
			var proto = commonclass[key];
			if(!common[realname]){
				common[realname] = this.createClass(key, proto, {});
			}
			else{
				for(var name in proto){ common[realname].prototype[name] = proto[name];}
			}
		}
	},

	//---------------------------------------------------------------
	// includeCustomFileでファイルを読み込んだ後の処理
	//---------------------------------------------------------------
	makeCustom : function(pidlist, custombase){
		for(var i=0;i<pidlist.length;i++){
			var pid = pidlist[i];
			pzpr.custom[pid] = this.createCustom(pid, custombase);
		}
	},
	getExtension : function(pid, custombase){
		var extension = {};
		for(var hashkey in custombase){
			var name = hashkey, pidcond = [], isexist = false;
			if(hashkey.match('@')){
				pidcond = hashkey.substr(hashkey.indexOf('@')+1).split(/,/);
				name    = hashkey.substr(0,hashkey.indexOf('@'));
				for(var n=0;n<pidcond.length;n++){ if(pidcond[n]===pid){ isexist=true; break;}}
				if(!isexist){ name = '';}
			}
			if(!!name){
				var proto = custombase[hashkey];
				if(!extension[name]){ extension[name]={};}
				for(var key in proto){ extension[name][key] = proto[key];}
			}
		}
		return extension;
	},
	createCustom : function(pid, custombase){
		var custom = {};
		var extension = this.getExtension(pid, custombase);

		// 追加プロパティが指定されているクラスを作成する
		for(var key in extension){
			var realname = this.searchName(key).real;
			var proto = extension[key];
			if(!custom[realname]){
				if(!!pzpr.common[realname] && key===realname){ key=realname+":"+realname;}
				
				custom[realname] = this.createClass(key, proto, custom);
			}
			else{
				for(var name in proto){ custom[realname].prototype[name] = proto[name];}
			}
		}
		// 指定がなかった残りの共通クラスを作成(コピー)する
		for(var classname in pzpr.common){
			if(!custom[classname]){
				custom[classname] = pzpr.common[classname];
			}
		}

		return custom;
	},

	//---------------------------------------------------------------
	// createCommon, createCustomから呼び出される共通処理
	//---------------------------------------------------------------
	searchName : function(key){
		key = key.replace(/\s+/g,'');
		var colon = key.indexOf(':'), basename = '', realname = key;
		if(colon>=0){
			basename = key.substr(colon+1);
			realname = key.substr(0,colon);
		}
		return {base:basename, real:realname};
	},
	createClass : function(key, proto, customs){
		function NewClass(){};
		var basename = this.searchName(key).base;
		var BaseClass = (customs[basename] || pzpr.common[basename]);
		if(!!BaseClass){
			NewClass.prototype = new BaseClass();
		}
		else{
			NewClass.prototype.common = NewClass.prototype;
		}
		if(!!proto){
			for(var name in proto){
				NewClass.prototype[name] = proto[name];
			}
		}
		return NewClass;
	},

	//---------------------------------------------------------------
	// 単体ファイルの読み込み
	// idを取得して、ファイルを読み込み
	//---------------------------------------------------------------
	includeCustomFile : function(pid){
		if(!!pzpr.custom[pid] || !!this.includedFile[pid]){ return;}
		var _script = document.createElement('script');
		_script.type = 'text/javascript';
		_script.src = pzpr.util.getpath()+"../js/variety/"+pzpr.variety.toScript(pid)+".js";
		document.getElementsByTagName('head')[0].appendChild(_script);
		this.includedFile[pid] = true;
	},
	includedFile : {},

	//---------------------------------------------------------------------------
	// 新しくパズルのファイルを開く時の処理
	//---------------------------------------------------------------------------
	setPuzzleClass : function(puzzle, newpid, callback){
		/* 今のパズルと別idの時 */
		if(puzzle.pid != newpid){
			this.includeCustomFile(newpid);
		}
		/* Customファイルが読み込みできるまで待つ */
		if(!pzpr.custom[newpid]){
			setTimeout(function(){ pzpr.classmgr.setPuzzleClass(puzzle,newpid,callback);},10);
			return;
		}

		if(puzzle.pid != newpid){
			/* 各クラスをpzpr.customから設定する */
			this.setClasses(puzzle, newpid);
			puzzle.pid = newpid;
		}
		
		callback();
	},

	//---------------------------------------------------------------
	// パズル種類別のクラスをパズルのクラス一覧に設定する
	//      共通クラス        (pzpr.common)
	//   -> パズル種類別クラス (pzpr.custom)
	//   -> パズルが保持するクラス (initialize()の呼び出しやthis.owner等がつく)
	// と、ちょっとずつ変わっている状態になります
	//---------------------------------------------------------------
	setClasses : function(puzzle, pid){
		/* 現在のクラスを消去する */
		for(var name in puzzle.classlist){
			puzzle[name] = null; delete puzzle[name];
		}
		puzzle.classlist = [];

		var custom = pzpr.custom[pid];
		for(var classname in custom){
			var PuzzleClass = function(){
				var args = Array.prototype.slice.apply(arguments);
				if(!!this.initialize){ this.initialize.apply(this,args);}
			};
			PuzzleClass.prototype = new custom[classname];
			PuzzleClass.prototype.owner = puzzle;
			PuzzleClass.prototype.constructor = PuzzleClass;	/* constructorが指す先を修正 */
			puzzle[classname] = PuzzleClass;
			puzzle.classlist.push(classname);
		}
	}
};
