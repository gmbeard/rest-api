const app = require("../src/app");
const assert = require("assert");
const createDb = require("../src/db");
const env = require("../src/environment");
const request = require("supertest");

async function clearDb(db) {
    let items = await db.getProducts();
    await Promise.all(items.map(async (i) => await db.deleteProduct(i._id)));
    items = await db.getProducts();
    assert.equal(items, 0);
}

async function addTestData(db) {
    const input = [
        { Name: "iPhone 42", Category: "Tech", Price: 10000, Sizes: ["1TB", "50TB", "1PB" ] },
        { Name: "Air Max 90", Category: "Footware", Price: 99.99, Sizes: ["6", "7", "8", "12"] },
    ];

    input.forEach(async p => {
        const { id } = await db.addProduct(p);
        assert.equal(typeof id, "string");
        p._id = id;
    });

    return input;
}

describe("Rest interface", () => {

    let db, testData;
    before(async () => {
        db = await createDb(env("DB_TYPE"));
    });

    beforeEach(async () => {
        await clearDb(db);
        testData = await addTestData(db);
    });

    after(done => {
        if (db) db.close();
        done();
    });

    function createApp() {
        return app(db);
    }

    it("correctly reponds to /api/products", () => {
        return request(createApp())
            .get("/api/products")
            .set("Accept", "application/json")
            .expect(200)
            .then(response => {
                assert(response.body.results.length > 0);
            });
    });

    it("correctly reponds to /api/products/:id", () => {
        return request(createApp())
            .get(`/api/products/${testData[0]._id}`)
            .set("Accept", "application/json")
            .expect(200)
            .then(response => {
                assert(response.body._id === testData[0]._id);
            });
    });

    it("correctly reponds to product insert", async () => {
        const newProduct = {
            Name: "Shiny New Thing",
            Price: 1000000,
            Category: "Things you don't need",
            Sizes: ["one"]
        };

        let newLocation;
        await request(createApp())
            .post("/api/products")
            .set("X-Token", "SECRET_KEY")
            .send(newProduct)
            .expect(201)
            .then(response => {
                //assert.equal(response.get("Location"), "/api/products/2");
                newLocation = response.get("Location");
            });

        return request(createApp())
            .get(newLocation)
            .set("Accept", "application/json")
            .expect(200)
            .then(response => {
                newProduct._id = response.body._id;
                assert.deepEqual(response.body, newProduct);
            });
    });

    it("correctly responds to update", async () => {

        let updatedProduct = {
            Name: "Shiny Old New Thing",
            Price: 1,
            Category: "Things you absolutely do need",
            Sizes: ["any"]
        };

        await request(createApp())
            .put(`/api/products/${testData[0]._id}`)
            .set("X-Token", "SECRET_KEY")
            .send(updatedProduct)
            .expect(200);

        return request(createApp())
            .get(`/api/products/${testData[0]._id}`)
            .set("Accept", "application/json")
            .expect(200)
            .then(response => {
                updatedProduct._id = testData[0]._id;
                assert.deepEqual(response.body, updatedProduct);
            });
    });

    it("correctly responds to delete", async () => {
        await request(createApp())
            .delete(`/api/products/${testData[0]._id}`)
            .set("Accept", "application/json")
            .set("X-Token", "SECRET_KEY")
            .expect(200);

        return request(createApp())
            .get(`/api/products/${testData[0]._id}`)
            .set("Accept", "application/json")
            .expect(404);
    });

    it("responds with bad request for modifications to non-existent product", 
        async () => {
            const nonExistentID = "NON_EXISTENT_ID";
            const product = {
                Name: "",
                Price: 0,
                Category: "",
                Sizes: []
            };

            return Promise.all([ 
                request(createApp())
                    .delete(`/api/products/${nonExistentID}`)
                    .set("Accept", "application/json")
                    .set("X-Token", "SECRET_KEY")
                    .expect(400),

                request(createApp())
                    .put(`/api/products/${nonExistentID}`)
                    .set("Content-Type", "application/json")
                    .set("X-Token", "SECRET_KEY")
                    .send(product)
                    .expect(400),
            ]);
        });

    it("doesn't allow ill-formed product input for modifications", async () => {
        return Promise.all([
            request(createApp())
                .post("/api/products")
                .set("Accept", "application/json")
                .set("X-Token", "SECRET_KEY")
                .send({})
                .expect(400),

            request(createApp())
                .put("/api/products/1")
                .set("Content-Type", "application/json")
                .set("X-Token", "SECRET_KEY")
                .send({})
                .expect(400),
        ]);
    });

    it("responds with unauthorized without token", () => {
        return Promise.all([
            request(createApp())
                .post("/api/products")
                .set("Content-Type", "application/json")
                .expect(401),

            request(createApp())
                .put("/api/products/1")
                .set("Content-Type", "application/json")
                .expect(401),

            request(createApp())
                .delete("/api/products/1")
                .set("Content-Type", "application/json")
                .expect(401),
        ]);
    });

    it("responds with unauthorized for incorrect token", () => {
        const incorrectToken = "deadbeef";
        return Promise.all([
            request(createApp())
                .post("/api/products")
                .set("Content-Type", "application/json")
                .set("X-Token", incorrectToken)
                .expect(401),

            request(createApp())
                .put("/api/products/1")
                .set("Content-Type", "application/json")
                .set("X-Token", incorrectToken)
                .expect(401),

            request(createApp())
                .delete("/api/products/1")
                .set("Content-Type", "application/json")
                .set("X-Token", incorrectToken)
                .expect(401),
        ]);
    });

    it("correctly filters product results by price range", async () => {
        const exampleProducts = [
            { Name: "1", Price: 1, Category: "", Sizes: [] },
            { Name: "2", Price: 2, Category: "", Sizes: [] },
            { Name: "3", Price: 3, Category: "", Sizes: [] },
            { Name: "4", Price: 4, Category: "", Sizes: [] },
            { Name: "5", Price: 5, Category: "", Sizes: [] },
        ];

        await clearDb(db);
        assert.equal((await db.getProducts()).length, 0);
        await Promise.all(
            exampleProducts.map(async p => await db.addProduct(p)));
        assert.equal((await db.getProducts()).length, 5);

        return Promise.all([
            request(createApp())
                .get("/api/products?priceFrom=1&priceTo=3")
                .set("Accept", "application/json")
                .expect(200)
                .then(response => {
                    assert.deepEqual(
                        response.body.results.map(p => p.Name).sort(),
                        ["1", "2", "3"]);
                }),

            request(createApp())
                .get("/api/products?priceFrom=4&priceTo=5")
                .set("Accept", "application/json")
                .expect(200)
                .then(response => {
                    assert.deepEqual(
                        response.body.results.map(p => p.Name).sort(),
                        ["4", "5"]);
                }),

            request(createApp())
                .get("/api/products?priceFrom=1&priceTo=5")
                .set("Accept", "application/json")
                .expect(200)
                .then(response => {
                    assert.deepEqual(
                        response.body.results.map(p => p.Name).sort(),
                        ["1", "2", "3", "4", "5"]);
                }),

            request(createApp())
                .get("/api/products?priceFrom=3&priceTo=1")
                .set("Accept", "application/json")
                .expect(200)
                .then(response => {
                    assert.equal(response.body.results.length, 0);
                }),
        ]);
    });

    it("should return product list in correct format", () => {
        return request(createApp())
            .get("/api/products")
            .set("Accept", "application/json")
            .expect(200)
            .then(response => {
                assert(response.body.results);
                assert(typeof response.body.results.unshift === "function");
            });
    });

    it("should correctly report errors", () => {
        return request(createApp())
            .post("/api/products")
            .set("Content-Type", "application/json")
            .set("X-Token", "SECRET_KEY")
            .send({})
            .expect(400)
            .then(response => {
                assert(typeof response.body.message === "string");
            });
    });

    it("should return the added product in the response", () => {
        const productToAdd = {
            Name: "Test",
            Price: 42,
            Category: "Test Category",
            Sizes: ["3", "6", "9" ]
        };

        return request(createApp())
            .post("/api/products")
            .set("Content-Type", "application/json")
            .set("X-Token", "SECRET_KEY")
            .send(productToAdd)
            .expect(201)
            .then(response => {
                assert(typeof response.body === "object")
                const { Name, Price, Category, Sizes } = response.body;
                assert.deepEqual({
                        Name: Name,
                        Price: Price,
                        Category: Category,
                        Sizes: Sizes
                    }, productToAdd);
            });
    });
});
