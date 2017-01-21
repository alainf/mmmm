/* globals emit */
'use strict'

module.exports = {
  map: function (doc) {
    var r
    var t
    for (r in doc) {
      if (r !== '_rev') {
        t = typeof doc[r]
        if (t === 'string' || t === 'number' || t === 'boolean') {
          emit([r, doc[r]])
        } else if (typeof doc[r] === 'object' && doc[r].length) {
          doc[r].forEach(function (x) {
            emit([r, x])
          })
        }
      }
    }
  },
  reduce: '_count'
}
