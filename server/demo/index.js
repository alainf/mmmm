'use strict'

// npm
const url = require('url')
const Wreck = require('wreck')

const sections = require('../../data/list1.json')
const sujets = require('../../data/list2.json')

exports.register = (server, options, next) => {
  const dbUrl = url.resolve(options.db.url, options.db.name)

  server.views({
    engines: { html: require('lodash-vision') },
    path: 'templates',
    partialsPath: 'templates/partials',
    isCached: options.templateCached
  })

  const mapperAccueil = (request, callback) => {
    const it = [dbUrl, '_design/app/_view/front']
    callback(null, it.join('/') + '?include_docs=true&reduce=false', { accept: 'application/json' })
  }

/*
  const mapper = (request, callback) => {
    const it = [dbUrl]
    if (request.params.pathy) { it.push(request.params.pathy) }
    callback(null, it.join('/') + '?include_docs=true&reduce=false', { accept: 'application/json' })
  }
*/

  const responder = (go, err, res, request, reply, settings, ttl) => {
    if (err) { return reply(err) } // FIXME: how to test?
    if (res.statusCode >= 400) { return reply(res.statusMessage).code(res.statusCode) }
    Wreck.read(res, { json: true }, go.bind(null, res, request, reply))
  }

  // const go = (res, request, reply, err, payload) => { reply(payload).headers = res.headers }

  const go2 = (res, request, reply, err, payload) => {
    let tpl
    let obj
    if (payload._id) {
      tpl = 'doc'
      obj = { doc: payload }
    } else if (payload.rows) {
      // tpl = 'docs'
      tpl = 'accueilDemo'

      // console.log('payload keys:', Object.keys(payload))
      obj = {
        lesSections: sections.items,
        lesSujets: sujets.items,
        docs: payload.rows.map((d) => {
          // console.log('d.doc.path:', d.doc.path)
          if (d.doc.path) {
            const parts = d.doc.path.split('/')
            const newpath = parts.slice(2)
            newpath.unshift('demo')
            d.doc.demopath = newpath.join('/')
            // console.log('parts:', parts)
          }
          // console.log('doc:', d.doc)
          return d.doc
        })
      }
    } else {
      tpl = 'woot'
      obj = { doc: payload }
    }
    reply.view(tpl, obj).etag(res.headers.etag)
  }

/*
  server.route({
    method: 'GET',
    path: '/{pathy*}',
    handler: {
      proxy: {
        passThrough: true,
        mapUri: mapper,
        onResponse: responder.bind(null, go)
      }
    }
  })
*/

/*
  server.route({
    method: 'GET',
    path: '/{pathy*}',
    handler: {
      proxy: {
        passThrough: true,
        mapUri: mapper,
        onResponse: responder.bind(null, go2)
      }
    }
  })
*/

  server.route({
    method: 'GET',
    path: '/accueil',
    handler: {
      proxy: {
        passThrough: true,
        // mapUri: mapper,
        mapUri: mapperAccueil,
        onResponse: responder.bind(null, go2)
      }
    }
  })

  next()
}

exports.register.attributes = {
  name: 'demo',
  dependencies: ['hapi-i18n', 'h2o2', 'vision']
}
