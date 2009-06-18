#!/usr/local/bin/perl

print "Content-type: text/plain\n\n";

&decode();

if($in{'pid'}){
	open LOG, ">>accesslog_regacy.txt";
	printf(LOG "%s<>%d<>%s<>%s<>%s<>\n",$in{'pid'},time,$ENV{"HTTP_USER_AGENT"},$in{'referer'},$in{'pzldata'});
	close LOG;
}

exit(0);

#---------------
# デコード処理 |
#---------------

sub decode{
    my($encoding) = @_;
    $method = $ENV{'REQUEST_METHOD'};
    local($query, $key, $val, @in);

    if($method eq 'GET') { $query = $ENV{'QUERY_STRING'}; }
    elsif($method eq 'POST') { read(STDIN, $query, $ENV{'CONTENT_LENGTH'}); }

    local(@query) = split(/&/, $query);
    foreach(@query){
        tr/+/ /;
        ($key, $val) = split(/=/);

        # %HH 形式の部分のデコード

        $key =~ s/%([A-Fa-f0-9][A-Fa-f0-9])/pack("c", hex($1))/ge;
        $val =~ s/%([A-Fa-f0-9][A-Fa-f0-9])/pack("c", hex($1))/ge;
        $val =~ s/\r\n/\n/g;

        # jcode.pl を使うときは＃をはずす．．．
        #jcode'convert(*key, $encoding) if ($encoding);
        #jcode'convert(*val, $encoding) if ($encoding);

        $in{$key} = $val;        
    }
    return *in;
}
