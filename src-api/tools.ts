import pzpr from "../dist/js/pzpr.js"

export function parse_query(url: string) {
	const query = url.split("?", 2)[1];

	if(!query)
		return null;

	const parts = decodeURIComponent(query).split('&');
	var args = {
		thumb: false,
		frame: 0,
		svgout: false,
		pzv: '',
	};
	for (var part of parts) {
		if (part === "thumb" || part === 'thumb=') {
			args.thumb = true;
		} else if (part === "svg" || part === 'svg=') {
			args.svgout = true;
		} else if (part.match(/^frame=([0-9]+)$/)) {
			args.frame = Math.max(0, Math.min(100, +RegExp.$1)) / 100.0
		} else if (args.pzv === '' && part.match(/^[\w-]+\//)) {
			args.pzv = part;
		}
	}
	return args;
}

export interface PuzzleDetails {
	pid: string;
	title: string;
	cols: number;
	rows: number;
}

export function pzvdetails(pzv: string): PuzzleDetails {
	const urldata = pzpr.parser.parseURL(pzv);
	const info = pzpr.variety(urldata.pid);
	return {
		pid: urldata.pid,
		title: info.en,
		cols: urldata.cols,
		rows: urldata.rows
	}
}
