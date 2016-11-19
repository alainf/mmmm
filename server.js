'use strict'

// self
const Config = require('./config')
const Composer = require('./index')
const ddocManager = require('./ddoc/index')

ddocManager(Config, function (err, resp) {
  if (err) { console.log('Push error:', err) }
  console.log('Pushing:', resp)
})

Composer((err, server) => {
  if (err) { throw err }

  server.start((err) => {
    if (err) { throw err }
    console.log('Started the server on port ' + server.info.port)
  })
})
