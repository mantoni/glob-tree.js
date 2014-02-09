SHELL := /bin/bash
PATH  := node_modules/.bin:${PATH}

version = $(shell node -p "require('./package.json').version")

default: cov
	npm test

cov:
	@browserify -t coverify --bare ./test/*.js | mocaccino -r spec | node | coverify

release: test cov
	git tag -a -m "Release ${version}" v${version}
	git push --follow-tags
	npm publish
