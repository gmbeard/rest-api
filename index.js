const env = require("./src/environment");
const { createLogger } = require("./src/logging");
const Server = require("./src/server");

const PORT = env("PORT") || 8080;
const ADDRESS = env("ADDRESS") || "127.0.0.1";
const DB_TYPE = env("DB_TYPE");

const logger = createLogger();
const server = new Server(DB_TYPE, { logger: logger })

server.on("error", err => {
    const msg = `Unrecoverable server error: ${err}`;
    logger.error(msg);
    process.exit(1);
});

server.run(PORT, ADDRESS)
    .then(() => logger.info(`Server listening on ${ADDRESS}:${PORT}. Ctrl+C to exit`))
    .catch(e => logger.error(`Error starting server: ${e}`));
