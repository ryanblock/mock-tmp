# `mock-tmp`

> A (mostly) drop-in replacement for [`mock-fs`](https://github.com/tschaub/mock-fs) using your tmp filesystem to quickly mock files and folders

Keeping and maintaining mocks for testing can be a pain; `mock-tmp` can help make it easier by synchronously setting up and tearing down files and folders specified by a single, simple object.

Inspired by the excellent [`mock-fs`](https://github.com/tschaub/mock-fs), `mock-tmp` works solely within your system's native temp filesystem, and uses Node.js's built-in `fs` methods (instead of patching Node.js `fs`).


## Example

```js
import mock from 'mock-tmp'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

// tmpDir is the path to a temporary directory
const tmpDir = mockTmp({
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
  'sup.jpg': mock.copy('/path/to/file.jpg'),

  // Bring in an existing folder recursively; optionally disable recursion
  'so-many-files': mockTmp.copy('/path/to/many-files', /* { recursive: false } */),
}) // /var/folders/.../mock-tmp-$random_string
readFileSync(join(tmpDir, 'hi.txt')) // 'hi there!'
readFileSync(join(tmpDir, 'greetings', 'and', 'salutations', 'hey.json')) // '{"hey":"friend"}'

mockTmp.reset()
existsSync(tmpDir) //false
```


## Install

```sh
npm i mock-tmp -D
```


## Usage

### `mock(resources)`

`mock()` synchronously sets up the mock temp directory based on the object of resources it is passed.

- Each property name represents the relative path to the generated resource
- Each property value is written as the content for the generated resource
- A nested object is interpreted as a folder with its own files
  - Note: folder nesting is only supported to one level. To nest deeper folders, create a corresponding top-level property.

Calling this method returns the tmp directory created containing all generated resources.

When called, if an existing temp directory is found from a previous instantiation, `mock-tmp` will destroy it. Additionally, `mock-tmp` will also register a handler to destroy its temp directory upon process exit.


### `mock.copy(path, options)`

> Alias: `mock.load(path, options)`

`mock.copy()` synchronously copies a file or folder to the corresponding property name; it accepts a source path and optional `options` object.

The `options` object accepts the following parameters

- **`recursive` (boolean) [default=true]**
  - Disable recursive directory copying (if copying a folder)


### `mock.reset()`

> Alias: `mock.restore()`

`mock.reset()` synchronously destroys the mock temp directory.

Note: calling `mock()` cleans up after itself, and automatically calls `mock.reset()` if it has not been manually called. Still, it is good hygiene to explicitly call `mock.reset()`, especially so others may more easily read your tests.


## Coming from `mock-fs`

I love and have long relied on `mock-fs` – it's a simple, elegant library that has made implementing test mocks so easy. Unfortunately, Node.js 20.x introduced a number of breaking changes to `fs` methods, which broke a lot of core `mock-fs` functionality, necessitating the creation of `mock-tmp`.

`mock-tmp` was authored to be a future-proof, (mostly) drop-in replacement for `mock-fs`, including supporting `mock-fs`'s `mock.load()` and `mock.restore()` methods.

However, at this time some `mock-fs` features are not (yet) supported, including specifying file and folder properties (`mode`, `uid`, `gid`, `atime`, `ctime`, `mtime`, `birthtime`). PRs are welcome if folks need such functionality for their projects!
