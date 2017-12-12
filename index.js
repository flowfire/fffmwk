let daemon = require("daemon");
let fs = require("fs");
let config = JSON.parse(fs.readFileSync("./server.json"));
let argv = require("yargs").argv;
let commander = require("commander");

const UID = 'FFFMWK';
let watch = argv.watch;

console
/*


*/

forever.list(false, (err, data) => {
    data = data || [];

    if (!argv.multi || argv._.indexOf("start") === -1)
        data.forEach(daemon => {
            if (daemon.uid === UID) {
                forever.stop(UID);
                console.log("Server stoped.");
            }
        });

    if (argv._.indexOf("stop") !== -1) {
        if (!data.length) console.log("Server is not runing!");
        return;
    };

    forever.startDaemon("./lib/server.js", {
        uid: UID,
    });

    if (watch) {
        let watcher = require("chokidar");

        watcher.watch([
            config.rootPath + config.apiPath,
            config.rootPath + config.staticPath,
        ]).on("change", () => {
            forever.stop(UID);
            forever.startDaemon("./lib/server.js", {
                uid: UID,
            });
        });
    }

    console.log("Server started" + (watch ? " in developement mode" : "") + ".");

});