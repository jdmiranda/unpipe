/*!
 * unpipe benchmark
 * Comprehensive benchmark for pipe/unpipe operations
 */

'use strict'

var Stream = require('stream').Stream
var unpipe = require('./index.js')

/**
 * Benchmark configuration
 */
var ITERATIONS = 1000000
var WARMUP_ITERATIONS = 10000

/**
 * Create a readable stream
 */
function createReadableStream () {
  var stream = new Stream()
  stream.readable = true
  return stream
}

/**
 * Create a writable stream
 */
function createWritableStream () {
  var stream = new Stream()
  stream.writable = true
  return stream
}

/**
 * Run a benchmark
 */
function benchmark (name, fn) {
  // Warmup
  for (var i = 0; i < WARMUP_ITERATIONS; i++) {
    fn()
  }

  // Measure
  var start = process.hrtime()
  for (var j = 0; j < ITERATIONS; j++) {
    fn()
  }
  var diff = process.hrtime(start)

  var nanoseconds = diff[0] * 1e9 + diff[1]
  var seconds = nanoseconds / 1e9
  var opsPerSec = ITERATIONS / seconds

  console.log('%s: %s ops/sec', name, opsPerSec.toLocaleString('en-US', { maximumFractionDigits: 0 }))
}

/**
 * Benchmark: unpipe stream with no pipes
 */
function benchmarkUnpipeNoPipes () {
  var stream = createReadableStream()
  return function () {
    unpipe(stream)
  }
}

/**
 * Benchmark: unpipe stream with single pipe
 */
function benchmarkUnpipeSinglePipe () {
  var source = createReadableStream()
  var dest = createWritableStream()

  return function () {
    // Setup pipe
    if (typeof source.pipe === 'function') {
      source.pipe(dest)
    }
    // Unpipe
    unpipe(source)
  }
}

/**
 * Benchmark: unpipe stream with multiple pipes
 */
function benchmarkUnpipeMultiplePipes () {
  var source = createReadableStream()
  var dest1 = createWritableStream()
  var dest2 = createWritableStream()
  var dest3 = createWritableStream()

  return function () {
    // Setup pipes
    if (typeof source.pipe === 'function') {
      source.pipe(dest1)
      source.pipe(dest2)
      source.pipe(dest3)
    }
    // Unpipe
    unpipe(source)
  }
}

/**
 * Benchmark: unpipe with native unpipe method
 */
function benchmarkNativeUnpipe () {
  var source = createReadableStream()
  var dest = createWritableStream()

  // Add native unpipe method
  source.unpipe = function () {
    // No-op for benchmark
  }

  return function () {
    unpipe(source)
  }
}

/**
 * Benchmark: pipe operation (for comparison)
 */
function benchmarkPipe () {
  return function () {
    var source = createReadableStream()
    var dest = createWritableStream()

    if (typeof source.pipe === 'function') {
      source.pipe(dest)
    }
  }
}

/**
 * Run all benchmarks
 */
console.log('unpipe benchmarks')
console.log('=================')
console.log('Iterations: %s', ITERATIONS.toLocaleString('en-US'))
console.log('')

benchmark('unpipe (no pipes)', benchmarkUnpipeNoPipes())
benchmark('unpipe (single pipe)', benchmarkUnpipeSinglePipe())
benchmark('unpipe (multiple pipes)', benchmarkUnpipeMultiplePipes())
benchmark('unpipe (native unpipe)', benchmarkNativeUnpipe())
benchmark('pipe (for comparison)', benchmarkPipe())

console.log('')
console.log('Done!')
