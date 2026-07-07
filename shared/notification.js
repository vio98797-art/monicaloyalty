import notificationRepo from "../db/notificationRepo.js";

class NotificationService {

    async send(notification) {
        return notificationRepo.create(notification);
    }

    async get(notificationId) {
        return notificationRepo.get(notificationId);
    }

    async getAll() {
        return notificationRepo.getAll();
    }

    async getByCustomer(customerId) {
        return notificationRepo.getByCustomer(customerId);
    }

    async markAsRead(notificationId) {
        return notificationRepo.markAsRead(notificationId);
    }

    async markAllAsRead(customerId) {
        return notificationRepo.markAllAsRead(customerId);
    }

    async remove(notificationId) {
        return notificationRepo.remove(notificationId);
    }

    async clear() {
        return notificationRepo.clearAll();
    }

    // ==========================
    // Business Notifications
    // ==========================

    async pointAdded(customerId, points) {
        return notificationRepo.pointAdded(customerId, points);
    }

    async rewardRedeemed(customerId, rewardName) {
        return notificationRepo.rewardRedeemed(
            customerId,
            rewardName
        );
    }

    async promotion(customerId, title, message) {
        return notificationRepo.promotion(
            customerId,
            title,
            message
        );
    }

    async fuelPrice(customerId, fuelName, price) {
        return notificationRepo.fuelPrice(
            customerId,
            fuelName,
            price
        );
    }

    async creditAlert(customerId, balance, limit) {
        return notificationRepo.creditAlert(
            customerId,
            balance,
            limit
        );
    }

    async announcement(customerId, title, message) {
        return notificationRepo.announcement(
            customerId,
            title,
            message
        );
    }

    // ==========================
    // Broadcast
    // ==========================

    async broadcast(customerIds, title, message) {

        const results = [];

        for (const customerId of customerIds) {

            const result = await this.announcement(
                customerId,
                title,
                message
            );

            results.push(result);

        }

        return results;

    }

}

const notification = new NotificationService();

export default notification;