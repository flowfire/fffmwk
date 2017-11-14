let fs = require("fs");
module.exports = async({
    path,
    query,
    body,
    request,
    server,
}) => {
    let urls = path.substr(1).split("/");
    let MIME = require("./mime");


    let rt = {
        statusCode: 200,
        statusMessage: "",
        headers: {},
        body: "",
    };


    // 
    if (urls.length !== 0 && urls[0] === "api") {
        rt.headers["Content-Type"] = "text/json; charset=utf-8";

        // api

        let api = require("./api");
        let apiMod = await api(path);

        let real_return;
        let temp_return = apiMod.mod({
            result: rt,
            variables: apiMod.variables,
            path,
            query,
            body,
            request,
            server,
        });

        if (temp_return instanceof Promise) real_return = await temp_return;
        else real_return = temp_return;

        return real_return;
    }

    // statics

    rt.headers["Content-Type"] = "text/html; charset=utf-8";
    try {
        rt.body = fs.readFileSync("./static" + path);
        for (let ext in MIME) {
            if (path.endsWith(ext)) {
                rt.headers["Content-Type"] = MIME[ext] + "; charset=utf-8";
                break;
            }
        }
    } catch (e) {
        if (server.nomatch) {
            rt.body = fs.readFileSync("./" + server.nomatch, "utf-8");
        } else {
            rt.statusCode = 404;
            rt.body = fs.readFileSync("./error/404.html", "utf-8");
        }
    }
    return rt;
}