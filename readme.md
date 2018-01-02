# Puppetry
网页End2End测试GUI工具

#### 示例:  
![demo](http://okyb0e40i.bkt.clouddn.com/puppetry-ops.gif)

### 特性
- 无需编写代码模拟浏览器行为
- 模拟脚本实时预览
- 支持基于image diff的css回归测试
- 自动检测page error、page performance

### 使用方法
安装Mongodb

在common/config.js中配置mongodb数据库（默认已配置好）

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
npm run build
```

* chrome实时预览需要确保（https://chrome-devtools-frontend.appspot.com/）域名可以正常打开，可能需要翻墙访问

## License
MIT License