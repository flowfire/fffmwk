const fs = require("fs");

module.exports = class SELF {
    constructor() {
        let config = JSON.parse(fs.readFileSync(process.env.configPath));
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

        let httpsOption;
        if (config.https || config.http2) httpsOption = {
            key: fs.readFileSync(config.httpsKeyFile),
            cert: fs.readFileSync(config.httpsCertFile),
        }


        let httpProcessor = require("./http");
        let serverListener;

        if (config.http2) {
            let http2 = require("http2");
            serverListener = http2.createSecureServer(httpsOption);
        } else if (config.https) {
            let https = require("https");
            serverListener = https.createServer(httpsOption, () => { });
        } else {
            let http = require("http")
            serverListener = http.createServer(() => { });
        }
        serverListener.on("request", httpProcessor(config));

        serverListener.listen(config.port);

        if (!config.http2) {
            const webSocket = require("websocket");
            let WebSocketServer = webSocket.server;
            let webSocketServer = new WebSocketServer({
                httpServer: serverListener,
                autoAcceptConnections: true,
            });
            try {
                let socketModule = require(config.socketFile);
                socketModule(webSocketServer);
            } catch (e) { };
        }


        return serverListener;
    }
}