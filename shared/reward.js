// shared/js/reward.js

import CONFIG from "./config.js";
import customerRepo from "../db/customerRepo.js";
import transactionRepo from "../db/transactionRepo.js";
import notification from "./notification.js";

class RewardService {
    // ==========================
    // Helpers
    // ==========================

    async getCustomer(customerId) {
        const getter =
            typeof customerRepo.get === "function"
                ? customerRepo.get.bind(customerRepo)
                : typeof customerRepo.getById === "function"
                    ? customerRepo.getById.bind(customerRepo)
                    : null;

        if (!getter) {
            throw new Error("Customer repository getter not found");
        }

        const customer = await getter(customerId);

        if (!customer) {
            throw new Error("Customer not found");
        }

        return customer;
    }

    async saveCustomer(customer) {
        if (!customer || !customer.customerId) {
            throw new Error("Invalid customer");
        }

        if (typeof customerRepo.update === "function") {
            try {
                const result = await customerRepo.update(customer);
                if (result) return result;
            } catch (_) {
                // fallback below
            }

            try {
                const result = await customerRepo.update(customer.customerId, customer);
                if (result) return result;
            } catch (_) {
                // fallback below
            }
        }

        if (typeof customerRepo.save === "function") {
            return customerRepo.save(customer);
        }

        throw new Error("Customer repository update method not found");
    }

    normalizePoints(value) {
        return Math.max(Number(value) || 0, 0);
    }

    calculateEarnedPoints(amount) {
        const purchasePerPoint = Number(CONFIG?.POINTS?.PURCHASE_PER_POINT || 5000);
        const rounding = String(CONFIG?.POINTS?.ROUNDING || "floor").toLowerCase();

        const raw = Number(amount || 0) / purchasePerPoint;

        switch (rounding) {
            case "ceil":
                return Math.ceil(raw);
            case "round":
                return Math.round(raw);
            case "floor":
            default:
                return Math.floor(raw);
        }
    }

    getMemberTypeByPoints(points) {
        const p = Number(points || 0);

        if (p >= 50000) return "PLATINUM";
        if (p >= 20000) return "GOLD";
        if (p >= 5000) return "SILVER";
        return "NORMAL";
    }

    async getTransactions(customerId) {
        if (typeof transactionRepo.getByCustomer === "function") {
            return transactionRepo.getByCustomer(customerId);
        }

        const all = typeof transactionRepo.getAll === "function" ? await transactionRepo.getAll() : [];
        return all.filter((tx) => tx.customerId === customerId);
    }

    // ==========================
    // Points
    // ==========================

    async getPoints(customerId) {
        const customer = await this.getCustomer(customerId);
        return Number(customer.points || 0);
    }

    async setPoints(customerId, points) {
        const customer = await this.getCustomer(customerId);
        customer.points = this.normalizePoints(points);
        return this.saveCustomer(customer);
    }

    async addPoints(customerId, points, source = "manual") {
        const add = this.normalizePoints(points);
        if (add <= 0) {
            throw new Error("Invalid points");
        }

        const customer = await this.getCustomer(customerId);
        customer.points = Number(customer.points || 0) + add;

        const updated = await this.saveCustomer(customer);

        if (typeof notification.pointAdded === "function") {
            await notification.pointAdded(customerId, add, source);
        }

        return updated;
    }

    async subtractPoints(customerId, points, source = "manual") {
        const minus = this.normalizePoints(points);
        if (minus <= 0) {
            throw new Error("Invalid points");
        }

        const customer = await this.getCustomer(customerId);

        if (Number(customer.points || 0) < minus) {
            throw new Error("Insufficient points");
        }

        customer.points = Number(customer.points || 0) - minus;

        const updated = await this.saveCustomer(customer);

        if (typeof notification.pointUsed === "function") {
            await notification.pointUsed(customerId, minus, source);
        }

        return updated;
    }

    // ==========================
    // Fuel Sale
    // ==========================

    async fuelSale(customerId, amount) {
        const saleAmount = this.normalizePoints(amount);
        if (saleAmount <= 0) {
            throw new Error("Invalid amount");
        }

        const earnedPoints = this.calculateEarnedPoints(saleAmount);

        let transaction;
        if (typeof transactionRepo.fuelSale === "function") {
            transaction = await transactionRepo.fuelSale(
                customerId,
                saleAmount,
                Number(CONFIG?.POINTS?.PURCHASE_PER_POINT || 5000)
            );
        } else {
            transaction = await transactionRepo.create({
                customerId,
                type: "fuel",
                amount: saleAmount,
                points: earnedPoints,
                remark: "Fuel Purchase",
                date: new Date().toISOString(),
            });
        }

        const customer = await this.getCustomer(customerId);
        customer.points = Number(customer.points || 0) + earnedPoints;
        await this.saveCustomer(customer);

        if (earnedPoints > 0 && typeof notification.pointAdded === "function") {
            await notification.pointAdded(customerId, earnedPoints);
        }

        return {
            ...transaction,
            points: earnedPoints,
        };
    }

    // ==========================
    // Redeem
    // ==========================

    async redeem(customerId, rewardId, rewardName, usedPoints) {
        const points = this.normalizePoints(usedPoints);

        if (points <= 0) {
            throw new Error("Invalid points");
        }

        const customer = await this.getCustomer(customerId);

        if (Number(customer.points || 0) < points) {
            throw new Error("Insufficient points");
        }

        let transaction;
        if (typeof transactionRepo.redeem === "function") {
            transaction = await transactionRepo.redeem(
                customerId,
                rewardId,
                rewardName,
                points
            );
        } else {
            transaction = await transactionRepo.create({
                customerId,
                type: "redeem",
                rewardId,
                rewardName,
                amount: 0,
                points: -points,
                remark: "Reward Redeemed",
                date: new Date().toISOString(),
            });
        }

        customer.points = Number(customer.points || 0) - points;
        await this.saveCustomer(customer);

        if (typeof notification.rewardRedeemed === "function") {
            await notification.rewardRedeemed(customerId, rewardName);
        }

        return transaction;
    }

    // ==========================
    // Status / Summary
    // ==========================

    async canRedeem(customerId, usedPoints) {
        const customer = await this.getCustomer(customerId);
        return Number(customer.points || 0) >= this.normalizePoints(usedPoints);
    }

    async summary(customerId) {
        const customer = await this.getCustomer(customerId);
        const points = Number(customer.points || 0);
        const transactions = await this.getTransactions(customerId);

        const earned = transactions
            .filter((tx) => Number(tx.points || 0) > 0)
            .reduce((sum, tx) => sum + Number(tx.points || 0), 0);

        const redeemed = transactions
            .filter((tx) => Number(tx.points || 0) < 0)
            .reduce((sum, tx) => sum + Math.abs(Number(tx.points || 0)), 0);

        return {
            customerId: customer.customerId,
            points,
            earnedPoints: earned,
            redeemedPoints: redeemed,
            memberType: this.getMemberTypeByPoints(points),
            canRedeem: points > 0,
        };
    }

    async history(customerId) {
        const transactions = await this.getTransactions(customerId);

        return transactions
            .filter((tx) => {
                const type = String(tx.type || "").toLowerCase();
                return type === "fuel" || type === "redeem";
            })
            .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    }

    async resetPoints(customerId) {
        const customer = await this.getCustomer(customerId);
        customer.points = 0;
        return this.saveCustomer(customer);
    }
}

const reward = new RewardService();
export default reward;