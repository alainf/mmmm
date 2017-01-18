/* globals emit */
'use strict'

module.exports = {
  map: function (doc) {
    if (!doc.breadcrumb || doc.type !== 'taxonomies') { return }
    var bc = doc.breadcrumb.replace(/^\//, '').replace(/\/$/, '').split('/')
    if (bc[0] !== 'taxonomies' || bc.length !== 3) { return }
    emit([bc[1], doc._id, typeof doc.nomLangues.fr === 'string' ? doc.nomLangues.fr : doc.nomLangues.fr[0]], doc.nomLangues)
  },
  reduce: '_count'
}
