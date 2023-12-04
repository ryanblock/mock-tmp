let { cpSync, mkdirSync, mkdtempSync, rmSync, unlinkSync, writeFileSync } = require('fs')
let { tmpdir } = require('os')
let { join, parse, sep } = require('path')
let tmpDir

function tmpFs (files, /* options */) {
  tmpFs.reset()
  if (typeof files !== 'object' || Array.isArray(files) || !Object.keys(files).length) {
    throw ReferenceError('Specify one or more files in an object to write to tmp')
  }
  tmpDir = mkdtempSync(join(tmpdir(), 'tmpfs-'))
  Object.entries(files).forEach(([ p, data ]) => {
    if (typeof data === 'object' && data.path && data.options) {
      const { recursive = true } = data.options
      cpSync(data.path, join(tmpDir, p), { recursive })
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
tmpFs.copy = function tmpFsCopy (path, options = {}) {
  return { path, options }
}
tmpFs.load = tmpFs.copy

/**
 * Reset the tmp dir
 */
tmpFs.reset = function () {
  if (tmpDir) {
    rmSync(tmpDir, { recursive: true, force: true })
    try { unlinkSync(tmpDir) }
    catch { /* noop */ }
    tmpDir = undefined
  }
}
tmpFs.restore = tmpFs.reset

Object.defineProperty(tmpFs, 'load', { enumerable: false })
Object.defineProperty(tmpFs, 'restore', { enumerable: false })

process.on('exit', tmpFs.reset)
module.exports = tmpFs
