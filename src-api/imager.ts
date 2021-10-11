import fs = require('fs');
import path = require('path');
import { VercelResponse } from "@vercel/node";
import { parse_query, pzvdetails } from "./tools"
import sharp from "sharp"
import pzpr from "../dist/js/pzpr.js"

const fontPath = path.resolve(process.cwd(), 'src-api/fonts')
path.resolve(fontPath, 'NotoSansJP-Regular.otf') // Reference font so it gets copied
path.resolve(fontPath, 'fonts.conf') // Reference conf so it gets copied

process.env.FONTCONFIG_PATH=fontPath

const maskHoriz = fs.readFileSync(path.resolve(process.cwd(), 'src-api/img', 'mask-horiz.png'));
const maskVert = fs.readFileSync(path.resolve(process.cwd(), 'src-api/img', 'mask-vert.png'));

export function preview(res: VercelResponse, url: string) {
	var qargs = parse_query(url);
	if (!qargs || !qargs.pzv) {
		res.statusCode = 400;
		res.end();
		console.log('no pzv found');
		return;
	}
	// deal with <type>_edit links
	var pzv = qargs.pzv.replace(/_edit/, '');

	var details = pzvdetails(pzv);
	if (details.cols > 100 || details.rows > 100) {
		res.statusCode = 404;
		res.end("oversized puzzle");
		console.log('skipping large puzzle:', pzv);
		return;
	}

	const canvas = {};
	const p = new pzpr.Puzzle(canvas);
	p.open(pzv, async () => {
		p.setMode('play');
		p.setConfig('undefcell', false);
		p.setConfig('autocmp', false);

		var svgTxt: string = p.toBuffer('svg', 0, 30);

		if (qargs.svgout) {
			res.statusCode = 200;
			res.setHeader('Content-Type', 'image/svg+xml');
			res.setHeader('Cache-Control', 'max-age=86400, s-maxage=2592000')
			res.end(svgTxt);
			return;
		}

		// Manually set overflow attribute on ImageTile tags
		while(svgTxt.indexOf('<use x=') !== -1) {
			svgTxt = svgTxt.replace('<use x=', '<use overflow="hidden" x=');
		}

		// Inject background into svg
		const endIndex = svgTxt.indexOf('<g shape-rendering');
		svgTxt = svgTxt.slice(0, endIndex) +
				'<rect x="-100" y="-100" width="1000%" height="1000%" fill="white" />' +
				svgTxt.slice(endIndex);

		const svg = Buffer.from(svgTxt);

		const cols = details.cols;
		const rows = details.rows;
		enum Shape {
			Square,
			Tall,
			Wide,
		}
		var shape = Shape.Square;
		if (!isNaN(cols) && !isNaN(rows)) {
			if (rows/cols >= 2) {
				shape = Shape.Tall;
			} else if (cols/rows >= 2) {
				shape = Shape.Wide;
			}
		}

		res.setHeader('Content-Type', 'image/png')
		res.setHeader('Cache-Control', 'max-age=86400, s-maxage=2592000')

		const s = sharp(svg)
			.trim(0.001)
			.toFormat('png')
		
		var newWidth: number
		var newHeight: number

		if(qargs.thumb) {
			switch(shape) {
				case Shape.Square:
					s.resize({width: 200, height: 200, fit: "inside"})
					const meta = await s.metadata()
					newWidth = meta.width || 0
					newHeight = meta.height || 0
					if(newWidth > newHeight) {
						newHeight *= 200 / newWidth
						newWidth = 200
					} else {
						newWidth *= 200 / newHeight
						newHeight = 200
					}
					break
				case Shape.Tall:
					s.resize({width: 120})
					s.extract({ left: 0, top: 0, width: 120, height: 200 })
					s.composite([{ input: maskVert, blend: 'dest-in' }])
					newWidth = 120
					newHeight = 200
					break
				case Shape.Wide:
					s.resize({height: 120})
					s.extract({ left: 0, top: 0, width: 200, height: 120 })
					s.composite([{ input: maskHoriz, blend: 'dest-in' }])
					newWidth = 200
					newHeight = 120
					break
			}
		} else {
			const meta = await s.metadata()
			newWidth = meta.width || 0
			newHeight = meta.height || 0
		}

		if(qargs.frame > 0) {
			s.extend({
				top: Math.floor(newHeight * qargs.frame),
				bottom: Math.floor(newHeight * qargs.frame),
				left: Math.floor(newWidth * qargs.frame),
				right: Math.floor(newWidth * qargs.frame),
				background: { r: 0, g: 0, b: 0, alpha: 0}
			})
		}

		s.pipe(res)
	});
}