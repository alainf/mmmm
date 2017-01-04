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

  const mapperDetail = (request, callback) => {
    // console.log('DB:', dbUrl)
    // console.log('ID:', request.params.pageId)
    const u = dbUrl + '/' + request.params.pageId // .replace(/^test-/, '/lead-')
    // console.log('U:', u)
    callback(null, u, { accept: 'application/json' })
  }

  const responderDetail = (err, res, request, reply, settings, ttl) => {
    // console.log('ERR-X:', err)
    if (err) { return reply(err) } // FIXME: how to test?
    // console.log('RES:', Object.keys(res))
    // console.log('RES.url:', res.url)
    // console.log('RES.statusCode:', res.statusCode)
    // console.log('RES.statusMessage:', res.statusMessage)
    if (res.statusCode >= 400) { return reply(res.statusMessage).code(res.statusCode) }
    Wreck.read(res, { json: true }, (err, payload) => {
      // console.log('ERR-Y:', err)
      if (err) { return reply(err) } // FIXME: how to test?
      _.forEach(payload, (v, k, o) => {
        if (k[0] === '_') { return }
        const cc = _.camelCase(k)
        if (cc !== k) { o[cc] = v }
      })

      // console.log('DOC:', payload)
      reply.view('detail', { doc: payload })
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
    // reply('oh la la'.split(' '))
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

    // console.log('BLA:', request.pre.bla)
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

  server.route({
    method: 'GET',
    // path: '/{languageCode}/detail-ext/{pageId}',
    path: '/{languageCode}/detail/{pageId}',
    handler: {
      // view: 'detail-ext-real'
      proxy: {
        passThrough: true,
        mapUri: mapperDetail,
        onResponse: responderDetail
      }
    }
  })

/*
  server.route({
    method: 'GET',
    path: '/{languageCode}/detail-int/{pageId}',
    handler: {
      // view: 'detail-int-real'
      proxy: {
        passThrough: true,
        mapUri: mapperDetail,
        onResponse: responderDetail
      }
    }
  })
*/

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
