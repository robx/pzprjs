
our $debug = 0;
our $puzzles = 1;
our $version = 'v3.2.0p1';

&main();

sub main{
	&input_flags();

	open LOG, ">contents.txt";
	print LOG "pzprBase.js $version contents\n";
	close LOG;

	&output_doc("document_tmp.txt");
	&output_pzprBase();
	if($puzzles){ &output_puzzles();}
}

sub input_flags{
	my $cons;

	print "リリース用pzprBase.jsを出力しますか？[y] ";
	$cons = <STDIN>;
	$cons =~ tr/\r\n//d;
	if($cons =~ /n/i){ $debug=1;}

	print "puzzles.jsを出力しますか？[y] ";
	$cons = <STDIN>;
	$cons =~ tr/\r\n//d;
	if($cons =~ /n/i){ $puzzles=0;}

	print "バージョンを入力してください[v3.2.0p1] ";
	$cons = <STDIN>;
	$cons =~ tr/\r\n//d;
	if($cons){ $version = $cons;}
}

sub output_pzprBase{
	@files1 = (
		'global.js',
		'Board.js',
		'Graphic.js',
		'MouseInput.js',
		'KeyInput.js',
		'Encode.js',
		'Filesys.js',
		'Answer.js',
		'Undo.js',
		'Menu.js',
		'MenuExec.js',
		'pzprUtil.js',
		'Main.js'
	);

	open OUT, ">pzprBase_Full_tmp.js";
	if($debug){
		print OUT "// pzplBase.js テスト用\n";
	}
	print OUT "\nvar pzprversion=\"$version\";\n";
	&printfiles(\@files1,1);
	close OUT;

	if(!$debug){
		system("java -jar ../../../yuicompressor-2.4.2/build/yuicompressor-2.4.2.jar -o ./pzprBase_tmp.js ./pzprBase_Full_tmp.js");
		system("copy /Y /B .\\document_tmp.txt + .\\pzprBase_tmp.js .\\pzprBase.js");
		system("copy /Y /B .\\document_tmp.txt + .\\pzprBase_Full_tmp.js .\\pzprBase_Full.js");

		unlink("pzprBase_tmp.js");
		unlink("pzprBase_Full_tmp.js");
		unlink("document_tmp.txt");

		@fl = ('pzprBase.js','pzprBase_Full.js');
		foreach(@fl){ system("copy /Y .\\$_ .."); unlink($_);}
	}
	else{
		system("copy /Y .\\pzprBase_Full_tmp.js ..\\pzprBase.js");
		unlink("pzprBase_Full_tmp.js");
		unlink("document_tmp.txt");
	}
}

sub output_puzzles{
	@files2 = ();
	opendir PAR, "../";
	while($file = readdir PAR){
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

		push @files2, "../$file";
	}
	closedir PAR;

	open OUT, ">puzzles_Full.js";
	&printfiles(\@files2,2);
	close OUT;
	system("java -jar ../../../yuicompressor-2.4.2/build/yuicompressor-2.4.2.jar -o ./puzzles.js ./puzzles_Full.js");

	@fl = ('puzzles.js','puzzles_Full.js');
	foreach(@fl){ system("copy /Y .\\$_ .."); unlink($_);}
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
 * \@author  happa.
 * \@version $version
 * \@date    $datestr
 * 
 * This script uses following libraries.
 *  jquery.js (version 1.3.2)
 *  http://jquery.com/
 *  uuCanvas.js (version 1.0)
 *  http://code.google.com/p/uupaa-js-spinoff/	uupaa.js SpinOff Project Home(Google Code)
 * 
 * For improvement of canvas drawing time, I make some change on uuCanvas.js.
 * Please see "//happa add.[20090608]" in uuCanvas.js.
 * 
 * This script is dual licensed under the MIT and Apache 2.0 licenses.
 * http://indi.s58.xrea.com/pzpr/v3/LICENCE.HTML
 * 
 */
EOR
	close DOC;
}

sub printfiles{
	my @files = @{$_[0]};
	my $l=0;
	open LOG, ">>contents.txt";
	print LOG "\n";
	foreach(@files){
		if($_[1]==2 || !$debug){
			open SRC, $_;
			if($_[1]==1){
				my $sline = <SRC>;
				$sline =~ /\/\/ +([^ ]+) +([^ \r\n]+)[\r\n]*/;
				print("$1 $2\n");
				printf(LOG "%-14s %-s\n",$1,$2);
			}
			elsif($_[1]==2){
				my $sline = <SRC>; print OUT $sline;
				$sline = <SRC>;
				$sline =~ /(\w+\.js) +([^ \r\n]+)[\r\n]*/;
				print("$1 $2\n");
				printf(LOG "%-14s %-s\n",$1,$2);
				print OUT $sline;
				$sline = <SRC>; print OUT $sline;
			}
			while(<SRC>){
				my $sline = $_;
				print OUT $sline;
			}
			close SRC;
		}
		else{
			print OUT "document.writeln(\"<script type=\\\"text/javascript\\\" src=\\\"src/pzprBase/$_\\\"></script>\");\n";
		}
	}
	close LOG;
}
