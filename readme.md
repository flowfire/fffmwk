一个简单的单页面应用的 nodejs server  
  
使用方法  
clone 该 repo  
使用 node index 启动服务器  
  
如果需要后台运行，可以使用诸如 nohup 之类的工具  
例：  
nohup node index &  
  
server.json 文件为配置文件  
```
{  
    "port": 443, // 服务器端口  
    "http2": true, // 是否使用 http2  
    "https": true, // 是否使用 https  
    "https_key": "key.pem", // 如果使用 https，该项为私钥  
    "https_cert": "cert.pem", // 如果使用 https， 该项为证书  
    "nomatch": "static/index.html" // 所有不存在的路径都会被重定向到该文件（状态码200），如果不设置，则会被默认定向到 "error/404.html" 此时状态码为 404  
}  
``` 
  
将生成的单页面文件复制到 statics 文件夹中  
以 Angular 为例，大概有以下文件  
```
index.html  
favicon.ico  
xxxx.js  
yyyy.js   
```

将其移动到 static 文件夹中  
server.json 中设置 nomatch 为 "static/index.html"  
  
运行 node index  
  
访问 https://localhost  
  
  
对于 以非 api 开头的路径，会从 static 文件中查找对应的文件  
例如  
```
https://localhost/index.html  =>  static/index.html  
https://localhost/aaaa.js  =>  static/aaaa.js  
https://localhost/aaaa/index.html  =>  static/aaaa/index.html  
```

如果文件不存在  
    如果 server.json 中设置了 nomatch，则会返回 nomatch 设置的值，并且 statusCode 为 200  
    如果 server.json 中 nomatch 值为控，则会返回 error/404.html，并且 statusCode 为 404  
  
  
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
variables: {  
    version: "v1",  
    id: "testa"  
}  
```

api 模块应该导出一个形如以下格式的方法  
```
module.exports = ({  
    result, // 预定义的返回值  
    variables, // 上文提到的对象  
    path, // 路径，不包含 search , 即  /api/a?a=b 中的 /api/a  
    query, // search ，上述例子中的  ?a=b  
    body, // 请求主体  
    request, // node http server request  
    server, // 本框架的服务器实例，可以用来查看实例参数，也可以不管  
}) => {  
    result.body = JSON.stringify({  
        varibles: varibles  
    });  
  
    /*  
  
    处理完数据之后，修改 result 并返回  
    以下为 result 默认值  
  
    result.statusCode: 200, // 状态码  
    result.statusMessage: "", // 状态信息，为空则表示根据状态码自动选择  
    result.headers: {}, // 对象，response headers 默认值为  { "Content-Type" : "text/json; charset=utf-8"}  
    result.body: "", // 返回主体  
    */  
  
    return result;  
}  
```