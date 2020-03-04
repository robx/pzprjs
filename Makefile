.PHONY: build test serve format ui

build:
	npm run-script build

test:
	npm test

serve:
	cd dist && python3 -m http.server -b localhost

format:
	npm run-script format

ui:
	./node_modules/.bin/browserify ./src-ui/js/core.js > dist/js/ui.js
