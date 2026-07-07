class Utils {

    // ==========================
    // UUID
    // ==========================

    uuid() {

        if (typeof crypto !== "undefined" && crypto.randomUUID) {
            return crypto.randomUUID();
        }

        return (
            Date.now().toString(36) +
            Math.random().toString(36).substring(2)
        );

    }

    // ==========================
    // Date
    // ==========================

    now() {
        return new Date().toISOString();
    }

    formatDate(date) {

        return new Date(date).toLocaleDateString();

    }

    formatDateTime(date) {

        return new Date(date).toLocaleString();

    }

    // ==========================
    // Currency
    // ==========================

    currency(amount, currency = "MMK") {

        return Number(amount).toLocaleString() +
            " " +
            currency;

    }

    // ==========================
    // Number
    // ==========================

    number(value) {

        return Number(value).toLocaleString();

    }

    // ==========================
    // Point
    // ==========================

    calculatePoints(amount, formula = 5000) {

        return Math.floor(amount / formula);

    }

    // ==========================
    // Validation
    // ==========================

    isPhone(phone) {

        return /^[0-9]{7,15}$/.test(phone);

    }

    isEmpty(value) {

        return (
            value === null ||
            value === undefined ||
            value === ""
        );

    }

    // ==========================
    // Random
    // ==========================

    randomInt(min, max) {

        return Math.floor(
            Math.random() * (max - min + 1)
        ) + min;

    }

    // ==========================
    // Array
    // ==========================

    sortByDate(list, field = "createdAt") {

        return [...list].sort((a, b) =>
            new Date(b[field]) - new Date(a[field])
        );

    }

    groupBy(list, field) {

        return list.reduce((obj, item) => {

            const key = item[field];

            if (!obj[key]) obj[key] = [];

            obj[key].push(item);

            return obj;

        }, {});

    }

    // ==========================
    // Clone
    // ==========================

    clone(data) {

        return structuredClone(data);

    }

    // ==========================
    // Delay
    // ==========================

    sleep(ms) {

        return new Promise(resolve =>
            setTimeout(resolve, ms)
        );

    }

    // ==========================
    // File
    // ==========================

    download(filename, content) {

        const blob = new Blob(
            [content],
            {
                type: "application/json"
            }
        );

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");

        a.href = url;
        a.download = filename;
        a.click();

        URL.revokeObjectURL(url);

    }

}

const utils = new Utils();

export default utils;