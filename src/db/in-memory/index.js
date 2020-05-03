const { EventEmitter } = require("events");
const filters = require("./in-memory-repository-filter");

const products = [
    { _id: "1", Name: "A", Price: 10, Category: "General", Sizes: ["small", "medium", "large" ] }
];

class InMemoryRepository extends EventEmitter {
    constructor() {
        super();
        this._db = JSON.parse(JSON.stringify(products));
    }

    isTokenValid(token) {
        if (!token || typeof token !== "string")
            return Promise.resolve(false);

        return Promise.resolve(token === "SECRET_KEY");
    }

    close() {
        return Promise.resolve();
    }

    clear() {
        this._db = [];
    }

    getProduct(id) {
        if (id == "99")
            this.emit("unrecoverableError", new Error("Test unrecoverable"));
        const product = this._db.find(p => p._id === id);
        if (!product)
            return Promise.reject(new Error(`Product doesn't exist: ${id}`));

        return Promise.resolve(product);
    }

    getProducts(filter) {
        if (filter && typeof filter !== "function")
            Promise.reject(new Error("'filter' must be a function"));

        filter = filter || (() => true);
        return new Promise((resolve, reject) => {
            try {
                const results = this._db.filter(filter);
                resolve(results);
            }
            catch (e) {
                reject(e);
            }
        });
    }

    addProduct(item) {
        item._id = `${this._db.length + 1}`;
        this._db.push(item)
        return Promise.resolve({ id: item._id, added: item });
    }

    async updateProduct(id, item) {
        const index = this._db.findIndex(p => p._id === id);
        if (index < 0)
            return Promise.reject(new Error(`Couldn't find product: ${id}`));

        item._id = id;
        this._db[index] = item;
        return Promise.resolve();
    }

    deleteProduct(id) {
        const index = this._db.findIndex(p => p._id === id);
        if (index < 0)
            return Promise.reject(new Error(`Product not found: ${id}`));

        this._db.splice(index, 1);
        return Promise.resolve();
    }
}

InMemoryRepository.prototype.filters = filters;

module.exports = function() {
    return Promise.resolve(new InMemoryRepository());
}
