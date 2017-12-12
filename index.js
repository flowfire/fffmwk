#!/usr/bin/env node


let cmd = require("commander");
cmd
    .version("0.0.1")
    .option("-s, --server <action>", "start, stop or restart the server", /^(start|stop|restart)$/, "start")
    .option("-c, --config [path]", "config file path", path => {
        if (path.startsWith("/")) return path;
        return process.cwd() + "/" + path;
    }, process.cwd() + "/server.json")
    .option("--dev", "develope mode, automatically restart the server while file changes.")
    .parse(process.argv);



let fs = require("fs");
let daemon = require("daemon");
let config = JSON.parse(fs.readFileSync(cmd.config));
config.rootPath += config.rootPath.endsWith("/") ? "" : "/";
for (let key in config) {
    switch (key) {
        case "staticPath":
        case "apiPath":
        case "errPagePath":
            config[key] += config[key].endsWith("/") ? "" : "/";
        case "socketFile":
        case "httpsKeyFile":
        case "httpsCertFile":
        case "nomatchFile":
        case "logFile":
        case "errFile":
            if (!config[key].startsWith("/")) config[key] = config.rootPath + config[key];
            break;
    }
}

process.env.configPath = cmd.config;

let pidFile = __dirname + "/daemonpid.txt";
if (cmd.server === "stop" || cmd.server === "restart") {
    try {
        let pid = fs.readFileSync(pidFile);
        process.kill(pid);
    } catch (e) {
        console.log("daemon stopped");
    }
}

if (cmd.server === "start" || cmd.server === "restart") {
    let pid = daemon.daemon("./lib/server.js", [], {
        stdout: fs.openSync(config.logFile, "a+"),
        stderr: fs.openSync(config.errFile, "a+"),
        env: process.env,
        cwd: __dirname,
    });
    fs.writeFileSync(pidFile, pid);
    console.log("daemon started");
}

/*



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
*/