SHELL := /bin/bash
PATH  := node_modules/.bin:${PATH}

tests   = ./test/*-test.js
version = $(shell node -p "require('./package.json').version")
name    = $(shell node -p "require('./package.json').name")

default: test cov

.PHONY: test
test:
	@jslint --color -- ./lib/*.js ${tests}
	@mocha --reporter spec

cov:
	@browserify -t coverify -t brout ${tests} | mocaccino -b -r spec | phantomic | coverify

wd:
	@browserify -t min-wd ${tests} | mocaccino -b -r spec | min-wd

html:
	@browserify -t brout ${tests} | mocaccino -b -r | consolify -t "${name} unit tests" > test/all.html

release: test cov
	git tag -a -m "Release ${version}" v${version}
	git push --follow-tags
	npm publish
