<?php
	require_once('../logview/logutil.php');
	header("Content-type: text/html");
	startup();
	$datas = input();
?><!DOCTYPE html>
<HTML>
<HEAD>
<META CHARSET="utf-8">
<META NAME="robots" CONTENTS="nofollow">
<TITLE><?php echo("$title"); ?></TITLE>
<script type="text/javascript">
<!--
	var fc = 'pz';
	var rn = 'table';
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
		tasquare   : 'たすくえあ',
		tatamibari : 'タタミバリ',
		tateyoko   : 'タテボーヨコボー',
		tawa       : 'たわむれんが',
		tentaisho  : '天体ショー',
		tilepaint  : 'タイルペイント',
		triplace   : 'トリプレイス',
		usotatami  : 'ウソタタミ',
		view       : 'ヴィウ',
		wblink     : 'シロクロリンク',
		yajikazu   : 'やじさんかずさん',
		yajirin    : 'ヤジリン'
	};

	var datas = new Array();

	var array_dt  = new Array();
	var array_col = new Array();

<?php output($datas); ?>

	function disp(){
		if(tkey==0){ displog(); return;}<?php // 公開版はdisplog()関数に飛んで終了 // ?>

		var inhtml = "";

//		array_col[fc] = array_col[fc].sort(function(a,b){ return (a>b?1:-1)});
		array_dt = array_dt.sort(function(a,b){ return (a>b?1:-1);});

		if(rn=="table"){
			inhtml = "<table border=1 cellpadding=0 cellspacing=1>\n";
			var i;
			inhtml += "<tr>\n<td></td>\n";
			for(i=0;i<array_col[fc].length;i++){
				inhtml += "<td class=\"cap\">"+array_col[fc][i]+"</td>\n";
			}
			inhtml += "</tr>\n";
			for(i=0;i<array_dt.length;i++){
				inhtml += "<tr>\n<td>"+array_dt[i]+"</td>\n";
				var j
				for(j=0;j<array_col[fc].length;j++){
					if(isNaN(datas[fc][array_dt[i]][array_col[fc][j]])){ inhtml += "<td class=\"num\">0</td>\n";}
					else{ inhtml += "<td class=\"num\">"+datas[fc][array_dt[i]][array_col[fc][j]]+"</td>\n";}
				}
				inhtml += "</tr>\n";
			}
			inhtml += "</table>\n";
		}
		else{
			inhtml = "<table border=1 cellpadding=0 cellspacing=1><tr><td>\n";
			var i;
			inhtml += "";
			for(i=0;i<array_col[fc].length;i++){
				inhtml += ",\""+array_col[fc][i]+"\"";
			}
			inhtml += "<br>\n";
			for(i=0;i<array_dt.length;i++){
				inhtml += "\""+array_dt[i]+"\"";
				var j
				for(j=0;j<array_col[fc].length;j++){
					if(isNaN(datas[fc][array_dt[i]][array_col[fc][j]])){ inhtml += ",0";}
					else{ inhtml += ","+datas[fc][array_dt[i]][array_col[fc][j]];}
				}
				inhtml += "<br>\n";
			}
			inhtml += "</td></tr></table>\n";
		}
		document.getElementById("main").innerHTML = inhtml;
	}

	function displog(){
		var inhtml = "<table border=1 cellpadding=0 cellspacing=1 style=\"margin:auto;\">\n";
		var array = datas[fc][rn];
		if(st=="number"){ array = array.sort(function(a,b){ return (a[1]!=b[1]?b[1]-a[1]:(a[0]>b[0]?1:-1));} );}
		else if(fc!="pz"){ array = array.sort(function(a,b){ return (a[0]>b[0]?1:-1);} );}	// ＝にはならない
		else if(fc=="pz"){ array = array.sort(function(a,b){ return (((pname[a[0]]&&pname[b[0]])?pname[a[0]]>pname[b[0]]:a[0]>b[0])?1:-1);} ); }

		var max = 1;
		var total = 0;
		for(var i=0;i<array.length;i++){ if(max<array[i][1]){ max=array[i][1];} total+=array[i][1];}
		total = (total>0?total:1);
		var ratio = (max>240?240/max:1.0);

		for(var i=0;i<array.length;i++){
			var listname = ""+array[i][0];
			if(fc=="pz" && pname[array[i][0]]){ listname = ""+pname[array[i][0]];}
			inhtml += "<tr><td class=\"list\">"+listname+"</td><td class=\"num\">"+array[i][1]+"</td>";
			inhtml += "<td class=\"bar\"><img src=\"rbar.gif\" width=\""+Math.ceil(array[i][1]*ratio)+"px\" height=\"8px\"></td>";
			var permill = Math.round(1000*array[i][1]/total);
			inhtml += ("<td class=\"bar2\">"+(Math.floor(permill/10))+"."+(permill%10)+"%</td></tr>\n");
		}
		inhtml += "</table>\n";
		document.getElementById("main").innerHTML = inhtml;
	}

	function chfcs(fc1){
		fc = fc1;
		disp();
		document.getElementById("fcs1").className = (fc=="pz"?"menusel":"menu");
		document.getElementById("fcs2").className = (fc=="rf"?"menusel":"menu");
		document.getElementById("fcs3").className = (fc=="os"?"menusel":"menu");
		document.getElementById("fcs4").className = (fc=="bz"?"menusel":"menu");
		document.getElementById("fcs5").className = (fc=="bz3"?"menusel":"menu");
		//if(tkey!=0){ return;}
		//document.getElementById("fcs6").className = (fc=="matrix"?"menusel":"menu");
		//document.getElementById("fcs7").className = (fc=="matrix2"?"menusel":"menu");
	}

	function chrange(rn1){
		rn = rn1;
		disp();
		if(tkey!=0){
			document.getElementById("range1").className = (rn=="table"?"menusel":"menu");
			document.getElementById("range2").className = (rn=="tab"?"menusel":"menu");
		}
		else{
			document.getElementById("range1").className = (rn=="daily"?"menusel":"menu");
			document.getElementById("range2").className = (rn=="weekly"?"menusel":"menu");
			document.getElementById("range3").className = (rn=="monthly"?"menusel":"menu");
			document.getElementById("range4").className = (rn=="season"?"menusel":"menu");
			document.getElementById("range5").className = (rn=="yearly"?"menusel":"menu");
			document.getElementById("range6").className = (rn=="allrange"?"menusel":"menu");
		}
	}

	function chsort(st1){
		if(tkey!=0){ return;}
		st = st1;
		disp();
		document.getElementById("sorts1").className = (st=="number"?"menusel":"menu");
		document.getElementById("sorts2").className = (st=="dictionary"?"menusel":"menu");
	}
//-->
</script>
<style type="text/css"> 
<!--
	h2 { color:indianred; text-decoration:underline; margin-top:8pt;}
	span.menu { color:blue; font-weight:100; text-decoration:underline; margin-right:4pt; cursor:pointer;}
	span.menusel { color:black; font-weight:900; margin-right:4pt; cursor:default;}
	td.cap { text-align: center; font-size:10pt; padding: 1pt}
	td.num { text-align: right; font-size:10pt; font-weight:900; padding-right: 2pt; color:darkgreen; background-color:cornsilk;}
	td.list { font-size:10pt; padding-left: 6pt; padding-right: 8pt; color:#000033; background-color:aliceblue;}
	td.bar  { width:240px; padding-left: 3pt; padding-right: 4pt; background-color:snow;}
	td.bar2 { text-align: right; font-size:8pt; color:green; padding-left: 4pt; padding-right: 2pt; background-color:cornsilk;}
	td { padding-left: 6pt; padding-right: 8pt;}
	img { margin-right:3pt;}
--> 
</style> 
</HEAD>
<BODY onLoad="javascript:disp();" style="text-align:center;background-color:lemonchiffon;">

<h2>ぱずぷれログ閲覧所</h2>

<p id="clickmenu">
<table border=1 cellspacing=1 style="background-color:#efefef;margin:auto auto 8pt auto;\">
<tr><td colspan=2>
<?php dispmenu1(); ?>
</td></tr>
<tr><td>
<?php dispmenu2(); ?>
</td>
<td>
<?php dispmenu3(); ?>
</td></tr>
</table>
</p>

<p id="main"></p>

</BODY>
</HTML>
<?php ///////////////////////////////////////////////////////////////////////////////////////////////// ?>
<?php

	function startup(){
		global $title, $label, $tkey;

		// t=0か、入力されていないとき
		$title = "ログ閲覧所";
		$label = "";
		$tkey = 0;

		if(array_key_exists("t", $_GET)){
			switch($_GET["t"]){
				case 1:
					$title = "週間30日ログ閲覧所";
					$label = "日刊";
					$tkey = 1;
					break;
				case 2:
					$title = "週間ログ閲覧所";
					$label = "週間";
					$tkey = 2;
					break;
				case 3;
					$title = "月例ログ閲覧所";
					$label = "月間";
					$tkey = 3;
			}
		}
	}

	function dispmenu1(){
		global $tkey;

		echo "<span id=\"fcs1\" class=\"menusel\" onClick=\"javascript:chfcs('pz');\">パズル</span>\n";
		echo "<span id=\"fcs2\" class=\"menu\" onClick=\"javascript:chfcs('rf');\">リンク元</span>\n";
		echo "<span id=\"fcs3\" class=\"menu\" onClick=\"javascript:chfcs('os');\">OS</span>\n";
		echo "<span id=\"fcs5\" class=\"menu\" onClick=\"javascript:chfcs('bz3');\">ブラウザ</span>\n";
		echo "<span id=\"fcs4\" class=\"menu\" onClick=\"javascript:chfcs('bz');\">ブラウザ(詳細)</span>\n";
		//if($tkey==0){
		//	echo "<span id=\"fcs6\" class=\"menu\" onClick=\"javascript:chfcs('matrix');\">OS/ブラウザ</span>\n";
		//	echo "<span id=\"fcs7\" class=\"menu\" onClick=\"javascript:chfcs('matrix2');\">ブラウザ/OS</span>\n";
		//}
	}
	function dispmenu2(){
		global $tkey;

		if($tkey!=0){
			echo "<span id=\"range1\" class=\"menusel\" onClick=\"javascript:chrange('table');\">$label(table)</span>\n";
			echo "<span id=\"range2\" class=\"menu\" onClick=\"javascript:chrange('tab');\">$label(コンマ区切り)</span>\n";
		}
		else{
			echo "<span id=\"range1\" class=\"menu\" onClick=\"javascript:chrange('daily');\">1日</span>\n";
			echo "<span id=\"range2\" class=\"menu\" onClick=\"javascript:chrange('weekly');\">1週間</span>\n";
			echo "<span id=\"range3\" class=\"menusel\" onClick=\"javascript:chrange('monthly');\">1ヶ月</span>\n";
			echo "<span id=\"range4\" class=\"menu\" onClick=\"javascript:chrange('season');\">3ヶ月</span>\n";
			echo "<span id=\"range5\" class=\"menu\" onClick=\"javascript:chrange('yearly');\">1年</span>\n";
			echo "<span id=\"range6\" class=\"menu\" onClick=\"javascript:chrange('allrange');\">ALL</span>\n";
		}
	}
	function dispmenu3(){
		global $tkey;

		if($tkey!=0){
			echo "<span id=\"sorts2\" class=\"menusel\">ABC順</span>\n";
		}
		else{
			echo "<span id=\"sorts1\" class=\"menusel\" onClick=\"javascript:chsort('number');\">カウント順</span>\n";
			echo "<span id=\"sorts2\" class=\"menu\" onClick=\"javascript:chsort('dictionary');\">ABC順</span>\n";
		}
	}

	function input(){
		global $tkey;

		$datas = array();
		$files = array("../logview/logdata.txt");
		$state = 0;
		$pastday = 1;

//		$nowdate,$nowweek,$nowmonth,$key;

		foreach($files as $file){
			$fp = fopen($file, 'r');
			while(!feof($fp)){
				$sline = rtrim(fgets($fp));
				$inp = split("\t",$sline);

				if($state==0){
					if($sline=="_EOL_"){ $state=1;}
					else{
						$nowdate = $inp[0];
						$nowweek = $inp[1];
						preg_match("/^(\d+\/\d+)/",$nowdate,$ma); $nowmonth = $ma[1];

						if    ($tkey==1){ $key = $nowdate;}
						elseif($tkey==2){ $key = $nowweek;}
						elseif($tkey==3){ $key = $nowmonth;}
					}
				}
				elseif($state==1){
					if($sline=="_EOL_"){ $state=2;}
					else{ input1($datas['pz'],$pastday,$key,$inp[0],$inp[1]);}
				}
				elseif($state==2){
					if($sline=="_EOL_"){ $state=3;}
					else{
						if(preg_match("/^([^\?]+?)\?/",$inp[0],$ma)){ $inp[0] = $ma[1];}
						$inp[0] = referrer($inp[0]);
						input1($datas['rf'],$pastday,$key,$inp[0],$inp[1]);
					}
				}
				elseif($state==3){
					if(strstr($sline,"_EOD_")){ $state=0; ++$pastday;}
					else{
						input1($datas['os'],$pastday,$key,$inp[0],$inp[2]);
						input1($datas['bz'],$pastday,$key,$inp[1],$inp[2]);
						input1($datas['bz3'],$pastday,$key,bz3($inp[1]),$inp[2]);
						//if($tkey==0){
						//	input1($datas['matrix'],$pastday,$key,"$inp[0]</td><td class=\\\"list\\\">$inp[1]",$inp[2]);
						//	input1($datas['matrix2'],$pastday,$key,"$inp[1]</td><td class=\\\"list\\\">$inp[0]",$inp[2]);
						//}
					}
				}

				if($tkey==1 && $pastday>30){ break;}
			}
			fclose($fp);
		}
		return $datas;
	}

	function input1(&$data1, $pastday, $key, $key2, $val){
		global $tkey;
		if($tkey!=0){ $data1[$key][$key2] += $val;}
		else{
			if($pastday<=1){ $data1{'daily'}{$key2} += $val;}
			if($pastday<=7){ $data1{'weekly'}{$key2} += $val;}
			if($pastday<=30){ $data1{'monthly'}{$key2} += $val;}
			if($pastday<=90){ $data1{'season'}{$key2} += $val;}
			if($pastday<=365){ $data1{'yearly'}{$key2} += $val;}
			$data1{'allrange'}{$key2} += $val;
		}
	}

	function output($datas){
		global $tkey;

		if($tkey==0){ output0($datas); return;}

		$fcs = array('pz', 'rf', 'os', 'bz', 'bz3');
		$colh = array();
		$dateh = array();
		$dates = array();

		foreach($fcs as $fc){
			echo "\tdatas[\"$fc\"] = new Array();\n";
			foreach($datas[$fc] as $date => $val){
				ksort($datas[$fc][$date]);
				$text = array();
				foreach($datas[$fc][$date] as $obj => $val){
					array_push($text, "\"$obj\":$val");
					$colh[$fc][$obj]++;
				}
				echo "\tdatas[\"$fc\"][\"$date\"] = {".join(",",$text)."};\n";
				$dateh[$date]++;
			}
		}
		foreach($fcs as $fc){
			$cols = array();
			ksort($colh[$fc]);
			foreach($colh[$fc] as $key => $val){ array_push($cols, "\"$key\"");}
			echo "\tarray_col[\"$fc\"] = [".join(",",$cols)."];\n";
		}
		ksort($dateh);
		foreach($dateh as $key => $val){ array_push($dates, "\"$key\"");}
		echo "\tarray_dt = [".join(",",$dates)."];\n";

		echo "\n";
		echo "\tvar tkey = $tkey;\n";
	}

	function output0($datas){
		//$fcs = array('pz', 'rf', 'matrix', 'matrix2', 'os', 'bz', 'bz3');
		$fcs = array('pz', 'rf', 'os', 'bz', 'bz3');

		foreach($fcs as $fc){
			echo "\tdatas[\"$fc\"] = new Array();\n";
			foreach($datas[$fc] as $range => $val){
				$text = array();
				foreach($datas[$fc][$range] as $obj => $val){
					array_push($text, "[\"$obj\", $val]");
				}
				echo "\tdatas[\"$fc\"][\"$range\"] = [".join(",",$text)."];\n";
			}
		}

		echo "\n";
		echo "\tvar tkey = 0;\n";
		echo "\tvar rn = 'monthly';\n";
	}
?>
