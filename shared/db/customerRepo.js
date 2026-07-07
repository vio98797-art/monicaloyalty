import repository from "./repository.js";

class CustomerRepository {

    async create(customer) {

        customer.createdAt = new Date().toISOString();
        customer.updatedAt = new Date().toISOString();

        customer.status ??= "ACTIVE";
        customer.points ??= 0;
        customer.bonusPoints ??= 0;
        customer.creditBalance ??= 0;
        customer.creditLimit ??= 0;
        customer.tier ??= "REGULAR";

        return repository.add("customers", customer);
    }

    async update(customer) {

        customer.updatedAt = new Date().toISOString();

        return repository.put("customers", customer);
    }

    async get(customerId) {

        return repository.get("customers", customerId);

    }

    async getAll() {

        return repository.getAll("customers");

    }

    async delete(customerId) {

        return repository.delete("customers", customerId);

    }

    async count() {

        return repository.count("customers");

    }

    async findByPhone(phone) {

        const result = await repository.findByIndex(
            "customers",
            "phone",
            phone
        );

        return result.length ? result[0] : null;

    }

    async findByName(name) {

        const result = await repository.findByIndex(
            "customers",
            "name",
            name
        );

        return result;

    }

    async updatePoints(customerId, earnedPoints) {

        const customer = await this.get(customerId);

        if (!customer) {
            throw new Error("Customer not found");
        }

        customer.points += earnedPoints;
        customer.updatedAt = new Date().toISOString();

        return this.update(customer);

    }

    async addBonus(customerId, bonusPoints) {

        const customer = await this.get(customerId);

        if (!customer) {
            throw new Error("Customer not found");
        }

        customer.bonusPoints += bonusPoints;
        customer.updatedAt = new Date().toISOString();

        return this.update(customer);

    }

    async updateCredit(customerId, amount) {

        const customer = await this.get(customerId);

        if (!customer) {
            throw new Error("Customer not found");
        }

        customer.creditBalance += amount;
        customer.updatedAt = new Date().toISOString();

        return this.update(customer);

    }

    async approve(customerId) {

        const customer = await this.get(customerId);

        if (!customer) {
            throw new Error("Customer not found");
        }

        customer.status = "APPROVED";
        customer.updatedAt = new Date().toISOString();

        return this.update(customer);

    }

    async deactivate(customerId) {

        const customer = await this.get(customerId);

        if (!customer) {
            throw new Error("Customer not found");
        }

        customer.status = "INACTIVE";
        customer.updatedAt = new Date().toISOString();

        return this.update(customer);

    }

}

const customerRepo = new CustomerRepository();

export default customerRepo;