// shared/db/customerRepo.js

const STORAGE_KEY = "monica_customers";

function readCustomers() {
try {
const raw = localStorage.getItem(STORAGE_KEY);
if (!raw) return [];
const data = JSON.parse(raw);
return Array.isArray(data) ? data : [];
} catch (error) {
console.error("Failed to read customers:", error);
return [];
}
}

function writeCustomers(items) {
localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function uid() {
return `cust_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeCustomer(customer) {
return {
customerId: customer.customerId || uid(),
name: String(customer.name || "").trim(),
phone: String(customer.phone || "---").trim() || "---",
creditLimit: Number(customer.creditLimit || 0),
creditBalance: Number(customer.creditBalance || 0),
totalSales: Number(customer.totalSales || 0),
joinedAt: customer.joinedAt || new Date().toISOString().slice(0, 10),
status: customer.status || "active",
};
}

const customerRepo = {
async getAll() {
return readCustomers();
},

```
async getById(customerId) {
    const items = readCustomers();
    return items.find((item) => item.customerId === customerId) || null;
},

async add(customer) {
    const items = readCustomers();
    const record = normalizeCustomer(customer);
    items.unshift(record);
    writeCustomers(items);
    return record;
},

async update(customerId, patch) {
    const items = readCustomers();
    const index = items.findIndex((item) => item.customerId === customerId);

    if (index === -1) return null;

    const updated = {
        ...items[index],
        ...patch,
        customerId,
    };

    items[index] = normalizeCustomer(updated);
    writeCustomers(items);
    return items[index];
},

async remove(customerId) {
    const items = readCustomers();
    const next = items.filter((item) => item.customerId !== customerId);
    const removed = next.length !== items.length;
    writeCustomers(next);
    return removed;
},

async search(query) {
    const q = String(query || "").trim().toLowerCase();
    if (!q) return readCustomers();

    return readCustomers().filter((item) => {
        return [
            item.customerId,
            item.name,
            item.phone,
            item.creditLimit,
            item.creditBalance,
            item.totalSales,
            item.joinedAt,
            item.status,
        ]
            .join(" ")
            .toLowerCase()
            .includes(q);
    });
},

async count() {
    return readCustomers().length;
},

async clear() {
    writeCustomers([]);
},
```

};

export default customerRepo;
