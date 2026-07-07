import database from "./database.js";
import DB_CONFIG from "./schema.js";

class BackupManager {

    async createBackup() {

        const db = await database.open();

        const backup = {
            app: "Monica Energy",
            version: DB_CONFIG.version,
            createdAt: new Date().toISOString(),
            data: {}
        };

        for (const storeName of Object.keys(DB_CONFIG.stores)) {

            backup.data[storeName] = await new Promise((resolve, reject) => {

                const tx = db.transaction(storeName, "readonly");
                const store = tx.objectStore(storeName);

                const request = store.getAll();

                request.onsuccess = () => resolve(request.result);
                request.onerror = (e) => reject(e.target.error);

            });

        }

        return backup;
    }

    async exportJSON(filename = "backup.json") {

        const backup = await this.createBackup();

        const blob = new Blob(
            [JSON.stringify(backup, null, 2)],
            { type: "application/json" }
        );

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();

        URL.revokeObjectURL(url);

        return true;
    }

    async exportBlob() {

        const backup = await this.createBackup();

        return new Blob(
            [JSON.stringify(backup, null, 2)],
            { type: "application/json" }
        );
    }

}

const backup = new BackupManager();

export default backup;