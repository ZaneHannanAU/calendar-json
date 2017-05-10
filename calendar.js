import DB from 'node-json-db';

export class Entry {
	constructor([from, until], data) {
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
		for (let entry of Object.entries(json)) {
			if (entry instanceof Entry) {
				entries.push(entry)
			} else {
				let [key, value] = entry
				if (key.split('|').length === 2) {
					entries.push(new Entry(key.split('|'), val))
				} else throw new Error('bad Object')
			}
		}
		return entries
	}
}

export default class Calendar {
	constructor(store) {
		const db = this.db = new DB(store)
		this.store = store
		this.entries = Entry.fromJSON(db.getData('/'))
	}
	toJSON() {
		return this.entries
	}
	add([from, until], data) {
		const entry = new Entry([from, until], data)
		try {
			this.db.push('/', entry)
			this.all.push(entry)
		} catch (err) {
			return err;
		} finally {
			return entry;
		}
	}
}
