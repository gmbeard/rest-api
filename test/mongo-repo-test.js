const assert = require("assert");
const createDb = require("../src/db");

describe("Mongo backend", () => {

    let db;
    before(async () => {
        db = await createDb("mongo");
    });

    after(async () => {
        await db.close();
    });

    it("should throw NotFound error on update for non-valid ObjectID",
        async() => {
            try {
                await db.updateProduct("321", {
                    Name: "",
                    Price: 0,
                    Category: "",
                    Sizes: []
                });
                assert.fail("Should've thrown");
            }
            catch (e) {
                assert.equal(e.name, "NotFoundError");
            }
        }
    );

    it("should throw NotFound error on update for valid but non-existent id",
        async () => {
            try {
                await db.updateProduct("6eb05ad748611713049e8540", {
                    Name: "",
                    Price: 0,
                    Category: "",
                    Sizes: []
                });
                assert.fail("Should've thrown");
            }
            catch (e) {
                assert.equal(e.name, "NotFoundError");
            }
        }
    );

    it("should throw NotFound error on delete for non-valid ObjectID",
        async() => {
            try {
                await db.updateProduct("321");
                assert.fail("Should've thrown");
            }
            catch (e) {
                assert.equal(e.name, "NotFoundError");
            }
        }
    );

    it("should throw NotFound error on delete for valid but non-existent id",
        async () => {
            try {
                await db.deleteProduct("6eb05ad748611713049e8540");
                assert.fail("Should've thrown");
            }
            catch (e) {
                assert.equal(e.name, "NotFoundError");
            }
        }
    );
});
