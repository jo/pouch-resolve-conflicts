exports.resolveConflicts = function(doc, resolveFun) {
  var db = this

  return db
    .get(doc._id, {
      open_revs: doc._conflicts
    })
    .then(function(responses) {
      return responses
        .filter(function(response) {
          return 'ok' in response
        })
        .map(function(response) {
          return response.ok
        })
    })
    .then(function(conflicts) {
      return conflicts.concat(doc)
    })
    .then(function(docs) {
      var wDocs = JSON.parse(JSON.stringify(docs))

      var promise = wDocs.reduce(function(promise, doc) {
        return promise.then(function(winning) {
          return winning && resolveFun(doc, winning);
        })
      }, Promise.resolve(wDocs.pop()))

      return promise.then(function(winning) {
        if (!winning) throw({
          error: 'conflict_resolution_failed',
          reason: 'The conflict could not be resolve, resolveFun did not return a doc'
        })

        return docs.filter(function(doc) {
          return doc._rev !== winning._rev || JSON.stringify(doc) !== JSON.stringify(winning)
        })
        .map(function(doc) {
          if (doc._rev === winning._rev) return winning

          return {
            _id: doc._id,
            _rev: doc._rev,
            _deleted: true
          }
        })
      })
    })
    .then(function(docs) {
      return db.bulkDocs(docs)
    })
}

if (typeof window !== 'undefined' && window.PouchDB) {
  window.PouchDB.plugin(module.exports)
}
