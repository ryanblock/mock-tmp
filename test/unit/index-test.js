const { existsSync, readdirSync, readFileSync } = require('fs')
const { join, sep } = require('path')
const test = require('tape')
const mockTmp = require('../../')

const file1 = 'hello.txt'
const file2 = 'hi.txt'
const str = 'hello'
const buf = Buffer.from('hi there')

const get = (...path) => readFileSync(join(...path)).toString()
const newline = process.platform === 'win32' ? '\r\n' : '\n'
const normalizePath = path => path.replace(/[\\/]/g, sep)

test('Set up env', t => {
  t.plan(1)
  t.ok(mockTmp, 'mockTmp is present')
})

test('Basic functionality', t => {
  t.plan(5)
  const dir = mockTmp({
    [file1]: str,
    [file2]: buf,
  })
  t.ok(existsSync(dir), `tmp dir created: ${dir}`)

  const files = readdirSync(dir).sort()
  t.deepEqual(files, [ file1, file2 ], 'File written to tmp dir')

  t.equal(get(dir, files[0]), str, 'Correct file written from string')
  t.equal(get(dir, files[1]), buf.toString(), 'Correct file written from buffer')

  mockTmp.reset()
  t.notOk(existsSync(dir), `tmp dir destroyed`)
})

test('Nested paths', t => {
  t.plan(3)
  const nestedFileNix = 'foo/bar/baz.txt'
  const nestedFileWin = 'fiz\\buz\\biz.txt'
  const dir = mockTmp({
    [nestedFileNix]: str,
    [nestedFileWin]: str,
  })
  t.equal(get(dir, normalizePath(nestedFileNix)), str, 'Correct file written from string')
  t.equal(get(dir, normalizePath(nestedFileWin)), str, 'Correct file written from string')

  mockTmp.reset()
  t.notOk(existsSync(dir), `tmp dir destroyed`)
})

test('Create folders + contents', t => {
  t.plan(8)

  const nestedDirNix = 'foo/bar'
  const nestedDirWin = 'fiz\\buz'
  let checking, dir, files

  // Empty dirs
  dir = mockTmp({
    [nestedDirNix]: {},
    [nestedDirWin]: {},
  })

  checking = join(dir, normalizePath(nestedDirNix))
  t.ok(existsSync(checking), `tmp dir created: ${checking}`)
  files = readdirSync(checking)
  t.equal(files.length, 0, `tmp dir is empty`)

  checking = join(dir, normalizePath(nestedDirWin))
  t.ok(existsSync(checking), `tmp dir created: ${checking}`)
  files = readdirSync(checking)
  t.equal(files.length, 0, `tmp dir is empty`)

  mockTmp.reset()

  // Dirs with files
  dir = mockTmp({
    [nestedDirNix]: {
      [file1]: str,
      [file2]: buf,
    },
    [nestedDirWin]: {
      [file1]: str,
      [file2]: buf,
    },
  })

  checking = join(dir, normalizePath(nestedDirNix))
  t.ok(existsSync(checking), `tmp dir created: ${checking}`)
  files = readdirSync(checking).sort()
  t.deepEqual(files, [ file1, file2 ], 'Files written to nested tmp dir')

  checking = join(dir, normalizePath(nestedDirWin))
  t.ok(existsSync(checking), `tmp dir created: ${checking}`)
  files = readdirSync(checking).sort()
  t.deepEqual(files, [ file1, file2 ], 'Files written to nested tmp dir')

  mockTmp.reset()
})

test('copy()', t => {
  t.plan(3)
  const dir = mockTmp({
    foo: mockTmp.copy(join(__dirname, '..', 'dummy')),
    // `load` alias
    456: mockTmp.load(join(__dirname, '..', 'dummy', '123.txt')),
  })
  t.equal(get(dir, 'foo', 'abc', 'def.txt'), 'abcdef' + newline, 'Correct file found in recursively copied directory structure')
  t.equal(get(dir, 'foo', '123.txt'), '123' + newline, 'Correct file found in recursively copied directory structure')
  t.equal(get(dir, '456'), '123' + newline, 'Correct file found in recursively copied directory structure')
})

test('reset()', t => {
  t.plan(8)
  let dir

  // Self reset
  let old = mockTmp({ [file1]: str })
  t.ok(existsSync(old), `tmp dir created: ${old}`)
  dir = mockTmp({ [file1]: str })
  t.notOk(existsSync(old), `Old tmp dir is destroyed`)
  t.ok(existsSync(dir), `New tmp dir created: ${dir}`)

  // Can be run idempotently
  dir = mockTmp({ [file1]: str })
  t.ok(existsSync(dir), `tmp dir created: ${dir}`)
  mockTmp.reset()
  t.notOk(existsSync(dir), `tmp dir destroyed`)
  mockTmp.reset()
  t.notOk(existsSync(dir), `tmp dir is still destroyed`)

  // `restore` alias
  dir = mockTmp({ [file1]: str })
  t.ok(existsSync(dir), `tmp dir created: ${dir}`)
  mockTmp.restore()
  t.notOk(existsSync(dir), `tmp dir destroyed`)
})

test('Errors', t => {
  const filesError = /Specify one or more files/
  const typeError = /string or buffer/

  try {
    mockTmp('hi')
    t.fail('Expected error')
  }
  catch (err) {
    t.match(err.message, filesError, 'Got correct files error')
  }

  try {
    mockTmp([ 'hi', 'there' ])
    t.fail('Expected error')
  }
  catch (err) {
    t.match(err.message, filesError, 'Got correct files error')
  }

  try {
    mockTmp({})
    t.fail('Expected error')
  }
  catch (err) {
    t.match(err.message, filesError, 'Got correct files error')
  }

  try {
    mockTmp({ [file1]: 12345 })
    t.fail('Expected error')
  }
  catch (err) {
    t.match(err.message, typeError, 'Got correct type error')
  }

  try {
    mockTmp({ [file1]: [ 'yo' ] })
    t.fail('Expected error')
  }
  catch (err) {
    t.match(err.message, typeError, 'Got correct type error')
  }



  t.end()
})
