try {
	module.exports = require('./calendar.js');
} catch (e) {
	module.exports = require('./.calendar.js');
}
