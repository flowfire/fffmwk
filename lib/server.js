let Server = require("./entry");
let server = new Server;
process.on('unhandledRejection', (reason, p) => {
    console.error('--------------------');
    console.error('\n');
    console.error(new Date());
    console.error('\n');
    console.error("Reason: ", reason);
    console.error('\n');
});