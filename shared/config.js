const CONFIG = Object.freeze({

    // ==========================
    // Application
    // ==========================

    APP_NAME: "Monica Energy",

    APP_VERSION: "1.0.0",

    COMPANY_NAME: "Monica Energy",

    CURRENCY: "MMK",

    LOCALE: "en-MM",

    // ==========================
    // Database
    // ==========================

    DATABASE: {

        NAME: "MonicaEnergyDB",

        VERSION: 1

    },

    // ==========================
    // Point System
    // ==========================

    POINTS: {

        PURCHASE_PER_POINT: 5000,

        ROUNDING: "floor"

    },

    // ==========================
    // Member
    // ==========================

    MEMBER_TYPES: [

        "NORMAL",

        "SILVER",

        "GOLD",

        "PLATINUM"

    ],

    // ==========================
    // Fuel
    // ==========================

    FUEL_TYPES: [

        "92",

        "95",

        "Diesel",

        "Premium Diesel"

    ],

    // ==========================
    // Credit
    // ==========================

    CREDIT: {

        DEFAULT_LIMIT: 0,

        ALERT_PERCENT: 80

    },

    // ==========================
    // Rewards
    // ==========================

    REWARD: {

        DEFAULT_STATUS: "ACTIVE",

        DEFAULT_STOCK: 0

    },

    // ==========================
    // Promotion
    // ==========================

    PROMOTION: {

        DEFAULT_STATUS: "ACTIVE"

    },

    // ==========================
    // QR
    // ==========================

    QR: {

        VERSION: 1,

        SIZE: 256,

        FORMAT: "png"

    },

    // ==========================
    // Notification
    // ==========================

    NOTIFICATION: {

        TYPES: [

            "POINT",

            "REWARD",

            "PROMOTION",

            "PRICE",

            "CREDIT",

            "ANNOUNCEMENT"

        ]

    },

    // ==========================
    // Backup
    // ==========================

    BACKUP: {

        FILE_NAME: "MonicaEnergy_Backup.json"

    },

    // ==========================
    // Theme
    // ==========================

    THEME: {

        PRIMARY: "#0B5ED7",

        SUCCESS: "#198754",

        WARNING: "#FFC107",

        DANGER: "#DC3545"

    }

});

export default CONFIG;