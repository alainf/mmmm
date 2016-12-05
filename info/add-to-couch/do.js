'use strict'

// core
const fs = require('fs')

const fixJson = (filename) => new Promise((resolve, reject) => {
  fs.readFile(filename, 'utf-8', (err, b) => {
    if (err) { return reject(err) }
    const lines = b.split('\r\n')

    const a = lines
      .filter((line) => line.length)
      .map((line) => {
        const lc = line.slice(-1)[0]
        if (lc === ',' || lc === '{' || lc === '}') {
          return line
        }
        return line + ','
      })
      .join('\n')


    let zz
    try {
      eval(`zz = ${a}`)
    } catch (e) {
      e.filenane = filename
      return reject(e)
    }
    resolve(zz)
  })
})

fs.readdir('.', (err, a) => {
  Promise.all(
    a
      .filter((fn) => {
        return fn.slice(-5) === '.json'
      })
      .map((fn) => fixJson(fn))
  )
    .then((jsons) => {
      console.log('JSON:', JSON.stringify(jsons, null, '  '))
      // console.log('JSONOK')
    })
    .catch((err) => {
      console.error('ERR:', err)
    })
})
