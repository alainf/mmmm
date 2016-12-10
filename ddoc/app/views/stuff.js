/* globals emit */
'use strict'

module.exports = {
  map: function (doc) {
    var r
    var g

    for (r in doc) {
      if (r !== '_rev' && r !== 'apercu' && r !== 'citation' && r !== 'contenu' && r !== 'description') {
        if (typeof doc[r] === 'string' || typeof doc[r] === 'number') {
          emit([r, doc[r]])
        } else if (typeof doc[r] === 'object' && doc[r].length) {
          for (g = 0; g < doc[r].length; ++g) {
            emit([r, doc[r][g]])
          }
        }
      }
    }
  },
  reduce: '_count'
}
