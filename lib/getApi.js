let fs = require("fs");
module.exports = async({ url, config }) => {
    url = url.split("?")[0];
    let apiPath = url.split("/");
    apiPath.shift();
    apiPath.shift();

    let param = {};

    let fullPath = config.rootPath + config.apiPath;

    while (apiPath.length) {
        let nowFolderOrFile = apiPath.shift();

        if (fs.existsSync(fullPath + "/" + nowFolderOrFile)) {
            // This folder or file really exists, continue recursion
            fullPath += "/" + fileName;
            continue;
        }

        let allFiles = fs.readdirSync(fullPath);
        let paramExist = false;
        for (let fileName of allFiles) {
            if (!fileName.startsWith("_")) continue;
            let stat = fs.statSync(fullPath + "/" + fileName);
            if (stat.isDirectory()) {
                // This is a folder
                paramExist = true;
                let key = fileName.substr(1);
                let value = nowFolderOrFile;
                param[key] = value;
                fullPath += "/" + fileName;
                break;
            }
            if (stat.isFile()) {
                // This is a file
                paramExist = true;
                let key = fileName.substr(1);
                let keyArr = key.split(".");
                if (["js", "json", "node"].indexOf(keyArr[keyArr.length - 1]) !== -1) {
                    keyArr.pop();
                    key = keyArr.join(".");
                }
                let value = nowFolderOrFile;
                param[key] = value;
                fullPath += "/" + fileName;
                break;
            }
        }
        if (paramExist) continue;

        throw new Error("no such api path!");
    }

    let mod = require(fullPath);
    return {
        param: param,
        mod: mod,
    };

}