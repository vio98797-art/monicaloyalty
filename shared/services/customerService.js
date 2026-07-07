import customerRepo from "../db/customerRepo.js";

class CustomerService {

    async create(customer) {

        if (!customer.name?.trim()) {
            throw new Error("Customer name is required.");
        }

        const existing = await customerRepo.findByPhone(customer.phone);

        if (existing) {
            throw new Error("Phone number already exists.");
        }

        return customerRepo.create(customer);

    }

    async update(customer) {

        if (!customer.customerId) {
            throw new Error("Customer ID is required.");
        }

        return customerRepo.update(customer);

    }

    async get(customerId) {

        return customerRepo.get(customerId);

    }

    async getAll() {

        return customerRepo.getAll();

    }

    async delete(customerId) {

        return customerRepo.delete(customerId);

    }

    async count() {

        return customerRepo.count();

    }

    async search(keyword) {

        const customers = await customerRepo.getAll();

        if (!keyword?.trim()) {
            return customers;
        }

        const q = keyword.toLowerCase();

        return customers.filter(customer =>
            (customer.name || "").toLowerCase().includes(q) ||
            (customer.phone || "").toLowerCase().includes(q)
        );

    }

}

const customerService = new CustomerService();

export default customerService;