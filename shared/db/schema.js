// Monica Energy Database Schema

const DB_CONFIG = {
    name: "MonicaEnergyDB",
    version: 1,

    stores: {

        customers: {
            keyPath: "customerId",
            autoIncrement: false,
            indexes: [
                ["phone", "phone", { unique: true }],
                ["name", "name", { unique: false }],
                ["status", "status", { unique: false }]
            ]
        },

        transactions: {
            keyPath: "transactionId",
            autoIncrement: false,
            indexes: [
                ["customerId", "customerId", { unique: false }],
                ["date", "date", { unique: false }],
                ["type", "type", { unique: false }]
            ]
        },

        rewards: {
            keyPath: "rewardId",
            autoIncrement: false,
            indexes: [
                ["status", "status", { unique: false }]
            ]
        },

        promotions: {
            keyPath: "promotionId",
            autoIncrement: false,
            indexes: [
                ["status", "status", { unique: false }]
            ]
        },

        notifications: {
            keyPath: "notificationId",
            autoIncrement: false,
            indexes: [
                ["customerId", "customerId", { unique: false }],
                ["read", "read", { unique: false }]
            ]
        },

        settings: {
            keyPath: "key",
            autoIncrement: false
        },

        logs: {
            keyPath: "logId",
            autoIncrement: false,
            indexes: [
                ["date", "date", { unique: false }]
            ]
        }

    }
};

export default DB_CONFIG;