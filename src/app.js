const apiToken = require("./auth/api-token-middleware");
const express = require("express");
const { ensureValid, Product } = require("./validation");
const { requestLogger } = require("./logging");

function urlConcat(url, val) {
    url = url || "";
    const concat = [ 
        ...url.split("/").filter(p => p.length),
        val
    ];

    return "/" + concat.join("/");
}

class Handlers {
    constructor(db, logger) {
        this._db = db;
        this._logger = logger;
    }

    reportError(response, statusCode, e) {
        if (this._logger && e)
            this._logger.warn(`${e.name || "Error"}: ${e.message}`);

        response.status(statusCode);

        if (e)
            response.json({ message: e.message});

        response.end(); 
    }

    configureApp(app) {
        app.use(express.json());
        if (this._logger)
            app.use(requestLogger(this._logger));
        app.use(apiToken(this._db, this._logger));

        app.get("/api/products", this.getProducts());
        app.get("/api/products/:id", this.getProduct());
        app.post( "/api/products", ensureValid(Product), this.addProduct());
        app.put( "/api/products/:id", ensureValid(Product), this.updateProduct());
        app.delete("/api/products/:id", this.deleteProduct());
        app.use("/", (_, res) => res.status(404).end());

        return app;
    }

    getProduct() {
        const self = this;
        return function(req, res) {
            self._db.getProduct(req.params.id)
                .then(product => res.status(200).json(product))
                .catch(e => self.reportError(res, 404, e))
        }
    }

    getProducts() {
        const self = this;
        return function(req, res) {
            let productFilter;
            try {
                productFilter = self._db.filters.filterFromUrlQuery(req.query);
            }
            catch (e) {
                return self.reportError(res, 400, e);
            }

            self._db.getProducts(productFilter)
                .then(products => res.status(200).json({ results: products }))
                .catch(err => self.reportError(res, 400, err));
        }
    }

    addProduct() {
        const self = this;
        return function(req, res) {
            self._db.addProduct(req.body)
                .then(result => res.status(201)
                    .set({ Location: urlConcat(req.path, result.id) })
                    .json(result.added))
                .catch(e => self.reportError(res, 404, e));
        }
    }

    updateProduct() {
        const self = this;
        return function(req, res) {
            self._db.updateProduct(req.params.id, req.body)
                .then(() => res.status(200).end())
                .catch(e => self.reportError(res, 400, e));
        }
    }

    deleteProduct() {
        const self = this;
        return function(req, res) {
            self._db.deleteProduct(req.params.id)
                .then(() => res.status(200).end())
                .catch(e => self.reportError(res, 400, e));
        }
    }
}

module.exports = function(db, logger) {
    return new Handlers(db, logger).configureApp(express());
}

