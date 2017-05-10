prepublish: clean build test

build:
	babel calendar.js --out-file .calendar.js
	babel tests/test.js --out-file tests/.test.js

test:
	node tests

clean:
	rm .*.js tests/.*.js

publish:
	npm publish
