// shared/js/credit.js

import CONFIG from "./config.js";
import customerRepo from "../db/customerRepo.js";
import transactionRepo from "../db/transactionRepo.js";
import notification from "./notification.js";

class CreditService {
    // ==========================
    // Customer Credit
    // ==========================

    async getCustomer(customerId) {
        const customer = await customerRepo.get(customerId);

        if (!customer) {
            throw new Error("Customer not found");
        }

        return customer;
    }

    async getBalance(customerId) {
        const customer = await this.getCustomer(customerId);
        return Number(customer.creditBalance || 0);
    }

    async getLimit(customerId) {
        const customer = await this.getCustomer(customerId);
        return Number(customer.creditLimit || 0);
    }

    async availableCredit(customerId) {
        const customer = await this.getCustomer(customerId);
        return Number(customer.creditLimit || 0) - Number(customer.creditBalance || 0);
    }

    // ==========================
    // Credit Limit
    // ==========================

    async setLimit(customerId, limit) {
        const customer = await this.getCustomer(customerId);

        const nextLimit = Math.max(Number(limit) || 0, 0);
        customer.creditLimit = nextLimit;

        return customerRepo.update(customer);
    }

    async increaseLimit(customerId, amount) {
        const customer = await this.getCustomer(customerId);

        const inc = Math.max(Number(amount) || 0, 0);
        customer.creditLimit = Number(customer.creditLimit || 0) + inc;

        return customerRepo.update(customer);
    }

    async decreaseLimit(customerId, amount) {
        const customer = await this.getCustomer(customerId);

        const dec = Math.max(Number(amount) || 0, 0);
        customer.creditLimit = Math.max(Number(customer.creditLimit || 0) - dec, 0);

        if (Number(customer.creditBalance || 0) > customer.creditLimit) {
            customer.creditBalance = customer.creditLimit;
        }

        return customerRepo.update(customer);
    }

    // ==========================
    // Credit Sale / Payment
    // ==========================

    async sale(customerId, amount) {
        const saleAmount = Math.max(Number(amount) || 0, 0);

        if (saleAmount <= 0) {
            throw new Error("Invalid amount");
        }

        const customer = await this.getCustomer(customerId);
        const available = Number(customer.creditLimit || 0) - Number(customer.creditBalance || 0);

        if (saleAmount > available) {
            throw new Error("Credit limit exceeded");
        }

        const transaction = await transactionRepo.creditSale(customerId, saleAmount);

        await this.checkLimit(customerId);

        return transaction;
    }

    async payment(customerId, amount) {
        const payAmount = Math.max(Number(amount) || 0, 0);

        if (payAmount <= 0) {
            throw new Error("Invalid amount");
        }

        const transaction = await transactionRepo.payment(customerId, payAmount);

        return transaction;
    }

    // ==========================
    // Status
    // ==========================

    async isOverLimit(customerId) {
        const customer = await this.getCustomer(customerId);
        return Number(customer.creditBalance || 0) > Number(customer.creditLimit || 0);
    }

    async isNearLimit(customerId) {
        const customer = await this.getCustomer(customerId);

        const limit = Number(customer.creditLimit || 0);
        if (limit === 0) return false;

        const percent = (Number(customer.creditBalance || 0) / limit) * 100;
        return percent >= CONFIG.CREDIT.ALERT_PERCENT;
    }

    // ==========================
    // Alert
    // ==========================

    async checkLimit(customerId) {
        const customer = await this.getCustomer(customerId);

        const limit = Number(customer.creditLimit || 0);
        const balance = Number(customer.creditBalance || 0);

        const percent = limit === 0 ? 0 : (balance / limit) * 100;

        if (limit > 0 && percent >= CONFIG.CREDIT.ALERT_PERCENT) {
            await notification.creditAlert(
                customer.customerId,
                balance,
                limit
            );
        }

        return percent;
    }

    // ==========================
    // Summary
    // ==========================

    async summary(customerId) {
        const customer = await this.getCustomer(customerId);

        const creditLimit = Number(customer.creditLimit || 0);
        const creditBalance = Number(customer.creditBalance || 0);
        const availableCredit = Math.max(creditLimit - creditBalance, 0);
        const usagePercent = creditLimit === 0 ? 0 : Number(((creditBalance / creditLimit) * 100).toFixed(2));

        return {
            customerId: customer.customerId,
            creditLimit,
            creditBalance,
            availableCredit,
            usagePercent,
            isOverLimit: creditBalance > creditLimit,
            isNearLimit: creditLimit > 0 && (creditBalance / creditLimit) * 100 >= CONFIG.CREDIT.ALERT_PERCENT,
        };
    }
}

const credit = new CreditService();
export default credit;