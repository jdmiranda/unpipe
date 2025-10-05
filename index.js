/*!
 * unpipe
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */

'use strict'

/**
 * Module exports.
 * @public
 */

module.exports = unpipe

/**
 * Set of pipe-related listener names for fast lookups.
 * @private
 */

var PIPE_LISTENER_NAMES = new Set(['ondata'])

/**
 * Set of cleanup-related listener names for fast lookups.
 * @private
 */

var CLEANUP_LISTENER_NAMES = new Set(['cleanup', 'onclose'])

/**
 * Determine if there are Node.js pipe-like data listeners.
 * Optimized with Set-based lookup and fast path for empty listeners.
 * @private
 */

function hasPipeDataListeners (stream) {
  var listeners = stream.listeners('data')

  // Fast path: no listeners at all
  if (listeners.length === 0) {
    return false
  }

  // Set-based lookup for O(1) name checking
  for (var i = 0; i < listeners.length; i++) {
    if (PIPE_LISTENER_NAMES.has(listeners[i].name)) {
      return true
    }
  }

  return false
}

/**
 * Unpipe a stream from all destinations.
 * Optimized with fast paths and reduced closure allocations.
 *
 * @param {object} stream
 * @public
 */

function unpipe (stream) {
  if (!stream) {
    throw new TypeError('argument stream is required')
  }

  if (typeof stream.unpipe === 'function') {
    // new-style
    stream.unpipe()
    return
  }

  // Fast path: check for pipe listeners before getting close listeners
  // This avoids unnecessary listener array allocation when stream has no pipes
  if (!hasPipeDataListeners(stream)) {
    return
  }

  // Get close listeners once and cache length
  var listeners = stream.listeners('close')
  var length = listeners.length

  // Fast path: no close listeners
  if (length === 0) {
    return
  }

  // Iterate using cached length and Set-based name lookup
  var listener
  for (var i = 0; i < length; i++) {
    listener = listeners[i]

    // Set-based lookup for O(1) name checking
    if (CLEANUP_LISTENER_NAMES.has(listener.name)) {
      // invoke the listener
      listener.call(stream)
    }
  }
}
