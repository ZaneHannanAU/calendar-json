# calendar-json
JSON calendar for Node

Requires access to the `crypto` library for its' `randomBytes` function.

Current plans are to allow for a custom UID function provided by the user to allow generation of UIDs instead.

Usage:

```javascript
const path = require('path');
const Calendar = require('calendar-json');
const calendar = new Calendar(path.join(__dirname, 'cal'))
```

ES7:

```javascript
import path from 'path'
import Calendar from 'calendar-json'
let calendar = new Calendar(path.join(__dirname, 'cal'))
```

Both of the above are functionally the same, with the exception of node and/or V8 versions.

See [`tests/test.js`](https://github.com/ZaneHannanAU/calendar-json/blob/master/tests/test.js) for more tests.
