.PHONY: build test serve

build:
	npm run-script build

test:
	npm test

serve:
	cd dist && python3 -m http.server -b localhost
