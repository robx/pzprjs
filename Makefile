.PHONY: default build test serve serve-all format check-format lint bundle rollup git-hash clean

default: build

clean:
	rm -rf ./dist/
	rm -f git.json

build: rollup git-hash
	npx grunt build

git-hash:
	./git-hash.sh

bundle: git-hash
	npx grunt concat:pzpr

rollup: bundle
	mkdir -p ./dist/js/
	cp ./node_modules/pzpr-canvas/dist/candle.js ./dist/js/candle.js
	npx rollup -c ./rollup.config.js

test: bundle
	npx grunt build:variety
	npx mocha -r esm -r pzpr-canvas -r source-map-support/register -R progress --recursive test

lint:
	npx eslint --quiet src src-ui test sample

serve:
	cd dist && python3 -m http.server -b localhost

serve-all:
	cd dist && python3 -m http.server

format:
	npx prettier --write "{src,src-ui,test}/**/*.{js,json,css}"

check-format:
	npx prettier --check "{src,src-ui,test}/**/*.{js,json,css}"
