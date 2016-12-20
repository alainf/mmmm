'use strict'

// core
const fs = require('fs')

/**
 * Générer un json corrigé (ligne par ligne, dangling commas, etc.)
 */
const fixLine = (line) => {
  const lc = line.slice(-1)[0]
  if (lc === ',' || lc === '{' || lc === '}') { return line }
  return line + ','
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

    for (r in doc) {
      // true et false: bool, not strings
      if (doc[r] === 'true') {
        doc[r] = true
      } else if (doc[r] === 'false') {
        doc[r] = false
      } else {
        if (r === 'identifiant-drupal') {
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
    resolve({ fn: filename, json: doc })
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
