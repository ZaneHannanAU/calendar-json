'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _nodeJsonDb = require('node-json-db');

var _nodeJsonDb2 = _interopRequireDefault(_nodeJsonDb);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _require = require('crypto');

const randomBytes = _require.randomBytes;

let UID = (n = 15) => randomBytes(n).toString('base64');

let oEntries = Object.entries ? Object.entries : o => Object.keys(o).map(k => [k, o[k]]);
let vodp = d => new Date(d).valueOf() + 24 * 36e5;
// Utility functions

class Entry {
	constructor([from = Date.now(), until = vodp(from)], data) {
		this.from = new Date(from);
		this.until = new Date(until);
		if (this.until < this.from) throw new RangeError(`until value (${ this.until.valueOf() }) cannot be less than from value (${ this.from.valueOf() })`);
		this.data = data;
		this.key = [from, until, UID()];
	}
	get key() {
		return this._key;
	}
	set key([from = Date.now(), until = vodp(from), uid = this._uid]) {
		this.from = new Date(from);
		this.until = new Date(until);

		if (this.until < this.from) throw new RangeError(`until value (${ this.until.valueOf() }) cannot be less than from value (${ this.from.valueOf() })`);

		this._uid = uid;
		return this._key = [this.from.toISOString(), this.until.toISOString(), uid].join('|');
	}
	toJSON() {
		return { [this.key]: this.data };
	}
	me(v) {
		return this.key === v.key;
	}
	static fromJSON(json, reviver = o => o) {
		/*
  	Reviver revives the original value, from the JSON value.
  	e.g.
  	    o=>{o.timestamp = new Date(o.timestamp);return o}
  	*/
		let entries = [];
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = oEntries(json)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				const _ref = _step.value;

				var _ref2 = _slicedToArray(_ref, 2);

				const key = _ref2[0];
				const val = _ref2[1];

				// json must be an Object or a key-val Array like a Map.
				if (key.split('|').length >= 2) {
					// key must be two (2) UTC dates.
					entries.push(new Entry(
					// constructor handles the keys, so we pass in two UTC strings.
					key.split('|'), reviver(val)));
				} else throw new TypeError('bad Object');
			}
		} catch (err) {
			_didIteratorError = true;
			_iteratorError = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion && _iterator.return) {
					_iterator.return();
				}
			} finally {
				if (_didIteratorError) {
					throw _iteratorError;
				}
			}
		}

		return entries.sort((s, v) => s.from - v.from + (s.until - v.until));
		// Sorted by comparing the from and until values by default.
	}
}

class Calendar {
	constructor(store, reviver = o => o) {
		// @see Entry.fromJSON
		this.db = new _nodeJsonDb2.default(store, true);
		this.store = this.db.filename;
		this.entries = Entry.fromJSON(this.db.getData('/'), reviver);
	}
	toJSON() {
		return this.entries.reduce((acc, val) => Object.assign(acc, val.toJSON()), {});
		// Turn each value into JSON and reduce the columnative into its raw JSON form. Initially {}, or a plain object.
	}
	save() {
		this.db.push('/', this.toJSON(), true);
		this.db.save();
		return this;
	}
	add([from, until], data) {
		const entry = new Entry([from, until], data);
		// @see class Entry
		try {
			this.db.push('/', entry.toJSON(), false);
			this.entries.push(entry);
		} catch (err) {
			console.error(err);
		} finally {
			return this;
		}
	}
	remove(idx, amt = 1) {
		if (typeof idx === 'function') idx = this.entries.findIndex(idx);

		this.db.delete('/' + this.entries[idx].key);
		// Delete key from the DB & save
		this.entries.splice(idx, amt);
		// Take index from the entry and remove one value from that point.
		return this;
	}
}
exports.default = Calendar;
