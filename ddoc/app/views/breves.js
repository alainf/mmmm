/* globals emit */
'use strict'

module.exports = {
  map: function (doc) {
    if (doc.affichage === 'breve') { emit(doc.pertinence) }
  }
}
