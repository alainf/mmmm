/* globals emit */
'use strict'

module.exports = {
  map: function (doc) {
    var r
    var nom
    if (doc.type === 'taxonomies' && doc['sous-type'] === 'sections') {
      for (r in doc.nomLangues) {
        nom = doc.nomLangues[r]
        if (typeof nom === 'string') {
          emit([doc._id, r], nom)
        } else if (typeof nom === 'object') {
          if (nom.length) {
            emit([doc._id, r], nom[0])
          }
        }
      }
    }
  },
  reduce: '_count'
}
