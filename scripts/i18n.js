'use strict'

// npm
const pify = require('pify')
const glob = pify(require('glob'))

// core
const path = require('path')

glob('../locales/??.json')
  .then((x) => {
    const data = {}
    x.forEach((y) => {
      data[path.basename(y, '.json')] = require(y)
    })
    return data
  })
  .then((x) => {
    for (let r in x) {
      console.log(r, Object.keys(x[r]).length)
    }
  })
  .catch(console.error)
