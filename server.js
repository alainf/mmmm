'use strict'

const Composer = require('./index')

Composer((err, server) => {
  if (err) {
    throw err
  }

  server.start((err) => {
    if (err) {
      throw err
    }
    console.log('Started the server on port ' + server.info.port)
  })
})
