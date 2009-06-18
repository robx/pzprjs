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

	push @files2, "../$file";
}
closedir PAR;

$reduce = 1;

$version = 'v3.2.0p3';
@dates = localtime(time);
$datestr = sprintf("%04d-%02d-%02d",1900+$dates[5],1+$dates[4],$dates[3]);

	$notice = <<"EOR";
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
 * For improvement of canvas drawing time, I make some change on uupaa-excanvas.js.
 * Please see "//happa add.[20090608]" in uuCanvas.js.
 * 
 * This script is dual licensed under the MIT and Apache 2.0 licenses.
 * http://indi.s58.xrea.com/pzpr/v3/LICENCE.HTML
 * 
 */
EOR

open OUT, ">../pzprBase.js";
open FULL, ">../pzprBase_Full.js";
print OUT $notice;
print FULL $notice;

if($ARGV[0] eq '-D'){
	push @files1, 'testonly.js';

	print OUT "// pzplBase.js テスト用\n";
	print FULL "// pzplBase.js テスト用\n";
}

print FULL "\n\nvar pzprversion = \"$version\";\n\n";
print OUT "var pzprversion=\"$version\";";
&output(\@files1,1);
close OUT;
close FULL;

open OUT, ">../puzzles.js";
open FULL, ">../puzzles_Full.js";
&output(\@files2,2);
close OUT;
close FULL;

sub output(){
	my @files = @{$_[0]};
	my $l=0;
	foreach(@files){
		if($_[1]==2 || $ARGV[0] ne '-D'){
			open SRC, $_;
			my $sline = <SRC>;
			$sline =~ /\/\/ +([^ ]+) +([^ \r\n]+)[\r\n]*/;
			print("$1 $2\n");
			while(<SRC>){
				my $sline = $_;
				print FULL $sline;
				
				$sline =~ tr/\r\n//d;
				$sline =~ s/\t//g;
				$sline =~ s/^\/\/.*//g;
				$sline =~ s/([^\\\:])\/\/.*/$1/g;
				$sline =~ s/[ ]*$//;
				$sline =~ s/^[ ]//;
				$sline =~ s/[ ]*(\:|\;|\.|\,|\=+|\|+|\&+|\+|\(|\)|\{|\}|\[|\]|\<|\>|\?)[ ]*/$1/g;
				$sline =~ s/[ ]{2,}\-[ ]*/\-/g;
				if($sline){ print OUT $sline;}
#				if($sline){
#					if($l>=4500 && $l<4600){ print OUT $sline;}
#					else{ print OUT "$sline\n";}
#					$l++;
#				}
			}
			close SRC;
		}
		else{
			print FULL "document.writeln(\"<script type=\\\"text/javascript\\\" src=\\\"src/pzprBase/$_\\\"></script>\");\n";
			print OUT "document.writeln(\"<script type=\\\"text/javascript\\\" src=\\\"src/pzprBase/$_\\\"></script>\");\n";
		}
	}
}
