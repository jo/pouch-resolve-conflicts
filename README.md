# pouch-resolve-conflicts
Assist in PouchDB conflict resolving.

[![Build Status](https://travis-ci.org/jo/pouch-resolve-conflicts.svg?branch=master)](https://travis-ci.org/jo/pouch-resolve-conflicts)

## Installation
pouch-resolve-conflicts is [hosted on npm](https://www.npmjs.com/package/pouch-resolve-conflicts).

### Node
Install via `npm install pouch-resolve-conflicts` 

```js
var PouchDB = require('pouchdb')
PouchDB.plugin(require('pouch-resolve-conflicts'))
```

### Browser
Use the [browserified build](./dist/pouch-resolve-conflicts.js).

```html
<script src="pouchdb.js"></script>
<script src="pouch-resolve-conflicts.js"></script>
```


## Usage
```js
var PouchDB = require('pouchdb')
PouchDB.plugin(require('pouch-resolve-conflicts'))

function resolveFun(a, b) {
  // cannot merge: return nothing
  if ('foo' in a && 'foo' in b) return
  
  // return one of the docs
  if ('foo' in a) return a
  if ('foo' in b) return b
  
  // return changed doc
  a.foo = 'bar'
  return a
}

var db = new PouchDB('mydb')

db
  // Lets have a conflict
  .bulkDocs({
    docs: [
      { _id: 'mydoc', _rev: '1-one', foo: 'bar' },
      { _id: 'mydoc', _rev: '1-two', bar: 'baz' }
    ],
    new_edits: false
  })
  // Query doc with `conflicts: true`
  .then(function(response) {
    return db.get('mydoc', { conflicts: true })
  })
  // And resolve it
  .then(function(doc) {
    return db.resolveConflicts(doc, resolveFun)
  })
```

## Tests

```sh
npm test
```
