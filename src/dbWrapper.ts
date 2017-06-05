export class DbWrapper {
    dbName: string;
    dbVersion: number;
    db: IDBDatabase;
    private utils = new Utils();
    myCollections: Array<string> = [];

    constructor(dbName: string, version: number) {
        this.dbName = dbName;
        this.dbVersion = parseInt(localStorage.getItem('dbVersion') || '1');
        this.db = null;
    }

    newCollection(collection: string) {
        return new Promise<any>((resolve, reject) => {
            this.myCollections.push(collection);
            this.dbVersion++;
            localStorage.setItem('dbVersion', this.dbVersion.toString())
            let request: IDBOpenDBRequest = this.utils.indexedDB.open(this.dbName);

            request.onerror = function (event) {
                reject();
            };
            request.onupgradeneeded = function (event) {
                (<any>this).myCollections.forEach(x => {
                    event.target.result.createObjectStore(x)
                });
            };

            request.onsuccess = function (event) {
                this.db = request.result;
                resolve();
            }
        })
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

    async openConnection(storeName: string) {
        return new Promise<any>((resolve, reject) => {
            var request = indexedDB.open(this.dbName, 2);

            request.onerror = function (event) {
                // Tratar erros.
            };
            request.onupgradeneeded = function (event) {
                resolve(event.target.result);
            };
        })
    }

    async newCreateTransaction(storeName: string, db: any) {
        return new Promise<any>((resolve, reject) => {
            var objectStore = db.createObjectStore(storeName);
            objectStore.transaction.oncomplete = function (event) {
                resolve(db.transaction(storeName, "readwrite").objectStore(storeName));
            }
        });
    }
}

export class Utils {
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

export interface DbMode {
    readOnly: string;
    readWrite: string;
}