import webpack from 'webpack';

const DEBUG   = !process.argv.includes('--release');
const VERBOSE =  process.argv.includes('--verbose');

var pkg = JSON.parse(require('fs').readFileSync('package.json'));
console.log(pkg.version);

export default {
  entry : {
    sudoku    : './src/variety/sudoku.js',
    paintarea : './src/variety/paintarea.js',
  },
  output : {
    path : './dist-test',
    publicPath : '.',
    libraryTarget : 'commonjs2',
    filename : 'variety/[name].js',
    chunkFilename : '[name].js',
  },
  target : 'node',
  plugins : [
    new webpack.DefinePlugin({
      'pkg.version' : JSON.stringify(pkg.version),
    }),
    new webpack.optimize.CommonsChunkPlugin('test','test.js'),
    ...(DEBUG ? [] : [
    new webpack.optimize.UglifyJsPlugin({ compress: { screw_ie8: true, warnings: VERBOSE } }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.AggressiveMergingPlugin(),
    ]),
  ],
  resolve : {
    extensions : ['', '.js'],
  },
  module : {
    loaders : [
      { test:/\.js$/, exclude:/node_modules/, loader:'babel-loader'},
    ],
  },
};
