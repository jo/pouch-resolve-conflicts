# couch-resolve-conflicts
Assist in CouchDB conflict resolving.

## Usage
```js
var resolve = require('couch-resolve-conflicts')
var nano = require('nano')('http://localhost:5984/mydb')

function merge(a, b) {
  // cannot merge: return nothing
  if (a.foo && b.foo) return
  
  // return one of the docs
  if (a.foo) return a
  if (b.foo) return b
  
  // return changed doc
  a.foo = 'bar'
  return a
}

// assuming doc has `_conflicts` property (eg. has been queried with `conflicts:true`):
// {
//   _id: 'mydoc',
//  _rev: '2-asd',
//  foo: 'bar',
//  _conflicts: [
//    '2-dfg',
//  ]
// }

resolve(doc, merge, function(err, docs) {
  nano.bulk(docs, function(err, result) {
    // conflict resolution saved.
  })
})
```

## Tests

```sh
npm test
```
