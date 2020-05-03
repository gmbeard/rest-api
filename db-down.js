const { dbDown } = require("./db");

dbDown().catch(e => {
    console.error(e);
    process.exit(1);
});
