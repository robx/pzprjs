.PHONY: build test serve format

all: candle rollup

build:
	npm run-script build

test:
	npm test

serve:
	cd dist && python3 -m http.server -b localhost

format:
	npm run-script format

rollup:
	./node_modules/.bin/rollup -c

candle:
	cp ./node_modules/pzpr-canvas/dist/candle.js ./dist/js/candle.js
