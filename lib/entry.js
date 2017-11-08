module.exports = class SELF {
    constructor({
        port = 443,
        http2 = true,
        https = true,
        https_key = "key.pem",
        https_cert = "cert.pem",
        nomatch = "",

    } = {}) {
        let fs = require("fs");

        this.nomatch = nomatch;
        let server;
        let serverCreater;
        if (http2) server = require("http2");
        else if (https) server = require("https");
        else server = require("https");

        if (http2 && https) serverCreater = "createSecureServer";
        else serverCreater = "createServer";

        let httpsOption;
        if (https) httpsOption = {
            key: fs.readFileSync("certs/" + https_key),
            cert: fs.readFileSync("certs/" + https_cert),
        }

        let httpProcessor = require("./http");
        let serverListener = server[serverCreater](httpsOption);

        serverListener.listen(port);

        serverListener.on("request", httpProcessor(this));


    }
}