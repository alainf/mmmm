'use strict'

// core
const url = require('url')

// npm
const Wreck = require('wreck')
const _ = require('lodash')
const got = require('got')

const makeQ = (words) => {
  const w = words.toLowerCase().split(' ')
  return ['', 'titre:', 'description:', 'citation:']
    .map((f) => w.map((x) => f + x).join(' AND '))
    .map((x) => `(${x})`).join(' OR ')
}

exports.register = (server, options, next) => {
  const dbUrl = url.resolve(options.db.url, options.db.name)

  const counts = JSON.stringify(['type', 'sous-type'])

  const yoyo = (str) => {
    const u2 = url.parse([options.db.url, options.db.name, '_design/search1/_search/storing'].join('/'))
    u2.query = { counts, q: makeQ(str) }
    return got(url.format(u2), {
      auth: [options.db.reader, options.db.readerPassword].join(':'),
      json: true
    })
  }

  const mapperSujets = (request, callback) => {
    callback(null, dbUrl + '/_design/app/_view/enfants?reduce=false&startkey=[%22sujets%22]&endkey=[%22sujets%22,%20{}]&include_docs=true', { accept: 'application/json' })
  }

  const mapperSections = (request, callback) => {
    callback(null, dbUrl + '/_design/app/_view/enfants?reduce=false&startkey=[%22sections%22]&endkey=[%22sections%22,%20{}]&include_docs=true', { accept: 'application/json' })
  }

  const firstArrayString = (aors) => {
    // console.log('AORS:', aors)
    if (typeof aors === 'string') { return aors }
    if (typeof aors === 'object' && aors.length) { return aors[0] }
    // throw new Error('Bad ArrayOrString')
    return false
  }

  const responderSections = (err, res, request, reply, settings, ttl) => {
    if (err) { return reply(err) } // FIXME: how to test?
    if (res.statusCode >= 400) { return reply(res.statusMessage).code(res.statusCode) }

    // console.log('REQKEYS:', Object.keys(request))
    // console.log('REQ.locale:', request.locale)
    Wreck.read(res, { json: true }, (err, payload) => {
      if (err) { return reply(err) } // FIXME: how to test?
      const ret = _.groupBy(payload.rows, (row) => row.key[1])

      const ret2 = {}
      _(ret).forEach((v, k) => {
        // console.log('K:', k)
        // console.log('V[0]:', v[0])
        let nomParent
        if (v[0].value.nomParent) {
          nomParent = firstArrayString(v[0].value.nomParent[request.locale]) || firstArrayString(v[0].value.nomParent.fr)
        }
        ret2[k] = {
          // nomParent: v[0].value.nomParent[request.locale] || v[0].value.nomParent.fr,
          nomParent: nomParent,
          sousType: v[0].key[0],
          enfants: v.map((x) => {
            if (!x.doc || !x.doc.nomLangues) { return { id: x.value._id } }
            return {
              nomLangue: firstArrayString(x.doc.nomLangues[request.locale]) || firstArrayString(x.doc.nomLangues.fr),
              id: x.doc._id,
              enfants: x.doc.enfants
            }
          })
        }
      })
      reply.view('demoSections', { ret: ret2 })
    })
  }

  const mapperSearch = (request, callback) => {
    const u = `/_design/app/_view/words?reduce=false&startkey="${request.query.word}"&endkey="${request.query.word}\\ufff0"&include_docs=true`
    callback(null, dbUrl + u, { accept: 'application/json' })
  }

  const responderSearch = (err, res, request, reply, settings, ttl) => {
    if (err) { return reply(err) } // FIXME: how to test?
    if (res.statusCode >= 400) { return reply(res.statusMessage).code(res.statusCode) }
    Wreck.read(res, { json: true }, (err, payload) => {
      if (err) { return reply(err) } // FIXME: how to test?
      reply.view('resultats-v2', { rows: payload.rows.map((x) => x.doc) })
    })
  }

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
      if (payload.rows.length) {
        reply(`<h1><a href="../../by">By...</a></h1><h2><a href="../../by/${payload.rows[0].key[0]}">${payload.rows[0].key[0]}</a></h2><h3>${payload.rows[0].key[1]}</h3>` + payload.rows.map((r) => {
          return `<li><a href="../../doc/${r.id}">${r.id}</a></li>`
        }).join('\n'))
      } else {
        reply('Nothing??')
      }
    })
  }

  server.views({
    engines: { html: require('lodash-vision') },
    path: 'templates',
    partialsPath: 'templates/partials',
    helpersPath: 'templates/helpers',
    isCached: options.templateCached
  })

  server.route({
    method: 'GET',
    path: '/sections',
    handler: {
      proxy: {
        passThrough: true,
        mapUri: mapperSections,
        onResponse: responderSections
      }
    }
  })

  server.route({
    method: 'GET',
    path: '/sujets',
    handler: {
      proxy: {
        passThrough: true,
        mapUri: mapperSujets,
        onResponse: responderSections
      }
    }
  })

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
    path: '/search-v2',
    handler: {
      proxy: {
        passThrough: true,
        mapUri: mapperSearch,
        onResponse: responderSearch
      }
    }
  })

  server.route({
    method: 'GET',
    path: '/search',
    config: {
      handler: function (request, reply) {
        reply.view('resultats', { rows: [] })
      }
    }

/*
    handler: {
      proxy: {
        passThrough: true,
        mapUri: mapperSearch,
        onResponse: responderSearch
      }
    }
*/
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
