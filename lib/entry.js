const fs = require("fs");
const webSocket = require("websocket");

module.exports = class SELF {
    constructor() {
        const configFile = fs.readFileSync("server.json");
        const config = JSON.parse(configFile);

        let httpsOption;
        if (config.https || config.http2) httpsOption = {
            key: fs.readFileSync(config.rootPath + config.https_key),
            cert: fs.readFileSync(config.rootPath + config.https_cert),
        }


        let httpProcessor = require("./http");
        let serverListener;

        if (config.http2) {
            let http2 = require("http2");
            serverListener = http2.createSecureServer(httpsOption);
        } else if (config.https) {
            let https = require("https");
            serverListener = https.createServer(httpsOption, () => {});
        } else {
            let http = require("http")
            serverListener = http.createServer(() => {});
        }
        serverListener.on("request", httpProcessor(config));

        serverListener.listen(config.port);

        let WebSocketServer = webSocket.server;
        let webSocketServer = new WebSocketServer({
            httpServer: serverListener,
            autoAcceptConnections: true,
        });
        try {
            let socketModule = require(config.rootPath + config.socket);
            socketModule(webSocketServer);
        } catch (e) {
            console.log(e);
        };
        return serverListener;
    }
}