/*
 * Script pour identifier les docs manquants
 * qui sont référés par nos docs actuels
 */

'use strict'

// npm
const got = require('got')

got('http://localhost:5990/machina/_design/app/_view/allsubs2?reduce=false&include_docs=true', { json: true })
  .then((res) => {
    const data = res.body.rows
    console.log('All docs:', data.length)
    const missing = data.filter((row) => !row.doc)
    console.log('References to missing docs:', missing.length)
    const keys = missing.map((row) => row.key)

    const unique = (s) => {
      const ret = {}
      s.forEach((r) => { ret[r] = true })
      return Object.keys(ret)
    }

    const uniques = unique(keys)
    console.log('Missing docs:', uniques.length)
    console.log(uniques.join('\n'))
  })
  .catch(console.error)
