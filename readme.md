# A simple node server for single page application #  
version: v2.0.0  
  
How to use  
clone the repo  
start the server with  
` node index `  
  
You can use nohup or other tools to run it background.  
eg.  
` nohup node index & `  
  
server.json is config file.  
```  
{  
    "port": 443,  
    "http2": true,  
    "https": true,  
    "rootPath": "C:/files/testserverdir/",  
    "staticPath": "static",  
    "apiPath": "api",  
    "logPath": "log",  
    "errPagePath": "error",  
    "https_key": "certificate/key.pem",  
    "https_cert": "certificate/cert.pem",  
    "nomatch": "static/index.html",  
    "staticCache": 10  
}  
```  
  
port: the http server port  
http2: enable http2  
https: enable https  
rootPath: root Path, the file root path, (suggest) use absolute path.  
staticPath: the static file path, relative to rootPath. No slash need in the end.  
apiPath: the api mode path, relative to rootPath. No slash need in the end.  
logPath: the log path, relative to rootPath. No slash need in the end. There is no log for now.  
errPagePath: the http error file path, relative to rootPath. No slash need in the end. Name with statusCode + ".html". eg. 404.html  
https_key: required if "https" is "true", the path of private key with pem encoding. Relative to rootPath.  
https_cert: required if "https" is "true", the path of public key with pem encoding. Relative to rootPath.  
nomatch: if the static file is not found, show this file. In the single page application, this is usually set to the 'index.html'. Relative to rootPath.  
staticCache: cache of static file. Set to 0 means no cache ( read file any time you use it. ). Set to number with out 0 ( read file while last read timestamp is older than it. Unit: second. ). String "Infinity" ( Cache forever until restart the server ).  
  
  
eg:  
For angular, type ` ng build --aot ` will built files like these.   
```  
index.html  
favicon.ico  
xxxx.js  
yyyy.js  
```  
  
Move them to a folder . eg: ` /usr/www/static `  
Write node mode like ` user.js ` and move it to ` /usr/www/api `  
Generate or buy certs ( or some other ways . eg. let's encrypt), move them to ` /usr/www/cert `  
Modified ` server.json ` as follow.  
```  
{  
    "port": 443,  
    "http2": true,  
    "https": true,  
    "rootPath": "/usr/www/",  
    "staticPath": "static",  
    "apiPath": "api",  
    "logPath": "log",  
    "errPagePath": "error",  
    "https_key": "cert/key.pem",  
    "https_cert": "cert/cert.pem",  
    "nomatch": "static/index.html",  
    "staticCache": 10  
}  
```  
Run  ` node index ` in develope or ` nohup node index & ` in product.  
  
Access : ` https://localhost `  
Access api: ` https://localhost/api/user `  
   
  
The server will find file in staticPath while the url is not start with 'api':  
```  
https://localhost/index.html  =>  static/index.html  
https://localhost/aaaa.js  =>  static/aaaa.js  
https://localhost/aaaa/index.html  =>  static/aaaa/index.html  
```  
  
If file do not exists:  
    If nomatch is set, the response is the file in nomatch path, and statusCode is 200  
    If nomatch is empty, the response is the 404.html file in errPagePath, and statusCode is 404  
  
  
对于以 api 开头的路径，视为 api，会从 api 文件夹下递归查找相应的模块进行解析，  
如果查找不到对应的 文件/文件夹 则会自动匹配以下划线 "_" 开头的 文件/文件夹， 并将其当作变量传入最终定位到的 api 模块中  
注：模块应该是标准的 node 模块，并且路径中不带后缀名  
  
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
    result.body = { a: "b" }  
  
    /**  
      * result.statusCode : http statisCode  
      * result.statusMessage : http statusMessage  
      * result.headers: {},  // object, response headers, default :  { "Content-Type" : "text/json; charset=utf-8"}  
      * result.body: "", // response body, if type of response body is not "string", it will be auto encrypt with JSON.stringify.  
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
  
  
# 一个简单的单页面应用的 nodejs server  #  
版本： v2.0.0  
  
使用方法  
clone 该 repo  
使用 node index 启动服务器  
  
如果需要后台运行，可以使用诸如 nohup 之类的工具  
例：  
nohup node index &  
  
server.json 文件为配置文件  
```  
{  
    "port": 443,  
    "http2": true,  
    "https": true,  
    "rootPath": "C:/files/testserverdir/",  
    "staticPath": "static",  
    "apiPath": "api",  
    "logPath": "log",  
    "errPagePath": "error",  
    "https_key": "certificate/key.pem",  
    "https_cert": "certificate/cert.pem",  
    "nomatch": "static/index.html",  
    "staticCache": 10  
}  
```  
  
port： 端口，默认为 443  
http2： 是否使用 http2 ，默认为 true  
https： 是否使用 https ，默认为 true  
rootPath： 根目录，服务器文件所在的根目录，（推荐使用）绝对路径  
staticPath： 静态文件所在目录，相对于 rootPath 目录的路径，结尾不需要斜杠  
apiPath： api 模块所在目录，相对于 rootPath 目录的路径，结尾不需要斜斜杠  
logPath： 日志所在目录，目前无日志输出  
errPagePath： 错误页面所在目录，相对于 rootPath 目录的路径，以 statusCode + ".html" 命名，如  404.html  
https_key： 如果使用 https ，该项为私钥路径，pem 格式，相对于 rootPath 目录的路径  
https_cert： 如果使用 https ，该项为公钥路径，pem 格式，相对于 rootPath 目录的路径  
nomatch: 如果静态文件未匹配到，则展示该页面，在单页面应用中应该设置为生成文件的 index.html ，相对于 rootPath 目录的路径  
staticCache：静态文件缓存，可接受的值为： 非 0 数字（缓存秒数），数字 0 (不缓存)， 字符串 "Infinity" (永久缓存，不推荐此项)  
  
  
  
以 Angular 为例，大概有以下文件  
```  
index.html  
favicon.ico  
xxxx.js  
yyyy.js  
```  
  
  
将其移动到 /usr/www/static 文件夹中  
server.json 中设置 rootPath 为 "/usr/www"  
设置 staticPath 为 "static"  
  
运行 node index  
  
访问 https://localhost  
  
  
对于 以非 api 开头的路径，会从 staticPath 中查找对应的文件  
  
例如  
```  
https://localhost/index.html  =>  static/index.html  
https://localhost/aaaa.js  =>  static/aaaa.js  
https://localhost/aaaa/index.html  =>  static/aaaa/index.html  
```  
  
如果文件不存在  
    如果 server.json 中设置了 nomatch，则会返回 nomatch 设置的值，并且 statusCode 为 200  
    如果 server.json 中 nomatch 值为空，则会返回 errPagePath 文件夹下的 404.html，并且 statusCode 为 404  
  
  
对于以 api 开头的路径，视为 api，会从 api 文件夹下递归查找相应的模块进行解析，  
如果查找不到对应的 文件/文件夹 则会自动匹配以下划线 "_" 开头的 文件/文件夹， 并将其当作变量传入最终定位到的 api 模块中  
注：模块应该是标准的 node 模块，并且路径中不带后缀名  
  
例：  
`  https://localhost/api/v1/test/testa  =>  api/v1/test/testa.js  `  
  
如果  
    v1 文件夹不存在，而存在以下划线开头的文件夹如 _version  
    testa 文件不存在，而存在以下划线开头的文件如 _id.js  
`  https://localhost/api/v1/test/testa  =>  api/_version/test/_id.js  `  
  
并且在调用 _id.js 时，会传入如下对象  
```  
param: {  
    version: "v1",  
    id: "testa"  
}  
```  
  
api 模块应该导出一个形如以下格式的方法  
```  
module.exports = ({  
    param, // 上文提到的参数  
    body, // 请求正文  
    resquest, // node server 的 resquest  
}) => {  
    result.body = {asd}  
  
    /**  
      * result.statusCode http 状态码  
      * result.statusMessage http 状态信息  
      * result.headers: {}, // 对象， http header， 默认值为  { "Content-Type" : "text/json; charset=utf-8"}  
      * result.body: "", // 返回主体， 如果返回值为非字符串，则会被 JSON.stringify 序列化后返回  
      **/  
  
    return result;  
}  
```  
P.S. api 模块的导出方法支持 async 方法，如下  
  
```  
module.exports = async ({  
    param, // 上文提到的参数  
    body, // 请求正文  
    resquest, // node server 的 resquest  
}) => {  
    result.body = {asd}  
  
    /**  
      * result.statusCode http 状态码  
      * result.statusMessage http 状态信息  
      * result.headers: {}, // 对象， http header， 默认值为  { "Content-Type" : "text/json; charset=utf-8"}  
      * result.body: "", // 返回主体， 如果返回值为非字符串，则会被 JSON.stringify 序列化后返回  
      **/  
  
    return result;  
}  
```