import DB_CONFIG from "./schema.js";

class Database {

    constructor() {
        this.db = null;
    }

    async open() {
        if (this.db) return this.db;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(
                DB_CONFIG.name,
                DB_CONFIG.version
            );

            request.onerror = (event) => {
                reject(event.target.error);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                Object.entries(DB_CONFIG.stores).forEach(([storeName, config]) => {
                    if (!db.objectStoreNames.contains(storeName)) {
                        const store = db.createObjectStore(storeName, {
                            keyPath: config.keyPath,
                            autoIncrement: config.autoIncrement || false
                        });

                        if (config.indexes) {
                            config.indexes.forEach(index => {
                                store.createIndex(
                                    index[0],
                                    index[1],
                                    index[2]
                                );
                            });
                        }
                    }
                });
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                this.db.onversionchange = () => {
                    this.db.close();
                };
                resolve(this.db);
            };
        });
    }

    async close() {
        if (this.db) {
            this.db.close();
            this.db = null;
        }
    }

    async deleteDatabase() {
        await this.close();
        return new Promise((resolve, reject) => {
            const request = indexedDB.deleteDatabase(DB_CONFIG.name);
            request.onsuccess = () => resolve(true);
            request.onerror = (event) => reject(event.target.error);
        });
    }

    getDB() {
        return this.db;
    }

    /**
     * ACID Transaction Engine
     * အလုပ်ပေါင်းများစွာကို တစ်ပြိုင်တည်းလုပ်ဆောင်ပြီး ချို့ယွင်းပါက အလိုအလျောက် Rollback လုပ်ပေးမည့်စနစ်
     */
    async runTransaction(storeNames, mode, callback) {
        const db = await this.open();
        
        return new Promise((resolve, reject) => {
            const tx = db.transaction(storeNames, mode);
            
            tx.oncomplete = () => resolve(true);
            tx.onerror = (event) => reject(event.target.error);
            tx.onabort = () => reject(new Error("Transaction aborted due to an error or manual abort."));

            const stores = {};
            storeNames.forEach(name => {
                stores[name] = tx.objectStore(name);
            });

            try {
                // Callback function သို့ stores များနှင့် transaction object ကို ပေးပို့ခြင်း
                callback(stores, tx);
            } catch (error) {
                // Synchronous error ဖြစ်ခဲ့လျှင် ချက်ချင်း abort လုပ်မည်
                tx.abort();
                reject(error);
            }
        });
    }
}

const database = new Database();

export default database;