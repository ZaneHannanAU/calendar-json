'use strict';

var _ = require('../');

var _2 = _interopRequireDefault(_);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _child_process = require('child_process');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

console.dir(_2.default, { colors: true, depth: Infinity });
var calendar = new _2.default(_path2.default.join(__dirname, '.caldb.json'), o => {
	o.timestamp = new Date(o.timestamp);
	return o;
});

(0, _child_process.exec)('npm whoami', (err, user) => {
	if (err) throw err;else user = user.replace(/\r?\n/g, '');

	console.log('Found user %s, adding...', user);
	console.dir(calendar.add([Date.now() + 3600, Date.now() + 24 * 36e5], {
		user,
		message: `I'm using calendar-json!`,
		timestamp: new Date()
	}).add([Date.now() + 2 * 3600, Date.now() + 365 * 24 * 36e5], {
		user: 'zanehannanau',
		message: `calendar-json is chainable too!`,
		timestamp: new Date(Date.now() + 100)
	}).add([], {
		user: 'zanehannanau',
		message: `It doesn't work all that well with much else though.`,
		timestamp: new Date(Date.now() + 300)
	}), { colors: true, depth: Infinity });
	console.log('Stringify:\r\n%s', JSON.stringify(calendar, null, 2));

	console.log('And remove (very quick, multi-deletes should be followed by a save command)');

	while (calendar.entries.some(e => e.data.user === 'zanehannanau')) calendar.remove(e => e.data.user === 'zanehannanau');

	console.dir(calendar.save(), { colors: true, depth: Infinity });

	console.log('Leaving one for the next person:\r\n%j', calendar.add([Date.now(), Date.now() + 1], {
		user,
		message: `${ user } left this for you`,
		timestamp: new Date()
	}));
	console.dir(calendar.entries[0], { colors: true, depth: Infinity });
});
