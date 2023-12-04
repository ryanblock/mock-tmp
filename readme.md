# `mock-tmp`

> A (mostly) drop-in replacement for [`mock-fs`](https://github.com/tschaub/mock-fs) using your tmp filesystem

```js
import mockTmp from 'mock-tmp'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const tmp = mockTmp({
  'hi.txt': 'hi there!'
}) // /var/folders/.../mock-tmp-$random_string
readFileSync(join(tmp, 'hi.txt')) // 'hi there!'

tmp.reset()
existsSync(tmp) //false
```
