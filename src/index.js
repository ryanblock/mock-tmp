let { cpSync, mkdirSync, mkdtempSync, rmSync, unlinkSync, writeFileSync } = require('fs')
let { tmpdir } = require('os')
let { join, parse, sep } = require('path')
let tmpDir

function mockTmp (files, /* options */) {
  mockTmp.reset()
  if (typeof files !== 'object' || Array.isArray(files) || !Object.keys(files).length) {
    throw ReferenceError('Specify one or more files in an object to write to tmp')
  }
  tmpDir = mkdtempSync(join(tmpdir(), 'mock-tmp-'))
  Object.entries(files).forEach(([ p, data ]) => {
    if (typeof data === 'object' && data._path && data._options) {
      const { recursive = true } = data._options
      cpSync(data._path, join(tmpDir, p), { recursive })
      return
    }
    if (typeof data !== 'string' && !(data instanceof Buffer)) {
      throw ReferenceError(`Files must be a string or buffer`)
    }
    // Normalize the destination path
    const path = join(tmpDir, p).replace(/[\\/]/g, sep)
    const { dir } = parse(path)
    mkdirSync(dir, { recursive: true })
    writeFileSync(path, data)
  })
  return tmpDir
}

/**
 * Copy files into the tmp dir
 */
mockTmp.copy = function mockTmpCopy (_path, _options = {}) {
  return { _path, _options }
}
mockTmp.load = mockTmp.copy

/**
 * Reset the tmp dir
 */
mockTmp.reset = function () {
  if (tmpDir) {
    rmSync(tmpDir, { recursive: true, force: true })
    try { unlinkSync(tmpDir) }
    catch { /* noop */ }
    tmpDir = undefined
  }
}
mockTmp.restore = mockTmp.reset

Object.defineProperty(mockTmp, 'load', { enumerable: false })
Object.defineProperty(mockTmp, 'restore', { enumerable: false })

process.on('exit', mockTmp.reset)
module.exports = mockTmp
