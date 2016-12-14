/* globals emit */
'use strict'

module.exports = {
  map: function (doc) {
    if (doc.pertinence) { emit(doc.pertinence) }
  }
}
