'use strict'

// npm
const url = require('url')
const Wreck = require('wreck')
const _ = require('lodash')

// const sections = require('../../data/list1.json')
// const sujets = require('../../data/list2.json')
const dataJson = require('../../info/accueil-sections-et-sujets.json')
const sections = { items: dataJson.sections.map((x) => x.terme) }
const sujets = { items: dataJson.sujets.map((x) => x.terme) }

const sujets2 = require('../../data/sujets-Agriculture.json')
const sections2 = require('../../data/sections-Entreprise.json')
const sectionsGr1 = require('../../data/sectionsGr1.json')
const sujetsGr1 = require('../../data/sujetsGr1.json')
const pages = [
  'abonnez-vous',
  'agenda',
  'aider',
  'apropos',
  'bottin',
  'en-construction',
  'faq',
  'favoris',
  'index',
  'me-connecter',
  'me-deconnecter',
  'profil-membre',
  'profil-pair',
  'profil-moi',
  'moi',
  'detail-ext',
  'detail-int',
  'resultats'
]

exports.register = function (server, options, next) {
  const dbUrl = url.resolve(options.db.url, options.db.name)


// http://localhost:5990/machina/_all_docs?keys=[%22lieu-2015-12-06-16-10-48-86966174926%22,%22lieu-2015-12-06-16-12-48-86966182107%22]&include_docs=true

  const mapperDetail666 = (request, callback) => {
    const t1 = request.pre.thing1['lieu-concerne'] || []
    // console.log('PRES.thing1:', t1)
    // const u = dbUrl + '/' + request.params.pageId
    const u = dbUrl + '/' + '_all_docs?keys=' + JSON.stringify(t1) + '&include_docs=true'
    callback(null, u, { accept: 'application/json' })
  }

  const responderDetail666 = (err, res, request, reply, settings, ttl) => {
    // console.log('ERR-X:', err)
    if (err) { return reply(err) } // FIXME: how to test?
    if (res.statusCode >= 400) { return reply(res.statusMessage).code(res.statusCode) }
    Wreck.read(res, { json: true }, (err, payload) => {
      // console.log('ERR-Y:', err)
      if (err) { return reply(err) } // FIXME: how to test?
      _.forEach(payload, (v, k, o) => {
        if (k[0] === '_') { return }
        const cc = _.camelCase(k)
        if (cc !== k) { o[cc] = v }
      })
      // reply.view('detail', { doc: payload })
      reply(payload.rows.map((d) => d.doc))
      // reply({ doc: payload })
    })
  }

  const mapperDetail = (request, callback) => {
    const u = dbUrl + '/' + request.params.pageId
    callback(null, u, { accept: 'application/json' })
  }

  const responderDetail = (err, res, request, reply, settings, ttl) => {
    // console.log('ERR-X:', err)
    if (err) { return reply(err) } // FIXME: how to test?
    if (res.statusCode >= 400) { return reply(res.statusMessage).code(res.statusCode) }
    Wreck.read(res, { json: true }, (err, payload) => {
      // console.log('ERR-Y:', err)
      if (err) { return reply(err) } // FIXME: how to test?
      _.forEach(payload, (v, k, o) => {
        if (k[0] === '_') { return }
        const cc = _.camelCase(k)
        if (cc !== k) { o[cc] = v }
      })
      // reply.view('detail', { doc: payload })
      reply(payload)
      // reply({ doc: payload })
    })
  }

  const mapperAccueilPaged = (request, callback) => {
    callback(
      null,
      dbUrl + `/_design/app/_view/pertinence?skip=${request.params.n * 4 - 4}&startkey=0&limit=4&include_docs=true`,
      { accept: 'application/json' }
    )
  }

  const responderBla = (err, res, request, reply, settings, ttl) => {
    if (err) { return reply(err) } // FIXME: how to test?
    if (res.statusCode >= 400) { return reply(res.statusMessage).code(res.statusCode) }
    Wreck.read(res, { json: true }, (err, payload) => {
      if (err) { return reply(err) } // FIXME: how to test?
      // console.log('rows:', payload)
      reply(payload.rows.map((row) => row.doc))
    })
  }

  const mapperBla = (request, callback) => {
    callback(
      null,
      dbUrl + '/_design/app/_view/breves?include_docs=true&limit=4',
      { accept: 'application/json' }
    )
  }

  const bla = function (request, reply) {
    reply.proxy({
      mapUri: mapperBla,
      onResponse: responderBla
    })
  }

  const mapperAccueil = (request, callback) => {
    callback(null, dbUrl + '/_design/app/_view/pertinence?startkey=0&limit=4&include_docs=true', { accept: 'application/json' })
  }

  const responderAccueil = (err, res, request, reply, settings, ttl) => {
    if (err) { return reply(err) } // FIXME: how to test?
    if (res.statusCode >= 400) { return reply(res.statusMessage).code(res.statusCode) }

    Wreck.read(res, { json: true }, (err, payload) => {
      if (err) { return reply(err) } // FIXME: how to test?

      const rows = payload.rows
        .map((row) => row.doc)
        .map((doc) => {
          let tpl
          if (doc['thumb-src']) {
            if (doc.citation) {
              if (doc['thumb-beside'] === 'headline') {
                if (doc['thumb-float'] === 'left') {
                  tpl = 'Article2'
                } else if (doc['thumb-float'] === 'right') {
                  tpl = 'Article2b'
                }
              } else if (doc['thumb-beside'] === 'content') {
                if (doc['thumb-float'] === 'left') {
                  tpl = 'Article6'
                } else if (doc['thumb-float'] === 'right') {
                  tpl = 'Article6b'
                }
              }
              if (!tpl) { console.error('NO-TPL#1', doc['thumb-beside'], doc['thumb-float']) }
            } else {
              if (doc['thumb-beside'] === 'content') {
                if (doc['thumb-float'] === 'left') {
                  tpl = 'Article1'
                } else if (doc['thumb-float'] === 'right') {
                  tpl = 'Article1b'
                }
                if (!tpl) { console.error('NO-TPL#2') }
              } else if (doc['thumb-beside'] === 'headline') {
                if (doc['thumb-float'] === 'left') {
                  tpl = 'Article3'
                } else if (doc['thumb-float'] === 'right') {
                  tpl = 'Article3b'
                }
              }
              if (!tpl) { console.error('NO-TPL#3') }
            }
          } else {
            if (doc.direction) {
              tpl = 'Article5'
            } else {
              tpl = 'Article4'
            }
          }
          if (tpl) {
            tpl = 'apercu' + tpl
          } else {
            console.error('NO-TPL')
            // tpl = 'apercuArticle'
            tpl = 'noTpl'
            // console.error('NO-TPL', JSON.stringify(doc, null, ' '))
          }
          doc.tpl = tpl
          return doc
        })

      reply.view('accueil', {
        breves: request.pre.bla,
        rows: rows,
        lastPage: Math.ceil(payload.total_rows / 4),
        page: request.params.n ? parseInt(request.params.n, 10) : 1,
        lesSections: sections.items,
        lesSujets: sujets.items
      })
    })
  }

  server.views({
    engines: { html: require('lodash-vision') },
    path: 'templates',
    partialsPath: 'templates/partials',
    isCached: options.templateCached
  })

  const thing1 = function (request, reply) {
    reply.proxy({
      passThrough: true,
      mapUri: mapperDetail,
      onResponse: responderDetail
    })
  }

  const thing2 = function (request, reply) {
    // console.log('PRES:', request.pre.thing1['lieu-concerne'])
    reply.proxy({
      passThrough: true,
      mapUri: mapperDetail666,
      // onResponse: responderDetail
      onResponse: responderDetail666
    })
  }

  server.route({
    method: 'GET',
    path: '/{languageCode}/detail/{pageId}',
    config: {
      pre: [
        {
          method: thing1,
          assign: 'thing1'
        },
        {
          method: thing2,
          assign: 'thing2'
        }
      ],
      handler: function (request, reply) {
        // console.log('THING1:', request.pre.thing1)
        // console.log('THING2:', JSON.stringify(request.pre.thing2, null, ' '))
        if (request.pre.thing2 && request.pre.thing2.length) {
          request.pre.thing1.lieuConcerne = request.pre.thing2
        }

/*
        if (request.pre.thing2.lieuConcerne && request.pre.thing2.lieuConcerne.length) {
          request.pre.thing1.lieuConcerne = request.pre.thing2.lieuConcerne
        }

        if (request.pre.thing2.personneConcernee && request.pre.thing2.personneConcernee.length) {
          request.pre.thing1.personneConcernee = request.pre.thing2.personneConcernee
        }
*/
        reply.view('detail', { doc: request.pre.thing1 })
      }

      /*
      handler: {
        view: 'detail'
      }
      */
      /*
      handler: function (request, reply) {
        console.log('THING1:', request.pre.thing1)
        reply(request.pre.thing1)
      }
      */
      /*
      handler: {
        proxy: {
          passThrough: true,
          mapUri: mapperDetail,
          onResponse: responderDetail
        }
      }
      */
    }
  })

  pages.forEach((page) => {
    server.route({
      method: 'GET',
      path: '/{languageCode}/' + page,
      handler: { view: page }
    })
  })

  server.route({
    method: 'GET',
    path: '/',
    handler: {
      view: {
        template: 'index',
        context: { items: sections.items, items2: sujets.items }
      }
    }
  })

  server.route({
    method: 'GET',
    path: '/{languageCode}/tests',
    handler: {
      view: {
        template: 'tests',
        context: { lesSections: sections.items, lesSujets: sujets.items }
      }
    }
  })

  server.route({
    method: 'GET',
    path: '/{languageCode}/accueilOrig',
    handler: {
      view: {
        template: 'accueilOrig',
        context: { lesSections: sections.items, lesSujets: sujets.items }
      }
    }
  })

  server.route({
    method: 'GET',
    path: '/{languageCode}/accueil',
    config: {
      pre: [
        {
          method: bla,
          assign: 'bla'
        }
      ],
      handler: {
        proxy: {
          passThrough: true,
          mapUri: mapperAccueil,
          onResponse: responderAccueil
        }
      }
    }
  })

  server.route({
    method: 'GET',
    path: '/{languageCode}/accueil/{n}',
    config: {
      pre: [
        {
          method: bla,
          assign: 'bla'
        }
      ],
      handler: {
        proxy: {
          passThrough: true,
          mapUri: mapperAccueilPaged,
          onResponse: responderAccueil
        }
      }
    }
  })

  server.route({
    method: 'GET',
    path: '/{languageCode}/groupe1',
    handler: {
      view: {
        template: 'groupe1',
        context: { lesSections: sectionsGr1.items, lesSujets: sujetsGr1.items }
      }
    }
  })

  server.route({
    method: 'GET',
    path: '/{languageCode}/journal1',
    handler: {
      view: {
        template: 'journal1',
        context: { lesSections: sectionsGr1.items, lesSujets: sujetsGr1.items }
      }
    }
  })

  server.route({
    method: 'GET',
    path: '/{languageCode}/journal2',
    handler: {
      view: {
        template: 'journal2',
        context: { lesSections: sectionsGr1.items, lesSujets: sujetsGr1.items }
      }
    }
  })

  server.route({
    method: 'GET',
    path: '/{languageCode}/these1',
    handler: {
      view: {
        template: 'these1',
        context: { lesSections: sectionsGr1.items, lesSujets: sujetsGr1.items }
      }
    }
  })

  server.route({
    method: 'GET',
    path: '/{languageCode}/these2',
    handler: {
      view: {
        template: 'these2',
        context: { lesSections: sectionsGr1.items, lesSujets: sujetsGr1.items }
      }
    }
  })

  server.route({
    method: 'GET',
    path: '/{languageCode}/sujet',
    handler: {
      view: {
        template: 'sujet',
        context: { lesSections: sections.items, lesSujets: sujets2.items }
      }
    }
  })

  server.route({
    method: 'GET',
    path: '/{languageCode}/section',
    handler: {
      view: {
        template: 'section',
        context: { lesSections: sections2.items, lesSujets: sujets.items }
      }
    }
  })

  server.route({
    method: 'GET',
    path: '/{languageCode}/partials',
    handler: { view: 'partials' }
  })

  server.route({
    method: 'GET',
    path: '/{languageCode}/multilingual',
    handler: { view: 'multilingual' }
  })

  server.route({
    method: 'GET',
    path: '/css/{param*}',
    handler: { directory: { path: 'assets/css/' } }
  })

  server.route({
    method: 'GET',
    path: '/js/{param*}',
    handler: { directory: { path: 'assets/js/' } }
  })

  server.route({
    method: 'GET',
    path: '/img/{param*}',
    handler: { directory: { path: 'assets/img/' } }
  })

  next()
}

exports.register.attributes = {
  name: 'web',
  dependencies: ['hapi-i18n', 'hapi-context-app', 'vision', 'inert', 'h2o2']
}
