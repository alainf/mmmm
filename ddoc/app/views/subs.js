/* globals emit */
'use strict'

module.exports = {
  map: function (doc) {
    ['lieu-concerne', 'personne-concernee', 'voir-aussi', 'sujet', 'section']
      .forEach(function (s) {
        if (doc[s]) {
          doc[s].forEach(function (docId) {
            emit([doc._id, s], { _id: docId })
          })
        }
      })
  }
}
