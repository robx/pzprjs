.PHONY: build test serve format browserify ui pzpr

build:
	npm run-script build

test:
	npm test

serve:
	cd dist && python3 -m http.server -b localhost

format:
	npm run-script format

ui:
	./node_modules/.bin/browserify ./src-ui/js/core.js --plugin tinyify > dist/js/ui.js

pzpr:
	./node_modules/.bin/browserify --exclude canvas ./src/pzpr.js --plugin tinyify > dist/js/pz.js
