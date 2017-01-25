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

const fix = (str) => decodeHtmlEntities(
  str
    .replace(/&#195;&#129;/g, 'Á')
    .replace(/&#195;&#179;/g, 'ó')
    .replace(/&#227;&#132;/g, 'ä')
    .replace(/&#227;&#133;/g, 'å')
    .replace(/&#227;&#135;/g, 'ç')
    .replace(/&#227;&#137;/g, 'é')
    .replace(/&#227;&#138;/g, 'ê')
    .replace(/&#227;&#145;/g, 'ò')
    .replace(/&#227;&#146;/g, 'ò')
    .replace(/&#227;&#147;/g, 'ò')
    .replace(/&#227;&#149;/g, 'õ')
    .replace(/&#227;&#150;/g, 'ő')
    .replace(/&#227;&#152;/g, 'ø')
    .replace(/&#227;&#154;/g, 'ù')
    .replace(/&#227;&#156;/g, 'ü')
    .replace(/&#227;&#161;/g, 'á')
    .replace(/&#227;&#167;/g, 'ç')
    .replace(/&#227;&#168;/g, 'è')
    .replace(/&#227;&#169;/g, 'é')
    .replace(/&#227;&#171;/g, 'ë')
    .replace(/&#227;&#174;/g, 'î')
    .replace(/&#227;&#175;/g, 'ï')
    .replace(/&#227;&#178;/g, 'ò')
    .replace(/&#227;&#179;/g, 'ó')
//    .replace(/&#227;&#179;/g, 'ô')
    .replace(/&#227;&#180;/g, 'ô')
    .replace(/&#227;&#182;/g, 'ö')
    .replace(/&#227;&#186;/g, 'ú')
    .replace(/&#227;&#188;/g, 'ü')
)

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
        doc.nomLangues[t] = doc.nomLangues[t].map(fix)
      }
    } else if (typeof doc[r] === 'string') {
      doc[r] = fix(doc[r])
    } else if (typeof doc[r] === 'object' && doc[r].length) {
      doc[r] = doc[r].map(fix)
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
        if (doc[r] && typeof doc[r] === 'object' && doc[r].length) {
          doc[r] = _.uniq(doc[r])
        }

        if (nomLangues.indexOf(r) !== -1) {
          if (!doc.nomLangues) { doc.nomLangues = {} }
          if (typeof doc[r] === 'string') { doc[r] = [doc[r]] }
          lang = r.slice(4, 6)
          if (lang === 'an') { lang = 'en' }
          // doc.nomLangues[lang] = doc[r].map(fix)
          doc.nomLangues[lang] = doc[r].slice()
          delete doc[r]
        } else if (r === 'identifiant-drupal' || r === 'identifiant-drupal-parent') {
          if (doc[r] && typeof doc[r] === 'object') { doc[r] = doc[r][0] }
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
    if (err) { return console.error('ERR1:', err) }
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
      .catch((err) => { console.error('ERR2:', err) })
  })
}

processDirectory()
