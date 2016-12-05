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
        if (lc === ',' || lc === '{' || lc === '}') { return line }
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
    let r

    for (r in zz) {
      if (zz[r] === 'true') {
        zz[r] = true
      } else if (zz[r] === 'false') {
        zz[r] = false
      } else {
        if (r === 'identifiant-drupal') {
          if (typeof zz[r] === 'object') {
            zz[r] = zz[r][0]
          }
          zz[r] = parseInt(zz[r], 10)
        } else if (r === 'niveau' || r === 'importance') {
          zz[r] = parseInt(zz[r], 10)
        }
      }
    }
    // resolve(zz)
    resolve({
      fn: filename,
      json: JSON.stringify(zz, null, '  ')
    })
  })
})

fs.readdir('.', (err, a) => {
  Promise.all(
    a
      .filter((fn) => fn.slice(-5) === '.json')
      .map((fn) => fixJson(fn))
  )
    .then((jsons) => {
      jsons.forEach((j) => {
        // console.log('JSON:', j.fn, j.json)
        fs.writeFile(`new/${j.fn}`, j.json, 'utf-8')
      })
      // console.log('JSONS:', jsons)
      // console.log('JSONS:', jsons.join('\n'))
      /*
      jsons.forEach((j) => {
        console.log('JSON:', JSON.stringify(j, null, '  '))
      })
      */
    })
    .catch((err) => {
      console.error('ERR:', err)
    })
})
