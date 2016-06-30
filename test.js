var test = require('tape')
var PouchDB = require('pouchdb')
var memdown = require('memdown')

PouchDB.plugin(require('./'))

test('resolve conflict by choosing', function(t) {
  var resolveFun = function(a, b) {
    return a.foo === 'bar' ? a : b
  }

  var db = new PouchDB('test-one', { db: memdown })

  db.bulkDocs({
      docs: [
        { _id: 'mydoc', _rev: '1-one', foo: 'bar' },
        { _id: 'mydoc', _rev: '1-two', foo: 'baz' },
        { _id: 'mydoc', _rev: '1-three', foo: 'boa' }
      ],
      new_edits: false
    })
    .then(function(response) {
      return db.get('mydoc', { conflicts: true })
    })
    .then(function(doc) {
      return db.resolveConflicts(doc, resolveFun)
    })
    .then(function() {
      return db.get('mydoc', { conflicts: true })
    })
    .then(function(doc) {
      t.notOk('_conflicts' in doc, 'doc has no _conflicts')
      t.equals(doc.foo, 'bar', 'correct doc choosen')
      t.equals(doc._rev, '1-one', 'no additional rev')
      t.end()
    })
})

test('resolve conflict by merging', function(t) {
  var resolveFun = function(a, b) {
    a.foo += b.foo

    return a
  }

  var db = new PouchDB('test-two', { db: memdown })

  db.bulkDocs({
      docs: [
        { _id: 'mydoc', _rev: '1-one', foo: 'bar' },
        { _id: 'mydoc', _rev: '1-two', foo: 'baz' }
      ],
      new_edits: false
    })
    .then(function(response) {
      return db.get('mydoc', { conflicts: true })
    })
    .then(function(doc) {
      return db.resolveConflicts(doc, resolveFun)
    })
    .then(function() {
      return db.get('mydoc', { conflicts: true })
    })
    .then(function(doc) {
      t.notOk('_conflicts' in doc, 'doc has no _conflicts')
      t.equals(doc.foo, 'barbaz', 'correct doc choosen')
      t.end()
    })
})

test('don not resolve conflict', function(t) {
  var resolveFun = function() {
    return
  }

  var db = new PouchDB('test-three', { db: memdown })

  db.bulkDocs({
      docs: [
        { _id: 'mydoc', _rev: '1-one', foo: 'bar' },
        { _id: 'mydoc', _rev: '1-two', foo: 'baz' }
      ],
      new_edits: false
    })
    .then(function(response) {
      return db.get('mydoc', { conflicts: true })
    })
    .then(function(doc) {
      return db.resolveConflicts(doc, resolveFun)
    })
    .catch(function(error) {
      t.equals(error.error, 'conflict_resolution_failed', 'conflicts resolution failed')
      t.end()
    })
})

test('complex conflict resolving', function(t) {
  var resolveFun = function(a, b) {
    if ('foo' in a && 'foo' in b) return
    
    if ('foo' in a) return a
    if ('foo' in b) return b
    
    a.foo = 'bar'
    return a
  }

  var db = new PouchDB('test-four', { db: memdown })

  db.bulkDocs({
      docs: [
        { _id: 'mydoc', _rev: '1-one', foo: 'bar' },
        { _id: 'mydoc', _rev: '1-two', bar: 'baz' }
      ],
      new_edits: false
    })
    .then(function(response) {
      return db.get('mydoc', { conflicts: true })
    })
    .then(function(doc) {
      return db.resolveConflicts(doc, resolveFun)
    })
    .then(function() {
      return db.get('mydoc', { conflicts: true })
    })
    .then(function(doc) {
      t.notOk('_conflicts' in doc, 'doc has no _conflicts')
      t.equals(doc.foo, 'bar', 'correct doc choosen')
      t.end()
    })
    .catch(function(e) { console.log(e) })
})

