let fs = require("fs");
let files = {};
module.exports = async({ path, config }) => {
    let staticCache = Infinity;
    if (typeof config.staticCache === "number") staticCache = config.staticCache * 1000;
    if (!staticCache) {
        return fs.readFileSync(path);
    }
    if (!files[path] || new Date().getTime() - files[path].timeStamp > staticCache) {
        let newValue = fs.readFileSync(path);
        files[path] = {
            timeStamp: new Date(),
            value: newValue,
        }
        return newValue;
    }

    return files[path].value;
}