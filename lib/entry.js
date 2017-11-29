const fs = require("fs");
const socket = require("socket.io");

module.exports = class SELF {
    constructor() {
        const configFile = fs.readFileSync("server.json");
        const config = JSON.parse(configFile);

        let server;
        let serverCreater;


        if (config.http2) server = require("http2");
        else if (config.https) server = require("https");
        else server = require("https");

        if (config.http2 && config.https) serverCreater = "createSecureServer";
        else serverCreater = "createServer";

        let httpsOption;
        if (config.https) httpsOption = {
            key: fs.readFileSync(config.rootPath + config.https_key),
            cert: fs.readFileSync(config.rootPath + config.https_cert),
        }

        let httpProcessor = require("./http");
        let serverListener = server[serverCreater](httpsOption);

        let socketServer = socket(serverListener);
        try {
            let socketModule = require(config.rootPath + config.socket);
            socketModule(socketServer);
        } catch (e) {};

        serverListener.listen(config.port);
        serverListener.on("request", httpProcessor(config));
        return serverListener;
    }
}