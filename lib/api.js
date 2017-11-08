let fs = require("fs");
module.exports = async(path) => {
    let apiPath = path.split("/");
    apiPath.shift();
    apiPath.shift();

    let varibles = {};

    let fullPath = "api";
    while (apiPath.length) {
        let minPath = apiPath.shift();
        let fileName = minPath;
        if (apiPath.length === 0 && !minPath.endsWith(".js")) fileName += ".js";
        if (fs.existsSync(fullPath + "/" + minPath)) {
            fullPath += "/" + fileName;
        } else {
            let folders = fs.readdirSync(fullPath);
            let realName = "";
            for (let folder of folders) {
                if (!folder.startsWith("_")) continue;
                let key = folder.substr(1);
                let value = minPath;
                realName = folder;
                varibles[key] = value;
                break;
            }
            fullPath += "/" + realName;
        }
    }

    let mod = require("./../" + fullPath);
    return {
        varibles: varibles,
        mod: mod,
    };

}