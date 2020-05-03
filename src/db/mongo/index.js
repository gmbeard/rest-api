const { EventEmitter } = require("events");
const filters = require("./mongo-repository-filter");
const { MongoClient, ObjectID } = require("mongodb");
const { 
    createConnectionString, 
    connectOptions, 
    DB_NAME } = require("./config");

const PRODUCTS = "products";
const TOKENS = "tokens";

const UnrecoverableErrors = [
    "MongoNetworkError",
    "MongoTimeoutError",
    "MongoServerSelectionError",
];

function isRecoverable(err) {
    if (err.name) {
        return !UnrecoverableErrors.some(e => e === err.name);
    }

    return true;
}

class MongoRepository extends EventEmitter {

    constructor(dbClient) {
        super();
        this._dbClient = dbClient;
    }

    async close() {
        await this._dbClient.close();
    }

    async _withCollection(col, cb) {
        const coll = this._dbClient.db(DB_NAME).collection(col)
        try {
            return await cb(coll);
        }
        catch (e) {
            if (!isRecoverable(e))
                this.emit("unrecoverableError", e);
            throw e;
        }
    }

    async _withTokens(cb) {
        return this._withCollection(TOKENS, cb);
    }

    async _withProducts(cb) {
        return this._withCollection(PRODUCTS, cb);
    }

    isTokenValid(token) {
        if (!token || typeof token !== "string" || !token.length)
            return Promise.resolve(false);

        return this._withTokens(tokens =>
            tokens.findOne({ Token: token }).then(result => !!result));
    }

    getProduct(id) {
        return this._withProducts(products =>
            products.findOne({ _id: ObjectID.createFromHexString(id) })
                .then(product => {
                    if (!product)
                        throw new Error(`Product not found: ${id}`);
                    return product;
                })
        );
    }

    getProducts(filter) {
        return this._withProducts(products => products.find(filter).toArray());
    }

    addProduct(item) {
        delete item._id;
        return this._withProducts(products => products.insertOne(item))
            .then(result => { 
                return { 
                    id: result.insertedId.toHexString(),
                    added: result.ops[0] 
                }; 
            });
    }

    updateProduct(id, item) {
        if (id && typeof id.toHexString === "function")
            id = id.toHexString();

        delete item._id;
        return this._withProducts(products => 
            products.findOneAndUpdate(
                { _id: ObjectID.createFromHexString(id) },
                { $set: item },
                { returnOriginal: false }
            ));
    }

    deleteProduct(id) {
        if (id && typeof id.toHexString === "function")
            id = id.toHexString();

        return this._withProducts(products =>
            products.deleteOne({ _id: ObjectID.createFromHexString(id) }));
    }
}

MongoRepository.prototype.filters = filters;

module.exports = async function() {
    const client = new MongoClient(createConnectionString(), connectOptions);

    await client.connect();

    return new MongoRepository(client);
}
