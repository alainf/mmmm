'use strict'

// core
const fs = require('fs')

const fixJson = (filename) => new Promise((resolve, reject) => {
  console.log('FN:', filename)
  fs.readFile(filename, 'utf-8', (err, b) => {
    if (err) { return reject(err) }
    const lines = b.split('\r\n')
    console.log(lines.length)

    const a = lines
      .filter((line) => {
        // console.log('LL:', line.length)
        return line.length
      })
      .map((line) => {
        const lc = line.slice(-1)[0]
        console.log('LCCCC:', lc, line.length, line)
        if (lc === ',' || lc === '{' || lc === '}') {
          // console.log('LINE:', line)
          return line
        }
        // console.log('LEN:', line.length, line)
        return line + ','
      })
      .join('\n')

    console.log('ABCCCC:', a)

    let zz
    // const yy = eval(`zz = ${a}`)

    // console.log('YY:', typeof yy)
    // console.log('ZZ:', typeof zz)
    console.log('AAAACC:', a)

    eval(`zz = ${a}`)
    console.log('ZZCCCC:', zz)
    // const xx1 = JSON.stringify(yy)
    // const xx2 = JSON.stringify(zz)
    // console.log('YYx:', xx1)
    // console.log('ZZx:', xx2)
    resolve(zz)
    // resolve(JSON.stringify(zz, null, '  '))
    // resolve(JSON.stringify(xx2, null, '  '))
    // resolve(JSON.stringify(eval(`zz = ${a}`), null, '  '))
    // resolve(JSON.stringify(eval(`zz = ${a}`), null, '  '))
  })
})

fs.readdir('wrk', (err, a) => {
  // console.log(err, a)
  Promise.all(a.map((fn) => fixJson(fn)))
    .then((jsons) => {
      // console.log('JSON:', JSON.stringify(jsons, null, '  '))
      console.log('JSONOK')
    })
    .catch((err) => {
      console.error('ERR:', err)
    })
})


/*
fixJson('page-2016-12-01-08-59-22-87534215684.json')
  .then((json) => {
    console.log(json)
  })
  .catch((err) => {
    console.error(err)
  })
*/
