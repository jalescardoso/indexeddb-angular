import { Injectable } from '@angular/core';
import { DbWrapper, Utils, IndexDetails } from './'

@Injectable()
export class IndexedDBAngular {
    private utils = new Utils();
    private dbWrapper: DbWrapper;

    constructor(dbName: string, version: number) {
        this.dbWrapper = new DbWrapper(dbName, version);
    }

    createStore(version: number, upgradeCallback: Function): Promise<any> {
        let self = this,
            promise = new Promise<any>((resolve, reject) => {
                this.dbWrapper.dbVersion = version;
                let request: IDBOpenDBRequest = this.utils.indexedDB.open(this.dbWrapper.dbName, version);
                request.onsuccess = function (e) {
                    self.dbWrapper.db = request.result;
                    resolve();
                };

                request.onerror = function (e) {
                    reject("IndexedDB error: " + (<any>e.target).errorCode);
                };

                request.onupgradeneeded = function (e) {
                    upgradeCallback(e, self.dbWrapper.db);
                };
            });

        return promise;
    }

    getByKey(storeName: string, key: any): Promise<any> {
        let self = this;
        let promise = new Promise<any>((resolve, reject) => {
            self.dbWrapper.validateBeforeTransaction(storeName, reject);

            let transaction = self.dbWrapper.createTransaction({
                storeName: storeName,
                dbMode: self.utils.dbMode.readOnly,
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

        return promise;
    }

    getAll(storeName: string, keyRange?: IDBKeyRange, indexDetails?: IndexDetails): Promise<any> {
        let self = this;
        let promise = new Promise<any>((resolve, reject) => {
            self.dbWrapper.validateBeforeTransaction(storeName, reject);

            let transaction = self.dbWrapper.createTransaction({
                storeName: storeName,
                dbMode: self.utils.dbMode.readOnly,
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

        return promise;
    }

    add(storeName: string, value: any, key?: any): Promise<any> {
        let self = this;
        let promise = new Promise<any>((resolve, reject) => {
            self.dbWrapper.validateBeforeTransaction(storeName, reject);

            let transaction = self.dbWrapper.createTransaction({
                storeName: storeName,
                dbMode: self.utils.dbMode.readWrite,
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

        return promise;
    }

    update(storeName: string, value: any, key?: any): Promise<any> {
        let self = this;
        let promise = new Promise<any>((resolve, reject) => {
            self.dbWrapper.validateBeforeTransaction(storeName, reject);

            let transaction = self.dbWrapper.createTransaction({
                storeName: storeName,
                dbMode: self.utils.dbMode.readWrite,
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

        return promise;
    }

    delete(storeName: string, key: any): Promise<any> {
        let self = this;
        let promise = new Promise<any>((resolve, reject) => {
            self.dbWrapper.validateBeforeTransaction(storeName, reject);

            let transaction = self.dbWrapper.createTransaction({
                storeName: storeName,
                dbMode: self.utils.dbMode.readWrite,
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

        return promise;
    }

    openCursor(storeName: string, cursorCallback: (evt: Event) => void, keyRange?: IDBKeyRange): Promise<any> {
        let self = this;
        let promise = new Promise<any>((resolve, reject) => {
            self.dbWrapper.validateBeforeTransaction(storeName, reject);

            let transaction = self.dbWrapper.createTransaction({
                storeName: storeName,
                dbMode: self.utils.dbMode.readOnly,
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

        return promise;
    }

    clear(storeName: string): Promise<any> {
        let self = this;
        let promise = new Promise<any>((resolve, reject) => {
            self.dbWrapper.validateBeforeTransaction(storeName, reject);

            let transaction = self.dbWrapper.createTransaction({
                storeName: storeName,
                dbMode: self.utils.dbMode.readWrite,
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

        return promise;
    }

    getByIndex(storeName: string, indexName: string, key: any): Promise<any> {
        let self = this;
        let promise = new Promise<any>((resolve, reject) => {
            self.dbWrapper.validateBeforeTransaction(storeName, reject);

            let transaction = self.dbWrapper.createTransaction({
                storeName: storeName,
                dbMode: self.utils.dbMode.readOnly,
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

        return promise;
    }

    newGetByKey(storeName: string, key: string) {
        return new Promise<any>((resolve, reject) => {
            var request = indexedDB.open(this.dbWrapper.dbName);

            request.onerror = function (event) {
                reject();
            };
            request.onupgradeneeded = function (event) {
                alert('onupgradeneeded')
            };

            request.onsuccess = function (event) {
                // alert('onsuccess')
                let db = request.result;
                var transaction = db.transaction([storeName]);
                var objectStore = transaction.objectStore(storeName);
                var _request = objectStore.get(key);
                _request.onerror = function (event) {
                    // Tratar erro!
                };
                _request.onsuccess = function (event) {
                    // Fazer algo com request.result!
                    console.log((<any>event.target).result);
                };
            }
        });
    }

    newAdd(storeName: string, value: any, key?: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            var request = indexedDB.open(this.dbWrapper.dbName);

            request.onerror = function (event) {
                reject();
            };
            request.onupgradeneeded = function (event) {
                var db = event.target.result;
                var objectStore = db.createObjectStore(storeName);
                objectStore.transaction.oncomplete = function (event) {
                    var clientesObjectStore = db.transaction(storeName, "readwrite").objectStore(storeName);
                    let _request = clientesObjectStore.add(value, key);
                    _request.onsuccess = (evt: any) => {
                        request.result.close();
                        console.log('onsuccess newAdd')
                    }
                    resolve({ key: key, value: value });
                }
            };
        })
    }
}