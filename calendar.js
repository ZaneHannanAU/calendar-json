import DB from 'node-json-db';

const {randomBytes} = require('crypto');
let UID = (n=15) => randomBytes(n).toString('base64')

let oEntries=Object.entries?Object.entries:(o=>Object.keys(o).map(k=>[k,o[k]]))
let vodp=(d)=>new Date(d).valueOf() + 24*36e5
// Utility functions

class Entry {
	constructor([from=Date.now(),until=vodp(from)],data) {
		this.from = new Date(from)
		this.until= new Date(until)
		if (this.until < this.from)
			throw new RangeError(`until value (${this.until.valueOf()}) cannot be less than from value (${this.from.valueOf()})`)
		this.data = data
		this.key = [from, until, UID()]
	}
	get key() {return this._key}
	set key([from = Date.now(), until = vodp(from), uid = this._uid]) {
		this.from = new Date(from)
		this.until= new Date(until)

		if (this.until < this.from)
			throw new RangeError(`until value (${this.until.valueOf()}) cannot be less than from value (${this.from.valueOf()})`)

		this._uid = uid
		return this._key = [
			this.from.toISOString(), this.until.toISOString(), uid
		].join('|')
	}
	toJSON() {return {[this.key]: this.data}}
	me(v) {return this.key === v.key}
	static fromJSON(json, reviver = o=>o) {
	/*
		Reviver revives the original value, from the JSON value.
		e.g.
		    o=>{o.timestamp = new Date(o.timestamp);return o}
		*/
		let entries = []
		for (const [key, val] of oEntries(json)) {
			// json must be an Object or a key-val Array like a Map.
			if (key.split('|').length >= 2) {
				// key must be two (2) UTC dates.
				entries.push(new Entry(
					// constructor handles the keys, so we pass in two UTC strings.
					key.split('|'),
					reviver(val)
				))
			} else throw new TypeError('bad Object')
		}
		return entries.sort((s, v) => (s.from - v.from) + (s.until - v.until))
		// Sorted by comparing the from and until values by default.
	}
}

export default class Calendar {
	constructor(store, reviver = o=>o) {
		// @see Entry.fromJSON
		this.db = new DB(store, true)
		this.store = this.db.filename
		this.entries = Entry.fromJSON(this.db.getData('/'), reviver)
	}
	toJSON() {
		return this.entries.reduce(
			(acc,val) => Object.assign( acc, val.toJSON() ), {}
		)
		// Turn each value into JSON and reduce the columnative into its raw JSON form. Initially {}, or a plain object.
	}
	save() {
		this.db.push('/', this.toJSON(), true)
		this.db.save()
		return this
	}
	add([from, until], data) {
		const entry = new Entry([from, until], data)
		// @see class Entry
		try {
			this.db.push('/', entry.toJSON(), false)
			this.entries.push(entry)
		} catch (err) {
			console.error(err);
		} finally {return this}
	}
	remove(idx, amt = 1) {
		if (typeof idx === 'function')
			idx = this.entries.findIndex(idx)

		this.db.delete('/' + this.entries[idx].key);
		// Delete key from the DB & save
		this.entries.splice(idx, amt);
		// Take index from the entry and remove one value from that point.
		return this
	}
}
