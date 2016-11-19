function(doc) {
  const ids = doc._id.split('-')
  if (ids[0] !== 'lead') { return }
  ids[0] = doc.pertinence
  emit(ids, {
    path: doc.path,
    titre: doc.titre,
    soustitre: doc.soustitre,
    contenu: doc.contenu,
    img: doc.thumb.src,
    citation: doc.citation
  })
}
