import repository from "./repository.js";

class NotificationRepository {

    async create(notification) {

        notification.notificationId = notification.notificationId || crypto.randomUUID();
        notification.createdAt = new Date().toISOString();
        notification.read = notification.read ?? false;

        return repository.add("notifications", notification);

    }

    async update(notification) {

        notification.updatedAt = new Date().toISOString();

        return repository.put("notifications", notification);

    }

    async get(notificationId) {

        return repository.get(
            "notifications",
            notificationId
        );

    }

    async getAll() {

        return repository.getAll(
            "notifications"
        );

    }

    async getByCustomer(customerId) {

        return repository.findByIndex(
            "notifications",
            "customerId",
            customerId
        );

    }

    async markAsRead(notificationId) {

        const notification = await this.get(notificationId);

        if (!notification) {
            throw new Error("Notification not found");
        }

        notification.read = true;

        return this.update(notification);

    }

    async markAllAsRead(customerId) {

        const list = await this.getByCustomer(customerId);

        for (const item of list) {

            item.read = true;

            await this.update(item);

        }

        return true;

    }

    async remove(notificationId) {

        return repository.delete(
            "notifications",
            notificationId
        );

    }

    async clearAll() {

        return repository.clear(
            "notifications"
        );

    }

    // ===============================
    // Business Notifications
    // ===============================

    async pointAdded(customerId, points) {

        return this.create({

            customerId,

            type: "POINT",

            title: "Points Added",

            message: `🎉 Congratulations! ${points} points have been added to your account.`

        });

    }

    async rewardRedeemed(customerId, rewardName) {

        return this.create({

            customerId,

            type: "REWARD",

            title: "Reward Redeemed",

            message: `🎁 You successfully redeemed "${rewardName}".`

        });

    }

    async promotion(customerId, title, message) {

        return this.create({

            customerId,

            type: "PROMOTION",

            title,

            message

        });

    }

    async fuelPrice(customerId, fuelName, price) {

        return this.create({

            customerId,

            type: "FUEL",

            title: "Fuel Price Updated",

            message: `${fuelName} price has been updated to ${price} Ks/L.`

        });

    }

    async creditAlert(customerId, balance, limit) {

        return this.create({

            customerId,

            type: "CREDIT",

            title: "Credit Limit Alert",

            message: `Outstanding ${balance} Ks / Limit ${limit} Ks.`

        });

    }

    async announcement(customerId, title, message) {

        return this.create({

            customerId,

            type: "ANNOUNCEMENT",

            title,

            message

        });

    }

}

const notificationRepo = new NotificationRepository();

export default notificationRepo;