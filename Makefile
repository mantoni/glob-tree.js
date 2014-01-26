SHELL := /bin/bash
PATH  := node_modules/.bin:${PATH}

tests   = ./test/*-test.js
version = $(shell node -p "require('./package.json').version")
name    = $(shell node -p "require('./package.json').name")

default: test cov

.PHONY: test
test:
	@jslint --color lib/*.js ${tests}
	@mocha --reporter spec

cov:
	@browserify -t coverify -t brout ${tests} | mocaccino -b -r spec | phantomic | coverify

wd:
	@browserify -t min-wd ${tests} | mocaccino -b -r spec | min-wd

html:
	@browserify ${tests} | mocaccino -b | consolify -r -t "${name} unit tests" > test/all.html

release: test cov
ifeq (v${version},$(shell git tag -l v${version}))
	@echo "Version ${version} already released!"
	@exit 1
endif
	@echo "Creating tag v${version}"
	@git tag -a -m "Release ${version}" v${version}
	@git push --tags
	@echo "Publishing to npm"
	@npm publish
