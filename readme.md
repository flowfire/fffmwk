# A simple node server for single page application #  
version: v3.0.0

How to use   
install the package in global  
`npm install fffmwk -g`  

cd to server path and init a config file  
`fff --init-config`  
and a file named "server.json" would be created

edit the server.json file (detail below)

start the server:  
`fff`  
or  
`fff -d start`  

stop:  
`fff -d stop`  
  
restart  
`fff -d restart`  


  
server.json is config file.  
```  
{
    "port": 443,
    "http2": true,
    "https": true,
    "rootPath": "/var/server/",
    "staticPath": "static",
    "apiPath": "api",
    "errPagePath": "error",
    "socketFile": "socket/socket",
    "httpsKeyFile": "certificate/key.pem",
    "httpsCertFile": "certificate/cert.pem",
    "nomatchFile": "static/index.html",
    "apiHeaders": {
        "Content-Type": "application/json; utf-8",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*"
    },
    "apiStringify": "json",
    "staticCache": 10,
    "logFile": "log/server.log.txt",
    "errFile": "log/server.err.txt"
} 
```  
  
port: the http server port  
http2: enable http2  
https: enable https  
rootPath: root Path, the file root path, *NOTE: use absolute path.  
staticPath: the static file path.  
apiPath: the api mode path.  
errPagePath: the http error file path. Name with statusCode + ".html". eg. 404.html  
httpsKeyFile: required if "https" is "true", the path of private key with pem encodin.  
httpsCertFile: required if "https" is "true", the path of public key with pem encodin.  
socketFile: the websocket module path.  
nomatchFile: if the static file is not found, show this file. In the single page application, this is usually set to the 'index.html.  
apiHeaders: default Api headers. The api module will set these headers as default. It's useful while you want to access CROS in developer mode but not in product mode.  
apiStringify: api return body default format. Can be set to "json", "toString" or "none".  
staticCache: cache of static file. Set to 0 means no cache ( read file any time you use it. ). Set to number with out 0 ( read file while last read timestamp is older than it. Unit: second. ). String "Infinity" ( Cache forever until restart the server ).  
logFile: stdout file.  
errFile: stderr file.  
  
  
eg:  
For angular, type ` ng build --aot ` will built files like these.   
```  
index.html  
favicon.ico  
xxxx.js  
yyyy.js  
```  
  
Move them to a folder . eg: `/usr/www/static`  
Write node mode like `user.js` and move it to `/usr/www/api`  
Generate or buy certs ( or some other ways . eg. let's encrypt), move them to `/usr/www/cert`  
Modified `server.json` as follow.  
```  
{
    "port": 443,
    "http2": true,
    "https": true,
    "rootPath": "/usr/www",
    "staticPath": "static",
    "apiPath": "api",
    "errPagePath": "error",
    "socketFile": "socket/socket",
    "httpsKeyFile": "certificate/key.pem",
    "httpsCertFile": "certificate/cert.pem",
    "nomatchFile": "static/index.html",
    "apiHeaders": {
        "Content-Type": "application/json; utf-8",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*"
    },
    "apiStringify": "json",
    "staticCache": 10,
    "logFile": "log/server.log.txt",
    "errFile": "log/server.err.txt"
} 
```  

run  
`fff`

Access : `https://localhost`  
Access api: `https://localhost/api/user`  
   
  
The server will find file in staticPath while the url is not start with 'api':  
```  
https://localhost/index.html  =>  static/index.html  
https://localhost/aaaa.js  =>  static/aaaa.js  
https://localhost/aaaa/index.html  =>  static/aaaa/index.html  
```  
  
If file do not exists:  
    If nomatch is set, the response is the file in nomatch path, and statusCode is 200  
    If nomatch is empty, the response is the 404.html file in errPagePath, and statusCode is 404  

  
For the url start with 'api', the server will find node module recursive.  
If there is no such file or folder, the server will match the file/folder which start with "_", and pass them to the api module as a parameter.  
Tip: The module should be a standard node module, and there shouldn't be a extsion name in the url.  
eg:   
`  https://localhost/api/v1/test/testa  =>  api/v1/test/testa.js  `  
  
if  
    folder 'v1' do not exists, but there is a folder named '_version'  
    file 'testa' do not exists, but there is a file named '_id.js'  
`  https://localhost/api/v1/test/testa  =>  api/_version/test/_id.js  `  
  
Follow params will pass to the module.  
```  
param: {  
    version: "v1",  
    id: "testa"  
}  
```  
  
The api module shoul export function as follow  
```  
module.exports = ({  
    param, // the parameter above  
    body, // request body, when post or patch or something else.  
    resquest, // node server resquest  
}) => {  
    let result = {};
    result.body = { a: "b" }  
  
    /**  
      * result.statusCode : http statisCode  
      * result.statusMessage : http statusMessage  
      * result.headers: {},  // object, response headers, default :  { "Content-Type" : "text/json; charset=utf-8"}  
      * result.body: "", // response body, if type of response body is not "string", it will be auto encrypt. 
                         // while apiStringify is:
                         // "json" => JSON.stringify(result.body);
                         // "toString" => result.body.toString();
                         // "none" => result.body;
      **/  
  
    return result; // you should return a object like this.  
}  
```  
P.S. The api module now support async function. Such as  
  
```  
module.exports = async ({ param, body, resquest }) => {  
    result.body = { a: "b" }  
    return result;  
}  
```  


Socket module should export a module with 1 parameter required.  
The parameter is websocketserver;  

example module 
```
module.exports = server => {
    server.on("connect", client => {
        client.send("Hey!");
    });
}

```
full Api: https://www.npmjs.com/package/websocket

NOTE: http2 does not support websocket.