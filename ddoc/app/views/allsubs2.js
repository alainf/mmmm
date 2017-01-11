/* globals emit */
'use strict'

module.exports = {
  map: function (doc) {
    ['lieu-concerne', 'personne-concernee', 'voir-aussi', 'sujet', 'section']
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
