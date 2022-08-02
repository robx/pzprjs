import pzpr from "../dist/js/pzpr.js"

export function decode_vercel_query(url: string): string {
	const decoded = decodeURIComponent(url);
	return decoded.replace(/\s/g, "+");
}

export function parse_query(url: string) {
	const query = url.split("?", 2)[1];

	if(!query)
		return null;

	let parts: string[];
	try {
		parts = decode_vercel_query(query).split('&');
	} catch {
		return null;
	}
	var args = {
		thumb: false,
		frame: 0,
		svgout: false,
		bank: null as boolean | null,
		pzv: '',
	};
	for (var part of parts) {
		if (part === "bank" || part === 'bank=') {
			args.bank = true;
		} else if (part === "no-bank" || part === 'no-bank=') {
			args.bank = false;
		} else if (part === "thumb" || part === 'thumb=') {
			args.thumb = true;
		} else if (part === "svg" || part === 'svg=') {
			args.svgout = true;
		} else if (part.match(/^frame=([0-9]+)$/)) {
			args.frame = Math.max(0, Math.min(100, +RegExp.$1)) / 100.0
		} else if (args.pzv === '' || part.match(/^[\w-]+\//)) {
			if(!part.match(/^[\w-]+\//) && part.endsWith("=")) {
				args.pzv = part.substring(0, part.length - 1);
			} else {
				args.pzv = part;
			}
		}
	}
	return args;
}

export interface PuzzleDetails {
	pid: string;
	isEditor: boolean;
	bodyMode: "blank" | "url" | "file",
	title: string;
	cols: number;
	rows: number;
}

export function pzvdetails(pzv: string): PuzzleDetails {
	const urldata = pzpr.parser.parseURL(pzv);
	const info = pzpr.variety(urldata.pid);
	return {
		pid: urldata.pid,
		isEditor: urldata.mode ? urldata.mode === "editor" : !urldata.body,
		bodyMode: !urldata.body ? "blank" : urldata.type === pzpr.parser.URL_PZPRFILE ? "file" : "url",
		title: info.en,
		cols: urldata.cols,
		rows: urldata.rows
	}
}
