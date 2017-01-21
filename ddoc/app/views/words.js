/* globals emit */
'use strict'

module.exports = {
  map: function (doc) {
    var cutter = function (str) {
      if (!str || typeof str !== 'string') { return [] }
      return str
        .split(/[ ',.?!;<>/ \n=+\d…_"()\[\]«»&%$` —“„ˈ]+/)
    }

    var firstArrayString = function (aors) {
      if (typeof aors === 'string') { return aors }
      if (typeof aors === 'object' && aors.length) { return aors[0] }
      return false
    }

    var r
    var cut6 = []
    var cut9 = []
    var ret = {}

    var cut = cutter(doc['personne-nom-famille'])
    var cut2 = cutter(doc['personne-nom-prenom'])
    var cut3 = cutter(doc.apercu)
    var cut4 = cutter(doc.contenu)
    var cut5 = cutter(doc.description)
    var cut7 = cutter(doc.titre)
    var cut8 = cutter(doc.citation)
    if (doc['mots-clefs'] && doc['mots-clefs'].length) {
      doc['mots-clefs']
        .map(function (x) { return cutter(x) })
        .forEach(function (y) {
          if (y && y.length) {
            y.forEach(function (x) { if (x) { cut6.push(x) } })
          }
        })
    }

    if (doc.nomLangues) {
      for (r in doc.nomLangues) {
        cut9 = cut9.concat(cutter(firstArrayString(doc.nomLangues[r])))
      }
    }

    cut
      .concat(cut2, cut3, cut4, cut5, cut6, cut7, cut8, cut9)
      .map(function (x) {
        return x
          .replace(/^[\- ',.?!;<>/ \n=+\d…_"()\[\]«»&%$` —“„ˈ]+/, '')
          .replace(/[\- ',.?!;<>/ \n=+\d…_"()\[\]«»&%$` —“„ˈ]+$/, '')
      })
      .filter(function (x) { return x && x.length > 2 })
      .forEach(function (x) { ret[x.toLowerCase()] = true })

    if (typeof emit === 'function') {
      Object.keys(ret).forEach(function (x) { emit(x) })
    } else {
      return Object.keys(ret)
    }
  },
  reduce: '_count'
}
