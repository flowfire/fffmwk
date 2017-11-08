module.exports = (server) => {
    let getResult = require("./result");
    return async(req, res) => {
        let allowRequestBody = ["CONNECT", "PATCH", "POST", "PUT"];
        let allowResponsebody = ["CONNECT", "GET", "POST"];
        let allowCached = ["GET"];

        let method = req.method.toUpperCase();
        let query = req.url.split("?").length === 2 ? req.url.split("?")[1] : "";

        let body = await new Promise((res, rej) => {
            if (allowRequestBody.indexOf(method) > -1) {
                let body = "";
                req.on("data", data => { body += data });
                req.on("end", () => {
                    res(body);
                });
            } else {
                res("");
            }
        });
        let path = req.url.split("?")[0];
        let result = await getResult({
            path: path,
            query: query,
            body: body,
            request: req,
            server: server,
        });
        res.statusCode = result.statusCode;
        if (result.statusMessage) result.statusMessage = res.statusMessage;
        for (let key in result.headers) {
            res.setHeader(key, result.headers[key]);
        }
        if (allowResponsebody.indexOf(method) > -1) res.write(result.body);
        res.end();
    };
}