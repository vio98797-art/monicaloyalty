import repository from "../db/repository.js";
import notification from "./notification.js";

class PromotionService {

    // ==========================
    // CRUD
    // ==========================

    async create(promotion) {

        promotion.promotionId ??= crypto.randomUUID();
        promotion.createdAt = new Date().toISOString();
        promotion.updatedAt = promotion.createdAt;
        promotion.status ??= "ACTIVE";

        return repository.add("promotions", promotion);

    }

    async update(promotion) {

        promotion.updatedAt = new Date().toISOString();

        return repository.put("promotions", promotion);

    }

    async get(promotionId) {

        return repository.get(
            "promotions",
            promotionId
        );

    }

    async getAll() {

        return repository.getAll(
            "promotions"
        );

    }

    async delete(promotionId) {

        return repository.delete(
            "promotions",
            promotionId
        );

    }

    // ==========================
    // Query
    // ==========================

    async getActive() {

        const promotions = await this.getAll();

        const today = Date.now();

        return promotions.filter(item => {

            if (item.status !== "ACTIVE")
                return false;

            if (item.startDate &&
                new Date(item.startDate).getTime() > today)
                return false;

            if (item.endDate &&
                new Date(item.endDate).getTime() < today)
                return false;

            return true;

        });

    }

    async activate(promotionId) {

        const promotion = await this.get(promotionId);

        if (!promotion)
            throw new Error("Promotion not found");

        promotion.status = "ACTIVE";

        return this.update(promotion);

    }

    async deactivate(promotionId) {

        const promotion = await this.get(promotionId);

        if (!promotion)
            throw new Error("Promotion not found");

        promotion.status = "INACTIVE";

        return this.update(promotion);

    }

    // ==========================
    // Notification
    // ==========================

    async send(customerId, promotionId) {

        const promotion = await this.get(promotionId);

        if (!promotion)
            throw new Error("Promotion not found");

        return notification.promotion(
            customerId,
            promotion.title,
            promotion.message
        );

    }

    async broadcast(customerIds, promotionId) {

        const promotion = await this.get(promotionId);

        if (!promotion)
            throw new Error("Promotion not found");

        const results = [];

        for (const customerId of customerIds) {

            const result = await notification.promotion(
                customerId,
                promotion.title,
                promotion.message
            );

            results.push(result);

        }

        return results;

    }

    // ==========================
    // Utility
    // ==========================

    async isActive(promotionId) {

        const promotion = await this.get(promotionId);

        if (!promotion)
            return false;

        if (promotion.status !== "ACTIVE")
            return false;

        const today = Date.now();

        if (
            promotion.startDate &&
            new Date(promotion.startDate).getTime() > today
        ) {
            return false;
        }

        if (
            promotion.endDate &&
            new Date(promotion.endDate).getTime() < today
        ) {
            return false;
        }

        return true;

    }

}

const promotion = new PromotionService();

export default promotion;