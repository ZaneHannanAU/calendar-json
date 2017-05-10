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
	toJSON() {
		return ({
			[this.from.toISOString() + '|' + this.until.toISOString()]: this.data
		})
	}
	static fromJSON(json) {
		let entries = []
		for (let entry of oEntries(json)) {
			if (entry instanceof Entry) {
				entries.push(entry)
			} else {
				let [key, val] = entry
				if (key.split('|').length === 2) {
					entries.push(new Entry(key.split('|'), val))
				} else throw new Error('bad Object')
			}
		}
		return entries.sort((s, v) => (s.from - v.from) + (s.until - v.until))
	}
}

export default class Calendar {
	constructor(store) {
		const db = this.db = new DB(store)
		this.store = db.filename
		this.entries = Entry.fromJSON(db.getData('/'))
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
			return err;
		} finally {
			return this;
		}
	}
}
