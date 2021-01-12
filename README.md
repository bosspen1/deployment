# deployment


## 项目介绍
- 集成github webhook 可做消息通知 自动构建 auto build
------------


## 软件架构
- js

------------


## 所需环境
- nodejs

------------


## 使用说明

编辑 config.js 配置

const port = 8100; // 端口
const token = 'gitlab_token'; // 配置webhook时填的secret

const prodBranch = 'master'; // 需要触发的分支
const ddToken = 'webhook url'; // 群机器人的webhook

projectMap.set('stock', '/usr/local/sbin/jenkins-stock-service.sh'); // 项目和对应触发的脚本 
 如对应stock项目, webhook配置应该为 http://服务器地址:8100/stock


```shell
npm install
npm start
```

------------
