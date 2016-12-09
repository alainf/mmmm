'use strict'

require('dotenv-safe').load({ path: '../../.env', sample: '../../.env.example' })

// core
const fs = require('fs')
const url = require('url')

// npm
const nano = require('cloudant-nano')
// const db = nano(url.resolve(process.env.DBURL, process.env.DBNAME))
/*
      console.log('DBURL:', process.env.DBURL)
      console.log('DBNAME:', process.env.DBNAME)
      console.log('DBADMIN:', process.env.DBADMIN)
      console.log('DBPASSWORD:', process.env.DBPASSWORD)
*/

/*
db.info((e, a) => {
  console.log('e:', e)
  console.log('a:', a)
})
*/

const readJson = (filename) => new Promise((resolve, reject) => {
  // console.log('fn:', filename)
  try {
    resolve(require(`./${filename}`))
  } catch (e) {
    e.filename = filename
    reject(e)
  }
})

fs.readdir('.', (err, a) => {
  if (err) {
    console.error(err)
    return
  }
  Promise.all(
    a
      .filter((fn) => fn.slice(-5) === '.json')
      .map(readJson)
  )
    .then((jsons) => {
      console.log('jsons.length:', jsons.length)
      return jsons
    })
    .then((jsons) => {
      // console.log(jsons)

      const db = nano(url.resolve(process.env.DBURL, process.env.DBNAME))
      db.bulk({docs: jsons }, (e, b) => {
        console.log('e:', e)
        console.log('b:', b)
      })
    })
    .catch((err) => { console.error('ERR:', err) })
})
