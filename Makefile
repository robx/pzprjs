.PHONY: default build test serve serve-all format check-format npm-install lint candle bundle rollup githash

default: build

build: candle rollup githash
	npm run-script build

test: bundle
	npm test

serve:
	cd dist && python3 -m http.server -b localhost

serve-all:
	cd dist && python3 -m http.server

format:
	npx prettier --write "{src,src-ui,test}/**/*.{js,json,css}"

check-format:
	npx prettier --check "{src,src-ui,test}/**/*.{js,json,css}"

npm-install:
	npm install

lint:
	npx eslint --quiet src src-ui test sample

candle:
	mkdir -p ./dist/js/
	cp ./node_modules/pzpr-canvas/dist/candle.js ./dist/js/candle.js

bundle:
	npx grunt concat:pzpr

rollup: bundle
	mkdir -p ./dist/js/
	npx rollup -c ./rollup.config.js

HASH=$(shell git rev-parse --short HEAD)
githash:
	sed -i '' s'/<%= git.hash %>/${HASH}/g' ./dist/js/pzpr.js
