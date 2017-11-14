let fs = require("fs");
module.exports = async({ request, body, config }) => {
    let url = request.url;
    let urlArr = url.substr(1).split("/");
    let MIME = require("./mime");

    let response = {
        statusCode: 200,
        statusMessage: "",
        headers: {},
        body: "",
    };

    let fillObject = (() => {
        let isObject = (value) => {
            if (typeof value === "object" && value !== null) return true;
            else return false;
        }
        let isArray = (value) => {
            if (value instanceof array) return true;
            else return false;
        }
        let fillArray = (oldValue, newValue) => {
            for (let value of newValue) {
                if (oldValue.indexOf(value) === -1) oldValue.push(value);
            }
        }
        let fillObject = (oldValue, newValue) => {
            for (let key in newValue) {
                if (oldValue[key]) {
                    if (isArray(newValue[key]) && isArray(oldValue[key])) {
                        fillArray(oldValue[key], newValue[key]);
                        return;
                    }

                    if (isObject(newValue[key]) && isObject(oldValue[key])) {
                        fillObject(oldValue[key], newValue[key]);
                        return;
                    }
                }

                oldValue[key] = newValue[key];
                return;
            }
        };

        return fillObject;
    })();


    if (urlArr.length !== 0 && urlArr[0] === "api") {
        // api
        response.headers = {
            "Content-Type": "text/json; charset=utf-8",
        }

        let getApi = require("./getApi");
        let apiPath = await getApi({
            url: request.url,
            config: config,
        });

        let temp_return = apiMod.mod({
            request: request,
            body: body,
            config: config,
        });

        let real_return;
        if (temp_return instanceof Promise) real_return = await temp_return;
        else real_return = temp_return;

        if (typeof real_return.body !== "string") {
            real_return.body = JSON.stringify(real_return.body);
        }

        fillObject(response, real_return);
    } else {
        // statics
        response.headers = { "Content-Type": "text/html; charset=utf-8" };

        let url = request.url;
        let getFile = require("./getFile");

        try {
            let path = config.rootPath + config.staticPath + url;
            response.body = await getFile({
                path: path,
                config: config,
            });
            for (let ext in MIME) {
                if (url.endsWith(ext)) {
                    response.headers["Content-Type"] = MIME[ext] + "; charset=utf-8";
                    break;
                }
            }

        } catch (e) {
            let path;
            if (config.nomatch) {
                path = config.rootPath + config.nomatch;
            } else {
                response.statusCode = 404;
                path = config.rootPath + config.errPagePath + "/404.html";
            }

            response.body = await getFile({
                path: path,
                config: config,
            });
        }
    }
    return response;
}