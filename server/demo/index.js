'use strict'

// npm
const url = require('url')
const Wreck = require('wreck')

exports.register = (server, options, next) => {
  const dbUrl = url.resolve(options.db.url, options.db.name)

  server.views({
    engines: { html: require('lodash-vision') },
    path: 'templates',
    partialsPath: 'templates/partials',
    isCached: options.templateCached
  })

  const mapperBy = (request, callback) => {
    callback(null, dbUrl + '/_design/app/_view/stuff?group_level=1', { accept: 'application/json' })
  }

  const responderBy = (err, res, request, reply, settings, ttl) => {
    if (err) { return reply(err) } // FIXME: how to test?
    if (res.statusCode >= 400) { return reply(res.statusMessage).code(res.statusCode) }
    Wreck.read(res, { json: true }, (err, payload) => {
      if (err) { return reply(err) } // FIXME: how to test?
      reply(payload.rows.map((row) => `<li><a href="by/${row.key[0]}">${row.key[0]}</a> (${row.value})</li>`).join('\n'))
    })
  }

  const mapperByType = (request, callback) => {
    const ek = encodeURIComponent('["' + request.params.type + '", []]')
    const u = dbUrl +
      '/_design/app/_view/stuff?group_level=2&startkey=["' +
      request.params.type +
      '"]&endkey=' + ek
    callback(null, u, { accept: 'application/json' })
  }

  const responderByType = (err, res, request, reply, settings, ttl) => {
    if (err) { return reply(err) } // FIXME: how to test?
    if (res.statusCode >= 400) { return reply(res.statusMessage).code(res.statusCode) }
    Wreck.read(res, { json: true }, (err, payload) => {
      if (err) { return reply(err) } // FIXME: how to test?
      reply(`<h1><a href="../by">By...</a></h1><h2>${payload.rows[0].key[0]}</h2>` + payload.rows.map((r) => {
        return `<li><a href="${r.key[0]}/${r.key[1]}">${r.key[1]}</a> (${r.value})</li>`
      }).join('\n'))
    })
  }

  const mapperByTypeKey = (request, callback) => {
    let end
    let end2
    if (request.params.key == parseFloat(request.params.key)) { // eslint-disable-line eqeqeq
      end = parseFloat(request.params.key)
      end2 = end
    } else {
      end = request.params.key
      end2 = '"' + end + '"'
    }

    const ek = JSON.stringify([request.params.type, end, false])
    const u = dbUrl +
      '/_design/app/_view/stuff?reduce=false&startkey=["' +
      request.params.type + '",' + end2 +
      ']&endkey=' + ek
    callback(null, u, { accept: 'application/json' })
  }

  const responderByTypeKey = (err, res, request, reply, settings, ttl) => {
    if (err) { return reply(err) } // FIXME: how to test?
    if (res.statusCode >= 400) { return reply(res.statusMessage).code(res.statusCode) }
    Wreck.read(res, { json: true }, (err, payload) => {
      if (err) { return reply(err) } // FIXME: how to test?
      reply(`<h1><a href="../../by">By...</a></h1><h2><a href="../../by/${payload.rows[0].key[0]}">${payload.rows[0].key[0]}</a></h2><h3>${payload.rows[0].key[1]}</h3>` + payload.rows.map((r) => {
        return `<li><a href="../../doc/${r.id}">${r.id}</a></li>`
      }).join('\n'))
    })
  }

  server.route({
    method: 'GET',
    path: '/by',
    handler: {
      proxy: {
        passThrough: true,
        mapUri: mapperBy,
        onResponse: responderBy
      }
    }
  })

  server.route({
    method: 'GET',
    path: '/by/{type}',
    handler: {
      proxy: {
        passThrough: true,
        mapUri: mapperByType,
        onResponse: responderByType
      }
    }
  })

  server.route({
    method: 'GET',
    path: '/by/{type}/{key}',
    handler: {
      proxy: {
        passThrough: true,
        mapUri: mapperByTypeKey,
        onResponse: responderByTypeKey
      }
    }
  })

  next()
}

exports.register.attributes = {
  name: 'demo',
  dependencies: ['hapi-i18n', 'h2o2', 'vision']
}
