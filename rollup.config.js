import { terser } from 'rollup-plugin-terser';

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

export default {
	input: 'src/pzpr.js',
	output: {
		file: 'dist/js/pzpr.js',
		name: 'pzpr',
		format: 'iife',
		sourcemap: true,
		globals: {
			"pzpr-canvas": "Candle"
		}
	},
	plugins: [
		production && terser() // minify, but only in production
	]
};
