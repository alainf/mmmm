'use strict'

exports.register = function (server, options, next) {
  const sections = require('../../data/list1.json')
  const sujets = require('../../data/list2.json')
  const sujets2 = require('../../data/sujets-Agriculture.json')
  const sections2 = require('../../data/sections-Entreprise.json')
  const sectionsGr1 = require('../../data/sectionsGr1.json')
  const sujetsGr1 = require('../../data/sujetsGr1.json')
  const pages = [
    'abonnezVous',
    'agenda',
    'aider',
    'apropos',
    'articles',
    'bottin',
    'enConstruction',
    'faq',
    'favoris',
    'index',
    'meConnecter',
    'meDeconnecter',
    'moi',
    'page-ext',
    'page-int',
    'resultats'
  ]

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
    path: '/{languageCode}/',
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
    path: '/{languageCode}/accueil',
    handler: {
      view: {
        template: 'accueil',
        context: { lesSections: sections.items, lesSujets: sujets.items }
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
    path: '/{languageCode}/monJournal',
    handler: {
      view: {
        template: 'monJournal',
        context: { lesSections: sectionsGr1.items, lesSujets: sujetsGr1.items }
      }
    }
  })

  server.route({
    method: 'GET',
    path: '/{languageCode}/maThese',
    handler: {
      view: {
        template: 'maThese',
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
    path: '/',
    handler: { view: 'pick-language' }
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
  dependencies: ['hapi-i18n', 'hapi-context-app', 'vision', 'inert']
}
