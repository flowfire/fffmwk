let fs = require("fs");
module.exports = async ({ request, body, config }) => {
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
            if (value instanceof Array) return true;
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
                        continue;
                    }

                    if (isObject(newValue[key]) && isObject(oldValue[key])) {
                        fillObject(oldValue[key], newValue[key]);
                        continue;
                    }
                }

                oldValue[key] = newValue[key];
                continue;
            }
        };

        return fillObject;
    })();


    if (urlArr.length !== 0 && urlArr[0] === "api") {
        // api
        response.headers = config.apiHeaders;

        let getApi = require("./getApi");
        let apiMod = await getApi({
            url: request.url,
            config: config,
        });

        let temp_return = apiMod.mod({
            param: apiMod.param,
            request: request,
            body: body,
            config: config,
        });

        let real_return;
        if (temp_return instanceof Promise) real_return = await temp_return;
        else real_return = temp_return;

        fillObject(response, real_return);

        if (typeof response.body !== "string") {
            let formatRule = config.apiStringify.toLowerCase();
            switch (formatRule) {
                case "json":
                default:
                    response.body = JSON.stringify(response.body);
                    break;
                case "tostring":
                    response.body = response.body.toString();
                    break;
                case "none":
                    break;
            }
        }

    } else {
        // statics
        response.headers = { "Content-Type": "text/html; charset=utf-8" };

        let url = request.url;
        let getFile = require("./getFile");

        try {
            let path = config.staticPath + url.substr(1);
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
            if (config.nomatchFile) {
                path = config.nomatchFile;
            } else {
                response.statusCode = 404;
                path = config.errPagePath + "/404.html";
            }

            response.body = await getFile({
                path: path,
                config: config,
            });
        }
    }
    return response;
}