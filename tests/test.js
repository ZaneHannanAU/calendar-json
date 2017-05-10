import Calendar from '../';
import path from 'path';
import {exec} from 'child_process';

console.dir(Calendar, {colors: true, depth: Infinity})
var calendar = new Calendar(path.join(__dirname, '.caldb.json'), o=>{
	o.timestamp = new Date(o.timestamp)
	return o
})

exec('npm whoami', (err, user) => {
	if (err) throw err
	else user = user.replace(/\r?\n/g, '')

	console.log('Found user %s, adding...', user);
	console.dir(
		calendar.add([
			Date.now() + 3600 * Math.random(),
			Date.now() + 24*36e5 * Math.random()
		], {
			user,
			message: `I'm using calendar-json!`,
			timestamp: new Date()
		}).add([
			Date.now() + 2*3600 * Math.random(),
			Date.now() + 2*24*36e5 * Math.random()
		], {
			user: 'zanehannanau',
			message: `calendar-json is chainable too!`,
			timestamp: new Date(Date.now() + 100*Math.random())
		}).add([undefined, undefined], {
			user: 'zanehannanau',
			message: `It doesn't work all that well with much else though.`,
			timestamp: new Date(Date.now() + 300*Math.random())
		}),
		{colors:true,depth:Infinity}
	)
	console.log('Stringify:\r\n%s', JSON.stringify(calendar, null, 2));

	console.log('And deleting (very quick)');
	while (calendar.entries.length) {
		calendar.remove(0)
		console.dir(calendar.entries,{colors:true,depth:Infinity})
	}
})
