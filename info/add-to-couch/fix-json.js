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
      eval(`zz = ${a}`) // eslint-disable-line no-eval
    } catch (e) {
      e.filename = filename
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
        } else if (r === 'niveau') {
          zz[r] = parseInt(zz[r], 10)
        } else if (r === 'importance' || r === 'pertinence') {
          zz[r] = parseFloat(zz[r])
        } else if (r === 'mots-clefs' && typeof zz[r] === 'object' && zz[r].length) {
          zz[r] = zz[r].map((x) => x.trim())
        }
      }
    }
    if (!zz._id) {
      if (typeof zz['nom-machine'] === 'string') {
        zz._id = zz['nom-machine']
      } else if (typeof zz['nom-machine'] === 'object' && zz['nom-machine'][0]) {
        zz._id = zz['nom-machine'][0]
      } else {
        return reject(new Error(`Required: either _id or nom-machine in ${filename}`))
      }
    }
    resolve({ fn: filename, json: zz })
  })
})

fs.readdir('.', (err, a) => {
  if (err) {
    console.error(err)
    return
  }
  Promise.all(
    a
      .filter((fn) => fn.slice(-5) === '.json')
      .map(fixJson)
  )
    .then((jsons) => {
      console.log('jsons.length:', jsons.length)
      return jsons
    })
    .then((jsons) => {
      jsons.forEach((j) => {
        fs.writeFile(`new/${j.fn}`, JSON.stringify(j.json, null, '  '), 'utf-8')
      })
    })
    .catch((err) => { console.error('ERR:', err) })
})
