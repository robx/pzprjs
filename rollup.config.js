// import resolve from '@rollup/plugin-node-resolve';
// import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

export default {
	input: 'src/pzpr.js',
	output: {
		file: 'dist/js/bundle.js',
		name: 'pzpr',
		format: 'iife',
		sourcemap: true,
		globals: {
			"pzpr-canvas": "Candle"
		}
	},
	plugins: [
		// resolve(), // use node_modules
		// commonjs(), // converts node modules to ES modules
		production && terser() // minify, but only in production
	]
};
