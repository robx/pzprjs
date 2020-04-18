.PHONY: release build test serve format lint rollup candle

release: candle rollup build

build:
	npm run-script build

test:
	npm test

serve:
	cd dist && python3 -m http.server -b localhost

serve-all:
	cd dist && python3 -m http.server

format:
	npm run-script format

lint:
	npm run-script lint

new: candle rollup

rollup:
	npx rollup -c

candle:
	mkdir -p ./dist/js/
	cp ./node_modules/pzpr-canvas/dist/candle.js ./dist/js/candle.js
