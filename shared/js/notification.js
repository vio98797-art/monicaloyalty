/**
 * Monica Energy - Notification Engine
 * Location: shared/js/notification.js
 */

// Notification အမျိုးအစားများကို Standardize လုပ်ထားခြင်း
export const NOTIFICATION_TYPES = {
    POINT_ADDED: 'POINT_ADDED',
    PROMOTION: 'PROMOTION',
    CREDIT_ALERT: 'CREDIT_ALERT',
    FUEL_PRICE: 'FUEL_PRICE',
    BIRTHDAY: 'BIRTHDAY',
    ANNOUNCEMENT: 'ANNOUNCEMENT'
};

class NotificationEngine {
    constructor() {
        // နောက်ပိုင်း database.js ကနေ Repository ကို ဒီမှာ Inject လုပ်ပါမယ်
        // ဥပမာ: this.repo = new Repository('notifications');
        this.storeName = 'notifications';
    }

    /**
     * Core function - Notification အသစ်တစ်ခု ဖန်တီးရန်
     */
    async _createNotification(customerId, type, title, message, metaData = {}) {
        const notification = {
            id: crypto.randomUUID(),
            customerId: customerId, // 'ALL' ဆိုရင် Customer တိုင်းအတွက်
            type: type,
            title: title,
            message: message,
            metaData: metaData, // QR payload သို့မဟုတ် အခြား data တွေ ထည့်ရန်
            isRead: false,
            createdAt: new Date().toISOString()
        };

        try {
            // TODO: database.js မှ IndexedDB သို့ သိမ်းရန်
            // await window.db.insert(this.storeName, notification);
            console.log('Notification Generated:', notification);
            return notification;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw new Error('Failed to create notification');
        }
    }

    // ==========================================
    // Helper Methods (Specific Notifications)
    // ==========================================

    /**
     * ဆီဝယ်ယူပြီး Point ရရှိကြောင်း အသိပေးရန်
     */
    async sendPointAdded(customerId, points, invoiceTotal) {
        const title = 'Points Received! 🎉';
        const message = `သင်၏ နောက်ဆုံးဝယ်ယူမှု ${invoiceTotal.toLocaleString()} Ks အတွက် ${points} points ရရှိပါသည်။`;
        return await this.hak_createNotification(
            customerId, 
            NOTIFICATION_TYPES.POINT_ADDED, 
            title, 
            message, 
            { earnedPoints: points, amount: invoiceTotal }
        );
    }

    /**
     * ဆီဈေးနှုန်း အပြောင်းအလဲ အသိပေးရန် (Octane 92, 95, Diesel)
     */
    async sendFuelPriceUpdate(fuelType, newPrice) {
        const title = 'ဆီဈေးနှုန်း အပ်ဒိတ်';
        const message = `ယနေ့ M Energy တွင် ${fuelType} တစ်လီတာလျှင် ${newPrice.toLocaleString()} Ks ဖြစ်ပါသည်။`;
        // 'ALL' သုံးထားတာက Customer အကုန်လုံးဆီ ဝင်စေချင်တဲ့ သဘောပါ
        return await this._createNotification(
            'ALL', 
            NOTIFICATION_TYPES.FUEL_PRICE, 
            title, 
            message, 
            { fuelType: fuelType, price: newPrice }
        );
    }

    /**
     * အကြွေး Limit ပြည့်ခါနီး သို့မဟုတ် ကျော်လွန်နေကြောင်း အသိပေးရန်
     */
    async sendCreditAlert(customerId, outstandingAmount, limitAmount) {
        const title = 'Credit Limit Alert ⚠️';
        const message = `သင်၏ လက်ရှိသုံးစွဲထားသော ပမာဏမှာ ${outstandingAmount.toLocaleString()} Ks ဖြစ်ပြီး သတ်မှတ် Limit အနီးသို့ ရောက်ရှိနေပါသည်။`;
        return await this._createNotification(
            customerId, 
            NOTIFICATION_TYPES.CREDIT_ALERT, 
            title, 
            message, 
            { outstanding: outstandingAmount, limit: limitAmount }
        );
    }

    /**
     * Promotion အသစ်များအတွက်
     */
    async sendPromotion(customerId, promoTitle, promoDesc, expiryDate) {
        return await this._createNotification(
            customerId, 
            NOTIFICATION_TYPES.PROMOTION, 
            promoTitle, 
            promoDesc, 
            { expiry: expiryDate }
        );
    }

    /**
     * Customer ၏ မွေးနေ့အတွက် အထူး Point သို့မဟုတ် ဆုချီးမြှင့်ရန်
     */
    async sendBirthdayGreeting(customerId, rewardPoints) {
        const title = 'Happy Birthday! 🎂';
        const message = `M Energy မှ မွေးနေ့လက်ဆောင်အဖြစ် ${rewardPoints} points ထည့်သွင်းပေးလိုက်ပါသည်။`;
        return await this._createNotification(
            customerId, 
            NOTIFICATION_TYPES.BIRTHDAY, 
            title, 
            message, 
            { giftPoints: rewardPoints }
        );
    }

    // ==========================================
    // Fetch & Update Methods (For Customer UI)
    // ==========================================

    /**
     * Customer တစ်ယောက်ရဲ့ Notification တွေကို ဆွဲထုတ်ရန်
     */
    async getNotificationsByCustomer(customerId) {
        // TODO: Query from IndexedDB 
        // return await window.db.query(this.storeName, { customerId: customerId });
        console.log(`Fetching notifications for: ${customerId}`);
        return []; 
    }

    /**
     * Notification ကို ဖတ်ပြီးကြောင်း (isRead = true) သတ်မှတ်ရန်
     */
    async markAsRead(notificationId) {
        // TODO: Update IndexedDB record
        console.log(`Marking notification ${notificationId} as read`);
        return true;
    }
    
    /**
     * Unread notification အရေအတွက်ကို ယူရန် (Badge ပြရန်)
     */
    async getUnreadCount(customerId) {
        // TODO: Query IndexedDB count where customerId = id AND isRead = false
        console.log(`Counting unread for: ${customerId}`);
        return 0;
    }
}

// Singleton pattern အနေနဲ့ export လုပ်ထားတဲ့အတွက် နေရာတိုင်းကနေ ခေါ်သုံးရုံပါပဲ
const notificationEngine = new NotificationEngine();
export default notificationEngine;