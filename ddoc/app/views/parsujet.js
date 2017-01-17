/* globals emit */
'use strict'

module.exports = {
  map: function (doc) {
    if (doc.affichage === 'article') {
      doc.sujet.forEach(function (x) {
        emit([x, doc.pertinence])
      })
    }
  },
  reduce: '_count'
}
