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
      var wDocs = docs.slice()
      
      var winning = wDocs.reduce(function(winning, doc) {
        return winning && resolveFun(doc, winning)
      }, wDocs.pop())

      if (!winning) throw({
        error: 'conflict_resolution_failed',
        reason: 'The conflict could not be resolve, resolveFun did not return a doc'
      })

      return docs.map(function(doc) {
        if (doc._rev === winning._rev) return winning

        return {
          _id: doc._id,
          _rev: doc._rev,
          _deleted: true
        }
      })
    })
    .then(function(docs) {
      return db.bulkDocs(docs)
    })
}
