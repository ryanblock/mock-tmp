# `tmp-fs`

> A (mostly) drop-in replacement for [`mock-fs`](https://github.com/tschaub/mock-fs) using your tmp filesystem

```js
import tmpFs from 'tmp-fs'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const tmp = tmpFs({
  'hi.txt': 'hi there!'
}) // /var/folders/.../tmpfs-$random_string
readFileSync(join(tmp, 'hi.txt')) // 'hi there!'

tmp.reset()
existsSync(tmp) //false
```
