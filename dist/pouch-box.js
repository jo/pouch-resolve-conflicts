(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}]},{},[1]);
