import DB from 'node-json-db';
let oEntries = Object.entries ? Object.entries : (
	o => Object.keys(o).map(k=>[k,o[k]])
)

export class Entry {
	constructor([from = new Date(), until = (from + 24*36e5)], data) {
		this.from = new Date(from)
		this.until= new Date(until)
		this.data = data
	}
	get key() {
		return this.from.toISOString() + '|' + this.until.toISOString()
	}
	toJSON() {
		return {[this.key]: this.data}
	}
	me(v, i) {
		return this.key === v.key
	}
	static fromJSON(json, reviver) {
		let entries = []
		for (let [key, val] of oEntries(json)) {
			if (key.split('|').length === 2) {
				entries.push(new Entry(
					key.split('|'),
					reviver(val)
				))
			} else throw new Error('bad Object')
		}
		return entries.sort((s, v) => (s.from - v.from) + (s.until - v.until))
	}
}

export default class Calendar {
	constructor(store, reviver = o=>o) {
		this.db = new DB(store, true)
		this.store = this.db.filename
		this.entries = Entry.fromJSON(this.db.getData('/'), reviver)
	}
	toJSON() {
		return this.entries
	}
	add([from, until], data) {
		const entry = new Entry([from, until], data)
		try {
			this.db.push('/', entry.toJSON(), false)
			this.entries.push(entry)
		} catch (err) {
			console.error(err);
		} finally {
			return this;
		}
	}
	remove(idx) {
		if (typeof idx === 'function') {
			idx = this.entries.findIndex(found)
		}
		delete this.entries[idx]
		this.db.delete('/' + this.entries[idx].key)
		this.db.save()
		return this
	}
}
module.exports = Calendar;
