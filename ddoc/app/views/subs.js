/* globals emit */
'use strict'

module.exports = {
  map: function (doc) {
    if (doc['lieu-concerne']) {
      doc['lieu-concerne'].forEach(function (lieu) {
        emit([doc._id, 'lieu-concerne'], { _id: lieu })
      })
    }

    if (doc['personne-concernee']) {
      doc['personne-concernee'].forEach(function (lieu) {
        emit([doc._id, 'personne-concernee'], { _id: lieu })
      })
    }
  }
}
