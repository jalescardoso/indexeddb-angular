indexeddb-angular
==============

indexeddb-angular is a service that wraps IndexedDB database in an Angular service.
It exposes very simple promises API to enable the usage of IndexedDB without most of it plumbing.

Fork project https://github.com/gilf/angular2-indexeddb

Installation
------------

```
npm install indexeddb-angular --save
```

Usage
-----

Import the the `IndexedDBAngular` class as a dependency:

```js
private db = new IndexedDBAngular('myDb', 1);
constructor() { this.db.createStore(1, this.createCollections);}
createCollections(db) {
    db.currentTarget.result.createObjectStore('exampleCollection1');
    db.currentTarget.result.createObjectStore('exampleCollection2');
}
```
Use the APIs that the IndexedDBAngular service exposes to use indexeddb.
In the API the following functions:
* createStore(version, createCallback): initializes objectStore/s.
The first parameter is the version to upgrade the database and the second one is a callback the will handle the creation of objectStores for that version.
**createStore** returns a promise that is resolved when the store updated or rejected if an error occurred.

* getByKey(storeName, key): returns the object that is stored in the objectStore by its key.
The first parameter is the store name to query and the second one is the object's key.
**getByKey** returns a promise that is resolved when we have the object or rejected if an error occurred.

Usage example:

```js
db.getByKey('people', 1).then((person) => {
    console.log(person);
}, (error) => {
    console.log(error);
});
```

* getAll(storeName, keyRange, indexDetails): returns an array of all the items in the given objectStore.
The first parameter is the store name to query.
The second parameter is an optional IDBKeyRange object.
The third parameter is an index details which must include index name and an optional order parameter.
**getAll** returns a promise that is resolved when we have the array of items or rejected if an error occurred.

Usage example:

```js
db.getAll('people').then((people) => {
    console.log(people);
}, (error) => {
    console.log(people);
});
```

* getByIndex(storeName, indexName, key): returns an stored item using an objectStore's index.
The first parameter is the store name to query, the second parameter is the index and third parameter is the item to query.
**getByIndex** returns a promise that is resolved when the item successfully returned or rejected if an error occurred.

Usage example:

```js
db.getByIndex('people', 'name', 'Dave').then((person) => {
    console.log(person);
}, (error) => {
    console.log(error);
});
```

* add(storeName, value, key): Adds to the given objectStore the key and value pair.
The first parameter is the store name to modify, the second parameter is the value and the third parameter is the key (if not auto-generated).
**add** returns a promise that is resolved when the value was added or rejected if an error occurred.

Usage example (add without a key):

```js
db.add('people', { name: 'name', email: 'email' }).then(() => {
    // Do something after the value was added
}, (error) => {
    console.log(error);
});
```
In the previous example I'm using undefined as the key because the key is configured in the objectStore as auto-generated.

* update(storeName, value, key?): Updates the given value in the objectStore.
The first parameter is the store name to modify, the second parameter is the value to update and the third parameter is the key (if there is no key don't provide it).
**update** returns a promise that is resolved when the value was updated or rejected if an error occurred.

Usage example (update without a key):

```js
db.update('people', { id: 3, name: 'name', email: 'email' }).then(() => {
    // Do something after update
}, (error) => {
    console.log(error);
});
```

* remove(storeName, key): Removes the object that correspond with the key from the objectStore.
The first parameter is the store name to modify and the second parameter is the key to remove.
**remove** returns a promise that is resolved when the value was removed or rejected if an error occurred.

Usage example:

```js
db.remove('people', 3).then(() => {
    // Do something after remove
}, (error) => {
    console.log(error);
});
```

* openCursor(storeName, cursorCallback, keyRange): opens an objectStore cursor to enable iterating on the objectStore.
The first parameter is the store name, the second parameter is a callback function to run when the cursor succeeds to be opened and the third parameter is optional IDBKeyRange object.
**openCursor** returns a promise that is resolved when the cursor finishes running or rejected if an error occurred.

Usage example:

```js
db.openCursor('people', (evt) => {
    var cursor = evt.target.result;
    if(cursor) {
        console.log(cursor.value);
        cursor.continue();
    } else {
        console.log('Entries all displayed.');
    }
}, IDBKeyRange.bound("A", "F"));

```

* clear(storeName): clears all the data in an objectStore.
The first parameter is the store name to clear.
**clear** returns a promise that is resolved when the objectStore was cleared or rejected if an error occurred.

Usage example:

```js
db.clear('people').then(() => {
    // Do something after clear
}, (error) => {
    console.log(error);
});

```

License
----

Released under the terms of the [MIT License](LICENSE).
