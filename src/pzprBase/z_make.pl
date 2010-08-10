
our $debug = 0;
our $filech = 1;
our $version = 'v3.3.0p2';

&main();
exit(0);

sub main{
	&input_flags();

	if(!$debug){
		&eraseLOG();
		&printLOG("pzprBase.js $version contents\n");
	}

	&output_pzprBase();
	if(!$debug){
		&output_puzzles(); # contents.txtにファイル名出力するだけ
	}
}

sub input_flags{
	print "Output release file? [y] ";
	$_ = <STDIN>; tr/\r\n//d;
	if(/n/i){ $debug=1;}

	print "Input version number [$version] ";
	$_ = <STDIN>; tr/\r\n//d;
	if($_){
		$version = $_;
		$version =~ s/\[a\]/α/g;
		$version =~ s/\[b\]/β/g;
	}
}

sub output_pzprBase{
	my @files = (
		'Camp.js',
		'global.js',
		'Board.js',
		'Graphic.js',
		'MouseInput.js',
		'KeyInput.js',
		'Encode.js',
		'Filesys.js',
		'DataBase.js',
		'Answer.js',
		'Undo.js',
		'Menu.js',
		'MenuExec.js',
		'pzprUtil.js',
		'Main.js'
	);

	open OUT, ">pzprBase_body_Full.js";
	if($debug){
		print OUT "// pzplBase.js テスト用\n";
	}
	print OUT "\nvar pzprversion=\"$version\";\n";
	&printfiles(\@files,1);
	close OUT;

	if(!$debug){
		&output_doc("notices.txt");

		system("java -jar ../../../yuicompressor-2.4.2/build/yuicompressor-2.4.2.jar --charset utf-8 -o ./pzprBase_body.js ./pzprBase_body_Full.js");
		system("copy /Y /B .\\notices.txt + .\\pzprBase_body.js ..\\pzprBase.js");
		system("copy /Y /B .\\notices.txt + .\\pzprBase_body_Full.js ..\\pzprBase_Full.js");

		unlink("notices.txt");
		unlink("pzprBase_body.js");
		unlink("pzprBase_body_Full.js");
	}
	else{
		system("copy /Y .\\pzprBase_body_Full.js ..\\pzprBase.js");
		unlink("pzprBase_body_Full.js");
	}
}

sub output_puzzles{
	my @files = ();
	opendir PAR, "../";
	while(my $file = readdir PAR){
		if($file !~ /\.js$/){ next;}
		if($file =~ /p\d+\.js$/){ next;}
		if($file =~ /pzprBase/){ next;}
		if($file =~ /puzzles/){ next;}
		if($file =~ /uuCanvas\.js/){ next;}
		if($file =~ /excanvas\.js/){ next;}
		if($file =~ /jquery\.js/){ next;}
		if($file =~ /Prototype\.js/){ next;}
		if($file =~ /gears_init\.js/){ next;}
		if($file =~ /for_test\.js/){ next;}

		push @files, "../$file";
	}
	closedir PAR;

	&printfiles(\@files,3);
}

sub output_doc{
	my $file = shift;
	my @dates = localtime(time);
	my $datestr = sprintf("%04d-%02d-%02d",1900+$dates[5],1+$dates[4],$dates[3]);

	open DOC, ">$file";

	print DOC <<"EOR";
/* 
 * pzprBase.js
 * 
 * pzprBase.js is a base script for playing nikoli puzzles on Web
 * written in JavaScript.
 * 
 * \@author  dk22
 * \@version $version
 * \@date    $datestr
 * 
 * This script is licensed under the MIT license. See below,
 * http://www.opensource.org/licenses/mit-license.php
 * 
 */
EOR
	close DOC;
}

# ファイル出力関数
sub printfiles{
	my @files = @{$_[0]};
	my $type = $_[1];

	if(!$debug and $filech==1){ &printLOG("\n");}

	foreach(@files){
		my $filename = $_;

		if($debug){
			print OUT "document.writeln(\"<script type=\\\"text/javascript\\\" src=\\\"src/pzprBase/$_\\\"></script>\");\n";
			next;
		}

		# header部の処理 => バージョンを取得する
		if($type!=2){
			my @val = &get_version($filename, $type);
			&printLOG(sprintf("%-14s %-s\n",@val));

			# $typeが3なら、バージョンだけ書き出して終了
			if($type==3){ next;}
		}

		# 実際の出力部
		open SRC, $filename;
		{
			if($type==1){ <SRC>;}	# pzprBaseのファイルはヘッダ部を出力しない

			# 変換をかけたい場合は、、この中に変換処理を入れるべし
			while(<SRC>){
				my $sline = $_;
				print OUT $sline;
			}
		}
		close SRC;
	}
}

# バージョン取得用関数
sub get_version{
	my($filename, $type) = @_;
	my $sline = '';
	my @ret = ();

	open SRC, $filename;
	# pzprBaseフォルダのファイルはversionが1行目
	if($type == 1){
		$_ = <SRC>;
		/\/\/ +([^ ]+) +([^ \r\n]+)[\r\n]*/;
		@ret = ($1,$2);
	}
	# puzzlesのファイルはversionが2行目
	elsif($type == 3){
		<SRC>; $_ = <SRC>;
		/(\w+\.js) +([^ \r\n]+)[\r\n]*/;
		@ret = ($1,$2);
	}
	close SRC;

	return @ret;
}

sub eraseLOG{
	open LOG, ">contents.txt";
	close LOG;
}
sub printLOG{
	open LOG, ">>contents.txt";
	printf(LOG $_[0]);
	close LOG;
}
