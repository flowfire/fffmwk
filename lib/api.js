let fs = require("fs");
module.exports = async (path) => {
    let apiPath = path.split("/");
    apiPath.shift();
    apiPath.shift();

    let variables = {};

    let fullPath = "api";
    while (apiPath.length) {
        let thisPath = apiPath.shift();

        let testExists = fullPath + "/" + thisPath;
        if (apiPath.length === 0) {
            testExists += ".js";
        }

        if (fs.existsSync(testExists)) {
            fullPath += "/" + fileName;
        } else {
            let allFile = fs.readdirSync(fullPath);
            let realName = "";

            for (let oneFile of allFile) {
                if (!oneFile.startsWith("_")) continue;

                let key = oneFile.substr(1);
                realName = oneFile;

                if (apiPath.length === 0) {
                    key = key.substr(0, key.length - 3);
                    realName = realName.substring(0, realName.length - 3);
                }

                let value = thisPath;
                variables[key] = value;
                break;
            }

            fullPath += "/" + realName;
        }
    }

    let mod = require("./../" + fullPath);
    return {
        variables: variables,
        mod: mod,
    };

}