import repository from "./repository.js";
import database from "./database.js";

class TransactionRepository {

    async create(transaction) {
        transaction.createdAt = new Date().toISOString();
        return repository.add("transactions", transaction);
    }

    async get(transactionId) {
        return repository.get("transactions", transactionId);
    }

    async getAll() {
        return repository.getAll("transactions");
    }

    async delete(transactionId) {
        return repository.delete("transactions", transactionId);
    }

    async getByCustomer(customerId) {
        return repository.findByIndex(
            "transactions",
            "customerId",
            customerId
        );
    }

    async getByType(type) {
        return repository.findByIndex(
            "transactions",
            "type",
            type
        );
    }

    // ==========================================
    // Atomic Business Operations
    // ==========================================

    async fuelSale(customerId, amount, pointFormula = 5000) {
        const earnedPoints = Math.floor(amount / pointFormula);
        const transaction = {
            transactionId: crypto.randomUUID(),
            customerId,
            type: "fuel",
            amount,
            points: earnedPoints,
            remark: "Fuel Purchase",
            date: new Date().toISOString(),
            createdAt: new Date().toISOString()
        };

        await database.runTransaction(["transactions", "customers"], "readwrite", (stores, tx) => {
            const getRequest = stores.customers.get(customerId);
            
            getRequest.onsuccess = () => {
                const customer = getRequest.result;
                if (!customer) {
                    tx.abort(); // Customer မရှိလျှင် Transaction ကို ဖျက်သိမ်းမည်
                    return;
                }
                
                customer.points += earnedPoints;
                customer.updatedAt = new Date().toISOString();
                
                stores.customers.put(customer);
                stores.transactions.add(transaction);
            };
            
            getRequest.onerror = () => tx.abort();
        });

        return transaction;
    }

    async redeem(customerId, rewardId, rewardName, usedPoints) {
        const transaction = {
            transactionId: crypto.randomUUID(),
            customerId,
            type: "redeem",
            rewardId,
            rewardName,
            amount: 0,
            points: -usedPoints,
            remark: "Reward Redeemed",
            date: new Date().toISOString(),
            createdAt: new Date().toISOString()
        };

        await database.runTransaction(["transactions", "customers"], "readwrite", (stores, tx) => {
            const getRequest = stores.customers.get(customerId);
            
            getRequest.onsuccess = () => {
                const customer = getRequest.result;
                if (!customer || customer.points < usedPoints) {
                    tx.abort(); // Point မလောက်လျှင် သို့မဟုတ် Customer မရှိလျှင် ဖျက်သိမ်းမည်
                    return;
                }
                
                customer.points -= usedPoints;
                customer.updatedAt = new Date().toISOString();
                
                stores.customers.put(customer);
                stores.transactions.add(transaction);
            };

            getRequest.onerror = () => tx.abort();
        });

        return transaction;
    }

    async creditSale(customerId, amount) {
        const transaction = {
            transactionId: crypto.randomUUID(),
            customerId,
            type: "credit",
            amount,
            points: 0,
            remark: "Credit Sale",
            date: new Date().toISOString(),
            createdAt: new Date().toISOString()
        };

        await database.runTransaction(["transactions", "customers"], "readwrite", (stores, tx) => {
            const getRequest = stores.customers.get(customerId);
            
            getRequest.onsuccess = () => {
                const customer = getRequest.result;
                if (!customer) {
                    tx.abort();
                    return;
                }
                
                customer.creditBalance += amount;
                customer.updatedAt = new Date().toISOString();
                
                stores.customers.put(customer);
                stores.transactions.add(transaction);
            };

            getRequest.onerror = () => tx.abort();
        });

        return transaction;
    }

    async payment(customerId, amount) {
        const transaction = {
            transactionId: crypto.randomUUID(),
            customerId,
            type: "payment",
            amount,
            points: 0,
            remark: "Credit Payment",
            date: new Date().toISOString(),
            createdAt: new Date().toISOString()
        };

        await database.runTransaction(["transactions", "customers"], "readwrite", (stores, tx) => {
            const getRequest = stores.customers.get(customerId);
            
            getRequest.onsuccess = () => {
                const customer = getRequest.result;
                if (!customer) {
                    tx.abort();
                    return;
                }
                
                customer.creditBalance -= amount;
                if (customer.creditBalance < 0) {
                    customer.creditBalance = 0;
                }
                customer.updatedAt = new Date().toISOString();
                
                stores.customers.put(customer);
                stores.transactions.add(transaction);
            };

            getRequest.onerror = () => tx.abort();
        });

        return transaction;
    }
}

const transactionRepo = new TransactionRepository();

export default transactionRepo;