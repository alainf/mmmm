/* globals emit */
'use strict'

module.exports = {
  map: function (doc) {
    var r

    for (r in doc) {
      if (r !== '_id' && r !== '_rev' && r !== 'apercu' && r !== 'citation' && r !== 'contenu' && r !== 'description') {
        emit([r, doc[r]])
      }
    }
  },
  reduce: '_count'
}
