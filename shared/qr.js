// shared/qr.js

const QR_PROTOCOL_VERSION = 1;

const QR_TYPES = Object.freeze({
    REGISTRATION: "REGISTRATION_QR",
    APPROVAL: "APPROVAL_QR",
    UPDATE: "UPDATE_QR",
    REDEEM: "REDEEM_QR",
    PROMOTION: "PROMOTION_QR",
});

function nowISO() {
    return new Date().toISOString();
}

function uid() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
    }

    return `qr_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function base64UrlEncode(text) {
    const binary = unescape(encodeURIComponent(text));
    const base64 = btoa(binary);
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(text) {
    const base64 = text.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "===".slice((base64.length + 3) % 4);
    const binary = atob(padded);
    return decodeURIComponent(escape(binary));
}

function isObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

class QRManager {
    createPayload(type, data = {}, meta = {}) {
        if (!Object.values(QR_TYPES).includes(type)) {
            throw new Error(`Unsupported QR type: ${type}`);
        }

        const payload = {
            v: QR_PROTOCOL_VERSION,
            id: uid(),
            type,
            createdAt: nowISO(),
            expiresAt: meta.expiresAt || null,
            source: meta.source || "MonicaEnergy",
            data,
        };

        return payload;
    }

    encodePayload(payload) {
        if (!isObject(payload)) {
            throw new Error("Payload must be an object");
        }

        return base64UrlEncode(JSON.stringify(payload));
    }

    decodePayload(encoded) {
        if (typeof encoded !== "string" || !encoded.trim()) {
            throw new Error("Encoded QR data must be a non-empty string");
        }

        const json = base64UrlDecode(encoded.trim());
        const payload = JSON.parse(json);

        return payload;
    }

    validatePayload(payload) {
        if (!isObject(payload)) return false;
        if (payload.v !== QR_PROTOCOL_VERSION) return false;
        if (!payload.id || typeof payload.id !== "string") return false;
        if (!payload.type || typeof payload.type !== "string") return false;
        if (!Object.values(QR_TYPES).includes(payload.type)) return false;
        if (!payload.createdAt || typeof payload.createdAt !== "string") return false;
        if (!("data" in payload)) return false;

        if (payload.expiresAt) {
            const expires = new Date(payload.expiresAt);
            if (Number.isNaN(expires.getTime())) return false;
            if (expires.getTime() < Date.now()) return false;
        }

        return true;
    }

    verify(encodedOrPayload, expectedType = null) {
        try {
            const payload = typeof encodedOrPayload === "string"
                ? this.decodePayload(encodedOrPayload)
                : encodedOrPayload;

            if (!this.validatePayload(payload)) {
                return {
                    ok: false,
                    reason: "Invalid QR payload",
                    payload: null,
                };
            }

            if (expectedType && payload.type !== expectedType) {
                return {
                    ok: false,
                    reason: `Expected ${expectedType} but received ${payload.type}`,
                    payload,
                };
            }

            return {
                ok: true,
                reason: "Valid QR payload",
                payload,
            };
        } catch (error) {
            return {
                ok: false,
                reason: error?.message || "Failed to verify QR payload",
                payload: null,
            };
        }
    }

    stringify(payload) {
        return this.encodePayload(payload);
    }

    parse(encoded) {
        const payload = this.decodePayload(encoded);
        return {
            ...payload,
            valid: this.validatePayload(payload),
        };
    }

    createRegistrationQR(customer) {
        return this.createPayload(QR_TYPES.REGISTRATION, {
            customerId: customer?.customerId || null,
            name: customer?.name || "",
            phone: customer?.phone || "",
            vehicle: customer?.vehicle || "",
            memberType: customer?.memberType || "",
        });
    }

    createApprovalQR(customerId, approvedBy = null) {
        return this.createPayload(QR_TYPES.APPROVAL, {
            customerId,
            approvedBy,
        });
    }

    createUpdateQR(customerId, changes = {}) {
        return this.createPayload(QR_TYPES.UPDATE, {
            customerId,
            changes,
        });
    }

    createRedeemQR(customerId, reward = {}) {
        return this.createPayload(QR_TYPES.REDEEM, {
            customerId,
            rewardId: reward.rewardId || null,
            rewardName: reward.name || reward.rewardName || "",
            requiredPoints: reward.requiredPoints ?? null,
        });
    }

    createPromotionQR(promotion = {}) {
        return this.createPayload(QR_TYPES.PROMOTION, {
            promotionId: promotion.promotionId || null,
            title: promotion.title || "",
            message: promotion.message || "",
            startDate: promotion.startDate || null,
            endDate: promotion.endDate || null,
        });
    }

    create(type, data = {}, meta = {}) {
        const payload = this.createPayload(type, data, meta);
        return {
            payload,
            encoded: this.encodePayload(payload),
        };
    }

    generate(type, data = {}, meta = {}) {
        return this.create(type, data, meta);
    }

    async generateText(type, data = {}, meta = {}) {
        const { encoded } = this.create(type, data, meta);
        return encoded;
    }

    async generateDataURL(type, data = {}, meta = {}, options = {}) {
        const { encoded } = this.create(type, data, meta);

        if (typeof QRCode === "undefined") {
            throw new Error("QRCode library is not available");
        }

        const width = options.width || 256;
        const margin = options.margin ?? 2;
        const colorDark = options.colorDark || "#000000";
        const colorLight = options.colorLight || "#ffffff";

        const canvas = document.createElement("canvas");

        await QRCode.toCanvas(canvas, encoded, {
            width,
            margin,
            color: { dark: colorDark, light: colorLight },
        });

        return canvas.toDataURL("image/png");
    }

    async renderToCanvas(canvas, type, data = {}, meta = {}, options = {}) {
        if (!canvas) {
            throw new Error("A canvas element is required");
        }

        const { encoded } = this.create(type, data, meta);

        if (typeof QRCode === "undefined") {
            throw new Error("QRCode library is not available");
        }

        const width = options.width || 256;
        const margin = options.margin ?? 2;
        const colorDark = options.colorDark || "#000000";
        const colorLight = options.colorLight || "#ffffff";

        await QRCode.toCanvas(canvas, encoded, {
            width,
            margin,
            color: { dark: colorDark, light: colorLight },
        });

        return canvas;
    }

    async scanFromImageData(imageData) {
        if (typeof jsQR === "undefined") {
            throw new Error("jsQR library is not available");
        }

        const result = jsQR(imageData.data, imageData.width, imageData.height);

        if (!result?.data) {
            return null;
        }

        return this.parse(result.data);
    }

    async scanFromCanvas(canvas) {
        if (!canvas) {
            throw new Error("A canvas element is required");
        }

        const context = canvas.getContext("2d");
        if (!context) {
            throw new Error("Unable to access canvas context");
        }

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        return this.scanFromImageData(imageData);
    }

    async scanFromImageElement(image) {
        if (!image) {
            throw new Error("An image element is required");
        }

        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth || image.width;
        canvas.height = image.naturalHeight || image.height;

        const context = canvas.getContext("2d");
        if (!context) {
            throw new Error("Unable to access canvas context");
        }

        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        return this.scanFromCanvas(canvas);
    }

    async scanFromVideoElement(video) {
        if (!video) {
            throw new Error("A video element is required");
        }

        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || video.width;
        canvas.height = video.videoHeight || video.height;

        const context = canvas.getContext("2d");
        if (!context) {
            throw new Error("Unable to access canvas context");
        }

        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        return this.scanFromCanvas(canvas);
    }

    exportJSON(type, data = {}, meta = {}, filename = "qr-payload.json") {
        const { payload } = this.create(type, data, meta);

        const blob = new Blob([JSON.stringify(payload, null, 2)], {
            type: "application/json",
        });

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();

        URL.revokeObjectURL(url);

        return true;
    }

    importJSON(textOrFile) {
        if (typeof textOrFile === "string") {
            const payload = JSON.parse(textOrFile);
            return {
                payload,
                valid: this.validatePayload(payload),
            };
        }

        if (textOrFile && typeof textOrFile.text === "function") {
            return textOrFile.text().then((text) => this.importJSON(text));
        }

        throw new Error("Expected a JSON string or File object");
    }

    normalize(encodedOrPayload) {
        if (typeof encodedOrPayload === "string") {
            return this.parse(encodedOrPayload);
        }

        if (isObject(encodedOrPayload)) {
            return {
                ...encodedOrPayload,
                valid: this.validatePayload(encodedOrPayload),
            };
        }

        throw new Error("Unsupported QR input");
    }

    getTypes() {
        return { ...QR_TYPES };
    }
}

const qr = new QRManager();

export default qr;
export { QR_TYPES };