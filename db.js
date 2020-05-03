const { MongoClient } = require("mongodb");
const { 
    createConnectionString, 
    connectOptions, 
    DB_NAME } = require("./src/db/mongo/config");

const PRODUCTS = "products";
const TOKENS = "tokens";

const testData = [
    { Name: "iPhone 42", Category: "Tech", Price: 10000, Sizes: ["1TB", "50TB", "1PB" ] },
    { Name: "Air Max 90", Category: "Footware", Price: 99.99, Sizes: ["6", "7", "8", "12"] },
];

const tokens = [
    { User: "Test User", Token: "SECRET_KEY" }
];

async function createCollection(client, col, data) {
    const collections = await client.db(DB_NAME).collections();
  
    if (collections.some(n => n.collectionName === col)) {
        console.log(`dbUp(): Collection "${col}" already exists. Skipping.`);
        return Promise.resolve();
    }

    await client.db(DB_NAME).createCollection(col);

    await client.db(DB_NAME).collection(col).insertMany(data);
}

async function dropCollection(client, col) {

    const collections = await client.db(DB_NAME).collections();
  
    if (!collections.some(n => n.collectionName === col)) {
        console.log(`dbDown(): Collection "${col}" doesn't exist. Skipping.`);
        return Promise.resolve();
    }

    await client.db(DB_NAME).collection(col).drop();
}

async function dbUp() {

    const client = new MongoClient(createConnectionString(), connectOptions);

    await client.connect();
    let err;
    try {
        await createCollection(client, PRODUCTS, testData);
        await createCollection(client, TOKENS, tokens);
    }
    catch (e) {
        err = e;
    }
    client.close();
    if (err)
        throw err;
}

async function dbDown() {

    const client = new MongoClient(createConnectionString(), connectOptions);

    await client.connect();
    let err;
    try {
        await dropCollection(client, TOKENS);
        await dropCollection(client, PRODUCTS);
    }
    catch (e) {
        err = e;
    }
    client.close();
    if (err)
        throw err;
}

module.exports = {
    dbUp: dbUp,
    dbDown: dbDown
};
