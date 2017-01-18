/* globals emit */
'use strict'

module.exports = {
  map: function (doc) {
    var r
    var nom
    var bc
    if (!doc.breadcrumb || doc.type !== 'taxonomies') { return }
    bc = doc.breadcrumb.replace(/^\//, '').replace(/\/$/, '').split('/')
    if (bc[0] !== 'taxonomies' || bc.length !== 3) { return }
    // if (bc[1] !== 'sections' && bc[1] !== 'sujets') { return }
    emit([bc[1], doc._id], doc.nomLangues)
    if (!doc.enfants || !doc.enfants.length) { return }
    doc.enfants.forEach(function (enfant) {
      emit([bc[1], doc._id, 'enfant'], { _id: enfant })
    })
  },
  reduce: '_count'
}
