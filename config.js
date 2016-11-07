'use strict'

const Confidence = require('confidence')

const criteria = {
  env: process.env.NODE_ENV
}

const config = {
  $meta: 'This file configures the plot device.',
  projectName: 'mm-phd',
  cache: {
    web: {
      $filter: 'env',
      prod: true,
      $default: false
    }
  },
  port: {
    web: {
      $filter: 'env',
      test: 9090,
      $default: 8090
    }
  }
}

const store = new Confidence.Store(config)

exports.get = function (key) {
  return store.get(key, criteria)
}

exports.meta = function (key) {
  return store.meta(key, criteria)
}
