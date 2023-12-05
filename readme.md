# `mock-tmp`

> A (mostly) drop-in replacement for [`mock-fs`](https://github.com/tschaub/mock-fs) using your tmp filesystem

```js
import mockTmp from 'mock-tmp'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const tmp = mockTmp({
  // Create a single file (from a string)
  'hi.txt': 'hi there!',

  // Create an empty dir
  'henlo': {},

  // Create a (nested) dir containing multiple files
  'greetings/and/salutations': {
    'hey.json': JSON.stringify({ hey: 'friend' }),
    'yo.gif': Buffer.from([ 0, 1, 2, 3, 4 ]),
  },

  // Bring in an existing file
  'sup.jpg': mockTmp.copy('/path/to/file.jpg'),

  // Bring in an existing folder recursively; optionally disable recursion
  'so-many-files': mockTmp.copy('/path/to/many-files', /* { recursive: false} */),
}) // /var/folders/.../mock-tmp-$random_string
readFileSync(join(tmp, 'hi.txt')) // 'hi there!'
readFileSync(join(tmp, 'greetings', 'and', 'salutations', 'hey.json')) // '{"hey":"friend"}'

tmp.reset()
existsSync(tmp) //false
```
