const env = require("../../environment");

const DB_HOST = env("DB_HOST") || "127.0.0.1";
const DB_PORT = env("DB_PORT") || 27017;
const DB_NAME = env("DB_NAME") || "rest-api";

function createConnectionString() {
    const user = env("DB_USERNAME");
    const pass = env("DB_PASSWORD");

    let credentials = "";
    if (user && pass)
        credentials = `${user}:${pass}@`;

    return `mongodb://${credentials}${DB_HOST}:${DB_PORT}`;
}

const connectOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};

module.exports = {
    createConnectionString: createConnectionString,
    connectOptions: connectOptions,
    DB_NAME: DB_NAME
};
