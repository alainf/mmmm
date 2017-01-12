/* globals emit */
'use strict'

module.exports = {
  map: function (doc) {
    [
      'lieu-edition',
      'lieu-concerne',
      'personne-concernee',
      'voir-aussi',
      'sujet',
      'langue-edition',
      'site-de-diffusion',
      'type-de-ressource',
      'type-de-contenu',
      'section'
    ]
      .forEach(function (s) {
        if (doc[s]) {
          doc[s].forEach(function (docId) {
            emit(docId, { _id: docId })
          })
        }
      })
  },
  reduce: '_count'
}
