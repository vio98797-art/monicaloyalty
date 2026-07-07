import backup from "../db/backup.js";
import restore from "../db/restore.js";
import database from "../db/database.js";

class StorageService {

    async initialize() {
        return database.open();
    }

    async close() {
        return database.close();
    }

    async exportBackup(filename = "MonicaEnergy_Backup.json") {
        return backup.exportJSON(filename);
    }

    async exportBlob() {
        return backup.exportBlob();
    }

    async importBackup(file) {
        return restore.importJSON(file);
    }

    async restore(data) {
        return restore.restore(data);
    }

    async resetDatabase() {
        return database.deleteDatabase();
    }

}

const storage = new StorageService();

export default storage;