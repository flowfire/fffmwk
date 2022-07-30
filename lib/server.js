let Server = require("./entry");
let server = new Server;
process.on('unhandledRejection', (reason, p) => {
    console.error('--------------------');
    console.error(new Date());
    console.error("Reason: ", reason);
});