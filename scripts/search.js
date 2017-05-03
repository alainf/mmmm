#!/usr/bin/env node

'use strict'

const facets = ['type', 'sous-type']

if (
    !process.argv[2] ||
    ['help', '-help', '--help'].indexOf(process.argv[2]) !== -1
  ) {
  console.error('Argument requis: chaine à chercher')
  console.error('On peut passer des facettes en option:')
  facets.forEach((x) => console.error(`--${x}=CHAINE`))
  process.exit(1)
}

// npm
require('dotenv-safe')
  .load({ path: '../.env', sample: '../.env.example' })
const got = require('got')

// core
const url = require('url')

const isFacet = (x) => facets.indexOf(x[0]) !== -1

const makeQ = (words) => {
  const w = words.toLowerCase().split(' ')
  return ['', 'titre:', 'description:', 'citation:']
    .map((f) => w.map((x) => f + x).join(' AND '))
    .map((x) => `(${x})`).join(' OR ')
}

const yoyo = (str, dd) => {
  const u2 = url.parse(
    [
      process.env.DBURL,
      process.env.DBNAME,
      '_design/search1/_search/storing'
    ].join('/')
  )
  u2.query = {
    counts: JSON.stringify(facets),
    q: makeQ(str)
  }
  if (dd && dd.length) {
    dd = dd.filter(isFacet)
    if (dd.length) { u2.query.drilldown = dd.map(JSON.stringify) }
  }
  return got(url.format(u2), {
    auth: [process.env.DBRDR, process.env.DBRDRPASSWORD].join(':'),
    json: true
  })
}

const ddFlags = process.argv
  .slice(3, 5)
  .map((x) => x.replace(/^-+/, '').split('='))
  .filter(isFacet)

yoyo('wall street', ddFlags)
  .then((res) => {
    console.error(res.headers)
    console.log(JSON.stringify(res.body, null, '  '))
    console.error('Drilldown:')
    facets.forEach((x) => {
      const k = Object.keys(res.body.counts[x])
      if (k.length) {
        console.error(
          `${x}: ${k.map(
            (y) => y + '(' + res.body.counts[x][y] + ')'
          ).join(', ')}`
        )
      }
    })
  })
