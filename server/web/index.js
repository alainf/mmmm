'use strict'

// core
const url = require('url')

// npm
const Wreck = require('wreck')
const _ = require('lodash')
const got = require('got')

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
  const dbImp = url.parse(options.db.url)
  dbImp.pathname = options.db.name
  dbImp.auth = [options.db.reader, options.db.readerPassword].join(':')
  const dbUrl = url.format(dbImp)

  const fetchAllParents = (id2, l) => new Promise((resolve, reject) => {
    if (!l) { l = 'fr' }
    // console.log('fetchAllParents', id2, l)
    const parents = []
    const doOne = (id) => {
      // console.log('DOONE', id)
      return got([options.db.url, options.db.name, id].join('/'), { auth: dbImp.auth, json: true })
        .then((x) => {
          let sousType
          switch (x.body['sous-type']) {
            case 'sections':
              sousType = 'section'
              break

            case 'sujets':
              sousType = 'sujet'
              break

            default:
              sousType = x.body['sous-type']
          }
          // console.log('SOUSTYPE', sousType)
          parents.push({
            id: x.body._id,
            nom: (x.body.nomLangues[l] && x.body.nomLangues[l][0]) || x.body.nomLangues.fr[0],
            href: '/' + [l, sousType, x.body._id].join('/')
          })
          if (x.body.parent) {
            doOne(x.body.parent)
          } else {
            parents.push(sousType)
            parents.push(x.body.type)
            // console.log('PARENTS', parents)
            resolve(parents.reverse())
          }
        })
        .catch((e) => {
          // console.log('ERRRR', e)
          return reject(e)
        })
    }
    doOne(id2)
  })

/*
  fetchAllParents('terme-2015-12-06-16-26-33-86966231633', 'en')
    .then((p) => {
      console.log('Parents:', JSON.stringify(p, null, '  '))
    })
*/

  const mapperDetail666 = (request, callback) => {
    const sk = [request.params.pageId]
    const ek = [request.params.pageId, {}]
    const u = dbUrl + '/_design/app/_view/subs?startkey=' + JSON.stringify(sk) + '&endkey=' + JSON.stringify(ek) + '&include_docs=true&reduce=false'
    callback(null, u, { accept: 'application/json' })
  }

  const responderDetail666 = (err, res, request, reply, settings, ttl) => {
    // console.log('ERR-X:', err)
    /* $lab:coverage:off$ */
    if (err) { return reply(err) } // FIXME: how to test?
    if (res.statusCode >= 400) { return reply(res.statusMessage).code(res.statusCode) }
    /* $lab:coverage:on$ */
    Wreck.read(res, { json: true }, (err, payload) => {
      // console.log('ERR-Y:', err)
      /* $lab:coverage:off$ */
      if (err) { return reply(err) } // FIXME: how to test?
      /* $lab:coverage:on$ */
      _.forEach(payload, (v, k, o) => {
        if (k[0] === '_') { return }
        const cc = _.camelCase(k)
        if (cc !== k) { o[cc] = v }
      })

      const z = _.groupBy(payload.rows, (row) => _.camelCase(row.key[1]))
      for (let r in z) { z[r] = z[r].map((d) => d.doc) }
      reply(z)
    })
  }

  const mapperDetail = (request, callback) => {
    const u = dbUrl + '/' + request.params.pageId
    callback(null, u, { accept: 'application/json' })
  }

  const responderDetail = (err, res, request, reply, settings, ttl) => {
    // console.log('ERR-X:', err)
    /* $lab:coverage:off$ */
    if (err) { return reply(err) } // FIXME: how to test?
    if (res.statusCode >= 400) { return reply(res.statusMessage).code(res.statusCode) }
    /* $lab:coverage:on$ */
    Wreck.read(res, { json: true }, (err, payload) => {
      // console.log('ERR-Y:', err)
      /* $lab:coverage:off$ */
      if (err) { return reply(err) } // FIXME: how to test?
      /* $lab:coverage:on$ */
      _.forEach(payload, (v, k, o) => {
        if (k[0] === '_') { return }
        if (k === 'voir-aussi' && typeof v === 'string') {
          v = [v]
        }
        const cc = _.camelCase(k)
        if (cc !== k) { o[cc] = v }
      })
      reply(payload)
    })
  }

// https://monphd.cloudant.com/machina/_design/app/_view/pertinence?limit=20&reduce=false

  const mapperAccueilPaged = (request, callback) => {
    callback(
      null,
      dbUrl + `/_design/app/_view/pertinence?skip=${(request.params.n || 1) * 4 - 4}&startkey=0&limit=4&include_docs=true`,
      { accept: 'application/json' }
    )
  }

  const mapperSujetPaged = (request, callback) => {
    const w = dbUrl + `/_design/app/_view/parsujet?skip=${(request.params.n || 1) * 4 - 4}&startkey=${JSON.stringify([request.params.sujetId])}&endkey=${JSON.stringify([request.params.sujetId, {}])}&limit=4&include_docs=true&reduce=false`
    callback(
      null,
      w,
      { accept: 'application/json' }
    )
  }

  const mapperSectionPaged = (request, callback) => {
    const w = dbUrl + `/_design/app/_view/parsection?skip=${(request.params.n || 1) * 4 - 4}&startkey=${JSON.stringify([request.params.sectionId])}&endkey=${JSON.stringify([request.params.sectionId, {}])}&limit=4&include_docs=true&reduce=false`
    callback(
      null,
      w,
      { accept: 'application/json' }
    )
  }

  const mapperSection = (request, callback) => {
    const u = dbUrl + `/_design/app/_view/nomsection?startkey=${JSON.stringify([request.params.sectionId])}&endkey=${JSON.stringify([request.params.sectionId, {}])}&reduce=false`
    callback(
      null,
      u,
      { accept: 'application/json' }
    )
  }

  const mapperPagesSection = (request, callback) => {
    const u = dbUrl + `/_design/app/_view/parsection?startkey=${JSON.stringify([request.params.sectionId])}&endkey=${JSON.stringify([request.params.sectionId, {}])}&group_level=1`
    callback(
      null,
      u,
      { accept: 'application/json' }
    )
  }

  const mapperPagesSujet = (request, callback) => {
    const u = dbUrl + `/_design/app/_view/parsujet?startkey=${JSON.stringify([request.params.sujetId])}&endkey=${JSON.stringify([request.params.sujetId, {}])}&group_level=1`
    callback(
      null,
      u,
      { accept: 'application/json' }
    )
  }

  const responderPagesSujet = (err, res, request, reply, settings, ttl) => {
    /* $lab:coverage:off$ */
    if (err) { return reply(err) } // FIXME: how to test?
    if (res.statusCode >= 400) { return reply(res.statusMessage).code(res.statusCode) }
    /* $lab:coverage:on$ */
    Wreck.read(res, { json: true }, (err, payload) => {
      /* $lab:coverage:off$ */
      if (err) { return reply(err) } // FIXME: how to test?
      /* $lab:coverage:on$ */
      reply((payload.rows && payload.rows[0] && payload.rows[0].value) || 0)
    })
  }

  const mapperSujet = (request, callback) => {
    const u = dbUrl + `/_design/app/_view/nomsujet?startkey=${JSON.stringify([request.params.sujetId])}&endkey=${JSON.stringify([request.params.sujetId, {}])}&reduce=false`
    callback(
      null,
      u,
      { accept: 'application/json' }
    )
  }

  const responderSujet = (err, res, request, reply, settings, ttl) => {
    /* $lab:coverage:off$ */
    if (err) { return reply(err) } // FIXME: how to test?
    if (res.statusCode >= 400) { return reply(res.statusMessage).code(res.statusCode) }
    /* $lab:coverage:on$ */
    Wreck.read(res, { json: true }, (err, payload) => {
      /* $lab:coverage:off$ */
      if (err) { return reply(err) } // FIXME: how to test?
      /* $lab:coverage:on$ */
      const ret = {}
      payload.rows.forEach((row) => {
        ret[row.key[1]] = row.value
      })
      reply(ret)
    })
  }

  const firstArrayString = (aors) => {
    // console.log('AORS:', aors)
    if (typeof aors === 'string') { return aors }
    if (typeof aors === 'object' && aors.length) { return aors[0] }
    // throw new Error('Bad ArrayOrString')
    return false
  }

  const responderTopSections = (err, res, request, reply, settings, ttl) => {
    /* $lab:coverage:off$ */
    if (err) { return reply(err) } // FIXME: how to test?
    if (res.statusCode >= 400) { return reply(res.statusMessage).code(res.statusCode) }
    /* $lab:coverage:on$ */
    Wreck.read(res, { json: true }, (err, payload) => {
      /* $lab:coverage:off$ */
      if (err) { return reply(err) } // FIXME: how to test?
      /* $lab:coverage:on$ */
      reply(payload.rows.map((row) => {
        const types = {
          sections: 'section',
          sujets: 'sujet'
        }
        const sousType = types[row.key[0]]
        // console.log('ROW:', row)
        return {
          id: row.id,
          sousType: sousType,
          href: '/' + [request.locale, sousType, row.id].join('/'),
          nom: firstArrayString(row.value[request.locale]) || firstArrayString(row.value.fr)
        }
      }))
    })
  }

  const responderBla = (err, res, request, reply, settings, ttl) => {
    /* $lab:coverage:off$ */
    if (err) { return reply(err) } // FIXME: how to test?
    if (res.statusCode >= 400) { return reply(res.statusMessage).code(res.statusCode) }
    /* $lab:coverage:on$ */
    Wreck.read(res, { json: true }, (err, payload) => {
      /* $lab:coverage:off$ */
      if (err) { return reply(err) } // FIXME: how to test?
      /* $lab:coverage:on$ */
      reply(payload.rows.map((row) => row.doc))
    })
  }

  const mapperSousSujets = (request, callback) => {
    callback(
      null,
      dbUrl + `/_design/app/_view/enfants?reduce=false&include_docs=true&startkey=${JSON.stringify(['sujets', request.params.sujetId])}&endkey=${JSON.stringify(['sujets', request.params.sujetId, {}])}`,
      { accept: 'application/json' }
    )
  }

  const mapperSousSections = (request, callback) => {
    callback(
      null,
      dbUrl + `/_design/app/_view/enfants?reduce=false&include_docs=true&startkey=${JSON.stringify(['sections', request.params.sectionId])}&endkey=${JSON.stringify(['sections', request.params.sectionId, {}])}`,
      { accept: 'application/json' }
    )
  }

  const responderSousSections = (err, res, request, reply, settings, ttl) => {
    /* $lab:coverage:off$ */
    if (err) { return reply(err) } // FIXME: how to test?
    if (res.statusCode >= 400) { return reply(res.statusMessage).code(res.statusCode) }
    /* $lab:coverage:on$ */
    Wreck.read(res, { json: true }, (err, payload) => {
      /* $lab:coverage:off$ */
      if (err) { return reply(err) } // FIXME: how to test?
      /* $lab:coverage:on$ */
      reply(payload.rows.map((row) => {
        const types = {
          sections: 'section',
          sujets: 'sujet'
        }
        const sousType = types[row.key[0]]
        return row.doc ? {
          id: row.doc._id,
          sousType: sousType,
          href: '/' + [request.locale, sousType, row.doc._id].join('/'),
          nom: firstArrayString(row.doc.nomLangues[request.locale]) || firstArrayString(row.doc.nomLangues.fr)
        } : {
          id: row.value._id,
          sousType: sousType,
          href: '/' + [request.locale, sousType, row.value._id].join('/'),
          nom: row.value._id
        }
      }))
    })
  }

  const mapperTopSections = (request, callback) => {
    callback(
      null,
      dbUrl + '/_design/app/_view/toplevels?reduce=false&include_docs=true&startkey=[%22sections%22]&endkey=[%22sections%22,{}]',
      { accept: 'application/json' }
    )
  }

  const mapperTopSujets = (request, callback) => {
    callback(
      null,
      dbUrl + '/_design/app/_view/toplevels?reduce=false&include_docs=true&startkey=[%22sujets%22]&endkey=[%22sujets%22,{}]',
      { accept: 'application/json' }
    )
  }

  const mapperBla = (request, callback) => {
    callback(
      null,
      dbUrl + '/_design/app/_view/breves?include_docs=true&limit=4',
      { accept: 'application/json' }
    )
  }

  const nomSection = function (request, reply) {
    reply.proxy({
      mapUri: mapperSection,
      onResponse: responderSujet
    })
  }

  const nomSujet = function (request, reply) {
    reply.proxy({
      mapUri: mapperSujet,
      onResponse: responderSujet
    })
  }

  const pagesSection = function (request, reply) {
    reply.proxy({
      mapUri: mapperPagesSection,
      onResponse: responderPagesSujet
    })
  }

  const pagesSujet = function (request, reply) {
    reply.proxy({
      mapUri: mapperPagesSujet,
      onResponse: responderPagesSujet
    })
  }

  const topSections = function (request, reply) {
    reply.proxy({
      mapUri: mapperTopSections,
      onResponse: responderTopSections
    })
  }

  const sousSections = function (request, reply) {
    reply.proxy({
      mapUri: mapperSousSections,
      onResponse: responderSousSections
    })
  }

  const sousSujets = function (request, reply) {
    reply.proxy({
      mapUri: mapperSousSujets,
      onResponse: responderSousSections
    })
  }

  const topSujets = function (request, reply) {
    reply.proxy({
      mapUri: mapperTopSujets,
      onResponse: responderTopSections
    })
  }

  const bla = function (request, reply) {
    reply.proxy({
      mapUri: mapperBla,
      onResponse: responderBla
    })
  }

  const responderAccueil = (err, res, request, reply, settings, ttl) => {
    /* $lab:coverage:off$ */
    if (err) { return reply(err) } // FIXME: how to test?
    if (res.statusCode >= 400) { return reply(res.statusMessage).code(res.statusCode) }
    /* $lab:coverage:on$ */

    Wreck.read(res, { json: true }, (err, payload) => {
      /* $lab:coverage:off$ */
      if (err) { return reply(err) } // FIXME: how to test?
      /* $lab:coverage:on$ */

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

      const pageInfo = { }

      if (request.pre.allParents) {
        pageInfo.allParents = request.pre.allParents
      }

      if (request.pre.topSections) {
        pageInfo.topSections = request.pre.topSections
      }

      if (request.pre.topSujets) {
        pageInfo.topSujets = request.pre.topSujets
      }

      if (request.pre.nomSection) {
        pageInfo.title2 = request.pre.nomSection[request.locale] || request.pre.nomSection['fr']
        pageInfo.title = request.__('PhdAdmin Section %s', pageInfo.title2)
      } else if (request.pre.nomSujet) {
        pageInfo.title2 = request.pre.nomSujet[request.locale] || request.pre.nomSujet['fr']
        pageInfo.title = request.__('PhdAdmin Sujet %s', pageInfo.title2)
      } else {
        pageInfo.title = request.__('Accueil du site PhdAdmin')
      }

      let lastPage
      // console.log('PAYLOAD:', payload)
      if (request.pre.nPages) {
        lastPage = Math.ceil(request.pre.nPages / 4)
      } else {
        lastPage = Math.ceil(payload.total_rows / 4)
      }

      reply.view('accueil', {
        lesSections: sections.items,
        lesSujets: sujets.items,
        pageInfo: pageInfo,
        breves: request.pre.bla,
        rows: rows,
        lastPage: lastPage,
        // lastPage: Math.ceil(payload.rows.length / 4),
        page: request.params.n ? parseInt(request.params.n, 10) : 1
      })
    })
  }

  const thing1 = function (request, reply) {
    reply.proxy({
      // passThrough: true,
      mapUri: mapperDetail,
      onResponse: responderDetail
    })
  }

  const thing2 = function (request, reply) {
    reply.proxy({
      // passThrough: true,
      mapUri: mapperDetail666,
      onResponse: responderDetail666
    })
  }

  const allParents = function (request, reply) {
    // console.log('PARAMS', request.params)
    const what = request.params.sujetId || request.params.sectionId
    if (!what) { return reply(false) }
    // console.log('what:', what)
    const p = fetchAllParents(what, request.params.languageCode)
/*
      .then((a) => {
        console.log('A:', a)
        return a
      })
*/
      .catch((e) => {
        return false
      })
    reply(p)
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
        for (let r in request.pre.thing2) {
          request.pre.thing2[r] = request.pre.thing2[r].filter((x) => x)
          if (request.pre.thing2[r].length) {
            request.pre.thing1[r] = request.pre.thing2[r]
          }
        }

        reply.view('detail', { doc: request.pre.thing1 })
      }
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

/*
topSections
topSujets
*/

  server.route({
    method: 'GET',
    path: '/{languageCode}/accueil/{n?}',
    config: {
      pre: [
        {
          method: topSections,
          assign: 'topSections'
        },
        {
          method: topSujets,
          assign: 'topSujets'
        },
        {
          method: bla,
          assign: 'bla'
        }
      ],
      handler: {
        proxy: {
          // passThrough: true,
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
    path: '/{languageCode}/sujet/{sujetId}/{n?}',
    config: {
      pre: [
        {
          method: allParents,
          assign: 'allParents'
        },
        {
          method: sousSujets,
          assign: 'topSujets'
        },
        {
          method: topSections,
          assign: 'topSections'
        },
        {
          method: pagesSujet,
          assign: 'nPages'
        },
        {
          method: nomSujet,
          assign: 'nomSujet'
        },
        {
          method: bla,
          assign: 'bla'
        }
      ],
      handler: {
        proxy: {
          // passThrough: true,
          mapUri: mapperSujetPaged,
          onResponse: responderAccueil
        }
      }
    }
  })

  server.route({
    method: 'GET',
    path: '/{languageCode}/section/{sectionId}/{n?}',
    config: {
      pre: [
        {
          method: allParents,
          assign: 'allParents'
        },
        {
          method: sousSections,
          assign: 'topSections'
        },
        {
          method: topSujets,
          assign: 'topSujets'
        },
        {
          method: pagesSection,
          assign: 'nPages'
        },
        {
          method: nomSection,
          assign: 'nomSection'
        },
        {
          method: bla,
          assign: 'bla'
        }
      ],
      handler: {
        proxy: {
          // passThrough: true,
          mapUri: mapperSectionPaged,
          onResponse: responderAccueil
        }
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
