import { Injectable } from '@angular/core';

@Injectable()
export class IndexedDBAngular {
    private utils: Utils;
    private dbWrapper: DbWrapper;

    createDb(dbName: string, version: number) {
        this.utils = new Utils();
        this.dbWrapper = new DbWrapper(dbName, version);
    }

    createStore(version: number, upgradeCallback: Function) {
        return new Promise<any>((resolve, reject) => {
            this.dbWrapper.dbVersion = version;
            let request = this.utils.indexedDB.open(this.dbWrapper.dbName, version);
            request.onsuccess = function (e) {
                this.dbWrapper.db = request.result;
                resolve();
            };

            request.onerror = function (e) {
                reject("IndexedDB error: " + (<any>e.target).errorCode);
            };

            request.onupgradeneeded = function (e) {
                upgradeCallback(e, this.dbWrapper.db);
            };
        });
    }

    getByKey(storeName: string, key: any) {
        return new Promise<any>((resolve, reject) => {
            this.dbWrapper.validateBeforeTransaction(storeName, reject);

            let transaction = this.dbWrapper.createTransaction({
                storeName: storeName,
                dbMode: this.utils.dbMode.readOnly,
                error: (e: Event) => {
                    reject(e);
                },
                complete: (e: Event) => {
                }
            }),
                objectStore = transaction.objectStore(storeName),
                request: IDBRequest;

            request = objectStore.get(key);
            request.onsuccess = function (event: Event) {
                resolve((<any>event.target).result);
            }
        });
    }

    getAll(storeName: string, keyRange?: IDBKeyRange, indexDetails?: IndexDetails) {
        return new Promise<any>((resolve, reject) => {
            this.dbWrapper.validateBeforeTransaction(storeName, reject);

            let transaction = this.dbWrapper.createTransaction({
                storeName: storeName,
                dbMode: this.utils.dbMode.readOnly,
                error: (e: Event) => {
                    reject(e);
                },
                complete: (e: Event) => {
                }
            }),
                objectStore = transaction.objectStore(storeName),
                result: Array<any> = [],
                request: IDBRequest;
            if (indexDetails) {
                let index = objectStore.index(indexDetails.indexName),
                    order = (indexDetails.order === 'desc') ? 'prev' : 'next';
                request = index.openCursor(keyRange, order);
            }
            else {
                request = objectStore.openCursor(keyRange);
            }

            request.onerror = function (e) {
                reject(e);
            };

            request.onsuccess = function (evt: Event) {
                let cursor = (<IDBOpenDBRequest>evt.target).result;
                if (cursor) {
                    result.push(cursor.value);
                    cursor["continue"]();
                } else {
                    resolve(result);
                }
            };
        });
    }

    add(storeName: string, value: any, key?: any) {
        return new Promise<any>((resolve, reject) => {
            this.dbWrapper.validateBeforeTransaction(storeName, reject);

            let transaction = this.dbWrapper.createTransaction({
                storeName: storeName,
                dbMode: this.utils.dbMode.readWrite,
                error: (e: Event) => {
                    reject(e);
                },
                complete: (e: Event) => {
                    resolve({ key: key, value: value });
                }
            }),
                objectStore = transaction.objectStore(storeName);

            var request = objectStore.add(value, key);
            request.onsuccess = (evt: any) => {
                key = evt.target.result;
            }
        });
    }

    update(storeName: string, value: any, key?: any) {
        return new Promise<any>((resolve, reject) => {
            this.dbWrapper.validateBeforeTransaction(storeName, reject);

            let transaction = this.dbWrapper.createTransaction({
                storeName: storeName,
                dbMode: this.utils.dbMode.readWrite,
                error: (e: Event) => {
                    reject(e);
                },
                complete: (e: Event) => {
                    resolve(value);
                },
                abort: (e: Event) => {
                    reject(e);
                }
            }),
                objectStore = transaction.objectStore(storeName);

            objectStore.put(value, key);
        });
    }

    delete(storeName: string, key: any) {
        return new Promise<any>((resolve, reject) => {
            this.dbWrapper.validateBeforeTransaction(storeName, reject);

            let transaction = this.dbWrapper.createTransaction({
                storeName: storeName,
                dbMode: this.utils.dbMode.readWrite,
                error: (e: Event) => {
                    reject(e);
                },
                complete: (e: Event) => {
                    resolve();
                },
                abort: (e: Event) => {
                    reject(e);
                }
            }),
                objectStore = transaction.objectStore(storeName);

            objectStore["delete"](key);
        });
    }

    openCursor(storeName: string, cursorCallback: (evt: Event) => void, keyRange?: IDBKeyRange) {
        return new Promise<any>((resolve, reject) => {
            this.dbWrapper.validateBeforeTransaction(storeName, reject);

            let transaction = this.dbWrapper.createTransaction({
                storeName: storeName,
                dbMode: this.utils.dbMode.readOnly,
                error: (e: Event) => {
                    reject(e);
                },
                complete: (e: Event) => {
                    resolve();
                },
                abort: (e: Event) => {
                    reject(e);
                }
            }),
                objectStore = transaction.objectStore(storeName),
                request = objectStore.openCursor(keyRange);

            request.onsuccess = (evt: Event) => {
                cursorCallback(evt);
                resolve();
            };
        });
    }

    clear(storeName: string) {
        return new Promise<any>((resolve, reject) => {
            this.dbWrapper.validateBeforeTransaction(storeName, reject);

            let transaction = this.dbWrapper.createTransaction({
                storeName: storeName,
                dbMode: this.utils.dbMode.readWrite,
                error: (e: Event) => {
                    reject(e);
                },
                complete: (e: Event) => {
                    resolve();
                },
                abort: (e: Event) => {
                    reject(e);
                }
            }),
                objectStore = transaction.objectStore(storeName);
            objectStore.clear();
            resolve();
        });
    }

    getByIndex(storeName: string, indexName: string, key: any) {
        return new Promise<any>((resolve, reject) => {
            this.dbWrapper.validateBeforeTransaction(storeName, reject);

            let transaction = this.dbWrapper.createTransaction({
                storeName: storeName,
                dbMode: this.utils.dbMode.readOnly,
                error: (e: Event) => {
                    reject(e);
                },
                abort: (e: Event) => {
                    reject(e);
                },
                complete: (e: Event) => {
                }
            }),
                objectStore = transaction.objectStore(storeName),
                index = objectStore.index(indexName),
                request = index.get(key);

            request.onsuccess = (event) => {
                resolve((<IDBOpenDBRequest>event.target).result);
            };
        });
    }
}

class Utils {
    dbMode: DbMode;
    indexedDB: IDBFactory;

    constructor() {
        this.indexedDB = window.indexedDB || (<any>window).mozIndexedDB || (<any>window).webkitIndexedDB || (<any>window).msIndexedDB;
        this.dbMode = {
            readOnly: "readonly",
            readWrite: "readwrite"
        };
    }
}

export interface IndexDetails {
    indexName: string;
    order: string;
}

interface DbMode {
    readOnly: string;
    readWrite: string;
}

class DbWrapper {
    dbName: string;
    dbVersion: number;
    db: IDBDatabase;

    constructor(dbName: string, version: number) {
        this.dbName = dbName;
        this.dbVersion = version || 1;
        this.db = null;
    }

    validateStoreName(storeName: string) {
        return this.db.objectStoreNames.contains(storeName);
    };

    validateBeforeTransaction(storeName: string, reject: Function) {
        if (!this.db) {
            reject('You need to use the createStore function to create a database before you query it!');
        }
        if (!this.validateStoreName(storeName)) {
            reject(('objectStore does not exists: ' + storeName));
        }
    }

    createTransaction(options: { storeName: string, dbMode: string, error: (e: Event) => any, complete: (e: Event) => any, abort?: (e: Event) => any }): IDBTransaction {
        let trans: IDBTransaction = this.db.transaction(options.storeName, options.dbMode);
        trans.onerror = options.error;
        trans.oncomplete = options.complete;
        trans.onabort = options.abort;
        return trans;
    }
}