小能-基于electron生成客户端的操作步骤
===========================
### 1、本地运行web程序  

```bash
# Clone this repository
git clone git@git.xiaoneng.cn:ntclient/nt-electron.git
# Go into the repository
cd nt-electron
# Install dependencies
npm install
# Run the app
npm start
```
**Note**: 运行环境请参考：http://git.xiaoneng.cn/ntclient/nt-electron

### 2、打包
  *    将nt-client项目生成的静态资源(./src/app)COPY到nt-electron项目下APP文件夹(./src/app)里
  *    nt-electron项目下`index.html`引用了`bundle.js`
  *    开始打包：npm run package:win 
