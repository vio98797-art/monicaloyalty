import database from "./database.js";

class Repository {

    async add(storeName, data) {

        const db = await database.open();

        return new Promise((resolve, reject) => {

            const tx = db.transaction(storeName, "readwrite");
            const store = tx.objectStore(storeName);

            const request = store.add(data);

            request.onsuccess = () => resolve(data);

            request.onerror = (e) => reject(e.target.error);

        });

    }

    async put(storeName, data) {

        const db = await database.open();

        return new Promise((resolve, reject) => {

            const tx = db.transaction(storeName, "readwrite");
            const store = tx.objectStore(storeName);

            const request = store.put(data);

            request.onsuccess = () => resolve(data);

            request.onerror = (e) => reject(e.target.error);

        });

    }

    async get(storeName, key) {

        const db = await database.open();

        return new Promise((resolve, reject) => {

            const tx = db.transaction(storeName, "readonly");
            const store = tx.objectStore(storeName);

            const request = store.get(key);

            request.onsuccess = () => resolve(request.result);

            request.onerror = (e) => reject(e.target.error);

        });

    }

    async getAll(storeName) {

        const db = await database.open();

        return new Promise((resolve, reject) => {

            const tx = db.transaction(storeName, "readonly");
            const store = tx.objectStore(storeName);

            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);

            request.onerror = (e) => reject(e.target.error);

        });

    }

    async delete(storeName, key) {

        const db = await database.open();

        return new Promise((resolve, reject) => {

            const tx = db.transaction(storeName, "readwrite");
            const store = tx.objectStore(storeName);

            const request = store.delete(key);

            request.onsuccess = () => resolve(true);

            request.onerror = (e) => reject(e.target.error);

        });

    }

    async count(storeName) {

        const db = await database.open();

        return new Promise((resolve, reject) => {

            const tx = db.transaction(storeName, "readonly");
            const store = tx.objectStore(storeName);

            const request = store.count();

            request.onsuccess = () => resolve(request.result);

            request.onerror = (e) => reject(e.target.error);

        });

    }

    async clear(storeName) {

        const db = await database.open();

        return new Promise((resolve, reject) => {

            const tx = db.transaction(storeName, "readwrite");
            const store = tx.objectStore(storeName);

            const request = store.clear();

            request.onsuccess = () => resolve(true);

            request.onerror = (e) => reject(e.target.error);

        });

    }

    async findByIndex(storeName, indexName, value) {

        const db = await database.open();

        return new Promise((resolve, reject) => {

            const tx = db.transaction(storeName, "readonly");
            const store = tx.objectStore(storeName);
            const index = store.index(indexName);

            const request = index.getAll(value);

            request.onsuccess = () => resolve(request.result);

            request.onerror = (e) => reject(e.target.error);

        });

    }

}

const repository = new Repository();

export default repository;