#!/usr/bin/perl

use CGI;
$q = new CGI;

print "Content-type: text/plain\n\n";

$filename = "../logview/accesslog.txt";
if($q->param('scr') eq 'pzprapp'){ $filename = "accesslog_regacy.txt";}

if($filename && $q->param('pid'))
{
	open LOG, ">>$filename";
	printf(LOG "%s<>%d<>%s<>%s<>%s<>%s<>\n"
		,$q->param('pid')
		,time
		,$ENV{"HTTP_USER_AGENT"}
		,$q->param('referer')
		,$q->param('pzldata')
		,(split(/,/, $ENV{'HTTP_ACCEPT_LANGUAGE'}))[0]
	);
	close LOG;
}

exit(0);
