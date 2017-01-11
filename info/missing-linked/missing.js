'use strict'

const data = require('./allsubs2.json').rows

console.log(data.length)

const missing = data.filter((row) => !row.doc)

console.log(missing.length)

const keys = missing.map((row) => row.key)
// console.log(keys)

const unique = (s) => {
  const ret = {}
  s.forEach((r) => { ret[r] = true })
  return Object.keys(ret)
}


const uniques = unique(keys)

console.log(uniques.length)
console.log(uniques)
