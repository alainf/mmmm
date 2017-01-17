/* globals emit */
'use strict'

module.exports = {
  map: function (doc) {
    if (doc.affichage === 'article') {
      doc.section.forEach(function (x) {
        emit([x, doc.pertinence])
      })
    }
  },
  reduce: '_count'
}
