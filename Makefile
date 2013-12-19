SHELL := /bin/bash
PATH  := node_modules/.bin:${PATH}

default: test phantom browser

tests   = ./test/*-test.js
html    = test/all.html
version = $(shell node -p "require('./package.json').version")


.PHONY: test
test:
	@jslint --color lib/*.js ${tests}
	@mocha test

phantom:
	@consolify --mocha --js ${tests} | phantomic

browser:
	@echo "Consolify tests > file://`pwd`/${html}"
	@consolify --mocha -o ${html} ${tests} browser-reload

release: test phantom
ifeq (v${version},$(shell git tag -l v${version}))
	@echo "Version ${version} already released!"
	@exit 1
endif
	@echo "Creating tag v${version}"
	@git tag -a -m "Release ${version}" v${version}
	@git push --tags
	@echo "Publishing to npm"
	@npm publish
