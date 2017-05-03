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
  console.error(`
Exemples d'utilisation:
  ${process.argv[1]} "trump pentagon"
  ${process.argv[1]} "trump pentagon" --sous-type=site
  ${process.argv[1]} "trump pentagon" --sous-type=site --type=ressources

Notez que les guillemets "" sont requis.`)
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

yoyo(process.argv[2], ddFlags)
  .then((res) => {
    console.error(res.headers)
    console.log(JSON.stringify(res.body, null, '  '))
    console.error(`Recherche de "${process.argv[2]}".`)
    console.error(`Total de ${res.body.total_rows} résultats.`)
    if (res.body.rows.length !== res.body.total_rows) {
      console.error(`${res.body.rows.length} résultats présentés.`)
    }
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

/*
function indexFunc (doc) {
  function yo (it, b) {
    var it2 = it === 'contenu' ? 'default' : it
    var store = it !== 'citation'
    if (doc[it]) {
      index(it2, doc[it], { store: store, boost: b });
    }
  }

  function facet (it) {
    if (doc[it]) {
      index(it, doc[it], { store: true, facet: true });
    }
  }

  facet('type')
  facet('sous-type')
  yo('contenu', 1)
  yo('citation', 2)
  yo('description', 1.5)
  yo('titre', 2.5)
}

Search design doc:
{
  "_id": "_design/search1",
  "_rev": "16-03a296f1a5cd08ba828058028624854c",
  "views": {},
  "language": "javascript",
  "indexes": {
    "storing": {
      "analyzer": "standard",
      "index": indexFunc.toString()
    }
  }
}
*/
