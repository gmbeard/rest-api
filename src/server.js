const app = require("./app");
const { EventEmitter } = require("events");
const createDb = require("./db")

class Server extends EventEmitter {
    constructor(dbType, options) {
        super();
        this._options = options || { };
        this._dbType = dbType;
    }

    async run(port, address) {
        const db = await createDb(
            this._dbType, 
            this._options.logger
        );

        return new Promise((resolve, reject) => {
            const listener = app(db, this._options.logger)
                .listen(port, address, resolve)
                .on("error", reject)
                .on("close", () => db.close());

            db.once("unrecoverableError", err => {
                this.emit("error", err);
                listener.close();
            });
        });
    }
}

module.exports = Server;
