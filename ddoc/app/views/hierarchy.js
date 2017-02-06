/* globals emit */
'use strict'

module.exports = {
  map: function (doc) {
    if (!doc.parent || !doc.type || doc.type !== 'taxonomies') { return }
    emit([doc._id, 'child'])
    emit([doc._id, 'parent'], { _id: doc.parent })
  },
  reduce: '_count'
}
