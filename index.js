#!/usr/bin/env node

(async() => {
    let cmd = require("commander");
    let fs = require("fs");
    cmd
        .version("0.0.1")
        .option("-d, --daemon <action>", "start, stop or restart the server", /^(start|stop|restart)$/, "start")
        .option("-c, --config [path]", "config file path", path => {
            if (path.startsWith("/")) return path;
            return process.cwd() + "/" + path;
        }, process.cwd() + "/server.json")
        .option("--init-config", "generate a server.json file in current path")
        .option("--dev", "develope mode, automatically restart the server while file changes.")
        .parse(process.argv);

    if (cmd.initConfig) {
        await new Promise((res, rej) => {
            fs.createReadStream(__dirname + "/server.json.example").pipe(fs.createWriteStream(process.cwd() + "/server.json")).on("finish", res);
        });

        console.log("finished");
        process.exit(0);
    }

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

    let pidFilePath = __dirname + "/daemonpid.txt";
    if (cmd.daemon === "stop" || cmd.daemon === "restart") {
        try {
            let pids = fs.readFileSync(pidFilePath, "utf-8");
            pids.trim().split("\n").forEach(pid => { try { process.kill(pid); } catch (e) {} });
            fs.writeFileSync(pidFilePath, "");
        } catch (e) {
            console.log(e);
        }
        console.log("daemon stopped");
    }

    if (cmd.daemon === "start" || cmd.daemon === "restart") {
        let daemonProcess = daemon.daemon("./lib/server.js", [], {
            stdout: fs.openSync(config.logFile, "a+"),
            stderr: fs.openSync(config.errFile, "a+"),
            env: process.env,
            cwd: __dirname,
        });
        let pid = daemonProcess.pid;
        let fd = fs.openSync(pidFilePath, "a");
        fs.writeSync(fd, Buffer.from(pid.toString() + "\n"));
        console.log("daemon started");
    }
})();