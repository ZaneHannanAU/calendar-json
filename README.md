# calendar-json
JSON calendar for Node

Usage:

```javascript
const DB = require('calendar-json');
const Calendar = DB.default || DB
// May vary in different node versions

const path = require('path');
var calendar = new Calendar(path.join(__dirname, 'cal'))
```
