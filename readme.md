# Puppetry
针对不熟悉前端页面自动化测试的人开发的GUI工具，可以快速完成页面的行为模拟，基于puppeteer框架，完全兼容puppeteer页面操作功能，并且集成了自动化测试常用的功能，比如页面截图diff、page error、page performance检测等功能。

#### 示例:  
![demo](http://okyb0e40i.bkt.clouddn.com/puppetry-ops.gif)

### 特性
- 无需编写代码模拟浏览器行为
- 模拟脚本实时预览
- 支持基于image diff的css回归测试
- 自动检测page error、page performance

### 使用方法
安装Mongodb

在common/config.js中配置mongodb数据库（默认已配置为localhost/puppetry）

安装node_module 
``` 
npm install
```
运行
``` 
npm run server
```
访问： http://localhost:3000/#/ 

### web开发
Puppetry web端使用[ElementUI](http://element.eleme.io/)，开发web端功能方法：
```
cd ./web
npm install
npm run dev
```
访问： http://localhost:3001/#/ 

### 注意事项
* 如果在Linux服务器安装，请保证服务器版本可以安装puppeteer, 如果是centos系统，保证系统版本为7.0以上, 参考：https://github.com/GoogleChrome/puppeteer/issues/497

* 服务器端部署需要更新web端访问的域名地址，更新方法：
```
cd ./web
//更新在web/env.js中pro环境变量
export ENV=pro;npm run build
```

* chrome实时预览需要确保 https://chrome-devtools-frontend.appspot.com 域名可以正常打开(可能需要翻墙访问)

### 技术栈：
- [Puppeteer](https://github.com/GoogleChrome/puppeteer)
- [ElementUI](http://element.eleme.io/)
- [Koa](http://koajs.com/)
- [MongoDB](https://www.mongodb.com/)

## License
MIT License