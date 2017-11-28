let fs = require("fs");
let config = JSON.parse(fs.readFileSync("./server.json"));
let argv = require("yargs").argv;
let forever = require("forever");

let watch = argv.dev;

switch (true) {
    case argv.stop:
        forever.stop("fffmwk");
        break;

    case argv.restart:
    case argv.start:
    default:
        try {
            forever.stop("fffmwk");
        } catch (e) {}
        forever.startDaemon("./lib/server.js", {
            uid: "fffmwk",
            watch: true,
            sourceDir: config.rootPath,
        });
        break;
}