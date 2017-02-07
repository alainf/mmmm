/* globals emit */
'use strict'

module.exports = {
  map: function (doc) {
    if (!doc.enfants || !doc.enfants.length || !doc.type || doc.type !== 'taxonomies' || doc['sous-type'] !== 'sections') { return }
    doc.enfants
//      .filter(function (child) { return child.trim() })
      .forEach(function (child) {
        if (child.trim()) {
          emit(doc._id, { _id: child, parent: doc._id })
        } else {
          emit(['invalid', doc._id], { child: child, parent: doc._id })
        }
      })
  },
  reduce: '_count'
}
