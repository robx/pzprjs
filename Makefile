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
    	src/pzpr/env.js \
    	src/pzpr/event.js \
    	src/pzpr/classmgr.js \
    	src/pzpr/variety.js \
    	src/pzpr/parser.js \
    	src/pzpr/util.js \
    	src/puzzle/Puzzle.js \
    	src/puzzle/Config.js \
    	src/puzzle/Address.js \
    	src/puzzle/Piece.js \
    	src/puzzle/PieceList.js \
    	src/puzzle/Board.js \
    	src/puzzle/BoardExec.js \
    	src/puzzle/GraphBase.js \
    	src/puzzle/LineManager.js \
    	src/puzzle/AreaManager.js \
    	src/puzzle/Graphic.js \
    	src/puzzle/MouseInput.js \
    	src/puzzle/KeyInput.js \
    	src/puzzle/Encode.js \
    	src/puzzle/FileData.js \
    	src/puzzle/Answer.js \
    	src/puzzle/Operation.js \
    	src/variety-common/Graphic.js \
    	src/variety-common/KeyInput.js \
    	src/variety-common/MouseInput.js \
    	src/variety-common/Answer.js \
    	src/variety-common/BoardExec.js \
    	src/variety-common/Encode.js \
    	src/variety-common/FileData.js \
		src/footer.js \
	> src/bundle.js

	
subbundle:
	# -l tinyify \
	./node_modules/.bin/browserify \
   		--exclude=pzpr-canvas \
   		--exclude=pzpr-ui \
		--standalone=pzpr \
		--extension=mjs \
   		src/bundle.mjs \
	> dist/js/bundle.js

rollup:
	./node_modules/.bin/rollup -c


candle:
	cp ./node_modules/pzpr-canvas/dist/candle.js ./dist/js/candle.js
