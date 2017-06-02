export declare class IndexedDBAngular {
    private utils;
    private dbWrapper;
    createDb(dbName: string, version: number): void;
    createStore(version: number, upgradeCallback: Function): any;
    getByKey(storeName: string, key: any): any;
    getAll(storeName: string, keyRange?: IDBKeyRange, indexDetails?: IndexDetails): any;
    add(storeName: string, value: any, key?: any): any;
    update(storeName: string, value: any, key?: any): any;
    delete(storeName: string, key: any): any;
    openCursor(storeName: string, cursorCallback: (evt: Event) => void, keyRange?: IDBKeyRange): any;
    clear(storeName: string): any;
    getByIndex(storeName: string, indexName: string, key: any): any;
}
export interface IndexDetails {
    indexName: string;
    order: string;
}
