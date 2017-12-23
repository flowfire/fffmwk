let fs = require("fs");
const EXTNAME = ["js", "json", "node"];
module.exports = async ({ url, config }) => {
    url = url.split("?")[0];
    let apiPath = url.split("/");
    apiPath.shift();
    apiPath.shift();

    let param = {};

    let nowPath = config.apiPath;
    while (apiPath.length) {
        nowPath += nowPath.endsWith("/") ? "" : "/";
        let paramValue = apiPath.shift();
        let tryName = paramValue;
        if (!apiPath.length) tryName = tryName + ".js";
        if (fs.existsSync(nowPath + tryName)) {
            nowPath += tryName;
            continue;
        }
        let allFiles = fs.readdirSync(nowPath);
        let paramKey;
        for (let filename of allFiles) {
            if (!filename.startsWith("_")) continue;
            nowPath += filename;
            if (apiPath.length) {
                // folder
                paramKey = filename.substr(1);
                break;
            } else {
                // file
                // only support .js module
                paramKey = filename.substring(1, filename.length - 3);
                break;
            }
        }
        if (!paramKey) throw Error("miss api at" + nowPath);
        param[paramKey] = paramValue;
    }

    let mod = require(nowPath);
    return {
        param: param,
        mod: mod,
    };

}