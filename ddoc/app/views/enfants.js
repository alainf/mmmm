/* globals emit */
'use strict'

module.exports = {
  map: function (doc) {
    if (doc.type === 'taxonomies' && doc.enfants && doc.enfants.length) {
      doc.enfants.forEach(function (enfant) {
        emit([doc['sous-type'], doc._id], { nomParent: doc.nomLangues, _id: enfant })
      })
    }
  },
  reduce: '_count'
}
