# A simple node server for single page application #  

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
    "httpRedirect": false,
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
    "staticHeaders": {},
    "headers": {},
    "apiStringify": "json",
    "staticCache": 10,
    "timeout": 0,
    "logFile": "log/server.log.txt",
    "errFile": "log/server.err.txt"
} 
```  
  
__port:__ the http server port  
__http2:__ enable http2  
__https:__ enable https  
__httpRedirect:__ when https enabled, this option controls to create an additional http server using 80 port and redirect it to https site.   
__rootPath:__ root Path, the file root path, absolute path or relative to `pwd`.  
__staticPath:__ the static file path, absolute path or relative to root path.   
__apiPath:__ the api mode path, absolute path or relative to root path.  
__errPagePath:__ the http error file path. Name with statusCode + ".html". eg. 404.html  
__httpsKeyFile:__ required if "https" is "true", the path of private key with pem encodin.  
__httpsCertFile:__ required if "https" is "true", the path of public key with pem encodin.  
__socketFile:__ the websocket module path.  
__nomatchFile:__ if the static file is not found, show this file. In the single page application, this is usually set to the 'index.html.  
__apiHeaders:__ default Api headers. The api module will set these headers as default. It's useful while you want to access CROS in developer mode but not in product mode.   
__staticHeaders:__  default static file headers. Such as Cache-Control and so on.  
__headers:__ all request will be added, such as HSTS headers.  
__apiStringify:__ api return body default format. Can be set to "json", "toString" or "none".  
__staticCache:__ cache of static file. Set to 0 means no cache ( read file any time you use it. ). Set to number with out 0 ( read file while last read timestamp is older than it. Unit: second. ). String "Infinity" ( Cache forever until restart the server ).  
__timeout:__ while this is not 0, and api module runs longer then this, ther server will return server time out error (status Code 500), unit: second.  
__logFile:__ stdout file.  
__errFile:__ stderr file.  
  
  
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
    "httpRedirect": false,
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