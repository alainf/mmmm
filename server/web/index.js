'use strict'

// npm
const url = require('url')
const Wreck = require('wreck')
const _ = require('lodash')

const sections = require('../../data/list1.json')
const sujets = require('../../data/list2.json')
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

  const mapperAccueil = (request, callback) => {
    // descending|reverse?
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
          if (doc['thumb-beside']) {
            if (doc.citation) {
              if (doc['thumb-beside'] === 'headline') {
                if (doc['thumb-float'] === 'left') {
                  tpl = 'article2a'
                } else if (doc['thumb-float'] === 'right') {
                  tpl = 'article2b'
                }
              }
              if (!tpl) { console.error('NO-TPL#1', doc['thumb-beside'], doc['thumb-float']) }
            } else {
              if (doc['thumb-beside'] === 'content') {
                if (doc['thumb-float'] === 'left') {
                  tpl = 'article1a'
                } else if (doc['thumb-float'] === 'right') {
                  tpl = 'article1b'
                }
                if (!tpl) { console.error('NO-TPL#2') }
              } else if (doc['thumb-beside'] === 'headline') {
                if (doc['thumb-float'] === 'left') {
                  tpl = 'article3a'
                } else if (doc['thumb-float'] === 'right') {
                  tpl = 'article3b'
                }
              }
              if (!tpl) { console.error('NO-TPL#3') }
            }
          } else {
            if (doc.direction) {
              tpl = 'article5'
            } else {
              tpl = 'article4'
            }
          }
          doc.tpl = tpl
          if (!tpl) {
            console.error('NO-TPL')
            // console.error('NO-TPL', JSON.stringify(doc, null, ' '))
          }
          return doc
        })

      reply.view('accueil', {
        rows: rows,
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
    handler: {
      proxy: {
        passThrough: true,
        mapUri: mapperAccueil,
        onResponse: responderAccueil
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
