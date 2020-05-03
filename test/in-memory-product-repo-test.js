const assert = require("assert");
const createDb = require("../src/db");

describe("In-memory repository tests", () => {
    let repo;
    beforeEach(async () => {
        repo = await createDb("local");
    });

    afterEach(() => repo.close());

    it("should fetch all products", async () => {
        assert(0 < (await repo.getProducts()).length);
    });

    it("should fetch product by id", async () => {
        assert(await repo.getProduct("1"));
    });

    it("should delete product", async () => {
        const length = (await repo.getProducts()).length;
        await repo.deleteProduct("1");
        assert((length - 1) === (await repo.getProducts()).length);
    });

    it("should add product", async () => {
        const { id } = await repo.addProduct({
            Name: "Old name",
            Price: 20,
            Category: "Homewares",
            Sizes: ["extra large", "large"]
        });

        const product = await repo.getProduct(id);
        assert(product);
    });

    it("should update product", async () => {
        const { id } = await repo.addProduct({
            Name: "Old name",
            Price: 20,
            Category: "Homewares",
            Sizes: ["extra large", "large"]
        });
        const newName = "Test Delete";
        const product = await repo.getProduct(id);
        product.Name = newName;
        await repo.updateProduct(id, product);
        assert(newName === (await repo.getProduct(id)).Name);
    });

    it("should filter products", async () => {
        let results = await repo.getProducts(
            repo.filters.equals("Category", "General")
        );

        assert(0 < results.length);

        const filter = 
            repo.filters.between("price", 10, 20);

        assert(filter);
        results = await repo.getProducts(filter);

        assert.equal(results.length, 1);
    });

    it("should throw when deleting non-existent product", done => {
        repo.deleteProduct("999")
            .then(() => done(new Error("Didn't throw!")))
            .catch(() => done());
    });
});
