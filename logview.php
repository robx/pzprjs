<!DOCTYPE html>
<HTML>
<HEAD>
<META CHARSET="utf-8">
<META NAME="robots" CONTENT="nofollow">
<TITLE>ぱずぷれログ閲覧所</TITLE>
<script type="text/javascript">

	var fc = 'pz';
	var rn = 'monthly';
	var st = 'number';
	var pname = {
		aho        : 'アホになり切れ',
		ayeheya    : '∀人∃ＨＥＹＡ',
		bag        : 'バッグ',
		barns      : 'バーンズ',
		bdblock    : 'ボーダーブロック',
		bonsan     : 'ぼんさん',
		bosanowa   : 'ボサノワ',
		box        : 'ボックス',
		chocona    : 'チョコナ',
		cojun      : 'コージュン',
		country    : 'カントリーロード',
		creek      : 'クリーク',
		factors    : '因子の部屋',
		fillmat    : 'フィルマット',
		fillomino  : 'フィルオミノ',
		firefly    : 'ホタルビーム',
		goishi     : '碁石ひろい',
		gokigen    : 'ごきげんななめ',
		hakoiri    : 'はこいり○△□',
		hashikake  : '橋をかけろ',
		heyawake   : 'へやわけ',
		hitori     : 'ひとりにしてくれ',
		icebarn    : 'アイスバーン',
		icelom     : 'アイスローム',
		ichimaga   : 'イチマガ',
		kaero      : 'お家に帰ろう',
		kakuro     : 'カックロ',
		kakuru     : 'カックル',
		kinkonkan  : 'キンコンカン',
		kramma     : '快刀乱麻',
		kurochute  : 'クロシュート',
		kurodoko   : '黒どこ',
		kusabi     : 'クサビリンク',
		lightup    : '美術館',
		lits       : 'LITS',
		loopsp     : '環状線スペシャル',
		mashu      : 'ましゅ',
		mejilink   : 'メジリンク',
		minarism   : 'マイナリズム',
		mochikoro  : 'モチコロ',
		mochinyoro : 'モチにょろ',
		nagenawa   : 'なげなわ',
		nanro      : 'ナンロー',
		nawabari   : 'なわばり',
		norinori   : 'のりのり',
		numlin     : 'ナンバーリンク',
		nuribou    : 'ぬりぼう',
		nurikabe   : 'ぬりかべ',
		paintarea  : 'ペイントエリア',
		pipelink   : 'パイプリンク',
		reflect    : 'リフレクトリンク',
		renban     : '連番窓口',
		ripple     : '波及効果',
		shakashaka : 'シャカシャカ',
		shikaku    : '四角に切れ',
		shimaguni  : '島国',
		shugaku    : '修学旅行の夜',
		shwolf     : 'ヤギとオオカミ',
		slalom     : 'スラローム',
		slither    : 'スリザーリンク',
		snakes     : 'へびいちご',
		sudoku     : '数独',
		sukoro     : '数コロ',
		sukororoom : '数コロ部屋',
		tasquare   : 'たすくえあ',
		tatamibari : 'タタミバリ',
		tateyoko   : 'タテボーヨコボー',
		tawa       : 'たわむれんが',
		tentaisho  : '天体ショー',
		tilepaint  : 'タイルペイント',
		toichika   : '遠い誓い',
		triplace   : 'トリプレイス',
		usotatami  : 'ウソタタミ',
		view       : 'ヴィウ',
		wagiri     : 'ごきげんななめ・輪切',
		wblink     : 'シロクロリンク',
		yajikazu   : 'やじさんかずさん',
		yajirin    : 'ヤジリン'
	};

	var datas = new Array();
<?php
	$datas = inputlogdata();
	output($datas);
?>

	function disp(){
		var array = datas[fc][rn];
		if(st==="number"){ array = array.sort(function(a,b){ return (a[1]!==b[1]?b[1]-a[1]:(a[0]>b[0]?1:-1));} );}
		else if(fc!=="pz"){ array = array.sort(function(a,b){ return (a[0]>b[0]?1:-1);} );}	// ＝にはならない
		else if(fc==="pz"){ array = array.sort(function(a,b){ return (((pname[a[0]]&&pname[b[0]])?pname[a[0]]>pname[b[0]]:a[0]>b[0])?1:-1);} ); }

		var max = 1;
		var total = 0;
		for(var i=0;i<array.length;i++){ if(max<array[i][1]){ max=array[i][1];} total+=array[i][1];}
		total = (total>0?total:1);
		var ratio = (max>240?240/max:1.0);

		var inhtml = ['<table border=1 cellpadding=0 cellspacing=1 style="margin:auto;">', '\n'];
		for(var i=0;i<array.length;i++){ // >
			var listname = ""+(fc==="pz" && pname[array[i][0]] ? pname[array[i][0]] : array[i][0]);
			var permill = Math.round(1000*array[i][1]/total);
			var percent = [Math.floor(permill/10), '.', (permill%10), '%'].join('');
			var barwidth = ['"', Math.ceil(array[i][1]*ratio), 'px"'].join('');
			inhtml.push(
				'<tr>',
					'<td class="list">', listname, '</td>',
					'<td class="num">', array[i][1], '</td>',
					'<td class="bar">', '<img src="rbar.gif" width=', barwidth, ' height="8px">', '</td>',
					'<td class="bar2">', percent, '</td>',
				'</tr>',
				'\n'
			);
		}
		inhtml.push('</table>', '\n');
		document.getElementById("main").innerHTML = inhtml.join('');
	}

	var fclist = { fcs1:'pz', fcs2:'rf', fcs3:'os', fcs4:'bz', fcs5:'bz3', fcs6:'lang'};
	var rnlist = { range1:'daily', range2:'weekly', range3:'monthly', range4:'season', range5:'yearly', range6:'allrange'};
	var stlist = { sorts1:'number', sorts2:'dictionary'};
	function chfcs(fc1)  { fc = fc1; menuclick(fc,fclist);}
	function chrange(rn1){ rn = rn1; menuclick(rn,rnlist);}
	function chsort(st1) { st = st1; menuclick(st,stlist);}

	function menuclick(id, list){
		disp();
		for(var i in list){
			document.getElementById(i).className = (id===list[i]?"menusel":"menu");
		}
	}

</script>
<style type="text/css"> 
<!--
	h2 { color:indianred; text-decoration:underline; margin-top:8pt;}
	span.menu { color:blue; font-weight:100; text-decoration:underline; margin-right:4pt; cursor:pointer;}
	span.menusel { color:black; font-weight:900; margin-right:4pt; cursor:default;}
	table { text-align:left;}
	td.cap { text-align: center; font-size:10pt; padding: 1pt}
	td.num { text-align: right; font-size:10pt; font-weight:900; padding-right: 2pt; color:darkgreen; background-color:cornsilk;}
	td.list { font-size:10pt; padding-left: 6pt; padding-right: 8pt; color:#000033; background-color:aliceblue;}
	td.bar  { width:240px; position:relative; padding-left: 3pt; padding-right: 4pt; background-color:snow;}
	td.bar2 { text-align: right; font-size:8pt; color:green; padding-left: 4pt; padding-right: 2pt; background-color:cornsilk;}
	td { padding-left: 6pt; padding-right: 8pt;}
	img { margin-right:3pt; vertical-align:middle; position:relative; top:-2px;}
--> 
</style> 
</HEAD>
<BODY onLoad="javascript:disp();" style="text-align:center;background-color:lemonchiffon;">

<h2>ぱずぷれログ閲覧所</h2>

<p id="clickmenu">
<table border=1 cellspacing=1 style="background-color:#efefef;margin:auto auto 8pt auto;\">
<tr><td colspan=2>
  <span id="fcs1" class="menusel" onClick="javascript:chfcs('pz');">パズル</span>
  <span id="fcs2" class="menu" onClick="javascript:chfcs('rf');">リンク元</span>
  <span id="fcs3" class="menu" onClick="javascript:chfcs('os');">OS</span>
  <span id="fcs5" class="menu" onClick="javascript:chfcs('bz3');">ブラウザ</span>
  <span id="fcs4" class="menu" onClick="javascript:chfcs('bz');">ブラウザ(詳細)</span>
  <span id="fcs6" class="menu" onClick="javascript:chfcs('lang');">言語</span>
</td></tr>
<tr><td>
  <span id="range1" class="menu" onClick="javascript:chrange('daily');">1日</span>
  <span id="range2" class="menu" onClick="javascript:chrange('weekly');">1週間</span>
  <span id="range3" class="menusel" onClick="javascript:chrange('monthly');">1ヶ月</span>
  <span id="range4" class="menu" onClick="javascript:chrange('season');">3ヶ月</span>
  <span id="range5" class="menu" onClick="javascript:chrange('yearly');">1年</span>
  <span id="range6" class="menu" onClick="javascript:chrange('allrange');">ALL</span>
</td>
<td>
  <span id="sorts1" class="menusel" onClick="javascript:chsort('number');">カウント順</span>
  <span id="sorts2" class="menu" onClick="javascript:chsort('dictionary');">ABC順</span>
</td></tr>
</table>
</p>

<p id="main"></p>

</BODY>
</HTML>
<?php /////////////////////////////////////////////////////////////////////////

	function inputlogdata(){
		global $tkey;
		$tkey = 0;
		require_once('../logview/logutil.php');
		return read_logdata(array("../logview/logdata.txt"));
	}

	function output($datas){
		//$fcs = array('pz', 'rf', 'matrix', 'matrix2', 'os', 'bz', 'bz3');
		$fcs = array('pz', 'rf', 'os', 'bz', 'bz3', 'lang');

		foreach($fcs as $fc){
			echo "\tdatas[\"$fc\"] = new Array();\n";
			if(!is_array($datas[$fc])){ continue;}
			foreach($datas[$fc] as $range => $val){
				$text = array();
				foreach($datas[$fc][$range] as $obj => $val){
					array_push($text, "[\"$obj\", $val]");
				}
				echo "\tdatas[\"$fc\"][\"$range\"] = [".join(",",$text)."];\n";
			}
		}
	}
?>
