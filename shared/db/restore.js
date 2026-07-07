import database from "./database.js";
import DB_CONFIG from "./schema.js";

class RestoreManager {

    async restore(backupData) {

        if (!backupData || !backupData.data) {
            throw new Error("Invalid backup file");
        }

        const db = await database.open();

        const storeNames = Object.keys(DB_CONFIG.stores);

        // Clear existing data
        for (const storeName of storeNames) {

            await new Promise((resolve, reject) => {

                const tx = db.transaction(storeName, "readwrite");
                const store = tx.objectStore(storeName);

                const request = store.clear();

                request.onsuccess = () => resolve();
                request.onerror = (e) => reject(e.target.error);

            });

        }

        // Restore data
        for (const storeName of storeNames) {

            const records = backupData.data[storeName] || [];

            if (!records.length) continue;

            await new Promise((resolve, reject) => {

                const tx = db.transaction(storeName, "readwrite");
                const store = tx.objectStore(storeName);

                records.forEach(record => store.put(record));

                tx.oncomplete = () => resolve();
                tx.onerror = (e) => reject(e.target.error);
                tx.onabort = (e) => reject(e.target.error);

            });

        }

        return true;
    }

    async importJSON(file) {

        const text = await file.text();

        const backupData = JSON.parse(text);

        return this.restore(backupData);

    }

}

const restore = new RestoreManager();

export default restore;