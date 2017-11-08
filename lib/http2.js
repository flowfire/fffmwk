module.exports = (server) => {
    return async() => {};
    /*
    let getResult = require("./result");
    return async(stream, oldHeaders) => {
        let url = oldHeaders.url;
        let headers = {};
        for (let key in oldHeaders) {
            if (key.substr(0, 1) === ":") continue;
            headers[key] = oldHeaders[key];
        }
        let result = await getResult({
            url: oldHeaders[":path"],
            method: oldHeaders[":method"],
            headers: headers,
            server: server,
        });

        result.headers[":status"] = result.statusCode;

        stream.respond(result.headers);
        stream.write(result.body);
        stream.end()
    }*/
}