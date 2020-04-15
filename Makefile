.PHONY: build test serve format

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
