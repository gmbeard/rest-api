const assert = require("assert");
const { validate, Product } = require("../src/validation");

describe("Input validation", () => {

    it("shouldn't accept with missing fields", () => {
        assert.throws(() => validate(Product, {}));
    });

    it("shouldn't accept fields of wrong type", () => {
        assert.throws(() => 
            validate(Product, {
                Name: "String",
                Price: 10.0,
                Category: 10,
                Sizes: ["String", "String", "String"]
            }));
    });

    it("should accept valid input", () => {
        validate(Product, {
            Name: "String",
            Price: 10.0,
            Category: "String",
            Sizes: ["String", "String", "String"]
        });
    });
});
