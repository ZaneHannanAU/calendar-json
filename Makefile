prepublish: clean build test

build:
	babel calendar.js --out-file .calendar.js
	babel tests/test.js --out-file tests/.test.js

test:
	node tests

clean:
	# Removes both js and JSON files, haha!
	rm .*.js tests/.*.j* -f

publish:
	npm publish
