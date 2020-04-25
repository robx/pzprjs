.PHONY: default build test serve serve-all format check-format npm-install lint candle bundle rollup githash

BUNDLEFILES=./src/header.js \
			./src/pzpr/env.js \
			./src/pzpr/event.js \
			./src/pzpr/classmgr.js \
			./src/pzpr/variety.js \
			./src/pzpr/parser.js \
			./src/pzpr/metadata.js \
			./src/pzpr/util.js \
			./src/puzzle/Puzzle.js \
			./src/puzzle/Config.js \
			./src/puzzle/Address.js \
			./src/puzzle/Piece.js \
			./src/puzzle/PieceList.js \
			./src/puzzle/Board.js \
			./src/puzzle/BoardExec.js \
			./src/puzzle/GraphBase.js \
			./src/puzzle/LineManager.js \
			./src/puzzle/AreaManager.js \
			./src/puzzle/Graphic.js \
			./src/puzzle/MouseInput.js \
			./src/puzzle/KeyInput.js \
			./src/puzzle/Encode.js \
			./src/puzzle/FileData.js \
			./src/puzzle/Answer.js \
			./src/puzzle/Operation.js \
			./src/variety-common/Graphic.js \
			./src/variety-common/KeyInput.js \
			./src/variety-common/MouseInput.js \
			./src/variety-common/Answer.js \
			./src/variety-common/BoardExec.js \
			./src/variety-common/Encode.js \
			./src/variety-common/FileData.js

default: lint test

build: candle rollup githash
	npm run-script build

test: bundle
	npm test

serve:
	cd dist && python3 -m http.server -b localhost

serve-all:
	cd dist && python3 -m http.server

format:
	npx prettier --write "{src,src-ui,test}/**/*.{js,css}"

check-format:
	npx prettier --check "{src,src-ui,test}/**/*.{js,css}"

npm-install:
	npm install

lint:
	npx eslint --quiet src src-ui test sample

candle:
	mkdir -p ./dist/js/
	cp ./node_modules/pzpr-canvas/dist/candle.js ./dist/js/candle.js

bundle:
	mkdir -p ./dist/js/
	cat ${BUNDLEFILES} > "./dist/js/pzpr.concat.js"

rollup: bundle
	mkdir -p ./dist/js/
	npx rollup -c ./rollup.config.js

HASH=$(shell git rev-parse --short HEAD)
githash:
	sed -i s'/<%= git.hash %>/${HASH}/g' ./dist/js/pzpr.js
