/* globals emit */
'use strict'

module.exports = {
  map: function (doc) {
    var r

    for (r in doc) {
      if (r !== '_rev' && r !== 'apercu' && r !== 'citation' && r !== 'contenu' && r !== 'description') {
        if (typeof doc[r] === 'string' || typeof doc[r] === 'number' || typeof doc[r] === 'boolean') {
          emit([r, doc[r]])
        }
      }
    }
  },
  reduce: '_count'
}
