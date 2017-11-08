let serve = require("./lib/entry");
let fs = require("fs");

let config = fs.readFileSync("./server.json");

config = JSON.parse(config);

new serve(config);