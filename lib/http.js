module.exports = (config) => {
    let getResponse = require("./getResponse");
    return async(request, res) => {
        let allowRequestBody = ["CONNECT", "PATCH", "POST", "PUT"];
        let allowResponsebody = ["CONNECT", "GET", "POST"];
        let allowCached = ["GET"];

        let method = request.method.toUpperCase();
        let query = request.url.split("?").length === 2 ? request.url.split("?")[1] : "";

        let body = await new Promise((res, rej) => {
            if (allowRequestBody.indexOf(method) > -1) {
                let body = "";
                request.on("data", data => { body += data });
                request.on("end", () => {
                    res(body);
                });
            } else {
                res("");
            }
        });
        let path = request.url.split("?")[0];
        let result = await getResponse({
            request: request,
            body: body,
            config: config,
        });
        if (result.statusCode) res.statusCode = result.statusCode;
        if (result.statusMessage) res.statusMessage = result.statusMessage;
        if (result.headers) {
            for (let key in result.headers) {
                res.setHeader(key, result.headers[key]);
            }
        }
        if (allowResponsebody.indexOf(method) > -1 && result.body) res.write(result.body);
        res.end();
    };
}