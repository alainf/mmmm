/*
 * Script pour reformatter les docs en vue de les mettre dans CouchDB.
 *
 * C'est le même script utilisé depuis le début,
 * quand le json n'était pas tout à fait conforme.
 *
 * S'occupe entre autre de:
 *    1. vérifier que _id et nom-machine sont consistents
 *    2. transforme les entitées html en utf-8
 *    3. identifiant-drupal et niveau sont des nombres entiers
 *    4. importance et pertinence sont des nombres décimaux
 *    5. mots-clefs sont trimmés (espaces début et fin)
 *
 * Ce script crée de nouveaux docs dans new/ qu'on peut vérifier
 * avant d'écraser les docs du répertoire courant. Quand tout est beau,
 * mv new/*.json .
 * écrasera nos fichiers qu'on pourra uploader dans CouchDB avec to-db.js
 */

'use strict'

// core
const fs = require('fs')

// npm
const decodeHtmlEntities = require('he').decode
const _ = require('lodash')

const nomLangues = [
  'nom-francais',
  'nom-russe',
  'nom-anglais',
  'nom-italien',
  'nom-espagnol',
  'nom-arabe'
]

/**
 * Générer un json corrigé (ligne par ligne, dangling commas, etc.)
 */
const fixLine = (line) => {
  const lc = line.slice(-1)[0]
  if (lc === ',' || lc === '{' || lc === '}') { return line }
  return line + ','
}

/**
 * Remplacer les entitées html par la valeur utf-8 dans tous les champs
 */
const entities = (doc) => {
  let r
  let t

  for (r in doc) {
    if (r === 'nomLangues') {
      for (t in doc.nomLangues) {
        doc.nomLangues[t] = doc.nomLangues[t].map((x) => decodeHtmlEntities(x))
      }
    } else if (typeof doc[r] === 'string') {
      doc[r] = decodeHtmlEntities(doc[r])
    } else if (typeof doc[r] === 'object' && doc[r].length) {
      doc[r] = doc[r].map((x) => decodeHtmlEntities(x))
    }
  }
  return doc
}

/**
 * Transforme un json selon nos souhaits
 */
const fixJson = (filename) => new Promise((resolve, reject) => {
  fs.readFile(filename, 'utf-8', (err, content) => {
    if (err) { return reject(err) }

    const json = content
      .split('\r\n')
      .filter((line) => line.length)
      .map(fixLine)
      .join('\n')

    let doc
    try {
      // On évalue la chaine json comme si c'était du code JavaScript
      eval(`doc = ${json}`) // eslint-disable-line no-eval
    } catch (e) {
      e.filename = filename
      return reject(e)
    }
    let r
    let lang

    for (r in doc) {
      // true et false: bool, not strings
      if (doc[r] === 'true') {
        doc[r] = true
      } else if (doc[r] === 'false') {
        doc[r] = false
      } else {
        // retirer les doublons des array
        if (typeof doc[r] === 'object' && doc[r].length) {
          doc[r] = _.uniq(doc[r])
        }

        if (nomLangues.indexOf(r) !== -1) {
          if (!doc.nomLangues) { doc.nomLangues = {} }
          if (typeof doc[r] === 'string') { doc[r] = [doc[r]] }
          lang = r.slice(4, 6)
          if (lang === 'an') { lang = 'en' }
          doc.nomLangues[lang] = doc[r].slice()
          delete doc[r]
        } else if (r === 'identifiant-drupal' || r === 'identifiant-drupal-parent') {
          if (typeof doc[r] === 'object') { doc[r] = doc[r][0] }
          // nombre entier
          doc[r] = parseInt(doc[r], 10)
        } else if (r === 'niveau') {
          // nombre entier
          doc[r] = parseInt(doc[r], 10)
        } else if (r === 'importance' || r === 'pertinence') {
          // nombre décimal
          doc[r] = parseFloat(doc[r])
        } else if (r === 'mots-clefs' && typeof doc[r] === 'object' && doc[r].length) {
          // enlever les espaces au début et à la fin des mots clés.
          doc[r] = doc[r].map((x) => x.trim())
        }
      }
    }
    // Si le doc ne contient pas de champ _id
    if (!doc._id) {
      if (typeof doc['nom-machine'] === 'string') {
        // utiliser le nom-machine
        doc._id = doc['nom-machine']
      } else if (typeof doc['nom-machine'] === 'object' && doc['nom-machine'][0]) {
        // si nom-machine est un array, utiliser le premier terme
        doc._id = doc['nom-machine'][0]
      } else {
        // _id est un champ nécessaire
        return reject(new Error(`Required: either _id or nom-machine in ${filename}`))
      }
    }

    resolve({ fn: filename, json: entities(doc) })
  })
})

// Écrire les nouveaux .json transoformés dans new/
const writeFile = (j) => fs.writeFile(`new/${j.fn}`, JSON.stringify(j.json, null, '  '), 'utf-8')

/**
 * Transformer les fichiers json du répertoire courant
 * et sauver ça dans new/
 */
const processDirectory = () => {
  fs.readdir('.', (err, file) => {
    if (err) {
      console.error(err)
      return
    }
    Promise.all(
      file
        .filter((fn) => fn.slice(-5) === '.json') // seulement les .json
        .map(fixJson) // transformer
    )
      .then((jsons) => {
        console.log('jsons.length:', jsons.length)
        return jsons
      })
      .then((jsons) => jsons.forEach(writeFile))
      .catch((err) => { console.error('ERR:', err) })
  })
}

processDirectory()
