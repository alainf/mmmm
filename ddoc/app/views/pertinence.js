/* globals emit */
'use strict'

module.exports = {
  map: function (doc) {
    if (doc.affichage === 'article') { emit(doc.pertinence) }
  }
}
