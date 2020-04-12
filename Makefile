.PHONY: build test serve format

all: candle bundle rollup

build:
	npm run-script build

test:
	npm test

serve:
	cd dist && python3 -m http.server -b localhost

format:
	npm run-script format

bundle:
	cat \
		src/header.js \
    	src/pzpr/event.js \
    	src/puzzle/Config.js \
    	src/variety-common/Graphic.js \
    	src/variety-common/KeyInput.js \
    	src/variety-common/MouseInput.js \
    	src/variety-common/Answer.js \
    	src/variety-common/BoardExec.js \
    	src/variety-common/Encode.js \
    	src/variety-common/FileData.js \
	> src/bundle.js

rollup:
	./node_modules/.bin/rollup -c

candle:
	cp ./node_modules/pzpr-canvas/dist/candle.js ./dist/js/candle.js
