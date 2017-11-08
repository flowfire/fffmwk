一个简单的单页面应用的 nodejs server

使用方法
clone 该 repo
使用 node index 启动服务器

如果需要后台运行，可以使用诸如 nohup 之类的工具
例：
nohup node index &

server.json 文件为配置文件
{
    "port": 443, // 服务器端口
    "http2": true, // 是否使用 http2
    "https": true, // 是否使用 https
    "https_key": "key.pem", // 如果使用 https，该项为私钥
    "https_cert": "cert.pem", // 如果使用 https， 该项为证书
    "nomatch": "static/index.html" // 所有不存在的路径都会被重定向到该文件（状态码200），如果不设置，则会被默认定向到 "error/404.html" 此时状态码为 404
}

将生成的单页面文件复制到 statics 文件夹中
以 Angular 为例，大概有以下文件
index.html, favicon.ico, abcd.js, efgh.js

