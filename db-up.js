const { dbUp } = require("./db");

dbUp().catch(e => {
    console.error(e);
    process.exit(1);
});
